import type { Provider } from '@prisma/client'

export type GatewayInfo = {
  gateway: Provider
  currency: string
  country: string
}

// Primary FedaPay markets (Bénin, Togo, Guinée-Bissau)
const FEDAPAY_COUNTRIES = new Set(['BJ', 'TG', 'GW'])

// CinetPay markets (Côte d'Ivoire, Sénégal, Mali, Burkina, Niger, Cameroun,
// Congo, Gabon, Centrafrique, Tchad, Guinée Éq., RDC)
const CINETPAY_COUNTRIES = new Set([
  'CI', 'SN', 'ML', 'BF', 'NE',
  'CM', 'CG', 'GA', 'CF', 'TD', 'GQ', 'CD',
])

/**
 * Selects the payment gateway and currency based on the visitor's country.
 * Source: x-vercel-ip-country header (set by Vercel's edge network).
 * Falls back to Stripe/EUR for unknown or non-FCFA countries.
 */
export function detectGateway(headers: Headers): GatewayInfo {
  let country = (headers.get('x-vercel-ip-country') ?? 'XX').toUpperCase()

  // En local, le header x-vercel-ip-country n'existe pas (posé par l'edge
  // Vercel) : DEV_FORCE_COUNTRY permet de tester FedaPay/CinetPay depuis le
  // navigateur (ex. CI → CinetPay, BJ → FedaPay). Ignoré en production.
  if (process.env.NODE_ENV !== 'production' && process.env.DEV_FORCE_COUNTRY) {
    country = process.env.DEV_FORCE_COUNTRY.toUpperCase()
  }

  if (FEDAPAY_COUNTRIES.has(country)) {
    return { gateway: 'FEDAPAY', currency: 'XOF', country }
  }
  if (CINETPAY_COUNTRIES.has(country)) {
    return { gateway: 'CINETPAY', currency: 'XOF', country }
  }
  return { gateway: 'STRIPE', currency: 'EUR', country }
}

// Tolère les valeurs entourées de guillemets ou suivies d'un commentaire
// (le chargeur .env de Next.js les laisse dans la valeur) et retombe sur le
// tarif par défaut plutôt que de produire NaN.
function parsePrice(raw: string | undefined, fallback: number): number {
  const match = (raw ?? '').match(/\d+/)
  const n = match ? parseInt(match[0], 10) : NaN
  return Number.isFinite(n) && n > 0 ? n : fallback
}

export function priceForCurrency(currency: string): number {
  if (currency === 'XOF') return parsePrice(process.env.TEST_PRICE_XOF, 15000)
  if (currency === 'USD') return parsePrice(process.env.TEST_PRICE_USD_CENTS, 2500)
  return parsePrice(process.env.TEST_PRICE_EUR_CENTS, 2500) // EUR default
}
