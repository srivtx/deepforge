# Feature Gaps 2026 — Retrospective

**Date:** 2026-09-14 · **Retrospective:** 2026-09-17 (NW-12)
**Author:** research agent (read-only; no code or data modified)
**Status:** fully shipped. All 12 features proposed in the original §3 landed in the waves after this audit (study groups in wave 30; the plan was refreshed after waves 32–33); the gap audit and per-candidate specs were removed in this truth pass. What remains is the wave-2 shortlist below.

*Cross-reference note:* `docs/next-wave-plan.md` §4 links here for the original §3–§4 candidate detail; those sections were removed in this truth pass, so that link now resolves to the retrospective and the "What remains" list only.

---

## What it argued

The catalogue was world-class and the habit layer was average. When this was written (2026-09-14) the totals were 5,550 problems, 33 paths, 24 badges, 11 articles — they are 5,730 / 33 / 29 / 14 today; what was missing was everything **after a solve**: no revisit schedule for solved code, no reminders, streaks that reset with no save, silent solo interview mocks, unverifiable certificates, no study groups, and no way to rehearse "debug the AI". The 2026 market context — coding-specific spaced repetition, agentic coding assessments (CodeSignal, 2026-04-02), cryptographic skill proof — made those gaps urgent. The three it ranked highest: **memory** (solved problems with no revisit schedule), **momentum** (streaks, reminders, a pre-chosen next action), **rehearsal** (finding the model's bugs, explaining an approach).

## What shipped

Totals today: 5,730 problems / 33 paths / 29 badges / 14 articles.

| F# | Feature | Landed in |
|---|---|---|
| F1 | Review Queue | `src/lib/reviewQueue.ts` + due/learning/new buckets on `/today` |
| F2 | Today | `src/app/today/page.tsx`, `src/components/today/Today.tsx`; "Do this next" in `src/lib/nextBestAction.ts` |
| F3 | Streak Shield & Repair | `src/lib/daily.ts` (`shields`, `shieldUsedDates`) |
| F4 | Reminders (local phase) | `src/lib/reminders.ts`, `src/components/ReminderSettings.tsx` |
| F5 | Readiness & target date | `src/lib/readiness.ts`, `src/components/StatsDashboard.tsx` |
| F6 | Adaptive Checkpoints | `src/lib/pathCheckpoints.ts` (due-review-aware boss sets + stage artifact) |
| F7 | Self-Explanation Gate | `src/lib/explain.ts` + `src/components/ProblemView.tsx` |
| F8 | Spot-the-Bug | `src/lib/spotBug.ts`, `src/lib/bugHunt.ts` + ProblemView mode (synced rounds) |
| F9 | Agentic Round | `src/lib/agenticRound.ts`, `src/components/interview/AgenticRound.tsx` |
| F10 | Study Groups & Buddy Nudges | `src/components/groups/StudyGroups.tsx`, `supabase/migrations/20260916000000_study_groups.sql` |
| F11 | Verifiable Certificates (phase 1) | `src/lib/credentials.ts` (SHA-256) + `/verify/<code>` |
| F12 | Onboarding Diagnostic | `src/lib/onboarding.ts`, `src/app/start/page.tsx` |

Same wave, also fixed: Pyodide runs in a Web Worker by default (`src/lib/pyodideWorker.ts`), global search ships (`src/lib/globalSearch.ts`, `CommandPalette.tsx`), a weekly digest ships (`src/lib/weeklyDigest.ts`), and concept review state syncs through `createStore` (`src/lib/concepts.ts`).

## What remains

- Certificate signing phase 2 (Edge Function + published public key).
- Server push reminders (`push_subscriptions` table + cron; the local phase shipped).
- Server-side export/delete + a privacy page.
- Spoken mock interviews (the deterministic agentic round shipped instead).
- BYO-key structured code review (Zero is still deterministic and offline).
- Mixed-kind path steps — see `docs/research/path-curation.md`, recommendation 3.

## Integrity findings

All 13 findings in the original §6 are resolved: `sitemap.ts` derives `lastModified`, `manifest.ts` derives its count, `SectionShell.tsx` is deleted, the "Run a lab" quest derives from lab timestamps, `categorySlug` has a single definition, and the README/`AGENT_CONTEXT.md` drift was refreshed. The two stale research docs it flagged (`article-topics.md`, `path-curation.md`) are corrected by this same NW-12 truth pass.

---

## Sources (as cited in the original 2026-09-14 audit)

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
