# Wave 42 blueprint — Behavioral Delta Ledger (final, implementable)

Status 2026-09-18. Supersedes `invention-wave-42.md` §1–§10 wherever they differ; that
document's **Errata & corrections (wave-42 review)** section and this blueprint are ground
truth. Chosen slices: **slice 1 (count-only no-op / behavior-change detector, standalone,
opt-in) plus slice 2 ("Your bugs" replay shelf, safely separable inside the same route)**.
Every number below is re-derived from scratch artifacts under
`/var/folders/lc/r25hfwjs4j963w2f40s9rc5h0000gn/T/opencode/w42-engineer/`
(`clean/census_clean.jsonl`, `clean/bdl_engine_clean.py`, `analysis/recompute.py`,
`analysis/recompute.out`) or from the two verifier scratch dirs; none is copied from the
retracted text. **No product code was written in this wave; this document is the plan.**

## 1. Decision: what ships, what is cut, and why

**Ships (this wave).**

1. **`/ledger` — the count-only Behavioral Delta Ledger.** A standalone, opt-in practice
   route (`/ledger` index + `/ledger/[id]` workspace). The learner edits a program for an
   attempted problem and runs it with the Ledger; the Ledger builds a deterministic
   24-probe hidden basis from the exercise's own tests, executes the reference and the
   submission under the fresh-copy protocol, and after each Run reports **counts only**:
   how many of the N hidden checks changed since the previous run, whether the stored
   signature is identical (a *no-op edit*), and whether the visible tests changed. It stores
   **one signature per problem**, never sources, never families, never a verdict. No
   grading/review/certificate/LGS/badge/streak/XP surface is read for writes or written.
2. **`/ledger/[id]` → "Your bugs" tab (slice 2).** Up to **3 opt-in saved versions per
   problem**, ≤ 4 KB each, ≤ 48 total, LRU-evicted; replaying one runs the visible tests
   plus the count of hidden checks the replay changes. Standalone only: never placed in
   `/review`, never routed by LGS, never in `ProblemView`.

**Cut, with reasons.**

| Cut | Why |
|---|---|
| In-problem delta card after ≥2 failed runs (slice 3) | Red-team blocker: hidden-oracle content in the solve flow; touches `ProblemView`; nothing in the shipped claim needs it. |
| Fix/break direction ("this edit fixed 5, broke 1") | In-sample 90.2/87.8% collapses to held-out 84.0/82.2% (AUC 0.829/0.797); not strong enough for directional copy; the claim is cut, so the number is not needed. |
| Residual cold sets, profiles, review routing | Formal object (last k=3) was never the measured object (walk-long); H6b dead under both (1.5%/0.5% concentration); critic cut. Corpus paper only. |
| Per-family labels on any learner surface | H2b wrong-theory family ordering; families are a corpus-engineering artifact. |
| Build-time mining / precomputed per-problem bases | Wave 41 already prescribed content-hash caching; runtime cost measured negligible (0.27 ms/signature Pyodide median). |
| Any hidden-oracle verdict, closeness κ, "am I done?" meter | Blocker; also untestable offline against learner intent. |
| Sync, backup-included persistence, LGS/grading/certificates/badges/readiness/streaks/XP coupling | Blocker + red lines; enforced by source-scan tests. |
| Learner-level blind-spot copy ("you never diverge on empty inputs") | Outruns the in-model aggregate (E7). |
| Storing reference signatures or probe answers | Store only the learner's last signature; reference is recomputed per run in Pyodide (privacy + small). |

**Safety argument, mechanically.** The route imports no grading/progress-write module; it
writes only `deepforge:bdl:v1` / `deepforge:bdl-shelf:v1` through `readRaw`/`writeRaw`; no
`StoreId`/`ALL_STORE_IDS`/`BACKUP_INCLUDED_KEYS` entry exists for it; a source-scan test
asserts all of this and that `ProblemView`, `lgs.ts`, `reviewQueue.ts`, `certificates.ts`,
`bugHunt.ts`, `spotBug.ts`, and the sync seam are never imported.

## 2. Pinned numbers (corrected; use these everywhere)

