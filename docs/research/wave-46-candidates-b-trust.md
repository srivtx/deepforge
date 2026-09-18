# Wave 46 — Scientist B: making local-model output trustworthy *by construction*

Date: 2026-09-19. Scope: research survey only; one file; no product code touched.
Method: 22 `websearch` invocations (the provider rate-limited with HTTP 429 after the first
six; those six succeeded and the rest were retried and largely throttled) plus **19 distinct
arXiv API queries** and **13 direct source fetches** used as the substitute for the throttled
provider. All counts below are URLs + dates. The environment's clock is Sep 2026, so
2025–2026 sources are the live frontier.

**Honest headline.** The requested object — a *new architecture or mechanism that makes local
model output trustworthy by construction* — **does not exist as a single unified thing**, and
probably cannot exist in the strong sense, because open-domain truth has no cheap executable
oracle. But 2025–2026 produced a cluster of *near misses* that collectively define the exact
missing piece. Everything that exists certifies one of: syntax (constrained decoding), numeric
spans (Proof-Carrying Numbers), compute integrity (zkLLM — proves the model ran, not that it is
right), the deterministic scaffold *around* the model (Proof-Carrying Certificates for LLM
Pipelines), marginal population coverage (conformal), or a **learned** judge/NLI (which is
itself untrustworthy and reward-hackable). The real gap is the intersection: **a
generator-independent, deterministic, per-claim admission monitor for *factual* claims over a
frozen local evidence kernel, plus a trained "decidability gate" such that the neural net is
architecturally incapable of tagging its own output as certified.** The strongest candidate
below is a synthesis of four independently-published 2026 mechanisms that have never been
composed; I grade it *new architecture (borderline)* and I am adversarial about it.

Grading scale: **NEW CATEGORY** / **BREAKTHROUGH 10x+** / **NEW ARCHITECTURE** / **PARTIAL GAP** /
**EXISTS (skip)** / **HARD**.

---

## 1. Mandatory existence map (grouped; one line each, URL + date)

### 1a. Hallucination detection & uncertainty
- Semantic entropy (meaning-level entropy, AUROC ~0.79): Nature 2024-06-19, https://www.nature.com/articles/s41586-024-07421-0
- Semantic Entropy Probes (linear probe predicting SE from one hidden state): 2024-06-22, https://arxiv.org/abs/2406.15927
- Bayesian semantic-entropy estimator (53% fewer samples, useful at N=1): 2025-04-04, https://arxiv.org/abs/2504.03579
- Self-consistency decoding (marginalize sampled reasoning paths): ICLR 2023, https://arxiv.org/abs/2203.11171
- Conformal uncertainty in NLG (correctness coverage for black-box LLMs, ConU): 2024-07, https://arxiv.org/abs/2407.00499
- Selective conformal uncertainty (tests exchangeability; SConU): ACL 2025, https://aclanthology.org/2025.acl-long.934.pdf
- Logit-free conformal prediction (frequency+NE+SS; LofreeCP): EMNLP Findings 2024, https://doi.org/10.18653/v1/2024.findings-emnlp.54
- Conformal factuality via progressive "back-off" to less specific claims: 2024-02-15, https://arxiv.org/abs/2402.10978
- Non-exchangeable conformal generation (nearest-neighbor weighted CP): 2024-02-01, https://arxiv.org/abs/2402.00707
- Conformal-RAG (group-conditional factuality for sub-claims): SIGIR 2025, https://arxiv.org/abs/2506.20978
- IntroConformal (conformal risk control from introspective signals, LVLMs): 2026-09-01, https://arxiv.org/abs/2609.01375
- "LMs (mostly) know what they know" — P(True)/P(IK) self-evaluation + calibration: 2022-07, https://arxiv.org/abs/2207.05221
- Geometry of Truth (linear truth direction, mass-mean probes, causal steering): 2023-10, https://arxiv.org/abs/2310.06824
- Universal truthfulness hyperplane (diverse-data probe generalizes; 40+ datasets): EMNLP 2024, https://aclanthology.org/2024.emnlp-main.1012.pdf
- Abstention survey (query/model/values framework): TACL 2025, https://www.llwang.net/assets/pdf/2025_wen_abstention-survey_tacl.pdf
- AbstentionBench: abstention unsolved; **reasoning fine-tuning degrades abstention by 24%**: 2025-06, https://arxiv.org/abs/2506.09038
- LLM-as-judge calibration under overconfidence/dishonesty: COLING 2025, https://aclanthology.org/2025.coling-main.627.pdf
- Hallucination taxonomy + benchmark (HaluEval): EMNLP 2023, https://arxiv.org/abs/2305.11747

