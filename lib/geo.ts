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
  const country = (headers.get('x-vercel-ip-country') ?? 'XX').toUpperCase()

  if (FEDAPAY_COUNTRIES.has(country)) {
    return { gateway: 'FEDAPAY', currency: 'XOF', country }
  }
  if (CINETPAY_COUNTRIES.has(country)) {
    return { gateway: 'CINETPAY', currency: 'XOF', country }
  }
  return { gateway: 'STRIPE', currency: 'EUR', country }
}

export function priceForCurrency(currency: string): number {
  if (currency === 'XOF') return parseInt(process.env.TEST_PRICE_XOF ?? '15000')
  if (currency === 'USD') return parseInt(process.env.TEST_PRICE_USD_CENTS ?? '2500')
  return parseInt(process.env.TEST_PRICE_EUR_CENTS ?? '2500') // EUR default
}
