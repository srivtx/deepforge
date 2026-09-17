# Feature Gaps 2026 — What DeepForge Is Missing and What to Build Next

**Date:** 2026-09-14
**Author:** research agent (read-only; no code or data modified — this file is the only write)
**Scope:** inventory what ships today, benchmark the field against 2026 learning mechanics, gap-audit our product across onboarding, retention, feedback, social, credentials, mobile, search, notifications, freshness, accessibility, and data/account; propose the top 12 new features for the next wave and a parallelization plan.
**Method:** read the repo files listed in the task plus the surrounding implementation (`src/lib/progress.ts`, `src/lib/concepts.ts`, `src/lib/penpaper.ts`, `src/lib/stats.ts`, `src/lib/certificates.ts`, `src/lib/runs.ts`, `src/lib/pyodide.ts`, `src/components/Badges.tsx`, `src/app/sitemap.ts`, `supabase/migrations/`); ran dated web searches (2026-first) across interview prep, coding platforms, learning-loop mechanics, AI-native learning, and credential mechanics; checked component reachability and doc-vs-code drift.
**Totals policy:** product totals are trusted from `README.md` / `AGENT_CONTEXT.md` (5,550 problems, 15 categories, 33 paths, etc.), not re-derived.
**Effort scale (matches `docs/research/path-curation.md`):** S ≤ half-day, M = 1–3 days, L = 3+ days per agent.
**Naming rule:** public platforms are named; the direct ML-practice incumbent tracked in `docs/research/path-curation.md` is referred to only as "the incumbent" and only via mechanics.

---

## 0. TL;DR

1. **The catalogue is world-class and the habit layer is average.** 5,550 verified problems, 33 paths with derived checkpoints (`src/lib/pathCheckpoints.ts`), badges/XP/quests (`src/lib/badges.ts`), and a real-time forum. What is missing is everything that happens **after a problem is solved**.
2. **There is no memory layer for the 5,550 problems.** An SM-2-style scheduler exists (`src/lib/concepts.ts:189-244`) but it only covers the 20 Pen & Paper concepts; it is surfaced only inside `PenPaper.tsx` and its state bypasses the sync seam. `ProblemProgress.solvedAt` (`src/lib/progress.ts:22-23`) is stored for every code solve and never used for scheduling.
3. **Cornered market: coding-specific spaced repetition is now a product category.** SM-2/FSRS review queues for coding interviews shipped across multiple 2026 tools (LeetRepeat, SpacedSmart, AlgoReps, Aurora); the ones surveyed top out at curated sets in the low hundreds and none pairs review scheduling with a 5,550-problem verified catalogue or an offline-first browser engine.
4. **The 2026 interview changed and our mocks did not.** CodeSignal launched agentic coding assessments in April 2026 (91% of surveyed engineers already use agentic tools; 56% would hesitate to hire an engineer who cannot). Karat data cited in April 2026: 71% of engineering leaders say AI makes technical skill harder to assess. Our Interview Prep (`src/components/InterviewPrep.tsx`) is timed silent coding — the one format 2026 hiring moved away from.
5. **Feedback stops at green tests.** Zero (`src/lib/assistant.ts`) is a deterministic 6-intent template engine with BM25 retrieval and 5 code heuristics — useful, but no structured review (logic/style/complexity), no self-explanation, no rubric. 2026 research on LLM code feedback reports learning gains when feedback is adaptive and prompt-constrained (Springer *Discover Education*, 2026-03-23) and when students explain code before getting answers (arXiv ESSE, 2026-08-25).
6. **No reminders at all.** The PWA exists (`public/sw.js`, `src/components/PwaManager.tsx`) but there is no notification permission flow, no streak-risk nudge, no review-due reminder. State-aware reminder orchestration is the documented retention engine of consumer learning apps (Duolingo teardown, 2026-05-09).
7. **Streaks reset with no protection.** Duolingo sells streak freezes; Brilliant ships Streak Charges (max 2, auto-applied on a missed day). We have a hard reset (`src/lib/daily.ts:110-126`), which is maximum anxiety and no save.
8. **Social is threads, not accountability.** Discuss/comments have pagination + realtime (`src/lib/sync/social.ts:1083-1237`), but there are no study groups, no shared streaks, no buddy nudges, no peer mocks — the mechanics every 2026 study app is built around.
9. **Credentials are printable, not verifiable.** `src/lib/certificates.ts:288-301` mints a deterministic FNV code that is printed on the certificate; there is no verify route, no signature, no evidence payload. 2026 hiring moved toward cryptographic skill proof (Ed25519 evidence chains, W3C VC, eIDAS 2.0 timing).
10. **The 2026 differentiator is free to take: "debug the AI."** We own the one asset needed to build it — a verified solution for every problem. Deterministic solution-mutation makes offline "the model wrote this, find the bug" rounds possible with no LLM, no API key, and no network.
11. **Quick wins are real.** Streak shield (S), a single "Today" screen (M), and a review queue (M) are compositional: every primitive exists (progress, daily, badges, paths). A six-lane wave can ship them without touching shared files.
12. **Integrity findings are listed in §6** — including a stale planning doc that will misdirect the next agent (`docs/next-wave-plan.md` still says 5,050 problems / 28 paths / comments UI missing), a hardcoded `lastModified` for ~5,600 sitemap URLs, one dead component, and a lab quest that only completes if the Badges view happens to be mounted.

---

## 1. What exists today (trusted inventory)

| Asset | Totals | Evidence |
|---|---|---|
| Problems | 5,550 across 15 categories, every solution Python-verified | `README.md:23`, `AGENT_CONTEXT.md:23` |
| Learning paths | 33 with stages, goals, verified prerequisites, derived checkpoints, artifacts | `src/lib/pathCheckpoints.ts`, `docs/research/path-curation.md` |
| Projects / Labs / Contests | 5 projects · 36 steps; 8 labs; 12 contests + speedruns | `src/data/projects.ts`, `src/data/labs.ts`, `src/data/contests.ts`, `README.md:49-53` |
| Pen & Paper | 60 no-code problems; SM-2-style scheduler for 20 concepts | `src/data/penpaper.ts`, `src/lib/concepts.ts` |
| Interview Preps | 13 company tracks + timed mocks | `README.md:56` |
| Articles / Blog | 11 interactive lessons; 4 engineering posts + RSS | `README.md:60-61` |
| Gamification | 24 badges, XP/levels, deterministic daily quests, 52-week heatmap | `src/lib/badges.ts:333-555`, `README.md:65` |
| Social | Forum + per-problem comments, upvotes, pagination, realtime | `src/lib/sync/social.ts`, `src/components/Discuss.tsx`, `src/components/ProblemComments.tsx` |
| Sync | Local-first `createStore` seam; optional Supabase (3 migrations incl. hardening) | `src/lib/sync/store.ts`, `supabase/migrations/` |
| Credentials | Printable/PNG certificates with a deterministic verification code (FNV) | `src/lib/certificates.ts:288-301` |
| Engine | Pyodide v0.26, main thread, lazy-loaded; PWA service worker | `src/lib/pyodide.ts`, `public/sw.js` |
| Assistant | "Zero": 6 intents, BM25-lite retrieval, code heuristics, fully offline | `src/lib/assistant.ts:96-103,1024-1049` |

**Reusable primitives for the next wave:** `createStore` + `StoreSpec` (new syncable stores in minutes), `getBadgeSnapshot()` (one call reaches progress/daily/labs/research/contests), `derive()` in `badges.ts` (solved entries with timestamps), `deriveBossIds`/`evaluateStageCheckpoint` in `pathCheckpoints.ts`, realtime subscription helpers in `sync/social.ts:1165`, `ARTICLES` registry + demo/figure primitives, and `PROBLEM_META` for light-index selection.

**The structural hole:** every feature above measures *what was done*. Nothing schedules *what should be revisited*, and nothing turns the next session into a single pre-decided action.

---

## 2. Gap audit

Legend — **Have:** yes / partial / no. Effort for the gap-closing feature (full candidate detail in §3). Files are the primary touch points, not exhaustive.

