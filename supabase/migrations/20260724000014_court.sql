-- Vô Tri Đồng Thuận (daily consensus poll) + Toà Án Vô Tri (the Court,
-- async version) — the MVP's two net-new Signature-Moment-adjacent
-- mechanics, per docs/VO_TRI_PRODUCT_BIBLE.md Part 3. One shared
-- `dilemmas` content catalog feeds both surfaces (Part 1.3's documented
-- merge: "one content catalog, two consumption surfaces").
--
-- Real MVP simplifications, named here rather than discovered under
-- deadline pressure (both already called out in the Product Bible):
-- Court trials resolve asynchronously (no realtime infra needed — a
-- generous answer window, order-independent reveal) and the verdict is a
-- lighthearted random decree between differing answers, not a computed
-- "fair" judgment (see submit_court_answer below).

create table public.dilemmas (
  id text primary key,
  prompt text not null,
  option_a text not null,
  option_b text not null,
  created_at timestamptz not null default now()
);

alter table public.dilemmas enable row level security;
create policy "dilemmas are publicly readable" on public.dilemmas for select using (true);

-- Real authored content (same status as activities.ts/quests.ts) —
-- mirrors src/vo-tri/court/dilemmas.ts exactly as of this writing.
insert into public.dilemmas (id, prompt, option_a, option_b) values
  ('nhac-cho-vs-nhac-nen', 'Đi ngủ mà không bật nhạc, hay nghe một bài lặp lại đến sáng?', 'Im lặng tuyệt đối', 'Một bài lặp mãi'),
  ('nhan-tin-truoc-vs-doi', 'Nhắn "đang làm gì đó" trước hay chờ người ta nhắn trước?', 'Nhắn trước', 'Chờ đến cùng'),
  ('an-com-nguoi-vs-mi-nong', 'Cơm nguội ngon hơn hay mì gói lúc nửa đêm ngon hơn?', 'Cơm nguội', 'Mì gói nửa đêm'),
  ('xem-spoil-vs-khong', 'Đọc spoil trước khi xem phim, hay thà chết cũng không đọc?', 'Đọc trước cho chắc', 'Thà chết không đọc'),
  ('bao-thuc-1-vs-10', 'Đặt đúng 1 báo thức hay đặt 10 cái cách nhau 5 phút?', 'Một cái, tin tưởng bản thân', 'Mười cái, không tin ai cả'),
  ('goi-dien-vs-nhan-tin', 'Có chuyện cần nói, gọi điện thẳng hay nhắn tin cả trang?', 'Gọi luôn cho nhanh', 'Nhắn tin cả trang'),
  ('to-vo-tri-vs-gia-nguy-hiem', 'Thà bị chê "vô tri" hay bị chê "nguy hiểm"?', 'Vô tri thì được', 'Nguy hiểm thì không'),
  ('xep-hang-vs-app', 'Xếp hàng mua đồ ăn hay đặt app đợi ship dù đắt hơn?', 'Xếp hàng tự đi', 'Đặt app cho lành'),
  ('sua-loi-ban-vs-lam-ngo', 'Bạn thân nói sai kiến thức trước mặt người khác, sửa ngay hay lờ đi?', 'Sửa ngay tại chỗ', 'Lờ đi, nói riêng sau'),
  ('ngu-nuong-vs-day-som', 'Được nghỉ, ngủ nướng đến trưa hay dậy sớm để "tận dụng ngày"?', 'Ngủ nướng đã đời', 'Dậy sớm cho đáng'),
  ('choi-chu-vs-choi-that', 'Trò chơi thắng thua, chơi cho vui hay chơi để thắng bằng mọi giá?', 'Chơi cho vui thôi', 'Thắng mới về'),
  ('an-truoc-vs-an-sau', 'Trên đĩa có món ngon nhất, ăn trước hay để dành ăn cuối?', 'Ăn trước cho sướng', 'Để dành ăn cuối'),
  ('reply-het-vs-reply-tuy-hung', 'Tin nhắn, reply hết theo thứ tự hay reply theo cái nào thích trước?', 'Theo thứ tự đàng hoàng', 'Theo hứng, kệ thứ tự'),
  ('du-lich-lich-trinh-vs-tuy-hung', 'Đi du lịch, lên lịch trình chi tiết hay đi tới đâu hay tới đó?', 'Lịch trình rõ ràng', 'Tới đâu hay tới đó')
on conflict (id) do update set
  prompt = excluded.prompt,
  option_a = excluded.option_a,
  option_b = excluded.option_b;

