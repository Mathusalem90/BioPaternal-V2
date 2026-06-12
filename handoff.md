# Handoff — BioPaternal V2

## Objectif

Construire une application web Next.js permettant à un utilisateur de soumettre des phénotypes sanguins pour une analyse éphémère de paternité, puis de payer via Stripe (international) ou FedaPay/CinetPay (Afrique FCFA) pour recevoir un rapport complet, le tout en respectant les contraintes RGPD médicales.

---

## Infrastructure

| Élément | Détail |
|---|---|
| Hébergeur | **Vercel** (Next.js natif, serverless Node.js) |
| Base de données | **Supabase** — pooler EU West (port direct 5432 bloqué réseau local) |
| Dev local | `http://localhost:3001` (port 3000 occupé sur la machine) |
| Dépôt Git | **GitHub public** — `https://github.com/Mathusalem90/BioPaternal-V2` (branche `main`) |
| CI/CD | Vercel connecté à GitHub — chaque `git push main` déclenche un redéploiement automatique |
| Variables d'env | Définies dans `.env` en local, dupliquées dans le **dashboard Vercel → Variables environnementales** |

> **Point critique Vercel :** `serverComponentsExternalPackages: ['pdfkit']` dans `next.config.mjs` est obligatoire. Sans cette ligne, Vercel inline pdfkit dans le bundle Lambda et ses fichiers de polices AFM deviennent inaccessibles au runtime → crash de la génération PDF en production.

> **Point critique build :** le script `build` dans `package.json` doit être `"prisma generate && next build"`. Un simple `"tsc"` ne génère pas le dossier `.next` et cause un `DEPLOYMENT_NOT_FOUND` sur Vercel.

---

## État actuel du code

### ✅ Sprints 1–3 — Socle backend

| Périmètre | Détail |
|---|---|
| Base de données | Connexion Supabase active via le connection pooler EU West |
| Schéma Prisma | Tables en sync : `User`, `Consent`, `Transaction`, `Account`, `Session`, `VerificationToken`, `GlobalStat` |
| Seed admin | `admin@biopaternal.local` / `Admin123!` créé en base |
| Algorithme sang | `assessPaternity()` testé (suite Vitest passe) — entièrement en RAM, aucun accès DB |
| Auth | NextAuth avec `CredentialsProvider` + `GoogleProvider`, JWT + rôle dans session |
| Protection des routes | Middleware : `/admin/*` → 403 si pas ADMIN, `/app/*` → redirect `/login` si non connecté |
| Inscription | `POST /api/auth/signup` — valide CGU/politique obligatoires côté serveur |
| Analyse éphémère | `POST /api/test/analyze` — renvoie `{ visual, token }`, résultat scellé non exposé |
| Token éphémère | JWT HS256 TTL 1 h, signé `EPHEMERAL_JWT_SECRET`, stocké dans `Transaction.resultType` à la création du payment intent |
| Détection géo | `lib/geo.ts` lit `x-vercel-ip-country` → STRIPE / FEDAPAY / CINETPAY |
| Webhook Stripe | Vérification `stripe.webhooks.constructEvent` + status SUCCESSFUL + GlobalStat anonyme |
| Webhook FedaPay | Vérification HMAC-SHA256 `timingSafeEqual` + status SUCCESSFUL + GlobalStat anonyme |
| Stats RGPD | `GlobalStat` incrémenté sans lien vers `userId` ou `transactionId` |

---

### ✅ Sprint 4 — Rapport PDF + pages publiques

| Périmètre | Fichier | Détail |
|---|---|---|
| Génération PDF | `lib/pdf-report.ts` | `generateReportPdf(resultType, txId, date): Promise<Buffer>` — pdfkit, 1 page A4, entièrement en RAM |
| Endpoint téléchargement | `app/api/report/[transactionId]/route.ts` | `GET /api/report/:id` — vérifie session + `status=SUCCESSFUL` + `userId`, lit `resultType` en DB, sert le PDF |
| Politique de confidentialité | `app/politique-de-confidentialite/page.tsx` | RGPD complet en français, 8 sections, avertissement médical obligatoire |
| Documentation publique | `app/documentation/page.tsx` | Lois de Mendel, ABO/Rh/Kell, FAQ, optimisé SEO |
| Sitemap | `app/sitemap.ts` | `/`, `/documentation` (priorité 0.9), `/politique-de-confidentialite`, `/login`, `/signup` |
| Robots.txt | `app/robots.ts` | Disallow `/api/`, `/app/`, `/admin/` |
| Layout racine | `app/layout.tsx` | Metadata SEO globale, `lang="fr"`, SVG gradient global `#bpGrad` |
| Config Next.js | `next.config.mjs` | `serverComponentsExternalPackages: ['pdfkit']` — obligatoire Vercel |

