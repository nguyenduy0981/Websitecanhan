# VÔ TRI — Gameplay Vision: From Games to Moments

> **Revision note:** the first version of this document asked "what games
> should VÔ TRI have?" and answered with a catalog of nine game concepts.
> That was real, useful thinking — but the owner correctly challenged it:
> products are remembered for moments, not for how many games they ship.
> This revision keeps Part 1's audit (still accurate) and supersedes
> everything after it with a moments-first vision. The old game catalog
> survives here only as *supporting content that feeds five signature
> moments* — not as the product's identity.
>
> Still a creative/product document, not an engineering spec. No code
> changes accompany it.

---

## Part 1 — Honest Product Audit: A Teenager's First Session

*(Unchanged from the prior revision — still the accurate starting
point.)*

Right now, in production, every account-gated surface is an honest
empty/logged-out state because the backend isn't connected yet — the
correct engineering call, but it means today's actual live product has
nothing to open, laugh at, or return to beyond the first look at Home.
Everything below evaluates the product as designed.

- **0–10s:** the tagline ("Ở đây, vô tri là một kỹ năng.") is the best
  asset the product has — it promises permission to be clueless. That
  promise dies if the first thing after it is a login wall.
- **1 min:** the first activity needs to *end with an artifact* — a
  score, a verdict, a card — not just a number going up.
- **5 min:** excitement needs variety of *feeling*, not just mechanic.
  Boredom appears the moment the loop is "tap → number goes up → tap
  again" with no social layer.
- **1 day:** the strongest return trigger is another person having done
  something, not a solo streak.
- **1 week:** what retains at one week is a story accumulating — a
  streak, an inside joke, an evolving identity — not a number.
- **The single biggest gap:** nothing in the current design lets a laugh
  travel to a second person. Every idea below exists to close that gap.

---

## Part 2 — The Shift: From "What Games?" to "What Moments?"

A game is something you play. A moment is something that *happens to
you* — often with someone else in the room, or in the group chat a
minute later. Games can be copied screen-for-screen. Moments can't,
because a moment is made of timing, surprise, and the specific people it
happened to.

The test for everything below: **could this exact scene be described in
one sentence, three months from now, by someone who wasn't there, and
still land?** "I played a quiz game" fails that test. "My friend
completely fooled me and I didn't figure it out until the verdict came
back" passes it.

---

## Part 3 — Signature Moments

Six scenes. Each one is written as it would actually happen, not as a
feature description, because the *shape of the scene* is the design.

### Moment 1 — The Ambush
You're mid-scroll, phone already in your hand for some unrelated reason.
Without warning — no button pressed, no schedule you could have checked
— the whole screen changes. One sentence, full-bleed, in the Mascot's
voice: *"Hôm nay bạn sẽ làm rơi đồ ăn ít nhất một lần."* No explanation.
No "okay" button that feels safe to tap slowly — if you don't screenshot
it in the next few seconds, it's gone, and there is no history tab where
you can go back and find it later. You laugh, you fumble for the
screenshot button, and half the time you're too slow and it's already
gone — which somehow makes it *funnier* to tell someone about, not less.

### Moment 2 — The Court
Two friends are already mid-argument about something dumb over text —
whether pineapple belongs on pizza, whether their friend group's
group-chat menace actually apologized last week, anything. One of them
sends the other a single link: **"để toà xử"** ("let the court decide").
Both phones buzz at the same instant with the exact same absurd
dilemma. Both answer blind, with no idea what the other picked, in a
30-second window that closes for both of them at once. Then, together,
in real time, the verdict renders: one name, one ridiculous sentence —
*"Toà tuyên bố: [tên] chính thức vô tri hơn."* One of them is now
"guilty," in front of the other, permanently, until the next trial. The
losing side always screenshots it — not because they're proud, because
mock-outrage needs evidence.

### Moment 3 — The Mirror
Nobody asked for feedback. The app volunteers it anyway, rarely, and
only when it's actually true: *"Bạn đã điểm danh lúc 2 giờ sáng 5 lần
tháng này. Ổn không đó?"* It's not a canned personality result — it's a
specific, correct observation about a real pattern, delivered deadpan by
the Mascot. The reason this lands where a generic "you're the Night Owl
type!" wouldn't: it's *true*, it's *about you specifically*, and it's
just embarrassing enough that the first instinct is to show someone
before they can accuse you of making it up.

