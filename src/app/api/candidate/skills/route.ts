import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { normalizeSkillSlug } from '@/lib/matching-engine';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'CANDIDATE' || !user.candidateProfile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, proficiency } = await req.json();
    if (!name) {
      return NextResponse.json({ error: 'Skill name is required' }, { status: 400 });
    }

    const slug = normalizeSkillSlug(name);
    const existing = await db.candidateSkill.findFirst({
      where: {
        candidateId: user.candidateProfile.id,
        slug,
      },
    });

    if (existing) {
      const updated = await db.candidateSkill.update({
        where: { id: existing.id },
        data: { proficiency: proficiency || 'INTERMEDIATE' },
      });
      return NextResponse.json({ success: true, skill: updated });
    }

    const created = await db.candidateSkill.create({
      data: {
        candidateId: user.candidateProfile.id,
        name: name.trim(),
        slug,
        proficiency: proficiency || 'INTERMEDIATE',
      },
    });

    return NextResponse.json({ success: true, skill: created });
  } catch (error) {
    console.error('Add skill error:', error);
    return NextResponse.json({ error: 'Failed to add skill' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'CANDIDATE' || !user.candidateProfile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Skill ID required' }, { status: 400 });
    }

    await db.candidateSkill.deleteMany({
      where: {
        id,
        candidateId: user.candidateProfile.id,
      },
    });

    return NextResponse.json({ success: true, message: 'Skill removed' });
  } catch (error) {
    console.error('Delete skill error:', error);
    return NextResponse.json({ error: 'Failed to delete skill' }, { status: 500 });
  }
}
