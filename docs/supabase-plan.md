# DeepForge → Supabase Sync Plan

Status: research/planning only. No runtime changes in this doc.
Hard constraint: DeepForge stays 100% functional offline. Supabase is opt-in and activates only when
`NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` are both set **and** a session exists.
No account is ever required.

## 1. localStorage audit

All stores are client-only, synchronous, JSON-valued, wrapped in try/catch, and notify the UI with
`window.dispatchEvent(new CustomEvent("deepforge:*-change"))`. `src/lib/backup.ts` prefix-scans every
`deepforge:` key for export/import/clear, so backups already cover new keys automatically.

| # | Key | Shape (defined in `src/lib/`) | Written by | Sync phase |
|---|-----|-------------------------------|------------|------------|
| 1 | `deepforge:progress:v1` | `Record<problemId, { lastOpened?, attempted?, solved?, solvedAt?, savedCode? }>` (`progress.ts:8`) | `markOpened`, `saveCode`, `markSolved`, `resetProblem` | 2 (core) |
| 2 | `deepforge:daily:v1` | `{ lastSolvedDate: string\|null, streak: number, solvedDates: string[] }` (`daily.ts:13`) | `markDailySolved` | 2 |
| 3 | `deepforge:collections:v1` | `UserCollection[]` = `{ id, name, description, problemIds[], createdAt }` (`collections.ts:8`) | `save/update/deleteUserCollection` | 2 |
| 4 | `deepforge:contests:v1` | `ContestResult[]` = `{ contestId, score, solved, total, durationSeconds, completedAt }` (`contestStore.ts:17`) | `saveContestResult` | 2 |
| 5 | `deepforge:interview:v1` | `InterviewResult[]` = `{ trackId, solved, total, seconds, completedAt }` (`interview.ts:12`) | `saveInterviewResult` | 2 |
| 6 | `deepforge:penpaper:v1` | `Record<problemId, { attempted, correct, lastAt }>` (`penpaper.ts:15`) | `recordPenPaperAnswer` | 2 |
| 7 | `deepforge:labs` | `Record<labId, { best: number\|null, attempts: number, passed: boolean }>` (`labs.ts:17`) | `setLabBest` | 2 |
| 8 | `deepforge:research:v1` | `Record<challengeId, { bestScore, bestAt, beatenBaseline, attempts: {score,at}[] }>` — 50 attempts max (`research.ts:21`) | `saveAttempt` | 2 |
| 9 | `deepforge:comments:v1` | `Record<problemId, Comment[]>`; `Comment` has `id, problemId, author, body, createdAt, upvotes, upvotedByMe` (`comments.ts:3`) | `addComment`, `toggleUpvote`, `deleteComment` | 3 |
| 10 | `deepforge:forum` | `{ threads: ForumThread[], replies: ForumReply[], upvotedThreads: string[], upvotedReplies: string[] }` (`comments.ts:138`) | `createThread`, `addReply`, `upvote*`, `deleteThread`, `seedForum` | 3 |
| 11 | `deepforge:username:v1` | bare trimmed string (`leaderboard.ts:20`, also read by `comments.ts:179`) | `setUserName` | 2 |
| 12 | `deepforge-theme` | next-themes string (`ThemeProvider.tsx:21`) | next-themes | never (device pref) |

Derived, not stored: Flame Score (`Easy=1, Medium=3, Hard=5`), solved count, current/longest streak
(`leaderboard.ts:24-81`), contest/interview bests, lab/research rollups. The leaderboard today is
12 static bots plus "you" (`leaderboard.ts:110`); only the username persists.

Gotchas that shape the design:
- `deepforge:labs` and `deepforge:forum` lack a `:v1` suffix; keep keys frozen and map by store id, not by key pattern.
- `backup.ts:23` `PROGRESS_CHANGE_EVENTS` is missing `lab-change`, `research-change`, `forum-change`; add these in Phase 1 so import/clear refreshes every view.
- `savedCode` is by far the largest payload (~KB per problem). Sync it debounced or isolate it — see §3.
- `upvotedByMe` is per-user state mixed into the comment record; remotely it becomes a join table.

## 2. Supabase schema

Catalog data (problems, labs, research challenges) stays in `src/data`; the DB only stores user and
social rows. `problems` is a thin mirror so the leaderboard can compute weights server-side.

