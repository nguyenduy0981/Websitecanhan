-- Per-user unlocks for Achievement/Badge/Collection — kept as three
-- separate tables mirroring the three distinct frontend types/sections
-- (AchievementSection, BadgeCollection, CollectionShowcase) rather than
-- one generic "unlockables" table. See docs/BACKEND_ARCHITECTURE.md §4.5.

create table public.user_achievements (
  user_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id text not null references public.achievement_definitions(id),
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

create table public.user_badges (
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_id text not null references public.badge_definitions(id),
  unlocked_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

create table public.user_collection_items (
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_id text not null references public.collection_definitions(id),
  unlocked_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

alter table public.user_achievements enable row level security;
alter table public.user_badges enable row level security;
alter table public.user_collection_items enable row level security;

-- Public read — these are profile flair, shown on anyone's public profile
-- (AchievementSection/BadgeCollection/CollectionShowcase), same reasoning
-- as profiles itself being publicly readable.
create policy "user_achievements are publicly readable" on public.user_achievements for select using (true);
create policy "user_badges are publicly readable" on public.user_badges for select using (true);
create policy "user_collection_items are publicly readable" on public.user_collection_items for select using (true);

-- No client write policy anywhere — the system grants these (via the
-- security-definer functions in 20260724000012_functions.sql), never the
-- user directly.
