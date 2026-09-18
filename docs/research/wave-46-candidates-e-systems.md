# Wave 46 — Systems candidates: build/dev 10x–100x and in-browser model runtimes

Date: 2026-09-19. Scope: survey only. One file written (`docs/research/wave-46-candidates-e-systems.md`);
no repo code touched; no git. Method: read-only repo reconnaissance and **32 external queries
(24 search-provider + 8 targeted source lookups)**, with load-bearing sources fetched directly.
Every claim below carries a URL; dates are the source's own.

**Repo facts used for milestones (read-only, `[repo]`).** Next.js 16 / React 19 / TS 5 / Tailwind 4,
single app (not a workspace monorepo). `[repo]` `src/data` = 206 files, 202 `.ts`; problem bank =
**5,730 `testCases`** across 152 problem files and 15 category dirs; tests = **85 files / 1,619 `test()`**;
`scripts/py_verify.py` executes every solution in real Python; `scripts/verify-problems.ts` (191 lines)
re-verifies the whole bank with no result cache; `.next` build dir = 1.4 GB. Bun is the test/build runner.

**Honesty contract.** "Partial" counts as EXISTS unless the missing piece is load-bearing. Grades:
NEW CATEGORY / BREAKTHROUGH 10x+ / PARTIAL GAP / EXISTS / HARD. No contract-only proposals.

---

## 1. Existence map — Track 1 (build/dev systems)

| Thing | Number / status | URL (1 line) |
|---|---|---|
| Bazel remote cache + REAPI | action-cache + CAS, gRPC; status quo | https://bazel.build/remote/caching |
| Buck2 (Meta) | "up to 2x faster than Buck1"; DICE; hermetic | https://buck2.build/docs/about/why/ |
| Pants | polyglot, rule-based, remote cache | https://www.pantsbuild.org/ |
| Nx vs Turborepo (2026) | single runner 25m32s vs 21m56s; Nx agents 9m20s vs 19m18s | https://tech-insider.org/turborepo-vs-nx-vs-lerna-2026 (2026-08-23) |
| Turborepo cache hits | 6 tasks cold 384 ms → 0 tasks/12 ms warm | https://dev.to/zny10289/monorepos-in-2026-turborepo-vs-nx-vs-bazel-what-actually-works-1j85 (2026-05-23) |
| Salsa / rustc red-green | try-mark-green, early cutoff | https://rustc-dev-guide.rust-lang.org/queries/incremental-compilation.html |
| ccache | compiler cache, direct mode, remote storage | https://ccache.dev/manual/latest.html |
| sccache | distributed compile + multi-level cache | https://github.com/mozilla/sccache |
| mold linker | 2.4–16.1x vs lld, up to 112x vs GNU ld | https://arxiv.org/abs/2608.23228 (2026-08-24) |
| ld64.lld plan | target ~3x via parallelFor | https://discourse.llvm.org/t/plan-to-improve-ld64-lld-performance/91715 (2026-09-02) |
| Predictive test selection (Meta) | >95% failures, >99.9% faulty changes | https://arxiv.org/abs/1810.05286 |
| Targeted Test Selection (T-TS) | ML selection without coverage maps | https://arxiv.org/html/2509.10279v1 |
| Nix hermeticity | sandbox + declared inputs, reproducible | https://reproducible.nixos.org/ |
| SLSA | L0–L3 provenance levels | https://slsa.dev/spec/v1.1/levels |
| WASI 0.3 / Component Model | native async; components as linking unit | https://github.com/WebAssembly/WASI/releases (0.3.0, 2026-06-11) |
| uv | 8–10x pip cold, 80–115x warm | https://astral.sh/blog/uv (2024-02-15) |
| Gradle config cache at scale | 200-module monorepo still misses on env/buildSrc | https://www.javacodegeeks.com/2026/03/gradle-9s-configuration-cache-at-scale-why-your-200-module-enterprise-build-is-still-slow.html (2026-03-06) |
| TS 7 (Go port) | ~10x; VSCode 1.5M lines 89s → 8.74s | https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/ (2026-07-08) |
| Real cache failures | moon remote cache never hits; ccache 2%; GHA 10 GB cap | https://github.com/moonrepo/moon/issues/2349 (2026-02-10) · https://github.com/Cockatrice/Cockatrice/issues/6690 (2026-03-12) · https://github.com/camunda/camunda/issues/18750 |

