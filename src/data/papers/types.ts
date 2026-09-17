/**
 * Schema for the "Understanding Papers" curriculum: every DeepSeek paper from
 * the first release to the current frontier, each taught theory-first (visuals,
 * code, formulas, why) and only then read as a paper, with lineage edges that
 * explain what each model changed and what the next one improved.
 *
 * Content files live beside this one (founding.ts, efficiency.ts, reasoning.ts,
 * frontier.ts) and export `Paper[]`; index.ts merges them in reading order.
 */

export type PaperEra = "founding" | "efficiency" | "reasoning" | "frontier";

export type PaperKind = "paper" | "report" | "announcement";

/**
 * Deterministic SVG figures, implemented in src/components/papers/figures.tsx.
 * Every kind must render without randomness or clocks.
 */
export type PaperVisual =
  | "timeline"
  | "scaling-curve"
  | "code-pipeline"
  | "moe-routing"
  | "fine-grained-experts"
  | "grpo-loop"
  | "vision-tower"
  | "mla-latent"
  | "prover-tree"
  | "load-balance"
  | "fp8-range"
  | "mtp-tokens"
  | "rl-reward-curve"
  | "distillation-flow"
  | "sparse-attention"
  | "hybrid-thinking"
  | "cost-bars"
  | "janus-decouple";

export interface PaperProse {
  kind: "prose";
  heading?: string;
  text: string;
}

export interface PaperVisualSection {
  kind: "visual";
  visual: PaperVisual;
  caption: string;
}

export interface PaperCodeSection {
  kind: "code";
  title: string;
  language: "python";
  code: string;
  notes?: string[];
}

export interface PaperFormulaSection {
  kind: "formula";
  label: string;
  expression: string;
  why: string;
}

export type PaperSection =
  | PaperProse
  | PaperVisualSection
  | PaperCodeSection
  | PaperFormulaSection;

export interface PaperQuestion {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface PaperLineage {
  /** Paper id this one builds on (the previous step in the lineage). */
  from?: string;
  /** Paper ids that build on this one. */
  to?: string[];
  /** One or two sentences placing this work in the sequence. */
  context: string;
  /** Concrete things this work introduced or improved over its predecessor. */
  improved: string[];
}

export interface PaperPractice {
  labs?: string[];
  research?: string[];
  concepts?: string[];
  problems?: string[];
  articles?: string[];
}

/**
 * A hands-on build suggested by the paper: a small, real, runnable project
 * that mimics the mechanism the paper introduced.
 */
export interface PaperProject {
  title: string;
  pitch: string;
  difficulty: "starter" | "intermediate" | "advanced";
  /** Honest build estimate, e.g. "3-5 hours". */
  timeEstimate: string;
  /** 4-8 concrete implementation milestones, in build order. */
  milestones: string[];
  /** Runnable Python scaffolding (stdlib only) with TODOs to complete. */
  starterCode: string;
  /** Measurable "done" checks. */
  successCriteria: string[];
  /** Optional extensions once the core works. */
  stretch: string[];
  relatedLabIds?: string[];
  relatedProblemIds?: string[];
}

export interface Paper {
  id: string;
  slug: string;
  title: string;
  short: string;
  /** Publication year and ISO date, used for ordering and the timeline. */
  year: number;
  date: string;
  arxivId?: string;
  url: string;
  kind: PaperKind;
  era: PaperEra;
  tier: "core" | "advanced";
  tagline: string;
  /** What the paper is, in plain language, before any theory. */
  whatItIs: string;
  /** Estimated reading time for the theory curriculum, in minutes. */
  theoryMinutes: number;
  lineage: PaperLineage;
  /** First-principles curriculum: learn the ideas before reading the paper. */
  theory: PaperSection[];
  /** Reading guide for the paper itself: problem, key idea, evidence, limits. */
  paper: PaperSection[];
  /** Implementation-flavored checks, self-graded. */
  questions: PaperQuestion[];
  practice?: PaperPractice;
  /** Build-it-yourself project suggested by the paper. */
  project?: PaperProject;
}
