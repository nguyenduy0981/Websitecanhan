# CLAUDE.md — LoveBox Project Instructions

LoveBox is a REAL production web product, not a demo. Consolidated spec: specs/SPEC.md.

## Non-negotiable business rules (never change without explicit owner approval)
- FREE_ACTIVE_DURATION_DAYS = 3 — Free gifts are ACTIVE exactly 3 days.
- VIP_ACTIVE_DURATION_DAYS = 15 — VIP gifts are ACTIVE exactly 15 days.
- VIP renewal while active: new_expires_at = current_expires_at + 15 days.
- No lifetime storage. No auto-renewal in V1.
- Lifecycle: DRAFT → ACTIVE → EXPIRED → RECOVERY → DELETION_PENDING → DELETED, plus SUSPENDED (moderation).
- Gifts are unlisted + noindex by default. Marketing pages indexable; gift pages never.
- Server time (DB now()) is authoritative for expiration.
- After Recovery ends: permanently delete gift content AND all associated storage objects.

## Security rules (P0 — a violation blocks merge)
- Payment: NEVER activate VIP from a frontend success screen. Flow: webhook/server
  verification → signature → transaction ID → exact amount → currency → product →
  duplicate check → DB transaction → activate exactly once. Duplicate webhooks =
  exactly one activation. Wrong amount/signature/replay = never activate.
- Backend authorization for every private resource (no IDOR). Admin routes = server-side RBAC.
- Uploads: validate magic bytes (not extension), size limits, strip metadata, process
  via sharp, link ownership, reject SVG/scripts.
- Auth: argon2id hashing, HTTP-only secure session cookies, rate limits on
  login/register/reset, single-use reset tokens.
- User-generated text renders on a public viewer → treat as hostile: escape/sanitize everywhere.
- Secrets only via env vars validated in src/env.ts. Never log secrets or full PII.

## Cost rules
Free/low tiers only (Vercel, Neon, Cloudflare R2, Resend). No Kubernetes, Kafka,
microservices, or paid infra before real usage. WebP compression, minimal image
variants, CDN caching, cleanup jobs for orphaned/expired media, upload quotas,
limited analytics retention.

