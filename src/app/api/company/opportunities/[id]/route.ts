import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { normalizeSkillSlug } from '@/lib/matching-engine';

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

  const opportunity = await db.opportunity.findFirst({
    where: { id, orgId },
    include: {
      skills: true,
      _count: {
        select: { applications: true },
      },
    },
  });

  if (!opportunity) {
    return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
  }

  return NextResponse.json({ opportunity });
}

export async function PUT(
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
    const data = await req.json();

    const existing = await db.opportunity.findFirst({
      where: { id, orgId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    const updated = await db.opportunity.update({
      where: { id },
      data: {
        title: data.title !== undefined ? data.title.trim() : undefined,
        category: data.category,
        description: data.description !== undefined ? data.description.trim() : undefined,
        responsibilities: data.responsibilities,
        eligibilityCriteria: data.eligibilityCriteria,
        workArrangement: data.workArrangement,
        location: data.location,
        hoursPerWeekMin: data.hoursPerWeekMin ? parseInt(data.hoursPerWeekMin) : undefined,
        compensationType: data.compensationType,
        compensationAmount: data.compensationAmount,
        duration: data.duration,
        openingsCount: data.openingsCount ? parseInt(data.openingsCount) : undefined,
        status: data.status,
      },
    });

    // Update skills if provided
    if (Array.isArray(data.skills)) {
      await db.opportunitySkill.deleteMany({ where: { opportunityId: id } });
      for (const s of data.skills) {
        if (s.name?.trim()) {
          await db.opportunitySkill.create({
            data: {
              opportunityId: id,
              name: s.name.trim(),
              slug: normalizeSkillSlug(s.name),
              isMandatory: s.isMandatory !== false,
            },
          });
        }
      }
    }

    const fullOpp = await db.opportunity.findUnique({
      where: { id },
      include: { skills: true },
    });

    return NextResponse.json({ success: true, opportunity: fullOpp });
  } catch (error) {
    console.error('Update opportunity error:', error);
    return NextResponse.json({ error: 'Failed to update opportunity' }, { status: 500 });
  }
}
