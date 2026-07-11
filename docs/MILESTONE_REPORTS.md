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

## Milestone 7: Lifecycle — 2026-07-11

Confirmed before starting: owner does not have an international card yet
to add to Cloudflare (required even for R2's free tier), so R2 setup is
deferred — agreed to proceed with Milestone 7 (which doesn't depend on
R2) and come back to R2 later. Also worked through a Cloudflare dashboard
navigation question along the way (unrelated to code).

### Completed
- **`src/modules/jobs/lifecycle.ts`** — the four automatic status
  transitions, each processing only rows whose `statusChangedAt` predates
  the *current* run's start time, so every intermediate status
  (`EXPIRED`, `RECOVERY`, `DELETION_PENDING`) is guaranteed to be a real,
  observable state for at least one full cron interval rather than
  collapsing through several transitions within a single invocation:
  - `expireActiveGifts`: `ACTIVE` & `activeExpiresAt` passed → `EXPIRED`.
  - `promoteExpiredToRecovery`: `EXPIRED` (from a prior run) → `RECOVERY`,
    `recoveryEndsAt = now + RECOVERY_DURATION_DAYS` (reuses the Milestone 0
    constant, currently 7).
  - `promoteRecoveryToDeletionPending`: `RECOVERY` & `recoveryEndsAt`
    passed → `DELETION_PENDING`.
  - `purgeDeletionPendingGifts`: `DELETION_PENDING` (from a prior run) →
    for each gift, deletes every `MediaAsset` (DB row + R2 object, via the
    `media` module) and every `GiftBlock`, clears
    `title`/`message`/`themeId`/`effectId`/`musicId`, sets `DELETED` +
    `deletedAt`. The `Gift` row itself is kept (not hard-deleted) so
    `Payment`/`GiftView`/`AnalyticsEvent` rows referencing it aren't
    cascade-deleted along with it — matches CLAUDE.md: "permanently delete
    gift content AND all associated storage objects" (content and
    storage, not the historical record).
- **`src/modules/jobs/cleanup.ts`**:
  - `cleanupOrphanedMedia`: deletes `READY` `MediaAsset` rows (older than
    a 1-day grace period) that no `GiftBlock` in their gift actually
    references — closes the Milestone 6 known gap where replacing a
    block's image didn't release the old asset, and also catches uploads
    abandoned mid-edit.
  - `cleanupOldAnalytics`: trims `AnalyticsEvent` and `GiftView` past
    `ANALYTICS_RETENTION_DAYS` (90, from Milestone 0).
  - `cleanupOldRateLimitHits`: bulk-sweeps `RateLimitHit` rows older than
    a day — the Milestone 2 per-request opportunistic cleanup never
    touches a rate-limit key that's hit once and never again.
- **`src/modules/jobs/job-run.ts`** (`runJob`): wraps each step, recording
  a `JobRun` row (`startedAt`/`finishedAt`/`ok`/`itemsProcessed`/`error`)
  and never letting one step's failure stop the others in the same
  invocation.
- **`src/modules/jobs/index.ts`** (`runLifecycleJobs`): runs all 7 steps
  in order from one function, returning a summary.
- **`/api/cron/lifecycle`**: the single cron entry point, requires
  `Authorization: Bearer $CRON_SECRET` (401 otherwise) — this is exactly
  the header Vercel Cron sends automatically when `CRON_SECRET` is set as
  an env var, no extra Vercel configuration needed beyond `vercel.json`.
- **`vercel.json`**: daily schedule (`0 3 * * *` UTC ≈ 10am Vietnam time)
  for `/api/cron/lifecycle`. Deliberately **one combined route** for all 7
  steps rather than separate cron schedules per step, since Vercel's
  Hobby/free plan caps cron frequency at once/day and limits the number of
  cron schedules — see CLAUDE.md Cost rules.

### Files
`src/modules/jobs/{job-run,lifecycle,cleanup,index}.ts`,
`src/app/api/cron/lifecycle/route.ts`, `vercel.json`,
`tests/unit/jobs-{lifecycle,cleanup,job-run}.test.ts`, `CLAUDE.md`,
`README.md`.

### Migrations
None — uses existing `Gift`/`GiftBlock`/`MediaAsset`/`AnalyticsEvent`/
`GiftView`/`RateLimitHit`/`JobRun` tables.

### Verification (actually executed)
- `npm run lint` / `npm run typecheck` — pass, 0 errors.
- `npm run test` — pass, **123/123 tests** (13 new): each lifecycle
  transition's `where`/`data` asserted directly against a mocked Prisma
  client, including the exact `recoveryEndsAt` math (7 days) and the
  `statusChangedAt < jobStartedAt` run-boundary guard on every promotion
  step; purge asserted to delete every media asset + all blocks, clear
  content fields, and set `DELETED` while leaving the `Gift` row itself
  intact; orphan detection correctly distinguishing a referenced `IMAGE`
  asset from an unreferenced one and correctly reading `GALLERY` items
  arrays; analytics retention cutoff asserted at exactly 90 days;
  `runJob` asserted to record a `JobRun` row and never throw even when the
  wrapped step itself throws.
- `npm run build` — pass; `/api/cron/lifecycle` registered.
- **Actually ran the app**: built and started a real `next start` with a
  known `CRON_SECRET`, then used `curl` to confirm the auth guard for
  real: no `Authorization` header → `401`; wrong secret → `401`; correct
  secret → passes the auth check and attempts to run (fails only on the
  DB connection, since this environment has no live Postgres — the
  by-now-familiar limitation — and correctly returns the generic
  `{"error":{"code":"INTERNAL_ERROR",...}}` shape rather than leaking
  internals).

### Known issues / honestly-scoped gaps
- **No live Postgres in this environment** — same caveat as every prior
  milestone; the actual end-to-end sequence (a gift really expiring, going
  through recovery, and being purged over real time) has not been
  observed against a live database. Recommend the owner (or a future
  session) checks the `JobRun` table after the first few scheduled runs in
  production to confirm each step is completing with `ok: true`.
- The full DRAFT→...→DELETED journey takes at minimum `3 + 7 = 10` days
  (FREE tier) or `15 + 7 = 22` days (VIP) to observe naturally in
  production — not something crammable into this session; the unit tests
  substitute for that by asserting the transition logic and timing math
  directly.
