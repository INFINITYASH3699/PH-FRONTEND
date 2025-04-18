import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';

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

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "your-jwt-secret-key-change-me";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the auth token from cookies
  const authToken = request.cookies.get('auth-token');
  let isAuthenticated = false;

  // Verify the token if it exists
  if (authToken?.value) {
    try {
      verify(authToken.value, JWT_SECRET);
      isAuthenticated = true;
    } catch (error) {
      console.error('Invalid token:', error);
      isAuthenticated = false;
    }
  }

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
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(signInUrl);
  }

  // If it's an auth-only path and user is authenticated, redirect to dashboard
  if (isAuthOnlyPath && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Continue with the request for all other cases
  return NextResponse.next();
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