-- ---------------------------------------------------------------------
-- dilemma_votes: one vote per user per day, regardless of which
-- dilemma_id is passed — PK is (user_id, period_key), not (user_id,
-- dilemma_id), specifically so a client can't farm the reward by voting
-- on several different dilemma_ids in one day. period_key is the caller's
-- (server-computed) current_date, matching daily_activity_log's shape.
--
-- RLS is select-own-row only (private detail), not publicly readable —
-- unlike reactions/follows, an individual person's specific choice isn't
-- shown anywhere in the product; only the aggregate is, via
-- get_dilemma_consensus() below. Same "private detail, public aggregate"
-- split already used for xp_ledger (private) vs profiles.points (public).
-- ---------------------------------------------------------------------
create table public.dilemma_votes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  period_key date not null,
  dilemma_id text not null references public.dilemmas(id),
  choice text not null check (choice in ('a', 'b')),
  created_at timestamptz not null default now(),
  primary key (user_id, period_key)
);
create index dilemma_votes_dilemma_period_idx on public.dilemma_votes (dilemma_id, period_key);

alter table public.dilemma_votes enable row level security;
create policy "users can read their own dilemma votes"
  on public.dilemma_votes for select using (auth.uid() = user_id);
-- No INSERT policy — writes happen exclusively through vote_dilemma()
-- (security definer, below), same convention as xp_ledger/notifications.

-- ---------------------------------------------------------------------
-- court_trials / court_answers — Toà Án Vô Tri, async. A trial names an
-- initiator, a target, and a shared dilemma; each side answers blind
-- (court_answers is not readable by the other party until resolved — see
-- the SELECT policy below) within a 24h window.
-- ---------------------------------------------------------------------
create table public.court_trials (
  id uuid primary key default gen_random_uuid(),
  initiator_id uuid not null references public.profiles(id) on delete cascade,
  target_id uuid not null references public.profiles(id) on delete cascade,
  dilemma_id text not null references public.dilemmas(id),
  status text not null default 'pending' check (status in ('pending', 'resolved')),
  verdict text check (verdict in ('initiator', 'target', 'tie')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  check (initiator_id <> target_id)
);
create index court_trials_initiator_idx on public.court_trials (initiator_id, created_at desc);
create index court_trials_target_idx on public.court_trials (target_id, created_at desc);

create table public.court_answers (
  trial_id uuid not null references public.court_trials(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  choice text not null check (choice in ('a', 'b')),
  answered_at timestamptz not null default now(),
  primary key (trial_id, user_id)
);

alter table public.court_trials enable row level security;
alter table public.court_answers enable row level security;

-- Private to the two parties — a trial is a confrontation between two
-- specific people, not a public feed item. (The eventual Verdict card is
-- shareable by choice, client-side, not by making the row itself public.)
create policy "parties can read their own court trials"
  on public.court_trials for select
  using (auth.uid() = initiator_id or auth.uid() = target_id);
-- No INSERT/UPDATE policy — created by start_court_trial(), resolved by
-- submit_court_answer() (both security definer, below) only.

-- Blind by default: a party can always read their own answer, but can
-- only read the OTHER party's answer once the trial has actually
-- resolved — this is what makes "answer independently and blind" a real
-- server-enforced property instead of just a client-side convention.
create policy "parties can read answers once resolved, own answer always"
  on public.court_answers for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.court_trials t
      where t.id = court_answers.trial_id
        and t.status = 'resolved'
        and (t.initiator_id = auth.uid() or t.target_id = auth.uid())
    )
  );
-- No INSERT policy — writes happen exclusively through
-- submit_court_answer() (security definer, below).

-- xp_ledger.source and notifications.type both need a new tag for this
-- feature's writes — extending the existing check constraints rather than
-- introducing a parallel table, so every other read of those two tables
-- (private XP history, the notification inbox) keeps working unchanged.
alter table public.xp_ledger drop constraint xp_ledger_source_check;
alter table public.xp_ledger add constraint xp_ledger_source_check
  check (source in ('activity_session', 'quest_claim', 'milestone_claim', 'dilemma_vote'));

alter table public.notifications drop constraint notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type in ('achievement', 'reward', 'friend', 'system', 'court'));

