/**
 * Completion certificates: localStorage-backed records for finished learning
 * paths, curated collections, category milestones, passed labs, completed
 * projects, strong interview mocks, swept research baselines, and every step
 * of a curated certification track. Certificates are claimed explicitly by
 * the user and can be printed, copied as text, or exported as PNG.
 *
 * `listCertificateCandidates` is the full catalog view: every milestone that
 * exists, with live progress and the requirement that unlocks it, so the
 * certificates page is never empty on a fresh profile. `getEligible` is the
 * unlocked subset of that same derivation, and `getTrackProgress` reads the
 * same eligibility rules for the certification tracks in
 * `src/data/certTracks.ts`.
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
import { RESEARCH_CHALLENGES } from "@/data/research";
import {
  CERT_TRACKS,
  type CertTrack,
  type CertTrackStep,
} from "@/data/certTracks";
import { getProgress, type ProgressMap } from "@/lib/progress";
import { getUserName } from "@/lib/leaderboard";
import {
  getLabRecords,
  meetsTarget,
  metricLabel,
  type LabRecords,
} from "@/lib/labs";
import { getBestInterviewResult } from "@/lib/interview";
import { getProjectProgress, isProjectComplete } from "@/lib/projects";
import { beatsBaseline, getResearchState } from "@/lib/research";
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
  /** Present for count-based kinds (path, collection, category, interview, research). */
  total?: number;
  /** Present for count-based kinds (path, collection, category, interview, research). */
  solved?: number;
  /** Present for lab credentials: the best score and the lab target. */
  score?: number;
  target?: number;
  /** Lab metric, so the UI can format the score like the labs page does. */
  metric?: Lab["metric"];
}

/**
 * One row of the full certificate catalog: a possible certificate with the
 * current progress toward it and the requirement that unlocks it. Ineligible
 * candidates still carry their counts/measures so the UI can render a live
 * progress bar, never just a locked card.
 */
export interface CertificateCandidate extends CertificateEntry {
  eligible: boolean;
  /** Fraction of the requirement met, clamped to 0..1. */
  progress: number;
  /** Short human sentence: "Solve all 12 problems", "Beat all 5 baselines". */
  requirement: string;
}

/** One step of a certification track with its live state. */
export interface CertTrackStepProgress {
  step: CertTrackStep;
  done: boolean;
  label: string;
  href: string;
  progress: string;
}

