import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

const CINETPAY_CHECK_URL = 'https://api-checkout.cinetpay.com/v2/payment/check'

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
 * POST /api/webhooks/cinetpay
 *
 * CinetPay notifie en x-www-form-urlencoded ; `cpm_trans_id` contient notre
 * propre id de Transaction (envoyé comme `transaction_id` à l'initiation).
 *
 * Sécurité : le contenu de la notification n'est JAMAIS considéré comme une
 * preuve de paiement. Conformément aux recommandations CinetPay, le statut
 * réel est revérifié serveur-à-serveur via /v2/payment/check, authentifié
 * par notre apikey + site_id. Un attaquant qui forge une notification ne
 * peut donc pas débloquer un rapport.
 *
 * Sur ACCEPTED :
 *   1. Transaction → SUCCESSFUL
 *   2. Upsert GlobalStat (anonyme — aucun lien vers user ou transaction)
 */
export async function POST(req: Request) {
  const apiKey = process.env.CINETPAY_API_KEY
  const siteId = process.env.CINETPAY_SITE_ID
  if (!apiKey || !siteId) {
    return new NextResponse('CinetPay not configured', { status: 500 })
  }

  // CinetPay envoie du x-www-form-urlencoded ; le JSON est toléré pour les
  // tests manuels.
  let transactionId = ''
  try {
    const contentType = req.headers.get('content-type') ?? ''
    if (contentType.includes('application/json')) {
      const body = (await req.json()) as Record<string, unknown>
      transactionId = String(body.cpm_trans_id ?? body.transaction_id ?? '')
    } else {
      const form = await req.formData()
      transactionId = String(form.get('cpm_trans_id') ?? '')
    }
  } catch {
    return new NextResponse('Invalid payload', { status: 400 })
  }
  if (!transactionId) {
    return new NextResponse('Missing cpm_trans_id', { status: 400 })
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    select: { id: true, provider: true, status: true, country: true, resultType: true },
  })

  // Transaction inconnue ou d'un autre prestataire : on acquitte (200) pour
  // stopper les retentatives CinetPay, sans rien modifier.
  if (!transaction || transaction.provider !== 'CINETPAY') {
    return new NextResponse('OK', { status: 200 })
  }

  // Idempotence : les notifications peuvent arriver plusieurs fois.
  if (transaction.status === 'SUCCESSFUL') {
    return new NextResponse('OK', { status: 200 })
  }

  // Vérification du statut réel auprès de CinetPay (source de vérité).
  let status: string | undefined
  try {
    const checkRes = await fetch(CINETPAY_CHECK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apikey: apiKey, site_id: siteId, transaction_id: transactionId }),
    })
    const check = (await checkRes.json()) as { code?: string; data?: { status?: string } }
    status = check?.data?.status
  } catch {
    // CinetPay réessaiera la notification — 502 pour signaler l'échec.
    return new NextResponse('Payment check failed', { status: 502 })
  }

  if (status === 'ACCEPTED') {
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: 'SUCCESSFUL' },
    })

    // RGPD : incrément anonyme — aucun id écrit, aucune relation créée.
    if (transaction.resultType) {
      try {
        await upsertGlobalStat(transaction.country, transaction.resultType)
      } catch {
        // Non bloquant : un échec de stat ne doit jamais faire échouer l'acquittement.
      }
    }
  } else if (status === 'REFUSED') {
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: 'FAILED' },
    })
  }
  // Autres statuts (WAITING_FOR_CUSTOMER…) : acquitter sans rien changer,
  // CinetPay notifiera à nouveau au prochain changement d'état.

  return new NextResponse('OK', { status: 200 })
}
