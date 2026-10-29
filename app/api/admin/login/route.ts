import { NextResponse } from 'next/server';
import { getAdminByUsername } from '@/lib/queries';
import { verifyPassword, signSessionToken, setSessionCookie } from '@/lib/auth';

// Basic in-memory brute force tracker
const attempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const record = attempts.get(key);
  if (!record) return false;
  if (now > record.resetAt) {
    attempts.delete(key);
    return false;
  }
  return record.count >= 5;
}

function recordFailedAttempt(key: string) {
  const now = Date.now();
  const record = attempts.get(key);
  if (!record || now > record.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + 5 * 60 * 1000 }); // 5 min block
  } else {
    record.count += 1;
  }
}

function clearAttempts(key: string) {
  attempts.delete(key);
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const username = (body?.username || '').trim();
    const password = body?.password || '';

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Operator ID and Passphrase are required.' },
        { status: 400 }
      );
    }

    const rateKey = username.toLowerCase();
    if (isRateLimited(rateKey)) {
      return NextResponse.json(
        {
          success: false,
          error: 'ACCESS LOCKED: Too many failed authentication attempts. Try again in 5 minutes.',
        },
        { status: 429 }
      );
    }

    const admin = await getAdminByUsername(username);
    if (!admin || !admin.password) {
      recordFailedAttempt(rateKey);
      return NextResponse.json(
        { success: false, error: 'ACCESS DENIED — Invalid credentials.' },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, admin.password);
    if (!valid) {
      recordFailedAttempt(rateKey);
      return NextResponse.json(
        { success: false, error: 'ACCESS DENIED — Invalid credentials.' },
        { status: 401 }
      );
    }

    clearAttempts(rateKey);

    const token = await signSessionToken({ id: admin.id, username: admin.username });
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      data: {
        id: admin.id,
        username: admin.username,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Authentication failure.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
