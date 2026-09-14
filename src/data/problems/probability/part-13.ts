import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "pr-401",
    title: "Markov Inequality Bound",
    category: "Probability",
    difficulty: "Easy",
    description:
      "For a nonnegative random variable with mean mu, Markov's inequality bounds P(X >= a) by mu / a.\n\nGiven the mean and a > 0, return the bound.",
    starterCode: `def markov_inequality_bound(mean, a):
    # Your code here
    pass`,
    solution: `def markov_inequality_bound(mean, a):
    return mean / a`,
    testCases: [
      { input: [2.0, 4.0], expected: 0.5 },
      { input: [1.0, 1.0], expected: 1.0 },
      { input: [10.0, 100.0], expected: 0.1 },
    ],
    hint: "The bound degrades as a grows.",
  },
  {
    id: "pr-402",
    title: "Chebyshev Two Sided Bound",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Chebyshev's inequality bounds P(|X - mu| >= k sigma) by 1 / k^2; expressed with variance it is variance / distance^2 for a distance measured in the same units.\n\nGiven the variance and the distance k, return the bound variance / k^2.",
    starterCode: `def chebyshev_two_sided_bound(variance, k):
    # Your code here
    pass`,
    solution: `def chebyshev_two_sided_bound(variance, k):
    return variance / (k * k)`,
    testCases: [
      { input: [1.0, 2.0], expected: 0.25 },
      { input: [4.0, 1.0], expected: 4.0 },
      { input: [2.5, 5.0], expected: 0.1 },
    ],
    hint: "Scale the distance before squaring.",
  },
  {
    id: "pr-403",
    title: "Cantelli One Sided Bound",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Cantelli's inequality bounds one tail: P(X - mu >= t) <= sigma^2 / (sigma^2 + t^2).\n\nGiven the variance and the offset t > 0, return the bound.",
    starterCode: `def cantelli_one_sided_bound(variance, t):
    # Your code here
    pass`,
    solution: `def cantelli_one_sided_bound(variance, t):
    return variance / (variance + t * t)`,
    testCases: [
      { input: [1.0, 1.0], expected: 0.5 },
      { input: [4.0, 2.0], expected: 0.5 },
      { input: [0.25, 3.0], expected: 0.02702702702702703 },
    ],
    hint: "It is tighter than Chebyshev for a single direction.",
  },
  {
    id: "pr-404",
    title: "Jensen Gap for Log Samples",
    category: "Probability",
    difficulty: "Hard",
    description:
      "By Jensen's inequality E[log X] <= log E[X] for positive X. The gap is log(mean(samples)) - mean(log(samples)).\n\nGiven positive samples, return the gap.",
    starterCode: `def jensen_gap_for_log_samples(samples):
    # Your code here
    pass`,
    solution: `def jensen_gap_for_log_samples(samples):
    import math
    mean = sum(samples) / len(samples)
    mean_log = sum(math.log(v) for v in samples) / len(samples)
    return math.log(mean) - mean_log`,
    testCases: [
      { input: [[1.0, 4.0]], expected: 0.22314355131420982 },
      { input: [[2.0, 2.0]], expected: 0.0 },
      { input: [[0.5, 1.0, 2.0]], expected: 0.15415067982725836 },
    ],
    hint: "The gap is zero exactly when all samples agree.",
  },
  {
    id: "pr-405",
    title: "Law of Total Variance Decomposition",
    category: "Probability",
    difficulty: "Easy",
    description:
      "The law of total variance splits Var(X) = E[Var(X | Y)] + Var(E[X | Y]).\n\nGiven the expected conditional variance and the variance of the conditional expectation, return Var(X).",
    starterCode: `def law_of_total_variance_decomposition(expected_variance, variance_of_expectation):
    # Your code here
    pass`,
    solution: `def law_of_total_variance_decomposition(expected_variance, variance_of_expectation):
    return expected_variance + variance_of_expectation`,
    testCases: [
      { input: [2.0, 3.0], expected: 5.0 },
      { input: [0.0, 1.0], expected: 1.0 },
      { input: [5.5, 4.5], expected: 10.0 },
    ],
    hint: "Within-group plus between-group variance.",
  },
  {
    id: "pr-406",
    title: "Binomial MGF at Point",
    category: "Probability",
    difficulty: "Medium",
    description:
      "The moment generating function of a binomial(n, p) is (1 - p + p e^t)^n.\n\nGiven n, p, and t, return M(t).",
    starterCode: `def binomial_mgf_at_point(n, p, t):
    # Your code here
    pass`,
    solution: `def binomial_mgf_at_point(n, p, t):
    import math
    return (1.0 - p + p * math.exp(t)) ** n`,
    testCases: [
      { input: [10, 0.5, 0.0], expected: 1.0 },
      { input: [5, 0.2, 1.0], expected: 4.3796667875899775 },
      { input: [3, 1.0, 0.5], expected: 4.481689070338065 },
    ],
    hint: "Substitute the Bernoulli MGF into the n-fold product.",
  },
  {
    id: "pr-407",
    title: "Normal MGF at Point",
    category: "Probability",
    difficulty: "Medium",
    description:
      "The normal moment generating function is exp(mu t + sigma^2 t^2 / 2).\n\nGiven mu, sigma, and t, return M(t).",
    starterCode: `def normal_mgf_at_point(mu, sigma, t):
    # Your code here
    pass`,
    solution: `def normal_mgf_at_point(mu, sigma, t):
    import math
    return math.exp(mu * t + sigma * sigma * t * t / 2.0)`,
    testCases: [
      { input: [0.0, 1.0, 1.0], expected: 1.6487212707001282 },
      { input: [2.0, 0.5, 0.0], expected: 1.0 },
      { input: [1.0, 2.0, 0.5], expected: 2.718281828459045 },
    ],
    hint: "The exponent is linear plus quadratic in t.",
  },
  {
    id: "pr-408",
    title: "Characteristic Function Symmetric Sign",
    category: "Probability",
    difficulty: "Easy",
    description:
      "For a random variable taking values +1 and -1 with equal probability, the characteristic function is E[e^{i t X}] = cos(t).\n\nGiven t, return the value.",
    starterCode: `def characteristic_function_symmetric_sign(t):
    # Your code here
    pass`,
    solution: `def characteristic_function_symmetric_sign(t):
    import math
    return math.cos(t)`,
    testCases: [
      { input: [0.0], expected: 1.0 },
      { input: [0.5], expected: 0.8775825618903728 },
      { input: [1.0], expected: 0.5403023058681398 },
    ],
    hint: "Average the complex exponentials of opposite signs.",
  },
  {
    id: "pr-409",
    title: "Inverse Transform Exponential Sample",
    category: "Probability",
    difficulty: "Easy",
    description:
      "To sample an exponential with rate lambda from u uniform on (0, 1), apply x = -ln(1 - u) / lambda.\n\nGiven u and the rate, return the transformed sample.",
    starterCode: `def inverse_transform_exponential_sample(u, rate):
    # Your code here
    pass`,
    solution: `def inverse_transform_exponential_sample(u, rate):
    import math
    return -math.log(1.0 - u) / rate`,
    testCases: [
      { input: [0.5, 1.0], expected: 0.6931471805599453 },
      { input: [0.1, 2.0], expected: 0.05268025782891314 },
      { input: [0.9, 0.5], expected: 4.605170185988092 },
    ],
    hint: "Invert the exponential CDF.",
  },
  {
    id: "pr-410",
    title: "Importance Sampling Estimate Mean",
    category: "Probability",
    difficulty: "Hard",
    description:
      "With samples x_i drawn from a proposal q and target density proportional to p, the importance sampling estimate of E_p[f] is mean_i f(x_i) p(x_i) / q(x_i).\n\nGiven the f values, the p values, and the q values, return the estimate.",
    starterCode: `def importance_sampling_estimate_mean(f_values, p_values, q_values):
    # Your code here
    pass`,
    solution: `def importance_sampling_estimate_mean(f_values, p_values, q_values):
    return sum(f * p / q for f, p, q in zip(f_values, p_values, q_values)) / len(f_values)`,
    testCases: [
      { input: [[1.0, 2.0], [0.5, 0.5], [0.25, 0.25]], expected: 3.0 },
      { input: [[1.0], [2.0], [1.0]], expected: 2.0 },
      { input: [[0.0, 4.0], [0.1, 0.2], [0.05, 0.1]], expected: 4.0 },
    ],
    hint: "Each sample is reweighted by the density ratio.",
  },
  {
    id: "pr-411",
    title: "Rejection Sampling Acceptance Rate",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Rejection sampling with proposal q and bound M accepts a draw with probability 1 / M when the target integrates to one over M q.\n\nGiven the bound M > 0, return the expected acceptance rate.",
    starterCode: `def rejection_sampling_acceptance_rate(m):
    # Your code here
    pass`,
    solution: `def rejection_sampling_acceptance_rate(m):
    return 1.0 / m`,
    testCases: [
      { input: [1.0], expected: 1.0 },
      { input: [2.0], expected: 0.5 },
      { input: [10.0], expected: 0.1 },
    ],
    hint: "The tighter the bound, the higher the acceptance.",
  },
  {
    id: "pr-412",
    title: "Union Probability Independent Events",
    category: "Probability",
    difficulty: "Easy",
    description:
      "For independent events, P(union) = 1 - prod_i (1 - p_i).\n\nGiven the event probabilities, return the union probability.",
    starterCode: `def union_probability_independent_events(probs):
    # Your code here
    pass`,
    solution: `def union_probability_independent_events(probs):
    complement = 1.0
    for p in probs:
        complement *= 1.0 - p
    return 1.0 - complement`,
    testCases: [
      { input: [[0.1, 0.2]], expected: 0.2799999999999999 },
      { input: [[0.5, 0.5]], expected: 0.75 },
      { input: [[0.9]], expected: 0.9 },
    ],
    hint: "Complement the probability that none occurs.",
  },
  {
    id: "pr-413",
    title: "Occupancy Zero Bins Probability",
    category: "Probability",
    difficulty: "Medium",
    description:
      "When n balls are thrown independently into m equally likely bins, the probability a given bin stays empty is (1 - 1/m)^n.\n\nGiven m and n, return the probability that a specific bin is empty.",
    starterCode: `def occupancy_zero_bins_probability(m, n):
    # Your code here
    pass`,
    solution: `def occupancy_zero_bins_probability(m, n):
    return (1.0 - 1.0 / m) ** n`,
    testCases: [
      { input: [10, 5], expected: 0.5904900000000001 },
      { input: [2, 1], expected: 0.5 },
      { input: [100, 200], expected: 0.13397967485796172 },
    ],
    hint: "Each ball avoids the bin with probability 1 - 1/m.",
  },
  {
    id: "pr-414",
    title: "Birthday Threshold Minimum People",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Find the smallest number of people n such that the probability of at least one shared birthday among d days is at least the target.\n\nGiven d and the target probability in (0, 1), return n.",
    starterCode: `def birthday_threshold_minimum_people(days, target):
    # Your code here
    pass`,
    solution: `def birthday_threshold_minimum_people(days, target):
    prob_distinct = 1.0
    n = 0
    while True:
        collision = 1.0 - prob_distinct
        if collision >= target:
            return n
        n += 1
        prob_distinct *= (days - (n - 1)) / days`,
    testCases: [
      { input: [365, 0.5], expected: 23 },
      { input: [365, 0.9], expected: 41 },
      { input: [12, 0.5], expected: 5 },
    ],
    hint: "Multiply the distinct-birthday probabilities until the complement reaches the target.",
  },
  {
    id: "pr-415",
    title: "Complement of At Least One",
    category: "Probability",
    difficulty: "Easy",
    description:
      "The probability that none of the possible events occurs is 1 minus the probability that at least one occurs.\n\nGiven the probability of at least one event, return the probability of none.",
    starterCode: `def complement_of_at_least_one(p_at_least_one):
    # Your code here
    pass`,
    solution: `def complement_of_at_least_one(p_at_least_one):
    return 1.0 - p_at_least_one`,
    testCases: [
      { input: [0.3], expected: 0.7 },
      { input: [0.0], expected: 1.0 },
      { input: [1.0], expected: 0.0 },
    ],
    hint: "Two outcomes partition the space.",
  },
  {
    id: "pr-416",
    title: "Hardy Weinberg Genotype Probabilities",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Under Hardy-Weinberg equilibrium with dominant allele frequency p, the genotype probabilities are [p^2, 2 p (1 - p), (1 - p)^2] for the homozygous dominant, heterozygous, and homozygous recessive cases.\n\nGiven p, return the three probabilities.",
    starterCode: `def hardy_weinberg_genotype_probabilities(p):
    # Your code here
    pass`,
    solution: `def hardy_weinberg_genotype_probabilities(p):
    return [p * p, 2.0 * p * (1.0 - p), (1.0 - p) ** 2]`,
    testCases: [
      { input: [0.5], expected: [0.25, 0.5, 0.25] },
      { input: [0.1], expected: [0.010000000000000002, 0.18000000000000002, 0.81] },
      { input: [0.0], expected: [0.0, 0.0, 1.0] },
    ],
    hint: "Square the allele pool expansion (p + (1 - p))^2.",
  },
  {
    id: "pr-417",
    title: "Two Class Posterior from Likelihoods",
    category: "Probability",
    difficulty: "Medium",
    description:
      "For two classes with prior P(C1) = prior and likelihoods l1, l2, the posteriors are proportional to [prior l1, (1 - prior) l2] normalized to sum to one.\n\nGiven the prior and the two likelihoods, return [P(C1 | x), P(C2 | x)].",
    starterCode: `def two_class_posterior_from_likelihoods(prior, l1, l2):
    # Your code here
    pass`,
    solution: `def two_class_posterior_from_likelihoods(prior, l1, l2):
    a = prior * l1
    b = (1.0 - prior) * l2
    return [a / (a + b), b / (a + b)]`,
    testCases: [
      { input: [0.5, 0.8, 0.2], expected: [0.8, 0.2] },
      { input: [0.3, 0.9, 0.1], expected: [0.7941176470588235, 0.20588235294117643] },
      { input: [0.5, 0.5, 0.5], expected: [0.5, 0.5] },
    ],
    hint: "Multiply prior by likelihood, then normalize.",
  },
  {
    id: "pr-418",
    title: "Bayes Risk Minimum Expected Loss",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Given class posteriors and a 2x2 loss matrix (rows are actions, columns are true classes), the Bayes risk is the minimum over actions of sum_j posterior_j loss[a][j].\n\nGiven the posteriors and the loss matrix, return the Bayes risk.",
    starterCode: `def bayes_risk_minimum_expected_loss(posteriors, loss_matrix):
    # Your code here
    pass`,
    solution: `def bayes_risk_minimum_expected_loss(posteriors, loss_matrix):
    return min(sum(posteriors[j] * loss_matrix[a][j] for j in range(len(posteriors))) for a in range(len(loss_matrix)))`,
    testCases: [
      { input: [[0.7, 0.3], [[0, 1], [1, 0]]], expected: 0.3 },
      { input: [[0.7, 0.3], [[0, 5], [1, 0]]], expected: 0.7 },
      { input: [[0.5, 0.5], [[2, 2], [2, 2]]], expected: 2.0 },
    ],
    hint: "Evaluate every action and take the smallest expected loss.",
  },
  {
    id: "pr-419",
    title: "Expected Zero One Loss",
    category: "Probability",
    difficulty: "Medium",
    description:
      "The optimal 0/1 classifier predicts the most likely class, so its expected loss is 1 minus the maximum posterior probability.\n\nGiven the class posteriors, return the expected zero-one loss.",
    starterCode: `def expected_zero_one_loss(posteriors):
    # Your code here
    pass`,
    solution: `def expected_zero_one_loss(posteriors):
    return 1.0 - max(posteriors)`,
    testCases: [
      { input: [[0.7, 0.3]], expected: 0.30000000000000004 },
      { input: [[0.5, 0.5]], expected: 0.5 },
      { input: [[0.1, 0.2, 0.7]], expected: 0.30000000000000004 },
    ],
    hint: "The error is the mass outside the predicted class.",
  },
  {
    id: "pr-420",
    title: "Kelly Criterion Fraction",
    category: "Probability",
    difficulty: "Hard",
    description:
      "For a bet paying b-to-1 with win probability p, the Kelly fraction of wealth to stake is max(0, (b p - (1 - p)) / b).\n\nGiven p and the odds b > 0, return the fraction.",
    starterCode: `def kelly_criterion_fraction(p, b):
    # Your code here
    pass`,
    solution: `def kelly_criterion_fraction(p, b):
    f = (b * p - (1.0 - p)) / b
    return f if f > 0 else 0.0`,
    testCases: [
      { input: [0.6, 1.0], expected: 0.19999999999999996 },
      { input: [0.4, 1.0], expected: 0.0 },
      { input: [0.5, 2.0], expected: 0.25 },
    ],
    hint: "Never bet when the edge is negative.",
  },
];
