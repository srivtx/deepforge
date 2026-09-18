# Wave 47 — Candidate C: Non-Weight Compression / Decompression (Scientist Survey)

Scope: survey only (no code, no git). One artefact: this file. Date: 2026-09-19.
Mission: find NEW compression/decompression tech (NOT ML weights — ZipLLM/quant/pruning already killed in
`wave-46-candidates-c-compression.md`): media, scientific arrays, genomics, geometry, tabular, text, datasets.
Method: existence map first (URL + date per line), gaps that survive, then 4 candidates ranked by
(missing × impact × CPU-feasibility). Websearch provider returned HTTP 429 this session; all sources were
retrieved directly (27 fetch actions: arXiv API/abs, OpenAlex, Wikipedia, project sites) and are linked below.
Environment "today" = 2026-09-19, so 2026 papers are real and cited as such.

---

## 1. MANDATORY EXISTENCE MAP (URL, 1 line each)

### 1.1 Video codecs
- AV1: deployed, royalty-free, bitstream frozen 2018 — https://aomedia.org/av1/ (2018–).
- H.266/VVC: 4th Edition published 2026-01-13; still RAND licensing, pools consolidated (Access Advance/Via-LA) — https://www.itu.int/rec/T-REC-H.266 ; https://en.wikipedia.org/wiki/Versatile_Video_Coding (retr. 2026-09-19).
- AV2: spec v1.0.0 released 2026-05-28, ~30% bitrate cut vs AV1, HW decoder IP shipped 2026-06 — https://av2.aomedia.org/v1.0.0/ ; https://en.wikipedia.org/wiki/AV2 (retr. 2026-09-19).
- AV2 rationale/launch — https://aomedia.org/press%20releases/AOMedia-Announces-Year-End-Launch-of-Next-Generation-Video-Codec-AV2-on-10th-Anniversary/ (2025-09-15).
- H.267/ECM successor work continues (beyond-VVC exploration) — https://en.wikipedia.org/wiki/H.267 (retr. 2026-09-19).

### 1.2 Neural / learned codecs
- DCVC lineage ("Deep Contextual Video Compression") — https://arxiv.org/abs/2109.15047 (2021-09).
- DCVC-MB: B-frames with state-space models, ICME 2026 — https://arxiv.org/abs/2607.14305 (2026-07-15).
- BiCRVC: bidirectional NVC, coupled motion+latent coding, ~30× faster 1080p decode — https://arxiv.org/abs/2608.16175 (2026-08-17).
- Streamable NVC: mixed FP16/FP32 for cross-GPU deterministic entropy coding — https://arxiv.org/abs/2608.00483 (2026-08-01).
- Generative video compression one-step flow (VoRTeC): −58% bits vs prior diffusion codecs — https://arxiv.org/abs/2609.02291 (2026-09-02).
- 2D Gaussian-splatting video codec, LPIPS beats H.265 — https://arxiv.org/abs/2609.14129 (2026-09-12).
- Implicit-NeRF video (TCNeRV), 3M params, UVG 36.08 dB — https://arxiv.org/abs/2609.16870 (2026-09-15).
- Learned codecs are NOT browser-decodable; only WebCodecs-backed AV1/HEVC/VP9 are. Gap persists — https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API (retr. 2026-09-19).

### 1.3 Audio
- Opus: RFC 6716; v1.6 (2025-12-15) adds ML BWE/DRED + Opus HD 96 kHz; v1.6.1 2026-01-14 — https://opus-codec.org/ ; https://tools.ietf.org/html/rfc6716 (2012-09).
- EnCodec: RVQ neural audio codec — https://arxiv.org/abs/2210.13438 (2022-10).
- LACE: layer-adaptive dynamic frame-rate codec for RVQ tokens — https://arxiv.org/abs/2609.17509 (2026-09-15).
- Neural-vs-legacy codec forensics (traces survive transcoding) — https://arxiv.org/abs/2609.14916 (2026-09-14).
- TokenMapper: cross-codec discrete token translation w/o waveform bridge — https://arxiv.org/abs/2609.12563 (2026-09-11).

