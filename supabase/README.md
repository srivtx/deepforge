# DeepForge Supabase

Migration + config for the optional sync/social backend (project ref
`klogjcspyiygnggmugjy`). Full operator instructions: [`../docs/SETUP-SUPABASE.md`](../docs/SETUP-SUPABASE.md).

- Apply schema: `npx supabase link --project-ref klogjcspyiygnggmugjy && npx supabase db push`
- New migration: `npx supabase migration new <name>` (then commit the SQL)
- Local stack (optional): `npx supabase start` / `npx supabase stop`

Schema overview:

| Object | Purpose | Access |
|---|---|---|
| `profiles` | username + sync timestamps | public select, own write |
| `user_stores` | generic JSONB per local `deepforge:*` store, whole-store LWW | own rows |
| `user_stats` | score/solved/streaks, client-upserted on sync | public select, own write |
| `leaderboard` (view) | join of `user_stats` + `profiles`, ordered by score | public select |
| `comments`, `forum_threads`, `forum_replies` | social content | public select, author write |
| `comment_upvotes`, `forum_thread_upvotes`, `forum_reply_upvotes` | one row per user/target | own rows |
| `toggle_*_upvote()` RPCs | atomic counter flip, returns new count | authenticated only |

Notes:

- `user_stores.store_id` is a store id (`progress`, `daily`, `collections`, `contests`,
  `interview`, `penpaper`, `labs`, `research`, `comments`, `forum`, `username`), not a
  localStorage key. Local keys stay frozen (`deepforge:labs` and `deepforge:forum` have
  no `:v1` suffix).
- Deleting an `auth.users` row cascades to `profiles`, `user_stores`, `user_stats`, and
  all upvotes; social content stays readable with a null `author_id` and its
  `author_name` snapshot.
- The app never requires Supabase: with the env vars unset it runs fully local.
