import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(
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
    const { content } = await req.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Note content is required' }, { status: 400 });
    }

    const application = await db.application.findUnique({
      where: { id },
      include: { opportunity: true },
    });

    if (!application || application.opportunity.orgId !== orgId) {
      return NextResponse.json(
        { error: 'Application not found or unauthorized' },
        { status: 404 }
      );
    }

    const note = await db.applicationNote.create({
      data: {
        applicationId: id,
        authorId: user.id,
        content: content.trim(),
      },
      include: {
        author: { select: { email: true } },
      },
    });

    return NextResponse.json({ success: true, note });
  } catch (error) {
    console.error('Add application note error:', error);
    return NextResponse.json({ error: 'Failed to add note' }, { status: 500 });
  }
}
