import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "st-006",
    title: "Median",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the median of data. For odd n it is the middle value of the sorted data; for even n it is the average of the two middle values. Return 0.0 for an empty list.",
    starterCode: `def median(data):
    # Your code here
    pass`,
    solution: `def median(data):
    if not data:
        return 0.0
    s = sorted(data)
    n = len(s)
    mid = n // 2
    if n % 2 == 1:
        return float(s[mid])
    return (s[mid - 1] + s[mid]) / 2.0`,
    testCases: [
      { input: [[1, 3, 2]], expected: 2.0 },
      { input: [[1, 2, 3, 4]], expected: 2.5 },
      { input: [[5]], expected: 5.0 },
      { input: [[7, 1, 3, 3]], expected: 3.0 },
      { input: [[]], expected: 0.0 },
    ],
    hint: "Sort first, then branch on the parity of the length.",
  },
  {
    id: "st-007",
    title: "Mode",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the most frequent value in data. On ties, return the smallest of the tied values. Return None for an empty list.",
    starterCode: `def mode(data):
    # Your code here
    pass`,
    solution: `def mode(data):
    if not data:
        return None
    counts = {}
    for x in data:
        counts[x] = counts.get(x, 0) + 1
    best = max(counts.values())
    return min(k for k in counts if counts[k] == best)`,
    testCases: [
      { input: [[1, 2, 2, 3]], expected: 2 },
      { input: [[4, 4, 2, 2, 1]], expected: 2 },
      { input: [[3, 1, 3, 2, 3]], expected: 3 },
      { input: [[7]], expected: 7 },
      { input: [[-1, -1, 2]], expected: -1 },
    ],
    hint: "Count occurrences with a dictionary, then take the smallest key with the maximum count.",
  },
  {
    id: "st-008",
    title: "Geometric Mean",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the geometric mean of positive values: exp(mean(ln(x))). Return 0.0 if data is empty or contains a non-positive value.",
    starterCode: `import math
def geometric_mean(data):
    # Your code here
    pass`,
    solution: `import math
def geometric_mean(data):
    if not data:
        return 0.0
    if any(x <= 0 for x in data):
        return 0.0
    total = sum(math.log(x) for x in data)
    return math.exp(total / len(data))`,
    testCases: [
      { input: [[1, 4, 16]], expected: 4.0 },
      { input: [[2, 8]], expected: 4.0 },
      { input: [[5]], expected: 4.999999999999999 },
      { input: [[1, 2, 4, 8]], expected: 2.82842712474619 },
      { input: [[0, 1]], expected: 0.0 },
    ],
    hint: "Take logs, average them, then exponentiate.",
  },
  {
    id: "st-009",
    title: "Harmonic Mean",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the harmonic mean n / sum(1/x). Return 0.0 if data is empty, contains a zero, or the reciprocal sum is zero.",
    starterCode: `def harmonic_mean(data):
    # Your code here
    pass`,
    solution: `def harmonic_mean(data):
    if not data:
        return 0.0
    if any(x == 0 for x in data):
        return 0.0
    denom = sum(1.0 / x for x in data)
    if denom == 0:
        return 0.0
    return len(data) / denom`,
    testCases: [
      { input: [[1, 2, 4]], expected: 1.7142857142857142 },
      { input: [[2, 6]], expected: 3.0 },
      { input: [[10]], expected: 10.0 },
      { input: [[1, 0, 3]], expected: 0.0 },
      { input: [[4, 4, 4]], expected: 4.0 },
    ],
    hint: "Sum the reciprocals first, then divide the count by that sum.",
  },
  {
    id: "st-010",
    title: "Weighted Mean",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return sum(w * x) / sum(w) for paired values and weights. Return 0.0 if values is empty or the total weight is zero. Pairs are zipped, so extra unmatched elements are ignored.",
    starterCode: `def weighted_mean(values, weights):
    # Your code here
    pass`,
    solution: `def weighted_mean(values, weights):
    if not values:
        return 0.0
    total = sum(weights)
    if total == 0:
        return 0.0
    return sum(w * v for v, w in zip(values, weights)) / total`,
    testCases: [
      { input: [[1, 2, 3], [1, 1, 1]], expected: 2.0 },
      { input: [[80, 90], [0.25, 0.75]], expected: 87.5 },
      { input: [[2, 4, 6], [3, 0, 1]], expected: 3.0 },
      { input: [[10], [0]], expected: 0.0 },
      { input: [[5, 5], [2, 2]], expected: 5.0 },
    ],
    hint: "Accumulate the weighted sum and the weight total in one pass.",
  },
  {
    id: "st-011",
    title: "Range",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return max(data) - min(data), the simplest measure of spread. Return 0.0 for an empty list.",
    starterCode: `def value_range(data):
    # Your code here
    pass`,
    solution: `def value_range(data):
    if not data:
        return 0.0
    return max(data) - min(data)`,
    testCases: [
      { input: [[4, 1, 9, 2]], expected: 8 },
      { input: [[5]], expected: 0 },
      { input: [[]], expected: 0.0 },
      { input: [[-3, 7]], expected: 10 },
      { input: [[2, 2, 2]], expected: 0 },
    ],
    hint: "Two built-ins and a subtraction.",
  },
  {
    id: "st-012",
    title: "Cumulative Sum",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the running totals of data as a list, so element i is the sum of data[0] through data[i]. Return an empty list for empty input.",
    starterCode: `def cumulative_sum(data):
    # Your code here
    pass`,
    solution: `def cumulative_sum(data):
    out = []
    total = 0
    for x in data:
        total += x
        out.append(total)
    return out`,
    testCases: [
      { input: [[1, 2, 3]], expected: [1, 3, 6] },
      { input: [[]], expected: [] },
      { input: [[5, -2, 0]], expected: [5, 3, 3] },
      { input: [[1.5, 2.5]], expected: [1.5, 4.0] },
      { input: [[-1, -2, -3]], expected: [-1, -3, -6] },
    ],
    hint: "Keep a running total and append after each addition.",
  },
  {
    id: "st-013",
    title: "Difference Series",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the consecutive differences data[i] - data[i-1] for i from 1 to n-1, so the result has length n-1. Return an empty list if data has fewer than two elements.",
    starterCode: `def differences(data):
    # Your code here
    pass`,
    solution: `def differences(data):
    return [data[i] - data[i - 1] for i in range(1, len(data))]`,
    testCases: [
      { input: [[1, 3, 6, 10]], expected: [2, 3, 4] },
      { input: [[5]], expected: [] },
      { input: [[4, 2, 2]], expected: [-2, 0] },
      { input: [[1.0, 2.5, 2.0]], expected: [1.5, -0.5] },
      { input: [[0, 0, 0]], expected: [0, 0] },
    ],
    hint: "Pair each element with the previous one and subtract.",
  },
  {
    id: "st-014",
    title: "Histogram Bin Counts",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Bin data into n_bins equal-width bins starting at lo, each of width width: bin i covers [lo + i*width, lo + (i+1)*width). Values outside [lo, lo + width*n_bins] are ignored and the right edge of the last bin is included. Return the list of counts.",
    starterCode: `def histogram_counts(data, lo, width, n_bins):
    # Your code here
    pass`,
    solution: `def histogram_counts(data, lo, width, n_bins):
    counts = [0] * max(n_bins, 0)
    if width <= 0 or n_bins <= 0:
        return counts
    hi = lo + width * n_bins
    for x in data:
        if x < lo or x > hi:
            continue
        if x == hi:
            counts[n_bins - 1] += 1
            continue
        idx = int((x - lo) // width)
        if 0 <= idx < n_bins:
            counts[idx] += 1
    return counts`,
    testCases: [
      { input: [[0, 1, 2, 3, 4], 0, 1, 2], expected: [1, 2] },
      { input: [[1, 1.5, 2.5, 5], 1, 1, 4], expected: [2, 1, 0, 1] },
      { input: [[], 0, 5, 2], expected: [0, 0] },
      { input: [[10], 0, 5, 2], expected: [0, 1] },
      { input: [[0.5, 1.5, 2.5, 3.5], 0.5, 1, 3], expected: [1, 1, 2] },
    ],
    hint: "The bin index is floor((x - lo) / width); special-case the right edge.",
  },
  {
    id: "st-015",
    title: "Empirical CDF at Point",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the fraction of values in data that are less than or equal to x. Return 0.0 for empty data.",
    starterCode: `def ecdf(data, x):
    # Your code here
    pass`,
    solution: `def ecdf(data, x):
    if not data:
        return 0.0
    return sum(1 for v in data if v <= x) / len(data)`,
    testCases: [
      { input: [[1, 2, 3, 4], 2.5], expected: 0.5 },
      { input: [[1, 2, 3, 4], 4], expected: 1.0 },
      { input: [[1, 2, 3, 4], 0], expected: 0.0 },
      { input: [[5, 5, 5], 5], expected: 1.0 },
      { input: [[], 1], expected: 0.0 },
    ],
    hint: "Count values <= x and divide by n.",
  },
  {
    id: "st-016",
    title: "Median Absolute Deviation",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the median absolute deviation: the median of |x - median(data)|, unscaled. Return 0.0 for empty input.",
    starterCode: `def median_absolute_deviation(data):
    # Your code here
    pass`,
    solution: `def median_absolute_deviation(data):
    if not data:
        return 0.0
    s = sorted(data)
    n = len(s)
    mid = n // 2
    if n % 2:
        med = float(s[mid])
    else:
        med = (s[mid - 1] + s[mid]) / 2.0
    devs = sorted(abs(v - med) for v in data)
    if n % 2:
        return float(devs[mid])
    return (devs[mid - 1] + devs[mid]) / 2.0`,
    testCases: [
      { input: [[1, 2, 3, 4, 5]], expected: 1.0 },
      { input: [[1, 1, 2, 2, 4, 6, 9]], expected: 1.0 },
      { input: [[1, 2, 3, 4]], expected: 1.0 },
      { input: [[5]], expected: 0.0 },
      { input: [[]], expected: 0.0 },
    ],
    hint: "Compute the median first, then take the median of the absolute deviations.",
  },
  {
    id: "st-017",
    title: "Interquartile Range",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the interquartile range Q3 - Q1 using the exclusive method: sort the data, split it into lower and upper halves, and exclude the median from both halves when n is odd. Requires at least two values, otherwise return 0.0.",
    starterCode: `def interquartile_range(data):
    # Your code here
    pass`,
    solution: `def interquartile_range(data):
    n = len(data)
    if n < 2:
        return 0.0
    s = sorted(data)
    half = n // 2
    lower = s[:half]
    upper = s[n - half:]
    return median_sorted(upper) - median_sorted(lower)

def median_sorted(s):
    n = len(s)
    if n == 0:
        return 0.0
    mid = n // 2
    if n % 2:
        return float(s[mid])
    return (s[mid - 1] + s[mid]) / 2.0`,
    testCases: [
      { input: [[1, 2, 3, 4, 5]], expected: 3.0 },
      { input: [[1, 2, 3, 4]], expected: 2.0 },
      { input: [[7]], expected: 0.0 },
      { input: [[1, 1, 2, 3, 5, 8]], expected: 4.0 },
      { input: [[]], expected: 0.0 },
    ],
    hint: "Q3 minus Q1, using the median of each half.",
  },
  {
    id: "st-018",
    title: "Z-Score",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the z-score (x - mean) / std where std is the population standard deviation. Return 0.0 if data is empty or the standard deviation is zero.",
    starterCode: `def zscore(data, x):
    # Your code here
    pass`,
    solution: `def zscore(data, x):
    n = len(data)
    if n == 0:
        return 0.0
    m = sum(data) / n
    var = sum((v - m) ** 2 for v in data) / n
    if var == 0:
        return 0.0
    return (x - m) / (var ** 0.5)`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 5], expected: 1.414213562373095 },
      { input: [[1, 2, 3], 2], expected: 0.0 },
      { input: [[10], 10], expected: 0.0 },
      { input: [[2, 4, 4, 4, 5, 5, 7, 9], 7], expected: 1.0 },
      { input: [[], 1], expected: 0.0 },
    ],
    hint: "Population variance divides by n.",
  },
  {
    id: "st-019",
    title: "Standard Error of the Mean",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the standard error s / sqrt(n), where s is the sample standard deviation with denominator n - 1. Return 0.0 when n < 2 or the sample variance is zero.",
    starterCode: `def standard_error(data):
    # Your code here
    pass`,
    solution: `def standard_error(data):
    n = len(data)
    if n < 2:
        return 0.0
    m = sum(data) / n
    s2 = sum((v - m) ** 2 for v in data) / (n - 1)
    if s2 <= 0:
        return 0.0
    return (s2 ** 0.5) / (n ** 0.5)`,
    testCases: [
      { input: [[1, 2, 3, 4, 5]], expected: 0.7071067811865476 },
      { input: [[2, 4, 4, 4, 5, 5, 7, 9]], expected: 0.7559289460184544 },
      { input: [[5]], expected: 0.0 },
      { input: [[]], expected: 0.0 },
      { input: [[1, 3]], expected: 1.0 },
    ],
    hint: "Sample variance uses n - 1, then divide its square root by sqrt(n).",
  },
  {
    id: "st-020",
    title: "Coefficient of Variation",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the coefficient of variation: the sample standard deviation divided by the absolute value of the mean. Return 0.0 when n < 2 or the mean is zero.",
    starterCode: `def coefficient_of_variation(data):
    # Your code here
    pass`,
    solution: `def coefficient_of_variation(data):
    n = len(data)
    if n < 2:
        return 0.0
    m = sum(data) / n
    if m == 0:
        return 0.0
    s2 = sum((v - m) ** 2 for v in data) / (n - 1)
    return (s2 ** 0.5) / abs(m)`,
    testCases: [
      { input: [[2, 4, 4, 4, 5, 5, 7, 9]], expected: 0.427617987059879 },
      { input: [[10, 20, 30]], expected: 0.5 },
      { input: [[5, 5, 5]], expected: 0.0 },
      { input: [[-2, -4]], expected: 0.47140452079103173 },
      { input: [[0, 0]], expected: 0.0 },
    ],
    hint: "Compute the sample standard deviation, then divide by abs(mean).",
  },
  {
    id: "st-021",
    title: "F1 Score from Counts",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the F1 score from true positives tp, false positives fp, and false negatives fn: 2*tp / (2*tp + fp + fn). Return 0.0 when the denominator is zero.",
    starterCode: `def f1_score(tp, fp, fn):
    # Your code here
    pass`,
    solution: `def f1_score(tp, fp, fn):
    denom = 2 * tp + fp + fn
    if denom == 0:
        return 0.0
    return 2.0 * tp / denom`,
    testCases: [
      { input: [5, 1, 2], expected: 0.7692307692307693 },
      { input: [0, 0, 0], expected: 0.0 },
      { input: [3, 0, 0], expected: 1.0 },
      { input: [1, 0, 1], expected: 0.6666666666666666 },
      { input: [4, 1, 0], expected: 0.8888888888888888 },
    ],
    hint: "It is the harmonic mean of precision and recall.",
  },
  {
    id: "st-022",
    title: "Trimmed Mean",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the mean after removing the k smallest and k largest values. Return 0.0 if data is empty or 2*k >= n. With k = 0 this is the ordinary mean.",
    starterCode: `def trimmed_mean(data, k):
    # Your code here
    pass`,
    solution: `def trimmed_mean(data, k):
    n = len(data)
    if n == 0 or 2 * k >= n:
        return 0.0
    s = sorted(data)[k:n - k]
    return sum(s) / len(s)`,
    testCases: [
      { input: [[1, 2, 3, 4, 5, 100], 1], expected: 3.5 },
      { input: [[1, 2, 3, 4, 5], 0], expected: 3.0 },
      { input: [[10, 1, 9, 2, 8, 3], 2], expected: 5.5 },
      { input: [[1, 2], 1], expected: 0.0 },
      { input: [[], 0], expected: 0.0 },
    ],
    hint: "Sort, slice off k values from each end, then average.",
  },
  {
    id: "st-023",
    title: "Quartiles (Tukey Hinges)",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return [Q1, Q3] using Tukey hinges: split the sorted data into lower and upper halves, including the median in both halves when n is odd. Q1 is the median of the lower half and Q3 is the median of the upper half. Return [0.0, 0.0] for empty input.",
    starterCode: `def quartiles(data):
    # Your code here
    pass`,
    solution: `def quartiles(data):
    if not data:
        return [0.0, 0.0]
    s = sorted(data)
    n = len(s)
    if n % 2 == 0:
        lower = s[:n // 2]
        upper = s[n // 2:]
    else:
        half = (n + 1) // 2
        lower = s[:half]
        upper = s[n - half:]
    return [median_sorted(lower), median_sorted(upper)]

def median_sorted(s):
    n = len(s)
    if n == 0:
        return 0.0
    mid = n // 2
    if n % 2:
        return float(s[mid])
    return (s[mid - 1] + s[mid]) / 2.0`,
    testCases: [
      { input: [[1, 2, 3, 4, 5]], expected: [2.0, 4.0] },
      { input: [[1, 2, 3, 4]], expected: [1.5, 3.5] },
      { input: [[1, 2, 3, 4, 5, 6, 7, 8, 9]], expected: [3.0, 7.0] },
      { input: [[7]], expected: [7.0, 7.0] },
      { input: [[]], expected: [0.0, 0.0] },
    ],
    hint: "The inclusive split for odd n means both halves contain the median.",
  },
  {
    id: "st-024",
    title: "Percentile (Linear Interpolation)",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the p-th percentile (0 <= p <= 100) using linear interpolation between closest ranks: rank = p/100 * (n-1), then interpolate between the sorted values at floor(rank) and ceil(rank). Return the single value when n = 1 and 0.0 for empty input.",
    starterCode: `def percentile(data, p):
    # Your code here
    pass`,
    solution: `def percentile(data, p):
    n = len(data)
    if n == 0:
        return 0.0
    s = sorted(data)
    if n == 1:
        return float(s[0])
    rank = (p / 100.0) * (n - 1)
    lo = int(rank)
    frac = rank - lo
    if lo >= n - 1:
        return float(s[-1])
    return s[lo] + frac * (s[lo + 1] - s[lo])`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 50], expected: 3.0 },
      { input: [[1, 2, 3, 4], 25], expected: 1.75 },
      { input: [[10, 20, 30, 40], 75], expected: 32.5 },
      { input: [[5], 90], expected: 5.0 },
      { input: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 90], expected: 9.1 },
    ],
    hint: "The interpolation fraction is rank minus its floor.",
  },
  {
    id: "st-025",
    title: "Population Skewness",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the population skewness: (1/n) * sum((x - mean)^3) / std^3, where std is the population standard deviation. Return 0.0 if data is empty or the standard deviation is zero.",
    starterCode: `def skewness(data):
    # Your code here
    pass`,
    solution: `def skewness(data):
    n = len(data)
    if n == 0:
        return 0.0
    m = sum(data) / n
    m2 = sum((v - m) ** 2 for v in data) / n
    if m2 == 0:
        return 0.0
    m3 = sum((v - m) ** 3 for v in data) / n
    return m3 / (m2 ** 1.5)`,
    testCases: [
      { input: [[1, 2, 3, 4, 5]], expected: 0.0 },
      { input: [[1, 2, 3, 4, 10]], expected: 1.1384199576606167 },
      { input: [[10, 4, 3, 2, 1]], expected: 1.1384199576606167 },
      { input: [[5, 5, 5]], expected: 0.0 },
      { input: [[1, 2]], expected: 0.0 },
    ],
    hint: "Third central moment divided by the cube of the population standard deviation.",
  },
  {
    id: "st-026",
    title: "Population Excess Kurtosis",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the population excess kurtosis: (1/n) * sum((x - mean)^4) / std^4 - 3. Return 0.0 if data is empty or the standard deviation is zero.",
    starterCode: `def kurtosis(data):
    # Your code here
    pass`,
    solution: `def kurtosis(data):
    n = len(data)
    if n == 0:
        return 0.0
    m = sum(data) / n
    m2 = sum((v - m) ** 2 for v in data) / n
    if m2 == 0:
        return 0.0
    m4 = sum((v - m) ** 4 for v in data) / n
    return m4 / (m2 ** 2) - 3.0`,
    testCases: [
      { input: [[1, 2, 3, 4, 5]], expected: -1.3 },
      { input: [[1, 2, 3, 4, 10]], expected: -0.21199999999999974 },
      { input: [[5, 5, 5]], expected: 0.0 },
      { input: [[1, 1, 2, 2]], expected: -2.0 },
      { input: [[1, 2, 3]], expected: -1.5 },
    ],
    hint: "Fourth central moment over variance squared, minus 3.",
  },
  {
    id: "st-027",
    title: "Third Central Moment",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the third central moment about the mean: (1/n) * sum((x - mean)^3). Return 0.0 for empty input. It is positive for right-skewed data and negative for left-skewed data.",
    starterCode: `def third_moment(data):
    # Your code here
    pass`,
    solution: `def third_moment(data):
    n = len(data)
    if n == 0:
        return 0.0
    m = sum(data) / n
    return sum((v - m) ** 3 for v in data) / n`,
    testCases: [
      { input: [[1, 2, 3, 4, 5]], expected: 0.0 },
      { input: [[0, 0, 0, 1]], expected: 0.09375 },
      { input: [[5, 5, 5]], expected: 0.0 },
      { input: [[1, 3]], expected: 0.0 },
      { input: [[1, 2, 3, 4, 10]], expected: 36.0 },
    ],
    hint: "Deviations are cubed before averaging, so signs are preserved.",
  },
  {
    id: "st-028",
    title: "Correlation Matrix 2x2",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the 2x2 Pearson correlation matrix of x and y as [[1, r], [r, 1]]. Return [[0.0, 0.0], [0.0, 0.0]] when x is empty or the lengths differ, and use r = 0.0 when either variable has zero variance.",
    starterCode: `def correlation_matrix(x, y):
    # Your code here
    pass`,
    solution: `def correlation_matrix(x, y):
    n = len(x)
    if n == 0 or len(y) != n:
        return [[0.0, 0.0], [0.0, 0.0]]
    mx = sum(x) / n
    my = sum(y) / n
    num = sum((xi - mx) * (yi - my) for xi, yi in zip(x, y))
    dx = sum((xi - mx) ** 2 for xi in x)
    dy = sum((yi - my) ** 2 for yi in y)
    if dx == 0 or dy == 0:
        r = 0.0
    else:
        r = num / ((dx * dy) ** 0.5)
    return [[1.0, r], [r, 1.0]]`,
    testCases: [
      { input: [[1, 2, 3, 4], [2, 4, 6, 8]], expected: [[1.0, 1.0], [1.0, 1.0]] },
      { input: [[1, 2, 3], [3, 2, 1]], expected: [[1.0, -1.0], [-1.0, 1.0]] },
      { input: [[1, 2, 3, 4, 5], [2, 4, 1, 3, 5]], expected: [[1.0, 0.5], [0.5, 1.0]] },
      { input: [[5, 5, 5], [1, 2, 3]], expected: [[1.0, 0.0], [0.0, 1.0]] },
      { input: [[1, 2, 3, 4], [1, 3, 2, 5]], expected: [[1.0, 0.8315218406202999], [0.8315218406202999, 1.0]] },
    ],
    hint: "Fill the diagonal with 1.0 and place r in both off-diagonal cells.",
  },
  {
    id: "st-029",
    title: "Rolling Mean",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the mean of every consecutive window of length window over data. Return an empty list when window <= 0 or window > len(data).",
    starterCode: `def rolling_mean(data, window):
    # Your code here
    pass`,
    solution: `def rolling_mean(data, window):
    n = len(data)
    if window <= 0 or window > n:
        return []
    out = []
    for i in range(n - window + 1):
        chunk = data[i:i + window]
        out.append(sum(chunk) / window)
    return out`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 3], expected: [2.0, 3.0, 4.0] },
      { input: [[1, 2, 3], 1], expected: [1.0, 2.0, 3.0] },
      { input: [[1, 2], 3], expected: [] },
      { input: [[4, 4, 4, 4], 2], expected: [4.0, 4.0, 4.0] },
      { input: [[1, 2, 3, 4], 2], expected: [1.5, 2.5, 3.5] },
    ],
    hint: "Slide the window and average each slice.",
  },
  {
    id: "st-030",
    title: "Rolling Population Standard Deviation",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the population standard deviation (denominator equals window) of every consecutive window of length window. Return an empty list when window <= 0 or window > len(data).",
    starterCode: `def rolling_std(data, window):
    # Your code here
    pass`,
    solution: `def rolling_std(data, window):
    n = len(data)
    if window <= 0 or window > n:
        return []
    out = []
    for i in range(n - window + 1):
        chunk = data[i:i + window]
        m = sum(chunk) / window
        var = sum((v - m) ** 2 for v in chunk) / window
        out.append(var ** 0.5)
    return out`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 3], expected: [0.816496580927726, 0.816496580927726, 0.816496580927726] },
      { input: [[2, 2, 2], 2], expected: [0.0, 0.0] },
      { input: [[1, 2], 2], expected: [0.5] },
      { input: [[1, 2, 3, 4], 2], expected: [0.5, 0.5, 0.5] },
      { input: [[10, 12, 14, 16, 18], 3], expected: [1.632993161855452, 1.632993161855452, 1.632993161855452] },
    ],
    hint: "Same windows as a rolling mean, but return the square root of the population variance.",
  },
  {
    id: "st-031",
    title: "Exponentially Weighted Mean",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the final exponentially weighted mean with smoothing factor alpha: y_0 = data[0] and y_t = alpha*x_t + (1-alpha)*y_(t-1). Return 0.0 for empty input.",
    starterCode: `def ewma(data, alpha):
    # Your code here
    pass`,
    solution: `def ewma(data, alpha):
    if not data:
        return 0.0
    y = float(data[0])
    for x in data[1:]:
        y = alpha * x + (1.0 - alpha) * y
    return y`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 0.5], expected: 4.0625 },
      { input: [[10, 20, 30], 0.5], expected: 22.5 },
      { input: [[5], 0.3], expected: 5.0 },
      { input: [[], 0.5], expected: 0.0 },
      { input: [[1, 1, 1], 0.9], expected: 1.0 },
    ],
    hint: "Loop once, updating y from the previous value.",
  },
  {
    id: "st-032",
    title: "Autocorrelation Lag-1",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the lag-1 autocorrelation of data: sum((x_i - mean)*(x_(i-1) - mean)) / sum((x_i - mean)^2) for i from 1 to n-1. Return 0.0 when n < 2 or all values are equal.",
    starterCode: `def autocorrelation_lag1(data):
    # Your code here
    pass`,
    solution: `def autocorrelation_lag1(data):
    n = len(data)
    if n < 2:
        return 0.0
    m = sum(data) / n
    denom = sum((v - m) ** 2 for v in data)
    if denom == 0:
        return 0.0
    num = sum((data[i] - m) * (data[i - 1] - m) for i in range(1, n))
    return num / denom`,
    testCases: [
      { input: [[1, 2, 3, 4, 5]], expected: 0.4 },
      { input: [[1, -1, 1, -1, 1]], expected: -0.7999999999999998 },
      { input: [[3, 3]], expected: 0.0 },
      { input: [[1, 2]], expected: -0.5 },
      { input: [[1, 2, 3, 2, 1]], expected: 0.057142857142857106 },
    ],
    hint: "The denominator is the total sum of squares; the numerator only uses adjacent pairs.",
  },
  {
    id: "st-033",
    title: "Robust Z-Score via MAD",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the robust z-score 0.6745 * (x - median) / MAD, where MAD is the unscaled median absolute deviation. Return 0.0 if data is empty or MAD is zero. The 0.6745 constant makes the score comparable to a standard z-score for normal data.",
    starterCode: `def robust_zscore(data, x):
    # Your code here
    pass`,
    solution: `def robust_zscore(data, x):
    n = len(data)
    if n == 0:
        return 0.0
    s = sorted(data)
    mid = n // 2
    if n % 2:
        med = float(s[mid])
    else:
        med = (s[mid - 1] + s[mid]) / 2.0
    devs = sorted(abs(v - med) for v in data)
    if n % 2:
        mad = float(devs[mid])
    else:
        mad = (devs[mid - 1] + devs[mid]) / 2.0
    if mad == 0:
        return 0.0
    return 0.6745 * (x - med) / mad`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 5], expected: 1.349 },
      { input: [[1, 2, 3, 4, 5], 1], expected: -1.349 },
      { input: [[5, 5, 5], 5], expected: 0.0 },
      { input: [[1, 2, 3, 4, 5, 6, 7], 7], expected: 1.01175 },
      { input: [[], 3], expected: 0.0 },
    ],
    hint: "Compute the median and MAD, then scale.",
  },
  {
    id: "st-034",
    title: "Winsorize List",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return data with the k smallest values replaced by the (k+1)-th smallest and the k largest replaced by the (k+1)-th largest, preserving the original order. If 2*k >= n, replace every element with the median; if k <= 0, return the values unchanged. Return [] for empty input.",
    starterCode: `def winsorize(data, k):
    # Your code here
    pass`,
    solution: `def winsorize(data, k):
    n = len(data)
    if n == 0 or k <= 0:
        return [float(x) for x in data]
    s = sorted(data)
    if 2 * k >= n:
        m = median_sorted(s)
        return [m] * n
    lo = float(s[k])
    hi = float(s[n - 1 - k])
    return [min(max(float(x), lo), hi) for x in data]

def median_sorted(s):
    n = len(s)
    if n == 0:
        return 0.0
    mid = n // 2
    if n % 2:
        return float(s[mid])
    return (s[mid - 1] + s[mid]) / 2.0`,
    testCases: [
      { input: [[1, 2, 3, 4, 5, 100], 1], expected: [2.0, 2.0, 3.0, 4.0, 5.0, 5.0] },
      { input: [[1, 2, 3, 4], 1], expected: [2.0, 2.0, 3.0, 3.0] },
      { input: [[5, 1, 4, 2], 0], expected: [5.0, 1.0, 4.0, 2.0] },
      { input: [[1, 10], 1], expected: [5.5, 5.5] },
      { input: [[], 1], expected: [] },
    ],
    hint: "Bound each value between the two clipping thresholds.",
  },
  {
    id: "st-035",
    title: "Outlier Count by 3-Sigma",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the number of values farther than 3 population standard deviations from the mean. Return 0 when data is empty or the standard deviation is zero. With a population standard deviation, a sample smaller than about 11 points cannot produce an outlier.",
    starterCode: `def outliers_3sigma(data):
    # Your code here
    pass`,
    solution: `def outliers_3sigma(data):
    n = len(data)
    if n == 0:
        return 0
    m = sum(data) / n
    var = sum((v - m) ** 2 for v in data) / n
    if var == 0:
        return 0
    sd = var ** 0.5
    return sum(1 for v in data if abs(v - m) > 3.0 * sd)`,
    testCases: [
      { input: [[1, 2, 3, 4, 5]], expected: 0 },
      { input: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100]], expected: 1 },
      { input: [[7, 7, 7, 7, 7, 7, 7, 7, 7, 7]], expected: 0 },
      { input: [[-100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], expected: 1 },
      { input: [[10, 12, 14, 16, 18]], expected: 0 },
    ],
    hint: "Compare abs(x - mean) against 3 * sd.",
  },
  {
    id: "st-036",
    title: "Outlier Count by IQR Fence",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the number of values outside the 1.5*IQR fences, using the exclusive-method quartiles: below Q1 - 1.5*IQR or above Q3 + 1.5*IQR. Return 0 for empty input.",
    starterCode: `def outliers_iqr(data):
    # Your code here
    pass`,
    solution: `def outliers_iqr(data):
    if not data:
        return 0
    q1, q3 = quartiles(data)
    iqr_val = q3 - q1
    lo = q1 - 1.5 * iqr_val
    hi = q3 + 1.5 * iqr_val
    return sum(1 for v in data if v < lo or v > hi)

def quartiles(data):
    if not data:
        return [0.0, 0.0]
    s = sorted(data)
    n = len(s)
    if n % 2 == 0:
        lower = s[:n // 2]
        upper = s[n // 2:]
    else:
        half = (n + 1) // 2
        lower = s[:half]
        upper = s[n - half:]
    return [median_sorted(lower), median_sorted(upper)]

def median_sorted(s):
    n = len(s)
    if n == 0:
        return 0.0
    mid = n // 2
    if n % 2:
        return float(s[mid])
    return (s[mid - 1] + s[mid]) / 2.0`,
    testCases: [
      { input: [[1, 2, 3, 4, 5]], expected: 0 },
      { input: [[1, 2, 3, 4, 100]], expected: 1 },
      { input: [[-50, 1, 2, 3, 4]], expected: 1 },
      { input: [[7, 7, 7]], expected: 0 },
      { input: [[1, 2, 3, 4, 5, 6, 7, 8, 100]], expected: 1 },
    ],
    hint: "Compute the quartiles first, then count values beyond the fences.",
  },
  {
    id: "st-037",
    title: "One-Sample t-Statistic",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the one-sample t-statistic (mean - mu0) / (s / sqrt(n)), where s is the sample standard deviation with denominator n - 1. Return 0.0 when n < 2 or the sample variance is zero.",
    starterCode: `def t_statistic(data, mu0):
    # Your code here
    pass`,
    solution: `def t_statistic(data, mu0):
    n = len(data)
    if n < 2:
        return 0.0
    m = sum(data) / n
    s2 = sum((v - m) ** 2 for v in data) / (n - 1)
    if s2 <= 0:
        return 0.0
    se = (s2 / n) ** 0.5
    return (m - mu0) / se`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 3], expected: 0.0 },
      { input: [[1, 2, 3, 4, 5], 0], expected: 4.242640687119285 },
      { input: [[10, 12, 14], 12], expected: 0.0 },
      { input: [[10, 12, 14], 10], expected: 1.7320508075688774 },
      { input: [[5], 5], expected: 0.0 },
    ],
    hint: "The denominator is the standard error of the mean.",
  },
  {
    id: "st-038",
    title: "Pooled Variance",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the pooled variance ((n1-1)*var1 + (n2-1)*var2) / (n1 + n2 - 2) using sample variances. Return 0.0 when either sample is empty or the total degrees of freedom is not positive.",
    starterCode: `def pooled_variance(x, y):
    # Your code here
    pass`,
    solution: `def pooled_variance(x, y):
    n1 = len(x)
    n2 = len(y)
    if n1 == 0 or n2 == 0:
        return 0.0
    dof = n1 + n2 - 2
    if dof <= 0:
        return 0.0
    m1 = sum(x) / n1
    m2 = sum(y) / n2
    ss1 = sum((v - m1) ** 2 for v in x)
    ss2 = sum((v - m2) ** 2 for v in y)
    return (ss1 + ss2) / dof`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], [2, 4, 6, 8, 10]], expected: 6.25 },
      { input: [[1, 1, 1], [5, 5, 5]], expected: 0.0 },
      { input: [[1, 2, 3], [4, 5, 6]], expected: 1.0 },
      { input: [[1, 2], [3, 4]], expected: 0.5 },
      { input: [[5], [1, 2]], expected: 0.5 },
    ],
    hint: "Sum the sums of squares and divide by n1 + n2 - 2.",
  },
  {
    id: "st-039",
    title: "Chi-Square Statistic for Counts",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the chi-square statistic sum((o - e)^2 / e) for a 2D table of observed counts, where e = row_total * col_total / total. Return 0.0 for an empty table, a zero total, or any zero expected count.",
    starterCode: `def chi_square_counts(observed):
    # Your code here
    pass`,
    solution: `def chi_square_counts(observed):
    rows = len(observed)
    if rows == 0:
        return 0.0
    cols = len(observed[0])
    if cols == 0:
        return 0.0
    total = sum(sum(row) for row in observed)
    if total == 0:
        return 0.0
    row_totals = [sum(row) for row in observed]
    col_totals = [sum(observed[i][j] for i in range(rows)) for j in range(cols)]
    stat = 0.0
    for i in range(rows):
        for j in range(cols):
            e = row_totals[i] * col_totals[j] / total
            if e == 0:
                return 0.0
            o = observed[i][j]
            stat += (o - e) ** 2 / e
    return stat`,
    testCases: [
      { input: [[[10, 20], [30, 40]]], expected: 0.7936507936507936 },
      { input: [[[5, 5], [5, 5]]], expected: 0.0 },
      { input: [[[1, 2, 3], [3, 2, 1]]], expected: 2.0 },
      { input: [[[10, 0], [0, 10]]], expected: 20.0 },
      { input: [[[10, 20, 30]]], expected: 0.0 },
    ],
    hint: "Compute the row and column totals once, then loop over the cells.",
  },
  {
    id: "st-040",
    title: "Odds Ratio and Risk Ratio 2x2",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Given a 2x2 table (a exposed cases, b exposed non-cases, c unexposed cases, d unexposed non-cases), return [odds_ratio, risk_ratio] where OR = a*d / (b*c) and RR = (a/(a+b)) / (c/(c+d)). Return 0.0 for a component whose denominator is zero.",
    starterCode: `def odds_risk_ratios(a, b, c, d):
    # Your code here
    pass`,
    solution: `def odds_risk_ratios(a, b, c, d):
    if b * c == 0:
        odds = 0.0
    else:
        odds = (a * d) / (b * c)
    risk_exp = a / (a + b) if a + b > 0 else 0.0
    risk_unexp = c / (c + d) if c + d > 0 else 0.0
    if risk_unexp == 0:
        rr = 0.0
    else:
        rr = risk_exp / risk_unexp
    return [odds, rr]`,
    testCases: [
      { input: [20, 80, 10, 90], expected: [2.25, 2.0] },
      { input: [30, 70, 15, 85], expected: [2.4285714285714284, 2.0] },
      { input: [10, 10, 10, 10], expected: [1.0, 1.0] },
      { input: [0, 10, 5, 5], expected: [0.0, 0.0] },
      { input: [1, 0, 0, 1], expected: [0.0, 0.0] },
    ],
    hint: "Compute the two ratios independently and return them in a list.",
  },
  {
    id: "st-041",
    title: "Sensitivity and Specificity from Counts",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return [sensitivity, specificity] from counts: sensitivity = tp / (tp + fn) and specificity = tn / (tn + fp). Return 0.0 for a ratio whose denominator is zero.",
    starterCode: `def sensitivity_specificity(tp, fn, tn, fp):
    # Your code here
    pass`,
    solution: `def sensitivity_specificity(tp, fn, tn, fp):
    sens = tp / (tp + fn) if tp + fn > 0 else 0.0
    spec = tn / (tn + fp) if tn + fp > 0 else 0.0
    return [sens, spec]`,
    testCases: [
      { input: [90, 10, 80, 20], expected: [0.9, 0.8] },
      { input: [50, 0, 50, 0], expected: [1.0, 1.0] },
      { input: [0, 10, 20, 0], expected: [0.0, 1.0] },
      { input: [0, 0, 0, 0], expected: [0.0, 0.0] },
      { input: [40, 10, 45, 5], expected: [0.8, 0.9] },
    ],
    hint: "Each measure is a conditional proportion in one row of the confusion matrix.",
  },
  {
    id: "st-042",
    title: "Spearman Rank Correlation with Ties",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Return the Spearman rank correlation between x and y, using average ranks for tied values and then the Pearson formula on the ranks. Return 0.0 when fewer than two pairs are given or either rank vector is constant.",
    starterCode: `def spearman_correlation(x, y):
    # Your code here
    pass`,
    solution: `def spearman_correlation(x, y):
    n = len(x)
    if n < 2 or len(y) != n:
        return 0.0
    rx = average_ranks(x)
    ry = average_ranks(y)
    mx = sum(rx) / n
    my = sum(ry) / n
    num = sum((a - mx) * (b - my) for a, b in zip(rx, ry))
    dx = sum((a - mx) ** 2 for a in rx)
    dy = sum((b - my) ** 2 for b in ry)
    if dx == 0 or dy == 0:
        return 0.0
    return num / ((dx * dy) ** 0.5)

def average_ranks(vals):
    n = len(vals)
    order = sorted(range(n), key=lambda i: vals[i])
    ranks = [0.0] * n
    i = 0
    while i < n:
        j = i
        while j + 1 < n and vals[order[j + 1]] == vals[order[i]]:
            j += 1
        avg = (i + j) / 2.0 + 1.0
        for t in range(i, j + 1):
            ranks[order[t]] = avg
        i = j + 1
    return ranks`,
    testCases: [
      { input: [[1, 2, 3, 4], [1, 4, 9, 16]], expected: 1.0 },
      { input: [[1, 2, 3], [3, 2, 1]], expected: -1.0 },
      { input: [[1, 2, 2, 3], [1, 2, 3, 4]], expected: 0.9486832980505138 },
      { input: [[5, 5, 5], [1, 2, 3]], expected: 0.0 },
      { input: [[1, 2, 3, 4], [2, 1, 4, 3]], expected: 0.6 },
    ],
    hint: "Rank both lists with average ranks for ties, then correlate the ranks.",
  },
  {
    id: "st-043",
    title: "Covariance Stationary Check Lite",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Split data into two halves at n//2 and check a simple weak-stationarity condition: |mean1 - mean2| <= 0.10 * overall_std and |var1 - var2| <= 0.25 * overall_var, with population variances. Return False when n < 4 and True for constant data. Return a boolean.",
    starterCode: `def covariance_stationary_lite(data):
    # Your code here
    pass`,
    solution: `def covariance_stationary_lite(data):
    n = len(data)
    if n < 4:
        return False
    half = n // 2
    a = data[:half]
    b = data[half:]
    ma = sum(a) / len(a)
    mb = sum(b) / len(b)
    m = sum(data) / n
    var_all = sum((x - m) ** 2 for x in data) / n
    if var_all == 0:
        return True
    va = sum((x - ma) ** 2 for x in a) / len(a)
    vb = sum((x - mb) ** 2 for x in b) / len(b)
    mean_ok = abs(ma - mb) <= 0.10 * (var_all ** 0.5)
    var_ok = abs(va - vb) <= 0.25 * var_all
    return mean_ok and var_ok`,
    testCases: [
      { input: [[2, 4, 2, 4, 2, 4, 2, 4]], expected: true },
      { input: [[1, 2, 3, 4, 5, 6, 7, 8]], expected: false },
      { input: [[5, 5, 5, 5, 5, 5, 5, 5]], expected: true },
      { input: [[1, 2, 3]], expected: false },
      { input: [[3, 1, 3, 1, 3, 1, 3, 1]], expected: true },
    ],
    hint: "Compare the two halves on level and spread with the stated tolerances.",
  },
  {
    id: "st-044",
    title: "Welch t-Statistic",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Return the Welch t-statistic (mean_x - mean_y) / sqrt(sx^2/nx + sy^2/ny), where sx^2 and sy^2 are sample variances. Return 0.0 when either sample has fewer than two values or the standard error is zero.",
    starterCode: `def welch_t_statistic(x, y):
    # Your code here
    pass`,
    solution: `def welch_t_statistic(x, y):
    n1 = len(x)
    n2 = len(y)
    if n1 < 2 or n2 < 2:
        return 0.0
    m1 = sum(x) / n1
    m2 = sum(y) / n2
    s1 = sum((v - m1) ** 2 for v in x) / (n1 - 1)
    s2 = sum((v - m2) ** 2 for v in y) / (n2 - 1)
    se2 = s1 / n1 + s2 / n2
    if se2 <= 0:
        return 0.0
    return (m1 - m2) / (se2 ** 0.5)`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], [2, 4, 6, 8, 10]], expected: -1.8973665961010275 },
      { input: [[1, 2, 3], [1, 2, 3]], expected: 0.0 },
      { input: [[1, 1, 1], [2, 2, 2]], expected: 0.0 },
      { input: [[10, 12, 14], [9, 11, 13]], expected: 0.6123724356957945 },
      { input: [[5], [1, 2, 3]], expected: 0.0 },
    ],
    hint: "Unlike the pooled t-statistic, the standard error uses the two sample variances directly.",
  },
  {
    id: "st-045",
    title: "Welch Degrees of Freedom",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Return the Welch-Satterthwaite degrees of freedom (sx^2/nx + sy^2/ny)^2 / ((sx^2/nx)^2/(nx-1) + (sy^2/ny)^2/(ny-1)) using sample variances. Return 0.0 when either sample has fewer than two values or the denominator is zero.",
    starterCode: `def welch_degrees_of_freedom(x, y):
    # Your code here
    pass`,
    solution: `def welch_degrees_of_freedom(x, y):
    n1 = len(x)
    n2 = len(y)
    if n1 < 2 or n2 < 2:
        return 0.0
    m1 = sum(x) / n1
    m2 = sum(y) / n2
    a = sum((v - m1) ** 2 for v in x) / (n1 - 1) / n1
    b = sum((v - m2) ** 2 for v in y) / (n2 - 1) / n2
    denom = (a ** 2) / (n1 - 1) + (b ** 2) / (n2 - 1)
    if denom == 0:
        return 0.0
    return (a + b) ** 2 / denom`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], [2, 4, 6, 8, 10]], expected: 5.882352941176471 },
      { input: [[1, 2, 3], [4, 5, 6]], expected: 4.0 },
      { input: [[1, 1, 1], [2, 2, 2]], expected: 0.0 },
      { input: [[1, 2, 3, 4], [5, 7, 9, 11]], expected: 4.411764705882353 },
      { input: [[5], [1, 2, 3]], expected: 0.0 },
    ],
    hint: "Square the combined standard error over the sum of the squared components.",
  },
  {
    id: "st-046",
    title: "G-Test Statistic",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Return the G-test statistic 2 * sum(o * ln(o/e)) for a 2D table of observed counts, where e = row_total * col_total / total; cells with observed count zero contribute zero. Return 0.0 for an empty table, a zero total, or any zero expected count.",
    starterCode: `import math
def g_test(observed):
    # Your code here
    pass`,
    solution: `import math
def g_test(observed):
    rows = len(observed)
    if rows == 0:
        return 0.0
    cols = len(observed[0])
    if cols == 0:
        return 0.0
    total = sum(sum(row) for row in observed)
    if total == 0:
        return 0.0
    row_totals = [sum(row) for row in observed]
    col_totals = [sum(observed[i][j] for i in range(rows)) for j in range(cols)]
    stat = 0.0
    for i in range(rows):
        for j in range(cols):
            e = row_totals[i] * col_totals[j] / total
            if e == 0:
                return 0.0
            o = observed[i][j]
            if o > 0:
                stat += o * math.log(o / e)
    return 2.0 * stat`,
    testCases: [
      { input: [[[10, 20], [30, 40]]], expected: 0.8043486460964835 },
      { input: [[[5, 5], [5, 5]]], expected: 0.0 },
      { input: [[[10, 0], [0, 10]]], expected: 27.725887222397812 },
      { input: [[[20, 30, 50]]], expected: 0.0 },
      { input: [[[1, 2], [3, 4]]], expected: 0.08043486460964827 },
    ],
    hint: "Only cells with o greater than 0 contribute to the sum of o * ln(o/e).",
  },
  {
    id: "st-047",
    title: "Permutation p-Value from Difference of Means",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Run a two-sided permutation test on the difference of means between x and y using n_perm label shuffles. Use a self-contained Lehmer RNG seeded with seed (state = seed % 2147483647, next = state * 48271 % 2147483647) so results are deterministic. Return (count + 1) / (n_perm + 1), where count is the number of permuted absolute differences greater than or equal to the observed absolute difference; return 1.0 for empty input or n_perm <= 0.",
    starterCode: `def permutation_p_value(x, y, n_perm, seed):
    # Your code here
    pass`,
    solution: `def permutation_p_value(x, y, n_perm, seed):
    if not x or not y or n_perm <= 0:
        return 1.0
    state = seed % 2147483647
    if state <= 0:
        state = state + 2147483646
    combined = list(x) + list(y)
    nx = len(x)
    ny = len(y)
    obs = sum(x) / nx - sum(y) / ny
    count = 0
    for _ in range(n_perm):
        for i in range(len(combined) - 1, 0, -1):
            state = (state * 48271) % 2147483647
            j = state % (i + 1)
            combined[i], combined[j] = combined[j], combined[i]
        diff = sum(combined[:nx]) / nx - sum(combined[nx:]) / ny
        if abs(diff) >= abs(obs):
            count += 1
    return (count + 1) / (n_perm + 1)`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10], 100, 42], expected: 0.009900990099009901 },
      { input: [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10], 200, 7], expected: 0.014925373134328358 },
      { input: [[1, 2, 3, 4, 5], [5, 4, 3, 2, 1], 100, 3], expected: 1.0 },
      { input: [[], [1, 2], 50, 1], expected: 1.0 },
      { input: [[1, 2], [3, 4], 0, 1], expected: 1.0 },
    ],
    hint: "Shuffle with Fisher-Yates driven by the seeded generator, then recompute the difference.",
  },
  {
    id: "st-048",
    title: "Bootstrap Mean CI (Percentile)",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Draw n_boot bootstrap resamples of data with replacement using a self-contained Lehmer RNG seeded with seed (state = seed % 2147483647, next = state * 48271 % 2147483647), compute each resample mean, and return the percentile interval [low, high] at alpha/2 and 1 - alpha/2 using linear interpolation between closest ranks. Return [0.0, 0.0] for empty data or n_boot <= 0.",
    starterCode: `def bootstrap_mean_ci(data, n_boot, seed, alpha):
    # Your code here
    pass`,
    solution: `def bootstrap_mean_ci(data, n_boot, seed, alpha):
    n = len(data)
    if n == 0 or n_boot <= 0:
        return [0.0, 0.0]
    state = seed % 2147483647
    if state <= 0:
        state = state + 2147483646
    means = []
    for _ in range(n_boot):
        s = 0.0
        for _ in range(n):
            state = (state * 48271) % 2147483647
            s += data[state % n]
        means.append(s / n)
    means.sort()
    def pct(p):
        if len(means) == 1:
            return means[0]
        rank = (p / 100.0) * (len(means) - 1)
        lo = int(rank)
        frac = rank - lo
        if lo >= len(means) - 1:
            return means[-1]
        return means[lo] + frac * (means[lo + 1] - means[lo])
    return [pct(100.0 * alpha / 2.0), pct(100.0 * (1.0 - alpha / 2.0))]`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 200, 7, 0.05], expected: [1.995, 4.2] },
      { input: [[5], 50, 1, 0.1], expected: [5.0, 5.0] },
      { input: [[], 10, 1, 0.05], expected: [0.0, 0.0] },
      { input: [[1, 2], 100, 3, 0.5], expected: [1.0, 2.0] },
      { input: [[10, 20, 30, 40], 300, 99, 0.1], expected: [17.5, 32.5] },
    ],
    hint: "Sort the bootstrap means, then interpolate the two percentile ranks.",
  },
  {
    id: "st-049",
    title: "Mann-Whitney U and Wilcoxon Rank-Sum",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Return [W, U] for samples x and y, where W is the Wilcoxon rank-sum statistic (the sum of the average ranks of x within the combined sample) and U = W - n1*(n1+1)/2. Ties get average ranks. Return [0.0, 0.0] if either sample is empty.",
    starterCode: `def mann_whitney_u(x, y):
    # Your code here
    pass`,
    solution: `def mann_whitney_u(x, y):
    n1 = len(x)
    n2 = len(y)
    if n1 == 0 or n2 == 0:
        return [0.0, 0.0]
    ranks = average_ranks(list(x) + list(y))
    w = sum(ranks[:n1])
    u = w - n1 * (n1 + 1) / 2.0
    return [w, u]

def average_ranks(vals):
    n = len(vals)
    order = sorted(range(n), key=lambda i: vals[i])
    ranks = [0.0] * n
    i = 0
    while i < n:
        j = i
        while j + 1 < n and vals[order[j + 1]] == vals[order[i]]:
            j += 1
        avg = (i + j) / 2.0 + 1.0
        for t in range(i, j + 1):
            ranks[order[t]] = avg
        i = j + 1
    return ranks`,
    testCases: [
      { input: [[1, 2, 3], [4, 5, 6]], expected: [6.0, 0.0] },
      { input: [[4, 5, 6], [1, 2, 3]], expected: [15.0, 9.0] },
      { input: [[1, 2, 2], [2, 3, 4]], expected: [7.0, 1.0] },
      { input: [[5], [5]], expected: [1.5, 0.5] },
      { input: [[], [1, 2]], expected: [0.0, 0.0] },
    ],
    hint: "Rank the combined data, sum the ranks belonging to x, then subtract the shift.",
  },
  {
    id: "st-050",
    title: "Cramer's V from Chi-Square",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Return Cramer's V = sqrt(chi2 / (n * min(r-1, c-1))) for a 2D table of observed counts, where chi2 = sum((o - e)^2 / e) and e = row_total * col_total / total. Return 0.0 for an empty table, a zero total, a table with one row or one column, or any zero expected count.",
    starterCode: `def cramers_v(observed):
    # Your code here
    pass`,
    solution: `def cramers_v(observed):
    rows = len(observed)
    if rows == 0:
        return 0.0
    cols = len(observed[0])
    if cols == 0 or rows < 2 or cols < 2:
        return 0.0
    total = sum(sum(row) for row in observed)
    if total == 0:
        return 0.0
    row_totals = [sum(row) for row in observed]
    col_totals = [sum(observed[i][j] for i in range(rows)) for j in range(cols)]
    stat = 0.0
    for i in range(rows):
        for j in range(cols):
            e = row_totals[i] * col_totals[j] / total
            if e == 0:
                return 0.0
            o = observed[i][j]
            stat += (o - e) ** 2 / e
    return (stat / (total * min(rows - 1, cols - 1))) ** 0.5`,
    testCases: [
      { input: [[[10, 20], [30, 40]]], expected: 0.0890870806374748 },
      { input: [[[10, 0], [0, 10]]], expected: 1.0 },
      { input: [[[5, 5], [5, 5]]], expected: 0.0 },
      { input: [[[10, 20, 30], [30, 20, 10]]], expected: 0.408248290463863 },
      { input: [[[10, 20, 30]]], expected: 0.0 },
    ],
    hint: "Compute chi-square first, then normalize by n and the smaller dimension minus one.",
  },
];
