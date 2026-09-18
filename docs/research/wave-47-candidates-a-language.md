# Wave 47 — Candidates A: Programming Languages, Compilers, Runtimes (Scientist survey)

Date: 2026-09-19. Scope: **survey only.** One file written
(`docs/research/wave-47-candidates-a-language.md`); no repo code touched; no git.

**Method (honest).** I issued 19 web-search queries; the search provider returned `HTTP 429` for
17 of them (only 2 returned), so the bulk of sourcing is **~30 direct URL fetches** plus in-repo
inspection. Total lookups > 45. Every URL below was fetched or is a canonical project page;
"accessed 2026-09-19" means fetched this session. Dates are quoted only where the source states
them. Where I could not confirm something (notably the brief's "DICE" by that name) I say so.

**Mission (verbatim).** Find a NEW TYPE OF THING or 10x/100x breakthrough in programming languages,
compilers, or runtimes that does not exist yet. If it exists, SKIP with URLs and hunt the gap next
to it. Existence map first, then 3–5 candidates ranked by missing × impact × feasibility.

**Honesty contract.** Grade every candidate `NEW CATEGORY / BREAKTHROUGH 10x+ / PARTIAL GAP /
EXISTS(skip) / HARD(why)`. Be adversarial to my own ideas. Partial still counts as existing unless
the missing piece is load-bearing.

**Repo facts used by the experiments (verified this session).** `deepforge` is a Next.js 16 + TS
app: 668 TS/TSX files, 303,305 LOC in `src/`, 86 test files under `tests/`, 43 route dirs. The
verification harness is `scripts/verify-problems.ts` → `spawnSync("python3", scripts/py_verify.py)`,
driving **5,730 problems / 5,768 `testCases`** (wave-46 count; `testCases` count measured here).
`py_verify.py` `exec`s each `solution`, calls its first `def`, deep-equals (1e-6 + int-overflow
guard). `scripts/py_bdl_verify.py` is a stdlib-only, md5-seeded, two-run byte-identical gate with a
48-probe behavioral basis (`docs/research/wave-42-blueprint.md`).

---

## 1. Existence map (URL; one line each)

### Incremental computation / compilation
- **Salsa** — generic query-based IC framework (Rust); docs `https://salsa-rs.github.io/salsa/`,
  crate `https://docs.rs/salsa`; repo 2,953★, created 2018-09-28 (`https://github.com/salsa-rs/salsa`).
  Rust-only; keys on declared query inputs, not behavior.
- **rustc incremental** — red-green / try-mark-green query DAG over a saved dep-graph
  (`https://rustc-dev-guide.rust-lang.org/queries/incremental-compilation.html`). Build outputs only.
- **DICE** — brief names it; I could **not find a system by that name** (404 on one likely repo).
  Verified neighbors: **LADDDER/IncA** incremental Datalog-with-lattices (Szabó et al. 2021,
  `https://dl.acm.org/doi/10.1145/3453483.3454026`), **FlowLog** incremental Datalog on Differential
  Dataflow (PVLDB vol. 19, `https://www.vldb.org/pvldb/vol19/p361-zhao.pdf`), **Differential Dataflow**
  (`https://github.com/timelydataflow/differential-dataflow`).
- **Adapton** — general-purpose IC for Rust (OOPSLA'15 names, PLDI'14); repo **archived 2026-09-08**
  (`https://github.com/Adapton/adapton.rust`). Largely dormant.
- **Incremental type checking** — Hazel "Incremental Bidirectional Typing via Order Maintenance",
  OOPSLA 2025 **Distinguished Paper** (`https://hazel.org/`, arXiv `2504.08946`). Exists, research.

### Language services & effects
- **LSP** — latest spec **3.18**; `https://microsoft.github.io/language-server-protocol/`.
- **Effect systems** — **Koka** infers effect types (`https://koka-lang.github.io/koka/doc/index.html`);
  **OCaml 5.3** effect handlers (`https://ocaml.org/manual/5.3/effects.html`) — docs **explicitly**
  state "effect handlers in OCaml do not provide effect safety; the compiler does not statically
  ensure that all the effects performed by the program are handled."
- **Algebraic effects** — OCaml 5 fibers, Koka, Unison abilities (`https://www.unison-lang.org/docs/the-big-idea/`).
- **Gradual typing / typed holes** — Hazel holes + typechecking incomplete programs (same URL).

### Memory safety, ownership, regions
- **Linear types / capability languages** — **Austral** (linear types + capability security,
  `https://austral-lang.org/`); Linear Haskell (arXiv `1710.09756`).
- **Region types** — Tofte–Talpin region inference (`https://doi.org/10.1006/inco.1997.2644`);
  MLKit page (`http://www.mlkit.org/`) did not resolve this session.
- **Memory-safe C/C++ alternatives** — Rust (`https://www.rust-lang.org/`), Carbon
  (`https://github.com/carbon-language/carbon-lang`), Fil-C (`https://github.com/pizlonator/fil-c`),
  **CHERI** hardware capabilities (`https://www.cl.cam.ac.uk/research/security/ctsrd/cheri/`).

### Runtimes
- **Wasm component model / WASI** — WASI **0.1/0.2/0.3**; capability-based no-ambient-authority
  sandbox (`https://wasi.dev/`); spec repo (`https://github.com/WebAssembly/component-model`).
- **JIT/AOT hybrids & tracing JITs** — GraalVM Native Image (`https://www.graalvm.org/`), V8 Maglev
  (`https://v8.dev/blog/maglev`), PyPy (`https://pypy.org/`), LuaJIT (`https://luajit.org/`).
- **Partial evaluation/staging** — Futamura projections, MetaOCaml, Graal/Truffle (survey:
  `https://stryker-mutator.io` no; see `https://www.graalvm.org/`).

### Verification, specs, testing
- **Verified compilers** — **CompCert 3.18** (08/2026), qualified for ATR 42/72 avionics under
  DO-178C/DO-333/DO-330 (03/2026) (`https://compcert.org/`); **CakeML**, self-bootstrapped, POPL'14
  Most Influential (`https://cakeml.org/`).
- **Translation validation** — **Alive2** (PLDI'21); README: "does not support inter-procedural
  transformations" (`https://github.com/AliveToolkit/alive2`).
- **Executable specifications** — Dafny (`https://dafny.org/`), TLA+ (`https://lamport.azurewebsites.net/tla/tla.html`),
  Alloy (`https://alloytools.org/`).
- **Property-based testing** — Hypothesis (`https://hypothesis.readthedocs.io/`), fast-check for
  TS (`https://fast-check.dev/`).
- **Fuzzing** — AFL++ (`https://github.com/AFLplusplus/AFLplusplus`), libFuzzer/OSS-Fuzz
  (`https://llvm.org/docs/LibFuzzer.html`).
- **Mutation testing** — Stryker, three platforms (`https://stryker-mutator.io/docs/`).

### Editors, schemas, capabilities, determinism
- **Live / structured / projectional editors** — Hazel (`https://hazel.org/`), JetBrains MPS
  (`https://www.jetbrains.com/mps/`), tree-sitter (`https://tree-sitter.github.io/tree-sitter/`).
- **Schema / IDL** — Protobuf (`https://protobuf.dev/`), Cap'n Proto (`https://capnproto.org/`),
  WIT in the component model (above).
- **Capability security in runtimes** — WASI (above); **Deno** — permissions are process/thread-wide,
  docs: "It is **not possible for different modules to have different privilege levels within the
  same thread**" (`https://docs.deno.com/runtime/fundamentals/security/`, updated 2026-06-17).
  **Node** permission model — process-wide "seat belt", "does not provide security guarantees in the
  presence of malicious code", added v20.0.0, stable v23.5/v22.13; `--permission-audit` mode
  (`https://nodejs.org/api/permissions.html`, v26.9.0 docs).
- **Deterministic simulation** — FoundationDB **Flow + Simulation**, deterministic single-process
  cluster sim, "~one trillion CPU-hours" (`https://apple.github.io/foundationdb/testing.html`,
  updated 2026-09-01); **Antithesis** deterministic hypervisor platform (`https://antithesis.com/`);
  **TigerBeetle VOPR** deterministic simulator, 24/7 on 1024 cores (`https://docs.tigerbeetle.com/concepts/safety/`);
  **rr** record/replay debugger — "emulates a single-core machine", "cannot record processes that
  share memory with processes outside the recording tree" (`https://rr-project.org/`).
- **Content-addressed code** — Unison: definitions hashed by syntax tree, perfect compilation cache,
  "No builds", no dependency conflicts (`https://www.unison-lang.org/docs/the-big-idea/`).
- **In-repo behavioral signature** — BDL (wave 42): 48-probe basis, states {0 agree,1 wrong,2 raise},
  md5-seeded; `docs/research/wave-42-blueprint.md`, `scripts/py_bdl_verify.py`.

---

## 2. Where the real gaps are (read of the map)

1. **Caches key on inputs, never on behavior.** Salsa/rustc hash query inputs; Bazel hashes declared
   inputs (`https://bazel.build/basics/hermeticity`); Unison hashes syntax trees. Not one keys a
   build/verification result on *observed behavior*, so a semantics-preserving rewrite always misses.
   BDL computes a behavioral signature but only as an offline *delta ledger*, never as a cache key,
   and never emits a distinguishing witness.
2. **No language gives effect *safety* for nondeterminism, and no runtime gives replay *by
   construction*.** OCaml 5 says so explicitly; Koka types effects but does not mediate them; the
   replay systems (FoundationDB, TigerBeetle, Antithesis, rr) are whole-system, single-language, or
   debugger-only.
3. **Authority is process-wide and manual.** Node/Deno/WASI all sandbox the *process*; Deno says
   per-module privilege in one thread is impossible. Nobody *infers* least authority from real
   execution, and nobody *diffs* authority across versions.
4. **Equivalence claims stop at IR.** Alive2 is intra-procedural and IR-only; regression verification
   needs a spec; differential testing finds diffs but certifies nothing.

---

## 3. Candidates (ranked missing × impact × feasibility)

### Candidate 1 — BEHAVE: behavior-keyed verification cache with a witness on miss  [RANK 1]
**1. One-liner.** Cache every verification result under a *behavioral fingerprint* (canonical outputs
of a hidden probe suite + error classes), so a semantics-preserving rewrite hits the cache, and a miss
returns the *distinguishing input* and both outputs.
**2. Gap.** All existing caches key on inputs: Salsa/rustc query inputs
(`https://rustc-dev-guide.rust-lang.org/queries/incremental-compilation.html`), Bazel input hashes
(`https://bazel.build/basics/hermeticity`), Unison syntax-tree hashes
(`https://www.unison-lang.org/docs/the-big-idea/`). What does **not** exist: a build/verify cache
whose key is *behavior* and whose miss is explained by a witness. In-repo BDL already builds a
48-probe behavioral signature, so this is adjacent — but BDL is a per-edit ledger, not a cache, and
it never produces a differencing input. Existing differential testing finds differences without
caching; regression verification needs a spec.
**3. Who hurts / what becomes possible.** Any growing corpus re-verifies everything on any source
change — here, 5,730 executions per `bun run verify`, and 86 test files per `bun test`. With a
behavioral cache, refactors and formatting sweeps become near-free, and a *cache miss becomes a bug
report* (input + expected vs actual). This affects CI cost, mutation testing, and AI-generated patch
review, where most edits are semantics-preserving.
**4. Why now.** The repo already has the signature primitive (`py_bdl_verify.py`, stdlib-only,
0.111 ms/signature CPython per `wave-42-blueprint.md`); fast-check makes probe generation cheap
(`https://fast-check.dev/`); mutation testing proves witnesses matter
(`https://stryker-mutator.io/docs/`); CPUs make re-execution cheap.
**5. Architecture.** `fingerprint(solution) = H( canonical(state per probe) )` where the basis =
shipped inputs ∪ perturbations (BDL's `probe_bank`), states in {agree, wrong, raise/timeout}, plus a
tolerance/interpreter version. Cache = `{fingerprint → verdict}`. `verify(newSolution)`: compute
fingerprint; on hit, reuse; on miss, run reference-vs-new over the basis and emit the first differing
probe as witness. Complexity: O(P) evaluations per edit (P≈24–48), not O(all problems). Status quo
change: cache validity becomes evidence-based rather than hash-based.
**6. Stage-1 (small team, pure TS/Python, zero deps).** Instrument `py_verify.py` to emit per-`def`
behavior records via the existing `probe_bank`/`signature` logic; add a TS cache dir keyed by
fingerprint + interpreter rev. Non-goals: soundness claims, cross-language, distributed cache,
changing Python semantics.
**7. Decisive first experiment (CPU-only, minutes, real corpus).** Baseline `bun run verify` → T0.
Apply AST-preserving source rewrites (rename locals, rotate independent statements, loop→comprehension)
to a sample of N=200 real solutions; measure fingerprint hit-rate and wall time. **Pass:** ≥90% hits,
≤20%·T0, and every injected semantic mutation (Stryker-style, N=200) is a miss *with a witness*.
**Fail:** <50% hits, or any semantic mutation silently hits.
**8. Risks.** Unsound by construction (probes can miss behavior) — must ship as advisory; two
different functions can share a fingerprint; snapshot/global mutation without tools can produce
spurious hits; fingerprint cost may rival verification for cheap solutions.
**9. Grade. BREAKTHROUGH 10x+ (advisory) / NEW CATEGORY for the cache key; PARTIAL GAP on soundness.**

### Candidate 2 — NONDET: nondeterminism as a typed, replayable effect  [RANK 2]
**1. One-liner.** A runtime discipline in which every nondeterminism source (clock, RNG, scheduling,
I/O, network, hash/object identity) is a *mediated effect*, so any run can be recorded and replayed
bit-exactly, and unmediated nondeterminism is detectable.
**2. Gap.** Deterministic simulation exists only as whole-system/single-language/commercial:
FoundationDB Flow + Simulation (`https://apple.github.io/foundationdb/testing.html`), TigerBeetle VOPR
in Zig (`https://docs.tigerbeetle.com/concepts/safety/`), Antithesis' hypervisor (`https://antithesis.com/`),
and rr, a debugger limited to a single emulated core and processes that don't share memory
(`https://rr-project.org/`). Effect handles exist (OCaml 5.3, Koka, Unison) but **OCaml explicitly
lacks effect safety** (`https://ocaml.org/manual/5.3/effects.html`); none guarantees capture/replay.
The missing piece: a portable, *typed* `Nondet` effect with a replay guarantee — a new runtime type.
**3. Who hurts / what becomes possible.** Flaky tests, races, and heisenbugs are the top debugging
tax; distributed teams pay for Antithesis precisely for this. A language-level guarantee makes
"record once, replay forever" a property of any program, makes tests deterministic by default, and
turns CI failures into reproducible artifacts. It is the substrate for simulation testing without a
hypervisor.
**4. Why now.** OCaml 5 fibers, Koka/Unison ability handlers, and WASI 0.3 async components prove the
runtime machinery (`https://wasi.dev/`); Antithesis' 2026 traction and blog cadence (Aug 2026 posts,
`https://antithesis.com/`) show demand; rr proves syscall-level replay is viable. Nothing in the
language stack combines effect typing with replay.
**5. Architecture.** A capability object owns the only references to `now()`, `rand()`, `spawn()`,
`recv()`; the runtime records an ordered *(source, response)* transcript and can feed it back.
Effect typing (or a static capability audit) flags unhandled sources. Complexity: intercepting is
easy in-process; *completeness* (native/FFI, real preemption) is the hard part. Status quo change:
tests run under a deterministic capability by default instead of touching globals.
**6. Stage-1 (pure TS, zero deps).** A recorder that wraps `Date`, `Math.random`, `crypto.randomUUID`,
`performance.now`, `setTimeout`, plus an audit that greps for unpatched sources (`process.hrtime`,
`Atomics.wait`, workers). Non-goals: syscall interception, true multicore scheduling, Python/JS parity.
**7. Decisive first experiment (CPU-only, minutes, repo's own tests).** Run a subset of the 86
`tests/*.test.ts` under the recorder twice; require byte-identical observable transcripts. Inject a
hidden `Math.random()` into one module: it must still replay identically. Inject a `process.hrtime()`
read: the audit must flag it. **Pass:** identical transcripts + both injections classified correctly.
**Fail:** any uncaptured source yields divergent transcripts without a flag.
**8. Risks.** Completeness is undecidable in general (FFI/native); single-threaded JS hides scheduling;
overhead may change timing-sensitive tests; typing is hard to retrofit onto JS.
**9. Grade. NEW CATEGORY (typed nondeterminism + replay guarantee); PARTIAL GAP in the JS subset.**

### Candidate 3 — AUTHORITY: inferred per-module least authority + authority diff  [RANK 3]
**1. One-liner.** Automatically infer each module/package's minimal capability set from real
executions plus static reachability, enforce it *per module*, and emit a semantic authority diff
between versions ("this upgrade newly wants `net` and `child_process`").
**2. Gap.** Node's permission model is process-wide, explicitly a "seat belt", "does not provide
security guarantees in the presence of malicious code", and does not inherit to workers
(`https://nodejs.org/api/permissions.html`). Deno: "not possible for different modules to have
different privilege levels within the same thread" (`https://docs.deno.com/runtime/fundamentals/security/`).
WASI grants capabilities from the embedder but does not infer them (`https://wasi.dev/`). `npm audit`
covers vulnerabilities, not authority. Per-module least authority and authority diffing do not exist.
**3. Who hurts / what becomes possible.** Every consumer of npm/PyPI inherits full authority; recent
supply-chain incidents were exactly "a dependency gained a capability". Inference + diff makes the
capability delta visible in review and blocks silent escalation; it also enables safe plugin models.
**4. Why now.** Node shipped `--permission-audit` with diagnostics-channel events (`node:permission-model:fs/net/child/...`)
and a `permission.drop()` runtime API; Deno ships a permission broker protocol (JSON-Schema-defined
request/response) and worker-scoped permissions. The observation and enforcement hooks now exist; only
inference and diffing are missing.
**5. Architecture.** (a) loader tags call sites with module identity; (b) instrumented `fs`/`net`/
`child_process`/`env`/`dns` record resource-level usage; (c) static import graph + eval/FFI taint
widens the result; (d) emit `authority.json` per module; (e) enforce via call-site check or isolate
high-authority modules in workers/realms; (f) `authority diff v1 v2`. Complexity: dynamic coverage
gaps; realms/workers needed for same-realm per-module enforcement. Status quo change: authority
becomes a reviewable, diffable artifact rather than a global flag.
**6. Stage-1 (pure TS, zero deps).** Record-and-report only: wrap the four Node modules, run a subset
of `bun test`, attribute usage to modules, emit per-module manifests. Non-goals: enforcement,
malicious-code resistance, FFI.
**7. Decisive first experiment (minutes, repo + `node_modules`).** Run tests under the recorder;
assert stable manifests across two runs; add a module that reads `process.env.SUPABASE_SERVICE_ROLE_KEY`
and one that opens a socket; both must appear in the manifest (and in a diff versus the prior
manifest). **Pass:** stable, resource-level manifests with both injections detected.
**Fail:** manifests nondeterministic or more than a small fraction of modules unresolved.
**8. Risks.** Dynamic analysis misses cold paths; `eval`, native addons, and FFI escape; same-realm
enforcement is genuinely hard (needs workers/realms) — this half should be graded separately.
**9. Grade. NEW CATEGORY for inference+diff; enforcement half is HARD.**

### Candidate 4 — EQUIV: a bounded observational-equivalence oracle for migrations  [RANK 4]
**1. One-liner.** Given two implementations (v1 vs v2, or Python vs TS), return either "no
distinguishing input among B probes" with the probe set and coverage, or a concrete counterexample.
**2. Gap.** Alive2 verifies IR→IR refinements but **only intra-procedurally** and is IR-specific
(`https://github.com/AliveToolkit/alive2`); CompCert proves compiler correctness, not program
equivalence (`https://compcert.org/`); regression verification requires a spec; differential testing
finds diffs but produces no certificate and no bound. No language-agnostic equivalence oracle consumes
two implementations directly.
**3. Who hurts / what becomes possible.** Anyone rewriting services, porting a library, or upgrading a
dependency wants "prove (boundedly) it still behaves the same". This is the engine that would make
Candidate 1 sound enough to trust and would gate dependency upgrades.
**4. Why now.** PBT generators are mature and run in-browser (`https://fast-check.dev/`); cheap CPU
makes large differential campaigns viable; type-directed or grammar-directed probe generation exists
via Hypothesis (`https://hypothesis.readthedocs.io/`). CompCert/Alive2 show the appetite for
machine-checked translation.
**5. Architecture.** Type/grammar-directed probe generator → canonical value oracle → coverage/diversity
search (bandit over argument shapes) → witness minimization (shrinking). Output is a *bounded* claim
with the bound stated. Complexity: stateful and side-effecting code defeats it; floating point and
nondeterminism need Candidate 2. Status quo change: none unless coupled to C1.
**6. Stage-1 (pure Python, zero deps).** Differential harness over the corpus: for a deliberately
rewritten solution, generate probes, compare, shrink the witness. Non-goals: soundness, stateful code,
cross-language.
**7. Decisive first experiment.** Take 200 real solutions, create behavior-preserving rewrites and
semantic mutants; require 0 false "equivalent" on mutants and witnesses for all mutants; report the
probe bound. **Pass:** 0 unsound claims, witness on ≥95% of mutants. **Fail:** any mutant declared
equivalent.
**8. Risks.** Fundamentally unsound without specs; testing is not proving — this is why it ranks last.
**9. Grade. HARD (no sound version at source level); the bounded version is basically differential
testing, which EXISTS.**

---

## 4. Ranked summary

| # | Candidate | New capability | Missing | Impact | Feasibility | Grade |
|---|-----------|----------------|---------|--------|-------------|-------|
| 1 | BEHAVE | behavior-keyed verify cache + witness | high | high | high | BREAKTHROUGH 10x+ / NEW CATEGORY |
| 2 | NONDET | typed nondeterminism + replay guarantee | high | very high | medium | NEW CATEGORY / PARTIAL |
| 3 | AUTHORITY | inferred per-module least authority + diff | high | high | medium | NEW CATEGORY / HARD |
| 4 | EQUIV | bounded equivalence oracle | medium | high | low | HARD |

Single highest-ceiling: **NONDET** (it would make every other verification technique reproducible).
Most feasible first win on this repo: **BEHAVE** (uses the existing `probe_bank`/`signature`).

## 5. Considered and killed (do not re-propose)

- **"A Rust Pyodide / in-browser Rust toolchain"** — EXISTS / already mapped in
  `docs/research/wave-46-candidates-a-runtime.md` (rubrc, BrowserPod, wasi-zigc).
- **Cross-language incremental verification engine** — EXISTS as the in-repo wave-46 `VerifyGraph`
  candidate (`docs/research/wave-46-candidates-e-systems.md`).
- **Incremental bidirectional type checking** — EXISTS (Hazel, OOPSLA 2025, `https://hazel.org/`).
- **Content-addressed code / perfect compilation cache** — EXISTS (Unison, `https://www.unison-lang.org/docs/the-big-idea/`).
- **Generic effects / algebraic effects** — EXISTS (OCaml 5, Koka, Unison).
- **Verified compilers** — EXISTS (CompCert 3.18, CakeML).
- **Mutation testing** — EXISTS (Stryker); used here only as a probe generator.
- **Deterministic simulation as a platform** — EXISTS (FoundationDB, TigerBeetle, Antithesis, rr);
  the gap is the *language-level, portable* guarantee, not simulation itself.

## 6. Primary sources (load-bearing)

Salsa `https://salsa-rs.github.io/salsa/` · rustc `https://rustc-dev-guide.rust-lang.org/queries/incremental-compilation.html`
· Adapton `https://github.com/Adapton/adapton.rust` · Hazel `https://hazel.org/` + arXiv `2504.08946`
· OCaml 5.3 effects `https://ocaml.org/manual/5.3/effects.html` · Koka `https://koka-lang.github.io/koka/doc/index.html`
· Austral `https://austral-lang.org/` · CHERI `https://www.cl.cam.ac.uk/research/security/ctsrd/cheri/`
· WASI `https://wasi.dev/` · component model `https://github.com/WebAssembly/component-model`
· Deno security `https://docs.deno.com/runtime/fundamentals/security/` · Node permissions `https://nodejs.org/api/permissions.html`
· Bazel hermeticity `https://bazel.build/basics/hermeticity` · CompCert `https://compcert.org/`
· CakeML `https://cakeml.org/` · Alive2 `https://github.com/AliveToolkit/alive2` · Dafny `https://dafny.org/`
· fast-check `https://fast-check.dev/` · Stryker `https://stryker-mutator.io/docs/`
· FoundationDB `https://apple.github.io/foundationdb/testing.html` · Antithesis `https://antithesis.com/`
· TigerBeetle `https://docs.tigerbeetle.com/concepts/safety/` · rr `https://rr-project.org/`
· Unison `https://www.unison-lang.org/docs/the-big-idea/` · LSP `https://microsoft.github.io/language-server-protocol/`.
In-repo: `scripts/verify-problems.ts`, `scripts/py_verify.py`, `scripts/py_bdl_verify.py`,
`docs/research/wave-42-blueprint.md`, `docs/research/wave-46-candidates-a-runtime.md`,
`docs/research/wave-46-candidates-e-systems.md`.
