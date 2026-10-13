import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const candidate = await db.candidateProfile.findFirst({
      where: {
        id,
        user: { status: 'ACTIVE' },
      },
      include: {
        skills: true,
        projects: { orderBy: { featured: 'desc' } },
        education: true,
        workExperience: true,
      },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate profile not found' }, { status: 404 });
    }

    // Check privacy
    const user = await getCurrentUser();
    const isOwner = user?.id === candidate.userId;
    const isCompany = user?.role === 'COMPANY';
    const isAdmin = user?.role === 'ADMIN';

    if (candidate.visibility === 'PRIVATE' && !isOwner && !isAdmin) {
      return NextResponse.json({ error: 'This profile is private' }, { status: 403 });
    }

    if (candidate.visibility === 'COMPANIES_ONLY' && !isCompany && !isOwner && !isAdmin) {
      return NextResponse.json({ error: 'This profile is only visible to verified hiring teams' }, { status: 403 });
    }

    // Return profile
    return NextResponse.json({
      candidate: {
        id: candidate.id,
        fullName: candidate.visibility === 'ANONYMOUS' && !isOwner && !isCompany ? 'Anonymous Builder' : candidate.fullName,
        headline: candidate.headline,
        bio: candidate.bio,
        avatarUrl: candidate.visibility === 'ANONYMOUS' && !isOwner && !isCompany ? null : candidate.avatarUrl,
        city: candidate.city,
        country: candidate.country,
        status: candidate.status,
        primaryRole: candidate.primaryRole,
        yearsExperience: candidate.yearsExperience,
        availabilityHoursPerWeek: candidate.availabilityHoursPerWeek,
        workArrangement: candidate.workArrangement,
        startDate: candidate.startDate,
        expectedCompensation: isCompany || isOwner ? candidate.expectedCompensation : null,
        portfolioUrl: candidate.portfolioUrl,
        githubUrl: candidate.githubUrl,
        linkedinUrl: candidate.linkedinUrl,
        skills: candidate.skills,
        projects: candidate.projects,
        education: candidate.education,
        workExperience: candidate.workExperience,
      },
    });
  } catch (error) {
    console.error('Fetch public candidate profile error:', error);
    return NextResponse.json({ error: 'Failed to fetch candidate' }, { status: 500 });
  }
}
