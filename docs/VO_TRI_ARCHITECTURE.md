# VÔ TRI — Architecture, Component Inventory & Routing

Companion to `docs/VO_TRI_DESIGN_BIBLE.md` (that file explains brand/visual
*why*; this file is the map of *where things live* for a newcomer) and
`docs/VO_TRI_GAMEPLAY_ENGINE.md` (the full lifecycle/state-flow/extension-point
reference for `src/vo-tri/game/` specifically). Kept deliberately short —
it's an index, not a tutorial.

## 1. Folder structure

```
src/app/                 Next.js App Router routes only. Every page composes
                          components from src/vo-tri/*, never owns its own
                          business logic or hand-rolled styles.
src/vo-tri/design-system/ tokens.css (color/radius/shadow/blur/gradient) +
                          motion.css (durations/easings/keyframes). Source of
                          truth for every visual constant in the app.
src/vo-tri/ui/            Generic, domain-agnostic primitives (Button, Card,
                          Dialog, Toast, Tooltip, Avatar, StatePanel, ...).
                          Import from the barrel `@/vo-tri/ui`, not individual
                          files — call sites shouldn't know internal layout.
src/vo-tri/shell/          AppShell + Header/Sidebar/BottomNav/Container — the
                          one wrapper every route mounts inside.
src/vo-tri/{home,explore,profile,leaderboard,game,social,retention}/
                          One folder per feature domain. Each has its own
                          `types.ts` and an `index.ts` barrel (game/social/
                          explore/profile/leaderboard/retention; home has no
                          barrel yet since Home is the only consumer of its
                          parts).
src/vo-tri/copy/           Central Vietnamese microcopy (never hand-write UI
                          strings per screen — extend microcopy.ts instead).
src/vo-tri/lib/            Small framework-agnostic helpers/hooks (cn, date,
                          time, sound, check-in, use-media-query,
                          use-online-status). Anything reused by 2+ domains
                          belongs here, not duplicated per-folder.
```

Rule of thumb for "where does new code go": generic + reusable across
domains → `ui/` or `lib/`; specific to one feature → that feature's own
folder; brand-wide constant (color, spacing, motion timing) → `design-system/`
+ `tailwind.config.ts`, never hardcoded in a component.

**Recurring RSC gotcha** (hit twice now — `/play/[activityId]` in Prompt 08,
`retention/DailyQuestPreview` in Prompt 11): any catalog item carrying a
`LucideIcon` component reference (`Activity.icon`, `QuestDefinition.icon`,
...) cannot cross the Server→Client boundary, even wrapped in a Client
Component's props. The fix is always the same — don't compute the catalog
server-side and pass it down; give the Client Component zero props and have
it `import` the same catalog module and look the data up itself.

## 2. Routing map

