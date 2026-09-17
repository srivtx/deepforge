# Path Curation — Research & Recommendations for DeepForge

**Date:** 2026-09-13 · **Truth pass:** 2026-09-17 (NW-12) — audit numbers re-derived against the 33-path / 5,730-problem bank; shipped recommendations marked.
**Author:** research agent (read-only; no code or data modified)
**Scope:** how leading platforms structure curated learning paths; a structural audit of our paths in `src/data/problems/paths.ts` (28 paths / 5,050 problems when this was written; 33 / 5,730 today); and a prioritised set of improvements with verified problem ids.
**Method:** (a) read `AGENT_CONTEXT.md`, `src/data/problems/paths.ts`, `src/lib/paths.ts`, `src/data/problems/problem-meta.ts` (5,050 problems at the time), `src/app/paths/[slug]/PathDetail.tsx`, `src/components/Paths.tsx`, `src/types/problem.ts`, `src/data/labs.ts`, `src/data/projects.ts`, `src/data/collections.ts`, `src/lib/progress.ts`, `scripts/verify-paths-content.ts`; (b) ran read-only analysis scripts against the real catalogue (pacing, difficulty ordering, cross-path overlap, stage inversions, category coverage); (c) fetched the incumbent's live path data model from its public Firestore `tracks` collection and `/get-collections` endpoint; (d) read platform documentation for fast.ai, Kaggle Learn, Hugging Face, MLOps Zoomcamp, DeepLearning.AI, NeetCode, LeetCode; (e) reviewed the learning-science literature on sequencing and practice. All URLs accessed 2026-09-13 unless noted.

---

## TL;DR

1. **Our paths are structurally valid and now pedagogically layered.** The verifier enforces 3–5 stages × 6–15 problems (`scripts/verify-paths-content.ts`), and each stage now gets a derived checkpoint (`src/lib/pathCheckpoints.ts`: due-review-aware boss set + a mini-project artifact) and every path closes with a verified capstone (`scripts/verify-paths.ts` prints `Capstones: 33/33`). The remaining structural gap vs the incumbent: stages still hold only `problemIds` (`PathStage`, `src/types/problem.ts:41-46`) — no mixed-kind `problem | lab | math | project` steps.
2. **Only 718 of 5,730 problems (12.5%) appear in any path.** Reinforcement Learning (7.5%), Information Theory (8.3%), Data Structures (8.5%), Optimization (9.1%), and Algorithms (9.4%) are the least-covered categories, despite 355–395 problems each. Deep Learning (34.7%) and ML Fundamentals (30.8%) are the best covered. The five paths added in §3.7 lifted raw coverage from 596 (of 5,050) but the catalogue grew at the same time, so the share moved only 11.8% → 12.5%.
3. **Redundancy is unchanged:** `math-foundations` and `math-for-machine-learning` still share 20 ids (Jaccard 0.56); `probability-foundations`/`quant-interview-track` share 16; `statistics-mastery`/`data-scientist-track` share 15.
4. **The original 8 order inversions are fixed, but the audit now finds 14 adjacent stage-level average decreases across 11 of 33 paths** (e.g., `build-a-transformer-from-scratch`: 2.57 → 2.17 → 1.67). The old in-stage hard→easy flip (`time-series-and-forecasting`: `ts-037` Hard → `ts-294` Easy) is gone: `ts-037` is now the stage's last problem.
5. **Pacing was recalibrated:** the range is now 13.3 → 36.4 min/problem (was 9.3 → 54.5). `llm-engineering` went from 9.3 to 16.0 (45 problems / 12h); `algorithms-interview-grind` at 34.6 remains the realistic Hard-DP upper bound.
6. **Prerequisites are resolved and validated** (shipped): `resolvePrerequisites()` (`src/lib/paths.ts:367`) links titles in `PathDetail.tsx`, and `validatePrerequisites()` (`src/lib/pathCheckpoints.ts`, enforced by `scripts/verify-paths-content.ts`) rejects unknown, self-referential, and cyclic prerequisites.
7. **The research says:** practice testing and distributed practice are the two highest-utility techniques (Dunlosky et al. 2013); interleaving during *review* roughly doubles-to-triples delayed test scores but depresses practice accuracy (Rohrer & Taylor 2007; Taylor & Rohrer 2010); worked examples must fade as expertise grows or they reverse (worked-example/expertise-reversal effect). The retrieval + spacing layer this motivated now ships as the code review queue (`src/lib/reviewQueue.ts`, surfaced on `/today`) and the pen-and-paper SM-2 review.
8. **Five paths we proposed** (all ids verified against `problem-meta.ts`) **all shipped**: Computer Vision Deep Learning, Production ML (serving + quantization + monitoring), Data Pipelines & Feature Engineering, Build a Transformer from Scratch (capstone), Causal Inference & Uplift — see §3.7 and §4.
9. **the incumbent does 3 things better** (mixed-kind steps + capstone per tier; activity-labelled sections with tier blurbs; 72 collections with resources/badges/sections). **We do 3 things better** (5,730 vs ~1,390 problems; 15 vs 5 categories; declared path metadata — goals/level/hours/prerequisites/capstones — plus MIT-licensed file-based content).
10. **Highest-impact fix (shipped):** the stage checkpoint — 2 of 3 "boss" problems to pass, soft gate, a mini-project artifact per stage, and one due-review problem folded in from earlier stages. Hints are not suppressed during a checkpoint attempt; that part of recommendation 9 remains open.

---

## 1. Findings — how the field structures curated paths

### 1.1 Comparison table

