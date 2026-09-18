/**
 * K3 reference: exact Q16.16 integer GEMM.
 *
 * Inputs are row-major n x n Int32Array in Q16.16 (raw value = real · 2^16).
 * The exact integer row sum S = Σ_k a_ik · b_kj is accumulated in BigInt, the
 * single floor (arithmetic right shift by 16, toward -infinity) is applied once
 * at the end, and the low 32 bits are taken as the i32 output.
 *
 * Wrap: if the floored value is outside i32, the stored result wraps mod 2^32
 * per WGSL §6.2.3 (i32 is two's complement). Wrap is documented behaviour, not
 * "correct": seeded vectors keep outputs in range; out-of-range output is a
 * deliberate modulo reduce.
 *
 * Deterministic; no floating-point arithmetic, time, randomness, or host APIs.
 */

const SHIFT_16 = BigInt(16);
const MOD_32 = BigInt(4294967296);
const SIGN_32 = BigInt(2147483648);

/** Wrap an exact BigInt into signed int32 via ((x mod 2^32) + 2^32) mod 2^32. */
function wrapI32(value: bigint): number {
  const m = ((value % MOD_32) + MOD_32) % MOD_32;
  return Number(m >= SIGN_32 ? m - MOD_32 : m);
}

/**
 * Exact n x n Q16.16 GEMM. Accumulates Σ_k a_ik·b_kj in BigInt, then floors by
 * an arithmetic `>> 16` and wraps the low 32 bits into int32.
 */
export function q16Gemm(a: Int32Array, b: Int32Array, n: number): Int32Array {
  if (!(a instanceof Int32Array) || !(b instanceof Int32Array)) {
    throw new TypeError("q16Gemm: a and b must be Int32Array");
  }
  const size = n * n;
  if (a.length < size || b.length < size) {
    throw new RangeError("q16Gemm: a and b must hold at least n*n elements");
  }

  const av = new Array<bigint>(size);
  const bv = new Array<bigint>(size);
  for (let i = 0; i < size; i++) {
    av[i] = BigInt(a[i]);
    bv[i] = BigInt(b[i]);
  }

  const out = new Int32Array(size);
  for (let i = 0; i < n; i++) {
    const row = i * n;
    for (let j = 0; j < n; j++) {
      let s = BigInt(0);
      for (let k = 0; k < n; k++) {
        s += av[row + k] * bv[k * n + j];
      }
      out[row + j] = wrapI32(s >> SHIFT_16);
    }
  }
  return out;
}

/** Little-endian bytes of the i32 values (4 bytes each). */
export function serializeGemm(result: Int32Array): Uint8Array {
  const out = new Uint8Array(result.length * 4);
  for (let i = 0; i < result.length; i++) {
    const v = result[i] >>> 0;
    const offset = i * 4;
    out[offset] = v & 0xff;
    out[offset + 1] = (v >>> 8) & 0xff;
    out[offset + 2] = (v >>> 16) & 0xff;
    out[offset + 3] = (v >>> 24) & 0xff;
  }
  return out;
}
