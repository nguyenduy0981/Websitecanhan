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
- **Prompt 04 — Explore.** `src/vo-tri/explore/`. Key judgment call: the
  activity catalog (`activities.ts` — name/reward/XP/difficulty/time/
  limits) is real authored product content, not the "fabricated data"
  CLAUDE.md's rule targets — that rule is about fake *social/usage*
  signals (fake online counts, fake "X just did Y" feed items), and
  nothing on an activity card claims a real play count or another user's
  real action. Featured Activity + Daily Picks reuse Home's day-seed
  pattern over this real catalog (an honest "editorial rotation" today,
  swappable for real engagement ranking later) — see the comment atop
  `activities.ts`. Continue Playing renders nothing given `items={[]}`
  (no play-history backend yet), same pattern as Home's TodayCard. Coming
  Soon cards never show a fake ship date — tapping one just reiterates
  "đang xây dựng" via toast. Category chips are plain buttons in normal
  tab order rather than a hand-rolled ARIA `tablist`/roving-tabindex —
  correct native Tab/Enter behavior for free, verified by an actual
  Playwright keyboard-tab test, not assumed. Search/filter are pure
  client-side state over the local catalog (no backend needed yet, per
  the prompt's own scope).
- **Prompt 05 — Profile.** `src/vo-tri/profile/`. Judgment call worth
  recording: Profile is fundamentally per-user data (avatar/level/
  achievements/timeline all belong to one specific person), unlike
  Home/Explore where individual sections could just hide when logged out.
  There is no honest "browse Profile as guest" version — showing *any*
  specific stats without a real logged-in user would be exactly the
  fabricated data CLAUDE.md's rule forbids. Resolution: `/profile` (the
  real route) shows the honest logged-out state only (mascot + "Đăng
  nhập" CTA, same pattern as Header). Every rich component (ProfileHero,
  ProfileAvatar, LevelCard, StatCards, AchievementSection, BadgeCollection,
  JourneyTimeline, CollectionShowcase, EditProfileSheet, ShareProfile) is
  fully built against real prop shapes and demonstrated live on
  `/vo-tri-styleguide` with fixture data clearly commented as such — the
  same fixture-data convention already used for every other styleguide
  example, not a claim that a "Bé Vô Tri" account is real. Rank ladder
  (`ranks.ts`, level → "Tân Binh"/"Kỳ Cựu"/"Cao Thủ"/"Huyền Thoại Vô Tri")
  is a game-design rule like Explore's difficulty labels, safe to hardcode.
  Badge rarity (`common`/`rare`/`special`) gets escalating visual treatment
  (plain border → secondary glow → VIP-color glow) — the one deliberate,
  narrow reuse of the VIP violet outside literal VIP/premium context,
  because "special" *is* a premium/exclusive rarity tier by definition.
  `EditProfileSheet` picks Dialog (desktop) vs BottomSheet (mobile) from
  one `useMediaQuery` hook rather than maintaining two components, with a
  live-updating preview and real validation (empty-name error), verified
  interactively via Playwright (not just visually). `ShareProfile`'s
  copy-link button is genuinely functional today (`navigator.clipboard`,
  no backend needed); the social-platform buttons are visibly present but
  disabled — an honest "not built yet," not a fake integration. lucide-
  react has no Facebook/X brand icons (dropped upstream), so those slots
  use generic share-shaped icons instead.
