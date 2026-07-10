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

## Milestone 2: Authentication — 2026-07-10

Confirmed before starting: owner verified `/api/health` returned
`db: "up"` after merging Milestone 1 into `main` and redeploying, so
`20260710164422_init` is applied to the real Neon database.

### Completed
- **Schema**: added `RateLimitHit` model (DB-backed rate limiting, no new
  paid infra) and migration `20260710202645_add_rate_limit_hits`, generated
  via schema-to-schema diff (still no live DB in this environment) and
  re-validated with `prisma validate`.
- **`src/modules/auth/password.ts`** — argon2id hash/verify (never throws on
  a malformed hash; returns `false`).
- **`src/modules/auth/session.ts`** — random 256-bit session tokens; only an
  HMAC-SHA256(SESSION_SECRET) hash of the token is ever persisted (DB leak
  alone can't be replayed as a cookie); HTTP-only, `secure` (in production),
  `sameSite=lax` cookie helpers.
- **`src/modules/auth/rate-limit.ts`** — sliding-window limiter backed by
  `RateLimitHit` (Neon): login 10/15min (IP and email independently),
  register 5/hour (IP), password-reset 3/hour (IP and email); opportunistic
  cleanup of expired hit rows on every check.
- **`src/modules/auth/email.ts`** — Resend wrapper for the password-reset
  email; no-ops with a logged warning when `RESEND_API_KEY`/`EMAIL_FROM`
  aren't configured yet ("awaiting credentials" per CLAUDE.md Honesty),
  rather than failing the whole reset flow.
- **`src/modules/auth/service.ts`** — `registerUser`, `loginUser`,
  `logoutUser`, `requestPasswordReset`, `resetPassword`, `getSessionUser`,
  `requireAuth`. Login and password-reset never reveal whether an
  email/account exists (generic messages); password reset is single-use and
  invalidates all of the user's other sessions in one DB transaction;
  suspended accounts are rejected before password verification even runs.
- **`src/lib/validation.ts`** (`parseOrThrow`) and **`src/lib/request.ts`**
  (`getClientIp`) — small generic helpers, reusable by later modules.
- **Routes** (all via `withApiHandler`): `POST /api/auth/register`,
  `/login`, `/logout`, `/request-password-reset`, `/reset-password`,
  `GET /api/auth/me`.
- **`src/modules/auth/index.ts`** — public API only (service functions,
  zod schemas, cookie helpers); nothing else in the module is imported
  elsewhere, per the "no reaching into module internals" rule.
- Added `tests/setup.ts` (+ `vitest.config.ts` `setupFiles`) so `npm run
  test` no longer depends on the caller's shell exporting fake env vars.
- Recorded Milestone 2 decisions (session/token lifetimes, password policy,
  rate-limit thresholds, enumeration-avoidance choices) in `CLAUDE.md`.

### Files
`prisma/schema.prisma` (+`RateLimitHit`),
`prisma/migrations/20260710202645_add_rate_limit_hits/`,
`src/modules/auth/{password,session,rate-limit,email,service,schemas,index}.ts`,
`src/lib/{validation,request}.ts`,
`src/app/api/auth/{register,login,logout,request-password-reset,reset-password,me}/route.ts`,
`tests/unit/{password,session,rate-limit,auth-schemas,auth-service}.test.ts`,
`tests/setup.ts`, `vitest.config.ts`, `CLAUDE.md`, `README.md`.

### Migrations
`20260710202645_add_rate_limit_hits` added — **not yet applied to the real
Neon database**; requires the next deploy of `main`, same as any migration.

### Verification (actually executed)
- `npm run lint` — pass, 0 errors/warnings.
- `npm run typecheck` — pass, 0 errors.
- `npm run test` — pass, **41/41 tests**, including:
  - Real argon2id hash/verify round-trips (not mocked).
  - Real HMAC session-token hashing (determinism, uniqueness, never equals
    the raw token).
  - Rate-limit threshold boundary logic.
  - Zod schema edge cases (email normalization, password length, etc).
  - Auth **service-layer logic against a mocked Prisma client** (`vi.mock`)
    covering: password never stored in plaintext, duplicate-email
    rejection, rate-limiter short-circuiting before any DB lookup, correct
    vs. wrong-password login, generic "no such user" vs "wrong password"
    messaging, suspended-account rejection, logout deleting the right
    session row, password-reset token creation/no-op-for-unknown-email,
    and reset rejecting unknown/expired/already-used tokens while
    correctly invalidating sessions on success.
- `npm run build` — pass, production build succeeded; all 6 new auth
  routes + `/api/auth/me` registered as dynamic routes.

### Known issues / honestly-scoped gaps
- **No live Postgres was available in this environment**, so the tests
  above exercise real business logic against a *mocked* Prisma client, not
  a real database. This is not a substitute for an integration test against
  actual Neon — recommend adding one (e.g. via a CI Postgres service
  container) in Milestone 11: Testing & Hardening, or sooner if you'd like
  it prioritized.
- Email verification (`User.emailVerified`) is not sent/enforced yet —
  intentionally out of scope per SPEC.md's V1 auth list (register, login,
  logout, reset); can be added as a follow-up if wanted.
- Rate-limit state (`RateLimitHit` rows) is pruned opportunistically on each
  check rather than by a dedicated cleanup job; a proper retention job
  belongs in Milestone 7: Lifecycle background jobs.
- No frontend UI yet for register/login/reset — this milestone is the API
  layer only, consistent with the roadmap (editor/pages come in later
  milestones).
- Same `npm audit` dev-tooling advisories as prior milestones, unchanged.

### Ready for Milestone 3: Gift Core
Yes, once the pending deploy applies `20260710202645_add_rate_limit_hits`
to Neon.