| Route | Purpose | Data today |
|---|---|---|
| `/` | Home — hero, daily message, quick access, daily quest preview, activity spotlight, community pulse, activity feed | No session yet → always logged-out branch. Daily Quest catalog is real and always visible (like Explore's Daily Picks); per-user progress and the activity feed stay honestly absent |
| `/explore` | Activity catalog — search/filter/detail sheet | Real static catalog (`explore/activities.ts`) |
| `/profile` | Own profile | No auth yet → honest logged-out state only |
| `/leaderboard` | Rankings | No backend yet → honest empty state |
| `/play/[activityId]` | Real per-activity gameplay flow (`generateStaticParams` over the Explore catalog) | Real catalog lookup, no persisted results — has its own `generateMetadata` (real activity name/description) |
| `/vo-tri-styleguide` | Internal, `noindex` — every component demoed with clearly-commented FIXTURE data | Fixture only, never real. Noindex is enforced by its own `layout.tsx` (the page itself is a Client Component and can't export `metadata`) plus `robots.ts` |

All routes are plain path segments (no route groups, no parallel/intercepting
routes) — every one is a real, deep-linkable URL today.

File-convention routes (no manual wiring needed): `icon.tsx`/`apple-icon.tsx`
(on-brand generated favicon, matches the real Mascot's gradient + eyes),
`opengraph-image.tsx` (shared social-share card, no fabricated stats on
it), `robots.ts`, `sitemap.ts` (static routes + one entry per real
Explore activity). All four read the real activity catalog or
`lib/site.ts`'s `SITE_URL` — nothing hardcoded or guessed.

`manifest.ts` makes the site installable (Add to Home Screen) with real
brand colors (`background_color`/`theme_color` = `--vt-bg`), sourcing its
two larger icon sizes from `icon192/route.tsx` and `icon512/route.tsx` —
plain Route Handlers (`export const dynamic = "force-static"`) rather than
the `icon.tsx` convention, since that convention owns one size per file
and a manifest needs explicitly-sized entries. `layout.tsx` exports a
`viewport` (Next 15 moved `themeColor`/`colorScheme` out of `metadata`)
so mobile browser chrome renders in the brand's dark surface color instead
of a default light strip.

`error.tsx` catches a thrown error anywhere below the root layout and
renders it through the brand's `ErrorState`. `global-error.tsx` is the
separate fallback for the rarer case where the root layout itself throws
(a different Next.js convention — `error.tsx` cannot catch that, since it
renders *inside* the layout it would need to replace); it renders its own
minimal `<html>/<body>` with inline styles matching the real design
tokens and deliberately skips `AppShell`/context providers, since those
are exactly what may have just failed.

## 3. Component inventory

**`ui/` (generic primitives)** — AchievementUnlockCard, Avatar, Background,
Badge, BottomSheet, Button, Card, ChipGroup, ContextMenu, Dialog +
DialogPresets (Confirm/Error/Success/Reward), Input/Textarea/Field,
LevelUpBanner, LoadingState, Mascot, ProgressBar, RewardReveal, Skeleton,
SmoothAnchorLink, StatePanel presets (Empty/Error/Success/Offline/Retry/
Permission/Maintenance), Tooltip, Toast/Toaster. `RewardReveal`/
`LevelUpBanner`/`AchievementUnlockCard` moved here from `game/` (Prompt 11) —
domain-agnostic celebration primitives now shared by `game/ResultScreen` and
`retention/ClaimRewardDialog`.

**`shell/`** — AppShell (mounts once from `src/app/layout.tsx`), Header,
Sidebar, BottomNav, Container, NotificationBell, OfflineWatcher.

**`home/`** — HeroScene, QuickAccess, TodayCard, ActivitySpotlight,
CommunityPulse.

**`explore/`** — ExploreHero, FeaturedActivity, CategoryChips, ActivityCard,
ActivityStatGrid, ComingSoonCard/Strip, DailyPicks, ContinuePlaying,
ActivityDetailSheet, ExploreInteractive, ExploreFooter.

**`profile/`** — ProfileHero, ProfileAvatar, LevelCard, StatCards,
AchievementSection, BadgeCollection, JourneyTimeline, CollectionShowcase,
EditProfileSheet, ShareProfile (wraps `social/ShareSheet`).

**`leaderboard/`** — LeaderboardHero, TopThreePodium, LeaderboardRow/List,
MyPositionCard, RankChangeIcon, ScopeFilter (built on `ui/ChipGroup`).

**`game/`** — the Gameplay Engine. Full reference: `docs/VO_TRI_GAMEPLAY_ENGINE.md`.
GameFrame (the engine: pre-game → countdown(opt-in) → playing ⇄ paused →
result, driven by a render-prop + optional `ActivityRules`), CountdownOverlay,
GameHeader, PreGameScreen, PausedOverlay, ExitConfirmDialog, ResultScreen
(kind-aware: win/lose/complete/timeout/abandoned), GameNotReadyState,
scoring.ts (DEFAULT_SCORING — difficulty + combo multiplier formula).

**`social/`** — SocialCard, ReactionBar, CommentSection/Item/Composer,
ShareSheet, UserPreviewCard, FollowButton, FeedItemCard, ActivityFeed,
NotificationCenter. `ActivityFeed` is wired into Home ("Cộng đồng đang làm
gì", real route, `items={[]}` today — the honest empty state, same
discipline as `DailyQuestPreview`); `NotificationCenter` backs the real
Header bell. `CommentSection`/`ShareSheet`/`UserPreviewCard`/`FollowButton`
remain demonstrated with fixture data on `/vo-tri-styleguide` only — there
is no real comment thread, share target, or followable profile yet for
any of them to attach to honestly.

**`retention/`** — QuestCard/QuestList (Daily Quest + Weekly Goal, same
component parameterized by `cadence` rather than two near-duplicates),
DailyQuestPreview (client wrapper Home uses — see the RSC note below),
StreakTracker (flame + 7-day dot strip, `compact` mode embeds inside
`home/TodayCard`), MilestoneTrack (ordered ladder over one metric —
`streak` or `activitiesPlayed`; deliberately not `level`, since
`profile/ranks.ts` already covers that), MilestoneBanner + ClaimRewardDialog
(the reward-claim/celebration moment, composing `ui/RewardReveal` +
`ui/LevelUpBanner` + `MilestoneBanner` in one Dialog — the same celebration
vocabulary `game/ResultScreen` uses for finishing an Activity).

Every component above is demonstrated on `/vo-tri-styleguide` with fixture
data — that page is the living proof a component renders correctly, check it
after any token or props change.

## 4. Motion guideline

- Use the Tailwind theme extensions, not raw values: `duration-vt-instant/
  fast/base/slow/lazy` and `ease-vt-out/in-out/spring/mischief` (mapped to
  `--vt-duration-*`/`--vt-ease-*` in `design-system/motion.css`). Never
  `duration-150`/`ease-out` (Tailwind's built-in curve, not the brand's).
- Use the `.vt-*` animation classes for entrances/emphasis (`vt-fade-up`,
  `vt-pop-in`, `vt-scale-in`, `vt-bounce-in`, `vt-wiggle`, `vt-shake`,
  `vt-float`, `vt-pulse-glow`, `vt-celebrate`) instead of writing new
  `@keyframes` per component.
- Every animation touches only `transform`/`opacity`(/`box-shadow` for glow)
  — never layout properties, so nothing can cause CLS.
- `prefers-reduced-motion: reduce` is handled once, globally, in
  `src/app/globals.css` (collapses all animation/transition durations) —
  don't add a second reduced-motion branch per component. The one exception
  is JS-driven motion that isn't a CSS transition/animation (e.g.
  `RewardReveal`'s `requestAnimationFrame` count-up, `SmoothAnchorLink`'s
  `scrollIntoView`) — those check `matchMedia("(prefers-reduced-motion:
  reduce)")` directly and skip straight to the end state.
- No global `html { scroll-behavior: smooth }` — it would also
  smooth-animate Next's own scroll-to-top on every route navigation. The two
  in-page "jump down" CTAs use `ui/SmoothAnchorLink` instead, which scrolls
  smoothly only on that specific click.

## 5. Responsive guideline

- Breakpoints are Tailwind's stock `sm`/`md`/`lg`/`xl` — no custom breakpoint
  scale.
- `md:` is the mobile/desktop shell split: BottomNav is mobile-only, Sidebar
  appears at `md:`+, `main` gets `md:pl-60` to clear the Sidebar.
- Content width is decided in exactly one place: `shell/Container` (`app`
  variant `max-w-6xl`, `prose` variant `max-w-2xl`) — don't hardcode a
  max-width in a feature component.
- Desktop-vs-mobile *component* swaps (not just layout reflow) go through
  `lib/use-media-query.ts` (SSR-safe: starts false, syncs on mount) — e.g.
  `EditProfileSheet` picks Dialog on desktop vs BottomSheet on mobile from
  one hook rather than maintaining two components.
- Fixed-position overlays that must survive long scrollable lists use
  `position: fixed`, not `sticky` (`sticky` only holds within its own
  containing block and will scroll away — see `MyPositionCard`).

## 6. Feedback system — Toast vs. "Snackbar"

VÔ TRI has one transient-feedback primitive: `ui/toast` (`Toaster` mounted
once in `AppShell`, `toast()` callable from anywhere). There is no separate
"Snackbar" component — that's the same UI concept under a different name
(brief transient message, auto-dismiss, optional action), so a second
component would just be a duplicate to keep in sync. Anywhere a spec calls
for a "snackbar," use `toast()`.

## 7. What's still frontend-only (no backend)

No DB/auth/API routes exist yet. Every route that would need real user data
shows an honest empty/logged-out state (see each route's row in §2) rather
than fabricated numbers — this is a CLAUDE.md rule, not an oversight. Rich
components are still fully built against real prop shapes and demonstrated
with fixture data on `/vo-tri-styleguide`, so wiring a real backend later is
a matter of passing real data into existing components, not building new UI.
