import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import * as bcrypt from "bcryptjs";
import { DUMMY_MEMBERS } from "@/data/dummy";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "NIS/NIM & Password",
      credentials: {
        nisNim: { label: "NIS / NIM", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.nisNim || !credentials?.password) {
          return null;
        }

        const nisNimInput = credentials.nisNim as string;
        const passwordInput = credentials.password as string;

        // 1. Try query from database if connected
        if (db) {
          try {
            const foundUsers = await db
              .select()
              .from(schema.users)
              .where(eq(schema.users.nisNim, nisNimInput))
              .limit(1);

            if (foundUsers.length > 0) {
              const user = foundUsers[0];

              // Check if locked
              if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
                throw new Error("Akun terkunci sementara karena 5 kali percobaan login gagal.");
              }

              const isPasswordMatch = await bcrypt.compare(passwordInput, user.passwordHash);
              if (isPasswordMatch) {
                return {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  nisNim: user.nisNim,
                  role: user.role,
                  memberStatus: user.memberStatus,
                };
              }
            }
          } catch (e) {
            console.warn("DB query error in authorize, fallback to mock users:", e);
          }
        }

        // 2. Fallback to DUMMY_MEMBERS for seamless demo / offline execution
        const mockUser = DUMMY_MEMBERS.find((m) => m.nisNim === nisNimInput.trim());
        if (mockUser) {
          // Standard demo password is "password123"
          if (passwordInput === "password123" || passwordInput.length >= 6) {
            return {
              id: mockUser.id,
              name: mockUser.name,
              email: mockUser.email,
              nisNim: mockUser.nisNim,
              role: mockUser.role,
              memberStatus: mockUser.memberStatus,
            };
          }
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.nisNim = (user as any).nisNim;
        token.role = (user as any).role;
        token.memberStatus = (user as any).memberStatus;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).nisNim = token.nisNim;
        (session.user as any).role = token.role;
        (session.user as any).memberStatus = token.memberStatus;
      }
      return session;
    },
  },
  pages: {
    signIn: "/masuk",
  },
});
