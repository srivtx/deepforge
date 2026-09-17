/**
 * Completion certificates: localStorage-backed records for finished learning
 * paths, curated collections, category milestones, passed labs, completed
 * projects, and strong interview mocks. Certificates are claimed explicitly
 * by the user and can be printed, copied as text, or exported as PNG.
 *
 * Shared certificates carry a self-verifying credential code built by
 * `src/lib/credentials.ts`: a canonical JSON evidence payload plus its
 * SHA-256 fingerprint, checkable offline at `/verify/<code>`. The legacy
 * FNV-1a fingerprint below is kept only for records and text generated
 * before that format existed.
 *
 * Everything here is SSR-safe and never throws: reads on the server return
 * empty results and writes without storage are silent no-ops.
 */

import { CATEGORIES } from "@/data/problems/meta";
import { LEARNING_PATHS } from "@/data/problems/paths";
import { PROBLEM_META } from "@/data/problems/problem-meta";
import { PREMADE_COLLECTIONS } from "@/data/collections";
import { INTERVIEW_TRACKS } from "@/data/interview";
import { LABS, type Lab } from "@/data/labs";
import { PROJECTS } from "@/data/projects";
import { getProgress, type ProgressMap } from "@/lib/progress";
import { getUserName } from "@/lib/leaderboard";
import {
  getLabRecords,
  meetsTarget,
  metricLabel,
} from "@/lib/labs";
import { getBestInterviewResult } from "@/lib/interview";
import { getProjectProgress, isProjectComplete } from "@/lib/projects";
import {
  CREDENTIAL_VERSION,
  encodeCredential,
  fingerprintFromCode,
  formatFingerprint,
  isCredentialKind,
  type CredentialKind,
  type CredentialPayload,
} from "@/lib/credentials";
import type { Category } from "@/types/problem";

const STORAGE_KEY = "deepforge:certificates:v1";

/** Fired on this tab after certificates are issued or revoked. */
export const CERTIFICATES_CHANGE_EVENT = "deepforge:certificates-change";

/** Used when no in-browser username has been set. */
export const FALLBACK_RECIPIENT = "DeepForge Learner";

/** Fraction of a category that unlocks its milestone certificate. */
export const CATEGORY_MILESTONE_RATIO = 0.8;

/** Fraction of an interview mock that unlocks its certificate. */
export const INTERVIEW_MOCK_RATIO = 0.8;

export type CertificateKind = CredentialKind;

export interface Certificate {
  id: string;
  kind: CertificateKind;
  refId: string;
  title: string;
  recipient: string;
  issuedAt: string;
  detail: string;
  /** Completed problem count when the record was issued after v2. */
  solved?: number;
  /** Problem count of the milestone when the record was issued after v2. */
  total?: number;
  /** Lab metric value at issue time, for lab credentials. */
  score?: number;
  /** Lab target at issue time, for lab credentials. */
  target?: number;
}

/** A claimable milestone as returned by `getEligible`. */
export interface CertificateEntry {
  kind: CertificateKind;
  refId: string;
  title: string;
  detail: string;
  /** Present for problem-based kinds (path, collection, category, interview). */
  total?: number;
  /** Present for problem-based kinds (path, collection, category, interview). */
  solved?: number;
  /** Present for lab credentials: the best score and the lab target. */
  score?: number;
  target?: number;
  /** Lab metric, so the UI can format the score like the labs page does. */
  metric?: Lab["metric"];
}

/* ────────────────────────────── storage ─────────────────────────────────── */

function isCertificateKind(value: unknown): value is CertificateKind {
  return isCredentialKind(value);
}

