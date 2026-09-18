# Wave 47 — Prior-Art Attack + Feasibility: Cross-engine CRDT convergence gateway (C1)

Date: 2026-09-19. Scope: adversarial prior-art + feasibility only. One file; no code; no git.
Candidate under attack: `wave-47-candidates-b-network.md` §C1 — a canonical sync envelope + per-engine
adapters so two apps on *different* CRDT engines (Yjs / Automerge / Loro) can co-edit one document and
converge ("SMTP for local-first data").

**Coverage honesty.** `websearch` returned HTTP 429 on **all** calls (4/4). arXiv API was 429-throttled
after ~1 request; OpenAlex 429 (budget exhausted); Semantic Scholar intermittent; dblp timed out. Working
substitutes: **arXiv web search UI**, **Crossref API**, **GitHub Search API**, **npm registry**, and
**~20 direct source fetches** (braid.org, IETF drafts, raw READMEs, spec pages). Every factual line below
has a URL; dates are from the source or the npm/GitHub API row. Environment clock is Sep 2026.

---

## Verdict

**KILL** — as scoped (a general cross-engine convergence gateway / "SMTP for CRDTs"). The load-bearing
clause *"no published interchange format, adapter, or gateway that translates and merges between engines"*
**has a located match: Braid.** Braid (https://braid.org/, accessed 2026-09-19) is a standing "Working Group
for Interoperable State Synchronization" — an interchange layer any synchronizer's messages translate
into, with a ShareDB(OT)↔Sync9(CRDT) "babelfish" and an explicit Automerge compatibility mapping. Its
IETF draft (draft-toomim-httpbis-braid-http-04; last revision 2023-11-18, updated 2024-05-22) is *expired*,
but the project is live (repo pushed 2026-03-05; `braid-http` npm 1.5.1, registry modified 2026-09-11).

The clause that has **no** located match is the *narrow* one: a library-level Yjs↔Automerge **adapter pair +
randomized interleaving convergence harness**. That residual is real but not load-bearing: in the only
regime where convergence holds with both engines used as-is (engine-independent merge functions: LWW
registers, counters, sets), no CRDT-semantics translation happens at all — it is a canonical op-log, which
is exactly what Braid/JSON-CRDT already are. In any regime where the engines' merge functions differ
(lists/rich text), convergence requires both sides to *implement the gateway's merge function* (Braid's
Merge-Type condition), at which point the engines are demoted to containers and the artifact is no longer
cross-engine interop. No impossibility theorem was located (arXiv "CRDT interoperability" = 0 results;
"CRDT morphism" = 0), so the honest statement is "no semantics-preserving general translation is
warranted," not "proven impossible."

**Fallback (if the team wants a defensible artifact):** stop claiming a new category. Either (a) register a
concrete **Braid Merge-Type profile + adapters and join Braid** (be a contributor, not a competitor), or
(b) pivot to **C2** (browser-verifiable partial distribution), whose novelty is not occupied by an active
working group.

---

## 1. Query log (condensed; 40+ distinct probes)

**websearch (all 429):** CRDT interoperability cross-engine; "universal CRDT" interchange; Yjs↔Automerge
converter; impossibility of generic CRDT translation.

**arXiv (API + web UI):** `CRDT interoperability` → **no results**; `"replicated data types"
interoperability` → **1** result (arXiv:2301.04391, Grassroots Systems, DISC 2023); `CRDT translation` → 0;
`heterogeneous CRDT` → 0; `CRDT morphism` → 0; `CRDT impossibility convergence` → 0; `operational
transformation CRDT unified` → 0; plus CRDT/convergence/merge-function variants.

**GitHub Search:** `CRDT interoperability` (top: `rtibbles/delta-crdt`, 5★, pushed 2020-05-23);
`yjs automerge`; `universal CRDT`; `CRDT bridge`; `CRDT interop`; `automerge loro`; `cross-engine CRDT`;
`CRDT adapter`; `braid automerge`; `babelfish CRDT`; `crdt interoperate`; `willow protocol crdt`;
`electric-sql sync`; `nextgraph crdt`; `jazz tools sync`; `keyhive beelay`; `matrix state resolution`;
`crdt content-addressed op log`.

