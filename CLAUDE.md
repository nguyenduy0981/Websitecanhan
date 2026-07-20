# CLAUDE.md — VÔ TRI Project Instructions

VÔ TRI is a Vietnamese entertainment/community product — not a business dashboard,
not a landing page. Users open it to relax, laugh, do silly things, collect
achievements, and meet interesting people. Tone: hài hước, thông minh, châm biếm
nhẹ — never toxic, never mocking the user, never generic "AI SaaS template."

This repo previously hosted an unrelated product (LoveBox, a gift-box app). Per
explicit owner instruction, LoveBox's application code, backend, and docs have
been removed (recoverable via git history if ever needed) — this repo is now
VÔ TRI only. Nothing below should reference or resurrect LoveBox.

## Non-negotiable design rules (never change without explicit owner approval)
- Dark-mode-first brand, not a toggle: deep warm-plum background (`--vt-bg`),
  never pure black, never a cool blue-grey "SaaS dashboard" dark mode.
- Brand hues: Primary = coral-pink "Riot" (`--vt-primary`), Secondary = acid
  lime "Zap" (`--vt-secondary`). VIP violet (`--vt-vip`) is reserved
  exclusively for VIP/premium moments — using it elsewhere dilutes the one
  place scarcity gives it meaning.
- Contrast rule (WCAG-verified, see `src/vo-tri/design-system/tokens.css`):
  light text (`--vt-text-primary`) only sits on neutral dark surfaces
  (bg/surface/card). Anything on a filled accent color (primary, secondary,
  success, warning, danger, info, reward, vip) uses `--vt-on-accent` (dark)
  instead — light text on an accent fill fails AA contrast, verified with a
  real luminance-ratio script, not eyeballed.
- Every animation touches only `transform`/`opacity`(/`box-shadow` for glow
  rings) — never layout properties — so nothing in the motion system can
  cause CLS. The global `prefers-reduced-motion: reduce` collapse in
  `src/app/globals.css` is selector-agnostic and covers every `.vt-*` class
  automatically; do not add a second reduced-motion branch per component.