| Platform | Path granularity | Stage structure | Prerequisites | Milestones / checkpoints | Progress model | What we can steal |
|---|---|---|---|---|---|---|
| **the incumbent** (`the incumbent's site/paths`, Firestore `tracks` fetched 2026-09-13) | 9 live tracks (sitemap lists 10 URLs incl. legacy `/paths/foundations`); each track is "a book" | 3 tiers always (`basics` → `advanced` → `pro`), 178 sections total, section titles activity-prefixed (`Math:`, `Test:`, `Lab:`, `Capstone project:`); median 3 steps/section (min 1, max 19) | None declared; 5 tracks list `related` collections instead (e.g., `llms` → "Build GPT from Scratch: Karpathy Walkthrough") | Capstone project closes the advanced tier of every track; labs scattered as checkpoints (e.g., Deep Learning: "Lab: design your own activation" after the activation problems; "Capstone project: trainable CNN from scratch") | Per-step solved count, tier-complete messages ("Tier complete. Try the next one.", "Track complete. Every tier, every step."); no hard gating found in the client bundle | Mixed-kind steps, tier blurbs that state purpose, capstone per path, sections as teach→test→build rhythm |
| **fast.ai** (`course.fast.ai`, `course19.fast.ai/part2`) | 2 parts: Part 1 (9 lessons, ~90 min each) → Part 2 (>30h) | Lesson = video + notebook + book chapter; no topic micro-sections | Part 2 states explicitly: "Before starting this part, you need to have completed Part 1" | Notebooks are the exercises; no quizzes/checkpoints; models built end-to-end each lesson | Self-directed; no tracked progress beyond notebooks | Top-down sequencing: train a SOTA model in lesson 1, theory later; explicit part-to-part prerequisite |
| **Kaggle Learn** (`kaggle.com/learn`) | Micro-courses 2–5h (e.g., Python 5h/7 lessons, Intro to ML 3h/7 lessons) | Lesson = tutorial + exercise, one concept per lesson | Each course lists "Builds on" and "Preparation for" links (e.g., Intermediate ML builds on Intro to ML + Pandas) | Certificate per course on completion; no quizzes | Per-lesson completion → certificate | Short units, explicit before/after course graph, per-course hour estimates |
| **Hugging Face Learn** (`huggingface.co/learn/agents-course`; `.../deep-rl-course/communication/certification`) | Course = 4 units + bonus units | Unit = theory chapters → hands-on → quiz | Stated skills, not locked: "Basic knowledge of Python; basic knowledge of LLMs" | Unit quiz at 80% pass; final benchmark project (Agents: GAIA subset, need ≥30%); Deep RL: certificate at 80% of assignments, excellence at 100% | Quiz scores, assignment pass counts, leaderboard; self-paced | Pass thresholds, benchmark-based final project, bonus units as optional look-ahead |
| **MLOps Zoomcamp** (`github.com/DataTalksClub/mlops-zoomcamp`, `datatalks.club/docs/.../mlops-zoomcamp`) | 6 modules + final project (9-week course) | Module = lectures + hands-on + homework; project integrates all modules | Explicit: Python, Docker, CLI, ML, 1+ year programming | Homework per module (scored in live cohort); final project with 3 attempts and peer review | Leaderboard + homework scores in live cohort; self-paced unscored; certificate only via live cohort | Homework-per-module rhythm; project grading criteria; retry attempts |
| **DeepLearning.AI** (`deeplearning.ai/specializations/deep-learning`) | Specialization = 5 courses; course = 2–4 weeks | Weekly modules: videos → optional notes → quiz → graded programming assignment | Implicit by course order (Course 1 foundations → 5 sequence models) | Weekly quizzes + programming assignments; "End of access to Lab Notebooks" gating in paid mode | Coursera deadlines, grades, certificates | Weekly quiz + lab cadence; short 2-week "project structure" course between technical blocks |
| **NeetCode** (`neetcode.io/roadmap`) | NeetCode 150 = 18 pattern topics, ordered (Arrays & Hashing → ... → Bit Manipulation); also Blind 75 / 250 | Topic blocks of 3–15 problems; difficulty mix visible (28 Easy / 101 Medium / 21 Hard) | None; roadmap graph is a recommended order | No quizzes; progress per problem and per topic | Solved counters (`67/150`), streak calendar; no gating | Pattern-first grouping; the roadmap *is* the order; visible difficulty mix per topic |
| **LeetCode Study Plans** (`leetcode.com/studyplan/top-interview-150`) | Top Interview 150; also 75 / SQL / DP plans | 23 topic groups in a fixed sequence | Implicit: "Best for 3+ months of prep time" | Badge on completion; optional daily tasks; editorials per problem | Plan progress; badge/credential | A famous, fixed list with a time-horizon recommendation and a completion badge |

### 1.2 Structural patterns worth naming

