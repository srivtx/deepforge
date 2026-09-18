/**
 * REPROGPU WGSL kernel sources (K1-K5).
 *
 * K1-K4 are integer-only: no float types/literals, no atomics, no `discard`,
 * and every runtime shift count is masked with `& 31u`. K5 is the float
 * negative control and is the only kernel that uses f32.
 *
 * These strings are the exact module bytes whose SHA-256 is pinned; see
 * `hashes.ts` (`normalizeWgsl` strips a BOM and normalizes CRLF to LF before
 * hashing).
 */

import type { KernelId } from "./types";

const K1_WGSL = `
@group(0) @binding(0) var<storage, read> input: array<u32>;
@group(0) @binding(1) var<storage, read_write> output: array<u32>;

var<workgroup> sh: array<u32, 2560>;
var<workgroup> wflags: array<u32, 256>;
var<workgroup> wcounts: array<u32, 256>;

@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let tid = gid.x;

  var A: array<u32, 10>;
  for (var z = 0u; z < 10u; z = z + 1u) {
    A[z] = 0u;
  }
  var fl = 0u;
  var cnt = 0u;

  let n = arrayLength(&input);
  for (var i = tid; i < n; i = i + 256u) {
    let w = input[i];
    cnt = cnt + 1u;
    let s = w >> 31u;
    let e = (w >> 23u) & 0xffu;
    let m = w & 0x7fffffu;

    if (e == 0xffu) {
      fl = fl | 1u;
      continue;
    }
    if (e == 0u && m == 0u) {
      continue;
    }

    let M = select(0x800000u | m, m, e == 0u);
    let shift = select(e - 1u, 0u, e == 0u);

    var T: array<u32, 10>;
    for (var z2 = 0u; z2 < 10u; z2 = z2 + 1u) {
      T[z2] = 0u;
    }
    let b = shift & 31u;
    let L = shift >> 5u;
    if (b == 0u) {
      T[L] = M;
    } else {
      T[L] = M << (b & 31u);
      T[L + 1u] = M >> ((32u - b) & 31u);
    }

    if (s == 1u) {
      for (var k = 0u; k < 10u; k = k + 1u) {
        T[k] = ~T[k];
      }
      var carryNeg = 1u;
      for (var k2 = 0u; k2 < 10u; k2 = k2 + 1u) {
        let t = T[k2] + carryNeg;
        carryNeg = select(0u, 1u, t < T[k2]);
        T[k2] = t;
      }
    }

    var carryAdd = 0u;
    for (var k3 = 0u; k3 < 10u; k3 = k3 + 1u) {
      let a = A[k3];
      let t = a + T[k3];
      let c1 = select(0u, 1u, t < a);
      let u = t + carryAdd;
      let c2 = select(0u, 1u, u < t);
      A[k3] = u;
      carryAdd = c1 | c2;
    }
  }

  for (var k4 = 0u; k4 < 10u; k4 = k4 + 1u) {
    sh[10u * tid + k4] = A[k4];
  }
  wflags[tid] = fl;
  wcounts[tid] = cnt;
  workgroupBarrier();

  for (var s = 0u; s < 8u; s = s + 1u) {
    let stride = 1u << ((7u - s) & 31u);
    if (tid < stride) {
      var c = 0u;
      for (var k5 = 0u; k5 < 10u; k5 = k5 + 1u) {
        let a = sh[10u * tid + k5];
        let b2 = sh[10u * (tid + stride) + k5];
        let t = a + b2;
        let c1 = select(0u, 1u, t < a);
        let u = t + c;
        let c2 = select(0u, 1u, u < t);
        sh[10u * tid + k5] = u;
        c = c1 | c2;
      }
      wflags[tid] = wflags[tid] | wflags[tid + stride];
      wcounts[tid] = wcounts[tid] + wcounts[tid + stride];
    }
    workgroupBarrier();
  }

  if (tid == 0u) {
    for (var k6 = 0u; k6 < 10u; k6 = k6 + 1u) {
      output[k6] = sh[k6];
    }
    output[10] = wflags[0];
    output[11] = wcounts[0];
  }
}
`.trim();

