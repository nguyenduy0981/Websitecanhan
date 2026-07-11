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

## Milestone 4: Editor — 2026-07-11

Confirmed before starting: owner verified `/api/health` returned
`db: "up"` after Milestone 3's deploy, and asked why the deployed site
still only showed a placeholder — expected, since Milestones 0-3 only
built the API layer with no pages to visit yet. This milestone adds the
first real UI.

### Completed
- **Session refactor** (`src/modules/auth/session.ts`, `service.ts`):
  `getSessionUser`/`requireAuth` now take a generic `CookieReader`
  interface instead of `NextRequest`, satisfied structurally by both
  `NextRequest.cookies` (Route Handlers) and `next/headers` `cookies()`
  (Server Components) — updated all 8 existing route call sites
  (`req` → `req.cookies`) accordingly. Lets Server Components check "is
  someone logged in" without an internal HTTP round-trip to their own
  `/api/auth/me`.
- **Auth pages**: `/login`, `/register`, `/forgot-password`,
  `/reset-password` (reads `?token=`) — Server Component wrappers (redirect
  to `/dashboard` if already logged in where relevant) + Client Component
  forms calling the existing Milestone 2 API routes. Accessible labels,
  `role="alert"`/`role="status"` messaging, visible focus rings.
- **Dashboard** (`/dashboard`, Server Component): redirects to `/login` if
  no session; loads the owner's gifts by calling `listGiftsForOwner()`
  directly (no network hop) rather than fetching its own API; "create
  gift" form and logout button as Client Components.
- **Gift editor** (`/gifts/[giftId]`, Server Component): redirects to
  `/login` if unauthenticated; loads the gift via `getGiftForOwner()`,
  calling Next's `notFound()` on `NotFoundError` (same IDOR-safe 404 for
  "missing" vs. "not yours" the API already enforces); renders
  `<GiftEditor>` (Client Component) with:
  - Debounced (800ms) autosave of title/message via `PATCH`.
  - Add/delete/reorder for `TEXT` blocks (up/down buttons, not
    drag-and-drop — free, and keyboard-operable for the a11y requirement
    in SPEC.md); calls the existing block + reorder API routes.
  - A read-only preview panel rendering title/message/blocks as a
    recipient roughly would.
  - Publish button (only while `DRAFT`) and draft-delete button, wired to
    the existing `publish`/`DELETE` routes.
  - Share link (`APP_URL/g/:slug`) shown once published, with a note that
    the page behind it doesn't exist until Milestone 5.
- **Homepage**: now session-aware — shows "Vào Dashboard" when logged in,
  "Đăng nhập"/"Đăng ký" when not.
- **`src/lib/gift-status-label.ts`** — small shared Vietnamese label map
  for `GiftStatus`, used by both the dashboard and editor.
- Recorded the above UI/architecture decisions in `CLAUDE.md`.

### Files
`src/modules/auth/{session,service,index}.ts` (refactor),
`src/app/api/auth/{logout,me}/route.ts` +
`src/app/api/gifts/**/route.ts` (call-site update only, `req` →
`req.cookies`), `src/app/page.tsx` (updated),
`src/app/{login,register,forgot-password,reset-password}/{page,*Form}.tsx`,
`src/app/dashboard/{page,LogoutButton,CreateGiftForm}.tsx`,
`src/app/gifts/[giftId]/{page,GiftEditor}.tsx`,
`src/lib/gift-status-label.ts`, `CLAUDE.md`.

### Migrations
None.

### Verification (actually executed)
- `npm run lint` — pass, 0 errors/warnings.
- `npm run typecheck` — pass, 0 errors.
- `npm run test` — pass, **77/77** (unchanged test count — this milestone
  is UI/pages, not new service logic; the session-refactor didn't change
  any behavior the existing 77 tests cover, confirmed by re-running the
  full suite after the refactor).
- `npm run build` — pass; all new pages compiled (`/`, `/login`,
  `/register`, `/forgot-password`, `/reset-password`, `/dashboard`,
  `/gifts/[giftId]`) alongside all prior API routes.
