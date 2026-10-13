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
    const candidate = await db.candidateProfile.findUnique({
      where: { id: user.candidateProfile.id },
      include: {
        skills: true,
        projects: true,
        applications: {
          select: {
            opportunityId: true,
            status: true,
          },
        },
        savedOpportunities: {
          select: {
            opportunityId: true,
          },
        },
      },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Fetch active published opportunities
    const opportunities = await db.opportunity.findMany({
      where: {
        status: 'PUBLISHED',
      },
      include: {
        org: true,
        skills: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const appliedOppMap = new Map<string, string>();
    for (const app of candidate.applications) {
      appliedOppMap.set(app.opportunityId, app.status);
    }

    const savedOppSet = new Set<string>();
    for (const s of candidate.savedOpportunities) {
      savedOppSet.add(s.opportunityId);
    }

    // Evaluate matching engine for each opportunity
    const matches = opportunities.map((opp) => {
      const matchResult = evaluateMatch(
        {
          id: candidate.id,
          fullName: candidate.fullName,
          primaryRole: candidate.primaryRole,
          status: candidate.status,
          city: candidate.city,
          country: candidate.country,
          availabilityHoursPerWeek: candidate.availabilityHoursPerWeek,
          workArrangement: candidate.workArrangement,
          yearsExperience: candidate.yearsExperience,
          skills: candidate.skills,
          projects: candidate.projects,
          expectedCompensation: candidate.expectedCompensation,
        },
        {
          id: opp.id,
          title: opp.title,
          category: opp.category,
          location: opp.location,
          workArrangement: opp.workArrangement,
          hoursPerWeekMin: opp.hoursPerWeekMin,
          skills: opp.skills,
          compensationType: opp.compensationType,
          compensationAmount: opp.compensationAmount,
        }
      );

      return {
        opportunity: {
          id: opp.id,
          title: opp.title,
          slug: opp.slug,
          category: opp.category,
          description: opp.description,
          responsibilities: opp.responsibilities,
          eligibilityCriteria: opp.eligibilityCriteria,
          workArrangement: opp.workArrangement,
          location: opp.location,
          hoursPerWeekMin: opp.hoursPerWeekMin,
          compensationType: opp.compensationType,
          compensationAmount: opp.compensationAmount,
          duration: opp.duration,
          createdAt: opp.createdAt,
          org: {
            id: opp.org.id,
            name: opp.org.name,
            slug: opp.org.slug,
            logoUrl: opp.org.logoUrl,
            verified: opp.org.verified,
            industry: opp.org.industry,
          },
        },
        match: matchResult,
        applicationStatus: appliedOppMap.get(opp.id) || null,
        isSaved: savedOppSet.has(opp.id),
      };
    });

    // Sort descending by match score
    matches.sort((a, b) => b.match.score - a.match.score);

    return NextResponse.json({
      matches,
      totalCount: matches.length,
    });
  } catch (error) {
    console.error('Candidate match calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to compute opportunity matches' },
      { status: 500 }
    );
  }
}
