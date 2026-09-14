import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "pr-321",
    title: "Multinomial Coefficient Value",
    category: "Probability",
    difficulty: "Easy",
    description:
      "The multinomial coefficient counts ways to split n distinct items into labeled groups of sizes k1, k2, ...: n! / (k1! k2! ...).\n\nGiven n and the group sizes (which sum to n), return the coefficient.",
    starterCode: `def multinomial_coefficient_value(n, parts):
    # Your code here
    pass`,
    solution: `def multinomial_coefficient_value(n, parts):
    import math
    result = math.factorial(n)
    for k in parts:
        result //= math.factorial(k)
    return result`,
    testCases: [
      { input: [5, [2, 3]], expected: 10 },
      { input: [6, [2, 2, 2]], expected: 90 },
      { input: [4, [4]], expected: 1 },
    ],
    hint: "Divide the total permutations by the internal permutations of each group.",
  },
  {
    id: "pr-322",
    title: "Stars and Bars Count",
    category: "Probability",
    difficulty: "Easy",
    description:
      "The number of nonnegative integer solutions to x1 + ... + xk = n is C(n + k - 1, k - 1).\n\nGiven n and k >= 1, return the count.",
    starterCode: `def stars_and_bars_count(n, k):
    # Your code here
    pass`,
    solution: `def stars_and_bars_count(n, k):
    import math
    return math.comb(n + k - 1, k - 1)`,
    testCases: [
      { input: [3, 2], expected: 4 },
      { input: [5, 3], expected: 21 },
      { input: [0, 4], expected: 1 },
    ],
    hint: "Choosing positions of k - 1 separators among n + k - 1 slots.",
  },
  {
    id: "pr-323",
    title: "Stirling Second Kind Count",
    category: "Probability",
    difficulty: "Medium",
    description:
      "The Stirling number of the second kind S(n, k) counts partitions of n labeled items into k nonempty unlabeled blocks, via S(n, k) = k S(n-1, k) + S(n-1, k-1).\n\nGiven n and k, return S(n, k).",
    starterCode: `def stirling_second_kind_count(n, k):
    # Your code here
    pass`,
    solution: `def stirling_second_kind_count(n, k):
    if k > n:
        return 0
    table = [[0] * (k + 1) for _ in range(n + 1)]
    table[0][0] = 1
    for i in range(1, n + 1):
        for j in range(1, min(i, k) + 1):
            table[i][j] = j * table[i - 1][j] + table[i - 1][j - 1]
    return table[n][k]`,
    testCases: [
      { input: [4, 2], expected: 7 },
      { input: [5, 3], expected: 25 },
      { input: [3, 3], expected: 1 },
    ],
    hint: "Either join one of the existing blocks or start a new block.",
  },
  {
    id: "pr-324",
    title: "Bell Number DP Value",
    category: "Probability",
    difficulty: "Medium",
    description:
      "The Bell number B(n) counts all set partitions of n labeled items and satisfies B(n) = sum_{k=0}^{n} S(n, k) for Stirling numbers of the second kind.\n\nGiven n, return B(n).",
    starterCode: `def bell_number_dp_value(n):
    # Your code here
    pass`,
    solution: `def bell_number_dp_value(n):
    table = [[0] * (n + 1) for _ in range(n + 1)]
    table[0][0] = 1
    for i in range(1, n + 1):
        for j in range(1, i + 1):
            table[i][j] = j * table[i - 1][j] + table[i - 1][j - 1]
    return sum(table[n][j] for j in range(n + 1))`,
    testCases: [
      { input: [4], expected: 15 },
      { input: [5], expected: 52 },
      { input: [1], expected: 1 },
    ],
    hint: "Build the Stirling triangle and sum the last row.",
  },
  {
    id: "pr-325",
    title: "Derangement Probability",
    category: "Probability",
    difficulty: "Easy",
    description:
      "The probability that a uniform random permutation of n items has no fixed point is !n / n!, where !n is the derangement count with !0 = 1 and !n = (n - 1)(!(n-1) + !(n-2)).\n\nGiven n, return the probability.",
    starterCode: `def derangement_probability(n):
    # Your code here
    pass`,
    solution: `def derangement_probability(n):
    import math
    d0, d1 = 1, 0
    if n == 0:
        return 1.0
    if n == 1:
        return 0.0
    for k in range(2, n + 1):
        d0, d1 = d1, (k - 1) * (d1 + d0)
    return d1 / math.factorial(n)`,
    testCases: [
      { input: [3], expected: 0.3333333333333333 },
      { input: [4], expected: 0.375 },
      { input: [5], expected: 0.36666666666666664 },
    ],
    hint: "The probability approaches 1/e as n grows.",
  },
  {
    id: "pr-326",
    title: "Integer Partition Count DP",
    category: "Probability",
    difficulty: "Medium",
    description:
      "The partition number p(n) counts unordered sums of positive integers adding to n, computed by the coin-change style recurrence p(n) = sum over parts of p(n - part).\n\nGiven n, return p(n).",
    starterCode: `def integer_partition_count_dp(n):
    # Your code here
    pass`,
    solution: `def integer_partition_count_dp(n):
    dp = [0] * (n + 1)
    dp[0] = 1
    for part in range(1, n + 1):
        for total in range(part, n + 1):
            dp[total] += dp[total - part]
    return dp[n]`,
    testCases: [
      { input: [5], expected: 7 },
      { input: [10], expected: 42 },
      { input: [1], expected: 1 },
    ],
    hint: "Add parts one at a time to avoid double counting orders.",
  },
  {
    id: "pr-327",
    title: "Positive Composition Count",
    category: "Probability",
    difficulty: "Hard",
    description:
      "The number of compositions of n into exactly k positive ordered parts is C(n - 1, k - 1) when 1 <= k <= n.\n\nGiven n and k, return the count, or 0 when no such composition exists.",
    starterCode: `def positive_composition_count(n, k):
    # Your code here
    pass`,
    solution: `def positive_composition_count(n, k):
    import math
    if k < 1 or k > n:
        return 0
    return math.comb(n - 1, k - 1)`,
    testCases: [
      { input: [5, 2], expected: 4 },
      { input: [5, 1], expected: 1 },
      { input: [3, 4], expected: 0 },
    ],
    hint: "Place k - 1 dividers in the n - 1 gaps between units.",
  },
  {
    id: "pr-328",
    title: "Lattice Paths Count",
    category: "Probability",
    difficulty: "Easy",
    description:
      "The number of monotone lattice paths from (0, 0) to (m, n) using only right and up steps is C(m + n, m).\n\nGiven m and n, return the count.",
    starterCode: `def lattice_paths_count(m, n):
    # Your code here
    pass`,
    solution: `def lattice_paths_count(m, n):
    import math
    return math.comb(m + n, m)`,
    testCases: [
      { input: [1, 1], expected: 2 },
      { input: [2, 3], expected: 10 },
      { input: [4, 0], expected: 1 },
    ],
    hint: "Choose which of the m + n steps go right.",
  },
  {
    id: "pr-329",
    title: "Ballot Paths Never Behind",
    category: "Probability",
    difficulty: "Medium",
    description:
      "The number of monotone paths from (0, 0) to (n, n) that never go above the diagonal is the Catalan number C(2n, n) / (n + 1).\n\nGiven n, return the count.",
    starterCode: `def ballot_paths_never_behind(n):
    # Your code here
    pass`,
    solution: `def ballot_paths_never_behind(n):
    import math
    return math.comb(2 * n, n) // (n + 1)`,
    testCases: [
      { input: [1], expected: 1 },
      { input: [3], expected: 5 },
      { input: [4], expected: 14 },
    ],
    hint: "The reflection principle gives 1 / (n + 1) of all paths.",
  },
  {
    id: "pr-330",
    title: "Circular Seating Arrangements",
    category: "Probability",
    difficulty: "Medium",
    description:
      "The number of distinct circular arrangements of n distinct people is (n - 1)! because rotations are identified.\n\nGiven n >= 1, return the count; return 0 for n = 0.",
    starterCode: `def circular_seating_arrangements(n):
    # Your code here
    pass`,
    solution: `def circular_seating_arrangements(n):
    import math
    if n == 0:
        return 0
    return math.factorial(n - 1)`,
    testCases: [
      { input: [1], expected: 1 },
      { input: [4], expected: 6 },
      { input: [5], expected: 24 },
    ],
    hint: "Fix one person to break rotational symmetry.",
  },
  {
    id: "pr-331",
    title: "Permutations with Repetition",
    category: "Probability",
    difficulty: "Easy",
    description:
      "The number of length-k sequences drawn from n distinct symbols with repetition allowed is n^k.\n\nGiven n and k, return the count.",
    starterCode: `def permutations_with_repetition(n, k):
    # Your code here
    pass`,
    solution: `def permutations_with_repetition(n, k):
    return n ** k`,
    testCases: [
      { input: [2, 3], expected: 8 },
      { input: [10, 0], expected: 1 },
      { input: [4, 2], expected: 16 },
    ],
    hint: "Each position has n independent choices.",
  },
  {
    id: "pr-332",
    title: "Bounded Solution Count Inclusion Exclusion",
    category: "Probability",
    difficulty: "Hard",
    description:
      "Count the nonnegative integer solutions to x1 + ... + xk = n with 0 <= xi <= c_i using inclusion-exclusion over subsets S: sum (\u22121)^|S| C(n - sum_{S}(c_i + 1) + k - 1, k - 1).\n\nGiven n, the number of variables k, and the bound list, return the count. Terms with a negative argument contribute zero.",
    starterCode: `def bounded_solution_count_inclusion_exclusion(n, k, bounds):
    # Your code here
    pass`,
    solution: `def bounded_solution_count_inclusion_exclusion(n, k, bounds):
    import math
    from itertools import combinations
    total = 0
    for size in range(0, k + 1):
        for subset in combinations(range(k), size):
            shifted = n - sum(bounds[i] + 1 for i in subset)
            if shifted < 0:
                continue
            term = math.comb(shifted + k - 1, k - 1)
            total += term if size % 2 == 0 else -term
    return total`,
    testCases: [
      { input: [5, 3, [3, 3, 3]], expected: 12 },
      { input: [2, 2, [1, 1]], expected: 1 },
      { input: [0, 2, [1, 1]], expected: 1 },
    ],
    hint: "Over-subtract for one violated bound, then add back pairs.",
  },
  {
    id: "pr-333",
    title: "No Shared Birthday Probability",
    category: "Probability",
    difficulty: "Medium",
    description:
      "The probability that n people all have distinct birthdays among d equally likely days is prod_{i=0}^{n-1} (d - i) / d.\n\nGiven n and d (default 365), return the probability; return 0.0 when n > d.",
    starterCode: `def no_shared_birthday_probability(n, days=365):
    # Your code here
    pass`,
    solution: `def no_shared_birthday_probability(n, days=365):
    if n > days:
        return 0.0
    prob = 1.0
    for i in range(n):
        prob *= (days - i) / days
    return prob`,
    testCases: [
      { input: [3, 365], expected: 0.9917958341152187 },
      { input: [2, 4], expected: 0.75 },
      { input: [5, 3], expected: 0.0 },
    ],
    hint: "Multiply the conditional probabilities of avoiding each previous birthday.",
  },
  {
    id: "pr-334",
    title: "Committee Selection Probability",
    category: "Probability",
    difficulty: "Easy",
    description:
      "For a population with `good` acceptable members and `bad` others, the probability that a random committee of size k contains exactly g acceptable members is C(good, g) C(bad, k - g) / C(total, k).\n\nGiven total, good, k, and g, return the probability. Return 0.0 when the combination is impossible.",
    starterCode: `def committee_selection_probability(total, good, k, selected_good):
    # Your code here
    pass`,
    solution: `def committee_selection_probability(total, good, k, selected_good):
    import math
    bad = total - good
    if selected_good > good or k - selected_good > bad or selected_good > k:
        return 0.0
    return math.comb(good, selected_good) * math.comb(bad, k - selected_good) / math.comb(total, k)`,
    testCases: [
      { input: [10, 6, 3, 2], expected: 0.5 },
      { input: [10, 6, 3, 0], expected: 0.03333333333333333 },
      { input: [5, 2, 6, 1], expected: 0.0 },
    ],
    hint: "Multiply the two independent choices and divide by all committees.",
  },
  {
    id: "pr-335",
    title: "Expected Distinct Values in Draws",
    category: "Probability",
    difficulty: "Medium",
    description:
      "When k draws with replacement come from m equally likely values, the expected number of distinct values seen is m * (1 - (1 - 1/m)^k).\n\nGiven m >= 1 and k >= 0, return the expectation.",
    starterCode: `def expected_distinct_values_in_draws(m, k):
    # Your code here
    pass`,
    solution: `def expected_distinct_values_in_draws(m, k):
    return m * (1.0 - (1.0 - 1.0 / m) ** k)`,
    testCases: [
      { input: [6, 3], expected: 2.527777777777777 },
      { input: [2, 1], expected: 1.0 },
      { input: [10, 200], expected: 9.999999992944922 },
    ],
    hint: "Linearity of expectation over indicator variables for each value.",
  },
  {
    id: "pr-336",
    title: "At Least One Fixed Point Probability",
    category: "Probability",
    difficulty: "Hard",
    description:
      "The probability that a uniform random permutation of n items has at least one fixed point is 1 - !n / n! with derangement recurrence !0 = 1, !1 = 0, !n = (n - 1)(!(n-1) + !(n-2)).\n\nGiven n >= 1, return the probability.",
    starterCode: `def at_least_one_fixed_point_probability(n):
    # Your code here
    pass`,
    solution: `def at_least_one_fixed_point_probability(n):
    import math
    d0, d1 = 1, 0
    if n == 1:
        return 1.0
    for k in range(2, n + 1):
        d0, d1 = d1, (k - 1) * (d1 + d0)
    return 1.0 - d1 / math.factorial(n)`,
    testCases: [
      { input: [1], expected: 1.0 },
      { input: [4], expected: 0.625 },
      { input: [6], expected: 0.6319444444444444 },
    ],
    hint: "Complement of the probability of a derangement.",
  },
  {
    id: "pr-337",
    title: "Inclusion Exclusion Union Probability",
    category: "Probability",
    difficulty: "Medium",
    description:
      "For three events, P(A or B or C) = (sum of single probabilities) - (sum of pairwise intersection probabilities) + P(A and B and C).\n\nGiven the three single probabilities, the three pairwise probabilities, and the triple probability, return the union probability.",
    starterCode: `def inclusion_exclusion_union_probability(singles, pairs, triple):
    # Your code here
    pass`,
    solution: `def inclusion_exclusion_union_probability(singles, pairs, triple):
    return sum(singles) - sum(pairs) + triple`,
    testCases: [
      { input: [[0.5, 0.4, 0.3], [0.2, 0.15, 0.1], 0.05], expected: 0.8 },
      { input: [[0.1, 0.1, 0.1], [0.0, 0.0, 0.0], 0.0], expected: 0.30000000000000004 },
      { input: [[0.9, 0.8, 0.7], [0.7, 0.6, 0.6], 0.5], expected: 1.0 },
    ],
    hint: "Alternate signs starting with plus.",
  },
  {
    id: "pr-338",
    title: "No Event Occurs Probability",
    category: "Probability",
    difficulty: "Easy",
    description:
      "For independent events with probabilities p_i, the probability that none occurs is prod_i (1 - p_i).\n\nGiven the probability list, return P(none).",
    starterCode: `def no_event_occurs_probability(probs):
    # Your code here
    pass`,
    solution: `def no_event_occurs_probability(probs):
    result = 1.0
    for p in probs:
        result *= 1.0 - p
    return result`,
    testCases: [
      { input: [[0.1, 0.2]], expected: 0.7200000000000001 },
      { input: [[0.5, 0.5]], expected: 0.25 },
      { input: [[0.0, 0.9]], expected: 0.09999999999999998 },
    ],
    hint: "Independence turns the intersection into a product.",
  },
  {
    id: "pr-339",
    title: "At Least One Success Independent Trials",
    category: "Probability",
    difficulty: "Medium",
    description:
      "In n independent Bernoulli trials with success probability p, the probability of at least one success is 1 - (1 - p)^n.\n\nGiven p and n >= 0, return the probability.",
    starterCode: `def at_least_one_success_independent_trials(p, n):
    # Your code here
    pass`,
    solution: `def at_least_one_success_independent_trials(p, n):
    return 1.0 - (1.0 - p) ** n`,
    testCases: [
      { input: [0.5, 3], expected: 0.875 },
      { input: [0.1, 10], expected: 0.6513215599 },
      { input: [0.0, 100], expected: 0.0 },
    ],
    hint: "Complement the all-failure probability.",
  },
  {
    id: "pr-340",
    title: "Maximum of Two Dice Distribution",
    category: "Probability",
    difficulty: "Hard",
    description:
      "For two independent fair d-sided dice, P(max = k) = (2k - 1) / d^2.\n\nGiven d, return the list of probabilities for k = 1..d.",
    starterCode: `def maximum_of_two_dice_distribution(d):
    # Your code here
    pass`,
    solution: `def maximum_of_two_dice_distribution(d):
    return [(2 * k - 1) / (d * d) for k in range(1, d + 1)]`,
    testCases: [
      { input: [2], expected: [0.25, 0.75] },
      { input: [4], expected: [0.0625, 0.1875, 0.3125, 0.4375] },
      { input: [6], expected: [0.027777777777777776, 0.08333333333333333, 0.1388888888888889, 0.19444444444444445, 0.25, 0.3055555555555556] },
    ],
    hint: "Count pairs with both dice at most k minus both at most k - 1.",
  },
];