**Crossref:** interleaving anomalies; real differences OT/CRDT; replicated data type specification and
verification; CRDT morphism; impossibility strong eventual consistency; CRDT survey.

**Direct fetches:** braid.org; braid.org/automerge; braid-spec (braid-http-04, merge-types-00,
versions-03, range-patch-01); reference-crdts README; Automerge binary-format spec; Yjs README; Loro README;
Willow specs index; npm registry (`yjs`, `@automerge/automerge`, `loro-crdt`, `automerge`); IETF datatracker.

---

## 2. Closest-work table

| Work | Venue / Year | URL | What it does | Clauses not done |
|---|---|---|---|---|
| **Braid protocol / working group** | braid.org, 2019→2026 | https://braid.org/ ; https://github.com/braid-org/braid-spec | Engine-neutral state-sync layer: Versions, Patches, Subscriptions, **Merge-Types**; maps Automerge changes to Braid patches; ShareDB(OT)↔Sync9(CRDT) "babelfish" | No CRDT↔CRDT adapter pair; babelfish "does not handle cases where the two synchronizers resolve conflicts with a different sort order"; no canonical op envelope lib |
| **Braid Merge Types** (I-D) | draft-toomim-httpbis-merge-types-00, 2019-11-18 | https://raw.githubusercontent.com/braid-org/braid-spec/master/draft-toomim-httpbis-merge-types-00.txt | Defines Merge-Type registry/function; states convergence requires both sides implement the **same** Merge Type | The condition itself shows general translation is not semantics-preserving; no translator |
| **reference-crdts** | Joseph Gentle, 2021 (repo pushed 2023-12-01), 142★ | https://github.com/josephg/reference-crdts | Yjs, Automerge, Sync9 **list** types in one codebase, order-matching each real engine | No wire-format translation, no gateway, no convergence harness; "not load bearing" |
| **Automerge binary format spec** | A. Good, A. Jeffery, draft | https://automerge.org/automerge-binary-format-spec/ | Documents Automerge's columnar change/op encoding | Format only; no Yjs/Loro interchange |
| **Yjs update + Yrs** | Yjs 13.6.32, 2026-08-04 | https://github.com/yjs/yjs | YATA CRDT, binary V2 updates + state vectors; cross-language within Yjs | Own format; no foreign-engine interop |
| **Loro 1.0** | Loro 1.16.1, 2026-09-10 | https://github.com/loro-dev/loro | Fugue + Peritext + movable list; own binary format | Credits Yjs/Automerge; no import/export bridge |
| **Willow** | specs, accessed 2026-09-19 | https://willowprotocol.org/specs/index.html | Engine-neutral **Data Model** + Meadowcap + Confidential Sync | Not an engine translator; no Yjs/Automerge adapters |
| **delta-crdt / ds-crdt-interop** | 2020-05-23 / 2024-09-01 | https://github.com/rtibbles/delta-crdt ; https://github.com/dozyio/ds-crdt-interop | Interoperable *Delta-CRDT* impls; js↔go interop tests | Same CRDT across languages, not across engines |
| **homeostate / abyo-crdt** | 2026-09-14 / 2026-05-07 | https://github.com/mixedrays/homeostate ; https://github.com/abyo-software/abyo-crdt | Adapters over Yjs/Loro/**Automerge** (one engine at a time); one-way Yjs-format import into Rust CRDT | No cross-engine merge; no convergence guarantee |
| **Theory** | PaPoC 2019 / PACM HCI 2020 / JPDC 2018 / POPL 2014 | doi:10.1145/3301419.3323972 ; doi:10.1145/3375186 ; doi:10.1016/j.jpdc.2017.08.003 ; doi:10.1145/2535838.2535848 | Interleaving anomalies; OT vs CRDT differences; delta-state CRDTs unify op/state-based; CRDT spec/verification | None formalizes cross-engine translation or proves impossibility |

---

## 3. Obstacle analysis

**Same op model (trivially compatible).** Types whose merge function is engine-independent: LWW registers
(if timestamp+actor tie-break is carried), grow-only/PN counters, 2P/grow-only sets. Here a gateway is just
a signed op-log; both engines converge because the *canonical* rule is applied, not because the engines'
rules agree. Braid reaches the same conclusion by design: a Merge Type is a function peers must share
(merge-types-00 abstract). The engines' internal CRDTs are bypassed.

