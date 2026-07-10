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
