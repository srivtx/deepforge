# DeepForge

> Forge your ML skills. Build from scratch.

**by svx** · MIT Licensed

![License: MIT](https://img.shields.io/badge/License-MIT-7FFF9F.svg?style=flat-square)
![Next.js 16](https://img.shields.io/badge/Next.js-16-black.svg?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg?style=flat-square&logo=typescript)
![Pyodide](https://img.shields.io/badge/Pyodide-0.26-3776AB.svg?style=flat-square&logo=python)
![Problems](https://img.shields.io/badge/Problems-5%2C730-7FFF9F.svg?style=flat-square)
![Categories](https://img.shields.io/badge/Categories-15-507aa4.svg?style=flat-square)
![Learning paths](https://img.shields.io/badge/Learning%20paths-33-507aa4.svg?style=flat-square)

---

## What is DeepForge?

A practice platform for machine learning, math, and engineering. Write Python from scratch — no sklearn, no torch, no shortcuts. Every function is one you implement yourself. Real Python execution in your browser via Pyodide. Instant feedback against test cases. Progress saves locally, no account required. Free and open source.

## Why DeepForge

- **Verified from scratch** — 5,730 problems, every single solution executed in real Python (1e-6 deep-equality) before it ships
- **Runs in your browser** — Pyodide executes your code client-side; nothing to install, works offline once warm
- **Local-first, sync optional** — no account needed; sign in with a magic link or Google only if you want cross-device progress, a global leaderboard, and shared discussions
- **Real curriculum** — 33 learning paths with stages, goals, resolved prerequisites, adaptive per-stage checkpoints, a mini-project artifact per stage, a verified capstone (project, lab, contest, collection, or pen-and-paper set) per path, each with its own page
- **Beyond problems** — labs, research benchmarks, timed contests, speedruns, sims, notebook mode, and spaced-repetition review across code and pen-and-paper math
- **Fast by design** — a light problem index keeps the landing page at ~278 KB gzip; the full bank loads on demand
- **Discoverable** — 5,730 statically generated problem pages, 15 category hubs, 33 path pages, 35 paper pages, JSON-LD, OG images, sitemap, RSS
- **Open source** — MIT, file-based content, verifiable and diffable

## Categories (15)

| Category | Problems | | Category | Problems |
|---|---:|---|---|---:|
| Algorithms | 395 | | Optimization | 375 |
| ML Fundamentals | 360 | | NLP | 420 |
| Data Structures | 355 | | Statistics | 420 |
| Computer Vision | 395 | | Probability | 420 |
| Linear Algebra | 320 | | Calculus | 375 |
| Deep Learning | 455 | | Graph Algorithms | 360 |
| Reinforcement Learning | 360 | | Information Theory | 360 |
| Time Series | 360 | | **Total** | **5,730** |

## Features

- **Problems** — code editor, in-browser Pyodide execution, test cases, a tiered hint budget (approach after 1 failed run or 3 min; full solution after 2 or 6), saved code per problem
- **Paths** — 33 curated learning paths with stages, goals, resolved prerequisites, adaptive per-stage checkpoints (boss sets that react to your last attempt), a mini-project artifact per stage, a capstone per path, and progress; every path has a detail page
- **Today & review queue** — one zero-decision daily session: spaced repetition for code you have solved (Ladder-Graded Spacing, due/learning/new buckets), lab re-runs and math concepts that come due with inline grading, a weak-area pick, the daily problem, a placement plan, a stage-checkpoint-ready row, and a transparent "Do this next" pick
- **Silent Bug Hunt** — `/alibi`: a Python function that passes every shipped test but hides a one-line divergence; find an input that breaks it. Practice only — no grading, review, or certificates
- **Behavior ledger** — `/ledger`: after you edit your code, see whether the change altered behavior on up to 24 hidden checks derived from the problem's own tests — as a count, never a grade, never "better/worse"
- **Bionic reading + real PDFs** — every published invention defaults to bionic reading with a one-click switch to normal; each paper also ships a locally generated PDF with figures, tables, and formulas
- **Onboarding** — a three-minute diagnostic at `/start` that recommends paths, a first problem set, and a daily target
- **Projects** — 5 multi-step builds: GPT from scratch, neural network framework, search engine, recommender, CNN — each with a detail page
- **Labs** — 8 dataset-driven challenges with metrics, baselines, and time limits, scored in-browser; each has a detail page with theory, rules, a deterministic data preview, a timed runner, and a Python-verified reference solution behind a Show solution reveal
- **Lab trails** — four guided arcs over the eight labs with live per-trail progress and per-lab pass/best rows
- **Research** — 5 beat-the-baseline benchmarks against hidden test sets, best submissions saved locally; each has a detail page with course-note theory, a data preview, a verified reference solution, and a last-5-attempts workspace
- **Dataset previews** — deterministic SSR-safe SVG previews on every lab and research page (scatter with legend, correlation bars that accent the signal columns, a 4×4 next-token matrix, noisy windows against the clean wave)
- **Contests** — 12 timed sets (10–60 min) with countdown, difficulty-weighted scoring, and local results
- **Speedrun** — seeded timed solve-a-thons with shareable run codes, ghost races, and a one-click drill playlist built from your misses
- **Collections** — 24 premade sets with detail pages, plus user-created collections and shareable URLs
- **Playlists** — build, reorder, share, and fork problem playlists via compact `?playlist=` codes
- **Interview Prep** — 13 company tracks with paced practice, timed mocks, and an agentic round (instruct, review the plan, verify, diagnose the fix) against a deterministic copilot
- **Pen & Paper Math** — 60 no-code problems (multiple choice + numeric) with SM-2 mastery review
- **Review hub** — `/review` shows the whole spaced queue ordered by predicted recall: a 14-day forecast, trouble spots (repeated lapses), a deterministic interleaved catch-up drill, and an honest retention figure. Scheduling is Ladder-Graded Spacing, a house scheduler (see Inventions) that keeps the execution ladder — failed runs, hint tier, resets — as graded evidence
- **Inventions** — `/inventions` publishes the platform's own research papers as full pages (abstract, method, tables, SVG figures, numbered references) with a real generated PDF per paper (`/inventions/<slug>/paper.pdf`, hand-rolled zero-dependency renderer) and a stable citation block
- **KeyFuse** — `/keyfuse` is a read-only, in-browser cache-key auditor: it probes a task's declared inputs across a typed slot universe, prints a minimal same-key / different-output witness for an undeclared dependency, and emits a conservative repaired key (declared ∪ implicated). The fourth house paper documents the five probe strategies, the masking and anchoring counterexamples, and the honest limits — falsification-first, never a soundness claim
- **Warrant Lab** — `/warrant` is a read-only contestability lab: derived claims carry an append-only ledger of falsification attempts whose warrant grade is a recomputable function of declared dependency classes (K capped), a refutation demotes exactly the claims that cite it through frozen cites, and an audit rechecks the arithmetic and the anchored hash chain. The fifth house paper reports the Derived-Claim Arena (48 claims, 5 regimes, 200 frozen seeds) where the declared-dependence grade beats the strongest count baseline by +1.000 pair-win and AUC while the syntactic tuple variant is killed as predicted — never a truth claim
- **REPROGPU** — `/reprogpu` is a read-only WebGPU conformance lab: it runs a declared integer kernel subset (a 320-bit exact f32 sum, Philox4x32-10, Q16.16 GEMM, integer SHA-256) in your browser and compares each output's SHA-256 across adapters, with an f32 matmul as the explicit negative control. The sixth house paper documents the WGSL exactness boundary (float is outside the guarantee), the pinned reference hashes, and the honesty rule that CI checks the references and vectors while the browser run is the cross-adapter demonstration
- **Concepts** — browse every math checkpoint grouped by category with mastery bars, due/locked status, prerequisite reasoning, worked steps, practice and code links, and the same self-grading as Today; a Map view layers all 21 checkpoints by prerequisite depth with pan/zoom, mastery shading, and a From → To route planner
- **Notebook mode** — per-cell Python execution with run-all and test validation, persisted per problem
- **Self-explanation** — after a solve, explain the key step in your own words before moving on; graded deterministically, no model or network
- **Spot the bug** — find and explain a seeded mutation of a verified solution, test-checked before it is shown; rounds are tracked across devices with bug-slayer, exterminator, and flawless badges plus a daily quest
- **Sims** — optimizer race, neural-net trainer with decision boundary, Dijkstra step-through — each with a deterministic intuition check
- **Articles** — 14 interactive lessons with live demos (softmax temperature, eigenvectors, gradient descent, k-means, attention, BPE tokenization, embeddings, quantization, KV cache & FlashAttention, RAG chunk retrieval, post-training RLHF/DPO/GRPO, PCA/SVD projection, calibration & uncertainty, LoRA rank), a figure for every topic, and a "predict the readout" kernel question per lesson
- **Papers** — Understanding Papers: 35 DeepSeek papers across 4 eras, from DeepSeek LLM (Jan 2024) to V4.1 Flash, taught theory-first (visuals, formulas, Python) with lineage, a reading guide, self-graded implementation checks, and a build-it-yourself project per paper that runs in the browser (editable starter, Pyodide on demand)
- **Blog** — 4 engineering write-ups with SVG diagrams and RSS at `/blog`
- **Discuss** — paginated forum with threads, replies, upvotes, problem references, and live updates; server-backed when signed in
- **Problem comments** — per-problem discussion with upvotes, load-more pagination, and live updates on the problem page
- **Study groups** — local-first groups with join codes, shared weekly activity, and buddy nudges; syncs through Supabase when signed in
- **Zero assistant** — catalogue-grounded study coach mounted on every route (hide-to-dot with a saved preference): recommends problems, explains concepts, reviews your code, builds playlists, and answers what's due / am I ready; context-aware prompt chips on problem pages
- **Profile & badges** — 29 badges including bug-slayer, exterminator, flawless, speedrunner, and speed-demon, XP/levels, a 52-week heatmap that counts solves, clean bug hunts, and finished speedruns, deterministic daily quests, streak card, username editing, and trait-based generative avatars with 12 character presets across two art styles (Illustrated + Pixel), plus photo upload (synced to Supabase Storage when signed in)
- **Stats & readiness** — personal dashboard with trends, records, mastery estimate, a review-health card, a this-week digest, and a 0–100 readiness score (coverage, retention, balance, consistency) with target-date projection
- **Certificates** — printable/PNG certificates (path, collection, category, lab, project, and interview kinds) whose tamper-evident codes verify offline at `/verify`
- **Streak shields & reminders** — one solve streak shown everywhere (the daily-challenge chain is labeled separately); shields cover a missed calendar day; opt-in local reminders for streak, reviews due, and a daily digest
- **Submit a Problem** — author problems locally, validate with real Python, export ready-to-paste TS
- **Leaderboard** — Flame Score (Easy 1, Medium 3, Hard 5), streaks, username, and a weekly mode (Monday-local week, bots rotate each week); global view when signed in
- **Search & shortcuts** — command palette over problems, paths, articles, blog, research challenges, papers, and labs with quick actions (labs, lab trails, research); g-sequences and a `?` overlay for every shortcut
- **Backup** — full local export/import with an audited inventory of every stored key and documented exclusions
- **Sync** — local-first progress/streaks/collections sync through Supabase (magic link or Google) when you opt in
- **Accessibility** — keyboard pass across dialogs, menus, comment threads, and the command palette: Tab containment, Escape-to-close, focus-visible rings, and aria-live status
- **PWA** — installable, offline shell v12 with a per-route fallback (verified by a route-inventory test), service worker that never caches dev assets

## Optional: sync & accounts

Everything works without an account. To enable sync across devices, global leaderboard rows, and shared forum/comments, connect a Supabase project and set:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key_here
```

See [`docs/SETUP-SUPABASE.md`](./docs/SETUP-SUPABASE.md) for schema, RLS, and auth (magic link + Google) setup. Leave both unset and the app makes zero network calls.

## Tech Stack

- Next.js 16 + TypeScript 5 (App Router)
- Tailwind CSS 4
- Pyodide v0.26 (in-browser Python, lazy-loaded, Web Worker by default with a main-thread fallback)
- Supabase (optional sync/social; `@supabase/supabase-js`)
- next-themes (dark default, x.ai-style light toggle)
- Inter + JetBrains Mono
- SEO: metadata + OpenGraph, `/og` images, `manifest.ts`, `robots.ts`, `sitemap.ts`, RSS

## Performance

Measured with `bun run scripts/measure-bundle.ts --check` (gzip first-load JS; all four routes within budget). Every problem page is prerendered so it is served straight from the edge (~1 GB of build output per deployment); `bun run prune:vercel` keeps only the newest production and preview deployment so Vercel storage stays bounded:

| Route | Before light index | Now |
|---|---:|---:|
| `/` | 1,553 KB | **276.6 KB** |
| `/problems` | 1,499 KB | **319.2 KB** |
| `/about` | 1,497 KB | **243.5 KB** |
| `/stats` | 1,572 KB | **407.9 KB** |

The 5 MB problem bank is a lazy chunk; pages use a generated light index
(`src/data/problems/problem-meta.ts`) and load full problem payloads on demand.
The landing page came down further because Zero now mounts lazily and the
duplicated home mount was removed.

## Project Layout

```
src/
├── app/                      # routes: /problems, /paths, /labs, /papers, /blog, /collections, ...
├── components/               # UI + motion/ (Aurora, Reveal, CountUp) + blog/ (prose, diagrams)
├── data/
│   ├── problems/             # 15 categories · 5,730 problems · paths.ts · generated problem-meta.ts
│   ├── blog/                 # engineering posts (TSX) + registry
│   ├── contests.ts · projects.ts · interview.ts · penpaper.ts · collections.ts · articles.ts
├── lib/
│   ├── sync/                 # local-first store seam + Supabase engine (remote, social, merge)
│   ├── paths.ts · problemLinks.ts · progress.ts · leaderboard.ts · comments.ts · ...
│   └── pyodide.ts            # loader + code execution
├── types/problem.ts
supabase/                     # config + migrations (RLS, RPCs)
scripts/                      # verify-problems, verify-paths, verify-paths-content, e2e-smoke, measure-bundle
docs/                         # DESIGN-SYSTEM, SETUP-SUPABASE, research, plans
```

## Verification

```bash
bun run scripts/verify-problems.ts        # real-Python execution of all 5,730 solutions
bun run scripts/verify-paths.ts           # 33 paths: slugs, stages, problem ids, capstones
bun run scripts/verify-paths-content.ts   # stage blurb/ordering/content rules
bunx tsc --noEmit                         # types
bun run lint                              # ESLint
bun test                                  # 1,785 unit tests (87 files)
bun run build
bunx next start -p 3099 &                 # production server the smoke suite expects
bun run scripts/e2e-smoke.mjs             # 199-check end-to-end smoke against :3099
```

## Quick Start

```bash
bun install
bun run dev
# Open http://localhost:3001
```

## License

MIT — see [LICENSE](./LICENSE).

## Connect

- **Author:** [svx](https://github.com/srivtx) (Sribatsha dash)
- **Repository:** [github.com/srivtx/deepforge](https://github.com/srivtx/deepforge)

## For AI Agents

1. Read [`AGENT_CONTEXT.md`](./AGENT_CONTEXT.md) — master context and roadmap
2. Read [`docs/DESIGN-SYSTEM.md`](./docs/DESIGN-SYSTEM.md) — tokens, rhythm, motion, navigation rules
3. Run `./agent-quickstart.sh` to verify the environment
4. Verify before finishing: `bun run scripts/verify-problems.ts`, `bunx tsc --noEmit`, `bun run lint`, `bun test`
