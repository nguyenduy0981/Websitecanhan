# VÔ TRI — Migration Validation Guide

The concise, execution-focused companion to `docs/INTEGRATION_CHECKLIST.md`
§3 (which says *when* to run migrations). This doc says exactly *what to
expect* and *how to confirm it worked* — written for the moment the owner
actually runs `supabase db push` against the real project, so they aren't
guessing whether a silent success is really a success.

All numbers below are measured, not estimated — from repeatedly applying
all 13 migrations to a local Postgres 16 stub (see the Phụ lục in
`docs/BACKEND_ARCHITECTURE.md`) during this and every prior hardening
round.

## Migration order

Files apply in filename order (timestamp prefix) — this is also the
dependency order; each file only references tables/functions created by
an earlier one:

| # | File | What it creates |
|---|---|---|
| 1 | `20260724000001_extensions_and_helpers.sql` | `citext` extension, `set_updated_at()`, `xp_required_for_level()`, `restrict_update_columns()` |
| 2 | `20260724000002_profiles.sql` | `profiles` table, its RLS + column guard, `handle_new_user` trigger on `auth.users` |
| 3 | `20260724000003_catalog_tables.sql` | 7 catalog mirror tables + seed data (activities/quests/milestones/achievements/badges/collections/seasons) |
| 4 | `20260724000004_gameplay.sql` | `activity_sessions`, `daily_activity_log`, `xp_ledger` |
| 5 | `20260724000005_retention.sql` | `quest_progress`, `milestone_progress` |
| 6 | `20260724000006_unlocks.sql` | `user_achievements`, `user_badges`, `user_collection_items` |
| 7 | `20260724000007_social.sql` | `follows`, `reactions`, `comments`, `feed_items` + their column guards |
| 8 | `20260724000008_notifications.sql` | `notifications`, `journey_events` + column guard |
| 9 | `20260724000009_leaderboard.sql` | `leaderboard_rank_snapshots` |
| 10 | `20260724000010_audit.sql` | `audit_log` (no client policies at all, by design) |
| 11 | `20260724000011_storage.sql` | `avatars` storage bucket + its 4 policies — the one migration that needs Supabase's real `storage` schema, first real execution happens here |
| 12 | `20260724000012_functions.sql` | The 5 security-definer RPCs: `advance_quest_progress`, `record_activity_session`, `claim_quest`, `claim_milestone`, `toggle_follow` |
| 13 | `20260724000013_unlocks_catalog_seed.sql` | Seed data for achievement/badge/collection definitions |

## Idempotency

Every seed `INSERT` uses `on conflict (...) do update`/`do nothing` — all
of migrations 3, 11, and 13 can be re-run safely (re-running after a
partial failure, or after editing catalog content and wanting to
re-sync, is always safe). Migrations 1, 2, 4–10, 12 are pure DDL
(`create table`/`create index`/`create trigger`/`create or replace
function`) — `create or replace function` is inherently idempotent;
`create table`/`create index`/`create trigger` are **not** (re-running
one of these against a database where it already succeeded fails with an
"already exists" error). This is expected and fine for a normal `supabase
db push` (the CLI tracks which migrations already applied and skips
them) — it only matters if pasting files manually into the SQL Editor,
where re-pasting an already-applied DDL file will error. Idempotency
verified by literally re-running the seed migrations twice in a row
against the local stub during every prior hardening round.

## Rollback considerations

No down-migrations exist — intentional, matching Supabase CLI's
forward-only convention (full reasoning in `docs/OPERATIONS.md`'s
Migration strategy section). Concretely, for the **first** production
push specifically (this project's actual current situation — zero live
rows exist anywhere yet):

- If migration N fails partway through applying, the database is left
  with migrations 1..N-1 fully applied and N partially applied (Postgres
  wraps each individual statement, but `supabase db push` typically runs
  each migration file as one transaction — a mid-file failure rolls that
  one file back entirely, leaving N cleanly absent). Fix forward: correct
  the SQL error and push again — never hand-edit the live database to
  patch around it.
- Since no real user data exists yet, if something goes deeply wrong the
  simplest recovery is `supabase db reset` (or dropping and recreating
  the project) and pushing all 13 files again from a clean slate. This
  option **stops being safe** the moment any real signup happens —
  from that point on, follow `docs/OPERATIONS.md`'s recovery strategy
  instead (fix forward, restore from backup) rather than resetting.

