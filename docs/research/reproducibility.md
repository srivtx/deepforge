# Research reproducibility

Status 2026-09-27. This document is written for an external lab that has never
read the DeepForge source. It states, per flagship study: where the data came
from, what the seeds are, what environment is required, the exact command that
regenerates each number, the expected output, and how every table and figure is
produced.

It also records what **cannot** be reproduced from a clean checkout. Those
sections are the point of the document, not an appendix to it.

**The single command:**

```bash
bun install --frozen-lockfile
bun run verify:all
```

`verify:all` runs every research gate in CI order, tees each gate's real output
to the terminal, and prints a pass/fail table. Exit code 0 means every gate
passed. It re-implements nothing: each gate's own header comment is the
authority on what its pass means, and section 6 below restates it.

---

## 1. Environment and version requirements

### 1.1 What the gates actually need

| Requirement | Needed by | Pinned? |
|---|---|---|
| **Bun 1.3.9** | every gate (`bun run scripts/…`) | **yes** — `.github/workflows/ci.yml` sets `bun-version: 1.3.9` |
| **`python3` on `PATH`** | `verify:problems`, `verify:alibis`, `verify:bdl` | **no** — see 1.3 |
| Node on `PATH` | nothing in the research gates; `npx eslint` in CI only | no |
| `gzip` binary | one printed statistic in `verify:alibis` | no — degrades to `-1`, does not fail |
| A GPU / WebGPU | nothing — no gate compiles WGSL or touches a GPU | n/a |
| Network | nothing | n/a |
| New dependencies | none. Every gate is Bun/Node built-ins plus Python stdlib | n/a |

No research gate reads `.env`, starts a server, or writes outside
`os.tmpdir()`. `verify:all` prints the resolved `bun`, `node`, `python3`, CPU
count and `tmpdir` before the first gate runs, so a reproducer's environment is
in their own log.

### 1.2 The environment this document's numbers were measured in

```
bun     1.3.9
node    v22.21.0            (not used by the gates)
python3 Python 3.13.7
cpus    8
OS      macOS, Darwin 25.4.0, arm64
```

CI runs on `ubuntu-latest` with Bun 1.3.9, so the gates are expected to be
platform-independent. They are: nothing in the analysis paths reads the
platform, locale, or timezone. Section 2.4 lists the two places where that is
almost-but-not-quite true.

### 1.3 Unpinned and drifting versions — read this before trusting a number

- **Python minor version is not pinned and not checked.** There is no
  `.python-version`, no `engines` field, and no `sys.version_info` guard in any
  gate. `scripts/py_bdl_verify.py:44` states the committed spot digests "were
  produced with CPython 3.13", and the gate asserts them exactly. This matters
  because the BDL analyzer round-trips every solution through
  `ast.parse` → `ast.unparse` (`py_bdl_verify.py:607-609`) **before** generating
  mutants from the re-emitted text. `ast.unparse` output is not a stable
  cross-version contract, so a different CPython minor version can change
  `basis_n`, `n_mut`, `n_invisible`, and therefore the exact-digest rows. If
  `spot.records` fails on a machine you trust, check `python3 --version` before
  suspecting the code.
- **CI action tags float.** `actions/checkout@v4` and
  `oven-sh/setup-bun@v2` are major-version tags, not commit SHAs. Bun itself is
  pinned; the surrounding tooling is not.
- **No `packageManager` / `engines` in `package.json`.** `bun install
  --frozen-lockfile` against `bun.lock` is the only dependency lock.
- **`verify:all` is not yet in CI.** `.github/workflows/ci.yml` still lists the
  gates individually. The step order in `scripts/reproduce.ts` is the CI order,
  so the two are equivalent, but a green CI badge does not yet mean
  `bun run verify:all` was run. Adding one CI step is the obvious follow-up and
  is deliberately **not** done here (CI is shared infrastructure).

---

## 2. Seeds and determinism

### 2.1 Seeds, by study

| Study | RNG | Seed(s) | Construction |
|---|---|---|---|
| Alibi Distance | CPython `random.Random` (Mersenne Twister) | derived per puzzle | `lazy_probe_seed(pid) = int(md5(pid).hexdigest()[:8], 16)`; `_pid_seed(pid, salt) = int(md5(pid + salt).hexdigest()[:8], 16)` (`py_alibi_verify.py:188`, `:349`) |
| Behavioral Delta Ledger (gate) | CPython `random.Random` | `int(md5(pid).hexdigest()[:8], 16)` (`py_bdl_verify.py:623`) | same scheme as the alibi gate |
| BDL sample selection | CPython `random.Random` | `"deepforge-bdl-gate-v1"` | `random.Random(f"{seed}:{category}")` per category (`py_bdl_verify.py:710`) |
| BDL (product probe basis) | `mulberry32` | `fnv1a32(problemId)` | `src/lib/bdl.ts:185-192`, `:293-327` |
| KeyFuse | `mulberry32` | `fnv1a32("rng:" + seedString)` | `src/lib/keyfuse/trace.ts:71-84` |
| Warrant Lab | LCG `1664525·s + 1013904223 mod 2³²` | `ARENA_BASE_SEED = 0x9e3779b9`, 200 seeds | `src/lib/warrant/arena.ts:34-35`, `:112-117` |
| REPROGPU | LCG `1664525·s + 1013904223 mod 2³²` | `K1_SEED = 0x2545f491`, `K3_SEED = 0x1234abcd`, `K4_SEED = 0x2545f491`; Philox key `[0x12345678, 0x9abcdef0]` | `src/lib/reprogpu/vectors.ts:11-19`, `:63`, `:83`; `philox.ts:76-88` |

All three hash/RNG constructions are hand-written integer arithmetic
(`Math.imul` + `>>> 0`), so they produce identical sequences on any conforming
IEEE-754 double engine. `Math.imul` is exact 32-bit multiply; there is no
floating-point rounding in the seeding path.

### 2.1a Seed self-test — check your checkout in one command

Each row is a single derived constant. If your rows match, your hash and RNG
implementations agree with the ones the results were computed on; if they
differ, a gate failure further down is *your runtime*, not the study.

```bash
python3 -c "import hashlib; [print(p, int(hashlib.md5(p.encode()).hexdigest()[:8],16)) for p in ['al-345','ds-074','pr-088']]"
```

| id | Python `md5(id)[:8]` (Alibi gate, BDL gate) |
|---|---|
| `al-345` | `3594154014` (`0xd63a701e`) |
| `ds-074` | `3937742599` (`0xeab52f07`) |
| `pr-088` | `3729865012` (`0xde513934`) |

```bash
bun -e 'import {fnv1a32} from "./src/lib/bdl";
const m=(s:number)=>{let x=s>>>0;return()=>{x=(x+0x6d2b79f5)>>>0;let t=x;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};};
for (const p of ["al-345","ds-074"]) { const s=fnv1a32(p), r=m(s);
  console.log(p, s, r().toFixed(9), r().toFixed(9), r().toFixed(9)); }'
```

| problemId | `fnv1a32` (BDL product basis) | first three `mulberry32` draws |
|---|---:|---|
| `al-345` | `62988231` | `0.434530326`, `0.903187207`, `0.307602059` |
| `ds-074` | `2252256198` | `0.684071133`, `0.093061616`, `0.454914588` |

| Warrant arena | value |
|---|---|
| `ARENA_SEEDS` | `200` |
| `ARENA_BASE_SEED` | `0x9e3779b9` = `2654435769` |
| first three LCG draws from the base seed | `0.260999`, `0.910736`, `0.248429` |
| graders | `B0`…`B8` (9) |
| regimes | `R`, `D`, `C`, `P`, `X` (5) |

