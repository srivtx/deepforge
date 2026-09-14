# DeepForge

> Forge your ML skills. Build from scratch.

**by svx** · MIT Licensed

![License: MIT](https://img.shields.io/badge/License-MIT-7FFF9F.svg?style=flat-square)
![Next.js 16](https://img.shields.io/badge/Next.js-16-black.svg?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg?style=flat-square&logo=typescript)
![Pyodide](https://img.shields.io/badge/Pyodide-0.26-3776AB.svg?style=flat-square&logo=python)
![Problems](https://img.shields.io/badge/Problems-5%2C550-7FFF9F.svg?style=flat-square)
![Categories](https://img.shields.io/badge/Categories-15-507aa4.svg?style=flat-square)
![Learning paths](https://img.shields.io/badge/Learning%20paths-33-507aa4.svg?style=flat-square)

---

## What is DeepForge?

A practice platform for machine learning, math, and engineering. Write Python from scratch — no sklearn, no torch, no shortcuts. Every function is one you implement yourself. Real Python execution in your browser via Pyodide. Instant feedback against test cases. Progress saves locally, no account required. Free and open source.

## Why DeepForge

- **Verified from scratch** — 5,550 problems, every single solution executed in real Python (1e-6 deep-equality) before it ships
- **Runs in your browser** — Pyodide executes your code client-side; nothing to install, works offline once warm
- **Local-first, sync optional** — no account needed; sign in with a magic link or Google only if you want cross-device progress, a global leaderboard, and shared discussions
- **Real curriculum** — 33 learning paths with stages, goals, verified prerequisites, per-stage checkpoints, and a mini-project artifact per stage, each with its own page
- **Beyond problems** — labs, research benchmarks, timeds contests, speedruns, sims, notebook mode, pen-and-paper math with spaced review
- **Fast by design** — a light problem index keeps the landing page at ~283 KB gzip; the full bank loads on demand
- **Discoverable** — 5,550 statically generated problem pages, 15 category hubs, 33 path pages, JSON-LD, OG images, sitemap, RSS
- **Open source** — MIT, file-based content, verifiable and diffable

## Categories (15)

| Category | Problems | | Category | Problems |
|---|---:|---|---|---:|
| Algorithms | 395 | | Optimization | 375 |
| ML Fundamentals | 360 | | NLP | 420 |
| Data Structures | 355 | | Statistics | 420 |
| Computer Vision | 395 | | Probability | 420 |
| Linear Algebra | 275 | | Calculus | 375 |
| Deep Learning | 455 | | Graph Algorithms | 315 |
| Reinforcement Learning | 360 | | Information Theory | 315 |
| Time Series | 315 | | **Total** | **5,550** |

## Features

- **Problems** — code editor, in-browser Pyodide execution, test cases, one-line hints, saved code per problem
- **Paths** — 33 curated learning paths with stages, goals, verified prerequisites, per-stage checkpoints, a mini-project artifact per stage, and progress; every path has a detail page
- **Projects** — 5 multi-step builds: GPT from scratch, neural network framework, search engine, recommender, CNN
- **Labs** — 8 dataset-driven challenges with metrics, baselines, and time limits, scored in-browser
- **Research** — 5 beat-the-baseline benchmarks against hidden test sets, best submissions saved locally
- **Contests** — 12 timed sets (10–60 min) with countdown, difficulty-weighted scoring, and local results
- **Speedrun** — seeded timed solve-a-thons with shareable run codes and ghost races
- **Collections** — 24 premade sets with detail pages, plus user-created collections and shareable URLs
- **Playlists** — build, reorder, share, and fork problem playlists via compact `?playlist=` codes
- **Interview Prep** — 13 company tracks with paced practice or timed mocks
- **Pen & Paper Math** — 60 no-code problems (multiple choice + numeric) with SM-2 mastery review
- **Notebook mode** — per-cell Python execution with run-all and test validation, persisted per problem
- **Sims** — optimizer race, neural-net trainer with decision boundary, Dijkstra step-through
- **Articles** — 11 interactive lessons with live demos (softmax temperature, eigenvectors, gradient descent, k-means, attention, BPE tokenization, embeddings, quantization, KV cache & FlashAttention, RAG chunk retrieval, post-training RLHF/DPO/GRPO) and a figure for every topic
- **Blog** — 4 engineering write-ups with SVG diagrams and RSS at `/blog`
- **Discuss** — paginated forum with threads, replies, upvotes, problem references, and live updates; server-backed when signed in
- **Problem comments** — per-problem discussion with upvotes, load-more pagination, and live updates on the problem page
- **Zero assistant** — catalogue-grounded study coach: recommends problems, explains concepts, reviews your code, builds playlists
- **Profile & badges** — 24 badges, XP/levels, 52-week heatmap, deterministic daily quests, streak card, username editing, and trait-based generative avatars with 12 character presets across two art styles (Illustrated + Pixel), plus photo upload (synced to Supabase Storage when signed in)
- **Stats & Certificates** — personal dashboard with trends, records, mastery estimate; printable/PNG certificates
- **Submit a Problem** — author problems locally, validate with real Python, export ready-to-paste TS
- **Leaderboard** — Flame Score (Easy 1, Medium 3, Hard 5), streaks, username; global view when signed in
- **Sync** — local-first progress/streaks/collections sync through Supabase (magic link or Google) when you opt in
- **Accessibility** — keyboard pass across dialogs, menus, comment threads, and the command palette: Tab containment, Escape-to-close, focus-visible rings, and aria-live status
- **PWA** — installable, offline shell with route fallback, service worker that never caches dev assets

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
- Pyodide v0.26 (in-browser Python, lazy-loaded)
- Supabase (optional sync/social; `@supabase/supabase-js`)
- next-themes (dark default, x.ai-style light toggle)
- Inter + JetBrains Mono
- SEO: metadata + OpenGraph, `/og` images, `manifest.ts`, `robots.ts`, `sitemap.ts`, RSS

## Performance

Measured with `bun run scripts/measure-bundle.ts` (gzip first-load JS):

| Route | Before light index | Now |
|---|---:|---:|
| `/` | 1,553 KB | **283 KB** |
| `/problems` | 1,499 KB | **251 KB** |
| `/about` | 1,497 KB | **183 KB** |
| `/stats` | 1,572 KB | **301 KB** |

The 5 MB problem bank is a lazy chunk; pages use a generated light index
(`src/data/problems/problem-meta.ts`) and load full problem payloads on demand.

## Project Layout

```
src/
├── app/                      # routes: /problems, /paths, /labs, /blog, /collections, ...
├── components/               # UI + motion/ (Aurora, Reveal, CountUp) + blog/ (prose, diagrams)
├── data/
│   ├── problems/             # 15 categories · 5,550 problems · paths.ts · generated problem-meta.ts
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
bun run scripts/verify-problems.ts        # real-Python execution of all 5,550 solutions
bun run scripts/verify-paths.ts           # 33 paths: slugs, stages, problem ids
bun run scripts/verify-paths-content.ts   # stage blurb/ordering/content rules
bunx tsc --noEmit                         # types
bun run lint                              # ESLint
bun test                                  # 378 unit tests
bun run build
bunx next start -p 3099 &                 # production server the smoke suite expects
bun run scripts/e2e-smoke.mjs             # 94-check end-to-end smoke against :3099
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
