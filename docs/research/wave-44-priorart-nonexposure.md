# Wave 44 — Adversarial prior-art attack: Watch-Causal Stamps (WCS)

Date: 2026-09-18. Attacker mandate: try to KILL the candidate by locating a direct prior-art
match for "exact causal non-observation of a declared watch-set, three-valued, no false
negatives, portable, offline." Method: 31 distinct web queries (28 returned results; 3 were
rate-limited and re-run in modified form) across clock/causality, provenance, epistemic logic,
information flow, distributed certification, offline-integrity, and non-membership families,
plus direct fetches of the load-bearing sources. Every claim below carries a URL. No code.

---

## 1. Verdict: GO — not killed, but the mechanism delta survives only at contract level

No located work implements WCS's core contract as stated: a mergeable stamp that carries, per
declared content view ("watch"), an exact NOT-SEEN state scoped by a declaration epoch, with
UNKNOWN absorbing. The closest works stop one clause short: vector clocks decide non-causality
exactly but over a fixed process index set, with absent entries read as zero and no declaration
semantics; Smith & Tygar's Sealed Vector Timestamps (PDCS 1994) certify presence *and absence*
of causal paths adversarially, but for a queried pair of events, not a watch-set receipt;
Worlds of Events (ICE 2016, arXiv:1608.03326) already gives three-valued causal verdicts
(including an explicit `?` = unknown) and offline *refutation* of causality; Bloom clocks give
*sound negatives* in constant space (false positives only affect positive claims); negative
provenance (SIGCOMM 2014) explains absent events but requires the full execution log and cannot
be materialized. The hostile reviewer's best case — "WCS is a sub-vector-clock over watch
indices plus an epoch guard, and its no-false-negative rule is the 1978 contrapositive of the
clock condition" — is substantially correct about the mechanism and only partially wrong about
the contract. GO stands because no paper/tool found combines watch declarations, per-watch
three-valued state, and mergeable offline stamps; but the candidate's framing must be corrected
(see §4–§5) or it will be killed in review for overclaiming.

---

## 2. Closest work

