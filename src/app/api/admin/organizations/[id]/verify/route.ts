import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { verified } = await req.json();

    const updated = await db.organization.update({
      where: { id },
      data: { verified: Boolean(verified) },
    });

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'ORGANIZATION_VERIFICATION_MODERATED',
        targetType: 'Organization',
        targetId: id,
        details: JSON.stringify({ verified: Boolean(verified) }),
      },
    });

    return NextResponse.json({ success: true, organization: updated });
  } catch (error) {
    console.error('Verify organization error:', error);
    return NextResponse.json({ error: 'Failed to update verification' }, { status: 500 });
  }
}
