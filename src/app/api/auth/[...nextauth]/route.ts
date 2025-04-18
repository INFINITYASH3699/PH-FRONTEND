import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Don't use runtime: 'edge' as it's causing issues in Vercel
// export const runtime = 'edge';

// Create auth config
const handler = NextAuth({
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

        // Check for dev/test environment
        if (
          process.env.NODE_ENV === "development" &&
          process.env.MONGODB_URI?.includes("placeholder")
        ) {
          if (
            credentials.email === "test@example.com" &&
            credentials.password === "password"
          ) {
            return {
              id: "1",
              name: "Test User",
              email: "test@example.com",
              username: "testuser",
              image: "",
            };
          }
          throw new Error("Invalid credentials");
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

          // Return the user data from the validation endpoint
          return {
            id: data.id,
            name: data.name,
            email: data.email,
            username: data.username,
            image: data.image || "",
          };
        } catch (error) {
          console.error("Authentication error:", error);
          throw error instanceof Error
            ? error
            : new Error("Authentication failed");
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
});

// Export the API route handlers
export { handler as GET, handler as POST };
