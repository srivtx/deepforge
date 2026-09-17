/**
 * Progress profile for DeepForge: badges, XP/levels, daily quests, and a
 * 52-week activity heatmap — all derived from the existing localStorage
 * stores. No accounts, no server.
 *
 * Reads are cheap and guarded for non-browser runtimes. The only writes are:
 *   - first-seen badge dates in `deepforge:badge-dates:v1`
 *   - a computed XP cache in `deepforge:xp:v1`
 *   - date-keyed quest completions in `deepforge:quests:v1`
 *
 * XP is deterministic and idempotent: it is recomputed from current progress
 * on every call, never accumulated by side effects. `awardForSolve` is the
 * canonical per-solve value (base + first-solve bonus) both the tally and
 * any UI can share.
 */

import { CATEGORIES } from "@/data/problems/meta";
import { LEARNING_PATHS } from "@/data/problems/paths";
import {
  PROBLEM_META,
  type ProblemMeta,
} from "@/data/problems/problem-meta";
import { LABS } from "@/data/labs";
import { getProgress, type ProgressMap } from "@/lib/progress";
import { getDailyDateKey, getDailyState, type DailyState } from "@/lib/daily";
import { getBugRounds, type BugRound } from "@/lib/bugHunt";
import { getLabRecords, type LabRecords } from "@/lib/labs";
import { getResearchState, type ResearchState } from "@/lib/research";
import { getRunHistory, type RunState } from "@/lib/runs";
import { getContestResults, type ContestResult } from "@/lib/contestStore";
import { getCurrentStreak, getLongestStreak } from "@/lib/leaderboard";
import type { Category, Difficulty, Problem } from "@/types/problem";

/* ────────────────────────────── storage keys ────────────────────────────── */

const BADGE_DATES_KEY = "deepforge:badge-dates:v1";
const XP_CACHE_KEY = "deepforge:xp:v1";
const QUEST_STORE_KEY = "deepforge:quests:v1";
const QUEST_HISTORY_DAYS = 60;

/* ─────────────────────────────── XP constants ───────────────────────────── */

export const XP_BASE: Record<Difficulty, number> = {
  Easy: 10,
  Medium: 25,
  Hard: 50,
};

/** Awarded only the first time a problem is solved (solved flag is sticky). */
export const FIRST_SOLVE_BONUS: Record<Difficulty, number> = {
  Easy: 5,
  Medium: 10,
  Hard: 20,
};

export const LAB_PASS_XP = 100;
export const RESEARCH_ATTEMPT_XP = 5;
export const RESEARCH_BASELINE_XP = 50;

/** XP granted for one solved problem, including the first-solve bonus. */
export function awardForSolve(problem: Problem): number {
  return awardForDifficulty(problem.difficulty);
}

/** Same award for the light index entries the profile calculations walk. */
function awardForDifficulty(difficulty: Difficulty): number {
  return XP_BASE[difficulty] + FIRST_SOLVE_BONUS[difficulty];
}

/* ──────────────────────────────── types ─────────────────────────────────── */

export interface BadgeSnapshot {
  progress: ProgressMap;
  daily: DailyState;
  labs: LabRecords;
  research: ResearchState;
  contests: ContestResult[];
  /** Bug-hunt history (newest or oldest first; derived sorts it). */
  bugHunts: BugRound[];
  /** Speedrun history, newest first as `getRunHistory` returns it. */
  runs: RunState[];
  now: Date;
}

export type BadgeTier = "bronze" | "silver" | "gold";

export interface Badge {
  id: string;
  name: string;
  description: string;
  tier: BadgeTier;
  /** Pure predicate over a snapshot. */
  rule: (snapshot: BadgeSnapshot) => boolean;
  /** [current, target] for the progress bar; target 0 means "not numeric". */
  progress: (snapshot: BadgeSnapshot) => [number, number];
}

export interface EarnedBadge {
  id: string;
  earnedAt: string | null;
}

export interface Quest {
  id: string;
  label: string;
  detail: string;
  progress: number;
  target: number;
  done: boolean;
}

export type HeatmapLevel = 0 | 1 | 2 | 3 | 4;

export interface HeatmapDay {
  date: string;
  count: number;
  level: HeatmapLevel;
}

export interface XpInfo {
  xp: number;
  level: number;
  title: string;
  nextLevelXp: number;
  /** 0..1 progress inside the current level. */
  progress: number;
}

export interface Totals {
  solved: number;
  xp: number;
  level: number;
  badges: number;
  streak: number;
  longestStreak: number;
}

/* ──────────────────────────── small utilities ───────────────────────────── */

/** FNV-1a (32-bit). Kept local so badges.ts has no dependency on daily.ts internals. */
function fnv1a(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — silently ignore */
  }
}

function parseIso(value: string): Date | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dayKeyDiff(a: string, b: string): number {
  const left = Date.parse(`${a}T00:00:00`);
  const right = Date.parse(`${b}T00:00:00`);
  if (Number.isNaN(left) || Number.isNaN(right)) return Number.NaN;
  return Math.round((right - left) / 86_400_000);
}

