-- Gameplay session recording + the reward economy's append-only ledger.
-- Tables + RLS only — record_activity_session() lives in
-- 20260724000012_functions.sql since it also writes to notifications/
-- journey_events/audit_log, which don't exist until later migrations.
-- See docs/BACKEND_ARCHITECTURE.md §4.3 and §7 (anti-cheat).

create table public.activity_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  activity_id text not null references public.activities(id),
  kind text not null check (kind in ('win', 'lose', 'complete', 'timeout', 'abandoned')),
  client_reported_points integer not null default 0,
  awarded_points integer not null,
  awarded_xp integer not null,
  combo_max integer not null default 0,
  duration_seconds integer not null default 0,
  created_at timestamptz not null default now()
);
create index activity_sessions_user_created_idx on public.activity_sessions (user_id, created_at desc);
create index activity_sessions_user_activity_created_idx on public.activity_sessions (user_id, activity_id, created_at desc);

create table public.daily_activity_log (
  user_id uuid not null references public.profiles(id) on delete cascade,
  activity_date date not null,
  primary key (user_id, activity_date)
);

create table public.xp_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  source text not null check (source in ('activity_session', 'quest_claim', 'milestone_claim')),
  source_id uuid,
  points integer not null default 0,
  xp integer not null default 0,
  created_at timestamptz not null default now()
);
create index xp_ledger_user_created_idx on public.xp_ledger (user_id, created_at desc);

alter table public.activity_sessions enable row level security;
alter table public.daily_activity_log enable row level security;
alter table public.xp_ledger enable row level security;

-- Private: raw session/ledger detail is nobody else's business. The public
-- aggregate counters (profiles.points/level/total_activities_played) are
-- what the rest of the product actually shows to other users.
create policy "users can read their own activity sessions"
  on public.activity_sessions for select using (auth.uid() = user_id);
create policy "users can read their own daily activity log"
  on public.daily_activity_log for select using (auth.uid() = user_id);
create policy "users can read their own xp ledger"
  on public.xp_ledger for select using (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policy for `authenticated` on any of the three
-- tables above — every write happens exclusively through
-- record_activity_session() (20260724000012_functions.sql, security
-- definer), never a raw client insert. That function, not the ceiling
-- math alone, is what actually enforces the anti-cheat design in §7.
