import { getSessionCookie } from 'better-auth/cookies';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const isSignedIn = !!getSessionCookie(request);

  if (request.nextUrl.pathname === '/sign-in') {
    if (isSignedIn) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return;
  }

  if (!isSignedIn) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
}

export const config = {
  matcher: ['/listings/create', '/sign-in'],
};
