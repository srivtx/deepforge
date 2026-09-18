# Wave 48 — Candidates: AI/ML Infrastructure a CPU-only small team can now build (Scientist survey)

Date: 2026-09-19. Scope: **survey only.** One file written
(`docs/research/wave-48-candidates-aiinfra.md`); no repo code touched; no git.

**Method (honest).** Unlike wave-47 I issued **46 `websearch` queries**; this session the provider
returned **0× HTTP 429** — every query returned, so nearly all sourcing is search-returned page
content (which includes canonical docs, model cards, GitHub READMEs, arXiv HTML) rather than separate
`webfetch` calls. Every URL below is the canonical page named by the result; "restated" dates are the
date printed by the source. I do **not** treat search snippets as proof of *absence*; where I claim a
tool does not exist I say what I searched and why the claim is scoped. Accessed 2026-09-19.

**Mission (adapted, per brief).** Do **not** survey "what the literature lacks." Instead: (1) enumerate
**enabling conditions ~2024–2026** that changed what a small team with **CPUs and no GPUs** can do;
(2) derive capabilities that are now possible but **not built** (existence-checked by URL); (3) rank by
newly-possible × impact × feasibility.

**Repo facts (unchanged, wave-47 count).** `deepforge` = Next.js 16 + TS practice platform; 5,730
problems; verification goes through `scripts/verify-problems.ts` → `scripts/py_verify.py` (real
CPython, 1e-6 deep-equal). Browser execution is **Pyodide** (CPython→WASM), i.e. this repo already
ships a CPU-only inference/execution story. Wave inventions ship as lab + paper + CI gate.

**Honesty contract.** Grade each candidate `NEW CATEGORY / BREAKTHROUGH 10x+ / PARTIAL GAP /
EXISTS(skip) / HARD`. I am adversarial to my own gaps: several "unbuilt" items turn out to have a
0-star or research-only prior, which I note rather than hide.

---

## 1. Enabling conditions (date · OLD limit removed · NEW capability · URL)

### A. Small-model quality-per-parameter
- **Phi-4** 14B, **2024-12-12**, MIT — old: "small ⇒ weak reasoning"; new: 14B beats much larger 2024
  models on math (`https://huggingface.co/microsoft/phi-4`,
  `https://arxiv.org/pdf/2412.08905`). **Phi-4-mini 3.8B / Phi-4-multimodal 5.6B, 2025-02**
  (`Intel, 2025-02-26`, `https://www.intel.com/.../accelerate-microsoft-phi-4-small-language-models.html`).
- **Gemma 3** 1B/4B/12B/27B, **2025-03-12** (`https://blog.google/technology/developers/gemma-3`),
  official int4 QAT; **Gemma 3 270M, 2025-08-14**, 256k vocab task-specific fine-tune in hours
  (`https://developers.googleblog.com/en/introducing-gemma-3-270m`). **Gemma 3n** E2B/E4B, preview
  **2025-05-20**, GA **2025-06-26**, PLE+MatFormer ⇒ ~2–3 GB dynamic footprint
  (`https://developers.googleblog.com/en/introducing-gemma-3n`,
  `https://developers.googleblog.com/introducing-gemma-3n-developer-guide`).
- **Qwen3** dense 0.6/1.7/4/8/14/32B + MoE 30B-A3B, **2025-04-29**, Apache-2.0; 1.7B/4B ≈ prior
  3B/7B (`https://www.alibabacloud.com/en/press-room/alibaba-introduces-qwen3-...`,
  `https://arxiv.org/html/2505.09388v1`). **Qwen3.5 small, 2026-03-05**
  (`https://artificialanalysis.ai/articles/qwen3-5-small-models`).
- **SmolLM2** 135M/360M/1.7B, **2024-11-02**, Apache-2.0, 11T tokens
  (`https://simonwillison.net/2024/Nov/2/smollm2`); SmolLM3-3B follows
  (`https://github.com/huggingface/smollm`).