| REPROGPU | value |
|---|---|
| `K1_SEED` | `0x2545f491` = `624331409` |
| `K3_SEED` | `0x1234abcd` = `305441741` |
| `K4_SEED` | `0x2545f491` (same stream as K1, different draw shape) |
| Philox key for K2 | `[0x12345678, 0x9abcdef0]` |
| K1 vector length | 4,096 accepted LCG words (words with exponent byte `0xff` are rejected and redrawn) + 8 specials = **4,104** |
| K1 flag vector length | 4,106 (4,104 + `+Inf` `0x7F800000` + `NaN` `0x7FC00000`) |
| K3 matrices | 256×256 `Int32Array` pair, values uniform in `[-2²⁰, 2²⁰)`, `a` filled before `b` from one stream |

### 2.2 Determinism audit — what was searched and what was found

Searched across `src/lib/alibiHunt.ts`, `src/lib/bdl.ts`, `src/lib/bdlStore.ts`,
`src/lib/keyfuse/*`, `src/lib/warrant/*`, `src/lib/reprogpu/*`, all eight
`scripts/verify-*.ts`, all three `scripts/py_*.py`, and all three
`scripts/*-evidence.ts`, for: `Math.random`, `crypto.getRandomValues`,
`randomBytes`, `randomUUID`, `Date.now`, `new Date(`, `performance.now`,
`process.hrtime`, `for…in`, unsorted `Object.keys`, `readdir`, `localeCompare`,
`Pool.map` ordering, and `set`/`dict` iteration.

**Result: the analysis paths contain no unseeded randomness, no ambient clock,
and no unordered iteration feeding a result.** Specifically:

- `Math.random` appears **zero** times in the analysis paths. It
  appears twice in the repo, both times as a *forbidden token in a source scan*
  (`verify-keyfuse.ts:146`, `verify-warrant.ts:75`).
- `Date.now` / `new Date(` appear **zero** times in the analysis paths. The one
  `new Date()` in the repo is `src/lib/reprogpu/harness.ts:466` — see 2.3, item
  N1, which is a real finding.
- `performance.now()` appears only in **gate and evidence scripts**, always
  inside a timing or budget field, never in a hashed value. `warrant`,
  `keyfuse` and `reprogpu` are the exceptions that *do* hash wall-clock fields,
  and only in the browser path (item N1).
- Canonical serialization sorts object keys before hashing, in all four
  independent implementations: `src/lib/bdl.ts:162` and `:635` (FNV record
  hashing), `src/lib/keyfuse/hash.ts:132`, `src/lib/warrant/hash.ts:88`,
  `src/lib/reprogpu/hashes.ts:35`. `Set`/`Map` iteration is either sorted
  before use or fed from a declared array in table order
  (`keyfuse/trace.ts:183`, `keyfuse/audit.ts:303`, `keyfuse/cover.ts:153`).
  The one `for…in` over a `Set` of probe rows that is not explicitly sorted
  (`keyfuse/audit.ts:264-290`) is consumed as a membership set, not as order.
- Python side: `random.Random(int_or_str)` is seeded, never the global `random`
  module; `multiprocessing.Pool.map` (`py_bdl_verify.py:723-724`) preserves
  input order, so the worker count does not affect results. No set/dict
  iteration leaks into a record: `repr()`-keyed `set`s are membership tests.
- `verify-warrant.ts:91` uses `readdirSync` over `src/lib/warrant`, but only to
  scan file *contents* for forbidden tokens and to count a boolean — the
  iteration order cannot change a verdict.
- Filesystem-order dependence: the only `readdir` in an analysis path is the
  pure facade in `src/lib/keyfuse/nodeAdapter.ts:197`, which sorts by UTF-16
  code unit before returning. The corpus is loaded from a static TypeScript
  array (`src/data/problems/index.ts:21-37`) in a fixed, declared order — no
  globbing, so no filesystem order anywhere.

The determinism claims that the gates make about themselves are therefore
honest, and four of them are additionally *self-tested* on every run: two
byte-identical full sweeps in `verify-keyfuse.ts` (360 audits each) and two
byte-identical arena runs in `verify-warrant.ts` and `verify-bdl.ts`.

### 2.3 Nondeterminism sources that do exist (all reported, none hidden)

**N1 — the REPROGPU browser manifest hash is time-dependent by construction.**
`manifestSha256` hashes the whole manifest, and every record carries
`timestampISO: new Date().toISOString()` (`harness.ts:466`) and
`durationMs: Math.round(performance.now() - …)` (`harness.ts:443`). Two runs of
the same kernel on the same adapter therefore produce two different
`manifestSha256` values. Verified: hashing an otherwise identical record with
`durationMs` 7 vs 99 and two different timestamps yields
`d830d9a7…` vs `4b138047…`. **What *is* deterministic, and what the paper's
pinned numbers refer to, is the per-kernel `outputSha256` over the readback
bytes** — that is the value the gate pins. The manifest digest is a
run-identity token, not a reproducibility token. Note that
`docs/research/wave-48-attack-reprogpu.md:74` refers to a committed
`docs/research/reprogpu/expected-manifest.json`; **that file does not exist in
this repository**, and `verify-reprogpu.ts` never reads a manifest. Only
`outputSha256` is verifiable offline.

**N2 — the Alibi and BDL Python gates bound probes with a wall clock.**
`py_alibi_verify.py:58` uses a 1.0 s `SIGALRM` per call
("hardware-tolerant; the census engines replayed at 0.25 s");
`py_bdl_verify.py:65` uses a hard 0.25 s. A timeout is *not* a neutral outcome:
in the alibi gate a timeout counts as a divergence, and the gate requires zero
divergence over 189,658 union + 24,560 held-out probes. In the BDL analyzer a
timeout becomes signature state `2`, which reclassifies a mutant as visible.
On a heavily loaded or much slower machine these gates can therefore change
verdict without any code change. The counts printed in section 5 are from an
8-core arm64 machine; a reproducer on a slow shared runner should expect
`slow-host` behaviour and re-run before believing a failure. **No tolerance was
added to paper over this.**

**N3 — `localeCompare` in the BDL product probe basis.**
`src/lib/bdl.ts:221` sorts string-valued probe arguments with
`String(a).localeCompare(String(b))`, which depends on the host ICU locale and
therefore on the machine's locale configuration. It is reachable only when a
shipped test input is an array of strings. Every other comparison in the
research paths is an explicit UTF-16 code-unit compare
(`keyfuse/trace.ts:60`, `keyfuse/nodeAdapter.ts:92`, default `Array#sort`).
Recorded, not changed — changing it would change the product's probe basis.

**N4 — the BDL product probe basis and the BDL research basis are different
objects.** This is the most important reproducibility caveat in the repository
and it is honestly stated in the source at `src/lib/bdl.ts:290`: *"The research
corpus used md5-seeded shuffles; the product uses FNV and therefore does not
claim bit-identical bases."* The two implementations also differ in a second
way that is not in that comment: the Python `probe_bank` shuffles **then**
excludes duplicates and shipped inputs (`py_bdl_verify.py:311-320`), while the
TypeScript `buildBdlBasis` excludes **then** shuffles (`bdl.ts:305-333`). Same
RNG, different operation order, different resulting 24-probe set. Consequence:
**the published BDL numbers are the Python ones** and *are* reproducible via
`verify:bdl`; the basis a learner meets in the browser is a different, also
deterministic, object. Do not expect the product to reproduce the paper's
probe vectors.

**N5 — nothing in the three flagship Python studies is seed-deterministic with
respect to *hardware*; the TypeScript studies (KeyFuse, Warrant, REPROGPU
references) are.** N2 is the hardware coupling. Warrant's arena takes ~12 s and
KeyFuse's sweep 360 audits, both far inside their own 60 s budgets, so in
practice they are hardware-insensitive.

