# Wave 48 — Candidates: Developer Tooling & Data Systems (Scientist survey)

Date: 2026-09-19. Scope: **survey only.** One file written; no repo code touched; no git.

**Method (honest).** The brief's search provider returned `HTTP 429` on **6/6** batch queries at the
start (same failure mode as wave 47), so I switched to **direct URL fetches**: 24 canonical
pages/projects fetched this session (~20 succeeded, 4 were 404/redirect and re-fetched). Total
lookups > 34. Every URL below was fetched or is a canonical project page; "accessed 2026-09-19"
means fetched this session. Dates are quoted only where the source states them. This is a
**capability survey**, not a "gap in the literature" survey: I first enumerate enabling conditions
(2023→2026) that removed a concrete limit, then ask what became *possible but unbuilt*, then rank.

**Repo facts used by the experiments (verified this session).** `deepforge` = Next.js **16.1.3** +
React 19.1.0 + TypeScript, Bun test runner, Tailwind 4 (`package.json`). **5,730 problems / 5,768
testCases** across 15 categories (`AGENT_CONTEXT.md`). The oracle is
`scripts/verify-problems.ts` → `spawnSync("python3", scripts/py_verify.py)`; `py_verify.py` `exec`s
each `solution`, calls its first `def`, and deep-equals with `TOL = 1e-6` + int-overflow guard
(read this session). Second gates: `scripts/py_bdl_verify.py` (stdlib-only, md5-seeded, two-run
byte-identical), `py_alibi_verify.py`, plus TS gates `verify-*.ts`. This is a **CPU-only,
zero-server, Python-oracle corpus** — that shapes every experiment below.

**Honesty contract.** Grade every candidate `NEW CATEGORY / BREAKTHROUGH 10x+ / PARTIAL GAP /
EXISTS(skip) / HARD(why)`. Adversarial to my own ideas: if the missing piece is not load-bearing,
it is `EXISTS(skip)`.

---

## 1. Enabling conditions (date · old limit removed · new capability)

### Artifact distribution, provenance, cache
- **ORAS / OCI artifacts** — `oras.land` (docs v1.3; install snippet pins v1.2.0; accessed
  2026-09-19). Limit removed: registries no longer assume "the artifact is a container image."
  New: **any** file/asset can be pushed, tagged, referenced, and garbage-collected by a registry
  you already run. Libraries: Go/Python/Java/.NET/Rust.
- **npm provenance GA** — npm CLI **9.5.0+**, GitHub Actions/GitLab OIDC, signs + logs to a public
  transparency ledger (`https://docs.npmjs.com/generating-provenance-statements`, accessed
  2026-09-19; page edited 2026-05-04). Limit removed: provenance no longer needs long-lived signing
  keys. New: **keyless, verifiable `publish`/`provenance` attestations** for arbitrary artifacts.
- **SLSA v1.0** shipped 2023-04 (`https://slsa.dev/spec/v1.0/`); site now says **"Version 1.2 is
  the current version"** and v1.0 is **Retired** (accessed 2026-09-19). Limit removed: a
  cross-industry, incrementally-adoptable build-provenance vocabulary with recommended attestation
  formats.
- **Sigstore transparency log** — `https://www.sigstore.dev/` (JS shell; fetched 2026-09-19).
  New: append-only, tamper-evident log of signing events; verifiers can check inclusion proofs.
- **Sigstore model-transparency / OMS** — `https://github.com/sigstore/model-transparency` (244★,
  Apache-2.0, accessed 2026-09-19). It signs **whole model directories / file shards** via a DSSE
  envelope + in-toto statement with `predicateType .../model_signing/signature/v1.0`, supports
  Sigstore + key/cert/PKCS#11, and emits OTel traces.