**Where Track 1 is still slow (evidenced):** cold CI/ephemeral runners; cache-key *soundness* (observed:
stale ccache, 2% hit; moon hash juggling; Gradle one-env-var invalidations); polyglot repos (no engine
spans TS typecheck + Python execution + data corpus); verification re-runs with no memoization; TS 10x
came from a language rewrite, not from incrementality (`[repo]` still re-runs all 5,730 problems).

## 2. Existence map — Track 2 (browser model runtime)

| Thing | Number / status | URL (1 line) |
|---|---|---|
| WebGPU | Baseline Jan 2026; Chrome 113+, Firefox 141+, Safari 26+ | https://web.dev/blog/webgpu-supported-major-browsers (2025-11-25) |
| WebNN | CRD 2026-08-13; Origin Trial 147–149; only web NPU access | https://www.w3.org/TR/webnn · https://utsubo.com/blog/frontier-web-apis-2026-production-ready (2026-04-29) |
| ONNX Runtime Web | wasm/webgl/webgpu/webnn EPs | https://onnxruntime.ai/docs/tutorials/web |
| Transformers.js | v4 (2026-02-09); WebGPU "up to 100x vs WASM" (v3) | https://huggingface.co/blog/transformersjs-v4 · https://huggingface.co/blog/transformersjs-v3 |
| WebLLM / MLC | up to 80% of native decode | https://webllm.mlc.ai/ · arXiv 2412.15803 |
| LlamaWeb (llama.cpp WebGPU) | 29–33% less memory; 45–69% higher decode | https://arxiv.org/abs/2605.20706 (2026-05-20) |
| WebGPU dispatch overhead | 24–36 µs (Vulkan), 32–71 µs (Metal); batch-1 overhead-bound | https://arxiv.org/abs/2604.02344 |
| Chrome built-in AI (Gemini Nano) | Prompt/Summarizer/Translator; ≥22 GB free, >4 GB VRAM | https://developer.chrome.com/docs/ai/prompt-api (upd. 2026-08-26) |
| Chrome model management | hot-swap updates; model purged under disk pressure | https://developer.chrome.com/docs/ai/understand-built-in-model-management |
| Model caching | Cache API recommended; OPFS/IDB worse | https://developer.chrome.com/docs/ai/cache-models |
| OPFS | Baseline since Mar 2023; sync access in workers | https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system |
| Cross-Origin Storage (COS) | hash-keyed cross-origin cache; polyfill only; 177 MB dup fixed | https://huggingface.co/blog/cross-origin-storage (2026-06-23) · https://github.com/WICG/cross-origin-storage |
| MCP | 2026-07-28 spec; stateless; ~0.5 B SDK downloads/mo | https://modelcontextprotocol.io/docs/2026-07-28 |
| WebMCP | proposed standard, origin trial Chrome 149 | https://developer.chrome.com/docs/ai/webmcp (2026-05-18) |
| Model provenance | IETF attestation draft; Cisco Model Provenance Kit | https://datatracker.ietf.org/doc/draft-sharif-ai-model-lifecycle-attestation/00 · https://blogs.cisco.com/ai/model-provenance-kit (2026-04-30) |
| In-browser LoRA fine-tune | demo studio exists | https://github.com/virgilvox/lora-lab |
| WebGPU in Shared/ServiceWorker | **not implemented in any browser** (position closed) | https://github.com/mozilla/standards-positions/issues/971 |
| Cross-tab/GPU preemption | Chromium: "Won't Fix (Intended Behavior)" | https://issues.chromium.org/issues/467713991 |
| Per-tab memory ceiling | 256 MB default buffer; 1.5 GB web-process cap iOS | https://github.com/mlc-ai/web-llm/issues/386 |
| In-browser vs native | 16.9x slower CPU / 4.9x slower GPU; 334.6x memory | https://www.microsoft.com/en-us/research/publication/anatomizing-deep-learning-inference-in-web-browsers |
| Browser runtime bench | WASM beats WebGPU at batch 1 by ~13x | https://github.com/delcenjo/browser-runtimes-bench (2026-07-12) |
| P2P/edge LLM | SwarmLLM, distributed-llama; SWARM-LLM routing | https://github.com/enapt/SwarmLLM · https://arxiv.org/abs/2606.14711 |

