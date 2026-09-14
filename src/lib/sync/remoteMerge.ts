/**
 * Pure merge functions for the optional remote sync engine.
 *
 * A pull never overwrites local state wholesale: each store has rules that
 * keep the union of both devices, make solved/attempted flags sticky, and
 * resolve genuinely-edited fields by last-write-wins. All functions are
 * defensive about malformed remote payloads so a bad row can never throw.
 */

import { RESEARCH_CHALLENGES } from "@/data/research";
import type { UserCollection } from "@/lib/collections";
import type { ContestResult } from "@/lib/contestStore";
import type { DailyState } from "@/lib/daily";
import type { InterviewResult } from "@/lib/interview";
import type { LabRecord, LabRecords } from "@/lib/labs";
import type { PenPaperProgressMap } from "@/lib/penpaper";
import type { ProblemProgress, ProgressMap } from "@/lib/progress";
import type {
  ResearchAttempt,
  ResearchChallengeState,
  ResearchState,
} from "@/lib/research";
import { sanitizeReviewState, type ReviewMap } from "@/lib/reviewQueue";

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

function timestamp(value: string | null | undefined): number {
  if (!value) return Number.NaN;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? Number.NaN : parsed;
}

function laterValue(
  local?: string | null,
  remote?: string | null,
): string | undefined {
  const localAt = timestamp(local);
  const remoteAt = timestamp(remote);
  if (Number.isNaN(localAt)) return remote ?? undefined;
  if (Number.isNaN(remoteAt)) return local ?? undefined;
  return remoteAt > localAt ? (remote ?? undefined) : (local ?? undefined);
}

function earlierValue(
  local?: string | null,
  remote?: string | null,
): string | undefined {
  const localAt = timestamp(local);
  const remoteAt = timestamp(remote);
  if (Number.isNaN(localAt)) return remote ?? undefined;
  if (Number.isNaN(remoteAt)) return local ?? undefined;
  return remoteAt < localAt ? (remote ?? undefined) : (local ?? undefined);
}

function pickNewerSide<T>(
  localValue: T | undefined,
  remoteValue: T | undefined,
  localAt?: string,
  remoteAt?: string,
): T | undefined {
  if (remoteValue === undefined) return localValue;
  if (localValue === undefined) return remoteValue;
  const localTime = timestamp(localAt);
  const remoteTime = timestamp(remoteAt);
  if (Number.isNaN(remoteTime)) return localValue;
  if (Number.isNaN(localTime)) return remoteValue;
  return remoteTime > localTime ? remoteValue : localValue;
}

function asRecord<T extends object>(value: unknown): T | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as T;
}

/* ─────────────────────────────── progress ─────────────────────────────── */

/**
 * Per-problem merge: `attempted` and `solved` are sticky true, `solvedAt`
 * keeps the earliest solve, `lastOpened` is LWW, and `savedCode` follows the
 * side with the newer `lastOpened`. Keys present on either side are kept.
 */
export function mergeProgress(
  local: ProgressMap,
  remote: ProgressMap,
): ProgressMap {
  const localMap = asRecord<ProgressMap>(local) ?? {};
  const remoteMap = asRecord<ProgressMap>(remote) ?? {};
  const merged: ProgressMap = {};
  const ids = new Set([...Object.keys(localMap), ...Object.keys(remoteMap)]);
  for (const id of ids) {
    const left: ProblemProgress = localMap[id] ?? {};
    const right: ProblemProgress = remoteMap[id] ?? {};
    const entry: ProblemProgress = {};
    const solved = Boolean(left.solved || right.solved);
    const attempted = Boolean(left.attempted || right.attempted);
    const lastOpened = laterValue(left.lastOpened, right.lastOpened);
    const solvedAt = solved ? earlierValue(left.solvedAt, right.solvedAt) : undefined;
    const savedCode = pickNewerSide(
      left.savedCode,
      right.savedCode,
      left.lastOpened,
      right.lastOpened,
    );
    if (lastOpened !== undefined) entry.lastOpened = lastOpened;
    if (attempted) entry.attempted = true;
    if (solved) entry.solved = true;
    if (solvedAt !== undefined) entry.solvedAt = solvedAt;
    if (savedCode !== undefined) entry.savedCode = savedCode;
    if (Object.keys(entry).length > 0) merged[id] = entry;
  }
  return merged;
}

