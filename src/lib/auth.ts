import { passwordVersion } from "@/lib/account/password";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (typeof credentials?.email !== "string" || typeof credentials?.password !== "string" || credentials.password.length > 1000) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) return null;

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!passwordMatch) return null;

        return {
          passwordVersion: passwordVersion(user.password),
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          title: user.title ?? undefined,
          unit: user.unit ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.passwordVersion = user.passwordVersion;
        token.id = user.id;
        token.role = (user as { role: Role }).role;
        token.title = (user as { title?: string }).title;
        token.unit = (user as { unit?: string }).unit;
      }
      // Recheck current credentials and role so password resets revoke every session.
      if (typeof token.id !== "string" || typeof token.passwordVersion !== "string") return null;
      const current = await prisma.user.findUnique({ where: { id: token.id }, select: { password: true, name: true, email: true, role: true, title: true, unit: true } });
      if (!current || passwordVersion(current.password) !== token.passwordVersion) return null;
      token.role = current.role; token.name = current.name; token.email = current.email;
      token.title = current.title ?? undefined; token.unit = current.unit ?? undefined;
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.title = token.title as string | undefined;
        session.user.unit = token.unit as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
});
