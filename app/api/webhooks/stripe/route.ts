import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '../../../../lib/prisma'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiVersion: '2023-10-16' as any,
  })
}

async function upsertGlobalStat(country: string, resultType: string): Promise<void> {
  const date = new Date()
  date.setUTCHours(0, 0, 0, 0)
  const isExclusion = resultType === 'EXCLUSION'

  await prisma.globalStat.upsert({
    where: { date_country: { date, country } },
    create: {
      date,
      country,
      exclusionCount: isExclusion ? 1 : 0,
      compatibilityCount: isExclusion ? 0 : 1,
    },
    update: isExclusion
      ? { exclusionCount: { increment: 1 } }
      : { compatibilityCount: { increment: 1 } },
  })
}

export async function POST(req: Request) {
  const rawBody = await req.text()
  const sig = req.headers.get('stripe-signature') ?? ''
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    return new NextResponse('Webhook secret not configured', { status: 500 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err) {
    return new NextResponse(
      `Webhook signature verification failed: ${(err as Error).message}`,
      { status: 400 },
    )
  }

  if (event.type !== 'checkout.session.completed') {
    return new NextResponse('OK', { status: 200 })
  }

  const session = event.data.object as Stripe.Checkout.Session

  if (session.payment_status !== 'paid') {
    return new NextResponse('OK', { status: 200 })
  }

  const transaction = await prisma.transaction.findFirst({
    where: { providerRef: session.id },
    select: { id: true, country: true, resultType: true },
  })

  if (!transaction) {
    return new NextResponse('OK', { status: 200 })
  }

  await prisma.transaction.update({
    where: { id: transaction.id },
    data: { status: 'SUCCESSFUL' },
  })

  if (transaction.resultType) {
    try {
      await upsertGlobalStat(transaction.country, transaction.resultType)
    } catch {
      // Non-blocking: stat failure must never fail the webhook acknowledgement
    }
  }

  return new NextResponse('OK', { status: 200 })
}
