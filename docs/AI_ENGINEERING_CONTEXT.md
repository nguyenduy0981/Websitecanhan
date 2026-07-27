# VÔ TRI — AI Engineering Context (canonical onboarding document)

> **Read this file first, before anything else, before writing any code.**
> This is the single entry point for any new AI assistant (or human
> engineer) picking up this repository cold. Everything else in `docs/`
> is detail you pull in only when this file points you to it.
>
> **Last updated:** 2026-07-27, after adding §8's formal AI Onboarding
> Protocol + Pre-flight Checklist. The stop condition (§5) is unchanged
> from 2026-07-26: real credentials exist, this environment still
> cannot reach the live Supabase project.

---

## 1. Project Overview

**VÔ TRI** is a Vietnamese entertainment/community product — not a
business dashboard, not a landing page. Users open it to relax, laugh,
do silly things, collect achievements, and meet interesting people.
Brand voice: **hài hước, thông minh, châm biếm nhẹ** (playful, clever,
lightly satirical) — never toxic, never mocking the user, never a
generic "AI SaaS template."

**Product vision:** a game-ified social space with a real reward economy
(points/XP/levels/streaks), daily quests and milestones, a leaderboard,
and a social layer (reactions/comments/follows/activity feed) — all
wrapped around small, quick "activities" (mini-games/interactions) a
user plays throughout the day.

**Current development stage:** frontend is 100% built and shipped.
Backend is 100% designed, built, unit-tested, and security-reviewed —
but **not yet connected to a live Supabase project**. Real credentials
for a live Supabase project exist (in `.env.local`, gitignored) but this
working environment cannot reach Supabase over the network (§5) —
production integration is the very next milestone, blocked on that.

**High-level architecture:**
- Next.js 15 (App Router) + TypeScript strict + Tailwind CSS.
- All VÔ TRI-specific frontend code lives under `src/vo-tri/` (design
  tokens, motion, copy, `ui/` primitives, one folder per feature domain),
  consumed by `src/app/*` routes.
- Backend: Supabase (Postgres + Auth + Storage), reached exclusively
  through a 3-layer server stack — `repositories/` (thin Supabase query
  wrappers) → `services/` (business logic, returns `ServiceResult<T>`) →
  `actions/` (`"use server"` Server Actions, thin, one per UI operation).
- Every privileged write (awarding points/XP, claiming a quest/milestone,
  following someone) goes through a Postgres `security definer` RPC —
  never a raw client `INSERT`/`UPDATE`. Row Level Security is enabled on
  every table as the last line of defense, not the primary enforcement.

---

## 2. Repository Map

```
src/vo-tri/
  design-system/     tokens.css, motion.css — brand colors/spacing/motion
  copy/microcopy.ts  ALL user-facing strings — never hardcode UI copy elsewhere
  ui/                design system primitives — import from ui/index.ts
  shell/             AppShell, Header, Sidebar, BottomNav, AuthDialog, UserMenu
  home/ explore/ profile/ leaderboard/ game/ retention/ social/
                     one folder per feature domain (components + types)
  lib/               small shared helpers (time.ts, sound.ts, analytics.ts, site.ts)
  server/
    supabase/        server-client.ts (normal path), admin-client.ts (service-role,
                     unused by design until a privileged job needs it), env.ts
                     (shared config-presence check), database.types.ts
    repositories/    thin Supabase query wrappers, one per domain
    services/        business logic, returns ServiceResult<T>, one per domain
    actions/         "use server" Server Actions, one per domain
    adapters/        DB row → frontend prop shape, pure functions
    validation/      zod schemas
    require-auth.ts  shared "get authenticated/optional client" helpers
    errors.ts        ServiceResult<T>, error taxonomy, ok()/fail()/validationFail()
    session.ts       getOptionalSession()/getSessionUser() — safe for every-request use

src/app/             Next.js routes; SEO/PWA file conventions (manifest, icons, robots)
src/middleware.ts    refreshes the Supabase session cookie; no-ops if unconfigured

supabase/migrations/ 13 SQL files, filename-ordered, forward-only (see §7)
tests/e2e/           Playwright suite — runs in CI against a real production build
src/**/*.test.ts     Vitest unit tests, colocated — runs in CI
```

