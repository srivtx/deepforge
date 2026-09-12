import type { LearningPath } from "@/types/problem";

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: "math-foundations",
    title: "Math Foundations",
    description:
      "Build the linear algebra, calculus, statistics, and probability intuition you need before touching ML. Start with vectors and matrices, end with Hessians and Bayes.",
    problemIds: [
      "la-004", "la-001", "la-002", "la-003",
      "la-006", "la-005", "la-008", "la-007",
      "st-001", "st-002", "st-003", "st-004", "st-005",
      "pr-002", "pr-003", "pr-004", "pr-001", "pr-005",
      "ca-001", "ca-003", "ca-002", "ca-004", "ca-005",
    ],
    estimatedHours: 8,
  },
  {
    id: "ml-from-scratch",
    title: "ML From Scratch",
    description:
      "Implement the classic ML algorithms with no libraries. Linear regression, k-means, k-NN, decision trees, and the metrics that tell you if they work.",
    problemIds: [
      "ml-006", "ml-007", "ml-008", "ml-001",
      "ml-002", "ml-009", "ml-010",
      "ml-004", "ml-003", "ml-005",
    ],
    estimatedHours: 6,
  },
  {
    id: "deep-learning-essentials",
    title: "Deep Learning Essentials",
    description:
      "Activations, forward pass, backprop. Build the primitives that every framework gives you, then chain them into a real MLP.",
    problemIds: [
      "dl-001", "ml-002", "dl-002", "dl-003",
      "dl-004", "dl-005",
      "nlp-001", "nlp-002", "nlp-004", "nlp-005", "nlp-003",
    ],
    estimatedHours: 5,
  },
  {
    id: "optimization-mastery",
    title: "Optimization Mastery",
    description:
      "How models actually learn. From vanilla GD through momentum to Adam, plus the LR schedules that decide whether training converges.",
    problemIds: [
      "op-005",
      "ca-001", "ca-002",
      "op-001", "op-003", "op-004", "op-002",
    ],
    estimatedHours: 4,
  },
];