- **Stage sizes.** The incumbent's median section is **3 steps**, and 83 of 178 sections have ≤2. Ours are 6–15 by verifier rule. The incumbent atomises more aggressively; our stage granularity is closer to NeetCode topic blocks. Neither is wrong, but atomised sections let learners finish something in a sitting, which is the completion loop the incumbent optimises for.
- **Milestone projects are the norm, not the exception.** the incumbent platform ends every track's advanced tier with a capstone project; MLOps Zoomcamp ends with a graded, peer-reviewed project; HF ends with a benchmark assignment; Kaggle ends with a certificate-gated course project (competition lesson). This one shipped on our side: the original "no artifact" finding was fixed — every stage has a mini-project artifact and all 33 paths end with a verified capstone (`CapstoneCard` in `PathDetail.tsx`, checked by `scripts/verify-paths.ts`).
- **Checkpoints are quizzes, not gates.** DL.AI weekly quizzes, HF unit quizzes at 80%, LeetCode badges. The incumbent has essentially no gating (soft congratulatory completion only, confirmed by the absence of lock/unlock strings in its client bundle and by a data model with no `required` field). Math Academy is the outlier that hard-gates on prerequisite mastery.
- **"Why this order" is conveyed by titles and blurbs, not essays.** the incumbent platform section titles encode the activity and the reason (`Math: matrix calculus for attention and blocks` → `Test: attention from first principles` → `Capstone project: Tiny GPT from scratch`). Tier blurbs state the phase goal. There is exactly **1** per-step note across all 642 steps in 9 tracks — so prose notes are not the mechanism; naming is.
- **Prerequisites come in two flavours.** Kaggle's course-to-course graph ("Builds on", "Preparation for") is the clearest cheap pattern. fast.ai uses a hard part boundary. the incumbent platform skips prerequisites entirely and links `related` collections instead.
- **Progress models range from counters to credentials.** Counters (NeetCode, the incumbent), completion gates (Kaggle certificates, HF quizzes), and credentials (badges/certificates). Ours is currently a counter.

---

## 2. Deep dive: the incumbent

### 2.1 Exactly how their paths/collections are organised

**Tracks ("paths").** the incumbent platform stores tracks in Firestore (project `deep-machine-learning-9d7d0`, collection `tracks`; public read; client module in `layout-a8adb56e3701ec12.js` defines the schema). I fetched all documents directly on 2026-09-13. The canonical shape:

```
track = {
  order: number,                 // catalog order: math-foundations 10, linear-algebra 12, ml-fundamentals 20,
                                 // deep-learning 25, llms 30, inference-engineering 35, quantization 40,
                                 // rl-finetuning-llms 45, ai-safety-governance 50
  title, blurb,                  // blurb states the progression, e.g. llms: "Learn each LLM idea in math,
                                 // test it with problems and labs, then build a Tiny GPT from scratch."
  tiers: [                       // ALWAYS exactly three
    { tier: "basics" | "advanced" | "pro", blurb: "<phase goal>",
      sections: [ { title: "<Activity>: <topic>", steps: [ { kind: "problem"|"lab"|"math"|"project",
                                                              ref: "<id>", note?: string } ] } ] } ],
  related?: string[]             // names of collections to read alongside, e.g. llms →
                                 // "How LLMs Work...", "Build GPT from Scratch: Karpathy Walkthrough"
}
```

Live data, 2026-09-13: **9 tracks, 3 tiers each, 178 sections, 642 steps** = 463 problems, 124 math (pen-and-paper), 36 lab, 19 project steps. Tier labels: `basics`, `advanced`, `pro` (`TIER_LABELS` in `75736-23ce0796577cb799.js`). One track (`llms`) in outline:

- **basics** — "Teach the next-token objective and how models train, then test yourself on tokenization and your first language models."
  - Math: the next-token objective [3]; Test: softmax, cross-entropy, perplexity [5]; Math: the learning step [2]; Test: tokenization [10]; **Lab: build a tokenizer [1]**; Test: embeddings and next-token pairs [7]; Test: train bigram and MLP language models [6]
- **advanced** — "Teach the math behind stacked neural nets and attention geometry, test attention and GPT blocks, then ship Tiny GPT."
  - Math: matrix calculus for attention and blocks [3]; Test: attention from first principles [8]; **Lab: design your own attention [1]**; Test: multi-head attention and positions [5]; Test: a minimal GPT / transformer block [5]; Test: sampling and decoding [4]; **Capstone project: Tiny GPT from scratch [1]**
- **pro** — "Optional look-ahead after Tiny GPT: one math idea (KL), then short tests for RoPE, KV cache, and beam search."
  - Math: KL divergence and reference models [1]; Test: RoPE and KV cache [3]; Test: a bit more decoding [2]

**Collections.** 72 collections fetched from `the incumbent's public collections API`; 14 are premium, 39 carry an external resource link, and all have a badge image. Shape: `{ sections: { "<section title>": [problemId, ...] }, description, resource?, premium?, type }`. Types observed: `papers`, `books`, `libraries`, `interview prep`, `video`, `topic`, `all`, `other`. Largest: "Hands-On Machine Learning with Scikit-Learn and PyTorch" (214 problems / 20 sections), "Reinforcement Learning: An Introduction" (155/64). Section arrays are ordered, but there are no per-item notes and no prerequisites.

**What makes a the incumbent path "curated":** a hard 3-phase tier structure with stated phase goals; sections labelled by activity (teach → test → build); labs and one capstone injected at the point of need; `related` collections for optional reading; an `order` field that sequences the tracks in the catalog; per-step `note` support that is defined but essentially unused. **No gating, no quizzes, no hours, no goals, no prerequisites.**

### 2.2 Three things the incumbent does better than us

1. **Mixed-kind steps inside paths (still open).** Every incumbent track interleaves problems with math (pen-and-paper), labs, and projects (642 steps: 463/124/36/19). Our `PathStage` can only hold `problemIds` (`src/types/problem.ts:41-46`) and `PathDetail` renders problems only; our 8 labs (`src/data/labs.ts`), 5 projects (`src/data/projects.ts`), 3 sims (`src/components/Sims.tsx`), and 60 pen-and-paper problems are still not steps in a path — the partial fix is that each stage's checkpoint links a mini-project artifact and each path a capstone, so they are no longer unreachable.
2. **Activity-labelled sections (still open).** Every incumbent track's advanced tier ends with a named capstone (Tiny GPT, trainable CNN, MLP in JAX) and section titles carry the pedagogy ("Math: ..." then "Test: ..." then "Capstone project: ..."). Capstones now ship on our side (33/33, verified), but our stage titles/blurbs still describe content ("...entropy, Gini, information gain, and AdaBoost's reweighting rule."), not the learning move.
3. **A collection ecosystem with sections, external resources, and badges.** 72 collections vs our 24 premade (`src/data/collections.ts`); the incumbent collections have titled sections, a source paper/book/video link (39 of 72), a completion badge, and are surfaced from paths via `related`. Ours have detail pages and user-created sets but are flat id lists with a description.

