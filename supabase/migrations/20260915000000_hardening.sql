-- DeepForge — production hardening (NW-09)
-- Apply with one of:
--   supabase db push
--   dashboard SQL editor (paste this file)
--   psql "postgresql://postgres:<PASSWORD>@db.<ref>.supabase.co:5432/postgres" -f this-file
--
-- Design notes:
--   * The read paths the client actually uses drive the indexes: paged social lists
--     issue .order("created_at", { ascending: false }).order("id", ...).range(...),
--     comments filter on problem_id, replies on thread_id, and the leaderboard view
--     sorts user_stats by score. Two of the 20260913000000_init.sql ordering indexes
--     are plain ASC; they are superseded by DESC variants (same columns, old index
--     dropped so nothing is duplicated).
--   * Rate limiting counts a dedicated server-time ledger (`post_rate_events`) rather
--     than social rows: comments/threads/replies carry a client-supplied created_at,
--     so a skewed or malicious clock could otherwise loop around the window.
--   * Column-level UPDATE grants keep the author-write RLS policies while making the
--     counters RPC-only for real: row-level RLS alone cannot stop an author from
--     PATCHing their own row's upvote_count.
--   * The RLS/privilege audit is documented in docs/SETUP-SUPABASE.md §8.
--   * This file is written to be re-runnable: IF NOT EXISTS, CREATE OR REPLACE,
--     DROP TRIGGER IF EXISTS, and idempotent REVOKE/GRANT statements.

-- ============================================================================
-- 1. read-path indexes (NW-09 acceptance)
-- ============================================================================
-- Per-problem comments: .eq("problem_id").order("created_at", desc).range(...)
create index if not exists comments_problem_id_created_at_desc_idx
  on public.comments (problem_id, created_at desc);
drop index if exists public.comments_problem_id_created_at_idx;

-- Replies inside one thread: .eq("thread_id").order("created_at", desc).range(...)
create index if not exists forum_replies_thread_id_created_at_desc_idx
  on public.forum_replies (thread_id, created_at desc);
drop index if exists public.forum_replies_thread_id_created_at_idx;

-- Forum front page: .order("created_at", desc).range(...), no category filter
-- (forum_threads_category_created_at_idx from the init migration is kept for the
--  filtered-by-category query).
create index if not exists forum_threads_created_at_desc_idx
  on public.forum_threads (created_at desc);

-- leaderboard view: user_stats joined to profiles, order by score desc
create index if not exists user_stats_score_desc_idx
  on public.user_stats (score desc);

-- public.user_stores (user_id) is already served by user_stores_user_id_idx
-- (20260913000000_init.sql) — intentionally not recreated here.

-- ============================================================================
-- 2. posting rate limit — server-time ledger + BEFORE INSERT trigger
-- ============================================================================
-- One row per accepted post attempt. Lives server-side so the window cannot be
-- steered by the client clock; the trigger below keeps it pruned to ~2 minutes of
-- history per author/table.
create table if not exists public.post_rate_events (
  author_id uuid not null references auth.users (id) on delete cascade,
  table_name text not null,
  created_at timestamptz not null default now()
);

create index if not exists post_rate_events_author_table_created_idx
  on public.post_rate_events (author_id, table_name, created_at desc);

-- RLS on with no policies: the security-definer trigger (and service_role /
-- dashboard SQL) is the only writer; clients are explicitly denied.
alter table public.post_rate_events enable row level security;
revoke all on public.post_rate_events from anon, authenticated;

create or replace function public.enforce_post_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_limit integer := greatest(coalesce(nullif(tg_argv[0], ''), '0')::integer, 1);
  v_recent integer;
begin
  -- service_role, the dashboard SQL editor and migrations carry no JWT sub:
  -- they are not subject to the per-user limit.
  if v_uid is null then
    return new;
  end if;

  -- Prune the author's older events for this table; the composite index keeps
  -- this a cheap range delete.
  delete from public.post_rate_events
   where author_id = v_uid
     and table_name = tg_table_name
     and created_at < now() - interval '2 minutes';

  select count(*)
    into v_recent
    from public.post_rate_events
   where author_id = v_uid
     and table_name = tg_table_name
     and created_at > now() - interval '1 minute';

  if v_recent >= v_limit then
    raise exception
      'Rate limit reached: at most % new % rows per minute per user — try again in under a minute.',
      v_limit, tg_table_name
      using errcode = 'P0001',
            hint = 'The post is kept locally and can be synced once the window clears.';
  end if;

  insert into public.post_rate_events (author_id, table_name)
  values (v_uid, tg_table_name);

  return new;
end;
$$;

drop trigger if exists comments_rate_limit on public.comments;
create trigger comments_rate_limit
  before insert on public.comments
  for each row execute function public.enforce_post_rate_limit('12');

drop trigger if exists forum_threads_rate_limit on public.forum_threads;
create trigger forum_threads_rate_limit
  before insert on public.forum_threads
  for each row execute function public.enforce_post_rate_limit('4');

drop trigger if exists forum_replies_rate_limit on public.forum_replies;
create trigger forum_replies_rate_limit
  before insert on public.forum_replies
  for each row execute function public.enforce_post_rate_limit('20');

-- ============================================================================
-- 3. RLS / privilege tightening (audit: docs/SETUP-SUPABASE.md §8)
-- ============================================================================
-- 3a. anon never writes app data. RLS already rejects it (auth.uid() is null),
--     but the default grants are revoked so the boundary is explicit and cannot
--     be lost by a future policy edit.
revoke insert, update, delete on public.profiles from anon;
revoke insert, update, delete on public.user_stores from anon;
revoke insert, update, delete on public.user_stats from anon;
revoke insert, update, delete on public.comments from anon;
revoke insert, update, delete on public.forum_threads from anon;
revoke insert, update, delete on public.forum_replies from anon;
revoke insert, update, delete on public.comment_upvotes from anon;
revoke insert, update, delete on public.forum_thread_upvotes from anon;
revoke insert, update, delete on public.forum_reply_upvotes from anon;

-- 3b. Authors may still edit their own post text; RLS remains the row boundary
--     and column grants make upvote_count (and identity columns) RPC-only.
revoke update on public.comments from authenticated;
grant update (body) on public.comments to authenticated;

revoke update on public.forum_threads from authenticated;
grant update (title, body, category, problem_refs) on public.forum_threads to authenticated;

revoke update on public.forum_replies from authenticated;
grant update (body) on public.forum_replies to authenticated;

-- 3c. Upvote rows are RPC-only on the write side (toggle_*_upvote are security
--     definer and move the counter and the join row together). Clients keep
--     SELECT for own-upvote state (comment_upvotes / *_thread_upvotes /
--     *_reply_upvotes are read in src/lib/sync/social.ts).
revoke insert, update, delete on public.comment_upvotes from authenticated;
revoke insert, update, delete on public.forum_thread_upvotes from authenticated;
revoke insert, update, delete on public.forum_reply_upvotes from authenticated;
