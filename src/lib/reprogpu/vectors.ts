/**
 * Pinned K1/K3/K4 vectors for the REPROGPU CPU gate.
 *
 * All randomness is the deterministic 32-bit LCG
 *   state_{i+1} = (1664525 · state_i + 1013904223) mod 2^32
 * with wrapping u32 arithmetic (Math.imul + >>> 0). No time, no Math.random,
 * no network, no host APIs.
 */

/** Advance the LCG; returns the next u32 state. */
export function lcg32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state;
  };
}

export const K1_SEED = 0x2545f491;
export const K1_N = 4096;

/** Appended specials: max finite, -max finite, min subnormal, -min subnormal, 1.0, -1.0, +0, -0. */
export const K1_SPECIALS: readonly number[] = [
  0x7f7fffff,
  0xff7fffff,
  0x00000001,
  0x80000001,
  0x3f800000,
  0xbf800000,
  0x00000000,
  0x80000000,
];

/** K1 exact-sum vector: 4096 LCG words (word = next state) then the 8 specials. */
export function k1Words(): Uint32Array {
  const out = new Uint32Array(K1_N + K1_SPECIALS.length);
  const next = lcg32(K1_SEED);
  let filled = 0;
  while (filled < K1_N) {
    const word = next();
    if (((word >>> 23) & 0xff) === 0xff) {
      continue;
    }
    out[filled] = word;
    filled += 1;
  }
  for (let i = 0; i < K1_SPECIALS.length; i += 1) {
    out[K1_N + i] = K1_SPECIALS[i] >>> 0;
  }
  return out;
}

/** K1 flag vector: k1Words() then +Inf (0x7F800000) and NaN (0x7FC00000). */
export const K1_FLAG_WORDS: Uint32Array = (() => {
  const base = k1Words();
  const out = new Uint32Array(base.length + 2);
  out.set(base, 0);
  out[base.length] = 0x7f800000;
  out[base.length + 1] = 0x7fc00000;
  return out;
})();

export const K3_SEED = 0x1234abcd;

/**
 * K3 seeded matrices. Each raw value is drawn uniformly from [-2^20, 2^20)
 * (21-bit range minus 2^20), so |product| < 2^40 and an n=256 row sum is
 * < 2^48, well inside the 96-bit accumulator (≪ 2^95) and also inside the
 * exact-integer double range. `a` is filled first, then `b`, from one stream.
 */
export function q16SeedMatrices(n: number): { a: Int32Array; b: Int32Array } {
  const size = n * n;
  const a = new Int32Array(size);
  const b = new Int32Array(size);
  const next = lcg32(K3_SEED);
  const span = 1 << 21;
  const half = 1 << 20;
  for (let i = 0; i < size; i++) a[i] = (next() % span) - half;
  for (let i = 0; i < size; i++) b[i] = (next() % span) - half;
  return { a, b };
}

export const K4_SEED = 0x2545f491;
export const K4_MESSAGE_SIZE = 1048576; // 2^20 = 1 MiB

/** 1 MiB message: byte i = state_{i+1} >>> 24, state_0 = K4_SEED. */
export function k4Message(): Uint8Array {
  const out = new Uint8Array(K4_MESSAGE_SIZE);
  const next = lcg32(K4_SEED);
  for (let i = 0; i < out.length; i++) out[i] = next() >>> 24;
  return out;
}

/**
 * Expected status counts for the gate. K1 is the FULL word count including the
 * 8 appended specials: 4096 + 8 = 4104. K2/K3/K5 are 65536; K4 is 16385 blocks.
 */
export const EXPECTED_COUNTS = {
  K1: K1_N + K1_SPECIALS.length,
  K2: 65536,
  K3: 256 * 256,
  K4: 16385,
  K5: 256 * 256,
} as const;
