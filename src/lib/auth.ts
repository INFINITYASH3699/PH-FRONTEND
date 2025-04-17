import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { compare } from 'bcrypt';
import { User } from '@/models/User';
import dbConnect from './db/mongodb';

// Verify required environment variables
const nextAuthSecret = process.env.NEXTAUTH_SECRET;
if (!nextAuthSecret) {
  console.error('Missing NEXTAUTH_SECRET environment variable');
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide both email and password');
        }

        // Connect to the database
        try {
          await dbConnect();
        } catch (error) {
          console.error('Database connection error:', error);
          throw new Error('Database connection failed. Please try again later.');
        }

        try {
          // Case-insensitive email search
          const user = await User.findOne({
            email: { $regex: new RegExp(`^${credentials.email}$`, 'i') }
          }).select('+password');

          if (!user) {
            throw new Error('No user found with this email');
          }

          const passwordMatch = await compare(credentials.password, user.password);

          if (!passwordMatch) {
            throw new Error('Incorrect password');
          }

          // Check if user is active
          if (user.status === 'inactive') {
            throw new Error('Your account has been deactivated');
          }

          return {
            id: user._id.toString(),
            name: user.fullName,
            email: user.email,
            username: user.username,
            image: user.profilePicture,
            role: user.role || 'user',
          };
        } catch (error) {
          console.error('Authentication error:', error);
          throw error instanceof Error ? error : new Error('Authentication failed');
        }
      },
    }),
    // Google provider is commented out until you provide these environment variables
    // Just uncomment and add the environment variables to enable Google auth
    /*
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      // Add additional profile fields if needed
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          username: profile.email.split('@')[0],
          // Other fields as needed
        };
      },
    }),
    */
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For OAuth (Google, etc.) accounts, we need to check if the user exists in our database
      // If not, we create a new user
      if (account?.provider !== 'credentials') {
        await dbConnect();

        try {
          const existingUser = await User.findOne({ email: user.email });

          if (!existingUser && user.email) {
            // Create a new user from OAuth data
            const newUser = new User({
              email: user.email,
              fullName: user.name,
              username: user.email?.split('@')[0] || `user_${Date.now()}`,
              profilePicture: user.image,
              // No password for OAuth users
              password: '',
              // Additional fields as needed
            });

            await newUser.save();
          }
        } catch (error) {
          console.error('Error during OAuth sign in:', error);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role || 'user';
        token.provider = account?.provider;
      }

      // Check token expiration and refresh if needed
      const now = Math.floor(Date.now() / 1000);
      const tokenExpiry = token.exp as number;

      // If token is still valid, return it
      if (tokenExpiry && now < tokenExpiry) {
        return token;
      }

      // Otherwise, you could implement token refresh logic here

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        // Add role for role-based access control
        session.user.role = token.role as string;
        // Add provider information
        session.provider = token.provider as string;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: nextAuthSecret,
  debug: process.env.NODE_ENV === 'development',
});