**N6 — the unit-test suite is host-load sensitive.** `bun test` gives each test
a hard **5,000 ms** timeout. `tests/warrant-arena.test.ts` runs `runArena()`, whose
own cost is ~2 s idle and ~6.5 s under load (measured: `bun run verify:warrant`
does two full arena runs in 12.0–13.1 s across three runs, i.e. ~6–6.5 s each).
Under contention the two heaviest tests in that file —
`reproduces seeds byte for byte and separates the seeds` and `pins the digest` —
time out and are reported as failures with **no code change**. Observed on this
machine: idle → `1814 pass, 0 fail` in 13.0 s; load average ≈ 20 →
`1812 pass, 2 fail` / `1813 pass, 1 fail`, both failures
`this test timed out after 5000ms`; the file alone, run three times, passed
22/22 every time. The *permanent gate* is unaffected — it uses a 60 s budget and
its digest is load-independent. **If `verify:all` step 4 fails on timeouts while
every research gate passes, re-run on an idle machine before investigating.**
`bdl` and `alibis` step timings are likewise load-dependent (see §5.0).

### 2.4 The one honest summary

Determinism claims in this repository are **bit-exact and verified** for: the
Warrant arena digest, the KeyFuse audit digests, the REPROGPU K1–K4 reference
hashes and WGSL pins, and the alibi bank's structural metadata. They are
**bit-exact and gated, but hardware-bounded** for the BDL analyzer and the alibi
probe suites. They are **not applicable** to the REPROGPU browser manifest
(N1).

---

## 3. Data provenance

### 3.1 The exercise corpus — `src/data/problems/**`

**What it is.** 15 category files (`linear-algebra.ts` … `information-theory.ts`)
under `src/data/problems/`, each exporting one `Problem[]`, concatenated by
`src/data/problems/index.ts:21-37` in a fixed declared order into `PROBLEMS`.
5,730 problems, 23,518 test cases.

**How it is actually produced — the real path, not the intended one.**
There is **no corpus generator in this repository.** `git log --follow` on the
category files shows no generation commit; `AGENT_BRIEF.md` contains a
hand-authoring specification (id ranges, a 40-problem-per-batch difficulty mix,
3–5 test cases per problem, the exact `Problem` shape, and the Python
constraints) and that is the operative provenance: the corpus is
**hand-authored to a written spec, in batches, by agents**. The one derived
artifact is `src/data/problems/problem-meta.ts` (452 KB of
`{id,title,category,difficulty}` literals), regenerated by
`bun run scripts/generate-problem-meta.ts`. Nothing in CI checks that
`problem-meta.ts` is in sync with the corpus, so it can drift silently.

**Inclusion criteria, enforced mechanically by `verify:problems`** (a problem
that violates any of these fails the gate): id matches `^[a-z]+-\d{3,4}$` with
a prefix in the 16 allowed list; non-empty `title`/`description`/`starterCode`/
`solution`; `category` in `CATEGORIES`; `difficulty` in
`{Easy,Medium,Hard}`; id unique across the bank; **3–5 test cases**
(the gate fails `<3` or `>6`); `starterCode` contains a `def` whose name equals the
solution's first `def`; every test case has an array `input` and a defined
`expected`. Exclusion criteria: none are encoded — there is no allow/deny list
beyond those structural rules, and no problem has been withdrawn.

**Exact measured size** (`bun run scripts/verify-problems.ts`; the per-category
table is printed by the gate itself):

```
Loaded 5730 problem(s).

Problems per category:
    320  Linear Algebra
    375  Calculus
    420  Statistics
    420  Probability
    360  ML Fundamentals
    455  Deep Learning
    420  NLP
    375  Optimization
    395  Algorithms
    355  Data Structures
    395  Computer Vision
    360  Reinforcement Learning
    360  Time Series
    360  Graph Algorithms
    360  Information Theory

Structural errors: 0   Runtime failures: 0   Passed: 5730/5730
ALL GREEN
```

Difficulty mix (not printed by the gate; measured with
`bun -e 'import {PROBLEMS} …'`): Easy 2,058 / Medium 2,553 / Hard 1,119.

**Fingerprint.** `verify-bdl.ts` serializes the corpus to
`<tmpdir>/deepforge-bdl-gate/corpus.json` and prints its SHA-256 prefix. The
value a reproducer must see:

```
corpus.json  3561785 B  sha256 3ff60b9e3aa8b5ab8a1cb2e6dfcdffcc6d31774b7f770c3b787a8fdc8a498e31
```

`verify:all` prints this fingerprint before any gate runs, so a corpus mismatch
is visible without reading a gate table. Note the 5,730 row count is exactly the
`rows` figure the BDL census records (§3.3) — the corpus has not changed since
the census was taken.

### 3.2 The alibi bank — `src/data/alibis/**`

**What it is.** `src/data/alibis/puzzles.ts` (161,055 B) exports `ALIBI_PUZZLES`:
96 puzzles, each a `{reference, ghost, func, tests, witness, unionProbes,
heldOutProbes, survived}` record. `reference` and `ghost` differ by exactly one
line; both pass every shipped test; they diverge at `witness`. 412 shipped tests
in total.

**How it is actually produced — and this is the largest gap in the portfolio.**
The bank was **mined by mutation search**, and **the miner is not in this
repository.** `verify-alibis.ts:47-60` documents the funnel as a hard-coded
constant and attributes the old pool to "scripts/phase1.py in the scratch
tree". No `phase1.py`, no mining script, no mutation engine, and no candidate
pool exists anywhere in the tree (`find` for `*mine*`, `*census*`, `phase1*`
returns nothing). The provenance of the shipped 96 is therefore *documentary,
not executable*. The only thing a clean checkout can do is **re-verify** the
frozen bank, which is what `verify:alibis` does.

The documented funnel, verbatim from the gate's own output:

```
  mining funnel       exhaustive: 2636 problems -> 89622 mutants -> 19030 passers ->
                      4060 union-clean -> 268 with witness -> 217 held-out-clean;
                      validated 211, shipped 96
  legacy pool funnel  7726 -> union-clean 9 -> held-out-clean 8
                      (old lazy-128 bank was overfit to one shuffle)
```

**Inclusion criteria** (a puzzle ships only if all hold, and all are re-checked
in CPython on every gate run): reference passes all shipped tests; ghost passes
all shipped tests; the two diverge at `witness` under 1e-6 deep equality, where
an exception *or a timeout* counts as divergence; the text diff is exactly one
removed plus one added line; **zero** divergence over the full UNION probe suite
and **zero** over the independently parameterised HELD-OUT suite, both built
from the visible shipped tests only. Bank-level: 24 ≤ N ≤ 96 puzzles (target
48), every record `survived === true` with positive `unionProbes` and
`heldOutProbes`, no warm-up tier, and all 15 categories represented.

**Two things a reproducer should know about the funnel.** First, the
exhaustive re-mine covered **2,636 of the 5,730 corpus problems (46 %)** — the
bank's mining coverage is not the whole corpus and no rule explains the
exclusion of the other 3,094. Second, `96` is at the gate's `MAX_PUZZLES`
ceiling, so the bank is full and further candidates would be rejected by the
gate even if they passed.

**Fingerprint** (the bank as `verify-alibis.ts` serialises it, written to
`<tmpdir>/deepforge-alibi-gate/alibi-bank.json`):

```
alibi-bank.json  146789 B  sha256 2b2df5ef864875f93369cabdd5a49d447c80f790a440d249b8171ee32d756556
```

### 3.3 The BDL census — **not in this repository**

