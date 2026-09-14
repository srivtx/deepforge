import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "st-361",
    title: "One Sample Z Statistic from Mean",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "For known standard deviation sigma, the one-sample z statistic is (xbar - mu0) / (sigma / sqrt(n)).\n\nGiven the sample mean, the hypothesized mean, sigma, and n, return the z statistic.",
    starterCode: `def one_sample_z_statistic_from_mean(xbar, mu0, sigma, n):
    # Your code here
    pass`,
    solution: `def one_sample_z_statistic_from_mean(xbar, mu0, sigma, n):
    return (xbar - mu0) / (sigma / n ** 0.5)`,
    testCases: [
      { input: [5.5, 5.0, 1.0, 25], expected: 2.5 },
      { input: [0.0, 1.0, 2.0, 4], expected: -1.0 },
      { input: [10.0, 10.0, 3.0, 9], expected: 0.0 },
    ],
    hint: "Standardize the difference by the standard error of the mean.",
  },
  {
    id: "st-362",
    title: "Two Sample Z with Known Sigma",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "For two independent samples with known standard deviations, z = (x1 - x2) / sqrt(s1^2 / n1 + s2^2 / n2).\n\nGiven the two means, standard deviations, and sample sizes, return z.",
    starterCode: `def two_sample_z_known_sigma(x1, x2, s1, n1, s2, n2):
    # Your code here
    pass`,
    solution: `def two_sample_z_known_sigma(x1, x2, s1, n1, s2, n2):
    return (x1 - x2) / (s1 * s1 / n1 + s2 * s2 / n2) ** 0.5`,
    testCases: [
      { input: [5.0, 4.0, 1.0, 25, 1.0, 25], expected: 3.5355339059327378 },
      { input: [0.0, 1.0, 2.0, 10, 3.0, 10], expected: -0.8770580193070292 },
      { input: [2.0, 2.0, 1.0, 5, 1.0, 5], expected: 0.0 },
    ],
    hint: "The denominator combines the two squared standard errors.",
  },
  {
    id: "st-363",
    title: "Standard Error of Mean Difference",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "The standard error of the difference in independent means is sqrt(s1^2 / n1 + s2^2 / n2).\n\nGiven the two standard deviations and sample sizes, return the standard error.",
    starterCode: `def standard_error_of_mean_difference(s1, n1, s2, n2):
    # Your code here
    pass`,
    solution: `def standard_error_of_mean_difference(s1, n1, s2, n2):
    return (s1 * s1 / n1 + s2 * s2 / n2) ** 0.5`,
    testCases: [
      { input: [1.0, 25, 1.0, 25], expected: 0.282842712474619 },
      { input: [2.0, 10, 3.0, 10], expected: 1.140175425099138 },
      { input: [0.0, 5, 4.0, 4], expected: 2.0 },
    ],
    hint: "Add variances of the two sample means under independence.",
  },
  {
    id: "st-364",
    title: "Pooled t Statistic Two Samples",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "The pooled two-sample t statistic uses the pooled variance sp^2 = ((n1 - 1) s1^2 + (n2 - 1) s2^2) / (n1 + n2 - 2) and computes t = (x1 - x2) / (sp * sqrt(1/n1 + 1/n2)).\n\nGiven the means, standard deviations, and sizes, return t.",
    starterCode: `def pooled_t_statistic_two_samples(x1, x2, s1, n1, s2, n2):
    # Your code here
    pass`,
    solution: `def pooled_t_statistic_two_samples(x1, x2, s1, n1, s2, n2):
    sp2 = ((n1 - 1) * s1 * s1 + (n2 - 1) * s2 * s2) / (n1 + n2 - 2)
    return (x1 - x2) / (sp2 ** 0.5 * (1.0 / n1 + 1.0 / n2) ** 0.5)`,
    testCases: [
      { input: [5.0, 4.0, 1.0, 10, 1.0, 10], expected: 2.23606797749979 },
      { input: [1.0, 0.0, 2.0, 8, 3.0, 8], expected: 0.7844645405527362 },
      { input: [2.0, 2.0, 1.5, 6, 1.5, 6], expected: 0.0 },
    ],
    hint: "Pool the variances first, then standardize by the combined standard error.",
  },
  {
    id: "st-365",
    title: "Paired Differences t Statistic",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "For paired data, t = mean(d) / (s_d / sqrt(n)) where s_d is the sample standard deviation of the differences with n - 1 in the denominator.\n\nGiven the differences, return t. Assume n >= 2.",
    starterCode: `def paired_differences_t_statistic(differences):
    # Your code here
    pass`,
    solution: `def paired_differences_t_statistic(differences):
    n = len(differences)
    mean = sum(differences) / n
    var = sum((d - mean) ** 2 for d in differences) / (n - 1)
    return mean / (var / n) ** 0.5`,
    testCases: [
      { input: [[1, 2, 3]], expected: 3.464101615137755 },
      { input: [[1, -1, 1, -1]], expected: 0.0 },
      { input: [[0.5, 1.0, 1.5]], expected: 3.464101615137755 },
    ],
    hint: "Treat the paired differences as a single one-sample problem.",
  },
  {
    id: "st-366",
    title: "Chi Square Goodness of Fit Statistic",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "The chi-square goodness-of-fit statistic is sum_i (observed_i - expected_i)^2 / expected_i.\n\nGiven the observed and expected counts, return the statistic.",
    starterCode: `def chi_square_goodness_of_fit_statistic(observed, expected):
    # Your code here
    pass`,
    solution: `def chi_square_goodness_of_fit_statistic(observed, expected):
    return sum((o - e) ** 2 / e for o, e in zip(observed, expected))`,
    testCases: [
      { input: [[10, 20], [15, 15]], expected: 3.3333333333333335 },
      { input: [[10, 10, 10], [10, 10, 10]], expected: 0.0 },
      { input: [[30, 10], [20, 20]], expected: 10.0 },
    ],
    hint: "Each squared deviation is scaled by the expected count.",
  },
  {
    id: "st-367",
    title: "Chi Square Expected Cell Count",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "For a contingency table under independence, the expected count of a cell is row_total * col_total / grand_total.\n\nGiven the row total, the column total, and the grand total, return the expected count.",
    starterCode: `def chi_square_expected_cell_count(row_total, col_total, grand_total):
    # Your code here
    pass`,
    solution: `def chi_square_expected_cell_count(row_total, col_total, grand_total):
    return row_total * col_total / grand_total`,
    testCases: [
      { input: [30, 50, 100], expected: 15.0 },
      { input: [10, 20, 200], expected: 1.0 },
      { input: [45, 90, 300], expected: 13.5 },
    ],
    hint: "The margins determine the expected joint count.",
  },
  {
    id: "st-368",
    title: "Chi Square Table Degrees of Freedom",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "The degrees of freedom for a contingency table chi-square test of independence is (rows - 1)(columns - 1).\n\nGiven the number of rows and columns, return the degrees of freedom.",
    starterCode: `def chi_square_table_degrees_of_freedom(rows, cols):
    # Your code here
    pass`,
    solution: `def chi_square_table_degrees_of_freedom(rows, cols):
    return (rows - 1) * (cols - 1)`,
    testCases: [
      { input: [2, 2], expected: 1 },
      { input: [3, 4], expected: 6 },
      { input: [5, 2], expected: 4 },
    ],
    hint: "One degree is lost for each margin.",
  },
  {
    id: "st-369",
    title: "F Statistic Ratio of Variances",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "The F statistic for comparing two variances is the larger sample variance divided by the smaller under the two-sided test convention used here: s1^2 / s2^2.\n\nGiven the two sample variances, return the ratio.",
    starterCode: `def f_statistic_ratio_of_variances(s1_sq, s2_sq):
    # Your code here
    pass`,
    solution: `def f_statistic_ratio_of_variances(s1_sq, s2_sq):
    return s1_sq / s2_sq`,
    testCases: [
      { input: [4.0, 1.0], expected: 4.0 },
      { input: [1.0, 1.0], expected: 1.0 },
      { input: [9.0, 3.0], expected: 3.0 },
    ],
    hint: "Variance ratios follow an F distribution under normality.",
  },
  {
    id: "st-370",
    title: "One Way ANOVA F Statistic",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "For k groups with n_i observations and grand mean xbar, compute SSB = sum_i n_i (mean_i - xbar)^2 and SSW = sum_i sum_j (x_ij - mean_i)^2, then F = (SSB / (k - 1)) / (SSW / (N - k)) where N is the total count.\n\nGiven the list of groups (each a list of values), return F.",
    starterCode: `def one_way_anova_f_statistic(groups):
    # Your code here
    pass`,
    solution: `def one_way_anova_f_statistic(groups):
    k = len(groups)
    n_total = sum(len(g) for g in groups)
    grand = sum(sum(g) for g in groups) / n_total
    ssb = sum(len(g) * (sum(g) / len(g) - grand) ** 2 for g in groups)
    ssw = sum(sum((v - sum(g) / len(g)) ** 2 for v in g) for g in groups)
    return (ssb / (k - 1)) / (ssw / (n_total - k))`,
    testCases: [
      { input: [[[1, 2, 3], [4, 5, 6]]], expected: 13.5 },
      { input: [[[0, 1], [2, 3]]], expected: 8.0 },
      { input: [[[1, 2], [3, 4], [5, 6]]], expected: 16.0 },
    ],
    hint: "Between-group mean square over within-group mean square.",
  },
  {
    id: "st-371",
    title: "ANOVA Degrees of Freedom Pair",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "In one-way ANOVA the between-groups degrees of freedom is k - 1 and the within-groups degrees of freedom is N - k for k groups and N total observations.\n\nGiven k and N, return [df_between, df_within].",
    starterCode: `def anova_degrees_of_freedom_pair(k, n_total):
    # Your code here
    pass`,
    solution: `def anova_degrees_of_freedom_pair(k, n_total):
    return [k - 1, n_total - k]`,
    testCases: [
      { input: [3, 30], expected: [2, 27] },
      { input: [2, 20], expected: [1, 18] },
      { input: [5, 50], expected: [4, 45] },
    ],
    hint: "Between uses groups, within uses observations minus groups.",
  },
  {
    id: "st-372",
    title: "Bonferroni Adjusted Alpha",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "The Bonferroni correction divides the family-wise alpha by the number of tests m.\n\nGiven alpha and m > 0, return the adjusted per-test alpha.",
    starterCode: `def bonferroni_adjusted_alpha(alpha, m):
    # Your code here
    pass`,
    solution: `def bonferroni_adjusted_alpha(alpha, m):
    return alpha / m`,
    testCases: [
      { input: [0.05, 10], expected: 0.005 },
      { input: [0.01, 5], expected: 0.002 },
      { input: [0.1, 1], expected: 0.1 },
    ],
    hint: "It controls the family-wise error rate conservatively.",
  },
  {
    id: "st-373",
    title: "Benjamini Hochberg Rank Threshold",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "In the Benjamini-Hochberg procedure the threshold for the p-value at rank i (1-based, sorted ascending) is i * alpha / m.\n\nGiven the rank, alpha, and the number of tests m, return the threshold.",
    starterCode: `def benjamini_hochberg_rank_threshold(rank, alpha, m):
    # Your code here
    pass`,
    solution: `def benjamini_hochberg_rank_threshold(rank, alpha, m):
    return rank * alpha / m`,
    testCases: [
      { input: [1, 0.05, 10], expected: 0.005 },
      { input: [5, 0.05, 10], expected: 0.025 },
      { input: [10, 0.1, 10], expected: 0.1 },
    ],
    hint: "The threshold grows linearly with the rank.",
  },
  {
    id: "st-374",
    title: "Holm Step Adjusted P Value",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "The Holm-adjusted p-value at rank i of the sorted p-values is the running maximum max_{j <= i} (m - j + 1) * p_(j), capped at 1.\n\nGiven the sorted p-values (ascending) and the rank i (1-based), return the adjusted value.",
    starterCode: `def holm_step_adjusted_p_value(sorted_pvalues, rank):
    # Your code here
    pass`,
    solution: `def holm_step_adjusted_p_value(sorted_pvalues, rank):
    m = len(sorted_pvalues)
    best = 0.0
    for j in range(1, rank + 1):
        value = (m - j + 1) * sorted_pvalues[j - 1]
        if value > best:
            best = value
    return min(1.0, best)`,
    testCases: [
      { input: [[0.001, 0.01, 0.02, 0.5], 2], expected: 0.03 },
      { input: [[0.001, 0.01, 0.02, 0.5], 4], expected: 0.5 },
      { input: [[0.01, 0.04, 0.6], 2], expected: 0.08 },
    ],
    hint: "Enforce monotonicity with a running maximum.",
  },
  {
    id: "st-375",
    title: "Power from Effect Size",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "For a one-sided z-test, the power is Phi(delta * sqrt(n) - z_alpha) where delta is the standardized effect size. Use the normal CDF implementation Phi(x) = 0.5 (1 + erf(x / sqrt(2))).\n\nGiven delta, n, and the critical z_alpha, return [power, beta] where beta = 1 - power.",
    starterCode: `def power_from_effect_size(delta, n, z_alpha):
    # Your code here
    pass`,
    solution: `def power_from_effect_size(delta, n, z_alpha):
    import math
    z_power = delta * n ** 0.5 - z_alpha
    power = 0.5 * (1.0 + math.erf(z_power / math.sqrt(2.0)))
    return [power, 1.0 - power]`,
    testCases: [
      { input: [0.5, 25, 1.645], expected: [0.8037244261254556, 0.19627557387454442] },
      { input: [0.2, 100, 1.96], expected: [0.5159534368528308, 0.4840465631471692] },
      { input: [0.0, 30, 1.645], expected: [0.04998490553912138, 0.9500150944608786] },
    ],
    hint: "Shift the critical value by the noncentrality delta * sqrt(n).",
  },
  {
    id: "st-376",
    title: "Required Sample Size Per Group",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "For a two-sided test the required sample size per group is ceil(((z_alpha + z_beta) / delta)^2), where delta is the standardized effect size.\n\nGiven z_alpha, z_beta, and delta > 0, return the integer sample size.",
    starterCode: `def required_sample_size_per_group(z_alpha, z_beta, delta):
    # Your code here
    pass`,
    solution: `def required_sample_size_per_group(z_alpha, z_beta, delta):
    import math
    return math.ceil(((z_alpha + z_beta) / delta) ** 2)`,
    testCases: [
      { input: [1.96, 0.84, 0.5], expected: 32 },
      { input: [1.645, 0.84, 0.2], expected: 155 },
      { input: [2.576, 1.28, 0.8], expected: 24 },
    ],
    hint: "Scale by the effect size and round up.",
  },
  {
    id: "st-377",
    title: "Hedges Correction Factor",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Hedges' small-sample correction multiplies the standardized mean difference by J = 1 - 3 / (4 (n1 + n2) - 9).\n\nGiven the two sample sizes, return J.",
    starterCode: `def hedges_correction_factor(n1, n2):
    # Your code here
    pass`,
    solution: `def hedges_correction_factor(n1, n2):
    return 1.0 - 3.0 / (4.0 * (n1 + n2) - 9.0)`,
    testCases: [
      { input: [10, 10], expected: 0.9577464788732395 },
      { input: [5, 5], expected: 0.9032258064516129 },
      { input: [100, 100], expected: 0.9962073324905183 },
    ],
    hint: "The correction approaches one for large samples.",
  },
  {
    id: "st-378",
    title: "Relative Risk from Counts",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "For a 2x2 table with cells a, b (exposed: events, nonevents) and c, d (unexposed), the relative risk is (a / (a + b)) / (c / (c + d)).\n\nGiven the four counts, return the relative risk.",
    starterCode: `def relative_risk_from_counts(a, b, c, d):
    # Your code here
    pass`,
    solution: `def relative_risk_from_counts(a, b, c, d):
    return (a / (a + b)) / (c / (c + d))`,
    testCases: [
      { input: [10, 90, 5, 95], expected: 2.0 },
      { input: [20, 30, 20, 30], expected: 1.0 },
      { input: [1, 9, 2, 8], expected: 0.5 },
    ],
    hint: "Compare the two event rates.",
  },
  {
    id: "st-379",
    title: "Odds Ratio from Cell Counts",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "The sample odds ratio for a 2x2 table is (a * d) / (b * c) with a, b the exposed outcomes and c, d the unexposed outcomes.\n\nGiven the four counts, return the odds ratio.",
    starterCode: `def odds_ratio_from_cell_counts(a, b, c, d):
    # Your code here
    pass`,
    solution: `def odds_ratio_from_cell_counts(a, b, c, d):
    return (a * d) / (b * c)`,
    testCases: [
      { input: [10, 90, 5, 95], expected: 2.111111111111111 },
      { input: [20, 30, 20, 30], expected: 1.0 },
      { input: [15, 5, 5, 15], expected: 9.0 },
    ],
    hint: "Cross-multiply the diagonal cells.",
  },
  {
    id: "st-380",
    title: "Number Needed to Treat Point",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "The number needed to treat is the reciprocal of the absolute risk difference: 1 / |risk_treated - risk_control|.\n\nGiven the two risks (not equal), return the number needed to treat.",
    starterCode: `def number_needed_to_treat_point(risk_treated, risk_control):
    # Your code here
    pass`,
    solution: `def number_needed_to_treat_point(risk_treated, risk_control):
    return 1.0 / abs(risk_treated - risk_control)`,
    testCases: [
      { input: [0.1, 0.2], expected: 10.0 },
      { input: [0.05, 0.1], expected: 20.0 },
      { input: [0.3, 0.25], expected: 20.000000000000004 },
    ],
    hint: "Take the absolute difference so the direction of benefit does not matter.",
  },
];
