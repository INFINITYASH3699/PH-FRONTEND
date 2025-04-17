import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { NextResponse } from 'next/server';

// For Edge deployment
export const runtime = 'edge';

// Create auth config for Edge deployment
const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      // This is a mock auth function that always returns an error for now
      async authorize() {
        return null; // Return null to show error during deployment testing
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
});

// Export the API route handlers
export async function GET(request: Request) {
  return handler.auth(request);
}

export async function POST(request: Request) {
  return handler.auth(request);
}
