# DeepForge — Master Agent Context

> **Goal:** The best place to practice ML and math from scratch — more problems, better design, more features, better UX.

This file gives any AI agent (or team of agents) the full context needed to work on DeepForge autonomously. Read this file completely before starting any work. For task-scoped rules (file ownership, verification), also read [`AGENT_BRIEF.md`](./AGENT_BRIEF.md).

---

## What is DeepForge?

DeepForge is a practice platform for machine learning, math, and engineering. Users write Python from scratch — no sklearn, no torch, no shortcuts. Every function is implemented by hand. Real Python execution happens in the browser via Pyodide. Instant feedback against test cases. Progress saves to localStorage. No account needed.

**Author:** svx (Sribatsha dash) — GitHub: [github.com/srivtx](https://github.com/srivtx)
**Repo:** [github.com/srivtx/deepforge](https://github.com/srivtx/deepforge)
**License:** MIT

---

## Product targets

| Area | DeepForge today |
|---|---|
| Problems | **5,730**, every solution Python-verified |
| Categories | **15** |
| In-browser execution | Yes (Pyodide) |
| Design | svx dark + light; see [`docs/DESIGN-SYSTEM.md`](./docs/DESIGN-SYSTEM.md) |
| Account required | No — local-first, sync is optional |
| Open source | Yes (MIT) |
| Mobile-friendly | Yes |
| Learning paths | **33** with stages, goals, verified prerequisites, per-stage checkpoints, artifact links, capstones, hours |
| Projects / Labs | **5 multi-step projects · 36 steps** · **8 scored labs with detail pages** · 4 lab trails |
| Contests (timed) | **12 sets (10–60 min)** + Speedrun |
| Leaderboard | Flame Score + streaks + username + weekly mode; global view when signed in |
| Discuss / community | Threads, replies, upvotes, problem refs; paginated + live updates; per-problem comments; server-backed when signed in |
| Study assistant | Zero: 10 intents (incl. research/labs), mounted on every route, catalogue-grounded, code-aware |
| Collections / playlists | **24 premade** + user sets + shareable playlists |
| Interview prep | **13 company tracks** + timed mocks |
| Pen-and-paper math | **60 no-code problems** + SM-2 mastery review + `/concepts` browser |
| Review & today | Spaced review queue for solved problems + due lab re-runs and math concepts; one-screen daily session at `/today` with a "Do this next" pick |
| Certificates | Printable/PNG path, collection, category, lab, project, and interview kinds; SHA-256 verification code + `/verify` |
| Blog | **4** engineering write-ups with SVG diagrams + RSS (`/blog`) |
| Interactive articles | **14** lessons with live demos, a figure per topic, and a kernel question each |
| Papers curriculum | **35** DeepSeek papers across 4 eras (founding → frontier), from DeepSeek LLM (Jan 2024) to V4.1 Flash; theory-first with lineage, a reading guide, and implementation checks (`/papers`, `/papers/<slug>`) |

Honest caveats: without an account everything stays on one device. Signing in with a magic link or Google syncs progress, streaks, leaderboard and community data through Supabase.

### DeepForge's categories (15)

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

Difficulty mix: 2,058 Easy · 2,553 Medium · 1,119 Hard.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4 (via PostCSS, NOT @tailwindcss/vite)
- **Fonts:** Inter (400, 500, 600, 700) + JetBrains Mono (code only)
- **Theme:** next-themes (dark default, light toggle)
- **Python execution:** Pyodide v0.26.2 (loaded from CDN, lazy; Web Worker by default, main-thread fallback)
- **Package manager:** bun
- **Port:** 3001 (don't conflict with port 3000)

---

## Design System (CRITICAL — this is what makes us better)

### Colors
- **Dark mode (default):**
  - Canvas: `#0a0a0a`
  - Card: `#161616`
  - Text: `#ffffff`
  - Text muted: `#8b8b8b`
  - Accent: `#7FFF9F` (phosphor green)
  - Border: `#222222`
- **Light mode:**
  - Canvas: `#ffffff`
  - Card: `#f8f8f8`
  - Text: `#1a1a1a`
  - Text muted: `#666666`
  - Accent: `#1f8a3d` (darker green for contrast on white)
  - Border: `#e0e0e0`

### Typography
- Body: Inter, weight 400-700 (NOT light/300)
- Code: JetBrains Mono
- NO uppercase eyebrow labels
- NO `//` markers anywhere
- NO `ee-mono` class
- Headings: `font-semibold` (600)
- Body: `font-medium` (500) or `font-normal` (400)
- Labels: `font-medium` (500), `text-sm`

### Layout
- Minimal — lots of whitespace
- Cards: `rounded-lg border` (1px border), NO shadows
- Buttons: `rounded-md` for text buttons, `rounded-lg` for primary
- Max width: `max-w-7xl` for content areas
- Mobile-first responsive

### What NOT to do (noise patterns):
- NO `// CURRICULUM · v3.0` style markers
- NO uppercase tracked-out eyebrow text
- NO JetBrains Mono for body text (only for code)
- NO excessive borders or dividers
- NO gradient backgrounds
- NO drop shadows on cards

---

## File Structure

```
deepforge/
├── src/
│   ├── app/                    # one directory per route: /problems, /paths, /today,
│   │   │                       #   /verify, /badges, /certificates, ... + og/ images
│   │   ├── layout.tsx          # Root layout (fonts, metadata, ThemeProvider)
│   │   ├── page.tsx            # Landing page (short hub)
│   │   ├── globals.css         # CSS variables (dark+light), Tailwind
│   │   └── manifest.ts         # PWA manifest (robots.ts, sitemap.ts alongside)
│   ├── components/             # UI: Header, PageShell, ProblemView, Badges, Today,
│   │                           #   Certificates, StatsDashboard, ZeroAssistant,
│   │                           #   ProblemComments, StreakCard, articles/, blog/,
│   │                           #   motion/, avatars/, sims/
│   ├── data/
│   │   ├── problems/           # 15 categories · 5,730 problems · paths.ts · problem-meta.ts
│   │   ├── papers/             # Understanding Papers · 4 eras · theory + reading + questions
│   │   └── contests.ts · projects.ts · labs.ts · interview.ts · penpaper.ts ·
│   │       collections.ts · articles.ts · blog/
│   ├── lib/
│   │   ├── sync/               # local-first store seam + Supabase engine
│   │   ├── progress.ts · badges.ts · reviewQueue.ts · daily.ts · stats.ts
│   │   ├── certificates.ts · credentials.ts · labs.ts · pyodide.ts · paths.ts
│   │   └── ...
│   └── types/problem.ts
├── tests/                      # 1,637 bun tests (81 files)
├── scripts/                    # verify-problems, verify-paths(-content), e2e-smoke, measure-bundle
├── supabase/migrations/        # init, avatars, hardening
├── docs/                       # DESIGN-SYSTEM, SETUP-SUPABASE, next-wave-plan, research/
├── .github/workflows/ci.yml
├── package.json · next.config.ts · tsconfig.json · tailwind.config.ts
├── eslint.config.mjs · postcss.config.mjs
├── agent-quickstart.sh
├── README.md · LICENSE
├── AGENT_BRIEF.md              # Task-scoped rules for parallel agents
└── AGENT_CONTEXT.md            # This file
```

---

## Problem Format

Every problem follows this exact TypeScript interface:

```typescript
interface Problem {
  id: string;                    // e.g., "la-001", "al-015", "ml-022"
  title: string;                 // e.g., "Matrix Multiplication"
  category: Category;            // one of the 15 categories
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;           // 2-4 sentences, clear and concise
  starterCode: string;           // Python function template with `pass`
  solution: string;              // Working Python solution (NO libraries)
  testCases: TestCase[];         // 3-5 test cases with input + expected
  hint?: string;                 // One-line hint
}

interface TestCase {
  input: any[];                  // Positional arguments to the function
  expected: any;                 // Expected return value
}
```

### ID convention:
- `la-001` to `la-XXX` — Linear Algebra
- `ca-001` to `ca-XXX` — Calculus
- `st-001` to `st-XXX` — Statistics
- `pr-001` to `pr-XXX` — Probability
- `ml-001` to `ml-XXX` — ML Fundamentals
- `dl-001` to `dl-XXX` — Deep Learning
- `nlp-001` to `nlp-XXX` — NLP
- `op-001` to `op-XXX` — Optimization
- `al-001` to `al-XXX` — Algorithms
- `ds-001` to `ds-XXX` — Data Structures
- `cv-001` to `cv-XXX` — Computer Vision
- `rl-001` to `rl-XXX` — Reinforcement Learning
- `ts-001` to `ts-XXX` — Time Series
- `graph-001` to `graph-XXX` — Graph Algorithms
- `info-001` to `info-XXX` — Information Theory
- `proj-001` to `proj-XXX` — Project steps (reserved)

### Problem quality rules:
1. Every solution MUST be correct Python — test it mentally
2. Every test case MUST have correct expected output — verify
3. NO external libraries (no numpy, no sklearn, no torch) — pure Python only
4. Descriptions should be 2-4 sentences, clear and concise
5. Easy = basic loop/indexing, Medium = algorithmic, Hard = mathematical derivation
6. 3-5 test cases per problem, including edge cases (empty input, single element, etc.)

---

## Verification

```bash
bun run scripts/verify-problems.ts            # all problems (structural + real Python)
bun run scripts/verify-problems.ts <file.ts>  # one data file
bunx tsc --noEmit                             # types
bun run lint                                  # ESLint
bun run build                                 # production build
```

`verify-problems.ts` runs structural checks (ids, fields, categories, test-case count, function-name match) and then executes every solution in real Python via `scripts/py_verify.py`, using the same deep-equality semantics as the browser Pyodide harness (1e-6 tolerance). It must print `ALL GREEN`.

---

## Roadmap

### Phase 1: Problems — ✅ Complete
5,730 verified problems across 15 categories. Every solution passes real-Python verification.

### Phase 2: Features — ✅ Complete
- **Contests** — 12 timed sets (10–60 min), countdown, difficulty-weighted scores, local results
- **Leaderboard** — Flame Score (Easy=1, Medium=3, Hard=5), solved count, current/longest streak, editable username; global Supabase view when signed in
- **Projects** — 5 multi-step builds / 36 steps: GPT from scratch, neural network framework, search engine, recommender, CNN
- **Labs** — 8 dataset-driven challenges with metrics, baselines, and time limits, scored in-browser; detail pages plus four guided trails (`/labs/trails`)
- **Discuss** — threads, replies, upvotes, problem references, pagination, live updates, and per-problem comments; server-backed when signed in
- **Study Assistant** — Zero: 10 intents (incl. research/labs), mounted on every route, catalogue-grounded, code-aware
- **Collections** — 24 premade sets with detail pages, user-created sets, shareable URLs
- **Interview Prep** — 13 company tracks + timed mocks
- **Pen-and-paper math** — 60 no-code problems, multiple choice + numeric, SM-2 mastery review
- **Review queue + Today** — spaced review of solved problems; one-screen daily session at `/today`
- **Habit mechanics** — streak shields, opt-in reminders, readiness + target-date projection
- **Pedagogy** — self-explanation gate and spot-the-bug practice mode
- **Certificates** — printable/PNG with a SHA-256 verification code and a public `/verify` page
- **Sync/social backend** — Supabase (projects klogjcspyiygnggmugjy): local-first sync, magic link + Google, RLS
- **Blog** — 4 engineering write-ups at `/blog` with SVG diagrams and RSS
- **Papers** — Understanding Papers: 35 DeepSeek papers across 4 eras, theory-first with lineage, a reading guide, implementation checks, and 18 deterministic SVG figure kinds; `/papers` + `/papers/<slug>`

### Phase 3: Polish — ✅ Partially complete
- ✅ SEO: metadata + OpenGraph (kinds for problems, categories, research, and labs), PWA manifest, robots.txt, sitemap.xml
- ✅ Dark/light mode across all views
- ✅ Bundle split: light problem index, per-route picks (daily problem, leaderboard scoring), and a lazy Zero mount; home 276.6 KB gzip (from 1,553 KB)
- ✅ Mobile audits at 375px across new views
- ✅ Keyboard/focus pass across dialogs, menus, command palette, and social threads; 🔲 full screen-reader + contrast sweep
- ✅ PWA offline: route fallback chain + “update available” prompt (SW v10) with per-route fallback verified by a route-inventory test
- ✅ Wave 39: `/review` hub (forecast, leeches, drill), `/concepts` Map view with route planner, runnable paper starters (lazy Pyodide)
- ✅ Wave 40: Ladder-Graded Spacing (scientist → verifiers → engineer pipeline; 24.2% fewer reviews, 30/30 seeds, better Brier) wired through grading, ordering, and readiness; `/inventions` house-paper publisher with full pages and a zero-dep PDF renderer
- ✅ Wave 41: Alibi Distance census paper + `/alibi` Silent Bug Hunt (96 machine-verified test-passing ghosts, resistance claims scoped to the named suites); bionic reading (default on) + figures on paper pages and PDFs
- ✅ Wave 42: Behavioral Delta Ledger paper + `/ledger` count-only hidden-check feedback (opt-in, device-local, never grading/review/certificates/sync); census + harness gates in CI
- ✅ Wave 43: KeyFuse — novelty-first external software invention (falsification-first cache-key auditing): typed slot universe, five probe strategies, exact ≤t attribution within budget, minimal same-key / different-output witnesses, conservative key repair; 24-task corpus with brute-force ground truth, Metro-style env-latent demo, negative controls; `/keyfuse` read-only lab + paper #4; `verify:keyfuse` gate (12 criteria, ≈140 ms) in CI
- ✅ CI: GitHub Actions runs typecheck, lint, unit tests, all verifiers, the build, and the 191-check smoke

### Next steps (sensible order)
1. **Path curation, continued** — 33 paths shipped with stage checkpoints, artifact links, resolved prerequisites, and a verified capstone each; still open from [`docs/research/path-curation.md`](./docs/research/path-curation.md): mixed-kind steps (problems + labs + math + projects).
2. **Content growth** — 5,730 problems shipped; keep rebalancing the thinnest categories (Linear Algebra at 320; Data Structures at 355) and the level mix.
3. **Production hardening** — Vercel deploy, custom SMTP for magic links, two-account RLS spot check.
4. **Social scale** — realtime subscriptions, pagination, and the per-problem comments UI shipped; remaining: global-leaderboard polish.
5. **E2E in CI** — shipped: the 191-check smoke runs in GitHub Actions; remaining: live-preview checks after deploy.
6. **Deploy & credentials** — work the human items in [`docs/next-wave-plan.md`](./docs/next-wave-plan.md), then certificate signing (phase 2).

---

## How to Run

```bash
bun install
bun run dev    # http://localhost:3001
```

Do not run `bun install` if the environment already has dependencies. Do not run git commands — the orchestrator commits.

---

## Agent Instructions

If you are an AI agent working on DeepForge:

1. **Read this file and [`AGENT_BRIEF.md`](./AGENT_BRIEF.md) completely** before starting
2. **Read the existing code** — especially `src/data/problems/index.ts`, `src/types/problem.ts`, `src/app/globals.css`
3. **Follow the design system** — dark/light mode, Inter font, no noise
4. **Verify before finishing** — `bun run scripts/verify-problems.ts` must print `ALL GREEN`, `bunx tsc --noEmit` must pass, `bun run lint` clean
5. **Only touch your assigned files** — other agents edit other files in parallel
6. **Don't break existing features** — if you change a component, verify it still works
7. **Problems must be correct** — verify solutions produce expected test outputs
8. **No external Python libraries** — all solutions are pure Python (no numpy, no sklearn)

### If adding problems:
- Follow the exact Problem interface
- Use the ID convention above
- Add problems to `src/data/problems/<category>/part-NN.ts` (write in chunks of ~15 so truncation is easy to spot)
- Import the new part in the category's `index.ts` aggregator
- Add new categories to `src/data/problems/meta.ts` and the `Category` type if needed
- Verify with `bun run scripts/verify-problems.ts src/data/problems/<category>/part-NN.ts`

### If adding features:
- Create new components in `src/components/`
- Add a localStorage store in `src/lib/` with try/catch and a custom event
- Wire the view into `src/app/page.tsx` and `src/components/Header.tsx` (only if your task allows)
- Use the design system (dark/light CSS variables, Inter, no noise)
- Test on mobile (375px viewport)

### If fixing bugs:
- Read the component code carefully
- Verify the fix in the browser
- Don't introduce new noise or design inconsistencies

---

## Current Status (as of last update)

- **Problems:** 5,730 (2,058 Easy · 2,553 Medium · 1,119 Hard) — ✅ target exceeded
- **Categories:** 15 — ✅
- **Learning paths:** 33 — ✅ (stage checkpoints, artifact links, capstones 33/33)
- **Interactive articles:** ✅ 14 with live demos, a figure per topic, and a kernel question each
- **Blog:** ✅ 4 engineering posts + RSS
- **Papers:** ✅ Understanding Papers: 35 DeepSeek papers across 4 eras (founding → frontier), DeepSeek LLM (Jan 2024) to V4.1 Flash; theory-first (visuals/formulas/Python), per-paper reading guide, lineage, self-graded implementation MCQs; 18 deterministic SVG figure kinds; `/papers` + `/papers/<slug>`; local store `deepforge:papers:v1` wired into sync + backup
- **Light mode:** ✅ Working
- **Dark mode:** ✅ Working
- **Pyodide execution:** ✅ Working (Web Worker by default with a main-thread fallback)
- **Contests:** ✅ 12 timed contests
- **Leaderboard:** ✅ Flame Score + streaks + username + weekly mode; global when signed in
- **Projects:** ✅ 5 multi-step projects · 36 steps · detail pages
- **Labs:** ✅ 8 scored benchmarks with detail pages (theory, rules, data preview, timed runner) + 4 guided trails at `/labs/trails`
- **Research:** ✅ 5 beat-the-baseline challenges with detail pages (research notes, data preview, hidden-test workspace, last-5 attempts)
- **Discuss:** ✅ Paginated threads + live updates + per-problem comments; server-backed when signed in
- **Study assistant:** ✅ Zero: 10 intents (incl. research/labs), mounted on every route, hide-to-dot, prompt chips
- **Collections:** ✅ 24 premade + user sets + shareable URLs
- **Interview prep:** ✅ 13 timed tracks + agentic round
- **Pen-and-paper:** ✅ 60 no-code problems + `/concepts` browser with mastery bars, due/locked status, worked steps, and self-grading
- **Review & today:** ✅ Spaced review queue + `/today` v2 (lab re-runs, math concepts with inline grading, placement plan, stage-checkpoint row, "Do this next" ranker); `/review` hub adds a 14-day forecast, leech triage, an interleaved catch-up drill, and honest retention math
- **Concept map:** ✅ `/concepts` Map view layers all 21 checkpoints by prerequisite depth with pan/zoom, mastery shading, and a From → To route planner (deterministic layout, unit-tested)
- **Runnable paper starters:** ✅ all 35 build-it-yourself projects execute in the browser through the existing Pyodide worker (editable starter, Reset, lazy ~10 MB load on first Run)
- **Habit mechanics:** ✅ One solve streak + shields, reminders, tiered hints, readiness projection, review health + weekly digest
- **Gamification:** ✅ Bug hunts (synced) with bug-slayer/exterminator/flawless badges; speedrunner/speed-demon badges; heatmap counts bug hunts + speedruns
- **Certificates:** ✅ Path/collection/category/lab/project/interview kinds, SHA-256 code + public `/verify`
- **Avatars:** ✅ 12 character presets, two art styles (Illustrated + Pixel)
- **Tests:** ✅ 1,637 unit tests (81 files) + 191 e2e smoke checks (CI)
- **Solutions on rails:** ✅ every lab and research challenge carries a Python-verified reference solution (Show solution reveal); certificates gain a research kind (5/5 baselines); stats and Today surface labs/research progress
- **Deploys:** ✅ the full problem bank is prerendered so every page is edge-static (~1 GB of build output per deploy); all 5,730 deployment history is bounded by `bun run prune:vercel` (`scripts/vercel-prune.mjs`, keeps newest prod + preview). One bad day of auto-deploys had accumulated 56 GB; 95 deployments were pruned to 2
- **PWA:** ✅ Offline v7 per-route fallback (route-inventory test, nested static routes modeled) + update prompt
- **Search & shortcuts:** ✅ Palette search over problems, paths, articles, blog, research challenges, papers, and labs + quick actions (labs, trails, research); g-sequences + `?` overlay
- **Backup:** ✅ Full local export/import with an audited key inventory
- **SEO:** ✅ Metadata, manifest, robots, sitemap (lastModified derived; lists `/today`, `/labs/trails`, `/concepts`, all 13 lab/research detail URLs, and all 35 paper URLs); OG image kinds `research` and `lab`
- **Onboarding layout:** ✅ `/start` flow sits on one shared column system (flow `max-w-2xl` / result `max-w-5xl`) with a progress header, equal-height answer rows, and an aligned stat grid; logic unchanged

**Next priority:** push the Supabase hardening migration to project `klogjcspyiygnggmugjy` (see docs/SETUP-SUPABASE.md), configure Auth redirect URLs, then deploy per [`docs/next-wave-plan.md`](./docs/next-wave-plan.md) (U-1..U-5) and start certificate signing (phase 2). Sync code is shipped and env-gated: the app stays 100% local until `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are set and a user signs in.
