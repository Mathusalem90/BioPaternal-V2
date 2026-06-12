import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'

// Consent status for the signed-in user. /app/layout.tsx calls this to
// redirect Google users who haven't accepted the CGU yet.
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  const consent = await prisma.consent.findFirst({
    where: { userId: session.user.id },
  })
  return NextResponse.json({ accepted: !!consent })
}

// Records CGU + privacy acceptance for the signed-in user. The user is
// identified by the session, never by a client-supplied id.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  const body = await req.json()
  if (body.cguAccepted !== true || body.privacyAccepted !== true) {
    return NextResponse.json({ error: 'INVALID_REQUEST' }, { status: 400 })
  }

  const existing = await prisma.consent.findFirst({
    where: { userId: session.user.id },
  })
  if (!existing) {
    await prisma.consent.create({
      data: {
        userId: session.user.id,
        cguAccepted: true,
        privacyAccepted: true,
        version: '1.0.0',
        acceptedAt: new Date(),
      },
    })
  }

  return NextResponse.json({ ok: true })
}
