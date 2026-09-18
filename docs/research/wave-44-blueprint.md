# Wave 44 blueprint — Refutation-Ledger Values (Warrant Lab)

Binding document composed from: part1a (files + algorithms), part1b (arena), part1c (evidence/gate/tests/UI), part2 (paper/wiring/errata/build order). DeepForge Research, 2026-09-18.

---

# Wave 44 — Blueprint Part 1a: frozen files and exact algorithms

Repo: `deepforge`. Scope: this file only; no git commands. Engine: `src/lib/warrant/*`, pure deterministic
TypeScript, zero new dependencies, no Node APIs. Normative inputs: `wave-44-attack-correctness.md` §4 (the
amended contract, I1'–I4') and §5 (threat model), plus the frozen constants below. Part 1b owns
tests/scripts/paper/UI; this part is the engine contract and nothing else.

Frozen: `WARRANT_VERSION=1`, `WARRANT_MARK="__DF_WARRANT__"`, `WARRANT_MAX_GRADE=3`, `WARRANT_MAX_CHAIN=64`,
`WARRANT_MAX_INCONCLUSIVE_PER_PAIR=1`. `ValueId` commits to `(op,kind,payload,cites[],context,genesis)`;
assert is idempotent within a context, and a dead existing id throws `RefusedRemintError` instead of being
re-minted; derive is deterministic in `(fDigest,cites,context)` and may cite dead values; cites freeze at
creation; the cite graph is a DAG by construction; `dead != 0`; `publishedGrade` is an advert only, never
an input to another value's computation.

## 1. Frozen files + API

Every module imports the shared names it uses from `./types` (plus `./hash`/`./ids`/`./registry` as
indicated); the import graph is acyclic and each file exports exactly the names below.

**types.ts** — frozen constants plus every shared type and both error classes; the only logic is `minGrade` (`dead` absorbing, otherwise `Math.min`) and `isDead`, so
all other modules depend on this file alone. `Grade = "dead" | 0 | 1 | 2 | 3`: `dead` is terminal and never equal to `0`. `WARRANT_MARK` is the reserved
payload-envelope key: `assertValue` rejects any payload whose top-level own key is the mark (`reserved-payload`).
```ts
export const WARRANT_VERSION = 1, WARRANT_MARK = "__DF_WARRANT__", WARRANT_MAX_GRADE = 3, WARRANT_MAX_CHAIN = 64, WARRANT_MAX_INCONCLUSIVE_PER_PAIR = 1;
export type RootId = string; export type VersionId = string; export type ValueId = string; export type Digest = string; export type ContextId = string; export type Seed = string; export type Identity = string; export type VerifierId = string;
export type Op = "assert" | "derive"; export type Outcome = "survived" | "refuted" | "inconclusive"; export type LiveGrade = 0 | 1 | 2 | 3; export type Grade = "dead" | LiveGrade;
export interface Attempt { readonly refuter: RootId; readonly family: RootId; readonly seed: Seed; readonly outcome: Outcome; readonly cost: number; readonly witness: Digest; readonly submittedBy: Identity } export interface PendingAttempt { readonly attempt: Attempt; readonly sig: Digest }
export interface Append { readonly prev: Digest; readonly attempt: Attempt; readonly admittedBy: VerifierId; readonly sig: Digest }
export interface Value { readonly id: ValueId; readonly op: Op; readonly kind: string; readonly payload: unknown; readonly cites: readonly ValueId[]; readonly context: ContextId; readonly genesis: Digest; readonly chain: readonly Append[] }
export interface RootRecord { readonly rootId: RootId; readonly authorRoot: Identity; readonly specDigest: Digest; readonly coverage: readonly string[] } export interface VersionRecord { readonly versionId: VersionId; readonly rootId: RootId; readonly specDigest: Digest; readonly seq: number }
export interface Registry { readonly roots: ReadonlyMap<RootId, RootRecord>; readonly versions: ReadonlyMap<VersionId, VersionRecord> } export interface Store { readonly values: ReadonlyMap<ValueId, Value> }
export interface PublishedGrades { get(id: ValueId): Grade | undefined } export interface HeadAnchor { readonly valueId: ValueId; readonly head: Digest; readonly length: number; readonly published: Grade }
export type AuditIssueKind = "grade-mismatch" | "malformed-attempt" | "broken-prev" | "bad-signature" | "chain-overflow" | "duplicate-inconclusive" | "head-mismatch" | "unknown-cite" | "unknown-root" | "cycle";
export interface AuditIssue { readonly kind: AuditIssueKind; readonly valueId: ValueId; readonly index: number | null; readonly detail: string } export interface Report { readonly valueId: ValueId; readonly recomputed: Grade; readonly published: Grade | null; readonly ok: boolean; readonly issues: readonly AuditIssue[] }
export type AdmissionCode = "unknown-value" | "malformed-attempt" | "unknown-root" | "version-not-root" | "author-mismatch" | "reserved-payload" | "chain-budget" | "duplicate-inconclusive" | "subsumed-family" | "bad-signature";
export class AdmissionError extends Error { readonly code: AdmissionCode } export class RefusedRemintError extends Error { readonly valueId: ValueId } export function isDead(g: Grade): g is "dead"; export function minGrade(a: Grade, b: Grade): Grade;
```

**hash.ts** — warrant's own copy of the keyfuse digest discipline (no cross-import): code-point-driven FNV-1a 32 in two NUL-fenced warrant rounds concatenated to
16 lowercase hex (the 64-bit pattern), and `canonicalJson` with the keyfuse semantics. Deterministic identifiers, not cryptography: 64-bit birthday collisions
are plausible; nothing here may be described as a signature.
```ts
export function fnv1a32(input: string): number; export function warrantHash(input: string): Digest; export function canonicalJson(value: unknown): string;
export const WARRANT_HASH_VECTORS: readonly { readonly input: string; readonly digest: Digest }[];
```

**registry.ts** — pure lineage registry: `registerRoot` normalizes the declared coverage set and is idempotent on `rootId`; a new `specDigest` under an
existing root is a `registerVersion` row that resolves to its root (versions never count as identity); `subsumedFamily` implements the decidable subsumption
rejection over explicit finite coverage sets; `authorOf`/`rootsByAuthor` expose authorRoot concentration (attack 2.4 declared residual).
```ts
export function emptyRegistry(): Registry;
export function registerRoot(registry: Registry, authorRoot: Identity, specDigest: Digest, declaredDomain: readonly string[]): Registry;
export function registerVersion(registry: Registry, rootId: RootId, authorRoot: Identity, specDigest: Digest): Registry;
export function rootOf(registry: Registry, id: RootId | VersionId): RootId; export function isRoot(registry: Registry, id: string): id is RootId;
export function recordOf(registry: Registry, rootId: RootId): RootRecord; export function authorOf(registry: Registry, rootId: RootId): Identity;
export function rootsByAuthor(registry: Registry, authorRoot: Identity): readonly RootId[];
export function subsumedFamily(registry: Registry, refuter: RootId, family: RootId, chain: readonly Append[]): boolean; export function overlapRatio(a: readonly string[], b: readonly string[]): number;
```

**ids.ts** — every digest preimage in one place, built only from `canonicalJson` and `warrantHash`; `rootIdOf` mints lineage ids and `versionIdOf` mints version
ids, so identity rules are auditable in one file. `valueIdOf` is the canonical context-keyed identity (attacks 1.4/3.6); `headDigest` folds a chain;
`contextGenesis` fixes the context origin.
```ts
export function contextGenesis(context: ContextId): Digest; export function valueIdOf(op: Op, kind: string, payload: unknown, cites: readonly ValueId[], context: ContextId, genesis: Digest): ValueId;
export function rootIdOf(authorRoot: Identity, specDigest: Digest, coverage: readonly string[]): RootId; export function versionIdOf(rootId: RootId, specDigest: Digest, seq: number): VersionId;
export function attemptDigest(a: Attempt): Digest; export function replaySig(admittedBy: VerifierId, prev: Digest, a: Attempt): Digest;
export function chainGenesis(id: ValueId): Digest; export function headDigest(id: ValueId, chain: readonly Append[]): Digest;
```

