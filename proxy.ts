import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { routing } from '@/i18n/routing';
import {
  canAccessAdminArea,
  canAccessManagerArea,
  canAccessOperationArea,
  canAccessStaffArea,
  getDefaultRouteForRole,
  getLegacyAdminBusinessRedirectPath,
  isAdminRole,
  isManagerRole,
  isLegacyAdminBusinessPath,
} from '@/lib/roles';

// In next-intl v4, localeDetection & localeCookie are part of the routing config
const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname === '/staff' || pathname.startsWith('/staff/')) {
    const salePath = pathname.replace(/^\/staff/, '/sale') || '/sale';
    return NextResponse.redirect(new URL(salePath, request.url));
  }

  if (pathname === '/operation/orders/prescription-needed') {
    const { auth } = await import('@/lib/auth');
    const session = await auth();

    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (canAccessStaffArea(session.user?.role)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/sale/orders/prescription-needed';
      return NextResponse.redirect(redirectUrl);
    }

    if (!canAccessOperationArea(session.user?.role)) {
      const redirectUrl = new URL(getDefaultRouteForRole(session.user?.role), request.url);
      redirectUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (isLegacyAdminBusinessPath(pathname)) {
    const { auth } = await import('@/lib/auth');
    const session = await auth();

    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isManagerRole(session.user?.role)) {
      const nextPath = getLegacyAdminBusinessRedirectPath(pathname);
      if (nextPath) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = nextPath;
        return NextResponse.redirect(redirectUrl);
      }
    }

    if (!isAdminRole(session.user?.role)) {
      const redirectUrl = new URL(getDefaultRouteForRole(session.user?.role), request.url);
      redirectUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  const roleRestrictedAreas = [
    { prefix: '/sale', canAccess: canAccessStaffArea },
    { prefix: '/operation', canAccess: canAccessOperationArea },
    { prefix: '/manager', canAccess: canAccessManagerArea },
    { prefix: '/admin', canAccess: canAccessAdminArea },
  ];

  // Skip API routes — handled by Next.js API routes or rewrites in next.config.js
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

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

  const matchedRoleArea = roleRestrictedAreas.find(
    ({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (matchedRoleArea) {
    const { auth } = await import('@/lib/auth');
    const session = await auth();

    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!matchedRoleArea.canAccess(session.user?.role)) {
      const redirectUrl = new URL(getDefaultRouteForRole(session.user?.role), request.url);
      redirectUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(redirectUrl);
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
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
};
