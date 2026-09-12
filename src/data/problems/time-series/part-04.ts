import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "ts-136",
    title: "State Space Local Level Step",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Perform one step of a local level state space model. Given the current level and variance p, an observation, process noise q, and observation noise r: predict p_pred = p + q, compute K = p_pred / (p_pred + r), and return [level + K * (obs - level), (1 - K) * p_pred].\n\nReturn a gain of 0.0 when the denominator is zero.",
    starterCode: `def state_space_local_level_step(level, p, obs, q, r):
    # Your code here
    pass`,
    solution: `def state_space_local_level_step(level, p, obs, q, r):
    p_pred = p + q
    den = p_pred + r
    k = p_pred / den if den != 0 else 0.0
    level_new = level + k * (obs - level)
    p_new = (1.0 - k) * p_pred
    return [level_new, p_new]`,
    testCases: [
      { input: [10, 1, 12, 0.5, 2], expected: [10.857142857142858, 0.8571428571428571] },
      { input: [0, 1, 1, 0, 1], expected: [0.5, 0.5] },
      { input: [5, 0, 5, 1, 3], expected: [5.0, 0.75] },
      { input: [0, 2, 10, 0, 1], expected: [6.666666666666666, 0.6666666666666667] },
    ],
    hint: "Process noise raises the prior variance before the measurement update.",
  },
  {
    id: "ts-137",
    title: "Local Linear Trend Step",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Perform one step of a local linear trend model. With innovation = obs - (level + trend), update level_new = level + trend + alpha * innovation and trend_new = trend + beta * innovation.\n\nReturn [level_new, trend_new].",
    starterCode: `def local_linear_trend_step(level, trend, obs, alpha, beta):
    # Your code here
    pass`,
    solution: `def local_linear_trend_step(level, trend, obs, alpha, beta):
    innovation = obs - (level + trend)
    return [level + trend + alpha * innovation, trend + beta * innovation]`,
    testCases: [
      { input: [10, 1, 12, 0.5, 0.2], expected: [11.5, 1.2] },
      { input: [5, 0, 5, 0.3, 0.1], expected: [5.0, 0.0] },
      { input: [0, 2, 10, 0.5, 0.5], expected: [6.0, 6.0] },
      { input: [10, 1, 8, 1.0, 1.0], expected: [8.0, -2.0] },
    ],
    hint: "Both states are corrected from the same one-step innovation.",
  },
  {
    id: "ts-138",
    title: "Bayesian Updating Normal-Normal",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Update a normal prior with n normal observations of known variance: posterior precision = 1/prior_var + n/data_var and posterior mean = post_var * (prior_mean/prior_var + n * xbar/data_var).\n\nReturn [posterior_mean, posterior_variance]; return the prior unchanged for empty data or non-positive variances.",
    starterCode: `def bayesian_normal_update(prior_mean, prior_var, data, data_var):
    # Your code here
    pass`,
    solution: `def bayesian_normal_update(prior_mean, prior_var, data, data_var):
    n = len(data)
    if n == 0 or prior_var <= 0 or data_var <= 0:
        return [prior_mean, prior_var]
    xbar = sum(data) / n
    post_var = 1.0 / (1.0 / prior_var + n / data_var)
    post_mean = post_var * (prior_mean / prior_var + n * xbar / data_var)
    return [post_mean, post_var]`,
    testCases: [
      { input: [0, 1, [1, 2, 3], 1], expected: [1.5, 0.25] },
      { input: [10, 4, [12], 2], expected: [11.333333333333332, 1.3333333333333333] },
      { input: [5, 1, [], 2], expected: [5, 1] },
      { input: [0, 1, [1, 1], 1], expected: [0.6666666666666666, 0.3333333333333333] },
    ],
    hint: "Precisions add: prior precision plus one data precision per observation.",
  },
  {
    id: "ts-139",
    title: "Conjugate Prior Posterior Mean",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the conjugate normal posterior mean directly from precisions: (tau0 * mu0 + tau_data * xbar) / (tau0 + tau_data).\n\nReturn 0.0 when the total precision is zero.",
    starterCode: `def conjugate_posterior_mean(mu0, tau0, xbar, tau_data):
    # Your code here
    pass`,
    solution: `def conjugate_posterior_mean(mu0, tau0, xbar, tau_data):
    total = tau0 + tau_data
    if total == 0:
        return 0.0
    return (tau0 * mu0 + tau_data * xbar) / total`,
    testCases: [
      { input: [0, 1, 2, 1], expected: 1.0 },
      { input: [10, 4, 12, 2], expected: 10.666666666666666 },
      { input: [5, 0, 100, 1], expected: 100.0 },
      { input: [0, 0, 0, 0], expected: 0.0 },
    ],
    hint: "The posterior mean is a precision-weighted average of prior mean and data mean.",
  },
  {
    id: "ts-140",
    title: "h-step Error Growth sqrt(h)",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Under a random walk, forecast error standard deviation grows with the square root of the horizon: sigma_h = sigma * sqrt(h).\n\nReturn 0.0 for h <= 0.",
    starterCode: `def error_growth_sqrt_h(sigma, h):
    # Your code here
    pass`,
    solution: `def error_growth_sqrt_h(sigma, h):
    if h <= 0:
        return 0.0
    return sigma * h ** 0.5`,
    testCases: [
      { input: [1, 4], expected: 2.0 },
      { input: [0.5, 9], expected: 1.5 },
      { input: [2, 0], expected: 0.0 },
      { input: [3, 1], expected: 3.0 },
    ],
    hint: "Variances add linearly with the horizon, so standard deviations grow with its square root.",
  },
  {
    id: "ts-141",
    title: "Random Walk Forecast Interval Width",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the width of a symmetric forecast interval for a random walk: 2 * z * sigma * sqrt(h).\n\nReturn 0.0 for h <= 0. Here z is the normal critical value, e.g. 1.96 for 95 percent coverage.",
    starterCode: `def random_walk_interval_width(sigma, h, z):
    # Your code here
    pass`,
    solution: `def random_walk_interval_width(sigma, h, z):
    if h <= 0:
        return 0.0
    return 2.0 * z * sigma * h ** 0.5`,
    testCases: [
      { input: [1, 4, 1.96], expected: 7.84 },
      { input: [0.5, 9, 1.645], expected: 4.9350000000000005 },
      { input: [2, 0, 1.96], expected: 0.0 },
      { input: [1, 1, 2.0], expected: 4.0 },
    ],
    hint: "The interval fans out as the square root of the forecast horizon.",
  },
  {
    id: "ts-142",
    title: "Split Conformal Width",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the split conformal interval width: twice the quantile of absolute residuals at level alpha. Sort the absolute residuals and take index ceil((1 - alpha) * n) - 1, clamped to [0, n-1]; return 2 * that score.\n\nReturn 0.0 for empty residuals.",
    starterCode: `import math
def split_conformal_width(residuals, alpha):
    # Your code here
    pass`,
    solution: `import math
def split_conformal_width(residuals, alpha):
    if not residuals:
        return 0.0
    scores = sorted(abs(r) for r in residuals)
    n = len(scores)
    idx = math.ceil((1.0 - alpha) * n) - 1
    if idx < 0:
        idx = 0
    if idx > n - 1:
        idx = n - 1
    return 2.0 * scores[idx]`,
    testCases: [
      { input: [[1, -2, 3], 0.5], expected: 4.0 },
      { input: [[0.1, -0.2, 0.3, 0.4], 0.75], expected: 0.2 },
      { input: [[1, 2, 3, 4, 5], 0.8], expected: 2.0 },
      { input: [[-1, 1], 1.0], expected: 2.0 },
    ],
    hint: "The quantile index uses ceil so the interval covers at least the requested share.",
  },
  {
    id: "ts-143",
    title: "Temporal Aggregation to Quarterly",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Aggregate a series of monthly values into quarters by summing each complete group of three consecutive values. A trailing partial group is dropped.\n\nReturn the list of quarterly sums.",
    starterCode: `def temporal_aggregation_quarterly(values):
    # Your code here
    pass`,
    solution: `def temporal_aggregation_quarterly(values):
    out = []
    for i in range(0, len(values) - 2, 3):
        out.append(values[i] + values[i + 1] + values[i + 2])
    return out`,
    testCases: [
      { input: [[1, 2, 3, 4, 5, 6]], expected: [6, 15] },
      { input: [[1, 2]], expected: [] },
      { input: [[3, 3, 3]], expected: [9] },
      { input: [[1, 2, 3, 4]], expected: [6] },
    ],
    hint: "Range over i in steps of 3 while a full group remains.",
  },
  {
    id: "ts-144",
    title: "Forward-Fill vs Back-Fill Difference",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Count the positions where forward filling and backward filling disagree. Forward fill carries the last known value downward (leading gaps seed from the first known value); backward fill carries the next known value upward (trailing gaps seed from the last known value).\n\nReturn the number of positions where the two filled series differ, or 0 if the series has no known values.",
    starterCode: `def forward_back_fill_difference(series):
    # Your code here
    pass`,
    solution: `def forward_back_fill_difference(series):
    n = len(series)
    known = [i for i, x in enumerate(series) if x is not None]
    if not known:
        return 0
    fwd = []
    last = None
    for x in series:
        if x is not None:
            last = x
        elif last is None:
            last = series[known[0]]
        fwd.append(last)
    bwd = [None] * n
    nxt = None
    for i in range(n - 1, -1, -1):
        x = series[i]
        if x is not None:
            nxt = x
        elif nxt is None:
            nxt = series[known[-1]]
        bwd[i] = nxt
    count = 0
    for i in range(n):
        if fwd[i] != bwd[i]:
            count += 1
    return count`,
    testCases: [
      { input: [[1, null, 3]], expected: 1 },
      { input: [[null, 2, null, 4]], expected: 1 },
      { input: [[1, 2, 3]], expected: 0 },
      { input: [[null, null]], expected: 0 },
    ],
    hint: "A gap disagrees when its two ends have different values.",
  },
  {
    id: "ts-145",
    title: "Trading Day Adjustment Lite",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Adjust a value for the number of trading days in the period: adjusted = value * average_days / actual_days.\n\nReturn 0.0 when actual_days is zero.",
    starterCode: `def trading_day_adjustment(value, actual_days, average_days):
    # Your code here
    pass`,
    solution: `def trading_day_adjustment(value, actual_days, average_days):
    if actual_days == 0:
        return 0.0
    return value * average_days / actual_days`,
    testCases: [
      { input: [1000, 20, 22], expected: 1100.0 },
      { input: [500, 25, 25], expected: 500.0 },
      { input: [990, 22, 20], expected: 900.0 },
      { input: [100, 0, 20], expected: 0.0 },
    ],
    hint: "Fewer trading days than average scales the value up, and vice versa.",
  },
  {
    id: "ts-146",
    title: "Peak-to-Average Ratio",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the peak-to-average ratio of a load profile: max(load) / mean(load).\n\nReturn 0.0 for an empty series or a zero mean.",
    starterCode: `def peak_to_average_ratio(load):
    # Your code here
    pass`,
    solution: `def peak_to_average_ratio(load):
    if not load:
        return 0.0
    m = sum(load) / len(load)
    if m == 0:
        return 0.0
    return max(load) / m`,
    testCases: [
      { input: [[1, 2, 3, 4]], expected: 1.6 },
      { input: [[5, 5, 5]], expected: 1.0 },
      { input: [[1, 0, 0]], expected: 3.0 },
      { input: [[0, 0]], expected: 0.0 },
    ],
    hint: "A flatter profile has a ratio closer to 1.",
  },
  {
    id: "ts-147",
    title: "Capacity Factor",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the capacity factor of a power series: mean(power) / capacity.\n\nReturn 0.0 for an empty series or non-positive capacity.",
    starterCode: `def capacity_factor(power, capacity):
    # Your code here
    pass`,
    solution: `def capacity_factor(power, capacity):
    if not power or capacity <= 0:
        return 0.0
    return sum(power) / len(power) / capacity`,
    testCases: [
      { input: [[5, 10, 0, 5], 10], expected: 0.5 },
      { input: [[10, 10], 10], expected: 1.0 },
      { input: [[1, 2, 3], 0], expected: 0.0 },
      { input: [[], 10], expected: 0.0 },
    ],
    hint: "It is the average output divided by the nameplate rating.",
  },
  {
    id: "ts-148",
    title: "Battery Round-Trip Efficiency",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute battery round-trip efficiency as the geometric mean of charge and discharge efficiencies: sqrt(charge_eff * discharge_eff).\n\nBoth efficiencies are fractions between 0 and 1.",
    starterCode: `def battery_round_trip_efficiency(charge_eff, discharge_eff):
    # Your code here
    pass`,
    solution: `def battery_round_trip_efficiency(charge_eff, discharge_eff):
    return (charge_eff * discharge_eff) ** 0.5`,
    testCases: [
      { input: [0.9, 0.9], expected: 0.9 },
      { input: [0.81, 1.0], expected: 0.9 },
      { input: [0.8, 0.9], expected: 0.8485281374238571 },
      { input: [0, 0.5], expected: 0.0 },
    ],
    hint: "The geometric mean is the efficiency of a full charge-discharge cycle.",
  },
  {
    id: "ts-149",
    title: "Safety Stock Formula",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute safety stock as z * sigma_demand * sqrt(lead_time), where z is the service-level multiplier and sigma_demand the demand standard deviation per period.\n\nReturn 0.0 for negative lead time.",
    starterCode: `def safety_stock(z, sigma_demand, lead_time):
    # Your code here
    pass`,
    solution: `def safety_stock(z, sigma_demand, lead_time):
    if lead_time < 0:
        return 0.0
    return z * sigma_demand * lead_time ** 0.5`,
    testCases: [
      { input: [1.65, 10, 4], expected: 33.0 },
      { input: [2, 5, 1], expected: 10.0 },
      { input: [1.96, 0, 9], expected: 0.0 },
      { input: [1.5, 2, 0], expected: 0.0 },
    ],
    hint: "Demand variance over the lead time grows linearly, hence the square root.",
  },
  {
    id: "ts-150",
    title: "Reorder Point",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the reorder point as average demand times lead time plus safety stock: avg_demand * lead_time + safety_stock.\n\nReturn the value as a number.",
    starterCode: `def reorder_point(avg_demand, lead_time, safety_stock):
    # Your code here
    pass`,
    solution: `def reorder_point(avg_demand, lead_time, safety_stock):
    return avg_demand * lead_time + safety_stock`,
    testCases: [
      { input: [10, 5, 20], expected: 70 },
      { input: [0, 3, 5], expected: 5 },
      { input: [4, 0, 0], expected: 0 },
      { input: [2.5, 4, 1], expected: 11.0 },
    ],
    hint: "Expected lead-time demand plus a buffer against uncertainty.",
  },
  {
    id: "ts-151",
    title: "Fill Rate",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the fill rate as 1 - backorders / total_demand.\n\nReturn 1.0 when total_demand is non-positive.",
    starterCode: `def fill_rate(total_demand, backorders):
    # Your code here
    pass`,
    solution: `def fill_rate(total_demand, backorders):
    if total_demand <= 0:
        return 1.0
    return 1.0 - backorders / total_demand`,
    testCases: [
      { input: [100, 5], expected: 0.95 },
      { input: [50, 0], expected: 1.0 },
      { input: [200, 50], expected: 0.75 },
      { input: [0, 0], expected: 1.0 },
    ],
    hint: "The fill rate is the share of demand met without backorder.",
  },
  {
    id: "ts-152",
    title: "Seasonal State Space Step",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Perform one step of an additive seasonal state space model. With innovation = obs - (level + seasonal), update level_new = level + alpha * innovation and seasonal_new = seasonal + gamma * innovation.\n\nReturn [level_new, seasonal_new].",
    starterCode: `def seasonal_state_space_step(level, seasonal, obs, alpha, gamma):
    # Your code here
    pass`,
    solution: `def seasonal_state_space_step(level, seasonal, obs, alpha, gamma):
    innovation = obs - (level + seasonal)
    return [level + alpha * innovation, seasonal + gamma * innovation]`,
    testCases: [
      { input: [10, 2, 14, 0.5, 0.3], expected: [11.0, 2.6] },
      { input: [5, 0, 5, 0.4, 0.4], expected: [5.0, 0.0] },
      { input: [0, -1, 0, 0.5, 0.5], expected: [0.5, -0.5] },
      { input: [10, 1, 8, 1.0, 1.0], expected: [7.0, -2.0] },
    ],
    hint: "Level and seasonal components share the same innovation with different gains.",
  },
  {
    id: "ts-153",
    title: "Kalman Likelihood 1D",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the Gaussian log likelihood of a one-dimensional Kalman filter innovation: -0.5 * (ln(2*pi) + ln(p + r) + innovation^2 / (p + r)), where innovation = obs - prior.\n\nReturn 0.0 if p + r is not positive.",
    starterCode: `import math
def kalman_likelihood_1d(prior, p, obs, r):
    # Your code here
    pass`,
    solution: `import math
def kalman_likelihood_1d(prior, p, obs, r):
    s = p + r
    if s <= 0:
        return 0.0
    innovation = obs - prior
    return -0.5 * (math.log(2.0 * math.pi) + math.log(s) + innovation * innovation / s)`,
    testCases: [
      { input: [0, 1, 0, 1], expected: -1.2655121234846454 },
      { input: [0, 1, 2, 1], expected: -2.2655121234846454 },
      { input: [5, 2, 5, 3], expected: -1.723657489421723 },
      { input: [0, 0, 3, 1], expected: -5.418938533204672 },
    ],
    hint: "The innovation variance is prior variance plus observation noise variance.",
  },
  {
    id: "ts-154",
    title: "Kalman Missing Observation Handling",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Handle a missing observation in a one-dimensional Kalman filter: the state mean is unchanged and the variance grows by the process noise, so return [prior, p + q].\n\nNo measurement update happens.",
    starterCode: `def kalman_missing_observation(prior, p, q):
    # Your code here
    pass`,
    solution: `def kalman_missing_observation(prior, p, q):
    return [prior, p + q]`,
    testCases: [
      { input: [10, 1, 0.5], expected: [10, 1.5] },
      { input: [0, 2, 2], expected: [0, 4] },
      { input: [5, 0, 1], expected: [5, 1] },
      { input: [3, 1, 0], expected: [3, 1] },
    ],
    hint: "Skipping an update only inflates uncertainty.",
  },
  {
    id: "ts-155",
    title: "Seasonal Adjustment Factor",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the seasonal adjustment factor as original / adjusted.\n\nReturn 1.0 when the adjusted value is 0 so no rescaling is applied.",
    starterCode: `def seasonal_adjustment_factor(original, adjusted):
    # Your code here
    pass`,
    solution: `def seasonal_adjustment_factor(original, adjusted):
    if adjusted == 0:
        return 1.0
    return original / adjusted`,
    testCases: [
      { input: [110, 100], expected: 1.1 },
      { input: [90, 100], expected: 0.9 },
      { input: [100, 0], expected: 1.0 },
      { input: [0, 100], expected: 0.0 },
    ],
    hint: "Dividing the original by its adjusted value recovers the seasonal factor.",
  },
  {
    id: "ts-156",
    title: "Posterior Predictive Variance",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the posterior predictive variance as post_var + obs_var, combining parameter uncertainty with observation noise.\n\nReturn the sum.",
    starterCode: `def posterior_predictive_variance(post_var, obs_var):
    # Your code here
    pass`,
    solution: `def posterior_predictive_variance(post_var, obs_var):
    return post_var + obs_var`,
    testCases: [
      { input: [1, 2], expected: 3 },
      { input: [0.5, 0.5], expected: 1.0 },
      { input: [0, 4], expected: 4 },
      { input: [3, 0], expected: 3 },
    ],
    hint: "Predictive uncertainty is never smaller than observation noise alone.",
  },
  {
    id: "ts-157",
    title: "Credible Interval Width",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the width of a symmetric credible interval from a posterior variance: 2 * z * sqrt(post_var), where z is the normal critical value.\n\nReturn 0.0 when post_var is not positive.",
    starterCode: `def credible_interval_width(post_var, z):
    # Your code here
    pass`,
    solution: `def credible_interval_width(post_var, z):
    if post_var <= 0:
        return 0.0
    return 2.0 * z * post_var ** 0.5`,
    testCases: [
      { input: [4, 1.96], expected: 7.84 },
      { input: [1, 1.645], expected: 3.29 },
      { input: [0, 2], expected: 0.0 },
      { input: [2.25, 2], expected: 6.0 },
    ],
    hint: "The width scales with the square root of the posterior variance.",
  },
  {
    id: "ts-158",
    title: "Forecast Fan Chart Quantiles",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Build fan chart quantile levels from a forecast distribution: for each z in z_list return mean + z * sigma.\n\nReturn an empty list when z_list is empty.",
    starterCode: `def fan_chart_quantiles(mean, sigma, z_list):
    # Your code here
    pass`,
    solution: `def fan_chart_quantiles(mean, sigma, z_list):
    return [mean + z * sigma for z in z_list]`,
    testCases: [
      { input: [0, 1, [-1.96, 0, 1.96]], expected: [-1.96, 0, 1.96] },
      { input: [10, 2, [-2, 2]], expected: [6, 14] },
      { input: [5, 0, [-1, 1]], expected: [5, 5] },
      { input: [0, 1.5, []], expected: [] },
    ],
    hint: "Each quantile is a point on the normal forecast distribution.",
  },
  {
    id: "ts-159",
    title: "Quantile Regression Forecast",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Apply a fitted quantile regression lite: forecast each x as intercept + slope * x.\n\nReturn the list of fitted values. The coefficients are assumed to come from training at a given quantile level.",
    starterCode: `def quantile_regression_forecast(x, slope, intercept):
    # Your code here
    pass`,
    solution: `def quantile_regression_forecast(x, slope, intercept):
    return [intercept + slope * xi for xi in x]`,
    testCases: [
      { input: [[1, 2, 3], 2, 1], expected: [3, 5, 7] },
      { input: [[0], 0.5, -1], expected: [-1.0] },
      { input: [[], 1, 0], expected: [] },
      { input: [[-1, 1], 1, 0], expected: [-1, 1] },
    ],
    hint: "Different quantile levels give different slopes and intercepts.",
  },
  {
    id: "ts-160",
    title: "Conformal Prediction Interval Lite",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Build a conformal prediction interval around a point prediction. Take the alpha-quantile of absolute calibration scores (sorted index ceil((1 - alpha) * n) - 1, clamped to [0, n-1]) and return [prediction - q, prediction + q].\n\nReturn [prediction, prediction] when scores is empty.",
    starterCode: `import math
def conformal_interval_lite(prediction, scores, alpha):
    # Your code here
    pass`,
    solution: `import math
def conformal_interval_lite(prediction, scores, alpha):
    if not scores:
        return [prediction, prediction]
    s = sorted(abs(v) for v in scores)
    n = len(s)
    idx = math.ceil((1.0 - alpha) * n) - 1
    if idx < 0:
        idx = 0
    if idx > n - 1:
        idx = n - 1
    q = s[idx]
    return [prediction - q, prediction + q]`,
    testCases: [
      { input: [5, [1, -2, 3], 0.5], expected: [3, 7] },
      { input: [0, [0.1, 0.2, 0.3, 0.4], 0.75], expected: [-0.1, 0.1] },
      { input: [10, [], 0.5], expected: [10, 10] },
      { input: [2, [1, 1], 1.0], expected: [1, 3] },
    ],
    hint: "Conformal intervals are symmetric here because absolute scores are used.",
  },
  {
    id: "ts-161",
    title: "Rolling-Origin Evaluation Count",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Count the number of rolling-origin forecasts: n - initial - horizon + 1 when positive, otherwise 0.\n\nEach origin trains on a fixed window and forecasts horizon steps ahead.",
    starterCode: `def rolling_origin_count(n, initial, horizon):
    # Your code here
    pass`,
    solution: `def rolling_origin_count(n, initial, horizon):
    count = n - initial - horizon + 1
    if count <= 0:
        return 0
    return count`,
    testCases: [
      { input: [100, 60, 1], expected: 40 },
      { input: [100, 90, 5], expected: 6 },
      { input: [10, 10, 1], expected: 0 },
      { input: [5, 3, 1], expected: 2 },
    ],
    hint: "Origins run from the initial window up to the point that still allows a full horizon.",
  },
  {
    id: "ts-162",
    title: "Expanding Origin Training Size",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the total number of training observations used across expanding-origin evaluations. Origins start with min_initial observations and grow one at a time; the last training set ends at n - horizon.\n\nReturn the sum of those training sizes, or 0 if none are valid. For example (6, 2, 1) sums sizes 2, 3, 4 and 5.",
    starterCode: `def expanding_origin_training_size(n, min_initial, horizon):
    # Your code here
    pass`,
    solution: `def expanding_origin_training_size(n, min_initial, horizon):
    last_size = n - horizon
    if last_size < min_initial:
        return 0
    total = 0
    for size in range(min_initial, last_size + 1):
        total += size
    return total`,
    testCases: [
      { input: [10, 3, 1], expected: 42 },
      { input: [5, 5, 2], expected: 0 },
      { input: [6, 2, 1], expected: 14 },
      { input: [4, 4, 1], expected: 0 },
    ],
    hint: "Sizes grow by one each origin, so this is a simple arithmetic series sum.",
  },
  {
    id: "ts-163",
    title: "MASE Seasonal Denominator",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the denominator of a seasonal MASE: the mean absolute seasonal difference mean(|x[t] - x[t-m]|) over t >= m.\n\nReturn 0.0 if season_length is not positive or the series is not longer than one season.",
    starterCode: `def mase_seasonal_denominator(series, season_length):
    # Your code here
    pass`,
    solution: `def mase_seasonal_denominator(series, season_length):
    n = len(series)
    if season_length <= 0 or n <= season_length:
        return 0.0
    total = 0.0
    count = 0
    for t in range(season_length, n):
        total += abs(series[t] - series[t - season_length])
        count += 1
    if count == 0:
        return 0.0
    return total / count`,
    testCases: [
      { input: [[1, 2, 3, 4, 5, 6], 2], expected: 2.0 },
      { input: [[2, 4, 6, 8], 2], expected: 4.0 },
      { input: [[1, 2, 3], 5], expected: 0.0 },
      { input: [[10, 20, 10, 20], 2], expected: 0.0 },
    ],
    hint: "This scale comes from the seasonal naive forecast on the training data.",
  },
  {
    id: "ts-164",
    title: "Relative Absolute Error to Naive",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the relative absolute error against a naive forecast: sum(|actual - forecast|) / sum(|actual - naive|).\n\nReturn 0.0 when the naive denominator is zero.",
    starterCode: `def relative_absolute_error_naive(actual, forecast, naive):
    # Your code here
    pass`,
    solution: `def relative_absolute_error_naive(actual, forecast, naive):
    den = sum(abs(a - nv) for a, nv in zip(actual, naive))
    if den == 0:
        return 0.0
    return sum(abs(a - f) for a, f in zip(actual, forecast)) / den`,
    testCases: [
      { input: [[10, 12, 14], [11, 11, 11], [10, 10, 10]], expected: 0.8333333333333334 },
      { input: [[1, 2, 3], [2, 2, 2], [1, 1, 1]], expected: 0.6666666666666666 },
      { input: [[5, 5], [5, 5], [5, 5]], expected: 0.0 },
      { input: [[1, 2], [3, 2], [0, 2]], expected: 2.0 },
    ],
    hint: "Values below 1 mean the forecast beats the naive benchmark.",
  },
  {
    id: "ts-165",
    title: "Forecast Skill Score",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the skill score of a forecast relative to a reference: 1 - mse_forecast / mse_reference.\n\nReturn 0.0 when the reference MSE is zero. Positive values indicate the forecast beats the reference.",
    starterCode: `def forecast_skill_score(mse_forecast, mse_reference):
    # Your code here
    pass`,
    solution: `def forecast_skill_score(mse_forecast, mse_reference):
    if mse_reference == 0:
        return 0.0
    return 1.0 - mse_forecast / mse_reference`,
    testCases: [
      { input: [4, 16], expected: 0.75 },
      { input: [16, 16], expected: 0.0 },
      { input: [20, 16], expected: -0.25 },
      { input: [0, 16], expected: 1.0 },
    ],
    hint: "A perfect forecast scores 1, the reference scores 0.",
  },
  {
    id: "ts-166",
    title: "Nash-Sutcliffe Efficiency",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the Nash-Sutcliffe efficiency: 1 - SSE(model) / SSE(mean), where SSE(mean) uses the mean of actual.\n\nReturn 0.0 when actual is empty or has zero variance.",
    starterCode: `def nash_sutcliffe(actual, forecast):
    # Your code here
    pass`,
    solution: `def nash_sutcliffe(actual, forecast):
    if not actual:
        return 0.0
    m = sum(actual) / len(actual)
    sse = sum((a - f) ** 2 for a, f in zip(actual, forecast))
    sst = sum((a - m) ** 2 for a in actual)
    if sst == 0:
        return 0.0
    return 1.0 - sse / sst`,
    testCases: [
      { input: [[1, 2, 3, 4], [1, 2, 3, 4]], expected: 1.0 },
      { input: [[1, 2, 3, 4], [2, 2, 2, 2]], expected: -0.19999999999999996 },
      { input: [[3, 3, 3], [3, 3, 3]], expected: 0.0 },
      { input: [[1, 2], [2, 1]], expected: -3.0 },
    ],
    hint: "Using the mean of actual as the benchmark is equivalent to R squared.",
  },
  {
    id: "ts-167",
    title: "Index of Agreement",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute Willmott's index of agreement: 1 - sum((forecast - actual)^2) / sum((abs(forecast - mean_actual) + abs(actual - mean_actual))^2).\n\nReturn 0.0 when the denominator is zero or actual is empty.",
    starterCode: `def index_of_agreement(actual, forecast):
    # Your code here
    pass`,
    solution: `def index_of_agreement(actual, forecast):
    if not actual:
        return 0.0
    m = sum(actual) / len(actual)
    num = sum((a - f) ** 2 for a, f in zip(actual, forecast))
    den = sum((abs(f - m) + abs(a - m)) ** 2 for a, f in zip(actual, forecast))
    if den == 0:
        return 0.0
    return 1.0 - num / den`,
    testCases: [
      { input: [[1, 2, 3, 4], [1, 2, 3, 4]], expected: 1.0 },
      { input: [[1, 2, 3, 4], [2, 2, 2, 2]], expected: 0.4 },
      { input: [[1, 2], [2, 1]], expected: 0.0 },
      { input: [[5, 5, 5], [5, 5, 5]], expected: 0.0 },
    ],
    hint: "The index of agreement is bounded and less sensitive to extreme errors than R squared.",
  },
  {
    id: "ts-168",
    title: "Peak Timing Error",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the peak timing error as the absolute difference between the index of the maximum in forecast and in actual (the first occurrence wins on ties).\n\nReturn -1 if either series is empty.",
    starterCode: `def peak_timing_error(actual, forecast):
    # Your code here
    pass`,
    solution: `def peak_timing_error(actual, forecast):
    if not actual or not forecast:
        return -1
    ia = actual.index(max(actual))
    ifo = forecast.index(max(forecast))
    return abs(ifo - ia)`,
    testCases: [
      { input: [[1, 5, 3], [1, 2, 6]], expected: 1 },
      { input: [[3, 1, 2], [2, 1, 3]], expected: 2 },
      { input: [[1, 2, 3], [3, 2, 1]], expected: 2 },
      { input: [[], []], expected: -1 },
    ],
    hint: "Only the positions of the maxima matter here, not their heights.",
  },
  {
    id: "ts-169",
    title: "Peak Magnitude Error",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the peak magnitude error as max(forecast) - max(actual).\n\nReturn 0.0 if either series is empty.",
    starterCode: `def peak_magnitude_error(actual, forecast):
    # Your code here
    pass`,
    solution: `def peak_magnitude_error(actual, forecast):
    if not actual or not forecast:
        return 0.0
    return max(forecast) - max(actual)`,
    testCases: [
      { input: [[1, 5, 3], [1, 2, 6]], expected: 1 },
      { input: [[3, 1, 2], [2, 1, 3]], expected: 0 },
      { input: [[1, 2], [5, 8]], expected: 6 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Positive values mean the forecast overshoots the observed peak.",
  },
  {
    id: "ts-170",
    title: "Middle-Out Method",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Apply middle-out reconciliation lite: an aggregate plus its siblings defines the total, so return aggregate + sum(siblings).\n\nThis total is then distributed down the hierarchy.",
    starterCode: `def middle_out_method(aggregate, siblings):
    # Your code here
    pass`,
    solution: `def middle_out_method(aggregate, siblings):
    return aggregate + sum(siblings)`,
    testCases: [
      { input: [10, [1, 2, 3]], expected: 16 },
      { input: [0, []], expected: 0 },
      { input: [5, [2]], expected: 7 },
      { input: [1.5, [0.5, 0.5]], expected: 2.5 },
    ],
    hint: "Middle-out starts at an intermediate level and works in both directions.",
  },
  {
    id: "ts-171",
    title: "Linear Interpolation of Missing Points",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Fill missing (None) entries by linear interpolation between the nearest known neighbors; leading and trailing gaps take the nearest known value. Return the completed list.\n\nIf every entry is missing, return a list of zeros of the same length.",
    starterCode: `def linear_interpolation_missing(series):
    # Your code here
    pass`,
    solution: `def linear_interpolation_missing(series):
    n = len(series)
    known = [i for i, x in enumerate(series) if x is not None]
    if not known:
        return [0.0] * n
    out = list(series)
    for i in range(n):
        if series[i] is not None:
            continue
        left = None
        right = None
        for j in known:
            if j < i:
                left = j
            if j > i and right is None:
                right = j
        if left is None:
            out[i] = series[right]
        elif right is None:
            out[i] = series[left]
        else:
            frac = (i - left) / (right - left)
            out[i] = series[left] + frac * (series[right] - series[left])
    return out`,
    testCases: [
      { input: [[1, null, 3]], expected: [1, 2.0, 3] },
      { input: [[null, 2, null, 4]], expected: [2, 2, 3.0, 4] },
      { input: [[1, 2, 3]], expected: [1, 2, 3] },
      { input: [[null, null]], expected: [0.0, 0.0] },
    ],
    hint: "Interpolate by the fraction of the distance between the bounding known points.",
  },
  {
    id: "ts-172",
    title: "Kalman Smoothing One Step",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Perform one Rauch-Tung-Striebel smoothing step: smoothed = filtered + C * (next_smoothed - next_predicted), where C = p_filtered / p_predicted.\n\nReturn the filtered value when p_predicted is 0.",
    starterCode: `def kalman_smoothing_step(filtered, p_filtered, next_smoothed, next_predicted, p_predicted):
    # Your code here
    pass`,
    solution: `def kalman_smoothing_step(filtered, p_filtered, next_smoothed, next_predicted, p_predicted):
    if p_predicted == 0:
        return filtered
    c = p_filtered / p_predicted
    return filtered + c * (next_smoothed - next_predicted)`,
    testCases: [
      { input: [10, 1, 12, 11, 2], expected: 10.5 },
      { input: [0, 2, 4, 0, 4], expected: 2.0 },
      { input: [5, 0, 7, 6, 3], expected: 5.0 },
      { input: [3, 1, 3, 3, 0], expected: 3 },
    ],
    hint: "The smoother gain shrinks with the uncertainty of the predicted next state.",
  },
  {
    id: "ts-173",
    title: "EM One M-Step Lite",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Perform one lite EM M-step for the observation noise variance: r_new = mean((x - level)^2) + p, where p is the state covariance from the E-step.\n\nReturn p when observations is empty.",
    starterCode: `def em_one_m_step(level, p, observations):
    # Your code here
    pass`,
    solution: `def em_one_m_step(level, p, observations):
    if not observations:
        return p
    m = sum((x - level) ** 2 for x in observations) / len(observations)
    return m + p`,
    testCases: [
      { input: [0, 1, [1, 2, 3]], expected: 5.666666666666667 },
      { input: [1, 0, [1, 1, 1]], expected: 0.0 },
      { input: [0, 2, []], expected: 2 },
      { input: [2, 0.5, [1, 3]], expected: 1.5 },
    ],
    hint: "The state uncertainty p inflates the raw residual variance.",
  },
  {
    id: "ts-174",
    title: "Kling-Gupta Efficiency",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Compute the Kling-Gupta efficiency: 1 - sqrt((r - 1)^2 + (alpha - 1)^2 + (beta - 1)^2), where r is the Pearson correlation, alpha = std_forecast / std_actual, and beta = mean_forecast / mean_actual, all with population moments.\n\nReturn 0.0 when the lists are empty, mismatched, or any reference moment is zero.",
    starterCode: `def kling_gupta_efficiency(actual, forecast):
    # Your code here
    pass`,
    solution: `def kling_gupta_efficiency(actual, forecast):
    n = len(actual)
    if n == 0 or n != len(forecast):
        return 0.0
    ma = sum(actual) / n
    mf = sum(forecast) / n
    if ma == 0 or mf == 0:
        return 0.0
    sa = (sum((a - ma) ** 2 for a in actual) / n) ** 0.5
    sf = (sum((f - mf) ** 2 for f in forecast) / n) ** 0.5
    if sa == 0 or sf == 0:
        return 0.0
    num = sum((a - ma) * (f - mf) for a, f in zip(actual, forecast))
    r = num / (n * sa * sf)
    alpha = sf / sa
    beta = mf / ma
    return 1.0 - ((r - 1.0) ** 2 + (alpha - 1.0) ** 2 + (beta - 1.0) ** 2) ** 0.5`,
    testCases: [
      { input: [[1, 2, 3, 4], [1, 2, 3, 4]], expected: 0.9999999999999998 },
      { input: [[1, 2, 3, 4], [2, 2, 2, 2]], expected: 0.0 },
      { input: [[1, 2, 3], [1, 3, 2]], expected: 0.5000000000000001 },
      { input: [[2, 4, 6], [4, 8, 12]], expected: -0.41421356237309515 },
    ],
    hint: "The score decomposes into correlation, variability, and bias components.",
  },
  {
    id: "ts-175",
    title: "Flood Volume Error",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Compute the relative flood volume error: (sum(forecast) - sum(actual)) / sum(actual).\n\nReturn 0.0 when the actual total volume is zero.",
    starterCode: `def flood_volume_error(actual, forecast):
    # Your code here
    pass`,
    solution: `def flood_volume_error(actual, forecast):
    sa = sum(actual)
    if sa == 0:
        return 0.0
    return (sum(forecast) - sa) / sa`,
    testCases: [
      { input: [[1, 2, 3], [2, 3, 4]], expected: 0.5 },
      { input: [[5, 5], [4, 4]], expected: -0.2 },
      { input: [[0, 0], [1, 1]], expected: 0.0 },
      { input: [[2], [3]], expected: 0.5 },
    ],
    hint: "Positive values mean the forecast volume is too high.",
  },
  {
    id: "ts-176",
    title: "Spline Interpolation One Segment",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Evaluate a Catmull-Rom cubic at the midpoint of one segment between y1 and y2, given the neighboring points y0 and y3: (-y0 + 9 * y1 + 9 * y2 - y3) / 16.\n\nReturn the interpolated value.",
    starterCode: `def spline_interpolation_segment(y0, y1, y2, y3):
    # Your code here
    pass`,
    solution: `def spline_interpolation_segment(y0, y1, y2, y3):
    return (-y0 + 9.0 * y1 + 9.0 * y2 - y3) / 16.0`,
    testCases: [
      { input: [0, 1, 2, 3], expected: 1.5 },
      { input: [1, 1, 1, 1], expected: 1.0 },
      { input: [0, 0, 1, 1], expected: 0.5 },
      { input: [1, 2, 4, 8], expected: 2.8125 },
    ],
    hint: "Catmull-Rom passes through the middle points and uses the outer ones for slope.",
  },
  {
    id: "ts-177",
    title: "Intermittent Demand MASE",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Compute MASE for intermittent demand using the mean absolute period-to-period change of the training series as the scale: denominator = mean(|train[t] - train[t-1]|). Return the mean absolute forecast error divided by that denominator.\n\nReturn 0.0 when the denominator is zero, train is shorter than two points, or actual is empty.",
    starterCode: `def intermittent_mase(actual, forecast, train):
    # Your code here
    pass`,
    solution: `def intermittent_mase(actual, forecast, train):
    if len(train) < 2 or not actual:
        return 0.0
    den = sum(abs(train[t] - train[t - 1]) for t in range(1, len(train))) / (len(train) - 1)
    if den == 0:
        return 0.0
    return sum(abs(a - f) for a, f in zip(actual, forecast)) / len(actual) / den`,
    testCases: [
      { input: [[1, 0, 2], [1.5, 0.5, 1.5], [0, 0, 2, 0, 2]], expected: 0.3333333333333333 },
      { input: [[0, 0], [1, 1], [0, 0, 0]], expected: 0.0 },
      { input: [[5], [5], [1, 2]], expected: 0.0 },
      { input: [[2, 4], [3, 3], [1, 2, 3, 4]], expected: 1.0 },
    ],
    hint: "The period-to-period scale is robust to long runs of zero demand.",
  },
  {
    id: "ts-178",
    title: "Croston vs SES Comparison",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Compare Croston and simple exponential smoothing on the same intermittent series with smoothing factor alpha. Return [croston_forecast, ses_forecast], where the SES level is initialized with the first observation and updated over all points, including zeros.\n\nIf the series has no nonzero demand the Croston forecast is 0.0.",
    starterCode: `def croston_vs_ses(series, alpha):
    # Your code here
    pass`,
    solution: `def croston_vs_ses(series, alpha):
    size = None
    interval = 1
    gap = 0
    for x in series:
        gap += 1
        if x != 0:
            if size is None:
                size = x
                interval = gap
            else:
                size = alpha * x + (1 - alpha) * size
                interval = alpha * gap + (1 - alpha) * interval
            gap = 0
    if size is None or interval == 0:
        croston = 0.0
    else:
        croston = size / interval
    if not series:
        ses = 0.0
    else:
        s = series[0]
        for x in series[1:]:
            s = alpha * x + (1 - alpha) * s
        ses = s
    return [croston, ses]`,
    testCases: [
      { input: [[0, 0, 4, 0, 0, 6, 0, 2], 0.5], expected: [1.4, 1.8125] },
      { input: [[0, 0, 0], 0.3], expected: [0.0, 0.0] },
      { input: [[5], 0.5], expected: [5.0, 5] },
      { input: [[1, 0, 3, 0], 0.5], expected: [1.3333333333333333, 0.875] },
    ],
    hint: "Croston ignores zero periods when updating demand size; SES does not.",
  },
  {
    id: "ts-179",
    title: "Queue Length Forecast Lite",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Forecast a deterministic fluid queue: each period the queue becomes max(0, queue + arrival_rate - service_rate). Return the queue length after each of the given periods, starting from initial_queue.\n\nA negative queue is clipped to 0.",
    starterCode: `def queue_length_forecast_lite(arrival_rate, service_rate, initial_queue, periods):
    # Your code here
    pass`,
    solution: `def queue_length_forecast_lite(arrival_rate, service_rate, initial_queue, periods):
    out = []
    q = initial_queue
    for _ in range(periods):
        q = q + arrival_rate - service_rate
        if q < 0:
            q = 0.0
        out.append(q)
    return out`,
    testCases: [
      { input: [3, 2, 0, 4], expected: [1, 2, 3, 4] },
      { input: [1, 3, 5, 4], expected: [3, 1, 0.0, 0.0] },
      { input: [2, 2, 10, 2], expected: [10, 10] },
      { input: [0, 1, 0, 3], expected: [0.0, 0.0, 0.0] },
    ],
    hint: "When service exceeds arrivals the queue drains, but never below zero.",
  },
  {
    id: "ts-180",
    title: "Wind Power Curve",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Evaluate a wind turbine power curve. Below cut_in or above cut_out the power is 0.0; at or above rated_speed it is rated_power; in between it follows the cube of the normalized wind speed: rated_power * ((speed - cut_in) / (rated_speed - cut_in))^3.\n\nReturn the power for the given speed.",
    starterCode: `def wind_power_curve(speed, cut_in, rated_speed, cut_out, rated_power):
    # Your code here
    pass`,
    solution: `def wind_power_curve(speed, cut_in, rated_speed, cut_out, rated_power):
    if speed < cut_in or speed > cut_out:
        return 0.0
    if speed >= rated_speed:
        return rated_power
    frac = (speed - cut_in) / (rated_speed - cut_in)
    return rated_power * frac ** 3`,
    testCases: [
      { input: [3, 3, 12, 25, 2], expected: 0.0 },
      { input: [12, 3, 12, 25, 2], expected: 2 },
      { input: [26, 3, 12, 25, 2], expected: 0.0 },
      { input: [7.5, 3, 12, 25, 2], expected: 0.25 },
    ],
    hint: "The cubic region captures the physics of available wind power.",
  },
];
