# Wave 44 — Correctness attack on Refutation-Ledger Values (RLV)

Date: 2026-09-18. Role: Correctness Attacker. No code written; exactly one file (this one) touched.
Inputs: the RLV contract as stated in the attack brief, plus `wave-44-candidates-a.md` (C2) and
`wave-44-priorart-refutation.md` for context. Method: for each invariant, build the smallest explicit
counterexample (DAG + ledger + operation sequence), name the invariant it breaks, classify the break,
then write the contract I would defend.

Notation. K = grade cap (K >= 1 unless stated). Attempt shorthand: `(R,F,s)+` survived, `(R,F,s)-`
refuted, `(R,F,s)o` inconclusive. lambda(v) = grade recomputed from v's chain + cites per the
contract; gamma(v) = what a consumer observes (stored, cached, advertised). Cone(v) = dependents
{w : some cites-path from w reaches v}. Class letters: (a) contract amendment, (b) implementation
discipline, (c) inherent limitation to declare.

## 1. Invariant attacks

### I1 — auditable grade ("observed gamma equals recomputed gamma; forged grade detectable")

**1.1 The observation point is undefined (vacuous or false).** If gamma is computed on every read,
nothing can be forged and I1 is a tautology; if gamma is stored/cached/advertised, I1 requires an
audit that actually runs. The contract says neither. All attacks below take the interesting reading.
[breaks I1's meaning; class a: name the observation point]

**1.2 Non-transitive audit.** C = assert(P), empty ledger. B = derive(f,[C]) with survived attempts
(R1,F1)+,(R2,F2)+,(R3,F3)+ so D(B)=3. A = derive(g,[B]) with the same three survived pairs. True
lambda: lambda(C)=0, so lambda(B)=0, so lambda(A)=0. A buggy producer publishes gamma(B)=3 and
gamma(A)=3. `audit(A)` "recomputes gamma from the stored ledger + cites" — if it consumes the stored
gamma(B)=3 instead of recursing, it reports a match. The forged grade propagates to every dependent.
Breaks I1 under the natural reading of the spec. [class a: audit must recompute lambda transitively
from leaves over the reachable sub-DAG and compare every cached grade; or gamma may only be read-time
computed and `publishedGrade` is an explicitly unaudited advert]

**1.3 Fabricated and truncated ledgers.** Audit-by-recompute recomputes from the very ledger under
attack: (i) B with no attempts; the producer appends three survived attempts that were never run,
then publishes gamma=3. Audit recomputes D=3, chain well-formed, match. The attempt format has no
witness or replay field, and audit never re-runs refuters. (ii) B with an admitted (R1,F1)-; the
producer rewrites the chain without it and publishes gamma=K; audit passes. (i) breaks I1's detection
claim; (ii) breaks I1 and I4 (append-only). [1.3i: class c; 1.3ii: class a+b, hash-linked appends
plus a head anchored outside the producer's write domain]

**1.4 Identity aliasing.** The contract never defines ValueId. If ValueId = H(payload) — the natural
content-addressing choice — two values with payload P share an id: B1 has (R1,F1)- (dead), B2 is
clean. Each instance is internally consistent and audits fine; a consumer keyed by the id cannot tell
which warrant they are shown, and a last-write-wins store silently erases the refuted ledger. Breaks
I1's purpose at the claim level. [class a: ValueId must commit to (op, kind, payload, cites, context,
genesis), not payload alone]

**1.5 Race between challenge and derive (stored grades).** v is alive with stored gamma(v)=2.
challenge(v,(R1,F1)-) begins; before its demotion walk commits, derive(g,[v]) passes the "all cites
alive" gate and stores w with gamma(w)=2; the walk uses a reverse-cite snapshot predating w. Observed
gamma(w)=2, recomputed lambda(w)=dead. Breaks I1 (observed != recomputed) and I3 (under-demotion).
[class a: pull-based lambda; or b: linearize derive/challenge]

### I2 — no inflation ("replaying same attempt or sweeping seeds adds 0 to D")

**2.1 The letter is a tautology.** D counts distinct (refuter, family) pairs and seeds never enter D,
so replay and seed sweeps add 0 by definition. I2 cannot be broken by the behaviour it names — and it
certifies nothing, because inflation moves to how refuter and family identities are minted. [no
break; the statement is vacuous as a defense]

