# Wave 48 — Prior-Art Attack: SYNCBRIDGE (language-agnostic synchronous host over async web APIs, JSPI + WASI 0.3)

Date: 2026-09-19. Adversarial prior-art review. Read `wave-48-candidates-browser.md` §C3 first.
One file only; no repo code; no git. Method: **40+ web queries** (log §9), GitHub REST metadata
(`api.github.com/repos/*`), primary specs/blogs, and repo READMEs/doc pages fetched directly. Every
claim below carries a URL and a date. Search-provider gaps/uncertainties are flagged inline.

---

## 1. Verdict: KILL

SyncBridge's load-bearing claim — *"no language-agnostic blocking host over async web APIs exists;
prior art is per-runtime"* — is **false**, and the candidate's own existence check is factually wrong
about the one project it cites. There is already a **language-agnostic, capability-scoped, browser
host that makes blocking WASI calls over JSPI**: `pavelsavara/jsco` (browser polyfill for WASM/WASI
components, 19★, created **2023-09-07**, last push **2026-06-11**, https://github.com/pavelsavara/jsco).
Its README: *"browser polyfill for running WASM/WASI components … [JCO] too large to use as dynamic
host."* Its `jspi.md` is titled *"synchronous calls to JS APIs which are blocking, like I/O"* and lists
precisely the candidate's clauses: `wasi:io/streams` `blocking-read`/`blocking-write-and-flush`,
`wasi:clocks` `subscribe-duration`, `wasi:io/poll`, `wasi:http/outgoing-handler` "awaiting fetch
response"; exports wrapped in `WebAssembly.promising()`; `--no-jspi` to opt out. It auto-detects
**WASI p2 and p3** components and runs them in the browser. That is clause (a)+(b)+(d) shipped, not
planned.

The candidate's dismissal of `tegmentum/wasi-polyfill` ("3★, explicitly *async-native*, not a blocking
facade") is **contradicted by that project's README**: it exposes a `browser` host-import suite (fetch,
WebGPU, OPFS/IndexedDB filesystem, DOM) **and** a JSPI path — `jcoOptions.asyncMode: 'jspi'`,
`asyncImports: ['wasi:io/poll@0.2.0#[method]pollable.block']` — explicitly *"to actually block the
guest"* (`WasiInputStreamWrapper.blockingRead` suspends until data lands), under a capability policy
(`createSafePolicy`/`createCliPolicy`, deny-by-default). Created **2025-10-25**, last push
**2026-08-02**, https://github.com/tegmentum/wasi-polyfill. So both cited "doesn't exist" projects do
exactly the thing.

