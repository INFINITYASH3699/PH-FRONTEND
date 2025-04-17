import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// For Edge deployment
export const runtime = 'edge';

// Create a simple auth handler for Edge deployment
export const { GET, POST } = NextAuth({
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
