import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "pr-006",
    title: "Factorial for Counting Outcomes",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Compute n! iteratively as 1 * 2 * ... * n.\n\nReturn 1 when n = 0, since the empty product is 1, and 0 for negative n.",
    starterCode: `def factorial(n):
    # Your code here
    pass`,
    solution: `def factorial(n):
    if n < 0:
        return 0
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result`,
    testCases: [
      { input: [5], expected: 120 },
      { input: [0], expected: 1 },
      { input: [1], expected: 1 },
      { input: [10], expected: 3628800 },
      { input: [-3], expected: 0 },
    ],
    hint: "The empty product is 1, and factorials are never defined for negative integers here.",
  },
  {
    id: "pr-007",
    title: "Stars and Bars",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Count the ways to choose k items from n types when order does not matter but repetition is allowed. The stars and bars formula gives C(n + k - 1, k).\n\nReturn 0 if n <= 0 or k < 0, and 1 when k = 0.",
    starterCode: `import math


def stars_and_bars(n, k):
    # Your code here
    pass`,
    solution: `import math


def stars_and_bars(n, k):
    if n <= 0 or k < 0:
        return 0
    return math.comb(n + k - 1, k)`,
    testCases: [
      { input: [3, 2], expected: 6 },
      { input: [5, 0], expected: 1 },
      { input: [1, 4], expected: 1 },
      { input: [4, 3], expected: 20 },
      { input: [0, 2], expected: 0 },
    ],
    hint: "Transform the problem into placing k dividers among n + k - 1 slots.",
  },
  {
    id: "pr-008",
    title: "Complement Probability",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Return the probability of the complement of an event given its probability p.\n\nP(not A) = 1 - p. Assume 0 <= p <= 1.",
    starterCode: `def complement_probability(p):
    # Your code here
    pass`,
    solution: `def complement_probability(p):
    return 1.0 - p`,
    testCases: [
      { input: [0.3], expected: 0.7 },
      { input: [0.0], expected: 1.0 },
      { input: [1.0], expected: 0.0 },
      { input: [0.125], expected: 0.875 },
    ],
    hint: "The two probabilities always add to 1.",
  },
  {
    id: "pr-009",
    title: "At Least One Success",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Given success probabilities for independent trials, return the probability that at least one trial succeeds.\n\nP(at least one) = 1 - product(1 - p_i). An empty list returns 0.0.",
    starterCode: `def at_least_one_independent(probs):
    # Your code here
    pass`,
    solution: `def at_least_one_independent(probs):
    fail = 1.0
    for p in probs:
        fail *= 1.0 - p
    return 1.0 - fail`,
    testCases: [
      { input: [[0.5, 0.5]], expected: 0.75 },
      { input: [[0.1, 0.2, 0.3]], expected: 0.496 },
      { input: [[]], expected: 0.0 },
      { input: [[1.0, 0.5]], expected: 1.0 },
    ],
    hint: "Work with the complement: all trials fail simultaneously.",
  },
  {
    id: "pr-010",
    title: "Binomial Mean and Variance",
    category: "Probability",
    difficulty: "Easy",
    description:
      "For a binomial random variable with n trials and success probability p, return the mean and variance as a two-element list.\n\nmean = n * p and variance = n * p * (1 - p).",
    starterCode: `def binomial_mean_variance(n, p):
    # Your code here
    pass`,
    solution: `def binomial_mean_variance(n, p):
    return [n * p, n * p * (1.0 - p)]`,
    testCases: [
      { input: [10, 0.5], expected: [5.0, 2.5] },
      { input: [1, 0.3], expected: [0.3, 0.21] },
      { input: [0, 0.9], expected: [0.0, 0.0] },
      { input: [100, 0.01], expected: [1.0, 0.99] },
    ],
  },
  {
    id: "pr-011",
    title: "Expected Maximum of Two Dice",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Return the expected maximum of two independent fair dice, each with the given number of sides.\n\nE[max] = sum over k of k * (2k - 1) / sides^2, which simplifies to (sides + 1) * (4 * sides - 1) / (6 * sides). Return 0.0 for sides <= 0.",
    starterCode: `def expected_max_two_dice(sides):
    # Your code here
    pass`,
    solution: `def expected_max_two_dice(sides):
    if sides <= 0:
        return 0.0
    return (sides + 1) * (4 * sides - 1) / (6.0 * sides)`,
    testCases: [
      { input: [6], expected: 4.472222222222222 },
      { input: [2], expected: 1.75 },
      { input: [1], expected: 1.0 },
    ],
    hint: "P(max = k) = (2k - 1) / sides^2 for two independent fair dice.",
  },
  {
    id: "pr-012",
    title: "Geometric PMF",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Geometric probability mass function for the number of trials until the first success.\n\nP(X = k) = (1 - p)^(k - 1) * p for k >= 1. Return 0.0 for k < 1.",
    starterCode: `def geometric_pmf(p, k):
    # Your code here
    pass`,
    solution: `def geometric_pmf(p, k):
    if k < 1:
        return 0.0
    return (1.0 - p) ** (k - 1) * p`,
    testCases: [
      { input: [0.5, 1], expected: 0.5 },
      { input: [0.5, 3], expected: 0.125 },
      { input: [0.2, 5], expected: 0.08192000000000002 },
      { input: [0.5, 0], expected: 0.0 },
    ],
    hint: "Fail k - 1 times, then succeed once.",
  },
  {
    id: "pr-013",
    title: "Poisson PMF",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Poisson probability mass function with rate lam.\n\nP(X = k) = lam^k * e^(-lam) / k!. Return 0.0 if lam < 0 or k < 0.",
    starterCode: `import math


def poisson_pmf(lam, k):
    # Your code here
    pass`,
    solution: `import math


def poisson_pmf(lam, k):
    if lam < 0 or k < 0:
        return 0.0
    return lam ** k * math.exp(-lam) / math.factorial(k)`,
    testCases: [
      { input: [2, 0], expected: 0.1353352832366127 },
      { input: [2, 3], expected: 0.1804470443154836 },
      { input: [1, 5], expected: 0.0030656620097620196 },
      { input: [3, -1], expected: 0.0 },
    ],
  },
  {
    id: "pr-014",
    title: "Exponential PDF",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Exponential probability density function evaluated at x.\n\nf(x) = lam * e^(-lam * x) for x >= 0 and 0 otherwise. Return 0.0 for negative lam.",
    starterCode: `import math


def exponential_pdf(lam, x):
    # Your code here
    pass`,
    solution: `import math


def exponential_pdf(lam, x):
    if lam < 0 or x < 0:
        return 0.0
    return lam * math.exp(-lam * x)`,
    testCases: [
      { input: [1, 0], expected: 1.0 },
      { input: [2, 1], expected: 0.2706705664732254 },
      { input: [0.5, 4], expected: 0.06766764161830635 },
      { input: [1, -1], expected: 0.0 },
    ],
  },
  {
    id: "pr-015",
    title: "Exponential CDF",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Exponential cumulative distribution function evaluated at x.\n\nF(x) = 1 - e^(-lam * x) for x >= 0 and 0 otherwise. Return 0.0 for negative lam.",
    starterCode: `import math


def exponential_cdf(lam, x):
    # Your code here
    pass`,
    solution: `import math


def exponential_cdf(lam, x):
    if lam < 0 or x < 0:
        return 0.0
    return 1.0 - math.exp(-lam * x)`,
    testCases: [
      { input: [1, 1], expected: 0.6321205588285577 },
      { input: [2, 0.5], expected: 0.6321205588285577 },
      { input: [3, 0], expected: 0.0 },
      { input: [1, -2], expected: 0.0 },
    ],
    hint: "F(x) is the integral of the density from 0 to x.",
  },
  {
    id: "pr-016",
    title: "Uniform Continuous PDF",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Continuous uniform probability density on [a, b] evaluated at x.\n\nf(x) = 1 / (b - a) when a <= x <= b, else 0.0. Return 0.0 when b <= a.",
    starterCode: `def uniform_continuous_pdf(a, b, x):
    # Your code here
    pass`,
    solution: `def uniform_continuous_pdf(a, b, x):
    if b <= a:
        return 0.0
    if x < a or x > b:
        return 0.0
    return 1.0 / (b - a)`,
    testCases: [
      { input: [0, 1, 0.3], expected: 1.0 },
      { input: [0, 2, 2], expected: 0.5 },
      { input: [0, 2, 2.5], expected: 0.0 },
      { input: [-1, 1, 0], expected: 0.5 },
      { input: [1, 1, 1], expected: 0.0 },
    ],
  },
  {
    id: "pr-017",
    title: "Independence Check",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Return True when two events are independent, i.e. when |P(A and B) - P(A) * P(B)| < 1e-9.\n\nInputs are p_a, p_b, and the joint probability p_ab.",
    starterCode: `def independence_check(p_a, p_b, p_ab):
    # Your code here
    pass`,
    solution: `def independence_check(p_a, p_b, p_ab):
    return abs(p_ab - p_a * p_b) < 1e-9`,
    testCases: [
      { input: [0.5, 0.4, 0.2], expected: true },
      { input: [0.5, 0.4, 0.3], expected: false },
      { input: [0.0, 0.5, 0.0], expected: true },
      { input: [1.0, 1.0, 1.0], expected: true },
    ],
    hint: "Compare the joint probability against the product of the marginals.",
  },
  {
    id: "pr-018",
    title: "Indicator Expectation",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Return the expected number of successes when probs holds the success probabilities of independent indicator variables.\n\nBy linearity of expectation E[sum of indicators] = sum(probs). An empty list returns 0.0.",
    starterCode: `def indicator_expectation(probs):
    # Your code here
    pass`,
    solution: `def indicator_expectation(probs):
    return float(sum(probs))`,
    testCases: [
      { input: [[0.1, 0.2, 0.3]], expected: 0.6 },
      { input: [[0.5, 0.5]], expected: 1.0 },
      { input: [[]], expected: 0.0 },
    ],
  },
  {
    id: "pr-019",
    title: "Normal PDF Value",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Normal probability density function evaluated at x with mean mu and standard deviation sigma.\n\nf(x) = exp(-(x - mu)^2 / (2 * sigma^2)) / (sigma * sqrt(2 * pi)). Return 0.0 when sigma <= 0.",
    starterCode: `import math


def normal_pdf_value(x, mu, sigma):
    # Your code here
    pass`,
    solution: `import math


def normal_pdf_value(x, mu, sigma):
    if sigma <= 0:
        return 0.0
    coeff = 1.0 / (sigma * math.sqrt(2.0 * math.pi))
    return coeff * math.exp(-((x - mu) ** 2) / (2.0 * sigma * sigma))`,
    testCases: [
      { input: [0.0, 0.0, 1.0], expected: 0.3989422804014327 },
      { input: [1.0, 0.0, 1.0], expected: 0.24197072451914337 },
      { input: [0.0, 0.0, 2.0], expected: 0.19947114020071635 },
      { input: [0.0, 0.0, 0.0], expected: 0.0 },
    ],
    hint: "The density peaks at the mean with value 1 / (sigma * sqrt(2 * pi)).",
  },
  {
    id: "pr-020",
    title: "Covariance of Two Indicators",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Covariance of two indicator random variables.\n\nCov(A, B) = P(A and B) - P(A) * P(B). Inputs are p_a, p_b and the joint probability p_ab.",
    starterCode: `def covariance_two_indicators(p_a, p_b, p_ab):
    # Your code here
    pass`,
    solution: `def covariance_two_indicators(p_a, p_b, p_ab):
    return p_ab - p_a * p_b`,
    testCases: [
      { input: [0.5, 0.4, 0.2], expected: 0.0 },
      { input: [0.5, 0.4, 0.3], expected: 0.09999999999999998 },
      { input: [0.2, 0.2, 0.2], expected: 0.16 },
      { input: [0.5, 0.5, 0.0], expected: -0.25 },
    ],
  },
  {
    id: "pr-021",
    title: "Geometric CDF",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Geometric cumulative distribution function for the number of trials until the first success.\n\nP(X <= k) = 1 - (1 - p)^k for k >= 0. Return 0.0 for k < 0.",
    starterCode: `def geometric_cdf(p, k):
    # Your code here
    pass`,
    solution: `def geometric_cdf(p, k):
    if k < 0:
        return 0.0
    return 1.0 - (1.0 - p) ** k`,
    testCases: [
      { input: [0.5, 1], expected: 0.5 },
      { input: [0.5, 3], expected: 0.875 },
      { input: [0.2, 0], expected: 0.0 },
      { input: [1.0, 5], expected: 1.0 },
      { input: [0.5, -1], expected: 0.0 },
    ],
    hint: "Use the complement: all k trials fail with probability (1 - p)^k.",
  },
  {
    id: "pr-022",
    title: "Multinomial Count",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Count the distinct orderings of a multiset described by its item counts.\n\nThe multinomial count is n! / (c_1! * c_2! * ...) where n = sum(counts). Return 0 if any count is negative and 1 for an empty list.",
    starterCode: `import math


def multinomial_count(counts):
    # Your code here
    pass`,
    solution: `import math


def multinomial_count(counts):
    if len(counts) == 0:
        return 1
    total = 0
    for c in counts:
        if c < 0:
            return 0
        total += c
    result = math.factorial(total)
    for c in counts:
        result //= math.factorial(c)
    return result`,
    testCases: [
      { input: [[2, 1]], expected: 3 },
      { input: [[1, 1, 1]], expected: 6 },
      { input: [[3, 0]], expected: 1 },
      { input: [[2, 2, 2]], expected: 90 },
      { input: [[]], expected: 1 },
    ],
    hint: "Divide n! by the factorial of each repeated count.",
  },
  {
    id: "pr-023",
    title: "Standard Deviation of Discrete RV",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Standard deviation of a discrete random variable with the given values and probabilities.\n\nVar(X) = sum((v_i - E[X])^2 * p_i) and the result is sqrt(Var(X)).",
    starterCode: `import math


def standard_deviation_discrete(values, probs):
    # Your code here
    pass`,
    solution: `import math


def standard_deviation_discrete(values, probs):
    mean = sum(v * p for v, p in zip(values, probs))
    var = sum((v - mean) ** 2 * p for v, p in zip(values, probs))
    return math.sqrt(var)`,
    testCases: [
      {
        input: [[1, 2, 3, 4, 5, 6], [1 / 6, 1 / 6, 1 / 6, 1 / 6, 1 / 6, 1 / 6]],
        expected: 1.707825127659933,
      },
      { input: [[0, 1], [0.5, 0.5]], expected: 0.5 },
      { input: [[5, 5, 5], [1 / 3, 1 / 3, 1 / 3]], expected: 0.0 },
    ],
  },
  {
    id: "pr-024",
    title: "Total Probability",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Total probability over a partition of hypotheses.\n\nGiven lists of prior probabilities and conditional probabilities, return sum(priors[i] * conditionals[i]). The two lists are assumed to have the same length.",
    starterCode: `def total_probability(priors, conditionals):
    # Your code here
    pass`,
    solution: `def total_probability(priors, conditionals):
    return sum(p * q for p, q in zip(priors, conditionals))`,
    testCases: [
      { input: [[0.3, 0.7], [0.2, 0.9]], expected: 0.69 },
      { input: [[1.0], [0.4]], expected: 0.4 },
      { input: [[0.5, 0.5], [1.0, 0.0]], expected: 0.5 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Weight each conditional probability by its prior.",
  },
  {
    id: "pr-025",
    title: "Conditional Probability Table 2x2",
    category: "Probability",
    difficulty: "Medium",
    description:
      "A 2x2 table of joint counts is laid out as [[a, b], [c, d]]. Return the conditional probability P(row 0 | column 0) = a / (a + c).\n\nReturn 0.0 when a + c is 0.",
    starterCode: `def conditional_probability_table_2x2(table):
    # Your code here
    pass`,
    solution: `def conditional_probability_table_2x2(table):
    a = table[0][0]
    c = table[1][0]
    denom = a + c
    if denom == 0:
        return 0.0
    return a / denom`,
    testCases: [
      { input: [[[10, 5], [10, 15]]], expected: 0.5 },
      { input: [[[1, 2], [3, 4]]], expected: 0.25 },
      { input: [[[0, 1], [0, 2]]], expected: 0.0 },
      { input: [[[6, 2], [3, 9]]], expected: 0.6666666666666666 },
    ],
    hint: "Condition on the column total, not the grand total.",
  },
  {
    id: "pr-026",
    title: "Bayes Two Hypotheses",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Two-hypothesis Bayes update given a test result.\n\nReturn [P(H | positive), P(H | negative)] where sensitivity = P(+ | H), specificity = P(- | not H) and prior = P(H). Use total probability to compute P(+) and P(-), and return 0.0 for any zero denominator.",
    starterCode: `def bayes_two_hypotheses(prior, sensitivity, specificity):
    # Your code here
    pass`,
    solution: `def bayes_two_hypotheses(prior, sensitivity, specificity):
    p_pos = sensitivity * prior + (1.0 - specificity) * (1.0 - prior)
    p_neg = (1.0 - sensitivity) * prior + specificity * (1.0 - prior)
    post_pos = 0.0 if p_pos == 0 else sensitivity * prior / p_pos
    post_neg = 0.0 if p_neg == 0 else (1.0 - sensitivity) * prior / p_neg
    return [post_pos, post_neg]`,
    testCases: [
      { input: [0.01, 0.9, 0.95], expected: [0.15384615384615374, 0.0010621348911311734] },
      { input: [0.5, 1.0, 1.0], expected: [1.0, 0.0] },
      { input: [0.0, 0.9, 0.9], expected: [0.0, 0.0] },
      { input: [1.0, 0.8, 0.7], expected: [1.0, 1.0] },
    ],
    hint: "P(+) = sensitivity * prior + (1 - specificity) * (1 - prior).",
  },
  {
    id: "pr-027",
    title: "Multinomial PMF",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Multinomial probability mass function for one outcome.\n\nP(counts) = n! / (c_1! * ...) * p_1^c_1 * ... where n = sum(counts). Return 0.0 if any count is negative; an empty outcome has probability 1.0.",
    starterCode: `import math


def multinomial_pmf(counts, probs):
    # Your code here
    pass`,
    solution: `import math


def multinomial_pmf(counts, probs):
    total = 0
    for c in counts:
        if c < 0:
            return 0.0
        total += c
    coeff = math.factorial(total)
    for c in counts:
        coeff //= math.factorial(c)
    result = float(coeff)
    for c, p in zip(counts, probs):
        result *= p ** c
    return result`,
    testCases: [
      { input: [[2, 1], [0.5, 0.5]], expected: 0.375 },
      { input: [[1, 1, 1], [1 / 3, 1 / 3, 1 / 3]], expected: 0.2222222222222222 },
      { input: [[0, 2], [0.3, 0.7]], expected: 0.48999999999999994 },
      { input: [[3, 0], [0.5, 0.5]], expected: 0.125 },
    ],
    hint: "Multiply the multinomial coefficient by each probability raised to its count.",
  },
  {
    id: "pr-028",
    title: "Hypergeometric PMF",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Hypergeometric probability mass function: sampling draws items without replacement from a population with the given number of successes.\n\nP(X = x) = C(successes, x) * C(pop - successes, draws - x) / C(pop, draws). Return 0.0 for impossible draws.",
    starterCode: `import math


def hypergeometric_pmf(pop, successes, draws, x):
    # Your code here
    pass`,
    solution: `import math


def hypergeometric_pmf(pop, successes, draws, x):
    if draws < 0 or x < 0 or x > successes or draws > pop or draws - x > pop - successes:
        return 0.0
    denom = math.comb(pop, draws)
    if denom == 0:
        return 0.0
    return math.comb(successes, x) * math.comb(pop - successes, draws - x) / denom`,
    testCases: [
      { input: [52, 4, 5, 2], expected: 0.03992981808107859 },
      { input: [10, 3, 4, 2], expected: 0.3 },
      { input: [10, 3, 4, 0], expected: 0.16666666666666666 },
      { input: [10, 3, 4, 4], expected: 0.0 },
      { input: [5, 5, 5, 5], expected: 1.0 },
    ],
    hint: "Choose x successes and draws - x failures, then divide by all possible draws.",
  },
  {
    id: "pr-029",
    title: "Birthday Problem Probability",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Probability that at least two of n people share a birthday, assuming days equally likely birthdays.\n\nP(shared) = 1 - product from i = 0 to n - 1 of (1 - i / days). Return 0.0 for n <= 1 and 1.0 when n > days.",
    starterCode: `def birthday_probability(n, days):
    # Your code here
    pass`,
    solution: `def birthday_probability(n, days):
    if n <= 1 or days <= 0:
        return 0.0
    if n > days:
        return 1.0
    p_all_diff = 1.0
    for i in range(n):
        p_all_diff *= 1.0 - i / days
    return 1.0 - p_all_diff`,
    testCases: [
      { input: [23, 365], expected: 0.5072972343239854 },
      { input: [1, 365], expected: 0.0 },
      { input: [2, 365], expected: 0.002739726027397249 },
      { input: [23, 1], expected: 1.0 },
      { input: [57, 365], expected: 0.9901224593411699 },
    ],
    hint: "Complement of all birthdays being distinct.",
  },
  {
    id: "pr-030",
    title: "Coupon Collector Expected Count",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Expected number of draws to collect all n distinct coupons: n * H_n, where H_n = 1 + 1/2 + ... + 1/n.\n\nReturn 0.0 for n <= 0.",
    starterCode: `def coupon_collector_expected(n):
    # Your code here
    pass`,
    solution: `def coupon_collector_expected(n):
    if n <= 0:
        return 0.0
    total = 0.0
    for k in range(1, n + 1):
        total += 1.0 / k
    return n * total`,
    testCases: [
      { input: [1], expected: 1.0 },
      { input: [2], expected: 3.0 },
      { input: [3], expected: 5.5 },
      { input: [10], expected: 29.289682539682538 },
      { input: [52], expected: 235.97828543626724 },
    ],
    hint: "After k distinct coupons, the expected wait for a new one is n / (n - k).",
  },
  {
    id: "pr-031",
    title: "Binomial CDF",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Binomial cumulative distribution function P(X <= k) for n trials and success probability p.\n\nSum C(n, i) * p^i * (1 - p)^(n - i) for i from 0 to k. Return 0.0 for k < 0 and 1.0 for k >= n.",
    starterCode: `import math


def binomial_cdf(n, p, k):
    # Your code here
    pass`,
    solution: `import math


def binomial_cdf(n, p, k):
    if k < 0:
        return 0.0
    if k >= n:
        return 1.0
    total = 0.0
    for i in range(k + 1):
        total += math.comb(n, i) * p ** i * (1.0 - p) ** (n - i)
    return total`,
    testCases: [
      { input: [10, 0.5, 5], expected: 0.623046875 },
      { input: [10, 0.5, 0], expected: 0.0009765625 },
      { input: [10, 0.5, 9], expected: 0.9990234375 },
      { input: [5, 0.2, -1], expected: 0.0 },
      { input: [5, 0.2, 5], expected: 1.0 },
    ],
    hint: "Sum the pmf terms from i = 0 through k.",
  },
  {
    id: "pr-032",
    title: "Negative Binomial PMF",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Negative binomial probability mass function: probability that the r-th success occurs on trial k.\n\nP(X = k) = C(k - 1, r - 1) * p^r * (1 - p)^(k - r) for k >= r >= 1. Return 0.0 otherwise.",
    starterCode: `import math


def negative_binomial_pmf(r, p, k):
    # Your code here
    pass`,
    solution: `import math


def negative_binomial_pmf(r, p, k):
    if r < 1 or k < r:
        return 0.0
    return math.comb(k - 1, r - 1) * p ** r * (1.0 - p) ** (k - r)`,
    testCases: [
      { input: [1, 0.5, 3], expected: 0.125 },
      { input: [2, 0.5, 4], expected: 0.1875 },
      { input: [3, 0.3, 5], expected: 0.07937999999999998 },
      { input: [2, 0.5, 1], expected: 0.0 },
    ],
    hint: "Arrange r - 1 successes among the first k - 1 trials, then succeed again.",
  },
  {
    id: "pr-033",
    title: "Poisson CDF",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Poisson cumulative distribution function P(X <= k) with rate lam.\n\nSum lam^i * e^(-lam) / i! for i from 0 to k. Return 0.0 if lam < 0 or k < 0.",
    starterCode: `import math


def poisson_cdf(lam, k):
    # Your code here
    pass`,
    solution: `import math


def poisson_cdf(lam, k):
    if lam < 0 or k < 0:
        return 0.0
    total = 0.0
    for i in range(k + 1):
        total += lam ** i * math.exp(-lam) / math.factorial(i)
    return total`,
    testCases: [
      { input: [2, 0], expected: 0.1353352832366127 },
      { input: [2, 2], expected: 0.6766764161830635 },
      { input: [3, 10], expected: 0.9997076630493528 },
      { input: [1, -1], expected: 0.0 },
      { input: [0, 0], expected: 1.0 },
    ],
  },
  {
    id: "pr-034",
    title: "Two Dice Sum Distribution",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Return the probability distribution of the sum of two independent fair dice, each with the given number of sides.\n\nThe result is a list giving P(sum = 2), P(sum = 3), ..., P(sum = 2 * sides). Return an empty list for sides <= 0.",
    starterCode: `def two_dice_sum_distribution(sides):
    # Your code here
    pass`,
    solution: `def two_dice_sum_distribution(sides):
    if sides <= 0:
        return []
    probs = []
    for s in range(2, 2 * sides + 1):
        count = s - 1
        if count > sides:
            count = 2 * sides + 1 - s
        probs.append(count / (sides * sides))
    return probs`,
    testCases: [
      {
        input: [6],
        expected: [
          0.027777777777777776,
          0.05555555555555555,
          0.08333333333333333,
          0.1111111111111111,
          0.1388888888888889,
          0.16666666666666666,
          0.1388888888888889,
          0.1111111111111111,
          0.08333333333333333,
          0.05555555555555555,
          0.027777777777777776,
        ],
      },
      { input: [2], expected: [0.25, 0.5, 0.25] },
      { input: [1], expected: [1.0] },
    ],
    hint: "The number of ways to roll sum s rises to a plateau then falls symmetrically.",
  },
  {
    id: "pr-035",
    title: "Card Draw At Least One",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Probability of drawing at least one target card in draws cards taken without replacement from a deck.\n\nP(at least one) = 1 - C(deck - targets, draws) / C(deck, draws). Return 0.0 when deck, targets or draws is not positive and 1.0 when every draw must be a target.",
    starterCode: `import math


def card_draw_at_least_one(deck, targets, draws):
    # Your code here
    pass`,
    solution: `import math


def card_draw_at_least_one(deck, targets, draws):
    if deck <= 0 or targets <= 0 or draws <= 0:
        return 0.0
    if draws >= deck:
        return 1.0
    if deck - targets < draws:
        return 1.0
    denom = math.comb(deck, draws)
    if denom == 0:
        return 0.0
    return 1.0 - math.comb(deck - targets, draws) / denom`,
    testCases: [
      { input: [52, 4, 5], expected: 0.34115800166220334 },
      { input: [52, 4, 0], expected: 0.0 },
      { input: [10, 10, 3], expected: 1.0 },
      { input: [6, 1, 6], expected: 1.0 },
      { input: [10, 0, 5], expected: 0.0 },
    ],
    hint: "Complement of drawing only non-target cards.",
  },
  {
    id: "pr-036",
    title: "Normal CDF via erf",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Normal cumulative distribution function evaluated at x using the error function.\n\nF(x) = 0.5 * (1 + erf((x - mu) / (sigma * sqrt(2)))). Return 0.0 when sigma <= 0.",
    starterCode: `import math


def normal_cdf_erf(x, mu, sigma):
    # Your code here
    pass`,
    solution: `import math


def normal_cdf_erf(x, mu, sigma):
    if sigma <= 0:
        return 0.0
    z = (x - mu) / (sigma * math.sqrt(2.0))
    return 0.5 * (1.0 + math.erf(z))`,
    testCases: [
      { input: [0.0, 0.0, 1.0], expected: 0.5 },
      { input: [1.0, 0.0, 1.0], expected: 0.8413447460685429 },
      { input: [1.96, 0.0, 1.0], expected: 0.9750021048517796 },
      { input: [0.0, 0.0, -1.0], expected: 0.0 },
    ],
    hint: "Standardize x into a z-score first.",
  },
  {
    id: "pr-037",
    title: "Markov Chain One-Step",
    category: "Probability",
    difficulty: "Medium",
    description:
      "One-step update of a Markov chain distribution.\n\nGiven a probability vector state and a transition matrix where matrix[i][j] = P(i -> j), return the row vector with entries sum_i state[i] * matrix[i][j].",
    starterCode: `def markov_one_step(state, matrix):
    # Your code here
    pass`,
    solution: `def markov_one_step(state, matrix):
    size = len(state)
    result = []
    for j in range(size):
        total = 0.0
        for i in range(size):
            total += state[i] * matrix[i][j]
        result.append(total)
    return result`,
    testCases: [
      { input: [[1.0, 0.0], [[0.5, 0.5], [0.2, 0.8]]], expected: [0.5, 0.5] },
      { input: [[0.0, 1.0], [[0.5, 0.5], [0.2, 0.8]]], expected: [0.2, 0.8] },
      { input: [[0.3, 0.7], [[1.0, 0.0], [0.4, 0.6]]], expected: [0.58, 0.42] },
      { input: [[0.5, 0.5], [[1.0, 0.0], [1.0, 0.0]]], expected: [1.0, 0.0] },
    ],
    hint: "Multiply the row vector by the transition matrix.",
  },
  {
    id: "pr-038",
    title: "Stationary Distribution Two-State",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Stationary distribution of a two-state Markov chain.\n\nState 0 goes to state 1 with probability p and state 1 goes to state 0 with probability q. Return [pi_0, pi_1] = [q / (p + q), p / (p + q)]. If p + q is 0 return [1.0, 0.0].",
    starterCode: `def stationary_distribution_2state(p, q):
    # Your code here
    pass`,
    solution: `def stationary_distribution_2state(p, q):
    total = p + q
    if total == 0:
        return [1.0, 0.0]
    return [q / total, p / total]`,
    testCases: [
      { input: [0.1, 0.2], expected: [0.6666666666666666, 0.3333333333333333] },
      { input: [0.5, 0.5], expected: [0.5, 0.5] },
      { input: [0.0, 1.0], expected: [1.0, 0.0] },
      { input: [1.0, 0.0], expected: [0.0, 1.0] },
      { input: [0.0, 0.0], expected: [1.0, 0.0] },
    ],
    hint: "Solve pi_0 * p = pi_1 * q together with pi_0 + pi_1 = 1.",
  },
  {
    id: "pr-039",
    title: "Convolution of Two PMFs",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Convolution of two discrete probability mass functions.\n\nIf out = convolve(pmf_a, pmf_b) then out[k] = sum over i of pmf_a[i] * pmf_b[k - i], the distribution of the sum of two independent variables. Return an empty list if either input is empty.",
    starterCode: `def convolution_pmfs(pmf_a, pmf_b):
    # Your code here
    pass`,
    solution: `def convolution_pmfs(pmf_a, pmf_b):
    if len(pmf_a) == 0 or len(pmf_b) == 0:
        return []
    out = [0.0] * (len(pmf_a) + len(pmf_b) - 1)
    for i, a in enumerate(pmf_a):
        for j, b in enumerate(pmf_b):
            out[i + j] += a * b
    return out`,
    testCases: [
      { input: [[0.5, 0.5], [0.5, 0.5]], expected: [0.25, 0.5, 0.25] },
      { input: [[1.0], [0.3, 0.7]], expected: [0.3, 0.7] },
      { input: [[0.2, 0.8], [1.0]], expected: [0.2, 0.8] },
      { input: [[0.3, 0.7], [0.4, 0.6]], expected: [0.12, 0.45999999999999996, 0.42] },
      { input: [[0.5, 0.5], [0.5, 0.5, 0.0]], expected: [0.25, 0.5, 0.25, 0.0] },
    ],
    hint: "Pair every outcome of the first variable with every outcome of the second.",
  },
  {
    id: "pr-040",
    title: "MGF of Bernoulli",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Moment generating function of a Bernoulli(p) random variable evaluated at t.\n\nM(t) = (1 - p) + p * e^t.",
    starterCode: `import math


def mgf_bernoulli(p, t):
    # Your code here
    pass`,
    solution: `import math


def mgf_bernoulli(p, t):
    return (1.0 - p) + p * math.exp(t)`,
    testCases: [
      { input: [0.5, 0.0], expected: 1.0 },
      { input: [0.5, 1.0], expected: 1.8591409142295225 },
      { input: [0.2, 2.0], expected: 2.2778112197861304 },
      { input: [0.0, 3.0], expected: 1.0 },
    ],
    hint: "Take the expectation of e^(tX) over X in {0, 1}.",
  },
  {
    id: "pr-041",
    title: "Correlation of Bernoulli Variables",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Correlation coefficient of two Bernoulli variables.\n\nrho = (P(A and B) - P(A) * P(B)) / sqrt(P(A) * (1 - P(A)) * P(B) * (1 - P(B))). Return 0.0 when the denominator is 0.",
    starterCode: `import math


def correlation_bernoulli(p_a, p_b, p_ab):
    # Your code here
    pass`,
    solution: `import math


def correlation_bernoulli(p_a, p_b, p_ab):
    cov = p_ab - p_a * p_b
    var_a = p_a * (1.0 - p_a)
    var_b = p_b * (1.0 - p_b)
    denom = math.sqrt(var_a * var_b)
    if denom == 0:
        return 0.0
    return cov / denom`,
    testCases: [
      { input: [0.5, 0.5, 0.25], expected: 0.0 },
      { input: [0.5, 0.5, 0.4], expected: 0.6000000000000001 },
      { input: [0.2, 0.3, 0.06], expected: 0.0 },
      { input: [0.5, 0.5, 0.0], expected: -1.0 },
      { input: [0.0, 0.5, 0.0], expected: 0.0 },
    ],
    hint: "Normalize the covariance by the product of the two standard deviations.",
  },
  {
    id: "pr-042",
    title: "Bayes Three Hypotheses",
    category: "Probability",
    difficulty: "Hard",
    description:
      "Posterior probabilities of three mutually exclusive hypotheses after observing data.\n\nGiven prior probabilities and likelihoods, return the normalized posterior list joints[i] / sum(joints) where joints[i] = priors[i] * likelihoods[i]. If the total is 0 return a list of zeros.",
    starterCode: `def bayes_three_hypotheses(priors, likelihoods):
    # Your code here
    pass`,
    solution: `def bayes_three_hypotheses(priors, likelihoods):
    joints = [a * b for a, b in zip(priors, likelihoods)]
    total = sum(joints)
    if total == 0:
        return [0.0 for _ in priors]
    return [j / total for j in joints]`,
    testCases: [
      {
        input: [[0.2, 0.3, 0.5], [0.5, 0.6, 0.1]],
        expected: [0.30303030303030304, 0.5454545454545454, 0.15151515151515152],
      },
      { input: [[0.5, 0.25, 0.25], [0.1, 0.5, 0.9]], expected: [0.125, 0.3125, 0.5625] },
      {
        input: [[1 / 3, 1 / 3, 1 / 3], [1.0, 1.0, 1.0]],
        expected: [0.3333333333333333, 0.3333333333333333, 0.3333333333333333],
      },
      { input: [[0.0, 0.5, 0.5], [0.9, 0.4, 0.4]], expected: [0.0, 0.5, 0.5] },
    ],
    hint: "Scale the joint probabilities so they sum to 1.",
  },
  {
    id: "pr-043",
    title: "Pairwise vs Mutual Independence",
    category: "Probability",
    difficulty: "Hard",
    description:
      "Check pairwise and mutual independence of three events.\n\nprobs = [P(A), P(B), P(C)] and joints = [P(A and B), P(A and C), P(B and C), P(A and B and C)]. Return a dictionary with boolean keys pairwise and mutual: pairwise holds when each pair product matches its joint within 1e-9, and mutual also requires P(A and B and C) = P(A) * P(B) * P(C).",
    starterCode: `def pairwise_and_mutual_independence(probs, joints):
    # Your code here
    pass`,
    solution: `def pairwise_and_mutual_independence(probs, joints):
    p1, p2, p3 = probs
    p12, p13, p23, p123 = joints
    tol = 1e-9
    pairwise = (
        abs(p12 - p1 * p2) < tol
        and abs(p13 - p1 * p3) < tol
        and abs(p23 - p2 * p3) < tol
    )
    mutual = pairwise and abs(p123 - p1 * p2 * p3) < tol
    return {"pairwise": pairwise, "mutual": mutual}`,
    testCases: [
      {
        input: [[0.5, 0.5, 0.5], [0.25, 0.25, 0.25, 0.125]],
        expected: { pairwise: true, mutual: true },
      },
      {
        input: [[0.5, 0.5, 0.5], [0.25, 0.25, 0.25, 0.0]],
        expected: { pairwise: true, mutual: false },
      },
      {
        input: [[0.5, 0.5, 0.5], [0.3, 0.25, 0.25, 0.125]],
        expected: { pairwise: false, mutual: false },
      },
      {
        input: [[0.2, 0.4, 0.5], [0.08, 0.1, 0.2, 0.04]],
        expected: { pairwise: true, mutual: true },
      },
    ],
    hint: "Pairwise independence does not imply mutual independence.",
  },
  {
    id: "pr-044",
    title: "Inclusion-Exclusion Three Events",
    category: "Probability",
    difficulty: "Hard",
    description:
      "Inclusion-exclusion probability of the union of three events.\n\nP(A union B union C) = P(A) + P(B) + P(C) - P(A and B) - P(A and C) - P(B and C) + P(A and B and C).",
    starterCode: `def inclusion_exclusion_three_events(p_a, p_b, p_c, p_ab, p_ac, p_bc, p_abc):
    # Your code here
    pass`,
    solution: `def inclusion_exclusion_three_events(p_a, p_b, p_c, p_ab, p_ac, p_bc, p_abc):
    return p_a + p_b + p_c - p_ab - p_ac - p_bc + p_abc`,
    testCases: [
      { input: [0.5, 0.4, 0.3, 0.2, 0.15, 0.12, 0.06], expected: 0.79 },
      { input: [0.5, 0.5, 0.5, 0.25, 0.25, 0.25, 0.125], expected: 0.875 },
      { input: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], expected: 0.0 },
      { input: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0], expected: 1.0 },
      { input: [0.3, 0.2, 0.1, 0.0, 0.0, 0.0, 0.0], expected: 0.6 },
    ],
    hint: "Add singles, subtract pairs, add back the triple intersection.",
  },
  {
    id: "pr-045",
    title: "Markov Chain N-Step Distribution",
    category: "Probability",
    difficulty: "Hard",
    description:
      "Distribution of a Markov chain after n steps.\n\nGiven an initial probability vector state and transition matrix matrix[i][j] = P(i -> j), multiply the vector by the matrix n times. n = 0 returns the initial vector converted to floats.",
    starterCode: `def markov_n_step(state, matrix, n):
    # Your code here
    pass`,
    solution: `def markov_n_step(state, matrix, n):
    vec = [float(x) for x in state]
    size = len(vec)
    for _ in range(n):
        nxt = []
        for j in range(size):
            total = 0.0
            for i in range(size):
                total += vec[i] * matrix[i][j]
            nxt.append(total)
        vec = nxt
    return vec`,
    testCases: [
      { input: [[1.0, 0.0], [[0.5, 0.5], [0.2, 0.8]], 2], expected: [0.35, 0.65] },
      { input: [[0.0, 1.0], [[0.5, 0.5], [0.2, 0.8]], 1], expected: [0.2, 0.8] },
      { input: [[1.0, 0.0], [[0.5, 0.5], [0.2, 0.8]], 0], expected: [1.0, 0.0] },
      { input: [[0.3, 0.7], [[1.0, 0.0], [1.0, 0.0]], 5], expected: [1.0, 0.0] },
      {
        input: [[1.0, 0.0, 0.0], [[0.5, 0.25, 0.25], [0.1, 0.6, 0.3], [0.0, 0.0, 1.0]], 2],
        expected: [0.275, 0.275, 0.45],
      },
    ],
    hint: "Repeat the one-step update n times, reusing the previous result.",
  },
  {
    id: "pr-046",
    title: "Absorbing Probability Two-State",
    category: "Probability",
    difficulty: "Hard",
    description:
      "Absorption in a two-state Markov chain where state 0 is absorbing.\n\nFrom state 1 the chain moves to state 0 with probability p and otherwise stays in state 1. Starting from state 1, return [probability of eventual absorption, expected number of steps]: [1.0, 1.0 / p] when 0 < p < 1, [1.0, 1.0] when p >= 1, and [0.0, -1.0] when p <= 0.",
    starterCode: `def absorbing_probability_two_state(p):
    # Your code here
    pass`,
    solution: `def absorbing_probability_two_state(p):
    if p <= 0:
        return [0.0, -1.0]
    if p >= 1:
        return [1.0, 1.0]
    return [1.0, 1.0 / p]`,
    testCases: [
      { input: [0.5], expected: [1.0, 2.0] },
      { input: [0.25], expected: [1.0, 4.0] },
      { input: [1.0], expected: [1.0, 1.0] },
      { input: [0.0], expected: [0.0, -1.0] },
      { input: [0.1], expected: [1.0, 10.0] },
    ],
    hint: "Absorption follows a geometric distribution with success probability p.",
  },
  {
    id: "pr-047",
    title: "Random Walk Expected Hitting Time",
    category: "Probability",
    difficulty: "Hard",
    description:
      "Expected hitting time of 0 for a random walk on nonnegative integers.\n\nStarting from k, each step moves up with probability p and down with probability 1 - p, and 0 is absorbing. Return k * k when p = 0.5, k / (1 - 2p) when p < 0.5, -1.0 when p > 0.5, and 0.0 for k <= 0.",
    starterCode: `def random_walk_expected_hitting_time(k, p):
    # Your code here
    pass`,
    solution: `def random_walk_expected_hitting_time(k, p):
    if k <= 0:
        return 0.0
    if p > 0.5:
        return -1.0
    if p == 0.5:
        return float(k * k)
    return k / (1.0 - 2.0 * p)`,
    testCases: [
      { input: [1, 0.5], expected: 1.0 },
      { input: [3, 0.5], expected: 9.0 },
      { input: [4, 0.25], expected: 8.0 },
      { input: [2, 0.75], expected: -1.0 },
      { input: [0, 0.5], expected: 0.0 },
    ],
    hint: "Solve E_k = 1 + p * E_(k+1) + (1 - p) * E_(k-1) with E_0 = 0.",
  },
  {
    id: "pr-048",
    title: "Gambler's Ruin",
    category: "Probability",
    difficulty: "Hard",
    description:
      "Gambler's ruin probability of reaching the target before losing everything.\n\nStarting with start units, each round wins one unit with probability p. Return P(hit target) = (1 - r^start) / (1 - r^target) with r = (1 - p) / p when p is not 0.5, and start / target when p = 0.5. Return 0.0 for start <= 0 and 1.0 for start >= target.",
    starterCode: `def gambler_ruin(start, target, p):
    # Your code here
    pass`,
    solution: `def gambler_ruin(start, target, p):
    if start <= 0:
        return 0.0
    if start >= target:
        return 1.0
    if p <= 0:
        return 0.0
    if p >= 1:
        return 1.0
    if abs(p - 0.5) < 1e-15:
        return start / target
    r = (1.0 - p) / p
    return (1.0 - r ** start) / (1.0 - r ** target)`,
    testCases: [
      { input: [1, 3, 0.5], expected: 0.3333333333333333 },
      { input: [2, 3, 0.5], expected: 0.6666666666666666 },
      { input: [1, 3, 0.75], expected: 0.6923076923076923 },
      { input: [1, 3, 0.25], expected: 0.07692307692307693 },
      { input: [0, 5, 0.5], expected: 0.0 },
      { input: [5, 5, 0.5], expected: 1.0 },
    ],
    hint: "Set up the recurrence h_i = p * h_(i+1) + q * h_(i-1) with absorbing boundaries.",
  },
  {
    id: "pr-049",
    title: "LLN Running Average (Seeded)",
    category: "Probability",
    difficulty: "Hard",
    description:
      "Law of large numbers demonstration with a seeded simulation.\n\nSimulate n independent Bernoulli(p) trials using random.Random(seed) and return the observed success frequency. Return 0.0 for n <= 0. Decide each trial with rng.random() < p so results are reproducible.",
    starterCode: `import random


def lln_running_average(n, p, seed):
    # Your code here
    pass`,
    solution: `import random


def lln_running_average(n, p, seed):
    if n <= 0:
        return 0.0
    rng = random.Random(seed)
    hits = 0
    for _ in range(n):
        if rng.random() < p:
            hits += 1
    return hits / n`,
    testCases: [
      { input: [10000, 0.5, 42], expected: 0.499 },
      { input: [10000, 0.5, 7], expected: 0.503 },
      { input: [1, 0.5, 0], expected: 0.0 },
      { input: [100, 0.3, 123], expected: 0.35 },
    ],
    hint: "Seed a private random.Random instance instead of the global module state.",
  },
  {
    id: "pr-050",
    title: "CLT Mean of Uniform Sample (Seeded)",
    category: "Probability",
    difficulty: "Hard",
    description:
      "Central limit theorem demonstration with seeded uniform samples.\n\nDraw trials independent samples of size n from Uniform(0, 1) using random.Random(seed), compute each sample mean, and return [mean of the sample means, standard deviation of the sample means]. Return [0.0, 0.0] if n <= 0 or trials <= 0.",
    starterCode: `import math
import random


def clt_uniform_sample_mean(n, trials, seed):
    # Your code here
    pass`,
    solution: `import math
import random


def clt_uniform_sample_mean(n, trials, seed):
    if n <= 0 or trials <= 0:
        return [0.0, 0.0]
    rng = random.Random(seed)
    means = []
    for _ in range(trials):
        total = 0.0
        for _ in range(n):
            total += rng.random()
        means.append(total / n)
    grand = sum(means) / len(means)
    var = sum((m - grand) ** 2 for m in means) / len(means)
    return [grand, math.sqrt(var)]`,
    testCases: [
      {
        input: [30, 1000, 42],
        expected: [0.49980475767324967, 0.05228350690430031],
      },
      {
        input: [10, 500, 1],
        expected: [0.5008574597577204, 0.09741832975350079],
      },
      {
        input: [5, 2000, 123],
        expected: [0.5017896092714739, 0.12919952725281916],
      },
    ],
    hint: "Use the population standard deviation of the sample means (divide by trials).",
  },
];