**2.2 Family subsumption.** K=3. B's ledger: (R1,F1)+ and (R1,F2)+ where F2's declared input domain
is a subset of F1's (F1 = all 8 inputs of a 3-bit space, F2 = first 4). For a deterministic refuter,
every (R1,F2) attempt is literally an (R1,F1) attempt; D=2 counts one unit of evidence twice. Breaks
I2's intent (the number no longer measures distinct evidence). [class a partial: require registered
family domains and reject at admission a new family whose declared domain is subsumed by an admitted
domain of the same refuter where decidable; class c where not]

**2.3 Cosmetic refuter identity.** If RefuterId is a content hash of source, adding one comment to
R1's source yields R1'; (R1',F1)+ is a fresh pair and D goes 1 to 2 with byte-identical behaviour. If
RefuterId is a name, a new name does the same instantly. So "is a one-byte change a new refuter?" —
under hash ids yes, which is exactly wrong. Breaks I2 under any adversarial producer. [class a:
independence identity = registered root/lineage; code digest recorded for replay only]

**2.4 Author fan-out.** One author registers F1..FK as trivial input-order permutations; D=K from one
code path. No contract-level repair (family identity is declarative; semantic independence is
undecidable). K caps the blast radius; the registry must expose authorRoot so concentration is
visible. [class c]

**2.5 Asymmetry (design disclosure).** Seeds contribute 0 to D but any single refuted seed kills. A
seed sweep therefore has zero positive force and full negative force — coherent attack semantics, but
stochastic survival can never earn warrant beyond one per pair. State the trade-off; do not silently
fix, because counting seeds is precisely the inflation the candidate rejected. [class c]

### I3 — exact demotion ("dead iff a path through cites")

Note first: with frozen cites and unique ids, I3 is a *definition* (reachability), not an
independently falsifiable law. The defects below are about the missing identity/immutability premises
and about claim-level meaning.

**3.1 Cycles via payload-addressed ids.** V = assert(P) has (R1,F1)-; derive(g,[V]) where g outputs P
resolves to id H(P) = V; if the store merges cite edges, V self-cites. "Min over cites" and the
demotion closure become circular; naive implementations recurse forever, converge to
traversal-order-dependent answers, or ignore the self-edge — three different observed grades for one
store, breaking I1 too. With op-aware ids and frozen cites this is impossible: every cite names a
strictly older value (creation-order argument), so the cite graph is a DAG. Breaks I3 as written
because cycles are not excluded. [class a: pin the id scheme, freeze cites, state DAG by
construction; do not specify cycle semantics]

**3.2 Direction error (over-demotion).** C = assert; B = derive([C]); refute B. Ground truth dead set
= {B}; C is a premise and stays alive. An implementation that walks the cite graph undirected kills C.
Breaks I3 precision. "Path through cites" is never given a direction. [class a: define Cone(v) as
dependents only; b: implement accordingly]

**3.3 Shallow propagation (under-demotion).** C refuted; B = derive([C]); A = derive([B]). Ground
truth {C,B,A}; a handler that demotes only direct citers leaves A alive. Breaks I3 recall. This is one
line of eager code away in any implementation; pull-based lambda (amended section 4) makes the closure
a theorem instead of code. [class b, removed by amendment]

**3.4 Cite mutation / deletion (resurrection).** No operation deletes, but nothing forbids mutable
cite records. After C is refuted and A (citing C) is dead, deleting A's cite edge makes lambda(A)
rise again with no new attempt: breaks I4 ("no silent repair") and makes "exact vs ground truth"
meaningless without a declared snapshot. [class a: cites frozen at creation; retraction only as a new
value; no op rewrites a stored value; b: enforce]

**3.5 The alive gate is redundant and TOCTOU-prone.** "derive requires all cited values alive at
creation" is race-prone (1.5) and semantically redundant: lambda already returns dead for a child of
a dead value. It makes derive order-dependent (the same derivation is legal before a refutation and
illegal after) and loses information: a value cannot be re-derived once a cite is poisoned, even if
the poison later proves to be a refuter bug. Breaks nothing by itself, but creates the 1.5/3.4 attack
surface. [class a: drop the gate; lambda makes the result dead; keep an optional hygiene check only
if linearized]

**3.6 Payload-level laundering (the claim-level gap).** C (payload P) refuted; its whole cone dead. A
producer calls assert(P, kind) again: with fresh ids it mints a clean clone; with payload-hashed ids
it hits 1.4. I3 holds over ids (the clone is alive), but the *claim* P is back and all later
derivations cite the clone. Without canonical identity, exact demotion protects derivation instances,
not claims; any consumer keyed by payload is defeated. This is the most damaging gap for the product
framing ("every derived claim carries RLV"). [class a: canonical, context-keyed identity — assert
idempotent inside a context, derive deterministic in (f, cites, context), so a refuted claim cannot
be re-minted in its context; contexts must be a declared, closed space or context-shopping launders;
or class c: declare values-as-artifacts and forbid payload-keyed consumption]

### I4 — monotone ledger ("append-only; gamma never increases after a refuted attempt; no silent repair")

**4.1 The headline is false by design.** Lambda rises whenever a survived attempt is admitted to a
live value or a live ancestor: v cites c; a new (R,F)+ on c raises lambda(c) 1 to 2, hence lambda(v)
1 to 2. That is warrant accrual, not repair. Breaks I4 literally as worded. The true statement is:
appends containing no refuted attempt are monotone non-decreasing on every affected lambda; an append
containing a refuted attempt is absorbing-dead for the refuted value and its entire cone. [class a:
restate]

**4.2 Truncation, rewrite, fork.** Same surfaces as 1.3ii: rewrite the chain to drop a refutation
(gamma rises), or keep two forks of one value's history and show each observer the favourable one.
Only hash-linked appends plus a head anchored outside the producer's control detect this; an attacker
who holds the signing key *and* controls the anchor is beyond any ledger-local invariant. [class
a+b; residual c]

**4.3 No rehabilitation (the honesty cost).** Because dead is absorbing and cites are frozen, a buggy
or malicious refuter's (R,F)- permanently kills the value and its whole cone. The contract offers no
loud repair: the only remedies are a new payload/context (laundering, 3.6) or an out-of-contract
manual edit. [class a: add a governed `supersede(oldId, newValue)` that links histories and carries
its own challengeable ledger; or class c: declare "kill is forever" explicitly]

## 2. Required edge cases (explicit verdicts)

**Self-cites / cycles.** Impossible under fresh op-aware ids with frozen cites (edges point strictly
backwards in creation order); possible and semantically undefined under payload-only ids, where a
cycle containing a refuted value should kill the whole SCC and a refutation-free cycle grades all
members by min D over the SCC. Verdict: exclude by construction [a]; do not specify cycle semantics.
Break surface when unexcluded: I3 and, through traversal order, I1.

**Value cited by two values, one already dead.** The alive gate rejects the derive outright; that
rejection is redundant (lambda would mark the child dead) and race-prone (3.5), so drop it. With the
gate dropped, lambda = dead propagates; refuting one parent never kills the other parent or the
shared cite — demotion is unidirectional (3.2).

**K = 0.** All live values grade 0; survived attempts are invisible; alive iff no admitted refutation
in the cone; audit unchanged. Two spec gaps surface: define min over the empty cite set (asserted
values use lambda = min(K, D)) and keep `dead` and `0` distinct states. No invariant break; the
independence machinery is vacuous, so K=0 is a supported config with no warrant signal. [class a:
define empty-min, dead != 0]

**Empty ledger / all-inconclusive.** Both give D=0, hence the same gamma: a consumer keyed on gamma
cannot distinguish "never attacked" from "attacked 50 times, learned nothing". Not an invariant break
(inconclusive contributes nothing by definition), but it defeats the product copy "never challenged
where true" unless the UI reads `why`. Inconclusive entries can also be spammed: unbounded chain
growth makes `why`/audit unbounded. Refutations cannot be hidden *inside* a ledger (any admitted
refuted attempt dominates), but a write-capable producer can relabel refuted as inconclusive
(chain+anchor, 4.2). [class a: bounded `why`, admission-time caps; c: relabeling]

**D over (refuter, family).** One-byte change: new refuter if ids are content-addressed (2.3), same
refuter if ids are names — wrong in opposite directions. Many families from one author: 2.4,
unfixable at contract level. Defensible rule: D counts registered *roots* (lineage, not version) with
declared authors and declared input domains; the registry is the anti-gaming admission point; K caps
damage. Declared residual: two roots from one author still count twice. [class a for root-based
counting; c for semantic residual]

**Audit vs forgery (threat model).** Honest-but-buggy producer: audit detects inconsistent grades
(transitively, once amended), malformed attempts, and chain discontinuity against a trusted head.
Malicious producer with ledger write access: can fabricate well-formed attempts and replace the whole
chain from genesis (invisible without an external anchor). `audit` is an integrity check against the
declared anchor, not evidence of truth or independence. [class a+c; see section 5]

**Demotion after graph mutation.** If any operation can rewrite/link/unlink cites, "exact" has no
referent: precision/recall must be measured against a snapshot, and unlink causes resurrection
(breaks I4). Verdict: cites immutable; mutation out of contract. [class a]

**Inconclusive grief/hiding.** The cost field exists but is not enforced; no rate rule in the
contract. Amendment: admission-time budget (max chain length L per value; at most one admitted
inconclusive per (refuter,family) per epoch; excess rejected *before* append so append-only remains
absolute); `why` returns warrant-bearing attempts plus a bounded summary of inconclusive ones.
[class a+b]

**Duplicate values (same payload, different ledgers).** Covered in 1.4/3.6: without canonical
identity, grades are instance-scoped, cross-instance audit is blind, and re-assertion launders a
refuted claim. If shipped as-is, `why`/`challenge`/`audit` answer about an id, not about the claim a
consumer thinks they are reading. Options: canonical context-keyed ids (a) or explicit payload !=
claim scoping (c). [class a or c; must be explicit]

## 3. Classification tally

| Attack | Invariant | Class | Minimal repair |
|---|---|---|---|
| 1.1 undefined observation point | I1 | a | define published vs read-time grade |
| 1.2 non-transitive audit | I1 | a | transitive recompute |
| 1.3i fabricated attempts | I1 | c | declare; admission/witness out of scope |
| 1.3ii truncation/rewrite | I1, I4 | a+b | hash chain + external anchor |
| 1.4 identity aliasing | I1, I3 | a | genesis-committing ValueId |
| 1.5 derive/challenge race | I1, I3 | a/b | pull-based lambda or linearize |
| 2.2 family subsumption | I2 | a/c | registered domains; declare residual |
| 2.3 cosmetic refuter versions | I2 | a | root-based D |
| 2.4 author fan-out | I2 | c | declare; registry visibility |
| 2.5 seed asymmetry | I2 | c | declare trade-off |
| 3.1 cycles | I3, I1 | a | DAG by construction |
| 3.2 direction (over-demotion) | I3 | a/b | define dependents-only cone |
| 3.3 shallow demotion | I3 | b | removed by pull-based lambda |
| 3.4 cite mutation | I3, I4 | a+b | freeze cites |
| 3.5 alive gate TOCTOU | I3 | a | drop gate |
| 3.6 payload laundering | I3/I1 purpose | a/c | canonical context ids or scope |
| 4.1 false monotonicity headline | I4 | a | restate precisely |
| 4.2 rewrite/fork | I4, I1 | a+b/c | chain + anchor; scope |
| 4.3 no rehabilitation | I4 | a/c | choose supersede or declare |

## 4. Minimal amended contract (the version I would defend)

Types
- Grade := dead | 0 | 1 | ... | K, where dead is absorbing below 0.
- RootId := registered lineage id; registry row = (authorRoot, specDigest, declaredDomain).
- Attempt := (refuter: RootId, family: RootId, seed: u64, outcome: survived | refuted |
  inconclusive, cost: Nat, witness: Digest, submittedBy: Identity).
- Append := (prev: Digest, attempt: Attempt, admittedBy: VerifierId, sig).
- ValueId := Digest(op, kind, payload, cites, context, genesis).
- Value := (id, op, kind, payload, context, cites: frozen ValueId[], chain: Append[], genesis).
- publishedGrade: ValueId -> Grade; advert only, never an input to another value's computation.

Operations
- register(refuter | family, spec, domain) -> RootId. Roots are lineages; a new code digest under an
  existing root is a version, not a root.
- assert(payload, kind, context) -> ValueId. Idempotent within context; a refuted canonical value
  cannot be re-minted in that context.
- derive(f, cites, context) -> ValueId. Deterministic in (f-digest, cites, context); cites frozen;
  may cite dead values; an id collision is a no-op returning the existing id.
- submit(attempt) -> PendingAttempt; admit(PendingAttempt, VerifierId) -> Append. Admission checks
  well-formedness, budget, and a verifier replay signature; rejected submissions never enter the
  chain, so append-only is absolute after admission.
- lambda(v) -> Grade: pure, read-time, structural recursion over the DAG.
- why(v) -> (chain, cites); audit(v) -> Report (transitive recompute + chain/anchor verification).

Grade function
  D(v)       = |{ (a.refuter, a.family) : a admitted survived in chain(v) }|
  lambda(v)  = dead                                 if any admitted refuted attempt in chain(v)
             = min(K, D(v))                         if cites(v) is empty
             = min(K, D(v), min_{c in cites(v)} lambda(c))   otherwise
  dead(v) iff lambda(v) = dead. There is no propagation code and no stored demotion state: the
  closure is a theorem over frozen cites, not an operation.

DAG lemma. Cites always name values created earlier and are frozen; ValueId commits to cites. Hence
the cite graph is acyclic and lambda is well-defined. Cycles are unrepresentable, not discouraged.

D identity rule. Independence identity is the registered root pair; code versions, seeds,
re-signings, and identical replays add 0. Admission rejects a family whose declared domain is
subsumed by an already-admitted domain of the same refuter where the declared domain expressions
decide it; otherwise the registry records the overlap and the overlap is a declared residual.

Invariants (amended; these are the only claims the paper makes)
- I1' Auditable grade. Any publishedGrade(v) equals lambda(v) recomputed transitively from leaves
  over v's admitted chain; audit reports mismatches, malformed attempts, broken prev/sig links, and
  head mismatches against the published anchor. Scope: consistency and anchored tamper-evidence
  only; not truth, not authenticity of well-formed fabrications, not independence.
- I2' No bookkeeping inflation. D counts distinct registered (refuter root, family root) pairs;
  identical attempts, replays, seed sweeps, re-signings, and cosmetic code versions add 0. Declared
  residual: distinct roots controlled by one author count separately; declared family domains are
  not machine-checked for subsumption in general.
- I3' Exact demotion. With frozen cites and unique ids, dead(v) holds iff a directed path through
  cites leads from v to a value with an admitted refuted attempt. Precision = recall = 1 by
  construction; the alive gate is removed; derive on dead cites yields a dead value.
- I4' Append-only, monotone, absorbing. Chains append only; outcomes immutable. Appends with no
  refuted attempt are monotone non-decreasing on every affected lambda; any append containing a
  refuted attempt is absorbing-dead for the refuted value and all its dependents. No operation
  resurrects a ValueId.

## 5. Threat model: what the amended RLV does not protect against

1. Malicious producer with ledger write access can fabricate well-formed attempts; audit-by-recompute
   passes because it recomputes from the fabricated chain. Mitigation needs admission signatures and
   a replay witness plus a trust root outside the producer; without it, no ledger-local invariant
   helps.
2. No truth guarantee. Survived does not mean true; refuted is taken on the refuter's authority; a
   false refutation is permanent (4.3). Grade measures recorded attack-and-survival, not correctness.
3. Semantic non-independence. D is a counting discipline over declared identities. One author can
   register many roots/families; correlated blind spots (Knight-Leveson) are invisible. K caps but
   does not fix this.
4. Unauthenticated challenge. If anyone may submit attempts that affect lambda, any actor can kill
   any cone with a fabricated refutation (vandalism) or inflate with fabricated survivors. Challenge
   must go through admission; auditable then inherits the admission trust root.
5. Localized integrity. Integrity holds only relative to an anchor outside the producer's control;
   equivocation (forks) is undetectable without a transparency log.
6. Instance-not-claim semantics unless canonical context identity is adopted (3.6).
7. No cost/quality semantics. cost is recorded, never weighed; a trivial cheap refutation equals an
   expensive one.
8. Confidentiality. Ledgers and cites are a disclosure surface (attempt inputs may embed data).

## 6. Verdict

**GO-WITH-AMENDMENTS.** The defensible core survives: ledger-as-warrant, a recomputable grade,
root-based non-inflation, and exact demotion are coherent once identity, immutability, and the
observation point are pinned. What does not survive as written is (i) the claim that audit detects
grade forgery without transitive recomputation and an external anchor, (ii) the implication that D
resists inflation under adversarial naming (it only resists replay), (iii) exact demotion against a
mutable or aliased graph, and (iv) the literal monotonicity sentence. All four are repairable without
abandoning the RLV character; the residues (semantic independence, truth, rehabilitation,
instance-vs-claim semantics) must be stated as limitations, not fixed. With the amendments the
contract-level novelty claim (ledger to grade to exact demotion on runtime values) remains intact;
without them I1 and I3 are false as advertised and the prior-art reviewer's "totem + falsifyr + TMS"
critique lands on the invariant table itself.