- **EmbeddingGemma, 2025-09-04** (`https://developers.googleblog.com/...`).

### B. Efficient CPU inference
- **bitnet.cpp 1.0, 2024-10-17**; paper **2024-10-21/24**: *lossless* 1.58-bit CPU inference,
  **2.37–6.17× x86**, **71.9–82.2%** energy cut; 100B at 5–7 tok/s on one CPU
  (`https://github.com/microsoft/BitNet`, `https://arxiv.org/pdf/2410.16144`). Official 2.4B model
  **2025-04-14**; CPU optimization **2026-01-15**; 1-bit embeddings **2026-07-20**
  (`https://github.com/microsoft/BitNet/blob/master/README.md`).
- **llama.cpp GGUF k-quants** Q2_K–Q8_0 plus AVX2/AVX-512/NEON/AMX; **llamafile 0.7, 2024-03-31**
  reports **10× faster prompt eval** on Zen4 AVX-512
  (`https://news.ycombinator.com/item?id=39887263`); `ik_llama.cpp` adds ~1.5–3× PP on AVX-512
  (`https://github.com/ikawrakow/ik_llama.cpp`).
- **KV-cache quantization**: llama.cpp `-ctk/-ctv` `q8_0/q4_0`; **KVQuant, NeurIPS 2024**: 3-bit KV
  <0.1 PPL loss (`https://arxiv.org/pdf/2401.18079v2`). Old limit: KV cache made long-context local
  impossible on 8–16 GB.
- **Speculative decoding on CPU**: llama.cpp draft-model + n-gram paths with CPU thread/affinity knobs
  (`https://github.com/ggml-org/llama.cpp/blob/master/docs/speculative.md`); *Decoding Speculative
  Decoding*, NAACL 2025 (`https://aclanthology.org/2025.naacl-long.328`).

### C. On-device runtimes (browser + OS)
- **Chrome Gemini Nano**: built in from Chrome 126, **2024-05-14**
  (`https://techcrunch.com/2024/05/14/google-is-building-its-gemini-nano-ai-model-into-chrome-on-the-desktop`);
  **Prompt API** docs **2025-05-20** (`https://developer.chrome.com/docs/ai/prompt-api`); **CPU
  inference added in Chrome 140, 2025-10-01** (`https://developer.chrome.com/blog/gemini-nano-cpu-support`)
  — this is the key one for no-GPU teams.
- **Apple Foundation Models framework**: WWDC **2025-06-09** (`https://developer.apple.com/videos/play/wwdc2025/286`),
  ships with iOS/macOS 26, **2025-09** (`https://www.apple.com/newsroom/2025/09/apples-foundation-models-framework-...`):
  ~3B on-device model, `@Generable` guided generation + tools, no network.
- **Windows ML public preview, 2025-05-19** (`https://blogs.windows.com/windowsdeveloper/2025/05/19/introducing-windows-ml-...`),
  ONNX-RT-based, CPU/GPU/NPU; **Windows AI APIs** now CPU+GPU preview, Phi Silica
  (`https://developer.microsoft.com/en-us/windows/ai`).
- **WebGPU + ONNX Runtime Web** since ORT 1.17 (**2024-02-29**,
  `https://opensource.microsoft.com/blog/2024/02/29/onnx-runtime-web-unleashes-generative-ai-in-the-browser-using-webgpu`);
  **WebLLM** in-browser, up to 80% native decode (`https://arxiv.org/pdf/2412.15803`);
  **transformers.js v3** (`https://github.com/huggingface/transformers.js/.../webgpu.md`).

