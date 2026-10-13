import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
  }

  try {
    const [
      totalUsers,
      totalCandidates,
      totalOrganizations,
      totalOpportunities,
      publishedOpportunities,
      totalApplications,
      recentAuditLogs,
    ] = await Promise.all([
      db.user.count(),
      db.candidateProfile.count(),
      db.organization.count(),
      db.opportunity.count(),
      db.opportunity.count({ where: { status: 'PUBLISHED' } }),
      db.application.count(),
      db.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { user: { select: { email: true } } },
      }),
    ]);

    // Application breakdown by status
    const applicationsByStatus = await db.application.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    return NextResponse.json({
      metrics: {
        totalUsers,
        totalCandidates,
        totalOrganizations,
        totalOpportunities,
        publishedOpportunities,
        totalApplications,
      },
      applicationsByStatus,
      recentAuditLogs,
    });
  } catch (error) {
    console.error('Fetch admin metrics error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin metrics' }, { status: 500 });
  }
}
