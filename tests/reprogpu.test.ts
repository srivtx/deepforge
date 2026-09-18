import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import {
  PHILOX_KATS,
  philox4x32_10,
  philoxStream,
} from "@/lib/reprogpu/philox";
import {
  SHA256_KATS,
  sha256Bytes,
  sha256Hex,
} from "@/lib/reprogpu/sha256";
import {
  decodeF32,
  exactSum320,
  serializeSum320,
} from "@/lib/reprogpu/sum320";
import { q16Gemm, serializeGemm } from "@/lib/reprogpu/gemm";
import {
  canonicalize,
  manifestSha256,
  normalizeWgsl,
  wgslSha256,
} from "@/lib/reprogpu/hashes";
import {
  EXPECTED_COUNTS,
  K1_FLAG_WORDS,
  K1_N,
  K1_SPECIALS,
  K3_SEED,
  k1Words,
  k4Message,
  lcg32,
  q16SeedMatrices,
} from "@/lib/reprogpu/vectors";
import {
  EXPECTED_HASHES,
  EXPECTED_K1_FLAG_HASH,
  EXPECTED_K4_DIGEST,
} from "@/lib/reprogpu/expected";

/* ─────────────────────────────── helpers ────────────────────────────────── */

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

function nodeSha256Hex(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

const K2_KEY: readonly [number, number] = [0x12345678, 0x9abcdef0];

/* ───────────────────────────── Philox K2 RNG ────────────────────────────── */

describe("reprogpu philox4x32-10", () => {
  test("every pinned KAT matches philox4x32_10", () => {
    expect(PHILOX_KATS.length).toBe(3);
    for (const kat of PHILOX_KATS) {
      expect(philox4x32_10(kat.ctr, kat.key)).toEqual([...kat.expected]);
    }
  });

  test("philoxStream(4, key) equals four explicit counter calls", () => {
    const stream = philoxStream(4, K2_KEY);
    expect(stream.length).toBe(16);
    for (let block = 0; block < 4; block += 1) {
      const word = philox4x32_10([block, 0, 0, 0], K2_KEY);
      expect(stream[block * 4]).toBe(word[0]);
      expect(stream[block * 4 + 1]).toBe(word[1]);
      expect(stream[block * 4 + 2]).toBe(word[2]);
      expect(stream[block * 4 + 3]).toBe(word[3]);
    }
  });

  test("stream length is 4 words per block and it is deterministic", () => {
    const first = philoxStream(8, K2_KEY);
    const second = philoxStream(8, K2_KEY);
    expect(first.length).toBe(32);
    expect(Array.from(first)).toEqual(Array.from(second));
  });

  test("KAT words are compared in the declared order, not sorted", () => {
    const got = philox4x32_10(PHILOX_KATS[0].ctr, PHILOX_KATS[0].key);
    expect(got[0]).toBe(0x6627e8d5);
    expect(got[1]).toBe(0xe169c58d);
    expect(got[2]).toBe(0xbc57ac4c);
    expect(got[3]).toBe(0x9b00dbd8);
  });
});

/* ───────────────────────────── SHA-256 (K4) ─────────────────────────────── */

describe("reprogpu sha256", () => {
  test("every pinned FIPS KAT matches", () => {
    expect(SHA256_KATS.length).toBeGreaterThanOrEqual(2);
    for (const kat of SHA256_KATS) {
      expect(sha256Hex(kat.bytes)).toBe(kat.expectedHex);
    }
  });

  test("sha256Hex of the K4 1 MiB message equals the pinned oracle digest", () => {
    const digest = sha256Hex(k4Message());
    expect(digest).toBe(EXPECTED_K4_DIGEST);
    // The pinned digest is itself the output of an independent oracle.
    expect(digest).toBe(nodeSha256Hex(k4Message()));
  });

  test("padding branches (lengths 0,1,55,56,63,64,65) match node:crypto", () => {
    for (const length of [0, 1, 55, 56, 63, 64, 65]) {
      const bytes = new Uint8Array(length);
      for (let i = 0; i < length; i += 1) bytes[i] = 0x61 + (i % 26);
      expect(sha256Hex(bytes)).toBe(nodeSha256Hex(bytes));
    }
  });

  test("sha256Bytes returns 32 bytes and sha256Hex is 64 lowercase hex chars", () => {
    const digest = sha256Bytes(new Uint8Array([1, 2, 3]));
    expect(digest.length).toBe(32);
    expect(sha256Hex(new Uint8Array([1, 2, 3]))).toMatch(/^[0-9a-f]{64}$/);
  });
});

/* ───────────────────────── K1 exact sum superaccumulator ────────────────── */

describe("reprogpu K1 exactSum320", () => {
  test("k1Words() serializes to the pinned K1 hash and reads 4104 words", () => {
    const words = k1Words();
    expect(words.length).toBe(K1_N + K1_SPECIALS.length);
    const result = exactSum320(words);
    expect(result.count).toBe(4104);
    expect(result.flags).toBe(0);
    expect(sha256Hex(serializeSum320(result))).toBe(
      EXPECTED_HASHES.hashes.K1,
    );
  });

  test("the flag vector hashes to the pinned flag hash and reads flags 1", () => {
    const result = exactSum320(K1_FLAG_WORDS);
    expect(sha256Hex(serializeSum320(result))).toBe(EXPECTED_K1_FLAG_HASH);
    expect(result.flags).toBe(1);
    const bytes = serializeSum320(result);
    const view = new DataView(bytes.buffer);
    expect(view.getUint32(40, true)).toBe(1);
  });

  test("[+1.0, -1.0] sums to zero limbs with flags 0", () => {
    const result = exactSum320([0x3f800000, 0xbf800000]);
    expect(result.limbs).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(result.flags).toBe(0);
    expect(result.count).toBe(2);
  });

  test("min subnormal (0x00000001) yields limb0 == 1", () => {
    const result = exactSum320([0x00000001]);
    expect(result.limbs[0]).toBe(1);
    for (let i = 1; i < 10; i += 1) expect(result.limbs[i]).toBe(0);
  });

  test("a NaN/Inf-only array sets flags to 1 and zero limbs", () => {
    const result = exactSum320([0x7f800000, 0x7fc00000, 0xff800000]);
    expect(result.flags).toBe(1);
    expect(result.limbs).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });

  test("decodeF32 classifies zero, subnormal, normal, and non-finite", () => {
    expect(decodeF32(0x00000000).kind).toBe("zero");
    expect(decodeF32(0x80000000).kind).toBe("zero");
    expect(decodeF32(0x00000001).kind).toBe("finite");
    expect(decodeF32(0x3f800000).kind).toBe("finite");
    expect(decodeF32(0x7f800000).kind).toBe("nonfinite");
    expect(decodeF32(0x7fc00000).kind).toBe("nonfinite");
    expect(decodeF32(0xff800000).kind).toBe("nonfinite");
  });

  test("serializeSum320 is 48 little-endian bytes (10 limbs, flags, count)", () => {
    const bytes = serializeSum320(exactSum320([0x00000001]));
    expect(bytes.length).toBe(48);
    const view = new DataView(bytes.buffer);
    expect(view.getUint32(0, true)).toBe(1);
    expect(view.getUint32(40, true)).toBe(0);
    expect(view.getUint32(44, true)).toBe(1);
  });
});

/* ────────────────────── K3 Q16.16 GEMM reference ────────────────────────── */

function naiveGemm(a: Int32Array, b: Int32Array, n: number): Int32Array {
  const out = new Int32Array(n * n);
  const MOD = BigInt(4294967296);
  const SIGN = BigInt(2147483648);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let s = BigInt(0);
      for (let k = 0; k < n; k++) {
        s += BigInt(a[i * n + k]) * BigInt(b[k * n + j]);
      }
      const floored = s >> BigInt(16);
      const m = ((floored % MOD) + MOD) % MOD;
      out[i * n + j] = Number(m >= SIGN ? m - MOD : m);
    }
  }
  return out;
}