### 1b. Verifier-guided generation
- Process Reward Models that think (generative CoT verifiers, 1% of PRM800K labels): 2025-04, https://arxiv.org/abs/2504.16828
- GenRM (generative verifier via next-token prediction; 5%→45.3% algorithmic): 2024-08, https://arxiv.org/abs/2408.15240
- GenPRM (generative PRM with code verification + relative progress estimation): AAAI, https://ojs.aaai.org/index.php/AAAI/article/download/40797/44758
- Constrained decoding, subword-aligned (DOMINO): ICML 2024, https://proceedings.mlr.press/v235/beurer-kellner24a.html
- Grammar-aligned decoding / ASAp (constraints must not distort the distribution): NeurIPS 2024, https://arxiv.org/abs/2405.21047
- Inference from formal-language constraints via automata (provably correct, 7000x faster compile): 2024-07, https://arxiv.org/pdf/2407.08103
- Chain-of-Verification (CoVe; factored verification avoids repeating hallucinations): ACL 2024, https://aclanthology.org/2024.findings-acl.212/
- Citation/attribution via NLI over retrieved passages (VeriCite): SIGIR-AP 2025, https://arxiv.org/html/2510.11394
- Fine-grained interleaved reference–claim generation (RECLAIM, 90% citation accuracy): NAACL Findings 2025, https://aclanthology.org/2025.findings-naacl.55.pdf
- Self-verification **collapses**; sound *external* verification works ("just re-prompt with a verifier"): 2024-02, https://arxiv.org/abs/2402.08115
- Query complexity of verifier-assisted generation (a prefix verifier makes intractable generation tractable; backtracking helps): ICML 2025, https://proceedings.mlr.press/v267/botta25a.html
- Outcome-refining process supervision for code (executable verification replaces trained PRMs): 2024-12, https://arxiv.org/pdf/2412.15118

### 1c. Architectures with built-in verification / uncertainty
- Evidential Deep Learning (single-pass uncertainty): survey 2024-09, https://www.alphaxiv.org/abs/2409.04720
- EDL is a mirage as UQ — better understood as an energy-based OOD detector; needs model uncertainty/bootstrap: NeurIPS 2024, https://proceedings.neurips.cc/paper_files/paper/2024/file/c3177be226ee12e34d6ba3b5e6fe6a5b-Paper-Conference.pdf
- EDL epistemic uncertainty is relative, not absolute (identifiability/convergence issues): ICML 2024, https://proceedings.mlr.press/v235/juergens24a.html
- IB-EDL (information-bottleneck regularized evidential calibration): 2024, https://conftrace.com/papers/172159-calibrating-llms-with-information-theoretic-evidential-deep-learning
- Energy-based diffusion LM (full-sequence EBM for discrete generation): ICLR 2025, https://arxiv.org/abs/2410.21357
- "Spilled energy": reinterpret softmax as EBM; **training-free** energy-discrepancy detector beats probes: 2026-02, https://arxiv.org/html/2602.18671v4
- Mixture-of-Depths (learned token-level compute routing; causal at sampling): 2024-04, https://arxiv.org/abs/2404.02258
- Early-exit LLM training/inference at scale (EE-LLM, 3D parallelism): ICML 2024, https://proceedings.mlr.press/v235/chen24ae.html
- Test-time training for novel few-shot tasks (ARC 6x; matches average human when ensembled): ICML 2025, https://proceedings.mlr.press/v267/akyurek25a.html
- Test-time learning by input-perplexity minimization (TLM; +20% domain adaptation): ICML 2025, https://proceedings.mlr.press/v267/hu25z.html
- Label-free synergistic TTA (input perplexity + output entropy, 4 extra tokens): 2025-10, https://arxiv.org/html/2510.10223v1
- Verifier-driven TTT sample selection (VDS-TTT, 32% relative gain): 2025-05, https://arxiv.org/pdf/2505.19475
- Self-verifying refinement as compute-control policy (SVR): 2026-07, https://arxiv.org/abs/2607.28457
- Soft self-verification is prone to **reward inflation** from permissive self-judgments: 2026-05, https://arxiv.org/abs/2605.28561
- Self-verifying agents seek snapshot evidence (SmartSnap): 2025-12, https://arxiv.org/abs/2512.22322
- DSVD (dynamic self-verify decoding with rollback): 2025-03, https://arxiv.org/abs/2503.03149

