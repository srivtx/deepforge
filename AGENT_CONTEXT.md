# DeepForge — Master Agent Context

> **Goal:** Surpass deep-ml.com in every aspect — more problems, better design, more features, better UX.

This file gives any AI agent (or team of agents) the full context needed to work on DeepForge autonomously. Read this file completely before starting any work. For task-scoped rules (file ownership, verification), also read [`AGENT_BRIEF.md`](./AGENT_BRIEF.md).

---

## What is DeepForge?

DeepForge is a practice platform for machine learning, math, and engineering. Users write Python from scratch — no sklearn, no torch, no shortcuts. Every function is implemented by hand. Real Python execution happens in the browser via Pyodide. Instant feedback against test cases. Progress saves to localStorage. No account needed.

**Author:** svx (Sribatsha dash) — GitHub: [github.com/srivtx](https://github.com/srivtx)
**Repo:** [github.com/srivtx/deepforge](https://github.com/srivtx/deepforge)
**License:** MIT

---

## The Competition: deep-ml.com

Deep-ML is the incumbent. Current state:

| Feature | Deep-ML | DeepForge |
|---|---|---|
| Problems | 1,200+ | **4,555** |
| Categories | 5 | **15** |
| In-browser execution | Yes | Yes (Pyodide) |
| Design | Generic dark | svx dark+light |
| Account required | No | No |
| Open source | No | Yes (MIT) |
| Mobile-friendly | Partial | Yes |
| Learning paths | Yes | **24** |
| Projects (multi-step labs) | Yes (GPT, RL, CUDA) | **5 labs · 36 steps** |
| Contests (timed) | Yes | **8 contests (10–60 min)** |
| Leaderboard | Yes (global, Flame Score) | **Yes (local: Flame Score + streaks + username)** |
| Discuss / community | Yes (forum) | **Yes (per-problem threads, local)** |
| Study assistant | Yes (AI) | **Yes (3-tier progressive hints, deterministic)** |
| Collections / playlists | Yes | **6 premade + user sets + shareable URLs** |
| Interview prep | Yes | **4 timed tracks** |
| Pen-and-paper math | Yes | **60 no-code problems** |

Honest caveats: leaderboard, comments, and collections are localStorage-backed (single browser, no accounts). Deep-ML's equivalents are server-backed. A shared backend is the main remaining gap.

### DeepForge's categories (15)

| Category | Problems | | Category | Problems |
|---|---:|---|---|---:|
| Algorithms | 395 | | Optimization | 275 |
| ML Fundamentals | 315 | | NLP | 320 |
| Data Structures | 310 | | Statistics | 275 |
| Computer Vision | 350 | | Probability | 230 |
| Linear Algebra | 275 | | Calculus | 230 |
| Deep Learning | 455 | | Graph Algorithms | 270 |
| Reinforcement Learning | 315 | | Information Theory | 270 |
| Time Series | 270 | | **Total** | **4,555** |

Difficulty mix: 1,636 Easy · 2,022 Medium · 897 Hard.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4 (via PostCSS, NOT @tailwindcss/vite)
- **Fonts:** Inter (400, 500, 600, 700) + JetBrains Mono (code only)
- **Theme:** next-themes (dark default, light toggle)
- **Python execution:** Pyodide v0.26.2 (loaded from CDN, lazy)
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
│   ├── app/
│   │   ├── layout.tsx          # Root layout (fonts, metadata, ThemeProvider)
│   │   ├── page.tsx            # Main page (view state, wires all sections)
│   │   ├── globals.css         # CSS variables (dark+light), Tailwind
│   │   ├── manifest.ts         # PWA manifest
│   │   ├── robots.ts           # robots.txt
│   │   └── sitemap.ts          # sitemap.xml
│   ├── components/
│   │   ├── Header.tsx          # Nav + theme toggle + solved counter
│   │   ├── Footer.tsx          # Minimal footer
│   │   ├── Hero.tsx            # Landing hero
│   │   ├── StatsStrip.tsx      # Problem count stats
│   │   ├── CategoryGrid.tsx    # Category cards on home
│   │   ├── ProblemCard.tsx     # Problem list item
│   │   ├── ProblemList.tsx     # Filterable problem grid
│   │   ├── ProblemView.tsx     # Full-screen problem overlay (editor + Pyodide + hints + discuss)
│   │   ├── Paths.tsx           # Learning paths view
│   │   ├── Projects.tsx        # Multi-step labs view
│   │   ├── Contests.tsx        # Timed contests view
│   │   ├── Leaderboard.tsx     # Flame Score, streaks, username
│   │   ├── Discuss.tsx         # Per-problem comment threads
│   │   ├── StudyAssistant.tsx  # 3-tier progressive hints
│   │   ├── Collections.tsx     # Premade + user collections
│   │   ├── InterviewPrep.tsx   # Timed interview tracks
│   │   ├── PenPaper.tsx        # No-code math problems
│   │   ├── About.tsx           # About page
│   │   ├── ThemeProvider.tsx   # next-themes wrapper
│   │   └── ThemeToggle.tsx     # Sun/moon button
│   ├── data/
│   │   ├── problems/
│   │   │   ├── meta.ts         # CATEGORIES (15)
│   │   │   ├── paths.ts        # LEARNING_PATHS (24)
│   │   │   ├── index.ts        # Aggregates PROBLEMS + re-exports, getProblemById, getProblemsByCategory
│   │   │   └── <category>/     # linear-algebra/, algorithms/, ... each with part-NN.ts + index.ts
│   │   ├── contests.ts         # CONTESTS (8)
│   │   ├── projects.ts         # PROJECTS (5) + PROJECT_STEPS (36)
│   │   ├── interview.ts        # INTERVIEW_TRACKS (4)
│   │   ├── penpaper.ts         # PENPAPER_PROBLEMS (60)
│   │   └── collections.ts      # PREMADE_COLLECTIONS (6)
│   ├── lib/
│   │   ├── pyodide.ts          # Pyodide loader + code execution
│   │   ├── progress.ts         # localStorage progress + saved code
│   │   ├── leaderboard.ts      # Flame Score, streaks, username
│   │   ├── comments.ts         # Discuss threads (local)
│   │   ├── hints.ts            # 3-tier hint generation
│   │   ├── collections.ts      # User collections + URL encode/decode
│   │   ├── contestStore.ts     # Contest results (local)
│   │   ├── interview.ts        # Interview results (local)
│   │   ├── projects.ts         # Project step progress
│   │   └── utils.ts            # Helpers
│   └── types/
│       └── problem.ts          # Problem, TestCase, Category, LearningPath types
├── scripts/
│   ├── verify-problems.ts      # Structural + real-Python verification
│   ├── py_verify.py            # Python harness (deep equality, 1e-6 tolerance)
│   └── dump-solutions.ts       # Solution export utility
├── package.json
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── agent-quickstart.sh         # Environment check script
├── README.md
├── LICENSE
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
4,555 verified problems across 15 categories (target was 2,000+, deep-ml has 1,200+). Every solution passes real-Python verification.

### Phase 2: Features — ✅ Complete
- **Contests** — 8 timed sets (10–60 min), countdown, difficulty-weighted scores, local results
- **Leaderboard** — Flame Score (Easy=1, Medium=3, Hard=5), solved count, current/longest streak, editable username, local
- **Projects** — 5 multi-step labs / 36 steps: GPT from scratch, neural network framework, search engine, recommender, CNN
- **Discuss** — per-problem comment threads with upvotes (local)
- **Study Assistant** — 3-tier progressive hints (nudge → approach → full solution), deterministic
- **Collections** — 6 premade sets, user-created sets, shareable encoded URLs
- **Interview Prep** — 4 timed tracks (FAANG ML, Quant, ML Engineer, Data Scientist), 4 min/problem
- **Pen-and-paper math** — 60 no-code problems, multiple choice + numeric, with explanations

### Phase 3: Polish — ✅ Partially complete
- ✅ SEO: metadata + OpenGraph, PWA manifest, robots.txt, sitemap.xml
- ✅ Dark/light mode across all views
- 🔲 Mobile audit at 375px across every new view
- 🔲 Accessibility pass: keyboard nav, focus management, screen readers
- 🔲 Performance: code-split heavy views, tighten Pyodide lazy-load

### Next steps (sensible order)
1. **Deepen thin categories** — Calculus, Statistics, Probability, NLP, and Optimization have 95 each; grow toward ~200 like the rest, using the existing part-file workflow and verifier.
2. **Global accounts backend** — the biggest functional gap vs deep-ml: cross-device progress, real global leaderboard, server-backed comments/collections. Until then, all community data stays local.
3. **More projects and interview tracks** — cheap once the problem bank grows; add 1-2 labs and 1-2 tracks.
4. **Mobile + accessibility polish** — 375px audit, keyboard navigation, focus states, reduced motion.
5. **More pen-and-paper problems** — 60 now; expand to cover every category.

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

- **Problems:** 4,555 (1,636 Easy · 2,022 Medium · 897 Hard) — ✅ target exceeded
- **Categories:** 15 — ✅
- **Learning paths:** 24 — ✅
- **Light mode:** ✅ Working
- **Dark mode:** ✅ Working
- **Pyodide execution:** ✅ Working
- **Contests:** ✅ 8 timed contests
- **Leaderboard:** ✅ Local, Flame Score + streaks + username
- **Projects:** ✅ 5 labs · 36 steps
- **Discuss:** ✅ Per-problem threads (local)
- **Study assistant:** ✅ 3-tier hints
- **Collections:** ✅ 6 premade + user sets + shareable URLs
- **Interview prep:** ✅ 4 timed tracks
- **Pen-and-paper:** ✅ 60 no-code problems
- **SEO:** ✅ Metadata, manifest, robots, sitemap

**Next priority:** Supabase backend (see docs/supabase-plan.md) for cross-device progress and community features, PWA/offline support, bundle code-splitting, and continued LLM-systems content growth.
