-- DeepForge — initial Supabase schema
-- Apply with one of:
--   supabase db push
--   dashboard SQL editor (paste this file)
--   psql "postgresql://postgres:<PASSWORD>@db.<ref>.supabase.co:5432/postgres" -f this-file
--
-- Design notes:
--   * Personal per-user state is stored in ONE generic `user_stores` JSONB table (one row per
--     local `deepforge:*` store) with whole-store last-write-wins and client-side merge. This
--     intentionally replaces the plan's normalized problem_progress / daily_solves / ... tables.
--   * Social tables (comments, forum) and the `leaderboard` view follow docs/supabase-plan.md §2.
--   * `user_stats` is upserted by the client on sync; there are no triggers.
--   * RLS is the security boundary: the publishable/anon key is public.
--   * This file is written to be re-runnable (IF NOT EXISTS + DROP POLICY IF EXISTS).

-- ============================================================================
-- 1. profiles — public identity (username is public)
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  synced_at timestamptz
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public"
  on public.profiles for select
  using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ============================================================================
-- 2. user_stores — generic per-store JSONB payloads (one row per local store)
--    store_id is the local store id: progress | daily | collections | contests |
--    interview | penpaper | labs | research | comments | forum | username
-- ============================================================================
create table if not exists public.user_stores (
  user_id uuid not null references auth.users (id) on delete cascade,
  store_id text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now(),
  primary key (user_id, store_id)
);

alter table public.user_stores enable row level security;

drop policy if exists "user_stores_select_own" on public.user_stores;
create policy "user_stores_select_own"
  on public.user_stores for select
  using (auth.uid() = user_id);

drop policy if exists "user_stores_insert_own" on public.user_stores;
create policy "user_stores_insert_own"
  on public.user_stores for insert
  with check (auth.uid() = user_id);

drop policy if exists "user_stores_update_own" on public.user_stores;
create policy "user_stores_update_own"
  on public.user_stores for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "user_stores_delete_own" on public.user_stores;
create policy "user_stores_delete_own"
  on public.user_stores for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- 3. user_stats + leaderboard view
-- ============================================================================
create table if not exists public.user_stats (
  user_id uuid primary key references auth.users (id) on delete cascade,
  score int not null default 0,
  solved int not null default 0,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  updated_at timestamptz default now()
);

alter table public.user_stats enable row level security;

drop policy if exists "user_stats_select_public" on public.user_stats;
create policy "user_stats_select_public"
  on public.user_stats for select
  using (true);

drop policy if exists "user_stats_insert_own" on public.user_stats;
create policy "user_stats_insert_own"
  on public.user_stats for insert
  with check (auth.uid() = user_id);

drop policy if exists "user_stats_update_own" on public.user_stats;
create policy "user_stats_update_own"
  on public.user_stats for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- security_invoker keeps RLS of the underlying tables in force; both are publicly
-- selectable, so the leaderboard stays readable by anon/authenticated.
create or replace view public.leaderboard
with (security_invoker = true)
as
select
  p.username,
  s.score,
  s.solved,
  s.current_streak,
  s.longest_streak,
  s.updated_at
from public.user_stats s
join public.profiles p on p.id = s.user_id
order by s.score desc;

grant select on public.leaderboard to anon, authenticated, service_role;

-- ============================================================================
-- 4. social — comments
--    author_name is a snapshot so old rows stay readable if a user leaves.
-- ============================================================================
create table if not exists public.comments (
  id text primary key,
  problem_id text,
  author_id uuid references auth.users (id) on delete set null,
  author_name text,
  body text,
  upvote_count int default 0,
  created_at timestamptz default now()
);

alter table public.comments enable row level security;

drop policy if exists "comments_select_public" on public.comments;
create policy "comments_select_public"
  on public.comments for select
  using (true);

drop policy if exists "comments_insert_own" on public.comments;
create policy "comments_insert_own"
  on public.comments for insert
  with check (auth.uid() = author_id);

drop policy if exists "comments_update_own" on public.comments;
create policy "comments_update_own"
  on public.comments for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

drop policy if exists "comments_delete_own" on public.comments;
create policy "comments_delete_own"
  on public.comments for delete
  using (auth.uid() = author_id);

