import { NextResponse } from 'next/server'
import { hashPassword } from '../../../../lib/hash'
import { prisma } from '../../../../lib/prisma'

function isValidEmail(value: unknown): value is string {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export async function POST(req: Request) {
  const body = await req.json()
  const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const cguAccepted = body.cguAccepted === true
  const privacyAccepted = body.privacyAccepted === true
  const name = typeof body.name === 'string' ? body.name.trim() : null

  if (!isValidEmail(email) || password.length < 8 || !cguAccepted || !privacyAccepted) {
    return NextResponse.json(
      {
        error: 'INVALID_REQUEST',
        message: 'Email, password, cguAccepted and privacyAccepted are required. Password must be at least 8 characters.',
      },
      { status: 400 }
    )
  }

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return NextResponse.json({ error: 'EMAIL_ALREADY_EXISTS', message: 'A user already exists with this email.' }, { status: 409 })
  }

  const hashedPassword = await hashPassword(password)
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: 'USER',
      Consents: {
        create: {
          cguAccepted: true,
          privacyAccepted: true,
          version: '1.0.0',
          acceptedAt: new Date(),
        },
      },
    },
  })

  return NextResponse.json(
    { id: user.id, email: user.email, role: user.role },
    { status: 201 }
  )
}
