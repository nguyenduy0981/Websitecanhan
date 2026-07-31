# VÔ TRI — Gameplay Engine

Companion to `docs/VO_TRI_ARCHITECTURE.md`. That file maps the whole
codebase; this one is just `src/vo-tri/game/` — the engine every Activity's
real minigame will eventually plug into. Written so a newcomer can add a
new Activity's gameplay without ever touching this folder.

## 1. Philosophy

An Activity should only ever need to declare **what** the game is (its
rules, its win/lose condition, how it scores) — never **how** a session's
lifecycle, timer, pause/resume, exit confirmation, reward reveal, result
screen, or statistics work. Those are identical across every Activity by
design; re-implementing them per game would be exactly the kind of
per-Activity hardcoding this Engine exists to prevent.

The one thing the Engine deliberately does **not** own is the actual
on-screen gameplay — a memory-matching grid and a reflex-tap game share
nothing visually or interactively. That part stays a render-prop
(`children`) the Activity supplies. Everything *around* it is the Engine's
job.

## 2. Lifecycle

```
pre-game → (countdown) → playing ⇄ paused → result
              optional
```

- **pre-game** — `PreGameScreen`: name/description/difficulty/reward/time,
  one "Bắt đầu" CTA. Nothing is running yet.
- **countdown** — `CountdownOverlay`, opt-in via `rules.countdownSeconds`.
  Skipped entirely (`countdownSeconds` unset/0, or `prefers-reduced-motion`)
  straight to **playing**. `GameHeader` (Thoát/Pause) stays available and
  clickable during it — the overlay only covers the gameplay area, not the
  whole session.
- **playing** — the Activity's `children(ctx)` render prop is live; the
  elapsed-time clock ticks; the Engine watches `rules.targetScore` /
  `rules.timeLimitSeconds` every render and can auto-transition to
  **result** without the Activity checking anything itself.
- **paused** — `PausedOverlay` layers over the gameplay area (same pattern
  as the countdown overlay); the elapsed-time clock stops (the effect that
  ticks it only runs `if (stage === "playing")`).
- **result** — `ResultScreen`, see §5 (Result Pipeline).

Exiting mid-session (`ExitConfirmDialog` → confirm) does **not** route
through `result` — it calls `onExit()` directly today, same as before this
Engine existed. `ResultKind: "abandoned"` exists in the type system and
`ResultScreen` can render it, for an Activity that deliberately wants to
show a result screen on exit instead of navigating away immediately — the
generic flow just doesn't use it, so nothing already-shipped changed.

## 3. GameplayContext — what `children(ctx)` receives

| Field | Type | Meaning |
|---|---|---|
| `stage` | `GameStage` | Current lifecycle stage (rarely needed directly — the gameplay body usually just reacts to being called) |
| `elapsedSeconds` | `number` | Count-up clock, always running while `playing` |
| `remainingSeconds` | `number \| undefined` | Only set when `rules.timeLimitSeconds` is declared — counts down, hits 0 → auto `"timeout"` |
| `score` | `number` | Running score, only ever changed via `addScore` |
| `progress` | `number` | 0–100, whatever the Activity wants it to mean (own it directly via `setProgress`) |
| `combo` | `number` | Only meaningful when `rules.comboEnabled` |
| `addScore(basePoints)` | fn | Reports one scoring event; the Engine applies the difficulty + combo multiplier (or a custom `rules.scoring`) and adds the result to `score` |
| `registerHit()` / `registerMiss()` | fn | Increments / resets the combo counter (no-ops unless `rules.comboEnabled`) |
| `setProgress(percent)` | fn | Sets `progress` directly |
| `win(extra?)` / `lose(extra?)` / `complete(extra?)` | fn | Ends the session with that `ResultKind`; `extra` can override any `GameOutcome` field (e.g. a real `leveledUp`/`achievementUnlocked` once a backend computes those) |

## 4. ActivityRules — declaring behavior instead of writing it

```ts
interface ActivityRules {
  timeLimitSeconds?: number;   // countdown timer; 0 remaining → auto "timeout"
  targetScore?: number;        // score reaching this → auto "win"
  countdownSeconds?: number;   // pre-play "3,2,1,Go"; unset/0 = skip it
  comboEnabled?: boolean;      // turns on registerHit/registerMiss + combo multiplier
  comboResetOnMiss?: boolean;  // default true — a miss zeroes the combo
  scoring?: ScoringStrategy;   // override the default difficulty+combo formula entirely
}
```

Every field is optional and defaults to "off." An Activity that declares
no rules at all (today's only real one, `/play/[activityId]`'s placeholder
body) behaves exactly like the pre-Engine framework did — this is what
`tests/e2e/play-flow.spec.ts` keeps proving on every CI run.

## 5. Scoring Engine + Combo System

`game/scoring.ts`'s `DEFAULT_SCORING` is the formula applied unless an
Activity supplies its own:

```
final points = basePoints × difficultyMultiplier × comboMultiplier
```