### 1d. Formal / verifiable ML
- Certified adversarial robustness by randomized smoothing (tight ℓ2 certificate): ICML 2019, https://arxiv.org/abs/1902.02918
- Complete NN verification via bound propagation + per-neuron splits (β-CROWN, VNN-COMP winner): NeurIPS 2021, https://arxiv.org/abs/2103.06624
- zkLLM: first ZK proof **for** LLM inference (13B proof <15 min, <200 kB) — proves *computation*, not truth: CCS 2024, https://arxiv.org/abs/2404.16109
- Proof-Carrying Numbers (PCN): numeric spans bound to structured claims, verified in the **renderer**, fail-closed: 2025-09-08, https://arxiv.org/abs/2509.06902
- PCRLLM: proof-carrying single-step reasoning with explicit premises/rules/conclusions: 2025-11-11, https://arxiv.org/abs/2511.08392
- Proof-Carrying Certificates for LLM **pipelines** (Lean 4 kernel, trust-boundary around the deterministic scaffold): 2026-05-13, https://arxiv.org/abs/2605.16407
- PAGR: epistemic separation — learned geometry may rank evidence but cannot promote claims to certified truth (semiring provenance + sheaf): 2026-09-05, https://arxiv.org/abs/2609.06127
- Neuro-symbolic verification of LLM outputs (logic input check + embedding output check; still a learned output check): 2026-05, https://arxiv.org/abs/2605.26942
- Generator-independent runtime assurance: "simultaneous setwise soundness" is necessary+sufficient so safety decouples from the generator (bound Γ+Σε+η invariant under adversarial replacement): 2026-09-05, https://arxiv.org/abs/2609.06036
- Closed-world resolution against tool hallucination: proof that hallucination defense must precede any causal gate; registry+signature resolver: 2026-09-16, https://arxiv.org/abs/2609.19425

### 1e. Local / on-device
- Phi-3-mini (3.8B, phone-deployable, 69% MMLU): 2024-04, https://arxiv.org/abs/2404.14219
- Uncertainty-based SLM→LLM routing (1500+ settings; calibration data construction): 2025-02, https://arxiv.org/abs/2502.04428
- SLM trustworthiness: quantization preserves trust better than pruning; distill from a trustworthy teacher: IJCNN 2026, https://arxiv.org/abs/2608.11981
- Domain adaptation trustworthiness cost in 1–2B SLMs (Safety-DPO neutral; replay/merge raise HarmBench ASR): 2026-07, https://arxiv.org/abs/2608.00042
- Speculative decoding (verify-then-accept; exact output distribution, 2–3x): ICML 2023, https://arxiv.org/abs/2211.17192
- Byte-exact KV-cache grafting (SHA-256-identical logits; verified-knowledge flywheel): 2026-07, https://arxiv.org/abs/2607.14431
- INT8 quantization makes ARM edge inference dispatch-invariant / bit-exact: 2026-07, https://arxiv.org/abs/2607.23227
- Model lineage attestation via knowledge-evolution trajectory (USENIX Sec 2026): 2026-01, https://arxiv.org/abs/2601.11683
- Self-attestation for *hardware* (TinyML autoencoders in TEE; not model output): 2026-03, https://arxiv.org/abs/2603.19727

