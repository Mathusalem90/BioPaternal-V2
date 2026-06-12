import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import Stripe from 'stripe'
import { prisma } from '../../../../lib/prisma'
import { verifyEphemeralToken } from '../../../../lib/ephemeral-token'
import { detectGateway, priceForCurrency } from '../../../../lib/geo'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiVersion: '2023-10-16' as any,
  })
}

const BASE_URL = process.env.NEXTAUTH_URL!

/**
 * POST /api/test/payment-intent
 * Auth: required (NextAuth JWT session).
 *
 * Verifies the ephemeral token from /api/test/analyze, creates a PENDING
 * Transaction, then initiates a payment session with the correct gateway
 * (Stripe for international, FedaPay/CinetPay for FCFA zone).
 *
 * Body: { token: string }   — ephemeral JWT from /api/test/analyze
 * Response: { paymentUrl: string }
 */
export async function POST(req: NextRequest) {
  // 1. Auth check
  const authToken = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!authToken?.sub || !authToken?.email) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  // 2. Parse body
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 })
  }

  const ephemeralToken = (body as Record<string, unknown>).token
  if (typeof ephemeralToken !== 'string') {
    return NextResponse.json({ error: 'MISSING_TOKEN' }, { status: 400 })
  }

  // 3. Verify ephemeral token (throws if expired or tampered)
  let resultType: string
  try {
    const payload = await verifyEphemeralToken(ephemeralToken)
    resultType = payload.resultType
  } catch {
    return NextResponse.json({ error: 'INVALID_OR_EXPIRED_TOKEN' }, { status: 400 })
  }

  // 4. Detect gateway and currency from visitor's IP country
  const { gateway, currency, country } = detectGateway(req.headers)
  const amount = priceForCurrency(currency)

  // 5. Create PENDING transaction (no providerRef yet)
  const transaction = await prisma.transaction.create({
    data: {
      userId: authToken.sub,
      amount,
      currency,
      country,
      provider: gateway,
      status: 'PENDING',
      resultType,
    },
  })

  // 6. Initiate payment with the selected gateway
  let paymentUrl: string

  try {
    if (gateway === 'STRIPE') {
      paymentUrl = await createStripeSession(transaction.id, currency, amount, authToken.email as string)
    } else if (gateway === 'FEDAPAY') {
      paymentUrl = await createFedapaySession(transaction.id, amount, authToken.email as string)
    } else {
      // CINETPAY
      paymentUrl = await createCinetpaySession(transaction.id, amount, authToken.email as string)
    }
  } catch (err) {
    // If gateway call fails, mark transaction as FAILED to avoid dangling PENDING records
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: 'FAILED' },
    })
    throw err
  }

  return NextResponse.json({ paymentUrl })
}

// ── Stripe ──────────────────────────────────────────────────────────────────

async function createStripeSession(
  transactionId: string,
  currency: string,
  amountCents: number,
  email: string,
): Promise<string> {
  const session = await getStripe().checkout.sessions.create({
    payment_method_types: ['card'],
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: currency.toLowerCase(),
          product_data: { name: 'BioPaternal — Rapport complet' },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${BASE_URL}/app/result?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${BASE_URL}/app/test`,
    metadata: { transactionId },
  })

  // Store Stripe session ID for webhook correlation
  await prisma.transaction.update({
    where: { id: transactionId },
    data: { providerRef: session.id },
  })

  if (!session.url) throw new Error('Stripe did not return a session URL')
  return session.url
}

// ── FedaPay ──────────────────────────────────────────────────────────────────

async function createFedapaySession(
  transactionId: string,
  amount: number,
  email: string,
): Promise<string> {
  const FEDAPAY_API = 'https://api.fedapay.com/v1'
  const auth = `Bearer ${process.env.FEDAPAY_SECRET_KEY}`

  // Create transaction
  const txRes = await fetch(`${FEDAPAY_API}/transactions`, {
    method: 'POST',
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      description: `BioPaternal — Rapport complet`,
      amount,
      currency: { iso: 'XOF' },
      callback_url: `${BASE_URL}/api/webhooks/fedapay`,
      customer: { email },
    }),
  })
  if (!txRes.ok) throw new Error(`FedaPay create transaction failed: ${txRes.status}`)
  const txData = (await txRes.json()) as { 'v1/transaction': { id: number } }
  const fedapayId = txData['v1/transaction'].id

  // Generate payment token
  const tokenRes = await fetch(`${FEDAPAY_API}/transactions/${fedapayId}/token`, {
    method: 'POST',
    headers: { Authorization: auth },
  })
  if (!tokenRes.ok) throw new Error(`FedaPay token generation failed: ${tokenRes.status}`)
  const { token } = (await tokenRes.json()) as { token: string }

  // Store FedaPay integer ID for webhook correlation
  await prisma.transaction.update({
    where: { id: transactionId },
    data: { providerRef: String(fedapayId) },
  })

  return `https://app.fedapay.com/checkout?id=${fedapayId}&token=${token}`
}

// ── CinetPay ─────────────────────────────────────────────────────────────────

async function createCinetpaySession(
  transactionId: string,
  amount: number,
  email: string,
): Promise<string> {
  const res = await fetch('https://api-checkout.cinetpay.com/v2/payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apikey: process.env.CINETPAY_API_KEY,
      site_id: process.env.CINETPAY_SITE_ID,
      transaction_id: transactionId, // our ID — echoed back in webhook
      amount,
      currency: 'XOF',
      description: 'BioPaternal — Rapport complet',
      notify_url: `${BASE_URL}/api/webhooks/cinetpay`,
      return_url: `${BASE_URL}/app/result`,
      lang: 'fr',
      channels: 'ALL',
      customer_email: email,
    }),
  })
  if (!res.ok) throw new Error(`CinetPay initiation failed: ${res.status}`)

  const data = (await res.json()) as { data: { payment_url: string; payment_token: string } }

  // Store CinetPay payment token as providerRef
  await prisma.transaction.update({
    where: { id: transactionId },
    data: { providerRef: data.data.payment_token },
  })

  return data.data.payment_url
}
