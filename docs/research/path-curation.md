# Path Curation — Research & Recommendations for DeepForge

**Date:** 2026-09-13
**Author:** research agent (read-only; no code or data modified)
**Scope:** how leading platforms structure curated learning paths; a structural audit of our 28 paths in `src/data/problems/paths.ts`; and a prioritised set of improvements with verified problem ids.
**Method:** (a) read `AGENT_CONTEXT.md`, `src/data/problems/paths.ts`, `src/lib/paths.ts`, `src/data/problems/problem-meta.ts` (5,050 problems), `src/app/paths/[slug]/PathDetail.tsx`, `src/components/Paths.tsx`, `src/types/problem.ts`, `src/data/labs.ts`, `src/data/projects.ts`, `src/data/collections.ts`, `src/lib/progress.ts`, `scripts/verify-paths-content.ts`; (b) ran read-only analysis scripts against the real catalogue (pacing, difficulty ordering, cross-path overlap, stage inversions, category coverage); (c) fetched the incumbent's live path data model from its public Firestore `tracks` collection and `/get-collections` endpoint; (d) read platform documentation for fast.ai, Kaggle Learn, Hugging Face, MLOps Zoomcamp, DeepLearning.AI, NeetCode, LeetCode; (e) reviewed the learning-science literature on sequencing and practice. All URLs accessed 2026-09-13 unless noted.

---

## TL;DR

1. **Our paths are structurally valid but pedagogically thin.** The verifier enforces 3–5 stages × 6–15 problems (`scripts/verify-paths-content.ts:77-101`), but paths contain only problems (`PathStage.problemIds`, `src/types/problem.ts:41-46`) — no labs, projects, sims, math, checkpoints, or milestones. The incumbent's path model interleaves `problem | lab | math | project` steps and ends every tier with a capstone project.
2. **Only 596 of 5,050 problems (11.8%) appear in any path.** Computer Vision (6.6%), Reinforcement Learning (7.5%), Data Structures (7.6%), Algorithms (8.6%), and Information Theory (9.5%) are the least-covered categories, despite 275–455 problems each.
3. **Redundancy is real:** `math-foundations` and `math-for-machine-learning` share 20 ids (Jaccard 0.56); `probability-foundations`/`quant-interview-track` share 16; `statistics-mastery`/`data-scientist-track` share 15.
4. **Difficulty ordering has measurable inversions** in 8 of 28 paths at the stage level (e.g., `generative-models-primer`: GANs stage avg 2.5 → diffusion 1.9) and one hard→easy flip inside a stage (`time-series-and-forecasting`: `ts-037` Hard → `ts-294` Easy).
5. **Estimated hours are uncalibrated:** 9.3 min/problem for `llm-engineering` (45 problems in 7h) vs 34.6 for `algorithms-interview-grind` (26 in 15h).
6. **Prerequisites are displayed as raw ids** and are not links (`PathDetail.tsx:328-346` renders `"ml-from-scratch"`, not "ML From Scratch"), and the verifier only checks the count (≤4), not that the ids exist (`scripts/verify-paths-content.ts:73-75`).
7. **The research says:** practice testing and distributed practice are the two highest-utility techniques (Dunlosky et al. 2013); interleaving during *review* roughly doubles-to-triples delayed test scores but depresses practice accuracy (Rohrer & Taylor 2007; Taylor & Rohrer 2010); worked examples must fade as expertise grows or they reverse (worked-example/expertise-reversal effect). Our paths are blocked-by-topic with no review interleaving and no spaced re-review, even though `ProblemProgress.solvedAt` already stores timestamps (`src/lib/progress.ts:22-23`).
8. **Five paths we should add** (all ids verified against `problem-meta.ts`): Computer Vision Deep Learning, Production ML (serving + monitoring), Data Pipelines & Feature Engineering, Build a Transformer from Scratch (capstone), Causal Inference & Uplift. Two of these map directly to two of the incumbent's live paths (`inference-engineering`, `quantization`) where we currently have zero coverage.
9. **the incumbent does 3 things better** (mixed-kind steps + capstone per tier; activity-labelled sections with tier blurbs; 72 collections with resources/badges/sections). **We do 3 things better** (5,050 vs ~1,390 problems; 15 vs 5 categories; declared path metadata — goals/level/hours/prerequisites — plus MIT-licensed file-based content).
10. **Highest-impact fix:** a stage checkpoint model — 3 "boss" problems (2 Medium + 1 Hard from the stage) with hints disabled, plus one Lab/Project/Sim as the mini-project, soft-gated by stage completion. This is the missing retrieval-practice layer and maps cleanly onto features we already ship.

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
- **Milestone projects are the norm, not the exception.** the incumbent platform ends every track's advanced tier with a capstone project; MLOps Zoomcamp ends with a graded, peer-reviewed project; HF ends with a benchmark assignment; Kaggle ends with a certificate-gated course project (competition lesson). Our 28 paths end with a `ProgressBar` and the string "Path complete. Nice work." (`PathDetail.tsx:294-297`) — no artifact.
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