### 1.4 Lossless general
- Zstandard: RFC 8878, v1.5.7, 2.896 ratio / 510 MB/s on Silesia — https://facebook.github.io/zstd/ ; https://tools.ietf.org/html/rfc8878 (2021-02).
- LZ4 2.101/675 MB/s; brotli 2.702; zlib 2.743 on Silesia (same page, 2026-09).
- Context-mixing / LSTM / Transformer compressors (cmix v21, nncp v3.2, paq8px) — https://mattmahoney.net/dc/text.html (2026-09-15).
- enwik9 leader: zmix 1.0 at 96,096,261 B (incl. decompressor) — https://mattmahoney.net/dc/text.html (2026-09-15).
- Hutter Prize (enwik9, ongoing) — http://prize.hutter1.net/ (retr. 2026-09-19).
- DLM-based lossless text (diffusion LM beats AR-LM throughput) — https://arxiv.org/abs/2608.11249 (2026-08-04).
- LLM source-code compression, T-bounded symbol ranking, +82% vs zstd — https://arxiv.org/abs/2607.24192 (2026-07-27).

### 1.5 Genomics
- CRAM: reference-based, random-access container — https://cramformat.org/ ; spec https://github.com/samtools/hts-specs (v3.x, 2019–).
- Genozip: 2–10× vs .gz/.cram; "Deep" co-compression of FASTQ+BAM (patent-pending) — https://genozip.com/ (retr. 2026-09-19).
- Hecate: modular FASTA/FASTQ compressor, BWT+arithmetic, exact random-access slicing — https://arxiv.org/abs/2603.15390 (2026-03-16).
- Bancroft: reference-based genome compression with random access over PCIe, 30% of HBM BW — https://arxiv.org/abs/2502.16470 (2025-02-23).
- AMGC: adaptive match-based FASTQ reads compressor, +81% over 2nd best — https://arxiv.org/abs/2304.01031 (2023-04-03).
- Pangenome graph computation at biobank scale (GBZ/graph, not a codec) — https://doi.org/10.64898/2026.09.10.750583 (2026-09-12).

### 1.6 Scientific arrays
- ZFP 1.0.0: fixed-rate/accuracy/inline, random access, ≤2 GB/s/core CPU — https://computing.llnl.gov/projects/zfp ; https://github.com/LLNL/zfp (2014; v1.0 2023).
- SZ3: modular prediction + error-bounded lossy — https://github.com/szcompressor/SZ3 (2022–).
- Blosc2: meta-compressor over zstd/lz4 with chunked filters — https://www.blosc.org/ (2019–).
- Progressive scientific compression (+42% ratio, adaptive interpolation) — https://arxiv.org/abs/2609.04573 (2026-09-04).
- TOPIQ: predicts downstream QoI error from compression metadata (post hoc) — https://arxiv.org/abs/2608.26912 (2026-08-27).
- FaCTz: GPU topology-preserving (critical-point) compressor, 60 GB/s — https://arxiv.org/abs/2608.10586 (2026-08-11).
- SDRBench: standard scientific-data benchmark suite — https://sdrbench.github.io/ (retr. 2026-09-19).

### 1.7 Point clouds / meshes
- Draco: open mesh/point-cloud codec, JS/WASM decode — https://google.github.io/draco/ ; https://github.com/google/draco (2017–).
- DELUGE: real-time particle streaming, ~20× faster decode than G-PCC — https://arxiv.org/abs/2609.19750 (2026-09-17).
- ResPCC: first loss-resilient neural PCC (5–30% packet loss) — https://arxiv.org/abs/2608.11845 (2026-08-12).
- N4MC: first 4D neural mesh compression with motion compensation — https://arxiv.org/abs/2602.20312 (2026-02-23).
- Hierarchical neural surfaces for meshes — https://arxiv.org/abs/2512.15985 (2025-12-17); quantized neural displacement fields, 4–380× — https://arxiv.org/abs/2504.01027 (2025-03-28).

### 1.8 Tabular / columnar
- Apache Parquet: the incumbent columnar format — https://parquet.apache.org/ (2013–).
- Vortex: 100× faster random access, 10–20× faster scans, 5× writes, ~same ratio as Parquet — https://vortex.dev/ (retr. 2026-09-19).
- Derived-column elimination via exact functional-dependency discovery, +8.27% post-compression on CTU-13 NetFlow, byte-exact — https://doi.org/10.5281/zenodo.20848308 (2026-06-25).
- Columnar graph/provenance compression ~72.5% reduction — https://doi.org/10.5281/zenodo.20651569 (2026-06-12).