**Dépendances ajoutées :** `pdfkit` + `@types/pdfkit`

---

### ✅ Sprint 5 — Frontend complet (design warm paper/orange)

Design identique au prototype HTML `BioPaternal-App.html`. Application web uniquement (concept hybride abandonné).

#### Système de design

| Token | Valeur |
|---|---|
| `--paper` | `#FFFBF7` (fond chaud ivoire) |
| `--ink` | `#100806` (texte quasi-noir) |
| `--orange` | `#FF4A1C` (CTA principal) |
| `--orange-dark` | `#C42A07` (texte accentué) |
| `--rouge` | `#B3261E` (exclusion/erreur) |
| `--amber` | `#F59E0B` (accent secondaire) |
| Font display | Instrument Serif (italic) — variable `--font-display` |
| Font body | Inter — variable `--font-body` |
| Font mono | JetBrains Mono — variable `--font-mono` |

**Gradient SVG partagé :** `<linearGradient id="bpGrad">` défini une fois dans `app/layout.tsx` body (sprite caché). Tous les logos DNA y référencent via `stroke="url(#bpGrad)"`.

**Classes CSS globales** (`app/globals.css`) :

| Classe | Usage |
|---|---|
| `.btn-cta` | Bouton orange dégradé avec shine + glow |
| `.btn-dark` | Bouton fond `#100806` |
| `.stage-bg` | Radial gradients hero (orange + amber + paper) |
| `.grain` | Texture grain 3×3px, opacity 0.35, multiply |
| `.eyebrow` | Pill label uppercase rouge |
| `.badge-pill` | Badge flottant blanc avec ombre |
| `.person-card` | Carte blanche bord arrondi 18px |
| `.abo-btn` | Bouton 58×58px sélecteur ABO |
| `.toggle-wrap/.toggle-btn` | Groupe toggle Rh/Kell |
| `.inp` | Champ de saisie avec focus orange |
| `.res-red/.res-gray` | Dégradés header résultat exclusion/compatible |
| `.dna-box` | Bloc affilié ADN (fond orange+amber subtil) |
| `.faq-item/.faq-summary` | Accordéon FAQ natif `<details>` |
| `.step-item/.step-icon` | Étapes d'analyse (écran sombre) |
| `.stat-num` | Chiffres stats en Instrument Serif italic |
| `.progress-bar/.progress-fill` | Barre de progression 3px |
| `.blurred-content` | Flou blur-8 pour teaser |

#### Pages créées / mises à jour

| Fichier | Description |
|---|---|
| `app/page.tsx` | Landing : nav avec sélecteur langue FR/EN, badges flottants ABO/Rhésus/Kell (apparaissent +400ms, masqués mobile), eyebrow pill "Test d'exclusion de paternité", H1 "Lever le Doute / Génétique en 3 clics", stats, FAQ, footer. `'use client'` pour le dropdown et l'animation des badges. |
| `app/login/page.tsx` | Wrapper `<AuthCard defaultTab="login" />` |
| `app/signup/page.tsx` | Wrapper `<AuthCard defaultTab="register" />` |
| `components/auth-card.tsx` | Two-panel auth (gauche sombre brand, droite form). Tabs login/register, Google OAuth, hint de test sous le bouton connexion. |
| `app/app/layout.tsx` | Top bar blanc : logo + "BioPaternal", green dot, email session, bouton déconnexion. Redirect `/login` si non authentifié. |
| `app/app/test/page.tsx` | Formulaire ABO/Rh/Kell. Validation mère/enfant en temps réel. Overlay d'analyse plein écran (fond sombre, 5 étapes animées séquentiellement, durée min. 3,2 s). Groupes sanguins sauvegardés en `sessionStorage` avant le redirect paiement. |
| `app/app/result/page.tsx` | Résultat post-paiement. Chips Mère/Enfant/Père présumé lus depuis `sessionStorage`. Grille 3 systèmes (ABO/Rh/Kell) avec état `ok`/`excluded`/`notProvided`. Bloc DNA affilié (compatible uniquement). Téléchargement PDF. |
| `app/globals.css` | Système de design complet (variables CSS, toutes classes composant) |
| `tailwind.config.ts` | Palette warm étendue, fonts variables, animations `float-a/b/c` + `spin` + `shimmer` |
| `types/css.d.ts` | Fix TypeScript 2882 — `declare module '*.css'` (requis par `moduleResolution: bundler`) |