### D. Agent / tool protocols
- **MCP** spec revisions **2024-11-05 → 2025-03-26 → 2025-06-18 → 2025-11-25 → 2026-07-28**
  (`https://github.com/modelcontextprotocol/modelcontextprotocol/releases`); 2025-06-18 adds
  structured tool output, elicitation, OAuth resource-server model, RFC 8707
  (`https://modelcontextprotocol.io/specification/2025-06-18/changelog`). **Official MCP Registry**
  preview **2025-09-08** (`https://blog.modelcontextprotocol.io/posts/2025-09-08-mcp-registry-preview`).
- **A2A** announced **2025-04-09** (`https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability`),
  donated to Linux Foundation **2025-06-23**, v0.3 with gRPC + signed agent cards **2025-07-31**
  (`https://cloud.google.com/blog/products/ai-machine-learning/agent2agent-protocol-is-getting-an-upgrade`).
- **WebMCP**: W3C Web ML CG repo **2025-08-13** (`https://github.com/webmachinelearning/webmcp`);
  Chrome early preview **2026-02-10**, Chromium 146 + flag (`https://developer.chrome.com/blog/webmcp-epp`).
- Local tool calling is ordinary now: **Ollama tool support 2024-07-25**
  (`https://ollama.com/blog/tool-support`), `format` = JSON schema (`https://github.com/ollama/ollama/blob/main/docs/api.md`).

### E. Data, training, distribution
- **FineWeb** 15T tokens **2024-05-31** (`https://huggingface.co/spaces/HuggingFaceFW/blogpost-fineweb-v1`);
  **Dolma** 3T, ACL 2024 Best Resource (`https://aclanthology.org/2024.acl-long.840`).
- **CPU LoRA meta-generation**, **2025-07-02**: adapters computed on a laptop CPU in minutes
  (`https://arxiv.org/abs/2507.01806`); Intel QLoRA-on-CPU exists
  (`https://github.com/intel/intel-extension-for-transformers/blob/main/docs/qloracpu.md`).
- **model2vec**: distill any sentence transformer to a static CPU model in **~30 s, no data**
  (`https://pypi.org/project/model2vec`).
- **HF Xet** acquired 2024-08, default for new repos **2025-05-23**, migration blog **2025-07-15**
  (`https://huggingface.co/docs/hub/en/storage-backends`, `https://huggingface.co/blog/migrating-the-hub-to-xet`).
- **GGUF conversion attestation** prior (0★): pins the safetensors→GGUF chain
  (`https://github.com/theadamdanielsson/ggufpacker/blob/main/docs/conversion-attestation.md`).

### F. Evaluation, safety, ternary training
- **lm-evaluation-harness** v0.4.x, GGUF backend, PyPI attestation bundles
  (`https://pypi.org/project/lm-eval`); **JSONSchemaBench** 10k schemas, 2025-01
  (`https://arxiv.org/pdf/2501.10868`); **BFCL** ICML 2025 (`http://proceedings.mlr.press/v267/patil25a.html`);
  **τ-bench** ICLR 2025 (`https://arxiv.org/pdf/2406.12045v1`).
- Mobile-specific eval now exists: **MobileAIBench** (`https://openreview.net/pdf?id=EEbRrNsiiD`),
  **PalmBench** ICLR 2025, **lm-Meter** 2025 (`https://arxiv.org/html/2510.06126v1`) — but these are
  latency/accuracy, not calibration/abstention (see §2).
- **GLiNER-PII** on HF **2025-10-28**, NVIDIA NIM **2026-03-03**, 55+ PII categories
  (`https://build.nvidia.com/nvidia/gliner-pii`); Presidio+GLiNER validator
  (`https://guardrailsai.com/hub/validator/guardrails/presidio_gliner_pii`).
- **Ternary is trainable**: BitNet Distillation **2025-10** (`https://arxiv.org/html/2510.13998v1`);
  Falcon-Edge + `onebitllms` toolkit **2025-05-15**
  (`https://huggingface.co/blog/tiiuae/falcon-edge`).