1. **Mixed-kind steps inside paths.** Every track interleaves problems with math (pen-and-paper), labs, and projects (642 steps: 463/124/36/19). Our `PathStage` can only hold `problemIds` (`src/types/problem.ts:41-46`) and `PathDetail` renders problems only (`PathDetail.tsx:139-187`); our 8 labs (`src/data/labs.ts`), 5 projects (`src/data/projects.ts:1378+`), 3 sims (`src/components/Sims.tsx:5-7`), and 60 pen-and-paper problems are invisible from every path.
2. **Capstone per path and activity-labelled sections.** Every the incumbent track's advanced tier ends with a named capstone (Tiny GPT, trainable CNN, MLP in JAX). Section titles carry the pedagogy ("Math: ..." then "Test: ..." then "Capstone project: ..."). Our stage blurbs describe content ("...entropy, Gini, information gain, and AdaBoost's reweighting rule."), not the learning move, and no path ends in an artifact.
3. **A collection ecosystem with sections, external resources, and badges.** 72 collections vs our 6 premade (`src/data/collections.ts:10+`); the incumbent collections have titled sections, a source paper/book/video link (39 of 72), a completion badge, and are surfaced from paths via `related`. Ours are flat id lists with a description.

### 2.3 Three things we already do better

1. **Scale and breadth.** 5,050 problems / 15 categories vs the incumbent's ~1,390 sitemap problem URLs and 5 site categories (Linear Algebra, ML, DL, NLP, CV). We also have 28 paths vs 9 tracks.
2. **Declared path metadata: goals, level, hours, tags, prerequisites.** `LearningPath` carries all of these (`src/types/problem.ts:48-61`, `src/lib/paths.ts:199-220`). the incumbent platform tracks have none of hours/goals/prerequisites/level — only `title`, `blurb`, `tiers`, `related`, `order`.
3. **Open, versioned, local-first content.** Paths are TypeScript in an MIT repo, diffable and testable (`scripts/verify-paths-content.ts` prints `ALL GREEN`; we ran it), with no account required. the incumbent platform's path definitions live in a Firestore console (proprietary), and premium gates 14 collections plus advanced interview tracks (`the incumbent's site/premium`). Our progress is localStorage-first (`src/lib/progress.ts:1-13`).

*Honest caveat:* the incumbent's server-backed progress, comments, and leaderboard remain a real advantage over our localStorage equivalents (already acknowledged in `AGENT_CONTEXT.md:42`).

---

## 3. Our gaps: a concrete critique of the 28 paths

**Verification of the numbers below.** I loaded `LEARNING_PATHS` and `PROBLEM_META` with a read-only Bun script and computed: per-path difficulty sequences and stage averages, cross-path overlaps, prerequisite graph, and category coverage. `bun run scripts/verify-paths-content.ts` prints `Paths: 28   Problems available: 5050   ALL GREEN`, so all structural complaints below are *beyond* what the verifier catches. I read all 28 path definitions end-to-end (they are in one 1,388-line file, `src/data/problems/paths.ts`), with deeper study of `math-foundations`, `ml-from-scratch`, `deep-learning-essentials`, `optimization-mastery`, `probability-foundations`, `statistics-mastery`, `algorithms-interview-grind`, `llm-engineering`, `time-series-and-forecasting`, `math-for-machine-learning`, `generative-models-primer`, and `graph-machine-learning`.

### 3.1 Ordering is weak in measurable places

Stage-level average difficulty should be (weakly) non-decreasing. It is not in 8 paths:

| Path | Inversion (earlier stage avg → later stage avg) |
|---|---|
| `deep-learning-essentials` | training-and-backprop (2.3) → text-to-embeddings (1.7) |
| `data-scientist-track` | relationships-and-testing (2.3) → models-and-metrics (1.7) |
| `quant-interview-track` | walks-and-limits (2.7) → algorithms-under-pressure (2.0) |
| `generative-models-primer` | gans-and-sample-quality (2.5) → diffusion (1.9) and → language-model-generation (1.8) |
| `math-for-machine-learning` | eigen-and-orthogonality (2.3) → calculus-and-gradients (1.9) and → probability-and-statistics (1.6) |
| `thirty-day-full-curriculum` | week-2 (1.7) and week-3 (1.7) → week-4-breadth (1.3) |
| `data-structures-core` | trees-and-tries (2.3) → hashing-union-find-and-caches (2.0) |
| `information-theory` | divergences-and-limits (2.5) → source-coding (2.1) |

One in-stage hard→easy flip: `time-series-and-forecasting` places `ts-294 STL Remainder Value` (Easy) immediately after `ts-037 Holt-Winters Additive One Step` (Hard). `math-foundations`'s first stage starts with `la-011 Vector Addition` and `la-012 Scalar-Vector Multiplication` before `la-004 Vector Dot Product` — the ordering sentence in the blurb ("Start with addition, scaling, dot products") does not match the actual id order.

### 3.2 Stages lack a "why now"

The schema has `blurb` but no rationale field (`src/types/problem.ts:41-46`). Most blurbs describe *what* is in the stage, not *why it comes now*. Examples: `optimization-mastery/schedules-and-stability` explains what a schedule is but not why it precedes momentum; `information-theory/source-coding` is described as content ("Compress messages down to their entropy...") with no link back to the divergences that precede it. the incumbent platform encodes the reason in activity-prefixed section titles and a tier blurb that names the phase goal; Kaggle encodes it as "Builds on"/"Preparation for". We encode it nowhere.

### 3.3 Prerequisites are under-specified and mis-rendered

- The prerequisite graph is acyclic and points to real path ids (verified), but it is shallow: 8 paths have no prerequisites, including `computer-vision-starter`, `nlp-starter`, `data-structures-core`, and both samplers. `math-for-machine-learning`, `probability-foundations`, `fast-track-essentials`, and `thirty-day-full-curriculum` all enter at depth 0 with overlapping content.
- **Rendering bug:** `PathDetail.tsx:332-343` maps `path.prerequisites` directly to list items, so learners see raw slugs (`ml-from-scratch`, `deep-learning-essentials`) with no title, no link, and no explanation of what to finish. Our own PenPaper view already resolves prerequisite names (`src/components/PenPaper.tsx:444`; graph in `src/data/concepts.ts:10`, unlock logic in `src/lib/concepts.ts:172`).
- **Verifier gap:** `scripts/verify-paths-content.ts:73-75` only checks `prerequisites.length <= 4`; it never checks that a prerequisite id exists or that the graph is acyclic.

### 3.4 No milestones, checkpoints, or artifacts

`PathDetail` offers a progress bar, a "Continue path" button, and the string "Path complete. Nice work." (`PathDetail.tsx:271-303`). There is:
- no per-stage pass/fail or checkpoint, so a learner can guess through a stage and still see 100%;
- no "boss" problem or mini-project;
- no hint restriction at any point (the 3-tier Study Assistant is always available, `src/lib/hints.ts`);
- no artifact to show at the end, while Kaggle/HF/MLOps Zoomcamp all produce a certificate or graded project and the incumbent produces capstone projects.

### 3.5 Coverage: 88% of the catalogue is unreachable from any path

Only **596 / 5,050** unique problems appear in any of the 28 paths. By category:

| Category | Total | In paths | Coverage |
|---|---:|---:|---:|
| Computer Vision | 395 | 26 | 6.6% |
| Reinforcement Learning | 360 | 27 | 7.5% |
| Data Structures | 355 | 27 | 7.6% |
| Algorithms | 395 | 34 | 8.6% |
| Information Theory | 315 | 30 | 9.5% |
| Optimization | 275 | 34 | 12.4% |
| Calculus | 275 | 39 | 14.2% |
| Statistics | 320 | 59 | 18.4% |
| Time Series | 315 | 61 | 19.4% |
| Probability | 320 | 64 | 20.0% |
| Linear Algebra | 275 | 60 | 21.8% |
| Graph Algorithms | 315 | 70 | 22.2% |
| ML Fundamentals | 360 | 81 | 22.5% |
| Deep Learning | 455 | 104 | 22.9% |
| NLP | 320 | 81 | 25.3% |

Notably, `computer-vision-starter` stops at `cv-040`; `cv-041`–`cv-395` (355 problems, including all detection, segmentation, augmentation, 3D, and ViT content) are unused. Deep-Learning serving/quantization content (`dl-301`+, `dl-325`–`dl-444`) and causal/uplift content (`st-283`, `st-317`, `ml-182`, `ml-290`+) are entirely absent from paths.

### 3.6 Redundancy between similar paths

Top cross-path overlaps (shared ids / Jaccard):

| Pair | Shared | Jaccard |
|---|---:|---:|
| `math-foundations` ↔ `math-for-machine-learning` | 20 | 0.56 |
| `probability-foundations` ↔ `quant-interview-track` | 16 | 0.38 |
| `statistics-mastery` ↔ `data-scientist-track` | 15 | 0.36 |
| `thirty-day-full-curriculum` ↔ `fast-track-essentials` | 15 | 0.42 |
| `linear-algebra-deep-dive` ↔ `math-for-machine-learning` | 13 | 0.29 |
| `math-foundations` ↔ `linear-algebra-deep-dive` | 11 | 0.27 |
| `ml-from-scratch` ↔ `ml-engineer-track` | 11 | 0.25 |
| `time-series-forecasting` ↔ `time-series-and-forecasting` | 9 | 0.18 |

Two pairs are effectively the same product: `math-foundations` vs `math-for-machine-learning` (both Beginner, both no prerequisites, both "vectors → eigen → calculus → probability"), and `time-series-forecasting` vs `time-series-and-forecasting` (near-identical titles; the latter's own description says it "Complements Time Series Forecasting with a stronger machine-learning and ops flavour" — a learner cannot tell which to start). Some overlap is intentional spiral review (e.g., `st-002 Variance` appears in 6 paths), but right now it is accidental: nothing labels those repeats as review, and the samplers (`thirty-day-full-curriculum`, `fast-track-essentials`) duplicate the paths they are meant to sample.

### 3.7 Paths we do not have (with verified ids and proposed stage titles)

All ids below were resolved against `src/data/problems/problem-meta.ts` (read-only script, 2026-09-13). None are typos; every stage is sized 5–8 to satisfy the existing verifier (`scripts/verify-paths-content.ts:99-101`). Effort applies to authoring + verification.

#### P1. Computer Vision Deep Learning — *Advanced; prereq: `computer-vision-starter`, `deep-learning-essentials`* (covers CV's unused 355 problems; the incumbent has no dedicated advanced CV track)

- **Stage 1 — Convolution at Scale** (8): `cv-084` Conv Output Size, `cv-087` Conv Parameter Count, `cv-110` Conv FLOPs Count, `cv-223` Dilated Conv Output Size, `cv-238` Depthwise Conv Output, `cv-239` Group Conv Output, `cv-242` Conv+ReLU Fusion, `cv-357` 3D Conv FLOPs
- **Stage 2 — Normalisation and Augmentation** (7): `cv-111` Batch-Norm Inference, `cv-240` BatchNorm Fold into Weights, `cv-277` Augmentation Policy Random Choice, `cv-278` RandAugment Magnitude Schedule, `cv-279` TrivialAugment Pick, `cv-347` RandAugment Sampled Ops, `cv-232` Random Resized Crop (Seeded)
- **Stage 3 — Detection and Segmentation** (8): `cv-109` Anchor IoU Matching, `cv-148` Anchor Grid Generation, `cv-199` ROI Pool Bins, `cv-313` Pairwise IoU Matrix, `cv-319` mAP at IoU Threshold, `cv-229` Hamming Loss for Segmentation Masks, `cv-331` Segmentation IoU with Ignore Label, `cv-333` Class-Weighted Segmentation Loss
- **Stage 4 — Vision Transformers and 3D** (7): `cv-171` ViT Patchify, `cv-188` Conv Patch Embedding, `cv-192` Patch Merging Downsample, `cv-342` Unpatchify Image, `cv-393` Masked Patch Reconstruction Loss, `cv-185` Depth from Disparity, `cv-385` Scale-Invariant Depth Error

#### P2. Production ML: Serving, Quantization and Monitoring — *Advanced; prereq: `ml-engineer-track` or `deep-learning-essentials`* (zero current coverage; maps to the incumbent's `inference-engineering` + `quantization` tracks, which are among its most active)

- **Stage 1 — Training Systems and Cost** (6): `dl-100` Micro-Batch Count, `dl-101` Throughput Estimate, `dl-102` Latency Estimate, `dl-120` Gradient Checkpointing Memory, `dl-196` Parameter Shard Range, `dl-283` FSDP Shard Size
- **Stage 2 — Quantization and Compression** (6): `dl-301` Quantized Inference Latency, `dl-325` MXFP4 Block Quantization Error, `dl-332` Quantization Step Size, `dl-334` Quantization Error Variance, `dl-348` Quantization Memory Savings Ratio, `dl-365` Quantized KV Cache Size
- **Stage 3 — Serving, Batching and Caching** (6): `dl-189` Decode Latency Estimate, `dl-200` Prefix Cache Reuse Length, `dl-213` Dynamic Batch Admission, `dl-305` Batch-Latency Tradeoff, `dl-307` Latency SLA Budget, `dl-316` Continuous Batching Slot Simulation
- **Stage 4 — LLM Inference Capacity** (6): `dl-370` GQA Cache Savings Fraction, `dl-401` KV Cache Bytes Per Token, `dl-412` Roofline Crossover Batch Size, `dl-416` Tokens Per Second From MFU, `dl-441` Prefill Decode Throughput Blend, `dl-444` Latency For Target Throughput
- **Stage 5 — Monitoring, Drift and Retraining** (6): `st-275` One-Sample KS Drift Statistic, `ml-264` Chi-Square Drift Test, `ml-340` Feature Drift KS Statistic, `ml-267` Retraining Cost-Benefit, `ml-315` Feature Store Consistency, `ts-261` Retrain Cadence

#### P3. Data Pipelines & Feature Engineering — *Intermediate; prereq: `ml-from-scratch`, `statistics-mastery`* (data-engineering-adjacent; current paths cover lag features only inside the time-series paths)

- **Stage 1 — Feature Construction** (6): `ml-084` Feature Interaction Product, `ml-085` Quadratic Features, `ml-086` Binning Continuous Features, `ml-112` Log Transform Feature, `ml-117` Feature Crossing, `ml-258` Feature Bagging Indices
- **Stage 2 — Lag, Window and Rolling Features** (6): `ts-003` Lag Operator, `ts-017` Rolling Mean Window k, `ts-018` Rolling Median, `ts-019` Rolling Maximum, `ts-118` Rolling Skewness, `ts-240` Rolling Stats Features
- **Stage 3 — Splits, Leakage and Validation** (6): `ml-129` Expanding Window Splits, `ml-172` Expanding Window Mean Forecast, `ml-173` Walk-Forward Window Count, `ml-049` Stratified Train/Test Split, `ml-026` One-Hot Encoding, `ml-022` Shuffled Train/Test Split
- **Stage 4 — Drift, Dedup and Data Quality** (6): `st-269` Dedup Threshold Decision, `st-270` N-gram Overlap Dedup, `st-275` One-Sample KS Drift Statistic, `ml-264` Chi-Square Drift Test, `ml-174` Population Stability Index, `ml-340` Feature Drift KS Statistic
- **Stage 5 — Sketching the Data** (6): `al-353` HyperLogLog Register Index, `al-363` Space-Saving Stream Summary, `al-364` T-Digest Centroid Compression, `ds-155` Reservoir in Stream, `ds-306` Tumbling Window Aggregate, `ds-159` Sliding Window Counter

#### P4. Build a Transformer from Scratch (capstone path) — *Advanced; prereq: `deep-learning-essentials`* (intentionally spirals ids from `deep-learning-essentials` and `llm-engineering`; this is spaced review, not duplication, and should be labelled as such)

- **Stage 1 — Tokenize and Embed** (6): `nlp-096` Byte-Level BPE Token Count, `nlp-020` BPE Merge Step, `dl-020` Embedding Lookup, `dl-104` Embedding Parameter Count, `dl-032` Embedding Backward Scatter-Add, `dl-033` Sinusoidal Positional Encoding
- **Stage 2 — Attention from First Principles** (7): `dl-034` Scaled Attention Scores, `dl-035` Attention Softmax Weights, `dl-036` Attention Weighted Sum, `dl-037` Multi-Head Split, `dl-038` Multi-Head Merge, `dl-092` Multi-Head Attention Parameter Count with Bias, `dl-097` Cross-Attention Shapes
- **Stage 3 — The Block** (7): `dl-027` LayerNorm Forward, `dl-377` LayerNorm vs RMSNorm Outputs, `dl-042` GELU (Tanh Approximation), `dl-067` GELU Exact (Erf), `dl-378` Residual Gradient Scale Pre Vs Post Norm, `dl-087` Transformer Encoder Block Forward, `dl-091` Transformer Encoder Block Parameter Count
- **Stage 4 — Training and Masking** (5): `dl-003` Numerically Stable Softmax, `dl-043` Softmax + Cross-Entropy Backward, `dl-208` Attention Mask With Padding, `dl-210` Sliding Window Attention Mask, `dl-119` Attention Dropout (Seeded)
- **Stage 5 — Decode and Measure** (5): `dl-075` KV Cache Size, `dl-186` KV Cache Append Step, `dl-211` Online Softmax Rescale Step, `dl-123` Attention FLOPs (Quadratic), `dl-414` Forward FLOPs Per Token
- **Milestone:** capstone = Projects `gpt` "Build a GPT from Scratch" (`src/data/projects.ts:1380`, step ids `proj-001`–`proj-008`). This path only makes sense once paths can reference a project (§4 rec 3 and §5).

#### P5. Causal Inference & Uplift — *Advanced; prereq: `statistics-mastery`* (only `ml-195` IPW ATE currently appears, inside `data-scientist-track`)

- **Stage 1 — Propensity Scores and Weighting** (7): `st-283` Logistic Propensity Score, `st-284` Propensity Match Pair Count, `st-288` Propensity Overlap Fraction, `st-101` Propensity Weight Trim, `st-277` ATT via Propensity Odds, `st-285` IPW Average Treatment Effect, `ml-346` ATT Propensity Weights
- **Stage 2 — Adjustment and Quasi-Experiments** (5): `ml-271` Propensity Newton Step, `ml-345` Propensity Trimming Fraction, `st-317` Causal Forest Honesty Split, `st-318` Quantile Treatment Effect, `ml-280` Fuzzy RD Treatment Jump
- **Stage 3 — Uplift Modeling** (6): `ml-182` Relative Uplift, `ml-199` Uplift per Segment, `ml-235` Response Rate Uplift by Decile, `ml-287` Two-Model Uplift, `ml-290` Uplift Cumulative Gain, `ml-291` Uplift Calibration Error
- **Stage 4 — Time-Aware Causality** (2, extend later): `ts-289` Granger Causality F from Series, `ml-343` Uplift Gain at Fraction

### 3.8 Honesty notes

- the incumbent platform's UI could still gate steps in a way not visible in the JS strings I searched; I verified the *data model* has no required/lock field and the UI strings are congratulatory, so "soft gating" is a fair characterisation but not a certainty.
- the incumbent's premium page claims "All five learning paths" while the live `tracks` collection has 9; the sitemap has 10 path URLs (including legacy `/paths/foundations`). Marketing and product drifted there too.
- Our in-path coverage stats count ids once per path; overlapping ids are counted each time they appear. The 596 unique figure is deduplicated across all paths.

---

## 4. Recommendations (prioritised for learner outcomes)

Each item states what, why (with evidence), the files to touch, and effort (S ≤ half-day, M = 1–3 days, L = multi-day).

**1. Add a per-stage checkpoint: 3 "boss" problems + one artefact, hints disabled, soft gate. (M)**
*What:* every stage gets an optional `checkpoint: { problemIds: string[] (2 Medium + 1 Hard), passRatio: 0.67, artifact?: {kind, ref} }`; completing N% of a stage surfaces it; pass requires 2/3 without opening tier-3 hints; a passed checkpoint marks the stage complete even if 1–2 stage problems remain.
*Why:* retrieval practice is one of only two high-utility techniques in Dunlosky et al. 2013 (practice testing; DOI 10.1177/1529100612453266); we have no retrieval layer at all (`PathDetail.tsx:271-303` shows only % progress). the incumbent platform's capstones and HF's 80% quizzes are the same move.
*Files:* `src/types/problem.ts:41-46` (schema), `src/data/problems/paths.ts` (28 paths), `src/lib/paths.ts:149-190` (resolve/validate), `src/app/paths/[slug]/PathDetail.tsx` (render + pass state), `scripts/verify-paths-content.ts` (checkpoint ids exist).

**2. Introduce spaced review using `solvedAt` timestamps: surface "Review due" and mix old problems into checkpoints. (L)**
*What:* compute due reviews per stage (e.g., 2/7/21-day intervals off `solvedAt`), show a "Review due" queue on `PathDetail` and the home view, and include 2–3 due ids in each checkpoint set.
*Why:* distributed practice is the other high-utility technique (Dunlosky 2013); interleaved review raised delayed test scores from 54% → 84% in Rohrer, Dedrick & Stershic 2015 (ERIC ED557355) and tripled scores 1 week out in Rohrer & Taylor 2007 (Instructional Science 35:481–498). `ProblemProgress.solvedAt` is already stored (`src/lib/progress.ts:22-23`), so no schema migration is needed.
*Files:* `src/lib/progress.ts`, `src/lib/paths.ts`, `src/app/paths/[slug]/PathDetail.tsx`, `src/components/Paths.tsx`, optionally `src/components/DailyChallenge.tsx`.

**3. Extend paths to mixed-kind steps: `problem | lab | project | math | sim`. (L)**
*What:* add `steps: { kind, ref, note? }[]` alongside `problemIds` (deprecated but kept for compatibility), render in `PathDetail`, and sprinkle our 8 labs (`src/data/labs.ts:510+`), 5 projects (`src/data/projects.ts:1378+`), 3 sims (`src/components/Sims.tsx:5-7`), and 60 pen-and-paper items into existing paths.
*Why:* the incumbent's single biggest structural advantage — 642 steps spanning 4 kinds, labs injected where needed, capstone projects per track. Our labs/projects/sims are unreachable from all 28 paths today; `PathStage` has no field for them (`src/types/problem.ts:41-46`).
*Files:* `src/types/problem.ts`, `src/lib/paths.ts`, `src/app/paths/[slug]/PathDetail.tsx`, `src/components/Paths.tsx`, `scripts/verify-paths.ts` / `verify-paths-content.ts`, `src/data/problems/paths.ts`.

**4. Ship the five new paths in §3.7, starting with P2 (Production ML) and P1 (CV). (M)**
*What:* add them to `LEARNING_PATHS` with the exact ids listed; required because CV coverage is 6.6% and serving/quantization/monitoring coverage is 0%.
*Why:* the incumbent's most recently touched tracks by sitemap `lastmod` are `/paths` (2026-08-01), plus active `inference-engineering`, `quantization`, and `ai-safety-governance` tracks in the live data — the market is moving toward deployment skills, and our catalogue already has the problems (`dl-301`–`dl-444`).
*Files:* `src/data/problems/paths.ts`, `scripts/verify-paths-content.ts`.

**5. Resolve prerequisite ids to titles, link them, and validate them in CI. (S)**
*What:* render "Before you start" as links to `/paths/<slug>` with titles; add verifier checks that every prerequisite exists, is acyclic, and is not self-referential.
*Why:* the current UI prints raw slugs (`PathDetail.tsx:332-343`); PenPaper already resolves names (`src/components/PenPaper.tsx:444`, graph at `src/data/concepts.ts:10`); the verifier only checks count (`scripts/verify-paths-content.ts:73-75`). Kaggle's "Builds on / Preparation for" is the reference pattern.
*Files:* `src/app/paths/[slug]/PathDetail.tsx`, `src/lib/paths.ts`, `scripts/verify-paths-content.ts`.

**6. Add a per-stage `rationale` ("why now") and call it in the UI. (S)**
*What:* one sentence per stage explaining the dependency ("Momentum before Adam: adaptive methods are per-parameter momentum with a second-moment scale"), rendered above the stage blurb or as a caption.
*Why:* the incumbent encodes this in activity-prefixed section titles and tier blurbs (e.g., `llms` tier blurb: "Teach the next-token objective... then test yourself on tokenization"); our blurbs describe content, not order. This costs ~28 path edits and is cheap to verify.
*Files:* `src/types/problem.ts`, `src/lib/paths.ts:149-162`, `src/app/paths/[slug]/PathDetail.tsx`, `src/data/problems/paths.ts`.

**7. Calibrate `estimatedHours` and enforce a pacing guardrail. (S)**
*What:* target ~12–40 min/problem based on observed norms; fix outliers (`llm-engineering` 45 problems/7h = 9.3 min; `math-for-machine-learning` 31/5h = 9.7; `time-series-and-forecasting` 31/5h = 9.7; `graph-machine-learning` 36/7h = 11.7) and add a verifier warning for paths outside 10–45 min/problem.
*Why:* the range today is 9.3 → 54.5 min/problem, a 5.9× spread that makes hours meaningless for planning. `algorithms-interview-grind` (34.6 min) is realistic for Hard DP; `llm-engineering` is not.
*Files:* `src/data/problems/paths.ts`, `scripts/verify-paths-content.ts`.

**8. De-duplicate the two near-identical path pairs and position samplers explicitly. (M)**
*What:* merge `math-for-machine-learning` into `math-foundations` (or demote it to an explicit "condensed" variant with a cross-link), and rename/reposition `time-series-and-forecasting` as "Applied Time Series & Ops" with a stated prerequisite on `time-series-forecasting`. Make `thirty-day-full-curriculum` / `fast-track-essentials` declare that they intentionally re-sample other paths.
*Why:* 20 shared ids / Jaccard 0.56 for the math pair; near-identical titles for the time-series pair; samplers duplicate the paths they sample (15 shared ids between the two samplers). the incumbent platform never ships two tracks with the same job — each has a distinct blurb and one of nine ordered slots.
*Files:* `src/data/problems/paths.ts`, `scripts/verify-paths-content.ts` (e.g., warn if Jaccard > 0.5 between two paths without an explicit `variantOf` field).

**9. Add a checkpoint quiz mode that interleaves prior stages and disables hints. (M/L)**
*What:* at each checkpoint, serve 5 mixed items (2 from the current stage, 3 drawn from earlier stages in the same path), 80% to pass, tier-3 hints unavailable during the attempt.
*Why:* interleaving boosts delayed test performance (Rohrer & Taylor 2007; Taylor & Rohrer 2010, `Applied Cognitive Psychology` 24:837–848) and the incumbent/HF/DL.AI all have an assessment step; our hint system is always on (`src/lib/hints.ts`), which undercuts retrieval. Use `src/data/penpaper.ts` for pen-and-paper checkpoints and existing problems for code checkpoints.
*Files:* new `src/lib/pathCheckpoints.ts`, `src/app/paths/[slug]/PathDetail.tsx`, `src/data/penpaper.ts`, `src/lib/hints.ts` (attempt-scoped suppression).

**10. Award a path credential on checkpoint completion and fix docs drift. (S/M)**
*What:* on 100% of stages + all checkpoints, issue a shareable path badge (reuse the existing badges infrastructure: `src/lib/badges.ts`, `src/components/Badges.tsx`); reword the completion copy; add the path-authoring checklist to `docs/`; update `AGENT_CONTEXT.md` (it still says 24 paths at lines 32 and 263; the file has 28).
*Why:* LeetCode study plans award a badge, Kaggle issues per-course certificates, HF issues completion/excellence certificates, and the incumbent badges every collection — credentials are the standard completion loop we lack. The stale count is a live docs bug.
*Files:* `src/lib/badges.ts`, `src/components/Badges.tsx`, `src/app/paths/[slug]/PathDetail.tsx`, `AGENT_CONTEXT.md`, new `docs/path-authoring.md`.

---

## 5. A proposed milestone / checkpoint model mapped to Projects, Labs and Sims

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
- Spaced review: `dl-027` LayerNorm Forward and `dl-043` Softmax + Cross-Entropy Backward due at 14 days. This checkpoint is the natural on-ramp to proposed path P4.

**Example C — `graph-algorithms` / stage `robustness-and-flow` (graph-038, graph-037, graph-039, graph-130, graph-060, graph-127).**
- Boss set: `graph-127` Negative Cycle Path Extraction Lite (Hard), `graph-060` Ford-Fulkerson Max Flow (Hard), `graph-039` SCC Count (Kosaraju) (Hard) — pass 2/3; hints off.
- Mini-project: Sim `DijkstraStep` (interactive shortest-path stepping); contest `graph-gauntlet` (`src/data/contests.ts:183`) as the timed variant.
- Spaced review: `graph-019` Topological Sort (Kahn) and `graph-021` Dijkstra with Heap at 21 days.

Because `PathStage` currently only carries `problemIds` (`src/types/problem.ts:41-46`), these checkpoints require the schema extension in recommendation 3/1. Until then, they can ship as derived data in `src/lib/paths.ts` with zero content edits (boss sets chosen from the last 3 ids of each stage, labs matched by category), which is the cheapest possible first increment.

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

**DeepForge files referenced:** `AGENT_CONTEXT.md:32,263` (stale 24-path count), `src/data/problems/paths.ts` (28 paths, 1,388 lines), `src/lib/paths.ts:149-220`, `src/types/problem.ts:39-61`, `src/app/paths/[slug]/PathDetail.tsx:104-193,271-348`, `src/components/Paths.tsx:33-120`, `scripts/verify-paths-content.ts:73-101,117-132`, `src/lib/progress.ts:15-28`, `src/data/labs.ts:507-520`, `src/data/projects.ts:1378+`, `src/data/collections.ts`, `src/data/concepts.ts:10`, `src/lib/concepts.ts:172`, `src/components/PenPaper.tsx:444`, `src/components/Sims.tsx:5-7`, `src/data/contests.ts:183`.
