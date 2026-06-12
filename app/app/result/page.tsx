'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

type Visual = 'EXCLUSION' | 'INCAPACITY_TO_EXCLUDE'

interface BloodGroups {
  mother: { abo: string; rh: string; kell: string | null }
  child:  { abo: string; rh: string; kell: string | null }
  father: { abo: string; rh: string; kell: string | null }
}

interface ResultData {
  visual: Visual
  transactionId: string
  date: string
}

/* ── Inner component (needs useSearchParams) ─────────────── */
function ResultContent() {
  const searchParams  = useSearchParams()
  const transactionId = searchParams.get('transactionId')

  const [result, setResult]         = useState<ResultData | null>(null)
  const [groups, setGroups]         = useState<BloodGroups | null>(null)
  const [loading, setLoading]       = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [downloading, setDownloading] = useState(false)
  const [dlError, setDlError]       = useState('')

  useEffect(() => {
    /* Read blood groups saved before payment redirect */
    try {
      const stored = sessionStorage.getItem('biopaternal_groups')
      if (stored) {
        setGroups(JSON.parse(stored))
        sessionStorage.removeItem('biopaternal_groups')
      }
    } catch { /* ignore */ }

    if (!transactionId) { setFetchError('Identifiant de transaction manquant.'); setLoading(false); return }
    fetch(`/api/test/result?transactionId=${transactionId}`)
      .then(r => r.json())
      .then(data => { if (data.error) setFetchError(data.error); else setResult(data) })
      .catch(() => setFetchError('Erreur lors du chargement du résultat.'))
      .finally(() => setLoading(false))
  }, [transactionId])

  async function downloadPdf() {
    if (!transactionId) return
    setDlError('')
    setDownloading(true)
    try {
      const res = await fetch(`/api/report/${transactionId}`)
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `biopaternal-rapport-${transactionId.slice(0, 8)}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setDlError('Erreur lors du téléchargement. Réessayez.')
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F8F9FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 999, margin: '0 auto 12px',
            border: '3px solid rgba(16,8,6,.08)', borderTopColor: '#FF4A1C',
            animation: 'spin 1s linear infinite',
          }} />
          <span style={{ fontSize: 13, color: 'rgba(16,8,6,.4)', fontFamily: 'var(--font-mono)' }}>
            Chargement du résultat…
          </span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div style={{ minHeight: '100vh', background: '#F8F9FA', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{
          background: '#fff', border: '1.5px solid rgba(16,8,6,.08)', borderRadius: 16,
          padding: '32px 28px', maxWidth: 400, width: '100%', textAlign: 'center',
        }}>
          <div style={{ fontSize: 14, color: '#B3261E', marginBottom: 16 }}>{fetchError}</div>
          <Link href="/app/test" style={{
            display: 'inline-block', padding: '10px 20px', borderRadius: 10,
            background: '#100806', color: '#FFFBF7', textDecoration: 'none', fontSize: 13, fontWeight: 600,
          }}>
            ← Retour à l&apos;analyse
          </Link>
        </div>
      </div>
    )
  }

  if (!result) return null

  const isExclusion = result.visual === 'EXCLUSION'
  const kellAnalyzed = groups ? (groups.mother.kell != null) : false

  const dateFormatted = result.date
    ? new Date(result.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    : null

  return (
    <div style={{ background: '#F8F9FA', minHeight: 'calc(100vh - 53px)', overflow: 'auto' }}>

      {/* ── Coloured header ──────────────────────── */}
      <div
        id="resultHeader"
        className={isExclusion ? 'res-red' : 'res-gray'}
        style={{ padding: '36px 40px', position: 'relative', overflow: 'hidden' }}
      >
        {/* Dot grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: .08, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(rgba(255,255,255,.3) 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* Status badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '5px 13px', borderRadius: 999,
            background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.25)',
            fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.9)',
            letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 18,
            fontFamily: 'var(--font-mono)',
          }}>
            BioPaternal · Rapport
          </div>

          <h2 id="resultTitle" style={{ fontSize: 32, fontWeight: 900, color: '#FFFBF7', margin: '0 0 10px', letterSpacing: '-.02em' }}>
            {isExclusion ? 'Paternité Biologiquement Exclue' : 'Compatibilité Informative'}
          </h2>
          <p id="resultSubtitle" style={{ fontSize: 14, color: 'rgba(255,255,255,.65)', margin: '0 0 20px', lineHeight: 1.6, maxWidth: 520 }}>
            {isExclusion
              ? 'Les lois de Mendel excluent formellement la paternité biologique. Au moins un allèle nécessaire à la transmission est impossible.'
              : 'Aucune incompatibilité génétique détectée. Ce résultat ne constitue PAS une preuve de paternité.'}
          </p>

          {/* Blood group chips (from sessionStorage) or ref chip */}
          <div id="resultChips" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {groups ? (
              <>
                <BloodChip label="MÈRE"         abo={groups.mother.abo} rh={groups.mother.rh} highlight={false} isExclusion={isExclusion} />
                <BloodChip label="ENFANT"        abo={groups.child.abo}  rh={groups.child.rh}  highlight={false} isExclusion={isExclusion} />
                <BloodChip label={`PÈRE PRÉSUMÉ ${isExclusion ? '✗' : '~'}`} abo={groups.father.abo} rh={groups.father.rh} highlight isExclusion={isExclusion} />
              </>
            ) : (
              /* Fallback: ref chip if blood groups unavailable */
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '8px 14px', borderRadius: 10,
                background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)',
              }}>
                <div style={{ fontSize: 9, opacity: .5, fontFamily: 'var(--font-mono)', letterSpacing: '.15em' }}>RÉF.</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#FFFBF7', fontFamily: 'var(--font-mono)' }}>
                  {transactionId?.slice(0, 8).toUpperCase()}
                </div>
                {dateFormatted && (
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>
                    · {dateFormatted}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────── */}
      <div id="resultBody" style={{ padding: '28px 40px', maxWidth: 720 }}>

        {/* Exclusion detail */}
        {isExclusion && (
          <div style={{
            background: 'rgba(179,38,30,.05)', border: '1.5px solid rgba(179,38,30,.18)',
            borderRadius: 14, padding: 20, marginBottom: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7, background: 'rgba(179,38,30,.12)',
                display: 'grid', placeItems: 'center', fontSize: 15,
              }}>🩸</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#B3261E' }}>
                Motif d&apos;exclusion : Incompatibilité génétique
              </div>
            </div>
            <p style={{ fontSize: 13.5, color: 'rgba(16,8,6,.7)', lineHeight: 1.7, margin: 0 }}>
              Les groupes sanguins renseignés sont biologiquement incompatibles selon les lois de Mendel.
              Le père présumé ne peut pas avoir transmis les allèles nécessaires à la constitution du groupe de l&apos;enfant.
            </p>
          </div>
        )}

        {/* Disclaimer block (compatible only) */}
        {!isExclusion && (
          <div style={{
            background: 'rgba(16,8,6,.04)', border: '1.5px solid rgba(16,8,6,.12)',
            borderRadius: 14, padding: 20, marginBottom: 20,
          }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8, background: 'rgba(16,8,6,.08)',
                display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: 16,
              }}>⚠️</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Ce résultat NE PROUVE PAS la paternité</div>
                <p style={{ fontSize: 13, color: 'rgba(16,8,6,.65)', lineHeight: 1.7, margin: 0 }}>
                  Une <strong>compatibilité informative</strong> signifie que la paternité ne peut <em>pas être exclue</em> sur
                  la base des groupes sanguins — pas qu&apos;elle est prouvée. Des millions d&apos;hommes
                  ayant ces groupes pourraient biologiquement être le père.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Systems analysis grid */}
        <div className="systems-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
          <SystemCard name="Système ABO"    excluded={isExclusion} ok={!isExclusion} />
          <SystemCard name="Facteur Rhésus" excluded={isExclusion} ok={!isExclusion} />
          <SystemCard name="Kell"           excluded={isExclusion && kellAnalyzed} ok={!isExclusion && kellAnalyzed} notProvided={!kellAnalyzed} />
        </div>

        {/* DNA affiliate block — compatibility only */}
        {!isExclusion && (
          <div className="dna-box" style={{ padding: 22, marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{
                width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                background: 'linear-gradient(135deg, rgba(255,74,28,.14), rgba(245,158,11,.1))',
                display: 'grid', placeItems: 'center', fontSize: 22,
              }}>🧬</div>
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: 'rgba(255,74,28,.1)', borderRadius: 999,
                  padding: '3px 10px', fontSize: 10, fontWeight: 700,
                  letterSpacing: '.12em', textTransform: 'uppercase', color: '#C42A07', marginBottom: 8,
                }}>
                  Étape suivante recommandée
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 8px', letterSpacing: '-.01em' }}>
                  Test ADN — Confirmez avec une précision &gt;99,99 %
                </h3>
                <p style={{ fontSize: 13, color: 'rgba(16,8,6,.65)', lineHeight: 1.65, margin: '0 0 14px' }}>
                  Le groupe sanguin ne peut qu&apos;<em>exclure</em> — jamais confirmer. Un <strong>test ADN de paternité</strong>{' '}
                  compare des milliers de marqueurs génétiques uniques et établit la filiation
                  biologique avec une certitude supérieure à 99,99 %.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                  {['Résultat en 5 à 10 jours', 'Valeur légale disponible', 'Prélèvement buccal simple'].map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'rgba(16,8,6,.65)' }}>
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8l3 3 7-6" stroke="#FF4A1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {f}
                    </div>
                  ))}
                </div>
                <button style={{
                  padding: '10px 20px', borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg, #FF8A3D, #FF4A1C 50%, #C42A07)',
                  color: '#FFFBF7', fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 7,
                }}>
                  Accéder au Test ADN partenaire
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10m0 0L9 4m4 4l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PDF download */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
          padding: '16px 20px', background: '#fff', border: '1.5px solid rgba(16,8,6,.1)',
          borderRadius: 13, marginBottom: 14,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 9, background: 'rgba(16,8,6,.06)',
              display: 'grid', placeItems: 'center', fontSize: 18, flexShrink: 0,
            }}>📄</div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>Rapport PDF officiel</div>
              <div style={{ fontSize: 11, color: 'rgba(16,8,6,.45)' }}>
                Rapport_BioPaternal_{new Date().toISOString().slice(0, 10).replace(/-/g, '')}.pdf
              </div>
            </div>
          </div>
          <button
            onClick={downloadPdf}
            disabled={downloading}
            className="btn-dark"
            style={{
              padding: '9px 18px', borderRadius: 9, fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
            }}
          >
            {downloading
              ? <span style={{ width: 13, height: 13, borderRadius: 999, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', animation: 'spin 1s linear infinite', display: 'inline-block' }} />
              : <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 12h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            }
            Télécharger
          </button>
        </div>
        {dlError && <div style={{ fontSize: 12, color: '#B3261E', marginBottom: 14 }}>{dlError}</div>}

        {/* Legal */}
        <div style={{
          padding: '13px 16px', background: 'rgba(16,8,6,.03)', borderRadius: 9,
          fontSize: 11.5, color: 'rgba(16,8,6,.45)', lineHeight: 1.65,
          border: '1px solid rgba(16,8,6,.06)', marginBottom: 24,
        }}>
          <strong>⚖️ Mention légale :</strong> Ce rapport est produit à titre informatif uniquement
          et repose sur les données saisies par l&apos;utilisateur. Il n&apos;a aucune valeur juridique
          probatoire et ne peut être utilisé comme preuve dans une procédure judiciaire.
          Seul un test ADN en laboratoire accrédité constitue une preuve légale de filiation.
        </div>

        <Link href="/app/test" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600,
          color: 'rgba(16,8,6,.5)', textDecoration: 'none',
        }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M13 8a5 5 0 10-.5 2.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M13 4v4h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Nouvelle analyse
        </Link>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

/* ── Blood group chip ─────────────────────────────────── */
function BloodChip({ label, abo, rh, highlight, isExclusion }: {
  label: string; abo: string; rh: string; highlight: boolean; isExclusion: boolean
}) {
  const fatherExcluded = highlight && isExclusion
  return (
    <div style={{
      padding: '8px 14px', borderRadius: 10, display: 'inline-block',
      background: fatherExcluded ? 'rgba(255,100,100,.22)' : 'rgba(255,255,255,.12)',
      border: `1px solid ${fatherExcluded ? 'rgba(255,150,150,.4)' : 'rgba(255,255,255,.2)'}`,
    }}>
      <div style={{ fontSize: 9, opacity: .5, marginBottom: 2, fontFamily: 'var(--font-mono)', letterSpacing: '.15em' }}>
        {label}
      </div>
      <div style={{ fontSize: 17, fontWeight: 800, color: fatherExcluded ? '#FFB3A7' : '#FFFBF7' }}>
        {abo}<sup style={{ fontSize: 11 }}>{rh}</sup>
      </div>
    </div>
  )
}

/* ── System card ──────────────────────────────────────── */
function SystemCard({ name, excluded, ok, notProvided }: {
  name: string; excluded?: boolean; ok?: boolean; notProvided?: boolean
}) {
  return (
    <div style={{
      padding: 13,
      background: excluded ? 'rgba(179,38,30,.04)' : '#fff',
      border: `1px solid ${excluded ? 'rgba(179,38,30,.15)' : 'rgba(16,8,6,.08)'}`,
      borderRadius: 11,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{name}</span>
        {excluded    ? <XIcon />    :
         notProvided ? <span style={{ fontSize: 10, color: 'rgba(16,8,6,.35)', fontStyle: 'italic' }}>Non fourni</span> :
         ok          ? <CheckIcon /> :
         <span style={{ fontSize: 10, color: 'rgba(16,8,6,.35)' }}>—</span>}
      </div>
      <div style={{ fontSize: 11, color: 'rgba(16,8,6,.5)' }}>
        {excluded    ? 'Exclusion confirmée' :
         notProvided ? 'Données non saisies' :
         ok          ? 'Aucune exclusion'    : 'Non décisif'}
      </div>
    </div>
  )
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#F8F9FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: 36, height: 36, borderRadius: 999,
          border: '3px solid rgba(16,8,6,.08)', borderTopColor: '#FF4A1C',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <ResultContent />
    </Suspense>
  )
}

function CheckIcon() {
  return (
    <div style={{ width: 20, height: 20, borderRadius: 999, background: 'rgba(34,197,94,.15)', display: 'grid', placeItems: 'center' }}>
      <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
        <path d="M2 6l3 3 5-5" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

function XIcon() {
  return (
    <div style={{ width: 20, height: 20, borderRadius: 999, background: '#B3261E', display: 'grid', placeItems: 'center' }}>
      <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
        <path d="M2 2l8 8M10 2l-8 8" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    </div>
  )
}