describe("reprogpu K3 q16Gemm", () => {
  test("a seeded 16x16 case matches a BigInt naive reference (0 mismatches)", () => {
    const n = 16;
    const { a, b } = q16SeedMatrices(n);
    const got = q16Gemm(a, b, n);
    const expected = naiveGemm(a, b, n);
    expect(got.length).toBe(n * n);
    let mismatches = 0;
    for (let i = 0; i < got.length; i += 1) {
      if (got[i] !== expected[i]) mismatches += 1;
    }
    expect(mismatches).toBe(0);
  });

  test("the 256^3 reference serializes to the pinned K3 hash", () => {
    const { a, b } = q16SeedMatrices(256);
    const hash = sha256Hex(serializeGemm(q16Gemm(a, b, 256)));
    expect(hash).toBe(EXPECTED_HASHES.hashes.K3);
  });

  test("floors toward negative infinity on a negative non-divisible sum", () => {
    // S = (-1) * 1 = -1; -1 / 2^16 floors to -1, which is not 0 (truncation
    // toward zero would give 0). Checked through a 2x2 block.
    const a = new Int32Array([-1, 0, 0, 0]);
    const b = new Int32Array([1, 0, 0, 0]);
    const out = q16Gemm(a, b, 2);
    expect(out[0]).toBe(-1);
    expect(out[1]).toBe(0);
    expect(out[2]).toBe(0);
    expect(out[3]).toBe(0);
  });

  test("serializeGemm is little-endian i32 (4 bytes per element)", () => {
    const bytes = serializeGemm(new Int32Array([1, -1]));
    expect(bytes.length).toBe(8);
    const view = new DataView(bytes.buffer);
    expect(view.getInt32(0, true)).toBe(1);
    expect(view.getInt32(4, true)).toBe(-1);
  });
});

/* ───────────────────────────── K2 stream hash ───────────────────────────── */