```sql
-- identity
profiles(id uuid PK references auth.users on delete cascade, username text unique not null,
         created_at timestamptz default now(), updated_at timestamptz default now())

-- personal progress (mirrors #1, #6, #7, #8)
problem_progress(user_id uuid, problem_id text, last_opened timestamptz, attempted bool default false,
  solved bool default false, solved_at timestamptz, saved_code text, updated_at timestamptz,
  PK(user_id, problem_id))                         -- index (user_id, solved)
penpaper_progress(user_id, problem_id, attempted bool, correct bool, last_at timestamptz,
  PK(user_id, problem_id))
lab_records(user_id, lab_id text, best float8, attempts int, passed bool, updated_at,
  PK(user_id, lab_id))
research_state(user_id, challenge_id text, best_score float8, best_at timestamptz,
  beaten_baseline bool, PK(user_id, challenge_id))
research_attempts(id bigint identity PK, user_id, challenge_id text, score float8, created_at)

-- habits and results (mirrors #2, #3, #4, #5)
daily_solves(user_id, solved_on date, problem_id text, created_at, PK(user_id, solved_on))
collections(id text PK, user_id, name text, description text, problem_ids text[], created_at, updated_at)
contest_results(id bigint identity PK, user_id, contest_id text, score int, solved int, total int,
                duration_seconds int, completed_at timestamptz)
interview_results(id bigint identity PK, user_id, track_id text, solved int, total int, seconds int,
                  completed_at timestamptz)

-- social (mirrors #9, #10)
comments(id text PK, problem_id text, author_id uuid, author_name text, body text,
         upvote_count int default 0, created_at timestamptz)
comment_upvotes(user_id, comment_id text, PK(user_id, comment_id))
forum_threads(id text PK, author_id uuid, author_name text, title text, body text, category text,
              problem_refs text[], upvote_count int default 0, created_at timestamptz)
forum_replies(id text PK, thread_id text references forum_threads on delete cascade, author_id uuid,
              author_name text, body text, upvote_count int default 0, created_at timestamptz)
forum_thread_upvotes(user_id, thread_id text, PK(user_id, thread_id))
forum_reply_upvotes(user_id, reply_id text, PK(user_id, reply_id))

-- leaderboard support
problems(id text PK, category text, difficulty text)          -- seeded from src/data by script
user_stats(user_id uuid PK, score int, solved int, current_streak int, longest_streak int,
           updated_at timestamptz)                            -- maintained by trigger on problem_progress
view leaderboard as select p.username, s.* from user_stats s join profiles p on p.id = s.user_id
```

RLS policies (all tables `enable row level security`; anon key is public, so RLS is the boundary):

| Table group | select | insert / update / delete |
|---|---|---|
| `problem_progress`, `penpaper_progress`, `lab_records`, `research_*`, `daily_solves`, `collections`, `contest_results`, `interview_results` | `auth.uid() = user_id` | same, `with check (auth.uid() = user_id)` |
| `profiles` | `true` (username is public) | insert/update own row only |
| `comments`, `forum_threads`, `forum_replies` | `true` (anon read allowed) | insert `auth.uid() = author_id`; update/delete author only; `author_name` is a snapshot for old rows |
| `*_upvotes` | own rows + aggregate count comes from parent `upvote_count` | insert/delete own row only |
| `problems` | `true` | service role / seed script only |
| `user_stats`, `leaderboard` view | `true` | trigger / security definer only |

Counter integrity: clients must never update `upvote_count` directly. Use a `security definer` RPC
`toggle_upvote(target text, id text)` that flips the join row and adjusts the counter atomically
(same pattern for `forum_thread_upvotes` / `forum_reply_upvotes` / `comment_upvotes`).

## 3. Storage abstraction

Goal: existing store APIs (`getProgress`, `markSolved`, …) and all components stay source-compatible;
only the internals of `src/lib/*.ts` change to route through adapters. Local reads stay synchronous so
SSR and first paint are unaffected.

New folder `src/lib/sync/`:

- `types.ts` — `type StoreId = "progress" | "daily" | "collections" | "contests" | "interview" |
  "penpaper" | "labs" | "research" | "comments" | "forum" | "username"`.
- `types.ts` — `interface PersistedStore<T> { id: StoreId; version: number; empty(): T;
  parse(raw: string | null): T; serialize(v: T): string }` (reuses the validation already in each store).
- `localAdapter.ts` — `interface LocalAdapter<T> { read(): T | null; write(v: T): void; remove(): void }`,
  a thin wrapper over `window.localStorage` preserving today's try/catch + change-event behavior.
- `remoteAdapter.ts` — `interface RemoteAdapter<T> { pull(): Promise<T | null>;
  push(v: T): Promise<void>; subscribe(cb: (v: T) => void): () => void;
  migrate(local: T): Promise<T> }`. Implemented per store in `remote/*.ts` with its own row mappers.
- `store.ts` — `createStore<T>(spec)` returns `{ get(): T; set(v: T): void; clear(): void }`.
  `set` is local-first: write localStorage, dispatch the existing event immediately, then debounce a
  `push` (~1.5s, retry/backoff, flush on `visibilitychange`). `get` is synchronous from local.