**Not compatible.** Yjs (YATA: `clientID`+`clock` ids, `originLeft`/`originRight`, optional GC of deleted
items — https://github.com/yjs/yjs), Automerge (op-based, Lamport timestamps, `pred`/successors, columnar
encoding, "successors and omitting deletes" compaction — https://automerge.org/automerge-binary-format-spec/),
Loro (Fugue + Peritext + movable list — https://loro-dev/loro). Different position identifiers, tie-break
rules, tombstone/GC policy, and move semantics. `reference-crdts` makes this concrete: one codebase can host
all three *integration functions*, but each is a distinct variant, and the repo explicitly omits encoding/
decoding — i.e., the algorithms are reconcilable only by reimplementing them, not by translating updates.

**What the gateway must guarantee.** (1) a single shared merge function/Merge-Type; (2) causal readiness
(deps before relay); (3) idempotence by envelope hash; (4) tombstone preservation, else declare the type
non-interchangeable; (5) a translation that is a *homomorphism* of each engine's join-semilattice into the
canonical one and back. No located work defines CRDT morphisms across engines; (5) is unmet because the
join operators differ.

**Impossibility results found.** None. arXiv "CRDT interoperability", "CRDT morphism",
"operational transformation CRDT unified" all return **0**; Crossref/S2 surface no theorem. Nearest
constraints are conditional, not impossibility: Braid's same-Merge-Type condition; interleaving anomalies
(doi:10.1145/3301419.3323972) showing order differs by algorithm; Sun et al. (doi:10.1145/3375186,
doi:10.1145/3392825) on OT/CRDT expressiveness; delta-state CRDTs (doi:10.1016/j.jpdc.2017.08.003) as a
common denominator only *inside* the CRDT framework. State this honestly in any write-up: the claim is
"general semantics-preserving translation is unwarranted," not "proven impossible."

---

## 4. Feasibility in THIS repo (no-new-deps)

`AGENT_BRIEF.md` rule 4: "**No new dependencies.** No npm packages." That forbids even build-time
devDependencies, so stage-1 with real engines needs an **explicit written exception**. Sizes (npm registry,
accessed 2026-09-19): `yjs@13.6.32` unpacked **2.25 MB** (dep `lib0`; modified 2026-08-04);
`@automerge/automerge@3.5.0` unpacked **46.4 MB** (no deps; modified 2026-09-16 — includes WASM variants);
`loro-crdt@1.16.1` unpacked **19.4 MB** (no deps; modified 2026-09-10). Real deps would not ship to the
Next bundle (test files only), but Automerge's 46 MB is a heavy devDep and the rule still blocks it.

**Estimates.** (a) Real engines *with* an exception: envelope + 2 adapters + harness ≈ 1–2 weeks; risk
**high** — extracting portable ops requires `decodeChange`/`getChanges` (Automerge) and update-event
introspection (Yjs), and the ops are engine-specific. (b) No deps (toy YATA + RGA, ≈400–800 LOC): passes
the letter of the rule but yields non-transferable evidence. **Likeliest failure:** one of — (i) the
canonical algebra cannot express the engines' native conflict resolution, so concurrent inserts/struct ops
diverge; (ii) adapters secretly override engine semantics (e.g., forcing wall-clock LWW onto `Y.Map`), so a
green harness is vacuous; (iii) 46 MB + WASM async init makes the CI experiment brittle.

---

## 5. If nonetheless attempted: smallest credible stage-1

- **Type:** `Map<string,string>` LWW + delete **plus** a plain-text sequence with a **single shared
  ordering** (RGA/Fugue) so something is actually translated. LWW-only is a non-experiment (see §3).
- **Ops:** `set(key,value,ts,actor)`, `del(key,ts,actor)`; `insert(posId,char,leftId,rightId)`,
  `remove(posId,ts,actor)`. Envelope: `{v, docId, engine, actor, seq, deps:[hash], type, ops, sig}`.
- **Harness:** in-process replicas on Yjs and Automerge (or toy engines if no exception); N=**10,000**
  random delivery orders/partitions; materialize both to canonical JSON after drain.
- **Metrics:** divergences must equal **0** across all interleavings; envelope overhead **< 2×** native
  bytes; wall time **< 5 min** CPU-only. Logs: synthetic unless real Yjs demo / Automerge logs are
  obtainable without new services.
- **Convergence criterion:** canonical materialized JSON byte-identical independent of delivery order,
  for every interleaving. **Divergence detection:** canonical JSON diff after quiescence.
- **Falsifiers:** any divergence; any passing run that required bypassing the engines' own merge (detect by
  asserting the engine's native state equals canonical state before the gateway applies); overhead ≥ 2×;
  no real logs available.

**Strongest reason it may still fail:** the only convergent configuration is "both engines execute the
gateway's merge function," which is Braid's Merge-Type condition — so a green result demonstrates a
canonical log, not cross-engine translation, and a red result on concurrent list/text ops demonstrates the
obstacle. Either outcome leaves the category claim unsupported.

---

## 6. Defensible one-sentence claim (if it survives — restricted regime only)

*For data types whose merge function is engine-independent (LWW registers, counters, grow-only sets), a
signed canonical op envelope plus thin Yjs/Automerge adapters yields order-independent, byte-identical
materialized state across engines because the merge is defined once in the envelope and both adapters apply
that same function — not because the engines' native CRDTs are reconciled.*

This is a mechanism-level statement that survives; it is **not** a new category and is anticipated by
Braid's Merge-Type model and by canonical-op-log designs.

---

## 7. Sources (URL + date)

- Braid working group: https://braid.org/ (accessed 2026-09-19; meeting list through 2026-11-02)
- braid-spec repo: https://github.com/braid-org/braid-spec (created 2019-10-15; pushed 2026-03-05; 259★)
- Braid-HTTP I-D: https://datatracker.ietf.org/doc/draft-toomim-httpbis-braid-http/ (rev 2023-11-18; updated 2024-05-22; expired)
- Braid Merge Types I-D: https://raw.githubusercontent.com/braid-org/braid-spec/master/draft-toomim-httpbis-merge-types-00.txt (2019-11-18)
- Automerge→Braid mapping: https://braid.org/automerge (accessed 2026-09-19)
- `braid-http` npm: https://registry.npmjs.org/braid-http (1.5.1; modified 2026-09-11)
- reference-crdts: https://github.com/josephg/reference-crdts (© 2021; pushed 2023-12-01; 142★)
- Automerge binary format spec: https://automerge.org/automerge-binary-format-spec/ (accessed 2026-09-19)
- Yjs: https://github.com/yjs/yjs (README accessed 2026-09-19)
- Loro: https://github.com/loro-dev/loro (accessed 2026-09-19)
- Willow specs: https://willowprotocol.org/specs/index.html (accessed 2026-09-19)
- delta-crdt: https://github.com/rtibbles/delta-crdt (5★; pushed 2020-05-23)
- ds-crdt-interop: https://github.com/dozyio/ds-crdt-interop (pushed 2024-09-01)
- homeostate: https://github.com/mixedrays/homeostate (pushed 2026-09-14)
- abyo-crdt: https://github.com/abyo-software/abyo-crdt (pushed 2026-05-07)
- Interleaving anomalies (PaPoC 2019): https://doi.org/10.1145/3301419.3323972
- Sun et al., OT vs CRDT (PACM HCI 2020): https://doi.org/10.1145/3375186 ; https://doi.org/10.1145/3392825
- The Art of the Fugue (IEEE TPDS, 2025-11): https://doi.org/10.1109/tpds.2025.3611880
- Delta State CRDTs: https://arxiv.org/abs/1603.01529 (2016-03-04; JPDC 111, 2018) ; https://doi.org/10.1016/j.jpdc.2017.08.003
- Grassroots Systems: https://arxiv.org/abs/2301.04391 (DISC 2023) ; https://doi.org/10.4230/LIPIcs.DISC.2023.47
- Replicated data types (POPL 2014): https://doi.org/10.1145/2535838.2535848
- npm sizes: https://registry.npmjs.org/yjs , /@automerge%2fautomerge , /loro-crdt (accessed 2026-09-19)
- Negative searches: arXiv UI `all: CRDT interoperability` → 0; `all: CRDT morphism` → 0; `all: operational transformation CRDT unified` → 0 (verified 2026-09-19); GitHub Search `CRDT interoperability` (accessed 2026-09-19)
