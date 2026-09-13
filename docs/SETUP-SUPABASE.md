# DeepForge — Supabase Setup Runbook

Project: `klogjcspyiygnggmugjy` (`https://klogjcspyiygnggmugjy.supabase.co`)

DeepForge stays 100% local until both `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are set **and** a session exists. Nothing below
is required to run the app.

## 1. Apply the migration

The schema lives in [`migrations/20260913000000_init.sql`](migrations/20260913000000_init.sql).
Pick one option:

**Option A — CLI (recommended; repeatable)**

```bash
npx supabase login
npx supabase link --project-ref klogjcspyiygnggmugjy
npx supabase db push
```

**Option B — Dashboard SQL editor**

Open the project → SQL Editor → New query, paste the entire contents of
`supabase/migrations/20260913000000_init.sql`, and Run.

**Option C — psql**

```bash
psql "postgresql://postgres:<PASSWORD>@db.klogjcspyiygnggmugjy.supabase.co:5432/postgres" \
  -f supabase/migrations/20260913000000_init.sql
```

`<PASSWORD>` is the database password from Project Settings → Database. The file is
re-runnable: tables use `IF NOT EXISTS` and policies are dropped before creation.

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
- The default SMTP sender is rate-limited (a few emails/hour). Add a custom SMTP
  provider before real users sign in.

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
                    'forum_threads','forum_replies','forum_thread_upvotes','forum_reply_upvotes');

-- the three RPCs exist and are security definer
select proname, prosecdef
from pg_proc
where proname in ('toggle_comment_upvote','toggle_thread_upvote','toggle_reply_upvote');
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
  RPCs update the counter atomically and return the new value.
