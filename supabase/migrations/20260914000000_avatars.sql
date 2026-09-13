-- DeepForge — avatars storage bucket
-- Apply with one of:
--   supabase db push
--   dashboard SQL editor (paste this file)
--   psql "postgresql://postgres:<PASSWORD>@db.<ref>.supabase.co:5432/postgres" -f this-file
--
-- Design notes:
--   * Uploaded profile photos live in the public `avatars` bucket at
--     `{user_id}/avatar.jpg`; the local data URL remains the instant/offline
--     preview, so the app stays usable with no session and no network.
--   * Reads are public (profile avatars are public identity); writes require
--     `authenticated` and are confined to the caller's own top-level folder:
--     `(storage.foldername(name))[1] = auth.uid()::text`.
--   * This file is written to be re-runnable: the bucket insert uses
--     ON CONFLICT DO NOTHING and every policy is dropped before creation.

-- ============================================================================
-- 1. storage bucket — public avatars
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict do nothing;

-- ============================================================================
-- 2. storage policies — anyone reads, users write only inside their folder
-- ============================================================================
drop policy if exists "avatars_select_public" on storage.objects;
create policy "avatars_select_public"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
