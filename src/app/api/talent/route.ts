import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roleFilter = searchParams.get('role');
    const arrangement = searchParams.get('arrangement');
    const query = searchParams.get('q') || '';

    const where: any = {
      visibility: 'PUBLIC',
      user: { status: 'ACTIVE' },
    };

    if (roleFilter && roleFilter !== 'ALL') {
      where.primaryRole = { contains: roleFilter };
    }

    if (arrangement && arrangement !== 'ALL') {
      where.workArrangement = arrangement;
    }

    if (query.trim()) {
      where.OR = [
        { fullName: { contains: query } },
        { headline: { contains: query } },
        { bio: { contains: query } },
        { city: { contains: query } },
      ];
    }

    const talent = await db.candidateProfile.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        headline: true,
        bio: true,
        avatarUrl: true,
        city: true,
        country: true,
        status: true,
        primaryRole: true,
        availabilityHoursPerWeek: true,
        workArrangement: true,
        portfolioUrl: true,
        githubUrl: true,
        linkedinUrl: true,
        skills: {
          select: {
            id: true,
            name: true,
            proficiency: true,
          },
        },
        projects: {
          where: { featured: true },
          select: {
            id: true,
            title: true,
            description: true,
            liveUrl: true,
            repoUrl: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ talent });
  } catch (error) {
    console.error('Fetch talent directory error:', error);
    return NextResponse.json({ error: 'Failed to fetch talent' }, { status: 500 });
  }
}
