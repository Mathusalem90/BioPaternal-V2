'use client'

import { useState, useEffect, useRef } from 'react'

type ABO  = 'O' | 'A' | 'B' | 'AB' | ''
type Rh   = '+' | '-' | ''
type Kell = 'K+' | 'K-' | ''

interface Phenotype { abo: ABO; rh: Rh; kell: Kell }

const EMPTY: Phenotype = { abo: '', rh: '', kell: '' }

function aboImpossible(mother: ABO, child: ABO): boolean {
  if (!mother || !child) return false
  if (mother === 'O'  && child === 'AB') return true
  if (mother === 'AB' && child === 'O')  return true
  return false
}

const PERSONS = [
  { key: 'mere'   as const, label: 'Mère',         emoji: '👩', accent: 'rgba(239,68,68,.08)' },
  { key: 'enfant' as const, label: 'Enfant',        emoji: '👶', accent: 'rgba(255,74,28,.09)' },
  { key: 'pere'   as const, label: 'Père présumé',  emoji: '👨', accent: 'rgba(16,8,6,.05)'   },
]

// Codes d'erreur API → messages affichables
const API_ERRORS: Record<string, string> = {
  INVALID_INPUT: 'Données invalides. Vérifiez les groupes sanguins saisis.',
  MOTHER_CHILD_INCOMPATIBLE: 'Les groupes mère/enfant sont biologiquement incompatibles.',
  UNAUTHORIZED: 'Session expirée. Reconnectez-vous puis réessayez.',
  INVALID_OR_EXPIRED_TOKEN: 'La session d’analyse a expiré. Relancez l’analyse.',
  PAYMENT_UNAVAILABLE: 'Le paiement est momentanément indisponible. Réessayez plus tard.',
}

const STEPS = [
  { icon: '🩺', label: 'Validation mère / enfant' },
  { icon: '🩸', label: 'Analyse système ABO'       },
  { icon: '🧬', label: 'Analyse facteur Rhésus'    },
  { icon: '⚗️', label: 'Analyse système Kell'      },
  { icon: '📋', label: 'Compilation du rapport'    },
]

/* ── DNA logo (white) for analyzing screen ── */
function LogoDNAWhite() {
  return (
    <svg width="42" height="50" viewBox="0 0 80 96" fill="none" aria-hidden>
      <path d="M40 4 L76 16 L76 48 Q76 76 40 92 Q4 76 4 48 L4 16 Z" stroke="rgba(255,255,255,.92)" strokeWidth="5.5" strokeLinejoin="round"/>
      <path d="M40 17 C61 22 61 33 40 38 C19 43 19 54 40 59 C61 64 61 75 40 80" stroke="rgba(255,255,255,.92)" strokeWidth="3.2" strokeLinecap="round"/>
      <path d="M40 17 C19 22 19 33 40 38 C61 43 61 54 40 59 C19 64 19 75 40 80" stroke="rgba(255,255,255,.92)" strokeWidth="3.2" strokeLinecap="round"/>
      <line x1="24" y1="27" x2="56" y2="27" stroke="rgba(255,255,255,.6)" strokeWidth="2.5" strokeLinecap="round" opacity="0.65"/>
      <line x1="24" y1="48" x2="56" y2="48" stroke="rgba(255,255,255,.6)" strokeWidth="2.5" strokeLinecap="round" opacity="0.65"/>
      <line x1="24" y1="69" x2="56" y2="69" stroke="rgba(255,255,255,.6)" strokeWidth="2.5" strokeLinecap="round" opacity="0.65"/>
    </svg>
  )
}

