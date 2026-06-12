'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [devResetUrl, setDevResetUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError('Une erreur est survenue. Réessayez.')
        return
      }
      setSent(true)
      if (data.devResetUrl) setDevResetUrl(data.devResetUrl)
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
          Mot de passe oublié
        </h1>

        {sent ? (
          <div>
            <p style={{ fontSize: 13.5, color: 'rgba(16,8,6,.6)', lineHeight: 1.6, marginBottom: 18 }}>
              Si un compte existe avec l&apos;adresse <strong>{email}</strong>, un lien de
              réinitialisation (valable 1&nbsp;heure) vient de lui être envoyé.
            </p>
            {devResetUrl && (
              <div style={{
                marginBottom: 18, padding: '12px 14px',
                background: 'rgba(245,158,11,.08)', border: '1.5px solid rgba(245,158,11,.25)',
                borderRadius: 10, fontSize: 12.5, lineHeight: 1.5, wordBreak: 'break-all',
              }}>
                <strong>Mode développement</strong> (aucun service e-mail configuré) :{' '}
                <a href={devResetUrl} style={{ color: '#FF4A1C' }}>ouvrir le lien de réinitialisation</a>
              </div>
            )}
            <Link href="/login" style={{ fontSize: 13, color: '#FF4A1C', textDecoration: 'none' }}>
              ← Retour à la connexion
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p style={{ fontSize: 13.5, color: 'rgba(16,8,6,.55)', lineHeight: 1.6, marginBottom: 20 }}>
              Saisissez l&apos;adresse e-mail de votre compte. Vous recevrez un lien
              pour choisir un nouveau mot de passe.
            </p>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(16,8,6,.6)', marginBottom: 6 }}>
              Adresse email
            </label>
            <input
              className="inp" type="email" placeholder="vous@exemple.com" required
              value={email} onChange={e => setEmail(e.target.value)}
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
              {loading ? 'Envoi…' : 'Envoyer le lien'}
            </button>
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <Link href="/login" style={{ fontSize: 12, color: 'rgba(16,8,6,.35)', textDecoration: 'none' }}>
                ← Retour à la connexion
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
