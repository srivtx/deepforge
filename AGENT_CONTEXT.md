# DeepForge — Master Agent Context

> **Goal:** Surpass deep-ml.com in every aspect — more problems, better design, more features, better UX.

This file gives any AI agent (or team of agents) the full context needed to work on DeepForge autonomously. Read this file completely before starting any work.

---

## What is DeepForge?

DeepForge is a practice platform for machine learning, math, and engineering. Users write Python from scratch — no sklearn, no torch, no shortcuts. Every function is implemented by hand. Real Python execution happens in the browser via Pyodide. Instant feedback against test cases. Progress saves to localStorage. No account needed.

**Author:** svx (Sribatsha dash) — GitHub: [github.com/srivtx](https://github.com/srivtx)
**Repo:** [github.com/srivtx/deepforge](https://github.com/srivtx/deepforge)
**License:** MIT

---

## The Competition: deep-ml.com

Deep-ML is the incumbent. Here's what they have and what we need to beat:

| Feature | Deep-ML | DeepForge (current) | DeepForge (target) |
|---|---|---|---|
| Problems | 1,200+ | 50 | **2,000+** |
| Categories | 5 | 10 | **10+** |
| In-browser execution | Yes | Yes (Pyodide) | Yes |
| Design | Generic dark | svx dark+light | svx (better) |
| Account required | No | No | No |
| Open source | No | Yes (MIT) | Yes |
| Mobile-friendly | Partial | Yes | Yes |
| Learning paths | Yes | 4 basic | **20+ detailed** |
| Projects (multi-step labs) | Yes (GPT, RL, CUDA) | No | **15+ projects** |
| Contests (timed) | Yes | No | **Yes** |
| Leaderboard | Yes (global, Flame Score) | No | **Yes (local + optional global)** |
| Discuss / community | Yes (forum) | No | **Yes (comment threads per problem)** |
| Study assistant (AI) | Yes | No | **Yes (AI hints, not full solutions)** |
| Collections / playlists | Yes | No | **Yes (user-created problem sets)** |
| Interview prep | Yes | No | **Yes (curated interview tracks)** |
| Pen-and-paper math | Yes | No | **Yes (no-code math problems)** |

### Deep-ML's categories (5):
1. Machine Learning Fundamentals
2. Deep Neural Networks
3. Computer Vision
4. Natural Language Processing
5. Linear Algebra for ML

### DeepForge's categories (10 — already more):
1. Linear Algebra
2. Calculus
3. Statistics
4. Probability
5. ML Fundamentals
6. Deep Learning
7. NLP
8. Optimization
9. Algorithms
10. Data Structures

### Categories we should ADD to surpass them:
11. Computer Vision (image processing from scratch)
12. Reinforcement Learning (MDPs, Q-learning, policy gradient)
13. Time Series (AR, MA, ARMA, forecasting)
14. Graph Algorithms (PageRank, shortest paths, centrality)
15. Information Theory (entropy, KL divergence, mutual information)

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
│   │   ├── layout.tsx          # Root layout (fonts, ThemeProvider)
│   │   ├── page.tsx            # Main page (view state)
│   │   └── globals.css         # CSS variables (dark+light), Tailwind
│   ├── components/
│   │   ├── Header.tsx          # Nav + theme toggle
│   │   ├── Footer.tsx          # Minimal footer
│   │   ├── Hero.tsx            # Landing hero
│   │   ├── ProblemCard.tsx     # Problem list item
│   │   ├── ProblemList.tsx     # Filterable problem grid
│   │   ├── ProblemView.tsx     # Full-page problem overlay (code editor + Pyodide)
│   │   ├── CategoryGrid.tsx    # Category cards on home
│   │   ├── StatsStrip.tsx      # Problem count stats
│   │   ├── Paths.tsx           # Learning paths view
│   │   ├── About.tsx           # About page
│   │   ├── ThemeProvider.tsx   # next-themes wrapper
│   │   └── ThemeToggle.tsx     # Sun/moon button
│   ├── data/
│   │   └── problems.ts         # ALL problems + categories + learning paths
│   ├── lib/
│   │   ├── pyodide.ts          # Pyodide loader + code execution
│   │   ├── progress.ts         # localStorage progress tracking
│   │   └── utils.ts            # Helpers
│   └── types/
│       └── problem.ts          # TypeScript types (Problem, TestCase, etc.)
├── package.json
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── README.md
├── LICENSE
└── AGENT_CONTEXT.md            # This file
```

---

## Problem Format

Every problem follows this exact TypeScript interface:

```typescript
interface Problem {
  id: string;                    // e.g., "la-001", "al-015", "ml-022"
  title: string;                 // e.g., "Matrix Multiplication"
  category: Category;            // one of the 10+ categories
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
- `cal-001` to `cal-XXX` — Calculus
- `stat-001` to `stat-XXX` — Statistics
- `prob-001` to `prob-XXX` — Probability
- `ml-001` to `ml-XXX` — ML Fundamentals
- `dl-001` to `dl-XXX` — Deep Learning
- `nlp-001` to `nlp-XXX` — NLP
- `op-001` to `op-XXX` — Optimization
- `al-001` to `al-XXX` — Algorithms
- `ds-001` to `ds-XXX` — Data Structures
- `cv-001` to `cv-XXX` — Computer Vision (NEW)
- `rl-001` to `rl-XXX` — Reinforcement Learning (NEW)
- `ts-001` to `ts-XXX` — Time Series (NEW)
- `graph-001` to `graph-XXX` — Graph Algorithms (NEW)
- `info-001` to `info-XXX` — Information Theory (NEW)

### Problem quality rules:
1. Every solution MUST be correct Python — test it mentally
2. Every test case MUST have correct expected output — verify
3. NO external libraries (no numpy, no sklearn, no torch) — pure Python only
4. Descriptions should be 2-4 sentences, clear and concise
5. Easy = basic loop/indexing, Medium = algorithmic, Hard = mathematical derivation
6. 3-5 test cases per problem, including edge cases (empty input, single element, etc.)

---

## What Needs to Be Built (Priority Order)

### Phase 1: More Problems (HIGHEST PRIORITY)
**Target: 2,000+ problems (currently 50)**

This is the #1 gap. Deep-ML has 1,200+. We need 2,000+.

Problem generation approach:
- Each category should have 100-200 problems
- Start with the most impactful categories: ML Fundamentals, Linear Algebra, Algorithms, Deep Learning
- Each problem is a real Python function implemented from scratch
- Use a script to batch-generate problems and append to `src/data/problems.ts`
- Verify each solution produces the expected output

### Phase 2: Missing Features

**2a. Contests page**
- Timed challenges (10 min, 30 min, 60 min)
- Problem sets of 5-10 problems
- Timer counts down, auto-submits when time is up
- Score = problems solved × difficulty multiplier
- Local leaderboard (localStorage)

**2b. Leaderboard**
- Local: tracks user's solved problems, streak, total score
- Display: rank, username (editable), score, problems solved, streak
- "Flame Score" equivalent: weighted by difficulty (Easy=1, Medium=3, Hard=5)

**2c. Projects (multi-step labs)**
- Like deep-ML's "Build a GPT" or "RL agent"
- Each project has 5-15 steps
- Each step is a problem (with starter code + test cases)
- Steps build on each other (step 2 uses step 1's output)
- Final result: a working model/system
- Project ideas:
  1. Build a GPT from scratch (tokenization → attention → transformer → text generation)
  2. Build a neural network framework (autograd → layers → optimizer → train MNIST)
  3. Build a search engine (TF-IDF → cosine similarity → PageRank → ranking)
  4. Build a recommender system (collaborative filtering → matrix factorization → evaluation)
  5. Build a CNN from scratch (conv → pool → relu → flatten → linear → classify)

**2d. Discuss / comments**
- Each problem has a comment thread (localStorage-based for now)
- Users can post solutions, ask questions, share approaches
- Upvote/downvote (local only)
- Code blocks in comments (monospace formatting)

**2e. Study Assistant (AI hints)**
- "Give me a hint" button on each problem
- Progressive hints: first vague, then more specific, then show solution
- Hint chain: 3 levels (nudge → approach → detailed steps)
- Pre-written hints per problem (not AI-generated — deterministic)

**2f. Collections / playlists**
- Users can create custom problem sets
- Name, description, list of problem IDs
- Shareable via URL (encode in query param)
- Pre-made collections: "Interview Prep", "Linear Algebra Crash Course", "30-Day Challenge"

**2g. Interview Prep**
- Curated tracks for ML interviews
- "FAANG ML Interview" — 50 most common problems
- "Quant Interview" — probability + statistics + algorithms
- "ML Engineer Interview" — ML + DL + system design
- Timed mode: solve under time pressure

**2h. Pen-and-paper math problems**
- No code required — just math
- Multiple choice or numeric answer
- Categories: matrix math, probability, calculus, statistics
- Good for interview prep where you can't run code

### Phase 3: Polish
- Consistent design across all pages
- Mobile audit (375px viewport)
- Performance: lazy-load Pyodide, code-split heavy components
- Accessibility: keyboard nav, screen reader support
- SEO: meta tags, structured data

---

## How to Run

```bash
cd /home/z/my-project/deepforge
bun install
bun run dev    # Runs on port 3001
```

## How to Push

```bash
cd /home/z/my-project/deepforge
git add -A
git commit -m "description of changes"
git push origin main
```

Remote is already configured: `https://github.com/srivtx/deepforge.git`

---

## Agent Instructions

If you are an AI agent working on DeepForge:

1. **Read this file completely** before starting
2. **Read the existing code** — especially `src/data/problems.ts`, `src/types/problem.ts`, `src/app/globals.css`
3. **Follow the design system** — dark/light mode, Inter font, no noise
4. **Test your code** — `npx tsc --noEmit` must pass, `curl -s http://localhost:3001/` must return 200
5. **Commit incrementally** — small commits, clear messages, no version jumps
6. **Don't break existing features** — if you change a component, verify it still works
7. **Problems must be correct** — verify solutions produce expected test outputs
8. **No external Python libraries** — all solutions are pure Python (no numpy, no sklearn)

### If adding problems:
- Follow the exact Problem interface
- Use the ID convention above
- Add to the `PROBLEMS` array in `src/data/problems.ts`
- Also add new categories to `CATEGORIES` array and `Category` type if needed
- Verify with `npx tsc --noEmit`

### If adding features:
- Create new components in `src/components/`
- Add new view state to `src/app/page.tsx`
- Add nav items to `src/components/Header.tsx`
- Use the design system (dark/light CSS variables, Inter, no noise)
- Test on mobile (375px viewport)

### If fixing bugs:
- Read the component code carefully
- Use Agent Browser to verify the fix
- Don't introduce new noise or design inconsistencies

---

## Current Status (as of last update)

- **Problems:** 50 (target: 2,000+)
- **Categories:** 10 (target: 15)
- **Light mode:** ✅ Working
- **Dark mode:** ✅ Working
- **Pyodide execution:** ✅ Working
- **Learning paths:** 4 basic (target: 20+)
- **Contests:** ❌ Not built
- **Leaderboard:** ❌ Not built
- **Projects:** ❌ Not built
- **Discuss:** ❌ Not built
- **Study assistant:** ❌ Not built
- **Collections:** ❌ Not built
- **Interview prep:** ❌ Not built
- **Pen-and-paper:** ❌ Not built

**Next priority:** Add 1,950+ more problems, then build contests + leaderboard + projects.