- **Backend choice changes answers**: *The Silent Hyperparameter*, 2026 —
  vLLM/SGLang/llama.cpp diverge on the *same* weights, greedy decoding
  (`https://arxiv.org/html/2605.19537v2`).

---

## 2. Now possible but unbuilt (existence-checked; skip what exists)

- **U1 — Cross-runtime parity + quant-drift attestation.** *Exists:* an ONNX-internal parity checker
  (`onnxruntime/.../llama_parity`), and a paper that *measures* cross-engine divergence
  (`2605.19537`), plus GGUF conversion attestation (`ggufpacker`). *Does NOT exist:* a shipped tool
  that takes one model id + a set of runtimes (llama.cpp, ONNX CPU, transformers.js) and emits a
  signed "answers agree within ε / drift is from quantization, not backend" report.
  Load-bearing because regulated/offline claims currently cannot be verified.
- **U2 — CPU per-device model chooser.** *Exists:* GPU leaderboards (Artificial Analysis, Open LLM),
  academic edge energy studies (`2511.11624`, `2409.15790`), AWQ-vs-pruning study (EMNLP 2025
  Findings `2025.findings-emnlp.645`). *Does NOT exist:* a tool that, given *this Mac/PC + task +
  license constraints*, returns the smallest model+quant+runtime hitting an accuracy floor with a
  measured joules/token Pareto. Search terms used: "small language model leaderboard CPU quantization
  per-device energy Pareto 2025".
- **U3 — Calibration / abstention profiler for local quantized models.** *Exists:* papers that prove
  quantization hurts calibration (`https://aclanthology.org/2025.acl-long.1473`,
  DPQ `https://arxiv.org/abs/2608.21019`, self-calibration NAACL 2025), and selective-prediction
  research. *Does NOT exist:* a developer tool that reports ECE / risk-coverage / recommended
  abstention thresholds per quant level for GGUF models on CPU. Quantization is invisible in every
  on-device benchmark I found.
- **U4 — Cross-platform on-device capability broker.** *Exists:* Cactus (cross-platform engine,
  `https://cactuscompute.com/compare/best-coreml-alternative`), `aisuite` (provider abstraction,
  `https://github.com/andrewyng/aisuite`), per-vendor APIs (Chrome, Edge `Aion-1.0-Instruct`, Apple
  FM, Windows ML), and a **closed** vLLM RFC for device capability abstraction
  (`https://github.com/vllm-project/vllm/issues/40620`). *Does NOT exist:* one TS API that negotiates
  across *browser built-in models, OS models, and local runtimes*, exposes a declared capability
  contract (schema/logit access/tool use), and refuses to silently degrade. Load-bearing for the web.
- **U5 — Offline, capability-scoped agent sandbox.** *Exists:* `smolagents` CodeAgent with sandboxes
  — but the documented executors are **E2B / Docker / Modal / Blaxel** (cloud or daemon)
  (`https://github.com/huggingface/smolagents`); local tool calling (Ollama). *Does NOT exist:* a
  deny-by-default, no-network, capability-token sandbox for small local models with an audit chain.
- **U6 — GGUF quant supply-chain attestation at install time.** *Exists:* conversion attestation
  (`ggufpacker`), model-provenance 0★ tool (`https://github.com/alexh-scrt/model-provenance`), Xet
  chunk dedup. *Does NOT exist:* a signed "this Q4_K_M was produced by this converter/flag from this
  safetensors sha256" verifier wired into `ollama pull`/`llama.cpp -hf`. Partial, but the last mile
  is missing.
- **U7 — Ternary CPU adaptation factory.** *EXISTS (skip):* Falcon-Edge `onebitllms` trains
  fine-tunable 1.58-bit models (`https://huggingface.co/blog/tiiuae/falcon-edge`) and BitDistill
  (`2510.13998`). The "unbuilt" version (CPU-only from-scratch ternary training) is **HARD** — STE
  backprop on CPU is impractical at useful scale.
