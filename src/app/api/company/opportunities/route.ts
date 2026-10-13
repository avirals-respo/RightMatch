import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { normalizeSkillSlug } from '@/lib/matching-engine';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'COMPANY' || user.organizationMembers.length === 0) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orgId = user.organizationMembers[0].orgId;

  try {
    const opportunities = await db.opportunity.findMany({
      where: { orgId },
      include: {
        skills: true,
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ opportunities });
  } catch (error) {
    console.error('Fetch company opportunities error:', error);
    return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'COMPANY' || user.organizationMembers.length === 0) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orgId = user.organizationMembers[0].orgId;

  try {
    const data = await req.json();
    const {
      title,
      category,
      description,
      responsibilities,
      eligibilityCriteria,
      workArrangement,
      location,
      hoursPerWeekMin,
      compensationType,
      compensationAmount,
      duration,
      openingsCount,
      deadline,
      skills, // Array of { name: string, isMandatory: boolean }
    } = data;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    const slug = `${title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')}-${Date.now().toString().slice(-4)}`;

    const opportunity = await db.opportunity.create({
      data: {
        orgId,
        title: title.trim(),
        slug,
        category: category || 'INTERNSHIP',
        description: description.trim(),
        responsibilities: responsibilities?.trim() || null,
        eligibilityCriteria: eligibilityCriteria?.trim() || null,
        workArrangement: workArrangement || 'REMOTE',
        location: location?.trim() || 'Remote',
        hoursPerWeekMin: hoursPerWeekMin ? parseInt(hoursPerWeekMin) : 15,
        compensationType: compensationType || 'STIPEND',
        compensationAmount: compensationAmount?.trim() || null,
        duration: duration?.trim() || '3 months',
        openingsCount: openingsCount ? parseInt(openingsCount) : 1,
        deadline: deadline ? new Date(deadline) : null,
        status: 'PUBLISHED',
      },
    });

    // Create skills
    if (Array.isArray(skills) && skills.length > 0) {
      for (const s of skills) {
        if (s.name?.trim()) {
          await db.opportunitySkill.create({
            data: {
              opportunityId: opportunity.id,
              name: s.name.trim(),
              slug: normalizeSkillSlug(s.name),
              isMandatory: s.isMandatory !== false,
            },
          });
        }
      }
    }

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'OPPORTUNITY_CREATED',
        targetType: 'Opportunity',
        targetId: opportunity.id,
        details: JSON.stringify({ title: opportunity.title, orgId }),
      },
    });

    const fullOpp = await db.opportunity.findUnique({
      where: { id: opportunity.id },
      include: { skills: true },
    });

    return NextResponse.json({ success: true, opportunity: fullOpp });
  } catch (error: any) {
    console.error('Create opportunity error:', error);
    return NextResponse.json({ error: 'Failed to create opportunity' }, { status: 500 });
  }
}
