import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * IMPORTANT: Middleware runs in the Edge runtime.
 * Do NOT import `@/lib/auth` here because it pulls in `bcryptjs` (Node APIs),
 * which breaks Vercel Edge bundling.
 */
export default async function middleware(req: NextRequest) {
  const isOnChat = req.nextUrl.pathname.startsWith('/chat');
  const isLoginPage = req.nextUrl.pathname === '/login';

  // Match the secret resolution used by NextAuth in `src/lib/auth.ts`
  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;

  // NextAuth v5 uses `authjs.session-token` (secure version is `__Secure-authjs.session-token`).
  // If NEXTAUTH_URL / secureCookie inference is off, getToken() may look for the wrong cookie.
  // Be explicit and try the common variants to avoid redirecting logged-in users to /login.
  const cookieNamesToTry = [
    '__Secure-authjs.session-token',
    'authjs.session-token',
    '__Secure-next-auth.session-token',
    'next-auth.session-token',
  ];

  let token = await getToken({ req, secret });
  if (!token) {
    for (const cookieName of cookieNamesToTry) {
      token = await getToken({ req, secret, cookieName });
      if (token) break;
    }
  }
  const isLoggedIn = !!token;

  if (isOnChat) {
    if (isLoggedIn) return NextResponse.next();
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  if (isLoginPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/chat', req.nextUrl));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
