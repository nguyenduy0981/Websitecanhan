-- Social graph + reactions/comments/feed. Tables + RLS only.
-- See docs/BACKEND_ARCHITECTURE.md §4.6.

create table public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  followee_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);
-- The PK (follower_id, followee_id) only indexes "who does X follow" for
-- free (follower_id is its leading column). "Who follows X" — a real
-- future profile-page query — has no index without this; a missing-index
-- finding from the production-readiness pass, not something anything
-- queries yet. See docs/BACKEND_ARCHITECTURE.md §18.1.
create index follows_followee_idx on public.follows (followee_id);

create table public.reactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  -- No FK on target_id: a polymorphic association (feed_item | comment)
  -- can't point at a single table. Known integrity gap (not fixed here —
  -- needs a cleanup job, not a constraint): if a comment or feed_item is
  -- ever hard-deleted, its reactions become orphaned rows rather than
  -- being cascade-removed. See docs/BACKEND_ARCHITECTURE.md §18.1/§12.2.
  target_type text not null check (target_type in ('feed_item', 'comment')),
  target_id uuid not null,
  reaction_id text not null check (reaction_id in ('thich', 'cuoi', 'dinh', 'bat-ngo', 'vo-tri')),
  created_at timestamptz not null default now(),
  unique (user_id, target_type, target_id)
);
-- The unique constraint's own index leads with user_id, so it doesn't
-- serve "every reaction on this target" (getReactionCounts's real query
-- shape). Missing-index finding from the production-readiness pass.
create index reactions_target_idx on public.reactions (target_type, target_id);

-- See restrict_update_columns() in 20260724000001_extensions_and_helpers.sql.
-- Without this, "users can change their own reaction" below would also
-- let a client silently retarget an existing reaction row to point at a
-- completely different target_id/target_type via a raw UPDATE, instead
-- of the intended delete+insert-elsewhere. Only reaction_id may change.
-- A value-based check (not "which columns did the UPDATE mention") is
-- required here specifically because upsertReaction's real
-- `ON CONFLICT DO UPDATE` names every column including the unchanged
-- conflict keys — this still passes since those values don't differ.
create trigger reactions_restrict_update_columns
  before update on public.reactions
  for each row execute function public.restrict_update_columns('reaction_id');

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  -- Same polymorphic-association gap as reactions.target_id above (no FK
  -- possible across activity/feed_item) — see docs/BACKEND_ARCHITECTURE.md
  -- §18.1/§12.2.
  target_type text not null check (target_type in ('activity', 'feed_item')),
  target_id text not null,
  author_id uuid not null references public.profiles(id) on delete cascade,
  -- `on delete set null`, not cascade: a real cascade-behavior bug found
  -- in the production-readiness pass. Comments only ever hard-delete via
  -- this cascade (the app itself only ever soft-deletes, via
  -- softDeleteComment's `deleted_at`). If author A's account is deleted,
  -- `author_id ... on delete cascade` correctly removes A's own comments
  -- — but if parent_comment_id had also cascaded, deleting A's parent
  -- comment would transitively hard-delete every OTHER user's reply to
  -- it too, destroying content that belongs to accounts that were never
  -- deleted. `set null` instead makes those replies top-level orphans
  -- (still readable, just no longer nested under the deleted parent).
  parent_comment_id uuid references public.comments(id) on delete set null,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index comments_target_created_idx on public.comments (target_type, target_id, created_at desc);

-- See restrict_update_columns() in 20260724000001_extensions_and_helpers.sql.
-- Without this, "users can soft-delete their own comments" below would
-- also let a client silently rewrite `body` (an undocumented, untested
-- edit feature nothing in the frontend exposes) or move a comment to a
-- different target/parent via a raw UPDATE. Only deleted_at may change.
create trigger comments_restrict_update_columns
  before update on public.comments
  for each row execute function public.restrict_update_columns('deleted_at');

create table public.feed_items (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null check (event_type in ('level_up', 'milestone', 'achievement', 'quest_claim')),
  text text not null,
  created_at timestamptz not null default now()
);
create index feed_items_created_idx on public.feed_items (created_at desc);

alter table public.follows enable row level security;
alter table public.reactions enable row level security;
alter table public.comments enable row level security;
alter table public.feed_items enable row level security;

create policy "follows are publicly readable" on public.follows for select using (true);
create policy "users can create their own follows"
  on public.follows for insert with check (auth.uid() = follower_id);
create policy "users can remove their own follows"
  on public.follows for delete using (auth.uid() = follower_id);

create policy "reactions are publicly readable" on public.reactions for select using (true);
create policy "users can react as themselves"
  on public.reactions for insert with check (auth.uid() = user_id);
create policy "users can change their own reaction"
  on public.reactions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users can remove their own reaction"
  on public.reactions for delete using (auth.uid() = user_id);

-- `or auth.uid() = author_id`, not just `deleted_at is null`: a real,
-- previously-undiscovered production bug found by actually executing
-- softDeleteComment() against Postgres, not by reading the SQL. Postgres
-- RLS combines a table's SELECT policy into what counts as a valid
-- resulting row for UPDATE too — so with only `deleted_at is null` here,
-- ANY soft-delete (setting deleted_at to non-null) made the row instantly
-- fail its own table's SELECT policy, and Postgres rejected the UPDATE
-- outright with "new row violates row-level security policy", even
-- though the UPDATE policy's own USING/WITH CHECK (author ownership)
-- was satisfied. Reproduced, root-caused (confirmed by temporarily
-- loosening this policy to `using (true)` and watching the same UPDATE
-- succeed), and fixed by letting an author always see their own
-- comments regardless of deleted_at — `listComments()` already filters
-- `deleted_at is null` itself for everyone else, so this doesn't expose
-- anything nobody could already infer from "my delete succeeded".
create policy "comments are publicly readable" on public.comments for select using (deleted_at is null or auth.uid() = author_id);
create policy "users can post comments as themselves"
  on public.comments for insert with check (auth.uid() = author_id);
create policy "users can soft-delete their own comments"
  on public.comments for update using (auth.uid() = author_id) with check (auth.uid() = author_id);

-- feed_items: public read, no client write policy at all — every row is
-- system-generated by the security-definer functions in
-- 20260724000012_functions.sql after a real notable event (level up,
-- milestone, achievement, quest claim), never user-authored free text.
create policy "feed_items are publicly readable" on public.feed_items for select using (true);
