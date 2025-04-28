import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// List of paths that require authentication
const PROTECTED_PATHS = ["/dashboard", "/profile", "/templates/use"];

// List of paths that are only accessible to non-authenticated users
const AUTH_ONLY_PATHS = ["/auth/signin", "/auth/signup"];

// Cookie name - keep in sync with apiClient TOKEN_KEY
const AUTH_COOKIE_NAME = "ph_auth_token";

// Helper to check if a JWT token is potentially valid (basic structure check)
const isTokenPotentiallyValid = (token: string): boolean => {
  // JWT tokens consist of three parts separated by dots
  const parts = token.split(".");
  if (parts.length !== 3) {
    return false;
  }

  // Each part should be a base64url encoded string
  // Simple check: they should contain alphanumeric chars, _ and - only
  const isBase64UrlEncoded = (str: string) => /^[A-Za-z0-9_-]+$/.test(str);
  return parts.every(isBase64UrlEncoded);
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the token from the cookie
  const authToken = request.cookies.get(AUTH_COOKIE_NAME);

  // More robust token validation - ensure it has a proper value, length, and JWT structure
  const hasToken = !!authToken?.value;
  const hasValidTokenLength = hasToken && authToken.value.length > 50;
  const hasValidTokenStructure =
    hasToken && isTokenPotentiallyValid(authToken.value);
  const isAuthenticated =
    hasToken && hasValidTokenLength && hasValidTokenStructure;

  // List all cookies for debugging
  const allCookieNames = [...request.cookies.getAll()]
    .map((c) => c.name)
    .join(", ");

  // Check if the path requires authentication
  const isProtectedPath = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  // Check if the path is for non-authenticated users only
  const isAuthOnlyPath = AUTH_ONLY_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  // Handle portfolio subdomains with sequential numbering for premium users
  // Format: /portfolio/username-1, /portfolio/username-2, etc.
  if (pathname.startsWith("/portfolio/")) {
    // Extract the username from the path
    const segments = pathname.split("/");
    if (segments.length >= 3) {
      const usernameWithPossibleOrder = segments[2];

      // Check if it contains a dash followed by numbers (e.g., username-1)
      const match = usernameWithPossibleOrder.match(/^(.+)-(\d+)$/);
      if (match) {
        const baseUsername = match[1];
        const order = parseInt(match[2]);
      }
    }
  }

  // If it's a protected path and user is not authenticated, redirect to sign in
  if (isProtectedPath && !isAuthenticated) {
    const signInUrl = new URL("/auth/signin", request.url);

    // Use redirectTo parameter to allow more complex paths to be preserved
    signInUrl.searchParams.set("redirectTo", pathname);

    // If we have a token but it's invalid, add a flag to clear it on the signin page
    if (hasToken && (!hasValidTokenLength || !hasValidTokenStructure)) {
      signInUrl.searchParams.set("clearToken", "true");
    }

    return NextResponse.redirect(signInUrl);
  }

  // If it's an auth-only path and user is authenticated, redirect to dashboard
  if (isAuthOnlyPath && isAuthenticated) {
    // Check if there's a redirectTo query parameter to respect the original destination
    const url = request.nextUrl.clone();
    const redirectTo = url.searchParams.get("redirectTo");

    if (redirectTo && redirectTo.startsWith("/")) {
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Add a header to indicate this request passed through middleware
  const response = NextResponse.next();
  response.headers.set("x-middleware-cache", "no-cache");

  return response;
}

// See: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: [
    // Match protected paths
    "/dashboard/:path*",
    "/profile/:path*",
    "/templates/use/:path*",
    // Match auth-only paths
    "/auth/:path*",
    // Match portfolio paths for subdomain routing
    "/portfolio/:username*",
  ],
};
