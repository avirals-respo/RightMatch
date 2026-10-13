import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'COMPANY' || user.organizationMembers.length === 0) {
    return NextResponse.json({ error: 'Unauthorized or no organization' }, { status: 401 });
  }

  const orgId = user.organizationMembers[0].orgId;
  const org = await db.organization.findUnique({
    where: { id: orgId },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, email: true },
          },
        },
      },
      opportunities: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  return NextResponse.json({ organization: org });
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'COMPANY' || user.organizationMembers.length === 0) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orgId = user.organizationMembers[0].orgId;

  try {
    const data = await req.json();

    const updated = await db.organization.update({
      where: { id: orgId },
      data: {
        name: data.name,
        website: data.website,
        industry: data.industry,
        size: data.size,
        description: data.description,
        location: data.location,
        logoUrl: data.logoUrl,
      },
    });

    return NextResponse.json({ success: true, organization: updated });
  } catch (error) {
    console.error('Update organization error:', error);
    return NextResponse.json({ error: 'Failed to update organization' }, { status: 500 });
  }
}
