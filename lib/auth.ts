import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const SESSION_COOKIE = 'nexus_session';
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days in seconds

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET || process.env.ADMIN_SESSION_SECRET || 'nexus_super_classified_jwt_secret_2026';
  return new TextEncoder().encode(secret);
}

export interface SessionUser {
  id: number;
  username: string;
}

export async function signSessionToken(user: SessionUser): Promise<string> {
  const key = getSecretKey();
  return new SignJWT({ id: user.id, username: user.username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const key = getSecretKey();
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });
    if (payload && typeof payload.id === 'number' && typeof payload.username === 'string') {
      return {
        id: payload.id,
        username: payload.username,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    // PHP $2y$ blowfish hash compatibility with bcrypt
    const normalizedHash = hash.replace(/^\$2y\$/, '$2a$');
    return await bcrypt.compare(password, normalizedHash);
  } catch (err) {
    console.error('[Auth] Password compare error:', err);
    return false;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}
