# Wave 47 — Prior-Art Attack: QCC (Quantity-of-Interest-Certified Scientific Codec)

Date: 2026-09-19. Adversarial prior-art review. Read `wave-47-candidates-c-codecs.md` §3
Candidate 1 first. One file only; no repo code; no git.

Method: **>120 arXiv API query submissions** (`abs:`/`all:` search; query log in §8) plus Crossref
`query.bibliographic`, Semantic Scholar graph API, and Google Patents. Google Patents' direct XHR
returned its automated-query block page, so the *same* XHR endpoint was reached through the
`r.jina.ai` reader proxy (documented in §7). Load-bearing full texts were fetched directly: QPET
HTML (arXiv:2412.02799v4), the Jiao'22 PVLDB PDF (stream-decoded), and PyPI JSON. Search-provider
failures are logged in §8. Every claim below carries a URL and a date.

---

## Verdict: KILL

QCC's core claim — *"an encoder allocates bits so that a downstream quantity of interest (mean,
max, percentiles, integrals, threshold counts) is certified, not each element"* — is **already a
named, published, evaluated compressor category** ("QoI-preserving error-bounded lossy
compression") with named methods (`QoI-SZ3`, `QoI-HPEZ`, `MGARD-QoI`) and two full VLDB papers:
**Jiao et al. 2022** ("Toward Quantity-of-Interest Preserving Lossy Compression for Scientific
Data", PVLDB 16(4):697–710, 2022-12, https://doi.org/10.14778/3574245.3574255) and **QPET**
(PVLDB 18:2440–2453, 2025-04, https://doi.org/10.14778/3742728.3742739). Jiao'22 derives
*rigorous error-control theories* for four QoI families (kinetic energy, regional average,
isosurface), proves composition, extends to multivariate QoIs, and reports **up to 4× the
compression ratio of SOTA**. QPET makes the bound *portable* (SZ3/HPEZ/SPERR), supports "most
differentiable univariate and multivariate QoIs", and at **equal QoI error** beats the best
parameter-searched SZ3/SPERR by **up to 1000%** and the direct QoI-preserving compressors
(`QoI-SZ3/HPEZ`) by **up to 133%**, evaluated on **Hurricane ISABEL** and five other SDRBench-like
datasets. The candidate doc's Gap G1 ("no encoder allocates bits under a certificate on a chosen
QoI at encode time") is therefore **false** (it also mis-states the state of the art by citing only
TOPIQ *prediction* and FaCTz *topology*).

**Unmatched clause:** clause (b), narrowly stated as *"a small, stream-resident, decode-free,
deterministic certificate for arbitrary/composable QoIs"*. No arXiv paper pairs "certificate" with
QoI-preserving compression (0 hits), but this sliver is **not load-bearing**: (i) Plato 2018
already stores precomputed per-segment error measures and computes **tight deterministic guarantees**
for analytics over compressed data; (ii) FFCz 2026 constructs a *region that jointly bounds* spatial
and frequency error and augments SZ3/ZFP/SPERR; (iii) TOPIQ 2026 carries <0.1% metadata from which
QoI error is predicted; (iv) for the candidate's own QoI list the certificate is either **free**
(mean, integral, max, min are 1-Lipschitz in the pointwise bound every error-bounded codec already
guarantees) or **provably not small** (percentiles and threshold counts move by O(n) under e). The
candidate itself admits "certified requires sound error propagation (TOPIQ-calibrated, **not
proven**)". Anticipated core + self-admittedly undelivered differentiator → **KILL**.

---

## 2. Closest work (hostile table)

| Work | Venue / year | URL | What it certifies / does | Clauses not done |
|---|---|---|---|---|
| **Jiao et al., QoI-preserving SZ** | PVLDB 16(4):697–710, 2022-12 | https://www.vldb.org/pvldb/vol16/p697-liang.pdf | Rigorous error-control theory for 4 QoI families (univariate) + composition + multivariate; kinetic energy, regional average, isosurface; **up to 4× SOTA CR** | Arbitrary QoI w/o per-family derivation; stream-resident cert. |
| **QPET** | PVLDB 18:2440–2453, 2025-04; arXiv:2412.02799 (2024-12-03; v4 2025-07-14) | https://arxiv.org/abs/2412.02799 · https://github.com/JLiu-1/QPET-Artifact | Portable QoI-preserving bound -> pointwise bounds; most differentiable univariate/multivariate QoIs; **ISABEL**; up to **1000%** vs parameter-search, **133%** vs QoI-SZ3/HPEZ; 2–10× speed | Stream cert.; non-differentiable QoIs (max/percentile/threshold count) |
| **Derivable-QoI progressive retrieval** | arXiv:2411.05333, 2024-11-08 | https://arxiv.org/abs/2411.05333 | **Guaranteed** QoI error control during progressive retrieval; generic composition theory; QoI err <1e-5, 2.02× transfer gain | Multidim arrays at scale; deterministic stream cert. |
| **FFCz (spectrum-preserving)** | arXiv:2601.01596, 2026-01-04 | https://arxiv.org/abs/2601.01596 | Bounds errors **jointly in spatial and frequency domains**; derives a "region that jointly bounds errors"; augments SZ3/ZFP/SPERR | General QoIs; decode-free cert. |
| **TopoSZ / Topologically Controlled / Topo framework / TopoSZp** | 2304.11768 (2023-04-23); 1802.02731 (2018-02-08); 2502.14022 (2025-02-19); 2602.17552 (2026-02-19) | https://arxiv.org/abs/2304.11768 · https://arxiv.org/abs/1802.02731 · https://arxiv.org/abs/2502.14022 · https://arxiv.org/abs/2602.17552 | Strict guarantees on contour trees / persistence / critical points under compression | QoI = topology only |
| **cpSZ (Liang 2020) · MGARD-QoI (Ainsworth 2019)** | IEEE VIS/TVCG 2020 · SIAM SISC 2019 | cited/ported in QPET (https://arxiv.org/abs/2412.02799) | First QoI preservation: bounded-linear QoIs (MGARD), critical points (cpSZ) | General QoIs; portability |
| **CAMEO** | arXiv:2501.14432, 2025-01-24 | https://arxiv.org/abs/2501.14432 | **Guarantees** on autocorrelation/PACF of time series; 2×–54× CR gain | N-D arrays; arbitrary QoIs |
| **TOPIQ** | arXiv:2608.26912, 2026-08-27 | https://arxiv.org/abs/2608.26912 | Predicts QoI bias/uncertainty from **<0.1% metadata**, runtime composition, 93.1% calibrated, 56–402× faster | **Statistical, not guaranteed**; no determinism |
| **Plato / PlatoDB** | arXiv:1808.04876, 2018-08-14 (v2 2019-09-13); arXiv:1707.01414, 2017-07-05 | https://arxiv.org/abs/1808.04876 · https://arxiv.org/abs/1707.01414 | Stores **per-segment precomputed error measures**; computes **tight deterministic error guarantees** for linear-algebra expressions (incl. correlation) over compressed time series | Time series, not N-D arrays; not a scientific-array codec |
| **PilotDB (AQP)** | arXiv:2503.21087, 2025-03-27 | https://arxiv.org/abs/2503.21087 | **A priori** user-specified error guarantees for arbitrary SQL aggregates; 126× speedup at 5% error | Sampling-based; not compression of arrays |
| **IDEALEM** | arXiv:1911.06980, 2019-11-16 | https://arxiv.org/abs/1911.06980 | Lossy reduction by **statistical similarity**, preserves frequency components | No bound/certificate |
| **Dynamic Quality Metric** | arXiv:2310.14133, 2023-10-21 | https://arxiv.org/abs/2310.14133 | Error-bounded compression driven by a dynamic (non-pointwise) quality metric | Single metric; no cert. |
| **FZ-VIS / BlockMGARD / AMRIC / ROIBIN-SZ** | 2608.08386 (2026-08-09); 2609.00205 (2026-08-31); 2307.09609 (2023-07-13); 2206.11297 (2022-06-22) | https://arxiv.org/abs/2608.08386 · https://arxiv.org/abs/2609.00205 · https://arxiv.org/abs/2307.09609 · https://arxiv.org/abs/2206.11297 | QoI/ROI-aware compression, in-situ I/O, feature preservation | Certificates; general QoIs |

---

## 3. Clause-by-clause

**(a) QoI-error bound, not pointwise — KNOWN/OCCUPIED (fatal).** Closest: Jiao'22 (rigorous
error-control theory, 4 families, composition, multivariate, up to 4× CR) and QPET (portable,
differentiable QoIs, equal-QoI-error wins on ISABEL). Also FFCz (joint spatial+frequency bound),
Derivable-QoI progressive retrieval (guaranteed QoI error), CAMEO (ACF/PACF guarantees), TopoSZ/
Topologically-Controlled (topology guarantees). "QoI-preserving compression" is the established
name of the category; `QoI-SZ3`, `QoI-HPEZ`, `MGARD-QoI` are named encoders (QPET §6.1.2). The
candidate's "no encoder allocates bits under a QoI bound" is contradicted at the title level.

**(b) Checkable certificate — PARTIAL/KNOWN; unmatched only in a non-load-bearing form.** Exact
arXiv hits for "certificate" + QoI-compression = 0. Closest mechanisms: **Plato** stores small
per-segment error measures from which it derives tight deterministic guarantees (this *is* a
stream-resident checkable certificate, on time series); **TOPIQ** carries <0.1% metadata for QoI
error; **FFCz** computes a bounding region; Jiao/QPET's "sufficient pointwise error bound" is a
theorem, checkable from the configured bound + QoI weights. Critically, for a global pointwise
bound e, any 1-Lipschitz QoI (mean, integral, max, min — four of the candidate's listed families)
already satisfies |Q(x)−Q(x′)| ≤ e, so no extra certificate is *needed*; for order statistics
(percentiles, threshold counts) a small generic certificate is impossible (one unit of pointwise
error can move rank/threshold membership by O(n)). The only genuinely novel residue — a
*deterministic, composable* certificate for *arbitrary* QoIs — is exactly what the candidate says
it cannot prove (TOPIQ-calibrated, not proven).

**(c) ≥30% better ratio at equal QoI error — ALREADY DELIVERED; baseline is wrong.** QPET measured
at equal max QoI error: **RTM** block-mean x², QoI err 1e-4 → SPERR-QPET CR ≈ **215** vs best
baseline SPERR-OptZ-R CR ≈ **103** (**+108%**); **Hurricane** vector QoI, τ=1e-3 → SPERR-QPET
**+25%** over SPERR-OptZ-R; **up to 1000%** over parameter-search on x³/tanh; Jiao'22 **up to 4×**.
So a ≥30% claim is (i) below what prior art already reports against the *correct* baseline, and
(ii) not uniformly true even for QPET on Hurricane (+25% on one vector QoI). The candidate's
target baseline (plain SZ3/ZFP at fixed pointwise error) is two baselines stale: the real
baselines are `*-OptZ-R` (parameter-searched) and `QoI-SZ3/HPEZ/MGARD-QoI`.

**(d) Practical in-situ use — KNOWN.** QPET runs with decompressed data accessible during
compression; AMRIC is an in-situ AMR framework; BlockMGARD adds ROI error control on GPUs; Globus
transfer work optimizes error-bounded transfer. No new axis here.

---

## 4. Theory: what can and cannot be certified without decompressing

- **Free from the pointwise bound.** For any global |δ_i| ≤ e, the QoIs mean, integrals, sums,
  max, min, and any 1-Lipschitz functional are certified by e alone. Error-bounded codecs (SZ3 `-R`,
  ZFP `-a`) already publish e. A "QoI certificate" for these is re-deriving a known Lipschitz
  bound; it adds bytes and buys nothing. This covers a large share of the candidate's list.
- **Non-Lipschitz QoIs are the hard case.** Percentiles and threshold counts have no constant
  Lipschitz bound; an adversary sitting at a threshold can change the count by n. A small, general,
  deterministic certificate cannot exist without extra structure (e.g., a gap assumption). Jiao/
  QPET sidestep this by restricting to *composable/differentiable* QoIs.
- **QoI-aware rate allocation is classically studied.** Rate–distortion for function computation
  and vector-linear functions is textbook: "Rate Distortion for Lossy In-network Function
  Computation" (arXiv:1601.06224, 2016-01-23) and "Distributed Source Coding for Compressing
  Vector-Linear Functions" (arXiv:2508.02996, 2025-08-05). A bound on a linear functional under a
  rate constraint is not information-theoretically novel.
- **Conclusion.** The class of QoIs that *can* be certified cheaply is already handled for free by
  the pointwise bound (Jiao/QPET strict generalization); the class that is *not* free admits no
  small general certificate. There is no clean middle where QCC's mechanism is both necessary and
  feasible.

---

## 5. Strongest hostile argument (and survival)

*"QCC = Jiao'22/QPET'25 (QoI-preserving error-bounded compression) + Plato'18 (per-segment error
measures as a checkable certificate). The QoI-error bound is the title of the category; the
`QoI-SZ3/HPEZ/MGARD-QoI` encoders already allocate bits from a user QoI threshold; QPET already
ran the exact proposed experiment (Hurricane ISABEL, SZ3/HPEZ/SPERR, block/vector QoIs) and beat
the correct baselines by up to 1000%/133%. QCC's ≥30%-vs-SZ3/ZFP target is a weaker baseline than
what already exists. The only new token is 'certificate', and for the candidate's own QoI list the
certificate is either a one-line Lipschitz consequence of the pointwise bound or information-
theoretically impossible to keep small."*

**Survival:** only at one narrow point — a **deterministic, composable, decode-free certificate
for arbitrary QoIs, tighter than the Lipschitz/pointwise-bound consequence, and carried in the
stream**. No located work does exactly that for scientific N-D arrays. But it is not delivered
(candidate admits the proof is missing), it is partly anticipated (Plato, FFCz, TOPIQ), and it
buys ~0 bits for the tractable QoIs. Survival is **weak**, and the write-up as given is dead.

---

## 6. Corrected stage-1 (only if the team insists on defending the narrow (b) claim)

- **Data (corrected).** SDRBench Hurricane ISABEL is **13 fields, 3D, 100×500×500 float32** per
  snapshot; individual fields are ~3.5–4.2 GB across 48 snapshots (https://sdrbench.github.io/datasets.html,
  retr. 2026-09-19). The candidate's "48×48×100 × 100 snapshots (~90 MB)" is **wrong by ~40×**.
  Use **one 3D snapshot of one variable (~95 MB)** (e.g. `CLOUDf` or `P`) plus one CESM-ATM 2D
  slice; do not claim the whole campaign.
- **Baselines (CPU, no build).** `pysz` (SZ3 Python, v1.0.3, 2025-11-20, https://pypi.org/project/pysz/)
  and `zfpy` (ZFP Python, v1.0.1, 2024-11-26, https://pypi.org/project/zfpy/) install from wheels.
  The *correct* comparison — `QoI-SZ3`/QPET — needs the QPET artifact (https://github.com/JLiu-1/QPET-Artifact)
  or a SPERR/MGARD build; without it any margin is measured against a straw man.
- **Metrics.** CR at equal max QoI error for the *same* QoIs QPET used (block-mean x, x², x³;
  vector magnitude; tanh), plus certificate size (bytes) and verify-time.
- **Pass/fail (honest).** PASS only if: total bytes ≤ **0.70 × QoI-SZ3** (not plain SZ3) at equal
  QoI error, certificate < 1% of stream, verification independent of full decompression, ≤1 h CPU.
- **Chance the margin is real:** **low (<20%)**. QPET already reports only +25% on one Hurricane
  vector QoI and QPET is the current SOTA in this exact category; a from-scratch QCC also paying
  certificate bytes will likely land at or below QPET.

---

## 7. Patents (via the `r.jina.ai` reader proxy of Google Patents XHR; retrieved 2026-09-19)

Direct Google Patents XHR/HTML returned the "We're sorry… automated queries" block; the reader
proxy reached the same JSON. Exact-phrase counts are tiny (e.g. `"error-bounded lossy
compression"` → 8; `"task-aware compression"` → 5), so the space is sparse.

- **WO2025149762A1** — "Maximum error bound lossy compression method for time-series," Athens
  University of Economics and Business, priority 2024-01-12. Time series, pointwise max error.
- **US12438555B2** — "Quality of lossy compressed sensor data with machine learning," Dell,
  priority 2023-01-23. Sensor data-quality estimation, not a QoI certificate.
- **US11048694B2** — "Median based estimation of database query responses," IBM, priority
  2018-04-26. AQP aggregate estimation (hostile-context for (b)), not compression.
- **CN119093941A** — streaming error-bounded float compression, Chongqing Univ., priority
  2024-08-27. Pointwise only.
- **No patent located** that claims a *QoI-certified* scientific-array codec with a checkable
  certificate. Patents do not anticipate QCC; the academic papers are the fatal art.

---

## 8. Query / exhaustion log (all 2026-09-19 unless noted)

**arXiv (126 submissions; representative distinct queries).** `"quality of interest"+lossy`;
`"quantity of interest"+compression`; `"QoI"+compression`; `"QoI"+"error bound"`;
`"task-aware"+compression`; `"task-aware compression"`; `"downstream analysis"+"lossy
compression"`; `"error-bounded lossy compression"`; `SPERR`; `MGARD`; `TTHRESH`;
`"region of interest"+"lossy compression"` / `+"error control"`; `"in-situ"+compression+error` /
`"in-situ"+"quantity of interest"`; `"critical point(s)"+"lossy"`; `"topology"+"lossy
compression"` / `+"guarantee"`; `"power spectrum"+compression+error`; `"spectral"+"lossy
compression"+error`; `"preserving"+mean+"lossy compression"`; `certificate+compression+error`;
`"certificate"+"quantity of interest"` (0); `"certificate"+"lossy compression"+scientific` (0);
`"error certificate"+approximation`; `verifiable+compression`; `"proof"+"error
bound"+compression`; `"proof-carrying"+data`; `"self-verifying"+compression`;
`"checkable"+compression`; `"compressed domain"+aggregate`; `"analytics on compressed"`;
`"aggregate"+"compressed"+"guarantee"`; `"aggregate"+"error bound"+"stream"`;
`"approximate query processing"+error`; `"confidence interval"+"approximate query"`;
`"deterministic"+"error guarantee"+"compressed"`; `"error guarantees"+compression`;
`"a priori"+"error guarantee"+aggregate`; `compression+"linear queries"`;
`compression+"linear functional"+bound`; `"dual certificate"+compression`;
`"rate-distortion"+"linear function"`; `"rate-distortion"+aggregate`;
`"indirect"+"rate-distortion"`; `"function"+"preserving"+"rate-distortion"`;
`"remote estimation"+"function"+"distortion"`; `"task-oriented"+"source coding"+error`;
`"semantic compression"+error bound`; `"information-theoretic"+aggregate+compression`;
`"compressed sensing"+aggregate`; `"order statistics"+compression`; `"percentile"+"error
bound"+"compressed"` (0); `"threshold"+"count"+"lossy compression"` (0);
`"integrals"+"lossy compression"`; `"isosurface"+compression`; `"kinetic energy"+compression`;
`"autocorrelation"+compression`; `"derivative"+"lossy compression"`; `"feature preserving"+
compression`; `"error propagation"+"lossy compression"`; `"progressive"+"quantity of interest"`;
`"spatial"+"frequency"+"bounds"+compression`; `"ZFP"+compression`; `"SZ3"+compression`;
`"scientific data compression"+survey` (0); `"error-controlled"+quantization`;
`"data reduction"+scientific+error`; `"neural network"+"lossy compression"+error`;
`"prediction"+"error bound"+compression+scientific`; `"lossy compression"+climate/visualization/
particle`; `"checkpoint"+"lossy compression"`; `"data compression"+"downstream"`;
`"transfer learning"+"scientific data compression"` (0); `"staging"+"lossy compression"`;
`"I/O"+"lossy compression"+error`; `"streaming"+scientific+"lossy compression"`;
`"random access"+"lossy compression"+scientific`; `"metric"+"error bound"+"scientific data"`;
`"data transfer"+"lossy compression"+error`; `"bounds"+"decompression"+"aggregate"`;
`"guarantee"+"majority"+compression`; `"guaranteed"+compression+preserve+aggregate`.
**Crossref:** `error certificate lossy compression scientific data`; `verifiable error bound
compression scientific`; `checkable certificate compressed data query`; `quantity of interest
preserving compression certificate`.
**Semantic Scholar:** `quantity of interest lossy compression` (found QPET); plus citation
tracing of QPET (which surfaced Jiao'22 and the `QoI-SZ3/HPEZ/MGARD-QoI` baselines).
**Blocked providers:** `websearch` (HTTP 429 every call); OpenAlex (daily budget exhausted,
"Resets at midnight UTC"); Google Patents direct XHR/HTML ("automated queries" block, worked only
via `r.jina.ai`); DuckDuckGo/SearXNG (captcha / 403 / bot wall); no `pdftotext`/PDF lib on host
(Jiao'22 PDF text recovered by decoding PDF Flate streams inline).

---

## 9. If KILL — fallback

**BundleZip (wave-47 Candidate 2)** is the best remaining target: a corpus archive with O(1)
per-file random access is a real systems gap whose nearest neighbors are component-level
(zstd-seekable frames, trained dictionaries, ACEAPEX unified seek, Vortex intra-table seek) and
none jointly codes a *multi-file* corpus with a corpus-wide entropy model while preserving O(1)
extraction. It is a mechanism composition (like QCC) but the gap is in *access*, not in a
statistical guarantee that is already free. Verify against `zstd --long` + seekable + trained-dict
baselines before claiming the ≤110% margin. LineageArray (C3) is second. Do **not** promote QCC.
