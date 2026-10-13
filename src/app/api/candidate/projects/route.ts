import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'CANDIDATE' || !user.candidateProfile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, description, liveUrl, repoUrl, skillsUsed, featured } = await req.json();

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const project = await db.project.create({
      data: {
        candidateId: user.candidateProfile.id,
        title: title.trim(),
        description: description.trim(),
        liveUrl: liveUrl?.trim() || null,
        repoUrl: repoUrl?.trim() || null,
        skillsUsed: skillsUsed?.trim() || null,
        featured: Boolean(featured),
      },
    });

    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
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
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
    }

    await db.project.deleteMany({
      where: {
        id,
        candidateId: user.candidateProfile.id,
      },
    });

    return NextResponse.json({ success: true, message: 'Project removed' });
  } catch (error) {
    console.error('Delete project error:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
