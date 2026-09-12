import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "ts-271",
    title: "Kalman Gain with Observation Matrix",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the Kalman gain for a scalar state observed through z = h * x + v, with prior variance p_prior and observation noise variance r. The gain is K = p_prior * h / (h^2 * p_prior + r).\n\nReturn 0.0 when the denominator is zero.",
    starterCode: `def kalman_gain_observation_matrix(p_prior, h, r):
    # Your code here
    pass`,
    solution: `def kalman_gain_observation_matrix(p_prior, h, r):
    den = h * p_prior * h + r
    if den == 0:
        return 0.0
    return p_prior * h / den`,
    testCases: [
      { input: [1.0, 2.0, 1.0], expected: 0.4 },
      { input: [4.0, 0.5, 1.0], expected: 1.0 },
      { input: [0.0, 1.0, 1.0], expected: 0.0 },
      { input: [2.0, 0.0, 0.5], expected: 0.0 },
    ],
    hint: "The observation matrix scales both the prior variance and the numerator.",
  },
  {
    id: "ts-272",
    title: "Kalman State Update with Control",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Perform one Kalman state update with an observation matrix h and a control term. Given prior mean, prior variance, observation, measurement variance r, control coefficient b, and control input u, return the updated mean prior + K * (obs - h * prior) + b * u, where K = p_prior * h / (h^2 * p_prior + r).\n\nReturn the scalar updated state.",
    starterCode: `def kalman_state_update_control(prior, p_prior, obs, h, r, b, u):
    # Your code here
    pass`,
    solution: `def kalman_state_update_control(prior, p_prior, obs, h, r, b, u):
    den = h * h * p_prior + r
    k = p_prior * h / den if den != 0 else 0.0
    return prior + k * (obs - h * prior) + b * u`,
    testCases: [
      { input: [0.0, 1.0, 2.0, 1.0, 1.0, 0.5, 3.0], expected: 2.5 },
      { input: [5.0, 2.0, 7.0, 1.0, 0.5, 0.0, 0.0], expected: 6.6 },
      { input: [3.0, 1.0, 3.0, 2.0, 2.0, 1.5, 2.0], expected: 5.0 },
      { input: [1.0, 0.5, 4.0, 1.0, 0.0, 0.2, 1.0], expected: 4.2 },
    ],
    hint: "Apply the measurement correction first, then add the control contribution b * u.",
  },
  {
    id: "ts-273",
    title: "Kalman Covariance Update",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Update the state covariance after a Kalman measurement update: p_new = (1 - k * h) * p_prior, where k is the Kalman gain, h the observation matrix, and p_prior the predicted variance.\n\nThis is the scalar form of the matrix update (I - K H) P.",
    starterCode: `def kalman_covariance_update(p_prior, h, k):
    # Your code here
    pass`,
    solution: `def kalman_covariance_update(p_prior, h, k):
    return (1.0 - k * h) * p_prior`,
    testCases: [
      { input: [1.0, 1.0, 0.5], expected: 0.5 },
      { input: [2.0, 1.0, 0.25], expected: 1.5 },
      { input: [3.0, 0.5, 0.4], expected: 2.4000000000000004 },
      { input: [1.0, 1.0, 1.0], expected: 0.0 },
    ],
    hint: "A gain times observation matrix of 1 removes all prior variance.",
  },
  {
    id: "ts-274",
    title: "Kalman Innovation Value",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the innovation, or measurement residual, in a Kalman filter: v = obs - h * prior, where prior is the predicted state and h is the observation matrix.\n\nThe innovation is the new information an observation carries and drives the correction applied to the state estimate.",
    starterCode: `def kalman_innovation(obs, h, prior):
    # Your code here
    pass`,
    solution: `def kalman_innovation(obs, h, prior):
    return obs - h * prior`,
    testCases: [
      { input: [10.0, 1.0, 8.0], expected: 2.0 },
      { input: [5.0, 2.0, 3.0], expected: -1.0 },
      { input: [0.0, 1.0, 0.0], expected: 0.0 },
      { input: [7.0, 0.5, 10.0], expected: 2.0 },
    ],
    hint: "Compare the observation with the value the model predicted for it.",
  },
  {
    id: "ts-275",
    title: "Kalman Smoother Variance",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Perform the variance recursion of the Rauch-Tung-Striebel smoother. Given the filtered variance p_filtered, the predicted variance p_predicted, and the smoothed variance at the next time step p_smoothed_next, return p_filtered + J^2 * (p_smoothed_next - p_predicted) where J = p_filtered / p_predicted.\n\nIf p_predicted is zero, return p_filtered unchanged.",
    starterCode: `def kalman_smoother_variance(p_filtered, p_predicted, p_smoothed_next):
    # Your code here
    pass`,
    solution: `def kalman_smoother_variance(p_filtered, p_predicted, p_smoothed_next):
    if p_predicted == 0:
        return p_filtered
    j = p_filtered / p_predicted
    return p_filtered + j * j * (p_smoothed_next - p_predicted)`,
    testCases: [
      { input: [1.0, 2.0, 1.5], expected: 0.875 },
      { input: [0.5, 1.0, 0.4], expected: 0.35 },
      { input: [2.0, 2.0, 2.0], expected: 2.0 },
      { input: [1.0, 0.0, 3.0], expected: 1.0 },
      { input: [0.5, 2.0, 0.5], expected: 0.40625 },
    ],
    hint: "The weight J shrinks the future variance correction onto the filtered state.",
  },
  {
    id: "ts-276",
    title: "Particle Filter Weight Normalization",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Normalize a list of particle weights so they sum to one by dividing each weight by the total. If the total weight is not positive, including an all-zero list, return a uniform distribution over the particles instead.\n\nReturn an empty list for empty input.",
    starterCode: `def particle_weight_normalization(weights):
    # Your code here
    pass`,
    solution: `def particle_weight_normalization(weights):
    if not weights:
        return []
    total = sum(weights)
    if total <= 0:
        n = len(weights)
        return [1.0 / n] * n
    return [w / total for w in weights]`,
    testCases: [
      { input: [[1, 1, 2]], expected: [0.25, 0.25, 0.5] },
      { input: [[2, 3]], expected: [0.4, 0.6] },
      { input: [[0, 0]], expected: [0.5, 0.5] },
      { input: [[]], expected: [] },
      { input: [[1, 2, 0]], expected: [0.3333333333333333, 0.6666666666666666, 0.0] },
    ],
    hint: "Degenerate weights fall back to a uniform distribution so the filter never stalls.",
  },
  {
    id: "ts-277",
    title: "Particle Effective Sample Size",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the effective sample size of a normalized weight vector: ESS = 1 / sum(w_i^2).\n\nReturn 0.0 when the list is empty or all weights are zero. Uniform weights over n particles give exactly n.",
    starterCode: `def particle_effective_sample_size(weights):
    # Your code here
    pass`,
    solution: `def particle_effective_sample_size(weights):
    s = sum(w * w for w in weights)
    if s == 0:
        return 0.0
    return 1.0 / s`,
    testCases: [
      { input: [[0.5, 0.5]], expected: 2.0 },
      { input: [[1.0]], expected: 1.0 },
      { input: [[0.25, 0.25, 0.25, 0.25]], expected: 4.0 },
      { input: [[]], expected: 0.0 },
      { input: [[0.1, 0.2, 0.7]], expected: 1.851851851851852 },
    ],
    hint: "Concentrated weights drive the sum of squares up and the effective size down.",
  },
  {
    id: "ts-278",
    title: "HMM Forward Value",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Perform one scaled forward step of a hidden Markov model. Given the previous forward vector alpha_prev, the row-stochastic transition matrix, and the emission probabilities for the new observation, compute alpha_new[j] = emission[j] * sum over i of alpha_prev[i] * A[i][j], then rescale the vector to sum to one.\n\nReturn a zero vector when the total is zero.",
    starterCode: `def hmm_forward_value(alpha_prev, transition, emission):
    # Your code here
    pass`,
    solution: `def hmm_forward_value(alpha_prev, transition, emission):
    d = len(alpha_prev)
    out = []
    for j in range(d):
        s = sum(alpha_prev[i] * transition[i][j] for i in range(d))
        out.append(s * emission[j])
    total = sum(out)
    if total == 0:
        return [0.0] * d
    return [v / total for v in out]`,
    testCases: [
      {
        input: [[0.5, 0.5], [[0.9, 0.1], [0.2, 0.8]], [0.6, 0.4]],
        expected: [0.6470588235294118, 0.35294117647058826],
      },
      {
        input: [[0.3, 0.7], [[0.8, 0.2], [0.1, 0.9]], [0.5, 0.5]],
        expected: [0.31, 0.69],
      },
      {
        input: [[0.5, 0.5], [[0.9, 0.1], [0.2, 0.8]], [0.0, 0.0]],
        expected: [0.0, 0.0],
      },
      {
        input: [[1.0, 0.0], [[1.0, 0.0], [0.0, 1.0]], [0.3, 0.7]],
        expected: [1.0, 0.0],
      },
    ],
    hint: "Propagate through the transition columns first, then weight by the emission.",
  },
  {
    id: "ts-279",
    title: "Baum-Welch Gamma Step",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the Baum-Welch E-step state posteriors gamma for one time step: gamma[i] = alpha[i] * beta[i] / sum over j of alpha[j] * beta[j], where alpha and beta are the forward and backward probabilities.\n\nReturn a zero vector when the total is zero.",
    starterCode: `def baum_welch_gamma(alpha, beta):
    # Your code here
    pass`,
    solution: `def baum_welch_gamma(alpha, beta):
    vals = [a * b for a, b in zip(alpha, beta)]
    total = sum(vals)
    if total == 0:
        return [0.0] * len(vals)
    return [v / total for v in vals]`,
    testCases: [
      { input: [[0.5, 0.5], [0.4, 0.6]], expected: [0.4, 0.6] },
      {
        input: [[1.0, 2.0, 3.0], [1.0, 1.0, 1.0]],
        expected: [0.16666666666666666, 0.3333333333333333, 0.5],
      },
      { input: [[0.0, 0.0], [1.0, 1.0]], expected: [0.0, 0.0] },
      { input: [[2.0, 1.0], [3.0, 3.0]], expected: [0.6666666666666666, 0.3333333333333333] },
    ],
    hint: "Gamma is the normalized product of the forward and backward messages.",
  },
  {
    id: "ts-280",
    title: "GARCH Multi-Step Variance Forecast",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Forecast GARCH(1,1) conditional variances h steps ahead. Starting from sigma2, the first forecast is omega + alpha * e2 + beta * sigma2; each later forecast replaces the squared shock with its expectation, giving s_next = omega + (alpha + beta) * s.\n\nReturn the list of h forecasts, or an empty list when h is not positive.",
    starterCode: `def garch_multistep_variance(omega, alpha, beta, e2, sigma2, h):
    # Your code here
    pass`,
    solution: `def garch_multistep_variance(omega, alpha, beta, e2, sigma2, h):
    if h <= 0:
        return []
    out = []
    s = sigma2
    for step in range(h):
        if step == 0:
            s = omega + alpha * e2 + beta * s
        else:
            s = omega + (alpha + beta) * s
        out.append(s)
    return out`,
    testCases: [
      {
        input: [0.1, 0.2, 0.7, 1.0, 0.8, 3],
        expected: [0.86, 0.8739999999999999, 0.8865999999999998],
      },
      { input: [0.05, 0.1, 0.8, 0.5, 0.3, 2], expected: [0.33999999999999997, 0.356] },
      { input: [0.1, 0.3, 0.6, 2.0, 1.0, 1], expected: [1.2999999999999998] },
      { input: [0.1, 0.2, 0.7, 1.0, 0.8, 0], expected: [] },
    ],
    hint: "Beyond the first step the shock has mean zero, so only persistence alpha + beta matters.",
  },
  {
    id: "ts-281",
    title: "ARCH(q) Variance",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the conditional variance of an ARCH(q) model: sigma2 = omega + sum over i of alpha_i * e2_lag_i, pairing alphas and lagged squared shocks in order.\n\nExtra coefficients or shocks beyond the shorter list are ignored.",
    starterCode: `def arch_q_variance(omega, alphas, lagged_sq):
    # Your code here
    pass`,
    solution: `def arch_q_variance(omega, alphas, lagged_sq):
    total = omega
    for a, e2 in zip(alphas, lagged_sq):
        total += a * e2
    return total`,
    testCases: [
      { input: [0.05, [0.3, 0.2], [1.0, 0.5]], expected: 0.44999999999999996 },
      { input: [0.1, [], []], expected: 0.1 },
      { input: [0.02, [0.5], [0.04]], expected: 0.04 },
      { input: [0.0, [0.1, 0.1, 0.1], [1.0, 2.0, 3.0]], expected: 0.6000000000000001 },
    ],
    hint: "With no lag terms the conditional variance collapses to the long-run constant omega.",
  },
  {
    id: "ts-282",
    title: "EWMA Volatility Update",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Update an exponentially weighted moving average volatility estimate: sigma = sqrt(lam * prev_variance + (1 - lam) * ret^2).\n\nReturn 0.0 when the weighted variance is negative.",
    starterCode: `def ewma_volatility_update(prev_variance, ret, lam):
    # Your code here
    pass`,
    solution: `def ewma_volatility_update(prev_variance, ret, lam):
    val = lam * prev_variance + (1.0 - lam) * ret * ret
    if val < 0:
        return 0.0
    return val ** 0.5`,
    testCases: [
      { input: [0.04, 0.03, 0.94], expected: 0.19404638620700979 },
      { input: [0.01, 0.1, 0.5], expected: 0.1 },
      { input: [0.0, 0.0, 0.9], expected: 0.0 },
      { input: [0.09, 0.05, 0.0], expected: 0.05 },
    ],
    hint: "The decay lam weights yesterday's variance, so lam near 1 produces a smooth series.",
  },
  {
    id: "ts-283",
    title: "Annualized Realized Volatility",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute realized volatility from a return list and annualize it: sqrt(sum of squared returns) * sqrt(periods_per_year).\n\nReturn 0.0 when periods_per_year is not positive or the return list is empty.",
    starterCode: `def annualized_realized_volatility(returns, periods_per_year):
    # Your code here
    pass`,
    solution: `def annualized_realized_volatility(returns, periods_per_year):
    if periods_per_year <= 0:
        return 0.0
    rv = sum(r * r for r in returns) ** 0.5
    return rv * periods_per_year ** 0.5`,
    testCases: [
      { input: [[0.01, -0.02, 0.03], 252], expected: 0.5939696961967 },
      { input: [[0.1], 4], expected: 0.2 },
      { input: [[0.0, 0.0], 252], expected: 0.0 },
      { input: [[], 252], expected: 0.0 },
    ],
    hint: "Realized volatility scales with the square root of the number of periods in a year.",
  },
  {
    id: "ts-284",
    title: "ADF t-Statistic Lite",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Compute the Dickey-Fuller t-statistic for a series by regressing the first differences on the lagged level with an intercept: dy[t] = a + b * y[t-1]. Return t = b / se(b), where se(b) = sqrt(SSE / ((m - 2) * Sxx)) and m is the number of differences.\n\nReturn 0.0 when there are fewer than four observations or the regression is degenerate (zero Sxx or zero standard error).",
    starterCode: `def adf_t_statistic(series):
    # Your code here
    pass`,
    solution: `def adf_t_statistic(series):
    n = len(series)
    if n < 4:
        return 0.0
    y = [series[t] - series[t - 1] for t in range(1, n)]
    x = series[:-1]
    m = len(y)
    mx = sum(x) / m
    my = sum(y) / m
    sxx = sum((v - mx) ** 2 for v in x)
    if sxx == 0:
        return 0.0
    b = sum((x[i] - mx) * (y[i] - my) for i in range(m)) / sxx
    a = my - b * mx
    sse = sum((y[i] - a - b * x[i]) ** 2 for i in range(m))
    s2 = sse / (m - 2)
    se = (s2 / sxx) ** 0.5
    if se == 0:
        return 0.0
    return b / se`,
    testCases: [
      { input: [[1, 2, 3, 4, 5, 6, 7, 8]], expected: 0.0 },
      { input: [[2, 1, 3, 2, 4, 3, 5, 4]], expected: -1.6598500055174643 },
      { input: [[1, 2, 3]], expected: 0.0 },
      { input: [[10, 11, 13, 12, 15, 14, 16, 17]], expected: -0.8451542547285166 },
      { input: [[3, 1, 4, 1, 5, 9, 2, 6]], expected: -2.5885640954239317 },
    ],
    hint: "A deterministic linear series leaves no residual variance, so the t-statistic is defined as 0.",
  },
  {
    id: "ts-285",
    title: "KPSS Level Statistic Lite",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Compute the KPSS level stationarity statistic. Let S_t be the partial sums of the demeaned series; the statistic is sum(S_t^2) / (n^2 * sample_variance), using the population variance as the long-run variance estimate.\n\nReturn 0.0 for fewer than two observations or a constant series.",
    starterCode: `def kpss_level_statistic(series):
    # Your code here
    pass`,
    solution: `def kpss_level_statistic(series):
    n = len(series)
    if n < 2:
        return 0.0
    m = sum(series) / n
    s = 0.0
    total = 0.0
    for x in series:
        s += x - m
        total += s * s
    var = sum((x - m) ** 2 for x in series) / n
    if var == 0:
        return 0.0
    return total / (n * n * var)`,
    testCases: [
      { input: [[1, 3, 2, 4, 3, 5]], expected: 0.4166666666666667 },
      { input: [[1, 1, 1, 1]], expected: 0.0 },
      { input: [[1]], expected: 0.0 },
      { input: [[0, 1, 0, 1, 0, 1]], expected: 0.08333333333333333 },
      { input: [[2, 4, 6, 8, 10]], expected: 0.52 },
    ],
    hint: "Trending series have partial sums that drift far from zero, inflating the statistic.",
  },
  {
    id: "ts-286",
    title: "Cointegration Spread Z-Score",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Given paired series y and x and a hedge ratio beta, form the spread y - beta * x and return the z-score of its latest value: (last - mean) / population_std.\n\nReturn 0.0 when the spread is constant or contains fewer than two points.",
    starterCode: `def cointegration_spread_zscore(y, x, beta):
    # Your code here
    pass`,
    solution: `def cointegration_spread_zscore(y, x, beta):
    spread = [a - beta * b for a, b in zip(y, x)]
    n = len(spread)
    if n < 2:
        return 0.0
    m = sum(spread) / n
    sd = (sum((v - m) ** 2 for v in spread) / n) ** 0.5
    if sd == 0:
        return 0.0
    return (spread[-1] - m) / sd`,
    testCases: [
      { input: [[10, 12, 9], [8, 9, 7], 0.5], expected: -0.9805806756909198 },
      { input: [[1, 2, 3], [0, 0, 0], 1.0], expected: 1.224744871391589 },
      { input: [[5, 6], [2, 2], 1.0], expected: 1.0 },
      { input: [[2, 4, 6], [1, 1, 1], 2.0], expected: 1.224744871391589 },
      { input: [[1, 2], [0, 0], 1.0], expected: 1.0 },
    ],
    hint: "Standardizing the spread tells you how stretched the mean-reversion trade is.",
  },
  {
    id: "ts-287",
    title: "Engle-Granger Residual Change",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the one-step change in the Engle-Granger cointegration residual: (y[-1] - beta * x[-1]) - (y[-2] - beta * x[-2]).\n\nReturn 0.0 when the series have fewer than two aligned points.",
    starterCode: `def engle_granger_residual_change(y, x, beta):
    # Your code here
    pass`,
    solution: `def engle_granger_residual_change(y, x, beta):
    if len(y) < 2 or len(x) != len(y):
        return 0.0
    return (y[-1] - beta * x[-1]) - (y[-2] - beta * x[-2])`,
    testCases: [
      { input: [[10, 12, 11], [8, 9, 8], 0.5], expected: -0.5 },
      { input: [[5, 6], [3, 3], 1.0], expected: 1.0 },
      { input: [[1], [0], 1.0], expected: 0.0 },
      { input: [[7, 9, 8], [2, 3, 2], 1.5], expected: 0.5 },
    ],
    hint: "The error-correction term moves by (dy - beta * dx) between the last two points.",
  },
  {
    id: "ts-288",
    title: "VAR(2) Coefficient Apply",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Apply a VAR(2) coefficient set to produce the next state vector: c + A1 * x_t + A2 * x_prev, where c is the intercept vector and A1, A2 are row-major coefficient matrices.\n\nReturn the resulting list of length len(c).",
    starterCode: `def var2_apply(c, a1, a2, x_t, x_prev):
    # Your code here
    pass`,
    solution: `def var2_apply(c, a1, a2, x_t, x_prev):
    d = len(c)
    return [c[i] + sum(a1[i][j] * x_t[j] for j in range(d)) + sum(a2[i][j] * x_prev[j] for j in range(d)) for i in range(d)]`,
    testCases: [
      {
        input: [[1, 0.5], [[0.5, 0.1], [0.2, 0.4]], [[0.1, 0.0], [0.0, 0.1]], [2, 3], [1, 1]],
        expected: [2.4, 2.2],
      },
      {
        input: [[0, 0], [[1, 0], [0, 1]], [[0, 0], [0, 0]], [4, 5], [1, 2]],
        expected: [4, 5],
      },
      { input: [[1], [[0.5]], [[0.25]], [8], [4]], expected: [6.0] },
    ],
    hint: "The VAR(2) forecast stacks both lags, each with its own coefficient matrix.",
  },
  {
    id: "ts-289",
    title: "Granger Causality F from Series",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Test Granger causality by fitting two OLS regressions on t = 1..n-1: the restricted model y[t] = a + b * y[t-1] and the unrestricted model y[t] = a + b * y[t-1] + c * x[t-1]. Return the F-statistic (SSE_r - SSE_u) / (SSE_u / (m - 3)) with m = n - 1 observations and three unrestricted parameters.\n\nReturn 0.0 for fewer than five points, a singular fit, or a perfect unrestricted fit with SSE_u = 0.",
    starterCode: `def granger_causality_f(y, x):
    # Your code here
    pass`,
    solution: `def granger_causality_f(y, x):
    n = len(y)
    if n < 5 or len(x) != n:
        return 0.0
    yt = y[1:]
    yl = y[:-1]
    xl = x[:-1]
    m = len(yt)

    def ols(cols):
        p = len(cols)
        a = [[0.0] * (p + 1) for _ in range(p + 1)]
        rhs = [0.0] * (p + 1)
        for r in range(m):
            v = [1.0] + [cols[j][r] for j in range(p)]
            for i in range(p + 1):
                for j in range(p + 1):
                    a[i][j] += v[i] * v[j]
                rhs[i] += v[i] * yt[r]
        for i in range(p + 1):
            piv = i
            for r in range(i + 1, p + 1):
                if abs(a[r][i]) > abs(a[piv][i]):
                    piv = r
            if abs(a[piv][i]) < 1e-12:
                return float("inf")
            a[i], a[piv] = a[piv], a[i]
            rhs[i], rhs[piv] = rhs[piv], rhs[i]
            for r in range(i + 1, p + 1):
                f = a[r][i] / a[i][i]
                for c in range(i, p + 1):
                    a[r][c] -= f * a[i][c]
                rhs[r] -= f * rhs[i]
        beta = [0.0] * (p + 1)
        for i in range(p, -1, -1):
            s = rhs[i] - sum(a[i][j] * beta[j] for j in range(i + 1, p + 1))
            beta[i] = s / a[i][i]
        sse = 0.0
        for r in range(m):
            pred = beta[0] + sum(beta[j + 1] * cols[j][r] for j in range(p))
            sse += (yt[r] - pred) ** 2
        return sse

    sse_r = ols([yl])
    sse_u = ols([yl, xl])
    if sse_r == float("inf") or sse_u == float("inf"):
        return 0.0
    df = m - 3
    if df <= 0 or sse_u == 0:
        return 0.0
    return (sse_r - sse_u) / (sse_u / df)`,
    testCases: [
      {
        input: [[1, 2, 1, 3, 2, 4, 3, 5], [5, 1, 4, 2, 6, 3, 7, 4]],
        expected: 27.867455621301787,
      },
      {
        input: [[1, 2, 3, 4, 5, 6], [0, 1, 2, 3, 4, 5]],
        expected: 0.0,
      },
      {
        input: [[2, 3, 3, 4, 4, 5, 6, 7], [1, 0, 2, 1, 3, 2, 4, 3]],
        expected: 8.34001196172248,
      },
      { input: [[1, 2, 3], [1, 2, 3]], expected: 0.0 },
    ],
    hint: "A large F means the lagged x variable explains residual variation that lagged y cannot.",
  },
  {
    id: "ts-290",
    title: "Cumulative Impulse Response AR(1)",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the cumulative impulse response of an AR(1) process through horizon h: the sum from k = 0 to h of phi^k, evaluated with the closed form (1 - phi^(h+1)) / (1 - phi).\n\nFor phi = 1.0 return h + 1, and for negative h return 0.0.",
    starterCode: `def cumulative_impulse_response(phi, h):
    # Your code here
    pass`,
    solution: `def cumulative_impulse_response(phi, h):
    if h < 0:
        return 0.0
    if phi == 1.0:
        return float(h + 1)
    return (1.0 - phi ** (h + 1)) / (1.0 - phi)`,
    testCases: [
      { input: [0.5, 3], expected: 1.875 },
      { input: [0.5, 0], expected: 1.0 },
      { input: [0.0, 5], expected: 1.0 },
      { input: [-0.5, 3], expected: 0.625 },
      { input: [1.0, 4], expected: 5.0 },
    ],
    hint: "For a stationary process the cumulative response converges to 1 / (1 - phi).",
  },
  {
    id: "ts-291",
    title: "Forecast Error Variance Share",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the share of forecast error variance at a horizon attributable to one variable, given its MA coefficient path own_psi and the coefficients of the other shocks other_psi: sum(own^2) / (sum(own^2) + sum(other^2)).\n\nReturn 0.0 when all coefficients are zero.",
    starterCode: `def forecast_error_variance_share(own_psi, other_psi):
    # Your code here
    pass`,
    solution: `def forecast_error_variance_share(own_psi, other_psi):
    num = sum(v * v for v in own_psi)
    den = num + sum(v * v for v in other_psi)
    if den == 0:
        return 0.0
    return num / den`,
    testCases: [
      { input: [[1.0, 0.5], [0.0, 0.5]], expected: 0.8333333333333334 },
      { input: [[1.0], [1.0]], expected: 0.5 },
      { input: [[], []], expected: 0.0 },
      { input: [[0.3, 0.4], [0.5, 0.12]], expected: 0.48600311041990674 },
    ],
    hint: "Squared MA coefficients measure each shock contribution to the forecast error.",
  },
  {
    id: "ts-292",
    title: "Observation Matrix Apply",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Apply a state-space observation equation. For each row of matrix h_matrix, compute the dot product with state and add the scalar offset.\n\nReturn the list of observations; an empty matrix yields an empty list.",
    starterCode: `def observation_matrix_apply(h_matrix, state, offset):
    # Your code here
    pass`,
    solution: `def observation_matrix_apply(h_matrix, state, offset):
    out = []
    for row in h_matrix:
        out.append(sum(row[j] * state[j] for j in range(len(state))) + offset)
    return out`,
    testCases: [
      { input: [[[1, 0], [0, 2]], [3, 4], 0.5], expected: [3.5, 8.5] },
      { input: [[[0.5, 0.5]], [2, 4], 1.0], expected: [4.0] },
      { input: [[[1, 1, 1]], [1, 2, 3], -2.0], expected: [4.0] },
      { input: [[], [1, 2], 0.0], expected: [] },
    ],
    hint: "Each matrix row produces one observed series from the same latent state.",
  },
  {
    id: "ts-293",
    title: "Dynamic Factor Estimate",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Estimate a single dynamic factor from cross-sectional observations by least squares: f = sum(loading_i * x_i) / sum(loading_i^2).\n\nReturn 0.0 when all loadings are zero.",
    starterCode: `def dynamic_factor_estimate(loadings, observations):
    # Your code here
    pass`,
    solution: `def dynamic_factor_estimate(loadings, observations):
    den = sum(l * l for l in loadings)
    if den == 0:
        return 0.0
    return sum(l * v for l, v in zip(loadings, observations)) / den`,
    testCases: [
      { input: [[0.5, 0.5], [2.0, 4.0]], expected: 6.0 },
      { input: [[1, 2, 3], [1, 2, 3]], expected: 1.0 },
      { input: [[0, 0], [5, 7]], expected: 0.0 },
      { input: [[2, -1], [4, -2]], expected: 2.0 },
    ],
    hint: "This is a one-factor regression with unit-variance factor normalization.",
  },
  {
    id: "ts-294",
    title: "STL Remainder Value",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the STL remainder for one observation: observed - trend - seasonal.\n\nThe remainder captures what the trend and seasonal components fail to explain at that time point.",
    starterCode: `def stl_remainder_value(observed, trend, seasonal):
    # Your code here
    pass`,
    solution: `def stl_remainder_value(observed, trend, seasonal):
    return observed - trend - seasonal`,
    testCases: [
      { input: [10, 7, 2], expected: 1 },
      { input: [5, 5, 0], expected: 0 },
      { input: [3.5, 2.0, 1.2], expected: 0.30000000000000004 },
      { input: [0, 0, 0], expected: 0 },
    ],
    hint: "STL decomposes the series additively, so the remainder is simple subtraction.",
  },
  {
    id: "ts-295",
    title: "MSTL Period Count",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Count how many distinct seasonal periods in the candidate list are usable for MSTL. A period qualifies when it is at least 2 and at least two full cycles fit in n observations, that is n // period >= 2.\n\nDuplicate candidates count once.",
    starterCode: `def mstl_period_count(periods, n):
    # Your code here
    pass`,
    solution: `def mstl_period_count(periods, n):
    seen = set()
    for p in periods:
        if p >= 2 and n // p >= 2:
            seen.add(p)
    return len(seen)`,
    testCases: [
      { input: [[7, 30, 365], 400], expected: 2 },
      { input: [[4, 4, 8], 100], expected: 2 },
      { input: [[1, 2], 3], expected: 0 },
      { input: [[], 100], expected: 0 },
      { input: [[24, 24], 48], expected: 1 },
    ],
    hint: "A period needs room for at least two cycles before it can be separated.",
  },
  {
    id: "ts-296",
    title: "Harmonic Regression Fit Value",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Evaluate a fitted harmonic regression at time index t. The coefficient list is [a0, a1, b1, a2, b2, ...] and the fitted value is a0 + sum over k of a_k * cos(2*pi*k*t / period) + b_k * sin(2*pi*k*t / period).\n\nReturn 0.0 when period is not positive or the coefficient list is empty.",
    starterCode: `import math
def harmonic_regression_fit(coeffs, period, t):
    # Your code here
    pass`,
    solution: `import math
def harmonic_regression_fit(coeffs, period, t):
    if period <= 0 or not coeffs:
        return 0.0
    total = coeffs[0]
    n_harm = (len(coeffs) - 1) // 2
    for k in range(1, n_harm + 1):
        a = coeffs[2 * k - 1]
        b = coeffs[2 * k]
        ang = 2.0 * math.pi * k * t / period
        total += a * math.cos(ang) + b * math.sin(ang)
    return total`,
    testCases: [
      { input: [[10, 2, 0], 4, 0], expected: 12.0 },
      { input: [[10, 2, 0], 4, 1], expected: 10.0 },
      { input: [[10, 2, 0], 4, 2], expected: 8.0 },
      { input: [[5, 1, 1, 0.5, 0], 8, 2], expected: 5.5 },
      { input: [[], 4, 1], expected: 0.0 },
    ],
    hint: "Coefficients come in (cosine, sine) pairs, one pair per harmonic.",
  },
  {
    id: "ts-297",
    title: "Fourier Seasonality Amplitudes",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the amplitude sqrt(a^2 + b^2) for each Fourier harmonic given a list of coefficient pairs, one pair per harmonic.\n\nAmplitudes are non-negative even when the coefficients are negative.",
    starterCode: `def fourier_seasonality_amplitudes(coeff_pairs):
    # Your code here
    pass`,
    solution: `def fourier_seasonality_amplitudes(coeff_pairs):
    return [(a * a + b * b) ** 0.5 for a, b in coeff_pairs]`,
    testCases: [
      { input: [[[3, 4]]], expected: [5.0] },
      { input: [[[1, 0], [0, 2]]], expected: [1.0, 2.0] },
      { input: [[[0, 0]]], expected: [0.0] },
      { input: [[]], expected: [] },
      { input: [[[-3, -4]]], expected: [5.0] },
    ],
    hint: "The pair forms a right triangle whose hypotenuse is the amplitude.",
  },
  {
    id: "ts-298",
    title: "CUSUM Reset Statistic",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the peak of a one-sided upper CUSUM with reset. For each observation update S = max(0, S + x - target - k) and track the largest S reached.\n\nThis detects persistent upward shifts relative to the target, with k the reference slack.",
    starterCode: `def cusum_reset_statistic(series, target, k):
    # Your code here
    pass`,
    solution: `def cusum_reset_statistic(series, target, k):
    s = 0.0
    peak = 0.0
    for x in series:
        s = s + x - target - k
        if s < 0:
            s = 0.0
        if s > peak:
            peak = s
    return peak`,
    testCases: [
      { input: [[1, 2, 1, 3, 1], 0, 0.5], expected: 5.5 },
      { input: [[0.1, 0.1], 0, 0.5], expected: 0.0 },
      { input: [[5, 5, 5], 5, 0], expected: 0.0 },
      { input: [[2, 4, 6, 8], 3, 1], expected: 6.0 },
    ],
    hint: "The reset to zero makes small deviations decay while sustained shifts accumulate.",
  },
  {
    id: "ts-299",
    title: "PELT Segmentation Cost",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the PELT objective for a segmentation: the sum of within-segment squared deviations from each segment mean plus penalty * (number of segments - 1). Changepoint indices mark segment starts; indices that are not strictly inside the series are ignored.\n\nThe cost of an empty segment is skipped.",
    starterCode: `def pelt_segmentation_cost(series, changepoints, penalty):
    # Your code here
    pass`,
    solution: `def pelt_segmentation_cost(series, changepoints, penalty):
    valid = sorted(set(c for c in changepoints if 0 < c < len(series)))
    bounds = [0] + valid + [len(series)]
    total = 0.0
    segs = 0
    for i in range(len(bounds) - 1):
        seg = series[bounds[i]:bounds[i + 1]]
        if not seg:
            continue
        m = sum(seg) / len(seg)
        total += sum((x - m) ** 2 for x in seg)
        segs += 1
    return total + penalty * max(0, segs - 1)`,
    testCases: [
      { input: [[1, 2, 3, 10, 11, 12], [3], 0.5], expected: 4.5 },
      { input: [[1, 2, 3, 4], [], 1.0], expected: 5.0 },
      { input: [[5, 5, 5, 5], [1, 2, 3], 0.0], expected: 0.0 },
      { input: [[1, 9, 1, 9], [2], 2.0], expected: 66.0 },
      { input: [[1, 2], [0, 5], 1.0], expected: 0.5 },
    ],
    hint: "The penalty term charges for each additional segment introduced by a changepoint.",
  },
  {
    id: "ts-300",
    title: "Changepoint Posterior Probability",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the posterior probability of a changepoint from a prior probability p and two likelihoods: p * L_change / (p * L_change + (1 - p) * L_no_change).\n\nReturn 0.0 when the denominator is zero.",
    starterCode: `def changepoint_posterior_probability(prior, lik_change, lik_no_change):
    # Your code here
    pass`,
    solution: `def changepoint_posterior_probability(prior, lik_change, lik_no_change):
    den = prior * lik_change + (1.0 - prior) * lik_no_change
    if den == 0:
        return 0.0
    return prior * lik_change / den`,
    testCases: [
      { input: [0.1, 0.9, 0.2], expected: 0.33333333333333337 },
      { input: [0.5, 0.5, 0.5], expected: 0.5 },
      { input: [0.2, 0.8, 0.1], expected: 0.6666666666666666 },
      { input: [0.0, 0.9, 0.2], expected: 0.0 },
      { input: [0.3, 0.0, 0.5], expected: 0.0 },
    ],
    hint: "This is Bayes rule written as a weighted average of the two hypotheses.",
  },
  {
    id: "ts-301",
    title: "Piecewise Trend Value",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Evaluate a piecewise linear trend in hinge form: base + slope * t + sum over j of delta_j * max(0, t - tau_j), pairing changepoints tau_j with slope changes delta_j.\n\nEach changepoint adds delta_j to the slope for times beyond tau_j.",
    starterCode: `def piecewise_trend_value(base, slope, changepoints, deltas, t):
    # Your code here
    pass`,
    solution: `def piecewise_trend_value(base, slope, changepoints, deltas, t):
    v = base + slope * t
    for cp, d in zip(changepoints, deltas):
        if t > cp:
            v += d * (t - cp)
    return v`,
    testCases: [
      { input: [1.0, 0.5, [2, 5], [1.0, -0.5], 4], expected: 5.0 },
      { input: [2.0, 1.0, [], [], 3], expected: 5.0 },
      { input: [0.0, 0.0, [1], [2.0], 3], expected: 4.0 },
      { input: [1.0, 0.5, [5], [1.0], 2], expected: 2.0 },
    ],
    hint: "Only changepoints strictly before t contribute to the evaluated value.",
  },
  {
    id: "ts-302",
    title: "Holiday Effect Multiplier",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the multiplicative holiday adjustment applied to a baseline forecast: 1 + holiday_effect / baseline, where holiday_effect is the absolute lift or drag.\n\nReturn 1.0 when the baseline is zero.",
    starterCode: `def holiday_effect_multiplier(baseline, holiday_effect):
    # Your code here
    pass`,
    solution: `def holiday_effect_multiplier(baseline, holiday_effect):
    if baseline == 0:
        return 1.0
    return 1.0 + holiday_effect / baseline`,
    testCases: [
      { input: [100, 20], expected: 1.2 },
      { input: [50, -10], expected: 0.8 },
      { input: [0, 5], expected: 1.0 },
      { input: [200, 0], expected: 1.0 },
    ],
    hint: "A negative effect produces a multiplier below 1, shrinking the baseline.",
  },
  {
    id: "ts-303",
    title: "Croston One-Step Update",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Perform one Croston update step for intermittent demand. If demand is zero, return [size, interval] unchanged. If size is None, initialize the pair with [demand, gap]. Otherwise return the alpha-smoothed pair [alpha * demand + (1 - alpha) * size, alpha * gap + (1 - alpha) * interval].",
    starterCode: `def croston_update(size, interval, demand, gap, alpha):
    # Your code here
    pass`,
    solution: `def croston_update(size, interval, demand, gap, alpha):
    if demand == 0:
        return [size, interval]
    if size is None:
        return [float(demand), float(gap)]
    new_size = alpha * demand + (1.0 - alpha) * size
    new_interval = alpha * gap + (1.0 - alpha) * interval
    return [new_size, new_interval]`,
    testCases: [
      { input: [4.0, 2.0, 5, 2, 0.5], expected: [4.5, 2.0] },
      { input: [4.0, 2.0, 0, 3, 0.5], expected: [4.0, 2.0] },
      { input: [null, null, 6, 3, 0.5], expected: [6.0, 3.0] },
      { input: [0.0, 0.0, 8, 4, 0.25], expected: [2.0, 1.0] },
    ],
    hint: "Zero demand updates neither the demand size nor the inter-arrival interval.",
  },
  {
    id: "ts-304",
    title: "SBA Demand Estimate",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the Syntetos-Boylan approximation to intermittent demand: (1 - alpha / 2) * size / interval.\n\nReturn 0.0 when the interval is not positive.",
    starterCode: `def sba_demand_estimate(size, interval, alpha):
    # Your code here
    pass`,
    solution: `def sba_demand_estimate(size, interval, alpha):
    if interval <= 0:
        return 0.0
    return (1.0 - alpha / 2.0) * size / interval`,
    testCases: [
      { input: [5.0, 2.0, 0.2], expected: 2.25 },
      { input: [10.0, 4.0, 0.5], expected: 1.875 },
      { input: [3.0, 0.0, 0.1], expected: 0.0 },
      { input: [2.0, 1.0, 1.0], expected: 1.0 },
    ],
    hint: "SBA is Croston divided by the interval with a bias-correction factor (1 - alpha / 2).",
  },
  {
    id: "ts-305",
    title: "Lead-Time Demand Mean",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the expected demand over a lead time: average demand per period times the lead time in periods.\n\nReturn 0.0 when the lead time is negative.",
    starterCode: `def lead_time_demand_mean(avg_demand, lead_time):
    # Your code here
    pass`,
    solution: `def lead_time_demand_mean(avg_demand, lead_time):
    if lead_time < 0:
        return 0.0
    return avg_demand * lead_time`,
    testCases: [
      { input: [10, 4], expected: 40 },
      { input: [0.5, 6], expected: 3.0 },
      { input: [-2, -3], expected: 0.0 },
      { input: [7, 0], expected: 0 },
    ],
    hint: "This is the deterministic part of the reorder point before safety stock.",
  },
  {
    id: "ts-306",
    title: "Safety Stock Periodic Review",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute safety stock under periodic review: z * sigma_demand * sqrt(lead_time + review_period), where z is the service-level multiplier and sigma_demand the per-period demand standard deviation.\n\nReturn 0.0 when the protection interval is negative.",
    starterCode: `def safety_stock_periodic_review(z, sigma_demand, lead_time, review_period):
    # Your code here
    pass`,
    solution: `def safety_stock_periodic_review(z, sigma_demand, lead_time, review_period):
    t = lead_time + review_period
    if t < 0:
        return 0.0
    return z * sigma_demand * t ** 0.5`,
    testCases: [
      { input: [1.65, 2.0, 3, 1], expected: 6.6 },
      { input: [2.0, 1.0, 4, 0], expected: 4.0 },
      { input: [1.0, 3.0, 0, 2], expected: 4.242640687119286 },
      { input: [1.96, 0.0, 5, 5], expected: 0.0 },
    ],
    hint: "The review period extends the exposure window beyond the lead time alone.",
  },
  {
    id: "ts-307",
    title: "Newsvendor Order Quantile",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Compute the newsvendor optimal order quantity as the sample quantile of demands at the critical fractile (price - cost) / (price - salvage). Use linear interpolation between order statistics, with the critical fractile clamped to the interval from 0 to 1.\n\nReturn 0.0 for empty demand, the sole value for a single demand, and use 0.5 when price equals salvage.",
    starterCode: `def newsvendor_order_quantile(demands, price, cost, salvage):
    # Your code here
    pass`,
    solution: `def newsvendor_order_quantile(demands, price, cost, salvage):
    if not demands:
        return 0.0
    if price == salvage:
        critical = 0.5
    else:
        critical = (price - cost) / (price - salvage)
    critical = min(1.0, max(0.0, critical))
    xs = sorted(demands)
    n = len(xs)
    if n == 1:
        return float(xs[0])
    pos = critical * (n - 1)
    lo = int(pos)
    hi = min(lo + 1, n - 1)
    frac = pos - lo
    return xs[lo] + frac * (xs[hi] - xs[lo])`,
    testCases: [
      { input: [[10, 20, 30, 40], 10, 4, 1], expected: 30.0 },
      { input: [[10, 20, 30, 40], 8, 3, 2], expected: 35.0 },
      { input: [[5], 10, 4, 0], expected: 5.0 },
      { input: [[1, 2, 3, 4, 5], 10, 5, 5], expected: 5.0 },
      { input: [[10, 20, 30, 40], 5, 4, 1], expected: 17.5 },
    ],
    hint: "A higher unit margin relative to salvage pushes the critical fractile toward 1.",
  },
  {
    id: "ts-308",
    title: "Order-Up-To Level",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the order-up-to level for periodic review: avg_demand * (lead_time + review_period) + z * sigma_demand * sqrt(lead_time + review_period).\n\nReturn 0.0 when the protection interval is negative.",
    starterCode: `def order_up_to_level(avg_demand, lead_time, review_period, z, sigma_demand):
    # Your code here
    pass`,
    solution: `def order_up_to_level(avg_demand, lead_time, review_period, z, sigma_demand):
    t = lead_time + review_period
    if t < 0:
        return 0.0
    return avg_demand * t + z * sigma_demand * t ** 0.5`,
    testCases: [
      { input: [10, 4, 1, 1.65, 2.0], expected: 57.379024325749306 },
      { input: [5, 2, 2, 0.0, 3.0], expected: 20.0 },
      { input: [2, 0, 0, 1.0, 1.0], expected: 0.0 },
      { input: [3, 3, 3, 1.0, 0.5], expected: 19.22474487139159 },
    ],
    hint: "It is the reorder point computed over the combined lead time and review window.",
  },
  {
    id: "ts-309",
    title: "Inventory Turnover",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute inventory turnover as cost of goods sold divided by average inventory, where average inventory is the mean of beginning and ending inventory.\n\nReturn 0.0 when average inventory is zero.",
    starterCode: `def inventory_turnover(cogs, beginning_inventory, ending_inventory):
    # Your code here
    pass`,
    solution: `def inventory_turnover(cogs, beginning_inventory, ending_inventory):
    avg = (beginning_inventory + ending_inventory) / 2.0
    if avg == 0:
        return 0.0
    return cogs / avg`,
    testCases: [
      { input: [1000, 200, 300], expected: 4.0 },
      { input: [500, 0, 0], expected: 0.0 },
      { input: [1200, 300, 300], expected: 4.0 },
      { input: [0, 100, 100], expected: 0.0 },
    ],
    hint: "Higher turnover means inventory is sold and replaced more quickly.",
  },
  {
    id: "ts-310",
    title: "Forecast Bias Percentage",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute forecast bias as a percentage of total actual demand: 100 * sum(forecast - actual) / sum(actual).\n\nPositive values mean forecasts ran above actuals. Return 0.0 when the actual values sum to zero.",
    starterCode: `def forecast_bias_percentage(actual, forecast):
    # Your code here
    pass`,
    solution: `def forecast_bias_percentage(actual, forecast):
    total = sum(actual)
    if total == 0:
        return 0.0
    return 100.0 * sum(f - a for a, f in zip(actual, forecast)) / total`,
    testCases: [
      { input: [[100, 200], [110, 190]], expected: 0.0 },
      { input: [[50, 50], [60, 50]], expected: 10.0 },
      { input: [[0, 0], [1, 1]], expected: 0.0 },
      { input: [[10, 20, 30], [12, 22, 28]], expected: 3.3333333333333335 },
    ],
    hint: "The percentage sign makes bias comparable across series of different scale.",
  },
  {
    id: "ts-311",
    title: "Trigg Tracking Signal",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute Trigg's tracking signal from a list of forecast errors. Maintain a smoothed error and a smoothed absolute error with the same alpha: E = alpha * e + (1 - alpha) * E and M = alpha * |e| + (1 - alpha) * M, then return E / M.\n\nReturn 0.0 for empty input or when the smoothed absolute error is zero.",
    starterCode: `def trigg_tracking_signal(errors, alpha):
    # Your code here
    pass`,
    solution: `def trigg_tracking_signal(errors, alpha):
    if not errors:
        return 0.0
    smoothed = 0.0
    mad = 0.0
    for e in errors:
        smoothed = alpha * e + (1.0 - alpha) * smoothed
        mad = alpha * abs(e) + (1.0 - alpha) * mad
    if mad == 0:
        return 0.0
    return smoothed / mad`,
    testCases: [
      { input: [[1, 1, 1], 0.5], expected: 1.0 },
      { input: [[1, -1, 1, -1], 0.5], expected: -0.3333333333333333 },
      { input: [[0, 0, 0], 0.5], expected: 0.0 },
      { input: [[], 0.3], expected: 0.0 },
      { input: [[2, 4, 6], 0.25], expected: 1.0 },
    ],
    hint: "Smoothing both the error and its magnitude makes the signal less jumpy than a plain ratio.",
  },
  {
    id: "ts-312",
    title: "Average Pinball Loss",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the mean pinball loss across several quantiles. forecasts holds one forecast list per quantile and quantiles the matching probabilities. For each pair let d = actual - forecast; add q * d when d is non-negative and (q - 1) * d otherwise, then average over all actual-forecast pairs.\n\nReturn 0.0 when there are no pairs.",
    starterCode: `def average_pinball_loss(actual, forecasts, quantiles):
    # Your code here
    pass`,
    solution: `def average_pinball_loss(actual, forecasts, quantiles):
    if not actual or not quantiles:
        return 0.0
    total = 0.0
    count = 0
    for q, fs in zip(quantiles, forecasts):
        for a, f in zip(actual, fs):
            d = a - f
            total += q * d if d >= 0 else (q - 1.0) * d
            count += 1
    if count == 0:
        return 0.0
    return total / count`,
    testCases: [
      {
        input: [[10, 12, 14], [[11, 11, 11], [15, 15, 15]], [0.5, 0.9]],
        expected: 0.5666666666666667,
      },
      { input: [[5], [[5]], [0.5]], expected: 0.0 },
      { input: [[1, 2], [[0, 0], [3, 3]], [0.1, 0.9]], expected: 0.15 },
      { input: [[1, 2, 3], [[2, 2, 2]], [0.5]], expected: 0.3333333333333333 },
    ],
    hint: "Underprediction is penalized by q and overprediction by 1 - q.",
  },
  {
    id: "ts-313",
    title: "Quantile Coverage Rate",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the empirical coverage rate of a quantile forecast: the fraction of actual values less than or equal to the matching forecast, that is the share of observations in which the quantile was not exceeded.\n\nReturn 0.0 for empty input.",
    starterCode: `def quantile_coverage_rate(actual, forecast):
    # Your code here
    pass`,
    solution: `def quantile_coverage_rate(actual, forecast):
    if not actual:
        return 0.0
    count = sum(1 for a, f in zip(actual, forecast) if a <= f)
    return count / len(actual)`,
    testCases: [
      { input: [[10, 12, 14], [11, 11, 11]], expected: 0.3333333333333333 },
      { input: [[5, 5], [5, 5]], expected: 1.0 },
      { input: [[1, 2, 3], [3, 3, 3]], expected: 1.0 },
      { input: [[], []], expected: 0.0 },
      { input: [[4, 5, 6], [4.0, 5.0, 5.5]], expected: 0.6666666666666666 },
    ],
    hint: "A calibrated 0.9 quantile forecast should be exceeded only about one time in ten.",
  },
  {
    id: "ts-314",
    title: "CRPS from Quantile Losses",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Approximate the continuous ranked probability score from quantile forecasts as CRPS = 2 * sum over k of QS_k / (K * n), where QS_k is the total pinball loss at quantile q_k, K the number of quantiles, and n the number of observations.\n\nReturn 0.0 when inputs are empty or when the counts of forecast lists and quantiles differ.",
    starterCode: `def crps_from_quantile_losses(actual, forecasts, quantiles):
    # Your code here
    pass`,
    solution: `def crps_from_quantile_losses(actual, forecasts, quantiles):
    if not actual or not forecasts or len(forecasts) != len(quantiles):
        return 0.0
    total = 0.0
    for q, fs in zip(quantiles, forecasts):
        qs = 0.0
        for a, f in zip(actual, fs):
            d = a - f
            qs += q * d if d >= 0 else (q - 1.0) * d
        total += qs
    k = len(quantiles)
    return 2.0 * total / (k * len(actual))`,
    testCases: [
      { input: [[10, 12, 14], [[9, 11, 13], [13, 14, 15]], [0.25, 0.75]], expected: 0.75 },
      { input: [[5], [[4], [6]], [0.1, 0.9]], expected: 0.19999999999999998 },
      { input: [[1, 2, 3], [[1, 2, 3]], [0.5]], expected: 0.0 },
      { input: [[1, 2], [], []], expected: 0.0 },
    ],
    hint: "The quantile-score representation lets a finite set of quantiles approximate CRPS.",
  },
  {
    id: "ts-315",
    title: "HMM Backward Value",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Perform one scaled backward step of a hidden Markov model: beta_new[i] = sum over j of A[i][j] * emission[j] * beta_next[j], then rescale the vector to sum to one. Here emission holds the probabilities of the current observation.\n\nReturn a zero vector when the total is zero.",
    starterCode: `def hmm_backward_value(beta_next, transition, emission):
    # Your code here
    pass`,
    solution: `def hmm_backward_value(beta_next, transition, emission):
    d = len(beta_next)
    out = []
    for i in range(d):
        s = sum(transition[i][j] * emission[j] * beta_next[j] for j in range(d))
        out.append(s)
    total = sum(out)
    if total == 0:
        return [0.0] * d
    return [v / total for v in out]`,
    testCases: [
      {
        input: [[0.6, 0.4], [[0.9, 0.1], [0.2, 0.8]], [0.5, 0.7]],
        expected: [0.5120274914089347, 0.48797250859106517],
      },
      {
        input: [[1.0, 1.0], [[0.5, 0.5], [0.5, 0.5]], [1.0, 1.0]],
        expected: [0.5, 0.5],
      },
      {
        input: [[0.6, 0.4], [[0.9, 0.1], [0.2, 0.8]], [0.0, 0.0]],
        expected: [0.0, 0.0],
      },
      {
        input: [[1.0, 0.0], [[1.0, 0.0], [0.0, 1.0]], [0.3, 0.7]],
        expected: [1.0, 0.0],
      },
    ],
    hint: "The backward message sums over all next states weighted by transition, emission, and future evidence.",
  },
];
