# DeepForge — Next Wave Plan

Branch `surpass-deepml` · commit `486d209` · written 2026-09-13.
Scope: deploy, performance, comments UI, e2e smoke, social scale, SEO, content growth, a11y, Supabase hardening, PWA.
No code changes in this document — it is the working plan handed to the next wave of agents.

---

## 1. Status snapshot

| # | Area | Status | Notes |
|---|------|--------|-------|
| 1 | Problem bank | Done | 5,050 problems · 15 categories · 1,819 Easy / 2,248 Med / 983 Hard |
| 2 | Quality gates | Done | `verify-problems.ts` (real Python) + `verify-paths.ts` + `verify-paths-content.ts`; 239 `bun test` greens |
| 3 | Routes | Done | 23 real destinations, section modals retired; home is a short landing |
| 4 | Learning paths | Done | 28 curated paths with stages, SSG detail pages |
| 5 | Supabase schema | Live | Project `klogjcspyiygnggmugjy`; `profiles`, `user_stores`, `user_stats`, `leaderboard` view, comments/forum tables, `toggle_*_upvote` RPCs |
| 6 | Sync engine | Done | Local-first adapters + remote merge (`src/lib/sync/*`), SyncPanel, offline-safe env gating |
| 7 | Auth | Code done | Magic link + Google OAuth call shipped (`src/lib/auth.ts`); Google provider + redirect URLs pending in dashboards |
| 8 | Leaderboard | Live | Reads the live `leaderboard` view when signed in; local bots remain offline fallback |
| 9 | Discuss / comments | Partial | Forum remote layer wired; per-problem comment API (`listComments`/`createComment`) has **no UI** |
| 10 | Social scale | Missing | No realtime subscriptions, no pagination — `select("*")` everywhere |
| 11 | Performance | Gap | `src/data/problems` is 6.3 MB imported by many client components; no split/streaming |
| 12 | Deploy | Not done | No Vercel project; `NEXT_PUBLIC_SITE_URL` falls back to `deepforge.app` |
| 13 | SEO | Code done, unverified | Canonicals/OG/sitemap/robots present; manifest says “2,400+”, layout says “3,400+”; live checks pending |
| 14 | PWA / offline | Partial | SW v1 caches `/` + Pyodide CDN; offline fallback only `/` |
| 15 | Accessibility | Open | Phase 3 audit never finished; new routes + comments UI need keyboard/SR pass |

---

## 2. User action items (human-only)

**U-1 · Google Cloud OAuth client**
- `console.cloud.google.com` → APIs & Services → OAuth consent screen → External; set app name + support email; scopes `email` and `profile`; add your Google account under Test users while the app is in Testing.
- APIs & Services → Credentials → Create credentials → OAuth client ID → **Web application**.
- Authorized JavaScript origins: `http://localhost:3001`, `http://localhost:3099`, production origin.
- Authorized redirect URIs (exact, no trailing slash): `https://klogjcspyiygnggmugjy.supabase.co/auth/v1/callback`.
- Copy the Client ID + Client secret.

**U-2 · Enable the provider in Supabase**
- Dashboard → project `klogjcspyiygnggmugjy` → Authentication → Providers → Google → enable → paste Client ID/secret → Save.
- The client calls `signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } })` (`src/lib/auth.ts:72`), so every origin must also be listed in U-3.
- If not enabled, the button shows the provider error inline; magic links keep working.

**U-3 · Supabase Auth URL configuration (magic link + Google)**
- Dashboard → Authentication → URL Configuration.
- Site URL: production origin (e.g. `https://deepforge.vercel.app` or the custom domain).
- Redirect URLs: `http://localhost:3001`, `http://localhost:3099`, the production origin, and optionally the Vercel preview glob `https://*-<team-slug>.vercel.app/**`.
- Magic-link template uses the default `{{ .ConfirmationURL }}` — no change needed.

