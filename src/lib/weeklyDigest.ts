/**
 * Weekly digest — a deterministic recap of the trailing 7 local days.
 *
 * Pure read over the existing localStorage stores: progress (`solvedAt`),
 * reviews (`lastReviewedAt`), bug hunts (rounds / `clean`), speedruns
 * (finished runs), labs (`recentPasses`), and the daily challenge
 * (`solvedDates`). Nothing here writes, and nothing here throws: a junk
 * payload degrades to a zeroed digest.
 *
 * Determinism: `getWeeklyDigest(now?)` derives everything from the injected
 * clock plus the current store state, and returns plain numbers and date
 * keys (no locale-dependent formatting — the card does that). Day boundaries
 * use the same local calendar-day formula as the streak code, mirroring
 * `localDayNumber` in `src/lib/leaderboard.ts` (see also the note on the
 * copy in `src/lib/leaderboardScores.ts`), so the window agrees with streaks
 * and the weekly leaderboard through DST, month, and year rollovers.
 *
 * Points use the leaderboard's difficulty weights (Easy 1, Medium 3,
 * Hard 5) over problems solved inside the window.
 */

import { PROBLEM_META } from "@/data/problems/problem-meta";
import { getBugRounds } from "@/lib/bugHunt";
import { getDailyDateKey, getDailyState } from "@/lib/daily";
import { getLabRecords } from "@/lib/labs";
import { DIFFICULTY_WEIGHTS } from "@/lib/leaderboardScores";
import { getProgress } from "@/lib/progress";
import { getReviewMap } from "@/lib/reviewQueue";
import { getRunHistory } from "@/lib/runs";

/** Length of the digest window, in local calendar days (today included). */
export const WEEKLY_DIGEST_DAYS = 7;

const DAY_MS = 24 * 60 * 60 * 1000;

export interface WeeklyDigestBestDay {
  /** Local calendar date, "YYYY-MM-DD". */
  date: string;
  solved: number;
}

export interface WeeklyDigestDelta {
  solved: number;
  points: number;
  reviewsCompleted: number;
}

export interface WeeklyDigest {
  /** Oldest day in the window, "YYYY-MM-DD". */
  windowStart: string;
  /** Today, "YYYY-MM-DD" — the last day in the window. */
  windowEnd: string;
  solved: number;
  /** Difficulty-weighted like the leaderboard (Easy 1, Medium 3, Hard 5). */
  points: number;
  reviewsCompleted: number;
  cleanBugHunts: number;
  bugHunts: number;
  /** Finished runs (abandoned excluded) landing on their start day. */
  speedrunsFinished: number;
  /** Passing lab runs recorded inside the window (`recentPasses`). */
  labsPassed: number;
  dailyChainDays: number;
  activeDays: number;
  /**
   * Day with the most solves in the window; ties keep the earliest day.
   * Null when nothing was solved.
   */
  bestDay: WeeklyDigestBestDay | null;
  /** Current window minus the 7 days immediately before it. */
  deltaVsPreviousWeek: WeeklyDigestDelta;
}

/* ─────────────────────────────── date math ─────────────────────────────── */

/**
 * Local calendar day number. This is a deliberate copy of the streak code's
 * formula in `src/lib/leaderboard.ts` (`localDayNumber`): both the streak and
 * this digest must agree on which local date a timestamp belongs to.
 */
function localDayNumber(date: Date): number {
  return Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS,
  );
}

/** Shift a local date by whole calendar days (wall-time safe, DST-proof). */
function shiftLocalDays(date: Date, days: number): Date {
  const shifted = new Date(date);
  shifted.setDate(shifted.getDate() + days);
  return shifted;
}

/** Review-health-style clock guard: an invalid Date falls back to now. */
function withSafeNow(now: Date): Date {
  return Number.isNaN(now.getTime()) ? new Date() : now;
}

/** Local day number of an ISO timestamp, or null when unusable. */
function dayOfIso(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return localDayNumber(date);
}

/** Local day number of a "YYYY-MM-DD" key, or null when unusable. */
function dayOfDateKey(value: unknown): number | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return null;
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return localDayNumber(date);
}

/* ──────────────────────────────── digest ───────────────────────────────── */

/** Zeroed digest with the real window bounds for `now`. */
export function emptyWeeklyDigest(now: Date = new Date()): WeeklyDigest {
  const base = withSafeNow(now);
  return {
    windowStart: getDailyDateKey(
      shiftLocalDays(base, -(WEEKLY_DIGEST_DAYS - 1)),
    ),
    windowEnd: getDailyDateKey(base),
    solved: 0,
    points: 0,
    reviewsCompleted: 0,
    cleanBugHunts: 0,
    bugHunts: 0,
    speedrunsFinished: 0,
    labsPassed: 0,
    dailyChainDays: 0,
    activeDays: 0,
    bestDay: null,
    deltaVsPreviousWeek: { solved: 0, points: 0, reviewsCompleted: 0 },
  };
}

/**
 * True when nothing happened in the current window (a brand-new learner), so
 * the card can hide itself. Prior-week-only activity still counts as empty:
 * the digest recaps this week, not the gap.
 */
export function isWeeklyDigestEmpty(digest: WeeklyDigest): boolean {
  return (
    digest.solved === 0 &&
    digest.points === 0 &&
    digest.reviewsCompleted === 0 &&
    digest.cleanBugHunts === 0 &&
    digest.bugHunts === 0 &&
    digest.speedrunsFinished === 0 &&
    digest.labsPassed === 0 &&
    digest.dailyChainDays === 0 &&
    digest.activeDays === 0 &&
    digest.bestDay === null
  );
}

