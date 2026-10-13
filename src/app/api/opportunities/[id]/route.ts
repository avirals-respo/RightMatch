import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { evaluateMatch } from '@/lib/matching-engine';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const opportunity = await db.opportunity.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        status: 'PUBLISHED',
      },
      include: {
        org: true,
        skills: true,
      },
    });

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    // If viewer is logged in as Candidate, compute personalized match on the fly!
    let viewerMatch = null;
    let hasApplied = false;
    let applicationStatus = null;

    const user = await getCurrentUser();
    if (user && user.role === 'CANDIDATE' && user.candidateProfile) {
      const candidateFull = await db.candidateProfile.findUnique({
        where: { id: user.candidateProfile.id },
        include: { skills: true, projects: true },
      });

      if (candidateFull) {
        viewerMatch = evaluateMatch(candidateFull, opportunity);
      }

      const existingApp = await db.application.findUnique({
        where: {
          opportunityId_candidateId: {
            opportunityId: opportunity.id,
            candidateId: user.candidateProfile.id,
          },
        },
      });

      if (existingApp) {
        hasApplied = true;
        applicationStatus = existingApp.status;
      }
    }

    return NextResponse.json({
      opportunity,
      viewerMatch,
      hasApplied,
      applicationStatus,
    });
  } catch (error) {
    console.error('Fetch opportunity detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch opportunity' }, { status: 500 });
  }
}
