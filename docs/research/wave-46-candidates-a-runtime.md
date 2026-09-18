# Wave 46 — Candidates A: In-Host Runtimes & Toolchains (Scientist survey)

Date: 2026-09-19. Scope: **survey only.** Exactly one file written
(`docs/research/wave-46-candidates-a-runtime.md`); no repo code touched; no git.
Method: **31 web searches** + direct fetches of load-bearing sources (Pyodide blog,
BrowserPod Rust post, `rubrc`, Miri #722, LLVM WASI RFC, `wasi-zigc`, web.dev Baseline).
Sources are cited with URLs and dates inline. Nothing below is asserted without a URL;
where a fact is not published I say "not published".

**Mission (verbatim).** Find a NEW TYPE OF THING: "a runtime like Pyodide but for Rust,
so it can run in the browser or somewhere else"; generalize to in-browser/in-host runtimes
and toolchains for languages that lack one, or a 10x/100x better runtime.

**Honesty contract.** First run the mandatory existence check. If the naive ask exists, say
so and hunt the real missing piece *next to it*. Grade every candidate
`NEW CATEGORY / BREAKTHROUGH 10x+ / PARTIAL GAP / EXISTS(skip) / HARD(why)`. "Partial"
still counts as existing unless the missing piece is load-bearing. Be brutally honest.

---

## 0. Verdict up front — the naive brief already half-exists

"A Pyodide for Rust" splits into two independent claims:

- **Run Rust output in the browser.** EXISTS (skip). AOT Rust → `wasm32-unknown-unknown`
  with `wasm-bindgen`/`wasm-pack` has been the standard path since ~2019
  ([MDN](https://developer.mozilla.org/en-US/docs/WebAssembly/Guides/Rust_to_Wasm)).
  Unmodified Rust programs now run client-side too: BrowserPod 3.0, 13 Aug 2026, with its own
  `wasm32-browserpod-linux-musl` target, runs `ripgrep`, `starship`, `jj-vcs` (200k SLOC) and
  `openai/codex` (1.25M SLOC) in a tab ([blog](https://labs.leaningtech.com/blog/browserpod-rust)).
- **Compile Rust in the browser.** PARTIAL — a real, single-author, pre-release exists:
  **`rubrc`** runs Wasm builds of `rustc`, **Cargo**, `clang` and `llvm` inside a browser
  worker, with an embedded `rust-analyzer` LSP
  ([repo](https://github.com/oligamiq/rubrc)). Its own README states: "external dependencies
  and procedural macros are currently unsupported", compile/cargo invocations are
  "serialized", and only `wasm32-wasip1` + `x86_64-unknown-linux-musl` link reliably.
  BrowserPod's authors know the gap: "In principle, we could allow users to compile their
  Rust programs directly in the browser... it will happen in the near future"
  ([BrowserPod Rust post](https://labs.leaningtech.com/blog/browserpod-rust), 13 Aug 2026).

So the load-bearing missing pieces are **not** "rustc.wasm exists?" (weak yes) but:
(a) the *distribution/package layer* around it, (b) a *fast path* that avoids shipping LLVM,
and (c) *portability* across browser and non-browser hosts. Candidates below target those.

---

## 1. Mandatory existence check (grouped, with URLs)

### 1.1 Dynamic languages — EXIST
- **Pyodide / CPython-wasm** — port of CPython to WASM/Emscripten; `micropip`; 314.0 shipped
  9 Jun 2026 and **PEP 783 (Emscripten packaging) was accepted**, letting anyone publish
  pyemscripten wheels to PyPI via cibuildwheel v4 ([blog](https://blog.pyodide.org/posts/314-release),
  [docs](https://pyodide.org/)). This is the strongest package-ecosystem precedent.
- **MicroPython wasm** — official webassembly port
  ([source](https://github.com/micropython/micropython/tree/master/ports/webassembly));
  `micropython-wasm` PyPI package runs a WASI build under Wasmtime server-side, 6 Jun 2026
  ([PyPI](https://pypi.org/project/micropython-wasm),
  [write-up](https://simonwillison.net/2026/Jun/6/micropython-in-a-sandbox/)).
- **Ruby** — `ruby.wasm` ([repo](https://github.com/ruby/ruby.wasm)); `ruby_wasm` gem 2.10.1,
  1 Aug 2026 ([RubyGems](https://rubygems.org/gems/ruby_wasm)).
- **PHP** — `seanmorris/php-wasm` (PHP 8.0–8.5 in browser/worker/Node,
  [repo](https://github.com/seanmorris/php-wasm)); Wasmer reports unmodified WordPress,
  Laravel, Symfony at the edge ([post](https://wasmer.io/posts/running-php-blazingly-fast-at-the-edge-with-wasm)).
- **Lua** — Fengari, a Lua 5.3 VM written in JS ES6, not a transpiler
  ([fengari](https://github.com/fengari-lua/fengari),
  [fengari-web](https://github.com/fengari-lua/fengari-web)).
- **Scheme/Lisp** — exists via wisp/other wasm Lisp runtimes (e.g. `mbrock/wisp` on the
  Wasmer registry); no flagship equivalent to Pyodide. Low strategic relevance here.

### 1.2 JVM / managed runtimes — EXIST / one true in-browser *compiler*
- **Doppio** — JVM in TypeScript, PLDI 2014 ([repo](https://github.com/plasma-umass/doppio)).
- **CheerpJ** — full OpenJDK runtime in WASM; Java 8/11/17-preview, JIT-to-JS; CheerpJ 4.3
  21 Apr 2026 ([cheerpj-core](https://cheerpj.com/cheerpj-core),
  [4.3 post](https://labs.leaningtech.com/blog/cheerpj-4.3)).
- **TeaVM** — AOT Java bytecode → JS/WASM-GC ([teavm.org](https://teavm.org/)).
- **`teavm-javac`** — **"An offline Java compiler that runs in the browser"**: OpenJDK `javac`
  + TeaVM compiled into one WASM module ([repo](https://github.com/konsoletyper/teavm-javac)).
  This is the direct precedent that a full *compiler* (not just a VM) can live in a tab, and
  the Java world did it before Rust.

### 1.3 Native / compiled languages to WASM — EXISTS (AOT)
- **C/C++/Fortran** — `wasi-sdk` ([repo](https://github.com/WebAssembly/wasi-sdk)); Clang/LLVM
  itself runs in-browser: `browsercc` ([repo](https://github.com/BertalanD/browsercc)) and
  Wasmer's Clang-in-browser (~100 MB download,
  [post](https://wasmer.io/posts/clang-in-browser)). LLVM-for-WASI RFC, 19 May 2024: Clang +
  LLD build and produce working binaries ([LLVM forums](https://discourse.llvm.org/t/rfc-building-llvm-for-webassembly/79073)).
- **Go** — TinyGo 0.41/0.42 (2026) targets `wasm`/`wasip1`
  ([TinyGo](https://tinygo.org/docs/guides/webassembly/wasm)); std Go via `wasm_exec.js`.
- **Zig** — **self-hosting to WASM**: `stage2_wasm` backend, `zig1.wasm` seed; `wasi-zigc`
  runs `zigc.wasm` in browser/Node ([repo](https://github.com/zig-wasm/wasi-zigc)); Zigtools
  Playground compiles in-browser ([playground](http://playground.zigtools.org/));
  evidence of no-LLVM self-hosting ([notes](https://github.com/dan-stowell/self-hosting-webassembly)).
  **Zig is the systems-language proof that a compiler backend can run in a tab.**
- **Swift** — official Swift SDK for WebAssembly + SwiftWasm
  ([guide](https://docs.swift.org/latest/documentation/wasmguide/), [swiftwasm.org](https://swiftwasm.org));
  Goodnotes ships ~50 MB wasm (12 MB Brotli), 1 Jun 2026
  ([Swift blog](https://www.swift.org/blog/bringing-goodnotes-to-web-with-swift)).
- **Kotlin** — `wasmJs`/`wasmWasi` targets, WasmGC
  ([docs](https://kotlinlang.org/docs/web-overview.html)).
- **Dart** — `dart2wasm` stable-but-preview, targets WasmGC
  ([docs](https://dart.dev/web/wasm)).

### 1.4 Rust specifically — the sharp edge
- **AOT + bindgen**: `wasm-bindgen`/`wasm-pack` (see 0). Not a runtime; no compile in-browser.
- **rustc-on-wasm experiments**: official discussion closed 2022 with "fun, not supported";
  bjorn3 pointed at Miri #722, whose maintainer note says compiling rustc to WASM is "a pretty
  big undertaking" and Miri-for-WASM is "not something we currently intend to support"
  ([internals thread](https://internals.rust-lang.org/t/running-rustc-on-wasm/16198),
  [Miri #722](https://github.com/rust-lang/miri/issues/722)).
- **`rubrc`** — the *only* functioning in-browser Rust toolchain found; pre-release v2, MIT/
  Apache, 65 stars, no transitive crates, no proc-macros, serialized
  ([repo](https://github.com/oligamiq/rubrc)).
- **`mrustc`** — alternative compiler in C++ that *bootstraps rustc*, emits C; not a runtime
  ([repo](https://github.com/thepowersgang/mrustc)).
- **`rustc_codegen_cranelift`** — pure-Rust codegen backend but emits **native** code; cannot
  execute inside a browser. 2026 Rust Project Goal (18 Sep 2026) asks for 2× speedup and
  *interpreting Cranelift IR* for cold functions
  ([goal](https://goals.rust-lang.org/2026/improve-cg_clif-performance.html)).
- **`evcxr`** — Rust REPL/Jupyter kernel; uses native `rustc` + cranelift, **not** browser
  ([repo](https://github.com/evcxr/evcxr)).
- **rust-analyzer in browser** — EXISTS: archived official demo
  ([archive](https://github.com/rust-analyzer/rust-analyzer-wasm)) and a 2026 revival
  ([CGMossa/rust-analyzer-wasm](https://github.com/CGMossa/rust-analyzer-wasm), May 2026).
  Front-end (LSP) is solved; backend (compile/exec) is not.
- **Rust Playground** — server-side: React front-end → Axum → Docker compiler containers
  ([repo](https://github.com/rust-lang/rust-playground)). No browser-native compiler.
- **Rust REPL candidates**: Rhai is a Rust-*like* scripting engine compiling to <400 KB WASM
  ([book](https://rhai.rs/book/start/builds/wasm.html)) but is not Rust and not a compiler.

### 1.5 Runtime infrastructure — mostly EXISTS
- **WASI**: Preview 1 widely used; **WASI 0.3 (Preview 3) released 11 Jun 2026** adds native
  `async`, `stream<T>`, `future<T>` ([component-model FAQ](https://component-model.bytecodealliance.org/reference/faq.html)).
  Rust ships `wasm32-wasip3` at Tier 3 ([rustc book](https://doc.rust-lang.org/rustc/platform-support/wasm32-wasip3.html)).
- **Component model**: 0.2 stable, 0.3.1 adds `map<K,V>`; cargo-component exists
  ([README](https://github.com/WebAssembly/component-model/blob/main/README.md),
  [cargo-component](https://github.com/bytecodealliance/cargo-component)).
- **Wasm interpreters in wasm**: `wasm3` is self-hosting ("wasm3 can execute wasm3"), runs in
  browsers ([repo](https://github.com/wasm3/wasm3)); `wasmi` supports SIMD/relaxed-SIMD and
  is audited ([repo](https://github.com/wasmi-labs/wasmi)); Wasmer JS has a Browser backend
  ([docs](https://docs.wasmer.io/runtime/features)); Wasmtime is the reference host runtime.
- **Web engine features**: **WasmGC + tail-calls Baseline** since 11 Dec 2024
  ([web.dev](https://web.dev/blog/wasmgc-wasm-tail-call-optimizations-baseline)); SIMD 95.7%
  and Threads 96.2% global support ([caniuse SIMD](https://caniuse.com/wasm-simd),
  [threads](https://caniuse.com/wasm-threads)); Wasm core itself 96.0%
  ([caniuse](https://caniuse.com/wasm)).
- **Dynamic linking**: no broadly deployed core-wasm dynamic linking across engines; the
  component model is the sanctioned composition path (same README). This constrains C1.

### 1.6 Tooling ecosystem: registries, LSP, debuggers, judges
- **In-browser package registries**: PyPI gained `pyemscripten_*` wheels via PEP 783
  (Pyodide 314, 9 Jun 2026). **No Rust equivalent**: crates.io serves source only
  ([crates.io](https://crates.io)); `wasm-pack` publishes *output* packages to npm, not
  consumable libraries to a runtime registry. Wasmer Registry exists but is host-server oriented.
- **In-browser debuggers**: DWARF in Chrome DevTools via extension + separate `.debug.wasm`
  ([Chrome blog](https://developer.chrome.com/blog/wasm-debugging-2020)); VS Code js-debug
  DWARF module; DWasm portable-debugging paper, 5 Jul 2026
  ([PDF](https://soft.vub.ac.be/Publications/2026/vub-tr-soft-26-04.pdf)).
- **How judges run Rust/C today**: server-side sandboxes — Rust Playground (Docker),
  Judge0 (60+ langs, [llms.txt](https://judge0.com/llms.txt)), DMOJ
  ([org](https://github.com/DMOJ)). All require backend compute, network, and trust in a host.
- **What browser-native compilation would unlock** (sourced): client-side compilation
  "reduces infrastructure costs and addresses privacy concerns" (whitequark, LLVM RFC);
  BrowserPod sells $0.01/hr client-side compute vs $0.08–0.19 cloud sandboxes
  ([pricing page](https://browserpod.io/)); offline/air-gapped and no-roundtrip execution.

**Existence-check bottom line:** runtimes for Python, Ruby, PHP, Lua, Java, C/C++, Go, Zig,
Swift, Kotlin, Dart all EXIST AOT; full in-browser *compilers* exist for Java
(`teavm-javac`), C/C++ (Clang/WASI), and Zig (self-hosted). Rust's in-browser **compiler**
barely exists (`rubrc`, pre-release) and its **package/runtime layer does not exist at all.**

---

## 2. Candidates (ranked by missing × impact × feasibility)

### Candidate 1 — RELAY: an in-browser Rust package runtime (registry + ABI + installer)

1. **One-liner.** A `micropip`/`cibuildwheel` for Rust: resolve, fetch, verify and link
   prebuilt Wasm libraries into a browser-resident Rust toolchain at runtime, so
   `cargo add <crate>` works offline in a tab.
2. **Exists / does not.** EXIST: `rubrc` runs `rustc`+`cargo` in a worker but "external
   dependencies and procedural macros are currently unsupported"; Pyodide has `micropip` +
   **PEP 783** wheels; `wasm-pack`/`cargo-component` publish AOT outputs. DOES NOT EXIST:
   any runtime package resolver for Rust; any stable cross-compiler Wasm library ABI that
   crates.io publishes; any in-browser registry index+cache. Gap: the *distribution half*.
3. **Who hurts / what unlocks.** Education platforms, offline/air-gapped judges, privacy-first
   and embedded/edge hosts, plugin authors, and AI code-execution sandboxes. Unlocks:
   `cargo add` in a tab, offline reproducible builds, portable plugin ecosystems.
4. **Why now.** PEP 783 proves the registry model (9 Jun 2026); the component model + WIT give
   a real shared-nothing ABI; `rubrc` proves `rustc` runs in a tab; WasmGC/tail-calls are
   Baseline; WASI 0.3 adds async (all linked in §1).
5. **Architecture.** Static JSON index (content-addressed) → resolver → fetch signed
   component/`.wasm` archives → OPFS cache → link via component model / WIT bindings. Base
   toolchain: `rubrc`'s prebuilt `rustc_opt/llvm_opt/cargo_opt` assets (sizes not published);
   per-package: KBs–MBs (wasm-bindgen docs). Startup: ms warm from OPFS, seconds cold.
6. **Stage-1.** One package, no transitive deps, `no_std`, `extern "C"` + `#[no_mangle]`,
   prebuilt by host CI to `wasm32-wasip1`, installed from a *local static* registry into the
   VFS and linked into a `rubrc` build. Non-goals: live crates.io sync, proc-macros, native
   (`-sys`) deps, semver solving.
7. **Decisive experiment (minutes, CPU-only).** In a browser, use `rustc_opt.wasm` to compile
   `lib.rs` → object and a consumer that calls it, then link both into one runnable module.
   PASS if `main` prints the library's value; FAIL if the linker cannot resolve cross-module
   symbols. This proves the load-bearing feasibility or kills it immediately.
8. **Risks.** No stable Rust ABI (must use C ABI/component model — real work); prebuilt asset
   size/COOP+COEP; OPFS quotas; no proc-macros; serialized compile; licensing (rubrc is MIT/
   Apache but depends on `browser_wasi_shim` by bjorn3).
9. **Grade: NEW CATEGORY.** Nothing today provides a runtime package ecosystem for Rust;
   the pieces exist, the load-bearing distribution layer does not.

### Candidate 2 — W2W: a self-hosted Wasm→Wasm Rust backend (in-browser, incremental)

1. **One-liner.** Add a Rust codegen backend that emits WebAssembly *directly* and runs inside
   wasm — no LLVM — making the compiler small enough to stay resident and re-compile in ms.
2. **Exists / does not.** EXIST: `rustc_codegen_cranelift` (native target),
   LLVM/WASI (huge, shipped by `rubrc`), Zig's `stage2_wasm` self-hosted backend (proof by
   precedent). DOES NOT EXIST: any Rust backend that both emits wasm and runs in wasm.
3. **Who hurts / what unlocks.** Anyone who today downloads tens–hundreds of MB of LLVM just
   to compile a few lines: playgrounds, notebooks, IDEs, offline judges, plugin sandboxes.
3. **Why now.** Cranelift is pure Rust; the 2026 Rust Project Goal (18 Sep 2026) targets
   interpreting Cranelift IR and 2× backend speedup; WasmGC/tail-calls Baseline; component
   model gives a linking story.
5. **Architecture.** Keep rustc front-end (MIR) already running in `rubrc`; swap LLVM codegen
   for `MIR → Wasm` emitter; WIT/component model for linking. Budget: eliminate the LLVM
   binary (dominant asset); front-end is a fraction of it.
6. **Stage-1.** Offline MIR→Wasm translator for a tiny subset (`fn`, arithmetic, `if`, calls,
   `println!` stubbed), consuming MIR dumped by host rustc. Non-goals: borrowck, generics,
   traits, `std`, unwinding.
7. **Decisive experiment.** Dump MIR for a 20-line program; hand-translate ~10 statements to
   wasm; run in a tab. PASS if output is correct and translation < 1 s; FAIL if MIR surface
   (drops, aggregates, unwind edges) makes a subset incoherent.
8. **Risks.** Enormous surface (MIR semantics, unsizing, panics, DWARF), duplicate rustc
   maintenance, no producer support.
9. **Grade: HARD / potential BREAKTHROUGH 10x+.** Only Zig ships this among systems
   languages; Rust's MIR is far larger. High payoff, high risk.

### Candidate 3 — CIR-IE: a Cranelift-IR interpreter on wasm (instant Rust eval/REPL)

1. **One-liner.** Execute `rustc_codegen_cranelift`'s Cranelift IR in a browser-resident
   interpreter so small Rust snippets evaluate immediately, with no LLVM compile step.
2. **Exists / does not.** EXIST: `evcxr` REPL (native), `wasm3` self-hosting interpreter,
   `wasmi`. DOES NOT EXIST: a browser-resident Rust execution engine; `cg_clif` cannot run in
   wasm; Miri is not wasm-supported (#722). `rubrc` reports 61 s → 12 s for one workflow.
3. **Who hurts / what unlocks.** Notebook/REPL users, interactive teaching, fast feedback in
   web IDEs; unlocks sub-second edit-run loop.
4. **Why now.** The 18 Sep 2026 goal *explicitly proposes interpreting Cranelift IR for
   infrequently-called functions*; `wasm3` proves interpreter-in-wasm; threads Baseline.
5. **Architecture.** rustc front-end (from rubrc) → cg_clif IR → interpreter compiled to
   wasm; cache warm IR in OPFS. Budget: no LLVM; interpreter is small (wasm3 ≈ 64 KB code).
6. **Stage-1.** Interpret one function (`fn add(a:i32,b:i32)->i32`) from CIR in a wasm module.
   Non-goals: full std, floats, aggregates, performance.
7. **Decisive experiment.** Emit CIR for `add`, feed it to the interpreter in-browser. PASS if
   it returns 3; FAIL if CIR cannot be consumed without a full cranelift build.
8. **Risks.** cg_clif isn't designed for a wasm host; IR instability; performance.
9. **Grade: BREAKTHROUGH 10x+ (latency) but HARD.** Depends on upstream direction.

### Candidate 4 — ONERT: one unmodified-program runtime for browser **and** non-browser hosts

1. **One-liner.** A single WASI-preview-3 component runtime that runs full-POSIX, threaded,
   networked language runtimes (Rust/Node/Python/Ruby) unchanged, in browsers *and* on
   Deno/Node/edge/embedded — "or somewhere else."
2. **Exists / does not.** EXIST: BrowserPod (browser, **proprietary/paid**), Wasmtime/jco
   (host), WASI 0.3 (spec), WALI + CheerpX (academic/vendor bridge). DOES NOT EXIST: an
   open, portable runtime with full POSIX+threads+sockets that is equally at home in a tab
   and outside it. BrowserPod itself plans to converge on WALI.
3. **Who hurts / what unlocks.** Cross-platform dev docs, serverless/edge + offline desktops,
   agentic code execution; unlocks write-once-run-anywhere for existing CLI software.
4. **Why now.** WASI 0.3 (11 Jun 2026), component model 0.3.1, threads Baseline, BrowserPod's
   `wasm32-browserpod-linux-musl` proves unmodified Rust works.
5. **Architecture.** Capability-based host ABI + OPFS/FS bridge (browser) vs POSIX (host);
   per-process Worker isolation; component-model composition. Budget: runtime + sysroot;
   startup ms warm.
6. **Stage-1.** Run one threaded Rust CLI (`ripgrep` subset) from the same artifact in Chrome
   and Deno via a shared WASI-p3 host layer. Non-goals: sockets, subprocesses, Windows.
7. **Decisive experiment.** Compile a pthread + file-I/O Rust program to one component; run
   under a browser host shim and under Wasmtime. PASS if both produce identical output.
8. **Risks.** Browser has no threads without COOP/COEP; WASI lacks process/signal semantics;
   BrowserPod's head start is proprietary.
9. **Grade: PARTIAL GAP.** The browser half is commercial; the open portable half is missing.
   Strong impact, medium feasibility.

### Candidate 5 — RUST OBSERVATORY: unified in-browser Rust dev loop (compile + LSP + DWARF)

1. **One-liner.** One embeddable service giving rustc diagnostics + rust-analyzer LSP + DWARF
   step-debugging for Rust in a tab, currently split across three projects.
2. **Exists / does not.** EXIST: rust-analyzer-wasm, DWARF Chrome extension, DWasm. DOES NOT
   EXIST: an integrated, backend-free Rust dev loop; rustc-level diagnostics require a full
   compile today.
3. **Who hurts / what unlocks.** Web IDEs, interactive courses, docs; unlocks real debugging
   without a server.
4. **Why now.** Baseline DWARF conventions + DWasm (Jul 2026) + rubrc's embedded LSP.
5. **Architecture.** Monaco + wasm LSP + wasm rustc/cg_clif + DWARF custom sections.
6. **Stage-1.** Show borrowck diagnostics from rustc.wasm in the editor for a 10-line program.
7. **Decisive experiment.** Compile a known borrow error in-browser; PASS if the exact
   `E0505` diagnostic appears in < 5 s.
8. **Risks.** LSP/compiler duplication of state; DWARF+optimization breaks; scope creep.
9. **Grade: PARTIAL GAP.** Mostly integration; lower novelty than C1–C3.

---

## 3. Ranked summary

| Rank | Candidate | Grade | Missing piece | Feasibility |
|---|---|---|---|---|
| 1 | **RELAY** — in-browser Rust package runtime | **NEW CATEGORY** | registry + stable wasm ABI + installer | medium |
| 2 | **W2W** — self-hosted Wasm→Wasm Rust backend | **BREAKTHROUGH / HARD** | Rust backend that emits + runs wasm | low |
| 3 | **CIR-IE** — Cranelift-IR interpreter on wasm | **BREAKTHROUGH / HARD** | no-LLVM in-browser eval | low–medium |
| 4 | **ONERT** — portable p3 runtime (browser + host) | **PARTIAL GAP** | open full-POSIX runtime | medium |
| 5 | **RUST OBSERVATORY** — unified dev loop | **PARTIAL GAP** | integration of 3 shipped parts | medium |

**Skip list:** Pyodide/CPython-wasm, MicroPython, ruby.wasm, php-wasm, Fengari, Doppio,
CheerpJ, TeaVM + `teavm-javac`, clang/WASI (`browsercc`, Wasmer), TinyGo/Go, Zig (incl.
self-hosting), Swift, Kotlin/Wasm, Dart, rust-analyzer-wasm, DWARF debugging, Rust Playground,
WASI/component-model specs, wasm3/wasmi/Wasmer-JS/Wasmtime — all EXIST; not candidates.

**Cross-cutting risks that could invalidate all of the above:** (i) BrowserPod (Leaning
Technologies) intends to ship in-browser Rust compilation itself and already owns the runtime
and customers; (ii) `rubrc` is a single maintainer with unpublished asset sizes and an
LLVM-asset dependency; (iii) no stable Rust ABI means any package layer routes through the
component model / C ABI, which changes erognomics; (iv) Miri-for-wasm is explicitly
unsupported upstream, so correctness tooling must be separate; (v) all browser paths need
COOP/COEP for threads. Any candidate that ignores (i)–(v) is not buildable.

**Recommended Stage-1 to actually run first:** C1's cross-module link experiment inside a
browser using `rubrc`'s `rustc_opt.wasm` — minutes of CPU, and it decides whether the
package-runtime category is reachable or dead.
