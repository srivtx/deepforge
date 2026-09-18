# Wave 43 blueprint — KeyFuse (final, implementable)

Status 2026-09-18. This document is the binding plan for wave 43. The corrections C1–C9 from the
three independent verifications (critic, correctness verifier, evidence verifier) are restated
here as ground truth; wherever an earlier KeyFuse draft differs, this document wins. **No product
code was written in this wave; this document is the plan.** Every count in this document is a
design target; the evidence script produces the measured numbers and the permanent gate freezes
them.

Chosen product: a **falsification-first cache-key auditor** (standalone, read-only,
browser-local) whose contribution is (1) the **minimal collision witness** — a machine-checked
same-key / different-output pair with a verified 1-minimal difference set — and (2) **key repair**
as the intervention artifact: when inputs cannot be declared properly (third-party plugin,
generated config, vendored tool), emit `key = H(declared ∪ implicated)` as a conservative
over-approximation of *detected* dependence. The positioning is **not** "sound key synthesis".

---

## 1. Corrected one-sentence claims and the not-claimed list

**Falsifiable core (verbatim, the ceiling for paper and copy):**

> Given a deterministic oracle `f` over a finite typed slot universe with baseline `b` and a
> declared key `K`, if every output difference is anchored to `b` (every changing pair has a
> ≤t-support displacement from `b` that includes a differing slot), then probing every assignment
> within Hamming distance `t` of `b` detects exactly the slots that participate in ≤t-support
> baseline effects; the shipped instrument instead runs a strength-`t` covering array
> (`O(v^t log n)` rows), delta-debugs every changing row, verifies **per-slot witness-context
> necessity**, and certifies only: *"no detected ≤t-support effect at covered tuples"* — never
> soundness, never completeness.

**Corrections, restated (C1–C9).**

| # | Status | Statement to use everywhere |
|---|---|---|
| C1 | **FALSE as originally stated.** Replaced by the adversarial-array test. | A strength-`t` covering array compared against the all-default baseline does **not** detect every ≤t-support effect (masking). Counterexample (n=3, b=(0,0,0), `f = (a AND b) XOR c`): a strength-2 array may realize `(a=1,b=1)` only with `c=1`, where output equals baseline, so the pair is missed. The gate pins a hand-built adversarial array proving this, and `cover-with-defaults` finding it. |
| C2 | **TRUE theorem, stated as a theorem.** | If every slot domain is totally ordered with baseline minimum and `f` is coordinatewise monotone, then a strength-`t` covering array over `{baseline, top}` detects all ≤t-support baseline effects at `O(v^t log n)` runs. Proof sketch: monotonicity makes any ≤t-support displacement with an effect detectable by *some* row that sets a superset of its support to `top`, and the array covers every t-subset combination. |
| C3 | **TRUE; this is the exact baseline.** | Exact detection of all ≤t-support baseline effects requires querying every point within Hamming distance `t` of the baseline: cost `Theta(sum_{j<=t} C(n,j) (v-1)^j)` (uniform `v`); for per-slot value counts, `sum over subsets S with card(S)<=t of prod_{i in S} (v_i - 1)` non-baseline points. `cover-with-defaults` is the exact general method; a strength-`t` CA is a cheap approximation whose misses **must be reported**. |
| C4 | **TRUE; the shipped contract.** | General cheap repair: run a strength-`t` CA (`O(v^t log n)` rows) and delta-debug every row whose output differs from baseline to isolate a minimal witness; `N = O(v^t log n + r*n)` oracle calls for `r` changing rows. The certificate is strictly weaker: "no detected <=t effect at covered tuples", **never soundness**. |
| C5 | **FALSE as originally stated; carries an explicit assumption.** | Union-of-implicated-slots is **not** sound without anchoring. Counterexample: `f = 1 iff abs(x) >= 3`, n=4, t=2, b=0 — every slot is globally relevant, yet no ≤2-support displacement from `b` changes output, so a key built from detections is empty and `(1100)` collides with `(1110)`. **Anchor assumption (stated in code, paper, and UI):** every output difference must have a witness reachable by a ≤t-support displacement from baseline that includes a differing slot. This is an assumption, not a theorem. |
| C6 | **Correct minimality check.** | 1-minimality with respect to array rows is **not** global minimality. The correct check is **per-slot necessity using the recorded witness pair** (differ only at `i`, all other coordinates at the witnessed context), `O(card(K))` runs — stronger and cheaper than row replay. |
| C7 | **HOLDS; motivating lemma only.** | Toggle/trace unsoundness: toggle counterexample `f = a AND b` with defaults `(0,0)`, sentinels `(1,1)`; trace-scope counterexample `f = concat(sorted contents of *.cfg)` traced when only `a.cfg` exists. These motivate KeyFuse; they are not theorems about the shipped instrument. |
| C8 | **Practical limits, stated.** | Determinism is required; untrappable reads (native/mmap/subprocess/network) break universe closure; perturbation can expose new slots, so iterate trace→perturb→retrace to a fixpoint; 2 values per slot miss value-specific effects (`f = 1 iff port == 8080`) — use boundary/random sentinels and accept no guarantee; >t-way effects are invisible by construction; clock/RNG slots drive hit rate to zero if high-entropy. |
| C9 | **Minimizer honesty.** | Key-equality is monotone under shrinking non-key coordinates, but output-difference is **not** monotone, so ddmin's 1-minimality guarantee does not strictly apply; verify by **exhaustive single-coordinate removal** (`card(D)` runs per pass). Oracle calls `O(card(D)^2)` worst case, typically `card(D) log card(D)`. |

**Explicit not-claimed list** (must appear in the paper, the UI caveat, and the engine docblock; a
source-scan test enforces the first four strings):

- No "sound key synthesis", no soundness.
- No completeness.
- No "finds all collisions".
- No "beats sandboxing on file reads" (sandboxes see file reads; KeyFuse is for slots sandboxes
  and file tracing cannot see: env, cwd, locale, timezone).
- No guarantee for non-monotone `f` without the anchor assumption.
- No guarantee for value-specific effects the probe domains do not realize.
- No security boundary: the key hash is a 64-bit FNV construction, not cryptographic.
- Deterministic-oracle assumption is explicit; non-determinism refuses rather than guesses.

---

## 2. Mechanism and pipeline

### 2.1 Typed slot universe

A slot is `kind:id` over seven kinds. Slot names are frozen strings.

| Kind | Name form | Value semantics | Native traps |
|---|---|---|---|
| `file` | `file:<relpath>`; directory listing is `file:<dir>/` (trailing slash) | content string; listing value = sorted names joined by newline | read wrapper / fs facade |
| `env` | `env:<NAME>` | variable value; absence is the distinct sentinel string `A` + NUL + `absent`, never confused with empty | env Proxy |
| `cwd` | `cwd` | absolute-path string as seen by the task | injected `process.cwd()` |
| `locale` | `locale` | e.g. `C`, `en_US.UTF-8` | injected `Intl`/env facade |
| `timezone` | `timezone` | e.g. `UTC`, `America/New_York` | injected `Intl`/env facade |
| `rng` | `rng` | seed string; `env.rng()` returns the first draw of `mulberry32(fnv1a32("rng:" + value))` | injected randomness facade |
| `clock` | `clock` | epoch-ms integer string; `env.now()` returns `Number(value)` | injected clock facade |

