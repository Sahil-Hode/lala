import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SESSION_COOKIE = 'nexus_session';

function getSecretKey(): Uint8Array {
  const secret =
    process.env.AUTH_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    'nexus_super_classified_jwt_secret_2026';
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  let isValid = false;
  if (token) {
    try {
      const key = getSecretKey();
      await jwtVerify(token, key, { algorithms: ['HS256'] });
      isValid = true;
    } catch {
      isValid = false;
    }
  }

  // If on login page and already logged in, redirect to admin dashboard
  if (pathname === '/admin/login') {
    if (isValid) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  // Protect all /admin routes
  if (pathname.startsWith('/admin')) {
    if (!isValid) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
