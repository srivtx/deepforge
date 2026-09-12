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
      "Six easy openers from across the curriculum — matrices, stats, probability, text, information, and pixels. Find your rhythm and bank a quick score.",
    durationMinutes: 10,
    problemIds: ["la-002", "st-001", "pr-002", "nlp-001", "info-001", "cv-001"],
  },
  {
    id: "linear-algebra-blitz",
    title: "Linear Algebra Blitz",
    blurb:
      "Matrix products, norms, projections, and determinants, finishing with an adjugate and a QR solve. Ten problems, thirty minutes.",
    durationMinutes: 30,
    problemIds: [
      "la-001",
      "la-002",
      "la-005",
      "la-006",
      "la-007",
      "la-025",
      "la-009",
      "la-010",
      "la-043",
      "la-087",
    ],
  },
  {
    id: "probability-rapid-fire",
    title: "Probability Rapid Fire",
    blurb:
      "Factorials, combinations, permutations, and expectation, then Bayes against the clock. Short set, sharp thinking.",
    durationMinutes: 10,
    problemIds: ["pr-006", "pr-003", "pr-004", "pr-002", "pr-001"],
  },
  {
    id: "statistics-speedrun",
    title: "Statistics Speedrun",
    blurb:
      "Mean, variance, median, and mode, finishing on covariance. Five descriptive-statistics problems, one sitting.",
    durationMinutes: 15,
    problemIds: ["st-001", "st-002", "st-006", "st-007", "st-003"],
  },
  {
    id: "ml-fundamentals-gauntlet",
    title: "ML Fundamentals Gauntlet",
    blurb:
      "Sigmoid, entropy, Gini, KNN, and metrics, then three hard classics — k-means, tree splits, and the normal equation. The whole intro toolkit in one run.",
    durationMinutes: 60,
    problemIds: [
      "ml-002",
      "ml-006",
      "ml-007",
      "ml-016",
      "ml-004",
      "ml-009",
      "ml-010",
      "ml-003",
      "ml-005",
      "ml-011",
    ],
  },
  {
    id: "deep-learning-deep-dive",
    title: "Deep Learning Deep Dive",
    blurb:
      "ReLU and friends, a numerically stable softmax, an MLP forward pass, a conv layer, and a backprop gradient. The set ramps up fast.",
    durationMinutes: 30,
    problemIds: [
      "dl-001",
      "dl-002",
      "dl-006",
      "dl-007",
      "dl-003",
      "dl-004",
      "dl-022",
      "dl-005",
    ],
  },
  {
    id: "mixed-30",
    title: "Mixed 30",
    blurb:
      "A cross-category sampler from the full catalog: five easy openers, then five mediums spanning ML, RL, time series, vision, and optimization.",
    durationMinutes: 30,
    problemIds: [
      "la-005",
      "st-002",
      "nlp-004",
      "info-002",
      "graph-002",
      "ml-001",
      "rl-002",
      "ts-017",
      "cv-015",
      "op-001",
    ],
  },
  {
    id: "hard-mode",
    title: "Hard Mode",
    blurb:
      "Ten genuinely hard problems — Jacobians, k-means, tree splits, backprop, and Adam, plus hard cuts from vision, RL, forecasting, graphs, and information theory. No warm-up.",
    durationMinutes: 60,
    problemIds: [
      "ca-004",
      "ml-003",
      "ml-005",
      "dl-005",
      "op-004",
      "cv-033",
      "rl-003",
      "ts-037",
      "graph-037",
      "info-024",
    ],
  },
  {
    id: "vision-sprint",
    title: "Vision Sprint",
    blurb:
      "From RGB plumbing to interpolation: eight computer-vision problems, ending on bilinear sampling. Pixels in, numbers out.",
    durationMinutes: 20,
    problemIds: [
      "cv-001",
      "cv-002",
      "cv-003",
      "cv-041",
      "cv-042",
      "cv-015",
      "cv-016",
      "cv-033",
    ],
  },
  {
    id: "sequential-decisions",
    title: "Sequential Decisions",
    blurb:
      "Policy evaluation, extraction, and improvement, building to value iteration to convergence. Eight reinforcement-learning problems.",
    durationMinutes: 20,
    problemIds: [
      "rl-001",
      "rl-004",
      "rl-008",
      "rl-010",
      "rl-002",
      "rl-005",
      "rl-007",
      "rl-003",
    ],
  },
  {
    id: "forecast-lab",
    title: "Forecast Lab",
    blurb:
      "Differences, lags, and rolling statistics, capped by a Holt-Winters step. Eight time-series problems against the clock.",
    durationMinutes: 20,
    problemIds: [
      "ts-001",
      "ts-002",
      "ts-003",
      "ts-004",
      "ts-046",
      "ts-017",
      "ts-018",
      "ts-037",
    ],
  },
  {
    id: "graph-gauntlet",
    title: "Graph Gauntlet",
    blurb:
      "Build the graph, traverse it, then hunt cycles and bridges. Eight graph-algorithms problems from adjacency to bridges.",
    durationMinutes: 20,
    problemIds: [
      "graph-001",
      "graph-002",
      "graph-003",
      "graph-004",
      "graph-046",
      "graph-017",
      "graph-018",
      "graph-037",
    ],
  },
];
