export interface Contest {
  id: string;
  title: string;
  blurb: string;
  durationMinutes: number;
  problemIds: string[];
}

/**
 * Curated timed problem sets. Problem lists are ordered easy -> hard.
 * Every id must exist in src/data/problems.
 */
export const CONTESTS: Contest[] = [
  {
    id: "warm-up-sprint",
    title: "Warm-up Sprint",
    blurb:
      "Six easy openers from across the curriculum. Find your rhythm and bank a quick score.",
    durationMinutes: 10,
    problemIds: ["la-001", "la-002", "st-001", "pr-003", "nlp-001", "ml-002"],
  },
  {
    id: "linear-algebra-blitz",
    title: "Linear Algebra Blitz",
    blurb:
      "The full first batch of linear algebra, from dot products to matrix inverses. Ten problems, thirty minutes.",
    durationMinutes: 30,
    problemIds: [
      "la-001",
      "la-002",
      "la-003",
      "la-004",
      "la-005",
      "la-006",
      "la-008",
      "la-007",
      "la-009",
      "la-010",
    ],
  },
  {
    id: "probability-rapid-fire",
    title: "Probability Rapid Fire",
    blurb:
      "Counting, expectation, and Bayes against the clock. Short set, sharp thinking.",
    durationMinutes: 10,
    problemIds: ["pr-002", "pr-003", "pr-004", "pr-001", "pr-005"],
  },
  {
    id: "statistics-speedrun",
    title: "Statistics Speedrun",
    blurb:
      "From mean and variance to the normal PDF. Five descriptive-statistics problems, one sitting.",
    durationMinutes: 15,
    problemIds: ["st-001", "st-002", "st-003", "st-004", "st-005"],
  },
  {
    id: "ml-fundamentals-gauntlet",
    title: "ML Fundamentals Gauntlet",
    blurb:
      "The whole intro ML toolkit in one run — sigmoid, entropy, Gini, KNN, and two hard classics at the end.",
    durationMinutes: 60,
    problemIds: [
      "ml-002",
      "ml-006",
      "ml-007",
      "ml-008",
      "ml-001",
      "ml-004",
      "ml-009",
      "ml-010",
      "ml-003",
      "ml-005",
    ],
  },
  {
    id: "deep-learning-deep-dive",
    title: "Deep Learning Deep Dive",
    blurb:
      "Activations, softmax, an MLP forward pass, and a backprop gradient. The set ramps up fast.",
    durationMinutes: 30,
    problemIds: ["dl-001", "dl-002", "dl-003", "dl-004", "dl-005"],
  },
  {
    id: "mixed-30",
    title: "Mixed 30",
    blurb:
      "A cross-category sampler: five easy openers, then five mediums. A solid all-round test.",
    durationMinutes: 30,
    problemIds: [
      "la-005",
      "st-002",
      "nlp-004",
      "ml-008",
      "op-005",
      "la-009",
      "st-003",
      "nlp-005",
      "ml-009",
      "op-001",
    ],
  },
  {
    id: "hard-mode",
    title: "Hard Mode",
    blurb:
      "Seven genuinely hard problems — Jacobians, K-means, tree splits, and optimizers. No warm-up.",
    durationMinutes: 60,
    problemIds: [
      "ca-004",
      "ca-005",
      "ml-003",
      "ml-005",
      "dl-005",
      "op-002",
      "op-004",
    ],
  },
];