### Moment 4 — The Contagion
A dare arrives from a specific friend, not the app: *"gửi lại đúng emoji
tâm trạng hiện tại của bạn trong 5 giây."* Five seconds is not enough
time to perform a mood — it's enough time to be honest by accident. The
reply lands in a shared thread both of you can see. It's rarely what
either person expected, which is exactly why the next thing that happens
is one of you daring a third friend, unprompted, because the moment was
good enough to want to watch happen to someone else too.

### Moment 5 — The Verdict Nobody Can Fake
Two community-submitted memes go head to head, blind, no names attached
until after the vote. A creator watches their own meme lose to something
dumber than it in real time, in public, on a leaderboard everyone can
see — and somehow the losing creator posts the loss to their own story
before the winner does, because losing publicly and *well* is its own
kind of currency inside a culture built around celebrating being
clueless rather than hiding it.

### Moment 6 — The Thing You Can't Screenshot Your Way Out Of
Once a week, everyone who played gets one card, addressed to them by
name, summarizing the single dumbest, most embarrassing, most
specifically-them thing that happened to them that week — the losing
verdict, the meme that flopped, the 2am check-in streak — assembled by
the app into one shareable image. Unlike a highlight reel, this is
deliberately a **lowlight reel**: it only works because it's honest about
the ridiculous, not curated to look good. That inversion — a weekly recap
that celebrates your worst moment instead of your best — is the kind of
thing Instagram/TikTok/Facebook culture structurally can't produce,
because their whole recap grammar (Spotify Wrapped, Instagram Best Nine)
is built to flatter, and this one is built to roast.

---

## Part 4 — Emotional Loops (before any mechanic)

**The Ambush**
Idle boredom → sudden interruption → confusion ("wait, what") →
delighted absurdity → urgency (screenshot before it vanishes) → mild
pride or mild regret depending on whether you were fast enough → sharing
to a group chat → friends compare their own prophecies → becomes a daily
"did you get yours yet" check-in with people, not with the app.

**The Court**
An existing real disagreement → escalation as a joke, not a real fight →
anticipation during the blind-answer window → synchronized reveal
tension → laughter or mock-outrage at the verdict → screenshot as
"evidence" → posting to the thread that started it → the phrase "để toà
xử" gets reused unprompted the next time two friends disagree about
anything, in or out of the app.

**The Mirror**
Curiosity (what would it even say) → surprise (how did it know that) →
a flash of real embarrassment → laughter that undercuts the
embarrassment → an immediate need to show someone, framed as "you won't
believe what it just said to me" → friends demand their own → a round of
mutual, voluntary self-exposure that reads as bonding, not shame.

**The Contagion (dares)**
A private ping → a five-second panic to respond honestly rather than
performatively → relief/laughter when the reply lands → the two-person
moment becomes a three-person moment by choice, not by prompt.

**The Weekly Lowlight**
Mild dread (what did I do this week) → recognition and laughter at
seeing it named plainly → the specific relief of "at least everyone gets
one of these, I'm not the only clown" → sharing it precisely *because*
it's unflattering, which is a stranger and stickier motivation than
sharing something that makes you look good.

---

## Part 5 — Rituals (traditions, not streaks)

**Giờ Vô Tri (Vô Tri Hour) — daily**
A specific recurring time window (evening, when the day's over and
scrolling starts) where something exists that literally cannot happen
outside that window — a Court session slot fills, a rarer Prophecy
chance appears, a meme-battle round opens. Not "come back every day for
a streak number" — "come back at 9pm because that's when the thing
happens," the same way a real ritual has a *time*, not just a frequency.

**Vô Tri Tuần Này (This Week in Vô Tri) — weekly**
Every Friday, the Weekly Lowlight card (Moment 6) delivers, alongside
the week's most-screenshotted Court verdict and the meme-battle winner.
A single appointment, once a week, that people learn to expect the way
they expect a Friday.

**Xin Xăm Vô Tri (Vô Tri Fortune-Drawing) — seasonal, Tết**
Vietnamese Tết already has a real, lived tradition of *xin xăm* —
drawing a fortune stick at a temple to learn what the year holds. This is
the Ambush mechanic (Moment 1), but seasonally dressed in that real
cultural shape instead of invented from nothing: once a year, at Tết,
everyone gets one real "xăm" — absurd, VÔ TRI-voiced, but riffing
authentically on something the audience already has a felt relationship
with, rather than a generic "New Year event" reskin.

---

## Part 6 — Stories People Would Actually Tell

The test for every mechanic above is whether it produces one of these
sentences, unprompted, days later:

- *"Hôm qua bạn tao lừa tao sml, tao trả lời xong mới biết là toà xử tao
  thua."* (Yesterday my friend completely fooled me — I only found out
  I'd lost after the court's verdict.)
- *"Con app đó đoán trúng phóc luôn, tao không hiểu sao nó biết."* (That
  app guessed it exactly right, I don't get how it knew.)
- *"Cả nhóm tao cười muốn xỉu vì một cái thử thách 5 giây."* (My whole
  group nearly died laughing over a five-second dare.)
- *"Tao chưa kịp chụp màn hình thì nó biến mất, giờ không ai tin tao."*
  (I didn't screenshot it in time before it vanished, now nobody
  believes me.)
- *"Thứ Sáu này coi cái thẻ tuần của tao đi, nhục vãi."* (Check out my
  weekly card this Friday, it's so embarrassing.)

If a proposed feature can't produce a sentence in this shape, it doesn't
belong in the signature set — it belongs, at best, in the supporting
ecosystem in Part 8.

---

## Part 7 — The Five Signature Features

Chosen because removing any one of them would cost VÔ TRI a piece of its
actual identity — not because they're the most technically interesting.

1. **Lời Tiên Tri Không Xin** (The Uninvited Prophecy) — unschedulable,
   ephemeral, personal. The one mechanic that makes the product feel
   *alive* rather than *operated*.
2. **Toà Án Vô Tri** (The Vô Tri Court) — synchronous, friend-specific,
   verdict-based. The one mechanic that turns an existing real
   friendship into in-app content, rather than the reverse.
3. **Gương Vô Tri** (The Vô Tri Mirror) — true, specific, rare,
   embarrassing-in-a-good-way. The one mechanic that makes identity feel
   *observed* rather than *chosen from a list*.
4. **Giờ Vô Tri** (Vô Tri Hour) — a fixed daily appointment with content
   that only exists in that window. The one mechanic that creates real
   anticipation instead of streak anxiety.
5. **Vô Tri Tuần Này** (This Week in Vô Tri) — the weekly lowlight
   ritual. The one mechanic that gives the whole week a shape and an
   ending, and reframes "recap" as celebration of the ridiculous instead
   of the impressive.

Everything else — meme battles, quizzes, dares, mystery boxes, seasonal
events — is legitimate, valuable, and stays in the roadmap, but now
explicitly as **raw material that feeds these five**, not as a parallel
identity. A meme battle matters because its winner shows up in the
Weekly Lowlight card. A dare matters because it's the delivery mechanism
for a Contagion moment. Content, not destinations.

---

## Part 8 — Supporting Ecosystem (feeds the signature moments, isn't one)

Everything from the prior revision's game catalog still has a job — just
a supporting one:

| Supporting idea | Feeds which signature moment |
|---|---|
| Đấu Trường Meme (meme battles) | Supplies the weekly winner shown in Vô Tri Tuần Này; supplies loss content for Moment 5. |
| Thách Đấu Vô Tri (dares) | *Is* the delivery mechanism for The Contagion. |
| Bạn Vô Tri Đến Mức Nào? (archetype quiz) | Feeds Gương Vô Tri's vocabulary — an archetype title is exactly the kind of thing the Mirror can reference back later ("Đúng chất Triết Gia Vô Tri đấy"). |
| Vô Tri Đồng Thuận / Chọn Đi Đừng Nghĩ | Supplies dilemma content for Toà Án's blind-answer trials. |
| Chuỗi Chữ Vô Tri (word chain) | A slower-burn identity mechanic, kept as-is; its "hall of authors" is itself a small, ongoing Mirror. |
| Hộp Bí Ẩn (mystery box) | Reward delivery for Giờ Vô Tri's appointment window. |
| Sự Kiện Cộng Đồng / Mùa Vô Tri | The seasonal frame Xin Xăm Vô Tri lives inside. |
| Vô Tri Tự Chế (creator submissions) | Long-term content pipeline for all of the above; unchanged from prior revision, still gated on real moderation tooling before opening publicly. |

None of this needs new backend architecture, matching the prior
revision's finding — the shift here is purely about which layer is the
*product's identity* and which layer is *content underneath it*.

---

## Part 9 — Revised Roadmap

Effort/impact scale unchanged from the prior revision (S/M/L/XL effort;
impact stated as emotional/retention mechanism, not a DAU guess).

### Must Build (the five signature features)
| Idea | Effort | Impact |
|---|---|---|
| Lời Tiên Tri Không Xin | M | Makes the product feel alive and unpredictable — the asset that most directly produces "you won't believe what just happened" stories. |
| Toà Án Vô Tri | M–L | Turns real existing friendships into in-app content; highest-leverage mechanic for organic, unforced virality since it requires a second real person by construction. |
| Gương Vô Tri | M | Needs enough real behavioral data to say something true — sequence right after the other two generate that data. Depends on genuine, careful copywriting discipline: it must never read as mocking (CLAUDE.md's own brand rule) — always affectionate roast, never insult. |
| Giờ Vô Tri | S–M | Cheap to build (a time-gated content slot), high leverage for daily appointment behavior. |
| Vô Tri Tuần Này | M | Reuses existing data (streaks, verdicts, meme results) into one weekly artifact — mostly a content-assembly job, not new mechanics. |

### Should Build (supporting content, feeds the five above)
Đấu Trường Meme, Thách Đấu Vô Tri (as standalone-feeling, not just
Contagion plumbing), Bạn Vô Tri Đến Mức Nào?, Hộp Bí Ẩn.

### Nice to Have
Vô Tri Đồng Thuận / Chọn Đi Đừng Nghĩ (as dilemma-content suppliers for
the Court rather than standalone features), Chuỗi Chữ Vô Tri, Đừng Cười.

### Crazy Ideas
Xin Xăm Vô Tri done exceptionally well (needs real Tết-timing
discipline, not just a reskin), a live-synchronous Court experience with
real-time presence (needs realtime infra — same XL flag as before),
Vô Tri Tự Chế opened publicly (needs real moderation tooling first).

### Rejected, again, explicitly
Everything the prior revision rejected stays rejected (real-money gacha,
forced-referral gates, a leaderboard-only layer with no humor attached)
— and one new rejection specific to this revision: **a "moments feed"
that just replays other people's Ambush/Court/Mirror moments passively,
Instagram-story-style.** Tempting, technically easy, and exactly wrong —
it turns a moment that happened *to you* into content consumed *about
someone else*, which converts the product's actual differentiator
(things happening to you personally) into the thing every other feed
already does.

---

## Final Challenge

**If another company copied every screen of VÔ TRI tomorrow, what would
still be impossible for them to copy?**

Being honest about what's *weak* here first: the visual design, the
individual mechanics, even the brand voice — all copyable, in principle,
by a well-resourced team willing to try. If the answer stopped there, it
would be "nothing," and the brief is right that the vision would need
more work.

It doesn't stop there, because of what the five signature features
actually depend on to work at all:

- **Toà Án Vô Tri requires your actual friends to already be in the
  app.** A clone launched tomorrow has a perfect copy of the Court
  screen and zero of your real friend group inside it — the mechanic is
  inert without the specific people it's built for, and re-recruiting an
  entire friend group to a second app is a cold-start problem no amount
  of pixel-copying solves.
- **The accumulated history is the actual product, and a clone starts at
  zero no matter how good the copy is.** By the time this vision is
  real, VÔ TRI will have a specific archive: the specific verdicts
  already rendered between specific friends, the specific "để toà xử"
  in-joke already alive in specific group chats, the specific Weekly
  Lowlight cards people have already laughed at. None of that is a
  screen. All of it is a relationship between real people and a shared
  history, and a competitor's launch day has none of it.
- **The Ambush's unpredictability is a discipline a rushed clone will
  almost certainly get wrong.** It's trivial to describe ("send a random
  message sometimes") and unusually easy to implement badly — a
  competitor racing to ship a copy will very likely make it a scheduled,
  predictable notification, which quietly kills the exact thing that
  makes it work. The FOMO is real only because the unpredictability is
  real; a "prophecy" you can check on demand isn't a prophecy.
- **Xin Xăm Vô Tri only works with genuine cultural fluency, not a
  reskin.** A team that doesn't understand why *xin xăm* resonates at
  Tết will ship a "New Year event" that feels hollow, because they'll
  have copied the shape of the ritual without the reason it matters to
  the audience.

So the honest answer is not a feature — it's **the specific social
history a real friend group builds up inside the product over time,
which by definition cannot exist on day one of a copy.** That's not a
loophole in this exercise, it's the actual design implication: it means
the roadmap's real job is to get real friend groups making real history
inside VÔ TRI as early and as often as possible (Toà Án and The
Contagion above all else) — because that history, not any single
screen, is the moat.