-- upvotes are per-user; the aggregate count lives in comments.upvote_count and is only
-- ever changed by the security definer RPC below (never by direct client UPDATEs).
create table if not exists public.comment_upvotes (
  user_id uuid not null references auth.users (id) on delete cascade,
  comment_id text not null references public.comments (id) on delete cascade,
  primary key (user_id, comment_id)
);

alter table public.comment_upvotes enable row level security;

drop policy if exists "comment_upvotes_select_own" on public.comment_upvotes;
create policy "comment_upvotes_select_own"
  on public.comment_upvotes for select
  using (auth.uid() = user_id);

drop policy if exists "comment_upvotes_insert_own" on public.comment_upvotes;
create policy "comment_upvotes_insert_own"
  on public.comment_upvotes for insert
  with check (auth.uid() = user_id);

drop policy if exists "comment_upvotes_delete_own" on public.comment_upvotes;
create policy "comment_upvotes_delete_own"
  on public.comment_upvotes for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- 5. social — forum
-- ============================================================================
create table if not exists public.forum_threads (
  id text primary key,
  author_id uuid references auth.users (id) on delete set null,
  author_name text,
  title text,
  body text,
  category text,
  problem_refs text[],
  upvote_count int default 0,
  created_at timestamptz default now()
);

alter table public.forum_threads enable row level security;

drop policy if exists "forum_threads_select_public" on public.forum_threads;
create policy "forum_threads_select_public"
  on public.forum_threads for select
  using (true);

drop policy if exists "forum_threads_insert_own" on public.forum_threads;
create policy "forum_threads_insert_own"
  on public.forum_threads for insert
  with check (auth.uid() = author_id);

drop policy if exists "forum_threads_update_own" on public.forum_threads;
create policy "forum_threads_update_own"
  on public.forum_threads for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

drop policy if exists "forum_threads_delete_own" on public.forum_threads;
create policy "forum_threads_delete_own"
  on public.forum_threads for delete
  using (auth.uid() = author_id);

create table if not exists public.forum_replies (
  id text primary key,
  thread_id text references public.forum_threads (id) on delete cascade,
  author_id uuid references auth.users (id) on delete set null,
  author_name text,
  body text,
  upvote_count int default 0,
  created_at timestamptz default now()
);

alter table public.forum_replies enable row level security;

drop policy if exists "forum_replies_select_public" on public.forum_replies;
create policy "forum_replies_select_public"
  on public.forum_replies for select
  using (true);

drop policy if exists "forum_replies_insert_own" on public.forum_replies;
create policy "forum_replies_insert_own"
  on public.forum_replies for insert
  with check (auth.uid() = author_id);

drop policy if exists "forum_replies_update_own" on public.forum_replies;
create policy "forum_replies_update_own"
  on public.forum_replies for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

drop policy if exists "forum_replies_delete_own" on public.forum_replies;
create policy "forum_replies_delete_own"
  on public.forum_replies for delete
  using (auth.uid() = author_id);

create table if not exists public.forum_thread_upvotes (
  user_id uuid not null references auth.users (id) on delete cascade,
  thread_id text not null references public.forum_threads (id) on delete cascade,
  primary key (user_id, thread_id)
);

alter table public.forum_thread_upvotes enable row level security;

drop policy if exists "forum_thread_upvotes_select_own" on public.forum_thread_upvotes;
create policy "forum_thread_upvotes_select_own"
  on public.forum_thread_upvotes for select
  using (auth.uid() = user_id);

drop policy if exists "forum_thread_upvotes_insert_own" on public.forum_thread_upvotes;
create policy "forum_thread_upvotes_insert_own"
  on public.forum_thread_upvotes for insert
  with check (auth.uid() = user_id);

drop policy if exists "forum_thread_upvotes_delete_own" on public.forum_thread_upvotes;
create policy "forum_thread_upvotes_delete_own"
  on public.forum_thread_upvotes for delete
  using (auth.uid() = user_id);

create table if not exists public.forum_reply_upvotes (
  user_id uuid not null references auth.users (id) on delete cascade,
  reply_id text not null references public.forum_replies (id) on delete cascade,
  primary key (user_id, reply_id)
);

alter table public.forum_reply_upvotes enable row level security;