const K2_WGSL = `
@group(0) @binding(0) var<storage, read_write> output: array<u32>;

fn mulhilo(a: u32, b: u32) -> vec2<u32> {
  let a0 = a & 0xffffu;
  let a1 = a >> 16u;
  let b0 = b & 0xffffu;
  let b1 = b >> 16u;
  let p0 = a0 * b0;
  let p1 = a0 * b1;
  let p2 = a1 * b0;
  let p3 = a1 * b1;
  let mid = (p0 >> 16u) + (p1 & 0xffffu) + (p2 & 0xffffu);
  let lo = (p0 & 0xffffu) | (mid << 16u);
  let hi = p3 + (p1 >> 16u) + (p2 >> 16u) + (mid >> 16u);
  return vec2<u32>(hi, lo);
}

@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let idx = gid.x;
  if (idx > 65536u) {
    return;
  }
  if (idx == 0u) {
    output[0] = 65536u;
  }
  if (idx == 65536u) {
    return;
  }

  var c0 = idx;
  var c1 = 0u;
  var c2 = 0u;
  var c3 = 0u;
  var k0 = 0x12345678u;
  var k1 = 0x9abcdef0u;

  for (var r = 0u; r < 10u; r = r + 1u) {
    let m0 = mulhilo(0xd2511f53u, c0);
    let m1 = mulhilo(0xcd9e8d57u, c2);
    let hi0 = m0.x;
    let lo0 = m0.y;
    let hi1 = m1.x;
    let lo1 = m1.y;
    let nc0 = hi1 ^ c1 ^ k0;
    let nc1 = lo1;
    let nc2 = hi0 ^ c3 ^ k1;
    let nc3 = lo0;
    c0 = nc0;
    c1 = nc1;
    c2 = nc2;
    c3 = nc3;
    if (r < 9u) {
      k0 = k0 + 0x9e3779b9u;
      k1 = k1 + 0xbb67ae85u;
    }
  }

  let o = 1u + 4u * idx;
  output[o] = c0;
  output[o + 1u] = c1;
  output[o + 2u] = c2;
  output[o + 3u] = c3;
}
`.trim();

const K3_WGSL = `
@group(0) @binding(0) var<storage, read> A: array<i32>;
@group(0) @binding(1) var<storage, read> B: array<i32>;
@group(0) @binding(2) var<storage, read_write> output: array<u32>;

@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let idx = gid.x;
  if (idx > 65536u) {
    return;
  }
  if (idx == 65536u) {
    output[65536] = 65536u;
    return;
  }

  let r = idx >> 8u;
  let c = idx & 255u;

  var A0 = 0u;
  var A1 = 0u;
  var A2 = 0u;

  for (var k = 0u; k < 256u; k = k + 1u) {
    let a = A[r * 256u + k];
    let b = B[k * 256u + c];

    let ua = bitcast<u32>(a);
    let ub = bitcast<u32>(b);
    let a0 = ua & 0xffffu;
    let a1 = ua >> 16u;
    let b0 = ub & 0xffffu;
    let b1 = ub >> 16u;
    let p0 = a0 * b0;
    let p1 = a0 * b1;
    let p2 = a1 * b0;
    let p3 = a1 * b1;
    let mid = (p0 >> 16u) + (p1 & 0xffffu) + (p2 & 0xffffu);
    let lo = (p0 & 0xffffu) | (mid << 16u);
    let hi = p3 + (p1 >> 16u) + (p2 >> 16u) + (mid >> 16u);

    let signedHi = hi - select(0u, ub, a < 0i) - select(0u, ua, b < 0i);
    let a2add = select(0u, 0xffffffffu, (signedHi & 0x80000000u) != 0u);

    let t0 = A0 + lo;
    let c0 = select(0u, 1u, t0 < A0);
    let t1 = A1 + signedHi;
    let c1a = select(0u, 1u, t1 < A1);
    let t1b = t1 + c0;
    let c1b = select(0u, 1u, t1b < t1);
    let c1 = c1a | c1b;
    let t2 = A2 + a2add;    let c2a = select(0u, 1u, t2 < A2);
    let t2b = t2 + c1;
    let c2b = select(0u, 1u, t2b < t2);

    A0 = t0;
    A1 = t1b;
    A2 = t2b;
  }

  output[idx] = (A0 >> 16u) | (A1 << 16u);
}
`.trim();

