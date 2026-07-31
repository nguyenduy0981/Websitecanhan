-- Leaderboard rank-change snapshots. The "global, all-time" scope needs
-- no table at all (a plain `order by points desc` query on profiles) —
-- this table only backs RankChangeIcon's previousRank comparison, and
-- only gets populated once a scheduled job exists (see
-- docs/BACKEND_ARCHITECTURE.md §10 — deliberately not built yet, no real
-- traffic to snapshot). See §4.8.

create table public.leaderboard_rank_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  scope text not null check (scope in ('global', 'week', 'month', 'season')),
  season_id uuid references public.seasons(id),
  rank integer not null,
  points integer not null,
  captured_at timestamptz not null default now()
);
create index leaderboard_snapshots_scope_user_captured_idx
  on public.leaderboard_rank_snapshots (scope, user_id, captured_at desc);

alter table public.leaderboard_rank_snapshots enable row level security;

create policy "leaderboard_rank_snapshots are publicly readable"
  on public.leaderboard_rank_snapshots for select using (true);

-- No client write policy — only the future scheduled snapshot job
-- (running with the service_role key, which bypasses RLS entirely) ever
-- writes here.