function dailyDateToIso(key: string): string | null {
  const date = new Date(`${key}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/* ─────────────────────────────── snapshot ───────────────────────────────── */

export function getBadgeSnapshot(): BadgeSnapshot {
  return {
    progress: getProgress(),
    daily: getDailyState(),
    labs: getLabRecords(),
    research: getResearchState(),
    contests: getContestResults(),
    bugHunts: getBugRounds(),
    runs: getRunHistory(),
    now: new Date(),
  };
}

/* ─────────────────────────────── derived ────────────────────────────────── */

interface SolveEntry {
  problem: ProblemMeta;
  at: Date;
}

interface BugHuntEntry {
  at: Date;
  clean: boolean;
}

/** A finished speedrun, dated by its start (the only real timestamp). */
interface FinishedRunEntry {
  at: Date;
}

interface Derived {
  solved: ProblemMeta[];
  entries: SolveEntry[];
  /** Valid bug-hunt rounds, oldest first. */
  bugHunts: BugHuntEntry[];
  /** The `clean === true` subset of `bugHunts`, oldest first. */
  cleanBugHunts: BugHuntEntry[];
  /** Finished speedruns (abandoned ones excluded), oldest first. */
  finishedRuns: FinishedRunEntry[];
  byDifficulty: Record<Difficulty, number>;
  solvedByCategory: Map<Category, number>;
  longestStreak: number;
  currentStreak: number;
  maxGapDays: number;
  nightOwl: SolveEntry | null;
  earlyBird: SolveEntry | null;
  solvedSaturday: boolean;
  solvedSunday: boolean;
  labsPassed: number;
  beatenBaselines: number;
  bestCategory: { solved: number; target: number; ratio: number };
  bestPath: { solved: number; total: number; ratio: number };
}

const DERIVED_CACHE = new WeakMap<BadgeSnapshot, Derived>();

const CATEGORY_TOTALS: ReadonlyMap<Category, number> = (() => {
  const totals = new Map<Category, number>();
  for (const problem of PROBLEM_META) {
    totals.set(problem.category, (totals.get(problem.category) ?? 0) + 1);
  }
  return totals;
})();

/**
 * Sanitize a snapshot's bug-hunt history. Entries that are not objects or
 * lack a parseable `at` are treated as absent; `clean` counts only when it
 * is exactly `true`. Sorted oldest first.
 */
function sanitizeBugHunts(value: unknown): BugHuntEntry[] {
  if (!Array.isArray(value)) return [];
  const entries: BugHuntEntry[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;
    const record = raw as Record<string, unknown>;
    if (typeof record.at !== "string") continue;
    const at = parseIso(record.at);
    if (!at) continue;
    entries.push({ at, clean: record.clean === true });
  }
  entries.sort((a, b) => a.at.getTime() - b.at.getTime());
  return entries;
}

/**
 * Sanitize a snapshot's run history: only finished runs with a real start
 * time count. Everything else is treated as absent. Sorted oldest first.
 */
function sanitizeFinishedRuns(value: unknown): FinishedRunEntry[] {
  if (!Array.isArray(value)) return [];
  const entries: FinishedRunEntry[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;
    const record = raw as Record<string, unknown>;
    if (record.status !== "finished") continue;
    const startedAt = record.startedAt;
    if (
      typeof startedAt !== "number" ||
      !Number.isFinite(startedAt) ||
      startedAt <= 0
    ) {
      continue;
    }
    entries.push({ at: new Date(startedAt) });
  }
  entries.sort((a, b) => a.at.getTime() - b.at.getTime());
  return entries;
}

function derive(snapshot: BadgeSnapshot): Derived {
  const cached = DERIVED_CACHE.get(snapshot);
  if (cached) return cached;

  const solved: ProblemMeta[] = [];
  const entries: SolveEntry[] = [];
  const byDifficulty: Record<Difficulty, number> = { Easy: 0, Medium: 0, Hard: 0 };
  const solvedByCategory = new Map<Category, number>();
  let nightOwl: SolveEntry | null = null;
  let earlyBird: SolveEntry | null = null;
  let solvedSaturday = false;
  let solvedSunday = false;

  for (const problem of PROBLEM_META) {
    const record = snapshot.progress[problem.id];
    if (!record?.solved) continue;
    solved.push(problem);
    byDifficulty[problem.difficulty] += 1;
    solvedByCategory.set(
      problem.category,
      (solvedByCategory.get(problem.category) ?? 0) + 1,
    );
    if (!record.solvedAt) continue;
    const at = parseIso(record.solvedAt);
    if (!at) continue;
    entries.push({ problem, at });
    const hour = at.getHours();
    if (!nightOwl && hour >= 0 && hour < 4) nightOwl = { problem, at };
    if (!earlyBird && hour >= 5 && hour < 7) earlyBird = { problem, at };
    const weekday = at.getDay();
    if (weekday === 6) solvedSaturday = true;
    if (weekday === 0) solvedSunday = true;
  }
  entries.sort((a, b) => a.at.getTime() - b.at.getTime());

  // Longest gap (in days) between consecutive solve days. A gap only counts
  // when a later solve exists, so it doubles as phoenix progress.
  const dayKeys = [...new Set(entries.map((e) => getDailyDateKey(e.at)))].sort();
  let maxGapDays = 0;
  for (let i = 1; i < dayKeys.length; i += 1) {
    const diff = dayKeyDiff(dayKeys[i - 1], dayKeys[i]);
    if (Number.isFinite(diff) && diff > maxGapDays) maxGapDays = diff;
  }

  let bestCategory = { solved: 0, target: 0, ratio: -1 };
  for (const meta of CATEGORIES) {
    const total = CATEGORY_TOTALS.get(meta.name) ?? 0;
    if (total === 0) continue;
    const count = solvedByCategory.get(meta.name) ?? 0;
    const target = Math.ceil(total * 0.8);
    const ratio = target > 0 ? count / target : 0;
    if (ratio > bestCategory.ratio) {
      bestCategory = { solved: count, target, ratio };
    }
  }

  let bestPath = { solved: 0, total: 0, ratio: -1 };
  for (const path of LEARNING_PATHS) {
    if (path.problemIds.length === 0) continue;
    let count = 0;
    for (const id of path.problemIds) {
      if (snapshot.progress[id]?.solved) count += 1;
    }
    const ratio = count / path.problemIds.length;
    if (ratio > bestPath.ratio) {
      bestPath = { solved: count, total: path.problemIds.length, ratio };
    }
  }

  const labsPassed = Object.values(snapshot.labs).filter(
    (r) => r?.passed === true,
  ).length;
  const beatenBaselines = Object.values(snapshot.research).filter(
    (state) => state?.beatenBaseline === true,
  ).length;

  const bugHunts = sanitizeBugHunts(snapshot.bugHunts);
  const cleanBugHunts = bugHunts.filter((entry) => entry.clean);
  const finishedRuns = sanitizeFinishedRuns(snapshot.runs);

  const result: Derived = {
    solved,
    entries,
    bugHunts,
    cleanBugHunts,
    finishedRuns,
    byDifficulty,
    solvedByCategory,
    longestStreak: getLongestStreak(snapshot.progress),
    currentStreak: getCurrentStreak(snapshot.progress),
    maxGapDays,
    nightOwl,
    earlyBird,
    solvedSaturday,
    solvedSunday,
    labsPassed,
    beatenBaselines,
    bestCategory,
    bestPath,
  };
  DERIVED_CACHE.set(snapshot, result);
  return result;
}

/* ────────────────────────────── badge catalog ───────────────────────────── */

function clamp(value: number, max: number): number {
  return Math.max(0, Math.min(value, max));
}

export const BADGE_CATALOG: Badge[] = [
  {
    id: "first-blood",
    name: "First Blood",
    description: "Solve your first problem.",
    tier: "bronze",
    rule: (s) => derive(s).solved.length >= 1,
    progress: (s) => [clamp(derive(s).solved.length, 1), 1],
  },
  {
    id: "forged-10",
    name: "Forged 10",
    description: "Solve 10 problems.",
    tier: "bronze",
    rule: (s) => derive(s).solved.length >= 10,
    progress: (s) => [clamp(derive(s).solved.length, 10), 10],
  },
  {
    id: "centurion",
    name: "Centurion",
    description: "Solve 100 problems.",
    tier: "silver",
    rule: (s) => derive(s).solved.length >= 100,
    progress: (s) => [clamp(derive(s).solved.length, 100), 100],
  },
  {
    id: "forge-master",
    name: "Forge Master",
    description: "Solve 400 problems.",
    tier: "gold",
    rule: (s) => derive(s).solved.length >= 400,
    progress: (s) => [clamp(derive(s).solved.length, 400), 400],
  },
  {
    id: "hard-hat",
    name: "Hard Hat",
    description: "Solve a Hard problem.",
    tier: "bronze",
    rule: (s) => derive(s).byDifficulty.Hard >= 1,
    progress: (s) => [clamp(derive(s).byDifficulty.Hard, 1), 1],
  },
  {
    id: "hardened-25",
    name: "Hardened",
    description: "Solve 25 Hard problems.",
    tier: "silver",
    rule: (s) => derive(s).byDifficulty.Hard >= 25,
    progress: (s) => [clamp(derive(s).byDifficulty.Hard, 25), 25],
  },
  {
    id: "triple-threat",
    name: "Triple Threat",
    description: "Solve 25 problems at each difficulty.",
    tier: "silver",
    rule: (s) => {
      const d = derive(s).byDifficulty;
      return (
        d.Easy >= 25 && d.Medium >= 25 && d.Hard >= 25
      );
    },
    progress: (s) => {
      const d = derive(s).byDifficulty;
      const bottleneck = Math.min(d.Easy, d.Medium, d.Hard);
      return [clamp(bottleneck, 25), 25];
    },
  },
  {
    id: "night-owl",
    name: "Night Owl",
    description: "Solve a problem between midnight and 4am.",
    tier: "bronze",
    rule: (s) => derive(s).nightOwl !== null,
    progress: (s) => [derive(s).nightOwl ? 1 : 0, 1],
  },
  {
    id: "early-bird",
    name: "Early Bird",
    description: "Solve a problem between 5am and 7am.",
    tier: "bronze",
    rule: (s) => derive(s).earlyBird !== null,
    progress: (s) => [derive(s).earlyBird ? 1 : 0, 1],
  },
  {
    id: "weekend-warrior",
    name: "Weekend Warrior",
    description: "Solve on both a Saturday and a Sunday.",
    tier: "bronze",
    rule: (s) => derive(s).solvedSaturday && derive(s).solvedSunday,
    progress: (s) => {
      const d = derive(s);
      return [
        (d.solvedSaturday ? 1 : 0) + (d.solvedSunday ? 1 : 0),
        2,
      ];
    },
  },
  {
    id: "phoenix",
    name: "Phoenix",
    description: "Solve again after a gap of 14 days or more.",
    tier: "silver",
    rule: (s) => derive(s).maxGapDays >= 14,
    progress: (s) => [clamp(derive(s).maxGapDays, 14), 14],
  },
  {
    id: "explorer",
    name: "Explorer",
    description: "Solve problems in 10 different categories.",
    tier: "silver",
    rule: (s) => derive(s).solvedByCategory.size >= 10,
    progress: (s) => [clamp(derive(s).solvedByCategory.size, 10), 10],
  },
  {
    id: "fifteen-pillars",
    name: "Fifteen Pillars",
    description: "Solve a problem in all 15 categories.",
    tier: "gold",
    rule: (s) => derive(s).solvedByCategory.size >= CATEGORIES.length,
    progress: (s) => [
      clamp(derive(s).solvedByCategory.size, CATEGORIES.length),
      CATEGORIES.length,
    ],
  },
  {
    id: "category-master",
    name: "Category Master",
    description: "Solve 80% of any single category.",
    tier: "silver",
    rule: (s) => {
      const best = derive(s).bestCategory;
      return best.ratio >= 1;
    },
    progress: (s) => {
      const best = derive(s).bestCategory;
      return [best.solved, best.target];
    },
  },
  {
    id: "first-light",
    name: "First Light",
    description: "Complete your first daily challenge.",
    tier: "bronze",
    rule: (s) => s.daily.solvedDates.length >= 1,
    progress: (s) => [clamp(s.daily.solvedDates.length, 1), 1],
  },
  {
    id: "daily-devotee",
    name: "Daily Devotee",
    description: "Complete 10 daily challenges.",
    tier: "silver",
    rule: (s) => s.daily.solvedDates.length >= 10,
    progress: (s) => [clamp(s.daily.solvedDates.length, 10), 10],
  },
  {
    id: "week-of-fire",
    name: "Week of Fire",
    description: "Reach a 7-day solving streak.",
    tier: "silver",
    rule: (s) => derive(s).longestStreak >= 7,
    progress: (s) => [clamp(derive(s).longestStreak, 7), 7],
  },
  {
    id: "ritualist",
    name: "Ritualist",
    description: "Reach a 30-day solving streak.",
    tier: "gold",
    rule: (s) => derive(s).longestStreak >= 30,
    progress: (s) => [clamp(derive(s).longestStreak, 30), 30],
  },
  {
    id: "lab-coat",
    name: "Lab Coat",
    description: "Pass your first lab.",
    tier: "bronze",
    rule: (s) => derive(s).labsPassed >= 1,
    progress: (s) => [clamp(derive(s).labsPassed, 1), 1],
  },
  {
    id: "lab-scientist",
    name: "Lab Scientist",
    description: "Pass 4 labs.",
    tier: "silver",
    rule: (s) => derive(s).labsPassed >= 4,
    progress: (s) => [clamp(derive(s).labsPassed, 4), 4],
  },
  {
    id: "principal-investigator",
    name: "Principal Investigator",
    description: `Pass all ${LABS.length} labs.`,
    tier: "gold",
    rule: (s) => derive(s).labsPassed >= LABS.length,
    progress: (s) => [clamp(derive(s).labsPassed, LABS.length), LABS.length],
  },
  {
    id: "baseline-breaker",
    name: "Baseline Breaker",
    description: "Beat the baseline on 3 research challenges.",
    tier: "silver",
    rule: (s) => derive(s).beatenBaselines >= 3,
    progress: (s) => [clamp(derive(s).beatenBaselines, 3), 3],
  },
  {
    id: "path-finisher",
    name: "Path Finisher",
    description: "Complete every problem in a learning path.",
    tier: "gold",
    rule: (s) => derive(s).bestPath.ratio >= 1,
    progress: (s) => {
      const best = derive(s).bestPath;
      return [best.solved, best.total];
    },
  },
  {
    id: "under-pressure",
    name: "Under Pressure",
    description: "Finish a timed contest.",
    tier: "bronze",
    rule: (s) => s.contests.length >= 1,
    progress: (s) => [clamp(s.contests.length, 1), 1],
  },
  {
    id: "bug-slayer",
    name: "Bug Slayer",
    description: "Land your first clean bug hunt.",
    tier: "bronze",
    rule: (s) => derive(s).cleanBugHunts.length >= 1,
    progress: (s) => [clamp(derive(s).cleanBugHunts.length, 1), 1],
  },
  {
    id: "exterminator",
    name: "Exterminator",
    description: "Land 10 clean bug hunts.",
    tier: "silver",
    rule: (s) => derive(s).cleanBugHunts.length >= 10,
    progress: (s) => [clamp(derive(s).cleanBugHunts.length, 10), 10],
  },
  {
    id: "flawless",
    name: "Flawless",
    description: "Land 25 clean bug hunts.",
    tier: "gold",
    rule: (s) => derive(s).cleanBugHunts.length >= 25,
    progress: (s) => [clamp(derive(s).cleanBugHunts.length, 25), 25],
  },
  {
    id: "speedrunner",
    name: "Speedrunner",
    description: "Finish a speedrun.",
    tier: "bronze",
    rule: (s) => derive(s).finishedRuns.length >= 1,
    progress: (s) => [clamp(derive(s).finishedRuns.length, 1), 1],
  },
  {
    id: "speed-demon",
    name: "Speed Demon",
    description: "Finish 10 speedruns.",
    tier: "silver",
    rule: (s) => derive(s).finishedRuns.length >= 10,
    progress: (s) => [clamp(derive(s).finishedRuns.length, 10), 10],
  },
];

export const TOTAL_BADGES = BADGE_CATALOG.length;

/* ───────────────────────────── badge progress ───────────────────────────── */

export function badgeProgress(
  id: string,
  snapshot: BadgeSnapshot = getBadgeSnapshot(),
): [number, number] {
  const badge = BADGE_CATALOG.find((item) => item.id === id);
  return badge ? badge.progress(snapshot) : [0, 0];
}

/* ───────────────────────────── earned dates ─────────────────────────────── */

function readBadgeDates(): Record<string, string> {
  const parsed = readJson<Record<string, unknown>>(BADGE_DATES_KEY);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
  const out: Record<string, string> = {};
  for (const [id, value] of Object.entries(parsed)) {
    if (typeof value === "string") out[id] = value;
  }
  return out;
}

function writeBadgeDates(dates: Record<string, string>): void {
  writeJson(BADGE_DATES_KEY, dates);
}

function nthSolveAt(
  entries: SolveEntry[],
  target: number,
  predicate?: (entry: SolveEntry) => boolean,
): string | null {
  const list = predicate ? entries.filter(predicate) : entries;
  if (target < 1 || list.length < target) return null;
  return list[target - 1].at.toISOString();
}

/** ISO timestamp of the `target`-th (1-based) dated entry, oldest first. */
function nthDatedAt(
  entries: ReadonlyArray<{ at: Date }>,
  target: number,
): string | null {
  if (target < 1 || entries.length < target) return null;
  return entries[target - 1].at.toISOString();
}

/** The moment all three difficulty counters reached 25, if they did. */
function tripleThreatAt(entries: SolveEntry[]): string | null {
  let latest = 0;
  for (const difficulty of ["Easy", "Medium", "Hard"] as Difficulty[]) {
    const at = nthSolveAt(
      entries,
      25,
      (entry) => entry.problem.difficulty === difficulty,
    );
    if (!at) return null;
    latest = Math.max(latest, Date.parse(at));
  }
  return Number.isNaN(latest) ? null : new Date(latest).toISOString();
}

function weekendWarriorAt(entries: SolveEntry[]): string | null {
  let saturday = false;
  let sunday = false;
  for (const entry of entries) {
    if (entry.at.getDay() === 6) saturday = true;
    if (entry.at.getDay() === 0) sunday = true;
    if (saturday && sunday) return entry.at.toISOString();
  }
  return null;
}

/** First solve that followed a gap of 14+ days. */
function phoenixAt(entries: SolveEntry[]): string | null {
  const byDay = new Map<string, Date>();
  for (const entry of entries) {
    const key = getDailyDateKey(entry.at);
    if (!byDay.has(key)) byDay.set(key, entry.at);
  }
  const keys = [...byDay.keys()].sort();
  for (let i = 1; i < keys.length; i += 1) {
    if (dayKeyDiff(keys[i - 1], keys[i]) >= 14) {
      return byDay.get(keys[i])?.toISOString() ?? null;
    }
  }
  return null;
}

/** Timestamp when the category count first reached `target`. */
function categoryCountAt(entries: SolveEntry[], target: number): string | null {
  const seen = new Set<Category>();
  for (const entry of entries) {
    seen.add(entry.problem.category);
    if (seen.size >= target) return entry.at.toISOString();
  }
  return null;
}

/** Timestamp when any category first hit 80% of its problems. */
function categoryMasterAt(entries: SolveEntry[]): string | null {
  const counts = new Map<Category, number>();
  for (const entry of entries) {
    const next = (counts.get(entry.problem.category) ?? 0) + 1;
    counts.set(entry.problem.category, next);
    const total = CATEGORY_TOTALS.get(entry.problem.category) ?? 0;
    if (total > 0 && next >= Math.ceil(total * 0.8)) {
      return entry.at.toISOString();
    }
  }
  return null;
}

/** Timestamp when the first learning path became complete. */
function pathFinisherAt(entries: SolveEntry[]): string | null {
  const solvedIds = new Set<string>();
  for (const entry of entries) {
    solvedIds.add(entry.problem.id);
    for (const path of LEARNING_PATHS) {
      if (!path.problemIds.includes(entry.problem.id)) continue;
      if (path.problemIds.every((id) => solvedIds.has(id))) {
        return entry.at.toISOString();
      }
    }
  }
  return null;
}

/** End date key of the first run of `target` consecutive solve days. */
function streakEndKey(dayKeys: string[], target: number): string | null {
  if (target < 1 || dayKeys.length < target) return null;
  if (target === 1) return dayKeys[0];
  let run = 1;
  for (let i = 1; i < dayKeys.length; i += 1) {
    run = dayKeyDiff(dayKeys[i - 1], dayKeys[i]) === 1 ? run + 1 : 1;
    if (run >= target) return dayKeys[i];
  }
  return null;
}

function deriveEarnedAt(id: string, snapshot: BadgeSnapshot): string | null {
  const derived = derive(snapshot);
  const { entries } = derived;
  switch (id) {
    case "first-blood":
      return nthSolveAt(entries, 1);
    case "forged-10":
      return nthSolveAt(entries, 10);
    case "centurion":
      return nthSolveAt(entries, 100);
    case "forge-master":
      return nthSolveAt(entries, 400);
    case "hard-hat":
      return nthSolveAt(entries, 1, (e) => e.problem.difficulty === "Hard");
    case "hardened-25":
      return nthSolveAt(entries, 25, (e) => e.problem.difficulty === "Hard");
    case "triple-threat":
      return tripleThreatAt(entries);
    case "night-owl": {
      const entry = derive(snapshot).nightOwl;
      return entry ? entry.at.toISOString() : null;
    }
    case "early-bird": {
      const entry = derive(snapshot).earlyBird;
      return entry ? entry.at.toISOString() : null;
    }
    case "weekend-warrior":
      return weekendWarriorAt(entries);
    case "phoenix":
      return phoenixAt(entries);
    case "explorer":
      return categoryCountAt(entries, 10);
    case "fifteen-pillars":
      return categoryCountAt(entries, CATEGORIES.length);
    case "category-master":
      return categoryMasterAt(entries);
    case "first-light":
    case "daily-devotee": {
      const target = id === "first-light" ? 1 : 10;
      const dates = [...snapshot.daily.solvedDates].sort();
      if (dates.length < target) return null;
      return dailyDateToIso(dates[target - 1]);
    }
    case "week-of-fire":
    case "ritualist": {
      const target = id === "week-of-fire" ? 7 : 30;
      const dayKeys = [...new Set(entries.map((e) => getDailyDateKey(e.at)))].sort();
      const key = streakEndKey(dayKeys, target);
      return key ? dailyDateToIso(key) : null;
    }
    case "path-finisher":
      return pathFinisherAt(entries);
    case "under-pressure": {
      let earliest: number | null = null;
      for (const result of snapshot.contests) {
        if (typeof result?.completedAt !== "string") continue;
        const at = parseIso(result.completedAt);
        if (!at) continue;
        const time = at.getTime();
        if (earliest === null || time < earliest) earliest = time;
      }
      return earliest === null ? null : new Date(earliest).toISOString();
    }
    case "bug-slayer":
      return nthDatedAt(derived.cleanBugHunts, 1);
    case "exterminator":
      return nthDatedAt(derived.cleanBugHunts, 10);
    case "flawless":
      return nthDatedAt(derived.cleanBugHunts, 25);
    case "speedrunner":
      return nthDatedAt(derived.finishedRuns, 1);
    case "speed-demon":
      return nthDatedAt(derived.finishedRuns, 10);
    default:
      // Lab and research milestones have no timestamps in their stores —
      // these are first-seen stamped instead.
      return null;
  }
}

/**
 * All badges currently earned, with a best-effort earnedAt. Milestones that
 * cannot be dated from the stores (labs, research baselines) get a first-seen
 * timestamp persisted to `deepforge:badge-dates:v1`.
 */
export function earnedBadges(
  snapshot: BadgeSnapshot = getBadgeSnapshot(),
): EarnedBadge[] {
  const stamps = readBadgeDates();
  const nowIso = snapshot.now.toISOString();
  const earned: EarnedBadge[] = [];
  let changed = false;

  for (const badge of BADGE_CATALOG) {
    if (!badge.rule(snapshot)) continue;
    let earnedAt = deriveEarnedAt(badge.id, snapshot);
    if (!earnedAt) {
      earnedAt = stamps[badge.id] ?? null;
      if (!earnedAt) {
        earnedAt = nowIso;
        stamps[badge.id] = nowIso;
        changed = true;
      }
    }
    earned.push({ id: badge.id, earnedAt });
  }

  if (changed) writeBadgeDates(stamps);
  return earned;
}

/* ───────────────────────────────── XP ───────────────────────────────────── */

/** Cumulative XP needed to reach `level` (level 1 starts at 0). */
export function xpThreshold(level: number): number {
  return 50 * level * (level - 1);
}

const LEVEL_TITLES = [
  "Novice",
  "Apprentice",
  "Adept",
  "Practitioner",
  "Specialist",
  "Expert",
  "Veteran",
  "Elite",
  "Master",
  "Legend",
];

/** A new title every 10 levels. */
export function levelTitle(level: number): string {
  const index = Math.min(
    Math.floor((level - 1) / 10),
    LEVEL_TITLES.length - 1,
  );
  return LEVEL_TITLES[index];
}

export function levelForXp(xp: number): number {
  let level = 1;
  while (xpThreshold(level + 1) <= xp) level += 1;
  return level;
}

interface XpCache {
  xp: number;
  level: number;
  title: string;
  at: string;
}

function xpForSnapshot(snapshot: BadgeSnapshot): number {
  const derived = derive(snapshot);
  let xp = 0;
  for (const problem of derived.solved) xp += awardForDifficulty(problem.difficulty);
  xp += derived.labsPassed * LAB_PASS_XP;
  for (const state of Object.values(snapshot.research)) {
    const attempts = Array.isArray(state?.attempts) ? state.attempts.length : 0;
    xp += attempts * RESEARCH_ATTEMPT_XP;
    if (state?.beatenBaseline === true) xp += RESEARCH_BASELINE_XP;
  }
  return xp;
}

function cacheXp(info: XpInfo): void {
  const current = readJson<XpCache>(XP_CACHE_KEY);
  if (current && current.xp === info.xp && current.level === info.level) return;
  writeJson(XP_CACHE_KEY, {
    xp: info.xp,
    level: info.level,
    title: info.title,
    at: new Date().toISOString(),
  } satisfies XpCache);
}

/**
 * Derive the full XP state from current progress. Deterministic and
 * idempotent — the only write is the `deepforge:xp:v1` cache entry.
 */
export function computeXp(
  snapshot: BadgeSnapshot = getBadgeSnapshot(),
): XpInfo {
  const xp = xpForSnapshot(snapshot);
  const level = levelForXp(xp);
  const base = xpThreshold(level);
  const next = xpThreshold(level + 1);
  const span = next - base;
  const progress = span > 0 ? (xp - base) / span : 0;
  const info: XpInfo = {
    xp,
    level,
    title: levelTitle(level),
    nextLevelXp: next,
    progress: Math.max(0, Math.min(1, progress)),
  };
  cacheXp(info);
  return info;
}

export function getXp(snapshot?: BadgeSnapshot): XpInfo {
  return computeXp(snapshot);
}

/* ──────────────────────────────── quests ────────────────────────────────── */

interface QuestDefinition {
  id: string;
  label: string;
  detail: string;
  target: number;
  measure: (snapshot: BadgeSnapshot, derived: Derived, dayKey: string) => number;
}

function solvesOnDay(derived: Derived, dayKey: string): number {
  let count = 0;
  for (const entry of derived.entries) {
    if (getDailyDateKey(entry.at) === dayKey) count += 1;
  }
  return count;
}

function hardSolvesOnDay(derived: Derived, dayKey: string): number {
  let count = 0;
  for (const entry of derived.entries) {
    if (entry.problem.difficulty === "Hard" && getDailyDateKey(entry.at) === dayKey) {
      count += 1;
    }
  }
  return count;
}

function researchAttemptsOnDay(snapshot: BadgeSnapshot, dayKey: string): number {
  let count = 0;
  for (const state of Object.values(snapshot.research)) {
    if (!Array.isArray(state?.attempts)) continue;
    for (const attempt of state.attempts) {
      const at = parseIso(attempt.at);
      if (at && getDailyDateKey(at) === dayKey) count += 1;
    }
  }
  return count;
}

/** Clean bug-hunt rounds locked in on this calendar day. */
function cleanBugHuntsOnDay(derived: Derived, dayKey: string): number {
  let count = 0;
  for (const entry of derived.cleanBugHunts) {
    if (getDailyDateKey(entry.at) === dayKey) count += 1;
  }
  return count;
}

/** Was any lab scored on this calendar day? */
function labsRunOnDay(snapshot: BadgeSnapshot, dayKey: string): number {
  for (const record of Object.values(snapshot.labs)) {
    const lastScoredAt = record?.lastScoredAt;
    if (typeof lastScoredAt !== "string" || !lastScoredAt) continue;
    const at = parseIso(lastScoredAt);
    if (at && getDailyDateKey(at) === dayKey) return 1;
  }
  return 0;
}

/** XP earned on a calendar day from solves and research runs. */
function xpOnDay(
  snapshot: BadgeSnapshot,
  derived: Derived,
  dayKey: string,
): number {
  let xp = 0;
  for (const entry of derived.entries) {
    if (getDailyDateKey(entry.at) === dayKey) xp += awardForDifficulty(entry.problem.difficulty);
  }
  return xp + researchAttemptsOnDay(snapshot, dayKey) * RESEARCH_ATTEMPT_XP;
}

const QUEST_POOL: QuestDefinition[] = [
  {
    id: "solve-3",
    label: "Solve 3 problems",
    detail: "Any difficulty counts.",
    target: 3,
    measure: (_snapshot, derived, dayKey) => solvesOnDay(derived, dayKey),
  },
  {
    id: "solve-hard",
    label: "Solve a Hard problem",
    detail: "One is enough.",
    target: 1,
    measure: (_snapshot, derived, dayKey) => hardSolvesOnDay(derived, dayKey),
  },
  {
    id: "daily",
    label: "Finish today's daily challenge",
    detail: "Rotates at local midnight.",
    target: 1,
    measure: (snapshot, _derived, dayKey) =>
      snapshot.daily.solvedDates.includes(dayKey) ? 1 : 0,
  },
  {
    id: "lab",
    label: "Run a lab",
    detail: "One scored submission.",
    target: 1,
    measure: (snapshot, _derived, dayKey) => labsRunOnDay(snapshot, dayKey),
  },
  {
    id: "research-2",
    label: "Make 2 research submissions",
    detail: "Score any challenge twice.",
    target: 2,
    measure: (snapshot, _derived, dayKey) =>
      researchAttemptsOnDay(snapshot, dayKey),
  },
  {
    id: "xp-100",
    label: "Earn 100 XP today",
    detail: "Solves and research runs count.",
    target: 100,
    measure: (snapshot, derived, dayKey) => xpOnDay(snapshot, derived, dayKey),
  },
  {
    id: "bug-hunt",
    label: "Land a clean bug hunt",
    detail: "Exact line and solid reasoning.",
    target: 1,
    measure: (_snapshot, derived, dayKey) => cleanBugHuntsOnDay(derived, dayKey),
  },
];

type QuestStore = Record<string, string[]>;

function readQuestStore(): QuestStore {
  const parsed = readJson<Record<string, unknown>>(QUEST_STORE_KEY);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
  const out: QuestStore = {};
  for (const [day, ids] of Object.entries(parsed)) {
    if (Array.isArray(ids)) {
      out[day] = ids.filter((value): value is string => typeof value === "string");
    }
  }
  return out;
}

function writeQuestStore(store: QuestStore): void {
  const days = Object.keys(store).sort().reverse();
  for (const day of days.slice(QUEST_HISTORY_DAYS)) delete store[day];
  writeJson(QUEST_STORE_KEY, store);
}

/** Deterministic 3-quest pick for a date key. */
function pickQuests(dayKey: string): QuestDefinition[] {
  const picked: QuestDefinition[] = [];
  for (let i = 0; i < 3; i += 1) {
    let index = fnv1a(`${dayKey}:${i}`) % QUEST_POOL.length;
    let guard = 0;
    while (picked.some((quest) => quest.id === QUEST_POOL[index].id) && guard < QUEST_POOL.length) {
      index = (index + 1) % QUEST_POOL.length;
      guard += 1;
    }
    picked.push(QUEST_POOL[index]);
  }
  return picked;
}

/**
 * Today's three quests with live progress. Quests observed as complete are
 * persisted (date-keyed) so they stay checked even if progress is reset.
 */
export function getDailyQuests(
  snapshot: BadgeSnapshot = getBadgeSnapshot(),
): Quest[] {
  const dayKey = getDailyDateKey(snapshot.now);
  const derived = derive(snapshot);
  const store = readQuestStore();
  const stored = new Set(store[dayKey] ?? []);
  let changed = false;

  const quests = pickQuests(dayKey).map((definition) => {
    const raw = Math.max(0, definition.measure(snapshot, derived, dayKey));
    const derivedDone = raw >= definition.target;
    const done = derivedDone || stored.has(definition.id);
    if (done && !stored.has(definition.id)) {
      stored.add(definition.id);
      changed = true;
    }
    return {
      id: definition.id,
      label: definition.label,
      detail: definition.detail,
      progress: done ? definition.target : Math.min(raw, definition.target),
      target: definition.target,
      done,
    };
  });

  if (changed) {
    store[dayKey] = [...stored];
    writeQuestStore(store);
  }
  return quests;
}

/* ─────────────────────────────── heatmap ────────────────────────────────── */

function heatLevel(count: number): HeatmapLevel {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count <= 4) return 3;
  return 4;
}

/**
 * A `weeks`-long calendar ending on the current week, one entry per day,
 * oldest first. Counts merge solves (progress.solvedAt), daily completions,
 * research attempts, bug-hunt rounds (clean or not) and finished speedruns;
 * a day present in daily.solvedDates but absent from progress still counts
 * once, so the sources never double-count. A speedrun lands on the day it
 * started — the only real timestamp its record holds.
 */
export function getActivityHeatmap(
  weeks = 52,
  snapshot: BadgeSnapshot = getBadgeSnapshot(),
): HeatmapDay[] {
  const counts = new Map<string, number>();
  const derived = derive(snapshot);

  for (const record of Object.values(snapshot.progress)) {
    if (!record?.solvedAt) continue;
    const at = parseIso(record.solvedAt);
    if (!at) continue;
    const key = getDailyDateKey(at);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  for (const state of Object.values(snapshot.research)) {
    if (!Array.isArray(state?.attempts)) continue;
    for (const attempt of state.attempts) {
      const at = parseIso(attempt.at);
      if (!at) continue;
      const key = getDailyDateKey(at);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  for (const entry of derived.bugHunts) {
    const key = getDailyDateKey(entry.at);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  for (const entry of derived.finishedRuns) {
    const key = getDailyDateKey(entry.at);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  for (const key of snapshot.daily.solvedDates) {
    if (!counts.has(key)) counts.set(key, 1);
  }

  const today = new Date(snapshot.now);
  today.setHours(0, 0, 0, 0);
  const saturday = new Date(today);
  saturday.setDate(saturday.getDate() + (6 - saturday.getDay()));
  const start = new Date(saturday);
  start.setDate(start.getDate() - (weeks * 7 - 1));

  const days: HeatmapDay[] = [];
  for (let i = 0; i < weeks * 7; i += 1) {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    const key = getDailyDateKey(date);
    const future = date.getTime() > today.getTime();
    const count = future ? 0 : (counts.get(key) ?? 0);
    days.push({ date: key, count, level: heatLevel(count) });
  }
  return days;
}

/* ──────────────────────────────── totals ────────────────────────────────── */

export function getTotals(
  snapshot: BadgeSnapshot = getBadgeSnapshot(),
): Totals {
  const derived = derive(snapshot);
  const xp = xpForSnapshot(snapshot);
  return {
    solved: derived.solved.length,
    xp,
    level: levelForXp(xp),
    badges: earnedBadges(snapshot).length,
    streak: derived.currentStreak,
    longestStreak: derived.longestStreak,
  };
}