- **U8 — Structured-output compliance for quantized tiny models.** *Exists:* JSONSchemaBench
  (`2501.10868`), GBNF/Outlines/XGrammar, Ollama `format`. *Does NOT exist:* a compliance/coverage
  matrix *by quant level* on CPU (does q3 change whether the grammar is honored?). Partial.
- **U9 — Model card/license "deployable set" resolver.** *Exists:* `model-provenance` (0★), MCP
  registry metadata, HF model cards. *Does NOT exist:* a resolver that computes the closed set of
  models you may ship under a chosen policy (commercial, attribution, no-train). Partial, low moat.
- **U10 — Adaptive speculative-strategy selection.** *Exists:* a benchmark repo for all 8 llama.cpp
  strategies (`https://github.com/papajo/llama-cpp-projects/.../1.2-spec-decoding-benchmark`).
  *Does NOT exist:* an online auto-selector. Partial, moderate value.
- **U11 — Dated enabling-condition ledger.** Nothing found. Low impact, high maintenance; HARD to keep.

**Verdict.** New categories open at **U1, U3, U4** and (with scoping) **U2**; **U5** is a partial gap.

---

## 3. Candidates (ranked: newly-possible × impact × feasibility)

### C1 — "SILICONFIT": a CPU task→model chooser with a license- and energy-aware Pareto frontier
1. **One-liner.** Give it (task examples, accuracy floor, license policy, this machine) → it returns
   the smallest model+quant+runtime that clears the floor, with measured joules/token and the
   rejected alternatives.
2. **Enabling condition + date/URL.** Qwen3 0.6/1.7B Apache-2.0 (2025-04-29), Gemma 3 270M/1B (2025-08-14),
   SmolLM2 (2024-11) + llama.cpp k-quants + model2vec CPU distillation (2024) + ONNX CPU int4.
   URLs in §1A/1B. **Old limit removed:** choosing a model required a GPU benchmark suite; now every
   candidate runs on the same laptop that will serve it.
3. **Existence check.** GPU leaderboards + academic edge-energy papers exist (URLs §2 U2); no
   *decision tool* exists. The gap is load-bearing because the number that matters to a CPU team
   (joules per correct answer on *their* silicon) is never published. Prior art is benchmark, not API.
4. **Who is unblocked.** Solo devs, classrooms (DeepForge!), regulated on-prem teams, IoT/edge shops.
   Network effect: each submitted `(device, model, quant, runtime, task, joules)` row makes the
   frontier better — a crowdsourced CPU leaderboard that doubles as a model registry.
5. **Architecture (CPU-only).** Python/TS driver invoking `llama-bench`/`llama-server` and ORT;
   task suite = frozen JSONL; model zoo = GGUF Q2_K…Q8_0 + ONNX int4; energy via `powermetrics`
   (macOS) / RAPL (Linux) / `powertop`, else latency×threads proxy; store results in SQLite,
   publish a signed JSON. No GPU anywhere.
6. **Stage-1 milestone.** 5 models × 3 quant levels × 2 runtimes on 3 tasks; produce one Pareto
   table with reproducible `run.json`; ~20–40 CPU-minutes total.
7. **Decisive first experiment.** Models: Qwen3-0.6B, Gemma-3-270M-it, SmolLM2-360M-Instruct,
   Phi-4-mini — GGUF Q4_K_M/Q8_0, runtime llama.cpp CPU. Task: frozen 300-item suite (BFCL-v3 simple
   + 200-item text-classification). Metric: selection regret vs oracle accuracy; joules/answer.
   **PASS:** on held-out tasks the chooser is within 5% of oracle accuracy at <25% of oracle compute
   on ≥80% of tasks. **FAIL:** regret >10% or run variance >20%.
8. **Risks.** Energy measurement noise; overfitting the suite; q4 quality cliffs differ per model
   (known: EMNLP-2025 shows SLM dynamics differ from LLMs); license data drifts.
