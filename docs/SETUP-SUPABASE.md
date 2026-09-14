# DeepForge — Supabase Setup Runbook

Project: `klogjcspyiygnggmugjy` (`https://klogjcspyiygnggmugjy.supabase.co`)

DeepForge stays 100% local until both `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are set **and** a session exists. Nothing below
is required to run the app.

## 1. Apply the migrations

The schema lives in `supabase/migrations/`. Apply the files **in filename order**
(all are re-runnable, so re-applying is harmless):

| Order | File | Contents |
| --- | --- | --- |
| 1 | [`supabase/migrations/20260913000000_init.sql`](../supabase/migrations/20260913000000_init.sql) | tables, RLS policies, `toggle_*_upvote` RPCs, first indexes |
| 2 | [`supabase/migrations/20260914000000_avatars.sql`](../supabase/migrations/20260914000000_avatars.sql) | `avatars` Storage bucket + folder-scoped policies |
| 3 | [`supabase/migrations/20260915000000_hardening.sql`](../supabase/migrations/20260915000000_hardening.sql) | read-path indexes, posting rate limit, RLS/privilege tightening (see [§8](#8-production-hardening-20260915000000_hardeningsql)) |

**Option A — CLI (recommended; applies pending files in order)**

```bash
npx supabase login
npx supabase link --project-ref klogjcspyiygnggmugjy
npx supabase db push
```

**Option B — Dashboard SQL editor**

Open the project → SQL Editor → New query, paste the full contents of each file
**in the order above**, and Run. Skip files already applied; the hardening file is
safe to re-run.

**Option C — psql**

```bash
for f in supabase/migrations/*.sql; do
  psql "postgresql://postgres:<PASSWORD>@db.klogjcspyiygnggmugjy.supabase.co:5432/postgres" \
    -v ON_ERROR_STOP=1 -f "$f"
done
```

`<PASSWORD>` is the database password from Project Settings → Database. Every file
is re-runnable: tables use `IF NOT EXISTS`, policies/triggers are dropped before
creation, and the hardening migration only uses idempotent DDL.

## 2. Environment variables

Local: `.env.local` (gitignored) already contains the real URL + publishable key.

```
NEXT_PUBLIC_SUPABASE_URL=https://klogjcspyiygnggmugjy.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Vercel: Project → Settings → Environment Variables, add both keys for Production,
Preview, and Development, then redeploy. Unset values keep the app fully local.

## 3. Auth setup (email magic links)

Supabase Dashboard → Authentication:

- **URL Configuration** → Site URL: your production origin (e.g. `https://deepforge.example`).
- **Redirect URLs** (exact matches, add all that apply):
  - `http://localhost:3001` (local dev, `bun dev`)
  - `http://localhost:3099` (secondary local port)
  - your production URL
- Email provider is enabled by default; the magic link uses `{{ .ConfirmationURL }}`.
- **SMTP (do this before public launch).** The built-in sender is shared and
  rate-limited to a few auth emails per hour, so magic links silently stop
  arriving under even light use. Attach your own provider: Dashboard →
  Authentication → Emails → **SMTP Settings** → enable, then fill host, port,
  user, password, sender email, and sender name; Save. SendGrid, Mailgun,
  Resend, Amazon SES, and Postmark all work. Keep the confirmation/magic-link
  templates on `{{ .ConfirmationURL }}`.
- Use a sender on a domain you own with SPF/DKIM configured — otherwise links
  land in spam. Verify by requesting two magic links back-to-back: both must
  arrive within a minute. (The local stack uses its own test inbox on
  `http://127.0.0.1:54324`, unaffected by this.)

## 4. Verify

SQL (dashboard SQL editor or `psql`):

```sql
select count(*) from public.profiles;
select count(*) from public.user_stores;
select count(*) from public.user_stats;
select * from public.leaderboard;

-- every table should have rowsecurity = true
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('profiles','user_stores','user_stats','comments','comment_upvotes',
                    'forum_threads','forum_replies','forum_thread_upvotes','forum_reply_upvotes',
                    'post_rate_events');

-- the three RPCs exist and are security definer
select proname, prosecdef
from pg_proc
where proname in ('toggle_comment_upvote','toggle_thread_upvote','toggle_reply_upvote');
```

Hardening checks (all from `20260915000000_hardening.sql`):

```sql
-- read-path indexes exist; the two superseded ASC indexes are gone, not duplicated
select indexname from pg_indexes
where schemaname = 'public'
  and indexname in ('comments_problem_id_created_at_desc_idx',
                    'forum_replies_thread_id_created_at_desc_idx',
                    'forum_threads_created_at_desc_idx',
                    'user_stats_score_desc_idx',
                    'post_rate_events_author_table_created_idx',
                    'user_stores_user_id_idx');

-- one rate-limit trigger per posting table
select tgname from pg_trigger
where not tgisinternal
  and tgname in ('comments_rate_limit','forum_threads_rate_limit','forum_replies_rate_limit');

-- the rate ledger is deny-all for clients (0 rows)
select count(*) from pg_policies
where schemaname = 'public' and tablename = 'post_rate_events';

-- clients may update post text but never upvote_count
select table_name, column_name, privilege_type
from information_schema.column_privileges
where table_schema = 'public'
  and grantee = 'authenticated'
  and table_name in ('comments','forum_threads','forum_replies')
  and column_name = 'upvote_count';  -- expect 0 rows
```

REST smoke test with the publishable key (`<KEY>`): the tables exist, so a missing
migration shows as **404** while a working one returns an RLS-filtered result.

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  "https://klogjcspyiygnggmugjy.supabase.co/rest/v1/user_stores?select=*" \
  -H "apikey: <KEY>" -H "Authorization: Bearer <KEY>"
# 200 + `[]` for anon (RLS hides all rows), or 401 — never 404.
```

## 5. Security notes

- The publishable key (`sb_publishable_...`) is designed to be public; RLS is the
  boundary. All personal tables are own-rows only; social reads are public.
- Never commit the **service role key** or the **database password**. They bypass RLS.
- Clients never write `upvote_count` directly: the `toggle_*_upvote` security-definer
  RPCs update the counter atomically and return the new value. Since
  `20260915000000_hardening.sql` this is enforced by **column-level UPDATE grants**
  (authors can edit their post text, but the counter column is not grantable) and by
  revoking client INSERT/DELETE on the upvote join tables.
- `anon` has no write grants on any app table (RLS already rejected those writes).
- Posting is rate-limited per signed-in user: 12 comments/min, 4 forum threads/min,
  20 replies/min (`20260915000000_hardening.sql`). The window is tracked in the
  server-side `post_rate_events` ledger (deny-all for clients), so a skewed client
  clock cannot bypass it. Rejected posts stay in the local-first store and sync once
  the window clears.
- Social reads stay public **by design** (comments, threads, replies, usernames):
  an account can read — but never edit or delete — another account's content. The
  full audit and the residual, documented risks are in [§8](#8-production-hardening-20260915000000_hardeningsql).

## 6. Google sign-in (optional)

Magic links work without any of this; Google is opt-in and needs a Google Cloud
project plus the provider enabled in Supabase.

**Google Cloud Console** ([console.cloud.google.com](https://console.cloud.google.com)):

1. APIs & Services → OAuth consent screen: choose External, set an app name and
   support email, add the `email` and `profile` scopes, and — while the app is in
   Testing — add your Google account under Test users.
2. Credentials → Create credentials → OAuth client ID → **Web application**.
3. Authorized JavaScript origins — add every app origin:
   - `http://localhost:3001`
   - `http://localhost:3099`
   - your production origin
4. Authorized redirect URIs — add exactly:
   - `https://klogjcspyiygnggmugjy.supabase.co/auth/v1/callback`
5. Create, then copy the **Client ID** and **Client secret**.

**Supabase Dashboard** → Authentication → Providers → Google: enable the
provider, paste the Client ID and Client secret, and save.

Finally confirm the app origins are allowed to redirect back — Site URL and
Redirect URLs (see [section 3](#3-auth-setup-email-magic-links)). The client
sends `redirectTo: window.location.origin`, so every origin that signs in with
Google must be on that list.

If Google is not enabled in the dashboard, the sign-in call resolves with the
provider error and the sync panel shows it inline next to the button; magic
links keep working.

## 7. Storage (avatars)

Uploaded profile photos are stored in a public Storage bucket named `avatars`
at the path convention **`{user_id}/avatar.jpg`** (one object per user, the
upload upserts in place). The downscaled data URL stays in localStorage as the
instant/offline preview, so signed-out and unconfigured users never touch
Storage — the UI just notes "Saved on this device — sign in to sync".

The bucket and its policies come from
[`supabase/migrations/20260914000000_avatars.sql`](../supabase/migrations/20260914000000_avatars.sql),
applied the same way as the schema — `supabase db push` (or paste it into the
dashboard SQL editor). It is re-runnable: the bucket insert uses
`on conflict do nothing` and every policy is dropped before creation.

| Policy | Operation | Rule |
| --- | --- | --- |
| `avatars_select_public` | SELECT | `bucket_id = 'avatars'` — anyone can view |
| `avatars_insert_own` | INSERT (authenticated) | `(storage.foldername(name))[1] = auth.uid()::text` |
| `avatars_update_own` | UPDATE (authenticated) | same own-folder check (needed for `upsert: true`) |
| `avatars_delete_own` | DELETE (authenticated) | same own-folder check |

The public URL is:

```
https://klogjcspyiygnggmugjy.supabase.co/storage/v1/object/public/avatars/{user_id}/avatar.jpg
```

After each upload the client appends a `?v=<timestamp>` cache-buster, because
the object path is stable. `getPublicUrl` only builds this string, so
`fetchAvatarUrl()` can restore an avatar uploaded on another device without a
network call.

Verify:

```sql
select id, name, public from storage.buckets where id = 'avatars';
select policyname, cmd, roles from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname like 'avatars_%';
```

When the Supabase env vars are unset the app is unchanged: uploads live only
in localStorage, no bucket is required, and every Storage helper resolves as a
no-op.

## 8. Production hardening (20260915000000_hardening.sql)

### Read-path indexes

| Index | Columns | Action |
| --- | --- | --- |
| `comments_problem_id_created_at_desc_idx` | `comments (problem_id, created_at desc)` | added; supersedes the ASC `comments_problem_id_created_at_idx`, which is dropped |
| `forum_replies_thread_id_created_at_desc_idx` | `forum_replies (thread_id, created_at desc)` | added; supersedes the ASC `forum_replies_thread_id_created_at_idx`, which is dropped |
| `forum_threads_created_at_desc_idx` | `forum_threads (created_at desc)` | added for the unfiltered front page (`forum_threads_category_created_at_idx` is kept for category feeds) |
| `user_stats_score_desc_idx` | `user_stats (score desc)` | added for the `leaderboard` view |
| `user_stores_user_id_idx` | `user_stores (user_id)` | already present from the init migration — intentionally not recreated |
| `post_rate_events_author_table_created_idx` | `post_rate_events (author_id, table_name, created_at desc)` | added with the rate-limit ledger |

These match the paging queries in `src/lib/sync/social.ts`, which order by
`created_at desc` and filter by `problem_id` / `thread_id`. Dropping the two ASC
indexes leaves no duplicate index for the same columns.

### Posting rate limit

A `BEFORE INSERT` trigger on each posting table checks a server-side ledger and
rejects bursts with a clear `Rate limit reached: at most N new <table> rows per
minute per user` error (`SQLSTATE P0001`):

| Table | Trigger | Limit |
| --- | --- | --- |
| `comments` | `comments_rate_limit` | 12 / minute |
| `forum_threads` | `forum_threads_rate_limit` | 4 / minute |
| `forum_replies` | `forum_replies_rate_limit` | 20 / minute |

- Windows are tracked in `post_rate_events`, keyed by `auth.uid()` and stamped
  with `now()` — not by the client-supplied `created_at`, which can be skewed.
  The ledger is pruned to ~2 minutes per author/table on every insert.
- `service_role`, the dashboard SQL editor, and migrations (no JWT `sub`) are
  exempt, so seeding/ops are never throttled.
- A rejected post is not lost: the app is local-first, the row stays in the
  local store, and the sync layer retries when the list is next loaded.
- Tune a limit by re-running just the trigger statement with a different argument
  (`... execute function public.enforce_post_rate_limit('30')`).

### RLS audit

Every table in `public` was audited; RLS is enabled on all of them and write
policies are owner-scoped:

| Object | RLS | Read | Write | Verdict |
| --- | --- | --- | --- | --- |
| `profiles` | on | public (`username` is public identity) | insert/update own (`auth.uid() = id`); no delete policy (cascade only) | OK |
| `user_stores` | on | own rows only | select/insert/update/delete own | OK |
| `user_stats` | on | public (feeds `leaderboard`) | insert/update own; no delete | OK |
| `comments`, `forum_threads`, `forum_replies` | on | public (social feeds) | insert/update/delete own | tightened — text-only UPDATE grants |
| `comment_upvotes`, `forum_thread_upvotes`, `forum_reply_upvotes` | on | own rows | was insert/delete own; now revoked for `authenticated` | tightened — RPC-only writes |
| `leaderboard` (view) | n/a | public select via `security_invoker = true` | n/a | OK — underlying RLS still applies |
| `post_rate_events` | on | none | deny-all to clients; definer trigger / service role only | new |
| `storage.objects` (`avatars_*` policies) | on | public bucket | authenticated, own folder only | OK |

Findings fixed by this migration:

1. **Counter tampering via own-row UPDATE.** RLS is row-level, so the author of a
   comment/thread/reply could `PATCH` their own `upvote_count`. Fixed with
   column-level grants: authors keep UPDATE on their text columns and lose it on
   `upvote_count` (and every identity column).
2. **Counter desync via upvote tables.** `authenticated` could `INSERT`/`DELETE`
   its own `comment_upvotes` / `forum_thread_*` rows directly, moving the join
   row without the counter. Revoked; only the `toggle_*_upvote` security-definer
   RPCs mutate them now.
3. **Implicit anon write grants.** The Supabase defaults granted `anon` write
   privileges on every app table; RLS already rejected the writes
   (`auth.uid()` is null), but the grants are now revoked explicitly so a future
   policy edit cannot accidentally open them up.

Residual risks (documented, not fixed here — both need client changes, out of
scope for a SQL-only wave):

- The client still sends `upvote_count` in its INSERT payloads
  (`src/lib/sync/social.ts`), so an author can seed their own row's count once at
  creation. It can no longer be changed afterwards. Removing the field from
  inserts is the follow-up.
- `user_stats` remains client-upserted, so a determined user can inflate their own
  leaderboard score. That is inherent to the local-first design; server-side
  score recomputation is the only real fix.
- Social content is readable by everyone **by design** — the owner-scoping covers
  update/delete, not read.

Verify with the SQL block in §4 and the manual matrix in §9.

## 9. Two-account manual verification matrix

Run after all three migrations are applied. Prereqs: two sign-in sessions
(account **A** and account **B**, magic link or Google) and access to the
dashboard SQL editor.

The SQL editor runs as `postgres`, which **bypasses RLS**. To act as an account,
wrap the statements in `begin; set local role authenticated; set local
request.jwt.claims = '{"sub":"<uuid>"}'; ... rollback;`. Grab the UUIDs first:

```sql
select id, username, created_at from public.profiles order by created_at;
```

| # | Account | Action | Expected |
| --- | --- | --- | --- |
| 1 | A | Sign in, set a username, solve one problem, post one comment on any problem | `user_stores`, `user_stats`, and `comments` gain rows for A |
| 2 | B | Read A's mailbox: `select count(*) from public.user_stores where user_id = '<A-uuid>';` | `0` — own-rows RLS, no error |
| 3 | B | Delete A's mailbox: `delete from public.user_stores where user_id = '<A-uuid>';` | `DELETE 0`; A's row still present for A |
| 4 | B | Read A's comment: `select body from public.comments where id = '<comment-id>';` | `1` row — social reads are public by design |
| 5 | B | Edit/delete A's comment: `update public.comments set body = 'hax' where id = '<comment-id>';` then `delete ...` | `UPDATE 0` / `DELETE 0` |
| 6 | B | Upvote A's comment via the app UI (or `select public.toggle_comment_upvote('<comment-id>');`) | RPC returns the new count; `select upvote_count from public.comments where id = '<comment-id>';` equals that number; `select count(*) from public.comment_upvotes where comment_id = '<comment-id>' and user_id = '<B-uuid>';` is `1`. Toggling again returns the previous count and removes the upvote row |
| 7 | B | `select public.toggle_comment_upvote('<comment-id>');` twice more without using the UI | Same result as the UI path — counters track the RPC exactly, never the other way around |
| 8 | A | `update public.comments set body = 'edited' where id = '<comment-id>';` | `UPDATE 1` — authors can edit their text |
| 9 | A | `update public.comments set upvote_count = 999 where id = '<comment-id>';` | `ERROR: permission denied for table comments` — counters are RPC-only |
| 10 | A | Insert 13 comments in under a minute (see block below) | First 12 succeed; the 13th fails with `Rate limit reached: at most 12 new comments rows per minute per user`; the failed insert leaves no row |

Rate-limit check (as A, inside the `begin / set local ... / rollback` block):

```sql
insert into public.comments (id, problem_id, author_id, author_name, body)
select 'matrix-' || g, 'two-sum', '<A-uuid>', 'A', 'burst probe'
from generate_series(1, 12) as g;

insert into public.comments (id, problem_id, author_id, author_name, body)
values ('matrix-13', 'two-sum', '<A-uuid>', 'A', 'burst probe');
-- expected: ERROR: Rate limit reached: at most 12 new comments rows per minute per user

rollback;
```

`rollback` cleans up the probe rows; if you committed any, delete them as their
author: `delete from public.comments where id like 'matrix-%' and author_id = '<A-uuid>';`.

App-level cross-check (no SQL): sign in as B in a second browser/profile. B's
progress, collections, streaks, and avatar are independent of A's; the leaderboard
and forum show both accounts' public rows; B cannot edit or delete A's posts in
the UI.
