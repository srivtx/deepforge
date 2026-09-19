# DeepForge — Next Wave Plan

Written 2026-09-13; refreshed 2026-09-14 after waves 27–29 and 2026-09-17 after waves 32–33, the Papers curriculum, and the `/start` layout pass, 2026-09-18 after wave 44, and 2026-09-19 after wave 48.
Scope: deploy, SEO truth, Supabase verification, and the wave-2 feature shortlist.
This is a working plan: shipped work is folded into the snapshot and is not repeated as tasks.

---

## 1. Status snapshot

| # | Area | Status | Notes |
|---|------|--------|-------|
| 1 | Problem bank | Done | 5,730 across 15 categories · 2,058 Easy / 2,553 Medium / 1,119 Hard |
| 2 | Quality gates | Done, in CI | `verify-problems.ts` (real Python) + `verify-paths.ts` (capstones 33/33) + `verify-paths-content.ts`; 1,785 `bun test` greens (87 files); GitHub Actions (`.github/workflows/ci.yml`) runs every gate, the build, and the 199-check e2e smoke |
| 3 | Routes | Done | 36 user-facing destinations incl. `/today`, `/review`, `/alibi`, `/ledger`, `/keyfuse`, `/warrant`, `/reprogpu`, `/inventions`, `/verify`, `/concepts`, and `/papers`; lab/research detail pages + `/labs/trails`; projects have detail pages at `/projects/[id]`; section modals retired; home is a short landing |
| 4 | Learning paths | Done | 33 curated paths with stages, checkpoints, resolved prerequisites, artifacts, hours, and a verified capstone each (33/33) |
| 5 | Supabase schema | Live | Project `klogjcspyiygnggmugjy`; 3 migrations incl. hardening (indexes, posting rate limit, RLS tightening) |
| 6 | Sync engine | Done | Local-first adapters + remote merge (`src/lib/sync/*`), SyncPanel, offline-safe env gating; concept, agentic-attempt, and bug-hunt stores merge per their own rules (later due/at wins, sanitized) |
| 7 | Auth | Code done, config open | Magic link + Google OAuth client shipped; provider + redirect URLs pending (U-1..U-3) |
| 8 | Leaderboard | Live | Reads the live `leaderboard` view when signed in; weekly mode (Monday-local week, bots rotate each week); local bots remain the offline fallback |
| 9 | Discuss / comments | Done | Forum pagination + realtime, plus a per-problem comments UI (`src/components/ProblemComments.tsx`) |
| 10 | Social scale | Done | `postgres_changes` subscriptions with teardown + cursor pagination in `src/lib/sync/social.ts`; local-first study groups with join codes and buddy nudges (Supabase-backed when signed in) |
| 11 | Performance | Done | Light problem index, per-route picks (daily problem, leaderboard scoring), a lazy Zero mount, and fully prerendered problem pages served edge-static; home 276.6 KB gzip (from 1,553 KB); gzip budgets enforced by `scripts/measure-bundle.ts --check` (4/4 PASS); Vercel history bounded by `bun run prune:vercel` |
| 12 | Deploy | Live | Vercel project `deepforge` deploys from `main`; deployment history bounded by `bun run prune:vercel`; remaining: set `NEXT_PUBLIC_SITE_URL` so canonicals/OG leave the `deepforge.app` fallback |
| 13 | SEO | Done | `layout.tsx` and `manifest.ts` derive the count from the generated index; `sitemap.ts` derives `lastModified` (blog posts use publish dates, the rest the build date) and lists `/today`, `/labs/trails`, `/concepts`, all 13 lab/research detail URLs, and all 35 paper URLs; OG kinds `research` and `lab`; deploy-time origin check rides with NW-01 |
| 14 | PWA / offline | Done | SW v12: per-route offline fallback verified by a route-inventory test (`tests/offline.test.ts`, which now models nested static routes) + “update available” prompt (`PwaManager.tsx`); `/labs/trails`, `/concepts`, `/papers`, `/review`, `/inventions`, `/alibi`, `/ledger`, `/keyfuse`, `/warrant`, and `/reprogpu` are precached and `/labs/`, `/research/`, `/papers/`, `/inventions/`, and `/ledger/` have navigation fallbacks |
| 15 | Accessibility | Done | Keyboard/focus pass shipped across dialogs, menus, palette, and threads; full screen-reader + contrast sweep remains |
| 16 | Certificates | Phase 1 shipped | Printable/PNG certificates (path, collection, category, lab, project, interview) + SHA-256 code + `/verify/<code>`; server-signed credentials are the follow-up |
| 17 | Habit layer | Done | Review queue, `/today` v2 (lab re-runs + math concepts due with inline grading, placement plan, stage-checkpoint row, "Do this next" ranker), one solve streak, streak shields, opt-in reminders, tiered hint budget, review health + weekly digest, bug hunts with badges, self-explanation gate, spot-the-bug; wave 40 replaced SM-2 with Ladder-Graded Spacing (execution-aware FSRS-6 noE variant) and moved readiness onto the same power-law curve |
| 18 | Study assistant | Done | Zero mounted on every route (lazy client wrapper), hide-to-dot with a saved preference, context-aware prompt chips on problem pages, 10 intents incl. what's due / am I ready and research/labs deep links |
| 19 | Search & shortcuts | Done | Palette search across problems, paths, articles, and blog (generated light article index), plus all 5 research challenges, 8 labs, and 35 papers (title + keyword scoring) + quick actions (labs, lab trails, research); g-sequences and a `?` overlay |
| 20 | Pyodide execution | Done | Web Worker by default with a main-thread fallback (`deepforge:pyodide-worker=off` opts out); lazy loader + SW cache retained |
| 21 | Content polish | Done | Sim intuition checks, article "predict the readout" kernels, full local backup inventory with audited exclusions, speedrun misses drill playlist |
| 22 | Research & labs UX | Done | `/research` and `/labs` are link grids with live record badges; `/research/[id]` (5) and `/labs/[id]` (8) are static (`dynamicParams = false`) detail pages with theory notes (`researchTheory.ts`, `labTheory.ts`), deterministic SVG data previews (`src/lib/researchViz.ts` + `src/components/viz/*`), hints, and scored workspaces (hidden-test submit + last-5 attempts; timed runner with best score and reset); `/labs/trails` wraps the eight labs in four guided arcs with live per-trail progress |
| 23 | Concepts browser | Done | `/concepts` browses every math checkpoint grouped by category with mastery bars, due/locked status, prerequisite reasoning, worked steps, practice and code links, and the same self-grading as Today; a Map view layers the 21 checkpoints by prerequisite depth with pan/zoom, mastery shading, and a route planner (`src/lib/conceptGraph.ts`) |
| 24 | Papers curriculum | Done | "Understanding Papers": 35 DeepSeek papers across 4 eras (founding, efficiency, reasoning, frontier), DeepSeek LLM (Jan 2024) to V4.1 Flash; theory-first sections (visuals/formulas/Python), per-paper reading guide, lineage edges, and self-graded implementation MCQs; `/papers` + `/papers/<slug>` (statically generated); 18 deterministic SVG figure kinds (`src/components/papers/figures/*`); local store `deepforge:papers:v1` wired into sync + backup; sitemap lists all 35 URLs |
| 25 | Onboarding layout | Done | `/start` moved onto one shared column system (flow `max-w-2xl` / result `max-w-5xl` in `src/components/onboarding/layout.ts`), progress header, equal-height answer rows, and an aligned stat grid; no logic changes |
| 26 | Retention & navigation (wave 39) | Done | `/review` hub (14-day forecast, leech triage, interleaved drill, honest retention; `src/lib/reviewPlan.ts`); `/concepts` Map view + route planner; all 35 paper projects run in the browser through the existing lazy Pyodide worker; two new routes wired through nav, palette, sitemap, SW v7, offline registry, and smoke |
| 27 | Ladder-Graded Spacing + Inventions (wave 40) | Done | Scientist → two verifier-scientists → engineer pipeline: LGS ("noE", FSRS-6 power-law stability, ladder folded into observed difficulty and effort, guarded migration) measured at 24.20% [23.70, 24.70] fewer reviews than SM-2 across 30/30 seeds with better Brier and no edge-cohort regression; grading/ordering/readiness all delegate to `src/lib/lgs.ts`; `/inventions` publishes house papers as full pages plus a hand-rolled zero-dep PDF (`src/lib/pdf.ts`), first entry the LGS paper |
| 28 | Alibi Distance + Silent Bug Hunt (wave 41) | Done | Corpus census of silent survivors (46.08% of problems admit a radius-1 test-passing mutant; independent engine reproduces every rate), witness closure with sampled/fixed-basis guarantees, two clean negative results, blind audits; `/alibi` ships 96 machine-verified ghosts (reference and ghost both pass every shipped test, ghost diverges at the stored witness); resistance claims scoped to the named union/held-out suites after an independent novel-family attack caught 22/96 within 25 probes; bionic reading (default on) and real figures on paper pages and PDFs |
| 29 | Behavioral Delta Ledger (wave 42) | Done | Per-edit behavior deltas on a hidden basis derived from each problem's own tests: 10.23% probe-invisible mutants, 44.40% of problems carry a hidden-visible silent slip, held-out no-op detection 84.00/82.23%; `/ledger` is opt-in, count-only ("k of N hidden checks changed"), device-local with versioned keys excluded from sync and backup, never grading/review/certificates; `verify:bdl` census + harness-fixture gate runs in CI |
| 30 | KeyFuse cache-key auditing (wave 43) | Done | Novelty-first external invention (software, not product substrate): five probe strategies over a typed slot universe (file/env/cwd/locale/timezone/rng/clock), exact ≤t-support attribution within budget, minimal same-key / different-output witnesses, conservative key repair (declared ∪ implicated); 24-task corpus with brute-force necessary-coordinate ground truth (69/69 non-refused cells exact), Metro-style env-latent collision demo (file tracing and baseline toggling both miss it), negative controls (nondeterminism refused, untrappable read flagged); `/keyfuse` read-only lab + paper #4; `verify:keyfuse` gate (12 criteria, ≈140 ms, pinned aggregates) in CI |
| 31 | Refutation-Ledger Values + Warrant Lab (wave 44) | Done | Novelty-first external invention (software, not product substrate): ledger-warranted runtime values with an append-only falsification ledger, recomputed grade as declared dependence-class count (K=3 cap, cites-min), exact demotion through frozen cites, consistency + anchored hash-chain audit; Derived-Claim Arena (48 claims, 5 regimes, 9 graders, 200 frozen seeds) shows the shipped declared-dependence grade beating the strongest count baseline by +1.000 pair-win and +1.000 AUC in the correlated-family regime while the syntactic tuple variant is killed as predicted (F1), churn 0 and demotion precision/recall 1.0; `/warrant` read-only lab + paper #5; `verify:warrant` gate (8 criteria, pinned digest `ca0cda0f562b8c10`) in CI |
| 32 | REPROGPU cross-adapter WebGPU conformance (wave 48) | Done | After 19 surveys and 7 kill-gates found the obvious breakthrough spaces occupied, the surviving artifact: a declared integer/fixed-point WGSL kernel subset (320-bit exact f32 sum, Philox4x32-10 vs Random123 KATs, Q16.16 GEMM with one floor shift, integer SHA-256 vs FIPS/Node oracle) with an f32 matmul as the explicit negative control and the WGSL §15.7 float boundary documented; pure-TS reference gate (5 criteria, ~0.8 s, pinned hashes/counts/WGSL sources) in CI; `/reprogpu` browser lab runs the kernels and publishes an adapter manifest with per-kernel SHA-256; paper #6; honesty rule: CI checks references and vectors, the browser run is the cross-adapter demonstration. **Scope correction (post-publication, 2026-09-19):** a reader challenge surfaced live overlaps the prior-art pass missed — Coherence Energy Labs `gpu-exact` already demonstrates exact integer CPU-vs-GPU execution hashed and compared, and `stfurkan/bitgpu` ships bit-exact browser WebGPU integer execution — so REPROGPU is recorded as a narrow **artifact/conformance** contribution (GO-WEAK), **not** a novel method; the "unmatched" wording is retired, T1 and the prior-art doc carry the correction, and the paper's §2 plus claim ceiling state it explicitly |

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
- Gate: build + 165-check smoke against the preview + `curl -sI` 200s.