- R2 still isn't configured (owner deferred it — see conversation above),
  so `purgeDeletionPendingGifts`'s media-deletion step will hit the same
  `ServiceUnavailableError` `deleteMediaAsset` throws internally — but
  since that call is intentionally best-effort (Milestone 6:
  `deleteMediaAsset` logs a warning and still deletes the DB row on a
  storage-delete failure), a gift with images can still fully purge even
  without R2 configured; only the (currently nonexistent, since R2 isn't
  set up) storage objects would be left behind.
- Cron scheduling itself (does Vercel actually invoke it daily as
  configured) can only be confirmed once deployed and observed over a day
  or two — not verifiable from this environment.
- Same `npm audit` dev-tooling advisories as prior milestones, unchanged.

### Ready for Milestone 8: VIP & Payments
Yes.

## Milestone 8: VIP & Payments — 2026-07-11

Confirmed before starting: owner doesn't have an international card yet
for Cloudflare R2's required verification, so R2 setup is deferred (agreed
to revisit later); proceeded with this milestone since it doesn't depend
on R2. This is the highest-risk milestone so far (real money), so before
writing any code I looked up PayOS's actual current API rather than
relying on possibly-stale training knowledge — see "Completed" below.

### Completed
- **Researched PayOS's real API first**: found there's an official,
  actively-published Node SDK (`@payos/node`, npm latest v2.0.5, requires
  Node 20+ — this project already requires ≥20). Rather than trust web
  summaries, installed it into a scratch directory and read its actual
  `.d.ts` type definitions and the `webhooks.verify()` source directly —
  confirmed it throws `WebhookError` (a `PayOSError` subclass) on any
  signature/data mismatch and otherwise returns the verified `WebhookData`.
  Used the SDK directly instead of hand-rolling HMAC verification, since
  PayOS's own team maintains and tests that crypto code.
- **`src/modules/payments/provider.ts`** — `PaymentProvider` interface
  (per CLAUDE.md Architecture) so PayOS is swappable later without
  touching the activation logic.
- **`src/modules/payments/providers/payos.ts`** — wraps
  `paymentRequests.create()` (checkout) and `webhooks.verify()` (throws →
  we translate to `ValidationError`, never activate). Guarded by a new
  `ServiceUnavailableError` (503) when `PAYOS_CLIENT_ID`/`PAYOS_API_KEY`/
  `PAYOS_CHECKSUM_KEY` aren't all configured — same "awaiting credentials"
  honesty pattern as R2 in Milestone 6.