| Work (venue/year) | URL | What it implements | Core clause it matches | Clauses it does NOT implement |
|---|---|---|---|---|
| Vector clocks (Fidge 1988; Mattern 1989; survey: Schwarz & Mattern, DC 7(3) 1994) | https://decomposition.al/CSE232-2023-09/readings/holy-grail.pdf | Exact characterization of `→` and `\|\|`; therefore exact non-causality (`V(a) ≱ V(b) ⇒ a ↛ b`) | (i) exact negative causal knowledge, no false negatives; (iv) portable fixed-per-index stamp; offline comparison | No watch-set (fixed process indices); absent entry = 0, no UNKNOWN; no declaration epochs; no content-view semantics |
| Lamport clocks (CACM 1978); contrapositive note | https://en.wikipedia.org/wiki/Lamport_timestamp | One-sided clock condition; `C(a) ≥ C(b) ⇒ a ↛ b` (see "Lamport clocks show non-causality") | (i) no-false-negative negative test, immediately | No exactness in general; no watches/epochs/three values |
| Signed/Sealed Vector Timestamps (Smith & Tygar, CMU-CS-93-116, 1993; PDCS 1994, pp. 70–79) | https://people.eecs.berkeley.edu/~tygar/papers/Security_privacy_partial_order_time/PDCS.pdf | Detects presence **and absence of causal paths** even with malicious processes; proof-of-timestamp certificates. Explicitly lists "proving the absence of a precedence path" as future work under timestamp compression | (i) exact negative causal-path detection; offline evidence; (iv) timestamp carried with data | Pair-of-events queries, no watch-set receipt; no three-valued merge; no declaration epochs. WCS ≠ crypto (candidate's own scope) |
| Bloom clocks (Kshemkalyani & Misra, NBiS 2020 / ICDCIT 2021; arXiv:2011.11744) | https://www.cs.uic.edu/~ajayk/BloomClockauthor.pdf | Compact probabilistic causality with **false positives but no false negatives**: "Given a negative outcome… the probability that the negative outcome is false… is 0" | (i) exact/sound **negative** verdicts, constant size | Per-watch NOT-SEEN enumeration (no watch declarations); only compares two given events; presence is probabilistic; no artifact certificate/merge semantics |
| Worlds of Events (Haeri, Van Roy, Baquero, Meiklejohn; ICE 2016, EPTCS 223, doi:10.4204/EPTCS.223.8) | https://arxiv.org/abs/1608.03326 | Proof-theoretic partial causal knowledge: verdict set includes `?` (is-unknown-to) with propagation rules (Un-1..Un-4); offline decision making that **refutes** correspondences (`≮`, `||̸`, `<≯`); explicitly: when unconfirmed, it "would be wrong to consider the pair concurrent" | (ii) three-valued causal knowledge with an unknown that is propagated, not guessed; (i) offline denial; consistency results | Event-pair deduction trees, not stamps; no merge of per-watch states; no declaration epochs; no fixed-size artifact; no content views |
| Negative provenance / Y! (Wu, Zhao, Haeberlen, Zhou, Loo; SIGCOMM 2014, doi:10.1145/2619239.2626335) | https://haeberlen.cis.upenn.edu/papers/negative-provenance-tr.pdf | Formal model + system explaining **absence of events** by counterfactual reasoning, with soundness/completeness/minimality | Negative causal questions about a distributed execution | Needs the full execution log ("QUERY needs access to a log of the system's execution to date"); graphs "often infinite and cannot be materialized"; no portable stamp, no merge, no epochs |
| Cooper & Marzullo (Workshop on Parallel and Distributed Debugging 1991, doi:10.1145/122759.122774) | https://ntrs.nasa.gov/api/citations/19910011470/downloads/19910011470.pdf | Possibly/definitely modalities over the lattice of consistent global states, using vector time | (ii) honest treatment of uncertainty; possibly/definitely distinction | Central monitor over recorded local states; not a stamp; not per watch; no unknown top in a mergeable structure |
| Chandy & Misra, "How processes learn" (Distributed Computing 1(1), 1986, doi:10.1007/BF01843569); Halpern & Moses (PODC 1984, doi:10.1145/800222.806735) | https://authors.library.caltech.edu/records/y0kwp-9vt86 ; https://dl.acm.org/doi/10.1145/800222.806735 | Epistemic characterization of what a process can/must not know; impossibility of common knowledge | (i)/(ii) negative knowledge as a first-class epistemic fact; "knowing that they don't know" (Known Unknowns, TARK 2011) | No clock/stamp mechanism; no watches; no merge lattice; no retroactive epochs |
| CRDT anti-entropy / delta-state CRDTs (Shapiro et al. 2011; concurrency practice 2026) | https://docs.rs/lazily/latest/src/lazily/text_crdt.rs.html | Version-vector comparison yields exactly the ops a peer "has not observed"; GC only when "every replica has observed this deletion" | (i) exact non-observation of ops; (iii) observation-time reasoning | Pairwise, replica-scoped, no per-artifact certificate; no UNKNOWN (absence = not yet synced); no watch declarations; no offline portability of a negative claim |
| Why-not provenance / missing answers (Lee et al., PVLDB 13(6) 2020) | https://www.vldb.org/pvldb/vol13/p912-lee.pdf | Explanations for absent query answers | Absence explanations | Database query semantics, not causal exposure; no stamps/merge/epochs |
| Sparse Merkle non-membership (Dahlberg, Pulls, Peeters, ePrint 2016/683) | https://eprint.iacr.org/2016/683 | Succinct, verifiable **absence** of a key in an authenticated set | (iv) fixed-size offline absence certificate | Set membership, not causal observation; no merge algebra, no epochs, no three-valued |
| Provable Non-Access (PNA) / Proof of Absence of Execution (StealthEyeLLC, released 2026-02-05) | https://stealtheyellc.itch.io/provable-non-access-pna | Tool: "Verify that no read access occurred to specified target artifacts within a declared interval, under explicitly declared observer assumptions"; verdicts VALID / INVALID / OUT-OF-SCOPE; "Silence only counts when completeness is declared" | (i) no-access evidence; (ii) three-valued outcome; (iv) offline verification; declared scope | Not causal (event log + declared interval); no merge; no epochs; single observer artifact; no venue, AI-assisted, $5 itch.io tool |
| Riggs / sealed-bid auctions (ePrint 2023/1336; TDSC 2024) | https://eprint.iacr.org/2023/1336.pdf | Hiding + binding so the auctioneer cannot view bids before reveal | Non-view guarantee via commitments | Cryptographic commitment model; no causal reasoning; no stamps |
| PRAXIS receipt spec (2026) | https://github.com/vaishak-v-nair/PRAXIS/blob/main/RECEIPT-SPEC.md | Agent evidence receipts with verdicts TRUE/FALSE/UNVERIFIABLE; rule: "Absence … means 'not in the harvested channels', never 'did not happen'"; absence must map to UNVERIFIABLE, never FALSE | (ii) three-valued absence honesty; (iv) offline signed artifact | Transcript evidence, not causal stamps; no merge; no watches/epochs |
| Exposure Receipt (QualityMax qmax-receipt, 2026-07-10) | https://github.com/Quality-Max/qmax-receipt | Signed per-run manifest of outbound requests; offline-verifiable; "proves provenance, not honesty" | (iv) portable offline evidence artifact; name "exposure receipt" already taken | Positive egress record; no negative causal certificate, no merge/epochs |
| Byzantine causality impossibility (Misra & Kshemkalyani, NCA 2022, doi:10.1109/nca57778.2022.10013644; TIME 2023) | https://www.cs.uic.edu/~ajayk/ext/PARCO2025.pdf | Proves no algorithm avoids false negatives/positives for `→` in async systems with even one Byzantine process | Boundary condition on any "exact" contract | An impossibility result, not an implementation; WCS disclaims a security boundary, so it must state the crash-fault/trapped-surface assumption |