**NW-09R · Two-account RLS verification** · `S` · deps: U-2, U-3, NW-01
- Why: the hardening migration is written, but no second account has ever exercised the policies.
- Files: `docs/SETUP-SUPABASE.md` (record the run), no code expected unless a gap is found.
- Accept: account A cannot read/delete account B's `user_stores` or comments; upvote counts match the RPC result; posting rate limit observed.

**NW-11 · Google OAuth end-to-end verification** · `S` · deps: U-1..U-3, NW-01
- Why: code shipped but the provider is disabled; the primary sign-in path has no live coverage.
- Files: `src/components/SyncPanel.tsx` (error copy only if needed), `tests/auth-google.test.ts` (extend).
- Accept: Google button → consent → back on origin with a session; progress round-trips across two browsers; disabled-provider error renders inline.

**NW-12 · Docs truth pass on research notes** · `S` · deps: none
- Why: `docs/research/article-topics.md` still describes a 5,050-problem catalogue and 5 articles (5,730 and 14 now); `docs/research/path-curation.md` still says 28 paths and predates shipped recommendations 1, 2, 3 (partial), and 5, plus capstones. Remaining gap: mixed-kind path steps stay open there.
- Files: `docs/research/article-topics.md` (refresh “where the library is now”), `docs/research/path-curation.md` (mark shipped recommendations).
- Accept: both docs agree with `README.md`/`AGENT_CONTEXT.md` counts; no plan items presented as open when shipped.

