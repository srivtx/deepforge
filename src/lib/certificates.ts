/**
 * Completion certificates: localStorage-backed records for finished learning
 * paths, curated collections, and category milestones. Certificates are
 * claimed explicitly by the user and can be printed, copied as text, or
 * exported as PNG. The verification code is a deterministic FNV-1a hash of
 * the certificate fields, so a shared text can be checked without a server.
 *
 * Everything here is SSR-safe and never throws: reads on the server return
 * empty results and writes without storage are silent no-ops.
 */

import { CATEGORIES } from "@/data/problems/meta";
import { LEARNING_PATHS } from "@/data/problems/paths";
import { PROBLEM_META } from "@/data/problems/problem-meta";
import { PREMADE_COLLECTIONS } from "@/data/collections";
import { getProgress, type ProgressMap } from "@/lib/progress";
import { getUserName } from "@/lib/leaderboard";
import type { Category } from "@/types/problem";

const STORAGE_KEY = "deepforge:certificates:v1";

/** Fired on this tab after certificates are issued or revoked. */
export const CERTIFICATES_CHANGE_EVENT = "deepforge:certificates-change";

/** Used when no in-browser username has been set. */
export const FALLBACK_RECIPIENT = "DeepForge Learner";

/** Fraction of a category that unlocks its milestone certificate. */
export const CATEGORY_MILESTONE_RATIO = 0.8;

export type CertificateKind = "path" | "collection" | "category";

export interface Certificate {
  id: string;
  kind: CertificateKind;
  refId: string;
  title: string;
  recipient: string;
  issuedAt: string;
  detail: string;
}

/** A claimable milestone as returned by `getEligible`. */
export interface CertificateEntry {
  kind: CertificateKind;
  refId: string;
  title: string;
  detail: string;
  total: number;
  solved: number;
}

/* ────────────────────────────── storage ─────────────────────────────────── */

function isCertificateKind(value: unknown): value is CertificateKind {
  return value === "path" || value === "collection" || value === "category";
}

function isCertificate(value: unknown): value is Certificate {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    isCertificateKind(v.kind) &&
    typeof v.refId === "string" &&
    typeof v.title === "string" &&
    typeof v.recipient === "string" &&
    typeof v.issuedAt === "string" &&
    typeof v.detail === "string"
  );
}

function read(): Certificate[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCertificate);
  } catch {
    return [];
  }
}

function write(certificates: Certificate[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(certificates));
    window.dispatchEvent(new CustomEvent(CERTIFICATES_CHANGE_EVENT));
  } catch {
    /* storage unavailable — silently ignore */
  }
}

/* ────────────────────────────── helpers ─────────────────────────────────── */

function countSolved(ids: string[], progress: ProgressMap): number {
  let solved = 0;
  for (const id of ids) {
    if (progress[id]?.solved) solved += 1;
  }
  return solved;
}

