-- Operational/security audit log. Not user-facing — no client SELECT
-- policy at all (read via Supabase Dashboard / a future admin tool using
-- the service_role key, which bypasses RLS). See
-- docs/BACKEND_ARCHITECTURE.md §4.8 for how this differs from xp_ledger
-- (which IS user-readable, since it's "you got +15 points for X", not a
-- security/ops log).

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_type text,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_log_created_idx on public.audit_log (created_at desc);

alter table public.audit_log enable row level security;

-- Deliberately no policies at all — RLS enabled with zero policies means
-- even the table owner's normal client queries return nothing unless
-- using the service_role key (which bypasses RLS). This is the one table
-- in the whole schema with no client-facing access whatsoever.
