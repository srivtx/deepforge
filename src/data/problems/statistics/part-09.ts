import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "st-321",
    title: "Geometric Mean of Growth Factors",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "For a sequence of growth factors g_i (for example 1.1 for ten percent growth), the compound average factor is the geometric mean (product_i g_i)^(1/n).\n\nGiven the growth factors, return the geometric mean.",
    starterCode: `def geometric_mean_of_growth_factors(factors):
    # Your code here
    pass`,
    solution: `def geometric_mean_of_growth_factors(factors):
    product = 1.0
    for g in factors:
        product *= g
    return product ** (1.0 / len(factors))`,
    testCases: [
      { input: [[1.1, 1.2]], expected: 1.1489125293076057 },
      { input: [[1.0, 1.0, 1.0]], expected: 1.0 },
      { input: [[2.0, 8.0]], expected: 4.0 },
    ],
    hint: "Multiply all factors together and take the n-th root.",
  },
  {
    id: "st-322",
    title: "Harmonic Mean of Rates",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "For rates that combine as reciprocals, such as speeds, the harmonic mean is n / sum_i (1 / x_i).\n\nGiven the rate list, return the harmonic mean.",
    starterCode: `def harmonic_mean_of_rates(rates):
    # Your code here
    pass`,
    solution: `def harmonic_mean_of_rates(rates):
    return len(rates) / sum(1.0 / r for r in rates)`,
    testCases: [
      { input: [[1, 2]], expected: 1.3333333333333333 },
      { input: [[2, 4, 8]], expected: 3.4285714285714284 },
      { input: [[10, 10]], expected: 10.0 },
    ],
    hint: "Invert, average, and invert again.",
  },
  {
    id: "st-323",
    title: "Weighted Harmonic Mean",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "The weighted harmonic mean is sum(w_i) / sum(w_i / x_i).\n\nGiven the values and their positive weights, return the weighted harmonic mean.",
    starterCode: `def weighted_harmonic_mean(values, weights):
    # Your code here
    pass`,
    solution: `def weighted_harmonic_mean(values, weights):
    return sum(weights) / sum(w / v for v, w in zip(values, weights))`,
    testCases: [
      { input: [[1, 2], [1, 1]], expected: 1.3333333333333333 },
      { input: [[2, 4], [3, 1]], expected: 2.2857142857142856 },
      { input: [[5, 10, 20], [1, 2, 1]], expected: 8.88888888888889 },
    ],
    hint: "Weights multiply the reciprocal contributions.",
  },
  {
    id: "st-324",
    title: "Root Mean Square Value",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "The root mean square is sqrt(mean(x_i^2)), which penalizes large deviations more than the arithmetic mean.\n\nGiven the values, return the root mean square.",
    starterCode: `def root_mean_square_value(values):
    # Your code here
    pass`,
    solution: `def root_mean_square_value(values):
    return (sum(v * v for v in values) / len(values)) ** 0.5`,
    testCases: [
      { input: [[1, 2, 3]], expected: 2.160246899469287 },
      { input: [[0, 0]], expected: 0.0 },
      { input: [[3, 4]], expected: 3.5355339059327378 },
    ],
    hint: "Average the squares before taking the square root.",
  },
  {
    id: "st-325",
    title: "Coefficient of Quartile Variation",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "The coefficient of quartile variation is 100 * (Q3 - Q1) / (Q3 + Q1).\n\nGiven the first and third quartiles, return the coefficient.",
    starterCode: `def coefficient_of_quartile_variation(q1, q3):
    # Your code here
    pass`,
    solution: `def coefficient_of_quartile_variation(q1, q3):
    return 100.0 * (q3 - q1) / (q3 + q1)`,
    testCases: [
      { input: [1, 3], expected: 50.0 },
      { input: [10, 20], expected: 33.333333333333336 },
      { input: [0, 5], expected: 100.0 },
    ],
    hint: "It measures spread relative to the interquartile center.",
  },
  {
    id: "st-326",
    title: "Mean Absolute Deviation from Median",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "The median absolute deviation about the median is mean_i |x_i - median(x)|, which is less sensitive to outliers than the mean absolute deviation about the mean.\n\nGiven the values, return this quantity.",
    starterCode: `def mean_absolute_deviation_from_median(values):
    # Your code here
    pass`,
    solution: `def mean_absolute_deviation_from_median(values):
    ordered = sorted(values)
    n = len(ordered)
    if n % 2 == 1:
        median = ordered[n // 2]
    else:
        median = 0.5 * (ordered[n // 2 - 1] + ordered[n // 2])
    return sum(abs(v - median) for v in values) / n`,
    testCases: [
      { input: [[1, 2, 3, 4]], expected: 1.0 },
      { input: [[1, 1, 1]], expected: 0.0 },
      { input: [[0, 10]], expected: 5.0 },
    ],
    hint: "Find the median first, then average absolute deviations from it.",
  },
  {
    id: "st-327",
    title: "Sheppard Correction for Binned Variance",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "When data are grouped into bins of width h, the within-bin grouping inflates the variance by about h^2 / 12; the corrected variance subtracts that term.\n\nGiven the binned variance and the bin width, return the Sheppard-corrected variance (floored at zero).",
    starterCode: `def sheppard_correction_for_binned_variance(binned_variance, bin_width):
    # Your code here
    pass`,
    solution: `def sheppard_correction_for_binned_variance(binned_variance, bin_width):
    corrected = binned_variance - bin_width * bin_width / 12.0
    return corrected if corrected > 0 else 0.0`,
    testCases: [
      { input: [2.0, 1.0], expected: 1.9166666666666667 },
      { input: [0.1, 1.0], expected: 0.016666666666666677 },
      { input: [0.084, 0.5], expected: 0.06316666666666668 },
    ],
    hint: "Subtract h^2 / 12 and do not allow negative values.",
  },
  {
    id: "st-328",
    title: "Midrange Value",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "The midrange is the average of the minimum and maximum: (min + max) / 2.\n\nGiven the values, return the midrange.",
    starterCode: `def midrange_value(values):
    # Your code here
    pass`,
    solution: `def midrange_value(values):
    return 0.5 * (min(values) + max(values))`,
    testCases: [
      { input: [[1, 5]], expected: 3.0 },
      { input: [[-2, 2]], expected: 0.0 },
      { input: [[3, 3, 3]], expected: 3.0 },
    ],
    hint: "Only the two extremes matter.",
  },
  {
    id: "st-329",
    title: "Trimmed Count Each Side",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "A symmetric trimmed mean discards floor(proportion * n) observations from each tail.\n\nGiven the sample size n and the trim proportion in [0, 0.5), return the number of observations removed from each side.",
    starterCode: `def trimmed_count_each_side(n, proportion):
    # Your code here
    pass`,
    solution: `def trimmed_count_each_side(n, proportion):
    return int(proportion * n)`,
    testCases: [
      { input: [10, 0.1], expected: 1 },
      { input: [20, 0.25], expected: 5 },
      { input: [7, 0.2], expected: 1 },
    ],
    hint: "Round down to keep the same count on both sides.",
  },
  {
    id: "st-330",
    title: "Interdecile Range",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "The interdecile range is P90 - P10. Use linear interpolation on the sorted values with position (n - 1) * p.\n\nGiven the values, return the interdecile range.",
    starterCode: `def interdecile_range(values):
    # Your code here
    pass`,
    solution: `def interdecile_range(values):
    ordered = sorted(values)
    n = len(ordered)
    def percentile(p):
        pos = (n - 1) * p
        lo = int(pos)
        hi = min(lo + 1, n - 1)
        frac = pos - lo
        return ordered[lo] * (1.0 - frac) + ordered[hi] * frac
    return percentile(0.9) - percentile(0.1)`,
    testCases: [
      { input: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]], expected: 7.199999999999999 },
      { input: [[0, 0, 0]], expected: 0.0 },
      { input: [[1, 100]], expected: 79.19999999999999 },
    ],
    hint: "Percentiles interpolate between neighboring order statistics.",
  },
  {
    id: "st-331",
    title: "Bowley Skewness Coefficient",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Bowley skewness uses quartiles: (Q3 + Q1 - 2 Q2) / (Q3 - Q1), which is bounded in [-1, 1] and robust to outliers.\n\nGiven Q1, the median Q2, and Q3, return the coefficient. Assume Q3 > Q1.",
    starterCode: `def bowley_skewness_coefficient(q1, q2, q3):
    # Your code here
    pass`,
    solution: `def bowley_skewness_coefficient(q1, q2, q3):
    return (q3 + q1 - 2.0 * q2) / (q3 - q1)`,
    testCases: [
      { input: [1, 2, 6], expected: 0.6 },
      { input: [1, 3, 5], expected: 0.0 },
      { input: [10, 10, 20], expected: 1.0 },
    ],
    hint: "A positive value means the upper half stretches further from the median.",
  },
  {
    id: "st-332",
    title: "Pearson Second Skewness Coefficient",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "The second Pearson skewness coefficient is 3 * (mean - median) / standard deviation.\n\nGiven the mean, median, and standard deviation, return the coefficient. Assume the standard deviation is positive.",
    starterCode: `def pearson_second_skewness_coefficient(mean, median, std):
    # Your code here
    pass`,
    solution: `def pearson_second_skewness_coefficient(mean, median, std):
    return 3.0 * (mean - median) / std`,
    testCases: [
      { input: [5, 4, 2], expected: 1.5 },
      { input: [0, 0, 1], expected: 0.0 },
      { input: [10, 8, 4], expected: 1.5 },
    ],
    hint: "A mean above the median indicates a right tail.",
  },
  {
    id: "st-333",
    title: "Kelly Skewness Coefficient",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Kelly skewness compares deciles: (P90 + P10 - 2 P50) / (P90 - P10).\n\nGiven the three deciles with P90 > P10, return the coefficient.",
    starterCode: `def kelly_skewness_coefficient(p10, p50, p90):
    # Your code here
    pass`,
    solution: `def kelly_skewness_coefficient(p10, p50, p90):
    return (p90 + p10 - 2.0 * p50) / (p90 - p10)`,
    testCases: [
      { input: [1, 2, 10], expected: 0.7777777777777778 },
      { input: [1, 5, 9], expected: 0.0 },
      { input: [0, 0, 4], expected: 1.0 },
    ],
    hint: "It is Bowley skewness with deciles instead of quartiles.",
  },
  {
    id: "st-334",
    title: "Scaled Median Absolute Deviation",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "For normal data the median absolute deviation needs a consistency factor of about 1.4826 to estimate the standard deviation: sigma_hat = 1.4826 * MAD.\n\nGiven the MAD value, return the scaled estimate.",
    starterCode: `def scaled_median_absolute_deviation(mad):
    # Your code here
    pass`,
    solution: `def scaled_median_absolute_deviation(mad):
    return 1.4826 * mad`,
    testCases: [
      { input: [1.0], expected: 1.4826 },
      { input: [0.5], expected: 0.7413 },
      { input: [2.0], expected: 2.9652 },
    ],
    hint: "Multiply by the normal consistency constant.",
  },
  {
    id: "st-335",
    title: "Standard Error of Skewness",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "The standard error of the sample skewness is sqrt(6 n (n - 1) / ((n - 2)(n + 1)(n + 3))).\n\nGiven the sample size n >= 3, return the standard error.",
    starterCode: `def standard_error_of_skewness(n):
    # Your code here
    pass`,
    solution: `def standard_error_of_skewness(n):
    return (6.0 * n * (n - 1) / ((n - 2) * (n + 1) * (n + 3))) ** 0.5`,
    testCases: [
      { input: [10], expected: 0.6870429186215167 },
      { input: [50], expected: 0.33660070854935886 },
      { input: [3], expected: 1.224744871391589 },
    ],
    hint: "The denominator uses three shifted factors of n.",
  },
  {
    id: "st-336",
    title: "Standard Error of Kurtosis",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "The standard error of the sample excess kurtosis is 2 * SE_skew * sqrt((n^2 - 1) / ((n - 3)(n + 5))) with SE_skew = sqrt(6n(n-1)/((n-2)(n+1)(n+3))).\n\nGiven the sample size n > 3, return the standard error.",
    starterCode: `def standard_error_of_kurtosis(n):
    # Your code here
    pass`,
    solution: `def standard_error_of_kurtosis(n):
    se_skew = (6.0 * n * (n - 1) / ((n - 2) * (n + 1) * (n + 3))) ** 0.5
    return 2.0 * se_skew * ((n * n - 1.0) / ((n - 3) * (n + 5))) ** 0.5`,
    testCases: [
      { input: [10], expected: 1.334248769989982 },
      { input: [100], expected: 0.47833113299481334 },
      { input: [4], expected: 2.618614682831909 },
    ],
    hint: "Build it from the skewness standard error first.",
  },
  {
    id: "st-337",
    title: "Range Rule of Thumb Sigma",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "The range rule of thumb estimates the standard deviation as (max - min) / 4 for roughly bell-shaped data.\n\nGiven the sample values, return the estimate.",
    starterCode: `def range_rule_of_thumb_sigma(values):
    # Your code here
    pass`,
    solution: `def range_rule_of_thumb_sigma(values):
    return (max(values) - min(values)) / 4.0`,
    testCases: [
      { input: [[10, 20]], expected: 2.5 },
      { input: [[-4, 4]], expected: 2.0 },
      { input: [[5, 5, 5]], expected: 0.0 },
    ],
    hint: "Divide the range by four.",
  },
  {
    id: "st-338",
    title: "Pooled Standard Deviation Two Groups",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "The pooled standard deviation is sqrt(((n1 - 1) s1^2 + (n2 - 1) s2^2) / (n1 + n2 - 2)).\n\nGiven the two sample sizes and sample standard deviations, return the pooled standard deviation.",
    starterCode: `def pooled_standard_deviation_two_groups(n1, s1, n2, s2):
    # Your code here
    pass`,
    solution: `def pooled_standard_deviation_two_groups(n1, s1, n2, s2):
    return (((n1 - 1) * s1 * s1 + (n2 - 1) * s2 * s2) / (n1 + n2 - 2)) ** 0.5`,
    testCases: [
      { input: [10, 2.0, 15, 3.0], expected: 2.6539552107881486 },
      { input: [5, 1.0, 5, 1.0], expected: 1.0 },
      { input: [20, 4.0, 10, 2.0], expected: 3.484660262185848 },
    ],
    hint: "Weight each variance by its degrees of freedom.",
  },
  {
    id: "st-339",
    title: "Cochran C Statistic",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Cochran's C tests homogeneity of variance by dividing the largest group variance by the sum of variances.\n\nGiven the list of group variances, return the C statistic.",
    starterCode: `def cochran_c_statistic(variances):
    # Your code here
    pass`,
    solution: `def cochran_c_statistic(variances):
    return max(variances) / sum(variances)`,
    testCases: [
      { input: [[1, 1, 1]], expected: 0.3333333333333333 },
      { input: [[4, 1, 1]], expected: 0.6666666666666666 },
      { input: [[2, 3, 5]], expected: 0.5 },
    ],
    hint: "The maximum variance is compared against the total.",
  },
  {
    id: "st-340",
    title: "Coefficient of Variation Ratio",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "The relative variability of two groups is compared by the ratio of their coefficients of variation: (s1 / mean1) / (s2 / mean2).\n\nGiven each group's mean and standard deviation, return the ratio. Assume positive means and standard deviations.",
    starterCode: `def coefficient_of_variation_ratio(mean1, std1, mean2, std2):
    # Your code here
    pass`,
    solution: `def coefficient_of_variation_ratio(mean1, std1, mean2, std2):
    return (std1 / mean1) / (std2 / mean2)`,
    testCases: [
      { input: [10, 2, 20, 6], expected: 0.6666666666666667 },
      { input: [5, 1, 5, 1], expected: 1.0 },
      { input: [100, 10, 10, 5], expected: 0.2 },
    ],
    hint: "Each CV is the standard deviation divided by its mean.",
  },
];
