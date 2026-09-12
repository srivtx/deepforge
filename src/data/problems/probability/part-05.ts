import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "pr-141",
    title: "Monty Hall Switch Win Probability",
    category: "Probability",
    difficulty: "Easy",
    description:
      "In the Monty Hall game you pick one of n_doors doors, the host opens a different door with no prize, and you switch to one of the remaining n - 2 unopened doors. Return the probability that switching wins:\n\nP = (n - 1) / (n * (n - 2)).\n\nReturn 0.0 when n_doors < 3, since there is nothing to switch to.",
    starterCode: `def monty_hall_switch_win(n_doors):
    # Your code here
    pass`,
    solution: `def monty_hall_switch_win(n_doors):
    if n_doors < 3:
        return 0.0
    return (n_doors - 1) / (n_doors * (n_doors - 2.0))`,
    testCases: [
      { input: [3], expected: 0.6666666666666666 },
      { input: [4], expected: 0.375 },
      { input: [5], expected: 0.26666666666666666 },
      { input: [2], expected: 0.0 },
    ],
    hint: "Your first pick wins with probability 1 / n, and the prize is behind all other unopened doors otherwise.",
  },
  {
    id: "pr-142",
    title: "St. Petersburg Finite Cutoff EV",
    category: "Probability",
    difficulty: "Easy",
    description:
      "In the St. Petersburg game a fair coin is flipped until the first tail, paying 2^k after k heads, but play is cut off after n rounds. Each of the n rounds contributes 1 to the expectation, so return [expected payoff, maximum payoff] = [n, 2^n].\n\nReturn [0.0, 0.0] for n <= 0.",
    starterCode: `def st_petersburg_finite_ev(n):
    # Your code here
    pass`,
    solution: `def st_petersburg_finite_ev(n):
    if n <= 0:
        return [0.0, 0.0]
    return [float(n), float(2 ** n)]`,
    testCases: [
      { input: [1], expected: [1.0, 2.0] },
      { input: [3], expected: [3.0, 8.0] },
      { input: [10], expected: [10.0, 1024.0] },
      { input: [0], expected: [0.0, 0.0] },
    ],
    hint: "The k-th round adds 2^k * 2^(-k) = 1 to the expectation.",
  },
  {
    id: "pr-143",
    title: "Boy-Girl Paradox Probability",
    category: "Probability",
    difficulty: "Easy",
    description:
      "A family has two children. If condition is the string at_least_one, you know at least one child is a boy and the probability both are boys is 1 / 3. If condition is older, you know the older child is a boy and the probability is 1 / 2.\n\nReturn 0.0 for any other condition.",
    starterCode: `def boy_girl_probability(condition):
    # Your code here
    pass`,
    solution: `def boy_girl_probability(condition):
    if condition == "at_least_one":
        return 1.0 / 3.0
    if condition == "older":
        return 0.5
    return 0.0`,
    testCases: [
      { input: ["at_least_one"], expected: 0.3333333333333333 },
      { input: ["older"], expected: 0.5 },
      { input: ["unknown"], expected: 0.0 },
    ],
    hint: "List the four equally likely boy-girl orders and condition on the information given.",
  },
  {
    id: "pr-144",
    title: "Secretary Problem Threshold",
    category: "Probability",
    difficulty: "Easy",
    description:
      "In the secretary problem with n applicants, the optimal strategy rejects the first n / e applicants and then hires the next applicant better than all rejected ones. Return the number of applicants to skip, rounded to the nearest integer.\n\nReturn 0 for n <= 0.",
    starterCode: `import math


def secretary_threshold(n):
    # Your code here
    pass`,
    solution: `import math


def secretary_threshold(n):
    if n <= 0:
        return 0
    return int(math.floor(n / math.e + 0.5))`,
    testCases: [
      { input: [3], expected: 1 },
      { input: [10], expected: 4 },
      { input: [100], expected: 37 },
      { input: [0], expected: 0 },
    ],
    hint: "The optimal fraction of applicants to skip approaches 1 / e.",
  },
  {
    id: "pr-145",
    title: "Hat-Check No-Match Probability",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Probability that in a random permutation of n hats no one gets their own hat back:\n\nP = sum from k = 0 to n of (-1)^k / k!\n\nwhich converges to 1 / e. Return 0.0 for negative n.",
    starterCode: `import math


def hat_check_no_match_probability(n):
    # Your code here
    pass`,
    solution: `import math


def hat_check_no_match_probability(n):
    if n < 0:
        return 0.0
    total = 0.0
    for k in range(n + 1):
        total += ((-1) ** k) / math.factorial(k)
    return total`,
    testCases: [
      { input: [0], expected: 1.0 },
      { input: [1], expected: 0.0 },
      { input: [3], expected: 0.33333333333333337 },
      { input: [10], expected: 0.3678794642857144 },
    ],
    hint: "This is the derangement probability, the inclusion-exclusion complement of all match patterns.",
  },
  {
    id: "pr-146",
    title: "Expected Fixed Points",
    category: "Probability",
    difficulty: "Easy",
    description:
      "A uniformly random permutation of n items has exactly one fixed point in expectation: each of the n items is fixed with probability 1 / n and expectations add.\n\nReturn 1.0 for n >= 1 and 0.0 for n <= 0.",
    starterCode: `def expected_fixed_points(n):
    # Your code here
    pass`,
    solution: `def expected_fixed_points(n):
    if n <= 0:
        return 0.0
    return 1.0`,
    testCases: [
      { input: [1], expected: 1.0 },
      { input: [10], expected: 1.0 },
      { input: [0], expected: 0.0 },
    ],
    hint: "Use indicator variables for each item being a fixed point.",
  },
  {
    id: "pr-147",
    title: "Ballot Problem Probability",
    category: "Probability",
    difficulty: "Easy",
    description:
      "The ballot problem: candidate A receives a votes and candidate B receives b votes, and votes are counted in random order. Return the probability that A is strictly ahead of B throughout the count:\n\nP = (a - b) / (a + b).\n\nReturn 0.0 when a < b or the total is 0.",
    starterCode: `def ballot_probability(a, b):
    # Your code here
    pass`,
    solution: `def ballot_probability(a, b):
    total = a + b
    if total <= 0 or a < b:
        return 0.0
    return (a - b) / total`,
    testCases: [
      { input: [6, 4], expected: 0.2 },
      { input: [5, 3], expected: 0.25 },
      { input: [3, 3], expected: 0.0 },
      { input: [4, 6], expected: 0.0 },
    ],
    hint: "The result is the reflection principle count divided by the total count.",
  },
  {
    id: "pr-148",
    title: "Runs Test Statistic",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Return the number of runs (maximal blocks of equal values) in a binary sequence. An empty sequence has 0 runs, and each change between adjacent values starts a new run.",
    starterCode: `def count_runs(sequence):
    # Your code here
    pass`,
    solution: `def count_runs(sequence):
    if len(sequence) == 0:
        return 0
    runs = 1
    for i in range(1, len(sequence)):
        if sequence[i] != sequence[i - 1]:
            runs += 1
    return runs`,
    testCases: [
      { input: [[1, 1, 0, 0, 1]], expected: 3 },
      { input: [[1, 0, 1, 0, 1]], expected: 5 },
      { input: [[]], expected: 0 },
      { input: [[0, 0, 0]], expected: 1 },
    ],
    hint: "Start counting at 1 for a nonempty sequence, then count value changes.",
  },
  {
    id: "pr-149",
    title: "Expected Record Values",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Expected number of records (left-to-right maxima) in n independent continuous observations:\n\nE[records] = H_n = 1 + 1/2 + ... + 1/n.\n\nThe k-th observation is a record with probability 1 / k. Return 0.0 for n <= 0.",
    starterCode: `def expected_records(n):
    # Your code here
    pass`,
    solution: `def expected_records(n):
    if n <= 0:
        return 0.0
    total = 0.0
    for k in range(1, n + 1):
        total += 1.0 / k
    return total`,
    testCases: [
      { input: [1], expected: 1.0 },
      { input: [2], expected: 1.5 },
      { input: [5], expected: 2.283333333333333 },
      { input: [0], expected: 0.0 },
    ],
    hint: "Use indicators and linearity of expectation.",
  },
  {
    id: "pr-150",
    title: "Poker Flush Probability",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Probability that a 5-card hand from a deck with 13 ranks and suits suits is a flush:\n\nP = suits * C(13, 5) / C(13 * suits, 5).\n\nWhen include_straight_flush is False, subtract the 10 * suits straight flushes from the numerator. Return 0.0 for suits < 1.",
    starterCode: `import math


def poker_flush_probability(suits, include_straight_flush):
    # Your code here
    pass`,
    solution: `import math


def poker_flush_probability(suits, include_straight_flush):
    ranks = 13
    deck = ranks * suits
    if suits < 1:
        return 0.0
    total = math.comb(deck, 5)
    flush = suits * math.comb(ranks, 5)
    if not include_straight_flush:
        flush -= 10 * suits
    return flush / total`,
    testCases: [
      { input: [4, true], expected: 0.0019807923169267707 },
      { input: [4, false], expected: 0.001965401545233478 },
      { input: [2, true], expected: 0.0391304347826087 },
      { input: [2, false], expected: 0.03882639100030404 },
    ],
    hint: "There are 10 straight sequences in 13 ranks: A2345 through 9TJQK.",
  },
  {
    id: "pr-151",
    title: "Bridge Void Probability",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Probability that a hand of hand_size cards dealt from a deck with four suits of suit_length cards each is void in one specified suit:\n\nP = C(deck - suit_length, hand_size) / C(deck, hand_size)\n\nwith deck = 4 * suit_length. Return 0.0 for invalid inputs.",
    starterCode: `import math


def bridge_void_probability(hand_size, suit_length):
    # Your code here
    pass`,
    solution: `import math


def bridge_void_probability(hand_size, suit_length):
    deck = 4 * suit_length
    if hand_size < 0 or hand_size > deck or suit_length <= 0:
        return 0.0
    return math.comb(deck - suit_length, hand_size) / math.comb(deck, hand_size)`,
    testCases: [
      { input: [13, 13], expected: 0.012790948037576362 },
      { input: [5, 4], expected: 0.1813186813186813 },
      { input: [1, 4], expected: 0.75 },
      { input: [1, 3], expected: 0.75 },
    ],
    hint: "Choose all cards from the other three suits.",
  },
  {
    id: "pr-152",
    title: "Polya Contagion Update",
    category: "Probability",
    difficulty: "Easy",
    description:
      "A Polya urn starts with r red and b blue balls. After observed_reds red balls appeared in observed_total draws, return the predictive probability that the next draw is red:\n\nP = (r + observed_reds) / (r + b + observed_total).\n\nReturn 0.0 for inconsistent or empty inputs.",
    starterCode: `def polya_contagion_probability(r, b, observed_reds, observed_total):
    # Your code here
    pass`,
    solution: `def polya_contagion_probability(r, b, observed_reds, observed_total):
    if r + b <= 0 or observed_reds < 0 or observed_total < observed_reds:
        return 0.0
    return (r + observed_reds) / (r + b + observed_total)`,
    testCases: [
      { input: [1, 1, 1, 1], expected: 0.6666666666666666 },
      { input: [2, 3, 0, 0], expected: 0.4 },
      { input: [1, 1, 2, 4], expected: 0.5 },
      { input: [0, 0, 0, 0], expected: 0.0 },
    ],
    hint: "Replace each drawn ball and add one of the same color, so the proportions update by counts.",
  },
  {
    id: "pr-153",
    title: "Ehrenfest Return Time",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Expected return time to state 0 of the Ehrenfest chain with d balls, which equals the reciprocal of its stationary probability 2^(-d):\n\nE[T] = 2^d.\n\nReturn 0 for negative d.",
    starterCode: `def ehrenfest_return_time(d):
    # Your code here
    pass`,
    solution: `def ehrenfest_return_time(d):
    if d < 0:
        return 0
    return 2 ** d`,
    testCases: [
      { input: [0], expected: 1 },
      { input: [1], expected: 2 },
      { input: [4], expected: 16 },
      { input: [10], expected: 1024 },
    ],
    hint: "For a finite irreducible chain, the mean return time to a state is 1 over its stationary probability.",
  },
  {
    id: "pr-154",
    title: "Expected Empty Bins",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Expected number of empty bins after balls are thrown independently and uniformly into bins:\n\nE[empty] = bins * (1 - 1 / bins)^balls.\n\nUse linearity of expectation over bins. Return 0.0 for bins <= 0 or balls < 0.",
    starterCode: `def expected_empty_bins(balls, bins):
    # Your code here
    pass`,
    solution: `def expected_empty_bins(balls, bins):
    if balls < 0 or bins <= 0:
        return 0.0
    return bins * ((1.0 - 1.0 / bins) ** balls)`,
    testCases: [
      { input: [10, 10], expected: 3.486784401000001 },
      { input: [0, 5], expected: 5.0 },
      { input: [5, 5], expected: 1.6384000000000003 },
      { input: [3, 0], expected: 0.0 },
    ],
    hint: "Each fixed bin stays empty with probability (1 - 1 / bins)^balls.",
  },
  {
    id: "pr-155",
    title: "Expected Degree in G(n,p)",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Expected degree of a fixed vertex in the Erdos-Renyi random graph G(n, p):\n\nE[degree] = (n - 1) * p.\n\nEach of the n - 1 possible edges appears independently. Return 0.0 for n <= 0.",
    starterCode: `def expected_degree(n, p):
    # Your code here
    pass`,
    solution: `def expected_degree(n, p):
    if n <= 0:
        return 0.0
    return (n - 1) * p`,
    testCases: [
      { input: [10, 0.5], expected: 4.5 },
      { input: [5, 0.2], expected: 0.8 },
      { input: [1, 0.9], expected: 0.0 },
    ],
    hint: "Sum the edge-indicator expectations for one vertex.",
  },
  {
    id: "pr-156",
    title: "Regression to the Mean Prediction",
    category: "Probability",
    difficulty: "Easy",
    description:
      "With overall mean mean and correlation rho between two measurements, the predicted second measurement for a first measurement x regresses toward the mean:\n\nprediction = mean + rho * (x - mean).\n\nReturn the prediction.",
    starterCode: `def regression_to_mean_prediction(mean, x, rho):
    # Your code here
    pass`,
    solution: `def regression_to_mean_prediction(mean, x, rho):
    return mean + rho * (x - mean)`,
    testCases: [
      { input: [0, 1, 0.5], expected: 0.5 },
      { input: [100, 120, 0.7], expected: 114.0 },
      { input: [0, 2, 0], expected: 0.0 },
      { input: [50, 50, 0.9], expected: 50.0 },
    ],
    hint: "With perfect correlation the prediction stays at x; with zero correlation it collapses to the mean.",
  },
  {
    id: "pr-157",
    title: "Bertrand's Box Posterior",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Each box holds items described by a [gold, silver] count pair, and a uniformly chosen box yields a gold item. Return the posterior probability that the next item drawn from the same box is also gold, weighting boxes by the probability g / (g + s) of producing the observed gold:\n\nP = sum over boxes of w * (g - 1) / (g + s - 1) divided by sum of w, with w = g / (g + s).\n\nReturn 0.0 when no gold can be drawn.",
    starterCode: `def bertrand_box_posterior(boxes):
    # Your code here
    pass`,
    solution: `def bertrand_box_posterior(boxes):
    denom = 0.0
    num = 0.0
    for g, s in boxes:
        if g <= 0:
            continue
        w = g / (g + s)
        denom += w
        if g + s > 1:
            num += w * (g - 1) / (g + s - 1)
    if denom == 0:
        return 0.0
    return num / denom`,
    testCases: [
      { input: [[[2, 0], [0, 2], [1, 1]]], expected: 0.6666666666666666 },
      { input: [[[1, 0], [0, 1]]], expected: 0.0 },
      { input: [[[1, 1]]], expected: 0.0 },
      { input: [[[3, 1], [0, 2]]], expected: 0.6666666666666666 },
      { input: [[]], expected: 0.0 },
    ],
    hint: "Condition on which box was chosen; boxes with more gold items are more likely to have produced the draw.",
  },
  {
    id: "pr-158",
    title: "Two Envelopes Naive Expected Value",
    category: "Probability",
    difficulty: "Medium",
    description:
      "The two-envelope puzzle: after seeing amount in one envelope, the naive argument says the other holds 2 * amount or amount / 2 with equal probability, giving a switch expected value of 1.25 * amount.\n\nReturn [keep_value, naive_switch_value] = [amount, 1.25 * amount].",
    starterCode: `def two_envelope_naive_ev(amount):
    # Your code here
    pass`,
    solution: `def two_envelope_naive_ev(amount):
    return [float(amount), 1.25 * amount]`,
    testCases: [
      { input: [10], expected: [10.0, 12.5] },
      { input: [0], expected: [0.0, 0.0] },
      { input: [8], expected: [8.0, 10.0] },
    ],
    hint: "The naive calculation ignores that the amount you saw changes the distribution of what is in the other envelope.",
  },
  {
    id: "pr-159",
    title: "Expected Cycles in a Permutation",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Expected number of cycles in a uniformly random permutation of n items:\n\nE[cycles] = H_n = 1 + 1/2 + ... + 1/n.\n\nThe k-th item ends a cycle with probability 1 / k when items are processed by relative rank. Return 0.0 for n <= 0.",
    starterCode: `def expected_cycles(n):
    # Your code here
    pass`,
    solution: `def expected_cycles(n):
    if n <= 0:
        return 0.0
    total = 0.0
    for k in range(1, n + 1):
        total += 1.0 / k
    return total`,
    testCases: [
      { input: [1], expected: 1.0 },
      { input: [2], expected: 1.5 },
      { input: [4], expected: 2.083333333333333 },
      { input: [10], expected: 2.9289682539682538 },
    ],
    hint: "Count cycle leaders with indicators and linearity of expectation.",
  },
  {
    id: "pr-160",
    title: "Arcsine Law Last Visit Probability",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Arcsine law for a symmetric simple random walk. Return the probability that the last visit to 0 up to time 2n occurs at time 2k:\n\nP = C(2k, k) * C(2n - 2k, n - k) / 4^n.\n\nReturn 0.0 when k lies outside 0..n.",
    starterCode: `import math


def arcsine_last_visit_probability(n, k):
    # Your code here
    pass`,
    solution: `import math


def arcsine_last_visit_probability(n, k):
    if n < 0 or k < 0 or k > n:
        return 0.0
    return math.comb(2 * k, k) * math.comb(2 * (n - k), n - k) / (4.0 ** n)`,
    testCases: [
      { input: [1, 0], expected: 0.5 },
      { input: [1, 1], expected: 0.5 },
      { input: [2, 0], expected: 0.375 },
      { input: [2, 1], expected: 0.25 },
      { input: [2, 2], expected: 0.375 },
    ],
    hint: "The last visit splits the walk into two independent excursions.",
  },
  {
    id: "pr-161",
    title: "Waiting Time for a Pattern",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Expected number of fair coin flips until a given pattern of H and T appears:\n\nE[T] = sum of 2^k over lengths k where the length-k prefix equals the length-k suffix of the pattern.\n\nFor example HTH waits 10 flips on average. Return the expectation.",
    starterCode: `def expected_wait_pattern(pattern):
    # Your code here
    pass`,
    solution: `def expected_wait_pattern(pattern):
    total = 0.0
    n = len(pattern)
    for k in range(1, n + 1):
        if pattern[:k] == pattern[-k:]:
            total += 2.0 ** k
    return total`,
    testCases: [
      { input: ["HTH"], expected: 10.0 },
      { input: ["HHT"], expected: 8.0 },
      { input: ["HHH"], expected: 14.0 },
      { input: ["HT"], expected: 4.0 },
      { input: ["HH"], expected: 6.0 },
    ],
    hint: "Self-overlaps of the pattern add 2^k waiting time for each overlap length k.",
  },
  {
    id: "pr-162",
    title: "Poker Full House Probability",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Probability that a 5-card hand is a full house (three of one rank and two of another) in a deck with ranks ranks and suits suits per rank:\n\nP = ranks * C(suits, 3) * (ranks - 1) * C(suits, 2) / C(ranks * suits, 5).\n\nReturn 0.0 for invalid inputs.",
    starterCode: `import math


def poker_full_house_probability(ranks, suits):
    # Your code here
    pass`,
    solution: `import math


def poker_full_house_probability(ranks, suits):
    if ranks < 2 or suits < 3:
        return 0.0
    total = math.comb(ranks * suits, 5)
    if total == 0:
        return 0.0
    count = ranks * math.comb(suits, 3) * (ranks - 1) * math.comb(suits, 2)
    return count / total`,
    testCases: [
      { input: [13, 4], expected: 0.0014405762304921968 },
      { input: [5, 4], expected: 0.030959752321981424 },
      { input: [2, 4], expected: 0.8571428571428571 },
    ],
    hint: "Pick the trips rank, its three suits, the pair rank and its two suits.",
  },
  {
    id: "pr-163",
    title: "Poker Two Pair Probability",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Probability that a 5-card hand is exactly two pair in a deck with ranks ranks and suits suits:\n\nP = C(ranks, 2) * C(suits, 2)^2 * (ranks - 2) * suits / C(ranks * suits, 5).\n\nReturn 0.0 for invalid inputs.",
    starterCode: `import math


def poker_two_pair_probability(ranks, suits):
    # Your code here
    pass`,
    solution: `import math


def poker_two_pair_probability(ranks, suits):
    if ranks < 3 or suits < 2:
        return 0.0
    total = math.comb(ranks * suits, 5)
    if total == 0:
        return 0.0
    count = math.comb(ranks, 2) * math.comb(suits, 2) ** 2 * (ranks - 2) * suits
    return count / total`,
    testCases: [
      { input: [13, 4], expected: 0.0475390156062425 },
      { input: [5, 4], expected: 0.2786377708978328 },
      { input: [4, 2], expected: 0.42857142857142855 },
    ],
    hint: "Choose two pair ranks, the suits in each pair, then any kicker from another rank.",
  },
  {
    id: "pr-164",
    title: "Chinese Restaurant Next Table",
    category: "Probability",
    difficulty: "Medium",
    description:
      "In the Chinese restaurant process with concentration theta after n seated customers, return the probability that the next customer joins a table of size table_size. A new table (table_size = 0) has probability theta / (theta + n); an existing table has probability table_size / (theta + n).\n\nReturn 0.0 for invalid inputs.",
    starterCode: `def crp_next_table_probability(theta, table_size, n):
    # Your code here
    pass`,
    solution: `def crp_next_table_probability(theta, table_size, n):
    if theta <= 0 or n < 0 or table_size < 0 or table_size > n:
        return 0.0
    if table_size == 0:
        return theta / (theta + n)
    return table_size / (theta + n)`,
    testCases: [
      { input: [1, 0, 0], expected: 1.0 },
      { input: [1, 5, 10], expected: 0.45454545454545453 },
      { input: [2, 0, 3], expected: 0.4 },
      { input: [1, 3, 0], expected: 0.0 },
    ],
    hint: "The total weight is theta for new tables plus n for all seated customers.",
  },
  {
    id: "pr-165",
    title: "Dirichlet Process Expected Tables",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Expected number of distinct tables after n customers arrive in a Dirichlet process with concentration theta:\n\nE[tables] = sum from i = 0 to n - 1 of theta / (theta + i).\n\nReturn 0.0 for n <= 0 or theta <= 0.",
    starterCode: `def dp_expected_tables(theta, n):
    # Your code here
    pass`,
    solution: `def dp_expected_tables(theta, n):
    if theta <= 0 or n <= 0:
        return 0.0
    total = 0.0
    for i in range(n):
        total += theta / (theta + i)
    return total`,
    testCases: [
      { input: [1, 0], expected: 0.0 },
      { input: [1, 1], expected: 1.0 },
      { input: [1, 5], expected: 2.283333333333333 },
      { input: [2, 3], expected: 2.1666666666666665 },
    ],
    hint: "The i-th customer starts a new table with probability theta / (theta + i - 1).",
  },
  {
    id: "pr-166",
    title: "Probability of Exactly k Fixed Points",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Probability that a uniformly random permutation of n items has exactly k fixed points:\n\nP = C(n, k) * D(n - k) / n!\n\nwhere D(m) is the number of derangements of m items. Return 0.0 for invalid k.",
    starterCode: `import math


def probability_k_fixed_points(n, k):
    # Your code here
    pass`,
    solution: `import math


def probability_k_fixed_points(n, k):
    if n < 0 or k < 0 or k > n:
        return 0.0
    return math.comb(n, k) * _derangements(n - k) / math.factorial(n)


def _derangements(m):
    if m == 0:
        return 1
    if m == 1:
        return 0
    a, b = 1, 0
    for i in range(2, m + 1):
        a, b = b, (i - 1) * (a + b)
    return b`,
    testCases: [
      { input: [3, 0], expected: 0.3333333333333333 },
      { input: [3, 1], expected: 0.5 },
      { input: [3, 3], expected: 0.16666666666666666 },
      { input: [4, 0], expected: 0.375 },
      { input: [2, 3], expected: 0.0 },
    ],
    hint: "Choose the fixed points, then derange the rest.",
  },
  {
    id: "pr-167",
    title: "Probability of At Least One Fixed Point",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Probability that a uniformly random permutation of n items has at least one fixed point:\n\nP = 1 - D(n) / n!\n\nwhere D(n) is the derangement count. The value approaches 1 - 1 / e. Return 0.0 for n <= 0.",
    starterCode: `import math


def probability_at_least_one_fixed_point(n):
    # Your code here
    pass`,
    solution: `import math


def probability_at_least_one_fixed_point(n):
    if n <= 0:
        return 0.0
    return 1.0 - _derangements(n) / math.factorial(n)


def _derangements(m):
    if m == 0:
        return 1
    if m == 1:
        return 0
    a, b = 1, 0
    for i in range(2, m + 1):
        a, b = b, (i - 1) * (a + b)
    return b`,
    testCases: [
      { input: [1], expected: 1.0 },
      { input: [2], expected: 0.5 },
      { input: [3], expected: 0.6666666666666667 },
      { input: [4], expected: 0.625 },
    ],
    hint: "Complement of the hat-check no-match probability.",
  },
  {
    id: "pr-168",
    title: "Probability All Balls in Distinct Bins",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Probability that balls thrown independently and uniformly into bins all land in distinct bins:\n\nP = bins * (bins - 1) * ... * (bins - balls + 1) / bins^balls.\n\nReturn 0.0 when balls > bins or inputs are invalid.",
    starterCode: `def probability_distinct_bins(balls, bins):
    # Your code here
    pass`,
    solution: `def probability_distinct_bins(balls, bins):
    if balls < 0 or bins <= 0 or balls > bins:
        return 0.0
    falling = 1.0
    for i in range(balls):
        falling *= bins - i
    return falling / (bins ** balls)`,
    testCases: [
      { input: [2, 2], expected: 0.5 },
      { input: [3, 6], expected: 0.5555555555555556 },
      { input: [1, 6], expected: 1.0 },
      { input: [4, 3], expected: 0.0 },
    ],
    hint: "This is the birthday-style no-collision probability.",
  },
  {
    id: "pr-169",
    title: "Gambler's Fallacy Sequence Probability",
    category: "Probability",
    difficulty: "Medium",
    description:
      "A gambler believes a tail is due after k heads in a row. Return the actual probability of seeing k heads followed by a tail under independence:\n\nP = p^k * (1 - p).\n\nThe probability of the next flip never depends on past flips. Return 0.0 for k < 0.",
    starterCode: `def gamblers_fallacy_probability(p, k):
    # Your code here
    pass`,
    solution: `def gamblers_fallacy_probability(p, k):
    if k < 0:
        return 0.0
    return (p ** k) * (1.0 - p)`,
    testCases: [
      { input: [0.5, 3], expected: 0.0625 },
      { input: [0.5, 0], expected: 0.5 },
      { input: [0.3, 2], expected: 0.063 },
      { input: [1.0, 5], expected: 0.0 },
    ],
    hint: "Multiply the probabilities of the k heads and the final tail.",
  },
  {
    id: "pr-170",
    title: "Hot-Hand Test Statistic",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Return [P(hit after hit), P(hit after miss)] for a binary sequence of 1 (hit) and 0 (miss). A conditional probability with no transitions of that type is reported as 0.0.",
    starterCode: `def hot_hand_statistic(sequence):
    # Your code here
    pass`,
    solution: `def hot_hand_statistic(sequence):
    after_hit = [0, 0]
    after_miss = [0, 0]
    for i in range(len(sequence) - 1):
        if sequence[i] == 1:
            after_hit[1] += 1
            after_hit[0] += sequence[i + 1]
        else:
            after_miss[1] += 1
            after_miss[0] += sequence[i + 1]
    p_hit = after_hit[0] / after_hit[1] if after_hit[1] > 0 else 0.0
    p_miss = after_miss[0] / after_miss[1] if after_miss[1] > 0 else 0.0
    return [p_hit, p_miss]`,
    testCases: [
      { input: [[1, 1, 1, 0, 1, 0, 1]], expected: [0.5, 1.0] },
      { input: [[1, 0, 1, 0]], expected: [0.0, 1.0] },
      { input: [[0, 0, 0]], expected: [0.0, 0.0] },
      { input: [[1]], expected: [0.0, 0.0] },
    ],
    hint: "Count transitions out of each state and how often they lead to a hit.",
  },
  {
    id: "pr-171",
    title: "Base-Rate Fallacy False Positive Share",
    category: "Probability",
    difficulty: "Medium",
    description:
      "For a disease with prevalence prevalence and a test with the given sensitivity and specificity, return the fraction of positive tests that are false positives:\n\nshare = (1 - prevalence) * (1 - specificity) / (prevalence * sensitivity + (1 - prevalence) * (1 - specificity)).\n\nReturn 0.0 when the denominator is 0 or inputs are invalid.",
    starterCode: `def false_positive_share(prevalence, sensitivity, specificity):
    # Your code here
    pass`,
    solution: `def false_positive_share(prevalence, sensitivity, specificity):
    if prevalence < 0 or prevalence > 1 or sensitivity < 0 or specificity < 0:
        return 0.0
    fp = (1.0 - prevalence) * (1.0 - specificity)
    tp = prevalence * sensitivity
    denom = tp + fp
    if denom == 0:
        return 0.0
    return fp / denom`,
    testCases: [
      { input: [0.01, 0.99, 0.99], expected: 0.5000000000000002 },
      { input: [0.001, 0.99, 0.99], expected: 0.9098360655737706 },
      { input: [0.5, 0.9, 0.9], expected: 0.09999999999999998 },
    ],
    hint: "Even a good test produces many false positives when the disease is rare.",
  },
  {
    id: "pr-172",
    title: "Simpson's Paradox Reversal Check",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Two 2x2 tables have the form [[successes_a, total_a], [successes_b, total_b]]. Return True when both tables favor the same group by success rate but the pooled table favors the other group, and False otherwise (including ties and degenerate tables).",
    starterCode: `def simpson_reversal_check(table1, table2):
    # Your code here
    pass`,
    solution: `def simpson_reversal_check(table1, table2):
    def rate(pair):
        return pair[0] / pair[1] if pair[1] > 0 else 0.0

    d1 = rate(table1[0]) - rate(table1[1])
    d2 = rate(table2[0]) - rate(table2[1])
    s_a = table1[0][0] + table2[0][0]
    t_a = table1[0][1] + table2[0][1]
    s_b = table1[1][0] + table2[1][0]
    t_b = table1[1][1] + table2[1][1]
    pooled = rate([s_a, t_a]) - rate([s_b, t_b])
    if abs(d1) < 1e-12 or abs(d2) < 1e-12 or abs(pooled) < 1e-12:
        return False
    if (d1 > 0 and d2 > 0 and pooled < 0) or (d1 < 0 and d2 < 0 and pooled > 0):
        return True
    return False`,
    testCases: [
      {
        input: [[[81, 87], [234, 270]], [[192, 263], [55, 80]]],
        expected: true,
      },
      {
        input: [[[60, 100], [10, 50]], [[60, 100], [10, 50]]],
        expected: false,
      },
      {
        input: [[[60, 100], [10, 50]], [[3, 10], [8, 20]]],
        expected: false,
      },
      { input: [[[0, 0], [0, 0]], [[0, 0], [0, 0]]], expected: false },
    ],
    hint: "Compare the within-table rate differences against the pooled rate difference.",
  },
  {
    id: "pr-173",
    title: "Berkson's Paradox Covariance",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Berkson's paradox: A and B are independent with probabilities p_a and p_b, but the data only include cases where A or B occurred. Return the conditional covariance between A and B among selected cases:\n\nP(AB | selected) - P(A | selected) * P(B | selected)\n\nwhich is negative unless one of the probabilities is 0 or 1. Return 0.0 when the selection probability is 0.",
    starterCode: `def berksons_covariance(p_a, p_b):
    # Your code here
    pass`,
    solution: `def berksons_covariance(p_a, p_b):
    denom = p_a + p_b - p_a * p_b
    if denom <= 0:
        return 0.0
    pa = p_a / denom
    pb = p_b / denom
    pab = p_a * p_b / denom
    return pab - pa * pb`,
    testCases: [
      { input: [0.5, 0.5], expected: -0.1111111111111111 },
      { input: [0.2, 0.3], expected: -0.1735537190082645 },
      { input: [1.0, 0.5], expected: 0.0 },
      { input: [0.0, 0.5], expected: 0.0 },
    ],
    hint: "Condition on the union A or B and use P(selected) = p_a + p_b - p_a p_b.",
  },
  {
    id: "pr-174",
    title: "Friendship Paradox Multiplier",
    category: "Probability",
    difficulty: "Medium",
    description:
      "The average degree of a uniformly random neighbor of a uniformly random person is size-biased:\n\nE[neighbor degree] = E[D^2] / E[D] = (variance + mean^2) / mean.\n\nReturn the multiplier over the average degree. Return 0.0 for mean_degree <= 0.",
    starterCode: `def friendship_paradox_multiplier(mean_degree, variance_degree):
    # Your code here
    pass`,
    solution: `def friendship_paradox_multiplier(mean_degree, variance_degree):
    if mean_degree <= 0:
        return 0.0
    return (variance_degree + mean_degree * mean_degree) / mean_degree`,
    testCases: [
      { input: [4, 4], expected: 5.0 },
      { input: [2, 1], expected: 2.5 },
      { input: [10, 90], expected: 19.0 },
      { input: [0, 1], expected: 0.0 },
    ],
    hint: "Neighbors are sampled with probability proportional to their degree.",
  },
  {
    id: "pr-175",
    title: "Inspection Paradox Mean Interval",
    category: "Probability",
    difficulty: "Medium",
    description:
      "For a renewal process with exponential interarrival times of rate lam, the interval containing a randomly chosen time is length-biased. Its mean is:\n\nE[interval] = E[X^2] / E[X] = 2 / lam.\n\nReturn 0.0 for lam <= 0.",
    starterCode: `def inspection_paradox_mean_interval(lam):
    # Your code here
    pass`,
    solution: `def inspection_paradox_mean_interval(lam):
    if lam <= 0:
        return 0.0
    return 2.0 / lam`,
    testCases: [
      { input: [1], expected: 2.0 },
      { input: [0.5], expected: 4.0 },
      { input: [2], expected: 1.0 },
      { input: [0], expected: 0.0 },
    ],
    hint: "The exponential has E[X^2] = 2 / lam^2 and E[X] = 1 / lam.",
  },
  {
    id: "pr-176",
    title: "P-hacking Detection Lite",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Probability of at least one false positive across m independent hypothesis tests each run at significance level alpha:\n\nFWER = 1 - (1 - alpha)^m.\n\nThis is the family-wise error rate that p-hacking inflates. Return 0.0 for invalid inputs.",
    starterCode: `def family_wise_error_rate(alpha, m):
    # Your code here
    pass`,
    solution: `def family_wise_error_rate(alpha, m):
    if alpha < 0 or alpha > 1 or m < 0:
        return 0.0
    return 1.0 - (1.0 - alpha) ** m`,
    testCases: [
      { input: [0.05, 1], expected: 0.050000000000000044 },
      { input: [0.05, 20], expected: 0.6415140775914581 },
      { input: [0.01, 100], expected: 0.6339676587267709 },
      { input: [0.05, 0], expected: 0.0 },
    ],
    hint: "Complement of all tests being non-significant.",
  },
  {
    id: "pr-177",
    title: "Expected Longest Run (Seeded)",
    category: "Probability",
    difficulty: "Hard",
    description:
      "Estimate the expected length of the longest run of heads in n fair coin flips by simulation. Run trials experiments with random.Random(seed) and return the average longest run. Return 0.0 for n <= 0 or trials <= 0.",
    starterCode: `import random


def expected_longest_run_simulation(n, trials, seed):
    # Your code here
    pass`,
    solution: `import random


def expected_longest_run_simulation(n, trials, seed):
    if n <= 0 or trials <= 0:
        return 0.0
    rng = random.Random(seed)
    total = 0.0
    for _ in range(trials):
        longest = 0
        current = 0
        for _ in range(n):
            if rng.random() < 0.5:
                current += 1
                if current > longest:
                    longest = current
            else:
                current = 0
        total += longest
    return total / trials`,
    testCases: [
      { input: [10, 2000, 42], expected: 2.75 },
      { input: [20, 1000, 7], expected: 3.742 },
      { input: [0, 5, 1], expected: 0.0 },
      { input: [1, 100, 0], expected: 0.37 },
    ],
    hint: "Track the current run and the best run for each simulated sequence.",
  },
  {
    id: "pr-178",
    title: "Coupon Collector with Pairs (Seeded)",
    category: "Probability",
    difficulty: "Hard",
    description:
      "Estimate by simulation the expected number of draws needed to see every one of n coupon types at least twice. Run trials experiments with random.Random(seed), stopping each when all counts reach 2, and return the average number of draws. Return 0.0 for n <= 0 or trials <= 0.",
    starterCode: `import random


def coupon_pairs_expected_simulation(n, trials, seed):
    # Your code here
    pass`,
    solution: `import random


def coupon_pairs_expected_simulation(n, trials, seed):
    if n <= 0 or trials <= 0:
        return 0.0
    rng = random.Random(seed)
    total = 0.0
    for _ in range(trials):
        counts = [0] * n
        seen = 0
        draws = 0
        while seen < n:
            idx = int(rng.random() * n)
            counts[idx] += 1
            draws += 1
            if counts[idx] == 2:
                seen += 1
        total += draws
    return total / trials`,
    testCases: [
      { input: [1, 100, 0], expected: 2.0 },
      { input: [5, 300, 42], expected: 19.02 },
      { input: [10, 200, 7], expected: 46.415 },
      { input: [0, 5, 1], expected: 0.0 },
    ],
    hint: "Count how many types have reached two copies and stop when all have.",
  },
  {
    id: "pr-179",
    title: "Penney's Game Probability",
    category: "Probability",
    difficulty: "Hard",
    description:
      "Penney's game: fair coin flips continue until either pattern_a or pattern_b appears. Return the exact probability that pattern_b appears first, computed by solving the absorbing Markov chain whose states are the current prefix matches of both patterns. Return 0.0 if either pattern is empty or the patterns are equal.",
    starterCode: `def penney_game_probability(pattern_a, pattern_b):
    # Your code here
    pass`,
    solution: `def penney_game_probability(pattern_a, pattern_b):
    la = len(pattern_a)
    lb = len(pattern_b)
    if la == 0 or lb == 0 or pattern_a == pattern_b:
        return 0.0
    states = [(i, j) for i in range(la) for j in range(lb)]
    index = {}
    for idx, s in enumerate(states):
        index[s] = idx
    size = len(states)
    mat = [[0.0] * (size + 1) for _ in range(size)]
    for (i, j) in states:
        row = index[(i, j)]
        mat[row][row] = 1.0
        for c in ("H", "T"):
            ni = _next_match(pattern_a, i, c)
            nj = _next_match(pattern_b, j, c)
            if ni == la and nj == lb:
                mat[row][size] += 0.5
            elif ni == la:
                pass
            elif nj == lb:
                mat[row][size] += 0.5
            else:
                mat[row][index[(ni, nj)]] -= 0.5
    for col in range(size):
        piv = max(range(col, size), key=lambda r: abs(mat[r][col]))
        mat[col], mat[piv] = mat[piv], mat[col]
        pv = mat[col][col]
        if abs(pv) < 1e-15:
            continue
        for c in range(col, size + 1):
            mat[col][c] /= pv
        for r in range(size):
            if r != col and abs(mat[r][col]) > 1e-15:
                f = mat[r][col]
                for c in range(col, size + 1):
                    mat[r][c] -= f * mat[col][c]
    return mat[index[(0, 0)]][size]


def _next_match(pattern, i, c):
    s = pattern[:i] + c
    best = 0
    for k in range(min(len(pattern), len(s)), 0, -1):
        if s[-k:] == pattern[:k]:
            best = k
            break
    return best`,
    testCases: [
      { input: ["HHH", "THH"], expected: 0.875 },
      { input: ["THH", "HHT"], expected: 0.25 },
      { input: ["HTH", "HHT"], expected: 0.6666666666666666 },
      { input: ["HHH", "HHT"], expected: 0.5 },
      { input: ["HHH", "HHH"], expected: 0.0 },
    ],
    hint: "Set up one linear equation per prefix-match state and solve the system.",
  },
  {
    id: "pr-180",
    title: "Ewens Sampling Probability",
    category: "Probability",
    difficulty: "Hard",
    description:
      "Ewens sampling formula probability of a partition with counts counts, where counts[j - 1] is the number of parts of size j, for concentration theta:\n\nP = n! / (theta * (theta + 1) * ... * (theta + n - 1)) * product over j of theta^a_j / (j^a_j * a_j!)\n\nwith n = sum of j * counts[j - 1]. Return 0.0 for theta <= 0 or negative counts.",
    starterCode: `import math


def ewens_partition_probability(counts, theta):
    # Your code here
    pass`,
    solution: `import math


def ewens_partition_probability(counts, theta):
    if theta <= 0:
        return 0.0
    n = 0
    for j, a in enumerate(counts):
        if a < 0:
            return 0.0
        n += (j + 1) * a
    logp = math.lgamma(n + 1)
    for i in range(n):
        logp -= math.log(theta + i)
    for j, a in enumerate(counts):
        if a > 0:
            logp += a * math.log(theta) - a * math.log(j + 1) - math.lgamma(a + 1)
    return math.exp(logp)`,
    testCases: [
      { input: [[2], 1], expected: 0.5 },
      { input: [[0, 1], 1], expected: 0.49999999999999983 },
      { input: [[3], 1], expected: 0.16666666666666663 },
      { input: [[0, 1], 2], expected: 0.3333333333333332 },
    ],
    hint: "Work in log space with the rising factorial theta (theta + 1) ... (theta + n - 1).",
  },
  {
    id: "pr-181",
    title: "Secretary Optimal Success Probability",
    category: "Probability",
    difficulty: "Hard",
    description:
      "Exact optimal success probability for the secretary problem with n applicants, maximizing over the number of applicants to reject:\n\nP(k) = (k - 1) / n * sum from j = k to n of 1 / (j - 1).\n\nReturn 1.0 for n = 1 and 0.0 for n <= 0.",
    starterCode: `def secretary_success_probability(n):
    # Your code here
    pass`,
    solution: `def secretary_success_probability(n):
    if n <= 0:
        return 0.0
    if n == 1:
        return 1.0
    best = 0.0
    for k in range(2, n + 1):
        s = 0.0
        for j in range(k, n + 1):
            s += 1.0 / (j - 1)
        p = (k - 1.0) / n * s
        if p > best:
            best = p
    return best`,
    testCases: [
      { input: [1], expected: 1.0 },
      { input: [2], expected: 0.5 },
      { input: [3], expected: 0.5 },
      { input: [10], expected: 0.39869047619047615 },
      { input: [100], expected: 0.3710427787126428 },
    ],
    hint: "The best applicant is hired when the first record after the rejection phase is the global best.",
  },
  {
    id: "pr-182",
    title: "Optional Stopping Inflation (Seeded)",
    category: "Probability",
    difficulty: "Hard",
    description:
      "Optional stopping can inflate the largest z-score. Estimate E[max of n independent standard normal variables] by simulation: for each of trials experiments draw n standard normals with a seeded Box-Muller transform and average the maximum. Return 0.0 for n <= 0 or trials <= 0.",
    starterCode: `import math
import random


def max_of_normals_expected_simulation(n, trials, seed):
    # Your code here
    pass`,
    solution: `import math
import random


def max_of_normals_expected_simulation(n, trials, seed):
    if n <= 0 or trials <= 0:
        return 0.0
    rng = random.Random(seed)
    total = 0.0
    for _ in range(trials):
        best = -1e300
        for _ in range(n):
            u1 = 1.0 - rng.random()
            u2 = rng.random()
            z = math.sqrt(-2.0 * math.log(u1)) * math.cos(2.0 * math.pi * u2)
            if z > best:
                best = z
        total += best
    return total / trials`,
    testCases: [
      { input: [10, 2000, 42], expected: 1.5311661530535472 },
      { input: [100, 1000, 7], expected: 2.5290880063226346 },
      { input: [1, 500, 0], expected: -0.03259471581671577 },
      { input: [0, 5, 1], expected: 0.0 },
    ],
    hint: "Use 1 - rng.random() in the Box-Muller transform so the logarithm is always defined.",
  },
  {
    id: "pr-183",
    title: "Birthday Threshold Search",
    category: "Probability",
    difficulty: "Hard",
    description:
      "Smallest number of people n such that the probability of at least one shared birthday reaches target_prob, with days equally likely birthdays:\n\nP(n) = 1 - product from i = 0 to n - 1 of (1 - i / days).\n\nReturn 0 for days <= 0 or target_prob outside (0, 1].",
    starterCode: `def birthday_threshold(days, target_prob):
    # Your code here
    pass`,
    solution: `def birthday_threshold(days, target_prob):
    if days <= 0 or target_prob <= 0:
        return 0
    if target_prob > 1:
        return 0
    p = 0.0
    n = 1
    while n <= days:
        p = 1.0 - (1.0 - p) * (1.0 - (n - 1) / days)
        if p >= target_prob:
            return n
        n += 1
    return days + 1`,
    testCases: [
      { input: [365, 0.5], expected: 23 },
      { input: [365, 0.99], expected: 57 },
      { input: [365, 0.01], expected: 4 },
      { input: [1, 0.5], expected: 2 },
    ],
    hint: "Grow the probability multiplicatively instead of recomputing the whole product.",
  },
  {
    id: "pr-184",
    title: "Runs Test Expectation and Variance",
    category: "Probability",
    difficulty: "Hard",
    description:
      "For a uniformly random binary sequence with n1 ones and n2 zeros, return [expected runs, variance of runs]:\n\nE[R] = 2 * n1 * n2 / (n1 + n2) + 1\nVar[R] = 2 * n1 * n2 * (2 * n1 * n2 - n1 - n2) / ((n1 + n2)^2 * (n1 + n2 - 1)).\n\nIf either count is 0, return [1.0, 0.0] for a nonempty sequence and [0.0, 0.0] for an empty one.",
    starterCode: `def runs_test_statistic(n1, n2):
    # Your code here
    pass`,
    solution: `def runs_test_statistic(n1, n2):
    if n1 < 0 or n2 < 0:
        return [0.0, 0.0]
    total = n1 + n2
    if total == 0:
        return [0.0, 0.0]
    if n1 == 0 or n2 == 0:
        return [1.0, 0.0]
    mean = 2.0 * n1 * n2 / total + 1.0
    var = 2.0 * n1 * n2 * (2.0 * n1 * n2 - total) / (total * total * (total - 1.0))
    return [mean, var]`,
    testCases: [
      { input: [5, 5], expected: [6.0, 2.2222222222222223] },
      { input: [3, 7], expected: [5.2, 1.4933333333333334] },
      { input: [1, 1], expected: [2.0, 0.0] },
      { input: [0, 5], expected: [1.0, 0.0] },
    ],
    hint: "Runs are counted by the number of value alternations plus one.",
  },
  {
    id: "pr-185",
    title: "Posterior After Two Positive Tests",
    category: "Probability",
    difficulty: "Hard",
    description:
      "Posterior probability of disease after two conditionally independent positive tests, given prevalence, sensitivities and specificities:\n\nposterior odds = prior odds * LR1 * LR2 with LR = sensitivity / (1 - specificity).\n\nReturn 1.0 when a specificity equals 1, and handle prevalences of 0 and 1 gracefully.",
    starterCode: `def two_test_posterior(prevalence, sens1, spec1, sens2, spec2):
    # Your code here
    pass`,
    solution: `def two_test_posterior(prevalence, sens1, spec1, sens2, spec2):
    if prevalence <= 0:
        return 0.0
    if prevalence >= 1:
        return 1.0
    if sens1 <= 0 or sens2 <= 0:
        return 0.0
    odds = prevalence / (1.0 - prevalence)
    for sens, spec in ((sens1, spec1), (sens2, spec2)):
        if spec >= 1.0:
            return 1.0
        odds *= sens / (1.0 - spec)
    return odds / (1.0 + odds)`,
    testCases: [
      { input: [0.01, 0.9, 0.9, 0.9, 0.9], expected: 0.4500000000000001 },
      { input: [0.001, 0.99, 0.95, 0.99, 0.95], expected: 0.28183229813664556 },
      { input: [0.5, 0.9, 0.9, 0.9, 0.9], expected: 0.9878048780487805 },
      { input: [0.01, 0.9, 1.0, 0.9, 0.9], expected: 1.0 },
    ],
    hint: "Multiplying likelihood ratios is the same as applying Bayes' rule twice.",
  },
];
