'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function ConsentForm() {
  const [cgu, setCgu] = useState(false)
  const [privacy, setPrivacy] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!cgu || !privacy) { setError('Veuillez cocher les deux cases.'); return }

    setLoading(true)
    setError('')

    // L'utilisateur est identifié par sa session NextAuth (créée par la
    // connexion Google) — aucun identifiant n'est passé par l'URL.
    const res = await fetch('/api/auth/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cguAccepted: true, privacyAccepted: true }),
    })

    if (res.status === 401) {
      // Session expirée ou absente — repasser par la connexion.
      router.push('/login')
      return
    }
    if (!res.ok) {
      setLoading(false)
      setError('Une erreur est survenue. Réessayez ou contactez le support.')
      return
    }

    router.push('/app/test')
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#FFFBF7',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, position: 'relative',
    }}>
      <div className="stage-bg" />
      <div className="grain" />

      <div style={{
        position: 'relative', zIndex: 5,
        width: '100%', maxWidth: 480,
        background: '#fff',
        borderRadius: 24,
        boxShadow: '0 8px 40px -12px rgba(16,8,6,.22), 0 2px 8px rgba(16,8,6,.08)',
        padding: '44px 40px',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 32 }}>
          <svg width="24" height="29" viewBox="0 0 80 96" fill="none" aria-hidden>
            <defs>
              <linearGradient id="cg" x1="0" y1="0" x2="80" y2="96" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FF4A1C" /><stop offset="1" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
            <path d="M40 4 L76 16 L76 48 Q76 76 40 92 Q4 76 4 48 L4 16 Z" stroke="url(#cg)" strokeWidth="5.5" strokeLinejoin="round"/>
            <path d="M40 17 C61 22 61 33 40 38 C19 43 19 54 40 59 C61 64 61 75 40 80" stroke="url(#cg)" strokeWidth="3.2" strokeLinecap="round"/>
            <path d="M40 17 C19 22 19 33 40 38 C61 43 61 54 40 59 C19 64 19 75 40 80" stroke="url(#cg)" strokeWidth="3.2" strokeLinecap="round"/>
            <line x1="24" y1="27" x2="56" y2="27" stroke="url(#cg)" strokeWidth="2.5" strokeLinecap="round" opacity="0.65"/>
            <line x1="24" y1="48" x2="56" y2="48" stroke="url(#cg)" strokeWidth="2.5" strokeLinecap="round" opacity="0.65"/>
            <line x1="24" y1="69" x2="56" y2="69" stroke="url(#cg)" strokeWidth="2.5" strokeLinecap="round" opacity="0.65"/>
          </svg>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#100806' }}>BioPaternal</span>
        </div>

        {/* Heading */}
        <div style={{
          fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase',
          color: 'rgba(255,74,28,.8)', fontWeight: 600, marginBottom: 8,
          fontFamily: 'var(--font-mono)',
        }}>
          Connexion Google
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1.2, marginBottom: 10, color: '#100806' }}>
          Une dernière étape
        </h1>
        <p style={{ fontSize: 13.5, color: 'rgba(16,8,6,.55)', lineHeight: 1.6, marginBottom: 28 }}>
          Pour finaliser votre inscription via Google, veuillez accepter nos conditions d&apos;utilisation et notre politique de confidentialité.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 22 }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 11, cursor: 'pointer' }}>
              <input
                type="checkbox" checked={cgu} onChange={e => setCgu(e.target.checked)}
                style={{ marginTop: 3, flexShrink: 0, accentColor: '#FF4A1C', width: 15, height: 15, cursor: 'pointer' }}
              />
              <span style={{ fontSize: 13, color: 'rgba(16,8,6,.65)', lineHeight: 1.55 }}>
                J&apos;accepte les{' '}
                <Link href="/politique-de-confidentialite" target="_blank"
                  style={{ color: '#FF4A1C', textDecoration: 'underline', textUnderlineOffset: 2 }}>
                  Conditions générales d&apos;utilisation
                </Link>
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 11, cursor: 'pointer' }}>
              <input
                type="checkbox" checked={privacy} onChange={e => setPrivacy(e.target.checked)}
                style={{ marginTop: 3, flexShrink: 0, accentColor: '#FF4A1C', width: 15, height: 15, cursor: 'pointer' }}
              />
              <span style={{ fontSize: 13, color: 'rgba(16,8,6,.65)', lineHeight: 1.55 }}>
                J&apos;accepte la{' '}
                <Link href="/politique-de-confidentialite" target="_blank"
                  style={{ color: '#FF4A1C', textDecoration: 'underline', textUnderlineOffset: 2 }}>
                  Politique de confidentialité
                </Link>{' '}
                et le traitement de mes données conformément au RGPD.
              </span>
            </label>
          </div>

          {error && (
            <div style={{
              marginBottom: 14, padding: '10px 14px',
              background: 'rgba(179,38,30,.07)', border: '1.5px solid rgba(179,38,30,.2)',
              borderRadius: 10, fontSize: 13, color: '#B3261E',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !cgu || !privacy}
            className="btn-cta"
            style={{
              width: '100%', padding: 13, borderRadius: 11,
              fontSize: 15, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: (!cgu || !privacy || loading) ? 0.5 : 1,
            }}
          >
            {loading ? 'Redirection…' : 'Accepter et continuer'}
            {!loading && (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10m0 0L9 4m4 4l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Link href="/login" style={{ fontSize: 12, color: 'rgba(16,8,6,.35)', textDecoration: 'none' }}>
            ← Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  )
}
