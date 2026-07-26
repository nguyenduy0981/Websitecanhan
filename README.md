# VÔ TRI

Cộng đồng giải trí vui vẻ, tinh nghịch — nơi mọi người cười, xả stress, chơi
game nhỏ và sưu tập thành tích cùng nhau. Xem [`CLAUDE.md`](./CLAUDE.md) cho
các quy tắc thiết kế bắt buộc, [`docs/VO_TRI_DESIGN_BIBLE.md`](./docs/VO_TRI_DESIGN_BIBLE.md)
cho toàn bộ Design System, [`docs/VO_TRI_ARCHITECTURE.md`](./docs/VO_TRI_ARCHITECTURE.md)
cho component inventory + routing map, [`docs/VO_TRI_GAMEPLAY_ENGINE.md`](./docs/VO_TRI_GAMEPLAY_ENGINE.md)
cho lifecycle/state-flow của Gameplay Engine + cách thêm một Activity mới,
[`docs/PROJECT_HANDOFF.md`](./docs/PROJECT_HANDOFF.md) — tài liệu bàn
giao chính thức, điểm khởi đầu cho bất kỳ ai (hoặc phiên Claude nào) tiếp
quản dự án mà không có ngữ cảnh trước đó —
[`docs/BACKEND_ARCHITECTURE.md`](./docs/BACKEND_ARCHITECTURE.md) cho
thiết kế backend (Supabase: schema, RLS, migration, API, security review)
đã hoàn chỉnh nhưng chưa nối vào project thật,
[`docs/INTEGRATION_CHECKLIST.md`](./docs/INTEGRATION_CHECKLIST.md) — các
bước chính xác còn lại một khi có project Supabase thật (kèm risk
register ở §7),
[`docs/MIGRATION_VALIDATION.md`](./docs/MIGRATION_VALIDATION.md) — thứ
tự/idempotency/rollback/thời gian chạy/câu query verify+health-check cho
lần `supabase db push` đầu tiên, và
[`docs/OPERATIONS.md`](./docs/OPERATIONS.md) cho chiến lược backup/
migration/recovery/logging/monitoring và checklist deploy production.

## Stack

Next.js 15 (App Router) · TypeScript (strict) · Tailwind CSS · Radix UI primitives
(Dialog/Toast) · vaul (bottom sheet) · lucide-react.

## Getting started

```bash
npm install
npm run dev
```

## Verify commands

```bash
npm run lint
npm run typecheck
npm run test       # Vitest — pure logic (scoring, catalogs, small lib helpers)
npm run build
npm run test:e2e   # Playwright — builds + serves, then runs tests/e2e/**
```

## Environment variables