### 1.9 Text / datasets
- "Language Modeling Is Compression" — https://arxiv.org/abs/2309.10668 (2023-09; ICLR 2024).
- Deduplicating training data improves LMs — https://arxiv.org/abs/2107.06499 (2021-07; ACL 2022).
- SemDeDup: semantic dedup of image/text datasets — https://arxiv.org/abs/2303.09540 (2023-03; ICML 2023).
- SEDD: GPU MinHash-LSH dedup, 1.2T tokens in 3h — https://arxiv.org/abs/2501.01046 (2025-01-02).
- Production-scale LLM-corpus redundancy: only 10.9% trainable-unique, 79.4% redundant — https://arxiv.org/abs/2606.29605 (2026-06-28).

### 1.10 Random access / seekable
- zstd seekable format (frame index, ~independently decodable frames) — https://github.com/facebook/zstd/blob/dev/contrib/seekable_format/zstd_seekable_compression_format.md (2020–).
- BGZF (blocked gzip) — https://samtools.github.io/hts-specs/SAMv1.pdf (2014–).
- ACEAPEX: unified absolute-offset seek across ANS + match layers, bit-perfect — https://arxiv.org/abs/2606.24531 (2026-06).
- hw-apex-bench: 9-axis compressed-access benchmark (ratio, p50/p99 seek latency, c(g)) — https://doi.org/10.5281/zenodo.22713363 (2026-09-11).
- Random-access neural material textures (SIGGRAPH) — https://arxiv.org/abs/2305.17105 (2023-05-26); NDGI temporal lightmaps — https://arxiv.org/abs/2604.12625 (2026-04-14).

### 1.11 Benchmarks & theoretical limits
- Large Text Compression Benchmark (enwik9) — https://mattmahoney.net/dc/text.html (2026-09-15).
- Silesia corpus — https://sun.aei.polsl.pl/~sdeor/index.php?page=silesia (retr. 2026-09-19).
- Hutter Prize — http://prize.hutter1.net/ (retr. 2026-09-19).

---

## 2. GAPS THAT SURVIVE THE MAP
- **G1 — No QoI-certified scientific codec.** SZ3/ZFP bound *per-element* error (≤2 GB/s, LLNL); TOPIQ only *predicts* downstream QoI error *after* compressing (2026-08-27); cpSZ/FaCTz preserve *topology* (2026-08-11), not arbitrary QoIs. No encoder allocates bits under a certificate on a chosen *quantity of interest* (regional mean, spectrum, ML prediction) at encode time.
- **G2 — No corpus-level archive with O(1) file/block access.** Random access exists *within* one stream (zstd seekable, BGZF, ACEAPEX, Vortex within a table) and shared dictionaries exist (zstd training, 2016+), but no container jointly entropy-codes a *set of related files/datasets* and still lets any file decode in O(1) with a proven rate penalty vs. a solid archive.
- **G3 — No time-lapse array codec with random access + error bound.** Video temporal prediction is mature (AV2/DCVC); scientific snapshots are compressed independently, and progressive codecs (2609.04573) trade access for order but still decode prefixes. A codec that codes an N-checkpoint simulation lineage with *per-snapshot random access* and a *pointwise error bound* is absent.
- **G4 — No cohort/population genomic codec.** CRAM/Genozip are reference- or pair-based (Genozip "Deep" = FASTQ+BAM, 2 files); Hecate adds referential slicing; Bancroft adds FPGA random access. No codec jointly models an N-sample cohort with a shared graph/entropy model and O(1) per-sample extraction.
- Explicitly **closed** (skip): AV1/AV2/VVC tooling; DCVC/BiCRVC/VoRTeC/2DGS/TCNeRV; Opus/EnCodec/LACE; zstd/LZ4/brotli/cmix/paq/LLM-text; CRAM/Genozip/Hecate/Bancroft/AMGC; ZFP/SZ3/Blosc2/progressive/TOPIQ/FaCTz; Draco/DELUGE/ResPCC/N4MC; Parquet/Vortex/FD-elimination; SemDeDup/D4/SEDD; zstd-seekable/BGZF/ACEAPEX/NeRF-textures.

