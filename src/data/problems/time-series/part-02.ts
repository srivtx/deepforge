import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "ts-046",
    title: "Kalman Gain",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the Kalman gain for a one-dimensional state with prior variance p and observation noise variance r: K = p / (p + r).\n\nReturn 0.0 when the denominator is zero.",
    starterCode: `def kalman_gain(p, r):
    # Your code here
    pass`,
    solution: `def kalman_gain(p, r):
    den = p + r
    if den == 0:
        return 0.0
    return p / den`,
    testCases: [
      { input: [1, 1], expected: 0.5 },
      { input: [2, 1], expected: 0.6666666666666666 },
      { input: [0, 5], expected: 0.0 },
      { input: [3, 0], expected: 1.0 },
    ],
    hint: "The gain is close to 1 when the prior is uncertain relative to the noise.",
  },
  {
    id: "ts-047",
    title: "Kalman Filter 1D Update",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Perform the measurement update of a one-dimensional Kalman filter. Given the prior mean and variance, an observation, and the observation noise variance r, compute K = p / (p + r), then the posterior mean prior + K * (obs - prior) and posterior variance (1 - K) * p.\n\nReturn [posterior_mean, posterior_variance].",
    starterCode: `def kalman_update(prior, p_prior, obs, r):
    # Your code here
    pass`,
    solution: `def kalman_update(prior, p_prior, obs, r):
    den = p_prior + r
    k = p_prior / den if den != 0 else 0.0
    mean = prior + k * (obs - prior)
    var = (1.0 - k) * p_prior
    return [mean, var]`,
    testCases: [
      { input: [10, 2, 12, 2], expected: [11.0, 1.0] },
      { input: [0, 1, 1, 1], expected: [0.5, 0.5] },
      { input: [5, 2, 5, 3], expected: [5.0, 1.2] },
      { input: [0, 0, 10, 1], expected: [0.0, 0.0] },
    ],
    hint: "The posterior variance is always smaller than the prior variance.",
  },
  {
    id: "ts-048",
    title: "Exponential Smoothing State Update",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Update an exponentially smoothed level given the current level, a new observation x, and smoothing factor alpha: new_level = alpha * x + (1 - alpha) * level.\n\nReturn the updated level.",
    starterCode: `def exp_smoothing_state(level, x, alpha):
    # Your code here
    pass`,
    solution: `def exp_smoothing_state(level, x, alpha):
    return alpha * x + (1 - alpha) * level`,
    testCases: [
      { input: [10, 12, 0.5], expected: 11.0 },
      { input: [5, 5, 0.3], expected: 5.0 },
      { input: [0, 10, 1.0], expected: 10.0 },
      { input: [10, 0, 0.0], expected: 10.0 },
    ],
    hint: "alpha = 1 ignores history and jumps straight to the new observation.",
  },
  {
    id: "ts-049",
    title: "Momentum Indicator",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the momentum indicator over k periods: prices[-1] - prices[-1-k].\n\nReturn 0.0 if k is not positive or k is at least the length of the price series.",
    starterCode: `def momentum(prices, k):
    # Your code here
    pass`,
    solution: `def momentum(prices, k):
    if k <= 0 or k >= len(prices):
        return 0.0
    return prices[-1] - prices[-1 - k]`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 1], expected: 1 },
      { input: [[1, 3, 6, 10], 2], expected: 7 },
      { input: [[5, 4, 3], 1], expected: -1 },
      { input: [[1, 2], 5], expected: 0.0 },
    ],
    hint: "Negative momentum means the series has fallen over the lookback window.",
  },
  {
    id: "ts-050",
    title: "Forecast Bias",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the forecast bias as the mean signed error forecast - actual: (1/n) * sum(forecast[t] - actual[t]).\n\nReturn 0.0 for an empty actual list.",
    starterCode: `def forecast_bias(actual, forecast):
    # Your code here
    pass`,
    solution: `def forecast_bias(actual, forecast):
    if not actual:
        return 0.0
    return sum(f - a for a, f in zip(actual, forecast)) / len(actual)`,
    testCases: [
      { input: [[10, 12, 14], [11, 11, 11]], expected: -1.0 },
      { input: [[1, 2], [2, 1]], expected: 0.0 },
      { input: [[5], [7]], expected: 2.0 },
      { input: [[1, 2, 3], [3, 3, 3]], expected: 1.0 },
    ],
    hint: "Positive bias means the forecast systematically overshoots.",
  },
  {
    id: "ts-051",
    title: "Interval Coverage Count",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Count how many actual values fall inside their corresponding prediction interval, i.e. lower[t] <= actual[t] <= upper[t].\n\nReturn the count as an integer.",
    starterCode: `def interval_coverage(actual, lower, upper):
    # Your code here
    pass`,
    solution: `def interval_coverage(actual, lower, upper):
    count = 0
    for a, lo, hi in zip(actual, lower, upper):
        if lo <= a <= hi:
            count += 1
    return count`,
    testCases: [
      { input: [[1, 2, 3], [0, 1, 2], [2, 3, 4]], expected: 3 },
      { input: [[5, 5, 5], [1, 2, 3], [4, 4, 4]], expected: 0 },
      { input: [[0, 10], [0, 10], [0, 10]], expected: 2 },
      { input: [[1, 2, 3], [1, 1, 1], [3, 3, 2]], expected: 2 },
    ],
    hint: "Both bounds are inclusive, so values exactly on a limit still count.",
  },
  {
    id: "ts-052",
    title: "Anomaly Z-Score on Residuals",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Score a new value against a list of residuals. Compute the mean and population standard deviation of residuals, then return (value - mean) / std.\n\nReturn 0.0 if residuals is empty or has zero variance.",
    starterCode: `def anomaly_zscore(residuals, value):
    # Your code here
    pass`,
    solution: `def anomaly_zscore(residuals, value):
    if not residuals:
        return 0.0
    m = sum(residuals) / len(residuals)
    sd = (sum((x - m) ** 2 for x in residuals) / len(residuals)) ** 0.5
    if sd == 0:
        return 0.0
    return (value - m) / sd`,
    testCases: [
      { input: [[1, 2, 3, 4], 5], expected: 2.23606797749979 },
      { input: [[0, 0, 0], 1], expected: 0.0 },
      { input: [[10, 10, 10, 10], 10], expected: 0.0 },
      { input: [[2, 4, 6], 8], expected: 2.449489742783178 },
    ],
    hint: "A z-score beyond 2 flags a potentially unusual observation.",
  },
  {
    id: "ts-053",
    title: "Pinball Loss",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the mean pinball (quantile) loss for a forecast at quantile q. For each pair add q * (actual - forecast) when actual >= forecast, otherwise (q - 1) * (actual - forecast).\n\nReturn the average over all pairs, or 0.0 for an empty actual list.",
    starterCode: `def pinball_loss(actual, forecast, q):
    # Your code here
    pass`,
    solution: `def pinball_loss(actual, forecast, q):
    if not actual:
        return 0.0
    total = 0.0
    for a, f in zip(actual, forecast):
        d = a - f
        if d >= 0:
            total += q * d
        else:
            total += (q - 1.0) * d
    return total / len(actual)`,
    testCases: [
      { input: [[10, 10], [12, 8], 0.5], expected: 1.0 },
      { input: [[5], [7], 0.9], expected: 0.19999999999999996 },
      { input: [[5], [3], 0.9], expected: 1.8 },
      { input: [[1, 2, 3], [1, 2, 3], 0.75], expected: 0.0 },
    ],
    hint: "The penalties on the two sides of the forecast are asymmetric unless q = 0.5.",
  },
  {
    id: "ts-054",
    title: "Value at Risk Normal",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the one-period Value at Risk for normally distributed returns with mean mu, standard deviation sigma, and lower-tail standard normal quantile z (a negative number): VaR = -(mu + z * sigma).\n\nThe result is a positive loss number when the quantile lies below the mean.",
    starterCode: `def value_at_risk_normal(mu, sigma, z):
    # Your code here
    pass`,
    solution: `def value_at_risk_normal(mu, sigma, z):
    return -(mu + z * sigma)`,
    testCases: [
      { input: [0, 1, -1.6448536269514722], expected: 1.6448536269514722 },
      { input: [0.01, 0.02, -1.96], expected: 0.029199999999999997 },
      { input: [0, 0, -1.65], expected: -0.0 },
      { input: [0.5, 1, -2], expected: 1.5 },
    ],
    hint: "z comes from the standard normal quantile, e.g. -1.645 for 95 percent confidence.",
  },
  {
    id: "ts-055",
    title: "Expected Shortfall Normal",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the expected shortfall (average loss beyond VaR) for normal returns: ES = -mu + sigma * phi(z) / (1 - c), where phi is the standard normal density, z is the lower-tail quantile, and c is the confidence level.\n\nReturn 0.0 when c >= 1.",
    starterCode: `import math
def expected_shortfall_normal(mu, sigma, z, c):
    # Your code here
    pass`,
    solution: `import math
def expected_shortfall_normal(mu, sigma, z, c):
    if c >= 1:
        return 0.0
    pdf = math.exp(-z * z / 2.0) / (2.0 * math.pi) ** 0.5
    return -mu + sigma * pdf / (1.0 - c)`,
    testCases: [
      { input: [0, 1, -1.6448536269514722, 0.95], expected: 2.0627128075074257 },
      { input: [0.01, 0.02, -1.96, 0.975], expected: 0.036752755466761135 },
      { input: [0, 0, -1.5, 0.9], expected: 0.0 },
      { input: [0, 1, -2.0, 1.0], expected: 0.0 },
    ],
    hint: "Expected shortfall is always at least as large as VaR for the same confidence.",
  },
  {
    id: "ts-056",
    title: "GARCH(1,1) Variance Update",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Update the conditional variance of a GARCH(1,1) model: sigma2_new = omega + alpha * e^2 + beta * sigma2, where e is the latest innovation and sigma2 the previous conditional variance.\n\nReturn the updated variance.",
    starterCode: `def garch11_update(omega, alpha, beta, e2, sigma2):
    # Your code here
    pass`,
    solution: `def garch11_update(omega, alpha, beta, e2, sigma2):
    return omega + alpha * e2 + beta * sigma2`,
    testCases: [
      { input: [0.1, 0.1, 0.8, 4, 1], expected: 1.3 },
      { input: [0.2, 0.3, 0.5, 1, 2], expected: 1.5 },
      { input: [0, 0, 0, 5, 5], expected: 0 },
      { input: [0.1, 0.2, 0.7, 0, 0], expected: 0.1 },
    ],
    hint: "Persistence is alpha + beta; large shocks raise next period's variance.",
  },
  {
    id: "ts-057",
    title: "CUSUM Statistic",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the cumulative sum control chart values for a series around a target: S[t] = sum over i <= t of (x[i] - target).\n\nReturn the running sums as a list; an empty series gives an empty list.",
    starterCode: `def cusum(series, target):
    # Your code here
    pass`,
    solution: `def cusum(series, target):
    out = []
    total = 0.0
    for x in series:
        total += x - target
        out.append(total)
    return out`,
    testCases: [
      { input: [[1, 2, 3, 4], 2], expected: [-1.0, -1.0, 0.0, 2.0] },
      { input: [[5, 5, 5], 5], expected: [0.0, 0.0, 0.0] },
      { input: [[1, 2, 3], 0], expected: [1.0, 3.0, 6.0] },
      { input: [[], 1], expected: [] },
    ],
    hint: "A drift in the CUSUM away from zero signals a change in level.",
  },
  {
    id: "ts-058",
    title: "EWMA Control Limits",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the lower and upper EWMA control limits: mu ± L * sigma * sqrt(alpha / (2 - alpha)).\n\nReturn [lower, upper].",
    starterCode: `def ewma_control_limits(mu, sigma, alpha, L):
    # Your code here
    pass`,
    solution: `def ewma_control_limits(mu, sigma, alpha, L):
    width = L * sigma * (alpha / (2.0 - alpha)) ** 0.5
    return [mu - width, mu + width]`,
    testCases: [
      { input: [0, 1, 0.2, 3], expected: [-1.0, 1.0] },
      { input: [10, 2, 0.5, 2], expected: [7.690598923241497, 12.309401076758503] },
      { input: [0, 0, 0.3, 3], expected: [0.0, 0.0] },
      { input: [5, 1, 1.0, 1], expected: [4.0, 6.0] },
    ],
    hint: "The steady-state EWMA variance is sigma^2 * alpha / (2 - alpha).",
  },
  {
    id: "ts-059",
    title: "Forecast Combination Weight Inverse Error",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the inverse-error weight for the first of two forecasts: w1 = (1/mse1) / (1/mse1 + 1/mse2).\n\nIf both MSEs are non-positive return 0.5; if only mse1 is non-positive return 1.0; if only mse2 is non-positive return 0.0.",
    starterCode: `def combination_weight_inverse_error(mse1, mse2):
    # Your code here
    pass`,
    solution: `def combination_weight_inverse_error(mse1, mse2):
    if mse1 <= 0 and mse2 <= 0:
        return 0.5
    if mse1 <= 0:
        return 1.0
    if mse2 <= 0:
        return 0.0
    w1 = 1.0 / mse1
    w2 = 1.0 / mse2
    return w1 / (w1 + w2)`,
    testCases: [
      { input: [1, 1], expected: 0.5 },
      { input: [1, 3], expected: 0.75 },
      { input: [4, 4], expected: 0.5 },
      { input: [0, 2], expected: 1.0 },
    ],
    hint: "The more accurate forecast (smaller MSE) receives the larger weight.",
  },
  {
    id: "ts-060",
    title: "Horizon-Based Decay Weight",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Build normalized horizon weights that decay geometrically: start from decay^h for h = 1, ..., horizon and divide each by their total so the weights sum to 1.\n\nReturn an empty list when horizon is not positive or all raw weights are zero.",
    starterCode: `def horizon_decay_weights(horizon, decay):
    # Your code here
    pass`,
    solution: `def horizon_decay_weights(horizon, decay):
    if horizon <= 0:
        return []
    raw = [decay ** h for h in range(1, horizon + 1)]
    total = sum(raw)
    if total == 0:
        return []
    return [r / total for r in raw]`,
    testCases: [
      { input: [3, 0.5], expected: [0.5714285714285714, 0.2857142857142857, 0.14285714285714285] },
      { input: [1, 0.9], expected: [1.0] },
      { input: [4, 1.0], expected: [0.25, 0.25, 0.25, 0.25] },
      { input: [0, 0.5], expected: [] },
    ],
    hint: "Weights shrink as the horizon grows when decay is between 0 and 1.",
  },
  {
    id: "ts-061",
    title: "Impulse Response Step",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "For an AR(1) model x[t] = phi * x[t-1] + e[t], return the impulse response at horizon h, which is phi raised to the power h.\n\nReturn 0.0 when h is negative.",
    starterCode: `def impulse_response_ar1(phi, h):
    # Your code here
    pass`,
    solution: `def impulse_response_ar1(phi, h):
    if h < 0:
        return 0.0
    return phi ** h`,
    testCases: [
      { input: [0.5, 3], expected: 0.125 },
      { input: [0.9, 0], expected: 1.0 },
      { input: [-0.5, 2], expected: 0.25 },
      { input: [0.0, 5], expected: 0.0 },
    ],
    hint: "A shock's effect decays geometrically at rate phi.",
  },
  {
    id: "ts-062",
    title: "SARIMA Order Application",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Apply SARIMA differencing to a series: first take d regular differences, then take D seasonal differences of lag m, where each seasonal difference is y[t] = x[t] - x[t-m] on the already differenced series.\n\nReturn the transformed series. If a seasonal difference is requested when m is not positive or the series is no longer than m, return an empty list.",
    starterCode: `def sarima_difference(series, d, D, m):
    # Your code here
    pass`,
    solution: `def sarima_difference(series, d, D, m):
    out = list(series)
    for _ in range(d):
        out = [out[i + 1] - out[i] for i in range(len(out) - 1)]
    for _ in range(D):
        if m <= 0 or len(out) <= m:
            return []
        out = [out[i] - out[i - m] for i in range(m, len(out))]
    return out`,
    testCases: [
      { input: [[1, 2, 4, 7, 11, 16], 1, 0, 2], expected: [1, 2, 3, 4, 5] },
      { input: [[1, 2, 3, 4, 5, 6, 7, 8], 0, 1, 4], expected: [4, 4, 4, 4] },
      { input: [[1, 2, 4, 8, 16, 32], 1, 1, 2], expected: [3, 6, 12] },
      { input: [[1, 2, 3], 1, 1, 3], expected: [] },
    ],
    hint: "Regular differencing runs first, so the series may become too short for the seasonal step.",
  },
  {
    id: "ts-063",
    title: "DFT of Small Series",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the discrete Fourier transform of a series. For each frequency k = 0, ..., n-1 compute X[k] = sum over t of x[t] * exp(-2*pi*i*k*t/n), represented as the pair [real, imaginary].\n\nReturn a list of n such pairs.",
    starterCode: `import math
def dft(series):
    # Your code here
    pass`,
    solution: `import math
def dft(series):
    n = len(series)
    out = []
    for k in range(n):
        re = sum(series[t] * math.cos(2.0 * math.pi * k * t / n) for t in range(n))
        im = -sum(series[t] * math.sin(2.0 * math.pi * k * t / n) for t in range(n))
        out.append([re, im])
    return out`,
    testCases: [
      {
        input: [[1, 0, 0, 0]],
        expected: [
          [1.0, -0.0],
          [1.0, -0.0],
          [1.0, -0.0],
          [1.0, -0.0],
        ],
      },
      {
        input: [[1, 1, 1, 1]],
        expected: [
          [4.0, -0.0],
          [-1.224646799147353e-16, -1.2246467991473532e-16],
          [0.0, -2.449293598294706e-16],
          [3.67394039744206e-16, -3.6739403974420594e-16],
        ],
      },
      {
        input: [[1, 2, 3, 4]],
        expected: [
          [10.0, -0.0],
          [-2.0000000000000004, 1.9999999999999996],
          [-2.0, -9.797174393178826e-16],
          [-1.9999999999999982, -2.000000000000001],
        ],
      },
    ],
    hint: "The k = 0 bin is the sum of the series; negative imaginary parts come from the -sin term.",
  },
  {
    id: "ts-064",
    title: "Periodogram Bin",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the periodogram at a single frequency bin k: I(k) = (1/n) * abs(sum over t of x[t] * exp(-2*pi*i*k*t/n))^2.\n\nReturn 0.0 if k is outside the range 0 to n-1.",
    starterCode: `import math
def periodogram_bin(series, k):
    # Your code here
    pass`,
    solution: `import math
def periodogram_bin(series, k):
    n = len(series)
    if k < 0 or k >= n:
        return 0.0
    re = sum(series[t] * math.cos(2.0 * math.pi * k * t / n) for t in range(n))
    im = -sum(series[t] * math.sin(2.0 * math.pi * k * t / n) for t in range(n))
    return (re * re + im * im) / n`,
    testCases: [
      { input: [[1, 0, 0, 0], 0], expected: 0.25 },
      { input: [[1, 1, 1, 1], 1], expected: 7.498798913309287e-33 },
      { input: [[1, 2, 3, 4], 1], expected: 2.0 },
      { input: [[1, 2, 3], 0], expected: 12.0 },
    ],
    hint: "For a constant series all nonzero bins are (numerically) zero.",
  },
  {
    id: "ts-065",
    title: "Dominant Frequency",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Find the dominant frequency of a series by scanning the periodogram bins k = 0, ..., n//2 and returning the normalized frequency k/n at the bin with the largest power. Ties keep the smallest k.\n\nReturn 0.0 for a series with fewer than two points.",
    starterCode: `import math
def dominant_frequency(series):
    # Your code here
    pass`,
    solution: `import math
def dominant_frequency(series):
    n = len(series)
    if n < 2:
        return 0.0
    best_k = 0
    best_p = -1.0
    for k in range(n // 2 + 1):
        re = sum(series[t] * math.cos(2.0 * math.pi * k * t / n) for t in range(n))
        im = -sum(series[t] * math.sin(2.0 * math.pi * k * t / n) for t in range(n))
        p = (re * re + im * im) / n
        if p > best_p + 1e-12:
            best_p = p
            best_k = k
    return best_k / n`,
    testCases: [
      { input: [[0, 1, 0, 1]], expected: 0.0 },
      { input: [[5, 5, 5, 5]], expected: 0.0 },
      { input: [[1, 2, 3, 4]], expected: 0.0 },
      { input: [[1, -1, 1, -1]], expected: 0.5 },
      { input: [[1, 0, -1, 0]], expected: 0.25 },
    ],
    hint: "A value of 0.5 corresponds to the Nyquist frequency.",
  },
  {
    id: "ts-066",
    title: "ACF Vector",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Return the sample autocorrelation vector [rho(0), rho(1), ..., rho(h)] using the biased 1/n estimator: gamma(k) = (1/n) * sum over t < n-k of (x[t] - mean) * (x[t+k] - mean), and rho(k) = gamma(k) / gamma(0).\n\nLags with k >= n or a zero-variance series produce 0.0; return an empty list for h < 0 or an empty series.",
    starterCode: `def acf_vector(series, h):
    # Your code here
    pass`,
    solution: `def acf_vector(series, h):
    n = len(series)
    if n == 0 or h < 0:
        return []
    m = sum(series) / n
    g0 = sum((x - m) ** 2 for x in series) / n
    out = []
    for k in range(h + 1):
        if k >= n or g0 == 0:
            out.append(0.0)
        else:
            gk = sum((series[t] - m) * (series[t + k] - m) for t in range(n - k)) / n
            out.append(gk / g0)
    return out`,
    testCases: [
      { input: [[1, 2, 3, 4], 2], expected: [1.0, 0.25, -0.3] },
      { input: [[1, 2, 3, 4], 0], expected: [1.0] },
      { input: [[5, 5, 5], 1], expected: [0.0, 0.0] },
      { input: [[1, 2, 3, 4], 4], expected: [1.0, 0.25, -0.3, -0.45, 0.0] },
    ],
    hint: "The first element is always 1.0 for a non-constant series.",
  },
  {
    id: "ts-067",
    title: "Cross-Correlation Vector",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the cross-correlation vector between two equal-length series for lags k = 0, ..., h: the Pearson correlation of x[0..n-k-1] with y[k..n-1].\n\nReturn 0.0 at lags with fewer than two paired points or zero variance, and an empty list if the lengths differ or h < 0.",
    starterCode: `def cross_correlation(x, y, h):
    # Your code here
    pass`,
    solution: `def cross_correlation(x, y, h):
    n = len(x)
    if n != len(y) or h < 0:
        return []
    out = []
    for k in range(h + 1):
        if n - k < 2:
            out.append(0.0)
            continue
        xs = x[:n - k]
        ys = y[k:]
        mx = sum(xs) / len(xs)
        my = sum(ys) / len(ys)
        num = sum((a - mx) * (b - my) for a, b in zip(xs, ys))
        da = sum((a - mx) ** 2 for a in xs) ** 0.5
        db = sum((b - my) ** 2 for b in ys) ** 0.5
        if da == 0 or db == 0:
            out.append(0.0)
        else:
            out.append(num / (da * db))
    return out`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], [2, 4, 6, 8, 10], 2], expected: [0.9999999999999998, 0.9999999999999998, 0.9999999999999998] },
      { input: [[1, 2, 3, 4, 5], [5, 4, 3, 2, 1], 1], expected: [-0.9999999999999998, -0.9999999999999998] },
      { input: [[1, 2, 3], [3, 2, 1], 0], expected: [-0.9999999999999998] },
      { input: [[1, 1, 1], [1, 2, 3], 1], expected: [0.0, 0.0] },
    ],
    hint: "Positive lags compare earlier x values with later y values.",
  },
  {
    id: "ts-068",
    title: "Spectral Density Value",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Evaluate the truncated spectral density at frequency f from an autocorrelation list acf = [rho(0), ..., rho(K)]: S(f) = rho(0) + 2 * sum over k = 1..K of rho(k) * cos(2 * pi * f * k).\n\nReturn the value as a number.",
    starterCode: `import math
def spectral_density(acf, f):
    # Your code here
    pass`,
    solution: `import math
def spectral_density(acf, f):
    total = acf[0]
    for k in range(1, len(acf)):
        total += 2.0 * acf[k] * math.cos(2.0 * math.pi * f * k)
    return total`,
    testCases: [
      { input: [[1, 0.5], 0.0], expected: 2.0 },
      { input: [[1, 0.5], 0.5], expected: 0.0 },
      { input: [[1, 0.25, 0.1], 0.25], expected: 0.8 },
      { input: [[1], 0.3], expected: 1 },
    ],
    hint: "The density at frequency 0 is the sum of all autocorrelations with weight 2 on positive lags.",
  },
  {
    id: "ts-069",
    title: "VAR(1) Forecast",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Forecast one step of a VAR(1) model: x_next[i] = c[i] + sum over j of A[i][j] * x_last[j], where c is the intercept vector, A is the coefficient matrix, and x_last is the current state vector.\n\nReturn the forecast vector.",
    starterCode: `def var1_forecast(c, A, x_last):
    # Your code here
    pass`,
    solution: `def var1_forecast(c, A, x_last):
    d = len(c)
    return [c[i] + sum(A[i][j] * x_last[j] for j in range(d)) for i in range(d)]`,
    testCases: [
      { input: [[0.5, 1], [[0.5, 0.1], [0.2, 0.3]], [2, 3]], expected: [1.8, 2.3] },
      { input: [[0, 0], [[1, 0], [0, 1]], [2, 3]], expected: [2, 3] },
      { input: [[1], [[0.5]], [4]], expected: [3.0] },
      { input: [[0, 0, 0], [[1, 2, 3], [4, 5, 6], [7, 8, 9]], [1, 0, -1]], expected: [-2, -2, -2] },
    ],
    hint: "Each output component is a dot product of one matrix row with the state plus its intercept.",
  },
  {
    id: "ts-070",
    title: "Holt-Winters Seasonal Update",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Perform one additive Holt-Winters update step and return [level, trend, seasonal]. Given the old level, trend and seasonal value plus the new observation x: new_level = alpha * (x - seasonal) + (1 - alpha) * (level + trend); new_trend = beta * (new_level - level) + (1 - beta) * trend; new_seasonal = gamma * (x - new_level) + (1 - gamma) * seasonal.\n\nThe level and trend updates use the old level and trend; no forecast is produced.",
    starterCode: `def holt_winters_seasonal_update(level, trend, seasonal, x, alpha, beta, gamma):
    # Your code here
    pass`,
    solution: `def holt_winters_seasonal_update(level, trend, seasonal, x, alpha, beta, gamma):
    l = alpha * (x - seasonal) + (1 - alpha) * (level + trend)
    b = beta * (l - level) + (1 - beta) * trend
    s = gamma * (x - l) + (1 - gamma) * seasonal
    return [l, b, s]`,
    testCases: [
      { input: [10, 0.5, 1.0, 12, 0.5, 0.3, 0.4], expected: [10.75, 0.575, 1.1] },
      { input: [5, 0.2, -0.5, 6, 0.4, 0.3, 0.2], expected: [5.720000000000001, 0.3560000000000002, -0.34400000000000014] },
      { input: [0, 0, 0, 1, 0.5, 0.5, 0.5], expected: [0.5, 0.25, 0.25] },
      { input: [10, 1, 2, 10, 0.2, 0.1, 0.9], expected: [10.4, 0.9400000000000001, -0.16000000000000036] },
    ],
    hint: "Deseasonalize the observation before updating the level.",
  },
  {
    id: "ts-071",
    title: "Additive Seasonal Component",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Estimate an additive seasonal component by averaging deviations from the overall mean per season position. For each position j = 0, ..., period-1 compute the mean of series[j::period] minus the overall mean, then center the component so its entries sum to zero.\n\nReturn an empty list if period is not positive or exceeds the series length.",
    starterCode: `def additive_seasonal_component(series, period):
    # Your code here
    pass`,
    solution: `def additive_seasonal_component(series, period):
    if period <= 0 or not series or period > len(series):
        return []
    overall = sum(series) / len(series)
    comp = []
    for j in range(period):
        vals = series[j::period]
        comp.append(sum(vals) / len(vals) - overall)
    center = sum(comp) / period
    return [c - center for c in comp]`,
    testCases: [
      { input: [[2, 4, 6, 2, 4, 6], 3], expected: [-2.0, 0.0, 2.0] },
      { input: [[1, 3, 5, 2, 4, 6], 3], expected: [-2.0, 0.0, 2.0] },
      { input: [[10, 20, 30, 40], 2], expected: [-5.0, 5.0] },
      { input: [[1, 2, 3], 5], expected: [] },
    ],
    hint: "After centering, the seasonal deviations add up to exactly zero.",
  },
  {
    id: "ts-072",
    title: "Multiplicative Seasonal Indices",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Estimate multiplicative seasonal indices using ratio-to-centered-moving-average. Build a centered moving average with window period (averaging two adjacent moving averages when period is even), then for each season position average series[t] / trend[t] over the positions where the trend is defined.\n\nReturn the period indices, or an empty list if the series is shorter than 2*period or some position has no observations.",
    starterCode: `def multiplicative_seasonal_indices(series, period):
    # Your code here
    pass`,
    solution: `def multiplicative_seasonal_indices(series, period):
    n = len(series)
    if period <= 0 or n < 2 * period:
        return []
    trend = [None] * n
    if period % 2 == 1:
        half = period // 2
        for t in range(half, n - half):
            trend[t] = sum(series[t - half:t + half + 1]) / period
    else:
        half = period // 2
        for t in range(half, n - half):
            trend[t] = (0.5 * series[t - half] + sum(series[t - half + 1:t + half]) + 0.5 * series[t + half]) / period
    ratios = [[] for _ in range(period)]
    for t in range(n):
        if trend[t] is not None and trend[t] != 0:
            ratios[t % period].append(series[t] / trend[t])
    out = []
    for j in range(period):
        if not ratios[j]:
            return []
        out.append(sum(ratios[j]) / len(ratios[j]))
    return out`,
    testCases: [
      { input: [[10, 20, 12, 24, 11, 22], 2], expected: [0.6764705882352942, 1.3212176283507495] },
      { input: [[1, 2, 1, 2, 1, 2], 2], expected: [0.6666666666666666, 1.3333333333333333] },
      { input: [[5, 10, 15, 20, 25, 30], 2], expected: [1.0, 1.0] },
      { input: [[1, 2, 3, 4], 3], expected: [] },
    ],
    hint: "For an even period the centered average gives half weight to the two end points.",
  },
  {
    id: "ts-073",
    title: "Bollinger Band Position",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute where the last price sits inside a Bollinger band built from the last k prices: position = (last - lower) / (upper - lower), with bands mean ± num_std * population standard deviation.\n\nReturn 0.5 when the standard deviation is zero, and None if k is not positive or exceeds the series length.",
    starterCode: `def bollinger_position(prices, k, num_std):
    # Your code here
    pass`,
    solution: `def bollinger_position(prices, k, num_std):
    if k <= 0 or k > len(prices):
        return None
    window = prices[-k:]
    m = sum(window) / k
    sd = (sum((x - m) ** 2 for x in window) / k) ** 0.5
    if sd == 0:
        return 0.5
    upper = m + num_std * sd
    lower = m - num_std * sd
    return (prices[-1] - lower) / (upper - lower)`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 5, 2], expected: 0.8535533905932738 },
      { input: [[5, 5, 5], 3, 2], expected: 0.5 },
      { input: [[1, 2, 3], 0, 2], expected: null },
      { input: [[1, 2, 3], 5, 2], expected: null },
    ],
    hint: "A value of 1.0 means the price sits exactly on the upper band.",
  },
  {
    id: "ts-074",
    title: "RSI Value",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the Relative Strength Index over the last period price changes using simple averages: gain = mean of positive changes, loss = mean of absolute negative changes, RSI = 100 - 100 / (1 + gain/loss).\n\nReturn 100.0 when the average loss is zero, and None if period is not positive or there are not enough prices.",
    starterCode: `def rsi(prices, period):
    # Your code here
    pass`,
    solution: `def rsi(prices, period):
    if period <= 0 or len(prices) < period + 1:
        return None
    changes = [prices[i] - prices[i - 1] for i in range(len(prices) - period, len(prices))]
    gains = sum(c for c in changes if c > 0) / period
    losses = sum(-c for c in changes if c < 0) / period
    if losses == 0:
        return 100.0
    rs = gains / losses
    return 100.0 - 100.0 / (1.0 + rs)`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 2], expected: 100.0 },
      { input: [[5, 4, 3, 2], 2], expected: 0.0 },
      { input: [[10, 11, 10, 12], 2], expected: 66.66666666666666 },
      { input: [[5], 2], expected: null },
    ],
    hint: "RSI above 70 is often read as overbought; below 30 as oversold.",
  },
  {
    id: "ts-075",
    title: "MACD Line",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the MACD line as the difference between the final values of two exponential moving averages of the price series with spans short_span and long_span. Each EMA uses smoothing factor 2 / (span + 1) and is initialized with the first price.\n\nReturn 0.0 for an empty series.",
    starterCode: `def macd_line(prices, short_span, long_span):
    # Your code here
    pass`,
    solution: `def macd_line(prices, short_span, long_span):
    if not prices:
        return 0.0
    a_s = 2.0 / (short_span + 1)
    a_l = 2.0 / (long_span + 1)
    es = prices[0]
    el = prices[0]
    for x in prices[1:]:
        es = a_s * x + (1 - a_s) * es
        el = a_l * x + (1 - a_l) * el
    return es - el`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 2, 3], expected: 0.4436728395061724 },
      { input: [[5, 5, 5], 12, 26], expected: 0.0 },
      { input: [[10], 3, 5], expected: 0 },
      { input: [[10, 9, 8, 7, 6], 2, 4], expected: -0.8117728395061725 },
    ],
    hint: "The shorter EMA reacts faster, so a rising market gives a positive MACD.",
  },
  {
    id: "ts-076",
    title: "Signal Line",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the MACD signal line: build the MACD series from the short and long EMAs, then apply an EMA with span signal_span to that series and return its final value. Each EMA uses smoothing factor 2 / (span + 1) and starts at the first value of its input.\n\nReturn 0.0 for an empty series.",
    starterCode: `def signal_line(prices, short_span, long_span, signal_span):
    # Your code here
    pass`,
    solution: `def signal_line(prices, short_span, long_span, signal_span):
    if not prices:
        return 0.0
    a_s = 2.0 / (short_span + 1)
    a_l = 2.0 / (long_span + 1)
    es = prices[0]
    el = prices[0]
    macd = [es - el]
    for x in prices[1:]:
        es = a_s * x + (1 - a_s) * es
        el = a_l * x + (1 - a_l) * el
        macd.append(es - el)
    a_g = 2.0 / (signal_span + 1)
    g = macd[0]
    for m in macd[1:]:
        g = a_g * m + (1 - a_g) * g
    return g`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 2, 3, 2], expected: 0.4099794238683124 },
      { input: [[5, 5, 5], 12, 26, 9], expected: 0.0 },
      { input: [[10], 3, 5, 2], expected: 0 },
      { input: [[10, 9, 8, 7, 6], 2, 4, 3], expected: -0.6606271604938272 },
    ],
    hint: "Signal-line crossings are the classic MACD trigger events.",
  },
  {
    id: "ts-077",
    title: "Average True Range",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the average true range from high, low, and close lists. For each t >= 1 the true range is the maximum of high[t] - low[t], abs(high[t] - close[t-1]), and abs(low[t] - close[t-1]); return the mean of those true ranges.\n\nReturn 0.0 when fewer than two bars are given.",
    starterCode: `def average_true_range(highs, lows, closes):
    # Your code here
    pass`,
    solution: `def average_true_range(highs, lows, closes):
    if len(highs) < 2:
        return 0.0
    trs = []
    for t in range(1, len(highs)):
        tr = max(highs[t] - lows[t], abs(highs[t] - closes[t - 1]), abs(lows[t] - closes[t - 1]))
        trs.append(tr)
    return sum(trs) / len(trs)`,
    testCases: [
      { input: [[10, 12, 13], [8, 9, 10], [9, 11, 12]], expected: 3.0 },
      { input: [[5, 6, 7, 8], [3, 4, 5, 6], [4, 5, 6, 7]], expected: 2.0 },
      { input: [[5, 6], [4, 5], [5, 6]], expected: 1.0 },
      { input: [[5], [4], [5]], expected: 0.0 },
    ],
    hint: "Gaps make the true range larger than the simple high-minus-low bar range.",
  },
  {
    id: "ts-078",
    title: "Tracking Signal",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the tracking signal as the cumulative forecast error divided by the mean absolute deviation: sum(actual - forecast) / mean(abs(actual - forecast)).\n\nReturn 0.0 when the MAD is zero or the lists are empty.",
    starterCode: `def tracking_signal(actual, forecast):
    # Your code here
    pass`,
    solution: `def tracking_signal(actual, forecast):
    if not actual:
        return 0.0
    errors = [a - f for a, f in zip(actual, forecast)]
    mad = sum(abs(e) for e in errors) / len(errors)
    if mad == 0:
        return 0.0
    return sum(errors) / mad`,
    testCases: [
      { input: [[10, 12, 14], [11, 11, 11]], expected: 1.7999999999999998 },
      { input: [[5, 5], [3, 7]], expected: 0.0 },
      { input: [[1], [1]], expected: 0.0 },
      { input: [[1, 5, 9], [2, 2, 2]], expected: 2.4545454545454546 },
    ],
    hint: "Large absolute tracking signals indicate a biased forecast.",
  },
  {
    id: "ts-079",
    title: "Volatility Autocorrelation",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the lag-k autocorrelation of squared returns, a standard measure of volatility clustering, using the biased 1/n estimator.\n\nReturn 0.0 if k is negative or at least the number of returns, or if the squared returns have zero variance.",
    starterCode: `def volatility_autocorrelation(returns, k):
    # Your code here
    pass`,
    solution: `def volatility_autocorrelation(returns, k):
    n = len(returns)
    if n == 0 or k < 0 or k >= n:
        return 0.0
    squared = [r * r for r in returns]
    m = sum(squared) / n
    g0 = sum((x - m) ** 2 for x in squared) / n
    if g0 == 0:
        return 0.0
    gk = sum((squared[t] - m) * (squared[t + k] - m) for t in range(n - k)) / n
    return gk / g0`,
    testCases: [
      { input: [[0.1, -0.2, 0.1, -0.2], 1], expected: -0.75 },
      { input: [[1, 2, 3], 0], expected: 1.0 },
      { input: [[0, 0], 1], expected: 0.0 },
      { input: [[1, -1, 1, -1, 1], 2], expected: 0.0 },
      { input: [[0.1, -0.2, 0.3, -0.2, 0.1], 2], expected: -0.6794392523364485 },
    ],
    hint: "Square the returns first so negative and positive shocks both count.",
  },
  {
    id: "ts-080",
    title: "ARCH-lite Test Statistic",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the ARCH Lagrange multiplier statistic from a residual series: LM = n * sum over k = 1..h of rho(k)^2, where rho(k) is the biased sample autocorrelation of the squared residuals.\n\nReturn 0.0 for an empty series, h <= 0, or squared residuals with zero variance.",
    starterCode: `def arch_lm_statistic(residuals, h):
    # Your code here
    pass`,
    solution: `def arch_lm_statistic(residuals, h):
    n = len(residuals)
    if n == 0 or h <= 0:
        return 0.0
    squared = [r * r for r in residuals]
    m = sum(squared) / n
    g0 = sum((x - m) ** 2 for x in squared) / n
    if g0 == 0:
        return 0.0
    total = 0.0
    for k in range(1, h + 1):
        if k >= n:
            break
        gk = sum((squared[t] - m) * (squared[t + k] - m) for t in range(n - k)) / n
        rho = gk / g0
        total += rho * rho
    return n * total`,
    testCases: [
      { input: [[1, -1, 1, -1], 1], expected: 0.0 },
      { input: [[1, 2, 1, 2, 1, 2], 1], expected: 4.166666666666667 },
      { input: [[1, 2, 3], 2], expected: 0.710294321810357 },
      { input: [[0, 0, 0], 1], expected: 0.0 },
    ],
    hint: "Under the null of no ARCH effects the statistic is approximately chi-squared with h degrees of freedom.",
  },
  {
    id: "ts-081",
    title: "Z-Normalized Shape Distance",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the Euclidean distance between two series after z-normalizing each: subtract the mean and divide by the population standard deviation (a constant series becomes all zeros).\n\nReturn None if the series have different lengths or are empty.",
    starterCode: `def z_normalized_distance(x, y):
    # Your code here
    pass`,
    solution: `def z_normalized_distance(x, y):
    if len(x) != len(y) or len(x) == 0:
        return None

    def znorm(a):
        m = sum(a) / len(a)
        sd = (sum((v - m) ** 2 for v in a) / len(a)) ** 0.5
        if sd == 0:
            return [0.0] * len(a)
        return [(v - m) / sd for v in a]

    zx = znorm(x)
    zy = znorm(y)
    return sum((a - b) ** 2 for a, b in zip(zx, zy)) ** 0.5`,
    testCases: [
      { input: [[1, 2, 3], [2, 4, 6]], expected: 0.0 },
      { input: [[1, 2, 3, 4], [1, 4, 9, 16]], expected: 0.35356426632003163 },
      { input: [[1, 1, 1], [1, 2, 3]], expected: 1.7320508075688772 },
      { input: [[1, 2, 3], [3, 2, 1]], expected: 3.4641016151377544 },
    ],
    hint: "Z-normalization removes level and scale, leaving only shape.",
  },
  {
    id: "ts-082",
    title: "Durbin-Levinson One Step",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Advance the Durbin-Levinson recursion by one order. Given the previous order coefficients and the autocorrelation list rho = [rho(0), ..., rho(k)] with k = len(coeffs) + 1, compute the reflection coefficient kappa = (rho(k) - sum a_j * rho(k-j)) / (1 - sum a_j * rho(j)), where sums run over j = 1..k-1. Then return the updated coefficients with kappa appended, using a_j - kappa * a_{k-j} for the existing entries.\n\nIf the denominator is zero, use kappa = 0.0.",
    starterCode: `def durbin_levinson_step(coeffs, rho):
    # Your code here
    pass`,
    solution: `def durbin_levinson_step(coeffs, rho):
    prev = list(coeffs)
    k = len(prev) + 1
    num = rho[k] - sum(prev[j - 1] * rho[k - j] for j in range(1, k))
    den = 1.0 - sum(prev[j - 1] * rho[j] for j in range(1, k))
    kappa = 0.0 if den == 0 else num / den
    return [prev[j - 1] - kappa * prev[k - 1 - j] for j in range(1, k)] + [kappa]`,
    testCases: [
      { input: [[], [1, 0.5]], expected: [0.5] },
      { input: [[0.5], [1, 0.5, 0.25]], expected: [0.5, 0.0] },
      { input: [[0.5], [1, 0.5, 0.3]], expected: [0.4666666666666667, 0.06666666666666665] },
      { input: [[0.6], [1, 0.6, 0.3]], expected: [0.65625, -0.09375] },
    ],
    hint: "The appended value is the new reflection coefficient; rho[0] is assumed to be 1.",
  },
  {
    id: "ts-083",
    title: "Levinson-Durbin Coefficients",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Run the Levinson-Durbin recursion to order 2 from an autocovariance list [r0, r1, r2]. With k1 = r1 / r0 and v1 = r0 * (1 - k1^2), set k2 = (r2 - k1 * r1) / v1 (0.0 if v1 is 0), then return [a1, a2, v2] where a1 = k1 * (1 - k2), a2 = k2, and v2 = v1 * (1 - k2^2).\n\nIf r0 is 0 return [0.0, 0.0, 0.0].",
    starterCode: `def levinson_durbin(acf):
    # Your code here
    pass`,
    solution: `def levinson_durbin(acf):
    r0 = acf[0]
    r1 = acf[1]
    r2 = acf[2]
    if r0 == 0:
        return [0.0, 0.0, 0.0]
    k1 = r1 / r0
    v1 = r0 * (1.0 - k1 * k1)
    if v1 == 0:
        k2 = 0.0
    else:
        k2 = (r2 - k1 * r1) / v1
    a1 = k1 - k2 * k1
    v2 = v1 * (1.0 - k2 * k2)
    return [a1, k2, v2]`,
    testCases: [
      { input: [[1, 0.5, 0.25]], expected: [0.5, 0.0, 0.75] },
      { input: [[1, 0.6, 0.3]], expected: [0.65625, -0.09375, 0.634375] },
      { input: [[2, 1, 0.5]], expected: [0.5, 0.0, 1.5] },
      { input: [[1, 0, 0]], expected: [0.0, 0.0, 1.0] },
    ],
    hint: "v2 is the order-2 prediction error variance and shrinks as k2 grows.",
  },
  {
    id: "ts-084",
    title: "Granger F-Statistic Small",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Compute the F statistic comparing restricted and unrestricted regressions: F = ((SSE_r - SSE_u) / q) / (SSE_u / (n_obs - n_params)), where q is the number of restrictions.\n\nReturn 0.0 when SSE_u is 0, q is not positive, or the unrestricted degrees of freedom are not positive.",
    starterCode: `def granger_f(sse_r, sse_u, q, n_obs, n_params):
    # Your code here
    pass`,
    solution: `def granger_f(sse_r, sse_u, q, n_obs, n_params):
    if sse_u == 0 or q <= 0 or n_obs <= n_params:
        return 0.0
    return ((sse_r - sse_u) / q) / (sse_u / (n_obs - n_params))`,
    testCases: [
      { input: [10, 5, 1, 20, 3], expected: 17.0 },
      { input: [12, 10, 1, 30, 3], expected: 5.4 },
      { input: [10, 10, 1, 20, 3], expected: 0.0 },
      { input: [8, 4, 2, 25, 4], expected: 10.5 },
    ],
    hint: "A large F means the restrictions substantially worsen the fit.",
  },
  {
    id: "ts-085",
    title: "VAR Coefficient Estimate",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Estimate a VAR(1) slope coefficient by ordinary least squares, regressing y_current on x_lag: sum((x - mean_x) * (y - mean_y)) / sum((x - mean_x)^2).\n\nReturn 0.0 if the lists are empty, have different lengths, or x_lag is constant.",
    starterCode: `def var1_coefficient_estimate(x_lag, y_current):
    # Your code here
    pass`,
    solution: `def var1_coefficient_estimate(x_lag, y_current):
    n = len(x_lag)
    if n == 0 or n != len(y_current):
        return 0.0
    mx = sum(x_lag) / n
    my = sum(y_current) / n
    den = sum((x - mx) ** 2 for x in x_lag)
    if den == 0:
        return 0.0
    return sum((x - mx) * (y - my) for x, y in zip(x_lag, y_current)) / den`,
    testCases: [
      { input: [[1, 2, 3, 4], [2, 4, 6, 8]], expected: 2.0 },
      { input: [[1, 2, 3, 4], [0, 1, 2, 3]], expected: 1.0 },
      { input: [[1, 1, 1], [2, 3, 4]], expected: 0.0 },
      { input: [[0, 1, 2], [1, 1, 1]], expected: 0.0 },
    ],
    hint: "This is the lag-one cross coefficient of a bivariate VAR.",
  },
  {
    id: "ts-086",
    title: "Approximate Entropy Lite",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Compute approximate entropy with embedding dimension m and tolerance r. For each length mm in {m, m+1} form all overlapping templates and compute C_i = (number of templates within Chebyshev distance r of template i) / (number of templates), counting self-matches; phi(mm) is the mean of log(C_i). The result is phi(m) - phi(m+1).\n\nReturn 0.0 if m < 1 or the series is shorter than m + 2.",
    starterCode: `import math
def approximate_entropy(series, m, r):
    # Your code here
    pass`,
    solution: `import math
def approximate_entropy(series, m, r):
    n = len(series)
    if m < 1 or n < m + 2:
        return 0.0

    def phi(mm):
        count_i = n - mm + 1
        total = 0.0
        for i in range(count_i):
            c = 0
            for j in range(count_i):
                if max(abs(series[i + k] - series[j + k]) for k in range(mm)) <= r:
                    c += 1
            total += math.log(c / count_i)
        return total / count_i

    return phi(m) - phi(m + 1)`,
    testCases: [
      { input: [[1, 2, 1, 2, 1, 2], 2, 0], expected: 0.020135513550688988 },
      { input: [[1, 2, 3, 4, 5], 1, 0], expected: -0.2231435513142097 },
      { input: [[3, 3, 3, 3], 2, 0], expected: 0.0 },
      { input: [[1, 2, 1, 2, 1, 2], 1, 1], expected: 0.0 },
    ],
    hint: "Small approximate entropy means the series is highly predictable.",
  },
  {
    id: "ts-087",
    title: "Sample Entropy Small",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Compute sample entropy with embedding dimension m and tolerance r, excluding self-matches: SampEn = -ln(A / B), where B is the number of matching template pairs of length m and A the number of matching pairs of length m+1, using Chebyshev distance <= r.\n\nReturn 0.0 if m < 1, the series is shorter than m + 2, or either count is zero.",
    starterCode: `import math
def sample_entropy(series, m, r):
    # Your code here
    pass`,
    solution: `import math
def sample_entropy(series, m, r):
    n = len(series)
    if m < 1 or n < m + 2:
        return 0.0

    def matches(mm):
        count = 0
        for i in range(n - mm):
            for j in range(i + 1, n - mm):
                if max(abs(series[i + k] - series[j + k]) for k in range(mm)) <= r:
                    count += 1
        return count

    b = matches(m)
    a = matches(m + 1)
    if b == 0 or a == 0:
        return 0.0
    return -math.log(a / b)`,
    testCases: [
      { input: [[1, 2, 1, 2, 1, 2], 2, 0], expected: 0.6931471805599453 },
      { input: [[3, 3, 3, 3, 3], 2, 0], expected: 1.0986122886681098 },
      { input: [[1, 2, 3, 4, 5, 6], 1, 1], expected: 0.2876820724517809 },
      { input: [[1, 2, 1, 2, 1, 2, 1, 2], 2, 0], expected: 0.40546510810816444 },
    ],
    hint: "SampEn increases when longer patterns stop repeating.",
  },
  {
    id: "ts-088",
    title: "Permutation Entropy Small",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Compute normalized permutation entropy. For every window of order points spaced by delay, record the rank order pattern (ties broken by index) and build its empirical distribution; return the Shannon entropy of those patterns divided by log(order!).\n\nReturn 0.0 if order < 2, delay < 1, or the series has fewer than (order - 1) * delay + 1 points.",
    starterCode: `import math
def permutation_entropy(series, order, delay):
    # Your code here
    pass`,
    solution: `import math
def permutation_entropy(series, order, delay):
    n = len(series)
    if order < 2 or delay < 1 or n < (order - 1) * delay + 1:
        return 0.0
    patterns = {}
    total = 0
    for i in range(n - (order - 1) * delay):
        idx = [i + j * delay for j in range(order)]
        vals = [series[k] for k in idx]
        perm = tuple(sorted(range(order), key=lambda j: (vals[j], j)))
        patterns[perm] = patterns.get(perm, 0) + 1
        total += 1
    entropy = 0.0
    for c in patterns.values():
        p = c / total
        entropy -= p * math.log(p)
    return entropy / math.log(math.factorial(order))`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 2, 1], expected: 0.0 },
      { input: [[1, 2, 1, 2, 1, 2], 2, 1], expected: 0.9709505944546688 },
      { input: [[3, 3, 3, 3], 2, 1], expected: 0.0 },
      { input: [[5, 4, 3, 2, 1], 3, 1], expected: 0.0 },
    ],
    hint: "Monotone series produce a single ordinal pattern, so entropy is zero.",
  },
  {
    id: "ts-089",
    title: "DTW Distance Small",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Compute the dynamic time warping distance between two series using absolute difference cost and the recurrence D[i][j] = |x[i-1] - y[j-1]| + min(D[i-1][j], D[i][j-1], D[i-1][j-1]).\n\nReturn the final accumulated cost, or 0.0 if either series is empty.",
    starterCode: `def dtw_distance(x, y):
    # Your code here
    pass`,
    solution: `def dtw_distance(x, y):
    n = len(x)
    m = len(y)
    if n == 0 or m == 0:
        return 0.0
    inf = float("inf")
    prev = [inf] * (m + 1)
    prev[0] = 0.0
    for i in range(1, n + 1):
        cur = [inf] * (m + 1)
        for j in range(1, m + 1):
            cost = abs(x[i - 1] - y[j - 1])
            cur[j] = cost + min(prev[j], cur[j - 1], prev[j - 1])
        prev = cur
    return prev[m]`,
    testCases: [
      { input: [[1, 2, 3], [1, 2, 3]], expected: 0.0 },
      { input: [[1, 2, 3], [2, 2, 2]], expected: 2.0 },
      { input: [[1, 2, 3], [1, 3]], expected: 1.0 },
      { input: [[1, 2], [1, 2, 3]], expected: 1.0 },
    ],
    hint: "DTW can stretch or compress the time axis, so warped series still match cheaply.",
  },
  {
    id: "ts-090",
    title: "Seasonal Strength Measure",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Measure seasonal strength from a centered-moving-average decomposition. Detrend the series with a centered moving average of length period, average the detrended values per season position and center them, then form residuals. Return max(0, 1 - Var(residual) / Var(detrended)), using population variances.\n\nReturn 0.0 if period is not positive, the series is shorter than 2*period, or the detrended variance is zero.",
    starterCode: `def seasonal_strength(series, period):
    # Your code here
    pass`,
    solution: `def seasonal_strength(series, period):
    n = len(series)
    if period <= 0 or n < 2 * period:
        return 0.0
    trend = [None] * n
    if period % 2 == 1:
        half = period // 2
        for t in range(half, n - half):
            trend[t] = sum(series[t - half:t + half + 1]) / period
    else:
        half = period // 2
        for t in range(half, n - half):
            trend[t] = (0.5 * series[t - half] + sum(series[t - half + 1:t + half]) + 0.5 * series[t + half]) / period
    detrended = []
    positions = []
    for t in range(n):
        if trend[t] is not None:
            detrended.append(series[t] - trend[t])
            positions.append(t % period)
    seasonal = [0.0] * period
    counts = [0] * period
    for idx, p in enumerate(positions):
        seasonal[p] += detrended[idx]
        counts[p] += 1
    for j in range(period):
        if counts[j] > 0:
            seasonal[j] /= counts[j]
    center = sum(seasonal) / period
    seasonal = [s - center for s in seasonal]
    residuals = [detrended[i] - seasonal[positions[i]] for i in range(len(detrended))]

    def variance(vals):
        if not vals:
            return 0.0
        m = sum(vals) / len(vals)
        return sum((v - m) ** 2 for v in vals) / len(vals)

    var_r = variance(residuals)
    var_sr = variance(detrended)
    if var_sr == 0:
        return 0.0
    strength = 1.0 - var_r / var_sr
    if strength < 0:
        return 0.0
    return strength`,
    testCases: [
      { input: [[1, 5, 1, 5, 1, 5, 1, 5], 2], expected: 1.0 },
      { input: [[1, 2, 1, 2, 1, 2], 2], expected: 1.0 },
      { input: [[1, 2, 3, 4, 5, 6], 2], expected: 0.0 },
      { input: [[10, 10, 10, 10, 10, 10], 3], expected: 0.0 },
      { input: [[2, 4, 6, 8], 2], expected: 0.0 },
    ],
    hint: "A strength near 1 means the seasonal component explains almost all of the variation.",
  },
];