The Behavioral Delta Ledger's published corpus numbers come from a full-corpus
census run by an engine that is not committed. `docs/research/wave-42-blueprint.md`
names it: `bdl_engine_clean.py` and `census_clean.jsonl` under a machine-local
scratch path. Neither is present. `py_bdl_verify.py:44-49` is explicit that this
was replaced by two committed spot records with embedded SHA-256 digests, so the
**gate** is self-contained — but the gate checks a **240-problem stratified
sample against tolerance bands**, not the full corpus. See §5.3 and §7.

---

## 4. KeyFuse, REPROGPU, and the two path gates

### 4.1 KeyFuse

Not an exercise corpus: a **hand-built virtual task corpus**.
`src/lib/keyfuse/tasks.ts` exports `KEYFUSE_TASKS` — 24 `VirtualTask`s, each a
closure plus a declared slot universe (`file:`, `env:` slots). 24 tasks × 5 probe
strategies × 3 strengths (1/2/3) = 360 audits per full sweep; 72 exact-arm cells
of which 69 are compared and 3 are explicit nondeterministic refusals. The
corpus is *constructed*, not sampled, so its provenance is the source file
itself: every task, slot, value, and planted interaction is declared literally in
`tasks.ts` and read by the gate. No RNG, no clock, no filesystem (the Node
adapter is an in-process facade over `node:fs`, `keyfuse/nodeAdapter.ts`).

### 4.2 REPROGPU

Five **pinned WGSL kernel sources** (`src/lib/reprogpu/kernels.ts`) plus
CPU-reference TypeScript implementations of the same arithmetic, five seeded
input vectors, and a pinned artifact `docs/research/reprogpu/expected-hashes.json`
(1,203 B, committed). All of it is generated from constants in
`src/lib/reprogpu/vectors.ts` and `philox.ts` — no sampling, no external data,
no GPU. The pin set is listed in §5.5.

### 4.3 The two path gates

`src/data/problems/paths.ts` (102,969 B) holds 33 hand-authored learning paths
referencing corpus problem ids. `verify-paths` checks structure (slugs, stages,
id resolution, capstone resolution against the projects/labs/contests/
collections/pen-and-paper registries); `verify-paths-content` checks content
(stage blurbs, ordering, levels, and an acyclic prerequisite graph). Both print
`Paths: 33` and `ALL GREEN`. They are listed in `verify:all` because the corpus
counts they print are the same corpus the research studies measure.

---

## 5. Experiment commands and expected output

Every block below is real captured output from a clean run on the environment in
§1.2. `bun run verify:all` produces all of it in one go.

### 5.0 The entry point

```bash
bun run verify:all          # or: bun run scripts/reproduce.ts
bun run scripts/reproduce.ts --list        # step names + commands, runs nothing
bun run scripts/reproduce.ts --skip bdl    # skip one step
```

Steps, in order, with the meaning of PASS:

| # | step | command | PASS means |
|---|---|---|---|
| 1 | `paths` | `bun run scripts/verify-paths.ts` | 33 paths: unique URL-safe slugs, no duplicate/unknown problem ids, every capstone resolves |
| 2 | `paths-content` | `bun run scripts/verify-paths-content.ts` | stage blurbs/ordering/levels valid, prerequisite graph acyclic |
| 3 | `problems` | `bun run scripts/verify-problems.ts` | 0 structural errors and all 5,730 solutions execute in real CPython against their own tests at 1e-6 |
| 4 | `tests` | `bun test` | 0 failures (count moves as tests are added; see N6 — host-load sensitive) |
| 5 | `alibis` | `bun run scripts/verify-alibis.ts` | 96/96 puzzles re-verified in CPython, all union + held-out clean, 0 gate failures |
| 6 | `bdl` | `bun run scripts/verify-bdl.ts` | 12/12 independent checks + 12/12 harness fixtures |
| 7 | `keyfuse` | `bun run scripts/verify-keyfuse.ts` | 12/12 criteria, `cells: 72` |
| 8 | `warrant` | `bun run scripts/verify-warrant.ts` | 8/8 criteria, `digest: ca0cda0f562b8c10` |
| 9 | `reprogpu` | `bun run scripts/verify-reprogpu.ts` | 5/5 criteria |

`verify:all` also prints a provenance header before step 1:

```
bun     1.3.9   (CI pins bun-version 1.3.9)
node    v22.21.0
python3 Python 3.13.7   (BDL spot digests were produced on CPython 3.13)
cpus    8 (BDL uses min(8, cpus))
tmpdir  /var/folders/…/T

  problems         5730 in 15 categories, 23518 test cases
  corpus.json      3561785 B  sha256 3ff60b9e3aa8b5ab8a1cb2e6dfcdffcc6d31774b7f770c3b787a8fdc8a498e31
  alibi bank       96 puzzles, 189658 union + 24560 held-out probes
  alibi-bank.json  146789 B  sha256 2b2df5ef864875f93369cabdd5a49d447c80f790a440d249b8171ee32d756556
```

**Measured total: 9/9 steps PASS, 189.3 s and 195.1 s on two consecutive full
runs** (8-core arm64, `real 3m9.7s`). Per-step from the run that produced the
outputs quoted in this section:

| step | wall | note |
|---|---:|---|
| `paths` | 0.1 s | |
| `paths-content` | 0.1 s | |
| `problems` | 0.8 s | 5,730 solutions in CPython |
| `tests` | 10.6 s | 0 failures required; count moves with the suite (N6) |
| `alibis` | 27.0 s | 214,218 probes; the single most variable step |
| `bdl` | 136.7 s | two 66 s engine runs over 240 problems, 8 workers |
| `keyfuse` | 0.2 s | 720 audits (two 360-audit sweeps) |
| `warrant` | 13.1 s | two full 200-seed arena runs |
| `reprogpu` | 0.7 s | includes the 256³ BigInt GEMM reference |
| **total** | **189.3 s** | `REPRODUCE_OK {"steps":9,"failed":0,"seconds":189.3}` |

`bdl` scales with core count (`min(8, cpus)` workers) and `alibis` scales with
probe count, so a 4-core machine will be slower; nothing in the results changes.
All step timings are host-load dependent (N6).

### 5.1 Alibi Distance — `bun run scripts/verify-alibis.ts`

Per-puzzle lines (`ok  <id>  <difficulty>  tests=N  witness=crash|value
union=U/U heldout=H/H`) followed by the machine summary and the bank statistics:

```
ALIBI_GATE_SUMMARY {"crash": 32, "failed": 0, "heldOutFailures": 0, "metadataMismatches": 0,
  "resistant": 96, "timeout": 0, "total": 96, "unionFailures": 0, "value": 64,
  "verified": 96, "warmup": 0}
GATE PASSED: 96/96 verified (all union + held-out clean)

Silent Bug Hunt — bank statistics (v2 union + held-out)
  mining funnel       exhaustive: 2636 problems -> 89622 mutants -> 19030 passers -> 4060 union-clean -> 268 with witness -> 217 held-out-clean; validated 211, shipped 96
  legacy pool funnel  7726 -> union-clean 9 -> held-out-clean 8 (old lazy-128 bank was overfit to one shuffle)
  puzzles             96
  probes checked      189658 union + 24560 held-out (all passing)
  shipped tests       412 (all passing for reference and ghost)
  serialized bank     152696 B raw / 27510 B gzip -9 (JSON.stringify(ALIBI_PUZZLES), compact)
  puzzles.ts          161055 B on disk
  witness length      max 1193 chars
  divergence types    crash 32 / value 64 / timeout 0
  difficulty          Easy 24 / Medium 49 / Hard 23
  categories          Algorithms 10, Calculus 3, Computer Vision 10, Data Structures 10, Deep Learning 7, Graph Algorithms 6, Information Theory 4, Linear Algebra 4, ML Fundamentals 7, NLP 6, Optimization 3, Probability 7, Reinforcement Learning 5, Statistics 10, Time Series 4
  reference lines     min 2 / p25 11 / median 15 / p75 22 / p90 29 / max 44
  line histogram      1-5:6  6-10:17  11-15:27  16-20:18  21+:28

PASS 96/96 verified — all union+held-out clean, gate failures 0
```