**Key documents** (all in `docs/`, read only when this file sends you there):

| Doc | Read it for |
|---|---|
| `CLAUDE.md` (repo root) | The full chronological decision log — every round, every judgment call, why things are the way they are. The most detailed source; long. |
| `PROJECT_HANDOFF.md` | Structured (non-chronological) handoff: what's built, tech debt register (§12), Launch Readiness Score (§13). |
| `BACKEND_ARCHITECTURE.md` | Full backend design: schema, RLS, security review, concurrency, anti-cheat. |
| `INTEGRATION_CHECKLIST.md` | Exact steps + risk register for connecting a live Supabase project. |
| `MIGRATION_VALIDATION.md` | Migration order/idempotency/rollback + verification & health-check SQL. |
| `OPERATIONS.md` | Backup/recovery/logging/monitoring/deployment. |
| `VO_TRI_DESIGN_BIBLE.md` | Full design system spec (brand, tokens, components). |
| `VO_TRI_ARCHITECTURE.md` | Frontend component inventory + routing map. |
| `VO_TRI_GAMEPLAY_ENGINE.md` | Gameplay Engine lifecycle + how to add a new Activity. |

---

## 3. Engineering Rules (permanent, always follow)

1. **Evidence over assumption.** Never claim something works, passed, or
   is verified without actually running the command. Never guess a CI
   result — check it for real.
2. **Keep CI green after every meaningful change.** Full verification
   before calling anything done: `tsc`, lint, unit tests, `next build`,
   and E2E when UI is touched.
3. **No fabricated data.** If real backend data doesn't exist for a
   surface yet, show the honest empty/logged-out state — never a fake
   number, fake activity feed item, or fake online-user count.
4. **Architecture before implementation; documentation is part of every
   feature**, not an afterthought bolted on at the end.
5. **Never bypass security.** RLS is the last line of defense, not the
   only one — every table needs both row-scoping (RLS policy) AND, if it
   has any "own row" update policy, column-scoping
   (`restrict_update_columns()`, see §7). Never let a client mutate
   economy fields (points/xp/level) directly.
6. **Refactor before adding a feature, the moment duplication is found**
   — don't defer cleanup to "later."
7. **Migrations are forward-only.** Never edit an already-applied
   migration file. Before the first live push, editing in place is still
   fine (nothing live depends on it yet).
8. **Cost discipline.** Free/low tiers only until real usage justifies
   paid infra (Vercel, Supabase free tier). No speculative provisioning.
9. **Stop only when the issue genuinely requires owner intervention** —
   real credentials, a live infra decision, a product/business call. For
   everything else, resolve it yourself with evidence.
10. **The architecture phase is closed** (owner's explicit instruction,
    2026-07-26). Do not add speculative hardening/refactoring. Only
    change the architecture if the live production environment exposes
    real evidence that the current design is insufficient.

---

## 4. Current Project Status

**Frontend — 100% complete.** Design system (tokens/motion/typography),
App Shell, Home, Explore, Profile, Leaderboard, Gameplay Engine
(framework + real timer/scoring/combo/countdown mechanics), Retention
System (quests/milestones/streaks/claim flow), Social Foundation
(reactions/comments/follow/feed/notifications UI). SEO (sitemap, OG
image, structured metadata) and PWA (manifest, install icons) complete.
Accessibility audited (skip link, focus management, keyboard nav). 104
Vitest unit tests + 18 Playwright E2E tests, both green in CI on every
push.

**Backend Architecture — 100% designed, built, and hardened.** 24-table
Postgres schema, RLS enabled on 100% of tables (32 policies total), 9
functions including 5 `security definer` RPCs
(`record_activity_session`/`claim_quest`/`claim_milestone`/
`toggle_follow`/`advance_quest_progress`). Full repository→service→action
layer built and unit-tested for every domain (profile, gameplay,
retention, leaderboard, social, notifications, unlocks, auth) — all
verified against a local Postgres 16 stub repeatedly (never against the
live project — see §5).

