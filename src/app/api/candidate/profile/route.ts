import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'CANDIDATE') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await db.candidateProfile.findUnique({
    where: { userId: user.id },
    include: {
      skills: true,
      projects: { orderBy: { createdAt: 'desc' } },
      education: { orderBy: { startYear: 'desc' } },
      workExperience: { orderBy: { startDate: 'desc' } },
    },
  });

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  // Calculate profile completion percentage
  let completedPoints = 0;
  const totalPoints = 9;

  if (profile.fullName) completedPoints++;
  if (profile.headline) completedPoints++;
  if (profile.bio) completedPoints++;
  if (profile.primaryRole) completedPoints++;
  if (profile.city) completedPoints++;
  if (profile.skills.length > 0) completedPoints++;
  if (profile.projects.length > 0) completedPoints++;
  if (profile.portfolioUrl || profile.githubUrl || profile.linkedinUrl) completedPoints++;
  if (profile.availabilityHoursPerWeek > 0) completedPoints++;

  const completionPercentage = Math.round((completedPoints / totalPoints) * 100);

  return NextResponse.json({
    profile,
    completionPercentage,
  });
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'CANDIDATE') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();

    const updated = await db.candidateProfile.update({
      where: { userId: user.id },
      data: {
        fullName: data.fullName,
        headline: data.headline,
        bio: data.bio,
        avatarUrl: data.avatarUrl,
        city: data.city,
        country: data.country,
        status: data.status,
        primaryRole: data.primaryRole,
        yearsExperience: data.yearsExperience !== undefined ? parseFloat(data.yearsExperience) : undefined,
        availabilityHoursPerWeek: data.availabilityHoursPerWeek ? parseInt(data.availabilityHoursPerWeek) : undefined,
        startDate: data.startDate,
        workArrangement: data.workArrangement,
        expectedCompensation: data.expectedCompensation,
        githubUrl: data.githubUrl,
        linkedinUrl: data.linkedinUrl,
        portfolioUrl: data.portfolioUrl,
        twitterUrl: data.twitterUrl,
        resumeUrl: data.resumeUrl,
        visibility: data.visibility,
        onboardingCompleted: data.onboardingCompleted ?? true,
      },
      include: {
        skills: true,
        projects: true,
      },
    });

    return NextResponse.json({ success: true, profile: updated });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
