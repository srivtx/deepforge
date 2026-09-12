import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "st-001",
    title: "Mean",
    category: "Statistics",
    difficulty: "Easy",
    description: "Compute the arithmetic mean of a list of numbers: sum(data) / len(data).",
    starterCode: `def mean(data):
    # Your code here
    pass`,
    solution: `def mean(data):
    if not data:
        return 0.0
    return sum(data) / len(data)`,
    testCases: [
      { input: [[1, 2, 3, 4, 5]], expected: 3.0 },
      { input: [[10, 20, 30]], expected: 20.0 },
      { input: [[7]], expected: 7.0 },
      { input: [[1, 1, 1, 1]], expected: 1.0 },
    ],
  },
  {
    id: "st-002",
    title: "Variance",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Compute the population variance of a list of numbers:\n\nvar = sum((x - mean)^2) / N",
    starterCode: `def variance(data):
    # Your code here
    pass`,
    solution: `def variance(data):
    n = len(data)
    if n == 0:
        return 0.0
    m = sum(data) / n
    return sum((x - m) ** 2 for x in data) / n`,
    testCases: [
      { input: [[1, 2, 3, 4, 5]], expected: 2.0 },
      { input: [[10, 10, 10]], expected: 0.0 },
      { input: [[1, 3]], expected: 1.0 },
      { input: [[0, 5]], expected: 6.25 },
    ],
    hint: "Don't forget to subtract the mean before squaring.",
  },
  {
    id: "st-003",
    title: "Covariance",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Compute the population covariance of two equal-length lists x and y:\n\ncov = sum((x_i - mean_x) * (y_i - mean_y)) / N",
    starterCode: `def covariance(x, y):
    # Your code here
    pass`,
    solution: `def covariance(x, y):
    n = len(x)
    if n == 0:
        return 0.0
    mx = sum(x) / n
    my = sum(y) / n
    return sum((xi - mx) * (yi - my) for xi, yi in zip(x, y)) / n`,
    testCases: [
      { input: [[1, 2, 3, 4], [2, 4, 6, 8]], expected: 2.5 },
      { input: [[1, 2, 3], [3, 2, 1]], expected: -0.6666666666666666 },
      { input: [[1, 2, 3], [1, 2, 3]], expected: 0.6666666666666666 },
    ],
    hint: "Positive when x and y move together; negative when they move opposite.",
  },
  {
    id: "st-004",
    title: "Pearson Correlation",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Compute the Pearson correlation coefficient between x and y:\n\nr = cov(x, y) / (std(x) * std(y))\n\nReturn 0.0 if either standard deviation is 0.",
    starterCode: `def pearson_correlation(x, y):
    # Your code here
    pass`,
    solution: `def pearson_correlation(x, y):
    n = len(x)
    if n == 0:
        return 0.0
    mx = sum(x) / n
    my = sum(y) / n
    num = sum((xi - mx) * (yi - my) for xi, yi in zip(x, y))
    den_x = sum((xi - mx) ** 2 for xi in x) ** 0.5
    den_y = sum((yi - my) ** 2 for yi in y) ** 0.5
    if den_x == 0 or den_y == 0:
        return 0.0
    return num / (den_x * den_y)`,
    testCases: [
      { input: [[1, 2, 3, 4], [2, 4, 6, 8]], expected: 1.0 },
      { input: [[1, 2, 3], [3, 2, 1]], expected: -1.0 },
      { input: [[1, 2, 3, 4, 5], [2, 4, 1, 3, 5]], expected: 0.5 },
      { input: [[5, 5, 5], [1, 2, 3]], expected: 0.0 },
    ],
    hint: "Covariance divided by the product of standard deviations. Range: [-1, 1].",
  },
  {
    id: "st-005",
    title: "Normal Distribution PDF",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Compute the probability density function of a normal distribution with mean mu and standard deviation sigma at point x:\n\npdf(x) = (1 / (sigma * sqrt(2π))) * exp(-(x - mu)^2 / (2 * sigma^2))\n\nIf sigma <= 0, return 0.0.",
    starterCode: `import math
def normal_pdf(x, mu, sigma):
    # Your code here
    pass`,
    solution: `import math
def normal_pdf(x, mu, sigma):
    if sigma <= 0:
        return 0.0
    coeff = 1.0 / (sigma * (2 * math.pi) ** 0.5)
    exponent = -((x - mu) ** 2) / (2 * sigma * sigma)
    return coeff * math.exp(exponent)`,
    testCases: [
      { input: [0, 0, 1], expected: 0.3989422804014327 },
      { input: [1, 0, 1], expected: 0.24197072451914337 },
      { input: [0, 0, 2], expected: 0.19947114020071635 },
      { input: [5, 5, 1], expected: 0.3989422804014327 },
      { input: [0, 0, 0], expected: 0.0 },
    ],
    hint: "Don't forget to square sigma in the denominator of the exponent.",
  },
];
