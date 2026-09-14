/** Compose class names, dropping falsy values. */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Format a Python repr string for display: trim trailing whitespace, clip length. */
export function clipRepr(s: string | null, max = 200): string {
  if (s === null) return "(no value)";
  const trimmed = s.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;
  return trimmed.slice(0, max) + "…";
}

/** Difficulty → tailwind classes for the badge. */
export function difficultyClasses(d: "Easy" | "Medium" | "Hard"): string {
  switch (d) {
    case "Easy":
      return "text-accent border-accent/40 bg-accent/5";
    case "Medium":
      return "text-warning border-warning/40 bg-warning/5";
    case "Hard":
      return "text-error border-error/40 bg-error/5";
  }
}

/** Number of problems shown in the marketing claim. Keep in sync with the shipped count in PROBLEM_META. */
export const MARKETING_PROBLEM_COUNT = 5550;