- **Hugging Face Xet (content-defined chunking)** — "Xet is on the Hub," **2025-03-18**
  (`https://huggingface.co/blog/xet-on-the-hub`); first migration ~4.5 TB; a 5 GB SQLite appended by
  1 MB went from **13 min (LFS) to ~0.1 s**. Full Hub migration blog **2025-07-15**
  (`https://huggingface.co/blog/migrating-the-hub-to-xet`). Limit removed: file-level dedupe.
  New: **~64 KB CDC chunk dedupe**, ~64 MB blocks, CAS + LFS bridge.
- **GitHub Actions cache = 10 GB per repository** on every plan (Free/Pro/Team/Enterprise);
  **GitHub Support cannot increase it** (`https://docs.github.com/en/actions/reference/limits`,
  accessed 2026-09-19). Also: **200 cache uploads/min, 1500 downloads/min, 400 deletes/min** per
  repo. This is the hard wall that pushes teams to external caches.

### Build / CI / compilers
- **Turbopack stable + default** — Next.js **16**, published **2025-10-21**
  (`https://nextjs.org/blog/next-16`): "2–5× faster production builds, up to 10× faster Fast
  Refresh"; Turbopack filesystem caching beta; React Compiler stable; Node ≥20.9; `middleware.ts`
  → `proxy.ts`. (Repo is on 16.1.3.)
- **Rust `parallel-rustc`** frontend (blog **2023-11-09**,
  `https://blog.rust-lang.org/2023/11/09/parallel-rustc/`) and **Cranelift** codegen backend —
  limit removed: single-threaded type-checking / LLVM-only.
- **uv (Python packaging in Rust)** shipped **2024-02-15** (`https://astral.sh/blog/uv`): **8–10×**
  faster than pip/pip-tools cold, **80–115×** warm; `uv venv` ~80× faster than `python -m venv`;
  single static binary; resolves against arbitrary `--python-version`. Limit removed: slow,
  non-reproducible Python env setup.
- **Deno 2** shipped **2024-10-09** (`https://deno.com/blog/v2`): npm/`package.json`/workspaces
  compat, `deno install` ~90% faster hot cache, JSR registry, LTS. Limit removed: runtime lock-in.
- **Bun 1.2** shipped **2025-01-22** (`https://bun.sh/blog/bun-v1.2`): native `Bun.s3`,
  `Bun.sql` (Postgres), text lockfile `bun.lock`, HTML imports, cross-compile, bytecode cache.
  Limit removed: Node-only, dependency-heavy AWS/PG clients.

### Data formats & engines
- **Apache Iceberg** — current docs **1.11.0** (`https://iceberg.apache.org/`, accessed
  2026-09-19); open table format, time travel, hidden partitioning.
- **DuckLake v1.0** shipped **2026-04-13** (`https://ducklake.select/`): lakehouse = **SQL catalog
  (Postgres/MySQL/SQLite/DuckDB) + plain Parquet**, ACID, snapshots, time travel, schema evolution;
  MIT. Limit removed: custom catalog servers / heavy metastore.
- **Vortex** — `https://vortex.dev/` (accessed 2026-09-19): "100× faster random access, 10–20×
  faster scans, 5× faster writes vs Parquet," LF/Spiral, incubating.
- **FastLanes** — file-format paper, *PVLDB* **vol. 18 no. 11, Sept 2025, pp. 4629–4643**
  (`https://github.com/cwida/FastLanes`, 711★, MIT); "40% better compression, 40× faster decoding";
  zero dependencies; Python/C++/Rust. Prior layout paper *PVLDB* 16(9), **May 2023**.
