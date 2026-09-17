/**
 * Leaderboard scoring over the full problem catalogue.
 *
 * Split out of `src/lib/leaderboard.ts` on purpose: the header avatar only
 * needs the username (`getUserName`), and importing scoring from
 * `leaderboard.ts` dragged the 5,550-entry PROBLEM_META index (437 KB raw)
 * into the landing page's client bundle. Route-level surfaces
 * (`Leaderboard`, the sync engine) import from here instead.
 */
import { PROBLEM_META } from "@/data/problems/problem-meta";
import { getProgress, type ProgressMap } from "@/lib/progress";
import {
  getCurrentStreak,
  getUserName,
  type LeaderboardEntry,
} from "@/lib/leaderboard";
import type { Difficulty } from "@/types/problem";

export const DIFFICULTY_WEIGHTS: Record<Difficulty, number> = {
  Easy: 1,
  Medium: 3,
  Hard: 5,
};

export function getFlameScore(progress: ProgressMap): number {
  let score = 0;
  for (const problem of PROBLEM_META) {
    if (progress[problem.id]?.solved) {
      score += DIFFICULTY_WEIGHTS[problem.difficulty];
    }
  }
  return score;
}

export function getSolvedCount(progress: ProgressMap): number {
  let solved = 0;
  for (const problem of PROBLEM_META) {
    if (progress[problem.id]?.solved) solved += 1;
  }
  return solved;
}

interface BotDefinition {
  name: string;
  fraction: number;
  streak: number;
}

const BOT_DEFINITIONS: BotDefinition[] = [
  { name: "tensor_tina", fraction: 0.72, streak: 40 },
  { name: "grad_descender", fraction: 0.61, streak: 31 },
  { name: "dropout_dan", fraction: 0.55, streak: 27 },
  { name: "backprop_bella", fraction: 0.48, streak: 22 },
  { name: "matrix_mo", fraction: 0.42, streak: 18 },
  { name: "sigmoid_sam", fraction: 0.37, streak: 14 },
  { name: "kernel_kat", fraction: 0.31, streak: 11 },
  { name: "epoch_emma", fraction: 0.26, streak: 9 },
  { name: "relu_raj", fraction: 0.19, streak: 7 },
  { name: "batch_norm_ben", fraction: 0.14, streak: 5 },
  { name: "softmax_sara", fraction: 0.09, streak: 4 },
  { name: "vanishing_vic", fraction: 0.05, streak: 2 },
];

export function getLeaderboard(): LeaderboardEntry[] {
  const progress = getProgress();
  const totalPoints = PROBLEM_META.reduce(
    (sum, problem) => sum + DIFFICULTY_WEIGHTS[problem.difficulty],
    0,
  );

  const bots: LeaderboardEntry[] = BOT_DEFINITIONS.map((bot, index) => ({
    id: `bot-${index + 1}`,
    name: bot.name,
    score: Math.round(totalPoints * bot.fraction),
    solved: Math.round(PROBLEM_META.length * bot.fraction),
    streak: bot.streak,
  }));

  const you: LeaderboardEntry = {
    id: "you",
    name: getUserName(),
    score: getFlameScore(progress),
    solved: getSolvedCount(progress),
    streak: getCurrentStreak(progress),
    isYou: true,
  };

  const entries = [...bots, you];
  entries.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.solved !== a.solved) return b.solved - a.solved;
    if (a.isYou !== b.isYou) return a.isYou ? 1 : -1;
    return a.name.localeCompare(b.name);
  });
  return entries;
}

export interface WeeklyLeaderboardEntry extends LeaderboardEntry {
  /** Difficulty-weighted points from solves inside the current local week. */
  weeklyScore: number;
  /** Number of problems solved inside the current local week. */
  weeklySolved: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Local calendar day number. Mirrors `localDayNumber` in
 * `src/lib/leaderboard.ts` (the streak code) on purpose: both the streak and
 * the weekly board must agree on which local date a solve belongs to, through
 * DST changes, month rollovers, and year rollovers.
 */
function localDayNumber(date: Date): number {
  return Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS,
  );
}

/**
 * The week runs Monday 00:00 local → Sunday 23:59:59.999 local. Returns the
 * Monday of the week containing `date` as a local day number.
 */
function weekStartDay(date: Date): number {
  const mondayOffset = (date.getDay() + 6) % 7;
  return localDayNumber(date) - mondayOffset;
}

/**
 * Stable integer id of the Monday-starting week containing `date`. Two dates
 * in the same week (including across month/year rollovers) share a key;
 * consecutive weeks differ by exactly one.
 */
