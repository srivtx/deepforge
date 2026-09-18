# Wave 48 — Browser candidates: enabling conditions 2024–2026 and what is now possible but unbuilt

Date: 2026-09-19. Scope: **survey only.** One file written
(`docs/research/wave-48-candidates-browser.md`); no repo code touched; no git.

**Method (honest).** The brief's `websearch` provider returned `HTTP 429` on **20/20** batch queries
(all 20 in two batches; zero successes). Fallback: **direct fetches** — ~24 canonical pages pulled with
`curl`/`webfetch` (W3C specs, MDN, Chrome docs, GitHub release/README) plus the **`webstatus.dev` v1
API** and the **GitHub search/repos API**. Total lookups > 55. Every factual line carries a URL;
baseline dates marked `(webstatus)` are the `low_date` returned by
`https://api.webstatus.dev/v1/features?q=…` on 2026-09-19. Where a thing is behind a flag or in one
browser only I say so and do **not** call it Baseline. I do not treat absence-of-search-result as proof
of absence; "unbuilt" below means *I searched GitHub + web for it and found only a 0–4★ or unrelated
prior, listed explicitly*.

**Method (this wave's shape).** Not "what does the literature lack." I enumerate **enabling conditions**
that landed ~2024–2026 and *changed what a purely client-side app can do*, state the **old limit each
removed**, then derive capabilities that are newly possible but unbuilt, then rank. New categories open
when new capabilities arrive.

**Repo facts (read-only).** `deepforge` = Next.js 16.1.3 / React 19 / TS 5 / Tailwind 4; problem bank
**5,730** executed through `scripts/verify-problems.ts` → `scripts/py_verify.py` (real CPython);
browser execution is **Pyodide**; the site "lazy-loads assets already," has no required account, and
stores progress locally (`README.md`, read 2026-09-19). Every architecture below keeps **zero new
server infrastructure**.

**Honesty contract.** Grade every candidate `NEW CATEGORY / BREAKTHROUGH 10x+ / PARTIAL GAP /
EXISTS(skip) / HARD(why)`. Adversarial to my own gaps: the closest prior is named and scored.

**Sibling wave-48 files (do not duplicate).** `wave-48-candidates-aiinfra.md` already covers on-device
model brokers (AICAPS) and agent sandboxes (CELLWALL); `wave-48-candidates-devdata.md` covers WASM
component verification kernels and DuckDB-WASM lakes. This file stays on **browser-platform** primitives.

---

## 1. Enabling conditions (shipped/baseline date · OLD limit removed · NEW capability · unbuilt delta)

**A. Compute**
1. **WebGPU across major browsers** — announced 2025-11-25 (https://web.dev/blog/webgpu-supported-major-browsers;
   webstatus still returns `limited`, i.e. Linux/Intel-Mac/Android gaps remain). Removed: WebGL's
   compute absence. New: general GPU compute, render bundles (~10× per Babylon claim), in-browser ML.
   Unbuilt: **cross-vendor bit-reproducible compute** (C2); WebGPU in Shared/ServiceWorker is still
   "not implemented in any browser" (https://github.com/mozilla/standards-positions/issues/971).
2. **WebNN** — Candidate Recommendation Draft **2026-09-10** (https://www.w3.org/TR/webnn/); Chrome
   Origin Trial 147–149, **flag/OT only**, webstatus `limited`. Removed: no web access to NPUs.
   New: hardware-agnostic NPU inference, `MLTensor`/`exportToGPU`, third wave of transformer ops.
   Unbuilt: the device-selection/buffer-sharing path is unshipped; only broker-layer ideas exist
   (aiinfra AICAPS).
3. **Chrome built-in AI / Prompt API (Gemini Nano)** — docs published 2025-05-20, updated
   **2026-08-26**; Chrome 138+, sampling origin trial on Chrome 148
   (https://developer.chrome.com/docs/ai/prompt-api; webstatus `limited`). Removed: server-only LLM.
   New: `LanguageModel` sessions, structured output, multimodal input, on-device. Hard requirements:
   22 GB free, >4 GB VRAM or 16 GB RAM, **not available in Web Workers**, desktop-only. Unbuilt:
   no cross-origin model/session contract (wave-46 C2 MCL already proposed it — skip).
4. **WASM garbage collection** — **Baseline Newly 2024-12-11** (webstatus; Chrome 119, 2023-10-31,
   https://developer.chrome.com/blog/wasmgc). Removed: no structs/arrays/references in linear memory;
   Java/Kotlin/Dart needed per-language GC ports. New: managed-language modules run natively.
5. **WASM tail calls** — V8 v11.2 / Chrome 112, **2023-04-06** (https://v8.dev/blog/wasm-tail-call).
   Removed: unbounded stack growth for functional/continuation code.
6. **WASM threads + atomics** — **Baseline Widely 2021-12-13**, stable 2024-06-13 (webstatus);
   requires COOP/COEP + `crossOriginIsolated`. Removed: single-threaded WASM. New: shared-memory
   parallelism (pre-dates window but is the substrate for C4).
7. **SharedArrayBuffer / Atomics** — **Baseline Widely 2021-12-13**, stable 2024-06-13; **Resizable
   buffers Baseline Newly 2024-07-09**; **`Atomics.waitAsync()` Baseline Newly 2025-11-11** (webstatus).
   Removed: main-thread `Atomics.wait` blocking; now async waiting is standard.
8. **JSPI (JavaScript Promise Integration)** — V8 blog **2024-07-01** (https://v8.dev/blog/jspi);
   **Baseline Newly 2026-09-14** (webstatus), i.e. only days old. Removed: WASM could not suspend on a
   JS Promise; code needed Asyncify/Emterpreter rewrites. New: synchronous WASM can `await` web APIs.
   Unbuilt: a **language-agnostic synchronous host over async web APIs** (C3); prior art is per-runtime
   (Emscripten JSPI, `Sudo-WP/php-wasm-async`, 0★).
9. **WASI 0.3.0** — ratified **2026-06-11** (https://github.com/WebAssembly/WASI/releases/tag/v0.3.0);
   **0.3.1** 2026-08-11 adds `map<K,V>` + `implements` to the component model. Removed: pollable/
   start-finish async acrobatics. New: native `future<T>`/`stream<u8>`, service chaining "ms→ns."
   Unbuilt: a **browser-native sync + capability host** (C3); `tegmentum/wasi-polyfill` exists but is
   explicitly *async-native*, not a blocking facade.

**B. Storage**
10. **Origin Private File System (OPFS)** — **Baseline Widely 2023-03-27** (webstatus; MDN synced
    2025-07-14). Removed: IndexedDB-only, no byte-level files. New: sync access handles in workers,
    in-place writes. Unbuilt: policy/durability layer (C5) — SQLite-WASM/OPFS tools exist.
11. **Storage Buckets** — shipped Chrome 122 (2024), docs
    https://developer.chrome.com/blog/storage-buckets; webstatus `limited`. Removed: one undifferentiated
    origin bucket with one eviction fate. New: named buckets with `durability: strict` and per-bucket
    eviction. Unbuilt: a **declarative multi-bucket data fabric** (C5); no standard manager exists.
12. **File System Access + File System Observer** — observer origin trial **Chrome 129 (2024-09-11) to
    Chrome 134 (2025-02-26)** (https://developer.chrome.com/blog/file-system-observer); File System
    Access webstatus `limited`, observer MDN `experimental`. Removed: no live change events for a
    user-granted folder. New: automatic invalidation of folder-backed indexes. Unbuilt: folder↔OPFS
    mirroring with conflict policy (C5).
13. **Compression Streams** — **Baseline Widely 2023-05-09** (webstatus). Removed: no built-in gzip/deflate
    in JS. New: stream compress/decompress with zero deps.

**C. Networking**
14. **WebTransport** — **Baseline Newly 2026-03-24** (webstatus; MDN "since March 2026"). Removed:
    WebSocket's head-of-line blocking and no unreliable mode. New: multiple streams, unidirectional
    streams, **UDP-like datagrams**, works in Web Workers. Unbuilt: browser-native unreliable state-sync
    patterns (only server-oriented libs exist); pair with C1.
15. **WebRTC encoded transform (Insertable Streams)** — **Baseline Newly 2025-10-03** (webstatus).
    Removed: opaque codec pipeline. New: per-frame access + E2EE without a trusted SFU.
16. **WebRTC data channels / WebRTC** — Baseline Widely 2020-01-15 (webstatus).
17. **Local Network Access** — permission prompt documented **2025-06-09**
    (https://developer.chrome.com/blog/local-network-access); webstatus `limited`. Removed: silent
    private-network access. New: explicit consent for LAN fetches (mostly a constraint, not a capability).
18. **Direct Sockets** — Isolated Web App only, **not Baseline** (https://developer.chrome.com/docs/isolated/).
    Old limit: no TCP/UDP in the browser at all. New: raw TCP/UDP *for signed, installed IWAs only*.
    Behind a platform gate — say so; not a general capability.

**D. Identity / security**
19. **WebAuthn / passkeys** — **Baseline Widely 2021-09-07**; "easy public key access" (conditional UI /
    related origins) **2023-10-24** (webstatus). New: device-bound keys via biometric/PIN. Unbuilt:
    a **generic offline-verifiable claim envelope** (C5b/C6) — WebAuthn is auth-shaped.
20. **Digital Credentials / mDL** — webstatus `limited` (Chrome only, partial).
21. **FedCM** — webstatus `limited`; **Partitioned cookies (CHIPS)** `limited`; **Contact Picker**
    `limited`; **Web Share targets** `limited`; **Background Sync / Periodic Sync** `limited`;
    **WebXR** `limited`; **Payment Request** `limited`; **Speculation Rules** `limited`.
22. **Trusted Types** — **Baseline Newly 2026-02-24** (webstatus). Removed: DOM XSS by construction.
    New: typed sinks for all HTML injection. Unbuilt: a **model-output sealing primitive** (C4b).
23. **COOP/COEP / `crossOriginIsolated`** — posture unchanged but now load-bearing for threads/SAB;
    `Cross-Origin-Embedder-Policy: credentialless` enables isolation without all third parties opting in.

**E. Media / UI**
24. **WebCodecs** — MDN "available" in dedicated workers, webstatus `limited`
    (https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API). Removed: no per-frame codec
    access. New: frame-level decode/encode + Mediabunny mux/demux. Firefox/Safari still gap.
25. **Screen Wake Lock** — **Baseline Newly 2025-03-31** (webstatus). New: prevent sleep from a page.
26. **SharedWorker** — **Baseline Newly 2026-05-05**; **Notifications via SW, Push messages** Widely
    2023-03-27 (webstatus). New: cross-tab shared runtime context (substrate for C4).

---

## 2. Now-possible-but-unbuilt, existence-checked (skip list)

- **WebGPU cross-vendor reproducible kernels** — searched "reproducible webgpu", "deterministic gpu
  compute": total 20 + 16 repos, none is a determinism library (top hits: `tinySarf` morphological
  inference, CVE labs, shader-UIs). No conformance harness. **Unbuilt → C2.**
- **Cross-origin WebMCP tool federation** — WebMCP itself: `webmachinelearning/webmcp` 4,095★
  (pushed 2026-09-17), `beaufortfrancois/model-context-tool-inspector` 123★, `Joakim-Sael/webmcp-extension`
  21★ (server-side "webmcp-hub" configs). No origin-to-origin tool bus. **Unbuilt → C1.**
- **Generic synchronous host over async web APIs** — prior: Emscripten JSPI (in-toolchain),
  `Sudo-WP/php-wasm-async` 0★ (PHP-only, pre-production), `tegmentum/wasi-polyfill` 3★ (async-native).
  No language-agnostic blocking facade. **Unbuilt → C3.**
- **Cross-tab shared-memory actor bus** — no standard primitive found; SharedWorker only became
  Baseline 2026-05-05 and `Atomics.waitAsync` 2025-11-11. Libraries (Comlink, partytown) are
  DOM-oriented. **Unbuilt → C4.**
- **Device-keyed, offline-verifiable result credentials** — prior: `Carbon16/webauthn-sign` 0★
  (raw hash signing only); `fido2-client-simulator` 1★. No envelope, trust bootstrap, revocation, or
  Digital-Credentials integration. **Unbuilt → C5.**
- **Sealed rendering of model/tool output** — no framework combines Trusted Types (Baseline 2026-02-24)
  + `credentialless` iframes + structured-output schemas. **Unbuilt → C6.**
- **EXISTS(skip):** on-device AI agent extension (`nico-martin/gemma4-browser-extension` 1,155★),
  on-device browser automation (`RunanywhereAI/on-device-browser-agent` 303★), browser WASM plugin
  runtime (`reearth/zushi` 4★), Extism JS SDK in browsers (`extism/js-sdk` 137★), jco component
  transpile (`bytecodealliance/jco`). Do not re-propose these.
- **Adjacent to prior waves (do not re-propose):** model endpoint / KV cache (wave-46 C2/C4),
  CRDT interop / verifiable distribution (wave-47 C1/C2), on-device model broker + agent sandbox
  (wave-48 aiinfra C4/C5), WASM-component verification kernels + browser lakehouse (wave-48 devdata C2/C3).

---

## 3. Candidates (ranked: newly-possible × impact × feasibility)

### C1 — TOOLMESH: cross-origin, consent-gated federation of WebMCP tools
1. **New capability.** Any origin can publish typed tools; a user's local agent discovers and composes
   tools *across origins* under explicit, per-call consent, with no server in the loop.
2. **Enabler + removed limit.** WebMCP in Chrome 149 Origin Trial (docs published **2026-05-18**,
   https://developer.chrome.com/docs/ai/webmcp) + Prompt API (Chrome 138+, 2025-05-20). Removed:
   agents had to screen-scrape the DOM; tools were page-local. **Status: OT/flag in one browser —
   not Baseline.**
3. **Existence check.** Exists: WebMCP spec repo (`webmachinelearning/webmcp`), model-context-tool
   inspector, `webmcp-hub` config extension. Does **not** exist: a portable wire format for tool
   descriptors, cross-origin discovery, or a consent/capability envelope. Load-bearing because
   without it every agent integration is per-site glue.
4. **Unblocked now / network effect.** Sites that publish tools become addressable by every local
   agent; agents that implement the envelope reach every site. Classic two-sided network.
5. **Architecture.** Page A registers `navigator.modelContext` tools → a same-origin **service worker**
   signs the tool set with a passkey (`navigator.credentials.get`) → a local **OPFS** registry stores
   descriptors + user consent grants. Page B's agent requests `plan(tools)`, call routed via
   `postMessage`/BroadcastChannel; each invocation requires a live user gesture. Budget: descriptors
   KB-scale in OPFS; no model bytes. Privacy: no server sees the plan; consent grants are local and
   revocable; cross-origin calls never expose page DOM.
6. **Stage-1 milestone (small team, no server).** A polyfill over `postMessage` + BroadcastChannel +
   a scripted (or Prompt-API) planner; two static origins on `localhost`; consent UI. Zero deps.
7. **Decisive experiment (minutes, CPU-only).** Two static pages register 3 tools; a scripted agent
   crosses origins to complete a 3-step task. **Pass:** task completes with one consent per mutating
   call, no server, and a forged tool descriptor is rejected. **Fail:** any call succeeds without
   gesture, or discovery requires a central registry.
8. **Risks.** WebMCP flag removal/reshape; Prompt API desktop-only; permission-policy `tools` gating;
   cross-origin abuse of consent fatigue.
9. **Grade: NEW CATEGORY** (as a protocol) / **HARD** until WebMCP leaves OT.

### C2 — REPROGPU: cross-vendor bit-reproducible WebGPU kernels + conformance harness
1. **New capability.** A small kernel set (matmul, softmax, reductions) whose output bytes are
   identical on Chrome/Firefox/Safari GPUs and on software adapters, so browser GPU results can be
   independently re-run and hash-compared.
2. **Enabler + removed limit.** WebGPU baseline 2025-11-25 (URL §1.1). Removed: WebGL had no compute
   and no cross-vendor determinism story; ML kernels inherit vendor FP/scheduling differences.
3. **Existence check.** Searched "reproducible webgpu" (20 repos) and "deterministic gpu compute"
   (16): none is a reproducibility library or conformance suite; none publishes cross-adapter hashes.
   Adjacent (CPU-only): Intel ReproBLAS/pyReproBLAS. Load-bearing: verifiable browser compute,
   grading, and scientific repro all need it.
4. **Unblocked now / network effect.** Any app that must *prove* a GPU result can now compare hashes;
   a shared harness becomes the reference everyone points at (reproducible-builds for GPU).
5. **Architecture.** WGSL kernels with pinned reduction trees, no implicit FMA contraction, integer
   accumulation where exactness matters; `GPUCommandEncoder` → readback → SHA-256 (`crypto.subtle`);
   manifest records adapter/vendor/driver + WGSL hash. Budgets: kernels KBs; correctness > speed.
   Privacy: no input leaves the device; only result hashes are publishable.
6. **Stage-1 milestone.** 3 kernels + harness that runs headless Chrome, Firefox, Safari and a
   SwiftShader (CPU) adapter; emits a hash table. No new deps beyond a headless runner.
7. **Decisive experiment (minutes).** Same 256×256 matmul + 1M-element sum on ≥2 adapters (one may be
   SwiftShader CPU). **Pass:** SHA-256 identical across adapters/engines. **Fail:** any drift not
   explained by a documented adapter difference.
8. **Risks.** WebGPU spec explicitly leaves numerics implementation-defined; some ops may be
   irreconcilable → the honest outcome may be "integer-only subset." Vendor churn, adapter availability.
9. **Grade: NEW CATEGORY** if a reproducible subset exists; else **HARD** (documented subset only).

### C3 — SYNCBRIDGE: a language-agnostic synchronous host over async web APIs (JSPI + WASI 0.3)
1. **New capability.** Compile a blocking-style C/C++/Rust/Python program that calls `read()`,
   `fetch()`, `connect()`, `sleep()` synchronously and run it in-browser (or on a worker) with no
   Asyncify/Emterpreter rewrite and no server.
2. **Enabler + removed limit.** JSPI **Baseline Newly 2026-09-14** (webstatus; V8 blog 2024-07-01) +
   WASI 0.3.0 (2026-06-11) native async. Removed: WASM could not suspend on a JS Promise, so
   synchronous native code either blocked the thread or was rewritten.
3. **Existence check.** Exists: Emscripten JSPI, jco JSPI, `php-wasm-async` (PHP, 0★, "primitive not
   yet proven"), `tegmentum/wasi-polyfill` (async-native preview1/2/3, 3★). Does **not** exist: a
   capability-scoped, language-agnostic **sync** host (blocking `connect`/`sleep`/`spawn` over
   fetch/OPFS/WebSocket). Load-bearing: it is the difference between "port your app" and "recompile."
4. **Unblocked now / network effect.** Every existing synchronous library (databases, interpreters,
   network clients) becomes runnable in-browser; a shared host ABI means languages reuse one bridge.
5. **Architecture.** `jspi` import object exposing `host.fetchSync`, `host.fsReadSync` (OPFS sync
   access handle), `host.sleepSync`, all implemented as JSPI-suspending promises; component world
   grants capabilities explicitly (no ambient network/fs). Data flow: guest call → promise →
   `WebAssembly.Suspending` resumes guest → bytes return. Budgets: MB-scale; privacy: capability
   tokens bound to OPFS dirs, network off by default.
6. **Stage-1 milestone.** One C program using blocking read + a blocking HTTP GET, compiled with
   Emscripten JSPI, run in a worker, backed by OPFS + `fetch`. No server.
7. **Decisive experiment (minutes, CPU-only).** Unmodified blocking program reads a local file and a
   URL, prints both. **Pass:** correct bytes, guest suspended/resumed (observable), main thread free.
   **Fail:** deadlock, stack/GC failure, or wrong data.
8. **Risks.** JSPI is days-old Baseline; Safari/Firefox timing; suspending across component boundaries
   is new; Asyncify fallback may be faster on some paths.
9. **Grade: PARTIAL GAP → BREAKTHROUGH 10x+** if the host is generic; the per-language priors are
   narrow and experimental.

### C4 — CROSSTAB: shared-memory actor bus across tabs in one SharedWorker
1. **New capability.** Same-origin tabs share one synchronous, lock-free-ish actor runtime with a
   shared ring buffer; main threads never busy-wait and never rename a reload.
2. **Enabler + removed limit.** **SharedWorker Baseline Newly 2026-05-05**, **`Atomics.waitAsync`
   Baseline Newly 2025-11-11**, SAB Widely 2021-12-13 (webstatus). Removed: main-thread `Atomics.wait`
   blocked; cross-tab coordination relied on `postMessage` + `localStorage` polling.
3. **Existence check.** No standard cross-tab actor bus found; Comlink/partytown are DOM/postMessage
   oriented. OPFS cross-tab locking exists (`cross-tab-worker`, wave-46 C6) but not a shared-memory
   scheduler. Load-bearing: it makes one expensive WASM/Pyodide runtime serve many tabs.
4. **Unblocked now / network effect.** One heavy runtime per origin instead of per tab; frames/caches
   shared; measurable memory win on low-end devices.
5. **Architecture.** SharedWorker owns an SAB ring buffer + `WebAssembly.Memory`; tabs are producers/
   consumers using `Atomics.waitAsync` and sequence counters; Web Locks serialize init; worker
   survives tab reloads only if kept alive by a controller. Budgets: ring buffer KBs–MBs; runtime
   shared once. Privacy: same-origin only; no persistence by default.
6. **Stage-1 milestone.** One SharedWorker + 2 tabs + SAB ring; send/recv N messages. No deps.
7. **Decisive experiment (minutes, CPU-only).** 2 tabs exchange 10⁵ messages with one tab reloading
   mid-run. **Pass:** no lost/corrupt messages, zero busy-wait CPU, runtime instantiated once.
   **Fail:** data race, torn message, or SharedWorker unavailable in a target engine.
8. **Risks.** SharedWorker Baseline is weeks old; Safari differences; `Atomics.waitAsync` on main
   thread still not everywhere; COOP/COEP required for SAB.
9. **Grade: PARTIAL GAP** (substrate is fresh; primitive is new) / promising.

### C5 — DEVSIG: device-keyed, offline-verifiable result/action credentials
1. **New capability.** A purely client-side app mints a signed, offline-verifiable artifact that binds
   an outcome (a solved problem, a review decision, a receipt) to a device key, with no account server.
2. **Enabler + removed limit.** WebAuthn Widely 2021-09-07 + conditional UI 2023-10-24 (webstatus);
   Digital Credentials `limited`. Removed: web apps had no portable signing key; identity always meant
   a server account.
3. **Existence check.** Exists: `Carbon16/webauthn-sign` 0★ (signs an arbitrary hash; browser + Node
   verify). Does **not** exist: a credential envelope with issuer/claim schema, offline trust
   bootstrap, replay policy, or Digital-Credentials interop. Load-bearing: it is the missing
   "certificate" layer for serverless learning/attestation.
4. **Unblocked now / network effect.** Any static site can issue verifiable credentials; verifiers need
   only a public key; cross-app portability without an IdP.
5. **Architecture.** `sign(hash)` via `navigator.credentials.get({publicKey:{challenge:hash}})`; envelope
   = `{claim, hash, authenticatorData, clientDataJSON, signature, devicePubKey}`; verification is pure
   `crypto.subtle.verify` in a static page; trust via a published origin key + optional
   Digital-Credentials binding. Budgets: KBs. Privacy: only the claim + hash are shared; biometrics stay
   on-device.
6. **Stage-1 milestone.** Static signer page + static verifier page, one claim type ("solved <id>"),
   no backend. Zero deps.
7. **Decisive experiment (minutes, CPU-only).** Sign a claim on page A, verify on page B with the
   public key only, offline. **Pass:** valid signature verifies; a tampered claim fails; replay of a
   stale counter fails. **Fail:** verification needs a server or accepts tampering.
8. **Risks.** WebAuthn challenge semantics may not be intended as generic signing; RP-ID/origin binding
   limits portability; Digital Credentials is `limited`; user-device churn loses keys.
9. **Grade: PARTIAL GAP** (raw signing exists; the credential layer does not).

### C6 — SEALSINK: a Trusted-Types + credentialless-iframe sink for model/tool output
1. **New capability.** A reusable primitive that renders LLM/tool output (HTML/Markdown/SVG) into the
   page with type-enforced safety, sandboxed third-party widgets, and no `innerHTML` escape hatch.
2. **Enabler + removed limit.** **Trusted Types Baseline Newly 2026-02-24** (webstatus); COEP
   `credentialless` + iframe sandbox. Removed: arbitrary string→DOM injection was always a risk; there
   was no baseline type system to make it impossible.
3. **Existence check.** Sanitizers exist (DOMPurify), and Trusted Types libraries exist; no framework
   ties Trusted Types + credentialless iframes + JSON-schema-constrained model output into one
   composable sink. Load-bearing: prompt injection reaches the DOM through exactly this gap.
4. **Unblocked now / network effect.** Every AI app that renders model output could standardize on one
   sink; safer defaults propagate.
5. **Architecture.** Model output → JSON Schema (`responseConstraint`, Prompt API) → typed AST →
   allow-listed DOM via Trusted Types policy; untrusted widgets in `credentialless` iframes with
   `sandbox`; CSP `require-trusted-types-for 'script'`. Budgets: negligible. Privacy: no egress; no
   third-party cookies in credentialless frames.
6. **Stage-1 milestone.** One TS package + demo page: render model output in Markdown/SVG with a
   Trusted-Types policy. Zero deps.
7. **Decisive experiment (minutes, CPU-only).** Feed adversarial strings (`<img onerror>`, `javascript:`,
   SVG `onload`). **Pass:** zero script execution, no non-TT injection, widget isolated.
   **Fail:** any executable payload reaches the DOM.
8. **Risks.** Trusted Types Baseline is months old; Safari/Firefox policy differences; sanitizer
   bypasses via exotic namespaces.
9. **Grade: PARTIAL GAP** (parts exist; the composed primitive does not).

---

## 4. Bottom line

**Highest ceiling:** **C1 TOOLMESH** — if WebMCP leaves Origin Trial, a consent-gated cross-origin tool
federation is a genuine new platform primitive with two-sided network effects; today it is `HARD/flag`.
**Most buildable now with no flag:** **C2 REPROGPU** and **C3 SYNCBRIDGE** — both rest on features that
are Baseline (WebGPU 2025-11-25; JSPI 2026-09-14) and both can be tested in minutes on a CPU/software
adapter. **Best fit for this repo:** **C3** (Pyodide becomes a synchronous host, not just async) and
**C5 DEVSIG** (offline-verifiable proof a problem was solved, with no account server).

**Honest failure modes.** WebGPU numerics are spec-defined as implementation-defined, so C2 may only
cover an integer subset; JSPI is only days old, so C3 may be a Chrome-only demo for months; WebMCP is an
Origin Trial, so C1 could be reshaped or dropped; WebAuthn is auth-shaped, so C5 may need a standards
change. None of these blocks the Stage-1 experiments, all of which are zero-server, low-dependency, and
minutes long.