### 1f. Benchmarks / behaviour
- TruthfulQA (817 questions; larger models *less* truthful; 58% vs 94% human): ACL 2022, https://arxiv.org/abs/2109.07958
- SimpleQA ("know what you know"; correct/incorrect/not-attempted): 2024-11-07, https://arxiv.org/abs/2411.04368
- HaluEval: EMNLP 2023, https://arxiv.org/abs/2305.11747
- Long-form factuality + SAFE (search-augmented evaluator): NeurIPS 2024, https://arxiv.org/abs/2403.18802
- Factual **generation–verification gap** traced through training phases; updates create "multi-verse" states: 2026-05, https://arxiv.org/abs/2605.27564
- Self-improvement is governed by a generation–verification gap that scales with pretraining FLOPs: ICLR 2025, https://arxiv.org/abs/2412.02674
- Verifiable by construction (clinical verbatim citation): 98% of claims get a verbatim quote but **only 37.1% are fully substantiated**: 2026-09-14, https://arxiv.org/abs/2609.15964
- Evidence-sufficiency boundary training for selective answering (abstain→answer transition supervised): 2026-09-01, https://arxiv.org/abs/2609.01687
- Graph-agentic RAG "assurance by construction" via interface contracts: 2026-09-06, https://arxiv.org/abs/2609.06391
- RAG hierarchical consistency audit **explicitly "does not certify factual truth"**: 2026-09-07, https://arxiv.org/abs/2609.07075

---

## 2. The precise gap (what none of the above is)

Read the map adversarially. Each family certifies something adjacent but not the target:

1. **Detection ≠ construction.** Semantic entropy, probes, spilled energy, EDL, conformal:
   these *rank* or *cover*; the model can still emit the false claim, only now with a score.
2. **Syntax/integrity ≠ truth.** Constrained decoding guarantees parseability; zkLLM and
   proof-carrying pipelines guarantee the *computation happened as declared*. A perfectly
   proven inference can be false.
3. **Verifiers are learned and therefore untrustworthy.** GenRM/PRM/LLM-judges are neural;
   they reward-hack (2605.28561) and collapse under self-verification (2402.08115).
   Attribution/NLI checks (VeriCite, RECLAIM) inherit this.
4. **Conformal gives marginal, exchangeable, population-level coverage**, not a per-claim
   guarantee, and exchangeability is routinely violated in generation (SConU; Conformal-RAG
   caveats).
5. **The one genuinely generator-independent theory exists only for safety, not truth.**
   Setwise runtime admission soundness (2609.06036) and closed-world resolution (2609.19425)
   make admission *independent of the generator* — but only where a cheap deterministic oracle
   exists (viability of an action; existence of a tool). **Factual claims have no such oracle.**
6. **Verbatim citation is not substantiation.** The clinical result (2609.15964) is the
   sharpest evidence: a deterministic string-containment check passes 98% of claims while only
   37.1% are actually entailed. String/copy checks are therefore *provably insufficient*.

**Therefore the missing mechanism is:** a way to *manufacture* a cheap, deterministic oracle for
a **delimited** factual domain so that the generator-independent admission-soundness theory
applies to *claims*, plus a model-side training signal (a **decidability gate**) that makes the
net emit only claims the oracle can decide, and fail closed (UNPROVEN, not confident) otherwise.
The oracle is a **frozen, content-addressed local evidence kernel** coupled to a **deterministic
entailment relation**. This composes four 2026 pieces that have *never been composed*, and it is
the only route I found to real "by construction" for local models.

---

## 3. Candidates (ranked by missing × impact × CPU feasibility)

### Candidate 1 — CK-GIAM: Claim-Kernel with a Generator-Independent Admission Monitor
**Grade: NEW ARCHITECTURE (borderline; known pieces + an unprecedented composition).**

1. **One-liner.** A local SLM is factored into a *claim-program* head and an *NL-realization*
   head; claims are expressed over a frozen, content-addressed **evidence kernel** and are
   admitted to the natural-language output only when a **deterministic, model-free monitor**
   discharges them against the kernel. The monitor — not the model — stamps CERTIFIED; everything
   else renders through a visibly separate UNPROVEN channel (fail-closed).