**Expected values a reproducer must see:** `total 96`, `verified 96`,
`failed 0`, `unionFailures 0`, `heldOutFailures 0`, `metadataMismatches 0`,
`timeout 0`, `resistant 96`, `warmup 0`; probes `189658 + 24560`; shipped tests
`412`; `timeout 0` in *divergence types* (a nonzero value here fails the gate).
`serialized bank 152696 B raw / 27510 B gzip -9` and `puzzles.ts 161055 B` are
byte-count fingerprints of the frozen bank and will move if the bank is edited
— the gate does not assert them, so treat a change there as a provenance alarm.
Note `crash + value = 96`; every witness divergence is either an exception or a
value difference, never a timeout.

**`FAILED` means:** at least one puzzle's reference or ghost failed a shipped
test, the two did not diverge at the witness, the diff was not exactly one line,
a probe diverged, or a stored `unionProbes`/`heldOutProbes` disagreed with the
recomputation. Every one of those is a real integrity failure, not a flake —
except where N2 (N2 §2.3) applies.

### 5.2 Behavioral Delta Ledger — `bun run scripts/verify-bdl.ts`

```
BDL gate — independent corpus verification (sample 240, seed "deepforge-bdl-gate-v1", 8 workers)
corpus 5730 problems (sha256 3ff60b9e3aa8) · census not provided (self-contained mode)

metric                            expected      observed     tolerance  result
----------------------------------------------------------------------------------
spot.records                         clean  al-345:clean, ds-074:clean         exact  PASS
harness.fixtures                     12/12         12/12         exact  PASS
run.two_runs_byte_identical           true          true         exact  PASS
sample.analyzable                      238           236            ±6  PASS
sample.mutants                        3670          3733          ±448  PASS
sample.invisible                    10.23%        10.77%       ±2.83pp  PASS
sample.test_passing                 16.45%        16.07%       ±3.05pp  PASS
sample.hidden_visible               45.23%        42.33%      ±10.07pp  PASS
sample.problems_visible_slip        44.40%        45.34%       ±9.92pp  PASS
run.reference_flakes                     0             0         exact  PASS
run.cosmetic_churn_nonzero               0             0         exact  PASS
run.rename_churn_nonzero                 0             0         exact  PASS

spot records: al-345/ds-074 digests match the committed checksums
determinism: two runs byte-identical yes; flakes 0; cosmetic churn 0; rename churn 0

shipped-harness fixtures (generated by buildBdlHarness, run under CPython):
  agree                   markers 1  parsed 00/11  0.05s
  wrong_value             markers 1  parsed 11/00  0.04s
  raise                   markers 1  parsed 22/00  0.04s
  reference_timeout       markers 1  parsed xx/11  0.55s
  sleep_within_budget     markers 1  parsed 00/11  0.26s
  sleep_over_budget       markers 1  parsed xx/00  0.56s
  busy_loop_wall_timeout  markers 1  parsed xx/00  0.55s
  line_budget             markers 1  parsed 22/00  0.04s
  marker_early_forge      markers 2  parsed null  0.05s
  marker_atexit_forge     markers 2  parsed null  0.06s
  marker_thread_forge     markers 2  parsed null  0.31s
  per_program_fresh_budget  markers 2  parsed null  1.68s

PASS — 12/12 checks, 12/12 harness fixtures, sample 236/240 analyzable, runtime 136.49s
```

**What is exact and what is a band — this distinction is the whole story of
this study.** Three groups of rows:

*Exact rows (must match to the digit):* `spot.records` (the committed SHA-256
digests `5076786428d8554fefcf64a8611aeaea0387de6d257045100bc302e3b941f74e` for
`al-345` and `58e3bcbebd0edd19e990cdd92635bd3a28399bdc09106c44e881fb50eab17eca`
for `ds-074`, plus their pinned `basis_n` 15/21, `n_mut` 31/27, `n_invisible`
11/3), `run.two_runs_byte_identical`, and the three `run.*` churn/flake rows.
If any of these fail, something real changed.

*Band rows (sampled, tolerance-stated):* the five `sample.*` rates. The
tolerance rule is printed per row and is `3·√(se_sample² + se_corpus²)` with a
cluster-robust per-problem standard error; `se_corpus` is the published corpus
95 % CI half-width ÷ 1.96. The observed values are **not** the paper's values and
are not supposed to be — they are a 240-problem sample. A reproducer's `observed`
column will differ from the one above; their `result` column must not.

*Fixture rows:* each fixture is a Python program built by the shipped
`buildBdlHarness`, run under CPython, then parsed by the shipped
`parseBdlStdout`. The `parsed sig/mask` strings are the assertion; the elapsed
seconds are not.

**A reproducibility value the gate prints but does not enforce.** The Python
gate's `determinism.digest` is the SHA-256 of the canonical (timing-stripped,
key-sorted) serialization of the whole 240-problem sample run:

```
determinism.digest  7afc1f2ac9ea62da450edb66147ded29fbf64e858d14d6e96225c6b2b44ef290
determinism.run_seconds  [66.08, 66.08]     (two independent runs, byte-identical)
```

The gate asserts only that the two runs *within one invocation* are identical
(`run.two_runs_byte_identical`), **not** that the digest equals a committed
constant. So this digest is a free cross-machine cross-check: an independent lab
that sees a different digest has found a real environment divergence even though
the gate stayed green. That makes it more useful than a pin, and it is also
un-enforced, so record it in any replication report.

**With `DF_BDL_VERBOSE=1`** the gate additionally forwards the Python table
header, the per-row `detail` fields (which carry the cluster SE and the corpus
CI, e.g. `n=3733, cluster SE 0.94pp, corpus CI ±0.20pp`), and the machine line
`BDL_GATE_SUMMARY {…}` — the same value shown above in §5.2's summary table
column. That is how the tolerance arithmetic is audited; the TS wrapper swallows
this output by default.

**The published corpus numbers, for reference** (from
`docs/research/wave-42-blueprint.md` §2, which cites a fresh full-corpus census
run; **these are not regenerated by the default gate** — see §7):

| Metric | Value |
|---|---:|
| Corpus / analyzable / skipped | 5,730 / 5,682 / 48 |
| Sampled mutants; invisible on the 48-probe basis | 88,357; 9,041 = **10.23 %** [10.03, 10.43] |
| Test-passing mutants | 14,534 = **16.45 %** [16.21, 16.70] |
| Of those, hidden-visible | 6,574 = **45.23 %** [44.42, 46.04] |
| Problems with a visible silent slip | 2,523 = **44.40 %** [43.12, 45.70] |
| Zero-mutant problems; all-visible denominator | 55/5,682; 2,818/5,627 = **50.08 %** |

**Optional census mode.** Passing `--census <census_clean.jsonl>` (or
`DF_BDL_CENSUS`) re-enables the exact census-artifact checks and the
sample-vs-census record equality check. The census is not committed, so a clean
checkout **cannot** use this mode; the gate prints `census not provided
(self-contained mode)` and passes. `DF_BDL_VERBOSE=1` additionally forwards the
Python gate's own table and its `BDL_GATE_SUMMARY {…}` JSON line, which the
TypeScript wrapper otherwise swallows. `DF_BDL_SCRATCH` relocates the scratch
directory.

