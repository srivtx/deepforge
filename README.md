# DeepForge

> Forge your ML skills. Build from scratch.

**by svx** · MIT Licensed

![License: MIT](https://img.shields.io/badge/License-MIT-7FFF9F.svg?style=flat-square)
![Next.js 16](https://img.shields.io/badge/Next.js-16-black.svg?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg?style=flat-square&logo=typescript)
![Pyodide](https://img.shields.io/badge/Pyodide-0.26-3776AB.svg?style=flat-square&logo=python)
![Problems](https://img.shields.io/badge/Problems-2%2C440-7FFF9F.svg?style=flat-square)
![Categories](https://img.shields.io/badge/Categories-15-507aa4.svg?style=flat-square)
![Learning paths](https://img.shields.io/badge/Learning%20paths-24-507aa4.svg?style=flat-square)

---

## What is DeepForge?

A practice platform for machine learning, math, and engineering. Write Python from scratch — no sklearn, no torch, no shortcuts. Every function is one you implement yourself. Real Python execution in your browser via Pyodide. Instant feedback against test cases. Progress saves locally, no account required. Free and open source.

## Why DeepForge over deep-ml?

| Feature | Deep-ML | DeepForge |
|---|---|---|
| Problems | 1,200+ | 3,655 |
| Categories | 5 | 15 |
| Learning paths | Yes | 24 |
| Projects (multi-step labs) | Yes | 5 labs · 36 steps |
| Contests (timed) | Yes | 8 contests (10–60 min) |
| Leaderboard | Yes (global) | Yes (local: Flame Score, streaks, username) |
| Discuss / community | Yes (forum) | Yes (per-problem threads, local) |
| Study assistant | Yes | Yes (3 progressive hint tiers per problem) |
| Collections / playlists | Yes | 6 premade + user sets + shareable URLs |
| Interview prep | Yes | 4 timed tracks |
| Pen-and-paper math | Yes | 60 no-code problems |
| In-browser execution | Yes | Yes (Pyodide) |
| Account required | No | No |
| Open source | No | Yes (MIT) |
| Mobile-friendly | Partial | Yes |

Community features (leaderboard, discuss) are local-first today — a shared backend is on the roadmap.

## Categories (15)

| Category | Problems | | Category | Problems |
|---|---:|---|---|---:|
| Algorithms | 350 | | Optimization | 185 |
| ML Fundamentals | 315 | | NLP | 185 |
| Data Structures | 310 | | Statistics | 185 |
| Computer Vision | 305 | | Probability | 185 |
| Linear Algebra | 275 | | Calculus | 185 |
| Deep Learning | 275 | | Graph Algorithms | 225 |
| Reinforcement Learning | 225 | | Information Theory | 225 |
| Time Series | 225 | | **Total** | **3,655** |

## Features

- **Problems** — code editor, in-browser Pyodide execution, test cases, one-line hints, saved code per problem
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
│   │   ├── index.ts          # aggregates all 3,655 problems (PROBLEMS, CATEGORIES)
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
bun run scripts/verify-problems.ts   # structural checks + real-Python execution of all 3,655 solutions
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