- **Actually ran the app**: started `next start` against this
  environment's placeholder `DATABASE_URL` (no live Postgres available
  here — see prior milestones) and verified with curl + a headless
  Chromium (Playwright, screenshots taken): `/`, `/login`, `/register`,
  `/forgot-password` all return 200 and render the expected Vietnamese
  form content; `/dashboard` and `/gifts/[anything]` both correctly
  `307`-redirect to `/login` when there's no session cookie — this is a
  real, DB-independent code path (the session check short-circuits before
  any database call when there's no cookie at all) and it worked exactly
  as designed.

### Known issues / honestly-scoped gaps
- **Could not verify the DB-backed flows end-to-end** (register → login →
  create gift → add block → reorder → publish) because this environment
  has no live Postgres to actually run them against — same limitation as
  every prior milestone. The owner can and should click through the real
  flow once this is deployed against the real Neon database; please report
  back anything that looks wrong.
- Only `TEXT` blocks can be created from the UI; `IMAGE`/`GALLERY` wait for
  Milestone 6 media upload (the API already accepts their shape, per
  Milestone 3's known gap).
- Reordering is up/down buttons, not drag-and-drop, by design (see
  CLAUDE.md) — revisit only if the owner wants drag-and-drop specifically.
- The share link shown after publishing points at `/g/:slug`, which 404s
  until Milestone 5: Public Viewer exists.
- No image/theme/effect/music pickers yet (Milestone 6).
- Same `npm audit` dev-tooling advisories as prior milestones, unchanged.

### Ready for Milestone 5: Public Viewer
Yes, pending the owner confirming the real DB-backed flows work as
expected on the live deploy.

## Milestone 5: Public Viewer — 2026-07-11

Confirmed before starting: owner registered, logged in, and reached the
dashboard successfully on the real production deploy — Milestone 4's
DB-backed flows work end-to-end on real Neon. Also resolved, during this
same session, a Vercel deploy that initially showed "Error" on the
Milestone 4 merge commit; the owner retried and it came up "Ready" /
"Current" — noting this in case the same transient-looking failure
recurs on a future deploy and is worth a closer look at build logs then.

### Completed
- **`src/modules/gifts/public.ts`**: `getGiftBySlug` (no ownership check —
  this is the intentionally-public path), `listBlocksPublic`,
  `classifyGiftForViewer` (pure function mapping `GiftStatus` → `active` /
  `unavailable` (with a friendly message) / `not_found` — `DRAFT` maps to
  `not_found` so unpublished content can never leak through a guessed or
  shared-too-early link), and `recordGiftView` (analytics write that
  **never throws**, per SPEC.md's graceful-degradation requirement — a
  failed view-count write must never take the gift content down with it).
- **`src/lib/device.ts`**: `classifyDevice(userAgent)` — coarse
  mobile/tablet/desktop bucket for `GiftView.deviceClass`, no IP or other
  PII, matching the schema's existing privacy design from Milestone 0.
- **`/g/[slug]`** (`src/app/g/[slug]/page.tsx`, public, no auth):
  - Static, generic metadata (title/description/OG/Twitter tags) that is
    **never derived from the real gift title or message** — so a social
    link preview can't leak private content to someone who hasn't opened
    the link — plus a `robots: noindex` meta tag alongside the existing
    `X-Robots-Tag` HTTP header from `next.config.ts` (defense in depth).
  - `DRAFT` and missing slugs → Next's `notFound()` (real 404 page).
  - `EXPIRED` / `SUSPENDED` / `RECOVERY` / `DELETION_PENDING` / `DELETED` →
    a friendly `UnavailableView` message, never the real content; the
    `SUSPENDED` message deliberately never mentions moderation.
  - `ACTIVE` → renders title, message, and ordered `TEXT` blocks, records a
    view, and shows a "tạo hộp quà của riêng bạn" call-to-action linking to
    `/register` (per SPEC.md: a recipient "có thể chuyển thành creator
    mới").
  - All gift text is rendered as plain JSX children — no
    `dangerouslySetInnerHTML` anywhere — so React's automatic escaping
    covers the "treat user-generated text as hostile" rule by construction.
- **QR code on the share link**: added the `qrcode` package (no new paid
  service); the gift editor's Server Component page now generates a QR
  data URL for the share link server-side and passes it down, so
  `GiftEditor` can show a scannable code next to the link once a gift is
  published.

### Files
`src/modules/gifts/public.ts`, `src/lib/device.ts`,
`src/app/g/[slug]/{page,GiftView,UnavailableView}.tsx`,
`src/app/gifts/[giftId]/{page,GiftEditor}.tsx` (QR code addition),
`src/modules/gifts/index.ts` (new exports), `package.json` (+`qrcode`,
`@types/qrcode`), `tests/unit/{gift-viewer,gift-view-tracking}.test.ts`,
`CLAUDE.md`, `README.md`.

### Migrations
None — uses the existing `Gift`/`GiftBlock`/`GiftView` tables.

### Verification (actually executed)
- `npm run lint` — pass, 0 errors/warnings.
- `npm run typecheck` — pass, 0 errors.
- `npm run test` — pass, **88/88 tests** (11 new): `classifyGiftForViewer`
  covering every `GiftStatus` (including an explicit assertion that the
  `SUSPENDED` message never contains the word "suspend"/"vi phạm" —
  encodes the "don't reveal moderation" rule as a test, not just a
  comment); `classifyDevice` edge cases (no user agent, mobile, tablet,
  desktop fallback); `recordGiftView` against a mocked Prisma client,
  including **asserting it resolves without throwing even when the
  underlying write rejects** — directly verifying the graceful-degradation
  guarantee.
- `npm run build` — pass; `/g/[slug]` registered as a dynamic route
  alongside all prior routes.
- **Actually ran the app**: verified with `curl -i` against a real
  `next start` that `/g/<any-slug>` responds with the
  `X-Robots-Tag: noindex, nofollow` header present — confirmed
  independently of the database, since the header is applied by
  `next.config.ts` regardless of how the request resolves further. The
  request returned `500` rather than a clean 404/expired page because this
  environment's `DATABASE_URL` isn't a reachable Postgres — expected,
  matches every prior milestone's limitation, and does not indicate a bug
  (`getGiftBySlug`'s DB call fails before `classifyGiftForViewer` logic
  ever runs). The status-branching logic itself is verified by the unit
  tests above instead.

### Known issues / honestly-scoped gaps
- **Could not verify the live "open a real published gift link" flow**
  end-to-end (no live Postgres in this environment, same as every prior
  milestone). Once deployed, please open a published gift's `/g/:slug`
  link for real and confirm it renders correctly — that's the one thing
  I can't check from here.
- Only `TEXT` blocks render in the viewer (matches the editor's current
  scope — `IMAGE`/`GALLERY` wait for Milestone 6).
- No music/effects playback yet (Milestone 6/8 territory) — SPEC's
  "graceful degradation" language about music/effects/analytics/email
  failing without breaking content display is honored today by simply not
  having those features yet; the analytics-never-throws behavior is
  already in place and tested for when it's needed.
- Social preview has no custom `og:image` (no media pipeline yet) — title/
  description-only previews are fine for V1 and still don't leak content.
- Same `npm audit` dev-tooling advisories as prior milestones, unchanged.

### Ready for Milestone 6: Media & Themes
Yes, pending the owner opening a real published gift's share link once
deployed to confirm the viewer renders as expected.

## Hotfix: APP_URL defaulted to localhost in production — 2026-07-11

The owner tried a real published gift's share link right after Milestone 5
deployed and hit `localhost:3000/g/... — ERR_CONNECTION_REFUSED`. Root
cause: `APP_URL` was never set in Vercel's project settings, and
`src/env.ts` silently defaulted it to `http://localhost:3000` — exactly
the kind of bug this environment's lack of a live database couldn't have
caught, since it only shows up once real users click a real link.

**Fix**: `src/env.ts` now derives `APP_URL` from Vercel's own
`VERCEL_PROJECT_PRODUCTION_URL` (preferred, stable production domain) or
`VERCEL_URL` (per-deployment fallback) whenever `APP_URL` isn't explicitly
set, so this class of bug can't silently recur — Vercel always injects one
of those two. An explicit `APP_URL` env var (e.g. a real custom domain
like `https://lovebox.vn`) still always takes priority.

### Verification (actually executed)
- `npm run test` — pass, **92/92** (4 new regression tests in
  `tests/unit/env-app-url.test.ts`, covering: explicit `APP_URL` wins even
  when Vercel env vars are present; falls back to
  `VERCEL_PROJECT_PRODUCTION_URL`; falls back to `VERCEL_URL`; only
  defaults to localhost when neither is set).
- `npm run lint` / `npm run typecheck` / `npm run build` — all pass.

### Known issue
Even with this fix, if the owner's Vercel project happens to have
`APP_URL` explicitly set to something wrong, that still wins over the
auto-detected value — recommend double-checking (or simply removing) any
`APP_URL` override in Vercel project settings so the auto-detection can do
its job, unless a real custom domain is configured.

## Milestone 6: Media & Themes — 2026-07-11

Confirmed before starting: owner hit a "forgot password" dead end (Resend
not configured — expected, worked around by registering a fresh account)
and confirmed the public gift viewer (Milestone 5) renders correctly on
the real deploy. Both consistent with prior known gaps, not new bugs.

### Completed
- **`src/modules/media/image-processing.ts`**: real magic-byte detection
  (`file-type` package — chose the v22 line specifically to dodge a known
  moderate-severity infinite-loop advisory in v13–21) allowlisting only
  `image/jpeg|png|webp|gif`; SVG is rejected by construction (not in the
  allowlist) per CLAUDE.md's "reject SVG/scripts" rule. 10MB size cap
  (reusing `QUOTAS.MAX_IMAGE_UPLOAD_MB` from Milestone 0's business-rules,
  not a new constant). Re-encodes to WebP via `sharp`
  (auto-orient, max 1600px wide, quality 82); metadata is stripped by
  simply never calling `.withMetadata()`.
- **`src/modules/media/storage.ts`**: Cloudflare R2 client
  (`@aws-sdk/client-s3`, S3-compatible, no new paid service). Throws a new
  `ServiceUnavailableError` (503) — added to `src/lib/errors.ts` — with a
  clear client-facing message when R2 isn't configured, instead of a
  confusing crash or silent no-op (unlike email, upload is a primary user
  action, so it must give real feedback).
- **`src/modules/media/service.ts`**: `uploadImageForGift` enforces the
  per-tier image quota (`QUOTAS.FREE_MAX_IMAGES_PER_GIFT` = 5,
  `VIP_MAX_IMAGES_PER_GIFT` = 20, both from Milestone 0) by counting
  `READY` `MediaAsset` rows for the gift before processing/uploading.
  Deliberately takes an already-validated `giftId`/`tier` rather than
  looking the gift up itself, to avoid a circular module dependency:
  `gifts/blocks.ts` needs `media` (to validate an IMAGE/GALLERY block's
  `mediaAssetId` is owned by the caller), so `media` cannot depend on
  `gifts` back. `assertMediaOwned`/`assertMediaListOwned` close the gap
  flagged in Milestone 3 ("mediaAssetId only shape-validated, not checked
  against a real row"). `deleteMediaAsset` is best-effort on the storage
  delete (logs a warning, still removes the DB row) so a flaky R2 call
  never blocks a block deletion the user asked for.
- **`gifts/blocks.ts`** updated: `addBlock`/`updateBlock` now call the
  above ownership checks for IMAGE/GALLERY content; `deleteBlock` cascades
  to delete the block's underlying `MediaAsset`(s) immediately (storage
  object + DB row), so a deliberate delete frees up quota right away
  rather than waiting on Milestone 7's future orphan-cleanup job (which
  targets *abandoned* uploads, a different problem).
- **`POST /api/gifts/[giftId]/media`**: multipart upload route, auth +
  ownership + editable-status checked before anything else.
- **`src/config/themes.ts`** / **`src/config/effects.ts`**: 4 static
  themes, 3 static effects (including "none") — free, no schema change
  needed since `Gift.themeId`/`effectId` already existed as plain strings.
  Effects render as a simple CSS keyframe animation
  (`.lovebox-effect-particle` in `globals.css`) that's automatically
  neutralized by the existing `prefers-reduced-motion` override from
  Milestone 0 — no extra a11y code needed.
- **Editor UI** (`GiftEditor.tsx`): file input uploads an image then
  creates an `IMAGE` block referencing it; theme/effect `<select>` pickers
  wired into the existing autosave debounce; preview panel now applies the
  chosen theme's classes and renders `IMAGE` blocks inline.
- **Public viewer** (`GiftView.tsx`): renders `IMAGE` blocks, applies the
  gift's theme, and overlays the chosen effect (`EffectOverlay.tsx`) — all
  purely decorative (`aria-hidden`, `pointer-events-none`).
- Music selection UI intentionally **not** built — see CLAUDE.md's
  Milestone 6 note: no real seed tracks and no admin panel yet to manage
  them (Milestone 9), so a picker now would be non-functional.

### Files
`src/modules/media/{storage,image-processing,service,index}.ts`,
`src/app/api/gifts/[giftId]/media/route.ts`,
`src/modules/gifts/{blocks,index}.ts` (updated), `src/lib/errors.ts`
(+`ServiceUnavailableError`), `src/config/{themes,effects}.ts`,
`src/app/gifts/[giftId]/{GiftEditor,page}.tsx` (updated),
`src/app/g/[slug]/{GiftView,page,EffectOverlay}.tsx`, `globals.css`
(effect keyframes), `package.json` (+`@aws-sdk/client-s3`, `file-type`),
`tests/unit/media-{image-processing,service}.test.ts`, `CLAUDE.md`,
`README.md`, `docs/SETUP.md`.

### Migrations
None — uses the existing `MediaAsset`, `Gift.themeId`/`effectId` columns.

### Verification (actually executed)
- `npm run lint` / `npm run typecheck` — pass, 0 errors.
- `npm run test` — pass, **110/110 tests** (22 new): magic-byte rejection
  of SVG/non-image content, size-limit rejection, corrupted-but-magic-byte-
  matching input rejection, a real PNG round-tripped to WebP with correct
  dimensions asserted; quota enforcement (FREE vs VIP limits) against a
  mocked Prisma client; ownership checks for single (`IMAGE`) and batched
  (`GALLERY`) media references; delete-is-best-effort-on-storage-failure;
  URL-map lookup silently omitting unresolvable ids.
- `npm run build` — pass; new `/api/gifts/[giftId]/media` route registered.
- **Actually ran the app**: started a real `next start` and confirmed
  `/register` and `/login` still render 200 (regression check after the
  editor/viewer refactor); could not exercise the actual upload → R2 →
  MediaAsset flow end-to-end here, for the same two reasons as every prior
  milestone (no live Postgres, and R2 credentials aren't configured in
  this environment either).

### Known issues / honestly-scoped gaps
- **R2 has not been configured yet** (per the owner's setup progress so
  far) — until `R2_ACCOUNT_ID`/`R2_ACCESS_KEY_ID`/`R2_SECRET_ACCESS_KEY`/
  `R2_BUCKET`/`R2_PUBLIC_URL` are all set in Vercel, image upload will
  return a clear "not configured yet" error rather than fail silently or
  fake success (per CLAUDE.md Honesty) — see `docs/SETUP.md` for the exact
  steps.
- **No live Postgres in this environment** — same caveat as every prior
  milestone; the quota/ownership/upload logic is verified against a mocked
  Prisma client, not real Neon.
- Only single-image `IMAGE` blocks are creatable from the UI; `GALLERY`
  (multi-image) blocks are schema/API-ready (ownership validation already
  handles the array case) but have no "add gallery" UI yet — noted as a
  follow-up, not a blocker.
- Music selection has no UI (see "Completed" above) — needs real seed
  tracks and Milestone 9's admin panel first.
- Replacing an image on an existing block (update, not delete) doesn't yet
  release the old `MediaAsset` — only block *deletion* cascades. Minor
  quota-accounting edge case, worth tightening alongside Milestone 7's
  cleanup jobs.
- Same `npm audit` dev-tooling advisories as prior milestones, unchanged
  (file-type's own advisory is now resolved by using v22).

### Ready for Milestone 7: Lifecycle
Yes — recommend the owner finish R2 setup (docs/SETUP.md) before relying
on image upload in production; everything else in this milestone doesn't
require it to keep working (TEXT blocks, themes, effects all function
without R2).