**Where Track 2 does NOT exist:** no browser-standard *runnable model endpoint* (COS gives bytes, not a
capability/interface/arbiter); no persistent KV cache across reloads; no cross-tab GPU sharing (blocked);
no page-to-page model routing contract (WebMCP is page-tools-for-agents, MCP is app↔tools).

---

## 3. Candidates (ranked by missing × impact × feasibility)

### C1 — VerifyGraph: cross-language, demand-driven incremental **verification** engine (Track 1) — flagship T1
**One line.** A Salsa/DICE-style query graph whose nodes span a TypeScript app, a real Python interpreter,
and a generated data corpus, so that *verification results* (not just build outputs) are memoized,
early-cutoff, and replayed after a one-line change.
**Gap.** Salsa and DICE are single-language and build-oriented (rustc guidance: https://rustc-dev-guide.rust-lang.org/queries/incremental-compilation.html; Buck2: https://buck2.build/docs/about/why/). Bazel requires hermetic declared inputs (https://bazel.build/basics/hermeticity). No engine keys a *cross-process* verification result on a typed graph that mixes JS/TS and Python; existing test selection is statistical, not sound (https://arxiv.org/abs/1810.05286). `[repo]` `verify-problems.ts` currently re-runs **all 5,730** Python executions.
**Who hurts.** Anyone with a polyglot monorepo: TS front end + Python model/verifier + data corpus; CI re-verifies everything, so the corpus can't grow.
**Why now.** Salsa is mature and language-neutral in spirit; WASI 0.3/components (https://github.com/WebAssembly/WASI/releases) prove cross-language units are viable; TS 7 removed the typecheck bottleneck (https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/), leaving verification as the wall.
**Architecture.** Providers: (a) TS structural provider (problem shape, id/category), (b) corpus provider (paths, articles, cross-refs), (c) PyExecutor provider (batched subprocess, deep-eq semantics), (d) `verify` query joins them. Node identity = content hash of (solution, testCases, tolerance fn, interpreter rev). Edges declared or *observed*: execution records which corpus nodes it read; early cutoff when a re-executed solution still matches.
**Stage-1 milestone.** Instrument the existing verifier with the query graph; non-goals: no new test framework, no distributed execution, no change to Python semantics.
**Decisive experiment (CPU-only, ~minutes, `[repo]`).** (1) Full baseline `bun run verify`; (2) change one problem's `solution` and one path file; measure nodes recomputed and wall clock. **Pass:** <5% of 5,730 problems re-executed, <10% baseline wall clock, and a seeded mutation in a *dependency* is still caught (soundness). **Fail:** >20% recompute or any missed mutation.
**Risks.** Solution code is a string, so true read-sets are only approximated; Python import/global state can create hidden edges; batching may dominate at small deltas.
**Grade. BREAKTHROUGH 10x+** (if sound) — but the cross-language delta is real and load-bearing.

### C2 — MCL: a **Model Capability Layer** / runnable model endpoint for browsers (Track 2) — flagship overall
**One line.** A browser-level contract — `open(modelRef) → session` — that resolves a content-addressed
model, exposes a declared capability manifest (task, I/O schema, context, quant, providers), and executes
it on whichever backend exists (built-in AI / WebGPU / WebNN / WASM) with a stable invocation API.
**Gap.** Cross-Origin Storage already dedups *bytes* by hash (https://huggingface.co/blog/cross-origin-storage), and transformers.js has a library-level Model Registry — but nothing declares, negotiates, or executes a model as a first-class browser resource. Built-in AI is Chrome-only and single-model (https://developer.chrome.com/docs/ai/built-in); WebMCP exposes *page tools to agents*, not models to pages (https://developer.chrome.com/docs/ai/webmcp); MCP is app↔tool, not model↔model (https://modelcontextprotocol.io/docs/2026-07-28). The missing, load-bearing piece is the **capability manifest + provider arbiter + session contract**, not storage.
**Who hurts.** Every web AI app re-implements model loading, quant fallback, capability sniffing, spill/eviction; two apps on one page fight over the same GPU with no arbiter (https://issues.chromium.org/issues/467713991).
**Why now.** WebGPU is Baseline (https://web.dev/blog/webgpu-supported-major-browsers); WebNN is in Origin Trial with unique NPU access (https://www.w3.org/TR/webnn); COS establishes hash-keyed cross-origin resources; Transformers.js/WebLLM/wllama already opt into COS (https://huggingface.co/blog/cross-origin-storage), so an endpoint layer can sit on top today.
**Architecture.** `ModelHandle{capabilities, weightsHash, tokenizer, providerPlan}`; manifest fetched from the same CAS object as the weights; provider registry (built-in-AI, ORT-WebGPU, ort-wasm, WebNN); a SharedWorker/host-level arbiter that serializes GPU sessions and reuses a prompt-prefix cache; sessions expose `prompt/embed/finetune` and are transferable-free (no GPU in SharedWorker yet, so arbitration is cooperative via BroadcastChannel).
**Stage-1 milestone.** A library + polyfill (not a standards pitch): manifest schema, resolver over Cache API/COS, provider selection with capability probe, one cooperative in-page arbiter. Non-goals: no cross-origin weights beyond COS, no training, no cross-tab GPU sharing.
**Decisive experiment (CPU-only, ~minutes).** Serve two tiny models (e.g. MiniLM embed + a <=0.5B causal) via wasm EP in headless Chrome; run: (a) capability negotiation with WebGPU disabled, (b) two "apps" opening the same hash, (c) an eviction under a stubbed 256 MB ceiling. **Pass:** second open does zero weight download, correct provider fallback, no OOM, and deterministic manifest hash. **Fail:** any cross-app re-download or crash.
**Risks.** This is a standard-shaped product with a library-shaped MVP; browsers may never expose an arbiter, and COS availability-gating can return "not present" for privacy (https://huggingface.co/blog/cross-origin-storage), making negotiation unreliable.
**Grade. NEW CATEGORY** (as a standard) / **PARTIAL GAP** (as a library).

### C3 — TraceKey: derive cache keys from **observed inputs** instead of declared ones (Track 1)
**One line.** Instrument the runtime (fs + module resolution) to record the exact file/byte closure a
task actually read, and key the cache on that closure plus outputs, eliminating hand-written input lists.
**Gap.** Bazel is hermetic but requires declared inputs (https://bazel.build/basics/hermeticity); ccache
uses the preprocessor, sccache requires path parity (https://github.com/mozilla/sccache); Turborepo needs
manual `inputs`, Nx infers from tool config (https://nx.dev/docs/kb/nx-vs-turborepo). The observed failure
mode is real: stale/missing keys cause 2% ccache hits and near-zero remote hits (https://github.com/Cockatrice/Cockatrice/issues/6690, https://github.com/moonrepo/moon/issues/2349). No OSS task runner derives keys from observed reads for arbitrary JS/TS+Python tasks.
**Who hurts.** Teams whose remote cache "looks fine" but silently over- or under-invalidates; `[repo]` Turbo-style inputs would have to enumerate 206 data files and 85 tests by hand.
**Why now.** Node/Bun expose import hooks and `fs` can be wrapped in-process; TS 7 makes the typecheck step cheap enough that cache-key soundness is the remaining CI wall.
**Architecture.** Tracer wraps `fs`/loader, records (path, mtime+size, content hash) reads and writes; key = Merkle of read-set + declared env + tool version; outputs stored in a CAS keyed by that Merkle. Write-set is a checked side condition (undeclared writes fail the run).
**Stage-1 milestone.** Wrap `bun test` and one data-verify command with the tracer; non-goals: no rewrite of Turborepo, no distributed cache.
**Decisive experiment (CPU-only, ~minutes, `[repo]`).** Run `bun test` twice + 10 seeded edits (one per category). **Pass:** key identical on no-op, 10/10 edits invalidate, 0 false invalidations, tracer overhead <=25%. **Fail:** any stale hit or overhead >40%.
**Risks.** Dynamic `require`/`eval` and Python subprocess reads escape the tracer; determinism of mtimes; the mechanism is adjacent to ccache/Bazel, so the "new" claim rests on auto-derivation only.
**Grade. PARTIAL GAP.**

### C4 — KV-OPFS: persistent, paged KV cache for browser inference (Track 2)
**One line.** Persist and reload the model's KV cache (paged into OPFS) so a returning user skips prefill
for a repeated long prompt — across reloads and, via COS, across origins.
**Gap.** Native llama.cpp persists prompt cache to disk; browser runtimes keep KV in RAM only (https://webllm.mlc.ai/), and Chrome's guidance is model-weights caching, not KV (https://developer.chrome.com/docs/ai/cache-models). No browser format exists for KV blocks, no integrity scheme, no eviction policy tied to the 256 MB/default and 1.5 GB process caps (https://github.com/mlc-ai/web-llm/issues/386).
**Who hurts.** Long-context web AI on repeated visits: every reload re-prefills thousands of tokens; `[repo]` has no model today, but its Pyodide harness and problem-explain features are the target consumers.
**Why now.** OPFS is Baseline with sync worker access (https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system); WASM EP dispatches at ~24–36 µs (https://arxiv.org/abs/2604.02344), so prefill, not dispatch, dominates a reload.
**Architecture.** Paged KV (block table + block files) in OPFS, per-session directory, SHA-256 per block, manifest binding (weightsHash, modelRev, tokenizer, rope config); reuse only on exact prefix match; LRU eviction under a declared byte budget.
**Stage-1 milestone.** ORT-Web **wasm** backend, one small causal model, fixed prompt. Non-goals: no WebGPU, no cross-origin, no multi-user.
**Decisive experiment (CPU-only, ~minutes).** Time-to-first-token for a 2,000-token prompt cold vs. reload-with-KV, and verify a corrupted block is rejected. **Pass:** >=5x TTFT reduction, KV bytes bounded, CRC/SHA mismatch rejected. **Fail:** <2x or silent corruption acceptance.
**Risks.** CPU wasm inference is slow enough to make the experiment tedious; KV formats are runtime-specific (ORT/MLC/llama.cpp disagree), so a "format" is premature; browser may evict OPFS under pressure.
**Grade. PARTIAL GAP** / plausible **new format**.

### C5 — VCAS: signed, portable verification-result cache (Track 1)
**One line.** Treat a verifier verdict as a content-addressed, signed artifact replayable across repos and
machines, analogous to SLSA build provenance but for *test/verification results*.
**Gap.** Bazel remote cache is Bazel-only and unsigned; GHA cache is per-repo and capped (https://github.com/camunda/camunda/issues/18750); SLSA covers build provenance, not test verdicts (https://slsa.dev/spec/v1.1/levels); reproducible-builds projects target artifacts, not verdicts. `[repo]` re-executes 1,619 tests and 5,730 Python solutions with no portable result cache.
**Who hurts.** CI cost and cross-fork duplication; open-source projects can't share "this commit passed" evidence.
**Why now.** SLSA L2/L3 gives signing infrastructure; WASI/OCI packaging gives a portable execution unit (https://component-model.bytecodealliance.org/reference/faq.html); the ccache/GHA failures show demand.
**Architecture.** `Verdict{inputHash, envHash, toolRev, result, signature}` in a CAS; verifier signs with a key bound to a reproducible environment; consumers verify signature + re-check a sample (probabilistic replay) before trusting.
**Stage-1 milestone.** Local-only CAS for `bun test` + `py_verify`; non-goals: no PKI, no cross-org trust, no revocation.
**Decisive experiment (CPU-only, ~minutes, `[repo]`).** Warm cache restore for 85 test files + a Python batch; tamper the stored verdict. **Pass:** restore <2 s vs >60 s execute, tamper rejected, and replay sample catches a seeded flaky verdict. **Fail:** false trust accepted.
**Risks.** Flaky tests make signed verdicts dangerous; signing is a trust/PKI problem, not a code problem; environment binding is exactly the hard part that GHA cache gets wrong.
**Grade. PARTIAL GAP.**

### C6 — Cross-tab GPU model arbiter (Track 2) — flagged HARD
**One line.** Share one loaded model/GPU session across same-origin tabs with preemptive scheduling.
**Gap/blocker.** WebGPU is deliberately not available in SharedWorker/ServiceWorker — "not yet implemented in any browser" (https://github.com/mozilla/standards-positions/issues/971) — and Chromium marks GPU non-preemption "Won't Fix" (https://issues.chromium.org/issues/467713991). Pure cross-tab worker coordination exists only for OPFS (https://github.com/arnold-graf/cross-tab-worker); SharedWorker is Baseline 2026 (https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker).
**Verdict.** The load-bearing primitive (GPU context in a shared worker, or preemption) is absent by design, so a code-level solution cannot exist without a browser change. **Grade. HARD.** Keep for a future wave only if vendor positions move.

---

## 4. Skip list (do NOT re-propose)
- **A new general build system / hermetic monorepo tool.** Bazel/Buck2/Pants/Turborepo/Nx own this; evidence shows the pain is cache soundness, not missing engines.
- **Another WASM-browser LLM runtime.** WebLLM, Transformers.js, LlamaWeb, wllama are mature; deltas are kernel/memory tuning (LlamaWeb's 29–33%).
- **Statistical predictive test selection.** Comprehensive prior art (https://arxiv.org/abs/1810.05286; https://arxiv.org/html/2509.10279v1).
- **WebGPU-in-SharedWorker / GPU preemption.** Blocked at the spec/vendor level (URLs in C6).
- **Hash-keyed cross-origin model byte cache.** Now exists as COS (https://github.com/WICG/cross-origin-storage); only the *capability/arbiter* layer remains (C2).
- **1-bit/progressive weight compression, P2P weight distribution, in-browser LoRA training.** Each exists at least as a working artifact (https://huggingface.co/blog/transformersjs-v3, https://github.com/enapt/SwarmLLM, https://github.com/virgilvox/lora-lab).
- **Reproducible-builds/provenance for artifacts.** SLSA + Nix cover it (https://slsa.dev/spec/v1.1/levels, https://reproducible.nixos.org/); only the test-verdict variant (C5) is unaddressed.

## 5. Single highest-ceiling candidate, and the honest reason it may fail
**MCL (C2)** — a browser-level runnable model endpoint has the largest ceiling: it is the only candidate
that creates a new *platform primitive* with network effects (every site reuses every model; every runtime
negotiates instead of re-implementing), and it is buildable today as a polyfill on WebGPU + COS.

**Honest failure mode.** Models are just bytes plus a runtime contract that vendors do not agree on, and
the browser security model actively resists the feature: COS deliberately *hides* cache presence for
privacy, WebNN grants NPU access only under Origin Trials (https://www.w3.org/TR/webnn), and built-in AI
is a single vendor's single model (https://developer.chrome.com/docs/ai/built-in). So MCL may collapse
into "a nicer transformers.js Model Registry" — a library, not a category — because the load-bearing
pieces (a standard manifest, a provider arbiter, and cross-origin session policy) require browser vendors
to cede control they currently hold. If that happens, the fallback is C1 (VerifyGraph), which is fully
within our control and benchmarkable on this repo in an afternoon.
