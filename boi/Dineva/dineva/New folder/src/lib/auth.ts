import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// For Next.js App Router (Auth.js v5)
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID || "MOCK_GOOGLE_ID",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "MOCK_GOOGLE_SECRET",
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        // Expose user ID to the session object
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
  },
  pages: {
    signIn: "/",
  },
  secret: process.env.AUTH_SECRET || "ecosphere-secret-key-32-chars-at-least-for-signing",
});