9. **Grade: BREAKTHROUGH 10x+** (developer-time reduction) with a **NEW CATEGORY** artifact.

### C2 — "PARITYFORGE": cross-runtime answer-parity + quant-drift attestation
1. **One-liner.** One model id in; a signed report out: which runtimes agree, whether dropped
   answers come from quantization or from the backend, and which runtime is the outlier.
2. **Enabling condition + date/URL.** *The Silent Hyperparameter* (2026) proves backends diverge on
   identical weights (`https://arxiv.org/html/2605.19537v2`); GGUF conversion attestation prior
   (`ggufpacker`); HF Xet chunk hashes (2025-07-15); bitnet.cpp's lossless claim is the sharp test
   case (`https://arxiv.org/pdf/2410.16144`). **Old limit removed:** "same weights ⇒ same answers"
   was assumed; now it is known to be false and testable on CPU.
3. **Existence check.** ONNX has an *internal* LLaMA parity checker; `ggufpacker` attests
   *conversion*, not runtime; the paper measures but ships no tool. Cross-runtime, quant-vs-backend
   *attribution* does not exist. Load-bearing: an offline model that fails on one runtime is a silent
   safety/regulatory failure.
4. **Who is unblocked.** Anyone shipping a local model into another tool (llama.cpp→Ollama→ONNX).
   Network effect: a public "parity database" keyed by `(model sha256 × quant × runtime × version)`.
5. **Architecture.** Driver runs greedy decoding in ≥3 runtimes (HF transformers FP16 CPU reference,
   llama.cpp, ONNX Runtime CPU int4; optionally transformers.js), logs token ids + top-k logits on a
   frozen prompt set, computes token-disagreement rate and KL vs reference, attributes drift to quant
   by comparing fp16-vs-fp16 across engines; output = JSON + hash chain.
6. **Stage-1 milestone.** One 1B model, 2 runtimes, 500 frozen prompts, CPU-only; produces a report
   and one clean "the Q4 drift is quantization, not backend" verdict.
7. **Decisive first experiment.** Llama-3.2-1B-Instruct: HF FP16 vs llama.cpp FP16 vs llama.cpp
   Q4_K_M vs ORT int4; 500 frozen ARC-Easy prompts, 64 greedy tokens. Metric: disagreement rate vs
   FP16 reference; top-1 logit gap. **PASS:** fp16 cross-engine disagreement <0.5% **and** Q4
   disagreement ≥5% ⇒ attribution is real. **FAIL:** all pairs <1% ⇒ tool not load-bearing (downgrade).
8. **Risks.** Tokenizer/normalization differences confounding results; FP16 CPU reference is slow;
   results version-sensitive (llama.cpp churns daily) — must pin builds.
9. **Grade: NEW CATEGORY** (measurement→attestation infrastructure).

### C3 — "KNOWS-NOT": calibration / abstention profiler for quantized local models
1. **One-liner.** For a GGUF model on CPU, report ECE, risk-coverage curves, and a recommended
   "hand off to a human" threshold per quant level, plus a cheap temperature fix.
2. **Enabling condition + date/URL.** Gemma-3-270M task models (2025-08-14), Qwen3-0.6B (2025-04-29),
   bitnet.cpp lossless ternary (2024-10), *Quantized Can Still Be Calibrated* ACL 2025
   (`https://aclanthology.org/2025.acl-long.1473`), DPQ (2026, `https://arxiv.org/abs/2608.21019`).
   **Old limit removed:** uncertainty tooling assumed FP servers; on-device benchmarks
   (MobileAIBench/PalmBench/lm-Meter) report accuracy+latency only.
3. **Existence check.** Research proves the degradation and even a fix; no *shipped profiler* exists
   for local quantized models, and `lm-eval` reports task accuracy, not risk-coverage. Load-bearing:
   a local model that is confidently wrong is worse than one that abstains.
