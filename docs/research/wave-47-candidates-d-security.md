# Wave 47 — Scientist D: security/privacy primitives — is there a *new type of thing*?

Date: 2026-09-19. Scope: research survey only; one file; no product code touched; no git.
Method: the search provider returned **HTTP 429 on all 9 calls**, so (as Wave 46-B did) I substituted
breadth-first structured queries: **45+ OpenAlex title/abstract queries**, **7 arXiv API queries**,
**1 Crossref query**, and **20+ direct source fetches** (RFC Editor, W3C TR, IETF datatracker,
C2PA). Every claim below carries a URL; dates are as printed by the source or are explicit access
dates. Counts are wide but this is a survey, not a proof.

**Honest headline.** The requested object — *one new security/privacy primitive of 10x/100x
consequence, deployable in a browser or local-first app* — **does not exist as a single thing.**
The component layer is saturated (Section 1). What 2025–2026 *did* produce is a small set of
genuinely new **mechanisms** that are still research-only or single-vendor:
(i) **federated key transparency** for cross-provider E2EE (MIMI, 2026-09-15);
(ii) **everlasting anonymous rate-limited tokens** (CISPA, 2026-06-23);
(iii) **device binding for anonymous credentials on legacy phones** (IEEE S&P 2027);
(iv) **verified-location / unlinkable provisioning** (ZK-eSIM, CCS 2026, arXiv 2609.07654).
None is a *deployable browser/local-first primitive*. The gap next to each is the same:
**composition into one offline-verifiable, unlinkable, revocable, holder-bound runtime.** The
candidates below target exactly that gap, ranked by missing × impact × feasibility.

Grading: **NEW CATEGORY / BREAKTHROUGH 10x+ / NEW ARCHITECTURE / PARTIAL GAP / EXISTS (skip) / HARD.**

---

## 1. Mandatory existence map (one line each; URL + date)

### WebAuthn / passkeys
- WebAuthn Level 2, W3C Recommendation (2021-04-08), https://www.w3.org/TR/webauthn-2/
- WebAuthn Level 3, W3C Recommendation **2026-08-25** (verified), https://www.w3.org/TR/webauthn-3/
- FIDO CTAP 2.1 / passkey sync (2024–2026), https://fidoalliance.org/specifications/
- Post-quantum WebAuthn / hybrid keys: NIST FIPS 203/204/205 (2024-08-13), https://csrc.nist.gov/pubs/fips/203/final

### Verifiable credentials / selective disclosure
- W3C Verifiable Credentials Data Model 2.0, Recommendation (2025-05-15), https://www.w3.org/TR/vc-data-model-2.0/
- W3C VC Data Integrity 1.0 (Rec-track, 2025), https://www.w3.org/TR/vc-data-integrity/
- SD-JWT, **RFC 9901** (2024-10), https://www.rfc-editor.org/rfc/rfc9901.html
- SD-JWT VC, draft-ietf-oauth-sd-jwt-vc-19, last updated **2026-08-31**, https://datatracker.ietf.org/doc/draft-ietf-oauth-sd-jwt-vc/
- mDL, ISO/IEC 18013-5:2021, https://www.iso.org/standard/69084.html ; 18013-7:2024, https://www.iso.org/standard/82772.html
- Revocation: IETF OAuth **Token Status List** draft-21 (2025–2026), https://datatracker.ietf.org/doc/draft-ietf-oauth-status-list/

### Anonymous credentials
- BBS Cryptosuite, W3C **Candidate Recommendation Draft 2026-09-10**, https://www.w3.org/TR/vc-di-bbs/
- Tight security for BBS signatures, arXiv 2608.06724 (2026-08-07), https://arxiv.org/abs/2608.06724
- Device Binding for Anonymous Credentials on Legacy Phones, IEEE S&P 2027 (preprint 2026-09-17), https://doi.org/10.5281/zenodo.22807191
- Differential Trust: Dynamic Multi-Authority ACs, arXiv 2609.18811 (2026-09-16), https://arxiv.org/abs/2609.18811
- Post-quantum lattice linkable AC, J. Supercomputing (2025-09-23), https://doi.org/10.1007/s11227-025-07872-w
- ZK-eSIM (unlinkable provisioning), ACM CCS 2026, arXiv 2609.07654 (2026-09-07), https://arxiv.org/abs/2609.07654

