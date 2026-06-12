'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

/* ── DNA shield logo (uses global #bpGrad from layout) ── */
function LogoDNA({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 80 96" fill="none" aria-hidden>
      <path d="M40 4 L76 16 L76 48 Q76 76 40 92 Q4 76 4 48 L4 16 Z" stroke="url(#bpGrad)" strokeWidth="5.5" strokeLinejoin="round"/>
      <path d="M40 17 C61 22 61 33 40 38 C19 43 19 54 40 59 C61 64 61 75 40 80" stroke="url(#bpGrad)" strokeWidth="3.2" strokeLinecap="round"/>
      <path d="M40 17 C19 22 19 33 40 38 C61 43 61 54 40 59 C19 64 19 75 40 80" stroke="url(#bpGrad)" strokeWidth="3.2" strokeLinecap="round"/>
      <line x1="24" y1="27" x2="56" y2="27" stroke="url(#bpGrad)" strokeWidth="2.5" strokeLinecap="round" opacity="0.65"/>
      <line x1="24" y1="48" x2="56" y2="48" stroke="url(#bpGrad)" strokeWidth="2.5" strokeLinecap="round" opacity="0.65"/>
      <line x1="24" y1="69" x2="56" y2="69" stroke="url(#bpGrad)" strokeWidth="2.5" strokeLinecap="round" opacity="0.65"/>
    </svg>
  )
}

