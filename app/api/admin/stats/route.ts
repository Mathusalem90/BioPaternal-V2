import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function getDateRange(
  filter: string,
  customStart?: string | null,
  customEnd?: string | null
): { start: Date; end: Date } {
  const now = new Date()
  let start: Date

  switch (filter) {
    case 'today':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      break
    case 'week':
      start = new Date(now)
      start.setDate(now.getDate() - 7)
      break
    case 'custom':
      start = customStart ? new Date(customStart) : new Date(now.getFullYear(), now.getMonth(), 1)
      break
    default: // month
      start = new Date(now.getFullYear(), now.getMonth(), 1)
  }

  const end =
    filter === 'custom' && customEnd ? new Date(customEnd) : now

  return { start, end }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!session || role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const url = req.nextUrl
  const filter = url.searchParams.get('filter') ?? 'month'
  const { start, end } = getDateRange(
    filter,
    url.searchParams.get('start'),
    url.searchParams.get('end')
  )

  const [totalUsers, successfulTxs, globalStats, allUsers] = await Promise.all([
    prisma.user.count(),

    prisma.transaction.findMany({
      where: { status: 'SUCCESSFUL', createdAt: { gte: start, lte: end } },
      select: { id: true, amount: true, currency: true, country: true, createdAt: true },
    }),

    prisma.globalStat.findMany({
      where: { date: { gte: start, lte: end } },
    }),

    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        role: true,
        Consents: {
          select: { cguAccepted: true },
          orderBy: { acceptedAt: 'desc' },
          take: 1,
        },
      },
    }),
  ])

  /* KPIs */
  const totalRevenue = successfulTxs.reduce((sum, t) => sum + Number(t.amount), 0)
  const exclusionCount = globalStats.reduce((s, g) => s + g.exclusionCount, 0)
  const compatibilityCount = globalStats.reduce((s, g) => s + g.compatibilityCount, 0)

  /* Country breakdown */
  const countryMap: Record<string, { tests: number; exclusions: number; compatibilities: number }> =
    {}
  for (const stat of globalStats) {
    if (!countryMap[stat.country]) {
      countryMap[stat.country] = { tests: 0, exclusions: 0, compatibilities: 0 }
    }
    countryMap[stat.country].tests += stat.exclusionCount + stat.compatibilityCount
    countryMap[stat.country].exclusions += stat.exclusionCount
    countryMap[stat.country].compatibilities += stat.compatibilityCount
  }
  const topCountries = Object.entries(countryMap)
    .sort(([, a], [, b]) => b.tests - a.tests)
    .slice(0, 10)
    .map(([country, stats]) => ({ country, ...stats }))

  /* Users list */
  const users = allUsers.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    createdAt: u.createdAt.toISOString(),
    role: u.role,
    cguAccepted: u.Consents[0]?.cguAccepted ?? false,
  }))

  return NextResponse.json({
    kpis: {
      totalUsers,
      totalTests: successfulTxs.length,
      totalRevenue,
      exclusionCount,
      compatibilityCount,
    },
    topCountries,
    users,
    filter: { start: start.toISOString(), end: end.toISOString() },
  })
}
