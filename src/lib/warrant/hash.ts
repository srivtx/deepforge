import type { Digest } from "./types";

const FNV_PRIME = 16777619;

const WARRANT_HASH_PREFIXES = ["\u0000warrant\u0000a\u0000", "\u0000warrant\u0000b\u0000"] as const;

function fnvMix(hash: number, byte: number): number {
  return Math.imul((hash ^ (byte & 0xff)) >>> 0, FNV_PRIME) >>> 0;
}

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

export function warrantHash(input: string): Digest {
  if (typeof input !== "string") {
    throw new TypeError("warrantHash: input must be a string");
  }
  const first = fnv1a32(`${WARRANT_HASH_PREFIXES[0]}${input}`);
  const second = fnv1a32(`${WARRANT_HASH_PREFIXES[1]}${input}`);
  return hex8(first) + hex8(second);
}

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

export const WARRANT_HASH_VECTORS: readonly { readonly input: string; readonly digest: Digest }[] = [
  { input: "", digest: "1ca0c9bd42a34426" },
  { input: "warrant", digest: "526ccd1e91eddd1b" },
];
