# Milestone Reports

Each milestone appends a report here per the workflow in `CLAUDE.md`.

## Milestone 0: Setup — 2026-07-10

### Completed
- `CLAUDE.md` with the binding business/security/cost/architecture rules.
- `specs/SPEC.md` consolidating the product spec and acceptance gate.
- Next.js 15 App Router + TypeScript strict + Tailwind scaffold, ESLint
  (flat config), Prettier, Vitest, and Playwright configured.
- `prisma/schema.prisma`: all 11 models (User, Session, PasswordResetToken,
  Gift, GiftBlock, MediaAsset, MusicTrack, Payment, Report, GiftView,
  AnalyticsEvent, AuditLog, JobRun) with the indexes and unique constraints
  called out in the spec, including the `[provider, providerTransactionId]`
  DB-level duplicate-webhook guard on `Payment`.
- `src/config/business-rules.ts`: `FREE_ACTIVE_DURATION_DAYS = 3`,
  `VIP_ACTIVE_DURATION_DAYS = 15`, env-configurable
  `RECOVERY_DURATION_DAYS` (default 7), quotas, `activeDurationDays()`,
  `renewedVipExpiry()` (extends from current expiry, not `now()`).
- `src/env.ts`: zod-validated env (`DATABASE_URL`, `SESSION_SECRET` ≥32,
  `CRON_SECRET` ≥16 required; R2/Resend/PayOS optional; `VIP_PRICE_VND`
  default 49000).
- `.env.example` with setup comments and secret-generation commands.
- `next.config.ts`: `X-Robots-Tag: noindex, nofollow` on `/g/:slug*`,
  `poweredByHeader: false`.
- 8 module stubs (`auth`, `gifts`, `media`, `lifecycle`, `payments`, `admin`,
  `analytics`, `jobs`), each exporting only through its `index.ts`.
- `src/app/`: root layout (`lang="vi"`), placeholder home page, `globals.css`
  with `prefers-reduced-motion` support, `api/health` route.
- `.github/workflows/ci.yml`: install → lint → typecheck → test → build with
  placeholder env values.
- `README.md`, `docs/SETUP.md` (Neon/R2/Resend/PayOS/Vercel provisioning,
  Vercel build command `prisma migrate deploy && next build`).

### Files
38 files added/changed — see commit `8773689`. Full list in the commit diff;
key paths: `CLAUDE.md`, `specs/SPEC.md`, `prisma/schema.prisma`,
`src/config/business-rules.ts`, `src/env.ts`, `src/modules/*/index.ts`,
`src/app/**`, `.github/workflows/ci.yml`, `README.md`, `docs/SETUP.md`.

### Migrations
None applied. `DATABASE_URL` is not yet a real Neon connection string —
migrations are **awaiting a real `DATABASE_URL`**. No migration has been run
or claimed to have run.

### Verification (actually executed)
- `npm install` — 447 packages installed, Prisma client generated via
  `postinstall`.
- `npm run lint` — pass, 0 errors/warnings.
- `npm run typecheck` — pass, 0 errors.
- `npm run test` — pass, **4/4 tests** (`tests/unit/business-rules.test.ts`):
  Free = 3 days, VIP = 15 days, renewal adds exactly 15 days, renewal
  extends from current expiry rather than from `now()`.
- `npm run build` — pass, production build succeeded (routes: `/`,
  `/_not-found`, `/api/health`).

### Known issues
- `npm audit` reports 7 advisories (5 moderate, 1 high, 1 critical), all in
  transitive dev-tooling (`esbuild` via `vitest`'s Vite dependency; `postcss`
  bundled inside `next`'s own build tooling). `npm audit fix --force` would
  downgrade to `vitest@4` (breaking) or `next@9` (unacceptable regression),
  so left as-is; revisit when upstream ships non-breaking patches.
- Real infrastructure credentials (Neon, R2, Resend, PayOS) are not yet
  provisioned — all optional-until-configured per `src/env.ts`, documented
  in `docs/SETUP.md`, and explicitly marked "awaiting credentials" rather
  than faked.
- 3 pre-existing unrelated static HTML files (personal portfolio pages, not
  part of LoveBox) were found at the repo root and moved to `archive/`
  rather than deleted; recorded as an assumption in `CLAUDE.md`.

### Ready for Milestone 1: Foundation
Yes — Milestone 0 verify gate (lint/typecheck/test/build) is green with no
outstanding blockers.
