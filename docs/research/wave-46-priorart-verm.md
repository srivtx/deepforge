# Wave 46 — Prior-art attack on VERM (Verified Exact Recall Memory)

Scope: adversarial literature search against candidate 1 (`wave-46-candidates-d-architecture.md`).
One file only; no repo code; no git. Deliverable: prior-art attack, not a survey.
Method: ~35 queries across three providers (arXiv API, OpenAlex, Crossref) plus direct engine
probes. The `websearch` provider was rate-limited (HTTP 429) on every attempt and the arXiv API
throttled the tail, so the last queries were completed via OpenAlex/Crossref. Per instructions,
**no URLs and no publication dates** are asserted; works are identified by arXiv ID / venue name.
Nothing below is a claim about the world beyond "a search of these sources located / did not locate
this object."

---

## Verdict: KILL

**Which clause has no located match:** only clause (a) at *read granularity* survives — no located
work attaches a machine-checkable certificate to an **individual internal memory read of a model's
own store**, certifying that the read was exact and exclusive (attack target 6). Everything
supporting that sliver is already occupied: (b) replay-without-the-model and (c) third-party
checking are exactly what verifiable-inference systems already ship (zkLLM's zkAttn, NanoZK layerwise
proofs + commitment chain, VeriAttn, Jolt Atlas, and Merkle-based execution-trace auditing);
(d) test-time hard-addressed/parametric-slot memory is occupied by FwPKM and NTM/DNC; and the
category name "verifiable memory" is already taken by agent-memory systems (VMG, VerMem, Portable
Agent Memory, SuperLocalMemory 4.0). The survivor is not load-bearing: for a hard-addressed store the
"per-read certificate" is either *trivially* checkable (hash the addressed slot) or *requires*
whole-computation proofs that already exist — so VERM reduces to a **proof-boundary choice over
existing parts**, i.e. a composition. Under the wave's own honesty contract (`EXISTS means the
mechanism and the contract already exist; a mere composition is not a candidate`), VERM is EXISTS →
KILL. The "new category: verification-first memory" is not new; "verifiable memory" is a named,
publishing category already.

---

## Closest work

| Work | ID / venue | What it certifies | Clauses not done |
|---|---|---|---|
| zkLLM (zkAttn) | arXiv:2404.16109, CCS | Correctness of full LLM inference incl. attention arithmetic, zero-knowledge, hidden weights | per-read provenance; memory exactness; exclusivity/off-memory-zero; hard-addressed store (softmax) |
| NanoZK | arXiv:2603.18046, ICICS | **Layerwise** zk proofs; per-layer attention sub-circuit; SHA-256 commitment chain; third-party/auditable | read granularity; which stored item was touched; exactness; hard addressing |
| Lightweight cryptographic proofs of inference | arXiv:2603.19025, SaTML | Merkle-tree commitments over the execution trace; sampled path openings; replayable, third-party, soundness traded for efficiency | per-read semantics; address provenance; exactness/exclusivity |
| Jolt Atlas | arXiv:2602.17452 | zk proofs over ONNX tensor ops (matrix mult, softmax, SiLU); companion explicitly frames "trustless AI context (AI memory)" | per-read witness; hard addressing; exactness/exclusivity; still whole-op zk |
| VeriAttn | arXiv:2606.16352 | TEE-verified integrity of attention computation offloaded to GPU | provenance of reads; third-party without TEE trust; per-read witness |
| DSperse | arXiv:2508.06972 | Targeted zk verification of chosen subcomputations ("slices") | per-read semantics; address provenance |
| Portable Agent Memory | arXiv:2605.11032 | Content-addressable entries + **Merkle-DAG provenance graph**, tamper-evidence, capability access, cryptographic verification, cross-agent transfer | not a sequence core; certifies stored entries, not model-internal reads; no exactness/off-memory claim |
| SuperLocalMemory 4.0 | arXiv:2608.08253 | **Hash-chained audit trail**; verifiable memory transactions (apply/verify/compensate); hash-checkable completion manifests | external memory OS; per-transaction, not per-model-read; no attention/state binding |
| Infrastructure for… Verifiable Agent Memory | arXiv:2603.24564 | Binds memory artifacts to verifiable computational provenance; transferable | economic/protocol layer; not a model read |
| VerMem | arXiv:2608.03137 | Local verifier scores executable memory transitions + global verifier | verifiers used **only in training**; no third-party witness artifact; agent policy, not sequence core |
| Verifiable Memory Governance (VMG) survey | arXiv:2604.16548 | Names the category; five primitives for auditable memory; storage-time provenance, versioning | design space, not a mechanism; no per-read internal certificate |
| Audit Trails for LLMs | arXiv:2601.20727 | Lifecycle tamper-evident event ledger linking provenance to governance | not per memory read; governance-level |
| AttriBoT | arXiv:2411.15102, ICLR | Leave-one-out **context attribution** (approximate, post-hoc) | not machine-checkable/certified; not per-read; unfaithful under in-weight overlap |
| Context attribution & in-weight overlap | arXiv:2607.23804 | Shows attribution methods cannot disentangle in-context from in-weight contributions | *confirms* attention/attribution is not a sound witness (hostile, supports KILL) |
| FwPKM | arXiv:2601.00671 | Test-time **sparse product-key memory**, inference-time slot updates, 128K NIAH | no witness/provenance; accuracy axis only |
| NTM / DNC | arXiv:1410.5401 | Differentiable **soft**-addressed external tape | no hard address; no witness |
| Product Keys / Memory Layers at Scale | arXiv:1907.05242, arXiv:2412.09764 | Train-time parametric PKM, exact lookup at 128B | no test-time write; no witness |
| Proof-Carrying Numbers (PCN) | arXiv:2509.06902 | Claim-bound tokens; verifier in the renderer; fail-closed | certificate on **output tokens**, not internal memory reads |
| Towards Verifiable Text Generation w/ Evolving Memory | arXiv:2312.09075, EMNLP | Verifiable generation via memory + self-reflection | output-level; no per-read witness |
| ExecMesh / CAP provenance frameworks | Crossref posted-content | Cryptographically verifiable AI provenance for compliance/creative AI | provenance of content/model artifacts, not internal reads |

---

## Clause-by-clause

**(a) Per-read witness.** Closest: zkAttn (whole attention mechanism, hidden weights) and NanoZK
(layerwise attention sub-circuit + commitment chain) on the model side; Portable Agent Memory /
SuperLocalMemory (per-entry / per-transaction Merkle & hash-chain witnesses) on the store side.
Delta that would be new: a certificate bound to a **single read** that names the exact addressed
slot and binds the output to it. Status: **no exact match; nearest neighbors sit one level up
(whole layer) or one level out (external store)**. "new-known-partial."

**(b) Replayability without the model.** Closest: Merkle-tree execution-trace commitments with
sampled path openings (arXiv:2603.19025) and zk verifiers that check without weights (zkLLM,
NanoZK, DSperse). These already give a replayable, third-party-checkable witness of the internal
computation. Status: **EXISTS.**

**(c) Third-party checking.** Closest: zkSNARK verifiers, TEE attestation (VeriAttn), Merkle proofs
(Portable Agent Memory), hash-checkable manifests (SuperLocalMemory). Status: **EXISTS.**

**(d) Exact-recall memory as the substrate.** Closest: FwPKM (test-time sparse PKM with
inference-time updates), Hydra (PKM + dual memory), NTM/DNC (soft addressing), product-key memory
(train-time). The hard-addressed test-time exact-recall **mechanism** exists; the **witness** over it
does not. Status: **mechanism EXISTS, contract partial.**

**(e) Category name.** "Verifiable memory" already titles agent-memory works (arXiv:2608.03137,
arXiv:2608.08253) and a governance survey (arXiv:2604.16548). The claim "new category:
verification-first memory" is therefore factually crowded. Status: **EXISTS.**

---

## What the witness must certify (attack target 5, stated precisely)

A plain transformer + retrieval with logged top-k contexts already reconstructs *which chunks were
retrieved*; attention weights are not faithful (arXiv:2607.23804), so they are not a witness. The
VERM witness must certify, **per token**:

1. **Identity** — the exact slot index and a collision-resistant hash of the addressed key.
2. **Content binding (exactness)** — the returned value is bit-identical to the stored value; no
   interpolation/superposition.
3. **Transition** — the write/evict/edit delta and the resulting state hash (prev → new), replayable.
4. **Exclusivity** — the layer output is a function only of the addressed slot(s) plus local input,
   with exactly zero contribution from non-addressed memory and no parametric-memory override.

Retrieval logs give a coarse (1) at chunk granularity and none of (2)–(4). zk-attention gives
(3)–(4) for softmax attention but not hard-address identity/exactness. No located work gives
(2)+(4) at read granularity. **But this does not rescue the category:** for a hard-addressed store
(2) is *trivially* checkable by re-hashing the slot, and (4) is zk-over-everything-else, which
already exists. There is no non-trivial "per-read certificate" that is not one of those two already-
shipped objects. That is the kill.

---

## Strongest hostile argument, and whether it survives

**Hostile:** "Retrieval logs + attention weights already give you replay; this is a wrapper." The
stronger version: *a content-addressed store with Merkle-DAG provenance (Portable Agent Memory) +
a proof that the attention computation was executed (zkLLM zkAttn / NanoZK layerwise zk / Jolt
Atlas zkML over ONNX, explicitly marketed for 'trustless AI memory') + execution-trace commitments
(arXiv:2603.19025) reconstructs VERM's entire deliverable. VERM merely relocates the proof boundary
from 'whole layer/op' to 'per read'. No new capability is created; the read-level certificate is
either a hash (trivial) or a full-computation proof (existing).*

**Survival:** Conditionally, and only on clause (a)+(2)+(4): a verifier that never sees weights can,
from the witness alone, (i) recompute the slot from the key hash, (ii) confirm the returned value is
bit-identical to the addressed slot, and (iii) confirm via a state-transition binding that no
non-addressed memory influenced the token. No single located work does all three at read granularity.
**Verdict on survival: the argument does not kill (a) outright, but it kills the *category* claim.**
(a) is a gap; "verification-first memory as a new category" is not. Under the composition rule, that
is KILL.

---

## If KILL: best fallback among the wave-46 architecture candidates

**CSM (Certified State-Machine layer) is the fallback.** Reasons: (1) Its contract — a replayable
trace of discrete state transitions (an explicit group element per step) — is **not** occupied by the
verifiable-inference stack (that certifies arithmetic/linear algebra, not finite-state *semantics*)
nor by RWKV-7 (state tracking with no externally checkable trace). (2) The verification is cheap
and non-trivial in a way VERM's is not: checking `s ← g·s` for a group element is a real independent
check, not a re-hash, and does not require zk-over-the-network. (3) It is the least crowded of the
four candidates: CAC overlaps MoD/MoR/CALM heavily, HVA overlaps KV-eviction/retrieval, and VERM is
the one just killed. (4) It runs in the same ≤1h CPU budget on S5/parity/flip-flop with a fixed-depth
transformer baseline.

---

## Rescue conditions (what would flip KILL → GO-WEAK, and the one experiment)

If the team insists on defending VERM, the only defensible claim is the narrow one:
*"the first sequence core in which each token's memory access is a discrete, hard-addressed read/write
that emits a per-read witness; a verifier that never sees the weights can confirm slot identity,
bit-exact content binding, and exclusive/zero-off-memory contribution for that token."* This is a
**contract-level** claim, not a category-level one.

Smallest CPU experiment that would demonstrate a capability no transformer+retrieval baseline has:
- **Task:** synthetic certified-recall with **provenance disentanglement**. Store key→value in a
  hard-addressed store; separately ensure the base model has an *in-weight* (memorized) mapping from
  the same key to a **different** value. Query the key. A retrieval log shows the chunk was pulled,
  but the output may come from weights — indistinguishable to a logger.
- **Models:** VERM 3–15M params vs. equal-params transformer + external top-1/top-k retrieval
  (logged contexts), and a DeltaNet of equal params/FLOPs. PyTorch fp32 CPU.
- **Metric (capability, not accuracy):** (P1) witness replay-verify rate on every memory step = 100%;
  (P2) *source-attribution soundness* — a third-party verifier with only the witness and task spec
  (no weights) classifies whether the token's output came from memory or weights; pass ≥0.99 vs.
  retrieval-log baseline ≈ chance; (P3) exclusivity binding passes 100% (zero off-memory
  contribution). Floor: MQAR ≥95% exact recall at N=1024.
- **Pass/fail:** PASS iff P1=1.0, P2≥0.99, P3=1.0, floor met. **FAIL if the retrieval-log baseline
  also answers P2** — that proves the witness is moot, confirming KILL.
- **Budget:** ≤60 min CPU, no pretrained weights, no natural-LM SOTA.

**Is the survey's MQAR/copy stage-1 the right test?** No — it must be **replaced** as the primary
metric. MQAR/copy measure recall *quality*, which every SSM/linear-attention paper already reports;
they say nothing about verifiability. MQAR should be kept only as a floor/sanity check. The primary
Stage-1 must be the provenance-disentanglement + replay-soundness test above (this is exactly the
in-weight vs. in-context disentanglement that context-attribution methods are documented to fail,
arXiv:2607.23804). If the baseline passes that test, VERM's witness is a wrapper and the candidate
is dead.

---

## Query log (providers; failures noted)

arXiv API (`all:` searches): provenance∧attention∧retrieval; context attribution; verifiable
inference∧neural; retrieval∧provenance∧LM; zero-knowledge∧ML; verifiable retrieval; proof of
retrieval; audit trail∧LM; verifiable attention; attention∧zero-knowledge; content-addressed
memory∧neural; memory∧witness∧neural; neural Turing machine∧provenance (0 hits); product key memory;
multi-query associative recall; induction heads∧recall; proof-carrying∧ML; attention∧faithfulness∧
explanation; provenance∧attention∧firewall (0 hits); agent memory∧provenance; verifiable memory;
KV cache∧proof; attention∧certificate∧transformer (429); hard attention∧memory∧verifiable (429);
attention∧replay∧provenance (429).
OpenAlex (`title_and_abstract.search`): verifiable memory neural network; "verifiable memory";
"attention provenance"; "proof carrying machine learning"; "replayable memory neural"; "hard
attention associative recall" (0); "certificate memory read language model"; "trustless AI context
memory proof"; "provable attention retrieval provenance" (0).
Crossref (`query.bibliographic`): verifiable attention provenance certificate; proof of inference
neural network audit; Jolt Atlas verifiable inference memory.
Engine probe: `"provenance-attention firewall"` — no matching research object located (dictionary/
general results only); the named HPA mechanism as such was not found under that term.

Load-bearing sources fetched in full: zkLLM, NanoZK, VeriAttn, Jolt Atlas, arXiv:2603.19025,
Portable Agent Memory, SuperLocalMemory 4.0, VerMem, VMG survey, Audit Trails for LLMs, AttriBoT,
arXiv:2607.23804, FwPKM, product-key/memory-layer works, PCN, NTM, MQAR/induction-head lines.

**Residual uncertainty.** arXiv API throttling (429) blocked a final sweep aimed at finding a
strictly per-read internal certificate under other names (e.g. "certified attention", "memory
attestation"). If such a paper exists, VERM falls from GO-WEAK to KILL outright. On all evidence
located, the verdict stands: **KILL** (composition; category already named), fallback **CSM**.
