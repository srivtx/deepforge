import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "st-381",
    title: "Normal CDF Value",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "The normal CDF is Phi((x - mu) / sigma) = 0.5 * (1 + erf((x - mu) / (sigma * sqrt(2)))).\n\nGiven x, mu, and sigma > 0, return the probability P(X <= x).",
    starterCode: `def normal_cdf_value(x, mu, sigma):
    # Your code here
    pass`,
    solution: `def normal_cdf_value(x, mu, sigma):
    import math
    return 0.5 * (1.0 + math.erf((x - mu) / (sigma * math.sqrt(2.0))))`,
    testCases: [
      { input: [0.0, 0.0, 1.0], expected: 0.5 },
      { input: [1.96, 0, 1], expected: 0.9750021048517796 },
      { input: [10.0, 8.0, 2.0], expected: 0.8413447460685429 },
    ],
    hint: "Center and scale, then use the error function.",
  },
  {
    id: "st-382",
    title: "Standard Normal Quantile by Bisection",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Invert the standard normal CDF by bisection on [-10, 10]: repeatedly halve the interval according to whether Phi(mid) is below or above p.\n\nGiven p in (0, 1), use 200 bisection iterations and return the resulting z.",
    starterCode: `def standard_normal_quantile_by_bisection(p):
    # Your code here
    pass`,
    solution: `def standard_normal_quantile_by_bisection(p):
    import math
    lo, hi = -10.0, 10.0
    for _ in range(200):
        mid = 0.5 * (lo + hi)
        cdf = 0.5 * (1.0 + math.erf(mid / math.sqrt(2.0)))
        if cdf < p:
            lo = mid
        else:
            hi = mid
    return 0.5 * (lo + hi)`,
    testCases: [
      { input: [0.5], expected: -6.95729106167942e-17 },
      { input: [0.975], expected: 1.9599639845400532 },
      { input: [0.1], expected: -1.2815515655446004 },
    ],
    hint: "Bisection converges to machine precision in far fewer than 200 steps.",
  },
  {
    id: "st-383",
    title: "Binomial PMF Value",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "The binomial pmf is C(n, k) p^k (1 - p)^(n - k).\n\nGiven n, k, and p, return the probability of exactly k successes. Use math.comb for the binomial coefficient.",
    starterCode: `def binomial_pmf_value(n, k, p):
    # Your code here
    pass`,
    solution: `def binomial_pmf_value(n, k, p):
    import math
    return math.comb(n, k) * p ** k * (1.0 - p) ** (n - k)`,
    testCases: [
      { input: [10, 5, 0.5], expected: 0.24609375 },
      { input: [4, 0, 0.2], expected: 0.4096000000000001 },
      { input: [5, 2, 0.5], expected: 0.3125 },
    ],
    hint: "Exact k successes, not at most k.",
  },
  {
    id: "st-384",
    title: "Poisson PMF Value",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "The Poisson pmf is exp(-lambda) * lambda^k / k!.\n\nGiven the rate lambda and the count k, return the probability.",
    starterCode: `def poisson_pmf_value(lam, k):
    # Your code here
    pass`,
    solution: `def poisson_pmf_value(lam, k):
    import math
    return math.exp(-lam) * lam ** k / math.factorial(k)`,
    testCases: [
      { input: [2.0, 3], expected: 0.1804470443154836 },
      { input: [0.5, 0], expected: 0.6065306597126334 },
      { input: [1.0, 1], expected: 0.36787944117144233 },
    ],
    hint: "The exponential factor is outside the power and factorial.",
  },
  {
    id: "st-385",
    title: "Exponential CDF Value",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "The exponential CDF is F(x) = 1 - exp(-rate * x) for x >= 0 and 0 otherwise.\n\nGiven x and the rate, return the probability.",
    starterCode: `def exponential_cdf_value(x, rate):
    # Your code here
    pass`,
    solution: `def exponential_cdf_value(x, rate):
    import math
    if x < 0:
        return 0.0
    return 1.0 - math.exp(-rate * x)`,
    testCases: [
      { input: [1.0, 2.0], expected: 0.8646647167633873 },
      { input: [0.0, 5.0], expected: 0.0 },
      { input: [-1.0, 1.0], expected: 0.0 },
    ],
    hint: "The support starts at zero.",
  },
  {
    id: "st-386",
    title: "Uniform Distribution Variance",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "The variance of a uniform distribution on [a, b] is (b - a)^2 / 12.\n\nGiven a and b, return the variance.",
    starterCode: `def uniform_distribution_variance(a, b):
    # Your code here
    pass`,
    solution: `def uniform_distribution_variance(a, b):
    return (b - a) ** 2 / 12.0`,
    testCases: [
      { input: [0, 1], expected: 0.08333333333333333 },
      { input: [-2, 2], expected: 1.3333333333333333 },
      { input: [3, 6], expected: 0.75 },
    ],
    hint: "The width squared sets the scale.",
  },
  {
    id: "st-387",
    title: "Beta Density at Point",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "The beta pdf is x^(a - 1) (1 - x)^(b - 1) / B(a, b) with B(a, b) = Gamma(a) Gamma(b) / Gamma(a + b).\n\nGiven x in (0, 1), a, and b, return the density using math.gamma.",
    starterCode: `def beta_pdf_value(x, a, b):
    # Your code here
    pass`,
    solution: `def beta_pdf_value(x, a, b):
    import math
    beta = math.gamma(a) * math.gamma(b) / math.gamma(a + b)
    return x ** (a - 1.0) * (1.0 - x) ** (b - 1.0) / beta`,
    testCases: [
      { input: [0.5, 2, 2], expected: 1.5 },
      { input: [0.25, 1, 1], expected: 1.0 },
      { input: [0.8, 5, 2], expected: 2.4576 },
    ],
    hint: "The normalizing constant is the beta function.",
  },
  {
    id: "st-388",
    title: "Method of Moments Gamma Parameters",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Matching the first two moments of a Gamma distribution gives shape = mean^2 / variance and scale = variance / mean.\n\nGiven the sample mean and variance, return [shape, scale].",
    starterCode: `def method_of_moments_gamma_parameters(mean, variance):
    # Your code here
    pass`,
    solution: `def method_of_moments_gamma_parameters(mean, variance):
    return [mean * mean / variance, variance / mean]`,
    testCases: [
      { input: [2.0, 4.0], expected: [1.0, 2.0] },
      { input: [10.0, 5.0], expected: [20.0, 0.5] },
      { input: [1.0, 0.25], expected: [4.0, 0.25] },
    ],
    hint: "Gamma mean is shape * scale and variance is shape * scale^2.",
  },
  {
    id: "st-389",
    title: "Normal MLE Sigma Known Mean",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "With the mean known, the maximum likelihood estimate of sigma is sqrt(mean_i (x_i - mu)^2) using n rather than n - 1.\n\nGiven the values and the known mean, return the MLE of sigma.",
    starterCode: `def normal_mle_sigma_known_mean(values, mu):
    # Your code here
    pass`,
    solution: `def normal_mle_sigma_known_mean(values, mu):
    return (sum((v - mu) ** 2 for v in values) / len(values)) ** 0.5`,
    testCases: [
      { input: [[1, 3], 2], expected: 1.0 },
      { input: [[2, 4, 4, 2], 3], expected: 1.0 },
      { input: [[0], 0], expected: 0.0 },
    ],
    hint: "The MLE divides by n, unlike the unbiased sample standard deviation.",
  },
  {
    id: "st-390",
    title: "Exponential MLE Rate",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "The maximum likelihood estimate of the exponential rate is n / sum(x_i), the reciprocal of the sample mean.\n\nGiven the sample values (all positive), return the rate estimate.",
    starterCode: `def exponential_mle_rate(values):
    # Your code here
    pass`,
    solution: `def exponential_mle_rate(values):
    return len(values) / sum(values)`,
    testCases: [
      { input: [[1.0, 3.0]], expected: 0.5 },
      { input: [[2.0, 2.0]], expected: 0.5 },
      { input: [[0.5, 1.0, 1.5]], expected: 1.0 },
    ],
    hint: "Invert the sample mean.",
  },
  {
    id: "st-391",
    title: "Uniform MLE Upper Bound",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "For a uniform distribution on [0, theta], the maximum likelihood estimate of theta is the sample maximum.\n\nGiven the sample values, return the MLE.",
    starterCode: `def uniform_mle_upper_bound(values):
    # Your code here
    pass`,
    solution: `def uniform_mle_upper_bound(values):
    return max(values)`,
    testCases: [
      { input: [[1, 5, 3]], expected: 5 },
      { input: [[0.5]], expected: 0.5 },
      { input: [[2, 2]], expected: 2 },
    ],
    hint: "The likelihood increases with theta until the largest observation.",
  },
  {
    id: "st-392",
    title: "MLE Bernoulli Standard Error",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "The standard error of the Bernoulli success-probability MLE is sqrt(p_hat (1 - p_hat) / n), the square root of the inverse Fisher information.\n\nGiven p_hat and n, return the standard error.",
    starterCode: `def mle_bernoulli_standard_error(p_hat, n):
    # Your code here
    pass`,
    solution: `def mle_bernoulli_standard_error(p_hat, n):
    return (p_hat * (1.0 - p_hat) / n) ** 0.5`,
    testCases: [
      { input: [0.5, 100], expected: 0.05 },
      { input: [0.2, 50], expected: 0.05656854249492381 },
      { input: [0.9, 10], expected: 0.09486832980505137 },
    ],
    hint: "The variance of the score determines the asymptotic standard error.",
  },
  {
    id: "st-393",
    title: "Kolmogorov Smirnov Statistic",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Given the empirical CDF values and the hypothesized CDF values at the same sorted points, the Kolmogorov-Smirnov statistic is the maximum absolute difference max_i |F_n(x_i) - F_0(x_i)|.\n\nGiven both lists, return the statistic.",
    starterCode: `def kolmogorov_smirnov_statistic(empirical, hypothesized):
    # Your code here
    pass`,
    solution: `def kolmogorov_smirnov_statistic(empirical, hypothesized):
    return max(abs(a - b) for a, b in zip(empirical, hypothesized))`,
    testCases: [
      { input: [[0.2, 0.6, 1.0], [0.25, 0.5, 0.75]], expected: 0.25 },
      { input: [[0.5, 1.0], [0.5, 1.0]], expected: 0.0 },
      { input: [[0.1, 0.4], [0.5, 0.5]], expected: 0.4 },
    ],
    hint: "Compare pointwise and take the largest gap.",
  },
  {
    id: "st-394",
    title: "Mann Whitney U Statistic",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Given the combined ranks of the first sample (ties resolved externally) and its size n1, the Mann-Whitney statistic is U1 = sum(ranks of sample 1) - n1 (n1 + 1) / 2.\n\nGiven the rank list and n1, return U1.",
    starterCode: `def mann_whitney_u_statistic(ranks, n1):
    # Your code here
    pass`,
    solution: `def mann_whitney_u_statistic(ranks, n1):
    return sum(ranks) - n1 * (n1 + 1) / 2.0`,
    testCases: [
      { input: [[1, 3], 2], expected: 1.0 },
      { input: [[2, 4], 2], expected: 3.0 },
      { input: [[1, 2, 3], 3], expected: 0.0 },
    ],
    hint: "Subtract the minimum possible rank sum from the observed rank sum.",
  },
  {
    id: "st-395",
    title: "Wilcoxon Signed Rank Sum",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Rank the absolute differences ascending, assigning average ranks to ties, then sum the ranks of the positive differences.\n\nGiven the differences (none zero), return the positive signed-rank sum.",
    starterCode: `def wilcoxon_signed_rank_sum(differences):
    # Your code here
    pass`,
    solution: `def wilcoxon_signed_rank_sum(differences):
    n = len(differences)
    pairs = sorted(range(n), key=lambda i: abs(differences[i]))
    ranks = [0.0] * n
    i = 0
    while i < n:
        j = i
        while j + 1 < n and abs(differences[pairs[j + 1]]) == abs(differences[pairs[i]]):
            j += 1
        avg = (i + 1 + j + 1) / 2.0
        for k in range(i, j + 1):
            ranks[pairs[k]] = avg
        i = j + 1
    return sum(ranks[i] for i in range(n) if differences[i] > 0)`,
    testCases: [
      { input: [[1, -2, 3]], expected: 4.0 },
      { input: [[1, 1, -1]], expected: 4.0 },
      { input: [[2, -1, -3, 4]], expected: 6.0 },
    ],
    hint: "Tied magnitudes share the average of the positions they span.",
  },
  {
    id: "st-396",
    title: "Sign Test Positive Count",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "The sign test statistic counts how many paired differences are strictly positive.\n\nGiven the differences, return the count of positive values.",
    starterCode: `def sign_test_positive_count(differences):
    # Your code here
    pass`,
    solution: `def sign_test_positive_count(differences):
    return sum(1 for d in differences if d > 0)`,
    testCases: [
      { input: [[1, -2, 3]], expected: 2 },
      { input: [[-1, -2]], expected: 0 },
      { input: [[0, 0, 1]], expected: 1 },
    ],
    hint: "Zero differences are not signs and are excluded.",
  },
  {
    id: "st-397",
    title: "Bootstrap Percentile Interval",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "The percentile bootstrap interval takes the alpha/2 and 1 - alpha/2 quantiles of the sorted bootstrap statistics, using linear interpolation with position (n - 1) p.\n\nGiven the sorted statistics and alpha, return [lower, upper].",
    starterCode: `def bootstrap_percentile_interval(sorted_stats, alpha):
    # Your code here
    pass`,
    solution: `def bootstrap_percentile_interval(sorted_stats, alpha):
    n = len(sorted_stats)
    def quantile(p):
        pos = (n - 1) * p
        lo = int(pos)
        hi = min(lo + 1, n - 1)
        frac = pos - lo
        return sorted_stats[lo] * (1.0 - frac) + sorted_stats[hi] * frac
    return [quantile(alpha / 2.0), quantile(1.0 - alpha / 2.0)]`,
    testCases: [
      { input: [[1.0, 2.0, 3.0, 4.0, 5.0], 0.2], expected: [1.4, 4.6] },
      { input: [[0.0, 1.0], 0.5], expected: [0.25, 0.75] },
      { input: [[-2.0, 0.0, 2.0], 0.1], expected: [-1.8, 1.7999999999999998] },
    ],
    hint: "Interpolate between the two neighboring order statistics.",
  },
  {
    id: "st-398",
    title: "Jackknife Standard Error",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Given leave-one-out estimates theta_i, the jackknife standard error is sqrt((n - 1) / n * sum_i (theta_i - mean(theta))^2).\n\nGiven the estimates, return the standard error.",
    starterCode: `def jackknife_standard_error(estimates):
    # Your code here
    pass`,
    solution: `def jackknife_standard_error(estimates):
    n = len(estimates)
    mean = sum(estimates) / n
    return ((n - 1.0) / n * sum((t - mean) ** 2 for t in estimates)) ** 0.5`,
    testCases: [
      { input: [[1.0, 2.0, 3.0]], expected: 1.1547005383792515 },
      { input: [[5.0, 5.0]], expected: 0.0 },
      { input: [[0.5, 0.6, 0.7, 0.8]], expected: 0.19364916731037085 },
    ],
    hint: "The n - 1 factor compensates for leave-one-out dependence.",
  },
  {
    id: "st-399",
    title: "Trimmed Mean with Fixed Count",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "A symmetric trimmed mean with fixed count k removes the k smallest and k largest values, then averages the rest.\n\nGiven the values and k (with 2k < n), return the trimmed mean.",
    starterCode: `def trimmed_mean_with_fixed_count(values, k):
    # Your code here
    pass`,
    solution: `def trimmed_mean_with_fixed_count(values, k):
    ordered = sorted(values)
    kept = ordered[k:len(ordered) - k]
    return sum(kept) / len(kept)`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 1], expected: 3.0 },
      { input: [[1, 2, 3, 100], 1], expected: 2.5 },
      { input: [[0, 10], 0], expected: 5.0 },
    ],
    hint: "Sort first, then slice off both tails.",
  },
  {
    id: "st-400",
    title: "Spearman Rho from Rank Differences",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "With no tied ranks, Spearman's rho is 1 - 6 * sum(d_i^2) / (n (n^2 - 1)), where d_i are the differences between the two rank vectors.\n\nGiven the rank differences and n >= 2, return rho.",
    starterCode: `def spearman_rho_from_rank_differences(rank_diffs, n):
    # Your code here
    pass`,
    solution: `def spearman_rho_from_rank_differences(rank_diffs, n):
    return 1.0 - 6.0 * sum(d * d for d in rank_diffs) / (n * (n * n - 1.0))`,
    testCases: [
      { input: [[0, 0, 0], 3], expected: 1.0 },
      { input: [[1, -1, 0], 3], expected: 0.5 },
      { input: [[2, -1, -1], 3], expected: -0.5 },
    ],
    hint: "Perfect agreement of ranks gives rho equal to one.",
  },
];