/* ──────────────────────────────── daily ───────────────────────────────── */

/** Current streak for a sorted, unique list of "YYYY-MM-DD" keys. */
export function streakFromDates(dates: string[]): number {
  const unique = [...new Set(dates.filter((date) => DATE_KEY.test(date)))].sort();
  if (unique.length === 0) return 0;
  let streak = 1;
  for (let i = unique.length - 1; i > 0; i -= 1) {
    const current = Date.parse(`${unique[i]}T00:00:00Z`);
    const previous = Date.parse(`${unique[i - 1]}T00:00:00Z`);
    if (current - previous !== 86_400_000) break;
    streak += 1;
  }
  return streak;
}

/**
 * Union of solved dates, sorted; `streak` is recomputed from the dates and
 * `lastSolvedDate` becomes the latest date.
 */
export function mergeDaily(local: DailyState, remote: DailyState): DailyState {
  const left = asRecord<DailyState>(local);
  const right = asRecord<DailyState>(remote);
  const dates = new Set<string>();
  const localDates = Array.isArray(left?.solvedDates) ? left.solvedDates : [];
  const remoteDates = Array.isArray(right?.solvedDates) ? right.solvedDates : [];
  for (const value of [...localDates, ...remoteDates]) {
    if (typeof value === "string" && DATE_KEY.test(value)) dates.add(value);
  }
  const solvedDates = [...dates].sort();
  return {
    lastSolvedDate: solvedDates.length > 0 ? solvedDates[solvedDates.length - 1] : null,
    streak: streakFromDates(solvedDates),
    solvedDates,
  };
}

/* ───────────────────────────── collections ────────────────────────────── */

function isCollection(value: unknown): value is UserCollection {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.name === "string" &&
    typeof record.description === "string" &&
    Array.isArray(record.problemIds) &&
    typeof record.createdAt === "string"
  );
}

/**
 * Local order is preserved; remote-only collections are appended. When the
 * same id exists on both sides, the newer `updatedAt` (falling back to
 * `createdAt`) wins and ties keep the local copy.
 */
export function mergeCollections(
  local: UserCollection[],
  remote: UserCollection[],
): UserCollection[] {
  const order: string[] = [];
  const byId = new Map<string, UserCollection>();
  const localList = Array.isArray(local) ? local : [];
  const remoteList = Array.isArray(remote) ? remote : [];
  for (const collection of localList) {
    if (!isCollection(collection) || byId.has(collection.id)) continue;
    byId.set(collection.id, collection);
    order.push(collection.id);
  }
  for (const collection of remoteList) {
    if (!isCollection(collection)) continue;
    const existing = byId.get(collection.id);
    if (!existing) {
      byId.set(collection.id, collection);
      order.push(collection.id);
      continue;
    }
    const existingAt = timestamp(existing.updatedAt ?? existing.createdAt);
    const incomingAt = timestamp(collection.updatedAt ?? collection.createdAt);
    if (
      Number.isFinite(incomingAt) &&
      (!Number.isFinite(existingAt) || incomingAt > existingAt)
    ) {
      byId.set(collection.id, collection);
    }
  }
  return order.map((id) => byId.get(id) as UserCollection);
}

/* ───────────────────────────────── labs ───────────────────────────────── */

function maxBest(
  local: number | null | undefined,
  remote: number | null | undefined,
): number | null {
  const values = [local, remote].filter(
    (value): value is number => typeof value === "number" && Number.isFinite(value),
  );
  return values.length > 0 ? Math.max(...values) : null;
}

/** max(best), max(attempts), `passed` OR. Keys on either side are kept. */
export function mergeLabs(local: LabRecords, remote: LabRecords): LabRecords {
  const localMap = asRecord<LabRecords>(local) ?? {};
  const remoteMap = asRecord<LabRecords>(remote) ?? {};
  const merged: LabRecords = {};
  const ids = new Set([...Object.keys(localMap), ...Object.keys(remoteMap)]);
  for (const id of ids) {
    const left: Partial<LabRecord> = localMap[id] ?? {};
    const right: Partial<LabRecord> = remoteMap[id] ?? {};
    merged[id] = {
      best: maxBest(left.best, right.best),
      attempts: Math.max(Number(left.attempts) || 0, Number(right.attempts) || 0),
      passed: Boolean(left.passed || right.passed),
    };
  }
  return merged;
}

