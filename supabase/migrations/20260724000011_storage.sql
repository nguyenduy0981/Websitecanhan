-- Avatar upload storage bucket. Uses Supabase's `storage` schema
-- (storage.buckets/storage.objects), which only exists on a real Supabase
-- project — this migration cannot be validated against a plain local
-- Postgres container the way the others were; it must be verified on the
-- first real `supabase db push`. See docs/BACKEND_ARCHITECTURE.md §6.3.

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

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
