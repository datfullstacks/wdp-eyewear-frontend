import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

// Create the internationalization middleware with cookie support
const intlMiddleware = createMiddleware(routing, {
  localeDetection: true,
  localeCookie: {
    name: 'NEXT_LOCALE',
  },
});

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Handle internationalization first (reads cookie for locale)
  const intlResponse = intlMiddleware(request);

  // Protected routes
  const protectedRoutes = ['/dashboard', '/profile', '/orders', '/checkout'];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    const session = await auth();
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from auth pages
  const authRoutes = ['/login', '/register'];
  const isAuthRoute = authRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isAuthRoute) {
    const session = await auth();
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return intlResponse;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
