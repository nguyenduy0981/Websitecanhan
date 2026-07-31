# VÔ TRI — Product Bible

> **What this document is.** Everything in `VO_TRI_GAMEPLAY_VISION.md`
> and `VO_TRI_NORTH_STAR.md` was discovery — designing what VÔ TRI could
> be. This document is execution — turning that discovery into a single
> source of truth, a buildable architecture, an honest MVP, and a
> phased release plan. **This document, and specifically Part 5, is now
> the primary reference for product development.** The two vision
> documents remain in the repo as the detailed rationale underneath it —
> read them when you need the *why* behind an entry here, the same
> relationship `CLAUDE.md` has to `AI_ENGINEERING_CONTEXT.md` on the
> engineering side.
>
> No code changes accompany this document. Nothing here is authorized
> for implementation yet — Part 3 (MVP) and Part 4 (Release Plan) are
> the recommended next steps, not a green light.

---

## Part 1 — Product Inventory (single source of truth)

Every concept introduced across both vision documents, grouped,
deduplicated, and merged where two ideas turned out to be the same idea
wearing two names.

### 1.1 Already-Built Core Systems

Real code, real database schema, already exist — not part of the vision
work, the foundation it stands on.

| System | What it is | Where it lives |
|---|---|---|
| Activities catalog | 9 real mini-games (Điểm Danh, Vòng Quay, Rút Thẻ, Thử Thách 60s, Đố Vui, Máy Chế Meme, Chuyện Ngẫu Nhiên, Đoán Cảm Xúc Mascot, Gõ Nhanh) + 3 coming-soon | `src/vo-tri/explore/activities.ts` |
| XP / Level / Points economy | Ceiling-clamped anti-cheat, `security definer` RPCs | `record_activity_session`, `claim_quest`, `claim_milestone` |
| Quests | Daily core + rotating bonus, weekly goals | `src/vo-tri/retention/quests.ts` |
| Milestones | Streak + activities-played ladder | `src/vo-tri/retention/milestones.ts` |
| Achievements | One-off notable-event catalog (granting rules undesigned) | `src/vo-tri/profile/achievements.ts` |
| Badges | Rarity-tiered catalog | `src/vo-tri/profile/badges.ts` |
| Collection | Skin/title/item catalog | `src/vo-tri/profile/collection.ts` |
| Leaderboard | Global/friends/week/month/season scopes | `src/vo-tri/leaderboard/` |
| Social | Reactions, comments, follow, activity feed, notifications | `src/vo-tri/social/` |
| Rank ladder | Tân Binh → Kỳ Cựu → Cao Thủ → Huyền Thoại Vô Tri | `src/vo-tri/profile/ranks.ts` |
| Auth | Wired to the real Supabase project already | `AuthDialog`/`UserMenu` |

### 1.2 Signature Moments (top tier, net-new)

