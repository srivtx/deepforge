import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "pr-051",
    title: "Derangement Count",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Count the permutations of n items with no fixed point (derangements).\n\nUse the recurrence D(0) = 1, D(1) = 0 and D(n) = (n - 1) * (D(n - 1) + D(n - 2)). Return 0 for negative n.",
    starterCode: `def derangement_count(n):
    # Your code here
    pass`,
    solution: `def derangement_count(n):
    if n < 0:
        return 0
    if n == 0:
        return 1
    if n == 1:
        return 0
    prev2, prev1 = 1, 0
    for i in range(2, n + 1):
        cur = (i - 1) * (prev1 + prev2)
        prev2, prev1 = prev1, cur
    return prev1`,
    testCases: [
      { input: [0], expected: 1 },
      { input: [1], expected: 0 },
      { input: [4], expected: 9 },
      { input: [5], expected: 44 },
      { input: [10], expected: 1334961 },
    ],
    hint: "Start from the two base cases and build up; the counts grow fast.",
  },
  {
    id: "pr-052",
    title: "Catalan Number",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Compute the n-th Catalan number, which counts balanced bracket sequences and Dyck paths:\n\nC_n = C(2n, n) / (n + 1).\n\nReturn 0 for negative n.",
    starterCode: `import math


def catalan_number(n):
    # Your code here
    pass`,
    solution: `import math


def catalan_number(n):
    if n < 0:
        return 0
    return math.comb(2 * n, n) // (n + 1)`,
    testCases: [
      { input: [0], expected: 1 },
      { input: [3], expected: 5 },
      { input: [5], expected: 42 },
      { input: [10], expected: 16796 },
    ],
    hint: "Use integer division after math.comb to stay exact.",
  },
  {
    id: "pr-053",
    title: "Bell Number",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Compute the n-th Bell number, the number of ways to partition a set of n items into any number of nonempty blocks.\n\nUse B(n) = sum over k of S(n, k), where S is the Stirling number of the second kind. Return 0 for negative n.",
    starterCode: `import math


def bell_number(n):
    # Your code here
    pass`,
    solution: `import math


def bell_number(n):
    if n < 0:
        return 0
    total = 0
    for k in range(n + 1):
        s = 0
        for j in range(k + 1):
            s += ((-1) ** j) * math.comb(k, j) * (k - j) ** n
        total += s // math.factorial(k)
    return total`,
    testCases: [
      { input: [0], expected: 1 },
      { input: [1], expected: 1 },
      { input: [3], expected: 5 },
      { input: [5], expected: 52 },
      { input: [7], expected: 877 },
    ],
    hint: "Sum the Stirling second-kind numbers over all block counts.",
  },
  {
    id: "pr-054",
    title: "Stirling Number of the Second Kind",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Count the ways to partition n labeled items into k nonempty unlabeled blocks using the closed form:\n\nS(n, k) = (1 / k!) * sum over j of (-1)^j * C(k, j) * (k - j)^n.\n\nReturn 0 when n < 0, k < 0 or k > n.",
    starterCode: `import math


def stirling_second(n, k):
    # Your code here
    pass`,
    solution: `import math


def stirling_second(n, k):
    if n < 0 or k < 0 or k > n:
        return 0
    if k == 0:
        return 1 if n == 0 else 0
    total = 0
    for j in range(k + 1):
        total += ((-1) ** j) * math.comb(k, j) * (k - j) ** n
    return total // math.factorial(k)`,
    testCases: [
      { input: [0, 0], expected: 1 },
      { input: [3, 2], expected: 3 },
      { input: [4, 2], expected: 7 },
      { input: [5, 0], expected: 0 },
      { input: [5, 1], expected: 1 },
    ],
    hint: "The alternating sum counts surjections, and dividing by k! removes the labels.",
  },
  {
    id: "pr-055",
    title: "Geometric Memoryless Check",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Verify the memoryless property of the geometric distribution:\n\nP(X > n + m | X > n) = P(X > m)\n\nwhere P(X > k) = (1 - p)^k. Return True when the two sides agree within 1e-9.",
    starterCode: `def geometric_memoryless_check(p, n, m):
    # Your code here
    pass`,
    solution: `def geometric_memoryless_check(p, n, m):
    denom = (1.0 - p) ** n
    cond = 0.0 if denom == 0 else (1.0 - p) ** (n + m) / denom
    target = (1.0 - p) ** m
    return abs(cond - target) < 1e-9`,
    testCases: [
      { input: [0.3, 4, 2], expected: true },
      { input: [0.5, 1, 7], expected: true },
      { input: [0.9, 0, 3], expected: true },
      { input: [0.25, 10, 3], expected: true },
    ],
    hint: "Compute the conditional probability with the survival function.",
  },
  {
    id: "pr-056",
    title: "Exponential Memoryless Check",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Verify the memoryless property of the exponential distribution:\n\nP(X > s + t | X > s) = P(X > t)\n\nwhere P(X > x) = e^(-lam * x). Return True when the two sides agree within 1e-9.",
    starterCode: `import math


def exponential_memoryless_check(lam, s, t):
    # Your code here
    pass`,
    solution: `import math


def exponential_memoryless_check(lam, s, t):
    denom = math.exp(-lam * s)
    cond = 0.0 if denom == 0 else math.exp(-lam * (s + t)) / denom
    target = math.exp(-lam * t)
    return abs(cond - target) < 1e-9`,
    testCases: [
      { input: [1.0, 2.0, 3.0], expected: true },
      { input: [0.5, 4.0, 2.0], expected: true },
      { input: [2.0, 0.0, 5.0], expected: true },
    ],
    hint: "The survival function of the exponential is exp(-lam * x).",
  },
  {
    id: "pr-057",
    title: "Weibull CDF",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Weibull cumulative distribution function with scale lam and shape k:\n\nF(x) = 1 - exp(-(x / lam)^k) for x >= 0, else 0.\n\nReturn 0.0 for nonpositive lam or k.",
    starterCode: `import math


def weibull_cdf(lam, k, x):
    # Your code here
    pass`,
    solution: `import math


def weibull_cdf(lam, k, x):
    if lam <= 0 or k <= 0 or x < 0:
        return 0.0
    return 1.0 - math.exp(-((x / lam) ** k))`,
    testCases: [
      { input: [1, 1, 1], expected: 0.6321205588285577 },
      { input: [2, 3, 2], expected: 0.6321205588285577 },
      { input: [1, 2, 3], expected: 0.9998765901959134 },
      { input: [1, 1, -1], expected: 0.0 },
    ],
    hint: "With k = 1 the Weibull reduces to the exponential distribution.",
  },
  {
    id: "pr-058",
    title: "Rayleigh PDF",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Rayleigh probability density function with scale sigma:\n\nf(x) = (x / sigma^2) * exp(-x^2 / (2 * sigma^2)) for x >= 0, else 0.\n\nReturn 0.0 for sigma <= 0.",
    starterCode: `import math


def rayleigh_pdf(sigma, x):
    # Your code here
    pass`,
    solution: `import math


def rayleigh_pdf(sigma, x):
    if sigma <= 0 or x < 0:
        return 0.0
    return (x / (sigma * sigma)) * math.exp(-(x * x) / (2.0 * sigma * sigma))`,
    testCases: [
      { input: [1, 0], expected: 0.0 },
      { input: [1, 1], expected: 0.6065306597126334 },
      { input: [2, 2], expected: 0.3032653298563167 },
      { input: [1, -1], expected: 0.0 },
    ],
    hint: "The density peaks at x = sigma.",
  },
  {
    id: "pr-059",
    title: "Laplace PDF",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Laplace (double exponential) probability density with location mu and scale b:\n\nf(x) = exp(-|x - mu| / b) / (2 * b).\n\nReturn 0.0 for b <= 0.",
    starterCode: `import math


def laplace_pdf(mu, b, x):
    # Your code here
    pass`,
    solution: `import math


def laplace_pdf(mu, b, x):
    if b <= 0:
        return 0.0
    return math.exp(-abs(x - mu) / b) / (2.0 * b)`,
    testCases: [
      { input: [0, 1, 0], expected: 0.5 },
      { input: [0, 1, 1], expected: 0.18393972058572117 },
      { input: [1, 2, 1], expected: 0.25 },
      { input: [0, -1, 0], expected: 0.0 },
    ],
    hint: "The density is symmetric around mu and decays exponentially.",
  },
  {
    id: "pr-060",
    title: "Cauchy PDF",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Cauchy probability density with location x0 and scale gamma:\n\nf(x) = 1 / (pi * gamma * (1 + ((x - x0) / gamma)^2)).\n\nReturn 0.0 for gamma <= 0.",
    starterCode: `import math


def cauchy_pdf(x0, gamma, x):
    # Your code here
    pass`,
    solution: `import math


def cauchy_pdf(x0, gamma, x):
    if gamma <= 0:
        return 0.0
    z = (x - x0) / gamma
    return 1.0 / (math.pi * gamma * (1.0 + z * z))`,
    testCases: [
      { input: [0, 1, 0], expected: 0.3183098861837907 },
      { input: [0, 1, 1], expected: 0.15915494309189535 },
      { input: [0, 2, 0], expected: 0.15915494309189535 },
      { input: [0, 0, 0], expected: 0.0 },
    ],
    hint: "Standardize x with z = (x - x0) / gamma first.",
  },
  {
    id: "pr-061",
    title: "Cauchy CDF",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Cauchy cumulative distribution function with location x0 and scale gamma:\n\nF(x) = 0.5 + atan((x - x0) / gamma) / pi.\n\nReturn 0.0 for gamma <= 0.",
    starterCode: `import math


def cauchy_cdf(x0, gamma, x):
    # Your code here
    pass`,
    solution: `import math


def cauchy_cdf(x0, gamma, x):
    if gamma <= 0:
        return 0.0
    return 0.5 + math.atan((x - x0) / gamma) / math.pi`,
    testCases: [
      { input: [0, 1, 0], expected: 0.5 },
      { input: [0, 1, 1], expected: 0.75 },
      { input: [0, 1, -1], expected: 0.25 },
      { input: [0, 0, 5], expected: 0.0 },
    ],
    hint: "At x = x0 the CDF is one half by symmetry.",
  },
  {
    id: "pr-062",
    title: "Gamma PDF Value",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Gamma probability density with shape and rate parameters at x:\n\nf(x) = rate^shape * x^(shape - 1) * e^(-rate * x) / Gamma(shape).\n\nReturn 0.0 for nonpositive parameters or x <= 0.",
    starterCode: `import math


def gamma_pdf_value(shape, rate, x):
    # Your code here
    pass`,
    solution: `import math


def gamma_pdf_value(shape, rate, x):
    if shape <= 0 or rate <= 0 or x <= 0:
        return 0.0
    return (rate ** shape) * (x ** (shape - 1.0)) * math.exp(-rate * x) / math.gamma(shape)`,
    testCases: [
      { input: [1, 1, 1], expected: 0.36787944117144233 },
      { input: [2, 1, 2], expected: 0.2706705664732254 },
      { input: [3, 2, 1], expected: 0.5413411329464508 },
      { input: [1, 1, -1], expected: 0.0 },
    ],
    hint: "math.gamma(shape) is the normalizing constant.",
  },
  {
    id: "pr-063",
    title: "Chi-Square PDF Value",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Chi-square probability density with k degrees of freedom at x:\n\nf(x) = x^(k/2 - 1) * e^(-x/2) / (2^(k/2) * Gamma(k/2)).\n\nReturn 0.0 for k <= 0 or x <= 0.",
    starterCode: `import math


def chi_square_pdf_value(k, x):
    # Your code here
    pass`,
    solution: `import math


def chi_square_pdf_value(k, x):
    if k <= 0 or x <= 0:
        return 0.0
    half = k / 2.0
    return (x ** (half - 1.0)) * math.exp(-x / 2.0) / ((2.0 ** half) * math.gamma(half))`,
    testCases: [
      { input: [1, 1], expected: 0.24197072451914334 },
      { input: [2, 1], expected: 0.3032653298563167 },
      { input: [4, 2], expected: 0.18393972058572117 },
      { input: [1, 0], expected: 0.0 },
    ],
    hint: "A chi-square with k degrees of freedom is Gamma(k/2, 1/2).",
  },
  {
    id: "pr-064",
    title: "Pareto Tail Probability",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Pareto tail probability with minimum xm and shape alpha:\n\nP(X > x) = (xm / x)^alpha for x >= xm, and 1 otherwise.\n\nReturn 0.0 for nonpositive xm or alpha.",
    starterCode: `def pareto_tail_probability(xm, alpha, x):
    # Your code here
    pass`,
    solution: `def pareto_tail_probability(xm, alpha, x):
    if xm <= 0 or alpha <= 0:
        return 0.0
    if x <= xm:
        return 1.0
    return (xm / x) ** alpha`,
    testCases: [
      { input: [1, 2, 2], expected: 0.25 },
      { input: [1, 2, 1], expected: 1.0 },
      { input: [2, 3, 4], expected: 0.125 },
      { input: [1, 1, 10], expected: 0.1 },
    ],
    hint: "The tail decays like a power law; at x = xm the probability is 1.",
  },
  {
    id: "pr-065",
    title: "Markov Bound",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Markov's inequality upper bound on P(X >= a) for a nonnegative random variable with the given mean:\n\nP(X >= a) <= min(1, mean / a).\n\nReturn 1.0 when a <= 0.",
    starterCode: `def markov_bound(mean, a):
    # Your code here
    pass`,
    solution: `def markov_bound(mean, a):
    if a <= 0:
        return 1.0
    bound = mean / a
    if bound > 1.0:
        return 1.0
    return bound`,
    testCases: [
      { input: [2, 4], expected: 0.5 },
      { input: [1, 1], expected: 1.0 },
      { input: [3, 1], expected: 1.0 },
      { input: [0, 5], expected: 0.0 },
    ],
    hint: "The bound is only useful when it is below 1.",
  },
  {
    id: "pr-066",
    title: "CLT Z-Score of Sample Mean",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Standardize the sample mean of n independent observations using the central limit theorem:\n\nz = (x - mu) / (sigma / sqrt(n)).\n\nReturn 0.0 when sigma <= 0 or n <= 0.",
    starterCode: `import math


def clt_zscore_sample_mean(mu, sigma, n, x):
    # Your code here
    pass`,
    solution: `import math


def clt_zscore_sample_mean(mu, sigma, n, x):
    if sigma <= 0 or n <= 0:
        return 0.0
    return (x - mu) / (sigma / math.sqrt(n))`,
    testCases: [
      { input: [0, 1, 100, 0.2], expected: 2.0 },
      { input: [0, 1, 25, 0.4], expected: 2.0 },
      { input: [10, 5, 4, 12], expected: 0.8 },
      { input: [0, 1, 0, 0], expected: 0.0 },
    ],
    hint: "The standard error of the mean is sigma divided by sqrt(n).",
  },
  {
    id: "pr-067",
    title: "Inclusion-Exclusion Four Events",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Inclusion-exclusion probability of the union of four events.\n\nGiven singles (4 individual probabilities), pairs (6 pairwise intersections), triples (4 triple intersections) and p_all (the quadruple intersection), return the alternating sum: sum(singles) - sum(pairs) + sum(triples) - p_all.",
    starterCode: `def inclusion_exclusion_four_events(singles, pairs, triples, p_all):
    # Your code here
    pass`,
    solution: `def inclusion_exclusion_four_events(singles, pairs, triples, p_all):
    return sum(singles) - sum(pairs) + sum(triples) - p_all`,
    testCases: [
      {
        input: [
          [0.3, 0.4, 0.2, 0.1],
          [0.1, 0.05, 0.04, 0.12, 0.08, 0.06],
          [0.02, 0.01, 0.03, 0.02],
          0.005,
        ],
        expected: 0.625,
      },
      {
        input: [
          [0.5, 0.5, 0.5, 0.5],
          [0.25, 0.25, 0.25, 0.25, 0.25, 0.25],
          [0.125, 0.125, 0.125, 0.125],
          0.0625,
        ],
        expected: 0.9375,
      },
      {
        input: [[0.0, 0.0, 0.0, 0.0], [0.0, 0.0, 0.0, 0.0, 0.0, 0.0], [0.0, 0.0, 0.0, 0.0], 0.0],
        expected: 0.0,
      },
      {
        input: [[1.0, 1.0, 1.0, 1.0], [1.0, 1.0, 1.0, 1.0, 1.0, 1.0], [1.0, 1.0, 1.0, 1.0], 1.0],
        expected: 1.0,
      },
      {
        input: [[0.1, 0.2, 0.3, 0.4], [0.0, 0.0, 0.0, 0.0, 0.0, 0.0], [0.0, 0.0, 0.0, 0.0], 0.0],
        expected: 1.0,
      },
    ],
    hint: "The signs alternate by intersection size: plus, minus, plus, minus.",
  },
  {
    id: "pr-068",
    title: "Integer Partition Count",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Count the integer partitions of n, the ways to write n as a sum of positive integers where order does not matter.\n\nUse the standard coin-change style dynamic programming table. Return 0 for negative n and 1 for n = 0.",
    starterCode: `def integer_partition_count(n):
    # Your code here
    pass`,
    solution: `def integer_partition_count(n):
    if n < 0:
        return 0
    dp = [0] * (n + 1)
    dp[0] = 1
    for part in range(1, n + 1):
        for total in range(part, n + 1):
            dp[total] += dp[total - part]
    return dp[n]`,
    testCases: [
      { input: [0], expected: 1 },
      { input: [5], expected: 7 },
      { input: [10], expected: 42 },
      { input: [20], expected: 627 },
    ],
    hint: "Process each allowed part once so order does not matter.",
  },
  {
    id: "pr-069",
    title: "Expected Distinct Coupons",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Expected number of distinct coupons collected after draws independent uniform draws from n coupon types.\n\nE[distinct] = n * (1 - (1 - 1/n)^draws), using linearity of expectation over indicators. Return 0.0 for n <= 0 or draws < 0.",
    starterCode: `def expected_distinct_coupons(n, draws):
    # Your code here
    pass`,
    solution: `def expected_distinct_coupons(n, draws):
    if n <= 0 or draws < 0:
        return 0.0
    return n * (1.0 - (1.0 - 1.0 / n) ** draws)`,
    testCases: [
      { input: [365, 365], expected: 230.90815395794158 },
      { input: [6, 1], expected: 0.9999999999999998 },
      { input: [6, 0], expected: 0.0 },
      { input: [10, 100], expected: 9.999734386011124 },
    ],
    hint: "Each coupon type is missing with probability (1 - 1/n)^draws.",
  },
  {
    id: "pr-070",
    title: "Negative Hypergeometric PMF",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Negative hypergeometric probability that the r-th success in sampling without replacement occurs on draw k.\n\nP(X = k) = C(k - 1, r - 1) * C(pop - k, successes - r) / C(pop, successes). Return 0.0 for invalid combinations of arguments.",
    starterCode: `import math


def negative_hypergeometric_pmf(pop, successes, k, r):
    # Your code here
    pass`,
    solution: `import math


def negative_hypergeometric_pmf(pop, successes, k, r):
    if r < 1 or k < r or k > pop or successes < r:
        return 0.0
    denom = math.comb(pop, successes)
    if denom == 0:
        return 0.0
    return math.comb(k - 1, r - 1) * math.comb(pop - k, successes - r) / denom`,
    testCases: [
      { input: [10, 3, 5, 2], expected: 0.16666666666666666 },
      { input: [5, 2, 2, 2], expected: 0.1 },
      { input: [10, 3, 1, 1], expected: 0.3 },
      { input: [4, 2, 3, 2], expected: 0.3333333333333333 },
      { input: [10, 3, 12, 1], expected: 0.0 },
    ],
    hint: "Place r - 1 successes in the first k - 1 draws and make draw k a success.",
  },
  {
    id: "pr-071",
    title: "Beta-Binomial PMF",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Beta-binomial probability of k successes in n trials when the success probability is drawn from a Beta(alpha, beta) prior:\n\nP(k) = C(n, k) * B(k + alpha, n - k + beta) / B(alpha, beta).\n\nUse log-gamma functions to avoid overflow. Return 0.0 for invalid arguments.",
    starterCode: `import math


def beta_binomial_pmf(k, n, alpha, beta):
    # Your code here
    pass`,
    solution: `import math


def beta_binomial_pmf(k, n, alpha, beta):
    if k < 0 or k > n or alpha <= 0 or beta <= 0:
        return 0.0
    log_coeff = math.lgamma(n + 1) - math.lgamma(k + 1) - math.lgamma(n - k + 1)
    log_num = math.lgamma(k + alpha) + math.lgamma(n - k + beta) - math.lgamma(n + alpha + beta)
    log_den = math.lgamma(alpha) + math.lgamma(beta) - math.lgamma(alpha + beta)
    return math.exp(log_coeff + log_num - log_den)`,
    testCases: [
      { input: [1, 2, 1, 1], expected: 0.3333333333333332 },
      { input: [2, 2, 1, 1], expected: 0.3333333333333332 },
      { input: [0, 2, 1, 1], expected: 0.3333333333333332 },
      { input: [1, 3, 2, 3], expected: 0.34285714285714186 },
    ],
    hint: "Use lgamma for the Beta function values and exponentiate at the end.",
  },
  {
    id: "pr-072",
    title: "Dirichlet-Multinomial Probability",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Dirichlet-multinomial probability of a count vector given Dirichlet concentration parameters alphas:\n\nP(counts) = n! / prod(c_i!) * Gamma(A) / Gamma(A + n) * prod(Gamma(a_i + c_i) / Gamma(a_i))\n\nwhere A = sum(alphas) and n = sum(counts). Return 0.0 for negative counts or nonpositive alphas.",
    starterCode: `import math


def dirichlet_multinomial_probability(counts, alphas):
    # Your code here
    pass`,
    solution: `import math


def dirichlet_multinomial_probability(counts, alphas):
    total = 0
    for c in counts:
        if c < 0:
            return 0.0
        total += c
    for a in alphas:
        if a <= 0:
            return 0.0
    logp = math.lgamma(total + 1)
    for c in counts:
        logp -= math.lgamma(c + 1)
    a_sum = sum(alphas)
    logp += math.lgamma(a_sum) - math.lgamma(a_sum + total)
    for c, a in zip(counts, alphas):
        logp += math.lgamma(a + c) - math.lgamma(a)
    return math.exp(logp)`,
    testCases: [
      { input: [[1, 1], [1, 1]], expected: 0.3333333333333332 },
      { input: [[2, 0], [1, 1]], expected: 0.3333333333333332 },
      { input: [[1, 1, 1], [1, 1, 1]], expected: 0.09999999999999994 },
      { input: [[2, 1], [2, 3]], expected: 0.2571428571428569 },
    ],
    hint: "Combine the multinomial coefficient with the Dirichlet Beta-ratio term.",
  },
  {
    id: "pr-073",
    title: "Poisson Process Probability",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Probability that a Poisson process with rate lam has exactly k events in the time interval (t1, t2).\n\nThe count is Poisson distributed with mean lam * (t2 - t1). Return 0.0 when lam < 0, t2 < t1 or k < 0.",
    starterCode: `import math


def poisson_process_probability(lam, t1, t2, k):
    # Your code here
    pass`,
    solution: `import math


def poisson_process_probability(lam, t1, t2, k):
    if lam < 0 or t2 < t1 or k < 0:
        return 0.0
    mean = lam * (t2 - t1)
    return mean ** k * math.exp(-mean) / math.factorial(k)`,
    testCases: [
      { input: [2, 0, 1, 0], expected: 0.1353352832366127 },
      { input: [3, 1, 3, 2], expected: 0.044617539179994455 },
      { input: [1, 0, 2, 3], expected: 0.1804470443154836 },
      { input: [1, 2, 1, 1], expected: 0.0 },
    ],
    hint: "Only the interval length enters the mean, not the absolute times.",
  },
  {
    id: "pr-074",
    title: "Interarrival Exponential Probability",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Probability that the first interarrival time T of a Poisson process with rate lam falls in (a, b):\n\nP(a < T < b) = e^(-lam * a) - e^(-lam * b).\n\nReturn 0.0 when lam < 0, a < 0 or b < a.",
    starterCode: `import math


def interarrival_exponential_probability(lam, a, b):
    # Your code here
    pass`,
    solution: `import math


def interarrival_exponential_probability(lam, a, b):
    if lam < 0 or a < 0 or b < a:
        return 0.0
    return math.exp(-lam * a) - math.exp(-lam * b)`,
    testCases: [
      { input: [1, 0, 1], expected: 0.6321205588285577 },
      { input: [2, 1, 2], expected: 0.11701964434787852 },
      { input: [1, 0, 0], expected: 0.0 },
      { input: [0.5, 2, 4], expected: 0.23254415793482963 },
    ],
    hint: "Subtract the survival function values at the two endpoints.",
  },
  {
    id: "pr-075",
    title: "Superposition of Poisson Processes",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Two independent Poisson processes with rates lam1 and lam2 are merged. Return the probability that the superposed process has exactly k events in time t.\n\nThe merged process is Poisson with rate lam1 + lam2. Return 0.0 for negative inputs.",
    starterCode: `import math


def superposition_poisson_probability(lam1, lam2, t, k):
    # Your code here
    pass`,
    solution: `import math


def superposition_poisson_probability(lam1, lam2, t, k):
    if lam1 < 0 or lam2 < 0 or t < 0 or k < 0:
        return 0.0
    mean = (lam1 + lam2) * t
    return mean ** k * math.exp(-mean) / math.factorial(k)`,
    testCases: [
      { input: [1, 2, 1, 0], expected: 0.049787068367863944 },
      { input: [1, 1, 1, 2], expected: 0.2706705664732254 },
      { input: [0, 0, 5, 0], expected: 1.0 },
      { input: [2, 1, 2, 3], expected: 0.08923507835998891 },
    ],
    hint: "Adding independent Poisson processes adds their rates.",
  },
  {
    id: "pr-076",
    title: "Thinning of a Poisson Process",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Each event of a Poisson process with rate lam is independently kept with probability p. Return the probability that exactly k kept events occur in time t.\n\nThe thinned process is Poisson with rate lam * p. Return 0.0 for invalid probabilities or negative inputs.",
    starterCode: `import math


def thinning_poisson_probability(lam, p, t, k):
    # Your code here
    pass`,
    solution: `import math


def thinning_poisson_probability(lam, p, t, k):
    if lam < 0 or p < 0 or p > 1 or t < 0 or k < 0:
        return 0.0
    mean = lam * p * t
    return mean ** k * math.exp(-mean) / math.factorial(k)`,
    testCases: [
      { input: [2, 0.5, 2, 1], expected: 0.2706705664732254 },
      { input: [3, 1, 1, 2], expected: 0.22404180765538775 },
      { input: [5, 0, 1, 0], expected: 1.0 },
      { input: [1, 2, 1, 1], expected: 0.0 },
    ],
    hint: "Independent thinning preserves the Poisson property with a reduced rate.",
  },
  {
    id: "pr-077",
    title: "Uniform Order Stats Expected Min and Max",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Expected minimum and maximum of n independent Uniform(0, 1) variables, returned as [E[min], E[max]].\n\nE[min] = 1 / (n + 1) and E[max] = n / (n + 1). Return [0.0, 0.0] for n < 1.",
    starterCode: `def uniform_order_stats_expected(n):
    # Your code here
    pass`,
    solution: `def uniform_order_stats_expected(n):
    if n < 1:
        return [0.0, 0.0]
    return [1.0 / (n + 1), n / (n + 1.0)]`,
    testCases: [
      { input: [1], expected: [0.5, 0.5] },
      { input: [2], expected: [0.3333333333333333, 0.6666666666666666] },
      { input: [9], expected: [0.1, 0.9] },
      { input: [0], expected: [0.0, 0.0] },
    ],
    hint: "The k-th smallest uniform has expectation k / (n + 1).",
  },
  {
    id: "pr-078",
    title: "Order Statistic Density Value",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Probability density of the k-th order statistic of n independent Uniform(0, 1) variables at x:\n\nf_(k)(x) = n * C(n - 1, k - 1) * x^(k - 1) * (1 - x)^(n - k).\n\nReturn 0.0 when x is outside [0, 1] or k is outside 1..n.",
    starterCode: `import math


def order_stat_density_value(n, k, x):
    # Your code here
    pass`,
    solution: `import math


def order_stat_density_value(n, k, x):
    if n < 1 or k < 1 or k > n or x < 0 or x > 1:
        return 0.0
    return n * math.comb(n - 1, k - 1) * (x ** (k - 1)) * ((1.0 - x) ** (n - k))`,
    testCases: [
      { input: [1, 1, 0.5], expected: 1.0 },
      { input: [2, 1, 0.5], expected: 1.0 },
      { input: [2, 2, 0.5], expected: 1.0 },
      { input: [3, 2, 0.25], expected: 1.125 },
      { input: [3, 4, 0.5], expected: 0.0 },
    ],
    hint: "Pick which observation lands at x, then order the rest around it.",
  },
  {
    id: "pr-079",
    title: "Beta PDF Value",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Beta probability density with shape parameters alpha and beta at x:\n\nf(x) = x^(alpha - 1) * (1 - x)^(beta - 1) / B(alpha, beta).\n\nReturn 0.0 when x is outside [0, 1] or a parameter is nonpositive; boundary points return 0.0.",
    starterCode: `import math


def beta_pdf_value(alpha, beta, x):
    # Your code here
    pass`,
    solution: `import math


def beta_pdf_value(alpha, beta, x):
    if alpha <= 0 or beta <= 0 or x < 0 or x > 1:
        return 0.0
    if x == 0 or x == 1:
        return 0.0
    log_b = math.lgamma(alpha) + math.lgamma(beta) - math.lgamma(alpha + beta)
    return math.exp((alpha - 1.0) * math.log(x) + (beta - 1.0) * math.log(1.0 - x) - log_b)`,
    testCases: [
      { input: [1, 1, 0.5], expected: 1.0 },
      { input: [2, 3, 0.5], expected: 1.4999999999999991 },
      { input: [2, 2, 0.5], expected: 1.5 },
      { input: [0, 1, 0.5], expected: 0.0 },
    ],
    hint: "Compute in log space and exponentiate to avoid overflow.",
  },
  {
    id: "pr-080",
    title: "Student t PDF Value",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Student t probability density with nu degrees of freedom at x:\n\nf(x) = Gamma((nu + 1) / 2) / (sqrt(nu * pi) * Gamma(nu / 2)) * (1 + x^2 / nu)^(-(nu + 1) / 2).\n\nReturn 0.0 for nu <= 0.",
    starterCode: `import math


def t_pdf_value(nu, x):
    # Your code here
    pass`,
    solution: `import math


def t_pdf_value(nu, x):
    if nu <= 0:
        return 0.0
    log_coeff = math.lgamma((nu + 1.0) / 2.0) - math.lgamma(nu / 2.0) - 0.5 * math.log(nu * math.pi)
    return math.exp(log_coeff - ((nu + 1.0) / 2.0) * math.log(1.0 + (x * x) / nu))`,
    testCases: [
      { input: [1, 0], expected: 0.3183098861837906 },
      { input: [1, 1], expected: 0.1591549430918953 },
      { input: [2, 0], expected: 0.35355339059327373 },
      { input: [0, 0], expected: 0.0 },
    ],
    hint: "Use lgamma for the ratio of Gamma functions.",
  },
  {
    id: "pr-081",
    title: "F Distribution PDF Value",
    category: "Probability",
    difficulty: "Medium",
    description:
      "F probability density with d1 numerator and d2 denominator degrees of freedom at x:\n\nf(x) = sqrt((d1 * x)^d1 * d2^d2 / (d1 * x + d2)^(d1 + d2)) / (x * B(d1 / 2, d2 / 2)).\n\nReturn 0.0 for nonpositive parameters or x <= 0.",
    starterCode: `import math


def f_pdf_value(d1, d2, x):
    # Your code here
    pass`,
    solution: `import math


def f_pdf_value(d1, d2, x):
    if d1 <= 0 or d2 <= 0 or x <= 0:
        return 0.0
    log_num = 0.5 * (d1 * math.log(d1) + d2 * math.log(d2)) + (d1 / 2.0 - 1.0) * math.log(x)
    log_den = (
        0.5 * (d1 + d2) * math.log(d1 * x + d2)
        + math.lgamma(d1 / 2.0)
        + math.lgamma(d2 / 2.0)
        - math.lgamma((d1 + d2) / 2.0)
    )
    return math.exp(log_num - log_den)`,
    testCases: [
      { input: [1, 1, 1], expected: 0.1591549430918952 },
      { input: [2, 2, 1], expected: 0.25 },
      { input: [4, 2, 2], expected: 0.12799999999999978 },
      { input: [1, 1, 0], expected: 0.0 },
    ],
    hint: "The Beta function in the denominator can be written with lgamma terms.",
  },
  {
    id: "pr-082",
    title: "Lognormal Mean and Median",
    category: "Probability",
    difficulty: "Medium",
    description:
      "For a lognormal random variable whose log has mean mu and standard deviation sigma, return [mean, median]:\n\nmean = exp(mu + sigma^2 / 2) and median = exp(mu).\n\nThe result is a two-element list.",
    starterCode: `import math


def lognormal_mean_median(mu, sigma):
    # Your code here
    pass`,
    solution: `import math


def lognormal_mean_median(mu, sigma):
    return [math.exp(mu + sigma * sigma / 2.0), math.exp(mu)]`,
    testCases: [
      { input: [0, 1], expected: [1.6487212707001282, 1.0] },
      { input: [0, 0], expected: [1.0, 1.0] },
      { input: [1, 0.5], expected: [3.080216848918031, 2.718281828459045] },
      { input: [2, 1], expected: [12.182493960703473, 7.38905609893065] },
    ],
    hint: "The median is exp(mu); the mean picks up the half-variance term.",
  },
  {
    id: "pr-083",
    title: "Multinomial Covariance",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Covariance between the counts of two distinct categories in a multinomial experiment with n trials and category probabilities p_i and p_j:\n\nCov = -n * p_i * p_j.\n\nInputs are assumed to describe two different categories.",
    starterCode: `def multinomial_covariance(n, p_i, p_j):
    # Your code here
    pass`,
    solution: `def multinomial_covariance(n, p_i, p_j):
    return -n * p_i * p_j`,
    testCases: [
      { input: [10, 0.2, 0.3], expected: -0.6 },
      { input: [5, 0.5, 0.5], expected: -1.25 },
      { input: [100, 0.1, 0.1], expected: -1.0 },
    ],
    hint: "More successes in one category force fewer in the others.",
  },
  {
    id: "pr-084",
    title: "Law of Total Variance",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Decompose the variance of X given conditional means, conditional variances and the probabilities of the conditioning events:\n\nVar(X) = E[Var(X | Y)] + Var(E[X | Y]).\n\nAll three input lists have the same length. An empty input returns 0.0.",
    starterCode: `def law_of_total_variance(cond_means, cond_vars, probs):
    # Your code here
    pass`,
    solution: `def law_of_total_variance(cond_means, cond_vars, probs):
    mean = sum(p * m for p, m in zip(probs, cond_means))
    e_var = sum(p * v for p, v in zip(probs, cond_vars))
    var_mean = sum(p * (m - mean) ** 2 for p, m in zip(probs, cond_means))
    return e_var + var_mean`,
    testCases: [
      { input: [[0, 10], [1, 1], [0.5, 0.5]], expected: 26.0 },
      { input: [[2, 4], [3, 5], [0.25, 0.75]], expected: 5.25 },
      {
        input: [[1, 1, 1], [2, 3, 4], [1 / 3, 1 / 3, 1 / 3]],
        expected: 3.0,
      },
      { input: [[], [], []], expected: 0.0 },
    ],
    hint: "Compute the overall mean first, then the two variance pieces.",
  },
  {
    id: "pr-085",
    title: "MGF of Poisson",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Moment generating function of a Poisson random variable with rate lam evaluated at t:\n\nM(t) = exp(lam * (e^t - 1)).",
    starterCode: `import math


def mgf_poisson(lam, t):
    # Your code here
    pass`,
    solution: `import math


def mgf_poisson(lam, t):
    return math.exp(lam * (math.exp(t) - 1.0))`,
    testCases: [
      { input: [1, 0], expected: 1.0 },
      { input: [2, 1], expected: 31.079973004503163 },
      { input: [1, 2], expected: 595.2944153807538 },
    ],
    hint: "Take E[e^(tX)] and use the Poisson series.",
  },
  {
    id: "pr-086",
    title: "PGF of Geometric",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Probability generating function of the geometric distribution for the number of trials until the first success:\n\nG(z) = p * z / (1 - (1 - p) * z).\n\nReturn 0.0 when the denominator is 0.",
    starterCode: `def pgf_geometric(p, z):
    # Your code here
    pass`,
    solution: `def pgf_geometric(p, z):
    denom = 1.0 - (1.0 - p) * z
    if denom == 0:
        return 0.0
    return p * z / denom`,
    testCases: [
      { input: [0.5, 1], expected: 1.0 },
      { input: [0.5, 0], expected: 0.0 },
      { input: [0.2, 0.5], expected: 0.16666666666666669 },
      { input: [0.5, 2], expected: 0.0 },
    ],
    hint: "Sum p * ((1 - p) * z)^(k - 1) * z over k >= 1.",
  },
  {
    id: "pr-087",
    title: "Occupancy Exactly k Empty Boxes",
    category: "Probability",
    difficulty: "Hard",
    description:
      "Balls are thrown independently and uniformly into boxes. Return the probability that exactly empty boxes stay empty:\n\nP = C(boxes, empty) * Surj(balls, boxes - empty) / boxes^balls\n\nwhere Surj(m) = sum over j of (-1)^j * C(m, j) * (m - j)^balls counts the surjections onto m boxes. Return 1.0 when balls = 0 and empty = boxes; return 0.0 for invalid arguments or when balls are fewer than the occupied boxes.",
    starterCode: `import math


def occupancy_exactly_k_empty(boxes, balls, empty):
    # Your code here
    pass`,
    solution: `import math


def occupancy_exactly_k_empty(boxes, balls, empty):
    if boxes <= 0 or balls < 0 or empty < 0 or empty > boxes:
        return 0.0
    m = boxes - empty
    if m == 0:
        return 1.0 if balls == 0 else 0.0
    if balls < m:
        return 0.0
    onto = 0
    for j in range(m + 1):
        onto += ((-1) ** j) * math.comb(m, j) * (m - j) ** balls
    return math.comb(boxes, empty) * onto / (boxes ** balls)`,
    testCases: [
      { input: [2, 2, 0], expected: 0.5 },
      { input: [2, 2, 1], expected: 0.5 },
      { input: [3, 3, 0], expected: 0.2222222222222222 },
      { input: [2, 1, 1], expected: 1.0 },
      { input: [3, 0, 3], expected: 1.0 },
    ],
    hint: "Choose which boxes are empty, then count surjections onto the rest.",
  },
  {
    id: "pr-088",
    title: "Irwin-Hall CDF",
    category: "Probability",
    difficulty: "Hard",
    description:
      "Cumulative distribution function of the sum of n independent Uniform(0, 1) variables at x:\n\nF(x) = (1 / n!) * sum over k of (-1)^k * C(n, k) * (x - k)^n\n\nwith the sum taken over k from 0 to floor(x). Return 0.0 for x <= 0 and 1.0 for x >= n.",
    starterCode: `import math


def irwin_hall_cdf(n, x):
    # Your code here
    pass`,
    solution: `import math


def irwin_hall_cdf(n, x):
    if n < 1:
        return 0.0
    if x <= 0:
        return 0.0
    if x >= n:
        return 1.0
    total = 0.0
    for k in range(int(math.floor(x)) + 1):
        total += ((-1) ** k) * math.comb(n, k) * (x - k) ** n
    return total / math.factorial(n)`,
    testCases: [
      { input: [1, 0.5], expected: 0.5 },
      { input: [2, 1], expected: 0.5 },
      { input: [3, 1.5], expected: 0.5 },
      { input: [2, 2.5], expected: 1.0 },
      { input: [2, -1], expected: 0.0 },
    ],
    hint: "Inclusion-exclusion on the constraints u_i >= 1.",
  },
  {
    id: "pr-089",
    title: "Chernoff Bound for Bernoulli",
    category: "Probability",
    difficulty: "Hard",
    description:
      "Chernoff upper bound for the tail of a binomial(n, p) variable:\n\nP(X >= (1 + delta) * n * p) <= (e^delta / (1 + delta)^(1 + delta))^(n * p).\n\nReturn 0.0 when delta <= 0 or the inputs are invalid, and 1.0 when n * p is 0.",
    starterCode: `import math


def chernoff_bound_bernoulli(n, p, delta):
    # Your code here
    pass`,
    solution: `import math


def chernoff_bound_bernoulli(n, p, delta):
    if n < 0 or p < 0 or p > 1 or delta <= 0:
        return 0.0
    mu = n * p
    if mu == 0:
        return 1.0
    exponent = delta - (1.0 + delta) * math.log(1.0 + delta)
    return math.exp(mu * exponent)`,
    testCases: [
      { input: [10, 0.5, 1.0], expected: 0.14493472568611 },
      { input: [100, 0.5, 0.1], expected: 0.7850091625435301 },
      { input: [10, 0.5, 0], expected: 0.0 },
      { input: [0, 0.5, 1], expected: 1.0 },
    ],
    hint: "The exponent simplifies to delta - (1 + delta) * ln(1 + delta).",
  },
  {
    id: "pr-090",
    title: "Erlang PDF (Convolution of Exponentials)",
    category: "Probability",
    difficulty: "Hard",
    description:
      "The sum of n independent Exponential(lam) variables is Erlang distributed. Return its density at x:\n\nf(x) = lam^n * x^(n - 1) * e^(-lam * x) / (n - 1)! for x >= 0.\n\nReturn 0.0 for nonpositive lam, n < 1 or x < 0.",
    starterCode: `import math


def erlang_pdf(lam, n, x):
    # Your code here
    pass`,
    solution: `import math


def erlang_pdf(lam, n, x):
    if lam <= 0 or n < 1 or x < 0:
        return 0.0
    return (lam ** n) * (x ** (n - 1)) * math.exp(-lam * x) / math.factorial(n - 1)`,
    testCases: [
      { input: [1, 1, 1], expected: 0.36787944117144233 },
      { input: [2, 2, 1], expected: 0.5413411329464508 },
      { input: [1, 3, 2], expected: 0.2706705664732254 },
      { input: [1, 1, 0], expected: 1.0 },
    ],
    hint: "Convolving exponential densities n times gives the Erlang shape.",
  },
  {
    id: "pr-091",
    title: "Reciprocal Uniform Density",
    category: "Probability",
    difficulty: "Hard",
    description:
      "U is Uniform(0, 1) and Y = 1 / U. Return the probability density of Y at y found by the one-dimensional change of variables formula:\n\nf_Y(y) = 1 / y^2 for y >= 1, else 0.0.",
    starterCode: `def reciprocal_uniform_pdf(y):
    # Your code here
    pass`,
    solution: `def reciprocal_uniform_pdf(y):
    if y < 1.0:
        return 0.0
    return 1.0 / (y * y)`,
    testCases: [
      { input: [1], expected: 1.0 },
      { input: [2], expected: 0.25 },
      { input: [0.5], expected: 0.0 },
      { input: [10], expected: 0.01 },
    ],
    hint: "Invert y = 1/u to get u = 1/y and multiply by |du/dy|.",
  },
  {
    id: "pr-092",
    title: "Gambler's Ruin Expected Duration",
    category: "Probability",
    difficulty: "Hard",
    description:
      "Expected number of rounds until a gambler starting with start units hits 0 or target, winning one unit per round with probability p.\n\nFor p = 0.5 the answer is start * (target - start). For p not 0.5 use E = (start - target * (1 - r^start) / (1 - r^target)) / (q - p) with q = 1 - p and r = q / p. Return 0.0 when start <= 0 or start >= target, start when p <= 0, and target - start when p >= 1.",
    starterCode: `def gambler_ruin_expected_duration(start, target, p):
    # Your code here
    pass`,
    solution: `def gambler_ruin_expected_duration(start, target, p):
    if start <= 0 or start >= target:
        return 0.0
    if p <= 0:
        return float(start)
    if p >= 1:
        return float(target - start)
    if abs(p - 0.5) < 1e-15:
        return float(start * (target - start))
    q = 1.0 - p
    r = q / p
    return (start - target * (1.0 - r ** start) / (1.0 - r ** target)) / (q - p)`,
    testCases: [
      { input: [1, 3, 0.5], expected: 2.0 },
      { input: [2, 4, 0.5], expected: 4.0 },
      { input: [1, 3, 0.75], expected: 2.1538461538461533 },
      { input: [2, 5, 0.25], expected: 3.669421487603306 },
      { input: [1, 3, 0], expected: 1.0 },
    ],
    hint: "Solve E_i = 1 + p * E_(i+1) + q * E_(i-1) with absorbing boundaries.",
  },
  {
    id: "pr-093",
    title: "Jensen Gap for the Exponential",
    category: "Probability",
    difficulty: "Hard",
    description:
      "A random variable equals x1 with probability p and x2 otherwise. Return the Jensen gap for the convex function f(x) = e^x:\n\ngap = E[e^X] - e^(E[X]) >= 0.\n\nThe gap is 0 when the two outcomes coincide.",
    starterCode: `import math


def jensen_gap_exponential(x1, x2, p):
    # Your code here
    pass`,
    solution: `import math


def jensen_gap_exponential(x1, x2, p):
    mean = p * x1 + (1.0 - p) * x2
    e_f = p * math.exp(x1) + (1.0 - p) * math.exp(x2)
    return e_f - math.exp(mean)`,
    testCases: [
      { input: [0, 1, 0.5], expected: 0.21041964352939435 },
      { input: [0, 0, 0.5], expected: 0.0 },
      { input: [1, 2, 0.25], expected: 0.4667598553070178 },
      { input: [-1, 1, 0.5], expected: 0.5430806348152437 },
    ],
    hint: "Compute the expectation of f first, then subtract f of the expectation.",
  },
  {
    id: "pr-094",
    title: "Monte Carlo Estimate (Seeded)",
    category: "Probability",
    difficulty: "Hard",
    description:
      "Estimate P(U1 + U2 < 1) for independent Uniform(0, 1) draws by simulation, where the exact answer is 0.5.\n\nDraw n pairs of values using random.Random(seed), count the pairs whose sum is below 1, and return the observed fraction. Return 0.0 for n <= 0.",
    starterCode: `import random


def simulation_estimate_seeded(n, seed):
    # Your code here
    pass`,
    solution: `import random


def simulation_estimate_seeded(n, seed):
    if n <= 0:
        return 0.0
    rng = random.Random(seed)
    hits = 0
    for _ in range(n):
        u1 = rng.random()
        u2 = rng.random()
        if u1 + u2 < 1.0:
            hits += 1
    return hits / n`,
    testCases: [
      { input: [10000, 42], expected: 0.5 },
      { input: [10000, 7], expected: 0.5072 },
      { input: [1, 0], expected: 0.0 },
      { input: [0, 5], expected: 0.0 },
    ],
    hint: "Use a private random.Random(seed) instance for reproducibility.",
  },
  {
    id: "pr-095",
    title: "Normal Approximation Error",
    category: "Probability",
    difficulty: "Hard",
    description:
      "Return the absolute error of the normal approximation to the binomial CDF at k:\n\nerror = |P(X <= k) - Phi((k - n * p) / sqrt(n * p * (1 - p)))|\n\nCompute the exact binomial probability with a sum and the normal probability with math.erf. Return 0.0 when n <= 0 or p is outside [0, 1].",
    starterCode: `import math


def normal_approximation_error(n, p, k):
    # Your code here
    pass`,
    solution: `import math


def normal_approximation_error(n, p, k):
    if n <= 0 or p < 0 or p > 1:
        return 0.0
    if k < 0:
        exact = 0.0
    elif k >= n:
        exact = 1.0
    else:
        exact = 0.0
        for i in range(k + 1):
            exact += math.comb(n, i) * p ** i * (1.0 - p) ** (n - i)
    var = n * p * (1.0 - p)
    if var == 0:
        approx = 0.5
    else:
        z = (k - n * p) / math.sqrt(var)
        approx = 0.5 * (1.0 + math.erf(z / math.sqrt(2.0)))
    return abs(exact - approx)`,
    testCases: [
      { input: [10, 0.5, 5], expected: 0.123046875 },
      { input: [100, 0.5, 50], expected: 0.039794618693589356 },
      { input: [20, 0.1, 2], expected: 0.17692680518946635 },
      { input: [5, 0.2, -1], expected: 0.0126736593387341 },
    ],
    hint: "No continuity correction is applied, so some error is expected.",
  },
];