---

## 4. Next-wave candidates (feature-gaps wave 2)

Detail and sourcing live in [`docs/research/feature-gaps-2026.md`](./research/feature-gaps-2026.md) §3–§4.

| Candidate | Effort | Depends on |
|---|---|---|
| Certificate signing phase 2 (Edge Function + public key) | M/L | U-4 |
| Server push reminders (subscriptions table + cron) | L | U-4; local reminder phase shipped |
| Server-side export/delete + privacy page | M | EU/public launch |
| Spoken mock interviews (agentic round shipped) | L | mutation + agentic libraries shipped |
| Leech policy: flag at 8 lapses, cap interval until two spaced clean passes (H4) | M | review hub shipped; LGS effort cap shipped for the interval half |
| Calibrate hint debits against real outcome data (invention doc risk #1) | M | LGS shipped |

---

## 5. Ownership conflicts that still apply

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
| 3 | Stale sitemap `lastmod` / drifting hardcoded counts poison SEO | Shipped: `manifest.ts` derives the count and `sitemap.ts` derives `lastModified`; set `NEXT_PUBLIC_SITE_URL` before first indexed deploy |
| 4 | Pyodide cold-start latency on mobile | Shipped: Web Worker execution by default (main-thread fallback); keep the lazy loader and SW Pyodide cache |
| 5 | Research docs drift from the code and misdirect agents | NW-12; `AGENT_CONTEXT.md` counts refreshed each wave |
