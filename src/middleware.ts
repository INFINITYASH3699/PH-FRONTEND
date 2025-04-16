import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // For demo purposes, we'll skip auth checks
  // In production, you would uncomment the auth check code

  return NextResponse.next();
}

// See: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: [
    // Match all paths except for static files, api routes, and _next/static
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};