4. **Who is unblocked.** Local RAG, medical/legal offline assistants, browser extensions.
   Network effect: a per-checkpoint calibration badge ("abstains safely at coverage 0.8").
5. **Architecture.** Compute option/logit scores with llama.cpp (logits exposed), fit per-quant
   temperature via a held-out split, output ECE + AURCC + threshold; optional soft-prompt
   calibration as in the ACL paper. Pure Python + GGUF; minutes on CPU.
6. **Stage-1 milestone.** Two models × {Q8_0, Q4_K_M, FP16} × 1,000 MC items; emit one calibration
   report showing monotone degradation and that temperature scaling recovers ≥half the gap.
7. **Decisive first experiment.** Gemma-3-270M-it + SmolLM2-1.7B, ARC-Challenge 1,000 items (logit
   scoring), quants Q8_0/Q4_K_M vs FP16. Metric: ECE and AURCC. **PASS:** q4 raises ECE ≥1.5× and
   AURCC ≥3 points vs FP16 on ≥1 model, monotone, and temperature scaling cuts ECE ≥30%. **FAIL:** no
   monotone trend or fix fails ⇒ report as a negative result.
8. **Risks.** Logit extraction differences across runtimes (link C2); MC item contamination; ECE
   estimator variance; over-claiming "safety".
9. **Grade: NEW CATEGORY** (shipped tooling around an existing research result).

### C4 — "AICAPS": cross-platform on-device AI capability broker (TS)
1. **One-liner.** One TypeScript API that detects what on-device model exists (Chrome Prompt API,
   Edge, Apple FM, Windows ML, WebLLM, Ollama), declares a capability contract (structured output,
   tools, logits, context), and **refuses to silently degrade**.
2. **Enabling condition + date/URL.** Gemini Nano CPU support Chrome 140 (2025-10-01), Prompt API
   (2025-05-20), Edge on-device APIs (2025-05-19, `https://www.theverge.com/news/669528/...`), Apple
   FM (2025-06-09), Windows ML (2025-05-19), WebLLM (`2412.15803`). **Old limit removed:** an app
   had to pick one vendor runtime and one model tier; now ≥4 independent runtimes exist with no
   common contract.
3. **Existence check.** Vendor APIs + `aisuite` (chat providers) + Cactus (engine) exist; a
   *capability-negotiating* broker with a degradation contract does not. The vLLM device-capability
   RFC is CUDA-centric and was closed, confirming the abstraction is unsolved
   (`https://github.com/vllm-project/vllm/issues/40620`). Load-bearing: silent fallback changes
   output quality/schema — exactly the failure mode structured-output work warns about.
4. **Who is unblocked.** Web app authors, PWA/offline apps, this repo's browser assistant. Strong
   network effect: it is a "caniuse + polyfill + conformance" layer; runtimes want in.
5. **Architecture.** TS core with adapters; a declarative manifest of capabilities probed at runtime
   (`LanguageModel.availability()`, WebGPU adapter info, Apple native shim via a tiny Swift helper,
   `http://localhost:11434`); JSON-schema-enforced outputs; explicit `Unsupported` errors instead of
   fallback. No model weights shipped; no GPU required.
6. **Stage-1 milestone.** Adapters for Chrome Prompt API + WebLLM + Ollama behind one interface,
   with three shared tasks (summarize, extract-to-schema, classify) and a conformance report for the
   current machine.
7. **Decisive first experiment.** 200-task suite (summarize/extract/classify), run on the local
   machine's available engines; metric: % tasks completed under a declared capability floor, and
   schema-violation count. **PASS:** ≥90% completed with correct engine selection and **0** silent
   schema violations. **FAIL:** any silent violation, or <70% completion.
8. **Risks.** Chromium flags/instability; Apple FM needs native code (breaks pure-web claim);
   macOS-only local test rig; capability probes drift with browser versions.
9. **Grade: NEW CATEGORY** (interop layer), medium feasibility.

