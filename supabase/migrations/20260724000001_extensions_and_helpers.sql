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