### 2.3 Three things we already do better

1. **Scale and breadth.** 5,730 problems / 15 categories vs the incumbent's ~1,390 sitemap problem URLs and 5 site categories (Linear Algebra, ML, DL, NLP, CV). We also have 33 paths vs 9 tracks.
2. **Declared path metadata: goals, level, hours, tags, prerequisites.** `LearningPath` carries all of these (`src/types/problem.ts:48-61`, `src/lib/paths.ts:199-220`). the incumbent platform tracks have none of hours/goals/prerequisites/level — only `title`, `blurb`, `tiers`, `related`, `order`.
3. **Open, versioned, local-first content.** Paths are TypeScript in an MIT repo, diffable and testable (`scripts/verify-paths-content.ts` prints `ALL GREEN`; we ran it), with no account required. the incumbent platform's path definitions live in a Firestore console (proprietary), and premium gates 14 collections plus advanced interview tracks (`the incumbent's site/premium`). Our progress is localStorage-first (`src/lib/progress.ts:1-13`).

*Honest caveat:* the incumbent's server-backed progress, comments, and leaderboard remain a real advantage over our localStorage equivalents (already acknowledged in `AGENT_CONTEXT.md:42`).

---

## 3. Our gaps: a concrete critique of the paths (28 originally, 33 today)

**Verification of the numbers below.** I loaded `LEARNING_PATHS` and `PROBLEM_META` with a read-only Bun script and computed: per-path difficulty sequences and stage averages, cross-path overlaps, prerequisite graph, and category coverage. `bun run scripts/verify-paths-content.ts` prints `Paths: 33   Problems available: 5730   ALL GREEN`, so all structural complaints below are *beyond* what the verifier catches. The original pass read all 28 path definitions end-to-end in a 1,388-line file, `src/data/problems/paths.ts`; the file is now 1,876 lines and the audit below is re-derived against all 33 paths (deeper study of `math-foundations`, `ml-from-scratch`, `deep-learning-essentials`, `optimization-mastery`, `probability-foundations`, `statistics-mastery`, `algorithms-interview-grind`, `llm-engineering`, `time-series-and-forecasting`, `math-for-machine-learning`, `generative-models-primer`, and `graph-machine-learning` from the original pass).

### 3.1 Ordering is weak in measurable places

Stage-level average difficulty should be (weakly) non-decreasing. The 2026-09-17 re-audit (Easy = 1, Medium = 2, Hard = 3, adjacent-stage averages) finds **14 decreases across 11 of 33 paths** — the original 8 paths listed here were fixed, and the decreases moved to other paths:

| Path | Inversion(s) (earlier stage avg → later stage avg) |
|---|---|
| `linear-algebra-deep-dive` | 3.00 → 2.71 |
| `computer-vision-starter` | 2.67 → 2.50 |
| `ranking-recommendation-systems` | 2.43 → 2.17 |
| `deep-learning-advanced` | 2.17 → 2.00 |
| `llm-engineering` | 2.00 → 1.89 and 1.89 → 1.80 |
| `build-a-transformer-from-scratch` | 2.57 → 2.17 and 2.17 → 1.67 |
| `data-pipelines-and-feature-engineering` | 2.00 → 1.67 and 1.67 → 1.50 |
| `computer-vision-deep-learning` | 2.00 → 1.71 |
| `graph-machine-learning` | 2.00 → 1.88 |
| `causal-inference-and-uplift` | 2.00 → 1.33 |
| `time-series-and-forecasting` | 1.38 → 1.13 |

The old in-stage hard→easy flip is gone: `time-series-and-forecasting` now ends its `smoothing-and-decomposition` stage with `ts-037 Holt-Winters Additive One Step` (Hard), with `ts-294 STL Remainder Value` (Easy) in the middle. `math-foundations`'s first stage now reads `la-011 Vector Addition`, `la-012 Scalar-Vector Multiplication`, `la-004 Vector Dot Product`, which matches its blurb ("Start with addition, scaling, dot products").

### 3.2 Stages lack a "why now" — **open**

The schema has `blurb` but no rationale field (`src/types/problem.ts:41-46`). Most blurbs describe *what* is in the stage, not *why it comes now*. Examples: `optimization-mastery/schedules-and-stability` explains what a schedule is but not why it precedes momentum; `information-theory/source-coding` is described as content ("Compress messages down to their entropy...") with no link back to the divergences that precede it. the incumbent platform encodes the reason in activity-prefixed section titles and a tier blurb that names the phase goal; Kaggle encodes it as "Builds on"/"Preparation for". We encode it nowhere.

### 3.3 Prerequisites are under-specified and mis-rendered — **fixed**

- The prerequisite graph is acyclic and points to real path ids (verified). The depth issue remains: 8 paths still have no prerequisites, including `computer-vision-starter`, `nlp-starter`, `data-structures-core`, and both samplers. `math-for-machine-learning`, `probability-foundations`, `fast-track-essentials`, and `thirty-day-full-curriculum` all enter at depth 0 with overlapping content.
- ~~**Rendering bug:** raw slugs, no title, no link.~~ Fixed: `resolvePrerequisites()` (`src/lib/paths.ts:367`) resolves slugs/ids to `{slug, title}` and `PathDetail.tsx` renders linked "Before you start" entries.
- ~~**Verifier gap:** count-only check.~~ Fixed: `validatePrerequisites()` (`src/lib/pathCheckpoints.ts`), enforced at the end of `scripts/verify-paths-content.ts`, rejects unknown, self-referential, and cyclic prerequisites.

### 3.4 No milestones, checkpoints, or artifacts — **fixed**

The retrieval layer shipped in `src/lib/pathCheckpoints.ts` and renders in `PathDetail.tsx`:
- a per-stage **checkpoint** — a boss set (default: the stage's last 3 problems, 2 of 3 to pass) that reacts to the last attempt and folds in one due-review problem from earlier stages; the stage counts complete when every problem is solved *or* the checkpoint passes (soft gate);
- a **mini-project artifact** per stage, chosen by category affinity from the labs/projects/contests/collections catalogue (`recommendArtifact`), rendered with a difficulty chip;
- a verified **capstone per path** — `scripts/verify-paths.ts` prints `Capstones: 33/33`.
Still open from the original finding: tier-3 hints are not suppressed during a checkpoint attempt (`src/lib/hints.ts` has no checkpoint awareness).

### 3.5 Coverage: 87.5% of the catalogue is still unreachable from any path

Only **718 / 5,730** unique problems appear in any of the 33 paths (12.5%). Re-derived 2026-09-17 by category:

| Category | Total | In paths | Coverage |
|---|---:|---:|---:|
| Reinforcement Learning | 360 | 27 | 7.5% |
| Information Theory | 360 | 30 | 8.3% |
| Data Structures | 355 | 30 | 8.5% |
| Optimization | 375 | 34 | 9.1% |
| Algorithms | 395 | 37 | 9.4% |
| Calculus | 375 | 39 | 10.4% |
| Computer Vision | 395 | 56 | 14.2% |
| Probability | 420 | 64 | 15.2% |
| Statistics | 420 | 72 | 17.1% |
| Linear Algebra | 320 | 60 | 18.8% |
| Graph Algorithms | 360 | 70 | 19.4% |
| NLP | 420 | 83 | 19.8% |
| Time Series | 360 | 73 | 20.3% |
| ML Fundamentals | 360 | 111 | 30.8% |
| Deep Learning | 455 | 158 | 34.7% |

The new `computer-vision-deep-learning` path lifted CV from 26 → 56 in-path problems, but detection/segmentation/augmentation/3D/ViT content beyond the path's 30 picks is still unused. RL (`rl-*`), Data Structures, Algorithms, and Information Theory remain the largest untouched pools. Deep-Learning serving/quantization content is now partly covered by `production-ml-serving-quantization-monitoring`; causal/uplift content is covered by `causal-inference-and-uplift`.

### 3.6 Redundancy between similar paths

Top cross-path overlaps (shared ids / Jaccard, re-derived 2026-09-17):

| Pair | Shared | Jaccard |
|---|---:|---:|
| `math-foundations` ↔ `math-for-machine-learning` | 20 | 0.56 |
| `thirty-day-full-curriculum` ↔ `fast-track-essentials` | 15 | 0.42 |
| `probability-foundations` ↔ `quant-interview-track` | 16 | 0.38 |
| `statistics-mastery` ↔ `data-scientist-track` | 15 | 0.36 |
| `linear-algebra-deep-dive` ↔ `math-for-machine-learning` | 13 | 0.29 |
| `math-foundations` ↔ `linear-algebra-deep-dive` | 11 | 0.27 |
| `ml-from-scratch` ↔ `ml-engineer-track` | 11 | 0.25 |
| `deep-learning-essentials` ↔ `build-a-transformer-from-scratch` | 10 | 0.20 |
| `time-series-forecasting` ↔ `time-series-and-forecasting` | 9 | 0.18 |

Two pairs are still effectively the same product: `math-foundations` vs `math-for-machine-learning` (both Beginner, both no prerequisites, both "vectors → eigen → calculus → probability"), and `time-series-forecasting` vs `time-series-and-forecasting` (near-identical titles; the latter's own description says it "Complements Time Series Forecasting with a stronger machine-learning and ops flavour" — a learner cannot tell which to start). Note the `deep-learning-essentials` ↔ `build-a-transformer-from-scratch` overlap is deliberate spiral review (the original P4 plan said so), and some overlap is intentional spiral review elsewhere (e.g., `st-002 Variance` appears in 6 paths), but most of it is still accidental: nothing labels the repeats as review, and the samplers (`thirty-day-full-curriculum`, `fast-track-essentials`) duplicate the paths they are meant to sample.

### 3.7 Paths we did not have — all five shipped

All five proposed paths were authored with the ids verified here and ship in `src/data/problems/paths.ts`; `scripts/verify-paths.ts` confirms a capstone for each. Stage/problem counts from `scripts/verify-paths-content.ts` (2026-09-17):

#### P1. Computer Vision Deep Learning — **shipped** as `computer-vision-deep-learning`
Advanced, 4 stages / 30 problems, capstone on the path detail page. Covers the detection, segmentation, augmentation, 3D, and ViT content the old `computer-vision-starter` stopped short of.

#### P2. Production ML: Serving, Quantization and Monitoring — **shipped** as `production-ml-serving-quantization-monitoring`
Advanced, 5 stages / 30 problems. Closes the serving/quantization/monitoring coverage gap that was zero before.

#### P3. Data Pipelines & Feature Engineering — **shipped** as `data-pipelines-and-feature-engineering`
Intermediate, 5 stages / 30 problems.

#### P4. Build a Transformer from Scratch (capstone path) — **shipped** as `build-a-transformer-from-scratch`
Advanced, 5 stages / 32 problems; intentionally spirals ids from `deep-learning-essentials` and `llm-engineering` (spaced review, not duplication). The capstone is the `gpt` project ("Build a GPT from Scratch"), now reachable from the path.

#### P5. Causal Inference & Uplift — **shipped** as `causal-inference-and-uplift`
Advanced, 4 stages / 25 problems.

### 3.8 Honesty notes

- the incumbent platform's UI could still gate steps in a way not visible in the JS strings I searched; I verified the *data model* has no required/lock field and the UI strings are congratulatory, so "soft gating" is a fair characterisation but not a certainty.
- the incumbent's premium page claims "All five learning paths" while the live `tracks` collection has 9; the sitemap has 10 path URLs (including legacy `/paths/foundations`). Marketing and product drifted there too.
- Our in-path coverage stats count ids once per path; overlapping ids are counted each time they appear. The current 718 unique figure is deduplicated across all paths (596 at the original 5,050-problem audit).

---

## 4. Recommendations (prioritised for learner outcomes)

Status as of the 2026-09-17 truth pass. Each item keeps its original what/why; shipped items point at the code instead of the planned files.

**1. Per-stage checkpoint: "boss" problems + one artefact, soft gate. (M) — SHIPPED**
*What shipped:* `src/lib/pathCheckpoints.ts` derives a boss set per stage (default: the stage's last 3 problems; 2/3 to pass) with one due-review problem folded in, plus a mini-project artifact chosen by category affinity; `PathDetail.tsx` renders the pass state and marks the stage complete when all problems are solved *or* the checkpoint passes. Hints are not suppressed (that part of rec 9 remains open). Tests: `tests/path-checkpoints.test.ts`.

**2. Spaced review using `solvedAt` timestamps. (L) — SHIPPED**
*What shipped:* `src/lib/reviewQueue.ts` (SM-2-style buckets, due/learning/new), surfaced on `/today` (`src/components/today/Today.tsx`) and fed by `ProblemProgress.solvedAt`; pen-and-paper items use the SM-2 review in `src/lib/concepts.ts`. Interleaving lives in the checkpoint due-review pick rather than a per-path review widget.

**3. Extend paths to mixed-kind steps: `problem | lab | project | math | sim`. (L) — OPEN (the remaining gap)**
*What shipped instead:* stages remain problem-only (`PathStage`, `src/types/problem.ts:41-46`), but every stage's checkpoint links a mini-project artifact and every path closes with a capstone card, so labs/projects/contests/collections are no longer unreachable from paths. A real `steps: { kind, ref, note? }[]` schema is still the biggest structural gap vs the incumbent.

**4. Ship the five new paths in §3.7, starting with P2 (Production ML) and P1 (CV). (M) — SHIPPED**
All five are in `src/data/problems/paths.ts` (`computer-vision-deep-learning`, `production-ml-serving-quantization-monitoring`, `data-pipelines-and-feature-engineering`, `build-a-transformer-from-scratch`, `causal-inference-and-uplift`). CV in-path coverage rose 26 → 56 problems; serving/quantization/monitoring coverage is no longer zero.

**5. Resolve prerequisite ids to titles, link them, and validate them in CI. (S) — SHIPPED**
`resolvePrerequisites()` (`src/lib/paths.ts:367`) feeds linked "Before you start" entries in `PathDetail.tsx`; `validatePrerequisites()` rejects unknown, self-referential, and cyclic prerequisites and runs in `scripts/verify-paths-content.ts`.

**6. Add a per-stage `rationale` ("why now") and call it in the UI. (S) — OPEN**
No `rationale` field exists; stages still carry `blurb` only. The verifier does not check ordering rationale.

**7. Calibrate `estimatedHours` and enforce a pacing guardrail. (S) — PARTIALLY SHIPPED**
The outliers were recalibrated: the range is now 13.3 → 36.4 min/problem (`fast-track-essentials` to `thirty-day-full-curriculum`), `llm-engineering` is 16.0 (45 problems / 12h), `math-for-machine-learning` and `time-series-and-forecasting` are 15.5, `graph-machine-learning` is 16.7. `scripts/verify-paths-content.ts` prints `min/problem` for every path but does not warn outside 10–45.

**8. De-duplicate the two near-identical path pairs and position samplers explicitly. (M) — OPEN**
Overlaps are unchanged (see §3.6): the math pair still shares 20 ids (Jaccard 0.56), the time-series pair the same near-identical titles, the two samplers 15 ids.

**9. Checkpoint quiz mode that interleaves prior stages and disables hints. (M/L) — PARTIALLY SHIPPED**
Boss sets and due-review interleaving shipped with rec 1; the explicit 80%-pass mixed quiz and attempt-scoped tier-3 hint suppression (`src/lib/hints.ts`) did not.

**10. Award a path credential on checkpoint completion and fix docs drift. (S/M) — PARTIALLY SHIPPED**
The `path-finisher` badge exists (`src/lib/badges.ts:610`) and the stale `AGENT_CONTEXT.md` 24-path count was refreshed (now 33). No `docs/path-authoring.md` checklist; completion copy is unchanged apart from the capstone card.

---

## 5. A proposed milestone / checkpoint model mapped to Projects, Labs and Sims

**Status (2026-09-17): shipped as derived data.** `src/lib/pathCheckpoints.ts` implements the model below without a schema change — the derived-data route the §5.3 closing paragraph proposed is exactly what landed, one module later. The boss sets and artifacts are selected automatically (last 3 stage ids + due-review pick; artifact by category affinity), so the hand-picked examples in §5.3 are illustrative, not the implementation. Retained as the design record.

### 5.1 The model

Per stage, add a **checkpoint** with three parts:

1. **Boss set (retrieval, no full solutions):** 3 real problems — 2 Medium + 1 Hard — chosen as the stage's integrative problems. Pass = 2/3 with tier-3 hints disabled (`src/lib/hints.ts` controls hint tiers today). This is the practice-testing layer Dunlosky et al. rate highest-utility.
2. **Mini-project (transfer):** one artefact from an existing feature — a Lab (scored against a held-out target, `src/data/labs.ts:507-520`), a Project step or capstone (`src/data/projects.ts:1378+`), or a Sim (`OptimizerRace`, `NeuralNetTrainer`, `DijkstraStep`). This is the "make it real" step the incumbent gets from capstone projects and MLOps Zoomcamp gets from its final project.
3. **Spaced review (retention):** 2 due problems pulled from earlier stages using `solvedAt` (already stored at `src/lib/progress.ts:22-23`) at 2/7/21-day intervals. Optional field `reviewIds` computed at render time, not stored in the path file.

**Gating policy:** soft, not hard. A checkpoint failure recommends review and does not lock later stages (the incumbent has no hard gating; Math Academy's hard mastery gating is the outlier, and Bjork & Bjork 2020 warn that a difficulty the learner cannot meet becomes an *undesirable* difficulty). Mark the stage complete when either all stage problems are solved or the checkpoint is passed, so faster learners are not held back.

### 5.2 Feature mapping

| Path archetype | Labs | Projects | Sims | Contests |
|---|---|---|---|---|
| `ml-from-scratch`, `ml-engineer-track`, `data-scientist-track` | `lab-01` Logistic Regression, `lab-03` House Price, `lab-05` K-Means, `lab-06` Credit Default, `lab-07` Robust Sensor Calibration, `lab-08` XOR Boundary | — | `NeuralNetTrainer` | `ml-fundamentals-gauntlet` |
| `deep-learning-essentials`, `deep-learning-advanced`, P4 Transformer | — | `gpt` (proj-001–008), `nn-framework` | `NeuralNetTrainer` | `deep-learning-deep-dive` |
| `optimization-mastery` | `lab-04` Noisy Quadratic | — | `OptimizerRace` | — |
| `graph-algorithms`, `graph-machine-learning` | — | `search-engine` (PageRank) | `DijkstraStep` | `graph-gauntlet` |
| `nlp-starter`, `llm-engineering`, `ranking-recommendation-systems` | `lab-02` Spam Filter | `search-engine`, `recommender` | — | — |
| `computer-vision-starter`, P1 CV | — | `cnn` | — | `vision-sprint` |
| `time-series-forecasting`, P3 Data Pipelines | — | — | — | `forecast-lab` |
| `linear-algebra-deep-dive`, `calculus-for-ml` | — | — | — | `linear-algebra-blitz` |

### 5.3 Three concrete checkpoint examples using real ids

**Example A — `ml-from-scratch` / stage `trees-clusters-ensembles` (8 problems: ml-006, ml-007, ml-032, ml-034, ml-003, ml-005, ml-035, ml-137).**
- Boss set: `ml-137` AdaBoost Weight Update (Hard), `ml-035` Information Gain (Hard), `ml-032` K-Means Assignment Step (Medium). Pass 2/3, hints off.
- Mini-project: Lab `lab-05` "K-Means Segmenter" (Hard; metric-based, `src/data/labs.ts:627`) — score above the target before the stage badge fires.
- Spaced review: 2 due ids from `data-and-metrics`/`supervised-core`, e.g. `ml-023` (standardisation) and `ml-012` (MSE gradient) at the 7-day mark.

**Example B — `deep-learning-essentials` / stage `attention-and-transformers` (dl-034, dl-035, dl-036, dl-045, dl-047, dl-087).**
- Boss set: `dl-087` Transformer Encoder Block Forward (Hard), `dl-045` LSTM Gates Forward (Hard), `dl-034` Scaled Attention Scores (Medium) — pass 2/3.
- Mini-project: Projects `gpt` "Build a GPT from Scratch" (`src/data/projects.ts:1380`), steps `proj-005` Causal Attention Scores → `proj-007` Layer Normalization → `proj-008` Greedy Token Generation; use `NeuralNetTrainer` (sim) as a warm-up.
- Spaced review: `dl-027` LayerNorm Forward and `dl-043` Softmax + Cross-Entropy Backward due at 14 days. This checkpoint is the natural on-ramp to `build-a-transformer-from-scratch` (P4, shipped).

**Example C — `graph-algorithms` / stage `robustness-and-flow` (graph-038, graph-037, graph-039, graph-130, graph-060, graph-127).**
- Boss set: `graph-127` Negative Cycle Path Extraction Lite (Hard), `graph-060` Ford-Fulkerson Max Flow (Hard), `graph-039` SCC Count (Kosaraju) (Hard) — pass 2/3; hints off.
- Mini-project: Sim `DijkstraStep` (interactive shortest-path stepping); contest `graph-gauntlet` (`src/data/contests.ts:183`) as the timed variant.
- Spaced review: `graph-019` Topological Sort (Kahn) and `graph-021` Dijkstra with Heap at 21 days.

**Shipped as derived data.** `PathStage` still carries only `problemIds` (`src/types/problem.ts:41-46`), so the schema extension from recommendation 3/1 was never needed: `src/lib/pathCheckpoints.ts` derives the boss set from the stage's last 3 ids, folds in one due-review id, and matches an artifact by category affinity — zero content edits.

---

## 6. Sources

**Platforms (all accessed 2026-09-13):**
- the incumbent paths: https://www.the incumbent's site/paths, https://www.the incumbent's site/paths/llms, https://www.the incumbent's site/paths/foundations (client-shell only); live track data from `https://firestore.googleapis.com/v1/projects/deep-machine-learning-9d7d0/databases/(default)/documents/tracks` (public read); collections from `https://the incumbent's public collections API`; sitemap https://www.the incumbent's site/sitemap.xml; premium https://www.the incumbent's site/premium; problem bank https://github.com/Open-the incumbent platform/DML-OpenProblem.
- fast.ai: https://course.fast.ai/ (9 lessons), https://course.fast.ai/Lessons/part2.html and https://course19.fast.ai/part2 (Part 2 requires Part 1).
- Kaggle Learn: https://www.kaggle.com/learn, https://www.kaggle.com/learn/intro-to-machine-learning, https://www.kaggle.com/learn/intermediate-machine-learning (course hours, "Builds on"/"Preparation for").
- Hugging Face: https://huggingface.co/learn/agents-course/en/unit0/introduction (units, audit vs certificate), https://huggingface.co/learn/agents-course/unit1/get-your-certificate (80% quiz), https://huggingface.co/learn/agents-course/en/unit4/introduction (GAIA ≥30% final project, leaderboard), https://huggingface.co/learn/deep-rl-course/communication/certification (80%/100% certificates), https://github.com/huggingface/agents-course.
- MLOps Zoomcamp: https://datatalks.club/docs/courses/mlops-zoomcamp/curriculum, https://github.com/DataTalksClub/mlops-zoomcamp (6 modules + project, prerequisites), https://courses.datatalks.club/mlops-zoomcamp-2025 (homework deadlines, 3 project attempts).
- DeepLearning.AI: https://www.deeplearning.ai/specializations/deep-learning, https://www.deeplearning.ai/courses/machine-learning-specialization (weekly modules, quizzes, programming assignments, 5h/week pacing).
- NeetCode: https://neetcode.io/roadmap (recommended topic order, 150 = 28 Easy/101 Medium/21 Hard), https://github.com/neetcode-gh/leetcode/blob/main/.problemSiteData.json (pattern tags).
- LeetCode: https://leetcode.com/studyplan/top-interview-150 (150 problems, 23 topic groups, "Best for 3+ months of prep time", completion badge).
- Math Academy (referenced by the incumbent's math problems as inspiration): https://www.mathacademy.com/how-it-works, https://mathacademy.com/pedagogy, https://mathacademy.com/how-our-ai-works, https://www.justinmath.com/how-math-academy-creates-its-knowledge-graph (worked example → up to 5 problems → 2-correct-to-advance; mastery gating; handcrafted knowledge graph, ~2,500 topics, 3–4 knowledge points each; FIRe spaced repetition).

**Learning science:**
- Dunlosky, Rawson, Marsh, Nathan & Willingham (2013). *Improving Students' Learning With Effective Learning Techniques.* Psychological Science in the Public Interest 14(1), 4–58. DOI 10.1177/1529100612453266. (Practice testing + distributed practice = high utility; interleaving = moderate.)
- Rohrer & Taylor (2007). *The shuffling of mathematics problems improves learning.* Instructional Science 35, 481–498. DOI 10.1007/s11251-007-9015-8.
- Taylor & Rohrer (2010). *The effects of interleaved practice.* Applied Cognitive Psychology 24(6), 837–848. DOI 10.1002/acp.1598.
- Rohrer, Dedrick & Stershic (2015). *Interleaved Practice Improves Mathematics Learning.* ERIC ED557355 (immediate/delayed Cohen's d 0.42/0.79; 30-day 84% vs 54%).
- Rohrer, Dedrick & Burgess (2019). *Interleaved Mathematics Practice: A Randomized Controlled Trial.* ERIC ED595322.
- Bjork & Bjork (2020). *Desirable difficulties in theory and practice.* Journal of Applied Research in Memory and Cognition 9(4), 475–479 (difficulty must match prior knowledge; otherwise undesirable).
- Nievelstein et al. (2013). *The worked example and expertise reversal effect in less structured tasks.* Contemporary Educational Psychology (worked examples help novices; reverse for experts).

**DeepForge files referenced:** `AGENT_CONTEXT.md` (path count refreshed to 33; the original stale 24-path note is fixed), `src/data/problems/paths.ts` (33 paths, 1,876 lines), `src/lib/paths.ts` (`resolvePrerequisites` at :367), `src/lib/pathCheckpoints.ts` (checkpoints, artifacts, prerequisite validation), `src/types/problem.ts:39-61` (`PathStage` still `problemIds`-only), `src/app/paths/[slug]/PathDetail.tsx` (checkpoint + capstone rendering), `src/components/Paths.tsx`, `scripts/verify-paths-content.ts`, `scripts/verify-paths.ts` (capstones 33/33), `src/lib/progress.ts`, `src/lib/reviewQueue.ts`, `src/data/labs.ts`, `src/data/projects.ts`, `src/data/collections.ts`, `src/data/concepts.ts`, `src/lib/concepts.ts`, `src/components/PenPaper.tsx`, `src/components/Sims.tsx`, `src/data/contests.ts`.
