# Wave 46 — RELAY Feasibility Probe (Rust in-browser package runtime)

Date: 2026-09-19. Scope: research only. One file written; no repo code; no git.
Method: direct fetches + HTTP `HEAD`/byte-range requests on the sources cited below; every
size is a fetched `Content-Length`/`Content-Range` or a GitHub tree blob size, with the URL.
Repo budget figures read from the existing `.next/static` build output (read-only).
Honesty note: no brotli-compressed toolchain total is published anywhere; where that number
would be needed I say "not published" rather than estimate it as fact.

Candidate under test: **RELAY** (see `wave-46-candidates-a-runtime.md` §Candidate 1) —
an in-browser Rust package runtime: registry + stable wasm ABI + installer.

---

## 1. `rubrc` — the only working in-browser Rust toolchain found

Repo: https://github.com/oligamiq/rubrc (fetched 2026-09-19 unless noted).
Status: `stargazers_count` 65, forks 3, repo `size` 133,301 KB (GitHub API
`/repos/oligamiq/rubrc`). **GitHub API `license` is `None`** and the recursive tree contains
**no LICENSE file**; license is only declared in `package.json`/README as "MIT OR
Apache-2.0" (https://raw.githubusercontent.com/oligamiq/rubrc/main/package.json). Last
commit: `main` 2026-07-25, `develop` **2026-09-15**; `pushed_at` 2026-09-18. Tags: `v1.1.2`,
`v1.2.0`. **Releases: 0** — `/releases` is empty; **there are no release artifacts to size.**
The toolchain is committed as blobs. Real sizes (GitHub tree API `git/trees/main?recursive=1`):

| Asset (`crates/vfs/`) | bytes | MiB |
|---|---|---|
| `rustc_opt.wasm` | 95,427,808 | 91.0 |
| `llvm_opt.wasm` | 84,148,614 | 80.2 |
| `lsp_opt.wasm` | 33,572,641 | 32.0 |
| `cargo_opt.wasm` | 18,062,382 | 17.2 |
| `llvm_mock.wasm` | 2,974,637 | 2.8 |
| `rustc_mock.wasm` | 105,792 | 0.10 |
| **real-toolchain total** | **231,211,445** | **220.5** |

**What `rustc_opt.wasm` is / how it is loaded.** `rustc_opt` is rustc compiled with the LLVM
backend to `wasm32-wasip1-threads`, loaded by `wasi_virt_layer` (a separate crate) and invoked
directly by the VFS runtime rather than as an OS subprocess (`README.md`; `crates/vfs-rustc-twice/src/lib.rs`).
`wasi_virt_layer` is on crates.io (`/api/v1/crates/wasi_virt_layer`): 0.6.1 is MIT/Apache-2.0,
0.7.2 (2026-08-28) is declared **"non-standard"**, max 0.7.2, 1,569 downloads. Module layering:
`vfs`, `vfs-shell`, and embedded `rustc_opt|llvm_opt|cargo_opt|lsp_opt` communicate via a WIT
world (`crates/vfs/wit/vfs-host.wit`) using **s32 pointer/len scalar pairs and explicit memory
copies — not core-wasm dynamic linking.**

**Headless (node/bun) evidence, not just a browser.** The repo ships runnable Deno/Bun tests
that instantiate the toolchain outside a browser: `scripts/test_rustc_inspect.ts` invokes
`rustc /src/main.rs --sysroot /sysroot --target wasm32-wasip1 …` under `Deno` + `WASIFarm`,
and `lsp_cli_test_bun.ts` runs under Bun with a **shared** `WebAssembly.Memory` of
`initial: 127, maximum: 32775` pages (≈2.1 GB max, wasm32). So: **headless yes**, but it still
needs `@bjorn3/browser_wasi_shim` + `@oligami/browser_wasi_shim-threads`, and the docs' test
harness — not a bundler-free browser drop-in.

