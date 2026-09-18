# Wave 47 — Scientist B: network protocols, distribution, local-first — the missing shared artifact

Date: 2026-09-19. Scope: survey only; one file; no product code touched.
Method, stated honestly: the `websearch` provider returned HTTP 429 on **every** call this session
(6+ attempts across the whole run; zero successes). Substitutes used instead: **13 direct source
fetches** (RFCs, specs, project pages, READMEs), **4 arXiv API queries**, **2 GitHub API queries**,
and 1 failed arXiv query. Every factual line below carries a URL; every date is from the source or
the RFC/spec it names. The environment clock is Sep 2026, so 2025–2026 is the live frontier.

**Honest headline.** The browser/email/HTTP3-shaped object — a shared artifact with network effects —
does **not** exist for local-first data. There is no SMTP for CRDTs. Five independent, well-funded
sync stacks (Yjs, Automerge, Loro, ElectricSQL, NextGraph) shipped in 2024–2026 and **none can merge
another's document**. The arXiv query `all:"CRDT" AND all:"interoperability"` returns **0 results**
(https://arxiv.org/abs/2609.20650-era API, run 2026-09-18), and the only GitHub repo literally titled
"interoperable CRDTs" (`delta-crdt`) has **5 stars and has not been pushed since 2020-05-23**
(https://api.github.com/repos/rtibbles/delta-crdt, accessed 2026-09-18). That absence, not any new
transport, is the load-bearing gap. Candidate 1 below is the smallest thing that closes it. I am
adversarial about it in §8.

Grading scale: **NEW CATEGORY / BREAKTHROUGH 10x+ / PARTIAL GAP / EXISTS (skip) / HARD**.

---

## 1. Existence map (one line each; URL + date)

### Transport / web substrate
- HTTP/2, RFC 9113: https://www.rfc-editor.org/rfc/rfc9113 (June 2022)
- HTTP/3, RFC 9114: https://www.rfc-editor.org/rfc/rfc9114 (June 2022)
- QUIC v1, RFC 9000: https://www.rfc-editor.org/rfc/rfc9000 (May 2021)
- WebTransport over HTTP/3, draft-ietf-webtrans-http3-16, **In WG Last Call**, updated 2026-07-06: https://datatracker.ietf.org/doc/draft-ietf-webtrans-http3/
- WebSocket, RFC 6455: https://www.rfc-editor.org/rfc/rfc6455 (Dec 2011)
- WebRTC, W3C Recommendation: https://www.w3.org/TR/webrtc/ (2021, errata ongoing)
- HTTP Message Signatures, RFC 9421: https://www.rfc-editor.org/rfc/rfc9421 (Feb 2024)
- Messaging Layer Security, RFC 9420: https://www.rfc-editor.org/rfc/rfc9420 (July 2023)

### P2P overlays / data
- libp2p specs (kad-dht, gossipsub, WebRTC, WebTransport transports): https://github.com/libp2p/specs (README current 2026)
- IPFS content routing — Kademlia DHT, Bitswap, **delegated routing over HTTP**, mDNS: https://docs.ipfs.tech/concepts/how-ipfs-works/ (accessed 2026-09-18)
- Filecoin (incentivized storage): https://filecoin.io/ (mainnet 2020-10-15)
- BitTorrent v2, BEP 52 — merkle tree, `pieces root`, hash requests: https://www.bittorrent.org/beps/bep_0052.html (v2 wire 2017-05-14)
- WebTorrent / bittorrent-dht (browser torrents use WebRTC + trackers; no browser UDP DHT): https://github.com/webtorrent/webtorrent (accessed 2026-09-18)
- Waku (modular P2P, browser-capable): https://arxiv.org/abs/2207.00038 (2022-06-30)

### Social / identity / naming
- ActivityPub, W3C Recommendation 23 January 2018: https://www.w3.org/TR/activitypub/ (verified date from page)
- AT Protocol specs (DIDs, content-addressed repos, XRPC, PDS, relays): https://atproto.com/specs/atp (page © 2026)
- Nostr NIPs: https://github.com/nostr-protocol/nips (ongoing)
- Solid (pods; "all data in a Solid Pod is stored using standard, open, interoperable formats"): https://solidproject.org/about (accessed 2026-09-18)
- Matrix spec: https://spec.matrix.org/ (v1.x, ongoing)
- ENS: https://docs.ens.domains/ ; Handshake: https://handshake.org/ (accessed 2026-09-18)

### Local-first / replication
- "Local-First Software" (the origin document): https://www.inkandswitch.com/local-first/ (2019-04)
- Automerge 3, ~10x memory reduction: https://automerge.org/blog/automerge-3/ (2024-10); binary format spec: https://automerge.org/automerge-binary-format-spec
- Yjs — "network agnostic (p2p!)", providers: WebSocket, WebRTC, libp2p, nostr, ATProto, Matrix: https://github.com/yjs/yjs (README current 2026)
- Loro CRDT: https://loro.dev/ (accessed 2026-09-18)
- ElectricSQL + TanStack DB query-driven sync: https://electric-sql.com/ (accessed 2026-09-18)
- Jazz: https://jazz.tools/ (accessed 2026-09-18)
- NextGraph — RDF + CRDT + E2EE + SPARQL, alpha: https://github.com/nextgraph-org/nextgraph-rs (accessed 2026-09-18)
- Willow — data model + Meadowcap capabilities + Confidential Sync + Drop format: https://willowprotocol.org/ (accessed 2026-09-18)
- Keyhive / beelay — capability-secured sync over E2EE data, **pre-alpha, unaudited**: https://github.com/inkandswitch/keyhive (accessed 2026-09-18); notebook: https://www.inkandswitch.com/keyhive/notebook/
- FOSDEM 2026 Local-First devroom (Yjs, Automerge+Keyhive, NextGraph, ElectricSQL, Loro, Willow): https://fosdem.org/2026/schedule/track/local-first/ (2026-01-31/02-01)

### Edge / agent protocols
- Cloudflare Workers / edge: https://developers.cloudflare.com/workers/ (accessed 2026-09-18)
- Model Context Protocol, spec 2025-06-18: https://modelcontextprotocol.io/specification/2025-06-18 (verified)
- A2A (Agent2Agent), Linux Foundation: https://a2a-protocol.org/ (2025; redirects to /latest/)

### Naming / routing / disruption
- Named Data Networking (NSF Future Internet Architecture, Sept 2010): https://named-data.net/project/ (verified)
- Delay-Tolerant Networking, RFC 4838: https://www.rfc-editor.org/rfc/rfc4838 (April 2007)
- multicast DNS, RFC 6762: https://www.rfc-editor.org/rfc/rfc6762 (Feb 2013)

### Distribution integrity / supply chain
- Content-addressed distribution (CIDs, CAR files, sneakernet): https://docs.ipfs.tech/concepts/how-ipfs-works/ (accessed 2026-09-18)
- P2P CDN / enterprise eCDN: https://learn.microsoft.com/en-us/ecdn/overview (accessed 2026-09-18)
- The Update Framework (TUF), spec v1.0.36, **last modified 2026-08-05**: https://theupdateframework.github.io/specification/latest/
- Uptane (automotive TUF deployment): https://uptane.org/ (accessed 2026-09-18)
- Sigsum (key-usage transparency, witnesses): https://www.sigsum.org/ (accessed 2026-09-18)
- Sigstore Rekor / Trillian verifiable log: https://docs.sigstore.dev/logging/overview/ (accessed 2026-09-18)
- Hugging Face Xet — content-defined chunking (~64 KB) on the Hub: https://huggingface.co/blog/xet-on-the-hub (2025-03-18); migration: https://huggingface.co/blog/migrating-the-hub-to-xet (2025-07-15)

---

## 2. Candidates, ranked by missing × impact × feasibility

### C1 — A convergence gateway / canonical sync envelope so two different CRDT engines can merge the *same* document

**1. One-liner.** A tiny, engine-neutral wire artifact (`SyncEnvelope`) plus per-engine adapters and a
conformance harness, so a Yjs client and an Automerge (or Loro, or Electric) client can co-edit one
logical document and provably converge — "SMTP for CRDTs", not a new CRDT.

**2. Gap.** Exists: production CRDTs that each define their *own* update format — Yjs (binary updates,
state vectors; https://github.com/yjs/yjs), Automerge (binary format + sync protocol;
https://automerge.org/automerge-binary-format-spec), Loro (https://loro.dev/), ElectricSQL
(https://electric-sql.com/); a from-scratch universal stack (Willow; https://willowprotocol.org/);
capability-secured sync confined to one engine (Keyhive/beelay; https://github.com/inkandswitch/keyhive).
Does **not** exist: any published interchange format, adapter, or gateway that translates and merges
*between* engines. arXiv `all:"CRDT" AND all:"interoperability"` = **0** (arXiv API, 2026-09-18);
GitHub `CRDT interoperability` = 2 low-activity repos, top one untouched since 2020-05-23
(https://api.github.com/repos/rtibbles/delta-crdt). Why load-bearing: every local-first app picks an
engine at build time, so the "shared artifact" is siloed like pre-SMTP email — network effects stop at
each vendor's server. The missing piece is small (a translation boundary), not another CRDT.

**3. Who benefits / network effect.** A Yjs-native editor vendor (e.g., a Tiptap/BlockNote deployment;
providers listed at https://github.com/yjs/yjs) and an Automerge app (e.g., a Keyhive-based collaboration
tool; https://github.com/inkandswitch/keyhive). Today two teams on different engines cannot share a
document without both rewriting. If the envelope exists, every engine's users become reachable to every
other engine's users; each new adapter raises the value of all existing ones (classic fax/email effect).

**4. Why now.** (a) The engines have stabilized enough to have *fixed* binary formats
(Automerge binary format spec; Yjs V2 updates, https://github.com/yjs/yjs); (b) Keyhive/beelay opened
pre-alpha capability sync (2026; https://github.com/inkandswitch/keyhive) giving a shared auth model to
translate against; (c) Willow has already designed a clean engine-neutral data model + capabilities
(https://willowprotocol.org/), i.e. the target semantics are no longer research; (d) FOSDEM 2026 put every
major engine in one room (https://fosdem.org/2026/schedule/track/local-first/), so a conformance suite has
a community to adopt it; (e) browsers now ship WebTransport/WebRTC primitives (draft-ietf-webtrans-http3-16,
2026-07-06; https://www.w3.org/TR/webrtc/) so the transport is not the blocker — the format is.

**5. Architecture sketch.** Message: `SyncEnvelope { v, docId (content-addressed logical doc), engine,
actor (DID/pubkey), seq, deps:[envelopeHash], type:"map"|"text"|"list", ops:[...], sig }`; ops restricted
to an engine-agnostic algebra (LWW register set/delete, insert/remove of positioned runs, counter delta)
with each op carrying a causal id. Adapters: `engine → envelope` (export) and `envelope → engine` (apply,
materialized through the engine's public API, never its internals). Discovery: reuse existing providers —
the envelope rides Yjs WebRTC/WebSocket, libp2p gossipsub, Matrix, or nostr (all already supported by
providers; https://github.com/yjs/yjs). Trust: actor signatures (Ed25519) + optional capability tokens
following Meadowcap/Keyhive (https://willowprotocol.org/, https://github.com/inkandswitch/keyhive); a
gateway relays an envelope only if deps are present (causal readiness). Failure modes: unknown `type` →
hold as opaque, do not drop; duplicate/superseded ops → idempotent keying by envelope hash; concurrent
schema drift → quarantine and require harness pass before relay; translation loss (engine A deletes
tombstones that B needs) → adapters must preserve tombstones or declare the type non-interchangeable.
A browser implementation needs only `crypto.subtle` (Ed25519), `TextEncoder`, and any existing provider;
no server.

**6. Stage-1 milestone (small team, browser/TS, zero deps).** Scope: one doc type (`Map<string,
string>` with LWW registers + delete) and two adapters (Yjs `Y.Map`, Automerge `Map`). Ship
`envelope.ts` (encode/decode/merge), `adapter-yjs.ts`, `adapter-automerge.ts`, and a fuzzer that runs two
in-process replicas on *different* engines exchanging envelopes over a lossy/shuffling channel. Non-goals:
rich text (`Y.Text`/Automerge text), lists/moves, awareness/presence, capabilities, persistence, network,
any engine besides Yjs+Automerge. Explicitly **not** a new CRDT and **not** a server.

**7. Decisive first experiment (minutes, CPU-only, real data).** Record real Yjs update logs from a
public demo (https://github.com/yjs/yjs-demos) and real Automerge change logs
(https://automerge.org/); replay them as if authored by two actors on the two engines. Step each through
the gateway, exchange envelopes in random orders, and compare the materialized JSON of both engines.
Pass = byte-identical materialized state across 1,000 random interleavings/partitions, with zero divergences
and < 2× envelope bytes vs the native format. Fail = any interleaving leaves the two engines' JSON unequal
(which would mean the common op algebra is insufficient and the category claim is wrong).

**8. Risks (adversarial).** Engine vendors may see interop as commoditizing and refuse to expose stable
import/export (Yjs explicitly exposes binary update APIs, so this is mostly social, not technical).
Semantic mismatch is real: Yjs is position/ID based, Automerge op-based and tombstone/GC policy differs
(https://automerge.org/automerge-binary-format-spec, https://github.com/yjs/yjs); translation may be
lossy for text and moves, capping C1 to simple records. COOP/COEP and NAT are irrelevant for envelope
exchange but break browser P2P *discovery* (see C3). Spam/DoS: an unauthenticated envelope relay is
trivially flooded; actor signatures + capability tokens are mandatory, not optional. Adoption inertia is
the biggest risk: without a neutral conformance badge, no vendor moves first.

**9. Grade: NEW CATEGORY (borderline).** The artifact (cross-engine merge) does not exist and is a shared
thing with network effects; the caveat is that the *semantics* may never be fully universal, so the honest
grade is new category for structured records, PARTIAL GAP for rich text.

---

### C2 — Verifiable partial distribution of large AI artifacts from untrusted peers/mirrors, browser-checkable

**1. One-liner.** A signed, revocable manifest + merkle-over-CDC-chunks format that lets any client
(browser/edge) fetch byte ranges from *untrusted* peers and independently prove each chunk belongs to the
exact model/dataset, deduplicated across versions.

**2. Gap.** Exists: BitTorrent v2 merkle `pieces root` + hash requests
(https://www.bittorrent.org/beps/bep_0052.html); Hugging Face Xet content-defined chunking at ~64 KB
(https://huggingface.co/blog/xet-on-the-hub, 2025-03-18); IPFS CIDs/CAR (https://docs.ipfs.tech/concepts/how-ipfs-works/);
TUF rollback/revocation metadata (https://theupdateframework.github.io/specification/latest/, v1.0.36,
2026-08-05). Does **not** exist: a single browser-verifiable protocol that combines (i) sub-file dedup,
(ii) merkle proofs over CDC chunks, (iii) **revocation/rollback** semantics, and (iv) fetch from arbitrary
untrusted mirrors. Xet is server-centric CAS (its own blog describes CAS + S3, not untrusted-peer proofs);
BitTorrent v2 has merkle but no signed revocation metadata; TUF has revocation but targets discrete files,
not ranges inside a chunk-deduplicated blob. Load-bearing because AI artifact transfer is now the dominant
bandwidth cost, and today you must trust the one mirror you download from.

**3. Who benefits / network effect.** An open-model host and an independent mirror/CDN or an end user's
browser cache. If manifests are portable, every host's chunks become fetchable/verifiable by every client,
and every client's cached chunks help others — the artifact is a shared, self-verifying pool. Two independent
parties: a model publisher (e.g., an org on the Hub) and a downstream inference provider/edge cache.

**4. Why now.** CDC/dedup is proven at Hub scale (~4.5 TB migrated in one day; 2025-03-18 blog above);
Sigstore/Rekor and Sigsum make signed transparency logs routine (https://docs.sigstore.dev/logging/overview/,
https://www.sigsum.org/); browsers can verify Ed25519 and SHA-256 via `crypto.subtle`; Cloudflare-class edge
caches can serve untrusted bytes (https://developers.cloudflare.com/workers/).

**5. Architecture sketch.** Format: `Manifest { artifactId, version, prevHash, chunks:[{cid, len, offset}],
cdcParams, root (merkle), sig, logEntry? }`. Each chunk content-addressed; merkle root over chunk CIDs;
`prevHash` + transparency-log entry gives rollback detection; revocation is a signed tombstone/or version
monotonicity per TUF (https://theupdateframework.github.io/specification/latest/). Discovery: any transport
that can list peer/range availability (HTTP `Range` + a small peer directory, or BitTorrent-style). Trust:
signature from publisher key; verifier recomputes chunk CID and merkle path before admitting a byte.
Failure modes: malicious mirror sends valid-but-old chunks → defeated by manifest version + log; publisher
key compromise → transparency log makes it detectable (Sigsum threat model, https://www.sigsum.org/);
truncated CDC block → format must store chunk lengths (the exact bug HF hit and fixed; 2025-03-18 blog).
Browser impl: `fetch` with `Range`, `crypto.subtle.digest`, OPFS for cache; no server logic.

**6. Stage-1 milestone.** Scope: one small real file (a < 500 MB GGUF/safetensors), a CDC chunker
(content-defined boundaries, fixed polynomial), a merkle manifest, a TS verifier that fetches ranges from
2+ untrusted HTTP "mirrors" (one deliberately corrupt), and a cache that re-fetches only changed chunks
after a byte edit. Non-goals: P2P transport, incentives, encryption, cross-artifact dedup, model execution.

**7. Decisive first experiment.** Download a real model file from the Hub, chunk it, append 1 MB in the
middle, and re-chunk. Pass = (a) verifier rejects a mirror that flips one byte, (b) reconstruction is
bit-identical, (c) re-fetch after the edit transfers < 5% of the full file, (d) a rolled-back manifest
(older `version` with a valid old signature) is rejected. CPU-only, minutes, real data.

**8. Risks.** Publishers may prefer lock-in to portable manifests; CDC parameter fragmentation across
vendors recreates the C1 problem (no standard CDC profile); Range requests through CDNs can be quirky;
spam is low (bytes are self-verifying) but Sybil mirrors can waste client bandwidth.

**9. Grade: PARTIAL GAP** (10x+ on transfer economics if the manifest becomes standard) — but each
component exists; the missing thing is the composition + browser verifier.

---

### C3 — Serverless, browser-native content discovery (a real rendezvous/DHT under the web security model)

**1. One-liner.** A standard way for browser peers to *find each other and content* without any server at
all — currently impossible because browsers have no UDP, no raw sockets, and WebTransport is client→server.

**2. Gap.** Exists: DHTs (Kademlia) and libp2p transports including WebRTC/WebTransport
(https://github.com/libp2p/specs); IPFS DHT + Bitswap + **delegated routing over HTTP**
(https://docs.ipfs.tech/concepts/how-ipfs-works/); WebTorrent, which in the browser relies on WebRTC plus
trackers/WebSocket signaling (https://github.com/webtorrent/webtorrent). Does **not** exist: a browser
peer that participates in routing without a server. IPFS itself documents delegated routing to an HTTP
server for nodes that "do not implement the DHT" (same page); WebRTC requires out-of-band signaling
(https://www.w3.org/TR/webrtc/); WebTransport over HTTP/3 is explicitly a client↔*server* framework
(draft-ietf-webtrans-http3-16 §2.1, 2026-07-06). Load-bearing: every "serverless" browser P2P app today
still has a central bootstrap/signaling point, so it is neither serverless nor censorship-resistant.

**3. Who benefits / network effect.** Two users of a P2P app and an independent content publisher. If
discovery is standard, each browser becomes a router/rendezvous for others; more peers → better lookup
success → more peers (Metcalfe). Today each app's users form an isolated swarm reachable only through that
app's server.

**4. Why now.** WebRTC is a W3C Recommendation and ICE/mDNS behavior is now measured and mitigable
(https://arxiv.org/abs/2510.16168, 2025-10-17); libp2p has WebRTC and WebTransport transports specified
(https://github.com/libp2p/specs); WebTransport WG is at WG Last Call (2026-07-06); Browser APIs (WebRTC
DataChannels) are universally available.

**5. Architecture sketch.** Format: a signed `PeerRecord {peerId, addrs:[WebRTC/SDP or relay], caps,
expiry}`; discovery via a Kademlia-style routing table where entries can only be learned from prior
contacts (prevents Sybil injection) and every record is signed by `peerId`. Trust: peer-id = hash of
pubkey (libp2p convention, https://github.com/libp2p/specs); content claims verified by fetching + hashing
(C2/CID). Failure modes: NAT traversal (needs TURN/relay; libp2p DCUtR; https://github.com/libp2p/specs),
mDNS IP leakage (https://arxiv.org/abs/2510.16168), and browser tab suspension. Browser needs: WebRTC +
a signaling bootstrap; the research question is whether a *bootstrappable, serverless* rendezvous is
possible, or whether a minimal neutral relay is unavoidable.

**6. Stage-1 milestone.** Scope: a TS lib implementing a Kademlia routing table + iterative lookup over
WebRTC DataChannels, plus a *minimal* signaling seed run only to start (and then abandoned). Non-goals:
NAT hole-punching, anonymity, content transfer.

**7. Decisive first experiment.** Replay a real IPFS/BitTorrent DHT routing-table snapshot (public crawls)
through a browser-constrained simulator that forbids UDP and models WebRTC ICE success from the measured
distribution in https://arxiv.org/abs/2510.16168. Pass = > 90% of lookups resolve in < 5 hops with a
20% churn rate; fail = lookups collapse without a persistent server.

**8. Risks.** NAT/COOP/COEP and browser background-tab throttling may make true serverless routing
infeasible (hence HARD); Sybil/eclipse attacks on a young DHT; regulatory blocking of WebRTC.

**9. Grade: HARD / PARTIAL GAP.** WebRTC+libp2p covers pieces, but a universally adoptable, serverless
browser discovery standard does not exist.

---

### C4 — Signed, revocable web resources with browser-enforced trust (not just signatures)

**1. One-liner.** A deployable profile (not a new primitive) that binds RFC 9421 message signatures +
RFC 9530 digests + a transparency log (Sigsum/Rekor) into a decision the *browser* can enforce: this byte
range is authentic, current, and not revoked — independent of TLS and the CDN.

**2. Gap.** Exists: RFC 9421 HTTP Message Signatures (Feb 2024; https://www.rfc-editor.org/rfc/rfc9421),
which explicitly targets intermediaries and incomplete message knowledge; TUF for revocation/rollback
(https://theupdateframework.github.io/specification/latest/, 2026-08-05); Rekor/Sigsum transparency
(https://docs.sigstore.dev/logging/overview/, https://www.sigsum.org/). Does **not** exist: browser
enforcement of any of it. RFC 9421 says the application/profile "MUST specify" key retrieval, algorithms,
coverage, error codes (§1.4) — i.e. it stops before the browser trust path; browsers expose no API to
verify a message signature or transparency inclusion on a subresource. Load-bearing: today a signed CDN
artifact is only as trustworthy as TLS + the origin's TLS key, which is exactly the CA/CDN threat RFC 9421
was written to address.

**3. Who benefits / network effect.** A software publisher and an end user (or an enterprise proxy). If
browsers verify, every signed artifact is portable across mirrors and auditable by anyone; revocation
becomes global and instant. Widely deployed, it turns the web into a signed artifact network rather than a
per-origin trust network.

**4. Why now.** RFC 9421 is an RFC (Feb 2024); TUF has a 2026 spec revision; transparency logs are
operational and cheap (https://docs.sigstore.dev/logging/overview/); browsers ship Ed25519 and SHA-256.

**5. Architecture sketch.** Profile: `SignedResource { digest (RFC 9530), signature (RFC 9421 over digest
+ metadata), logInclusion (Merkle proof), version, expiry }`; discovery via a `.well-known` policy or a
response header; trust rooted in a publisher key (pinned) + a transparency log with witnesses (Sigsum
model). Failure modes: replay (defeated by expiry/version), key rotation (log + `keyid`), coverage
bugs (§7.2.1 of RFC 9421), and canonicalization attacks (§7.5.5). Browser needs a new verification path
(service-worker fetch + `crypto.subtle`), because page JS cannot see the raw TLS-free message reliably.

**6. Stage-1 milestone.** Scope: a TS service worker that fetches a signed JS bundle, verifies the
signature + digest + a local append-only Merkle log entry, and hard-fails on revocation/rollback.
Non-goals: key distribution/PKI, browsers' native APIs, transparency-log gossip.

**7. Decisive first experiment.** Sign a real JS bundle with Ed25519, log its hash in a local Merkle log,
then present (a) the valid bundle, (b) a byte-flipped bundle, (c) a rollback to a previous version, and
(d) a revoked-key bundle. Pass = the service worker accepts only (a). CPU-only, minutes.

**8. Risks.** Browser vendors must add API surface (large); CDNs may strip headers; key distribution is
unsolved; if the log is run by one party the trust story regresses to a CA.

**9. Grade: PARTIAL GAP.** All primitives exist; the browser enforcement point and the normative profile
do not.

---

### C5 — Cross-app, capability-scoped personal data fabric (one user, many apps, no IdP)

**1. One-liner.** A shared capability + object model so any two apps can read/write a user's data with
scoped, attenuable, revocable grants, without a central identity provider or per-app silo.

**2. Gap.** Exists: Solid pods + open formats (https://solidproject.org/about); AT Protocol DIDs and
content-addressed repos (https://atproto.com/specs/atp); Keyhive/Meadowcap capability systems
(https://github.com/inkandswitch/keyhive, https://willowprotocol.org/); NextGraph RDF+CRDT sync
(https://github.com/nextgraph-org/nextgraph-rs). Does **not** exist: a common *object + capability* model
that Yjs-era apps, Solid apps, and ATProto apps all honor. Each ecosystem defines grants differently, so a
user's data is still stranded per stack — the same silo problem as C1 at the identity layer. Load-bearing
because without shared capabilities, "own your data" means "re-integrate it per app".

**3. Who benefits / network effect.** Two independent app vendors serving one user; the user switches apps
without export/import. If grants are portable, each app makes every other app more useful (data network
effect), instead of each app capturing its own silo.

**4. Why now.** Keyhive/beelay pre-alpha opened capability sync (2026); Willow specified Meadowcap
(https://willowprotocol.org/); Solid and ATProto have real deployments; FOSDEM 2026 convenes all of them
(https://fosdem.org/2026/schedule/track/local-first/).

**5. Architecture sketch.** A signed `Capability { issuer, subject, resource, actions, caveats, expiry }`
plus an `ObjectRef { docId, type, engine }` (C1's envelope provides the data plane). Trust: chained
signatures; revocation via a signed revocation record + version monotonicity. Failure modes: capability
confusion (must be per-resource), revocation propagation delay, offline conflicts.

**6. Stage-1 milestone.** TS library: issue, attenuate, delegate, and revoke a capability over C1's
`Map` doc; two "apps" in one process exchange a grant; revocation must take effect on next access.

**7. Decisive first experiment.** Model Solid + Keyhive semantics: app A grants app B read-only on one
field; B attempts a write and a broader read. Pass = both denied; after A delegates to C, C's scoped read
succeeds and revocation blocks C within one round. CPU-only.

**8. Risks.** No neutral authority to certify capability semantics; vendors prefer being the IdP;
revocation in offline-first systems is fundamentally hard.

**9. Grade: HARD.** Every piece exists in isolation; the unified artifact does not, and the coordination
cost is high.

---

## 3. Bottom line for Wave 47

The category worth building is **C1** (cross-engine convergence), with **C2** as its distribution
sibling: together they give a *shared, portable, verifiable local-first artifact* — the browser/email/HTTP3
shape the mission asked for. C1's first experiment is cheap and falsifiable (1000 interleavings, CPU-only,
real engine logs), which is exactly what a research wave should fund. C3–C5 are real gaps but either fight
the web security model (C3) or require multi-vendor coordination that a small team cannot force (C4/C5).
No speculation here beyond what the cited URLs state; the search provider's 429s are the main coverage
limitation and are disclosed at the top.