export function getWeekKey(date: Date = new Date()): number {
  return Math.floor(weekStartDay(date) / 7);
}

/**
 * Weekly totals for a progress map: sums difficulty weights and counts only
 * solved problems whose `solvedAt` falls inside the local week containing
 * `now`. Entries without a usable `solvedAt` are ignored, exactly like the
 * streak code ignores them.
 */
export function getWeeklyScore(
  progress: ProgressMap,
  now: Date = new Date(),
): { score: number; solved: number } {
  const start = weekStartDay(now);
  const end = start + 6;
  let score = 0;
  let solved = 0;
  for (const problem of PROBLEM_META) {
    const entry = progress[problem.id];
    if (!entry?.solved || !entry.solvedAt) continue;
    const date = new Date(entry.solvedAt);
    if (Number.isNaN(date.getTime())) continue;
    const day = localDayNumber(date);
    if (day < start || day > end) continue;
    score += DIFFICULTY_WEIGHTS[problem.difficulty];
    solved += 1;
  }
  return { score, solved };
}

/**
 * Deterministic 32-bit integer hash of two integers, uniform in [0, 1).
 * Integer-only (Math.imul) so every JS engine produces identical values.
 */
function hashUnit(a: number, b: number): number {
  let h = Math.imul(a, 0x27d4eb2d) ^ Math.imul(b, 0x165667b1);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/**
 * Weekly bot rule.
 *
 * Bots are derived from their all-time definitions only:
 * - Their all-time solved/score totals are treated as an even spread over a
 *   year of weeks, so the per-week baseline is `solved / 52`.
 * - `jitter = 0.5 + hashUnit(weekKey, index)` ∈ [0.5, 1.5) scales that
 *   baseline; it depends only on the week key and the bot index, so the board
 *   is identical all week and rotates on Monday.
 * - `avgPoints = 1.6 + 1.4 * hashUnit(weekKey, index + 1009)` ∈ [1.6, 3.0)
 *   gives each bot a per-week difficulty mix behind its weekly score.
 *
 * `weeklySolved = round(solved / 52 * jitter)` and
 * `weeklyScore = round(weeklySolved * avgPoints)`. The weakest bot lands
 * around a handful of solves, so an active newcomer can climb past it in one
 * week, while the strongest bot still needs a serious week to beat.
 */
function getWeeklyBots(weekKey: number): WeeklyLeaderboardEntry[] {
  const totalPoints = PROBLEM_META.reduce(
    (sum, problem) => sum + DIFFICULTY_WEIGHTS[problem.difficulty],
    0,
  );

  return BOT_DEFINITIONS.map((bot, index) => {
    const solved = Math.round(PROBLEM_META.length * bot.fraction);
    const score = Math.round(totalPoints * bot.fraction);
    const jitter = 0.5 + hashUnit(weekKey, index);
    const weeklySolved = Math.round((solved / 52) * jitter);
    const avgPoints = 1.6 + 1.4 * hashUnit(weekKey, index + 1009);
    return {
      id: `bot-${index + 1}`,
      name: bot.name,
      score,
      solved,
      streak: bot.streak,
      weeklyScore: Math.round(weeklySolved * avgPoints),
      weeklySolved,
    };
  });
}

/**
 * Weekly leaderboard for the local week containing `now` (Monday 00:00 local
 * → Sunday 23:59:59.999 local). Same shape as `getLeaderboard()`, plus
 * `weeklyScore`/`weeklySolved`. Sorted by weekly points, then weekly solved;
 * on an exact tie bots rank above "you", then names sort alphabetically.
 * Repeat calls with the same `now` are identical.
 */
export function getWeeklyLeaderboard(
  now: Date = new Date(),
): WeeklyLeaderboardEntry[] {
  const progress = getProgress();
  const bots = getWeeklyBots(getWeekKey(now));

  const weekly = getWeeklyScore(progress, now);
  const you: WeeklyLeaderboardEntry = {
    id: "you",
    name: getUserName(),
    score: getFlameScore(progress),
    solved: getSolvedCount(progress),
    streak: getCurrentStreak(progress),
    isYou: true,
    weeklyScore: weekly.score,
    weeklySolved: weekly.solved,
  };

  const entries = [...bots, you];
  entries.sort((a, b) => {
    if (b.weeklyScore !== a.weeklyScore) return b.weeklyScore - a.weeklyScore;
    if (b.weeklySolved !== a.weeklySolved) {
      return b.weeklySolved - a.weeklySolved;
    }
    if (a.isYou !== b.isYou) return a.isYou ? 1 : -1;
    return a.name.localeCompare(b.name);
  });
  return entries;
}
