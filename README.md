# DeepForge

> Forge your ML skills. Build from scratch.

**by svx** · MIT Licensed

![License: MIT](https://img.shields.io/badge/License-MIT-7FFF9F.svg?style=flat-square)
![Next.js 16](https://img.shields.io/badge/Next.js-16-black.svg?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg?style=flat-square&logo=typescript)
![Pyodide](https://img.shields.io/badge/Pyodide-0.26-3776AB.svg?style=flat-square&logo=python)
![Problems](https://img.shields.io/badge/Problems-5%2C050-7FFF9F.svg?style=flat-square)
![Categories](https://img.shields.io/badge/Categories-15-507aa4.svg?style=flat-square)
![Learning paths](https://img.shields.io/badge/Learning%20paths-24-507aa4.svg?style=flat-square)

---

## What is DeepForge?

A practice platform for machine learning, math, and engineering. Write Python from scratch — no sklearn, no torch, no shortcuts. Every function is one you implement yourself. Real Python execution in your browser via Pyodide. Instant feedback against test cases. Progress saves locally, no account required. Free and open source.

## Why DeepForge over deep-ml?

| Feature | Deep-ML | DeepForge |
|---|---|---|
| Problems | 1,200+ | 5,050 (every solution Python-verified) |
| Categories | 5 | 15 |
| Learning paths | Yes | 24 |
| Projects | Yes | 5 projects · 36 steps |
| Labs (dataset + metric) | Yes (42) | Yes (8, fully in-browser) |
| Research (beat the baseline) | Yes | Yes (5 hidden-test benchmarks) |
| Contests (timed) | Yes (live) | 12 contests + Speedrun mode |
| Speedrun / ghost races | No | Yes (seeded run codes) |
| Leaderboard | Yes (global) | Yes (local + stats dashboard) |
| Discuss / community | Yes (forum) | Yes (forum, threads, upvotes) |
| Study assistant | Yes (Zero) | Yes (Zero: 6 intents, code-aware, offline) |
| Collections / playlists | Yes | 24 collections + user sets + shareable playlists |
| Interview prep | Yes (13 tracks) | Yes (13 company tracks + timed mocks) |
| Pen-and-paper math | Yes | 60 problems + mastery/SM-2 review |
| Interactive articles | Yes (2) | Yes (5 with live demos) |
| Sims | No | Yes (optimizer race, NN trainer, Dijkstra) |
| Notebook mode | Yes | Yes (per-cell execution, run-all) |
| Submit a problem | Yes | Yes (local validation, TS export) |
| Badges / XP / quests | Yes | Yes (24 badges, XP, heatmap, daily quests) |
| Certificates | No | Yes (print + PNG) |
| In-browser execution | Yes | Yes (Pyodide + notebook + labs + research) |
| PWA / offline | No | Yes (service worker, installable) |
| SEO problem pages | 1,380 | 4,915 statically generated + OG images |
| Account required | No | No |
| Open source | No | Yes (MIT) |
| Mobile-friendly | Partial | Yes |

Community features (leaderboard, discuss) are local-first today — a shared backend is on the roadmap.

## Categories (15)

| Category | Problems | | Category | Problems |
|---|---:|---|---|---:|
| Algorithms | 395 | | Optimization | 275 |
| ML Fundamentals | 360 | | NLP | 320 |
| Data Structures | 355 | | Statistics | 320 |
| Computer Vision | 395 | | Probability | 320 |
| Linear Algebra | 275 | | Calculus | 275 |
| Deep Learning | 455 | | Graph Algorithms | 315 |
| Reinforcement Learning | 360 | | Information Theory | 315 |
| Time Series | 315 | | **Total** | **5,050** |

## Features

- **Problems** — code editor, in-browser Pyodide execution, test cases, one-line hints, saved code per problem
- **Labs** — dataset-driven challenges with metrics, baselines, constraints, and a time limit, scored in-browser
- **Research** — beat-the-baseline benchmark challenges against hidden test sets, best submissions saved locally
- **Articles** — interactive lessons with live demos (softmax temperature, eigenvector explorer, decision boundary, k-means, attention heatmap)
- **Playlists** — build, reorder, share, and fork problem playlists via compact `?playlist=` codes
- **Profile** — 24 badges, XP/levels, 52-week activity heatmap, and deterministic daily quests
- **Zero assistant** — catalogue-grounded study coach: recommends problems, explains concepts, reviews your code, builds playlists and plans, with zero backend
- **Discuss** — community forum with categories, threads, replies, upvotes, and clickable problem references
- **Sims** — live simulations: optimizer race, neural-net trainer with decision boundary + loss curve, Dijkstra step-through
- **Speedrun** — seeded timed solve-a-thons with scoring curves, shareable run codes, and ghost races
- **Notebook mode** — per-cell Python execution with run-all and test validation, persisted per problem
- **Submit a Problem** — author problems locally, validate them with real Python, export ready-to-paste TS
- **Stats & Certificates** — personal dashboard (trends, records, mastery estimate) and printable/PNG completion certificates
- **SEO** — 4,555 statically generated problem pages, 15 category hubs, structured data, and full sitemap
- **Paths** — 24 curated learning paths from math foundations to transformers, with estimated hours
- **Projects** — 5 multi-step labs: GPT from scratch, neural network framework, search engine, recommender, CNN
- **Contests** — 8 timed sets (10–60 min) with countdown, difficulty-weighted scoring, and local results
- **Leaderboard** — Flame Score (Easy 1, Medium 3, Hard 5), solved count, current/longest streak, editable username
- **Discuss** — per-problem comment threads with upvotes and code-friendly formatting (local)
- **Study Assistant** — 3-tier progressive hints (nudge → approach → full solution), deterministic per problem
- **Collections** — 6 premade sets plus user-created collections, shareable via encoded URL
- **Interview Prep** — 4 timed tracks: FAANG ML, Quant, ML Engineer, Data Scientist
- **Pen & Paper Math** — 60 no-code problems (multiple choice and numeric answers) with explanations

## Tech Stack

- Next.js 16 + TypeScript 5 (App Router)
- Tailwind CSS 4
- Pyodide v0.26 (in-browser Python, lazy-loaded)
- next-themes (dark default, light toggle)
- Inter + JetBrains Mono
- SEO ready: metadata + OpenGraph, `manifest.ts`, `robots.ts`, `sitemap.ts`

## Project Layout

```
src/
├── app/                      # App Router: layout, page, globals.css, metadata, manifest, robots, sitemap
├── components/               # Problems, Paths, Projects, Contests, Leaderboard, Discuss,
│                             # StudyAssistant, Collections, InterviewPrep, PenPaper, ...
├── data/
│   ├── problems/
│   │   ├── meta.ts           # 15 categories
│   │   ├── paths.ts          # 24 learning paths
│   │   ├── index.ts          # aggregates all 5,050 problems (PROBLEMS, CATEGORIES)
│   │   └── <category>/       # part-NN.ts problem files + per-category index.ts aggregator
│   ├── contests.ts           # 8 timed contests
│   ├── projects.ts           # 5 labs · 36 steps
│   ├── interview.ts          # 4 interview tracks
│   ├── penpaper.ts           # 60 no-code problems
│   └── collections.ts        # 6 premade collections
├── lib/                      # localStorage stores + Pyodide runner
│   ├── pyodide.ts            # loader + code execution
│   ├── progress.ts           # solved state + saved code
│   ├── leaderboard.ts        # Flame Score, streaks, username
│   ├── comments.ts           # Discuss threads
│   ├── hints.ts              # 3-tier hints
│   ├── collections.ts        # user sets + URL encode/decode
│   ├── contestStore.ts       # contest results
│   ├── interview.ts          # interview results
│   └── projects.ts           # project step progress
└── types/problem.ts          # Problem, TestCase, Category, LearningPath types
scripts/
└── verify-problems.ts        # runs every solution in real Python
```

## Verification

```bash
bun run scripts/verify-problems.ts   # structural checks + real-Python execution of all 5,050 solutions
bunx tsc --noEmit                    # types
bun run lint                         # ESLint
bun run build                        # production build
```

The verifier executes every solution in real Python with the same deep-equality semantics as the browser harness (1e-6 tolerance).

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

1. Read [`AGENT_CONTEXT.md`](./AGENT_CONTEXT.md) — master context, design system, problem format, roadmap
2. Run `./agent-quickstart.sh` to verify the environment
3. Follow the design system — dark/light mode, Inter, no noise
4. Verify before finishing: `bun run scripts/verify-problems.ts`, `bunx tsc --noEmit`, `bun run lint`, `bun run build`
