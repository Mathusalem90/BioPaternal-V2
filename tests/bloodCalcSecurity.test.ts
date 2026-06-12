import { describe, it, expect } from 'vitest'

describe('bloodCalc security guard', () => {
  it('throws if a global prisma instance exists', async () => {
    const previousPrisma = (globalThis as any).prisma
    try {
      ;(globalThis as any).prisma = { some: 'value' }
      const url = new URL('../lib/bloodCalc.ts?cachebuster=' + Date.now(), import.meta.url)
      await expect(import(url.href)).rejects.toThrow(
        'Security: lib/bloodCalc must not access Prisma or perform DB operations'
      )
    } finally {
      if (previousPrisma === undefined) {
        delete (globalThis as any).prisma
      } else {
        ;(globalThis as any).prisma = previousPrisma
      }
    }
  })
})