| # | Mechanic | Who does it (2026) | Have | Why it matters | Effort | Files to touch |
|---|---|---|---|---|---|---|
| **Onboarding & direction** | | | | | | |
| 1 | Placement diagnostic / competency onboarding | Brilliant uses real problems to place users; Graspful runs 20–60 adaptive diagnostic questions with Bayesian inference | no | "Where do I start" is the top drop-off on a 5,550-problem library; paths assume zero | M | `src/app/page.tsx`, new `src/components/Onboarding.tsx`, new `src/app/start/page.tsx`, new `src/lib/onboarding.ts` |
| 2 | Pre-chosen next action ("Today") | Duolingo / Brilliant / Cadence: open → next item already chosen, no library decision | partial — Daily Challenge + path "Continue" exist, but home is a 23-section hub (`src/lib/sections.ts`) | Decision fatigue is the most-copied solved problem in consumer learning | M | new `src/app/today/page.tsx`, new `src/components/Today.tsx`, `src/lib/sections.ts`, `src/components/NavMenus.tsx` |
| 3 | Goal + target date | Readiness dashboards project pace toward an interview date | no | Turns practice into a plan; prerequisite for readiness projection | S | new `src/lib/goals.ts` or fold into `src/lib/stats.ts`, `src/app/interview/page.tsx` |
| **Retention & habit** | | | | | | |
| 4 | Spaced review of solved code problems | LeetRepeat (SM-2 + interview mode), SpacedSmart (LCM 1.1), AlgoReps (FSRS-inspired), Aurora (FSRS + readiness), CodingInterviewHQ (adaptive queue) | partial — SM-2 exists only for 20 pen-paper concepts (`src/lib/concepts.ts:189-244`); every code solve stores `solvedAt` unused | "Solved" ≠ remembered; forgetting-curve scheduling is the single highest-utility retention mechanic | M | new `src/lib/reviewQueue.ts`, `src/components/DailyChallenge.tsx`, tests |
| 5 | Due-review surface | Anki-style daily queue; readiness dashboards | partial — `getDueConcepts` rendered only inside `src/components/PenPaper.tsx:642-643` | A scheduler no one sees changes no behavior | S | new `src/components/Today.tsx`, `src/components/PenPaper.tsx` |
| 6 | Streak protection (freeze / repair) | Duolingo streak freeze; Brilliant Streak Charges (max 2, auto-applied, earned per lesson) | no — a missed day resets (`src/lib/daily.ts:110-126`) | Loss aversion is the retention lever; no save converts a bad week into churn | S | `src/lib/daily.ts`, `src/components/StreakCard.tsx`, `src/lib/badges.ts` |
| 7 | State-aware reminders (push/in-app) | Duolingo's state model (active/wobbling/at-risk/dormant, one primary + one backup, cooldown); Pushwoosh e-learning; MemoryPush / Ripasso notification-first learning | no — PWA exists (`public/sw.js`) but no permission flow, no scheduled reminders | Brings the learner back on the due day; documented 3× completion claim from streak campaigns | M | new `src/lib/reminders.ts`, `src/components/PwaManager.tsx`, `public/sw.js`, `src/app/layout.tsx` |
| 8 | Milestones & celebrations | Duolingo leagues, Brilliant confetti | yes — `src/components/Celebration.tsx`, badges, XP | Keep | — | — |
| 9 | Daily quests + heatmap | Duolingo daily quests | yes — `src/lib/badges.ts:932-1131` | Keep; wire to reviews in #4 | — | — |
| **Feedback quality** | | | | | | |
| 10 | Structured code review (logic / style / complexity) | LLM-as-reviewer products and research systems (Springer 2026; NAILA 900+ students); agent platforms ship AI code review | no — Zero reviews code with 5 regex heuristics (`src/lib/assistant.ts:654-750`) | Tests say pass/fail; learning happens in the explanation | M | new `src/lib/llmReview.ts` (optional), `src/components/ProblemView.tsx`, `src/components/ZeroAssistant.tsx` |
| 11 | Socratic hint escalation | CodeTutor 4-level hint ladder; llm-tutor plug-in; ExplainRoute audit framework | partial — 3-tier hints (`src/lib/hints.ts`) but tier 3 is always available and attempt-agnostic | Answer-giving undercuts retrieval; hint policy is pedagogy | S | `src/lib/hints.ts`, `src/components/ProblemView.tsx` |
| 12 | Self-explanation / Feynman gate | ESSE self-explanation tutor (arXiv 2608.25180, 2026-08-25); PNAS 2025 finding that answer-first AI users scored 17% worse later | no | Forces generative processing before solution reveal; measurable persistence/completeness gains | M | new `src/lib/explain.ts`, `src/components/ProblemView.tsx`, new store |
| 13 | Spoken mock interview with rubric | interviewing.io AI interviewer; Exponent peer + AI rubric; OphyAI (4-dimension score + transcript); DevInterview.AI (scored vs prior sessions) | partial — 13 tracks + timed mocks, silent, no interviewer simulation, no rubric | Interviews grade communication and reasoning, not only output | L | `src/components/InterviewPrep.tsx`, new `src/components/MockInterview.tsx`, new `src/lib/mockInterview.ts` |
| 14 | AI-assisted / agentic round practice | CodeSignal agentic assessments (2026-04-02): use agentic tools, then explain decisions; Rubduck; interview guides report AI-allowed rounds as standard | no | The modal 2026 interview format; also the best defense against skill atrophy | M | new `src/lib/spotBug.ts`, `src/components/ProblemView.tsx`, `src/types/problem.ts` |
| 15 | Feedback→action telemetry | Research measures "action rate" on AI review comments (32–33%) | no | Without it we cannot tell if feedback changes behavior | S | `src/lib/stats.ts` |
| **Social accountability** | | | | | | |
| 16 | Study groups with shared goals/streak | Cramvy (groups of 15, group streak, silent rooms), roomn (forfeits), Grindly (class battles), StudyCrew, Lilo | no — only forum + leaderboard | Group accountability is the 2026 study-app growth loop; group streak dies if anyone skips | L | new `supabase/migrations/*_groups.sql`, new `src/lib/sync/groups.ts`, new `src/app/groups/page.tsx` |
| 17 | Buddy nudges (one tap) | Cramvy "Streak Buddy" (9pm nudge, one tap, no thread) | no | Cheapest possible accountability; makes the streak social | S/M (after #16) | same as #16 |
| 18 | Peer mock interviews | Exponent schedules reciprocal peer mocks with rubrics | no | Teaching effect + feedback exchange; also the anti-solo fix for interview prep | M (after #16) | `src/components/InterviewPrep.tsx`, `src/lib/sync/social.ts` |
| 19 | Head-to-head / ghost races | LeetCode contests; Grindly battles; Cramvy battles | partial — `src/lib/runs.ts` has run codes + ghost comparison | Async competition needs no scheduling; retention spike on race days | M | `src/lib/runs.ts`, `src/components/Speedrun.tsx`, new duel surface |
| 20 | Threaded discussion (realtime + pagination) | — | yes | Keep | — | — |
| **Credentials** | | | | | | |
| 21 | Verifiable certificates (tamper-evident, public verify) | Veril.ai (Ed25519 evidence chain, public key), SkillSeal (proctored + audit trail), Workera (rubric-anchored evidence) | partial — FNV code printed on certs (`src/lib/certificates.ts:288`); no `/verify`, no signature, no evidence payload | 2026 hiring wants inspectable proof; a PDF is a claim | M (phase 1) | `src/lib/certificates.ts`, `src/components/Certificates.tsx`, new `src/app/verify/[code]/page.tsx`, new `src/lib/credentials.ts` |
| 22 | Public evidence profile | Skallery (evidence chain), study apps ship shareable public profiles | partial — leaderboard row only | Social currency + a hiring artifact from real work | M/L | new `src/app/u/[handle]/page.tsx`, `src/lib/sync/backend.ts`, RLS |
| 23 | Assessment-gated path credential | Kaggle per-course certificates; HF 80% quizzes; LeetCode plan badges | partial — derived checkpoints exist (`pathCheckpoints.ts:61-63`) and badges fire, but no gated issue | The completion loop needs a threshold, not a progress bar | S/M | `src/lib/certificates.ts`, `src/app/paths/[slug]/PathDetail.tsx` |
| **Adaptive learning** | | | | | | |
| 24 | Knowledge tracing / mastery model | Graspful (BKT + forgetting), TutorTrace (misconceptions + decay), Kitto (gap detection) | partial — `getEstimatedMastery()` is coverage/depth/recency only (`src/lib/stats.ts:379-419`); concept mastery exists for pen-paper | Personalization and honest "am I ready" need per-skill state | M | new `src/lib/mastery.ts`, `src/lib/stats.ts`, `src/components/StatsDashboard.tsx` |
| 25 | Next-best-action scheduling | Math Academy (worked example → problems → 2 correct), Graspful Next-Best-Action; SkillFlow (difficulty targeting) | partial — assistant picks weakest category (`src/lib/assistant.ts:521-553`); daily pick is a hash | Optimal-difficulty practice beats random practice | M | new `src/lib/mastery.ts`, `src/lib/assistant.ts`, `src/lib/reviewQueue.ts` |
| 26 | Adaptive checkpoints | Math Academy mastery gating; training platforms that promote on pass | partial — boss sets are static derivations (`src/lib/pathCheckpoints.ts:69-90`) | A checkpoint should react: promote, review, or inject a prerequisite | M | `src/lib/pathCheckpoints.ts`, `src/app/paths/[slug]/PathDetail.tsx`, `scripts/verify-paths-content.ts` |
| **Content & freshness** | | | | | | |
| 27 | Dated "what's new" + true last-modified | NotebookLM ships monthly update waves and changelogs | partial — blog RSS exists; `src/app/sitemap.ts:15` hardcodes one date for ~5,600 URLs | Freshness signals trust and gives returning users a reason | S | `src/app/sitemap.ts`, new `src/lib/changelog.ts`, new `src/app/updates/page.tsx` |
| 28 | 2026 LLM-systems article cadence | Interactive AI explainers refresh constantly | partial — 11 articles; `docs/research/article-topics.md` names 6 planned (BPE, embeddings, quantization, KV cache, RAG, post-training) | The curriculum's differentiator vs problem farms | M/L | `src/data/articles.ts`, `src/data/articles-demos.ts`, `src/components/articles/*` |
| **Mobile / search / a11y** | | | | | | |
| 29 | Pyodide off the main thread + faster warm start | Pyodide roadmap calls main-thread blocking out; 2026 guides standardize the Web Worker pattern | no — `window.loadPyodide` on the main thread (`src/lib/pyodide.ts:48-52`); no Web Worker anywhere | Long solutions freeze the UI on phones; TTI is 5–30 s cold | M | `src/lib/pyodide.ts`, new worker module, `public/sw.js` |
| 30 | Per-route offline + SW update prompt | Standard PWA guidance | partial — fallback chain plus an update prompt already ship (`public/sw.js`, `src/components/PwaManager.tsx:296-312`); per-route offline is unverified | Offline study is our differentiator | S | `public/sw.js`, `src/components/PwaManager.tsx` |
| 31 | Screen-reader / contrast / reduced-motion completion | — | partial — keyboard pass shipped; Phase 3 audit still open per `AGENT_CONTEXT.md:282` | Baseline access, also an SEO/quality signal | S | `src/components/*`, `src/app/globals.css`, tests |
| 32 | Global search (problems + paths + articles + blog) | Command palettes are table stakes | partial — `CommandPalette.tsx` covers problems/sections; assistant BM25 covers problems only | Findability of 33 paths + 11 articles | S | `src/components/CommandPalette.tsx`, new search index |
| **Data & account** | | | | | | |
| 33 | Server-side export, deletion, privacy page | GDPR Art. 20/17 tooling in LMSs; DAPO-X portability; competitor apps ship "export my data / delete account" | no — `/backup` is local only; no privacy page; no server delete | Launch blocker for EU/public deployment; trust | M | new `src/app/settings/page.tsx`, `supabase/functions/delete-account`, new `src/app/privacy/page.tsx` |
| 34 | Concept review state sync | Cross-device review schedules | no — `src/lib/concepts.ts:141-149` writes `localStorage` directly, bypassing `createStore` | Review schedules silently diverge across devices for signed-in users | S | `src/lib/concepts.ts`, `src/lib/sync/localAdapter.ts` |

### 2.1 The three gaps that matter most

1. **Memory.** 5,550 solved problems have no revisit schedule. The algorithm, the storage seam, and the timestamp (`solvedAt`) already exist; only the wiring is missing. Fixing this is the highest learning-outcome return in the repo.
2. **Momentum.** Streaks reset, reminders do not exist, and "what should I do now" is answered by a hub page. The pre-chosen-next-action + streak-shield + reminder trio is what consumer learning apps have proven, and all three are small.
3. **Rehearsal.** Interview prep is silent and solo, while the 2026 format is spoken reasoning with AI in the loop. We have verified solutions for 5,550 problems — the raw material for "find the bug the model wrote" and "explain your approach" rounds that no ML-practice platform covers offline.

---

## 3. Top 12 NEW feature candidates for 2026

Each candidate: one-line pitch, why now (sourced), implementation sketch (files, data model, UI), acceptance criteria, effort, dependencies/risks. Effort uses the repo scale.

---

### F1. Review Queue — spaced repetition for code problems

**Pitch:** after a problem is solved, it re-enters practice on a forgetting-curve schedule; a daily "Due" list joins the daily challenge.

**Why now:** coding-specific SRS became a product category in 2026 — SM-2 scheduling with an interview-mode timer (LeetRepeat), a coding-tuned LCM 1.1 (SpacedSmart), FSRS-inspired scheduling with a readiness tier (AlgoReps; Aurora, 2026-03-17) — and none of them owns 5,550 verified from-scratch problems or an offline engine. Learning-science basis already argued in `docs/research/path-curation.md` (Dunlosky 2013; retrieval practice + distributed practice are the two highest-utility techniques).

**Implementation sketch:**
- New `src/lib/reviewQueue.ts`: port the SM-2 shape from `src/lib/concepts.ts:189-225` (ease 2.5 clamp 1.3–2.8, intervals 1 → 6 → ease×interval, lapses, `due` date key). Grade mapping from the existing run harness: pass on first submission = 5; pass after ≥1 failed run = 4; pass after reset = 3; all tests failed = 0.
- New syncable store `deepforge:reviews:v1` via `createStore` + `StoreSpec` (same pattern as `progress.ts`): `Record<problemId, { ease, interval, due, reps, lapses, lastGrade, lastReviewedAt }>`.
- Selection: `dueReviews(limit = 10)` filters `due <= today` sorted by ease asc → due asc → difficulty asc; interleave categories (no two consecutive from the same category) for interleaving practice (Rohrer & Taylor 2007, cited in `path-curation.md`).
- UI: "Due today" card on the new Today screen (§F2) and a "Review N due" chip on the Daily page; solving a due problem updates its schedule and fires the existing progress change event; optional badge `Review Keeper` (100 reviews) in `badges.ts`.
- Wire-up: `markSolved` (`src/lib/progress.ts:76-86`) call sites in `ProblemView.tsx` enqueue the item; do not change `ProblemProgress` schema.

**Acceptance criteria:** deterministic schedule for a fixed solve history; `due` never skips a day across DST/timezone changes (date-key math as in `concepts.ts:34-39`); review items open in the normal editor; schedule syncs for signed-in users; unit tests cover quality 0/3/4/5 ladders, lapse reset, and interleaving.

**Effort:** M.
**Dependencies/risks:** no hard dependencies. Risk: date-math bugs — reuse `getDailyDateKey` and the `addDays` pattern; risk of review fatigue — cap at 10/day and let users snooze one day per item.

---

### F2. Today — one screen, zero decisions

**Pitch:** the home CTA opens a single pre-composed session: daily challenge, due reviews, one weak-area pick, streak state, and today's quests.

**Why now:** every high-retention learning product opens on a pre-chosen next unit rather than a library — the most-copied mechanic of the Duolingo/Brilliant generation, stated directly in 2026 reviews ("the next lesson is already chosen… any app that opens on a library has failed this test", Cadence, 2026-08-07). Our home is a hub of 24 destinations (`src/lib/sections.ts`).

**Implementation sketch:**
- New `src/app/today/page.tsx` (server shell + client component) and `src/components/Today.tsx`.
- Composition, all read-only against existing stores: daily problem (`getDailyProblem` in `src/lib/daily.ts:60`), due reviews (F1), weakest-category pick (reuse `rankedCategories` from `src/lib/assistant.ts:469-476`, export it), quests (`getDailyQuests`, `badges.ts:1019`), streak + shield state (`daily.ts`), optional goal progress (§F5).
- Empty states: no history → "Start here" diagnostic CTA (§F12) + first path; all done → review-only session.
- Navigation: add `today` to `src/lib/sections.ts` and the Practice menu in `src/components/NavMenus.tsx`; Home hero CTA changes to "Open Today" (edit `src/components/Hero.tsx`); add `/today` to `src/app/sitemap.ts`.
- SSR: the server shell renders the layout; the client fills the queue after hydration (same pattern as `ProblemWorkspace.tsx`).

**Acceptance criteria:** from cold load to first problem ≤ 2 taps; works signed out and offline; every card deep-links to the existing editor; 375 px clean; keyboard and SR labels on each card; renders a sensible empty state for a brand-new user.

**Effort:** M (S if scoped to composition without F5 wiring).
**Dependencies/risks:** F1 for the review card; otherwise none. Risk: nav/sitemap edits collide with other lanes — ownership is fixed in §4.

---

### F3. Streak Shield & Repair

**Pitch:** earn a shield every 7-day streak (max 2); one missed day is auto-covered, and a second recent miss can be repaired with one solve within 48 h.

**Why now:** Duolingo's streak freeze and Brilliant's Streak Charges (max two, auto-applied, earned by completing lessons) are the standard retention save; the failure mode to avoid is streak anxiety ("protecting the number can replace the learning goal", Cadence, 2026-08-07). Our streak is currently all-or-nothing (`src/lib/daily.ts:110-126`).

**Implementation sketch:**
- Extend `DailyState` with `shields: number` and `shieldUsedDates: string[]`; bump parse/validate in `daily.ts:68-91` so old payloads still load.
- `markDailySolved` awards a shield when `streak % 7 === 0` and `shields < 2`; a new `applyShield(now)` runs on read (or on visit) when the last solve is exactly one day before yesterday and a shield exists → advances `lastSolvedDate` semantics without incrementing the streak (Brilliant's "keep, don't extend" rule).
- Repair: if the miss window is 2–3 days and `solvedDates` has no entry, surface a "Repair streak" card that consumes a shield and one solved problem today.
- UI: `src/components/StreakCard.tsx` shows shield pips; badges for "first shield earned" and "streak repaired"; helper copy on `/daily`.
- Pure-logic tests in `tests/daily.test.ts`: earn cap, use, repair window, gap > window resets.

**Acceptance criteria:** a 1-day miss with a shield preserves the streak without extending it; with no shield it resets exactly as today; shield state is date-key correct across timezones; all existing daily tests stay green.

**Effort:** S.
**Dependencies/risks:** overlaps with F4's reminder copy (both touch `daily.ts` — same lane, see §4). Risk: users gaming the shield — cap at 2 and only award at 7-day multiples.

---

### F4. State-aware reminders (web push + in-app)

**Pitch:** opt-in reminders that fire in the learner's own window — streak at risk, N reviews due, weekly digest — with cadence caps and a cooldown after ignores.

**Why now:** the 2026 Duolingo teardown documents the operating model (state-based messaging, streak-risk detection, one primary + one backup, weekly send budgets); Pushwoosh's e-learning playbook claims 3× course completion from streak campaigns; notification-first learning apps (MemoryPush, Ripasso) ship spaced repetition as push itself.

**Implementation sketch:**
- New `src/lib/reminders.ts`: `ReminderPrefs { enabled, windowStart, windowEnd, streakReminder, reviewReminder, weeklyDigest, lastSentAt, ignoredCount }` in `deepforge:reminders:v1` (syncable store).
- Phase 1 (no server): local scheduling on app open + `setTimeout` while open; use the Notification API when permission exists, otherwise an in-app banner; register `showNotification` in `public/sw.js` so a warm service worker can display it.
- State detection from existing stores: "active" if solved today; "wobbling" if no solve and local time past the user's usual hour (derive from the last 14 days of `solvedAt`); "at-risk" after 2 miss days; "dormant" after 7.
- Caps: max one streak reminder/day and one review reminder/day; digest weekly; reduce cadence after 3 consecutive ignores (Persist quota in prefs).
- UI: `src/components/PwaManager.tsx` gets an "Enable reminders" sheet (permission flow, window pickers, toggles); digest surfaces on Today.
- Phase 2 (optional, server): `push_subscriptions` table + Supabase Edge Function cron — deferred; the local phase proves value first.

**Acceptance criteria:** no notification is ever shown before opt-in; exactly one reminder fires per day under the cap; reminder content reflects state (streak vs review vs digest); users can snooze 24 h; logic unit-tested with a fake clock; no notification outside the user's window.

**Effort:** M (phase 1); L with server push.
**Dependencies/risks:** PWA install improves Web Push support (iOS requires an installed PWA); same-lane as F3 because both extend daily state; risk of notification fatigue — caps are acceptance criteria, not polish.

---

### F5. Interview Readiness & Target-Date Projection

**Pitch:** a transparent readiness score (coverage, retention, category balance, consistency) plus a projected finish date for a stated target role and date.

**Why now:** readiness scoring is the selling mechanic of 2026 prep tools (CodingInterviewHQ readiness assessment; Aurora's S–D tier with a capacity-adjusted coverage projection; SkillFlow's skill score); interview guides now recommend a 50/30/20 DSA/system-design/behavioral mix with AI-allowed-round practice (Aceloop, 2026-05-03). Our `getEstimatedMastery()` is coverage/depth/recency only (`src/lib/stats.ts:379-419`).

**Implementation sketch:**
- New `src/lib/readiness.ts`: extend the mastery inputs with (a) retention = share of attempted problems whose F1 review retrievability ≥ 0.7 (reuse the interval/21 style proxy from `concepts.ts:163-166`), (b) category balance = lowest category coverage (prevents "All Easy" readiness), (c) consistency = share of scheduled reviews completed in the last 14 days. Weights documented in the UI (no black box).
- Goals store `deepforge:goals:v1` (syncable): `{ targetDate?, weeklyHours?, track?: "ml-engineer" | "data-scientist" | "research" }`; projection uses observed 14-day solve rate capacity-adjusted by pending review load (Aurora's simulation shape, simplified).
- UI: readiness ring + four sub-scores + "on pace / X solves behind" on `src/components/StatsDashboard.tsx`; target-date picker on `src/app/interview/page.tsx`; a compact readiness chip on Today.
- Tests: fixed snapshots for empty history, all-solved, and a realistic mixed history; projection monotonic in pace.

**Acceptance criteria:** score is deterministic from stores + clock; sub-scores always visible with their formula in a tooltip/details; changing `targetDate` updates the projection without touching progress; `bunx tsc --noEmit` + tests green.

**Effort:** M.
**Dependencies/risks:** F1 for retention; F3 not needed. Risk: overclaiming — label it an estimate and show inputs; never gate content on it.

---

### F6. Adaptive Checkpoints

**Pitch:** the stage checkpoint reacts to performance — pass clean → a harder boss set next; fail → the next attempt injects prerequisite review items instead of the same three problems.

**Why now:** mastery gating with adaptation is the differentiator of Math Academy (worked example → up to 5 problems → two correct to advance) and Graspful (BKT mastery + decay-triggered review); static checkpoints pass students who guessed and punish students who need one more rep.

**Implementation sketch:**
- Extend `src/lib/pathCheckpoints.ts` (pure module, already the single source of truth): `deriveStageCheckpoint(stage, problems, { priorOutcome, reviewDue })` where `priorOutcome = "passed-clean" | "passed" | "failed" | null`.
  - `passed-clean` (3/3 bosses solved first try): bias boss selection to Hard and expand the boss set by one.
  - `failed`: fill up to 2 boss slots with due review ids from earlier stages in the same path (F1), falling back to the stage's first Medium.
- `evaluateStageCheckpoint` returns `nextAction: "advance" | "review" | "retry"` and the UI (`PathDetail.tsx`) renders it with the existing boss list.
- No schema change, no path-file edits — a derived-data feature exactly like the current implementation (`pathCheckpoints.ts:1-16`).
- Feed outcomes into the mastery store (§F5) so path completion also nudges readiness.

**Acceptance criteria:** same inputs → same checkpoint; a simulated clean pass produces a strictly harder boss set; a simulated fail produces ≥1 review id from an earlier stage; all 33 paths still resolve; `tests/path-checkpoints.test.ts` extended.

**Effort:** M.
**Dependencies/risks:** F1 for review ids (fallback keeps it independent); `PathDetail.tsx` is shared with no other lane in §4. Risk: harder-to-verify derived behavior — cover with table-driven tests in the existing test file.

---

### F7. Self-Explanation Gate (Feynman Mode)

**Pitch:** after tests pass, optionally force one paragraph of "explain why this works" before the solution/hints unlock; store it for review.

**Why now:** 2026 research shows self-explanation with immediate feedback makes learners persist and revise rather than abandon, with explanations growing more complete across attempts (arXiv 2608.25180, 2026-08-25); non-answer-giving tutor designs are being audited for leakage and value (ExplainRoute, arXiv 2609.03470, 2026-09-03); the PNAS 2025 finding — answer-first AI users scored 17% worse on later unsupported tasks — is the anti-dependency argument for gating solutions.

**Implementation sketch:**
- New `src/lib/explain.ts`: deterministic rubric over the user's text — expected concept terms from `title + description` (reuse the tokenizer and stopword list in `assistant.ts:227-242`), coverage of return statement / loop / edge-case mentions for algorithmic problems, and a length band. Output: `{ score, hits, gaps: string[] }` phrased as questions, never as a grade.
- New store `deepforge:explanations:v1` (syncable): `Record<problemId, { text, at, score }[]>`; the latest explanation shows on reopen ("what you said last time").
- UI in `src/components/ProblemView.tsx`: a "Explain it" button on the results panel; opening `Solution` or a tier-3 hint while a checkpoint attempt is active requires an explanation first (attempt-scoped suppression, matching `path-curation.md` recommendation 9); a "Feynman" toggle in the editor header.
- Assistant integration: `explainProblem` (`src/lib/assistant.ts:555-569`) gains a "compare with what you wrote" intent.
- Always skippable with one click — the gate is friction, not a wall.

**Acceptance criteria:** keyword rubric is deterministic and never states "wrong"; explanation persisted and re-shown; gate applies only in the explicit mode; a11y-labelled textarea; tests for term extraction, empty text, and repeat submissions.

**Effort:** M.
**Dependencies/risks:** `ProblemView.tsx` is a large client surface — one lane owns it in §4. Risk: crude rubric — keep feedback question-shaped and let users dismiss; do not tie badges to score.

---

### F8. Spot-the-Bug — debug the code the model wrote

**Pitch:** a practice mode where the "model" submits a plausible buggy solution and the learner finds and fixes the bug, then labels its class.

**Why now:** CodeSignal launched agentic coding assessments 2026-04-02 (91% of surveyed engineers use agentic tools; 75% shipped AI-generated production code; 56% would hesitate to hire without AI-tooling skill); interview analyses report companies asking candidates to debug AI output and defend trade-offs (InterviewQuery, 2026-04-13, citing Karat: 71% of leaders say AI makes technical skills harder to assess); a July 2026 essay on a from-scratch ML practice platform argues that as agents write boilerplate, the differentiator is catching their bugs.

**Implementation sketch:**
- New `src/lib/spotBug.ts`: deterministic mutation engine over each problem's verified `solution` — bug families with a detector each: off-by-one on a loop bound (`len(x) + 1`), missing max-subtraction before `exp`, un-normalized sum where the prompt says average/probability, wrong aggregation axis, and a hardcoded edge case. A mutant is eligible only if the original tests fail on it (verify at selection time using the existing test harness in `pyodide.ts`).
- Mode in `src/components/ProblemView.tsx`: banner "This solution was generated by an assistant. Tests fail — find the bug."; the mutated code preloads in the editor; results panel adds a bug-class quiz (5 options) and shows the diff to the real solution only after the tests pass.
- Session scoring: correctness + whether the learner's final diff touches the mutated region (line-diff locality) + bug-class accuracy; results feed the review grade (§F1) and a `Bug Slayer` badge.
- No new data model; selection uses `PROBLEM_META` with a per-category rotation.

**Acceptance criteria:** for a scripted sample of 50 problems across at least 5 categories, ≥1 eligible mutant exists and fails ≥1 original test; the mutated region is never revealed before pass; mode works fully offline; tests cover each bug family and mutant eligibility.

**Effort:** M.
**Dependencies/risks:** content risk if solutions are too short for some mutations — the eligibility check keeps the mode honest; `ProblemView.tsx` shared with F7 (same lane).

---

### F9. Agentic Round — practice with a copilot in the loop

**Pitch:** a mock round where an in-page simulated assistant drafts part of the solution, the learner directs/verifies/fixes it, then writes a short rationale that is scored.

**Why now:** the same CodeSignal/Rubduck/Karat shift as F8, plus the 2026 guidance that AI-allowed rounds should be practiced explicitly because they are a different muscle than solo coding (Aceloop, 2026-05-03). No ML-from-scratch practice platform offers this round.

**Implementation sketch:**
- New `src/lib/agentRound.ts` and `src/components/AgenticRound.tsx`; extends F8's mutation library so the "copilot" is deterministic and offline.
- Session flow: problem brief → "copilot" emits a first draft (correct skeleton + a planted divergence from the spec) → learner edits/asks for changes via canned operations ("make it numerically stable", "handle empty input", "fix the shape") that each apply a deterministic transformation → final tests graded → rationale step ("why did you change X?") scored against the planted-divergence list.
- Scoring: 50% correctness, 30% divergence detection (did the learner change the planted region), 20% rationale coverage.
- Start with a curated in-repo roster (top 100 problems by category coverage) and mark eligibility in `PROBLEM_META` or a new `src/data/agentRounds.ts` manifest; no LLM, no network, no API keys.
- Surfaces: `/interview` gets an "Agentic round" tab; deep-link `/problems/[id]?mode=agentic`.

**Acceptance criteria:** 3 scripts (one per planted-divergence family) run end-to-end offline; scoring is deterministic; the rationale step never blocks the finish; mobile 375 px layout; tests for transformations and scoring.

**Effort:** L.
**Dependencies/risks:** depends on F8's mutation primitives; content authoring is the real cost — roster can start small and grow per wave. Risk: deterministic "copilot" may feel canned — frame it as a rehearsal of judgment, not a chat.

---

### F10. Study Groups & Buddy Nudges

**Pitch:** Supabase-backed groups (code join, shared streak, weekly report) with one-tap nudges — no chat threads required.

**Why now:** group accountability is the 2026 study-app growth loop: shared-streak groups where "the group streak only survives if everyone shows up" (Cramvy), virtual rooms with forfeits (roomn), class battles (Grindly), partner timers (StudyDuo); the single-tap buddy nudge is the lowest-friction social mechanic in that set.

**Implementation sketch:**
- Supabase migrations: `study_groups(id, name, join_code, owner_id, created_at)`, `group_members(group_id, user_id, joined_at, last_checkin_date)`, `group_nudges(id, group_id, from_user, to_user, created_at, seen)` with RLS: members read their groups; only self-insert nudges; join by code through an RPC.
- New `src/lib/sync/groups.ts`: local-first via `createStore` (membership + last-known streak cached), remote writes when signed in, `subscribeRealtime({ kind: "group", groupId })` extension following `sync/social.ts:1165`.
- Group streak: derived — a group day counts when every member has any solve (`progress.solvedAt`) or a checked-in daily solve; weekly report card (each member's solve count + group streak) rendered from merged local/remote data.
- UI: new `src/app/groups/page.tsx` + `src/components/Groups.tsx`; join via link `?join=CODE`; nudge button sends one row; realtime marks "nudged" state. Nav entry added in this lane's wave-2 turn (after §4 lane 1 finishes nav edits).
- Degrades to local-only for signed-out users (groups visible but not joinable).

**Acceptance criteria:** two-account manual matrix passes (A cannot read non-member groups; nudge insert RLS enforced); offline shows the cached group and queues no phantom writes; group streak deterministic from check-in dates; no chat surface required for nudges.

**Effort:** L.
**Dependencies/risks:** needs Supabase auth configured (human items U-1..U-3 in `docs/next-wave-plan.md`) and the hardening migration already present. Risk: social features without a user base — ship nudges + group streak only after F1–F4 land so daily engagement exists.

---

### F11. Verifiable Certificates + `/verify`

**Pitch:** certificates carry a signed, machine-checkable evidence payload (recipient, kind, ref, scores, issue date) and a public `/verify/[code]` page that re-checks it.

**Why now:** 2026 moved skill proof toward cryptographic verification — Veril.ai's Ed25519 evidence chain (assessment/integrity/practice/difficulty, public key), SkillSeal's verifiable badges with audit trails, Workera's rubric-anchored evidence; Skillumina's market note cites eIDAS 2.0 wallet mandates (Dec 2026) and the EU AI Act's high-risk hiring classification (Aug 2026) as the compliance backdrop. Our certificates display an FNV code with nothing to verify against (`src/lib/certificates.ts:288-301`).

**Implementation sketch:**
- Phase 1 (offline, no server): new `src/lib/credentials.ts` builds a canonical JSON payload from existing stores — `{ v: 1, kind, ref, title, recipient, evidence: { solves, solvedIdsSampleHash, checkpointPasses, labScores, issuedAt } }` — hash it (SHA-256 via WebCrypto) into a stable code, and print a QR-friendly URL on the certificate. Clearly labelled **self-attested** until phase 2. `/verify/[code]` accepts a pasted payload (base64url in the URL) and recomputes the hash; tamper with any field → mismatch. This already beats "PDF-only".
- Phase 2 (server-signed, follow-up wave): Supabase Edge Function `issue-credential` holds a signing key in function secrets, stores `credentials(id, user_id, payload, signature, created_at)` with public read for verification; `/verify/[code]` fetches by id and verifies with the published public key at `/.well-known/credentials.json`.
- Evidence must be inspectable: the verify page lists what was proven (path complete, checkpoint passes, lab score) — matching the "evidence, not inference" posture of 2026 assessment platforms.
- UI: `src/components/Certificates.tsx` adds "Copy verify link"; `src/app/certificates/page.tsx` explains the difference between self-attested and signed.

**Acceptance criteria:** tampering with any payload field fails verification; verification works offline for phase 1 payloads; QR/link round-trips; no PII beyond the chosen username; tests cover canonicalization order and tamper cases.

**Effort:** M (phase 1); M/L more for server signing.
**Dependencies/risks:** phase 2 needs Supabase secrets + a public key route; privacy — evidence includes only progress data the user already sees; do not include email.

---

### F12. Onboarding Diagnostic & Starting Plan

**Pitch:** a 2–3 minute adaptive placement across categories that sets a level, recommends up to two paths, and seeds the first Today session.

**Why now:** Brilliant places users with real problems during onboarding (competency onboarding); Graspful's adaptive diagnostic maps 80+ concepts in 20–60 questions using Bayesian inference and stops at diminishing returns; the library-vs-sequence argument (Cadence, 2026-08-07) is the drop-off argument. With 33 paths and 5,550 problems, "start anywhere" is a failure mode.

**Implementation sketch:**
- New `src/lib/onboarding.ts`: a deterministic staircase — start with one Easy per selected interest area (user picks 1–3 areas, or auto = all 15), escalate per correct answer, stop after 12 questions or when confidence bands separate; selection from `PROBLEM_META` only (light index).
- Placement record `deepforge:placement:v1` (syncable): `{ at, level, perCategory: Record<Category, 0|1|2>, recommendedPathIds, dailyTarget }`; the recommendation score reuses the category-weakness ranking and path level metadata from `src/data/problems/paths.ts`.
- New `src/app/start/page.tsx` + `src/components/Onboarding.tsx`; home banner for users without a placement ("Find your level — 3 minutes"); skip always available.
- Seeds Today (§F2) with `dailyTarget` problems and the weakest recommended path's first stage.
- Tests: staircase determinism, stop conditions, path recommendations respect declared levels/prerequisites (`src/lib/paths.ts`).

**Acceptance criteria:** completes in ≤ 12 questions; deterministic for a fixed answer sequence; resume after refresh; signed-out works; recommendations never include a path whose prerequisites are unmet by the placement level; a11y keyboard-complete.

**Effort:** M.
**Dependencies/risks:** F2 for the seeded session (can ship the placement first and deep-link to the recommended path). Risk: placement anxiety — copy frames it as calibration, not a test; never show a "failed" state.

---

## 4. Big bets vs quick wins, and the first parallel wave

### 4.1 Quick wins (ship first; low risk, mostly compositional)

| Candidate | Effort | Why it's safe | Ships value |
|---|---|---|---|
| F3 Streak Shield | S | Pure extension of `daily.ts` with existing test file | Stops streak churn immediately |
| F2 Today | M | Read-only composition of existing stores | Answers "what now" for every session |
| F1 Review Queue | M | Algorithm ported from shipped `concepts.ts` | The core learning-outcome feature |
| F6 Adaptive Checkpoints | M | Pure module, no schema change | Makes existing checkpoints real |
| F5 Readiness | M | Derived, no behavior changes | Gives the goal layer (F12, F10) something to target |

### 4.2 Big bets (one or two waves; strategic differentiation)

| Candidate | Effort | Bet |
|---|---|---|
| F8 Spot-the-Bug | M | Nobody in ML-from-scratch practice owns "debug the AI" — deterministically, offline |
| F9 Agentic Round | L | The 2026 interview format end-to-end (judgment, verification, rationale) |
| F10 Study Groups | L | Turns a solo tool into a habit system; needs traffic to matter |
| F11 Verifiable Certificates | M then M/L | Proof-of-work credentials ahead of the eIDAS/VC curve |
| F4 Reminders (server push) | L | The return mechanic; local phase first |
| F12 Onboarding | M | Converts first visits into paths; best after F2 exists |

**Recommendation:** run quick wins F1–F6 plus F7/F8 in the first wave (below); hold F10 (groups) until Supabase auth is configured by a human and daily engagement exists; hold F9's roster expansion until F8's mutation library is merged; F11 phase 1 can start immediately because it needs no server.

### 4.3 First parallel wave — 6 lanes, disjoint file ownership

All lanes run concurrently. Shared files are assigned to exactly one lane; anything else is a follow-up by that owner.

| Lane | Scope | Exclusive file ownership (create or edit) |
|---|---|---|
| **1 — Retention core** | F1 Review Queue + F2 Today | new `src/lib/reviewQueue.ts`; new `src/app/today/page.tsx`; new `src/components/Today.tsx`; `src/components/DailyChallenge.tsx`; `src/components/Hero.tsx` (Today CTA); `src/lib/sections.ts`; `src/components/NavMenus.tsx`; `tests/review-queue.test.ts` |
| **2 — Habit mechanics** | F3 Streak Shield + F4 Reminders (local phase) | `src/lib/daily.ts`; `src/components/StreakCard.tsx`; new `src/lib/reminders.ts`; new `src/components/ReminderSettings.tsx`; `src/components/PwaManager.tsx`; `public/sw.js`; `tests/daily.test.ts`; `tests/reminders.test.ts` |
| **3 — Outcome measurement** | F5 Readiness + F6 Adaptive Checkpoints | new `src/lib/readiness.ts`; `src/lib/stats.ts`; `src/components/StatsDashboard.tsx`; `src/lib/pathCheckpoints.ts`; `src/app/paths/[slug]/PathDetail.tsx`; `src/components/InterviewPrep.tsx`; `tests/readiness.test.ts`; `tests/path-checkpoints.test.ts` |
| **4 — Pedagogy** | F7 Self-Explanation + F8 Spot-the-Bug | new `src/lib/explain.ts`; new `src/lib/spotBug.ts`; `src/components/ProblemView.tsx`; new `src/lib/explanations` store file; `tests/explain.test.ts`; `tests/spot-bug.test.ts` |
| **5 — Proof** | F11 Verifiable Certificates (phase 1) | `src/lib/certificates.ts`; `src/components/Certificates.tsx`; `src/app/certificates/page.tsx`; new `src/lib/credentials.ts`; new `src/app/verify/[code]/page.tsx`; `tests/certificates.test.ts` |
| **6 — Onboarding + integration** | F12 Onboarding + sitemap/freshness integration | new `src/components/Onboarding.tsx`; new `src/app/start/page.tsx`; `src/app/page.tsx`; `src/app/sitemap.ts` (adds `/today`, `/start`, `/verify`, derives `lastModified` per route where possible); new `src/lib/changelog.ts` (optional) |

**Explicitly shared/serialized (do not edit outside the owner):**
- `src/app/page.tsx` — Lane 6 only; Lane 1 uses `Hero.tsx` for the Today CTA.
- `src/app/sitemap.ts` — Lane 6 only; Lane 6 adds Lane 1's `/today` and Lane 5's `/verify` after those routes exist (run last within the lane).
- `src/lib/sections.ts` + `src/components/NavMenus.tsx` — Lane 1 only; groups later gets its nav entry in wave 2 from this owner.
- `src/lib/badges.ts` — untouched this wave (review badges become a small follow-up owned by Lane 1).
- `AGENT_CONTEXT.md` / `README.md` — orchestrator updates counts after merge; no lane edits them.

**Verification per lane (repo-standard):** `bunx tsc --noEmit`, `bun run lint`, `bun test`, `bun run scripts/verify-problems.ts` (unchanged, must stay `ALL GREEN`), and 375 px checks for new UI. Lane 3 additionally runs `scripts/verify-paths-content.ts`; Lane 5 adds a tamper test to its own suite.

**Sequencing inside lanes:** Lane 1 builds `reviewQueue.ts` before `Today.tsx`; Lane 4 builds `spotBug.ts` before the ProblemView mode; Lane 6 edits the sitemap only after Lanes 1 and 5 announce their routes.

**Wave-2 shortlist (after this wave):** F10 Study Groups + the row-17 buddy nudges (after Supabase auth, human items), F9 Agentic Round roster, server-signed F11 phase 2, BYO-key structured code review, spoken mock interviews, Pyodide Web Worker, server-side export/delete/privacy (§2 row 33), concept-store sync (row 34).

---

## 5. Sources

All URLs accessed 2026-09-14 unless the article's own date is shown.

**Interview prep and readiness**
- interviewing.io — AI Interviewer + ML interview tracks: https://interviewing.io/
- Exponent Practice — peer mocks + AI rubric feedback (Data Science and ML beta): https://www.tryexponent.com/practice
- OphyAI — scored mock interviews, four rubric dimensions, transcript + PDF: https://ophyai.com/ai-mock-interview (dated 2026-05-10)
- DevInterview.AI — ~100k interview analysis, scored evaluation vs previous sessions: https://devinterview.ai/
- Rubduck — AI-assisted coding rounds for GenAI/AI roles: https://rubduck.ai/
- MockInterviewAI — cites Langer & König 2016 on virtual interviewer practice: https://mockinterviewai.app/en
- Aceloop — 16-week prep plan; 50/30/20 mix; AI-allowed rounds standard: https://aceloop.ai/blog/how-to-prepare-for-faang-interview (2026-05-03)
- lastroundai — NeetCode Pro vs LeetCode Premium 2026 (AI hints/debug vs Ask Leet): https://lastroundai.com/blog/neetcode-pro-vs-leetcode-premium (2026-08-26)
- SkillFlow — LeetCode vs NeetCode 2026; "neither adapts to your weaknesses": https://skillflow.dev/blog/leetcode-vs-neetcode-2026 (2026-04-28)
- CodingInterviewHQ — readiness assessment + adaptive practice + reminders: https://codinginterviewhq.com/

**Coding practice and spaced repetition**
- LeetRepeat — SM-2 spaced repetition + CoderPad-style 40-minute interview mode: https://leetrepeat.com/
- SpacedSmart — LCM 1.1 scheduler tuned for coding interviews: https://www.spacedsmart.com/
- AlgoReps — FSRS-inspired scheduling, local progress: https://algoreps.io/
- Aurora — open-source FSRS review system + readiness tiers + coverage projection: https://github.com/CadenceElaina/neetcode-spaced-repetition-system (2026-03-17)
- DevRhythm — 1/3/7/14/30-day revision scheduling + study groups: https://github.com/prashantnil680-glitch/DevRhythm
- CodeFluent — spaced-repetition syntax training with AI grading: https://codefluent.app/

**Learning-loop mechanics**
- Brilliant — Koji in-lesson tutor; Streak Charges (max 2, auto-applied): https://brilliant.org/help/features/ and https://blog.brilliant.org/a-world-class-tutor-in-every-home/ (2026-05-29)
- Brilliant review (interactive-only, streak mechanics): https://topreviewed.ai/products/brilliant (2026-06-20)
- Cadence — why Duolingo-style apps work; pre-chosen next lesson; streak failure mode: https://learningcadence.app/blog/apps-like-duolingo/ (2026-08-07)
- PushPilot — Duolingo push teardown: state-based messaging, streak-risk detection, send budgets: https://pushpilot.ai/blog/duolingo-push-notification-strategy-teardown (2026-05-09)
- Pushwoosh for e-learning — 3× completion with streak campaigns; 40% first-week churn reduction with onboarding flows: https://www.pushwoosh.com/products/pushwoosh-for-e-learning/
- MemoryPush — flashcards delivered as spaced-repetition push notifications: https://memorypush.app/
- Ripasso — notification-first learning: https://ripasso.app/
- Math Academy — mastery-gated worked examples (referenced via `docs/research/path-curation.md`): https://mathacademy.com/pedagogy

**Social / accountability**
- Cramvy — study streaks, Streak Buddy, groups of 15, group streak: https://cramvy.com/
- roomn — study rooms with forfeits: https://roomn.app/
- Grindly — study groups, battles, class analytics: https://www.grindlylearn.com/ (2026-03-15)
- StudyCrew — groups, streaks, leagues: https://studycrew.live/
- StudyDuo — partner timers, streak freezes: https://studyduo.app/
- Lilo — challenges and rankings: https://lilostudytimer.com/

**AI-native learning and feedback**
- NotebookLM / Gemini Notebook upgrade (Gemini 3.5 + cloud computer), Google blog: https://blog.google/innovation-and-ai/products/notebooklm/better-research-notebooklm/ (2026-06-08); rename: https://blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/ (2026-07-16); student features (Learning Guide, flashcards, quizzes): https://blog.google/innovation-and-ai/models-and-research/google-labs/notebooklm-student-features/ (2025-09-08)
- NotebookLM April 2026 update — flashcard progress, mastery tracking: https://pasqualepillitteri.it/en/news/1391/notebooklm-april-2026-update-auto-label-flashcards (2026-04-25)
- "A lightweight intelligent feedback system for student code submissions using LLMs" — adaptive feedback depth, logic/style/performance: https://link.springer.com/article/10.1007/s44217-026-01400-5 (2026-03-23)
- NAILA — autonomous LLM feedback for 900+ students: https://arxiv.gg/abs/2604.20803 (2026-04-22)
- ESSE — self-explanation tutor with LLM feedback: https://arxiv.org/abs/2608.25180 (2026-08-25)
- ExplainRoute — pre-deployment audit for non-answer-giving programming tutors: https://arxiv.org/abs/2609.03470 (2026-09-03)
- CodeTutor — Socratic 4-level hint escalation: https://github.com/sgkul2000/CodeTutor (2026-03-10)
- llm-tutor — anti-dependency tutor; cites the 2025 PNAS ChatGPT-answers −17% finding: https://github.com/Flagrare/llm-tutor (2026-06-02)
- AI-assisted code review as SRL scaffold — action-rate telemetry (32–33%): https://arxiv.org/html/2604.23251 (2026-04-25)

**Agentic / AI-era assessment**
- CodeSignal agentic coding assessments launch — 91% use agentic tools, 75% shipped AI-generated production code, 56% hesitant to hire without: https://www.prnewswire.com/news-releases/codesignal-launches-industry-first-agentic-coding-assessments-for-ai-era-engineering-hiring-302732265.html (2026-04-02)
- CodeSignal Cosmo AI copilot for interviews: https://support.codesignal.com/hc/en-us/articles/38064497347863-AI-Co-Pilot-for-Interview
- InterviewQuery — Karat 2025–2026 report: 71% of leaders say AI makes skills harder to assess; 62% still prohibit AI in interviews: https://www.interviewquery.com/p/codesignal-ai-assisted-technical-interviews (2026-04-13)
- KrispiTech — why implementing ML from scratch still matters in 2026: https://krispitech.com/why-implementing-ml-from-scratch-still-matters-in-2026/ (2026-07-08)
- Pyre Code — browser ML practice with test feedback and optional AI hints: https://github.com/whwangovo/pyre-code (2026-04-09)
- TorchCode — ML interview practice with auto-grading: http://github.com/duoan/TorchCode

**Adaptive learning**
- Graspful — adaptive diagnostics with BKT, stop conditions, mastery gating: https://graspful.ai/docs/concepts/adaptive-diagnostics and https://graspful.ai/docs/concepts/mastery-learning
- TutorTrace — BKT mastery, misconception fingerprints, decay: https://github.com/Shalini-Majumdar/TutorTrace
- Kitto Learn — adaptive difficulty and gap detection: https://www.kittolearn.com/

**Credentials**
- Veril.ai — Ed25519 evidence chain, public verification: https://www.veril.ai/
- SkillSeal — proctored adaptive assessments, audit trail: https://www.skillseal.tech/
- Workera — rubric-anchored assessment agent, evidence over inference: https://www.workera.ai/platform/ai-agent/skills-assessments
- Skillumina — W3C VC 2.0 / eIDAS 2.0 timeline, EU AI Act hiring classification: https://skillumina.com/
- Skallery — evidence-chain profile: https://skallery.com/

**Performance / platform / data**
- Pyodide roadmap — 3–5× slower than native Python; main-thread blocking; Web Worker need: https://pyodide.org/en/0.26.3/project/roadmap.html
- Pyodide in the browser with Web Workers — architecture guide: https://publishing-project.rivendellweb.net/running-python-data-science-libraries-in-the-browser-with-pyodide/ (2026-05-13)
- WebGPU + Pyodide in a Web Worker for an RL platform: https://www.digitado.com.br/follow-up-the-architecture-behind-my-browser-based-rl-platform-webgpu-pyodide/ (2026-07-04)
- Moodle data privacy export/deletion tooling: https://www.clamp-it.org/blog/2026/01/27/using-the-moodle-data-privacy-feature-for-data-export/ (2026-01-27)
- DAPO-X — GDPR right to portability for learning records: https://www.inokufu.com/en/dapo-x/ (2026-01-08)

---

## 6. Integrity issues (report-only — no fixes made)

1. **`docs/next-wave-plan.md` is a stale snapshot that will misdirect the next agent.** It says 5,050 problems, 28 paths, 239 tests, forum realtime missing, per-problem comment UI missing, manifest "2,400+"/layout "3,400+", and a wrong `SETUP-SUPABASE.md` migrations path (lines 13–27, 107). Current reality per `README.md` and the wave-27 commit: 5,550 problems, 33 paths, realtime + pagination + per-problem comments shipped, manifest at 5,550+, and the migrations path already correct. Its NW-01…NW-11 statuses are almost all obsolete.
2. **`docs/research/article-topics.md` pre-dates the last two content waves.** It describes 5 shipped articles and a 5,050-problem catalogue; the registry now ships 11 articles and the catalogue is 5,550. Its top-6 plan is still valid as a plan, but its "where the library is now" section is wrong.
3. **`docs/research/path-curation.md` recommendations 1, 3 (partial) and 5 have shipped without a follow-up note.** `src/lib/pathCheckpoints.ts` implements the checkpoint model; `resolvePrerequisites` now renders linked prerequisites in `PathDetail.tsx:346,441-468`. The doc's audit numbers (28 paths / 596 in-path problems) are stale, so its coverage section overstates gaps.
4. **`src/app/sitemap.ts` no longer hardcodes `lastModified`.** Shipped since this audit: blog posts use their publish dates, every other entry uses the build date, and `/today` is listed; `manifest.ts` derives its count from the generated problem index. Re-audit only if counts or route coverage drift again.
5. **`src/lib/pyodide.ts:48-52` loads Pyodide on the main thread.** No Web Worker exists anywhere in `src/` or `public/` (only service-worker registrations); long-running solutions/notebooks can freeze the UI, which is precisely the mobile failure mode Pyodide's roadmap warns about. (Not a bug today, a scaling limit.)
6. **Concept review state bypasses the sync seam.** `src/lib/concepts.ts:141-149` writes `deepforge:concepts:v1` directly to `localStorage`, while every other progress store uses `createStore` (`src/lib/sync/store.ts`). Signed-in users therefore sync pen-paper answers but not the review schedule derived from them — schedules silently diverge across devices.
7. **Review coverage is 20 concepts for 60 Pen & Paper problems, and invisible outside one page.** `getDueConcepts` is only called in `src/components/PenPaper.tsx:642-643`. The README's "SM-2 mastery review" claim (`README.md:57`) is true at concept level, but most pen-paper items never enter a review queue and nothing on Today/Stats/paths surfaces due reviews.
8. **`src/components/SectionShell.tsx` is dead code.** No file references it (verified by reference sweep); it is a back-compat wrapper left behind when section modals were retired.
9. **The "Run a lab" daily quest depends on where you are in the app.** `src/components/Badges.tsx:505-514` marks the quest from a `deepforge:lab-change` listener that only exists while the Badges view is mounted, and labs store no timestamps (`src/lib/labs.ts:19-25`). Running a lab with Badges unmounted never completes the quest; there is no derived fallback.
10. **Three copies of `categorySlug`.** `src/lib/sections.ts:307`, `src/app/sitemap.ts:19`, and `src/app/problems/[id]/page.tsx:21` each define their own; drift would silently break category URLs in one surface only.
11. **Count duplication in metadata.** `src/app/layout.tsx:24` derives the problem count, but `src/app/manifest.ts:9,35` hardcodes "5,550+". They agree today; they can drift on the next content wave (the previous drift is recorded in `docs/next-wave-plan.md:107`).
12. **README typo:** `README.md:27` — "timeds contests". Trivial, but it is user-facing copy.
13. **`AGENT_CONTEXT.md`'s file-structure section (lines ~119-191) omits or mislabels many current modules** (e.g., it lists `src/components/StudyAssistant.tsx` under hints and `src/lib/comments.ts` as the discuss store; the real surfaces are `ZeroAssistant.tsx`/`assistant.ts` and the `sync/` layer). Not harmful, but it is the first file agents are told to read.
