# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # dev server (port 3001 on this machine — port 3000 may be occupied)
npm run build        # prisma generate && next build
npm run test         # vitest run (all tests)
npm run seed         # seed admin user (admin@biopaternal.local / Admin123!)
npx vitest run tests/bloodCalc.test.ts   # run a single test file
```

> **Vercel build rule:** `build` must stay as `"prisma generate && next build"`. A plain `"tsc"` does not produce `.next/` and causes `DEPLOYMENT_NOT_FOUND`.

## Architecture

### Request flow (happy path)

```
POST /api/test/analyze          → assessPaternity() in RAM → signed ephemeral JWT (1h TTL)
POST /api/test/payment-intent   → verify JWT → create PENDING Transaction → redirect to gateway
[Webhook] /api/webhooks/stripe  → verify sig → mark SUCCESSFUL → increment GlobalStat
GET  /api/test/result           → verify session + SUCCESSFUL → decode resultType from Transaction
GET  /api/report/:id            → verify session + SUCCESSFUL → stream PDF
```

The result is **never returned from `/api/test/analyze`** — only a visual label and a JWT. The real `resultType` is sealed inside the JWT, written to `Transaction.resultType` at payment-intent creation, and only re-read at report time. This prevents circumventing payment.

### Core algorithm — `lib/bloodCalc.ts`

`assessPaternity(mother, father, child)` is the central function. It returns `'EXCLUSION'` or `'INCAPACITY_TO_EXCLUDE'`. It is **strictly in-memory** — it has a runtime guard that throws if a Prisma global is detected. Never import Prisma inside this file.

Kell special case: two `K-` parents can never produce a `K+` child — this is checked first before the generic compatibility logic.

### Payment multi-gateway — `lib/geo.ts`

Gateway selection is based on the `x-vercel-ip-country` header (set by Vercel's edge):
- `FEDAPAY` → Bénin, Togo, Guinée-Bissau (XOF)
- `CINETPAY` → Côte d'Ivoire, Sénégal, Mali, Burkina, Niger, Cameroun, Congo, Gabon, Centrafrique, Tchad, Guinée Éq., RDC (XOF)
- `STRIPE` → everything else (EUR)

Prices come from env vars `TEST_PRICE_EUR_CENTS`, `TEST_PRICE_XOF`, `TEST_PRICE_USD_CENTS`.

### Ephemeral token — `lib/ephemeral-token.ts`

HS256 JWT signed with `EPHEMERAL_JWT_SECRET`, 1h TTL. Payload: `{ resultType, country }`. Verified at payment-intent creation; the decoded `resultType` is written to `Transaction.resultType` for later webhook/report use.

### Auth & route protection — `middleware.ts`

| Path prefix | Rule |
|---|---|
| `/api/admin/*` | 403 if `token.role !== 'ADMIN'` |
| `/admin/*` | redirect `/` if not ADMIN |
| `/app/*` | redirect `/login` if no session |

### RGPD invariant — `GlobalStat`

`GlobalStat` has **no `@relation` to `User` or `Transaction`** by design. It stores only anonymous aggregate counts (`exclusionCount`, `compatibilityCount`) per `(date, country)`. Do not add any relational fields to this model.

### SessionStorage bridge

The test form saves blood groups to `sessionStorage` under key `biopaternal_groups` before redirecting to the payment gateway. The result page reads them back to render the Mère/Enfant/Père chips, then removes them. This is intentional — no blood data persists server-side.

### CSS & design system

All design tokens and component classes are in `app/globals.css` (no Tailwind utilities used directly in JSX). Key classes: `.btn-cta`, `.stage-bg`, `.grain`, `.badge-pill`, `.eyebrow`, `.faq-item`, `.landing-badge-float`. Responsive overrides at `@media (max-width: 640px)`.

Floating animation keyframes (`animate-float-a/b/c`) are defined in `tailwind.config.ts`.

### PDF generation — `lib/pdf-report.ts`

Uses `pdfkit`. Must remain in `serverComponentsExternalPackages` in `next.config.mjs` — pdfkit resolves its own font files at runtime and cannot be bundled by Next.js.

## Auth & variables d'environnement

Le projet utilise Next.js et Auth.js (NextAuth v4) pour l'authentification Google. Les variables d'environnement sont stockées dans `.env` et ne doivent jamais être exposées — ce fichier est exclu du dépôt via `.gitignore` et ne doit jamais être commité.

## Database

Supabase PostgreSQL via the connection pooler (port 6543 — port 5432 is blocked on the local network). Schema managed with Prisma 4. After any schema change: `npx prisma migrate dev` then `npx prisma generate`.

## Missing / not yet implemented

- `GET/POST /api/admin/users/:id/ban` and `/api/admin/users/:id/reset-password` — routes called by `app/admin/page.tsx` but not created yet
- Real credentials for Google OAuth, Stripe, FedaPay, CinetPay — all currently empty in Vercel env vars
- `app/admin/page.tsx` — uses old dark design, not updated to Sprint 5 warm paper/orange style