#### Flux analysant → résultat (sessionStorage)

```
[Formulaire] → click "Lancer l'analyse"
  └─ Overlay analyse affiché (5 étapes animées)
  └─ POST /api/test/analyze → token
  └─ POST /api/test/payment-intent → paymentUrl
  └─ sessionStorage.setItem('biopaternal_groups', JSON.stringify({ mother, child, father }))
  └─ window.location.href = paymentUrl

[Passerelle paiement] → redirect → /app/result?transactionId=xxx
  └─ sessionStorage.getItem('biopaternal_groups') → chips Mère/Enfant/Père
  └─ GET /api/test/result?transactionId=xxx → { visual, date }
  └─ sessionStorage.removeItem('biopaternal_groups')
```

---

### ✅ Sprint 7 — Responsive mobile + retouches landing (2026-06-12)

| Action | Fichier | Détail |
|---|---|---|
| Responsive mobile global | `app/globals.css` | Media query `@media (max-width: 640px)` — 14 règles couvrant : formulaire test (grille 1 col, section Kell, bouton submit full-width), page résultat (padding, titre clamp, grille systèmes 1 col), panel auth (colonne gauche masquée, padding réduit), landing (stats colonne, nav/footer compacts) |
| Badges flottants masqués mobile | `app/globals.css` | `.landing-badge-float { display: none !important; }` — ABO, Rhésus, Kell invisibles sur ≤ 640px |
| Eyebrow pill — texte | `app/page.tsx` | "La science, en clair" → **"Test d'exclusion de paternité"** |
| H1 hero — capitalisation | `app/page.tsx` | "doute" → **"Doute"**, "génétique" → **"Génétique"** |

**Classes responsive ajoutées dans `globals.css` :**

| Classe | Comportement mobile |
|---|---|
| `.test-page` | `padding: 16px 16px 32px` |
| `.person-cards-grid` | `grid-template-columns: 1fr` |
| `.kell-section` | `flex-direction: column`, `align-items: flex-start`, `gap: 12px` |
| `.submit-row` | `flex-direction: column`, `align-items: stretch`, `gap: 12px` |
| `.submit-row .btn-cta` | `width: 100%`, `justify-content: center` |
| `.result-header` | `padding: 24px 20px` |
| `.result-header h2` | `font-size: clamp(20px, 7vw, 32px)` |
| `.result-body` | `padding: 20px 16px`, `max-width: 100%` |
| `.systems-grid` | `grid-template-columns: 1fr` |
| `.auth-left-panel` | `display: none` (colonne brand masquée) |
| `.auth-form-panel` | `padding: 32px 24px` |
| `.landing-stats` | `flex-direction: column`, `gap: 20px`, `align-items: flex-start` |
| `.landing-nav` | `padding: 14px 20px` |
| `.landing-footer` | `padding: 16px 20px` |
| `.landing-badge-float` | `display: none` (badges ABO/Rh/Kell masqués) |

---

### ✅ Sprint 6 — Git, CI/CD, corrections build (2026-06-12)

| Action | Détail |
|---|---|
| Dépôt Git initialisé | `git init` + `.gitignore` étendu (`.env`, `.next`, `tsconfig.tsbuildinfo`) |
| Premier commit | 51 fichiers — code sprints 1–5 versionné (`.env` exclu) |
| Remote GitHub | `https://github.com/Mathusalem90/BioPaternal-V2` (public, branche `main`) |
| Vercel connecté | Projet `bio-paternal-v2` lié au dépôt — auto-deploy sur push `main` |
| Fix build script | `package.json` : `"build"` → `"prisma generate && next build"` (était `"tsc"`) |
| Documentation | Section 2 ABO simplifiée — génotypes et cas d'exclusion précis retirés |

---

