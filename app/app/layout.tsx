'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

function LogoDNA() {
  return (
    <svg width="22" height="26" viewBox="0 0 80 96" fill="none" aria-hidden>
      <path d="M40 4 L76 16 L76 48 Q76 76 40 92 Q4 76 4 48 L4 16 Z" stroke="url(#bpGrad)" strokeWidth="5.5" strokeLinejoin="round"/>
      <path d="M40 17 C61 22 61 33 40 38 C19 43 19 54 40 59 C61 64 61 75 40 80" stroke="url(#bpGrad)" strokeWidth="3.2" strokeLinecap="round"/>
      <path d="M40 17 C19 22 19 33 40 38 C61 43 61 54 40 59 C19 64 19 75 40 80" stroke="url(#bpGrad)" strokeWidth="3.2" strokeLinecap="round"/>
      <line x1="24" y1="27" x2="56" y2="27" stroke="url(#bpGrad)" strokeWidth="2.5" strokeLinecap="round" opacity="0.65"/>
      <line x1="24" y1="48" x2="56" y2="48" stroke="url(#bpGrad)" strokeWidth="2.5" strokeLinecap="round" opacity="0.65"/>
      <line x1="24" y1="69" x2="56" y2="69" stroke="url(#bpGrad)" strokeWidth="2.5" strokeLinecap="round" opacity="0.65"/>
    </svg>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: '#FFFBF7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 999,
            border: '3px solid rgba(16,8,6,.08)', borderTopColor: '#FF4A1C',
            animation: 'spin 1s linear infinite',
          }} />
          <span style={{ fontSize: 13, color: 'rgba(16,8,6,.4)', fontFamily: 'var(--font-mono)' }}>
            Chargement…
          </span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!session) return null

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA' }}>
      {/* Top bar */}
      <div style={{
        background: '#fff', borderBottom: '1px solid rgba(16,8,6,.08)',
        padding: '12px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <LogoDNA />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#100806' }}>BioPaternal</span>
          </Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: 999, background: '#22c55e' }} />
          <span style={{ fontSize: 12.5, color: 'rgba(16,8,6,.5)' }}>
            {session.user?.email}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            style={{
              padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(16,8,6,.1)',
              background: 'transparent', fontSize: 11.5, cursor: 'pointer',
              color: 'rgba(16,8,6,.5)', fontFamily: 'inherit',
            }}
          >
            Déconnexion
          </button>
        </div>
      </div>

      <main>{children}</main>
    </div>
  )
}
