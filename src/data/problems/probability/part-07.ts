import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "pr-231",
    title: "Two-State Chain Convergence Distance",
    category: "Probability",
    difficulty: "Medium",
    description: "A two-state Markov chain moves from state 0 to state 1 with probability p and from state 1 to state 0 with probability q. Starting from state 0, iterate n steps and return the total variation distance between the resulting distribution and the stationary distribution [q / (p + q), p / (p + q)], computed as half the sum of absolute component differences. When p + q is 0 use the stationary distribution [1.0, 0.0] and treat n < 0 as zero steps.",
    starterCode: `def two_state_chain_convergence_distance(p, q, n):
    # Your code here
    pass`,
    solution: `def two_state_chain_convergence_distance(p, q, n):
    if p + q == 0:
        stationary = [1.0, 0.0]
    else:
        stationary = [q / (p + q), p / (p + q)]
    state = [1.0, 0.0]
    for _ in range(max(0, n)):
        nxt = [0.0, 0.0]
        nxt[0] = state[0] * (1.0 - p) + state[1] * q
        nxt[1] = state[0] * p + state[1] * (1.0 - q)
        state = nxt
    return 0.5 * (abs(state[0] - stationary[0]) + abs(state[1] - stationary[1]))`,
    testCases: [
      { input: [0.5, 0.5, 0], expected: 0.5 },
      { input: [0.5, 0.5, 1], expected: 0.0 },
      { input: [0.6, 0.2, 1], expected: 0.14999999999999997 },
      { input: [0.6, 0.2, 3], expected: 0.00599999999999995 },
      { input: [0, 0, 1], expected: 0.0 },
    ],
    hint: "Iterate the two-state update on the row vector, then compare with the stationary distribution.",
  },
  {
    id: "pr-232",
    title: "Two-Step Transition Probability",
    category: "Probability",
    difficulty: "Easy",
    description: "Row i of a transition matrix gives the one-step distribution from state i, so the probability of moving from i to j in exactly two steps is the (i, j) entry of the squared matrix. Return the sum over k of matrix[i][k] * matrix[k][j]. Return 0.0 for an empty matrix or an out-of-range or malformed index.",
    starterCode: `def two_step_transition_probability(matrix, i, j):
    # Your code here
    pass`,
    solution: `def two_step_transition_probability(matrix, i, j):
    size = len(matrix)
    if size == 0 or i < 0 or j < 0 or i >= size or j >= size:
        return 0.0
    total = 0.0
    for k in range(size):
        if len(matrix[i]) <= k or len(matrix[k]) <= j:
            return 0.0
        total += matrix[i][k] * matrix[k][j]
    return total`,
    testCases: [
      { input: [[[0.5, 0.5], [0.2, 0.8]], 0, 0], expected: 0.35 },
      { input: [[[0.5, 0.5], [0.2, 0.8]], 0, 1], expected: 0.65 },
      { input: [[[1, 0], [0, 1]], 1, 0], expected: 0.0 },
      { input: [[[0.3, 0.7], [0.6, 0.4]], 1, 1], expected: 0.5800000000000001 },
      { input: [[[0.5, 0.5], [0.2, 0.8]], 5, 0], expected: 0.0 },
    ],
    hint: "Sum over the possible intermediate state k.",
  },
  {
    id: "pr-233",
    title: "Expected Hitting Time Three-State Chain",
    category: "Probability",
    difficulty: "Hard",
    description: "A three-state Markov chain has state 2 absorbing. Starting from start (0 or 1), the expected hitting time of state 2 solves (I - Q) E = 1 on the transient states 0 and 1. Solve the resulting 2x2 linear system and return E[start]. Return 0.0 when start is 2 and -1.0 for an invalid start or a singular system.",
    starterCode: `def expected_hitting_time_three_state(matrix, start):
    # Your code here
    pass`,
    solution: `def expected_hitting_time_three_state(matrix, start):
    if start == 2:
        return 0.0
    if start not in (0, 1):
        return -1.0
    p00 = matrix[0][0]
    p01 = matrix[0][1]
    p10 = matrix[1][0]
    p11 = matrix[1][1]
    det = (1.0 - p00) * (1.0 - p11) - p01 * p10
    if abs(det) < 1e-15:
        return -1.0
    e0 = ((1.0 - p11) + p01) / det
    e1 = (p10 + (1.0 - p00)) / det
    return e0 if start == 0 else e1`,
    testCases: [
      { input: [[[0.5, 0.5, 0.0], [0.25, 0.25, 0.5], [0.0, 0.0, 1.0]], 0], expected: 5.0 },
      { input: [[[0.5, 0.5, 0.0], [0.25, 0.25, 0.5], [0.0, 0.0, 1.0]], 1], expected: 3.0 },
      { input: [[[0.2, 0.3, 0.5], [0.1, 0.4, 0.5], [0, 0, 1]], 1], expected: 2.0000000000000004 },
      { input: [[[1, 0, 0], [0, 1, 0], [0, 0, 1]], 0], expected: -1.0 },
      { input: [[[0.5, 0.5, 0.0], [0.25, 0.25, 0.5], [0, 0, 1]], 2], expected: 0.0 },
    ],
    hint: "Write the two equations for E[0] and E[1] and solve with the 2x2 inverse.",
  },
  {
    id: "pr-234",
    title: "Gambler's Ruin Against Infinite Capital",
    category: "Probability",
    difficulty: "Medium",
    description: "A gambler with start units plays against an infinitely rich opponent, winning one unit with probability p each round and being ruined when the capital reaches 0. Return the probability of eventual ruin: 1.0 when start <= 0 or p <= 0.5, 0.0 when p >= 1, and ((1 - p) / p) raised to start otherwise.",
    starterCode: `def gamblers_ruin_infinite(start, p):
    # Your code here
    pass`,
    solution: `def gamblers_ruin_infinite(start, p):
    if start <= 0:
        return 1.0
    if p >= 1.0:
        return 0.0
    if p <= 0.5:
        return 1.0
    return ((1.0 - p) / p) ** start`,
    testCases: [
      { input: [1, 0.75], expected: 0.3333333333333333 },
      { input: [3, 0.75], expected: 0.03703703703703703 },
      { input: [5, 0.6], expected: 0.13168724279835398 },
      { input: [2, 0.5], expected: 1.0 },
      { input: [4, 1.0], expected: 0.0 },
    ],
    hint: "With no upper boundary the ruin probability is (q / p)^start when p exceeds 0.5.",
  },
  {
    id: "pr-235",
    title: "Poisson Process Expected Arrival Time",
    category: "Probability",
    difficulty: "Easy",
    description: "For a Poisson process with rate lam, the time of the k-th event is the sum of k independent exponential interarrival times, each with mean 1 / lam. Return the expected time of the k-th event, which is k / lam. Return 0.0 for lam <= 0 or k < 0, and 0.0 for k = 0.",
    starterCode: `def poisson_expected_arrival_time(lam, k):
    # Your code here
    pass`,
    solution: `def poisson_expected_arrival_time(lam, k):
    if lam <= 0 or k < 0:
        return 0.0
    return k / lam`,
    testCases: [
      { input: [2, 3], expected: 1.5 },
      { input: [0.5, 1], expected: 2.0 },
      { input: [1, 0], expected: 0.0 },
      { input: [4, 2], expected: 0.5 },
      { input: [0.25, 5], expected: 20.0 },
    ],
    hint: "Linearity of expectation over the k independent interarrival times.",
  },
  {
    id: "pr-236",
    title: "Conditional Expected Lifetime Given Survival",
    category: "Probability",
    difficulty: "Medium",
    description: "The exponential distribution is memoryless, so given that a component has already survived s time units, the expected remaining lifetime is still 1 / lam. Return the conditional expected total lifetime E[X | X > s] = s + 1 / lam. Return 0.0 for lam <= 0 or s < 0.",
    starterCode: `def exponential_conditional_lifetime(lam, s):
    # Your code here
    pass`,
    solution: `def exponential_conditional_lifetime(lam, s):
    if lam <= 0 or s < 0:
        return 0.0
    return s + 1.0 / lam`,
    testCases: [
      { input: [1, 2], expected: 3.0 },
      { input: [0.5, 4], expected: 6.0 },
      { input: [2, 0], expected: 0.5 },
      { input: [0.25, 0], expected: 4.0 },
    ],
    hint: "Add the elapsed time s to the constant residual mean 1 / lam.",
  },
  {
    id: "pr-237",
    title: "Geometric Tail Quantile",
    category: "Probability",
    difficulty: "Medium",
    description: "For a geometric variable with success probability p, the tail probability is P(X > n) = (1 - p)^n. Return the smallest integer n >= 0 with P(X > n) <= alpha. Return 0 when p = 1 or alpha = 1, and -1 when p is outside (0, 1] or alpha is outside (0, 1].",
    starterCode: `import math


def geometric_tail_quantile(p, alpha):
    # Your code here
    pass`,
    solution: `import math


def geometric_tail_quantile(p, alpha):
    if p <= 0 or p > 1 or alpha <= 0 or alpha > 1:
        return -1
    if p == 1.0 or alpha == 1.0:
        return 0
    n = math.ceil(math.log(alpha) / math.log(1.0 - p))
    if n < 0:
        n = 0
    while (1.0 - p) ** n > alpha:
        n += 1
    while n > 0 and (1.0 - p) ** (n - 1) <= alpha:
        n -= 1
    return n`,
    testCases: [
      { input: [0.5, 0.5], expected: 1 },
      { input: [0.5, 0.1], expected: 4 },
      { input: [0.2, 0.01], expected: 21 },
      { input: [1.0, 0.3], expected: 0 },
      { input: [0.5, 0], expected: -1 },
    ],
    hint: "Invert the tail with logarithms, then nudge by a step to avoid floating-point edge cases.",
  },
  {
    id: "pr-238",
    title: "Negative Binomial Expected Trials",
    category: "Probability",
    difficulty: "Easy",
    description: "For a negative binomial distribution that counts the number of trials until r successes, with success probability p, the expected number of trials is r / p. Return 0.0 when r < 1 or p is outside (0, 1].",
    starterCode: `def negative_binomial_expected_trials(r, p):
    # Your code here
    pass`,
    solution: `def negative_binomial_expected_trials(r, p):
    if r < 1 or p <= 0 or p > 1:
        return 0.0
    return r / p`,
    testCases: [
      { input: [3, 0.5], expected: 6.0 },
      { input: [5, 0.2], expected: 25.0 },
      { input: [1, 0.25], expected: 4.0 },
      { input: [0, 0.5], expected: 0.0 },
      { input: [2, 0], expected: 0.0 },
    ],
    hint: "Each success takes a geometric number of trials, so multiply the mean by r.",
  },
  {
    id: "pr-239",
    title: "Hypergeometric Mean and Variance",
    category: "Probability",
    difficulty: "Medium",
    description: "For sampling draws items without replacement from a population of pop items containing successes successes, return [mean, variance] of the hypergeometric count. mean = draws * K / N and variance = draws * (K / N) * (1 - K / N) * (pop - draws) / (pop - 1), where K / N = successes / pop. Return [0.0, 0.0] for invalid counts and variance 0.0 when pop == 1.",
    starterCode: `def hypergeometric_mean_variance(pop, successes, draws):
    # Your code here
    pass`,
    solution: `def hypergeometric_mean_variance(pop, successes, draws):
    if pop <= 0 or draws < 0 or draws > pop or successes < 0 or successes > pop:
        return [0.0, 0.0]
    p = successes / pop
    mean = draws * p
    if pop == 1:
        return [mean, 0.0]
    var = draws * p * (1.0 - p) * (pop - draws) / (pop - 1.0)
    return [mean, var]`,
    testCases: [
      { input: [50, 5, 10], expected: [1.0, 0.7346938775510204] },
      { input: [10, 3, 4], expected: [1.2, 0.56] },
      { input: [52, 4, 5], expected: [0.38461538461538464, 0.32718412808910546] },
      { input: [5, 5, 5], expected: [5.0, 0.0] },
      { input: [10, 3, 11], expected: [0.0, 0.0] },
    ],
    hint: "This is the binomial variance reduced by the finite population correction factor.",
  },
  {
    id: "pr-240",
    title: "Beta Distribution Mean and Variance",
    category: "Probability",
    difficulty: "Medium",
    description: "For a Beta(alpha, beta) distribution, return [mean, variance]. mean = alpha / (alpha + beta) and variance = alpha * beta / ((alpha + beta)^2 * (alpha + beta + 1)). Return [0.0, 0.0] when either parameter is nonpositive.",
    starterCode: `def beta_mean_variance(alpha, beta):
    # Your code here
    pass`,
    solution: `def beta_mean_variance(alpha, beta):
    if alpha <= 0 or beta <= 0:
        return [0.0, 0.0]
    total = alpha + beta
    mean = alpha / total
    var = alpha * beta / (total * total * (total + 1.0))
    return [mean, var]`,
    testCases: [
      { input: [1, 1], expected: [0.5, 0.08333333333333333] },
      { input: [2, 3], expected: [0.4, 0.04] },
      { input: [0.5, 0.5], expected: [0.5, 0.125] },
      { input: [2, 2], expected: [0.5, 0.05] },
      { input: [0, 1], expected: [0.0, 0.0] },
    ],
    hint: "Divide the normalization constants; the sum alpha + beta controls the spread.",
  },
  {
    id: "pr-241",
    title: "Dirichlet Mean Vector",
    category: "Probability",
    difficulty: "Easy",
    description: "For a Dirichlet distribution with concentration vector alphas, return the mean vector with entries alphas[i] / sum(alphas). Return an empty list for an empty vector or any nonpositive concentration.",
    starterCode: `def dirichlet_mean_vector(alphas):
    # Your code here
    pass`,
    solution: `def dirichlet_mean_vector(alphas):
    if len(alphas) == 0:
        return []
    total = 0.0
    for a in alphas:
        if a <= 0:
            return []
        total += a
    return [a / total for a in alphas]`,
    testCases: [
      { input: [[1, 1]], expected: [0.5, 0.5] },
      { input: [[2, 3, 5]], expected: [0.2, 0.3, 0.5] },
      { input: [[1, 1, 1, 1]], expected: [0.25, 0.25, 0.25, 0.25] },
      { input: [[0, 1]], expected: [] },
      { input: [[]], expected: [] },
    ],
    hint: "Each marginal is a Beta whose mean is the share of total concentration.",
  },
  {
    id: "pr-242",
    title: "Dirichlet Coordinate Variance",
    category: "Probability",
    difficulty: "Medium",
    description: "The marginal distribution of coordinate i of a Dirichlet(alphas) variable is Beta with parameters (alphas[i], A - alphas[i]), where A = sum(alphas). Return its variance alphas[i] * (A - alphas[i]) / (A^2 * (A + 1)). Return 0.0 for an empty vector, an out-of-range index, or any nonpositive concentration.",
    starterCode: `def dirichlet_coordinate_variance(alphas, i):
    # Your code here
    pass`,
    solution: `def dirichlet_coordinate_variance(alphas, i):
    if len(alphas) == 0 or i < 0 or i >= len(alphas):
        return 0.0
    total = 0.0
    for a in alphas:
        if a <= 0:
            return 0.0
        total += a
    return alphas[i] * (total - alphas[i]) / (total * total * (total + 1.0))`,
    testCases: [
      { input: [[1, 1], 0], expected: 0.08333333333333333 },
      { input: [[2, 3, 5], 2], expected: 0.022727272727272728 },
      { input: [[1, 1, 1, 1], 0], expected: 0.0375 },
      { input: [[2, 2], 1], expected: 0.05 },
      { input: [[1, 2], 5], expected: 0.0 },
    ],
    hint: "Use the Beta variance formula on the i-th marginal distribution.",
  },
  {
    id: "pr-243",
    title: "Beta-Binomial Posterior Mean",
    category: "Probability",
    difficulty: "Easy",
    description: "After observing successes successes in trials Bernoulli trials, a Beta(alpha, beta) prior updates to Beta(alpha + successes, beta + trials - successes), whose mean is (alpha + successes) / (alpha + beta + trials). Return that posterior mean, or 0.0 for invalid arguments.",
    starterCode: `def beta_binomial_posterior_mean(alpha, beta, successes, trials):
    # Your code here
    pass`,
    solution: `def beta_binomial_posterior_mean(alpha, beta, successes, trials):
    if alpha <= 0 or beta <= 0 or trials < 0 or successes < 0 or successes > trials:
        return 0.0
    return (alpha + successes) / (alpha + beta + trials)`,
    testCases: [
      { input: [1, 1, 3, 10], expected: 0.3333333333333333 },
      { input: [2, 3, 5, 5], expected: 0.7 },
      { input: [1, 1, 0, 0], expected: 0.5 },
      { input: [3, 3, 0, 4], expected: 0.3 },
      { input: [0, 1, 2, 3], expected: 0.0 },
    ],
    hint: "Add the observed successes and failures to the two prior pseudo-counts.",
  },
  {
    id: "pr-244",
    title: "Beta Conjugate Update Parameters",
    category: "Probability",
    difficulty: "Easy",
    description: "A Beta(alpha, beta) prior is conjugate for the binomial likelihood, so after successes successes in trials trials the posterior is Beta(alpha + successes, beta + trials - successes). Return the updated parameters as [alpha_new, beta_new], or [0.0, 0.0] for invalid arguments.",
    starterCode: `def beta_conjugate_update(alpha, beta, successes, trials):
    # Your code here
    pass`,
    solution: `def beta_conjugate_update(alpha, beta, successes, trials):
    if alpha <= 0 or beta <= 0 or trials < 0 or successes < 0 or successes > trials:
        return [0.0, 0.0]
    return [alpha + successes, beta + trials - successes]`,
    testCases: [
      { input: [1, 1, 3, 10], expected: [4, 8] },
      { input: [2, 5, 4, 6], expected: [6, 7] },
      { input: [1, 1, 0, 0], expected: [1, 1] },
      { input: [2, 2, 6, 6], expected: [8, 2] },
      { input: [1, 1, -1, 3], expected: [0.0, 0.0] },
    ],
    hint: "The update simply adds successes to alpha and failures to beta.",
  },
  {
    id: "pr-245",
    title: "Gaussian Product of Experts",
    category: "Probability",
    difficulty: "Hard",
    description: "A product of independent Gaussian experts with means means[i] and standard deviations sigmas[i] is again Gaussian. Its precision is the sum of the expert precisions 1 / sigmas[i]^2, and its mean is the precision-weighted average of the expert means. Return [mean, standard deviation] or [0.0, 0.0] for empty, mismatched or nonpositive input.",
    starterCode: `import math


def gaussian_product_of_experts(means, sigmas):
    # Your code here
    pass`,
    solution: `import math


def gaussian_product_of_experts(means, sigmas):
    if len(means) == 0 or len(means) != len(sigmas):
        return [0.0, 0.0]
    precision = 0.0
    weighted = 0.0
    for m, s in zip(means, sigmas):
        if s <= 0:
            return [0.0, 0.0]
        precision += 1.0 / (s * s)
        weighted += m / (s * s)
    mean = weighted / precision
    return [mean, 1.0 / math.sqrt(precision)]`,
    testCases: [
      { input: [[0, 1], [1, 1]], expected: [0.5, 0.7071067811865475] },
      { input: [[0, 0], [1, 2]], expected: [0.0, 0.8944271909999159] },
      { input: [[1, 2, 3], [1, 1, 1]], expected: [2.0, 0.5773502691896258] },
      { input: [[2], [0.5]], expected: [2.0, 0.5] },
      { input: [[0, 10], [1, 0.1]], expected: [9.900990099009901, 0.09950371902099892] },
    ],
    hint: "Multiply the Gaussian densities: precisions add and precision-weighted means add.",
  },
  {
    id: "pr-246",
    title: "Diagonal Gaussian Density",
    category: "Probability",
    difficulty: "Medium",
    description: "Return the density of a multivariate Gaussian with independent coordinates at the point x, given the mean vector mean and per-coordinate standard deviations sigmas. The density is exp(-0.5 * sum(((x[i] - mean[i]) / sigmas[i])^2)) divided by the product of sigmas[i] * sqrt(2 * pi). Return 0.0 when lengths differ or any standard deviation is nonpositive.",
    starterCode: `import math


def diagonal_gaussian_density(x, mean, sigmas):
    # Your code here
    pass`,
    solution: `import math


def diagonal_gaussian_density(x, mean, sigmas):
    if len(x) == 0 or len(x) != len(mean) or len(mean) != len(sigmas):
        return 0.0
    exponent = 0.0
    normalizer = 1.0
    for xi, mi, si in zip(x, mean, sigmas):
        if si <= 0:
            return 0.0
        exponent += ((xi - mi) / si) ** 2
        normalizer *= si * math.sqrt(2.0 * math.pi)
    return math.exp(-0.5 * exponent) / normalizer`,
    testCases: [
      { input: [[0], [0], [1]], expected: 0.3989422804014327 },
      { input: [[0, 0], [0, 0], [1, 1]], expected: 0.15915494309189537 },
      { input: [[1, 2], [0, 0], [1, 1]], expected: 0.013064233284684923 },
      { input: [[2], [2], [3]], expected: 0.1329807601338109 },
      { input: [[0], [0], [0]], expected: 0.0 },
    ],
    hint: "The diagonal covariance makes the multivariate density a product of univariate ones.",
  },
  {
    id: "pr-247",
    title: "Mahalanobis Distance 2x2",
    category: "Probability",
    difficulty: "Hard",
    description: "The Mahalanobis distance between x and mean under the symmetric 2x2 covariance matrix [[a, b], [b, c]] is sqrt(d^T S^-1 d) with d = x - mean. Using det = a * c - b^2, d^T S^-1 d equals (c * d0^2 - 2 * b * d0 * d1 + a * d1^2) / det. Return 0.0 when the covariance is not positive definite or shapes are wrong.",
    starterCode: `import math


def mahalanobis_distance_2x2(x, mean, covariance):
    # Your code here
    pass`,
    solution: `import math


def mahalanobis_distance_2x2(x, mean, covariance):
    if len(x) != 2 or len(mean) != 2 or len(covariance) != 2:
        return 0.0
    if len(covariance[0]) != 2 or len(covariance[1]) != 2:
        return 0.0
    a = covariance[0][0]
    b = covariance[0][1]
    c = covariance[1][1]
    det = a * c - b * b
    if det <= 0:
        return 0.0
    d0 = x[0] - mean[0]
    d1 = x[1] - mean[1]
    sq = (c * d0 * d0 - 2.0 * b * d0 * d1 + a * d1 * d1) / det
    if sq < 0:
        return 0.0
    return math.sqrt(sq)`,
    testCases: [
      { input: [[1, 0], [0, 0], [[1, 0], [0, 1]]], expected: 1.0 },
      { input: [[1, 1], [0, 0], [[2, 0], [0, 2]]], expected: 1.0 },
      { input: [[1, 1], [0, 0], [[2, 1], [1, 2]]], expected: 0.816496580927726 },
      { input: [[2, 3], [1, 1], [[1, 0.5], [0.5, 1]]], expected: 2.0 },
      { input: [[0, 0], [1, 1], [[1, 0], [0, 1]]], expected: 1.4142135623730951 },
    ],
    hint: "Invert the 2x2 covariance with the determinant and compute the quadratic form.",
  },
  {
    id: "pr-248",
    title: "Gaussian Mixture Likelihood",
    category: "Probability",
    difficulty: "Medium",
    description: "Return the likelihood of x under a one-dimensional Gaussian mixture with component weights weights, means means and standard deviations sigmas: sum over components of weights[k] * N(x; means[k], sigmas[k]^2). Return 0.0 for empty or mismatched inputs or a nonpositive standard deviation.",
    starterCode: `import math


def gaussian_mixture_likelihood(weights, means, sigmas, x):
    # Your code here
    pass`,
    solution: `import math


def gaussian_mixture_likelihood(weights, means, sigmas, x):
    if len(weights) == 0 or len(weights) != len(means) or len(means) != len(sigmas):
        return 0.0
    total = 0.0
    for w, m, s in zip(weights, means, sigmas):
        if s <= 0:
            return 0.0
        total += w * math.exp(-0.5 * ((x - m) / s) ** 2) / (s * math.sqrt(2.0 * math.pi))
    return total`,
    testCases: [
      { input: [[0.5, 0.5], [0, 1], [1, 1], 0], expected: 0.320456502460288 },
      { input: [[0.3, 0.7], [0, 2], [1, 1], 0], expected: 0.15747636067966145 },
      { input: [[1.0], [5], [2], 5], expected: 0.19947114020071635 },
      { input: [[0.5, 0.5], [0, 0], [1, 2], 0], expected: 0.29920671030107454 },
    ],
    hint: "Evaluate each component density and take the weighted sum.",
  },
  {
    id: "pr-249",
    title: "Mixture Responsibility E-Step",
    category: "Probability",
    difficulty: "Hard",
    description: "Compute the responsibility of each Gaussian component for the point x: r[k] = weights[k] * N(x; means[k], sigmas[k]^2) divided by the sum of all component densities. Return the list of responsibilities, or an empty list when inputs are invalid or the total density is 0.",
    starterCode: `import math


def mixture_responsibility(weights, means, sigmas, x):
    # Your code here
    pass`,
    solution: `import math


def mixture_responsibility(weights, means, sigmas, x):
    if len(weights) == 0 or len(weights) != len(means) or len(means) != len(sigmas):
        return []
    density = []
    total = 0.0
    for w, m, s in zip(weights, means, sigmas):
        if s <= 0:
            return []
        d = w * math.exp(-0.5 * ((x - m) / s) ** 2) / (s * math.sqrt(2.0 * math.pi))
        density.append(d)
        total += d
    if total == 0:
        return []
    return [d / total for d in density]`,
    testCases: [
      { input: [[0.5, 0.5], [0, 5], [1, 1], 0], expected: [0.9999962733607158, 3.7266392841865618e-06] },
      { input: [[0.4, 0.6], [0, 1], [1, 1], 0], expected: [0.5236161377769489, 0.476383862223051] },
      { input: [[1.0], [3], [2], 3], expected: [1.0] },
      { input: [[0.5, 0.5], [0, 0], [1, 1], 2], expected: [0.5, 0.5] },
      { input: [[0.9, 0.1], [10, 0], [1, 1], 0], expected: [1.735874863167526e-21, 1.0] },
    ],
    hint: "This is Bayes' rule inside the expectation step of EM.",
  },
  {
    id: "pr-250",
    title: "Gaussian Differential Entropy",
    category: "Probability",
    difficulty: "Easy",
    description: "The differential entropy of a Gaussian with standard deviation sigma is 0.5 * ln(2 * pi * e * sigma^2). Return 0.0 when sigma <= 0.",
    starterCode: `import math


def gaussian_differential_entropy(sigma):
    # Your code here
    pass`,
    solution: `import math


def gaussian_differential_entropy(sigma):
    if sigma <= 0:
        return 0.0
    return 0.5 * math.log(2.0 * math.pi * math.e * sigma * sigma)`,
    testCases: [
      { input: [1], expected: 1.4189385332046727 },
      { input: [2], expected: 2.112085713764618 },
      { input: [0.5], expected: 0.7257913526447274 },
      { input: [3], expected: 2.5175508218727822 },
      { input: [0], expected: 0.0 },
    ],
    hint: "Plug the variance into the closed-form Gaussian entropy.",
  },
  {
    id: "pr-251",
    title: "Uniform Differential Entropy",
    category: "Probability",
    difficulty: "Easy",
    description: "The differential entropy of a continuous uniform distribution on (a, b) is ln(b - a). Return 0.0 when b <= a.",
    starterCode: `import math


def uniform_differential_entropy(a, b):
    # Your code here
    pass`,
    solution: `import math


def uniform_differential_entropy(a, b):
    if b <= a:
        return 0.0
    return math.log(b - a)`,
    testCases: [
      { input: [0, 1], expected: 0.0 },
      { input: [0, 2], expected: 0.6931471805599453 },
      { input: [1, 5], expected: 1.3862943611198906 },
      { input: [2, 2], expected: 0.0 },
      { input: [3, 1], expected: 0.0 },
    ],
    hint: "Entropy grows with the logarithm of the interval width.",
  },
  {
    id: "pr-252",
    title: "KL Divergence Between Gaussians",
    category: "Probability",
    difficulty: "Medium",
    description: "Kullback-Leibler divergence from N(mu1, sigma1^2) to N(mu2, sigma2^2): ln(sigma2 / sigma1) + (sigma1^2 + (mu1 - mu2)^2) / (2 * sigma2^2) - 0.5. Return 0.0 when either standard deviation is nonpositive.",
    starterCode: `import math


def kl_gaussian(mu1, sigma1, mu2, sigma2):
    # Your code here
    pass`,
    solution: `import math


def kl_gaussian(mu1, sigma1, mu2, sigma2):
    if sigma1 <= 0 or sigma2 <= 0:
        return 0.0
    return (
        math.log(sigma2 / sigma1)
        + (sigma1 * sigma1 + (mu1 - mu2) ** 2) / (2.0 * sigma2 * sigma2)
        - 0.5
    )`,
    testCases: [
      { input: [0, 1, 0, 1], expected: 0.0 },
      { input: [0, 1, 1, 1], expected: 0.5 },
      { input: [0, 2, 0, 1], expected: 0.8068528194400546 },
      { input: [1, 1, 0, 2], expected: 0.4431471805599453 },
      { input: [0, 1, 0, -1], expected: 0.0 },
    ],
    hint: "The formula combines the log variance ratio, the variance ratio and the squared mean shift.",
  },
  {
    id: "pr-253",
    title: "Pinsker Total Variation Bound",
    category: "Probability",
    difficulty: "Easy",
    description: "Pinsker's inequality bounds the total variation distance between two distributions by sqrt(KL / 2), where KL is their Kullback-Leibler divergence. Return that bound for the given kl, and 0.0 when kl < 0.",
    starterCode: `import math


def pinsker_tv_bound(kl):
    # Your code here
    pass`,
    solution: `import math


def pinsker_tv_bound(kl):
    if kl < 0:
        return 0.0
    return math.sqrt(kl / 2.0)`,
    testCases: [
      { input: [0.5], expected: 0.5 },
      { input: [2], expected: 1.0 },
      { input: [0], expected: 0.0 },
      { input: [0.02], expected: 0.1 },
      { input: [-1], expected: 0.0 },
    ],
    hint: "Take the square root of half the KL divergence.",
  },
  {
    id: "pr-254",
    title: "Chernoff Lower Tail Bound",
    category: "Probability",
    difficulty: "Medium",
    description: "Multiplicative Chernoff bound for the lower tail of a sum of independent Bernoulli(p) variables. For X ~ Binomial(n, p) and 0 < delta < 1, P(X <= (1 - delta) * n * p) <= exp(-n * p * delta^2 / 2). Return 0.0 for invalid parameters and 1.0 when n * p is 0.",
    starterCode: `import math


def chernoff_lower_tail_bound(n, p, delta):
    # Your code here
    pass`,
    solution: `import math


def chernoff_lower_tail_bound(n, p, delta):
    if n < 0 or p < 0 or p > 1 or delta <= 0 or delta >= 1:
        return 0.0
    mu = n * p
    if mu == 0:
        return 1.0
    return math.exp(-mu * delta * delta / 2.0)`,
    testCases: [
      { input: [10, 0.5, 0.5], expected: 0.5352614285189903 },
      { input: [100, 0.5, 0.1], expected: 0.7788007830714049 },
      { input: [0, 0.5, 0.5], expected: 1.0 },
      { input: [10, 0.5, 0], expected: 0.0 },
      { input: [100, 0.2, 0.5], expected: 0.0820849986238988 },
    ],
    hint: "The lower-tail exponent only needs delta^2 instead of the full log term.",
  },
  {
    id: "pr-255",
    title: "Hoeffding Bound Value",
    category: "Probability",
    difficulty: "Medium",
    description: "Hoeffding's inequality bounds the deviation of the mean of n independent variables confined to [a, b]: P(|mean - E[mean]| >= t) <= 2 * exp(-2 * n * t^2 / (b - a)^2). Return the bound capped at 1.0, and 1.0 for n <= 0, t <= 0 or b <= a.",
    starterCode: `import math


def hoeffding_bound(n, t, a, b):
    # Your code here
    pass`,
    solution: `import math


def hoeffding_bound(n, t, a, b):
    if n <= 0 or t <= 0 or b <= a:
        return 1.0
    bound = 2.0 * math.exp(-2.0 * n * t * t / ((b - a) ** 2))
    return min(1.0, bound)`,
    testCases: [
      { input: [100, 0.1, 0, 1], expected: 0.2706705664732254 },
      { input: [25, 0.2, 0, 1], expected: 0.2706705664732254 },
      { input: [50, 0.3, 0, 1], expected: 0.0002468196081733591 },
      { input: [10, 0.1, 0, 1], expected: 1.0 },
      { input: [10, 0, 0, 1], expected: 1.0 },
    ],
    hint: "The range width (b - a) enters squared in the denominator.",
  },
  {
    id: "pr-256",
    title: "Bernstein Bound Value",
    category: "Probability",
    difficulty: "Hard",
    description: "Bernstein's inequality for a sum with variance proxy variance and terms bounded by bound: P(|S| >= t) <= 2 * exp(-t^2 / (2 * (variance + bound * t / 3))). Return the bound capped at 1.0, and 1.0 for t <= 0, variance < 0 or bound <= 0.",
    starterCode: `import math


def bernstein_bound(t, variance, bound):
    # Your code here
    pass`,
    solution: `import math


def bernstein_bound(t, variance, bound):
    if t <= 0 or variance < 0 or bound <= 0:
        return 1.0
    denom = 2.0 * (variance + bound * t / 3.0)
    return min(1.0, 2.0 * math.exp(-t * t / denom))`,
    testCases: [
      { input: [2, 1, 1], expected: 0.602388423824404 },
      { input: [5, 4, 2], expected: 0.3637100575365 },
      { input: [1, 1, 1], expected: 1.0 },
      { input: [0, 1, 1], expected: 1.0 },
      { input: [3, 2, 0.5], expected: 0.33059777644317306 },
    ],
    hint: "The denominator blends the variance proxy with the range term bound * t / 3.",
  },
  {
    id: "pr-257",
    title: "Bagging Variance Reduction",
    category: "Probability",
    difficulty: "Medium",
    description: "Averaging B bagged predictors whose pairwise correlation is correlation and whose individual variance is sigma_squared gives variance correlation * sigma_squared + (1 - correlation) * sigma_squared / B. Return that variance, or 0.0 for invalid inputs.",
    starterCode: `def bagging_variance_reduction(sigma_squared, correlation, n_estimators):
    # Your code here
    pass`,
    solution: `def bagging_variance_reduction(sigma_squared, correlation, n_estimators):
    if sigma_squared < 0 or correlation < 0 or correlation > 1 or n_estimators <= 0:
        return 0.0
    return correlation * sigma_squared + (1.0 - correlation) * sigma_squared / n_estimators`,
    testCases: [
      { input: [1, 0.5, 10], expected: 0.55 },
      { input: [1, 0, 100], expected: 0.01 },
      { input: [4, 0.25, 3], expected: 2.0 },
      { input: [1, 1, 5], expected: 1.0 },
      { input: [1, 0.2, -2], expected: 0.0 },
    ],
    hint: "The correlated part of the variance never averages away; only the idiosyncratic part shrinks.",
  },
  {
    id: "pr-258",
    title: "Jensen Gap for Log",
    category: "Probability",
    difficulty: "Medium",
    description: "For a two-point random variable equal to x1 with probability p and x2 otherwise, return the Jensen gap for the concave function ln: E[ln X] - ln E[X], which is at most 0. Return 0.0 when x1 <= 0, x2 <= 0 or p is outside [0, 1].",
    starterCode: `import math


def jensen_gap_log(x1, x2, p):
    # Your code here
    pass`,
    solution: `import math


def jensen_gap_log(x1, x2, p):
    if x1 <= 0 or x2 <= 0 or p < 0 or p > 1:
        return 0.0
    mean = p * x1 + (1.0 - p) * x2
    e_log = p * math.log(x1) + (1.0 - p) * math.log(x2)
    return e_log - math.log(mean)`,
    testCases: [
      { input: [1, 2, 0.5], expected: -0.05889151782819174 },
      { input: [2, 8, 0.5], expected: -0.2231435513142097 },
      { input: [1, 1, 0.5], expected: 0.0 },
      { input: [1, 10, 0.9], expected: -0.4115953768729902 },
      { input: [1, 2, -0.1], expected: 0.0 },
    ],
    hint: "For a concave function the expectation of the function lies below the function of the expectation.",
  },
  {
    id: "pr-259",
    title: "Cantelli Bound Value",
    category: "Probability",
    difficulty: "Medium",
    description: "Cantelli's one-sided inequality bounds P(X - mean >= a) by variance / (variance + a^2) for a > 0. Return the bound, 1.0 for a <= 0, and 0.0 when the variance is nonpositive.",
    starterCode: `def cantelli_bound(variance, a):
    # Your code here
    pass`,
    solution: `def cantelli_bound(variance, a):
    if a <= 0:
        return 1.0
    if variance <= 0:
        return 0.0
    return variance / (variance + a * a)`,
    testCases: [
      { input: [1, 1], expected: 0.5 },
      { input: [1, 2], expected: 0.2 },
      { input: [4, 2], expected: 0.5 },
      { input: [0, 1], expected: 0.0 },
      { input: [1, 0], expected: 1.0 },
    ],
    hint: "The bound interpolates smoothly between 0 and 1 as a grows.",
  },
  {
    id: "pr-260",
    title: "Chebyshev Bound Value",
    category: "Probability",
    difficulty: "Easy",
    description: "Chebyshev's inequality bounds P(|X - mean| >= k * sigma) by 1 / k^2. Return the bound capped at 1.0, and 1.0 for k <= 0.",
    starterCode: `def chebyshev_bound(k):
    # Your code here
    pass`,
    solution: `def chebyshev_bound(k):
    if k <= 0:
        return 1.0
    return min(1.0, 1.0 / (k * k))`,
    testCases: [
      { input: [2], expected: 0.25 },
      { input: [3], expected: 0.1111111111111111 },
      { input: [1], expected: 1.0 },
      { input: [0.5], expected: 1.0 },
      { input: [10], expected: 0.01 },
    ],
    hint: "The bound only depends on how many standard deviations the threshold is.",
  },
  {
    id: "pr-261",
    title: "Bonferroni Intersection Lower Bound",
    category: "Probability",
    difficulty: "Easy",
    description: "Bonferroni's inequality lower-bounds the probability that all events occur: P(intersection) >= sum(probabilities) - (number of events - 1), truncated below at 0. Return the bound, which is 1.0 for an empty list.",
    starterCode: `def bonferroni_intersection_bound(probs):
    # Your code here
    pass`,
    solution: `def bonferroni_intersection_bound(probs):
    total = 0.0
    for p in probs:
        total += p
    bound = total - (len(probs) - 1)
    if bound < 0:
        return 0.0
    return bound`,
    testCases: [
      { input: [[0.9, 0.8, 0.7]], expected: 0.40000000000000036 },
      { input: [[0.5, 0.5]], expected: 0.0 },
      { input: [[0.99, 0.99, 0.99, 0.99, 0.99]], expected: 0.9500000000000002 },
      { input: [[]], expected: 1.0 },
      { input: [[0.2, 0.3]], expected: 0.0 },
    ],
    hint: "The complement of the intersection is bounded by the sum of the complement probabilities.",
  },
  {
    id: "pr-262",
    title: "Partial Coupon Collection Expected Draws",
    category: "Probability",
    difficulty: "Medium",
    description: "Expected number of draws needed to collect m distinct coupon types out of n equally likely types, summing the geometric waiting times n / (n - j) for j = 0 to m - 1. Return 0.0 for n <= 0, m < 0 or m > n.",
    starterCode: `def partial_coupon_collection_draws(n, m):
    # Your code here
    pass`,
    solution: `def partial_coupon_collection_draws(n, m):
    if n <= 0 or m < 0 or m > n:
        return 0.0
    total = 0.0
    for j in range(m):
        total += n / (n - j)
    return total`,
    testCases: [
      { input: [6, 6], expected: 14.7 },
      { input: [10, 1], expected: 1.0 },
      { input: [5, 3], expected: 3.916666666666667 },
      { input: [4, 0], expected: 0.0 },
      { input: [3, 4], expected: 0.0 },
    ],
    hint: "With j distinct types already collected, the wait for a new one is geometric with success probability (n - j) / n.",
  },
  {
    id: "pr-263",
    title: "Birthday Exactly One Shared Birthday",
    category: "Probability",
    difficulty: "Hard",
    description: "Poisson approximation for the probability of exactly one shared birthday among n people when days birthdays are equally likely. Treat the number of colliding pairs as Poisson with mean lambda = n * (n - 1) / (2 * days) and return lambda * exp(-lambda). Return 0.0 for n < 2 or days <= 0.",
    starterCode: `import math


def birthday_exactly_one_collision(n, days):
    # Your code here
    pass`,
    solution: `import math


def birthday_exactly_one_collision(n, days):
    if n < 2 or days <= 0:
        return 0.0
    lam = n * (n - 1) / (2.0 * days)
    return lam * math.exp(-lam)`,
    testCases: [
      { input: [23, 365], expected: 0.3465741279391074 },
      { input: [2, 365], expected: 0.002732230201635231 },
      { input: [57, 365], expected: 0.05517505581177928 },
      { input: [10, 365], expected: 0.1089874506486353 },
      { input: [1, 365], expected: 0.0 },
    ],
    hint: "With lambda colliding pairs on average, exactly one pair occurs with probability lambda * exp(-lambda).",
  },
  {
    id: "pr-264",
    title: "Balls-in-Bins Max Load Estimate",
    category: "Probability",
    difficulty: "Medium",
    description: "For n balls thrown independently and uniformly into n bins, the classic Poisson approximation for the expected maximum bin load is ln(n) / ln(ln(n)) for n >= 3. Return 1.0 for 1 <= n < 3 and 0.0 for n <= 0.",
    starterCode: `import math


def max_load_estimate(bins):
    # Your code here
    pass`,
    solution: `import math


def max_load_estimate(bins):
    if bins <= 0:
        return 0.0
    if bins < 3:
        return 1.0
    return math.log(bins) / math.log(math.log(bins))`,
    testCases: [
      { input: [10], expected: 2.7607859935346912 },
      { input: [100], expected: 3.0154738238809906 },
      { input: [1000], expected: 3.574249916581999 },
      { input: [2], expected: 1.0 },
      { input: [0], expected: 0.0 },
    ],
    hint: "The maximum load grows like log n over log log n, far slower than the average load.",
  },
  {
    id: "pr-265",
    title: "Random Walk Variance After n Steps",
    category: "Probability",
    difficulty: "Easy",
    description: "For a random walk with steps +1 with probability p and -1 otherwise, the position after n steps has variance 4 * p * (1 - p) * n. Return that variance, or 0.0 for n < 0 or p outside [0, 1].",
    starterCode: `def random_walk_variance(n, p):
    # Your code here
    pass`,
    solution: `def random_walk_variance(n, p):
    if n < 0 or p < 0 or p > 1:
        return 0.0
    return 4.0 * p * (1.0 - p) * n`,
    testCases: [
      { input: [10, 0.5], expected: 10.0 },
      { input: [5, 0.3], expected: 4.2 },
      { input: [0, 0.5], expected: 0.0 },
      { input: [7, 1.0], expected: 0.0 },
      { input: [3, 0.25], expected: 2.25 },
    ],
    hint: "Each step has variance 4 * p * (1 - p) and the steps are independent.",
  },
  {
    id: "pr-266",
    title: "Brownian Motion Variance",
    category: "Probability",
    difficulty: "Easy",
    description: "Standard Brownian motion with diffusion coefficient sigma has variance sigma^2 * t at time t. Return that variance, or 0.0 for t < 0.",
    starterCode: `def brownian_variance(sigma, t):
    # Your code here
    pass`,
    solution: `def brownian_variance(sigma, t):
    if t < 0:
        return 0.0
    return sigma * sigma * t`,
    testCases: [
      { input: [1, 2], expected: 2 },
      { input: [2, 3], expected: 12 },
      { input: [0.5, 4], expected: 1.0 },
      { input: [1, 0], expected: 0 },
      { input: [0, 5], expected: 0 },
    ],
    hint: "Brownian variance grows linearly with the time horizon.",
  },
  {
    id: "pr-267",
    title: "Ornstein-Uhlenbeck Conditional Mean",
    category: "Probability",
    difficulty: "Easy",
    description: "The Ornstein-Uhlenbeck process reverts toward mu with rate theta, and its conditional mean is x0 * exp(-theta * t) + mu * (1 - exp(-theta * t)). Return that mean, or 0.0 for theta < 0 or t < 0.",
    starterCode: `import math


def ou_conditional_mean(x0, mu, theta, t):
    # Your code here
    pass`,
    solution: `import math


def ou_conditional_mean(x0, mu, theta, t):
    if theta < 0 or t < 0:
        return 0.0
    decay = math.exp(-theta * t)
    return x0 * decay + mu * (1.0 - decay)`,
    testCases: [
      { input: [1, 0, 1, 1], expected: 0.36787944117144233 },
      { input: [0, 5, 2, 1], expected: 4.323323583816936 },
      { input: [3, 1, 0, 5], expected: 3.0 },
      { input: [2, 2, 1, 0], expected: 2.0 },
      { input: [1, 2, 0.5, 2], expected: 1.6321205588285577 },
    ],
    hint: "The initial displacement decays exponentially while the mean pulls back to mu.",
  },
  {
    id: "pr-268",
    title: "Two-State Transition Eigenvalues",
    category: "Probability",
    difficulty: "Easy",
    description: "The transition matrix [[1 - p, p], [q, 1 - q]] has eigenvalues 1 and 1 - p - q. Return both eigenvalues as a list with the larger first, or an empty list when p or q is outside [0, 1].",
    starterCode: `def two_state_transition_eigenvalues(p, q):
    # Your code here
    pass`,
    solution: `def two_state_transition_eigenvalues(p, q):
    if p < 0 or p > 1 or q < 0 or q > 1:
        return []
    return [1.0, 1.0 - p - q]`,
    testCases: [
      { input: [0.1, 0.2], expected: [1.0, 0.7] },
      { input: [0.5, 0.5], expected: [1.0, 0.0] },
      { input: [1, 1], expected: [1.0, -1.0] },
      { input: [0, 0], expected: [1.0, 1.0] },
      { input: [1.2, 0.3], expected: [] },
    ],
    hint: "One eigenvector is the stationary distribution for eigenvalue 1; the trace gives the other eigenvalue.",
  },
  {
    id: "pr-269",
    title: "Detailed Balance Residual",
    category: "Probability",
    difficulty: "Medium",
    description: "Detailed balance requires pi[i] * matrix[i][j] = pi[j] * matrix[j][i] for all i and j. Return the largest absolute violation, max over i and j of abs(pi[i] * matrix[i][j] - pi[j] * matrix[j][i]). Return -1.0 for malformed input.",
    starterCode: `def detailed_balance_residual(pi, matrix):
    # Your code here
    pass`,
    solution: `def detailed_balance_residual(pi, matrix):
    n = len(pi)
    if n == 0 or len(matrix) != n:
        return -1.0
    worst = 0.0
    for i in range(n):
        if len(matrix[i]) != n:
            return -1.0
        for j in range(n):
            diff = abs(pi[i] * matrix[i][j] - pi[j] * matrix[j][i])
            if diff > worst:
                worst = diff
    return worst`,
    testCases: [
      { input: [[0.5, 0.5], [[0.5, 0.5], [0.5, 0.5]]], expected: 0.0 },
      { input: [[0.5, 0.5], [[0.8, 0.2], [0.2, 0.8]]], expected: 0.0 },
      { input: [[0.3, 0.7], [[0.5, 0.5], [0.5, 0.5]]], expected: 0.19999999999999998 },
      { input: [[0.25, 0.75], [[0.9, 0.1], [0.3, 0.7]]], expected: 0.19999999999999998 },
      { input: [[0.5, 0.5], [[0.5, 0.5]]], expected: -1.0 },
    ],
    hint: "Compare every off-diagonal flow in both directions and keep the worst mismatch.",
  },
  {
    id: "pr-270",
    title: "Metropolis Acceptance Ratio",
    category: "Probability",
    difficulty: "Medium",
    description: "Metropolis-Hastings acceptance probability for a proposal from x to y: min(1, (pi_y * q_xy) / (pi_x * q_yx)), where pi are target densities and q are proposal densities. Return 0.0 when any density is nonpositive, and 1.0 when the ratio reaches or exceeds 1.",
    starterCode: `def metropolis_acceptance_ratio(pi_x, pi_y, q_xy, q_yx):
    # Your code here
    pass`,
    solution: `def metropolis_acceptance_ratio(pi_x, pi_y, q_xy, q_yx):
    if pi_x <= 0 or pi_y <= 0 or q_xy <= 0 or q_yx <= 0:
        return 0.0
    ratio = (pi_y * q_xy) / (pi_x * q_yx)
    if ratio >= 1.0:
        return 1.0
    return ratio`,
    testCases: [
      { input: [1, 2, 1, 1], expected: 1.0 },
      { input: [2, 1, 1, 1], expected: 0.5 },
      { input: [1, 1, 0.5, 2], expected: 0.25 },
      { input: [1, 1, 1, 1], expected: 1.0 },
      { input: [0, 1, 1, 1], expected: 0.0 },
    ],
    hint: "The Hastings correction keeps detailed balance by comparing the reverse proposal density.",
  },
  {
    id: "pr-271",
    title: "Gaussian Gibbs Conditional Mean",
    category: "Probability",
    difficulty: "Medium",
    description: "For a bivariate Gaussian with means mu1 and mu2, standard deviations sigma1 and sigma2, and correlation rho, the conditional mean of the first coordinate given the second is mu1 + rho * (sigma1 / sigma2) * (x2 - mu2). Return that mean, or 0.0 for invalid parameters.",
    starterCode: `def gaussian_gibbs_conditional_mean(mu1, mu2, sigma1, sigma2, rho, x2):
    # Your code here
    pass`,
    solution: `def gaussian_gibbs_conditional_mean(mu1, mu2, sigma1, sigma2, rho, x2):
    if sigma1 <= 0 or sigma2 <= 0 or rho < -1 or rho > 1:
        return 0.0
    return mu1 + rho * (sigma1 / sigma2) * (x2 - mu2)`,
    testCases: [
      { input: [0, 0, 1, 1, 0.5, 1], expected: 0.5 },
      { input: [1, 2, 2, 1, 0.5, 3], expected: 2.0 },
      { input: [0, 0, 1, 2, 0.8, 4], expected: 1.6 },
      { input: [3, 3, 1, 1, 0, 7], expected: 3.0 },
      { input: [0, 0, 1, 1, 1.5, 1], expected: 0.0 },
    ],
    hint: "This is the Gibbs sampling update for one coordinate of a bivariate normal.",
  },
  {
    id: "pr-272",
    title: "Importance Sampling Weights",
    category: "Probability",
    difficulty: "Easy",
    description: "Importance sampling corrects samples drawn from proposal to the target distribution by the ratio target[i] / proposal[i]. Return the list of importance weights for equal-length vectors, or an empty list when the inputs are empty, mismatched, or any proposal probability is nonpositive.",
    starterCode: `def importance_sampling_weights(target, proposal):
    # Your code here
    pass`,
    solution: `def importance_sampling_weights(target, proposal):
    if len(target) == 0 or len(target) != len(proposal):
        return []
    weights = []
    for t, q in zip(target, proposal):
        if q <= 0:
            return []
        weights.append(t / q)
    return weights`,
    testCases: [
      { input: [[0.5, 0.5], [0.5, 0.5]], expected: [1.0, 1.0] },
      { input: [[0.2, 0.8], [0.5, 0.5]], expected: [0.4, 1.6] },
      { input: [[0.1, 0.9], [0.25, 0.75]], expected: [0.4, 1.2] },
      { input: [[], []], expected: [] },
      { input: [[1, 0], [0, 1]], expected: [] },
    ],
    hint: "A weight above 1 means the target assigns more mass than the proposal there.",
  },
  {
    id: "pr-273",
    title: "Self-Normalized Importance Sampling Estimate",
    category: "Probability",
    difficulty: "Medium",
    description: "Self-normalized importance sampling estimates E[f(X)] as the weighted average of sampled values using weights target[sample] / proposal[sample]. Return sum(weight * value) / sum(weight) over the given sample indices. Return 0.0 for empty or invalid arguments.",
    starterCode: `def self_normalized_is_estimate(values, target, proposal, samples):
    # Your code here
    pass`,
    solution: `def self_normalized_is_estimate(values, target, proposal, samples):
    n = len(values)
    if n == 0 or len(target) != n or len(proposal) != n or len(samples) == 0:
        return 0.0
    num = 0.0
    den = 0.0
    for idx in samples:
        if idx < 0 or idx >= n or proposal[idx] <= 0:
            return 0.0
        w = target[idx] / proposal[idx]
        num += w * values[idx]
        den += w
    if den == 0:
        return 0.0
    return num / den`,
    testCases: [
      { input: [[1, 2, 3], [0.2, 0.3, 0.5], [0.5, 0.25, 0.25], [0, 1, 2]], expected: 2.4444444444444446 },
      { input: [[1, 2], [0.5, 0.5], [0.5, 0.5], [0, 0, 1]], expected: 1.3333333333333333 },
      { input: [[2, 4], [0.25, 0.75], [0.5, 0.5], [1, 1]], expected: 4.0 },
      { input: [[1], [1], [1], []], expected: 0.0 },
      { input: [[1, 2], [0.5, 0.5], [0.5, 0.5], [5]], expected: 0.0 },
    ],
    hint: "Normalizing by the total weight removes the need to know the target's normalizing constant.",
  },
  {
    id: "pr-274",
    title: "Control Variate Variance Reduction",
    category: "Probability",
    difficulty: "Easy",
    description: "With the optimal control-variate coefficient, the variance of an estimator is reduced by a factor of 1 - correlation^2 relative to the crude estimator. Return that factor, or 0.0 when the correlation is outside [-1, 1].",
    starterCode: `def control_variate_variance_reduction(correlation):
    # Your code here
    pass`,
    solution: `def control_variate_variance_reduction(correlation):
    if correlation < -1 or correlation > 1:
        return 0.0
    return 1.0 - correlation * correlation`,
    testCases: [
      { input: [0.5], expected: 0.75 },
      { input: [0.9], expected: 0.18999999999999995 },
      { input: [0], expected: 1.0 },
      { input: [-0.8], expected: 0.3599999999999999 },
      { input: [1.2], expected: 0.0 },
    ],
    hint: "The residual variance after the best linear control is the fraction 1 - rho^2.",
  },
  {
    id: "pr-275",
    title: "Martingale Property Check",
    category: "Probability",
    difficulty: "Hard",
    description: "A payoff vector x is a martingale for a Markov chain when E[x_next | state i] = x[i], that is when the sum over j of matrix[i][j] * x[j] equals x[i] for every state i. Return True when all states satisfy this within 1e-9. Return False for malformed input.",
    starterCode: `def martingale_property_check(matrix, payoff):
    # Your code here
    pass`,
    solution: `def martingale_property_check(matrix, payoff):
    n = len(payoff)
    if n == 0:
        return len(matrix) == 0
    if len(matrix) != n:
        return False
    for i in range(n):
        if len(matrix[i]) != n:
            return False
        expected = 0.0
        for j in range(n):
            expected += matrix[i][j] * payoff[j]
        if abs(expected - payoff[i]) > 1e-9:
            return False
    return True`,
    testCases: [
      { input: [[[0.5, 0.5], [0.5, 0.5]], [1, 1]], expected: true },
      { input: [[[0.5, 0.5], [0.5, 0.5]], [1, 2]], expected: false },
      { input: [[[1, 0], [0, 1]], [3, 7]], expected: true },
      { input: [[[0.25, 0.75], [0.75, 0.25]], [0, 0]], expected: true },
      { input: [[[0.5, 0.5]], []], expected: false },
    ],
    hint: "Check that the transition matrix applied to the payoff vector reproduces the vector.",
  },
];
