import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "st-051",
    title: "One-Proportion z-Statistic",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the one-proportion z-statistic (p_hat - p0) / sqrt(p0*(1-p0)/n), where p_hat = successes/n. Return 0.0 when n <= 0 or p0 is not strictly between 0 and 1.",
    starterCode: `def one_proportion_z(successes, n, p0):
    # Your code here
    pass`,
    solution: `def one_proportion_z(successes, n, p0):
    if n <= 0 or p0 <= 0 or p0 >= 1:
        return 0.0
    p_hat = successes / n
    se = (p0 * (1.0 - p0) / n) ** 0.5
    return (p_hat - p0) / se`,
    testCases: [
      { input: [45, 100, 0.5], expected: -0.9999999999999998 },
      { input: [60, 100, 0.5], expected: 1.9999999999999996 },
      { input: [10, 50, 0.2], expected: 0.0 },
      { input: [0, 0, 0.5], expected: 0.0 },
      { input: [5, 10, 0.9], expected: -4.216370213557839 },
    ],
    hint: "The standard error uses the hypothesized proportion p0, not p_hat.",
  },
  {
    id: "st-052",
    title: "Confidence Interval for Mean (Known Sigma)",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the confidence interval [mean - z*sigma/sqrt(n), mean + z*sigma/sqrt(n)] for the mean with known sigma. Return [0.0, 0.0] for empty data.",
    starterCode: `def ci_mean_known_sigma(data, sigma, z_crit):
    # Your code here
    pass`,
    solution: `def ci_mean_known_sigma(data, sigma, z_crit):
    n = len(data)
    if n == 0:
        return [0.0, 0.0]
    m = sum(data) / n
    half = z_crit * sigma / (n ** 0.5)
    return [m - half, m + half]`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 2, 1.96], expected: [1.246922705640165, 4.753077294359835] },
      { input: [[10], 1, 1.0], expected: [9.0, 11.0] },
      { input: [[], 1, 1.0], expected: [0.0, 0.0] },
      { input: [[2, 4], 0, 1.96], expected: [3.0, 3.0] },
      { input: [[0, 0, 0, 0], 5, 2.0], expected: [-5.0, 5.0] },
    ],
    hint: "Center the interval on the sample mean and add/subtract the margin of error.",
  },
  {
    id: "st-053",
    title: "Margin of Error",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the margin of error z * sigma / sqrt(n) for a mean with known sigma. Return 0.0 when n <= 0.",
    starterCode: `def margin_of_error(z_crit, sigma, n):
    # Your code here
    pass`,
    solution: `def margin_of_error(z_crit, sigma, n):
    if n <= 0:
        return 0.0
    return z_crit * sigma / (n ** 0.5)`,
    testCases: [
      { input: [1.96, 2, 100], expected: 0.392 },
      { input: [1.645, 10, 25], expected: 3.29 },
      { input: [2.0, 0, 10], expected: 0.0 },
      { input: [1.96, 5, 0], expected: 0.0 },
      { input: [1.0, 1, 1], expected: 1.0 },
    ],
    hint: "It is the half-width of the confidence interval.",
  },
  {
    id: "st-054",
    title: "Required Sample Size for Mean",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the smallest integer n with z*sigma/sqrt(n) <= margin, which is ceil((z*sigma/margin)^2). Return 0 if margin <= 0 or sigma <= 0.",
    starterCode: `import math
def required_sample_size_mean(z_crit, sigma, margin):
    # Your code here
    pass`,
    solution: `import math
def required_sample_size_mean(z_crit, sigma, margin):
    if margin <= 0 or sigma <= 0:
        return 0
    return int(math.ceil((z_crit * sigma / margin) ** 2))`,
    testCases: [
      { input: [1.96, 2, 0.5], expected: 62 },
      { input: [1.645, 10, 1.0], expected: 271 },
      { input: [2.0, 1.0, 1.0], expected: 4 },
      { input: [1.96, 0.0, 0.5], expected: 0 },
      { input: [1.96, 2.0, 0.0], expected: 0 },
    ],
    hint: "Solve the margin-of-error inequality for n and round up.",
  },
  {
    id: "st-055",
    title: "Family-Wise Error Rate",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the family-wise error rate 1 - (1-alpha)^m for m independent tests at level alpha. Return 0.0 when m <= 0 or alpha <= 0, and 1.0 when alpha >= 1.",
    starterCode: `def family_wise_error_rate(alpha, m):
    # Your code here
    pass`,
    solution: `def family_wise_error_rate(alpha, m):
    if m <= 0 or alpha <= 0:
        return 0.0
    if alpha >= 1:
        return 1.0
    return 1.0 - (1.0 - alpha) ** m`,
    testCases: [
      { input: [0.05, 10], expected: 0.4012630607616213 },
      { input: [0.01, 5], expected: 0.04900995010000009 },
      { input: [0.05, 1], expected: 0.050000000000000044 },
      { input: [0.05, 0], expected: 0.0 },
      { input: [0.0, 5], expected: 0.0 },
    ],
    hint: "The chance of at least one false positive is the complement of all tests being clean.",
  },
  {
    id: "st-056",
    title: "Bonferroni Threshold",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the Bonferroni-corrected significance threshold alpha/m for m tests. Return 0.0 when m <= 0.",
    starterCode: `def bonferroni_threshold(alpha, m):
    # Your code here
    pass`,
    solution: `def bonferroni_threshold(alpha, m):
    if m <= 0:
        return 0.0
    return alpha / m`,
    testCases: [
      { input: [0.05, 10], expected: 0.005 },
      { input: [0.01, 5], expected: 0.002 },
      { input: [0.05, 1], expected: 0.05 },
      { input: [0.05, 0], expected: 0.0 },
      { input: [0.1, 4], expected: 0.025 },
    ],
    hint: "Divide the family-wise level by the number of tests.",
  },
  {
    id: "st-057",
    title: "Durbin-Watson Statistic",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the Durbin-Watson statistic sum((e_i - e_(i-1))^2) / sum(e_i^2) for a list of residuals. Return 0.0 when fewer than two residuals are given or all residuals are zero.",
    starterCode: `def durbin_watson(residuals):
    # Your code here
    pass`,
    solution: `def durbin_watson(residuals):
    n = len(residuals)
    if n < 2:
        return 0.0
    denom = sum(e * e for e in residuals)
    if denom == 0:
        return 0.0
    num = sum((residuals[i] - residuals[i - 1]) ** 2 for i in range(1, n))
    return num / denom`,
    testCases: [
      { input: [[1, 1, 1, 1]], expected: 0.0 },
      { input: [[1, -1, 1, -1]], expected: 3.0 },
      { input: [[1, 2, 1, 2]], expected: 0.3 },
      { input: [[0, 0, 0]], expected: 0.0 },
      { input: [[2]], expected: 0.0 },
    ],
    hint: "Values near 2 indicate no autocorrelation; values near 0 indicate positive autocorrelation.",
  },
  {
    id: "st-058",
    title: "VIF from R-Squared",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the variance inflation factor 1 / (1 - R^2) for a predictor regressed on the other predictors. Return 0.0 when R^2 is outside [0, 1).",
    starterCode: `def vif_from_r2(r2):
    # Your code here
    pass`,
    solution: `def vif_from_r2(r2):
    if r2 < 0 or r2 >= 1:
        return 0.0
    return 1.0 / (1.0 - r2)`,
    testCases: [
      { input: [0.5], expected: 2.0 },
      { input: [0.8], expected: 5.000000000000001 },
      { input: [0.0], expected: 1.0 },
      { input: [1.0], expected: 0.0 },
      { input: [0.9], expected: 10.000000000000002 },
    ],
    hint: "The denominator is the leftover variance fraction.",
  },
  {
    id: "st-059",
    title: "Adjusted R-Squared from Summary Statistics",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the adjusted R-squared 1 - (1 - R^2)*(n - 1)/(n - p - 1), where p is the number of predictors. Return 0.0 when n - p - 1 <= 0.",
    starterCode: `def adjusted_r_squared(r2, n, p):
    # Your code here
    pass`,
    solution: `def adjusted_r_squared(r2, n, p):
    if n - p - 1 <= 0:
        return 0.0
    return 1.0 - (1.0 - r2) * (n - 1) / (n - p - 1)`,
    testCases: [
      { input: [0.8, 100, 2], expected: 0.7958762886597939 },
      { input: [0.5, 10, 1], expected: 0.4375 },
      { input: [0.9, 20, 5], expected: 0.8642857142857143 },
      { input: [0.5, 3, 2], expected: 0.0 },
      { input: [0.6, 5, 3], expected: -0.6000000000000001 },
    ],
    hint: "The adjustment penalizes each additional predictor.",
  },
  {
    id: "st-060",
    title: "AIC Difference",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return AIC2 - AIC1, where AIC = -2*log_likelihood + 2*k for each model. Negative values favor the second model.",
    starterCode: `def aic_difference(ll1, k1, ll2, k2):
    # Your code here
    pass`,
    solution: `def aic_difference(ll1, k1, ll2, k2):
    aic1 = -2.0 * ll1 + 2.0 * k1
    aic2 = -2.0 * ll2 + 2.0 * k2
    return aic2 - aic1`,
    testCases: [
      { input: [-100, 2, -110, 5], expected: 26.0 },
      { input: [-50, 1, -50, 1], expected: 0.0 },
      { input: [-10, 3, -12, 2], expected: 2.0 },
      { input: [-200, 10, -180, 10], expected: -40.0 },
      { input: [-5, 0, -6, 0], expected: 2.0 },
    ],
    hint: "Compute each AIC, then subtract.",
  },
  {
    id: "st-061",
    title: "BIC Difference",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return BIC2 - BIC1, where BIC = -2*log_likelihood + k*ln(n). Return 0.0 when n <= 0. Negative values favor the second model.",
    starterCode: `import math
def bic_difference(ll1, k1, ll2, k2, n):
    # Your code here
    pass`,
    solution: `import math
def bic_difference(ll1, k1, ll2, k2, n):
    if n <= 0:
        return 0.0
    bic1 = -2.0 * ll1 + k1 * math.log(n)
    bic2 = -2.0 * ll2 + k2 * math.log(n)
    return bic2 - bic1`,
    testCases: [
      { input: [-100, 2, -110, 5, 100], expected: 33.8155105579643 },
      { input: [-50, 1, -50, 1, 10], expected: 0.0 },
      { input: [-10, 3, -12, 2, 50], expected: 0.0879769945718536 },
      { input: [-200, 10, -180, 10, 1000], expected: -40.0 },
      { input: [-5, 0, -6, 0, 5], expected: 2.0 },
    ],
    hint: "The penalty k*ln(n) grows with the sample size.",
  },
  {
    id: "st-062",
    title: "Likelihood Ratio Statistic",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the likelihood ratio statistic 2*(log_lik_full - log_lik_reduced). The statistic is non-negative when the full model contains the reduced model.",
    starterCode: `def likelihood_ratio_statistic(ll_full, ll_reduced):
    # Your code here
    pass`,
    solution: `def likelihood_ratio_statistic(ll_full, ll_reduced):
    return 2.0 * (ll_full - ll_reduced)`,
    testCases: [
      { input: [-100, -110], expected: 20.0 },
      { input: [-50, -50], expected: 0.0 },
      { input: [-10, -12], expected: 4.0 },
      { input: [-180, -200], expected: 40.0 },
      { input: [-5, -6], expected: 2.0 },
    ],
    hint: "The statistic compares maximized log-likelihoods.",
  },
  {
    id: "st-063",
    title: "Wald Statistic",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the Wald statistic (theta_hat - theta0)^2 / se^2. Return 0.0 when se <= 0.",
    starterCode: `def wald_statistic(theta_hat, theta0, se):
    # Your code here
    pass`,
    solution: `def wald_statistic(theta_hat, theta0, se):
    if se <= 0:
        return 0.0
    return (theta_hat - theta0) ** 2 / (se ** 2)`,
    testCases: [
      { input: [1.5, 0, 0.5], expected: 9.0 },
      { input: [10, 8, 1], expected: 4.0 },
      { input: [0, 0, 1], expected: 0.0 },
      { input: [2, 1, 2], expected: 0.25 },
      { input: [1, 0, 0], expected: 0.0 },
    ],
    hint: "It is the squared standardized distance from the null value.",
  },
  {
    id: "st-064",
    title: "p-Value from z (One-Sided)",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the one-sided upper-tail p-value 1 - Phi(z) = 0.5*(1 - erf(z/sqrt(2))) for a standard normal test statistic. Large positive z gives a small p-value.",
    starterCode: `import math
def p_value_z_one_sided(z):
    # Your code here
    pass`,
    solution: `import math
def p_value_z_one_sided(z):
    return 0.5 * (1.0 - math.erf(z / (2 ** 0.5)))`,
    testCases: [
      { input: [0.0], expected: 0.5 },
      { input: [1.96], expected: 0.024997895148220428 },
      { input: [-1.645], expected: 0.9500150944608786 },
      { input: [2.326], expected: 0.010009275340867707 },
      { input: [3.0], expected: 0.0013498980316301035 },
    ],
    hint: "Use math.erf for the normal CDF.",
  },
  {
    id: "st-065",
    title: "Heteroscedasticity Ratio",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Split data into two halves at n//2 and return the ratio max(var1, var2) / min(var1, var2) of the population variances. Return 0.0 when n < 4 or the smaller variance is zero.",
    starterCode: `def heteroscedasticity_ratio(data):
    # Your code here
    pass`,
    solution: `def heteroscedasticity_ratio(data):
    n = len(data)
    if n < 4:
        return 0.0
    half = n // 2
    a = data[:half]
    b = data[half:]
    ma = sum(a) / len(a)
    mb = sum(b) / len(b)
    va = sum((v - ma) ** 2 for v in a) / len(a)
    vb = sum((v - mb) ** 2 for v in b) / len(b)
    lo = min(va, vb)
    hi = max(va, vb)
    if lo == 0:
        return 0.0
    return hi / lo`,
    testCases: [
      { input: [[1, 2, 1, 10, 20, 10]], expected: 99.99999999999999 },
      { input: [[1, 2, 3, 10, 20, 30]], expected: 100.00000000000001 },
      { input: [[5, 5, 5, 5]], expected: 0.0 },
      { input: [[1, 3, 1, 5, 7, 5]], expected: 1.0 },
      { input: [[2, 4, 2, 4]], expected: 1.0 },
    ],
    hint: "The ratio is 1 for equal spread and grows with unequal spread.",
  },
  {
    id: "st-066",
    title: "Type I and Type II Error Rates from Counts",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return [alpha, beta] from counts: alpha = fp/(fp+tn) is the false positive rate and beta = fn/(fn+tp) is the false negative rate. Return 0.0 for a ratio whose denominator is zero.",
    starterCode: `def type_error_rates(tp, fp, fn, tn):
    # Your code here
    pass`,
    solution: `def type_error_rates(tp, fp, fn, tn):
    alpha = fp / (fp + tn) if fp + tn > 0 else 0.0
    beta = fn / (fn + tp) if fn + tp > 0 else 0.0
    return [alpha, beta]`,
    testCases: [
      { input: [90, 10, 10, 90], expected: [0.1, 0.1] },
      { input: [50, 0, 5, 45], expected: [0.0, 0.09090909090909091] },
      { input: [40, 10, 0, 50], expected: [0.16666666666666666, 0.0] },
      { input: [0, 0, 0, 0], expected: [0.0, 0.0] },
      { input: [80, 20, 20, 80], expected: [0.2, 0.2] },
    ],
    hint: "Alpha conditions on the true negatives and beta on the true positives.",
  },
  {
    id: "st-067",
    title: "Two-Sample Pooled t-Statistic",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the pooled two-sample t-statistic (mean_x - mean_y) / (sp*sqrt(1/nx + 1/ny)), where sp^2 = ((nx-1)sx^2 + (ny-1)sy^2)/(nx+ny-2). Return 0.0 when either sample has fewer than two values or the standard error is zero.",
    starterCode: `def pooled_t_statistic(x, y):
    # Your code here
    pass`,
    solution: `def pooled_t_statistic(x, y):
    n1 = len(x)
    n2 = len(y)
    if n1 < 2 or n2 < 2:
        return 0.0
    m1 = sum(x) / n1
    m2 = sum(y) / n2
    ss1 = sum((v - m1) ** 2 for v in x)
    ss2 = sum((v - m2) ** 2 for v in y)
    sp2 = (ss1 + ss2) / (n1 + n2 - 2)
    se2 = sp2 * (1.0 / n1 + 1.0 / n2)
    if se2 <= 0:
        return 0.0
    return (m1 - m2) / (se2 ** 0.5)`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], [2, 4, 6, 8, 10]], expected: -1.8973665961010275 },
      { input: [[1, 2, 3], [4, 5, 6]], expected: -3.6742346141747673 },
      { input: [[1, 1, 1], [2, 2, 2]], expected: 0.0 },
      { input: [[10, 12, 14], [9, 11, 13]], expected: 0.6123724356957945 },
      { input: [[1], [2, 3]], expected: 0.0 },
    ],
    hint: "Pool the sums of squares first and divide by nx + ny - 2.",
  },
  {
    id: "st-068",
    title: "Paired t-Statistic",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the paired t-statistic mean(d) / (sd(d)/sqrt(n)) for differences d_i = x_i - y_i, using the sample standard deviation. Return 0.0 when n < 2, the lengths differ, or the differences are constant.",
    starterCode: `def paired_t_statistic(x, y):
    # Your code here
    pass`,
    solution: `def paired_t_statistic(x, y):
    n = len(x)
    if n < 2 or len(y) != n:
        return 0.0
    d = [x[i] - y[i] for i in range(n)]
    md = sum(d) / n
    s2 = sum((v - md) ** 2 for v in d) / (n - 1)
    if s2 <= 0:
        return 0.0
    se = (s2 / n) ** 0.5
    return md / se`,
    testCases: [
      { input: [[1, 2, 3], [0, 1, 2]], expected: 0.0 },
      { input: [[5, 7, 9], [2, 3, 4]], expected: 6.92820323027551 },
      { input: [[10, 12, 14, 16], [8, 11, 12, 15]], expected: 5.196152422706632 },
      { input: [[1, 2], [1, 2]], expected: 0.0 },
      { input: [[3], [1]], expected: 0.0 },
    ],
    hint: "Reduce the paired data to a single list of differences and run a one-sample t-test.",
  },
  {
    id: "st-069",
    title: "Two-Proportion z-Statistic",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the two-proportion z-statistic (p1 - p2) / sqrt(p_pool*(1-p_pool)*(1/n1 + 1/n2)) with p_pool = (x1+x2)/(n1+n2). Return 0.0 when a sample size is not positive or the pooled proportion is 0 or 1.",
    starterCode: `def two_proportion_z(x1, n1, x2, n2):
    # Your code here
    pass`,
    solution: `def two_proportion_z(x1, n1, x2, n2):
    if n1 <= 0 or n2 <= 0:
        return 0.0
    p1 = x1 / n1
    p2 = x2 / n2
    p_pool = (x1 + x2) / (n1 + n2)
    se2 = p_pool * (1.0 - p_pool) * (1.0 / n1 + 1.0 / n2)
    if se2 <= 0:
        return 0.0
    return (p1 - p2) / (se2 ** 0.5)`,
    testCases: [
      { input: [30, 100, 20, 100], expected: 1.6329931618554518 },
      { input: [50, 100, 50, 100], expected: 0.0 },
      { input: [10, 50, 5, 50], expected: 1.4002800840280096 },
      { input: [0, 10, 0, 10], expected: 0.0 },
      { input: [10, 10, 0, 10], expected: 4.47213595499958 },
    ],
    hint: "The standard error always uses the pooled proportion under the null.",
  },
  {
    id: "st-070",
    title: "Chi-Square Independence 2x2 with Yates Correction",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the Yates-corrected chi-square statistic for a 2x2 table: sum((max(0, |o - e| - 0.5))^2 / e) with e = row_total*col_total/total. Return 0.0 when the shape is not 2x2, the total is zero, or any expected count is zero.",
    starterCode: `def chi_square_yates(observed):
    # Your code here
    pass`,
    solution: `def chi_square_yates(observed):
    if len(observed) != 2 or len(observed[0]) != 2 or len(observed[1]) != 2:
        return 0.0
    total = sum(sum(row) for row in observed)
    if total == 0:
        return 0.0
    row_totals = [sum(row) for row in observed]
    col_totals = [sum(observed[i][j] for i in range(2)) for j in range(2)]
    stat = 0.0
    for i in range(2):
        for j in range(2):
            e = row_totals[i] * col_totals[j] / total
            if e == 0:
                return 0.0
            diff = abs(observed[i][j] - e) - 0.5
            if diff < 0:
                diff = 0.0
            stat += diff * diff / e
    return stat`,
    testCases: [
      { input: [[[10, 20], [30, 40]]], expected: 0.4464285714285714 },
      { input: [[[5, 5], [5, 5]]], expected: 0.0 },
      { input: [[[10, 0], [0, 10]]], expected: 16.2 },
      { input: [[[1, 2], [3, 4]]], expected: 0.0 },
      { input: [[[1, 2, 3], [3, 2, 1]]], expected: 0.0 },
    ],
    hint: "Subtract 0.5 from each absolute deviation before squaring.",
  },
  {
    id: "st-071",
    title: "Expected Counts Table",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the table of expected counts for a 2D table of observed counts, where e_ij = row_total_i * col_total_j / total. Return [] for an empty table and a table of zeros when the total is zero.",
    starterCode: `def expected_counts(observed):
    # Your code here
    pass`,
    solution: `def expected_counts(observed):
    rows = len(observed)
    if rows == 0:
        return []
    cols = len(observed[0])
    if cols == 0:
        return [[] for _ in range(rows)]
    total = sum(sum(row) for row in observed)
    row_totals = [sum(row) for row in observed]
    col_totals = [sum(observed[i][j] for i in range(rows)) for j in range(cols)]
    if total == 0:
        return [[0.0] * cols for _ in range(rows)]
    return [[row_totals[i] * col_totals[j] / total for j in range(cols)] for i in range(rows)]`,
    testCases: [
      { input: [[[10, 20], [30, 40]]], expected: [[12.0, 18.0], [28.0, 42.0]] },
      { input: [[[1, 2, 3], [3, 2, 1]]], expected: [[2.0, 2.0, 2.0], [2.0, 2.0, 2.0]] },
      { input: [[[10, 0], [0, 10]]], expected: [[5.0, 5.0], [5.0, 5.0]] },
      { input: [[[0, 0], [0, 0]]], expected: [[0.0, 0.0], [0.0, 0.0]] },
      { input: [[[20, 30, 50]]], expected: [[20.0, 30.0, 50.0]] },
    ],
    hint: "Compute the row totals and column totals once, then divide their products by the grand total.",
  },
  {
    id: "st-072",
    title: "McNemar Statistic",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the McNemar statistic (b - c)^2 / (b + c) for a paired 2x2 table, where b and c are the two discordant cell counts. Return 0.0 when b + c is zero.",
    starterCode: `def mcnemar_statistic(b, c):
    # Your code here
    pass`,
    solution: `def mcnemar_statistic(b, c):
    s = b + c
    if s == 0:
        return 0.0
    return (b - c) ** 2 / s`,
    testCases: [
      { input: [10, 2], expected: 5.333333333333333 },
      { input: [5, 5], expected: 0.0 },
      { input: [0, 5], expected: 5.0 },
      { input: [0, 0], expected: 0.0 },
      { input: [20, 8], expected: 5.142857142857143 },
    ],
    hint: "Only the off-diagonal cells matter.",
  },
  {
    id: "st-073",
    title: "ANOVA Between-Group Sum of Squares",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the between-group sum of squares sum(n_j * (mean_j - grand_mean)^2) for a list of groups. Return 0.0 when there are no values.",
    starterCode: `def anova_between_ss(groups):
    # Your code here
    pass`,
    solution: `def anova_between_ss(groups):
    total_n = sum(len(g) for g in groups)
    if total_n == 0:
        return 0.0
    grand = sum(sum(g) for g in groups) / total_n
    stat = 0.0
    for g in groups:
        if g:
            m = sum(g) / len(g)
            stat += len(g) * (m - grand) ** 2
    return stat`,
    testCases: [
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: 54.0 },
      { input: [[[5, 5], [5, 5]]], expected: 0.0 },
      { input: [[[1], [2], [3]]], expected: 2.0 },
      { input: [[[10, 20], [30, 40]]], expected: 400.0 },
      { input: [[]], expected: 0.0 },
    ],
    hint: "Each group mean is weighted by its size.",
  },
  {
    id: "st-074",
    title: "ANOVA Within-Group Sum of Squares",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the within-group sum of squares sum over groups of sum((x - group_mean)^2) for a list of groups. Return 0.0 when there are no values.",
    starterCode: `def anova_within_ss(groups):
    # Your code here
    pass`,
    solution: `def anova_within_ss(groups):
    stat = 0.0
    for g in groups:
        if g:
            m = sum(g) / len(g)
            stat += sum((v - m) ** 2 for v in g)
    return stat`,
    testCases: [
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: 6.0 },
      { input: [[[5, 5], [5, 5]]], expected: 0.0 },
      { input: [[[1], [2], [3]]], expected: 0.0 },
      { input: [[[10, 20], [30, 40]]], expected: 100.0 },
      { input: [[]], expected: 0.0 },
    ],
    hint: "Sum the squared deviations from each group's own mean.",
  },
  {
    id: "st-075",
    title: "F Statistic from Groups",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the one-way ANOVA F statistic (SSB/(k-1)) / (SSW/(N-k)) for a list of groups. Return 0.0 when there are fewer than two groups, N <= k, or SSW is zero.",
    starterCode: `def f_statistic(groups):
    # Your code here
    pass`,
    solution: `def f_statistic(groups):
    k = len(groups)
    total_n = sum(len(g) for g in groups)
    if k < 2 or total_n <= k:
        return 0.0
    grand = sum(sum(g) for g in groups) / total_n
    ssb = 0.0
    ssw = 0.0
    for g in groups:
        if g:
            m = sum(g) / len(g)
            ssb += len(g) * (m - grand) ** 2
            ssw += sum((v - m) ** 2 for v in g)
    if ssw == 0:
        return 0.0
    return (ssb / (k - 1)) / (ssw / (total_n - k))`,
    testCases: [
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: 27.0 },
      { input: [[[5, 5], [5, 5]]], expected: 0.0 },
      { input: [[[1, 2], [3, 4], [5, 6]]], expected: 16.0 },
      { input: [[[1], [2]]], expected: 0.0 },
      { input: [[[10, 12, 14], [10, 12, 14]]], expected: 0.0 },
    ],
    hint: "Divide the mean between-group square by the mean within-group square.",
  },
  {
    id: "st-076",
    title: "Eta Squared",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return eta squared SSB / (SSB + SSW), the proportion of total variability explained by group membership. Return 0.0 when there are no values or the total sum of squares is zero.",
    starterCode: `def eta_squared(groups):
    # Your code here
    pass`,
    solution: `def eta_squared(groups):
    total_n = sum(len(g) for g in groups)
    if total_n == 0:
        return 0.0
    grand = sum(sum(g) for g in groups) / total_n
    ssb = 0.0
    ssw = 0.0
    for g in groups:
        if g:
            m = sum(g) / len(g)
            ssb += len(g) * (m - grand) ** 2
            ssw += sum((v - m) ** 2 for v in g)
    total = ssb + ssw
    if total == 0:
        return 0.0
    return ssb / total`,
    testCases: [
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: 0.9 },
      { input: [[[5, 5], [5, 5]]], expected: 0.0 },
      { input: [[[1, 2], [3, 4], [5, 6]]], expected: 0.9142857142857143 },
      { input: [[[1], [2], [3]]], expected: 1.0 },
      { input: [[]], expected: 0.0 },
    ],
    hint: "It is the ANOVA effect size; 1.0 means groups explain everything.",
  },
  {
    id: "st-077",
    title: "Kolmogorov-Smirnov Statistic (Two-Sample)",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the two-sample Kolmogorov-Smirnov statistic: the maximum absolute difference between the two empirical CDFs, evaluated at the combined sorted values. Return 0.0 if either sample is empty.",
    starterCode: `def ks_statistic(x, y):
    # Your code here
    pass`,
    solution: `def ks_statistic(x, y):
    n1 = len(x)
    n2 = len(y)
    if n1 == 0 or n2 == 0:
        return 0.0
    best = 0.0
    for v in sorted(set(x) | set(y)):
        c1 = sum(1 for a in x if a <= v) / n1
        c2 = sum(1 for b in y if b <= v) / n2
        d = abs(c1 - c2)
        if d > best:
            best = d
    return best`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10]], expected: 1.0 },
      { input: [[1, 2, 3], [1, 2, 3]], expected: 0.0 },
      { input: [[1, 2, 3, 4], [2, 4, 6, 8]], expected: 0.5 },
      { input: [[1], [2]], expected: 1.0 },
      { input: [[], [1, 2]], expected: 0.0 },
    ],
    hint: "At each distinct value compare the two cumulative proportions.",
  },
  {
    id: "st-078",
    title: "QQ Plot Slope and Intercept",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Fit a line through the points (theoretical quantile, sample quantile) using population moments and return [slope, intercept], where slope = cov(q, s)/var(q) and intercept = mean(s) - slope*mean(q). Return [0.0, 0.0] when fewer than two points are given or the theoretical quantiles are constant.",
    starterCode: `def qq_slope_intercept(theoretical, sample):
    # Your code here
    pass`,
    solution: `def qq_slope_intercept(theoretical, sample):
    n = len(theoretical)
    if n < 2 or len(sample) != n:
        return [0.0, 0.0]
    mq = sum(theoretical) / n
    ms = sum(sample) / n
    varq = sum((q - mq) ** 2 for q in theoretical) / n
    if varq == 0:
        return [0.0, 0.0]
    cov = sum((q - mq) * (s - ms) for q, s in zip(theoretical, sample)) / n
    slope = cov / varq
    return [slope, ms - slope * mq]`,
    testCases: [
      { input: [[-1, 0, 1], [2, 4, 6]], expected: [2.0, 4.0] },
      { input: [[0, 1, 2], [1, 3, 5]], expected: [2.0, 1.0] },
      { input: [[1, 2, 3], [3, 3, 3]], expected: [0.0, 3.0] },
      { input: [[5, 5], [1, 2]], expected: [0.0, 0.0] },
      { input: [[1], [1]], expected: [0.0, 0.0] },
    ],
    hint: "It is ordinary least squares on the quantile pairs.",
  },
  {
    id: "st-079",
    title: "Residual Standard Error",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Fit simple linear regression y = a + b*x by least squares and return the residual standard error sqrt(SSE/(n-2)). Return 0.0 when n < 3, the lengths differ, or x has zero variance.",
    starterCode: `def residual_standard_error(x, y):
    # Your code here
    pass`,
    solution: `def residual_standard_error(x, y):
    n = len(x)
    if n < 3 or len(y) != n:
        return 0.0
    mx = sum(x) / n
    my = sum(y) / n
    sxx = sum((v - mx) ** 2 for v in x)
    if sxx == 0:
        return 0.0
    sxy = sum((a - mx) * (b - my) for a, b in zip(x, y))
    b = sxy / sxx
    a = my - b * mx
    sse = sum((y[i] - a - b * x[i]) ** 2 for i in range(n))
    return (sse / (n - 2)) ** 0.5`,
    testCases: [
      { input: [[1, 2, 3], [2, 4, 6]], expected: 0.0 },
      { input: [[1, 2, 3, 4], [2, 3, 4, 7]], expected: 0.7745966692414836 },
      { input: [[1, 2, 3], [1, 2, 2]], expected: 0.408248290463863 },
      { input: [[1, 2], [3, 5]], expected: 0.0 },
      { input: [[5, 5, 5], [1, 2, 3]], expected: 0.0 },
    ],
    hint: "Compute the slope from Sxy/Sxx, then the sum of squared residuals.",
  },
  {
    id: "st-080",
    title: "Leverage in Simple Regression",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the leverage of observation i, h_i = 1/n + (x_i - mean(x))^2 / sum((x - mean(x))^2). Return 0.0 when n < 2, i is out of range, or x has zero variance.",
    starterCode: `def leverage(x, i):
    # Your code here
    pass`,
    solution: `def leverage(x, i):
    n = len(x)
    if n < 2 or i < 0 or i >= n:
        return 0.0
    mx = sum(x) / n
    sxx = sum((v - mx) ** 2 for v in x)
    if sxx == 0:
        return 0.0
    return 1.0 / n + (x[i] - mx) ** 2 / sxx`,
    testCases: [
      { input: [[1, 2, 3], 0], expected: 0.8333333333333333 },
      { input: [[1, 2, 3], 1], expected: 0.3333333333333333 },
      { input: [[1, 2, 3], 2], expected: 0.8333333333333333 },
      { input: [[5, 5, 5], 0], expected: 0.0 },
      { input: [[1], 0], expected: 0.0 },
    ],
    hint: "Leverage measures how far x_i sits from the center of the predictor.",
  },
  {
    id: "st-081",
    title: "Breusch-Pagan Lite",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the Pearson correlation between x and the squared residuals, a quick heteroscedasticity indicator. Return 0.0 when fewer than two points are given or either variable has zero variance.",
    starterCode: `def breusch_pagan_lite(x, residuals):
    # Your code here
    pass`,
    solution: `def breusch_pagan_lite(x, residuals):
    n = len(x)
    if n < 2 or len(residuals) != n:
        return 0.0
    sq = [e * e for e in residuals]
    mx = sum(x) / n
    ms = sum(sq) / n
    dx = sum((v - mx) ** 2 for v in x)
    ds = sum((v - ms) ** 2 for v in sq)
    if dx == 0 or ds == 0:
        return 0.0
    cov = sum((x[i] - mx) * (sq[i] - ms) for i in range(n))
    return cov / ((dx * ds) ** 0.5)`,
    testCases: [
      { input: [[1, 2, 3, 4], [1, 4, 9, 16]], expected: 0.9163023485215754 },
      { input: [[0, 0, 0], [1, 2, 3]], expected: 0.0 },
      { input: [[1, 2, 3], [4, 4, 4]], expected: 0.0 },
      { input: [[1, 2, 3, 4], [4, 9, 16, 25]], expected: 0.9461581522243414 },
      { input: [[1, 2], [1, 4]], expected: 1.0 },
    ],
    hint: "A strong correlation suggests the error variance changes with x.",
  },
  {
    id: "st-082",
    title: "Confidence Interval for Mean (Unknown Sigma)",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the t confidence interval [mean - t*s/sqrt(n), mean + t*s/sqrt(n)] for the mean with unknown sigma, where s is the sample standard deviation. Return [0.0, 0.0] when n < 2.",
    starterCode: `def ci_mean_unknown_sigma(data, t_crit):
    # Your code here
    pass`,
    solution: `def ci_mean_unknown_sigma(data, t_crit):
    n = len(data)
    if n < 2:
        return [0.0, 0.0]
    m = sum(data) / n
    s2 = sum((v - m) ** 2 for v in data) / (n - 1)
    half = t_crit * (s2 ** 0.5) / (n ** 0.5)
    return [m - half, m + half]`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 2.776], expected: [1.0370715754261441, 4.962928424573856] },
      { input: [[2, 4, 4, 4, 5, 5, 7, 9], 2.365], expected: [3.2122280426663554, 6.787771957333645] },
      { input: [[5], 2.0], expected: [0.0, 0.0] },
      { input: [[], 2.0], expected: [0.0, 0.0] },
      { input: [[1, 3], 12.706], expected: [-10.706, 14.706] },
    ],
    hint: "Use the sample standard deviation and the supplied critical value.",
  },
  {
    id: "st-083",
    title: "Partial Correlation",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the partial correlation of x and y controlling for z: (r_xy - r_xz*r_yz) / sqrt((1 - r_xz^2)(1 - r_yz^2)). Return 0.0 when either control correlation has absolute value at least 1.",
    starterCode: `def partial_correlation(r_xy, r_xz, r_yz):
    # Your code here
    pass`,
    solution: `def partial_correlation(r_xy, r_xz, r_yz):
    if abs(r_xz) >= 1 or abs(r_yz) >= 1:
        return 0.0
    denom = ((1.0 - r_xz ** 2) * (1.0 - r_yz ** 2)) ** 0.5
    if denom == 0:
        return 0.0
    return (r_xy - r_xz * r_yz) / denom`,
    testCases: [
      { input: [0.6, 0.5, 0.4], expected: 0.5039526306789696 },
      { input: [0.5, 0.0, 0.0], expected: 0.5 },
      { input: [0.3, 0.1, 0.1], expected: 0.29292929292929293 },
      { input: [1.0, 1.0, 0.0], expected: 0.0 },
      { input: [-0.5, 0.5, 0.5], expected: -1.0 },
    ],
    hint: "Remove the shared variation with z from both x and y.",
  },
  {
    id: "st-084",
    title: "Semipartial Correlation",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the semipartial correlation of x with y controlling for z: (r_xy - r_xz*r_yz) / sqrt(1 - r_yz^2). Return 0.0 when |r_yz| >= 1.",
    starterCode: `def semipartial_correlation(r_xy, r_xz, r_yz):
    # Your code here
    pass`,
    solution: `def semipartial_correlation(r_xy, r_xz, r_yz):
    if abs(r_yz) >= 1:
        return 0.0
    denom = (1.0 - r_yz ** 2) ** 0.5
    if denom == 0:
        return 0.0
    return (r_xy - r_xz * r_yz) / denom`,
    testCases: [
      { input: [0.6, 0.5, 0.4], expected: 0.4364357804719847 },
      { input: [0.5, 0.0, 0.0], expected: 0.5 },
      { input: [0.3, 0.1, 0.1], expected: 0.2914609664251715 },
      { input: [0.5, 0.5, 0.5], expected: 0.2886751345948129 },
      { input: [0.9, 0.9, 0.9], expected: 0.20647416048350556 },
    ],
    hint: "Only y is residualized, so the denominator omits the r_xz term.",
  },
  {
    id: "st-085",
    title: "Confidence Interval for a Proportion",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the Wald confidence interval [p - z*sqrt(p(1-p)/n), p + z*sqrt(p(1-p)/n)] for a binomial proportion, with p = successes/n. Return [0.0, 0.0] when n <= 0.",
    starterCode: `def ci_proportion(successes, n, z_crit):
    # Your code here
    pass`,
    solution: `def ci_proportion(successes, n, z_crit):
    if n <= 0:
        return [0.0, 0.0]
    p = successes / n
    half = z_crit * ((p * (1.0 - p)) / n) ** 0.5
    return [p - half, p + half]`,
    testCases: [
      { input: [45, 100, 1.96], expected: [0.35249123116355124, 0.5475087688364488] },
      { input: [0, 50, 1.96], expected: [0.0, 0.0] },
      { input: [50, 100, 1.645], expected: [0.41775, 0.58225] },
      { input: [10, 10, 1.96], expected: [1.0, 1.0] },
      { input: [5, 20, 2.0], expected: [0.05635083268962915, 0.44364916731037085] },
    ],
    hint: "At p = 0 or 1 the interval collapses to a point.",
  },
  {
    id: "st-086",
    title: "Confidence Interval for Difference of Means (Pooled)",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the pooled confidence interval for mean_x - mean_y using sp*sqrt(1/nx + 1/ny), with sp^2 the pooled variance. Return [0.0, 0.0] when either sample has fewer than two values.",
    starterCode: `def ci_difference_means(x, y, t_crit):
    # Your code here
    pass`,
    solution: `def ci_difference_means(x, y, t_crit):
    n1 = len(x)
    n2 = len(y)
    if n1 < 2 or n2 < 2:
        return [0.0, 0.0]
    m1 = sum(x) / n1
    m2 = sum(y) / n2
    ss1 = sum((v - m1) ** 2 for v in x)
    ss2 = sum((v - m2) ** 2 for v in y)
    sp2 = (ss1 + ss2) / (n1 + n2 - 2)
    se = (sp2 * (1.0 / n1 + 1.0 / n2)) ** 0.5
    diff = m1 - m2
    half = t_crit * se
    return [diff - half, diff + half]`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], [2, 4, 6, 8, 10], 2.0], expected: [-6.16227766016838, 0.16227766016837952] },
      { input: [[1, 1, 1], [1, 1, 1], 2.0], expected: [0.0, 0.0] },
      { input: [[1, 2, 3], [4, 5, 6], 2.5], expected: [-5.041241452319316, -0.9587585476806848] },
      { input: [[5], [1, 2], 1.96], expected: [0.0, 0.0] },
      { input: [[10, 12], [11, 13], 2.0], expected: [-3.8284271247461903, 1.8284271247461903] },
    ],
    hint: "Center the interval on the observed difference and use the supplied t critical value.",
  },
  {
    id: "st-087",
    title: "Fisher Exact Probability (Small Table)",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Return the hypergeometric probability of the observed 2x2 table given its margins: C(a+b, a) * C(c+d, c) / C(n, a+c). Return 0.0 when the total is zero.",
    starterCode: `import math
def fisher_exact_probability(a, b, c, d):
    # Your code here
    pass`,
    solution: `import math
def fisher_exact_probability(a, b, c, d):
    n = a + b + c + d
    if n == 0:
        return 0.0
    return math.comb(a + b, a) * math.comb(c + d, c) / math.comb(n, a + c)`,
    testCases: [
      { input: [1, 9, 9, 1], expected: 0.0005412544112234515 },
      { input: [5, 0, 0, 5], expected: 0.003968253968253968 },
      { input: [1, 1, 1, 1], expected: 0.6666666666666666 },
      { input: [0, 0, 0, 0], expected: 0.0 },
      { input: [2, 3, 4, 5], expected: 0.4195804195804196 },
    ],
    hint: "Use math.comb for the binomial coefficients.",
  },
  {
    id: "st-088",
    title: "Multiple R-Squared from Correlations",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Return the multiple R-squared for two predictors from their correlations: (r_y1^2 + r_y2^2 - 2*r_y1*r_y2*r_12) / (1 - r_12^2). Return 0.0 when |r_12| >= 1, and clamp the result to [0, 1].",
    starterCode: `def multiple_r_squared(r_y1, r_y2, r_12):
    # Your code here
    pass`,
    solution: `def multiple_r_squared(r_y1, r_y2, r_12):
    if abs(r_12) >= 1:
        return 0.0
    num = r_y1 ** 2 + r_y2 ** 2 - 2.0 * r_y1 * r_y2 * r_12
    r2 = num / (1.0 - r_12 ** 2)
    if r2 < 0:
        return 0.0
    if r2 > 1:
        return 1.0
    return r2`,
    testCases: [
      { input: [0.7, 0.5, 0.3], expected: 0.5824175824175825 },
      { input: [0.6, 0.6, 0.0], expected: 0.72 },
      { input: [0.5, 0.5, 0.5], expected: 0.3333333333333333 },
      { input: [0.9, 0.9, 1.0], expected: 0.0 },
      { input: [0.0, 0.0, 0.0], expected: 0.0 },
    ],
    hint: "The predictor intercorrelation r_12 can inflate or deflate the explained variance.",
  },
  {
    id: "st-089",
    title: "Power of a One-Sided z-Test",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Return the power 1 - Phi(z_alpha - delta*sqrt(n)/sigma) for a one-sided z-test with effect size delta, using the normal CDF. Return 0.0 when n <= 0 or sigma <= 0, and clamp the result to [0, 1].",
    starterCode: `import math
def power_one_sided_z(delta, n, sigma, z_alpha):
    # Your code here
    pass`,
    solution: `import math
def power_one_sided_z(delta, n, sigma, z_alpha):
    if n <= 0 or sigma <= 0:
        return 0.0
    v = z_alpha - delta * (n ** 0.5) / sigma
    power = 0.5 * (1.0 - math.erf(v / (2 ** 0.5)))
    if power < 0:
        return 0.0
    if power > 1:
        return 1.0
    return power`,
    testCases: [
      { input: [0.5, 25, 1.0, 1.645], expected: 0.8037244261254556 },
      { input: [0.0, 100, 2.0, 1.96], expected: 0.024997895148220428 },
      { input: [1.0, 16, 2.0, 1.645], expected: 0.6387052043836872 },
      { input: [2.0, 9, 1.0, 1.28], expected: 0.9999988207767835 },
      { input: [0.1, 4, 1.0, 1.0], expected: 0.21185539858339664 },
    ],
    hint: "The term delta*sqrt(n)/sigma is the noncentrality shift.",
  },
  {
    id: "st-090",
    title: "Benjamini-Hochberg Step (Small)",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Return the number of rejections from the Benjamini-Hochberg procedure: sort the p-values and find the largest k with p_(k) <= (k/m)*alpha, returning 0 when no p-value qualifies. Return 0 for an empty list.",
    starterCode: `def benjamini_hochberg(pvals, alpha):
    # Your code here
    pass`,
    solution: `def benjamini_hochberg(pvals, alpha):
    m = len(pvals)
    if m == 0:
        return 0
    s = sorted(pvals)
    k = 0
    for i in range(1, m + 1):
        if s[i - 1] <= (i / m) * alpha:
            k = i
    return k`,
    testCases: [
      { input: [[0.01, 0.02, 0.03, 0.04], 0.05], expected: 4 },
      { input: [[0.5, 0.6], 0.05], expected: 0 },
      { input: [[0.001, 0.5], 0.05], expected: 1 },
      { input: [[], 0.05], expected: 0 },
      { input: [[0.01, 0.04, 0.03], 0.05], expected: 3 },
    ],
    hint: "Scan from the smallest p-value and keep the last position that passes its line.",
  },
  {
    id: "st-091",
    title: "Simpson's Paradox in Risk Tables",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Given risk counts for two strata (a_j cases and b_j non-cases in the exposed group, c_j and d_j in the unexposed group), return True when both stratum risk differences have one sign and the pooled risk difference has the opposite sign. Return False otherwise.",
    starterCode: `def simpsons_paradox(a1, b1, c1, d1, a2, b2, c2, d2):
    # Your code here
    pass`,
    solution: `def simpsons_paradox(a1, b1, c1, d1, a2, b2, c2, d2):
    def risk_diff(a, b, c, d):
        if a + b == 0 or c + d == 0:
            return 0.0
        return a / (a + b) - c / (c + d)
    d1_ = risk_diff(a1, b1, c1, d1)
    d2_ = risk_diff(a2, b2, c2, d2)
    pooled = risk_diff(a1 + a2, b1 + b2, c1 + c2, d1 + d2)
    if d1_ > 0 and d2_ > 0 and pooled < 0:
        return True
    if d1_ < 0 and d2_ < 0 and pooled > 0:
        return True
    return False`,
    testCases: [
      { input: [81, 6, 234, 36, 192, 71, 55, 25], expected: true },
      { input: [30, 70, 10, 90, 30, 70, 10, 90], expected: false },
      { input: [234, 36, 81, 6, 55, 25, 192, 71], expected: true },
      { input: [30, 70, 10, 90, 10, 90, 30, 70], expected: false },
      { input: [1, 1, 1, 1, 1, 1, 1, 1], expected: false },
    ],
    hint: "Pooled counts can reverse a trend that holds in every subgroup.",
  },
  {
    id: "st-092",
    title: "Weighted Least Squares Slope",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Return the weighted least squares slope through the origin, b = sum(w*x*y) / sum(w*x^2). Return 0.0 when the weighted sum of x^2 is zero.",
    starterCode: `def wls_slope(x, y, w):
    # Your code here
    pass`,
    solution: `def wls_slope(x, y, w):
    num = sum(wi * xi * yi for xi, yi, wi in zip(x, y, w))
    den = sum(wi * xi * xi for xi, wi in zip(x, w))
    if den == 0:
        return 0.0
    return num / den`,
    testCases: [
      { input: [[1, 2, 3], [2, 4, 6], [1, 1, 1]], expected: 2.0 },
      { input: [[1, 2, 3], [1, 1, 1], [1, 2, 3]], expected: 0.3888888888888889 },
      { input: [[1, 2], [3, 4], [0, 0]], expected: 0.0 },
      { input: [[2, 4], [1, 3], [1, 1]], expected: 0.7 },
      { input: [[1, 1], [5, 5], [2, 2]], expected: 5.0 },
    ],
    hint: "Each observation contributes in proportion to its weight.",
  },
  {
    id: "st-093",
    title: "Robust Standard Error Ratio",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Return the ratio of the HC1 robust standard error of a simple regression slope to the classical one: sqrt(n * sum(xc_i^2 e_i^2) / (Sxx * SSE)), where xc = x - mean(x). Return 0.0 when n < 3, the lengths differ, or Sxx or SSE is zero.",
    starterCode: `def robust_se_ratio(x, residuals):
    # Your code here
    pass`,
    solution: `def robust_se_ratio(x, residuals):
    n = len(x)
    if n < 3 or len(residuals) != n:
        return 0.0
    mx = sum(x) / n
    sxx = sum((v - mx) ** 2 for v in x)
    sse = sum(e * e for e in residuals)
    if sxx == 0 or sse == 0:
        return 0.0
    wsum = sum(((x[i] - mx) ** 2) * residuals[i] ** 2 for i in range(n))
    return (n * wsum / (sxx * sse)) ** 0.5`,
    testCases: [
      { input: [[1, 2, 3, 4], [1, -1, 1, -1]], expected: 1.0 },
      { input: [[1, 2, 3, 4, 5], [1, 1, 1, 1, 1]], expected: 1.0 },
      { input: [[1, 2, 3, 4, 5], [1, 2, 3, 4, 5]], expected: 1.0617310051386497 },
      { input: [[1, 1, 1, 1], [1, 2, 3, 4]], expected: 0.0 },
      { input: [[1, 2, 3], [0, 0, 0]], expected: 0.0 },
    ],
    hint: "The ratio equals 1 under homoscedasticity and departs from 1 when error variance tracks x.",
  },
  {
    id: "st-094",
    title: "Bootstrap Bias Estimate",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Estimate the bootstrap bias of the sample mean: draw n_boot resamples with replacement using a self-contained Lehmer RNG seeded with seed (state = seed % 2147483647, next = state * 48271 % 2147483647) and return mean(resample means) - mean(data). Return 0.0 for empty data or n_boot <= 0.",
    starterCode: `def bootstrap_bias(data, n_boot, seed):
    # Your code here
    pass`,
    solution: `def bootstrap_bias(data, n_boot, seed):
    n = len(data)
    if n == 0 or n_boot <= 0:
        return 0.0
    state = seed % 2147483647
    if state <= 0:
        state = state + 2147483646
    total = 0.0
    for _ in range(n_boot):
        s = 0.0
        for _ in range(n):
            state = (state * 48271) % 2147483647
            s += data[state % n]
        total += s / n
    return total / n_boot - sum(data) / n`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 200, 7], expected: -0.023000000000000576 },
      { input: [[5], 50, 1], expected: 0.0 },
      { input: [[], 10, 1], expected: 0.0 },
      { input: [[1, 2], 100, 3], expected: 0.03499999999999992 },
      { input: [[10, 20, 30, 40], 300, 99], expected: -0.31666666666666643 },
    ],
    hint: "Bias is the difference between the average bootstrap mean and the observed mean.",
  },
  {
    id: "st-095",
    title: "Leave-One-Out Cross-Validation R-Squared",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Return the leave-one-out cross-validation R-squared for simple linear regression: 1 - SSE_loo/SST, where each point is predicted by a line fit on the other n-1 points and SST uses the overall mean. Return 0.0 when n < 3, the lengths differ, y is constant, or any leave-one-out x has zero variance.",
    starterCode: `def leave_one_out_r2(x, y):
    # Your code here
    pass`,
    solution: `def leave_one_out_r2(x, y):
    n = len(x)
    if n < 3 or len(y) != n:
        return 0.0
    ybar = sum(y) / n
    sst = sum((v - ybar) ** 2 for v in y)
    if sst == 0:
        return 0.0
    sse = 0.0
    for i in range(n):
        xs = [x[j] for j in range(n) if j != i]
        ys = [y[j] for j in range(n) if j != i]
        mx = sum(xs) / len(xs)
        my = sum(ys) / len(ys)
        sxx = sum((v - mx) ** 2 for v in xs)
        if sxx == 0:
            return 0.0
        sxy = sum((a - mx) * (b - my) for a, b in zip(xs, ys))
        b = sxy / sxx
        a = my - b * mx
        sse += (y[i] - a - b * x[i]) ** 2
    return 1.0 - sse / sst`,
    testCases: [
      { input: [[1, 2, 3], [2, 4, 6]], expected: 1.0 },
      { input: [[1, 2, 3, 4], [2, 4, 6, 9]], expected: 0.9330324029923496 },
      { input: [[1, 2, 3, 4, 5], [1, 3, 2, 5, 4]], expected: 0.09426020408163249 },
      { input: [[1, 2], [3, 5]], expected: 0.0 },
      { input: [[5, 5, 5], [1, 2, 3]], expected: 0.0 },
    ],
    hint: "Refit for every left-out point; the score can go negative.",
  },
];
