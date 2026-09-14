# DeepForge — Next Wave Plan

Written 2026-09-13; refreshed 2026-09-14 after waves 27–29.
Scope: deploy, SEO truth, Supabase verification, and the wave-2 feature shortlist.
This is a working plan: shipped work is folded into the snapshot and is not repeated as tasks.

---

## 1. Status snapshot

| # | Area | Status | Notes |
|---|------|--------|-------|
| 1 | Problem bank | Done | 5,550 across 15 categories · 1,994 Easy / 2,473 Medium / 1,083 Hard |
| 2 | Quality gates | Done, in CI | `verify-problems.ts` (real Python) + `verify-paths.ts` + `verify-paths-content.ts`; 567+ `bun test` greens; GitHub Actions (`.github/workflows/ci.yml`) runs every gate, the build, and the 136-check e2e smoke |
| 3 | Routes | Done | 27 user-facing destinations incl. `/today` and `/verify`; section modals retired; home is a short landing |
| 4 | Learning paths | Done | 33 curated paths with stages, checkpoints, resolved prerequisites, artifacts, and hours |
| 5 | Supabase schema | Live | Project `klogjcspyiygnggmugjy`; 3 migrations incl. hardening (indexes, posting rate limit, RLS tightening) |
| 6 | Sync engine | Done | Local-first adapters + remote merge (`src/lib/sync/*`), SyncPanel, offline-safe env gating |
| 7 | Auth | Code done, config open | Magic link + Google OAuth client shipped; provider + redirect URLs pending (U-1..U-3) |
| 8 | Leaderboard | Live | Reads the live `leaderboard` view when signed in; local bots remain the offline fallback |
| 9 | Discuss / comments | Done | Forum pagination + realtime, plus a per-problem comments UI (`src/components/ProblemComments.tsx`) |
| 10 | Social scale | Done | `postgres_changes` subscriptions with teardown + cursor pagination in `src/lib/sync/social.ts` |
| 11 | Performance | Done | Light problem index; home 283 KB gzip (from 1,553 KB); gzip budgets enforced by `scripts/measure-bundle.ts --check` |
| 12 | Deploy | Open | No Vercel project; `NEXT_PUBLIC_SITE_URL` still falls back to `deepforge.app` |
| 13 | SEO | Partial | `layout.tsx` derives the count; `manifest.ts` hardcodes “5,550+” (agrees today); `sitemap.ts` still uses one hardcoded `lastModified` (NW-06 remainder) |
| 14 | PWA / offline | Done | SW v3: per-route offline fallback + “update available” prompt (`PwaManager.tsx`) |
| 15 | Accessibility | Done | Keyboard/focus pass shipped across dialogs, menus, palette, and threads; full screen-reader + contrast sweep remains |
| 16 | Certificates | Phase 1 shipped | Printable/PNG certificates + SHA-256 code + `/verify/<code>`; server-signed credentials are the follow-up |
| 17 | Habit layer | Done | Review queue, `/today`, streak shields, opt-in reminders, readiness projection, self-explanation gate, spot-the-bug |

---

## 2. User action items (human-only)

**U-1 · Google Cloud OAuth client**
- `console.cloud.google.com` → APIs & Services → OAuth consent screen → External; app name + support email; scopes `email` and `profile`; add your account under Test users while in Testing.
- Credentials → Create credentials → OAuth client ID → **Web application**.
- Authorized JavaScript origins: `http://localhost:3001`, `http://localhost:3099`, production origin.
- Authorized redirect URIs (exact, no trailing slash): `https://klogjcspyiygnggmugjy.supabase.co/auth/v1/callback`.
- Copy the Client ID + Client secret.

**U-2 · Enable the provider in Supabase**
- Dashboard → project `klogjcspyiygnggmugjy` → Authentication → Providers → Google → enable → paste Client ID/secret.
- If not enabled, the button shows the provider error inline; magic links keep working.

**U-3 · Supabase Auth URL configuration (magic link + Google)**
- Dashboard → Authentication → URL Configuration.
- Site URL: production origin. Redirect URLs: `http://localhost:3001`, `http://localhost:3099`, the production origin, and optionally the Vercel preview glob.
- Magic-link template uses the default `{{ .ConfirmationURL }}` — no change needed.

**U-4 · Vercel import + environment variables**
- `vercel.com` → Add New → Project → Import the GitHub repo. Framework auto-detects Next.js.
- Environment Variables, for **Production, Preview, and Development**:
  - `NEXT_PUBLIC_SUPABASE_URL=https://klogjcspyiygnggmugjy.supabase.co`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...` (from `.env.local`)
  - `NEXT_PUBLIC_SITE_URL=https://<final-origin>` — set **before** the first indexed deploy; canonicals/OG/sitemap bake at build time.
- Deploy; redeploy after any env change (`NEXT_PUBLIC_*` is build-time). Unset Supabase vars keep a deployment fully local.

**U-5 · Custom domain + email deliverability**
- Vercel → Settings → Domains → add domain + DNS. Then update `NEXT_PUBLIC_SITE_URL` (redeploy), Supabase Site URL + Redirect URLs, and Google authorized origins.
- Supabase Authentication → Emails/SMTP: attach custom SMTP before public launch — the default sender is rate-limited to a few magic-link emails per hour.

