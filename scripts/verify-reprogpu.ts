#!/usr/bin/env bun
/**
 * REPROGPU permanent gate (wave 48) — reference-only, no GPU.
 *
 *   bun run scripts/verify-reprogpu.ts
 *
 * Checks, deterministically and offline:
 *  1 references reproduce the pinned K1/K1-flag/K2/K3/K4 hashes and counts;
 *  2 known-answer tests: Random123 Philox KATs and FIPS SHA-256 KATs;
 *  3 the pinned WGSL source hashes (drift fails until pins are updated);
 *  4 a purity scan of the integer kernels K1-K4 (no float, atomics, discard,
 *    unmasked runtime shifts) plus per-kernel canary/status checks;
 *  5 the K4 digest against the independent SHA-256 oracle.
 *
 * It explicitly CANNOT check WGSL compilation, GPU execution, or cross-adapter
 * equality. Per the amended spec's honesty rule, the browser lab is the
 * demonstration of cross-adapter reproducibility; no CI artifact may be cited
 * as evidence of GPU agreement. Exit code 1 on any failure. Final line:
 *
 *   REPROGPU_GATE {"passed":N,"failed":M,"runtimeMs":T}
 */
import { KERNEL_WGSL } from "../src/lib/reprogpu/kernels";
import { wgslSha256 } from "../src/lib/reprogpu/hashes";
import { PHILOX_KATS, philox4x32_10, philoxStream } from "../src/lib/reprogpu/philox";
import { SHA256_KATS, sha256Bytes, sha256Hex } from "../src/lib/reprogpu/sha256";
import { exactSum320, serializeSum320 } from "../src/lib/reprogpu/sum320";
import { q16Gemm, serializeGemm } from "../src/lib/reprogpu/gemm";
import {
  EXPECTED_COUNTS,
  K1_FLAG_WORDS,
  k1Words,
  k4Message,
  q16SeedMatrices,
} from "../src/lib/reprogpu/vectors";
import {
  EXPECTED_HASHES,
  EXPECTED_K1_FLAG_HASH,
  EXPECTED_K4_DIGEST,
  EXPECTED_WGSL,
} from "../src/lib/reprogpu/expected";

interface Criterion {
  readonly name: string;
  readonly ok: boolean;
  readonly details: readonly string[];
}

function u32sToBytes(words: ArrayLike<number>): Uint8Array {
  const out = new Uint8Array(words.length * 4);
  const view = new DataView(out.buffer);
  for (let index = 0; index < words.length; index += 1) {
    view.setUint32(index * 4, words[index] >>> 0, true);
  }
  return out;
}

function bswap32(word: number): number {
  return (
    (((word & 0xff) << 24) |
      ((word & 0xff00) << 8) |
      ((word >>> 8) & 0xff00) |
      ((word >>> 24) & 0xff)) >>>
    0
  );
}

const FORBIDDEN = ["f32", "f16", "atomic", "discard", "bitcast<f32"] as const;
const CANARIES: Readonly<Record<string, string>> = {
  K1: "output[11] = wcounts[0];",
  K2: "output[0] = 65536u;",
  K3: "output[65536] = 65536u;",
  K4: "output[0] = 16385u;",
};

function purityScan(): readonly string[] {
  const problems: string[] = [];
  for (const id of ["K1", "K2", "K3", "K4"] as const) {
    const source = KERNEL_WGSL[id];
    for (const token of FORBIDDEN) {
      if (source.includes(token)) problems.push(`${id} contains ${token}`);
    }
    if (id === "K1" && !source.includes("& 31u")) {
      problems.push("K1 has no masked runtime shift");
    }
    const canary = CANARIES[id];
    if (!source.includes(canary)) problems.push(`${id} is missing its canary ${canary}`);
  }
  return problems;
}

