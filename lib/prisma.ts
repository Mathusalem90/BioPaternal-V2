import { PrismaClient } from '@prisma/client'

declare global {
  // Stocké sous `__prisma` (et non `prisma`) : lib/bloodCalc possède un garde
  // de sécurité qui jette si un global `prisma` existe. Avec l'ancien nom, le
  // singleton de dev déclenchait ce garde et toute l'API /api/test/analyze
  // répondait 500 dès qu'une route Prisma avait été chargée avant elle.
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

const client = globalThis.__prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = client
}

export const prisma = client
