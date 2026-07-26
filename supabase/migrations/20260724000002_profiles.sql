-- profiles: 1:1 extension of auth.users. See docs/BACKEND_ARCHITECTURE.md §4.1.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username citext unique not null,
  display_name text not null,
  avatar_url text,
  tagline text,
  points integer not null default 0,
  total_xp_earned bigint not null default 0,
  level integer not null default 1,
  xp integer not null default 0,
  xp_to_next integer not null default 50,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_active_date date,
  total_active_days integer not null default 0,
  total_activities_played integer not null default 0,
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Real production risk closed here (not just documented): the game/reward
-- economy's real "leaderboard, order by points desc" query, plus the
-- `gt("points", ...)` lookups behind MyPosition/RankChange, had no index
-- to run against — `points` was never indexed, only the PK (`id`). Every
-- one of those becomes a full-table sequential scan the moment there's
-- real traffic. See docs/BACKEND_ARCHITECTURE.md §18.1.
create index profiles_points_idx on public.profiles (points desc);

-- See restrict_update_columns() in 20260724000001_extensions_and_helpers.sql
-- for why this is required at all: without it, "users can update their own
-- profile" below would also let a client directly overwrite points/xp/
-- level/streak counters, bypassing the entire security-definer-only
-- economy. avatar_url isn't wired to any real upload flow yet (Storage
-- exists per 20260724000011_storage.sql, but EditProfileSheet doesn't call
-- it yet — see docs/PROJECT_HANDOFF.md §12) but is included now so that
-- flow doesn't need a second migration just to widen this allow-list.
create trigger profiles_restrict_update_columns
  before update on public.profiles
  for each row execute function public.restrict_update_columns('display_name', 'tagline', 'avatar_url', 'updated_at');

alter table public.profiles enable row level security;

-- Public profile read — the whole product (leaderboard, comments, feed)
-- shows other users' points/level/badges, so profiles are public by design.
create policy "profiles are publicly readable"
  on public.profiles for select
  using (true);

-- Only the owner can update their own profile; no client INSERT/DELETE
-- policy at all — creation is exclusively the handle_new_user trigger
-- below. This RLS policy alone only gates *which row*; see
-- restrict_update_columns() above for what actually gates *which columns*.
create policy "users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create a profile row when a new auth.users row appears.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data->>'display_name', 'Người Vô Tri Mới')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