**ledger.ts** — the only write path: `assertValue`/`deriveValue` create values, `submit` freezes a structurally valid attempt, `admit` applies every admission
check and returns a new store, so rejected attempts are never appended and the input store is never mutated. No operation rewrites or removes a value or a
cite (I4'); `why` returns the stored chain plus cites. `assertValue` returns the existing id when it is live and throws `RefusedRemintError` when it is dead;
`deriveValue` canonicalizes cites to a sorted duplicate-free array before hashing and returns the existing id on collision (a cite of a dead value may still
create a new, immediately dead value).
```ts
export function emptyStore(): Store; export function getValue(store: Store, id: ValueId): Value | undefined;
export function assertValue(store: Store, registry: Registry, payload: unknown, kind: string, context: ContextId): { store: Store; id: ValueId };
export function deriveValue(store: Store, registry: Registry, fDigest: Digest, cites: readonly ValueId[], context: ContextId): { store: Store; id: ValueId };
export function submit(attempt: Attempt, sig: Digest): PendingAttempt; export function admit(store: Store, registry: Registry, valueId: ValueId, pending: PendingAttempt, admittedBy: VerifierId): Store;
export function chainOf(store: Store, id: ValueId): readonly Append[]; export function why(store: Store, id: ValueId): { readonly chain: readonly Append[]; readonly cites: readonly ValueId[] };
```

**grade.ts** — D and lambda live here (there is no separate `dependence.ts` in the frozen layout): `dependencyClasses` is the B7 union-find over surviving
(refuter root, family root) pairs, `D` is the class count, and `lambda` is the pull-based read-time recursion over frozen cites with `dead` absorbing and the
`K` cap. No propagation state is stored between calls.
```ts
export interface DependencyClass { readonly members: readonly (readonly [RootId, RootId])[] }
export function survivingPairs(chain: readonly Append[]): readonly (readonly [RootId, RootId])[]; export function dependencyClasses(surviving: readonly (readonly [RootId, RootId])[], registry: Registry): readonly DependencyClass[];
export function D(chain: readonly Append[], registry: Registry): number; export function lambda(store: Store, registry: Registry, id: ValueId): Grade;
export function refutedInChain(chain: readonly Append[]): boolean;
```

**graph.ts** — cite-graph utilities over a store: `ancestors` returns the leaves-first post-order closure used by audit; `cone` returns the dependents-only
closure (direction pinned by attack 3.2); `assertAcyclic` is the defense-in-depth DAG check.
```ts
export function ancestors(store: Store, id: ValueId): readonly ValueId[]; export function cone(store: Store, id: ValueId): readonly ValueId[]; export function assertAcyclic(store: Store): void;
```

**audit.ts** — read-only transitive audit: recomputes lambda from leaves over the closure, compares every publishedGrade, verifies prev links, replay
signatures and the head anchor, and reports malformed attempts; it never mutates and never treats `published` as an input. Scope is E4: arithmetic consistency
plus anchored tamper-evidence, not truth and not authenticity.
```ts
export function audit(id: ValueId, store: Store, registry: Registry, published: PublishedGrades, anchor: HeadAnchor | null): Report;
export function recomputeGrades(id: ValueId, store: Store, registry: Registry): ReadonlyMap<ValueId, Grade>;
```

**arena.ts** — the Derived-Claim Arena experiment: builds the 48-claim corpus, 16 refuters in 4 families (blind spots f0{0,1} f1{2,3} f2{4,5} f3{6,7}),
12 matched conflict pairs per regime and regimes R/D/C/P/X from one seeded 32-bit LCG (this document, part 1b §2), runs graders B0–B8, aggregates with metrics, and returns
a canonical digestable `ArenaResult`. No clock, no other randomness; `ORACLE_GRADER` is analysis-only.
```ts
export type Regime = "R" | "D" | "C" | "P" | "X";
export interface ArenaConfig { readonly seeds: number } export const ARENA_SEEDS = 200; export const ARENA_BASE_SEED = 0x9e3779b9;
export interface SeedStats { readonly mean: number; readonly p5: number }
export interface CriterionStatus { readonly id: "P1" | "P2" | "P3" | "P4" | "P5" | "F1" | "F2" | "F3" | "F4"; readonly measured: number | boolean; readonly threshold: string; readonly status: "pass" | "fail"; readonly note: string }
export interface ArenaResult { readonly digest: Digest; readonly config: ArenaConfig; readonly pw: Readonly<Record<Regime, Readonly<Record<GraderId, SeedStats>>>>; readonly auc: Readonly<Record<Regime, Readonly<Record<GraderId, SeedStats>>>>; readonly ap12: Readonly<Record<Regime, Readonly<Record<GraderId, SeedStats>>>>; readonly churn: { readonly seedDeltaMean: number; readonly pairFlipRate: number }; readonly demotion: { readonly precision: number; readonly recall: number }; readonly criteria: readonly CriterionStatus[] }
export function lcg(seed: number): () => number; export function runArena(config?: Partial<ArenaConfig>): ArenaResult;
```

**graders.ts** — B0–B7 as pure scoring functions over one claim value; each grader reads only the value, store and registry (no shared mutable state). B8 cannot be a normal grader (it needs generator truth), so it is `oracleScore`, exported for the arena only and never re-exported by `index.ts` nor imported by UI (E11). Amendment to the original block: `score` takes a Value, not a ConflictPair, and the pair comparison is done by the arena/metrics.
```ts
export type GraderId = "B0" | "B1" | "B2" | "B3" | "B4" | "B5" | "B6" | "B7" | "B8"; export interface Grader { readonly id: GraderId; readonly label: string; score(value: Value, store: Store, registry: Registry): number }
export const GRADERS: readonly Grader[];
export function scoreAll(grader: Grader, values: readonly Value[], store: Store, registry: Registry): readonly number[];
export function oracleScore(value: Value, store: Store, blindSpotByFamilyRoot: ReadonlyMap<RootId, readonly number[]>, defectClass: number | null): number;
```

**metrics.ts** — deterministic aggregates for tables T3–T6: ties count 0.5 in pair-win, tie-aware AUC, AP@12, nearest-rank 5th percentile, seed churn, pair
flips, and demotion precision/recall against generator ground truth. Every function is order-independent except where a frozen order is the argument contract.
```ts
export function mean(xs: readonly number[]): number; export function p5(xs: readonly number[]): number;
export function pairWinRate(scores: readonly number[], labels: readonly (0 | 1)[]): number; export function auc(scores: readonly number[], labels: readonly (0 | 1)[]): number;
export function apAt12(scores: readonly number[], labels: readonly (0 | 1)[]): number; export function seedDeltaMean(runs: readonly (readonly Grade[])[]): number; export function pairFlipRate(runs: readonly (readonly boolean[])[]): number;
export function demotionSanity(store: Store, registry: Registry, deadTruth: ReadonlySet<ValueId>): { readonly precision: number; readonly recall: number };
```

**index.ts** — the frozen public API and nothing else: `export *` from types, hash, ids, registry, ledger, grade, graph, audit, metrics; `runArena`, `lcg`,
`ARENA_SEEDS`, `ARENA_BASE_SEED`, `ArenaConfig`, `ArenaResult`, `SeedStats`, `KillStatus`, `Regime` from arena; `GRADERS`, `scoreAll`, `ConflictPair`, `Grader`,
`GraderId` from graders. `ORACLE_GRADER` is deliberately absent; UI imports only this barrel (plus fixtures), never arena internals.
```ts
export * from "./types"; export * from "./hash"; export * from "./ids"; export * from "./registry"; export * from "./ledger";
export * from "./grade"; export * from "./graph"; export * from "./audit"; export * from "./metrics";
export { runArena, lcg, ARENA_SEEDS, ARENA_BASE_SEED } from "./arena"; export type { ArenaConfig, ArenaResult, SeedStats, KillStatus, Regime } from "./arena";
export { GRADERS, scoreAll } from "./graders"; export type { Grader, GraderId } from "./graders";
```

## 2. Exact algorithms

**(a) Canonical serialization and digest layout.** `canonicalJson` mirrors keyfuse exactly (no cross-import): `null`, booleans, finite numbers (`-0`→`0`,
`String(n)`), JSON-escaped strings, arrays in order, plain objects with keys sorted by UTF-16 code unit; `undefined`/`bigint`/`symbol`/`function`/non-finite
numbers/cycles throw `TypeError`; no `toJSON`, no coercion. `warrantHash(s) = hex8(fnv1a32(A+s)) + hex8(fnv1a32(B+s))` with `A="\u0000warrant\u0000a\u0000"`,
`B="\u0000warrant\u0000b\u0000"`; `fnv1a32` is keyfuse's FNV-1a (init `2166136261`, prime `16777619`, `Math.imul`, `>>>0`; UTF-8 bytes consumed one code point
at a time, surrogate pairs as one code point — copy the keyfuse loop, not its prefixes); `hex8` is lowercase zero-padded. Pinned `WARRANT_HASH_VECTORS`:
`""` → `1ca0c9bd42a34426`, `"warrant"` → `526ccd1e91eddd1b`. Preimages, one `canonicalJson` call each:
`contextGenesis(c) = H("warrant:ctx:"+c+":"+WARRANT_VERSION)`; `valueIdOf = H(canonicalJson({op,kind,payload,cites,context,genesis}))` (keys sort to
`cites,context,genesis,kind,op,payload`); `rootIdOf = H(canonicalJson({authorRoot,coverage,specDigest,v:WARRANT_VERSION}))`;
`versionIdOf = H(canonicalJson({root,seq,spec}))`; `attemptDigest = H(canonicalJson({refuter,family,seed,outcome,cost,witness,submittedBy}))`;
`replaySig(admittedBy,prev,a) = H("warrant:sig:"+admittedBy+":"+prev+":"+attemptDigest(a))`; `chainGenesis(id) = H("warrant:chain:"+id)`; `headDigest` folds
`h0 = chainGenesis(id)`, `h_{i+1} = H(canonicalJson({admittedBy,attempt:attemptDigest(a_i),prev:h_i,sig:a_i.sig}))`. Digests are 16 lowercase hex and are
identifiers, not cryptography. `deriveValue` canonicalizes cites (sorted, duplicate-free) before `valueIdOf`.

**(b) Registry: roots, versions, coverage, subsumption.** `registerRoot` normalizes coverage to a sorted duplicate-free atom array (non-empty strings without
`"\u0000"`), mints `rootId`, and returns the registry unchanged when that `rootId` already exists (idempotent); identical `(authorRoot,specDigest,coverage)`
always mints the same lineage; malformed input throws `AdmissionError("malformed-attempt")`. `registerVersion` requires the root to exist and `authorRoot` to
equal `record.authorRoot` (else `author-mismatch`), sets `seq = 1 + |{v : v.rootId = rootId}|`, and inserts a version row; `rootOf` maps a version to its
root, `isRoot` is true only for lineage roots, and admission requires roots for refuter and family, so versions can never create a pair and add 0 to D. Because
coverage is an explicit finite sorted set, subsumption is decidable: `subsumedFamily(registry,refuter,family,chain)` is true iff `coverage(family)` is
non-empty and some append in `chain` with outcome `survived` and the same `refuter` has a family root with coverage `B ⊇ coverage(family)` (two-pointer
scan, equality included). Empty coverage is not decidable: admitted, declared residual (2.2). `authorOf`, `rootsByAuthor` (sorted by rootId) and
`RootRecord.authorRoot` keep author concentration visible (2.4 declared residual).