Full reference table (what reads each one, required/optional, fallback
behavior) is in [`docs/INTEGRATION_CHECKLIST.md`](./docs/INTEGRATION_CHECKLIST.md#2-set-environment-variables).
Short version: `NEXT_PUBLIC_SITE_URL` is optional (falls back to
`http://localhost:3000`); `NEXT_PUBLIC_SUPABASE_URL` /
`NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` are required
once a real Supabase project exists — copy `.env.example` to `.env.local`
and fill them in. Every Supabase-touching file fails loudly with a clear
message, or no-ops, until these are set — nothing in the app depends on
them today.

## Project layout

- `src/vo-tri/design-system/` — `tokens.css` (color/radius/shadow/blur/gradient,
  all `--vt-*`, WCAG-verified contrast) + `motion.css` (`--vt-*` durations/
  easings/keyframes).
- `src/vo-tri/fonts.ts` — self-hosted Unbounded (display) + Be Vietnam Pro (body).
- `src/vo-tri/copy/microcopy.ts` — central Vietnamese microcopy dictionary
  (loading/empty/error/success) in the VÔ TRI voice.
- `src/vo-tri/ui/` — design system primitives (Button, Card, Input, Badge,
  Toast, Dialog, BottomSheet, Tooltip, ContextMenu, Mascot, Avatar, global
  states). Import from `src/vo-tri/ui/index.ts`.
- `src/vo-tri/{home,explore,profile,leaderboard,game,social}/` — one folder
  per feature domain; see `docs/VO_TRI_ARCHITECTURE.md` for the full
  component inventory.
- `src/app/` — Next.js App Router routes/layout, plus `icon.tsx`/
  `apple-icon.tsx`/`opengraph-image.tsx` (dynamically generated, on-brand)
  and `robots.ts`/`sitemap.ts`. `manifest.ts` (PWA install manifest,
  `icon192`/`icon512` route handlers for its larger icon sizes) plus a
  `viewport` export in `layout.tsx` (dark `theme-color` matching `--vt-bg`)
  make the site installable and give mobile browser chrome the right
  color — no backend needed for either. `error.tsx` catches per-route errors in the
  brand's `ErrorState`; `global-error.tsx` is the deliberately separate
  fallback for the rarer case where the root layout itself throws — it
  renders its own minimal `<html>/<body>` (no `AppShell`/providers, since
  those are exactly what may have failed) with inline styles matching the
  real design tokens. `/vo-tri-styleguide` is an internal (noindex,
  enforced via its own `layout.tsx`) living reference for every primitive
  above.
- `docs/VO_TRI_DESIGN_BIBLE.md` — brand + design system documentation.
- `docs/VO_TRI_ARCHITECTURE.md` — folder structure, component inventory,
  routing map, motion/responsive guidelines.
- `docs/BACKEND_ARCHITECTURE.md` — Supabase schema/RLS/migration/API
  design; `supabase/migrations/*.sql` implements it (validated against a
  local Postgres, not yet applied to any live project). §18 is the
  production-readiness + security review pass (schema fixes, the
  `restrict_update_columns()` column-guard trigger, a real RLS bug found
  and fixed in comment soft-delete).
- `docs/INTEGRATION_CHECKLIST.md` — the exact remaining steps once a real
  Supabase project exists, from creating it through wiring the UI.
- `docs/OPERATIONS.md` — backup/migration/recovery/logging/monitoring
  strategy + a production deployment checklist.
- `src/vo-tri/server/supabase/` — Supabase client factories
  (`server-client.ts` for the normal cookie-scoped, RLS-respecting path;
  `admin-client.ts` for the narrow service-role exception, unused by any
  real code path yet) + `env.ts` (the one shared "is Supabase configured"
  check every client factory uses) + `database.types.ts` (hand-written
  until a live project exists to `supabase gen types typescript` from).
- `src/vo-tri/server/{repositories,services,actions,validation,adapters}/`
  — full 3-layer backend (repository → service → `"use server"` action),
  zod validation, and pure DB-row → frontend-type adapters, all built and
  unit-tested ahead of having a live Supabase project (see
  `docs/BACKEND_ARCHITECTURE.md` §13). `require-auth.ts` is the single
  shared entry point every action uses to get an authenticated/optional
  client. Auth (`AuthDialog`/`UserMenu`) and a partial `/profile` are
  wired to real data (§14); every other domain's actions exist and are
  unit-tested but aren't called from a Client Component yet — see
  `docs/INTEGRATION_CHECKLIST.md` §6 for the exact remaining wiring steps.
- `src/middleware.ts` — refreshes the Supabase session cookie; a no-op
  until the Supabase env vars are set.
- `tests/e2e/` — Playwright E2E suite (navigation, accessibility, Explore
  search/filter, the real gameplay flow). Runs in CI (`.github/workflows/ci.yml`)
  on every push against a real production build.
- `src/**/*.test.ts` — Vitest unit tests for pure logic (scoring formula,
  quest/milestone catalogs, rank ladder, date/time helpers) plus the full
  backend layer above (validation, adapters, and a real test proving the
  credential-isolation boundary), colocated next to the file they test.
  Runs in CI alongside the E2E suite.

Backend design and the full repository/service/action layer are complete
and production-readiness-reviewed (`docs/BACKEND_ARCHITECTURE.md` §17–18).
The owner has provided real Supabase credentials, but migrations haven't
been applied to the live project yet (blocked by this environment's
egress policy — see §14) and no domain beyond Auth is wired to real data
yet — every other route still shows the honest logged-out/empty state.
See `docs/INTEGRATION_CHECKLIST.md` for the exact remaining steps.