- **Prompt 06 — Leaderboard.** `src/vo-tri/leaderboard/`. Refactored
  Explore's `CategoryChips` into a generic `ChipGroup` (`src/vo-tri/ui/`)
  reused by Leaderboard's `ScopeFilter` — same visual/behavioral output
  for Explore, verified by re-running its full test pass, not just
  eyeballed. Same honest-empty-state judgment as Profile: a real ranked
  list is inherently multi-user data, so `/leaderboard` shows the genuine
  "no one's played yet" state (a legitimate real product state, unlike
  Profile — a leaderboard *can* honestly be empty), while
  TopThreePodium/LeaderboardList/MyPositionCard/RankChangeIcon are fully
  built and demonstrated with fixture data on `/vo-tri-styleguide`. Scope
  filter (Toàn cầu/Bạn bè/Tuần/Tháng/Mùa giải) is fully real/interactive
  today even though every scope currently resolves to the same empty
  state — the architecture is real, only the backend behind it is
  missing. `LeaderboardRow` has a fixed, memoized height
  (`ROW_HEIGHT_PX`) specifically so a virtualized list (react-window/
  virtua) can be dropped in later as a `LeaderboardList`-only change —
  not added now since there's no real large dataset yet to justify the
  dependency. Real bug caught by screenshot (not assumed): `MyPositionCard`
  first used `position: sticky`, which only stays put within its own
  containing block and would scroll away long before the bottom of a
  list with thousands of rows — fixed to `position: fixed`, offset to
  clear the mobile BottomNav and centered over the desktop content column
  (accounting for the Sidebar's width) rather than the full viewport.
- **Prompt 08 — Gameplay Framework.** `src/vo-tri/game/`. The reusable
  state machine (`GameFrame`: pre-game → playing ⇄ paused → result) every
  future Activity's real minigame will plug into via a render-prop
  (`children: (ctx: GameplayContext) => ReactNode`) — no specific
  gameplay is implemented, per the prompt's own scope. Refactored first
  (no behavior change, re-verified): extracted `ActivityStatGrid` out of
  Explore's `ActivityDetailSheet` and `RARITY_RING` out of Profile's
  `BadgeCollection` into shared modules, plus a generic `ProgressBar` out
  of `LevelCard` — all three now reused by the new framework instead of
  being reimplemented. Real route `/play/[activityId]` uses the actual
  Explore catalog + `generateStaticParams`; a real RSC bug caught by
  `next build` (not just typecheck): passing the full `Activity` object
  (which carries a `LucideIcon` component reference) from the Server
  Component page to the Client Component failed serialization — fixed by
  passing only `activityId` and looking the activity up client-side from
  the same catalog module. Same honest-data discipline as every prior
  prompt: the real route's "Hoàn thành" outcome only ever uses the
  Activity's own real `reward`/`xp` — never the coins/level-up/
  achievement/quest extras, since nothing real computed those for an
  actual session yet. The full rich `ResultScreen` (with all of those
  extras) is demonstrated with fixture data on `/vo-tri-styleguide`,
  alongside `GameHeader`, `ExitConfirmDialog`, and `GameNotReadyState`.
  `RewardReveal` count-up is `requestAnimationFrame`-driven (the
  displayed text itself changes, so CSS alone can't do it) and jumps
  straight to the final value under `prefers-reduced-motion` instead of
  animating. `playSound()` (`src/vo-tri/lib/sound.ts`) is a no-op today,
  called from every reward/level-up/achievement/game-state-change moment
  — wiring real audio later is a one-file change. Explore's
  `ActivityDetailSheet` "Bắt đầu" now links to `/play/[id]` for every
  non-check-in activity (previously a placeholder toast, since no
  pre-game flow existed yet) — verified end-to-end, not just wired.
- **Prompt 09 — Social Foundation.** `src/vo-tri/social/`. UI/architecture
  only, no backend, per the prompt's own scope — every real integration
  point that already existed stays honestly empty. Reaction system is 5
  brand-flavored reactions (`reactions.ts`: Thích/Cười xỉu/Đỉnh/Bất ngờ/
  **Vô Tri** — the signature one, a `Brain` icon for "this broke my brain
  in the best way") deliberately not a Facebook-style Like/Haha/Wow/Sad/
  Angry set; the set is a prop on `ReactionBar` (defaults to
  `REACTION_KINDS`), not hardcoded, so adding a 6th reaction is a
  one-line catalog change. Refactored first (no behavior change,
  re-verified via screenshot): generalized Prompt 05's `ShareProfile`
  into a reusable `ShareSheet` (`ShareProfile` is now a 3-line wrapper
  passing profile-specific copy), and upgraded `NotificationBell`'s
  hardcoded empty-only content to render the new categorized
  `NotificationCenter` (achievement/reward/friend/system) with
  `items={[]}` — the real Header bell renders byte-identical empty-state
  copy to before, confirmed by screenshot diff. `UserPreviewCard` reuses
  `ProfileAvatar`/`getRank` from Profile so a person's avatar ring/rank
  label look identical everywhere they appear. `ActivityFeed` always
  renders its honest empty state today (no real feed backend) — same
  discipline as Explore's Continue Playing and Home's TodayCard.
  `FollowButton` is fully controlled (`following` + `onToggle`) with real
  visual states but zero persistence, per "không cần logic, chỉ chuẩn bị
  giao diện." Every component demonstrated with fixture data on
  `/vo-tri-styleguide`, same convention as every prior framework prompt.
- **Prompt 10 — Platform Foundation (audit/hardening pass, no new
  screens).** Full map in `docs/VO_TRI_ARCHITECTURE.md` (new — component
  inventory, routing table, motion/responsive guideline in one place for
  a newcomer). No Supabase/Auth/payments/API added, per the prompt's own
  scope. Real, grep-confirmed duplication found and consolidated: 4 copies
  of check-in toast logic → `lib/check-in.ts`, 3 copies of `timeAgo()` →
  `lib/time.ts`, 6 copies of avatar-with-fallback markup → `ui/Avatar.tsx`,
  `TodayCard`'s inline progress bar → the already-extracted `ProgressBar`,
  and 8 files using Tailwind's stock `duration-*`/`ease-out` instead of
  the brand's `--vt-duration-*`/`--vt-ease-*` tokens → new
  `duration-vt-*`/`ease-vt-*` Tailwind theme extensions. Missing global
  states built: `OfflineState`/`RetryState`/`PermissionState`/
  `MaintenanceState` (new `StatePanel` presets) plus a real, functional
  `useOnlineStatus` hook + `OfflineWatcher` (mounted once in `AppShell`)
  that fires a toast on actual `online`/`offline` browser events — chose
  toast over a persistent banner to avoid new layout math against the
  fixed Header. `Input`/`Textarea` gained `success`/`loading`/`readOnly`
  visual states (spinner/check icon, muted readonly styling) without
  changing `Field`'s render-prop contract, so no existing form call site
  needed changes. New Radix-based `Tooltip` and `ContextMenu` primitives
  (`ui/Tooltip.tsx`, `ui/ContextMenu.tsx`); `TooltipProvider` mounts once
  in `AppShell`. There is deliberately no separate "Snackbar" component —
  it's the same concept as the already-built `Toast`, documented in
  `VO_TRI_ARCHITECTURE.md` §6 instead of building a duplicate. Navigation
  audit found one real bug: a global `html { scroll-behavior: smooth }`
  meant to power two in-page "jump down" CTAs was also smooth-animating
  Next.js's own scroll-to-top on every route navigation — fixed by
  removing the global rule and adding `ui/SmoothAnchorLink` (scrolls
  smoothly only on that specific click, falls back to instant under
  `prefers-reduced-motion`). Radix/vaul's automatic focus-return-to-trigger
  on Dialog/BottomSheet close needed no new code, only verification.
- **Autonomous audit round — SEO/production-readiness.** No new prompt
  number; a self-directed audit (per the standing "find weaknesses,
  prioritize, execute" operating mode) found and fixed a real bug:
  `/vo-tri-styleguide` had been documented everywhere as "noindex" since
  Prompt 01, but nothing actually enforced it — the page is a Client
  Component and can't export `metadata`, so no `noindex` tag ever
  rendered. Fixed with a co-located `layout.tsx` (Server Component,
  `robots: { index: false }`) plus a real `robots.ts` disallowing the
  route as a second layer. Added the other file-convention SEO routes
  that were simply missing: `icon.tsx`/`apple-icon.tsx` (generated via
  `next/og` `ImageResponse`, redrawing the real Mascot's gradient+eyes
  language rather than an unrelated placeholder), `opengraph-image.tsx`
  (shared social card — brand background/gradient/wordmark/tagline, no
  fabricated stats), `sitemap.ts` (static routes + one entry per real
  Explore activity). `/play/[activityId]` gained its own
  `generateMetadata` using the real activity's name/description instead
  of inheriting the generic root title. `lib/site.ts` centralizes
  `SITE_URL` from `NEXT_PUBLIC_SITE_URL` with a `localhost` fallback —
  deliberately not a guessed production domain, since none exists yet;
  documented in README's new "Environment variables" section.
- **Autonomous audit round — a11y + dead-CTA fixes.** No new prompt
  number. Two more real bugs found and fixed: (1) no skip-to-content
  link existed anywhere (WCAG 2.4.1 Bypass Blocks) — a keyboard/
  screen-reader user had to tab through the entire Header + Sidebar on
  every single page before reaching content; fixed with `shell/
  SkipLink.tsx` (first Tab stop, visually hidden until focused) + `main
  id="main-content" tabIndex={-1}` in `AppShell`, verified via Playwright
  keyboard test (Tab → Enter lands focus on `#main-content`). (2) the
  "Đăng nhập" button in both `Header` and `/profile` had no `onClick` at
  all — the two most prominent CTAs a logged-out visitor sees did
  literally nothing when clicked, worse than Explore's honest "Coming
  Soon" pattern. Fixed by extracting a shared `shell/LoginButton.tsx`
  (the two instances were >80% identical, consolidated per the "hai
  component giống nhau thì hợp nhất" rule) that fires an honest "chưa
  xây auth thật" toast, reusing `ComingSoonCard`'s same pattern —
  centralized both into a new `notReadyCopy` block in `microcopy.ts`
  instead of each call site inventing its own string. Full responsive
  sweep (390/1024/1440 across all 5 real routes) found zero horizontal
  overflow; full keyboard Tab-order walk on Home confirmed logical order
  (skip link → logo → notification → login → sidebar nav → hero CTA).
- **Autonomous audit round — CI was completely broken; added real E2E
  tests.** The single highest-impact finding of any audit round so far:
  `.github/workflows/ci.yml` was still a 100%-unmodified LoveBox relic —
  it spun up a live Postgres service, ran `npx prisma migrate deploy`
  (Prisma was deleted with LoveBox), and called `npm run test`/`npm run
  test:integration`, neither of which exist in this package.json. CI has
  been failing on every single push since the LoveBox purge; nobody
  would have noticed from the repo alone since GitHub Actions status
  isn't visible in a local session unless checked. Rewritten to what
  this project actually is: install → lint → typecheck → build → E2E.
  Also used the opportunity to actually stand up the E2E suite: `npm i
  @playwright/test` had *already* been sitting in `package.json` since
  the LoveBox era with zero config/tests — dead weight, not a new cost
  decision. Added `playwright.config.ts` (points at the sandbox's
  pre-installed Chromium only when that path exists, so it's a no-op
  override in real CI) and `tests/e2e/{navigation,accessibility,explore,
  play-flow}.spec.ts` covering exactly the golden paths this project has
  been manually re-verifying every round via throwaway scratch scripts:
  responsive overflow across breakpoints, the skip-link + dialog-focus-
  return a11y checks, Explore search/filter, and the one real gameplay
  completion flow — including a permanent regression test for the dead-
  login-button bug from the prior round. `npm run test:e2e` builds+serves
  a real production build before testing (not `next dev`), so CI tests
  the same artifact that would actually ship. Also removed a matching
  dead `# prisma` / `/prisma/dev.db` line from `.gitignore`.
- **Prompt 11 — Retention System.** `src/vo-tri/retention/`. Full audit
  before building: `game/` already had `RewardReveal`/`LevelUpBanner`/
  `AchievementUnlockCard` (generic celebration primitives) and
  `GameOutcome.questCompleted` (a quest hook that was never built out),
  and `profile/` already had `LevelCard`/`JourneyTimeline`/
  `CollectionShowcase`/`StatCards.streakDays` — so this prompt's real job
  was filling the gap between them (Daily Quest, Weekly Goal, Streak
  tracker, Milestone ladder, the claim/celebration flow), not rebuilding
  what already existed. Refactored first, no behavior change: moved
  `RewardReveal`/`LevelUpBanner`/`AchievementUnlockCard` from `game/` to
  `ui/`, since they're domain-agnostic and now used by both `game/`
  (ResultScreen, unchanged) and the new `retention/` (claim dialog) —
  re-verified `next build` + the full E2E suite pass identically after
  the move. Milestones deliberately track only `streak`/`activitiesPlayed`
  metrics, not level — Profile's rank ladder (`ranks.ts`) already covers
  level thresholds, and a second level-based ladder under a different
  name would just be the same information twice. Two real RSC bugs
  caught by `next build` (not typecheck), same class of bug as
  `/play/[activityId]`'s from Prompt 08: (1) `QuestCard`'s claim button
  needed `"use client"` since Home (a Server Component) renders it; (2)
  `QuestDefinition.icon` is a `LucideIcon` reference that still can't
  cross the Server→Client boundary even through a Client Component, so
  `DailyQuestPreview` (new, `"use client"`, zero props) looks up
  `getDailyQuests()` itself instead of Home computing it and passing the
  result down — exact same "look it up client-side from the same
  importable module" fix as `PlayClient`. Quest/milestone *definitions*
  are real authored game-design catalog content (`quests.ts`,
  `milestones.ts`), same status as Explore's activity catalog — not the
  fabricated *data* CLAUDE.md's rule targets. Real *progress* on them is
  a different story: Home's new "Nhiệm vụ hôm nay" section is always
  visible (the catalog itself is safe to show anyone, like Explore's
  Daily Picks) but every `QuestCard` renders an honest "Đăng nhập để theo
  dõi tiến độ" line instead of a fabricated progress bar whenever
  `progress` is absent — which is always, today. `TodayCard`'s old plain
  "Streak N ngày" text line was refactored to embed the new
  `StreakTracker` in compact mode — still gated behind the same
  `currentUser &&` check as before (never renders on the real route
  today), but the fixture demo on `/vo-tri-styleguide` is now the richer
  version. `ClaimRewardDialog` composes `RewardReveal` + optional
  `LevelUpBanner` + the new `MilestoneBanner` in one Dialog — claiming a
  quest is deliberately built from the exact same celebration vocabulary
  as finishing an Activity in `ResultScreen`, not a second unrelated
  pattern. `JourneyEventType` gained `quest`/`milestone`/`streak` variants
  (icons/tones added to `JourneyTimeline`) and `SoundEvent` gained
  `quest-claim`/`milestone-reached` — both additive, no existing call
  site needed changes. Added `tests/e2e/retention.spec.ts` (Home's
  honest logged-out quest state + the full claim-dialog flow) to the
  Prompt-10 E2E suite; full suite (13 tests) passes.
- **Prompt 12 — Gameplay Engine.** `src/vo-tri/game/`. Full reference:
  `docs/VO_TRI_GAMEPLAY_ENGINE.md`. Turned the Prompt-08 framework (a
  bare pre-game→playing⇄paused→result state machine) into a real engine:
  Timer Engine (count-up unchanged by default; declaring
  `rules.timeLimitSeconds` switches the same clock to count down and
  auto-fires a `"timeout"` result at 0 — no second interval, just
  `remainingSeconds = timeLimitSeconds - elapsedSeconds`), Scoring +
  Combo (`scoring.ts`'s `DEFAULT_SCORING` = basePoints × difficulty
  multiplier × combo multiplier — the first real behavior tied to the
  Activity catalog's `difficulty` field, previously cosmetic only),
  auto-win on `rules.targetScore`, an opt-in Countdown stage
  (`CountdownOverlay`, skippable, reduced-motion-aware), a Statistics
  Pipeline (`SessionStats`: attempts/bestScore/duration, client-only,
  resets on reload — honest, not fabricated), and an analytics no-op
  hook (`lib/analytics.ts`, same pattern as `lib/sound.ts`). Result
  Pipeline standardized: `GameOutcome` gained a `kind` discriminant
  (`win`/`lose`/`complete`/`timeout`/`abandoned`); `ResultScreen` renders
  all five through the *same* composition (mood/heading/copy from the
  new `resultCopy` in `microcopy.ts`, CTA emphasis flips to "Chơi lại"
  for the two retry-worthy kinds: `lose`/`timeout`) rather than five
  different screens. Refactored first, no behavior change: the
  Retention-System-era move of `RewardReveal`/`LevelUpBanner`/
  `AchievementUnlockCard` into `ui/` is exactly what let `ResultScreen`
  and the new Engine share one celebration vocabulary without a new
  dependency direction. Every `ActivityRules` field defaults to *off* —
  the one real Activity today (`/play/[activityId]`'s placeholder body)
  declares none of the timer/countdown/target-score rules, so its
  already-tested flow (`tests/e2e/play-flow.spec.ts`) is byte-identical
  post-rewrite; it does opt into `comboEnabled: true` and now uses
  `ctx.addScore`/`ctx.registerHit`/`ctx.lose` for real, provable
  end-to-end (not just a styleguide fixture) — verified via a new
  `tests/e2e/play-flow.spec.ts` case asserting combo accumulates and
  shows on a real `lose` result. Deliberately did *not* route the
  existing exit-confirm flow through `ResultScreen`'s new `"abandoned"`
  kind — that would change already-shipped, already-tested behavior for
  no real UX gain (most games just exit on quit, no "you quit" screen);
  the kind exists in the type system for an Activity that wants it, the
  generic flow doesn't use it. Countdown is deliberately *not* wired into
  the real route either: `GameHeader` stays visible through `countdown`
  (so Thoát/Pause work immediately, matching the tested flow), but the
  countdown overlay would visually cover the demo body's own action
  buttons, so proving it out stays on `/vo-tri-styleguide` until a real
  timed minigame exists to justify enabling it live. All 13 pre-existing
  E2E tests plus 1 new one (14 total) pass unchanged after the rewrite.
- **Autonomous audit round — unit tests, accessibility, error-boundary
  gap, and the last unwired Social component.** No new prompt number; a
  self-directed pass per the standing "audit the whole project, find the
  biggest remaining gap, decide what's highest-value" instruction, since
  Retention System and Gameplay Engine had both just closed out their own
  scopes. Four real gaps found and fixed: (1) the project had zero unit
  tests — only E2E — so every pure-logic function (scoring formula, quest/
  milestone catalog rotation, rank-ladder boundaries, `dayOfYear`/
  `timeAgo`/`cn` helpers) was only ever exercised indirectly through full
  browser E2E runs; added Vitest (`vitest.config.ts`, 7 files, 30 tests,
  colocated as `src/**/*.test.ts`) and wired it into CI between Typecheck
  and Build. (2) `StreakTracker` and `MilestoneTrack` both conveyed their
  real state (active/inactive day; reached/next/locked/not-logged-in
  milestone) purely through color + icon shape, with no text alternative
  — a screen-reader user got nothing from either component. Fixed both
  with `aria-hidden` on the decorative icon plus a `sr-only` span stating
  the day label and activity status (StreakTracker) or the milestone title
  and status (MilestoneTrack); `GameHeader`'s combo flame icon got the
  same `aria-hidden` treatment since the adjacent text already carries the
  information (deliberately did *not* add `aria-live` to the timer/combo/
  score row — those tick every second during play, and an AT announcement
  on every tick is the specific anti-pattern accessibility guidance warns
  against for countdown timers, not a gap). (3) `error.tsx` only catches
  errors thrown *below* the root layout — a crash in `layout.tsx` itself
  (font loading, `AppShell`) would have fallen through to Next's generic
  unstyled error screen, since only `global-error.tsx` (a separate file
  convention) can catch that. Added it: its own minimal `<html>/<body>`,
  reusing `errorCopy.generic` from the microcopy dictionary but with raw
  inline styles (not Tailwind classes, not `AppShell`) matching the real
  design tokens by hex, since this fallback exists precisely for the case
  where more of the normal stack has failed. (4) Prompt 09 built
  `ActivityFeed` but never wired it into a real route — every other Social
  Foundation piece either backs something real (`NotificationCenter` →
  Header's bell) or has an honest reason to stay fixture-only
  (`CommentSection`/`ShareSheet`/`FollowButton` all need a real thread/
  profile/target to attach to); `ActivityFeed` had neither excuse, it's a
  standalone list that can honestly render empty. Wired into Home as a new
  "Cộng đồng đang làm gì" section with `items={[]}` — the same honest-
  empty-state pattern as `DailyQuestPreview` — verified via screenshots at
  390/1440px (no overflow, matches existing section rhythm) and a new
  `tests/e2e/social.spec.ts`. Full verification: `tsc`, lint, `vitest run`
  (30/30), `next build`, and the full Playwright suite (now 15 tests) all
  green.
- **Autonomous audit round — PWA installability.** No new prompt number.
  The app had no `manifest.ts`, meaning "Add to Home Screen" on mobile
  fell back to a generic browser-chrome icon/name instead of the real
  brand — a real gap toward feeling like a shippable product rather than
  a browser tab, and doable with zero backend. Added `manifest.ts`
  (name/theme_color/background_color pulled from the real design tokens,
  not guessed hex) plus `icon192/route.tsx` and `icon512/route.tsx` —
  plain Route Handlers with `dynamic = "force-static"` (confirmed via
  `next build` output moving from `ƒ` to `○`) rather than the `icon.tsx`
  file convention, since that convention owns exactly one size per file
  and a manifest needs multiple explicit sizes. Also added a `viewport`
  export to `layout.tsx` (Next 15 moved `themeColor`/`colorScheme` out of
  `metadata`) so mobile browser chrome renders in the brand's dark
  surface color instead of a default light strip — verified via a live
  server (`curl` on `/manifest.webmanifest`, `/icon192`, `/icon512`, and
  grepping Home's rendered HTML for the `<link rel="manifest">` and
  `<meta name="theme-color">` tags) and visually by rendering the 512px
  icon. Added a permanent regression test (`tests/e2e/navigation.spec.ts`)
  asserting the manifest is valid JSON, both icon URLs resolve, and the
  real tags are present. Full verification: `tsc`, lint, `next build` all
  green.
- **Backend Foundation Phase 1 — design, not yet connected.** Full
  reference: `docs/BACKEND_ARCHITECTURE.md`. Chose Supabase (free tier
  Auth+Postgres+Storage in one, real Postgres RLS, `@supabase/ssr` fits
  Next.js App Router natively). 24-table schema across 8 groups (identity,
  catalog mirrors, gameplay/reward economy, retention, unlocks, social,
  notifications/timeline, ranking/ops) — catalog content (activities/
  quests/milestones/achievements/badges) stays authored in frontend code
  as always; DB tables are thin `id`-keyed mirrors seeded from that code,
  existing only so per-user progress tables get real FK integrity, never
  a second source of truth for game-design content. Anti-cheat design
  went through a real correction during this round: the first draft
  assumed the server could exactly recompute `GameOutcome.points` from
  `(comboMax, durationSeconds)` — re-reading `GameFrame.tsx` showed score
  is an accumulated total across many `addScore()` calls with combo state
  changing between them, not a closed-form result, and `PlayClient.tsx`'s
  demo paths show both `points` and `xp` can be client-influenced
  depending which button fires. Exact server-side replay would need
  `GameFrame` to log its full event sequence — a frontend change out of
  this round's scope — so the shipped design instead clamps both fields
  to a generous ceiling (`activities.reward/xp × 3`) computed entirely
  server-side from catalog data, logs a `score_clamped` audit row when
  triggered, and documents the full-replay upgrade path for if the
  economy ever gets real stakes. Every privileged write (recording a
  session, claiming a quest/milestone, following) goes through a
  `security definer` Postgres function, never a raw client
  INSERT/UPDATE — this is what actually enforces the anti-cheat/business
  rules, not the RLS policies alone (RLS is the last line of defense,
  per the doc's own stated principle). Migrations are split so every
  cross-cutting function (touching tables from multiple domains) lives
  in one final `..._functions.sql`, avoiding a real forward-reference bug
  caught during this round (an earlier draft had `record_activity_session`
  writing to `notifications`/`audit_log` from inside the *tables*
  migration for its own domain, before those tables existed). Docker Hub
  was blocked by this session's egress policy (confirmed via the proxy
  status endpoint, a deliberate org policy — not routed around), so all
  12 migrations were validated for real against the `postgresql-16` apt
  package already on the sandbox instead of a Docker-based local Supabase
  stack: stubbed `auth`/`storage` schemas + roles, applied all 12 files
  in order, then ran a real smoke test (not just DDL syntax) proving the
  trigger auto-creates a profile, `record_activity_session` awards
  correct points/XP/streak/level and advances all 7 relevant quests in
  one call, `dailyLimit` blocks a same-day repeat, the anti-cheat clamp
  actually clamps and logs, `claim_quest`/`claim_milestone` reject
  premature claims, RLS genuinely isolates two different users' private
  rows, and `anon` can read public data but is rejected calling the
  privileged RPC. Also shipped (no credentials needed to write):
  `src/vo-tri/server/supabase/{server-client,admin-client,database.types}.ts`,
  `src/middleware.ts` (session refresh — found during verification that
  it must live at `src/middleware.ts`, not repo root, since this project
  uses a `src/` layout; `next build`'s missing "ƒ Middleware" line caught
  the wrong location immediately), `.env.example`, and the
  `@supabase/supabase-js`/`@supabase/ssr`/`zod` dependencies. Deliberately
  NOT written yet: the actual `repositories/`/`services/`/`actions/`
  layer — writing business logic with no live project to typecheck
  against or exercise a real request through would be exactly the kind
  of "unverified code sitting in the repo" this project's own honesty
  rule forbids. Full verification after every change: `tsc`, lint,
  `next build` (confirms middleware registers), `vitest run` (30/30),
  and the full Playwright suite (16/16) all green.
- **Backend Foundation Phase 2 — Supabase Integration Prep (owner
  explicitly overrode Phase 1's "don't write it yet" call).** Full
  reference: `docs/BACKEND_ARCHITECTURE.md` §13. The owner directed
  writing repositories/services/actions now, accepting they can only be
  typecheck/lint/unit-test verified (not execution-tested) until real
  credentials exist, as long as the credential-dependent boundary stays
  cleanly isolated. That boundary is exactly one function:
  `createServerSupabaseClient()` in `server-client.ts` — every
  repository/service/action reaches Supabase only through a `client`
  parameter or `require-auth.ts`'s two helpers
  (`requireAuthenticatedClient`/`getClientAndOptionalUserId`), so the
  entire layer above it (6 repositories, 7 services, all adapters/
  validation from Phase 2's earlier rounds, all 7 new
  `"use server"` action files) is fully unit-testable today. Proved the
  isolation with a real test, not just an architectural claim:
  `server-client.test.ts` deletes both Supabase env vars and asserts
  `createServerSupabaseClient()`/`getCurrentUser()` reject with the exact
  configured Vietnamese error — runnable in plain Vitest with zero Next.js
  request context, because the function checks env vars *before* ever
  calling `cookies()` from `next/headers`. Rewrote `database.types.ts`
  during this round after `tsc` surfaced a real structural bug: using
  `Insert: never`/`Update: never` to encode "not client-writable" and
  omitting `Relationships`/`Views` broke `@supabase/supabase-js`'s
  `GenericSchema` generic inference project-wide — root-caused by reading
  the library's own type source, fixed with real Insert/Update object
  shapes everywhere (RLS is what actually blocks unauthorized writes, not
  the TypeScript types) plus accurate `Relationships` entries for
  `comments`/`feed_items` so embedded joins (`select("*, author:profiles(*)")`)
  type-check instead of resolving to `SelectQueryError`. Self-caught bug:
  `auth-service.ts` originally piped a zod validation *message* through
  `fail(code)`, which does a `serverErrorCopy` lookup by code and silently
  discards anything that isn't a recognized key — added `validationFail(message)`
  to `errors.ts` specifically so a real, specific validation message
  never gets swapped for the generic fallback. Server Actions are thin by
  design — each parses input, calls exactly one service function, and
  `revalidatePath()`s the affected route on a successful mutation — but
  none are wired into any Client Component yet; writing the call site
  is easy without credentials, but verifying it round-trips correctly is
  not, so wiring `LoginButton`/`EditProfileSheet`/`PlayClient`/`QuestCard`/
  `FollowButton`/`CommentSection`/`NotificationCenter` to these actions is
  the first thing that happens once Project URL/Anon Key/Service Role Key
  exist — no re-planning needed. Verified: `tsc`, lint, `vitest run`
  (77/77 across 17 files, up from 30), `next build` (confirms no
  credential-dependent code crashes at static-generation time since
  Server Actions are only bundled, never invoked, during build), and the
  full Playwright suite (16/16) all green — nothing in the shipped app
  changed since no UI calls the new layer yet.