**(c) Admission.** `submit(attempt,sig)` is syntax-only and deep-freezes: non-empty `refuter`/`family`/`submittedBy`; `seed` matching
`^(0|[1-9][0-9]{0,19})$` and lexicographically ≤ `"18446744073709551615"` (u64 decimal); `outcome` in the enum; `cost` a safe integer ≥ 0; `witness` and
`sig` matching `^[0-9a-f]{16}$`. `admit` then checks in this fixed order, throwing `AdmissionError(code,detail)` without touching the input store:
(1) `unknown-value` — `valueId` is not a store key; (2) `malformed-attempt` — pending is not `submit`-shaped; (3) `unknown-root`/`version-not-root` —
`refuter` or `family` unregistered or a version id; (4) `chain-budget` — `chain.length >= WARRANT_MAX_CHAIN`; (5) `duplicate-inconclusive` — the chain already
has an inconclusive attempt with the same `(refuter,family)` and the cap is 1; (6) `subsumed-family` — `subsumedFamily(...)` is true; (7) `bad-signature` —
`sig !== replaySig(admittedBy, headDigest(valueId,chain), attempt)`. Success returns a new `Store` whose only change is that value's chain
`[...chain, {prev, attempt, admittedBy, sig}]` with `prev = headDigest(valueId, chain)`; everything else is shared unchanged. Rejected attempts never enter a
store, and no op rewrites or deletes, so append-only is absolute after admission. Admission is structural only (E4/E5): no truth, no independence.

**(d) D, the B7 reduction, and lambda.** `overlapRatio(A,B) = 0` if either sorted unique set is empty, else `|A∩B| / max(|A|,|B|)` by two-pointer scan.
`survivingPairs(chain)` is the duplicate-free list of `(refuter,family)` lineage pairs over admitted appends with outcome `survived`; the seed field is never
read, so replays and seed sweeps collapse onto one pair, and version ids cannot appear (admission requires roots). Join two pairs `u,w` iff
`u.family === w.family` or `overlapRatio(coverage(u.family), coverage(w.family)) >= 1/2`; run union-find with path compression; `D(chain,registry)` is the
number of components, i.e. distinct admitted survived dependency classes under the B7 rule — a strict generalization of the amended contract's pair count
(`dependencyClasses` returns the partition for tests). `lambda(store,registry,id)`: fetch the value (else throw `unknown-value`); if any admitted append in
its chain has outcome `refuted`, return `"dead"`; else `g = min(WARRANT_MAX_GRADE, D(chain,registry))` and for each cite `c` of the frozen cite array in order
set `g = minGrade(g, lambda(c))` (`minGrade("dead",_) = "dead"`, otherwise `Math.min`). Assert has no cites, so its grade is exactly `min(K,D)`. Memoize per
top-level call keyed by `ValueId`; every cite names an older value (DAG by construction), so recursion terminates. Nothing is stored between calls: every read
recomputes (pull-based, I1'/I3').

**(e) Audit.** `audit(id,store,registry,published,anchor)` first takes the leaves-first post-order closure `graph.ancestors(store,id)` including `id`; an
unknown cite is reported `unknown-cite` and contributes `"dead"` to its citer's minimum. In closure order it recomputes each grade by (d) over structurally
valid appends only and verifies that value's chain: for each append index `i`, report `malformed-attempt` if the attempt fails the `submit` predicates; else
`broken-prev` if `a.prev !== running` (`running` starts at `chainGenesis(x)`); else `bad-signature` if `a.sig !== replaySig(a.admittedBy,a.prev,a.attempt)`;
else `chain-overflow` if `chain.length > WARRANT_MAX_CHAIN`; else `duplicate-inconclusive` if an inconclusive pair repeats. Valid appends alone feed D and
the refuted check; `running` advances by the (a) head fold over every append regardless of validity, so rewrites are caught by the head comparison. After each
value, `grade-mismatch` when `published.get(x)` is defined and differs from the recomputation. When `anchor !== null`, `head-mismatch` unless
`anchor.valueId === id`, `anchor.length === chainOf(store,id).length`, `anchor.head === headDigest(id,chain)` and `anchor.published === recomputed[id]`.
`Report.ok` is true iff there are no issues; `recomputed` is `lambda(id)`; `recomputeGrades` is the same arithmetic without chain and anchor checks. Audit
never mutates the store and never reads `published` as an input to a grade (I1').

**(f) Determinism rules.** `src/lib/warrant/*` uses no `Date`/`Date.now`, `Math.random`, `crypto`, `process`, `fs`, `path`, `fetch`/network, timers, locale
APIs or module-level mutable state. The wave's only randomness is the arena's seeded 32-bit LCG `next(s) = (Math.imul(1664525,s) + 1013904223) >>> 0` started
from `ARENA_BASE_SEED`, with `runArena()` defaulting to `ARENA_SEEDS = 200` seeds. All serialization goes through `canonicalJson` (never bare
`JSON.stringify`); every returned collection is deterministically ordered (roots by rootId, closure in post-order, issues by closure then index, class members
sorted by serialized pair); ids never derive from time, ambient counters, or state outside the arguments. Equal config always yields an equal
`ArenaResult.digest` (chunk-4 acceptance).
# Wave 44 blueprint — part 1b: the Derived-Claim Arena (decisive experiment)

Binding spec. Source: docs/research/wave-44-attack-significance.md §3 (pre-declared design).
Constants: K = WARRANT_MAX_GRADE = 3. All randomness comes from one 32-bit LCG
`s(n+1) = (1664525*s(n) + 1013904223) mod 2^32`; run i uses the state after i steps from
`ARENA_BASE_SEED = 0x9e3779b9` (= 2654435769), and the arena runs `ARENA_SEEDS = 200` seeds. No
other entropy. Every draw is in a fixed order so the corpus is a pure function of the seed index.

## 1. Corpus

- 48 claims, ids `c000..c047`: kinds cycle hint, explanation, difficulty, prerequisite (12 each).
- For each claim the generator draws: `defective ∈ {false, true}` (about half), and if defective a
  `defectClass ∈ 0..7` (exactly one class per defective claim). Ground truth is this generator
  table and nothing else; no grader ever reads `defectClass`.
- 16 refuters `r00..r15`, 4 per family. Families and blind spots are fixed:
  f0={0,1}, f1={2,3}, f2={4,5}, f3={6,7}. Attempt semantics: an attempt by family f refutes a
  defective claim iff `defectClass ∉ blindSpot(f)`; correct claims survive every attempt.
- Regime X additionally registers roots `f2p` and `f3p` with declared coverage sets that overlap
  f2's coverage by ≥ half (overlap ratio |A∩B| / max(|A|,|B|) ≥ 1/2; not the Jaccard
  coefficient) and with blind spot {4,5} for both. They do not exist in
  regimes R, D, C, P.

Only *live* claims are ranked: a manifest contains survivor attempts only (any refuted attempt
would make the value dead and every grader would agree, which tests nothing). The arena therefore
constructs manifests of survivors; the refutation path of the contract is tested separately
(tests/warrant.test.ts, demotion sanity).

## 2. Regimes (same claims, paired across regimes)

For every seed, every claim gets a manifest per regime:

- **R redundant**: exactly 3 survivor attempts, all from one family, distinct seeds. For a
  defective claim the family must be blind to its class (else it would not survive); for a correct
  claim the family is drawn from f0..f3.
- **D diverse**: exactly 3 survivor attempts. Correct claims: 3 distinct families (when possible,
  the draw is f0..f3 without replacement). Defective claims: repeats allowed only within the one
  blind family (the binary blind-spot model makes true cross-family diversity impossible for a
  defective claim; this is recorded as a declared property of the arena, not hidden).
- **C churn**: the R manifest plus 8 extra survivor attempts from the same family with fresh seeds.
- **P replay**: the R manifest plus 8 copies of the first attempt tuple (same refuter, family, seed).
- **X correlated**: exactly 3 survivor attempts. Defective claims: drawn from roots
  {f2, f2p, f3p} (all blind to classes 4 and 5); the generator fixes defectClass ∈ {4,5} for the
  12 pair-defective claims. Correct claims: drawn from {f0, f1, f3} with one repeat (so distinct
  non-overlapping roots = 2). In X this makes B5, the family-dedup adversary, see 3 roots on the
  defective side and 2 on the correct side, while B7 sees 1 dependency class vs 2.

In D the pair-defective side is not used for the primary metrics (P2 is scoped to X, P1 to R);
D exists to show the graders' behaviour under genuine diversity.

## 3. Matchced conflict pairs (12 per regime)

For each regime and each seed: draw 12 disjoint claim pairs from the live claims; within a pair
one side is defective (generator truth) and one is correct. Manifests are then adjusted so that
`B1(raw counts)` are equal on the two sides (matched ±0), by construction:

- R: defective 3 attempts in its blind family; correct 3 attempts, each in a different family.
  B1: 3 vs 3 (tie). B5: 1 vs 3. B7: 1 vs 3. Expected: B1 tie (0.5 PW), B7 win (1.0 PW).
- C: same as R plus 8 same-family seeds on both sides; raw counts stay matched (11 vs 11).
  B1: 11 vs 11; B7 unchanged from R (seed-only churn adds 0).
- P: same as R but the 8 extra attempts are exact replays of the first tuple on both sides.
  B6 collapses the replays; B5/B7 unchanged.
- X: defective 3 attempts from {f2, f2p, f3p} (one each); correct 3 attempts from {f0, f0, f1}
  (two roots). B1: 3 vs 3. B5: 3 vs 2 (wrong side). B7: 1 vs 2 (correct side).
- D: both sides 3 survivors over distinct families where the claim is correct; the defective side
  of a D pair uses its blind family. Reported, not used by P2.

Ground truth for PW is the generator's `defective` flag: a win means the grader ranks the correct
side strictly above the defective side; a tie counts 0.5.

## 4. Graders (all capped at K = 3 where stated)

