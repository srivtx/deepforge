/**
 * Behavioral Delta Ledger — device-local persistence (raw adapter only).
 *
 * This is the only BDL module that touches storage, and it does so through
 * `readRaw` / `writeRaw` / `removeRaw` on the shared local adapter — never
 * through the sync store factory and never through the sync write notifier,
 * so the optional sync engine can never pick these keys up. Exactly two keys
 * exist:
 *
 * - `deepforge:bdl:v1`       ledger: the enable flag plus, per problem, the
 *                            basis fingerprint and the last attempt's
 *                            signature. One signature per problem; the
 *                            reference and any probe answers are never stored.
 * - `deepforge:bdl-shelf:v1` the opt-in "Your bugs" shelf: explicitly saved
 *                            sources, <= 3 per problem, <= 4 KB each, <= 48
 *                            total, oldest-`at` first out. Export is a
 *                            client-side JSON download via `exportBdlShelf`.
 *
 * Determinism: the module never reads a clock; every timestamp is supplied by
 * the caller (`at`). Parsing never throws: malformed payloads and unknown
 * versions yield the empty value, and a record whose stored `version` is not
 * `1` is dropped rather than reinterpreted. `getBdlRecord` returns null when
 * the stored basis fingerprint differs from the caller's; the next
 * `recordBdlAttempt` replaces the record instead of merging it.
 *
 * `hashSourceId` mirrors `hashBdlText(code + at)` from the pure engine without
 * importing it, so this module keeps a single dependency.
 */

import {
  readRaw,
  removeRaw,
  writeRaw,
} from "@/lib/sync/localAdapter";

export const BDL_STORAGE_KEY = "deepforge:bdl:v1";
export const BDL_SHELF_STORAGE_KEY = "deepforge:bdl-shelf:v1";
export const BDL_CHANGE_EVENT = "deepforge:bdl-change";
export const BDL_SHELF_CHANGE_EVENT = "deepforge:bdl-shelf-change";
export const BDL_LEDGER_MAX_PROBLEMS = 300;
export const BDL_SHELF_MAX_PER_PROBLEM = 3;
export const BDL_SHELF_MAX_SOURCES = 48;
export const BDL_SHELF_MAX_SOURCE_CHARS = 4_096;

export interface BdlAttempt {
  readonly hash: string; // hashBdlText of the exact source that produced sig
  readonly sig: string; // <= 48 chars from {0,1,2,x}
  readonly mask: string;
  readonly at: string; // ISO timestamp, supplied by the caller (no clock in the store)
}

export interface BdlProblemRecord {
  readonly basis: string; // basisFingerprint at write time
  readonly last: BdlAttempt;
}

export interface BdlLedger {
  readonly version: 1;
  readonly enabled: boolean;
  readonly problems: Record<string, BdlProblemRecord>;
}

export interface BdlSavedSource {
  readonly id: string; // hashBdlText(code + at), 8 hex chars
  readonly code: string; // <= BDL_SHELF_MAX_SOURCE_CHARS
  readonly sig: string;
  readonly mask: string;
  readonly at: string;
}

interface BdlShelf {
  readonly version: 1;
  readonly problems: Record<string, readonly BdlSavedSource[]>;
}

const MAX_SIG_CHARS = 48;
const MAX_MASK_CHARS = 64;

/* ───────────────────────────── internal hash ────────────────────────────── */

function fnvMix(hash: number, byte: number): number {
  return Math.imul((hash ^ (byte & 0xff)) >>> 0, 16777619) >>> 0;
}

function fnv1a32(input: string): number {
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

function hashSourceId(code: string, at: string): string {
  return (fnv1a32(code + at) >>> 0).toString(16).padStart(8, "0");
}

/* ───────────────────────────── sanitizing ───────────────────────────────── */

function isIsoTimestamp(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && !Number.isNaN(Date.parse(value));
}

function timestampOf(value: string): number {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function sanitizeSig(value: unknown): string | null {
  if (typeof value !== "string" || value.length > MAX_SIG_CHARS) return null;
  return /^[012x]*$/.test(value) ? value : null;
}

function sanitizeMask(value: unknown): string | null {
  if (typeof value !== "string" || value.length > MAX_MASK_CHARS) return null;
  return /^[01]*$/.test(value) ? value : null;
}

function sanitizeAttempt(value: unknown): BdlAttempt | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (typeof record.hash !== "string" || record.hash.length === 0) return null;
  const sig = sanitizeSig(record.sig);
  const mask = sanitizeMask(record.mask);
  if (sig === null || mask === null || !isIsoTimestamp(record.at)) return null;
  return { hash: record.hash, sig, mask, at: record.at };
}

function sanitizeProblemRecord(value: unknown): BdlProblemRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (typeof record.basis !== "string" || record.basis.length === 0) return null;
  const last = sanitizeAttempt(record.last);
  if (!last) return null;
  return { basis: record.basis, last };
}

