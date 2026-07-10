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

## Milestone 1: Foundation — 2026-07-10

### Important finding
`prisma/migrations/` did not exist anywhere in the repo until this milestone.
That means the Vercel deploy reported at the start of this milestone — the
one that ran `prisma migrate deploy && next build` — had **zero migrations
to apply**. `prisma migrate deploy` is a no-op when no migration files
exist; it does not create tables from `schema.prisma` directly. So although
that deploy succeeded, **no tables exist yet in the real Neon database.**
The init migration added below fixes this, but it only takes effect on the
**next** deploy — a redeploy (or new push) is required before the schema
actually exists in Neon.

### Completed
- **Initial migration**: `prisma/migrations/20260710164422_init/` generated
  via `prisma migrate diff --from-empty --to-schema-datamodel` (no live DB
  was available in this environment to run `prisma migrate dev`; the SQL
  diff approach produces an equivalent migration without needing one).
  Contains all enums, tables, indexes, unique constraints, and foreign keys
  from `schema.prisma`, including the duplicate-webhook DB guard on
  `Payment`. `prisma/migrations/migration_lock.toml` pins the `postgresql`
  provider. Schema re-validated with `prisma validate` and `prisma format`.
- **Prisma client singleton** (`src/lib/prisma.ts`): cached on `globalThis`
  in non-production so dev hot-reload doesn't exhaust Neon's connection
  limit.
- **Structured logging** (`src/lib/logger.ts`): pino-based, JSON in
  production, pretty-printed in dev, disabled transport under test (verified
  `NODE_ENV=test` is set automatically by Vitest). Redacts `password`,
  `passwordHash`, `token`, `secret`, `apiKey`, `checksumKey`, `email`, and
  related fields at any nesting depth reachable by our redact paths, plus a
  `createRequestLogger(requestId, extra)` helper for per-request/job child
  loggers.
- **Standard error handling**:
  - `src/lib/errors.ts` — `AppError` abstract base class and
    `ValidationError` (400), `UnauthorizedError` (401), `ForbiddenError`
    (403), `NotFoundError` (404), `ConflictError` (409), `RateLimitedError`
    (429), `InternalError` (500, never exposes its real message).
    `serializeError()` converts any thrown value into the uniform
    `{ error: { code, message } }` shape, collapsing unknown/internal
    errors to a generic message so nothing server-internal ever reaches
    the client.
  - `src/lib/api-handler.ts` — `withApiHandler()` wraps a Next.js App
    Router route handler: assigns a `crypto.randomUUID()` request id,
    attaches a request-scoped logger, catches thrown errors, logs 4xx
    `AppError`s at `warn` and everything else at `error` (full error incl.
    stack, server-side only), and always returns the standard JSON error
    shape with an `x-request-id` response header for support/debugging.
- **App-level error boundaries**: `src/app/error.tsx` (route-segment
  errors), `src/app/global-error.tsx` (root-layout errors, own
  `<html>/<body>`), `src/app/not-found.tsx` (404) — Vietnamese copy,
  keyboard-focusable retry/home actions, `role="alert"` on the message.
- **`/api/health`** rewritten on top of `withApiHandler` + the Prisma
  singleton: runs `SELECT 1`, returns `{ ok: true, db: "up" }` or
  `503 { ok: false, db: "down" }` if the database is unreachable — this is
  also the first real exercise of the logger + error-handler + Prisma
  client working together.
- Recorded the logging/error-handling design as an assumption in
  `CLAUDE.md` (owner may override).

### Files
`prisma/migrations/20260710164422_init/migration.sql`,
`prisma/migrations/migration_lock.toml`, `src/lib/prisma.ts`,
`src/lib/logger.ts`, `src/lib/errors.ts`, `src/lib/api-handler.ts`,
`src/app/error.tsx`, `src/app/global-error.tsx`, `src/app/not-found.tsx`,
`src/app/api/health/route.ts` (rewritten), `tests/unit/errors.test.ts`,
`tests/unit/logger.test.ts`, `CLAUDE.md`, `README.md`,
`eslint.config.mjs` (ignore generated `next-env.d.ts`), `package.json`
(added `pino`, `pino-pretty`).

### Migrations
`20260710164422_init` added (see "Important finding" above) — **not yet
applied to the real Neon database**; will apply automatically on the next
Vercel deploy via `prisma migrate deploy`.

### Verification (actually executed)
- `npm install` — added `pino` + `pino-pretty`, Prisma client regenerated.
- `npm run lint` — pass, 0 errors/warnings.
- `npm run typecheck` — pass, 0 errors (required one fix: `withApiHandler`'s
  route-context generic had to structurally match Next 15's generated
  `{ params: Promise<...> }` route-context type, or Next's own build-time
  type check on `/api/health` failed).
- `npm run test` — pass, **10/10 tests** (4 business-rules + 5 errors + 1
  logger redaction).
- `npm run build` — pass, production build succeeded (routes: `/`,
  `/_not-found`, `/api/health`).

### Known issues
- Same `npm audit` dev-tooling advisories noted in Milestone 0 (esbuild via
  Vitest's Vite dependency, postcss bundled inside Next's own tooling) —
  unchanged, still not actionable without an unacceptable downgrade.
- The Neon database has no tables until the next deploy runs the new
  migration (see "Important finding").
- Rate limiting (login/register/reset) is intentionally deferred to
  Milestone 2: Authentication per the roadmap, not part of this milestone's
  scope.

### Ready for Milestone 2: Authentication
Yes, once the pending redeploy has applied `20260710164422_init` to Neon —
recommend confirming `/api/health` returns `db: "up"` in production after
that deploy before starting Milestone 2.
