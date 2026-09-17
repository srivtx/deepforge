import type { ResearchChallenge } from "@/data/research";

/** Short human-readable label for a research metric. */
export function metricLabel(metric: ResearchChallenge["metric"]): string {
  switch (metric) {
    case "accuracy":
      return "accuracy";
    case "f1":
      return "F1";
    case "mse":
      return "MSE";
    case "r2":
      return "R²";
  }
}

/** Four decimals — enough to separate near-baseline scores. */
export function formatScore(score: number): string {
  return score.toFixed(4);
}

/** Compact local timestamp for attempt rows. */
export function formatWhen(at: string): string {
  const date = new Date(at);
  if (Number.isNaN(date.getTime())) return at;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
