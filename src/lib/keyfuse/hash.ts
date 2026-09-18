/**
 * KeyFuse hashing — deterministic identifiers for the cache-key auditor.
 *
 * Zero runtime imports and no ambient state: these functions build strings,
 * hash strings, and serialize values, so identical inputs produce identical
 * outputs on every engine and every run. `fnv1a32` is FNV-1a over the UTF-8
 * encoding of the input, consumed one code point at a time: a surrogate pair
 * is read as one code point and emitted as its four UTF-8 bytes, a lone
 * surrogate is encoded as-is in three bytes, matching the scheme used by
 * `src/lib/bdl.ts` so vectors are stable across engines. `keyfuseHash` runs
 * two FNV-1a rounds with different prefixes and concatenates their 8-hex-digit
 * results into 16 lowercase hex characters. It is a deterministic identifier,
 * NOT a cryptographic digest: the construction is 64-bit, birthday collisions
 * are plausible, and nothing here is a security boundary.
 *
 * `canonicalJson` is the byte-stable serialization `auditDigest` hashes:
 * object keys sorted by UTF-16 code unit, arrays kept in order, negative zero
 * normalized to zero, non-finite numbers rejected. Supported values are null,
 * boolean, finite number, string, array, and object; anything else (undefined,
 * bigint, symbol, function, cyclic structure) throws a TypeError instead of
 * being coerced, so a digest can never hide a value it could not represent.
 */

import type { AuditResult } from "./types";

const FNV_PRIME = 16777619;

/**
 * The two independent rounds of `keyfuseHash`; NUL-fenced so an input that
 * starts with the prefix text cannot collide with a differently split input.
 */
const KEYFUSE_HASH_PREFIXES = ["\u0000keyfuse\u0000a\u0000", "\u0000keyfuse\u0000b\u0000"] as const;

function fnvMix(hash: number, byte: number): number {
  return Math.imul((hash ^ (byte & 0xff)) >>> 0, FNV_PRIME) >>> 0;
}

/**
 * Deterministic 32-bit FNV-1a hash (unsigned) over the UTF-8 bytes of
 * `input`. Characters are consumed by code point: a high surrogate followed
 * by a low surrogate becomes one code point emitted as four UTF-8 bytes; any
 * other code unit is emitted as one to three bytes. No locale, no encoding
 * assumption beyond UTF-8.
 */
export function fnv1a32(input: string): number {
  if (typeof input !== "string") {
    throw new TypeError("fnv1a32: input must be a string");
  }
  let hash = 2166136261 >>> 0;
  for (let index = 0; index < input.length; index += 1) {
    let code = input.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff && index + 1 < input.length) {
      const next = input.charCodeAt(index + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        code = 0x10000 + ((code - 0xd800) << 10) + (next - 0xdc00);
        index += 1;
      }
    }
    if (code < 0x80) {
      hash = fnvMix(hash, code);
    } else if (code < 0x800) {
      hash = fnvMix(hash, 0xc0 | (code >> 6));
      hash = fnvMix(hash, 0x80 | (code & 0x3f));
    } else if (code < 0x10000) {
      hash = fnvMix(hash, 0xe0 | (code >> 12));
      hash = fnvMix(hash, 0x80 | ((code >> 6) & 0x3f));
      hash = fnvMix(hash, 0x80 | (code & 0x3f));
    } else {
      hash = fnvMix(hash, 0xf0 | (code >> 18));
      hash = fnvMix(hash, 0x80 | ((code >> 12) & 0x3f));
      hash = fnvMix(hash, 0x80 | ((code >> 6) & 0x3f));
      hash = fnvMix(hash, 0x80 | (code & 0x3f));
    }
  }
  return hash >>> 0;
}

function hex8(value: number): string {
  return (value >>> 0).toString(16).padStart(8, "0");
}

/**
 * 16 lowercase hex characters: two independent FNV-1a rounds over prefixed
 * copies of `input`, concatenated. A deterministic audit identifier, not a
 * cryptographic digest — see the module docblock.
 */
export function keyfuseHash(input: string): string {
  if (typeof input !== "string") {
    throw new TypeError("keyfuseHash: input must be a string");
  }
  const first = fnv1a32(`${KEYFUSE_HASH_PREFIXES[0]}${input}`);
  const second = fnv1a32(`${KEYFUSE_HASH_PREFIXES[1]}${input}`);
  return hex8(first) + hex8(second);
}

/**
 * Canonical JSON: a deterministic byte-for-byte serialization of `value`.
 * Object keys are sorted, array order is preserved, -0 becomes 0, and
 * non-finite numbers or non-JSON values throw a TypeError.
 */
export function canonicalJson(value: unknown): string {
  return canonicalValue(value, new WeakSet<object>());
}

function canonicalValue(value: unknown, seen: WeakSet<object>): string {
  if (value === null) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new TypeError(`canonicalJson: non-finite number ${String(value)}`);
    }
    return String(Object.is(value, -0) ? 0 : value);
  }
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value !== "object") {
    throw new TypeError(`canonicalJson: unsupported ${typeof value}`);
  }
  const container = value as object;
  if (seen.has(container)) {
    throw new TypeError("canonicalJson: cyclic value");
  }
  seen.add(container);
  let encoded: string;
  if (Array.isArray(value)) {
    const items: string[] = [];
    for (let index = 0; index < value.length; index += 1) {
      items.push(canonicalValue(value[index], seen));
    }
    encoded = `[${items.join(",")}]`;
  } else {
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record).sort();
    encoded = `{${keys
      .map((key) => `${JSON.stringify(key)}:${canonicalValue(record[key], seen)}`)
      .join(",")}}`;
  }
  seen.delete(container);
  return encoded;
}

/** Audit digest: `keyfuseHash(canonicalJson(result))`, the audit fingerprint. */
export function auditDigest(result: Omit<AuditResult, "digest">): string {
  return keyfuseHash(canonicalJson(result));
}
