/**
 * K1 reference: exact f32 summation via a 320-bit integer superaccumulator.
 *
 * Every input word is an opaque binary32 bit pattern transported as a u32.
 * The exact value is decoded as (-1)^sign * M * 2^shift and accumulated in a
 * single BigInt `A`. The result is reduced into ten little-endian u32 limbs
 * modulo 2^320 (A[0] least significant), exactly as the WGSL kernel writes them.
 *
 * No floating-point arithmetic is used: only bit extraction from the word.
 * Deterministic; depends on no host/Node API, time, or randomness.
 */

export type DecodedF32 =
  | { kind: "zero" }
  | { kind: "finite"; sign: 0 | 1; mantissa: number; shift: number }
  | { kind: "nonfinite" };

export interface ExactSum320Result {
  /** Ten little-endian u32 limbs, A[0] least significant, value = Σ A[i]·2^(32i). */
  readonly limbs: readonly number[];
  /** bit0 set iff at least one non-finite word (Inf/NaN) was seen. */
  readonly flags: 0 | 1;
  /** words.length — read-completeness canary (counts skipped words too). */
  readonly count: number;
}

const LIMB_COUNT = 10;
const LIMB_BITS = 32;
const MOD_320 = BigInt(1) << BigInt(320);
const MASK_32 = BigInt(0xffffffff);

/**
 * Decode a binary32 bit pattern. `e == 0xFF` -> nonfinite; `e == 0 && m == 0`
 * -> zero (±0); `e == 0` -> subnormal (M = m, shift = 0); otherwise normal
 * (M = 0x800000 | m, shift = e - 1). The term value is (-1)^sign · M · 2^shift.
 */
export function decodeF32(word: number): DecodedF32 {
  const w = word >>> 0;
  const sign = (w >>> 31) as 0 | 1;
  const e = (w >>> 23) & 0xff;
  const m = w & 0x7fffff;

  if (e === 0xff) return { kind: "nonfinite" };
  if (e === 0 && m === 0) return { kind: "zero" };
  if (e === 0) return { kind: "finite", sign, mantissa: m, shift: 0 };
  return { kind: "finite", sign, mantissa: 0x800000 | m, shift: e - 1 };
}

/**
 * Exact sum A = Σ (-1)^sign · M · 2^shift over every word. Non-finite words
 * contribute 0 and set the sticky flag; ±0 contributes 0. Limbs are the
 * two's-complement reduction of A into 320 bits.
 */
export function exactSum320(words: ArrayLike<number>): ExactSum320Result {
  let acc = BigInt(0);
  let flags: 0 | 1 = 0;

  for (let i = 0; i < words.length; i++) {
    const decoded = decodeF32(words[i]);
    if (decoded.kind === "nonfinite") {
      flags = 1;
      continue;
    }
    if (decoded.kind === "zero") continue;

    const term = BigInt(decoded.mantissa) << BigInt(decoded.shift);
    acc = decoded.sign === 1 ? acc - term : acc + term;
  }

  const reduced = ((acc % MOD_320) + MOD_320) % MOD_320;
  const limbs: number[] = new Array(LIMB_COUNT);
  for (let i = 0; i < LIMB_COUNT; i++) {
    limbs[i] = Number((reduced >> BigInt(LIMB_BITS * i)) & MASK_32);
  }

  return { limbs, flags, count: words.length };
}

/** 12 little-endian u32 = A[0..9], flags, count = 48 bytes. */
export function serializeSum320(result: ExactSum320Result): Uint8Array {
  const out = new Uint8Array(48);
  for (let i = 0; i < LIMB_COUNT; i++) {
    writeU32LE(out, i * 4, result.limbs[i]);
  }
  writeU32LE(out, 40, result.flags);
  writeU32LE(out, 44, result.count);
  return out;
}

function writeU32LE(out: Uint8Array, offset: number, value: number): void {
  const v = value >>> 0;
  out[offset] = v & 0xff;
  out[offset + 1] = (v >>> 8) & 0xff;
  out[offset + 2] = (v >>> 16) & 0xff;
  out[offset + 3] = (v >>> 24) & 0xff;
}
