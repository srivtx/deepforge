import { PROBLEM_META } from "@/data/problems/problem-meta";
import { getProgress, type ProgressMap } from "@/lib/progress";
import { createStore } from "@/lib/sync/store";
import type { StoreSpec } from "@/lib/sync/types";
import type { Difficulty } from "@/types/problem";

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  solved: number;
  streak: number;
  isYou?: boolean;
}

const DIFFICULTY_WEIGHTS: Record<Difficulty, number> = {
  Easy: 1,
  Medium: 3,
  Hard: 5,
};

const USERNAME_KEY = "deepforge:username:v1";
const USERNAME_CHANGE_EVENT = "deepforge:username-change";
const DEFAULT_USERNAME = "you";
const DAY_MS = 24 * 60 * 60 * 1000;

const usernameStore = createStore<string>({
  id: "username",
  storageKey: USERNAME_KEY,
  event: USERNAME_CHANGE_EVENT,
  empty: () => DEFAULT_USERNAME,
  parse: (raw) => (raw && raw.trim() ? raw.trim() : DEFAULT_USERNAME),
  serialize: (v) => v,
});

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

function localDayNumber(date: Date): number {
  return Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS,
  );
}

function collectSolvedDays(progress: ProgressMap): number[] {
  const days = new Set<number>();
  for (const entry of Object.values(progress)) {
    if (!entry.solved || !entry.solvedAt) continue;
    const date = new Date(entry.solvedAt);
    if (Number.isNaN(date.getTime())) continue;
    days.add(localDayNumber(date));
  }
  return [...days].sort((a, b) => b - a);
}

export function getCurrentStreak(progress: ProgressMap): number {
  const days = collectSolvedDays(progress);
  if (days.length === 0) return 0;
  const today = localDayNumber(new Date());
  if (days[0] !== today && days[0] !== today - 1) return 0;
  let streak = 1;
  for (let i = 1; i < days.length; i += 1) {
    if (days[i] !== days[i - 1] - 1) break;
    streak += 1;
  }
  return streak;
}

export function getLongestStreak(progress: ProgressMap): number {
  const days = collectSolvedDays(progress);
  let longest = 0;
  let run = 0;
  for (let i = 0; i < days.length; i += 1) {
    run = i > 0 && days[i] === days[i - 1] - 1 ? run + 1 : 1;
    if (run > longest) longest = run;
  }
  return longest;
}

export function getUserName(): string {
  return usernameStore.get();
}

export function setUserName(name: string): void {
  usernameStore.set(name.trim() || DEFAULT_USERNAME);
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

export const USERNAME_SPEC: StoreSpec<string> = {
  id: "username",
  storageKey: USERNAME_KEY,
  event: USERNAME_CHANGE_EVENT,
  empty: () => "",
  parse: (raw) => (raw && raw.trim() ? raw.trim() : ""),
  serialize: (v) => v,
};