describe("reprogpu K2 stream", () => {
  test("the full 65536-block stream hashes to the pinned K2 hash", () => {
    expect(EXPECTED_COUNTS.K2).toBe(65536);
    const stream = philoxStream(65536, K2_KEY);
    const bytes = u32sToBytes(new Uint32Array([65536, ...stream]));
    expect(bytes.length).toBe((1 + 4 * 65536) * 4);
    expect(sha256Hex(bytes)).toBe(EXPECTED_HASHES.hashes.K2);
  });

  test("block 0 of the stream is the explicit counter call", () => {
    const stream = philoxStream(1, K2_KEY);
    expect(stream[0]).toBe(philox4x32_10([0, 0, 0, 0], K2_KEY)[0]);
    expect(stream[3]).toBe(philox4x32_10([0, 0, 0, 0], K2_KEY)[3]);
  });
});

/* ──────────────────────────────── counts ────────────────────────────────── */

describe("reprogpu expected counts", () => {
  test("EXPECTED_COUNTS matches the vector-derived counts", () => {
    expect(EXPECTED_COUNTS.K1).toBe(4104);
    expect(EXPECTED_COUNTS.K2).toBe(65536);
    expect(EXPECTED_COUNTS.K3).toBe(65536);
    expect(EXPECTED_COUNTS.K4).toBe(16385);
    expect(EXPECTED_COUNTS.K5).toBe(65536);
  });

  test("K1 count is 4096 finite words plus 8 specials", () => {
    expect(K1_N).toBe(4096);
    expect(K1_SPECIALS.length).toBe(8);
    expect(EXPECTED_COUNTS.K1).toBe(K1_N + K1_SPECIALS.length);
    expect(EXPECTED_HASHES.counts.K1).toBe(4104);
  });

  test("every pinned count matches EXPECTED_HASHES.counts", () => {
    expect(EXPECTED_HASHES.counts.K1).toBe(EXPECTED_COUNTS.K1);
    expect(EXPECTED_HASHES.counts.K2).toBe(EXPECTED_COUNTS.K2);
    expect(EXPECTED_HASHES.counts.K3).toBe(EXPECTED_COUNTS.K3);
    expect(EXPECTED_HASHES.counts.K4).toBe(EXPECTED_COUNTS.K4);
    expect(EXPECTED_HASHES.counts.K5).toBe(EXPECTED_COUNTS.K5);
  });
});

/* ─────────────────────────────── hashes.ts ──────────────────────────────── */

describe("reprogpu hashes helpers", () => {
  test("normalizeWgsl strips a BOM and normalizes CRLF/CR to LF", () => {
    expect(normalizeWgsl("\uFEFFa\r\nb\rc")).toBe("a\nb\nc");
    expect(normalizeWgsl("a\r\nb")).toBe("a\nb");
    expect(normalizeWgsl("no-bom")).toBe("no-bom");
  });

  test("wgslSha256 is stable and line-ending independent", () => {
    const source = "@compute @workgroup_size(1)\nfn main() {}";
    const crlf = "@compute @workgroup_size(1)\r\nfn main() {}";
    expect(wgslSha256(source)).toBe(wgslSha256(source));
    expect(wgslSha256(source)).toBe(wgslSha256(crlf));
    expect(wgslSha256(source)).toMatch(/^[0-9a-f]{64}$/);
  });

  test("canonicalize sorts object keys and drops insignificant whitespace", () => {
    expect(canonicalize({ b: 1, a: 2 })).toBe('{"a":2,"b":1}');
    expect(canonicalize({ b: { d: 2, c: 3 }, a: 1 })).toBe(
      '{"a":1,"b":{"c":3,"d":2}}',
    );
    expect(canonicalize([3, 1, 2])).toBe("[3,1,2]");
  });

  test("manifestSha256 is stable across key order", () => {
    const first = manifestSha256({ version: 1, records: [] });
    const second = manifestSha256({ records: [], version: 1 });
    expect(first).toBe(second);
    expect(first).toMatch(/^[0-9a-f]{64}$/);
  });
});

/* ───────────────────────────── determinism ──────────────────────────────── */

describe("reprogpu determinism", () => {
  test("the LCG draws the same stream for the same seed", () => {
    const first = lcg32(K3_SEED);
    const second = lcg32(K3_SEED);
    const a = [first(), first(), first()];
    const b = [second(), second(), second()];
    expect(a).toEqual(b);
  });

  test("two K1 runs are byte-identical", () => {
    const first = sha256Hex(serializeSum320(exactSum320(k1Words())));
    const second = sha256Hex(serializeSum320(exactSum320(k1Words())));
    expect(first).toBe(second);
  });
});

/* ─────────────────────────────── reference ──────────────────────────────── */

describe("reprogpu reference helper mirror", () => {
  test("u32sToBytes and bswap32 reproduce the K4 output-pin pipeline", () => {
    const digest = sha256Bytes(k4Message());
    const words: number[] = [];
    for (let index = 0; index < 8; index += 1) {
      let word = 0;
      for (let byte = 0; byte < 4; byte += 1) {
        word = ((word << 8) | digest[index * 4 + byte]) >>> 0;
      }
      words.push(bswap32(word));
    }
    const serialized = u32sToBytes(new Uint32Array([16385, ...words]));
    expect(serialized.length).toBe(9 * 4);
    expect(sha256Hex(serialized)).toBe(EXPECTED_HASHES.hashes.K4);
  });
});