### Unlinkable tokens / anti-abuse
- Privacy Pass Architecture, **RFC 9576** (2024-06), https://www.rfc-editor.org/rfc/rfc9576.html
- Privacy Pass Issuance Protocols, **RFC 9578** (2024-06), https://www.rfc-editor.org/rfc/rfc9578.html
- RSA Blind Signatures, **RFC 9474** (2023-10), https://www.rfc-editor.org/rfc/rfc9474.html
- Privacy Pass is Anamorphic, PoPETs 2026-07-14, https://doi.org/10.56553/popets-2026-0135
- Everlasting Anonymous Rate-Limited Tokens, CISPA (2026-06-23), https://doi.org/10.60882/cispa.32770659
- Private Access Tokens (Apple/Cloudflare deployment, 2022-11-17), https://blog.cloudflare.com/private-access-tokens/

### ZK in the browser
- snarkjs / circom (2020–2026), https://github.com/iden3/snarkjs ; https://docs.circom.io/
- Noir (Aztec), https://noir-lang.org/ ; halo2 (Zcash), https://github.com/zcash/halo2
- zkEmail (DKIM proofs for 2FA/recovery, 2023–2026), https://zkemail.xyz/
- Privacy-preserving age attestation, ZK-18 v4 (2025-11-03), https://doi.org/10.5281/zenodo.17516379
- ZKP on resource-constrained devices, joresd (2026-08-20), https://doi.org/10.66314/joresd.v4i1.1230

### MPC / PSI / private aggregation / DP
- MP-SPDZ and WASM MPC (2020–2026), https://github.com/data61/MP-SPDZ
- TLSNotary review (MPC zkTLS), arXiv 2409.17670 (2024-09-26), https://arxiv.org/abs/2409.17670
- Asymmetric PSI with WASM/browser targets, arXiv 2011.09350 (2020-11-18), https://arxiv.org/abs/2011.09350
- Fuzzy PSI for L-infinity, Zenodo (2026-09-14), https://doi.org/10.5281/zenodo.22758026
- Prio private aggregation, USENIX NSDI 2017, https://www.usenix.org/conference/nsdi17/technical-sessions/presentation/corrigan-gibbs
- OpenDP differential privacy framework (2024–2026), https://opendp.org/
- Local-DP smart metering (hash-chain + blind sigs), arXiv 2508.14703 (2025-08-20), https://arxiv.org/abs/2508.14703

### E2E sync / crypto
- Messaging Layer Security, **RFC 9420** (2023-07), https://www.rfc-editor.org/rfc/rfc9420.html
- Signal X3DH + Double Ratchet (2016–2026), https://signal.org/docs/specifications/doubleratchet/
- Hybrid PQ KEM in browsers (X25519MLKEM768, 2024–2025), https://datatracker.ietf.org/doc/draft-ietf-tls-ecdhe-mlkem/
- Federated Sovereign Transport Protocol (contextual identity, closed output), arXiv 2607.00213 (2026-06-30), https://arxiv.org/abs/2607.00213

### Verifiable deletion / erasure
- Publicly Verifiable Deletion from minimal assumptions, arXiv 2304.07062 (2023-04), https://arxiv.org/abs/2304.07062
- Cloud data deletion with Invertible Bloom Filters, (2026-08-17), https://doi.org/10.1007/978-3-032-35516-4_10
- Semantic Resurrection Bounds Verifiable Deletion, Zenodo (2026-08-02), https://doi.org/10.5281/zenodo.21755993

### Transparency logs / key transparency
- Certificate Transparency v2, **RFC 9162** (2022-06), https://www.rfc-editor.org/rfc/rfc9162.html
- Google Key Transparency / transparency.dev (2022–2026), https://transparency.dev/
- CONIKS, USENIX Security 2015, https://www.usenix.org/conference/usenixsecurity15/technical-sessions/presentation/melara
- Parakeet (Meta key transparency, 2023), https://github.com/facebook/parakeet
- DKVE decentralized key validation (OPRF+OKVS+SPRT), arXiv 2606.26486 (2026-06-25), https://arxiv.org/abs/2606.26486
- IETF MIMI cross-provider E2EE + federated KT work (2025–2026), https://datatracker.ietf.org/wg/mimi/about/

