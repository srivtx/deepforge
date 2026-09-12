import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "ml-271",
    title: "Propensity Newton Step",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Perform one Newton-Raphson step for a logistic propensity model p = sigmoid(b + w*x). Compute the average gradient g = [mean(p - t), mean((p - t)*x)] and the average Hessian H = [[mean(p(1-p)), mean(p(1-p)x)], [mean(p(1-p)x), mean(p(1-p)x^2)]], then update [b, w] by H^-1 g.\n\nReturn [b_new, w_new]; if H is singular or the input is empty, return [b, w].",
    starterCode: `import math
def propensity_newton(X, t, b, w):
    # Returns [b_new, w_new]
    # Your code here
    pass`,
    solution: `import math
def propensity_newton(X, t, b, w):
    n = len(X)
    if n == 0:
        return [b, w]
    preds = []
    for i in range(n):
        z = b + w * X[i]
        if z >= 0:
            preds.append(1.0 / (1.0 + math.exp(-z)))
        else:
            ez = math.exp(z)
            preds.append(ez / (1.0 + ez))
    gb = sum(preds[i] - t[i] for i in range(n)) / n
    gw = sum((preds[i] - t[i]) * X[i] for i in range(n)) / n
    h00 = sum(preds[i] * (1 - preds[i]) for i in range(n)) / n
    h01 = sum(preds[i] * (1 - preds[i]) * X[i] for i in range(n)) / n
    h11 = sum(preds[i] * (1 - preds[i]) * X[i] * X[i] for i in range(n)) / n
    det = h00 * h11 - h01 * h01
    if det == 0:
        return [b, w]
    db = (h11 * gb - h01 * gw) / det
    dw = (h00 * gw - h01 * gb) / det
    return [b - db, w - dw]`,
    testCases: [
      { input: [[1, 2, 3], [0, 1, 1], 0, 0], expected: [-3.3333333333333313, 1.9999999999999991] },
      { input: [[1, 2, 3], [0, 0, 1], 0, 0], expected: [-4.666666666666664, 1.9999999999999991] },
      { input: [[1, 1], [1, 1], 0, 0], expected: [0, 0] },
      { input: [[], [], 0.5, 1.0], expected: [0.5, 1.0] },
    ],
    hint: "Newton steps use curvature, not just the gradient, so they converge in few iterations.",
  },
  {
    id: "ml-272",
    title: "IPW Variance",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the variance of the IPW average treatment effect estimator. For each unit form the influence term t*y/e - (1-t)*y/(1-e) with e clipped to [1e-6, 1 - 1e-6], then return the population variance of those terms divided by n.\n\nEmpty input returns 0.0.",
    starterCode: `def ipw_variance(treatment, outcome, propensity):
    # Your code here
    pass`,
    solution: `def ipw_variance(treatment, outcome, propensity):
    n = len(treatment)
    if n == 0:
        return 0.0
    terms = []
    for i in range(n):
        e = min(max(propensity[i], 1e-6), 1.0 - 1e-6)
        if treatment[i] == 1:
            terms.append(outcome[i] / e)
        else:
            terms.append(-outcome[i] / (1.0 - e))
    mean = sum(terms) / n
    var = sum((v - mean) ** 2 for v in terms) / n
    return var / n`,
    testCases: [
      { input: [[1, 1, 0, 0], [1, 0, 1, 0], [0.5, 0.5, 0.5, 0.5]], expected: 0.5 },
      { input: [[1, 0], [2, 1], [0.8, 0.5]], expected: 2.53125 },
      { input: [[1], [1], [1.0]], expected: 0.0 },
      { input: [[], [], []], expected: 0.0 },
    ],
    hint: "The variance shrinks with n and grows when propensities are extreme.",
  },
  {
    id: "ml-273",
    title: "Stabilized Weights",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute stabilized inverse propensity weights. Let p1 be the treated fraction; treated units get p1/e and controls get (1-p1)/(1-e), with e clipped to [1e-6, 1 - 1e-6].\n\nReturn the list of weights; empty input returns [].",
    starterCode: `def stabilized_weights(treatment, propensity):
    # Your code here
    pass`,
    solution: `def stabilized_weights(treatment, propensity):
    n = len(treatment)
    if n == 0:
        return []
    p1 = sum(treatment) / n
    result = []
    for i in range(n):
        e = min(max(propensity[i], 1e-6), 1.0 - 1e-6)
        if treatment[i] == 1:
            result.append(p1 / e)
        else:
            result.append((1.0 - p1) / (1.0 - e))
    return result`,
    testCases: [
      { input: [[1, 0], [0.8, 0.4]], expected: [0.625, 0.8333333333333334] },
      { input: [[1, 1, 0, 0], [0.5, 0.5, 0.5, 0.5]], expected: [1.0, 1.0, 1.0, 1.0] },
      { input: [[], []], expected: [] },
    ],
    hint: "Multiplying by the marginal treatment probability keeps weights near 1.",
  },
  {
    id: "ml-274",
    title: "Overlap Fraction",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the fraction of propensity scores inside the overlap region [lower, upper] (inclusive).\n\nEmpty input returns 0.0.",
    starterCode: `def overlap_fraction(propensities, lower, upper):
    # Your code here
    pass`,
    solution: `def overlap_fraction(propensities, lower, upper):
    if not propensities:
        return 0.0
    count = sum(1 for e in propensities if lower <= e <= upper)
    return count / len(propensities)`,
    testCases: [
      { input: [[0.05, 0.5, 0.95, 0.2], 0.1, 0.9], expected: 0.5 },
      { input: [[0.2, 0.3, 0.4], 0.1, 0.9], expected: 1.0 },
      { input: [[0.05], 0.1, 0.9], expected: 0.0 },
      { input: [[], 0.1, 0.9], expected: 0.0 },
    ],
    hint: "Only units in the overlap region support causal comparisons.",
  },
  {
    id: "ml-275",
    title: "Positivity Violation Indices",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Return the sorted indices of propensity scores violating positivity: e < eps or e > 1 - eps.\n\nEmpty input returns [].",
    starterCode: `def positivity_violations(propensities, eps):
    # Your code here
    pass`,
    solution: `def positivity_violations(propensities, eps):
    result = []
    for i in range(len(propensities)):
        if propensities[i] < eps or propensities[i] > 1.0 - eps:
            result.append(i)
    return result`,
    testCases: [
      { input: [[0.01, 0.5, 0.99, 0.05], 0.05], expected: [0, 2] },
      { input: [[0.1, 0.9], 0.05], expected: [] },
      { input: [[0.5, 0.5], 0.5], expected: [] },
      { input: [[], 0.05], expected: [] },
    ],
    hint: "Near 0 or 1 propensities make inverse weighting explode.",
  },
  {
    id: "ml-276",
    title: "IV First Stage Coefficients",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Fit the first stage of instrumental variables by OLS of the endogenous regressor x on the instrument z with an intercept.\n\nReturn [intercept, slope]; if z is constant return [mean(x), 0.0], and empty input returns [0.0, 0.0].",
    starterCode: `def iv_first_stage(z, x):
    # Returns [intercept, slope]
    # Your code here
    pass`,
    solution: `def iv_first_stage(z, x):
    n = len(z)
    if n == 0:
        return [0.0, 0.0]
    mz = sum(z) / n
    mx = sum(x) / n
    szz = sum((v - mz) ** 2 for v in z)
    if szz == 0:
        return [mx, 0.0]
    sxz = sum((z[i] - mz) * (x[i] - mx) for i in range(n))
    b = sxz / szz
    return [mx - b * mz, b]`,
    testCases: [
      { input: [[1, 2, 3, 4], [2, 4, 6, 8]], expected: [0.0, 2.0] },
      { input: [[1, 2, 3], [3, 5, 4]], expected: [3.0, 0.5] },
      { input: [[2, 2, 2], [1, 2, 3]], expected: [2.0, 0.0] },
      { input: [[], []], expected: [0.0, 0.0] },
    ],
    hint: "The instrument must move the endogenous regressor for 2SLS to work.",
  },
  {
    id: "ml-277",
    title: "2SLS Second Stage",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Perform the second stage of two-stage least squares: fit x_hat from the first-stage OLS of x on z, then regress y on x_hat with an intercept.\n\nReturn [intercept, slope]; if the first stage is degenerate return [mean(y), 0.0], and empty input returns [0.0, 0.0].",
    starterCode: `def tsls_second_stage(z, x, y):
    # Returns [intercept, slope]
    # Your code here
    pass`,
    solution: `def tsls_second_stage(z, x, y):
    n = len(z)
    if n == 0:
        return [0.0, 0.0]
    def first_stage():
        mz = sum(z) / n
        mx = sum(x) / n
        szz = sum((v - mz) ** 2 for v in z)
        if szz == 0:
            return [mx, 0.0]
        sxz = sum((z[i] - mz) * (x[i] - mx) for i in range(n))
        b = sxz / szz
        return [mx - b * mz, b]
    a, b = first_stage()
    xhat = [a + b * z[i] for i in range(n)]
    my = sum(y) / n
    mxh = sum(xhat) / n
    sxx = sum((v - mxh) ** 2 for v in xhat)
    if sxx == 0:
        return [my, 0.0]
    sxy = sum((xhat[i] - mxh) * (y[i] - my) for i in range(n))
    slope = sxy / sxx
    return [my - slope * mxh, slope]`,
    testCases: [
      { input: [[1, 2, 3, 4], [2, 4, 6, 8], [1, 3, 5, 7]], expected: [-1.0, 1.0] },
      { input: [[1, 2, 3], [3, 5, 4], [1, 2, 4]], expected: [-9.666666666666666, 3.0] },
      { input: [[2, 2, 2], [1, 2, 3], [5, 6, 7]], expected: [6.0, 0.0] },
      { input: [[], [], []], expected: [0.0, 0.0] },
    ],
    hint: "The second stage regresses the outcome on the instrument-fitted regressor.",
  },
  {
    id: "ml-278",
    title: "Weak Instrument F",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Compute the first-stage F statistic for a weak instrument: with R^2 the squared Pearson correlation between z and x, F = R^2 * (n - 2) / (1 - R^2).\n\nReturn 0.0 when n < 3, a variance is 0, or |r| is 1.",
    starterCode: `def weak_instrument_f(z, x):
    # Your code here
    pass`,
    solution: `def weak_instrument_f(z, x):
    n = len(z)
    if n < 3:
        return 0.0
    mz = sum(z) / n
    mx = sum(x) / n
    szz = sum((v - mz) ** 2 for v in z) / n
    sxx = sum((v - mx) ** 2 for v in x) / n
    if szz == 0 or sxx == 0:
        return 0.0
    cov = sum((z[i] - mz) * (x[i] - mx) for i in range(n)) / n
    r2 = (cov / (szz ** 0.5 * sxx ** 0.5)) ** 2
    if r2 >= 1.0 - 1e-12:
        return 0.0
    return r2 * (n - 2) / (1.0 - r2)`,
    testCases: [
      { input: [[1, 2, 3, 4], [2, 4, 6, 8]], expected: 0.0 },
      { input: [[1, 2, 3, 4], [1, 3, 2, 5]], expected: 4.481481481481476 },
      { input: [[1, 1, 1], [1, 2, 3]], expected: 0.0 },
      { input: [[1, 2], [1, 2]], expected: 0.0 },
    ],
    hint: "Rule of thumb: first-stage F below 10 signals a weak instrument.",
  },
  {
    id: "ml-279",
    title: "RD Bandwidth Rule",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute a rule-of-thumb regression discontinuity bandwidth: 1.06 * std * n^(-1/5) using the population standard deviation.\n\nEmpty input returns 0.0.",
    starterCode: `def bandwidth_rule(values):
    # Your code here
    pass`,
    solution: `def bandwidth_rule(values):
    n = len(values)
    if n == 0:
        return 0.0
    mean = sum(values) / n
    std = (sum((v - mean) ** 2 for v in values) / n) ** 0.5
    return 1.06 * std * n ** (-0.2)`,
    testCases: [
      { input: [[1, 2, 3, 4]], expected: 0.8981499984950554 },
      { input: [[5, 5, 5]], expected: 0.0 },
      { input: [[0]], expected: 0.0 },
      { input: [[]], expected: 0.0 },
    ],
    hint: "This plug-in rule shrinks the bandwidth as the sample grows.",
  },
  {
    id: "ml-280",
    title: "Fuzzy RD Treatment Jump",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the fuzzy regression discontinuity treatment jump: the difference in mean treatment take-up between points just above and just below the cutoff within the bandwidth, using cutoff - bandwidth <= x < cutoff and cutoff <= x <= cutoff + bandwidth.\n\nReturn 0.0 if either side is empty.",
    starterCode: `def fuzzy_rd_jump(X, treatment, cutoff, bandwidth):
    # Your code here
    pass`,
    solution: `def fuzzy_rd_jump(X, treatment, cutoff, bandwidth):
    left = [i for i in range(len(X)) if cutoff - bandwidth <= X[i] < cutoff]
    right = [i for i in range(len(X)) if cutoff <= X[i] <= cutoff + bandwidth]
    if not left or not right:
        return 0.0
    ml = sum(treatment[i] for i in left) / len(left)
    mr = sum(treatment[i] for i in right) / len(right)
    return mr - ml`,
    testCases: [
      { input: [[1, 2, 3, 4, 5, 6], [0, 0, 1, 1, 1, 1], 3, 2], expected: 1.0 },
      { input: [[1, 2, 3, 4, 5, 6], [0, 0, 0.5, 1, 1, 1], 3, 2], expected: 0.8333333333333334 },
      { input: [[1, 2], [0, 1], 5, 1], expected: 0.0 },
    ],
    hint: "In a fuzzy design the cutoff shifts the probability of treatment rather than determining it.",
  },
  {
    id: "ml-281",
    title: "Parallel Trends Check",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Check the parallel trends assumption: compute the treated-minus-control difference in each pre period and return True when every difference is within tolerance of their mean.\n\nEmpty input returns True.",
    starterCode: `def parallel_trends_check(treat_pre, control_pre, tolerance):
    # Your code here
    pass`,
    solution: `def parallel_trends_check(treat_pre, control_pre, tolerance):
    if not treat_pre:
        return True
    diffs = [treat_pre[i] - control_pre[i] for i in range(len(treat_pre))]
    mean = sum(diffs) / len(diffs)
    return all(abs(d - mean) <= tolerance for d in diffs)`,
    testCases: [
      { input: [[10, 12, 14], [8, 10, 12], 0.1], expected: true },
      { input: [[10, 12, 14], [8, 10, 11], 0.5], expected: false },
      { input: [[], [], 0.1], expected: true },
    ],
    hint: "A stable pre-period gap supports the difference-in-differences design.",
  },
  {
    id: "ml-282",
    title: "Event Study Average",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Average the post-event coefficients of an event study: the mean of the coefficients whose event time is at least event_index.\n\nReturn 0.0 when there are no post periods.",
    starterCode: `def event_study_average(coefficients, event_times, event_index):
    # Your code here
    pass`,
    solution: `def event_study_average(coefficients, event_times, event_index):
    post = [coefficients[i] for i in range(len(event_times)) if event_times[i] >= event_index]
    if not post:
        return 0.0
    return sum(post) / len(post)`,
    testCases: [
      { input: [[0.1, -0.2, 0.5, 0.7], [-2, -1, 0, 1], 0], expected: 0.6 },
      { input: [[0.1, -0.2, 0.5, 0.7], [-2, -1, 0, 1], 5], expected: 0.0 },
      { input: [[1.0], [0], 0], expected: 1.0 },
    ],
    hint: "Averaging post-event coefficients summarizes the dynamic treatment effect.",
  },
  {
    id: "ml-283",
    title: "Synthetic Control Weights",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Compute synthetic control weights for two donors. Minimize ||w*A + (1-w)*B - T||^2, giving w = sum((A - B)(T - B)) / sum((A - B)^2), clipped to [0, 1].\n\nReturn [w, 1 - w]; if the donors are identical return [0.5, 0.5].",
    starterCode: `def synthetic_control_weights(donor_a, donor_b, treated):
    # Returns [w, 1 - w]
    # Your code here
    pass`,
    solution: `def synthetic_control_weights(donor_a, donor_b, treated):
    num = sum((donor_a[i] - donor_b[i]) * (treated[i] - donor_b[i]) for i in range(len(treated)))
    den = sum((donor_a[i] - donor_b[i]) ** 2 for i in range(len(treated)))
    if den == 0:
        return [0.5, 0.5]
    w = min(max(num / den, 0.0), 1.0)
    return [w, 1.0 - w]`,
    testCases: [
      { input: [[10, 12, 14], [8, 10, 12], [9, 11, 13]], expected: [0.5, 0.5] },
      { input: [[1, 2, 3], [5, 6, 7], [4, 5, 6]], expected: [0.25, 0.75] },
      { input: [[10, 10], [0, 0], [20, 20]], expected: [1.0, 0.0] },
      { input: [[5, 5], [5, 5], [7, 7]], expected: [0.5, 0.5] },
    ],
    hint: "Weights are constrained to the simplex so the synthetic control stays a convex combination.",
  },
  {
    id: "ml-284",
    title: "Permutation Inference",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Compute a permutation p-value for the difference in means. The observed statistic is |mean(treated) - mean(control)|; then with random.seed(seed) shuffle the pooled sample num_permutations times and count how often a permuted absolute difference is at least the observed one.\n\nReturn the fraction; invalid input returns 1.0.",
    starterCode: `import random
def permutation_p_value(treated, control, num_permutations, seed):
    # Your code here
    pass`,
    solution: `import random
def permutation_p_value(treated, control, num_permutations, seed):
    nt = len(treated)
    nc = len(control)
    if nt == 0 or nc == 0 or num_permutations <= 0:
        return 1.0
    observed = abs(sum(treated) / nt - sum(control) / nc)
    combined = list(treated) + list(control)
    random.seed(seed)
    count = 0
    for _ in range(num_permutations):
        random.shuffle(combined)
        pseudo = combined[:nt]
        rest = combined[nt:]
        diff = abs(sum(pseudo) / nt - sum(rest) / nc)
        if diff >= observed:
            count += 1
    return count / num_permutations`,
    testCases: [
      { input: [[2, 4, 6], [1, 3], 200, 42], expected: 0.385 },
      { input: [[1, 2, 3, 4], [2, 2], 100, 7], expected: 0.78 },
      { input: [[1, 1], [1, 1], 100, 7], expected: 1.0 },
      { input: [[], [], 10, 0], expected: 1.0 },
    ],
    hint: "Permutation tests make no distributional assumptions beyond exchangeability.",
  },
  {
    id: "ml-285",
    title: "Mediation Proportion",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the proportion of the total effect that is mediated: (a*b) / (a*b + c_prime).\n\nReturn 0.0 when the denominator is 0.",
    starterCode: `def mediation_proportion(a, b, c_prime):
    # Your code here
    pass`,
    solution: `def mediation_proportion(a, b, c_prime):
    indirect = a * b
    total = indirect + c_prime
    if total == 0:
        return 0.0
    return indirect / total`,
    testCases: [
      { input: [0.5, 0.8, 0.1], expected: 0.8 },
      { input: [0.2, -0.1, -0.02], expected: 0.5 },
      { input: [0, 0, 0], expected: 0.0 },
      { input: [1, 2, -2], expected: 0.0 },
    ],
    hint: "The indirect effect a*b shares the total effect with the direct path c_prime.",
  },
  {
    id: "ml-286",
    title: "Moderated Mediation Index",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the index of moderated mediation: (a_high - a_low) * b, where a_low and a_high are the treatment-to-mediator effects at two moderator levels and b is the mediator-to-outcome effect.",
    starterCode: `def moderated_mediation_index(a_low, a_high, b):
    # Your code here
    pass`,
    solution: `def moderated_mediation_index(a_low, a_high, b):
    return (a_high - a_low) * b`,
    testCases: [
      { input: [0.3, 0.5, 0.8], expected: 0.16000000000000003 },
      { input: [0.5, 0.2, 0.4], expected: -0.12 },
      { input: [0.4, 0.4, 1.0], expected: 0.0 },
    ],
    hint: "A nonzero index means the indirect effect depends on the moderator.",
  },
  {
    id: "ml-287",
    title: "Two-Model Uplift",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description: "Compute two-model uplift: treatment probability minus control probability for each sample.\n\nEmpty input returns [].",
    starterCode: `def two_model_uplift(p_control, p_treatment):
    # Your code here
    pass`,
    solution: `def two_model_uplift(p_control, p_treatment):
    return [p_treatment[i] - p_control[i] for i in range(len(p_control))]`,
    testCases: [
      { input: [[0.1, 0.4, 0.8], [0.15, 0.35, 0.9]], expected: [0.04999999999999999, -0.050000000000000044, 0.09999999999999998] },
      { input: [[0.5, 0.5], [0.5, 0.5]], expected: [0.0, 0.0] },
      { input: [[], []], expected: [] },
    ],
    hint: "The two-model approach trains separate outcome models per treatment arm.",
  },
  {
    id: "ml-288",
    title: "Transformed Outcome",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the transformed outcome for a constant propensity p: y * (t - p) / (p * (1 - p)), clipping p to [1e-6, 1 - 1e-6].\n\nEmpty input returns [].",
    starterCode: `def transformed_outcome(y, treatment, propensity):
    # Your code here
    pass`,
    solution: `def transformed_outcome(y, treatment, propensity):
    result = []
    for i in range(len(y)):
        p = min(max(propensity[i], 1e-6), 1.0 - 1e-6)
        result.append(y[i] * (treatment[i] - p) / (p * (1.0 - p)))
    return result`,
    testCases: [
      { input: [[1, 1, 0], [1, 1, 0], [0.5, 0.5, 0.5]], expected: [2.0, 2.0, -0.0] },
      { input: [[1, 0], [1, 0], [0.8, 0.8]], expected: [1.25, -0.0] },
      { input: [[1, 1], [1, 1], [1.0, 1.0]], expected: [1.000001000001, 1.000001000001] },
      { input: [[], [], []], expected: [] },
    ],
    hint: "The transformed outcome is unbiased for the treatment effect under the true propensity.",
  },
  {
    id: "ml-289",
    title: "Qini Coefficient",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Compute the Qini coefficient for an uplift model. Sort samples by predicted uplift descending (ties by index) and track value_k = cum_treated_positives/n_treated - cum_control_positives/n_control. The coefficient is the trapezoidal area under this curve minus the random diagonal, divided by n.\n\nReturn 0.0 when the input is empty or a treatment group is missing.",
    starterCode: `def qini_coefficient(treatment, outcome, uplift_scores):
    # Your code here
    pass`,
    solution: `def qini_coefficient(treatment, outcome, uplift_scores):
    n = len(treatment)
    nt = sum(treatment)
    nc = n - nt
    if n == 0 or nt == 0 or nc == 0:
        return 0.0
    order = sorted(range(n), key=lambda i: (-uplift_scores[i], i))
    cum_t = 0
    cum_c = 0
    prev = 0.0
    trap = 0.0
    for i in order:
        if treatment[i] == 1:
            cum_t += outcome[i]
        else:
            cum_c += outcome[i]
        val = cum_t / nt - cum_c / nc
        trap += (prev + val) / 2.0
        prev = val
    diag = prev * n / 2.0
    return (trap - diag) / n`,
    testCases: [
      { input: [[1, 1, 0, 0], [1, 0, 1, 0], [0.9, 0.8, 0.2, 0.1]], expected: 0.25 },
      { input: [[1, 1, 0, 0], [1, 0, 1, 0], [0.1, 0.2, 0.8, 0.9]], expected: -0.25 },
      { input: [[1, 0], [1, 0], [0.5, 0.5]], expected: 0.25 },
      { input: [[], [], []], expected: 0.0 },
    ],
    hint: "A good uplift model concentrates treated responders at the top of the ranking.",
  },
  {
    id: "ml-290",
    title: "Uplift Cumulative Gain",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the uplift cumulative gain curve: after sorting by predicted uplift descending (ties by index), value_k = cum_treated_positives/n_treated - cum_control_positives/n_control.\n\nReturn [] when the input is empty or a treatment group is missing.",
    starterCode: `def uplift_cumulative_gain(treatment, outcome, uplift_scores):
    # Your code here
    pass`,
    solution: `def uplift_cumulative_gain(treatment, outcome, uplift_scores):
    n = len(treatment)
    nt = sum(treatment)
    nc = n - nt
    if n == 0 or nt == 0 or nc == 0:
        return []
    order = sorted(range(n), key=lambda i: (-uplift_scores[i], i))
    cum_t = 0
    cum_c = 0
    result = []
    for i in order:
        if treatment[i] == 1:
            cum_t += outcome[i]
        else:
            cum_c += outcome[i]
        result.append(cum_t / nt - cum_c / nc)
    return result`,
    testCases: [
      { input: [[1, 1, 0, 0], [1, 0, 1, 0], [0.9, 0.8, 0.2, 0.1]], expected: [0.5, 0.5, 0.0, 0.0] },
      { input: [[1, 1, 0, 0], [1, 0, 1, 0], [0.1, 0.2, 0.8, 0.9]], expected: [0.0, -0.5, -0.5, 0.0] },
      { input: [[1, 0], [1, 0], [0.5, 0.5]], expected: [1.0, 1.0] },
    ],
    hint: "The curve should rise early when uplift scores rank responsive units first.",
  },
  {
    id: "ml-291",
    title: "Uplift Calibration Error",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the count-weighted calibration error of uplift predictions: sum over bins of (count/total) * |predicted - observed|.\n\nReturn 0.0 when the total count is 0.",
    starterCode: `def uplift_calibration_error(predicted_uplift, observed_uplift, counts):
    # Your code here
    pass`,
    solution: `def uplift_calibration_error(predicted_uplift, observed_uplift, counts):
    total = sum(counts)
    if total == 0:
        return 0.0
    err = 0.0
    for i in range(len(counts)):
        err += counts[i] / total * abs(predicted_uplift[i] - observed_uplift[i])
    return err`,
    testCases: [
      { input: [[0.1, 0.2], [0.05, 0.3], [100, 50]], expected: 0.06666666666666665 },
      { input: [[0.2], [0.2], [10]], expected: 0.0 },
      { input: [[], [], []], expected: 0.0 },
    ],
    hint: "Calibration checks whether predicted uplift magnitude matches reality.",
  },
  {
    id: "ml-292",
    title: "X-Learner Step",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Combine X-learner imputed effects with a weight g for the control model: tau = g * d0_hat + (1 - g) * d1_hat, element-wise.\n\nEmpty input returns [].",
    starterCode: `def x_learner_step(d0_hat, d1_hat, g):
    # Your code here
    pass`,
    solution: `def x_learner_step(d0_hat, d1_hat, g):
    return [g * d0_hat[i] + (1.0 - g) * d1_hat[i] for i in range(len(d0_hat))]`,
    testCases: [
      { input: [[1, 2], [3, 4], 0.25], expected: [2.5, 3.5] },
      { input: [[0, 1], [2, -1], 0.5], expected: [1.0, 0.0] },
      { input: [[], [], 0.5], expected: [] },
    ],
    hint: "The weight g is often the propensity score, favoring the better-estimated arm.",
  },
  {
    id: "ml-293",
    title: "R-Learner Pseudo-Outcome",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute R-learner pseudo-outcomes: (y - m) / (t - e), clipping the treatment-minus-propensity denominator to at least 1e-6 in magnitude with its original sign.\n\nEmpty input returns [].",
    starterCode: `def r_learner_pseudo(y, m, treatment, propensity):
    # Your code here
    pass`,
    solution: `def r_learner_pseudo(y, m, treatment, propensity):
    result = []
    for i in range(len(y)):
        den = treatment[i] - propensity[i]
        if abs(den) < 1e-6:
            den = 1e-6 if den >= 0 else -1e-6
        result.append((y[i] - m[i]) / den)
    return result`,
    testCases: [
      { input: [[2, 4, 6], [1, 2, 3], [1, 1, 0], [0.5, 0.5, 0.5]], expected: [2.0, 4.0, -6.0] },
      { input: [[5], [1], [1], [0.5]], expected: [8.0] },
      { input: [[3], [1], [1], [1.0]], expected: [2000000.0] },
    ],
    hint: "The pseudo-outcome regresses the residualized outcome on the residualized treatment.",
  },
  {
    id: "ml-294",
    title: "DR-Learner Pseudo-Outcome",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute DR-learner pseudo-outcomes: ((t - e) / (e * (1 - e))) * (y - mu_t) + mu1 - mu0, where mu_t is mu1 for treated units and mu0 for controls, and e is clipped to [1e-6, 1 - 1e-6].\n\nEmpty input returns [].",
    starterCode: `def dr_learner_pseudo(treatment, outcome, propensity, mu0, mu1):
    # Your code here
    pass`,
    solution: `def dr_learner_pseudo(treatment, outcome, propensity, mu0, mu1):
    result = []
    for i in range(len(treatment)):
        e = min(max(propensity[i], 1e-6), 1.0 - 1e-6)
        mu_t = mu1[i] if treatment[i] == 1 else mu0[i]
        result.append((treatment[i] - e) / (e * (1.0 - e)) * (outcome[i] - mu_t) + mu1[i] - mu0[i])
    return result`,
    testCases: [
      { input: [[1, 0], [3, 2], [0.75, 0.5], [2, 1], [3, 2]], expected: [1.0, -1.0] },
      { input: [[1, 1, 0], [1, 1, 0], [0.5, 0.5, 0.5], [0, 0, 0], [1, 1, 1]], expected: [1.0, 1.0, 1.0] },
      { input: [[], [], [], [], []], expected: [] },
    ],
    hint: "Doubly robust pseudo-outcomes stay consistent if either nuisance model is right.",
  },
  {
    id: "ml-295",
    title: "IPS Off-Policy Estimate",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the inverse propensity scoring off-policy estimate: mean(target_prob / behavior_prob * reward), clipping the behavior probability to at least 1e-6.\n\nEmpty input returns 0.0.",
    starterCode: `def ips_estimate(rewards, behavior_probs, target_probs):
    # Your code here
    pass`,
    solution: `def ips_estimate(rewards, behavior_probs, target_probs):
    if not rewards:
        return 0.0
    total = 0.0
    for i in range(len(rewards)):
        b = max(behavior_probs[i], 1e-6)
        total += target_probs[i] / b * rewards[i]
    return total / len(rewards)`,
    testCases: [
      { input: [[1, 0, 2], [0.5, 0.5, 0.4], [0.7, 0.3, 0.5]], expected: 1.3 },
      { input: [[1], [0.25], [1.0]], expected: 4.0 },
      { input: [[], [], []], expected: 0.0 },
    ],
    hint: "IPS reweights logged rewards by how much more likely the target policy was to act.",
  },
  {
    id: "ml-296",
    title: "Doubly Robust OPE",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Compute the doubly robust off-policy estimate. For each sample add the target policy's expected value sum_a pi(a)*q(a) plus the importance-weighted correction pi(a_taken)/behavior * (reward - q(a_taken)).\n\nReturn the mean over samples; empty input returns 0.0.",
    starterCode: `def dr_ope(rewards, actions, behavior_probs, target_probs, q_values):
    # Your code here
    pass`,
    solution: `def dr_ope(rewards, actions, behavior_probs, target_probs, q_values):
    n = len(rewards)
    if n == 0:
        return 0.0
    total = 0.0
    for i in range(n):
        expected = sum(target_probs[i][a] * q_values[i][a] for a in range(len(q_values[i])))
        b = max(behavior_probs[i], 1e-6)
        a_taken = actions[i]
        total += expected + target_probs[i][a_taken] / b * (rewards[i] - q_values[i][a_taken])
    return total / n`,
    testCases: [
      { input: [[1, 2], [0, 1], [0.5, 0.5], [[0.7, 0.3], [0.4, 0.6]], [[1.0, 0.0], [0.0, 2.0]]], expected: 0.95 },
      { input: [[1], [1], [0.25], [[0.5, 0.5]], [[1.0, 3.0]]], expected: -2.0 },
      { input: [[], [], [], [], []], expected: 0.0 },
    ],
    hint: "The model-based term reduces variance while the importance weight corrects its bias.",
  },
  {
    id: "ml-297",
    title: "Importance Weight Clipping",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Clip importance weights at max_weight, then rescale them so their mean is 1.\n\nReturn zeros when the clipped weights sum to 0; empty input returns [].",
    starterCode: `def clip_and_normalize_weights(weights, max_weight):
    # Your code here
    pass`,
    solution: `def clip_and_normalize_weights(weights, max_weight):
    if not weights:
        return []
    clipped = [min(w, max_weight) for w in weights]
    total = sum(clipped)
    if total == 0:
        return [0.0 for _ in weights]
    mean = total / len(clipped)
    return [c / mean for c in clipped]`,
    testCases: [
      { input: [[1, 2, 10], 3], expected: [0.5, 1.0, 1.5] },
      { input: [[0, 0], 5], expected: [0.0, 0.0] },
      { input: [[5], 5], expected: [1.0] },
      { input: [[], 3], expected: [] },
    ],
    hint: "Clipping controls variance at the cost of some bias; renormalizing keeps scale stable.",
  },
  {
    id: "ml-298",
    title: "Effective Sample Size",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the effective sample size of a weight vector: (sum(w))^2 / sum(w^2).\n\nReturn 0.0 when the sum of squares is 0 or the input is empty.",
    starterCode: `def effective_sample_size(weights):
    # Your code here
    pass`,
    solution: `def effective_sample_size(weights):
    if not weights:
        return 0.0
    total = sum(weights)
    sum_sq = sum(w * w for w in weights)
    if sum_sq == 0:
        return 0.0
    return total * total / sum_sq`,
    testCases: [
      { input: [[1, 1, 1, 1]], expected: 4.0 },
      { input: [[1, 2, 3]], expected: 2.5714285714285716 },
      { input: [[0, 0]], expected: 0.0 },
      { input: [[]], expected: 0.0 },
    ],
    hint: "Unequal weights reduce the effective sample size below the raw count.",
  },
  {
    id: "ml-299",
    title: "KernelSHAP Weight",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the KernelSHAP coalition weight for a model with num_features features and a coalition of subset_size: (M - 1) / (C(M, z) * z * (M - z)).\n\nReturn 0.0 for endpoint coalitions (z = 0 or z = M) or when M < 2.",
    starterCode: `def kernelshap_weight(num_features, subset_size):
    # Your code here
    pass`,
    solution: `def kernelshap_weight(num_features, subset_size):
    m = num_features
    z = subset_size
    if m < 2 or z <= 0 or z >= m:
        return 0.0
    def comb(n, k):
        result = 1
        for i in range(k):
            result = result * (n - i) // (i + 1)
        return result
    return (m - 1) / (comb(m, z) * z * (m - z))`,
    testCases: [
      { input: [4, 1], expected: 0.25 },
      { input: [4, 2], expected: 0.125 },
      { input: [5, 2], expected: 0.06666666666666667 },
      { input: [4, 0], expected: 0.0 },
    ],
    hint: "The Shapley kernel assigns the largest weight to small and large coalitions.",
  },
  {
    id: "ml-300",
    title: "Counterfactual Cost",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the L1 cost of a counterfactual explanation: the sum of absolute differences between the query point and the counterfactual.",
    starterCode: `def counterfactual_cost(x, c):
    # Your code here
    pass`,
    solution: `def counterfactual_cost(x, c):
    return sum(abs(x[i] - c[i]) for i in range(len(x)))`,
    testCases: [
      { input: [[1, 2], [2, 0]], expected: 3 },
      { input: [[5, 5], [5, 5]], expected: 0 },
      { input: [[], []], expected: 0 },
    ],
    hint: "Smaller distance means the explanation is easier to act on.",
  },
  {
    id: "ml-301",
    title: "LIME Kernel Weight",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the LIME locality kernel weight: exp(-distance^2 / width^2).\n\nReturn 0.0 when width <= 0.",
    starterCode: `import math
def lime_kernel_weight(distance, width):
    # Your code here
    pass`,
    solution: `import math
def lime_kernel_weight(distance, width):
    if width <= 0:
        return 0.0
    return math.exp(-(distance * distance) / (width * width))`,
    testCases: [
      { input: [2, 2], expected: 0.36787944117144233 },
      { input: [0, 2], expected: 1.0 },
      { input: [1, 0], expected: 0.0 },
      { input: [3, 1], expected: 0.00012340980408667956 },
    ],
    hint: "The kernel decays with distance so nearby perturbations dominate the surrogate fit.",
  },
  {
    id: "ml-302",
    title: "Anchor Precision",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute anchor precision: among instances covered by the anchor, the fraction whose prediction matches the anchor's.\n\nReturn 0.0 when nothing is covered or input is empty.",
    starterCode: `def anchor_precision(covered, same_prediction):
    # Your code here
    pass`,
    solution: `def anchor_precision(covered, same_prediction):
    covered_count = sum(1 for v in covered if v == 1)
    if covered_count == 0:
        return 0.0
    matches = sum(1 for i in range(len(covered)) if covered[i] == 1 and same_prediction[i] == 1)
    return matches / covered_count`,
    testCases: [
      { input: [[1, 1, 0, 1], [1, 0, 0, 1]], expected: 0.6666666666666666 },
      { input: [[0, 0], [1, 1]], expected: 0.0 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "An anchor is only useful if the prediction rarely changes inside it.",
  },
  {
    id: "ml-303",
    title: "Surrogate Fidelity",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute surrogate fidelity: the fraction of samples where the surrogate and black-box predictions agree.\n\nEmpty input returns 0.0.",
    starterCode: `def surrogate_fidelity(blackbox_preds, surrogate_preds):
    # Your code here
    pass`,
    solution: `def surrogate_fidelity(blackbox_preds, surrogate_preds):
    if not blackbox_preds:
        return 0.0
    hits = sum(1 for i in range(len(blackbox_preds)) if blackbox_preds[i] == surrogate_preds[i])
    return hits / len(blackbox_preds)`,
    testCases: [
      { input: [[1, 0, 1, 1], [1, 1, 1, 0]], expected: 0.5 },
      { input: [[0, 0], [0, 0]], expected: 1.0 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Fidelity measures how faithfully the interpretable surrogate imitates the black box.",
  },
  {
    id: "ml-304",
    title: "Partial Dependence 1D",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the 1D partial dependence of a linear model: for each grid value v, average w[feature]*v plus the other weighted features over all rows.\n\nReturn [] if X or the grid is empty.",
    starterCode: `def partial_dependence(X, w, feature, grid_values):
    # Your code here
    pass`,
    solution: `def partial_dependence(X, w, feature, grid_values):
    if not X or not grid_values:
        return []
    n = len(X)
    d = len(w)
    result = []
    for v in grid_values:
        total = 0.0
        for row in X:
            pred = w[feature] * v
            for k in range(d):
                if k != feature:
                    pred += w[k] * row[k]
            total += pred
        result.append(total / n)
    return result`,
    testCases: [
      { input: [[[1, 2], [2, 3]], [1, 1], 0, [0, 10]], expected: [2.5, 12.5] },
      { input: [[[1, 2], [2, 3]], [1, 1], 1, [0, 10]], expected: [1.5, 11.5] },
      { input: [[], [1, 1], 0, [0, 10]], expected: [] },
      { input: [[[1, 2]], [1, 1], 0, []], expected: [] },
    ],
    hint: "Partial dependence marginalizes the model over the other features.",
  },
  {
    id: "ml-305",
    title: "ICE Variance",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the population variance of ICE curves at each grid position (rows are samples, columns are grid points).\n\nReturn [] when there are no samples or curves.",
    starterCode: `def ice_variance(ice_curves):
    # Your code here
    pass`,
    solution: `def ice_variance(ice_curves):
    if not ice_curves or not ice_curves[0]:
        return []
    dim = len(ice_curves[0])
    result = []
    for j in range(dim):
        values = [row[j] for row in ice_curves]
        mean = sum(values) / len(values)
        result.append(sum((v - mean) ** 2 for v in values) / len(values))
    return result`,
    testCases: [
      { input: [[[1, 2], [3, 4], [5, 6]]], expected: [2.6666666666666665, 2.6666666666666665] },
      { input: [[[1, 1]]], expected: [0.0, 0.0] },
      { input: [[]], expected: [] },
    ],
    hint: "High ICE variance reveals heterogeneous feature effects across samples.",
  },
  {
    id: "ml-306",
    title: "Interaction H-Statistic",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Compute the Friedman H-statistic for a feature pair: sqrt(sum((pdp_jk - pdp_j - pdp_k)^2) / sum(pdp_jk^2)).\n\nReturn 0.0 when the denominator is 0.",
    starterCode: `def interaction_h_statistic(pdp_jk, pdp_j, pdp_k):
    # Your code here
    pass`,
    solution: `def interaction_h_statistic(pdp_jk, pdp_j, pdp_k):
    num = 0.0
    den = 0.0
    for a in range(len(pdp_jk)):
        for b in range(len(pdp_jk[a])):
            diff = pdp_jk[a][b] - pdp_j[a] - pdp_k[b]
            num += diff * diff
            den += pdp_jk[a][b] * pdp_jk[a][b]
    if den == 0:
        return 0.0
    return (num / den) ** 0.5`,
    testCases: [
      { input: [[[2, 3], [3, 4]], [1, 2], [1, 2]], expected: 0.0 },
      { input: [[[2, 3], [4, 5]], [1, 2], [1, 2]], expected: 0.19245008972987526 },
      { input: [[[0, 0], [0, 0]], [0, 0], [0, 0]], expected: 0.0 },
    ],
    hint: "The H-statistic measures how much the joint partial dependence deviates from additivity.",
  },
  {
    id: "ml-307",
    title: "LOCO Delta",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute leave-one-covariate-out importance as the change in MSE: mse_without - mse_full.\n\nEmpty input returns 0.0.",
    starterCode: `def loco_delta(y_true, preds_full, preds_without):
    # Your code here
    pass`,
    solution: `def loco_delta(y_true, preds_full, preds_without):
    n = len(y_true)
    if n == 0:
        return 0.0
    mse_full = sum((y_true[i] - preds_full[i]) ** 2 for i in range(n)) / n
    mse_without = sum((y_true[i] - preds_without[i]) ** 2 for i in range(n)) / n
    return mse_without - mse_full`,
    testCases: [
      { input: [[1, 2, 3], [1, 2, 3], [1, 1, 1]], expected: 1.6666666666666667 },
      { input: [[1, 2, 3], [2, 2, 2], [3, 3, 3]], expected: 1.0 },
      { input: [[], [], []], expected: 0.0 },
    ],
    hint: "A large positive delta means the feature was important for prediction quality.",
  },
  {
    id: "ml-308",
    title: "Monotonicity Check",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Check model-agnostic monotonicity: sort samples by the feature value and return True when predictions are non-decreasing.\n\nEmpty input returns True.",
    starterCode: `def monotonicity_check(feature_values, predictions):
    # Your code here
    pass`,
    solution: `def monotonicity_check(feature_values, predictions):
    pairs = sorted(zip(feature_values, predictions))
    for i in range(1, len(pairs)):
        if pairs[i][1] < pairs[i - 1][1]:
            return False
    return True`,
    testCases: [
      { input: [[1, 2, 3], [1, 2, 3]], expected: true },
      { input: [[1, 2, 3], [1, 3, 2]], expected: false },
      { input: [[1, 1, 2], [2, 1, 3]], expected: true },
    ],
    hint: "Monotonicity checks are used to validate regulated or explainable models.",
  },
  {
    id: "ml-309",
    title: "Monotonic Violation Count",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Count monotonicity violations: after sorting by feature value, count adjacent pairs where the prediction decreases.",
    starterCode: `def monotonic_violation_count(feature_values, predictions):
    # Your code here
    pass`,
    solution: `def monotonic_violation_count(feature_values, predictions):
    pairs = sorted(zip(feature_values, predictions))
    count = 0
    for i in range(1, len(pairs)):
        if pairs[i][1] < pairs[i - 1][1]:
            count += 1
    return count`,
    testCases: [
      { input: [[1, 2, 3], [1, 3, 2]], expected: 1 },
      { input: [[1, 2, 3], [3, 2, 1]], expected: 2 },
      { input: [[1, 2, 3], [1, 2, 3]], expected: 0 },
    ],
    hint: "Each violation is a local decrease as the feature increases.",
  },
  {
    id: "ml-310",
    title: "Conformal Interval",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Build a conformal prediction interval from calibration absolute residuals: take the k-th smallest residual with k = ceil((n + 1) * (1 - alpha)) clamped to [1, n], then return [prediction - q, prediction + q].\n\nEmpty residuals return [0.0, 0.0].",
    starterCode: `import math
def conformal_interval(residuals, alpha, prediction):
    # Returns [lower, upper]
    # Your code here
    pass`,
    solution: `import math
def conformal_interval(residuals, alpha, prediction):
    n = len(residuals)
    if n == 0:
        return [0.0, 0.0]
    s = sorted(abs(r) for r in residuals)
    k = math.ceil((n + 1) * (1.0 - alpha))
    if k > n:
        k = n
    if k < 1:
        k = 1
    q = s[k - 1]
    return [prediction - q, prediction + q]`,
    testCases: [
      { input: [[1, 2, 3, 4], 0.25, 10], expected: [6, 14] },
      { input: [[1, 2, 3], 0.5, 0], expected: [-2, 2] },
      { input: [[], 0.1, 5], expected: [0.0, 0.0] },
    ],
    hint: "Conformal intervals carry a finite-sample coverage guarantee under exchangeability.",
  },
  {
    id: "ml-311",
    title: "Quantile Forest Predict",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Predict a quantile from a quantile regression forest's leaf samples using linear interpolation between order statistics at position q * (n - 1).\n\nEmpty input returns 0.0.",
    starterCode: `def quantile_forest_predict(samples, q):
    # Your code here
    pass`,
    solution: `def quantile_forest_predict(samples, q):
    if not samples:
        return 0.0
    s = sorted(samples)
    n = len(s)
    if n == 1:
        return float(s[0])
    pos = q * (n - 1)
    lo = int(pos)
    hi = min(lo + 1, n - 1)
    frac = pos - lo
    return s[lo] * (1 - frac) + s[hi] * frac`,
    testCases: [
      { input: [[1, 2, 3, 4], 0.5], expected: 2.5 },
      { input: [[1, 2, 3, 4], 0.9], expected: 3.7 },
      { input: [[1, 2, 3, 4], 0.0], expected: 1.0 },
      { input: [[], 0.5], expected: 0.0 },
    ],
    hint: "Quantile forests propagate the empirical leaf distribution instead of a mean.",
  },
  {
    id: "ml-312",
    title: "Bayesian Posterior Mean",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Compute the posterior mean of a 1D Bayesian linear regression with known noise variance, prior mean, and prior variance: (sum(x*y)/noise_var + prior_mean/prior_var) / (sum(x^2)/noise_var + 1/prior_var).\n\nReturn prior_mean when a variance is non-positive.",
    starterCode: `def bayesian_posterior_mean(x, y, noise_var, prior_mean, prior_var):
    # Your code here
    pass`,
    solution: `def bayesian_posterior_mean(x, y, noise_var, prior_mean, prior_var):
    if noise_var <= 0 or prior_var <= 0:
        return prior_mean
    sxx = sum(v * v for v in x)
    sxy = sum(x[i] * y[i] for i in range(len(x)))
    precision = sxx / noise_var + 1.0 / prior_var
    return (sxy / noise_var + prior_mean / prior_var) / precision`,
    testCases: [
      { input: [[1, 2], [2, 4], 1, 0, 1], expected: 1.6666666666666667 },
      { input: [[1, 2], [2, 4], 1, 10, 0.1], expected: 7.333333333333333 },
      { input: [[], [], 1, 0, 1], expected: 0.0 },
    ],
    hint: "The posterior mean is a precision-weighted blend of the data and the prior.",
  },
  {
    id: "ml-313",
    title: "Posterior Predictive",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Compute the posterior predictive mean and variance at x_new for a 1D Bayesian linear regression: mean = w_post * x_new and variance = noise_var + x_new^2 / posterior_precision.\n\nReturn [prior_mean * x_new, noise_var] when a variance input is non-positive.",
    starterCode: `def posterior_predictive(x, y, noise_var, prior_mean, prior_var, x_new):
    # Returns [mean, variance]
    # Your code here
    pass`,
    solution: `def posterior_predictive(x, y, noise_var, prior_mean, prior_var, x_new):
    if noise_var <= 0 or prior_var <= 0:
        return [prior_mean * x_new, noise_var]
    sxx = sum(v * v for v in x)
    sxy = sum(x[i] * y[i] for i in range(len(x)))
    precision = sxx / noise_var + 1.0 / prior_var
    mean = (sxy / noise_var + prior_mean / prior_var) / precision
    variance = noise_var + x_new * x_new / precision
    return [mean * x_new, variance]`,
    testCases: [
      { input: [[1, 2], [2, 4], 1, 0, 1, 3], expected: [5.0, 2.5] },
      { input: [[1, 2], [2, 4], 1, 10, 0.1, 3], expected: [22.0, 1.6] },
      { input: [[], [], 1, 0, 1, 2], expected: [0.0, 5.0] },
    ],
    hint: "Predictive variance combines observation noise with parameter uncertainty.",
  },
  {
    id: "ml-314",
    title: "Model Averaging Weights",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute softmax model averaging weights from losses: exp(-(loss_i - min_loss)/T) normalized to sum to 1.\n\nReturn uniform weights when temperature <= 0 and [] for empty input.",
    starterCode: `import math
def model_averaging_weights(losses, temperature):
    # Your code here
    pass`,
    solution: `import math
def model_averaging_weights(losses, temperature):
    if not losses:
        return []
    n = len(losses)
    if temperature <= 0:
        return [1.0 / n for _ in losses]
    m = min(losses)
    exps = [math.exp(-(l - m) / temperature) for l in losses]
    total = sum(exps)
    return [e / total for e in exps]`,
    testCases: [
      { input: [[0.1, 0.5], 0.2], expected: [0.8807970779778823, 0.11920292202211755] },
      { input: [[1, 1], 0.2], expected: [0.5, 0.5] },
      { input: [[0.5], 0], expected: [1.0] },
      { input: [[], 1], expected: [] },
    ],
    hint: "Lower temperature concentrates weight on the best-performing model.",
  },
  {
    id: "ml-315",
    title: "Feature Store Consistency",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compare offline and online feature values and return the sorted indices where they differ, up to the shorter length.\n\nEmpty input returns [].",
    starterCode: `def feature_store_mismatches(offline, online):
    # Your code here
    pass`,
    solution: `def feature_store_mismatches(offline, online):
    result = []
    for i in range(min(len(offline), len(online))):
        if offline[i] != online[i]:
            result.append(i)
    return result`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], [1.0, 2.5, 3.0]], expected: [1] },
      { input: [[1.0, 2.0], [1.0, 2.0]], expected: [] },
      { input: [[], []], expected: [] },
    ],
    hint: "Mismatches between offline and online features cause training-serving skew.",
  },
];