2. **Exists / does-not-exist.** Exists: closed-world resolution for tools (2609.19425, 2026-09);
   generator-independent admission soundness theory (2609.06036, 2026-09); numeric proof-carrying
   (PCN, 2509.06902, 2025-09); claim decomposition + logic solvers (Logic-LM, 2305.12295, 2023-05);
   epistemic separation "learned geometry cannot promote to truth" (PAGR, 2609.06127, 2026-09);
   neuro-symbolic output verification using a *learned* semantic check (2605.26942, 2026-05).
   **Does not exist:** a *deterministic* entailment relation over a *frozen local kernel* for
   general factual claims, jointly trained with a decidability gate, with fail-closed admission and
   a third-party-checkable proof term. Every existing "verifiable by construction" scheme either
   checks strings (2609.15964) or uses a neural judge.

3. **Who hurts / what becomes safe.** On-device assistants in offline, high-stakes or
   privacy-bound settings (clinical triage, benefits eligibility, field/battlefield repair,
   regulated finance, air-gapped labs). Today those users either ship cloud calls or accept an
   SLM whose *every sentence is unverifiable*. If this works, an SLM answer is *either*
   accompanied by a machine-checkable substantiation term *or* explicitly marked unverified —
   which is a policy-usable guarantee, not a score.

4. **Why now.** (a) 3.8B models run on phones (Phi-3, 2404.14219, 2024-04) and 1.5–3B Qwen/
   Gemma run on CPU; (b) structured/constrained decoding is now fast and distribution-faithful
   (DOMINO ICML 2024; ASAp NeurIPS 2024); (c) the generator-independence theory for runtime
   admission was only published 2026-09 (2609.06036) and the closed-world result 2026-09
   (2609.19425); (d) the failure of copy-level "verifiable by construction" is now quantified
   (2609.15964, 2026-09); (e) offline corpora (guidelines, maintenance manuals, product specs)
   fit on disk and can be compiled once and hashed.

