-- Extensions + shared helper functions used by every later migration.
-- citext: case-insensitive `profiles.username` (see 000002).
create extension if not exists citext;

-- Generic "touch updated_at" trigger, reused by any table that has the column.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- XP curve: how much XP is required to complete a given level.
-- v1 tunable constant — centralized here so balancing the curve later is
-- a one-function change, not a hunt through every place XP is granted.
create or replace function public.xp_required_for_level(p_level integer)
returns integer
language sql
immutable
as $$
  select greatest(1, round(50 * power(p_level, 1.6)))::integer;
$$;

-- ---------------------------------------------------------------------
-- restrict_update_columns — production-hardening find: an RLS policy
-- like "users can update their own profile" (using auth.uid() = id) only
-- gates *which row* a client may touch, never *which columns*. As
-- written, that policy alone would let a client call the Supabase client
-- directly (bypassing the Next.js app entirely) and do
-- `update profiles set points = 999999, level = 100 where id = <self>` —
-- a full anti-cheat bypass of the ceiling-clamped, security-definer-only
-- economy documented in §7, since points/xp/level are meant to change
-- only through record_activity_session/claim_quest/claim_milestone.
-- Same gap on notifications (title/description, not just read_at),
-- comments (body, not just deleted_at), and reactions (target_type/
-- target_id, not just reaction_id).
--
-- Attached as `before update ... execute function
-- restrict_update_columns('allowed_col_1', 'allowed_col_2', ...)`, this
-- rejects the update if *any* column outside the allow-list actually
-- changed value — deliberately an allow-list, not a deny-list, so a
-- future `alter table ... add column` fails closed (not updatable) by
-- default instead of silently becoming writable. Checks by comparing
-- OLD vs NEW *values*, not by inspecting which columns the UPDATE
-- statement merely mentions — important because a PostgREST upsert (see
-- `upsertReaction`) issues `ON CONFLICT DO UPDATE SET` naming every
-- column in the payload, including the unchanged conflict-key columns;
-- a value-based check lets that legitimate no-op-on-those-columns upsert
-- through while still rejecting a real attempt to move a reaction to a
-- different target.
create or replace function public.restrict_update_columns()
returns trigger
language plpgsql
as $$
declare
  col text;
  allowed text[] := TG_ARGV;
begin
  -- The security-definer functions in 20260724000012_functions.sql set
  -- this transaction-local flag (via `set_config(..., true)`, so it
  -- can't leak across a pooled connection to an unrelated later request)
  -- immediately before an UPDATE they know is legitimately privileged.
  -- A normal client has no way to forge this: PostgREST only ever lets
  -- `authenticated`/`anon` run SELECT/INSERT/UPDATE/DELETE against a
  -- table or call an explicitly `grant execute`-ed RPC — never an
  -- arbitrary `set_config`.
  if current_setting('vo_tri.bypass_column_guard', true) = 'on' then
    return new;
  end if;

  for col in select jsonb_object_keys(to_jsonb(new)) loop
    if not (col = any(allowed)) and (to_jsonb(new) -> col) is distinct from (to_jsonb(old) -> col) then
      raise exception 'COLUMN_NOT_UPDATABLE: %', col;
    end if;
  end loop;
  return new;
end;
$$;
