import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "st-341",
    title: "OLS Slope Simple Regression",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "The ordinary least squares slope for one predictor is Sxy / Sxx summed over centered products and squares.\n\nGiven the predictor values and responses, return the slope.",
    starterCode: `def ols_slope_simple_regression(xs, ys):
    # Your code here
    pass`,
    solution: `def ols_slope_simple_regression(xs, ys):
    n = len(xs)
    mx = sum(xs) / n
    my = sum(ys) / n
    sxy = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
    sxx = sum((x - mx) ** 2 for x in xs)
    return sxy / sxx`,
    testCases: [
      { input: [[1, 2, 3], [2, 4, 6]], expected: 2.0 },
      { input: [[0, 1], [1, 0]], expected: -1.0 },
      { input: [[1, 2, 3, 4], [1, 3, 2, 5]], expected: 1.1 },
    ],
    hint: "Center both variables before forming the ratio.",
  },
  {
    id: "st-342",
    title: "OLS Intercept Simple Regression",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "The OLS intercept is mean(y) - slope * mean(x), which anchors the fitted line at the sample means.\n\nGiven the predictor values and responses, return the intercept.",
    starterCode: `def ols_intercept_simple_regression(xs, ys):
    # Your code here
    pass`,
    solution: `def ols_intercept_simple_regression(xs, ys):
    n = len(xs)
    mx = sum(xs) / n
    my = sum(ys) / n
    sxy = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
    sxx = sum((x - mx) ** 2 for x in xs)
    slope = sxy / sxx
    return my - slope * mx`,
    testCases: [
      { input: [[1, 2, 3], [2, 4, 6]], expected: 0.0 },
      { input: [[0, 1], [1, 0]], expected: 1.0 },
      { input: [[1, 2], [3, 5]], expected: 1.0 },
    ],
    hint: "Substitute the means into y = a + b x.",
  },
  {
    id: "st-343",
    title: "Prediction from OLS Fit",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "A fitted simple regression predicts y_hat = intercept + slope * x_new.\n\nGiven the slope, the intercept, and a new predictor value, return the prediction.",
    starterCode: `def prediction_from_ols_fit(slope, intercept, x_new):
    # Your code here
    pass`,
    solution: `def prediction_from_ols_fit(slope, intercept, x_new):
    return intercept + slope * x_new`,
    testCases: [
      { input: [2.0, 1.0, 3.0], expected: 7.0 },
      { input: [0.0, 5.0, 10.0], expected: 5.0 },
      { input: [-1.5, 2.0, 4.0], expected: -4.0 },
    ],
    hint: "Evaluate the fitted line at the new point.",
  },
  {
    id: "st-344",
    title: "Residual Sum of Squares from Slope",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "For simple regression, SSE = Syy - slope * Sxy, where Syy and Sxy are the centered sums.\n\nGiven Syy, Sxy, and the fitted slope, return SSE.",
    starterCode: `def residual_sum_of_squares_from_slope(syy, sxy, slope):
    # Your code here
    pass`,
    solution: `def residual_sum_of_squares_from_slope(syy, sxy, slope):
    return syy - slope * sxy`,
    testCases: [
      { input: [10.0, 5.0, 1.5], expected: 2.5 },
      { input: [4.0, 4.0, 1.0], expected: 0.0 },
      { input: [8.0, 0.0, 2.0], expected: 8.0 },
    ],
    hint: "The slope explains part of the total variation.",
  },
  {
    id: "st-345",
    title: "R Squared from Sums",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "The coefficient of determination is R^2 = 1 - SSE / TSS.\n\nGiven the residual sum of squares and the total sum of squares (TSS > 0), return R^2.",
    starterCode: `def r_squared_from_sums(sse, tss):
    # Your code here
    pass`,
    solution: `def r_squared_from_sums(sse, tss):
    return 1.0 - sse / tss`,
    testCases: [
      { input: [10.0, 100.0], expected: 0.9 },
      { input: [0.0, 50.0], expected: 1.0 },
      { input: [25.0, 25.0], expected: 0.0 },
    ],
    hint: "It is the fraction of variance not left in residuals.",
  },
  {
    id: "st-346",
    title: "Adjusted R Squared from R2",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Adjusted R^2 penalizes predictors: 1 - (1 - R^2) * (n - 1) / (n - p - 1).\n\nGiven R^2, the sample size n, and the number of predictors p, return the adjusted value.",
    starterCode: `def adjusted_r_squared_from_r2(r2, n, p):
    # Your code here
    pass`,
    solution: `def adjusted_r_squared_from_r2(r2, n, p):
    return 1.0 - (1.0 - r2) * (n - 1) / (n - p - 1)`,
    testCases: [
      { input: [0.9, 100, 1], expected: 0.8989795918367347 },
      { input: [0.5, 10, 3], expected: 0.25 },
      { input: [0.8, 50, 5], expected: 0.7772727272727273 },
    ],
    hint: "Use the residual degrees of freedom in the denominator.",
  },
  {
    id: "st-347",
    title: "Standard Error of the Slope",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "The standard error of the OLS slope is sqrt(MSE / Sxx) with MSE = SSE / (n - 2).\n\nGiven SSE, the sample size, and Sxx, return the standard error.",
    starterCode: `def standard_error_of_the_slope(sse, n, sxx):
    # Your code here
    pass`,
    solution: `def standard_error_of_the_slope(sse, n, sxx):
    mse = sse / (n - 2)
    return (mse / sxx) ** 0.5`,
    testCases: [
      { input: [10.0, 12, 20.0], expected: 0.22360679774997896 },
      { input: [5.0, 7, 5.0], expected: 0.4472135954999579 },
      { input: [0.0, 10, 4.0], expected: 0.0 },
    ],
    hint: "Divide the mean squared error by the predictor sum of squares.",
  },
  {
    id: "st-348",
    title: "Slope t Statistic",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "The t statistic for an OLS slope is the slope divided by its standard error.\n\nGiven the slope and its standard error, return the statistic.",
    starterCode: `def slope_t_statistic(slope, se):
    # Your code here
    pass`,
    solution: `def slope_t_statistic(slope, se):
    return slope / se`,
    testCases: [
      { input: [2.0, 0.5], expected: 4.0 },
      { input: [-1.0, 0.25], expected: -4.0 },
      { input: [0.0, 1.0], expected: 0.0 },
    ],
    hint: "It measures how many standard errors the slope is from zero.",
  },
  {
    id: "st-349",
    title: "Slope Confidence Interval",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "A symmetric confidence interval for a slope is [b - t * se, b + t * se], where t is the critical value for the desired level.\n\nGiven the slope, its standard error, and the critical value, return [lower, upper].",
    starterCode: `def slope_confidence_interval(slope, se, t_crit):
    # Your code here
    pass`,
    solution: `def slope_confidence_interval(slope, se, t_crit):
    half = t_crit * se
    return [slope - half, slope + half]`,
    testCases: [
      { input: [2.0, 0.5, 2.0], expected: [1.0, 3.0] },
      { input: [0.0, 1.0, 1.96], expected: [-1.96, 1.96] },
      { input: [-3.0, 0.1, 2.576], expected: [-3.2576, -2.7424] },
    ],
    hint: "Center the interval at the estimate.",
  },
  {
    id: "st-350",
    title: "RMSE from SSE",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "The root mean squared error is sqrt(SSE / n).\n\nGiven the residual sum of squares and the number of observations, return the RMSE.",
    starterCode: `def rmse_from_sse(sse, n):
    # Your code here
    pass`,
    solution: `def rmse_from_sse(sse, n):
    return (sse / n) ** 0.5`,
    testCases: [
      { input: [10.0, 10], expected: 1.0 },
      { input: [4.0, 1], expected: 2.0 },
      { input: [0.0, 5], expected: 0.0 },
    ],
    hint: "Take the square root after averaging the squared residuals.",
  },
  {
    id: "st-351",
    title: "MAE from Absolute Errors",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "The mean absolute error is the average of the absolute prediction errors.\n\nGiven the list of signed errors, return the mean absolute error.",
    starterCode: `def mae_from_absolute_errors(errors):
    # Your code here
    pass`,
    solution: `def mae_from_absolute_errors(errors):
    return sum(abs(e) for e in errors) / len(errors)`,
    testCases: [
      { input: [[1, -2, 3]], expected: 2.0 },
      { input: [[0, 0]], expected: 0.0 },
      { input: [[-1, -1, -1, -1]], expected: 1.0 },
    ],
    hint: "Take magnitudes before averaging.",
  },
  {
    id: "st-352",
    title: "MAPE Percentage Error",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "The mean absolute percentage error is 100 * mean(|actual - predicted| / |actual|).\n\nGiven the actual and predicted values (actuals nonzero), return the MAPE.",
    starterCode: `def mape_percentage_error(actuals, preds):
    # Your code here
    pass`,
    solution: `def mape_percentage_error(actuals, preds):
    return 100.0 * sum(abs(a - p) / abs(a) for a, p in zip(actuals, preds)) / len(actuals)`,
    testCases: [
      { input: [[100, 50], [110, 45]], expected: 10.0 },
      { input: [[10], [10]], expected: 0.0 },
      { input: [[2, 4], [1, 2]], expected: 50.0 },
    ],
    hint: "Divide each error by the actual value, then average.",
  },
  {
    id: "st-353",
    title: "Weighted Least Squares Slope Estimate",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "The weighted least squares slope is sum(w_i (x_i - xbar_w)(y_i - ybar_w)) / sum(w_i (x_i - xbar_w)^2), where the weighted means use the same weights.\n\nGiven the predictor values, responses, and weights, return the slope.",
    starterCode: `def weighted_least_squares_slope(xs, ys, weights):
    # Your code here
    pass`,
    solution: `def weighted_least_squares_slope(xs, ys, weights):
    wsum = sum(weights)
    mx = sum(w * x for w, x in zip(weights, xs)) / wsum
    my = sum(w * y for w, y in zip(weights, ys)) / wsum
    num = sum(w * (x - mx) * (y - my) for w, x, y in zip(weights, xs, ys))
    den = sum(w * (x - mx) ** 2 for w, x in zip(weights, xs))
    return num / den`,
    testCases: [
      { input: [[1, 2, 3], [2, 4, 6], [1, 1, 1]], expected: 2.0 },
      { input: [[0, 1, 2], [1, 1, 3], [1, 2, 1]], expected: 1.0 },
      { input: [[1, 2], [3, 5], [2, 3]], expected: 2.0 },
    ],
    hint: "Center both variables with weighted means before the ratio.",
  },
  {
    id: "st-354",
    title: "Leverage Value in Simple Regression",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "The leverage of observation x is h = 1/n + (x - xbar)^2 / Sxx.\n\nGiven the predictor values and a particular x value, return the leverage.",
    starterCode: `def leverage_in_simple_regression(xs, x_value):
    # Your code here
    pass`,
    solution: `def leverage_in_simple_regression(xs, x_value):
    n = len(xs)
    mean = sum(xs) / n
    sxx = sum((x - mean) ** 2 for x in xs)
    return 1.0 / n + (x_value - mean) ** 2 / sxx`,
    testCases: [
      { input: [[1, 2, 3], 2], expected: 0.3333333333333333 },
      { input: [[1, 2, 3], 3], expected: 0.8333333333333333 },
      { input: [[1, 2, 3], 1], expected: 0.8333333333333333 },
    ],
    hint: "Points far from the center of the predictor have higher leverage.",
  },
  {
    id: "st-355",
    title: "Cook's Distance One Point",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Cook's distance for a simple regression point is D = (r^2 / (p * MSE)) * h / (1 - h)^2 with p predictors including intercept = 2.\n\nGiven the residual r, the MSE, and the leverage h, return D.",
    starterCode: `def cooks_distance_one_point(residual, mse, leverage):
    # Your code here
    pass`,
    solution: `def cooks_distance_one_point(residual, mse, leverage):
    return (residual * residual / (2.0 * mse)) * leverage / ((1.0 - leverage) ** 2)`,
    testCases: [
      { input: [1.0, 1.0, 0.1], expected: 0.06172839506172839 },
      { input: [2.0, 4.0, 0.5], expected: 1.0 },
      { input: [0.0, 1.0, 0.2], expected: 0.0 },
    ],
    hint: "High leverage amplifies the influence of a residual.",
  },
  {
    id: "st-356",
    title: "Durbin Watson from Residuals",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "The Durbin-Watson statistic is sum of squared successive residual differences divided by the residual sum of squares.\n\nGiven the residual list in time order, return the statistic.",
    starterCode: `def durbin_watson_from_residuals(residuals):
    # Your code here
    pass`,
    solution: `def durbin_watson_from_residuals(residuals):
    num = sum((residuals[i] - residuals[i - 1]) ** 2 for i in range(1, len(residuals)))
    den = sum(r * r for r in residuals)
    return num / den`,
    testCases: [
      { input: [[1, -1, 1, -1]], expected: 3.0 },
      { input: [[0, 0, 1]], expected: 1.0 },
      { input: [[1, 0]], expected: 1.0 },
    ],
    hint: "Successive differences live in the numerator, squared residuals in the denominator.",
  },
  {
    id: "st-357",
    title: "Newey West Bartlett Factors",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "The Newey-West long-run variance factor is 1 + 2 * sum_{k=1}^{L} (1 - k / (L + 1)) * rho_k, where rho_k are sample autocorrelations and L the lag truncation.\n\nGiven the autocorrelation list (rho_1 upward) and L, return the factor.",
    starterCode: `def newey_west_bartlett_factors(autocorrelations, lags):
    # Your code here
    pass`,
    solution: `def newey_west_bartlett_factors(autocorrelations, lags):
    total = 1.0
    for k in range(1, lags + 1):
        total += 2.0 * (1.0 - k / (lags + 1.0)) * autocorrelations[k - 1]
    return total`,
    testCases: [
      { input: [[0.5], 1], expected: 1.5 },
      { input: [[0.5, 0.25], 2], expected: 1.8333333333333335 },
      { input: [[0.0, 0.0, 0.0], 3], expected: 1.0 },
    ],
    hint: "Bartlett weights decay linearly with the lag.",
  },
  {
    id: "st-358",
    title: "Standard Error of Fitted Mean",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "The standard error of the estimated mean response at x is s * sqrt(1/n + (x - xbar)^2 / Sxx).\n\nGiven the residual standard deviation s, the sample size, the value x, xbar, and Sxx, return the standard error.",
    starterCode: `def standard_error_of_fitted_mean(s, n, x, xbar, sxx):
    # Your code here
    pass`,
    solution: `def standard_error_of_fitted_mean(s, n, x, xbar, sxx):
    return s * (1.0 / n + (x - xbar) ** 2 / sxx) ** 0.5`,
    testCases: [
      { input: [1.0, 10, 5, 5, 10], expected: 0.31622776601683794 },
      { input: [2.0, 20, 8, 5, 16], expected: 1.5652475842498528 },
      { input: [0.5, 5, 1, 1, 4], expected: 0.22360679774997896 },
    ],
    hint: "The uncertainty grows as the query point moves from the center.",
  },
  {
    id: "st-359",
    title: "Wald Interval Proportion",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "The Wald confidence interval for a proportion is p_hat +/- z * sqrt(p_hat (1 - p_hat) / n).\n\nGiven p_hat, the sample size, and the critical z, return [lower, upper].",
    starterCode: `def wald_interval_proportion(p_hat, n, z):
    # Your code here
    pass`,
    solution: `def wald_interval_proportion(p_hat, n, z):
    half = z * (p_hat * (1.0 - p_hat) / n) ** 0.5
    return [p_hat - half, p_hat + half]`,
    testCases: [
      { input: [0.5, 100, 1.96], expected: [0.402, 0.598] },
      { input: [0.9, 50, 1.645], expected: [0.8302085606968878, 0.9697914393031123] },
      { input: [0.0, 10, 1.96], expected: [0.0, 0.0] },
    ],
    hint: "Center the interval on the sample proportion.",
  },
  {
    id: "st-360",
    title: "Margin of Error Proportion",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "The margin of error for a proportion is z * sqrt(p_hat (1 - p_hat) / n).\n\nGiven the sample proportion, sample size, and critical z, return the margin.",
    starterCode: `def margin_of_error_proportion(p_hat, n, z):
    # Your code here
    pass`,
    solution: `def margin_of_error_proportion(p_hat, n, z):
    return z * (p_hat * (1.0 - p_hat) / n) ** 0.5`,
    testCases: [
      { input: [0.5, 400, 1.96], expected: 0.049 },
      { input: [0.2, 100, 2.576], expected: 0.10304 },
      { input: [0.75, 1000, 1.645], expected: 0.022525090177399957 },
    ],
    hint: "It is half the Wald interval width.",
  },
];