| Arm | Formula over a manifest |
|---|---|
| B0 | 1 if ≥1 survivor else 0 |
| B1 | raw survivor count (uncapped) |
| B2 | 100 · survivors / total attempts (all-survivor manifests tie; deliberately generous proxy) |
| B3 | B1 with a pinned-arithmetic recompute (totem-style); ranking identical to B1 |
| B4 | TMS belief: alive/dead only; all live claims tie |
| B5 | distinct family roots with ≥1 survivor, capped K (the strongest cheap adversary) |
| B6 | distinct (refuter, family, seed) triples among survivors, capped K (RLV as originally specified) |
| B7 | dependency classes under “same family OR declared coverage overlap ratio ≥ 1/2 (|A∩B| / max(|A|,|B|))”, capped K (the shipped relation) |
| B8 | oracle upper bound: distinct blind-spot sets among the surviving families plus, for correct claims, distinct families, capped K; analysis only, never a shipped grader |

## 5. Metrics (mean and 5th percentile over the 200 committed seeds)

- **PW(arm, regime)**: mean over the 12 pairs of 1 on win, 0.5 on tie, 0 on loss.
- **AUC(arm, regime)**: ROC AUC of arm score vs hidden `defective` over all 48 live claims.
- **AP@12(arm)**: rank claims by suspicion `1/score` (tie-break: fewest distinct dependency
  classes, then claim id); replay the top 12 with the oracle family; fraction actually defective.
- **Churn Δγ**: mean |score(C) − score(R)| per claim, and the fraction of pairs whose ranking
  flips toward the churned side; computed for every arm, reported for B7.
- **Demotion sanity**: over 100 seeded synthetic DAGs with one refuted node, precision = recall =
  1.0 vs the reachable-set oracle (tests the contract, never sold as significance).

## 6. Criteria (frozen; thresholds never move)

Pass criteria for the shipped relation B7 (5th percentile over seeds where noted):

| ID | Criterion |
|---|---|
| P1 | PW(B7) − PW(B1) ≥ 0.15 in regime R |
| P2 | PW(B7) − PW(B5) ≥ 0.10 and AUC(B7) − AUC(B5) ≥ 0.10 in regime X |
| P3 | churn mean Δγ ≤ 0.1 and pair flips ≤ 5% for B7 (seeds never add warrant) |
| P4 | AP@12(B7) ≥ 0.75 and AP@12(B7) ≥ AP@12(B5) + 0.10 |
| P5 | AUC(B7) ≥ AUC(B5) − 0.02 in every regime |

Diagnostics and kill criteria (reported in the paper):

| ID | Trigger | Meaning |
|---|---|---|
| F1 | B6 advantage: `p5(PW[B6,R] − PW[B1,R]) ≤ 0.05` **and** `p5(PW[B6,X] − PW[B7,X]) ≤ −0.10` (B6 does not beat the count baseline in R and is dominated by B7 in X) | the syntactic tuple variant is a dedup count — expected; it is why B7 ships |
| F2 | P3 fails for the shipped relation | independence is producer-purchasable with seeds — kill the wave |
| F3 | AUC(B8) − AUC(B5) ≤ 0.05 in X | even true semantic independence has no headroom — kill the wave |
| F4 | reported diagnostic: collapsed-manifest X advantage `p5(PW[B7,X] − PW[B5,X])` (X pair sides already carry one attempt per family, so the collapse is a no-op) | the X advantage is not duplicate suppression, reported honestly either way |

F1 is expected to trigger for B6 and is reported as a finding, not a gate failure. F2 and F3
gating the wave; F4 is reported. The gate (verify-warrant.ts) enforces P1–P5 and that F2/F3 do not
trigger.

## 7. Anti-gaming (binding)

Ground truth only from the generator's blind-spot table; pairs matched on raw count so B1 ties
rather than losing to a construction artifact; B5 is the adversary, not a strawman; B8 is the
oracle ceiling so “the corpus was too easy” cannot rescue a failure; thresholds apply to the 5th
percentile over the 200 committed seeds; the seed list, draw order, and thresholds are frozen in
this file; any failure is reported in the paper's Results and Failure Cases sections, and no
threshold is ever edited after the first run.

## 8. Implementation-reality errata (added after the first green run; binding corrections)

- **Overlap coefficient, not Jaccard.** The shipped relation is `|A∩B| / max(|A|,|B|) ≥ 1/2`
  (`overlapRatio` in registry.ts). Probes A={a,b}, B={a,c} merge under the shipped rule although
  their Jaccard is 1/3. Any wording that says "Jaccard" is wrong and must say "coverage overlap".
- **Regime D coincides with R.** Under the binary blind-spot model a defective claim can only
  survive attempts from its one blind family, and the correct side already spans three disjoint
  families in R; D is therefore reported as the diverse-label control, not as independent evidence.
- **Seed step.** Run `i` (0-based) uses the LCG state after `i+1` advances from `ARENA_BASE_SEED`;
  the demotion suite continues from `advance(ARENA_BASE_SEED, ARENA_SEEDS + 1)`.
- **AP@12 tie-break** is the original claim index (the metric signature has no registry); the
  paper must not claim the classes/families tie-break.
- **Gate pin scope.** `verify-warrant.ts` pins the digest, the nine criteria statuses and 16
  headline mean cells; the paper's full cell audit (167 cells) is performed by the paper verifier
  and the evidence harness, not by the gate.
# Wave 44 — Blueprint Part 1c: evidence gate, tests, and Warrant Lab UI

Repo: `deepforge`. Scope: this file only; no git. Read with `wave-44-blueprint-part1a.md` (frozen engine
layout; `WARRANT_MAX_GRADE=K=3`, `WARRANT_MAX_CHAIN=64`, `WARRANT_MAX_INCONCLUSIVE_PER_PAIR=1`,
`ARENA_SEEDS=200`, `ARENA_BASE_SEED=0x9e3779b9`) and `wave-44-attack-significance.md` §3.3–§3.5/§5
(criteria, red lines). Arena shape: 48 claims (4 kinds), regimes R/D/C/P/X, graders B0–B8 (B8 analysis-only,
E11), 200 frozen seeds. Everything is executable as written; measured values come from the run, never copy.

## §4. Evidence + gate

### 4.1 `scripts/warrant-evidence.ts`
- `bun run scripts/warrant-evidence.ts`. Imports Bun/Node built-ins plus the public barrel `../src/lib/warrant`; scripts may use `performance.now` (the engine may not). No other repo imports.
- Run `runArena({ seeds: 200 })` twice; require equal `.digest` and byte-equal `canonicalJson(result)`; a mismatch exits nonzero (determinism failure).
- Require first-run wall `<= 2000 ms` (`ARENA_BUDGET_MS`); overrun exits nonzero. Timing goes to stdout only, never into the JSON.
- No timestamps, absolute paths, or locale-dependent values in the payload (`canonicalJson` gives stable key order); `digest = warrantHash(canonicalJson(payload without "digest"))`.
- Write `warrant-evidence.json` to `DF_WARRANT_SCRATCH ?? join(tmpdir(), "deepforge-warrant-evidence")`; print path, digest, runtime.
- P1–P5/F1–F4 come from per-seed vectors by §4.2 rules; `ceiling.aucGapX = auc.X.B8.mean − auc.X.B5.mean` is analysis-only (E11). AP@12 is per grader.

```
warrant-evidence.json — canonicalJson order; "digest" removed before hashing
{
  "ap12":  { "<regime R|D|C|P|X>": { "B0".."B8": { "mean": n, "p5": n } } },
  "arena": { "config": { "baseSeed": 2654435769, "seeds": 200 }, "digest": D,
             "pw":  { "<regime>": { "B0".."B8": { "mean": n, "p5": n } } },
             "auc": { "<regime>": { "B0".."B8": { "mean": n, "p5": n } } },
             "churn": { "pairFlipRate": n, "seedDeltaMean": n },
             "demotion": { "precision": n, "recall": n }, "ceiling": { "aucGapX": n } },
  "criteria": { "P1".."P5","F1".."F4": { "measured": n, "status": "pass"|"fail", "threshold": "..." } },
  "seeds": 200, "digest": D
}
```

### 4.2 `scripts/verify-warrant.ts`
- Mirror `scripts/verify-keyfuse.ts` structure exactly: `#!/usr/bin/env bun` header listing criteria,
  `mkdtempSync(join(tmpdir(), "warrant-gate-"))` scratch removed in `finally`, ordered `check(name, fn)`
  criteria returning detail strings, summary table, one machine line last,
  `process.exit(failed === 0 ? 0 : 1)`.
- Never trusts the artifact: re-run arena and contract fixtures from the engine, then compare the fresh
  recomputation with `warrant-evidence.json` (digest + pinned cells) and `EXPECTED`.
- `EXPECTED` (literal, reviewed green run, no auto-update): `seeds: 200`, `baseSeed: ARENA_BASE_SEED`,
  `arenaDigest`; every `{mean,p5}` for B0–B8 × R,D,C,P,X in `pw`/`auc`/`ap12` (T3–T5, F1–F3 source);
  `churn`/`demotion`/`aucGapX`; `criteria` measured (3 dp) + status. `WARRANT_GATE_UPDATE=1` is refused:
  EXPECTED changes only in one reviewed commit together with the paper.
- Drift: any cell or status differing from EXPECTED after 3-decimal rounding fails with path, pinned and
  computed values. Criteria pass/fail is always recomputed, never read from the artifact.

| ID | Recomputed per-seed expression | Rule (5th percentile unless stated) |
|---|---|---|
| P1 | `max(PW_R.B6, PW_R.B7) − PW_R.B1` | p5 ≥ 0.15 |
| P2 | `PW_X.B7 − PW_X.B5`; `AUC_X.B7 − AUC_X.B5` | both p5 ≥ 0.10 |
| P3 | `churn.seedDeltaMean` (mean); `churn.pairFlipRate` | ≤ 0.1; ≤ 0.05 |
| P4 | `AP12_X.B7`; `AP12_X.B7 − AP12_X.B5` | p5 ≥ 0.75; p5 ≥ 0.10 |
| P5 | `PW_r.B7 − PW_r.B5` for every regime r | p5 ≥ −0.02 each |
| F1 | holds iff `B6−B1 ≤ 0.05` p5 in R **and** `B6−B5 ≤ 0.05` p5 in X (mean also recorded) |
| F2 | holds iff P3 fails for the shipped relation |
| F3 | holds iff `AUC_X.B8 − AUC_X.B5` p5 ≤ 0.05 |
| F4 | holds iff family-collapsed `ΔPW(B6 or B7 − B1)` p5 < 0.03 (advantage did not survive collapse) |