---

## 3. Open tasks

**NW-01 · Vercel production readiness + deploy runbook** · `M` · deps: U-4, U-5
- Why: nothing is public yet; deploy is the gate for live SEO/auth verification.
- Files: new `docs/DEPLOY-VERCEL.md`, `.env.example` comment, `README.md` (deploy section), optional `vercel.json`.
- Accept: `bun run build` clean with and without Supabase env; preview serves `/`, `/problems/[id]`, `/paths/[slug]`, `/discuss`, `/verify`; smoke checklist signed off; built HTML contains no `deepforge.app` fallback origin.
- Gate: build + 136-check smoke against the preview + `curl -sI` 200s.

**NW-06R · SEO metadata truth pass (remainder)** · `S` · deps: NW-01 for live checks
- Why: one hardcoded `lastModified` still stamps ~5,600 sitemap URLs, `manifest.ts` hardcodes the problem count, and `/today` is missing from the route list.
- Files: `src/app/sitemap.ts` (derive `lastModified` per route type, add `/today`), `src/app/manifest.ts` (derive from `PROBLEMS.length` / `MARKETING_PROBLEM_COUNT`), `src/app/problems/[id]/page.tsx` (drop the third `categorySlug` copy).
- Accept: no hardcoded count or date in SEO surfaces; live `/robots.txt`, `/sitemap.xml`, one problem OG, one path OG verified; canonical origin == deployed `NEXT_PUBLIC_SITE_URL`.

**NW-09R · Two-account RLS verification** · `S` · deps: U-2, U-3, NW-01
- Why: the hardening migration is written, but no second account has ever exercised the policies.
- Files: `docs/SETUP-SUPABASE.md` (record the run), no code expected unless a gap is found.
- Accept: account A cannot read/delete account B's `user_stores` or comments; upvote counts match the RPC result; posting rate limit observed.

**NW-11 · Google OAuth end-to-end verification** · `S` · deps: U-1..U-3, NW-01
- Why: code shipped but the provider is disabled; the primary sign-in path has no live coverage.
- Files: `src/components/SyncPanel.tsx` (error copy only if needed), `tests/auth-google.test.ts` (extend).
- Accept: Google button → consent → back on origin with a session; progress round-trips across two browsers; disabled-provider error renders inline.

**NW-12 · Docs truth pass on research notes** · `S` · deps: none
- Why: `docs/research/article-topics.md` still describes a 5,050-problem catalogue and 5 articles; `docs/research/path-curation.md` recommendations 1, 3 (partial) and 5 shipped without a note.
- Files: `docs/research/article-topics.md` (refresh “where the library is now”), `docs/research/path-curation.md` (mark shipped recommendations).
- Accept: both docs agree with `README.md`/`AGENT_CONTEXT.md` counts; no plan items presented as open when shipped.

---

## 4. Next-wave candidates (feature-gaps wave 2)

Detail and sourcing live in [`docs/research/feature-gaps-2026.md`](./research/feature-gaps-2026.md) §3–§4.

| Candidate | Effort | Depends on |
|---|---|---|
| Certificate signing phase 2 (Edge Function + public key) | M/L | U-4 |
| Server push reminders (subscriptions table + cron) | L | U-4; local reminder phase shipped |
| Study groups + buddy nudges | L | U-2/U-3; deploy/traffic |
| Pyodide on a Web Worker | M | none |
| Concept review state on the sync seam (`concepts.ts`) | S | none |
| Server-side export/delete + privacy page | M | EU/public launch |
| Spoken mock interviews + agentic round roster | L | mutation library shipped |

---

## 5. Ownership conflicts that still apply

- `src/app/sitemap.ts` — NW-06R only.
- `src/lib/sync/social.ts` — serialize any social work on one lane.
- `src/lib/pyodide.ts` + any new worker module — worker lane only.
- `src/lib/concepts.ts` — concept-sync lane only.
- `src/components/ProblemView.tsx` — one lane at a time.
- `AGENT_CONTEXT.md` / `README.md` — orchestrator updates counts after merge.

---

## 6. Risk register (top 5)

| # | Risk | Mitigation |
|---|------|------------|
| 1 | Auth redirect misconfiguration breaks sign-in on prod/preview | Exact URI checklist (U-1..U-3); inline SyncPanel errors; magic link stays as fallback |
| 2 | RLS gap leaks cross-user data | NW-09R two-account matrix; RPC-only counter writes; no secrets in `NEXT_PUBLIC_*` |
| 3 | Stale sitemap `lastmod` / drifting hardcoded counts poison SEO | NW-06R derives both; set `NEXT_PUBLIC_SITE_URL` before first indexed deploy |
| 4 | Pyodide on the main thread freezes the UI on long solutions (mobile especially) | Move execution to a Web Worker; keep the lazy loader and SW Pyodide cache |
| 5 | Research docs drift from the code and misdirect agents | NW-12; `AGENT_CONTEXT.md` counts refreshed each wave |