**U-4 · Vercel import + environment variables**
- `vercel.com` → Add New → Project → Import the GitHub repo. Framework auto-detects Next.js; no build config needed.
- Settings → Environment Variables, add for **Production, Preview, and Development**:
  - `NEXT_PUBLIC_SUPABASE_URL=https://klogjcspyiygnggmugjy.supabase.co`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...` (from `.env.local`)
  - `NEXT_PUBLIC_SITE_URL=https://<final-origin>` — set this **before** the first indexed deploy; canonicals/OG/sitemap bake at build time.
- Deploy; redeploy after any env change (`NEXT_PUBLIC_*` is build-time). Unset Supabase vars keep the deployment fully local.

**U-5 · Custom domain + email deliverability**
- Vercel → Settings → Domains → add domain + DNS. Then update `NEXT_PUBLIC_SITE_URL` (and redeploy), Supabase Site URL + Redirect URLs, and Google authorized origins.
- Supabase Authentication → Emails/SMTP: attach custom SMTP before public launch — the default sender is rate-limited to a few magic-link emails per hour.
- Optional: brand the confirmation email template.

---

## 3. Next wave — agent-sized tasks

Ordering reflects user priority (a)–(j); each task is scoped for one agent, one work package.

**NW-01 · Vercel production readiness + deploy runbook** · `M` · deps: U-4, U-5
- Why: nothing is public yet; deploy is the gate for every other priority (SEO, e2e, auth verification).
- Files: new `docs/DEPLOY-VERCEL.md`, `.env.example` comment, `README.md` (deploy section), optional `vercel.json`.
- Accept: `bun run build` clean with and without Supabase env; preview serves `/`, `/problems/[id]`, `/paths/[slug]`, `/discuss`; smoke checklist signed off; built HTML contains no `deepforge.app` fallback origin.
- Gate: `bun run build` + route smoke checklist (NW-04) + `curl -sI` 200s on preview.
- Complexity: M. Deps: NW-04 local suite can start sooner.

**NW-02 · Problem bundle performance / code-splitting** · `L` · deps: none (do first)
- Why: 6.3 MB data dir is imported by many client components; likely the largest JS chunk and the main mobile TTI cost.
- Files: `src/data/problems/index.ts` + category indexes, `src/components/PracticeBrowser.tsx`, `ProblemList.tsx`, `CommandPalette.tsx`, new lightweight index module.
- Approach: split a light list index (id/title/category/difficulty) from heavy payloads (starterCode/solution/testCases); lazy-load full problem on open; prefer server components for static data.
- Accept: record baseline route JS first, then cut `/problems` first-load JS (target ≥40%); problem open stays instant; no behavior regressions.
- Gate: `bun run build` route-size comparison + `bunx tsc --noEmit` + `bun test`.
- Complexity: L. Deps: must land before NW-07 to freeze the data index shape.

**NW-03 · Per-problem comments UI** · `M` · deps: none (live remote check needs U-2/U-3)
- Why: `listComments`/`createComment` shipped with the remote merge logic but no component renders them; forum ≠ per-problem comments.
- Files: new `src/components/CommentThread.tsx`, `src/components/ProblemView.tsx` (section/tab under Discuss), `src/lib/sync/social.ts` (remote `toggleCommentUpvote`/`deleteComment` wrappers), `tests/social.test.ts`.
- Accept: signed-out users read/write local comments; signed-in users see merged remote comments with optimistic upvote/delete; offline writes queue per the existing merge pattern; aria labels + 375px clean.
- Gate: `bun test` + `bunx tsc --noEmit` + `npx eslint` on touched files + `bun run build`.
- Complexity: M. Deps: none locally; Google/magic-link config only for the live path.

**NW-04 · End-to-end smoke suite (Playwright or scripted)** · `M` · deps: NW-01 for live run
- Why: 239 unit/data tests cover zero routes or user flows; deploy regressions (redirects, Pyodide, auth callback) would ship silently.
- Files: new `e2e/` + `playwright.config.ts` + `package.json` script (dev-only dep — flag it), or fallback `scripts/smoke.sh` curl suite.
- Accept: covers 23 routes (200 + no console errors), practice flow (open problem → run → results), theme toggle, command palette, auth redirect URL shape; runnable against `next start` or a preview URL.
- Gate: `bunx playwright test` (or `bash scripts/smoke.sh`) green against `bun run build && bun start`.
- Complexity: M. Deps: NW-01 for the deployed target.