### ❌ Ce qui ne fonctionne pas / bloqué sur configuration

| Problème | Cause | Action requise |
|---|---|---|
| `NEXTAUTH_URL` en prod | Actuellement `https://bio-paternal-v2.vercel.app` — à vérifier/corriger après déploiement | Dashboard Vercel → Variables environnementales → mettre l'URL finale |
| Google OAuth | `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` vides | Créer credentials Google Cloud Console |
| Paiements Stripe | `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET` vides | Activer compte Stripe + enregistrer webhook |
| Paiements FedaPay | `FEDAPAY_SECRET_KEY` et `FEDAPAY_WEBHOOK_SECRET` vides | Activer compte FedaPay |
| Paiements CinetPay | `CINETPAY_API_KEY` et `CINETPAY_SITE_ID` vides (valeur `placeholder` sur Vercel) | Activer compte CinetPay + mettre les vraies clés |
| Admin ban/reset | `app/admin/page.tsx` appelle `/api/admin/users/:id/ban` et `/api/admin/users/:id/reset-password` — routes inexistantes | Créer ces deux endpoints API |
| Admin design | `app/admin/page.tsx` utilise l'ancien design sombre — non mis à jour en Sprint 5 | Refonte visuelle admin |
| Pages responsive | ✅ Couvert en Sprint 7 — toutes les pages principales s'adaptent à ≤ 640px | — |
| Tests E2E paiement | Non testable sans credentials passerelle | Débloquer avec les vrais credentials |

---

## Arborescence complète

```
app/
├── layout.tsx                              ← Sprint 4 (fonts, SVG gradient global)
├── page.tsx                                ← Sprint 5 (landing, 'use client', lang selector)
├── sitemap.ts                              ← Sprint 4
├── robots.ts                               ← Sprint 4
├── globals.css                             ← Sprint 5 (système de design complet)
├── login/
│   └── page.tsx                            ← Sprint 5
├── signup/
│   └── page.tsx                            ← Sprint 5
├── admin/
│   └── page.tsx                            ← Sprint 3 (non redesigné)
├── documentation/
│   └── page.tsx                            ← Sprint 4
├── politique-de-confidentialite/
│   └── page.tsx                            ← Sprint 4
├── app/
│   ├── layout.tsx                          ← Sprint 5 (top bar auth)
│   ├── test/
│   │   └── page.tsx                        ← Sprint 5 (formulaire + overlay analyse)
│   └── result/
│       └── page.tsx                        ← Sprint 5 (chips sessionStorage, grille systèmes)
└── api/
    ├── auth/
    │   ├── [...nextauth]/route.ts
    │   └── signup/route.ts
    ├── report/
    │   └── [transactionId]/route.ts        ← Sprint 4
    ├── test/
    │   ├── analyze/route.ts
    │   ├── payment-intent/route.ts
    │   └── result/route.ts
    └── webhooks/
        ├── stripe/route.ts
        └── fedapay/route.ts

components/
└── auth-card.tsx                           ← Sprint 5

lib/
├── bloodCalc.ts
├── hash.ts
├── prisma.ts
├── auth.ts
├── geo.ts
├── ephemeral-token.ts
├── adminMiddleware.ts
└── pdf-report.ts                           ← Sprint 4

prisma/
├── schema.prisma
└── seed.ts

tests/
├── bloodCalc.test.ts
└── bloodCalcSecurity.test.ts

types/
├── next-auth.d.ts
└── css.d.ts                                ← Sprint 5 (fix TS2882)

middleware.ts
next.config.mjs                             ← Sprint 4
tailwind.config.ts                          ← Sprint 5
```

---

## Variables d'environnement requises

```env
# Base de données
DATABASE_URL=                  # Supabase pooler (port 6543)

# NextAuth
NEXTAUTH_URL=                  # URL de prod Vercel (ex. https://biopaternal.vercel.app)
NEXTAUTH_SECRET=               # Clé aléatoire (openssl rand -base64 32)

# Tokens
EPHEMERAL_JWT_SECRET=          # Clé aléatoire pour les tokens d'analyse

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Stripe (international)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# FedaPay (Afrique FCFA)
FEDAPAY_SECRET_KEY=
FEDAPAY_WEBHOOK_SECRET=

# CinetPay (Afrique FCFA)
CINETPAY_API_KEY=
CINETPAY_SITE_ID=
```