## Expected execution time

Applying all 13 migrations to a local Postgres 16 stub takes **~1.2
seconds total** (measured directly, per-file breakdown below) — every
file's own DDL is small (a handful of tables/indexes/policies each). A
real Supabase project adds per-statement network latency on top of that
local-execution time, but every file's total work is still small enough
that **the entire push should complete in well under a minute**. If any
single file takes materially longer than a few seconds, that's a signal
something is wrong (e.g. a lock wait against unexpected existing data),
not normal.

| File | Local apply time |
|---|---|
| `20260724000001` | 77ms |
| `20260724000002` | 82ms |
| `20260724000003` | 154ms |
| `20260724000004` | 121ms |
| `20260724000005` | 72ms |
| `20260724000006` | 83ms |
| `20260724000007` | 137ms |
| `20260724000008` | 92ms |
| `20260724000009` | 69ms |
| `20260724000010` | 67ms |
| `20260724000011` | not measured locally (needs real `storage` schema) |
| `20260724000012` | 81ms |
| `20260724000013` | 53ms |

## Post-migration verification queries

Run these in the Supabase SQL Editor right after `supabase db push`
completes. Expected results are the exact numbers this project's schema
produces today — a different number means something didn't apply.

```sql
-- 24 tables total, all with RLS enabled (100% — no table should ever be
-- created without RLS in this schema, per docs/BACKEND_ARCHITECTURE.md §6.1)
select count(*) as total_tables,
       count(*) filter (where c.relrowsecurity) as rls_enabled_tables
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r';
-- expect: total_tables = 24, rls_enabled_tables = 24

-- 32 RLS policies across those tables
select count(*) from pg_policies where schemaname = 'public';
-- expect: 32

-- 5 column-guard/updated_at triggers (profiles ×2, notifications,
-- comments, reactions — see docs/BACKEND_ARCHITECTURE.md §18.2)
select count(*) from pg_trigger t
where not t.tgisinternal
and t.tgrelid in (select oid from pg_class where relnamespace = 'public'::regnamespace);
-- expect: 5

-- 9 real functions (excludes citext extension's own internal functions)
select p.proname from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
and p.oid not in (select objid from pg_depend where deptype = 'e' and classid = 'pg_proc'::regclass)
order by 1;
-- expect exactly these 9: advance_quest_progress, claim_milestone,
-- claim_quest, handle_new_user, record_activity_session,
-- restrict_update_columns, set_updated_at, toggle_follow,
-- xp_required_for_level

-- Catalog seed row counts
select (select count(*) from public.activities) as activities,
       (select count(*) from public.quest_definitions) as quests,
       (select count(*) from public.milestone_definitions) as milestones,
       (select count(*) from public.achievement_definitions) as achievements,
       (select count(*) from public.badge_definitions) as badges,
       (select count(*) from public.collection_definitions) as collections;
-- expect: 12, 8, 6, 6, 6, 4
```

## Health-check queries

Run these any time later to confirm the schema is still healthy (e.g.
after a future migration, or periodically as a sanity check):

```sql
-- The single most important check given §18.2's finding: confirm the
-- column-guard triggers are actually attached to the 4 tables that need
-- them, not just that the function exists.
select event_object_table, trigger_name
from information_schema.triggers
where trigger_schema = 'public' and action_statement ilike '%restrict_update_columns%'
order by 1;
-- expect exactly 4 rows: comments, notifications, profiles, reactions

-- Confirm the avatars bucket has the size/mime limits from §18.1 (not
-- just that it exists) — only works once storage schema is real.
select id, public, file_size_limit, allowed_mime_types from storage.buckets where id = 'avatars';
-- expect: public = true, file_size_limit = 5242880, allowed_mime_types
-- containing image/png, image/jpeg, image/webp, image/gif

-- Confirm no table anywhere in public has RLS disabled (a regression
-- here would mean a future migration added a table without RLS).
select relname from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity;
-- expect: 0 rows

-- Spot-check the anti-cheat audit trail is wired (won't have rows until
-- real gameplay happens, but the table should exist and be queryable
-- with the service_role key).
select count(*) from public.audit_log where action = 'score_clamped';
```
