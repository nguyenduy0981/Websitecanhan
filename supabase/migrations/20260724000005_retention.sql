-- Quest/milestone progress. Tables + RLS only — claim_quest()/
-- claim_milestone()/advance_quest_progress() live in
-- 20260724000012_functions.sql (they write notifications/journey_events/
-- feed_items/xp_ledger too). See docs/BACKEND_ARCHITECTURE.md §4.4.

create table public.quest_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  quest_id text not null references public.quest_definitions(id),
  period_key date not null,
  current_value integer not null default 0,
  claimed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, quest_id, period_key)
);

create table public.milestone_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  milestone_id text not null references public.milestone_definitions(id),
  reached_at timestamptz,
  claimed_at timestamptz,
  primary key (user_id, milestone_id)
);

alter table public.quest_progress enable row level security;
alter table public.milestone_progress enable row level security;

create policy "users can read their own quest progress"
  on public.quest_progress for select using (auth.uid() = user_id);
create policy "users can read their own milestone progress"
  on public.milestone_progress for select using (auth.uid() = user_id);

-- No client write policy — advancing/claiming always goes through the
-- security-definer functions in 20260724000012_functions.sql, since
-- claiming grants points/xp and must be validated (target reached,
-- not already claimed), not a raw row update.
