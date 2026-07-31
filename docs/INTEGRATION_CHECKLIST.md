# VÔ TRI — Supabase Integration Checklist

Canonical answer to one question: **"the owner creates a Supabase project
today — what exact steps remain before the app is fully connected?"**
Nothing here has been executed against a real project yet (this sandbox's
egress policy blocks Supabase entirely, same as Docker Hub — see
`docs/BACKEND_ARCHITECTURE.md`'s Phụ lục); every step below is either
already done in code (checked ☑) or is a real remaining step for whoever
has live credentials (☐). Update the checkboxes in place as steps
complete — this file is meant to be the running source of truth, not a
one-time snapshot.

## 1. Create the project

- [ ] Create a new project at supabase.com (free tier is enough — see
      CLAUDE.md's cost rule: no paid infra before real usage).
- [ ] Note the **Project URL**, **anon public key**, and **service_role
      key** from Settings → API.

## 2. Set environment variables

| Variable | Where it's read | Required | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `src/vo-tri/server/supabase/env.ts` (via `server-client.ts`, `middleware.ts`, `session.ts`) | Yes, once live | Safe to expose to the browser — bundled into client JS by Next.js's own `NEXT_PUBLIC_*` convention. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | same as above | Yes, once live | Also safe to expose — every table's actual authorization comes from RLS (§6/§18.2 of `BACKEND_ARCHITECTURE.md`), not from keeping this secret. |
| `SUPABASE_SERVICE_ROLE_KEY` | `src/vo-tri/server/supabase/admin-client.ts` only | Not yet — no code path calls `admin-client.ts` today | **Never** prefix with `NEXT_PUBLIC_`. Bypasses RLS entirely. Set it anyway when the project exists so it's ready for the first real privileged job (the leaderboard snapshot cron, §10). |
| `NEXT_PUBLIC_SITE_URL` | `src/vo-tri/lib/site.ts` | Optional | Falls back to `http://localhost:3000`. Set to the real deployed domain once one exists — used by `sitemap.ts`/`robots.ts`/`opengraph-image.tsx`. **Also** set this as Supabase Auth's "Site URL" (see step 5) — two different systems, same value. |

- [ ] Copy `.env.example` → `.env.local` and fill in the three Supabase
      values for local development.
- [ ] Set the same three (plus `NEXT_PUBLIC_SITE_URL`) as environment
      variables in the hosting provider (e.g. Vercel project settings) for
      the deployed app — `.env.local` is gitignored and never reaches
      production on its own.
- [ ] Confirm no other env var is missing: `grep -rn "process\.env\." src
      middleware.ts` should show only the four above.

## 3. Apply migrations

- [ ] `supabase link` (from the project root, pointing at the real
      project) then `supabase db push` — applies all 13 files under
      `supabase/migrations/` in order. Every one has already been
      validated against a local Postgres 16 stub (see the Phụ lục in
      `docs/BACKEND_ARCHITECTURE.md`) — the storage migration
      (`20260724000011_storage.sql`) is the one exception: it depends on
      Supabase's real `storage` schema and gets its **first real
      execution** here.
- [ ] If `supabase db push` isn't available (e.g. no CLI access), use the
      Supabase Dashboard's SQL Editor and paste the 13 files in filename
      order — they're idempotent (`on conflict do update`/`do nothing`
      everywhere seed data or a bucket is inserted), so re-running is safe.
- [ ] After push: confirm in the Dashboard's Table Editor that
      `activities`/`quest_definitions`/`milestone_definitions`/
      `achievement_definitions`/`badge_definitions`/`collection_definitions`
      all show their real seeded rows (12/8/6/6/6/4 respectively) — an
      empty catalog table means a migration silently didn't run.
- [ ] Confirm the `avatars` bucket exists under Storage, is public, and
      shows the 5 MiB size limit / image-only MIME allow-list from
      `20260724000011_storage.sql`.

## 4. Configure Auth (real gotchas, not obvious from the code alone)

- [ ] Authentication → URL Configuration: set **Site URL** to the real
      deployed domain (same value as `NEXT_PUBLIC_SITE_URL`) and add it to
      **Redirect URLs**. Skipping this means every confirmation/reset
      email link points at `localhost` in production.
- [ ] Authentication → Providers → Email: decide whether "Confirm email"
      stays ON (Supabase's default). If it's ON, `AuthDialog` already
      handles it correctly — sign-up shows "kiểm tra email để xác nhận"
      instead of a false "success" (see `docs/BACKEND_ARCHITECTURE.md`
      §18.4). If turned OFF, sign-up establishes a session immediately
      instead (also already handled — no code change needed either way).
- [ ] Supabase's built-in email sending has a low rate limit, unsuitable
      for real signup volume. Configure custom SMTP (Authentication →
      Settings → SMTP) before expecting more than a handful of signups —
      still free-tier friendly (e.g. a free-tier transactional email
      provider), consistent with CLAUDE.md's cost rule.

## 5. Verify the connection end-to-end

- [ ] `next build` locally with `.env.local` present: routes that touch
      session (`/`, `/explore`, `/leaderboard`, `/profile`,
      `/vo-tri-styleguide`) should flip from `○` (static) to `ƒ`
      (dynamic) in the build output — this is the same check used to
      confirm middleware/session wiring throughout Phase 3.
- [ ] Sign up a real test account through the deployed `AuthDialog`.
      Confirm in the Dashboard that a matching `profiles` row was
      auto-created by the `handle_new_user` trigger (username/display_name
      populated from what was typed, `points`/`level`/`xp` all at their
      defaults).
- [ ] Confirm `/profile` renders the real logged-in state (ProfileHero/
      StatCards/LevelCard/StreakTracker) instead of the guest CTA.
- [ ] Play through `/play/diem-danh` once and confirm in the Dashboard
      that `record_activity_session` actually ran: a new `activity_sessions`
      row, `profiles.points`/`xp` incremented, `quest_progress` advanced
      for `daily-check-in`.
- [ ] Attempt the exact exploit documented in
      `docs/BACKEND_ARCHITECTURE.md` §18.2 directly against the live
      project (e.g. via the Supabase JS client in a browser console) to
      confirm `restrict_update_columns()` really is live on the deployed
      database, not just the local stub: `update profiles set points =
      999999 where id = <your own id>` must fail with
      `COLUMN_NOT_UPDATABLE: points`.

## 6. Wire the UI (the deliberately-deferred last step)

Every Server Action listed in `docs/BACKEND_ARCHITECTURE.md` §15.2's
component→server-function map already exists and is unit-tested — none
of it is called from a real page yet except Auth (`AuthDialog`/
`UserMenu`) and the partial `/profile` wiring from Phase 3. Once steps
1–5 above are confirmed working end-to-end:

- [ ] Wire `EditProfileSheet` to `updateProfileAction`.
- [ ] Wire `PlayClient`'s real completion path to `recordActivitySessionAction`
      (today it demos the engine's capabilities without persisting).
- [ ] Wire `QuestCard`/`ClaimRewardDialog` to `claimQuestAction`/
      `claimMilestoneAction`.
- [ ] Wire `FollowButton`/`CommentSection`/`ReactionBar` to their
      respective social actions.
- [ ] Wire `/leaderboard` to `getGlobalLeaderboardAction` — **read
      `docs/BACKEND_ARCHITECTURE.md` §18.1's note on this specific risk
      first**: if the page's own Server Component calls the action
      directly during render (rather than only from a client
      interaction), it will crash on every unconfigured environment the
      same way `RootLayout` almost did before `getOptionalSession()`
      existed. Route it through the same optional-session pattern, or
      only call it from a Client Component effect.
- [ ] Wire `NotificationCenter` to `listNotificationsAction`/
      `markNotificationReadAction`.

Each of these is additive UI wiring only — no further schema/service
changes are expected to be needed for any of them.

## 7. Known risk points (static dry-run analysis)

No live Supabase project exists to test against, so this section is a
static walk-through of steps 1–6 above, asking "what could genuinely go
wrong here that isn't already handled?" for each. Ordered by severity.

- **Anon key / service role key mixup (high severity).** Both are JWTs
  that look superficially similar when copy-pasting from Settings → API.
  Pasting the service role key into `NEXT_PUBLIC_SUPABASE_ANON_KEY` would
  ship a full-RLS-bypass credential into every client bundle — the single
  worst possible outcome of this whole checklist. Concrete mitigation:
  after deploying, open the deployed site, view source / the network tab,
  and confirm the key embedded in the client JS decodes (any JWT
  debugger) to a payload with `"role": "anon"`, not `"role":
  "service_role"`. Do this once, immediately after every env var change.
- **Testing the exploit from §18.2 while not actually logged in as the
  target row's owner (medium severity, false sense of security).** The
  verification step in §5 above only proves `restrict_update_columns()`
  works if the UPDATE actually reaches the trigger — if run from a
  browser console without a real session, RLS's row-visibility check
  (`auth.uid() = id`) rejects it first because no row matches an
  unauthenticated `auth.uid()`, which looks like "blocked" for the wrong
  reason. Be logged in as the real test account, targeting that same
  account's own `id`, when running this check.
- **Manual SQL Editor fixes bypass RLS row-scoping but NOT the
  column-guard triggers (medium severity, worth understanding before it
  surprises anyone).** The Supabase SQL Editor typically connects with
  elevated privileges that bypass RLS's row-visibility entirely — but
  `restrict_update_columns()` is a plain trigger, not an RLS policy, and
  triggers fire for every role including `postgres`/`service_role` (this
  was directly proven while building the guard: the local Postgres
  superuser was blocked by it just like `authenticated` was). A manual
  "fix" like `update profiles set points = 500` in the SQL Editor will
  fail with `COLUMN_NOT_UPDATABLE` too — this is intentional, not a bug.
  The one legitimate way to manually adjust an economy field is
  `select set_config('vo_tri.bypass_column_guard', 'on', true);`
  immediately before the fix, in the same transaction, exactly like the
  RPCs do.
- **Manual copy-paste into the SQL Editor can silently truncate a long
  file (medium severity).** `20260724000012_functions.sql` is the
  largest migration (459 lines). If the SQL Editor's paste buffer or a
  clipboard tool truncates it, the file may "succeed" partially (e.g.
  `advance_quest_progress` created, but a later function silently
  missing) rather than failing outright. Mitigation: prefer `supabase db
  push` over manual paste wherever CLI access is available; if paste is
  the only option, always run `docs/MIGRATION_VALIDATION.md`'s
  post-migration verification queries afterward — the exact function-name
  list check would catch a truncated file immediately.
- **Supabase's default email-sending rate limit could make the first
  few signup tests in §5 look broken when they're actually just delayed
  or throttled (low-medium severity).** Already handled at the UI level
  (`AuthDialog` never claims false success), but worth setting
  expectations before testing: a delayed confirmation email is not a
  integration bug.
- **Vercel environment-variable scoping (low severity).** Vercel lets env
  vars be scoped to Production/Preview/Development independently — setting
  them only for Production and then testing on a Preview deployment URL
  will look identical to "not configured yet" (the app degrades gracefully
  either way, per §2's design, so this fails safe — but it can still cost
  debugging time if not expected).
- **`/leaderboard`'s Server-Component-calls-Server-Action-directly risk**
  — already flagged in §6 above, restated here because it's the one UI
  wiring step with a known failure mode from this project's own history
  (the same class of bug `RootLayout` had before `getOptionalSession()`
  existed).
- **`next.config.ts`'s CSP (`connect-src 'self'`) will silently block a
  direct browser→Supabase Storage upload, if avatar upload is ever
  implemented that way (medium severity, found by static review of
  `next.config.ts` against the planned Storage feature).** Every Supabase
  call in this codebase today is server-side (`createServerSupabaseClient()`
  inside a Server Component/Action) — the browser only ever talks to the
  Next.js server itself (same-origin), so `connect-src 'self'` is
  correct as-is. If `EditProfileSheet`'s eventual avatar-upload wiring
  uploads directly from the browser to Supabase Storage's REST endpoint
  (a common pattern, avoids proxying binary data through the app server),
  that request would be silently blocked by this CSP — appearing as a
  mysterious upload failure with **no server-side error at all** (CSP
  violations are enforced entirely client-side). If that pattern is
  chosen, add the project's own Storage origin to `connect-src` in
  `next.config.ts` at the same time (e.g. `connect-src 'self'
  https://<project-ref>.supabase.co`) — or avoid the whole class of bug
  by routing the upload through a Server Action instead, keeping the
  existing CSP untouched.