### Provenance / content credentials
- C2PA Technical Specification v2.2 (2025–2026), https://c2pa.org/specifications/specifications/2.2/specs/C2PA_Specification.html
- SynthID watermarking (2023–2026), https://deepmind.google/technologies/synthid/
- Intent-to-trace authorship in the generative regime, Zenodo (2026-03-28), https://doi.org/10.5281/zenodo.19278163

### Sandboxing / capabilities / age / bots / sybil / email / DNS
- WebAssembly sandbox (2017–2026), https://webassembly.org/ ; browser-as-PEP (2026-01-14), https://doi.org/10.5281/zenodo.20501902
- Capability tokens: UCAN https://ucan.xyz/ ; Macaroons, NDSS 2014, https://research.google/pubs/pub41892/ ; Biscuit https://www.biscuitsec.org/
- EU age verification (2025–2026), https://digital-strategy.ec.europa.eu/en/policies/age-verification ; UK OSA/Ofcom (2025-07), https://www.ofcom.org.uk/online-safety/
- Bot detection + privacy law, Open Research Europe (2025-01-01), https://doi.org/10.12688/openreseurope.19347.1
- Proof of personhood / World ID (2024–2026), https://world.org/ ; wearable-biosignal sybil note (2026-09-03), https://doi.org/10.5281/zenodo.22288335
- DMARC, RFC 7489 (2015), https://www.rfc-editor.org/rfc/rfc7489.html ; BIMI https://bimigroup.org/
- Oblivious DNS over HTTPS, **RFC 9230** (2022-06), https://www.rfc-editor.org/rfc/rfc9230.html
- Oblivious HTTP, **RFC 9458** (2024-01), https://www.rfc-editor.org/rfc/rfc9458.html ; CODoH caching, PoPETs (2026-07-14), https://doi.org/10.56553/popets-2026-0137

---

## 2. What the map implies (the gap next to each existing thing)

- WebAuthn: authentication exists; **anonymous authorization** (prove *a property*, not an identity) does not.
- VC/SD-JWT: predicates exist; **unlinkability + private revocation + offline browser verification** do not compose.
- Anonymous credentials: theory + mDL exist; **browser runtime without pairings/BBS special code** does not.
- Privacy Pass: unlinkable single-use tokens exist; **rate-limiting + predicates + revocation + offline** do not.
- ZK: proving exists; **cheap, audited, no-trusted-setup predicates in WebCrypto-only apps** do not.
- Transparency: CT + per-app KT exist; **one open, gossiped key directory any local-first app can audit** does not.
- Deletion: crypto-shredding exists; **client-verifiable erasure evidence** does not (and is provably limited).
- Provenance: C2PA exists; **durable + privacy-preserving + browser-verifiable** does not.

---

## 3. Candidates (ranked by missing × impact × feasibility)

### C1. Key Transparency for the open web and local-first E2EE — Grade: NEW ARCHITECTURE
1. **One-liner:** an append-only, gossip-verifiable directory of user/device keys where every browser
   or local-first client verifies a hash-based inclusion/consistency proof instead of trusting a server.
