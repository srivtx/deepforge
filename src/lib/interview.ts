/**
 * localStorage-backed interview session results.
 *
 * One result records a single timed interview attempt for a track. The
 * score is computed by the UI as solved * 10 - seconds / 60, floored at 0.
 *
 * Persistence routes through the local-first sync seam (`createStore`);
 * key, event, and parse semantics are unchanged.
 */

import { createStore } from "@/lib/sync/store";
import type { StoreSpec } from "@/lib/sync/types";

const STORAGE_KEY = "deepforge:interview:v1";

export const INTERVIEW_CHANGE_EVENT = "deepforge:interview-change";

export interface InterviewResult {
  trackId: string;
  solved: number;
  total: number;
  seconds: number;
  completedAt: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Finite numbers only, clamped non-negative and rounded like the save path. */
function nonNegativeInt(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.round(value))
    : 0;
}

/**
 * Validate one persisted result. A result without a track or completion
 * timestamp cannot be rendered or ranked, so it is dropped; numeric fields
 * that are missing or not finite fall back to 0.
 */
function sanitizeInterviewResult(value: unknown): InterviewResult | null {
  if (!isRecord(value)) return null;
  if (typeof value.trackId !== "string" || value.trackId.length === 0) {
    return null;
  }
  if (typeof value.completedAt !== "string" || value.completedAt.length === 0) {
    return null;
  }
  return {
    trackId: value.trackId,
    solved: nonNegativeInt(value.solved),
    total: nonNegativeInt(value.total),
    seconds: nonNegativeInt(value.seconds),
    completedAt: value.completedAt,
  };
}

function parseInterviewResults(raw: string | null): InterviewResult[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const out: InterviewResult[] = [];
    for (const value of parsed) {
      const result = sanitizeInterviewResult(value);
      if (result) out.push(result);
    }
    return out;
  } catch {
    return [];
  }
}

const interviewStore = createStore<InterviewResult[]>({
  id: "interview",
  storageKey: STORAGE_KEY,
  event: INTERVIEW_CHANGE_EVENT,
  empty: () => [],
  parse: parseInterviewResults,
  serialize: (v) => JSON.stringify(v),
});

export function getInterviewResults(): InterviewResult[] {
  return interviewStore.get();
}

/**
 * Persist one completed session. Returns the stored result with its
 * completion timestamp.
 */
export function saveInterviewResult(
  result: Omit<InterviewResult, "completedAt">,
): InterviewResult {
  const stored: InterviewResult = {
    trackId: result.trackId,
    solved: Math.max(0, Math.round(result.solved)),
    total: Math.max(0, Math.round(result.total)),
    seconds: Math.max(0, Math.round(result.seconds)),
    completedAt: new Date().toISOString(),
  };
  const all = interviewStore.get();
  all.push(stored);
  interviewStore.set(all);
  return stored;
}

/**
 * Best attempt for a track: most solved, then fastest, then most recent.
 */
export function getBestInterviewResult(trackId: string): InterviewResult | null {
  const results = interviewStore.get().filter((r) => r.trackId === trackId);
  if (results.length === 0) return null;
  return results.reduce((best, r) => {
    if (r.solved > best.solved) return r;
    if (r.solved === best.solved && r.seconds < best.seconds) return r;
    if (
      r.solved === best.solved &&
      r.seconds === best.seconds &&
      r.completedAt > best.completedAt
    ) {
      return r;
    }
    return best;
  });
}

export function clearInterviewResults(): void {
  interviewStore.clear();
}

export const INTERVIEW_SPEC: StoreSpec<InterviewResult[]> = {
  id: "interview",
  storageKey: STORAGE_KEY,
  event: INTERVIEW_CHANGE_EVENT,
  empty: () => [],
  parse: parseInterviewResults,
  serialize: (v) => JSON.stringify(v),
};