**Security — reviewed multiple rounds, one severe bug found and fixed.**
Concurrency races in `claim_quest`/`claim_milestone`/`toggle_follow`
found and fixed (proven via real concurrent Postgres sessions). A
critical gap found and fixed: "own row" RLS update policies
(`profiles`/`notifications`/`comments`/`reactions`) gated which row but
not which columns — closed with `restrict_update_columns()`, a
value-based allow-list trigger. A second, independent bug found only by
executing the fix's own verification: comment soft-delete had never
worked, due to how Postgres RLS folds a SELECT policy into UPDATE
validity — fixed. Storage upload limits, cascade-behavior bug, and 3
missing indexes also fixed.

**Production Readiness — fully documented, not yet executed live.**
`INTEGRATION_CHECKLIST.md` (steps + risk register), `MIGRATION_VALIDATION.md`
(order/idempotency/rollback/verification queries), `OPERATIONS.md`
(backup/recovery/monitoring/deployment). Launch Readiness Score recorded
in `PROJECT_HANDOFF.md` §13 (Production Readiness scored lowest, 7.5/10,
specifically *because* nothing has run against the real target yet).

**Documentation — extensive**, cross-linked, and self-auditing (the
final pre-integration round found and fixed 2 genuinely stale passages
in `BACKEND_ARCHITECTURE.md`/`README.md` that no longer matched reality).

**Testing — 104 unit tests + 18 E2E tests, both wired into CI, currently
green.**

### What is intentionally NOT finished yet

- **Migrations have not been applied to the live Supabase project.**
  This is the current blocker — see §5.
- **No domain is wired to real data except Auth** (`AuthDialog`/
  `UserMenu`, and a partial `/profile` render branch). Profile stats/XP/
  Retention/Leaderboard/Social all still render their honest empty/guest
  state in production today — this is correct, not a bug, until wiring
  happens per §6.
- **Avatar upload** is not implemented (Storage bucket + policies exist,
  but no upload UI/flow).
- **No monitoring/APM, no real backup has ever been taken** — both
  documented in `OPERATIONS.md`, deferred until real usage/credentials
  justify them.
- **Achievement/Badge granting rules** (which real event unlocks which
  achievement) are undesigned — a game-design decision, not a data-layer
  gap (the read path and catalog are ready).

---

## 5. Current Stop Condition

**The owner has provided real Supabase credentials** — `.env.local`
contains a real Project URL, Anon Key, and Service Role Key for project
`msmnnosshwsemlszempd` (confirmed gitignored, never committed). The keys
were checked for the highest-severity risk named in
`INTEGRATION_CHECKLIST.md` §7 (anon/service-role mixup) by decoding both
JWTs: the anon key carries `"role":"anon"`, the service role key carries
`"role":"service_role"` — correctly assigned, not swapped.

**But this working environment cannot reach Supabase over the network.**
Confirmed directly (2026-07-26): `curl` to the project's REST API
(`/rest/v1/`), Auth settings endpoint (`/auth/v1/settings`), the
Management API (`api.supabase.com`), and a direct Postgres connection
(`db.msmnnosshwsemlszempd.supabase.co:5432`) all fail identically with
`CONNECT tunnel failed, response 403` — a deliberate egress policy block
at the proxy layer, the same class of block already documented for
Docker Hub in an earlier phase. This is **not** something to route
around (never disable TLS verification or unset `HTTPS_PROXY`).