### 5.3 KeyFuse — `bun run scripts/verify-keyfuse.ts`

```
KeyFuse permanent gate (wave 43) — scripts/verify-keyfuse.ts
 1  purity-determinism             PASS  pure sources scanned: 10 engine + tasks.ts = 11; forbidden-literal violations: 0
                                     two full sweeps (360 audits each) byte-identical canonicalJson: true; fingerprint 09c5076ebac86617
 2  exact-arm-equals-ground-truth  PASS  cells=72 compared=69 equal=69 refusalCells=3 (nondeterministic-counter@t1, @t2, @t3)
 3  ca-fallback-honesty            PASS  cells=69; subset violations=0; exact detections absent from ca-ddmin=53
                                     explanations: over-strength witness=12, minimized-subset=33, value-specific sentinel=3, unrealized-by-array=5
 4  masking-c1                     PASS  rows=6 changedRows=3; changed-row union=[env:C,env:B,env:A] but (a,b) joint-support rows=0; attributed=[env:C]
 5  planted-interactions           PASS  and-3way relevantT(2)=[] and ca-ddmin(2) detections=[]
                                     maj-3way ca-ddmin(3) detected=[env:B,env:C,env:A]
 6  minimality-consistency         PASS  minimized witnesses=83 oneMinimal=81 oneMinimalFalse=2 verifyRunsMismatches=0
 7  necessity-repair               PASS  detections checked=219; single-slot witness violations=0; collision witnesses=101; unseparated=0
                                     node adapter (METRO_NODE_TASK): detected=[env:BUILD_MODE,env:API_URL] runs=23
 8  anchor-honesty                 PASS  threshold-3 exact detections=[] certificate="no detected <=t-support effect at covered tuples"
                                     documented (1100)/(1110) residual collision count=1; exhaustive anchor residualCollisionPairs=55 minimalResidualPairs=12
 9  negative-controls              PASS  nondeterministic-counter: 15 cells all deterministic:false, detections=[], miss exactly "oracle nondeterministic at baseline"
                                     untrappable-ambient: 15 cells all trapped:false, detections=[], no implicates
10  portability-budget             PASS  keyfuse sources scanned=12; machine-local path violations=0; wall time 136ms <= 60000ms budget
11  pinned-aggregates              PASS  default strength=2; pinned cells compared=120 (24 tasks x 5 strategies); drift=0
                                     counts match pins: exactCells=69, refusalCells=3, oneMinimalFalse=2, residualMinimalPairs=1
12  summary                        PASS  all criteria passed
KEYFUSE_GATE {"passed":12,"failed":0,"cells":72,"runtimeMs":136}
```

**Expected values:** `passed 12`, `failed 0`, `cells 72`; fingerprint
`09c5076ebac86617`; 360-audit double sweep byte-identical; 69/69 exact-arm
equality; `drift=0` across the 120 pinned cells. `runtimeMs` and the
`136ms` wall time vary per machine and are budget-checked (≤ 60 000 ms), not
pinned.

**Two documented deviations** are printed rather than hidden, and a reproducer
should read them as expected output, not as failures: criterion 3's
`minimized-subset`/`unrealized-by-array` absences carry no engine `miss` string
and are classified by the gate from the audit's own probe rows; criterion 5's
split-based ddmin cannot isolate `{A,B,C}` inside the `and-3way` t=3 changed row
`{A,B,C,D}`, so the gate accepts the recorded over-strength witness instead.
Both are recorded in the gate header (`verify-keyfuse.ts:47-58`).

### 5.4 Warrant Lab — `bun run scripts/verify-warrant.ts`

```
Warrant permanent gate (wave 44) — scripts/verify-warrant.ts
 1  determinism        PASS  digest ca0cda0f562b8c10 / pinned ca0cda0f562b8c10
 2  criteria statuses  PASS  P1-P5 pass, F1 fails as predicted, F2-F4 pass
 3  pinned aggregates  PASS  all headline cells equal the reviewed run
 4  decisive margins   PASS  PW margin 1.000 (>= 0.10) / AUC margin 1.000 (>= 0.10)
                                 AP@12 1.000 (>= 0.75) / churn 0.000/0.000 (<= 0.1/0.05)
 5  F1 diagnosis       PASS  R: B6 0.500 <= B1 0.500 + 0.05 / X: B6 0.500 <= B7 1.000 - 0.10
 6  purity             PASS  no forbidden tokens; oracle hidden
 7  runtime budget     PASS  12956 ms (budget 60000 ms, two full arena runs)
 8  summary            PASS  all criteria passed
WARRANT_GATE {"passed":8,"failed":0,"runtimeMs":12956,"digest":"ca0cda0f562b8c10"}
```

**Expected values:** `digest ca0cda0f562b8c10` — this is the single most
load-bearing constant in the study and must match exactly. Pinned aggregates
(pair-win `R.B1 0.5, R.B5 1, R.B6 0.5, R.B7 1, X.B1 0.5, X.B5 0, X.B6 0.5,
X.B7 1`; AUC `R.B5 1, R.B7 1, X.B5 0, X.B7 1, X.B8 1`; AP@12 `R.B7 1, X.B5 0,
X.B7 1`; churn `0/0`; demotion `1/1`) are compared with `===`, no tolerance.
`F1` **must** report `fail` — it is the syntactic-tuple variant the study claims
is killable, and a gate that reported `pass` would be the failure.
`runtimeMs` varies and is budget-checked.

### 5.5 REPROGPU — `bun run scripts/verify-reprogpu.ts`

```
REPROGPU permanent gate (wave 48) — scripts/verify-reprogpu.ts
 1  references reproduce pins  PASS  K1/K1-flag/K2/K3/K4 all match
 2  known-answer tests         PASS  3 Philox KATs + FIPS SHA-256 + K4 oracle match
 3  WGSL source pins           PASS  all five sources match the pins
 4  integer kernel purity      PASS  no float/atomics/discard; shifts masked; canaries present
 5  summary                    PASS  all criteria passed
REPROGPU_GATE {"passed":5,"failed":0,"runtimeMs":750}
```

The pinned values a reproducer must see, from
`docs/research/reprogpu/expected-hashes.json` (and identically from
`src/lib/reprogpu/expected.ts`, which is what the gate actually reads):

| Kernel | Count | SHA-256 of the reference output |
|---|---:|---|
| K1 exact f32 sum (320-bit superaccumulator) | 4,104 | `c046384ed6580b8111b8ef34f5d0932289209f4920666477bc76ffe724dfa27a` |
| K1 flag vector | 4,106 | `cc7dca6d69fec7162cf610b0170076aec74d3d5bec47b2ea80d0b74afb3c9ecb` |
| K2 Philox4x32-10 | 65,536 | `f9004cf3ed50db5cdb6351a3eb090a498586ade2e3f7499744c951bf77f86d01` |
| K3 Q16.16 GEMM 256³ | 65,536 | `fbe13a3b4e2fc7bf3a4b38c838912651151c03460bd9d1d7f1ea81190af3932e` |
| K4 integer SHA-256 | 16,385 | `eea119f4059566875ceaf784400d519fd8ff2148d9f221e0004fd04944a21797` |

K4 message digest (independent oracle): `79bfb41c6346bc10d842265e62eb4e35ce77ac3bc2d3c21ebe068d808acc1361`.
WGSL source pins (SHA-256 after CRLF→LF and BOM strip): K1 `ea7c4667…`, K2
`010e4d4d…`, K3 `1013c964…`, K4 `d9d8db07…`, K5 `3f003ca3…` (full values in
`expected-hashes.json`). `EXPECTED_COUNTS.K1` is 4,104 = 4,096 LCG words + 8
appended specials; the K1 *flag* vector adds +Inf and NaN (4,106 words) and has
**no count pin**, only a hash pin.

