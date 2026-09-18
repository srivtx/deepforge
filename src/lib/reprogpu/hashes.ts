/**
 * Canonical hashing helpers for REPROGPU.
 *
 * `normalizeWgsl` strips a leading BOM and normalizes CRLF/CR to LF so the
 * WGSL source hash is line-ending independent. `canonicalize` produces a
 * deterministic JSON serialization (object keys sorted, no insignificant
 * whitespace) so the manifest hash is stable across engines.
 */

import { sha256Hex } from "./sha256";

export function normalizeWgsl(source: string): string {
  let out = source;
  if (out.charCodeAt(0) === 0xfeff) {
    out = out.slice(1);
  }
  return out.replace(/\r\n?/g, "\n");
}

function utf8Bytes(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

export function wgslSha256(source: string): string {
  return sha256Hex(utf8Bytes(normalizeWgsl(source)));
}

function canonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => canonicalValue(entry));
  }
  if (value !== null && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(record).sort()) {
      sorted[key] = canonicalValue(record[key]);
    }
    return sorted;
  }
  return value;
}

export function canonicalize(value: unknown): string {
  const serialized = JSON.stringify(canonicalValue(value));
  return serialized === undefined ? "null" : serialized;
}

export function manifestSha256(manifestWithoutHash: unknown): string {
  return sha256Hex(utf8Bytes(canonicalize(manifestWithoutHash)));
}