- **`src/modules/payments/service.ts`**:
  - `createVipCheckout(userId, giftId)`: only `DRAFT`/`ACTIVE` gifts
    eligible; generates a collision-retried numeric `orderCode`
    (`Date.now() * 1000 + random(0,999)`, same retry pattern as gift slugs
    from Milestone 3); creates a `Payment` row *before* calling PayOS, so
    there's always a server-side record to match a webhook against.
  - `handlePaymentWebhook(rawBody)` — the only path that can ever activate
    VIP, implementing every clause of CLAUDE.md's P0 payment rule in order:
    1. Signature verified by the PayOS SDK; throws propagate — nothing
       below this line runs for a forged webhook.
    2. Only a genuine success notification (`success === true && code ===
       '00'`) proceeds; everything else is logged and ignored.
    3. Unknown `orderCode` → logged and ignored (no matching `Payment`).
    4. Already-`ACTIVATED` → early-exit no-op (fast-path idempotency).
    5. **Exact amount + currency**, checked against what *our own server*
       recorded at checkout time (never the webhook's own claims) — a
       mismatch sets `REJECTED` and returns without activating.
    6. **Exactly-once activation**: one interactive Prisma transaction
       where an `updateMany({ where: { status: { notIn: ['ACTIVATED'] } }
       })` claim and the `Gift.tier`/`activeExpiresAt` update commit or
       roll back together. This was a deliberate design correction made
       *during* this milestone — an earlier two-step version (claim, then
       separately update the gift) had a real crash-window bug: if the
       process died between the two steps, a webhook retry would find the
       payment already `VERIFIED`-but-not-`ACTIVATED` and could
       double-apply the +15-day extension. Combining both into one
       transaction closes that gap. A test (`activates exactly once: a
       concurrent duplicate delivery...`) exercises the race directly by
       simulating `updateMany` returning `count: 0`.
  - VIP duration math reuses existing Milestone 0 business rules
    unchanged: `renewedVipExpiry()` for an `ACTIVE` gift (current expiry +
    15 days), or leaves `activeExpiresAt` untouched for a `DRAFT` gift
    (Milestone 3's `publishGift()` already computes the correct VIP
    duration when it's eventually published) — no VIP-specific duration
    logic was reinvented.
- **Routes**: `POST /api/gifts/[giftId]/vip-checkout` (authenticated) and
  `POST /api/payments/webhook/payos` (public — authenticity comes from the
  webhook's own signature, not a session cookie).
- **Editor UI**: a "Nâng cấp VIP" button (hidden once already VIP) that
  redirects the full page to PayOS's hosted checkout — card/bank details
  never touch our server. The return page explicitly **never claims VIP is
  active** — it shows "confirming payment, refresh to check" and the tier
  badge always reflects the real `gift.tier` from the database, not an
  assumption from the redirect.

### Files
`src/modules/payments/{provider,service,index}.ts`,
`src/modules/payments/providers/payos.ts`,
`src/app/api/gifts/[giftId]/vip-checkout/route.ts`,
`src/app/api/payments/webhook/payos/route.ts`,
`src/app/gifts/[giftId]/{GiftEditor,page}.tsx` (updated), `src/lib/errors.ts`
(+`ServiceUnavailableError`, from Milestone 6), `package.json`
(+`@payos/node`), `tests/unit/payments-service.test.ts`, `CLAUDE.md`,
`README.md`, `docs/SETUP.md`.

### Migrations
None — uses the existing `Payment` table (including its
`[provider, providerTransactionId]` DB-level duplicate guard) from
Milestone 0.

### Verification (actually executed)
- `npm run lint` / `npm run typecheck` — pass, 0 errors.
- `npm run test` — pass, **135/135 tests** (12 new, all in
  `payments-service.test.ts`): checkout rejects non-DRAFT/ACTIVE gifts;
  checkout retries on an order-code collision; **signature failure never
  activates** (provider throws, nothing downstream is called); non-success
  webhook ignored without any DB write; unknown orderCode ignored;
  already-activated payment is a no-op; **amount mismatch** rejects and
  never activates; **currency mismatch** rejects and never activates;
  VIP activation extends an `ACTIVE` gift's expiry by exactly 15 days;
  VIP activation on a `DRAFT` gift leaves `activeExpiresAt` null; and the
  concurrent-duplicate-delivery race (`updateMany` count 0) never touches
  the gift. Also caught and fixed a real bug *during* test-writing: the
  original code logged "VIP payment activated" even when a call lost the
  concurrency race — harmless for correctness (no double-activation) but
  misleading for observability; fixed to log accurately based on whether
  the transaction actually won the claim.
- `npm run build` — pass; both new routes registered.
- **Actually ran the app**: started a real `next start` and used `curl` to
  confirm for real: `POST /api/gifts/.../vip-checkout` without a session
  cookie → `401`; `POST /api/payments/webhook/payos` with a fabricated
  body (PayOS not configured in this environment) → a clean `503
  SERVICE_UNAVAILABLE` with an honest message, not a crash or a false
  "processed" response.

### Known issues / honestly-scoped gaps
- **PayOS is not configured** (owner doesn't have the necessary card for
  Cloudflare R2 yet either, and hasn't set up PayOS credentials) — VIP
  checkout will 503 until `PAYOS_CLIENT_ID`/`PAYOS_API_KEY`/
  `PAYOS_CHECKSUM_KEY` are set and the webhook URL is registered in the
  PayOS dashboard (steps in `docs/SETUP.md`).
- **Never tested against the live PayOS API** — the integration is built
  directly against the official SDK's real, inspected TypeScript types and
  source (not guessed), but a real end-to-end purchase (checkout → real
  bank transfer → real webhook → real activation) has not been observed.
  Strongly recommend the owner do one real test purchase once credentials
  are configured, and report back anything that looks wrong before
  relying on this for real revenue.
- **No live Postgres in this environment** — same caveat as every prior
  milestone; the webhook's transactional logic is verified against a
  mocked Prisma client, not a real database's actual transaction
  semantics.
- VIP purchase is only allowed for `DRAFT`/`ACTIVE` gifts by design (see
  CLAUDE.md) — buying VIP for an `EXPIRED`/`RECOVERY` gift to "resurrect"
  it is explicitly out of scope for V1.
- No refund flow, no partial-payment/`UNDERPAID` handling beyond rejecting
  the amount mismatch (PayOS's `PaymentLinkStatus` type includes
  `UNDERPAID`, which this integration doesn't specifically distinguish
  from other failures yet) — acceptable for V1, worth revisiting once real
  transaction volume exists.
- Same `npm audit` dev-tooling advisories as prior milestones, unchanged.

### Ready for Milestone 9: Admin & Moderation
Yes, pending the owner configuring PayOS credentials (and ideally one real
test purchase) whenever they're ready.

## Milestone 9: Admin & Moderation — 2026-07-11

Owner deferred PayOS credential setup ("phần này tôi làm sau, tiếp tục
thôi") and asked to continue. Before writing any code, resolved the one
real open design question this milestone has: how does a phone-only owner
with no DB access ever get the first admin role, given `registerUser`
always creates `CREATOR` and no admin UI exists yet? Landed on a
self-healing `SUPER_ADMIN_EMAIL` env-var bootstrap (see CLAUDE.md
assumptions) rather than a one-time DB seed script, since the owner can
never run one.

### Completed
- **`SUPER_ADMIN_EMAIL` bootstrap** (`src/env.ts`, `src/modules/auth/service.ts`):
  new optional env var; `maybeBootstrapSuperAdmin()` runs on every
  `registerUser`/`loginUser`/`getSessionUser` call and promotes a matching
  account to `SUPER_ADMIN` if it isn't already. Self-healing by design —
  checked on every session fetch, not just at creation — so an accidental
  demotion of that one account heals on its next login; every other
  account is untouched. Short-circuits immediately once already
  `SUPER_ADMIN`, so it's not a per-request DB write after the first
  promotion.
- **`src/modules/admin/rbac.ts`** — `hasRole`/`requireRole`, a simple
  numeric rank check (`CREATOR < MODERATOR < ADMIN < SUPER_ADMIN`).
  `requireRole` throws `ForbiddenError`, called at the route layer next to
  the existing `requireAuth()` — no service function trusts its caller's
  role by itself.
- **`src/modules/admin/audit.ts`** — `writeAuditLog()`, best-effort (never
  throws), same graceful-degradation pattern as `recordGiftView` from
  Milestone 5. Used by every moderation action.
- **`src/modules/admin/reports.ts`** — `createReport()` (public/anonymous-
  friendly, rate-limited 5/hour by IP via the Milestone 2 rate-limit
  table, and reuses `classifyGiftForViewer()` so a `DRAFT` gift is exactly
  as unreportable as it is unviewable — closes an enumeration path before
  it could exist), `listReportsForAdmin()`, `resolveReport()` (`DISMISS`
  or `SUSPEND`; rejects re-resolving an already-closed report).
- **`src/modules/admin/moderation.ts`** — `suspendGift()`/`unsuspendGift()`.
  Confirmed `SUSPENDED` is genuinely orthogonal to the normal
  `DRAFT→ACTIVE→EXPIRED→RECOVERY→DELETION_PENDING→DELETED` chain (the
  Milestone 7 lifecycle cron already filters every query by specific
  statuses, so it never touches a `SUSPENDED` gift). `suspendGift` stores
  whatever status the gift actually held as `prevStatus` and is
  idempotent (two reports on the same gift can both resolve to "suspend"
  without either erroring); `unsuspendGift` restores exactly that
  `prevStatus` (including a status the lifecycle cron itself had already
  moved it to, e.g. suspending an `EXPIRED` gift and later unsuspending it
  returns it to `EXPIRED`, not back to `ACTIVE`) and is a real
  `ConflictError` on a non-suspended gift, since there's nothing to
  restore. Deliberately does not compensate `activeExpiresAt` for
  suspended time — server time stays the sole source of truth for
  expiration per CLAUDE.md, even across a suspension.
- **`src/modules/admin/users.ts`** + **`src/modules/auth/admin.ts`** —
  `listUsers()`/`changeUserRole()` (SUPER_ADMIN only, route-gated), so the
  role system is actually usable beyond the one bootstrapped account.
  Wraps the auth module's `listUsersForAdmin()`/`setUserRole()` (User rows
  stay owned by the `auth` module even for admin use, same pattern as
  `getGiftForAdmin()` below) with an audit-log write recording the
  before/after role.
- **`src/modules/gifts/admin.ts`** — `getGiftForAdmin()`/
  `listBlocksForAdmin()`/`setGiftStatusForAdmin()`: deliberate ownership
  bypass for trusted, RBAC-gated moderation use only, so a moderator can
  actually see what was reported — Gift/GiftBlock prisma access stays
  inside the `gifts` module even for this path, consistent with the
  existing modular-monolith rule.
- **Routes**: `POST /api/reports` (public); `GET /api/admin/reports`
  (optional `?status=`), `POST /api/admin/reports/[reportId]/resolve`,
  `GET /api/admin/gifts/[giftId]` (content review), `POST
  /api/admin/gifts/[giftId]/suspend` / `/unsuspend`, `GET
  /api/admin/users`, `PATCH /api/admin/users/[userId]/role` — all
  MODERATOR+ (users routes SUPER_ADMIN) via `requireAuth()` +
  `requireRole()`.
- **UI**: a small "Báo cáo nội dung này" link + inline form on the public
  viewer (`/g/[slug]`, only reachable once a gift is actually `active`,
  matching the existing viewer-decision logic); an `/admin` section
  (`/admin/reports` list + resolve buttons, `/admin/gifts/[giftId]` full
  content review + suspend/unsuspend toggle, `/admin/users` SUPER_ADMIN
  role management) gated by a shared layout that calls `hasRole()`/
  `notFound()` — not a 403 page — for an insufficient role, matching this
  codebase's existing "don't confirm what you can't prove" instinct (same
  treatment as a DRAFT gift). A "Quản trị" link appears on the dashboard
  only for MODERATOR+.

### Files
`src/modules/admin/{rbac,audit,reports,moderation,users,schemas,index}.ts`,
`src/modules/auth/admin.ts` (+ exported from `src/modules/auth/index.ts`,
along with `checkRateLimit`/`RATE_LIMITS` which admin's report rate
limiting needed), `src/modules/gifts/admin.ts` (+ exported from
`src/modules/gifts/index.ts`), `src/modules/auth/service.ts` (bootstrap),
`src/modules/auth/rate-limit.ts` (+`report` rule), `src/env.ts`
(+`SUPER_ADMIN_EMAIL`), `src/app/api/reports/route.ts`,
`src/app/api/admin/reports/route.ts`,
`src/app/api/admin/reports/[reportId]/resolve/route.ts`,
`src/app/api/admin/gifts/[giftId]/{route,suspend/route,unsuspend/route}.ts`,
`src/app/api/admin/users/route.ts`,
`src/app/api/admin/users/[userId]/role/route.ts`,
`src/app/admin/layout.tsx`, `src/app/admin/reports/{page,ReportActions}.tsx`,
`src/app/admin/gifts/[giftId]/{page,SuspendToggle}.tsx`,
`src/app/admin/users/{page,RoleSelect}.tsx`,
`src/app/g/[slug]/ReportButton.tsx` (+ `GiftView.tsx`, `page.tsx` updated),
`src/app/dashboard/page.tsx` (updated — admin nav link),
`src/lib/report-reason-label.ts`, `tests/unit/admin-{rbac,moderation,
reports,users}.test.ts`, `tests/unit/auth-super-admin-bootstrap.test.ts`,
`CLAUDE.md`, `docs/SETUP.md`, `.env.example`.

### Migrations
None — uses the existing `Report`, `AuditLog`, and `UserRole`/`GiftStatus.
SUSPENDED` schema from Milestone 0, previously unused by any code.

### Verification (actually executed)
- `npm run lint` / `npm run typecheck` — pass, 0 errors.
- `npm run test` — pass, **163/163 tests** (28 new): RBAC rank checks;
  SUPER_ADMIN bootstrap on register/login/session-fetch (including the
  self-healing re-promotion case and the "already SUPER_ADMIN, skip the
  write" fast path); report creation (rate-limit-first ordering, unknown
  slug, **DRAFT gift treated as not-found**, anonymous reporter allowed);
  report resolution (unknown/already-resolved report rejected, DISMISS
  vs. SUSPEND branching, SUSPEND actually calls `suspendGift` with the
  report context); suspend/unsuspend (prevStatus round-trip, suspend
  idempotency, unsuspend-when-not-suspended rejected, DRAFT fallback if
  prevStatus was somehow never recorded); user role listing/changing
  (password hash never leaks into the admin summary shape, audit log
  records the before/after role).
- `npm run build` — pass; all new routes and `/admin/*` pages registered
  as dynamic (`ƒ`). One non-fatal `prisma:error Can't reach database
  server at localhost:5432` line appeared in the build log while
  collecting page data for `/admin/reports` (it calls
  `listReportsForAdmin()` at the page level, unlike earlier pages that
  call `cookies()` directly and were caught as dynamic before any DB call
  triggered) — same "no live Postgres in this sandbox" caveat as every
  prior milestone, harmless here since the build still completed and
  correctly marked the route dynamic; will not occur on Vercel where
  `DATABASE_URL` points at a real reachable Neon instance.

### Known issues / honestly-scoped gaps
- **No live Postgres in this environment** — same caveat as every prior
  milestone; all of the above is verified against a mocked Prisma client,
  not a real database's actual constraint/transaction behavior.
- **`SUPER_ADMIN_EMAIL` is not yet set anywhere** — until the owner sets
  it in Vercel and logs in once with that email (steps added to
  `docs/SETUP.md`), there is no admin account and the `/admin` section is
  unreachable by anyone. This is expected/by-design, not a bug — flagging
  so it's not mistaken for the moderation feature being broken.
- No pagination on `/admin/reports` or `/admin/users` — acceptable at
  current expected scale (V1, low volume); revisit if either list grows
  large.
- `Report.status` moves straight from `OPEN` to `DISMISSED`/`ACTION_TAKEN`
  — the schema's `REVIEWED` intermediate status exists but nothing sets it
  yet (no "mark as seen, decide later" step in the V1 UI). Low-risk gap,
  easy to add later without a migration.
- Suspending a gift does not currently notify its owner (no email/in-app
  notice that their gift was suspended) — acceptable for V1 given Resend
  isn't configured yet either; worth adding once transactional email is
  live.

### Ready for Milestone 10: Analytics & Monitoring
Yes.

## Milestone 10: Analytics & Monitoring — 2026-07-11

Owner hit an unrelated deploy blocker mid-session (`CRON_SECRET` had a
non-ASCII character from phone-keyboard autocorrect, causing `vercel
build` to fail with "characters that are not valid in HTTP headers") —
walked through regenerating a clean secret and re-pasting it in the
Vercel dashboard; not a code issue, no repo changes needed for that part.
Once confirmed fixed, continued to Milestone 10 as planned.

### Completed
- **`src/modules/analytics/stats.ts`** — `getGiftViewStats(giftId)`
  aggregates the existing `GiftView` table (Milestone 5, no new schema):
  total views, views in the last 7/30 days, and a device breakdown
  (mobile/tablet/desktop/unknown, from the existing `deviceClass` field).
  `recordAnalyticsEvent(name, meta)` is best-effort (never throws — same
  graceful-degradation pattern as `recordGiftView`/`writeAuditLog`),
  writing to the previously-unused `AnalyticsEvent` table.
- **Instrumented 3 high-signal events**: `gift_created` and
  `gift_published` (`gifts/service.ts`), `vip_activated` (`payments/
  service.ts`, fired only when the webhook transaction actually wins the
  activation claim — never on a duplicate-delivery no-op, keeping it
  consistent with the Milestone 8 exactly-once guarantee). Kept
  deliberately minimal for V1 rather than instrumenting every possible
  action.
- **Gift editor stats**: once a gift has been published (never before —
  no views are possible pre-publish), the editor shows total/7-day/30-day
  view counts and a device breakdown, fetched server-side by the existing
  Server-Component-calls-module-directly pattern (Milestone 4).
- **Admin monitoring page** (`/admin/monitoring`, ADMIN+ — one rank above
  the MODERATOR+ the rest of `/admin` requires): site-wide overview
  (total users, gifts by status, VIP activation count, open report count)
  plus recent cron job history (`JobRun` rows from Milestone 7's lifecycle
  cron, surfacing failures in red). Rather than centralizing all this
  aggregation inside the `analytics` module, each owning module exposes
  one small dedicated count function (`auth.countUsers`,
  `gifts.countGiftsByStatus`, `payments.countActivatedPayments`,
  `admin.countOpenReports`, `jobs.listRecentJobRuns`) that the page
  composes directly — consistent with the `getGiftForAdmin`-style
  ownership-bypass pattern from Milestone 9, and avoids the `analytics`
  module needing to reach into tables it doesn't own.
- Added an admin nav link ("Giám sát") visible only to ADMIN+.

### Files
`src/modules/analytics/{stats,index}.ts`, `src/modules/gifts/service.ts`
(updated — event calls), `src/modules/payments/service.ts` (updated —
event call), `src/modules/jobs/query.ts` (+ exported from `jobs/index.ts`),
`src/modules/auth/admin.ts` (+`countUsers`, exported from `auth/index.ts`),
`src/modules/gifts/admin.ts` (+`countGiftsByStatus`, exported from
`gifts/index.ts`), `src/modules/payments/query.ts` (+ exported from
`payments/index.ts`), `src/modules/admin/reports.ts` (+`countOpenReports`,
exported from `admin/index.ts`), `src/app/admin/monitoring/page.tsx`,
`src/app/admin/layout.tsx` (updated — nav link),
`src/app/gifts/[giftId]/{page,GiftEditor}.tsx` (updated — view stats),
`tests/unit/analytics-stats.test.ts`,
`tests/unit/admin-monitoring-helpers.test.ts`,
`tests/unit/gift-service.test.ts` / `tests/unit/payments-service.test.ts`
(updated — mock the new `@/modules/analytics` dependency), `CLAUDE.md`.

### Migrations
None — uses the existing `AnalyticsEvent`, `GiftView`, and `JobRun`
schema from Milestone 0/5/7, previously unused (`AnalyticsEvent`) or only
written-not-read (`GiftView`, `JobRun`) by any code.

### Verification (actually executed)
- `npm run lint` / `npm run typecheck` — pass, 0 errors.
- `npm run test` — pass, **172/172 tests** (9 new): view-stats aggregation
  (total/7d/30d counts, device breakdown including an `unknown` bucket for
  null `deviceClass`, empty-state for a gift with zero views);
  `recordAnalyticsEvent` writes the right shape and never throws even when
  the underlying write fails; `countGiftsByStatus` always returns all 7
  status keys, zero-filled, so the UI never needs to guard against a
  missing key; `countActivatedPayments`/`countOpenReports` filter by the
  right status; `listRecentJobRuns` orders newest-first and respects its
  limit. Also updated the two existing test files whose service functions
  now call `recordAnalyticsEvent` (`gift-service.test.ts`,
  `payments-service.test.ts`) to mock `@/modules/analytics`, keeping them
  isolated from the new dependency rather than letting it silently
  no-op through an unmocked prisma call.
- `npm run build` — pass; `/admin/monitoring` and all other routes
  registered correctly as dynamic (`ƒ`). Same non-fatal
  `Can't reach database server` log noted in the Milestone 9 report
  appeared again during page-data collection for `/admin/monitoring`
  (same root cause: no live Postgres in this sandbox) — harmless, build
  still completed successfully.

### Known issues / honestly-scoped gaps
- **No live Postgres in this environment** — same caveat as every prior
  milestone.
- Only 3 business events are instrumented (`gift_created`,
  `gift_published`, `vip_activated`) — deliberately minimal for V1 rather
  than tracking every possible action; easy to add more `recordAnalyticsEvent`
  calls later without a migration.
- No time-series charts (day-by-day view trends) — only rolling
  total/7d/30d counts. A real chart would need either client-side
  aggregation of raw `GiftView` rows or a new pre-aggregated table;
  deferred as unnecessary complexity for V1's expected traffic volume.
- `/admin/monitoring` has no pagination on job run history (fixed at the
  most recent 30) — acceptable at current expected cron volume (7 steps/
  day = ~210/month).
- No alerting (e.g. email/Slack ping on a failed cron step) — the
  monitoring page must be checked manually for now; would need Resend
  (not yet configured) or a similar low-cost channel to add real alerting.

### Ready for Milestone 11: Testing & Hardening
Yes.

## Milestone 11: Testing & Hardening — 2026-07-11

**Important finding**: every prior milestone report said "no live Postgres
available in this environment." That was true for those sessions, but
this one has Postgres 16 installable and startable locally (`apt`-provided
`postgresql-16`, no Docker needed). This unlocked the single most
valuable thing this milestone could do: real integration tests against a
real database, closing a gap explicitly flagged as far back as Milestone
2's report ("recommend adding one ... in Milestone 11").

### Completed
- **Real integration test suite** (`tests/integration/`, `npm run
  test:integration`, separate `vitest.integration.config.ts`) — genuine
  `PrismaClient` against a real Postgres, no mocking, alongside (not
  replacing) the existing fast mocked-Prisma unit suite. `tests/
  integration/db-helpers.ts` truncates every app table between tests for
  isolation. 12 tests across 4 files:
  - `auth-flow.test.ts`: real argon2id hash stored (never plaintext), the
    real DB unique constraint on `email` (not just an app-level check),
    a real session row resolvable via `getSessionUser`, a real expired
    session rejected, and `resetPassword` really invalidating every
    session for a user (including one from `registerUser` itself — this
    test caught its own off-by-one on the first real run: I'd assumed 2
    sessions from 2 explicit logins, but `registerUser` also creates one,
    for 3 total; fixed the test, not the code, since the 3-session
    behavior is correct/intended auto-login-on-register).
  - `gifts-flow.test.ts`: a real unique slug persisted and looked-up-by,
    and `publishGift` setting a real `activeExpiresAt` ~3 days out.
  - **`payments-webhook-concurrency.test.ts`** — the headline test: fires
    two literal concurrent `handlePaymentWebhook` calls (`Promise.all`)
    for the same payment against the real database, then asserts the
    database's own final state shows *exactly* one activation (`Payment.
    status === 'ACTIVATED'` once, `Gift.activeExpiresAt` extended by
    exactly 15 days, not 30). The Milestone 8 mocked version of this test
    could only prove the `updateMany`+transaction *code path* was
    correct (by manually scripting a `count: 0` mock return); it
    structurally cannot prove Postgres's real row-level locking actually
    serializes two genuinely simultaneous requests the way the code
    assumes. This one does, and it passed on the first real run.
  - `admin-moderation.test.ts`: `suspendGift`/`unsuspendGift`'s
    `prevStatus` round-trip against real rows, including restoring a gift
    the lifecycle cron had already moved to `EXPIRED` (not back to
    `ACTIVE`), a real `AuditLog` row actually written, and suspend
    idempotency verified by asserting no duplicate audit row.
- **CI**: added a `postgres:16` service container to `.github/workflows/
  ci.yml`, a `prisma migrate deploy` step against it, and a new `Test
  (integration, real Postgres)` step — so every future push actually
  exercises this, not just this one session. Ran the *exact* CI command
  sequence locally (migrate deploy → unit → integration → build) against
  the local Postgres to confirm it passes end-to-end before trusting it
  to GitHub Actions.
- **Security headers** (`next.config.ts`, site-wide): `Content-Security-
  Policy` (self + `data:`/`https:` for images since R2's domain isn't
  known at config-authoring time, `unsafe-inline` for script/style since a
  strict nonce-based CSP needs per-request middleware — judged not worth
  the added complexity/breakage-risk for a V1 phone-only-owner app),
  `X-Frame-Options: DENY` + `frame-ancestors 'none'` (clickjacking),
  `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-
  when-cross-origin`, `Permissions-Policy` (camera/mic/geolocation all
  denied — unused features), `Strict-Transport-Security`. **Actually
  verified, not just configured**: built and started the real app against
  the real local Postgres, then drove a full real user flow with
  Playwright (register → create gift → add a text block → publish → view
  the public `/g/[slug]` page → a wrong-password login attempt) while
  capturing browser console/page errors — zero CSP violations, only an
  unrelated pre-existing `favicon.ico` 404. This is the first time this
  project's UI has been exercised against a real database end-to-end
  rather than only unit-tested against a mock.
- **Route/rate-limit audit**: read every `route.ts` under `src/app/api/`
  confirming `requireAuth`/`requireRole` and correct ownership-scoped
  service calls (no IDOR gaps found — Milestones 3-9 already got this
  right). Found and closed a real gap: gift creation, image upload, and
  VIP checkout creation had no rate limit beyond the existing per-gift
  image quota (Milestone 6) — a user could still create unlimited gifts
  and rack up real R2/PayOS costs across many gifts. Added `RATE_LIMITS.
  giftCreate` (30/hour), `mediaUpload` (30/hour), `vipCheckout` (10/hour),
  all keyed by user id (more meaningful than IP for cost control on
  authenticated routes), wired into their three routes.
- **`npm audit` re-reviewed**: same 7 advisories as every prior milestone
  (5 moderate, 1 high, 1 critical) — `esbuild` via Vitest's Vite
  dependency, `postcss` bundled inside Next's own internal build tooling.
  Confirmed the project is already on Next's newest non-breaking 15.x
  patch (`15.5.20`, the `backport` dist-tag) — the only "fixes" `npm
  audit fix --force` offers are a Next 16 major (real behavioral-
  compatibility risk for a live app, not something to do silently in a
  hardening pass) or a Vitest 4 major (breaking test-API changes). Both
  vulnerable packages are dev-time/build-time-only — never bundled into
  the deployed app or reachable by an end-user request — so left as-is,
  same conclusion as Milestone 0.

### Files
`tests/integration/{setup,db-helpers,auth-flow,gifts-flow,
payments-webhook-concurrency,admin-moderation}.test.ts`,
`vitest.integration.config.ts`, `package.json` (+`test:integration`
script), `.github/workflows/ci.yml` (postgres service container + new
steps), `next.config.ts` (security headers), `src/modules/auth/
rate-limit.ts` (+3 rules), `src/app/api/gifts/route.ts`, `src/app/api/
gifts/[giftId]/media/route.ts`, `src/app/api/gifts/[giftId]/vip-checkout/
route.ts` (rate-limit calls), `README.md`, `docs/SETUP.md`, `CLAUDE.md`.

### Migrations
None.

### Verification (actually executed)
- `npm run lint` / `npm run typecheck` — pass, 0 errors.
- `npm run test` — pass, **172/172** (unchanged from Milestone 10; no
  service-layer logic changed, only route-layer rate-limit calls and
  config).
- `npm run test:integration` — pass, **12/12**, against a real local
  Postgres 16 — see "Completed" above for what each covers.
- `npm run build` — pass, against the same real Postgres (no more
  harmless-but-noisy `Can't reach database server` log lines during page-
  data collection, since the DB is genuinely reachable this time).
- Full real-browser flow via Playwright against `next start` + real
  Postgres — see "Completed" above. Zero CSP violations, zero
  unexpected console/page errors.
- Ran the exact CI step sequence locally end-to-end (lint → typecheck →
  migrate deploy → unit test → integration test → build) before trusting
  the new GitHub Actions config.

### Known issues / honestly-scoped gaps
- **This session's local Postgres is a one-off convenience, not a
  guaranteed feature of every future sandbox session** — if a future
  session genuinely lacks a live Postgres again, `npm run test:
  integration` simply can't run there (it fails loudly per `tests/
  integration/setup.ts` rather than silently skipping). CI always has one
  now regardless, via the new service container — that's the durable
  fix, not this session's local install.
- No Playwright tests were added to the repository itself (`tests/e2e/`
  is still empty despite `@playwright/test` being configured since
  Milestone 0) — the real-browser verification this milestone did was a
  one-off manual check, not committed as a re-runnable E2E suite. Adding
  a couple of real `tests/e2e/*.spec.ts` files (the same register→create→
  publish→view flow, at minimum) is a reasonable next step but was left
  out here to keep this milestone's scope to what was actually promised
  in prior reports (the CI Postgres integration suite) plus the security
  hardening pass, rather than open-ending into a full E2E buildout.
- CSP uses `'unsafe-inline'` for `script-src`/`style-src` rather than a
  strict nonce-based policy — a real (if secondary, given React's
  automatic escaping is the primary XSS defense) hardening gap; upgrading
  to nonces requires per-request middleware and is a reasonable follow-up
  if the owner wants a stricter CSP later.
- No automated dependency-update workflow (e.g. Dependabot/Renovate) —
  `npm audit` was reviewed manually this milestone; worth adding for
  ongoing maintenance once the app is live.
- Rate-limit thresholds (30/hour gift-create, 30/hour media-upload,
  10/hour vip-checkout) are judgment calls, not measured against real
  usage patterns yet (there is none — pre-launch) — revisit once real
  traffic exists if they turn out to be too tight or too loose.

### Ready for Milestone 12: Beta
Yes.

## Milestone 12: Beta — 2026-07-11

All 11 feature/hardening milestones were complete going into this one,
and neither `specs/SPEC.md` nor `CLAUDE.md` define further code-feature
scope for "Beta" beyond the roadmap name itself — this milestone is
operational readiness, not new business logic. Scoped it to what's
genuinely achievable without the owner's real-world credentials
(R2/PayOS/Resend/`SUPER_ADMIN_EMAIL`, still owner-pending — tracked
honestly rather than faked) plus a few real, concrete gaps this session's
own testing had already surfaced.

### Completed
- **Homepage copy** (`src/app/page.tsx`): replaced the literal
  Milestone-0 placeholder text "đang được xây dựng" (under construction)
  — which had survived untouched through 11 milestones of the product
  actually becoming fully functional — with real landing content: a
  clear value proposition, a 3-step "how it works" section, and a
  free-vs-VIP duration blurb that imports `FREE_ACTIVE_DURATION_DAYS`/
  `VIP_ACTIVE_DURATION_DAYS` from `business-rules.ts` instead of
  hardcoding the numbers a second time. Primary CTA now points
  logged-out visitors at `/register` (was `/login`) since a landing page
  should lead with sign-up.
- **`app/icon.tsx`, `app/robots.ts`, `app/sitemap.ts`**: closes a gap
  Milestone 11's own Playwright verification had already caught (a
  console 404 for `/favicon.ico`, dismissed at the time as an unrelated
  pre-existing gap). Used Next's file-based conventions rather than
  static files in `public/` — `icon.tsx` generates a 32×32 PNG via
  `next/og`'s `ImageResponse` (no binary asset to check in),
  `robots.ts`/`sitemap.ts` read `env.APP_URL` so they're never
  accidentally hardcoded to localhost (same class of bug as the
  Milestone 5 `APP_URL` hotfix). `robots.ts` disallows `/g/`,
  `/dashboard`, `/gifts/`, `/admin` — defense-in-depth on top of the
  per-page `X-Robots-Tag`/`<meta robots>` noindex already in place for
  gift pages since Milestone 5.
- **`/admin/monitoring` "Cấu hình hệ thống" section**: live ✓/✗ status
  for R2, Resend, PayOS (reusing the existing `isR2Configured`/
  `isResendConfigured`/`isPayOSConfigured` booleans `src/env.ts` already
  computed) and whether `SUPER_ADMIN_EMAIL` is set, each with a one-line
  plain-language note on what's blocked without it. Gives the
  non-technical, phone-only owner one page to check "what's still
  pending" instead of re-reading CLAUDE.md/docs/SETUP.md.
- **`docs/BETA_CHECKLIST.md`**: consolidates the above into one
  actionable, phone-readable document — what's done, what's pending
  (with a table linking each integration to its `docs/SETUP.md` section),
  concrete "do one real test of each integration" steps once configured,
  a suggested small-cohort (5-15 people) beta rollout plan, and an
  honest summary of known limitations to set expectations around during
  beta (pulled from prior milestones' "Known issues" sections, not
  re-litigated here).

### Files
`src/app/page.tsx`, `src/app/icon.tsx`, `src/app/robots.ts`,
`src/app/sitemap.ts`, `src/app/admin/monitoring/page.tsx` (updated),
`docs/BETA_CHECKLIST.md`, `CLAUDE.md`.

### Migrations
None.

### Verification (actually executed)
- `npm run lint` / `npm run typecheck` — pass, 0 errors.
- `npm run test` — pass, **172/172** (unchanged — no service-layer logic
  touched this milestone).
- `npm run test:integration` — pass, **12/12**, against the same real
  local Postgres as Milestone 11 (the sandbox's Postgres service had
  gone idle/down between milestones — restarted it, data was intact,
  re-ran clean; a reminder that this session's local Postgres is a
  convenience, not guaranteed persistent, same caveat as noted in
  Milestone 11's report).
- `npm run build` — pass; `/icon`, `/robots.txt`, `/sitemap.xml` all
  registered as static (`○`) routes.
- **Actually verified in a real browser** (Playwright against a real
  `next start` + the real local Postgres, continuing Milestone 11's
  practice): loaded the homepage, confirmed the new copy renders, the
  page `<title>` is the new metadata, and — the specific thing being
  fixed — zero console/page errors (the `/favicon.ico` 404 from
  Milestone 11 no longer appears, because a real `<link rel="icon"
  href="/icon?...">` tag is now emitted and browsers never fall back to
  guessing `/favicon.ico` when that tag is present). Also fetched
  `/robots.txt` and `/sitemap.xml` directly and confirmed their content
  is correct.

### Known issues / honestly-scoped gaps
- **R2/PayOS/Resend/`SUPER_ADMIN_EMAIL` are still not configured** —
  unchanged from every prior milestone, now surfaced live on
  `/admin/monitoring` instead of only in docs. This blocks image upload,
  VIP checkout, real password-reset email delivery, and all `/admin`
  access respectively, until the owner completes the steps in
  `docs/SETUP.md` (now cross-referenced from `docs/BETA_CHECKLIST.md`
  too).
- No `tests/e2e/*.spec.ts` files were added to the repository (same gap
  noted in Milestone 11) — this milestone's browser verification was
  again a one-off manual check via a scratch script, not a committed,
  re-runnable Playwright test.
- The homepage's new copy/CTA choices (registering as the primary CTA,
  the specific 3-step framing) are a reasonable default, not something
  validated with real users yet — worth revisiting once beta feedback
  exists.

### Ready for Milestone 13: Launch
Once the owner has completed the `docs/BETA_CHECKLIST.md` steps
(integrations configured, a small real cohort has used the product) —
this milestone's code-side work is done.

## Milestones 13-14: Launch & Growth — 2026-07-11

Owner said to keep going ("xong làm tiếp gì thì làm luôn nhé"). Like
Milestone 12, neither `specs/SPEC.md` nor `CLAUDE.md` define further
code-feature scope for "Launch"/"Growth" beyond the roadmap names — real
launch is gated on the owner finishing `docs/BETA_CHECKLIST.md` (real
credentials, real beta users), which isn't something code can do.
Combined both into one pass covering genuinely useful, low-risk items a
real public launch benefits from, without inventing scope (no fake
"referral program," no public gift gallery — the latter would directly
contradict the unlisted/noindex privacy rule from Milestone 5).

### Completed
- **`/terms` and `/privacy` pages**: a good-faith, accurate draft — free
  tier / VIP tier durations pulled from `business-rules.ts` rather than
  typed as separate literals so they can't drift out of sync with the
  real enforced values; PayOS, Cloudflare R2, and Resend named as the
  actual third-party processors (matching what `docs/SETUP.md`/
  `docs/BETA_CHECKLIST.md` already describe); security practices
  (argon2id, HTTP-only cookies, real magic-byte upload validation)
  described accurately, not aspirationally. **Not lawyer-reviewed** —
  this is flagged here (the owner-facing report), not as a banner on the
  public page itself, so the owner knows to get real legal review before
  a wide public launch given PayOS handles real money.
- **`SiteFooter` component** (`src/app/SiteFooter.tsx`): links to
  `/terms`/`/privacy`, added to the homepage and the register page ("by
  registering you agree to..." — no blocking checkbox, kept lightweight
  for V1 rather than adding friction to signup).
- **`app/opengraph-image.tsx`**: root-level, same `next/og`
  `ImageResponse` pattern as Milestone 12's `icon.tsx` — no binary asset
  checked in. Deliberately generic branding (not derived from any real
  content), so it's safe that it's inherited as the default social
  preview for every page that doesn't set its own `openGraph.images`,
  *including* gift pages — that inheritance is exactly why it had to stay
  generic, consistent with the "never leak gift content via a social
  preview" rule from Milestone 5.
- **Homepage social-proof counter**: "X hộp quà đã được tạo," reusing the
  existing `countGiftsByStatus()` from Milestone 10 (summed across all
  statuses). Only renders once the real total crosses 10 — an honest low
  number (or literal "0") undermines trust more than omitting the stat,
  so it's hidden below that threshold rather than shown prematurely.

### Files
`src/app/terms/page.tsx`, `src/app/privacy/page.tsx`,
`src/app/SiteFooter.tsx`, `src/app/opengraph-image.tsx`,
`src/app/page.tsx` (updated — footer + counter), `src/app/register/page.tsx`
(updated — terms/privacy link), `CLAUDE.md`.

### Migrations
None.

### Verification (actually executed)
- `npm run lint` / `npm run typecheck` — pass, 0 errors.
- `npm run test` — pass, **172/172** (unchanged — no service-layer logic
  touched).
- `npm run test:integration` — pass, **12/12**, against the same real
  local Postgres (restarted again after another idle period — same
  documented caveat as Milestones 11-12).
- `npm run build` — pass; `/terms`, `/privacy`, `/opengraph-image` all
  registered as static (`○`) routes.
- Real browser verification (Playwright, continuing the practice from
  Milestones 11-12): confirmed `/terms`/`/privacy` return 200 and mention
  the real third-party processors (PayOS, Cloudflare R2); confirmed the
  `og:image` meta tag on the homepage points at the new generated image;
  confirmed the footer link actually navigates to `/terms` client-side
  (an initial quick check misread a timing race in the test script
  itself as a broken link — re-verified with an explicit
  click-and-wait-for-URL and confirmed the navigation works correctly,
  zero console errors); confirmed the register page shows the terms/
  privacy agreement line.

### Known issues / honestly-scoped gaps
- **Terms/Privacy are not lawyer-reviewed** — see "Completed" above.
  Accurate to what the app actually does today, but the owner should get
  real legal review before a wide public launch, especially given real
  payment collection via PayOS.
- **R2/PayOS/Resend/`SUPER_ADMIN_EMAIL` are still not configured** —
  unchanged; this is now the single blocking dependency for everything
  else in `docs/BETA_CHECKLIST.md`, and is entirely on the owner's side
  (real-world account setup), not something further code work can
  resolve.
- No `tests/e2e/*.spec.ts` files were added to the repository (same gap
  noted in Milestones 11-12) — verification continues to be a one-off
  manual/scratch-script check each milestone rather than a committed,
  re-runnable suite.
- No account-deletion self-service flow (Privacy Policy says "contact us
  via your registered email" for deletion requests) — acceptable at V1
  scale, worth automating if request volume grows.

### Ready for further work
Code-side work for the roadmap through Milestone 14 is done. What
remains is entirely on the owner: finish `docs/BETA_CHECKLIST.md`
(configure R2/PayOS/Resend/`SUPER_ADMIN_EMAIL`, get one real test
purchase/upload/email working end-to-end, optionally get `/terms`/
`/privacy` reviewed by a lawyer), then run a real small beta cohort
before a wider public launch.