| Metric | Value | Source |
|---|---:|---|
| Corpus / analyzable / skipped | 5,730 / 5,682 / 48 | fresh clean run |
| Sampled mutants; invisible on 48-probe basis | 88,357; 9,041 = **10.23%** [10.03, 10.43] | fresh clean run |
| Test-passing mutants | 14,534 = **16.45%** [16.21, 16.70] | fresh clean run |
| Of those, hidden-visible | 6,574 = **45.23%** [44.42, 46.04] | fresh clean run |
| Problems with a visible silent slip | 2,523 = **44.40%** [43.12, 45.70] | fresh clean run |
| Zero-mutant problems; all-visible denominator | 55/5,682; 2,818/5,627 = **50.08%** | fresh clean run |
| Reference flakes / aliasing / rename churn | 0/5,682; 8/5,682 (0.14%); 0/4,680 applied | fresh clean run |
| Ghost edits by exact signature (`climb`/`random`/`revert`) | **48.37% / 51.16% / 33.98%** | 699 walks |
| Old `Churn=0` "ghosts" / with changed states | 51.93 / 57.12 / 36.77%; 6.86 / 10.44 / 7.59% | 699 walks |
| Same-edit sign concordance (positive-only / full-sign) | **90.20 / 87.78%** (climb), **87.79 / 83.40%** (random) | 699 walks |
| Same-edit AUC, in-sample / **held-out** | 0.9025/0.8536 → **0.829/0.797** | 699 + leak walks |
| Held-out concordance | **84.00%** (climb) / **82.23%** (random), n=18,191 steps | leak walks |
| Trivial baselines among test-changing steps | always-fix 51.6/41.6%, always-break 48.4/58.4% | 699 walks |
| H5b next-test-regression risk ratio | **1.14 [0.88, 1.47]** / **1.36 [1.04, 1.79]** | 699 walks |
| Next-improvement / next-regression AUC | 0.308/0.359; 0.667/0.626 | 699 walks |
| H4a positivity / full-sign (16 / 24 probes) | 96.19/97.83%; **92.40/95.87%** | 699 walks |
| H4b within ±0.10 (16 / 24) | 84.7% / 88.4% (median error 0.030/0.024) | 699 walks |
| Sub-basis vs 48-probe universe (16 / 24) | 81.2% / 91.8% | 477-problem sample |
| Sub-basis vs 96-probe universe (16 / 24 / 48) | 76.72% / 86.93% / **96.12%** (669/696) | verifier sample |
| Cold dims ≥4: walk-long / formal last-3 | 49.79/74.68% → **85.84/93.56%**; coherence 1.50/0.46% | 699 walks |
| Latency, CPython 24-probe signature | median 0.111 ms (verifier), 0.07 ms (original audit) | verifier sample |
| Latency, Pyodide 24-probe signature | median **0.271 ms**, p95 0.638 ms, max 50.6 ms, 2.45× CPython | pyo benchmark |
| Basis build cold-start | > 250 ms on 2/200 problems; max **3.07 s** (reference timeout) | verifier re-run |
| Stored signature | 24 chars = **24 B** + ≤64 B metadata (`144 B` for 48 JSON ints; 12 B 2-bit packed) | measured |
| Synthetic routing (H7) | 100.3 vs 3.9 problems — **illustrative model, retired from product** | scratch |

### Product-claim decision (deliverable C)

**Yes for the count/no-op claim; no for any directional claim.** The 84.00%/82.23% held-out
numbers describe whether a *hidden delta's sign* agrees with a *test delta's sign*. The
shipped slice never states a sign: it reports whether the signature changed and how many dims
changed. That claim is identity-on-basis and does not depend on the held-out concordance.
The honest limit is probe blindness: 10.23% of sampled single-edit slips are invisible on the
48-probe research basis (24 probes inherit 86.93–91.8% of visible-slip coverage depending on
the universe), so copy never says "no behavioral change". The held-out numbers are **not**
strong enough for "this edit fixed/broke hidden behavior", and that copy is cut.

**Final claim sentence (exact; may not be strengthened in product copy):**

> In an opt-in, standalone practice view, the Behavioral Delta Ledger reports whether an edit
> changed the program's behavior on up to 24 deterministic hidden checks derived from the
> exercise's own tests — as a count ("k of N hidden checks changed") and a no-op statement
> ("no change on N hidden checks") — never which check changed, never whether the edit
> improved the program, and never as a grade, review signal, certificate input, or synced
> datum.

## 3. Frozen API (TypeScript)

Named modules, no new dependencies. `src/lib/bdl.ts` is pure: **zero imports**, no
`window`/`document`/`Date`/`Math.random`/`fetch` (same invariant the alibi module enforces and
tests). `src/lib/bdlStore.ts` is the only module that touches storage.

### 3.1 `src/lib/bdl.ts` — pure engine

```ts
export const BDL_HARNESS_VERSION = 1;
export const BDL_MARK = "__DF_BDL__";
/** 24 is both the product cap and the research "runtime" cap (first 24 of the same shuffle). */
export const BDL_RUNTIME_BASIS_CAP = 24;
/** Trace-line budget per Python call; learner code cannot swallow it (BaseException). */
export const BDL_LINE_BUDGET = 60_000;
/** Hard wall budget for the entire hidden run, enforced inside Python via time.monotonic. */
export const BDL_WALL_BUDGET_MS = 2_000;

export interface BdlTestCase {
  readonly input: readonly unknown[];
  readonly expected: unknown;
}
export interface BdlBasisProbe {
  readonly args: readonly unknown[];
}

/** Deterministic 32-bit FNV-1a hash (unsigned). Seeds the basis shuffle and text hashes. */
export function fnv1a32(input: string): number;

/* Internal: canonical JSON key for dedupe/shipped-input exclusion (stable key order). */

/**
 * Probe basis: for each of the first three shipped inputs, perturb exactly one
 * argument with the frozen perturbation set (research rules, no families exposed);
 * exclude exact shipped inputs and duplicates; shuffle with mulberry32 seeded by
 * fnv1a32(problemId); keep the first `cap` (default 24). Pure, deterministic across
 * machines/sessions. NOTE: the research corpus used md5-seeded shuffles; the product
 * uses FNV and therefore does not claim bit-identical bases (Errata E6).
 */
export function buildBdlBasis(
  testInputs: readonly (readonly unknown[])[],
  problemId: string,
  cap?: number,
): readonly BdlBasisProbe[];

/** Embedded Python program; identical arguments ⇒ byte-identical output. */
export function buildBdlHarness(args: {
  readonly reference: string;
  readonly submission: string;
  /** Entry function name; the reference's first `def`, supplied by the server page. */
  readonly func: string;
  readonly tests: readonly BdlTestCase[];
  readonly probes: readonly BdlBasisProbe[];
  readonly lineBudget?: number;   // default BDL_LINE_BUDGET
  readonly wallBudgetMs?: number; // default BDL_WALL_BUDGET_MS
}): string;

export interface BdlRunResult {
  /** One char per probe: "0" agree, "1" wrong value, "2" raise/timeout, "x" reference has no answer. */
  readonly sig: string;
  /** One char per shipped test: "0" fail, "1" pass. */
  readonly mask: string;
  readonly passed: number; // count of "1" in mask
  readonly total: number;  // mask.length
}

/** Last marker line wins; malformed/absent ⇒ null; sig chars validated, lengths bounded. */
export function parseBdlStdout(stdout: string): BdlRunResult | null;

export interface BdlDelta {
  readonly changed: number;    // positions (over the comparable prefix) where sig chars differ
  readonly comparable: number; // positions where both chars are in {0,1,2}
  readonly sigEqual: boolean;  // same length and every char equal
  readonly maskEqual: boolean; // masks byte-identical
}
export function bdlDelta(previous: BdlRunResult, next: BdlRunResult): BdlDelta;

export type BdlVerdict = "ghost" | "changed" | "rerun";
/**
 * "rerun"  — text hash unchanged (same code re-run);
 * "ghost"  — text changed, sigEqual, maskEqual  → "no change on N hidden checks";
 * "changed"— otherwise, show the count.
 */
export function bdlVerdict(delta: BdlDelta, textChanged: boolean): BdlVerdict;

/** Fixed UI copy; no clocks, no randomness. n = next.sig.length. */
export function describeBdlVerdict(verdict: BdlVerdict, delta: BdlDelta, n: number): string;

export function hashBdlText(code: string): string; // 8 hex chars over exact text
/** Stable fingerprint of (problemId, cap, tests); any change invalidates stored signatures. */
export function basisFingerprint(
  problemId: string,
  tests: readonly BdlTestCase[],
  cap?: number,
): string;
```

