import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { evaluateMatch } from '@/lib/matching-engine';

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
      include: {
        skills: true,
        applications: {
          select: {
            candidateId: true,
            status: true,
          },
        },
      },
    });

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    // Fetch active candidates who permit discovery
    const candidates = await db.candidateProfile.findMany({
      where: {
        user: { status: 'ACTIVE' },
        visibility: { in: ['PUBLIC', 'COMPANIES_ONLY'] },
      },
      include: {
        skills: true,
        projects: { where: { featured: true } },
      },
    });

    const appStatusMap = new Map<string, string>();
    for (const app of opportunity.applications) {
      appStatusMap.set(app.candidateId, app.status);
    }

    // Evaluate matching engine for each candidate
    const matches = candidates.map((c) => {
      const matchResult = evaluateMatch(
        {
          id: c.id,
          fullName: c.fullName,
          primaryRole: c.primaryRole,
          status: c.status,
          city: c.city,
          country: c.country,
          availabilityHoursPerWeek: c.availabilityHoursPerWeek,
          workArrangement: c.workArrangement,
          yearsExperience: c.yearsExperience,
          skills: c.skills,
          projects: c.projects,
          expectedCompensation: c.expectedCompensation,
        },
        {
          id: opportunity.id,
          title: opportunity.title,
          category: opportunity.category,
          location: opportunity.location,
          workArrangement: opportunity.workArrangement,
          hoursPerWeekMin: opportunity.hoursPerWeekMin,
          skills: opportunity.skills,
          compensationType: opportunity.compensationType,
          compensationAmount: opportunity.compensationAmount,
        }
      );

      return {
        candidate: {
          id: c.id,
          fullName: c.fullName,
          headline: c.headline,
          bio: c.bio,
          avatarUrl: c.avatarUrl,
          city: c.city,
          country: c.country,
          status: c.status,
          primaryRole: c.primaryRole,
          yearsExperience: c.yearsExperience,
          availabilityHoursPerWeek: c.availabilityHoursPerWeek,
          workArrangement: c.workArrangement,
          githubUrl: c.githubUrl,
          linkedinUrl: c.linkedinUrl,
          portfolioUrl: c.portfolioUrl,
          skills: c.skills,
          featuredProjects: c.projects,
        },
        match: matchResult,
        applicationStatus: appStatusMap.get(c.id) || null,
      };
    });

    // Rank candidates by score descending
    matches.sort((a, b) => b.match.score - a.match.score);

    return NextResponse.json({
      matches,
      totalCount: matches.length,
      opportunityTitle: opportunity.title,
    });
  } catch (error) {
    console.error('Candidate recommendation error:', error);
    return NextResponse.json(
      { error: 'Failed to compute candidate recommendations' },
      { status: 500 }
    );
  }
}