Every slot has `baseline`, `top`, and optional `sentinels` values. The universe is finite, typed,
and validated (`validateUniverse`): unique names, non-empty baseline/top, baseline minimum for
`ordered` slots, `n <= KEYFUSE_MAX_SLOTS`. Slots outside the universe do not exist; a task that
reads an undeclared or unknown slot is a miss, not a silent default (the adapters record the name
and the audit reports `misses`).

### 2.2 Tracer adapters

Two adapters implement one interface: `(assignment) -> OracleRun {outcome, reads, trapped,
notes}`.

1. **Virtual adapter (browser, tests, gate).** `createVirtualOracle(task: VirtualTask)` executes
   the task's pure `run(env, ambient)` with a recording `TracedEnv`. Every read goes through the
   facade, so reads are exact by construction. `ambient` is a second, deliberately untrapped
   record; the adapter re-runs once with a shifted ambient value and sets `trapped:false` when
   the output moves with no recorded slot read. No `Date`, no `Math.random`, no storage, no DOM.
2. **Node facade adapter (scripts and tests only).** `createNodeOracle(task, {root, ambient})`
   evaluates the repo-authored fixture `source` with `new Function("fs", "process", "env",
   source)` (repo fixtures only — untrusted source is out of scope by contract) and injects:
   - a **patched `fs` facade** whose `readFileSync` / `readdirSync` / `existsSync` / `statSync`
     map to real files under `root` (a `mkdtemp` directory) and record `file:` reads with paths
     normalized relative to `root`;
   - a **`process.env` Proxy** backed by the assignment;
   - the same `TracedEnv` facade for `cwd` / `locale` / `timezone` / `rng` / `clock`.

   This is *facade interposition*, not OS syscall interception; `strace`/`ptrace`-class capture
   is out of scope and is recorded as a residual (C7/C8). The adapter never leaves `root`, never
   spawns processes, and never touches the network.

**Determinism gate.** Before any probing, the core runs `oracle(baseline)` twice and one
perturbed row twice. Any output difference sets `deterministic=false`, zero detections, and
`misses` gets `"oracle nondeterministic at baseline"` (negative control (e)). The check is
sampled, not exhaustive; the paper says so.

### 2.3 Probing strategies

All strategies return the same `ProbeRow[]` shape and a run count.

| `ProbeStrategy` | Rows | Detects | Role |
|---|---|---|---|
| `baseline-toggle` | `1 + n` (baseline + one slot→top each) | ≤1-support effects at baseline | the "what teams already do" baseline; misses masked combos |
| `single-trace` | `1` | only reads taken at baseline | the "file tracer / sandbox log" baseline; blind to env/cwd/locale/timezone and to un-taken branches |
| `ca` | `1 + CA(t)` rows | ≤t effects realized by the array; **no minimization, over-implicates** | evidence arm showing false implicates |
| `ca-ddmin` (**default**) | `1 + CA(t) + O(r*n)` | ≤t effects + verified witnesses + per-slot necessity | shipped strategy |
| `cover-with-defaults` | `1 + sum over subsets S with card(S)<=t of prod (v_i - 1)` | **exact** for ≤t effects under the anchor assumption | ground-truth reference in evidence; UI "exact" mode when within budget |

**Covering-array construction.** Deterministic AETG-style greedy, no RNG: seed rows from each
uncovered non-trivial t-tuple in slot-name order, extend remaining slots choosing the value
(`baseline`/`top`) that covers the most still-uncovered tuples, tie-break by slot order then
value order. `verifyCoverage` asserts every non-trivial t-way tuple appears in some row (the
all-baseline tuple is covered by the baseline run). Size is reported, not claimed minimal;
observed sizes feed the paper's scaling figure.

**Delta debugging of a changing row.** For row `r` with difference set `D = differing(r, b)`:
ddmin-split `D` by slot-name-sorted halves, collapsing coordinates to baseline, keeping output
different from baseline output; then **verify 1-minimality by exhaustive single-coordinate
removal** against the baseline-context oracle. `oneMinimal = true` only when every single removal
restores the baseline output. Non-monotone output differences can make ddmin stop early or
overshoot; the exhaustive pass is the contract (C9).

