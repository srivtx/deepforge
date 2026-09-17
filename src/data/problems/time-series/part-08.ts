import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "ts-316",
    title: "Simple Moving Average Endpoint",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the simple moving average of the last k observations in a series, that is, the mean of series[-k:].\n\nReturn 0.0 when k is not positive or when k exceeds the length of the series.",
    starterCode: `def sma_endpoint(series, k):
    # Your code here
    pass`,
    solution: `def sma_endpoint(series, k):
    if k <= 0 or k > len(series):
        return 0.0
    window = series[len(series) - k:]
    return sum(window) / k`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 3], expected: 4.0 },
      { input: [[10, 20], 1], expected: 20.0 },
      { input: [[1, 2], 5], expected: 0.0 },
      { input: [[], 2], expected: 0.0 },
    ],
    hint: "Only the tail of the series participates in the average.",
  },
  {
    id: "ts-317",
    title: "Centered Moving Average Series",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Smooth a series with a centered moving average of odd window size k. For each position t from (k-1)//2 to n-1-(k-1)//2, average the k values centered on t.\n\nReturn an empty list when k is even, k is not positive, or k is larger than the series. A centered average cannot align with the series for even k, so those inputs are rejected.",
    starterCode: `def centered_moving_average(series, k):
    # Your code here
    pass`,
    solution: `def centered_moving_average(series, k):
    n = len(series)
    if k <= 0 or k % 2 == 0 or k > n:
        return []
    half = (k - 1) // 2
    out = []
    for t in range(half, n - half):
        out.append(sum(series[t - half:t + half + 1]) / k)
    return out`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 3], expected: [2.0, 3.0, 4.0] },
      { input: [[2, 4, 6, 8, 10], 5], expected: [6.0] },
      { input: [[7], 1], expected: [7.0] },
      { input: [[1, 2, 3, 4], 2], expected: [] },
    ],
    hint: "The output is shorter than the input by k - 1 values.",
  },
  {
    id: "ts-318",
    title: "Linearly Weighted Moving Average",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute a linearly weighted moving average for every full window of size k, giving the oldest value in a window weight 1 and the newest weight k. Each window average is the dot product of the window with the weights 1, 2, ..., k divided by k * (k + 1) / 2.\n\nReturn an empty list when k is not positive or when k exceeds the series length.",
    starterCode: `def linearly_weighted_average(series, k):
    # Your code here
    pass`,
    solution: `def linearly_weighted_average(series, k):
    if k <= 0 or k > len(series):
        return []
    denom = k * (k + 1) / 2.0
    out = []
    for i in range(k - 1, len(series)):
        window = series[i - k + 1:i + 1]
        total = 0.0
        for j in range(k):
            total += (j + 1) * window[j]
        out.append(total / denom)
    return out`,
    testCases: [
      { input: [[1, 2, 3], 2], expected: [1.6666666666666667, 2.6666666666666665] },
      { input: [[1, 2, 3], 3], expected: [2.3333333333333335] },
      { input: [[5], 1], expected: [5.0] },
      { input: [[1, 2], 3], expected: [] },
    ],
    hint: "Newer observations carry more weight, so the average lags the raw series less than an SMA.",
  },
  {
    id: "ts-319",
    title: "Weighted Moving Average Endpoint",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute a weighted average of the last k observations, where k is the length of the weights list. The oldest observation in the window is paired with weights[0] and the newest with weights[-1]; the result is the dot product divided by the sum of the weights.\n\nReturn 0.0 when the weights list is empty, the weights sum to zero, or the weights list is longer than the series.",
    starterCode: `def wma_endpoint(series, weights):
    # Your code here
    pass`,
    solution: `def wma_endpoint(series, weights):
    k = len(weights)
    if k == 0 or k > len(series):
        return 0.0
    wsum = sum(weights)
    if wsum == 0:
        return 0.0
    window = series[len(series) - k:]
    total = 0.0
    for j in range(k):
        total += weights[j] * window[j]
    return total / wsum`,
    testCases: [
      { input: [[1, 2, 3, 4], [1, 2]], expected: 3.6666666666666665 },
      { input: [[10, 20, 30], [1, 1, 1]], expected: 20.0 },
      { input: [[1, 2], [0, 0]], expected: 0.0 },
      { input: [[1, 2, 3], [1, 1, 1, 1]], expected: 0.0 },
    ],
    hint: "Use the most recent k values only and normalize by the total weight.",
  },
  {
    id: "ts-320",
    title: "Moving Average Crossover Signal",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compare the latest observation with the simple moving average of the last k observations. Return 1 if the latest value is above the average, -1 if it is below, and 0 if they are equal.\n\nReturn 0 when k is not positive or k is larger than the series.",
    starterCode: `def sma_crossover_signal(series, k):
    # Your code here
    pass`,
    solution: `def sma_crossover_signal(series, k):
    if k <= 0 or k > len(series):
        return 0
    window = series[len(series) - k:]
    avg = sum(window) / k
    if series[-1] > avg:
        return 1
    if series[-1] < avg:
        return -1
    return 0`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 3], expected: 1 },
      { input: [[5, 4, 3, 2, 1], 2], expected: -1 },
      { input: [[2, 2, 2], 2], expected: 0 },
      { input: [[1, 2], 5], expected: 0 },
    ],
    hint: "The latest value is part of its own moving average, so the signal needs a strict comparison.",
  },
  {
    id: "ts-321",
    title: "Second Differences",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Return the second differences of a series, defined by x[t] - 2 * x[t-1] + x[t-2] for t from 2 onward. This is the result of applying the differencing operator twice and removes a linear trend from the data.\n\nReturn an empty list when the series has fewer than three values.",
    starterCode: `def second_differences(series):
    # Your code here
    pass`,
    solution: `def second_differences(series):
    if len(series) < 3:
        return []
    return [series[t] - 2 * series[t - 1] + series[t - 2] for t in range(2, len(series))]`,
    testCases: [
      { input: [[1, 4, 9, 16]], expected: [2, 2] },
      { input: [[1, 2, 3]], expected: [0] },
      { input: [[1, 1]], expected: [] },
      { input: [[5]], expected: [] },
    ],
    hint: "Second differences are the differences of the first differences.",
  },
  {
    id: "ts-322",
    title: "Seasonal Differences at Lag m",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the seasonal difference of a series at lag m, given by x[t] - x[t-m] for every t from m to n-1. Differencing at the seasonal lag removes a repeating pattern of period m.\n\nReturn an empty list when m is not positive or m is at least the length of the series.",
    starterCode: `def seasonal_differences(series, m):
    # Your code here
    pass`,
    solution: `def seasonal_differences(series, m):
    if m <= 0 or m >= len(series):
        return []
    return [series[t] - series[t - m] for t in range(m, len(series))]`,
    testCases: [
      { input: [[1, 2, 3, 10, 20, 30], 3], expected: [9, 18, 27] },
      { input: [[5, 7, 9], 1], expected: [2, 2] },
      { input: [[1, 2], 2], expected: [] },
      { input: [[1, 2, 3], 0], expected: [] },
    ],
    hint: "With m = 1 this reduces to ordinary first differences.",
  },
  {
    id: "ts-323",
    title: "Backshift Operator Apply",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Apply the backshift operator k times to a series, so that the value at index t becomes the value from index t - k. Positions near the start with no earlier value are filled with series[0].\n\nIf k is not positive, return the series unchanged. Return an empty list for an empty series.",
    starterCode: `def apply_backshift(series, k):
    # Your code here
    pass`,
    solution: `def apply_backshift(series, k):
    n = len(series)
    if n == 0:
        return []
    if k <= 0:
        return list(series)
    out = []
    for t in range(n):
        if t - k >= 0:
            out.append(series[t - k])
        else:
            out.append(series[0])
    return out`,
    testCases: [
      { input: [[1, 2, 3, 4], 1], expected: [1, 1, 2, 3] },
      { input: [[1, 2, 3, 4], 2], expected: [1, 1, 1, 2] },
      { input: [[5, 6], 0], expected: [5, 6] },
      { input: [[], 3], expected: [] },
    ],
    hint: "In backshift notation B x[t] = x[t-1], and B^k x[t] = x[t-k].",
  },
  {
    id: "ts-324",
    title: "Lag Feature Matrix",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Build a supervised learning design matrix from a series using p lagged values per row. Row t of the output is [x[t], x[t-1], ..., x[t-p+1]] for t from p-1 to n-1, so the first column is the current value and each later column is one more step back in time.\n\nReturn an empty list when p is not positive or p is larger than the series.",
    starterCode: `def lag_feature_matrix(series, p):
    # Your code here
    pass`,
    solution: `def lag_feature_matrix(series, p):
    n = len(series)
    if p <= 0 or p > n:
        return []
    out = []
    for t in range(p - 1, n):
        row = [series[t - j] for j in range(p)]
        out.append(row)
    return out`,
    testCases: [
      { input: [[1, 2, 3, 4], 2], expected: [[2, 1], [3, 2], [4, 3]] },
      { input: [[1, 2, 3], 1], expected: [[1], [2], [3]] },
      { input: [[1, 2], 3], expected: [] },
      { input: [[], 1], expected: [] },
    ],
    hint: "Each row consumes one more observation, so the matrix has n - p + 1 rows.",
  },
  {
    id: "ts-325",
    title: "Walk-Forward Fold Count",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Count how many non-overlapping walk-forward folds fit in a series of n observations, given an initial training size and a test horizon h. Each fold trains on the observations available so far and tests the next h points, so the count is (n - initial) // h.\n\nReturn 0 when h is not positive, when n is not positive, or when the initial size is negative or exceeds n.",
    starterCode: `def walk_forward_fold_count(n, initial, h):
    # Your code here
    pass`,
    solution: `def walk_forward_fold_count(n, initial, h):
    if n <= 0 or h <= 0 or initial < 0 or initial > n:
        return 0
    return (n - initial) // h`,
    testCases: [
      { input: [10, 4, 2], expected: 3 },
      { input: [10, 5, 1], expected: 5 },
      { input: [5, 5, 2], expected: 0 },
      { input: [10, 4, 0], expected: 0 },
    ],
    hint: "Walk-forward evaluation uses every point exactly once as a test target.",
  },
  {
    id: "ts-326",
    title: "Chronological Holdout Split",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Split a series into a training prefix and a test suffix that contains the last h observations. Return the pair as [train, test], preserving the original time order.\n\nIf h is not positive, the test part is empty. If h is at least the series length, the training part is empty.",
    starterCode: `def chronological_holdout_split(series, h):
    # Your code here
    pass`,
    solution: `def chronological_holdout_split(series, h):
    n = len(series)
    if h <= 0:
        return [list(series), []]
    if h >= n:
        return [[], list(series)]
    return [series[:n - h], series[n - h:]]`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 2], expected: [[1, 2, 3], [4, 5]] },
      { input: [[1, 2, 3], 0], expected: [[1, 2, 3], []] },
      { input: [[1, 2], 5], expected: [[], [1, 2]] },
      { input: [[], 1], expected: [[], []] },
    ],
    hint: "Never shuffle time series; the test set must stay in the future of the training set.",
  },
  {
    id: "ts-327",
    title: "Drift Estimate from Differences",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Estimate the drift of a series as the mean of its first differences. Because the differences telescope, this equals (x[-1] - x[0]) / (n - 1).\n\nReturn 0.0 when the series has fewer than two observations.",
    starterCode: `def drift_estimate(series):
    # Your code here
    pass`,
    solution: `def drift_estimate(series):
    n = len(series)
    if n < 2:
        return 0.0
    total = 0.0
    for t in range(1, n):
        total += series[t] - series[t - 1]
    return total / (n - 1)`,
    testCases: [
      { input: [[1, 3, 5, 7]], expected: 2.0 },
      { input: [[10, 10, 10]], expected: 0.0 },
      { input: [[5]], expected: 0.0 },
      { input: [[1, 3, 2]], expected: 0.5 },
    ],
    hint: "Drift is the average step size of the random walk with drift model.",
  },
  {
    id: "ts-328",
    title: "Differencing Order to Constant",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Repeatedly difference a series until all remaining values are equal, and return the number of differencing steps used. A single remaining value counts as constant and stops the process.\n\nAt most five differences are attempted; return -1 if the series is still not constant after those five steps.",
    starterCode: `def differencing_order_to_constant(series):
    # Your code here
    pass`,
    solution: `def differencing_order_to_constant(series):
    cur = list(series)
    for d in range(5):
        if len(cur) <= 1 or all(v == cur[0] for v in cur):
            return d
        cur = [cur[i + 1] - cur[i] for i in range(len(cur) - 1)]
    if len(cur) <= 1 or all(v == cur[0] for v in cur):
        return 5
    return -1`,
    testCases: [
      { input: [[1, 2, 3, 4]], expected: 1 },
      { input: [[1, 4, 9, 16]], expected: 2 },
      { input: [[2, 2, 2]], expected: 0 },
      { input: [[1, 2, 4, 8, 16, 32, 64]], expected: -1 },
      { input: [[7]], expected: 0 },
    ],
    hint: "A degree-d polynomial trend needs d differences to become constant.",
  },
  {
    id: "ts-329",
    title: "Naive Forecast MAE",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Evaluate the one-step naive forecast on the last h observations of a series, where the forecast for each point is simply the previous observation. Return the mean absolute error over those h steps.\n\nReturn 0.0 when h is not positive or when h is larger than the number of available one-step errors, n - 1.",
    starterCode: `def naive_holdout_mae(series, h):
    # Your code here
    pass`,
    solution: `def naive_holdout_mae(series, h):
    n = len(series)
    if n < 2 or h < 1 or h > n - 1:
        return 0.0
    total = 0.0
    for i in range(n - h, n):
        total += abs(series[i] - series[i - 1])
    return total / h`,
    testCases: [
      { input: [[1, 2, 4, 7], 3], expected: 2.0 },
      { input: [[5, 5, 5], 2], expected: 0.0 },
      { input: [[1, 2], 1], expected: 1.0 },
      { input: [[1, 2, 3], 5], expected: 0.0 },
    ],
    hint: "Each error is just the absolute change between consecutive observations.",
  },
  {
    id: "ts-330",
    title: "Drift Forecast at Horizon",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Produce a drift forecast h steps beyond the end of a series. The drift is the average first difference, and the forecast is x[-1] + h * drift.\n\nReturn 0.0 for an empty series or a negative horizon, and return the last value when the series has a single observation.",
    starterCode: `def drift_forecast(series, h):
    # Your code here
    pass`,
    solution: `def drift_forecast(series, h):
    if not series or h < 0:
        return 0.0
    n = len(series)
    if n < 2:
        return series[-1]
    total = 0.0
    for t in range(1, n):
        total += series[t] - series[t - 1]
    drift = total / (n - 1)
    return series[-1] + h * drift`,
    testCases: [
      { input: [[1, 3, 5], 2], expected: 9.0 },
      { input: [[10, 20, 30], 1], expected: 40.0 },
      { input: [[5], 3], expected: 5 },
      { input: [[], 2], expected: 0.0 },
    ],
    hint: "With a perfectly linear series the drift forecast extends the line exactly.",
  },
  {
    id: "ts-331",
    title: "White Noise Mean Variance",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the variance of the sample mean of h independent white-noise observations, each with variance sigma2. Averaging reduces the variance to sigma2 / h.\n\nReturn 0.0 when h is not positive.",
    starterCode: `def white_noise_mean_variance(sigma2, h):
    # Your code here
    pass`,
    solution: `def white_noise_mean_variance(sigma2, h):
    if h <= 0:
        return 0.0
    return sigma2 / h`,
    testCases: [
      { input: [4.0, 2], expected: 2.0 },
      { input: [1.0, 1], expected: 1.0 },
      { input: [6.0, 3], expected: 2.0 },
      { input: [2.0, 0], expected: 0.0 },
    ],
    hint: "Averaging over more independent observations shrinks the variance linearly.",
  },
  {
    id: "ts-332",
    title: "PACF Lag Two for MA(1)",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Derive the partial autocorrelation at lag two for an MA(1) process. The lag-one autocorrelation is r1 = theta / (1 + theta^2), the lag-two autocorrelation is zero, and the PACF at lag two follows from these as -r1^2 / (1 - r1^2).\n\nReturn 0.0 if the denominator is zero. This nonzero PACF is why an MA(1) model has a slowly decaying partial autocorrelation.",
    starterCode: `def pacf_lag2_ma1(theta):
    # Your code here
    pass`,
    solution: `def pacf_lag2_ma1(theta):
    r1 = theta / (1.0 + theta * theta)
    den = 1.0 - r1 * r1
    if den == 0:
        return 0.0
    return -(r1 * r1) / den`,
    testCases: [
      { input: [0.5], expected: -0.19047619047619047 },
      { input: [1.0], expected: -0.3333333333333333 },
      { input: [0.0], expected: 0.0 },
      { input: [2.0], expected: -0.19047619047619047 },
    ],
    hint: "The PACF at lag two is the coefficient on x[t-2] after removing the effect of x[t-1].",
  },
  {
    id: "ts-333",
    title: "Long-Run Variance Multiplier",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the long-run variance multiplier of a stationary series from its autocorrelations. For a list of autocorrelations r1, ..., rm, the multiplier is 1 + 2 * (r1 + ... + rm), which scales the variance when summing a long block of observations.\n\nAn empty list of autocorrelations gives a multiplier of 1.0.",
    starterCode: `def long_run_variance_multiplier(rhos):
    # Your code here
    pass`,
    solution: `def long_run_variance_multiplier(rhos):
    total = 0.0
    for r in rhos:
        total += r
    return 1.0 + 2.0 * total`,
    testCases: [
      { input: [[0.5]], expected: 2.0 },
      { input: [[0.5, 0.25]], expected: 2.5 },
      { input: [[]], expected: 1.0 },
      { input: [[-0.25, 0.0]], expected: 0.5 },
    ],
    hint: "Each autocorrelation appears twice in the double sum, once for +k and once for -k.",
  },
  {
    id: "ts-334",
    title: "Seasonal Index Normalization",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Normalize a list of multiplicative seasonal indices so that they average to one, by dividing each index by the mean of the list.\n\nReturn the indices unchanged when their mean is zero, and an empty list for empty input.",
    starterCode: `def normalize_seasonal_indices(indices):
    # Your code here
    pass`,
    solution: `def normalize_seasonal_indices(indices):
    if not indices:
        return []
    mean = sum(indices) / len(indices)
    if mean == 0:
        return list(indices)
    return [v / mean for v in indices]`,
    testCases: [
      { input: [[0.8, 1.2]], expected: [0.8, 1.2] },
      { input: [[2.0, 4.0]], expected: [0.6666666666666666, 1.3333333333333333] },
      { input: [[2, 0, 4]], expected: [1.0, 0.0, 2.0] },
      { input: [[0, 0]], expected: [0.0, 0.0] },
    ],
    hint: "Indices averaging to one preserve the overall level of a seasonal decomposition.",
  },
  {
    id: "ts-335",
    title: "Additive Decomposition Remainder",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the remainder of an additive decomposition by subtracting the trend and seasonal components from the observed series at every position, that is, remainder[t] = series[t] - trend[t] - seasonal[t].\n\nReturn an empty list when the three inputs do not all have the same length.",
    starterCode: `def additive_remainder(series, trend, seasonal):
    # Your code here
    pass`,
    solution: `def additive_remainder(series, trend, seasonal):
    if len(series) != len(trend) or len(series) != len(seasonal):
        return []
    return [series[t] - trend[t] - seasonal[t] for t in range(len(series))]`,
    testCases: [
      { input: [[10, 12, 14], [11, 12, 13], [0, 0, 0]], expected: [-1, 0, 1] },
      { input: [[5, 7, 9], [5, 7, 9], [1, 1, 1]], expected: [-1, -1, -1] },
      { input: [[1, 2], [1], []], expected: [] },
      { input: [[3, 3], [3, 3], [0, 0]], expected: [0, 0] },
    ],
    hint: "The remainder is what the trend and seasonal pattern fail to explain.",
  },
  {
    id: "ts-336",
    title: "Multiplicative Decomposition Ratios",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the remainder ratios of a multiplicative decomposition by dividing the observed series by the product of the trend and seasonal components: series[t] / (trend[t] * seasonal[t]).\n\nUse 0.0 for a position where the product of trend and seasonal is zero. Return an empty list when the inputs do not all have the same length.",
    starterCode: `def multiplicative_ratios(series, trend, seasonal):
    # Your code here
    pass`,
    solution: `def multiplicative_ratios(series, trend, seasonal):
    if len(series) != len(trend) or len(series) != len(seasonal):
        return []
    out = []
    for t in range(len(series)):
        den = trend[t] * seasonal[t]
        out.append(series[t] / den if den != 0 else 0.0)
    return out`,
    testCases: [
      { input: [[10, 20], [2, 4], [1, 1]], expected: [5.0, 5.0] },
      { input: [[12, 15], [3, 0], [1, 1]], expected: [4.0, 0.0] },
      { input: [[1], [1], [0]], expected: [0.0] },
      { input: [[1, 2], [1], []], expected: [] },
    ],
    hint: "Multiplicative decompositions divide, just as additive decompositions subtract.",
  },
  {
    id: "ts-337",
    title: "Smoothing Weight Decay",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the weight that exponential smoothing assigns to an observation j steps in the past, which is alpha * (1 - alpha)^j. The weights decay geometrically as the lag grows.\n\nReturn 0.0 for a negative lag.",
    starterCode: `def smoothing_weight(alpha, j):
    # Your code here
    pass`,
    solution: `def smoothing_weight(alpha, j):
    if j < 0:
        return 0.0
    return alpha * (1.0 - alpha) ** j`,
    testCases: [
      { input: [0.5, 0], expected: 0.5 },
      { input: [0.5, 2], expected: 0.125 },
      { input: [0.3, 1], expected: 0.21 },
      { input: [0.5, -1], expected: 0.0 },
    ],
    hint: "A larger alpha puts more weight on recent observations.",
  },
  {
    id: "ts-338",
    title: "SES Cumulative Weight",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the total weight that simple exponential smoothing puts on the first k observations, counting from the most recent observation backward. The geometric sum equals 1 - (1 - alpha)^k.\n\nReturn 0.0 when k is not positive.",
    starterCode: `def ses_cumulative_weight(alpha, k):
    # Your code here
    pass`,
    solution: `def ses_cumulative_weight(alpha, k):
    if k <= 0:
        return 0.0
    return 1.0 - (1.0 - alpha) ** k`,
    testCases: [
      { input: [0.5, 2], expected: 0.75 },
      { input: [0.5, 0], expected: 0.0 },
      { input: [0.3, 3], expected: 0.657 },
      { input: [1.0, 3], expected: 1.0 },
    ],
    hint: "The weights sum to one as k grows without bound.",
  },
  {
    id: "ts-339",
    title: "SES Closed-Form Forecast from Initial Level",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Compute the simple exponential smoothing level after passing through the whole series, starting from a supplied initial level l0. Instead of iterating, use the closed form: (1 - alpha)^n * l0 plus alpha times the geometrically weighted sum of the observations, with the most recent observation weighted most.\n\nReturn l0 itself for an empty series.",
    starterCode: `def ses_closed_form(series, alpha, l0):
    # Your code here
    pass`,
    solution: `def ses_closed_form(series, alpha, l0):
    total = ((1.0 - alpha) ** len(series)) * l0
    weight = alpha
    for x in reversed(series):
        total += weight * x
        weight *= 1.0 - alpha
    return total`,
    testCases: [
      { input: [[1, 2, 3], 0.5, 0.0], expected: 2.125 },
      { input: [[10], 0.4, 5.0], expected: 7.0 },
      { input: [[], 0.5, 3.0], expected: 3.0 },
      { input: [[1, 2], 1.0, 0.0], expected: 2.0 },
    ],
    hint: "The initial level inherits the weight (1 - alpha)^n after n observations.",
  },
  {
    id: "ts-340",
    title: "AR(2) One-Step Forecast",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the one-step-ahead forecast of a fitted AR(2) model: c + phi1 * y_t + phi2 * y_{t-1}, where y_t is the most recent observation and y_prev the one before it.\n\nAll coefficients are scalars and the forecast is returned as a float.",
    starterCode: `def ar2_one_step_forecast(c, phi1, phi2, y_t, y_prev):
    # Your code here
    pass`,
    solution: `def ar2_one_step_forecast(c, phi1, phi2, y_t, y_prev):
    return c + phi1 * y_t + phi2 * y_prev`,
    testCases: [
      { input: [0.5, 0.5, 0.25, 2.0, 1.0], expected: 1.75 },
      { input: [0.0, 0.7, -0.2, 5.0, 4.0], expected: 2.7 },
      { input: [1.0, 0.0, 0.0, 3.0, 9.0], expected: 1.0 },
      { input: [0.2, 0.5, 0.3, 0.0, 0.0], expected: 0.2 },
    ],
    hint: "An AR(2) forecast is a linear combination of the two most recent values plus the intercept.",
  },
  {
    id: "ts-341",
    title: "AR(1) h-Step Forecast",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Compute the h-step-ahead forecast of an AR(1) model with intercept c, autoregressive coefficient phi, and last observed value y_last. For phi not equal to one the closed form is c * (1 - phi^h) / (1 - phi) + phi^h * y_last.\n\nA unit root (phi = 1) requires the separate form y_last + c * h, and a horizon of zero or less returns the last observed value.",
    starterCode: `def ar1_h_step_forecast(c, phi, y_last, h):
    # Your code here
    pass`,
    solution: `def ar1_h_step_forecast(c, phi, y_last, h):
    if h <= 0:
        return y_last
    if phi == 1.0:
        return y_last + c * h
    return c * (1.0 - phi ** h) / (1.0 - phi) + phi ** h * y_last`,
    testCases: [
      { input: [0.5, 0.5, 2.0, 2], expected: 1.25 },
      { input: [0.0, 0.9, 10.0, 3], expected: 7.29 },
      { input: [1.0, 1.0, 3.0, 4], expected: 7.0 },
      { input: [0.5, 0.5, 2.0, 0], expected: 2.0 },
    ],
    hint: "Stationary forecasts decay toward the unconditional mean c / (1 - phi).",
  },
  {
    id: "ts-342",
    title: "AR(2) Stationarity Triangle",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Decide whether an AR(2) process with coefficients phi1 and phi2 is stationary using the stationarity triangle. The three conditions are |phi2| < 1, phi1 + phi2 < 1, and phi2 - phi1 < 1.\n\nReturn True only when all three conditions hold.",
    starterCode: `def ar2_is_stationary(phi1, phi2):
    # Your code here
    pass`,
    solution: `def ar2_is_stationary(phi1, phi2):
    return abs(phi2) < 1 and phi1 + phi2 < 1 and phi2 - phi1 < 1`,
    testCases: [
      { input: [0.5, 0.25], expected: true },
      { input: [1.0, 0.5], expected: false },
      { input: [-0.5, 0.9], expected: false },
      { input: [0.0, 0.0], expected: true },
      { input: [2.0, -0.5], expected: false },
    ],
    hint: "The conditions describe a triangle in the (phi1, phi2) plane whose corners are (0, -1), (2, -1), and (0, 1).",
  },
  {
    id: "ts-343",
    title: "MA(1) Autocovariances",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the lag-zero and lag-one autocovariances of an MA(1) process with coefficient theta and innovation variance sigma2. They are gamma0 = (1 + theta^2) * sigma2 and gamma1 = theta * sigma2.\n\nReturn a dict with keys gamma0 and gamma1.",
    starterCode: `def ma1_autocovariances(theta, sigma2):
    # Your code here
    pass`,
    solution: `def ma1_autocovariances(theta, sigma2):
    return {"gamma0": (1.0 + theta * theta) * sigma2, "gamma1": theta * sigma2}`,
    testCases: [
      { input: [0.5, 1.0], expected: { gamma0: 1.25, gamma1: 0.5 } },
      { input: [0.0, 2.0], expected: { gamma0: 2.0, gamma1: 0.0 } },
      { input: [1.0, 4.0], expected: { gamma0: 8.0, gamma1: 4.0 } },
      { input: [-0.5, 2.0], expected: { gamma0: 2.5, gamma1: -1.0 } },
    ],
    hint: "All autocovariances beyond lag one are exactly zero for an MA(1).",
  },
  {
    id: "ts-344",
    title: "MA(1) Forecast from Last Residual",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Forecast the next h values of an MA(1) process with mean mu, coefficient theta, and last observed residual e_last. The one-step forecast is mu + theta * e_last; every later forecast is the process mean mu because the memory of an MA(1) lasts only one step.\n\nReturn an empty list when h is not positive.",
    starterCode: `def ma1_forecast(mu, theta, e_last, h):
    # Your code here
    pass`,
    solution: `def ma1_forecast(mu, theta, e_last, h):
    if h <= 0:
        return []
    out = [mu + theta * e_last]
    for _ in range(h - 1):
        out.append(mu)
    return out`,
    testCases: [
      { input: [0.0, 0.5, 2.0, 3], expected: [1.0, 0.0, 0.0] },
      { input: [5.0, -0.4, 1.5, 2], expected: [4.4, 5.0] },
      { input: [1.0, 0.0, 9.0, 1], expected: [1.0] },
      { input: [0.0, 0.5, 2.0, 0], expected: [] },
    ],
    hint: "Only the one-step forecast depends on the most recent residual.",
  },
  {
    id: "ts-345",
    title: "Correlated Error Variance Accumulation",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Compute the variance of the sum of h forecast errors when each error has variance v and errors k steps apart have correlation rho^k. The result is v * (h + 2 * sum over k from 1 to h-1 of (h - k) * rho^k), which accounts for every correlated pair in the horizon.\n\nReturn 0.0 when h is not positive.",
    starterCode: `def correlated_error_variance(v, rho, h):
    # Your code here
    pass`,
    solution: `def correlated_error_variance(v, rho, h):
    if h <= 0:
        return 0.0
    total = 0.0
    for k in range(1, h):
        total += (h - k) * rho ** k
    return v * (h + 2.0 * total)`,
    testCases: [
      { input: [1.0, 0.5, 2], expected: 3.0 },
      { input: [2.0, 0.0, 3], expected: 6.0 },
      { input: [1.0, 0.5, 1], expected: 1.0 },
      { input: [1.0, 1.0, 3], expected: 9.0 },
      { input: [4.0, 0.25, 2], expected: 10.0 },
    ],
    hint: "There are h - k pairs of errors exactly k steps apart in a horizon of h.",
  },
  {
    id: "ts-346",
    title: "Seasonal Naive h-Step Forecast",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Forecast h steps beyond the end of a series with the seasonal naive method of period m. The forecast repeats the value one full season earlier, cycling through the last m observations: the index used is n - m + ((h - 1) mod m).\n\nReturn 0.0 when m is not positive, when the series is shorter than one full season, or when h is not positive.",
    starterCode: `def seasonal_naive_h_step(series, m, h):
    # Your code here
    pass`,
    solution: `def seasonal_naive_h_step(series, m, h):
    n = len(series)
    if m <= 0 or n < m or h < 1:
        return 0.0
    idx = n - m + ((h - 1) % m)
    return series[idx]`,
    testCases: [
      { input: [[10, 20, 30, 40, 50, 60], 2, 1], expected: 50 },
      { input: [[10, 20, 30, 40, 50, 60], 2, 2], expected: 60 },
      { input: [[10, 20, 30, 40, 50, 60], 2, 3], expected: 50 },
      { input: [[1, 2], 5, 1], expected: 0.0 },
      { input: [[1, 2, 3], 3, 2], expected: 2 },
    ],
    hint: "The forecast pattern wraps around the last complete season.",
  },
  {
    id: "ts-347",
    title: "Naive Forecast MAPE",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the mean absolute percentage error of the one-step naive forecast over the last h observations, where each forecast is the previous observation. Each error is 100 * |actual - forecast| / |actual|.\n\nObservations equal to zero are skipped because the percentage error is undefined. Return 0.0 when no valid observation remains or when h is outside the range 1 to n - 1.",
    starterCode: `def naive_mape(series, h):
    # Your code here
    pass`,
    solution: `def naive_mape(series, h):
    n = len(series)
    if n < 2 or h < 1 or h > n - 1:
        return 0.0
    total = 0.0
    count = 0
    for i in range(n - h, n):
        actual = series[i]
        if actual != 0:
            total += abs(actual - series[i - 1]) / abs(actual)
            count += 1
    if count == 0:
        return 0.0
    return 100.0 * total / count`,
    testCases: [
      { input: [[100, 110, 99], 2], expected: 10.1010101010101 },
      { input: [[0, 5], 1], expected: 100.0 },
      { input: [[0, 0], 1], expected: 0.0 },
      { input: [[1, 0, 5], 2], expected: 100.0 },
      { input: [[1, 2, 3], 5], expected: 0.0 },
    ],
    hint: "MAPE is undefined at zero actuals, so those points cannot contribute an error.",
  },
  {
    id: "ts-348",
    title: "Drift Forecast Holdout MAE",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Backtest a drift forecast on the last h observations of a series. Estimate the drift from the training prefix, forecast the test suffix as train_last + step * drift for each step, and return the mean absolute error of those h forecasts.\n\nReturn 0.0 when h is not positive or when fewer than two observations would remain for training (h greater than n - 2).",
    starterCode: `def drift_holdout_mae(series, h):
    # Your code here
    pass`,
    solution: `def drift_holdout_mae(series, h):
    n = len(series)
    if h < 1 or h > n - 2:
        return 0.0
    train = series[:n - h]
    m = len(train)
    drift = (train[-1] - train[0]) / (m - 1)
    total = 0.0
    for i in range(h):
        forecast = train[-1] + (i + 1) * drift
        total += abs(series[n - h + i] - forecast)
    return total / h`,
    testCases: [
      { input: [[1, 2, 4, 7, 11], 2], expected: 2.75 },
      { input: [[10, 10, 10, 10], 1], expected: 0.0 },
      { input: [[1, 2, 3], 1], expected: 0.0 },
      { input: [[1, 2], 1], expected: 0.0 },
      { input: [[1, 2, 3], 5], expected: 0.0 },
    ],
    hint: "The drift comes only from the training prefix; never use test values to fit it.",
  },
  {
    id: "ts-349",
    title: "Seasonal Naive MAE",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the in-sample mean absolute error of the seasonal naive method with period m. The error at time t is |x[t] - x[t-m]|, averaged over every t that has a full season of history.\n\nReturn 0.0 when m is not positive or when the series is not longer than one season.",
    starterCode: `def seasonal_naive_mae(series, m):
    # Your code here
    pass`,
    solution: `def seasonal_naive_mae(series, m):
    n = len(series)
    if m <= 0 or n <= m:
        return 0.0
    total = 0.0
    for t in range(m, n):
        total += abs(series[t] - series[t - m])
    return total / (n - m)`,
    testCases: [
      { input: [[1, 5, 2, 6, 3, 7], 2], expected: 1.0 },
      { input: [[2, 4, 2, 4], 2], expected: 0.0 },
      { input: [[1, 2, 3], 5], expected: 0.0 },
      { input: [[5, 7, 9], 1], expected: 2.0 },
    ],
    hint: "There are n - m seasonal naive errors in a series of length n.",
  },
  {
    id: "ts-350",
    title: "ARIMA Parameter Count",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Count the estimated parameters of an ARIMA(p, d, q) model. The autoregressive and moving average orders contribute p + q parameters, and an optional mean or constant adds one more.\n\nThe differencing order d contributes no parameters, so it does not appear in the count.",
    starterCode: `def arima_parameter_count(p, d, q, include_mean):
    # Your code here
    pass`,
    solution: `def arima_parameter_count(p, d, q, include_mean):
    count = p + q
    if include_mean:
        count += 1
    return count`,
    testCases: [
      { input: [1, 1, 1, true], expected: 3 },
      { input: [2, 0, 1, true], expected: 4 },
      { input: [1, 2, 1, false], expected: 2 },
      { input: [0, 0, 0, false], expected: 0 },
      { input: [2, 1, 0, true], expected: 3 },
    ],
    hint: "Differencing is a data transformation, not an estimated parameter.",
  },
  {
    id: "ts-351",
    title: "ARIMA(1,1,1) One-Step Forecast",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Compute a one-step forecast from an ARIMA(1,1,1) model fitted to a series. Work on the differenced scale: the predicted difference is c + phi * (y_now - y_prev) + theta * e_last, where e_last is the most recent residual.\n\nThe level forecast adds that predicted difference back onto the last observation, y_now + d_hat.",
    starterCode: `def arima_111_forecast(c, phi, theta, y_now, y_prev, e_last):
    # Your code here
    pass`,
    solution: `def arima_111_forecast(c, phi, theta, y_now, y_prev, e_last):
    d_hat = c + phi * (y_now - y_prev) + theta * e_last
    return y_now + d_hat`,
    testCases: [
      { input: [0.1, 0.5, 0.3, 10.0, 9.0, 0.5], expected: 10.75 },
      { input: [0.0, 0.0, 0.0, 5.0, 4.0, 1.0], expected: 5.0 },
      { input: [1.0, 1.0, 0.0, 3.0, 3.0, 0.0], expected: 4.0 },
      { input: [0.2, -0.5, 0.4, 8.0, 10.0, 1.0], expected: 9.6 },
    ],
    hint: "Forecast the difference first, then integrate it by adding it to the last level.",
  },
  {
    id: "ts-352",
    title: "AR(1) Forecast Error Variance at Horizon",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Compute the variance of the h-step-ahead forecast error for an AR(1) model with innovation variance sigma2 and coefficient phi. The standard result is sigma2 * (1 - phi^(2h)) / (1 - phi^2).\n\nWhen the absolute value of phi is at least one the process is not stationary, and the variance grows linearly as sigma2 * h. A horizon of zero or less gives 0.0.",
    starterCode: `def ar1_error_variance(sigma2, phi, h):
    # Your code here
    pass`,
    solution: `def ar1_error_variance(sigma2, phi, h):
    if h <= 0:
        return 0.0
    if abs(phi) >= 1.0:
        return sigma2 * h
    return sigma2 * (1.0 - phi ** (2 * h)) / (1.0 - phi * phi)`,
    testCases: [
      { input: [1.0, 0.5, 2], expected: 1.25 },
      { input: [1.0, 0.0, 5], expected: 1.0 },
      { input: [2.0, 1.0, 3], expected: 6.0 },
      { input: [2.0, -1.0, 3], expected: 6.0 },
      { input: [1.0, 0.5, 0], expected: 0.0 },
    ],
    hint: "The variance is bounded as h grows only when the process is stationary.",
  },
  {
    id: "ts-353",
    title: "ADF Lag-One Slope",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Run the core regression of an ADF-style stationarity test by hand. Regress the first difference at time t on the level at time t-1 without an intercept, so the slope is sum(x[t-1] * dx[t]) / sum(x[t-1]^2).\n\nReturn 0.0 when there are fewer than two observations or when the denominator is zero. A strongly negative slope is evidence of stationarity.",
    starterCode: `def adf_lag1_slope(series):
    # Your code here
    pass`,
    solution: `def adf_lag1_slope(series):
    n = len(series)
    if n < 2:
        return 0.0
    num = 0.0
    den = 0.0
    for t in range(1, n):
        x = series[t - 1]
        num += x * (series[t] - x)
        den += x * x
    if den == 0:
        return 0.0
    return num / den`,
    testCases: [
      { input: [[1, 2, 3, 4]], expected: 0.42857142857142855 },
      { input: [[0, 0, 0]], expected: 0.0 },
      { input: [[2, 1, 2, 1, 2]], expected: -0.2 },
      { input: [[5]], expected: 0.0 },
    ],
    hint: "The numerator telescopes: it is half of the change in the squared level.",
  },
  {
    id: "ts-354",
    title: "AR Coefficient Sum Stationarity Check",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Use a simple sufficient stationarity check for an AR(p) process: the sum of the absolute values of the autoregressive coefficients must be strictly less than one.\n\nReturn True for an empty coefficient list, which represents white noise.",
    starterCode: `def ar_sum_stationary(phis):
    # Your code here
    pass`,
    solution: `def ar_sum_stationary(phis):
    total = 0.0
    for phi in phis:
        total += abs(phi)
    return total < 1.0`,
    testCases: [
      { input: [[0.5, 0.3]], expected: true },
      { input: [[0.8, 0.4]], expected: false },
      { input: [[]], expected: true },
      { input: [[-0.5, 0.25]], expected: true },
      { input: [[1.0]], expected: false },
    ],
    hint: "The condition is sufficient but not necessary for stationarity.",
  },
  {
    id: "ts-355",
    title: "Additive Seasonal Deviations",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Estimate additive seasonal deviations by averaging each seasonal position separately and subtracting the overall series mean. Return one deviation per season, in season order 0 through m-1.\n\nReturn an empty list when m is not positive or m exceeds the series length.",
    starterCode: `def additive_seasonal_deviations(series, m):
    # Your code here
    pass`,
    solution: `def additive_seasonal_deviations(series, m):
    n = len(series)
    if m <= 0 or m > n:
        return []
    overall = sum(series) / n
    out = []
    for s in range(m):
        vals = series[s::m]
        out.append(sum(vals) / len(vals) - overall)
    return out`,
    testCases: [
      { input: [[1, 3, 2, 4], 2], expected: [-1.0, 1.0] },
      { input: [[5, 5, 5, 5], 2], expected: [0.0, 0.0] },
      { input: [[0, 6], 2], expected: [-3.0, 3.0] },
      { input: [[1, 2, 3], 5], expected: [] },
      { input: [[], 2], expected: [] },
    ],
    hint: "These deviations sum to zero, so they never shift the overall level.",
  },
  {
    id: "ts-356",
    title: "Deseasonalize by Period Means",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Remove an additive seasonal pattern by subtracting from every observation the mean of the seasonal position it belongs to. Observation t belongs to position t mod m.\n\nReturn an empty list when m is not positive or m exceeds the series length.",
    starterCode: `def deseasonalize_by_period_means(series, m):
    # Your code here
    pass`,
    solution: `def deseasonalize_by_period_means(series, m):
    n = len(series)
    if m <= 0 or m > n:
        return []
    means = []
    for s in range(m):
        vals = series[s::m]
        means.append(sum(vals) / len(vals))
    return [series[t] - means[t % m] for t in range(n)]`,
    testCases: [
      { input: [[1, 3, 2, 4], 2], expected: [-0.5, -0.5, 0.5, 0.5] },
      { input: [[5, 7, 9], 1], expected: [-2.0, 0.0, 2.0] },
      { input: [[3, 3, 3, 3], 2], expected: [0.0, 0.0, 0.0, 0.0] },
      { input: [[1, 2], 5], expected: [] },
    ],
    hint: "Subtracting a constant per season leaves the trend and the irregular part intact.",
  },
  {
    id: "ts-357",
    title: "Naive vs Seasonal Naive Selection",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Choose the better in-sample baseline for a series by comparing mean squared errors. The naive method uses the previous observation and the seasonal naive method uses the observation one season of length m earlier.\n\nReturn the string seasonal-naive when its MSE is strictly smaller, otherwise return naive. Return naive when the seasonal method cannot be computed or the series has fewer than two observations.",
    starterCode: `def choose_baseline(series, m):
    # Your code here
    pass`,
    solution: `def choose_baseline(series, m):
    n = len(series)
    if n < 2:
        return "naive"
    naive_mse = sum((series[t] - series[t - 1]) ** 2 for t in range(1, n)) / (n - 1)
    if m <= 0 or n <= m:
        return "naive"
    seasonal_mse = sum((series[t] - series[t - m]) ** 2 for t in range(m, n)) / (n - m)
    if seasonal_mse < naive_mse:
        return "seasonal-naive"
    return "naive"`,
    testCases: [
      { input: [[10, 20, 10, 20], 2], expected: "seasonal-naive" },
      { input: [[1, 2, 3, 4, 5], 1], expected: "naive" },
      { input: [[1, 3], 5], expected: "naive" },
      { input: [[5], 2], expected: "naive" },
      { input: [[1, 2, 3, 1, 2, 3], 3], expected: "seasonal-naive" },
    ],
    hint: "Ties go to the simpler naive method.",
  },
  {
    id: "ts-358",
    title: "Forecast Error Autocorrelation",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the lag-one autocorrelation of a list of forecast errors, using the biased estimator with division by the number of errors. The numerator sums (e[t] - mean) * (e[t+1] - mean) over consecutive pairs and the denominator is the total centered sum of squares.\n\nReturn 0.0 when there are fewer than three errors or when all errors are identical.",
    starterCode: `def forecast_error_autocorrelation(errors):
    # Your code here
    pass`,
    solution: `def forecast_error_autocorrelation(errors):
    n = len(errors)
    if n < 3:
        return 0.0
    mean = sum(errors) / n
    num = 0.0
    den = 0.0
    for t in range(n):
        centered = errors[t] - mean
        den += centered * centered
        if t < n - 1:
            num += centered * (errors[t + 1] - mean)
    if den == 0:
        return 0.0
    return num / den`,
    testCases: [
      { input: [[1, -1, 1, -1]], expected: -0.75 },
      { input: [[2, 4, 6, 8]], expected: 0.25 },
      { input: [[1, 2, 3]], expected: 0.0 },
      { input: [[1, 2]], expected: 0.0 },
      { input: [[3, 3, 3, 3]], expected: 0.0 },
    ],
    hint: "Autocorrelated residuals signal that a model has left structure on the table.",
  },
  {
    id: "ts-359",
    title: "Error Variance from Psi Weights",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the variance of a forecast error from the psi weights of a linear time series model. Given psi coefficients and an innovation variance sigma2, the h-step error variance is sigma2 times the sum of squared psi weights.\n\nAn empty psi list gives a variance of 0.0.",
    starterCode: `def error_variance_from_psi(psi, sigma2):
    # Your code here
    pass`,
    solution: `def error_variance_from_psi(psi, sigma2):
    total = 0.0
    for p in psi:
        total += p * p
    return sigma2 * total`,
    testCases: [
      { input: [[1, 0.5], 2.0], expected: 2.5 },
      { input: [[], 1.0], expected: 0.0 },
      { input: [[1], 0.5], expected: 0.5 },
      { input: [[1, -0.5, 0.25], 4.0], expected: 5.25 },
      { input: [[0, 0], 3.0], expected: 0.0 },
    ],
    hint: "The first psi weight is always 1, contributing the current innovation variance.",
  },
  {
    id: "ts-360",
    title: "AR(2) Forecast Error Variances to Horizon Two",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Compute the forecast error variances for horizons zero, one, and two of a stationary AR(2) with innovation variance sigma2 and coefficients phi1 and phi2. The psi weights are 1, phi1, and phi1^2 + phi2, so the variances are sigma2 times 1, 1 + phi1^2, and 1 + phi1^2 + (phi1^2 + phi2)^2.\n\nReturn the three variances as a list in horizon order.",
    starterCode: `def ar2_error_variances(sigma2, phi1, phi2):
    # Your code here
    pass`,
    solution: `def ar2_error_variances(sigma2, phi1, phi2):
    psi1 = phi1
    psi2 = phi1 * phi1 + phi2
    return [
        sigma2,
        sigma2 * (1.0 + psi1 * psi1),
        sigma2 * (1.0 + psi1 * psi1 + psi2 * psi2),
    ]`,
    testCases: [
      { input: [1.0, 0.5, 0.2], expected: [1.0, 1.25, 1.4525] },
      { input: [2.0, 0.0, 0.0], expected: [2.0, 2.0, 2.0] },
      { input: [1.0, -0.5, 0.25], expected: [1.0, 1.25, 1.5] },
      { input: [0.0, 1.0, 1.0], expected: [0.0, 0.0, 0.0] },
    ],
    hint: "Each psi weight comes from the recursion psi[k] = phi1 * psi[k-1] + phi2 * psi[k-2] with psi[0] = 1.",
  },
];
