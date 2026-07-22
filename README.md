# VÔ TRI

Cộng đồng giải trí vui vẻ, tinh nghịch — nơi mọi người cười, xả stress, chơi
game nhỏ và sưu tập thành tích cùng nhau. Xem [`CLAUDE.md`](./CLAUDE.md) cho
các quy tắc thiết kế bắt buộc, [`docs/VO_TRI_DESIGN_BIBLE.md`](./docs/VO_TRI_DESIGN_BIBLE.md)
cho toàn bộ Design System, và [`docs/VO_TRI_ARCHITECTURE.md`](./docs/VO_TRI_ARCHITECTURE.md)
cho component inventory + routing map.

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
npm run build
npm run test:e2e   # Playwright — builds + serves, then runs tests/e2e/**
```

## Environment variables

- `NEXT_PUBLIC_SITE_URL` — optional, used by `src/app/sitemap.ts` and the
  OG-image metadata to build absolute URLs. Falls back to
  `http://localhost:3000` if unset; set it to the real domain once one
  exists (see `src/vo-tri/lib/site.ts`).

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
  and `robots.ts`/`sitemap.ts`. `/vo-tri-styleguide` is an internal
  (noindex, enforced via its own `layout.tsx`) living reference for every
  primitive above.
- `docs/VO_TRI_DESIGN_BIBLE.md` — brand + design system documentation.
- `docs/VO_TRI_ARCHITECTURE.md` — folder structure, component inventory,
  routing map, motion/responsive guidelines.
- `tests/e2e/` — Playwright E2E suite (navigation, accessibility, Explore
  search/filter, the real gameplay flow). Runs in CI (`.github/workflows/ci.yml`)
  on every push against a real production build.

No backend yet — this is front-end only (design system, shell, Home,
Explore, Profile, Leaderboard, Gameplay Framework, Social Foundation) until
a future milestone actually needs accounts/data.