- Failure rule: any drift or failed criterion exits nonzero and is reported honestly. A criterion that
  fails at build time ships as `fail` in artifact, gate line, paper, and UI (negative-result path); never
  edit a threshold, drop a criterion, or substitute mean for p5 to make it pass.
- Last line: `WARRANT_GATE {"passed":N,"failed":M,"seeds":200,"criteria":9,"runtimeMs":T}`.
- Wiring (part2 §8.10/§8.11): CI step after KeyFuse — name `Verify Warrant (contract + arena gate)`,
  `timeout-minutes: 6`, `run: bun run scripts/verify-warrant.ts`; package script
  `"verify:warrant": "bun run scripts/verify-warrant.ts"`.

## §5. Tests

`tests/warrant.test.ts` — `bun test tests/warrant.test.ts` (contract; fixtures through the public barrel):

| Invariant | Assertion |
|---|---|
| I1' auditable grade | `audit` recomputes λ transitively from leaves; a one-field `publishedGrade` mismatch at any depth yields `grade-mismatch` and `ok=false`; unchanged publish audits ok. |
| I2' no bookkeeping inflation | same `(refuter,family)` × 8 seeds/replays/re-signings → D unchanged; one new pair → D+1; version id as refuter → `version-not-root`; cosmetic roots add 0. |
| I3' exact demotion | generated cite DAG: `{v : λ(v)=="dead"}` equals the reachable-set oracle `{v : some cites path reaches a refuted value}`; precision = recall = 1; derive on dead cites is dead; refuted is absorbing over survivors. |
| I4' append-only/monotone/absorbing | `admit` returns a new store (input deep-equal after); chains only grow; surviving appends never lower an unaffected λ; re-assert of a dead id throws `RefusedRemintError`; no delete/rewrite op exists. |
| identity/laundering | cites canonicalize sorted/duplicate-free; ids context-keyed; declared-coverage subsumption rejected where decidable, overlap recorded otherwise; extra roots of one author stay visible (declared residual) and add no hidden class. |
| audit forgery detection (transitive) | single-field mutation of any append in a 5-deep chain gives the right issue kind + index and `head-mismatch` for a stale anchor; every mutation changes the head (no collision in the fixture); a forged well-formed chain recomputes cleanly (audit = arithmetic + anchor, not authenticity). |
| admission caps | append 64 ok, 65th → `chain-budget`; second inconclusive same pair → `duplicate-inconclusive`; a different pair may add one; rejected attempts never enter a store. |

`tests/warrant-arena.test.ts` — `bun test tests/warrant-arena.test.ts` (arena):

| Invariant | Assertion |
|---|---|
| B7 dependence | join iff same family or `overlapRatio ≥ 1/2`; seeds/replays/versions neither join nor split; f3'≡f2 X pair collapses to 1 class; `dependencyClasses` is order-independent and a strict generalization of pair counting. |
| grader formulas | micro-fixtures: 4 same-family seeds → B0=1, B1=4, B2 pinned, B3=4, B4 alive, B5=1, B6=4, B7=1; 3 distinct families → B5=B6=B7=3; B8 = distinct blind-spot classes; `ORACLE_GRADER` absent from the barrel and unimported by UI (E11). |
| arena determinism | `runArena({seeds:5})` and `runArena()` (200) each run twice → byte-equal canonical JSON and equal digests; every seed's corpus regenerates from `lcg(ARENA_BASE_SEED)`. |
| 200-seed sweep | `{mean,p5}` present for 5 regimes × 9 graders; B1 ties on every matched pair (±0 survivors); p5 is nearest-rank; digest pinned. |
| F-statuses | F1–F4 recomputed statuses equal the gate pin and the paper's rendered values (recomputation is the only source). |

`tests/warrant-safety.test.ts` — `bun test tests/warrant-safety.test.ts` (scans and demo pin):

| Invariant | Assertion |
|---|---|
| forbidden-claims scan | deny-list over the four UI files with keyfuse-style negation allowance plus positive/negative controls; tokens: `verified`, `validated`, `correct`, `accurate`, `safe`, `certified`, `hallucination-free`, `trusted`, `quality`, `percentage`, `probability`, `star rating`, `independence number`, `max independent set`, `independent checks`, `never challenged` (positive), `mastery`, `readiness`, `XP`, `streak`, `rank`, `gating`, `recommendation`, `teacher`; every match must sit inside an explicit denial. |
| design-token scan | the four UI files use only the eleven tokens of §6.1; deny `shadow-`, `gradient`, `uppercase`, blur, colored statuses (`text-red-*` etc.), `#hex`/`rgb(`/`hsl(`; positive controls; each required token appears at least once. |
| purity scan | `src/lib/warrant/*.ts` (part1a list) free of `Date`, `Date.now(`, `Math.random(`, `crypto.`, `process.`, `from "node:`, `require(`, `fetch(`, `XMLHttpRequest`, `localStorage`, `window.`, `document.`, `setTimeout(`, `setInterval(`, dynamic `import(`, `console.`, `from "@/`; impure positive control. |
| demo pin | the nine demo claims rebuilt through the public API equal γ `[3,3,0,dead,2,1,2,0,2]`, blast radii `e01→{p04,h08}`, `p03→{}`, `h05→{}`, and the frozen anchor audits ok; no card copy carries a banned token. |

## §6. UI

### 6.1 Files and pattern
- `src/app/warrant/page.tsx` — keyfuse/page.tsx pattern (`PageShell`, `TITLE`, honest `DESCRIPTION`, canonical `/warrant`, OpenGraph/Twitter) rendering `<WarrantLab/>` plus a `What this is not` card carrying §6.6; imports only the component and `@/components/PageShell` (E12).
- `WarrantLab.tsx` (`"use client"`) owns demo store state and composes `LedgerPanel` and `BlastRadius`; `LedgerPanel.tsx`/`BlastRadius.tsx` are prop-only, no state, imports limited to the barrel.
- Layout mirrors KeyFuseLab exactly: `mx-auto w-full max-w-6xl px-4 pb-4 pt-6 sm:px-6`, cards `rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5`, keyfuse `SELECT_CLASS` on selects, result heading with `id`+`tabIndex={-1}` focused after each action, `aria-live="polite"` results region.
- Tokens only: `bg-canvas bg-canvas-card bg-canvas-soft border-hairline text-ink text-body text-body-mid text-mute text-accent border-accent/40 bg-accent/5`; no shadows, gradients, blur, uppercase, or colored status tokens; body copy ≥ `text-xs`; focus rings `focus-visible:ring-accent/40`.
- 375 px-safe: single column, no fixed widths, ids `break-all`, tables inside `df-scroll max-w-full overflow-x-auto` stacked as cards below `sm`; accessible: every control labeled, real `<button>`s with `min-h-11` on touch, headings h2/h3, color never the only signal.

### 6.2 Frozen demo subset
Built once at module scope through the public API from literal manifests; registry = one author root,
family roots F0–F3 (`blind:0,1 / 2,3 / 4,5 / 6,7`; F3 declared equal to F2 to expose the X overlap),
paired refuter roots r0–r3, literal `submittedBy`, decimal-string seeds; no clock. Ids follow arena kind
order (12 hint, 12 explanation, 12 difficulty, 12 prerequisite).

| id | kind | ledger (all admitted) | γ | role |
|---|---|---|---|---|
| `hint-000` | hint | survived f0, f1, f2 | 3 | K=3 saturation note |
| `explanation-001` | explanation | survived f0, f1, f2 | 3 | blast-radius root on challenge |
| `difficulty-002` | difficulty | none | 0 | "No challenge recorded." |
| `prerequisite-003` | prerequisite | refuted f2 | dead | dead ≠ 0 |
| `prerequisite-004` | prerequisite | survived f0, f1; cites `explanation-001` | 2 | radius member |
| `hint-005` | hint | survived f2, f3 (F3≡F2) | 1 | X pair side A (dependency classes only) |
| `explanation-006` | explanation | survived f0, f1 | 2 | X pair side B |
| `difficulty-007` | difficulty | inconclusive f1 | 0 | "No admitted refutations." |
| `hint-008` | hint | survived f2, f3; cites `prerequisite-004` | 2 | transitive radius member |

### 6.3 Claim card (`LedgerPanel.tsx`)
- kind chip; payload via `canonicalJson` in a `break-all` `<pre>`; cites with each cite's current λ and
  whether it pins the grade (argmin of the minGrade fold).
- warrant line (E6): `"3 declared dependency classes survived; 0 refutations; 3 challenges on record."`;
  dead: `"Refuted: grade dead (terminal); 1 refutation on record."`; pluralization helper.
- ledger: ordered append rows (index, family, refuter, outcome, seed, admittedBy, prev→head 4-char digest
  prefixes); no dates; rejected attempts are never listed because they never entered the store.
- γ definition verbatim `γ(v) = dead if any admitted refuted append else min(K, D(chain), min γ(cites))`,
  `K = 3` (WARRANT_MAX_GRADE), saturation note when `D ≥ K`; D labeled "declared dependency classes".
- declared dependence relation `same family OR declared coverage overlap ≥ 1/2`, plus one sentence on
  blind spots (syntactic relation; shared method/blind spot survives it — Knight–Leveson).
- last challenge = logical index `chain.length` only, or "No challenge recorded"; never a date.
- empty states: zero appends → "No challenge recorded." plus "Absence of attempts is not survival.";
  appends but no refuted → "No admitted refutations." plus "None were recorded and admitted, not none exist."

