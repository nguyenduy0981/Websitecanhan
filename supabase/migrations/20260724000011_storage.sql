-- Avatar upload storage bucket. Uses Supabase's `storage` schema
-- (storage.buckets/storage.objects), which only exists on a real Supabase
-- project — this migration cannot be validated against a plain local
-- Postgres container the way the others were; it must be verified on the
-- first real `supabase db push`. See docs/BACKEND_ARCHITECTURE.md §6.3.

-- file_size_limit/allowed_mime_types: a real production risk found in
-- the production-readiness pass — an unrestricted public bucket accepts
-- arbitrarily large files and arbitrary content types (executables,
-- HTML that could be served back with an attacker-controlled
-- content-type, ...). 5 MiB and image/* only, matching what an avatar
-- upload should ever need.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "avatar images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Convention: object path is avatars/{user_id}/{filename} — a user may
-- only write into the folder matching their own auth.uid().
create policy "users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "users can update their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "users can delete their own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
