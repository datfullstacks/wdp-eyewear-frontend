import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
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

  // Legacy dashboard routes are deprecated.
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    const nextPath = pathname.replace(/^\/dashboard/, '') || '/products';
    return NextResponse.redirect(new URL(nextPath, request.url));
  }

  // Root: send guests to login (do not force authenticated users to /products).
  if (pathname === '/') {
    const { auth } = await import('@/lib/auth');
    const session = await auth();
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Handle internationalization first (reads cookie for locale)
  const intlResponse = intlMiddleware(request);

  // Protected routes
  const protectedRoutes = [
    '/profile',
    '/orders',
    '/checkout',
    '/prescriptions',
    '/customers',
    '/returns',
    '/inventory',
    '/products',
    '/users',
    '/reports',
    '/settings',
  ];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    const { auth } = await import('@/lib/auth');
    const session = await auth();
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return intlResponse;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
};