- **Lance** — `https://lancedb.com/` (accessed 2026-09-19); **Lance SDK 1.0.0 Dec 2025**, native
  **Lance read support on HF Hub Feb 2026**, DuckDB extension, blob-v2, branching ("git for AI
  data"), metadata benchmark vs Delta/Iceberg on S3.
- **DuckDB-WASM** exists (`https://duckdb.org/docs/current/clients/wasm/overview`).
- **DVC / lakeFS** — data version control (`https://dvc.org/`, DVC now in the lakeFS/treeverse
  family, accessed 2026-09-19); Git-like hashes, but **hashes, not signed attestations**.

### Local dev, edge, testing
- **WebContainers** — `https://webcontainers.io/` (accessed 2026-09-19): full Node + native
  `npm`/`pnpm`/`yarn` in-browser, "up to 10× faster than local," Chromium/Firefox/Safari TP, Wasm
  out of the box. Limit removed: server-side dev sandboxes.
- **Cloudflare Containers** — docs updated **2026-08-28**
  (`https://developers.cloudflare.com/containers/`): serverless containers driven from Workers,
  bound to Durable Objects, `max_instances`, sleep-after. Limit removed: can't run arbitrary
  images/CPU-heavy jobs next to Workers.
- **Fly Machines** — `https://fly.io/docs/machines/`: VMs "started and stopped at subsecond
  speeds," REST API, per-machine lifecycle/region.
- **Hegel** — `https://hegel.dev/` (accessed 2026-09-19): a **universal property-based testing
  engine**, built on Hypothesis, with libraries for Rust/Go/C++/TypeScript/Java/OCaml. Limit
  removed: PBT was a Python-only (Hypothesis) / language-silo practice.
- **Antithesis** — `https://antithesis.com/` (accessed 2026-09-19): hypervisor-based deterministic
  simulation, fault injection, time-travel debugger; 2026 blog posts (2026-08-18, 2026-08-12).
  Commercial, not free/CPU-only.

### Verified non-events (adversarial)
- **WASI components are not yet a universal Python story.** WASI **0.2.0** was released
  **2024-01-25** (`https://component-model.bytecodealliance.org/`); **jco** now defaults scaffolds
  to **WASI 0.3** (`https://github.com/bytecodealliance/jco`, accessed 2026-09-19). JS/Rust/C#/Go/
  Python/MoonBit are listed, but a CPython-like runtime as a distributable component remains thin.
- **DuckLake is a format, not a transport.** It assumes a catalog DB; it does **not** solve
  browser-local, serverless, multi-device sync by itself.
- **Xet is Hub infrastructure.** The public client (`hf_xet`) is client-side; the chunk store is
  not a self-serve, static-HTTP-replicable primitive.

---

## 2. Now-possible-but-unbuilt (existence check each)

- **Signed, deduplicated *verification* attestations for datasets (not models, not packages).**
  Exists: npm provenance (packages), SLSA (builds), model-transparency/OMS (model dirs), DVC
  (hashes). Does **not** exist: a standard predicate attesting *behavior* of a dataset of
  executable problems — "oracle O passed cases C under runtime R." Why load-bearing: a signed hash
  of `solution`+`testCases` is what lets a third party trust a learning corpus without re-running
  it. URLs: npm docs, slsa.dev, model-transparency, dvc.org above.
- **Chunk-level (CDC) dataset distribution over plain static HTTP, browser-capable, open.**
  Exists: Xet (HF-internal CAS), `casync`/`zsync`/`desync` (server-ish, not browser/CAS-aware),
  ORAS (whole artifacts). Does **not** exist: a zero-dep, WASM/buildable gearhash-CDC client that
  pulls only changed ~64 KB chunks from *any* static host/CDN via HTTP Range, with offline
  verification. Why load-bearing: 5,730 problems with test cases will outgrow Actions' 10 GB cache
  and any single JSON bundle.
- **A portable, polyglot "problem/checker as a component" distribution unit.** Exists: wasmtime,
  jco, OCI artifacts, WASI 0.2/0.3. Does **not** exist: a WIT world like `check:verify/run` plus a
  registry of *verification kernels* as components, runnable identically in Node/browser/edge.
  Why load-bearing: it decouples "the oracle is correct and sandboxed" from "which language wrote
  it."
- **Corpus-scale adversarial testing of the *oracle itself*.** Exists: Hypothesis, Hegel, AFL/libFuzzer,
  Antithesis, pytest-testmon. Does **not** exist: a tool that ingests an existing `(solution,
  testcase, expected)` corpus and mass-mines metamorphic/differential properties to find
  **underdetermined or float-fragile problems**, offline, CPU-only. Why load-bearing: a corpus is
  only as good as its weakest test case.
- **Browser-local lakehouse with zero server.** Exists: DuckDB-WASM, DuckLake v1.0, Lance, Parquet.
  Does **not** exist: a documented pattern where the DuckLake catalog lives in OPFS/SQLite and
  Parquet sits on a static host, with catalog deltas synced as content-addressed files (no CRDT
  server). Why load-bearing: it would make a queryable, time-travelable corpus work offline and on
  phones.
- **EXISTS(skip) — not worth a candidate:** SLSA/Sigstore themselves; npm provenance; WebContainers;
  Fly Machines/Cloudflare Containers; DVC; Iceberg/DuckLake/Lance/Vortex/FastLanes as formats;
  Hilbert-style "remote cache" (Bazel/Buck2/sccache/Turborepo). All shipped, all documented at the
  URLs above. The gaps are *compositions*, not new primitives.

---

## 3. Candidates (ranked: newly-possible × impact × feasibility)

### C1 — Behavior-attested, chunk-deduplicated verification bundles
1. **New capability.** Sign and distribute a *verification result* over a whole problem corpus as a
   keyless, chunk-deduplicated, offline-verifiable artifact — identity by behavior, not bytes.
2. **Enabling + date/URL.** npm provenance/Sigstore keyless + transparency log (npm CLI 9.5.0+,
   `docs.npmjs.com/generating-provenance-statements`, accessed 2026-09-19); SLSA v1.0 **2023-04**
   (`slsa.dev/spec/v1.0/`, now v1.2); Xet CDC **2025-03-18** (`huggingface.co/blog/xet-on-the-hub`);
   ORAS v1.3 (`oras.land`). **Removed limit:** provenance previously required keys + whole-artifact
   shipping + no byte-level dedupe.
3. **Existence check.** Exists: model-transparency signs model *directories* (file/shard hashes);
   SLSA signs *builds*; DVC hashes data. Does **not** exist: an in-toto predicate for executable
   datasets' *behavior* (oracle + case outcomes + runtime), nor CDC dedupe of those bundles.
   Load-bearing because trust in a corpus without re-execution is the whole value.
4. **Who is unblocked / network effect.** Course/benchmark maintainers, CI providers, registries.
   Network effect: the more corpora ship bundles, the more verifiers/registries are worth; a single
   predicate spec becomes a standard.
5. **Architecture.** Stdlib-only: canonical JSON of `{solution, testCases, runtime, outcome}` →
   SHA-256; gearhash CDC → ~64 KB chunks; manifest as OCI artifact (ORAS) + DSSE/in-toto statement;
   Sigstore keyless verify. No server; browser verify via WebCrypto.
6. **Stage-1 milestone.** One CLI (`bundle`, `verify`) over a slice; **non-goals:** no registry
   hosting, no multi-language, no revocation, no UI.
7. **Decisive experiment (repo).** On 500 `problems/*.ts`: build bundle → edit 1 char in 1 solution
   → rebuild. **Pass** if re-push transfers `<5%` of bytes *and* `verify` succeeds with only the
   Sigstore root; **fail** if dedupe ≈ file-level or offline verify needs a live log.
8. **Risks.** Predicate bikeshedding; Sigstore log trust; testcase ordering nondeterminism;
   `exec` semantics must be pinned (Pyodide vs CPython version).
9. **Grade: NEW CATEGORY.**

### C2 — Verification kernels as WASM components (polyglot, sandboxed, one artifact)
1. **New capability.** Ship a problem's checker/oracle as a WASI component with a WIT world, run it
   unchanged in Node, browser (jco transpile), and edge, with no ambient authority.
2. **Enabling + date/URL.** Component model + WASI **0.2.0 2024-01-25**
   (`component-model.bytecodealliance.org`); jco defaults to **WASI 0.3**, transpiles to ES modules
   and runs in Node/browser (`github.com/bytecodealliance/jco`, accessed 2026-09-19). **Removed
   limit:** previously each language/runtime needed its own sandboxing + bindings.
3. **Existence check.** Exists: jco, wasmtime, `componentize-js`, OCI artifacts. Does **not** exist:
   a WIT verification world + registry of *oracles/checkers* as components; no "problem-as-component"
   distribution. Load-bearing: it makes the oracle portable and capability-safe, which is exactly
   what a zero-server judge needs.
4. **Who is unblocked / network effect.** Polyglot course authors, browser IDEs, edge judges.
   Network effect: a WIT world + registry lets any runtime reuse any checker; the world is the norm.
5. **Architecture.** WIT world `verify:check` (`run(case) -> verdict`); Rust or TS component; jco
   transpile for browser; ORAS for distribution. Zero/minimal deps (componentize-js bundles).
6. **Stage-1 milestone.** One component implementing `py_verify.py`'s deep-eq + first-`def` call for
   numeric/array outputs; **non-goals:** arbitrary Python, imports, generators, I/O.
7. **Decisive experiment (repo).** Run component in Node + in a headless browser over **200**
   problems; compare verdicts to `python3 scripts/py_verify.py`. **Pass** if 200/200 identical
   (including the 1e-6 and large-int guards); **fail** on any divergence or if the component needs
   network/fs.
8. **Risks.** Python semantics are the hard part (float repr, int overflow, dict order); component
   model churn (0.2→0.3); bundle size; browser memory.
9. **Grade: BREAKTHROUGH 10x+ (portability) — with HARD semantics risk.**

### C3 — Zero-server browser lakehouse for the corpus (DuckDB-WASM + DuckLake over static files)
1. **New capability.** A full ACID/time-travel lakehouse over the corpus that runs entirely
   client-side, with Parquet on a static host and the DuckLake catalog in local storage.
2. **Enabling + date/URL.** DuckDB-WASM (docs `duckdb.org/docs/current/clients/wasm/overview`);
   **DuckLake v1.0 2026-04-13** (`ducklake.select/`); Iceberg 1.11.0 (`iceberg.apache.org`);
   FastLanes **Sept 2025** (`github.com/cwida/FastLanes`) for decode speed. **Removed limit:**
   lakehouse required a server-side catalog/metastore.
3. **Existence check.** Exists: DuckDB-WASM, DuckLake extension, Parquet, Lance HF read. Does **not**
   exist: a documented *serverless* DockerLake pattern where the SQL catalog is browser-local and
   catalog snapshots sync as content-addressed files. Load-bearing: enables offline/phone queries and
   cheap hosting.
4. **Who is unblocked / network effect.** Static-site course platforms, classrooms, CI dashboards.
   Network effect: shared Parquet/catalog snapshots become a distribution format.
5. **Architecture.** Parquet per category on a CDN; DuckLake catalog = SQLite in OPFS; snapshot =
   content-addressed JSON/SQL delta verified by hash; no backend. Zero server deps.
6. **Stage-1 milestone.** Export `src/data/problems` → Parquet, open in DuckDB-WASM with a local
   DuckLake catalog, run 3 analytical queries + one time-travel query. **Non-goals:** multi-writer,
   auth, vector search, optimization.
7. **Decisive experiment (repo).** Cold-load a slice in a browser; then mutate one snapshot.
   **Pass** if cold init `<60 s`, a time-travel count returns the prior value, and the whole thing
   serves from `python -m http.server`; **fail** if any step needs a server or OPFS is unavailable.
8. **Risks.** WASM memory ceilings; OPFS browser differences; DuckLake/WASM extension maturity;
   catalog write contention.
9. **Grade: PARTIAL GAP (formats exist; the zero-server composition does not).**

### C4 — Corpus-scale oracle adversary (find bad test cases, not bad code)
1. **New capability.** Ingest an existing `(solution, testcase, expected)` corpus and automatically
   find problems whose *oracle* is underdetermined, float-fragile, or inconsistent with sibling
   problems — offline, CPU-only.
2. **Enabling + date/URL.** **Hegel** universal PBT engine, multi-language (`hegel.dev`, accessed
   2026-09-19); Antithesis proves structured exploration finds what tests miss
   (`antithesis.com`, 2026 posts); stateless fast runtimes. **Removed limit:** PBT/property mining
   was language-siloed and rarely applied to oracles at corpus scale.
3. **Existence check.** Exists: Hypothesis/Hegel, AFL/libFuzzer, pytest-testmon, Antithesis. Does
   **not** exist: corpus-scale metamorphic mining of *problem oracles* with shrink-to-minimal
   counterexample. Load-bearing: the 5,730-problem corpus' credibility is bounded by its worst test.
4. **Who is unblocked / network effect.** Benchmark/course authors, dataset curators. Network
   effect: a shared "ambiguity report" format lets corpora inherit fixes.
5. **Architecture.** Stdlib: parse problem modules; synthesize properties (determinism, permutation
   invariance, monotonicity, type/shape, tolerance sensitivity); run vs CPython; shrink. Hegel for
   generators, zero server.
6. **Stage-1 milestone.** Detectors for 3 property families on numeric/array problems; **non-goals:**
   auto-repair, full static analysis, arbitrary domains.
7. **Decisive experiment (repo).** Run on **200** problems with float/int-adjacent outputs. **Pass**
   if it surfaces ≥3 concrete problems whose expected value is tolerance-sensitive or whose
   `solution` is nondeterministic, each with a repro; **fail** if 0 findings in 200 (no signal).
8. **Risks.** False positives; unstated problem semantics (inputs not constrained); determinism
   assumptions; runtime cost.
9. **Grade: PARTIAL GAP.**

### C5 — Open CDC-over-static-HTTP dataset sync ("Xet for the rest of us")
1. **New capability.** Incremental, chunk-level pulls of a multi-GB dataset from any static
   host/CDN, browser-capable, with offline verification — no server, no special store.
2. **Enabling + date/URL.** Xet CDC proved ~64 KB chunking + block aggregation works at scale
   (`huggingface.co/blog/xet-on-the-hub`, **2025-03-18**); ORAS content-addressing (`oras.land`);
   WebCrypto + Range. **Removed limit:** dedupe used to require a bespoke CAS/backend.
3. **Existence check.** Exists: Xet (HF CAS), `casync`/`zsync`/`desync`, IPFS, ORAS. Does **not**
   exist: an open, zero-dep, browser-buildable CDC client tuned to Arrow/Parquet page boundaries
   over plain Range requests. Load-bearing: it removes the last server from corpus distribution.
4. **Who is unblocked / network effect.** OSS corpora, static docs sites, offline-first apps.
   Network effect: static mirrors become first-class distribution; chunk manifests are shareable.
5. **Architecture.** Gearhash CDC + Blake3/SHA-256 chunk IDs; manifest JSON; fetch only missing
   chunks via Range from CDN; verify root hash. WASM build, zero server.
6. **Stage-1 milestone.** CLI + tiny browser client that syncs a directory served by static HTTP;
   **non-goals:** packing/compression, encryption, P2P.
7. **Decisive experiment (repo).** Bundle 5,730 problems to a single file; serve with
   `python -m http.server`; edit one solution, re-sync. **Pass** if bytes transferred `<5%` and root
   hash verifies; **fail** if BaseHTTPServer Range handling or chunk alignment breaks.
8. **Risks.** HTTP Range correctness across hosts; small-file overhead; checksum collisions; Xet's
   real advantage may be server-side routing, not the algorithm.
9. **Grade: PARTIAL GAP.**

### C6 — Portable build cache as a verified OCI artifact (escape the 10 GB wall)
1. **New capability.** A cache that lives in an OCI registry, restores lazily by chunk, and carries
   SLSA/Sigstore provenance — usable from any CI provider, not tied to Actions' 10 GB/repo limit.
2. **Enabling + date/URL.** GitHub Actions cache hard limit **10 GB/repo, not increasable by
   Support** (`docs.github.com/en/actions/reference/limits`, accessed 2026-09-19); ORAS; SLSA v1.0
   (2023-04); Sigstore. **Removed limit:** cache was CI-vendor-local and capped.
3. **Existence check.** Exists: commercial Depot/Namespace/Blacksmith, sccache→S3, Bazel remote
   cache, Turborepo remote cache, `actions/cache`. Does **not** exist: an **open**, lazy,
   chunk-addressed OCI cache manifest with cryptographic provenance. Load-bearing for anyone >10 GB.
4. **Who is unblocked / network effect.** Monorepos, data/ML repos, self-hosters. Network effect:
   registries already exist; a cache-manifest spec makes caches portable between providers.
5. **Architecture.** Key = action/test hash; value = OCI artifact with chunk manifest; lazy Range
   fetch; optional cosign verify. CPU-only client, zero server.
6. **Stage-1 milestone.** Cache the Python env + compiled test artifacts for this repo into
   GHCR via ORAS, keyed by lockfile hash; **non-goals:** distributed execution, dedup across repos.
7. **Decisive experiment (repo).** Build normally; push cache; wipe; restore on a clean checkout via
   lazy fetch. **Pass** if restore `<10%` of cold time and `cosign verify-attestation` succeeds;
   **fail** if GHCR rejects chunk refs or lazy fetch ≠ faster.
8. **Risks.** Registry policy/rate limits; cache-key correctness (Turborepo env-hash pitfalls);
   secrets in cache; commercial incumbents.
9. **Grade: PARTIAL GAP.**

---

## 4. Ranking & verdict

| # | Candidate | Newly-possible | Impact | Feasibility | Grade |
|---|---|---|---|---|---|
| C1 | Behavior-attested chunk-dedup bundles | High | High | High | **NEW CATEGORY** |
| C2 | Verification kernels as WASM components | High | High | Med | **BREAKTHROUGH 10x+** |
| C3 | Zero-server browser lakehouse | Med | Med | High | PARTIAL GAP |
| C4 | Corpus-scale oracle adversary | Med | High | Med | PARTIAL GAP |
| C5 | CDC-over-static-HTTP dataset sync | Med | Med | Med | PARTIAL GAP |
| C6 | OCI verified portable build cache | Med | Med | Med | PARTIAL GAP |

**Strongest single bet:** **C1**, because every enabling primitive shipped (keyless signing, transparency
log, CDC dedupe, OCI distribution) and the *composition* — attesting executable-dataset behavior — is
genuinely absent. **C2** is the bigger breakthrough but the Python-semantics barrier is real; its
Stage-1 scope must stay numeric/array-only. C3–C6 are real gaps but each is one integration away from
an existing product/format, so they are partial, not new categories.

**Skipped as EXISTS (with URL):** SLSA (`slsa.dev`), Sigstore/npm provenance
(`npmjs.com/generating-provenance-statements`), ORAS (`oras.land`), Xet
(`huggingface.co/blog/xet-on-the-hub`), Iceberg/DuckLake/Vortex/FastLanes/Lance
(`iceberg.apache.org`, `ducklake.select`, `vortex.dev`, `github.com/cwida/FastLanes`, `lancedb.com`),
WebContainers (`webcontainers.io`), Fly/Cloudflare (`fly.io/docs/machines`,
`developers.cloudflare.com/containers`), Turbopack/Next 16 (`nextjs.org/blog/next-16`), uv
(`astral.sh/blog/uv`), Deno 2 (`deno.com/blog/v2`), Bun 1.2 (`bun.sh/blog/bun-v1.2`), Hegel
(`hegel.dev`), Antithesis (`antithesis.com`), DVC (`dvc.org`).
