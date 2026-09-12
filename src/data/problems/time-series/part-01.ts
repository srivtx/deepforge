import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "ts-001",
    title: "Mean Absolute Change",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Given a numeric series, compute the mean absolute change between consecutive observations: the mean of abs(x[t] - x[t-1]).\n\nReturn 0.0 if the series contains fewer than two observations.",
    starterCode: `def mean_absolute_change(series):
    # Your code here
    pass`,
    solution: `def mean_absolute_change(series):
    if len(series) < 2:
        return 0.0
    total = sum(abs(series[i + 1] - series[i]) for i in range(len(series) - 1))
    return total / (len(series) - 1)`,
    testCases: [
      { input: [[1, 3, 6, 10]], expected: 3.0 },
      { input: [[5, 5, 5]], expected: 0.0 },
      { input: [[10, 7, 9]], expected: 2.5 },
      { input: [[4]], expected: 0.0 },
    ],
    hint: "Average the absolute step sizes, not the signed changes.",
  },
  {
    id: "ts-002",
    title: "First Difference Series",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Return the first differences of a series as a list: [x[1] - x[0], x[2] - x[1], ...].\n\nA series with fewer than two elements produces an empty list. This is the basic operation that removes a linear trend.",
    starterCode: `def first_differences(series):
    # Your code here
    pass`,
    solution: `def first_differences(series):
    return [series[i + 1] - series[i] for i in range(len(series) - 1)]`,
    testCases: [
      { input: [[1, 3, 6, 10]], expected: [2, 3, 4] },
      { input: [[5]], expected: [] },
      { input: [[0, -2, 0]], expected: [-2, 2] },
      { input: [[2, 2]], expected: [0] },
    ],
    hint: "Loop over adjacent index pairs.",
  },
  {
    id: "ts-003",
    title: "Lag Operator Value",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "The lag operator L moves a series back in time: applying L^k to x[t] gives x[t-k]. Given the series, an index t, and a non-negative lag k, return the value x[t-k].\n\nIf the lagged index falls outside the series, return None.",
    starterCode: `def lag_value(series, t, k):
    # Your code here
    pass`,
    solution: `def lag_value(series, t, k):
    idx = t - k
    if idx < 0 or idx >= len(series):
        return None
    return series[idx]`,
    testCases: [
      { input: [[10, 20, 30, 40], 3, 1], expected: 30 },
      { input: [[10, 20, 30], 2, 2], expected: 10 },
      { input: [[1, 2, 3], 0, 1], expected: null },
      { input: [[5, 6, 7], 1, 0], expected: 6 },
    ],
    hint: "Guard the shifted index before indexing to avoid Python's negative wraparound.",
  },
  {
    id: "ts-004",
    title: "Lag-k Series",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Return the lag-k series, i.e. the values x[t-k] for t = k, ..., n-1. The result is the original series shifted down by k positions and is therefore k elements shorter.\n\nReturn an empty list if k is negative or k is not smaller than the series length; k = 0 returns a copy of the series.",
    starterCode: `def lag_series(series, k):
    # Your code here
    pass`,
    solution: `def lag_series(series, k):
    if k < 0 or k > len(series):
        return []
    return [series[t - k] for t in range(k, len(series))]`,
    testCases: [
      { input: [[1, 2, 3, 4], 1], expected: [1, 2, 3] },
      { input: [[1, 2, 3, 4], 2], expected: [1, 2] },
      { input: [[1, 2, 3], 3], expected: [] },
      { input: [[9, 8, 7, 6, 5], 0], expected: [9, 8, 7, 6, 5] },
    ],
    hint: "The first k output values are the first n - k inputs.",
  },
  {
    id: "ts-005",
    title: "Expanding Mean",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the expanding (cumulative) mean of a series. The output at position i is the mean of the first i + 1 observations: sum(x[0:i+1]) / (i + 1).\n\nAn empty series yields an empty list.",
    starterCode: `def expanding_mean(series):
    # Your code here
    pass`,
    solution: `def expanding_mean(series):
    out = []
    total = 0.0
    for i, x in enumerate(series):
        total += x
        out.append(total / (i + 1))
    return out`,
    testCases: [
      { input: [[1, 2, 3, 4]], expected: [1.0, 1.5, 2.0, 2.5] },
      { input: [[5]], expected: [5.0] },
      { input: [[2, 4, 6]], expected: [2.0, 3.0, 4.0] },
      { input: [[]], expected: [] },
    ],
    hint: "Keep a running total instead of recomputing the sum each step.",
  },
  {
    id: "ts-006",
    title: "Seasonal Naive Forecast",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "The seasonal naive forecast predicts the next value with the observation from one full season ago: forecast = series[-season_length].\n\nReturn None if season_length is not positive or exceeds the series length.",
    starterCode: `def seasonal_naive_forecast(series, season_length):
    # Your code here
    pass`,
    solution: `def seasonal_naive_forecast(series, season_length):
    if season_length <= 0 or len(series) < season_length:
        return None
    return series[-season_length]`,
    testCases: [
      { input: [[10, 20, 30, 40, 50, 60], 4], expected: 30 },
      { input: [[1, 2, 3, 4], 1], expected: 4 },
      { input: [[5, 7, 9], 3], expected: 5 },
      { input: [[1, 2], 5], expected: null },
    ],
    hint: "Python's negative indexing does the work once you validate the inputs.",
  },
  {
    id: "ts-007",
    title: "Log Transform Series",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Apply the natural logarithm elementwise to a series, a standard variance-stabilizing transform for data that grows multiplicatively.\n\nReturn 0.0 for any non-positive value, since the logarithm is undefined there.",
    starterCode: `import math
def log_transform(series):
    # Your code here
    pass`,
    solution: `import math
def log_transform(series):
    return [math.log(x) if x > 0 else 0.0 for x in series]`,
    testCases: [
      { input: [[1, 10, 100]], expected: [0.0, 2.302585092994046, 4.605170185988092] },
      { input: [[0, 1]], expected: [0.0, 0.0] },
      { input: [[2.718281828459045]], expected: [1.0] },
      { input: [[0.5]], expected: [-0.6931471805599453] },
    ],
    hint: "Import the math module and guard against x <= 0.",
  },
  {
    id: "ts-008",
    title: "Square Root Transform",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Apply the square root transform elementwise to a series. This is the Box-Cox transform with lambda = 0.5 and is used to tame increasing variance.\n\nCompute x ** 0.5 and return 0.0 for negative values.",
    starterCode: `def sqrt_transform(series):
    # Your code here
    pass`,
    solution: `def sqrt_transform(series):
    return [x ** 0.5 if x >= 0 else 0.0 for x in series]`,
    testCases: [
      { input: [[1, 4, 9]], expected: [1.0, 2.0, 3.0] },
      { input: [[0, 16]], expected: [0.0, 4.0] },
      { input: [[2]], expected: [1.4142135623730951] },
      { input: [[-4, 9]], expected: [0.0, 3.0] },
    ],
    hint: "Use the power operator instead of math.sqrt to keep it simple.",
  },
  {
    id: "ts-009",
    title: "Persistence Forecast",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "The persistence (naive) forecast assumes every future value equals the last observed value. Return a list containing series[-1] repeated horizon times.\n\nReturn an empty list when the series is empty or horizon is not positive.",
    starterCode: `def persistence_forecast(series, horizon):
    # Your code here
    pass`,
    solution: `def persistence_forecast(series, horizon):
    if not series or horizon <= 0:
        return []
    return [series[-1]] * horizon`,
    testCases: [
      { input: [[3, 5, 7], 3], expected: [7, 7, 7] },
      { input: [[2], 2], expected: [2, 2] },
      { input: [[], 2], expected: [] },
      { input: [[1, 2], 0], expected: [] },
    ],
    hint: "This is the benchmark any real forecast must beat.",
  },
  {
    id: "ts-010",
    title: "Forecast Error Series",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Given paired lists of actual values and forecasts, return the one-step forecast errors actual[t] - forecast[t] as a list.\n\nThe lists are assumed to be aligned and of equal length; zip truncates to the shorter one.",
    starterCode: `def forecast_errors(actual, forecast):
    # Your code here
    pass`,
    solution: `def forecast_errors(actual, forecast):
    return [a - f for a, f in zip(actual, forecast)]`,
    testCases: [
      { input: [[10, 12, 14], [11, 11, 11]], expected: [-1, 1, 3] },
      { input: [[5], [5]], expected: [0] },
      { input: [[1, 2, 3], [3, 2, 1]], expected: [-2, 0, 2] },
    ],
    hint: "Positive errors mean the actual value came in above the forecast.",
  },
  {
    id: "ts-011",
    title: "Mean Absolute Error",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the mean absolute error between actual values and forecasts: (1/n) * sum(abs(actual[t] - forecast[t])).\n\nReturn 0.0 when the actual list is empty.",
    starterCode: `def mean_absolute_error(actual, forecast):
    # Your code here
    pass`,
    solution: `def mean_absolute_error(actual, forecast):
    if not actual:
        return 0.0
    return sum(abs(a - f) for a, f in zip(actual, forecast)) / len(actual)`,
    testCases: [
      { input: [[10, 12, 14], [11, 11, 11]], expected: 1.6666666666666667 },
      { input: [[5, 5], [3, 7]], expected: 2.0 },
      { input: [[1], [1]], expected: 0.0 },
      { input: [[1, 2, 3, 4], [2, 2, 2, 2]], expected: 1.0 },
    ],
    hint: "Take absolute values before averaging so positive and negative errors cannot cancel.",
  },
  {
    id: "ts-012",
    title: "Root Mean Squared Error",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the root mean squared error between actual values and forecasts: sqrt((1/n) * sum((actual[t] - forecast[t])^2)).\n\nReturn 0.0 when the actual list is empty.",
    starterCode: `def root_mean_squared_error(actual, forecast):
    # Your code here
    pass`,
    solution: `def root_mean_squared_error(actual, forecast):
    if not actual:
        return 0.0
    return (sum((a - f) ** 2 for a, f in zip(actual, forecast)) / len(actual)) ** 0.5`,
    testCases: [
      { input: [[10, 12, 14], [11, 11, 11]], expected: 1.9148542155126762 },
      { input: [[0, 0], [3, 4]], expected: 3.5355339059327378 },
      { input: [[1, 2], [1, 2]], expected: 0.0 },
    ],
    hint: "Square the errors, average, then take the square root. Large errors dominate.",
  },
  {
    id: "ts-013",
    title: "Log Returns",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Given a price series, return the log returns r[t] = ln(prices[t] / prices[t-1]) for t = 1, ..., n-1.\n\nPrices are assumed positive. A series with fewer than two prices yields an empty list.",
    starterCode: `import math
def log_returns(prices):
    # Your code here
    pass`,
    solution: `import math
def log_returns(prices):
    return [math.log(prices[i] / prices[i - 1]) for i in range(1, len(prices))]`,
    testCases: [
      {
        input: [[100, 110, 121]],
        expected: [0.09531017980432493, 0.09531017980432493],
      },
      { input: [[1, 2.718281828459045]], expected: [1.0] },
      { input: [[5, 5]], expected: [0.0] },
      { input: [[2]], expected: [] },
    ],
    hint: "Import math and divide consecutive prices before taking the log.",
  },
  {
    id: "ts-014",
    title: "Cumulative Return",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the simple cumulative return over a price path: prices[-1] / prices[0] - 1.\n\nReturn 0.0 when there are fewer than two prices or the first price is 0.0.",
    starterCode: `def cumulative_return(prices):
    # Your code here
    pass`,
    solution: `def cumulative_return(prices):
    if len(prices) < 2 or prices[0] == 0:
        return 0.0
    return prices[-1] / prices[0] - 1.0`,
    testCases: [
      { input: [[100, 150]], expected: 0.5 },
      { input: [[100, 50]], expected: -0.5 },
      { input: [[10]], expected: 0.0 },
      { input: [[2, 4, 8]], expected: 3.0 },
    ],
    hint: "Only the first and last prices matter.",
  },
  {
    id: "ts-015",
    title: "Realized Volatility",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute realized volatility from a list of returns as sqrt(sum(r^2)), i.e. the square root of the sum of squared returns with no mean subtraction.\n\nReturn 0.0 for an empty return list.",
    starterCode: `def realized_volatility(returns):
    # Your code here
    pass`,
    solution: `def realized_volatility(returns):
    return sum(r * r for r in returns) ** 0.5`,
    testCases: [
      { input: [[0.01, -0.02, 0.03]], expected: 0.03741657386773942 },
      { input: [[0.1]], expected: 0.1 },
      { input: [[0, 0]], expected: 0.0 },
      { input: [[-0.05, 0.05]], expected: 0.07071067811865477 },
    ],
    hint: "Squaring makes negative returns count the same as positive ones.",
  },
  {
    id: "ts-016",
    title: "AR(1) Stationarity Condition",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "An AR(1) process x[t] = c + phi * x[t-1] + e[t] is stationary exactly when abs(phi) < 1. Return True when that condition holds and False otherwise.\n\nThis guarantees the effect of past shocks decays geometrically instead of accumulating.",
    starterCode: `def is_stationary_ar1(phi):
    # Your code here
    pass`,
    solution: `def is_stationary_ar1(phi):
    return abs(phi) < 1`,
    testCases: [
      { input: [0.5], expected: true },
      { input: [-0.9], expected: true },
      { input: [1.0], expected: false },
      { input: [1.2], expected: false },
      { input: [-1.0], expected: false },
    ],
    hint: "The boundary abs(phi) = 1 is a random walk and is not stationary.",
  },
  {
    id: "ts-017",
    title: "Rolling Mean Window k",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the simple moving average of a series with window size k. Each output is the mean of a contiguous window, so the result has len(series) - k + 1 entries.\n\nReturn an empty list if k is not positive or k is larger than the series.",
    starterCode: `def rolling_mean(series, k):
    # Your code here
    pass`,
    solution: `def rolling_mean(series, k):
    if k <= 0 or k > len(series):
        return []
    return [sum(series[i:i + k]) / k for i in range(len(series) - k + 1)]`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 3], expected: [2.0, 3.0, 4.0] },
      { input: [[1, 2], 1], expected: [1.0, 2.0] },
      { input: [[1, 2, 3], 3], expected: [2.0] },
      { input: [[1, 2], 0], expected: [] },
    ],
    hint: "Slice the series from i to i + k for each window start.",
  },
  {
    id: "ts-018",
    title: "Rolling Median",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the rolling median of a series with window size k, which is far more robust to spikes than a rolling mean. Sort each window; for odd k take the middle value, for even k average the two middle values.\n\nReturn an empty list if k is not positive or k is larger than the series.",
    starterCode: `def rolling_median(series, k):
    # Your code here
    pass`,
    solution: `def rolling_median(series, k):
    if k <= 0 or k > len(series):
        return []
    out = []
    for i in range(len(series) - k + 1):
        w = sorted(series[i:i + k])
        if k % 2 == 1:
            out.append(float(w[k // 2]))
        else:
            out.append((w[k // 2 - 1] + w[k // 2]) / 2.0)
    return out`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 3], expected: [2.0, 3.0, 4.0] },
      { input: [[4, 2, 7, 1], 2], expected: [3.0, 4.5, 4.0] },
      { input: [[5], 1], expected: [5.0] },
      { input: [[3, 1, 2], 3], expected: [2.0] },
    ],
    hint: "Two middle indices for even windows: k//2 - 1 and k//2.",
  },
  {
    id: "ts-019",
    title: "Rolling Maximum",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the rolling maximum of a series with window size k: each output is max(series[i:i+k]) for i = 0, ..., n-k.\n\nReturn an empty list if k is not positive or k is larger than the series. A rolling maximum tracks the highest level reached recently.",
    starterCode: `def rolling_max(series, k):
    # Your code here
    pass`,
    solution: `def rolling_max(series, k):
    if k <= 0 or k > len(series):
        return []
    return [max(series[i:i + k]) for i in range(len(series) - k + 1)]`,
    testCases: [
      { input: [[1, 3, 2, 5, 4], 3], expected: [3, 5, 5] },
      { input: [[2, 2, 2], 2], expected: [2, 2] },
      { input: [[1], 1], expected: [1] },
      { input: [[1, 2], 5], expected: [] },
    ],
    hint: "The maximum over [i, i+k) can be recomputed directly for these sizes.",
  },
  {
    id: "ts-020",
    title: "Weighted Moving Average",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute a weighted moving average where weights[0] applies to the most recent value of each window. For the window ending at index i the output is sum(weights[j] * x[i-j]) / sum(weights).\n\nReturn an empty list if weights is empty, longer than the series, or sums to zero. The output length is len(series) - len(weights) + 1.",
    starterCode: `def weighted_moving_average(series, weights):
    # Your code here
    pass`,
    solution: `def weighted_moving_average(series, weights):
    k = len(weights)
    if k == 0 or k > len(series):
        return []
    wsum = sum(weights)
    if wsum == 0:
        return []
    out = []
    for i in range(k - 1, len(series)):
        w = series[i - k + 1:i + 1]
        out.append(sum(weights[j] * w[k - 1 - j] for j in range(k)) / wsum)
    return out`,
    testCases: [
      { input: [[1, 2, 3, 4], [0.5, 0.5]], expected: [1.5, 2.5, 3.5] },
      { input: [[10, 20, 30], [1, 3]], expected: [12.5, 22.5] },
      { input: [[5], [2]], expected: [5.0] },
      { input: [[1, 2, 3], [1, 1, 1, 1]], expected: [] },
    ],
    hint: "Reverse the window when pairing it with the newest-first weights.",
  },
  {
    id: "ts-021",
    title: "Simple Exponential Smoothing",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Apply simple exponential smoothing with smoothing factor alpha. Initialize the level to the first observation and update s[t] = alpha * x[t] + (1 - alpha) * s[t-1] for each later observation.\n\nReturn the full list of smoothed levels beginning with the initial level. An empty series gives an empty list.",
    starterCode: `def simple_exponential_smoothing(series, alpha):
    # Your code here
    pass`,
    solution: `def simple_exponential_smoothing(series, alpha):
    if not series:
        return []
    s = series[0]
    out = [s]
    for x in series[1:]:
        s = alpha * x + (1 - alpha) * s
        out.append(s)
    return out`,
    testCases: [
      { input: [[1, 2, 3, 4], 0.5], expected: [1, 1.5, 2.25, 3.125] },
      { input: [[5, 5, 5], 0.3], expected: [5, 5.0, 5.0] },
      { input: [[10], 0.7], expected: [10] },
      { input: [[2, 4, 6], 1.0], expected: [2, 4.0, 6.0] },
    ],
    hint: "Each new level is a convex blend of the newest observation and the old level.",
  },
  {
    id: "ts-022",
    title: "SES One-Step Forecast",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Return the one-step-ahead forecast produced by simple exponential smoothing, which is the final level after processing the whole series: s[t] = alpha * x[t] + (1 - alpha) * s[t-1] with s[0] = x[0].\n\nReturn 0.0 for an empty series.",
    starterCode: `def ses_forecast(series, alpha):
    # Your code here
    pass`,
    solution: `def ses_forecast(series, alpha):
    if not series:
        return 0.0
    s = series[0]
    for x in series[1:]:
        s = alpha * x + (1 - alpha) * s
    return s`,
    testCases: [
      { input: [[1, 2, 3, 4], 0.5], expected: 3.125 },
      { input: [[5, 5, 5], 0.3], expected: 5.0 },
      { input: [[10], 0.7], expected: 10 },
      { input: [[2, 4, 6], 1.0], expected: 6.0 },
    ],
    hint: "No recursion needed: just fold the series into a single running level.",
  },
  {
    id: "ts-023",
    title: "SES Alpha Fit Grid",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Select the smoothing factor from a candidate grid that minimizes the one-step-ahead sum of squared errors. For each alpha initialize the level at x[0], then for t >= 1 accumulate (x[t] - s[t-1])^2 and update the level.\n\nReturn [best_alpha, best_sse]. If several alphas tie, keep the earliest candidate in the grid.",
    starterCode: `def ses_alpha_fit(series, alphas):
    # Your code here
    pass`,
    solution: `def ses_alpha_fit(series, alphas):
    best_alpha = alphas[0]
    best_sse = None
    for a in alphas:
        s = series[0]
        sse = 0.0
        for x in series[1:]:
            sse += (x - s) ** 2
            s = a * x + (1 - a) * s
        if best_sse is None or sse < best_sse - 1e-12:
            best_sse = sse
            best_alpha = a
    if best_sse is None:
        return [best_alpha, 0.0]
    return [best_alpha, best_sse]`,
    testCases: [
      { input: [[1, 2, 3, 4], [0.1, 0.5, 0.9]], expected: [0.9, 3.4421] },
      { input: [[5, 5, 5], [0.1, 0.5, 0.9]], expected: [0.1, 0.0] },
      { input: [[1, 3, 5, 7], [0.2, 0.8]], expected: [0.8, 15.9104] },
      { input: [[10], [0.3]], expected: [0.3, 0.0] },
    ],
    hint: "The forecast for x[t] is the level computed before seeing x[t].",
  },
  {
    id: "ts-024",
    title: "Double Exponential Smoothing",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Apply Holt's double exponential smoothing and return [level, trend]. Initialize level = x[0] and trend = x[1] - x[0], then for each later x[t] compute new_level = alpha * x[t] + (1 - alpha) * (level + trend) and new_trend = beta * (new_level - level) + (1 - beta) * trend.\n\nA single-element series returns [x[0], 0.0] and an empty series returns [0.0, 0.0].",
    starterCode: `def double_exponential_smoothing(series, alpha, beta):
    # Your code here
    pass`,
    solution: `def double_exponential_smoothing(series, alpha, beta):
    if not series:
        return [0.0, 0.0]
    if len(series) == 1:
        return [float(series[0]), 0.0]
    l = series[0]
    b = series[1] - series[0]
    for x in series[1:]:
        prev = l
        l = alpha * x + (1 - alpha) * (l + b)
        b = beta * (l - prev) + (1 - beta) * b
    return [l, b]`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 0.5, 0.5], expected: [5.0, 1.0] },
      { input: [[10, 12, 14, 16], 0.3, 0.2], expected: [16.0, 2.0] },
      { input: [[10], 0.5, 0.5], expected: [10.0, 0.0] },
      { input: [[2, 4], 0.5, 0.5], expected: [4.0, 2.0] },
    ],
    hint: "Update the level first, then use the fresh level to update the trend.",
  },
  {
    id: "ts-025",
    title: "Holt Forecast",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Fit Holt's linear trend model with double exponential smoothing and forecast h steps ahead as level + h * trend. Seed the states with level = x[0] and trend = x[1] - x[0], and use the usual updates new_level = alpha * x[t] + (1 - alpha) * (level + trend) and new_trend = beta * (new_level - level) + (1 - beta) * trend.\n\nA single-element series returns x[0]; an empty series returns 0.0.",
    starterCode: `def holt_forecast(series, alpha, beta, h):
    # Your code here
    pass`,
    solution: `def holt_forecast(series, alpha, beta, h):
    if not series:
        return 0.0
    if len(series) == 1:
        return float(series[0])
    l = series[0]
    b = series[1] - series[0]
    for x in series[1:]:
        prev = l
        l = alpha * x + (1 - alpha) * (l + b)
        b = beta * (l - prev) + (1 - beta) * b
    return l + h * b`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 0.5, 0.5, 1], expected: 6.0 },
      { input: [[1, 2, 3, 4, 5], 0.5, 0.5, 2], expected: 7.0 },
      { input: [[10, 12, 14, 16], 0.3, 0.2, 1], expected: 18.0 },
      { input: [[10, 12, 14, 16], 0.5, 0.5, 3], expected: 22.0 },
    ],
    hint: "Extrapolate the trend linearly: each extra step adds one more b.",
  },
  {
    id: "ts-026",
    title: "Seasonal Indices Simple Average",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Estimate multiplicative seasonal indices by simple averaging. Compute the overall mean, then for each season position j = 0, ..., period-1 average the values whose indices are congruent to j modulo period, and divide that average by the overall mean.\n\nReturn the list of period indices. Return an empty list if period is not positive or exceeds the series length; if the overall mean is exactly 0.0 return a list of period zeros.",
    starterCode: `def seasonal_indices(series, period):
    # Your code here
    pass`,
    solution: `def seasonal_indices(series, period):
    if period <= 0 or period > len(series):
        return []
    overall = sum(series) / len(series)
    if overall == 0:
        return [0.0] * period
    out = []
    for s in range(period):
        vals = series[s::period]
        out.append(sum(vals) / len(vals) / overall)
    return out`,
    testCases: [
      { input: [[2, 4, 6, 2, 4, 6], 3], expected: [0.5, 1.0, 1.5] },
      {
        input: [[1, 3, 5, 2, 4, 6], 3],
        expected: [0.42857142857142855, 1.0, 1.5714285714285714],
      },
      { input: [[1, 2, 3, 4], 2], expected: [0.8, 1.2] },
      { input: [[1, 2, 3], 5], expected: [] },
    ],
    hint: "Python slicing with a step of period gives one season position at a time.",
  },
  {
    id: "ts-027",
    title: "Detrend by Differencing",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Detrend a series with lag-lag differencing: y[t] = x[t] - x[t-lag] for t = lag, ..., n-1. Lag 1 removes a linear trend while lag m removes a repeating seasonal pattern of length m.\n\nReturn an empty list when lag is not positive or lag is at least the series length.",
    starterCode: `def difference_lag(series, lag):
    # Your code here
    pass`,
    solution: `def difference_lag(series, lag):
    if lag <= 0 or lag >= len(series):
        return []
    return [series[t] - series[t - lag] for t in range(lag, len(series))]`,
    testCases: [
      { input: [[1, 4, 9, 16], 1], expected: [3, 5, 7] },
      { input: [[1, 4, 9, 16], 2], expected: [8, 12] },
      { input: [[5, 5, 5], 1], expected: [0, 0] },
      { input: [[1, 2, 3], 5], expected: [] },
    ],
    hint: "Subtract the value lag positions earlier from each current value.",
  },
  {
    id: "ts-028",
    title: "Autocovariance Lag k",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the sample autocovariance at lag k using the biased 1/n denominator: gamma(k) = (1/n) * sum over t = 0, ..., n-k-1 of (x[t] - mean) * (x[t+k] - mean).\n\nReturn 0.0 if k is negative or k is at least n.",
    starterCode: `def autocovariance(series, k):
    # Your code here
    pass`,
    solution: `def autocovariance(series, k):
    n = len(series)
    if n == 0 or k < 0 or k >= n:
        return 0.0
    m = sum(series) / n
    return sum((series[t] - m) * (series[t + k] - m) for t in range(n - k)) / n`,
    testCases: [
      { input: [[1, 2, 3, 4], 0], expected: 1.25 },
      { input: [[1, 2, 3, 4], 1], expected: 0.3125 },
      { input: [[1, 2, 3, 4], 2], expected: -0.375 },
      { input: [[1, 2, 3, 4], 4], expected: 0.0 },
    ],
    hint: "Always divide by the full length n, not by n - k; that is the biased estimator.",
  },
  {
    id: "ts-029",
    title: "Autocorrelation Lag k",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the sample autocorrelation at lag k as the ratio of autocovariances: rho(k) = gamma(k) / gamma(0), using the biased 1/n autocovariance.\n\nReturn 0.0 if k is out of range or the series has zero variance. For a non-constant series rho(0) equals 1.0.",
    starterCode: `def autocorrelation(series, k):
    # Your code here
    pass`,
    solution: `def autocorrelation(series, k):
    n = len(series)
    if n == 0 or k < 0 or k >= n:
        return 0.0
    m = sum(series) / n
    g0 = sum((x - m) ** 2 for x in series) / n
    if g0 == 0:
        return 0.0
    gk = sum((series[t] - m) * (series[t + k] - m) for t in range(n - k)) / n
    return gk / g0`,
    testCases: [
      { input: [[1, 2, 3, 4], 0], expected: 1.0 },
      { input: [[1, 2, 3, 4], 1], expected: 0.25 },
      { input: [[1, 2, 3, 4], 2], expected: -0.3 },
      { input: [[5, 5, 5, 5], 1], expected: 0.0 },
    ],
    hint: "Compute gamma(0) once and divide every lag by it.",
  },
  {
    id: "ts-030",
    title: "Partial Autocorrelation Lag 1",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Estimate the lag-1 partial autocorrelation as the sample Pearson correlation between the series and itself shifted by one: correlate x[0..n-2] with x[1..n-1], centering each sub-series on its own mean.\n\nReturn 0.0 if the series has fewer than three points or either sub-series is constant. For lag 1 this equals the regression-based PACF.",
    starterCode: `def partial_autocorrelation_lag1(series):
    # Your code here
    pass`,
    solution: `def partial_autocorrelation_lag1(series):
    if len(series) < 3:
        return 0.0
    a = series[:-1]
    b = series[1:]
    ma = sum(a) / len(a)
    mb = sum(b) / len(b)
    num = sum((x - ma) * (y - mb) for x, y in zip(a, b))
    da = sum((x - ma) ** 2 for x in a) ** 0.5
    db = sum((y - mb) ** 2 for y in b) ** 0.5
    if da == 0 or db == 0:
        return 0.0
    return num / (da * db)`,
    testCases: [
      { input: [[1, 2, 3, 4]], expected: 0.9999999999999998 },
      { input: [[1, 3, 2, 4]], expected: -0.4999999999999999 },
      { input: [[5, 5, 5, 5]], expected: 0.0 },
      { input: [[4, 2, 8, 6]], expected: -0.1428571428571428 },
    ],
    hint: "This is just Pearson correlation between the two overlapping sub-series.",
  },
  {
    id: "ts-031",
    title: "White Noise Check",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Test whether a series is consistent with white noise using its lag-1 sample autocorrelation. The approximate 95 percent band for white noise is abs(rho) <= 1.96 / sqrt(n); return True when rho(1) lies inside the band.\n\nReturn True for series with fewer than three points or with zero variance.",
    starterCode: `def white_noise_check(series):
    # Your code here
    pass`,
    solution: `def white_noise_check(series):
    n = len(series)
    if n < 3:
        return True
    m = sum(series) / n
    g0 = sum((x - m) ** 2 for x in series) / n
    if g0 == 0:
        return True
    g1 = sum((series[t] - m) * (series[t + 1] - m) for t in range(n - 1)) / n
    return abs(g1 / g0) <= 1.96 / (n ** 0.5)`,
    testCases: [
      { input: [[1, 2, 3, 4, 5]], expected: true },
      { input: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]], expected: false },
      { input: [[3, 3, 3, 3, 3]], expected: true },
      { input: [[1, -1, 1, -1, 1, -1]], expected: false },
    ],
    hint: "The band shrinks as 1/sqrt(n), so long trending series fail.",
  },
  {
    id: "ts-032",
    title: "Trend Slope OLS",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Fit a linear trend x[t] = intercept + slope * t by ordinary least squares with t = 0, ..., n-1 and return the slope: sum((t - mean_t) * (x[t] - mean_x)) / sum((t - mean_t)^2).\n\nReturn 0.0 if the series has fewer than two points.",
    starterCode: `def trend_slope(series):
    # Your code here
    pass`,
    solution: `def trend_slope(series):
    n = len(series)
    if n < 2:
        return 0.0
    mt = (n - 1) / 2.0
    mx = sum(series) / n
    num = sum((t - mt) * (series[t] - mx) for t in range(n))
    den = sum((t - mt) ** 2 for t in range(n))
    if den == 0:
        return 0.0
    return num / den`,
    testCases: [
      { input: [[1, 2, 3, 4]], expected: 1.0 },
      { input: [[4, 3, 2, 1]], expected: -1.0 },
      { input: [[5, 5, 5]], expected: 0.0 },
      { input: [[1, 3, 5]], expected: 2.0 },
    ],
    hint: "Precompute mean_t = (n - 1) / 2 to avoid building an index list.",
  },
  {
    id: "ts-033",
    title: "MA(1) Process Generation",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Generate a seeded MA(1) process. Call random.seed(seed), draw n standard normal innovations e[t] with random.gauss(0.0, 1.0), and return y[t] = e[t] + theta * e[t-1] for t >= 1 with y[0] = e[0].\n\nReturn an empty list when n is not positive.",
    starterCode: `import random
def ma1_generate(n, theta, seed):
    # Your code here
    pass`,
    solution: `import random
def ma1_generate(n, theta, seed):
    random.seed(seed)
    if n <= 0:
        return []
    e = [random.gauss(0.0, 1.0) for _ in range(n)]
    y = [e[0]]
    for t in range(1, n):
        y.append(e[t] + theta * e[t - 1])
    return y`,
    testCases: [
      {
        input: [5, 0.5, 42],
        expected: [
          -0.14409032957792836,
          -0.24494876512048347,
          -0.1977676617334221,
          0.6463257943150319,
          0.22340357876654446,
        ],
      },
      {
        input: [4, -0.3, 7],
        expected: [
          -0.2558802884476004,
          0.5881955990507941,
          -0.3795256185380589,
          -0.24723957289625403,
        ],
      },
      {
        input: [3, 0.0, 1],
        expected: [1.2881847531554629, 1.4494456086997711, 0.06633580893826191],
      },
      { input: [0, 0.5, 3], expected: [] },
    ],
    hint: "Seeding inside the function keeps the output reproducible.",
  },
  {
    id: "ts-034",
    title: "AR(1) Process Generation",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Generate a seeded AR(1) process. Call random.seed(seed), draw n standard normal innovations, and initialize x[0] = c / (1 - phi) + e[0] when abs(phi) < 1 (otherwise x[0] = e[0]); then iterate x[t] = c + phi * x[t-1] + e[t].\n\nReturn the generated series; n <= 0 gives an empty list.",
    starterCode: `import random
def ar1_generate(n, c, phi, seed):
    # Your code here
    pass`,
    solution: `import random
def ar1_generate(n, c, phi, seed):
    random.seed(seed)
    if n <= 0:
        return []
    e = [random.gauss(0.0, 1.0) for _ in range(n)]
    if abs(phi) < 1:
        x = c / (1.0 - phi) + e[0]
    else:
        x = e[0]
    out = [x]
    for t in range(1, n):
        x = c + phi * x + e[t]
        out.append(x)
    return out`,
    testCases: [
      {
        input: [5, 0.5, 0.5, 42],
        expected: [
          0.8559096704220717,
          0.7550512348795165,
          0.7662097558720958,
          1.5850886030349112,
          1.1649560177345686,
        ],
      },
      {
        input: [4, 1.0, 0.0, 7],
        expected: [
          0.7441197115523996,
          1.511431512516514,
          0.7739038352168953,
          0.6849315776688145,
        ],
      },
      {
        input: [3, 0.2, -0.5, 1],
        expected: [
          1.4215180864887962,
          0.9386865654553731,
          -0.20300747378942463,
        ],
      },
      { input: [0, 0.5, 0.5, 3], expected: [] },
    ],
    hint: "Start from the stationary mean c / (1 - phi) so burn-in is unnecessary.",
  },
  {
    id: "ts-035",
    title: "AR(1) Mean and Variance",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "For a stationary AR(1) process x[t] = c + phi * x[t-1] + e[t] with innovation variance sigma2, return [mean, variance] where mean = c / (1 - phi) and variance = sigma2 / (1 - phi^2).\n\nIf abs(phi) >= 1 return [0.0, 0.0], since no stationary distribution exists.",
    starterCode: `def ar1_mean_variance(c, phi, sigma2):
    # Your code here
    pass`,
    solution: `def ar1_mean_variance(c, phi, sigma2):
    if abs(phi) >= 1:
        return [0.0, 0.0]
    return [c / (1.0 - phi), sigma2 / (1.0 - phi * phi)]`,
    testCases: [
      { input: [0.5, 0.5, 1], expected: [1.0, 1.3333333333333333] },
      { input: [0, 0, 2], expected: [0.0, 2.0] },
      { input: [2, -0.5, 1], expected: [1.3333333333333333, 1.3333333333333333] },
      { input: [1, 0.9, 0.5], expected: [10.000000000000002, 2.6315789473684217] },
    ],
    hint: "The variance inflates by 1 / (1 - phi^2) relative to white noise.",
  },
  {
    id: "ts-036",
    title: "Mean Absolute Percentage Error",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the mean absolute percentage error (MAPE) as a percentage: (100 / n) * sum(abs(actual[t] - forecast[t]) / abs(actual[t])).\n\nAll actual values are assumed to be nonzero. Return 0.0 when the actual list is empty.",
    starterCode: `def mean_absolute_percentage_error(actual, forecast):
    # Your code here
    pass`,
    solution: `def mean_absolute_percentage_error(actual, forecast):
    if not actual:
        return 0.0
    total = sum(abs(a - f) / abs(a) for a, f in zip(actual, forecast))
    return 100.0 * total / len(actual)`,
    testCases: [
      { input: [[100, 200], [110, 190]], expected: 7.500000000000001 },
      { input: [[50], [55]], expected: 10.0 },
      { input: [[10, 10], [10, 10]], expected: 0.0 },
      { input: [[4, 8], [5, 6]], expected: 25.0 },
    ],
    hint: "Scale each error by the actual magnitude before averaging.",
  },
  {
    id: "ts-037",
    title: "Holt-Winters Additive One Step",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Compute the one-step-ahead forecast of the additive Holt-Winters method. Given an initial level, trend, and period seasonal offsets, iterate over the series: l = alpha * (x[t] - s[t % period]) + (1 - alpha) * (l + b); b = beta * (l - l_prev) + (1 - beta) * b; s[t % period] = gamma * (x[t] - l) + (1 - gamma) * s[t % period].\n\nReturn the forecast for the next time step, l + b + s[n % period].",
    starterCode: `def holt_winters_additive(series, period, alpha, beta, gamma, level0, trend0, seasonals):
    # Your code here
    pass`,
    solution: `def holt_winters_additive(series, period, alpha, beta, gamma, level0, trend0, seasonals):
    l = float(level0)
    b = float(trend0)
    s = list(seasonals)
    for t in range(len(series)):
        si = t % period
        x = series[t]
        prev = l
        l = alpha * (x - s[si]) + (1 - alpha) * (l + b)
        b = beta * (l - prev) + (1 - beta) * b
        s[si] = gamma * (x - l) + (1 - gamma) * s[si]
    return l + b + s[len(series) % period]`,
    testCases: [
      {
        input: [[10, 14, 12, 11, 15, 13], 3, 0.5, 0.3, 0.4, 11.0, 0.5, [-1.0, 1.0, 0.0]],
        expected: 12.606891632812498,
      },
      {
        input: [[20, 22, 21, 23, 25, 24], 3, 0.4, 0.2, 0.3, 21.0, 0.5, [0.0, 1.0, -1.0]],
        expected: 24.958005776896,
      },
      {
        input: [[5, 7, 6, 6, 8, 7], 3, 0.6, 0.4, 0.5, 6.0, 0.3, [-0.5, 0.5, 0.0]],
        expected: 6.9290183958527996,
      },
    ],
    hint: "Always use the old seasonal entry for the level update, then overwrite it.",
  },
  {
    id: "ts-038",
    title: "Ljung-Box Statistic Lite",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Compute the Ljung-Box portmanteau statistic from a list of sample autocorrelations: Q = n * (n + 2) * sum over k = 1..h of rho_k^2 / (n - k), where rho_k is acf_values[k-1].\n\nReturn 0.0 if h is not positive or n <= h. Larger Q indicates stronger serial correlation.",
    starterCode: `def ljung_box(acf_values, n, h):
    # Your code here
    pass`,
    solution: `def ljung_box(acf_values, n, h):
    if h <= 0 or n <= h:
        return 0.0
    total = 0.0
    for k in range(1, h + 1):
        total += acf_values[k - 1] ** 2 / (n - k)
    return n * (n + 2) * total`,
    testCases: [
      { input: [[0.2, -0.1, 0.05], 100, 3], expected: 5.424915045680878 },
      {
        input: [[0.5, -0.3, 0.2, 0.1], 50, 4],
        expected: 20.918289471200133,
      },
      { input: [[0.1], 20, 1], expected: 0.2315789473684211 },
      { input: [[0.9], 10, 1], expected: 10.8 },
    ],
    hint: "Each lag is weighted by 1 / (n - k), which grows with k.",
  },
  {
    id: "ts-039",
    title: "AR(2) Simulated Variance",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Simulate an AR(2) process x[t] = phi1 * x[t-1] + phi2 * x[t-2] + e[t] with standard normal innovations and return the population variance of the generated values. Call random.seed(seed), discard the first 100 observations as burn-in, then collect n values.\n\nReturn 0.0 if n is not positive. The parameter pair is assumed to satisfy the stationarity conditions.",
    starterCode: `import random
def ar2_simulated_variance(phi1, phi2, n, seed):
    # Your code here
    pass`,
    solution: `import random
def ar2_simulated_variance(phi1, phi2, n, seed):
    random.seed(seed)
    burn = 100
    total = n + burn
    e = [random.gauss(0.0, 1.0) for _ in range(total)]
    x = [0.0, 0.0]
    vals = []
    for t in range(2, total):
        v = phi1 * x[-1] + phi2 * x[-2] + e[t]
        x.append(v)
        if t >= burn:
            vals.append(v)
    if not vals:
        return 0.0
    m = sum(vals) / len(vals)
    return sum((v - m) ** 2 for v in vals) / len(vals)`,
    testCases: [
      { input: [0.5, 0.2, 200, 42], expected: 1.7542622157049643 },
      { input: [0.3, -0.4, 200, 7], expected: 1.2567030545273807 },
      { input: [0.6, 0.3, 200, 1], expected: 3.835498405994975 },
      { input: [0.0, 0.0, 200, 5], expected: 1.009451643912433 },
    ],
    hint: "Keep the last two simulated values in a small list and append each new draw.",
  },
  {
    id: "ts-040",
    title: "Yule-Walker AR(2) Solve",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Solve the Yule-Walker equations for an AR(2) model given lag-1 and lag-2 autocorrelations: the system [1 r1; r1 1] * [phi1; phi2] = [r1; r2].\n\nReturn [phi1, phi2] using phi1 = r1 * (1 - r2) / (1 - r1^2) and phi2 = (r2 - r1^2) / (1 - r1^2). If 1 - r1^2 is 0, return [0.0, 0.0].",
    starterCode: `def yule_walker_ar2(r1, r2):
    # Your code here
    pass`,
    solution: `def yule_walker_ar2(r1, r2):
    den = 1.0 - r1 * r1
    if den == 0:
        return [0.0, 0.0]
    return [(r1 - r1 * r2) / den, (r2 - r1 * r1) / den]`,
    testCases: [
      { input: [0.5, 0.25], expected: [0.5, 0.0] },
      { input: [0.6, 0.3], expected: [0.65625, -0.09375] },
      { input: [0.4, -0.2], expected: [0.5714285714285715, -0.42857142857142866] },
      { input: [0.0, 0.0], expected: [0.0, 0.0] },
    ],
    hint: "This is a 2x2 linear system; Cramer's rule gives the closed form.",
  },
  {
    id: "ts-041",
    title: "ARMA(1,1) One-Step Forecast",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "For the ARMA(1,1) model x[t] = c + phi * x[t-1] + e[t] + theta * e[t-1], compute the one-step-ahead forecast conditional on the last observation and the last residual: c + phi * x_last + theta * e_last.\n\nReturn the forecast as a number.",
    starterCode: `def arma11_forecast(c, phi, theta, x_last, e_last):
    # Your code here
    pass`,
    solution: `def arma11_forecast(c, phi, theta, x_last, e_last):
    return c + phi * x_last + theta * e_last`,
    testCases: [
      { input: [1, 0.5, 0.3, 10, 2], expected: 6.6 },
      { input: [0, 0.8, -0.5, 5, 1], expected: 3.5 },
      { input: [2, 0, 0, 7, 3], expected: 2 },
      { input: [1, 0.5, 0.3, 10, 0], expected: 6.0 },
    ],
    hint: "Future innovations have expectation zero, so only the last residual enters.",
  },
  {
    id: "ts-042",
    title: "Theil U Statistic",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Compute Theil's U statistic comparing a forecast against the naive no-change forecast: U = sqrt(mean((forecast - actual)^2)) / sqrt(mean over t >= 1 of (actual[t] - actual[t-1])^2). Use the 1/m denominator in the numerator and 1/(m-1) in the denominator.\n\nReturn 0.0 if there are fewer than two actual values or the denominator is 0. U < 1 means the forecast beats a random walk.",
    starterCode: `def theil_u(actual, forecast):
    # Your code here
    pass`,
    solution: `def theil_u(actual, forecast):
    m = len(actual)
    if m < 2 or len(forecast) != m:
        return 0.0
    num = (sum((f - a) ** 2 for a, f in zip(actual, forecast)) / m) ** 0.5
    den = (sum((actual[t] - actual[t - 1]) ** 2 for t in range(1, m)) / (m - 1)) ** 0.5
    if den == 0:
        return 0.0
    return num / den`,
    testCases: [
      { input: [[10, 12, 14], [11, 11, 11]], expected: 0.9574271077563381 },
      { input: [[1, 2, 3, 4], [1, 2, 3, 4]], expected: 0.0 },
      { input: [[5, 5, 5], [6, 4, 5]], expected: 0.0 },
      { input: [[2, 4, 6, 8], [3, 5, 7, 8]], expected: 0.4330127018922193 },
    ],
    hint: "The denominator is the RMSE of the naive persistence forecast.",
  },
  {
    id: "ts-043",
    title: "Hurst Exponent Lite",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Estimate the Hurst exponent from the variance ratio with q = 2. Let d1 be the first differences and d2 the second-order differences of the series; compute v1 = mean(d1^2), v2 = mean(d2^2), then VR = v2 / (2 * v1) and H = log(VR) / log(2).\n\nReturn 0.0 if the series has fewer than three points or v1 is 0. H = 0.5 suggests a random walk, H > 0.5 trending, H < 0.5 mean-reverting.",
    starterCode: `import math
def hurst_lite(series):
    # Your code here
    pass`,
    solution: `import math
def hurst_lite(series):
    n = len(series)
    if n < 3:
        return 0.0
    d1 = [series[t] - series[t - 1] for t in range(1, n)]
    d2 = [series[t] - series[t - 2] for t in range(2, n)]
    v1 = sum(x * x for x in d1) / len(d1)
    v2 = sum(x * x for x in d2) / len(d2)
    if v1 == 0:
        return 0.0
    vr = v2 / (2.0 * v1)
    if vr <= 0:
        return 0.0
    return math.log(vr) / math.log(2.0)`,
    testCases: [
      { input: [[1, 2, 4, 7, 11]], expected: 0.8831863350172501 },
      { input: [[3, 3, 3, 3, 3]], expected: 0.0 },
      { input: [[1, 2, 3, 4, 5, 6]], expected: 1.0 },
      { input: [[2, 4, 6, 8, 10, 12]], expected: 1.0 },
    ],
    hint: "The variance ratio is 2^H, so taking log base 2 recovers H.",
  },
  {
    id: "ts-044",
    title: "Lead-Lag Best Lag",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Find the lag that best aligns two equal-length series by absolute Pearson correlation. For lag k >= 0 compare x[0..n-k-1] with y[k..n-1]; for k < 0 compare x[-k..n-1] with y[0..n+k-1]. Search every lag from -max_lag to max_lag.\n\nReturn the lag with the largest absolute correlation; ties prefer the lag closest to zero, and at equal distance the negative one. Return None when no lag has at least two paired points.",
    starterCode: `def best_lag(x, y, max_lag):
    # Your code here
    pass`,
    solution: `def best_lag(x, y, max_lag):
    n = len(x)
    if n != len(y) or n < 2 or max_lag < 0:
        return None
    best_k = None
    best_c = -1.0
    lags = [0]
    for k in range(1, max_lag + 1):
        lags.append(-k)
        lags.append(k)
    for k in lags:
        if k >= 0:
            xs = x[:n - k]
            ys = y[k:]
        else:
            xs = x[-k:]
            ys = y[:n + k]
        if len(xs) < 2:
            continue
        mx = sum(xs) / len(xs)
        my = sum(ys) / len(ys)
        num = sum((a - mx) * (b - my) for a, b in zip(xs, ys))
        da = sum((a - mx) ** 2 for a in xs) ** 0.5
        db = sum((b - my) ** 2 for b in ys) ** 0.5
        c = 0.0 if da == 0 or db == 0 else num / (da * db)
        if abs(c) > best_c + 1e-12:
            best_c = abs(c)
            best_k = k
    return best_k`,
    testCases: [
      { input: [[1, 4, 9, 16, 25, 36], [0, 1, 4, 9, 16, 25], 2], expected: 1 },
      { input: [[1, 2, 3, 4, 5, 6], [20, 21, 22, 23, 24, 25], 2], expected: 0 },
      { input: [[1, 4, 9, 16, 25, 36], [4, 9, 16, 25, 36, 49], 2], expected: -1 },
      { input: [[1, 2, 3], [3, 2, 1], 2], expected: 0 },
      { input: [[0, 1, 3, 2, 5, 4], [1, 3, 2, 5, 4, 7], 2], expected: -1 },
    ],
    hint: "Iterate candidate lags in order 0, -1, 1, -2, 2 to settle ties deterministically.",
  },
  {
    id: "ts-045",
    title: "Granger-lite Predictability Flag",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Test whether lagged x improves the prediction of y beyond lagged y alone. Fit two OLS regressions on t = 1, ..., n-1: the restricted model y[t] = a + b * y[t-1] and the unrestricted model y[t] = a + b * y[t-1] + c * x[t-1], then compare their residual sums of squares.\n\nReturn True when the unrestricted SSE is smaller than the restricted SSE by more than 1e-9, otherwise False. Return False when fewer than three points are available.",
    starterCode: `def granger_lite(y, x):
    # Your code here
    pass`,
    solution: `def granger_lite(y, x):
    n = len(y)
    if n < 3 or len(x) != n:
        return False
    yt = y[1:]
    p1 = y[:-1]
    p2 = x[:-1]
    m = len(yt)

    def fit(cols):
        p = len(cols)
        a = [[0.0] * (p + 1) for _ in range(p + 1)]
        rhs = [0.0] * (p + 1)
        for row in range(m):
            vals = [1.0] + [cols[j][row] for j in range(p)]
            t = yt[row]
            for i in range(p + 1):
                for j in range(p + 1):
                    a[i][j] += vals[i] * vals[j]
                rhs[i] += vals[i] * t
        for i in range(p + 1):
            piv = max(range(i, p + 1), key=lambda r: abs(a[r][i]))
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
        for row in range(m):
            pred = beta[0] + sum(beta[j + 1] * cols[j][row] for j in range(p))
            sse += (yt[row] - pred) ** 2
        return sse

    s1 = fit([p1])
    s2 = fit([p1, p2])
    return s2 < s1 - 1e-9`,
    testCases: [
      { input: [[1, 2, 3, 4, 5, 6], [0, 1, 2, 3, 4, 5]], expected: false },
      { input: [[0, 1, 3, 2, 5, 4], [1, 3, 2, 5, 4, 7]], expected: true },
      { input: [[0, 1, 0, 1, 0, 1], [1, 2, 3, 4, 5, 6]], expected: false },
      { input: [[1, 3, 2, 4, 3, 5], [1, 2, 3, 4, 5, 6]], expected: true },
    ],
    hint: "Solve the normal equations with Gaussian elimination for one and two regressors.",
  },
];
