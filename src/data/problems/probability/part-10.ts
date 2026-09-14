import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "pr-341",
    title: "Total Probability Two Partitions",
    category: "Probability",
    difficulty: "Easy",
    description:
      "For the partition {A, not A}, the law of total probability gives P(B) = P(B | A) P(A) + P(B | not A) P(not A).\n\nGiven P(B | A), P(A), and P(B | not A), return P(B).",
    starterCode: `def total_probability_two_partitions(p_b_given_a, p_a, p_b_given_not_a):
    # Your code here
    pass`,
    solution: `def total_probability_two_partitions(p_b_given_a, p_a, p_b_given_not_a):
    return p_b_given_a * p_a + p_b_given_not_a * (1.0 - p_a)`,
    testCases: [
      { input: [0.8, 0.3, 0.2], expected: 0.38 },
      { input: [0.5, 0.5, 0.5], expected: 0.5 },
      { input: [1.0, 0.9, 0.0], expected: 0.9 },
    ],
    hint: "Weight each conditional by the probability of its condition.",
  },
  {
    id: "pr-342",
    title: "Bayes Posterior Three Hypotheses",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Given prior probabilities and likelihoods for three mutually exclusive hypotheses, the posterior is prior_i * likelihood_i normalized to sum to one.\n\nGiven the priors and likelihoods, return the posterior list.",
    starterCode: `def bayes_posterior_three_hypotheses(priors, likelihoods):
    # Your code here
    pass`,
    solution: `def bayes_posterior_three_hypotheses(priors, likelihoods):
    joint = [p * l for p, l in zip(priors, likelihoods)]
    total = sum(joint)
    return [j / total for j in joint]`,
    testCases: [
      { input: [[0.2, 0.3, 0.5], [0.1, 0.5, 0.2]], expected: [0.07407407407407408, 0.5555555555555555, 0.37037037037037035] },
      { input: [[1.0, 0.0, 0.0], [0.4, 0.6, 0.9]], expected: [1.0, 0.0, 0.0] },
      { input: [[0.25, 0.25, 0.5], [0.8, 0.8, 0.2]], expected: [0.4, 0.4, 0.2] },
    ],
    hint: "Multiply priors by likelihoods, then renormalize.",
  },
  {
    id: "pr-343",
    title: "Posterior Odds from Likelihood Ratio",
    category: "Probability",
    difficulty: "Easy",
    description:
      "In odds form, Bayes' rule is posterior odds = prior odds * likelihood ratio.\n\nGiven the prior odds and the likelihood ratio, return the posterior odds.",
    starterCode: `def posterior_odds_from_likelihood_ratio(prior_odds, likelihood_ratio):
    # Your code here
    pass`,
    solution: `def posterior_odds_from_likelihood_ratio(prior_odds, likelihood_ratio):
    return prior_odds * likelihood_ratio`,
    testCases: [
      { input: [1.0, 4.0], expected: 4.0 },
      { input: [0.25, 10.0], expected: 2.5 },
      { input: [3.0, 0.5], expected: 1.5 },
    ],
    hint: "The likelihood ratio is evidence strength.",
  },
  {
    id: "pr-344",
    title: "Conditional Probability from Joint",
    category: "Probability",
    difficulty: "Easy",
    description:
      "The conditional probability is P(A | B) = P(A and B) / P(B), with P(B) > 0.\n\nGiven the joint probability and P(B), return the conditional probability.",
    starterCode: `def conditional_probability_from_joint(joint, p_b):
    # Your code here
    pass`,
    solution: `def conditional_probability_from_joint(joint, p_b):
    return joint / p_b`,
    testCases: [
      { input: [0.1, 0.5], expected: 0.2 },
      { input: [0.0, 0.25], expected: 0.0 },
      { input: [0.3, 0.3], expected: 1.0 },
    ],
    hint: "Restrict the sample space to B and renormalize.",
  },
  {
    id: "pr-345",
    title: "Independent Event Pair Check",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Two events are independent when P(A and B) equals P(A) P(B); check within a tolerance.\n\nGiven the three probabilities and the tolerance, return True when the pair is independent.",
    starterCode: `def independent_event_pair_check(p_a, p_b, p_both, tol):
    # Your code here
    pass`,
    solution: `def independent_event_pair_check(p_a, p_b, p_both, tol):
    return abs(p_both - p_a * p_b) < tol`,
    testCases: [
      { input: [0.5, 0.5, 0.25, 1e-09], expected: true },
      { input: [0.5, 0.5, 0.3, 1e-09], expected: false },
      { input: [0.2, 0.3, 0.06, 1e-09], expected: true },
    ],
    hint: "Compare the joint against the product with a strict tolerance.",
  },
  {
    id: "pr-346",
    title: "Posterior After Positive Test",
    category: "Probability",
    difficulty: "Hard",
    description:
      "With prevalence p, sensitivity se, and specificity sp, the posterior probability of disease given a positive test is se * p / (se * p + (1 - sp)(1 - p)).\n\nGiven sensitivity, specificity, and prevalence, return the posterior.",
    starterCode: `def posterior_after_positive_test(sensitivity, specificity, prevalence):
    # Your code here
    pass`,
    solution: `def posterior_after_positive_test(sensitivity, specificity, prevalence):
    num = sensitivity * prevalence
    den = num + (1.0 - specificity) * (1.0 - prevalence)
    return num / den`,
    testCases: [
      { input: [0.9, 0.9, 0.01], expected: 0.08333333333333336 },
      { input: [0.99, 0.95, 0.1], expected: 0.6874999999999998 },
      { input: [1.0, 1.0, 0.5], expected: 1.0 },
    ],
    hint: "The denominator is the total probability of a positive test.",
  },
  {
    id: "pr-347",
    title: "Sequential Posterior Two Tests",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Two independent positive tests update the prevalence twice: apply the posterior formula once, then use the result as the prior for the second application.\n\nGiven the prior prevalence, sensitivity, and specificity, return the posterior after both tests.",
    starterCode: `def sequential_posterior_two_tests(prior, sensitivity, specificity):
    # Your code here
    pass`,
    solution: `def sequential_posterior_two_tests(prior, sensitivity, specificity):
    def update(p):
        num = sensitivity * p
        den = num + (1.0 - specificity) * (1.0 - p)
        return num / den
    return update(update(prior))`,
    testCases: [
      { input: [0.01, 0.9, 0.9], expected: 0.4500000000000001 },
      { input: [0.1, 0.99, 0.95], expected: 0.9775583482944344 },
      { input: [0.5, 0.8, 0.8], expected: 0.9411764705882353 },
    ],
    hint: "The output of the first update becomes the prior for the second.",
  },
  {
    id: "pr-348",
    title: "Binomial CDF Prefix",
    category: "Probability",
    difficulty: "Easy",
    description:
      "The binomial CDF at k is sum_{j=0}^{k} C(n, j) p^j (1 - p)^(n - j).\n\nGiven n, k, and p, return the probability of at most k successes.",
    starterCode: `def binomial_cdf_prefix(n, k, p):
    # Your code here
    pass`,
    solution: `def binomial_cdf_prefix(n, k, p):
    import math
    return sum(math.comb(n, j) * p ** j * (1.0 - p) ** (n - j) for j in range(k + 1))`,
    testCases: [
      { input: [5, 2, 0.5], expected: 0.5 },
      { input: [4, 4, 0.3], expected: 0.9999999999999999 },
      { input: [3, 0, 0.2], expected: 0.5120000000000001 },
    ],
    hint: "Cumulate the pmf from zero to k.",
  },
  {
    id: "pr-349",
    title: "Geometric PMF Value",
    category: "Probability",
    difficulty: "Easy",
    description:
      "The geometric pmf for the number of trials until the first success is P(K = k) = (1 - p)^(k - 1) p for k >= 1.\n\nGiven p and k, return the probability.",
    starterCode: `def geometric_pmf_value(p, k):
    # Your code here
    pass`,
    solution: `def geometric_pmf_value(p, k):
    return (1.0 - p) ** (k - 1) * p`,
    testCases: [
      { input: [0.5, 3], expected: 0.125 },
      { input: [0.1, 1], expected: 0.1 },
      { input: [0.9, 2], expected: 0.08999999999999998 },
    ],
    hint: "Fail k - 1 times, then succeed.",
  },
  {
    id: "pr-350",
    title: "Negative Binomial PMF Value",
    category: "Probability",
    difficulty: "Medium",
    description:
      "For the number of failures K before the r-th success, P(K = k) = C(k + r - 1, k) (1 - p)^k p^r.\n\nGiven r, p, and k, return the probability.",
    starterCode: `def negative_binomial_pmf_value(r, p, k):
    # Your code here
    pass`,
    solution: `def negative_binomial_pmf_value(r, p, k):
    import math
    return math.comb(k + r - 1, k) * (1.0 - p) ** k * p ** r`,
    testCases: [
      { input: [2, 0.5, 1], expected: 0.25 },
      { input: [1, 0.2, 3], expected: 0.10240000000000003 },
      { input: [3, 0.6, 0], expected: 0.21599999999999997 },
    ],
    hint: "The last trial is a success; the rest array r - 1 successes among k failures.",
  },
  {
    id: "pr-351",
    title: "Hypergeometric PMF Value",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Drawing n items without replacement from a population of N with K successes, P(k successes) = C(K, k) C(N - K, n - k) / C(N, n).\n\nGiven N, K, n, and k, return the probability.",
    starterCode: `def hypergeometric_pmf_value(n_population, k_successes, n_draws, k_observed):
    # Your code here
    pass`,
    solution: `def hypergeometric_pmf_value(n_population, k_successes, n_draws, k_observed):
    import math
    return math.comb(k_successes, k_observed) * math.comb(n_population - k_successes, n_draws - k_observed) / math.comb(n_population, n_draws)`,
    testCases: [
      { input: [10, 4, 3, 2], expected: 0.3 },
      { input: [20, 10, 5, 2], expected: 0.34829721362229105 },
      { input: [5, 1, 2, 1], expected: 0.4 },
    ],
    hint: "Choose successes and failures separately, then divide by all draws.",
  },
  {
    id: "pr-352",
    title: "Poisson CDF Prefix",
    category: "Probability",
    difficulty: "Easy",
    description:
      "The Poisson CDF at k is sum_{j=0}^{k} exp(-lambda) lambda^j / j!.\n\nGiven lambda and k, return the probability of at most k events.",
    starterCode: `def poisson_cdf_prefix(lam, k):
    # Your code here
    pass`,
    solution: `def poisson_cdf_prefix(lam, k):
    import math
    return sum(math.exp(-lam) * lam ** j / math.factorial(j) for j in range(k + 1))`,
    testCases: [
      { input: [2.0, 1], expected: 0.4060058497098381 },
      { input: [1.0, 3], expected: 0.9810118431238463 },
      { input: [0.5, 0], expected: 0.6065306597126334 },
    ],
    hint: "Accumulate the Poisson pmf.",
  },
  {
    id: "pr-353",
    title: "Binomial Moments Mean Variance",
    category: "Probability",
    difficulty: "Medium",
    description:
      "A binomial(n, p) distribution has mean n p and variance n p (1 - p).\n\nGiven n and p, return [mean, variance].",
    starterCode: `def binomial_mean_and_variance(n, p):
    # Your code here
    pass`,
    solution: `def binomial_mean_and_variance(n, p):
    return [n * p, n * p * (1.0 - p)]`,
    testCases: [
      { input: [10, 0.5], expected: [5.0, 2.5] },
      { input: [100, 0.01], expected: [1.0, 0.99] },
      { input: [5, 1.0], expected: [5.0, 0.0] },
    ],
    hint: "Both moments are linear in n.",
  },
  {
    id: "pr-354",
    title: "Geometric Moments Mean Variance",
    category: "Probability",
    difficulty: "Medium",
    description:
      "For the trial-count geometric distribution, mean = 1 / p and variance = (1 - p) / p^2.\n\nGiven p in (0, 1], return [mean, variance].",
    starterCode: `def geometric_mean_and_variance(p):
    # Your code here
    pass`,
    solution: `def geometric_mean_and_variance(p):
    return [1.0 / p, (1.0 - p) / (p * p)]`,
    testCases: [
      { input: [0.5], expected: [2.0, 2.0] },
      { input: [0.1], expected: [10.0, 89.99999999999999] },
      { input: [1.0], expected: [1.0, 0.0] },
    ],
    hint: "The variance grows as success becomes rare.",
  },
  {
    id: "pr-355",
    title: "Poisson Moments Mean Variance",
    category: "Probability",
    difficulty: "Medium",
    description:
      "The Poisson distribution has mean and variance both equal to lambda.\n\nGiven lambda, return [mean, variance].",
    starterCode: `def poisson_mean_and_variance(lam):
    # Your code here
    pass`,
    solution: `def poisson_mean_and_variance(lam):
    return [lam, lam]`,
    testCases: [
      { input: [2.0], expected: [2.0, 2.0] },
      { input: [0.5], expected: [0.5, 0.5] },
      { input: [10.0], expected: [10.0, 10.0] },
    ],
    hint: "Equidispersion is the defining property.",
  },
  {
    id: "pr-356",
    title: "Negative Binomial Moments Mean Variance",
    category: "Probability",
    difficulty: "Hard",
    description:
      "For failures before the r-th success with success probability p, mean = r (1 - p) / p and variance = r (1 - p) / p^2.\n\nGiven r and p, return [mean, variance].",
    starterCode: `def negative_binomial_mean_and_variance(r, p):
    # Your code here
    pass`,
    solution: `def negative_binomial_mean_and_variance(r, p):
    return [r * (1.0 - p) / p, r * (1.0 - p) / (p * p)]`,
    testCases: [
      { input: [2, 0.5], expected: [2.0, 4.0] },
      { input: [1, 0.2], expected: [4.0, 19.999999999999996] },
      { input: [5, 0.8], expected: [1.2499999999999996, 1.5624999999999993] },
    ],
    hint: "It is a sum of r geometric failure counts.",
  },
  {
    id: "pr-357",
    title: "Hypergeometric Moments Mean Variance",
    category: "Probability",
    difficulty: "Hard",
    description:
      "For n draws without replacement from N items with K successes, mean = n K / N and variance = n (K / N)(1 - K / N)(N - n) / (N - 1).\n\nGiven N, K, and n, return [mean, variance]. Assume N > 1.",
    starterCode: `def hypergeometric_mean_and_variance(n_population, k_successes, n_draws):
    # Your code here
    pass`,
    solution: `def hypergeometric_mean_and_variance(n_population, k_successes, n_draws):
    p = k_successes / n_population
    mean = n_draws * p
    var = n_draws * p * (1.0 - p) * (n_population - n_draws) / (n_population - 1.0)
    return [mean, var]`,
    testCases: [
      { input: [10, 4, 3], expected: [1.2000000000000002, 0.56] },
      { input: [20, 10, 5], expected: [2.5, 0.9868421052631579] },
      { input: [100, 25, 10], expected: [2.5, 1.7045454545454546] },
    ],
    hint: "The finite population correction shrinks the binomial variance.",
  },
  {
    id: "pr-358",
    title: "Discrete Uniform Mean and Variance",
    category: "Probability",
    difficulty: "Easy",
    description:
      "For the discrete uniform distribution on {1, ..., n}, mean = (n + 1) / 2 and variance = (n^2 - 1) / 12.\n\nGiven n >= 1, return [mean, variance].",
    starterCode: `def discrete_uniform_mean_and_variance(n):
    # Your code here
    pass`,
    solution: `def discrete_uniform_mean_and_variance(n):
    return [(n + 1) / 2.0, (n * n - 1.0) / 12.0]`,
    testCases: [
      { input: [6], expected: [3.5, 2.9166666666666665] },
      { input: [1], expected: [1.0, 0.0] },
      { input: [100], expected: [50.5, 833.25] },
    ],
    hint: "The variance grows quadratically with the range.",
  },
  {
    id: "pr-359",
    title: "Beta Moments Mean Variance",
    category: "Probability",
    difficulty: "Medium",
    description:
      "A Beta(a, b) distribution has mean a / (a + b) and variance a b / ((a + b)^2 (a + b + 1)).\n\nGiven a and b, return [mean, variance].",
    starterCode: `def beta_distribution_mean_and_variance(a, b):
    # Your code here
    pass`,
    solution: `def beta_distribution_mean_and_variance(a, b):
    return [a / (a + b), a * b / ((a + b) ** 2 * (a + b + 1.0))]`,
    testCases: [
      { input: [2, 2], expected: [0.5, 0.05] },
      { input: [1, 5], expected: [0.16666666666666666, 0.01984126984126984] },
      { input: [5, 5], expected: [0.5, 0.022727272727272728] },
    ],
    hint: "The sum a + b acts like a concentration parameter.",
  },
  {
    id: "pr-360",
    title: "Geometric PGF Value",
    category: "Probability",
    difficulty: "Hard",
    description:
      "The probability generating function of the trial-count geometric distribution is G(t) = p t / (1 - (1 - p) t).\n\nGiven p and t (with the denominator positive), return G(t).",
    starterCode: `def geometric_pgf_value(p, t):
    # Your code here
    pass`,
    solution: `def geometric_pgf_value(p, t):
    return p * t / (1.0 - (1.0 - p) * t)`,
    testCases: [
      { input: [0.5, 1.0], expected: 1.0 },
      { input: [0.2, 0.5], expected: 0.16666666666666669 },
      { input: [0.5, 0.0], expected: 0.0 },
    ],
    hint: "The PGF sums p (1-p)^(k-1) t^k over k >= 1.",
  },
];
