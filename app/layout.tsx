import type { Metadata } from 'next'
import { Instrument_Serif, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-body',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'BioPaternal — Analyse de paternité sanguine',
    template: '%s | BioPaternal',
  },
  description:
    "Analyse éphémère de compatibilité paternelle basée sur les groupes sanguins ABO, Rhésus et Kell. Aucune donnée médicale stockée. Conforme RGPD.",
  keywords: ['paternité', 'groupe sanguin', 'lois de Mendel', 'ABO', 'Rhésus', 'Kell', 'test paternité'],
  robots: { index: true, follow: true },
  openGraph: {
    title: 'BioPaternal — Analyse de paternité sanguine',
    description: 'Analyse éphémère de compatibilité paternelle. Zéro stockage médical.',
    locale: 'fr_FR',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${instrumentSerif.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans">
        {/* Global SVG gradient sprite — used by all DNA shield logos */}
        <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden>
          <defs>
            <linearGradient id="bpGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor="#FF8A3D" />
              <stop offset="55%"  stopColor="#FF4A1C" />
              <stop offset="100%" stopColor="#C42A07" />
            </linearGradient>
            <linearGradient id="bpGradWhite" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor="rgba(255,255,255,.92)" />
              <stop offset="100%" stopColor="rgba(255,255,255,.92)" />
            </linearGradient>
          </defs>
        </svg>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
