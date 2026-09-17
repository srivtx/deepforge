import type { Lab } from "@/data/labs";

export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function formatScore(lab: Lab, value: number): string {
  return lab.metric === "mse" ? value.toFixed(2) : value.toFixed(3);
}

export function directionArrow(lab: Lab): string {
  return lab.higherIsBetter ? "↑" : "↓";
}