drop policy if exists "forum_reply_upvotes_select_own" on public.forum_reply_upvotes;
create policy "forum_reply_upvotes_select_own"
  on public.forum_reply_upvotes for select
  using (auth.uid() = user_id);

drop policy if exists "forum_reply_upvotes_insert_own" on public.forum_reply_upvotes;
create policy "forum_reply_upvotes_insert_own"
  on public.forum_reply_upvotes for insert
  with check (auth.uid() = user_id);

drop policy if exists "forum_reply_upvotes_delete_own" on public.forum_reply_upvotes;
create policy "forum_reply_upvotes_delete_own"
  on public.forum_reply_upvotes for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- 6. upvote RPCs — security definer so the counter can be updated atomically
--    while direct client updates to *_count remain impossible in practice.
--    Each returns the new upvote_count.
-- ============================================================================
create or replace function public.toggle_comment_upvote(p_comment_id text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_count integer;
begin
  if v_user is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  -- INSERT ... ON CONFLICT keeps this race-safe against double-clicks.
  insert into public.comment_upvotes (user_id, comment_id)
  values (v_user, p_comment_id)
  on conflict (user_id, comment_id) do nothing;

  if found then
    update public.comments
       set upvote_count = upvote_count + 1
     where id = p_comment_id
     returning upvote_count into v_count;
  else
    delete from public.comment_upvotes
     where user_id = v_user and comment_id = p_comment_id;

    update public.comments
       set upvote_count = greatest(upvote_count - 1, 0)
     where id = p_comment_id
     returning upvote_count into v_count;
  end if;

  if v_count is null then
    raise exception 'comment % does not exist', p_comment_id using errcode = 'P0002';
  end if;

  return v_count;
end;
$$;

create or replace function public.toggle_thread_upvote(p_thread_id text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_count integer;
begin
  if v_user is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  insert into public.forum_thread_upvotes (user_id, thread_id)
  values (v_user, p_thread_id)
  on conflict (user_id, thread_id) do nothing;

  if found then
    update public.forum_threads
       set upvote_count = upvote_count + 1
     where id = p_thread_id
     returning upvote_count into v_count;
  else
    delete from public.forum_thread_upvotes
     where user_id = v_user and thread_id = p_thread_id;

    update public.forum_threads
       set upvote_count = greatest(upvote_count - 1, 0)
     where id = p_thread_id
     returning upvote_count into v_count;
  end if;

  if v_count is null then
    raise exception 'thread % does not exist', p_thread_id using errcode = 'P0002';
  end if;

  return v_count;
end;
$$;

create or replace function public.toggle_reply_upvote(p_reply_id text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_count integer;
begin
  if v_user is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  insert into public.forum_reply_upvotes (user_id, reply_id)
  values (v_user, p_reply_id)
  on conflict (user_id, reply_id) do nothing;

  if found then
    update public.forum_replies
       set upvote_count = upvote_count + 1
     where id = p_reply_id
     returning upvote_count into v_count;
  else
    delete from public.forum_reply_upvotes
     where user_id = v_user and reply_id = p_reply_id;

    update public.forum_replies
       set upvote_count = greatest(upvote_count - 1, 0)
     where id = p_reply_id
     returning upvote_count into v_count;
  end if;

  if v_count is null then
    raise exception 'reply % does not exist', p_reply_id using errcode = 'P0002';
  end if;

  return v_count;
end;
$$;

revoke all on function public.toggle_comment_upvote(text) from public, anon;
revoke all on function public.toggle_thread_upvote(text) from public, anon;
revoke all on function public.toggle_reply_upvote(text) from public, anon;
grant execute on function public.toggle_comment_upvote(text) to authenticated;
grant execute on function public.toggle_thread_upvote(text) to authenticated;
grant execute on function public.toggle_reply_upvote(text) to authenticated;

-- ============================================================================
-- 7. indexes
-- ============================================================================
create index if not exists user_stores_user_id_idx
  on public.user_stores (user_id);
create index if not exists comments_problem_id_created_at_idx
  on public.comments (problem_id, created_at);
create index if not exists forum_threads_category_created_at_idx
  on public.forum_threads (category, created_at desc);
create index if not exists forum_replies_thread_id_created_at_idx
  on public.forum_replies (thread_id, created_at);
-- all three upvote tables are already indexed by their composite primary keys
