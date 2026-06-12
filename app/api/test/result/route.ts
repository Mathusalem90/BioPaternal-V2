import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  const transactionId = req.nextUrl.searchParams.get('transactionId')
  if (!transactionId) {
    return NextResponse.json({ error: 'transactionId requis.' }, { status: 400 })
  }

  const tx = await prisma.transaction.findUnique({
    where: { id: transactionId },
    select: { userId: true, status: true, resultType: true, createdAt: true },
  })

  if (!tx || tx.userId !== session.user.id) {
    return NextResponse.json({ error: 'Transaction introuvable.' }, { status: 404 })
  }

  if (tx.status !== 'SUCCESSFUL') {
    return NextResponse.json({ error: 'Paiement non complété.' }, { status: 402 })
  }

  return NextResponse.json({
    visual: tx.resultType,
    transactionId,
    date: tx.createdAt.toISOString(),
  })
}