export default function TestPage() {
  const [phenos, setPhenos] = useState<Record<'mere'|'enfant'|'pere', Phenotype>>({
    mere: { ...EMPTY }, enfant: { ...EMPTY }, pere: { ...EMPTY },
  })
  const [kellOn, setKellOn]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [doneSteps, setDoneSteps] = useState<number[]>([])
  const [error, setError]       = useState('')
  const startTimeRef            = useRef<number>(0)
  const stepTimersRef           = useRef<ReturnType<typeof setTimeout>[]>([])

  /* Run step animations while loading */
  useEffect(() => {
    if (!loading) { setDoneSteps([]); return }
    const delays = [600, 1200, 1800, 2300, 2800]
    stepTimersRef.current = delays.map((ms, i) =>
      setTimeout(() => setDoneSteps(prev => [...prev, i + 1]), ms)
    )
    return () => stepTimersRef.current.forEach(clearTimeout)
  }, [loading])

  function setABO(person: 'mere'|'enfant'|'pere', val: ABO) {
    setError('')
    setPhenos(p => ({ ...p, [person]: { ...p[person], abo: val } }))
  }
  function setRh(person: 'mere'|'enfant'|'pere', val: Rh) {
    setError('')
    setPhenos(p => ({ ...p, [person]: { ...p[person], rh: val } }))
  }
  function setKellVal(person: 'mere'|'enfant'|'pere', val: Kell) {
    setError('')
    setPhenos(p => ({ ...p, [person]: { ...p[person], kell: val } }))
  }

  const incompatible = aboImpossible(phenos.mere.abo, phenos.enfant.abo)

  // Liste des champs manquants, affichée au clic plutôt que de griser le
  // bouton sans explication.
  function missingFields(): string[] {
    const missing: string[] = []
    for (const { key, label } of PERSONS) {
      if (!phenos[key].abo) missing.push(`${label} — groupe ABO`)
      if (!phenos[key].rh)  missing.push(`${label} — rhésus`)
      if (kellOn && !phenos[key].kell) missing.push(`${label} — Kell`)
    }
    return missing
  }

  async function handleSubmit() {
    const missing = missingFields()
    if (missing.length > 0) {
      setError(`Champs manquants : ${missing.join(' · ')}${kellOn && missing.some(m => m.includes('Kell')) ? ' (ou désactivez l’option Kell)' : ''}`)
      return
    }
    if (incompatible) {
      setError('Corrigez l’incohérence mère/enfant signalée ci-dessus avant de lancer l’analyse.')
      return
    }
    setError('')
    setLoading(true)
    startTimeRef.current = Date.now()

    try {
      const mother = { abo: phenos.mere.abo,   rh: phenos.mere.rh,   kell: kellOn ? (phenos.mere.kell   || null) : null }
      const child  = { abo: phenos.enfant.abo, rh: phenos.enfant.rh, kell: kellOn ? (phenos.enfant.kell || null) : null }
      const father = { abo: phenos.pere.abo,   rh: phenos.pere.rh,   kell: kellOn ? (phenos.pere.kell   || null) : null }

      const analyzeRes = await fetch('/api/test/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mother, child, father }),
      })
      const analyzeData = await analyzeRes.json()
      if (!analyzeRes.ok) {
        stepTimersRef.current.forEach(clearTimeout)
        setError(API_ERRORS[analyzeData.error] ?? "Erreur lors de l'analyse.")
        setLoading(false)
        return
      }

      const payRes = await fetch('/api/test/payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: analyzeData.token }),
      })
      const payData = await payRes.json()
      if (!payRes.ok) {
        stepTimersRef.current.forEach(clearTimeout)
        setError(API_ERRORS[payData.error] ?? 'Erreur lors du paiement.')
        setLoading(false)
        return
      }

      /* Wait for the animation to finish (minimum 3200ms from start) */
      const elapsed = Date.now() - startTimeRef.current
      const remaining = Math.max(0, 3200 - elapsed)
      await new Promise(resolve => setTimeout(resolve, remaining))

      /* Persist blood groups for the result page */
      try {
        sessionStorage.setItem('biopaternal_groups', JSON.stringify({ mother, child, father }))
      } catch { /* ignore if sessionStorage unavailable */ }

      window.location.href = payData.paymentUrl
    } catch {
      stepTimersRef.current.forEach(clearTimeout)
      setError('Erreur réseau. Veuillez réessayer.')
      setLoading(false)
    }
  }

  /* ── Analyzing overlay ─────────────────────────────── */
  if (loading) {
    const kellLabel = kellOn ? 'Analyse système Kell' : 'Système Kell (non fourni)'
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'linear-gradient(160deg, #0D0604, #1F1410)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ textAlign: 'center', maxWidth: 380, padding: '32px 24px', width: '100%' }}>
          <div style={{ marginBottom: 28 }}>
            {/* Spinner */}
            <div style={{
              width: 40, height: 40, borderRadius: 999, margin: '0 auto 18px',
              border: '3px solid rgba(255,255,255,.15)', borderTopColor: '#FF4A1C',
              animation: 'spin 1s linear infinite',
            }} />
            {/* Logo */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <LogoDNAWhite />
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#FFFBF7', marginBottom: 6 }}>
              Analyse en cours…
            </div>
            <div style={{ fontSize: 13.5, color: 'rgba(255,251,247,.45)', fontFamily: 'var(--font-mono)' }}>
              BioPaternal Engine v1.0 · Lois de Mendel
            </div>
          </div>

          {/* Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {STEPS.map((step, i) => {
              const stepNum = i + 1
              const done = doneSteps.includes(stepNum)
              const label = stepNum === 4 ? kellLabel : step.label
              return (
                <div
                  key={stepNum}
                  className={`step-item${done ? ' done' : ''}`}
                >
                  <div className="step-icon">
                    {done ? '✓' : step.icon}
                  </div>
                  <span>{label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="test-page" style={{ background: '#F8F9FA', minHeight: 'calc(100vh - 53px)', padding: '20px 28px 40px' }}>

      {/* Progress */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(16,8,6,.7)' }}>🔬 Saisie des groupes sanguins</span>
          <span style={{ fontSize: 11, color: 'rgba(16,8,6,.4)', fontFamily: 'var(--font-mono)' }}>Étape 1 / 2</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: '50%' }} />
        </div>
      </div>

      {/* Mother/child incompatibility alert */}
      {incompatible && (
        <div style={{
          marginBottom: 16, padding: '12px 16px',
          background: 'rgba(220,38,38,.07)', border: '1.5px solid rgba(220,38,38,.2)',
          borderRadius: 10,
        }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#dc2626', marginBottom: 3 }}>
            ⚠️ Incohérence biologique détectée
          </div>
          <div style={{ fontSize: 12.5, color: 'rgba(16,8,6,.65)' }}>
            Une mère {phenos.mere.abo} ne peut pas avoir un enfant {phenos.enfant.abo}. Impossible biologiquement selon les lois de Mendel.
          </div>
        </div>
      )}

      {/* Person cards grid */}
      <div className="person-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
        {PERSONS.map(({ key, label, emoji, accent }, idx) => (
          <div
            key={key}
            className={`person-card${idx === 1 ? ' active-card' : ''}`}
          >
            {/* Card header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9,
                background: accent, display: 'grid', placeItems: 'center',
                fontSize: 18, flexShrink: 0,
              }}>{emoji}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{label}</div>
                <div style={{ fontSize: 11, color: 'rgba(16,8,6,.4)' }}>Groupe de {idx === 2 ? 'l\'allégué' : 'la personne'}</div>
              </div>
            </div>

            {/* ABO */}
            <div style={{ marginBottom: 13 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(16,8,6,.4)', marginBottom: 8 }}>
                Groupe ABO
              </div>
              <div style={{ display: 'flex', gap: 7 }}>
                {(['O','A','B','AB'] as ABO[]).map(val => (
                  <button
                    key={val}
                    className={`abo-btn${phenos[key].abo === val ? ' sel' : ''}`}
                    onClick={() => setABO(key, val)}
                    style={{ fontSize: val === 'AB' ? 13 : undefined }}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Rhésus */}
            <div style={{ marginBottom: kellOn ? 13 : 0 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(16,8,6,.4)', marginBottom: 8 }}>
                Rhésus
              </div>
              <div className="toggle-wrap" style={{ maxWidth: 160 }}>
                {(['+','-'] as Rh[]).map(val => (
                  <button
                    key={val}
                    className={`toggle-btn${phenos[key].rh === val ? ' sel' : ''}`}
                    onClick={() => setRh(key, val)}
                  >
                    Rh{val}
                  </button>
                ))}
              </div>
            </div>

            {/* Kell (optional) */}
            {kellOn && (
              <div style={{ marginTop: 13, paddingTop: 13, borderTop: '1px solid rgba(16,8,6,.08)' }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(16,8,6,.4)', marginBottom: 8 }}>
                  Kell
                </div>
                <div className="toggle-wrap" style={{ maxWidth: 160 }}>
                  {(['K-','K+'] as Kell[]).map(val => (
                    <button
                      key={val}
                      className={`toggle-btn${phenos[key].kell === val ? ' sel' : ''}`}
                      onClick={() => setKellVal(key, val)}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Kell toggle section */}
      <div className="kell-section" style={{
        background: 'rgba(245,158,11,.06)', border: '1.5px solid rgba(245,158,11,.18)',
        borderRadius: 14, padding: '16px 18px', marginBottom: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 19 }}>⚗️</span>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>
              Système Kell{' '}
              <span style={{ fontSize: 11, fontWeight: 400, color: 'rgba(16,8,6,.45)' }}>— Optionnel</span>
            </div>
            <div style={{ fontSize: 11.5, color: 'rgba(16,8,6,.5)' }}>
              Augmente le pouvoir d&apos;exclusion. Info sur votre carte de groupe sanguin.
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setKellOn(v => !v)}
            style={{
              position: 'relative', width: 40, height: 22, borderRadius: 999,
              background: kellOn ? '#FF4A1C' : 'rgba(16,8,6,.12)',
              border: 'none', cursor: 'pointer', transition: 'background .2s',
            }}
          >
            <div style={{
              position: 'absolute', top: 3, left: kellOn ? 19 : 3,
              width: 16, height: 16, borderRadius: 999,
              background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.2)',
              transition: 'left .2s',
            }} />
          </button>
          <span style={{ fontSize: 12.5, color: 'rgba(16,8,6,.5)' }}>Activer</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          marginBottom: 16, padding: '12px 16px',
          background: 'rgba(220,38,38,.07)', border: '1.5px solid rgba(220,38,38,.2)',
          borderRadius: 10, fontSize: 13, color: '#dc2626',
        }}>
          {error}
        </div>
      )}

      {/* Submit row */}
      <div className="submit-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
        <div style={{ fontSize: 12, color: 'rgba(16,8,6,.4)' }}>
          🔒 Données traitées dans votre navigateur uniquement
        </div>
        <button
          className="btn-cta"
          onClick={handleSubmit}
          style={{
            padding: '14px 28px', borderRadius: 12, fontSize: 15, fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', gap: 9,
          }}
        >
          🔬 Lancer l&apos;analyse
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10m0 0L9 4m4 4l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
