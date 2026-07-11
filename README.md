# LoveBox

Hộp quà kỹ thuật số cảm xúc, mobile-first, thị trường Việt Nam. This is a real
production web product — see [`CLAUDE.md`](./CLAUDE.md) for the binding rules
and [`specs/SPEC.md`](./specs/SPEC.md) for the full product spec.

## Stack

Next.js 15 (App Router) · TypeScript (strict) · Tailwind CSS · PostgreSQL (Neon)
+ Prisma · Cloudflare R2 · PayOS (VietQR) · Vitest · Playwright.

## Getting started

```bash
npm install
cp .env.example .env   # fill in real values — see docs/SETUP.md
npm run dev
```

## Verify commands

Run before every commit and required to pass in CI:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Project layout

- `src/app/` — Next.js App Router routes.
- `src/modules/*` — modular monolith; each module exposes its public API via
  `index.ts` only. Never import another module's internals.
- `src/config/business-rules.ts` — non-negotiable business constants (gift
  lifetimes, quotas). See `CLAUDE.md`.
- `src/env.ts` — the only place environment variables are read and validated.
- `src/lib/logger.ts` — structured (pino) logging; redacts secrets/PII fields.
- `src/lib/errors.ts` + `src/lib/api-handler.ts` — standard `AppError`
  hierarchy and route wrapper producing a uniform `{ error: { code, message } }`
  response; unexpected errors are logged in full server-side but never leak
  details to the client.
- `src/lib/prisma.ts` — cached Prisma client singleton.
- `src/lib/validation.ts` — `parseOrThrow(schema, data)` zod helper, throws `ValidationError`.
- `src/lib/request.ts` — `getClientIp()` for rate limiting/audit logs.
- `src/modules/auth/` — register/login/logout, password reset, session
  cookies, DB-backed rate limiting, argon2id hashing. Routes under
  `src/app/api/auth/*`.
- `src/modules/gifts/` — gift + block CRUD, ownership/IDOR checks, publish
  (DRAFT → ACTIVE), block reordering. Routes under `src/app/api/gifts/*`.
- `src/app/{login,register,forgot-password,reset-password}/` — auth pages.
  `src/app/dashboard/` — gift list. `src/app/gifts/[giftId]/` — the gift
  editor (title/message autosave, block add/reorder/delete, preview,
  publish, share-link QR code).
- `src/app/g/[slug]/` — the public, unauthenticated gift viewer.
  Unpublished/expired/suspended/deleted gifts never leak their real
  content — see `classifyGiftForViewer` in `src/modules/gifts/public.ts`.
- `src/modules/media/` — image upload (magic-byte + size validation, WebP
  re-encode via sharp, Cloudflare R2 storage), per-gift image quota. Route:
  `src/app/api/gifts/[giftId]/media/route.ts`.
- `src/config/themes.ts`, `src/config/effects.ts` — static, free theme/effect
  catalogs applied via `Gift.themeId`/`effectId`.
- `src/modules/jobs/` — expire/recovery/purge lifecycle transitions +
  orphaned-media/analytics-retention/rate-limit cleanup, all run from one
  combined cron route: `src/app/api/cron/lifecycle/route.ts` (see
  `vercel.json` for the schedule; requires the `Authorization: Bearer
  $CRON_SECRET` header — this is how Vercel Cron calls it automatically).
- `prisma/schema.prisma` — database schema. `prisma/migrations/` holds
  applied migrations; run `prisma migrate dev` locally to add new ones.
- `tests/unit/` — Vitest unit tests. `tests/e2e/` — Playwright E2E tests.
- `docs/SETUP.md` — provisioning Neon, Cloudflare R2, Resend, PayOS, Vercel.
- `docs/MILESTONE_REPORTS.md` — report appended after every milestone.

## Deployment

Deployed on Vercel. The Vercel build command must be:

```
prisma migrate deploy && next build
```

so schema migrations run automatically on every deploy (the project owner
works phone-only and cannot run a local terminal).