---

## 3. Clause-by-clause novelty analysis

**(i) Exact negative observation contract (no false negatives).**
Closest work: Lamport 1978's contrapositive (`C(a) ≥ C(b) ⇒ a ↛ b`) is exactly a
no-false-negative negative test (https://en.wikipedia.org/wiki/Lamport_timestamp); vector clocks
make it exact and two-way (https://decomposition.al/CSE232-2023-09/readings/holy-grail.pdf);
Smith & Tygar (PDCS 1994, fetched) certify absence of causal paths even adversarially; Bloom
clocks inherit sound negatives ("false negative … is 0",
https://www.cs.uic.edu/~ajayk/BloomClockauthor.pdf); Worlds of Events (ICE 2016) derives
negative judgements offline. Exact delta: WCS applies the same one-sided soundness to a
*per-watch substance* (has this artifact's provenance touched any read of W?) rather than a
*candidate cause pair*. As a mathematical property, nothing new; as an artifact-level
certificate, not implemented in the located literature. **Verdict: known in substance,
partially new as a certificate.**

**(ii) Three-valued SEEN / NOT-SEEN / UNKNOWN with absorption.**
Closest work: Worlds of Events has the relation `?` with four propagation rules and a
consistency theorem (Un-1..Un-4; arXiv:1608.03326, fetched) and explicitly warns that
"unconfirmed" must not be collapsed to "concurrent." PRAXIS (2026) makes absence map to
UNVERIFIABLE, never FALSE. Cooper & Marzullo's possibly/definitely and ABRV's
true/false/unknown/out-of-model (https://doi.org/10.1007/978-3-030-32079-9_10) are the same
epistemic stance in other machinery. WCS's specific structure — the pointwise join with
UNKNOWN as top for a per-watch state — was not found: it is the standard "top of a partial
information lattice" pattern (certain/possible answers in incomplete databases) instantiated in
a clock. Exact delta: no prior stamp/clock carries a third state per observed entity; but the
*discipline* of three-valued honesty about absence is published prior art (Worlds of Events;
PRAXIS). **Verdict: partially known; the merge-top instance is new.**

**(iii) Declaration epochs / retroactive NOT-SEEN.**
Closest work: dynamic-membership clock mechanisms (Interval Tree Clocks, Almeida et al. 2008,
https://gsd.di.uminho.pt/members/cbm/ps/itc2008.pdf; Version Stamps, 2006/2007) handle
creation/retirement of clock identities without global coordination, but their stamps represent
*presence* of events, not certified non-observation; CRDT GC derives "every replica has
observed" from version vectors and never needs a declaration time
(https://docs.rs/lazily/latest/src/lazily/text_crdt.rs.html). No located work scopes a
closed-world "absent = zero" reading to a declared object-birth logical time. Exact delta: the
rule "no entry for W + stamp time < d(W) ⇒ NOT-SEEN, else UNKNOWN" is not found anywhere; it is
also the simplest possible rule (a compare), and reviewers will call it an obvious guard.
**Verdict: new but low-complexity.**

**(iv) Fixed-size portable stamp, offline.**
Closest work: vector clocks are portable but O(n) and grow with participants; Bloom clocks are
constant size but cannot enumerate which views were *not* read; sparse Merkle non-membership
gives fixed-size offline absence proofs for *sets* (https://eprint.iacr.org/2016/683); negative
provenance is explicitly non-portable and needs the log (SIGCOMM 2014); PNA is offline but
scope-declared, not merged. Correction to the candidate doc: the claim "fixed size per watch"
means O(|watches|) total, not constant; and the claim that Bloom clocks "can never certify
non-observation" is **false as written** given their one-sided soundness. Exact delta: a
mergeable O(1)-state-per-watch absence certificate; no direct match, but the size argument in
the candidate's favor is weaker than stated (any vector over watches is also O(|watches|)).
**Verdict: partially known; claim requires rewording.**

**(v) Watch-set semantics (content views, not process events).**
Closest work: read-set/dependency metadata in causally consistent stores — COPS tracks the
exact set of items read and carries it with writes (reviewed in Orbe, doi:10.1145/2523616.2523628);
STM read sets record exactly what a transaction observed, hence certify non-observation of
everything outside the set, by construction. These are complete positive sets (instrumentation),
not compact negative states with declared epochs. Exact delta: compressing the complement of a
read set into a per-watch mergeable state, with declaration epochs defining the universe of
discourse. **Verdict: partially known (read sets), new as a compact merged negative state.**

---

## 4. Strongest hostile counterargument, and survival

**The attack.** "WCS is a sub-vector-clock specialization with an epoch guard.
(A) Instantiate a vector clock with one index per watch; merge is pointwise max; NOT-SEEN is
entry = 0; the no-false-negative rule is the contrapositive of Lamport's clock condition (1978,
cited in https://en.wikipedia.org/wiki/Lamport_timestamp). (B) Smith & Tygar already certified
presence *and absence* of causal paths, adversarially, in 1993/94
(https://people.eecs.berkeley.edu/~tygar/papers/Security_privacy_partial_order_time/PDCS.pdf).
(C) The candidate's own contrast with Bloom clocks is factually wrong: Bloom clocks have *no
false negatives* ('false negative … is 0',
https://www.cs.uic.edu/~ajayk/BloomClockauthor.pdf), so non-domination is a sound absence
certificate already, in constant space. (D) Worlds of Events already publishes three-valued
causal verdicts, an explicit unknown relation, offline refutation, and the anti-folklore warning
against equating 'unconfirmed' with 'concurrent' (https://arxiv.org/abs/1608.03326). (E) The
declaration epoch is a timestamp compare; dynamic-membership clocks (ITC 2008; Version Stamps)
already manage identity birth/retirement. Therefore the novelty is a use-case contract, not a
mechanism, and the claim 'new kind of time' is inflated."

**Survival.** WCS survives (a) only if it stops claiming novelty for exact negative causality,
three-valuedness, or offline evidence as such; and (b) by the one thing the attack cannot
reproduce from any single source: a **mergeable stamp whose per-watch absent-entry reading is
scoped to a declaration epoch, with UNKNOWN as the absorbing join element** — i.e., a portable
closed-world certificate over a mutating observe-universe. Vector clocks do not implement (a
missing entry is zero under fixed membership, a semantics that is unsound the moment watches are
declared later); Worlds of Events is a deduction system over event pairs, not a stamp algebra;
Bloom clocks cannot say *which* watches were unwatched. The attack also lands two real hits that
must be conceded in any write-up: (1) "new kind of time" is overclaim, and (2) the Bloom-clock
contrast must be restated as "cannot enumerate per-watch non-observation," not "cannot certify
absence." A third boundary to state honestly: in a Byzantine model, exact causality has an
impossibility result (Misra & Kshemkalyani, NCA 2022), so WCS's no-false-negative guarantee is
relative to a non-malicious, trapped observation surface, not a security property.

---

## 5. Exact defensible claim (GO)

**Defensible claim (one sentence):** WCS is a new *contract-level encoding*, not a new
causality theory: a mergeable stamp in which each declared content watch carries a three-valued
observation receipt, where NOT-SEEN is exact (no false negatives), UNKNOWN absorbs under
merge, and the reading of an absent watch entry is scoped by the watch's declaration epoch —
yielding offline, portable non-exposure certificates over an observation universe that can
change over time. Anything stronger than this (exact negative causality, three-valued causal
knowledge, offline absence evidence, fixed-size stamps) has located prior art and must be cited,
not claimed.

---

## 6. Name and mechanism collision check

- **"Watch-Causal Stamps" / "WCS":** no paper or tool with this name found across all queries.
  Generic "causal stamp(s)" is not an established term
  (https://arxiv.org/abs/2302.10008 search family returned no match); safe as a coined name.
- **"watch" + clock:** searches surface "Watchmaker" — a quasi-synchronous SMR protocol
  (Newatia, Gifford, Lu, Haeberlen, Phan; NINES 2026,
  https://doi.org/10.4230/oasics.nines.2026.26) — unrelated mechanism, distinct name. Watchdog
  / watchpoint terminology is program-analysis and failure-detection, no stamp semantics.
- **"Exposure receipt":** already in active use for *positive* egress manifests, offline
  verifiable — QualityMax qmax-receipt (2026-07-10,
  https://github.com/Quality-Max/qmax-receipt) and APL sidecar (https://pypi.org/project/apl-sidecar/).
  Do not ship the product term "exposure receipt" without disambiguation; WCS's certificate is a
  *non-exposure* certificate, the inverse.
- **"Provable Non-Access" / "Proof of Absence of Execution":** named, released 2026-02-05
  (StealthEyeLLC, https://stealtheyellc.itch.io/provable-non-access-pna). Closest named
  primitive to WCS's product framing; non-causal, non-mergeable, no venue (AI-assisted, $5
  itch.io tool). Cite it in any product description to preempt a "you renamed PNA" critique.
- **Ternary name space:** a Rust crate `ternary-distributed` (2026) uses three-valued states
  for votes/health with vector clocks (https://crates.io/crates/ternary-distributed), but not
  three-valued causal entries; no collision beyond the word "ternary."

---

## Search families exhausted (no direct match found)

Vector/ Lamport/ hybrid/ interval-tree/ dotted/ plausible/ prime clocks and clock surveys;
Bloom and probabilistic clocks (one-sided error); "negative information" in distributed
systems; causal separators and topological timestamping; non-causality / "did not happen"
queries; negative provenance and why-not provenance; missing-answer explanations; possibility/
definitely predicate detection; three-valued and partial-knowledge causality (Worlds of Events;
Cooper–Marzullo; ABRV); epistemic logic (knowing ignorance, "known unknowns"); causal past
logics and vector-clock monitoring; CRDT anti-entropy "has not observed" metadata and causal
stability; proof-labeling schemes / local certification of reachability and non-reachability;
certifying distributed algorithms; information-flow noninterference certificates and taint
tracking with absence; sparse Merkle / indexed Merkle non-membership; IBLT and exact set
reconciliation; proofs of ignorance and ZK non-membership; sealed-bid and timed-commitment
non-view guarantees; automated contact-tracing deniability and non-exposure impossibilities;
offline exam proctoring, offline assessment integrity, and independent-work attestation;
exposure receipts and agent decision receipts; Provable Non-Access and Proof of Absence of
Execution; absence detection in complex event processing; Byzantine causality detection
(impossibility and synchronous possibility); "watch"/"watchdog"/"causal stamp"/"ternary clock"
terminology.

**Bottom line for the pipeline:** not killed; do not ship "new kind of time." Ship the
declaration-epoch non-exposure contract, cite Lamport/Fidge–Mattern, Smith & Tygar, Bloom
clocks, Worlds of Events, negative provenance, and PNA up front, and correct the Bloom-clock
sentence before any reviewer reads it.