**NW-05 · Social realtime + pagination** · `L` · deps: NW-03 (serialize on `social.ts`)
- Why: `listThreads`/`listReplies` fetch everything once and `subscribe()` is only a local event bus; forums degrade as soon as real users post.
- Files: `src/lib/sync/social.ts` (order/range + `postgres_changes` subscription with teardown), `src/components/Discuss.tsx` (load-more, live insert), `tests/social.test.ts`.
- Accept: newest-first with cursor/limit (~20/page); open thread subscribes and merges inserts/updates without refetch; unsubscribe on unmount/switch; no duplicate after own insert; offline snapshot unchanged.
- Gate: `bun test` + `bunx tsc --noEmit` + `npx eslint` + `bun run build`.
- Complexity: L. Deps: NW-03; two-account live check needs U-2/U-3.

**NW-06 · SEO + metadata truth pass** · `S` · deps: NW-01
- Why: canonicals/OG are wired but never checked live, and stale counts ship publicly (manifest “2,400+”, layout “3,400+”, sitemap hardcoded `lastModified`, AGENT_CONTEXT says 24 paths vs 28).
- Files: `src/app/layout.tsx`, `src/app/manifest.ts`, `src/app/sitemap.ts`, `src/app/problems/[id]/page.tsx`, `README.md`, `AGENT_CONTEXT.md`.
- Accept: every count derives from `PROBLEMS.length`/`getAllPaths()`; live `/robots.txt`, `/sitemap.xml`, one problem OG, one path OG verified; canonical origin == deployed `NEXT_PUBLIC_SITE_URL`.
- Gate: `bun run build` + curl checks on preview + OG debugger pass.
- Complexity: S. Deps: NW-01.

**NW-07 · Content growth batch: +500 problems / category rebalance** · `L` · deps: NW-02
- Why: thin categories (Calculus/Statistics/Probability/NLP/Optimization at 275–320) trail the leaders; deepen LLM-systems coverage toward parity.
- Files: `src/data/problems/<category>/part-NN.ts` + category `index.ts` (coordinate with NW-02), count updates in `AGENT_CONTEXT.md`/`README.md`.
- Accept: +500 verified problems (suggest 5 cats × 100), no duplicate titles/ids, mix ~35/45/20, verifier prints `ALL GREEN`.
- Gate: `bun run scripts/verify-problems.ts` + `bun test` data tests + `bun run build`.
- Complexity: L. Deps: NW-02 (index shape frozen first); parallel with non-data lanes afterwards.

**NW-08 · Accessibility audit pass** · `M` · deps: NW-03, NW-04
- Why: Phase 3 audit is still open; modal retirement moved focus handling and the comments UI adds new keyboard/SR surface.
- Files: `src/components/Header.tsx`, `NavMenus.tsx`, `CommandPalette.tsx`, `ProblemView.tsx`, `src/app/layout.tsx` (skip link), `globals.css`.
- Accept: keyboard-only path home → nav → problems → open/close ProblemView → run tests → comments; visible focus rings; Escape semantics; VoiceOver pass on nav + ProblemView; `prefers-reduced-motion` respected; axe clean on key routes.
- Gate: axe/Playwright a11y spec + manual checklist + `bunx tsc --noEmit` + `bun run build`.
- Complexity: M. Deps: NW-03 (comments), NW-04 (automation).

**NW-09 · Supabase production hardening** · `M` · deps: U-1..U-4, NW-01
- Why: schema is live but never exercised by a second account; no posting rate limits; default SMTP is rate-limited; counters depend on RPC discipline.
- Files: new `supabase/migrations/<ts>_hardening.sql` (rate-limit guard, missing indexes), `docs/SETUP-SUPABASE.md` (fix its `migrations/` path to `supabase/migrations/`, add SMTP + two-account matrix).
- Accept: account A cannot read/delete account B's `user_stores`/comments; upvote counts match RPC results; indexes on `comments.problem_id`, `forum_replies.thread_id`, `user_stats.score`; RLS true on every public table; rate limit documented/applied.
- Gate: SETUP §4 SQL verification + documented two-account manual matrix.
- Complexity: M. Deps: U-1..U-4, NW-01.