**Owner actions required before development can continue past this
point** (any one of these unblocks it):
1. Run the combined migration SQL (already generated and delivered to
   the owner as a file — regenerate via `cat supabase/migrations/*.sql`
   in filename order if it's been lost) against the live project,
   either via the Supabase SQL Editor or `supabase db push` from a
   machine that can actually reach Supabase — then run every query in
   `MIGRATION_VALIDATION.md` and share the results back.
2. Provide a working environment/session that *can* reach Supabase (a
   different network policy), if one exists.
3. Confirm explicitly if migrations have already been applied by some
   other means, so verification can proceed from query results alone.

---

## 6. Next Execution Plan (owner-specified order, once unblocked)

Execute in this exact order, once live access (or verified query
results) exists. For every step: keep CI green, verify before proceeding
to the next step, update `PROJECT_HANDOFF.md` if the real environment
reveals any difference from what's documented, and stop only if a step
genuinely requires owner intervention (not just "this is hard").

1. Validate the provided credentials (structural check already done —
   see §5; live connectivity check is the remaining part).
2. Apply the migration package exactly as documented
   (`MIGRATION_VALIDATION.md` §Migration order).
3. Execute every verification query from `MIGRATION_VALIDATION.md`.
4. Resolve any differences between the local Postgres verification
   environment and the real Supabase environment (there may be Supabase
   platform specifics the local stub couldn't simulate — the storage
   migration is the one already-flagged candidate).
5. Connect Authentication to the live backend (mostly already wired —
   confirm it against the real project instead of just the local stub).
6. Connect Profile.
7. Connect XP and Level.
8. Connect Retention.
9. Connect Leaderboard (read `INTEGRATION_CHECKLIST.md`'s note on the
   Server-Component-calling-Server-Action-directly risk before wiring
   this one specifically).
10. Connect Social.
11. Verify Storage (first real execution of `20260724000011_storage.sql`
    happens here — it was never testable locally).
12. Perform a full end-to-end production validation using the real
    backend (signup → profile row created → play an activity → session
    recorded → quest advances → claim → level up → leaderboard reflects
    it → social interactions work).

Do not redesign the architecture during this process unless the real
production environment exposes concrete evidence that the current design
is insufficient — the default assumption is that the design is correct
and the job is to connect it, not rethink it.

---

## 7. Important Architectural Decisions (only what affects future work)

- **`ServiceResult<T>` + unified error taxonomy.** Every service function
  returns `{ok:true,data}` or `{ok:false,error:{code,category,title,
  description}}` — never throws for an expected business-rule failure.
  9 fixed error categories (`errors.ts`). Extend the taxonomy, don't
  invent a parallel error shape.
- **RLS gates rows; it does not gate columns.** Any new "own row" update
  policy (`using (auth.uid() = <owner column>)`) needs
  `restrict_update_columns()` attached with an explicit allow-list if
  *any* column on that table should only ever change through a
  `security definer` function. This was the single most severe bug
  found in the whole project (see §4) — treat it as a checklist item for
  every new table, not a one-time fix.
- **Privileged writes only happen through `security definer` RPCs**
  (`record_activity_session`, `claim_quest`, `claim_milestone`,
  `toggle_follow`, `advance_quest_progress`) — never a raw client
  `INSERT`/`UPDATE` for anything economy-related. These RPCs set
  `vo_tri.bypass_column_guard` before their own privileged profile
  updates — that's the sanctioned bypass mechanism, not a workaround to
  copy elsewhere.
- **Anti-cheat is a ceiling clamp, not exact replay.**
  `record_activity_session` trusts client-reported points/XP up to a
  generous ceiling (`reward/xp × 3`), logging a `score_clamped` audit row
  when triggered. Exact replay would need `GameFrame` to log its full
  event sequence — out of scope until the economy has real stakes.
- **RSC serialization rule.** A `LucideIcon` reference can never cross a
  Server→Client Component prop or a Server Action return value. The
  fixed pattern: a zero-props `"use client"` wrapper that looks up the
  catalog itself (see `PlayClient.tsx`, `DailyQuestPreview.tsx`). This
  exact class of bug has recurred multiple times — check for it whenever
  wiring a new Server Component to a Client Component that needs
  icon-bearing data.
- **Migrations are forward-only once live.** Before the first
  `supabase db push`, editing a migration file in place is fine (this is
  the state today). The moment migrations are applied to a live project,
  that stops being safe — see `OPERATIONS.md`'s Migration strategy.
- **Catalog content is real content, not fabricated data.** Activities/
  quests/milestones/achievements/badges are authored game-design content
  living in frontend `.ts` files; DB tables are thin `id`-keyed mirrors
  seeded from that code for FK integrity — never treat these as
  something the "no fabricated data" rule forbids. What that rule *does*
  forbid is fake per-user/social data (fake online counts, fake activity
  feed items) — always show the honest empty state for those instead.

---

## 8. AI Onboarding Protocol

**Every brand-new AI session's first task on this repository follows
this exact sequence — not an approximation of it, not a subset picked by
judgment call.** This exists so any session starts from the same
engineering baseline regardless of what conversation history it does or
doesn't have.

1. **Read this file (`docs/AI_ENGINEERING_CONTEXT.md`) completely,
   start to finish**, before reading anything else and before writing
   any code.
2. **Read every document this file references, in this order** (skip a
   document only if the task at hand genuinely can't touch that area —
   don't skip for convenience):
   1. `docs/PROJECT_HANDOFF.md` — §9–13 at minimum (remaining work, AI
      guide, tech debt register, launch readiness score).
   2. `docs/INTEGRATION_CHECKLIST.md` and `docs/MIGRATION_VALIDATION.md`
      — required reading if the task touches Supabase/migrations/UI
      wiring at all; §5/§6 of this file tell you whether that's the
      current focus.
   3. `docs/BACKEND_ARCHITECTURE.md` — required if the task touches
      schema, RLS, a security-definer function, or any server-side code.
   4. `docs/VO_TRI_DESIGN_BIBLE.md` / `docs/VO_TRI_ARCHITECTURE.md` /
      `docs/VO_TRI_GAMEPLAY_ENGINE.md` — required if the task touches
      design tokens/brand, frontend component structure, or gameplay
      mechanics respectively.
   5. `docs/OPERATIONS.md` — required if the task touches deployment,
      backup, or monitoring.
   6. `CLAUDE.md`'s full decision log — consult when you need the
      detailed *why* behind a specific past decision this file only
      summarizes (§7), or before "fixing" something that looks wrong but
      may be intentional.
3. **Inspect the current repository structure directly** — don't trust
   memory or a stale mental model from a prior session. Run something
   equivalent to `find src -maxdepth 3 -type d` and skim `package.json`,
   `supabase/migrations/`, and `.github/workflows/ci.yml` to see the real
   current shape, not the shape this document describes in prose.
4. **Compare documentation against the current codebase.** Spot-check at
   least: does §4's "Current Project Status" match what's actually wired
   (e.g. grep for whether a domain claimed as "not wired yet" really has
   no Client Component calling its Server Actions)? Does §5's stop
   condition still hold (re-run the connectivity check in step 2 of the
   old guide, now folded into this protocol — see the checklist below)?
5. **Report any inconsistencies found in step 4 before making any other
   change.** If this file or another doc disagrees with the real code,
   say so explicitly and fix the documentation in the same pass — per
   §10's rule that code is always the source of truth.
6. **Summarize the current project state** back to whoever is present
   (owner or the task at hand) in a few sentences — what's built, what
   isn't, drawing from §4, not restating this whole file.
7. **Identify the active stop condition** (§5) precisely — what exactly
   is blocking further progress, and what would unblock it.
8. **Propose the next engineering step**, drawn from §6's execution plan
   if the stop condition is the Supabase integration one, or from
   whatever the actual task/request is otherwise.
9. **Wait for owner approval only if the active stop condition requires
   it** (e.g. still blocked on credentials/network access/a live
   decision only the owner can make — see §3 rule #9). If the stop
   condition has already been satisfied and the task is clear, proceed
   without waiting for redundant confirmation.
10. **Begin implementation** — following the Engineering Rules in §3 and
    the Important Architectural Decisions in §7 throughout.

### Pre-flight Checklist

Every future AI session must be able to check off every item below
before writing the first line of code. If any item can't be honestly
checked, go back and do the corresponding step above first.

- [ ] Documentation reviewed — this file completely, plus every relevant
      referenced doc per step 2's recommended order.
- [ ] Stop condition understood — §5's current blocker, and exactly what
      resolves it.
- [ ] Architecture understood — the 3-layer backend stack, RLS +
      security-definer boundary, and the RSC serialization rule (§7) —
      the three most common places a change goes wrong if
      misunderstood.
- [ ] Existing implementation inspected — the real repository structure
      and CI config (step 3), not assumed from this document's prose.
- [ ] CI expectations understood — `tsc`/lint/`vitest run`/`next build`/
      `test:e2e` all must stay green; know how to check the real GitHub
      Actions result, not guess it.
- [ ] No conflicting assumptions detected — any mismatch found in step 4
      has been reported (step 5) before proceeding, not silently
      "corrected" by assumption.

---

## 9. Future AI Session Guide

**You have never seen this repository before.** §8 above is the
mechanical first-task sequence; this section is the standing guidance
that applies for the rest of the session, after onboarding completes.

**Never change without explicit, fresh owner approval:**
- Brand colors/tokens/dark-mode-first rule (`CLAUDE.md`'s "Non-negotiable
  design rules").
- The RLS/`security definer` security boundary described in §7.
- The anti-cheat design (ceiling clamp vs. exact replay).
- The cost rule (free/low-tier infra only).
- Anything already recorded as a deliberate decision in `CLAUDE.md`'s
  decision log — read the relevant entry before "fixing" something that
  looks wrong; it may be intentional (e.g. "why doesn't Home show online
  user count" → the no-fabricated-data rule, not a missing feature).

**How to continue safely:**
- Full verification before claiming anything is done: `npm run lint &&
  npm run typecheck && npm run test && npm run build`, plus
  `npm run test:e2e` if UI changed. Never skip this, never assume a
  result.
- For any Supabase/SQL change: validate against a real target if
  reachable; if not, use the local Postgres stub technique documented in
  `BACKEND_ARCHITECTURE.md`'s Phụ lục (rebuild the stub, apply
  migrations, run real concurrent sessions for anything security/
  concurrency-related — don't just read the SQL and assume it's correct).
- Check the real GitHub Actions CI result after pushing — never guess.
- If genuinely blocked on something only the owner can provide
  (credentials, a live decision, network access), say so plainly and
  stop, per rule #9 in §3 — don't fabricate progress around the blocker.

**How to report work:**
- Concise summary of what changed, why, and the verification evidence
  (exact commands run, real results — not "should work").
- State CI status explicitly, confirmed via the real GitHub Actions API,
  not inferred.
- If anything structural changed (a new architectural decision, a
  completed milestone, a new permanent rule, a change in the stop
  condition), update **this file** and `PROJECT_HANDOFF.md` in the same
  round — not as a follow-up "later."

---

## 10. Living Document Rules

This document must always stay synchronized with the repository. Update
it, in the same commit/round as the triggering change, whenever:

- An architectural decision changes or a new one is made that future
  engineers need to know before touching related code (§7).
- A major feature or milestone completes (§4).
- A new permanent engineering rule is introduced (§3).
- The stop condition changes — e.g. once production integration
  actually begins, §5 must be rewritten to reflect the new reality, and
  §6 must shrink as steps complete.

**Keep it concise.** This file is an index and a summary, not an
archive — if a section is growing into a multi-page essay, move the
detail into the appropriate specialized doc (§2's table) and leave only
a pointer here. The full chronological history belongs in `CLAUDE.md`,
not here. If this file and the actual code/repository state ever
disagree, **the code is the source of truth** — fix this file to match,
never the reverse.

**If a new section is inserted (not just appended), re-check every
cross-reference in this file and in `PROJECT_HANDOFF.md`/`CLAUDE.md`/
`README.md` that points to a section number** — a shifted number is
exactly the kind of stale-but-plausible-looking reference that's easy to
miss and hard to notice later (this happened once already: adding §8
here pushed the old §8/§9 to §9/§10, and `PROJECT_HANDOFF.md` §11 had to
be updated to match in the same round).
