# VÔ TRI — Gameplay Vision & Ecosystem Roadmap

> Written wearing a different hat than every other doc in this repo. This
> is not architecture, not a spec an engineer implements literally — it's
> the creative/product direction for what VÔ TRI actually *is* once
> someone opens it. Grounded in what's already real (the activity/quest/
> milestone/badge/collection/reaction catalogs, the rank ladder, the
> Mascot, the tagline "Ở đây, vô tri là một kỹ năng.") — not a generic
> gamification checklist bolted onto an unrelated product.
>
> No code changes accompany this document. Nothing here is authorized
> for implementation yet — it's the thinking that should shape *which*
> future engineering work gets prioritized, per the roadmap at the end.

---

## Part 1 — Honest Product Audit: A Teenager's First Session

The brief demands imagining the fully-realized product, not today's
partially-wired one — but one real fact from today's actual state matters
enough to name upfront and then set aside: right now, in production,
every account-gated surface (Profile stats, quest progress, leaderboard
position, comment history) is an honest empty/logged-out state, because
the backend isn't connected yet. That's the correct engineering call
(CLAUDE.md's no-fabricated-data rule), but it means **today's actual live
product cannot pass this audit** — there is currently nothing to open,
laugh at, or return to beyond the first look at Home. Everything below
evaluates the product *as designed*, which is the honest target to build
toward once integration resumes.

### 0–10 seconds
A dark warm-plum screen, the mascot, the tagline: **"Ở đây, vô tri là một
kỹ năng."** ("Here, being clueless is a skill.") That line is doing a lot
of work — it's the single best asset the product has, because it
immediately tells a teenager *this isn't trying to make me productive*.
That's rare and valuable. The risk in the first 10 seconds: if the very
next thing they see is a login wall or a static hero with nothing
clickable, the promise of the tagline dies instantly. **The hero must put
something tappable in front of them before they've finished reading the
tagline** — today's Home does lead with a quick-access row into Explore,
which is the right instinct; the gap is that none of those first-tap
destinations currently *resolve* into a real, fast, no-signup mini-game
loop for a stranger. A first-time visitor should be able to play
something — badly, pointlessly, hilariously — inside those 10 seconds,
with zero forms.

### 1 minute
This is where "vô tri" either becomes a feeling or stays a slogan. One
minute is enough for exactly one full loop of a short activity (most of
the catalog is 1–3 minutes). The honest risk: the current catalog's
first-run activities (Điểm Danh, Vòng Quay, Rút Thẻ) are all *solo,
low-stakes, mildly funny* — fine, but nothing in that first minute gives
a teenager a *result they'd want to show someone*. That's the single
biggest gap this document exists to close: the first minute needs to end
with an artifact — a score, a verdict, a card, a meme — not just a number
going up.

### 5 minutes
By 5 minutes, a real product needs **variety without asking for
patience**. Right now the catalog has four categories (nhanh/may-mắn/thử
thách/giải trí) — genuinely good breadth on paper. The excitement should
appear the moment a visitor realizes *the next thing is a completely
different kind of dumb* (a reflex game, then a meme generator, then a
quiz) rather than five variations on the same mechanic. Boredom appears
if the loop is "tap → number goes up → tap again" with no surprise, no
social layer, and no reason to believe tomorrow will feel any different
from right now. This is where a stranger decides whether to make an
account at all — and the honest answer today is: nothing yet earns that
account creation. There's no moment that says *"you'll lose this if you
don't save it."**

### 1 day
The return trigger has to already exist by the time they close the tab:
a streak that's now "1", a quest that's "2/3 done", a mystery box that
refills at midnight, or — the strongest of these — **a friend did
something and it's waiting for them**. Today's retention system (quests,
streak) is built for this, but it's a *solo* retention loop. Nothing yet
gives a reason to open the app because of *another person*, which is the
single highest-leverage gap for Day 1→Day 2 return, ahead of any solo
mechanic.

### 1 week
This is where "unfinished, coming back tomorrow" needs to become
"this is part of my week now." The honest risk at one week: without new
content appearing (not just numbers accumulating), even a good loop goes
flat. A leaderboard alone doesn't do this — leaderboards retain the top
5%, and quietly demoralize everyone below rank 50. What retains at one
week is **a story accumulating** — a streak, a growing shelf of
ridiculous badges, an inside joke with friends, a running personality
score that keeps evolving. That's a design requirement, not a nice-to-
have: by day 7, the product needs to be building something that only
*this* user has, that they'd feel a real (small, funny) loss walking away
from.

### Where people would laugh (today's real assets, underused)
The Mascot's mood system, the tagline, `resultCopy`'s five distinct
win/lose/timeout voices, the "Vô Tri" reaction (a `Brain` icon for
"this broke my brain in the best way") — the brand voice is already
funny in isolation. The gap isn't tone, it's that laughter today is a
private, one-person experience. **The biggest single opportunity in this
whole audit: nothing in the current design lets a laugh travel to a
second person.** Every idea in Part 2 that matters most is one that turns
a private laugh into a shared one.

---

## Part 2 — The Gameplay Ecosystem

Everything below is designed around one identity: **VÔ TRI is the place
where being clueless, ridiculous, or wrong is celebrated, not hidden.**
That's the thread every activity has to pull on — a leaderboard for who
guessed correctly is generic; a leaderboard for who guessed *most
confidently wrong* is VÔ TRI.

### Pillar A — Verdict Games (quizzes, personality tests)

**"Bạn Vô Tri Đến Mức Nào?"** ("How Vô Tri Are You?")
A short, absurd personality quiz (8–10 questions, none of them serious)
that ends in a shareable **archetype card** — not a score, a *character*:
"Triết Gia Vô Tri" (The Vô Tri Philosopher), "Idol Hết Thời" (Washed-Up
Idol), "Chiến Binh Ngủ Nướng" (Snooze-Button Warrior). The result card is
the deliverable — a single, beautifully designed image with the
archetype, a one-line roast, and the VÔ TRI wordmark, built to be
screenshotted. This is the highest-leverage single idea in this document:
personality-quiz result cards are one of the only content formats that
reliably travels on their own in Vietnamese social feeds, and it needs
zero friends already using the app to work.

**"Đoán Xem AI Nghĩ Gì"** (Guess What the AI Was Asked)
An AI-generated absurd *answer* is shown first; the player guesses what
question could possibly have produced it. Reverse trivia — always
surprising because the prompt rotates daily, never runs out of content,
and every wrong guess is funnier than a right one.

### Pillar B — Reaction & Reflex Games

Already-live territory (Thử Thách 60 Giây) — the expansion is variety of
*feeling*, not just variety of mechanic:

**"Đừng Cười"** (Don't Laugh)
Shown a rotating meme/short clip, the player self-reports "Tôi nhịn
được" / "Tôi thua rồi" — honor system, no camera needed. Tracks a
"longest nhịn-cười streak," which is exactly the kind of oddly specific
personal record people screenshot.

### Pillar C — Meme Games

**"Đấu Trường Meme"** (Meme Arena)
Two community-made memes (from the existing Máy Chế Meme) face off;
players tap the funnier one, Tinder-style. Winners climb a **weekly meme
leaderboard**; the creator of the week's top meme gets a real badge and a
feed callout. This is a content flywheel: users generate memes → memes
compete → winners get visible social credit → the *creators* have a
reason to return that has nothing to do with their own XP bar.

### Pillar D — Party & Friend Games

**"Thách Đấu Vô Tri"** (Vô Tri Dares)
Send a specific friend a tiny, silly dare (a pre-written prompt from a
curated deck, e.g. "gửi lại đúng emoji tâm trạng hiện tại của bạn trong 5
giây") — they get a notification, complete it, both sides get a shared
result. This is the single mechanic that most directly answers "why
would they send this to a friend": the loop *requires* a second person
by design, not as an optional add-on.

**"Chuỗi Chữ Vô Tri"** (The Vô Tri Word Chain)
A collaborative, async running sentence the whole community adds one word
to per day; the funniest submitted continuation each day gets voted in
and permanently credited to that user in a public "hall of authors." A
slow-burn, always-evolving piece of shared culture — the kind of thing a
community point to and say "we made this."

### Pillar E — Social Experiments

**"Vô Tri Đồng Thuận"** (Vô Tri Consensus)
A daily two-option absurd poll ("Ăn phở sáng vs ăn phở nửa đêm"). After
voting, see the community split — and specifically, see **how your
friends voted**, not just a global percentage. The friends-comparison is
what turns a poll from a stat into a conversation starter.

**"Chọn Đi, Đừng Nghĩ"** (Just Pick One, Don't Think)
Rapid-fire impossible-choice cards, no right answer — purely to produce
a "% of people agree with you" result worth arguing about in a group
chat.

### Pillar F — Daily Chaos & Living-Product Moments

**Ngày Vô Tri Đặc Biệt** (a Special Vô Tri Day)
A rare, randomly-triggered day where the whole app's copy/tone shifts —
buttons say something sarcastic-opposite, the Mascot's default mood
changes, a rare-only mystery box drop rate spikes. Not a permanent
feature, an occasional surprise that makes the app feel like it's alive
and has moods of its own, not just a static shell around a database.

### Pillar G — Collaborative & Seasonal Events

**Sự Kiện Cộng Đồng** (Community Goal Events)
A single shared progress bar the whole userbase fills together (e.g.
"100,000 lượt điểm danh tuần này mở khoá skin mới cho tất cả mọi
người") — everyone's individual, mundane daily action (a check-in) also
contributes to something bigger than themselves. Co-op unlocks are one of
the few mechanics that make a solo action feel like it mattered to a
crowd.

**Mùa Vô Tri** (Vô Tri Seasons)
Themed month-long events (Tết Vô Tri, a rainy-season event, a graduation-
season event) with limited-time activities, cosmetics, and a leaderboard
reset — this needs zero new backend schema; `seasons` already exists in
the database and has never been used (§10 of `BACKEND_ARCHITECTURE.md`
flagged it as deliberately empty pending a real season). This is the
first real season to put in it.

### Pillar H — Mystery & Rare Discovery

**Hộp Bí Ẩn Vô Tri** (Vô Tri Mystery Box)
Earned (never purchased) through play — opens into a cosmetic, a rare
badge, or a bonus-points surprise. Ethical line drawn deliberately here:
**no real-money purchase path for boxes, ever** — this is a design
constraint, not a missed monetization opportunity, because a chance
mechanic tied to real spending is a different product with different
regulatory and ethical stakes than a free reward-variability mechanic.
That distinction is a product/business decision for the owner if it's
ever reconsidered, not something to design around quietly.

### Pillar I — Creator Challenges

**Vô Tri Tự Chế** (User-Submitted Content)
The best community-submitted trivia question or meme prompt each week
gets voted into the *real* rotation — turning players into the actual
authors of future content. The strongest retention mechanic in this
entire document for the specific subset of highly-engaged users, because
their contribution *becomes* the product for everyone else.

---

## Part 3 — The Connective Tissue (nothing isolated)

Every idea above plugs into systems that already exist — this section is
the literal wiring, not a suggestion to build new plumbing.

| New idea | XP/Points | Quests | Milestones | Badges | Collection | Leaderboard | Social/Friends |
|---|---|---|---|---|---|---|---|
| Bạn Vô Tri Đến Mức Nào? | ✓ one-time completion reward | new daily quest: "Làm bài trắc nghiệm hôm nay" | — | new: "Đã Tìm Ra Chính Mình" | new title unlocked matching your archetype | — | share card is the viral surface |
| Đấu Trường Meme | ✓ per vote + bonus for winning meme | new: "Chấm 5 trận đấu meme hôm nay" | new metric: `memesWon` | new: "Vua Đấu Meme" (10 wins) | — | new scope: weekly meme leaderboard (existing `ScopeFilter` architecture) | creator gets a feed callout |
| Thách Đấu Vô Tri | ✓ both sides on completion | new: "Thách đấu 1 người bạn hôm nay" | new metric: `daresSent`/`daresCompleted` | new: "Người Gieo Rắc Vô Tri" | — | — | the core mechanic *is* the friend interaction |
| Chuỗi Chữ Vô Tri | ✓ small reward per contribution, bonus if voted in | — | new metric: `wordsContributed` | new: "Tác Giả Vô Tri" (voted in 5×) | a public "hall of authors" list (identity, not inventory) | — | canon sentence is shared community state |
| Vô Tri Đồng Thuận | ✓ small daily reward | folds into existing daily-quest slot rotation | — | — | — | — | friends-vs-you comparison view |
| Sự Kiện Cộng Đồng | contributes to a shared bar, not personal XP | — | — | new: participation badge per event | new: event-exclusive cosmetic | — | shared collective narrative |
| Mùa Vô Tri | seasonal reward multiplier | seasonal quest set | — | seasonal badges | seasonal-exclusive items | already-existing `season` leaderboard scope | seasonal feed events |
| Hộp Bí Ẩn | consumes/awards points | quest reward delivery mechanism (a quest reward *is* a box) | — | rare badges as box contents | most collection items enter via boxes | — | — |
| Vô Tri Tự Chế | ✓ reward for a winning submission | — | new metric: `submissionsAccepted` | new: "Người Sáng Tạo Vô Tri" | — | — | submitter is publicly credited |

No new top-level system is required — every idea is a new *catalog entry*
or a new *quest/milestone metric* inside the architecture that already
exists (`activities.ts`, `quests.ts`, `milestones.ts`, `badges.ts`,
`collection.ts`, the existing `ScopeFilter`). That's a deliberate finding,
not a coincidence: the backend foundation was built generically enough
that "invent more gameplay" is a content problem now, not an
architecture problem.

---

## Part 4 — Surprise & Delight

- **Mascot easter eggs.** Tap the Mascot 10 times in a row, or open the
  app at an oddly specific hour (03:33) → a secret mood/animation nothing
  documents, discovered only by accident and shared as a "did you know."
- **Funny failure, never generic failure.** `resultCopy`'s five distinct
  tones already exist for this — the ambition should be that losing a
  reflex game and losing a trivia question *feel* like different jokes,
  never the same "Chưa thắng lần này" twice in a row for the same
  Activity.
- **Rare-drop cosmetics.** A "Vô Tri Ngàn Năm Có Một" (One-in-a-Thousand)
  ultra-rare mystery-box cosmetic that exists purely for bragging rights
  — no gameplay advantage, purely a "I have the thing almost nobody has."
- **Secret achievements nothing hints at.** Play at 3am, react with every
  reaction kind on the same post, lose 5 games in a row without quitting
  — small, funny, never punishing, discovered instead of instructed.

---

## Part 5 — Virality (earned, not forced)

Explicitly **not** designing: "invite 3 friends for a reward" referral
prompts, share-gated unlocks, or anything that makes sharing a toll gate
rather than a choice. Every share hook below works because the *shared
thing itself* is the reward:

1. **The archetype result card** (Bạn Vô Tri Đến Mức Nào?) — a genuinely
   good, funny, personal artifact. This is the strongest single lever in
   the whole ecosystem for pure organic reach, because it works on a
   stranger's feed with zero context needed.
2. **The dare** (Thách Đấu Vô Tri) — inherently requires a second person,
   built into the mechanic rather than bolted onto it.
3. **The contested poll result** (Chọn Đi, Đừng Nghĩ / Vô Tri Đồng
   Thuận) — "48% of people picked X, I picked Y, prove me wrong" is a
   screenshot people take *for themselves*, not because the app asked.
4. **The winning meme / winning word-chain sentence** — public credit is
   its own incentive to share "look, that's mine."

---

## Part 6 — Emotion Before Metrics

| Emotion | Primary mechanic |
|---|---|
| Laughter | Đấu Trường Meme, Đừng Cười, funny failure copy |
| Curiosity | Đoán Xem AI Nghĩ Gì, Hộp Bí Ẩn, secret achievements |
| Surprise | Ngày Vô Tri Đặc Biệt, rare mystery-box drops, mascot easter eggs |
| Friendship | Thách Đấu Vô Tri, friends-vs-you poll comparisons |
| Nostalgia | Chuỗi Chữ Vô Tri's growing "hall of authors," seasonal events tied to real calendar moments (Tết) |
| Embarrassment (the fun kind) | Bạn Vô Tri Đến Mức Nào?'s roast-style archetype results, Chọn Đi Đừng Nghĩ's "you're the minority" reveal |
| Celebration | Sự Kiện Cộng Đồng's shared unlock moment, level-up/milestone banners already built |
| Storytelling | The evolving personal badge shelf, the archetype identity, the word-chain's permanent "hall of authors" |

DAU and D1/D7 retention are the expected *consequence* of the table
above working, not a target anything here was reverse-engineered from —
consistent with the brief's own instruction and worth stating plainly so
future prioritization doesn't quietly re-invert it.

---

## Part 7 — Prioritized Roadmap

Effort: **S** (days) / **M** (~1–2 weeks) / **L** (~a month) / **XL**
(new infrastructure, multi-month). Impact is stated as *which emotions
and which retention mechanism it actually serves* — not a DAU guess.

### Must Build
| Idea | Effort | Impact |
|---|---|---|
| Bạn Vô Tri Đến Mức Nào? (personality quiz + shareable archetype card) | M | Highest organic-reach lever in the whole vision; only needs one great result-card design, no dependency on friends already using the app. |
| Vô Tri Đồng Thuận (daily poll + friends comparison) | S–M | Cheapest possible daily-return hook; reuses the existing daily-quest-rotation pattern exactly. |
| Đấu Trường Meme (meme battle + weekly leaderboard) | M | Turns existing meme-generator content into a flywheel; first real use of the existing weekly leaderboard scope. |
| Hộp Bí Ẩn (earned mystery box) | M | Converts every existing reward moment into a variable-reward dopamine loop, no new economy needed — box contents *are* existing badges/collection items. |
| Thách Đấu Vô Tri (friend dares) | M–L | The single mechanic that structurally requires a second person — most direct answer to "why send this to a friend." |

### Should Build
| Idea | Effort | Impact |
|---|---|---|
| Mùa Vô Tri (first real season) | M | Fills an already-built, already-empty `seasons` table with a real event — pure content work on existing schema. |
| Sự Kiện Cộng Đồng (community goal event) | L | Strong once-a-quarter celebration moment; needs a one-off admin-triggered progress bar, not a permanent system. |
| Chuỗi Chữ Vô Tri (word chain) | M | Slow-burn identity/nostalgia mechanic; low engineering cost (one sentence, one vote/day), high emotional ceiling over months. |
| Đừng Cười (reaction/self-report streak game) | S | Cheap addition to the existing reaction-game family; low risk, moderate delight. |

### Nice to Have
| Idea | Effort | Impact |
|---|---|---|
| Đoán Xem AI Nghĩ Gì (reverse-trivia via AI) | M–L | Genuinely novel content, but needs a real AI API integration — a real recurring cost per CLAUDE.md's cost-discipline rule, so it should wait until there's traffic to justify it. |
| Mascot easter eggs / secret achievements | S | Low cost, real delight, but purely additive polish — do this opportunistically alongside other work, not as its own milestone. |
| Vô Tri Archetype (an evolving personality profile from play patterns) | L | Deepens identity meaningfully, but depends on enough real play-history data existing first — sequence after the Must-Build items generate that data. |

### Crazy Ideas (high creative ceiling, real risk — flagged honestly)
| Idea | Effort | Why it's crazy, not roadmapped |
|---|---|---|
| Live synchronous 2-player party games | XL | Needs realtime infrastructure (websockets/matchmaking) this project doesn't have and hasn't scoped — exactly the kind of new architecture the current stop condition says not to add speculatively. Worth a real feasibility pass only after the core async ecosystem is live and clearly working. |
| Vô Tri Tự Chế (open user-submitted content into real rotation) | L–XL | The strongest long-term creator-economy idea here, but needs real moderation tooling (nothing here is a plan for handling spam/abuse submissions) before it's safe to open publicly. |
| Vô Tri Giả Vờ (harmless in-app prank moments) | M | Genuinely funny in concept, but real risk of feeling manipulative if a "your progress is threatened" joke isn't airtight-obviously reversible within 1–2 seconds. If ever built: opt-in, seasonal-only, never touching real economy state even as a visual illusion beyond a couple seconds. |

### Explicitly rejected (challenged and killed, not just unlisted)
- **Real-money mystery boxes / any gacha-with-payment mechanic.** Rejected
  outright, not deferred — a chance mechanic tied to real spending is a
  different product with different ethical and regulatory stakes than a
  free-to-earn reward-variability loop, and isn't this document's call to
  make quietly.
- **"Invite 3 friends" forced-referral gates.** Explicitly what the brief
  asked to avoid; every virality mechanic above works because the shared
  artifact is desirable on its own, not because sharing is a toll gate.
- **A pure points-leaderboard-only competitive layer with no humor/social
  attached.** Technically the cheapest idea to build, and exactly the
  "technically impressive, emotionally empty" trap the brief warned
  against — a leaderboard alone retains the top 5% and quietly
  demoralizes everyone else; every leaderboard use above is paired with
  a lighter, funnier, non-zero-sum companion mechanic (meme battles,
  weekly resets, seasonal scopes) instead of standing alone.

---

## Closing note

The Must-Build column is deliberately short and deliberately buildable
without new backend architecture — every one of those five ideas is a
new catalog entry, a new quest/milestone metric, or a new client-side
result-card, wired through systems that already exist end to end. That
was itself a design constraint on this document: the highest-leverage
version of "make people smile, return, and share" turned out to need
content and product judgment far more than it needed new engineering —
which is exactly the kind of finding a Creative Director's audit should
surface, and an engineer's architecture review usually can't.