/** Live view of a certification track: per-step state and the roll-up. */
export interface CertTrackProgress {
  track: CertTrack;
  steps: CertTrackStepProgress[];
  done: number;
  total: number;
  complete: boolean;
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

function makeResearchDetail(beaten: number, total: number): string {
  return `${beaten} of ${total} baselines beaten · research challenges`;
}

/**
 * How many research baselines the stored research state shows as beaten.
 * `beatenBaseline` is sticky in the store; the best-score comparison keeps
 * records written before that flag (or hand-restored backups) accurate.
 */
function countBaselinesBeaten(): number {
  const state = getResearchState();
  let beaten = 0;
  for (const challenge of RESEARCH_CHALLENGES) {
    const stored = state[challenge.id];
    if (!stored) continue;
    if (stored.beatenBaseline) {
      beaten += 1;
    } else if (
      typeof stored.bestScore === "number" &&
      beatsBaseline(challenge, stored.bestScore)
    ) {
      beaten += 1;
    }
  }
  return beaten;
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
 * Everything candidate derivation needs, read once from the stores so the
 * catalog, `getEligible`, and track progress all evaluate the same numbers.
 * Plain data, so tests can build one without touching localStorage.
 */
export interface CertificateSnapshot {
  progress: ProgressMap;
  labs: LabRecords;
  /** Best interview result per track id, only for tracks that were attempted. */
  interviewBests: Record<string, { solved: number; total: number }>;
  /** Research baselines beaten, counting the sticky flag and best scores. */
  baselinesBeaten: number;
}

function captureSnapshot(): CertificateSnapshot {
  const interviewBests: Record<string, { solved: number; total: number }> = {};
  for (const track of INTERVIEW_TRACKS) {
    const best = getBestInterviewResult(track.id);
    if (best) {
      interviewBests[track.id] = { solved: best.solved, total: best.total };
    }
  }
  return {
    progress: getProgress(),
    labs: getLabRecords(),
    interviewBests,
    baselinesBeaten: countBaselinesBeaten(),
  };
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

/** Metric name as it reads in a requirement sentence. */
function metricName(metric: Lab["metric"]): string {
  switch (metric) {
    case "accuracy":
      return "accuracy";
    case "f1":
      return "F1";
    case "mse":
      return "MSE";
    case "r2":
      return "R\u00b2";
  }
}

/**
 * Fraction of a lab requirement met. Higher-is-better labs scale by
 * score/target; lower-is-better labs scale by target/score once the score is
 * above target. Meeting the target is always exactly 1.
 */
function labProgress(lab: Lab, score: number): number {
  if (meetsTarget(lab, score)) return 1;
  if (lab.higherIsBetter) {
    return lab.target === 0 ? 1 : clamp01(score / lab.target);
  }
  return score > 0 ? clamp01(lab.target / score) : 0;
}

function interviewThreshold(total: number): number {
  return Math.ceil(total * INTERVIEW_MOCK_RATIO);
}

function labRequirement(lab: Lab, score: number | undefined): string {
  const target = `Reach ${metricName(lab.metric)} ${formatMeasure(lab.metric, lab.target)}`;
  if (score === undefined) return target;
  return `${target} (best ${formatMeasure(lab.metric, score)})`;
}

/**
 * Every certificate the catalog can produce, in the order `getEligible` has
 * always used (paths, collections, categories, labs, projects, interview,
 * research, then certification tracks), each with its `eligible` flag,
 * `progress` fraction, and a short `requirement`.
 */
function deriveCertificateCandidates(
  snapshot: CertificateSnapshot,
): CertificateCandidate[] {
  const progress = snapshot.progress;
  const candidates: CertificateCandidate[] = [];

  for (const path of LEARNING_PATHS) {
    const ids = uniqueIds(path.problemIds);
    const total = ids.length;
    if (total === 0) continue;
    const solved = countSolved(ids, progress);
    candidates.push({
      kind: "path",
      refId: path.id,
      title: path.title,
      detail: makeDetail("path", path.title, solved, total),
      total,
      solved,
      eligible: solved >= total,
      progress: clamp01(solved / total),
      requirement: `Solve all ${total} problems`,
    });
  }

  for (const collection of PREMADE_COLLECTIONS) {
    const ids = uniqueIds(collection.problemIds);
    const total = ids.length;
    if (total === 0) continue;
    const solved = countSolved(ids, progress);
    candidates.push({
      kind: "collection",
      refId: collection.id,
      title: collection.name,
      detail: makeDetail("collection", collection.name, solved, total),
      total,
      solved,
      eligible: solved >= total,
      progress: clamp01(solved / total),
      requirement: `Solve all ${total} problems`,
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
    candidates.push({
      kind: "category",
      refId: slugify(meta.name),
      title: `${meta.name} Milestone`,
      detail: makeDetail("category", meta.name, solved, total),
      total,
      solved,
      eligible: solved >= Math.ceil(total * CATEGORY_MILESTONE_RATIO),
      progress: clamp01(solved / total),
      requirement: `${Math.round(CATEGORY_MILESTONE_RATIO * 100)}% of ${total} problems`,
    });
  }

  for (const lab of LABS) {
    const record = snapshot.labs[lab.id];
    const score = record && record.best !== null ? record.best : undefined;
    candidates.push({
      kind: "lab",
      refId: lab.id,
      title: `Application — ${lab.title}`,
      detail:
        score === undefined
          ? `Target ${formatMeasure(lab.metric, lab.target)} · ${lab.title} lab`
          : makeLabDetail(lab.title, lab.metric, score, lab.target),
      score,
      target: lab.target,
      metric: lab.metric,
      eligible: score !== undefined && meetsTarget(lab, score),
      progress: score === undefined ? 0 : labProgress(lab, score),
      requirement: labRequirement(lab, score),
    });
  }

  for (const project of PROJECTS) {
    const { solved, total } = getProjectProgress(project, progress);
    if (total === 0) continue;
    candidates.push({
      kind: "project",
      refId: project.id,
      title: `Build — ${project.title}`,
      detail: makeProjectDetail(project.title, solved, total),
      total,
      solved,
      eligible: isProjectComplete(project, progress),
      progress: clamp01(solved / total),
      requirement: `Complete all ${total} steps`,
    });
  }

  for (const track of INTERVIEW_TRACKS) {
    const best = snapshot.interviewBests[track.id];
    const fallbackTotal = track.mockProblemIds.length;
    const total = best && best.total > 0 ? best.total : fallbackTotal;
    if (total === 0) continue;
    const solved = best ? best.solved : 0;
    const threshold = interviewThreshold(total);
    candidates.push({
      kind: "interview",
      refId: track.id,
      title: `Interview — ${track.title}`,
      detail: makeInterviewDetail(track.title, solved, total),
      total,
      solved,
      eligible:
        best !== undefined && best.total > 0 && best.solved >= threshold,
      progress: clamp01(solved / total),
      requirement: `Solve ${threshold} of ${total} mock problems`,
    });
  }

  const researchTotal = RESEARCH_CHALLENGES.length;
  if (researchTotal > 0) {
    const beaten = Math.min(snapshot.baselinesBeaten, researchTotal);
    candidates.push({
      kind: "research",
      refId: "research-baselines",
      title: `Research Challenges — ${beaten}/${researchTotal} baselines beaten`,
      detail: makeResearchDetail(beaten, researchTotal),
      total: researchTotal,
      solved: beaten,
      eligible: beaten >= researchTotal,
      progress: clamp01(beaten / researchTotal),
      requirement: `Beat all ${researchTotal} baselines`,
    });
  }

  for (const track of CERT_TRACKS) {
    const state = deriveTrackProgress(track, snapshot);
    if (state.total === 0) continue;
    candidates.push({
      kind: "track",
      refId: track.id,
      title: track.title,
      detail: `${state.done} of ${state.total} steps · ${track.title} track`,
      total: state.total,
      solved: state.done,
      eligible: state.complete,
      progress: clamp01(state.done / state.total),
      requirement: `Complete all ${state.total} steps`,
    });
  }

  return candidates;
}

/** Strip catalog-only fields so eligible entries keep their legacy shape. */
function toEntry(candidate: CertificateCandidate): CertificateEntry {
  const entry: CertificateEntry = {
    kind: candidate.kind,
    refId: candidate.refId,
    title: candidate.title,
    detail: candidate.detail,
  };
  if (candidate.total !== undefined) entry.total = candidate.total;
  if (candidate.solved !== undefined) entry.solved = candidate.solved;
  if (candidate.score !== undefined) entry.score = candidate.score;
  if (candidate.target !== undefined) entry.target = candidate.target;
  if (candidate.metric !== undefined) entry.metric = candidate.metric;
  return entry;
}

/**
 * The full certificate catalog: every possible certificate with live
 * progress and the requirement that unlocks it. Reads the same stores
 * `getEligible` reads and never throws.
 */
export function listCertificateCandidates(): CertificateCandidate[] {
  try {
    return deriveCertificateCandidates(captureSnapshot());
  } catch {
    return [];
  }
}

/**
 * Milestones the current progress has unlocked, in catalog order: every
 * learning path with all problems solved, every curated collection with all
 * problems solved, every category at or above 80% solved, every lab whose
 * best score meets its target, every project with every step solved, every
 * interview mock at or above 80% of its problems solved, the research
 * certificate once every baseline in `RESEARCH_CHALLENGES` is beaten, and
 * every certification track with all of its steps done.
 *
 * Derived from the same candidates the catalog view lists, so eligibility
 * cannot drift from what the page shows.
 */
export function getEligible(): CertificateEntry[] {
  try {
    return deriveCertificateCandidates(captureSnapshot())
      .filter((candidate) => candidate.eligible)
      .map(toEntry);
  } catch {
    return [];
  }
}

/* ───────────────────────────── track progress ───────────────────────────── */

function stepFallback(step: CertTrackStep): CertTrackStepProgress {
  return {
    step,
    done: false,
    label: step.id,
    href: "/certificates",
    progress: "not started",
  };
}

function deriveStepProgress(
  step: CertTrackStep,
  snapshot: CertificateSnapshot,
): CertTrackStepProgress {
  if (step.kind === "path") {
    const path = LEARNING_PATHS.find((entry) => entry.id === step.id);
    if (path) {
      const ids = uniqueIds(path.problemIds);
      const total = ids.length;
      const solved = countSolved(ids, snapshot.progress);
      return {
        step,
        done: total > 0 && solved >= total,
        label: path.title,
        href: `/paths/${path.slug}`,
        progress: `${solved}/${total}`,
      };
    }
  }
  if (step.kind === "collection") {
    const collection = PREMADE_COLLECTIONS.find(
      (entry) => entry.id === step.id,
    );
    if (collection) {
      const ids = uniqueIds(collection.problemIds);
      const total = ids.length;
      const solved = countSolved(ids, snapshot.progress);
      return {
        step,
        done: total > 0 && solved >= total,
        label: collection.name,
        href: `/collections/${collection.id}`,
        progress: `${solved}/${total}`,
      };
    }
  }
  if (step.kind === "lab") {
    const lab = LABS.find((entry) => entry.id === step.id);
    if (lab) {
      const record = snapshot.labs[lab.id];
      const score = record && record.best !== null ? record.best : undefined;
      return {
        step,
        done: score !== undefined && meetsTarget(lab, score),
        label: `Lab: ${lab.title}`,
        href: `/labs/${lab.id}`,
        progress:
          score === undefined
            ? "not attempted"
            : `best ${formatMeasure(lab.metric, score)} vs target ${formatMeasure(lab.metric, lab.target)}`,
      };
    }
  }
  if (step.kind === "project") {
    const project = PROJECTS.find((entry) => entry.id === step.id);
    if (project) {
      const { solved, total } = getProjectProgress(project, snapshot.progress);
      return {
        step,
        done: isProjectComplete(project, snapshot.progress),
        label: `Project: ${project.title}`,
        href: `/projects/${project.id}`,
        progress: `${solved}/${total} steps`,
      };
    }
  }
  if (step.kind === "interview") {
    const track = INTERVIEW_TRACKS.find((entry) => entry.id === step.id);
    if (track) {
      const best = snapshot.interviewBests[track.id];
      const total =
        best && best.total > 0 ? best.total : track.mockProblemIds.length;
      const solved = best ? best.solved : 0;
      return {
        step,
        done:
          best !== undefined &&
          best.total > 0 &&
          best.solved >= interviewThreshold(best.total),
        label: `Interview: ${track.title}`,
        href: `/interview/${track.id}`,
        progress: `${solved}/${total} mock`,
      };
    }
  }
  if (step.kind === "research") {
    const challenge = RESEARCH_CHALLENGES.find((entry) => entry.id === step.id);
    if (challenge) {
      const total = RESEARCH_CHALLENGES.length;
      const beaten = Math.min(snapshot.baselinesBeaten, total);
      return {
        step,
        done: total > 0 && beaten >= total,
        label: `Research: ${challenge.title}`,
        href: "/research",
        progress: `${beaten}/${total} baselines`,
      };
    }
  }
  return stepFallback(step);
}

/**
 * Pure track derivation: given a snapshot, report each step's done flag,
 * label, link, and progress sentence, plus the roll-up. Research steps count
 * as done only once every baseline is beaten, matching the research
 * certificate; interview steps need 80% of a stored mock.
 */
export function deriveTrackProgress(
  track: CertTrack,
  snapshot: CertificateSnapshot,
): CertTrackProgress {
  const steps = track.steps.map((step) => deriveStepProgress(step, snapshot));
  const done = steps.filter((entry) => entry.done).length;
  const total = steps.length;
  return { track, steps, done, total, complete: total > 0 && done === total };
}

/** Live track view: reads the stores, then delegates to `deriveTrackProgress`. */
export function getTrackProgress(track: CertTrack): CertTrackProgress {
  try {
    return deriveTrackProgress(track, captureSnapshot());
  } catch {
    return deriveTrackProgress(track, {
      progress: {},
      labs: {},
      interviewBests: {},
      baselinesBeaten: 0,
    });
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
    if (entry.kind === "research") {
      return `${entry.solved} of ${entry.total} baselines beaten`;
    }
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
 * score/target, project certificates map their stored step counts onto
 * the `stepsDone`/`stepsTotal` evidence fields, and research certificates
 * carry the baselines beaten as `solved`/`total`.
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
