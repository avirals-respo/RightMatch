import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const arrangement = searchParams.get('arrangement');
    const location = searchParams.get('location');

    const where: any = {
      status: 'PUBLISHED',
    };

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (arrangement && arrangement !== 'ALL') {
      where.workArrangement = arrangement;
    }

    if (location && location !== 'ALL') {
      where.location = { contains: location };
    }

    if (search.trim()) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { org: { name: { contains: search } } },
      ];
    }

    const opportunities = await db.opportunity.findMany({
      where,
      include: {
        org: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            location: true,
            industry: true,
            verified: true,
          },
        },
        skills: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ opportunities });
  } catch (error) {
    console.error('Fetch public opportunities error:', error);
    return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 });
  }
}