function sanitizeSavedSource(value: unknown): BdlSavedSource | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (
    typeof record.code !== "string" ||
    record.code.length === 0 ||
    record.code.length > BDL_SHELF_MAX_SOURCE_CHARS
  ) {
    return null;
  }
  const sig = sanitizeSig(record.sig);
  const mask = sanitizeMask(record.mask);
  if (sig === null || mask === null || !isIsoTimestamp(record.at)) return null;
  return {
    id: hashSourceId(record.code, record.at),
    code: record.code,
    sig,
    mask,
    at: record.at,
  };
}

/* ─────────────────────────────── ledger ────────────────────────────────── */

function emptyLedger(): BdlLedger {
  return { version: 1, enabled: false, problems: {} };
}

function compareNewestFirst(
  a: { readonly at: string },
  b: { readonly at: string },
): number {
  return timestampOf(b.at) - timestampOf(a.at);
}

function capLedger(
  problems: Record<string, BdlProblemRecord>,
): Record<string, BdlProblemRecord> {
  const ids = Object.keys(problems);
  if (ids.length <= BDL_LEDGER_MAX_PROBLEMS) return problems;
  ids.sort(
    (a, b) =>
      timestampOf(problems[b].last.at) - timestampOf(problems[a].last.at) ||
      a.localeCompare(b),
  );
  const out: Record<string, BdlProblemRecord> = {};
  for (const id of ids.slice(0, BDL_LEDGER_MAX_PROBLEMS)) {
    out[id] = problems[id];
  }
  return out;
}

function parseLedger(raw: string | null): BdlLedger {
  if (!raw) return emptyLedger();
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return emptyLedger();
    }
    const record = parsed as Record<string, unknown>;
    if (record.version !== 1) return emptyLedger();
    const problems: Record<string, BdlProblemRecord> = {};
    const rawProblems = record.problems;
    if (rawProblems && typeof rawProblems === "object" && !Array.isArray(rawProblems)) {
      for (const [problemId, value] of Object.entries(
        rawProblems as Record<string, unknown>,
      )) {
        if (!problemId) continue;
        const entry = sanitizeProblemRecord(value);
        if (entry) problems[problemId] = entry;
      }
    }
    return {
      version: 1,
      enabled: record.enabled === true,
      problems: capLedger(problems),
    };
  } catch {
    return emptyLedger();
  }
}

function writeLedger(ledger: BdlLedger): void {
  writeRaw(BDL_STORAGE_KEY, JSON.stringify(ledger));
}

export function getBdlLedger(): BdlLedger {
  return parseLedger(readRaw(BDL_STORAGE_KEY));
}

/** Default false: the ledger stores nothing until the learner opts in. */
export function isBdlEnabled(): boolean {
  return getBdlLedger().enabled;
}

export function setBdlEnabled(enabled: boolean): void {
  const ledger = getBdlLedger();
  writeLedger({
    version: 1,
    enabled: enabled === true,
    problems: ledger.problems,
  });
  dispatchBdlChange(BDL_CHANGE_EVENT);
}

export function getBdlRecord(
  problemId: string,
  basis: string,
): BdlAttempt | null {
  if (typeof problemId !== "string" || typeof basis !== "string") return null;
  const record = getBdlLedger().problems[problemId];
  if (!record || record.basis !== basis) return null;
  return record.last;
}

/** No-op unless enabled. Replaces `last`; drops a record whose `basis` differs. */
export function recordBdlAttempt(
  problemId: string,
  basis: string,
  attempt: BdlAttempt,
): void {
  if (!isBdlEnabled()) return;
  if (
    typeof problemId !== "string" ||
    problemId.length === 0 ||
    typeof basis !== "string" ||
    basis.length === 0
  ) {
    return;
  }
  const clean = sanitizeAttempt(attempt);
  if (!clean) return;
  const ledger = getBdlLedger();
  const problems = { ...ledger.problems };
  problems[problemId] = { basis, last: clean };
  writeLedger({
    version: 1,
    enabled: ledger.enabled,
    problems: capLedger(problems),
  });
  dispatchBdlChange(BDL_CHANGE_EVENT);
}

export function clearBdlProblem(problemId: string): void {
  if (typeof problemId !== "string" || problemId.length === 0) return;
  const ledger = getBdlLedger();
  if (!(problemId in ledger.problems)) return;
  const problems = { ...ledger.problems };
  delete problems[problemId];
  writeLedger({ version: 1, enabled: ledger.enabled, problems });
  dispatchBdlChange(BDL_CHANGE_EVENT);
}

export function clearBdl(): void {
  removeRaw(BDL_STORAGE_KEY);
  dispatchBdlChange(BDL_CHANGE_EVENT);
}

/* ──────────────────────────────── shelf ────────────────────────────────── */

function emptyShelf(): BdlShelf {
  return { version: 1, problems: {} };
}

