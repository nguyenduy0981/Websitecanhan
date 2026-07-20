# VÔ TRI — Design Bible

The single source of truth for VÔ TRI's brand and design system. Every screen
built after this document must draw from it — no per-screen colors, fonts,
radii, shadows, or motion timings invented on the spot.

Source of truth in code: `src/vo-tri/design-system/tokens.css` (color/radius/
shadow/blur/gradient) and `src/vo-tri/design-system/motion.css` (durations/
easings/keyframes). This document explains the *why*; the CSS is the *what*.
Living, interactive reference: `/vo-tri-styleguide` (noindex).

## 1. Brand philosophy

VÔ TRI is an entertainment/community product, not a dashboard. A user opening
it for the first time should feel, within ~10 seconds: *"huh... what is this?
but I want to keep looking."* Personality over polish-for-its-own-sake:
playful, a little mischievous, intelligent, gently self-aware — never toxic,
never mocking the user, never a generic "AI SaaS" template look (which in
practice means: not a violet/fuchsia gradient on a plain dark dashboard, not
Inter/Poppins everywhere, not rounded-2xl cards with soft pastel shadows).
Explicitly not-Discord, not-Facebook, not-Reddit, not-TikTok, not "a template."

## 2. Color

Dark-mode-first as a brand decision, not a preference toggle: a deep,
warm-plum background with real depth, never pure black, never the cool
blue-grey of a typical dark-mode SaaS dashboard.

| Token | Hex | Role |
|---|---|---|
| `--vt-bg` | `#120E17` | Base background |
| `--vt-surface` | `#1A1420` | Raised sections |
| `--vt-card` | `#221A2A` | Cards, dialogs |
| `--vt-border` | `#362B42` | Hairline borders |
| `--vt-divider` | `#2A2131` | Softer separators |
| `--vt-text-primary` | `#F6F1F8` | Body/heading text on neutral surfaces |
| `--vt-text-secondary` | `#A99BB5` | Secondary text |
| `--vt-text-muted` | `#746781` | Large text/captions only (see contrast note) |
| `--vt-on-accent` | = `--vt-bg` | Text/icons on top of any filled accent color |
| `--vt-primary` | `#FF4D8D` | "Riot" coral-pink — CTAs, brand accent |
| `--vt-secondary` | `#C8FF4D` | "Zap" acid lime — highlights, XP, energy |
| `--vt-success` | `#3DDC84` | Success only |
| `--vt-warning` | `#FF9F1C` | Warning only |
| `--vt-danger` | `#FF4D4D` | Danger/destructive only |
| `--vt-info` | `#4DC8FF` | Info only |
| `--vt-reward` | `#FFD447` | Points/coins/claimed rewards |
| `--vt-xp` | = `--vt-secondary` | Leveling/progression (aliased on purpose) |
| `--vt-vip` | `#C9A6FF` | VIP/premium **only** — scarcity is the point |

**Contrast rule (WCAG-verified with a relative-luminance script, not
eyeballed — see `tokens.css` header comment for the numbers):** light text
(`--vt-text-primary`) only sits on neutral dark surfaces (bg/surface/card).
Every filled accent color (primary/secondary/success/warning/danger/info/
reward/vip) fails AA with light text on top — they only pass with
`--vt-on-accent` (dark). `--vt-text-muted` only clears AA at large text
sizes (≥18px, or ≥14px bold) — never use it for body copy or small labels.

**Restraint rule:** two brand hues (primary, secondary) carry personality
everywhere. Status hues (success/warning/danger/info) appear *only* in their
specific semantic context. Reward/XP/VIP are reserved for value/progression
moments. This is why the palette reads as designed rather than "màu mè rối
mắt" (garish) despite having nine distinct hues on the books.

## 3. Typography