### 6.4 Actions (all local, browser-session only, nothing stored or sent)
- `challenge`: builds `Attempt{refuter=r(family), family, seed=next unused decimal for the pair, outcome,
  cost=0, witness=warrantHash(canonicalJson({claim,family,outcome,seed})), submittedBy="demo-challenger"}`,
  then `submit`+`admit(admittedBy="demo-verifier")`; `AdmissionError.code` is rendered and nothing appends;
  success recomputes λ for the claim and all dependents and, on refuted, renders `BlastRadius`. Button copy
  says "Local challenge (this session only)".
- `why`: `why(store,id)` → chain+cites plus the fold trace (own D, each cite λ, argmin) and the sentence
  naming which cite pins γ; pure read.
- `audit`: `audit(id,store,registry,published,anchor)` with the frozen demo anchor; renders `ok` and every
  issue with index/detail; unchanged claims audit ok, a locally challenged claim reports `head-mismatch`
  (the anchor predates the session); audit never mutates and is never truth (E4).

### 6.5 Blast radius (`BlastRadius.tsx`)
`WarrantLab` computes `demoted = cone(challenged) ∪ {challenged}` (dependents-only closure through cites)
and `unchanged = demo ids minus demoted`; the panel shows each demoted id's old→new λ and cites path, and
states "exact demotion: these and only these" — the list is the test of I3', not a probability. No B8, no
scores, no percentages.

### 6.6 Copy red lines (page "What this is not" repeats these; safety test scans them)
- Never "verified", "validated", "correct", "accurate", "safe", "certified", "hallucination-free", "trusted", "quality", percentage, probability, or star rating for a claim's grade.
- Never a grade for assessment or grading of learners, mastery, readiness, XP, streaks, ranks, path gating, recommendations, or teacher reporting; grades rank content contestability, never people.
- Never imply counts prove failure independence: shown numbers are declared dependency classes ("declared check-families"), never "independent checks"; disclose blind spots (Knight–Leveson).
- Never audit = truth: audit checks arithmetic against the ledger; hash chains are tamper evidence, not authenticity.
- Never sell "never challenged" as a positive warrant; absence of attempts is not survival.
- Never let a refuted learner-authored explanation count against the learner: refute the claim, not the person; never change learner scores.
- No learning-outcome claim for RLV itself; the real-problem evidence is about the problem, not this solution.
# Wave 44 — Blueprint Part 2: Paper spec, wiring, errata, build order

Repo: `deepforge`. Scope: this file only; touch nothing else; no git commands. Audience: builders who
have not read the research docs. Normative inputs (read-only): `wave-44-candidates-a.md` §C2,
`wave-44-priorart-refutation.md` §2/§6, `wave-44-attack-significance.md` §3/§5. Everything below is
deterministic pure TypeScript, zero new dependencies. Wave 44 ships the invention
**Refutation-Ledger Values** (paper slug `refutation-ledgers`, route `/warrant`) plus the
**Derived-Claim Arena** experiment.

---

## 7. Paper spec for `src/data/inventions/refutation-ledgers.ts`

Frozen metadata: `id: "refutation-ledgers"`, `slug: "refutation-ledgers"`,
`title: "Refutation-Ledger Values: Auditable Warrant Accounting for Contestable Derived Claims"`,
`authors: ["DeepForge Research"]`, `date: "2026-09-18"`, abstract ≥ 200 chars using only measured
arena numbers and the corrected claim ceiling (below), `keywords` ≥ 6 (warrant, falsification ledger,
recomputed grade, declared dependence classes, exact demotion, audit, contestability).
Registration: `INVENTIONS[0]` (newest first) in `src/data/inventions/index.ts`; `sections` are rendered
by `PaperBody.tsx`, which appends `paper.references` itself — do **not** add a References section to
`sections`. Renderer block kinds only: `paragraph | list | formula | code | table | figure | callout`;
figures require `{id,title,caption,unit,max,series:[{label,bars:[{label,value}]}],gate?}`.

### 7.1 Section list (10 code sections + the references array = 11 listed sections)

1. `introduction` — "1. Introduction & motivation": 2 paragraphs on the real problem (derived content
   consumed without negative evidence; cite Stanford RegLab hallucination study, JAMA Epic sepsis
   AUC 0.63 vs claimed 0.76–0.83, PNAS GPT-4 tutoring −17% exam result); 1 paragraph on the gap
   (verification is positive-only; defeaters unrecorded; Assurance 2.0); 1 list of what the paper
   contributes (a value-level ledger→grade→demotion *contract* only); 1 callout **"The claim
   ceiling"** carrying the prior-art §6 defensible claim verbatim with the E3 wording substitution
   (below) plus the not-claimed sentence.
2. `related-work` — "2. Related work, stated honestly": 2 paragraphs; **T1** "Closest work and the
   exact delta" — a static table (no arena numbers) with columns Work | URL | Implements | Clause
   matched | Not implemented, rows copied from prior-art §2 (see 7.3).
3. `model` — "3. Model and definitions": formula **Fm1** "Attempt, value, ledger, cite graph"
   (`Attempt{refuter,family,seed,outcome∈{survived,refuted,inconclusive},cost}`; value = payload,
   kind, append-only ledger, cites); formula **Fm2** "Grade γ and declared dependence D"
   (`dead` absorbing; `γ(v)=dead` if any refuted; else `min(K, classes(v), min γ(cites))`;
   `Dependent(a,b) := sameFamily ∨ declaredCoverageOverlap ≥ 1/2`; `classes(v)` = count of distinct
   D-classes with ≥ 1 survivor; seeds are repetitions and never create a class); callout "Instance vs
   claim semantics" (an attempt instance is evidence about a claim; it is not the claim, not a truth
   value, and not a statement about the person); list I1–I4 (auditable grade, non-inflation under
   replay, exact demotion, monotone ledger).
4. `grade` — "4. The grade algebra": paragraphs on class counting, K=3 cap and saturation note,
   cites-min, recompute; code block "Frozen API" (Attempt/Value/`audit(v, ledger)` signatures);
   callout "dead ≠ 0" (grade domain is `dead ∪ {0..K}`; dead is terminal and ordered below every
   k-warranted value; no rendering as 0).
5. `arena` — "5. The Derived-Claim Arena": paragraphs; **T2** "Corpus, regimes, and graders" (config
   constants: 48 claims = 4 kinds × 12; 8 defect classes; 16 refuters in 4 families with blind spots
   f0{0,1} f1{2,3} f2{4,5} f3{6,7}; oracle family for scoring only; regimes R/D/C/P/X; 12 matched
   conflict pairs per regime; 200 frozen seeds; graders B0–B8); formula **Fm3** seed LCG
   `s ← (1664525·s + 1013904223) mod 2^32`; callout "Anti-gaming of the experiment" (generator
   ground truth, count-matched pairs, B5 as adversary, B8 as ceiling, 5th-percentile thresholds,
   seeds frozen before the run).
6. `experiments` — "6. Experiments": **T3–T6, F1–F3** (7.2); 1 callout "Outcome space: P1–P5,
   F1–F4" (exact thresholds, and the honest path: if F1/F2 hold for B6, the paper reports B6's
   failure and headlines B7 only if P2–P4 pass at the 5th percentile; otherwise it publishes the
   negative result and the route/UI copy says so); 1 paragraph "Reading the tables" (ties count 0.5;
   thresholds apply to the 5th percentile; B8 is analysis-only).
7. `limits` — "7. Failure cases & limitations": list — dead≠0; syntactic dependence has declared
   blind spots (Knight–Leveson); fabricated-but-consistent ledgers out of scope; admission trust root
   is the append point; absence of attempts is not survival; saturation at K hides diminishing
   returns; cost of refuters; instance-vs-claim semantics; B8 not implementable; demotion sanity
   tests TMS, not significance and must not be sold as novelty; corpus is synthetic and ground truth
   is generated, never inferred from a grader.
8. `product` — "8. Product: the Warrant Lab": paragraph (read-only, browser-local, no storage, no
   network, logical challenge indices, never `Date.now()`); list ships/cut; callout "Honest copy"
   (three strings from significance §5 verbatim); list "Must not claim or do" (the §5 red lines,
   copied).
9. `reproducibility` — "9. Reproducibility & the evidence gate": paragraph; code block with
   `bun run scripts/warrant-evidence.ts`, `bun run verify:warrant`, `bun test tests/warrant*.test.ts`;
   list of the gate's pinned criteria; callout "No auto-update path" (drift fails the gate; the gate
   constant and the paper change in one reviewed commit).
10. `future` — "10. Future work": list — refuter libraries per claim kind; semantic coverage
    dependence; signed ledgers for third-party re-audit; attempt aging/decay; combining with BDL
    behavioral deltas; an explicitly-scoped rehabilitation operation.
11. `references` — the `paper.references` array (renderer appends it); every entry `https://`, unique
    ids; contents per 7.3.

### 7.2 Figure/table catalogue and exact data sources

All values come from `scripts/warrant-evidence.ts` (never hand-written). The script writes
`warrant-evidence.json` (canonical JSON, no absolute paths, digest printed) with the JSON paths below;
`scripts/verify-warrant.ts` re-runs the arena and imports the paper, asserting every table cell and
figure bar equals the fresh artifact (exact equality after 3-decimal rounding). No clock, no RNG
other than the frozen seed LCG.

