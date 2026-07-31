# VÔ TRI — Operations

Long-term maintenance reference: backup, migration, recovery, logging,
monitoring, and a deployment checklist. Written for whoever operates this
app after launch, not necessarily the person who built it. Nothing here
describes infra that exists yet — VÔ TRI has no live Supabase project or
production deployment as of this writing (see
`docs/INTEGRATION_CHECKLIST.md`); this is the plan for once one exists,
kept honest about what Supabase's **free tier** specifically does and
doesn't give you, per CLAUDE.md's cost rule (free/low tiers only, no paid
infra before real usage).

## Backup strategy

Supabase's automatic daily backups and point-in-time recovery (PITR) are
**paid-tier features** — the free tier does not include them. Until real
usage justifies upgrading (CLAUDE.md's own cost rule), backup is a manual,
owner-scheduled responsibility:

- Run `supabase db dump --data-only -f backup.sql` (or the Dashboard's own
  "Database → Backups" manual export, if offered on the current plan) on
  a recurring schedule (e.g. weekly, via a local cron or a GitHub Action
  that runs on a schedule and uploads the dump to a free-tier object
  store).
- Store dumps somewhere other than the same Supabase project (a genuine
  backup must survive the project itself being lost/deleted).
- Re-evaluate upgrading to a paid Supabase tier for automatic PITR once
  there's real user data whose loss would actually matter — this is
  exactly the kind of paid infra CLAUDE.md says to defer until usage
  justifies it, not to provision speculatively.

## Migration strategy

Forward-only, via `supabase/migrations/*.sql` + `supabase db push` — see
`docs/BACKEND_ARCHITECTURE.md` §8 for the original design and §18.1 for
why this matters more once real data exists. The concrete rule going
forward:

- **Before the first `supabase db push` against a live project**: editing
  an existing migration file in place is fine (nothing live depends on
  its old contents yet) — this is what every hardening round so far has
  done.
- **After the first successful `supabase db push`**: never edit an
  already-applied migration file again. Supabase's CLI tracks applied
  migrations by filename/timestamp in `supabase_migrations.schema_
  migrations` — editing an already-applied file's contents does **not**
  get it re-run; the live database silently keeps running the old version
  while the repo shows the new one. Any further schema change is a **new**
  migration file with a later timestamp.
- A `NOT NULL` column added to a table that already has real rows needs
  two steps across two migrations, not one: (1) add the column nullable
  with a sensible default, backfill existing rows; (2) a later migration
  adds the `NOT NULL` constraint once every row is known to satisfy it.
  Doing both in one migration against a live table risks the migration
  itself failing mid-deploy on existing NULLs.

## Recovery strategy

- **Schema corruption / bad migration**: fix forward with a new migration
  that repairs the mistake (e.g. drops a wrongly-added constraint) —
  never hand-edit the live database outside the migration system, or the
  repo and the live schema drift apart silently.
- **Data loss**: restore the most recent `pg_dump` (see Backup strategy
  above) into a fresh Supabase project, then re-point the app's env vars
  at it.
- **Full project loss**: `docs/INTEGRATION_CHECKLIST.md` is written to be
  replayed end-to-end against a brand new project — that checklist
  doubles as the disaster-recovery runbook.

## Logging strategy

- **Application-level security/ops audit trail**: `public.audit_log`
  (`20260724000010_audit.sql`) — currently logs `score_clamped` events
  (the anti-cheat ceiling clamp firing) with the client-reported vs.
  awarded values. No client-facing SELECT policy exists on this table by
  design (§4.8/§18.2) — read it via the Dashboard's Table Editor or a
  `service_role` connection, never through the app's own anon/authenticated
  client.
- **Infrastructure logs** (Postgres query logs, PostgREST API logs, Auth
  logs): available in the Supabase Dashboard's Logs section on any tier.
  Free-tier log retention is a shorter rolling window than paid tiers —
  check the current Supabase pricing page for the exact retention period,
  since it's a platform detail this doc shouldn't hardcode and risk going
  stale.
- **Application errors** (uncaught exceptions in Server Actions/Components):
  currently only visible via the hosting provider's own function logs
  (e.g. Vercel's runtime logs) — no dedicated error-tracking service is
  wired in yet (see Monitoring below).

## Monitoring strategy

No APM or error-tracking service is integrated today — a real gap for a
production launch, not fixed in this round since it means adding a new
paid-or-free-tier third-party service, which CLAUDE.md's cost rule says
to defer until real usage exists. When it's time:

- A free-tier error tracker (e.g. Sentry's free tier) wired into
  `global-error.tsx`/`error.tsx` would surface uncaught exceptions beyond
  what CI/E2E catch — those two files already exist and are exactly where
  such a SDK's error boundary would hook in.
- Supabase's own Dashboard shows basic project health (API request
  volume, database size, active connections) on every tier — sufficient
  for the very first users, before a dedicated monitoring stack is
  justified.
- `record_activity_session`'s `score_clamped` audit_log rows are the one
  thing worth actively watching from day one — a sudden spike would be
  the first real signal of either a client bug or an actual cheating
  attempt.

## Production deployment checklist

1. Complete `docs/INTEGRATION_CHECKLIST.md` (Supabase project created,
   migrations applied, env vars set).
2. Deploy to Vercel (the platform CLAUDE.md already designates, free
   tier): connect the GitHub repo, set the same environment variables
   from `docs/INTEGRATION_CHECKLIST.md` §2 in the Vercel project's own
   Environment Variables settings (not just `.env.local`, which never
   reaches Vercel).
3. Confirm the deployed build's route output matches the "credentials
   present → dynamic routes" pattern documented in
   `docs/BACKEND_ARCHITECTURE.md` §14 (`ƒ` not `○` for session-aware
   routes) — a quick way to catch a missing/misspelled env var before
   any user does.
4. Confirm `NEXT_PUBLIC_SITE_URL` matches the real deployed domain, and
   that Supabase Auth's Site URL/Redirect URLs (see
   `docs/INTEGRATION_CHECKLIST.md` §4) point at the same domain — a
   mismatch here silently breaks every confirmation/reset email link.
5. Run through `docs/INTEGRATION_CHECKLIST.md` §5's end-to-end
   verification (signup → profile row → play → session recorded) against
   the real deployed URL, not just locally.
6. Only after 1–5 are green: begin `docs/INTEGRATION_CHECKLIST.md` §6's
   UI-wiring steps, one component at a time, so a regression is easy to
   attribute to a single change.
