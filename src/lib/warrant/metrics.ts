/**
 * Deterministic aggregates for the arena tables T3–T6: mean, nearest-rank p5,
 * pair-win rate, tie-aware AUC, AP@12, seed churn and demotion sanity.
 *
 * seedDeltaMean(baseline, candidate) takes two arrays of grade vectors in the
 * same shape, one vector per run, aligned position by position (baseline is
 * the reference run, e.g. regime R, and candidate is the churned run, e.g.
 * regime C). Grades are mapped to a numeric proxy (dead -> -1, live k -> k)
 * and the result is the mean of |proxy(candidate) - proxy(baseline)| over
 * every aligned pair. Empty or partially empty input yields 0 for the
 * missing pairs.
 */
import { isDead } from "./types";
import type { Grade, Registry, Store, ValueId } from "./types";
import { lambda } from "./grade";

export function mean(xs: readonly number[]): number {
  if (xs.length === 0) {
    return 0;
  }
  let total = 0;
  for (const x of xs) {
    total += x;
  }
  return total / xs.length;
}

export function p5(xs: readonly number[]): number {
  if (xs.length === 0) {
    return 0;
  }
  const sorted = [...xs].sort((a, b) => a - b);
  const rank = Math.max(1, Math.ceil(0.05 * sorted.length));
  return sorted[rank - 1];
}

export function pairWinRate(
  correctScores: readonly number[],
  defectiveScores: readonly number[],
): number {
  const pairs = Math.min(correctScores.length, defectiveScores.length);
  if (pairs === 0) {
    return 0;
  }
  let total = 0;
  for (let index = 0; index < pairs; index += 1) {
    const correct = correctScores[index];
    const defective = defectiveScores[index];
    total += correct > defective ? 1 : correct === defective ? 0.5 : 0;
  }
  return total / pairs;
}

export function auc(scores: readonly number[], labels: readonly (0 | 1)[]): number {
  const n = Math.min(scores.length, labels.length);
  let positives = 0;
  let negatives = 0;
  for (let index = 0; index < n; index += 1) {
    if (labels[index] === 1) {
      positives += 1;
    } else {
      negatives += 1;
    }
  }
  if (positives === 0 || negatives === 0) {
    return 0.5;
  }
  let total = 0;
  for (let i = 0; i < n; i += 1) {
    if (labels[i] !== 1) {
      continue;
    }
    for (let j = 0; j < n; j += 1) {
      if (labels[j] !== 0) {
        continue;
      }
      if (scores[i] > scores[j]) {
        total += 1;
      } else if (scores[i] === scores[j]) {
        total += 0.5;
      }
    }
  }
  return total / (positives * negatives);
}

export function apAt12(scores: readonly number[], labels: readonly (0 | 1)[]): number {
  const n = Math.min(scores.length, labels.length);
  if (n === 0) {
    return 0;
  }
  const order: number[] = [];
  for (let index = 0; index < n; index += 1) {
    order.push(index);
  }
  const suspicion = (index: number): number =>
    scores[index] === 0 ? Infinity : 1 / scores[index];
  order.sort((a, b) => {
    const left = suspicion(a);
    const right = suspicion(b);
    if (left !== right) {
      return right - left;
    }
    return a - b;
  });
  const top = Math.min(12, n);
  let hits = 0;
  for (let index = 0; index < top; index += 1) {
    if (labels[order[index]] === 0) {
      hits += 1;
    }
  }
  return hits / top;
}

function proxy(grade: Grade): number {
  return isDead(grade) ? -1 : grade;
}

export function seedDeltaMean(
  baseline: readonly (readonly Grade[])[],
  candidate: readonly (readonly Grade[])[],
): number {
  const runs = Math.min(baseline.length, candidate.length);
  let total = 0;
  let pairs = 0;
  for (let run = 0; run < runs; run += 1) {
    const claims = Math.min(baseline[run].length, candidate[run].length);
    for (let index = 0; index < claims; index += 1) {
      total += Math.abs(proxy(candidate[run][index]) - proxy(baseline[run][index]));
      pairs += 1;
    }
  }
  return pairs === 0 ? 0 : total / pairs;
}

export function pairFlipRate(
  baselineWins: readonly boolean[],
  candidateWins: readonly boolean[],
): number {
  const pairs = Math.min(baselineWins.length, candidateWins.length);
  if (pairs === 0) {
    return 0;
  }
  let flips = 0;
  for (let index = 0; index < pairs; index += 1) {
    if (!baselineWins[index] && candidateWins[index]) {
      flips += 1;
    }
  }
  return flips / pairs;
}

export function demotionSanity(
  store: Store,
  registry: Registry,
  deadTruth: ReadonlySet<ValueId>,
): { readonly precision: number; readonly recall: number } {
  const predicted = new Set<ValueId>();
  for (const id of store.values.keys()) {
    if (isDead(lambda(store, registry, id))) {
      predicted.add(id);
    }
  }
  let hit = 0;
  for (const id of predicted) {
    if (deadTruth.has(id)) {
      hit += 1;
    }
  }
  const precision =
    predicted.size === 0 ? (deadTruth.size === 0 ? 1 : 0) : hit / predicted.size;
  const recall = deadTruth.size === 0 ? (predicted.size === 0 ? 1 : 0) : hit / deadTruth.size;
  return { precision, recall };
}
