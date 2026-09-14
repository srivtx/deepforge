-- DeepForge — study groups & buddy nudges (Wave 30 / F10)
-- Apply with one of:
--   supabase db push
--   dashboard SQL editor (paste this file)
--   psql "postgresql://postgres:<PASSWORD>@db.<ref>.supabase.co:5432/postgres" -f this-file
--
-- Design notes:
--   * Four tables: `study_groups` (identity + shareable join code), `group_members`
--     (membership), `group_activity` (one aggregate signal per member per week:
--     solved count, streak, last-active), and `group_nudges` (one-tap "nudge"
--     rows). Raw per-problem progress is never copied here — members only ever
--     read aggregates, which is the privacy boundary the app promises.
--   * Group creation and code joins run through `security definer` RPCs so the
--     group + owner membership are written atomically and non-owners can only
--     join with a valid code. Direct client membership INSERTs are limited to
--     the group owner.
--   * `is_group_member` / `is_group_owner` are `security definer` helpers: RLS
--     policies on `group_members` cannot subquery the same table directly
--     (infinite recursion), so membership checks live in these functions.
--   * Nudges are capped server-side by a dedicated trigger + ledger table
--     (same shape as 20260915000000_hardening.sql's post rate limit) so the
--     window uses server time; the client adds a per-recipient cooldown on top.
--   * Column-level UPDATE grants keep RLS row policies honest: members can only
--     write their own aggregate numbers, recipients can only flip `seen`, and
--     owners cannot rewrite another member's activity.
--   * Reads are `authenticated` only: group rows, membership, aggregates, and
--     nudges are visible to members (and the owner), never to anon.
--   * This file is written to be re-runnable: IF NOT EXISTS, CREATE OR REPLACE,
--     DROP POLICY/TRIGGER IF EXISTS, and idempotent REVOKE/GRANT statements.

-- ============================================================================
-- 1. study_groups — group identity + shareable join code
-- ============================================================================
create table if not exists public.study_groups (
  id text primary key,
  name text not null,
  topic text,
  path_ref text,
  join_code text not null,
  owner_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint study_groups_name_length
    check (char_length(name) between 2 and 80),
  constraint study_groups_join_code_format
    check (join_code ~ '^[A-Z0-9]{4,16}$')
);

create unique index if not exists study_groups_join_code_key
  on public.study_groups (join_code);
create index if not exists study_groups_owner_id_idx
  on public.study_groups (owner_id);

alter table public.study_groups enable row level security;

-- ============================================================================
-- 2. group_members — membership (owner seeded by the create RPC)
-- ============================================================================
create table if not exists public.group_members (
  group_id text not null references public.study_groups (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member' check (role in ('member', 'owner')),
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

-- Membership lookups by user ("my groups") are the hottest read path; the PK
-- already serves lookups by group.
create index if not exists group_members_user_id_idx
  on public.group_members (user_id);

alter table public.group_members enable row level security;

-- ============================================================================
-- 3. group_activity — aggregate-only shared signal, one row per member/week
-- ============================================================================
create table if not exists public.group_activity (
  group_id text not null,
  user_id uuid not null,
  week_start date not null,
  solved_count int not null default 0,
  streak int not null default 0,
  last_active_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (group_id, user_id, week_start),
  constraint group_activity_member_fkey
    foreign key (group_id, user_id)
    references public.group_members (group_id, user_id) on delete cascade,
  constraint group_activity_solved_count_nonnegative check (solved_count >= 0),
  constraint group_activity_streak_nonnegative check (streak >= 0)
);

-- Weekly board read: filter group + week, sort by solved count desc.
create index if not exists group_activity_group_week_idx
  on public.group_activity (group_id, week_start, solved_count desc);

alter table public.group_activity enable row level security;

-- ============================================================================
-- 4. group_nudges — one explicit tap per nudge, no thread required
-- ============================================================================
create table if not exists public.group_nudges (
  id text primary key,
  group_id text not null,
  from_user uuid not null,
  to_user uuid not null,
  created_at timestamptz not null default now(),
  seen boolean not null default false,
  constraint group_nudges_group_fkey
    foreign key (group_id) references public.study_groups (id) on delete cascade,
  constraint group_nudges_from_member_fkey
    foreign key (group_id, from_user)
    references public.group_members (group_id, user_id) on delete cascade,
  constraint group_nudges_to_member_fkey
    foreign key (group_id, to_user)
    references public.group_members (group_id, user_id) on delete cascade,
  constraint group_nudges_not_self check (from_user <> to_user)
);

create index if not exists group_nudges_group_to_created_idx
  on public.group_nudges (group_id, to_user, created_at desc);
create index if not exists group_nudges_group_created_idx
  on public.group_nudges (group_id, created_at desc);

alter table public.group_nudges enable row level security;

-- ============================================================================
-- 5. group_nudge_events — server-time ledger for the nudge rate cap
-- ============================================================================
create table if not exists public.group_nudge_events (
  from_user uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists group_nudge_events_from_user_created_idx
  on public.group_nudge_events (from_user, created_at desc);

-- RLS on with no policies: the security-definer trigger (and service_role /
-- dashboard SQL) is the only writer; clients are explicitly denied.
alter table public.group_nudge_events enable row level security;

-- ============================================================================
-- 6. membership helpers — security definer so policies can call them safely
-- ============================================================================
create or replace function public.is_group_member(p_group_id text, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
      from public.group_members gm
     where gm.group_id = p_group_id
       and gm.user_id = p_user_id
  );
$$;

create or replace function public.is_group_owner(p_group_id text, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
      from public.study_groups sg
     where sg.id = p_group_id
       and sg.owner_id = p_user_id
  );
$$;

-- ============================================================================
-- 7. group RPCs — create and join by code, both atomic
-- ============================================================================
-- Creates the group and seeds the owner's membership in one transaction and
-- returns the full group row (including the join code).
create or replace function public.create_study_group(
  p_name text,
  p_topic text default null,
  p_path_ref text default null,
  p_join_code text default null
)
returns public.study_groups
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_name text := trim(coalesce(p_name, ''));
  v_topic text := nullif(trim(coalesce(p_topic, '')), '');
  v_path_ref text := nullif(trim(coalesce(p_path_ref, '')), '');
  v_code text := upper(regexp_replace(coalesce(p_join_code, ''), '[^a-zA-Z0-9]', '', 'g'));
  v_group public.study_groups;
begin
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  if char_length(v_name) < 2 or char_length(v_name) > 80 then
    raise exception 'Group names are 2-80 characters.' using errcode = '22023';
  end if;

  -- Codes are client-generated so the local-only path uses the same alphabet;
  -- fall back to a server code if the client did not send one.
  if char_length(v_code) < 4 then
    v_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
  end if;
  v_code := substr(v_code, 1, 16);

  insert into public.study_groups (
    id, name, topic, path_ref, join_code, owner_id, created_at, updated_at
  )
  values (
    'grp-' || replace(gen_random_uuid()::text, '-', ''),
    v_name, v_topic, v_path_ref, v_code, v_uid, now(), now()
  )
  returning * into v_group;

  insert into public.group_members (group_id, user_id, role, joined_at)
  values (v_group.id, v_uid, 'owner', now())
  on conflict (group_id, user_id) do nothing;

  return v_group;
exception
  when unique_violation then
    raise exception 'That join code is already in use - try creating the group again.'
      using errcode = '23505';
end;
$$;

-- Joins by code. Idempotent: rejoining an existing membership is a no-op. Only
-- this security-definer path lets a non-owner create a membership row.
create or replace function public.join_study_group(p_code text)
returns public.study_groups
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_code text := upper(regexp_replace(coalesce(p_code, ''), '[^a-zA-Z0-9]', '', 'g'));
  v_group public.study_groups;
begin
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  if char_length(v_code) < 4 then
    raise exception 'Enter the group code.' using errcode = '22023';
  end if;

  select * into v_group
    from public.study_groups
   where join_code = v_code
   limit 1;

  if v_group.id is null then
    raise exception 'No group matches that code.' using errcode = 'P0002';
  end if;

  insert into public.group_members (group_id, user_id, role, joined_at)
  values (
    v_group.id,
    v_uid,
    case when v_group.owner_id = v_uid then 'owner' else 'member' end,
    now()
  )
  on conflict (group_id, user_id) do nothing;

  return v_group;
end;
$$;

-- ============================================================================
-- 8. nudge rate cap — server-time ledger + BEFORE INSERT trigger
-- ============================================================================
-- At most 5 nudges per sender per 10 minutes. The ledger keeps roughly
-- 2 hours of history per sender; the window itself cannot be steered by the
-- client clock because rows are stamped with now().
create or replace function public.enforce_group_nudge_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_limit integer := 5;
  v_recent integer;
begin
  -- service_role, the dashboard SQL editor and migrations carry no JWT sub:
  -- they are not subject to the per-user limit.
  if v_uid is null then
    return new;
  end if;

  delete from public.group_nudge_events
   where from_user = v_uid
     and created_at < now() - interval '2 hours';

  select count(*)
    into v_recent
    from public.group_nudge_events
   where from_user = v_uid
     and created_at > now() - interval '10 minutes';

  if v_recent >= v_limit then
    raise exception
      'Nudge limit reached: % nudges in 10 minutes is plenty - try again shortly.',
      v_limit
      using errcode = 'P0001',
            hint = 'A nudge is one tap, not a message. Give people room to practice.';
  end if;

  insert into public.group_nudge_events (from_user)
  values (v_uid);

  return new;
end;
$$;

drop trigger if exists group_nudges_rate_limit on public.group_nudges;
create trigger group_nudges_rate_limit
  before insert on public.group_nudges
  for each row execute function public.enforce_group_nudge_rate_limit();

-- ============================================================================
-- 9. RLS policies
-- ============================================================================
-- 9a. study_groups: members (and the owner) read; the owner edits/deletes.
drop policy if exists "study_groups_select_member" on public.study_groups;
create policy "study_groups_select_member"
  on public.study_groups for select
  to authenticated
  using (owner_id = auth.uid() or public.is_group_member(id, auth.uid()));

drop policy if exists "study_groups_update_owner" on public.study_groups;
create policy "study_groups_update_owner"
  on public.study_groups for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "study_groups_delete_owner" on public.study_groups;
create policy "study_groups_delete_owner"
  on public.study_groups for delete
  to authenticated
  using (owner_id = auth.uid());

-- 9b. group_members: members see the membership list; only the owner can
--     insert directly (join flows through join_study_group); leaving is a
--     self-delete and owners can remove members.
drop policy if exists "group_members_select_group" on public.group_members;
create policy "group_members_select_group"
  on public.group_members for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_group_member(group_id, auth.uid())
    or public.is_group_owner(group_id, auth.uid())
  );

drop policy if exists "group_members_insert_owner" on public.group_members;
create policy "group_members_insert_owner"
  on public.group_members for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and public.is_group_owner(group_id, auth.uid())
  );

drop policy if exists "group_members_delete_self_or_owner" on public.group_members;
create policy "group_members_delete_self_or_owner"
  on public.group_members for delete
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_group_owner(group_id, auth.uid())
  );

-- 9c. group_activity: members read aggregates; each member writes only their
--     own row, and only the aggregate columns (column grants below).
drop policy if exists "group_activity_select_group" on public.group_activity;
create policy "group_activity_select_group"
  on public.group_activity for select
  to authenticated
  using (
    public.is_group_member(group_id, auth.uid())
    or public.is_group_owner(group_id, auth.uid())
  );

drop policy if exists "group_activity_insert_self" on public.group_activity;
create policy "group_activity_insert_self"
  on public.group_activity for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and public.is_group_member(group_id, auth.uid())
  );