- **Display: Unbounded** — bold geometric letterforms with real personality.
  Deliberately not Inter/Poppins/Montserrat (the generic "AI SaaS" default)
  and not a rounded bubble font like Baloo (reads as a kids' app). Used for
  headings, mascot-adjacent moments, anything that should feel loud.
- **Body: Be Vietnam Pro** — designed for Vietnamese diacritics specifically
  (not a Latin font with a bolted-on Vietnamese subset), enough geometric
  character to stay distinct at small sizes.
- Both self-hosted via `next/font/google` (`src/vo-tri/fonts.ts`), `vietnamese`
  subset verified at typecheck — zero extra runtime request.

## 4. Radius, shadow, blur, gradient

- **Radius:** `sm` 8px (chips/badges) → `md` 14px (inputs/buttons) → `lg` 20px
  (cards) → `xl` 28px (modals/sheets/hero surfaces) → `full` (pills/avatars).
  Generous enough to feel tactile/playful, capped short of "bubbly kids app."
- **Elevation:** four shadow levels (`--vt-shadow-1..4`), each pairing a
  crisp dark shadow with a 1px border-tint for edge definition — a plain
  black drop-shadow barely reads on a dark background, so every level is
  "grounded" rather than relying on shadow alone. Glow variants
  (`--vt-glow-primary/secondary/vip`) layer brand-color light on top for
  moments that should feel alive (primary CTA hover, VIP).
- **Glass:** one canonical recipe (`--vt-glass-bg`/`--vt-glass-border`,
  `backdrop-blur-vt-md`), used sparingly — floating nav, header-on-scroll,
  sheet/dialog scrims — never as a default card background ("có thể dùng
  glass nhưng tiết chế").
- **Gradient:** one signature brand gradient (`--vt-gradient-brand`,
  primary→secondary) reserved for hero accents, the check-in FAB, and
  high-emphasis moments — not a default card treatment. `--vt-gradient-vip`
  (violet→gold) is exclusive to VIP.

## 5. Motion

Full vocabulary in `motion.css`: `fade-up`, `pop-in`, `scale-in`,
`bounce-in`, `wiggle`, `shake`, `float`, `pulse-glow`, `shimmer`,
`celebrate`, `page-enter`, plus the shared `.vt-interactive` hover-lift/
press-squash used by every interactive primitive.

Rules:
- Every keyframe touches only `transform`/`opacity` (`box-shadow` for glow
  rings, which is layout-inert) — never a property that can trigger layout
  thrash or contribute to CLS.
- The global `prefers-reduced-motion: reduce` collapse in `globals.css` is
  selector-agnostic (`*, *::before, *::after`) and covers every `.vt-*` class
  automatically — no per-component reduced-motion branch needed. Pointer-
  driven effects (hero mascot parallax) additionally check
  `matchMedia` once and skip attaching listeners entirely under reduced
  motion, since "follows your cursor" is exactly the category of motion
  that setting exists to opt out of.
- VÔ TRI's motion is punchier than a typical SaaS app on purpose — spring
  overshoots (`--vt-ease-mischief`), a signature `wiggle` — to read as
  "mischievous" per the brand brief, while staying cheap (transform/opacity
  only, rAF-throttled scroll/pointer listeners, no per-frame React state).

## 6. Components

All under `src/vo-tri/ui/`, exported from `src/vo-tri/ui/index.ts`.

- **Button** — variants primary/secondary/outline/ghost/danger; hover lift +
  press squash via `.vt-interactive`; primary variant ambient-pulses at rest
  (`.vt-pulse-glow`) to visibly invite a tap. Loading state relabels + shows
  a spinner rather than a static disabled button. No JS ripple — the
  press-scale delivers the same tactile feedback for a fraction of the cost.
- **Card** — `default` (resting) / `elevated` (lifts further on hover) /
  `glass` (sparing use only, see § 4).
- **Input/Textarea/Field** — `Field` composes label + input + error/helper
  under one generated id (`useId`) so every form field gets consistent
  `htmlFor`/`aria-describedby`/`aria-invalid` wiring for free.
- **Badge** — one variant per semantic color (§ 2); "what does this color
  mean" always has exactly one canonical answer.
- **Toast** — module-level store (not React context) so `toast()` is
  callable from anywhere (async handlers, non-component code), capped at 3
  concurrent, real Radix primitives underneath for swipe-to-dismiss + a11y.
- **Dialog / BottomSheet** — real Radix Dialog + `vaul` (not hand-rolled) for
  genuine focus-trap/gesture accessibility. Four dialog *presets*
  (`ConfirmDialog`, `ErrorDialog`, `SuccessDialog`, `RewardDialog` in
  `DialogPresets.tsx`) give confirmation/error/success/reward moments each
  their own personality on top of one shared base.
- **EmptyState / ErrorState / SuccessState / LoadingState** — share one
  `StatePanel` layout (mascot + title + description + optional action).
  `LoadingState` rotates through a message pool every ~2.8s instead of
  sitting on one static line — "Loading thú vị," not a spinner + word.
- **Skeleton** — shimmer sweep, used for content placeholders.
- **Mascot** — see § 7.

## 7. Mascot

`src/vo-tri/ui/Mascot.tsx` — the "linh hồn" (soul) of the brand, meant to
recur everywhere (empty states, loading, toasts/dialogs, 404, hero). Current
implementation is a deliberately simple geometric blob (gradient body,
antenna, primitive-shape faces) — **not final illustration**. The
architecture is the real deliverable: a fixed 7-mood vocabulary (`idle`,
`happy`, `laughing`, `thinking`, `sleepy`, `mindblown`, `celebrating`) that
every call site references by name. Swapping in real illustration/Lottie
later only means rewriting `MOOD_FACES` inside `Mascot.tsx` — no call site
anywhere in the app needs to change.

## 8. Copywriting

Central dictionary: `src/vo-tri/copy/microcopy.ts` (loading/empty/error/
success/action labels) + `src/vo-tri/copy/daily-messages.ts` (Home's
day-of-year-seeded daily line). Voice: hài hước, thông minh, châm biếm nhẹ —
never toxic, never mocking the user, always "talking to" them rather than
reporting raw state. Never generic ("Submit", "Loading", "Success", "Hãy thử
lại", "No Data", "Empty", "Get Started", "Learn More") — but a joke that
obscures what actually happened is a bug, not a feature; clarity always
wins over cleverness when they conflict.

## 9. App Shell

`src/vo-tri/shell/` (`AppShell.tsx`, wired once in `src/app/layout.tsx` —
every route mounts inside it automatically):

- **Background** — fixed, three huge blurred radial gradients drifting on a
  22–30s loop (CSS transform/opacity only) plus a faint SVG-noise layer, so
  the dark surface reads as alive without any canvas/particle JS cost.
- **Header** — fixed top; logo+wordmark, points/avatar/notification for a
  signed-in user, "Đăng nhập" for a guest. Scroll state (rAF-throttled
  `scrollY` check, not a per-frame layout read) shrinks padding and adds
  glass blur + shadow past a small threshold — an isolated transition on
  the fixed header's own box, so it never shifts page content.
- **BottomNav (mobile)** — a floating glass pill, not a flush full-width
  bar (deliberately not stock Android/iOS/shadcn), split into two icon pairs
  around a raised center check-in FAB.
- **Sidebar (desktop, `md:`+)** — a left rail with the same nav-items/icons/
  active-pill language, starting *below* the fixed header (`top-20`, not
  `inset-y-0`) so it never re-renders its own logo and collide-ghosts with
  the header's (a real bug caught and fixed during Playwright verification —
  see commit history).
- **Container** — the one place content width is decided: `app` (max-w-6xl,
  default) for grids/dashboards, `prose` (max-w-2xl) for long-form reading.
- **Notification layer** — a bell trigger opening a BottomSheet; shows the
  honest empty state today (no backend feed yet), same trigger/shell will
  host a real list later.
- **Toast/Dialog/BottomSheet layers, global loading, page transition** —
  `<Toaster/>` mounted once in `AppShell`; `src/app/loading.tsx` (Next's
  route-level convention) renders `LoadingState`; `src/app/template.tsx`
  applies `.vt-page-enter` on every navigation.

## 10. Home

`src/app/page.tsx` + `src/vo-tri/home/`:

- **Hero** — mascot + daily message badge + tagline + subline + primary/
  secondary CTA, wrapped in `HeroScene` (two independent rAF-throttled
  effects on separate nested refs — outer scales/fades on scroll, inner
  nudges toward the pointer — so they compose without fighting over one
  `transform`, both skipped under reduced motion).
- **Tagline:** *"Ở đây, vô tri là một kỹ năng."* — chosen over several
  alternatives for reclaiming the brand word as a skill (ties naturally to
  XP/leveling mechanics) rather than being just a joke line or a mood
  statement; short, intelligent, memorable, distinct from the given
  examples.
- **Daily message** — `getDailyMessage()` is deterministic (day-of-year
  modulo a local pool), not random-per-render, so it's stable across SSR/
  CSR and genuinely reads as "today's" line. Swapping to a DB/API source
  later only changes that one function.
- **Quick Access** — 4 items max (Khám phá, Điểm danh, Xếp hạng, Hồ sơ) —
  deliberately not a longer list, per "không hiển thị quá nhiều."
- **TodayCard** — only renders given a real signed-in user + stats; there is
  no session system yet, so Home always takes the logged-out branch today.
  Fully built and ready — not a stub — for the moment auth exists.
- **ActivitySpotlight / CommunityPulse** — "feature preview" and "social
  proof" sections that show an honest, on-brand *empty* state instead of
  fabricated activity/numbers, since no real backend data exists yet. Per
  CLAUDE.md's non-negotiable rule: never fabricate data.

## 11. Accessibility

Focus-visible rings (`--vt-primary`) on every interactive primitive by
construction (`.vt-interactive`/component base classes, not opt-in per
screen). `Field` wires label/error/helper via `aria-describedby` +
`aria-invalid` automatically. Dialog/BottomSheet get real focus-trap +
`Escape`-to-close + swipe gesture from Radix/`vaul`, not hand-rolled. Color
is never the sole signal (icons + text pair with every status color). Touch
targets sized ≥40–44px on interactive nav elements.

## 12. Responsive

Mobile-first: BottomNav below `md`, Sidebar at `md:`+ (768px). Verified by
real rendered screenshots (not just code review) at 390 / 430 / 768 / 1024 /
1440px — see the Playwright verification pass in the session's commit
history for what was actually caught and fixed at each size (the header/
sidebar double-logo collision above is a real example, not hypothetical).
