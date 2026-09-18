const SHA256_K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
  0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
  0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

const SHA256_H0 = new Uint32Array([
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c,
  0x1f83d9ab, 0x5be0cd19,
]);

function rotr(x: number, n: number): number {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

function sha256Compress(h: Uint32Array, block: Uint8Array, w: Uint32Array): void {
  for (let i = 0; i < 16; i++) {
    const j = i * 4;
    w[i] =
      (((block[j] << 24) |
        (block[j + 1] << 16) |
        (block[j + 2] << 8) |
        block[j + 3]) >>>
        0);
  }
  for (let i = 16; i < 64; i++) {
    const x = w[i - 15];
    const y = w[i - 2];
    const s0 = rotr(x, 7) ^ rotr(x, 18) ^ (x >>> 3);
    const s1 = rotr(y, 17) ^ rotr(y, 19) ^ (y >>> 10);
    w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
  }

  let a = h[0];
  let b = h[1];
  let c = h[2];
  let d = h[3];
  let e = h[4];
  let f = h[5];
  let g = h[6];
  let hh = h[7];

  for (let i = 0; i < 64; i++) {
    const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
    const ch = (e & f) ^ (~e & g);
    const t1 = (hh + S1 + ch + SHA256_K[i] + w[i]) >>> 0;
    const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
    const maj = (a & b) ^ (a & c) ^ (b & c);
    const t2 = (S0 + maj) >>> 0;

    hh = g;
    g = f;
    f = e;
    e = (d + t1) >>> 0;
    d = c;
    c = b;
    b = a;
    a = (t1 + t2) >>> 0;
  }

  h[0] = (h[0] + a) >>> 0;
  h[1] = (h[1] + b) >>> 0;
  h[2] = (h[2] + c) >>> 0;
  h[3] = (h[3] + d) >>> 0;
  h[4] = (h[4] + e) >>> 0;
  h[5] = (h[5] + f) >>> 0;
  h[6] = (h[6] + g) >>> 0;
  h[7] = (h[7] + hh) >>> 0;
}

export function sha256Bytes(bytes: Uint8Array): Uint8Array {
  const len = bytes.length;
  const bitLenLow = (len << 3) >>> 0;
  const bitLenHigh = len >>> 29;

  const rem = len % 64;
  const padLen = rem < 56 ? 56 - rem : 120 - rem;
  const total = len + padLen + 8;

  const msg = new Uint8Array(total);
  msg.set(bytes, 0);
  msg[len] = 0x80;
  msg[total - 8] = (bitLenHigh >>> 24) & 0xff;
  msg[total - 7] = (bitLenHigh >>> 16) & 0xff;
  msg[total - 6] = (bitLenHigh >>> 8) & 0xff;
  msg[total - 5] = bitLenHigh & 0xff;
  msg[total - 4] = (bitLenLow >>> 24) & 0xff;
  msg[total - 3] = (bitLenLow >>> 16) & 0xff;
  msg[total - 2] = (bitLenLow >>> 8) & 0xff;
  msg[total - 1] = bitLenLow & 0xff;

  const h = new Uint32Array(SHA256_H0);
  const w = new Uint32Array(64);

  for (let off = 0; off < total; off += 64) {
    sha256Compress(h, msg.subarray(off, off + 64), w);
  }

  const out = new Uint8Array(32);
  for (let i = 0; i < 8; i++) {
    out[i * 4] = (h[i] >>> 24) & 0xff;
    out[i * 4 + 1] = (h[i] >>> 16) & 0xff;
    out[i * 4 + 2] = (h[i] >>> 8) & 0xff;
    out[i * 4 + 3] = h[i] & 0xff;
  }
  return out;
}

const HEX = "0123456789abcdef";

export function sha256Hex(bytes: Uint8Array): string {
  const digest = sha256Bytes(bytes);
  let out = "";
  for (let i = 0; i < digest.length; i++) {
    const b = digest[i];
    out += HEX[(b >>> 4) & 0xf] + HEX[b & 0xf];
  }
  return out;
}

function asciiBytes(s: string): Uint8Array {
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) {
    out[i] = s.charCodeAt(i) & 0xff;
  }
  return out;
}

export interface Sha256Kat {
  readonly label: string;
  readonly bytes: Uint8Array;
  readonly expectedHex: string;
}

export const SHA256_KATS: readonly Sha256Kat[] = [
  {
    label: "",
    bytes: asciiBytes(""),
    expectedHex:
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  },
  {
    label: "abc",
    bytes: asciiBytes("abc"),
    expectedHex:
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
  },
];
