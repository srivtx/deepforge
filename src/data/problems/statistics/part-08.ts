import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "st-276",
    title: "ATE from a Table",
    category: "Statistics",
    difficulty: "Easy",
    description: "Return the average treatment effect implied by group summary totals, treated_sum/treated_n minus control_sum/control_n. Return 0.0 when either group size is not positive.",
    starterCode: `def ate_from_table(control_n, control_sum, treated_n, treated_sum):
    # Your code here
    pass`,
    solution: `def ate_from_table(control_n, control_sum, treated_n, treated_sum):
    if control_n <= 0 or treated_n <= 0:
        return 0.0
    return treated_sum / treated_n - control_sum / control_n`,
    testCases: [
      { input: [50, 250.0, 40, 280.0], expected: 2.0 },
      { input: [10, 100.0, 10, 100.0], expected: 0.0 },
      { input: [0, 0.0, 5, 20.0], expected: 0.0 },
      { input: [4, 6.0, 2, 5.0], expected: 1.0 },
      { input: [3, 0.0, 3, 9.0], expected: 3.0 },
    ],
    hint: "Compare the two group means directly.",
  },
  {
    id: "st-277",
    title: "ATT via Propensity Odds",
    category: "Statistics",
    difficulty: "Medium",
    description: "Return the average treatment effect on the treated using propensity odds weighting: the treated mean minus the odds-weighted control mean, where a control unit with propensity e gets weight e/(1-e). Return 0.0 for empty or mismatched input, when there are no treated units or no usable controls, or when a control has propensity at least 1.",
    starterCode: `def att_estimate(treatment, outcome, propensity):
    # Your code here
    pass`,
    solution: `def att_estimate(treatment, outcome, propensity):
    n = len(treatment)
    if n == 0 or len(outcome) != n or len(propensity) != n:
        return 0.0
    n1 = 0
    sum1 = 0.0
    num = 0.0
    den = 0.0
    for t, y, e in zip(treatment, outcome, propensity):
        if t == 1:
            n1 += 1
            sum1 += y
        else:
            if e >= 1.0:
                return 0.0
            w = e / (1.0 - e)
            num += w * y
            den += w
    if n1 == 0 or den == 0:
        return 0.0
    return sum1 / n1 - num / den`,
    testCases: [
      { input: [[1, 1, 0, 0], [10, 12, 4, 6], [0.6, 0.7, 0.3, 0.5]], expected: 5.6 },
      { input: [[1, 0], [5, 1], [0.5, 0.5]], expected: 4.0 },
      { input: [[0, 0], [1, 2], [0.2, 0.3]], expected: 0.0 },
      { input: [[1, 0], [5, 1], [0.6, 1.0]], expected: 0.0 },
      { input: [[1, 1, 0], [2, 4, 1], [0.4, 0.6, 0.2]], expected: 2.0 },
    ],
    hint: "Controls that look like the treated group carry more weight.",
  },
  {
    id: "st-278",
    title: "Naive vs Adjusted Difference",
    category: "Statistics",
    difficulty: "Easy",
    description: "Return [naive, adjusted] as a two-element list, where naive is treated_mean minus control_mean and adjusted additionally removes the piece explained by covariate imbalance: naive - slope*(treated_covariate_mean - control_covariate_mean).",
    starterCode: `def naive_vs_adjusted(treated_mean, control_mean, treated_covariate_mean, control_covariate_mean, covariate_slope):
    # Your code here
    pass`,
    solution: `def naive_vs_adjusted(treated_mean, control_mean, treated_covariate_mean, control_covariate_mean, covariate_slope):
    naive = treated_mean - control_mean
    adjusted = naive - covariate_slope * (treated_covariate_mean - control_covariate_mean)
    return [naive, adjusted]`,
    testCases: [
      { input: [12.0, 8.0, 3.0, 2.0, 1.5], expected: [4.0, 2.5] },
      { input: [10.0, 10.0, 2.0, 2.0, 3.0], expected: [0.0, 0.0] },
      { input: [5.0, 6.0, 1.0, 2.0, -2.0], expected: [-1.0, -3.0] },
      { input: [7.0, 7.0, 4.0, 1.0, 0.0], expected: [0.0, 0.0] },
    ],
    hint: "The adjusted effect subtracts slope times the covariate gap.",
  },
  {
    id: "st-279",
    title: "Confounding Bias Magnitude",
    category: "Statistics",
    difficulty: "Easy",
    description: "Return the bias from an omitted confounder: slope * covariate_gap, where slope = correlation * sd_outcome / sd_covariate is the outcome-on-confounder regression coefficient and covariate_gap is the treated-minus-control mean of the confounder. Return 0.0 when sd_covariate is zero.",
    starterCode: `def confounding_bias(correlation, sd_covariate, sd_outcome, covariate_gap):
    # Your code here
    pass`,
    solution: `def confounding_bias(correlation, sd_covariate, sd_outcome, covariate_gap):
    if sd_covariate == 0:
        return 0.0
    slope = correlation * sd_outcome / sd_covariate
    return slope * covariate_gap`,
    testCases: [
      { input: [0.5, 2.0, 4.0, 1.5], expected: 1.5 },
      { input: [0.0, 2.0, 4.0, 3.0], expected: 0.0 },
      { input: [-0.4, 5.0, 2.0, 2.5], expected: -0.4 },
      { input: [0.3, 0.0, 2.0, 1.0], expected: 0.0 },
    ],
    hint: "Convert the correlation to a slope first.",
  },
  {
    id: "st-280",
    title: "Backdoor Criterion Check",
    category: "Statistics",
    difficulty: "Hard",
    description: "Given a small DAG with n nodes 0..n-1, directed edges as [u, v] pairs, a treatment node, an outcome node, and a list of adjustment nodes, return True when the adjustment set satisfies the backdoor criterion. It holds when no adjusted node is a descendant of the treatment and the adjustment d-separates treatment from outcome after deleting edges out of the treatment.",
    starterCode: `def backdoor_criterion(n, edges, treatment, outcome, adjustment):
    # Your code here
    pass`,
    solution: `def backdoor_criterion(n, edges, treatment, outcome, adjustment):
    directed = set()
    for u, v in edges:
        directed.add((u, v))
    children = [[] for _ in range(n)]
    parents = [[] for _ in range(n)]
    for u, v in edges:
        children[u].append(v)
        parents[v].append(u)
    z = set(adjustment)
    desc = set()
    stack = list(children[treatment])
    while stack:
        u = stack.pop()
        if u not in desc:
            desc.add(u)
            stack.extend(children[u])
    for a in z:
        if a in desc:
            return False
    anc = set(z)
    stack = list(z)
    while stack:
        u = stack.pop()
        for p in parents[u]:
            if p not in anc:
                anc.add(p)
                stack.append(p)
    adj = [[] for _ in range(n)]
    for u, v in edges:
        if u == treatment:
            continue
        adj[u].append(v)
        adj[v].append(u)
    active = [False]
    visited = [False] * n
    def dfs(u, path):
        if active[0]:
            return
        if u == outcome and len(path) > 1:
            ok = True
            for i in range(1, len(path) - 1):
                a = path[i - 1]
                b = path[i]
                c = path[i + 1]
                if (a, b) in directed and (c, b) in directed:
                    if b not in anc:
                        ok = False
                        break
                else:
                    if b in z:
                        ok = False
                        break
            if ok:
                active[0] = True
            return
        for v in adj[u]:
            if not visited[v]:
                visited[v] = True
                path.append(v)
                dfs(v, path)
                path.pop()
                visited[v] = False
    visited[treatment] = True
    dfs(treatment, [treatment])
    return not active[0]`,
    testCases: [
      { input: [3, [[2, 0], [2, 1], [0, 1]], 0, 1, []], expected: false },
      { input: [3, [[2, 0], [2, 1], [0, 1]], 0, 1, [2]], expected: true },
      { input: [3, [[0, 2], [2, 1]], 0, 1, [2]], expected: false },
      { input: [4, [[1, 0], [1, 3], [0, 2], [2, 3]], 0, 3, []], expected: false },
      { input: [4, [[1, 0], [1, 3], [0, 2], [2, 3]], 0, 3, [1]], expected: true },
    ],
    hint: "Delete arrows out of treatment, then check every remaining path for blocking.",
  },
  {
    id: "st-281",
    title: "Collider Bias Direction",
    category: "Statistics",
    difficulty: "Easy",
    description: "Conditioning on a collider that is a common effect of treatment and outcome induces association between them. Return the sign of that induced bias as -1 * sign(treatment_to_collider) * sign(outcome_to_collider), where the inputs are the signed path coefficients. Return 0 when either path coefficient is zero.",
    starterCode: `def collider_bias_direction(treatment_to_collider, outcome_to_collider):
    # Your code here
    pass`,
    solution: `def collider_bias_direction(treatment_to_collider, outcome_to_collider):
    def sign(x):
        if x > 0:
            return 1
        if x < 0:
            return -1
        return 0
    return -sign(treatment_to_collider) * sign(outcome_to_collider)`,
    testCases: [
      { input: [1, 1], expected: -1 },
      { input: [1, -1], expected: 1 },
      { input: [-1, -1], expected: -1 },
      { input: [0, 1], expected: 0 },
      { input: [2, 3], expected: -1 },
    ],
    hint: "Two positive arrows into the collider create a negative bias.",
  },
  {
    id: "st-282",
    title: "Simpson Reversal Check",
    category: "Statistics",
    difficulty: "Medium",
    description: "Each stratum is [n_treated, treated_mean, n_control, control_mean]. Return True when every within-stratum treated-minus-control difference has the same strict sign while the pooled difference, computed from the aggregated group means, has the opposite strict sign. Return False for empty or invalid input.",
    starterCode: `def simpson_reversal_check(strata):
    # Your code here
    pass`,
    solution: `def simpson_reversal_check(strata):
    if not strata:
        return False
    diffs = []
    total_t = 0.0
    total_c = 0.0
    sum_t = 0.0
    sum_c = 0.0
    for n_t, m_t, n_c, m_c in strata:
        if n_t <= 0 or n_c <= 0:
            return False
        diffs.append(m_t - m_c)
        total_t += n_t
        total_c += n_c
        sum_t += n_t * m_t
        sum_c += n_c * m_c
    if total_t == 0 or total_c == 0:
        return False
    pooled = sum_t / total_t - sum_c / total_c
    if all(d > 0 for d in diffs) and pooled < 0:
        return True
    if all(d < 0 for d in diffs) and pooled > 0:
        return True
    return False`,
    testCases: [
      { input: [[[10, 55.0, 90, 50.0], [90, 25.0, 10, 20.0]]], expected: true },
      { input: [[[50, 55.0, 50, 50.0], [50, 25.0, 50, 20.0]]], expected: false },
      { input: [[[90, 45.0, 10, 50.0], [10, 15.0, 90, 20.0]]], expected: true },
      { input: [[[50, 55.0, 50, 50.0], [50, 20.0, 50, 25.0]]], expected: false },
      { input: [[]], expected: false },
    ],
    hint: "Aggregate all treated units into one mean and all controls into another.",
  },
  {
    id: "st-283",
    title: "Logistic Propensity Score",
    category: "Statistics",
    difficulty: "Easy",
    description: "Return the logistic propensity score 1/(1+exp(-z)) with z = coefficients[0] + sum(coefficients[j+1]*features[j]). Return 0.0 when coefficients does not have exactly len(features) + 1 entries. Handle large negative z without overflow.",
    starterCode: `import math
def logistic_propensity(features, coefficients):
    # Your code here
    pass`,
    solution: `import math
def logistic_propensity(features, coefficients):
    if len(coefficients) != len(features) + 1:
        return 0.0
    z = coefficients[0]
    for x, b in zip(features, coefficients[1:]):
        z += b * x
    if z >= 0:
        return 1.0 / (1.0 + math.exp(-z))
    e = math.exp(z)
    return e / (1.0 + e)`,
    testCases: [
      { input: [[1.0, 2.0], [-1.0, 0.5, 1.0]], expected: 0.8175744761936437 },
      { input: [[0.0], [0.0, 1.0]], expected: 0.5 },
      { input: [[5.0], [0.0, -10.0]], expected: 1.9287498479639178e-22 },
      { input: [[1.0], [0.0]], expected: 0.0 },
      { input: [[], [0.0]], expected: 0.5 },
    ],
    hint: "Compute the linear predictor, then squash it through the sigmoid.",
  },
  {
    id: "st-284",
    title: "Propensity Match Pair Count",
    category: "Statistics",
    difficulty: "Medium",
    description: "Form matched pairs greedily in input order: each treated unit takes the nearest unused control within caliper of its propensity score, and that control is then removed. Ties keep the earliest control. Return the number of pairs formed, or 0 when there are no controls.",
    starterCode: `def propensity_match_count(treatment, propensity, caliper):
    # Your code here
    pass`,
    solution: `def propensity_match_count(treatment, propensity, caliper):
    n = len(treatment)
    if n == 0 or len(propensity) != n:
        return 0
    treated = [e for t, e in zip(treatment, propensity) if t == 1]
    control = [e for t, e in zip(treatment, propensity) if t == 0]
    used = [False] * len(control)
    pairs = 0
    for et in treated:
        best = -1
        best_d = None
        for i, ec in enumerate(control):
            if used[i]:
                continue
            d = abs(et - ec)
            if d <= caliper and (best_d is None or d < best_d):
                best = i
                best_d = d
        if best >= 0:
            used[best] = True
            pairs += 1
    return pairs`,
    testCases: [
      { input: [[1, 1, 0, 0, 0], [0.9, 0.4, 0.85, 0.5, 0.2], 0.1], expected: 2 },
      { input: [[1, 1, 0], [0.3, 0.7, 0.5], 0.05], expected: 0 },
      { input: [[1, 0, 1, 0], [0.2, 0.25, 0.8, 0.75], 0.1], expected: 2 },
      { input: [[1, 1], [0.5, 0.6], 0.5], expected: 0 },
      { input: [[1, 0], [0.5, 0.5], 0.0], expected: 1 },
    ],
    hint: "Greedy nearest neighbor matching within the caliper.",
  },
  {
    id: "st-285",
    title: "IPW Average Treatment Effect",
    category: "Statistics",
    difficulty: "Medium",
    description: "Return the Horvitz-Thompson inverse probability weighted ATE: (1/n) * (sum(t_i*y_i/e_i) - sum((1-t_i)*y_i/(1-e_i))). Return 0.0 for empty or mismatched input, a treated unit with e <= 0, or a control with e >= 1.",
    starterCode: `def ipw_ate(treatment, outcome, propensity):
    # Your code here
    pass`,
    solution: `def ipw_ate(treatment, outcome, propensity):
    n = len(treatment)
    if n == 0 or len(outcome) != n or len(propensity) != n:
        return 0.0
    t_sum = 0.0
    c_sum = 0.0
    for t, y, e in zip(treatment, outcome, propensity):
        if t == 1:
            if e <= 0:
                return 0.0
            t_sum += y / e
        else:
            if e >= 1:
                return 0.0
            c_sum += y / (1.0 - e)
    return (t_sum - c_sum) / n`,
    testCases: [
      { input: [[1, 1, 0, 0], [10, 12, 4, 6], [0.5, 0.5, 0.5, 0.5]], expected: 6.0 },
      { input: [[1, 0], [5, 1], [0.5, 0.5]], expected: 4.0 },
      { input: [[1, 0], [5, 1], [0.0, 0.5]], expected: 0.0 },
      { input: [[1, 0], [5, 1], [0.5, 1.0]], expected: 0.0 },
      { input: [[], [], []], expected: 0.0 },
    ],
    hint: "Each unit stands in for 1/e or 1/(1-e) look-alikes.",
  },
  {
    id: "st-286",
    title: "Stabilized IPW Estimate",
    category: "Statistics",
    difficulty: "Medium",
    description: "Return the stabilized IPW ATE: (1/n) * (sum(t_i*y_i*p1/e_i) - sum((1-t_i)*y_i*p0/(1-e_i))), where p1 and p0 are the observed treated and control shares. Stabilized weights stay bounded when the arms are unbalanced. Return 0.0 for invalid input or when either arm has no units.",
    starterCode: `def stabilized_ipw_ate(treatment, outcome, propensity):
    # Your code here
    pass`,
    solution: `def stabilized_ipw_ate(treatment, outcome, propensity):
    n = len(treatment)
    if n == 0 or len(outcome) != n or len(propensity) != n:
        return 0.0
    n1 = 0
    for t in treatment:
        if t == 1:
            n1 += 1
    n0 = n - n1
    if n1 == 0 or n0 == 0:
        return 0.0
    p1 = n1 / n
    p0 = n0 / n
    total = 0.0
    for t, y, e in zip(treatment, outcome, propensity):
        if t == 1:
            if e <= 0:
                return 0.0
            total += y * p1 / e
        else:
            if e >= 1:
                return 0.0
            total += y * p0 / (1.0 - e)
    return total / n`,
    testCases: [
      { input: [[1, 1, 0, 0], [10, 12, 4, 6], [0.6, 0.4, 0.3, 0.7]], expected: 9.047619047619047 },
      { input: [[1, 0], [5, 1], [0.5, 0.5]], expected: 3.0 },
      { input: [[1, 1], [2, 4], [0.5, 0.8]], expected: 0.0 },
      { input: [[1, 0], [5, 1], [0.5, 1.0]], expected: 0.0 },
      { input: [[], [], []], expected: 0.0 },
    ],
    hint: "Multiply treated weights by p1 and control weights by p0.",
  },
  {
    id: "st-287",
    title: "Doubly Robust ATE",
    category: "Statistics",
    difficulty: "Medium",
    description: "Return the augmented IPW (doubly robust) ATE: the mean of (mu1 - mu0) plus the weighted treated residual (y - mu1)/e minus the weighted control residual (y - mu0)/(1-e). The estimate is consistent if either the outcome model or the propensity model is correct. Return 0.0 for empty or mismatched input, a treated unit with e <= 0, or a control with e >= 1.",
    starterCode: `def doubly_robust_ate(treatment, outcome, propensity, mu1, mu0):
    # Your code here
    pass`,
    solution: `def doubly_robust_ate(treatment, outcome, propensity, mu1, mu0):
    n = len(treatment)
    if n == 0 or len(outcome) != n or len(propensity) != n or len(mu1) != n or len(mu0) != n:
        return 0.0
    total = 0.0
    for t, y, e, m1, m0 in zip(treatment, outcome, propensity, mu1, mu0):
        if t == 1:
            if e <= 0:
                return 0.0
            total += m1 - m0 + (y - m1) / e
        else:
            if e >= 1:
                return 0.0
            total += m1 - m0 - (y - m0) / (1.0 - e)
    return total / n`,
    testCases: [
      { input: [[1, 0, 1, 0], [10, 5, 8, 4], [0.5, 0.5, 0.4, 0.6], [9, 6, 7, 5], [8, 4, 6, 3]], expected: 1.5 },
      { input: [[1], [7], [0.7], [6], [5]], expected: 2.428571428571429 },
      { input: [[0], [2], [0.3], [3], [1]], expected: 0.5714285714285714 },
      { input: [[], [], [], [], []], expected: 0.0 },
      { input: [[1], [5], [0], [1], [1]], expected: 0.0 },
    ],
    hint: "Model predictions are corrected by the weighted residuals.",
  },
  {
    id: "st-288",
    title: "Propensity Overlap Fraction",
    category: "Statistics",
    difficulty: "Easy",
    description: "Return the fraction of propensity scores that fall inside [lower, upper] inclusive, a positivity check. Return 0.0 for empty input or when lower is greater than upper.",
    starterCode: `def overlap_fraction(propensity, lower, upper):
    # Your code here
    pass`,
    solution: `def overlap_fraction(propensity, lower, upper):
    if not propensity or lower > upper:
        return 0.0
    count = 0
    for e in propensity:
        if lower <= e <= upper:
            count += 1
    return count / len(propensity)`,
    testCases: [
      { input: [[0.1, 0.2, 0.9, 0.5], 0.05, 0.95], expected: 1.0 },
      { input: [[0.01, 0.2, 0.99], 0.05, 0.95], expected: 0.3333333333333333 },
      { input: [[], 0.05, 0.95], expected: 0.0 },
      { input: [[0.5], 0.6, 0.4], expected: 0.0 },
      { input: [[0.0, 1.0], 0.0, 1.0], expected: 1.0 },
    ],
    hint: "Count scores in the interval, then divide by the sample size.",
  },
  {
    id: "st-289",
    title: "Trimming Threshold Effect",
    category: "Statistics",
    difficulty: "Medium",
    description: "Return how much the Horvitz-Thompson IPW ATE changes when propensities are clipped to [lower, upper]: the clipped estimate minus the raw estimate. Return 0.0 for invalid bounds or input, or when clipping forces a treated propensity to 0 or a control propensity to 1.",
    starterCode: `def trimming_threshold_effect(treatment, outcome, propensity, lower, upper):
    # Your code here
    pass`,
    solution: `def trimming_threshold_effect(treatment, outcome, propensity, lower, upper):
    n = len(treatment)
    if n == 0 or len(outcome) != n or len(propensity) != n:
        return 0.0
    if lower < 0 or upper > 1 or lower > upper:
        return 0.0
    def ate(clip):
        t_sum = 0.0
        c_sum = 0.0
        for t, y, e in zip(treatment, outcome, propensity):
            if clip:
                e = min(max(e, lower), upper)
            if t == 1:
                if e <= 0:
                    return None
                t_sum += y / e
            else:
                if e >= 1:
                    return None
                c_sum += y / (1.0 - e)
        return (t_sum - c_sum) / n
    raw = ate(False)
    clipped = ate(True)
    if raw is None or clipped is None:
        return 0.0
    return clipped - raw`,
    testCases: [
      { input: [[1, 1, 0, 0], [10, 12, 4, 6], [0.5, 0.5, 0.5, 0.5], 0.2, 0.8], expected: 0.0 },
      { input: [[1, 1, 0, 0], [10, 12, 4, 6], [0.1, 0.9, 0.1, 0.9], 0.2, 0.8], expected: -4.72222222222222 },
      { input: [[1, 0], [5, 1], [0.5, 0.5], 0.0, 0.0], expected: 0.0 },
      { input: [[], [], [], 0.2, 0.8], expected: 0.0 },
      { input: [[1, 0], [5, 1], [0.5, 0.5], 0.6, 0.4], expected: 0.0 },
    ],
    hint: "Clip the propensity, recompute the IPW estimate, then subtract.",
  },
  {
    id: "st-290",
    title: "Standardized Mean Difference for Covariates",
    category: "Statistics",
    difficulty: "Easy",
    description: "Return the standardized mean difference (mean_x - mean_y) / sqrt((var_x + var_y)/2) using population variances. Return 0.0 when either sample has fewer than two values or the pooled standard deviation is zero.",
    starterCode: `def standardized_mean_difference(x, y):
    # Your code here
    pass`,
    solution: `def standardized_mean_difference(x, y):
    nx = len(x)
    ny = len(y)
    if nx < 2 or ny < 2:
        return 0.0
    mx = sum(x) / nx
    my = sum(y) / ny
    vx = sum((v - mx) ** 2 for v in x) / nx
    vy = sum((v - my) ** 2 for v in y) / ny
    pooled = ((vx + vy) / 2.0) ** 0.5
    if pooled == 0:
        return 0.0
    return (mx - my) / pooled`,
    testCases: [
      { input: [[1, 2, 3], [3, 4, 5]], expected: -2.449489742783178 },
      { input: [[1, 2, 3, 4], [1, 2, 3, 4]], expected: 0.0 },
      { input: [[5, 5], [1, 1]], expected: 0.0 },
      { input: [[2, 4], [1, 3]], expected: 1.0 },
      { input: [[1], [1, 2]], expected: 0.0 },
    ],
    hint: "Scale the mean difference by the pooled standard deviation.",
  },
  {
    id: "st-291",
    title: "Variance of ATE Estimator",
    category: "Statistics",
    difficulty: "Easy",
    description: "Return the variance of the difference-in-means ATE estimator, var_x/n_x + var_y/n_y, using unbiased sample variances. Return 0.0 when either sample has fewer than two values.",
    starterCode: `def ate_variance(x, y):
    # Your code here
    pass`,
    solution: `def ate_variance(x, y):
    nx = len(x)
    ny = len(y)
    if nx < 2 or ny < 2:
        return 0.0
    mx = sum(x) / nx
    my = sum(y) / ny
    vx = sum((v - mx) ** 2 for v in x) / (nx - 1)
    vy = sum((v - my) ** 2 for v in y) / (ny - 1)
    return vx / nx + vy / ny`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], [2, 4, 6, 8, 10]], expected: 2.5 },
      { input: [[1, 2], [3, 4]], expected: 0.5 },
      { input: [[1], [2, 3]], expected: 0.0 },
      { input: [[2, 2], [2, 2]], expected: 0.0 },
      { input: [[1, 2, 3], [10, 20, 30]], expected: 33.66666666666667 },
    ],
    hint: "Add the two squared standard errors.",
  },
  {
    id: "st-292",
    title: "CUPED Adjusted Difference",
    category: "Statistics",
    difficulty: "Medium",
    description: "Return the CUPED-adjusted difference in means: estimate theta = cov(covariate, outcome)/var(covariate), replace each outcome with y - theta*(x - mean_x), then return the treated mean minus the control mean of the adjusted outcomes. Return 0.0 for empty or mismatched input or an empty arm; theta is 0 when the covariate has no variance.",
    starterCode: `def cuped_adjusted_diff(treatment, outcome, covariate):
    # Your code here
    pass`,
    solution: `def cuped_adjusted_diff(treatment, outcome, covariate):
    n = len(treatment)
    if n == 0 or len(outcome) != n or len(covariate) != n:
        return 0.0
    mx = sum(covariate) / n
    my = sum(outcome) / n
    cov = 0.0
    var = 0.0
    for x, y in zip(covariate, outcome):
        cov += (x - mx) * (y - my)
        var += (x - mx) ** 2
    theta = 0.0 if var == 0 else cov / var
    t_sum = 0.0
    t_n = 0
    c_sum = 0.0
    c_n = 0
    for t, y, x in zip(treatment, outcome, covariate):
        a = y - theta * (x - mx)
        if t == 1:
            t_sum += a
            t_n += 1
        else:
            c_sum += a
            c_n += 1
    if t_n == 0 or c_n == 0:
        return 0.0
    return t_sum / t_n - c_sum / c_n`,
    testCases: [
      { input: [[1, 0, 1, 0], [12, 5, 10, 7], [10, 4, 8, 6]], expected: 0.20000000000000284 },
      { input: [[1, 0], [5, 5], [1, 1]], expected: 0.0 },
      { input: [[1, 0], [10, 2], [2, 0]], expected: 0.0 },
      { input: [[1], [3], [7]], expected: 0.0 },
      { input: [[], [], []], expected: 0.0 },
    ],
    hint: "Center the covariate before using it to adjust the outcomes.",
  },
  {
    id: "st-293",
    title: "CUPED Variance Ratio",
    category: "Statistics",
    difficulty: "Easy",
    description: "Return the CUPED variance ratio 1 - correlation^2, the fraction of outcome variance that remains after adjusting for a pre-experiment covariate. The variance reduction only materializes when the covariate really correlates with the outcome. Return 0.0 when the absolute correlation is at least 1.",
    starterCode: `def cuped_variance_ratio(correlation):
    # Your code here
    pass`,
    solution: `def cuped_variance_ratio(correlation):
    if correlation >= 1.0 or correlation <= -1.0:
        return 0.0
    return 1.0 - correlation * correlation`,
    testCases: [
      { input: [0.5], expected: 0.75 },
      { input: [-0.8], expected: 0.3599999999999999 },
      { input: [0.0], expected: 1.0 },
      { input: [1.0], expected: 0.0 },
      { input: [1.5], expected: 0.0 },
    ],
    hint: "Square the correlation to get the variance removed.",
  },
  {
    id: "st-294",
    title: "Cluster Design Effect (Unequal Sizes)",
    category: "Statistics",
    difficulty: "Medium",
    description: "Return the design effect for a cluster-randomized trial with unequal cluster sizes: 1 + ((1 + cv^2)*mean_size - 1)*icc, where cv is the coefficient of variation of the cluster sizes. Return 0.0 for an empty list or negative icc.",
    starterCode: `def cluster_design_effect(cluster_sizes, icc):
    # Your code here
    pass`,
    solution: `def cluster_design_effect(cluster_sizes, icc):
    k = len(cluster_sizes)
    if k == 0 or icc < 0:
        return 0.0
    mean_m = sum(cluster_sizes) / k
    if mean_m <= 0:
        return 0.0
    var_m = sum((m - mean_m) ** 2 for m in cluster_sizes) / k
    cv2 = var_m / (mean_m * mean_m)
    return 1.0 + ((1.0 + cv2) * mean_m - 1.0) * icc`,
    testCases: [
      { input: [[10, 10, 10, 10], 0.05], expected: 1.45 },
      { input: [[5, 15], 0.1], expected: 2.1500000000000004 },
      { input: [[], 0.1], expected: 0.0 },
      { input: [[10], 0.2], expected: 2.8 },
      { input: [[2, 2], 0.0], expected: 1.0 },
    ],
    hint: "Unequal cluster sizes inflate the Kish design effect.",
  },
  {
    id: "st-295",
    title: "Clustered MDE Inflation",
    category: "Statistics",
    difficulty: "Easy",
    description: "Return the clustered minimum detectable effect, mde_individual * sqrt(1 + (cluster_size - 1)*icc). Clustering inflates the MDE by the square root of the design effect. Return 0.0 for non-positive cluster size or negative icc.",
    starterCode: `def clustered_mde(mde_individual, cluster_size, icc):
    # Your code here
    pass`,
    solution: `def clustered_mde(mde_individual, cluster_size, icc):
    if cluster_size <= 0 or icc < 0:
        return 0.0
    return mde_individual * (1.0 + (cluster_size - 1) * icc) ** 0.5`,
    testCases: [
      { input: [0.2, 10, 0.05], expected: 0.24083189157584595 },
      { input: [0.2, 1, 0.5], expected: 0.2 },
      { input: [0.5, 4, 0.1], expected: 0.570087712549569 },
      { input: [0.3, 0, 0.1], expected: 0.0 },
      { input: [0.3, 5, -0.1], expected: 0.0 },
    ],
    hint: "Multiply the individual MDE by the square root of the design effect.",
  },
  {
    id: "st-296",
    title: "Switchback Period Count",
    category: "Statistics",
    difficulty: "Easy",
    description: "Return the number of complete switchback periods that fit in total_time: floor(total_time / (block_length + washout_length)). Return 0 for non-positive total_time or block_length or negative washout_length.",
    starterCode: `def switchback_periods(total_time, block_length, washout_length):
    # Your code here
    pass`,
    solution: `def switchback_periods(total_time, block_length, washout_length):
    if total_time <= 0 or block_length <= 0 or washout_length < 0:
        return 0
    return int(total_time // (block_length + washout_length))`,
    testCases: [
      { input: [100, 10, 5], expected: 6 },
      { input: [30, 10, 5], expected: 2 },
      { input: [14, 10, 5], expected: 0 },
      { input: [100, 0, 5], expected: 0 },
      { input: [25, 10, 5], expected: 1 },
    ],
    hint: "Each period consumes its block plus a washout.",
  },
  {
    id: "st-297",
    title: "Group Sequential Boundary",
    category: "Statistics",
    difficulty: "Hard",
    description: "Return the two-sided nominal z boundaries for a group sequential design with linear alpha spending. At information fraction t_k the cumulative spend is alpha*t_k, and the boundary at look k is the inverse standard normal CDF of 1 - (alpha_k - alpha_(k-1))/2. Return [] for empty or invalid input, non-increasing information fractions, or alpha outside (0, 1).",
    starterCode: `import math
def group_sequential_boundary(information_fractions, alpha):
    # Your code here
    pass`,
    solution: `import math
def group_sequential_boundary(information_fractions, alpha):
    if not information_fractions or alpha <= 0 or alpha >= 1:
        return []
    out = []
    prev = 0.0
    prev_t = 0.0
    for t in information_fractions:
        if t <= 0 or t > 1 or t <= prev_t:
            return []
        inc = alpha * t - prev
        p = 1.0 - inc / 2.0
        lo = -40.0
        hi = 40.0
        for _ in range(200):
            mid = 0.5 * (lo + hi)
            cdf = 0.5 * (1.0 + math.erf(mid / (2 ** 0.5)))
            if cdf < p:
                lo = mid
            else:
                hi = mid
        out.append(0.5 * (lo + hi))
        prev = alpha * t
        prev_t = t
    return out`,
    testCases: [
      { input: [[0.25, 0.5, 0.75, 1.0], 0.05], expected: [2.4977054744123723, 2.4977054744123723, 2.4977054744123723, 2.4977054744123723] },
      { input: [[1.0], 0.05], expected: [1.9599639845400532] },
      { input: [[0.5, 1.0], 0.1], expected: [1.9599639845400532, 1.9599639845400532] },
      { input: [[0.5, 0.4], 0.05], expected: [] },
      { input: [[], 0.05], expected: [] },
    ],
    hint: "Linear spending implies equal increments of alpha at equally spaced looks.",
  },
  {
    id: "st-298",
    title: "Difference-in-Differences Estimate",
    category: "Statistics",
    difficulty: "Easy",
    description: "Return the difference-in-differences estimate (treated_post - treated_pre) - (control_post - control_pre) from the four group-period means.",
    starterCode: `def did_estimate(treated_pre, treated_post, control_pre, control_post):
    # Your code here
    pass`,
    solution: `def did_estimate(treated_pre, treated_post, control_pre, control_post):
    return (treated_post - treated_pre) - (control_post - control_pre)`,
    testCases: [
      { input: [10.0, 14.0, 5.0, 7.0], expected: 2.0 },
      { input: [10.0, 10.0, 5.0, 5.0], expected: 0.0 },
      { input: [10.0, 8.0, 5.0, 8.0], expected: -5.0 },
      { input: [0.0, 1.0, 1.0, 0.0], expected: 2.0 },
      { input: [100.0, 105.0, 90.0, 92.0], expected: 3.0 },
    ],
    hint: "Difference the changes, not the levels.",
  },
  {
    id: "st-299",
    title: "Parallel Trends Gap",
    category: "Statistics",
    difficulty: "Medium",
    description: "Return the absolute difference between the OLS slopes of the treated and control pre-period series, which measures how badly parallel trends is violated. Time is the integer index 0..n-1. Return 0.0 when either series has fewer than two points.",
    starterCode: `def parallel_trends_gap(treated_series, control_series):
    # Your code here
    pass`,
    solution: `def parallel_trends_gap(treated_series, control_series):
    def slope(series):
        n = len(series)
        if n < 2:
            return 0.0
        mx = (n - 1) / 2.0
        my = sum(series) / n
        num = 0.0
        den = 0.0
        for i, y in enumerate(series):
            num += (i - mx) * (y - my)
            den += (i - mx) ** 2
        if den == 0:
            return 0.0
        return num / den
    if len(treated_series) < 2 or len(control_series) < 2:
        return 0.0
    return abs(slope(treated_series) - slope(control_series))`,
    testCases: [
      { input: [[10, 12, 14, 16], [5, 7, 9, 11]], expected: 0.0 },
      { input: [[10, 13, 16], [5, 6, 7]], expected: 2.0 },
      { input: [[1], [1, 2]], expected: 0.0 },
      { input: [[5, 5, 5], [1, 3, 5]], expected: 2.0 },
      { input: [[2, 4, 6, 8], [10, 9, 8, 7]], expected: 3.0 },
    ],
    hint: "Compare the slopes, not the levels.",
  },
  {
    id: "st-300",
    title: "DID Regression Coefficient",
    category: "Statistics",
    difficulty: "Hard",
    description: "Return the coefficient on the treated-by-post interaction from an OLS regression of outcome on an intercept, treated, post, their product, and a covariate. Fit the 5-parameter model with normal equations and Gaussian elimination with partial pivoting. Return 0.0 for empty or mismatched input or a singular design.",
    starterCode: `def did_regression_coefficient(outcome, treated, post, covariate):
    # Your code here
    pass`,
    solution: `def did_regression_coefficient(outcome, treated, post, covariate):
    n = len(outcome)
    if n == 0 or len(treated) != n or len(post) != n or len(covariate) != n:
        return 0.0
    k = 5
    xtx = [[0.0] * k for _ in range(k)]
    xty = [0.0] * k
    for i in range(n):
        xi = [1.0, float(treated[i]), float(post[i]), float(treated[i] * post[i]), float(covariate[i])]
        for a in range(k):
            xty[a] += xi[a] * outcome[i]
            for b in range(k):
                xtx[a][b] += xi[a] * xi[b]
    for col in range(k):
        piv = col
        for r in range(col + 1, k):
            if abs(xtx[r][col]) > abs(xtx[piv][col]):
                piv = r
        if abs(xtx[piv][col]) < 1e-12:
            return 0.0
        xtx[col], xtx[piv] = xtx[piv], xtx[col]
        xty[col], xty[piv] = xty[piv], xty[col]
        for r in range(col + 1, k):
            factor = xtx[r][col] / xtx[col][col]
            if factor == 0:
                continue
            for c in range(col, k):
                xtx[r][c] -= factor * xtx[col][c]
            xty[r] -= factor * xty[col]
    beta = [0.0] * k
    for r in range(k - 1, -1, -1):
        total = xty[r]
        for c in range(r + 1, k):
            total -= xtx[r][c] * beta[c]
        beta[r] = total / xtx[r][r]
    return beta[3]`,
    testCases: [
      { input: [[2.0, 4.0, 3.0, 5.0, 1.0, 3.0, 6.0, 8.0], [0, 0, 0, 0, 1, 1, 1, 1], [0, 0, 1, 1, 0, 0, 1, 1], [1.0, 2.0, 1.0, 2.0, 1.0, 2.0, 1.0, 2.0]], expected: 4.0 },
      { input: [[1.0, 2.0, 4.0, 5.0, 3.0, 3.5, 7.0, 8.5], [0, 0, 0, 0, 1, 1, 1, 1], [0, 0, 1, 1, 0, 0, 1, 1], [0.5, 1.5, 0.5, 1.5, 2.5, 3.5, 2.5, 3.5]], expected: 1.5 },
      { input: [[5.0, 6.0, 5.5, 7.0, 4.0, 5.0, 9.0, 10.0], [0, 0, 0, 0, 1, 1, 1, 1], [0, 0, 1, 1, 0, 0, 1, 1], [1.0, 1.0, 2.0, 2.0, 3.0, 3.0, 4.0, 4.0]], expected: 0.0 },
      { input: [[2.0, 3.0, 4.0, 5.0, 1.0, 3.0, 6.0, 8.0], [0, 0, 0, 0, 1, 1, 1, 1], [0, 0, 1, 1, 0, 0, 1, 1], [1.0, 2.0, 1.0, 2.0, 1.5, 2.5, 1.5, 2.5]], expected: 2.9999999999999996 },
    ],
    hint: "The interaction picks up the extra change in the treated group.",
  },
  {
    id: "st-301",
    title: "Event Study Pre-Trend Slope",
    category: "Statistics",
    difficulty: "Medium",
    description: "Return the OLS slope of the event-study coefficients on event time for the pre-period leads, a placebo check for differential pre-trends. Return 0.0 when there are fewer than two points or event times do not vary.",
    starterCode: `def event_study_slope(periods, coefficients):
    # Your code here
    pass`,
    solution: `def event_study_slope(periods, coefficients):
    n = len(periods)
    if n < 2 or len(coefficients) != n:
        return 0.0
    mp = sum(periods) / n
    mc = sum(coefficients) / n
    num = 0.0
    den = 0.0
    for p, c in zip(periods, coefficients):
        num += (p - mp) * (c - mc)
        den += (p - mp) ** 2
    if den == 0:
        return 0.0
    return num / den`,
    testCases: [
      { input: [[-3, -2, -1], [0.3, 0.2, 0.1]], expected: -0.09999999999999999 },
      { input: [[-4, -3, -2], [1.0, 0.5, 0.0]], expected: -0.5 },
      { input: [[1], [0.5]], expected: 0.0 },
      { input: [[-2, -1], [0.2, 0.4]], expected: 0.2 },
      { input: [[0, 1, 2], [1.0, 1.0, 1.0]], expected: 0.0 },
    ],
    hint: "A flat pre-trend is evidence for parallel trends.",
  },
  {
    id: "st-302",
    title: "RDD Local Linear Estimate",
    category: "Statistics",
    difficulty: "Hard",
    description: "Return the sharp RDD local linear estimate. Fit separate OLS lines on each side of the cutoff using points within bandwidth (left: cutoff-b <= x < cutoff, right: cutoff <= x <= cutoff+b), evaluate both at the cutoff, and return the right intercept minus the left intercept. Return 0.0 when either side has fewer than two points, bandwidth is not positive, or input is mismatched.",
    starterCode: `def rdd_local_estimate(running, outcome, cutoff, bandwidth):
    # Your code here
    pass`,
    solution: `def rdd_local_estimate(running, outcome, cutoff, bandwidth):
    n = len(running)
    if n == 0 or bandwidth <= 0 or len(outcome) != n:
        return 0.0
    def fit(side):
        xs = []
        ys = []
        for x, y in zip(running, outcome):
            if side < 0 and cutoff - bandwidth <= x < cutoff:
                xs.append(x)
                ys.append(y)
            elif side > 0 and cutoff <= x <= cutoff + bandwidth:
                xs.append(x)
                ys.append(y)
        m = len(xs)
        if m < 2:
            return None
        mx = sum(xs) / m
        my = sum(ys) / m
        den = sum((x - mx) ** 2 for x in xs)
        if den == 0:
            return None
        b = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / den
        a = my - b * mx
        return a + b * cutoff
    left = fit(-1)
    right = fit(1)
    if left is None or right is None:
        return 0.0
    return right - left`,
    testCases: [
      { input: [[-2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2], [1, 2, 3, 4, 7, 8, 9, 10], 0, 1.5], expected: 1.0 },
      { input: [[-2, -1, 1, 2], [0, 1, 3, 4], 0, 2], expected: 0.0 },
      { input: [[-1, 0, 1, 2], [1, 2, 3, 4], 0.5, 2], expected: 0.0 },
      { input: [[0, 1, 2], [1, 3, 5], 0, 3], expected: 0.0 },
      { input: [[-3, -2, -1, 1, 2, 3], [1, 2, 3, 7, 8, 9], 0, 3], expected: 2.0 },
    ],
    hint: "Extrapolate both fitted lines to the cutoff.",
  },
  {
    id: "st-303",
    title: "RDD Triangular Kernel Weight",
    category: "Statistics",
    difficulty: "Easy",
    description: "Return the triangular kernel weight max(0, 1 - |x - cutoff|/bandwidth) used by local linear regression discontinuity, evaluated at x. Return 0.0 for non-positive bandwidth or when the point is outside the bandwidth.",
    starterCode: `def rdd_kernel_weight(x, cutoff, bandwidth):
    # Your code here
    pass`,
    solution: `def rdd_kernel_weight(x, cutoff, bandwidth):
    if bandwidth <= 0:
        return 0.0
    u = abs(x - cutoff) / bandwidth
    if u >= 1.0:
        return 0.0
    return 1.0 - u`,
    testCases: [
      { input: [1.5, 1.0, 2.0], expected: 0.75 },
      { input: [3.0, 1.0, 2.0], expected: 0.0 },
      { input: [1.0, 1.0, 2.0], expected: 1.0 },
      { input: [1.0, 1.0, 0.0], expected: 0.0 },
      { input: [0.0, 1.0, 2.0], expected: 0.5 },
    ],
    hint: "Weight decays linearly to zero at the bandwidth edge.",
  },
  {
    id: "st-304",
    title: "IV 2SLS Estimate",
    category: "Statistics",
    difficulty: "Medium",
    description: "Return the just-identified instrumental variables (2SLS) estimate cov(z, y)/cov(z, x) using sample covariances with means. Return 0.0 when input is empty or mismatched, or when cov(z, x) is zero.",
    starterCode: `def iv_2sls_estimate(instrument, treatment, outcome):
    # Your code here
    pass`,
    solution: `def iv_2sls_estimate(instrument, treatment, outcome):
    n = len(instrument)
    if n < 2 or len(treatment) != n or len(outcome) != n:
        return 0.0
    mz = sum(instrument) / n
    mx = sum(treatment) / n
    my = sum(outcome) / n
    cov_zy = 0.0
    cov_zx = 0.0
    for z, x, y in zip(instrument, treatment, outcome):
        cov_zy += (z - mz) * (y - my)
        cov_zx += (z - mz) * (x - mx)
    if cov_zx == 0:
        return 0.0
    return cov_zy / cov_zx`,
    testCases: [
      { input: [[1, 2, 3, 4], [2, 4, 6, 8], [1, 3, 5, 7]], expected: 1.0 },
      { input: [[1, 0, 1, 0], [2, 1, 3, 0], [5, 2, 7, 1]], expected: 2.25 },
      { input: [[1, 1, 1], [1, 2, 3], [1, 2, 3]], expected: 0.0 },
      { input: [[], [], []], expected: 0.0 },
      { input: [[1, 2], [0, 0], [1, 2]], expected: 0.0 },
    ],
    hint: "The Wald ratio is the reduced form over the first stage.",
  },
  {
    id: "st-305",
    title: "Weak Instrument F-Statistic",
    category: "Statistics",
    difficulty: "Medium",
    description: "Return the first-stage F statistic for a single instrument: R^2/((1 - R^2)/(n - 2)) from regressing treatment on instrument with an intercept. Return 0.0 when n < 3, the treatment has no variance, or the fit is perfect.",
    starterCode: `def weak_instrument_f(instrument, treatment):
    # Your code here
    pass`,
    solution: `def weak_instrument_f(instrument, treatment):
    n = len(instrument)
    if n < 3 or len(treatment) != n:
        return 0.0
    mz = sum(instrument) / n
    mx = sum(treatment) / n
    sxx = sum((z - mz) ** 2 for z in instrument)
    if sxx == 0:
        return 0.0
    b = sum((z - mz) * (x - mx) for z, x in zip(instrument, treatment)) / sxx
    a = mx - b * mz
    sse = sum((x - (a + b * z)) ** 2 for z, x in zip(instrument, treatment))
    sst = sum((x - mx) ** 2 for x in treatment)
    if sst == 0:
        return 0.0
    r2 = 1.0 - sse / sst
    if r2 >= 1.0 or r2 < 0:
        return 0.0
    return r2 / ((1.0 - r2) / (n - 2))`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], [2, 4, 5, 4, 5]], expected: 4.500000000000002 },
      { input: [[1, 2, 3, 4], [1, 2, 3, 4]], expected: 0.0 },
      { input: [[1, 1, 2, 2], [1, 3, 2, 4]], expected: 0.4999999999999999 },
      { input: [[1, 2], [1, 2]], expected: 0.0 },
      { input: [[1, 2, 3], [5, 5, 5]], expected: 0.0 },
    ],
    hint: "A rule of thumb is that F above 10 signals a strong instrument.",
  },
  {
    id: "st-306",
    title: "Exclusion Restriction Gap",
    category: "Statistics",
    difficulty: "Medium",
    description: "Return the absolute difference in mean outcome between the two instrument levels among untreated units, a placebo check for the exclusion restriction. Return 0.0 for empty or mismatched input, or when either instrument level has no untreated units.",
    starterCode: `def exclusion_restriction_gap(instrument, treatment, outcome):
    # Your code here
    pass`,
    solution: `def exclusion_restriction_gap(instrument, treatment, outcome):
    n = len(instrument)
    if n == 0 or len(treatment) != n or len(outcome) != n:
        return 0.0
    one = []
    zero = []
    for z, t, y in zip(instrument, treatment, outcome):
        if t == 0:
            if z == 1:
                one.append(y)
            elif z == 0:
                zero.append(y)
    if not one or not zero:
        return 0.0
    return abs(sum(one) / len(one) - sum(zero) / len(zero))`,
    testCases: [
      { input: [[1, 1, 0, 0, 1, 0], [0, 0, 1, 0, 0, 0], [5, 7, 20, 3, 6, 4]], expected: 2.5 },
      { input: [[1, 0], [0, 0], [2, 4]], expected: 2.0 },
      { input: [[1, 1], [0, 0], [2, 4]], expected: 0.0 },
      { input: [[1, 0, 1], [1, 0, 1], [1, 2, 3]], expected: 0.0 },
      { input: [[0, 1, 1, 0], [0, 1, 0, 0], [1, 2, 3, 4]], expected: 0.5 },
    ],
    hint: "The instrument should not move outcomes for untreated units.",
  },
  {
    id: "st-307",
    title: "Synthetic Control Loss",
    category: "Statistics",
    difficulty: "Medium",
    description: "Return the synthetic control pre-period loss: sum over periods of (target_t - sum_i weights_i*donors_i_t)^2. Return 0.0 for empty input, a length mismatch between donors and weights, or donor series of the wrong length.",
    starterCode: `def synthetic_control_loss(target, donors, weights):
    # Your code here
    pass`,
    solution: `def synthetic_control_loss(target, donors, weights):
    n = len(target)
    if n == 0 or len(donors) != len(weights):
        return 0.0
    total = 0.0
    for t in range(n):
        synth = 0.0
        for d, w in zip(donors, weights):
            if len(d) != n:
                return 0.0
            synth += w * d[t]
        total += (target[t] - synth) ** 2
    return total`,
    testCases: [
      { input: [[1, 2, 3], [[1, 2, 3], [0, 0, 0]], [0.5, 0.5]], expected: 3.5 },
      { input: [[1, 2], [[1, 2]], [1.0]], expected: 0.0 },
      { input: [[1, 2], [[3, 4]], [1.0]], expected: 8.0 },
      { input: [[], [], []], expected: 0.0 },
      { input: [[1, 2], [[1, 2], [3, 4]], [0.5]], expected: 0.0 },
    ],
    hint: "The weights should make the donor average track the target.",
  },
  {
    id: "st-308",
    title: "Donor Pool Size",
    category: "Statistics",
    difficulty: "Easy",
    description: "Return the number of eligible donor units, max(0, total_units - treated_units - excluded_units). Return 0 when total_units is not positive.",
    starterCode: `def donor_pool_size(total_units, treated_units, excluded_units):
    # Your code here
    pass`,
    solution: `def donor_pool_size(total_units, treated_units, excluded_units):
    if total_units <= 0:
        return 0
    remaining = total_units - treated_units - excluded_units
    if remaining < 0:
        return 0
    return remaining`,
    testCases: [
      { input: [100, 20, 5], expected: 75 },
      { input: [10, 4, 6], expected: 0 },
      { input: [10, 0, 0], expected: 10 },
      { input: [0, 1, 1], expected: 0 },
      { input: [50, 25, 10], expected: 15 },
    ],
    hint: "Remove treated and ineligible units from the pool.",
  },
  {
    id: "st-309",
    title: "Placebo Test p-Value (Exact)",
    category: "Statistics",
    difficulty: "Hard",
    description: "Return the exact two-sided placebo test p-value for a pre-period difference in means. Enumerate all C(n, n1) assignments of the n1 treated labels and report the fraction whose absolute mean difference is at least as large as the observed one. Return 1.0 when input is empty, lengths differ, or all units share one treatment value.",
    starterCode: `import itertools
def placebo_p_value(pre_outcomes, treatment):
    # Your code here
    pass`,
    solution: `import itertools
def placebo_p_value(pre_outcomes, treatment):
    outcomes = list(pre_outcomes)
    n = len(outcomes)
    if n == 0 or len(treatment) != n:
        return 1.0
    n1 = 0
    for t in treatment:
        if t == 1:
            n1 += 1
    if n1 == 0 or n1 == n:
        return 1.0
    total = sum(outcomes)
    treated_sum = 0.0
    for o, t in zip(outcomes, treatment):
        if t == 1:
            treated_sum += o
    n0 = n - n1
    obs = abs(treated_sum / n1 - (total - treated_sum) / n0)
    count = 0
    combos = 0
    for idx in itertools.combinations(range(n), n1):
        s = 0.0
        for i in idx:
            s += outcomes[i]
        diff = abs(s / n1 - (total - s) / n0)
        if diff >= obs - 1e-12:
            count += 1
        combos += 1
    return count / combos`,
    testCases: [
      { input: [[1, 2, 3, 4, 5, 6], [1, 1, 1, 0, 0, 0]], expected: 0.1 },
      { input: [[1, 2, 3, 4, 5, 6, 7, 8], [1, 1, 0, 0, 0, 0, 0, 0]], expected: 0.07142857142857142 },
      { input: [[1, 1, 1, 1], [1, 1, 0, 0]], expected: 1.0 },
      { input: [[1, 2], [1, 1]], expected: 1.0 },
      { input: [[], []], expected: 1.0 },
    ],
    hint: "A significant placebo p-value means the pre-period groups already differed.",
  },
  {
    id: "st-310",
    title: "Mediation Direct Effect",
    category: "Statistics",
    difficulty: "Easy",
    description: "Return the direct effect c - a*b, where a is the treatment-to-mediator path, b is the mediator-to-outcome path, and c is the total effect.",
    starterCode: `def direct_effect(a, b, c):
    # Your code here
    pass`,
    solution: `def direct_effect(a, b, c):
    return c - a * b`,
    testCases: [
      { input: [0.5, 0.4, 2.0], expected: 1.8 },
      { input: [0.0, 0.4, 2.0], expected: 2.0 },
      { input: [0.5, 0.0, 1.0], expected: 1.0 },
      { input: [-0.3, 0.5, 1.0], expected: 1.15 },
      { input: [1.0, 1.0, 1.0], expected: 0.0 },
    ],
    hint: "Strip the indirect path out of the total effect.",
  },
  {
    id: "st-311",
    title: "Mediation Indirect Effect",
    category: "Statistics",
    difficulty: "Easy",
    description: "Return the indirect (mediated) effect a*b, the product of the treatment-to-mediator and mediator-to-outcome path coefficients.",
    starterCode: `def indirect_effect(a, b):
    # Your code here
    pass`,
    solution: `def indirect_effect(a, b):
    return a * b`,
    testCases: [
      { input: [0.5, 0.4], expected: 0.2 },
      { input: [0.0, 0.4], expected: 0.0 },
      { input: [-0.5, 0.4], expected: -0.2 },
      { input: [2.0, 3.0], expected: 6.0 },
    ],
    hint: "The indirect effect is the product of the two path coefficients.",
  },
  {
    id: "st-312",
    title: "Proportion Mediated",
    category: "Statistics",
    difficulty: "Easy",
    description: "Return the proportion mediated a*b/c, the share of the total effect that flows through the mediator. Return 0.0 when the total effect c is zero.",
    starterCode: `def proportion_mediated(a, b, c):
    # Your code here
    pass`,
    solution: `def proportion_mediated(a, b, c):
    if c == 0:
        return 0.0
    return a * b / c`,
    testCases: [
      { input: [0.5, 0.4, 2.0], expected: 0.1 },
      { input: [1.0, 1.0, 0.0], expected: 0.0 },
      { input: [-0.5, 0.4, 1.0], expected: -0.2 },
      { input: [0.5, 0.5, 0.5], expected: 0.5 },
    ],
    hint: "Divide the indirect effect by the total effect.",
  },
  {
    id: "st-313",
    title: "T-Learner Effect",
    category: "Statistics",
    difficulty: "Medium",
    description: "Return the T-learner CATE at x: (m1_intercept + m1_slope*x) - (m0_intercept + m0_slope*x), where each arm has its own linear model. Return 0.0 when either coefficient list does not have exactly two entries (intercept, slope).",
    starterCode: `def t_learner_effect(x, treated_coefficients, control_coefficients):
    # Your code here
    pass`,
    solution: `def t_learner_effect(x, treated_coefficients, control_coefficients):
    if len(treated_coefficients) != 2 or len(control_coefficients) != 2:
        return 0.0
    y1 = treated_coefficients[0] + treated_coefficients[1] * x
    y0 = control_coefficients[0] + control_coefficients[1] * x
    return y1 - y0`,
    testCases: [
      { input: [2.0, [1.0, 3.0], [0.5, 1.0]], expected: 4.5 },
      { input: [0.0, [2.0, 1.0], [1.0, 1.0]], expected: 1.0 },
      { input: [-1.0, [1.0, 2.0], [3.0, 1.0]], expected: -3.0 },
      { input: [1.0, [1.0], [1.0, 0.0]], expected: 0.0 },
    ],
    hint: "Each arm extrapolates its own regression to x.",
  },
  {
    id: "st-314",
    title: "S-Learner Effect",
    category: "Statistics",
    difficulty: "Easy",
    description: "Return the S-learner CATE at x for a linear model with treatment and treatment-by-x interaction: treatment_coefficient + interaction_coefficient*x.",
    starterCode: `def s_learner_effect(x, treatment_coefficient, interaction_coefficient):
    # Your code here
    pass`,
    solution: `def s_learner_effect(x, treatment_coefficient, interaction_coefficient):
    return treatment_coefficient + interaction_coefficient * x`,
    testCases: [
      { input: [2.0, 3.0, 0.5], expected: 4.0 },
      { input: [0.0, 5.0, 2.0], expected: 5.0 },
      { input: [-2.0, 1.0, -0.5], expected: 2.0 },
      { input: [10.0, 0.0, 0.0], expected: 0.0 },
    ],
    hint: "The treatment effect varies with x only through the interaction.",
  },
  {
    id: "st-315",
    title: "X-Learner Effect",
    category: "Statistics",
    difficulty: "Easy",
    description: "Return the X-learner CATE at x as a propensity-weighted blend of the two arm-specific effect estimates: g*tau1 + (1-g)*tau0, where g is the propensity score at x.",
    starterCode: `def x_learner_effect(tau1, tau0, propensity):
    # Your code here
    pass`,
    solution: `def x_learner_effect(tau1, tau0, propensity):
    return propensity * tau1 + (1.0 - propensity) * tau0`,
    testCases: [
      { input: [4.0, 2.0, 0.25], expected: 2.5 },
      { input: [3.0, 5.0, 0.5], expected: 4.0 },
      { input: [1.0, 1.0, 0.9], expected: 1.0 },
      { input: [5.0, 2.0, 0.0], expected: 2.0 },
      { input: [5.0, 2.0, 1.0], expected: 5.0 },
    ],
    hint: "Weight the estimates by how likely each arm is at x.",
  },
  {
    id: "st-316",
    title: "DML Residual Estimate",
    category: "Statistics",
    difficulty: "Hard",
    description: "Return the partially linear double machine learning estimate sum(v_i*(y_i - l_i))/sum(v_i^2), where v_i = d_i - m_i are treatment residuals and l_i are outcome-model predictions. Return 0.0 for empty or mismatched input or when all treatment residuals are zero.",
    starterCode: `def dml_residual_estimate(outcome, treatment, outcome_model, treatment_model):
    # Your code here
    pass`,
    solution: `def dml_residual_estimate(outcome, treatment, outcome_model, treatment_model):
    n = len(outcome)
    if n == 0 or len(treatment) != n or len(outcome_model) != n or len(treatment_model) != n:
        return 0.0
    num = 0.0
    den = 0.0
    for y, d, l, m in zip(outcome, treatment, outcome_model, treatment_model):
        v = d - m
        num += v * (y - l)
        den += v * v
    if den == 0:
        return 0.0
    return num / den`,
    testCases: [
      { input: [[3.1, 1.0, 3.0, 0.9], [1, 0, 1, 0], [1.0, 1.0, 1.0, 1.0], [0.5, 0.5, 0.5, 0.5]], expected: 2.0999999999999996 },
      { input: [[5.0, 1.0, 5.0, 1.0], [1, 0, 1, 0], [3.0, 1.0, 3.0, 1.0], [0.5, 0.5, 0.5, 0.5]], expected: 2.0 },
      { input: [[1.0, 2.0], [1, 0], [1.0, 2.0], [1.0, 0.0]], expected: 0.0 },
      { input: [[], [], [], []], expected: 0.0 },
      { input: [[1.0, 2.0], [1, 0], [1.0], [1.0, 0.0]], expected: 0.0 },
    ],
    hint: "Residualize both the treatment and the outcome before regressing.",
  },
  {
    id: "st-317",
    title: "Causal Forest Honesty Split",
    category: "Statistics",
    difficulty: "Easy",
    description: "Return [split_count, estimate_count] for an honest causal forest split: split_count = floor(n*split_fraction) observations choose the splits and the rest estimate the leaf effects. Return [0, 0] when n is not positive or split_fraction is outside [0, 1].",
    starterCode: `def honesty_split_counts(n, split_fraction):
    # Your code here
    pass`,
    solution: `def honesty_split_counts(n, split_fraction):
    if n <= 0 or split_fraction < 0 or split_fraction > 1:
        return [0, 0]
    split = int(n * split_fraction)
    return [split, n - split]`,
    testCases: [
      { input: [100, 0.5], expected: [50, 50] },
      { input: [101, 0.5], expected: [50, 51] },
      { input: [10, 0.0], expected: [0, 10] },
      { input: [10, 1.0], expected: [10, 0] },
      { input: [0, 0.5], expected: [0, 0] },
    ],
    hint: "Honest trees never use the same observations for splitting and estimation.",
  },
  {
    id: "st-318",
    title: "Quantile Treatment Effect",
    category: "Statistics",
    difficulty: "Medium",
    description: "Return the quantile treatment effect Q_treated(q) - Q_control(q) using linearly interpolated percentiles at position q*(n-1). Return 0.0 for empty input or q outside [0, 1].",
    starterCode: `def quantile_treatment_effect(treated_outcomes, control_outcomes, q):
    # Your code here
    pass`,
    solution: `def quantile_treatment_effect(treated_outcomes, control_outcomes, q):
    if not treated_outcomes or not control_outcomes:
        return 0.0
    if q < 0 or q > 1:
        return 0.0
    def quantile(values, p):
        s = sorted(values)
        n = len(s)
        if n == 1:
            return float(s[0])
        pos = p * (n - 1)
        lo = int(pos)
        if lo >= n - 1:
            return float(s[-1])
        frac = pos - lo
        return s[lo] + frac * (s[lo + 1] - s[lo])
    return quantile(treated_outcomes, q) - quantile(control_outcomes, q)`,
    testCases: [
      { input: [[10, 12, 14, 16], [2, 4, 6, 8], 0.5], expected: 8.0 },
      { input: [[10, 12, 14, 16], [2, 4, 6, 8], 0.25], expected: 8.0 },
      { input: [[10, 12, 14, 16], [2, 4, 6, 8], 0.0], expected: 8.0 },
      { input: [[5], [1, 3, 5], 0.5], expected: 2.0 },
      { input: [[1, 2], [3, 4], 1.5], expected: 0.0 },
    ],
    hint: "Compare the two distributions quantile by quantile.",
  },
  {
    id: "st-319",
    title: "Counterfactual Prediction",
    category: "Statistics",
    difficulty: "Easy",
    description: "Return the predicted counterfactual outcome for a unit with treatment effect tau0 + tau1*x: subtract the effect from the observed outcome for treated units and add it for control units.",
    starterCode: `def counterfactual_prediction(observed, treatment, x, tau0, tau1):
    # Your code here
    pass`,
    solution: `def counterfactual_prediction(observed, treatment, x, tau0, tau1):
    effect = tau0 + tau1 * x
    if treatment == 1:
        return observed - effect
    return observed + effect`,
    testCases: [
      { input: [15.0, 1, 2.0, 1.0, 0.5], expected: 13.0 },
      { input: [4.0, 0, 2.0, 1.0, 0.5], expected: 6.0 },
      { input: [10.0, 1, 0.0, 3.0, -1.0], expected: 7.0 },
      { input: [5.0, 0, -2.0, 1.0, 1.0], expected: 4.0 },
    ],
    hint: "Flip each unit to the arm it was not observed in.",
  },
  {
    id: "st-320",
    title: "E-Value for Unmeasured Confounding",
    category: "Statistics",
    difficulty: "Medium",
    description: "Return the E-value for unmeasured confounding, RR + sqrt(RR*(RR - 1)) with RR = max(risk_ratio, 1/risk_ratio). The E-value is the minimum strength of association an unmeasured confounder would need to explain the effect away. Return 0.0 when risk_ratio is not positive.",
    starterCode: `def e_value(risk_ratio):
    # Your code here
    pass`,
    solution: `def e_value(risk_ratio):
    if risk_ratio <= 0:
        return 0.0
    rr = risk_ratio
    if rr < 1.0:
        rr = 1.0 / rr
    return rr + (rr * (rr - 1.0)) ** 0.5`,
    testCases: [
      { input: [2.0], expected: 3.414213562373095 },
      { input: [1.0], expected: 1.0 },
      { input: [0.5], expected: 3.414213562373095 },
      { input: [3.0], expected: 5.449489742783178 },
      { input: [0.0], expected: 0.0 },
    ],
    hint: "Fold protective effects to their reciprocal before applying the formula.",
  },
];