## Milestone 3: Gift Core — 2026-07-10

Confirmed before starting: owner verified `/api/health` returned `db: "up"`
after merging Milestone 2 into `main` and redeploying.

### Completed
- **`src/modules/gifts/slug.ts`** — 72-bit random URL-safe slugs
  (`crypto.randomBytes(9).toString("base64url")`); uniqueness is enforced by
  retrying on the DB's own unique-constraint error at insert time rather
  than a separate existence check first (which would be a check-then-act
  race under concurrent requests).
- **`src/modules/gifts/authorization.ts`** — `getGiftForOwner()` returns the
  identical `NotFoundError` whether a gift doesn't exist or belongs to
  someone else, so an attacker can't distinguish the two cases (IDOR
  protection per CLAUDE.md); `assertEditable()` gates all mutations to
  `DRAFT`/`ACTIVE` gifts only.
- **`src/modules/gifts/service.ts`** — `createGift`, `listGiftsForOwner`,
  `updateGift`, `deleteGift` (DRAFT-only hard delete), `publishGift`
  (DRAFT → ACTIVE; requires ≥1 block; sets `activeExpiresAt` from
  `activeDurationDays(tier)` in `src/config/business-rules.ts` — reused,
  not reimplemented, so the 3-day/15-day rule stays in one place).
- **`src/modules/gifts/blocks.ts`** — `listBlocks`, `addBlock` (auto-appends
  at the end), `updateBlock` (content re-validated against the block's own
  type schema, since a block's `type` is immutable after creation),
  `deleteBlock`, `reorderBlocks` (validates the payload is exactly the
  gift's existing block ids, then does a **two-phase position update** —
  temp offset, then final index — inside one `$transaction`, since a
  single-phase swap could momentarily collide with the
  `@@unique([giftId, position])` constraint).
- **`src/modules/gifts/schemas.ts`** — `createGiftSchema`/`updateGiftSchema`;
  a zod discriminated union over `GiftBlockType` (`TEXT`/`IMAGE`/`GALLERY`)
  so each block type validates its own content shape;
  `reorderBlocksSchema`.
- **Routes** (all via `withApiHandler` + `requireAuth`): `GET/POST
  /api/gifts`, `GET/PATCH/DELETE /api/gifts/[giftId]`, `POST
  /api/gifts/[giftId]/publish`, `GET/POST /api/gifts/[giftId]/blocks`,
  `PATCH/DELETE /api/gifts/[giftId]/blocks/[blockId]`, `PUT
  /api/gifts/[giftId]/blocks/reorder`.
- **`src/modules/gifts/index.ts`** — public API only, per the "no reaching
  into module internals" rule.

### Files
`src/modules/gifts/{slug,authorization,service,blocks,schemas,index}.ts`,
`src/app/api/gifts/route.ts`,
`src/app/api/gifts/[giftId]/{route,publish/route}.ts`,
`src/app/api/gifts/[giftId]/blocks/{route,reorder/route}.ts`,
`src/app/api/gifts/[giftId]/blocks/[blockId]/route.ts`,
`tests/unit/{gift-slug,gift-schemas,gift-service,gift-blocks}.test.ts`,
`CLAUDE.md`, `README.md`.

### Migrations
None. This milestone only adds application code on top of the existing
`Gift`/`GiftBlock` tables from Milestone 0's initial migration.

### Verification (actually executed)
- `npm run lint` — pass, 0 errors/warnings.
- `npm run typecheck` — pass, 0 errors (dynamic route params typed as
  `{ params: Promise<{ giftId: string }> }>`, matching the pattern
  established in Milestone 1 for Next.js 15's route type-checker).
- `npm run test` — pass, **77/77 tests** (36 new: slug format/uniqueness,
  gift/block schema edge cases, and gift/block service-layer logic against
  a mocked Prisma client — same rationale as Milestone 2: no live Postgres
  in this environment). New coverage includes: slug retried on a simulated
  unique-constraint collision then succeeding; `getGiftForOwner` returning
  the same error for "missing" and "not yours"; edits/deletes/publish
  rejected outside their allowed status; publish rejected with zero blocks;
  **publish expiry verified to be exactly 3 days for FREE and 15 days for
  VIP** (cross-checks Milestone 0's business-rules constants end-to-end);
  block position assignment on add; content-schema mismatch rejected on
  update; reorder rejecting a mismatched id set and exercising the
  two-phase `$transaction` (asserted 4 ops for a 2-block reorder).
- `npm run build` — pass; all 6 new gift/block routes registered as dynamic
  routes.

### Known issues / honestly-scoped gaps
- **No live Postgres in this environment** — same caveat as Milestone 2:
  tests exercise real logic against a mocked Prisma client, not real Neon.
- `IMAGE`/`GALLERY` block `content.mediaAssetId` is only shape-validated
  (a non-empty string) — it is **not** checked against a real `MediaAsset`
  row, ownership, or the per-tier image quota in CLAUDE.md, since media
  upload doesn't exist until Milestone 6: Media & Themes. Recorded in
  CLAUDE.md so this isn't forgotten.
- No pagination on `GET /api/gifts` (`listGiftsForOwner` returns every gift
  a user owns). Fine at V1 scale; worth revisiting if a creator can
  accumulate very many gifts.
- No frontend UI yet — this milestone is the API layer only, consistent
  with the roadmap (Milestone 4: Editor builds the UI on top of these
  routes).
- Same `npm audit` dev-tooling advisories as prior milestones, unchanged.

### Ready for Milestone 4: Editor
Yes, once this deploy is live (no migration pending this time, so the
usual `/api/health` check is optional, but still fine to confirm).