/* ── Language selector dropdown ── */
function LangSelector() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 12px', borderRadius: 999,
          border: '1px solid rgba(16,8,6,.10)', background: 'rgba(255,255,255,.7)',
          fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
          fontFamily: 'inherit', color: '#100806',
        }}
      >
        <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M10 1.5C10 1.5 7 5.5 7 10s3 8.5 3 8.5M10 1.5C10 1.5 13 5.5 13 10s-3 8.5-3 8.5M1.5 10h17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        FR
        <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0,
          background: '#fff', border: '1px solid rgba(16,8,6,.1)', borderRadius: 12,
          boxShadow: '0 8px 24px -6px rgba(16,8,6,.14)', minWidth: 130, overflow: 'hidden', zIndex: 100,
        }}>
          <button
            onClick={() => setOpen(false)}
            style={{
              width: '100%', padding: '9px 14px', textAlign: 'left', border: 'none',
              background: 'rgba(255,74,28,.06)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit', color: '#FF4A1C', display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            🇫🇷 Français
            <svg style={{ marginLeft: 'auto' }} width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="#FF4A1C" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            onClick={() => setOpen(false)}
            style={{
              width: '100%', padding: '9px 14px', textAlign: 'left', border: 'none',
              background: 'transparent', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              fontFamily: 'inherit', color: 'rgba(16,8,6,.55)', display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            🇬🇧 English
            <span style={{ marginLeft: 'auto', fontSize: 10, background: 'rgba(16,8,6,.07)', padding: '2px 6px', borderRadius: 999 }}>bientôt</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default function LandingPage() {
  const [badgesVisible, setBadgesVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setBadgesVisible(true), 400)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{ background: '#FFFBF7', color: '#100806', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── NAVBAR ──────────────────────────────────── */}
      <header style={{
        position: 'relative', zIndex: 10, padding: '20px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LogoDNA size={27} />
          <span style={{ fontSize: 17, fontWeight: 700 }}>BioPaternal</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LangSelector />
          <Link href="/login" style={{
            padding: '8px 18px', borderRadius: 999, border: '1px solid rgba(16,8,6,.12)',
            background: '#fff', fontSize: 13.5, fontWeight: 500, color: '#100806',
            textDecoration: 'none',
          }}>
            Connexion
          </Link>
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────── */}
      <section style={{ position: 'relative' }}>
        <div className="stage-bg" />
        <div className="grain" />

        {/* Floating badges — apparaissent après 400ms comme dans le prototype */}
        {badgesVisible && (
          <>
            <div className="animate-float-a landing-badge-float" style={{ position: 'absolute', top: '8%', left: '6%' }}>
              <div className="badge-pill">
                <span style={{ width: 8, height: 8, borderRadius: 999, background: '#B3261E', flexShrink: 0 }} />
                Système ABO 🩸
              </div>
            </div>
            <div className="animate-float-b landing-badge-float" style={{ position: 'absolute', top: '12%', right: '5%' }}>
              <div className="badge-pill">
                <span style={{ width: 8, height: 8, borderRadius: 999, background: '#FF4A1C', flexShrink: 0 }} />
                Facteur Rhésus 🧬
              </div>
            </div>
            <div className="animate-float-c landing-badge-float" style={{ position: 'absolute', bottom: '28%', right: '7%' }}>
              <div className="badge-pill">
                <span style={{ width: 8, height: 8, borderRadius: 999, background: '#F59E0B', flexShrink: 0 }} />
                Système Kell ⚗️
              </div>
            </div>
          </>
        )}

        <div style={{
          position: 'relative', zIndex: 5,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '48px 24px 60px', textAlign: 'center',
        }}>
          {/* Eyebrow */}
          <div className="eyebrow" style={{ marginBottom: 16 }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: '#FF4A1C', boxShadow: '0 0 0 3px rgba(255,74,28,.18)', flexShrink: 0 }} />
            Test d&apos;exclusion de paternité
          </div>

          {/* H1 */}
          <h1 style={{
            fontSize: 'clamp(42px, 7vw, 88px)',
            fontWeight: 900,
            letterSpacing: '-.035em',
            lineHeight: .95,
            marginBottom: 22,
            fontFamily: 'var(--font-body)',
          }}>
            Lever le Doute<br />
            <span style={{
              background: 'linear-gradient(120deg, #FF4A1C 0%, #F59E0B 55%, #FF4A1C 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}>
              Génétique en 3 clics
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(15px, 2vw, 19px)',
            color: 'rgba(16,8,6,.6)',
            lineHeight: 1.6,
            maxWidth: 540,
            marginBottom: 34,
          }}>
            Calculez instantanément la compatibilité des groupes sanguins.
            Une méthode{' '}
            <em style={{ fontFamily: 'var(--font-display)', fontSize: '1.1em', color: '#C42A07' }}>scientifique</em>,
            rapide et anonyme pour analyser l&apos;exclusion de paternité.
          </p>

          {/* CTA */}
          <Link href="/signup" className="btn-cta" style={{
            padding: '16px 32px', borderRadius: 999, fontSize: 17, fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none',
          }}>
            Faire le test
            <span style={{
              width: 30, height: 30, borderRadius: 999,
              background: 'rgba(255,255,255,.18)',
              display: 'grid', placeItems: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10m0 0L9 4m4 4l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </Link>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '.22em',
            textTransform: 'uppercase', color: 'rgba(16,8,6,.4)', marginTop: 12,
          }}>
            Résultat en &lt; 30s · Zéro donnée stockée
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex', gap: 32, marginTop: 40, paddingTop: 32,
            borderTop: '1px solid rgba(16,8,6,.07)',
            flexWrap: 'wrap', justifyContent: 'center',
          }}>
            {[
              { val: '99,4%', label: 'Précision ABO/Rh' },
              { val: '<30s',  label: 'Analyse' },
              { val: '0',     label: 'Donnée bio stockée' },
              { val: '42k+',  label: 'Utilisateurs' },
            ].map(({ val, label }) => (
              <div key={label} style={{ textAlign: 'center', minWidth: 80 }}>
                <div className="stat-num">{val}</div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.15em',
                  textTransform: 'uppercase', color: 'rgba(16,8,6,.45)',
                }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────── */}
      <section style={{ maxWidth: 600, margin: '0 auto', padding: '0 24px 64px' }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.2em',
          textTransform: 'uppercase', color: 'rgba(16,8,6,.35)', marginBottom: 18, textAlign: 'center',
        }}>
          Questions fréquentes
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {FAQ.map((item) => (
            <details key={item.q} className="faq-item">
              <summary className="faq-summary">
                {item.q}
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M4 6l4 4 4-4" stroke="#100806" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </summary>
              <p style={{
                padding: '0 16px 14px', fontSize: 13,
                color: 'rgba(16,8,6,.6)', lineHeight: 1.65, margin: 0,
                borderTop: '1px solid rgba(16,8,6,.06)', paddingTop: 10,
              }}>
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid rgba(16,8,6,.08)', padding: '20px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: 12, color: 'rgba(16,8,6,.4)', flexWrap: 'wrap', gap: 10,
      }}>
        <span>© 2025 BioPaternal. Tous droits réservés.</span>
        <div style={{ display: 'flex', gap: 20 }}>
          <Link href="/politique-de-confidentialite" style={{ color: 'rgba(16,8,6,.4)', textDecoration: 'none' }}>
            Politique de confidentialité
          </Link>
          <Link href="/documentation" style={{ color: 'rgba(16,8,6,.4)', textDecoration: 'none' }}>
            Documentation
          </Link>
        </div>
      </footer>
    </div>
  )
}

const FAQ = [
  {
    q: "Comment fonctionne l'analyse ?",
    a: "BioPaternal applique les lois de Mendel pour vérifier si les groupes sanguins ABO, Rhésus et Kell sont génétiquement compatibles entre la mère, l'enfant et le père présumé. L'analyse se fait entièrement côté serveur en mémoire vive.",
  },
  {
    q: "Mes données sont-elles stockées ?",
    a: "Non. Aucun groupe sanguin n'est envoyé ni stocké sur nos serveurs de façon permanente. Les données transitent en RAM uniquement pendant l'analyse. Seul le statut du paiement (payé / non payé) est enregistré, sans aucune donnée biologique.",
  },
  {
    q: "Le résultat est-il juridiquement valable ?",
    a: "Non. Ce test est informatif uniquement. Il peut exclure une paternité avec certitude biologique, mais ne peut jamais la prouver. Seul un test ADN réalisé en laboratoire accrédité a une valeur légale.",
  },
  {
    q: "Qu'est-ce que le système Kell ?",
    a: "Le système Kell est un troisième groupe sanguin (antigène K). Activer cette option augmente le pouvoir d'exclusion de l'analyse. Il est indiqué sur votre carte de groupe sanguin ou prescription médicale.",
  },
  {
    q: "Combien de temps prend l'analyse ?",
    a: "L'analyse génétique est quasi-instantanée côté serveur. Le résultat est disponible immédiatement après validation du paiement.",
  },
]
