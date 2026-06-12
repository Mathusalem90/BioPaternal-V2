'use client'

import { useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

/* lazy-load chart components to avoid SSR issues with canvas */
const DonutChart = dynamic(() => import('@/components/charts/DonutChart'), {
  ssr: false,
  loading: () => <ChartSkeleton />,
})
const CountryBarChart = dynamic(() => import('@/components/charts/CountryBarChart'), {
  ssr: false,
  loading: () => <ChartSkeleton />,
})

/* ── Types ────────────────────────────────── */
interface KPIs {
  totalUsers: number
  totalTests: number
  totalRevenue: number
  exclusionCount: number
  compatibilityCount: number
}

interface CountryData {
  country: string
  tests: number
  exclusions: number
  compatibilities: number
}

interface AdminUser {
  id: string
  email: string
  name: string | null
  createdAt: string
  role: string
  cguAccepted: boolean
}

interface StatsPayload {
  kpis: KPIs
  topCountries: CountryData[]
  users: AdminUser[]
  filter: { start: string; end: string }
}

type Filter = 'today' | 'week' | 'month' | 'custom'

const FILTER_LABELS: Record<Filter, string> = {
  today: "Aujourd'hui",
  week: 'Cette semaine',
  month: 'Ce mois-ci',
  custom: 'Période personnalisée',
}

/* ── Page ─────────────────────────────────── */
export default function AdminPage() {
  const [filter, setFilter] = useState<Filter>('month')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const [data, setData] = useState<StatsPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [confirmBan, setConfirmBan] = useState<string | null>(null)
  const [actionMsg, setActionMsg] = useState('')

  /* ── Fetch stats ──────────────────────────── */
  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      let url = `/api/admin/stats?filter=${filter}`
      if (filter === 'custom') {
        if (customStart) url += `&start=${customStart}`
        if (customEnd) url += `&end=${customEnd}`
      }
      const res = await fetch(url)
      if (!res.ok) throw new Error('Erreur API')
      const json: StatsPayload = await res.json()
      setData(json)
    } catch {
      setError("Impossible de charger les statistiques.")
    } finally {
      setLoading(false)
    }
  }, [filter, customStart, customEnd])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  /* ── Actions ──────────────────────────────── */
  async function banUser(userId: string) {
    setActionMsg('')
    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, { method: 'POST' })
      if (res.ok) {
        setActionMsg('Utilisateur suspendu.')
        fetchStats()
      } else {
        const d = await res.json()
        setActionMsg(d.error ?? 'Erreur')
      }
    } catch {
      setActionMsg('Erreur réseau.')
    } finally {
      setConfirmBan(null)
    }
  }

  async function resetPassword(userId: string) {
    setActionMsg('')
    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, { method: 'POST' })
      const d = await res.json()
      setActionMsg(res.ok ? 'Email de réinitialisation envoyé.' : (d.error ?? 'Erreur'))
    } catch {
      setActionMsg('Erreur réseau.')
    }
  }

  /* ── Filtered users ───────────────────────── */
  const filteredUsers = (data?.users ?? []).filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.name ?? '').toLowerCase().includes(search.toLowerCase())
  )

  /* ── Render ───────────────────────────────── */
  return (
    <div className="min-h-screen bg-ink-950 bg-grid p-8">
      {/* page header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-light text-ivory-100 mb-1">Dashboard</h1>
          {data && (
            <p className="text-slate2-500 text-xs">
              {new Date(data.filter.start).toLocaleDateString('fr-FR')} →{' '}
              {new Date(data.filter.end).toLocaleDateString('fr-FR')}
            </p>
          )}
        </div>
        <button
          onClick={fetchStats}
          className="btn-ghost text-xs py-2 px-4 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshIcon />
          Actualiser
        </button>
      </div>

      {/* ── TIME FILTER ──────────────────────── */}
      <div className="card mb-8">
        <div className="flex flex-wrap gap-2 items-center">
          {(Object.keys(FILTER_LABELS) as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150
                ${filter === f
                  ? 'bg-gold-400 border-gold-400 text-ink-950'
                  : 'bg-ink-700 border-ink-600 text-slate2-400 hover:text-ivory-200 hover:border-gold-400/30'
                }`}
            >
              {FILTER_LABELS[f]}
            </button>
          ))}

          {filter === 'custom' && (
            <div className="flex items-center gap-2 ml-2">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="input-field py-1.5 text-xs w-36"
              />
              <span className="text-slate2-600 text-xs">→</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="input-field py-1.5 text-xs w-36"
              />
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-950/50 border border-red-800/50 rounded-lg px-4 py-3 text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* ── KPI CARDS ────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <KpiSkeleton key={i} />)
          : data && [
              {
                label: 'Inscrits',
                value: data.kpis.totalUsers,
                icon: '◎',
                color: 'text-ivory-200',
              },
              {
                label: 'Tests payés',
                value: data.kpis.totalTests,
                icon: '◈',
                color: 'text-gold-300',
              },
              {
                label: 'Revenus (€)',
                value: `${data.kpis.totalRevenue.toFixed(2)}`,
                icon: '◆',
                color: 'text-gold-400',
              },
              {
                label: 'Exclusions',
                value: data.kpis.exclusionCount,
                icon: '✕',
                color: 'text-red-400',
              },
              {
                label: 'Compatibilités',
                value: data.kpis.compatibilityCount,
                icon: '—',
                color: 'text-slate2-300',
              },
            ].map((kpi) => <KpiCard key={kpi.label} {...kpi} />)}
      </div>

      {/* ── CHARTS ROW ───────────────────────── */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Donut */}
        <div className="card">
          <h2 className="text-xs text-slate2-500 tracking-widest uppercase mb-5">
            Répartition des résultats
          </h2>
          {loading ? (
            <ChartSkeleton />
          ) : (
            <DonutChart
              exclusions={data?.kpis.exclusionCount ?? 0}
              compatibilities={data?.kpis.compatibilityCount ?? 0}
            />
          )}
        </div>

        {/* Bar */}
        <div className="card">
          <h2 className="text-xs text-slate2-500 tracking-widest uppercase mb-5">
            Volume par pays (top 10)
          </h2>
          {loading ? (
            <ChartSkeleton />
          ) : (
            <CountryBarChart data={data?.topCountries ?? []} />
          )}
        </div>
      </div>

      {/* ── TOP COUNTRIES TABLE ───────────────── */}
      {data && data.topCountries.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-xs text-slate2-500 tracking-widest uppercase mb-4">
            Top pays convertisseurs
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-ink-600">
                  {['Pays', 'Tests', 'Exclusions', 'Compatibilités', 'Tx exclusion'].map((h) => (
                    <th
                      key={h}
                      className="text-left text-slate2-500 font-medium py-2 pr-4 last:pr-0"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.topCountries.map((c, i) => {
                  const rate =
                    c.tests > 0 ? ((c.exclusions / c.tests) * 100).toFixed(0) : '—'
                  return (
                    <tr key={c.country} className="border-b border-ink-700/50 last:border-0">
                      <td className="py-2.5 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-slate2-600 font-mono w-4 text-right text-[10px]">
                            {i + 1}
                          </span>
                          <span className="text-ivory-300">{c.country}</span>
                        </div>
                      </td>
                      <td className="py-2.5 pr-4 text-gold-300 font-semibold">{c.tests}</td>
                      <td className="py-2.5 pr-4 text-red-400">{c.exclusions}</td>
                      <td className="py-2.5 pr-4 text-slate2-300">{c.compatibilities}</td>
                      <td className="py-2.5 text-slate2-400">
                        {rate !== '—' ? `${rate} %` : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── USERS TABLE ───────────────────────── */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <h2 className="text-xs text-slate2-500 tracking-widest uppercase">
            Utilisateurs ({data?.users.length ?? '…'})
          </h2>
          <div className="relative">
            <SearchIcon />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par email…"
              className="input-field pl-8 py-1.5 text-xs w-full sm:w-64"
            />
          </div>
        </div>

        {actionMsg && (
          <div className="mb-4 bg-ink-700 border border-ink-600 rounded-lg px-4 py-2 text-ivory-300 text-xs">
            {actionMsg}
          </div>
        )}

        {loading ? (
          <UserTableSkeleton />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-ink-600">
                  {['ID', 'Email', 'Nom', 'Inscription', 'CGU', 'Rôle', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="text-left text-slate2-500 font-medium py-2 pr-4 last:pr-0 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate2-600">
                      {search ? 'Aucun résultat pour cette recherche' : 'Aucun utilisateur'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      onBan={() => setConfirmBan(user.id)}
                      onReset={() => resetPassword(user.id)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── BAN CONFIRM MODAL ────────────────── */}
      {confirmBan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/80 backdrop-blur-sm px-4">
          <div className="card border-red-900/50 max-w-sm w-full text-center">
            <p className="text-ivory-100 font-semibold mb-2 text-sm">Confirmer la suspension</p>
            <p className="text-slate2-400 text-xs mb-6">
              Cette action bloque l'accès de l'utilisateur à l'application. Elle est réversible
              en base de données.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setConfirmBan(null)}
                className="btn-ghost text-xs py-2 px-4"
              >
                Annuler
              </button>
              <button
                onClick={() => banUser(confirmBan)}
                className="bg-red-600 hover:bg-red-500 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Suspendre
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Sub-components ──────────────────────── */

function KpiCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: string | number
  icon: string
  color: string
}) {
  return (
    <div className="card group hover:border-gold-400/20 transition-colors duration-200">
      <div className={`text-base mb-2 ${color} opacity-60 group-hover:opacity-100 transition-opacity`}>
        {icon}
      </div>
      <div className={`font-display text-3xl font-light mb-0.5 ${color}`}>{value}</div>
      <div className="text-[10px] text-slate2-600 tracking-widest uppercase">{label}</div>
    </div>
  )
}

function UserRow({
  user,
  onBan,
  onReset,
}: {
  user: AdminUser
  onBan: () => void
  onReset: () => void
}) {
  return (
    <tr className="border-b border-ink-700/40 last:border-0 hover:bg-ink-700/20 transition-colors">
      <td className="py-3 pr-4">
        <span className="font-mono text-slate2-600 text-[10px]">{user.id.slice(0, 8)}…</span>
      </td>
      <td className="py-3 pr-4 text-ivory-300 max-w-[180px] truncate">{user.email}</td>
      <td className="py-3 pr-4 text-slate2-400">{user.name ?? '—'}</td>
      <td className="py-3 pr-4 text-slate2-500 whitespace-nowrap">
        {new Date(user.createdAt).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })}
      </td>
      <td className="py-3 pr-4">
        {user.cguAccepted ? (
          <span className="text-[10px] text-emerald-400 bg-emerald-400/8 px-2 py-0.5 rounded-full">
            Oui
          </span>
        ) : (
          <span className="text-[10px] text-red-400 bg-red-400/8 px-2 py-0.5 rounded-full">
            Non
          </span>
        )}
      </td>
      <td className="py-3 pr-4">
        {user.role === 'ADMIN' ? (
          <span className="text-[10px] text-gold-400 bg-gold-400/8 px-2 py-0.5 rounded-full">
            Admin
          </span>
        ) : (
          <span className="text-[10px] text-slate2-400 bg-slate2-600/15 px-2 py-0.5 rounded-full">
            User
          </span>
        )}
      </td>
      <td className="py-3">
        <div className="flex gap-2">
          <button
            onClick={onReset}
            title="Réinitialiser le mot de passe"
            className="p-1.5 rounded-md bg-ink-700 border border-ink-600 text-slate2-400 hover:text-ivory-200 hover:border-gold-400/40 transition-colors"
          >
            <KeyIcon />
          </button>
          {user.role !== 'ADMIN' && (
            <button
              onClick={onBan}
              title="Suspendre l'utilisateur"
              className="p-1.5 rounded-md bg-ink-700 border border-ink-600 text-slate2-400 hover:text-red-400 hover:border-red-700/50 transition-colors"
            >
              <BanIcon />
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

/* ── Skeletons ────────────────────────────── */
function KpiSkeleton() {
  return <div className="card animate-pulse bg-ink-800 h-28" />
}
function ChartSkeleton() {
  return <div className="animate-pulse bg-ink-700 rounded-xl h-44 w-full" />
}
function UserTableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="animate-pulse bg-ink-700 rounded-lg h-10 w-full" />
      ))}
    </div>
  )
}

/* ── Icons ────────────────────────────────── */
function RefreshIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  )
}
function SearchIcon() {
  return (
    <svg
      className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate2-600 pointer-events-none"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  )
}
function KeyIcon() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
      />
    </svg>
  )
}
function BanIcon() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
      />
    </svg>
  )
}
