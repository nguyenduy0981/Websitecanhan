-- Notifications inbox + profile journey timeline.
-- See docs/BACKEND_ARCHITECTURE.md §4.7.

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('achievement', 'reward', 'friend', 'system')),
  title text not null,
  description text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_created_idx on public.notifications (user_id, created_at desc);

create table public.journey_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('joined', 'level-up', 'achievement', 'reward', 'quest', 'milestone', 'streak')),
  label text not null,
  occurred_at timestamptz not null default now()
);
create index journey_events_user_occurred_idx on public.journey_events (user_id, occurred_at desc);

alter table public.notifications enable row level security;
alter table public.journey_events enable row level security;

-- Private inbox: only the recipient reads it, and only marks their own
-- notifications read — no client INSERT policy, notifications are always
-- system-generated (never a user faking a notification into their own
-- inbox), via the functions in 20260724000012_functions.sql.
create policy "users can read their own notifications"
  on public.notifications for select using (auth.uid() = user_id);
create policy "users can mark their own notifications read"
  on public.notifications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- journey_events: public read. Profiles are already public-facing
-- (leaderboard/UserPreviewCard show other people's level/points), and a
-- future /profile/[username] route will need this same data for anyone's
-- profile — public read now avoids an RLS rework when that route ships.
-- No client INSERT — system-generated only.
create policy "journey_events are publicly readable" on public.journey_events for select using (true);