**The gate's stated limits, which are also its limits here:** it cannot compile
WGSL, cannot run a GPU, and cannot check cross-adapter equality. The browser lab
at `/reprogpu` is the only demonstration, and no CI artifact may be cited as
evidence of GPU agreement.

### 5.6 `bun test` and lint

`bun test` → `0 fail` required. Measured on this machine: idle
`1814 pass, 0 fail`, 84,571 `expect()` calls, 88 files, 13.0 s. **The pass count
is not a pin** — it changes as tests are added. Under host load two
`tests/warrant-arena.test.ts` cases time out (N6). `npx eslint .` and
`bunx tsc --noEmit` are CI steps, not research gates, and are deliberately not in
`verify:all`; both pass on this checkout.

---

## 6. How every table and figure is generated

There are **three** evidence scripts, not five. The task brief also referenced
`scripts/alibi-evidence.ts` and `scripts/bdl-evidence.ts`; **neither exists in
this repository**, and no Alibi or BDL figure/table artifact is committed. The
Alibi and BDL numbers live only in the papers and in the gate stdout quoted in
§5.

| Script | Reads | Writes | Committed? |
|---|---|---|---|
| `bun run scripts/warrant-evidence.ts` | `src/lib/warrant/arena.ts` via `runArena()` | `<DF_WARRANT_SCRATCH ?? tmpdir()/deepforge-warrant-evidence>/run-XXXX/warrant-evidence.json` + `canonicalJson` digest | **no** — scratch only, `mkdtemp` per run |
| `bun run scripts/keyfuse-evidence.ts` | `src/lib/keyfuse/*` + the 24-task corpus, brute-forcing the full slot product (n ≤ 12) | `<DF_KEYFUSE_SCRATCH ?? tmpdir()/deepforge-keyfuse-evidence>/run-XXXX/keyfuse-evidence.json` | **no** — scratch only |
| `bun run scripts/reprogpu-evidence.ts` | `src/lib/reprogpu/*` (kernels, vectors, philox, sha256, sum320, gemm) | **`docs/research/reprogpu/expected-hashes.json` — inside the repository, overwriting the committed pin file** | **yes** — 1,203 B, tracked |

**Hazard worth stating plainly:** the REPROGPU evidence script is a *generator*,
not an inspector. Running it overwrites the committed pin artifact, so a
reproducer who runs the evidence script and *then* the gate has destroyed the
evidence of drift. Run `bun run verify:reprogpu` **first**. The gate itself has
no auto-update path — `src/lib/reprogpu/expected.ts` is a hand-committed literal
and the gate compares against it.

**Two pin sets, one unenforced invariant.** `docs/research/reprogpu/expected-hashes.json`
and `src/lib/reprogpu/expected.ts` hold the same 13 values. They are currently
**identical** (verified field by field). **No gate or test compares them** — the
gate reads only `expected.ts`. Drift between the two is silent.

**What is byte-stable:** both scratch artifacts are written with
`canonicalJson` (keys sorted, no whitespace) and their digests are computed
over the payload excluding the digest itself. No timestamp, wall-clock value, or
absolute path enters either. The REPROGPU *browser* manifest is the exception —
see N1.

**Figures in the papers** are React components under
`src/components/*/figures/` and `src/components/papers/figures/`, computed in
the browser from the same engines; they are not build-time artifacts and are not
covered by any gate. `tests/paperFigures*.test.ts` covers their structure.

---

## 7. What a reproducer still cannot regenerate

Stated plainly, because a reader needs to know the difference between "checked"
and "re-derived".

1. **The Alibi Distance mining funnel.** 2,636 problems → 89,622 mutants →
   19,030 passers → 4,060 union-clean → 268 with witness → 217 held-out-clean →
   211 validated → **96 shipped** is a hard-coded constant in
   `verify-alibis.ts:47-60`. The mutation miner, its edit families, its candidate
   pool, and its selection script are not in the repository. A reproducer can
   re-verify that the 96 shipped puzzles are sound; they cannot re-derive that
   96 is the *right* 96, nor reproduce the funnel, nor audit the 3,094 corpus
   problems that were never mined.

2. **The Alibi Distance full-corpus census and its second engine.** 106,081 sampled
   mutants, 17,502 test-passing (16.50 %), 7,727 alibis (7.28 % of mutants),
   2,636/5,721 analyzable problems with a radius-1 alibi (**46.08 %**), 1,051
   probe-equivalent survivors (18.37 %), and the whole family / slice / decile /
   closure / category / cross-validation table set: **none** of it is computable
   from a checkout. The mining engines — the author's *and* the second, separately
   written one — are not in the repository, the raw mining run is not committed,
   and the scratch trees it lived in (`/var/folders/…/opencode/w41/`,
   `w41-verify-empirical/`, `w41-verify-theory/`, `w41-remine2/`, `w41-remine/`)
   are machine-local temp paths that no longer exist. Consequences that a reader
   should hold onto:

   - **The two-engine agreement is a provenance record, not a check.** The paper's
     replication table gives census rates within 0.14 pp, length quartiles within
     0.32 pp, and closure estimates within 0.44 pp. None of the three gaps is
     computed by any gate, and both engines are the same author's. Wording that
     says "an independent engine reproduces every rate within 0.2 percentage
     points" is wrong twice: the length-quartile gap is 0.32 pp, and the second
     engine is not in the repository.
   - **"Analyzable" is engine-defined.** 5,721 = 5,730 − 5 problems with fewer
     than five reference-evaluable probes − 4 that raised during mining. The 46.08 %
     denominator is therefore a property of the engine, not of the corpus.
   - **The gate's scope.** `verify:alibis` re-checks the claims attached to the
     96 shipped puzzles (and only those). It does not recompute the census, the
     funnel, the closure estimates, the cross-validation, the negative results, or
     the audits.

3. **The BDL full-corpus census.** 88,357 mutants, 9,041 invisible (10.23 %),
   14,534 test-passing (16.45 %), 6,574 hidden-visible (45.23 %), 2,523 problems
   with a visible slip (44.40 %), 55 zero-mutant problems, 2,818/5,627
   all-visible (50.08 %) came from `bdl_engine_clean.py` + `census_clean.jsonl`,
   neither of which is committed. `verify:bdl` substitutes two committed spot
   records (exact) plus a 240-problem stratified sample (band-checked). The
   full-corpus rates and their confidence intervals are therefore **re-derived on
   a sample within tolerance, not reproduced exactly**. Two of the four sampled
   bands are wide — `hidden_visible` ±10.07 pp, `problems_visible_slip` ±9.92 pp —
   and the sample observed 42.33 % against the 45.23 % headline, so passing is not
   agreement. The BDL walk study, cold sets, permutation null, latency audit, and
   synthetic routing model additionally need `analysis/recompute.py` and the walk
   artifacts, none of which are committed.
4. **Any Alibi or BDL figure/table artifact.** No evidence script exists for
   either study; the two "evidence scripts" named in the task brief are absent.
   Every Alibi/BDL number in the papers is transcribed from gate stdout, which
   §5 quotes verbatim.
5. **The REPROGPU cross-adapter result.** By design, and correctly so: it needs
   ≥ 2 real GPUs and a browser. The `outputSha256` pins are reproducible on CPU;
   the manifest digest is not reproducible even on one GPU (N1); and
   `docs/research/reprogpu/expected-manifest.json`, referenced by
   `wave-48-attack-reprogpu.md:74`, is not in the repository.
6. **The corpus's authorship process.** 5,730 problems were hand-authored to a
   written spec in batches. There is no generator, no versioned batch manifest,
   and no per-problem provenance record beyond "some agent wrote it against
   `AGENT_BRIEF.md`". No authorship, independence, or contamination control
   exists, and none is claimed here.
