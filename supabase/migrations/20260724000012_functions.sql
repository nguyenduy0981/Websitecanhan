-- Every security-definer function that needs tables from more than one
-- earlier migration lives here, created last so nothing forward-references
-- a table that doesn't exist yet. See docs/BACKEND_ARCHITECTURE.md §6.2.

-- ---------------------------------------------------------------------
-- advance_quest_progress: called internally by record_activity_session.
-- Not exposed to `authenticated` directly (no grant below) — advancing
-- progress is a side effect of a real session, never a standalone action
-- a client should be able to trigger arbitrarily.
-- ---------------------------------------------------------------------
create or replace function public.advance_quest_progress(
  p_user_id uuid,
  p_activity_id text,
  p_awarded_points integer,
  p_is_first_session_for_activity boolean
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_today date := current_date;
  v_week_start date := date_trunc('week', v_today)::date;
  v_quest record;
  v_current_streak integer;
begin
  for v_quest in select * from public.quest_definitions loop
    if v_quest.id = 'daily-check-in' and p_activity_id = 'diem-danh' then
      insert into public.quest_progress (user_id, quest_id, period_key, current_value)
      values (p_user_id, v_quest.id, v_today, 1)
      on conflict (user_id, quest_id, period_key) do update
        set current_value = least(public.quest_progress.current_value + 1, v_quest.target),
            updated_at = now();

    elsif v_quest.id = 'daily-play-two' then
      insert into public.quest_progress (user_id, quest_id, period_key, current_value)
      values (p_user_id, v_quest.id, v_today, 1)
      on conflict (user_id, quest_id, period_key) do update
        set current_value = least(public.quest_progress.current_value + 1, v_quest.target),
            updated_at = now();

    elsif v_quest.id = 'weekly-play-ten' then
      insert into public.quest_progress (user_id, quest_id, period_key, current_value)
      values (p_user_id, v_quest.id, v_week_start, 1)
      on conflict (user_id, quest_id, period_key) do update
        set current_value = least(public.quest_progress.current_value + 1, v_quest.target),
            updated_at = now();

    elsif v_quest.id = 'daily-earn-points' then
      insert into public.quest_progress (user_id, quest_id, period_key, current_value)
      values (p_user_id, v_quest.id, v_today, p_awarded_points)
      on conflict (user_id, quest_id, period_key) do update
        set current_value = least(public.quest_progress.current_value + p_awarded_points, v_quest.target),
            updated_at = now();

    elsif v_quest.id = 'weekly-earn-points' then
      insert into public.quest_progress (user_id, quest_id, period_key, current_value)
      values (p_user_id, v_quest.id, v_week_start, p_awarded_points)
      on conflict (user_id, quest_id, period_key) do update
        set current_value = least(public.quest_progress.current_value + p_awarded_points, v_quest.target),
            updated_at = now();

    elsif v_quest.id = 'daily-try-new' and p_is_first_session_for_activity then
      insert into public.quest_progress (user_id, quest_id, period_key, current_value)
      values (p_user_id, v_quest.id, v_today, 1)
      on conflict (user_id, quest_id, period_key) do update
        set current_value = v_quest.target,
            updated_at = now();

    elsif v_quest.id = 'weekly-streak' then
      select current_streak into v_current_streak from public.profiles where id = p_user_id;
      insert into public.quest_progress (user_id, quest_id, period_key, current_value)
      values (p_user_id, v_quest.id, v_week_start, least(v_current_streak, v_quest.target))
      on conflict (user_id, quest_id, period_key) do update
        set current_value = greatest(public.quest_progress.current_value, least(v_current_streak, v_quest.target)),
            updated_at = now();
    end if;
    -- 'daily-react' is intentionally not advanced here — it advances from
    -- the reaction path (not yet built; see docs/BACKEND_ARCHITECTURE.md
    -- §10, reactions target activity feed items which have no real writer
    -- action in the frontend yet either).
  end loop;
end;
$$;

-- ---------------------------------------------------------------------
-- record_activity_session — see docs/BACKEND_ARCHITECTURE.md §7 for the
-- anti-cheat design this implements (ceiling clamp, not exact replay).
-- ---------------------------------------------------------------------
create or replace function public.record_activity_session(
  p_activity_id text,
  p_kind text,
  p_client_reported_points integer,
  p_client_reported_xp integer,
  p_combo_max integer default 0,
  p_duration_seconds integer default 0
)
returns table (awarded_points integer, awarded_xp integer, leveled_up boolean, new_level integer)
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_activity record;
  v_awarded_points integer;
  v_awarded_xp integer;
  v_session_id uuid;
  v_today date := current_date;
  v_recent_count integer;
  v_last_session timestamptz;
  v_is_first_session boolean;
  v_old_level integer;
  v_new_level integer;
  v_new_total_xp bigint;
  v_new_streak integer;
  v_last_active date;
begin
  if v_user_id is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  select * into v_activity from public.activities where id = p_activity_id;
  if not found then
    raise exception 'UNKNOWN_ACTIVITY';
  end if;

  if v_activity.daily_limit is not null then
    select count(*) into v_recent_count
      from public.activity_sessions
      where user_id = v_user_id and activity_id = p_activity_id and created_at >= v_today;
    if v_recent_count >= v_activity.daily_limit then
      raise exception 'DAILY_LIMIT_EXCEEDED';
    end if;
  end if;

  if v_activity.cooldown_minutes is not null then
    select max(created_at) into v_last_session
      from public.activity_sessions
      where user_id = v_user_id and activity_id = p_activity_id;
    if v_last_session is not null and v_last_session + (v_activity.cooldown_minutes || ' minutes')::interval > now() then
      raise exception 'COOLDOWN_ACTIVE';
    end if;
  end if;

  select not exists (
    select 1 from public.activity_sessions where user_id = v_user_id and activity_id = p_activity_id
  ) into v_is_first_session;

  v_awarded_points := least(greatest(p_client_reported_points, 0), greatest(v_activity.reward, 1) * 3);
  v_awarded_xp := least(greatest(p_client_reported_xp, 0), greatest(v_activity.xp, 1) * 3);

  if p_client_reported_points > v_awarded_points or p_client_reported_xp > v_awarded_xp then
    insert into public.audit_log (actor_id, action, target_type, target_id, metadata)
    values (v_user_id, 'score_clamped', 'activity', p_activity_id, jsonb_build_object(
      'clientReportedPoints', p_client_reported_points,
      'clientReportedXp', p_client_reported_xp,
      'awardedPoints', v_awarded_points,
      'awardedXp', v_awarded_xp
    ));
  end if;

  insert into public.activity_sessions (
    user_id, activity_id, kind, client_reported_points, awarded_points, awarded_xp, combo_max, duration_seconds
  ) values (
    v_user_id, p_activity_id, p_kind, p_client_reported_points, v_awarded_points, v_awarded_xp, p_combo_max, p_duration_seconds
  ) returning id into v_session_id;

  insert into public.xp_ledger (user_id, source, source_id, points, xp)
  values (v_user_id, 'activity_session', v_session_id, v_awarded_points, v_awarded_xp);

  insert into public.daily_activity_log (user_id, activity_date)
  values (v_user_id, v_today)
  on conflict (user_id, activity_date) do nothing;

  select level, last_active_date into v_old_level, v_last_active from public.profiles where id = v_user_id;

  v_new_streak := case
    when v_last_active = v_today then (select current_streak from public.profiles where id = v_user_id)
    when v_last_active = v_today - 1 then (select current_streak from public.profiles where id = v_user_id) + 1
    else 1
  end;

  update public.profiles p set
    points = p.points + v_awarded_points,
    total_xp_earned = p.total_xp_earned + v_awarded_xp,
    total_activities_played = p.total_activities_played + 1,
    total_active_days = case when v_last_active is distinct from v_today then p.total_active_days + 1 else p.total_active_days end,
    current_streak = v_new_streak,
    longest_streak = greatest(p.longest_streak, v_new_streak),
    last_active_date = v_today
  where p.id = v_user_id
  returning total_xp_earned into v_new_total_xp;

  -- Recompute level from the new lifetime XP total using the curve in
  -- xp_required_for_level(). A simple ascending loop is fine here — level
  -- counts are small (tens, not thousands), this runs once per session.
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
    insert into public.feed_items (actor_id, event_type, text)
    select v_user_id, 'level_up', p.display_name || ' vừa đạt cấp độ ' || v_new_level
    from public.profiles p where p.id = v_user_id;
  end if;

  perform public.advance_quest_progress(v_user_id, p_activity_id, v_awarded_points, v_is_first_session);

  return query select v_awarded_points, v_awarded_xp, (v_new_level > v_old_level), v_new_level;
end;
$$;

revoke all on function public.record_activity_session from public;
grant execute on function public.record_activity_session to authenticated;

-- ---------------------------------------------------------------------
-- claim_quest — validates target reached + not already claimed, grants
-- reward/xp, marks claimed_at.
-- ---------------------------------------------------------------------
create or replace function public.claim_quest(p_quest_id text, p_period_key date)
returns table (points integer, xp integer, leveled_up boolean, new_level integer)
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_progress record;
  v_quest record;
  v_old_level integer;
  v_new_level integer;
  v_new_total_xp bigint;
begin
  if v_user_id is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  select * into v_quest from public.quest_definitions where id = p_quest_id;
  if not found then
    raise exception 'UNKNOWN_QUEST';
  end if;

  select * into v_progress from public.quest_progress
    where user_id = v_user_id and quest_id = p_quest_id and period_key = p_period_key;
  if not found or v_progress.current_value < v_quest.target then
    raise exception 'QUEST_NOT_COMPLETE';
  end if;
  if v_progress.claimed_at is not null then
    raise exception 'QUEST_ALREADY_CLAIMED';
  end if;

  update public.quest_progress set claimed_at = now()
    where user_id = v_user_id and quest_id = p_quest_id and period_key = p_period_key;

  insert into public.xp_ledger (user_id, source, source_id, points, xp) values (v_user_id, 'quest_claim', null, v_quest.reward, v_quest.xp);

  select level into v_old_level from public.profiles where id = v_user_id;

  update public.profiles p set
    points = p.points + v_quest.reward,
    total_xp_earned = p.total_xp_earned + v_quest.xp
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

  insert into public.journey_events (user_id, type, label) values (v_user_id, 'quest', 'Hoàn thành nhiệm vụ');
  insert into public.feed_items (actor_id, event_type, text)
  select v_user_id, 'quest_claim', p.display_name || ' vừa hoàn thành một nhiệm vụ'
  from public.profiles p where p.id = v_user_id;

  if v_new_level > v_old_level then
    insert into public.journey_events (user_id, type, label) values (v_user_id, 'level-up', 'Đã lên cấp ' || v_new_level);
    insert into public.notifications (user_id, type, title, description)
    values (v_user_id, 'reward', 'Lên cấp!', 'Bạn vừa đạt cấp độ ' || v_new_level || '.');
  end if;

  return query select v_quest.reward, v_quest.xp, (v_new_level > v_old_level), v_new_level;
end;
$$;

revoke all on function public.claim_quest from public;
grant execute on function public.claim_quest to authenticated;

-- ---------------------------------------------------------------------
-- claim_milestone — "reached" is derived from profiles counters at claim
-- time (see docs/BACKEND_ARCHITECTURE.md §4.4), not stored separately.
-- ---------------------------------------------------------------------
create or replace function public.claim_milestone(p_milestone_id text)
returns table (points integer, xp integer)
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_milestone record;
  v_profile record;
  v_current_value integer;
  v_already_claimed timestamptz;
begin
  if v_user_id is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  select * into v_milestone from public.milestone_definitions where id = p_milestone_id;
  if not found then
    raise exception 'UNKNOWN_MILESTONE';
  end if;

  select * into v_profile from public.profiles where id = v_user_id;

  v_current_value := case v_milestone.metric
    when 'streak' then v_profile.current_streak
    when 'activitiesPlayed' then v_profile.total_activities_played
  end;

  if v_current_value < v_milestone.threshold then
    raise exception 'MILESTONE_NOT_REACHED';
  end if;

  select claimed_at into v_already_claimed from public.milestone_progress
    where user_id = v_user_id and milestone_id = p_milestone_id;
  if v_already_claimed is not null then
    raise exception 'MILESTONE_ALREADY_CLAIMED';
  end if;

  insert into public.milestone_progress (user_id, milestone_id, reached_at, claimed_at)
  values (v_user_id, p_milestone_id, now(), now())
  on conflict (user_id, milestone_id) do update set claimed_at = now(), reached_at = coalesce(public.milestone_progress.reached_at, now());

  -- Milestones award a flat, generous bonus proportional to their
  -- threshold rather than a per-milestone hand-authored reward table —
  -- keeps this function simple; revisit with real per-milestone rewards
  -- once milestones actually ship to a real route.
  insert into public.xp_ledger (user_id, source, source_id, points, xp)
  values (v_user_id, 'milestone_claim', null, v_milestone.threshold * 2, v_milestone.threshold);

  update public.profiles set
    points = points + v_milestone.threshold * 2,
    total_xp_earned = total_xp_earned + v_milestone.threshold
  where id = v_user_id;

  insert into public.journey_events (user_id, type, label) values (v_user_id, 'milestone', 'Đạt milestone: ' || p_milestone_id);
  insert into public.feed_items (actor_id, event_type, text)
  select v_user_id, 'milestone', p.display_name || ' vừa đạt một milestone mới'
  from public.profiles p where p.id = v_user_id;

  return query select v_milestone.threshold * 2, v_milestone.threshold;
end;
$$;

revoke all on function public.claim_milestone from public;
grant execute on function public.claim_milestone to authenticated;

-- ---------------------------------------------------------------------
-- toggle_follow — simple enough to not need heavy validation, kept as an
-- RPC (rather than raw client insert/delete on `follows`) so a future
-- rate-limit/notification-on-follow can be added in one place.
-- ---------------------------------------------------------------------
create or replace function public.toggle_follow(p_target_id uuid)
returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_now_following boolean;
begin
  if v_user_id is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;
  if v_user_id = p_target_id then
    raise exception 'CANNOT_FOLLOW_SELF';
  end if;

  if exists (select 1 from public.follows where follower_id = v_user_id and followee_id = p_target_id) then
    delete from public.follows where follower_id = v_user_id and followee_id = p_target_id;
    v_now_following := false;
  else
    insert into public.follows (follower_id, followee_id) values (v_user_id, p_target_id);
    v_now_following := true;
    insert into public.notifications (user_id, type, title, description)
    select p_target_id, 'friend', 'Có người theo dõi bạn', p.display_name || ' vừa theo dõi bạn.'
    from public.profiles p where p.id = v_user_id;
  end if;

  return v_now_following;
end;
$$;

revoke all on function public.toggle_follow from public;
grant execute on function public.toggle_follow to authenticated;