**crates / proc-macros.** README: "external dependencies and procedural macros are currently
unsupported"; "compiler and Cargo invocations are currently serialized"; only
`wasm32-wasip1` and `x86_64-unknown-linux-musl` "tested"; "Other targets are known to fail
during the linking process." Open issue **#7 "wasip2 support"**. A `scripts/vfs_debug_cargo_add_test.ts`
does exercise `cargo add hello` + `cargo build` over an HTTP bridge (cap
`MAX_RESPONSE_BYTES = 64 * 1024 * 1024`, `lib/src/http_bridge.ts`), so trivial registry fetch
is partially wired — but this is not a package resolver.

**Sysroot distribution (the closest thing to a package layer).** `lib/src/sysroot.ts` fetches
`https://oligamiq.github.io/rust_wasm/v0.2.0/<triple>.tar.br`. Byte-range (`Content-Range`):
`wasm32-wasip1` **18,940,938 B (18.1 MiB)**, `wasm32-wasip1-threads` **19,000,987 B**,
`x86_64-unknown-linux-musl` **23,438,862 B (22.4 MiB)**. A per-target precompiled-lib
distribution exists, but it is prebuilt std, not user crates.

**JS/TS API.** `lib/package.json` declares public npm package `@oligami/rustc-browser-wasi_shim`
(exports `get_wasm`, `load_sysroot_part`), but `registry.npmjs.org/@oligami/rustc-browser-wasi_shim`
returns **HTTP 404** — **not published**. So there is no installable JS/TS API today.

**Deployment + blockers.** `prepare-vfs-asset.mjs` brotli-compresses (`VFS_BROTLI_QUALITY=11`)
a single composed `vfs.core-*.wasm` and splits it into `.br.part-NNN` of at most
`VFS_PART_BYTES = 25,165,824` (24 MiB); `verify-vfs-asset.mjs` enforces Cloudflare Pages'
25 MiB file cap. The live site ships COOP/COEP (`rubrc.pages.dev` HEAD 2026-09-19:
`cross-origin-opener-policy: same-origin`, `cross-origin-embedder-policy: require-corp`) via a
`mini-coi.js` service worker; threads require shared memory. `RELEASE.md` reports a single
workflow going 61 s → 12 s. memory64 is not used (wasm32 shared memory). **The compressed
toolchain transfer size is not published** (no manifest on the deployed site is reachable
without its content hash; only the 24 MiB per-part cap is documented).

---

## 2. BrowserPod 3.0/3.1 — shipped runtime, closed service

Blog: https://labs.leaningtech.com/blog/browserpod-rust (2026-08-13, fetched). Rust runs
*unmodified* (`ripgrep`, `starship`, `jj` ~200k SLOC, `openai/codex` ~1.25M SLOC) via a custom
target `wasm32-browserpod-linux-musl` (LLVM `wasm32` under `arch: "wasm64"` hack). Key quote:
"the user needs to compile the program offline and add the resulting binary to the Pod …
In principle, we could allow users to compile their Rust programs directly in the browser …
it will happen in the near future." **In-browser Rust compilation is announced, not shipped.**
The compiled binary dependency also means `.wasm` artifacts are `wasm32-browserpod-linux-musl`,
not WASI/component-model portable.

