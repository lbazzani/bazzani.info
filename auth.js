export const runtime = "nodejs";
export const preferredRegion = "auto";

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Username and password required");
        }

        // Hard-coded user for Lorenzo
        const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "lorenzo";
        const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

        if (credentials.username !== ADMIN_USERNAME) {
          throw new Error("Invalid credentials");
        }

        // Verify password
        const isValid = await bcrypt.compare(credentials.password, ADMIN_PASSWORD_HASH);

        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        // Return user object
        return {
          id: "1",
          email: "lorenzo@bazzani.info",
          name: "Lorenzo Bazzani",
        };
      }
    }),
  ],
};

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);
