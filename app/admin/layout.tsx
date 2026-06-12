import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as { role?: string } | undefined)?.role

  if (!session || role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-ink-950 flex">
      {/* ── Sidebar ──────────────────────────── */}
      <aside className="w-52 shrink-0 glass border-r border-ink-700 flex flex-col fixed inset-y-0 left-0 z-40">
        {/* logo */}
        <div className="p-5 border-b border-ink-700">
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center">
              <span className="text-ink-950 font-display font-semibold text-[10px] leading-none">
                B
              </span>
            </div>
            <span className="font-display text-base font-medium text-ivory-100">BioPaternal</span>
          </div>
          <span className="text-[10px] text-gold-400 tracking-[0.2em] uppercase">
            Administration
          </span>
        </div>

        {/* nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          <SidebarLink href="/admin" icon="◈" label="Dashboard" />
        </nav>

        {/* footer */}
        <div className="p-4 border-t border-ink-700">
          <Link
            href="/"
            className="text-[11px] text-slate2-600 hover:text-slate2-400 transition-colors"
          >
            ← Site public
          </Link>
        </div>
      </aside>

      {/* ── Content ──────────────────────────── */}
      <main className="flex-1 ml-52 min-h-screen">{children}</main>
    </div>
  )
}

function SidebarLink({
  href,
  icon,
  label,
}: {
  href: string
  icon: string
  label: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-slate2-400 hover:text-ivory-200 hover:bg-ink-700 transition-colors text-xs"
    >
      <span className="text-gold-400/60">{icon}</span>
      {label}
    </Link>
  )
}
