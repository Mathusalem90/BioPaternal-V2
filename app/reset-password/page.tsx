'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get('email') ?? ''
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const linkInvalid = !email || !token

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Mot de passe trop court (8 caractères min.)'); return }
    if (password !== confirm) { setError('Les deux mots de passe ne correspondent pas.'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message ?? 'Lien invalide ou expiré. Refaites une demande.')
        return
      }
      setDone(true)
      setTimeout(() => router.push('/login'), 2500)
    } catch {
      setError('Erreur réseau. Réessayez.')
    } finally {
      setLoading(false)
    }
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
        width: '100%', maxWidth: 440,
        background: '#fff', borderRadius: 24,
        boxShadow: '0 8px 40px -12px rgba(16,8,6,.22), 0 2px 8px rgba(16,8,6,.08)',
        padding: '40px 36px',
      }}>
        <div style={{
          fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase',
          color: 'rgba(255,74,28,.8)', fontWeight: 600, marginBottom: 8,
          fontFamily: 'var(--font-mono)',
        }}>
          Récupération de compte
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.02em', marginBottom: 10, color: '#100806' }}>
          Nouveau mot de passe
        </h1>

        {linkInvalid ? (
          <div>
            <p style={{ fontSize: 13.5, color: 'rgba(16,8,6,.6)', lineHeight: 1.6, marginBottom: 18 }}>
              Ce lien est incomplet. Refaites une demande de réinitialisation.
            </p>
            <Link href="/forgot-password" style={{ fontSize: 13, color: '#FF4A1C', textDecoration: 'none' }}>
              → Demander un nouveau lien
            </Link>
          </div>
        ) : done ? (
          <p style={{ fontSize: 13.5, color: 'rgba(16,8,6,.6)', lineHeight: 1.6 }}>
            ✓ Mot de passe mis à jour. Redirection vers la connexion…
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <p style={{ fontSize: 13.5, color: 'rgba(16,8,6,.55)', lineHeight: 1.6, marginBottom: 20 }}>
              Choisissez un nouveau mot de passe pour <strong>{email}</strong>.
            </p>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(16,8,6,.6)', marginBottom: 6 }}>
              Nouveau mot de passe
            </label>
            <input
              className="inp" type="password" placeholder="8 caractères min." required minLength={8}
              value={password} onChange={e => setPassword(e.target.value)}
              style={{ marginBottom: 13 }}
            />
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(16,8,6,.6)', marginBottom: 6 }}>
              Confirmer le mot de passe
            </label>
            <input
              className="inp" type="password" placeholder="••••••••" required minLength={8}
              value={confirm} onChange={e => setConfirm(e.target.value)}
              style={{ marginBottom: 16 }}
            />
            {error && (
              <div style={{
                marginBottom: 14, padding: '10px 14px',
                background: 'rgba(179,38,30,.07)', border: '1.5px solid rgba(179,38,30,.2)',
                borderRadius: 10, fontSize: 13, color: '#B3261E',
              }}>
                {error}
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-cta" style={{
              width: '100%', padding: 13, borderRadius: 11, fontSize: 15, fontWeight: 700,
            }}>
              {loading ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  // useSearchParams impose une frontière Suspense au build (page statique)
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  )
}
