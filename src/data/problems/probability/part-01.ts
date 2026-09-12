import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "pr-001",
    title: "Bayes Theorem",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Apply Bayes' theorem to compute P(A|B):\n\nP(A|B) = (P(B|A) * P(A)) / P(B)\n\nwhere P(B) = P(B|A) * P(A) + P(B|¬A) * P(¬A).\n\nInputs: P(A), P(B|A), P(B|¬A). Return 0.0 if P(B) is 0.",
    starterCode: `def bayes_theorem(p_a, p_b_given_a, p_b_given_not_a):
    # Your code here
    pass`,
    solution: `def bayes_theorem(p_a, p_b_given_a, p_b_given_not_a):
    p_not_a = 1 - p_a
    p_b = p_b_given_a * p_a + p_b_given_not_a * p_not_a
    if p_b == 0:
        return 0.0
    return (p_b_given_a * p_a) / p_b`,
    testCases: [
      { input: [0.01, 0.9, 0.05], expected: 0.15384615384615385 },
      { input: [0.5, 0.8, 0.2], expected: 0.8 },
      { input: [0.1, 1.0, 0.0], expected: 1.0 },
      { input: [0.0, 0.9, 0.1], expected: 0.0 },
    ],
    hint: "Total probability of B uses both branches (A and ¬A).",
  },
  {
    id: "pr-002",
    title: "Expected Value",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Compute the expected value of a discrete random variable:\n\nE[X] = sum(values[i] * probabilities[i])\n\nYou may assume the probabilities sum to 1.",
    starterCode: `def expected_value(values, probabilities):
    # Your code here
    pass`,
    solution: `def expected_value(values, probabilities):
    return sum(v * p for v, p in zip(values, probabilities))`,
    testCases: [
      { input: [[1, 2, 3, 4, 5, 6], [1/6, 1/6, 1/6, 1/6, 1/6, 1/6]], expected: 3.5 },
      { input: [[0, 1], [0.5, 0.5]], expected: 0.5 },
      { input: [[10, 0], [0.1, 0.9]], expected: 1.0 },
    ],
  },
  {
    id: "pr-003",
    title: "Combinations (nCr)",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Compute the number of ways to choose r items from n items without regard to order:\n\nC(n, r) = n! / (r! * (n-r)!)\n\nReturn 0 if r < 0 or r > n.",
    starterCode: `def combinations(n, r):
    # Your code here
    pass`,
    solution: `def combinations(n, r):
    if r < 0 or r > n:
        return 0
    if r == 0 or r == n:
        return 1
    r = min(r, n - r)
    result = 1
    for i in range(r):
        result = result * (n - i) // (i + 1)
    return result`,
    testCases: [
      { input: [5, 2], expected: 10 },
      { input: [10, 3], expected: 120 },
      { input: [7, 0], expected: 1 },
      { input: [0, 0], expected: 1 },
      { input: [5, 6], expected: 0 },
    ],
    hint: "Use the multiplicative formula: product of (n-i)/(i+1) for i in [0, r).",
  },
  {
    id: "pr-004",
    title: "Permutations (nPr)",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Compute the number of ways to arrange r items from n items (order matters):\n\nP(n, r) = n! / (n-r)!\n\nReturn 0 if r < 0 or r > n.",
    starterCode: `def permutations(n, r):
    # Your code here
    pass`,
    solution: `def permutations(n, r):
    if r < 0 or r > n:
        return 0
    result = 1
    for i in range(n, n - r, -1):
        result *= i
    return result`,
    testCases: [
      { input: [5, 2], expected: 20 },
      { input: [10, 3], expected: 720 },
      { input: [5, 0], expected: 1 },
      { input: [5, 5], expected: 120 },
      { input: [3, 5], expected: 0 },
    ],
    hint: "Product of the top r terms of n!: n * (n-1) * ... * (n-r+1).",
  },
  {
    id: "pr-005",
    title: "Variance of Discrete RV",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Compute the variance of a discrete random variable:\n\nVar(X) = sum((v_i - E[X])^2 * p_i)\n\nwhere E[X] = sum(v_i * p_i).",
    starterCode: `def variance_discrete_rv(values, probabilities):
    # Your code here
    pass`,
    solution: `def variance_discrete_rv(values, probabilities):
    exp_val = sum(v * p for v, p in zip(values, probabilities))
    return sum((v - exp_val) ** 2 * p for v, p in zip(values, probabilities))`,
    testCases: [
      { input: [[1, 2, 3, 4, 5, 6], [1/6, 1/6, 1/6, 1/6, 1/6, 1/6]], expected: 2.9166666666666665 },
      { input: [[0, 1], [0.5, 0.5]], expected: 0.25 },
      { input: [[5, 5, 5], [1/3, 1/3, 1/3]], expected: 0.0 },
    ],
    hint: "E[X^2] - (E[X])^2 also works, but the direct definition is cleaner here.",
  },
];