2. **Gap.** Exists: CT for server certs (RFC 9162, 2022-06); per-app KT for WhatsApp (2023-04,
   https://engineering.fb.com/2023/04/13/security/whatsapp-key-transparency/), iMessage Contact Key
   Verification (2023-12, https://www.apple.com/newsroom/2023/12/apple-advances-user-security-with-powerful-new-data-protections/),
   Google transparency.dev, MIMI federated KT (2026), DKVE (arXiv 2606.26486). Does **not** exist:
   an open, client-side, gossiped KT for the web's *user* keys that any local-first app can embed.
   Load-bearing: every E2EE app fetches peer keys from a server it must trust; Web PKI authenticates
   servers, not users, so a malicious server silently swaps keys (MITM).
3. **Who hurts / scale.** Signal/Matrix/MLS web clients, CRDT collaboration, password managers,
   agent-to-agent. At scale, key lookup becomes a *proof* — a two-sided network effect (log + monitors
   + auditors), exactly the CT ecosystem but for people.
4. **Why now.** RFC 9162 hashing; transparency.dev libraries; MIMI standardizing federated KT (2026);
   DKVE cuts KT query load ~100x; SHA-256 Merkle work is trivial in WebCrypto/WASM.
5. **Architecture.** RFC 6962/9162 Merkle tree; leaves = (contextual identity, key bundle). Clients
   verify inclusion + consistency proofs to a signed tree head (STH); **non-equivocation** via STH
   gossip (client↔client exchange). Contextual identities = HKDF(account secret, relationship id)
   to prevent cross-context linkage. Threat model: equivocating/malicious directory + network MITM;
   trust = ≥1 honest gossip peer. Does NOT protect: compromised device keys, coerced-but-logged key
   changes, timing/metadata, Sybil identities, traffic analysis.
6. **Stage-1 (small team, TS, WebCrypto).** Merkle log + STH Ed25519 sign/verify, inclusion and
   consistency proofs, local STH gossip over a relay or storage, tiny log server (static files).
   Non-goals: consensus, lookup privacy (that is PIR), identity binding, federation policy.
7. **Decisive experiment (minutes, CPU-only).** 100k entries → 1k proofs; verify in browser; corrupt
   one leaf. PASS: 100% honest accept, 100% tamper reject, consistency proofs hold, proof <5 KB,
   verify <10 ms. FAIL: any false accept, or proof >5 KB.
8. **Risks.** KT *without* gossip is security theater (CT without monitors); adoption needs a log
   operator; browsers have no background gossip/UDP and limited storage; stable identifiers re-link users.
9. **Grade rationale:** components exist but the deployable, cross-app architecture does not.

### C2. Unlinkable, offline, revocable eligibility credentials — Grade: PARTIAL GAP
1. **One-liner:** one-time, holder-bound, unlinkable tokens proving a predicate ("over 18",
   "subscriber", "not sanctioned", "human") with privately checkable revocation and rate-limit nullifiers.
2. **Gap.** Exists: Privacy Pass arch/issuance (RFC 9576/9578, 2024-06) + blind RSA (RFC 9474,
   2023-10) = unlinkable single-use; VC/SD-JWT (2025) = predicates; Token Status List draft-21 (2025);
   Everlasting Anonymous Rate-Limited Tokens (2026-06-23); anamorphic attacks (PoPETs 2026-07-14).
   Does **not** exist: one browser-native token combining predicate proofs **+** private revocation
   **+** nullifier rate-limiting **+** offline verification. Today you pick *unlinkability* OR
   *attributes* OR *revocation*. Load-bearing for age gates (EU, UK OSA 2025-07), paywalls, anti-bot,
   sanctions screening without a global identity.
3. **Who hurts / scale.** Age-gated sites, subscriptions, anti-fraud, AML front-ends. At scale it
   replaces CAPTCHA + cookie + ID upload; network effect = issuer+verifier adoption like a card network.
4. **Why now.** RFC 9474 gives publicly verifiable blind sigs; EUDI wallet + EU age-verification app
   (2025–2026); ZK-18 (2025-11-03); BBS CR draft (2026-09-10); S&P-2027 device-binding work.
5. **Architecture.** Issuer RSA blind signature (RSABSSA) over a commitment to (predicate, holder
   pubkey, expiry); redemption = token + Ed25519 holder proof + HKDF-derived per-origin nullifier
   (blocks same-origin replay). Revocation = signed Merkle status list; client proves non-membership
   or fetches whole list. Threat model: malicious issuer learns nothing of redemption (blindness);
   malicious origin cannot link two redemptions; colluding issuer+origin still cannot link absent
   metadata. Does NOT protect: issuer attesting false predicates, client fingerprinting, weak
   attestation (Sybil issuance), quantum (RSA).
6. **Stage-1 (TS).** bigint RSABSSA (RFC 9474 test vectors), Ed25519 holder binding via WebCrypto,
   HKDF nullifiers, Merkle non-membership for revocation, demo page. Non-goals: no pairings/BBS,
   no PQ, no issuer federation, no hardware attestation.
7. **Decisive experiment.** Pass RFC 9474 vectors; verify blind→unblind with WebCrypto RSA-PSS;
   issue one token, redeem at two origins → distinct nullifiers; replay same origin → collision
   detected; revoke → rejected. PASS: vectors pass, 0 false accepts, no shared bytes across
   redemptions. FAIL: WebCrypto cannot verify the token or nullifiers collide.
8. **Risks.** Issuance/attestation is the real weak link (self-declared age = theater); WebCrypto
   has no raw RSA (must use JS bigint + side-channel care); revocation-list privacy; slow adoption.
9. **Grade rationale:** the composition is missing, but every part has a spec or paper.

### C3. Verifiable deletion receipts for local-first sync (accountable erasure) — Grade: PARTIAL GAP
1. **One-liner:** per-record keys plus a signed, Merkle-anchored deletion receipt proving a specific
   record was wiped and its key destroyed — verifiable offline by the data subject.
2. **Gap.** Exists: crypto-shredding; PVD research (arXiv 2304.07062, 2023-04, quantum); cloud
   deletion with IBFs (2026-08-17); semantic-resurrection caveat (2026-08-02). Does **not** exist:
   practical, standard, client-verifiable erasure evidence for federated/local-first stores you do
   not control. Load-bearing: local-first apps replicate to peers/servers; "deleted here" ≠ gone there.
3. **Who hurts / scale.** CRDT collaboration, E2EE backup, health/finance apps, agent memory. At
   scale, auditable delete lets regulators/auditors accept receipts — a network effect via demand.
4. **Why now.** GDPR/DSAR + EU Data Act enforcement; crypto-shredding normalized by E2EE; Merkle
   transparency tooling; 2026 agent-memory deletion papers.
5. **Architecture.** Record = AES-GCM(random key); key wrapped per-recipient via ECDH-ES+HKDF.
   Delete = signed tombstone {recordHash, epoch} appended to a Merkle log + destroy wrapped keys +
   delete ciphertext; receipt = inclusion proof + signed "epoch keys destroyed" + replica
   attestation. Verifier checks inclusion and re-fetches to confirm decrypt failure. Threat model:
   honest-but-curious storage, one lying replica; **detection, not prevention**. Does NOT protect:
   a replica that silently kept plaintext (unprovable), backups, malicious pre-delete client — this
   is the theater trap.
6. **Stage-1 (TS, WebCrypto).** Per-record AES-GCM + ECDH key wrap; append-only Ed25519-logged
   tombstones; receipt verify; two-node sync simulation with one "lying" node. Non-goals: no proof
   of no-hidden-copy, no hardware, no formal erasure.
7. **Decisive experiment.** 1k records, 2 nodes; delete 100, emit receipts; verify all; attempt
   decrypt of deleted records → must fail; liar node keeps plaintext → show receipt does NOT catch it
   (documented limitation). PASS: 100% receipts verify, 0 decryptable deleted records, liar case
   explicitly out-of-scope. FAIL: receipt verifies while record still decryptable.
8. **Risks.** Security theater (receipts prove logging, not erasure); tombstones replay; key backups
   defeat it; verifier demand needed.
9. **Grade rationale:** real gap, but the strong version is impossible classically.

### C4. Browser-native anonymous rate limiting / sybil resistance (RLN-style) — Grade: HARD
1. **One-liner:** anonymous proof of membership in a set (subscribers/humans/devices) enforcing a
   per-epoch rate via nullifiers, optionally with stake slashing.
2. **Gap.** Exists: Waku RLN (arXiv 2207.00116, IEEE ICDCS 2022, https://arxiv.org/abs/2207.00116),
   Semaphore (https://semaphore.pse.dev/), World ID (2024–2026), Everlasting Anonymous Rate-Limited
   Tokens (2026-06-23). Does **not** exist: a browser/local-first primitive any app can embed to
   rate-limit anonymous users with offline verification and no chain. Load-bearing: anti-spam/anti-bot
   without surveillance.
3. **Who hurts / scale.** Local-first chat/forums, comments, API abuse, faucets. At scale replaces
   CAPTCHA/phone verification; network effect lives in membership sets.
4. **Why now.** WASM proving getting cheaper; nullifier designs mature; regulatory backlash to
   CAPTCHA + ID.
5. **Architecture.** Membership Merkle tree; circuit proves membership + emits nullifier
   H(secret, epoch); verifier tracks nullifiers per epoch; violation → slash/ban. Threat: forged
   membership, replay (nullifier), Sybil if issuance is weak. Does NOT protect: strong Sybil
   resistance (issuance is the bottleneck), traffic analysis, stolen secrets.
6. **Stage-1.** Reuse an existing audited circuit (RLN/Semaphore) via snarkjs in TS; local sim. Non-goals:
   no new trusted setup, no chain, no production circuit audit.
7. **Decisive experiment.** 1k members, 1k proofs; duplicate (secret,epoch) must collide nullifier.
   PASS: 100% verify, 100% duplicate detection, prove <2 s CPU. FAIL: distinct secrets collide, or
   prove >5 s.
8. **Risks.** Proving cost/battery; trusted setup; membership centralization; unenforceable stake =
   theater; tooling is not WebCrypto-only.
9. **Grade rationale:** crypto is off-WebCrypto and issuance is unsolved; gap is real but hard.

### C5. Durable, privacy-preserving media provenance — Grade: EXISTS (C2PA) + PARTIAL GAP
1. **One-liner:** content credentials that survive re-encoding (soft binding) and prove provenance
   facts without revealing capture metadata.
2. **Gap.** Exists: C2PA v2.2, SynthID, W3C VC. Does **not** exist: durability across
   transcode/crop/screenshot **+** ZK selective disclosure of C2PA assertions **+** browser-side
   verification. Load-bearing for AI-content authenticity. URLs above (C2PA 2.2; SynthID).
3. **Who hurts / scale.** Newsrooms, platforms, courts; network effect = platforms accepting proofs.
4. **Why now.** EU AI Act transparency obligations (2025–2026); C2PA adoption; intent-to-trace work
   (2026-03-28).
5. **Architecture.** C2PA manifest + robust perceptual soft-binding hash + Ed25519 issuer signature +
   optional ZK over selected assertions; verify in browser via WASM. Threat: re-capture forgery,
   watermark removal, manifest stripping. Does NOT protect against determined removal or camera spoofing.
6. **Stage-1.** Browser C2PA manifest verifier + robust-hash prototype. Non-goals: no new watermark,
   no legal admissibility.
7. **Decisive experiment.** Add manifest, re-encode at 3 qualities + crop, measure soft-binding match.
   PASS: >90% detection on mild transforms, 0 false matches on unmarked. FAIL: <50% or false positives.
8. **Risks.** Absence of credential ≠ fake (DRM-like theater); false accusations; privacy; adversarial removal.
9. **Grade rationale:** base exists; durability + privacy are the only novel slices.

---

## 4. Verdict

| # | Candidate | Missing | Impact | Feasibility (browser TS) | Grade |
|---|-----------|---------|--------|--------------------------|-------|
| C1 | Key transparency for the web / local-first E2EE | High | High | High (WebCrypto only) | **NEW ARCHITECTURE** |
| C2 | Unlinkable revocable eligibility credentials | High | Very high | Medium (bigint RSA) | PARTIAL GAP |
| C3 | Verifiable deletion receipts | High | High | Medium; theater-prone | PARTIAL GAP |
| C4 | Anonymous rate limiting / RLN in browser | Medium-high | High | Low (ZK tooling) | HARD |
| C5 | Durable private provenance | Medium | Medium-high | Medium | EXISTS + PARTIAL GAP |

- **No 10x new primitive exists**; the frontier is *composition and deployment*, not new hardness assumptions.
- The single most buildable "new type" is **C1** (verifiable key directory), because it needs only
  SHA-256/Ed25519 and solves a silent-MITM hole in every local-first E2EE app.
- The highest-impact gap is **C2** (anonymous authorization); it is gated by attestation honesty,
  not by cryptography.
- **C3 is the theater trap:** do not ship receipts as proof of erasure; ship them as proof of logged,
  auditable deletion and say exactly that.
- All candidates are deliberately constrained to primitives implementable with WebCrypto plus JS
  bigint; **no candidate requires inventing cryptography.**
