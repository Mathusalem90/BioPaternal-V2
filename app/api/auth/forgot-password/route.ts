import { createHash, randomBytes } from 'crypto'
import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

const TOKEN_TTL_MS = 60 * 60 * 1000 // 1 h

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

async function sendResetEmail(email: string, resetUrl: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return false

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? 'BioPaternal <onboarding@resend.dev>',
      to: [email],
      subject: 'Réinitialisation de votre mot de passe — BioPaternal',
      html: `
        <p>Bonjour,</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe BioPaternal.
        Ce lien est valable 1 heure :</p>
        <p><a href="${resetUrl}">Réinitialiser mon mot de passe</a></p>
        <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.</p>
      `,
    }),
  })
  return res.ok
}

/**
 * POST /api/auth/forgot-password — Body: { email }
 *
 * Toujours 200 avec { ok: true }, que le compte existe ou non
 * (anti-énumération d'adresses). Le jeton est stocké haché (SHA-256)
 * dans VerificationToken ; seul le lien envoyé contient le jeton en clair.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : ''
  if (!email) {
    return NextResponse.json({ error: 'INVALID_REQUEST' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return NextResponse.json({ ok: true })
  }

  const token = randomBytes(32).toString('hex')
  // Un seul jeton actif par adresse : les précédents sont invalidés.
  await prisma.verificationToken.deleteMany({ where: { identifier: email } })
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: sha256(token),
      expires: new Date(Date.now() + TOKEN_TTL_MS),
    },
  })

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3001'
  const resetUrl = `${baseUrl}/reset-password?email=${encodeURIComponent(email)}&token=${token}`

  const sent = await sendResetEmail(email, resetUrl)

  if (!sent && process.env.NODE_ENV !== 'production') {
    // Pas de service d'e-mail configuré (RESEND_API_KEY absent) : en dev
    // uniquement, le lien est renvoyé au navigateur pour pouvoir tester le
    // flux de bout en bout. Jamais en production.
    console.warn(`[forgot-password] Aucun service e-mail configuré — lien de reset : ${resetUrl}`)
    return NextResponse.json({ ok: true, devResetUrl: resetUrl })
  }

  return NextResponse.json({ ok: true })
}
