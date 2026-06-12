'use client'

import { useEffect, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Codes d'erreur API → messages affichables
const API_ERRORS: Record<string, string> = {
  EMAIL_ALREADY_EXISTS: 'Un compte existe déjà avec cette adresse e-mail. Utilisez l’onglet « Se connecter ».',
  INVALID_REQUEST: 'Vérifiez les champs du formulaire (mot de passe : 8 caractères minimum).',
}

// Erreurs NextAuth passées en query string (?error=...) après un échec OAuth
const NEXTAUTH_ERRORS: Record<string, string> = {
  OAuthAccountNotLinked: 'Cette adresse e-mail est déjà associée à un compte. Connectez-vous avec votre e-mail et votre mot de passe.',
  OAuthCallback: 'La connexion Google a échoué. Réessayez.',
  OAuthSignin: 'Impossible de démarrer la connexion Google. Réessayez.',
  AccessDenied: 'Accès refusé par Google.',
  Default: 'Une erreur est survenue pendant la connexion. Réessayez.',
}

type Tab = 'login' | 'register'

interface Props {
  defaultTab?: Tab
}

function LogoDNA({ white = false }: { white?: boolean }) {
  const stroke = white ? 'rgba(255,255,255,.92)' : 'url(#bpGrad)'
  const strokeFaint = white ? 'rgba(255,255,255,.6)' : 'url(#bpGrad)'
  return (
    <svg width="27" height="32" viewBox="0 0 80 96" fill="none" aria-hidden>
      <path d="M40 4 L76 16 L76 48 Q76 76 40 92 Q4 76 4 48 L4 16 Z" stroke={stroke} strokeWidth="5.5" strokeLinejoin="round"/>
      <path d="M40 17 C61 22 61 33 40 38 C19 43 19 54 40 59 C61 64 61 75 40 80" stroke={stroke} strokeWidth="3.2" strokeLinecap="round"/>
      <path d="M40 17 C19 22 19 33 40 38 C61 43 61 54 40 59 C19 64 19 75 40 80" stroke={stroke} strokeWidth="3.2" strokeLinecap="round"/>
      <line x1="24" y1="27" x2="56" y2="27" stroke={strokeFaint} strokeWidth="2.5" strokeLinecap="round" opacity="0.65"/>
      <line x1="24" y1="48" x2="56" y2="48" stroke={strokeFaint} strokeWidth="2.5" strokeLinecap="round" opacity="0.65"/>
      <line x1="24" y1="69" x2="56" y2="69" stroke={strokeFaint} strokeWidth="2.5" strokeLinecap="round" opacity="0.65"/>
    </svg>
  )
}

const FEATURES = [
  'Basé sur les lois de Mendel',
  'Résultat en moins de 30 secondes',
  'Aucun groupe sanguin stocké',
  'Systèmes ABO · Rhésus · Kell',
]

export function AuthCard({ defaultTab = 'login' }: Props) {
  const [tab, setTab] = useState<Tab>(defaultTab)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass, setLoginPass]   = useState('')
  const [regName, setRegName]       = useState('')
  const [regEmail, setRegEmail]     = useState('')
  const [regPass, setRegPass]       = useState('')
  const [cgu, setCgu]               = useState(false)
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)
  const router = useRouter()

  // NextAuth redirige vers /login?error=XXX après un échec OAuth — sans ça,
  // un échec Google (ex. OAuthAccountNotLinked) était totalement silencieux.
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('error')
    if (code) setError(NEXTAUTH_ERRORS[code] ?? NEXTAUTH_ERRORS.Default)
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await signIn('credentials', { redirect: false, email: loginEmail, password: loginPass })
    setLoading(false)
    if (res?.error) setError('Email ou mot de passe incorrect.')
    else router.push('/app/test')
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!cgu) { setError('Acceptez les CGU et la politique de confidentialité.'); return }
    if (regPass.length < 8) { setError('Mot de passe trop court (8 caractères min.)'); return }
    setLoading(true)
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: regName, email: regEmail, password: regPass, cguAccepted: true, privacyAccepted: true }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(API_ERRORS[data.error] ?? data.message ?? 'Une erreur est survenue.')
      setLoading(false)
      return
    }
    const login = await signIn('credentials', { redirect: false, email: regEmail, password: regPass })
    if (login?.error) {
      // Compte créé mais connexion automatique impossible — basculer sur
      // l'onglet connexion plutôt que de laisser croire que rien n'a marché.
      setLoading(false)
      setTab('login')
      setError('Votre compte a été créé. Connectez-vous avec votre e-mail et votre mot de passe.')
      return
    }
    router.push('/app/test')
  }

  async function handleGoogle() {
    await signIn('google', { callbackUrl: '/app/test' })
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
        width: '100%', maxWidth: 960,
        display: 'flex', borderRadius: 24, overflow: 'hidden',
        boxShadow: '0 8px 40px -12px rgba(16,8,6,.22), 0 2px 8px rgba(16,8,6,.08)',
        minHeight: 560,
      }}>

        {/* ── Left: brand panel ────────────────────── */}
        <div className="auth-left-panel" style={{
          flex: '0 0 42%',
          background: 'linear-gradient(160deg, #100806, #1F1410)',
          color: '#FFFBF7', padding: '44px 36px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <LogoDNA white />
            <span style={{ fontSize: 16, fontWeight: 700 }}>BioPaternal</span>
          </div>

          <div style={{
            fontSize: 10.5, letterSpacing: '.18em', textTransform: 'uppercase',
            color: 'rgba(255,74,28,.8)', fontWeight: 600, marginBottom: 10,
            fontFamily: 'var(--font-mono)',
          }}>
            Votre analyse vous attend
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.2, marginBottom: 24, letterSpacing: '-.02em' }}>
            Accédez à votre<br />
            <span style={{
              background: 'linear-gradient(120deg, #FF8A3D, #F59E0B)',
              WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
            }}>
              rapport génétique
            </span>
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 32 }}>
            {FEATURES.map((f) => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(255,251,247,.7)' }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 6,
                  background: 'rgba(255,74,28,.2)', display: 'grid', placeItems: 'center', flexShrink: 0,
                }}>
                  <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7l3 3 7-6" stroke="#FF8A3D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {f}
              </div>
            ))}
          </div>

          <Link href="/" style={{
            background: 'transparent', border: 'none', color: 'rgba(255,251,247,.3)',
            fontSize: 12, cursor: 'pointer', textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Retour à l&apos;accueil
          </Link>
        </div>

        {/* ── Right: form panel ────────────────────── */}
        <div className="auth-form-panel" style={{
          flex: 1, background: '#FFFBF7', padding: '44px 36px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          {/* Tab switcher */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(16,8,6,.1)', marginBottom: 24 }}>
            {(['login', 'register'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError('') }}
                style={{
                  flex: 1, padding: '10px', fontSize: 13.5,
                  fontWeight: tab === t ? 600 : 500,
                  border: 'none', background: 'transparent', cursor: 'pointer',
                  borderBottom: tab === t ? '2px solid #FF4A1C' : '2px solid transparent',
                  color: tab === t ? '#100806' : 'rgba(16,8,6,.45)',
                  fontFamily: 'inherit', transition: 'all .15s',
                }}
              >
                {t === 'login' ? 'Se connecter' : 'Créer un compte'}
              </button>
            ))}
          </div>

          {/* Login form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 13, marginBottom: 18 }}>
                <Field label="Adresse email">
                  <input className="inp" type="email" placeholder="vous@exemple.com"
                    value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
                </Field>
                <Field label="Mot de passe">
                  <input className="inp" type="password" placeholder="••••••••"
                    value={loginPass} onChange={e => setLoginPass(e.target.value)} required />
                  <div style={{ textAlign: 'right', marginTop: 5 }}>
                    <Link href="/forgot-password" style={{ fontSize: 11.5, color: '#FF4A1C', textDecoration: 'none' }}>
                      Mot de passe oublié ?
                    </Link>
                  </div>
                </Field>
              </div>
              {error && <ErrorBox>{error}</ErrorBox>}
              <button type="submit" disabled={loading} className="btn-cta" style={{
                width: '100%', padding: 13, borderRadius: 11, fontSize: 15, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                {loading ? 'Connexion…' : 'Se connecter'}
                {!loading && <ArrowIcon />}
              </button>
            </form>
          )}

          {/* Register form */}
          {tab === 'register' && (
            <form onSubmit={handleRegister}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 13, marginBottom: 18 }}>
                <Field label="Prénom">
                  <input className="inp" type="text" placeholder="Votre prénom"
                    value={regName} onChange={e => setRegName(e.target.value)} />
                </Field>
                <Field label="Email">
                  <input className="inp" type="email" placeholder="vous@exemple.com"
                    value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
                </Field>
                <Field label="Mot de passe">
                  <input className="inp" type="password" placeholder="8 caractères min."
                    value={regPass} onChange={e => setRegPass(e.target.value)} required minLength={8} />
                </Field>
              </div>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginBottom: 14 }}>
                <input type="checkbox" checked={cgu} onChange={e => setCgu(e.target.checked)}
                  style={{ marginTop: 3, flexShrink: 0, accentColor: '#FF4A1C', width: 15, height: 15, cursor: 'pointer' }} />
                <span style={{ fontSize: 12, color: 'rgba(16,8,6,.6)', lineHeight: 1.5 }}>
                  J&apos;accepte les{' '}
                  <Link href="/politique-de-confidentialite" target="_blank"
                    style={{ color: '#FF4A1C', textDecoration: 'underline', textUnderlineOffset: 2 }}>
                    Conditions générales d&apos;utilisation
                  </Link>{' '}
                  et la{' '}
                  <Link href="/politique-de-confidentialite" target="_blank"
                    style={{ color: '#FF4A1C', textDecoration: 'underline', textUnderlineOffset: 2 }}>
                    Politique de confidentialité
                  </Link>
                </span>
              </label>
              {error && <ErrorBox>{error}</ErrorBox>}
              <button type="submit" disabled={loading || !cgu} className="btn-cta" style={{
                width: '100%', padding: 13, borderRadius: 11, fontSize: 15, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: (!cgu || loading) ? 0.5 : 1,
              }}>
                {loading ? 'Création…' : 'Créer mon compte'}
                {!loading && <ArrowIcon />}
              </button>
            </form>
          )}

          {/* Divider + Google */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(16,8,6,.09)' }} />
            <span style={{ fontSize: 12, color: 'rgba(16,8,6,.35)' }}>ou continuer avec</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(16,8,6,.09)' }} />
          </div>

          <button onClick={handleGoogle} style={{
            width: '100%', padding: '10px 14px',
            border: '1.5px solid rgba(16,8,6,.1)', borderRadius: 10,
            background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 10, fontSize: 13.5, fontWeight: 500, cursor: 'pointer',
            fontFamily: 'inherit', transition: 'background .15s',
          }}
            onMouseOver={e => (e.currentTarget.style.background = '#fafafa')}
            onMouseOut={e => (e.currentTarget.style.background = '#fff')}
          >
            <GoogleIcon />
            Continuer avec Google
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(16,8,6,.6)', marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      marginBottom: 12, padding: '10px 14px',
      background: 'rgba(179,38,30,.07)', border: '1.5px solid rgba(179,38,30,.2)',
      borderRadius: 10, fontSize: 13, color: '#B3261E',
    }}>
      {children}
    </div>
  )
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M3 8h10m0 0L9 4m4 4l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}
