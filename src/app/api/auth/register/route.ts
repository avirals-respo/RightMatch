import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, signToken, setSessionCookie } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, role, fullName, orgName } = body;

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Email, password, and role are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    if (!['CANDIDATE', 'COMPANY'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role selection' },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const passwordHash = hashPassword(password);

    // Create user and appropriate initial entity
    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        role,
        status: 'ACTIVE',
      },
    });

    if (role === 'CANDIDATE') {
      await db.candidateProfile.create({
        data: {
          userId: user.id,
          fullName: fullName || normalizedEmail.split('@')[0],
          status: 'STUDENT',
          availabilityHoursPerWeek: 20,
          workArrangement: 'ANY',
          visibility: 'PUBLIC',
          onboardingCompleted: false,
        },
      });

      await db.notification.create({
        data: {
          userId: user.id,
          title: 'Welcome to the Platform! 👋',
          message: 'Complete your profile and add your proof of work to start receiving high-quality opportunity matches.',
          type: 'SYSTEM',
          link: '/candidate/profile',
        },
      });
    } else if (role === 'COMPANY') {
      const companyTitle = orgName || 'New Startup';
      const slug = `${companyTitle.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')}-${Date.now().toString().slice(-4)}`;
      
      const org = await db.organization.create({
        data: {
          name: companyTitle,
          slug,
          industry: 'Technology',
          size: '1-10',
          verified: false,
          members: {
            create: {
              userId: user.id,
              role: 'OWNER',
            },
          },
        },
      });

      await db.notification.create({
        data: {
          userId: user.id,
          title: 'Welcome, Founder / Recruiter! 🚀',
          message: 'Create your first structured opportunity to start discovering and ranking matching talent.',
          type: 'SYSTEM',
          link: '/company/opportunities/new',
        },
      });
    }

    // Set authentication token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'CANDIDATE' | 'COMPANY' | 'ADMIN',
    });

    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during registration' },
      { status: 500 }
    );
  }
}