-- ---------------------------------------------------------------------
-- get_dilemma_consensus — plain (not security definer) aggregate read.
-- Safe to expose directly: dilemma_votes' own RLS only lets a client read
-- ITS OWN row, so this is the only path to the real vote distribution —
-- deliberately public/anon-callable, since "what did everyone else pick"
-- is the entire point of Vô Tri Đồng Thuận's reveal and carries no
-- per-user information (grouped counts only, never individual choices).
-- ---------------------------------------------------------------------
create or replace function public.get_dilemma_consensus(p_dilemma_id text, p_period_key date)
returns table (choice text, vote_count bigint)
language sql
stable
security definer set search_path = public
as $$
  select choice, count(*) as vote_count
  from public.dilemma_votes
  where dilemma_id = p_dilemma_id and period_key = p_period_key
  group by choice;
$$;

grant execute on function public.get_dilemma_consensus to authenticated, anon;

-- ---------------------------------------------------------------------
-- vote_dilemma — records today's Vô Tri Đồng Thuận vote, awards a small
-- flat reward. Mirrors record_activity_session's economy-touching shape
-- (points/xp -> level recompute) but deliberately does NOT touch
-- current_streak/last_active_date/daily_activity_log or advance quest
-- progress — this is a lighter, separate daily habit, not a second path
-- into the same streak/quest machinery record_activity_session already
-- owns; keeping the two independent avoids double-counting one calendar
-- day's "activity" across two unrelated triggers.
-- ---------------------------------------------------------------------
create or replace function public.vote_dilemma(p_dilemma_id text, p_choice text)
returns table (awarded_points integer, awarded_xp integer, leveled_up boolean, new_level integer)
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_today date := current_date;
  v_awarded_points constant integer := 8;
  v_awarded_xp constant integer := 5;
  v_old_level integer;
  v_new_level integer;
  v_new_total_xp bigint;
begin
  if v_user_id is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;
  if p_choice not in ('a', 'b') then
    raise exception 'INVALID_CHOICE';
  end if;
  if not exists (select 1 from public.dilemmas where id = p_dilemma_id) then
    raise exception 'UNKNOWN_DILEMMA';
  end if;

  -- The PK (user_id, period_key) is the real atomic anti-farming guard —
  -- see the table comment above. A pre-check SELECT alone wouldn't be
  -- enough under concurrency (same class of race documented on
  -- claim_quest/claim_milestone/toggle_follow in 20260724000012_functions.sql).
  insert into public.dilemma_votes (user_id, period_key, dilemma_id, choice)
  values (v_user_id, v_today, p_dilemma_id, p_choice)
  on conflict (user_id, period_key) do nothing;
  if not found then
    raise exception 'ALREADY_VOTED_TODAY';
  end if;

  insert into public.xp_ledger (user_id, source, source_id, points, xp)
  values (v_user_id, 'dilemma_vote', null, v_awarded_points, v_awarded_xp);

  select level into v_old_level from public.profiles where id = v_user_id;

  -- See the matching comment in record_activity_session
  -- (20260724000012_functions.sql).
  perform set_config('vo_tri.bypass_column_guard', 'on', true);

  update public.profiles p set
    points = p.points + v_awarded_points,
    total_xp_earned = p.total_xp_earned + v_awarded_xp
  where p.id = v_user_id
  returning total_xp_earned into v_new_total_xp;

  v_new_level := 1;
  while v_new_total_xp >= (
    select coalesce(sum(public.xp_required_for_level(lvl)), 0) from generate_series(1, v_new_level) as lvl
  ) loop
    v_new_level := v_new_level + 1;
  end loop;
  v_new_level := greatest(1, v_new_level - 1);

  update public.profiles p set
    level = v_new_level,
    xp = v_new_total_xp - (select coalesce(sum(public.xp_required_for_level(lvl)), 0) from generate_series(1, v_new_level - 1) as lvl),
    xp_to_next = public.xp_required_for_level(v_new_level)
  where p.id = v_user_id;

  if v_new_level > v_old_level then
    insert into public.journey_events (user_id, type, label) values (v_user_id, 'level-up', 'Đã lên cấp ' || v_new_level);
    insert into public.notifications (user_id, type, title, description)
    values (v_user_id, 'reward', 'Lên cấp!', 'Bạn vừa đạt cấp độ ' || v_new_level || '.');
  end if;

  return query select v_awarded_points, v_awarded_xp, (v_new_level > v_old_level), v_new_level;
end;
$$;

revoke all on function public.vote_dilemma from public;
grant execute on function public.vote_dilemma to authenticated;