drop policy if exists "group_activity_update_self" on public.group_activity;
create policy "group_activity_update_self"
  on public.group_activity for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "group_activity_delete_self_or_owner" on public.group_activity;
create policy "group_activity_delete_self_or_owner"
  on public.group_activity for delete
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_group_owner(group_id, auth.uid())
  );

-- 9d. group_nudges: members read; senders insert for themselves only (both
--     users must be members); recipients flip `seen`; senders/owners remove.
drop policy if exists "group_nudges_select_group" on public.group_nudges;
create policy "group_nudges_select_group"
  on public.group_nudges for select
  to authenticated
  using (
    public.is_group_member(group_id, auth.uid())
    or public.is_group_owner(group_id, auth.uid())
  );

drop policy if exists "group_nudges_insert_member" on public.group_nudges;
create policy "group_nudges_insert_member"
  on public.group_nudges for insert
  to authenticated
  with check (
    from_user = auth.uid()
    and from_user <> to_user
    and public.is_group_member(group_id, auth.uid())
    and public.is_group_member(group_id, to_user)
  );

drop policy if exists "group_nudges_update_recipient" on public.group_nudges;
create policy "group_nudges_update_recipient"
  on public.group_nudges for update
  to authenticated
  using (to_user = auth.uid())
  with check (to_user = auth.uid());

