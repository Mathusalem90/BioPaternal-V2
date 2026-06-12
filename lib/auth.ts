import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import type { NextAuthOptions } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { verifyPassword } from './hash'
import { prisma } from './prisma'

// Fail fast at startup if a required env var is missing, rather than passing
// an empty string to the OAuth provider and getting an opaque runtime error.
function requireEnv(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Missing required environment variable: ${key}`)
  return val
}

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

        return { id: user.id, email: user.email, role: user.role }
      },
    }),
    GoogleProvider({
      clientId: requireEnv('GOOGLE_CLIENT_ID'),
      clientSecret: requireEnv('GOOGLE_CLIENT_SECRET'),
    }),
  ],
  callbacks: {
    // RGPD — CGU gate for Google OAuth users.
    // Credentials users accept CGU via the signup form (/api/auth/signup).
    // Google users skip that form, so we check the Consent table here.
    // A user without a Consent record is redirected to accept CGU before
    // accessing the app. This fires on every sign-in but the DB hit is
    // negligible compared to the OAuth round-trip.
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.id) {
        const consent = await prisma.consent.findFirst({
          where: { userId: user.id },
        })
        if (!consent) {
          // New Google user — redirect to the consent acceptance page.
          // The page must POST to /api/auth/consent to create the record,
          // then redirect to /app/test.
          return `/signup?consent=required&uid=${user.id}`
        }
      }
      return true
    },

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
