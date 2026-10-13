import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const unreadNotificationsCount = await db.notification.count({
      where: { userId: user.id, read: false },
    });

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        candidateProfile: user.candidateProfile,
        organization: user.organizationMembers[0]?.org || null,
        unreadNotificationsCount,
      },
    });
  } catch (error) {
    console.error('Session me error:', error);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
