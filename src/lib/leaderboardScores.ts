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