function main(): number {
  const started = performance.now();
  const criteria: Criterion[] = [];

  const k1 = sha256Hex(serializeSum320(exactSum320(k1Words())));
  const k1Flag = sha256Hex(serializeSum320(exactSum320(K1_FLAG_WORDS)));
  const stream = philoxStream(65536, [0x12345678, 0x9abcdef0]);
  const k2 = sha256Hex(u32sToBytes(new Uint32Array([65536, ...stream])));
  const k3 = sha256Hex(serializeGemm(q16Gemm(q16SeedMatrices(256).a, q16SeedMatrices(256).b, 256)));
  const message = k4Message();
  const digest = sha256Bytes(message);
  const words: number[] = [];
  for (let index = 0; index < 8; index += 1) {
    let word = 0;
    for (let byte = 0; byte < 4; byte += 1) {
      word = ((word << 8) | digest[index * 4 + byte]) >>> 0;
    }
    words.push(bswap32(word));
  }
  const k4 = sha256Hex(u32sToBytes(new Uint32Array([16385, ...words])));

  const referenceMismatches: string[] = [];
  const observed: Readonly<Record<string, string>> = { K1: k1, K2: k2, K3: k3, K4: k4 };
  for (const id of ["K1", "K2", "K3", "K4"] as const) {
    if (observed[id] !== EXPECTED_HASHES.hashes[id]) {
      referenceMismatches.push(`${id}: ${observed[id]} != ${EXPECTED_HASHES.hashes[id]}`);
    }
  }
  if (k1Flag !== EXPECTED_K1_FLAG_HASH) referenceMismatches.push("K1 flag hash drifted");
  if (EXPECTED_COUNTS.K1 !== EXPECTED_HASHES.counts.K1) {
    referenceMismatches.push("K1 count pin mismatch");
  }
  criteria.push({
    name: "references reproduce pins",
    ok: referenceMismatches.length === 0,
    details: referenceMismatches.length === 0 ? ["K1/K1-flag/K2/K3/K4 all match"] : referenceMismatches,
  });

  const katProblems: string[] = [];
  PHILOX_KATS.forEach((kat, index) => {
    const got = philox4x32_10(kat.ctr, kat.key);
    if (got.some((word, wordIndex) => word !== kat.expected[wordIndex])) {
      katProblems.push(`philox KAT ${index}: got ${got.join(",")}`);
    }
  });
  for (const kat of SHA256_KATS) {
    const got = sha256Hex(kat.bytes);
    if (got !== kat.expectedHex) katProblems.push(`sha256 "${kat.label}": got ${got}`);
  }
  if (sha256Hex(message) !== EXPECTED_K4_DIGEST) katProblems.push("K4 message digest mismatch");
  criteria.push({
    name: "known-answer tests",
    ok: katProblems.length === 0,
    details: katProblems.length === 0 ? ["3 Philox KATs + FIPS SHA-256 + K4 oracle match"] : katProblems,
  });

  const wgslProblems: string[] = [];
  for (const id of ["K1", "K2", "K3", "K4", "K5"] as const) {
    const got = wgslSha256(KERNEL_WGSL[id]);
    if (got !== EXPECTED_WGSL[id]) wgslProblems.push(`${id}: ${got} != ${EXPECTED_WGSL[id]}`);
  }
  criteria.push({
    name: "WGSL source pins",
    ok: wgslProblems.length === 0,
    details: wgslProblems.length === 0 ? ["all five sources match the pins"] : wgslProblems,
  });

  const purity = purityScan();
  criteria.push({
    name: "integer kernel purity",
    ok: purity.length === 0,
    details: purity.length === 0 ? ["no float/atomics/discard; shifts masked; canaries present"] : purity,
  });

  const failed = criteria.filter((criterion) => !criterion.ok).length;
  criteria.push({
    name: "summary",
    ok: failed === 0,
    details: [failed === 0 ? "all criteria passed" : `${failed} criterion/criteria failed; exit 1`],
  });

  const passed = criteria.length - failed;
  const runtimeMs = Math.round(performance.now() - started);
  console.log("REPROGPU permanent gate (wave 48) — scripts/verify-reprogpu.ts");
  const width = Math.max(...criteria.map((criterion) => criterion.name.length));
  criteria.forEach((criterion, index) => {
    const status = criterion.ok ? "PASS" : "FAIL";
    console.log(`${String(index + 1).padStart(2)}  ${criterion.name.padEnd(width)}  ${status}  ${criterion.details[0] ?? ""}`);
    for (const detail of criterion.details.slice(1)) {
      console.log(`${" ".repeat(6 + width)}  ${detail}`);
    }
  });
  console.log(
    `REPROGPU_GATE {"passed":${passed},"failed":${failed},"runtimeMs":${runtimeMs}}`,
  );
  return failed === 0 ? 0 : 1;
}

process.exit(main());