function buildWeeklyDigest(now: Date): WeeklyDigest {
  const endDay = localDayNumber(now);
  const startDay = endDay - (WEEKLY_DIGEST_DAYS - 1);
  const previousEndDay = startDay - 1;
  const previousStartDay = previousEndDay - (WEEKLY_DIGEST_DAYS - 1);

  const keyByDay = new Map<number, string>();
  for (let day = startDay; day <= endDay; day += 1) {
    keyByDay.set(
      day,
      getDailyDateKey(shiftLocalDays(now, day - endDay)),
    );
  }

  const inCurrent = (day: number): boolean =>
    day >= startDay && day <= endDay;
  const inPrevious = (day: number): boolean =>
    day >= previousStartDay && day <= previousEndDay;

  const activeDays = new Set<number>();
  const solvedByDay = new Map<number, number>();
  let solved = 0;
  let points = 0;
  let previousSolved = 0;
  let previousPoints = 0;

  const progress = getProgress();
  for (const problem of PROBLEM_META) {
    const record = progress[problem.id];
    if (!record?.solved) continue;
    const day = dayOfIso(record.solvedAt);
    if (day === null) continue;
    const weight = DIFFICULTY_WEIGHTS[problem.difficulty] ?? 0;
    if (inCurrent(day)) {
      solved += 1;
      points += weight;
      solvedByDay.set(day, (solvedByDay.get(day) ?? 0) + 1);
      activeDays.add(day);
    } else if (inPrevious(day)) {
      previousSolved += 1;
      previousPoints += weight;
    }
  }

  let reviewsCompleted = 0;
  let previousReviews = 0;
  const reviews = getReviewMap(now);
  for (const state of Object.values(reviews)) {
    if (!state || typeof state !== "object") continue;
    const day = dayOfIso(state.lastReviewedAt);
    if (day === null) continue;
    if (inCurrent(day)) {
      reviewsCompleted += 1;
      activeDays.add(day);
    } else if (inPrevious(day)) {
      previousReviews += 1;
    }
  }

  let bugHunts = 0;
  let cleanBugHunts = 0;
  for (const round of getBugRounds()) {
    if (!round || typeof round !== "object") continue;
    const day = dayOfIso(round.at);
    if (day === null || !inCurrent(day)) continue;
    bugHunts += 1;
    if (round.clean === true) cleanBugHunts += 1;
    activeDays.add(day);
  }

  let speedrunsFinished = 0;
  for (const run of getRunHistory()) {
    if (!run || run.status !== "finished") continue;
    const startedAt = run.startedAt;
    if (
      typeof startedAt !== "number" ||
      !Number.isFinite(startedAt) ||
      startedAt <= 0
    ) {
      continue;
    }
    const day = localDayNumber(new Date(startedAt));
    if (!inCurrent(day)) continue;
    speedrunsFinished += 1;
    activeDays.add(day);
  }

  let labsPassed = 0;
  for (const record of Object.values(getLabRecords())) {
    if (!record || typeof record !== "object") continue;
    if (!Array.isArray(record.recentPasses)) continue;
    for (const at of record.recentPasses) {
      const day = dayOfIso(at);
      if (day === null || !inCurrent(day)) continue;
      labsPassed += 1;
      activeDays.add(day);
    }
  }

  const dailySolvedDays = new Set<number>();
  const daily = getDailyState();
  if (daily && Array.isArray(daily.solvedDates)) {
    for (const key of daily.solvedDates) {
      const day = dayOfDateKey(key);
      if (day === null || !inCurrent(day)) continue;
      dailySolvedDays.add(day);
      activeDays.add(day);
    }
  }

  let bestDay: WeeklyDigestBestDay | null = null;
  for (let day = startDay; day <= endDay; day += 1) {
    const count = solvedByDay.get(day) ?? 0;
    if (count === 0) continue;
    const date = keyByDay.get(day);
    if (!date) continue;
    if (bestDay === null || count > bestDay.solved) {
      bestDay = { date, solved: count };
    }
  }

  return {
    windowStart:
      keyByDay.get(startDay) ??
      getDailyDateKey(shiftLocalDays(now, -(WEEKLY_DIGEST_DAYS - 1))),
    windowEnd: keyByDay.get(endDay) ?? getDailyDateKey(now),
    solved,
    points,
    reviewsCompleted,
    cleanBugHunts,
    bugHunts,
    speedrunsFinished,
    labsPassed,
    dailyChainDays: dailySolvedDays.size,
    activeDays: activeDays.size,
    bestDay,
    deltaVsPreviousWeek: {
      solved: solved - previousSolved,
      points: points - previousPoints,
      reviewsCompleted: reviewsCompleted - previousReviews,
    },
  };
}

/**
 * The trailing 7 local days, today included. Junk payloads anywhere in the
 * stores yield a zeroed digest (with the real window bounds) instead of
 * throwing. Same store state + same `now` → identical result.
 */
export function getWeeklyDigest(now: Date = new Date()): WeeklyDigest {
  const base = withSafeNow(now);
  try {
    return buildWeeklyDigest(base);
  } catch {
    return emptyWeeklyDigest(base);
  }
}