7. **Any external or cross-machine validation.** Nothing in this repository
   demonstrates that the results hold on hardware, locales, or Python builds
   other than the ones in §1.2. What the repository *does* have is a
   TypeScript/Python split: the TypeScript `verify-*.ts` drivers and the Python
   `py_*_verify.py` checkers re-implement the same criteria in two languages
   against the same committed data. That is a real strength — and it is
   **not** external replication, and it is **not** the "independent engine" the
   Alibi Distance paper names. Both halves of that split were written by this
   project's author, and neither the TypeScript side nor the Python side
   contains a census engine (items 1 and 2 above). "Cross-implemented" here means
   the 96-puzzle gate and the BDL harness fixtures are checked twice in two
   languages; it does not extend to any corpus-scale number.
8. **`src/data/problems/problem-meta.ts` synchrony.** Regenerating it is
   documented (`bun run scripts/generate-problem-meta.ts`) but nothing checks
   that the committed copy is current.

---

## 8. Reproduction checklist

For an external lab, start to finish. `[ ]` is yours to tick.

**Environment**

- [ ] Bun **1.3.9** installed (the version CI pins; other versions are untested
      against the committed digests).
- [ ] `python3` on `PATH`. **CPython 3.13 is the version the committed BDL spot
      digests were produced on**; the repo neither pins nor checks this.
- [ ] `gzip` on `PATH` (one printed statistic in the Alibi gate; its absence
      prints `-1` and does not fail the gate).
- [ ] No GPU, no network, no `.env`, no running server required.
- [ ] At least 2 CPUs (the BDL gate uses `min(8, cpus)` workers). Budget **~3
      minutes** (measured 189.3 s on 8 cores); the BDL gate alone is ~137 s of it.
- [ ] Ideally an **idle machine**. `bun test` and the step timings are
      host-load sensitive (N6); a busy CI runner can fail the `tests` step on a
      5 s timeout with no code change.

**Install and single-command check**

- [ ] `bun install --frozen-lockfile`
- [ ] `bun run verify:all` — the single entry point. Expect exit code 0 and a
      final line `REPRODUCE_OK {"steps":9,"failed":0,"seconds":…}`.
- [ ] Confirm the provenance header matches §3.1 and §3.2:
      `corpus.json … sha256 3ff60b9e3aa8b5ab8a1cb2e6dfcdffcc6d31774b7f770c3b787a8fdc8a498e31`
      and `alibi-bank.json … sha256 2b2df5ef864875f93369cabdd5a49d447c80f790a440d249b8171ee32d756556`.
      A mismatch here means the data differs, not the machine — stop and diff
      before reading any gate output.

**Per study**

- [ ] **Alibi Distance** — `bun run scripts/verify-alibis.ts`. Expect
      `ALIBI_GATE_SUMMARY` with `total 96, verified 96, failed 0,
      unionFailures 0, heldOutFailures 0, metadataMismatches 0, timeout 0,
      resistant 96, warmup 0`, then `PASS 96/96 verified`, and the bank block
      with `189658 union + 24560 held-out` probes, `412` shipped tests,
      `crash 32 / value 64 / timeout 0`, `difficulty Easy 24 / Medium 49 /
      Hard 23`. Confirm all 15 categories are listed.
- [ ] **Behavioral Delta Ledger** — `bun run scripts/verify-bdl.ts`. Expect
      `12/12 checks, 12/12 harness fixtures` and
      `corpus 5730 problems (sha256 3ff60b9e3aa8) · census not provided
      (self-contained mode)`. Check that the **exact** rows are
      `spot.records clean`, `run.two_runs_byte_identical true`, and the three
      `run.*` rows are `0`. Check that the five `sample.*` rows show `PASS` —
      their `observed` values are **expected to differ** from §5.2; that is the
      sample working, not a failure. Re-run with `DF_BDL_VERBOSE=1` to audit the
      tolerance arithmetic and record
      `determinism.digest 7afc1f2ac9ea62da450edb66147ded29fbf64e858d14d6e96225c6b2b44ef290`.
- [ ] **Warrant Lab** — `bun run scripts/verify-warrant.ts`. Expect `8/8` and
      `digest "ca0cda0f562b8c10"`. Confirm criterion 2 prints
      `P1-P5 pass, F1 fails as predicted` — F1 reporting `pass` is a failure.
- [ ] **KeyFuse** — `bun run scripts/verify-keyfuse.ts`. Expect
      `KEYFUSE_GATE {"passed":12,"failed":0,"cells":72,…}`, sweep fingerprint
      `09c5076ebac86617`, `cells=72 compared=69 equal=69`, and
      `pinned cells compared=120 … drift=0`.
- [ ] **REPROGPU** — **run the gate before the evidence script.**
      `bun run verify:reprogpu` → `5/5` criteria. Cross-check the pinned hashes
      against `docs/research/reprogpu/expected-hashes.json` **and**
      `src/lib/reprogpu/expected.ts` and note that the gate only enforces the
      latter.
- [ ] **Problem bank** — `bun run scripts/verify-problems.ts`. Expect
      `Structural errors: 0   Runtime failures: 0   Passed: 5730/5730` and
      `ALL GREEN`, with the 15-category table in §3.1.
- [ ] **Learning paths** — `bun run scripts/verify-paths.ts` and
      `bun run scripts/verify-paths-content.ts`. Expect `Paths: 33`,
      `Errors: 0`, `ALL GREEN` from each.
- [ ] **Unit tests** — `bun test`. Expect `0 fail`. The pass *count* moves as
      tests are added, so do not pin it; pin `0 fail`. **Run this on an idle
      machine** (N6): the two `warrant-arena` tests time out at 5,000 ms under
      load and report failure with no code change. If step 4 fails on
      `this test timed out after 5000ms` while all five research gates pass,
      re-run before investigating.

**Artifacts and figures**

- [ ] `bun run scripts/warrant-evidence.ts` — writes
      `warrant-evidence.json` to a fresh `run-*` directory under
      `tmpdir()/deepforge-warrant-evidence` (or `DF_WARRANT_SCRATCH`). Nothing is
      committed; nothing needs to be.
- [ ] `bun run scripts/keyfuse-evidence.ts` — writes `keyfuse-evidence.json` to
      a fresh `run-*` directory under `tmpdir()/deepforge-keyfuse-evidence` (or
      `DF_KEYFUSE_SCRATCH`).
- [ ] `bun run scripts/reprogpu-evidence.ts` — **overwrites the committed
      `docs/research/reprogpu/expected-hashes.json`.** Only run it after the
      gate is green, and `git diff` it afterwards.
- [ ] Confirm there is **no** Alibi or BDL evidence artifact to regenerate
      (`scripts/alibi-evidence.ts` and `scripts/bdl-evidence.ts` do not exist).

**Read the caveats before writing anything up**

- [ ] Read §2.3. Two of the three flagship Python studies are bounded by a
      **wall clock** (1.0 s for Alibi probes, 0.25 s for BDL calls), so a slow or
      loaded host can change a verdict with no code change. If a probe row fails
      on slow hardware, re-run before believing it.
- [ ] Read §7. The Alibi funnel, the BDL full-corpus census, and the REPROGPU
      cross-adapter result are **not** reproducible from a clean checkout. Do not
      describe any of them as regenerated.
- [ ] Note the product/research basis divergence (N4): the BDL probe basis a
      learner meets in the browser is **not** the basis the paper's numbers were
      computed on, and the code says so.
- [ ] Note the REPROGPU manifest digest is time-dependent by construction (N1);
      the reproducible quantity is `outputSha256`.
