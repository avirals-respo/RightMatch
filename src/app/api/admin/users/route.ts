import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const users = await db.user.findMany({
      include: {
        candidateProfile: {
          select: { fullName: true, status: true, city: true },
        },
        organizationMembers: {
          include: { org: { select: { name: true, verified: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Fetch admin users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { userId, status } = await req.json();

    if (!userId || !['ACTIVE', 'SUSPENDED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    if (userId === user.id) {
      return NextResponse.json({ error: 'Cannot modify own administrative status' }, { status: 400 });
    }

    const updated = await db.user.update({
      where: { id: userId },
      data: { status },
    });

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_STATUS_MODERATED',
        targetType: 'User',
        targetId: userId,
        details: JSON.stringify({ newStatus: status }),
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error('Update user status error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