/* ─────────────────────────────── research ─────────────────────────────── */

function researchHigherIsBetter(challengeId: string): boolean {
  const challenge = RESEARCH_CHALLENGES.find((item) => item.id === challengeId);
  return challenge ? challenge.higherIsBetter : true;
}

function isAttempt(value: unknown): value is ResearchAttempt {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return typeof record.score === "number" && typeof record.at === "string";
}

function mergeAttempts(local: unknown, remote: unknown): ResearchAttempt[] {
  const all: ResearchAttempt[] = [];
  const seen = new Set<string>();
  for (const value of [
    ...(Array.isArray(local) ? local : []),
    ...(Array.isArray(remote) ? remote : []),
  ]) {
    if (!isAttempt(value)) continue;
    const key = `${value.at}|${value.score}`;
    if (seen.has(key)) continue;
    seen.add(key);
    all.push(value);
  }
  all.sort((a, b) => timestamp(a.at) - timestamp(b.at));
  return all.slice(-50);
}

function betterScore(
  localBest: number | null,
  remoteBest: number | null,
  higherIsBetter: boolean,
): number | null {
  if (localBest === null || !Number.isFinite(localBest)) {
    return remoteBest !== null && Number.isFinite(remoteBest) ? remoteBest : null;
  }
  if (remoteBest === null || !Number.isFinite(remoteBest)) return localBest;
  if (localBest === remoteBest) return localBest;
  return higherIsBetter
    ? Math.max(localBest, remoteBest)
    : Math.min(localBest, remoteBest);
}

function normalizeChallengeState(value: unknown): ResearchChallengeState {
  const record = asRecord<Record<string, unknown>>(value);
  if (!record) {
    return { bestScore: null, bestAt: null, beatenBaseline: false, attempts: [] };
  }
  return {
    bestScore:
      typeof record.bestScore === "number" && Number.isFinite(record.bestScore)
        ? record.bestScore
        : null,
    bestAt: typeof record.bestAt === "string" ? record.bestAt : null,
    beatenBaseline: Boolean(record.beatenBaseline),
    attempts: Array.isArray(record.attempts)
      ? record.attempts.filter(isAttempt)
      : [],
  };
}

/**
 * Best score per challenge (direction-aware), `beatenBaseline` OR, and the
 * union of attempts (deduped, chronological, capped at the last 50).
 */
export function mergeResearch(
  local: ResearchState,
  remote: ResearchState,
): ResearchState {
  const localMap = asRecord<ResearchState>(local) ?? {};
  const remoteMap = asRecord<ResearchState>(remote) ?? {};
  const merged: ResearchState = {};
  const ids = new Set([...Object.keys(localMap), ...Object.keys(remoteMap)]);
  for (const id of ids) {
    const left = normalizeChallengeState(localMap[id]);
    const right = normalizeChallengeState(remoteMap[id]);
    const higherIsBetter = researchHigherIsBetter(id);
    const bestScore = betterScore(left.bestScore, right.bestScore, higherIsBetter);
    const bestCandidates: (string | null)[] = [];
    if (left.bestScore === bestScore) bestCandidates.push(left.bestAt);
    if (right.bestScore === bestScore) bestCandidates.push(right.bestAt);
    merged[id] = {
      bestScore,
      bestAt: bestCandidates.find((value) => Boolean(value)) ?? null,
      beatenBaseline: left.beatenBaseline || right.beatenBaseline,
      attempts: mergeAttempts(left.attempts, right.attempts),
    };
  }
  return merged;
}

/* ─────────────────────────────── penpaper ─────────────────────────────── */