function parseShelf(raw: string | null): BdlShelf {
  if (!raw) return emptyShelf();
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return emptyShelf();
    }
    const record = parsed as Record<string, unknown>;
    if (record.version !== 1) return emptyShelf();
    const collected: Record<string, BdlSavedSource[]> = {};
    const rawProblems = record.problems;
    if (rawProblems && typeof rawProblems === "object" && !Array.isArray(rawProblems)) {
      for (const [problemId, value] of Object.entries(
        rawProblems as Record<string, unknown>,
      )) {
        if (!problemId || !Array.isArray(value)) continue;
        const sources: BdlSavedSource[] = [];
        for (const candidate of value) {
          const source = sanitizeSavedSource(candidate);
          if (source) sources.push(source);
        }
        if (sources.length > 0) {
          sources.sort(compareNewestFirst);
          collected[problemId] = sources.slice(0, BDL_SHELF_MAX_PER_PROBLEM);
        }
      }
    }
    return { version: 1, problems: capShelf(collected) };
  } catch {
    return emptyShelf();
  }
}

function capShelf(
  problems: Record<string, readonly BdlSavedSource[]>,
): Record<string, BdlSavedSource[]> {
  const entries: Array<{ problemId: string; source: BdlSavedSource }> = [];
  for (const problemId of Object.keys(problems).sort()) {
    for (const source of problems[problemId]) {
      entries.push({ problemId, source });
    }
  }
  entries.sort(
    (a, b) =>
      timestampOf(b.source.at) - timestampOf(a.source.at) ||
      a.problemId.localeCompare(b.problemId) ||
      a.source.id.localeCompare(b.source.id),
  );
  const out: Record<string, BdlSavedSource[]> = {};
  for (const entry of entries.slice(0, BDL_SHELF_MAX_SOURCES)) {
    const list = out[entry.problemId] ?? (out[entry.problemId] = []);
    list.push(entry.source);
  }
  return out;
}

export function getBdlShelf(problemId: string): readonly BdlSavedSource[] {
  if (typeof problemId !== "string") return [];
  return [...(parseShelf(readRaw(BDL_SHELF_STORAGE_KEY)).problems[problemId] ?? [])];
}

function writeShelf(shelf: BdlShelf): void {
  writeRaw(BDL_SHELF_STORAGE_KEY, JSON.stringify(shelf));
}

/** false (no-op) when disabled or the code exceeds the cap; over caps evicts oldest by `at`. */
export function saveBdlSource(
  problemId: string,
  source: {
    readonly code: string;
    readonly sig: string;
    readonly mask: string;
    readonly at: string;
  },
): boolean {
  if (!isBdlEnabled()) return false;
  if (typeof problemId !== "string" || problemId.length === 0) return false;
  if (!source || typeof source !== "object") return false;
  const candidate = sanitizeSavedSource(source);
  if (!candidate) return false;

  const shelf = parseShelf(readRaw(BDL_SHELF_STORAGE_KEY));
  const problems: Record<string, readonly BdlSavedSource[]> = {
    ...shelf.problems,
  };
  const existing = shelf.problems[problemId] ?? [];
  const kept = existing.filter((entry) => entry.id !== candidate.id);
  kept.push(candidate);
  kept.sort(compareNewestFirst);
  problems[problemId] = kept.slice(0, BDL_SHELF_MAX_PER_PROBLEM);
  writeShelf({ version: 1, problems: capShelf(problems) });
  dispatchBdlChange(BDL_SHELF_CHANGE_EVENT);
  return true;
}

export function removeBdlSource(problemId: string, sourceId: string): void {
  if (typeof problemId !== "string" || typeof sourceId !== "string") return;
  const shelf = parseShelf(readRaw(BDL_SHELF_STORAGE_KEY));
  const existing = shelf.problems[problemId];
  if (!existing || !existing.some((entry) => entry.id === sourceId)) return;
  const kept = existing.filter((entry) => entry.id !== sourceId);
  const problems: Record<string, readonly BdlSavedSource[]> = {
    ...shelf.problems,
  };
  if (kept.length > 0) problems[problemId] = kept;
  else delete problems[problemId];
  writeShelf({ version: 1, problems });
  dispatchBdlChange(BDL_SHELF_CHANGE_EVENT);
}

export function clearBdlShelf(): void {
  removeRaw(BDL_SHELF_STORAGE_KEY);
  dispatchBdlChange(BDL_SHELF_CHANGE_EVENT);
}

/** JSON string of the whole shelf for the opt-in "Export shelf" download. */
export function exportBdlShelf(): string {
  return JSON.stringify(parseShelf(readRaw(BDL_SHELF_STORAGE_KEY)));
}

/* ─────────────────────────────── events ────────────────────────────────── */

function dispatchBdlChange(event: string): void {
  try {
    if (typeof window === "undefined" || typeof CustomEvent !== "function") {
      return;
    }
    window.dispatchEvent(new CustomEvent(event));
  } catch {
    /* events unavailable — the write already happened */
  }
}