- `backend.ts` — `selectBackend(): "local" | "remote"`; remote only when both env vars exist and
  `getSupabase()` has a session. `getSupabase(): Promise<SupabaseClientLike | null>` does a cached
  dynamic `import("@supabase/supabase-js")` inside try/catch; if the package is absent it returns null
  and the app silently stays local. **Add the dep only in Phase 2** (`optionalDependencies`), so the
  Phase 1 bundle is unchanged and `next build` works without Supabase installed.
- `migrate.ts` — pure mappers local ⇄ rows per store, plus `backupPayloadToRemote(json)` that reuses
  `exportProgress()` as the migration input.

Conflict policy (applied in `migrate.ts` and on pull):
- `progress`, `penpaper`: field-level last-write-wins, `solved`/`correct` sticky true.
- `daily`: union `solvedDates`, then recompute streak from the sorted dates.
- `collections`: LWW per collection via `createdAt` (add `updatedAt` in Phase 1 for edits).
- `contests`, `interview`, `research_attempts`: append rows; best values are derived, never edited.
- `labs`: max best, max attempts, `passed` sticky true.
- `comments`, `forum`: server authoritative after first migration; local seeds are pushed once, then
  remote wins (dedupe seeds by stable `ft-seed-*`/`fr-seed-*` ids).
- `username`: claim once via unique `profiles.username`; on conflict, prompt for a new handle.

## 4. Auth flow and first-sign-in migration

Default mode is **anonymous local**: no network, no banner, no gating. Auth is a single optional
"Sync across devices" entry in the Header/About backed by Supabase magic links.

1. `signIn(email)` → `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } })`.
   Supabase-js persists its own session under `sb-<ref>-auth-token`; it never touches `deepforge:` keys.
2. Session detection on load (`onAuthStateChange` + `getSession`) flips `selectBackend()` to remote and
   triggers `syncNow()`; no session or no env → local path exactly as today.
3. First sign-in migration:
   a. Read `profiles.synced_at` for the user (via a `profiles` row).
   b. If remote empty → push local: parse `exportProgress()`, run per-store `migrate()` → row upserts in
      dependency order (`profiles` → `problem_progress`/`daily_solves` → derived `user_stats`).
   c. If remote non-empty and local non-empty → run the merge rules above, then push the merged result
      and hydrate local from the merge; never delete local rows that failed to push.
   d. If local empty and remote non-empty (new device) → pull, write each store via its local adapter,
      and dispatch the existing `deepforge:*-change` events (`backup.ts:23` list + the 3 missing ones).
   e. Set `profiles.synced_at`; local data is retained verbatim, so signing out loses nothing.
4. Ongoing sync: push on local writes (debounced), pull on focus/online, realtime only for Phase 3
   tables. Failures are silent to the user and never block the local write.
5. `setUserName` after sign-in updates `profiles.username`; `getUserName` still reads local first.

## 5. Phased rollout

**Phase 1 — adapter seam, local-only (no user-visible change).**
- Add `src/lib/sync/` interfaces + `LocalAdapter`; refactor each `src/lib/*.ts` store to read/write
  through `createStore` while keeping identical keys, parse rules, events, and synchronous reads.
- Add the missing `lab-change` / `research-change` / `forum-change` events to `backup.ts`.
- Add `updatedAt` to `collections` (migration-safe: default to `createdAt`).
- No Supabase dep, no env vars, no network. Acceptance: existing `bun test` suites (`tests/lib.test.ts`,
  `tests/backup.test.ts`, `tests/daily.test.ts`) pass unchanged; offline behavior identical.

**Phase 2 — optional personal sync.**
- Install `@supabase/supabase-js` as `optionalDependencies`; ship `backend.ts`, `remote/*.ts`, migration.
- Add migration SQL (tables, RLS, `toggle_upvote` not needed yet) + `problems` seed script from `src/data`.
- Ship the magic-link UI and first-sign-in migration; add sync tests with a mocked client.
- Acceptance: local-only build runs with the dep absent/unset; signed-in user round-trips progress,
  streak, collections, and records across two browsers; export/import still works offline.

**Phase 3 — social and global leaderboard.**
- Flip `comments` and `forum` to remote (server authoritative), including upvote RPCs, author-only
  delete, report/flag field, and pagination. Seed threads pushed as ordinary rows.
- Replace bot leaderboard with `leaderboard` view; keep bots as a local fallback when offline.
- Add realtime subscriptions for forum/comments; rate limits on posting; moderation runbook.
- Acceptance: two accounts see the same threads and counts; offline mode still renders local cache and
  queues writes.

Open decisions before Phase 2: whether `savedCode` syncs at all (privacy/size) or moves to its own
`code_saves` table; whether local `col-*` / `ft-*` ids are kept as text PKs (recommended) or remapped
to uuid; and username uniqueness prompts vs. silent suffixing.
