import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "ts-181",
    title: "Geometric Mean Ratios",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Aggregate forecast accuracy multiplicatively. Compute the ratio forecast/actual for every point with a nonzero actual, then return the geometric mean of those ratios: the product raised to the power 1/k.\n\nReturn 0.0 when there are no usable ratios.",
    starterCode: `def geometric_mean_ratios(actual, forecast):
    # Your code here
    pass`,
    solution: `def geometric_mean_ratios(actual, forecast):
    ratios = [f / a for a, f in zip(actual, forecast) if a != 0]
    if not ratios:
        return 0.0
    prod = 1.0
    for r in ratios:
        prod *= r
    return prod ** (1.0 / len(ratios))`,
    testCases: [
      { input: [[100, 200], [110, 190]], expected: 1.0222524150130436 },
      { input: [[50], [55]], expected: 1.1 },
      { input: [[10, 10], [10, 10]], expected: 1.0 },
      { input: [[4, 8], [5, 6]], expected: 0.9682458365518543 },
    ],
    hint: "A value of 1.0 means the forecast is right on average in relative terms.",
  },
  {
    id: "ts-182",
    title: "Forecast Value Added",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the value a forecast adds over a naive benchmark: naive_error - forecast_error.\n\nPositive values mean the model beats the naive forecast; zero means it adds nothing.",
    starterCode: `def forecast_value_added(naive_error, forecast_error):
    # Your code here
    pass`,
    solution: `def forecast_value_added(naive_error, forecast_error):
    return naive_error - forecast_error`,
    testCases: [
      { input: [10, 7], expected: 3 },
      { input: [5, 5], expected: 0 },
      { input: [4, 9], expected: -5 },
      { input: [0, 0], expected: 0 },
    ],
    hint: "This is the error gap in favor of the more sophisticated forecast.",
  },
  {
    id: "ts-183",
    title: "SSA Trajectory Matrix Build",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Build the trajectory (Hankel) matrix used by singular spectrum analysis. With window length L, row i is series[i : i+L] for i = 0, ..., n-L.\n\nReturn a list of L-length rows, or an empty list if window is not positive or exceeds the series length.",
    starterCode: `def ssa_trajectory_matrix(series, window):
    # Your code here
    pass`,
    solution: `def ssa_trajectory_matrix(series, window):
    n = len(series)
    if window <= 0 or window > n:
        return []
    return [[series[i + j] for j in range(window)] for i in range(n - window + 1)]`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 3], expected: [[1, 2, 3], [2, 3, 4], [3, 4, 5]] },
      { input: [[1, 2], 2], expected: [[1, 2]] },
      { input: [[1, 2], 0], expected: [] },
      { input: [[1, 2, 3], 5], expected: [] },
    ],
    hint: "The matrix is constant along its anti-diagonals.",
  },
  {
    id: "ts-184",
    title: "Phase-Space Embedding",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Embed a scalar series into delay coordinates: row i is [x[i], x[i+delay], ..., x[i+(dim-1)*delay]].\n\nReturn the list of embedding vectors. Return an empty list when dim or delay is not positive, or when the series is too short to form one vector.",
    starterCode: `def phase_space_embed(series, dim, delay):
    # Your code here
    pass`,
    solution: `def phase_space_embed(series, dim, delay):
    if dim < 1 or delay < 1:
        return []
    m = len(series) - (dim - 1) * delay
    if m <= 0:
        return []
    return [[series[i + j * delay] for j in range(dim)] for i in range(m)]`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 2, 1], expected: [[1, 2], [2, 3], [3, 4], [4, 5]] },
      { input: [[1, 2, 3, 4], 2, 2], expected: [[1, 3], [2, 4]] },
      { input: [[1, 2, 3], 3, 1], expected: [[1, 2, 3]] },
      { input: [[1, 2], 3, 1], expected: [] },
    ],
    hint: "The number of embedded vectors is n - (dim - 1) * delay.",
  },
  {
    id: "ts-185",
    title: "Prophet-Style Trend and Seasonality",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Evaluate a Prophet-style point forecast with a linear trend and one sinusoidal seasonality: intercept + slope * t + amplitude * sin(2 * pi * t / period).\n\nReturn the forecast for time t.",
    starterCode: `import math
def prophet_point(t, trend_slope, trend_intercept, seasonal_amplitude, period):
    # Your code here
    pass`,
    solution: `import math
def prophet_point(t, trend_slope, trend_intercept, seasonal_amplitude, period):
    return trend_intercept + trend_slope * t + seasonal_amplitude * math.sin(2.0 * math.pi * t / period)`,
    testCases: [
      { input: [0, 1, 10, 2, 4], expected: 10.0 },
      { input: [1, 1, 10, 2, 4], expected: 13.0 },
      { input: [2, 1, 10, 2, 4], expected: 12.0 },
      { input: [1, 0, 5, 0, 4], expected: 5.0 },
    ],
    hint: "At t = period/2 the sine term vanishes; at t = 0 it also vanishes.",
  },
  {
    id: "ts-186",
    title: "Error Correction Step",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Apply one error-correction adjustment: change = short_run_change - adjustment_speed * spread_prev.\n\nA positive previous spread pulls the change downward toward the long-run equilibrium.",
    starterCode: `def error_correction_step(spread_prev, short_run_change, adjustment_speed):
    # Your code here
    pass`,
    solution: `def error_correction_step(spread_prev, short_run_change, adjustment_speed):
    return short_run_change - adjustment_speed * spread_prev`,
    testCases: [
      { input: [2, 0.5, 0.1], expected: 0.3 },
      { input: [0, 1, 0.3], expected: 1.0 },
      { input: [-1, 0, 0.5], expected: 0.5 },
      { input: [5, 2, 0], expected: 2 },
    ],
    hint: "adjustment_speed is often called alpha in the ECM literature.",
  },
  {
    id: "ts-187",
    title: "Transfer Function Step",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Evaluate one step of a transfer function with a single lagged input: intercept + gain * x_lag.\n\nReturn the output value.",
    starterCode: `def transfer_function_step(x_lag, intercept, gain):
    # Your code here
    pass`,
    solution: `def transfer_function_step(x_lag, intercept, gain):
    return intercept + gain * x_lag`,
    testCases: [
      { input: [2, 1, 0.5], expected: 2.0 },
      { input: [0, 3, 2], expected: 3 },
      { input: [5, 0, 1], expected: 5 },
      { input: [-1, 1, 1], expected: 0 },
    ],
    hint: "This is the impulse response of a zero-order-plus-lag transfer function.",
  },
  {
    id: "ts-188",
    title: "Intervention Pulse Value",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the effect of a pulse intervention at a given distance: pulse_effect * decay^distance.\n\nReturn 0.0 for negative distance, since a pulse cannot affect the past.",
    starterCode: `def intervention_pulse_value(pulse_effect, decay, distance):
    # Your code here
    pass`,
    solution: `def intervention_pulse_value(pulse_effect, decay, distance):
    if distance < 0:
        return 0.0
    return pulse_effect * decay ** distance`,
    testCases: [
      { input: [10, 0.5, 0], expected: 10.0 },
      { input: [10, 0.5, 3], expected: 1.25 },
      { input: [5, 1.0, 10], expected: 5.0 },
      { input: [10, 0.5, -1], expected: 0.0 },
    ],
    hint: "A pulse affects one period; the effect then decays geometrically.",
  },
  {
    id: "ts-189",
    title: "Level Shift Detect",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Detect a level shift by splitting the series in half and comparing means: return True when abs(mean_first_half - mean_second_half) > threshold.\n\nReturn False for a series with fewer than two points.",
    starterCode: `def level_shift_detect(series, threshold):
    # Your code here
    pass`,
    solution: `def level_shift_detect(series, threshold):
    n = len(series)
    if n < 2:
        return False
    h = n // 2
    a = series[:h]
    b = series[h:]
    if not a or not b:
        return False
    return abs(sum(a) / len(a) - sum(b) / len(b)) > threshold`,
    testCases: [
      { input: [[1, 1, 1, 5, 5, 5], 2.0], expected: true },
      { input: [[1, 2, 3, 4], 10], expected: false },
      { input: [[1, 2], 0.4], expected: true },
      { input: [[5, 5, 5, 5], 0], expected: false },
    ],
    hint: "The comparison is strict, so a difference exactly at the threshold is not a shift.",
  },
  {
    id: "ts-190",
    title: "Temporal Hierarchy Aggregation",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Aggregate a series at several temporal scales. For each scale k in scales, sum each complete group of k consecutive values and drop the trailing partial group.\n\nReturn a list with one list of sums per scale, in the same order as scales.",
    starterCode: `def temporal_hierarchy_aggregation(series, scales):
    # Your code here
    pass`,
    solution: `def temporal_hierarchy_aggregation(series, scales):
    out = []
    for k in scales:
        row = []
        if k > 0:
            for i in range(0, len(series) - k + 1, k):
                row.append(sum(series[i:i + k]))
        out.append(row)
    return out`,
    testCases: [
      { input: [[1, 2, 3, 4, 5, 6], [1, 3]], expected: [[1, 2, 3, 4, 5, 6], [6, 15]] },
      { input: [[1, 2, 3], [2, 5]], expected: [[3], []] },
      { input: [[], [1]], expected: [[]] },
      { input: [[1, 2, 3, 4], [2]], expected: [[3, 7]] },
    ],
    hint: "Scale 1 reproduces the original series as one-element sums.",
  },
  {
    id: "ts-191",
    title: "Forecast Pooling Weight",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Combine two forecasts with a fixed weight: w1 * f1 + (1 - w1) * f2.\n\nReturn the pooled forecast. The weight w1 is between 0 and 1.",
    starterCode: `def forecast_pooling_weight(f1, f2, w1):
    # Your code here
    pass`,
    solution: `def forecast_pooling_weight(f1, f2, w1):
    return w1 * f1 + (1 - w1) * f2`,
    testCases: [
      { input: [10, 20, 0.5], expected: 15.0 },
      { input: [10, 20, 1.0], expected: 10.0 },
      { input: [10, 20, 0.0], expected: 20.0 },
      { input: [3, 5, 0.25], expected: 4.5 },
    ],
    hint: "Simple averaging corresponds to w1 = 0.5.",
  },
  {
    id: "ts-192",
    title: "Variogram Value",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the empirical variogram at lag h: 0.5 times the mean squared difference (x[t+h] - x[t])^2 over all valid t.\n\nReturn 0.0 when h is not positive or h is at least the series length.",
    starterCode: `def variogram_value(series, h):
    # Your code here
    pass`,
    solution: `def variogram_value(series, h):
    n = len(series)
    if h < 1 or h >= n:
        return 0.0
    total = sum((series[t + h] - series[t]) ** 2 for t in range(n - h))
    return 0.5 * total / (n - h)`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 1], expected: 0.5 },
      { input: [[1, 3, 5, 7], 2], expected: 8.0 },
      { input: [[5, 5, 5], 1], expected: 0.0 },
      { input: [[1, 2, 3], 5], expected: 0.0 },
    ],
    hint: "The variogram measures half the expected squared change at a given lag.",
  },
  {
    id: "ts-193",
    title: "Relative Error Aggregation",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Aggregate relative error as weighted absolute percentage error: sum(abs(actual - forecast)) / sum(abs(actual)).\n\nReturn 0.0 when actual is empty or its absolute sum is zero.",
    starterCode: `def relative_error_aggregation(actual, forecast):
    # Your code here
    pass`,
    solution: `def relative_error_aggregation(actual, forecast):
    if not actual:
        return 0.0
    den = sum(abs(a) for a in actual)
    if den == 0:
        return 0.0
    return sum(abs(a - f) for a, f in zip(actual, forecast)) / den`,
    testCases: [
      { input: [[100, 200], [110, 190]], expected: 0.06666666666666667 },
      { input: [[10, 20, 30], [12, 18, 33]], expected: 0.11666666666666667 },
      { input: [[5, 5], [5, 5]], expected: 0.0 },
      { input: [[0, 0], [1, 1]], expected: 0.0 },
    ],
    hint: "WAPE scales total error by total volume rather than averaging per-point ratios.",
  },
  {
    id: "ts-194",
    title: "Scaled Error Aggregation",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the mean absolute error divided by a user-supplied scale: mean(abs(actual - forecast)) / scale.\n\nReturn 0.0 when actual is empty or the scale is zero.",
    starterCode: `def scaled_error_aggregation(actual, forecast, scale):
    # Your code here
    pass`,
    solution: `def scaled_error_aggregation(actual, forecast, scale):
    if not actual or scale == 0:
        return 0.0
    return sum(abs(a - f) for a, f in zip(actual, forecast)) / len(actual) / scale`,
    testCases: [
      { input: [[1, 2, 3], [1, 1, 1], 1.0], expected: 1.0 },
      { input: [[10, 20], [12, 18], 2.0], expected: 1.0 },
      { input: [[5], [5], 3], expected: 0.0 },
      { input: [[1, 2], [3, 4], 0], expected: 0.0 },
    ],
    hint: "The scale is usually the in-sample error of a naive benchmark.",
  },
  {
    id: "ts-195",
    title: "Recurrence Rate",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the recurrence rate: the fraction of unordered pairs (i, j) with abs(x[i] - x[j]) <= threshold.\n\nReturn 0.0 for a series with fewer than two points. Pairs are counted once.",
    starterCode: `def recurrence_rate(series, threshold):
    # Your code here
    pass`,
    solution: `def recurrence_rate(series, threshold):
    n = len(series)
    if n < 2:
        return 0.0
    pairs = 0
    rec = 0
    for i in range(n):
        for j in range(i + 1, n):
            pairs += 1
            if abs(series[i] - series[j]) <= threshold:
                rec += 1
    return rec / pairs`,
    testCases: [
      { input: [[1, 2, 3, 4], 1.0], expected: 0.5 },
      { input: [[1, 1, 1], 0], expected: 1.0 },
      { input: [[0, 10], 5], expected: 0.0 },
      { input: [[1, 2], 1.0], expected: 1.0 },
    ],
    hint: "This is the simplest point of a recurrence plot: its overall density.",
  },
  {
    id: "ts-196",
    title: "Wavelet Energy Share",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the share of signal energy carried by the first-level Haar detail coefficients. Split the series into consecutive pairs; each pair gives approximation (a + b)/sqrt(2) and detail (b - a)/sqrt(2).\n\nReturn the detail energy divided by the total energy of both coefficient types, or 0.0 when total energy is zero or the series has fewer than two points.",
    starterCode: `def wavelet_energy_share(series):
    # Your code here
    pass`,
    solution: `def wavelet_energy_share(series):
    n = len(series)
    m = n - (n % 2)
    if m == 0:
        return 0.0
    approx = []
    detail = []
    for i in range(0, m, 2):
        a = (series[i] + series[i + 1]) / 2.0 ** 0.5
        d = (series[i + 1] - series[i]) / 2.0 ** 0.5
        approx.append(a)
        detail.append(d)
    total = sum(a * a for a in approx) + sum(d * d for d in detail)
    if total == 0:
        return 0.0
    return sum(d * d for d in detail) / total`,
    testCases: [
      { input: [[1, 2, 3, 4]], expected: 0.033333333333333326 },
      { input: [[1, 1, 1, 1]], expected: 0.0 },
      { input: [[1, 0, 1, 0]], expected: 0.5 },
      { input: [[2, 2, 2, 3]], expected: 0.023809523809523808 },
    ],
    hint: "A high detail share means the series changes quickly at the finest scale.",
  },
  {
    id: "ts-197",
    title: "Forecastability Score",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Score how forecastable a series is as 1 - Var(differences) / Var(levels), using population variances. A perfectly linear or smooth series scores near 1; white noise scores near 0. Clamp the result to [0, 1].\n\nReturn 0.0 when the series has fewer than two points or zero level variance.",
    starterCode: `def forecastability_score(series):
    # Your code here
    pass`,
    solution: `def forecastability_score(series):
    n = len(series)
    if n < 2:
        return 0.0
    m = sum(series) / n
    var_level = sum((x - m) ** 2 for x in series) / n
    if var_level == 0:
        return 0.0
    diffs = [series[t] - series[t - 1] for t in range(1, n)]
    md = sum(diffs) / len(diffs)
    var_diff = sum((d - md) ** 2 for d in diffs) / len(diffs)
    score = 1.0 - var_diff / var_level
    if score < 0:
        return 0.0
    if score > 1:
        return 1.0
    return score`,
    testCases: [
      { input: [[1, 2, 3, 4]], expected: 1.0 },
      { input: [[5, 5, 5]], expected: 0.0 },
      { input: [[1, -1, 1, -1, 1]], expected: 0.0 },
      { input: [[1, 1, 2, 2, 3, 3]], expected: 0.6399999999999999 },
    ],
    hint: "Smooth, drifting series are easier to extrapolate than jumpy ones.",
  },
  {
    id: "ts-198",
    title: "Spectral Entropy",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the normalized spectral entropy of a series. Take the periodogram powers at bins k = 0..n//2, normalize them into a distribution, compute the Shannon entropy in nats, and divide by log(number of bins).\n\nReturn 0.0 when there are fewer than two points or total power is zero. A pure tone gives near 0; white noise gives near 1.",
    starterCode: `import math
def spectral_entropy(series):
    # Your code here
    pass`,
    solution: `import math
def spectral_entropy(series):
    n = len(series)
    if n < 2:
        return 0.0
    powers = []
    for k in range(n // 2 + 1):
        re = sum(series[t] * math.cos(2.0 * math.pi * k * t / n) for t in range(n))
        im = -sum(series[t] * math.sin(2.0 * math.pi * k * t / n) for t in range(n))
        powers.append(re * re + im * im)
    total = sum(powers)
    if total == 0:
        return 0.0
    ent = 0.0
    for p in powers:
        if p > 0:
            pr = p / total
            ent -= pr * math.log(pr)
    return ent / math.log(len(powers))`,
    testCases: [
      { input: [[1, 2, 3, 4]], expected: 0.37201270119579155 },
      { input: [[5, 5, 5, 5]], expected: 3.8340693177808697e-31 },
      { input: [[0, 1, 0, 1]], expected: 0.6309297535714574 },
      { input: [[1, -1, 1, -1]], expected: 1.2859084648443834e-31 },
    ],
    hint: "A flat spectrum maximizes entropy; a single spike minimizes it.",
  },
  {
    id: "ts-199",
    title: "Lempel-Ziv Complexity",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Estimate Lempel-Ziv complexity. Binarize the series with 1 when x is above the mean and 0 otherwise, parse the string into distinct phrases, and return the phrase count times log2(n) divided by n.\n\nReturn 0.0 for fewer than two points.",
    starterCode: `import math
def lempel_ziv_complexity(series):
    # Your code here
    pass`,
    solution: `import math
def lempel_ziv_complexity(series):
    n = len(series)
    if n < 2:
        return 0.0
    m = sum(series) / n
    s = "".join("1" if x > m else "0" for x in series)
    c = 1
    l = 1
    i = 0
    while i + l <= n:
        if s[i:i + l] in s[0:i + l - 1]:
            l += 1
        else:
            c += 1
            i += l
            l = 1
    return c * math.log(n, 2) / n`,
    testCases: [
      { input: [[1, 2, 1, 2, 1, 2]], expected: 1.292481250360578 },
      { input: [[1, 1, 1, 1]], expected: 1.0 },
      { input: [[1, 2, 3, 4, 5, 6, 7, 8]], expected: 1.125 },
      { input: [[0, 1, 0, 1, 0, 1, 0, 1]], expected: 1.125 },
    ],
    hint: "Regular repeating patterns are compressible, so complexity is low.",
  },
  {
    id: "ts-200",
    title: "Detrended Fluctuation",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute a single-scale detrended fluctuation. Integrate the mean-adjusted series into a profile, detrend the profile with an OLS line against time, and return the root mean squared residual.\n\nReturn 0.0 for fewer than two points.",
    starterCode: `def detrended_fluctuation(series):
    # Your code here
    pass`,
    solution: `def detrended_fluctuation(series):
    n = len(series)
    if n < 2:
        return 0.0
    m = sum(series) / n
    y = []
    acc = 0.0
    for x in series:
        acc += x - m
        y.append(acc)
    mt = (n - 1) / 2.0
    my = sum(y) / n
    num = sum((t - mt) * (y[t] - my) for t in range(n))
    den = sum((t - mt) ** 2 for t in range(n))
    slope = 0.0 if den == 0 else num / den
    intercept = my - slope * mt
    resid = [y[t] - (intercept + slope * t) for t in range(n)]
    return (sum(r * r for r in resid) / n) ** 0.5`,
    testCases: [
      { input: [[1, 2, 3, 4, 5]], expected: 0.8366600265340756 },
      { input: [[5, 5, 5]], expected: 0.0 },
      { input: [[1, -1, 1, -1]], expected: 0.4472135954999579 },
      { input: [[1, 2, 1, 2, 1, 2]], expected: 0.2390457218668787 },
    ],
    hint: "Detrending the integrated profile removes slow drift before measuring fluctuation.",
  },
  {
    id: "ts-201",
    title: "Multifractal Width Lite",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Estimate multifractal width as the gap between two scaling exponents. Let d1 be absolute one-step changes and d2 absolute two-step changes; compute H1 = log2(mean(d2) / mean(d1)) and H2 = log2(rms(d2) / rms(d1)); return abs(H1 - H2).\n\nReturn 0.0 when there are fewer than three points or a denominator is zero.",
    starterCode: `import math
def multifractal_width_lite(series):
    # Your code here
    pass`,
    solution: `import math
def multifractal_width_lite(series):
    n = len(series)
    if n < 3:
        return 0.0
    d1 = [abs(series[t] - series[t - 1]) for t in range(1, n)]
    d2 = [abs(series[t] - series[t - 2]) for t in range(2, n)]
    m1 = sum(d1) / len(d1)
    m2 = sum(d2) / len(d2)
    if m1 <= 0 or m2 <= 0:
        return 0.0
    h1 = math.log(m2 / m1) / math.log(2)
    r1 = (sum(x * x for x in d1) / len(d1)) ** 0.5
    r2 = (sum(x * x for x in d2) / len(d2)) ** 0.5
    if r1 <= 0 or r2 <= 0:
        return 0.0
    h2 = math.log(r2 / r1) / math.log(2)
    return abs(h1 - h2)`,
    testCases: [
      { input: [[1, 2, 3, 4, 5]], expected: 0.0 },
      { input: [[1, 1, 1, 2, 10]], expected: 0.19192974728965728 },
      { input: [[1, 2, 4, 8, 16]], expected: 0.11651983276797817 },
      { input: [[3, 3, 3, 3]], expected: 0.0 },
    ],
    hint: "A monofractal signal gives nearly equal exponents, so the width is near zero.",
  },
  {
    id: "ts-202",
    title: "EMD First IMF",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Extract the first intrinsic mode function with lite empirical mode decomposition. Build upper and lower envelopes by linearly interpolating through local maxima and minima (endpoints count as extrema), subtract their average from the signal, and repeat the sifting for the given number of iterations.\n\nReturn the final IMF. Series with fewer than three points are returned unchanged.",
    starterCode: `def emd_first_imf(series, iterations):
    # Your code here
    pass`,
    solution: `def emd_first_imf(series, iterations):
    n = len(series)
    if n < 3:
        return list(series)

    def interp(xs, ys, t):
        if t <= xs[0]:
            return ys[0]
        if t >= xs[-1]:
            return ys[-1]
        for i in range(len(xs) - 1):
            if xs[i] <= t <= xs[i + 1]:
                f = (t - xs[i]) / (xs[i + 1] - xs[i])
                return ys[i] + f * (ys[i + 1] - ys[i])
        return ys[-1]

    x = list(series)
    for _ in range(iterations):
        max_idx = [0] + [i for i in range(1, n - 1) if x[i] >= x[i - 1] and x[i] >= x[i + 1]] + [n - 1]
        min_idx = [0] + [i for i in range(1, n - 1) if x[i] <= x[i - 1] and x[i] <= x[i + 1]] + [n - 1]
        upper = [interp(max_idx, [x[i] for i in max_idx], t) for t in range(n)]
        lower = [interp(min_idx, [x[i] for i in min_idx], t) for t in range(n)]
        mean_env = [(upper[t] + lower[t]) / 2.0 for t in range(n)]
        x = [x[t] - mean_env[t] for t in range(n)]
    return x`,
    testCases: [
      { input: [[1, 3, 2, 5, 4], 2], expected: [0.0, 0.625, -0.9375, 0.75, 0.0] },
      { input: [[1, 2, 4, 7, 11], 1], expected: [0.0, -1.5, -2.0, -1.5, 0.0] },
      {
        input: [[3, 1, 4, 1, 5, 9, 2, 6], 1],
        expected: [0.0, -1.25, 1.5, -2.333333333333333, 0.666666666666667, 3.666666666666667, -2.75, 0.0],
      },
      { input: [[5, 5, 5], 1], expected: [0.0, 0.0, 0.0] },
    ],
    hint: "Sifting removes the local mean so the IMF oscillates around zero.",
  },
  {
    id: "ts-203",
    title: "SSA Eigenvalue Pair Count",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Count how many oscillatory pairs the SSA spectrum suggests. Given singular values and a relative tolerance, count values greater than tolerance * max(singular_values) and return that count divided by 2 using integer division, since oscillations appear as eigenvalue pairs.\n\nReturn 0 for an empty list or a non-positive maximum.",
    starterCode: `def ssa_eigenvalue_pair_count(singular_values, tolerance):
    # Your code here
    pass`,
    solution: `def ssa_eigenvalue_pair_count(singular_values, tolerance):
    if not singular_values:
        return 0
    mx = max(singular_values)
    if mx <= 0:
        return 0
    count = sum(1 for v in singular_values if v > tolerance * mx)
    return count // 2`,
    testCases: [
      { input: [[5, 4, 3, 2, 1], 0.1], expected: 2 },
      { input: [[5, 1, 1], 0.2], expected: 0 },
      { input: [[1, 1, 1, 1], 0], expected: 2 },
      { input: [[], 0.1], expected: 0 },
    ],
    hint: "A pair of similar leading singular values usually indicates one oscillation.",
  },
  {
    id: "ts-204",
    title: "Correlation Dimension Lite",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Estimate the correlation dimension from the slope of the log-log correlation integral. For each positive radius r, C(r) is the fraction of point pairs with abs(x[i] - x[j]) <= r; return (ln C(r_last) - ln C(r_first)) / (ln r_last - ln r_first) using the first and last radii with nonzero C.\n\nReturn 0.0 when fewer than two such radii exist.",
    starterCode: `import math
def correlation_dimension_lite(series, radii):
    # Your code here
    pass`,
    solution: `import math
def correlation_dimension_lite(series, radii):
    n = len(series)
    if n < 2 or len(radii) < 2:
        return 0.0
    dists = []
    for i in range(n):
        for j in range(i + 1, n):
            dists.append(abs(series[i] - series[j]))
    pairs = len(dists)
    valid = []
    for r in radii:
        if r <= 0:
            continue
        c = sum(1 for d in dists if d <= r) / pairs
        if c > 0:
            valid.append((r, c))
    if len(valid) < 2:
        return 0.0
    r1, c1 = valid[0]
    r2, c2 = valid[-1]
    if r1 == r2:
        return 0.0
    return (math.log(c2) - math.log(c1)) / (math.log(r2) - math.log(r1))`,
    testCases: [
      { input: [[1, 2, 4, 8], [1, 2, 4, 8]], expected: 0.8616541669070521 },
      { input: [[1, 2, 3, 4], [0.5, 1, 2]], expected: 0.7369655941662062 },
      { input: [[5, 5, 5], [1, 2]], expected: 0.0 },
      { input: [[1, 2], [1, 2]], expected: 0.0 },
    ],
    hint: "The slope of the correlation integral on a log-log plot estimates the dimension.",
  },
  {
    id: "ts-205",
    title: "Lyapunov Exponent Lite",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Estimate the largest Lyapunov exponent with a Rosenstein-style lite method. Embed the series with dim and delay, find each point's nearest neighbor among the first m - steps points (excluding itself), measure the divergence steps ahead, and average log(d1 / d0) divided by steps.\n\nReturn 0.0 when parameters are invalid or no usable pairs exist.",
    starterCode: `import math
def lyapunov_exponent_lite(series, delay, dim, steps):
    # Your code here
    pass`,
    solution: `import math
def lyapunov_exponent_lite(series, delay, dim, steps):
    n = len(series)
    if dim < 1 or delay < 1 or steps < 1:
        return 0.0
    m = n - (dim - 1) * delay
    if m - steps <= 1:
        return 0.0
    emb = [[series[i + j * delay] for j in range(dim)] for i in range(m)]
    logs = []
    for i in range(m - steps):
        best = None
        best_d = None
        for j in range(m - steps):
            if j == i:
                continue
            d0 = sum((emb[i][k] - emb[j][k]) ** 2 for k in range(dim)) ** 0.5
            if d0 > 0 and (best_d is None or d0 < best_d):
                best_d = d0
                best = j
        if best is None:
            continue
        d1 = sum((emb[i + steps][k] - emb[best + steps][k]) ** 2 for k in range(dim)) ** 0.5
        if d1 > 0:
            logs.append(math.log(d1 / best_d))
    if not logs:
        return 0.0
    return sum(logs) / len(logs) / steps`,
    testCases: [
      { input: [[1, 4, 9, 16, 25, 36, 49, 64], 1, 2, 2], expected: 0.2578490070148772 },
      { input: [[1, 3, 2, 5, 4, 8, 7, 10], 1, 2, 2], expected: 0.15763680111818276 },
      { input: [[0, 1, 2, 4, 8, 16, 32, 64], 1, 2, 3], expected: 0.653980211456134 },
      { input: [[1, 2, 1, 2, 1, 2, 1, 2], 1, 2, 1], expected: 0.0 },
    ],
    hint: "Positive exponents indicate sensitive dependence on initial conditions.",
  },
  {
    id: "ts-206",
    title: "Delay via Mutual Information",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Choose an embedding delay by mutual information. For each lag k from 1 to max_delay compute the mutual information between x[:-k] and x[k:] using four equal-width bins over the combined range, and return the lag with the largest value (the smallest lag wins ties).\n\nReturn 1 when the parameters are invalid or all values tie at zero.",
    starterCode: `import math
def delay_mutual_information(series, max_delay):
    # Your code here
    pass`,
    solution: `import math
def delay_mutual_information(series, max_delay):
    n = len(series)
    if n < 4 or max_delay < 1:
        return 0

    def mi(x, y, bins=4):
        lo = min(min(x), min(y))
        hi = max(max(x), max(y))
        if hi == lo:
            return 0.0
        w = (hi - lo) / bins

        def binof(v):
            idx = int((v - lo) / w)
            if idx >= bins:
                idx = bins - 1
            return idx

        joint = {}
        cx = [0] * bins
        cy = [0] * bins
        for a, b in zip(x, y):
            i = binof(a)
            j = binof(b)
            joint[(i, j)] = joint.get((i, j), 0) + 1
            cx[i] += 1
            cy[j] += 1
        total = 0.0
        m = len(x)
        for (i, j), c in joint.items():
            pxy = c / m
            px = cx[i] / m
            py = cy[j] / m
            total += pxy * math.log(pxy / (px * py))
        return total

    best_k = 1
    best_mi = -1.0
    for k in range(1, max_delay + 1):
        a = series[:-k]
        b = series[k:]
        if len(a) < 2:
            break
        value = mi(a, b)
        if value > best_mi + 1e-12:
            best_mi = value
            best_k = k
    return best_k`,
    testCases: [
      { input: [[1, 2, 1, 2, 1, 2, 1, 2], 3], expected: 2 },
      { input: [[1, 2, 3, 4, 5, 6, 7, 8], 3], expected: 2 },
      { input: [[5, 5, 5, 5, 5], 3], expected: 1 },
      { input: [[0, 1, 0, 1, 1, 0, 1, 0], 4], expected: 4 },
    ],
    hint: "The first minimum of mutual information is the classical delay choice, but here we take the maximum.",
  },
  {
    id: "ts-207",
    title: "False Nearest Neighbors Count",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Count false nearest neighbors when increasing the embedding dimension by one. For each point in dimension `dim`, find its nearest neighbor and compare the extra next-coordinate distance to the current distance; count a point when extra / distance > threshold.\n\nReturn 0 when parameters are invalid, fewer than two embedding vectors exist, or all distances are zero.",
    starterCode: `def false_nearest_neighbors_count(series, dim, delay, threshold):
    # Your code here
    pass`,
    solution: `def false_nearest_neighbors_count(series, dim, delay, threshold):
    n = len(series)
    if dim < 1 or delay < 1:
        return 0
    m = n - dim * delay
    if m <= 1:
        return 0
    count = 0
    for i in range(m):
        best_d = None
        best_j = None
        for j in range(m):
            if j == i:
                continue
            d = sum((series[i + k * delay] - series[j + k * delay]) ** 2 for k in range(dim)) ** 0.5
            if best_d is None or d < best_d:
                best_d = d
                best_j = j
        if best_d is None or best_d == 0:
            continue
        extra = abs(series[i + dim * delay] - series[best_j + dim * delay])
        if extra / best_d > threshold:
            count += 1
    return count`,
    testCases: [
      { input: [[1, 1.1, 1.2, 5, 5.1, 5.2], 1, 1, 1.0], expected: 4 },
      { input: [[1, 2, 3, 4, 5, 6], 1, 1, 10.0], expected: 0 },
      { input: [[1, 2, 3, 4, 5], 2, 1, 0.5], expected: 3 },
      { input: [[5, 5, 5, 5], 1, 1, 1.0], expected: 0 },
    ],
    hint: "A high false-neighbor fraction means the embedding dimension is still too small.",
  },
  {
    id: "ts-208",
    title: "Nonlinearity Test Statistic",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute a BDS-style nonlinearity statistic as C2 - C1^2, where C1 is the fraction of scalar pairs within radius (Chebyshev distance) and C2 the same fraction for two-dimensional delay vectors [x[t], x[t+1]].\n\nReturn 0.0 for fewer than three points or a non-positive radius. A nonzero value suggests nonlinear dependence.",
    starterCode: `def nonlinearity_test_statistic(series, radius):
    # Your code here
    pass`,
    solution: `def nonlinearity_test_statistic(series, radius):
    n = len(series)
    if n < 3 or radius <= 0:
        return 0.0

    def frac(pairs):
        c = 0
        t = 0
        for i in range(len(pairs)):
            for j in range(i + 1, len(pairs)):
                t += 1
                if max(abs(a - b) for a, b in zip(pairs[i], pairs[j])) <= radius:
                    c += 1
        return c / t if t else 0.0

    p1 = [[x] for x in series]
    p2 = [[series[i], series[i + 1]] for i in range(n - 1)]
    c1 = frac(p1)
    c2 = frac(p2)
    return c2 - c1 * c1`,
    testCases: [
      { input: [[1, 2, 3, 4], 0.5], expected: 0.0 },
      { input: [[1, -1, 1, -1], 1.0], expected: 0.2222222222222222 },
      { input: [[0, 0, 0], 0.1], expected: 0.0 },
      { input: [[1, 2, 3, 4, 5], 2.0], expected: 0.34333333333333343 },
    ],
    hint: "Under iid data this statistic is approximately zero.",
  },
  {
    id: "ts-209",
    title: "Regime Switching Probability",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Evolve a two-state Markov chain. States are 0 and 1 with persistence probabilities p00 and p11; start with probability 1 on start and step the distribution `steps` times, then return [prob_state0, prob_state1].\n\nTransition rows are [p00, 1-p00] and [1-p11, p11].",
    starterCode: `def regime_probability_after_steps(p00, p11, start, steps):
    # Your code here
    pass`,
    solution: `def regime_probability_after_steps(p00, p11, start, steps):
    p = [1.0, 0.0] if start == 0 else [0.0, 1.0]
    for _ in range(steps):
        p = [p[0] * p00 + p[1] * (1.0 - p11), p[0] * (1.0 - p00) + p[1] * p11]
    return p`,
    testCases: [
      { input: [0.8, 0.7, 0, 1], expected: [0.8, 0.19999999999999996] },
      { input: [0.8, 0.7, 0, 2], expected: [0.7000000000000002, 0.29999999999999993] },
      { input: [0.9, 0.6, 1, 1], expected: [0.4, 0.6] },
      { input: [0.5, 0.5, 0, 3], expected: [0.5, 0.5] },
    ],
    hint: "The chain converges to its stationary distribution as steps grow.",
  },
  {
    id: "ts-210",
    title: "Markov-Switching Smoothed Probability",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Update regime probabilities with one observation. Starting from filtered_probs, propagate through the transition matrix, multiply elementwise by the emission likelihoods, and normalize to sum to 1.\n\nReturn the updated probability vector; when the total is zero return the filtered probabilities unchanged.",
    starterCode: `def markov_switching_smoothed_probability(filtered_probs, transition_matrix, emission_probs):
    # Your code here
    pass`,
    solution: `def markov_switching_smoothed_probability(filtered_probs, transition_matrix, emission_probs):
    d = len(filtered_probs)
    out = []
    for j in range(d):
        s = 0.0
        for i in range(d):
            s += filtered_probs[i] * transition_matrix[i][j]
        out.append(s * emission_probs[j])
    total = sum(out)
    if total == 0:
        return list(filtered_probs)
    return [v / total for v in out]`,
    testCases: [
      { input: [[0.6, 0.4], [[0.9, 0.1], [0.2, 0.8]], [0.7, 0.3]], expected: [0.7919708029197081, 0.208029197080292] },
      { input: [[1, 0], [[0.9, 0.1], [0.2, 0.8]], [0.5, 0.5]], expected: [0.9, 0.1] },
      { input: [[0.5, 0.5], [[0.5, 0.5], [0.5, 0.5]], [1, 1]], expected: [0.5, 0.5] },
      { input: [[0, 0], [[0.5, 0.5], [0.5, 0.5]], [1, 1]], expected: [0, 0] },
    ],
    hint: "The transition step spreads probability before the observation reweights the states.",
  },
  {
    id: "ts-211",
    title: "HMM Regime Decode Step",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Perform one Viterbi step for a hidden Markov regime model. Given previous log-scores dp_prev, a transition matrix, and current emission likelihoods, compute for each state the best predecessor score and record the argmax backpointer.\n\nReturn [new_dp, backpointers]. Add a tiny epsilon before taking logs so zero probabilities stay finite.",
    starterCode: `import math
def hmm_regime_decode_step(dp_prev, transition_matrix, emission_probs):
    # Your code here
    pass`,
    solution: `import math
def hmm_regime_decode_step(dp_prev, transition_matrix, emission_probs):
    d = len(dp_prev)
    new_dp = []
    back = []
    for j in range(d):
        best = None
        arg = 0
        for i in range(d):
            v = dp_prev[i] + math.log(transition_matrix[i][j] + 1e-300)
            if best is None or v > best:
                best = v
                arg = i
        new_dp.append(best + math.log(emission_probs[j] + 1e-300))
        back.append(arg)
    return [new_dp, back]`,
    testCases: [
      {
        input: [[0, 0], [[0.9, 0.1], [0.2, 0.8]], [0.6, 0.4]],
        expected: [[-0.6161861394238171, -1.1394342831883648], [0, 1]],
      },
      {
        input: [[-1, -2], [[0.9, 0.1], [0.2, 0.8]], [0.5, 0.5]],
        expected: [[-1.7985076962177717, -2.916290731874155], [0, 1]],
      },
      {
        input: [[0, 0], [[0.5, 0.5], [0.5, 0.5]], [1, 1]],
        expected: [[-0.6931471805599453, -0.6931471805599453], [0, 0]],
      },
      {
        input: [[-10, 0], [[0.9, 0.1], [0.2, 0.8]], [0.9, 0.1]],
        expected: [[-1.7147984280919266, -2.525728644308255], [1, 1]],
      },
    ],
    hint: "The backpointer records which previous state produced the best path to each state.",
  },
  {
    id: "ts-212",
    title: "Bayesian Online Changepoint Step",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Perform one Bayesian online changepoint detection update. Given current run-length probabilities, a constant hazard rate, and the predictive probability of the new observation, form the changepoint term hazard * predictive and the growth terms run_prob * (1 - hazard) * predictive, then normalize.\n\nReturn the new run-length probability vector (one element longer). Return an empty list for empty input.",
    starterCode: `def bayesian_online_changepoint_step(run_probs, hazard, predictive_prob):
    # Your code here
    pass`,
    solution: `def bayesian_online_changepoint_step(run_probs, hazard, predictive_prob):
    if not run_probs:
        return []
    new = [hazard * predictive_prob]
    for r in run_probs:
        new.append(r * (1.0 - hazard) * predictive_prob)
    total = sum(new)
    if total == 0:
        return [0.0] * len(new)
    return [v / total for v in new]`,
    testCases: [
      { input: [[0.8, 0.2], 0.1, 0.5], expected: [0.1, 0.7200000000000001, 0.18000000000000002] },
      { input: [[1.0], 0.05, 1.0], expected: [0.05, 0.95] },
      { input: [[0.5, 0.3, 0.2], 0.0, 1.0], expected: [0.0, 0.5, 0.3, 0.2] },
      { input: [[0.5, 0.5], 1.0, 0.5], expected: [1.0, 0.0, 0.0] },
    ],
    hint: "Index 0 is the probability that a changepoint just happened.",
  },
  {
    id: "ts-213",
    title: "Dynamic Harmonic Regression",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Fit a harmonic regression y = a + b * cos(2*pi*f*t) + c * sin(2*pi*f*t) by ordinary least squares and return the amplitude sqrt(b^2 + c^2).\n\nReturn 0.0 when the series has fewer than three points or the normal equations are singular.",
    starterCode: `import math
def dynamic_harmonic_regression_coefficient(series, freq):
    # Your code here
    pass`,
    solution: `import math
def dynamic_harmonic_regression_coefficient(series, freq):
    n = len(series)
    if n < 3:
        return 0.0
    rows = []
    target = []
    for t in range(n):
        rows.append([1.0, math.cos(2.0 * math.pi * freq * t), math.sin(2.0 * math.pi * freq * t)])
        target.append(series[t])
    p = 3
    a = [[0.0] * p for _ in range(p)]
    rhs = [0.0] * p
    for row in range(n):
        for i in range(p):
            for j in range(p):
                a[i][j] += rows[row][i] * rows[row][j]
            rhs[i] += rows[row][i] * target[row]
    for i in range(p):
        piv = max(range(i, p), key=lambda r: abs(a[r][i]))
        if abs(a[piv][i]) < 1e-12:
            return 0.0
        a[i], a[piv] = a[piv], a[i]
        rhs[i], rhs[piv] = rhs[piv], rhs[i]
        for r in range(i + 1, p):
            f = a[r][i] / a[i][i]
            for c in range(i, p):
                a[r][c] -= f * a[i][c]
            rhs[r] -= f * rhs[i]
    beta = [0.0] * p
    for i in range(p - 1, -1, -1):
        s = rhs[i] - sum(a[i][j] * beta[j] for j in range(i + 1, p))
        beta[i] = s / a[i][i]
    return (beta[1] ** 2 + beta[2] ** 2) ** 0.5`,
    testCases: [
      { input: [[1, 0, -1, 0], 0.25], expected: 1.0 },
      { input: [[0, 1, 0, -1], 0.25], expected: 1.0 },
      { input: [[1, 2, 3, 4, 5], 0.1], expected: 1.9919186279062238 },
      { input: [[5, 5, 5, 5], 0.25], expected: 1.1102230246251565e-16 },
    ],
    hint: "The amplitude is the Euclidean norm of the cosine and sine coefficients.",
  },
  {
    id: "ts-214",
    title: "ARDL Bound Check",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Interpret an ARDL bounds test for cointegration. Return \"reject\" when the F statistic exceeds the upper bound (cointegration), \"accept\" when it is below the lower bound (no cointegration), and \"inconclusive\" in between.\n\nComparisons are strict.",
    starterCode: `def ardl_bound_check(f_stat, lower_bound, upper_bound):
    # Your code here
    pass`,
    solution: `def ardl_bound_check(f_stat, lower_bound, upper_bound):
    if f_stat > upper_bound:
        return "reject"
    if f_stat < lower_bound:
        return "accept"
    return "inconclusive"`,
    testCases: [
      { input: [5, 3, 4], expected: "reject" },
      { input: [2, 3, 4], expected: "accept" },
      { input: [3.5, 3, 4], expected: "inconclusive" },
      { input: [4, 4, 4], expected: "inconclusive" },
    ],
    hint: "The inconclusive region is why bounds testing needs a follow-up test.",
  },
  {
    id: "ts-215",
    title: "Engle-Granger Residual",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the Engle-Granger cointegration residuals for a known cointegrating coefficient: residual[t] = y[t] - beta * x[t].\n\nReturn the residual list, which is later tested for stationarity.",
    starterCode: `def engle_granger_residual(y, x, beta):
    # Your code here
    pass`,
    solution: `def engle_granger_residual(y, x, beta):
    return [a - beta * b for a, b in zip(y, x)]`,
    testCases: [
      { input: [[1, 2, 3], [1, 2, 3], 1.0], expected: [0.0, 0.0, 0.0] },
      { input: [[2, 4, 6], [1, 2, 3], 2.0], expected: [0.0, 0.0, 0.0] },
      { input: [[1, 2, 3], [1, 2, 3], 0.5], expected: [0.5, 1.0, 1.5] },
      { input: [[], [], 1.0], expected: [] },
    ],
    hint: "A stationary residual supports a cointegrating relationship.",
  },
  {
    id: "ts-216",
    title: "Seasonal Shift Detect",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Detect a change in the seasonal pattern. Split the series in half, average each season position (index modulo period) within each half, and return True when any position's mean differs by more than threshold between the halves.\n\nReturn False for invalid periods or when the series is shorter than two full periods.",
    starterCode: `def seasonal_shift_detect(series, period, threshold):
    # Your code here
    pass`,
    solution: `def seasonal_shift_detect(series, period, threshold):
    n = len(series)
    if period <= 0 or n < 2 * period:
        return False
    h = n // 2
    first = series[:h]
    second = series[h:]
    pattern1 = [0.0] * period
    pattern2 = [0.0] * period
    counts1 = [0] * period
    counts2 = [0] * period
    for t in range(len(first)):
        pattern1[t % period] += first[t]
        counts1[t % period] += 1
    for t in range(len(second)):
        pattern2[t % period] += second[t]
        counts2[t % period] += 1
    for j in range(period):
        if counts1[j] == 0 or counts2[j] == 0:
            continue
        if abs(pattern1[j] / counts1[j] - pattern2[j] / counts2[j]) > threshold:
            return True
    return False`,
    testCases: [
      { input: [[1, 5, 1, 5, 1, 5, 1, 5], 2, 0.5], expected: false },
      { input: [[1, 2, 1, 2, 5, 6, 5, 6], 2, 1.0], expected: true },
      { input: [[1, 2, 3, 4], 2, 10], expected: false },
      { input: [[1, 2, 1, 2, 3, 4, 3, 4], 2, 0.5], expected: true },
    ],
    hint: "Comparing per-position means isolates a change in seasonality from a level shift.",
  },
  {
    id: "ts-217",
    title: "Cross-Temporal Reconciliation Lite",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Reconcile a set of sub-period forecasts with a known aggregate by scaling: adjusted[x] = x * aggregate / sum(series).\n\nReturn zero-scaled values when the series sums to zero, so the reconciled values still sum to the aggregate when possible.",
    starterCode: `def cross_temporal_reconciliation_lite(series, aggregate):
    # Your code here
    pass`,
    solution: `def cross_temporal_reconciliation_lite(series, aggregate):
    total = sum(series)
    if total == 0:
        return [0.0] * len(series)
    return [x * aggregate / total for x in series]`,
    testCases: [
      { input: [[1, 2, 3], 12], expected: [2.0, 4.0, 6.0] },
      { input: [[1, 1], 4], expected: [2.0, 2.0] },
      { input: [[0, 0], 5], expected: [0.0, 0.0] },
      { input: [[2, 3, 5], 10], expected: [2.0, 3.0, 5.0] },
    ],
    hint: "Scaling preserves the relative shape of the sub-period forecasts.",
  },
  {
    id: "ts-218",
    title: "Forecast Bias Significance",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Test whether forecast errors have a significant mean bias with a t-style statistic: mean(errors) / (std(errors) / sqrt(n)), using the population standard deviation.\n\nReturn 0.0 when there are fewer than two errors or the standard deviation is zero.",
    starterCode: `def forecast_bias_significance(errors):
    # Your code here
    pass`,
    solution: `def forecast_bias_significance(errors):
    n = len(errors)
    if n < 2:
        return 0.0
    m = sum(errors) / n
    sd = (sum((e - m) ** 2 for e in errors) / n) ** 0.5
    if sd == 0:
        return 0.0
    return m / (sd / n ** 0.5)`,
    testCases: [
      { input: [[1, 1, 1, 1, 1]], expected: 0.0 },
      { input: [[1, 2, 3]], expected: 4.242640687119285 },
      { input: [[1, -1, 1, -1]], expected: 0.0 },
      { input: [[0.5, 1.5, 1.0]], expected: 4.242640687119285 },
    ],
    hint: "A large positive value indicates a systematic tendency to under-forecast.",
  },
  {
    id: "ts-219",
    title: "Encompassing Test",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Run a lite forecast encompassing check: compare mean squared errors and return True when errors1 has the smaller MSE, meaning forecast 1 encompasses forecast 2.\n\nReturn False for empty inputs or when the MSEs tie.",
    starterCode: `def encompassing_test(errors1, errors2):
    # Your code here
    pass`,
    solution: `def encompassing_test(errors1, errors2):
    if not errors1 or not errors2:
        return False
    mse1 = sum(e * e for e in errors1) / len(errors1)
    mse2 = sum(e * e for e in errors2) / len(errors2)
    return mse1 < mse2`,
    testCases: [
      { input: [[1, 1], [2, 2]], expected: true },
      { input: [[2, 2], [1, 1]], expected: false },
      { input: [[1, 2], [1, 2]], expected: false },
      { input: [[], [1]], expected: false },
    ],
    hint: "Encompassing means the other forecast adds no information beyond this one.",
  },
  {
    id: "ts-220",
    title: "Diebold-Mariano Statistic",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Compute the Diebold-Mariano statistic comparing two forecast error series. Let d = errors1^2 - errors2^2; return mean(d) / sqrt(population_var(d) / n).\n\nReturn 0.0 when there are fewer than two paired errors or the loss differential has zero variance.",
    starterCode: `def diebold_mariano_statistic(errors1, errors2):
    # Your code here
    pass`,
    solution: `def diebold_mariano_statistic(errors1, errors2):
    n = len(errors1)
    if n < 2 or n != len(errors2):
        return 0.0
    d = [a * a - b * b for a, b in zip(errors1, errors2)]
    m = sum(d) / n
    var = sum((x - m) ** 2 for x in d) / n
    if var == 0:
        return 0.0
    return m / (var / n) ** 0.5`,
    testCases: [
      { input: [[1, 2], [2, 1]], expected: 0.0 },
      { input: [[1, 1], [2, 2]], expected: 0.0 },
      { input: [[1, 1, 1], [2, 2, 2]], expected: 0.0 },
      { input: [[1, 2, 3], [2, 1, 2]], expected: 0.8492077756084468 },
    ],
    hint: "Positive statistics mean forecast 1 has the larger squared errors.",
  },
  {
    id: "ts-221",
    title: "Model Confidence Set Trim",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Trim a set of models to a confidence set. Compute each model's mean loss, then return the indices of the `keep` models with the smallest means, sorted in ascending index order.\n\nReturn an empty list for empty input or keep <= 0.",
    starterCode: `def model_confidence_set_trim(losses, keep):
    # Your code here
    pass`,
    solution: `def model_confidence_set_trim(losses, keep):
    if not losses or keep <= 0:
        return []
    means = [(sum(l) / len(l), i) for i, l in enumerate(losses)]
    means.sort()
    chosen = sorted(i for _, i in means[:keep])
    return chosen`,
    testCases: [
      { input: [[[1, 1], [2, 2], [3, 3]], 2], expected: [0, 1] },
      { input: [[[5], [1], [3]], 1], expected: [1] },
      { input: [[[1, 1], [1, 1]], 2], expected: [0, 1] },
      { input: [[], 1], expected: [] },
    ],
    hint: "Ties are broken by original index because the sort key includes it.",
  },
  {
    id: "ts-222",
    title: "PIT Histogram Uniformity",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Check the uniformity of probability integral transform values with a chi-square-style statistic: divide [0, 1) into equal bins, count values per bin, and return sum((count - expected)^2 / expected) with expected = n / bins.\n\nReturn 0.0 for empty input or bins <= 0. Values exactly 1.0 fall into the last bin.",
    starterCode: `def pit_histogram_uniformity(pit_values, bins):
    # Your code here
    pass`,
    solution: `def pit_histogram_uniformity(pit_values, bins):
    n = len(pit_values)
    if n == 0 or bins <= 0:
        return 0.0
    counts = [0] * bins
    for p in pit_values:
        idx = int(p * bins)
        if idx >= bins:
            idx = bins - 1
        if idx < 0:
            idx = 0
        counts[idx] += 1
    expected = n / bins
    return sum((c - expected) ** 2 / expected for c in counts)`,
    testCases: [
      { input: [[0.1, 0.2, 0.3, 0.4], 4], expected: 4.0 },
      { input: [[0.1, 0.1, 0.1, 0.1], 4], expected: 12.0 },
      { input: [[0.5], 2], expected: 1.0 },
      { input: [[], 4], expected: 0.0 },
    ],
    hint: "Perfectly calibrated forecasts produce a flat PIT histogram.",
  },
  {
    id: "ts-223",
    title: "CRPS for Normal Forecast",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Compute the mean continuous ranked probability score for a normal predictive distribution: for each observation y, with z = (y - mu) / sigma, CRPS = sigma * (z * (2*Phi(z) - 1) + 2*phi(z) - 1/sqrt(pi)), where Phi and phi are the standard normal CDF and density.\n\nReturn 0.0 for empty observations or non-positive sigma.",
    starterCode: `import math
def crps_normal_forecast(observations, mu, sigma):
    # Your code here
    pass`,
    solution: `import math
def crps_normal_forecast(observations, mu, sigma):
    n = len(observations)
    if n == 0 or sigma <= 0:
        return 0.0
    total = 0.0
    for y in observations:
        z = (y - mu) / sigma
        phi = math.exp(-z * z / 2.0) / (2.0 * math.pi) ** 0.5
        Phi = 0.5 * (1.0 + math.erf(z / 2.0 ** 0.5))
        total += sigma * (z * (2.0 * Phi - 1.0) + 2.0 * phi - 1.0 / math.pi ** 0.5)
    return total / n`,
    testCases: [
      { input: [[0], 0, 1], expected: 0.23369497725510913 },
      { input: [[1.96], 0, 1], expected: 1.414700556138123 },
      { input: [[0, 1, -1], 0, 2], expected: 0.5976680265098805 },
      { input: [[5], 5, 0], expected: 0.0 },
    ],
    hint: "CRPS generalizes absolute error and rewards sharp, calibrated forecasts.",
  },
  {
    id: "ts-224",
    title: "Spectral Coherence Lite",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Compute the magnitude-squared coherence between two series at frequency bin k: abs(conj(X[k]) * Y[k]) / sqrt(|X[k]|^2 * |Y[k]|^2), where X and Y are discrete Fourier transforms.\n\nReturn 0.0 when lengths differ, k is out of range, or either spectrum has (near) zero power.",
    starterCode: `import math
def spectral_coherence_lite(x, y, k):
    # Your code here
    pass`,
    solution: `import math
def spectral_coherence_lite(x, y, k):
    n = len(x)
    if n == 0 or n != len(y) or k < 0 or k >= n:
        return 0.0
    xre = sum(x[t] * math.cos(2.0 * math.pi * k * t / n) for t in range(n))
    xim = -sum(x[t] * math.sin(2.0 * math.pi * k * t / n) for t in range(n))
    yre = sum(y[t] * math.cos(2.0 * math.pi * k * t / n) for t in range(n))
    yim = -sum(y[t] * math.sin(2.0 * math.pi * k * t / n) for t in range(n))
    sx = xre * xre + xim * xim
    sy = yre * yre + yim * yim
    if sx < 1e-12 or sy < 1e-12:
        return 0.0
    cross_re = xre * yre + xim * yim
    cross_im = xre * yim - xim * yre
    return (cross_re * cross_re + cross_im * cross_im) ** 0.5 / (sx * sy) ** 0.5`,
    testCases: [
      { input: [[1, 2, 3, 4], [2, 4, 6, 8], 1], expected: 1.0 },
      { input: [[1, 0, -1, 0], [1, 2, 3, 4], 1], expected: 1.0 },
      { input: [[1, 1, 1, 1], [0, 1, 0, 1], 1], expected: 0.0 },
      { input: [[1, -1, 1, -1], [1, 1, 1, 1], 2], expected: 0.0 },
    ],
    hint: "Coherence near 1 means the two series share power at that frequency.",
  },
  {
    id: "ts-225",
    title: "Rolling Hurst Estimate",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Compute a rolling rescaled-range Hurst estimate. For each window, subtract the mean, form cumulative deviations, take R as max minus min of the path and S as the population standard deviation, and append log(R / S) / log(window).\n\nReturn an empty list when window <= 1 or window exceeds the series; windows with zero variance or zero range give 0.0.",
    starterCode: `import math
def rolling_hurst_estimate(series, window):
    # Your code here
    pass`,
    solution: `import math
def rolling_hurst_estimate(series, window):
    n = len(series)
    if window <= 1 or window > n:
        return []
    out = []
    for i in range(n - window + 1):
        w = series[i:i + window]
        m = sum(w) / window
        dev = [v - m for v in w]
        cum = []
        acc = 0.0
        for d in dev:
            acc += d
            cum.append(acc)
        r = max(cum) - min(cum)
        s = (sum(d * d for d in dev) / window) ** 0.5
        if s == 0 or r <= 0:
            out.append(0.0)
        else:
            out.append(math.log(r / s) / math.log(window))
    return out`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 3], expected: [0.18453512321427118, 0.18453512321427118, 0.18453512321427118] },
      { input: [[5, 5, 5, 5], 2], expected: [0.0, 0.0, 0.0] },
      { input: [[1, 2, 3, 4], 4], expected: [0.41951797627815945] },
      { input: [[1, 2, 3], 1], expected: [] },
    ],
    hint: "The single-scale exponent here is a rough local persistence measure.",
  },
];