- `difficultyMultiplier` — from the Activity catalog's existing
  `difficulty` field (`de` ×1, `vua` ×1.25, `kho` ×1.5) — the first real
  engine behavior tied to what was previously a cosmetic label only.
- `comboMultiplier` — `1 + min(comboCount, 10) × 0.1`, capped at +100% so a
  long combo can't make score run away unbounded.

A game that needs different math (e.g. time-based bonus instead of
combo-based) passes its own `rules.scoring: (input) => number` — the
`comboCount`/`difficulty` inputs are still there to use or ignore.

## 6. Result Pipeline

Every session ends as one of five `ResultKind`s, all rendered by the same
`ResultScreen`, differentiated only by mood/heading/copy
(`copy/microcopy.ts`'s `resultCopy`) and which CTA is visually primary:

| Kind | When | Mascot | CTA emphasis |
|---|---|---|---|
| `win` | `ctx.win()`, or `rules.targetScore` reached | celebrating | Về Khám phá |
| `complete` | `ctx.complete()` — neutral, no win/lose concept (e.g. check-in) | celebrating | Về Khám phá |
| `lose` | `ctx.lose()` | thinking | **Chơi lại** (retry-focused) |
| `timeout` | `rules.timeLimitSeconds` hits 0, automatic | mindblown | **Chơi lại** (retry-focused) |
| `abandoned` | available, not auto-triggered by the generic exit flow (see §2) | sleepy | Về Khám phá |

Combo max and session stats (see §7) render as a small pill row when
present; `questCompleted`/`leveledUp`/`achievementUnlocked` compose the
same celebration primitives (`ui/RewardReveal`, `ui/LevelUpBanner`,
`ui/AchievementUnlockCard`) the Retention System's `ClaimRewardDialog`
uses — one celebration vocabulary everywhere in the product, not per
system.

## 7. Statistics Pipeline

`GameFrame` tracks, entirely client-side (no backend, resets on reload —
an honest "this session" stat, not a fabricated persisted one):

```ts
interface SessionStats {
  attempts: number;       // how many times "Bắt đầu"/"Chơi lại" fired this session
  bestScore: number;      // max score reached across attempts
  durationSeconds: number; // elapsed time at the moment the result fired
}
```

Surfaced on `ResultScreen` only when there's more than one attempt (a
first-try result doesn't need to tell you it was your first try).

## 8. Reward Pipeline

`GameOutcome` (what `win`/`lose`/`complete` — or an auto-triggered
`timeout` — build) always includes real, Engine-computed `points`/`xp`
(the current `score` and the Activity's own `xp`) plus whatever the
`extra` argument overrides. `coins`/`leveledUp`/`achievementUnlocked`/
`questCompleted` stay caller-supplied `extra` fields, since computing
those for real requires cross-cutting profile/quest state the Engine
deliberately doesn't own (no backend exists to compute them from yet) —
this is the same extension point the Retention System's `ClaimResult`
uses.

## 9. Analytics hook

`lib/analytics.ts`'s `trackEvent()` is a no-op today, called from
`activity_start`/`activity_exit`/`activity_result`. Same pattern as
`lib/sound.ts` — wiring a real analytics provider later is a one-file
change, not a hunt through every Activity.

## 10. How to add a new Activity's real gameplay

1. Its **metadata** already exists — one entry in
   `explore/activities.ts` (name, description, difficulty, reward, xp, ...).
2. Declare **rules** (all optional): does it have a time limit? A target
   score to win at? Should combos multiply score?
3. Render the actual gameplay via `GameFrame`'s `children` render-prop,
   calling `ctx.addScore()`/`ctx.registerHit()`/`ctx.registerMiss()` as the
   player does things, and `ctx.win()`/`ctx.lose()`/`ctx.complete()` when
   the Activity's own win/lose condition is met (or let `rules.targetScore`/
   `rules.timeLimitSeconds` do it automatically).
4. That's it — pause/resume, exit confirmation, the timer, the countdown,
   scoring math, the result screen, and statistics are all already handled.

```tsx
<GameFrame
  activity={activity}
  rules={{ timeLimitSeconds: 30, comboEnabled: true }}
  onExit={() => router.push("/explore")}
>
  {(ctx) => (
    <MyGameBoard
      onCorrectTap={() => { ctx.registerHit(); ctx.addScore(10); }}
      onWrongTap={() => ctx.registerMiss()}
      onBoardCleared={() => ctx.win()}
    />
  )}
</GameFrame>
```

No changes to `game/` are needed to ship this.

## 11. What's still an extension point (no backend yet)

- `leveledUp`/`achievementUnlocked`/`questCompleted`/`milestoneReached` on
  a real `GameOutcome` need a real profile/quest backend to compute — the
  Engine already accepts them via `extra`, nothing here needs to change
  when that exists.
- `trackEvent()` needs a real analytics provider wired into
  `lib/analytics.ts` — one file.
- `playSound()` (`lib/sound.ts`) needs real audio assets — one file.
