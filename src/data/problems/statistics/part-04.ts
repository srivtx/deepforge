import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "st-096",
    title: "Winsorized Mean",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the mean of the winsorized data: sort the values, replace the k smallest with the (k+1)-th smallest and the k largest with the (k+1)-th largest, then average. If 2*k >= n use the median and if k <= 0 use the ordinary mean. Return 0.0 for empty input.",
    starterCode: `def winsorized_mean(data, k):
    # Your code here
    pass`,
    solution: `def winsorized_mean(data, k):
    n = len(data)
    if n == 0:
        return 0.0
    s = sorted(data)
    if k <= 0:
        return sum(data) / n
    if 2 * k >= n:
        mid = n // 2
        if n % 2:
            return float(s[mid])
        return (s[mid - 1] + s[mid]) / 2.0
    lo = float(s[k])
    hi = float(s[n - 1 - k])
    vals = [min(max(float(x), lo), hi) for x in data]
    return sum(vals) / n`,
    testCases: [
      { input: [[1, 2, 3, 4, 5, 100], 1], expected: 3.5 },
      { input: [[1, 2, 3, 4], 1], expected: 2.5 },
      { input: [[1, 2, 3, 4], 0], expected: 2.5 },
      { input: [[1, 10], 1], expected: 5.5 },
      { input: [[], 1], expected: 0.0 },
    ],
    hint: "This is the mean of the winsorized list.",
  },
  {
    id: "st-097",
    title: "Huber Weight",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the Huber weight for a residual given a scale estimate: 1.0 when abs(residual) <= c*scale, otherwise c*scale/abs(residual). Return 0.0 when scale <= 0.",
    starterCode: `def huber_weight(residual, scale, c):
    # Your code here
    pass`,
    solution: `def huber_weight(residual, scale, c):
    if scale <= 0:
        return 0.0
    r = abs(residual)
    limit = c * scale
    if r <= limit:
        return 1.0
    return limit / r`,
    testCases: [
      { input: [1.0, 1.0, 1.345], expected: 1.0 },
      { input: [2.69, 1.0, 1.345], expected: 0.5 },
      { input: [0.0, 1.0, 1.345], expected: 1.0 },
      { input: [5.0, 0.0, 1.345], expected: 0.0 },
      { input: [1.345, 1.0, 1.345], expected: 1.0 },
    ],
    hint: "Huber weights downweight large residuals linearly.",
  },
  {
    id: "st-098",
    title: "Design Effect (Kish)",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return Kish's design effect 1 + (m - 1)*icc for clusters of size m. Return 0.0 when m <= 0.",
    starterCode: `def design_effect(cluster_size, icc):
    # Your code here
    pass`,
    solution: `def design_effect(cluster_size, icc):
    if cluster_size <= 0:
        return 0.0
    return 1.0 + (cluster_size - 1) * icc`,
    testCases: [
      { input: [10, 0.05], expected: 1.45 },
      { input: [1, 0.5], expected: 1.0 },
      { input: [20, 0.0], expected: 1.0 },
      { input: [0, 0.1], expected: 0.0 },
      { input: [5, 0.2], expected: 1.8 },
    ],
    hint: "The design effect inflates the variance of a cluster sample relative to simple random sampling.",
  },
  {
    id: "st-099",
    title: "Ratio Estimator",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the ratio estimator population_total_x * sum(y) / sum(x). Return 0.0 when either list is empty or sum(x) is zero.",
    starterCode: `def ratio_estimator(y, x, population_total_x):
    # Your code here
    pass`,
    solution: `def ratio_estimator(y, x, population_total_x):
    if not y or not x:
        return 0.0
    denom = sum(x)
    if denom == 0:
        return 0.0
    return population_total_x * sum(y) / denom`,
    testCases: [
      { input: [[2, 4, 6], [1, 2, 3], 100], expected: 200.0 },
      { input: [[1, 2], [1, 1], 10], expected: 15.0 },
      { input: [[1], [0], 5], expected: 0.0 },
      { input: [[], [1], 10], expected: 0.0 },
      { input: [[5, 5], [2, 3], 10], expected: 20.0 },
    ],
    hint: "Scale the known population total of x by the observed y-to-x ratio.",
  },
  {
    id: "st-100",
    title: "Horvitz-Thompson Estimator",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the Horvitz-Thompson estimate of a population total: sum(y_i / pi_i) for inclusion probabilities pi_i. Return 0.0 when the lists are empty, lengths differ, or any pi_i is not positive.",
    starterCode: `def horvitz_thompson(y, inclusion_probs):
    # Your code here
    pass`,
    solution: `def horvitz_thompson(y, inclusion_probs):
    if not y or len(y) != len(inclusion_probs):
        return 0.0
    total = 0.0
    for value, pi in zip(y, inclusion_probs):
        if pi <= 0:
            return 0.0
        total += value / pi
    return total`,
    testCases: [
      { input: [[1, 2, 3], [0.1, 0.2, 0.3]], expected: 30.0 },
      { input: [[10], [0.5]], expected: 20.0 },
      { input: [[], []], expected: 0.0 },
      { input: [[1, 2], [0.0, 0.5]], expected: 0.0 },
      { input: [[5, 5], [1, 1]], expected: 10.0 },
    ],
    hint: "Each sampled unit represents 1/pi units in the population.",
  },
  {
    id: "st-101",
    title: "Propensity Weight Trim",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the propensity weights with every value above cap replaced by cap. Return a list of zeros when cap <= 0.",
    starterCode: `def trim_weights(weights, cap):
    # Your code here
    pass`,
    solution: `def trim_weights(weights, cap):
    if cap <= 0:
        return [0.0 for _ in weights]
    return [min(float(w), float(cap)) for w in weights]`,
    testCases: [
      { input: [[0.5, 1.5, 2.0], 1.0], expected: [0.5, 1.0, 1.0] },
      { input: [[1, 2], 5], expected: [1.0, 2.0] },
      { input: [[], 1], expected: [] },
      { input: [[3, 3], 0], expected: [0.0, 0.0] },
      { input: [[0.2, 0.4], 0.3], expected: [0.2, 0.3] },
    ],
    hint: "Trimming extreme weights limits variance at the cost of some bias.",
  },
  {
    id: "st-102",
    title: "G-Computation Mean",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the mean of a vector of predicted outcomes, which estimates the average potential outcome under the g-computation formula. Return 0.0 for empty input.",
    starterCode: `def g_computation_mean(predictions):
    # Your code here
    pass`,
    solution: `def g_computation_mean(predictions):
    if not predictions:
        return 0.0
    return sum(predictions) / len(predictions)`,
    testCases: [
      { input: [[1, 2, 3]], expected: 2.0 },
      { input: [[0.5, 0.7]], expected: 0.6 },
      { input: [[]], expected: 0.0 },
      { input: [[4]], expected: 4.0 },
      { input: [[-1, 1]], expected: 0.0 },
    ],
    hint: "Average the model predictions over the whole sample.",
  },
  {
    id: "st-103",
    title: "Information Fraction",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the information fraction current_n / planned_n for an interim analysis. Return 0.0 when planned_n <= 0.",
    starterCode: `def information_fraction(current_n, planned_n):
    # Your code here
    pass`,
    solution: `def information_fraction(current_n, planned_n):
    if planned_n <= 0:
        return 0.0
    return current_n / planned_n`,
    testCases: [
      { input: [50, 100], expected: 0.5 },
      { input: [0, 100], expected: 0.0 },
      { input: [100, 100], expected: 1.0 },
      { input: [10, 0], expected: 0.0 },
      { input: [120, 100], expected: 1.2 },
    ],
    hint: "It is the proportion of planned information accrued.",
  },
  {
    id: "st-104",
    title: "Sample Size with Attrition",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the number of participants to enroll so that required_n complete the study when a fraction attrition drop out: ceil(required_n / (1 - attrition)). Return 0 when required_n <= 0 or attrition is outside [0, 1).",
    starterCode: `import math
def sample_size_with_attrition(required_n, attrition):
    # Your code here
    pass`,
    solution: `import math
def sample_size_with_attrition(required_n, attrition):
    if required_n <= 0 or attrition >= 1 or attrition < 0:
        return 0
    return int(math.ceil(required_n / (1.0 - attrition)))`,
    testCases: [
      { input: [100, 0.2], expected: 125 },
      { input: [100, 0.0], expected: 100 },
      { input: [50, 0.5], expected: 100 },
      { input: [10, 0.15], expected: 12 },
      { input: [10, 1.0], expected: 0 },
    ],
    hint: "Inflate the required completers by the retention rate.",
  },
  {
    id: "st-105",
    title: "Hausman Test Lite",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the Hausman-style statistic (b_fe - b_re)^2 / (se_fe^2 - se_re^2) comparing fixed and random effects estimates. Return 0.0 when the variance difference is not positive.",
    starterCode: `def hausman_lite(b_fe, b_re, se_fe, se_re):
    # Your code here
    pass`,
    solution: `def hausman_lite(b_fe, b_re, se_fe, se_re):
    denom = se_fe ** 2 - se_re ** 2
    if denom <= 0:
        return 0.0
    return (b_fe - b_re) ** 2 / denom`,
    testCases: [
      { input: [1.2, 1.0, 0.3, 0.2], expected: 0.7999999999999998 },
      { input: [1.0, 1.0, 0.5, 0.5], expected: 0.0 },
      { input: [0.5, 0.3, 0.2, 0.1], expected: 1.3333333333333333 },
      { input: [1.0, 2.0, 0.2, 0.1], expected: 33.33333333333333 },
      { input: [0.0, 0.0, 0.1, 0.05], expected: 0.0 },
    ],
    hint: "Large values suggest the random effects estimator is inconsistent.",
  },
  {
    id: "st-106",
    title: "Youden Index",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the Youden index sensitivity + specificity - 1 for a diagnostic cutoff. It ranges from -1 to 1 and is 0 for an uninformative test.",
    starterCode: `def youden_index(sensitivity, specificity):
    # Your code here
    pass`,
    solution: `def youden_index(sensitivity, specificity):
    return sensitivity + specificity - 1.0`,
    testCases: [
      { input: [0.9, 0.8], expected: 0.7000000000000002 },
      { input: [1.0, 1.0], expected: 1.0 },
      { input: [0.5, 0.5], expected: 0.0 },
      { input: [0.0, 0.0], expected: -1.0 },
      { input: [0.8, 0.9], expected: 0.7000000000000002 },
    ],
    hint: "Add the two rates and subtract one.",
  },
  {
    id: "st-107",
    title: "Cost-Weighted Cutoff",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the probability cutoff c_fp / (c_fp + c_fn) that minimizes expected cost when a false positive costs cost_fp and a false negative costs cost_fn. Return 0.0 when both costs are zero.",
    starterCode: `def cost_weighted_cutoff(cost_fp, cost_fn):
    # Your code here
    pass`,
    solution: `def cost_weighted_cutoff(cost_fp, cost_fn):
    total = cost_fp + cost_fn
    if total <= 0:
        return 0.0
    return cost_fp / total`,
    testCases: [
      { input: [1, 1], expected: 0.5 },
      { input: [4, 1], expected: 0.8 },
      { input: [1, 4], expected: 0.2 },
      { input: [0, 0], expected: 0.0 },
      { input: [2, 8], expected: 0.2 },
    ],
    hint: "Predict positive when the expected cost of doing so is lower.",
  },
  {
    id: "st-108",
    title: "Decision Curve Net Benefit",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the net benefit tp/n - (fp/n) * (threshold / (1 - threshold)) for a decision threshold. Return 0.0 when n <= 0 or the threshold is not strictly between 0 and 1.",
    starterCode: `def decision_curve_net_benefit(tp, fp, n, threshold):
    # Your code here
    pass`,
    solution: `def decision_curve_net_benefit(tp, fp, n, threshold):
    if n <= 0 or threshold <= 0 or threshold >= 1:
        return 0.0
    return tp / n - (fp / n) * (threshold / (1.0 - threshold))`,
    testCases: [
      { input: [30, 10, 100, 0.2], expected: 0.27499999999999997 },
      { input: [50, 50, 100, 0.5], expected: 0.0 },
      { input: [0, 0, 100, 0.3], expected: 0.0 },
      { input: [100, 0, 100, 0.1], expected: 1.0 },
      { input: [10, 10, 100, 0.0], expected: 0.0 },
    ],
    hint: "It compares the value of true positives against the harm of false positives at the given threshold.",
  },
  {
    id: "st-109",
    title: "Likelihood Ratios",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return [LR+, LR-] for a test: LR+ = sensitivity / (1 - specificity) and LR- = (1 - sensitivity) / specificity. Return 0.0 for a ratio whose denominator is zero.",
    starterCode: `def likelihood_ratios(sensitivity, specificity):
    # Your code here
    pass`,
    solution: `def likelihood_ratios(sensitivity, specificity):
    if specificity >= 1:
        lr_plus = 0.0
    else:
        lr_plus = sensitivity / (1.0 - specificity)
    if specificity <= 0:
        lr_minus = 0.0
    else:
        lr_minus = (1.0 - sensitivity) / specificity
    return [lr_plus, lr_minus]`,
    testCases: [
      { input: [0.9, 0.8], expected: [4.500000000000001, 0.12499999999999997] },
      { input: [1.0, 1.0], expected: [0.0, 0.0] },
      { input: [0.8, 0.9], expected: [8.000000000000002, 0.22222222222222215] },
      { input: [0.5, 0.5], expected: [1.0, 1.0] },
      { input: [0.0, 0.0], expected: [0.0, 0.0] },
    ],
    hint: "Positive likelihood ratios above 1 increase the post-test odds.",
  },
  {
    id: "st-110",
    title: "Post-Test Probability",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the post-test probability after a positive test: multiply the pre-test odds prevalence/(1-prevalence) by the positive likelihood ratio and convert the result back to a probability. Return 0.0 when prevalence is outside (0, 1) or specificity >= 1.",
    starterCode: `def post_test_probability(prevalence, sensitivity, specificity):
    # Your code here
    pass`,
    solution: `def post_test_probability(prevalence, sensitivity, specificity):
    if prevalence <= 0 or prevalence >= 1:
        return 0.0
    if specificity >= 1:
        return 0.0
    lr_plus = sensitivity / (1.0 - specificity)
    odds = prevalence / (1.0 - prevalence)
    post_odds = odds * lr_plus
    return post_odds / (1.0 + post_odds)`,
    testCases: [
      { input: [0.1, 0.9, 0.8], expected: 0.3333333333333334 },
      { input: [0.5, 0.5, 0.5], expected: 0.5 },
      { input: [0.01, 1.0, 0.95], expected: 0.1680672268907562 },
      { input: [0.2, 0.8, 1.0], expected: 0.0 },
      { input: [0.0, 0.9, 0.8], expected: 0.0 },
    ],
    hint: "Odds in, likelihood ratio scaling, probability out.",
  },
  {
    id: "st-111",
    title: "Calibration Intercept Lite",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the calibration intercept estimate logit(observed_rate) - logit(mean_predicted) with logit(p) = ln(p/(1-p)). Return 0.0 when either input is outside (0, 1).",
    starterCode: `import math
def calibration_intercept_lite(observed_rate, mean_predicted):
    # Your code here
    pass`,
    solution: `import math
def calibration_intercept_lite(observed_rate, mean_predicted):
    if observed_rate <= 0 or observed_rate >= 1:
        return 0.0
    if mean_predicted <= 0 or mean_predicted >= 1:
        return 0.0
    return math.log(observed_rate / (1.0 - observed_rate)) - math.log(mean_predicted / (1.0 - mean_predicted))`,
    testCases: [
      { input: [0.2, 0.25], expected: -0.2876820724517808 },
      { input: [0.1, 0.1], expected: 0.0 },
      { input: [0.5, 0.2], expected: 1.3862943611198906 },
      { input: [0.0, 0.5], expected: 0.0 },
      { input: [0.9, 0.8], expected: 0.8109302162163288 },
    ],
    hint: "It compares the observed event rate with the mean predicted probability on the log-odds scale.",
  },
  {
    id: "st-112",
    title: "Trimmed Variance",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the population variance of the data after removing the k smallest and k largest values. Return 0.0 when data is empty or 2*k >= n. With k = 0 this is the ordinary population variance.",
    starterCode: `def trimmed_variance(data, k):
    # Your code here
    pass`,
    solution: `def trimmed_variance(data, k):
    n = len(data)
    if n == 0 or 2 * k >= n:
        return 0.0
    s = sorted(data)[k:n - k]
    m = sum(s) / len(s)
    return sum((v - m) ** 2 for v in s) / len(s)`,
    testCases: [
      { input: [[1, 2, 3, 4, 5, 100], 1], expected: 1.25 },
      { input: [[1, 2, 3, 4, 5], 0], expected: 2.0 },
      { input: [[1, 2, 3, 4], 1], expected: 0.25 },
      { input: [[1, 2], 1], expected: 0.0 },
      { input: [[], 0], expected: 0.0 },
    ],
    hint: "Sort, trim both tails, then average squared deviations.",
  },
  {
    id: "st-113",
    title: "Huber Location One Step",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Perform one step of Huber's M-estimator for location: start at the median, compute the scale 1.4826*MAD, form weights that are 1.0 within c*scale and c*scale/abs(deviation) beyond, and return median + sum(w*dev)/sum(w). Return 0.0 for empty data and the median when the scale or total weight is zero.",
    starterCode: `def huber_one_step(data, c):
    # Your code here
    pass`,
    solution: `def huber_one_step(data, c):
    n = len(data)
    if n == 0:
        return 0.0
    s = sorted(data)
    mid = n // 2
    if n % 2:
        mu = float(s[mid])
    else:
        mu = (s[mid - 1] + s[mid]) / 2.0
    devs = sorted(abs(v - mu) for v in data)
    if n % 2:
        mad = float(devs[mid])
    else:
        mad = (devs[mid - 1] + devs[mid]) / 2.0
    scale = 1.4826 * mad
    if scale == 0:
        return mu
    sw = 0.0
    swd = 0.0
    for v in data:
        d = v - mu
        ad = abs(d)
        limit = c * scale
        w = 1.0 if ad <= limit else limit / ad
        sw += w
        swd += w * d
    if sw == 0:
        return mu
    return mu + swd / sw`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 1.345], expected: 3.0 },
      { input: [[1, 2, 3, 10, 11], 1.345], expected: 4.223220825333151 },
      { input: [[5, 5, 5], 1.345], expected: 5.0 },
      { input: [[], 1.345], expected: 0.0 },
      { input: [[1, 2, 3, 4, 100], 1.345], expected: 3.0 },
    ],
    hint: "This is a single iteratively reweighted least squares update.",
  },
  {
    id: "st-114",
    title: "Jackknife Bias",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the jackknife bias estimate (n-1) * (mean of leave-one-out population variances - full-sample population variance). Return 0.0 when n < 2.",
    starterCode: `def jackknife_bias(data):
    # Your code here
    pass`,
    solution: `def jackknife_bias(data):
    n = len(data)
    if n < 2:
        return 0.0
    def population_variance(vals):
        m = sum(vals) / len(vals)
        return sum((v - m) ** 2 for v in vals) / len(vals)
    theta = population_variance(data)
    total = 0.0
    for i in range(n):
        vals = [data[j] for j in range(n) if j != i]
        total += population_variance(vals)
    return (n - 1) * (total / n - theta)`,
    testCases: [
      { input: [[1, 2, 3, 4, 5]], expected: -0.5 },
      { input: [[1, 1, 1]], expected: 0.0 },
      { input: [[1, 2]], expected: -0.25 },
      { input: [[10, 20, 30]], expected: -33.33333333333334 },
      { input: [[]], expected: 0.0 },
    ],
    hint: "Leave-one-out estimates reveal the finite-sample bias of the variance.",
  },
  {
    id: "st-115",
    title: "Effective Sample Size from Autocorrelation",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the effective sample size n*(1 - rho1)/(1 + rho1) for a series with lag-1 autocorrelation rho1. Return 0.0 when n <= 0 or rho1 is not in (-1, 1].",
    starterCode: `def effective_sample_size(n, rho1):
    # Your code here
    pass`,
    solution: `def effective_sample_size(n, rho1):
    if n <= 0 or rho1 <= -1 or rho1 > 1:
        return 0.0
    return n * (1.0 - rho1) / (1.0 + rho1)`,
    testCases: [
      { input: [100, 0.5], expected: 33.333333333333336 },
      { input: [100, 0.0], expected: 100.0 },
      { input: [100, -0.5], expected: 300.0 },
      { input: [50, 1.0], expected: 0.0 },
      { input: [10, -1.0], expected: 0.0 },
    ],
    hint: "Positive autocorrelation reduces the information each observation carries.",
  },
  {
    id: "st-116",
    title: "Cluster Sampling Variance",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the cluster sampling variance of the mean estimator sum((mean_j - grand)^2) / (M*(M-1)) for M cluster means. Return 0.0 when fewer than two clusters are given.",
    starterCode: `def cluster_sampling_variance(cluster_means):
    # Your code here
    pass`,
    solution: `def cluster_sampling_variance(cluster_means):
    m = len(cluster_means)
    if m < 2:
        return 0.0
    grand = sum(cluster_means) / m
    return sum((c - grand) ** 2 for c in cluster_means) / (m * (m - 1))`,
    testCases: [
      { input: [[1, 2, 3, 4]], expected: 0.4166666666666667 },
      { input: [[5, 5, 5]], expected: 0.0 },
      { input: [[1, 5]], expected: 4.0 },
      { input: [[1]], expected: 0.0 },
      { input: [[]], expected: 0.0 },
    ],
    hint: "Clusters act as the independent units.",
  },
  {
    id: "st-117",
    title: "Stratified Variance",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the stratified sampling variance sum(w_h^2 * var_h / n_h) for the given per-stratum variances, sample sizes, and weights. Strata with n_h <= 0 are skipped and empty input returns 0.0.",
    starterCode: `def stratified_variance(variances, sizes, weights):
    # Your code here
    pass`,
    solution: `def stratified_variance(variances, sizes, weights):
    if not variances or not sizes or not weights:
        return 0.0
    total = 0.0
    for v, n, w in zip(variances, sizes, weights):
        if n > 0:
            total += w * w * v / n
    return total`,
    testCases: [
      { input: [[4, 9], [10, 20], [0.5, 0.5]], expected: 0.21250000000000002 },
      { input: [[1], [10], [1]], expected: 0.1 },
      { input: [[4, 9], [10, 0], [0.5, 0.5]], expected: 0.1 },
      { input: [[], [], []], expected: 0.0 },
      { input: [[1, 1], [5, 5], [0.2, 0.8]], expected: 0.13600000000000004 },
    ],
    hint: "Each stratum contributes its weighted squared share.",
  },
  {
    id: "st-118",
    title: "Post-Stratification Weights",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "For each unit, return the post-stratification weight population_proportion / sample_proportion of its stratum, where the sample proportion is the unit count in that stratum divided by n. Return [] for empty input and 0.0 for a stratum missing from the population table.",
    starterCode: `def post_stratification_weights(strata, population_proportions):
    # Your code here
    pass`,
    solution: `def post_stratification_weights(strata, population_proportions):
    n = len(strata)
    if n == 0:
        return []
    counts = {}
    for s in strata:
        counts[s] = counts.get(s, 0) + 1
    weights = []
    for s in strata:
        pop = population_proportions.get(s, 0.0)
        sample = counts[s] / n
        if sample == 0:
            weights.append(0.0)
        else:
            weights.append(pop / sample)
    return weights`,
    testCases: [
      { input: [["a", "a", "b", "b", "b"], { a: 0.5, b: 0.5 }], expected: [1.25, 1.25, 0.8333333333333334, 0.8333333333333334, 0.8333333333333334] },
      { input: [["a"], { a: 1.0 }], expected: [1.0] },
      { input: [[], {}], expected: [] },
      { input: [["a", "b"], { a: 0.25, b: 0.75 }], expected: [0.5, 1.5] },
      { input: [["x"], {}], expected: [0.0] },
    ],
    hint: "Post-stratification reweights the sample to match known population margins.",
  },
  {
    id: "st-119",
    title: "Raking One Step",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Perform one multiplicative raking update on a 2D table of counts: w_ij = counts_ij * (row_target_i / row_margin_i) * (col_target_j / col_margin_j). Return a zeros table when the targets do not match the shape or any row or column margin is zero, and [] for an empty table.",
    starterCode: `def raking_one_step(counts, row_targets, col_targets):
    # Your code here
    pass`,
    solution: `def raking_one_step(counts, row_targets, col_targets):
    rows = len(counts)
    if rows == 0:
        return []
    cols = len(counts[0])
    if len(row_targets) != rows or len(col_targets) != cols:
        return [[0.0] * cols for _ in range(rows)]
    row_margins = [sum(row) for row in counts]
    col_margins = [sum(counts[i][j] for i in range(rows)) for j in range(cols)]
    for r in row_margins:
        if r == 0:
            return [[0.0] * cols for _ in range(rows)]
    for c in col_margins:
        if c == 0:
            return [[0.0] * cols for _ in range(rows)]
    out = []
    for i in range(rows):
        new_row = []
        for j in range(cols):
            w = counts[i][j] * (row_targets[i] / row_margins[i]) * (col_targets[j] / col_margins[j])
            new_row.append(w)
        out.append(new_row)
    return out`,
    testCases: [
      { input: [[[10, 20], [30, 40]], [40, 60], [50, 50]], expected: [[16.666666666666664, 22.22222222222222], [32.14285714285714, 28.571428571428573]] },
      { input: [[[5, 5], [5, 5]], [10, 10], [10, 10]], expected: [[5.0, 5.0], [5.0, 5.0]] },
      { input: [[], [10], [10]], expected: [] },
      { input: [[[1, 2], [3, 4]], [0, 10], [5, 5]], expected: [[0.0, 0.0], [5.357142857142857, 4.761904761904762]] },
      { input: [[[1, 2]], [3], [1, 5]], expected: [[1.0, 5.0]] },
    ],
    hint: "One raking step rescales rows and columns simultaneously.",
  },
  {
    id: "st-120",
    title: "IPW Mean",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the inverse probability weighted mean of the treated outcomes, (1/n) * sum(t_i*y_i/e_i) over all n units, where e_i is the propensity score. Return 0.0 when input lengths differ, any treated unit has e_i <= 0, or the input is empty.",
    starterCode: `def ipw_mean(treatment, outcome, propensity):
    # Your code here
    pass`,
    solution: `def ipw_mean(treatment, outcome, propensity):
    n = len(treatment)
    if n == 0 or len(outcome) != n or len(propensity) != n:
        return 0.0
    total = 0.0
    for t, y, e in zip(treatment, outcome, propensity):
        if t == 1:
            if e <= 0:
                return 0.0
            total += y / e
    return total / n`,
    testCases: [
      { input: [[1, 0, 1, 0], [10, 5, 8, 4], [0.5, 0.5, 0.4, 0.6]], expected: 10.0 },
      { input: [[0, 0], [1, 2], [0.2, 0.3]], expected: 0.0 },
      { input: [[1], [7], [0.7]], expected: 10.0 },
      { input: [[], [], []], expected: 0.0 },
      { input: [[1, 1], [2, 3], [0, 0.5]], expected: 0.0 },
    ],
    hint: "Treated units stand in for themselves and similar untreated units.",
  },
  {
    id: "st-121",
    title: "AIPW Estimate",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the augmented IPW estimate of the treated mean, (1/n)*sum(mu1_i + t_i*(y_i - mu1_i)/e_i), where mu1_i is the outcome model prediction. Return 0.0 when lengths differ, a treated unit has e_i <= 0, or the input is empty.",
    starterCode: `def aipw_estimate(treatment, outcome, propensity, mu1):
    # Your code here
    pass`,
    solution: `def aipw_estimate(treatment, outcome, propensity, mu1):
    n = len(treatment)
    if n == 0 or len(outcome) != n or len(propensity) != n or len(mu1) != n:
        return 0.0
    total = 0.0
    for t, y, e, m in zip(treatment, outcome, propensity, mu1):
        if t == 1:
            if e <= 0:
                return 0.0
            total += m + (y - m) / e
        else:
            total += m
    return total / n`,
    testCases: [
      { input: [[1, 0, 1, 0], [10, 5, 8, 4], [0.5, 0.5, 0.4, 0.6], [9, 6, 7, 5]], expected: 7.875 },
      { input: [[1], [7], [0.7], [6]], expected: 7.428571428571429 },
      { input: [[0, 0], [1, 2], [0.2, 0.3], [1.5, 2.5]], expected: 2.0 },
      { input: [[], [], [], []], expected: 0.0 },
      { input: [[1], [5], [0], [1]], expected: 0.0 },
    ],
    hint: "The model predictions are corrected by the weighted residuals.",
  },
  {
    id: "st-122",
    title: "Sequential Alpha Spending",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the O'Brien-Fleming alpha spending 2*(1 - Phi(z_crit / sqrt(t))) at information fraction t, where z_crit is the fixed-sample critical value. Return 0.0 when t is not in (0, 1].",
    starterCode: `import math
def alpha_spending(z_crit, information_fraction):
    # Your code here
    pass`,
    solution: `import math
def alpha_spending(z_crit, information_fraction):
    if information_fraction <= 0 or information_fraction > 1:
        return 0.0
    v = z_crit / (information_fraction ** 0.5)
    return 2.0 * (1.0 - 0.5 * (1.0 + math.erf(v / (2 ** 0.5))))`,
    testCases: [
      { input: [1.96, 0.5], expected: 0.005573724535172131 },
      { input: [1.96, 1.0], expected: 0.049995790296440745 },
      { input: [2.576, 0.25], expected: 2.577230360234495e-07 },
      { input: [1.96, 0.0], expected: 0.0 },
      { input: [1.645, 0.5], expected: 0.019998217783908867 },
    ],
    hint: "Very little alpha is spent early when the boundary is conservative.",
  },
  {
    id: "st-123",
    title: "Conditional Power",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the conditional power 1 - Phi((z_crit - z_interim/sqrt(t)) / sqrt(1-t)) under the current trend, given the interim z statistic and information fraction t. Return 0.0 when t is not strictly between 0 and 1.",
    starterCode: `import math
def conditional_power(z_interim, information_fraction, z_crit):
    # Your code here
    pass`,
    solution: `import math
def conditional_power(z_interim, information_fraction, z_crit):
    if information_fraction <= 0 or information_fraction >= 1:
        return 0.0
    drift = z_interim / (information_fraction ** 0.5)
    v = (z_crit - drift) / ((1.0 - information_fraction) ** 0.5)
    cp = 0.5 * (1.0 - math.erf(v / (2 ** 0.5)))
    if cp < 0:
        return 0.0
    if cp > 1:
        return 1.0
    return cp`,
    testCases: [
      { input: [2.0, 0.5, 1.96], expected: 0.8903030572815851 },
      { input: [1.0, 0.5, 1.96], expected: 0.2200990951703165 },
      { input: [3.0, 0.25, 1.96], expected: 0.9999984568410762 },
      { input: [0.0, 0.5, 1.96], expected: 0.0027868622675860655 },
      { input: [2.0, 1.0, 1.96], expected: 0.0 },
    ],
    hint: "It projects the interim drift to the final analysis.",
  },
  {
    id: "st-124",
    title: "Intraclass Correlation",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the ANOVA intraclass correlation (MSB - MSW) / (MSB + (m-1)*MSW) for equal-sized groups of size m. Return 0.0 when there are fewer than two groups, groups are empty or unequal in size, or the denominator is zero.",
    starterCode: `def intraclass_correlation(groups):
    # Your code here
    pass`,
    solution: `def intraclass_correlation(groups):
    k = len(groups)
    if k < 2:
        return 0.0
    sizes = [len(g) for g in groups]
    if any(s == 0 for s in sizes) or len(set(sizes)) != 1:
        return 0.0
    m = sizes[0]
    total_n = sum(sizes)
    if total_n <= k:
        return 0.0
    grand = sum(sum(g) for g in groups) / total_n
    ssb = 0.0
    ssw = 0.0
    for g in groups:
        mean = sum(g) / len(g)
        ssb += len(g) * (mean - grand) ** 2
        ssw += sum((v - mean) ** 2 for v in g)
    msb = ssb / (k - 1)
    msw = ssw / (total_n - k)
    denom = msb + (m - 1) * msw
    if denom == 0:
        return 0.0
    return (msb - msw) / denom`,
    testCases: [
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: 0.896551724137931 },
      { input: [[[1, 1, 1], [5, 5, 5]]], expected: 1.0 },
      { input: [[[1, 3, 5], [2, 3, 4]]], expected: -0.5 },
      { input: [[[1, 2], [2, 3]]], expected: 0.3333333333333333 },
      { input: [[[1], [2, 3]]], expected: 0.0 },
    ],
    hint: "It compares between-group and within-group mean squares.",
  },
  {
    id: "st-125",
    title: "Within Estimator",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the fixed-effects (within) slope after demeaning x and y within each id: sum(xc*yc)/sum(xc^2). Return 0.0 when lengths differ, the input is empty, or the within-variation of x is zero.",
    starterCode: `def within_estimator(x, y, ids):
    # Your code here
    pass`,
    solution: `def within_estimator(x, y, ids):
    n = len(x)
    if n == 0 or len(y) != n or len(ids) != n:
        return 0.0
    groups = {}
    for i in range(n):
        groups.setdefault(ids[i], []).append(i)
    num = 0.0
    den = 0.0
    for key in groups:
        idx = groups[key]
        mx = sum(x[i] for i in idx) / len(idx)
        my = sum(y[i] for i in idx) / len(idx)
        for i in idx:
            xc = x[i] - mx
            yc = y[i] - my
            num += xc * yc
            den += xc * xc
    if den == 0:
        return 0.0
    return num / den`,
    testCases: [
      { input: [[1, 2, 3, 4], [2, 4, 6, 8], ["a", "a", "b", "b"]], expected: 2.0 },
      { input: [[1, 2, 3], [1, 3, 5], ["a", "a", "b"]], expected: 2.0 },
      { input: [[1, 2], [2, 1], ["a", "a"]], expected: -1.0 },
      { input: [[1, 1, 2], [1, 3, 5], ["a", "a", "b"]], expected: 0.0 },
      { input: [[], [], []], expected: 0.0 },
    ],
    hint: "Entity means absorb all time-invariant differences.",
  },
  {
    id: "st-126",
    title: "First-Differences Estimator",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the first-differences slope sum(dx*dy)/sum(dx^2) over consecutive pairs of a time-ordered series. Return 0.0 when n < 3, lengths differ, or the differenced x values are all zero.",
    starterCode: `def first_differences_estimator(x, y):
    # Your code here
    pass`,
    solution: `def first_differences_estimator(x, y):
    n = len(x)
    if n < 3 or len(y) != n:
        return 0.0
    num = 0.0
    den = 0.0
    for i in range(1, n):
        dx = x[i] - x[i - 1]
        dy = y[i] - y[i - 1]
        num += dx * dy
        den += dx * dx
    if den == 0:
        return 0.0
    return num / den`,
    testCases: [
      { input: [[1, 2, 3, 4], [1, 3, 5, 7]], expected: 2.0 },
      { input: [[1, 2, 3], [2, 2, 2]], expected: 0.0 },
      { input: [[1, 3, 2, 5], [1, 5, 4, 9]], expected: 1.7142857142857142 },
      { input: [[1, 2], [1, 2]], expected: 0.0 },
      { input: [[1, 1, 2], [1, 2, 3]], expected: 1.0 },
    ],
    hint: "Differencing removes fixed effects before regressing.",
  },
  {
    id: "st-127",
    title: "Clustered Standard Error of the Mean",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the cluster-robust standard error of the mean: sqrt(G/(G-1) * sum_g (sum over i in g of (x_i - xbar))^2) / n. Inputs are the data and cluster ids. Return 0.0 when lengths differ, input is empty, or there are fewer than two clusters.",
    starterCode: `def clustered_se_mean(data, ids):
    # Your code here
    pass`,
    solution: `def clustered_se_mean(data, ids):
    n = len(data)
    if n == 0 or len(ids) != n:
        return 0.0
    groups = {}
    for i in range(n):
        groups.setdefault(ids[i], []).append(data[i])
    g = len(groups)
    if g < 2:
        return 0.0
    xbar = sum(data) / n
    total = 0.0
    for key in groups:
        s = 0.0
        for v in groups[key]:
            s += v - xbar
        total += s * s
    return (g * total / ((g - 1) * n * n)) ** 0.5`,
    testCases: [
      { input: [[1, 2, 3, 4], ["a", "a", "b", "b"]], expected: 1.0 },
      { input: [[1, 1, 2, 2], ["a", "a", "b", "b"]], expected: 0.5 },
      { input: [[1, 2, 3, 4], ["a", "b", "c", "d"]], expected: 0.6454972243679028 },
      { input: [[5, 5], ["a", "b"]], expected: 0.0 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Cluster-level score sums carry the sampling uncertainty.",
  },
  {
    id: "st-128",
    title: "Sandwich Standard Error",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the HC0 sandwich standard error of a simple regression slope: sqrt(sum(xc_i^2 e_i^2)) / Sxx with xc = x - mean(x). Return 0.0 when n < 3, lengths differ, or x has zero variance.",
    starterCode: `def sandwich_se(x, residuals):
    # Your code here
    pass`,
    solution: `def sandwich_se(x, residuals):
    n = len(x)
    if n < 3 or len(residuals) != n:
        return 0.0
    mx = sum(x) / n
    sxx = sum((v - mx) ** 2 for v in x)
    if sxx == 0:
        return 0.0
    total = sum(((x[i] - mx) ** 2) * (residuals[i] ** 2) for i in range(n))
    return (total ** 0.5) / sxx`,
    testCases: [
      { input: [[1, 2, 3, 4], [1, -1, 1, -1]], expected: 0.447213595499958 },
      { input: [[1, 2, 3, 4, 5], [1, 1, 1, 1, 1]], expected: 0.31622776601683794 },
      { input: [[1, 2, 3], [0, 0, 0]], expected: 0.0 },
      { input: [[1, 1, 2], [1, 2, 3]], expected: 3.2015621187164247 },
      { input: [[1, 2], [1, 1]], expected: 0.0 },
    ],
    hint: "The squared residuals make the variance robust to heteroscedasticity.",
  },
  {
    id: "st-129",
    title: "McNemar Confidence Interval",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the confidence interval for the paired proportion difference (b - c)/n_pairs with variance ((b+c) - (b-c)^2/n_pairs)/n_pairs^2, using the supplied critical value. Return [0.0, 0.0] when n_pairs <= 0 or b + c exceeds the number of pairs.",
    starterCode: `def mcnemar_ci(b, c, n_pairs, z_crit):
    # Your code here
    pass`,
    solution: `def mcnemar_ci(b, c, n_pairs, z_crit):
    if n_pairs <= 0 or b + c > n_pairs:
        return [0.0, 0.0]
    d = (b - c) / n_pairs
    var = ((b + c) - (b - c) ** 2 / n_pairs) / (n_pairs ** 2)
    if var < 0:
        var = 0.0
    half = z_crit * (var ** 0.5)
    return [d - half, d + half]`,
    testCases: [
      { input: [10, 2, 50, 1.96], expected: [0.03165366853703999, 0.28834633146296] },
      { input: [5, 5, 20, 1.96], expected: [-0.3099032106965012, 0.3099032106965012] },
      { input: [0, 0, 10, 1.96], expected: [0.0, 0.0] },
      { input: [3, 1, 10, 2.0], expected: [-0.17947331922020554, 0.5794733192202055] },
      { input: [20, 8, 100, 1.645], expected: [0.03522263037814867, 0.20477736962185134] },
    ],
    hint: "Only the discordant pairs drive the estimate.",
  },
  {
    id: "st-130",
    title: "Odds Ratio CI (Delta Method)",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the delta-method confidence interval for the odds ratio ad/(bc): exp(ln(OR) +/- z*sqrt(1/a + 1/b + 1/c + 1/d)). Return [0.0, 0.0] when any cell is zero.",
    starterCode: `import math
def odds_ratio_ci(a, b, c, d, z_crit):
    # Your code here
    pass`,
    solution: `import math
def odds_ratio_ci(a, b, c, d, z_crit):
    if a <= 0 or b <= 0 or c <= 0 or d <= 0:
        return [0.0, 0.0]
    odds = (a * d) / (b * c)
    se = (1.0 / a + 1.0 / b + 1.0 / c + 1.0 / d) ** 0.5
    return [odds * math.exp(-z_crit * se), odds * math.exp(z_crit * se)]`,
    testCases: [
      { input: [20, 80, 10, 90, 1.96], expected: [0.994279971565182, 5.091624235405931] },
      { input: [10, 10, 10, 10, 1.96], expected: [0.289496276817444, 3.4542758580297694] },
      { input: [5, 0, 1, 1, 1.96], expected: [0.0, 0.0] },
      { input: [1, 1, 1, 1, 1.645], expected: [0.03725384939621581, 26.842863655898565] },
      { input: [30, 70, 15, 85, 1.96], expected: [1.210983724248975, 4.870386831442554] },
    ],
    hint: "The log odds ratio has an easily computed standard error.",
  },
  {
    id: "st-131",
    title: "Risk Difference Confidence Interval",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the Wald confidence interval for the risk difference a/(a+b) - c/(c+d) with standard error sqrt(p1(1-p1)/n1 + p2(1-p2)/n2). Return [0.0, 0.0] when either group is empty.",
    starterCode: `def risk_difference_ci(a, b, c, d, z_crit):
    # Your code here
    pass`,
    solution: `def risk_difference_ci(a, b, c, d, z_crit):
    n1 = a + b
    n2 = c + d
    if n1 <= 0 or n2 <= 0:
        return [0.0, 0.0]
    p1 = a / n1
    p2 = c / n2
    rd = p1 - p2
    se = (p1 * (1.0 - p1) / n1 + p2 * (1.0 - p2) / n2) ** 0.5
    half = z_crit * se
    return [rd - half, rd + half]`,
    testCases: [
      { input: [20, 80, 10, 90, 1.96], expected: [0.0020000000000000018, 0.198] },
      { input: [10, 10, 10, 10, 1.96], expected: [-0.3099032106965012, 0.3099032106965012] },
      { input: [5, 0, 1, 1, 1.96], expected: [-0.19296464556281656, 1.1929646455628165] },
      { input: [0, 10, 5, 5, 2.0], expected: [-0.816227766016838, -0.18377223398316206] },
      { input: [0, 0, 1, 1, 1.96], expected: [0.0, 0.0] },
    ],
    hint: "The two groups are treated as independent samples.",
  },
  {
    id: "st-132",
    title: "Bootstrap-t Confidence Interval",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Return the bootstrap-t confidence interval for the mean using n_boot resamples drawn with a self-contained Lehmer RNG seeded with seed (state = seed % 2147483647, next = state * 48271 % 2147483647). Convert z_crit to a tail probability with the normal CDF, take the alpha/2 and 1-alpha/2 percentiles of the studentized resample statistics with linear interpolation, and pivot them back to the mean scale. Return [0.0, 0.0] when n < 2 or n_boot <= 0.",
    starterCode: `import math
def bootstrap_t_ci(data, n_boot, seed, z_crit):
    # Your code here
    pass`,
    solution: `import math
def bootstrap_t_ci(data, n_boot, seed, z_crit):
    n = len(data)
    if n < 2 or n_boot <= 0:
        return [0.0, 0.0]
    state = seed % 2147483647
    if state <= 0:
        state = state + 2147483646
    m = sum(data) / n
    s2 = sum((v - m) ** 2 for v in data) / (n - 1)
    if s2 <= 0:
        return [m, m]
    s = s2 ** 0.5
    ts = []
    for _ in range(n_boot):
        total = 0.0
        total2 = 0.0
        for _ in range(n):
            state = (state * 48271) % 2147483647
            v = data[state % n]
            total += v
            total2 += v * v
        mb = total / n
        vb = (total2 - n * mb * mb) / (n - 1)
        sb = vb ** 0.5 if vb > 0 else 0.0
        if sb == 0:
            ts.append(0.0)
        else:
            ts.append((mb - m) / (sb / (n ** 0.5)))
    ts.sort()
    alpha = 2.0 * (1.0 - 0.5 * (1.0 + math.erf(z_crit / (2 ** 0.5))))
    def pct(p):
        rank = (p / 100.0) * (len(ts) - 1)
        lo = int(rank)
        frac = rank - lo
        if lo >= len(ts) - 1:
            return ts[-1]
        return ts[lo] + frac * (ts[lo + 1] - ts[lo])
    q_lo = pct(100.0 * alpha / 2.0)
    q_hi = pct(100.0 * (1.0 - alpha / 2.0))
    return [m - q_hi * s / (n ** 0.5), m - q_lo * s / (n ** 0.5)]`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 200, 7, 1.96], expected: [0.7639320225002102, 4.582887063211015] },
      { input: [[10, 20, 30, 40], 300, 99, 1.645], expected: [14.88700206305137, 44.364916731037084] },
      { input: [[5], 10, 1, 1.96], expected: [0.0, 0.0] },
      { input: [[], 10, 1, 1.96], expected: [0.0, 0.0] },
      { input: [[1, 2], 50, 3, 1.96], expected: [1.5, 1.5] },
    ],
    hint: "Studentize each resample before taking percentiles.",
  },
  {
    id: "st-133",
    title: "Permutation p-Value for Difference in Medians",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Run a two-sided permutation test on the difference in medians between x and y using n_perm label shuffles driven by the seeded Lehmer RNG. Return (count + 1)/(n_perm + 1), where count is the number of permuted absolute median differences at least as large as the observed one; return 1.0 for empty input or n_perm <= 0. Unlike the mean version, this statistic is robust to outliers.",
    starterCode: `def permutation_p_value_medians(x, y, n_perm, seed):
    # Your code here
    pass`,
    solution: `def permutation_p_value_medians(x, y, n_perm, seed):
    if not x or not y or n_perm <= 0:
        return 1.0
    state = seed % 2147483647
    if state <= 0:
        state = state + 2147483646
    combined = list(x) + list(y)
    nx = len(x)
    def med(vals):
        s = sorted(vals)
        m = len(s)
        mid = m // 2
        if m % 2:
            return float(s[mid])
        return (s[mid - 1] + s[mid]) / 2.0
    obs = med(x) - med(y)
    count = 0
    for _ in range(n_perm):
        for i in range(len(combined) - 1, 0, -1):
            state = (state * 48271) % 2147483647
            j = state % (i + 1)
            combined[i], combined[j] = combined[j], combined[i]
        diff = med(combined[:nx]) - med(combined[nx:])
        if abs(diff) >= abs(obs):
            count += 1
    return (count + 1) / (n_perm + 1)`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10], 100, 42], expected: 0.09900990099009901 },
      { input: [[1, 2, 3, 4, 5], [3, 4, 5, 6, 7], 100, 7], expected: 0.32673267326732675 },
      { input: [[5, 5, 5], [1, 2, 3], 50, 3], expected: 0.3137254901960784 },
      { input: [[], [1], 10, 1], expected: 1.0 },
      { input: [[1], [2], 0, 1], expected: 1.0 },
    ],
    hint: "Shuffle labels with Fisher-Yates, then recompute the median difference.",
  },
  {
    id: "st-134",
    title: "Randomization Sign-Flip p-Value",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Run a two-sided sign-flip randomization test on paired differences using n_perm sign vectors drawn from the seeded Lehmer RNG (an even draw keeps the sign, an odd draw flips it). Return (count + 1)/(n_perm + 1), where count counts permuted absolute means at least as large as the observed absolute mean; return 1.0 for empty input or n_perm <= 0.",
    starterCode: `def sign_flip_p_value(diffs, n_perm, seed):
    # Your code here
    pass`,
    solution: `def sign_flip_p_value(diffs, n_perm, seed):
    n = len(diffs)
    if n == 0 or n_perm <= 0:
        return 1.0
    state = seed % 2147483647
    if state <= 0:
        state = state + 2147483646
    obs = sum(diffs) / n
    count = 0
    for _ in range(n_perm):
        s = 0.0
        for i in range(n):
            state = (state * 48271) % 2147483647
            s += diffs[i] if state % 2 == 0 else -diffs[i]
        if abs(s / n) >= abs(obs):
            count += 1
    return (count + 1) / (n_perm + 1)`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 100, 42], expected: 0.0594059405940594 },
      { input: [[1, -1, 1, -1], 100, 7], expected: 1.0 },
      { input: [[2, 2, 2], 50, 1], expected: 0.2549019607843137 },
      { input: [[], 10, 1], expected: 1.0 },
      { input: [[1], 0, 1], expected: 1.0 },
    ],
    hint: "Under the null each pair's sign is exchangeable.",
  },
  {
    id: "st-135",
    title: "Block Bootstrap Standard Error",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Return the block bootstrap standard error of the mean: split data into non-overlapping blocks of length block_len, resample the blocks with replacement using the seeded Lehmer RNG, and return the population standard deviation of the resample means. Return 0.0 when data is empty, n_boot <= 0, or block_len is not in [1, n].",
    starterCode: `def block_bootstrap_se(data, block_len, n_boot, seed):
    # Your code here
    pass`,
    solution: `def block_bootstrap_se(data, block_len, n_boot, seed):
    n = len(data)
    if n == 0 or n_boot <= 0 or block_len <= 0 or block_len > n:
        return 0.0
    nb = n // block_len
    blocks = [data[i * block_len:(i + 1) * block_len] for i in range(nb)]
    state = seed % 2147483647
    if state <= 0:
        state = state + 2147483646
    means = []
    for _ in range(n_boot):
        total = 0.0
        for _ in range(nb):
            state = (state * 48271) % 2147483647
            blk = blocks[state % nb]
            total += sum(blk)
        means.append(total / (nb * block_len))
    mean_b = sum(means) / len(means)
    var = sum((v - mean_b) ** 2 for v in means) / len(means)
    return var ** 0.5`,
    testCases: [
      { input: [[1, 2, 3, 4, 5, 6], 2, 200, 7], expected: 0.9854440623394105 },
      { input: [[1, 2, 3, 4, 5], 2, 300, 42], expected: 0.6925315877272313 },
      { input: [[5, 5, 5, 5], 2, 100, 1], expected: 0.0 },
      { input: [[1, 2, 3], 5, 100, 1], expected: 0.0 },
      { input: [[], 2, 100, 1], expected: 0.0 },
    ],
    hint: "Whole blocks preserve short-range dependence.",
  },
  {
    id: "st-136",
    title: "Bootstrap CI for ATE",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Return the percentile bootstrap confidence interval for the average treatment effect. Resample the treated and control outcomes separately with replacement using the seeded Lehmer RNG, compute the difference of means each time, and return the alpha/2 and 1-alpha/2 percentiles with linear interpolation. Return [0.0, 0.0] when either group is empty, lengths differ, or n_boot <= 0.",
    starterCode: `def bootstrap_ate_ci(y, treatment, n_boot, seed, alpha):
    # Your code here
    pass`,
    solution: `def bootstrap_ate_ci(y, treatment, n_boot, seed, alpha):
    n = len(y)
    if n == 0 or len(treatment) != n or n_boot <= 0:
        return [0.0, 0.0]
    treated = [y[i] for i in range(n) if treatment[i] == 1]
    control = [y[i] for i in range(n) if treatment[i] == 0]
    n1 = len(treated)
    n0 = len(control)
    if n1 == 0 or n0 == 0:
        return [0.0, 0.0]
    state = seed % 2147483647
    if state <= 0:
        state = state + 2147483646
    diffs = []
    for _ in range(n_boot):
        s1 = 0.0
        for _ in range(n1):
            state = (state * 48271) % 2147483647
            s1 += treated[state % n1]
        s0 = 0.0
        for _ in range(n0):
            state = (state * 48271) % 2147483647
            s0 += control[state % n0]
        diffs.append(s1 / n1 - s0 / n0)
    diffs.sort()
    def pct(p):
        rank = (p / 100.0) * (len(diffs) - 1)
        lo = int(rank)
        frac = rank - lo
        if lo >= len(diffs) - 1:
            return diffs[-1]
        return diffs[lo] + frac * (diffs[lo + 1] - diffs[lo])
    return [pct(100.0 * alpha / 2.0), pct(100.0 * (1.0 - alpha / 2.0))]`,
    testCases: [
      { input: [[10, 12, 9, 11, 5, 6, 4, 7], [1, 1, 1, 1, 0, 0, 0, 0], 200, 7, 0.05], expected: [3.4937500000000004, 6.256250000000001] },
      { input: [[1, 2], [1, 0], 100, 3, 0.1], expected: [-1.0, -1.0] },
      { input: [[1], [1], 50, 1, 0.05], expected: [0.0, 0.0] },
      { input: [[], [], 10, 1, 0.05], expected: [0.0, 0.0] },
      { input: [[1, 2, 3, 4], [1, 0, 1, 0], 100, 42, 0.1], expected: [-3.0, 1.0] },
    ],
    hint: "Resample within arms to respect the treatment design.",
  },
  {
    id: "st-137",
    title: "Wild Bootstrap Standard Error",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Return the wild bootstrap standard error of the mean: center the data, multiply each centered value by a random sign from the seeded Lehmer RNG (an even draw means +1, an odd draw means -1), and take the population standard deviation of the resulting bootstrap means. Return 0.0 for empty data or n_boot <= 0.",
    starterCode: `def wild_bootstrap_se(data, n_boot, seed):
    # Your code here
    pass`,
    solution: `def wild_bootstrap_se(data, n_boot, seed):
    n = len(data)
    if n == 0 or n_boot <= 0:
        return 0.0
    state = seed % 2147483647
    if state <= 0:
        state = state + 2147483646
    m = sum(data) / n
    centered = [v - m for v in data]
    means = []
    for _ in range(n_boot):
        s = 0.0
        for i in range(n):
            state = (state * 48271) % 2147483647
            s += centered[i] if state % 2 == 0 else -centered[i]
        means.append(m + s / n)
    mean_b = sum(means) / len(means)
    var = sum((v - mean_b) ** 2 for v in means) / len(means)
    return var ** 0.5`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 200, 7], expected: 0.6105603983227211 },
      { input: [[5, 5, 5], 100, 1], expected: 0.0 },
      { input: [[1, 2], 100, 3], expected: 0.3054095610815091 },
      { input: [[], 10, 1], expected: 0.0 },
      { input: [[10, 20, 30], 50, 42], expected: 4.349201714746692 },
    ],
    hint: "Random signs preserve heteroscedasticity without permuting values.",
  },
  {
    id: "st-138",
    title: "Newey-West Lite Standard Error",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Return the Newey-West standard error of the mean with one lag: sqrt((gamma0 + 2*gamma1)/n), where gamma0 and gamma1 are the lag-0 and lag-1 autocovariances with denominator n. Return 0.0 when n < 2, the series is constant, or the long-run variance is negative.",
    starterCode: `def newey_west_lite_se(data):
    # Your code here
    pass`,
    solution: `def newey_west_lite_se(data):
    n = len(data)
    if n < 2:
        return 0.0
    m = sum(data) / n
    gamma0 = sum((v - m) ** 2 for v in data) / n
    if gamma0 == 0:
        return 0.0
    gamma1 = sum((data[i] - m) * (data[i - 1] - m) for i in range(1, n)) / n
    long_run = (gamma0 + 2.0 * gamma1) / n
    if long_run < 0:
        return 0.0
    return long_run ** 0.5`,
    testCases: [
      { input: [[1, 2, 3, 4, 5]], expected: 0.848528137423857 },
      { input: [[1, -1, 1, -1, 1]], expected: 0.0 },
      { input: [[3, 3]], expected: 0.0 },
      { input: [[1, 2]], expected: 0.0 },
      { input: [[2, 4, 6, 8]], expected: 1.3693063937629153 },
    ],
    hint: "The lag correction accounts for serial correlation.",
  },
  {
    id: "st-139",
    title: "NNT Confidence Interval",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Return [NNT, low, high] where NNT = 1/|RD| for the risk difference a/(a+b) - c/(c+d), and the bounds are 1/|CI endpoints| sorted ascending, using the supplied critical value. Return [0.0, 0.0, 0.0] when a group is empty, the risk difference is zero, or the confidence interval contains zero.",
    starterCode: `def nnt_ci(a, b, c, d, z_crit):
    # Your code here
    pass`,
    solution: `def nnt_ci(a, b, c, d, z_crit):
    n1 = a + b
    n2 = c + d
    if n1 <= 0 or n2 <= 0:
        return [0.0, 0.0, 0.0]
    p1 = a / n1
    p2 = c / n2
    rd = p1 - p2
    if rd == 0:
        return [0.0, 0.0, 0.0]
    se = (p1 * (1.0 - p1) / n1 + p2 * (1.0 - p2) / n2) ** 0.5
    lo = rd - z_crit * se
    hi = rd + z_crit * se
    if lo <= 0 <= hi:
        return [0.0, 0.0, 0.0]
    nnt = 1.0 / abs(rd)
    c1 = 1.0 / abs(lo)
    c2 = 1.0 / abs(hi)
    if c1 > c2:
        c1, c2 = c2, c1
    return [nnt, c1, c2]`,
    testCases: [
      { input: [20, 80, 10, 90, 1.96], expected: [10.0, 5.05050505050505, 499.99999999999955] },
      { input: [10, 10, 10, 10, 1.96], expected: [0.0, 0.0, 0.0] },
      { input: [30, 70, 15, 85, 1.96], expected: [6.666666666666667, 3.789806559425875, 27.67454433101525] },
      { input: [0, 10, 5, 5, 2.0], expected: [2.0, 1.2251482265544136, 5.441518440112253] },
      { input: [5, 0, 1, 1, 1.96], expected: [0.0, 0.0, 0.0] },
    ],
    hint: "Confidence limits for NNT are reciprocals of the risk-difference limits.",
  },
  {
    id: "st-140",
    title: "Paired t Confidence Interval on CV Folds",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Return the paired confidence interval for the mean difference between model A and model B across cross-validation folds: mean(d) +/- t_crit * sd(d)/sqrt(k) with d = fold_a - fold_b. Return [0.0, 0.0] when fewer than two folds or lengths differ, and [mean(d), mean(d)] when the differences are constant.",
    starterCode: `def paired_ci_cv(fold_a, fold_b, t_crit):
    # Your code here
    pass`,
    solution: `def paired_ci_cv(fold_a, fold_b, t_crit):
    n = len(fold_a)
    if n < 2 or len(fold_b) != n:
        return [0.0, 0.0]
    d = [fold_a[i] - fold_b[i] for i in range(n)]
    md = sum(d) / n
    s2 = sum((v - md) ** 2 for v in d) / (n - 1)
    if s2 <= 0:
        return [md, md]
    half = t_crit * (s2 ** 0.5) / (n ** 0.5)
    return [md - half, md + half]`,
    testCases: [
      { input: [[0.9, 0.8, 0.85, 0.87], [0.8, 0.75, 0.8, 0.79], 2.353], expected: [0.0411817531761559, 0.09881824682384406] },
      { input: [[1, 2, 3], [1, 2, 3], 2.0], expected: [0.0, 0.0] },
      { input: [[0.5, 0.6], [0.4, 0.5], 12.706], expected: [0.09999999999999998, 0.09999999999999998] },
      { input: [[1], [2], 2.0], expected: [0.0, 0.0] },
      { input: [[], [], 2.0], expected: [0.0, 0.0] },
    ],
    hint: "Treat the folds as paired observations and use the supplied t critical value.",
  },
];
