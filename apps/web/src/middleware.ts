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

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });
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