### C5 — "CELLWALL": offline capability-scoped agent sandbox for local small models
1. **One-liner.** Run an agent's generated Python with an explicit capability token (which files,
   which network, how long), deny-by-default, with a hash-chained audit log — entirely offline.
2. **Enabling condition + date/URL.** MCP 2025-06-18 OAuth resource-server model + RFC 8707 resource
   indicators + security best-practices (`https://modelcontextprotocol.io/specification/2025-06-18/changelog`,
   `.../2025-06-18/basic`); `smolagents` CodeAgent (~1k LOC) with tool calling
   (`https://github.com/huggingface/smolagents`); Ollama tool calling (2024-07-25). **Old limit
   removed:** code-executing agents needed a cloud sandbox (E2B/Modal) or Docker; a local, scoped,
   auditable sandbox is now expressible with protocol security primitives.
3. **Existence check.** `smolagents` sandboxes are E2B/Modal/Docker/Blaxel (cloud/daemon);
   Pyodide/WASM sandboxes exist for Python but are not a capability-token agent runtime; MCP gives
   the auth vocabulary, not the local executor. The combination is unbuilt. Load-bearing for
   "agent does real work on my laptop" safety.
4. **Who is unblocked.** Local-first assistants, DeepForge's own Pyodide worker, enterprise offline
   agents. Network effect via a shared capability-token schema/MCP alignment.
5. **Architecture.** Small model (Qwen3-4B GGUF via llama.cpp, tool-calling) → Python actions run in
   a WASM/Pyodide-in-Node or `nsjail`/`sandbox-exec`-style local jail; capability manifest checked
   per syscall category; append-only hash chain; no cloud.
6. **Stage-1 milestone.** One 50-task tool suite; agent = Qwen3-4B-Instruct GGUF; sandbox denies
   network + non-token paths by default; produce an audit log and a 10-prompt adversarial escape test.
7. **Decisive first experiment.** Qwen3-4B-Instruct (Q4_K_M, llama.cpp CPU), 50 tasks adapted from
   BFCL simple/parallel + local file ops, plus 10 adversarial prompts. Metric: task success AND
   escape count. **PASS:** **0** escapes and ≥60% success. **FAIL:** any escape.
8. **Risks.** Local sandboxes on macOS are leaky; small-model tool-calling reliability is low
   (τ-bench: gpt-4o <50% pass^1) — success floor may be unreachable; scope creep into OS security.
9. **Grade: PARTIAL GAP** (cloud-sandbox parts exist; local capability-scoped runtime does not).

---

## 4. Adversarial closing notes

- **Ranking logic.** C1 and C2 win because they need **no new model** — only measurement + packaging
  of conditions that already shipped in 2024–2026, and both run in minutes on a laptop. C3 is the
  strongest *conceptual* gap but depends on C2's logit plumbing. C4 has the largest network effect
  but the highest environmental volatility. C5 is the weakest novelty but the highest safety value.
- **What I could be wrong about.** (a) Absence claims are search-scoped, not proof; 0★ repos may be
  about to become real. (b) Browser/OS APIs marked "preview" may change before GA. (c) A Cactus-like
  product could already bundle C1/C4 under a commercial license. (d) Energy measurement on macOS is
  the weakest experimental leg of C1.
- **Explicit skips** (existence confirmed): ternary training toolkit (Falcon-Edge `onebitllms`),
  local PII (GLiNER-PII), model2vec distillation, JSONSchemaBench, mobile eval harnesses, MCP registry,
  HF Xet. Do not re-invent.
- **Suggested wave-48 order if the team builds:** C2 first (smallest, unlocks C3), then C1, then C3,
  then C4; C5 only with a security reviewer.
- **Total external lookups:** 46 search queries + ~120 URLs cited; no `webfetch` fallback needed
  because no 429 occurred. Dates quoted only where the source printed them.