| Concept | One line | Depends on |
|---|---|---|
| Lời Tiên Tri Không Xin (The Ambush) | Unschedulable, ephemeral personal prophecy | Nothing — no data prerequisite, can exist day one |
| Toà Án Vô Tri (The Court) | Synchronous friend-vs-friend blind verdict | A dilemma-content pool (shared with 1.3's poll/choice mechanics) |
| Gương Vô Tri (The Mirror) | Rare, true, affectionate personal callout | Real behavioral history — cannot exist meaningfully on day one |
| Giờ Vô Tri (Vô Tri Hour) | Fixed daily appointment window | Content worth gating — cannot exist meaningfully until 1.3's mechanics exist |
| Vô Tri Tuần Này (Weekly Recap) | Weekly *lowlight* card, not a highlight reel | Court verdicts + Meme Battle results + streak data all already existing |

### 1.3 Supporting Content Mechanics (net-new, feed the five above)

Two real merges found during this inventory pass — noted explicitly
rather than left as silent duplication:

- **Merged:** *Vô Tri Đồng Thuận* (daily poll + friends comparison) and
  *Chọn Đi Đừng Nghĩ* (impossible-choice cards) were two names for
  overlapping content — one mechanic now: Vô Tri Đồng Thuận is the
  user-facing daily poll; its content pool doubles as the dilemma supply
  for Toà Án's trials. One content catalog, two consumption surfaces.
- **Merged:** Mascot easter eggs and secret achievements are the same
  category — "Hidden Discovery Content" — both are rare, undiscoverable-
  by-menu rewards that feed the same rarity ladder as Mystery Box drops.

| Concept | Feeds | Real dependency |
|---|---|---|
| Đấu Trường Meme (Meme Battle) | Weekly Recap's winner, Chronicle entries | Existing Máy Chế Meme content |
| Thách Đấu Vô Tri (Dares/Contagion) | Nothing upstream — a standalone friend mechanic | None |
| Bạn Vô Tri Đến Mức Nào? (Archetype quiz) | Mirror's vocabulary, Collection titles | None |
| Vô Tri Đồng Thuận (merged, see above) | Court's dilemma pool, own daily content | None |
| Chuỗi Chữ Vô Tri (Word Chain) | Its own "hall of authors," a small Mirror-like effect | None |
| Hộp Bí Ẩn (Mystery Box) | Reward delivery for Vô Tri Hour, Hidden Discovery Content | Existing points/badge/collection economy |
| Sự Kiện Cộng Đồng (Community events) | Chronicle entries | An admin-triggered progress bar, not a permanent system |
| Mùa Vô Tri (Seasons) | Xin Xăm Vô Tri, seasonal Chronicle entries | The already-built, currently-empty `seasons` table |
| Vô Tri Tự Chế (Creator submissions) | Long-term content pipeline for everything above | **Blocking dependency: real moderation tooling does not exist yet** |
| Đừng Cười (Don't Laugh) | Nothing upstream | None |
| Đoán Xem AI Nghĩ Gì (Reverse AI trivia) | Nothing upstream | **Real AI/LLM API integration — a genuine recurring cost, not yet justified per CLAUDE.md's cost rule** |
| Ngày Vô Tri Đặc Biệt (Special Chaos Day) | — | A variant of the Ambush's own "unschedulable event" mechanism, applied app-wide instead of per-user — shares infrastructure with 1.2's Prophecy, not a separate system |

### 1.4 Culture Systems (emergent — design discipline, not code)

Native Language (27 phrases), Unwritten Social Rules (5 norms), and
User-Invented Traditions are not features to build — they are outcomes
the mechanics above are responsible for making *possible*. Nothing here
gets its own backend; everything here is a test the mechanics above must
pass, tracked qualitatively (see Part 2's Success Metrics per mechanic).

### 1.5 Mythology Systems (net-new, content + delivery mechanism)

Đấng Vô Tri (the unseen entity), the lore-fragment delivery mechanism,
and the four deliberately-unresolved mysteries. No new backend beyond a
`lore_fragments` catalog and a rare-delivery hook piggybacking on
existing delivery surfaces (Mystery Box drops, Oracle lines, Mirror
asides) — this is a content authoring effort layered onto systems that
already exist once 1.2/1.3 do.

### 1.6 Long-Horizon Institutional Systems (needed at scale, not at launch)

Biên Niên Sử Vô Tri (the Chronicle), the anniversary system, veteran
"here since" markers, and the community-evolution design principles
(Part 14 of the vision doc). These only make sense once enough legendary
moments exist to preserve — explicitly **not** MVP, revisited in Part 4's
later milestones.

### 1.7 Governing Principles (not buildable — constraints on everything above)

The North Star's six invariants (no solo experiences, losing well beats
winning quietly, nothing fully explained, never mocking, history never
decays, cluelessness stays a skill). Every module in Part 2 is checked
against these, not the other way around.

### 1.8 Critical Dependency Chains

The inventory's dependencies collapse into a few real chains worth
naming explicitly, since they determine sequencing in Part 4:

1. **Dilemma content → Vô Tri Đồng Thuận → Toà Án's trial content.** One
   authoring effort feeds two consumption surfaces.
2. **Real usage data → Gương Vô Tri.** The Mirror cannot exist honestly
   until there's real behavior to (accurately, per CLAUDE.md's
   no-fabrication rule) reflect.
3. **Court + Meme Battle + streaks → Vô Tri Tuần Này.** The weekly recap
   is an aggregation layer over other systems' outputs, not a standalone
   build.
4. **Content variety (Mystery Box, Meme Battle) → Giờ Vô Tri.** Gating
   nothing behind a time window is worse than no window at all.
5. **Enough legendary moments across everything above → Biên Niên Sử Vô
   Tri.** The Chronicle is late by construction, not by choice.
6. **Real moderation tooling → Vô Tri Tự Chế.** A hard blocker, not a
   sequencing preference.

---

## Part 2 — Product Architecture

Full breakdown for the five Signature Moments — the tier worth this
level of rigor. Supporting mechanics get a lighter pass; long-horizon
systems are intentionally left at the Part 1 dependency-note level until
their prerequisites are real.

### Lời Tiên Tri Không Xin (The Ambush)
- **User flow:** user is in any app state → a rare, randomly-timed
  trigger fires → a full-screen takeover renders one line → the
  overlay becomes unrecoverable after a short window (no "history" tab,
  ever) → returns to whatever the user was doing.
- **Screens:** one new app-wide overlay layer (mounts once in
  `AppShell`, same pattern as `Toaster`/`Dialog` today) — not a route.
- **Backend requirements:** a `prophecy_lines` catalog table (real
  authored content, same status as `activities.ts`); a per-user
  last-shown timestamp to enforce real rarity; a trigger mechanism —
  **open design question, not yet decided:** client-side probabilistic
  check on session heartbeat vs. a lightweight server-scheduled push.
  Either is viable; the choice affects whether "unschedulable" is
  provably random or merely rare-and-client-seeded.
- **Content requirements:** enough line variety to avoid noticeable
  repeats before real usage data exists to say how much is "enough" —
  recommend 100+ lines pre-launch, generic-but-personal in tone, never
  claiming a specific real fact about the user it can't actually know
  (the no-fabrication rule applies to this content exactly as it does
  everywhere else).
- **Analytics events:** `prophecy_shown`, `prophecy_shared`,
  `prophecy_dismissed_without_action`.
- **Success metrics:** not DAU — the share-rate relative to shown-count,
  and (qualitative, not a dashboard number) whether "Tiên Tri" starts
  showing up unprompted in real conversations.

### Toà Án Vô Tri (The Court)
- **User flow:** User A picks a friend + a dilemma → sends a trial
  invite → User B is notified → both answer independently and blind,
  within a window → once both have answered (or the window expires),
  the verdict renders for both.
- **Screens:** "Start a Trial" (pick friend + dilemma), "Answer a Trial"
  (blind-answer UI, no visibility into the other side), "Verdict"
  (shareable result card).
- **Backend requirements:** `court_dilemmas` catalog; `court_trials`
  (initiator, target, dilemma_id, status, created_at, expires_at);
  `court_answers` (trial_id, user_id, answer, answered_at). **A real
  MVP-simplification worth calling out now, not discovering under
  deadline pressure later:** true simultaneous reveal needs realtime
  infrastructure this project doesn't have. An async version — answer
  within a generous window (e.g. 24 hours), verdict renders once both
  sides are in, order doesn't matter — delivers the same joke with zero
  new infrastructure. See Part 3.
- **Content requirements:** the dilemma pool (shared with Vô Tri Đồng
  Thuận, per 1.3's merge) plus a verdict-line template generator
  ("Toà tuyên bố: [tên] chính thức vô tri hơn").
- **Analytics events:** `trial_started`, `trial_answered`,
  `trial_verdict_rendered`, `trial_shared`.
- **Success metrics:** trials-per-active-friend-pair (a real
  relationship-depth signal, not a vanity count) and verdict share rate.

### Gương Vô Tri (The Mirror)
- **User flow:** rarely, triggered by a real detected pattern (not a
  schedule), the user receives one deadpan, specific, true observation
  from the Mascot.
- **Screens:** none new — rides the existing notification/toast
  delivery surface with a distinct visual treatment.
- **Backend requirements:** **a genuine MVP-simplification finding, not
  just a cost-cutting compromise:** this does not need real AI/ML to
  work. A small rules engine over existing tables (e.g. "3+ check-ins
  between 1–4am this month" → the night-owl line) produces the exact
  same felt effect as a model would, with zero new infrastructure or
  recurring cost.
- **Content requirements:** a catalog mapping specific detectable
  patterns to specific line templates.
- **Analytics events:** `mirror_shown`, `mirror_shared`.
- **Success metrics:** share rate; qualitative "did this feel true"
  signal is more important here than any single number, and isn't
  something a dashboard can honestly answer alone.

### Giờ Vô Tri (Vô Tri Hour)
- **User flow:** at a fixed daily window, something exclusive unlocks
  (bonus Mystery Box odds, an exclusive Meme Battle round) that doesn't
  exist outside that window.
- **Screens:** none new — a conditional "unlocked now" state layered
  onto existing Home/Explore surfaces.
- **Backend requirements:** a simple server-time window check. No new
  infrastructure. The real requirement is upstream: something worth
  gating has to already exist (Mystery Box, Meme Battle) — this is
  glue, not a system of its own.
- **Content requirements:** whatever it gates must already have content
  variety, or the gate just makes an empty room feel more empty on a
  schedule.
- **Analytics events:** `hour_window_entered`, `hour_content_engaged`.
- **Success metrics:** session-start-time distribution shifting toward
  the window — a real appointment-behavior signal, distinct from a
  streak-driven login.

### Vô Tri Tuần Này (Weekly Recap)
- **User flow:** every Friday, an assembled card delivers the week's
  worst/funniest verdict, meme result, and streak status as one
  shareable, deliberately unflattering image.
- **Screens:** one new "weekly card" view/share screen.
- **Backend requirements:** a scheduled weekly aggregation job reading
  from `court_trials`, meme-battle results, and `xp_ledger`/streak data
  — depends entirely on those systems having real data first (see
  1.8's dependency chain #3).
- **Content requirements:** enough card-template/copy variety that the
  weekly ritual doesn't read as the same card with new numbers.
- **Analytics events:** `weekly_card_viewed`, `weekly_card_shared`.
- **Success metrics:** share rate, and whether Friday itself becomes a
  measurable bump in return-visit timing.

---

## Part 3 — MVP

**The test: if there were only one month to launch, what absolutely must
exist to feel unmistakably like VÔ TRI — not a generic gamified app with
a Vietnamese skin?**

The honest answer is smaller than the full vision, and smaller than
"one of everything." Two real constraints shaped it:

1. **The core loop is already built.** Activities, XP/Level, Quests,
   Milestones, Leaderboard, and basic Social exist today, unit-tested,
   security-reviewed, and are only blocked on live Supabase integration
   (`docs/INTEGRATION_CHECKLIST.md`) — not on new design or engineering
   work. A month-one launch's real cost is finishing that integration,
   not inventing new mechanics from scratch.
2. **Two of the five Signature Moments are structurally excluded by
   their own dependencies, not by priority.** The Mirror needs real
   behavioral history that doesn't exist on day one. The Weekly Recap
   needs Court verdicts and meme results that don't exist until other
   systems have run for at least a week. Excluding them from MVP isn't a
   corner cut — it's what Part 1.8's dependency chains already say.

### What ships in the MVP

- **The full existing core loop, connected live** — this is the bulk of
  the one-month effort, and it's integration work, not invention.
- **Toà Án Vô Tri, shipped async** — the MVP simplification named in
  Part 2: a generous answer window instead of true real-time
  synchronicity. This is the single highest-leverage signature moment
  (the owner's own read, and this document's), and the async version
  produces the same verdict, the same "để Toà xử" phrase, and the same
  screenshot-worthy reveal — without needing realtime infrastructure
  this project doesn't have and hasn't scoped.
- **Vô Tri Đồng Thuận** — the cheapest real content addition (reuses the
  existing daily-quest-rotation pattern exactly), and it's the source of
  the dilemma pool the Court needs anyway. Building it is not optional
  scope creep — it's a prerequisite the Court quietly depends on.

### What explicitly waits, and why

- **Lời Tiên Tri Không Xin** — genuinely no data dependency, could be
  MVP by that logic alone, but the open trigger-mechanism question in
  Part 2 needs a real engineering decision before it's buildable in a
  month with confidence. First candidate for the very next milestone,
  not a rejection.
- **Gương Vô Tri, Vô Tri Tuần Này** — excluded by dependency, not by
  priority (see above).
- **Everything in 1.3** waits — none of it is required for the product
  to feel like VÔ TRI on day one; all of it makes the *later* milestones
  richer once the signature moments are proven.
- **Everything in 1.5/1.6** (mythology, Chronicle) waits by
  construction — there has to be something worth mythologizing and
  chronicling before either can be real rather than theatrical.

---

## Part 4 — Release Plan

| Milestone | Objective | User value | Eng complexity | Design complexity | Content complexity | Risk | Dependencies |
|---|---|---|---|---|---|---|---|
| **0 — Production Integration** | Get the already-built core loop live | Everything currently honest-empty becomes real | Medium (already scoped: `INTEGRATION_CHECKLIST.md`, `MIGRATION_VALIDATION.md`) | None — already designed | None — catalogs already authored | Low, well-understood; the only known risk is this sandbox's network access, already documented | None — this is the actual current blocker |
| **1 — MVP** | Ship the smallest version that's unmistakably VÔ TRI | First real reason to open the app daily and with a friend | Medium (async Court + one poll mechanic) | Medium (two new flows, one new screen family) | Medium (dilemma-pool authoring, verdict-line templates) | Medium — the Court's async simplification must still *feel* good, or the signature feature underwhelms at first impression | Milestone 0 |
| **2 — Appointment & Surprise** | Add Giờ Vô Tri, Lời Tiên Tri Không Xin, Mystery Box, Meme Battle | Daily reason to return at a specific time; the product starts feeling alive, not just useful | Medium–High (trigger-mechanism decision for the Ambush; Mystery Box economy) | Medium | Medium–High (100+ prophecy lines, meme-battle seed content) | Medium — the Ambush's unpredictability is easy to build wrong (Part 2's own warning); needs real design discipline, not just a ship date | Milestone 1; dilemma pool already exists |
| **3 — Memory** | Add Gương Vô Tri, Vô Tri Tuần Này, first Chronicle version | The product starts remembering the user and the week, not just tracking them | Medium (rules engine for the Mirror, a scheduled weekly job) | Medium | Medium (Mirror line-to-pattern mapping) | Medium — the Mirror must never read as mocking; this is a copy-quality risk more than a technical one | Milestone 2 has generated enough real data |
| **4 — Mythology & Seasons** | Introduce Đấng Vô Tri fragments, Mùa Vô Tri, Xin Xăm Vô Tri at the first real Tết | The product feels like it has a past and a calendar of its own | Low–Medium (mostly content, uses the already-built `seasons` table) | Medium (fragment delivery needs restraint, not more surface area) | High (mythology writing is genuinely hard to do well — see the vision doc's own warning against ever fully resolving it) | Medium — the single highest risk here is over-explaining the mythology under pressure to "add more lore content" | Milestone 3; real Tết timing |
| **5 — Creator Economy & Institution** | Open Vô Tri Tự Chế; mature the Chronicle; support sub-cultural language variants | Users become authors, not just players; the product starts feeling like an institution with real history | High (moderation tooling is a real, non-trivial build) | Medium | Low (community now supplies most new content) | High — moderation is the one place a genuine safety/abuse risk exists; this milestone should not ship without it fully solved first | Milestone 4; real moderation tooling built |

Emotional impact is prioritized over feature count throughout: Milestone
1 ships two mechanics, not ten, because two done well produce the
target story ("my friend completely fooled me") that ten shallow ones
wouldn't.

---

## Part 5 — The Product Bible

*The section meant to be read on its own, re-read often, and treated as
the actual governing reference. Everything above supports these seven
answers; these seven answers do not depend on anything above staying
exactly as scoped.*

**What are we building?**
A Vietnamese entertainment/community product where small, quick,
absurd interactions between real friends turn into a shared language,
a shared history, and eventually a shared culture — not a collection of
mini-games, and not a metrics-optimized retention engine wearing a
funny voice.

**Why does it exist?**
Because being clueless, wrong, or ridiculous is treated everywhere else
as something to hide, and VÔ TRI treats it as something to celebrate —
and because almost nothing else gives friends a reason to laugh at
*themselves*, together, on purpose.

**What must never change?**
The six invariants from `VO_TRI_NORTH_STAR.md`: no experience requires
only one person; losing well outranks winning quietly; nothing is ever
fully explained; nobody is ever mocked by the product itself; history is
never deleted or algorithmically buried; being clueless stays a skill,
not a flaw, even once the product no longer needs to say so out loud.

**What can evolve?**
Every mechanic named in this document and in `VO_TRI_GAMEPLAY_VISION.md`
— the Court could become real-time, the Mirror could get smarter, the
Chronicle's format could change entirely. All of it is disposable in
service of the six invariants above; none of it is the actual product.

**What ships first?**
The already-built core loop, connected live, plus an async Toà Án Vô Tri
and Vô Tri Đồng Thuận — Part 3's MVP, chosen because it's the smallest
thing that produces a real "để Toà xử" moment between real friends in
month one, not because it's the cheapest thing to build.

**What ships later?**
Everything sequenced by real dependency in Part 1.8 and staged in Part
4's milestones — appointment and surprise mechanics next, memory and
recap once there's something to remember, mythology and seasons once
there's something worth mythologizing, and the creator economy last,
gated hard on moderation tooling that has to be real before that door
opens.

**What should probably never be built?**
Every item this vision explicitly rejected and never reversed: real-
money gacha or any payment-gated chance mechanic; forced "invite 3
friends" referral gates; a pure competitive leaderboard layer with no
humor or social layer attached; a passive "moments feed" that replays
other people's Ambush/Court/Mirror moments Instagram-story-style,
converting the product's actual differentiator (things happening to
*you*) into the thing every other feed already does; and — the newest
addition to this list — a lore explainer page that fully resolves the
mythology, which the vision doc already named as a failure mode, not a
feature request waiting to be prioritized.
