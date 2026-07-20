# VÔ TRI

Cộng đồng giải trí vui vẻ, tinh nghịch — nơi mọi người cười, xả stress, chơi
game nhỏ và sưu tập thành tích cùng nhau. Xem [`CLAUDE.md`](./CLAUDE.md) cho
các quy tắc thiết kế bắt buộc, và [`docs/VO_TRI_DESIGN_BIBLE.md`](./docs/VO_TRI_DESIGN_BIBLE.md)
cho toàn bộ Design System.

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
```

## Project layout

- `src/vo-tri/design-system/` — `tokens.css` (color/radius/shadow/blur/gradient,
  all `--vt-*`, WCAG-verified contrast) + `motion.css` (`--vt-*` durations/
  easings/keyframes).
- `src/vo-tri/fonts.ts` — self-hosted Unbounded (display) + Be Vietnam Pro (body).
- `src/vo-tri/copy/microcopy.ts` — central Vietnamese microcopy dictionary
  (loading/empty/error/success) in the VÔ TRI voice.
- `src/vo-tri/ui/` — design system primitives (Button, Card, Input, Badge,
  Toast, Dialog, BottomSheet, Mascot, Empty/Error/Success/Loading states).
  Import from `src/vo-tri/ui/index.ts`.
- `src/app/` — Next.js App Router routes/layout. `/vo-tri-styleguide` is an
  internal (noindex) living reference for every primitive above.
- `docs/VO_TRI_DESIGN_BIBLE.md` — the full brand + design system documentation.

No backend yet — this is front-end only (design system + shell + Home) until
a future milestone actually needs accounts/data.
