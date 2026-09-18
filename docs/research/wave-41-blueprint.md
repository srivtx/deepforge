# Wave 41 blueprint — Alibi Distance (final, implementable)

Status 2026-09-18. Supersedes `invention-wave-41.md` §1–§10 wherever they differ; the Errata
section of that document and this blueprint are ground truth. Chosen variant: **census paper +
Silent Bug Hunt** — publish the corrected census on `/inventions`, and ship the mined alibi
mutants as a standalone, optional practice route. Every number below was measured from the wave-41
scratch corpus (`/var/folders/lc/r25hfwjs4j963w2f40s9rc5h0000gn/T/opencode/w41/`) and the two
verifier scratch dirs; the curated set was re-verified 96/96.

## 1. Decision: what ships, what is cut, and why

**Ships (this wave):**

1. **Paper #2 on `/inventions`** — the corrected census with the independent replication, the
   corrected closure framing (oracle vs cross-validated), the two negative results, and the blind
   audits. The census tables double as the author-facing aperture report (critic's slice item 3).
2. **`/alibi` — Silent Bug Hunt** — a standalone practice route over a frozen, machine-verified
   set of **96 mined alibi puzzles**. Each puzzle is a program that passes every shipped test and
   is one AST edit from the reference. The learner types a Python-literal input; the reference and
   the ghost run locally in the existing Pyodide worker; the verdict is the raw divergence fact.
   Session-only state; nothing persisted; no grading, review, progress, or certificate path is
   touched (enforced by a source-scan test).

**Cut, with reasons (critic's safety constraints honored):**

| Cut | Why |
|---|---|
| Witness closure as a shipped operation (auto or manual test-set edits) | Spec ambiguity needs author judgment per witness; hidden tests + no telemetry make false "wrong" verdicts silent; timeout divergence is hardware-dependent. No auto-modification of grading, ever. |
| Certificate/ledger integration ("examined solves", ledger hash on certificates) | Examined solve is broken (alibis come from the reference, not learner code); random probing already convicts 63.3% within 10 probes; a certificate gate would be a third post-solve gate with no evidence base. |
| Ghost Card as a post-solve gate in `ProblemView` | Same broken premise; also a `ProblemView` ownership lane conflict. The standalone route gets the content without the gate. |
| Runtime mining in the browser | The mining engine needs AST mutation + a probe bank + 0.25 s alarms; build-time only. |
| Authoring-aperture route/UI | Deferred; the paper's census tables are the aperture report. A dedicated surface needs a maintenance story (content-hash caching, re-mining changed problems) that this wave does not build. |
| Shadow logging / coupling study | Recommended in the paper, not shipped; needs telemetry the product does not have. |
| New storage key / backup / sync entry | The feature is session-only by design; a persisted counter would require store + merge + backup inventory review. |

**Safety argument, mechanically:** `/alibi` imports no module that can write progress, submissions,
review state, certificates, or bug-hunt history (tested); it never calls `markSolved`, `recordRun`,
`gradeReview*`, or any store `set`; it performs read-only local execution and keeps its state in
React memory.

## 2. Pinned numbers (corrected; use these everywhere)

Author census = `w41/chunk-*.jsonl`, 5,721 analyzable; independent = verifier engine, 5,725
analyzable. All headline rates inside 0.2 pp (E15).

| Metric | Author | Independent |
|---|---:|---:|
| Problems / analyzable | 5,730 / 5,721 | 5,730 / 5,725 |
| Sampled mutants | 106,081 | 105,425 |
| Mutants passing all shipped tests | 17,502 (16.50%) | 17,471 (16.57%) |
| Probe-divergent survivors (alibis) | 7,727 (7.28% of mutants) | 7,704 (7.31%) |
| Problems with ≥1 alibi (`P(α=1)`) | 2,636 (46.08%) | 2,630 (45.94%) |
| Probe-equivalent survivors | 1,051 (18.37%) | 1,054 (18.41%) |
| Singleton-witness alibis | 1,760/7,727 (22.78%) | 22.83% |
| Witness fraction mean / median / p90 | 11.03% / 7.69% / 24.00% | 11.04% / 7.69% / 24.00% |
| Best single probe: corpus kill | 5,658/7,727 (73.22%) | 73.25% |
| Best single probe: fully closes | 1,574/2,636 (59.71%) | 59.77% |
| After one **oracle** probe: affected | 18.56% | 18.48% |
| After one **oracle** probe: survival | 11.17% | 11.22% |
| CV held-out kill (n=1,332 of 1,786) | 48.35% (oracle 71.96%, random 10.80%) | 48.79% (n=1,320) |
| **Deployable (CV) affected estimate** | **23.80%** | **23.53%** |
| Greedy 1-closure cost | mean 1.594, median 1, p90 3, max 7 | mean 1.593, max 6 |
| Cumulative closed ≤1/2/3 probes | 59.71 / 86.57 / 95.98% | 59.77 / 86.62 / 95.93% |
| Radius-2 survival, shipped → +oracle witness | 12.52% → 8.56% (−31.6%); random 11.75% (−6.1%) | 11.91% → 8.42% (−29.3%); random 11.31% (−5.0%) |
| Duel probe policy within 10 probes | random 63.3% vs guided 59.5% (0.94×) | — |
| Predicates BA≥0.9 | 32.2% (n=671); permutation control mean-max 0.881 | held-out 32.8% (n=743); 53.8% beat control |
| Length quartiles: `P(α=1)` / survival | 20.24/41.45/56.66/69.95%; 11.45→18.57% (1.62×) | 20.11/41.38/56.34/69.86%; 11.50→18.63% |
| P9 corrected length deciles | 8.4 / 15.0 / 42.3 / 39.7 / 46.0 / 53.5 / 53.2 / 60.5 / 65.9 / 76.3% | same recompute |
| Monotonicity counterexample | `la-029` `idx-@5`, D grows by 17 probes | reproduced |

**Curated practice set (new this wave; frozen scratch artifact
`/var/folders/lc/r25hfwjs4j963w2f40s9rc5h0000gn/T/opencode/w41-engineer/selected-96-final.json`):**

| Metric | Value |
|---|---:|
| Puzzles | 96 (one per problem, unique) |
| Divergence class at stored witness | 64 crash, 32 value (0 timeout) |
| Difficulty | Easy 26 / Medium 52 / Hard 18 |
| Categories | all 15, 4–8 each |
| Text diff vs reference | exactly 1 changed line in all 96 (references stored `ast.unparse`d, so formatting is identical) |
| Re-verification | 96/96: reference passes all tests, ghost passes all tests, ghost diverges at witness (1e-6 deep-eq, 0.25 s alarm) |
| Serialized size | 116,944 B raw / 21,383 B gzip (`JSON.stringify`, compact) |

## 3. Frozen API (TypeScript)

### 3.1 `src/data/alibis/types.ts` (new; types only)

```ts
import type { Difficulty, TestCase } from "@/types/problem";

/** One frozen silent-bug puzzle: a ghost program that passes every shipped test. */
export interface AlibiPuzzle {
  /** Source problem id, e.g. "al-353". Unique across the set. */
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly difficulty: Difficulty;
  /** Entry function name; identical in `reference` and `ghost`. */
  readonly func: string;
  /** The reference solution, `ast.unparse`d so text diffs are exactly the edit. */
  readonly reference: string;
  /** The mined alibi: passes every shipped test, diverges from `reference`. */
  readonly ghost: string;
  /** Python literal of positional args at which the two diverge (validated offline). */
  readonly witness: string;
  /** The shipped tests, for display ("passes all N of these"). */
  readonly tests: readonly TestCase[];
}
```

### 3.2 `src/data/alibis/index.ts` (new)

```ts
export { ALIBI_PUZZLES } from "./puzzles";
export type { AlibiPuzzle } from "./types";
```

`ALIBI_PUZZLES: readonly AlibiPuzzle[]` — exactly 96 records, frozen order (Easy→Hard, id).
`puzzles.ts` is generated once from the scratch artifact and carries a header comment with the
provenance (engine.py, problems.json, seeds `md5(id)`, selection rule, validation result). It is
imported **only** by the `/alibi` route tree; never re-export it from a shared barrel.

### 3.3 `src/lib/alibiHunt.ts` (new; pure, zero runtime imports)

```ts
import type { AlibiPuzzle } from "@/data/alibis/types";

export const ALIBI_HARNESS_VERSION = 1;
export const ALIBI_INPUT_MAX_CHARS = 2000;
export const ALIBI_LINE_BUDGET = 400_000;
export const ALIBI_MARK = "__DF_DUEL__";

export type AlibiDuelVerdict =
  | "diverges_value"   // both return; outputs differ beyond 1e-6
  | "diverges_error"   // ghost raises where the reference returned
  | "diverges_timeout" // ghost exceeded the line budget
  | "same"             // both returned and are equal
  | "input_invalid"    // inputText is not a Python literal
  | "ref_error"        // reference did not return (never expected on curated data)
  | "harness_error";   // no/malformed marker line

export interface AlibiDuelOutcome {
  readonly verdict: AlibiDuelVerdict;
  /** repr() of the reference output, truncated to 400 chars; null when unknown. */
  readonly ref: string | null;
  /** repr() of the ghost output / "Name: msg", truncated; null when unknown. */
  readonly ghost: string | null;
}

export function buildDuelHarness(args: {
  reference: string;
  ghost: string;
  func: string;
  inputText: string;
  budget?: number; // defaults to ALIBI_LINE_BUDGET
}): string;

export function parseDuelStdout(stdout: string): AlibiDuelOutcome;

export function validateAlibiInput(text: string):
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: string };

/** Render a JSON-compatible value as a Python literal (true→True, null→None, ...). */
export function pythonLiteral(value: unknown): string;

/** Contiguous line diff: first/last differing indices; identical → both empty. */
export function diffProgramLines(reference: string, ghost: string): {
  readonly removed: readonly string[];
  readonly added: readonly string[];
};

/** Fixed UI copy per verdict; no clocks, no randomness. */
export function describeOutcome(outcome: AlibiDuelOutcome, func: string): string;
```

**Semantics and determinism.**

- `buildDuelHarness` returns a self-contained Python 3 program. Identical args ⇒ byte-identical
  output (tested). It embeds `reference`, `ghost`, `func`, `inputText` via `JSON.stringify` (a
  valid Python string-literal subset), then: parses the input with `ast.literal_eval` (no code
  execution from the learner); `exec`s each program into its own namespace; runs the reference
  first, then the ghost, under a shared `sys.settrace` **line** budget reset per call, raising a
  `BaseException` subclass so learner code cannot swallow it; redirects stdout during calls;
  compares full values with the same 1e-6 deep-equality as `py_verify.py`/the Pyodide harness; and
  prints exactly one line: `ALIBI_MARK + json.dumps({verdict, ref, ghost})`. Reprs are truncated
  to 400 chars **after** comparison.
- `parseDuelStdout` takes the last line starting with `ALIBI_MARK`, JSON-parses the suffix;
  missing/malformed ⇒ `harness_error`.
- `validateAlibiInput` rejects empty/whitespace and `> 2000` chars with a fixed reason; everything
  else is accepted — Python's `literal_eval` is the single authority on validity.
- `pythonLiteral` handles booleans, null, finite numbers, strings, arrays, plain objects; used to
  prefill inputs and render tests. Deterministic.
- `diffProgramLines` is a prefix/suffix scan; on the curated data it always yields 1 removed and 1
  added line.
- The module imports only a type; it never touches `window`, `document`, `Date`, `Math.random`, or
  any store.

### 3.4 `src/components/alibi/AlibiHunt.tsx` (new; `"use client"`)

`export function AlibiHunt(): JSX.Element` — no props. Internal `AlibiCard` per puzzle. Reads
`ALIBI_PUZZLES`, keeps `selectedId`, `found: Set<string>`, `revealed: Set<string>`, and
`attempts: Record<string, number>` in React state (session-only). On the first "Run my input" it
`await import("@/lib/pyodide")`, calls `loadPyodideOnce()` and `runCode(py, buildDuelHarness(...))`,
then `parseDuelStdout(result.stdout)`; a `runCode` error or `harness_error` renders a neutral
message. "Show me" runs the stored `witness` through the same path and marks the puzzle revealed.
No other side effects.

### 3.5 `src/app/alibi/page.tsx` (new)

Server component: `metadata` (title/description/canonical/OG, mirroring
`src/app/inventions/page.tsx`) and `<PageShell title="Silent Bug Hunt" description="...">` wrapping
`<AlibiHunt />`. Exactly one `<h1>` via `PageShell`.

## 4. Data plan

**Provenance and reproduction (one-time, scratch):** for every affected problem in
`w41/chunk-*.jsonl`, take the alibi with the largest witness set; reconstruct `ghost` with
`engine.generate_mutants(solution, seed=int(md5(id)[:6], 16))` and the probe bank with
`engine.probe_bank(test_inputs, seed=int(md5(id)[:8], 16))`; classify up to 3 witnesses as
crash > value > timeout and drop timeout-only candidates; per category take the top 30 by witness
count then line count; round-robin 64 crash + 32 value; sort Easy→Hard then id; take 96. Store
`reference = ast.unparse(ast.parse(solution))` (the engine's round-trip control already guarantees
the unparsed reference passes `T`), `ghost` as mined, `witness = repr(validated witness)`, and the
shipped `tests`. The frozen output is `selected-96-final.json` in the engineer scratch dir; the
builders convert it to `puzzles.ts` with a scratch converter (deterministic key order: id, title,
category, difficulty, func, reference, ghost, witness, tests).

**Byte budget:** 116,944 B raw / 21,383 B gzip; the data-invariants test asserts
`sum(JSON.stringify(p).length) ≤ 130_000`. If the budget is missed, trim to 72 puzzles (drop the
Hard tail first) and update the test and the paper's curated-set table.

**Determinism:** static records; no clock, no randomness, no network. The only runtime input is the
learner's literal, and the harness is a pure function of it.

**Integrity gate (permanent):** `scripts/verify-alibis.ts` writes a temp JSON of
`{id, reference, ghost, func, tests, witness}` and shells to `scripts/py_alibi_verify.py`, which
asserts for every puzzle: reference passes all shipped tests; ghost passes all shipped tests; ghost
diverges from reference at `witness` (1e-6 deep-eq; error/timeout counts as divergence) under a
0.25 s alarm. Nonzero exit on any failure. This gate is what makes the content honest; it never
runs in the browser.

**Witness-domain pass (build step, author judgment):** before freezing, scan the 96 witness reprs
and replace any input that violates its statement's promised domain with an alternate witness from
`curated-all.json` (re-run the gate after any replacement); drop the puzzle and promote the next
candidate if no valid alternate exists. The count stays 96 unless a drop is unavoidable; update
the data test and paper table if it changes.

## 5. Route and UI surface

- **Route:** `/alibi`, static; no dynamic segments, no search params. Deep links via
  `#<puzzle-id>`; selection syncs to the hash with `history.replaceState` only (no router).
- **Layout:** 375px-first. One column; puzzle list (compact rows with difficulty/category chips and
  a session status dot) above a single active card; `prev`/`next` controls at the card foot.
- **Design tokens only** (`docs/DESIGN-SYSTEM.md`): `bg-canvas`, `bg-canvas-card`, `bg-canvas-soft`,
  `border-hairline`, `text-ink`, `text-body`, `text-body-mid`, `text-mute`, `text-accent`,
  `text-warning`/`text-error` for states; `rounded-lg`; `font-mono` for code, inputs, reprs;
  `max-w-6xl px-4 sm:px-6`; cards `rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5`;
  code uses `df-code-editor df-scroll` (read-only `<pre tabIndex={0} role="region">` so it is
  keyboard-scrollable), reveal uses `df-fade-in`.
- **Copy rules:** "passes all N shipped tests", "one line away from the reference DeepForge
  ships", "Practice only — nothing here affects your progress, review schedule, or certificates."
  Never "correct", "wrong", or "your code" for the ghost; always state divergence as a fact.
- **Accessibility:** the Run button reports `aria-busy`; outcomes render in an `aria-live="polite"`
  region; inputs have labels; tap targets follow existing button sizing; focus moves to the outcome
  on reveal.
- **Bundle discipline:** `@/lib/pyodide` is dynamically imported only on first run (pattern:
  `src/components/papers/PaperProjectRunner.tsx`). `ALIBI_PUZZLES` must stay out of shared chunks:
  `/stats` remains ≤417 kB gzip and must not grow; add `/alibi` to `scripts/measure-bundle.ts`
  `KEY_ROUTES` with `BUDGETS_KB["/alibi"] = 445`. If the build exceeds 445, move the records to
  `/public/alibi-puzzles.json` fetched on mount (precached by the SW) instead of embedding.
- **No new dependencies.** No new storage key, no sync/backup entry, no `ProblemView` changes.

## 6. Exact file plan

**New files**

| File | Content |
|---|---|
| `src/data/alibis/types.ts` | `AlibiPuzzle` (frozen, §3.1) |
| `src/data/alibis/puzzles.ts` | 96 records + provenance header |
| `src/data/alibis/index.ts` | re-export |
| `src/lib/alibiHunt.ts` | frozen API (§3.3) |
| `src/components/alibi/AlibiHunt.tsx` | client page body + card |
| `src/app/alibi/page.tsx` | server route + metadata + `PageShell` |
| `tests/alibiHunt.test.ts` | pure tests + data invariants + safety import scan |
| `scripts/verify-alibis.ts` | permanent Python-backed gate |
| `scripts/py_alibi_verify.py` | per-puzzle claims checker |
| `src/data/inventions/alibi-distance.ts` | paper #2 (see §7) |

**Touched files**

| File | Change |
|---|---|
| `src/data/inventions/index.ts` | add `ALIBI_DISTANCE` to `INVENTIONS` (newest first) |
| `src/app/sitemap.ts` | add `{ path: "/alibi", changeFrequency: "monthly", priority: 0.6 }` |
| `public/sw.js` | add `"/alibi"` to `PRECACHE_ROUTES`; bump `VERSION` to `"v9"` |
| `tests/offline.test.ts` | add `alibi: "/alibi"` to `STATIC_ROUTES` |
| `scripts/e2e-smoke.mjs` | add `"/alibi"` to `ROUTES`; add a `sitemap: alibi route` check next to the review check |
| `src/lib/quickActions.ts` | add `alibi-hunt` navigate action (`href: "/alibi"`) |
| `scripts/measure-bundle.ts` | add `"/alibi"` to `KEY_ROUTES`; `BUDGETS_KB["/alibi"] = 445` |
| `package.json` | add `"verify:alibis": "bun run scripts/verify-alibis.ts"` |
| `.github/workflows/ci.yml` | add the `verify:alibis` step after the problem-bank step |

`src/components/ProblemView.tsx`, `src/lib/bugHunt.ts`, `src/lib/spotBug.ts`, `src/lib/pyodide*`,
grading, review, certificates, and backup are **not touched**.

## 7. Paper plan — `/inventions` paper #2

- **File:** `src/data/inventions/alibi-distance.ts`; register in `src/data/inventions/index.ts`.
- **id/slug:** `alibi-distance`.
- **Title:** "Alibi Distance: The Nearest Silently-Passing Wrong Program in a Verified Exercise
  Corpus".
- **Authors:** `["DeepForge Research"]`; **date:** `"2026-09-18"`; **keywords:** mutation testing,
  test adequacy, exercise grading, mutation augmentation, counterexample, Python, education.
- **Corrected abstract (use verbatim):**

> Auto-graded exercises ship a reference program and a handful of tests. A program can pass every
> shipped test and still be wrong. We define the alibi distance α(p) as the minimum number of
> single-edit mutations of the reference that yields a program passing all shipped tests while
> diverging from the reference on a deterministic probe bank. Mining the DeepForge corpus (5,730
> exercises; 106,081 sampled mutants; 7,727 silent survivors) shows that 46.1% of analyzable
> problems admit a radius-1 alibi, and an independent engine over the same corpus reproduces every
> headline rate within 0.2 percentage points. A witness chosen on the full alibi set closes every
> alibi in 59.7% of affected problems and kills 73.2% of them, but a cross-validated witness
> (chosen on half the alibis) kills only 48.4%; the deployable, oracle-free estimate is therefore
> ~23.5% of problems still affected, not the oracle-chosen 18.6%. Two negative results: probe
> selection policies do not transfer better than random (63.3% vs 59.5% conviction within ten
> probes), and ≤2-literal input predicates reach 0.9 balanced accuracy for only 32.2% of alibis
> against a permutation control of 0.881. A blind audit of ten independently sampled alibis found
> 10/10 plainly wrong. We frame α as a property of the corpus and the edit model, not of learners:
> mutation–slip coupling is assumed, not measured, and a shadow-logging study is proposed. No
> grading path was modified; the shipped artifact is a curated set of 96 verified silent-bug
> practice puzzles.

- **Sections** (blocks per the `InventionBlock` union; use tables/figures as specified):
  1. **Introduction & motivation** — the finite-projection problem; the platform's honest-evidence
     claim; why offline/no-LLM matters; contributions list (census, α framing, audits, two
     negative results, curated practice set) with the E14 novelty statement.
  2. **Related work** — mutation testing and equivalent mutants; STING 2026 (same goal, LLM tests,
     SWE-bench); Examplar (student examples vs shipped suite); BugSpotter / "When AI Is Wrong on
     Purpose"; FPPgen and Katabench (mutant-as-practice); speccle ADR-0012; delta debugging;
     minimal pairs; machine teaching. State plainly that witness closure is textbook
     mutation-test augmentation.
  3. **Method** — setup `(S, f, T)`; edit families table (11 families; direction rule per family);
     probe bank construction (first three inputs, one-argument perturbation, md5 seed, cap 48,
     reference-evaluable only, mean 39.05 probes / 89.22% evaluable); sampling (≤36 mutants, ≤6 per
     family); `Pass`, `Diverge`, `Alibi`, `α` with the E7 semantics; mining algorithm and cost
     (~106k mutants, ~4.5–5M calls, ~27 CPU-min, ~4 min wall on 8 workers); the E1/E2 scope
     statement (fixed `D`, sampled `M`, no monotonicity across test sets).
  4. **Census results** — family table (§2 numbers), aperture slices (difficulty, length quartiles
     with survival, test count marginal and length-controlled), category table, witness
     distribution (22.78% singleton), probe-equivalent survivors. One bar figure: survival by
     family. One bar figure: `P(α=1)` by difficulty and by length quartile.
  5. **Closure: oracle vs deployable** — oracle witness (73.22% kill, 59.71% fully closed, 46.08%
     → 18.56%), greedy cost, CV held-out 48.35% (n=1,332 of 1,786), deployable ≈23.5–23.8%,
     radius-2 transfer (−31.6% vs random −6.1%), the E12 safety constraints and why nothing is
     auto-applied.
  6. **Two negative results** — probe-policy transfer (random 63.3% vs guided 59.5%, 0.94×) and
     predicate explanations (32.2% at BA≥0.9, control 0.881, 53.8% held-out beat control).
  7. **Audits and validity** — author n=10 (8 wrong / 1 immaterial / 1 subtle, not blind);
     independent blind n=10 (10/10 clearly wrong, selection method stated); coupling as an
     assumption; spec ambiguity; timeout hardware dependence; relativization to `(E, D)`;
     the P9 withdrawal and the length confound.
  8. **Product implications** — what was deliberately not shipped (auto-closure, examined solve,
     certificate gating) and what was shipped (the 96-puzzle Silent Bug Hunt; 64 crash / 32 value;
     one changed line each; session-only, non-gating).
  9. **Reproducibility** — seeds, constants, scratch provenance, the two-engine replication table,
     the `verify:alibis` gate.
  10. **Limitations & future work** — no human outcome data; shadow logging; content-hash caching
      and CI re-mining for changed problems; n≥100 audit.
- **References** (reuse from `invention-wave-41.md` §9): DeMillo/Lipton/Sayward 1978
  (`https://doi.org/10.1109/C-M.1978.218136`), Jia & Harman 2011
  (`https://doi.org/10.1109/TSE.2010.113`), Zeller & Hildebrandt 2002
  (`https://doi.org/10.1109/32.988498`), Goldman & Kearns 1995
  (`https://doi.org/10.1006/jcss.1995.1023`), Zhu 2015 (`https://arxiv.org/abs/1505.05192`), plus
  STING 2026, Examplar 2024, BugSpotter 2025, "When AI Is Wrong on Purpose" 2026, FPPgen 2024,
  Katabench, and speccle ADR-0012. **URL rule:** use the canonical DOI where listed; for the
  recent education/mutation works use the publisher/venue landing page, and if it cannot be
  verified, `https://scholar.google.com/scholar?q=<url-encoded exact title>` — never invent a URL.

## 8. Tests to write

**`tests/alibiHunt.test.ts` (fast, no Python, no DOM).**

1. Harness determinism: `buildDuelHarness(fixture)` twice ⇒ byte-identical; contains
   `ast.literal_eval`, `sys.settrace`, the budget constant, and `ALIBI_MARK`; embeds the exact
   reference/ghost strings (JSON round-trip via a Python-literal fixture).
2. `parseDuelStdout`: marker line parses; noise lines ignored; last marker wins; garbage/missing ⇒
   `harness_error`; each of the 7 verdicts round-trips.
3. `validateAlibiInput`: empty and 2001 chars rejected with reasons; `[1, 2]`, `"x"`, `3.5`,
   `True` accepted.
4. `pythonLiteral`: `true/false/null`, strings with quotes/newlines, nested arrays/objects; output
   parses back with `JSON.parse` after `True/False/None` normalization.
5. `diffProgramLines`: identical ⇒ empty; one changed line ⇒ 1 removed + 1 added; a multi-line
   change ⇒ contiguous slices.
6. Data invariants: exactly 96 puzzles; unique ids; `ghost !== reference`; `func` appears as
   `def <func>(` in both; witness non-empty and ≤200 chars; every `tests` non-empty;
   `sum(JSON.stringify(p).length) ≤ 130_000`; difficulty set is `Easy|Medium|Hard`; all 15
   categories present.
7. Safety scan: read `src/components/alibi/*.tsx`, `src/app/alibi/page.tsx`, and
   `src/lib/alibiHunt.ts` as text; assert none imports `@/lib/progress`, `@/lib/submissions`,
   `@/lib/runs`, `@/lib/reviewQueue`, `@/lib/certificates`, `@/lib/bugHunt`, `@/lib/spotBug`,
   or `@/lib/lgs`, and none contains `markSolved(` or `recordBugRound(`.

**`scripts/verify-alibis.ts` + `scripts/py_alibi_verify.py` (permanent gate).** For all 96
puzzles: reference passes `tests`; ghost passes `tests`; ghost diverges at `witness` (1e-6,
error/timeout counts); print a per-failure line and exit 1 on any failure; exit 0 with
`96/96 verified` otherwise.

**Existing tests updated:** `tests/offline.test.ts` (new static route ⇒ SW precache exact-list
test), and the e2e smoke route list. No other test should change; `bun test` must stay green.

## 9. Parallel tracks (exact write ownership)

| Track | Owns (writes) | Depends on |
|---|---|---|
| **A core** | `src/data/alibis/*`, `src/lib/alibiHunt.ts`, `tests/alibiHunt.test.ts` | — |
| **B gate** | `scripts/verify-alibis.ts`, `scripts/py_alibi_verify.py`, `package.json` (script only) | A (types frozen) |
| **C UI+route** | `src/components/alibi/*`, `src/app/alibi/page.tsx` | A |
| **D wiring** | `sitemap.ts`, `public/sw.js`, `tests/offline.test.ts`, `scripts/e2e-smoke.mjs`, `src/lib/quickActions.ts`, `scripts/measure-bundle.ts`, `.github/workflows/ci.yml` | C (route must exist) |
| **E paper** | `src/data/inventions/alibi-distance.ts`, `src/data/inventions/index.ts` | — (uses §2 numbers) |

Order: A freezes types and data; B, C, E run in parallel; D last. Per-track verification: **A**
`bun test tests/alibiHunt.test.ts && bunx tsc --noEmit`; **B** `bun run verify:alibis`; **C**
`bunx tsc --noEmit && bun run lint`; **D** `bun test tests/offline.test.ts` then, after build,
`bun run scripts/measure-bundle.ts --check`; **E** `bun test` (inventions/PDF projections).
Ship gate: `bun test && bun run lint && bunx tsc --noEmit && bun run verify:alibis && bun run
scripts/verify-problems.ts && bun run build && bun run scripts/measure-bundle.ts --check` plus the e2e smoke
against `next start -p 3099`. `/stats` must print the same 409.5 kB gzip as before the wave.

## 10. Day one, rollback, kill criteria

Day one: `/alibi` is reachable from the palette and the sitemap; the paper appears on
`/inventions`; nothing else in the product changes. Rollback: delete the route, the data, and the
wiring entries; no state exists to migrate, no store key to clean up.

Kill criteria: (1) `verify:alibis` reports any unverifiable puzzle after one repair attempt;
(2) `/stats` first-load JS grows by any amount, or `/alibi` exceeds 445 kB gzip with no data trim
available; (3) any alibi source imports a grading/progress/certificate module or writes a store;
(4) any UI copy claims a ghost is "wrong" or the mode affects progress; (5) the witness-domain pass
finds a puzzle whose witness cannot be replaced and the fallback count drops below 90.

## 11. Top risks

1. **Spec ambiguity in curated witnesses** (the one immaterial author-audit case was a 1e-6 clip
   change, already excluded by tolerance). Mitigation: machine gate + witness-domain pass + copy
   that states divergence as fact, never a verdict.
2. **Bundle creep.** The 21.4 kB gzip data is route-local; the safety scan and the `/stats`
   no-growth check are the guards. Mitigation: trim to 72 puzzles or move data to
   `/public/alibi-puzzles.json` (precached) if the budget fails.
3. **Worker hang on pathological input.** Literal-only inputs and the deterministic line budget
   bound Python-level loops; C-level nontermination is a documented residual risk with no
   wall-clock race by design (no `pyodide.ts` changes). Mitigation: 2000-char input cap; reload
   recovers the worker.
4. **Data staleness** if a shipped solution/test changes. Mitigation: `verify:alibis` fails in CI;
   re-mine only the changed problem (content-hash caching is the documented future automation).
5. **Overclaiming in the paper.** Mitigation: §2 numbers are the only ones allowed in
   `alibi-distance.ts`; the abstract is frozen above; E1–E16 rule.