---

## 3. CANDIDATES (ranked by missing × impact × CPU-feasibility)

### Candidate 1 — QCC: Quantity-of-Interest-Certified Scientific Codec  [RANK 1]
1. **One-liner.** A lossy scientific-array codec that takes a *QoI spec* (e.g. column mean, power spectrum, NN prediction) and allocates bits so the QoI's error is certified, not just each element's.
2. **Exists / not.** Exists: per-element error-bounded SZ3 (https://github.com/szcompressor/SZ3), fixed-rate/accuracy ZFP (https://computing.llnl.gov/projects/zfp), QoI-error *prediction* TOPIQ (https://arxiv.org/abs/2608.26912, 2026-08-27), topology preservation FaCTz (https://arxiv.org/abs/2608.10586, 2026-08-11), progressive (https://arxiv.org/abs/2609.04573, 2026-09-04). Does **not** exist: an encoder whose rate allocation is driven by a certified QoI bound. Load-bearing because exascale users care about derived quantities, not raw fields.
3. **Who hurts / unlocks.** Climate/CFD/astro/HED storage & transfer (TOPIC reports 512 GB transfers; SDRBench is the standard suite). Unlocks "compress to my analysis need" instead of "compress to a uniform tolerance", cutting bytes for the same scientific answer.
4. **Why now.** TOPIQ proved QoI error can be composed from compact metadata; SZ3/ZFP expose per-block error knobs; CPU SIMD decoders are mature. The pieces first exist in 2026.
5. **Redundancy exploited.** QoIs integrate many elements (means, spectra), so uniform per-element error bounds waste bits on elements that cancel; QCC spends bits on QoI-sensitive regions and zero on cancelled-error regions — a redundancy current codecs cannot see.
6. **Stage-1 (CPU).** Data: SDRBench Hurricane ISABEL pressure field, 48×48×100 float32 × 100 snapshots (~90 MB; https://sdrbench.github.io/) + one CESM-ATM 2D slice. Baselines: SZ3, ZFP, none. Metrics: compression ratio at equal QoI relative error (column mean, 8×8 block means), certified QoI error bound, encode/decode MB/s. Non-goals: GPU, >1 GB arrays, learned networks.
7. **Decisive first experiment (pass/fail).** "On ISABEL, QCC achieves ≥30% higher ratio than SZ3 at equal block-mean relative error (≤1e-3) with a verified bound, in <1 h CPU." Fail if the QoI overhead (metadata) eats the gain.
8. **Risks.** QoI metadata may be large; linear QoIs may not be the real bottleneck; "certified" requires sound error propagation (TOPIQ-calibrated, not proven).
9. **Grade.** NEW CATEGORY.

### Candidate 2 — BundleZip: corpus archive with O(1) per-file random access  [RANK 2]
1. **One-liner.** One compressed container over a *set of related files/datasets* with a shared learned entropy model, where any file (or 1 MB block) decodes in O(1) with a bounded rate penalty vs. a solid archive.
2. **Exists / not.** Exists: zstd trained dictionaries (https://facebook.github.io/zstd/, 2016+), zstd seekable format (https://github.com/facebook/zstd/blob/dev/contrib/seekable_format/zstd_seekable_compression_format.md), BGZF, ACEAPEX unified seek (https://arxiv.org/abs/2606.24531, 2026-06), Vortex 100× random access *within* a table (https://vortex.dev/). Does **not** exist: a *multi-file* archive whose index permits O(1) extraction while the model is corpus-wide. Load-bearing for dataset distribution (hubs, mirrors, Zarr stores).
3. **Who hurts / unlocks.** Model/data hubs, package mirrors, Zarr/Icechunk stores, ML dataset consumers who want one file without the whole archive. Unlocks "download one sample from a 1 TB dataset" with solid-archive ratios.
4. **Why now.** zstd seekable + ACEAPEX prove seek is cheap; datasets are increasingly file-per-sample (Zarr/WebDataset); entropy-coding shared dictionaries are standard.
5. **Redundancy exploited.** Cross-file repetition (boilerplate, schema, near-duplicate records) that per-file compressors miss and that solid archives exploit but cannot seek — BundleZip trades a few index bits to keep the cross-file model addressable.
6. **Stage-1 (CPU).** Data: Silesia corpus (211 MB, https://sun.aei.polsl.pl/~sdeor/index.php?page=silesia) split into 1 MB blocks + enwik8 (100 MB) chunked. Baselines: per-file `zstd --ultra -22`, `tar | zstd --long`, zstd seekable. Metrics: total bytes vs solid archive, p50/p99 seek latency, memory, bit-exact.
7. **Decisive first experiment (pass/fail).** "On Silesia, BundleZip ≤110% of `tar+zstd --long` size while any 1 MB block decodes in ≤5 ms (p99), bit-exact, <1 h CPU." Fail if index/seek overhead exceeds 10%.
8. **Risks.** ANS/arithmetic coders resist seeking (static tables hurt ratio); cross-file gains may be small for already-heterogeneous corpora; ACEAPEX may generalize to files, closing the gap.
9. **Grade.** NEW CATEGORY (adjacent to zstd-seekable + trained dicts).

### Candidate 3 — LineageArray: temporal scientific-array codec with per-snapshot random access  [RANK 3]
1. **One-liner.** Compress an N-snapshot simulation lineage as one stream with inter-snapshot motion/predictor coding, while any single snapshot (or sub-block) still decodes independently.
2. **Exists / not.** Exists: 2D/4D video temporal coding (AV2, https://en.wikipedia.org/wiki/AV2; N4MC https://arxiv.org/abs/2602.20312), independent per-snapshot SZ3/ZFP, progressive 2609.04573 (https://arxiv.org/abs/2609.04573), FaCTz topology. Does **not** exist: temporal codec for scientific arrays with *random access + pointwise error bound*. Load-bearing because simulations write long checkpoint sequences.
3. **Who hurts / unlocks.** HPC checkpoint/restart, in-situ visualization, time-travel analysis. Unlocks keeping many more checkpoints at fixed storage.
4. **Why now.** Video codecs proved motion-compensation gains on 2D+time; SZ3's block error bounds are composable; GPU-less CPU encoders are fast enough for Stage-1.
5. **Redundancy exploited.** Physical continuity across snapshots (advection/compression waves) that independent per-snapshot codecs discard; current scientific codecs see each snapshot alone.
6. **Stage-1 (CPU).** Data: SDRBench ISABEL (100 snapshots, ~90 MB) + EXAALT subset. Baselines: per-snapshot SZ3, progressive 2609.04573, naive delta+SZ3. Metrics: ratio at equal max-abs-error, per-snapshot seek time, decode MB/s.
7. **Decisive first experiment (pass/fail).** "On ISABEL, LineageArray ≥2× ratio of per-snapshot SZ3 at equal max-abs-error, with any snapshot decoding in ≤50 ms, <2 h CPU." Fail if motion side-info costs more than the gain.
8. **Risks.** Turbulent/chaotic fields decorrelate fast; motion vectors cost bits; may collapse to EXISTS if temporal-aware scientific codecs already cover it.
9. **Grade.** PARTIAL GAP (honest: closest to existing video/temporal work).

### Candidate 4 — CohortZip: joint genomic codec for sample cohorts  [RANK 4]
1. **One-liner.** Jointly compress an N-sample sequencing cohort (FASTQ/BAM/VCF) under one shared reference-graph + entropy model, with O(1) per-sample extraction.
2. **Exists / not.** Exists: CRAM reference-based random access (https://cramformat.org/), Genozip 2-file co-compression (https://genozip.com/), Hecate referential slicing (https://arxiv.org/abs/2603.15390, 2026-03-16), Bancroft FPGA random access (https://arxiv.org/abs/2502.16470, 2025-02-23). Does **not** exist: N-sample joint cohort codec with per-sample seek. Load-bearing for biobanks (UK Biobank, All of Us).
3. **Who hurts / unlocks.** Biobanks, clinical archives, population genetics; unlocks 10–100× fewer bytes for a cohort and one-sample fetch from a population store.
4. **Why now.** Cheaper sequencing ⇒ cohort-scale storage crisis; pangenome graphs (GBZ) and random-access genomic hardware both arrived by 2026.
5. **Redundancy exploited.** Cross-sample haplotype sharing that reference-based single-sample codecs leave on the table.
6. **Stage-1 (CPU).** Data: 1000 Genomes chr22 VCF subset (~100–300 MB, public EBI/IGSR) or GIAB trio BAM. Baselines: CRAM 3.1, Genozip, gzip. Metrics: bytes/sample vs CRAM, per-sample extraction time, bit-exactness.
7. **Decisive first experiment (pass/fail).** "On 10 chr22 samples, CohortZip ≤50% of per-sample CRAM size at bit-exact re-extraction and ≤1 s sample seek, <2 h CPU." Fail if graph construction dominates.
8. **Risks.** Variant-call heterogeneity; graph index memory; Genozip may already co-compress cohorts; licensing (CRAM tools, Genozip patent-pending).
9. **Grade.** PARTIAL GAP.

---

## 4. RANKING

| # | Candidate | Missing | Impact | CPU feasibility | Grade |
|---|-----------|---------|--------|-----------------|-------|
| 1 | QCC (QoI-certified arrays) | Very high (no encoder) | Very high (HPC/exascale) | High (ISABEL ~90 MB) | NEW CATEGORY |
| 2 | BundleZip (corpus O(1) access) | High | Very high (hubs/datasets) | High (Silesia 211 MB) | NEW CATEGORY |
| 3 | LineageArray (temporal + seek) | Medium–High | High (checkpoints) | High (ISABEL) | PARTIAL GAP |
| 4 | CohortZip (cohort genomics) | High | High (biobanks) | Medium (data size) | PARTIAL GAP |

Promote **Candidate 1 (QCC)**: the gap is proven empty (prediction ≠ allocation), Stage-1 uses a small
public dataset (~90 MB), and the decisive experiment is a clean ratio-at-equal-QoI benchmark against SZ3/ZFP.

## 5. KILL LIST (do not re-propose)
AV1/AV2/VVC; DCVC/BiCRVC/DCVC-MB/VoRTeC/2DGS/TCNeRV/streamable-NVC; Opus/EnCodec/LACE/TokenMapper;
zstd/LZ4/brotli/cmix/paq/nncp/zmix/LLM-text/DLM-text; CRAM/Genozip/Hecate/Bancroft/AMGC; ZFP/SZ3/Blosc2/
progressive-2609.04573/TOPIQ/FaCTz; Draco/DELUGE/ResPCC/N4MC/neural-displacement; Parquet/Vortex/FD-elimination;
SemDeDup/D4/SEDD; zstd-seekable/BGZF/ACEAPEX; random-access neural textures/NDGI. Each has a URL above.

## 6. PRIMARY SOURCES (load-bearing)
- SZ3 — https://github.com/szcompressor/SZ3 (2022–) · ZFP — https://computing.llnl.gov/projects/zfp (v1.0).
- TOPIQ — https://arxiv.org/abs/2608.26912 (2026-08-27) · progressive — https://arxiv.org/abs/2609.04573 (2026-09-04).
- SDRBench — https://sdrbench.github.io/ (retr. 2026-09-19) · Silesia — https://sun.aei.polsl.pl/~sdeor/index.php?page=silesia.
- zstd site/benchmarks — https://facebook.github.io/zstd/ (2026) · zstd RFC 8878 — https://tools.ietf.org/html/rfc8878.
- zstd seekable — https://github.com/facebook/zstd/blob/dev/contrib/seekable_format/zstd_seekable_compression_format.md.
- ACEAPEX — https://arxiv.org/abs/2606.24531 (2026-06) · hw-apex-bench — https://doi.org/10.5281/zenodo.22713363 (2026-09-11).
- Vortex — https://vortex.dev/ (retr. 2026-09-19) · FD-column elimination — https://doi.org/10.5281/zenodo.20848308 (2026-06-25).
- CRAM — https://cramformat.org/ · Genozip — https://genozip.com/ (retr. 2026-09-19) · Hecate — https://arxiv.org/abs/2603.15390 (2026-03-16) · Bancroft — https://arxiv.org/abs/2502.16470 (2025-02-23).
- AV2 — https://en.wikipedia.org/wiki/AV2 (retr. 2026-09-19) · VVC — https://www.itu.int/rec/T-REC-H.266 (4th ed 2026-01-13).
- LTCB — https://mattmahoney.net/dc/text.html (2026-09-15) · Hutter — http://prize.hutter1.net/.
