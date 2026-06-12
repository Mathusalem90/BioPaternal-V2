import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import type { NextAuthOptions } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { verifyPassword } from './hash'
import { prisma } from './prisma'

// Fail fast at startup if a required env var is missing, rather than passing
// an empty string to the OAuth provider and getting an opaque runtime error.
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma as PrismaClient),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        })
        if (!user || !user.password) return null

        const isValid = await verifyPassword(user.password, credentials.password)
        if (!isValid) return null

        // name alimente token.name → affiché dans la barre de navigation.
        return { id: user.id, email: user.email, name: user.name, role: user.role }
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          // Google verifies email ownership, so linking a Google login to an
          // existing credentials account with the same email is safe here.
          // Without this, a credentials user clicking "Continuer avec Google"
          // gets a silent OAuthAccountNotLinked failure.
          allowDangerousEmailAccountLinking: true,
        })]
      : []),
  ],
  callbacks: {
    // RGPD — the CGU gate for Google users does NOT live here.
    // On a first Google sign-in this callback runs BEFORE the adapter
    // creates the User row (user.id is the Google `sub`), so blocking or
    // redirecting here makes consent impossible to record. Instead, the
    // sign-in always completes and /app/layout.tsx redirects users without
    // a Consent row to /signup/consent (checked via GET /api/auth/consent).
    // Credentials users accept CGU via the signup form (/api/auth/signup).

    // JWT — only identity fields. Never put biological data here.
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },

    // Session — mirrors JWT. Only id + role exposed to the client.
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string
        session.user.role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
}