**NW-10 · PWA / offline improvements** · `S` · deps: NW-06 (manifest counts)
- Why: SW v1 only precaches `/`; offline navigation to other routes and SW upgrade UX are rough.
- Files: `public/sw.js`, `src/components/PwaManager.tsx`, `src/app/manifest.ts`.
- Accept: offline fallback for any route (cached shell + retry), Pyodide cache preserved across SW version bumps by intent, “update available” prompt applies the new SW, Lighthouse PWA installable.
- Gate: DevTools offline test + Lighthouse PWA audit + `bun run build`.
- Complexity: S. Deps: NW-06.

**NW-11 · Google OAuth end-to-end verification** · `S` · deps: U-1..U-3, NW-01
- Why: code shipped but the provider is disabled; a silent failure would block the primary sign-in path with no test coverage.
- Files: `src/components/SyncPanel.tsx` (error copy only if needed), `tests/auth-google.test.ts` (extend), `docs/SETUP-SUPABASE.md` (close the loop).
- Accept: Google button → consent → back on origin with session; SyncPanel shows email; progress round-trips across two browsers; disabled-provider error renders inline.
- Gate: manual two-browser check + `bun test` + `bunx tsc --noEmit`.
- Complexity: S. Deps: user items U-1..U-3, NW-01.

---

## 4. Risk register (top 6)

| # | Risk | Mitigation |
|---|------|------------|
| 1 | 6.3 MB data dir regresses build/TTI or bloats every client chunk | NW-02 with a recorded JS baseline and a budget check in CI; never import full problem objects into client components |
| 2 | Public Supabase key + RLS gap leaks cross-user data | NW-09 two-account matrix; RPC-only counter writes; service key/db password never in `NEXT_PUBLIC_*`; verify RLS on every table |
| 3 | Auth redirect misconfiguration breaks sign-in on prod/preview | Exact URI checklist (U-1..U-3); errors surfaced inline in SyncPanel; magic link stays as fallback |
| 4 | Realtime/pagination changes break local-first merge invariants (dupes, lost local writes) | Keep adapters local-first; mocked-client tests in `tests/social.test.ts`; feature-flag realtime; assert offline path unchanged |
| 5 | Content growth adds wrong/duplicate problems and inflates the bundle | Write in chunks of ~15, per-part verifier (`ALL GREEN`), unique-title check, land after NW-02's index split |
| 6 | Stale metadata published under the wrong origin (`deepforge.app` fallback) poisons SEO | Set `NEXT_PUBLIC_SITE_URL` before first indexed deploy; noindex previews; NW-06 live canonical/OG verification |

---

## 5. Suggested parallelization

**Human track (unblocks everything):** U-1 → U-2 → U-3 → U-4 → U-5, any time now.

**Agent lanes (3–4 concurrent):**

- **Lane A — Deploy + SEO:** NW-01 → NW-06 → NW-11 (serial on the live origin). Owns `docs/DEPLOY-VERCEL.md`, `layout.tsx`, `manifest.ts`, `sitemap.ts`.
- **Lane B — Performance → Content:** NW-02 first (owns the data index shape), then NW-07 part files in parallel with everything else.
- **Lane C — Community:** NW-03 → NW-05 (serial — both edit `src/lib/sync/social.ts` and `ProblemView.tsx`).
- **Lane D — Quality/infra:** NW-04 (new `e2e/`) then NW-08 (a11y, after NW-03 lands), NW-09 (SQL/migrations, once U-4 is done), NW-10 (`public/sw.js`) interleaved.

**File-ownership conflicts to avoid:**
- `src/components/ProblemView.tsx` — NW-03 then NW-08 (never concurrent).
- `src/lib/sync/social.ts` — NW-03 then NW-05 (never concurrent).
- `src/data/problems/**` indexes — NW-02 then NW-07 (never concurrent).
- `src/app/layout.tsx` / `manifest.ts` — NW-06 only; NW-10 touches only the manifest timestamp/content after NW-06.
- `public/sw.js` — NW-10 only.