**Harness contract (Python, frozen).** The generated program:

1. embeds `reference` and `submission` as Python string literals, `func` as a literal, and
   `tests`/`probes` as `json.loads(<literal>)`;
2. defines `deep_eq` with the platform's 1e-6 semantics (bool exact; int/float `math.isclose`;
   list/tuple positional; dict key-set + values; `None` identity) and calls `fn(*copy.deepcopy(args))`;
3. installs a `sys.settrace` tracer with a per-call line budget and a global deadline
   (`time.monotonic()`), raising a `BaseException` subclass that learner code cannot catch,
   with a filename filter so only learner/reference frames count;
4. redirects stdout during calls so learner prints cannot corrupt the marker line;
5. states for the learner: `2` on raise/timeout, `0` if `deep_eq`, else `1`; for the
   reference: `x` if it raises/times out (dropped from comparisons);
6. emits **exactly one** line `BDL_MARK + json.dumps({"v": 1, "sig": ..., "mask": ...})`.

`parseBdlStdout` returns `null` when the marker is absent or malformed (UI: "the run did not
finish — try again"). A `v` other than `1` is a harness mismatch (`null`).

### 3.2 `src/lib/bdlStore.ts` — device-local persistence

```ts
import { readRaw, writeRaw } from "@/lib/sync/localAdapter"; // NOT createStore

export const BDL_STORAGE_KEY = "deepforge:bdl:v1";
export const BDL_SHELF_STORAGE_KEY = "deepforge:bdl-shelf:v1";
export const BDL_CHANGE_EVENT = "deepforge:bdl-change";
export const BDL_SHELF_CHANGE_EVENT = "deepforge:bdl-shelf-change";
export const BDL_LEDGER_MAX_PROBLEMS = 300;
export const BDL_SHELF_MAX_PER_PROBLEM = 3;
export const BDL_SHELF_MAX_SOURCES = 48;
export const BDL_SHELF_MAX_SOURCE_CHARS = 4_096;

export interface BdlAttempt {
  readonly hash: string; // hashBdlText of the exact source that produced sig
  readonly sig: string;  // ≤ 24 chars from {0,1,2,x}
  readonly mask: string;
  readonly at: string;   // ISO timestamp, supplied by the caller (no clock in the store)
}
export interface BdlProblemRecord {
  readonly basis: string; // basisFingerprint at write time
  readonly last: BdlAttempt;
}
export interface BdlLedger {
  readonly version: 1;
  readonly enabled: boolean;
  readonly problems: Record<string, BdlProblemRecord>;
}
export interface BdlSavedSource {
  readonly id: string;   // hashBdlText(code + at), 8 hex chars
  readonly code: string; // ≤ BDL_SHELF_MAX_SOURCE_CHARS
  readonly sig: string;
  readonly mask: string;
  readonly at: string;
}

export function getBdlLedger(): BdlLedger;            // parse-safe; malformed → empty
export function isBdlEnabled(): boolean;              // default false
export function setBdlEnabled(enabled: boolean): void;
export function getBdlRecord(problemId: string, basis: string): BdlAttempt | null;
/** No-op unless enabled. Replaces `last`; drops a record whose `basis` differs. */
export function recordBdlAttempt(problemId: string, basis: string, attempt: BdlAttempt): void;
export function clearBdlProblem(problemId: string): void;
export function clearBdl(): void;

export function getBdlShelf(problemId: string): readonly BdlSavedSource[];
/** false (no-op) when disabled or the code exceeds the cap; over caps evicts oldest by `at`. */
export function saveBdlSource(
  problemId: string,
  source: { readonly code: string; readonly sig: string; readonly mask: string; readonly at: string },
): boolean;
export function removeBdlSource(problemId: string, sourceId: string): void;
export function clearBdlShelf(): void;
/** JSON string of the whole shelf for the opt-in "Export shelf" download. */
export function exportBdlShelf(): string;
```

**Determinism and parsing.** No `Date.now()` anywhere in the module (callers pass `at`);
`parse` never throws and drops malformed entries; a record whose stored `version` is not `1`
is dropped (the documented migration rule: this wave ships v1, and a future v2 either rewrites
the key to `deepforge:bdl:v2` or adds a record-level migrator — no silent reinterpretation).
`recordBdlAttempt` enforces `BDL_LEDGER_MAX_PROBLEMS` by evicting the oldest `at`.

### 3.3 Routes and components (signatures)

```ts
// src/app/ledger/page.tsx (server, static): metadata + <PageShell> + <LedgerIndex />
// src/app/ledger/[id]/page.tsx (server, dynamic): getProblemById(id) → notFound()
//   payload: Pick<Problem, "id"|"title"|"category"|"difficulty"|"description"
//                       |"starterCode"|"solution"|"testCases">
//   + func = extractFuncName(problem.solution) (import from @/lib/pyodideWorkerProtocol)
//   renders <BdlWorkspace problem={payload} func={func} />

// src/components/ledger/LedgerIndex.tsx ("use client")
//   reads getProgress() (read-only) + PROBLEM_META; enable toggle; privacy copy; links.

// src/components/ledger/BdlWorkspace.tsx ("use client")
export function BdlWorkspace(props: { problem: BdlProblemPayload; func: string }): JSX.Element;
//   state: code, running, result, delta, verdict, shelf revision
//   prefill: getProblemProgress(problem.id).savedCode ?? problem.starterCode  (read-only)
//   on first Run: const py = await loadPyodideOnce(); await runCode(py, buildBdlHarness(...))
```

No `ProblemView`, `runTests`, `createStore`, or `notifyLocalWrite` in any ledger file;
`@/lib/progress` is imported read-only and only for `getProgress` / `getProblemProgress`.

## 4. Storage, versioning, migration, sync exclusion, backup

- **Key + version:** `deepforge:bdl:v1` (ledger + enable flag; refresh-stable, device-local)
  and `deepforge:bdl-shelf:v1` (opt-in sources). `version: 1` inside each payload;
  unknown versions are dropped, never guessed.
- **Basis invalidation:** every record stores `basisFingerprint(problemId, tests, 24)`.
  `getBdlRecord` returns `null` on mismatch and `recordBdlAttempt` replaces rather than merges
  — a changed test set/reference starts clean. Key version bump is independent of fingerprint.
- **Sync exclusion:** no `StoreId` addition, no `STORE_SPECS`/`ALL_STORE_IDS` entry, no
  `createStore`/`notifyLocalWrite`; writes go through `readRaw`/`writeRaw` only. `remote.ts`'s
  local-only comment block gains two lines documenting `deepforge:bdl:v1` and
  `deepforge:bdl-shelf:v1` as deliberately local (bugHunt/agentic-style stores still sync;
  BDL does not).
- **Backup inventory:** both keys are added to `BACKUP_EXCLUDED_KEYS` with reasons
  (regenerable signature; source shelf duplicates `progress.savedCode` and is device-scoped).
  The opt-in escape hatch is `exportBdlShelf()` → a client-side JSON download; no
  `backup.ts` export/import change. `tests/backup.test.ts`'s source-scan inventory test
  classifies the two new literals through the excluded map.
- **Privacy/caps:** slice 1 stores one signature per problem (24 B + ≤64 B metadata); slice 2
  stores only explicitly saved sources, ≤3/problem, ≤4 KB each, ≤48 total, LRU-evicted, with
  `clearBdl` / `clearBdlShelf` controls on the index page.

## 5. Route and UI surface

- **Routes:** `/ledger` (static index) and `/ledger/[id]` (dynamic workspace; no
  `generateStaticParams`, `notFound()` for unknown ids). Index rows link to
  `/ledger/<id>`; deep links survive refresh. Add `/ledger` (covers `/ledger/[id]`) to
  `scripts/measure-bundle.ts` `KEY_ROUTES` with `BUDGETS_KB["/ledger"] = 440`. The ship gate
  requires `/stats` to print the same gzip as before the wave (**409.5 kB** measured at
  planning time against a 417 kB budget) — it must not grow at all.
  **Budget fallback (in order):** if `/ledger` first-load exceeds 440 kB, move `PROBLEM_META`
  consumption into a lazily imported picker chunk (`await import()` on mount); if it still
  exceeds, serve a compact `{id,title,difficulty}` list from `/public/ledger-meta.json`
  (fetched on mount, precached by the SW) instead of importing `PROBLEM_META`.
- **Layout:** 375px-first, one column; index = intro card + enable toggle + attempted-problem
  list (compact rows, difficulty/category chips from `PROBLEM_META`); workspace = editor
  (`<textarea>` styled with `df-code-editor`, no new editor dependency) + Run + result card +
  (slice 2) "Your bugs" tab. `prev`/`next` links move between attempted problems.
- **Design tokens only** (`docs/DESIGN-SYSTEM.md`): `bg-canvas`, `bg-canvas-card`,
  `bg-canvas-soft`, `border-hairline`, `text-ink`, `text-body`, `text-body-mid`, `text-mute`,
  `text-accent`, `text-warning`/`text-error`; `rounded-lg`; `font-mono` for code and counts;
  `max-w-6xl px-4 sm:px-6`; cards `rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5`.
- **No new dependencies.** Pyodide is dynamically imported on the first Run only (pattern:
  `src/components/alibi/AlibiHunt.tsx`).
- **Copy rules (exact strings, frozen):**
  - Intro: "The Ledger checks whether an edit changed your program's behavior on a set of
    hidden checks built from this exercise's own tests. It reports counts only — never which
    check, never whether a change is right."
  - Enable: "Turn on the Ledger on this device."
  - Changed card: "This edit changed k of N hidden checks."
  - Ghost card: "No change on N hidden checks. This edit changed text, not the behavior the
    checks measure."
  - Always-visible caveat: "The hidden checks are a sample; an edit can still matter without
    changing them."
  - Privacy: "The Ledger stores one signature per problem in this browser. Nothing is synced.
    You can clear it at any time."
  - Never: "correct", "wrong", "no behavioral change", "you fixed/broke", "blind spot",
    family names, accuracy percentages.
- **Accessibility:** Run reports `aria-busy`; cards render in `aria-live="polite"`; the editor
  has a label; tap targets follow existing buttons; focus moves to the card after a run.
- **Offline/wiring:** `public/sw.js`: add `"/ledger"` to `PRECACHE_ROUTES` and
  `{ prefix: "/ledger/", fallback: "/ledger", reason: "ledger index lists attempted problems" }`
  to `NAVIGATION_FALLBACKS`; bump `VERSION` `v8` → `v9`. `tests/offline.test.ts`: add
  `ledger: "/ledger"` to `STATIC_ROUTES` and the dynamic entry to `DYNAMIC_ROUTES`.
  `scripts/e2e-smoke.mjs`: add `"/ledger"`. `src/app/sitemap.ts`: add
  `{ path: "/ledger", changeFrequency: "monthly", priority: 0.5 }`. `src/lib/quickActions.ts`:
  add `{ id: "open-ledger", label: "Open the Behavioral Delta Ledger", keywords: ["ledger",
  "delta", "edit", "no-op", "behavior"], kind: "navigate", href: "/ledger" }`.
- **Pre-existing condition (do not paper over):** `tests/offline.test.ts` is already red on
  the wave-41 `/alibi` route, which was added without classification or SW/sitemap/budget
  wiring. The BDL wiring commit must either include the missing `/alibi` classification
  (`alibi: "/alibi"` + `/alibi` precache + fallback + bundle budget) or be sequenced after a
  wave-41 wiring repair; BDL's own entries are specified above and are independent.

## 6. Exact file plan

**New files**

| File | Content |
|---|---|
| `src/lib/bdl.ts` | pure engine (§3.1): basis, harness, parser, delta, verdict, hashes |
| `src/lib/bdlStore.ts` | device-local store (§3.2) via `readRaw`/`writeRaw`, caps, fingerprint |
| `src/components/ledger/LedgerIndex.tsx` | opt-in + picker over attempted problems |
| `src/components/ledger/BdlWorkspace.tsx` | editor, Run, count card, shelf tab |
| `src/app/ledger/page.tsx` | static route + metadata + `PageShell` |
| `src/app/ledger/[id]/page.tsx` | dynamic workspace route; server-side payload + `func` |
| `tests/bdl.test.ts` | pure engine + store tests (§7) |
| `tests/bdl-safety.test.ts` | source scans: no grading/sync writes, inventory holes |
| `scripts/verify-bdl.ts` | permanent Python-backed harness gate |
| `scripts/py_bdl_verify.py` | runs emitted harnesses under CPython on fixed fixtures |
| `src/data/inventions/behavioral-delta-ledger.ts` | paper #3 (§11) |

**Touched files**

| File | Change |
|---|---|
| `src/lib/sync/remote.ts` | comment-only: add the two BDL keys to the local-only list |
| `src/lib/backup.ts` | add the two keys to `BACKUP_EXCLUDED_KEYS` with reasons |
| `public/sw.js` | `/ledger` precache + fallback; `VERSION` → `"v9"` |
| `tests/offline.test.ts` | classify `ledger` static + `ledger/[id]` dynamic |
| `scripts/e2e-smoke.mjs` | add `/ledger` to `ROUTES` |
| `src/app/sitemap.ts` | add `/ledger` |
| `src/lib/quickActions.ts` | add `open-ledger` navigate action |
| `scripts/measure-bundle.ts` | `/ledger` in `KEY_ROUTES`; budget 440 |
| `src/data/inventions/index.ts` | register paper #3 (newest first) |
| `package.json` | `"verify:bdl": "bun run scripts/verify-bdl.ts"` |
| `.github/workflows/ci.yml` | run `verify:bdl` after the problem-bank step |

**Not touched (enforced by tests):** `src/components/ProblemView.tsx`, `src/lib/lgs.ts`,
`src/lib/reviewQueue.ts`, `src/lib/certificates.ts`, `src/lib/bugHunt.ts`, `src/lib/spotBug.ts`,
`src/lib/progress.ts` (read-only import from the components only), `src/lib/sync/store.ts`,
`src/lib/sync/backend.ts`, grading/telemetry, `pyodide.ts`/worker protocol.

## 7. Tests to write

**`tests/bdl.test.ts` (fast, no Python, no DOM).**

1. `fnv1a32` / `hashBdlText` / `basisFingerprint`: fixed vectors; fingerprint changes when a
   test input, expected value, cap, or problem id changes.
2. `buildBdlBasis`: deterministic for a fixture (twice ⇒ deep-equal); excludes exact shipped
   inputs; dedupes; respects `cap`; probes are single-argument perturbations of the first
   three inputs; an id change changes the order; empty/short inputs yield fewer probes.
3. `buildBdlHarness`: byte-identical for identical args; contains `BDL_MARK`, `deepcopy`,
   `settrace`, the budget constants; embeds code so a fixture containing quotes/newlines/
   backslashes survives (round-trip check against the emitted literal); does not embed
   `exec(_BDL_INPUT)`-style patterns (learner text is data, not code in the harness source).
4. `parseBdlStdout`: `sig`/`mask` shape combinations round-trip; noise lines ignored;
   last marker wins; malformed/missing/`v:2` ⇒ `null`; `passed` counted correctly.
5. `bdlDelta`/`bdlVerdict`/`describeBdlVerdict`: 1↔2 flips count as changed (the E1 fix);
   `x` dims are not comparable; identical sig+mask+text-changed ⇒ `"ghost"` with the exact
   copy; identical sig but changed mask ⇒ `"changed"`, never ghost; unchanged text ⇒ `"rerun"`.
6. Store: disabled by default and `recordBdlAttempt` is a no-op until enabled; malformed JSON
   parses to empty; `version: 2` records drop; fingerprint mismatch returns `null` and the
   next write replaces; ≤300-problem eviction by oldest `at`; shelf caps (3/problem, 48 total,
   4096 chars) and LRU eviction; `clearBdl`/`clearBdlShelf` remove keys; `exportBdlShelf`
   parses as JSON.

**`tests/bdl-safety.test.ts` (source scans).**

7. `src/lib/bdl.ts` has zero imports, no `Math.random`/`Date`/`window`/`document`/
   `localStorage`/`fetch` (mirrors `tests/alibiHunt.test.ts`).
8. `src/lib/bdlStore.ts` imports only `@/lib/sync/localAdapter`; never `createStore`,
   `notifyLocalWrite`, `@/lib/progress`, `@/lib/lgs`, `@/lib/reviewQueue`,
   `@/lib/certificates`, `@/lib/bugHunt`.
9. Ledger components/routes import `@/lib/progress` only for `getProgress`/
   `getProblemProgress`; the tree contains no `saveCode(`, `markSolved(`, `markOpened(`,
   `recordRun(`, `gradeReview`, `recordBugRound(`.
10. `src/lib/sync/types.ts` `StoreId` and `src/lib/sync/remote.ts` `ALL_STORE_IDS` do not
    mention `bdl`; `src/lib/backup.ts` excludes both keys; `BACKUP_INCLUDED_KEYS` does not
    contain them.

**`scripts/verify-bdl.ts` + `scripts/py_bdl_verify.py` (permanent gate).** For fixed fixtures
(agree, wrong-value, raise, reference-timeout), emit the harness with known probes/tests, run
it under CPython with `python3`, assert the parsed `sig`/`mask` exactly, assert the wall
deadline path emits `x` for a reference that sleeps, and assert exactly one marker line.
Nonzero exit on any mismatch. This is the same honesty gate wave 41 used for `/alibi`.

**Existing tests updated:** `tests/offline.test.ts` (route classification + precache list
length), `tests/backup.test.ts` (new literals classified as excluded), `tests/quickActions`
if it asserts registry contents, and the e2e route list. `bun test` must stay green
(accounting for the pre-existing `/alibi` gap in §5).

## 8. Verification commands (ship gate)

```bash
bun test tests/bdl.test.ts tests/bdl-safety.test.ts
bunx tsc --noEmit && bun run lint
bun run verify:bdl
bun test
bun run build
bun run scripts/measure-bundle.ts --check   # /ledger ≤ 440, /stats unchanged
```

Manual: 375px run of `/ledger` with the enable toggle off (nothing stored) and on (one
signature stored); a no-op edit shows the ghost card; an edit that changes a value shows a
count; reload shows the count against the previous run; clearing removes `deepforge:bdl:v1`.

## 9. Parallel tracks (write ownership)

| Track | Owns | Depends on |
|---|---|---|
| **A core** | `src/lib/bdl.ts`, `tests/bdl.test.ts` (pure parts) | — |
| **B store** | `src/lib/bdlStore.ts`, `tests/bdl-safety.test.ts`, `backup.ts`, `remote.ts` comment | A frozen API |
| **C UI+route** | `src/components/ledger/*`, `src/app/ledger/*` | A, B |
| **D gate** | `scripts/verify-bdl.ts`, `scripts/py_bdl_verify.py`, `package.json`, CI | A |
| **E wiring** | `sw.js`, `offline.test.ts`, `e2e-smoke.mjs`, `sitemap.ts`, `quickActions.ts`, `measure-bundle.ts` | C |
| **F paper** | `src/data/inventions/behavioral-delta-ledger.ts`, `index.ts` | §11 numbers |

Order: A → B/D in parallel → C → E → F. Per-track gates: A `bun test tests/bdl.test.ts &&
bunx tsc --noEmit`; B `bun test tests/bdl-safety.test.ts tests/backup.test.ts`; C `bunx tsc
--noEmit && bun run lint`; D `bun run verify:bdl`; E `bun test tests/offline.test.ts` then,
after build, `bun run scripts/measure-bundle.ts --check`; F `bun test tests/inventions.test.ts`.

## 10. Day one, rollback, kill criteria

Day one: `/ledger` is reachable from the palette and sitemap; the paper appears on
`/inventions`; nothing else changes. Rollback: delete the two routes, the two components, the
two lib modules, and the wiring entries; `clearBdl()` covers the only persisted state.

Kill criteria: (1) `verify:bdl` fails after one repair attempt; (2) `/stats` first-load JS
grows by any amount, or `/ledger` exceeds 440 kB gzip with no trim; (3) any ledger source
imports a grading/sync-write module or writes a key other than the two BDL keys; (4) any UI
copy states direction, correctness, or "no behavioral change"; (5) the harness cannot bound a
hostile submission's wall time to ≤ 2 s in real Pyodide.

## 11. Paper #3 plan — `/inventions`

- **File:** `src/data/inventions/behavioral-delta-ledger.ts`; register in
  `src/data/inventions/index.ts` (newest first, above `ALIBI_DISTANCE`).
- **id/slug:** `behavioral-delta-ledger`.
- **Title:** "Behavioral Delta Ledger: Per-Edit No-Op Detection on a Hidden Basis Derived from
  an Exercise's Own Tests".
- **Authors:** `["DeepForge Research"]`; **date:** `"2026-09-18"`; **keywords:** behavioral
  delta, differential testing, probe blindness, novice edits, no-op edits, exercise corpus,
  Python, education.
- **Abstract (corrected; use verbatim):**

> A learner's repeated Run on an auto-graded exercise usually leaves one bit — pass or fail —
> and no memory of the previous program. We define a per-edit behavioral signature: a
> deterministic 48-probe basis built by perturbing the exercise's own test inputs, relative to
> the shipped reference, with states agree / wrong value / raise-or-timeout, executed under a
> fresh-copy protocol. Mining the DeepForge corpus (5,730 exercises, 5,682 analyzable, 88,357
> sampled single-edit mutants) shows 10.23% of mutants are invisible on the basis (95% CI
> [10.03, 10.43]), 16.45% pass every shipped test, and 44.40% of problems carry a test-passing
> slip the basis can see. On 699 simulated edit walks, 48.4–51.2% of edits are exact no-ops by
> signature. In-sample, the sign of the hidden delta matches the sign of the test delta for
> 90.20% of improving walks (AUC 0.903), but with the basis built only from odd-index tests and
> the delta scored on even-index tests the held-out concordance drops to 84.00% (AUC 0.829) and
> 82.23% (AUC 0.797) — the number we report. Break-induced risk of a next-attempt test
> regression is 1.14× (95% CI [0.88, 1.47]) and 1.36× ([1.04, 1.79]), below the
> pre-registered 2× prediction, so the ledger is retrospective attribution, not forecasting.
> Persistent "cold" probes are common under the formal last-three-attempt definition (85.8% of
> climb walks have ≥ 4) but almost never concentrated in one perturbation family (1.50%), and
> the aggregate enrichment over structural transformations is post hoc and modest (reverse
> z = +3.1, empty z = −11.8 under a within-walk permutation null); all residual routing is
> therefore excluded from the shipped design. The shipped instrument is a count-only, opt-in,
> standalone practice route that stores one signature per problem, never sources, never
> families, and never grades; it reports "k of N hidden checks changed" or "no change on N
> hidden checks", because probe blindness makes stronger language false.

- **Sections** (blocks per the `InventionBlock` union; corrected numbers only):
  1. **Introduction & motivation** — process memory vs verdict; the five gaps; contributions:
     the per-edit hidden signature, the census, the walk study, the ghost/churn correction
     (E1), the held-out collapse, the formal cold-set reconciliation (E2), and the count-only
     product decision.
  2. **Related work** — differential testing (McKeeman), regression testing, mutation testing
     (DeMillo 1978; Jia & Harman; Papadakis; Just 2014), coverage criticism (Inozemtseva &
     Holmes), DSpot, novice compilation behaviour (Jadud 2006), errorful learning (Metcalfe
     2017; Kornell 2009), wave 41 / Alibi Distance (visibility is wave 41's; state it), and
     what is new (per-edit no-op detection on a hidden basis for a learner's own consecutive
     submissions).
  3. **Method** — objects and states; the 11 perturbation classes / no family exposure; basis
     construction and seeds; fresh-copy protocol (P6, aliasing 8/5,682); corrected churn and
     ghost definitions (E1); the 48/24/16 sub-bases; walk policies `climb`/`random`/`revert`
     (699 walks, seeds in Appendix); the leakage protocol (odd-test basis, even-test scoring);
     the clean-run protocol (truncating writer, no resume).
  4. **Census** — table from errata E3; family invisibility table (cmp 24.75% … notdel 1.47%);
     denominators (55/5,682 zero-mutant; all-visible 50.08% of 5,627); sensitivity p10/median/
     p90 0.283/0.551/0.838.
  5. **Edit walks** — corrected ghost table (48.37/51.16/33.98 exact; 51.93/57.12/36.77 old
     `Churn=0`; 6.86/10.44/7.59% state flips); same-edit in-sample vs **held-out** table;
     trivial baselines; next-edit AUCs 0.308/0.359 and 0.667/0.626; H5b risk ratios with CIs.
  6. **Residuals (negative)** — walk-long vs formal last-3 table; H6b 1.50/0.46%; corrected
     within-walk null z-values; explicit statement that routing is not shipped and the
     synthetic H7 result is a model, not evidence.
  7. **Cost and storage** — CPython 0.07–0.111 ms and Pyodide 0.271 ms per 24-probe signature;
     basis build max 3.07 s (lazy build + 2 s wall budget); signature storage 24 B (144 B as
     48 JSON ints; 12 B packed) — the old ≈100 B claim withdrawn.
  8. **Product implications and safety** — the shipped slices, the cuts table, the claim
     sentence (§2), the no-grading/no-sync enforcement tests.
  9. **Reproducibility** — fresh-run provenance (`clean/bdl_engine_clean.py`,
     `clean/census_clean.jsonl`), the retired append-resumed artifact, seeds/constants,
     `analysis/recompute.py`, and the `verify:bdl` gate.
  10. **Limitations & future work** — no human data (every learner number is simulated);
     probe blindness 10.23%; spec ambiguity; visible reference; basis-seed deviation
     (research md5 vs product FNV); the 24-probe product basis is not measured at corpus
     scale; shadow-logging study is the first human experiment.
- **References (24; real URLs only).** Reuse from `src/data/inventions/alibi-distance.ts`
  and `ladder-graded-spacing.ts` (same ids/citations/URLs):
  `demillo1978` https://doi.org/10.1109/C-M.1978.218136 ; `jia2011`
  https://doi.org/10.1109/TSE.2010.62 ; `papadakis2019`
  https://doi.org/10.1016/bs.adcom.2018.03.015 ; `just2014`
  https://doi.org/10.1145/2635868.2635929 ; `inozemtseva2014`
  https://doi.org/10.1145/2568225.2568271 ; `danglot2019`
  https://doi.org/10.1007/s10664-019-09692-y ; `mckeeman1998`
  https://www.cs.tufts.edu/comp/150FP/archive/bill-mckeeman/DifferentailTesting.pdf ;
  `zeller2002` https://doi.org/10.1109/32.988498 ; `goldman1995`
  https://doi.org/10.1006/jcss.1995.1023 ; `zhu2015` https://arxiv.org/abs/1505.05192 ;
  `bjork2020` (desirable difficulties, URL from alibi-distance) ; `cepeda2006`
  https://www.evullab.org/pdf/CepedaPashlerVulWixtedRohrer-PB-2006.pdf ; `karpicke2011`
  https://doi.org/10.1037/a0023436 ; `sting2026` https://arxiv.org/abs/2604.01518 ;
  `examplar2024` https://doi.org/10.22152/programming-journal.org/2024/8/7 ;
  `bugspotter2025` https://doi.org/10.1145/3641554.3701974 ; `aiwrong2026`
  https://doi.org/10.1145/3765964.3811667 ; `fppgen2024`
  https://doi.org/10.1145/3626252.3630786 ; `katabench`
  https://katabench.com/docs/grading ; `speccle`
  https://github.com/matthewalton/speccle/blob/main/docs/adr/0012-strengthen-routes-on-the-survivor-not-the-score.md ;
  `fsrs-algorithm`
  https://github.com/open-spaced-repetition/awesome-fsrs/wiki/The-Algorithm ;
  plus two verified for this paper: `jadud2006`
  https://doi.org/10.1145/1151588.1151600 ; `metcalfe2017`
  https://doi.org/10.1146/annurev-psych-010416-044022 ; and `kornell2009`
  https://doi.org/10.1037/a0015729 (already in `ladder-graded-spacing.ts`). **URL rule:** copy
  the existing entries verbatim; never invent a URL.
- **Honest novelty statement (use in §1 and §2):** "The visibility of hidden-basis divergence
  is wave 41's result, replicated here (44.40% vs 46.08% P(α=1)). What is new is the object:
  the delta between two of a learner's own consecutive programs on a hidden basis derived from
  the exercise's own tests, the exact no-op edit as a behavioral event, and the measured
  limits of that object (held-out sign concordance 84.0/82.2%, 10.2% probe blindness,
  cold-set coherence 1.5%)."
- **Honest limitations (use in §10):** no human data; simulated edit model whose family rates
  are corpus engineering choices; 84/82% held-out bounds any predictive use; the product basis
  uses a different deterministic seed than the research study; residual findings are post hoc
  and excluded from the product.

## 12. Top risks

1. **Overclaim creep in copy.** The temptation is a post-solve card. Mitigation: tests in §7
   (safety scans) and the kill criteria; the claim sentence in §2 is the ceiling.
2. **Harness escape.** Learner code hitting C-level nontermination (e.g. huge `int` pow) can
   bypass line tracing. Mitigation: the 2 s wall deadline is checked in the tracer *and* the
   editor caps input size; a hung worker is recovered by reload (documented residual).
3. **Basis-seed deviation.** Product FNV seeds ≠ research md5 seeds. Mitigation: state it in
   the paper; a future corpus QA can compute FNV-seeded bases build-side.
4. **Storage pressure via the shelf.** Caps are per-problem + global + char count; `savedCode`
   already occupies the same order of magnitude. Mitigation: caps, LRU, export, clear.
5. **Offline/wiring red base.** `/alibi` is currently unclassified and `tests/offline.test.ts`
   is red; the builder must not attribute that failure to BDL. Mitigation: fix the wave-41
   classification in the same wiring commit or land after the repair.
6. **Paper/product number drift.** Use only §2 numbers; the errata is ground truth; the
   retired z-values/90-88% in-sample numbers may not appear again.
