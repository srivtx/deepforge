import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "pr-096",
    title: "M/M/1 Occupancy Probability",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Steady-state probability that an M/M/1 queue with arrival rate lam and service rate mu contains exactly n customers:\n\nP(N = n) = (1 - rho) * rho^n with rho = lam / mu.\n\nReturn 0.0 when rho >= 1 (unstable queue) or for invalid inputs.",
    starterCode: `def mm1_occupancy_probability(lam, mu, n):
    # Your code here
    pass`,
    solution: `def mm1_occupancy_probability(lam, mu, n):
    if lam < 0 or mu <= 0 or n < 0:
        return 0.0
    rho = lam / mu
    if rho >= 1.0:
        return 0.0
    return (1.0 - rho) * (rho ** n)`,
    testCases: [
      { input: [1, 2, 0], expected: 0.5 },
      { input: [1, 2, 1], expected: 0.25 },
      { input: [2, 3, 0], expected: 0.33333333333333337 },
      { input: [1, 1, 0], expected: 0.0 },
      { input: [0, 2, 3], expected: 0.0 },
    ],
    hint: "The geometric steady state exists only when the arrival rate is below the service rate.",
  },
  {
    id: "pr-097",
    title: "M/M/1 Expected Queue Length",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Expected number of customers in an M/M/1 system (including the one in service):\n\nE[N] = rho / (1 - rho) with rho = lam / mu.\n\nReturn -1.0 when rho >= 1, since the queue grows without bound.",
    starterCode: `def mm1_expected_queue_length(lam, mu):
    # Your code here
    pass`,
    solution: `def mm1_expected_queue_length(lam, mu):
    if mu <= 0 or lam < 0:
        return 0.0
    rho = lam / mu
    if rho >= 1.0:
        return -1.0
    return rho / (1.0 - rho)`,
    testCases: [
      { input: [1, 2], expected: 1.0 },
      { input: [2, 4], expected: 1.0 },
      { input: [1, 4], expected: 0.3333333333333333 },
      { input: [1, 1], expected: -1.0 },
    ],
    hint: "This is the mean of a geometric distribution on the number in system.",
  },
  {
    id: "pr-098",
    title: "Little's Law",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Little's law relates the average number of customers in a system to the arrival rate and the average time spent in the system:\n\nL = arrival_rate * avg_time.\n\nReturn the product as a float.",
    starterCode: `def littles_law(arrival_rate, avg_time):
    # Your code here
    pass`,
    solution: `def littles_law(arrival_rate, avg_time):
    return arrival_rate * avg_time`,
    testCases: [
      { input: [10, 0.5], expected: 5.0 },
      { input: [4, 2], expected: 8.0 },
      { input: [0, 5], expected: 0.0 },
    ],
    hint: "Units are customers per unit time times time.",
  },
  {
    id: "pr-099",
    title: "Ehrenfest Chain Step",
    category: "Probability",
    difficulty: "Easy",
    description:
      "The Ehrenfest urn has d balls split between two boxes. From state k (balls in the left box) one random ball is moved each step, so:\n\nP(k -> k - 1) = k / d and P(k -> k + 1) = (d - k) / d.\n\nReturn the two transition probabilities as [down, up]. Return [0.0, 0.0] for invalid inputs.",
    starterCode: `def ehrenfest_step(d, k):
    # Your code here
    pass`,
    solution: `def ehrenfest_step(d, k):
    if d <= 0 or k < 0 or k > d:
        return [0.0, 0.0]
    return [k / d, (d - k) / d]`,
    testCases: [
      { input: [4, 0], expected: [0.0, 1.0] },
      { input: [4, 2], expected: [0.5, 0.5] },
      { input: [4, 4], expected: [1.0, 0.0] },
      { input: [0, 0], expected: [0.0, 0.0] },
    ],
    hint: "Exactly one of the d balls switches boxes each step.",
  },
  {
    id: "pr-100",
    title: "Polya Urn Expected Red",
    category: "Probability",
    difficulty: "Easy",
    description:
      "A Polya urn starts with r red and b blue balls. Each draw removes a ball and returns it with one extra ball of the same color. Return the expected number of red balls after n draws:\n\nE[R_n] = r + n * r / (r + b).\n\nReturn 0.0 when the urn is empty or n < 0.",
    starterCode: `def polya_urn_expected_red(r, b, n):
    # Your code here
    pass`,
    solution: `def polya_urn_expected_red(r, b, n):
    if r + b <= 0 or n < 0:
        return 0.0
    return r + n * r / (r + b)`,
    testCases: [
      { input: [1, 1, 2], expected: 2.0 },
      { input: [2, 3, 5], expected: 4.0 },
      { input: [4, 6, 0], expected: 4.0 },
      { input: [0, 5, 3], expected: 0.0 },
    ],
    hint: "The probability the next drawn ball is red stays r / (r + b).",
  },
  {
    id: "pr-101",
    title: "Branching Process Mean Growth",
    category: "Probability",
    difficulty: "Easy",
    description:
      "For a branching process with offspring distribution probs (probs[k] = P(k offspring)), the mean offspring number is mu = sum(k * probs[k]). Return the expected population size in generation n:\n\nE[Z_n] = mu^n.\n\nReturn 0.0 for an empty distribution or negative n.",
    starterCode: `def branching_mean_growth(probs, n):
    # Your code here
    pass`,
    solution: `def branching_mean_growth(probs, n):
    if len(probs) == 0 or n < 0:
        return 0.0
    mu = 0.0
    for k, p in enumerate(probs):
        mu += k * p
    return mu ** n`,
    testCases: [
      { input: [[0.5, 0.5], 3], expected: 0.125 },
      { input: [[1.0], 5], expected: 0.0 },
      { input: [[0.2, 0.8], 2], expected: 0.6400000000000001 },
      { input: [[0.1, 0.2, 0.7], 2], expected: 2.5599999999999996 },
    ],
    hint: "Take the expectation of the generation size one step at a time.",
  },
  {
    id: "pr-102",
    title: "Coalescent No-Merge Probability",
    category: "Probability",
    difficulty: "Easy",
    description:
      "In the Wright-Fisher coalescent with population size N, two lineages fail to coalesce in one generation with probability 1 - 1 / (2N). Return the probability they are still separate after generations generations:\n\nP(no merge) = (1 - 1 / (2N))^generations.\n\nReturn 0.0 for population <= 0 or negative generations.",
    starterCode: `def coalescent_no_merge_probability(population, generations):
    # Your code here
    pass`,
    solution: `def coalescent_no_merge_probability(population, generations):
    if population <= 0 or generations < 0:
        return 0.0
    return (1.0 - 1.0 / (2.0 * population)) ** generations`,
    testCases: [
      { input: [1000, 100], expected: 0.9512175302423342 },
      { input: [1, 1], expected: 0.5 },
      { input: [10, 0], expected: 1.0 },
      { input: [0, 5], expected: 0.0 },
    ],
    hint: "There are 2N gene copies, so a given pair picks the same parent with probability 1 / (2N).",
  },
  {
    id: "pr-103",
    title: "Wright-Fisher Drift Variance",
    category: "Probability",
    difficulty: "Easy",
    description:
      "One step of Wright-Fisher drift changes an allele frequency p by an amount with mean 0 and variance:\n\nVar(delta p) = p * (1 - p) / (2N).\n\nReturn 0.0 for N <= 0.",
    starterCode: `def wright_fisher_drift_variance(p, N):
    # Your code here
    pass`,
    solution: `def wright_fisher_drift_variance(p, N):
    if N <= 0:
        return 0.0
    return p * (1.0 - p) / (2.0 * N)`,
    testCases: [
      { input: [0.5, 100], expected: 0.00125 },
      { input: [0.5, 10], expected: 0.0125 },
      { input: [0.2, 50], expected: 0.0016000000000000003 },
      { input: [0.5, 0], expected: 0.0 },
    ],
    hint: "The next count is Binomial(2N, p), so the frequency variance is p(1 - p) / (2N).",
  },
  {
    id: "pr-104",
    title: "Wald Identity Value",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Wald's identity states that for a random number N of independent summands with mean mean_x, the expected sum is:\n\nE[S_N] = E[N] * E[X] = mean_n * mean_x.\n\nReturn the product.",
    starterCode: `def wald_identity_value(mean_n, mean_x):
    # Your code here
    pass`,
    solution: `def wald_identity_value(mean_n, mean_x):
    return mean_n * mean_x`,
    testCases: [
      { input: [10, 2], expected: 20.0 },
      { input: [3.5, 4], expected: 14.0 },
      { input: [0, 5], expected: 0.0 },
    ],
    hint: "Average the random number of summands separately from the summand size.",
  },
  {
    id: "pr-105",
    title: "Optional Stopping Expected Value",
    category: "Probability",
    difficulty: "Easy",
    description:
      "A martingale is stopped when it first leaves an interval, hitting up_value with probability p_hit and down_value otherwise. Optional stopping gives the expected stopped value:\n\nE[X_T] = p_hit * up_value + (1 - p_hit) * down_value.\n\nReturn the expectation.",
    starterCode: `def optional_stopping_expected_value(p_hit, up_value, down_value):
    # Your code here
    pass`,
    solution: `def optional_stopping_expected_value(p_hit, up_value, down_value):
    return p_hit * up_value + (1.0 - p_hit) * down_value`,
    testCases: [
      { input: [0.5, 1, -1], expected: 0.0 },
      { input: [0.6, 10, -5], expected: 4.0 },
      { input: [1.0, 7, 3], expected: 7.0 },
    ],
    hint: "Only the two exit values matter for the stopped expectation.",
  },
  {
    id: "pr-106",
    title: "Union Bound",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Boole's inequality bounds the probability of a union by the sum of the individual probabilities:\n\nP(union) <= min(1, sum(probs)).\n\nReturn the bound for the given list of probabilities.",
    starterCode: `def union_bound(probs):
    # Your code here
    pass`,
    solution: `def union_bound(probs):
    total = sum(probs)
    if total > 1.0:
        return 1.0
    return total`,
    testCases: [
      { input: [[0.1, 0.2, 0.3]], expected: 0.6 },
      { input: [[0.5, 0.5]], expected: 1.0 },
      { input: [[0.2, 0.2, 0.2, 0.2, 0.2, 0.2]], expected: 1.0 },
      { input: [[]], expected: 0 },
    ],
    hint: "The bound can exceed 1, so cap it.",
  },
  {
    id: "pr-107",
    title: "G(n,p) Expected Edges",
    category: "Probability",
    difficulty: "Easy",
    description:
      "The Erdos-Renyi random graph G(n, p) has each of the C(n, 2) possible edges present independently with probability p. Return the expected number of edges:\n\nE[edges] = C(n, 2) * p.\n\nReturn 0.0 for negative n.",
    starterCode: `def gn_p_expected_edges(n, p):
    # Your code here
    pass`,
    solution: `def gn_p_expected_edges(n, p):
    if n < 0:
        return 0.0
    return n * (n - 1) / 2.0 * p`,
    testCases: [
      { input: [10, 0.5], expected: 22.5 },
      { input: [5, 0.1], expected: 1.0 },
      { input: [1, 0.9], expected: 0.0 },
      { input: [0, 0.5], expected: 0.0 },
    ],
    hint: "Sum the edge-indicator expectations.",
  },
  {
    id: "pr-108",
    title: "G(n,p) Connectivity Threshold Check",
    category: "Probability",
    difficulty: "Easy",
    description:
      "The Erdos-Renyi graph G(n, p) passes the connectivity threshold when p is above log(n) / n. Return True when p > log(n) / n and False otherwise.\n\nReturn True for n < 2, where the graph is trivially connected.",
    starterCode: `import math


def gn_p_connectivity_check(n, p):
    # Your code here
    pass`,
    solution: `import math


def gn_p_connectivity_check(n, p):
    if n < 2:
        return True
    return p > math.log(n) / n`,
    testCases: [
      { input: [100, 0.1], expected: true },
      { input: [100, 0.01], expected: false },
      { input: [10, 0.5], expected: true },
      { input: [10, 0.1], expected: false },
    ],
    hint: "Below the threshold isolated vertices appear with high probability.",
  },
  {
    id: "pr-109",
    title: "Percolation Open Neighbor Probability",
    category: "Probability",
    difficulty: "Easy",
    description:
      "In site percolation each edge from a site is open independently with probability p. Return the probability that a site of the given degree has at least one open neighbor:\n\nP = 1 - (1 - p)^degree.\n\nReturn 0.0 for negative degree or p outside [0, 1].",
    starterCode: `def percolation_open_neighbor_probability(degree, p):
    # Your code here
    pass`,
    solution: `def percolation_open_neighbor_probability(degree, p):
    if degree < 0 or p < 0 or p > 1:
        return 0.0
    return 1.0 - (1.0 - p) ** degree`,
    testCases: [
      { input: [4, 0.5], expected: 0.9375 },
      { input: [1, 0.3], expected: 0.30000000000000004 },
      { input: [0, 0.5], expected: 0.0 },
      { input: [3, 1.0], expected: 1.0 },
    ],
    hint: "Complement of all edges being closed.",
  },
  {
    id: "pr-110",
    title: "MLE for Bernoulli",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Maximum likelihood estimate of the success probability from successes successes in trials independent Bernoulli trials:\n\np_hat = successes / trials.\n\nReturn 0.0 when trials <= 0.",
    starterCode: `def mle_bernoulli(successes, trials):
    # Your code here
    pass`,
    solution: `def mle_bernoulli(successes, trials):
    if trials <= 0:
        return 0.0
    return successes / trials`,
    testCases: [
      { input: [3, 10], expected: 0.3 },
      { input: [0, 5], expected: 0.0 },
      { input: [5, 5], expected: 1.0 },
      { input: [0, 0], expected: 0.0 },
    ],
    hint: "The sample proportion maximizes the Bernoulli likelihood.",
  },
  {
    id: "pr-111",
    title: "Estimator MSE",
    category: "Probability",
    difficulty: "Easy",
    description:
      "The mean squared error of an estimator decomposes into squared bias plus variance:\n\nMSE = bias^2 + variance.\n\nReturn the MSE.",
    starterCode: `def estimator_mse(bias, variance):
    # Your code here
    pass`,
    solution: `def estimator_mse(bias, variance):
    return bias * bias + variance`,
    testCases: [
      { input: [1, 2], expected: 3.0 },
      { input: [0, 4], expected: 4.0 },
      { input: [-0.5, 0.25], expected: 0.5 },
      { input: [0, 0], expected: 0.0 },
    ],
    hint: "Bias is squared, so its sign does not matter.",
  },
  {
    id: "pr-112",
    title: "Poisson Waiting Time Probability",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Probability that the k-th event of a Poisson process with rate lam has occurred by time t, which is the probability of at least k events in [0, t]:\n\nP(T_k <= t) = 1 - sum from i = 0 to k - 1 of e^(-lam t) (lam t)^i / i!.\n\nReturn 1.0 for k <= 0 and 0.0 for negative rates or times.",
    starterCode: `import math


def poisson_waiting_time_probability(lam, t, k):
    # Your code here
    pass`,
    solution: `import math


def poisson_waiting_time_probability(lam, t, k):
    if lam < 0 or t < 0:
        return 0.0
    if k <= 0:
        return 1.0
    mean = lam * t
    cdf = 0.0
    for i in range(k):
        cdf += mean ** i * math.exp(-mean) / math.factorial(i)
    return 1.0 - cdf`,
    testCases: [
      { input: [1, 1, 1], expected: 0.6321205588285577 },
      { input: [2, 3, 2], expected: 0.9826487347633355 },
      { input: [1, 1, 0], expected: 1.0 },
      { input: [1, 1, 3], expected: 0.08030139707139416 },
      { input: [1, -1, 1], expected: 0.0 },
    ],
    hint: "The waiting time is Erlang distributed; use the Poisson count complement.",
  },
  {
    id: "pr-113",
    title: "Expected Largest Spacing",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Place n points independently and uniformly on [0, 1]. The n + 1 spacings including the two end gaps form a Dirichlet(1, ..., 1) vector whose largest component has expectation:\n\nE[max spacing] = H_(n+1) / (n + 1)\n\nwhere H_m is the m-th harmonic number. Return 0.0 for negative n.",
    starterCode: `def expected_largest_spacing(n):
    # Your code here
    pass`,
    solution: `def expected_largest_spacing(n):
    if n < 0:
        return 0.0
    h = 0.0
    for i in range(1, n + 2):
        h += 1.0 / i
    return h / (n + 1.0)`,
    testCases: [
      { input: [0], expected: 1.0 },
      { input: [1], expected: 0.75 },
      { input: [2], expected: 0.611111111111111 },
      { input: [4], expected: 0.45666666666666667 },
    ],
    hint: "For a uniform Dirichlet vector with m components the expected maximum is H_m / m.",
  },
  {
    id: "pr-114",
    title: "Rejection Sampling Acceptance Probability",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Discrete rejection sampling draws from proposal and accepts with probability target[x] / (M * proposal[x]) where M = max(target[x] / proposal[x]) over proposal[x] > 0. The overall acceptance probability is 1 / M. Return 1 / M, or 0.0 when a target atom has no proposal mass or the inputs are invalid.",
    starterCode: `def rejection_sampling_acceptance(target, proposal):
    # Your code here
    pass`,
    solution: `def rejection_sampling_acceptance(target, proposal):
    if len(target) != len(proposal) or len(target) == 0:
        return 0.0
    m = 0.0
    for t, q in zip(target, proposal):
        if t > 0 and q <= 0:
            return 0.0
        if q > 0:
            ratio = t / q
            if ratio > m:
                m = ratio
    if m <= 0:
        return 0.0
    return 1.0 / m`,
    testCases: [
      {
        input: [[0.2, 0.3, 0.5], [1 / 3, 1 / 3, 1 / 3]],
        expected: 0.6666666666666666,
      },
      { input: [[0.5, 0.5], [0.9, 0.1]], expected: 0.2 },
      { input: [[1.0], [1.0]], expected: 1.0 },
      { input: [[0.5, 0.5], [0.0, 1.0]], expected: 0.0 },
    ],
    hint: "The average acceptance rate is the reciprocal of the maximum importance weight.",
  },
  {
    id: "pr-115",
    title: "Moran Fixation Probability",
    category: "Probability",
    difficulty: "Medium",
    description:
      "In the Moran process with population size N, initial mutants and relative fitness r, the probability that the mutants take over is:\n\n(1 - (1 / r)^initial) / (1 - (1 / r)^N)\n\nfor r different from 1, and initial / N for r = 1. Return 0.0 for invalid arguments.",
    starterCode: `def moran_fixation_probability(population, fitness, initial):
    # Your code here
    pass`,
    solution: `def moran_fixation_probability(population, fitness, initial):
    if population <= 0 or initial <= 0 or initial > population:
        return 0.0
    if abs(fitness - 1.0) < 1e-15:
        return initial / population
    r = 1.0 / fitness
    return (1.0 - r ** initial) / (1.0 - r ** population)`,
    testCases: [
      { input: [10, 2.0, 1], expected: 0.5004887585532747 },
      { input: [10, 1.0, 1], expected: 0.1 },
      { input: [10, 2.0, 5], expected: 0.9696969696969697 },
      { input: [10, 1.0, 10], expected: 1.0 },
      { input: [10, 0.5, 1], expected: 0.0009775171065493646 },
    ],
    hint: "Use the ratio 1 / r so beneficial mutants have r > 1.",
  },
  {
    id: "pr-116",
    title: "Martingale Betting Expected Profit",
    category: "Probability",
    difficulty: "Medium",
    description:
      "A martingale betting system bets base_bet and doubles after each loss for up to max_bets bets. A win at any point nets base_bet; losing every bet loses base_bet * (2^max_bets - 1). Return the expected profit:\n\nE = base_bet * (1 - (1 - p)^max_bets) - base_bet * (2^max_bets - 1) * (1 - p)^max_bets.\n\nReturn 0.0 for max_bets <= 0.",
    starterCode: `def martingale_expected_profit(base_bet, p, max_bets):
    # Your code here
    pass`,
    solution: `def martingale_expected_profit(base_bet, p, max_bets):
    if max_bets <= 0:
        return 0.0
    p_all_lose = (1.0 - p) ** max_bets
    return base_bet * (1.0 - p_all_lose) - base_bet * (2 ** max_bets - 1) * p_all_lose`,
    testCases: [
      { input: [1, 0.5, 3], expected: 0.0 },
      { input: [1, 0.5, 5], expected: 0.0 },
      { input: [1, 0.4, 3], expected: -0.7279999999999998 },
      { input: [10, 0.5, 2], expected: 0.0 },
    ],
    hint: "For a fair game the expected profit stays exactly zero.",
  },
  {
    id: "pr-117",
    title: "Azuma Bound Value",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Azuma's inequality bounds the deviations of a martingale with bounded differences c_i:\n\nP(|S_n - E[S_n]| >= t) <= 2 * exp(-t^2 / (2 * sum(c_i^2))).\n\nReturn the bound capped at 1.0, and 1.0 for t <= 0 or a nonpositive sum of squares.",
    starterCode: `import math


def azuma_bound(t, sum_c_squares):
    # Your code here
    pass`,
    solution: `import math


def azuma_bound(t, sum_c_squares):
    if t <= 0 or sum_c_squares <= 0:
        return 1.0
    return min(1.0, 2.0 * math.exp(-(t * t) / (2.0 * sum_c_squares)))`,
    testCases: [
      { input: [4, 1], expected: 0.0006709252558050237 },
      { input: [10, 5], expected: 9.079985952496971e-05 },
      { input: [2, 4], expected: 1.0 },
      { input: [0, 1], expected: 1.0 },
    ],
    hint: "The denominator uses twice the sum of squared difference bounds.",
  },
  {
    id: "pr-118",
    title: "Chernoff Poisson Tail",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Chernoff upper bound for the Poisson tail with rate lam:\n\nP(X >= k) <= e^(-lam) * (e * lam / k)^k.\n\nReturn the bound capped at 1.0, 1.0 for k <= 0, and 0.0 when lam <= 0 with k > 0.",
    starterCode: `import math


def chernoff_poisson_tail(lam, k):
    # Your code here
    pass`,
    solution: `import math


def chernoff_poisson_tail(lam, k):
    if k <= 0:
        return 1.0
    if lam <= 0:
        return 0.0
    bound = math.exp(-lam) * (math.e * lam / k) ** k
    return min(1.0, bound)`,
    testCases: [
      { input: [5, 10], expected: 0.14493472568610988 },
      { input: [2, 5], expected: 0.2056758980934416 },
      { input: [1, 1], expected: 1.0 },
      { input: [5, 0], expected: 1.0 },
      { input: [0, 3], expected: 0.0 },
    ],
    hint: "The bound improves quickly as k moves above the mean.",
  },
  {
    id: "pr-119",
    title: "McDiarmid Bound",
    category: "Probability",
    difficulty: "Medium",
    description:
      "McDiarmid's inequality bounds deviations of a function of independent variables whose i-th coordinate changes the value by at most c_i:\n\nP(|f - E[f]| >= t) <= 2 * exp(-2 t^2 / sum(c_i^2)).\n\nReturn the bound capped at 1.0, and 1.0 when t <= 0 or no positive c_i are given.",
    starterCode: `import math


def mcdiarmid_bound(t, c_values):
    # Your code here
    pass`,
    solution: `import math


def mcdiarmid_bound(t, c_values):
    if t <= 0 or len(c_values) == 0:
        return 1.0
    s = sum(c * c for c in c_values)
    if s <= 0:
        return 1.0
    return min(1.0, 2.0 * math.exp(-2.0 * t * t / s))`,
    testCases: [
      { input: [1, [1, 1]], expected: 0.7357588823428847 },
      { input: [2, [1, 1]], expected: 0.03663127777746836 },
      { input: [0.1, [1]], expected: 1.0 },
      { input: [1, []], expected: 1.0 },
    ],
    hint: "This generalizes Hoeffding to functions with bounded differences.",
  },
  {
    id: "pr-120",
    title: "First Moment Method for Triangles",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Expected number of triangles in the Erdos-Renyi graph G(n, p):\n\nE[triangles] = C(n, 3) * p^3.\n\nEach of the C(n, 3) triples forms a triangle independently with probability p^3. Return 0.0 for n < 3 or negative p.",
    starterCode: `import math


def first_moment_triangles(n, p):
    # Your code here
    pass`,
    solution: `import math


def first_moment_triangles(n, p):
    if n < 3 or p < 0:
        return 0.0
    return math.comb(n, 3) * (p ** 3)`,
    testCases: [
      { input: [4, 0.5], expected: 0.5 },
      { input: [10, 0.5], expected: 15.0 },
      { input: [3, 1.0], expected: 1.0 },
      { input: [2, 0.5], expected: 0.0 },
    ],
    hint: "Apply linearity of expectation over the C(n, 3) triples.",
  },
  {
    id: "pr-121",
    title: "Second Moment Bound",
    category: "Probability",
    difficulty: "Medium",
    description:
      "The second moment method bounds the probability that a nonnegative integer variable is zero:\n\nP(X = 0) <= Var(X) / E[X]^2.\n\nReturn the bound capped at 1.0, and 1.0 when the mean is nonpositive.",
    starterCode: `def second_moment_bound(mean, variance):
    # Your code here
    pass`,
    solution: `def second_moment_bound(mean, variance):
    if mean <= 0:
        return 1.0
    return min(1.0, variance / (mean * mean))`,
    testCases: [
      { input: [10, 5], expected: 0.05 },
      { input: [2, 3], expected: 0.75 },
      { input: [5, 25], expected: 1.0 },
      { input: [0, 1], expected: 1.0 },
    ],
    hint: "A small relative variance forces the variable to be positive.",
  },
  {
    id: "pr-122",
    title: "Expected Birthday Collisions",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Expected number of colliding pairs among n people whose birthdays are uniform over days days:\n\nE[pairs] = C(n, 2) / days.\n\nReturn 0.0 for n < 2 or days <= 0.",
    starterCode: `def expected_birthday_collisions(n, days):
    # Your code here
    pass`,
    solution: `def expected_birthday_collisions(n, days):
    if n < 2 or days <= 0:
        return 0.0
    return n * (n - 1) / (2.0 * days)`,
    testCases: [
      { input: [23, 365], expected: 0.6931506849315069 },
      { input: [2, 365], expected: 0.0027397260273972603 },
      { input: [57, 365], expected: 4.372602739726028 },
      { input: [1, 365], expected: 0.0 },
    ],
    hint: "Use indicators for each pair and linearity of expectation.",
  },
  {
    id: "pr-123",
    title: "Binomial Exactly k Balls in a Bin",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Balls are thrown independently and uniformly into bins bins. Return the probability a fixed bin receives exactly k of the balls:\n\nP = C(balls, k) * (1 / bins)^k * (1 - 1 / bins)^(balls - k).\n\nReturn 0.0 for invalid arguments.",
    starterCode: `import math


def bin_exactly_k_balls(balls, bins, k):
    # Your code here
    pass`,
    solution: `import math


def bin_exactly_k_balls(balls, bins, k):
    if balls < 0 or bins <= 0 or k < 0 or k > balls:
        return 0.0
    p = 1.0 / bins
    return math.comb(balls, k) * (p ** k) * ((1.0 - p) ** (balls - k))`,
    testCases: [
      { input: [10, 10, 0], expected: 0.3486784401000001 },
      { input: [2, 2, 1], expected: 0.5 },
      { input: [3, 6, 0], expected: 0.5787037037037038 },
      { input: [1, 0, 0], expected: 0.0 },
    ],
    hint: "Condition on one bin; its load is Binomial(balls, 1 / bins).",
  },
  {
    id: "pr-124",
    title: "1D Random Walk Return Probability",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Probability that a symmetric simple random walk on the integers is back at the origin after 2n steps:\n\nP(return) = C(2n, n) / 4^n.\n\nReturn 0.0 for negative n.",
    starterCode: `import math


def random_walk_return_probability_1d(n):
    # Your code here
    pass`,
    solution: `import math


def random_walk_return_probability_1d(n):
    if n < 0:
        return 0.0
    return math.comb(2 * n, n) / (4.0 ** n)`,
    testCases: [
      { input: [0], expected: 1.0 },
      { input: [1], expected: 0.5 },
      { input: [2], expected: 0.375 },
      { input: [10], expected: 0.17619705200195312 },
    ],
    hint: "The walk must take exactly n steps right and n steps left.",
  },
  {
    id: "pr-125",
    title: "KL Divergence of Binomials",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Kullback-Leibler divergence from Binomial(n, q) to Binomial(n, p):\n\nKL = n * (p * log(p / q) + (1 - p) * log((1 - p) / (1 - q))).\n\nTerms with p = 0 or p = 1 contribute zero. Return 0.0 for invalid parameters or q outside (0, 1).",
    starterCode: `import math


def kl_divergence_binomial(n, p, q):
    # Your code here
    pass`,
    solution: `import math


def kl_divergence_binomial(n, p, q):
    if n <= 0 or q <= 0 or q >= 1 or p < 0 or p > 1:
        return 0.0
    total = 0.0
    if p > 0:
        total += p * math.log(p / q)
    if p < 1:
        total += (1.0 - p) * math.log((1.0 - p) / (1.0 - q))
    return n * total`,
    testCases: [
      { input: [1, 0.5, 0.5], expected: 0.0 },
      { input: [10, 0.5, 0.25], expected: 1.4384103622589042 },
      { input: [5, 0.2, 0.8], expected: 4.158883083359672 },
      { input: [4, 0.0, 0.5], expected: 2.772588722239781 },
    ],
    hint: "The divergence is n times the per-trial Bernoulli divergence.",
  },
  {
    id: "pr-126",
    title: "MLE for Poisson",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Maximum likelihood estimate of the Poisson rate from a list of observed counts, which is the sample mean:\n\nlam_hat = sum(counts) / len(counts).\n\nReturn 0.0 for an empty list.",
    starterCode: `def mle_poisson(counts):
    # Your code here
    pass`,
    solution: `def mle_poisson(counts):
    if len(counts) == 0:
        return 0.0
    return sum(counts) / len(counts)`,
    testCases: [
      { input: [[1, 2, 3]], expected: 2.0 },
      { input: [[0, 0, 0, 4]], expected: 1.0 },
      { input: [[5]], expected: 5.0 },
      { input: [[]], expected: 0.0 },
    ],
    hint: "The score equation for the Poisson rate gives the sample mean.",
  },
  {
    id: "pr-127",
    title: "Method of Moments for Uniform",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Method of moments estimate of the upper endpoint theta of Uniform(0, theta) from samples. Since the mean is theta / 2:\n\ntheta_hat = 2 * sample mean.\n\nReturn 0.0 for an empty sample.",
    starterCode: `def method_of_moments_uniform(samples):
    # Your code here
    pass`,
    solution: `def method_of_moments_uniform(samples):
    if len(samples) == 0:
        return 0.0
    return 2.0 * sum(samples) / len(samples)`,
    testCases: [
      { input: [[0, 1]], expected: 1.0 },
      { input: [[0.5, 1.5]], expected: 2.0 },
      { input: [[0, 0, 1, 1]], expected: 1.0 },
      { input: [[]], expected: 0.0 },
    ],
    hint: "Match the sample mean to the theoretical mean.",
  },
  {
    id: "pr-128",
    title: "Detailed Balance Check",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Check that pi satisfies detailed balance with respect to the transition matrix:\n\npi[i] * matrix[i][j] = pi[j] * matrix[j][i] for all i, j\n\nwithin a tolerance of 1e-9. Return True or False, and False for malformed input.",
    starterCode: `def detailed_balance_check(pi, matrix):
    # Your code here
    pass`,
    solution: `def detailed_balance_check(pi, matrix):
    n = len(pi)
    if n == 0 or len(matrix) != n:
        return False
    for i in range(n):
        if len(matrix[i]) != n:
            return False
        for j in range(n):
            if abs(pi[i] * matrix[i][j] - pi[j] * matrix[j][i]) >= 1e-9:
                return False
    return True`,
    testCases: [
      { input: [[0.5, 0.5], [[0.5, 0.5], [0.5, 0.5]]], expected: true },
      { input: [[0.5, 0.5], [[0.8, 0.2], [0.2, 0.8]]], expected: true },
      { input: [[0.3, 0.7], [[0.5, 0.5], [0.5, 0.5]]], expected: false },
      { input: [[0.5, 0.5], [[0.9, 0.1], [0.2, 0.8]]], expected: false },
    ],
    hint: "Check both directions of every off-diagonal flow.",
  },
  {
    id: "pr-129",
    title: "Ehrenfest Stationary Distribution",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Stationary distribution of the Ehrenfest chain with d balls, which is Binomial(d, 1/2):\n\npi[k] = C(d, k) / 2^d for k = 0..d.\n\nReturn the list of probabilities for k in increasing order.",
    starterCode: `import math


def ehrenfest_stationary_distribution(d):
    # Your code here
    pass`,
    solution: `import math


def ehrenfest_stationary_distribution(d):
    if d < 0:
        return []
    return [math.comb(d, k) / (2.0 ** d) for k in range(d + 1)]`,
    testCases: [
      { input: [0], expected: [1.0] },
      { input: [1], expected: [0.5, 0.5] },
      { input: [2], expected: [0.25, 0.5, 0.25] },
      { input: [4], expected: [0.0625, 0.25, 0.375, 0.25, 0.0625] },
    ],
    hint: "Each ball independently ends up in the left box half the time at stationarity.",
  },
  {
    id: "pr-130",
    title: "Bias of the MLE Sample Variance",
    category: "Probability",
    difficulty: "Medium",
    description:
      "The maximum likelihood sample variance (dividing by n instead of n - 1) is biased. For a true variance sigma_squared the bias is:\n\nbias = -sigma_squared / n.\n\nReturn the bias, and 0.0 for n <= 0.",
    starterCode: `def sample_variance_bias(n, sigma_squared):
    # Your code here
    pass`,
    solution: `def sample_variance_bias(n, sigma_squared):
    if n <= 0:
        return 0.0
    return -sigma_squared / n`,
    testCases: [
      { input: [10, 1], expected: -0.1 },
      { input: [5, 2], expected: -0.4 },
      { input: [1, 0.5], expected: -0.5 },
      { input: [0, 1], expected: 0.0 },
    ],
    hint: "The MLE underestimates by a factor of (n - 1) / n.",
  },
  {
    id: "pr-131",
    title: "Max Load Probability Bound",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Union bound on the maximum load when balls are thrown independently and uniformly into bins:\n\nP(max load >= k) <= bins * P(Binomial(balls, 1 / bins) >= k),\n\ncapped at 1.0. Return 1.0 for k <= 0, and 0.0 for invalid inputs or k > balls.",
    starterCode: `import math


def max_load_probability_bound(balls, bins, k):
    # Your code here
    pass`,
    solution: `import math


def max_load_probability_bound(balls, bins, k):
    if bins <= 0 or balls < 0:
        return 0.0
    if k <= 0:
        return 1.0
    if k > balls:
        return 0.0
    p = 1.0 / bins
    tail = 0.0
    for i in range(k, balls + 1):
        tail += math.comb(balls, i) * p ** i * (1.0 - p) ** (balls - i)
    return min(1.0, bins * tail)`,
    testCases: [
      { input: [10, 10, 3], expected: 0.7019082640000002 },
      { input: [100, 100, 10], expected: 7.631587532260614e-06 },
      { input: [10, 10, 0], expected: 1.0 },
      { input: [5, 10, 6], expected: 0.0 },
      { input: [5, 0, 2], expected: 0.0 },
    ],
    hint: "Apply the union bound over bins and condition on one bin.",
  },
  {
    id: "pr-132",
    title: "Importance Sampling Estimate (Seeded)",
    category: "Probability",
    difficulty: "Hard",
    description:
      "Estimate E[X] for a discrete variable with the given values and target distribution using importance sampling from proposal. Draw n samples from the proposal with random.Random(seed) via inverse transform, weight sample i by target[i] / proposal[i], and return the average weight times value. Return 0.0 for n <= 0.",
    starterCode: `import random


def importance_sampling_estimate(values, target, proposal, n, seed):
    # Your code here
    pass`,
    solution: `import random


def importance_sampling_estimate(values, target, proposal, n, seed):
    if n <= 0:
        return 0.0
    rng = random.Random(seed)
    total = 0.0
    for _ in range(n):
        u = rng.random()
        cumulative = 0.0
        idx = len(values) - 1
        for i, q in enumerate(proposal):
            cumulative += q
            if u < cumulative:
                idx = i
                break
        if proposal[idx] > 0:
            total += values[idx] * target[idx] / proposal[idx]
    return total / n`,
    testCases: [
      {
        input: [[1, 2, 3], [0.2, 0.3, 0.5], [1 / 3, 1 / 3, 1 / 3], 20000, 42],
        expected: 2.3056949999998686,
      },
      {
        input: [[1, 2, 3], [0.2, 0.3, 0.5], [1 / 3, 1 / 3, 1 / 3], 20000, 7],
        expected: 2.2922099999998724,
      },
      {
        input: [[1, 2, 3], [0.2, 0.3, 0.5], [0.5, 0.3, 0.2], 10000, 1],
        expected: 2.3073200000001353,
      },
      {
        input: [[1, 2, 3], [0.2, 0.3, 0.5], [1 / 3, 1 / 3, 1 / 3], 0, 5],
        expected: 0.0,
      },
    ],
    hint: "Use inverse transform sampling with cumsum of the proposal.",
  },
  {
    id: "pr-133",
    title: "Metropolis One Step (Seeded)",
    category: "Probability",
    difficulty: "Hard",
    description:
      "One Metropolis step on states 0..k-1 with target distribution target and a uniform symmetric proposal. Propose j = int(rng.random() * k) with random.Random(seed) and accept with probability min(1, target[j] / target[state]). Return the new state as an integer.",
    starterCode: `import random


def metropolis_step(state, target, seed):
    # Your code here
    pass`,
    solution: `import random


def metropolis_step(state, target, seed):
    k = len(target)
    if k == 0 or state < 0 or state >= k:
        return state
    rng = random.Random(seed)
    proposal = int(rng.random() * k)
    if proposal == state:
        return state
    ratio = target[proposal] / target[state] if target[state] > 0 else 0.0
    if rng.random() < ratio:
        return proposal
    return state`,
    testCases: [
      { input: [0, [0.2, 0.3, 0.5], 42], expected: 1 },
      { input: [1, [0.2, 0.3, 0.5], 7], expected: 0 },
      { input: [2, [0.2, 0.3, 0.5], 1], expected: 2 },
      { input: [0, [0.2, 0.3, 0.5], 0], expected: 2 },
    ],
    hint: "The proposal is symmetric, so the acceptance ratio is just the target ratio.",
  },
  {
    id: "pr-134",
    title: "Gibbs Sweep (Seeded)",
    category: "Probability",
    difficulty: "Hard",
    description:
      "One Gibbs sweep for a two-variable binary model with joint table joint, where joint[x][y] is the joint probability. Starting from x = start (0 or 1), sample y from P(Y | X = x), then resample x from P(X | Y = y) using random.Random(seed). Return the new state as [x, y].",
    starterCode: `import random


def gibbs_sweep(joint, start, seed):
    # Your code here
    pass`,
    solution: `import random


def gibbs_sweep(joint, start, seed):
    rng = random.Random(seed)
    x = 1 if start else 0
    p_y1 = joint[x][1] / (joint[x][0] + joint[x][1])
    y = 1 if rng.random() < p_y1 else 0
    p_x1 = joint[1][y] / (joint[0][y] + joint[1][y])
    x = 1 if rng.random() < p_x1 else 0
    return [x, y]`,
    testCases: [
      { input: [[[0.4, 0.1], [0.2, 0.3]], 0, 42], expected: [1, 0] },
      { input: [[[0.4, 0.1], [0.2, 0.3]], 1, 7], expected: [1, 1] },
      { input: [[[0.4, 0.1], [0.2, 0.3]], 0, 0], expected: [0, 0] },
      { input: [[[0.4, 0.1], [0.2, 0.3]], 1, 123], expected: [1, 1] },
    ],
    hint: "Normalize each conditional by the appropriate row or column sum.",
  },
  {
    id: "pr-135",
    title: "Renewal Expected Count",
    category: "Probability",
    difficulty: "Hard",
    description:
      "Expected number of renewals by time horizon for a renewal process whose interarrival distribution is interarrival_pmf, where interarrival_pmf[i] is the probability that a lifetime equals i + 1. Sum P(S_k <= horizon) over k >= 1 using repeated convolution of the pmf. Return 0.0 for an empty distribution or horizon <= 0.",
    starterCode: `def renewal_expected_count(interarrival_pmf, horizon):
    # Your code here
    pass`,
    solution: `def renewal_expected_count(interarrival_pmf, horizon):
    if len(interarrival_pmf) == 0 or horizon <= 0:
        return 0.0
    dist = [1.0]
    total = 0.0
    max_time = 0
    while max_time <= horizon:
        nxt = [0.0] * (len(dist) + len(interarrival_pmf))
        for i, a in enumerate(dist):
            for j, b in enumerate(interarrival_pmf):
                nxt[i + j + 1] += a * b
        dist = nxt
        max_time = len(dist) - 1
        total += sum(dist[: horizon + 1])
    return total`,
    testCases: [
      { input: [[1.0], 5], expected: 5.0 },
      { input: [[0.5, 0.5], 2], expected: 1.25 },
      { input: [[0.2, 0.8], 3], expected: 1.36 },
      { input: [[], 5], expected: 0.0 },
    ],
    hint: "The renewal function is the sum of the convolution powers evaluated up to the horizon.",
  },
  {
    id: "pr-136",
    title: "Stationary Birth-Death Probabilities",
    category: "Probability",
    difficulty: "Hard",
    description:
      "Stationary distribution of a birth-death chain on states 0..N. births[i] is the rate from state i to i + 1 and deaths[i] is the rate from state i + 1 down to i. Build pi[i + 1] = pi[i] * births[i] / deaths[i], then normalize. Return a list of probabilities, or [] when the lists are empty or mismatched or a death rate is nonpositive.",
    starterCode: `def stationary_birth_death(births, deaths):
    # Your code here
    pass`,
    solution: `def stationary_birth_death(births, deaths):
    if len(births) == 0 or len(births) != len(deaths):
        return []
    pi = [1.0]
    for i in range(len(births)):
        if deaths[i] <= 0:
            return []
        pi.append(pi[-1] * births[i] / deaths[i])
    total = sum(pi)
    if total == 0:
        return []
    return [x / total for x in pi]`,
    testCases: [
      {
        input: [[0.5, 0.5], [0.5, 0.5]],
        expected: [0.3333333333333333, 0.3333333333333333, 0.3333333333333333],
      },
      { input: [[1.0, 2.0], [2.0, 1.0]], expected: [0.4, 0.2, 0.4] },
      {
        input: [[1.0, 1.0, 1.0], [1.0, 1.0, 1.0]],
        expected: [0.25, 0.25, 0.25, 0.25],
      },
      { input: [[], []], expected: [] },
    ],
    hint: "Detailed balance gives the ratio of neighboring stationary probabilities.",
  },
  {
    id: "pr-137",
    title: "Polya Urn Variance",
    category: "Probability",
    difficulty: "Hard",
    description:
      "Variance of the number of red balls after n draws from a Polya urn that starts with r red and b blue balls:\n\nVar = n * r * b * (r + b + n) / ((r + b)^2 * (r + b + 1)).\n\nReturn 0.0 when the urn is empty or n < 0.",
    starterCode: `def polya_urn_variance(r, b, n):
    # Your code here
    pass`,
    solution: `def polya_urn_variance(r, b, n):
    if r + b <= 0 or n < 0:
        return 0.0
    return n * r * b * (r + b + n) / ((r + b) ** 2 * (r + b + 1.0))`,
    testCases: [
      { input: [1, 1, 1], expected: 0.25 },
      { input: [1, 1, 2], expected: 0.6666666666666666 },
      { input: [2, 3, 5], expected: 2.0 },
      { input: [0, 5, 3], expected: 0.0 },
    ],
    hint: "The draws are positively correlated, so the variance exceeds the binomial case.",
  },
  {
    id: "pr-138",
    title: "Branching Process Extinction Probability",
    category: "Probability",
    difficulty: "Hard",
    description:
      "Probability that a branching process dies out, given the offspring distribution probs (probs[k] = P(k offspring)). The extinction probability is the smallest fixed point q of q = sum(probs[k] * q^k), found by iterating from 0. Return 1.0 when the mean offspring number is at most 1 or the distribution is empty.",
    starterCode: `def branching_extinction_probability(probs):
    # Your code here
    pass`,
    solution: `def branching_extinction_probability(probs):
    if len(probs) == 0:
        return 1.0
    mu = 0.0
    for k, p in enumerate(probs):
        mu += k * p
    if mu <= 1.0:
        return 1.0
    q = 0.0
    for _ in range(100000):
        nxt = 0.0
        for k, p in enumerate(probs):
            nxt += p * (q ** k)
        if abs(nxt - q) < 1e-13:
            q = nxt
            break
        q = nxt
    return q`,
    testCases: [
      { input: [[0.25, 0.5, 0.25]], expected: 1.0 },
      { input: [[0.2, 0.3, 0.5]], expected: 0.3999999999997775 },
      { input: [[0.1, 0.2, 0.3, 0.4]], expected: 0.13278221853728808 },
      { input: [[1.0]], expected: 1.0 },
      { input: [[0.5, 0.5]], expected: 1.0 },
    ],
    hint: "Start from q = 0 and use the fact that the extinction probability is the smallest fixed point.",
  },
  {
    id: "pr-139",
    title: "Coupon Collector Variance",
    category: "Probability",
    difficulty: "Hard",
    description:
      "Variance of the number of draws needed to collect all n coupon types:\n\nVar = sum from j = 0 to n - 1 of j * n / (n - j)^2.\n\nThis follows from writing the total time as a sum of independent geometric waiting times. Return 0.0 for n <= 0.",
    starterCode: `def coupon_collector_variance(n):
    # Your code here
    pass`,
    solution: `def coupon_collector_variance(n):
    if n <= 0:
        return 0.0
    total = 0.0
    for j in range(n):
        total += j * n / ((n - j) ** 2)
    return total`,
    testCases: [
      { input: [1], expected: 0.0 },
      { input: [2], expected: 2.0 },
      { input: [3], expected: 6.75 },
      { input: [5], expected: 25.17361111111111 },
    ],
    hint: "With j coupons collected, the waiting time is geometric with success probability (n - j) / n.",
  },
  {
    id: "pr-140",
    title: "Bias and MSE of the Uniform MLE",
    category: "Probability",
    difficulty: "Hard",
    description:
      "For X_1, ..., X_n iid Uniform(0, theta), the MLE is M = max(X_i). Return [bias, mse]:\n\nbias = E[M] - theta = -theta / (n + 1)\nMSE = bias^2 + Var(M) = 2 * theta^2 / ((n + 1) * (n + 2)).\n\nReturn [0.0, 0.0] for n <= 0 or theta <= 0.",
    starterCode: `def mle_uniform_max_bias_mse(n, theta):
    # Your code here
    pass`,
    solution: `def mle_uniform_max_bias_mse(n, theta):
    if n <= 0 or theta <= 0:
        return [0.0, 0.0]
    bias = -theta / (n + 1.0)
    mse = 2.0 * theta * theta / ((n + 1.0) * (n + 2.0))
    return [bias, mse]`,
    testCases: [
      { input: [1, 1], expected: [-0.5, 0.3333333333333333] },
      { input: [2, 1], expected: [-0.3333333333333333, 0.16666666666666666] },
      { input: [5, 2], expected: [-0.3333333333333333, 0.19047619047619047] },
      { input: [0, 1], expected: [0.0, 0.0] },
    ],
    hint: "E[M] = n * theta / (n + 1) and Var(M) = n * theta^2 / ((n + 1)^2 * (n + 2)).",
  },
];
