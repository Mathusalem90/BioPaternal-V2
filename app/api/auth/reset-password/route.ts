import { createHash } from 'crypto'
import { NextResponse } from 'next/server'
import { hashPassword } from '../../../../lib/hash'
import { prisma } from '../../../../lib/prisma'

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

/**
 * POST /api/auth/reset-password — Body: { email, token, password }
 *
 * Vérifie le jeton émis par /api/auth/forgot-password (haché en base,
 * expiration 1 h, usage unique) puis remplace le mot de passe.
 * Fonctionne aussi pour un compte créé via Google sans mot de passe :
 * cela lui ajoute la connexion par identifiants.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : ''
  const token = typeof body.token === 'string' ? body.token : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (!email || !token || password.length < 8) {
    return NextResponse.json(
      { error: 'INVALID_REQUEST', message: 'Mot de passe : 8 caractères minimum.' },
      { status: 400 }
    )
  }

  const record = await prisma.verificationToken.findFirst({
    where: { identifier: email, token: sha256(token) },
  })
  if (!record || record.expires < new Date()) {
    return NextResponse.json(
      { error: 'INVALID_OR_EXPIRED_TOKEN', message: 'Lien invalide ou expiré. Refaites une demande.' },
      { status: 400 }
    )
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return NextResponse.json({ error: 'INVALID_OR_EXPIRED_TOKEN' }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { password: await hashPassword(password) },
  })
  // Usage unique — le jeton est consommé.
  await prisma.verificationToken.deleteMany({ where: { identifier: email } })

  return NextResponse.json({ ok: true })
}
