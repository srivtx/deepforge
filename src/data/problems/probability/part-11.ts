import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "pr-361",
    title: "Uniform PDF Value",
    category: "Probability",
    difficulty: "Easy",
    description:
      "The uniform density on [a, b] is 1 / (b - a) inside the interval and 0 outside.\n\nGiven x, a, and b > a, return the density.",
    starterCode: `def uniform_pdf_value(x, a, b):
    # Your code here
    pass`,
    solution: `def uniform_pdf_value(x, a, b):
    if x < a or x > b:
        return 0.0
    return 1.0 / (b - a)`,
    testCases: [
      { input: [0.5, 0, 1], expected: 1.0 },
      { input: [0.0, 0, 2], expected: 0.5 },
      { input: [-1.0, 0, 2], expected: 0.0 },
    ],
    hint: "The density is constant inside and zero outside.",
  },
  {
    id: "pr-362",
    title: "Uniform CDF Value",
    category: "Probability",
    difficulty: "Easy",
    description:
      "The uniform CDF on [a, b] is 0 for x < a, (x - a) / (b - a) in between, and 1 for x > b.\n\nGiven x, a, and b > a, return the CDF value.",
    starterCode: `def uniform_cdf_value(x, a, b):
    # Your code here
    pass`,
    solution: `def uniform_cdf_value(x, a, b):
    if x <= a:
        return 0.0
    if x >= b:
        return 1.0
    return (x - a) / (b - a)`,
    testCases: [
      { input: [0.5, 0, 1], expected: 0.5 },
      { input: [0.0, 0, 2], expected: 0.0 },
      { input: [3.0, 0, 2], expected: 1.0 },
    ],
    hint: "It rises linearly from zero to one.",
  },
  {
    id: "pr-363",
    title: "Exponential PDF Value",
    category: "Probability",
    difficulty: "Easy",
    description:
      "The exponential density with rate lambda is lambda * exp(-lambda x) for x >= 0 and 0 otherwise.\n\nGiven x and the rate, return the density.",
    starterCode: `def exponential_pdf_value(x, rate):
    # Your code here
    pass`,
    solution: `def exponential_pdf_value(x, rate):
    import math
    if x < 0:
        return 0.0
    return rate * math.exp(-rate * x)`,
    testCases: [
      { input: [1.0, 2.0], expected: 0.2706705664732254 },
      { input: [0.0, 0.5], expected: 0.5 },
      { input: [-1.0, 1.0], expected: 0.0 },
    ],
    hint: "The density is largest at zero.",
  },
  {
    id: "pr-364",
    title: "Exponential Moments Mean Variance",
    category: "Probability",
    difficulty: "Easy",
    description:
      "The exponential distribution with rate lambda has mean 1 / lambda and variance 1 / lambda^2.\n\nGiven the rate, return [mean, variance].",
    starterCode: `def exponential_moments_mean_variance(rate):
    # Your code here
    pass`,
    solution: `def exponential_moments_mean_variance(rate):
    return [1.0 / rate, 1.0 / (rate * rate)]`,
    testCases: [
      { input: [2.0], expected: [0.5, 0.25] },
      { input: [0.5], expected: [2.0, 4.0] },
      { input: [10.0], expected: [0.1, 0.01] },
    ],
    hint: "Both moments are powers of the reciprocal rate.",
  },
  {
    id: "pr-365",
    title: "Lognormal Mean Value",
    category: "Probability",
    difficulty: "Medium",
    description:
      "If log X is normal with mean mu and standard deviation sigma, then E[X] = exp(mu + sigma^2 / 2).\n\nGiven mu and sigma, return the mean.",
    starterCode: `def lognormal_mean_value(mu, sigma):
    # Your code here
    pass`,
    solution: `def lognormal_mean_value(mu, sigma):
    import math
    return math.exp(mu + sigma * sigma / 2.0)`,
    testCases: [
      { input: [0.0, 1.0], expected: 1.6487212707001282 },
      { input: [1.0, 0.5], expected: 3.080216848918031 },
      { input: [0.0, 0.0], expected: 1.0 },
    ],
    hint: "The mean is shifted above exp(mu) by half the log-variance.",
  },
  {
    id: "pr-366",
    title: "Lognormal Median Value",
    category: "Probability",
    difficulty: "Medium",
    description:
      "The lognormal median is exp(mu), since the median of the underlying normal is mu.\n\nGiven mu, return the median.",
    starterCode: `def lognormal_median_value(mu):
    # Your code here
    pass`,
    solution: `def lognormal_median_value(mu):
    import math
    return math.exp(mu)`,
    testCases: [
      { input: [0.0], expected: 1.0 },
      { input: [1.0], expected: 2.718281828459045 },
      { input: [-2.0], expected: 0.1353352832366127 },
    ],
    hint: "Monotone transforms preserve medians.",
  },
  {
    id: "pr-367",
    title: "Lognormal Variance Value",
    category: "Probability",
    difficulty: "Medium",
    description:
      "The lognormal variance is (exp(sigma^2) - 1) * exp(2 mu + sigma^2).\n\nGiven mu and sigma, return the variance.",
    starterCode: `def lognormal_variance_value(mu, sigma):
    # Your code here
    pass`,
    solution: `def lognormal_variance_value(mu, sigma):
    import math
    return (math.exp(sigma * sigma) - 1.0) * math.exp(2.0 * mu + sigma * sigma)`,
    testCases: [
      { input: [0.0, 1.0], expected: 4.670774270471604 },
      { input: [1.0, 0.5], expected: 2.694758124344947 },
      { input: [0.0, 0.0], expected: 0.0 },
    ],
    hint: "It factors through the second moment minus the squared mean.",
  },
  {
    id: "pr-368",
    title: "Laplace Moments Mean Variance",
    category: "Probability",
    difficulty: "Easy",
    description:
      "The Laplace distribution with location mu and scale b has mean mu and variance 2 b^2.\n\nGiven mu and b, return [mean, variance].",
    starterCode: `def laplace_moments_mean_variance(mu, b):
    # Your code here
    pass`,
    solution: `def laplace_moments_mean_variance(mu, b):
    return [mu, 2.0 * b * b]`,
    testCases: [
      { input: [0.0, 1.0], expected: [0.0, 2.0] },
      { input: [2.0, 0.5], expected: [2.0, 0.5] },
      { input: [-1.0, 3.0], expected: [-1.0, 18.0] },
    ],
    hint: "The scale enters the variance quadratically.",
  },
  {
    id: "pr-369",
    title: "Gamma Moments Mean Variance",
    category: "Probability",
    difficulty: "Medium",
    description:
      "A Gamma distribution with shape k and rate theta has mean k / theta and variance k / theta^2.\n\nGiven the shape and rate, return [mean, variance].",
    starterCode: `def gamma_moments_mean_variance(shape, rate):
    # Your code here
    pass`,
    solution: `def gamma_moments_mean_variance(shape, rate):
    return [shape / rate, shape / (rate * rate)]`,
    testCases: [
      { input: [2, 1], expected: [2.0, 2.0] },
      { input: [4, 2], expected: [2.0, 1.0] },
      { input: [1, 0.5], expected: [2.0, 4.0] },
    ],
    hint: "Both moments scale linearly with the shape.",
  },
  {
    id: "pr-370",
    title: "Beta Second Moment",
    category: "Probability",
    difficulty: "Hard",
    description:
      "For a Beta(a, b) distribution, E[X^2] = a (a + 1) / ((a + b)(a + b + 1)).\n\nGiven a and b, return the second moment.",
    starterCode: `def beta_second_moment(a, b):
    # Your code here
    pass`,
    solution: `def beta_second_moment(a, b):
    return a * (a + 1.0) / ((a + b) * (a + b + 1.0))`,
    testCases: [
      { input: [2, 2], expected: 0.3 },
      { input: [1, 1], expected: 0.3333333333333333 },
      { input: [5, 2], expected: 0.5357142857142857 },
    ],
    hint: "Shift the first parameter in both the numerator and the total.",
  },
  {
    id: "pr-371",
    title: "Discrete Expectation Value",
    category: "Probability",
    difficulty: "Medium",
    description:
      "The expectation of a discrete variable is sum_i x_i p_i.\n\nGiven the values and their probabilities (which sum to one), return E[X].",
    starterCode: `def discrete_expectation_value(values, probs):
    # Your code here
    pass`,
    solution: `def discrete_expectation_value(values, probs):
    return sum(v * p for v, p in zip(values, probs))`,
    testCases: [
      { input: [[0, 1], [0.5, 0.5]], expected: 0.5 },
      { input: [[1, 2, 3], [0.2, 0.5, 0.3]], expected: 2.1 },
      { input: [[-1, 0, 1], [0.25, 0.5, 0.25]], expected: 0.0 },
    ],
    hint: "Weight each value by its probability.",
  },
  {
    id: "pr-372",
    title: "Variance from Second Moment",
    category: "Probability",
    difficulty: "Medium",
    description:
      "The variance equals the second moment minus the squared mean: Var(X) = E[X^2] - (E[X])^2.\n\nGiven the second moment and the mean, return the variance.",
    starterCode: `def variance_from_second_moment(second_moment, mean):
    # Your code here
    pass`,
    solution: `def variance_from_second_moment(second_moment, mean):
    return second_moment - mean * mean`,
    testCases: [
      { input: [2.0, 1.0], expected: 1.0 },
      { input: [5.0, 2.0], expected: 1.0 },
      { input: [0.0, 0.0], expected: 0.0 },
    ],
    hint: "Center the second moment on the mean.",
  },
  {
    id: "pr-373",
    title: "Linearity of Expectation Sum",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Expectation is linear: E[X1 + ... + Xn] = sum_i E[Xi] regardless of dependence.\n\nGiven the list of means, return the mean of the sum.",
    starterCode: `def linearity_of_expectation_sum(means):
    # Your code here
    pass`,
    solution: `def linearity_of_expectation_sum(means):
    return sum(means)`,
    testCases: [
      { input: [[1, 2, 3]], expected: 6 },
      { input: [[0.0, 0.0]], expected: 0.0 },
      { input: [[-1, 1]], expected: 0 },
    ],
    hint: "No independence assumption is needed.",
  },
  {
    id: "pr-374",
    title: "Variance of Independent Linear Combination",
    category: "Probability",
    difficulty: "Medium",
    description:
      "For independent X and Y, Var(a X + b Y) = a^2 Var(X) + b^2 Var(Y).\n\nGiven a, Var(X), b, and Var(Y), return the variance.",
    starterCode: `def variance_of_independent_linear_combination(a, var_x, b, var_y):
    # Your code here
    pass`,
    solution: `def variance_of_independent_linear_combination(a, var_x, b, var_y):
    return a * a * var_x + b * b * var_y`,
    testCases: [
      { input: [2.0, 1.0, 3.0, 1.0], expected: 13.0 },
      { input: [1.0, 4.0, -1.0, 2.0], expected: 6.0 },
      { input: [0.5, 8.0, 0.0, 5.0], expected: 2.0 },
    ],
    hint: "Square the coefficients so sign does not matter.",
  },
  {
    id: "pr-375",
    title: "Covariance from Joint Table",
    category: "Probability",
    difficulty: "Hard",
    description:
      "For a joint distribution given by pairs [x, y, p], the covariance is E[XY] - E[X] E[Y].\n\nGiven the list of [x, y, probability] rows, return the covariance.",
    starterCode: `def covariance_from_joint_table(rows):
    # Your code here
    pass`,
    solution: `def covariance_from_joint_table(rows):
    ex = sum(x * p for x, y, p in rows)
    ey = sum(y * p for x, y, p in rows)
    exy = sum(x * y * p for x, y, p in rows)
    return exy - ex * ey`,
    testCases: [
      { input: [[[0, 0, 0.25], [0, 1, 0.25], [1, 0, 0.25], [1, 1, 0.25]]], expected: 0.0 },
      { input: [[[1, 2, 0.5], [3, 4, 0.5]]], expected: 1.0 },
      { input: [[[1, 1, 0.5], [2, 4, 0.5]]], expected: 0.75 },
    ],
    hint: "Compute the two expectations and the cross expectation first.",
  },
  {
    id: "pr-376",
    title: "Correlation from Covariance",
    category: "Probability",
    difficulty: "Medium",
    description:
      "The correlation coefficient is Cov(X, Y) / (sigma_X sigma_Y).\n\nGiven the covariance and the two standard deviations (positive), return the correlation.",
    starterCode: `def correlation_from_covariance(cov, sigma_x, sigma_y):
    # Your code here
    pass`,
    solution: `def correlation_from_covariance(cov, sigma_x, sigma_y):
    return cov / (sigma_x * sigma_y)`,
    testCases: [
      { input: [2.0, 1.0, 2.0], expected: 1.0 },
      { input: [0.0, 3.0, 1.0], expected: 0.0 },
      { input: [-1.0, 1.0, 1.0], expected: -1.0 },
    ],
    hint: "It normalizes away the scales.",
  },
  {
    id: "pr-377",
    title: "Variance of Sample Mean",
    category: "Probability",
    difficulty: "Easy",
    description:
      "For n independent observations with variance sigma^2, the sample mean has variance sigma^2 / n.\n\nGiven sigma and n, return the variance of the sample mean.",
    starterCode: `def variance_of_sample_mean(sigma, n):
    # Your code here
    pass`,
    solution: `def variance_of_sample_mean(sigma, n):
    return sigma * sigma / n`,
    testCases: [
      { input: [2.0, 4], expected: 1.0 },
      { input: [1.0, 100], expected: 0.01 },
      { input: [10.0, 25], expected: 4.0 },
    ],
    hint: "Averaging shrinks variance by the sample size.",
  },
  {
    id: "pr-378",
    title: "Conditional Expectation Discrete Table",
    category: "Probability",
    difficulty: "Hard",
    description:
      "For a joint distribution given as [x, y, probability] rows, E[X | Y = y0] = sum_{rows with y = y0} x p / sum_{rows with y = y0} p.\n\nGiven the rows and the target y0, return the conditional expectation.",
    starterCode: `def conditional_expectation_discrete_table(rows, target_y):
    # Your code here
    pass`,
    solution: `def conditional_expectation_discrete_table(rows, target_y):
    selected = [(x, p) for x, y, p in rows if y == target_y]
    total = sum(p for x, p in selected)
    return sum(x * p for x, p in selected) / total`,
    testCases: [
      { input: [[[0, 0, 0.25], [1, 0, 0.25], [0, 1, 0.25], [3, 1, 0.25]], 0], expected: 0.5 },
      { input: [[[2, 0, 0.1], [4, 0, 0.4], [1, 1, 0.5]], 1], expected: 1.0 },
      { input: [[[3, 2, 0.5], [1, 2, 0.5]], 2], expected: 2.0 },
    ],
    hint: "Restrict to the matching rows and renormalize.",
  },
  {
    id: "pr-379",
    title: "Law of Total Expectation Two Cases",
    category: "Probability",
    difficulty: "Medium",
    description:
      "For the partition {A, not A}: E[X] = E[X | A] P(A) + E[X | not A] P(not A).\n\nGiven the two conditional expectations and P(A), return E[X].",
    starterCode: `def law_of_total_expectation_two_cases(mean_given_a, p_a, mean_given_not_a):
    # Your code here
    pass`,
    solution: `def law_of_total_expectation_two_cases(mean_given_a, p_a, mean_given_not_a):
    return mean_given_a * p_a + mean_given_not_a * (1.0 - p_a)`,
    testCases: [
      { input: [10.0, 0.3, 2.0], expected: 4.4 },
      { input: [5.0, 0.5, 5.0], expected: 5.0 },
      { input: [0.0, 0.8, 100.0], expected: 19.999999999999996 },
    ],
    hint: "Average the conditional means with the partition probabilities.",
  },
  {
    id: "pr-380",
    title: "Tower Property Nested Expectations",
    category: "Probability",
    difficulty: "Hard",
    description:
      "By the tower property E[E[X | Y]] = E[X]. Given conditional means and the probabilities of the conditioning events, return the overall mean.\n\nGiven the conditional means and the probability weights, return the weighted average.",
    starterCode: `def tower_property_nested_expectations(conditional_means, weights):
    # Your code here
    pass`,
    solution: `def tower_property_nested_expectations(conditional_means, weights):
    return sum(m * w for m, w in zip(conditional_means, weights))`,
    testCases: [
      { input: [[2.0, 4.0], [0.5, 0.5]], expected: 3.0 },
      { input: [[0.0, 10.0, 20.0], [0.2, 0.3, 0.5]], expected: 13.0 },
      { input: [[-1.0, 1.0], [0.5, 0.5]], expected: 0.0 },
    ],
    hint: "Iterated expectation collapses to the marginal mean.",
  },
];