## Architecture
Modular monolith. Next.js 15 App Router + TypeScript strict + Tailwind. PostgreSQL
(Neon) + Prisma. Cloudflare R2 (S3 API) for media. Background jobs = idempotent cron
routes protected by CRON_SECRET (Vercel Cron). Payments behind a PaymentProvider
interface; first provider: PayOS (VietQR bank transfer — confirmed by owner).
Modules in src/modules/*; each exposes a public API via its index.ts, never import
another module's internals.

## Workflow (every milestone)
READ → UNDERSTAND → PLAN → IMPLEMENT → TEST → VERIFY → DOCUMENT → REPORT.
After each milestone: npm run lint && npm run typecheck && npm run test && npm run
build (+ integration/E2E when relevant). Report: completed items, files, migrations,
tests added, known issues, next milestone. Never proceed past failing
auth/payment/build/migration issues.

Roadmap: 0 Setup · 1 Foundation · 2 Authentication · 3 Gift Core · 4 Editor ·
5 Public Viewer · 6 Media & Themes · 7 Lifecycle · 8 VIP & Payments · 9 Admin &
Moderation · 10 Analytics & Monitoring · 11 Testing & Hardening · 12 Beta ·
13 Launch · 14 Growth.

## Honesty
No fake completion. If credentials are missing, build the integration boundary +
env vars + docs and mark the feature "awaiting credentials". Never claim tests
passed without running them.

## Recorded assumptions (owner may override)
- VIP price: VIP_PRICE_VND env, placeholder 49000.
- RECOVERY_DURATION_DAYS = 7 (centrally configurable).
- Quotas: Free ≤ 5 images/gift, VIP ≤ 20; ≤ 10MB/image preprocessing.
- Email: Resend. Music library: royalty-free seed tracks managed by admin.
- Deployment note (owner works phone-only): Vercel build command must run
  "prisma migrate deploy && next build" so migrations never require a local terminal.
- Milestone 0 scaffold: 3 pre-existing unrelated static HTML files found at repo
  root (personal portfolio pages, unrelated to LoveBox) were moved to archive/
  rather than deleted, to keep the Next.js app root clean without destroying
  prior work.
- Milestone 1 foundation: structured logging via pino (JSON in prod, pretty in
  dev), redacting password/token/secret/email fields anywhere in the log
  payload. Standard API error shape: `{ error: { code, message } }` via an
  `AppError` hierarchy (src/lib/errors.ts) + `withApiHandler` route wrapper
  (src/lib/api-handler.ts) — unexpected errors always collapse to a generic
  500 message server-side-logged in full, never leaking internals to the
  client. Prisma client is a cached singleton (src/lib/prisma.ts).
- Milestone 2 authentication: session duration 30 days from login/register;
  password reset links valid 1 hour, single-use, invalidate ALL of the
  user's sessions on successful reset. Password policy: min 8 / max 200
  chars (upper bound guards against pathological argon2 hashing cost).
  Rate limits (DB-backed via a `RateLimitHit` table on Neon, no new paid
  infra): login 10/15min (by IP and by email independently), register
  5/hour (by IP), password-reset 3/hour (by IP and by email). Login and
  password-reset never reveal whether an email/account exists (generic
  "Invalid email or password", and "if an account exists..." wording) to
  avoid user enumeration; registration does say "email already registered"
  (standard, expected UX for sign-up). Email verification (`emailVerified`)
  is not yet enforced/sent in V1 — deferred past this milestone since the
  spec only requires register/login/logout/reset.
- Milestone 3 gift core: gift `id` (not `slug`) is used for all owner-facing
  API routes; `slug` is reserved for the public viewer route in Milestone 5.
  A gift is editable (fields, blocks, reorder) only while `DRAFT` or
  `ACTIVE`; every other status is read-only via this API. Draft gifts can be
  hard-deleted directly; once published, deletion must go through the
  expire/recovery/purge lifecycle (Milestone 7) instead. Publishing requires
  at least one block and is blocked outside `DRAFT`. Block reordering uses a
  two-phase position update (temp offset, then final) to avoid tripping the
  `@@unique([giftId, position])` constraint on swaps. `IMAGE`/`GALLERY`
  block content only shape-validates `mediaAssetId` for now — it is not yet
  checked against a real `MediaAsset` row or counted against the per-tier
  image quota, since media upload doesn't exist until Milestone 6.
- Milestone 4 editor: session reads (`getSessionUser`/`requireAuth`) now
  take a generic `CookieReader` (satisfied by both `NextRequest.cookies`
  and `next/headers` `cookies()`), so Server Components read their own
  session directly instead of an internal HTTP round-trip. Page data on
  first load (dashboard list, gift + blocks) is fetched by Server
  Components calling the `gifts`/`auth` module service functions directly;
  all mutations (create/update/delete/publish/reorder) go through the
  existing API routes from the browser. Only `TEXT` blocks are creatable
  from the editor UI in V1 — `IMAGE`/`GALLERY` block creation waits for
  Milestone 6 media upload even though the API already accepts their
  shape. Autosave debounces title/message edits 800ms after the last
  keystroke. Block reordering UI uses up/down buttons, not drag-and-drop
  (simpler, free, and keyboard-operable for accessibility). The public
  share link (`/g/:slug`) is displayed after publish but does not resolve
  to a real page until Milestone 5.
- Milestone 5 public viewer: `/g/[slug]` is public (no auth). A `DRAFT`
  gift is treated identically to "doesn't exist" (`notFound()`) so
  unpublished content never leaks. `EXPIRED`/`SUSPENDED`/`RECOVERY`/
  `DELETION_PENDING`/`DELETED` render a generic friendly message instead of
  the real content or a raw 404 — `SUSPENDED` in particular never reveals
  that moderation was involved. All gift text is rendered as JSX children
  (never `dangerouslySetInnerHTML`), relying on React's automatic escaping
  per the "treat as hostile" rule. Metadata (title/description/OG tags) on
  the viewer page is static and generic — never derived from the gift's
  real title/message — so a social-media link preview can't leak private
  content to someone who hasn't opened the link; `X-Robots-Tag: noindex`
  (next.config.ts) plus a matching `robots` meta tag both apply.
  `GiftView` rows are recorded on each view of an `ACTIVE` gift via
  `recordGiftView()`, which never throws — a failed analytics write must
  never take down the gift content itself (graceful degradation). QR code
  for the share link is generated server-side (the `qrcode` package, no
  new paid service) in the editor page and passed down as a data URL.
