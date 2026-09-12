import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "ml-181",
    title: "Experiment Lift",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the absolute lift of an experiment: treatment_rate - control_rate.\n\nRates are proportions between 0 and 1.",
    starterCode: `def experiment_lift(control_rate, treatment_rate):
    # Your code here
    pass`,
    solution: `def experiment_lift(control_rate, treatment_rate):
    return treatment_rate - control_rate`,
    testCases: [
      { input: [0.1, 0.12], expected: 0.01999999999999999 },
      { input: [0.5, 0.4], expected: -0.09999999999999998 },
      { input: [0.0, 0.05], expected: 0.05 },
      { input: [0.25, 0.25], expected: 0.0 },
    ],
    hint: "Absolute lift is simply the difference between the two conversion rates.",
  },
  {
    id: "ml-182",
    title: "Relative Uplift",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the relative uplift in percent: (treatment_rate - control_rate) / control_rate * 100.\n\nReturn 0.0 when the control rate is 0.",
    starterCode: `def relative_uplift(control_rate, treatment_rate):
    # Your code here
    pass`,
    solution: `def relative_uplift(control_rate, treatment_rate):
    if control_rate == 0:
        return 0.0
    return (treatment_rate - control_rate) / control_rate * 100.0`,
    testCases: [
      { input: [0.1, 0.12], expected: 19.99999999999999 },
      { input: [0.2, 0.15], expected: -25.000000000000007 },
      { input: [0.0, 0.05], expected: 0.0 },
      { input: [0.4, 0.4], expected: 0.0 },
    ],
    hint: "Relative uplift normalizes the absolute difference by the control baseline.",
  },
  {
    id: "ml-183",
    title: "Guardrail Degradation",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute guardrail metric degradation in percent, counting only harm: max(0, (control - treatment) / control) * 100.\n\nReturn 0.0 when control is 0 or the treatment matches or beats the control.",
    starterCode: `def guardrail_degradation(control, treatment):
    # Your code here
    pass`,
    solution: `def guardrail_degradation(control, treatment):
    if control == 0:
        return 0.0
    return max(0.0, (control - treatment) / control) * 100.0`,
    testCases: [
      { input: [0.05, 0.06], expected: 0.0 },
      { input: [0.06, 0.05], expected: 16.66666666666666 },
      { input: [0.2, 0.15], expected: 25.000000000000007 },
      { input: [0.0, 0.1], expected: 0.0 },
    ],
    hint: "Guardrails only care about regressions, so improvements clamp to 0.",
  },
  {
    id: "ml-184",
    title: "Two-Proportion Z-Score",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Compute the pooled two-proportion z-score: (p_a - p_b) / sqrt(p_pool * (1 - p_pool) * (1/n_a + 1/n_b)), where p_pool = (success_a + success_b) / (n_a + n_b).\n\nReturn 0.0 when a sample size is 0 or the standard error is 0.",
    starterCode: `import math
def two_proportion_z(success_a, n_a, success_b, n_b):
    # Your code here
    pass`,
    solution: `import math
def two_proportion_z(success_a, n_a, success_b, n_b):
    if n_a == 0 or n_b == 0:
        return 0.0
    p_a = success_a / n_a
    p_b = success_b / n_b
    p_pool = (success_a + success_b) / (n_a + n_b)
    se = math.sqrt(p_pool * (1 - p_pool) * (1.0 / n_a + 1.0 / n_b))
    if se == 0:
        return 0.0
    return (p_a - p_b) / se`,
    testCases: [
      { input: [60, 1000, 50, 1000], expected: 0.980816477227499 },
      { input: [100, 500, 80, 500], expected: 1.6462159944159829 },
      { input: [50, 100, 50, 100], expected: 0.0 },
      { input: [0, 100, 0, 100], expected: 0.0 },
    ],
    hint: "The pooled proportion combines both groups under the null hypothesis of equal rates.",
  },
  {
    id: "ml-185",
    title: "Lift Confidence Interval",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the confidence interval for the absolute lift: (p_t - p_c) +/- z * se with the unpooled standard error se = sqrt(p_c*(1-p_c)/n_c + p_t*(1-p_t)/n_t).\n\nReturn [lower, upper]; if either sample size is 0 return [0.0, 0.0].",
    starterCode: `import math
def lift_confidence_interval(success_c, n_c, success_t, n_t, z):
    # Returns [lower, upper]
    # Your code here
    pass`,
    solution: `import math
def lift_confidence_interval(success_c, n_c, success_t, n_t, z):
    if n_c == 0 or n_t == 0:
        return [0.0, 0.0]
    p_c = success_c / n_c
    p_t = success_t / n_t
    se = math.sqrt(p_c * (1 - p_c) / n_c + p_t * (1 - p_t) / n_t)
    diff = p_t - p_c
    return [diff - z * se, diff + z * se]`,
    testCases: [
      { input: [50, 1000, 60, 1000, 1.96], expected: [-0.00997854449152891, 0.0299785444915289] },
      { input: [10, 100, 20, 100, 1.645], expected: [0.017750000000000002, 0.18225000000000002] },
      { input: [0, 100, 0, 100, 1.96], expected: [0.0, 0.0] },
      { input: [0, 0, 1, 10, 1.96], expected: [0.0, 0.0] },
    ],
    hint: "Use the unpooled standard error for interval estimation, unlike the pooled test statistic.",
  },
  {
    id: "ml-186",
    title: "Sample Size per Variant",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the required sample size per variant for a two-proportion test: ceil((z_alpha + z_beta)^2 * (p1*(1-p1) + p2*(1-p2)) / (p2 - p1)^2).\n\nReturn 0 when p1 == p2.",
    starterCode: `import math
def sample_size_per_variant(p1, p2, z_alpha, z_beta):
    # Your code here
    pass`,
    solution: `import math
def sample_size_per_variant(p1, p2, z_alpha, z_beta):
    if p1 == p2:
        return 0
    num = (z_alpha + z_beta) ** 2 * (p1 * (1 - p1) + p2 * (1 - p2))
    n = num / (p2 - p1) ** 2
    return math.ceil(n)`,
    testCases: [
      { input: [0.1, 0.12, 1.96, 0.84], expected: 3834 },
      { input: [0.5, 0.55, 1.96, 0.84], expected: 1561 },
      { input: [0.2, 0.1, 1.645, 0.84], expected: 155 },
      { input: [0.1, 0.1, 1.96, 0.84], expected: 0 },
    ],
    hint: "Smaller effects and lower variances both change required sample size dramatically.",
  },
  {
    id: "ml-187",
    title: "Statistical Power",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the power of a one-sided z-test: 1 - Phi(z_alpha - delta * sqrt(n) / sigma), where Phi is the standard normal CDF.\n\nReturn 0.0 when n <= 0 or sigma <= 0.",
    starterCode: `import math
def statistical_power(n, delta, sigma, z_alpha):
    # Your code here
    pass`,
    solution: `import math
def statistical_power(n, delta, sigma, z_alpha):
    if n <= 0 or sigma <= 0:
        return 0.0
    x = z_alpha - delta * math.sqrt(n) / sigma
    phi = 0.5 * (1.0 + math.erf(x / math.sqrt(2.0)))
    return 1.0 - phi`,
    testCases: [
      { input: [100, 0.2, 1, 1.645], expected: 0.6387052043836872 },
      { input: [400, 0.1, 1, 1.96], expected: 0.5159534368528308 },
      { input: [50, 0.5, 2, 1.28], expected: 0.6871425391678323 },
      { input: [0, 0.2, 1, 1.645], expected: 0.0 },
    ],
    hint: "Power is the probability of rejecting the null when the true effect is delta.",
  },
  {
    id: "ml-188",
    title: "Sequential Test Threshold",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Decide whether a p-value passes a Bonferroni-style sequential test after a given number of looks: p_value < alpha / looks.\n\nReturn False when looks <= 0.",
    starterCode: `def passes_sequential_test(p_value, alpha, looks):
    # Your code here
    pass`,
    solution: `def passes_sequential_test(p_value, alpha, looks):
    if looks <= 0:
        return False
    return p_value < alpha / looks`,
    testCases: [
      { input: [0.01, 0.05, 3], expected: true },
      { input: [0.02, 0.05, 3], expected: false },
      { input: [0.001, 0.05, 1], expected: true },
      { input: [0.05, 0.05, 1], expected: false },
    ],
    hint: "Each additional peek at the data tightens the significance threshold.",
  },
  {
    id: "ml-189",
    title: "CUPED Variance Reduction",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Apply CUPED variance reduction. With theta = cov(x, y) / var(x), adjust y_i to y_i - theta * (x_i - mean_x).\n\nReturn [adjusted_mean, variance_reduction] where variance_reduction = 1 - var(adjusted)/var(y). If var(x) or var(y) is 0, return [mean_y, 0.0].",
    starterCode: `def cuped_variance_reduction(y, x):
    # Returns [adjusted_mean, variance_reduction]
    # Your code here
    pass`,
    solution: `def cuped_variance_reduction(y, x):
    n = len(y)
    if n == 0:
        return [0.0, 0.0]
    mean_y = sum(y) / n
    mean_x = sum(x) / n
    var_x = sum((v - mean_x) ** 2 for v in x) / n
    var_y = sum((v - mean_y) ** 2 for v in y) / n
    if var_x == 0 or var_y == 0:
        return [mean_y, 0.0]
    cov = sum((x[i] - mean_x) * (y[i] - mean_y) for i in range(n)) / n
    theta = cov / var_x
    adj = [y[i] - theta * (x[i] - mean_x) for i in range(n)]
    mean_adj = sum(adj) / n
    var_adj = sum((a - mean_adj) ** 2 for a in adj) / n
    return [mean_adj, 1.0 - var_adj / var_y]`,
    testCases: [
      { input: [[1, 2, 3, 4], [1, 2, 3, 4]], expected: [2.5, 1.0] },
      { input: [[1, 2, 3, 4], [0, 0, 0, 0]], expected: [2.5, 0.0] },
      { input: [[2, 4, 6, 8], [1, 3, 5, 7]], expected: [5.0, 1.0] },
      { input: [[1, 3, 2, 4], [2, 1, 4, 3]], expected: [2.5, 0.0] },
    ],
    hint: "A pre-experiment covariate correlated with the metric lets you explain away variance.",
  },
  {
    id: "ml-190",
    title: "Novelty Effect",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Estimate the novelty effect as the change in lift from the first k days to the remaining days: mean(lifts[k:]) - mean(lifts[:k]).\n\nReturn 0.0 if k is not within (0, len(lifts)).",
    starterCode: `def novelty_effect(lifts, k):
    # Your code here
    pass`,
    solution: `def novelty_effect(lifts, k):
    if k <= 0 or k >= len(lifts):
        return 0.0
    first = sum(lifts[:k]) / k
    rest = sum(lifts[k:]) / (len(lifts) - k)
    return rest - first`,
    testCases: [
      { input: [[5, 4, 2, 1], 1], expected: -2.6666666666666665 },
      { input: [[1, 2, 3, 4], 2], expected: 2.0 },
      { input: [[3], 1], expected: 0.0 },
      { input: [[], 1], expected: 0.0 },
    ],
    hint: "A large drop after the first days suggests the early lift was a novelty spike.",
  },
  {
    id: "ml-191",
    title: "Bonferroni Count",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Count how many p-values are significant after Bonferroni correction: p_i <= alpha / m, where m is the number of hypotheses.\n\nEmpty input returns 0.",
    starterCode: `def bonferroni_count(p_values, alpha):
    # Your code here
    pass`,
    solution: `def bonferroni_count(p_values, alpha):
    m = len(p_values)
    if m == 0:
        return 0
    threshold = alpha / m
    return sum(1 for p in p_values if p <= threshold)`,
    testCases: [
      { input: [[0.001, 0.01, 0.04], 0.05], expected: 2 },
      { input: [[0.02, 0.03], 0.05], expected: 1 },
      { input: [[0.5], 0.5], expected: 1 },
      { input: [[], 0.05], expected: 0 },
    ],
    hint: "Divide alpha by the number of tests before comparing.",
  },
  {
    id: "ml-192",
    title: "Holm-Bonferroni Step",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Count rejections with the Holm-Bonferroni step-down procedure. Sort p-values ascending; reject while p_(i) <= alpha / (m - i) for 0-based i, stopping at the first failure.\n\nEmpty input returns 0.",
    starterCode: `def holm_count(p_values, alpha):
    # Your code here
    pass`,
    solution: `def holm_count(p_values, alpha):
    m = len(p_values)
    if m == 0:
        return 0
    ordered = sorted(p_values)
    count = 0
    for i in range(m):
        if ordered[i] <= alpha / (m - i):
            count += 1
        else:
            break
    return count`,
    testCases: [
      { input: [[0.001, 0.01, 0.04], 0.05], expected: 3 },
      { input: [[0.02, 0.03, 0.04], 0.05], expected: 0 },
      { input: [[0.01, 0.5], 0.05], expected: 1 },
      { input: [[], 0.05], expected: 0 },
    ],
    hint: "Holm is uniformly more powerful than plain Bonferroni because thresholds loosen as you reject.",
  },
  {
    id: "ml-193",
    title: "Benjamini-Hochberg Count",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Count rejections with the Benjamini-Hochberg FDR procedure: sort p-values ascending and return the largest k such that p_(k) <= k/m * alpha (0 if none).\n\nEmpty input returns 0.",
    starterCode: `def bh_count(p_values, alpha):
    # Your code here
    pass`,
    solution: `def bh_count(p_values, alpha):
    m = len(p_values)
    if m == 0:
        return 0
    ordered = sorted(p_values)
    count = 0
    for k in range(1, m + 1):
        if ordered[k - 1] <= k * alpha / m:
            count = k
    return count`,
    testCases: [
      { input: [[0.001, 0.01, 0.04], 0.05], expected: 3 },
      { input: [[0.02, 0.03, 0.04], 0.05], expected: 3 },
      { input: [[0.5, 0.01], 0.05], expected: 1 },
      { input: [[0.04, 0.04, 0.04], 0.05], expected: 3 },
    ],
    hint: "Find the largest k satisfying the BH inequality, then reject all hypotheses up to that rank.",
  },
  {
    id: "ml-194",
    title: "Simpson's Paradox Check",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Detect Simpson's paradox between two groups. subgroups_a and subgroups_b are lists of [successes, total] per subgroup; return True when the overall winner is the group that loses in every subgroup, False otherwise.\n\nTies, mixed subgroup directions, or empty input return False.",
    starterCode: `def simpson_paradox(subgroups_a, subgroups_b):
    # Your code here
    pass`,
    solution: `def simpson_paradox(subgroups_a, subgroups_b):
    if not subgroups_a or len(subgroups_a) != len(subgroups_b):
        return False
    ta = sum(s for s, n in subgroups_a)
    na = sum(n for s, n in subgroups_a)
    tb = sum(s for s, n in subgroups_b)
    nb = sum(n for s, n in subgroups_b)
    if na == 0 or nb == 0:
        return False
    ra = ta / na
    rb = tb / nb
    if ra == rb:
        return False
    better = []
    for i in range(len(subgroups_a)):
        sa, ca = subgroups_a[i]
        sb, cb = subgroups_b[i]
        if ca == 0 or cb == 0:
            return False
        pa = sa / ca
        pb = sb / cb
        if pa == pb:
            return False
        better.append(pa > pb)
    if ra > rb:
        return all(not b for b in better)
    return all(better)`,
    testCases: [
      { input: [[[90, 100], [10, 100]], [[80, 100], [0, 10]]], expected: true },
      { input: [[[90, 100], [50, 100]], [[80, 100], [40, 100]]], expected: false },
      { input: [[[80, 100], [0, 10]], [[90, 100], [10, 100]]], expected: true },
      { input: [[], []], expected: false },
    ],
    hint: "The paradox occurs when unequal subgroup sizes flip the aggregate comparison.",
  },
  {
    id: "ml-195",
    title: "IPW ATE Estimate",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Estimate the average treatment effect with inverse propensity weighting: mean(t*y/e - (1-t)*y/(1-e)), clipping propensities to [1e-6, 1 - 1e-6].\n\nEmpty input returns 0.0.",
    starterCode: `def ipw_ate(treatment, outcome, propensity):
    # Your code here
    pass`,
    solution: `def ipw_ate(treatment, outcome, propensity):
    n = len(treatment)
    if n == 0:
        return 0.0
    total = 0.0
    for i in range(n):
        e = min(max(propensity[i], 1e-6), 1.0 - 1e-6)
        if treatment[i] == 1:
            total += outcome[i] / e
        else:
            total -= outcome[i] / (1.0 - e)
    return total / n`,
    testCases: [
      { input: [[1, 1, 0, 0], [1, 0, 1, 0], [0.5, 0.5, 0.5, 0.5]], expected: 0.0 },
      { input: [[1, 1, 0, 0], [1, 1, 0, 0], [0.5, 0.5, 0.5, 0.5]], expected: 1.0 },
      { input: [[1, 0], [2, 1], [0.8, 0.5]], expected: 0.25 },
      { input: [[], [], []], expected: 0.0 },
    ],
    hint: "Each unit stands in for the population its propensity implies.",
  },
  {
    id: "ml-196",
    title: "Doubly Robust ATE Estimate",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Estimate the ATE with the doubly robust formula: mean(mu1 + t*(y - mu1)/e - mu0 - (1-t)*(y - mu0)/(1-e)), clipping propensities to [1e-6, 1 - 1e-6].\n\nEmpty input returns 0.0.",
    starterCode: `def doubly_robust_ate(treatment, outcome, propensity, mu0, mu1):
    # Your code here
    pass`,
    solution: `def doubly_robust_ate(treatment, outcome, propensity, mu0, mu1):
    n = len(treatment)
    if n == 0:
        return 0.0
    total = 0.0
    for i in range(n):
        e = min(max(propensity[i], 1e-6), 1.0 - 1e-6)
        if treatment[i] == 1:
            total += mu1[i] + (outcome[i] - mu1[i]) / e - mu0[i]
        else:
            total += mu1[i] - mu0[i] - (outcome[i] - mu0[i]) / (1.0 - e)
    return total / n`,
    testCases: [
      { input: [[1, 1, 0, 0], [1, 0, 1, 0], [0.5, 0.5, 0.5, 0.5], [0.0, 0.0, 0.0, 0.0], [0.0, 0.0, 0.0, 0.0]], expected: 0.0 },
      { input: [[1, 0], [3, 2], [0.75, 0.5], [2, 1], [3, 2]], expected: 0.0 },
      { input: [[1, 1, 0], [3, 1, 0], [0.5, 0.5, 0.5], [2, 0, 0], [3, 2, 2]], expected: 1.0 },
      { input: [[], [], [], [], []], expected: 0.0 },
    ],
    hint: "The estimator stays consistent if either the propensity model or the outcome model is correct.",
  },
  {
    id: "ml-197",
    title: "Nearest Neighbor Matching",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "For each treated unit, match the control unit with the smallest distance. distances is a matrix with one row per treated unit.\n\nReturn the matched control index per row (ties keep the smallest index); rows with no controls yield -1. Empty input returns [].",
    starterCode: `def nearest_neighbor_matching(distances):
    # Your code here
    pass`,
    solution: `def nearest_neighbor_matching(distances):
    result = []
    for row in distances:
        if not row:
            result.append(-1)
            continue
        best = 0
        for j in range(1, len(row)):
            if row[j] < row[best]:
                best = j
        result.append(best)
    return result`,
    testCases: [
      { input: [[[0.5, 0.2, 0.9], [0.7, 0.6, 0.1]]], expected: [1, 2] },
      { input: [[[0.3, 0.3]]], expected: [0] },
      { input: [[[0.1], [], [0.2]]], expected: [0, -1, 0] },
      { input: [[]], expected: [] },
    ],
    hint: "Greedy nearest-neighbor matching picks the closest control for each treated unit.",
  },
  {
    id: "ml-198",
    title: "Standardized Mean Difference",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the standardized mean difference between treated and control groups: (mean_t - mean_c) / sqrt((var_t + var_c)/2) using population variances.\n\nReturn 0.0 if a group is empty or the pooled standard deviation is 0.",
    starterCode: `def standardized_mean_difference(treated, control):
    # Your code here
    pass`,
    solution: `def standardized_mean_difference(treated, control):
    nt = len(treated)
    nc = len(control)
    if nt == 0 or nc == 0:
        return 0.0
    mt = sum(treated) / nt
    mc = sum(control) / nc
    vt = sum((v - mt) ** 2 for v in treated) / nt
    vc = sum((v - mc) ** 2 for v in control) / nc
    pooled = ((vt + vc) / 2.0) ** 0.5
    if pooled == 0:
        return 0.0
    return (mt - mc) / pooled`,
    testCases: [
      { input: [[2, 4, 6], [1, 3, 5]], expected: 0.6123724356957945 },
      { input: [[2, 2], [2, 2]], expected: 0.0 },
      { input: [[10, 12], [8, 8, 10]], expected: 2.4009801919951244 },
    ],
    hint: "SMD expresses the group difference in pooled standard deviation units, unlike a t-statistic.",
  },
  {
    id: "ml-199",
    title: "Uplift per Segment",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the absolute uplift for each segment: treatment_rate_i - control_rate_i.\n\nReturn the list of differences.",
    starterCode: `def uplift_per_segment(control_rates, treatment_rates):
    # Your code here
    pass`,
    solution: `def uplift_per_segment(control_rates, treatment_rates):
    return [treatment_rates[i] - control_rates[i] for i in range(len(control_rates))]`,
    testCases: [
      { input: [[0.1, 0.2], [0.15, 0.18]], expected: [0.04999999999999999, -0.020000000000000018] },
      { input: [[0.05, 0.4, 0.2], [0.06, 0.35, 0.25]], expected: [0.009999999999999995, -0.050000000000000044, 0.04999999999999999] },
      { input: [[0.3], [0.3]], expected: [0.0] },
    ],
    hint: "Per-segment uplift reveals where a treatment helps and where it hurts.",
  },
  {
    id: "ml-200",
    title: "Heterogeneous Effect",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Estimate the treatment effect in two subgroups split on X at threshold: for each side compute mean(y | treatment=1) - mean(y | treatment=0).\n\nA side without both treated and control samples gets 0.0. Return [effect_left, effect_right].",
    starterCode: `def heterogeneous_effect(X, y, treatment, threshold):
    # Returns [effect_left, effect_right]
    # Your code here
    pass`,
    solution: `def heterogeneous_effect(X, y, treatment, threshold):
    left = [i for i in range(len(X)) if X[i] <= threshold]
    right = [i for i in range(len(X)) if X[i] > threshold]
    def cate(indices):
        treated = [y[i] for i in indices if treatment[i] == 1]
        control = [y[i] for i in indices if treatment[i] == 0]
        if not treated or not control:
            return 0.0
        return sum(treated) / len(treated) - sum(control) / len(control)
    return [cate(left), cate(right)]`,
    testCases: [
      { input: [[1, 1, 1, 1, 9, 9, 9, 9], [3, 1, 4, 2, 9, 1, 7, 3], [1, 0, 1, 0, 1, 0, 1, 0], 5], expected: [2.0, 6.0] },
      { input: [[1, 2, 3, 4], [5, 6, 7, 8], [1, 1, 0, 0], 2.5], expected: [0.0, 0.0] },
      { input: [[1, 2, 3, 4, 5, 6], [1, 2, 3, 4, 5, 6], [1, 0, 1, 0, 1, 0], 3.5], expected: [0.0, 0.0] },
    ],
    hint: "Comparing treated and control means within each subgroup is a simple CATE estimator.",
  },
  {
    id: "ml-201",
    title: "Difference-in-Differences",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the difference-in-differences estimate: (treat_post - treat_pre) - (control_post - control_pre).",
    starterCode: `def difference_in_differences(treat_pre, treat_post, control_pre, control_post):
    # Your code here
    pass`,
    solution: `def difference_in_differences(treat_pre, treat_post, control_pre, control_post):
    return (treat_post - treat_pre) - (control_post - control_pre)`,
    testCases: [
      { input: [10, 15, 12, 14], expected: 3 },
      { input: [20, 30, 18, 22], expected: 6 },
      { input: [5, 4, 9, 10], expected: -2 },
    ],
    hint: "DiD subtracts the control group's change from the treatment group's change.",
  },
  {
    id: "ml-202",
    title: "Regression Discontinuity Jump",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Estimate the regression discontinuity jump at cutoff. Fit separate least-squares lines to points with cutoff - bandwidth <= x < cutoff and cutoff <= x <= cutoff + bandwidth, then return the difference of the fitted values at cutoff.\n\nReturn 0.0 if either side has fewer than two points or zero x-variance.",
    starterCode: `def rd_jump(X, y, cutoff, bandwidth):
    # Your code here
    pass`,
    solution: `def rd_jump(X, y, cutoff, bandwidth):
    left = [i for i in range(len(X)) if cutoff - bandwidth <= X[i] < cutoff]
    right = [i for i in range(len(X)) if cutoff <= X[i] <= cutoff + bandwidth]
    if len(left) < 2 or len(right) < 2:
        return 0.0
    def fit(indices):
        n = len(indices)
        mx = sum(X[i] for i in indices) / n
        my = sum(y[i] for i in indices) / n
        sxx = sum((X[i] - mx) ** 2 for i in indices)
        if sxx == 0:
            return None
        sxy = sum((X[i] - mx) * (y[i] - my) for i in indices)
        b = sxy / sxx
        a = my - b * mx
        return [a, b]
    fl = fit(left)
    fr = fit(right)
    if fl is None or fr is None:
        return 0.0
    return (fr[0] + fr[1] * cutoff) - (fl[0] + fl[1] * cutoff)`,
    testCases: [
      { input: [[0, 1, 2, 3, 4, 5], [1, 3, 5, 11, 13, 15], 3, 2], expected: 4.0 },
      { input: [[0, 1, 2, 3, 4, 5], [1, 3, 5, 11, 13, 15], 3, 3], expected: 4.0 },
      { input: [[0, 1, 2], [0, 1, 2], 2, 1], expected: 0.0 },
      { input: [[], [], 1, 1], expected: 0.0 },
    ],
    hint: "The jump is the gap between the right and left fitted lines evaluated at the cutoff.",
  },
  {
    id: "ml-203",
    title: "IV Wald Estimate",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the instrumental variable (Wald) estimate of a treatment effect: cov(z, y) / cov(z, x), where z is the instrument, x the endogenous regressor, and y the outcome.\n\nReturn 0.0 if cov(z, x) is 0 or input is empty.",
    starterCode: `def iv_wald_estimate(z, x, y):
    # Your code here
    pass`,
    solution: `def iv_wald_estimate(z, x, y):
    n = len(z)
    if n == 0:
        return 0.0
    mz = sum(z) / n
    mx = sum(x) / n
    my = sum(y) / n
    cov_zx = sum((z[i] - mz) * (x[i] - mx) for i in range(n)) / n
    cov_zy = sum((z[i] - mz) * (y[i] - my) for i in range(n)) / n
    if cov_zx == 0:
        return 0.0
    return cov_zy / cov_zx`,
    testCases: [
      { input: [[1, 2, 3, 4], [2, 4, 6, 8], [1, 3, 5, 7]], expected: 1.0 },
      { input: [[1, 2, 3, 4], [0, 0, 0, 0], [1, 2, 3, 4]], expected: 0.0 },
      { input: [[1, 2, 3], [2, 3, 4], [5, 6, 7]], expected: 1.0 },
      { input: [[], [], []], expected: 0.0 },
    ],
    hint: "The instrument must affect the outcome only through the endogenous variable for this estimator to be valid.",
  },
  {
    id: "ml-204",
    title: "Mediation Effect Product",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the indirect (mediation) effect as the product of the path coefficients a (treatment to mediator) and b (mediator to outcome).",
    starterCode: `def mediation_effect(a, b):
    # Your code here
    pass`,
    solution: `def mediation_effect(a, b):
    return a * b`,
    testCases: [
      { input: [0.5, 0.8], expected: 0.4 },
      { input: [2, -0.5], expected: -1.0 },
      { input: [0, 3], expected: 0 },
      { input: [1.5, 1.5], expected: 2.25 },
    ],
    hint: "The indirect effect flows from treatment through the mediator to the outcome.",
  },
  {
    id: "ml-205",
    title: "Counterfactual Prediction Residual",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the residual between the observed outcome and the counterfactual prediction under the observed treatment: y_obs - (y1_pred if treatment == 1 else y0_pred).",
    starterCode: `def counterfactual_residual(y_obs, y0_pred, y1_pred, treatment):
    # Your code here
    pass`,
    solution: `def counterfactual_residual(y_obs, y0_pred, y1_pred, treatment):
    predicted = y1_pred if treatment == 1 else y0_pred
    return y_obs - predicted`,
    testCases: [
      { input: [5, 3, 6, 1], expected: -1 },
      { input: [2, 3, 6, 0], expected: -1 },
      { input: [4, 4, 7, 1], expected: -3 },
      { input: [0, 0, 0, 0], expected: 0 },
    ],
    hint: "Only the potential outcome matching the treatment actually received is observed.",
  },
  {
    id: "ml-206",
    title: "Potential Outcomes Consistency",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Check the potential outcomes consistency assumption and return the sorted indices where the observed outcome differs from the potential outcome corresponding to the treatment received.",
    starterCode: `def consistency_violations(treatment, outcome, y0, y1):
    # Your code here
    pass`,
    solution: `def consistency_violations(treatment, outcome, y0, y1):
    result = []
    for i in range(len(treatment)):
        predicted = y1[i] if treatment[i] == 1 else y0[i]
        if outcome[i] != predicted:
            result.append(i)
    return result`,
    testCases: [
      { input: [[1, 0, 1, 0], [5, 3, 7, 3], [0, 3, 0, 4], [5, 2, 7, 1]], expected: [3] },
      { input: [[1, 0], [2, 1], [2, 1], [2, 1]], expected: [] },
      { input: [[], [], [], []], expected: [] },
    ],
    hint: "Consistency links the observed outcome to the potential outcome of the treatment received.",
  },
  {
    id: "ml-207",
    title: "Cohort Retention Mean",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the mean retention for a period across cohorts. retention_matrix[c][p] is the fraction of cohort c retained in period p; rows shorter than period + 1 are skipped.\n\nReturn 0.0 when no cohort has that period.",
    starterCode: `def cohort_retention_mean(retention_matrix, period):
    # Your code here
    pass`,
    solution: `def cohort_retention_mean(retention_matrix, period):
    values = [row[period] for row in retention_matrix if period < len(row)]
    if not values:
        return 0.0
    return sum(values) / len(values)`,
    testCases: [
      { input: [[[1.0, 0.5, 0.2], [1.0, 0.4], [1.0, 0.6, 0.3]], 1], expected: 0.5 },
      { input: [[[1.0, 0.5, 0.2], [1.0, 0.4], [1.0, 0.6, 0.3]], 2], expected: 0.25 },
      { input: [[[1.0, 0.5], [1.0, 0.5]], 0], expected: 1.0 },
      { input: [[[1.0]], 3], expected: 0.0 },
    ],
    hint: "Younger cohorts have not lived long enough to contribute to later periods.",
  },
  {
    id: "ml-208",
    title: "Churn Rate",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the churn rate in percent: churned / start_count * 100.\n\nReturn 0.0 when start_count is 0.",
    starterCode: `def churn_rate(start_count, churned_count):
    # Your code here
    pass`,
    solution: `def churn_rate(start_count, churned_count):
    if start_count == 0:
        return 0.0
    return churned_count / start_count * 100.0`,
    testCases: [
      { input: [100, 5], expected: 5.0 },
      { input: [80, 4], expected: 5.0 },
      { input: [50, 0], expected: 0.0 },
      { input: [0, 3], expected: 0.0 },
    ],
    hint: "Churn is customers lost divided by customers at the start of the period.",
  },
  {
    id: "ml-209",
    title: "Survival Probability",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the survival probability through the first t intervals: product of (1 - hazard_i).\n\nReturn 1.0 for t <= 0; if t exceeds the number of hazards, use all of them.",
    starterCode: `def survival_probability(hazards, t):
    # Your code here
    pass`,
    solution: `def survival_probability(hazards, t):
    if t <= 0:
        return 1.0
    limit = min(t, len(hazards))
    s = 1.0
    for i in range(limit):
        s *= 1.0 - hazards[i]
    return s`,
    testCases: [
      { input: [[0.1, 0.2, 0.3], 2], expected: 0.7200000000000001 },
      { input: [[0.5], 1], expected: 0.5 },
      { input: [[0.1], 0], expected: 1.0 },
      { input: [[0.2, 0.2], 5], expected: 0.6400000000000001 },
    ],
    hint: "Survival is the product of per-interval survival chances.",
  },
  {
    id: "ml-210",
    title: "Hazard Rate",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the discrete hazard rate per interval: events_i / at_risk_i (0.0 when at_risk is 0).\n\nReturn the list of hazards.",
    starterCode: `def hazard_rate(at_risk, events):
    # Your code here
    pass`,
    solution: `def hazard_rate(at_risk, events):
    result = []
    for i in range(len(at_risk)):
        if at_risk[i] == 0:
            result.append(0.0)
        else:
            result.append(events[i] / at_risk[i])
    return result`,
    testCases: [
      { input: [[100, 80, 60], [10, 8, 6]], expected: [0.1, 0.1, 0.1] },
      { input: [[50, 0, 25], [5, 0, 5]], expected: [0.1, 0.0, 0.2] },
      { input: [[], []], expected: [] },
    ],
    hint: "The hazard is the event rate among those still at risk at the start of the interval.",
  },
  {
    id: "ml-211",
    title: "Kaplan-Meier Step",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the Kaplan-Meier survival curve: S_i = product over j <= i of (1 - events_j / at_risk_j).\n\nIntervals with at_risk 0 leave the product unchanged. Return the list of survival probabilities.",
    starterCode: `def kaplan_meier(at_risk, events):
    # Your code here
    pass`,
    solution: `def kaplan_meier(at_risk, events):
    result = []
    s = 1.0
    for i in range(len(at_risk)):
        if at_risk[i] > 0:
            s *= 1.0 - events[i] / at_risk[i]
        result.append(s)
    return result`,
    testCases: [
      { input: [[100, 80], [10, 8]], expected: [0.9, 0.81] },
      { input: [[10, 10, 10], [1, 1, 1]], expected: [0.9, 0.81, 0.7290000000000001] },
      { input: [[5], [5]], expected: [0.0] },
      { input: [[], []], expected: [] },
    ],
    hint: "The survival curve only drops at intervals where events occur.",
  },
  {
    id: "ml-212",
    title: "Log-Rank Statistic",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Compute a single-time-point log-rank statistic for two groups. With N = n1 + n2, expected = d * n1 / N and variance = n1*n2*d*(N - d) / (N^2*(N - 1)), return (d1 - expected)^2 / variance.\n\nReturn 0.0 when the variance is 0.",
    starterCode: `def log_rank_statistic(n1, n2, d1, d):
    # Your code here
    pass`,
    solution: `def log_rank_statistic(n1, n2, d1, d):
    if n1 <= 0 or n2 <= 0:
        return 0.0
    n = n1 + n2
    expected = d * n1 / n
    var = n1 * n2 * d * (n - d) / (n * n * (n - 1)) if n > 1 else 0.0
    if var == 0:
        return 0.0
    return (d1 - expected) ** 2 / var`,
    testCases: [
      { input: [100, 100, 20, 40], expected: 0.0 },
      { input: [100, 100, 30, 40], expected: 12.437500000000002 },
      { input: [50, 50, 5, 20], expected: 6.1875 },
      { input: [10, 10, 0, 0], expected: 0.0 },
    ],
    hint: "Compare observed events in group 1 against the number expected under equal risk.",
  },
  {
    id: "ml-213",
    title: "Discounted Lifetime Value",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the discounted lifetime value: sum over periods t = 0, 1, ... of revenues[t] / (1 + discount_rate)^t.\n\nEmpty input returns 0.0.",
    starterCode: `def discounted_ltv(revenues, discount_rate):
    # Your code here
    pass`,
    solution: `def discounted_ltv(revenues, discount_rate):
    total = 0.0
    for t in range(len(revenues)):
        total += revenues[t] / (1.0 + discount_rate) ** t
    return total`,
    testCases: [
      { input: [[100, 100, 100], 0.1], expected: 273.55371900826447 },
      { input: [[0, 100], 0.1], expected: 90.9090909090909 },
      { input: [[50], 0.0], expected: 50.0 },
      { input: [[100], 1.0], expected: 100.0 },
    ],
    hint: "Period 0 revenue is not discounted; later periods are divided by (1 + rate)^t.",
  },
  {
    id: "ml-214",
    title: "RFM Scores",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute RFM scores as 3 (>= high threshold), 2 (>= low threshold), or 1. r_thr, f_thr, m_thr are [low, high] pairs; return [r_score, f_score, m_score].\n\nAll metrics are treated the same way (higher is better).",
    starterCode: `def rfm_scores(recency, frequency, monetary, r_thr, f_thr, m_thr):
    # Your code here
    pass`,
    solution: `def rfm_scores(recency, frequency, monetary, r_thr, f_thr, m_thr):
    def score(v, thr):
        if v >= thr[1]:
            return 3
        if v >= thr[0]:
            return 2
        return 1
    return [score(recency, r_thr), score(frequency, f_thr), score(monetary, m_thr)]`,
    testCases: [
      { input: [3, 12, 500, [2, 5], [5, 10], [100, 1000]], expected: [2, 3, 2] },
      { input: [1, 2, 50, [2, 5], [5, 10], [100, 1000]], expected: [1, 1, 1] },
      { input: [10, 1, 2000, [2, 5], [5, 10], [100, 1000]], expected: [3, 1, 3] },
    ],
    hint: "Binning each metric into three levels yields a compact customer profile.",
  },
  {
    id: "ml-215",
    title: "Market Basket Support",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the support of an item: the fraction of baskets containing it.\n\nEmpty input returns 0.0.",
    starterCode: `def basket_support(baskets, item):
    # Your code here
    pass`,
    solution: `def basket_support(baskets, item):
    if not baskets:
        return 0.0
    count = sum(1 for b in baskets if item in b)
    return count / len(baskets)`,
    testCases: [
      { input: [[["milk", "bread"], ["milk"], ["eggs", "bread"], ["milk", "eggs"]], "milk"], expected: 0.75 },
      { input: [[["milk", "bread"], ["milk"], ["eggs", "bread"], ["milk", "eggs"]], "bread"], expected: 0.5 },
      { input: [[["milk", "bread"], ["milk"], ["eggs", "bread"], ["milk", "eggs"]], "none"], expected: 0.0 },
      { input: [[], "milk"], expected: 0.0 },
    ],
    hint: "Support is the popularity of an itemset across baskets.",
  },
  {
    id: "ml-216",
    title: "Association Confidence",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the confidence of the rule A -> B: (baskets containing both A and B) / (baskets containing A).\n\nReturn 0.0 if no basket contains A or input is empty.",
    starterCode: `def association_confidence(baskets, a, b):
    # Your code here
    pass`,
    solution: `def association_confidence(baskets, a, b):
    count_a = sum(1 for basket in baskets if a in basket)
    if count_a == 0:
        return 0.0
    count_ab = sum(1 for basket in baskets if a in basket and b in basket)
    return count_ab / count_a`,
    testCases: [
      { input: [[["milk", "bread"], ["milk"], ["eggs", "bread"], ["milk", "eggs"]], "milk", "eggs"], expected: 0.3333333333333333 },
      { input: [[["milk", "bread"], ["milk"], ["eggs", "bread"], ["milk", "eggs"]], "milk", "milk"], expected: 1.0 },
      { input: [[["milk", "bread"], ["milk"], ["eggs", "bread"], ["milk", "eggs"]], "none", "milk"], expected: 0.0 },
      { input: [[], "a", "b"], expected: 0.0 },
    ],
    hint: "Confidence is the conditional probability of B given A.",
  },
  {
    id: "ml-217",
    title: "Association Lift",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the lift of the rule A -> B: confidence(A -> B) / support(B).\n\nReturn 0.0 if either item count is 0 or input is empty.",
    starterCode: `def association_lift(baskets, a, b):
    # Your code here
    pass`,
    solution: `def association_lift(baskets, a, b):
    if not baskets:
        return 0.0
    count_a = sum(1 for basket in baskets if a in basket)
    count_b = sum(1 for basket in baskets if b in basket)
    if count_a == 0 or count_b == 0:
        return 0.0
    count_ab = sum(1 for basket in baskets if a in basket and b in basket)
    conf = count_ab / count_a
    support_b = count_b / len(baskets)
    return conf / support_b`,
    testCases: [
      { input: [[["milk", "bread"], ["milk"], ["eggs", "bread"], ["milk", "eggs"]], "milk", "eggs"], expected: 0.6666666666666666 },
      { input: [[["milk", "bread"], ["milk"], ["eggs", "bread"], ["milk", "eggs"]], "milk", "bread"], expected: 0.6666666666666666 },
      { input: [[["milk", "bread"], ["milk"], ["eggs", "bread"], ["milk", "eggs"]], "none", "milk"], expected: 0.0 },
      { input: [[], "a", "b"], expected: 0.0 },
    ],
    hint: "Lift above 1 means A makes B more likely than chance.",
  },
  {
    id: "ml-218",
    title: "User-Based CF Predict",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Predict a rating with user-based collaborative filtering: sum over neighbors with known ratings of sim * rating divided by the sum of |sim|; null ratings are skipped.\n\nReturn 0.0 when there are no usable neighbors or the weight sum is 0.",
    starterCode: `def user_based_cf_predict(ratings, similarities):
    # Your code here
    pass`,
    solution: `def user_based_cf_predict(ratings, similarities):
    num = 0.0
    den = 0.0
    for r, s in zip(ratings, similarities):
        if r is None:
            continue
        num += s * r
        den += abs(s)
    if den == 0:
        return 0.0
    return num / den`,
    testCases: [
      { input: [[4, null, 2], [0.8, 0.5, 0.9]], expected: 2.941176470588235 },
      { input: [[5, 1], [0.5, -0.5]], expected: 2.0 },
      { input: [[null, null], [0.5, 0.5]], expected: 0.0 },
      { input: [[4, null], [0.0, 0.0]], expected: 0.0 },
    ],
    hint: "Only neighbors who rated the item contribute to the weighted average.",
  },
  {
    id: "ml-219",
    title: "Item-Based Cosine Predict",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Predict a rating as the similarity-weighted average of the user's ratings on items similar to the target: sum(sim * rating) / sum(|sim|) over items present in both dicts.\n\nReturn 0.0 when there is no overlap or the weight sum is 0.",
    starterCode: `def item_based_cosine_predict(user_ratings, similarities):
    # Your code here
    pass`,
    solution: `def item_based_cosine_predict(user_ratings, similarities):
    num = 0.0
    den = 0.0
    for item in similarities:
        if item in user_ratings:
            sim = similarities[item]
            num += sim * user_ratings[item]
            den += abs(sim)
    if den == 0:
        return 0.0
    return num / den`,
    testCases: [
      { input: [{ "a": 5, "b": 3 }, { "a": 0.8, "b": 0.4 }], expected: 4.333333333333333 },
      { input: [{ "a": 5, "b": 1 }, { "a": 0.5, "b": -0.5 }], expected: 2.0 },
      { input: [{ "a": 5 }, { "b": 0.5 }], expected: 0.0 },
      { input: [{}, { "a": 0.5 }], expected: 0.0 },
    ],
    hint: "Item-item similarity weights the user's own ratings of related items.",
  },
  {
    id: "ml-220",
    title: "Matrix Factorization SGD Step",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Perform one SGD step for matrix factorization. With err = rating - dot(p, q): p_j += lr*(err*q_j - reg*p_j) and q_j += lr*(err*p_j - reg*q_j) using the old p and q.\n\nReturn [new_p, new_q].",
    starterCode: `def matrix_factorization_sgd(rating, p, q, lr, reg):
    # Returns [new_p, new_q]
    # Your code here
    pass`,
    solution: `def matrix_factorization_sgd(rating, p, q, lr, reg):
    pred = sum(p[j] * q[j] for j in range(len(p)))
    err = rating - pred
    new_p = [p[j] + lr * (err * q[j] - reg * p[j]) for j in range(len(p))]
    new_q = [q[j] + lr * (err * p[j] - reg * q[j]) for j in range(len(q))]
    return [new_p, new_q]`,
    testCases: [
      { input: [5, [0.5, 0.5], [0.2, 0.4], 0.1, 0.01], expected: [[0.5935, 0.6875], [0.4348000000000001, 0.6346]] },
      { input: [4, [1.0, 0.0], [0.5, 0.5], 0.05, 0.0], expected: [[1.0875, 0.08750000000000001], [0.675, 0.5]] },
      { input: [0, [0.5, 0.5], [0.5, 0.5], 0.1, 0.01], expected: [[0.4745, 0.4745], [0.4745, 0.4745]] },
      { input: [3, [], [], 0.1, 0.01], expected: [[], []] },
    ],
    hint: "The regularization term shrinks the factors while the error term pulls them toward the rating.",
  },
  {
    id: "ml-221",
    title: "Implicit Feedback Confidence",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute implicit-feedback confidence values: 1 + alpha * interaction.\n\nReturn the list; empty input returns [].",
    starterCode: `def implicit_confidence(interactions, alpha):
    # Your code here
    pass`,
    solution: `def implicit_confidence(interactions, alpha):
    return [1.0 + alpha * r for r in interactions]`,
    testCases: [
      { input: [[0, 1, 5], 0.5], expected: [1.0, 1.5, 3.5] },
      { input: [[2], 1], expected: [3.0] },
      { input: [[], 0.5], expected: [] },
    ],
    hint: "Confidence grows linearly with the strength of implicit interaction.",
  },
  {
    id: "ml-222",
    title: "Precision at K",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute precision at k for a ranked binary relevance list: relevant items in the first min(k, n) positions divided by the number of positions used.\n\nReturn 0.0 if k <= 0 or the list is empty.",
    starterCode: `def precision_at_k(relevant, k):
    # Your code here
    pass`,
    solution: `def precision_at_k(relevant, k):
    if k <= 0 or not relevant:
        return 0.0
    k = min(k, len(relevant))
    hits = sum(1 for i in range(k) if relevant[i] == 1)
    return hits / k`,
    testCases: [
      { input: [[1, 0, 1, 1, 0], 2], expected: 0.5 },
      { input: [[1, 0, 1, 1, 0], 3], expected: 0.6666666666666666 },
      { input: [[1, 0], 0], expected: 0.0 },
      { input: [[], 2], expected: 0.0 },
    ],
    hint: "Precision@k measures how many of the top k recommendations are relevant.",
  },
  {
    id: "ml-223",
    title: "NDCG at K",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Compute NDCG at k: DCG = sum rel_i / log2(i + 2) for i < k, divided by the DCG of the ideal (descending) ranking.\n\nReturn 0.0 if the ideal DCG is 0 or k <= 0.",
    starterCode: `import math
def ndcg_at_k(relevances, k):
    # Your code here
    pass`,
    solution: `import math
def ndcg_at_k(relevances, k):
    if not relevances or k <= 0:
        return 0.0
    k = min(k, len(relevances))
    dcg = sum(relevances[i] / math.log2(i + 2) for i in range(k))
    ideal = sorted(relevances, reverse=True)
    idcg = sum(ideal[i] / math.log2(i + 2) for i in range(k))
    if idcg == 0:
        return 0.0
    return dcg / idcg`,
    testCases: [
      { input: [[3, 2, 1], 3], expected: 1.0 },
      { input: [[0, 2, 1], 3], expected: 0.66967181649423 },
      { input: [[1, 0, 0], 2], expected: 1.0 },
      { input: [[0, 0, 0], 3], expected: 0.0 },
    ],
    hint: "Discounts grow logarithmically with rank; the ideal ranking sets the ceiling.",
  },
  {
    id: "ml-224",
    title: "Mean Average Precision",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute mean average precision over users. Each user has a ranked binary relevance list; AP = sum(precision@i * rel_i) / total relevant, and MAP is the mean of APs.\n\nUsers with no relevant items contribute 0.0. Empty input returns 0.0.",
    starterCode: `def mean_average_precision(ranked_relevance):
    # Your code here
    pass`,
    solution: `def mean_average_precision(ranked_relevance):
    if not ranked_relevance:
        return 0.0
    def average_precision_single(rels):
        total_rel = sum(rels)
        if total_rel == 0:
            return 0.0
        hits = 0
        total = 0.0
        for i in range(len(rels)):
            if rels[i] == 1:
                hits += 1
                total += hits / (i + 1)
        return total / total_rel
    return sum(average_precision_single(r) for r in ranked_relevance) / len(ranked_relevance)`,
    testCases: [
      { input: [[[1, 0, 1], [0, 1]]], expected: 0.6666666666666666 },
      { input: [[[0, 0], [1, 0, 1]]], expected: 0.41666666666666663 },
      { input: [[[]]], expected: 0.0 },
    ],
    hint: "Average precision rewards putting relevant items early in the ranking.",
  },
  {
    id: "ml-225",
    title: "Mean Reciprocal Rank",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute mean reciprocal rank over users: for each ranked binary list add 1 / rank of the first relevant item (0 if none), then average.\n\nEmpty input returns 0.0.",
    starterCode: `def mean_reciprocal_rank(ranked_relevance):
    # Your code here
    pass`,
    solution: `def mean_reciprocal_rank(ranked_relevance):
    if not ranked_relevance:
        return 0.0
    total = 0.0
    for row in ranked_relevance:
        for i in range(len(row)):
            if row[i] == 1:
                total += 1.0 / (i + 1)
                break
    return total / len(ranked_relevance)`,
    testCases: [
      { input: [[[0, 1, 0], [1, 0]]], expected: 0.75 },
      { input: [[[0, 0], [1]]], expected: 0.5 },
      { input: [[[0, 0], [0, 0]]], expected: 0.0 },
      { input: [[]], expected: 0.0 },
    ],
    hint: "MRR only cares about where the first relevant item appears.",
  },
];
