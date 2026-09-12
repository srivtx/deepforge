import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "st-186",
    title: "Person-Years Rate",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the incidence rate events/person_time per unit of follow-up. Return 0.0 when person_time <= 0.",
    starterCode: `def person_years_rate(events, person_time):
    # Your code here
    pass`,
    solution: `def person_years_rate(events, person_time):
    if person_time <= 0:
        return 0.0
    return events / person_time`,
    testCases: [
      { input: [120, 1000], expected: 0.12 },
      { input: [0, 500], expected: 0.0 },
      { input: [50, 250], expected: 0.2 },
      { input: [10, 0], expected: 0.0 },
      { input: [1, 3], expected: 0.3333333333333333 },
    ],
    hint: "The denominator is accumulated time at risk, not the number of people.",
  },
  {
    id: "st-187",
    title: "Incidence Rate CI (Byar)",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return Byar's approximate confidence interval for a Poisson incidence rate. With rate = events/person_time, lower = rate * (1 - 1/(9e) - z/(3*sqrt(e)))^3 and upper = rate * (1 - 1/(9e) + z/(3*sqrt(e)))^3; clamp the lower base at 0. Return [0.0, 0.0] when events or person_time is not positive.",
    starterCode: `def incidence_rate_ci(events, person_time, z_crit):
    # Your code here
    pass`,
    solution: `def incidence_rate_ci(events, person_time, z_crit):
    if events <= 0 or person_time <= 0:
        return [0.0, 0.0]
    rate = events / person_time
    a = 1.0 - 1.0 / (9.0 * events)
    b = z_crit / (3.0 * (events ** 0.5))
    lo = a - b
    hi = a + b
    if lo < 0:
        lo = 0.0
    return [rate * lo ** 3, rate * hi ** 3]`,
    testCases: [
      { input: [100, 1000, 1.96], expected: [0.08136179160603568, 0.120530503230727] },
      { input: [10, 500, 1.96], expected: [0.009574760431067203, 0.03417188692147052] },
      { input: [1, 100, 1.96], expected: [0.00013070134430727016, 0.03668097492455418] },
      { input: [0, 100, 1.96], expected: [0.0, 0.0] },
      { input: [5, 0, 1.96], expected: [0.0, 0.0] },
    ],
    hint: "Byar's approximation is accurate even for small event counts.",
  },
  {
    id: "st-188",
    title: "Prevalence CI (Logit)",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the logit-transformed confidence interval for a prevalence cases/n: compute logit(p) +/- z*sqrt(1/cases + 1/(n-cases)) and map the limits back through the logistic function. Return [0.0, 0.0] when n <= 0 or cases is not strictly between 0 and n.",
    starterCode: `import math
def prevalence_ci(cases, n, z_crit):
    # Your code here
    pass`,
    solution: `import math
def prevalence_ci(cases, n, z_crit):
    if n <= 0 or cases <= 0 or cases >= n:
        return [0.0, 0.0]
    p = cases / n
    logit = math.log(p / (1.0 - p))
    se = (1.0 / cases + 1.0 / (n - cases)) ** 0.5
    lo = logit - z_crit * se
    hi = logit + z_crit * se
    return [1.0 / (1.0 + math.exp(-lo)), 1.0 / (1.0 + math.exp(-hi))]`,
    testCases: [
      { input: [20, 100, 1.96], expected: [0.13281509097654504, 0.289812602171032] },
      { input: [5, 50, 1.96], expected: [0.042242109705314265, 0.21869770261195032] },
      { input: [50, 100, 1.645], expected: [0.41848395843712505, 0.581516041562875] },
      { input: [0, 50, 1.96], expected: [0.0, 0.0] },
      { input: [50, 50, 1.96], expected: [0.0, 0.0] },
    ],
    hint: "The logit interval stays inside (0, 1) and improves coverage near the boundaries.",
  },
  {
    id: "st-189",
    title: "Log-Linear Fit",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the slope of ln(y) regressed on x by least squares, which estimates the exponential growth rate. Return 0.0 when the lists are shorter than two, lengths differ, any y <= 0, or x has zero variance.",
    starterCode: `import math
def log_linear_fit(x, y):
    # Your code here
    pass`,
    solution: `import math
def log_linear_fit(x, y):
    n = len(x)
    if n < 2 or len(y) != n:
        return 0.0
    for v in y:
        if v <= 0:
            return 0.0
    u = [math.log(v) for v in y]
    mx = sum(x) / n
    mu = sum(u) / n
    sxx = sum((v - mx) ** 2 for v in x)
    if sxx == 0:
        return 0.0
    sxu = sum((x[i] - mx) * (u[i] - mu) for i in range(n))
    return sxu / sxx`,
    testCases: [
      { input: [[1, 2, 3], [10, 100, 1000]], expected: 2.3025850929940455 },
      { input: [[0, 1, 2], [1.0, 2.718281828459045, 7.38905609893065]], expected: 1.0 },
      { input: [[1, 2, 3], [5, 5, 5]], expected: 0.0 },
      { input: [[1, 2], [1, 2]], expected: 0.6931471805599453 },
      { input: [[1, 2, 3], [1, 0, 1]], expected: 0.0 },
    ],
    hint: "Take logs first, then run an ordinary least squares slope.",
  },
  {
    id: "st-190",
    title: "Direct Standardization",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the directly standardized (age-adjusted) rate sum(rate_h * weight_h)/sum(weight_h) using the standard population weights. Return 0.0 when either list is empty or the weights sum to zero.",
    starterCode: `def direct_standardization(stratum_rates, standard_weights):
    # Your code here
    pass`,
    solution: `def direct_standardization(stratum_rates, standard_weights):
    if not stratum_rates or not standard_weights:
        return 0.0
    total = sum(standard_weights)
    if total == 0:
        return 0.0
    weighted = sum(stratum_rates[i] * standard_weights[i] for i in range(len(stratum_rates)))
    return weighted / total`,
    testCases: [
      { input: [[0.01, 0.02], [0.5, 0.5]], expected: 0.015 },
      { input: [[0.1, 0.2, 0.3], [100, 200, 700]], expected: 0.26 },
      { input: [[0.05], [1]], expected: 0.05 },
      { input: [[], []], expected: 0.0 },
      { input: [[0.1, 0.2], [0, 0]], expected: 0.0 },
    ],
    hint: "Weight each stratum-specific rate by the standard population share.",
  },
  {
    id: "st-191",
    title: "Indirect SMR",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the standardized mortality ratio observed/expected after indirect standardization. Return 0.0 when expected <= 0.",
    starterCode: `def standardized_mortality_ratio(observed, expected):
    # Your code here
    pass`,
    solution: `def standardized_mortality_ratio(observed, expected):
    if expected <= 0:
        return 0.0
    return observed / expected`,
    testCases: [
      { input: [120, 100], expected: 1.2 },
      { input: [50, 80], expected: 0.625 },
      { input: [0, 100], expected: 0.0 },
      { input: [10, 0], expected: 0.0 },
      { input: [75, 75], expected: 1.0 },
    ],
    hint: "Values above 1 mean more events than expected from the reference rates.",
  },
  {
    id: "st-192",
    title: "SIR CI",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the log-based confidence interval for a standardized incidence ratio: SIR * exp(-z/sqrt(observed)) to SIR * exp(z/sqrt(observed)). Return [0.0, 0.0] when observed or expected is not positive.",
    starterCode: `import math
def sir_ci(observed, expected, z_crit):
    # Your code here
    pass`,
    solution: `import math
def sir_ci(observed, expected, z_crit):
    if observed <= 0 or expected <= 0:
        return [0.0, 0.0]
    smr = observed / expected
    se = z_crit / (observed ** 0.5)
    return [smr * math.exp(-se), smr * math.exp(se)]`,
    testCases: [
      { input: [120, 100, 1.96], expected: [1.0034046373317664, 1.4351139574451428] },
      { input: [10, 8, 1.96], expected: [0.6725607277616321, 2.323210284965938] },
      { input: [5, 10, 1.645], expected: [0.2395930199746716, 1.0434360734984205] },
      { input: [0, 10, 1.96], expected: [0.0, 0.0] },
      { input: [10, 0, 1.96], expected: [0.0, 0.0] },
    ],
    hint: "The standard error of ln(SIR) is 1/sqrt(observed events).",
  },
  {
    id: "st-193",
    title: "Attributable Risk Percent",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the attributable risk percent (RR - 1)/RR * 100, where RR is the risk ratio from the 2x2 table. Return 0.0 when a group is empty or the unexposed risk is zero.",
    starterCode: `def attributable_risk_percent(a, b, c, d):
    # Your code here
    pass`,
    solution: `def attributable_risk_percent(a, b, c, d):
    n1 = a + b
    n2 = c + d
    if n1 <= 0 or n2 <= 0:
        return 0.0
    risk_exp = a / n1
    risk_unexp = c / n2
    if risk_unexp == 0 or risk_exp == 0:
        return 0.0
    rr = risk_exp / risk_unexp
    return (rr - 1.0) / rr * 100.0`,
    testCases: [
      { input: [30, 70, 10, 90], expected: 66.66666666666666 },
      { input: [20, 80, 20, 80], expected: 0.0 },
      { input: [50, 50, 10, 90], expected: 80.0 },
      { input: [10, 90, 20, 80], expected: -100.0 },
      { input: [0, 10, 5, 5], expected: 0.0 },
    ],
    hint: "It is the share of exposed cases that would be avoided without exposure.",
  },
  {
    id: "st-194",
    title: "Population Attributable Fraction",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the population attributable fraction p_e*(RR - 1)/(1 + p_e*(RR - 1)), where p_e = (a+b)/n is the exposure prevalence and RR is the risk ratio. Return 0.0 when the table is empty or the unexposed risk is zero.",
    starterCode: `def population_attributable_fraction(a, b, c, d):
    # Your code here
    pass`,
    solution: `def population_attributable_fraction(a, b, c, d):
    n = a + b + c + d
    if n <= 0 or c + d <= 0:
        return 0.0
    p_exp = (a + b) / n
    risk_exp = a / (a + b) if a + b > 0 else 0.0
    risk_unexp = c / (c + d)
    if risk_unexp == 0:
        return 0.0
    rr = risk_exp / risk_unexp
    excess = p_exp * (rr - 1.0)
    denom = 1.0 + excess
    if denom == 0:
        return 0.0
    return excess / denom`,
    testCases: [
      { input: [30, 70, 10, 90], expected: 0.49999999999999994 },
      { input: [20, 80, 20, 80], expected: 0.0 },
      { input: [50, 50, 10, 90], expected: 0.6666666666666666 },
      { input: [10, 90, 20, 80], expected: -0.3333333333333333 },
      { input: [0, 10, 5, 5], expected: -1.0 },
    ],
    hint: "PAF combines the exposure prevalence with the strength of the risk ratio.",
  },
  {
    id: "st-195",
    title: "Mantel-Haenszel Odds Ratio",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the Mantel-Haenszel pooled odds ratio sum(a_i*d_i/n_i)/sum(b_i*c_i/n_i) over a list of 2x2 tables. Return 0.0 when a table has no observations or the denominator sum is zero.",
    starterCode: `def mh_odds_ratio(tables):
    # Your code here
    pass`,
    solution: `def mh_odds_ratio(tables):
    r_sum = 0.0
    s_sum = 0.0
    for table in tables:
        a = table[0][0]
        b = table[0][1]
        c = table[1][0]
        d = table[1][1]
        n = a + b + c + d
        if n <= 0:
            return 0.0
        r_sum += a * d / n
        s_sum += b * c / n
    if s_sum == 0:
        return 0.0
    return r_sum / s_sum`,
    testCases: [
      { input: [[[[10, 20], [30, 40]], [[5, 15], [10, 30]]]], expected: 0.7647058823529411 },
      { input: [[[[20, 80], [10, 90]], [[30, 70], [15, 85]]]], expected: 2.3513513513513513 },
      { input: [[[[10, 10], [10, 10]]]], expected: 1.0 },
      { input: [[]], expected: 0.0 },
      { input: [[[[5, 0], [0, 5]]]], expected: 0.0 },
    ],
    hint: "MH pooling weights each stratum's cross-product by its sample size.",
  },
  {
    id: "st-196",
    title: "Woolf CI for OR (Haldane Correction)",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Return Woolf's logit confidence interval for the odds ratio, adding 0.5 to every cell when any cell of the 2x2 table is zero (Haldane-Anscombe correction). The interval is exp(ln(OR) +/- z*sqrt(1/a + 1/b + 1/c + 1/d)). Return [0.0, 0.0] for negative counts or an all-zero table.",
    starterCode: `import math
def woolf_or_ci_haldane(a, b, c, d, z_crit):
    # Your code here
    pass`,
    solution: `import math
def woolf_or_ci_haldane(a, b, c, d, z_crit):
    if a < 0 or b < 0 or c < 0 or d < 0 or a + b + c + d <= 0:
        return [0.0, 0.0]
    if a == 0 or b == 0 or c == 0 or d == 0:
        a = a + 0.5
        b = b + 0.5
        c = c + 0.5
        d = d + 0.5
    odds = (a * d) / (b * c)
    se = (1.0 / a + 1.0 / b + 1.0 / c + 1.0 / d) ** 0.5
    return [odds * math.exp(-z_crit * se), odds * math.exp(z_crit * se)]`,
    testCases: [
      { input: [5, 0, 1, 1, 1.96], expected: [0.2789124783286126, 433.82784709057984] },
      { input: [10, 0, 0, 10, 1.96], expected: [7.978871298830418, 24374.500191337585] },
      { input: [20, 80, 10, 90, 1.96], expected: [0.994279971565182, 5.091624235405931] },
      { input: [0, 0, 0, 0, 1.96], expected: [0.0, 0.0] },
      { input: [1, 0, 0, 1, 1.96], expected: [0.09737346554575602, 831.8487952134959] },
    ],
    hint: "The continuity correction keeps the log odds ratio finite when a cell is empty.",
  },
  {
    id: "st-197",
    title: "Breslow-Day Homogeneity Lite",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Return a two-stratum Breslow-Day homogeneity statistic (ln OR1 - ln OR2)^2 / (se1^2 + se2^2), where se_i^2 = 1/a + 1/b + 1/c + 1/d for each 2x2 table. Return 0.0 when any cell is zero.",
    starterCode: `import math
def breslow_day_lite(t1, t2):
    # Your code here
    pass`,
    solution: `import math
def breslow_day_lite(t1, t2):
    a1, b1, c1, d1 = t1[0][0], t1[0][1], t1[1][0], t1[1][1]
    a2, b2, c2, d2 = t2[0][0], t2[0][1], t2[1][0], t2[1][1]
    if a1 <= 0 or b1 <= 0 or c1 <= 0 or d1 <= 0:
        return 0.0
    if a2 <= 0 or b2 <= 0 or c2 <= 0 or d2 <= 0:
        return 0.0
    or1 = (a1 * d1) / (b1 * c1)
    or2 = (a2 * d2) / (b2 * c2)
    se1 = 1.0 / a1 + 1.0 / b1 + 1.0 / c1 + 1.0 / d1
    se2 = 1.0 / a2 + 1.0 / b2 + 1.0 / c2 + 1.0 / d2
    if se1 + se2 == 0:
        return 0.0
    return (math.log(or1) - math.log(or2)) ** 2 / (se1 + se2)`,
    testCases: [
      { input: [[[10, 20], [30, 40]], [[5, 15], [10, 30]]], expected: 0.27024978722164184 },
      { input: [[[20, 80], [10, 90]], [[30, 70], [15, 85]]], expected: 0.019464733639750542 },
      { input: [[[10, 10], [10, 10]], [[5, 5], [5, 5]]], expected: 0.0 },
      { input: [[[5, 0], [1, 1]], [[1, 1], [1, 1]]], expected: 0.0 },
      { input: [[[1, 2], [3, 4]], [[1, 2], [3, 4]]], expected: 0.0 },
    ],
    hint: "Large values suggest the stratum-specific odds ratios are not homogeneous.",
  },
  {
    id: "st-198",
    title: "Cochran-Armitage Trend",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Return the standardized Cochran-Armitage trend statistic sum(w_i*(x_i - n_i*p))/sqrt(p*(1-p)*(sum(w_i^2*n_i) - (sum(w_i*n_i))^2/N)) for cases, group totals, and numeric dose scores. Return 0.0 for empty or mismatched input, zero totals, an overall proportion at 0 or 1, or zero trend variance.",
    starterCode: `def cochran_armitage(cases, totals, scores):
    # Your code here
    pass`,
    solution: `def cochran_armitage(cases, totals, scores):
    k = len(cases)
    if k == 0 or len(totals) != k or len(scores) != k:
        return 0.0
    n = sum(totals)
    if n <= 0:
        return 0.0
    x = sum(cases)
    p = x / n
    if p <= 0 or p >= 1:
        return 0.0
    num = 0.0
    sum_sn = 0.0
    sum_s2n = 0.0
    for i in range(k):
        num += scores[i] * (cases[i] - totals[i] * p)
        sum_sn += scores[i] * totals[i]
        sum_s2n += scores[i] * scores[i] * totals[i]
    var_factor = sum_s2n - (sum_sn * sum_sn) / n
    if var_factor <= 0:
        return 0.0
    denom = (p * (1.0 - p) * var_factor) ** 0.5
    if denom == 0:
        return 0.0
    return num / denom`,
    testCases: [
      { input: [[10, 20, 30], [100, 100, 100], [0, 1, 2]], expected: 3.5355339059327373 },
      { input: [[5, 10, 15], [50, 50, 50], [0, 1, 2]], expected: 2.5 },
      { input: [[20, 20, 20], [100, 100, 100], [0, 1, 2]], expected: 0.0 },
      { input: [[0, 0, 0], [100, 100, 100], [0, 1, 2]], expected: 0.0 },
      { input: [[10, 20], [100, 100], [0, 1]], expected: 1.9802950859533488 },
    ],
    hint: "The statistic is the dose-weighted covariance of cases and scores, standardized.",
  },
  {
    id: "st-199",
    title: "Poisson Rate Ratio CI",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the confidence interval for a Poisson rate ratio exp(ln(RR) +/- z*sqrt(1/e1 + 1/e2)), where RR = (e1/pt1)/(e2/pt2). Return [0.0, 0.0] when any count or person-time is not positive.",
    starterCode: `import math
def poisson_rate_ratio_ci(e1, pt1, e2, pt2, z_crit):
    # Your code here
    pass`,
    solution: `import math
def poisson_rate_ratio_ci(e1, pt1, e2, pt2, z_crit):
    if e1 <= 0 or e2 <= 0 or pt1 <= 0 or pt2 <= 0:
        return [0.0, 0.0]
    rr = (e1 / pt1) / (e2 / pt2)
    se = (1.0 / e1 + 1.0 / e2) ** 0.5
    return [rr * math.exp(-z_crit * se), rr * math.exp(z_crit * se)]`,
    testCases: [
      { input: [20, 1000, 10, 1000, 1.96], expected: [0.9361705989316523, 4.27272551024862] },
      { input: [50, 500, 25, 500, 1.96], expected: [1.2374430460088952, 3.2324720017629374] },
      { input: [5, 100, 5, 100, 1.645], expected: [0.35331709109654824, 2.830318785022312] },
      { input: [0, 100, 5, 100, 1.96], expected: [0.0, 0.0] },
      { input: [5, 0, 5, 100, 1.96], expected: [0.0, 0.0] },
    ],
    hint: "The variance of ln(rate ratio) is 1/events in each group.",
  },
  {
    id: "st-200",
    title: "Bayesian Shrinkage Rate",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the Gamma-Poisson posterior mean rate (events + prior_strength*prior_mean)/(person_time + prior_strength), which shrinks the raw rate toward the prior. Return 0.0 when the denominator is not positive or an input is negative.",
    starterCode: `def bayesian_shrinkage_rate(events, person_time, prior_mean, prior_strength):
    # Your code here
    pass`,
    solution: `def bayesian_shrinkage_rate(events, person_time, prior_mean, prior_strength):
    if person_time < 0 or prior_strength < 0:
        return 0.0
    denom = person_time + prior_strength
    if denom <= 0:
        return 0.0
    return (events + prior_strength * prior_mean) / denom`,
    testCases: [
      { input: [10, 100, 0.05, 200], expected: 0.06666666666666667 },
      { input: [0, 100, 0.1, 100], expected: 0.05 },
      { input: [50, 100, 0.02, 100], expected: 0.26 },
      { input: [10, 100, 0.05, 0], expected: 0.1 },
      { input: [0, 0, 0.1, 0], expected: 0.0 },
    ],
    hint: "prior_strength acts like extra person-time borrowed from the prior.",
  },
  {
    id: "st-201",
    title: "Empirical Bayes Mean",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the empirical Bayes shrunk mean grand + (tau2/(tau2 + within_var/n))*(group_mean - grand), where tau2 is the between-group variance. Return 0.0 when n <= 0, a variance is negative, or the denominator is zero.",
    starterCode: `def empirical_bayes_mean(group_mean, grand_mean, within_var, between_var, n):
    # Your code here
    pass`,
    solution: `def empirical_bayes_mean(group_mean, grand_mean, within_var, between_var, n):
    if n <= 0 or within_var < 0 or between_var < 0:
        return 0.0
    denom = between_var + within_var / n
    if denom <= 0:
        return 0.0
    factor = between_var / denom
    return grand_mean + factor * (group_mean - grand_mean)`,
    testCases: [
      { input: [12, 10, 4, 1, 10], expected: 11.428571428571429 },
      { input: [12, 10, 4, 1, 1], expected: 10.4 },
      { input: [8, 10, 4, 1, 10], expected: 8.571428571428571 },
      { input: [10, 10, 1, 1, 5], expected: 10.0 },
      { input: [12, 10, 4, 0, 10], expected: 10.0 },
    ],
    hint: "Groups with less data are pulled further toward the grand mean.",
  },
  {
    id: "st-202",
    title: "James-Stein Estimator",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Return the James-Stein shrunken means grand + max(0, 1 - (k-3)*sigma_sq/(n*sum((m-grand)^2)))*(m-grand) for k group means. When k < 3, n <= 0, or all means equal, return the original means unchanged.",
    starterCode: `def james_stein(means, grand_mean, sigma_sq, n):
    # Your code here
    pass`,
    solution: `def james_stein(means, grand_mean, sigma_sq, n):
    k = len(means)
    if k == 0:
        return []
    ss = sum((m - grand_mean) ** 2 for m in means)
    if k < 3 or n <= 0 or ss == 0:
        return [float(m) for m in means]
    factor = 1.0 - (k - 3) * sigma_sq / (n * ss)
    if factor < 0:
        factor = 0.0
    return [grand_mean + factor * (m - grand_mean) for m in means]`,
    testCases: [
      { input: [[12, 10, 8], 10, 4, 10], expected: [12.0, 10.0, 8.0] },
      { input: [[12, 11, 9, 8], 10, 4, 10], expected: [11.92, 10.96, 9.04, 8.08] },
      { input: [[15, 10, 5], 10, 1, 10], expected: [15.0, 10.0, 5.0] },
      { input: [[20, 0, 10, 10], 10, 100, 1], expected: [15.0, 5.0, 10.0, 10.0] },
      { input: [[20, 0, 10, 10], 10, 100, 0.1], expected: [10.0, 10.0, 10.0, 10.0] },
    ],
    hint: "The shrinkage factor is clamped at zero so estimates never overshoot the grand mean.",
  },
  {
    id: "st-203",
    title: "Ridge Estimator Bias",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the bias of the ridge slope relative to OLS: Sxy/(Sxx + lambda) - Sxy/Sxx. Return 0.0 when Sxx or Sxx + lambda is zero.",
    starterCode: `def ridge_bias(sxx, sxy, lam):
    # Your code here
    pass`,
    solution: `def ridge_bias(sxx, sxy, lam):
    if sxx == 0 or sxx + lam == 0:
        return 0.0
    ols = sxy / sxx
    ridge = sxy / (sxx + lam)
    return ridge - ols`,
    testCases: [
      { input: [10, 5, 5], expected: -0.16666666666666669 },
      { input: [10, 5, 0], expected: 0.0 },
      { input: [10, 5, 10], expected: -0.25 },
      { input: [0, 5, 5], expected: 0.0 },
      { input: [4, 8, 4], expected: -1.0 },
    ],
    hint: "Ridge always shrinks the slope toward zero, so the bias is negative for positive Sxy.",
  },
  {
    id: "st-204",
    title: "Random-Effects Meta Mean",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Return the DerSimonian-Laird random-effects pooled mean using weights 1/(se_i^2 + tau2), where tau2 = max(0, (Q - (k-1)) / (sum(w) - sum(w^2)/sum(w))) and Q is the fixed-effect Cochran statistic. Return 0.0 when fewer than two studies are given, any se <= 0, or the heterogeneity denominator is not positive.",
    starterCode: `def random_effects_meta(yi, sei):
    # Your code here
    pass`,
    solution: `def random_effects_meta(yi, sei):
    k = len(yi)
    if k < 2 or len(sei) != k:
        return 0.0
    w = []
    for s in sei:
        if s <= 0:
            return 0.0
        w.append(1.0 / (s * s))
    sw = sum(w)
    theta_f = sum(w[i] * yi[i] for i in range(k)) / sw
    q = sum(w[i] * (yi[i] - theta_f) ** 2 for i in range(k))
    c = sw - sum(wi * wi for wi in w) / sw
    if c <= 0:
        return 0.0
    tau2 = (q - (k - 1)) / c
    if tau2 < 0:
        tau2 = 0.0
    wr = [1.0 / (sei[i] * sei[i] + tau2) for i in range(k)]
    return sum(wr[i] * yi[i] for i in range(k)) / sum(wr)`,
    testCases: [
      { input: [[1.0, 1.2], [0.1, 0.1]], expected: 1.0999999999999999 },
      { input: [[0.5, 0.3, 0.7], [0.1, 0.2, 0.15]], expected: 0.5220856225860849 },
      { input: [[0.5, 0.6], [0.05, 0.5]], expected: 0.500990099009901 },
      { input: [[1], [0.1]], expected: 0.0 },
      { input: [[0.1, 0.2], [0, 0.1]], expected: 0.0 },
    ],
    hint: "Adding tau-squared to each variance downweights small, noisy studies.",
  },
  {
    id: "st-205",
    title: "Tau-Squared and I-Squared",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return [tau2, I2] for a set of effect sizes and standard errors: tau2 is the DerSimonian-Laird estimate max(0, (Q - (k-1))/(sum(w) - sum(w^2)/sum(w))) and I2 = max(0, (Q - (k-1))/Q)*100 with Q the fixed-effect Cochran statistic. Return [0.0, 0.0] when fewer than two studies are given, any se <= 0, or the denominator is not positive.",
    starterCode: `def tau_i_squared(yi, sei):
    # Your code here
    pass`,
    solution: `def tau_i_squared(yi, sei):
    k = len(yi)
    if k < 2 or len(sei) != k:
        return [0.0, 0.0]
    w = []
    for s in sei:
        if s <= 0:
            return [0.0, 0.0]
        w.append(1.0 / (s * s))
    sw = sum(w)
    theta = sum(w[i] * yi[i] for i in range(k)) / sw
    q = sum(w[i] * (yi[i] - theta) ** 2 for i in range(k))
    c = sw - sum(wi * wi for wi in w) / sw
    if c <= 0:
        return [0.0, 0.0]
    tau2 = (q - (k - 1)) / c
    if tau2 < 0:
        tau2 = 0.0
    if q == 0:
        i2 = 0.0
    else:
        i2 = (q - (k - 1)) / q * 100.0
        if i2 < 0:
            i2 = 0.0
    return [tau2, i2]`,
    testCases: [
      { input: [[1.0, 1.2], [0.1, 0.1]], expected: [0.009999999999999986, 49.999999999999964] },
      { input: [[0.5, 0.5, 0.5], [0.1, 0.2, 0.3]], expected: [0.0, 0.0] },
      { input: [[0.5, 0.3, 0.7], [0.1, 0.2, 0.15]], expected: [0.007241379310344817, 25.609756097560947] },
      { input: [[1, 1.5], [0.1, 0.2]], expected: [0.1, 80.0] },
      { input: [[1], [0.1]], expected: [0.0, 0.0] },
    ],
    hint: "I-squared is the share of total variability due to between-study heterogeneity.",
  },
  {
    id: "st-206",
    title: "Fixed vs Random Weights",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return [fixed_weights, random_weights] with fixed weights 1/se_i^2 and random weights 1/(se_i^2 + tau2) for the supplied between-study variance. Return [[], []] for empty input, a negative tau2, or any se <= 0.",
    starterCode: `def fixed_vs_random_weights(sei, tau2):
    # Your code here
    pass`,
    solution: `def fixed_vs_random_weights(sei, tau2):
    if not sei or tau2 < 0:
        return [[], []]
    for s in sei:
        if s <= 0:
            return [[], []]
    fixed = [1.0 / (s * s) for s in sei]
    random = [1.0 / (s * s + tau2) for s in sei]
    return [fixed, random]`,
    testCases: [
      { input: [[0.1, 0.2], 0.01], expected: [[99.99999999999999, 24.999999999999996], [49.99999999999999, 19.999999999999996]] },
      { input: [[0.5], 0], expected: [[4.0], [4.0]] },
      { input: [[], 0.1], expected: [[], []] },
      { input: [[0, 0.1], 0.1], expected: [[], []] },
      { input: [[0.2, 0.2, 0.2], 0.04], expected: [[24.999999999999996, 24.999999999999996, 24.999999999999996], [12.499999999999998, 12.499999999999998, 12.499999999999998]] },
    ],
    hint: "Random-effects weights are always smaller than fixed-effect weights when tau2 > 0.",
  },
  {
    id: "st-207",
    title: "Egger Test Lite",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Return the intercept of Egger's regression of the standardized effect y_i/se_i on precision 1/se_i. Return 0.0 when fewer than three studies are given, any se <= 0, or precision has zero variance.",
    starterCode: `def egger_intercept(yi, sei):
    # Your code here
    pass`,
    solution: `def egger_intercept(yi, sei):
    k = len(yi)
    if k < 3 or len(sei) != k:
        return 0.0
    xs = []
    zs = []
    for i in range(k):
        if sei[i] <= 0:
            return 0.0
        xs.append(1.0 / sei[i])
        zs.append(yi[i] / sei[i])
    mx = sum(xs) / k
    mz = sum(zs) / k
    sxx = sum((v - mx) ** 2 for v in xs)
    if sxx == 0:
        return 0.0
    sxz = sum((xs[i] - mx) * (zs[i] - mz) for i in range(k))
    slope = sxz / sxx
    return mz - slope * mx`,
    testCases: [
      { input: [[1.0, 0.8, 1.2], [0.1, 0.2, 0.15]], expected: -0.7142857142857144 },
      { input: [[0.5, 0.5, 0.5], [0.1, 0.2, 0.3]], expected: 0.0 },
      { input: [[1, 2, 3], [1, 1, 1]], expected: 0.0 },
      { input: [[1, 1], [1, 2]], expected: 0.0 },
      { input: [[2.0, 1.0, 0.5, 1.5], [0.1, 0.3, 0.2, 0.5]], expected: -4.2781557067271345 },
    ],
    hint: "A non-zero intercept suggests funnel plot asymmetry (small-study effects).",
  },
  {
    id: "st-208",
    title: "Funnel Asymmetry",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Split studies at the median standard error (the k//2 smallest versus the rest) and return the difference in fixed-effect pooled means (small-SE group minus large-SE group). Return 0.0 when fewer than two studies are given, any se <= 0, or a split group is empty.",
    starterCode: `def funnel_asymmetry(yi, sei):
    # Your code here
    pass`,
    solution: `def funnel_asymmetry(yi, sei):
    k = len(yi)
    if k < 2 or len(sei) != k:
        return 0.0
    for s in sei:
        if s <= 0:
            return 0.0
    order = sorted(range(k), key=lambda i: sei[i])
    mid = k // 2
    small = order[:mid]
    large = order[mid:]
    if not small or not large:
        return 0.0
    def pooled(idx):
        w = [1.0 / (sei[i] * sei[i]) for i in idx]
        return sum(w[t] * yi[idx[t]] for t in range(len(idx))) / sum(w)
    return pooled(small) - pooled(large)`,
    testCases: [
      { input: [[1.0, 0.8, 1.2, 0.5], [0.1, 0.2, 0.15, 0.3]], expected: 0.3538461538461537 },
      { input: [[1, 1], [0.1, 0.2]], expected: 0.0 },
      { input: [[0.5, 0.5, 0.5, 0.5], [0.1, 0.2, 0.3, 0.4]], expected: 0.0 },
      { input: [[1], [0.1]], expected: 0.0 },
      { input: [[2, 1.5], [0.1, 0.4]], expected: 0.5 },
    ],
    hint: "If small studies report larger effects, the funnel leans to one side.",
  },
  {
    id: "st-209",
    title: "Trim-and-Fill Lite",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Return a simplified trim-and-fill adjusted mean: compute the fixed-effect pooled mean, count studies below and above it, remove the excess studies from the majority side (the most extreme ones), and recompute the pooled mean. Return 0.0 when fewer than two studies are given, any se <= 0, or the kept set is empty.",
    starterCode: `def trim_and_fill_lite(yi, sei):
    # Your code here
    pass`,
    solution: `def trim_and_fill_lite(yi, sei):
    k = len(yi)
    if k < 2 or len(sei) != k:
        return 0.0
    for s in sei:
        if s <= 0:
            return 0.0
    def pooled(idx):
        w = [1.0 / (sei[i] * sei[i]) for i in idx]
        return sum(w[t] * yi[idx[t]] for t in range(len(idx))) / sum(w)
    theta = pooled(list(range(k)))
    left = [i for i in range(k) if yi[i] < theta]
    right = [i for i in range(k) if yi[i] > theta]
    if len(right) == len(left):
        return theta
    if len(right) > len(left):
        drop = sorted(right, key=lambda i: yi[i], reverse=True)[:len(right) - len(left)]
    else:
        drop = sorted(left, key=lambda i: yi[i])[:len(left) - len(right)]
    keep = [i for i in range(k) if i not in drop]
    if not keep:
        return 0.0
    return pooled(keep)`,
    testCases: [
      { input: [[1.0, 1.2, 1.4, 0.8, 0.9], [0.1, 0.1, 0.1, 0.1, 0.1]], expected: 1.1249999999999998 },
      { input: [[1, 1.2, 1.4], [0.1, 0.1, 0.1]], expected: 1.2 },
      { input: [[5, 5, 5], [0.1, 0.2, 0.3]], expected: 5.0 },
      { input: [[0.1, 0.2], [0.1, 0.1]], expected: 0.15000000000000002 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Trimming the excess on one side of the funnel shifts the pooled estimate.",
  },
  {
    id: "st-210",
    title: "Risk Difference Pooling and NNT",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return [pooled, nnt] where pooled is the inverse-variance weighted risk difference sum(rd_i/var_i)/sum(1/var_i) and nnt = 1/|pooled|, or 0.0 when the pooled difference is zero. Return [0.0, 0.0] for empty or mismatched input or any variance <= 0.",
    starterCode: `def pool_risk_difference(rd, variances):
    # Your code here
    pass`,
    solution: `def pool_risk_difference(rd, variances):
    if not rd or len(rd) != len(variances):
        return [0.0, 0.0]
    num = 0.0
    den = 0.0
    for i in range(len(rd)):
        if variances[i] <= 0:
            return [0.0, 0.0]
        num += rd[i] / variances[i]
        den += 1.0 / variances[i]
    if den == 0:
        return [0.0, 0.0]
    pooled = num / den
    if pooled == 0:
        return [0.0, 0.0]
    return [pooled, 1.0 / abs(pooled)]`,
    testCases: [
      { input: [[0.1, 0.2], [0.01, 0.01]], expected: [0.15, 6.666666666666667] },
      { input: [[0.1, 0.1, 0.1], [0.04, 0.01, 0.0025]], expected: [0.1, 10.0] },
      { input: [[0.2, 0.0], [0.01, 0.01]], expected: [0.1, 10.0] },
      { input: [[0.05, -0.05], [0.01, 0.01]], expected: [0.0, 0.0] },
      { input: [[], []], expected: [0.0, 0.0] },
    ],
    hint: "Pooled NNT is the reciprocal of the absolute pooled risk difference.",
  },
  {
    id: "st-211",
    title: "Cumulative Meta Step",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the fixed-effect pooled mean after adding a new study to the existing evidence, weighting every study by 1/se^2. Return 0.0 when the new standard error or any existing standard error is not positive.",
    starterCode: `def cumulative_meta_step(existing_yi, existing_sei, new_y, new_se):
    # Your code here
    pass`,
    solution: `def cumulative_meta_step(existing_yi, existing_sei, new_y, new_se):
    if new_se <= 0:
        return 0.0
    num = new_y / (new_se * new_se)
    den = 1.0 / (new_se * new_se)
    for i in range(len(existing_yi)):
        if existing_sei[i] <= 0:
            return 0.0
        num += existing_yi[i] / (existing_sei[i] * existing_sei[i])
        den += 1.0 / (existing_sei[i] * existing_sei[i])
    return num / den`,
    testCases: [
      { input: [[0.5], [0.1], 0.7, 0.1], expected: 0.6 },
      { input: [[0.5, 0.5], [0.1, 0.1], 0.8, 0.15], expected: 0.5545454545454546 },
      { input: [[], [], 0.4, 0.2], expected: 0.39999999999999997 },
      { input: [[0.2], [0], 0.3, 0.1], expected: 0.0 },
      { input: [[0.1, 0.2], [0.1, 0.1], 0.3, 0.1], expected: 0.19999999999999998 },
    ],
    hint: "Each cumulative step reruns a fixed-effect inverse-variance average.",
  },
  {
    id: "st-212",
    title: "Sequential Boundary",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the O'Brien-Fleming-style critical boundary z_alpha/sqrt(t) at information fraction t with 0 < t <= 1. Return 0.0 when t is outside that range.",
    starterCode: `def sequential_boundary(z_alpha, information_fraction):
    # Your code here
    pass`,
    solution: `def sequential_boundary(z_alpha, information_fraction):
    if information_fraction <= 0 or information_fraction > 1:
        return 0.0
    return z_alpha / (information_fraction ** 0.5)`,
    testCases: [
      { input: [1.96, 0.5], expected: 2.7718585822512662 },
      { input: [1.96, 1.0], expected: 1.96 },
      { input: [1.96, 0.25], expected: 3.92 },
      { input: [2.576, 0.5], expected: 3.643014136673093 },
      { input: [1.96, 0.0], expected: 0.0 },
    ],
    hint: "The boundary is strict early and relaxes to the fixed-sample critical value at the end.",
  },
  {
    id: "st-213",
    title: "P-Score Lite",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the frequentist P-score of the study at index: (count of effects below its effect + 0.5*count of ties)/(k-1), ignoring uncertainty. Return 0.0 when there are fewer than two studies or the index is out of range.",
    starterCode: `def p_score(effects, index):
    # Your code here
    pass`,
    solution: `def p_score(effects, index):
    k = len(effects)
    if k < 2 or index < 0 or index >= k:
        return 0.0
    target = effects[index]
    below = sum(1 for i in range(k) if i != index and effects[i] < target)
    ties = sum(1 for i in range(k) if i != index and effects[i] == target)
    return (below + 0.5 * ties) / (k - 1)`,
    testCases: [
      { input: [[1, 2, 3], 2], expected: 1.0 },
      { input: [[1, 2, 3], 0], expected: 0.0 },
      { input: [[1, 2, 2], 2], expected: 0.75 },
      { input: [[5, 5, 5], 1], expected: 0.5 },
      { input: [[1], 0], expected: 0.0 },
    ],
    hint: "P-scores rank treatments from 1 (best) to 0 (worst) without uncertainty.",
  },
  {
    id: "st-214",
    title: "Inconsistency Factor",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the network meta-analysis inconsistency factor (d_direct - d_indirect)/sqrt(se_direct^2 + se_indirect^2). Return 0.0 when the combined variance is not positive.",
    starterCode: `def inconsistency_factor(d_direct, se_direct, d_indirect, se_indirect):
    # Your code here
    pass`,
    solution: `def inconsistency_factor(d_direct, se_direct, d_indirect, se_indirect):
    var = se_direct * se_direct + se_indirect * se_indirect
    if var <= 0:
        return 0.0
    return (d_direct - d_indirect) / (var ** 0.5)`,
    testCases: [
      { input: [0.5, 0.1, 0.3, 0.15], expected: 1.1094003924504583 },
      { input: [0.5, 0.2, 0.5, 0.2], expected: 0.0 },
      { input: [1.0, 0.1, 0.5, 0.1], expected: 3.535533905932737 },
      { input: [0.2, 0, 0.2, 0], expected: 0.0 },
      { input: [-0.3, 0.2, 0.1, 0.1], expected: -1.7888543819998317 },
    ],
    hint: "The factor standardizes the direct-indirect gap by its combined uncertainty.",
  },
  {
    id: "st-215",
    title: "Split-Plot Variance",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the variance of a difference between two whole-plot treatment means in a split-plot design: 2*(var_whole + var_sub/n_sub)/r_blocks for r whole-plot blocks. Return 0.0 when n_sub or r_blocks is not positive or a variance is negative.",
    starterCode: `def split_plot_variance(var_whole, var_sub, n_sub, r_blocks):
    # Your code here
    pass`,
    solution: `def split_plot_variance(var_whole, var_sub, n_sub, r_blocks):
    if n_sub <= 0 or r_blocks <= 0 or var_whole < 0 or var_sub < 0:
        return 0.0
    return 2.0 * (var_whole + var_sub / n_sub) / r_blocks`,
    testCases: [
      { input: [4, 9, 3, 5], expected: 2.8 },
      { input: [1, 1, 1, 1], expected: 4.0 },
      { input: [0, 4, 2, 4], expected: 1.0 },
      { input: [2, 2, 4, 2], expected: 2.5 },
      { input: [1, 1, 1, 0], expected: 0.0 },
    ],
    hint: "Whole-plot effects carry more variance than subplot effects.",
  },
  {
    id: "st-216",
    title: "Compound Symmetry Check",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return True when a square covariance matrix has one common diagonal value and one common off-diagonal value within 1e-9, and False otherwise (including non-square or empty input).",
    starterCode: `def compound_symmetry_check(matrix):
    # Your code here
    pass`,
    solution: `def compound_symmetry_check(matrix):
    n = len(matrix)
    if n < 2 or any(len(row) != n for row in matrix):
        return False
    diag = matrix[0][0]
    off = matrix[0][1]
    for i in range(n):
        for j in range(n):
            if i == j:
                if abs(matrix[i][j] - diag) > 1e-9:
                    return False
            else:
                if abs(matrix[i][j] - off) > 1e-9:
                    return False
    return True`,
    testCases: [
      { input: [[[1, 0.5], [0.5, 1]]], expected: true },
      { input: [[[1, 0.5], [0.5, 2]]], expected: false },
      { input: [[[2, 1, 1], [1, 2, 1], [1, 1, 2]]], expected: true },
      { input: [[[2, 1, 0], [1, 2, 1], [0, 1, 2]]], expected: false },
      { input: [[]], expected: false },
    ],
    hint: "Compound symmetry is the covariance structure assumed by repeated-measures ANOVA.",
  },
  {
    id: "st-217",
    title: "AR(1) Covariance",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the n-by-n AR(1) covariance matrix with entries sigma_sq * rho^|i-j|. Return [] when n <= 0 or sigma_sq < 0.",
    starterCode: `def ar1_covariance(sigma_sq, rho, n):
    # Your code here
    pass`,
    solution: `def ar1_covariance(sigma_sq, rho, n):
    if n <= 0 or sigma_sq < 0:
        return []
    return [[sigma_sq * (rho ** abs(i - j)) for j in range(n)] for i in range(n)]`,
    testCases: [
      { input: [1, 0.5, 3], expected: [[1.0, 0.5, 0.25], [0.5, 1.0, 0.5], [0.25, 0.5, 1.0]] },
      { input: [2, 0, 2], expected: [[2, 0], [0, 2]] },
      { input: [1, -0.5, 2], expected: [[1.0, -0.5], [-0.5, 1.0]] },
      { input: [1, 0.5, 1], expected: [[1.0]] },
      { input: [1, 0.5, 0], expected: [] },
    ],
    hint: "Correlation decays geometrically with the time gap.",
  },
  {
    id: "st-218",
    title: "Sphericity Check Lite",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return True when all pairwise difference variances S_ii + S_jj - 2*S_ij are equal within 1e-9 for a square covariance matrix, and False otherwise (including non-square or fewer than two variables).",
    starterCode: `def sphericity_check_lite(matrix):
    # Your code here
    pass`,
    solution: `def sphericity_check_lite(matrix):
    n = len(matrix)
    if n < 2 or any(len(row) != n for row in matrix):
        return False
    vals = []
    for i in range(n):
        for j in range(i + 1, n):
            vals.append(matrix[i][i] + matrix[j][j] - 2.0 * matrix[i][j])
    return max(vals) - min(vals) <= 1e-9`,
    testCases: [
      { input: [[[2, 2, 2], [2, 3, 2.5], [2, 2.5, 3]]], expected: true },
      { input: [[[1, 0.2, 0.5], [0.2, 1, 0.3], [0.5, 0.3, 1]]], expected: false },
      { input: [[[1, 0.5], [0.5, 1]]], expected: true },
      { input: [[[2, 1], [1, 2]]], expected: true },
      { input: [[]], expected: false },
    ],
    hint: "Sphericity always holds for two repeated measures but can fail with three or more.",
  },
  {
    id: "st-219",
    title: "Wilks Lambda Lite",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Return Wilks' lambda det(E)/det(E + H) for 2x2 within-group (E) and hypothesis (H) SSCP matrices. Return 0.0 when the shapes are not 2x2 or det(E + H) is zero.",
    starterCode: `def wilks_lambda(sscp_e, sscp_h):
    # Your code here
    pass`,
    solution: `def wilks_lambda(sscp_e, sscp_h):
    if len(sscp_e) != 2 or len(sscp_h) != 2:
        return 0.0
    if len(sscp_e[0]) != 2 or len(sscp_e[1]) != 2 or len(sscp_h[0]) != 2 or len(sscp_h[1]) != 2:
        return 0.0
    det_e = sscp_e[0][0] * sscp_e[1][1] - sscp_e[0][1] * sscp_e[1][0]
    t = [[sscp_e[i][j] + sscp_h[i][j] for j in range(2)] for i in range(2)]
    det_t = t[0][0] * t[1][1] - t[0][1] * t[1][0]
    if det_t == 0:
        return 0.0
    return det_e / det_t`,
    testCases: [
      { input: [[[4, 1], [1, 3]], [[2, 0.5], [0.5, 1]]], expected: 0.5057471264367817 },
      { input: [[[1, 0], [0, 1]], [[1, 0], [0, 1]]], expected: 0.25 },
      { input: [[[2, 1], [1, 2]], [[0, 0], [0, 0]]], expected: 1.0 },
      { input: [[[1, 1], [1, 1]], [[2, 0], [0, 2]]], expected: 0.0 },
      { input: [[[3, 0.5], [0.5, 2]], [[1, 0.2], [0.2, 1]]], expected: 0.49956559513466553 },
    ],
    hint: "Lambda is 1 when the effect adds nothing and approaches 0 for strong effects.",
  },
  {
    id: "st-220",
    title: "Discriminant Value",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the linear discriminant score x.(m1 - m0) - 0.5*(m1.m1 - m0.m0) for a point under the equal-identity-covariance simplification. Return 0.0 when the vector lengths differ.",
    starterCode: `def discriminant_value(x, mean1, mean0):
    # Your code here
    pass`,
    solution: `def discriminant_value(x, mean1, mean0):
    if len(x) != len(mean1) or len(x) != len(mean0):
        return 0.0
    d = [mean1[i] - mean0[i] for i in range(len(x))]
    dot = sum(x[i] * d[i] for i in range(len(x)))
    m1 = sum(v * v for v in mean1)
    m0 = sum(v * v for v in mean0)
    return dot - 0.5 * (m1 - m0)`,
    testCases: [
      { input: [[0.5, 0.5], [1, 1], [0, 0]], expected: 0.0 },
      { input: [[2, 1], [1, 1], [0, 0]], expected: 2.0 },
      { input: [[-1, -1], [1, 1], [0, 0]], expected: -3.0 },
      { input: [[1, 1], [2, 0], [0, 2]], expected: 0.0 },
      { input: [[1], [3], [1]], expected: -2.0 },
    ],
    hint: "Positive scores favor the first class.",
  },
  {
    id: "st-221",
    title: "Canonical Correlation for Given Weights",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the correlation between the composites a'x and b'y: (a'Rxy b)/sqrt((a'Rxx a)(b'Ryy b)), given 2-vectors of weights and the correlation blocks. Return 0.0 for wrong shapes or non-positive composite variances.",
    starterCode: `def canonical_corr_weights(a, b, rxx, ryy, rxy):
    # Your code here
    pass`,
    solution: `def canonical_corr_weights(a, b, rxx, ryy, rxy):
    if len(a) != 2 or len(b) != 2:
        return 0.0
    va = a[0] * (rxx[0][0] * a[0] + rxx[0][1] * a[1]) + a[1] * (rxx[1][0] * a[0] + rxx[1][1] * a[1])
    vb = b[0] * (ryy[0][0] * b[0] + ryy[0][1] * b[1]) + b[1] * (ryy[1][0] * b[0] + ryy[1][1] * b[1])
    if va <= 0 or vb <= 0:
        return 0.0
    num = 0.0
    for i in range(2):
        for j in range(2):
            num += a[i] * rxy[i][j] * b[j]
    return num / ((va * vb) ** 0.5)`,
    testCases: [
      { input: [[1, 0], [1, 0], [[1, 0], [0, 1]], [[1, 0], [0, 1]], [[0.6, 0.2], [0.1, 0.5]]], expected: 0.6 },
      { input: [[1, 1], [1, 1], [[1, 0.3], [0.3, 1]], [[1, 0.4], [0.4, 1]], [[0.5, 0.4], [0.4, 0.5]]], expected: 0.6671243849949912 },
      { input: [[1, -1], [1, 1], [[1, 0.3], [0.3, 1]], [[1, 0.4], [0.4, 1]], [[0.5, 0.4], [0.4, 0.5]]], expected: 0.0 },
      { input: [[1, 0], [0, 1], [[1, 0], [0, 1]], [[1, 0], [0, 1]], [[0.6, 0.2], [0.1, 0.5]]], expected: 0.2 },
      { input: [[1], [1], [[1]], [[1]], [[1]]], expected: 0.0 },
    ],
    hint: "This is the canonical correlation once the weight vectors are fixed.",
  },
  {
    id: "st-222",
    title: "Redundancy Index",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the redundancy index rc^2 * mean(squared_loadings), the share of one variable set's variance explained by the other set's canonical variate. Return 0.0 for empty loadings.",
    starterCode: `def redundancy_index(rc, squared_loadings):
    # Your code here
    pass`,
    solution: `def redundancy_index(rc, squared_loadings):
    if not squared_loadings:
        return 0.0
    return (rc ** 2) * (sum(squared_loadings) / len(squared_loadings))`,
    testCases: [
      { input: [0.8, [0.7, 0.6, 0.5]], expected: 0.38400000000000006 },
      { input: [0.5, [1.0]], expected: 0.25 },
      { input: [0.9, [0.9, 0.8]], expected: 0.6885000000000001 },
      { input: [0, [0.5, 0.5]], expected: 0.0 },
      { input: [0.6, []], expected: 0.0 },
    ],
    hint: "Redundancy is the intersection of shared variance with the variance actually extracted.",
  },
  {
    id: "st-223",
    title: "Factor Loadings from Correlation",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the first principal component loadings of the 2-item correlation matrix [[1, r], [r, 1]]. For r >= 0 return [sqrt((1+r)/2), sqrt((1+r)/2)]; for r < 0 return [sqrt((1-r)/2), -sqrt((1-r)/2)].",
    starterCode: `def factor_loadings(r):
    # Your code here
    pass`,
    solution: `def factor_loadings(r):
    if r >= 0:
        v = ((1.0 + r) / 2.0) ** 0.5
        return [v, v]
    v = ((1.0 - r) / 2.0) ** 0.5
    return [v, -v]`,
    testCases: [
      { input: [0.5], expected: [0.8660254037844386, 0.8660254037844386] },
      { input: [0.0], expected: [0.7071067811865476, 0.7071067811865476] },
      { input: [-0.5], expected: [0.8660254037844386, -0.8660254037844386] },
      { input: [1.0], expected: [1.0, 1.0] },
      { input: [-1.0], expected: [1.0, -1.0] },
    ],
    hint: "Loadings equal the eigenvector scaled by the square root of its eigenvalue.",
  },
  {
    id: "st-224",
    title: "Communality and Uniqueness",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return [communality, uniqueness] = [sum of squared loadings, 1 - sum of squared loadings] for a variable's factor loadings. Return [0.0, 1.0] for empty input.",
    starterCode: `def communality_uniqueness(loadings):
    # Your code here
    pass`,
    solution: `def communality_uniqueness(loadings):
    if not loadings:
        return [0.0, 1.0]
    c = sum(l * l for l in loadings)
    return [c, 1.0 - c]`,
    testCases: [
      { input: [[0.8, 0.5]], expected: [0.8900000000000001, 0.10999999999999988] },
      { input: [[1.0, 0.0]], expected: [1.0, 0.0] },
      { input: [[0, 0]], expected: [0, 1.0] },
      { input: [[]], expected: [0.0, 1.0] },
      { input: [[0.6, 0.6, 0.6]], expected: [1.08, -0.08000000000000007] },
    ],
    hint: "Communality is the variance a variable shares with the factors.",
  },
  {
    id: "st-225",
    title: "Eigenvalue Diagnostics",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return [count, elbow] where count is the number of eigenvalues greater than 1 and elbow is the 1-based index farthest from the line joining the first and last eigenvalue points (or 1 when there are fewer than three). Return [0, 0] for empty input.",
    starterCode: `def eigen_diagnostics(eigenvalues):
    # Your code here
    pass`,
    solution: `def eigen_diagnostics(eigenvalues):
    k = len(eigenvalues)
    if k == 0:
        return [0, 0]
    count = sum(1 for e in eigenvalues if e > 1.0)
    if k < 3:
        return [count, 1]
    x1 = 1.0
    y1 = eigenvalues[0]
    x2 = float(k)
    y2 = eigenvalues[-1]
    dx = x2 - x1
    dy = y2 - y1
    best_i = 1
    best_d = -1.0
    for i in range(1, k + 1):
        px = float(i)
        py = eigenvalues[i - 1]
        d = abs(dy * px - dx * py + x2 * y1 - y2 * x1) / ((dx * dx + dy * dy) ** 0.5)
        if d > best_d:
            best_d = d
            best_i = i
    return [count, best_i]`,
    testCases: [
      { input: [[3.0, 1.5, 1.0, 0.5]], expected: [2, 2] },
      { input: [[5, 3, 1, 0.5, 0.2]], expected: [2, 3] },
      { input: [[1, 1, 1]], expected: [0, 1] },
      { input: [[2, 1, 0.5]], expected: [1, 2] },
      { input: [[]], expected: [0, 0] },
    ],
    hint: "The elbow is the point of maximum deviation from the line through the endpoints.",
  },
  {
    id: "st-226",
    title: "Varimax Step",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Perform one varimax rotation step on a 2-factor loading matrix. With x_i = l1^2 - l2^2 and y_i = 2*l1*l2, the rotation angle is phi = 0.25*atan2(2*sum(x*y), sum(x^2 - y^2)); return the rotated loadings. Rows must have exactly two loadings, otherwise return [].",
    starterCode: `import math
def varimax_step(loadings):
    # Your code here
    pass`,
    solution: `import math
def varimax_step(loadings):
    if not loadings:
        return []
    for row in loadings:
        if len(row) != 2:
            return []
    xy = 0.0
    x2y2 = 0.0
    for row in loadings:
        x = row[0] * row[0] - row[1] * row[1]
        y = 2.0 * row[0] * row[1]
        xy += x * y
        x2y2 += x * x - y * y
    phi = 0.25 * math.atan2(2.0 * xy, x2y2)
    c = math.cos(phi)
    s = math.sin(phi)
    out = []
    for row in loadings:
        out.append([c * row[0] + s * row[1], -s * row[0] + c * row[1]])
    return out`,
    testCases: [
      { input: [[[0.8, 0.6], [0.8, 0.6]]], expected: [[1.0, 0.0], [1.0, 0.0]] },
      { input: [[[0.9, 0.1], [0.1, 0.9]]], expected: [[0.9, 0.1], [0.1, 0.9]] },
      { input: [[[0.7, 0.7], [0.7, 0.7]]], expected: [[0.9899494936611665, 1.1102230246251565e-16], [0.9899494936611665, 1.1102230246251565e-16]] },
      { input: [[[0.6, 0.8], [0.6, 0.8]]], expected: [[0.0, 1.0], [0.0, 1.0]] },
      { input: [[]], expected: [] },
    ],
    hint: "This single step sharpens the loading pattern toward simple structure.",
  },
  {
    id: "st-227",
    title: "Factor Score",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the regression factor score sum(l_i*z_i)/sum(l_i^2) for standardized variable scores and loadings. Return 0.0 for mismatched or empty input or a zero sum of squared loadings.",
    starterCode: `def factor_score(z_scores, loadings):
    # Your code here
    pass`,
    solution: `def factor_score(z_scores, loadings):
    if not z_scores or len(z_scores) != len(loadings):
        return 0.0
    denom = sum(l * l for l in loadings)
    if denom == 0:
        return 0.0
    return sum(z_scores[i] * loadings[i] for i in range(len(z_scores))) / denom`,
    testCases: [
      { input: [[1, 2], [1, 1]], expected: 1.5 },
      { input: [[2, -1], [0.8, 0.6]], expected: 1.0 },
      { input: [[1, 1, 1], [0.5, 0.5, 0.5]], expected: 2.0 },
      { input: [[1, 2], [0, 0]], expected: 0.0 },
      { input: [[5], [2]], expected: 2.5 },
    ],
    hint: "The regression method weights each standardized score by its loading.",
  },
  {
    id: "st-228",
    title: "CFI Lite",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the comparative fit index 1 - max(chi2 - df, 0)/max(chi2_null - df_null, 0), clamped to [0, 1]. Return 0.0 when a degrees-of-freedom value is not positive or the null denominator is not positive.",
    starterCode: `def cfi_lite(chi2, df, chi2_null, df_null):
    # Your code here
    pass`,
    solution: `def cfi_lite(chi2, df, chi2_null, df_null):
    if df <= 0 or df_null <= 0:
        return 0.0
    num = chi2 - df
    if num < 0:
        num = 0.0
    den = chi2_null - df_null
    if den <= 0:
        return 0.0
    cfi = 1.0 - num / den
    if cfi < 0:
        return 0.0
    if cfi > 1:
        return 1.0
    return cfi`,
    testCases: [
      { input: [30, 10, 200, 15], expected: 0.8918918918918919 },
      { input: [5, 10, 200, 15], expected: 1.0 },
      { input: [50, 20, 60, 25], expected: 0.1428571428571429 },
      { input: [30, 0, 200, 15], expected: 0.0 },
      { input: [30, 10, 10, 15], expected: 0.0 },
    ],
    hint: "CFI compares the fitted model against a baseline independence model.",
  },
  {
    id: "st-229",
    title: "Chi-Square/df and RMSEA",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return [chi2/df, rmsea] with rmsea = sqrt(max(chi2 - df, 0)/(df*(n-1))). Return [0.0, 0.0] when df <= 0 or n <= 1.",
    starterCode: `def chi2_rmsea(chi2, df, n):
    # Your code here
    pass`,
    solution: `def chi2_rmsea(chi2, df, n):
    if df <= 0 or n <= 1:
        return [0.0, 0.0]
    cm = chi2 / df
    excess = chi2 - df
    if excess < 0:
        excess = 0.0
    return [cm, (excess / (df * (n - 1))) ** 0.5]`,
    testCases: [
      { input: [30, 10, 200], expected: [3.0, 0.1002509414234171] },
      { input: [5, 10, 100], expected: [0.5, 0.0] },
      { input: [60, 20, 500], expected: [3.0, 0.06330889378329184] },
      { input: [0, 5, 100], expected: [0.0, 0.0] },
      { input: [30, 0, 100], expected: [0.0, 0.0] },
    ],
    hint: "RMSEA rewards parsimony because it divides by the degrees of freedom.",
  },
  {
    id: "st-230",
    title: "Invariance Delta",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the change in chi-square per degree of freedom between two nested measurement models: (chi2_metric - chi2_config)/(df_metric - df_config). Return 0.0 when the degrees-of-freedom difference is not positive.",
    starterCode: `def invariance_delta(chi2_config, df_config, chi2_metric, df_metric):
    # Your code here
    pass`,
    solution: `def invariance_delta(chi2_config, df_config, chi2_metric, df_metric):
    ddf = df_metric - df_config
    if ddf <= 0:
        return 0.0
    return (chi2_metric - chi2_config) / ddf`,
    testCases: [
      { input: [30, 10, 45, 15], expected: 3.0 },
      { input: [30, 10, 30, 10], expected: 0.0 },
      { input: [20, 8, 40, 18], expected: 2.0 },
      { input: [50, 20, 45, 25], expected: -1.0 },
      { input: [10, 5, 30, 4], expected: 0.0 },
    ],
    hint: "A large chi-square change per df signals that the constraint hurts fit.",
  },
];