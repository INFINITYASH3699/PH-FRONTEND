import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of paths that require authentication
const PROTECTED_PATHS = [
  '/dashboard',
  '/profile',
  '/templates/use',
];

// List of paths that are only accessible to non-authenticated users
const AUTH_ONLY_PATHS = [
  '/auth/signin',
  '/auth/signup',
];

// Cookie name - keep in sync with apiClient TOKEN_KEY
const AUTH_COOKIE_NAME = 'ph_auth_token';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the token from the cookie
  const authToken = request.cookies.get(AUTH_COOKIE_NAME);

  // More robust token validation - ensure it has a proper value and length
  // JWT tokens are usually much longer than 50 characters
  const isAuthenticated = !!authToken?.value && authToken.value.length > 50;

  // List all cookies for debugging
  const allCookieNames = [...request.cookies.getAll()].map(c => c.name).join(', ');

  // Log the authentication state for debugging
  console.log(`Middleware: Path=${pathname}, Auth=${isAuthenticated}, TokenLength=${authToken?.value ? authToken.value.length : 0}, Cookie=${AUTH_COOKIE_NAME}, AllCookies=[${allCookieNames}]`);

  // Check if the path requires authentication
  const isProtectedPath = PROTECTED_PATHS.some(path =>
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // Check if the path is for non-authenticated users only
  const isAuthOnlyPath = AUTH_ONLY_PATHS.some(path =>
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // If it's a protected path and user is not authenticated, redirect to sign in
  if (isProtectedPath && !isAuthenticated) {
    console.log(`Middleware: Redirecting unauthenticated user from ${pathname} to /auth/signin`);
    const signInUrl = new URL('/auth/signin', request.url);
    // Simplified callbackUrl to just use the pathname
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // If it's an auth-only path and user is authenticated, redirect to dashboard
  if (isAuthOnlyPath && isAuthenticated) {
    console.log(`Middleware: Redirecting authenticated user from ${pathname} to /dashboard`);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Add a header to indicate this request passed through middleware
  const response = NextResponse.next();
  response.headers.set('x-middleware-cache', 'no-cache');

  return response;
}

// See: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: [
    // Match protected paths
    '/dashboard/:path*',
    '/profile/:path*', 
    '/templates/use/:path*',
    // Match auth-only paths
    '/auth/:path*',
  ],
};
