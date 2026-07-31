-- Catalog mirror tables — real content stays authored in frontend code
-- (activities.ts, quests.ts, milestones.ts, ...); these tables exist only
-- so per-user progress tables can have real foreign-key integrity. Public
-- read, no client write (catalog changes only via a new migration).
-- See docs/BACKEND_ARCHITECTURE.md §4.2.

create table public.activities (
  id text primary key,
  name text not null,
  category text not null,
  difficulty text not null check (difficulty in ('de', 'vua', 'kho')),
  reward integer not null,
  xp integer not null,
  daily_limit integer,
  cooldown_minutes integer,
  is_coming_soon boolean not null default false,
  updated_at timestamptz not null default now()
);

create table public.quest_definitions (
  id text primary key,
  cadence text not null check (cadence in ('daily', 'weekly')),
  target integer not null,
  reward integer not null,
  xp integer not null
);

create table public.milestone_definitions (
  id text primary key,
  metric text not null check (metric in ('streak', 'activitiesPlayed')),
  threshold integer not null
);

create table public.achievement_definitions (
  id text primary key,
  name text not null,
  description text not null
);

create table public.badge_definitions (
  id text primary key,
  name text not null,
  description text not null,
  rarity text not null check (rarity in ('common', 'rare', 'special'))
);

create table public.collection_definitions (
  id text primary key,
  name text not null,
  kind text not null check (kind in ('skin', 'title', 'item'))
);

create table public.seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null
);

alter table public.activities enable row level security;
alter table public.quest_definitions enable row level security;
alter table public.milestone_definitions enable row level security;
alter table public.achievement_definitions enable row level security;
alter table public.badge_definitions enable row level security;
alter table public.collection_definitions enable row level security;
alter table public.seasons enable row level security;

create policy "activities are publicly readable" on public.activities for select using (true);
create policy "quest_definitions are publicly readable" on public.quest_definitions for select using (true);
create policy "milestone_definitions are publicly readable" on public.milestone_definitions for select using (true);
create policy "achievement_definitions are publicly readable" on public.achievement_definitions for select using (true);
create policy "badge_definitions are publicly readable" on public.badge_definitions for select using (true);
create policy "collection_definitions are publicly readable" on public.collection_definitions for select using (true);
create policy "seasons are publicly readable" on public.seasons for select using (true);

-- Seed data — mirrors src/vo-tri/explore/activities.ts exactly as of this
-- writing. Idempotent: re-running after editing the catalog code just
-- upserts. See docs/BACKEND_ARCHITECTURE.md §8.3 for the sync convention.
insert into public.activities (id, name, category, difficulty, reward, xp, daily_limit, cooldown_minutes, is_coming_soon) values
  ('diem-danh', 'Điểm Danh Hôm Nay', 'nhanh', 'de', 15, 10, 1, null, false),
  ('vong-quay-vo-tri', 'Vòng Quay Vô Tri', 'may-man', 'de', 30, 5, 3, 240, false),
  ('rut-the-so-phan', 'Rút Thẻ Số Phận', 'may-man', 'de', 18, 5, 5, 60, false),
  ('thu-thach-60-giay', 'Thử Thách 60 Giây', 'thu-thach', 'vua', 35, 20, 3, 30, false),
  ('do-vui-vo-tri', 'Đố Vui Vô Tri', 'thu-thach', 'vua', 25, 15, 5, null, false),
  ('meme-generator', 'Máy Chế Meme', 'giai-tri', 'de', 15, 10, null, null, false),
  ('cau-chuyen-ngau-nhien', 'Chuyện Ngẫu Nhiên', 'giai-tri', 'de', 15, 10, null, null, false),
  ('doan-cam-xuc-mascot', 'Đoán Cảm Xúc Mascot', 'giai-tri', 'de', 10, 5, 5, null, false),
  ('go-nhanh-vo-tri', 'Gõ Nhanh Vô Tri', 'nhanh', 'vua', 20, 10, 3, null, false),
  ('dau-truong-vo-tri', 'Đấu Trường Vô Tri', 'thu-thach', 'de', 0, 0, null, null, true),
  ('nuoi-thu-vo-tri', 'Nuôi Thú Vô Tri', 'giai-tri', 'de', 0, 0, null, null, true),
  ('cho-do-vo-tri', 'Chợ Đồ Vô Tri', 'giai-tri', 'de', 0, 0, null, null, true)
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  difficulty = excluded.difficulty,
  reward = excluded.reward,
  xp = excluded.xp,
  daily_limit = excluded.daily_limit,
  cooldown_minutes = excluded.cooldown_minutes,
  is_coming_soon = excluded.is_coming_soon,
  updated_at = now();

-- Mirrors src/vo-tri/retention/quests.ts (core dailies + bonus pool + weekly goals).
insert into public.quest_definitions (id, cadence, target, reward, xp) values
  ('daily-check-in', 'daily', 1, 15, 10),
  ('daily-play-two', 'daily', 2, 20, 15),
  ('daily-earn-points', 'daily', 50, 25, 10),
  ('daily-try-new', 'daily', 1, 20, 20),
  ('daily-react', 'daily', 1, 10, 5),
  ('weekly-play-ten', 'weekly', 10, 100, 80),
  ('weekly-streak', 'weekly', 7, 150, 100),
  ('weekly-earn-points', 'weekly', 300, 120, 90)
on conflict (id) do update set
  cadence = excluded.cadence,
  target = excluded.target,
  reward = excluded.reward,
  xp = excluded.xp;

-- Mirrors src/vo-tri/retention/milestones.ts.
insert into public.milestone_definitions (id, metric, threshold) values
  ('streak-3', 'streak', 3),
  ('streak-7', 'streak', 7),
  ('streak-30', 'streak', 30),
  ('played-10', 'activitiesPlayed', 10),
  ('played-50', 'activitiesPlayed', 50),
  ('played-100', 'activitiesPlayed', 100)
on conflict (id) do update set
  metric = excluded.metric,
  threshold = excluded.threshold;
