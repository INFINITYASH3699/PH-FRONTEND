import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const session = await auth();
  const isLoggedIn = !!session;

  // Define the paths that require authentication
  const authRequiredPaths = [
    '/dashboard',
    '/profile',
    '/templates/use',
  ];

  // Check if the current path is in the protected list
  const isAuthRequired = authRequiredPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  // If the route requires auth and the user is not logged in, redirect to sign in
  if (isAuthRequired && !isLoggedIn) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // If user is logged in and tries to access auth pages, redirect to dashboard
  if (isLoggedIn && (
    request.nextUrl.pathname.startsWith('/auth/signin') ||
    request.nextUrl.pathname.startsWith('/auth/signup')
  )) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// See: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: [
    // Match all paths except for static files, api routes, and _next/static
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};