/** `attempted` / `correct` sticky true, `lastAt` LWW; keys are unioned. */
export function mergePenPaper(
  local: PenPaperProgressMap,
  remote: PenPaperProgressMap,
): PenPaperProgressMap {
  const localMap = asRecord<PenPaperProgressMap>(local) ?? {};
  const remoteMap = asRecord<PenPaperProgressMap>(remote) ?? {};
  const merged: PenPaperProgressMap = {};
  const ids = new Set([...Object.keys(localMap), ...Object.keys(remoteMap)]);
  for (const id of ids) {
    const left = localMap[id] ?? {};
    const right = remoteMap[id] ?? {};
    merged[id] = {
      attempted: Boolean(left.attempted || right.attempted),
      correct: Boolean(left.correct || right.correct),
      lastAt: laterValue(left.lastAt, right.lastAt) ?? "",
    };
  }
  return merged;
}

/* ─────────────────────────────── reviews ──────────────────────────────── */

function reviewRecencyAt(state: { due: string; lastReviewedAt: string | null }): number {
  const at = state.lastReviewedAt
    ? timestamp(state.lastReviewedAt)
    : timestamp(`${state.due}T00:00:00Z`);
  return Number.isNaN(at) ? 0 : at;
}

/**
 * Per-problem merge: the entry with the newer `lastReviewedAt` (falling back
 * to `due`) wins; ties keep local. Invalid payloads are dropped.
 */
export function mergeReviews(local: ReviewMap, remote: ReviewMap): ReviewMap {
  const localMap = asRecord<ReviewMap>(local) ?? {};
  const remoteMap = asRecord<ReviewMap>(remote) ?? {};
  const merged: ReviewMap = {};
  const ids = new Set([...Object.keys(localMap), ...Object.keys(remoteMap)]);
  for (const id of ids) {
    const left = sanitizeReviewState(localMap[id]);
    const right = sanitizeReviewState(remoteMap[id]);
    if (!left) {
      if (right) merged[id] = right;
      continue;
    }
    if (!right) {
      merged[id] = left;
      continue;
    }
    merged[id] = reviewRecencyAt(right) > reviewRecencyAt(left) ? right : left;
  }
  return merged;
}

/* ────────────────────────── contests / interview ──────────────────────── */

function mergeResultList<T extends { completedAt: string }>(
  local: T[],
  remote: T[],
  keyOf: (item: T) => string,
  isItem: (value: unknown) => value is T,
): T[] {
  const seen = new Set<string>();
  const merged: T[] = [];
  for (const value of [
    ...(Array.isArray(local) ? local : []),
    ...(Array.isArray(remote) ? remote : []),
  ]) {
    if (!isItem(value)) continue;
    const key = keyOf(value);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(value);
  }
  merged.sort((a, b) => {
    const left = timestamp(a.completedAt);
    const right = timestamp(b.completedAt);
    if (Number.isNaN(left)) return Number.isNaN(right) ? 0 : -1;
    if (Number.isNaN(right)) return 1;
    return left - right;
  });
  return merged;
}

function isContestResult(value: unknown): value is ContestResult {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.contestId === "string" && typeof record.completedAt === "string"
  );
}

function isInterviewResult(value: unknown): value is InterviewResult {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.trackId === "string" && typeof record.completedAt === "string"
  );
}

/** Append-merge by `contestId` + `completedAt`, deduped and chronological. */
export function mergeContests(
  local: ContestResult[],
  remote: ContestResult[],
): ContestResult[] {
  return mergeResultList(
    local,
    remote,
    (item) => `${item.contestId}::${item.completedAt}`,
    isContestResult,
  );
}

/** Append-merge by `trackId` + `completedAt`, deduped and chronological. */
export function mergeInterview(
  local: InterviewResult[],
  remote: InterviewResult[],
): InterviewResult[] {
  return mergeResultList(
    local,
    remote,
    (item) => `${item.trackId}::${item.completedAt}`,
    isInterviewResult,
  );
}

/* ─────────────────────────────── username ─────────────────────────────── */

/** Remote wins only when there is no local username. */
export function mergeUsername(local: string, remote: unknown): string {
  const localName = typeof local === "string" ? local.trim() : "";
  const remoteName = typeof remote === "string" ? remote.trim() : "";
  return localName || remoteName;
}
