import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "st-401",
    title: "Accuracy from Confusion Counts",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Classification accuracy is (TP + TN) / (TP + TN + FP + FN).\n\nGiven the four counts, return the accuracy.",
    starterCode: `def accuracy_from_confusion_counts(tp, tn, fp, fn):
    # Your code here
    pass`,
    solution: `def accuracy_from_confusion_counts(tp, tn, fp, fn):
    return (tp + tn) / (tp + tn + fp + fn)`,
    testCases: [
      { input: [8, 9, 1, 2], expected: 0.85 },
      { input: [5, 5, 0, 0], expected: 1.0 },
      { input: [0, 0, 1, 1], expected: 0.0 },
    ],
    hint: "Correct predictions over all predictions.",
  },
  {
    id: "st-402",
    title: "Precision from Counts",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Precision is the fraction of predicted positives that are correct: TP / (TP + FP). Return 0.0 when the denominator is zero.\n\nGiven the counts, return the precision.",
    starterCode: `def precision_from_counts(tp, fp):
    # Your code here
    pass`,
    solution: `def precision_from_counts(tp, fp):
    if tp + fp == 0:
        return 0.0
    return tp / (tp + fp)`,
    testCases: [
      { input: [8, 2], expected: 0.8 },
      { input: [0, 5], expected: 0.0 },
      { input: [3, 0], expected: 1.0 },
    ],
    hint: "It answers: of the alarms raised, how many were real?",
  },
  {
    id: "st-403",
    title: "Recall from Counts",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Recall (sensitivity) is TP / (TP + FN), the fraction of true positives found. Return 0.0 when the denominator is zero.\n\nGiven the counts, return the recall.",
    starterCode: `def recall_from_counts(tp, fn):
    # Your code here
    pass`,
    solution: `def recall_from_counts(tp, fn):
    if tp + fn == 0:
        return 0.0
    return tp / (tp + fn)`,
    testCases: [
      { input: [8, 2], expected: 0.8 },
      { input: [0, 4], expected: 0.0 },
      { input: [5, 0], expected: 1.0 },
    ],
    hint: "It answers: of the real positives, how many were found?",
  },
  {
    id: "st-404",
    title: "F1 from Precision Recall",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "The F1 score is the harmonic mean of precision and recall: 2 p r / (p + r). Return 0.0 when both are zero.\n\nGiven precision and recall, return F1.",
    starterCode: `def f1_from_precision_recall(precision, recall):
    # Your code here
    pass`,
    solution: `def f1_from_precision_recall(precision, recall):
    if precision + recall == 0:
        return 0.0
    return 2.0 * precision * recall / (precision + recall)`,
    testCases: [
      { input: [0.8, 0.6], expected: 0.6857142857142857 },
      { input: [1.0, 1.0], expected: 1.0 },
      { input: [0.5, 0.0], expected: 0.0 },
    ],
    hint: "Both metrics must be good for F1 to be high.",
  },
  {
    id: "st-405",
    title: "Specificity from Counts",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Specificity is TN / (TN + FP), the fraction of true negatives correctly identified. Return 0.0 when the denominator is zero.\n\nGiven the counts, return specificity.",
    starterCode: `def specificity_from_counts(tn, fp):
    # Your code here
    pass`,
    solution: `def specificity_from_counts(tn, fp):
    if tn + fp == 0:
        return 0.0
    return tn / (tn + fp)`,
    testCases: [
      { input: [9, 1], expected: 0.9 },
      { input: [4, 0], expected: 1.0 },
      { input: [0, 3], expected: 0.0 },
    ],
    hint: "It is recall applied to the negative class.",
  },
  {
    id: "st-406",
    title: "Negative Predictive Value from Counts",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "The negative predictive value is TN / (TN + FN), the probability a negative prediction is correct. Return 0.0 when the denominator is zero.\n\nGiven the counts, return the NPV.",
    starterCode: `def negative_predictive_value(tn, fn):
    # Your code here
    pass`,
    solution: `def negative_predictive_value(tn, fn):
    if tn + fn == 0:
        return 0.0
    return tn / (tn + fn)`,
    testCases: [
      { input: [9, 1], expected: 0.9 },
      { input: [2, 2], expected: 0.5 },
      { input: [0, 5], expected: 0.0 },
    ],
    hint: "Condition on the prediction being negative, not on the truth.",
  },
  {
    id: "st-407",
    title: "Matthews Correlation from Counts",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "The Matthews correlation coefficient is (TP TN - FP FN) / sqrt((TP + FP)(TP + FN)(TN + FP)(TN + FN)). Return 0.0 when any factor is zero.\n\nGiven the four counts, return the coefficient.",
    starterCode: `def matthews_correlation_coefficient(tp, tn, fp, fn):
    # Your code here
    pass`,
    solution: `def matthews_correlation_coefficient(tp, tn, fp, fn):
    den = ((tp + fp) * (tp + fn) * (tn + fp) * (tn + fn)) ** 0.5
    if den == 0:
        return 0.0
    return (tp * tn - fp * fn) / den`,
    testCases: [
      { input: [8, 9, 1, 2], expected: 0.7035264706814485 },
      { input: [5, 5, 5, 5], expected: 0.0 },
      { input: [1, 1, 1, 1], expected: 0.0 },
    ],
    hint: "It stays high only when both classes are predicted well.",
  },
  {
    id: "st-408",
    title: "Balanced Accuracy from Rates",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Balanced accuracy averages recall and specificity: (recall + specificity) / 2.\n\nGiven the two rates, return the balanced accuracy.",
    starterCode: `def balanced_accuracy_from_rates(recall, specificity):
    # Your code here
    pass`,
    solution: `def balanced_accuracy_from_rates(recall, specificity):
    return 0.5 * (recall + specificity)`,
    testCases: [
      { input: [0.8, 0.6], expected: 0.7 },
      { input: [1.0, 0.0], expected: 0.5 },
      { input: [0.9, 0.9], expected: 0.9 },
    ],
    hint: "Each class contributes equally regardless of prevalence.",
  },
  {
    id: "st-409",
    title: "False Positive Rate from Counts",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "The false positive rate is FP / (FP + TN), equal to 1 minus specificity. Return 0.0 when the denominator is zero.\n\nGiven the counts, return the rate.",
    starterCode: `def false_positive_rate_from_counts(fp, tn):
    # Your code here
    pass`,
    solution: `def false_positive_rate_from_counts(fp, tn):
    if fp + tn == 0:
        return 0.0
    return fp / (fp + tn)`,
    testCases: [
      { input: [1, 9], expected: 0.1 },
      { input: [5, 5], expected: 0.5 },
      { input: [0, 4], expected: 0.0 },
    ],
    hint: "It is the complement of specificity.",
  },
  {
    id: "st-410",
    title: "Cohen Kappa from Counts",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Cohen's kappa is (p_o - p_e) / (1 - p_e), where p_o is observed agreement and p_e the agreement expected from the margins.\n\nGiven p_o and p_e, return kappa. Return 0.0 when p_e equals one.",
    starterCode: `def cohen_kappa_from_counts(p_observed, p_expected):
    # Your code here
    pass`,
    solution: `def cohen_kappa_from_counts(p_observed, p_expected):
    if p_expected == 1.0:
        return 0.0
    return (p_observed - p_expected) / (1.0 - p_expected)`,
    testCases: [
      { input: [0.8, 0.5], expected: 0.6000000000000001 },
      { input: [0.6, 0.6], expected: 0.0 },
      { input: [1.0, 0.5], expected: 1.0 },
    ],
    hint: "The correction removes agreement achievable by chance.",
  },
  {
    id: "st-411",
    title: "Brier Score Binary",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "The Brier score for binary probabilistic predictions is mean_i (p_i - y_i)^2.\n\nGiven the predicted probabilities and the binary outcomes, return the Brier score.",
    starterCode: `def brier_score_binary(probs, outcomes):
    # Your code here
    pass`,
    solution: `def brier_score_binary(probs, outcomes):
    return sum((p - y) ** 2 for p, y in zip(probs, outcomes)) / len(probs)`,
    testCases: [
      { input: [[0.8, 0.2], [1, 0]], expected: 0.039999999999999994 },
      { input: [[0.5, 0.5, 0.5], [1, 0, 1]], expected: 0.25 },
      { input: [[1.0, 0.0], [1, 0]], expected: 0.0 },
    ],
    hint: "It is the mean squared error of probabilities.",
  },
  {
    id: "st-412",
    title: "Log Loss Binary",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Binary log loss is -mean_i (y_i log(p_i) + (1 - y_i) log(1 - p_i)).\n\nGiven predicted probabilities (strictly between 0 and 1) and binary outcomes, return the log loss.",
    starterCode: `def log_loss_binary(probs, outcomes):
    # Your code here
    pass`,
    solution: `def log_loss_binary(probs, outcomes):
    import math
    return -sum(y * math.log(p) + (1 - y) * math.log(1.0 - p) for p, y in zip(probs, outcomes)) / len(probs)`,
    testCases: [
      { input: [[0.8, 0.2], [1, 0]], expected: 0.2231435513142097 },
      { input: [[0.5, 0.5], [0, 1]], expected: 0.6931471805599453 },
      { input: [[0.9, 0.1], [1, 0]], expected: 0.10536051565782628 },
    ],
    hint: "Only the probability assigned to the observed outcome counts.",
  },
  {
    id: "st-413",
    title: "Expected Calibration Error Bins",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Expected calibration error is the weighted average over confidence bins of |accuracy_b - confidence_b|, weighted by the fraction of samples in each bin.\n\nGiven the bin confidences, bin accuracies, and bin fractions, return the ECE.",
    starterCode: `def expected_calibration_error(confidences, accuracies, fractions):
    # Your code here
    pass`,
    solution: `def expected_calibration_error(confidences, accuracies, fractions):
    return sum(f * abs(a - c) for c, a, f in zip(confidences, accuracies, fractions))`,
    testCases: [
      { input: [[0.1, 0.9], [0.2, 0.8], [0.5, 0.5]], expected: 0.09999999999999999 },
      { input: [[0.5, 0.5], [0.5, 0.5], [0.5, 0.5]], expected: 0.0 },
      { input: [[0.2, 0.8], [0.1, 0.9], [0.25, 0.75]], expected: 0.09999999999999998 },
    ],
    hint: "Weight each bin gap by its sample share.",
  },
  {
    id: "st-414",
    title: "Jaccard Index of Sets",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "The Jaccard index is |A intersect B| / |A union B| over unique elements. Return 1.0 when both sets are empty.\n\nGiven two lists of elements, return the index.",
    starterCode: `def jaccard_index_of_sets(a, b):
    # Your code here
    pass`,
    solution: `def jaccard_index_of_sets(a, b):
    sa = set(a)
    sb = set(b)
    union = sa | sb
    if not union:
        return 1.0
    return len(sa & sb) / len(union)`,
    testCases: [
      { input: [[1, 2], [2, 3]], expected: 0.3333333333333333 },
      { input: [[1, 1, 2], [1, 2, 2]], expected: 1.0 },
      { input: [[1, 2], [3, 4]], expected: 0.0 },
    ],
    hint: "Deduplicate before comparing.",
  },
  {
    id: "st-415",
    title: "Dice Coefficient of Sets",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "The Dice coefficient is 2 |A intersect B| / (|A| + |B|) and relates to Jaccard by Dice = 2J / (1 + J). Return 1.0 when both sets are empty.\n\nGiven two lists of elements, return the coefficient.",
    starterCode: `def dice_coefficient_of_sets(a, b):
    # Your code here
    pass`,
    solution: `def dice_coefficient_of_sets(a, b):
    sa = set(a)
    sb = set(b)
    if not sa and not sb:
        return 1.0
    return 2.0 * len(sa & sb) / (len(sa) + len(sb))`,
    testCases: [
      { input: [[1, 2], [2, 3]], expected: 0.5 },
      { input: [[1, 2], [1, 2]], expected: 1.0 },
      { input: [[1], [2]], expected: 0.0 },
    ],
    hint: "It is the harmonic-style overlap ratio of set sizes.",
  },
  {
    id: "st-416",
    title: "Cohen Kappa Expected Agreement",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "From two raters with positive rates p1 and p2 on a binary label, chance agreement is p_e = p1 p2 + (1 - p1)(1 - p2).\n\nGiven the two positive rates, return the expected agreement.",
    starterCode: `def cohen_kappa_expected_agreement(p1, p2):
    # Your code here
    pass`,
    solution: `def cohen_kappa_expected_agreement(p1, p2):
    return p1 * p2 + (1.0 - p1) * (1.0 - p2)`,
    testCases: [
      { input: [0.5, 0.5], expected: 0.5 },
      { input: [0.8, 0.6], expected: 0.5599999999999999 },
      { input: [1.0, 0.0], expected: 0.0 },
    ],
    hint: "Both agreeing positive and agreeing negative contribute.",
  },
  {
    id: "st-417",
    title: "Population Stability Index Bins",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "The population stability index sums (actual_pct - expected_pct) * ln(actual_pct / expected_pct) over bins, with a small epsilon guard convention here: bins with either share at zero contribute zero.\n\nGiven the expected and actual proportions, return the PSI.",
    starterCode: `def population_stability_index(expected, actual):
    # Your code here
    pass`,
    solution: `def population_stability_index(expected, actual):
    import math
    total = 0.0
    for e, a in zip(expected, actual):
        if e <= 0.0 or a <= 0.0:
            continue
        total += (a - e) * math.log(a / e)
    return total`,
    testCases: [
      { input: [[0.5, 0.5], [0.5, 0.5]], expected: 0.0 },
      { input: [[0.5, 0.5], [0.6, 0.4]], expected: 0.04054651081081642 },
      { input: [[0.25, 0.75], [0.0, 1.0]], expected: 0.07192051811294521 },
    ],
    hint: "Identical distributions give zero drift.",
  },
  {
    id: "st-418",
    title: "CUPED Adjusted Estimate",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "CUPED adjusts a treatment effect estimate using a pre-experiment covariate: y_adjusted = mean(y) - theta * (mean(x) - mean(x_prior)).\n\nGiven the post-experiment mean, the covariate mean, the pre-period covariate mean, and theta, return the adjusted estimate.",
    starterCode: `def cuped_adjusted_estimate(mean_y, mean_x, mean_x_prior, theta):
    # Your code here
    pass`,
    solution: `def cuped_adjusted_estimate(mean_y, mean_x, mean_x_prior, theta):
    return mean_y - theta * (mean_x - mean_x_prior)`,
    testCases: [
      { input: [1.0, 5.0, 4.0, 0.5], expected: 0.5 },
      { input: [10.0, 10.0, 10.0, 1.0], expected: 10.0 },
      { input: [3.0, 8.0, 6.0, 1.5], expected: 0.0 },
    ],
    hint: "Shift the mean by the scaled covariate imbalance.",
  },
  {
    id: "st-419",
    title: "Horvitz Thompson Total",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "The Horvitz-Thompson estimator of a population total weights each sampled unit by the reciprocal of its inclusion probability: sum_i y_i / pi_i.\n\nGiven the values and their inclusion probabilities, return the estimated total.",
    starterCode: `def horvitz_thompson_total(values, probabilities):
    # Your code here
    pass`,
    solution: `def horvitz_thompson_total(values, probabilities):
    return sum(y / p for y, p in zip(values, probabilities))`,
    testCases: [
      { input: [[10, 20], [0.5, 0.5]], expected: 60.0 },
      { input: [[5], [0.1]], expected: 50.0 },
      { input: [[2, 4, 6], [0.25, 0.5, 1.0]], expected: 22.0 },
    ],
    hint: "Rarely sampled units carry more weight.",
  },
  {
    id: "st-420",
    title: "Win Rate Interval Half Width",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "The half width of a normal-approximation interval for a win rate is z * sqrt(p (1 - p) / n).\n\nGiven the win rate, the number of comparisons, and the critical z, return the half width.",
    starterCode: `def win_rate_interval_half_width(win_rate, n, z):
    # Your code here
    pass`,
    solution: `def win_rate_interval_half_width(win_rate, n, z):
    return z * (win_rate * (1.0 - win_rate) / n) ** 0.5`,
    testCases: [
      { input: [0.6, 100, 1.96], expected: 0.09601999791710057 },
      { input: [0.5, 400, 1.645], expected: 0.041125 },
      { input: [0.9, 50, 2.576], expected: 0.10929042410019278 },
    ],
    hint: "It is the standard error scaled by the critical value.",
  },
];