function isCertificate(value: unknown): value is Certificate {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  const countsOk =
    (v.solved === undefined || typeof v.solved === "number") &&
    (v.total === undefined || typeof v.total === "number");
  const measuresOk =
    (v.score === undefined || typeof v.score === "number") &&
    (v.target === undefined || typeof v.target === "number");
  return (
    typeof v.id === "string" &&
    isCertificateKind(v.kind) &&
    typeof v.refId === "string" &&
    typeof v.title === "string" &&
    typeof v.recipient === "string" &&
    typeof v.issuedAt === "string" &&
    typeof v.detail === "string" &&
    countsOk &&
    measuresOk
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

function makeLabDetail(
  labTitle: string,
  metric: Lab["metric"],
  score: number,
  target: number,
): string {
  return `${metricLabel(metric)} ${formatMeasure(metric, score)} vs target ${formatMeasure(metric, target)} · ${labTitle} lab`;
}

/** Matches the labs page: MSE shows two decimals, the rest three. */
export function formatMeasure(metric: Lab["metric"], value: number): string {
  return metric === "mse" ? value.toFixed(2) : value.toFixed(3);
}

function makeProjectDetail(projectTitle: string, done: number, total: number): string {
  return `${done} of ${total} steps · ${projectTitle} project`;
}

function makeInterviewDetail(trackTitle: string, solved: number, total: number): string {
  return `${solved} of ${total} mock problems · ${trackTitle} interview`;
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
 * with all problems solved, every category at or above 80% solved, every lab
 * whose best score meets its target, every project with every step solved,
 * and every interview mock at or above 80% of its problems solved.
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

    const labRecords = getLabRecords();
    for (const lab of LABS) {
      const record = labRecords[lab.id];
      if (!record || record.best === null) continue;
      const score = record.best;
      if (!meetsTarget(lab, score)) continue;
      entries.push({
        kind: "lab",
        refId: lab.id,
        title: `Application — ${lab.title}`,
        detail: makeLabDetail(
          lab.title,
          lab.metric,
          score,
          lab.target,
        ),
        score,
        target: lab.target,
        metric: lab.metric,
      });
    }

    for (const project of PROJECTS) {
      const { solved, total } = getProjectProgress(project, progress);
      if (total === 0 || !isProjectComplete(project, progress)) continue;
      entries.push({
        kind: "project",
        refId: project.id,
        title: `Build — ${project.title}`,
        detail: makeProjectDetail(project.title, solved, total),
        total,
        solved,
      });
    }

    for (const track of INTERVIEW_TRACKS) {
      const best = getBestInterviewResult(track.id);
      if (!best || best.total === 0) continue;
      const threshold = Math.ceil(best.total * INTERVIEW_MOCK_RATIO);
      if (best.solved < threshold) continue;
      entries.push({
        kind: "interview",
        refId: track.id,
        title: `Interview — ${track.title}`,
        detail: makeInterviewDetail(track.title, best.solved, best.total),
        total: best.total,
        solved: best.solved,
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
    detail: entry.detail || fallbackDetail(entry),
  };
  if (entry.solved !== undefined) fallback.solved = entry.solved;
  if (entry.total !== undefined) fallback.total = entry.total;
  if (entry.score !== undefined) fallback.score = entry.score;
  if (entry.target !== undefined) fallback.target = entry.target;
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

/** Last-resort detail line when an entry carries no human copy. */
function fallbackDetail(entry: CertificateEntry): string {
  if (entry.score !== undefined && entry.target !== undefined) {
    return `Score ${entry.score} vs target ${entry.target}`;
  }
  if (entry.solved !== undefined && entry.total !== undefined) {
    return `${entry.solved} of ${entry.total} problems`;
  }
  return entry.title;
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
 * Legacy short code for a certificate: the base36 FNV-1a hash of
 * `kind|refId|recipient|issuedAt`, truncated to 8 characters. Kept only so
 * pre-existing records and copied text still resolve; new shares use
 * `certificateCredentialCode`.
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

/* ──────────────────── credential codes (self-verifying) ─────────────────── */

function parseDetailCounts(detail: string): { solved: number; total: number } {
  const match = /(\d+)\s+of\s+(\d+)/.exec(detail);
  if (!match) return { solved: 0, total: 0 };
  return {
    solved: Number.parseInt(match[1], 10) || 0,
    total: Number.parseInt(match[2], 10) || 0,
  };
}

/**
 * Evidence payload for a certificate: the canonical fields `/verify`
 * re-checks. Records issued before counts were stored fall back to parsing
 * the human-readable `detail` line. Lab certificates must carry their
 * score/target, and project certificates map their stored step counts onto
 * the `stepsDone`/`stepsTotal` evidence fields.
 */
export function payloadFromCertificate(cert: Certificate): CredentialPayload {
  const parsed = parseDetailCounts(cert.detail);
  const base: Pick<
    CredentialPayload,
    "v" | "kind" | "ref" | "title" | "recipient" | "issued"
  > = {
    v: CREDENTIAL_VERSION,
    kind: cert.kind,
    ref: cert.refId,
    title: cert.title,
    recipient: cert.recipient,
    issued: formatCertificateDate(cert.issuedAt),
  };
  if (cert.kind === "lab") {
    if (typeof cert.score !== "number" || typeof cert.target !== "number") {
      throw new Error("lab certificate is missing its score or target");
    }
    return { ...base, score: cert.score, target: cert.target };
  }
  const solved = typeof cert.solved === "number" ? cert.solved : parsed.solved;
  const total = typeof cert.total === "number" ? cert.total : parsed.total;
  if (cert.kind === "project") {
    return { ...base, stepsDone: solved, stepsTotal: total };
  }
  return { ...base, solved, total };
}

/** Self-verifying code for a certificate; rejects when its fields are invalid. */
export async function certificateCredentialCode(
  cert: Certificate,
): Promise<string> {
  return encodeCredential(payloadFromCertificate(cert));
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

/**
 * Plain-text share block for a certificate. Pass the credential code to show
 * its fingerprint in place of the legacy FNV one.
 */
export function buildCertificateText(
  cert: Certificate,
  credentialCode?: string,
): string {
  try {
    const fingerprint = credentialCode
      ? fingerprintFromCode(credentialCode)
      : null;
    const code = fingerprint
      ? formatFingerprint(fingerprint)
      : verificationCode(cert);
    return [
      "DEEPFORGE CERTIFICATE OF COMPLETION",
      "",
      cert.title,
      `Awarded to ${cert.recipient}`,
      cert.detail,
      `Issued ${formatCertificateDate(cert.issuedAt)}`,
      `Verification code: ${code}`,
      "",
      "DeepForge",
    ].join("\n");
  } catch {
    return "DeepForge certificate";
  }
}
