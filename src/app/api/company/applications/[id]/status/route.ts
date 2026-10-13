import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

const VALID_STATUSES = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'SHORTLISTED',
  'INTERVIEW',
  'OFFERED',
  'REJECTED',
  'HIRED',
];

export async function PATCH(
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
    const { status } = await req.json();

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid application status' }, { status: 400 });
    }

    // Verify company ownership of the opportunity associated with this application
    const application = await db.application.findUnique({
      where: { id },
      include: {
        opportunity: {
          include: { org: true },
        },
        candidate: {
          include: { user: true },
        },
      },
    });

    if (!application || application.opportunity.orgId !== orgId) {
      return NextResponse.json(
        { error: 'Application not found or unauthorized' },
        { status: 404 }
      );
    }

    const updated = await db.application.update({
      where: { id },
      data: { status },
    });

    // Notify candidate of status update
    const statusLabels: Record<string, string> = {
      UNDER_REVIEW: 'is now Under Review',
      SHORTLISTED: 'has been Shortlisted! 🎉',
      INTERVIEW: 'moved to the Interview stage! 📅',
      OFFERED: 'received an Official Offer! 🏆',
      REJECTED: 'was updated: not moving forward at this time',
      HIRED: 'has been marked as Hired! 🚀',
    };

    const label = statusLabels[status] || `updated to ${status}`;

    await db.notification.create({
      data: {
        userId: application.candidate.userId,
        title: `Application Status Update: ${application.opportunity.title}`,
        message: `${application.opportunity.org.name} ${label}.`,
        type: 'STATUS_CHANGE',
        link: '/candidate/applications',
      },
    });

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'APPLICATION_STATUS_UPDATED',
        targetType: 'Application',
        targetId: application.id,
        details: JSON.stringify({ oldStatus: application.status, newStatus: status }),
      },
    });

    return NextResponse.json({ success: true, application: updated });
  } catch (error) {
    console.error('Update application status error:', error);
    return NextResponse.json(
      { error: 'Failed to update application status' },
      { status: 500 }
    );
  }
}
