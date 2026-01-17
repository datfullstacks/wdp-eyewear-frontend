import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

// Create the internationalization middleware
const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // Handle internationalization first
  const response = intlMiddleware(request);

  // Get the pathname without locale prefix
  const pathname = request.nextUrl.pathname;
  const pathnameWithoutLocale = pathname.replace(/^\/(en|vi)/, '') || '/';

  // Protected routes
  const protectedRoutes = ['/dashboard', '/profile', '/orders', '/checkout'];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathnameWithoutLocale.startsWith(route)
  );

  if (isProtectedRoute) {
    const session = await auth();
    if (!session) {
      const locale = pathname.match(/^\/(en|vi)/)?.[1] || 'vi';
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from auth pages
  const authRoutes = ['/login', '/register'];
  const isAuthRoute = authRoutes.some((route) =>
    pathnameWithoutLocale.startsWith(route)
  );

  if (isAuthRoute) {
    const session = await auth();
    if (session) {
      const locale = pathname.match(/^\/(en|vi)/)?.[1] || 'vi';
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