| ID | Title | Kind | Exact data source (`warrant-evidence.json` path) |
|---|---|---|---|
| T1 | Closest work and the exact delta | table | static, prior-art §2 rows (no artifact data) |
| T2 | Corpus, regimes, and graders | table | `arena.config` (generator constants; recomputed by gate) |
| T3 | Pair-win rate (PW) by grader × regime, mean / p5 over 200 seeds | table | `arena.pw[regime][grader].{mean,p5}` for B0–B8, regimes R,D,C,P,X; ties 0.5 |
| T4 | Calibration (AUC) by grader × regime | table | `arena.auc[regime][grader].{mean,p5}`; B8 row included |
| T5 | Decision metrics: AP@12, churn Δγ, pair-flip rate, demotion sanity | table | `arena.ap12[regime][grader].mean`; `arena.churn.seedDeltaMean`; `arena.churn.pairFlipRate`; `arena.demotion.{precision,recall}` |
| T6 | Kill-criterion status F1–F4 | table | `kill[F1..F4].{measured,threshold,status}` (five readings from significance §3.4) |
| F1 | PW by grader in regimes R and X | figure | `arena.pw.R.*`, `arena.pw.X.*` for B1/B5/B6/B7/B8; `gate: 0.75` |
| F2 | AUC in regime X: B5, B7, and the B8 oracle ceiling | figure | `arena.auc.X.{B5,B7,B8}.mean`; gap `arena.ceiling.aucGapX = auc.X.B8 − auc.X.B5`; `gate: 0.05` headroom bar in caption |
| F3 | Audit precision AP@12 by grader | figure | `arena.ap12.X.*`; `gate: 0.75` (P4) |

Pinned thresholds (must appear in T6 and the outcome callout): P1 `PW(B6|B7) − PW(B1) ≥ 0.15` in R;
P2 `PW(B7) − PW(B5) ≥ 0.10` **and** `AUC(B7) − AUC(B5) ≥ 0.10` in X; P3 seed-churn mean Δγ ≤ 0.1 and
flips ≤ 5%; P4 `AP@12 ≥ 0.75` and `≥ B5 + 0.10`; P5 `B7 ≥ B5 − 0.02` in every regime; F1
`B6 ≤ B1+0.05` in R and `B6 ≤ B5+0.05` in X; F2 P3 fails for the shipped relation; F3
`AUC(B8) − AUC(B5) ≤ 0.05` in X; F4 the B1-advantage survives family collapse (delta < 0.03).
The abstract may quote at most: PW, AUC, AP@12, churn, and the F-statuses, each equal to a T3–T6 cell.

### 7.3 Required references (id — citation — URL)

totem — mmnto-ai/totem capability falsification (commit fc3f4114) —
https://github.com/mmnto-ai/totem/blob/fc3f4114/packages/core/src/capability/falsification.ts ·
falsifyr — attack leaderboard keyed by family+seed — https://github.com/msaule/falsifyr/ ·
falsification-ledger — append-only hash-chained ledger — https://github.com/foolproof-labs/falsification-ledger ·
falsification-ledger hit-rate report — https://pypi.org/project/falsification-ledger/ ·
FalsiFlyer — AUDIT_LEDGER_SPEC — https://github.com/subvurs/FalsiFlyer/blob/main/docs/AUDIT_LEDGER_SPEC.md ·
Doyle 1979 TMS — https://dspace.mit.edu/handle/1721.1/5733 ·
de Kleer 1986 ATMS — https://www.dekleer.org/Publications/An%20Assumption-Based%20TMS.pdf ·
provenance semirings — https://dl.acm.org/doi/10.1145/1265530.1265535 ·
why/where provenance — https://dl.acm.org/doi/10.5555/645504.656274 ·
Verheij accrual — http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.41.4458 ·
weighted gradual semantics — https://doi.org/10.24963/ijcai.2017/9 ·
truth discovery with dependent sources — https://doi.org/10.1145/2897350.2897352 ·
subjective logic / EBSL (Jøsang) — https://doi.org/10.1016/s0218-4885(01)00083-1 ·
Dempster–Shafer dependence caveat — https://arxiv.org/abs/1303.1518 ·
Knight & Leveson 1986 — https://www.csc.kth.se/utbildning/kth/kurser/DA2210/vettig13/Seminarier/KnightLeveson.pdf ·
Assurance 2.0 defeaters — https://www.csl.sri.com/~rushby/papers/defeaters24.pdf ·
EviBound — https://arxiv.org/abs/2511.05524 ·
evidence-ledger adjudication — https://arxiv.org/html/2607.26512v1 ·
SV-COMP witnesses 2.0 — https://www.sosy-lab.org/research/pub/2024-SPIN.Software_Verification_Witnesses_2.0.pdf ·
certified DL subsumption (PAAR 2020) — https://ceurspt.wikidata.dbis.rwth-aachen.de/Vol-2663/paper-5.pdf ·
mutant subsumption graphs — https://dl.acm.org/doi/10.1109/ICSTW.2014.20 ·
ORCHESTRA deletion/derivability — https://repository.upenn.edu/cis_papers/655 ·
falsifyr survival vignette — https://mirrors.linux.iu.edu/CRAN/web/packages/falsifyr/vignettes/interpreting-survival-scores.html ·
Bloomfield, Netkachova & Rushby, defeaters — https://arxiv.org/abs/2405.15800.
Also cite the product-problem evidence: https://reglab.stanford.edu/publications/hallucination-free-assessing-the-reliability-of-leading-ai-legal-research-tools/,
https://jamanetwork.com/journals/jamainternalmedicine/fullarticle/2781307,
https://www.pnas.org/doi/abs/10.1073/pnas.2422633122.

### 7.4 Defensible claim and forbidden overclaims

Carry this claim in the callout, abstract, related-work table, and product copy (prior-art §6, RLV,
with errata E3 applied): *the defensible claim is that a runtime value's warrant is an append-only,
tamper-evident ledger of falsification attempts whose grade is a total, recomputable function of that
ledger (declared dependence-class term, K-cap, and cited-value grades included — the original wording
"independence-number term" is forbidden, see §9 E3) and whose demotion is exact with respect to the
cite graph — a value-level ledger→grade→demotion contract that no located work implements; the
individual mechanisms (TMS retraction, evidence-fusion independence, audited ledgers, attack-family
scoring) are all known.* Forbidden everywhere (paper, UI, code comments, docs): "max independent
set"/"independence number"; "verified", "validated", "correct", "accurate", "safe", "certified",
"hallucination-free", "trusted", "probability", percentages or star ratings for a value; any truth
guarantee; any claim that audit proves truth (audit = consistency + anchored tamper-evidence only);
any authenticity claim (admission trust root is the append point; fabricated well-formed ledgers out
of scope); any score/path/rank/teacher-view effect; any claim that attempt counts prove failure
independence; any "never challenged is good" framing; any instance-vs-claim conflation (refute the
claim, never the person or learner).

---

## 8. Wiring checklist (exact file, exact change, exact anchor)

1. `src/lib/sections.ts` — SectionId union: add `| "warrant"` immediately after `| "keyfuse"`
   (line 27). SECTION_LIST: insert one entry immediately after the `keyfuse` entry (after its closing
   `},` at line 305) and before the `sims` entry:
   `{ id: "warrant", href: "/warrant", title: "Warrant Lab", blurb: "A read-only contestability lab: derived claims carry an append-only falsification ledger, a recomputable warrant grade, and exact demotion through cites — never a truth verdict.", group: "Learn", icon: "M12 3v18M6 6l-4 8a4 4 0 0 0 8 0zM18 6l-4 8a4 4 0 0 0 8 0zM4 21h16", keywords: ["warrant", "refutation", "ledger", "audit", "challenge", "grade", "demote", "cites"] },`
2. `src/components/NavMenus.tsx` — NavItemId union: add `| "warrant"` after `| "keyfuse"` (line 28).
   NAV_ITEM_LABELS: add `warrant: "Warrant Lab",` after `keyfuse:` (line 62). NAV_MENUS learn group
   items: add `"warrant"` after `"keyfuse"` (line 102). MOBILE_NAV_GROUPS "Learn" items: add
   `"warrant"` after `"keyfuse"` (line 142).
3. `src/lib/quickActions.ts` — insert after the `open-keyfuse` action (after line 74):
   `{ id: "open-warrant", label: "Open the Warrant Lab", keywords: ["warrant", "refutation", "ledger", "audit", "challenge", "grade", "cites"], kind: "navigate", href: "/warrant" },`
4. `tests/quickActions.test.ts` — required-verbs list (lines 72–83): add `"open-warrant"`; add
   `expect(actionById("open-warrant").href).toBe("/warrant");`. Keyword test: add
   `expect(matchQuickActions("warrant").map((a) => a.id)).toEqual(["open-warrant"]);`. Ordering test
   (lines 128–147) must become: `"the"` →
   `["theme-toggle","review-queue","open-warrant","assistant-show","assistant-hide","behavior-ledger","daily-challenge"]`;
   `"open"` →
   `["papers","lab-trails","labs","review-queue","today-session","open-warrant","behavior-ledger","research","open-keyfuse"]`
   (label "Open the Warrant Lab" is 20 chars: after today-session in `"open"`, before assistant-show in
   `"the"`).
5. `src/app/sitemap.ts` — ROUTES: add `{ path: "/warrant", changeFrequency: "weekly", priority: 0.5 },`
   after the `/keyfuse` row (line 52).
6. `public/sw.js` — line 32: `const VERSION = "v11";`. PRECACHE_ROUTES: add `"/warrant",` after
   `"/verify",` (line 93). NAVIGATION_FALLBACKS unchanged (static route).
7. `tests/offline.test.ts` — STATIC_ROUTES: add `warrant: "/warrant",` after `verify: "/verify",`
   (line 58). This also requires `src/app/warrant/page.tsx` to exist.
8. `scripts/measure-bundle.ts` — KEY_ROUTES: add `"/warrant",` after `"/keyfuse",` (line 55).
   BUDGETS_KB: add `"/warrant": <N>,` after the `/keyfuse` entry, mirroring the integer-KB style;
   `N = ceil(measured gzip first-load KB × 1.15)` from an informational run
   (`bunx next build && bun run scripts/measure-bundle.ts`), never below the measured value.
