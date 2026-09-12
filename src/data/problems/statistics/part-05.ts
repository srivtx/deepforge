import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "st-141",
    title: "Item Difficulty Index",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the item difficulty index correct/n, the proportion of examinees answering correctly. Return 0.0 when n <= 0.",
    starterCode: `def item_difficulty_index(correct, n):
    # Your code here
    pass`,
    solution: `def item_difficulty_index(correct, n):
    if n <= 0:
        return 0.0
    return correct / n`,
    testCases: [
      { input: [15, 20], expected: 0.75 },
      { input: [0, 10], expected: 0.0 },
      { input: [20, 20], expected: 1.0 },
      { input: [5, 0], expected: 0.0 },
      { input: [1, 3], expected: 0.3333333333333333 },
    ],
    hint: "This p-value is the classical item facility index.",
  },
  {
    id: "st-142",
    title: "Stanine Conversion",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Convert a z-score to a stanine with round(5 + 2*z), clamping the result to the 1-9 range. Rounding happens before clamping.",
    starterCode: `def stanine(z):
    # Your code here
    pass`,
    solution: `def stanine(z):
    s = int(round(5.0 + 2.0 * z))
    if s < 1:
        return 1
    if s > 9:
        return 9
    return s`,
    testCases: [
      { input: [0.0], expected: 5 },
      { input: [1.2], expected: 7 },
      { input: [-1.3], expected: 2 },
      { input: [2.5], expected: 9 },
      { input: [-3.0], expected: 1 },
    ],
    hint: "Stanines are a nine-point standard scale with mean 5 and step 2.",
  },
  {
    id: "st-143",
    title: "Percentile Rank",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the mid-rank percentile of value within scores: 100 * (count(scores < value) + 0.5 * count(scores == value)) / n. Half of the tied scores count as below, so the maximum of a distribution with ties does not automatically score 100. Return 0.0 for empty input.",
    starterCode: `def percentile_rank(scores, value):
    # Your code here
    pass`,
    solution: `def percentile_rank(scores, value):
    n = len(scores)
    if n == 0:
        return 0.0
    below = sum(1 for v in scores if v < value)
    equal = sum(1 for v in scores if v == value)
    return 100.0 * (below + 0.5 * equal) / n`,
    testCases: [
      { input: [[1, 2, 3, 4], 2.5], expected: 50.0 },
      { input: [[1, 2, 2, 3], 2], expected: 50.0 },
      { input: [[1, 2, 3, 4], 4], expected: 87.5 },
      { input: [[5, 5, 5], 5], expected: 50.0 },
      { input: [[1, 2, 3, 4], 0], expected: 0.0 },
    ],
    hint: "The mid-rank convention gives tied scores half credit.",
  },
  {
    id: "st-144",
    title: "T-Score Conversion",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the T-score 50 + 10*(raw - mean)/sd, a standard score with mean 50 and standard deviation 10. Return 0.0 when sd <= 0.",
    starterCode: `def t_score(raw, mean, sd):
    # Your code here
    pass`,
    solution: `def t_score(raw, mean, sd):
    if sd <= 0:
        return 0.0
    return 50.0 + 10.0 * (raw - mean) / sd`,
    testCases: [
      { input: [60, 50, 10], expected: 60.0 },
      { input: [30, 50, 10], expected: 30.0 },
      { input: [50, 50, 10], expected: 50.0 },
      { input: [75, 50, 15], expected: 66.66666666666667 },
      { input: [10, 50, 0], expected: 0.0 },
    ],
    hint: "It is the z-score linearly rescaled.",
  },
  {
    id: "st-145",
    title: "Deviation IQ",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the deviation IQ 100 + 15*(raw - mean)/sd, a standard score with mean 100 and standard deviation 15. Return 0.0 when sd <= 0.",
    starterCode: `def deviation_iq(raw, mean, sd):
    # Your code here
    pass`,
    solution: `def deviation_iq(raw, mean, sd):
    if sd <= 0:
        return 0.0
    return 100.0 + 15.0 * (raw - mean) / sd`,
    testCases: [
      { input: [115, 100, 15], expected: 115.0 },
      { input: [85, 100, 15], expected: 85.0 },
      { input: [100, 100, 15], expected: 100.0 },
      { input: [60, 50, 10], expected: 115.0 },
      { input: [10, 100, 0], expected: 0.0 },
    ],
    hint: "It is the z-score linearly rescaled.",
  },
  {
    id: "st-146",
    title: "Growth Percentile",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the percentile of a normally distributed score: 100 * Phi((score - mean)/sd). Return 0.0 when sd <= 0.",
    starterCode: `import math
def growth_percentile(score, mean, sd):
    # Your code here
    pass`,
    solution: `import math
def growth_percentile(score, mean, sd):
    if sd <= 0:
        return 0.0
    z = (score - mean) / sd
    return 100.0 * 0.5 * (1.0 + math.erf(z / (2 ** 0.5)))`,
    testCases: [
      { input: [100, 100, 15], expected: 50.0 },
      { input: [115, 100, 15], expected: 84.1344746068543 },
      { input: [85, 100, 15], expected: 15.865525393145708 },
      { input: [130, 100, 15], expected: 97.72498680518208 },
      { input: [100, 100, 0], expected: 0.0 },
    ],
    hint: "Use the normal CDF through math.erf.",
  },
  {
    id: "st-147",
    title: "Cohen's d",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return Cohen's d = (mean_x - mean_y) / sp with pooled standard deviation sp = sqrt(((n1-1)s1^2 + (n2-1)s2^2)/(n1+n2-2)). Return 0.0 when either sample has fewer than two values or the pooled variance is zero.",
    starterCode: `def cohens_d(x, y):
    # Your code here
    pass`,
    solution: `def cohens_d(x, y):
    n1 = len(x)
    n2 = len(y)
    if n1 < 2 or n2 < 2:
        return 0.0
    m1 = sum(x) / n1
    m2 = sum(y) / n2
    ss1 = sum((v - m1) ** 2 for v in x)
    ss2 = sum((v - m2) ** 2 for v in y)
    sp2 = (ss1 + ss2) / (n1 + n2 - 2)
    if sp2 <= 0:
        return 0.0
    return (m1 - m2) / (sp2 ** 0.5)`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], [2, 4, 6, 8, 10]], expected: -1.2 },
      { input: [[1, 2, 3], [4, 5, 6]], expected: -3.0 },
      { input: [[1, 1, 1], [2, 2, 2]], expected: 0.0 },
      { input: [[10, 12, 14], [9, 11, 13]], expected: 0.5 },
      { input: [[1], [2, 3]], expected: 0.0 },
    ],
    hint: "Standardized mean difference with a pooled within-group standard deviation.",
  },
  {
    id: "st-148",
    title: "Glass's Delta",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return Glass's delta (mean_x - mean_y) / s_y, standardizing by the sample standard deviation of the second group only. Return 0.0 when x is empty, y has fewer than two values, or s_y is zero.",
    starterCode: `def glass_delta(x, y):
    # Your code here
    pass`,
    solution: `def glass_delta(x, y):
    n1 = len(x)
    n2 = len(y)
    if n1 == 0 or n2 < 2:
        return 0.0
    m1 = sum(x) / n1
    m2 = sum(y) / n2
    s2 = (sum((v - m2) ** 2 for v in y) / (n2 - 1)) ** 0.5
    if s2 == 0:
        return 0.0
    return (m1 - m2) / s2`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], [2, 4, 6, 8, 10]], expected: -0.9486832980505138 },
      { input: [[10, 12, 14], [9, 11, 13]], expected: 0.5 },
      { input: [[1, 1, 1], [2, 2, 2]], expected: 0.0 },
      { input: [[5, 5], [3, 4]], expected: 2.1213203435596424 },
      { input: [[1], [2, 3]], expected: -2.1213203435596424 },
    ],
    hint: "Using the control SD avoids contamination by the treatment.",
  },
  {
    id: "st-149",
    title: "Odds Ratio to d",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Convert an odds ratio to a standardized mean difference with d = ln(OR) * sqrt(3) / pi. Return 0.0 when the odds ratio is not positive.",
    starterCode: `import math
def odds_ratio_to_d(odds_ratio):
    # Your code here
    pass`,
    solution: `import math
def odds_ratio_to_d(odds_ratio):
    if odds_ratio <= 0:
        return 0.0
    return math.log(odds_ratio) * (3.0 ** 0.5) / math.pi`,
    testCases: [
      { input: [1.0], expected: 0.0 },
      { input: [2.25], expected: 0.4470892603707035 },
      { input: [0.5], expected: -0.3821520694228441 },
      { input: [10.0], expected: 1.2694816959350916 },
      { input: [0.0], expected: 0.0 },
    ],
    hint: "The logit scale converts to the d scale by sqrt(3)/pi.",
  },
  {
    id: "st-150",
    title: "AUC to d",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Convert the probit of an AUC (z = Phi^-1(AUC)) to a standardized mean difference with d = sqrt(2) * z. Return 0.0 when z is zero.",
    starterCode: `def auc_to_d(z_auc):
    # Your code here
    pass`,
    solution: `def auc_to_d(z_auc):
    return (2.0 ** 0.5) * z_auc`,
    testCases: [
      { input: [0.0], expected: 0.0 },
      { input: [1.0], expected: 1.4142135623730951 },
      { input: [-0.5], expected: -0.7071067811865476 },
      { input: [1.645], expected: 2.3263813101037414 },
      { input: [2.0], expected: 2.8284271247461903 },
    ],
    hint: "The ROC curve implies d = sqrt(2) times the probit.",
  },
  {
    id: "st-151",
    title: "Point-Biserial Correlation",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the point-biserial correlation between continuous scores and a 0/1 group indicator: (mean_1 - mean_0)/s * sqrt(p*q), where s is the population standard deviation of scores. Return 0.0 when a group is missing, the lengths differ, or all scores are equal.",
    starterCode: `def point_biserial(scores, groups):
    # Your code here
    pass`,
    solution: `def point_biserial(scores, groups):
    n = len(scores)
    if n == 0 or len(groups) != n:
        return 0.0
    g1 = [scores[i] for i in range(n) if groups[i] == 1]
    g0 = [scores[i] for i in range(n) if groups[i] == 0]
    if not g1 or not g0:
        return 0.0
    m = sum(scores) / n
    s = (sum((v - m) ** 2 for v in scores) / n) ** 0.5
    if s == 0:
        return 0.0
    p = len(g1) / n
    q = 1.0 - p
    return (sum(g1) / len(g1) - sum(g0) / len(g0)) / s * (p * q) ** 0.5`,
    testCases: [
      { input: [[1, 2, 3, 4], [0, 0, 1, 1]], expected: 0.8944271909999159 },
      { input: [[5, 4, 3, 2], [1, 0, 1, 0]], expected: 0.4472135954999579 },
      { input: [[1, 1, 2, 2], [1, 1, 0, 0]], expected: -1.0 },
      { input: [[1, 2], [1, 1]], expected: 0.0 },
      { input: [[2, 2, 2], [1, 1, 0]], expected: 0.0 },
    ],
    hint: "It is the Pearson correlation with a binary variable.",
  },
  {
    id: "st-152",
    title: "Phi Coefficient",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the phi coefficient for a 2x2 table: (a*d - b*c) / sqrt((a+b)(c+d)(a+c)(b+d)). Return 0.0 when any margin is zero.",
    starterCode: `def phi_coefficient(a, b, c, d):
    # Your code here
    pass`,
    solution: `def phi_coefficient(a, b, c, d):
    denom = ((a + b) * (c + d) * (a + c) * (b + d)) ** 0.5
    if denom == 0:
        return 0.0
    return (a * d - b * c) / denom`,
    testCases: [
      { input: [10, 20, 30, 40], expected: -0.0890870806374748 },
      { input: [10, 0, 0, 10], expected: 1.0 },
      { input: [5, 5, 5, 5], expected: 0.0 },
      { input: [1, 2, 3, 4], expected: -0.0890870806374748 },
      { input: [0, 0, 0, 0], expected: 0.0 },
    ],
    hint: "Phi is the Pearson correlation between two binary variables.",
  },
  {
    id: "st-153",
    title: "Yule's Q",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return Yule's Q = (a*d - b*c) / (a*d + b*c) for a 2x2 table. Return 0.0 when the denominator is zero.",
    starterCode: `def yules_q(a, b, c, d):
    # Your code here
    pass`,
    solution: `def yules_q(a, b, c, d):
    num = a * d - b * c
    denom = a * d + b * c
    if denom == 0:
        return 0.0
    return num / denom`,
    testCases: [
      { input: [10, 20, 30, 40], expected: -0.2 },
      { input: [10, 0, 0, 10], expected: 1.0 },
      { input: [5, 5, 5, 5], expected: 0.0 },
      { input: [1, 2, 3, 4], expected: -0.2 },
      { input: [1, 0, 1, 0], expected: 0.0 },
    ],
    hint: "Q is a symmetric measure of 2x2 association ranging from -1 to 1.",
  },
  {
    id: "st-154",
    title: "Spearman Footrule",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the Spearman footrule distance sum(abs(rank_a_i - rank_b_i)) between two rank vectors. Return 0.0 for empty input or mismatched lengths.",
    starterCode: `def spearman_footrule(rank_a, rank_b):
    # Your code here
    pass`,
    solution: `def spearman_footrule(rank_a, rank_b):
    if not rank_a or len(rank_a) != len(rank_b):
        return 0.0
    return sum(abs(a - b) for a, b in zip(rank_a, rank_b))`,
    testCases: [
      { input: [[1, 2, 3], [1, 2, 3]], expected: 0 },
      { input: [[1, 2, 3], [3, 2, 1]], expected: 4 },
      { input: [[1, 2, 3, 4], [2, 1, 4, 3]], expected: 4 },
      { input: [[1], [2]], expected: 1 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "It is the L1 distance between rankings.",
  },
  {
    id: "st-155",
    title: "Standard Error of Measurement",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the standard error of measurement sd * sqrt(1 - reliability). Return 0.0 when sd <= 0 or reliability is outside [0, 1].",
    starterCode: `def sem_measurement(sd, reliability):
    # Your code here
    pass`,
    solution: `def sem_measurement(sd, reliability):
    if sd <= 0 or reliability < 0 or reliability > 1:
        return 0.0
    return sd * ((1.0 - reliability) ** 0.5)`,
    testCases: [
      { input: [15, 0.91], expected: 4.499999999999999 },
      { input: [10, 0.75], expected: 5.0 },
      { input: [15, 1.0], expected: 0.0 },
      { input: [15, 0.0], expected: 15.0 },
      { input: [10, 1.2], expected: 0.0 },
    ],
    hint: "Unreliability inflates the spread of measurement error.",
  },
  {
    id: "st-156",
    title: "MDC95",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the 95 percent minimal detectable change 1.96 * sqrt(2) * sd * sqrt(1 - reliability). Return 0.0 when sd <= 0 or reliability is outside [0, 1].",
    starterCode: `def mdc95(sd, reliability):
    # Your code here
    pass`,
    solution: `def mdc95(sd, reliability):
    if sd <= 0 or reliability < 0 or reliability > 1:
        return 0.0
    return 1.96 * (2.0 ** 0.5) * sd * ((1.0 - reliability) ** 0.5)`,
    testCases: [
      { input: [10, 0.75], expected: 13.85929291125633 },
      { input: [15, 0.91], expected: 12.473363620130694 },
      { input: [10, 1.0], expected: 0.0 },
      { input: [10, 0.0], expected: 27.71858582251266 },
      { input: [0, 0.5], expected: 0.0 },
    ],
    hint: "It equals 1.96 * sqrt(2) times the standard error of measurement.",
  },
  {
    id: "st-157",
    title: "Cronbach's Alpha",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return Cronbach's alpha (k/(k-1)) * (1 - sum(item variances)/total variance) for a list of items, where each item is a list of subject scores and variances are population variances. Return 0.0 when there are fewer than two items, lengths are inconsistent, or the total variance is zero.",
    starterCode: `def cronbach_alpha(items):
    # Your code here
    pass`,
    solution: `def cronbach_alpha(items):
    k = len(items)
    if k < 2:
        return 0.0
    n = len(items[0])
    if n == 0 or any(len(it) != n for it in items):
        return 0.0
    item_vars = []
    for it in items:
        m = sum(it) / n
        item_vars.append(sum((v - m) ** 2 for v in it) / n)
    totals = [sum(items[j][i] for j in range(k)) for i in range(n)]
    mt = sum(totals) / n
    total_var = sum((t - mt) ** 2 for t in totals) / n
    if total_var == 0:
        return 0.0
    return (k / (k - 1.0)) * (1.0 - sum(item_vars) / total_var)`,
    testCases: [
      { input: [[[1, 2, 3, 4], [1, 2, 3, 4]]], expected: 1.0 },
      { input: [[[1, 2, 3, 4], [4, 3, 2, 1]]], expected: 0.0 },
      { input: [[[1, 1, 2, 3], [2, 1, 2, 3]]], expected: 0.9142857142857144 },
      { input: [[[5, 5], [5, 5]]], expected: 0.0 },
      { input: [[[1, 2], [1, 2, 3]]], expected: 0.0 },
    ],
    hint: "Internal consistency grows with the average inter-item covariance.",
  },
  {
    id: "st-158",
    title: "Split-Half Reliability",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Split the items into odd-indexed and even-indexed halves, sum each half per subject, and return the Pearson correlation between the two half-test totals using population moments. Return 0.0 when there are fewer than two items, lengths are inconsistent, or either half has zero variance.",
    starterCode: `def split_half_reliability(items):
    # Your code here
    pass`,
    solution: `def split_half_reliability(items):
    k = len(items)
    if k < 2:
        return 0.0
    n = len(items[0])
    if n == 0 or any(len(it) != n for it in items):
        return 0.0
    first = [0.0] * n
    second = [0.0] * n
    for j in range(k):
        target = first if j % 2 == 0 else second
        for i in range(n):
            target[i] += items[j][i]
    m1 = sum(first) / n
    m2 = sum(second) / n
    s1 = sum((v - m1) ** 2 for v in first) / n
    s2 = sum((v - m2) ** 2 for v in second) / n
    if s1 == 0 or s2 == 0:
        return 0.0
    cov = sum((first[i] - m1) * (second[i] - m2) for i in range(n)) / n
    return cov / ((s1 * s2) ** 0.5)`,
    testCases: [
      { input: [[[1, 2, 3, 4], [2, 4, 6, 8], [1, 2, 3, 4], [2, 4, 6, 8]]], expected: 1.0 },
      { input: [[[1, 2, 3, 4], [4, 3, 2, 1], [1, 2, 3, 4], [4, 3, 2, 1]]], expected: -1.0 },
      { input: [[[5, 5], [5, 5]]], expected: 0.0 },
      { input: [[[1, 2, 3]]], expected: 0.0 },
      { input: [[[1, 2], [1, 2, 3]]], expected: 0.0 },
    ],
    hint: "This is the uncorrected split-half correlation; apply Spearman-Brown to lengthen it back.",
  },
  {
    id: "st-159",
    title: "Spearman-Brown Prophecy",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the Spearman-Brown prophecy value k*r / (1 + (k-1)*r) for a test lengthened k times, where r is the current reliability. Return 0.0 when r is not in (-1, 1) or k < 1.",
    starterCode: `def spearman_brown(r, k):
    # Your code here
    pass`,
    solution: `def spearman_brown(r, k):
    if r <= -1 or r >= 1 or k < 1:
        return 0.0
    denom = 1.0 + (k - 1) * r
    if denom == 0:
        return 0.0
    return k * r / denom`,
    testCases: [
      { input: [0.5, 2], expected: 0.6666666666666666 },
      { input: [0.6, 2], expected: 0.7499999999999999 },
      { input: [0.4, 3], expected: 0.6666666666666667 },
      { input: [0.5, 1], expected: 0.5 },
      { input: [-2, 2], expected: 0.0 },
    ],
    hint: "Reliability rises with test length but with diminishing returns.",
  },
  {
    id: "st-160",
    title: "Item-Total Correlation",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the corrected item-total correlation: the Pearson correlation between the item scores and the total minus the item. Return 0.0 when there are fewer than two responses, lengths differ, or either vector is constant.",
    starterCode: `def item_total_correlation(item, total):
    # Your code here
    pass`,
    solution: `def item_total_correlation(item, total):
    n = len(item)
    if n < 2 or len(total) != n:
        return 0.0
    rest = [total[i] - item[i] for i in range(n)]
    mi = sum(item) / n
    mr = sum(rest) / n
    di = sum((v - mi) ** 2 for v in item)
    dr = sum((v - mr) ** 2 for v in rest)
    if di == 0 or dr == 0:
        return 0.0
    cov = sum((item[i] - mi) * (rest[i] - mr) for i in range(n))
    return cov / ((di * dr) ** 0.5)`,
    testCases: [
      { input: [[1, 2, 3, 4], [3, 5, 7, 9]], expected: 1.0 },
      { input: [[4, 3, 2, 1], [5, 5, 5, 5]], expected: -1.0 },
      { input: [[1, 1, 2, 2], [2, 2, 4, 4]], expected: 1.0 },
      { input: [[2, 2, 2], [3, 4, 5]], expected: 0.0 },
      { input: [[1, 2], [3]], expected: 0.0 },
    ],
    hint: "Removing the item from the total prevents part-whole inflation.",
  },
  {
    id: "st-161",
    title: "Item Discrimination",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the discrimination index: the proportion answering the item correctly in the top n_each examinees by total score minus that proportion in the bottom n_each. Return 0.0 when n_each <= 0, 2*n_each exceeds n, or lengths differ.",
    starterCode: `def item_discrimination(item_scores, total_scores, n_each):
    # Your code here
    pass`,
    solution: `def item_discrimination(item_scores, total_scores, n_each):
    n = len(item_scores)
    if n == 0 or len(total_scores) != n or n_each <= 0 or 2 * n_each > n:
        return 0.0
    order = sorted(range(n), key=lambda i: total_scores[i], reverse=True)
    upper = order[:n_each]
    lower = order[n - n_each:]
    pu = sum(item_scores[i] for i in upper) / n_each
    pl = sum(item_scores[i] for i in lower) / n_each
    return pu - pl`,
    testCases: [
      { input: [[1, 1, 1, 0, 0, 0], [6, 5, 4, 3, 2, 1], 2], expected: 1.0 },
      { input: [[0, 0, 0, 1, 1, 1], [6, 5, 4, 3, 2, 1], 2], expected: -1.0 },
      { input: [[1, 0, 1, 0, 1, 0], [5, 4, 3, 2, 1, 0], 2], expected: 0.0 },
      { input: [[1, 1, 1, 1], [1, 2, 3, 4], 1], expected: 0.0 },
      { input: [[1, 0], [1, 2], 2], expected: 0.0 },
    ],
    hint: "High-achieving examinees should get the item right more often.",
  },
  {
    id: "st-162",
    title: "IRT 1PL Probability",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the one-parameter logistic probability 1/(1 + exp(-(theta - b))).",
    starterCode: `import math
def irt_1pl_probability(theta, b):
    # Your code here
    pass`,
    solution: `import math
def irt_1pl_probability(theta, b):
    return 1.0 / (1.0 + math.exp(-(theta - b)))`,
    testCases: [
      { input: [0, 0], expected: 0.5 },
      { input: [1, 0], expected: 0.7310585786300049 },
      { input: [0, 1], expected: 0.2689414213699951 },
      { input: [2, -1], expected: 0.9525741268224334 },
      { input: [-5, 5], expected: 4.5397868702434395e-05 },
    ],
    hint: "The 1PL is the Rasch model with a single difficulty parameter.",
  },
  {
    id: "st-163",
    title: "IRT 2PL Probability",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the two-parameter logistic probability 1/(1 + exp(-a*(theta - b))).",
    starterCode: `import math
def irt_2pl_probability(theta, a, b):
    # Your code here
    pass`,
    solution: `import math
def irt_2pl_probability(theta, a, b):
    return 1.0 / (1.0 + math.exp(-a * (theta - b)))`,
    testCases: [
      { input: [0, 1, 0], expected: 0.5 },
      { input: [1, 1.5, 0], expected: 0.8175744761936437 },
      { input: [0, 0.5, 1], expected: 0.3775406687981454 },
      { input: [2, 1, -1], expected: 0.9525741268224334 },
      { input: [0, 2, 0], expected: 0.5 },
    ],
    hint: "The slope a is the item discrimination.",
  },
  {
    id: "st-164",
    title: "IRT Item Information",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the item information a^2 * P * (1 - P) at theta, where P is the 2PL probability.",
    starterCode: `import math
def irt_information(theta, a, b):
    # Your code here
    pass`,
    solution: `import math
def irt_information(theta, a, b):
    p = 1.0 / (1.0 + math.exp(-a * (theta - b)))
    return a * a * p * (1.0 - p)`,
    testCases: [
      { input: [0, 1, 0], expected: 0.25 },
      { input: [0, 1.5, 0], expected: 0.5625 },
      { input: [1, 1, 0], expected: 0.19661193324148185 },
      { input: [0, 2, 1], expected: 0.419974341614026 },
      { input: [-2, 1, -1], expected: 0.19661193324148185 },
    ],
    hint: "Information peaks where the item is most discriminating.",
  },
  {
    id: "st-165",
    title: "Test Information Total",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the sum of item informations over a list of [a, b] item parameter pairs at theta. Return 0.0 for an empty item list.",
    starterCode: `import math
def test_information_total(theta, items):
    # Your code here
    pass`,
    solution: `import math
def test_information_total(theta, items):
    total = 0.0
    for a, b in items:
        p = 1.0 / (1.0 + math.exp(-a * (theta - b)))
        total += a * a * p * (1.0 - p)
    return total`,
    testCases: [
      { input: [0, [[1, 0], [1, 1], [1, -1]]], expected: 0.6432238664829637 },
      { input: [0, []], expected: 0.0 },
      { input: [1, [[1.5, 0]]], expected: 0.3355795171582489 },
      { input: [0, [[2, 1]]], expected: 0.419974341614026 },
      { input: [2, [[1, 0], [1, 0]]], expected: 0.20998717080701323 },
    ],
    hint: "Item informations add because the items are conditionally independent.",
  },
  {
    id: "st-166",
    title: "Linear Equating (Z Method)",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the equated score mean_y + (sd_y/sd_x)*(raw - mean_x), which maps a raw score from form X onto the scale of form Y using the z-score transformation. Return 0.0 when either standard deviation is not positive.",
    starterCode: `def linear_equating(raw, mean_x, sd_x, mean_y, sd_y):
    # Your code here
    pass`,
    solution: `def linear_equating(raw, mean_x, sd_x, mean_y, sd_y):
    if sd_x <= 0 or sd_y <= 0:
        return 0.0
    return mean_y + (sd_y / sd_x) * (raw - mean_x)`,
    testCases: [
      { input: [60, 50, 10, 100, 15], expected: 115.0 },
      { input: [50, 50, 10, 100, 15], expected: 100.0 },
      { input: [40, 50, 10, 100, 15], expected: 85.0 },
      { input: [70, 60, 5, 500, 100], expected: 700.0 },
      { input: [10, 50, 0, 100, 15], expected: 0.0 },
    ],
    hint: "Match both the mean and the spread of the two forms.",
  },
  {
    id: "st-167",
    title: "Value-Added Estimate",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the class gain minus the district gain: (mean(class_post) - mean(class_pre)) - (district_post_mean - district_pre_mean). Return 0.0 when either class list is empty.",
    starterCode: `def value_added_estimate(class_pre, class_post, district_pre_mean, district_post_mean):
    # Your code here
    pass`,
    solution: `def value_added_estimate(class_pre, class_post, district_pre_mean, district_post_mean):
    if not class_pre or not class_post:
        return 0.0
    class_gain = sum(class_post) / len(class_post) - sum(class_pre) / len(class_pre)
    district_gain = district_post_mean - district_pre_mean
    return class_gain - district_gain`,
    testCases: [
      { input: [[50, 60, 70], [55, 65, 80], 55, 65], expected: -3.3333333333333286 },
      { input: [[10, 20], [15, 25], 15, 25], expected: -5.0 },
      { input: [[1, 2], [3, 4], 2, 3], expected: 1.0 },
      { input: [[100], [110], 100, 110], expected: 0.0 },
      { input: [[], [], 5, 5], expected: 0.0 },
    ],
    hint: "Subtracting the district gain adjusts for the general trend.",
  },
  {
    id: "st-168",
    title: "Hedges' g",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return Hedges' g, the small-sample corrected standardized mean difference: d * (1 - 3/(4*(n1+n2) - 9)), where d is Cohen's d with pooled variance. Return 0.0 when either sample has fewer than two values or the pooled variance is zero.",
    starterCode: `def hedges_g(x, y):
    # Your code here
    pass`,
    solution: `def hedges_g(x, y):
    n1 = len(x)
    n2 = len(y)
    if n1 < 2 or n2 < 2:
        return 0.0
    m1 = sum(x) / n1
    m2 = sum(y) / n2
    ss1 = sum((v - m1) ** 2 for v in x)
    ss2 = sum((v - m2) ** 2 for v in y)
    sp2 = (ss1 + ss2) / (n1 + n2 - 2)
    if sp2 <= 0:
        return 0.0
    d = (m1 - m2) / (sp2 ** 0.5)
    j = 1.0 - 3.0 / (4.0 * (n1 + n2) - 9.0)
    return d * j`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], [2, 4, 6, 8, 10]], expected: -1.0838709677419354 },
      { input: [[1, 2, 3], [4, 5, 6]], expected: -2.4000000000000004 },
      { input: [[1, 1, 1], [2, 2, 2]], expected: 0.0 },
      { input: [[10, 12, 14], [9, 11, 13]], expected: 0.4 },
      { input: [[1], [2, 3]], expected: 0.0 },
    ],
    hint: "The correction factor removes upward bias in small samples.",
  },
  {
    id: "st-169",
    title: "Eta Squared from t-Statistic",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the eta squared implied by a t statistic: t^2 / (t^2 + df). Return 0.0 when df <= 0.",
    starterCode: `def eta_squared_from_t(t, df):
    # Your code here
    pass`,
    solution: `def eta_squared_from_t(t, df):
    if df <= 0:
        return 0.0
    return t * t / (t * t + df)`,
    testCases: [
      { input: [2.0, 10], expected: 0.2857142857142857 },
      { input: [1.0, 5], expected: 0.16666666666666666 },
      { input: [0, 3], expected: 0.0 },
      { input: [3, 20], expected: 0.3103448275862069 },
      { input: [2, 0], expected: 0.0 },
    ],
    hint: "This converts a t-test into a proportion of explained variance.",
  },
  {
    id: "st-170",
    title: "Omega Squared",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Return omega squared (SS_between - df_between*MSW) / (SS_between + SS_within + MSW), where MSW = SS_within/df_within. Return 0.0 when df_within <= 0 or the denominator is zero. It can be negative when the effect is smaller than sampling noise.",
    starterCode: `def omega_squared(ss_between, ss_within, df_between, df_within):
    # Your code here
    pass`,
    solution: `def omega_squared(ss_between, ss_within, df_between, df_within):
    if df_within <= 0:
        return 0.0
    msw = ss_within / df_within
    num = ss_between - df_between * msw
    denom = ss_between + ss_within + msw
    if denom == 0:
        return 0.0
    return num / denom`,
    testCases: [
      { input: [54, 6, 2, 6], expected: 0.8524590163934426 },
      { input: [0, 10, 1, 8], expected: -0.1111111111111111 },
      { input: [24, 0, 1, 4], expected: 1.0 },
      { input: [2, 2, 1, 2], expected: 0.2 },
      { input: [54, 6, 2, 0], expected: 0.0 },
    ],
    hint: "Unlike eta squared, omega squared corrects for the positive bias.",
  },
  {
    id: "st-171",
    title: "Partial Eta Squared",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return partial eta squared (SS_effect/df_effect) / ((SS_effect/df_effect) + (SS_error/df_error)). Return 0.0 when a degrees-of-freedom value is not positive or the denominator is zero.",
    starterCode: `def partial_eta_squared(ss_effect, ss_error, df_effect, df_error):
    # Your code here
    pass`,
    solution: `def partial_eta_squared(ss_effect, ss_error, df_effect, df_error):
    if df_effect <= 0 or df_error <= 0:
        return 0.0
    ms_effect = ss_effect / df_effect
    ms_error = ss_error / df_error
    denom = ms_effect + ms_error
    if denom == 0:
        return 0.0
    return ms_effect / denom`,
    testCases: [
      { input: [54, 6, 2, 6], expected: 0.9642857142857143 },
      { input: [10, 20, 1, 8], expected: 0.8 },
      { input: [0, 5, 1, 4], expected: 0.0 },
      { input: [24, 0, 1, 4], expected: 1.0 },
      { input: [5, 5, 2, 0], expected: 0.0 },
    ],
    hint: "It measures the effect relative to its own error term.",
  },
  {
    id: "st-172",
    title: "Biserial Correlation",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Return the biserial correlation between continuous scores and a 0/1 group indicator: (mean_1 - mean_0)/s * (p*q)/phi(z_cut), where p is the proportion coded 1, s is the population standard deviation of scores, and phi(z_cut) is the standard normal density at the supplied z_cut. Return 0.0 when a group is missing, lengths differ, or the scores are constant.",
    starterCode: `import math
def biserial_correlation(scores, groups, z_cut):
    # Your code here
    pass`,
    solution: `import math
def biserial_correlation(scores, groups, z_cut):
    n = len(scores)
    if n == 0 or len(groups) != n:
        return 0.0
    g1 = [scores[i] for i in range(n) if groups[i] == 1]
    g0 = [scores[i] for i in range(n) if groups[i] == 0]
    if not g1 or not g0:
        return 0.0
    m = sum(scores) / n
    s = (sum((v - m) ** 2 for v in scores) / n) ** 0.5
    if s == 0:
        return 0.0
    p = len(g1) / n
    q = 1.0 - p
    ordinate = math.exp(-(z_cut ** 2) / 2.0) / ((2.0 * math.pi) ** 0.5)
    if ordinate == 0:
        return 0.0
    return (sum(g1) / len(g1) - sum(g0) / len(g0)) / s * (p * q) / ordinate`,
    testCases: [
      { input: [[1, 2, 3, 4], [0, 0, 1, 1], 0.0], expected: 1.1209982432795857 },
      { input: [[5, 4, 3, 2], [1, 0, 1, 0], 0.0], expected: 0.5604991216397929 },
      { input: [[1, 1, 2, 2], [1, 1, 0, 0], 0.0], expected: -1.2533141373155001 },
      { input: [[1, 2], [1, 1], 0.0], expected: 0.0 },
      { input: [[2, 2, 2], [1, 1, 0], 0.0], expected: 0.0 },
    ],
    hint: "The biserial correlation assumes an underlying continuous, normal variable.",
  },
  {
    id: "st-173",
    title: "Contingency Coefficient",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the Pearson contingency coefficient C = sqrt(chi2/(chi2 + n)) for a 2D table of observed counts, where chi2 uses expected counts row_total*col_total/n. Return 0.0 for an empty table, a zero total, or any zero expected count.",
    starterCode: `def contingency_coefficient(observed):
    # Your code here
    pass`,
    solution: `def contingency_coefficient(observed):
    rows = len(observed)
    if rows == 0:
        return 0.0
    cols = len(observed[0])
    if cols == 0:
        return 0.0
    total = sum(sum(row) for row in observed)
    if total == 0:
        return 0.0
    row_totals = [sum(row) for row in observed]
    col_totals = [sum(observed[i][j] for i in range(rows)) for j in range(cols)]
    chi2 = 0.0
    for i in range(rows):
        for j in range(cols):
            e = row_totals[i] * col_totals[j] / total
            if e == 0:
                return 0.0
            chi2 += (observed[i][j] - e) ** 2 / e
    return (chi2 / (chi2 + total)) ** 0.5`,
    testCases: [
      { input: [[[10, 20], [30, 40]]], expected: 0.08873565094161137 },
      { input: [[[5, 5], [5, 5]]], expected: 0.0 },
      { input: [[[10, 0], [0, 10]]], expected: 0.7071067811865476 },
      { input: [[[1, 2, 3], [3, 2, 1]]], expected: 0.3779644730092272 },
      { input: [[[10, 20, 30]]], expected: 0.0 },
    ],
    hint: "C measures association but has an upper bound below 1 that depends on table size.",
  },
  {
    id: "st-174",
    title: "Goodman-Kruskal Gamma",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return Goodman and Kruskal's gamma (P - Q)/(P + Q) for a 2D table, where P counts concordant pairs and Q discordant pairs, each cell pair weighted by its counts. Return 0.0 when there is no concordant or discordant pair.",
    starterCode: `def goodman_kruskal_gamma(observed):
    # Your code here
    pass`,
    solution: `def goodman_kruskal_gamma(observed):
    rows = len(observed)
    if rows < 2:
        return 0.0
    cols = len(observed[0])
    if cols < 2 or any(len(r) != cols for r in observed):
        return 0.0
    p = 0.0
    q = 0.0
    for i in range(rows):
        for k in range(i + 1, rows):
            for j in range(cols):
                for l in range(j + 1, cols):
                    p += observed[i][j] * observed[k][l]
                    q += observed[i][l] * observed[k][j]
    if p + q == 0:
        return 0.0
    return (p - q) / (p + q)`,
    testCases: [
      { input: [[[10, 20], [30, 40]]], expected: -0.2 },
      { input: [[[30, 10], [10, 30]]], expected: 0.8 },
      { input: [[[5, 5], [5, 5]]], expected: 0.0 },
      { input: [[[1, 2, 3], [3, 2, 1]]], expected: -0.6153846153846154 },
      { input: [[[10, 20, 30]]], expected: 0.0 },
    ],
    hint: "Gamma ignores ties entirely and ranges from -1 to 1.",
  },
  {
    id: "st-175",
    title: "Somers' D",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return Somers' D with the column variable dependent: (P - Q)/(P + Q + T_row), where P and Q count concordant and discordant pairs and T_row counts pairs sharing a row. Return 0.0 when the table is smaller than 2x2 or the denominator is zero.",
    starterCode: `def somers_d(observed):
    # Your code here
    pass`,
    solution: `def somers_d(observed):
    rows = len(observed)
    if rows < 2:
        return 0.0
    cols = len(observed[0])
    if cols < 2 or any(len(r) != cols for r in observed):
        return 0.0
    p = 0.0
    q = 0.0
    t_row = 0.0
    for i in range(rows):
        for k in range(i + 1, rows):
            for j in range(cols):
                for l in range(j + 1, cols):
                    p += observed[i][j] * observed[k][l]
                    q += observed[i][l] * observed[k][j]
    for i in range(rows):
        for j in range(cols):
            for l in range(j + 1, cols):
                t_row += observed[i][j] * observed[i][l]
    denom = p + q + t_row
    if denom == 0:
        return 0.0
    return (p - q) / denom`,
    testCases: [
      { input: [[[10, 20], [30, 40]]], expected: -0.08333333333333333 },
      { input: [[[30, 10], [10, 30]]], expected: 0.5 },
      { input: [[[5, 5], [5, 5]]], expected: 0.0 },
      { input: [[[1, 2, 3], [3, 2, 1]]], expected: -0.3333333333333333 },
      { input: [[[10, 20, 30]]], expected: 0.0 },
    ],
    hint: "Ties on the independent variable are included in the denominator.",
  },
  {
    id: "st-176",
    title: "Kendall's Tau-b",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return Kendall's tau-b (P - Q)/sqrt((P+Q+Tx)(P+Q+Ty)) with tie corrections, where Tx counts pairs tied on x only and Ty pairs tied on y only. Return 0.0 when there are fewer than two pairs or the denominator is zero.",
    starterCode: `def kendall_tau_b(x, y):
    # Your code here
    pass`,
    solution: `def kendall_tau_b(x, y):
    n = len(x)
    if n < 2 or len(y) != n:
        return 0.0
    p = 0
    q = 0
    tx = 0
    ty = 0
    for i in range(n):
        for j in range(i + 1, n):
            dx = x[i] - x[j]
            dy = y[i] - y[j]
            if dx > 0 and dy > 0:
                p += 1
            elif dx < 0 and dy < 0:
                p += 1
            elif dx > 0 and dy < 0:
                q += 1
            elif dx < 0 and dy > 0:
                q += 1
            elif dx == 0 and dy != 0:
                tx += 1
            elif dx != 0 and dy == 0:
                ty += 1
    denom = ((p + q + tx) * (p + q + ty)) ** 0.5
    if denom == 0:
        return 0.0
    return (p - q) / denom`,
    testCases: [
      { input: [[1, 2, 3], [1, 2, 3]], expected: 1.0 },
      { input: [[1, 2, 3], [3, 2, 1]], expected: -1.0 },
      { input: [[1, 2, 2, 3], [1, 2, 3, 4]], expected: 0.9128709291752769 },
      { input: [[1, 1, 2], [1, 2, 2]], expected: 0.5 },
      { input: [[1], [1]], expected: 0.0 },
    ],
    hint: "Tau-b adjusts for ties in either variable.",
  },
  {
    id: "st-177",
    title: "Cliff's Delta",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return Cliff's delta, the difference in the proportions of favorable pairwise comparisons: (#(x > y) - #(x < y))/(n1*n2). Return 0.0 if either sample is empty.",
    starterCode: `def cliffs_delta(x, y):
    # Your code here
    pass`,
    solution: `def cliffs_delta(x, y):
    n1 = len(x)
    n2 = len(y)
    if n1 == 0 or n2 == 0:
        return 0.0
    greater = 0
    less = 0
    for a in x:
        for b in y:
            if a > b:
                greater += 1
            elif a < b:
                less += 1
    return (greater - less) / (n1 * n2)`,
    testCases: [
      { input: [[1, 2, 3], [4, 5, 6]], expected: -1.0 },
      { input: [[4, 5, 6], [1, 2, 3]], expected: 1.0 },
      { input: [[1, 2, 3], [1, 2, 3]], expected: 0.0 },
      { input: [[1, 2, 3], [2, 2, 4]], expected: -0.3333333333333333 },
      { input: [[1, 2], [1, 2]], expected: 0.0 },
    ],
    hint: "It is the nonparametric effect size between -1 and 1.",
  },
  {
    id: "st-178",
    title: "Rank-Biserial Correlation",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the rank-biserial correlation 2*(mean_rank_x - mean_rank_y)/(n1+n2), using average ranks for ties in the combined sample. Return 0.0 if either sample is empty.",
    starterCode: `def rank_biserial(x, y):
    # Your code here
    pass`,
    solution: `def rank_biserial(x, y):
    n1 = len(x)
    n2 = len(y)
    if n1 == 0 or n2 == 0:
        return 0.0
    combined = average_ranks(list(x) + list(y))
    r1 = sum(combined[:n1])
    r2 = sum(combined[n1:])
    n = n1 + n2
    return 2.0 * (r1 / n1 - r2 / n2) / n

def average_ranks(vals):
    n = len(vals)
    order = sorted(range(n), key=lambda i: vals[i])
    ranks = [0.0] * n
    i = 0
    while i < n:
        j = i
        while j + 1 < n and vals[order[j + 1]] == vals[order[i]]:
            j += 1
        avg = (i + j) / 2.0 + 1.0
        for t in range(i, j + 1):
            ranks[order[t]] = avg
        i = j + 1
    return ranks`,
    testCases: [
      { input: [[1, 2, 3], [4, 5, 6]], expected: -1.0 },
      { input: [[4, 5, 6], [1, 2, 3]], expected: 1.0 },
      { input: [[1, 2, 3], [1, 2, 3]], expected: 0.0 },
      { input: [[1, 2, 3], [2, 2, 4]], expected: -0.3333333333333333 },
      { input: [[5], [5]], expected: 0.0 },
    ],
    hint: "It converts a rank comparison into a correlation-scale effect size.",
  },
  {
    id: "st-179",
    title: "Bias-Corrected Cramer's V",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Return the bias-corrected Cramer's V: sqrt(max(0, chi2/n - (r-1)(c-1)/(n-1)) / min(r-1, c-1)) for a 2D table, where chi2 uses expected counts row_total*col_total/n. Return 0.0 for tables with fewer than two rows or columns, a total of at most one, or any zero expected count.",
    starterCode: `def bias_corrected_cramers_v(observed):
    # Your code here
    pass`,
    solution: `def bias_corrected_cramers_v(observed):
    rows = len(observed)
    if rows < 2:
        return 0.0
    cols = len(observed[0])
    if cols < 2 or any(len(r) != cols for r in observed):
        return 0.0
    total = sum(sum(row) for row in observed)
    if total <= 1:
        return 0.0
    row_totals = [sum(row) for row in observed]
    col_totals = [sum(observed[i][j] for i in range(rows)) for j in range(cols)]
    chi2 = 0.0
    for i in range(rows):
        for j in range(cols):
            e = row_totals[i] * col_totals[j] / total
            if e == 0:
                return 0.0
            chi2 += (observed[i][j] - e) ** 2 / e
    correction = (rows - 1) * (cols - 1) / (total - 1)
    phi2 = chi2 / total - correction
    if phi2 < 0:
        phi2 = 0.0
    return (phi2 / min(rows - 1, cols - 1)) ** 0.5`,
    testCases: [
      { input: [[[10, 20], [30, 40]]], expected: 0.0 },
      { input: [[[10, 0], [0, 10]]], expected: 0.9733285267845753 },
      { input: [[[50, 10], [10, 50]]], expected: 0.6603340693163625 },
      { input: [[[5, 5], [5, 5]]], expected: 0.0 },
      { input: [[[10, 20, 30], [30, 20, 10]]], expected: 0.3871174808473405 },
    ],
    hint: "The correction subtracts the association expected by chance.",
  },
  {
    id: "st-180",
    title: "Kendall's W",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Return Kendall's coefficient of concordance W = 12*S/(m^2*(n^3 - n)) for m raters and n items, where S is the sum of squared deviations of item rank sums from their mean. Ratings are assumed to use complete rankings without ties. Return 0.0 when there are no raters, fewer than two items, inconsistent lengths, or a zero denominator.",
    starterCode: `def kendall_w(ratings):
    # Your code here
    pass`,
    solution: `def kendall_w(ratings):
    m = len(ratings)
    if m < 1:
        return 0.0
    n = len(ratings[0])
    if n < 2 or any(len(r) != n for r in ratings):
        return 0.0
    rank_sums = [0.0] * n
    for r in ratings:
        for j in range(n):
            rank_sums[j] += r[j]
    mr = sum(rank_sums) / n
    s = sum((v - mr) ** 2 for v in rank_sums)
    denom = (m ** 2) * (n ** 3 - n)
    if denom == 0:
        return 0.0
    return 12.0 * s / denom`,
    testCases: [
      { input: [[[1, 2, 3], [1, 2, 3]]], expected: 1.0 },
      { input: [[[1, 2, 3], [3, 2, 1]]], expected: 0.0 },
      { input: [[[1, 2, 3, 4], [2, 1, 4, 3], [1, 2, 3, 4]]], expected: 0.8222222222222222 },
      { input: [[[1, 3, 2], [1, 3, 2], [1, 3, 2]]], expected: 1.0 },
      { input: [[[1, 2], [2, 1], [1, 2]]], expected: 0.1111111111111111 },
    ],
    hint: "W is 1 for perfect agreement and 0 for no agreement.",
  },
  {
    id: "st-181",
    title: "ICC(2,1)",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Return the two-way random effects intraclass correlation ICC(2,1) for a subjects-by-raters matrix: (MSR - MSE) / (MSR + (k-1)*MSE + k*(MSC - MSE)/n), using two-way ANOVA mean squares. Return 0.0 when there are fewer than two subjects or raters, the matrix is ragged, or the denominator is zero.",
    starterCode: `def icc_2_1(matrix):
    # Your code here
    pass`,
    solution: `def icc_2_1(matrix):
    n = len(matrix)
    if n < 2:
        return 0.0
    k = len(matrix[0])
    if k < 2 or any(len(row) != k for row in matrix):
        return 0.0
    grand = sum(sum(row) for row in matrix) / (n * k)
    row_means = [sum(row) / k for row in matrix]
    col_means = [sum(matrix[i][j] for i in range(n)) / n for j in range(k)]
    ssr = k * sum((rm - grand) ** 2 for rm in row_means)
    ssc = n * sum((cm - grand) ** 2 for cm in col_means)
    sse = 0.0
    for i in range(n):
        for j in range(k):
            sse += (matrix[i][j] - row_means[i] - col_means[j] + grand) ** 2
    msr = ssr / (n - 1)
    msc = ssc / (k - 1)
    mse = sse / ((n - 1) * (k - 1))
    denom = msr + (k - 1) * mse + k * (msc - mse) / n
    if denom == 0:
        return 0.0
    return (msr - mse) / denom`,
    testCases: [
      { input: [[[1, 1], [2, 2], [3, 3]]], expected: 1.0 },
      { input: [[[1, 2], [2, 1], [3, 3]]], expected: 0.6 },
      { input: [[[1, 2], [3, 4]]], expected: 0.8 },
      { input: [[[1, 2], [3, 4], [5, 6]]], expected: 0.8888888888888888 },
      { input: [[[1, 2], [3]]], expected: 0.0 },
    ],
    hint: "This is the absolute-agreement single-measure ICC.",
  },
  {
    id: "st-182",
    title: "Ability MLE Step",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Perform one Newton-Raphson step for 2PL ability estimation: theta1 = theta0 + sum(a_i*(y_i - p_i)) / sum(a_i^2*p_i*(1-p_i)), where p_i is the 2PL probability at theta0 and y_i is the 0/1 response. If the responses are empty, the lengths differ, or the information denominator is zero, return theta0 unchanged.",
    starterCode: `import math
def ability_mle_step(theta0, responses, items):
    # Your code here
    pass`,
    solution: `import math
def ability_mle_step(theta0, responses, items):
    n = len(responses)
    if n == 0 or len(items) != n:
        return theta0
    num = 0.0
    den = 0.0
    for y, params in zip(responses, items):
        a = params[0]
        b = params[1]
        p = 1.0 / (1.0 + math.exp(-a * (theta0 - b)))
        num += a * (y - p)
        den += a * a * p * (1.0 - p)
    if den == 0:
        return theta0
    return theta0 + num / den`,
    testCases: [
      { input: [0, [1, 1], [[1, 0], [1, 0]]], expected: 2.0 },
      { input: [0, [0, 0], [[1, 0], [1, 0]]], expected: -2.0 },
      { input: [0, [1, 0], [[1, 0], [1, 0]]], expected: 0.0 },
      { input: [0, [1, 1, 0], [[1, -1], [1, 0], [1, 1]]], expected: 0.7773343404278718 },
      { input: [-1, [], []], expected: -1.0 },
    ],
    hint: "The denominator is the test information at the current ability.",
  },
  {
    id: "st-183",
    title: "Bland-Altman Limits of Agreement",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Return the limits of agreement [mean(d) - z*sd(d), mean(d) + z*sd(d)] for paired measurements d = a - b, using the sample standard deviation. Return [0.0, 0.0] when fewer than two pairs are given or lengths differ, and [mean(d), mean(d)] when all differences are equal.",
    starterCode: `def bland_altman_limits(a, b, z_crit):
    # Your code here
    pass`,
    solution: `def bland_altman_limits(a, b, z_crit):
    n = len(a)
    if n < 2 or len(b) != n:
        return [0.0, 0.0]
    d = [a[i] - b[i] for i in range(n)]
    md = sum(d) / n
    s2 = sum((v - md) ** 2 for v in d) / (n - 1)
    if s2 <= 0:
        return [md, md]
    sd = s2 ** 0.5
    return [md - z_crit * sd, md + z_crit * sd]`,
    testCases: [
      { input: [[10, 12, 14], [9, 11, 13], 1.96], expected: [1.0, 1.0] },
      { input: [[10, 12, 14, 16], [9, 11, 14, 15], 1.96], expected: [-0.22999999999999998, 1.73] },
      { input: [[5, 6, 7], [4, 6, 8], 1.645], expected: [-1.645, 1.645] },
      { input: [[1], [2], 1.96], expected: [0.0, 0.0] },
      { input: [[], [], 1.96], expected: [0.0, 0.0] },
    ],
    hint: "Most differences should fall between the two limits.",
  },
  {
    id: "st-184",
    title: "Coefficient of Repeatability",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Return the coefficient of repeatability 1.96 * sd(a - b) for paired measurements, using the sample standard deviation of the differences. Return 0.0 when fewer than two pairs are given or lengths differ.",
    starterCode: `def coefficient_of_repeatability(a, b):
    # Your code here
    pass`,
    solution: `def coefficient_of_repeatability(a, b):
    n = len(a)
    if n < 2 or len(b) != n:
        return 0.0
    d = [a[i] - b[i] for i in range(n)]
    md = sum(d) / n
    s2 = sum((v - md) ** 2 for v in d) / (n - 1)
    return 1.96 * (s2 ** 0.5)`,
    testCases: [
      { input: [[10, 12, 14], [9, 11, 13]], expected: 0.0 },
      { input: [[10, 12, 14, 16], [9, 11, 14, 15]], expected: 0.98 },
      { input: [[5, 6, 7], [4, 6, 8]], expected: 1.96 },
      { input: [[1, 5], [2, 4]], expected: 2.7718585822512662 },
      { input: [[1], [2]], expected: 0.0 },
    ],
    hint: "It is the half-width of the 95 percent limits of agreement.",
  },
  {
    id: "st-185",
    title: "Responsiveness Index",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Return Guyatt's responsiveness index mean(followup - baseline) / sd(followup - baseline), using the sample standard deviation of the change scores. Return 0.0 when fewer than two pairs are given, lengths differ, or the change scores are constant.",
    starterCode: `def responsiveness_index(baseline, followup):
    # Your code here
    pass`,
    solution: `def responsiveness_index(baseline, followup):
    n = len(baseline)
    if n < 2 or len(followup) != n:
        return 0.0
    d = [followup[i] - baseline[i] for i in range(n)]
    md = sum(d) / n
    s2 = sum((v - md) ** 2 for v in d) / (n - 1)
    if s2 <= 0:
        return 0.0
    return md / (s2 ** 0.5)`,
    testCases: [
      { input: [[50, 60, 70], [55, 68, 75]], expected: 3.464101615137755 },
      { input: [[10, 12, 14], [10, 12, 14]], expected: 0.0 },
      { input: [[1, 2, 3], [2, 4, 6]], expected: 2.0 },
      { input: [[5, 5], [7, 7]], expected: 0.0 },
      { input: [[1], [2]], expected: 0.0 },
    ],
    hint: "It standardizes the observed change by its own variability.",
  },
];
