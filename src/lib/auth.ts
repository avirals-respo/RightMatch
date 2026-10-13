import crypto from 'crypto';
import { cookies } from 'next/headers';
import { db } from './db';

const SALT = process.env.AUTH_SALT || 'talent-platform-secure-salt-2025';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-nexus-talent-matching-platform-key-change-in-production-2025';
const COOKIE_NAME = 'opp_session';

export interface SessionPayload {
  userId: string;
  email: string;
  role: 'CANDIDATE' | 'COMPANY' | 'ADMIN';
  exp: number;
}

export function hashPassword(password: string): string {
  return crypto.pbkdf2Sync(password, SALT, 10000, 64, 'sha512').toString('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  const computed = hashPassword(password);
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
}

export function signToken(data: Omit<SessionPayload, 'exp'>, expiresInDays = 7): string {
  const payload: SessionPayload = {
    ...data,
    exp: Date.now() + expiresInDays * 24 * 60 * 60 * 1000,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(payloadB64)
    .digest('base64url');
  return `${payloadB64}.${signature}`;
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return null;

    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(payloadB64)
      .digest('base64url');

    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      )
    ) {
      return null;
    }

    const payload: SessionPayload = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf8')
    );

    if (Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);
  if (!sessionCookie?.value) return null;

  const payload = verifyToken(sessionCookie.value);
  if (!payload) return null;

  const user = await db.user.findUnique({
    where: { id: payload.userId },
    include: {
      candidateProfile: {
        include: {
          skills: true,
          projects: true,
        },
      },
      organizationMembers: {
        include: {
          org: true,
        },
      },
    },
  });

  if (!user || user.status === 'SUSPENDED') return null;
  return user;
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });
}

export async function removeSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
