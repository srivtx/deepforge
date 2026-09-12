import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "ts-091",
    title: "Intermittent Demand Check",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Return True when the share of zero observations in a series is at least threshold, which flags intermittent demand that standard smoothing handles poorly.\n\nAn empty series returns False.",
    starterCode: `def intermittent_demand_check(series, threshold):
    # Your code here
    pass`,
    solution: `def intermittent_demand_check(series, threshold):
    if not series:
        return False
    zeros = sum(1 for x in series if x == 0)
    return zeros / len(series) >= threshold`,
    testCases: [
      { input: [[0, 5, 0, 7], 0.5], expected: true },
      { input: [[1, 2, 3], 0.1], expected: false },
      { input: [[0, 0, 0], 1.0], expected: true },
      { input: [[], 0.3], expected: false },
    ],
    hint: "Count zeros, divide by the length, compare to the threshold.",
  },
  {
    id: "ts-092",
    title: "Hierarchical Forecast Coherence",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Check that a hierarchy reconciles: return True when abs(aggregate - sum(children)) <= tol.\n\nThis is the coherence condition that bottom-up reconciliation guarantees by construction.",
    starterCode: `def hierarchical_forecast_coherence(aggregate, children, tol):
    # Your code here
    pass`,
    solution: `def hierarchical_forecast_coherence(aggregate, children, tol):
    return abs(aggregate - sum(children)) <= tol`,
    testCases: [
      { input: [10, [3, 4, 3], 1e-9], expected: true },
      { input: [10, [3, 4, 4], 0.5], expected: false },
      { input: [0, [], 1e-9], expected: true },
      { input: [5.5, [1.1, 2.2, 2.2], 1e-6], expected: true },
    ],
    hint: "The tolerance absorbs floating-point rounding from earlier steps.",
  },
  {
    id: "ts-093",
    title: "Seasonal Naive with Drift",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Forecast h steps ahead with a seasonal naive model plus drift: series[-season_length] + h * drift.\n\nReturn None if season_length is not positive, exceeds the series length, or h is negative.",
    starterCode: `def seasonal_naive_drift(series, season_length, drift, h):
    # Your code here
    pass`,
    solution: `def seasonal_naive_drift(series, season_length, drift, h):
    if season_length <= 0 or len(series) < season_length or h < 0:
        return None
    return series[-season_length] + h * drift`,
    testCases: [
      { input: [[10, 20, 30, 40], 2, 1, 1], expected: 31 },
      { input: [[10, 20, 30, 40], 2, 1, 3], expected: 33 },
      { input: [[1, 2, 3], 3, 0.5, 2], expected: 2.0 },
      { input: [[1, 2], 5, 1, 1], expected: null },
    ],
    hint: "The drift adds a constant amount for every extra step of horizon.",
  },
  {
    id: "ts-094",
    title: "Damped Trend Forecast",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Forecast with a damped trend: level + trend * (phi + phi^2 + ... + phi^h).\n\nWhen phi is between 0 and 1 the trend contribution flattens as the horizon grows. h <= 0 returns the level itself.",
    starterCode: `def damped_trend_forecast(level, trend, phi, h):
    # Your code here
    pass`,
    solution: `def damped_trend_forecast(level, trend, phi, h):
    total = 0.0
    for i in range(1, h + 1):
        total += phi ** i
    return level + trend * total`,
    testCases: [
      { input: [10, 2, 0.5, 1], expected: 11.0 },
      { input: [10, 2, 0.5, 2], expected: 11.5 },
      { input: [10, 2, 0.5, 3], expected: 11.75 },
      { input: [5, 0, 0.9, 5], expected: 5.0 },
    ],
    hint: "The geometric sum converges to phi / (1 - phi) as h grows.",
  },
  {
    id: "ts-095",
    title: "Changepoint Penalty BIC",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the BIC-style penalty for adding a changepoint with p parameters: p * ln(n) for n observations.\n\nReturn 0.0 if n or p is not positive.",
    starterCode: `import math
def changepoint_penalty_bic(n, p):
    # Your code here
    pass`,
    solution: `import math
def changepoint_penalty_bic(n, p):
    if n <= 0 or p <= 0:
        return 0.0
    return p * math.log(n)`,
    testCases: [
      { input: [100, 1], expected: 4.605170185988092 },
      { input: [100, 3], expected: 13.815510557964275 },
      { input: [1, 2], expected: 0.0 },
      { input: [10, 0], expected: 0.0 },
    ],
    hint: "The penalty grows with sample size, but only logarithmically.",
  },
  {
    id: "ts-096",
    title: "Feature-Based Classification",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Classify a series by nearest centroid in [mean, standard deviation, OLS slope] feature space. Compute the feature vector of value and of each training series, then return 0 if it is at least as close to train0 as to train1, otherwise 1.\n\nDistances are squared Euclidean between the three-element feature vectors.",
    starterCode: `def classify_by_features(train0, train1, value):
    # Your code here
    pass`,
    solution: `def classify_by_features(train0, train1, value):
    def feats(s):
        n = len(s)
        m = sum(s) / n
        sd = (sum((x - m) ** 2 for x in s) / n) ** 0.5
        if n < 2:
            slope = 0.0
        else:
            mt = (n - 1) / 2.0
            num = sum((t - mt) * (s[t] - m) for t in range(n))
            den = sum((t - mt) ** 2 for t in range(n))
            slope = 0.0 if den == 0 else num / den
        return [m, sd, slope]

    f = feats(value)
    d0 = sum((a - b) ** 2 for a, b in zip(f, feats(train0)))
    d1 = sum((a - b) ** 2 for a, b in zip(f, feats(train1)))
    if d0 <= d1:
        return 0
    return 1`,
    testCases: [
      { input: [[1, 1, 1], [1, 2, 4], [1, 1, 1]], expected: 0 },
      { input: [[1, 1, 1], [1, 2, 4], [1.1, 2.1, 4.1]], expected: 1 },
      { input: [[0, 0, 0, 0], [10, 10, 10, 10], [3, 3, 3, 3]], expected: 0 },
      { input: [[0, 0, 0, 0], [10, 10, 10, 10], [6, 6, 6, 6]], expected: 1 },
    ],
    hint: "A tie in distance goes to class 0.",
  },
  {
    id: "ts-097",
    title: "Event Study Abnormal Return",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute event-study abnormal returns given actual returns, market returns, and a market model with parameters alpha and beta: abnormal[t] = returns[t] - (alpha + beta * market[t]).\n\nReturn the list of abnormal returns.",
    starterCode: `def event_abnormal_return(returns, market, alpha, beta):
    # Your code here
    pass`,
    solution: `def event_abnormal_return(returns, market, alpha, beta):
    return [r - (alpha + beta * m) for r, m in zip(returns, market)]`,
    testCases: [
      { input: [[0.02, 0.03], [0.01, 0.01], 0.0, 1.0], expected: [0.01, 0.019999999999999997] },
      { input: [[0.05], [-0.02], 0.01, 0.5], expected: [0.05] },
      { input: [[0, 0], [0, 0], 0.01, 0.0], expected: [-0.01, -0.01] },
      { input: [[0.1, -0.1], [0.05, -0.05], 0.0, 2.0], expected: [0.0, 0.0] },
    ],
    hint: "The expected return comes from the fitted market model, not the raw market return.",
  },
  {
    id: "ts-098",
    title: "Calmar Ratio",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the Calmar ratio as total_return / abs(max_drawdown), a return measure scaled by the worst peak-to-trough loss.\n\nReturn 0.0 when max_drawdown is 0.",
    starterCode: `def calmar_ratio(total_return, max_drawdown):
    # Your code here
    pass`,
    solution: `def calmar_ratio(total_return, max_drawdown):
    if max_drawdown == 0:
        return 0.0
    return total_return / abs(max_drawdown)`,
    testCases: [
      { input: [0.5, 0.25], expected: 2.0 },
      { input: [0.3, 0], expected: 0.0 },
      { input: [-0.1, 0.2], expected: -0.5 },
      { input: [0.4, -0.2], expected: 2.0 },
    ],
    hint: "Only the magnitude of the drawdown matters, not its sign convention.",
  },
  {
    id: "ts-099",
    title: "Information Ratio",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the information ratio as mean(active) / std(active), where active[t] = portfolio[t] - benchmark[t] and std is the population standard deviation.\n\nReturn 0.0 when the lists are empty, differ in length, or the active return has zero standard deviation.",
    starterCode: `def information_ratio(portfolio, benchmark):
    # Your code here
    pass`,
    solution: `def information_ratio(portfolio, benchmark):
    n = len(portfolio)
    if n == 0 or n != len(benchmark):
        return 0.0
    active = [p - b for p, b in zip(portfolio, benchmark)]
    m = sum(active) / n
    sd = (sum((a - m) ** 2 for a in active) / n) ** 0.5
    if sd == 0:
        return 0.0
    return m / sd`,
    testCases: [
      { input: [[0.02, 0.03, 0.01], [0.01, 0.01, 0.00]], expected: 2.8284271247461903 },
      { input: [[0.05, 0.05], [0.02, 0.02]], expected: 0.0 },
      { input: [[0.01, -0.01], [0.0, 0.0]], expected: 0.0 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "It measures active return per unit of active risk.",
  },
  {
    id: "ts-100",
    title: "Treynor Ratio",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the Treynor ratio: (mean(returns) - rf) / beta, the excess return earned per unit of systematic risk.\n\nReturn 0.0 when returns is empty or beta is 0.",
    starterCode: `def treynor_ratio(returns, beta, rf):
    # Your code here
    pass`,
    solution: `def treynor_ratio(returns, beta, rf):
    if not returns or beta == 0:
        return 0.0
    return (sum(returns) / len(returns) - rf) / beta`,
    testCases: [
      { input: [[0.1, 0.2, 0.3], 1.5, 0.02], expected: 0.12 },
      { input: [[0.05], 0, 0.0], expected: 0.0 },
      { input: [[0.1, -0.05], 2.0, 0.0], expected: 0.0125 },
      { input: [[0.1, 0.1], 1, 0.1], expected: 0.0 },
    ],
    hint: "Only systematic risk (beta) is in the denominator.",
  },
  {
    id: "ts-101",
    title: "Jensen Alpha",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute Jensen's alpha: mean(portfolio) - (rf + beta * (mean(market) - rf)), the excess return left unexplained by CAPM.\n\nReturn 0.0 if either list is empty.",
    starterCode: `def jensen_alpha(portfolio, market, beta, rf):
    # Your code here
    pass`,
    solution: `def jensen_alpha(portfolio, market, beta, rf):
    if not portfolio or not market:
        return 0.0
    mp = sum(portfolio) / len(portfolio)
    mm = sum(market) / len(market)
    return mp - (rf + beta * (mm - rf))`,
    testCases: [
      { input: [[0.02, 0.03], [0.01, 0.02], 1.2, 0.01], expected: 0.009000000000000001 },
      { input: [[0.05], [0.04], 1.0, 0.0], expected: 0.010000000000000002 },
      { input: [[0.1, 0.1], [0.05, 0.05], 0.0, 0.01], expected: 0.09000000000000001 },
      { input: [[0.0], [-0.02], 1.5, 0.0], expected: 0.03 },
    ],
    hint: "Compare the realized mean return with the CAPM-predicted return.",
  },
  {
    id: "ts-102",
    title: "Tracking Error",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the tracking error as the population standard deviation of the active returns portfolio[t] - benchmark[t].\n\nReturn 0.0 when the lists are empty or have different lengths.",
    starterCode: `def tracking_error(portfolio, benchmark):
    # Your code here
    pass`,
    solution: `def tracking_error(portfolio, benchmark):
    n = len(portfolio)
    if n == 0 or n != len(benchmark):
        return 0.0
    active = [p - b for p, b in zip(portfolio, benchmark)]
    m = sum(active) / n
    return (sum((a - m) ** 2 for a in active) / n) ** 0.5`,
    testCases: [
      { input: [[0.02, 0.03, 0.01], [0.01, 0.01, 0.00]], expected: 0.004714045207910316 },
      { input: [[0.05, 0.05], [0.02, 0.02]], expected: 0.0 },
      { input: [[0.01, -0.01], [0.0, 0.0]], expected: 0.01 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Tracking error is the volatility of the return difference, not of either series.",
  },
  {
    id: "ts-103",
    title: "Active Share Lite",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute lite active share as half the sum of absolute weight differences: sum(abs(w_portfolio - w_benchmark)) / 2.\n\nReturn 0.0 if the weight lists are empty or differ in length. Both weight vectors are assumed to sum to 1.",
    starterCode: `def active_share_lite(w_portfolio, w_benchmark):
    # Your code here
    pass`,
    solution: `def active_share_lite(w_portfolio, w_benchmark):
    if not w_portfolio or len(w_portfolio) != len(w_benchmark):
        return 0.0
    return sum(abs(p - b) for p, b in zip(w_portfolio, w_benchmark)) / 2.0`,
    testCases: [
      { input: [[0.5, 0.3, 0.2], [0.4, 0.35, 0.25]], expected: 0.09999999999999998 },
      { input: [[1, 0], [1, 0]], expected: 0.0 },
      { input: [[0.6, 0.4], [0.4, 0.6]], expected: 0.19999999999999996 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "0 means an index-hugging portfolio; 1 means no overlap at all.",
  },
  {
    id: "ts-104",
    title: "Volatility Scaling",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Scale a return series to a target volatility using the realized volatility sqrt(sum(r^2)): each return becomes r * target_vol / realized_vol.\n\nReturn an empty list for empty returns; if realized volatility is zero, return a list of zeros of the same length.",
    starterCode: `def volatility_scaling(returns, target_vol):
    # Your code here
    pass`,
    solution: `def volatility_scaling(returns, target_vol):
    if not returns:
        return []
    current = sum(r * r for r in returns) ** 0.5
    if current == 0:
        return [0.0] * len(returns)
    return [r * target_vol / current for r in returns]`,
    testCases: [
      { input: [[0.01, -0.02, 0.03], 0.05], expected: [0.013363062095621218, -0.026726124191242435, 0.04008918628686366] },
      { input: [[0, 0], 0.1], expected: [0.0, 0.0] },
      { input: [[0.1], 0.2], expected: [0.20000000000000004] },
      { input: [[], 0.1], expected: [] },
    ],
    hint: "Scaling preserves the signs and the shape of the return path.",
  },
  {
    id: "ts-105",
    title: "Risk Parity Weights",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute two-asset risk parity weights, which are inversely proportional to volatility: w1 = (1/sigma1) / (1/sigma1 + 1/sigma2).\n\nReturn [0.5, 0.5] if both volatilities are non-positive; if only one is non-positive, assign all weight to the other asset.",
    starterCode: `def risk_parity_weights(sigma1, sigma2):
    # Your code here
    pass`,
    solution: `def risk_parity_weights(sigma1, sigma2):
    if sigma1 <= 0 and sigma2 <= 0:
        return [0.5, 0.5]
    if sigma1 <= 0:
        return [0.0, 1.0]
    if sigma2 <= 0:
        return [1.0, 0.0]
    w1 = 1.0 / sigma1
    w2 = 1.0 / sigma2
    return [w1 / (w1 + w2), w2 / (w1 + w2)]`,
    testCases: [
      { input: [0.2, 0.4], expected: [0.6666666666666666, 0.3333333333333333] },
      { input: [0.3, 0.3], expected: [0.5, 0.5] },
      { input: [0, 0.2], expected: [0.0, 1.0] },
      { input: [0.1, 0], expected: [1.0, 0.0] },
    ],
    hint: "Equal risk contributions mean the calmer asset gets the bigger weight.",
  },
  {
    id: "ts-106",
    title: "Kelly Fraction",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the Kelly fraction for a bet with win probability p and payoff odds b: f = (p * b - (1 - p)) / b.\n\nReturn 0.0 when b is not positive. A negative result means the bet has no edge.",
    starterCode: `def kelly_fraction(p, b):
    # Your code here
    pass`,
    solution: `def kelly_fraction(p, b):
    if b <= 0:
        return 0.0
    return (p * b - (1.0 - p)) / b`,
    testCases: [
      { input: [0.6, 2], expected: 0.39999999999999997 },
      { input: [0.5, 1], expected: 0.0 },
      { input: [0.4, 2], expected: 0.10000000000000003 },
      { input: [0.6, 0], expected: 0.0 },
    ],
    hint: "The Kelly fraction maximizes expected logarithmic growth.",
  },
  {
    id: "ts-107",
    title: "Theta Method Forecast",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the theta method forecast h steps ahead: the SES forecast with smoothing factor alpha plus 0.5 * h * slope, where slope is the OLS slope of the series on time.\n\nReturn 0.0 for an empty series; a single point has slope 0.",
    starterCode: `def theta_method_forecast(series, alpha, h):
    # Your code here
    pass`,
    solution: `def theta_method_forecast(series, alpha, h):
    if not series:
        return 0.0
    s = series[0]
    for x in series[1:]:
        s = alpha * x + (1 - alpha) * s
    n = len(series)
    if n < 2:
        slope = 0.0
    else:
        mt = (n - 1) / 2.0
        mx = sum(series) / n
        num = sum((t - mt) * (series[t] - mx) for t in range(n))
        den = sum((t - mt) ** 2 for t in range(n))
        slope = 0.0 if den == 0 else num / den
    return s + 0.5 * h * slope`,
    testCases: [
      { input: [[1, 2, 3, 4], 0.5, 1], expected: 3.625 },
      { input: [[1, 2, 3, 4], 0.5, 2], expected: 4.125 },
      { input: [[5, 5, 5], 0.3, 1], expected: 5.0 },
      { input: [[10], 0.7, 3], expected: 10.0 },
    ],
    hint: "The theta method blends exponential smoothing with half the linear trend.",
  },
  {
    id: "ts-108",
    title: "Croston Method Lite",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Run lite Croston's method for intermittent demand. Each nonzero demand updates a demand-size estimate with smoothing alpha, and together with the gap since the previous nonzero demand updates an interval estimate the same way. Return the ratio size / interval.\n\nReturn 0.0 if the series contains no nonzero demand.",
    starterCode: `def croston_method(series, alpha):
    # Your code here
    pass`,
    solution: `def croston_method(series, alpha):
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
        return 0.0
    return size / interval`,
    testCases: [
      { input: [[0, 0, 4, 0, 0, 6, 0, 2], 0.5], expected: 1.4 },
      { input: [[0, 0, 0], 0.3], expected: 0.0 },
      { input: [[5], 0.5], expected: 5.0 },
      { input: [[0, 3, 0, 0, 6, 0], 0.5], expected: 1.8 },
    ],
    hint: "Croston smooths demand size and inter-arrival gap separately.",
  },
  {
    id: "ts-109",
    title: "TSB Method Lite",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Perform one Teunter-Syntetos-Babai (TSB) update and return [probability, size, forecast]. If obs > 0 the occurrence probability becomes beta * 1 + (1 - beta) * prob and the size becomes alpha * obs + (1 - alpha) * size; otherwise the probability decays by (1 - beta) and the size is unchanged. The forecast is probability * size.",
    starterCode: `def tsb_method_step(prob, size, obs, alpha, beta):
    # Your code here
    pass`,
    solution: `def tsb_method_step(prob, size, obs, alpha, beta):
    if obs > 0:
        p_new = beta * 1.0 + (1 - beta) * prob
        z_new = alpha * obs + (1 - alpha) * size
    else:
        p_new = (1 - beta) * prob
        z_new = size
    return [p_new, z_new, p_new * z_new]`,
    testCases: [
      { input: [0.2, 5, 8, 0.3, 0.4], expected: [0.52, 5.9, 3.0680000000000005] },
      { input: [0.2, 5, 0, 0.3, 0.4], expected: [0.12, 5, 0.6] },
      { input: [0.1, 2, 3, 0.5, 0.5], expected: [0.55, 2.5, 1.375] },
      { input: [0.5, 4, 0, 0.2, 0.6], expected: [0.2, 4, 0.8] },
    ],
    hint: "Unlike Croston, TSB updates the probability on every period, including zeros.",
  },
  {
    id: "ts-110",
    title: "Forecast Reconciliation Bottom-Up",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Aggregate child forecasts bottom-up: sum the child forecast lists elementwise across children so the total forecast equals the sum of its parts.\n\nReturn a list with one entry per forecast horizon, or an empty list when there are no children.",
    starterCode: `def forecast_reconciliation_bottom_up(child_forecasts):
    # Your code here
    pass`,
    solution: `def forecast_reconciliation_bottom_up(child_forecasts):
    if not child_forecasts:
        return []
    h = len(child_forecasts[0])
    out = []
    for t in range(h):
        out.append(sum(child[t] for child in child_forecasts))
    return out`,
    testCases: [
      { input: [[[1, 2], [3, 4], [5, 6]]], expected: [9, 12] },
      { input: [[[1], [2]]], expected: [3] },
      { input: [[]], expected: [] },
      { input: [[[0, 0], [0, 0]]], expected: [0, 0] },
    ],
    hint: "Bottom-up reconciliation is coherent by construction.",
  },
  {
    id: "ts-111",
    title: "Top-Down Reconciliation",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Allocate an aggregate forecast to children using historical proportions. Normalize the proportions to sum to 1 and multiply each by the aggregate.\n\nReturn the list of child forecasts; if all proportions are zero return a list of zeros.",
    starterCode: `def top_down_reconciliation(aggregate_forecast, proportions):
    # Your code here
    pass`,
    solution: `def top_down_reconciliation(aggregate_forecast, proportions):
    total = sum(proportions)
    if total == 0:
        return [0.0] * len(proportions)
    return [aggregate_forecast * p / total for p in proportions]`,
    testCases: [
      { input: [100, [0.5, 0.3, 0.2]], expected: [50.0, 30.0, 20.0] },
      { input: [12, [1, 1, 1]], expected: [4.0, 4.0, 4.0] },
      { input: [5, [2]], expected: [5.0] },
      { input: [10, [0, 0]], expected: [0.0, 0.0] },
    ],
    hint: "Normalizing makes the children always add up to the aggregate.",
  },
  {
    id: "ts-112",
    title: "Holt-Winters Multiplicative One Step",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Perform one multiplicative Holt-Winters update and return [level, trend, seasonal]. Given the old states and observation x: new_level = alpha * (x / seasonal) + (1 - alpha) * (level + trend); new_trend = beta * (new_level - level) + (1 - beta) * trend; new_seasonal = gamma * (x / new_level) + (1 - gamma) * seasonal.\n\nThe seasonal factor must be nonzero.",
    starterCode: `def holt_winters_multiplicative_step(level, trend, seasonal, x, alpha, beta, gamma):
    # Your code here
    pass`,
    solution: `def holt_winters_multiplicative_step(level, trend, seasonal, x, alpha, beta, gamma):
    l = alpha * (x / seasonal) + (1 - alpha) * (level + trend)
    b = beta * (l - level) + (1 - beta) * trend
    s = gamma * (x / l) + (1 - gamma) * seasonal
    return [l, b, s]`,
    testCases: [
      { input: [10, 0.5, 1.5, 12, 0.5, 0.3, 0.4], expected: [9.25, 0.125, 1.4189189189189189] },
      { input: [5, 0.2, 2.0, 6, 0.4, 0.3, 0.2], expected: [4.32, -0.06399999999999992, 1.8777777777777778] },
      { input: [1, 0, 1, 1, 0.5, 0.5, 0.5], expected: [1.0, 0.0, 1.0] },
      { input: [10, 1, 0.5, 9, 0.2, 0.1, 0.9], expected: [12.4, 1.1400000000000001, 0.703225806451613] },
    ],
    hint: "Multiplicative seasonality divides the observation by the seasonal factor instead of subtracting it.",
  },
  {
    id: "ts-113",
    title: "Multiple Seasonal Indices",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Combine two seasonal index vectors multiplicatively: return indices1[t % len(indices1)] * indices2[t % len(indices2)].\n\nReturn 0.0 if either vector is empty or t is negative. This models two overlapping calendar effects, such as weekly and annual cycles.",
    starterCode: `def multiple_seasonal_indices(indices1, indices2, t):
    # Your code here
    pass`,
    solution: `def multiple_seasonal_indices(indices1, indices2, t):
    if not indices1 or not indices2 or t < 0:
        return 0.0
    return indices1[t % len(indices1)] * indices2[t % len(indices2)]`,
    testCases: [
      { input: [[0.9, 1.1, 1.0], [1.2, 0.8], 4], expected: 1.32 },
      { input: [[0.9, 1.1, 1.0], [1.2, 0.8], 0], expected: 1.08 },
      { input: [[1.5], [2.0, 0.5], 5], expected: 0.75 },
      { input: [[], [1], 0], expected: 0.0 },
    ],
    hint: "Take each index modulo its own cycle length before multiplying.",
  },
  {
    id: "ts-114",
    title: "Sen Slope Trend",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the Sen (Theil-Sen) slope as the median of all pairwise slopes (series[j] - series[i]) / (j - i) for i < j.\n\nReturn 0.0 when fewer than two points are available. For an even number of slopes, average the two middle values.",
    starterCode: `def sen_slope(series):
    # Your code here
    pass`,
    solution: `def sen_slope(series):
    n = len(series)
    slopes = []
    for i in range(n):
        for j in range(i + 1, n):
            slopes.append((series[j] - series[i]) / (j - i))
    if not slopes:
        return 0.0
    slopes.sort()
    mid = len(slopes) // 2
    if len(slopes) % 2 == 1:
        return slopes[mid]
    return (slopes[mid - 1] + slopes[mid]) / 2.0`,
    testCases: [
      { input: [[1, 2, 3, 4]], expected: 1.0 },
      { input: [[1, 3, 2, 4]], expected: 0.75 },
      { input: [[5, 5, 5]], expected: 0.0 },
      { input: [[10, 9, 8]], expected: -1.0 },
    ],
    hint: "The median makes the estimator robust to a few outliers.",
  },
  {
    id: "ts-115",
    title: "Mann-Kendall Statistic",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the Mann-Kendall trend statistic S = sum over i < j of sign(series[j] - series[i]), counting +1 for increases and -1 for decreases.\n\nPositive S indicates an upward trend, negative S a downward trend, and 0 no monotone tendency.",
    starterCode: `def mann_kendall_statistic(series):
    # Your code here
    pass`,
    solution: `def mann_kendall_statistic(series):
    n = len(series)
    s = 0
    for i in range(n):
        for j in range(i + 1, n):
            d = series[j] - series[i]
            if d > 0:
                s += 1
            elif d < 0:
                s -= 1
    return s`,
    testCases: [
      { input: [[1, 2, 3, 4]], expected: 6 },
      { input: [[4, 3, 2, 1]], expected: -6 },
      { input: [[1, 3, 2]], expected: 1 },
      { input: [[5, 5, 5]], expected: 0 },
    ],
    hint: "It is a nonparametric test: only the signs of pairs matter, not magnitudes.",
  },
  {
    id: "ts-116",
    title: "Trend Significance Lite",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the standardized Mann-Kendall z score. Let S be the Mann-Kendall statistic and var = n(n-1)(2n+5)/18; applying a continuity correction, z = (S - 1)/sqrt(var) when S > 0, z = (S + 1)/sqrt(var) when S < 0, and 0 when S = 0.\n\nReturn 0.0 for fewer than three observations or zero variance.",
    starterCode: `def trend_significance_lite(series):
    # Your code here
    pass`,
    solution: `def trend_significance_lite(series):
    n = len(series)
    if n < 3:
        return 0.0
    s = 0
    for i in range(n):
        for j in range(i + 1, n):
            d = series[j] - series[i]
            if d > 0:
                s += 1
            elif d < 0:
                s -= 1
    var = n * (n - 1) * (2 * n + 5) / 18.0
    if var == 0:
        return 0.0
    if s > 0:
        return (s - 1) / var ** 0.5
    if s < 0:
        return (s + 1) / var ** 0.5
    return 0.0`,
    testCases: [
      { input: [[1, 2, 3, 4, 5]], expected: 2.2045407685048604 },
      { input: [[1, 2, 3]], expected: 1.044465935734187 },
      { input: [[3, 2, 1]], expected: -1.044465935734187 },
      { input: [[5, 5, 5, 5]], expected: 0.0 },
    ],
    hint: "Values of abs(z) above about 1.96 suggest a significant trend at 5 percent.",
  },
  {
    id: "ts-117",
    title: "Anomaly Window Detection",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Count sliding windows of length window whose mean deviates from the overall mean by more than k population standard deviations: abs(window_mean - mean) > k * std.\n\nReturn 0 if window is not positive, window exceeds the series length, or the series has zero variance.",
    starterCode: `def anomaly_window_detection(series, k, window):
    # Your code here
    pass`,
    solution: `def anomaly_window_detection(series, k, window):
    n = len(series)
    if window <= 0 or window > n:
        return 0
    m = sum(series) / n
    sd = (sum((x - m) ** 2 for x in series) / n) ** 0.5
    if sd == 0:
        return 0
    count = 0
    for i in range(n - window + 1):
        wm = sum(series[i:i + window]) / window
        if abs(wm - m) > k * sd:
            count += 1
    return count`,
    testCases: [
      { input: [[1, 1, 1, 1, 10, 10], 1, 2], expected: 1 },
      { input: [[1, 2, 3, 4, 5], 0.5, 1], expected: 4 },
      { input: [[5, 5, 5, 5], 1, 2], expected: 0 },
      { input: [[1, 2, 1, 2], 10, 2], expected: 0 },
    ],
    hint: "Compare each window mean to the global scale, and use a strict inequality.",
  },
  {
    id: "ts-118",
    title: "Rolling Skewness",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the rolling population skewness with window size k: mean((x - window_mean)^3) / std^3, where std is the population standard deviation.\n\nReturn an empty list if k is not positive or exceeds the series; windows with zero variance produce 0.0.",
    starterCode: `def rolling_skewness(series, k):
    # Your code here
    pass`,
    solution: `def rolling_skewness(series, k):
    if k <= 0 or k > len(series):
        return []
    out = []
    for i in range(len(series) - k + 1):
        w = series[i:i + k]
        m = sum(w) / k
        var = sum((x - m) ** 2 for x in w) / k
        if var == 0:
            out.append(0.0)
        else:
            sd = var ** 0.5
            out.append(sum((x - m) ** 3 for x in w) / k / (sd ** 3))
    return out`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 3], expected: [0.0, 0.0, 0.0] },
      { input: [[1, 2, 10], 3], expected: [0.6745554845457659] },
      { input: [[1, 1, 1, 2, 10], 3], expected: [0.0, 0.707106781186548, 0.6745554845457659] },
      { input: [[5, 5, 5], 1], expected: [0.0, 0.0, 0.0] },
    ],
    hint: "Positive skewness means a long right tail.",
  },
  {
    id: "ts-119",
    title: "Rolling Kurtosis",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the rolling population excess kurtosis with window size k: mean((x - window_mean)^4) / variance^2 - 3.\n\nReturn an empty list if k is not positive or exceeds the series; windows with zero variance produce 0.0 by convention.",
    starterCode: `def rolling_kurtosis(series, k):
    # Your code here
    pass`,
    solution: `def rolling_kurtosis(series, k):
    if k <= 0 or k > len(series):
        return []
    out = []
    for i in range(len(series) - k + 1):
        w = series[i:i + k]
        m = sum(w) / k
        var = sum((x - m) ** 2 for x in w) / k
        if var == 0:
            out.append(0.0)
        else:
            out.append(sum((x - m) ** 4 for x in w) / k / (var * var) - 3.0)
    return out`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 3], expected: [-1.5, -1.5, -1.5] },
      { input: [[1, 1, 1, 2, 10], 3], expected: [0.0, -1.4999999999999993, -1.4999999999999996] },
      { input: [[1, 2, 3], 3], expected: [-1.5] },
      { input: [[5, 5], 2], expected: [0.0] },
    ],
    hint: "Excess kurtosis is 0 for a normal distribution and negative for light tails.",
  },
  {
    id: "ts-120",
    title: "Rolling Correlation",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the rolling Pearson correlation between x and y with window size k for each aligned window.\n\nReturn an empty list if the lengths differ or k is out of range; windows with zero variance in either series produce 0.0.",
    starterCode: `def rolling_correlation(x, y, k):
    # Your code here
    pass`,
    solution: `def rolling_correlation(x, y, k):
    n = len(x)
    if n != len(y) or k <= 0 or k > n:
        return []
    out = []
    for i in range(n - k + 1):
        xs = x[i:i + k]
        ys = y[i:i + k]
        mx = sum(xs) / k
        my = sum(ys) / k
        num = sum((a - mx) * (b - my) for a, b in zip(xs, ys))
        dx = sum((a - mx) ** 2 for a in xs) ** 0.5
        dy = sum((b - my) ** 2 for b in ys) ** 0.5
        out.append(0.0 if dx == 0 or dy == 0 else num / (dx * dy))
    return out`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], [2, 4, 6, 8, 10], 3], expected: [0.9999999999999998, 0.9999999999999998, 0.9999999999999998] },
      { input: [[1, 2, 3, 4], [4, 3, 2, 1], 2], expected: [-0.9999999999999998, -0.9999999999999998, -0.9999999999999998] },
      { input: [[1, 1, 1, 1], [1, 2, 3, 4], 2], expected: [0.0, 0.0, 0.0] },
      { input: [[1, 2, 3], [1, 2, 3], 3], expected: [0.9999999999999998] },
    ],
    hint: "The result lies in [-1, 1]; a flat window cannot correlate with anything.",
  },
  {
    id: "ts-121",
    title: "Rolling Beta",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the rolling OLS beta of y on x with window size k: sum((x - mean_x) * (y - mean_y)) / sum((x - mean_x)^2) for each aligned window.\n\nReturn an empty list if the lengths differ or k is out of range; windows where x has zero variance produce 0.0.",
    starterCode: `def rolling_beta(y, x, k):
    # Your code here
    pass`,
    solution: `def rolling_beta(y, x, k):
    n = len(x)
    if n != len(y) or k <= 0 or k > n:
        return []
    out = []
    for i in range(n - k + 1):
        xs = x[i:i + k]
        ys = y[i:i + k]
        mx = sum(xs) / k
        my = sum(ys) / k
        num = sum((a - mx) * (b - my) for a, b in zip(xs, ys))
        den = sum((a - mx) ** 2 for a in xs)
        out.append(0.0 if den == 0 else num / den)
    return out`,
    testCases: [
      { input: [[2, 4, 6, 8], [1, 2, 3, 4], 2], expected: [2.0, 2.0, 2.0] },
      { input: [[1, 1, 1], [1, 2, 3], 2], expected: [0.0, 0.0] },
      { input: [[1, 2, 4], [1, 1, 1], 3], expected: [0.0] },
      { input: [[3, 5, 6], [1, 2, 3], 2], expected: [2.0, 1.0] },
    ],
    hint: "Beta is the slope of the regression of y on x within each window.",
  },
  {
    id: "ts-122",
    title: "Rolling Sharpe",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the rolling Sharpe ratio with window size k: window_mean / window_std, using the population standard deviation.\n\nReturn an empty list if k is not positive or exceeds the series; windows with near zero standard deviation (below 1e-12) produce 0.0.",
    starterCode: `def rolling_sharpe(returns, k):
    # Your code here
    pass`,
    solution: `def rolling_sharpe(returns, k):
    if k <= 0 or k > len(returns):
        return []
    out = []
    for i in range(len(returns) - k + 1):
        w = returns[i:i + k]
        m = sum(w) / k
        sd = (sum((r - m) ** 2 for r in w) / k) ** 0.5
        out.append(0.0 if sd < 1e-12 else m / sd)
    return out`,
    testCases: [
      { input: [[0.02, 0.01, 0.03, -0.01], 2], expected: [3.0, 2.0, 0.4999999999999999] },
      { input: [[0.1, 0.2, 0.3], 3], expected: [2.4494897427831783] },
      { input: [[0, 0, 0], 2], expected: [0.0, 0.0] },
      { input: [[0.05, 0.05, 0.05], 3], expected: [0.0] },
    ],
    hint: "The ratio is not annualized; it is the raw reward per unit of risk in the window.",
  },
  {
    id: "ts-123",
    title: "Drawdown Duration",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the longest drawdown duration in a price series: the maximum number of consecutive observations strictly below the running peak. Any new high resets the counter.\n\nReturn 0 for an empty series or one that only makes new highs.",
    starterCode: `def drawdown_duration(prices):
    # Your code here
    pass`,
    solution: `def drawdown_duration(prices):
    if not prices:
        return 0
    peak = prices[0]
    cur = 0
    best = 0
    for p in prices:
        if p >= peak:
            peak = p
            cur = 0
        else:
            cur += 1
            if cur > best:
                best = cur
    return best`,
    testCases: [
      { input: [[1, 2, 1, 2, 3]], expected: 1 },
      { input: [[5, 4, 3, 2, 6]], expected: 3 },
      { input: [[1, 2, 3]], expected: 0 },
      { input: [[3, 2, 2, 1, 3]], expected: 3 },
    ],
    hint: "Duration counts time, not the depth of the drawdown.",
  },
  {
    id: "ts-124",
    title: "Sortino Ratio",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the Sortino ratio: (mean(returns) - target) / downside_deviation, where the downside deviation is the square root of the mean squared shortfall min(0, r - target) over all observations.\n\nReturn 0.0 when there are no downside observations or the deviation is zero.",
    starterCode: `def sortino_ratio(returns, target):
    # Your code here
    pass`,
    solution: `def sortino_ratio(returns, target):
    n = len(returns)
    if n == 0:
        return 0.0
    mean = sum(returns) / n
    downs = [r - target for r in returns if r < target]
    if not downs:
        return 0.0
    dd = (sum(d * d for d in downs) / n) ** 0.5
    if dd == 0:
        return 0.0
    return (mean - target) / dd`,
    testCases: [
      { input: [[0.1, -0.05, 0.2, -0.02], 0.0], expected: 2.135496389036096 },
      { input: [[0.05, 0.06], 0.0], expected: 0.0 },
      { input: [[0.1, 0.1, 0.1], 0.05], expected: 0.0 },
      { input: [[], 0.0], expected: 0.0 },
    ],
    hint: "Only shortfalls below the target enter the denominator.",
  },
  {
    id: "ts-125",
    title: "Minimum Variance Weights",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute minimum-variance portfolio weights for two assets given their volatilities and correlation: w1 = (sigma2^2 - rho * sigma1 * sigma2) / (sigma1^2 + sigma2^2 - 2 * rho * sigma1 * sigma2), and w2 = 1 - w1.\n\nReturn [0.5, 0.5] if the denominator is zero.",
    starterCode: `def minimum_variance_weights(sigma1, sigma2, rho):
    # Your code here
    pass`,
    solution: `def minimum_variance_weights(sigma1, sigma2, rho):
    den = sigma1 * sigma1 + sigma2 * sigma2 - 2.0 * rho * sigma1 * sigma2
    if den == 0:
        return [0.5, 0.5]
    w1 = (sigma2 * sigma2 - rho * sigma1 * sigma2) / den
    return [w1, 1.0 - w1]`,
    testCases: [
      { input: [0.2, 0.3, 0.0], expected: [0.6923076923076923, 0.3076923076923077] },
      { input: [0.2, 0.3, 0.5], expected: [0.857142857142857, 0.14285714285714302] },
      { input: [0.2, 0.2, 1.0], expected: [0.5, 0.5] },
      { input: [0.1, 0.2, -0.5], expected: [0.7142857142857143, 0.2857142857142857] },
    ],
    hint: "Higher correlation pushes more weight into the less volatile asset.",
  },
  {
    id: "ts-126",
    title: "OU Half-Life",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Estimate the half-life of mean reversion for a process whose spread follows an AR(1) with coefficient phi: half_life = -ln(2) / ln(phi).\n\nReturn 0.0 when phi is not strictly between 0 and 1, since the spread either does not mean-revert or does not exist.",
    starterCode: `import math
def ou_half_life(phi):
    # Your code here
    pass`,
    solution: `import math
def ou_half_life(phi):
    if phi <= 0 or phi >= 1:
        return 0.0
    return -math.log(2.0) / math.log(phi)`,
    testCases: [
      { input: [0.9], expected: 6.578813478960585 },
      { input: [0.5], expected: 1.0 },
      { input: [0.99], expected: 68.96756393652842 },
      { input: [1.0], expected: 0.0 },
    ],
    hint: "The closer phi is to 1, the slower the reversion and the longer the half-life.",
  },
  {
    id: "ts-127",
    title: "Breakpoint Detection Binary Segmentation",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Find the best single changepoint by binary segmentation: for each split index i in 1..n-1 compute the total within-segment sum of squared deviations plus penalty, and return the i that minimizes this cost.\n\nReturn -1 if no split beats keeping the series whole by more than 1e-12, for example when the penalty is too large.",
    starterCode: `def binary_segmentation(series, penalty):
    # Your code here
    pass`,
    solution: `def binary_segmentation(series, penalty):
    n = len(series)
    if n < 2:
        return -1

    def cost(a):
        m = sum(a) / len(a)
        return sum((x - m) ** 2 for x in a)

    best = -1
    best_cost = cost(series)
    for i in range(1, n):
        c = cost(series[:i]) + cost(series[i:]) + penalty
        if c < best_cost - 1e-12:
            best_cost = c
            best = i
    return best`,
    testCases: [
      { input: [[0, 1, 0, 1, 10, 11, 10, 11], 1.0], expected: 4 },
      { input: [[-1, 0, 1, 2, 3], 10.0], expected: -1 },
      { input: [[1, 2, 3, 10, 11, 12], 0.5], expected: 3 },
      { input: [[5, 5, 5], 0.0], expected: -1 },
    ],
    hint: "Segment cost is the within-segment sum of squared deviations from the segment mean.",
  },
  {
    id: "ts-128",
    title: "Matrix Profile Lite",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Compute the lite matrix profile for a given window size: for each subsequence return the Euclidean distance to its nearest other subsequence (a lower value means a stronger motif).\n\nReturn an empty list if window is not positive or exceeds the series. A series with a single window returns [0.0].",
    starterCode: `def matrix_profile_lite(series, window):
    # Your code here
    pass`,
    solution: `def matrix_profile_lite(series, window):
    n = len(series)
    if window <= 0 or window > n:
        return []
    subs = [series[i:i + window] for i in range(n - window + 1)]
    out = []
    for i in range(len(subs)):
        best = None
        for j in range(len(subs)):
            if i == j:
                continue
            d = sum((a - b) ** 2 for a, b in zip(subs[i], subs[j])) ** 0.5
            if best is None or d < best:
                best = d
        out.append(0.0 if best is None else best)
    return out`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 2], expected: [1.4142135623730951, 1.4142135623730951, 1.4142135623730951, 1.4142135623730951] },
      { input: [[1, 2, 1, 2], 2], expected: [0.0, 1.4142135623730951, 0.0] },
      { input: [[5, 5, 5], 2], expected: [0.0, 0.0] },
      { input: [[1, 2, 3], 2], expected: [1.4142135623730951, 1.4142135623730951] },
    ],
    hint: "The matrix profile is the nearest-neighbor distance profile.",
  },
  {
    id: "ts-129",
    title: "DTW-1NN Classification",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Classify a query series with one-nearest-neighbor using dynamic time warping distance. Compute the minimum DTW distance from the query to every series in each class and return 0 or 1 for the closer class; class 0 wins ties.\n\nAn empty class has infinite distance. DTW uses absolute difference costs and the standard three-way recurrence.",
    starterCode: `def dtw_1nn_classify(train_class0, train_class1, query):
    # Your code here
    pass`,
    solution: `def dtw_1nn_classify(train_class0, train_class1, query):
    def dtw(x, y):
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
        return prev[m]

    def nearest(train):
        best = None
        for s in train:
            d = dtw(query, s)
            if best is None or d < best:
                best = d
        return float("inf") if best is None else best

    d0 = nearest(train_class0)
    d1 = nearest(train_class1)
    if d0 <= d1:
        return 0
    return 1`,
    testCases: [
      { input: [[[1, 2, 3], [2, 3, 4]], [[10, 11, 12]], [1, 2, 4]], expected: 0 },
      { input: [[[1, 2, 3], [2, 3, 4]], [[10, 11, 12]], [10, 11, 11]], expected: 1 },
      { input: [[[1, 1]], [[9, 9]], [5, 5]], expected: 0 },
      { input: [[[0, 0, 0]], [[100, 100, 100]], [100, 99, 101]], expected: 1 },
    ],
    hint: "DTW is a shape-aware distance, so scale differences still separate classes here.",
  },
  {
    id: "ts-130",
    title: "Rolling Max Drawdown",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Compute the rolling maximum drawdown with window size k: for each window, the largest peak-to-trough decline (peak - price) / peak seen in chronological order.\n\nReturn an empty list if k is not positive or exceeds the series. A window that only makes new highs produces 0.0.",
    starterCode: `def rolling_max_drawdown(prices, k):
    # Your code here
    pass`,
    solution: `def rolling_max_drawdown(prices, k):
    n = len(prices)
    if k <= 0 or k > n:
        return []
    out = []
    for i in range(n - k + 1):
        peak = None
        mdd = 0.0
        for p in prices[i:i + k]:
            if peak is None or p > peak:
                peak = p
            if peak != 0:
                dd = (peak - p) / peak
                if dd > mdd:
                    mdd = dd
        out.append(mdd)
    return out`,
    testCases: [
      { input: [[1, 2, 3], 3], expected: [0.0] },
      { input: [[3, 2, 1], 3], expected: [0.6666666666666666] },
      { input: [[1, 5, 2, 6], 3], expected: [0.6, 0.6] },
      { input: [[2, 1, 2, 1], 2], expected: [0.5, 0.0, 0.5] },
    ],
    hint: "Track the running peak inside each window, not the window maximum.",
  },
  {
    id: "ts-131",
    title: "PCA First Component Variance",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Compute the variance explained by the first principal component of a two-column data matrix, using the population covariance. For the 2x2 covariance matrix with entries a, b, b, c, return the largest eigenvalue: (a + c) / 2 + sqrt(((a - c) / 2)^2 + b^2).\n\nReturn 0.0 for an empty matrix. Each row of data is one observation of two series.",
    starterCode: `def pca_first_component_variance(data):
    # Your code here
    pass`,
    solution: `def pca_first_component_variance(data):
    n = len(data)
    if n == 0:
        return 0.0
    xs = [row[0] for row in data]
    ys = [row[1] for row in data]
    mx = sum(xs) / n
    my = sum(ys) / n
    a = sum((x - mx) ** 2 for x in xs) / n
    c = sum((y - my) ** 2 for y in ys) / n
    b = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / n
    disc = ((a - c) / 2.0) ** 2 + b * b
    return (a + c) / 2.0 + disc ** 0.5`,
    testCases: [
      { input: [[[1, 1], [2, 2], [3, 3]]], expected: 1.3333333333333333 },
      { input: [[[1, 2], [2, 4], [3, 6]]], expected: 3.333333333333333 },
      { input: [[[1, 0], [0, 1], [-1, 0], [0, -1]]], expected: 0.5 },
      { input: [[[2, 1], [4, 2], [6, 3]]], expected: 3.333333333333333 },
    ],
    hint: "The first PC variance is the largest eigenvalue of the covariance matrix.",
  },
  {
    id: "ts-132",
    title: "Maximum Sharpe Weights",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Compute tangency portfolio weights for two assets by mean-variance optimization: raw weights are the inverse covariance matrix times the excess expected returns, then normalized to sum to 1. Inputs are expected returns mu1 and mu2, volatilities sigma1 and sigma2, correlation rho, and risk-free rate rf.\n\nReturn [0.5, 0.5] when the covariance matrix is singular or the raw weights sum to zero.",
    starterCode: `def max_sharpe_weights(mu1, mu2, sigma1, sigma2, rho, rf):
    # Your code here
    pass`,
    solution: `def max_sharpe_weights(mu1, mu2, sigma1, sigma2, rho, rf):
    a = mu1 - rf
    b = mu2 - rf
    den = sigma1 * sigma1 * sigma2 * sigma2 * (1.0 - rho * rho)
    if den == 0:
        return [0.5, 0.5]
    w1 = (sigma2 * sigma2 * a - rho * sigma1 * sigma2 * b) / den
    w2 = (sigma1 * sigma1 * b - rho * sigma1 * sigma2 * a) / den
    total = w1 + w2
    if total == 0:
        return [0.5, 0.5]
    return [w1 / total, w2 / total]`,
    testCases: [
      { input: [0.1, 0.2, 0.2, 0.3, 0.0, 0.0], expected: [0.5294117647058822, 0.47058823529411775] },
      { input: [0.1, 0.1, 0.2, 0.3, 0.5, 0.0], expected: [0.857142857142857, 0.142857142857143] },
      { input: [0.05, 0.15, 0.2, 0.3, 0.0, 0.02], expected: [0.34177215189873417, 0.6582278481012659] },
      { input: [0.1, 0.2, 0.2, 0.3, 1.0, 0.0], expected: [0.5, 0.5] },
    ],
    hint: "The tangency portfolio maximizes the Sharpe ratio, not the raw return.",
  },
  {
    id: "ts-133",
    title: "Stop-Loss Simulation Return",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Simulate a long position with a stop loss: enter at prices[0] and exit at the first price at or below entry * (1 - stop_loss), or at the final price if the stop never triggers. Return exit / entry - 1.\n\nReturn 0.0 for empty prices, a non-positive stop loss, or a zero entry price.",
    starterCode: `def stop_loss_simulation_return(prices, stop_loss):
    # Your code here
    pass`,
    solution: `def stop_loss_simulation_return(prices, stop_loss):
    if not prices or stop_loss <= 0 or prices[0] == 0:
        return 0.0
    entry = prices[0]
    exit_price = prices[-1]
    for p in prices[1:]:
        if p <= entry * (1.0 - stop_loss):
            exit_price = p
            break
    return exit_price / entry - 1.0`,
    testCases: [
      { input: [[100, 95, 90, 80], 0.1], expected: -0.09999999999999998 },
      { input: [[100, 95, 105, 110], 0.1], expected: 0.10000000000000009 },
      { input: [[100, 90, 80], 0.05], expected: -0.09999999999999998 },
      { input: [[10, 10, 10], 0.2], expected: 0.0 },
    ],
    hint: "The stop triggers on the first bar whose price reaches the threshold.",
  },
  {
    id: "ts-134",
    title: "Hurst R/S Estimate",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Estimate the Hurst exponent with a single-scale rescaled range. Subtract the mean and form cumulative deviations; let R be max minus min of that path and S the population standard deviation. Return log(R / S) / log(n).\n\nReturn 0.0 if n < 2, S is 0, or R is not positive.",
    starterCode: `import math
def hurst_rs(series):
    # Your code here
    pass`,
    solution: `import math
def hurst_rs(series):
    n = len(series)
    if n < 2:
        return 0.0
    m = sum(series) / n
    dev = [x - m for x in series]
    cum = []
    total = 0.0
    for d in dev:
        total += d
        cum.append(total)
    r = max(cum) - min(cum)
    s = (sum(d * d for d in dev) / n) ** 0.5
    if s == 0 or r <= 0:
        return 0.0
    return math.log(r / s) / math.log(n)`,
    testCases: [
      { input: [[1, 2, 3, 4, 5]], expected: 0.46726791544928875 },
      { input: [[1, 2, 3, 4, 5, 6, 7, 8]], expected: 0.6012804295368734 },
      { input: [[5, 5, 5]], expected: 0.0 },
      { input: [[1, 5, 2, 4, 3]], expected: 0.2153382790366965 },
    ],
    hint: "H near 0.5 suggests a random walk; more persistent series score higher.",
  },
  {
    id: "ts-135",
    title: "Holiday Dummy Regression",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Fit a regression of returns on a holiday dummy with an intercept and return the dummy coefficient: sum((d - mean_d) * (r - mean_r)) / sum((d - mean_d)^2).\n\nReturn 0.0 if the lists are empty, differ in length, or the dummy has zero variance. The coefficient is the mean return difference between holiday and non-holiday periods.",
    starterCode: `def holiday_dummy_regression(returns, holiday_flags):
    # Your code here
    pass`,
    solution: `def holiday_dummy_regression(returns, holiday_flags):
    n = len(returns)
    if n == 0 or n != len(holiday_flags):
        return 0.0
    md = sum(holiday_flags) / n
    mr = sum(returns) / n
    den = sum((d - md) ** 2 for d in holiday_flags)
    if den == 0:
        return 0.0
    return sum((d - md) * (r - mr) for d, r in zip(holiday_flags, returns)) / den`,
    testCases: [
      { input: [[0.01, 0.02, 0.03, 0.04], [0, 1, 0, 1]], expected: 0.010000000000000002 },
      { input: [[0.05, 0.06], [1, 1]], expected: 0.0 },
      { input: [[0.01, 0.02, 0.03], [0, 0, 0]], expected: 0.0 },
      { input: [[0.02, -0.01, 0.04, 0.01], [1, 0, 1, 0]], expected: 0.030000000000000002 },
    ],
    hint: "With a balanced dummy this equals the difference of group means.",
  },
];
