import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { prisma } from '../../../../lib/prisma'

/**
 * Verifies the FedaPay webhook HMAC-SHA256 signature.
 * Header: X-FedaPay-Signature: <hex-digest>
 * Computed: HMAC-SHA256(rawBody, FEDAPAY_WEBHOOK_SECRET) → hex
 * Uses timingSafeEqual to prevent timing attacks.
 */
function verifyFedapaySignature(rawBody: string, signature: string, secret: string): boolean {
  try {
    const computed = createHmac('sha256', secret).update(rawBody).digest('hex')
    const sigBuf = Buffer.from(signature.toLowerCase(), 'hex')
    const computedBuf = Buffer.from(computed, 'hex')
    if (sigBuf.length !== computedBuf.length) return false
    return timingSafeEqual(sigBuf, computedBuf)
  } catch {
    return false
  }
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

/**
 * POST /api/webhooks/fedapay
 *
 * FedaPay sends events signed with HMAC-SHA256. We verify the signature first,
 * then on `transaction.approved`:
 *   1. Update Transaction → SUCCESSFUL
 *   2. Upsert GlobalStat (anonymous — zero link to user or transaction)
 *
 * Webhook secret is configured in the FedaPay dashboard under "Webhooks".
 * Verify FedaPay's exact header name against their current API docs if needed.
 */
export async function POST(req: Request) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-fedapay-signature') ?? ''
  const webhookSecret = process.env.FEDAPAY_WEBHOOK_SECRET

  if (!webhookSecret) {
    return new NextResponse('Webhook secret not configured', { status: 500 })
  }

  // Signature verification — rejects any event not signed by FedaPay
  if (!verifyFedapaySignature(rawBody, signature, webhookSecret)) {
    return new NextResponse('Invalid webhook signature', { status: 400 })
  }

  let event: Record<string, unknown>
  try {
    event = JSON.parse(rawBody) as Record<string, unknown>
  } catch {
    return new NextResponse('Invalid JSON payload', { status: 400 })
  }

  // Only process approved transactions
  if (event.name !== 'transaction.approved') {
    return new NextResponse('OK', { status: 200 })
  }

  const data = event.data as Record<string, unknown>
  const obj = data?.object as Record<string, unknown>
  const fedapayId = obj?.id

  if (!fedapayId) {
    return new NextResponse('Missing transaction id', { status: 400 })
  }

  const transaction = await prisma.transaction.findFirst({
    where: { providerRef: String(fedapayId) },
  })

  if (!transaction) {
    // Acknowledge to prevent FedaPay retries for unrelated events
    return new NextResponse('OK', { status: 200 })
  }

  // 1. Mark transaction as successful
  await prisma.transaction.update({
    where: { id: transaction.id },
    data: { status: 'SUCCESSFUL' },
  })

  // 2. RGPD: anonymous stat increment — no ID written, no relation created
  if (transaction.resultType) {
    try {
      await upsertGlobalStat(transaction.country, transaction.resultType)
    } catch {
      // Non-blocking: a stat failure must never fail the webhook acknowledgement
    }
  }

  return new NextResponse('OK', { status: 200 })
}
