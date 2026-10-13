import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { evaluateMatch } from '@/lib/matching-engine';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'CANDIDATE' || !user.candidateProfile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const applications = await db.application.findMany({
      where: { candidateId: user.candidateProfile.id },
      include: {
        opportunity: {
          include: {
            org: true,
            skills: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Fetch applications error:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'CANDIDATE' || !user.candidateProfile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { opportunityId, pitch, portfolioHighlight } = await req.json();

    if (!opportunityId) {
      return NextResponse.json({ error: 'Opportunity ID is required' }, { status: 400 });
    }

    const opportunity = await db.opportunity.findUnique({
      where: { id: opportunityId },
      include: {
        org: {
          include: {
            members: true,
          },
        },
        skills: true,
      },
    });

    if (!opportunity || opportunity.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'This opportunity is not open for applications' },
        { status: 400 }
      );
    }

    // Check duplicate
    const existing = await db.application.findUnique({
      where: {
        opportunityId_candidateId: {
          opportunityId,
          candidateId: user.candidateProfile.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'You have already applied to this opportunity' },
        { status: 409 }
      );
    }

    // Load full profile to compute snapshot match score
    const candidateFull = await db.candidateProfile.findUnique({
      where: { id: user.candidateProfile.id },
      include: {
        skills: true,
        projects: true,
      },
    });

    const match = evaluateMatch(candidateFull!, opportunity);

    // Create application
    const application = await db.application.create({
      data: {
        opportunityId,
        candidateId: user.candidateProfile.id,
        status: 'SUBMITTED',
        pitch: pitch?.trim() || null,
        portfolioHighlight: portfolioHighlight?.trim() || candidateFull?.portfolioUrl || null,
        matchScoreAtApplication: match.score,
      },
    });

    // Notify organization members
    for (const member of opportunity.org.members) {
      await db.notification.create({
        data: {
          userId: member.userId,
          title: `New Applicant (${match.score}% Match)`,
          message: `${candidateFull!.fullName} submitted an application for "${opportunity.title}".`,
          type: 'APPLICATION_UPDATE',
          link: `/company/opportunities/${opportunity.id}/pipeline`,
        },
      });
    }

    // Notify candidate of successful submission
    await db.notification.create({
      data: {
        userId: user.id,
        title: 'Application Received! 🚀',
        message: `Your application for "${opportunity.title}" at ${opportunity.org.name} was successfully submitted.`,
        type: 'APPLICATION_UPDATE',
        link: '/candidate/applications',
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'APPLICATION_SUBMITTED',
        targetType: 'Application',
        targetId: application.id,
        details: JSON.stringify({ opportunityId, matchScore: match.score }),
      },
    });

    return NextResponse.json({
      success: true,
      application,
      matchScore: match.score,
    });
  } catch (error: any) {
    console.error('Submit application error:', error);
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}
