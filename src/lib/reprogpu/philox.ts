export const M0 = 0xd2511f53;
export const M1 = 0xcd9e8d57;
export const W0 = 0x9e3779b9;
export const W1 = 0xbb67ae85;

function mulhilo32(a: number, b: number): [number, number] {
  const a0 = a & 0xffff;
  const a1 = a >>> 16;
  const b0 = b & 0xffff;
  const b1 = b >>> 16;

  const p0 = a0 * b0;
  const p1 = a0 * b1;
  const p2 = a1 * b0;
  const p3 = a1 * b1;

  const mid = (p0 >>> 16) + (p1 & 0xffff) + (p2 & 0xffff);
  const lo = ((p0 & 0xffff) | (mid << 16)) >>> 0;
  const hi = (p3 + (p1 >>> 16) + (p2 >>> 16) + (mid >>> 16)) >>> 0;
  return [hi, lo];
}

export function philox4x32_10(
  ctr: readonly [number, number, number, number],
  key: readonly [number, number],
): [number, number, number, number] {
  let c0 = ctr[0] >>> 0;
  let c1 = ctr[1] >>> 0;
  let c2 = ctr[2] >>> 0;
  let c3 = ctr[3] >>> 0;
  let k0 = key[0] >>> 0;
  let k1 = key[1] >>> 0;

  for (let r = 0; r < 10; r++) {
    const [hi0, lo0] = mulhilo32(M0, c0);
    const [hi1, lo1] = mulhilo32(M1, c2);

    c0 = (hi1 ^ c1 ^ k0) >>> 0;
    c1 = lo1 >>> 0;
    c2 = (hi0 ^ c3 ^ k1) >>> 0;
    c3 = lo0 >>> 0;

    if (r < 9) {
      k0 = (k0 + W0) >>> 0;
      k1 = (k1 + W1) >>> 0;
    }
  }

  return [c0, c1, c2, c3];
}

export interface PhiloxKat {
  readonly ctr: readonly [number, number, number, number];
  readonly key: readonly [number, number];
  readonly expected: readonly [number, number, number, number];
}

export const PHILOX_KATS: readonly PhiloxKat[] = [
  {
    ctr: [0x00000000, 0x00000000, 0x00000000, 0x00000000],
    key: [0x00000000, 0x00000000],
    expected: [0x6627e8d5, 0xe169c58d, 0xbc57ac4c, 0x9b00dbd8],
  },
  {
    ctr: [0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff],
    key: [0xffffffff, 0xffffffff],
    expected: [0x408f276d, 0x41c83b0e, 0xa20bc7c6, 0x6d5451fd],
  },
  {
    ctr: [0x243f6a88, 0x85a308d3, 0x13198a2e, 0x03707344],
    key: [0xa4093822, 0x299f31d0],
    expected: [0xd16cfe09, 0x94fdcceb, 0x5001e420, 0x24126ea1],
  },
];

export function philoxStream(
  blocks: number,
  key: readonly [number, number],
): Uint32Array {
  const out = new Uint32Array(blocks * 4);
  for (let i = 0; i < blocks; i++) {
    const [c0, c1, c2, c3] = philox4x32_10([i, 0, 0, 0], key);
    const j = i * 4;
    out[j] = c0;
    out[j + 1] = c1;
    out[j + 2] = c2;
    out[j + 3] = c3;
  }
  return out;
}
