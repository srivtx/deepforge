#!/usr/bin/env bun
/**
 * Wave-48 evidence harness — REPROGPU reference hashes and WGSL source pins.
 *
 *   bun run scripts/reprogpu-evidence.ts
 *
 * Pure deterministic TypeScript, CPU-only, no GPU. Computes the K1-K4
 * reference outputs from the shipped engine, hashes their byte
 * serializations, hashes the pinned WGSL sources, and prints a JSON block
 * that becomes the literals in src/lib/reprogpu/expected.ts. The permanent
 * gate (scripts/verify-reprogpu.ts) recomputes all of this and compares; this
 * script never writes expected.ts, so there is no auto-update path.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { KERNEL_WGSL } from "../src/lib/reprogpu/kernels";
import { wgslSha256 } from "../src/lib/reprogpu/hashes";
import { PHILOX_KATS, philoxStream } from "../src/lib/reprogpu/philox";
import { sha256Bytes, sha256Hex } from "../src/lib/reprogpu/sha256";
import { exactSum320, serializeSum320 } from "../src/lib/reprogpu/sum320";
import { q16Gemm, serializeGemm } from "../src/lib/reprogpu/gemm";
import {
  EXPECTED_COUNTS,
  K1_FLAG_WORDS,
  k1Words,
  k4Message,
  q16SeedMatrices,
} from "../src/lib/reprogpu/vectors";

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

function main(): void {
  const started = performance.now();

  const k1 = serializeSum320(exactSum320(k1Words()));
  const k1Flag = serializeSum320(exactSum320(K1_FLAG_WORDS));
  const k1Hash = sha256Hex(k1);
  const k1FlagHash = sha256Hex(k1Flag);

  const stream = philoxStream(65536, [0x12345678, 0x9abcdef0]);
  const k2Bytes = u32sToBytes(new Uint32Array([65536, ...stream]));
  const k2Hash = sha256Hex(k2Bytes);

  const k3Started = performance.now();
  const sizes = q16SeedMatrices(256);
  const k3 = q16Gemm(sizes.a, sizes.b, 256);
  const k3Bytes = serializeGemm(k3);
  const k3Hash = sha256Hex(k3Bytes);
  const k3Ms = Math.round(performance.now() - k3Started);

  const message = k4Message();
  const digest = sha256Bytes(message);
  const digestWords: number[] = [];
  for (let index = 0; index < 8; index += 1) {
    let word = 0;
    for (let byte = 0; byte < 4; byte += 1) {
      word = ((word << 8) | digest[index * 4 + byte]) >>> 0;
    }
    digestWords.push(bswap32(word));
  }
  const k4Bytes = u32sToBytes(new Uint32Array([16385, ...digestWords]));
  const k4Hash = sha256Hex(k4Bytes);

  const wgslHashes: Record<string, string> = {};
  for (const id of ["K1", "K2", "K3", "K4", "K5"] as const) {
    wgslHashes[id] = wgslSha256(KERNEL_WGSL[id]);
  }

  const payload = {
    counts: { ...EXPECTED_COUNTS },
    hashes: {
      K1: k1Hash,
      K1_FLAG: k1FlagHash,
      K2: k2Hash,
      K3: k3Hash,
      K4: k4Hash,
    },
    wgsl: wgslHashes,
    kat: {
      philox: PHILOX_KATS.map((kat) => kat.expected.join(","),),
      k4Digest: sha256Hex(message),
    },
  };

  const directory = join(process.cwd(), "docs", "research", "reprogpu");
  mkdirSync(directory, { recursive: true });
  const jsonPath = join(directory, "expected-hashes.json");
  writeFileSync(jsonPath, `${JSON.stringify(payload, null, 2)}\n`);

  console.log("REPROGPU evidence (reference-only; no GPU)");
  console.log(`counts: ${JSON.stringify(payload.counts)}`);
  console.log(`K1 hash: ${k1Hash}`);
  console.log(`K1 flag hash: ${k1FlagHash}`);
  console.log(`K2 hash: ${k2Hash}`);
  console.log(`K3 hash: ${k3Hash} (${k3Ms} ms for the 256^3 BigInt reference)`);
  console.log(`K4 hash: ${k4Hash}`);
  console.log(`WGSL: ${JSON.stringify(wgslHashes)}`);
  console.log(`KATs: ${JSON.stringify(payload.kat.philox)}`);
  console.log(`JSON: ${jsonPath}`);
  console.log(`runtime: ${((performance.now() - started) / 1000).toFixed(2)}s`);
}

main();