9. `scripts/e2e-smoke.mjs` — insert a new block after the Wave-42 block (after line 598), before the
   Summary block (line 600): `// --- 18. Wave-44 surfaces (Warrant Lab + paper #5)`, heading
   `console.log("\n[18/19] Wave-44 surfaces");`, four `record` checks mirroring the ledger block:
   `GET /warrant` 200 and body contains `"Warrant Lab"`; `sitemap.body` contains `"/warrant"`;
   `GET /inventions/refutation-ledgers` 200 and body contains `"Abstract"` and
   `"Refutation-Ledger Values"`; `GET /inventions/refutation-ledgers/paper.pdf` content-type
   `application/pdf` and magic `%PDF-`. Renumber line 601 to `console.log("\n[19/19] Summary");`.
10. `.github/workflows/ci.yml` — insert after the KeyFuse step (after line 63), before the Build step
    (line 65):
    `      - name: Verify Warrant (contract + arena gate)\n        timeout-minutes: 6\n        run: bun run scripts/verify-warrant.ts`
11. `package.json` — after `"verify:keyfuse"` (line 14) add
    `"verify:warrant": "bun run scripts/verify-warrant.ts",`.
12. Docs counters (measured values only; run the commands, paste the numbers):
    - `README.md`: line 67 insert a Warrant-Lab feature bullet after the KeyFuse bullet; line 157
      `bun test` comment → measured `N` tests (`M` files); line 160 smoke comment → measured
      `K`-check; line 90 `offline shell v6` → `v11`.
    - `AGENT_CONTEXT.md`: line 148 tests-dir comment → measured; line 257 and line 352 `SW v10`/`v7`
      → `v11`; insert `- ✅ Wave 44: Refutation-Ledger Values — …` after the wave-43 bullet (line 262);
      line 263 `191-check smoke` → measured; line 349 Tests bullet → measured tests/files + smoke.
    - `docs/next-wave-plan.md`: line 3 append "and 2026-09-18 after wave 44"; line 14 counts →
      measured; line 15 `34 user-facing destinations` → `35` and append `/warrant` to the list;
      line 26 `SW v10` → `SW v11` and add `/warrant` to the precached list; insert row 31 immediately
      after the wave-43 row (line 42), mirroring its format:
      `| 31 | Refutation-Ledger Values + Warrant Lab (wave 44) | Done | Ledger-warranted runtime values: append-only falsification ledgers, recomputed grade as declared dependence-class count (K=3 cap, cites-min), exact demotion through frozen cites, consistency + hash-chain audit; Derived-Claim Arena (48 claims, 5 regimes, 9 graders, 200 frozen seeds); B7 declared dependence is the shipped relation; F1–F4 kill-criterion statuses pinned in the gate; /warrant read-only lab + paper #5; verify:warrant in CI |`

---

## 9. Errata list (binding; post-build verification must check every item)

- **E1 — dead ≠ 0.** Grade domain is `dead ∪ {0..K}`; `dead` is terminal, ordered below every
  k-warranted value, never serialized/rendered as `0`, never counted as survival by any grader.
- **E2 — dependence is declared.** Shipped relation: `Dependent(a,b)` iff same family **or** declared
  coverage overlap ≥ 1/2. Seeds are repetitions and never add independence. The `(refuter,family,seed)`
  tuple identity is B6 (kill-criterion bait) and must not be the shipped relation.
- **E3 — wording.** "Independence number" / "max independent set" are forbidden in paper, UI, code
  comments, and docs. Use "declared dependence-class count" (it is a dependency-class count).
- **E4 — audit scope.** Audit = arithmetic consistency against the ledger + anchored hash-chain
  tamper-evidence. It is not truth, not correctness, not authenticity; hash chains are tamper
  evidence, not signatures.
- **E5 — fabricated ledgers out of scope.** A producer controlling the append point can fabricate a
  well-formed, internally consistent ledger; admission trust root is the append point and must be
  disclosed.
- **E6 — no truth guarantee.** The strongest emitted sentence is "k declared check-classes survived;
  refutation state recomputed"; never "verified/correct/trusted".
- **E7 — semantic non-independence declared.** D is syntactic; shared method/blind spot/input-domain
  redundancy survives it (Knight–Leveson); disclose in T1, limits, and UI.
- **E8 — no re-minting.** A refuted claim cannot be re-asserted in its context (same payload/kind/
  cites context key) — `RefusedRemint`; no silent repair.
- **E9 — kill is absorbing.** Demotion is terminal; no rehabilitation unless a separately specified
  operation ships (wave 44 ships none; list as future work).
- **E10 — product red lines (significance §5).** Read-only contestability lab; no effect on any
  score, path, rank, or teacher view; no "verified/validated/correct/accurate/safe/certified/
  hallucination-free/trusted/quality/percentage/probability/star rating"; never grade learners or
  gate paths/recommendations; disclose blind spots; audit ≠ truth; "no challenge recorded" is not a
  positive warrant; refute the claim not the person; no learning-outcome claim for RLV.
- **E11 — B8 is analysis-only.** The oracle family/ceiling is never implemented in engine or UI.
- **E12 — no coupling.** `/warrant` imports the pure engine + local fixture data only; never grading,
  sync, storage, review, or curriculum modules; no learner-state read/write.
- **E13 — demotion sanity is TMS evidence.** Report it as a correctness check of retraction, never as
  the novelty; novelty claims rest only on the Experiments tables and the P/F verdicts.

---

## 10. Build order (chunks ≤ 3 files; deps = earlier chunks must be green)

| # | Chunk / files | Deps | Acceptance (exact command) |
|---|---|---|---|
| 1 | types+hash+ids: `src/lib/warrant/types.ts`, `src/lib/warrant/hash.ts`, `src/lib/warrant/ids.ts` | — | `bunx tsc --noEmit --incremental false && bun run lint`; FNV-1a-64 hash has two pinned self-check vectors exported for chunk 5 |
| 2 | registry+ledger+grade: `src/lib/warrant/registry.ts`, `src/lib/warrant/ledger.ts`, `src/lib/warrant/grade.ts` | 1 | `bunx tsc --noEmit --incremental false`; dead≠0, D relation E2, K=3 cap, cites-min all explicit; no `dependence.ts` file (D lives in grade.ts per part 1a) |
| 3 | graph+audit+index: `src/lib/warrant/graph.ts`, `src/lib/warrant/audit.ts`, `src/lib/warrant/index.ts` | 2 | `bunx tsc --noEmit --incremental false`; exact demotion to reachable set; audit recompute + chain check |
| 4 | arena+graders+metrics: `src/lib/warrant/arena.ts`, `src/lib/warrant/graders.ts`, `src/lib/warrant/metrics.ts` | 2,3 | `bunx tsc --noEmit --incremental false`; `bun -e 'import("./src/lib/warrant/arena.ts").then(m=>{console.log(m.runArena({seeds:5}).digest);console.log(m.runArena({seeds:5}).digest)})'` prints the same digest twice |
| 5 | contract tests: `tests/warrant.test.ts` | 3 | `bun test tests/warrant.test.ts` (tamper 100% caught, replay Δγ=0, demotion precision=recall=1, dead≠0, no-remint) |
| 6 | arena+safety tests: `tests/warrant-arena.test.ts`, `tests/warrant-safety.test.ts` | 4,5 | `bun test tests/warrant-arena.test.ts tests/warrant-safety.test.ts` (determinism, 200 seeds, 5th-percentile thresholds, F-table statuses, corpus matched counts) |
| 7 | evidence+gate: `scripts/warrant-evidence.ts`, `scripts/verify-warrant.ts` | 4 | `DF_WARRANT_SCRATCH=$(mktemp -d) bun run scripts/warrant-evidence.ts && bun run scripts/verify-warrant.ts` (gate exit 0, all criteria pass, digest printed) |
| 8 | UI page: `src/app/warrant/page.tsx`, `src/components/warrant/WarrantLab.tsx` | 3 | `bunx tsc --noEmit --incremental false && bun run lint`; read-only, no imports of grading/storage/sync |
| 9 | paper+registration+paper tests: `src/data/inventions/refutation-ledgers.ts`, `src/data/inventions/index.ts`, `tests/inventions.test.ts` | 7 | `bun test tests/inventions.test.ts` (slug lists updated; every T3–T6 cell/F1–F3 bar equals a fresh arena run — gate re-checked here too) |
| 10a | nav registry: `src/lib/sections.ts`, `src/components/NavMenus.tsx`, `src/lib/quickActions.ts` | 8 | `bunx tsc --noEmit --incremental false` |
| 10b | palette tests + sitemap + SW: `tests/quickActions.test.ts`, `src/app/sitemap.ts`, `public/sw.js` | 10a | `bun test tests/quickActions.test.ts` (exact `"the"`/`"open"` orderings from §8.4) |
| 10c | offline+bundle+smoke: `tests/offline.test.ts`, `scripts/measure-bundle.ts`, `scripts/e2e-smoke.mjs` | 10b | `bun test tests/offline.test.ts`; `bun run build`; `CI=1 bun run scripts/measure-bundle.ts --check`; then `bunx next start -p 3099 &` and `BASE_URL=http://localhost:3099 bun run scripts/e2e-smoke.mjs` |
| 10d | CI + scripts: `.github/workflows/ci.yml`, `package.json` | 7,10c | `bun run verify:warrant`; YAML step present after KeyFuse, `timeout-minutes: 6` |
| 11 | docs counters: `README.md`, `AGENT_CONTEXT.md`, `docs/next-wave-plan.md` | 10d | `bunx tsc --noEmit --incremental false && bun run lint && bun test && bun run build && CI=1 bun run scripts/measure-bundle.ts --check`; then `rg -n "1,637|191-check|SW v10|Offline v7|offline shell v6|34 user-facing" README.md AGENT_CONTEXT.md docs/next-wave-plan.md` returns only lines the counter pass intentionally rewrote (none stale) |

Final wave acceptance: chunks 1–11 green in order, `bun run verify:warrant` prints all criteria, the
CI smoke block reports the new `/warrant` + paper + PDF checks, and the gate's pinned aggregates match
`warrant-evidence.json` with no auto-update path.