const K4_WGSL = `
@group(0) @binding(0) var<storage, read> input: array<u32>;
@group(0) @binding(1) var<storage, read_write> output: array<u32>;

var<private> K: array<u32, 64> = array<u32, 64>(
  0x428a2f98u, 0x71374491u, 0xb5c0fbcfu, 0xe9b5dba5u,
  0x3956c25bu, 0x59f111f1u, 0x923f82a4u, 0xab1c5ed5u,
  0xd807aa98u, 0x12835b01u, 0x243185beu, 0x550c7dc3u,
  0x72be5d74u, 0x80deb1feu, 0x9bdc06a7u, 0xc19bf174u,
  0xe49b69c1u, 0xefbe4786u, 0x0fc19dc6u, 0x240ca1ccu,
  0x2de92c6fu, 0x4a7484aau, 0x5cb0a9dcu, 0x76f988dau,
  0x983e5152u, 0xa831c66du, 0xb00327c8u, 0xbf597fc7u,
  0xc6e00bf3u, 0xd5a79147u, 0x06ca6351u, 0x14292967u,
  0x27b70a85u, 0x2e1b2138u, 0x4d2c6dfcu, 0x53380d13u,
  0x650a7354u, 0x766a0abbu, 0x81c2c92eu, 0x92722c85u,
  0xa2bfe8a1u, 0xa81a664bu, 0xc24b8b70u, 0xc76c51a3u,
  0xd192e819u, 0xd6990624u, 0xf40e3585u, 0x106aa070u,
  0x19a4c116u, 0x1e376c08u, 0x2748774cu, 0x34b0bcb5u,
  0x391c0cb3u, 0x4ed8aa4au, 0x5b9cca4fu, 0x682e6ff3u,
  0x748f82eeu, 0x78a5636fu, 0x84c87814u, 0x8cc70208u,
  0x90befffau, 0xa4506cebu, 0xbef9a3f7u, 0xc67178f2u
);

var<private> H: array<u32, 8>;
var<private> W: array<u32, 64>;

fn rotr(x: u32, n: u32) -> u32 {
  return (x >> (n & 31u)) | (x << ((32u - (n & 31u)) & 31u));
}

fn bswap32(x: u32) -> u32 {
  return ((x & 0x000000ffu) << 24u)
    | ((x & 0x0000ff00u) << 8u)
    | ((x & 0x00ff0000u) >> 8u)
    | ((x & 0xff000000u) >> 24u);
}

fn sha256Rounds() {
  var a = H[0];
  var b = H[1];
  var c = H[2];
  var d = H[3];
  var e = H[4];
  var f = H[5];
  var g = H[6];
  var h = H[7];

  for (var i = 0u; i < 64u; i = i + 1u) {
    let s1 = rotr(e, 6u) ^ rotr(e, 11u) ^ rotr(e, 25u);
    let ch = (e & f) ^ (~e & g);
    let t1 = h + s1 + ch + K[i] + W[i];
    let s0 = rotr(a, 2u) ^ rotr(a, 13u) ^ rotr(a, 22u);
    let maj = (a & b) ^ (a & c) ^ (b & c);
    let t2 = s0 + maj;
    h = g;
    g = f;
    f = e;
    e = d + t1;
    d = c;
    c = b;
    b = a;
    a = t1 + t2;
  }

  H[0] = H[0] + a;
  H[1] = H[1] + b;
  H[2] = H[2] + c;
  H[3] = H[3] + d;
  H[4] = H[4] + e;
  H[5] = H[5] + f;
  H[6] = H[6] + g;
  H[7] = H[7] + h;
}

@compute @workgroup_size(1)
fn main() {
  H = array<u32, 8>(
    0x6a09e667u, 0xbb67ae85u, 0x3c6ef372u, 0xa54ff53au,
    0x510e527fu, 0x9b05688cu, 0x1f83d9abu, 0x5be0cd19u
  );

  for (var blk = 0u; blk < 16384u; blk = blk + 1u) {
    for (var j = 0u; j < 16u; j = j + 1u) {
      W[j] = bswap32(input[16u * blk + j]);
    }
    for (var j2 = 16u; j2 < 64u; j2 = j2 + 1u) {
      let s0 = rotr(W[j2 - 15u], 7u) ^ rotr(W[j2 - 15u], 18u) ^ (W[j2 - 15u] >> 3u);
      let s1 = rotr(W[j2 - 2u], 17u) ^ rotr(W[j2 - 2u], 19u) ^ (W[j2 - 2u] >> 10u);
      W[j2] = W[j2 - 16u] + s0 + W[j2 - 7u] + s1;
    }
    sha256Rounds();
  }

  for (var j3 = 0u; j3 < 64u; j3 = j3 + 1u) {
    W[j3] = 0u;
  }
  W[0] = 0x80000000u;
  W[14] = 0u;
  W[15] = 0x00800000u;
  for (var j4 = 16u; j4 < 64u; j4 = j4 + 1u) {
    let p0 = rotr(W[j4 - 15u], 7u) ^ rotr(W[j4 - 15u], 18u) ^ (W[j4 - 15u] >> 3u);
    let p1 = rotr(W[j4 - 2u], 17u) ^ rotr(W[j4 - 2u], 19u) ^ (W[j4 - 2u] >> 10u);
    W[j4] = W[j4 - 16u] + p0 + W[j4 - 7u] + p1;
  }
  sha256Rounds();

  output[0] = 16385u;
  for (var i2 = 0u; i2 < 8u; i2 = i2 + 1u) {
    output[1u + i2] = bswap32(H[i2]);
  }
}
`.trim();

const K5_WGSL = `
@group(0) @binding(0) var<storage, read> A: array<f32>;
@group(0) @binding(1) var<storage, read> B: array<f32>;
@group(0) @binding(2) var<storage, read_write> output: array<f32>;

@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let idx = gid.x;
  if (idx >= 65536u) {
    return;
  }
  let r = idx >> 8u;
  let c = idx & 255u;
  var acc = 0.0;
  for (var k = 0u; k < 256u; k = k + 1u) {
    acc = acc + A[r * 256u + k] * B[k * 256u + c];
  }
  output[idx] = acc;
}
`.trim();

export const KERNEL_WGSL: Readonly<Record<KernelId, string>> = {
  K1: K1_WGSL,
  K2: K2_WGSL,
  K3: K3_WGSL,
  K4: K4_WGSL,
  K5: K5_WGSL,
};