**Implication and per-slot necessity (C6).** For each changing row `r`, for each `i` in `D(r)`,
run `collapse(r, i)` (all other coordinates at `r`'s values). If `output(collapse(r, i))` differs
from `output(r)`, then `i` is **necessary at `r`'s witness context** and is implicated. The pair
`(r, collapse(r, i))` differs only at `i` and is the recorded witness; `keyCollision` is true when
the declared-key values of the pair are equal (always true when `i` is not declared). This is the
minimal collision witness the product prints. `ca` (no minimization) implicates every slot in
`D` and is the false-implicate arm.

### 2.4 Repair

`implicated = { i : some changing row has i necessary at its witness context }`.
`repairedInputs = sorted(declared ∪ implicated)`.
`repairedKey = keyfuseKey(taskId, taskVersion, repairedInputs, witnessContext)` — a 16-hex
`keyfuseHash` over `taskId`, version, and the sorted inputs with their witness-context values.
`repairedKey` is a **conservative over-approximation of detected dependence**: it includes
everything the audit saw, not everything that exists. Separation is checked per witness: original
declared keys equal and outputs differ must imply repaired keys differ. If they do not, the audit
reports a residual collision, never hides it.

Intervention story (paper + UI): when a third-party plugin or generated config cannot declare its
inputs, ship the repaired key; it is strictly more conservative than the declared key and it is
backed by the printed witness, so the cost (more cache misses) is visible and bounded.

### 2.5 Trace → perturb → retrace fixpoint

Some reads only happen after a perturbation (C8). The audit loop (max `KEYFUSE_FIXPOINT_PASSES`
= 3 passes): run `single-trace` at baseline → run `ca-ddmin` → for every new slot name observed
in any probe read set, add it to the implicated set and re-run the CA once. Converged = no new
slot names; otherwise `misses` gets `"trace fixpoint not reached in 3 passes"` and
`truncated=true`. Deterministic and budget-bounded.

### 2.6 Budget and certificates

`KEYFUSE_MAX_RUNS = 4096` oracle calls per audit. When exceeded, the audit stops at a row
boundary, sets `truncated=true`, and the certificate becomes "budget exhausted before coverage
completed". The default certificate string is exactly:
`no detected <=t-support effect at covered tuples`. UI copy never strengthens it.

---

## 3. Frozen API

Zero new dependencies. The pure core has **zero imports from `node:` or any app module** (only
intra-directory relative imports); `nodeAdapter.ts` is the single Node-touching file and is never
imported by browser code or the pure core.

### 3.1 Module layout (`src/lib/keyfuse/`)

| File | Contents | Imports |
|---|---|---|
| `types.ts` | all shared types | none |
| `hash.ts` | `fnv1a32`, `keyfuseHash`, `canonicalJson`, `auditDigest` | none |
| `slots.ts` | slot names, universe validation, assignment helpers | `./types` |
| `cover.ts` | greedy CA, cover-with-defaults, coverage verify, Hamming size | `./types`, `./slots`, `./hash` |
| `trace.ts` | `TracedEnv`, `createVirtualOracle`, read recording | `./types`, `./hash` |
| `probe.ts` | the five strategies -> `ProbeOutcome` | `./types`, `./slots`, `./cover`, `./hash` |
| `minimize.ts` | ddmin + exhaustive 1-minimality verify + per-slot necessity | `./types` |
| `repair.ts` | implication union, repaired key, witness separation | `./types`, `./slots`, `./hash` |
| `audit.ts` | `auditTask` facade; fixpoint loop; certificates | all of the above except `nodeAdapter` |
| `tasks.ts` | 24 built-in `VirtualTask`s + `METRO_NODE_TASK` (pure data) | `./types`, `./hash` |
| `index.ts` | public re-exports + constants | re-export only |
| `nodeAdapter.ts` | `createNodeOracle` (Node-only) | `node:fs`, `node:os`, `node:path`, `./types`, `./trace` |

### 3.2 Constants

```ts
export const KEYFUSE_VERSION = 1;
export const KEYFUSE_MARK = "__DF_KEYFUSE__";      // evidence/gate JSON marker
export const KEYFUSE_MAX_SLOTS = 12;               // toy corpus bound; 2^n brute force allowed
export const KEYFUSE_MAX_STRENGTH = 3;
export const KEYFUSE_DEFAULT_STRENGTH = 2;
export const KEYFUSE_MAX_RUNS = 4_096;             // hard oracle-call budget per audit
export const KEYFUSE_EXACT_MAX_ROWS = 2_048;       // cover-with-defaults only under this
export const KEYFUSE_FIXPOINT_PASSES = 3;
export const KEYFUSE_CERTIFICATE = "no detected <=t-support effect at covered tuples";
export const KEYFUSE_CERTIFICATE_TRUNCATED = "budget exhausted before coverage completed";
```

### 3.3 Types (frozen)

```ts
export type SlotKind = "file" | "env" | "cwd" | "locale" | "timezone" | "rng" | "clock";
export interface SlotSpec {
  readonly kind: SlotKind;
  readonly id: string;                      // relative path, variable name, or "" for singletons
  readonly baseline: string;
  readonly top: string;
  readonly sentinels?: readonly string[];   // boundary values, optional
  readonly ordered?: boolean;               // true only when baseline is the minimum (C2)
}
export interface SlotUniverse { readonly slots: readonly SlotSpec[]; }
export type Assignment = Readonly<Record<string, string>>;   // slot name -> value
export interface SlotRead { readonly slot: string; readonly value: string; }

export interface TracedEnv {
  readFile(path: string): string;                  // records file:<path>
  listDir(dir: string): readonly string[];         // records file:<dir>/ (sorted names)
  exists(path: string): boolean;                   // records file:<path>
  env(name: string): string;                       // records env:<NAME>; absent -> sentinel
  cwd(): string;                                   // records cwd
  locale(): string;                                // records locale
  timezone(): string;                              // records timezone
  rng(): number;                                   // records rng; deterministic draw from value
  now(): number;                                   // records clock; Number(value)
}

export interface KeyFuseTask {
  readonly id: string;
  readonly version: string;                        // bump invalidates witness/evidence digests
  readonly declared: readonly string[];
  readonly universe: SlotUniverse;
  readonly baseline: Assignment;
}
export interface VirtualTask extends KeyFuseTask {
  readonly kind: "virtual";
  readonly run: (env: TracedEnv, ambient: Readonly<Record<string, string>>) => string;
}
export interface NodeTask extends KeyFuseTask {
  readonly kind: "node";
  readonly source: string;                         // repo-authored CommonJS-style fixture
  readonly entry: string;
}
export type TaskDefinition = VirtualTask | NodeTask;

export type OracleOutcome =
  | { readonly ok: true; readonly output: string }
  | { readonly ok: false; readonly reason: "error" | "nondeterministic" };
export interface OracleRun {
  readonly outcome: OracleOutcome;
  readonly reads: readonly SlotRead[];
  readonly trapped: boolean;                       // false = untrapped read suspected
  readonly notes: readonly string[];
}
export type TaskOracle = (assignment: Assignment) => OracleRun;

export type ProbeStrategy =
  | "baseline-toggle" | "single-trace" | "ca" | "ca-ddmin" | "cover-with-defaults";
export interface ProbeOptions {
  readonly strategy: ProbeStrategy;
  readonly strength?: number;                      // default KEYFUSE_DEFAULT_STRENGTH
  readonly budget?: number;                        // default KEYFUSE_MAX_RUNS
  readonly verifyMinimal?: boolean;                // default true for ca-ddmin
}
export interface ProbeRow {
  readonly index: number;
  readonly assignment: Assignment;
  readonly differing: readonly string[];           // slots unlike baseline
  readonly output: string;
  readonly changed: boolean;                       // output !== baseline output
}
export interface WitnessPair {
  readonly left: Assignment;                       // recorded row (witness context)
  readonly right: Assignment;                      // left with one slot collapsed
  readonly differing: readonly string[];           // exactly one slot
  readonly outputLeft: string;
  readonly outputRight: string;
  readonly originalKeyLeft: string;                // key over declared inputs
  readonly originalKeyRight: string;
  readonly repairedKeyLeft: string;                // key over declared ∪ implicated
  readonly repairedKeyRight: string;
  readonly keyCollision: boolean;                  // original keys equal and outputs differ
  readonly separated: boolean;                     // repaired keys differ
}
export interface MinimizedWitness {
  readonly row: ProbeRow;
  readonly support: readonly string[];             // minimized difference set vs baseline
  readonly oneMinimal: boolean;                    // verified by exhaustive single removal
  readonly passes: number;
  readonly verifyRuns: number;
}
export interface Detection {
  readonly slot: string;
  readonly kind: SlotKind;
  readonly witness: WitnessPair;                   // per-slot witness-context pair
  readonly minimized: MinimizedWitness | null;     // row-level minimized support
  readonly necessary: true;                        // only context-necessary slots are emitted
}
export interface RepairResult {
  readonly declared: readonly string[];
  readonly implicated: readonly string[];
  readonly repairedInputs: readonly string[];
  readonly separateWitnesses: number;
  readonly collisionWitnesses: number;
  readonly residualCollisions: readonly string[];  // witness ids whose repair did not separate
}
export interface AuditResult {
  readonly task: string;
  readonly version: string;
  readonly strategy: ProbeStrategy;
  readonly strength: number;
  readonly deterministic: boolean;
  readonly trapped: boolean;
  readonly probes: readonly ProbeRow[];
  readonly tracedReads: readonly string[];
  readonly detections: readonly Detection[];
  readonly repair: RepairResult;
  readonly certificate: string;
  readonly misses: readonly string[];
  readonly runs: number;
  readonly truncated: boolean;
  readonly digest: string;                         // auditDigest(this minus digest)
}
```

### 3.4 Functions (frozen)

```ts
// hash.ts
export function fnv1a32(input: string): number;
export function keyfuseHash(input: string): string;        // 16 lowercase hex chars
export function canonicalJson(value: unknown): string;     // sorted keys, stable numbers
export function auditDigest(result: Omit<AuditResult, "digest">): string;

// slots.ts
export function slotName(spec: SlotSpec): string;
export function slotValues(spec: SlotSpec): readonly string[];      // [baseline, top, ...sentinels]
export function validateUniverse(universe: SlotUniverse): readonly string[];
export function baselineAssignment(universe: SlotUniverse): Assignment;
export function assignmentWith(base: Assignment, changes: Readonly<Record<string, string>>): Assignment;
export function differingSlots(a: Assignment, b: Assignment, universe: SlotUniverse): readonly string[];
export function collapse(assignment: Assignment, slot: string, universe: SlotUniverse): Assignment;

// cover.ts
export function buildCoveringArray(universe: SlotUniverse, t: number): readonly Assignment[];
export function buildCoverWithDefaults(universe: SlotUniverse, t: number): readonly Assignment[];
export function verifyCoverage(universe: SlotUniverse, t: number, rows: readonly Assignment[]): {
  readonly complete: boolean; readonly missing: readonly string[];
};
export function hammingBallSize(universe: SlotUniverse, t: number): number;

// trace.ts
export function createVirtualOracle(task: VirtualTask): TaskOracle;
export function readSlotNames(run: OracleRun): readonly string[];

// probe.ts
export interface ProbeOutcome {
  readonly rows: readonly ProbeRow[];
  readonly tracedReads: readonly string[];
  readonly runs: number;
  readonly truncated: boolean;
  readonly misses: readonly string[];
}
export function runProbe(task: KeyFuseTask, oracle: TaskOracle, options: ProbeOptions): ProbeOutcome;

// minimize.ts
export function minimizeRowSupport(args: {
  readonly task: KeyFuseTask; readonly oracle: TaskOracle;
  readonly row: ProbeRow; readonly baselineOutput: string;
  readonly verifyMinimal: boolean; readonly budget: number;
}): { readonly minimized: MinimizedWitness; readonly runs: number; readonly misses: readonly string[] };
export function checkNecessity(args: {
  readonly task: KeyFuseTask; readonly oracle: TaskOracle;
  readonly row: ProbeRow; readonly slot: string;
}): { readonly necessary: boolean; readonly pair: WitnessPair; readonly runs: number };

// repair.ts
export function buildRepair(args: {
  readonly task: KeyFuseTask; readonly detections: readonly Detection[];
}): RepairResult;
export function keyfuseKey(task: { readonly id: string; readonly version: string },
  inputs: readonly string[], assignment: Assignment): string;

// audit.ts
export function auditTask(task: TaskDefinition, oracle: TaskOracle, options?: ProbeOptions): AuditResult;

// tasks.ts
export const KEYFUSE_TASKS: readonly VirtualTask[];
export const METRO_NODE_TASK: NodeTask;
export function getKeyFuseTask(id: string): VirtualTask | undefined;

// nodeAdapter.ts (Node-only)
export function createNodeOracle(task: NodeTask, options: {
  readonly root: string;                            // created by caller (mkdtemp)
  readonly ambient?: Readonly<Record<string, string>>;
}): TaskOracle;
```

**Core invariants (tests enforce):** identical inputs produce byte-identical
`canonicalJson(audit)`; `keyfuseHash` has fixed vectors; no `Date`, `Math.random`, `window`,
`document`, `localStorage`, `fetch`, `node:` import, or dynamic `import(` in the pure files;
`auditTask` never mutates its inputs.

---

## 4. Corpus and evidence plan

### 4.1 Toy corpus (24 pure tasks, `n <= 12`, brute force `2^n` allowed)

All tasks are deterministic pure functions of `(assignment, ambient)`; the ground truth is the
exhaustive product of `[baseline, top]` per slot (plus the port sentinel for #14).

| # | id | family | n | declared | decisive property |
|---|---|---|---:|---|---|
| 1 | `metro-env-1` | combo-env | 3 | `env:BUILD_MODE`, `file:project.json` | output `prod:${API_URL}:${file}` when mode is prod, else `dev`; same declared key, two API_URLs; the required (a) demo |
| 2 | `metro-env-2` | combo-env | 4 | `env:BUILD_MODE` | 2-way gate plus an unrelated no-dependence slot |
| 3 | `metro-file-gate` | combo-env | 3 | `file:metro.config.js` | undeclared file gates undeclared env; trace blind at baseline |
| 4 | `and-2way` | planted-2way | 4 | `env:A` | `f = A AND B`; t=2 finds B, t=1 misses |
| 5 | `xor-2way` | planted-2way | 4 | `env:A` | `f = A XOR B` |
| 6 | `and-3way` | planted-3way | 5 | `env:A` | `f = A AND B AND C`; t=2 must miss C, t=3 must find |
| 7 | `maj-3way` | planted-3way | 5 | `env:A` | `f = majority(A,B,C)` |
| 8 | `and-xor-c` | masking (C1) | 3 | none | `f = (a AND b) XOR c`; pinned adversarial CA misses (a,b) |
| 9 | `or-and-not` | masking (C1) | 4 | none | second masking shape |
| 10 | `or-threshold` | monotone (C2) | 4 | all | monotone threshold; CA(t) must be exact |
| 11 | `max-threshold` | monotone (C2) | 5 | all | ordered domains, baseline minimum |
| 12 | `and-chain` | monotone (C2) | 4 | all | monotone conjunction chain |
| 13 | `threshold-3` | anchor (C5) | 4 | none | `f = 1 iff abs(x) >= 3`; t=2 finds nothing; residual collision `(1100)` vs `(1110)` documented |
| 14 | `port-8080` | value-specific (C8) | 6 | `env:HOST` | `f = 1 iff PORT == "8080"`; sentinel required; binary miss reported |
| 15 | `undeclared-secret` | env-only | 3 | none | one undeclared env var, no file involvement; file tracing sees nothing (d) |
| 16 | `combo-with-file` | env-only | 4 | `file:cfg` | env + file interaction, env undeclared |
| 17 | `cwd-dependent` | cwd | 3 | `env:MODE` | output depends on cwd path |
| 18 | `locale-tz` | locale-tz | 4 | `env:MODE` | locale + timezone not visible to file tracing |
| 19 | `epoch-gated` | clock | 3 | `env:MODE` | effect gated on clock slot; deterministic through assignment |
| 20 | `seed-gated` | rng | 3 | `env:MODE` | effect gated on rng slot; deterministic through assignment |
| 21 | `nondeterministic-counter` | negative | 3 | none | reads an ambient tick not exposed as a slot; oracle must refuse |
| 22 | `untrappable-ambient` | negative | 3 | none | reads `ambient` directly; `trapped:false` miss, no implicate |
| 23 | `no-dependence` | control | 4 | all | constant output; zero detections, zero false implicates |
| 24 | `all-declared` | control | 4 | all | every real dependence declared; repaired key equals declared key |

Task functions for #1–#3, #6, #8, #10, #13, #14, #21–#22 are frozen in the descriptions above;
the remaining tasks follow family templates B2 implements and tests.

### 4.2 Ground truth

For each task: enumerate `2^n` assignments (plus sentinels where declared) and compute
- `relevantT(t)` = slots differing from baseline in any assignment `a` with `f(a) != f(b)` and
  Hamming distance `d_H(a,b) <= t`;
- `relevantGlobal` = slots `i` for which some pair differing only at `i` has different outputs;
- all colliding pairs with equal declared key and different outputs (for repair scoring);
- `residualCollisionPairs` for the anchor task #13.

Brute force is exact; no sampling is needed at `n <= 12`.

### 4.3 Decisive experiments (binding; maps the critic's required evidence (a)–(e))

| Exp | Setup | Expected outcome (gate enforces) |
|---|---|---|
| (a) Metro end to end | `metro-env-1`; assignments `P1=(prod, staging)`, `P2=(prod, production)`, same declared key; run all five strategies; then the Node facade adapter in a `mkdtemp` project pair | `baseline-toggle`: no API_URL detection (only BUILD_MODE flips change output); `single-trace`: API_URL never read at baseline; `ca(2)+ddmin`: API_URL implicated, witness pair differs only at `env:API_URL`, original keys equal, outputs differ, `oneMinimal=true`; repaired key contains BUILD_MODE + API_URL and separates P1/P2; Node and virtual adapters agree on the detection set |
| (b) planted interactions | `and-2way` / `xor-2way` (2-way) and `and-3way` / `maj-3way` (3-way) | `ca(2)` detects exactly the 2-way supports and misses the 3-way slot (miss reported); `ca(3)` detects all; `cover-with-defaults` matches ground truth for both; run-count table vs exhaustive `2^n` |
| (c) minimal witness | every changing row across the corpus | every emitted witness verifies 1-minimal by exhaustive single-coordinate removal; `verifyRuns` equals the support size for the final pass; a non-monotone case (#8) demonstrates ddmin alone can stop early and the verifier catches it |
| (d) env invisible to file tracing | `undeclared-secret`, `combo-with-file` | `single-trace` read set contains only `file:` names; the audit detects the `env:` slot; evidence flags `envDetectionsWithNoFileTrace >= 1` |
| (e) negative controls | `nondeterministic-counter`, `untrappable-ambient` | nondeterministic: `deterministic=false`, `detections=[]`, `misses` includes the refusal, no `clock` implicate; untrappable: `trapped=false`, documented miss, no implicate |

### 4.4 Metrics (frozen names)

`missedRelevant`, `falseImplicates`, `collisionsRemaining`, `probes`, `runs`,
`witnessesVerified`, `certificateMisses`. Evidence table rows = (strategy × task family) with all
seven columns plus the exhaustive `2^n` count as the reference. `missedRelevant` uses
`relevantT(t)` as the denominator; `falseImplicates` uses `relevantGlobal`;
`collisionsRemaining` counts enumerated equal-original-key / different-output pairs that remain
equal under the repaired key.

### 4.5 Evidence script

`scripts/keyfuse-evidence.ts` (Bun, no Python, no network): runs every strategy over the 24-task
corpus, computes ground truth by brute force, writes `deepforge-keyfuse-evidence.json` to
`os.tmpdir()` (override `DF_KEYFUSE_SCRATCH`) and prints a table. Expected runtime **<= 30 s**
locally (hard budget 60 s); the bulk is roughly 24 × 4096 evaluations of tiny pure functions plus
minimizer verification. `--verbose` prints per-task rows.

---

## 5. Permanent gate plan

### 5.1 `scripts/verify-keyfuse.ts`

Self-contained, deterministic, no Python, no child processes except the Node adapter smoke
(which writes only to a `mkdtemp` directory and cleans up in `finally`). PASS criteria, all
non-zero-exit on failure:

1. **Purity / determinism.** Two full evidence runs produce byte-identical canonical JSON
   (digest equal); every pure file has no `node:` or app imports, no `Date` / `Math.random` /
   DOM / `fetch`.
2. **Exact strategy.** `cover-with-defaults(t)` detections equal `relevantT(t)` on all corpus
   tasks for `t` in `{1,2,3}` under budget; coverage completeness verified for every generated
   CA.
3. **CA theorem (C2).** On the three monotone tasks, `ca(t)` detections equal exact detections
   for `t` in `{1,2}`.
4. **Masking (C1).** The pinned adversarial array misses the masked pair on `and-xor-c`;
   `cover-with-defaults` finds it; the miss appears in `misses` / certificate.
5. **Planted (b).** `ca(2)` misses every planted 3-way slot and each miss is reported; `ca(3)`
   detects it.
6. **Minimality (c).** Every witness is 1-minimal with `verifyRuns` consistent; the
   non-monotone case is flagged by the verifier.
7. **Necessity / repair (a).** Every detection is context-necessary; every collision witness has
   original keys equal and repaired keys different; repair separates the Metro project pair.
8. **Anchor honesty (C5).** `threshold-3` yields zero detections, the certificate is the weak
   string, and `residualCollisionPairs == 1` is reported in evidence (never suppressed).
9. **Negative controls (e).** Nondeterminism refuses with no `clock` implicate; an untrappable
   read is a documented miss with no implicate.
10. **Portability and budget.** Runs from a clean checkout with no machine-local paths (all
    scratch under `os.tmpdir()` + `mkdtempSync`; printed paths stripped); wall time **<= 60 s**
    locally and well under CI's 6-minute cap.
11. **Pinned aggregates.** An embedded `EXPECTED` object (built once from a reviewed green run
    and frozen) holds exact counts and per-task detection-set digests for the default
    strategies; the gate recomputes and compares exactly. Any engine change that moves a count
    must update the constant and the paper in the same commit; the gate refuses to auto-update.
12. **CI wiring.** `.github/workflows/ci.yml` gains a step after `verify:bdl`:
    `name: Verify KeyFuse (probe + witness gate)`, `timeout-minutes: 6`,
    `run: bun run scripts/verify-keyfuse.ts`. `package.json` gains
    `"verify:keyfuse": "bun run scripts/verify-keyfuse.ts"`.

**Portability rule (this bit us twice):** no absolute paths, no `process.cwd()`-dependent fixture
reads (only repo source scans), no `/tmp` literals, no usernames or home dirs in output, no
network, no clock in assertions. The Node adapter root is always
`mkdtempSync(join(tmpdir(), "keyfuse-"))`; the unit tests that exercise it are skipped only if
`node:fs` is unavailable (never in CI).

### 5.2 Ship gate (run order)

```bash
bun test tests/keyfuse.test.ts tests/keyfuse-safety.test.ts tests/keyfuse-node.test.ts
bunx tsc --noEmit && bun run lint
bun run scripts/keyfuse-evidence.ts        # <= 60 s, prints the evidence table
bun run verify:keyfuse                     # <= 60 s local, <= 6 min CI
bun test
bun run build
bun run scripts/measure-bundle.ts --check  # /keyfuse <= 440, /stats unchanged
```

---

## 6. Build split (4 builders, exact owned files)

Order: **B1 → (B2 ∥ B3) → B4 → B2 final pin + CI.** B1's API is frozen in §3; B2's task ids and
shapes are frozen in §4.1; B3 and B4 build against those contracts without waiting for merges.

| Builder | Owns (exact) | Acceptance criteria | Contract with others |
|---|---|---|---|
| **B1 — core** | `src/lib/keyfuse/{types,hash,slots,cover,trace,probe,minimize,repair,audit,index}.ts`; `tests/keyfuse.test.ts`; `tests/keyfuse-safety.test.ts` | types compile; `bun test tests/keyfuse.test.ts` green; fixed hash vectors; CA coverage verified; masking/adversarial test; minimizer 1-minimality test; purity scan (zero `node:` / DOM / clock / random imports in pure files); forbidden-claims source scan (§1 list) | publishes the frozen API in §3.3–3.4; never imports `tasks.ts` / `nodeAdapter.ts`; no storage, no sync, no grading imports |
| **B2 — corpus + evidence + gate** | `src/lib/keyfuse/tasks.ts`; `src/lib/keyfuse/nodeAdapter.ts`; `scripts/keyfuse-evidence.ts`; `scripts/verify-keyfuse.ts`; `tests/keyfuse-node.test.ts`; `package.json` (add `verify:keyfuse` only); `.github/workflows/ci.yml` (one step) | 24 tasks match §4.1; evidence runtime <= 60 s; gate passes all 12 criteria from a clean checkout; Node/virtual adapter agreement on `metro-env-1`; no machine-local paths; `bun run verify:keyfuse` green | consumes only `@/lib/keyfuse` (index) and `@/lib/keyfuse/nodeAdapter`; publishes `KEYFUSE_TASKS` / `METRO_NODE_TASK` / `getKeyFuseTask` and the reviewed `EXPECTED` constants used by B4's pinned numbers |
| **B3 — UI + wiring** | `src/components/keyfuse/KeyFuseLab.tsx`; `src/components/keyfuse/ProbeMatrix.tsx`; `src/components/keyfuse/WitnessPanel.tsx`; `src/app/keyfuse/page.tsx`; `public/sw.js`; `tests/offline.test.ts`; `scripts/e2e-smoke.mjs`; `src/app/sitemap.ts`; `src/lib/quickActions.ts` (+ `tests/quickActions.test.ts` if it asserts the registry); `scripts/measure-bundle.ts` | 375px layout with no horizontal overflow of the page (matrix scrolls internally); all controls `min-h-11` at mobile; `aria-live` result; exact copy from §7; `/keyfuse` static route; offline / sitemap / quick-action / e2e wiring green; `/keyfuse <= 440 kB`; `/stats` unchanged | consumes `KEYFUSE_TASKS`, `getKeyFuseTask`, `createVirtualOracle`, `auditTask`, constants from `@/lib/keyfuse`; imports **no** storage / sync / grading module; never imports `nodeAdapter` |
| **B4 — paper + figures** | `src/data/inventions/keyfuse.ts`; `src/data/inventions/index.ts` (register newest first); `tests/inventions.test.ts` (registry list lines only) | `bun test tests/inventions.test.ts` green; >= 8 sections, >= 6 references with https URLs, one of each block kind (table, figure, formula, code, list, callout); every number traceable to B2's evidence report or §4.2; forbidden-claims scan applies to the paper source too | consumes B2's frozen numbers only (no imports from the engine); cites only URLs verified in §8; newest-first registry otherwise unchanged |

**Serialization rule:** if B1's API needs a change after B2/B3 start, B1 lands the change plus a
one-line note; B2/B3 rebase. No parallel edits to the same file.

---

## 7. UI plan

**Route:** `/keyfuse` (single static page; no dynamic params, no storage, no server data).

**Components**

- `KeyFuseLab.tsx` (`"use client"`): task picker over `KEYFUSE_TASKS` (grouped by family),
  strategy selector (`baseline-toggle`, `single-trace`, `ca`, `ca-ddmin` default,
  `cover-with-defaults`), strength selector (1/2/3), Run button, result region. The audit runs
  synchronously (pure JS, <= 4096 tiny calls); `useState` only; no worker, no Pyodide, no
  network.
- `ProbeMatrix.tsx`: table of `ProbeRow`s — columns: index, per-slot values (`baseline` /
  `top` / sentinel), output vs baseline, differing set. `<caption>`, `th scope="col"` /
  `scope="row"`, internal `overflow-x-auto` so the page itself never scrolls horizontally at
  375px.
- `WitnessPanel.tsx`: detections list (slot kind + name, witness pair, `1-minimal ok` with
  `verifyRuns`), repaired-key card (original vs repaired, declared ∪ implicated, separations),
  certificate + `misses` + `truncated` warning, and the always-visible caveat.

**Interaction:** pick task → pick strategy/strength → Run → results. `cover-with-defaults` is
disabled with an inline explanation when its row count exceeds `KEYFUSE_EXACT_MAX_ROWS`.
Negative controls render a refusal card: "This oracle is not deterministic here, so KeyFuse
reports nothing rather than guessing."

**Frozen copy (exact):**

- Intro: "KeyFuse probes a task's declared inputs to find which undeclared slots its output
  actually depends on, then prints a minimal same-key / different-output witness and a repaired
  key built from everything it detected."
- Certificate: "No detected ≤t-support effect at covered tuples." (never "no effect")
- Caveat (always visible): "Detection is not soundness. A miss can only be reported, and a key
  repaired from detections is conservative, not complete."
- Repair: "Repaired key (conservative over-approximation of detected dependence): declared ∪
  implicated."
- Never: "sound", "complete", "finds all collisions", "beats sandboxing", "proves", "bug-free".

**Accessibility:** `aria-live="polite"` result region; focus moves to the result heading after a
run; pickers have labels; matrix tables have captions and header scopes; no color-only encoding;
`min-h-11` tap targets at 375px; `focus-visible:ring-accent/40`; code and counts in `font-mono`.

**Design tokens only** (`bg-canvas`, `bg-canvas-card`, `bg-canvas-soft`, `border-hairline`,
`text-ink`, `text-body`, `text-body-mid`, `text-mute`, `text-accent`, `border-accent/40`,
`bg-accent/5`); `rounded-lg` cards; no shadows, gradients, or uppercase labels.

**Bundle budget:** `/keyfuse` is added to `scripts/measure-bundle.ts` `KEY_ROUTES` with
`BUDGETS_KB["/keyfuse"] = 440`; `/stats` must be byte-identical to before the wave. Fallback in
order: (1) lazy `await import("@/lib/keyfuse/tasks")` on first Run; (2) ship a compact
`{id, title, family, n}` list in the initial chunk and load full task specs lazily. Estimated
added first-load: roughly 3–5 kB gzip (pure TS engine + 24 tiny tasks + 3 components).

**Wiring:** `public/sw.js` precache `"/keyfuse"` plus a navigation fallback entry and a
`VERSION` bump; `tests/offline.test.ts` static route `keyfuse: "/keyfuse"`;
`scripts/e2e-smoke.mjs` add `"/keyfuse"`; `src/app/sitemap.ts` add `/keyfuse`;
`src/lib/quickActions.ts` add `{ id: "open-keyfuse", label: "Open KeyFuse cache-key auditor",
keywords: ["keyfuse", "cache", "key", "witness", "env"], kind: "navigate", href: "/keyfuse" }`.

---

## 8. Paper plan

`src/data/inventions/keyfuse.ts`, registered in `src/data/inventions/index.ts` (newest first,
above `BEHAVIORAL_DELTA_LEDGER`).

- **id / slug:** `keyfuse`; **authors:** `["DeepForge Research"]`; **date:** `"2026-09-18"`.
- **Title:** "KeyFuse: Falsification-First Cache-Key Auditing with Minimal Collision Witnesses
  and Conservative Key Repair".
- **Keywords:** build cache, cache key, undeclared inputs, combinatorial interaction testing,
  delta debugging, minimal witness, key repair, reproducibility.
- **Abstract (template; B4 completes with measured numbers):** the problem (cache keys describe
  what authors declare, not what builds read; public Nx / Metro / Gradle / Turborepo incidents);
  the object (a typed slot universe over files, env, cwd, locale, timezone, rng, clock; a
  same-key / different-output witness; the five probe strategies); the theorems (C2 monotone CA,
  C3 exact cover-with-defaults, C4 cheap CA + ddmin, C6 per-slot necessity); the honest negative
  results (C1 masking, C5 anchoring counterexample, C8 value-specific misses, C9 non-monotone
  minimization); the corpus (24 toy tasks with brute-force ground truth); the product (a
  read-only browser lab; no storage, no grading, no network); and the ceiling sentence from §1.

**Sections (10; every section has at least one block, and all block kinds are used):**

1. **Introduction & motivation** — undeclared inputs as a trust boundary; the four public
   incidents; contribution split: witness first, repair second; the falsification framing.
2. **Related work, stated honestly** — build systems (Nix, Bazel sandboxing and hermeticity,
   Gradle, Turborepo, Nx); combinatorial interaction testing (NIST SP 800-142); delta debugging
   (Zeller & Hildebrandt); reproducibility tooling (reprotest, reproducible-builds); record /
   replay and tracing (rr, strace); differential and mutation testing (McKeeman; DeMillo; Jia &
   Harman; Papadakis; Just; Inozemtseva). One take / not-claim table in the style of the wave-42
   paper ("Oxide-style" honest accounting): each row says what is borrowed and what is
   explicitly not claimed.
3. **Model and definitions** — slots, universe, assignments, declared key, witness, collision,
   anchoring assumption (C5), support, ≤t effects; the three counterexamples (C1, C5, C7) as
   formulas.
4. **Probing strategies and guarantees** — baseline toggle, single trace, CA, CA + ddmin,
   cover-with-defaults; the C2 theorem with proof sketch; the C3 cost formula; the C4 contract
   and certificate wording; the C6 necessity check.
5. **Witnesses and minimization** — witness construction from changing rows; ddmin with
   exhaustive 1-minimality verification (C9); the witness table (see T3); repair key
   construction and separation checks.
6. **Corpus and ground truth** — the 24-task table; brute force over 2^n; the five decisive
   experiments (a)–(e) as measured.
7. **Results** — strategy × metric table (T2); figures F1–F4; the Metro-style demo table (T4);
   where the method misses and why.
8. **Cost, limits, and honest failures** — run counts, budget truncation, C1 / C5 / C8 / C9,
   untrappable reads, non-determinism, semantics of the certificate.
9. **Product implications** — what ships (`/keyfuse` read-only lab), what is cut (no soundness
   claim, no auto-repair of real build systems, no storage, no grading coupling) and why the
   conservative repair is the right intervention when declaration is impossible.
10. **Reproducibility, risks, and future work** — evidence command, gate, pinned aggregates,
    seed-free determinism, and the open research questions (anchoring test for real tasks,
    per-slot ordered domains, high-entropy clock/RNG slots).

**Figures and tables (T1–T4; the paper renderer supports bar figures, so every figure is
deterministic bars and scaling figures are labeled log10 in the caption):**

- **F1 `keyfuse-detection-by-strategy`** (bar): detection coverage per strategy
  (`baseline-toggle`, `single-trace`, `ca(1)`, `ca(2)`, `ca(3)`, `cover-with-defaults`) split into
  two series — planted 2-way tasks and planted 3-way tasks; data = share of ground-truth
  t-relevant slots detected; max 100.
- **F2 `keyfuse-runs-scaling`** (bar): oracle runs for `n` in `{6, 8, 10, 12}` on a fixed planted
  family; three series — `ca(2)+ddmin`, `cover-with-defaults(2)`, exhaustive `2^n`; values are
  **log10(runs)** so the 2^n exponential is visible next to the `v^t log n` curve; max = log10
  of the largest run count (~4); caption states the log10 transform explicitly.
- **F3 `keyfuse-slot-partition`** (bar): per family, counts of declared, implicated-and-necessary,
  context-only, ground-truth-missed, and false-implicate slots (five series); max = 12.
- **F4 `keyfuse-repair-separation`** (bar): share of enumerated same-original-key /
  different-output pairs left colliding under the original key (0 by construction) vs under the
  repaired key, per family; max 100. The gap is the repair's contribution; families where the
  anchor fails (#13) stay visibly unseparated.
- **T1 Claims table:** C1–C9, status (false / theorem / assumption / holds), and the gate check
  that enforces each row.
- **T2 Strategy × metric table:** strategy, strength, runs, probes, missedRelevant,
  falseImplicates, collisionsRemaining, certificateMisses.
- **T3 Witness table:** task, differing slot(s), left/right outputs, original keys equal,
  repaired keys differ, 1-minimal verified, `verifyRuns`, ddmin passes. This is the paper's
  centerpiece artifact.
- **T4 Metro-style demo table:** step (declared key hashed, build A output, build B output,
  toggle result, trace result, CA(2) row, minimized witness, repaired key A/B), observed
  result; one row per step, including the two negative steps that failed to warn.

**References (real URLs only; existing entries copied verbatim from
`behavioral-delta-ledger.ts` where they repeat):**

- `nx2026` — Nx blog, "Can You Trust Your Build Cache?" https://nx.dev/blog/can-you-trust-your-build-cache
- `metro30930` — expo/expo issue #30930, "Metro Build + Cache-Key Collision" https://github.com/expo/expo/issues/30930
- `metro918` — facebook/metro issue #918, custom transformers and external cache inputs https://github.com/facebook/metro/issues/918
- `gradle16144` — gradle/gradle issue #16144, build-cache key normalization https://github.com/gradle/gradle/issues/16144
- `gradleCachingProblems` — Gradle user guide, "Solving common problems" (environment variable tracking) https://docs.gradle.org/current/userguide/common_caching_problems.html
- `gradleConfigCache` — Gradle user guide, configuration cache env/system-property requirements https://docs.gradle.org/current/userguide/configuration_cache.html
- `turboGotchas` — Turborepo, environment variable gotchas (passThroughEnv, .env inputs) https://github.com/vercel/turbo/blob/main/skills/turborepo/references/environment/gotchas.md
- `turboEnvDocs` — Turborepo docs, using environment variables https://turborepo.dev/docs/crafting-your-repository/using-environment-variables
- `kuhn2010` — Kuhn, Kacker & Lei, NIST SP 800-142, Practical Combinatorial Testing https://doi.org/10.6028/NIST.SP.800-142
- `zeller2002` — Zeller & Hildebrandt 2002, Simplifying and isolating failure-inducing input (ddmin) https://doi.org/10.1109/32.988498
- `bazelSandboxing` — Bazel docs, Sandboxing https://bazel.build/docs/sandboxing
- `bazelHermeticity` — Bazel docs, Hermeticity https://bazel.build/basics/hermeticity
- `nix2004` — Dolstra, de Jonge & Visser 2004, Nix: A Safe and Policy-Free System for Software Deployment https://eelcovisser.org/publications/2004/DolstraJV04.pdf
- `reprotest` — reproducible-builds.org, Adding build variance (reprotest) https://reproducible-builds.org/docs/adding-build-variance/
- `rr2017` — O'Callahan et al. 2017, Engineering Record and Replay for Deployability https://www.usenix.org/conference/atc17/technical-sessions/presentation/ocallahan
- `strace` — strace syscall tracer https://strace.io/
- `mckeeman1998` — McKeeman 1998, Differential testing for software https://www.cs.tufts.edu/comp/150FP/archive/bill-mckeeman/DifferentailTesting.pdf
- `demillo1978` — DeMillo, Lipton & Sayward 1978 https://doi.org/10.1109/C-M.1978.218136
- `jia2011` — Jia & Harman 2011 https://doi.org/10.1109/TSE.2010.62
- `papadakis2019` — Papadakis et al. 2019 https://doi.org/10.1016/bs.adcom.2018.03.015
- `just2014` — Just et al. 2014 https://doi.org/10.1145/2635868.2635929
- `inozemtseva2014` — Inozemtseva & Holmes 2014 https://doi.org/10.1145/2568225.2568271

**URL rule:** copy existing entries verbatim; never invent a URL. The paper's related-work
section uses the wave-42 "takes / not claimed" table style explicitly, and the limitations
section repeats the not-claimed list from §1 word for word.

---

## 9. Risks and honest limitations (carry into the paper)

1. **Soundness temptation.** The witness is compelling; copy must still say "detected". The
   gate's forbidden-claims scan covers engine, UI, and paper sources.
2. **Anchor violations are real and demonstrated.** Task #13 (threshold) yields zero detections
   and a residual collision; the paper reports it as a measured failure, and the UI caveat says
   a miss can only be reported.
3. **Masking is real and demonstrated.** Task #8 with a pinned adversarial CA proves C1 false as
   originally stated; the shipped CA can miss pairs even at t=2 depending on array
   construction. `verifyCoverage` proves only the array's own coverage, not effect coverage.
4. **Value-specific effects.** Binary `{baseline, top}` domains miss `port == 8080`; sentinels
   narrow but do not close this. No completeness claim is made.
5. **Untrappable reads.** Native, mmap, subprocess, and network reads bypass facade
   interposition; the Node adapter is wrapper-level, not syscall-level; the browser adapter can
   only observe API-mediated reads. These are documented misses.
6. **Non-determinism.** The determinism check samples baseline and one perturbed row; a task
   deterministic on those and nondeterministic elsewhere could slip through; the oracle refuses
   only what it observes.
7. **Cost.** `cover-with-defaults` grows combinatorially; the audit caps at `KEYFUSE_MAX_RUNS`
   and reports truncation rather than silently narrowing.
8. **Toy corpus, not real build systems.** The Metro demo reproduces the failure shape in a toy
   project; it is not an integration test of Metro, Nx, Gradle, or Turborepo. No claim is made
   that the tool already audits real cached builds.
9. **Hash strength.** The 64-bit FNV key is a deterministic identifier, not a security boundary;
   the paper says so, and the tool is not a cache-poisoning defense.
10. **Per-witness minimality.** 1-minimality is verified for the recorded witness only; global
    minimality of the implicated set is not claimed (C6, C9).

---

## 10. Open decisions for the orchestrator

1. **Route name.** Ship as `/keyfuse` (brand-forward) or `/cache-audit` (task-forward). This
   blueprint assumes `/keyfuse`; a rename touches B3's owned files only.
2. **Node adapter in the UI.** Plan: browser uses the virtual adapter only; the Node facade
   adapter ships in scripts/tests. Confirm that v1 does not need a "real project" audit path in
   the browser (it cannot have one without a server/worker).
3. **Fixpoint in v1.** The trace → perturb → retrace loop is specified with 3 passes. If B1's
   budget analysis shows the loop can exceed `KEYFUSE_MAX_RUNS` on the corpus, ship one pass and
   report the miss instead; decide before B2 freezes `EXPECTED`.
4. **Masking task in the UI.** Recommend shipping `and-xor-c` as a first-class task (it is the
   falsification story). Confirm the copy for a detected-miss card.
5. **Pinned numbers home.** Recommend gate-embedded `EXPECTED` constants (wave-42 style) rather
   than a committed JSON artifact; B4 reads the same numbers from the evidence output.
6. **Paper title.** Final wording for `/inventions` and the PDF; the current title is a draft.
7. **Budget for `/keyfuse`.** 440 kB gzip proposed to match `/ledger`; if the shared shell is
   smaller by landing time, lower it in the same commit.
8. **Corpus size.** 24 tasks is the proposed freeze; adding tasks moves every pinned aggregate
   and requires a coordinated B2 + B4 update, so freeze before B4 starts.

---

## Errata (post-build verification)

- **§3.3 `Detection.necessary` is `boolean`**, not the literal `true`: the `ca` false-implicate arm
  needs it, and `ca` detections are evidence, never a soundness claim.
- **§5.1 criterion 3 restated.** The exact arm (`cover-with-defaults`) must equal ground truth per
  criterion 2. The CA arm (`ca-ddmin`) is row-level detection with minimized-support attribution
  capped at the strength: for a changed row with minimized support `S` and `|S| <= t`, each slot of
  `S` is emitted with a necessity check at the minimized context; for `|S| > t` the row emits
  nothing and records `detected effect requires >t support at row <index> (order exceeds strength)`.
  >t-support effects are reported as misses, never silently dropped. Honesty check: attributed
  `ca-ddmin` detections ⊆ exact detections AND every exact detection absent from the CA arm has a
  corresponding miss entry.
- **Duplicate-detection dedupe.** Detections are deduplicated by slot before repair (first
  occurrence in deterministic row order); `separateWitnesses`, `collisionWitnesses`, and
  `residualCollisions` are computed over the deduped set, so repeated row contexts for one slot no
  longer inflate those counts.
- **Default strategy is `cover-with-defaults`, not `ca-ddmin`.** Post-build evidence (task
  `metro-env-1`) showed the minimizer-first `ca-ddmin` arm reduces a changing Metro row to
  `{BUILD_MODE}` and therefore never emits the `env:API_URL` witness, while the exact arm does.
  The exact ball always fits `KEYFUSE_EXACT_MAX_ROWS` on the frozen 24-task corpus, so it is the
  default everywhere (engine, UI selector, evidence F1/T2 rows); `ca-ddmin` ships as the
  conservative fallback for larger universes whose misses are reported. The required demo (a)
  witness is produced by the exact arm; the CA arms are reported beside it for comparison.