It is a **hosted service, not an open library.** npm `browserpod` 3.1.0 exists but `unpackedSize`
is only **13,207 B** (`registry.npmjs.org/browserpod`) — a thin SDK. `BrowserPod.boot` requires
`{ apiKey, … }` (`/docs/reference/BrowserPod/boot`); runtimes are delivered by browserpod.io and
outbound requests are proxied through their infra (`/docs/overview`). Licensing
(`/docs/more/licensing`): free Personal plan is **non-commercial, requires visible attribution,
no redistribution**; commercial use and **self-hosting** are Pro/Enterprise. GitHub
`leaningtech/browserpod-meta` (license NOASSERTION) holds docs/example assets only; the runtime
is not open source. **Lock-in: hosted runtime + metered API key; no open integration path below
Enterprise.** Pricing (https://browserpod.io/pricing/, fetched): $0.01/hr, 1,000 free hrs/month
personal; Pro $20/mo. Changelog confirms 3.0.0 "Official support for Rust" and no in-browser
compile release.

---

## 3. Other open in-browser Rust paths

- **browsercc** (MIT, github.com/BertalanD/browsercc, README fetched): precompiled Clang/LLVM
  toolchain with a JS `compile()` API; **`clang.wasm` 43 MB, `lld.wasm` 23 MB, `sysroot.tar`
  29 MB, `stdc++.h.pch` 19 MB (uncompressed, published in README)**. The strongest open
  precedent for client-side compilation with a TS API — but it is **C/C++, not Rust**.
- **Wasmer clang-in-browser** (https://wasmer.io/posts/clang-in-browser): "requires a 100MB
  download".
- **wasi-sdk-34** (releases API, published 2026-08-25): `wasi-sysroot-34.0.tar.gz` 119,283,116 B
  (113.7 MiB); `wasi-sdk-34.0-x86_64-macos.tar.gz` 182,668,326 B (174.2 MiB). This is the
  size class of a full native clang+sysroot.
- **mrustc** (MIT, 2,529 stars, pushed 2026-09-15): C++ compiler that **emits C** and bootstraps
  rustc 1.90/1.91; CI targets are x86-64 Linux/Windows/macOS. **No wasm output, no browser
  target** (README). Compiling it to wasm is not a delivered project.
- **rustc_codegen_cranelift** (rust-lang, Apache-2.0, 2,136 stars, pushed 2026-09-18): README
  mentions no wasm/browser target → native codegen only.
- **wasm-bindgen 0.2.128** release assets are host-side CLI binaries (~8–12 MB each), not a
  browser runtime.
- Self-hosted-to-wasm compilers exist for C/Scheme (`google/schism`, `divsmith/c2wasm`,
  `false-schemers/wcpl`) but **none for Rust** (GitHub search).
- **No published JS/TS API compiles Rust client-side**: rubrc's API is unpublished (npm 404),
  browsercc is C/C++.

---

## 4. Wasm package/linking mechanics (2026)

Component Model README (github.com/WebAssembly/component-model, fetched): milestone **0.2.0**
stable (shared-nothing + shared-everything linking, `resource`s, WIT); **0.3.0** adds
async/`stream`/`future`; **0.3.1** adds `map<K,V>`. `design/mvp/Linking.md` is decisive for a
runtime registry: shared-everything *dynamic* linking still requires the set of modules to be
**statically declared before runtime**, and "fully-runtime dynamic linking" (dlopen-style) is
explicitly deferred — plugin stores are to be a **WIT interface above the model**, i.e. the
loader is application code, not a model feature. Core wasm dynamic linking is not broadly
deployed; the working deployed mechanism is **Emscripten `-sMAIN_MODULE` + SIDE_MODULE + `dlopen()`**
(emscripten docs), which is Emscripten-specific. Browsers do not run components natively;
**jco** (bytecodealliance/jco, Apache-2.0, 1,004 stars, pushed 2026-09-16) is the "JavaScript
toolchain for WebAssembly Components", i.e. an AOT/transpile step. Tooling: `wit-bindgen`
(1,458 stars, Apache-2.0, pushed 2026-09-18; rubrc pins 0.57.1), `wasm-tools` (1,790 stars),
`cargo-component` (593 stars, last push 2025-07-14 — stale).

**No stable Rust ABI.** The Rust Reference documents foreign ABIs (`extern "C"`, …) and the
default `extern "Rust"` (`items/functions.html`); the Rust ABI is not a stable cross-version
contract, so precompiled crates must expose a C ABI or WIT canonical ABI. rubrc's own host
boundary confirms this in practice: `vfs-host.wit` uses WIT resources over `s32` ptr/len pairs
with explicit memory copies, generated by `wit-bindgen` — not symbol linking.

---

## 5. Budget for THIS repo

- Route JS: the app's root-main framework chunks in `.next/static/chunks` total **118,606 B
  gzip** (measured 2026-09-19: 7,926 + 7,310 + 31,648 + 70,166 + 4,049 + 39,493). The stated
  ~250 kB gzip/route budget is consistent with these plus per-route chunks.
- Existing lazy precedent: `src/lib/pyodide.ts` loads **Pyodide v0.26.2 from jsdelivr on first
  submit**; real sizes (jsdelivr package API, fetched): `pyodide.asm.wasm` **10,087,885 B
  (9.6 MiB)** + `python_stdlib.zip` **2,341,761 B** + `pyodide.asm.js` **1,229,628 B** ≈
  **13.0 MiB** uncompressed, cached cache-first by `public/sw.js` (whose comment calls it
  "~30 MB"). The repo already accepts a ~13 MB opt-in/lazy runtime.
- Smallest viable Rust artifact: **M2 (below) needs KB–low-MB precompiled `.wasm` + a <30 kB
  loader + hashes — smaller than the Pyodide asset, and no COOP/COEP if it avoids threads.**
  By comparison the full compiler path is 220.5 MiB of committed toolchain (raw) + an 18–23 MiB
  brotli sysroot, and on-the-fly linking alone needs `lld.wasm` ≈ 23 MB. A compiler-hosted
  milestone (M1) is therefore ~17× Pyodide and requires COOP/COEP + shared memory.
  **The toolchain's compressed transfer total is not published** — only the 24 MiB part cap.

---

## 6. Stage-1 milestone: pick **M2** (runtime link/load of PREcompiled modules)

Chosen over M1 (compile `no_std` from source) and M3 (registry on top of a compiler). Justification:
M2 is the **load-bearing missing piece** (distribution/linking), it is the **smallest artifact**
(no rustc/LLVM), it needs **no COOP/COEP**, and it decides the category cheaply. M1/M3 merely
re-run what rubrc already does and inherit 220 MiB + a single maintainer.

Components: (1) host CI builds `lib.wasm` (`#[no_mangle] pub extern "C" fn lib_add`) and
`app.wasm` (imports `lib_add`) for `wasm32-wasip1`, exported with a shared import/export ABI
(`wasm-ld --export-dynamic` / Emscripten SIDE_MODULE convention); (2) a static `index.json`
with SHA-256 per module; (3) a <30 kB JS/TS loader: fetch → `crypto.subtle.digest` verify →
`WebAssembly.instantiate` lib → instantiate app with `{ lib: libExports }` imports → call
`_start`; (4) optional OPFS/Cache Storage cache.
Data flow: `index.json` → verified `.wasm` bytes → link at instantiate → run → stdout.
Pass/fail demo: PASS if `app.wasm` calls the imported `lib_add(20,22)` and prints `42` both in a
browser and under `bun`/`node` **without any compiler present**; FAIL if the imported symbol
cannot be resolved/linked. Time: **3–7 days** for one developer.
Single most likely failure point: **core-wasm dynamic linking is not standardized/deployed for
`wasm32-wasip1`.** The only working convention is Emscripten's `SIDE_MODULE` (Emscripten
target, not WASI), and the Component Model's runtime dynamic linking is explicitly out of scope
(§4). There is real risk M2 degrades from "link two modules at runtime" into "compose them
offline with `wasm-tools`/`wac` and just load the result" — which would falsify the RELAY
premise. This risk is exactly what the milestone is designed to surface.

---

## 7. Verdict: **DEFER** (do not KILL)

The M2 spike is buildable and cheap, but RELAY as specified is not investable now:
(a) **no stable Rust ABI** forces every precompiled crate through a C ABI or WIT canonical ABI,
so a "micropip for Rust" is really a component/plugin loader, not a package manager;
(b) **no registry of precompiled wasm Rust crates exists** (crates.io serves source);
(c) the one working compiler (`rubrc`) is **1 maintainer, 0 releases, no LICENSE file, 220 MiB
raw, proc-macros/transitive deps unsupported, serialized**, and its JS API is **unpublished**;
(d) the commercial leader (**BrowserPod**) is **closed and priced**, with in-browser compilation
only announced; (e) the component model deliberately leaves the runtime-plugin loader to apps,
and browsers don't run components natively.

Flip to BUILD on any of: (1) **BrowserPod open-sources its runtime or offers permissively
licensed self-hosting** (then the compiler/runtime half is free and RELAY becomes a registry);
(2) **component-model tooling ships a browser-native/JSPI host plus a registry** (warg /
`wasm-pkg-tools`) **serving precompiled Rust components**, making runtime linking a solved,
portable primitive; (3) **rubrc cuts a tagged release with a LICENSE file, published asset
sizes, and a published npm/Node API** ≤ ~40 MiB compressed. Until one lands, the honest move is
to run only the ≤1-week M2 spike to test the linking premise, and not staff RELAY.
