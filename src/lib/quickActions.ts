/**
 * Quick actions — the verb half of the command palette.
 *
 * Pure, synchronous descriptors: every action carries a route (`href`) or a
 * side effect (`run`), never both, and nothing executes at import time. The
 * palette matches, renders, and executes them, so tests can validate the
 * registry without a DOM.
 *
 * Theme toggling receives next-themes' setter and resolved theme through the
 * run context instead of reaching for the hook itself, keeping the descriptor
 * a plain function of its arguments.
 */

import { isAssistantHidden, setAssistantHidden } from "@/lib/assistant";

export interface QuickActionCtx {
  /** next-themes' setter, injected by the palette. */
  setTheme?: (theme: string) => void;
  /** next-themes' resolved theme; anything but "dark" toggles to dark. */
  resolvedTheme?: string;
}

export interface QuickAction {
  id: string;
  label: string;
  keywords: readonly string[];
  kind: "navigate" | "toggle";
  href?: string;
  run?: (ctx: QuickActionCtx) => void;
}

export const QUICK_ACTIONS: readonly QuickAction[] = [
  {
    id: "today-session",
    label: "Open today's session",
    keywords: ["today", "session", "focus", "due", "reviews"],
    kind: "navigate",
    href: "/today",
  },
  {
    id: "daily-challenge",
    label: "Start the daily challenge",
    keywords: ["daily", "challenge", "streak", "today", "start"],
    kind: "navigate",
    href: "/daily",
  },
  {
    id: "review-queue",
    label: "Open the review hub",
    keywords: ["review", "reviews", "queue", "due", "overdue", "forecast", "spaced", "drill"],
    kind: "navigate",
    href: "/review",
  },
  {
    id: "alibi-hunt",
    label: "Hunt a silent bug",
    keywords: ["silent", "bug", "alibi", "hunt", "divergence", "counterexample", "puzzle"],
    kind: "navigate",
    href: "/alibi",
  },
  {
    id: "behavior-ledger",
    label: "Open the behavior ledger",
    keywords: ["ledger", "behavior", "delta", "no-op", "edit", "checks", "hidden"],
    kind: "navigate",
    href: "/ledger",
  },
  {
    id: "open-keyfuse",
    label: "Open KeyFuse cache-key auditor",
    keywords: ["keyfuse", "cache", "key", "witness", "env", "audit", "collision"],
    kind: "navigate",
    href: "/keyfuse",
  },
  {
    id: "open-warrant",
    label: "Open the Warrant Lab",
    keywords: ["warrant", "refutation", "ledger", "audit", "challenge", "grade", "cites"],
    kind: "navigate",
    href: "/warrant",
  },
  {
    id: "stats",
    label: "Show statistics",
    keywords: ["stats", "statistics", "dashboard", "progress", "mastery"],
    kind: "navigate",
    href: "/stats",
  },
  {
    id: "labs",
    label: "Open hands-on labs",
    keywords: ["labs", "lab", "hands-on", "datasets", "benchmark"],
    kind: "navigate",
    href: "/labs",
  },
  {
    id: "lab-trails",
    label: "Open lab trails",
    keywords: ["trails", "trail", "lab", "guided", "sequence"],
    kind: "navigate",
    href: "/labs/trails",
  },
  {
    id: "research",
    label: "Open research challenges",
    keywords: ["research", "challenge", "baseline", "sota", "experiments"],
    kind: "navigate",
    href: "/research",
  },
  {
    id: "papers",
    label: "Open papers",
    keywords: ["papers", "deepseek", "research", "lineage"],
    kind: "navigate",
    href: "/papers",
  },
  {
    id: "inventions",
    label: "Read our inventions",
    keywords: ["inventions", "invention", "publication", "pdf", "lgs"],
    kind: "navigate",
    href: "/inventions",
  },
  {
    id: "theme-toggle",
    label: "Toggle theme",
    keywords: ["theme", "dark", "light", "appearance", "mode"],
    kind: "toggle",
    run: ({ setTheme, resolvedTheme }) => {
      setTheme?.(resolvedTheme === "dark" ? "light" : "dark");
    },
  },
  {
    id: "assistant-show",
    // Clears the stored hidden flag when it is set, which restores the Zero
    // launcher in place; when the assistant is already visible there is
    // nothing to undo, so the action stays put (no route change, no event).
    label: "Show the Zero assistant",
    keywords: ["show", "assistant", "zero", "unhide", "restore", "launcher"],
    kind: "toggle",
    run: () => {
      if (isAssistantHidden()) setAssistantHidden(false);
    },
  },
  {
    id: "assistant-hide",
    label: "Hide the Zero assistant",
    keywords: ["hide", "assistant", "zero", "dismiss", "launcher"],
    kind: "toggle",
    run: () => setAssistantHidden(true),
  },
];

const SCORE_MISS = -1;
const SCORE_PREFIX = 0;
const SCORE_WORD = 1;
const SCORE_SUBSTRING = 2;

/**
 * Same tiers as `globalSearch`: 0 = text starts with the query, 1 = the query
 * starts a later word, 2 = the query appears inside a word, -1 = no match.
 */
function scoreText(text: string, query: string): number {
  const haystack = text.toLowerCase();
  const at = haystack.indexOf(query);
  if (at < 0) return SCORE_MISS;
  if (at === 0) return SCORE_PREFIX;
  return /[^a-z0-9]/.test(haystack[at - 1]) ? SCORE_WORD : SCORE_SUBSTRING;
}

/** Best score across an action's label and every keyword. */
export function scoreQuickAction(action: QuickAction, query: string): number {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return SCORE_MISS;
  let best = scoreText(action.label, q);
  for (const keyword of action.keywords) {
    const score = scoreText(keyword, q);
    if (score !== SCORE_MISS && (best === SCORE_MISS || score < best)) {
      best = score;
    }
  }
  return best;
}

/**
 * Matching actions, ranked by score, then shorter label, then registry order
 * so ties stay deterministic. Blank queries match nothing: the palette only
 * shows this group once the user has typed something.
 */
export function matchQuickActions(query: string): QuickAction[] {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return [];

  const scored: { action: QuickAction; score: number; index: number }[] = [];
  QUICK_ACTIONS.forEach((action, index) => {
    const score = scoreQuickAction(action, q);
    if (score !== SCORE_MISS) scored.push({ action, score, index });
  });

  scored.sort(
    (a, b) =>
      a.score - b.score ||
      a.action.label.length - b.action.label.length ||
      a.index - b.index,
  );
  return scored.map((entry) => entry.action);
}
