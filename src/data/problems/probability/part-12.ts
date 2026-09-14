import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "pr-381",
    title: "Two State Chain One Step",
    category: "Probability",
    difficulty: "Easy",
    description:
      "For the two-state chain with transition matrix [[1 - a, a], [b, 1 - b]], one step maps the distribution p to [p0 (1 - a) + p1 b, p0 a + p1 (1 - b)].\n\nGiven the distribution [p0, p1], a, and b, return the next distribution.",
    starterCode: `def two_state_chain_one_step(p, a, b):
    # Your code here
    pass`,
    solution: `def two_state_chain_one_step(p, a, b):
    return [p[0] * (1.0 - a) + p[1] * b, p[0] * a + p[1] * (1.0 - b)]`,
    testCases: [
      { input: [[1, 0], 0.2, 0.3], expected: [0.8, 0.2] },
      { input: [[0.5, 0.5], 0.1, 0.4], expected: [0.65, 0.35] },
      { input: [[0, 1], 0.5, 0.5], expected: [0.5, 0.5] },
    ],
    hint: "Multiply the row vector by the transition matrix.",
  },
  {
    id: "pr-382",
    title: "Two State Chain Stationary Probability",
    category: "Probability",
    difficulty: "Medium",
    description:
      "The stationary distribution of [[1 - a, a], [b, 1 - b]] puts probability b / (a + b) on state 0 (assuming a + b > 0).\n\nGiven a and b, return the stationary probability of state 0.",
    starterCode: `def two_state_chain_stationary_probability(a, b):
    # Your code here
    pass`,
    solution: `def two_state_chain_stationary_probability(a, b):
    return b / (a + b)`,
    testCases: [
      { input: [0.2, 0.3], expected: 0.6 },
      { input: [0.5, 0.5], expected: 0.5 },
      { input: [1.0, 3.0], expected: 0.75 },
    ],
    hint: "Balance the flow a pi_0 = b pi_1 with pi summing to one.",
  },
  {
    id: "pr-383",
    title: "Markov Chain Two Step Distribution",
    category: "Probability",
    difficulty: "Medium",
    description:
      "The distribution after two steps is p P^2, where P is the transition matrix and p the current distribution.\n\nGiven the distribution and the transition matrix as nested rows, return the distribution after two steps.",
    starterCode: `def markov_chain_two_step_distribution(p, transition):
    # Your code here
    pass`,
    solution: `def markov_chain_two_step_distribution(p, transition):
    n = len(p)
    p1 = [sum(p[i] * transition[i][j] for i in range(n)) for j in range(n)]
    return [sum(p1[i] * transition[i][j] for i in range(n)) for j in range(n)]`,
    testCases: [
      { input: [[1, 0], [[0.9, 0.1], [0.2, 0.8]]], expected: [0.8300000000000001, 0.17000000000000004] },
      { input: [[0.5, 0.5], [[0.5, 0.5], [0.5, 0.5]]], expected: [0.5, 0.5] },
      { input: [[0, 1], [[0.3, 0.7], [0.6, 0.4]]], expected: [0.42, 0.5800000000000001] },
    ],
    hint: "Apply the one-step update twice.",
  },
  {
    id: "pr-384",
    title: "Three State Chain Stationary Solve",
    category: "Probability",
    difficulty: "Hard",
    description:
      "Find the stationary distribution pi of a three-state chain by solving the linear system pi (P - I) = 0 with sum(pi) = 1. Use Gaussian elimination on the augmented system built from the transposed balance equations.\n\nGiven a 3x3 transition matrix, return [pi0, pi1, pi2].",
    starterCode: `def three_state_chain_stationary_solve(transition):
    # Your code here
    pass`,
    solution: `def three_state_chain_stationary_solve(transition):
    a = [[transition[j][i] - (1.0 if i == j else 0.0) for j in range(3)] + [0.0] for i in range(3)]
    a[2] = [1.0, 1.0, 1.0, 1.0]
    for col in range(3):
        pivot = col
        for row in range(col, 3):
            if abs(a[row][col]) > abs(a[pivot][col]):
                pivot = row
        a[col], a[pivot] = a[pivot], a[col]
        scale = a[col][col]
        for j in range(col, 4):
            a[col][j] /= scale
        for row in range(3):
            if row != col:
                factor = a[row][col]
                for j in range(col, 4):
                    a[row][j] -= factor * a[col][j]
    return [a[i][3] for i in range(3)]`,
    testCases: [
      { input: [[[0.5, 0.5, 0.0], [0.25, 0.5, 0.25], [0.0, 0.5, 0.5]]], expected: [0.25, 0.5, 0.25] },
      { input: [[[0.0, 1.0, 0.0], [0.0, 0.0, 1.0], [1.0, 0.0, 0.0]]], expected: [0.3333333333333333, 0.3333333333333333, 0.3333333333333333] },
      { input: [[[0.2, 0.8, 0.0], [0.1, 0.1, 0.8], [0.3, 0.3, 0.4]]], expected: [0.2112676056338028, 0.3380281690140845, 0.4507042253521127] },
    ],
    hint: "Replace the redundant balance equation with the normalization constraint.",
  },
  {
    id: "pr-385",
    title: "Gambler Ruin Absorbing Probability",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Starting with i units, a gambler wins one with probability p and loses one otherwise until reaching 0 or n. The probability of reaching n is (1 - r^i) / (1 - r^n) with r = (1 - p) / p when p != 0.5, and i / n when p = 0.5.\n\nGiven i, n, and p, return the probability of reaching n.",
    starterCode: `def gambler_ruin_absorbing_probability(i, n, p):
    # Your code here
    pass`,
    solution: `def gambler_ruin_absorbing_probability(i, n, p):
    if p == 0.5:
        return i / n
    r = (1.0 - p) / p
    return (1.0 - r ** i) / (1.0 - r ** n)`,
    testCases: [
      { input: [1, 5, 0.5], expected: 0.2 },
      { input: [2, 4, 0.4], expected: 0.30769230769230765 },
      { input: [1, 10, 0.6], expected: 0.3392158552348125 },
    ],
    hint: "Solve the second-order difference equation with boundary values.",
  },
  {
    id: "pr-386",
    title: "Gambler Ruin Expected Duration",
    category: "Probability",
    difficulty: "Medium",
    description:
      "The expected number of steps until ruin or victory from i in a walk to 0 or n is i (n - i) when p = 0.5. For p != 0.5 it is (i - n (1 - r^i) / (1 - r^n)) / (1 - 2p) with r = (1 - p) / p.\n\nGiven i, n, and p, return the expected duration.",
    starterCode: `def gambler_ruin_expected_duration(i, n, p):
    # Your code here
    pass`,
    solution: `def gambler_ruin_expected_duration(i, n, p):
    if p == 0.5:
        return i * (n - i)
    r = (1.0 - p) / p
    return (i - n * (1.0 - r ** i) / (1.0 - r ** n)) / (1.0 - 2.0 * p)`,
    testCases: [
      { input: [1, 5, 0.5], expected: 4 },
      { input: [2, 4, 0.4], expected: 3.8461538461538476 },
      { input: [3, 6, 0.7], expected: 6.405405405405406 },
    ],
    hint: "The fair-coin case is the parabola i (n - i).",
  },
  {
    id: "pr-387",
    title: "Two State Expected Hitting Time",
    category: "Probability",
    difficulty: "Hard",
    description:
      "In the chain [[1 - a, a], [b, 1 - b]] with a > 0, the expected number of steps to reach state 1 from state 0 is 1 / a.\n\nGiven a, return the expected hitting time.",
    starterCode: `def two_state_expected_hitting_time(a):
    # Your code here
    pass`,
    solution: `def two_state_expected_hitting_time(a):
    return 1.0 / a`,
    testCases: [
      { input: [0.5], expected: 2.0 },
      { input: [0.1], expected: 10.0 },
      { input: [1.0], expected: 1.0 },
    ],
    hint: "Condition on the first step and solve the one-step recurrence.",
  },
  {
    id: "pr-388",
    title: "Detailed Balance Check Two State",
    category: "Probability",
    difficulty: "Easy",
    description:
      "A two-state chain satisfies detailed balance for pi when pi0 P01 equals pi1 P10; check within a tolerance.\n\nGiven pi0, pi1, P01, P10, and the tolerance, return True when detailed balance holds.",
    starterCode: `def detailed_balance_check_two_state(pi0, pi1, p01, p10, tol):
    # Your code here
    pass`,
    solution: `def detailed_balance_check_two_state(pi0, pi1, p01, p10, tol):
    return abs(pi0 * p01 - pi1 * p10) < tol`,
    testCases: [
      { input: [0.5, 0.5, 0.2, 0.2, 1e-09], expected: true },
      { input: [0.5, 0.5, 0.3, 0.1, 1e-09], expected: false },
      { input: [0.75, 0.25, 0.2, 0.6, 1e-09], expected: true },
    ],
    hint: "Compare the probability flux in both directions.",
  },
  {
    id: "pr-389",
    title: "Chain Staying in State Probability",
    category: "Probability",
    difficulty: "Medium",
    description:
      "In the chain [[1 - a, a], [b, 1 - b]], the probability of remaining in state 0 for n consecutive steps is (1 - a)^n.\n\nGiven a and n, return the stay probability.",
    starterCode: `def chain_staying_in_state_probability(a, n):
    # Your code here
    pass`,
    solution: `def chain_staying_in_state_probability(a, n):
    return (1.0 - a) ** n`,
    testCases: [
      { input: [0.1, 3], expected: 0.7290000000000001 },
      { input: [0.5, 2], expected: 0.25 },
      { input: [0.0, 10], expected: 1.0 },
    ],
    hint: "Each step multiplies the probability by the self-transition.",
  },
  {
    id: "pr-390",
    title: "Random Walk Return After Even Steps",
    category: "Probability",
    difficulty: "Medium",
    description:
      "A simple symmetric random walk returns to the origin after 2k steps with probability C(2k, k) / 4^k.\n\nGiven k, return the return probability.",
    starterCode: `def random_walk_return_after_even_steps(k):
    # Your code here
    pass`,
    solution: `def random_walk_return_after_even_steps(k):
    import math
    return math.comb(2 * k, k) / (4 ** k)`,
    testCases: [
      { input: [1], expected: 0.5 },
      { input: [2], expected: 0.375 },
      { input: [5], expected: 0.24609375 },
    ],
    hint: "Half the steps must be up, half down.",
  },
  {
    id: "pr-391",
    title: "Random Walk Variance After Steps",
    category: "Probability",
    difficulty: "Easy",
    description:
      "For a random walk with independent increments of variance sigma^2, the position after n steps has variance n sigma^2.\n\nGiven the increment variance and n, return the variance.",
    starterCode: `def random_walk_variance_after_steps(step_variance, n):
    # Your code here
    pass`,
    solution: `def random_walk_variance_after_steps(step_variance, n):
    return n * step_variance`,
    testCases: [
      { input: [1.0, 100], expected: 100.0 },
      { input: [4.0, 25], expected: 100.0 },
      { input: [0.5, 8], expected: 4.0 },
    ],
    hint: "Independent increments add their variances.",
  },
  {
    id: "pr-392",
    title: "Poisson Process Count Probability",
    category: "Probability",
    difficulty: "Hard",
    description:
      "For a Poisson process with rate lambda, the number of events in time t is Poisson(lambda t), so P(N(t) = k) = exp(-lambda t)(lambda t)^k / k!.\n\nGiven lambda, t, and k, return the probability.",
    starterCode: `def poisson_process_count_probability(lam, t, k):
    # Your code here
    pass`,
    solution: `def poisson_process_count_probability(lam, t, k):
    import math
    mean = lam * t
    return math.exp(-mean) * mean ** k / math.factorial(k)`,
    testCases: [
      { input: [2.0, 1.0, 3], expected: 0.1804470443154836 },
      { input: [0.5, 4.0, 0], expected: 0.1353352832366127 },
      { input: [1.0, 2.0, 2], expected: 0.2706705664732254 },
    ],
    hint: "The rate integrates to lambda t over the interval.",
  },
  {
    id: "pr-393",
    title: "Poisson Process Waiting CDF",
    category: "Probability",
    difficulty: "Easy",
    description:
      "The waiting time to the first event in a Poisson process with rate lambda has CDF 1 - exp(-lambda t).\n\nGiven lambda and t >= 0, return the probability that an event has occurred by time t.",
    starterCode: `def poisson_process_waiting_cdf(lam, t):
    # Your code here
    pass`,
    solution: `def poisson_process_waiting_cdf(lam, t):
    import math
    return 1.0 - math.exp(-lam * t)`,
    testCases: [
      { input: [1.0, 1.0], expected: 0.6321205588285577 },
      { input: [0.5, 2.0], expected: 0.6321205588285577 },
      { input: [3.0, 0.0], expected: 0.0 },
    ],
    hint: "The waiting time is exponential with the same rate.",
  },
  {
    id: "pr-394",
    title: "Poisson Process Expected Count",
    category: "Probability",
    difficulty: "Medium",
    description:
      "The expected number of events in a Poisson process with rate lambda over time t is lambda t.\n\nGiven lambda and t, return the expected count.",
    starterCode: `def poisson_process_expected_count(lam, t):
    # Your code here
    pass`,
    solution: `def poisson_process_expected_count(lam, t):
    return lam * t`,
    testCases: [
      { input: [2.0, 3.0], expected: 6.0 },
      { input: [0.1, 100.0], expected: 10.0 },
      { input: [1.0, 0.0], expected: 0.0 },
    ],
    hint: "Rate times duration.",
  },
  {
    id: "pr-395",
    title: "Conditional Survival Exponential",
    category: "Probability",
    difficulty: "Easy",
    description:
      "The exponential distribution is memoryless: P(X > s + t | X > s) = exp(-rate * t).\n\nGiven the rate, s, and t, return the conditional survival probability.",
    starterCode: `def conditional_survival_exponential(rate, s, t):
    # Your code here
    pass`,
    solution: `def conditional_survival_exponential(rate, s, t):
    import math
    return math.exp(-rate * t)`,
    testCases: [
      { input: [1.0, 2.0, 3.0], expected: 0.049787068367863944 },
      { input: [0.5, 0.0, 1.0], expected: 0.6065306597126334 },
      { input: [2.0, 5.0, 0.0], expected: 1.0 },
    ],
    hint: "The elapsed time s cancels out.",
  },
  {
    id: "pr-396",
    title: "Urn Without Replacement Probability",
    category: "Probability",
    difficulty: "Medium",
    description:
      "An urn has red red balls and blue blue balls. The probability of drawing k reds in a row without replacement is prod_{j=0}^{k-1} (red - j) / (red + blue - j).\n\nGiven red, blue, and k (with k <= red), return the probability.",
    starterCode: `def urn_without_replacement_probability(red, blue, k):
    # Your code here
    pass`,
    solution: `def urn_without_replacement_probability(red, blue, k):
    prob = 1.0
    for j in range(k):
        prob *= (red - j) / (red + blue - j)
    return prob`,
    testCases: [
      { input: [5, 5, 2], expected: 0.2222222222222222 },
      { input: [3, 1, 2], expected: 0.5 },
      { input: [10, 0, 3], expected: 1.0 },
    ],
    hint: "Multiply the sequential conditional probabilities.",
  },
  {
    id: "pr-397",
    title: "Polya Urn Expected Red Count",
    category: "Probability",
    difficulty: "Hard",
    description:
      "In a Polya urn starting with red red and blue blue balls, each draw adds one ball of the drawn color. The expected red fraction stays constant, so E[red after n steps] = red + n * red / (red + blue).\n\nGiven the initial counts and n, return the expected number of red balls.",
    starterCode: `def polya_urn_expected_red(red, blue, n):
    # Your code here
    pass`,
    solution: `def polya_urn_expected_red(red, blue, n):
    return red + n * red / (red + blue)`,
    testCases: [
      { input: [1, 1, 2], expected: 2.0 },
      { input: [3, 1, 4], expected: 6.0 },
      { input: [2, 2, 0], expected: 2.0 },
    ],
    hint: "The expected increment at any step is the initial red fraction.",
  },
  {
    id: "pr-398",
    title: "Birthday Collision Expected Pairs",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Among n people with d equally likely birthdays, the expected number of colliding pairs is C(n, 2) / d.\n\nGiven n and d, return the expected number of shared-birthday pairs.",
    starterCode: `def birthday_collision_expected_pairs(n, d):
    # Your code here
    pass`,
    solution: `def birthday_collision_expected_pairs(n, d):
    return n * (n - 1) / (2.0 * d)`,
    testCases: [
      { input: [23, 365], expected: 0.6931506849315069 },
      { input: [10, 12], expected: 3.75 },
      { input: [100, 365], expected: 13.561643835616438 },
    ],
    hint: "Linearity of expectation over all pairs.",
  },
  {
    id: "pr-399",
    title: "Expected Trials Two Coupons",
    category: "Probability",
    difficulty: "Hard",
    description:
      "If each trial independently yields coupon A with probability p1, coupon B with probability p2, or neither, the expected number of trials until both have appeared is 1/p1 + 1/p2 - 1/(p1 + p2).\n\nGiven p1 and p2 with p1 + p2 <= 1, return the expectation.",
    starterCode: `def expected_trials_two_coupons(p1, p2):
    # Your code here
    pass`,
    solution: `def expected_trials_two_coupons(p1, p2):
    return 1.0 / p1 + 1.0 / p2 - 1.0 / (p1 + p2)`,
    testCases: [
      { input: [0.1, 0.2], expected: 11.666666666666668 },
      { input: [0.5, 0.5], expected: 3.0 },
      { input: [0.25, 0.25], expected: 6.0 },
    ],
    hint: "Inclusion-exclusion over the two waiting times.",
  },
  {
    id: "pr-400",
    title: "Renewal Expected Event Count",
    category: "Probability",
    difficulty: "Easy",
    description:
      "By the elementary renewal theorem, the expected number of renewals by time t is approximately t / mean_interarrival.\n\nGiven t and the mean interarrival time, return the expected count.",
    starterCode: `def renewal_expected_count(t, mean_interarrival):
    # Your code here
    pass`,
    solution: `def renewal_expected_count(t, mean_interarrival):
    return t / mean_interarrival`,
    testCases: [
      { input: [10.0, 2.0], expected: 5.0 },
      { input: [100.0, 0.5], expected: 200.0 },
      { input: [1.0, 1.0], expected: 1.0 },
    ],
    hint: "Long-run renewal rate is the reciprocal mean.",
  },
];