5. **Architecture sketch.**
   - `E`: frozen evidence kernel = set of typed atomic assertions `(subject, relation, object,
     qualifier*, source_span_hash)`, plus a derivation index. Compiled once, versioned, hashed.
   - `G`: local SLM with a factored head — stream `c` = a typed claim program over `E`'s
     vocabulary and a small fixed connective set; stream `r` = NL text. `r` is emitted by a
     renderer `R` that is callable only after admission.
   - `g`: **decidability gate** (tiny classifier over `G`'s hidden state) trained with:
     (i) a *decidability loss* penalizing any claim program `M` cannot decide; (ii) an explicit
     `UNPROVEN` action; (iii) a *false-certified* penalty applied only when `M` certifies but the
     held-out semantic label disagrees (much rarer and cheaper than a hallucination label).
   - `M`: deterministic monitor `M(E, c) → ProofTerm | UNPROVEN`; proof term lists kernel
     assertions + rule applications. CPU, no weights.
   - Training: SFT on (query → claim program) pairs auto-generated by compiling a larger model's
     output against `E`, then DPO/GRPO with the decidability + false-certified rewards.
   - Cost: `G` 1.5–3.8B at 4-bit ≈ 1–2.5 GB; `g` ~1M params; `M` pure Python/Rust; `E` on disk
     (10k–1M assertions). Inference overhead = one extra gate pass + monitor (ms).

6. **Stage-1 CPU milestone.** `Qwen2.5-1.5B-Instruct` or `Phi-3-mini` (GGUF q4) via llama.cpp;
   kernel `E` compiled from one frozen public corpus (e.g. a clinical guideline + a subset of
   SimpleQA facts with attached evidence); target `<2 s` per answer on an M-series CPU.
   **Non-goals:** open-domain free facts, arithmetic/commonsense not in `E`, multi-hop synthesis,
   multilingual, model-generated knowledge.

7. **Decisive first experiment (<1 h CPU).** 200 short factual questions from SimpleQA/
   TruthfulQA. Measure: (a) **certified precision** = fraction of CERTIFIED claims that are
   entailed under the frozen held-out labels — this is a *mechanical soundness* gate; (b)
   **certified coverage**; (c) monitor latency; (d) proof-check reproducibility from the artifact
   alone. **Pass/fail (frozen):** (a) 100% certified precision over 10k adversarial paraphrases
   (any unsound admission = fail-closed bug → kill); (b) coverage ≥ 25%; (c) median monitor
   < 50 ms; (d) byte-identical proof verification on a second machine.

8. **Risks / why it may fail.** Kernel compilation is model-mediated — errors in `E` are
   *systematic* (they poison the guarantee for a whole topic), unlike per-query noise; the only
   honest mitigation is audit + hashing + treating kernel build as a separate verified step.
   Coverage may collapse to trivia that is already in `E` (the method may add little for
   reasoning). The decidability gate may trade away fluency, and `UNPROVEN` may dominate.
   Claims needing arithmetic, comparison, or implicit commonsense are out of scope, which may be
   most real queries. **Honest self-test:** a reviewer will call this "Logic-LM + constrained
   decoding + provenance + a fail-closed renderer." The genuine deltas are (i) a *trained*
   decidability gate and (ii) a *deterministic, generator-independent* admission monitor for
   factual claims. If those two are not shown to change behavior measurably, this collapses to a
   wrapper.

9. **Verdict.** Fund only the Stage-1 soundness/coverage experiment; treat "coverage ≥25% with
   100% mechanical precision" as the kill switch.

---

### Candidate 2 — PQA: Per-Query Capability Attestation ("the model must pass a hidden exam first")
**Grade: NEW MECHANISM (moderate); the most genuinely novel of the four.**

1. **One-liner.** Before a local model may emit a *certified* answer, it must pass a
   machine-generated, kernel-graded **micro-exam conditioned on the exact knowledge/operations
   the query needs**; failure forces abstention. The exam is generated from the kernel and
   graded deterministically, so the model never grades itself.

2. **Exists / does-not-exist.** Exists: self-verification collapses while *external* verification
   works (2402.08115, 2024-02); verification is learned **before** generation and is more robust
   to continual learning (2605.27564, 2026-05); generation–verification gap governs
   self-improvement (2412.02674, ICLR 2025); evidence-sufficiency boundary training supervises
   the abstain→answer transition (2609.01687, 2026-09); self-verifying compute control (SVR,
   2607.28457, 2026-07); calibration probes predict correctness from one hidden state (SEP,
   2406.15927). **Does not exist:** a *query-conditioned, deterministically-graded attestation
   exam* used as an admission gate, with the training objective that the model abstains exactly
   when it would fail.

3. **Who hurts / becomes safe.** Anyone who needs evidence that the model *actually knew this*
   before it answered — auditors, clinicians, teachers, self-driving-field robotics. Becomes
   safe: a "passed attestation" badge per answer, with the exam and answers attached.

4. **Why now.** The generation-verification gap is now a measured, training-phase phenomenon
   (2605.27564), and small models' calibration is measurable on CPU (SEP). Kernel-graded probe
   generation is cheap. This is the first moment the theory and the compute line up.

5. **Architecture sketch.** `Γ(query, E) → {(probe_i, answer_i)}` where each probe has a unique
   kernel-decidable answer (isolation of the knowledge/operation the query requires). `G`
   answers all probes; `M` (Candidate 1's monitor) grades. Admission iff all probes pass.
   Training: reward = 1[correct answer] − λ·1[certified but exam-failed] with abstention allowed;
   the policy learns to abstain when its own exam would fail. Params/compute: same order as C1.

6. **Stage-1 CPU milestone.** 1.5B model; 200 SimpleQA items; k = 4 probes/item; all CPU.
   **Non-goals:** verifying *reasoning* validity, open-domain claims, cross-lingual transfer.

7. **Decisive first experiment (<1 h).** AUC of "exam failure" predicting "final answer wrong"
   (want ≥ 0.8); false-certified rate (want ≤ 2%); coverage (want ≥ 20%); average extra probes.
   Pass/fail frozen before the run.

8. **Risks.** The exam may be too easy (no signal) or too hard (always abstain); correlation is
   not causation; `Γ` is itself a generator and could leak the answer into the probe. Mitigation:
   `M`, not `Γ`, computes probe answers.

9. **Verdict.** Worth a 1-hour shot precisely because it is unusual; if AUC < 0.7 it is dead.

---

### Candidate 3 — HPA: Hard Provenance-Attention Firewall with an auditable mask certificate
**Grade: PARTIAL GAP (risky; likely a mask, not a guarantee).**

1. **One-liner.** A transformer variant with two disjoint KV memories (`grounded` = frozen
   evidence; `prior` = parametric), where the certified output stream *architecturally* cannot
   attend to `prior`; the attention-mask invariant is externally auditable.
2. **Exists / not.** Retrieval attention, copy mechanisms, and constrained decoding exist; no
   "knowledge firewall" surfaced. What does not exist is an *auditable unconditional mask
   invariant*. But a mask is at best a *necessary* condition: attending to evidence is not
   entailment, so this cannot be "by construction" for truth.
3. **Hurts.** Users who fear parametric leakage (hallucinated facts not in the document).
4. **Why now.** Sparse/structured attention and byte-exact architectures (2607.14431) make hard
   masks practical.
5. **Sketch.** Dual KV, per-head mask, static analyzer emits a mask-certificate hash. Low cost.
6. **Stage-1.** 1–3B model, grounded QA, CPU.
7. **Experiment.** Leakage rate of parametric-only facts into the certified stream (want 0 by
   mask audit) + fluency cost. Pass/fail on leakage = 0 and quality within 5%.
8. **Risks.** Hard masks destroy fluency; soft attention leaks; "no attention path" is not "no
   influence" (residual streams, MLPs).
9. **Verdict.** Only as a *component* of C1, never as the guarantee.

---

### Candidate 4 — Local non-exchangeable conformal claim ledger (REJECT: EXISTS)
1. **One-liner.** Per-claim, continuously-audited conformal p-values on-device with an
   exchangeability monitor.
2. **Prior art kills it.** Conformal factuality (2402.10978), non-exchangeable CP (2402.00707),
   Conformal-RAG (2506.20978), SConU (ACL 2025), COFT (ICML 2026), BalanceRAG (2026-05),
   IntroConformal (2609.01375). The only delta is "on-device + a ledger"; packaging.
3. **Verdict.** **EXISTS (skip).** No experiment.

---

## 4. Considered and killed (one line each, with URLs)

- **Semantic entropy / probes / spilled energy** — mature detectors, not constructions: https://www.nature.com/articles/s41586-024-07421-0 (2024-06-19), https://arxiv.org/abs/2406.15927 (2024-06-22), https://arxiv.org/html/2602.18671v4 (2026-02).
- **Conformal prediction for LLMs** — marginal coverage only, exchangeability-dependent; EXISTS: https://arxiv.org/abs/2402.10978 (2024-02-15), https://arxiv.org/abs/2506.20978 (2025-06).
- **Evidential deep learning** — cannot support per-claim epistemic truth; proven mirage for UQ: https://proceedings.neurips.cc/paper_files/paper/2024/file/c3177be226ee12e34d6ba3b5e6fe6a5b-Paper-Conference.pdf (NeurIPS 2024).
- **zk / proof-of-inference** — integrity, not truth; EXISTS: https://arxiv.org/abs/2404.16109 (CCS 2024).
- **Proof-carrying Numbers / reasoning / pipelines** — numeric, stepwise-logical, or scaffold-level; not general factual claims on-device: https://arxiv.org/abs/2509.06902 (2025-09-08), https://arxiv.org/abs/2511.08392 (2025-11-11), https://arxiv.org/abs/2605.16407 (2026-05-13).
- **Closed-world tool resolution** — solves *tool existence*, not factual truth; EXISTS: https://arxiv.org/abs/2609.19425 (2026-09-16).
- **Generator-independent runtime assurance** — only for safety/viability with a cheap oracle; the theory to reuse, not the object: https://arxiv.org/abs/2609.06036 (2026-09-05).
- **Verbatim "verifiable by construction"** — 98% quotes vs 37.1% substantiation proves copy-checks insufficient: https://arxiv.org/abs/2609.15964 (2026-09-14).
- **Neuro-symbolic output verification** — output check is a learned embedding similarity, i.e. untrustworthy: https://arxiv.org/abs/2605.26942 (2026-05).
- **Graph-agentic RAG assurance-by-construction** — interface contracts, not a truth guarantee: https://arxiv.org/abs/2609.06391 (2026-09-06).
- **RAG consistency auditing** — explicitly does not certify truth: https://arxiv.org/abs/2609.07075 (2026-09-07).
- **PRMs / GenRM / generative verifiers** — learned verifiers, reward-hackable: https://arxiv.org/abs/2408.15240 (2024-08), https://arxiv.org/abs/2504.16828 (2025-04).
- **Self-consistency / CoVe / self-verification** — self-verification collapses without an external sound verifier: https://arxiv.org/abs/2203.11171 (ICLR 2023), https://aclanthology.org/2024.findings-acl.212/ (ACL 2024), https://arxiv.org/abs/2402.08115 (2024-02).
- **Constrained / grammar-aligned decoding** — guarantees syntax or distribution-fidelity, not factuality: https://arxiv.org/abs/2405.21047 (NeurIPS 2024), https://proceedings.mlr.press/v235/beurer-kellner24a.html (ICML 2024).
- **Mixture-of-Depths / early exit / adaptive compute** — efficiency mechanisms with confidence, not trust: https://arxiv.org/abs/2404.02258 (2024-04), https://proceedings.mlr.press/v235/chen24ae.html (ICML 2024).
- **Test-time training/adaptation** — improves domain accuracy; no soundness: https://proceedings.mlr.press/v267/hu25z.html (ICML 2025), https://arxiv.org/html/2510.10223v1 (2025-10).
- **Certified robustness / randomized smoothing / β-CROWN** — guarantees about input perturbations, orthogonal to truth: https://arxiv.org/abs/1902.02918 (ICML 2019), https://arxiv.org/abs/2103.06624 (NeurIPS 2021).
- **Speculative decoding** — exact-distribution speedup, not verification of correctness: https://arxiv.org/abs/2211.17192 (ICML 2023).
- **Model lineage attestation / bit-exact KV graft / INT8 dispatch invariance** — provenance & reproducibility, not truth: https://arxiv.org/abs/2601.11683 (2026-01), https://arxiv.org/abs/2607.14431 (2026-07), https://arxiv.org/abs/2607.23227 (2026-07).
- **SLM trust benchmarks / routing / domain-adaptation trust costs** — evidence and tooling, not a mechanism: https://arxiv.org/abs/2608.11981 (2026-08), https://arxiv.org/abs/2502.04428 (2025-02), https://arxiv.org/abs/2608.00042 (2026-07).
- **Per-claim conformal ledger** — composition; see Candidate 4.
- **Self-attestation for hardware/TEE** — attests firmware, not model output: https://arxiv.org/abs/2603.19727 (2026-03).

---

## 5. Recommendation to the wave

Fund **Candidate 1** for exactly one CPU experiment whose kill switch is mechanical: *100%
certified precision over 10k adversarial paraphrases AND ≥25% certified coverage*. If certified
precision is not mechanically 100%, the architecture is a wrapper and must be killed. In parallel
(cheap, orthogonal) run **Candidate 2**'s exam-failure AUC; if AUC < 0.7 it dies. **Candidate 3**
only ever enters as a component of C1. **Candidate 4 is already published** — cite, do not build.

The honest fallback if C1's coverage collapses: state the negative result — that
generator-independent admission soundness is achievable for *safety* and *existence* but not for
open-domain truth, and that the correct product posture is fail-closed abstention over a delimited
evidence kernel, not a claim of general trustworthiness. That negative result is itself valuable
and is the boundary the next wave should attack.