**Unmatched clause:** none that is load-bearing. The narrowest surviving sliver is **(c)**, restated as
*"a stable, WASI-0.3-native (async func / stream / future) browser sync host"*. It is non-load-bearing
for three reasons: (i) jsco already auto-runs P2/P3 components in-browser and its own `jspi.md` says
WASI 0.3 *"eliminates JSPI"* on the host side; (ii) the only WASI-0.3 shim that is release-grade,
`jco`'s `preview3-shim`, targets **Node.js only** and jco explicitly calls browser WASI support
"experimental" (https://github.com/bytecodealliance/jco, https://wasi.dev/languages); (iii) WASI 0.3's
native async removes the very per-call JSPI trampoline the candidate is selling. The candidate also
omits the strongest same-domain art entirely: `wasm-bindgen/examples/jspi-opfs` (plain non-async Rust
calling the fully-Promise OPFS API, https://wasm-bindgen.github.io/wasm-bindgen/examples/jspi-opfs.html)
and `bodar/wasiglk` (JSPI + `browser_wasi_shim` + OPFS + async stdin for C interactive-fiction
interpreters, https://github.com/bodar/wasiglk).

**Fallback (GO-WEAK, if the wave insists on salvaging):** do **not** build a generic host; build
**SYNCCONFORM** — a cross-runtime conformance + deadlock/re-entrancy safety harness for JSPI sync hosts
(§8). The host layer is commoditized; the *certification* layer is not.

---

## 2. Closest work (hostile table)

| Work | Date / stars | URL | What it does | Clauses not done |
|---|---|---|---|---|
| **jsco** (Pavel Savara) | 2023-09-07; 19★; push 2026-06-11 | https://github.com/pavelsavara/jsco | Browser polyfill running **WASIp1/p2/p3** components; JSPI wrapping of exports; blocking `wasi:io`/`clocks`/`poll`/`http` imports over async web APIs; capability whitelist (`enabledInterfaces`); size-tuned vs jco | Stable API; popular adoption; one-maintainer "preview quality" |
| **tegmentum/wasi-polyfill** | 2025-10-25; 3★; push 2026-08-02 | https://github.com/tegmentum/wasi-polyfill | Multi-version WASI polyfill (p1/p2/p3) + browser Web API host imports (fetch, WebGPU, OPFS, DOM, WebSocket); **JSPI asyncMode blocking imports** (`pollable.block`, http, sockets); capability policies | Release-grade P3 binary ABI; adoption |
| **Emscripten `-sJSPI` + WasmFS OPFS** | OPFS async-ctor commit 2023-10-06; current | https://emscripten.org/docs/porting/asyncify.html · https://github.com/emscripten-core/emscripten/blob/main/test/wasmfs/wasmfs_opfs.c | Generic synchronous C/C++ over async JS: `-sASYNCIFY` **or** `-sJSPI` same code; `EM_ASYNC_JS`, `emscripten_sleep`, Embind `async()`; WasmFS OPFS backend tested under JSPI; sandboxed FS | Non-C-family languages; a *separate* host ABI |
| **Pyodide `run_sync` / `open_url`** | run_sync 0.27.7; 0.28 2025-07-04 | https://blog.pyodide.org/posts/jspi · https://pyodide.org/en/stable/usage/api/python-api/http.html | `run_sync()` suspends a synchronous Python frame on an awaitable via JSPI (fetch, urllib, `input()`); `open_url`/`pyxhr` do *synchronous* fetch; JSPI on by default (`enableRunUntilComplete`) | Non-Python; capability model |
| **wasm-bindgen `jspi-opfs`** | example in repo | https://github.com/wasm-bindgen/wasm-bindgen/tree/main/examples/jspi-opfs | Plain (non-`async`) Rust calling the fully Promise OPFS API through JSPI | Generic host; other runtimes |
| **wasiglk** | repo, JSPI-era | https://github.com/bodar/wasiglk | JSPI + `browser_wasi_shim` + OPFS pluggable storage + JSPI async stdin; C IF interpreters in a Worker; no Asyncify transform | HTTP/WebGPU; general-purpose claim |
| **wa-sqlite** (rhashimoto) | 2021-04-20; 1415★; push 2026-09-06 | https://github.com/rhashimoto/wa-sqlite | Sync **and** async (Asyncify **and JSPI**) SQLite builds; `OPFSCoopSyncVFS`/`AccessHandlePoolVFS` = fully synchronous OPFS VFS; demo `?build=jspi` | Not a generic host; SQLite-specific |
| **jco + preview2/3-shim** | 0.23.0 p2-shim 2026-08-24; p3-shim 0.5.0 2026-08-23 | https://github.com/bytecodealliance/jco | Transpiles components to ES modules; WASI p2 browsers (experimental), p3 shim **Node only**; `asyncMode: jspi` lowering in jco | Browser P3; blocking facade |
| **JSPI itself** | Stage 4 2025-04-08; Chrome 137 2025-05-27 | https://v8.dev/blog/jspi · https://github.com/WebAssembly/js-promise-integration | `WebAssembly.Suspending` + `promising`: suspend a Wasm stack on a JS Promise; the *standard* mechanism for sync-over-async | It is the substrate, not the product |
| **Asyncify / Binaryen** | Emscripten, pre-2024 | https://web.dev/articles/asyncify · https://github.com/GoogleChromeLabs/asyncify | Compile-time suspend/resume; `asyncify-wasm` for arbitrary modules; ~50% size + link-time cost, not JSPI | VM stack switching (superseded by JSPI) |
| **WASI 0.3 + Wasmtime** | 2026-06-11 | https://wasi.dev/releases/wasi-p3 | Native `async func`/`stream<T>`/`future<T>` in the Canonical ABI; host owns the event loop; Wasmtime 46 default | Browser-native; stable JS toolchain |
| **SAB + `Atomics.wait`** | SAB gated since Chrome 92, 2021 | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics/wait | Worker-side true blocking; the *other* sync trick — needs COOP/COEP, main thread can't block | Deadlock-prone; needs cross-origin isolation |
| **Sync XHR in workers** | deprecated (Chrome 88, 2021) | https://developer.chrome.com/blog/getting-rid-of-synchronous-xhrs | Legacy blocking fetch in workers; Emscripten loaded MEMFS files this way | Removed/discouraged; main thread banned |
| **php-wasm-async** | 2026-06-02; 0★ | https://github.com/Sudo-WP/php-wasm-async | PHP calling host async fns, suspend/resume; "primitive itself is not yet proven" | Pre-production; PHP-only |
| **lua2wasm** | 2026-05-17; 6★ | https://github.com/rhmoller/lua2wasm | Lua→Wasm AOT; "Falls back to EOF / soft I/O failure when the host lacks JSPI" | Playground, not a host |

---

## 3. Clause-by-clause

**(a) Language-agnostic generic host — KNOWN/OCCUPIED (fatal).** jsco runs any WASI component
(Rust/C#/Python/… compiled to a component) with one JS host and JSPI wrapping; wasi-polyfill is
built around component-model plugins and a capability policy. The candidate's claim that existent art
is "per-runtime (Emscripten JSPI, php-wasm-async, wasi-polyfill)" is exactly backwards — wasi-polyfill
*is* the generic host it claims is missing, and jsco is omitted. Emscripten is itself partly
language-agnostic (any LLVM front end: Rust via `wasm32-unknown-emscripten`, C/C++).

**(b) Synchronous semantics over async APIs — KNOWN/OCCUPIED (fatal).** This is the literal definition
of JSPI ("bridges the gap between synchronous applications and asynchronous Web APIs",
https://github.com/WebAssembly/js-promise-integration, Phase 4 2025-04). Shipped: Pyodide `run_sync`,
Emscripten `-sJSPI`/`EM_ASYNC_JS`, wasm-bindgen jspi-opfs, wasiglk. Nothing language-agnostic-specific
remains.

**(c) JSPI / WASI-0.3 based — PARTIAL; the only unmatched sliver, and non-load-bearing.** A stable,
final-WASI-0.3-native *browser* sync host is not shipped (jco p3-shim is Node-only; jsco's P3 is
preview). But jsco already consumes p2/p3 components in-browser, and WASI 0.3's purpose is to make the
host side async-native, i.e. to *remove* per-call JSPI: jsco `jspi.md` — *"On the host side, this
eliminates JSPI … guest components compiled from languages with synchronous calling conventions still
need … JSPI."* So the sliver consists only of guests that are sync-by-convention, which is the
pre-existing JSPI case, not a new host capability.

**(d) Browser deployability — KNOWN/OCCUPIED.** jsco has a live browser demo and a Worker design;
wasi-polyfill ships a Vite plugin and browser host imports; wa-sqlite's JSPI build and Emscripten OPFS
run in Chrome today. Mainstream support: JSPI Chrome 137 (2025-05-27, default), Firefox 139
(2025-05-27) **experimental behind `javascript.options.wasm_js_promise_integration`** and intended
default-on ~Firefox 153 (https://v8.dev/blog/jspi, https://blog.openreplay.com/jspi-javascript-wasm-bridge),
Safari added JSPI in **Safari Technology Preview 238 (2026-02-26)** and Interop 2026 adopted "JSPI for
WASM" on **2026-02-12** (https://webkit.org/blog/17848/... , https://webkit.org/blog/17818/...,
https://github.com/web-platform-tests/interop/issues/1093). The candidate's **Baseline Newly
2026-09-14** is broadly consistent, but "JSPI is only days old" understates Chrome's **~16-month**
lead (Chrome 137 → 2026-09).

---

## 4. What exactly is new vs Asyncify and vs plain JSPI?

Nothing at the mechanism layer. **vs Asyncify/Binaryen:** JSPI is a VM feature — zero Wasm rewrite,
zero code-size overhead, no whole-program call-graph instrumentation (~50% size/link cost for Asyncify:
https://github.com/emscripten-core/emscripten/issues/26455; https://web.dev/articles/asyncify). That
is a JSPI property, fully available since Chrome 137, not a SyncBridge invention. Historical caveat
that still bites a generic host: JSPI was **2+ orders of magnitude slower** than Asyncify when
*JS→Wasm async* calls dominate (Chromium 41491351, 2024-01-14; emscripten #21081) — a real risk for a
host that routes every blocking call through an outer `promising` export. **vs plain JSPI:** the only
delta is packaging a ready-made `host.fetchSync`/`fsReadSync` import set. That packaging exists:
jsco, wasi-polyfill, Emscripten `EM_ASYNC_JS`, Pyodide `run_sync`.

---

## 5. Strongest hostile argument and its survival

**Argument:** *"Asyncify already lets synchronous C/C++ call async web APIs, and `pyodide.run_sync`
already lets synchronous Python call async JS; the host is a thin, solved API — one `WebAssembly.Suspending`
wrapper per function. There is no research contribution here, only glue."*
**Survival:** it does not survive; it **wins**. The generic-glue claim is already instantiated twice
(jsco, wasi-polyfill), and the candidate's own novelty sentence ("compile a blocking program … with a
generic shim rather than per-language rewrites") is satisfied by WASI + component model + JSPI alone.
The only rebuttal left — "those are experimental/preview" — is an adoption argument, not a novelty
argument, and the candidate doc itself grades its cited priors as "narrow and experimental," which is
the same status it would occupy. A second hostile angle also lands: JSPI's fixed ~1 MiB suspender
stacks make "millions of blocked calls" impossible until growable stacks land (V8 jspi-newapi
2024-06-04; Mozilla Debugger UAF on a freed ~1 MiB JSPI stack, Bugzilla 2029302, 2026-04-01), so a
"language-agnostic sync host" inherits known scalability and safety hazards it does not solve.

---

## 6. Blocking-in-browser constraints (and whether they are already solved)

- **Main-thread blocking:** JSPI never blocks the JS thread — it parks the Wasm stack and returns a
  Promise; the event loop runs. Solved by JSPI, not by SyncBridge. (True blocking needs SAB +
  `Atomics.wait`, main-thread-banned — https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics/wait.)
- **COOP/COEP:** required for `SharedArrayBuffer`, **not for JSPI**. The candidate implies a
  COOP/COEP burden; that belongs to the SAB/`Atomics` route (Chrome 92, 2021,
  https://web.dev/articles/coop-coep). Roughly neutral for the candidate, and already neutral for JSPI.
- **Deadlock / re-entrancy:** unsolved in the general case and already documented: `futures::join!`
  inside a single JSPI context deadlocks when one arm awaits a sync-lowered host import
  (`bytecodealliance/wit-bindgen#1609`, 2026-04-30): *"JSPI does not 'park the instance' — it suspends a
  single execution context … suspending it freezes every Rust task."* Nested suspend and re-entrant
  imports that call back into the same `promising` export are known sharp edges (Emscripten #22493,
  2024-09-03).
- **Stack limits / GC:** fixed ~1 MiB stacks; growable stacks were announced but not shipped (V8
  jspi-newapi 2024-06-04). Pyodide has crashed with JSPI enabled (pyodide#5702 2025-06-16;
  STATUS_ACCESS_VIOLATION pyodide#6106 2026-02-15); V8 JSPI stack-switching has had sandbox-bypass
  reports (Chromium 496704202, 2026-03; 492418001, 2026-03). A generic host multiplies exposure.
- **Browser support:** Chrome 137 default; Firefox experimental (139) → default intended 153; Safari
  TP 238 (2026-02-26) + Interop 2026. So "days-old Baseline" is wrong for Chrome and overstates the
  wait for the others.

**Use cases are already solved:** sync fetch (Pyodide `run_sync`/`open_url`/`pyxhr`,
https://pyodide.org/en/stable/usage/api/python-api/http.html); sync OPFS (wa-sqlite sync VFS,
Emscripten WasmFS OPFS, wasm-bindgen jspi-opfs); sync WebGPU (Emdawnwebgpu/Dawn `webgpu.h` +
Emscripten async modes, https://emscripten.org/docs/porting/multimedia_and_graphics/WebGPU-support.html);
WASI sync tests (Emscripten `-sJSPI` test suite; wasi-polyfill harness).

---

## 7. Patents / standards

JSPI is a **W3C WebAssembly CG proposal at Phase 4** (standardized April 2025), folded into the Wasm
JS Interface spec (https://www.w3.org/TR/wasm-js-api-2/), under the W3C royalty-free patent policy. No
separate "synchronous host" standard or API proposal surfaced in the searches; the standard mechanism
is JSPI itself, and the language-agnostic packaging layer is intentionally unstandardized (WASI + the
Component Model). No blocking patent was found for "synchronous execution of WebAssembly across a
host Promise" in the reviewed searches — but absence here is search-derived, not a freedom-to-operate
opinion.

---

## 8. If GO: fallback only — exact Stage-1 experiment

Do not rebuild the host. **Claim to defend (one sentence):** *"A single conformance-and-safety harness
that certifies that independently built JSPI synchronous hosts (Emscripten, WASI/component-model,
raw `WebAssembly.Suspending`/`promising`) agree on blocking, re-entrancy and deadlock behaviour across
engines, and deterministically detects the cross-task deadlock class that freezes a whole JSPI
context."*

**Stage-1 experiment (1–2 days, no deps beyond a browser + Node):** one tiny guest (`toy.wat` or a
5-line C) that performs a blocking GET + OPFS read + `sleep`. Run it under **three** hosts:
(i) Emscripten `-sJSPI`, (ii) jsco or jco/p2-shim with `asyncMode: jspi`, (iii) hand-rolled
`WebAssembly.Suspending` import + `promising` export. Execute **four adversarial cases**: nested
suspend; re-entrant import that calls back into the same promising export; `join!`-style deadlock
(two host imports on one JSPI context, one of which must resolve from inside Wasm — `wit-bindgen#1609`);
and deep-stack growth. **Pass:** all three hosts return identical bytes and *none* hangs within a
5 s watchdog, on Chrome 152 stable and Node 25 (JSPI unflagged). **Fail:** any divergent
resume/deadlock result or fixed-stack `RuntimeError`. **Deliverable:** the harness + a compatibility
matrix, not a host. **Claim above is defensible** because no repo found publishes cross-host blocking
*semantics* conformance; jsco/wasi-polyfill each certify only their own host.

---

## 9. Query log (condensed; 40+ submissions)

JSPI spec status · JSPI baseline browser support · JSPI stack switching Chrome 126/137 · JSPI phase 4
Firefox 139/Safari 26 · Interop 2026 JSPI · WebKit Interop 2026 · Mozilla roadmap 2026 JSPI ·
Asyncify vs JSPI · Asyncify vs JSPI code size/performance · JSPI stack limit · JSPI COOP/COEP ·
synchronous XHR deprecation · SAB + `Atomics.wait` worker blocking · `Atomics.waitAsync` · Emscripten
WasmFS OPFS JSPI · Emscripten JSPI generic host · Emscripten WebGPU sync · Pyodide run_sync · Pyodide
0.28 release · Pyodide sync fetch/open_url/pyxhr · php-wasm-async · tegmentum wasi-polyfill · jsco
jco JSPI · jco preview3-shim browser WASI 0.3 · wa-sqlite OPFS sync/JSPI · wasm-bindgen jspi-opfs ·
wasiglk · lua2wasm JSPI · Lua wasm interpreter (fengari/wasmoon) · wasm3/wasmi blocking · Wasmer-JS
sync · Ruby wasm · Blazor WebAssembly JSPI · Deno/Bun JSPI · Node wasm JSPI · synchronous testing Wasm ·
"language-agnostic sync host" · patents JSPI/sync host · WASI 0.3 release · WASI 0.3 browser support ·
Component Model Concurrency/JSPI · wit-bindgen JSPI deadlock.

**Primary sources fetched:** jsco README + `jspi.md`; wasi-polyfill README; php-wasm-async README;
GitHub REST metadata for jsco / wasi-polyfill / php-wasm-async / wa-sqlite / lua2wasm; MDN
`WebAssembly.Suspending`; webassembly.org Feature Status; WASI 0.3 release page.