drop policy if exists "group_nudges_delete_sender_or_owner" on public.group_nudges;
create policy "group_nudges_delete_sender_or_owner"
  on public.group_nudges for delete
  to authenticated
  using (
    from_user = auth.uid()
    or public.is_group_owner(group_id, auth.uid())
  );

-- ============================================================================
-- 10. grants — anon gets nothing; authenticated gets the narrow columns it uses
-- ============================================================================
revoke all on public.study_groups from anon, authenticated;
grant select on public.study_groups to authenticated;
grant update (name, topic, path_ref, join_code, updated_at)
  on public.study_groups to authenticated;
grant delete on public.study_groups to authenticated;

revoke all on public.group_members from anon, authenticated;
grant select on public.group_members to authenticated;
grant insert (group_id, user_id, role, joined_at)
  on public.group_members to authenticated;
grant delete on public.group_members to authenticated;

revoke all on public.group_activity from anon, authenticated;
grant select on public.group_activity to authenticated;
grant insert (group_id, user_id, week_start, solved_count, streak, last_active_at, updated_at)
  on public.group_activity to authenticated;
-- `week_start`, `group_id` and `user_id` are intentionally not updatable: a
-- member can correct the aggregates for the current week, never move the row.
grant update (solved_count, streak, last_active_at, updated_at)
  on public.group_activity to authenticated;
grant delete on public.group_activity to authenticated;

revoke all on public.group_nudges from anon, authenticated;
grant select on public.group_nudges to authenticated;
grant insert (id, group_id, from_user, to_user, created_at, seen)
  on public.group_nudges to authenticated;
-- Only `seen` is client-updatable (the recipient's acknowledgment).
grant update (seen) on public.group_nudges to authenticated;
grant delete on public.group_nudges to authenticated;

revoke all on public.group_nudge_events from anon, authenticated;

revoke all on function public.is_group_member(text, uuid) from public, anon;
revoke all on function public.is_group_owner(text, uuid) from public, anon;
revoke all on function public.create_study_group(text, text, text, text) from public, anon;
revoke all on function public.join_study_group(text) from public, anon;
revoke all on function public.enforce_group_nudge_rate_limit() from public, anon;

grant execute on function public.is_group_member(text, uuid) to authenticated;
grant execute on function public.is_group_owner(text, uuid) to authenticated;
grant execute on function public.create_study_group(text, text, text, text) to authenticated;
grant execute on function public.join_study_group(text) to authenticated;
