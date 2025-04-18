import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

// Verify required environment variables
const nextAuthSecret = process.env.NEXTAUTH_SECRET;
if (!nextAuthSecret) {
  console.error("Missing NEXTAUTH_SECRET environment variable");
}

// Dev mode check for using placeholder credentials
const isDevelopmentMode = process.env.NODE_ENV === "development";
const isUsingPlaceholderCreds =
  process.env.MONGODB_URI?.includes("placeholder");

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
    error: "/auth/error",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please provide both email and password");
        }

        // For development with placeholder credentials, allow a test user login
        if (isDevelopmentMode && isUsingPlaceholderCreds) {
          console.warn("Using development mock authentication");
          if (
            credentials.email === "test@example.com" &&
            credentials.password === "password"
          ) {
            return {
              id: "1",
              name: "Test User",
              email: "test@example.com",
              username: "testuser",
              image: "https://via.placeholder.com/150",
              role: "user",
            };
          }
          throw new Error("Invalid test credentials");
        }

        try {
          // Use the validate-credentials API
          const baseUrl = process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : process.env.NEXTAUTH_URL || "";

          const response = await fetch(
            `${baseUrl}/api/auth/validate-credentials`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Authentication failed");
          }

          return {
            id: data.id,
            name: data.name,
            email: data.email,
            username: data.username,
            image: data.image,
            role: data.role || "user",
          };
        } catch (error) {
          console.error("Authentication error:", error);
          throw error instanceof Error
            ? error
            : new Error("Authentication failed");
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
      // Skip database operations in development with placeholder credentials
      if (isDevelopmentMode && isUsingPlaceholderCreds) {
        return true;
      }

      // For OAuth accounts, check if they exist via API route
      if (account?.provider !== "credentials") {
        try {
          // Use the check-oauth-user API
          const baseUrl = process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : process.env.NEXTAUTH_URL || "";

          const response = await fetch(`${baseUrl}/api/auth/check-oauth-user`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              image: user.image,
            }),
          });

          if (!response.ok) {
            return false;
          }
        } catch (error) {
          console.error("Error during OAuth sign in:", error);
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
        token.role = user.role || "user";
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
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: nextAuthSecret,
  debug: process.env.NODE_ENV === "development",
});