- No generic microcopy ("Submit", "Loading", "Success", "Hãy thử lại", "No
  Data", "Empty", "Get Started", "Learn More"). All UI copy pulls from
  `src/vo-tri/copy/microcopy.ts` (or extends it) so the brand voice stays
  centralized instead of drifting per screen.
- Never fabricate data (fake online-user counts, fake activity feed items,
  fake social proof). Where real backend data doesn't exist yet, show the
  correct empty/logged-out state instead of a placeholder number.

## Architecture
Next.js 15 App Router + TypeScript strict + Tailwind. All VÔ TRI-specific code
lives under `src/vo-tri/` (design tokens, motion, fonts, copy, `ui/`
primitives) and is consumed by `src/app/*` routes/layout. `src/vo-tri/ui/index.ts`
is the barrel — import primitives from there, not from individual files, so
call sites don't need to know internal file layout.

No backend yet (no DB/auth/API routes) — everything shipped so far is
front-end design system + shell + Home. When a future milestone needs real
accounts/XP/leaderboards/chat, add the backend then; don't scaffold it
speculatively ahead of a milestone that needs it.

## Cost rules
Free/low tiers only when infra is eventually added (Vercel, a free-tier
Postgres, free-tier object storage). No paid infra before real usage.

## Workflow
READ → UNDERSTAND → PLAN → IMPLEMENT → TEST → VERIFY → REPORT. After each
milestone: `npm run lint && npm run typecheck && npm run build` (+ visual
verification via a real rendered page — typecheck passing is not the same
as a component looking/working right). Never claim something was verified
without actually running it.

## Honesty
No fake completion. Never claim a build/lint/visual check passed without
running it. If a design decision required judgment (color, copy, motion
timing) rather than being handed down, record the reasoning below so future
sessions don't re-litigate it from scratch.

## Recorded decisions (owner may override)

- **Prompt 01 — Design Bible & brand foundation.** Full system documented in
  `docs/VO_TRI_DESIGN_BIBLE.md`. Summary: dark warm-plum surfaces (`--vt-bg`
  `#120E17` → `--vt-card` `#221A2A`), coral-pink primary + acid-lime
  secondary (deliberately NOT the violet/fuchsia gradient LoveBox used —
  that combination is the generic "AI SaaS" signature this brand explicitly
  avoids), Unbounded (display) + Be Vietnam Pro (body, real Vietnamese
  diacritic design, not a bolted-on subset) via `next/font/google`, both
  self-hosted with the `vietnamese` subset verified at typecheck. Motion
  vocabulary (`src/vo-tri/design-system/motion.css`) is punchier than a
  typical SaaS app on purpose — spring overshoots, a signature `wiggle` —
  to read as "mischievous" per the brand brief, while staying
  transform/opacity-only for performance. Toast/Dialog/BottomSheet use real
  Radix primitives + `vaul` (not hand-rolled) for genuine focus-trap/
  swipe-gesture accessibility rather than reinventing them. Mascot
  (`src/vo-tri/ui/Mascot.tsx`) is a placeholder geometric blob built around
  a fixed 7-mood vocabulary (idle/happy/laughing/thinking/sleepy/mindblown/
  celebrating) so real illustration can later replace only `MOOD_FACES`,
  never call sites. Internal style guide at `/vo-tri-styleguide` (noindex)
  is the living proof-of-work for every primitive — check it after any
  token change.
- **Prompt 02 — App Shell.** Full details in `docs/VO_TRI_DESIGN_BIBLE.md`
  § 9. Summary: `AppShell` (`src/vo-tri/shell/`) wraps every route once, from
  `src/app/layout.tsx` — Background (CSS-only drifting gradients, no
  canvas), rAF-throttled scroll-aware Header, a floating-pill BottomNav
  with raised center check-in FAB on mobile, a left-rail Sidebar at `md:`+
  sharing the same `nav-items.ts` config. Real bug caught by Playwright
  screenshots (not just typecheck): Sidebar originally duplicated the
  "VÔ TRI" wordmark and used `inset-y-0`, ghosting/overlapping the Header's
  own logo — fixed by starting the Sidebar at `top-20` and removing the
  duplicate wordmark; Header is the single source of the logo everywhere.
  `Container` (`app` max-w-6xl vs `prose` max-w-2xl) is the one place
  content width is decided. Four Dialog presets (Confirm/Error/Success/
  Reward) give those four moments distinct personality over one shared
  Dialog base. `Toaster` mounts once in `AppShell`; `loading.tsx`/
  `template.tsx` use Next's own file conventions for global loading/page
  transition rather than custom plumbing.
- **Prompt 03 — Home.** Full details in `docs/VO_TRI_DESIGN_BIBLE.md` § 10.
  Tagline **"Ở đây, vô tri là một kỹ năng."** — chosen over several
  brainstormed alternatives (a self-aware joke line, an edgier "leave your
  sobriety at the door" line) for reclaiming the brand word as a skill
  (ties naturally into XP/leveling) rather than being only a joke or a mood
  statement. Daily message (`daily-messages.ts`) is day-of-year-seeded, not
  random-per-render, so it's SSR/CSR-stable and genuinely reads as "today's"
  line; swapping to a real DB/API source later only changes
  `getDailyMessage()`. `HeroScene` composes scroll-shrink and pointer-
  parallax as two independent rAF effects on nested refs so they don't
  fight over one `transform`; both no-op under `prefers-reduced-motion`.
  No session system exists yet, so Home always takes the logged-out branch
  (no TodayCard) — but TodayCard/ActivitySpotlight/CommunityPulse are all
  fully built against real prop shapes (`TodayStats`, `SpotlightItem`,
  `CommunityStats`), not stubs; per CLAUDE.md's no-fabricated-data rule,
  the feature-preview and social-proof sections show an honest on-brand
  empty state today rather than fake activity/numbers.