function uniqueIds(ids: string[]): string[] {
  return [...new Set(ids)];
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getRecipient(): string {
  try {
    const name = getUserName().trim();
    if (!name || name.toLowerCase() === "you") return FALLBACK_RECIPIENT;
    return name;
  } catch {
    return FALLBACK_RECIPIENT;
  }
}

function makeDetail(
  kind: CertificateKind,
  label: string,
  solved: number,
  total: number,
): string {
  const noun =
    kind === "path" ? "path" : kind === "collection" ? "collection" : "category";
  return `${solved} of ${total} problems · ${label} ${noun}`;
}

const CATEGORY_TOTALS: ReadonlyMap<Category, number> = (() => {
  const totals = new Map<Category, number>();
  for (const problem of PROBLEM_META) {
    totals.set(problem.category, (totals.get(problem.category) ?? 0) + 1);
  }
  return totals;
})();

/* ───────────────────────────── eligibility ──────────────────────────────── */

/**
 * Milestones the current progress has unlocked, newest catalog order:
 * every learning path with all problems solved, every curated collection
 * with all problems solved, and every category at or above 80% solved.
 */
export function getEligible(): CertificateEntry[] {
  try {
    const progress = getProgress();
    const entries: CertificateEntry[] = [];

    for (const path of LEARNING_PATHS) {
      const ids = uniqueIds(path.problemIds);
      const total = ids.length;
      if (total === 0) continue;
      const solved = countSolved(ids, progress);
      if (solved < total) continue;
      entries.push({
        kind: "path",
        refId: path.id,
        title: path.title,
        detail: makeDetail("path", path.title, solved, total),
        total,
        solved,
      });
    }

    for (const collection of PREMADE_COLLECTIONS) {
      const ids = uniqueIds(collection.problemIds);
      const total = ids.length;
      if (total === 0) continue;
      const solved = countSolved(ids, progress);
      if (solved < total) continue;
      entries.push({
        kind: "collection",
        refId: collection.id,
        title: collection.name,
        detail: makeDetail("collection", collection.name, solved, total),
        total,
        solved,
      });
    }

    for (const meta of CATEGORIES) {
      const total = CATEGORY_TOTALS.get(meta.name) ?? 0;
      if (total === 0) continue;
      const solved = countSolved(
        PROBLEM_META.filter((problem) => problem.category === meta.name).map(
          (problem) => problem.id,
        ),
        progress,
      );
      const threshold = Math.ceil(total * CATEGORY_MILESTONE_RATIO);
      if (solved < threshold) continue;
      entries.push({
        kind: "category",
        refId: slugify(meta.name),
        title: `${meta.name} Milestone`,
        detail: makeDetail("category", meta.name, solved, total),
        total,
        solved,
      });
    }

    return entries;
  } catch {
    return [];
  }
}

/* ───────────────────────────── issued list ──────────────────────────────── */

/** Certificates the user has claimed, oldest first. */
export function getIssued(): Certificate[] {
  try {
    return read();
  } catch {
    return [];
  }
}

/**
 * Issue a certificate for an eligible entry. Idempotent per (kind, refId):
 * claiming the same milestone twice returns the original record. The
 * recipient is the stored username at the time of issuance.
 */
export function issueCertificate(entry: CertificateEntry): Certificate {
  const issuedAt = new Date().toISOString();
  const fallback: Certificate = {
    id: `${entry.kind}:${entry.refId}`,
    kind: entry.kind,
    refId: entry.refId,
    title: entry.title,
    recipient: getRecipient(),
    issuedAt,
    detail: entry.detail || `${entry.solved} of ${entry.total} problems`,
  };
  try {
    const existing = read().find(
      (cert) => cert.kind === entry.kind && cert.refId === entry.refId,
    );
    if (existing) return existing;
    const all = read();
    all.push(fallback);
    write(all);
    return fallback;
  } catch {
    return fallback;
  }
}

/** Remove one of the user's certificates by id. Returns whether it existed. */
export function revokeCertificate(id: string): boolean {
  try {
    const all = read();
    const next = all.filter((cert) => cert.id !== id);
    if (next.length === all.length) return false;
    write(next);
    return true;
  } catch {
    return false;
  }
}

/* ──────────────────────── text + verification ───────────────────────────── */

/** FNV-1a (32-bit), kept local so this module has no hash dependency. */
function fnv1a(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Stable short code for a certificate: the base36 FNV-1a hash of
 * `kind|refId|recipient|issuedAt`, truncated to 8 characters. Same record
 * always produces the same code.
 */
export function verificationCode(
  cert: Pick<Certificate, "kind" | "refId" | "recipient" | "issuedAt">,
): string {
  try {
    const base = `${cert.kind}|${cert.refId}|${cert.recipient}|${cert.issuedAt}`;
    const first = fnv1a(base).toString(36);
    const second = fnv1a(`${base}#verify`).toString(36);
    return `${first}${second}`.slice(0, 8).padEnd(8, "0").toUpperCase();
  } catch {
    return "00000000";
  }
}

/** `YYYY-MM-DD` for a stored ISO timestamp; falls back to the raw value. */
export function formatCertificateDate(iso: string): string {
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toISOString().slice(0, 10);
  } catch {
    return iso;
  }
}

/** Plain-text share block for a certificate. */
export function buildCertificateText(cert: Certificate): string {
  try {
    return [
      "DEEPFORGE CERTIFICATE OF COMPLETION",
      "",
      cert.title,
      `Awarded to ${cert.recipient}`,
      cert.detail,
      `Issued ${formatCertificateDate(cert.issuedAt)}`,
      `Verification code: ${verificationCode(cert)}`,
      "",
      "DeepForge",
    ].join("\n");
  } catch {
    return "DeepForge certificate";
  }
}
