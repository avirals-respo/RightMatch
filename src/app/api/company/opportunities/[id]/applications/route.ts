import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== 'COMPANY' || user.organizationMembers.length === 0) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orgId = user.organizationMembers[0].orgId;

  try {
    const opportunity = await db.opportunity.findFirst({
      where: { id, orgId },
    });

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    const applications = await db.application.findMany({
      where: { opportunityId: id },
      include: {
        candidate: {
          include: {
            skills: true,
            projects: true,
          },
        },
        notes: {
          include: {
            author: { select: { email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: [{ matchScoreAtApplication: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({
      opportunity,
      applications,
    });
  } catch (error) {
    console.error('Fetch applications error:', error);
    return NextResponse.json({ error: 'Failed to fetch applicants' }, { status: 500 });
  }
}