-- ---------------------------------------------------------------------
-- start_court_trial — creates a trial + notifies the target. No reward
-- attached (deliberate: Toà Án is a pure social/identity mechanic, not
-- part of the economy — keeping it reward-free avoids a second anti-cheat
-- surface for a mechanic that doesn't need one), so a plain security-
-- definer function is enough; no ceiling-clamp logic required.
-- ---------------------------------------------------------------------
create or replace function public.start_court_trial(p_target_id uuid, p_dilemma_id text)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_trial_id uuid;
begin
  if v_user_id is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;
  if v_user_id = p_target_id then
    raise exception 'CANNOT_CHALLENGE_SELF';
  end if;
  if not exists (select 1 from public.profiles where id = p_target_id) then
    raise exception 'UNKNOWN_TARGET';
  end if;
  if not exists (select 1 from public.dilemmas where id = p_dilemma_id) then
    raise exception 'UNKNOWN_DILEMMA';
  end if;

  insert into public.court_trials (initiator_id, target_id, dilemma_id, expires_at)
  values (v_user_id, p_target_id, p_dilemma_id, now() + interval '24 hours')
  returning id into v_trial_id;

  insert into public.notifications (user_id, type, title, description)
  select p_target_id, 'court', 'Bạn bị đưa ra Toà Vô Tri', p.display_name || ' vừa mời bạn vào một phiên xử.'
  from public.profiles p where p.id = v_user_id;

  return v_trial_id;
end;
$$;

revoke all on function public.start_court_trial from public;
grant execute on function public.start_court_trial to authenticated;

-- ---------------------------------------------------------------------
-- submit_court_answer — records one party's blind answer; once both
-- sides are in, computes and stores the verdict and notifies both.
-- ---------------------------------------------------------------------
create or replace function public.submit_court_answer(p_trial_id uuid, p_choice text)
returns table (status text, verdict text, my_choice text, other_choice text)
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_trial record;
  v_other_id uuid;
  v_other_choice text;
  v_verdict text;
begin
  if v_user_id is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;
  if p_choice not in ('a', 'b') then
    raise exception 'INVALID_CHOICE';
  end if;

  select * into v_trial from public.court_trials where id = p_trial_id;
  if not found then
    raise exception 'UNKNOWN_TRIAL';
  end if;
  if v_user_id <> v_trial.initiator_id and v_user_id <> v_trial.target_id then
    raise exception 'NOT_A_PARTY_TO_TRIAL';
  end if;
  if v_trial.status = 'resolved' then
    raise exception 'TRIAL_ALREADY_RESOLVED';
  end if;
  if v_trial.expires_at < now() then
    raise exception 'TRIAL_EXPIRED';
  end if;

  -- The primary key (trial_id, user_id) is the real atomic guard against a
  -- double-answer race — same class of fix as claim_quest/toggle_follow
  -- (20260724000012_functions.sql). ON CONFLICT DO NOTHING + FOUND makes
  -- the race loser a clean error instead of a raw unique-violation.
  insert into public.court_answers (trial_id, user_id, choice)
  values (p_trial_id, v_user_id, p_choice)
  on conflict (trial_id, user_id) do nothing;
  if not found then
    raise exception 'ALREADY_ANSWERED';
  end if;

  v_other_id := case when v_user_id = v_trial.initiator_id then v_trial.target_id else v_trial.initiator_id end;
  select choice into v_other_choice from public.court_answers where trial_id = p_trial_id and user_id = v_other_id;

  if v_other_choice is null then
    return query select 'pending'::text, null::text, p_choice, null::text;
    return;
  end if;

  -- Verdict is deliberately a lighthearted decree, not a fair analysis:
  -- same answer -> tie; different answers -> a random pick of who's
  -- declared "more vô tri" this trial. A future upgrade could instead
  -- side with whoever's answer bucks that day's Vô Tri Đồng Thuận
  -- majority, once real vote-distribution data exists to make that
  -- meaningful — see docs/VO_TRI_PRODUCT_BIBLE.md Part 2, Toà Án Vô Tri.
  if p_choice = v_other_choice then
    v_verdict := 'tie';
  elsif random() < 0.5 then
    v_verdict := 'initiator';
  else
    v_verdict := 'target';
  end if;

  update public.court_trials set status = 'resolved', verdict = v_verdict where id = p_trial_id;

  insert into public.notifications (user_id, type, title, description) values
    (v_trial.initiator_id, 'court', 'Toà đã tuyên án', 'Phiên xử của bạn đã có kết quả.'),
    (v_trial.target_id, 'court', 'Toà đã tuyên án', 'Phiên xử của bạn đã có kết quả.');

  return query select 'resolved'::text, v_verdict, p_choice, v_other_choice;
end;
$$;

revoke all on function public.submit_court_answer from public;
grant execute on function public.submit_court_answer to authenticated;
