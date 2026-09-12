import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "ts-226",
    title: "Persistence Baseline RMSE",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the RMSE of the persistence (last value) baseline: the square root of the mean squared one-step change (x[t] - x[t-1])^2.\n\nReturn 0.0 for a series with fewer than two points. This baseline is the bar every forecasting model must clear.",
    starterCode: `def persistence_baseline_rmse(series):
    # Your code here
    pass`,
    solution: `def persistence_baseline_rmse(series):
    n = len(series)
    if n < 2:
        return 0.0
    total = sum((series[t] - series[t - 1]) ** 2 for t in range(1, n))
    return (total / (n - 1)) ** 0.5`,
    testCases: [
      { input: [[1, 3, 6, 10]], expected: 3.1091263510296048 },
      { input: [[5, 5, 5]], expected: 0.0 },
      { input: [[10, 7, 9]], expected: 2.5495097567963922 },
      { input: [[4]], expected: 0.0 },
    ],
    hint: "Squaring before averaging penalizes large one-step jumps.",
  },
  {
    id: "ts-227",
    title: "Seasonal Naive Baseline MSE",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the MSE of the seasonal naive baseline: the mean of (x[t] - x[t-m])^2 over t >= m.\n\nReturn 0.0 if season_length is not positive or the series is not longer than one season.",
    starterCode: `def seasonal_naive_baseline_mse(series, season_length):
    # Your code here
    pass`,
    solution: `def seasonal_naive_baseline_mse(series, season_length):
    n = len(series)
    if season_length <= 0 or n <= season_length:
        return 0.0
    total = sum((series[t] - series[t - season_length]) ** 2 for t in range(season_length, n))
    return total / (n - season_length)`,
    testCases: [
      { input: [[1, 2, 3, 4, 5, 6], 2], expected: 4.0 },
      { input: [[2, 4, 6, 8], 2], expected: 16.0 },
      { input: [[1, 2, 3], 5], expected: 0.0 },
      { input: [[10, 20, 10, 20], 2], expected: 0.0 },
    ],
    hint: "A perfectly repeating seasonal pattern gives zero baseline error.",
  },
  {
    id: "ts-228",
    title: "Moving Average Baseline MSE",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the one-step-ahead MSE of a moving average baseline. For t >= window, forecast x[t] with the mean of the previous window values, and average the squared errors.\n\nReturn 0.0 if window is not positive or is at least the series length.",
    starterCode: `def moving_average_baseline_mse(series, window):
    # Your code here
    pass`,
    solution: `def moving_average_baseline_mse(series, window):
    n = len(series)
    if window <= 0 or window >= n:
        return 0.0
    total = 0.0
    count = 0
    for t in range(window, n):
        forecast = sum(series[t - window:t]) / window
        total += (series[t] - forecast) ** 2
        count += 1
    return total / count`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 2], expected: 2.25 },
      { input: [[1, 1, 1, 1], 2], expected: 0.0 },
      { input: [[1, 2, 1, 2, 1, 2], 2], expected: 0.25 },
      { input: [[5, 5], 2], expected: 0.0 },
    ],
    hint: "The moving average forecast trails a trend, which costs error on trending series.",
  },
  {
    id: "ts-229",
    title: "Exponential Baseline MSE",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the one-step-ahead MSE of a simple exponential smoothing baseline with factor alpha. Seed the level with the first observation; score each later point against the current level, then update the level.\n\nReturn 0.0 for fewer than two points.",
    starterCode: `def exponential_baseline_mse(series, alpha):
    # Your code here
    pass`,
    solution: `def exponential_baseline_mse(series, alpha):
    n = len(series)
    if n < 2:
        return 0.0
    s = series[0]
    total = 0.0
    for x in series[1:]:
        total += (x - s) ** 2
        s = alpha * x + (1 - alpha) * s
    return total / (n - 1)`,
    testCases: [
      { input: [[1, 2, 3, 4], 0.5], expected: 2.1041666666666665 },
      { input: [[5, 5, 5], 0.3], expected: 0.0 },
      { input: [[10], 0.5], expected: 0.0 },
      { input: [[1, 3, 5, 7], 0.8], expected: 5.303466666666666 },
    ],
    hint: "Higher alpha tracks level shifts faster but reacts more to noise.",
  },
  {
    id: "ts-230",
    title: "LSTM Parameter Count for Forecasting",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the number of trainable parameters in a stacked LSTM. Each layer has four gates with hidden_size * (input + hidden_size + 1) weights per gate, where the input size is input_size for the first layer and hidden_size for the rest.\n\nReturn the total parameter count.",
    starterCode: `def lstm_param_count(input_size, hidden_size, layers):
    # Your code here
    pass`,
    solution: `def lstm_param_count(input_size, hidden_size, layers):
    total = 0
    inp = input_size
    for _ in range(layers):
        total += 4 * hidden_size * (inp + hidden_size + 1)
        inp = hidden_size
    return total`,
    testCases: [
      { input: [1, 4, 1], expected: 96 },
      { input: [2, 3, 1], expected: 72 },
      { input: [1, 4, 2], expected: 240 },
      { input: [0, 2, 1], expected: 24 },
    ],
    hint: "The +1 per gate is the bias term.",
  },
  {
    id: "ts-231",
    title: "TCN Receptive Field",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the receptive field of a stack of dilated causal convolutions: 1 + (kernel_size - 1) * sum(dilations).\n\nEach dilation multiplies how far the layer looks back, so the field grows quickly with depth.",
    starterCode: `def tcn_receptive_field(kernel_size, dilations):
    # Your code here
    pass`,
    solution: `def tcn_receptive_field(kernel_size, dilations):
    return 1 + (kernel_size - 1) * sum(dilations)`,
    testCases: [
      { input: [3, [1, 2, 4]], expected: 15 },
      { input: [2, [1, 1, 1]], expected: 4 },
      { input: [3, []], expected: 1 },
      { input: [5, [1, 2]], expected: 13 },
    ],
    hint: "With no layers the field is just the current position.",
  },
  {
    id: "ts-232",
    title: "Patch Count",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute how many patches can be extracted from a series with a given patch length and stride: (length - patch_length) // stride + 1.\n\nReturn 0 when patch_length or stride is not positive, or the series is shorter than one patch.",
    starterCode: `def patch_count(length, patch_length, stride):
    # Your code here
    pass`,
    solution: `def patch_count(length, patch_length, stride):
    if patch_length <= 0 or stride <= 0 or length < patch_length:
        return 0
    return (length - patch_length) // stride + 1`,
    testCases: [
      { input: [10, 4, 2], expected: 4 },
      { input: [10, 10, 1], expected: 1 },
      { input: [10, 3, 3], expected: 3 },
      { input: [2, 5, 1], expected: 0 },
    ],
    hint: "Patch-based transformers tokenize a series the way ViT tokenizes an image.",
  },
  {
    id: "ts-233",
    title: "Attention Weight Sum",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Sum the k largest attention weights, the top-k attention mass. Sort the weights in descending order and sum the first k; when k exceeds the number of weights, use all of them.\n\nReturn 0.0 for empty weights or k <= 0.",
    starterCode: `def attention_weight_sum(weights, k):
    # Your code here
    pass`,
    solution: `def attention_weight_sum(weights, k):
    if not weights or k <= 0:
        return 0.0
    ordered = sorted(weights, reverse=True)
    return sum(ordered[:k])`,
    testCases: [
      { input: [[0.5, 0.3, 0.2], 1], expected: 0.5 },
      { input: [[0.4, 0.4, 0.2], 2], expected: 0.8 },
      { input: [[1.0], 2], expected: 1.0 },
      { input: [[], 3], expected: 0.0 },
    ],
    hint: "A high top-k mass means attention concentrates on few timesteps.",
  },
  {
    id: "ts-234",
    title: "Horizon Linear Weights",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Build normalized linearly decaying horizon weights. The raw weight for horizon h is horizon - h + 1 for h = 1, ..., horizon, divided by the total so the weights sum to 1.\n\nThe nearest horizon receives the largest weight. Return an empty list for horizon <= 0.",
    starterCode: `def horizon_linear_weights(horizon):
    # Your code here
    pass`,
    solution: `def horizon_linear_weights(horizon):
    if horizon <= 0:
        return []
    raw = [horizon - h + 1 for h in range(1, horizon + 1)]
    total = sum(raw)
    return [r / total for r in raw]`,
    testCases: [
      { input: [3], expected: [0.5, 0.3333333333333333, 0.16666666666666666] },
      { input: [1], expected: [1.0] },
      { input: [4], expected: [0.4, 0.3, 0.2, 0.1] },
      { input: [0], expected: [] },
    ],
    hint: "Near horizons are usually easier to forecast, so they get more training weight.",
  },
  {
    id: "ts-235",
    title: "Direct and Recursive Blend",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Combine a recursive multi-step forecast and a direct forecast: weight * direct_value + (1 - weight) * recursive_value.\n\nReturn the blended value. weight = 1 uses only the direct forecast.",
    starterCode: `def direct_recursive_blend(recursive_value, direct_value, weight):
    # Your code here
    pass`,
    solution: `def direct_recursive_blend(recursive_value, direct_value, weight):
    return weight * direct_value + (1 - weight) * recursive_value`,
    testCases: [
      { input: [10, 12, 0.5], expected: 11.0 },
      { input: [10, 12, 1.0], expected: 12.0 },
      { input: [10, 12, 0.0], expected: 10.0 },
      { input: [3, 5, 0.25], expected: 3.5 },
    ],
    hint: "Blending hedges the bias of recursive extrapolation against direct-model variance.",
  },
  {
    id: "ts-236",
    title: "Scheduled Sampling Probability",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the teacher-forcing probability at a training step: clamp(initial_prob + step * rate, 0, 1).\n\nReturn the clamped probability. As training progresses the model relies more on its own predictions.",
    starterCode: `def scheduled_sampling_prob(initial_prob, step, rate):
    # Your code here
    pass`,
    solution: `def scheduled_sampling_prob(initial_prob, step, rate):
    p = initial_prob + step * rate
    if p < 0:
        return 0.0
    if p > 1:
        return 1.0
    return p`,
    testCases: [
      { input: [0.1, 2, 0.1], expected: 0.30000000000000004 },
      { input: [0.9, 5, 0.1], expected: 1.0 },
      { input: [0, 0, 0.2], expected: 0.0 },
      { input: [0.5, 10, 0.0], expected: 0.5 },
    ],
    hint: "A negative rate simulates the reverse schedule, decaying toward zero.",
  },
  {
    id: "ts-237",
    title: "Seq2Seq Decoder Step",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute one recurrent decoder step with a single weight: tanh(weight * hidden + x).\n\nReturn the new hidden value.",
    starterCode: `import math
def seq2seq_decoder_step(hidden, x, weight):
    # Your code here
    pass`,
    solution: `import math
def seq2seq_decoder_step(hidden, x, weight):
    return math.tanh(weight * hidden + x)`,
    testCases: [
      { input: [0, 1, 0.5], expected: 0.7615941559557649 },
      { input: [1, 0, 1.0], expected: 0.7615941559557649 },
      { input: [0, 0, 0.5], expected: 0.0 },
      { input: [1, 1, 0.5], expected: 0.9051482536448664 },
    ],
    hint: "tanh squashes the pre-activation into (-1, 1).",
  },
  {
    id: "ts-238",
    title: "Windowing Count",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Count supervised windows consisting of a lookback block followed by horizon target values: (n - lookback - horizon) // stride + 1.\n\nReturn 0 when any parameter is not positive or no full window fits in the series.",
    starterCode: `def windowing_count(n, lookback, horizon, stride):
    # Your code here
    pass`,
    solution: `def windowing_count(n, lookback, horizon, stride):
    if lookback <= 0 or horizon <= 0 or stride <= 0:
        return 0
    count = (n - lookback - horizon) // stride + 1
    if count < 0:
        return 0
    return count`,
    testCases: [
      { input: [100, 24, 12, 1], expected: 65 },
      { input: [100, 90, 12, 1], expected: 0 },
      { input: [50, 10, 5, 5], expected: 8 },
      { input: [10, 10, 0, 1], expected: 0 },
    ],
    hint: "Both the lookback and the horizon must fit inside the series.",
  },
  {
    id: "ts-239",
    title: "Series Padding",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Right-pad a series with pad_value until it reaches target_length. If the series is already at least that long, return it unchanged.\n\nReturn the padded list.",
    starterCode: `def series_padding(series, target_length, pad_value):
    # Your code here
    pass`,
    solution: `def series_padding(series, target_length, pad_value):
    out = list(series)
    while len(out) < target_length:
        out.append(pad_value)
    return out`,
    testCases: [
      { input: [[1, 2, 3], 5, 0], expected: [1, 2, 3, 0, 0] },
      { input: [[1, 2], 2, 9], expected: [1, 2] },
      { input: [[1, 2], 4, -1], expected: [1, 2, -1, -1] },
      { input: [[], 3, 0.5], expected: [0.5, 0.5, 0.5] },
    ],
    hint: "Padding aligns variable-length series for batched training.",
  },
  {
    id: "ts-240",
    title: "Rolling Stats Features",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Compute the mean and population standard deviation of the most recent window of the series as [mean, std].\n\nReturn an empty list if window is not positive or exceeds the series length.",
    starterCode: `def rolling_stats_features(series, window):
    # Your code here
    pass`,
    solution: `def rolling_stats_features(series, window):
    if window <= 0 or window > len(series):
        return []
    w = series[-window:]
    m = sum(w) / window
    sd = (sum((x - m) ** 2 for x in w) / window) ** 0.5
    return [m, sd]`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 3], expected: [4.0, 0.816496580927726] },
      { input: [[5, 5, 5], 2], expected: [5.0, 0.0] },
      { input: [[1, 2], 0], expected: [] },
      { input: [[1, 2, 3], 3], expected: [2.0, 0.816496580927726] },
    ],
    hint: "Window statistics are a cheap hand-crafted feature set for neural models.",
  },
  {
    id: "ts-241",
    title: "Trend Removal",
    category: "Time Series",
    difficulty: "Easy",
    description:
      "Remove a known linear trend from a series: x[t] - (intercept + slope * t) for t = 0, ..., n-1.\n\nReturn the detrended series. Neural forecasters often model the detrended residual and add the trend back.",
    starterCode: `def trend_removal(series, slope, intercept):
    # Your code here
    pass`,
    solution: `def trend_removal(series, slope, intercept):
    return [series[t] - (intercept + slope * t) for t in range(len(series))]`,
    testCases: [
      { input: [[1, 2, 3], 1, 0], expected: [1, 1, 1] },
      { input: [[10, 20, 30], 10, 10], expected: [0, 0, 0] },
      { input: [[5, 5], 0, 5], expected: [0, 0] },
      { input: [[], 1, 1], expected: [] },
    ],
    hint: "Subtracting the fitted line makes the series stationary in the mean.",
  },
  {
    id: "ts-242",
    title: "Transformer Context Window",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Estimate the effective context of stacked strided attention layers: 1 + (window - 1) * (1 + stride * (layers - 1)).\n\nReturn the effective context length in positions. Each extra layer expands the reach of a token.",
    starterCode: `def transformer_context_window(layers, window, stride):
    # Your code here
    pass`,
    solution: `def transformer_context_window(layers, window, stride):
    return 1 + (window - 1) * (1 + stride * (layers - 1))`,
    testCases: [
      { input: [2, 3, 1], expected: 5 },
      { input: [3, 3, 2], expected: 11 },
      { input: [1, 5, 2], expected: 5 },
      { input: [0, 1, 2], expected: 1 },
    ],
    hint: "Even a single attentive layer with window w already spans w positions.",
  },
  {
    id: "ts-243",
    title: "Sparse Attention Count",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Count the nonzero entries of a local attention matrix: each of the n tokens attends to min(window, n) tokens, so the count is n * min(window, n).\n\nReturn 0 when n or window is not positive.",
    starterCode: `def sparse_attention_count(n, window):
    # Your code here
    pass`,
    solution: `def sparse_attention_count(n, window):
    if n <= 0 or window <= 0:
        return 0
    return n * min(window, n)`,
    testCases: [
      { input: [10, 3], expected: 30 },
      { input: [4, 10], expected: 16 },
      { input: [0, 3], expected: 0 },
      { input: [5, 1], expected: 5 },
    ],
    hint: "Sparse attention cuts the quadratic n^2 cost down to n * window.",
  },
  {
    id: "ts-244",
    title: "N-BEATS Basis Count",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Count the basis coefficients in an N-BEATS-style model: blocks * terms.\n\nReturn the product. Each block expresses its forecast in the same shared basis.",
    starterCode: `def nbeats_basis_count(blocks, terms):
    # Your code here
    pass`,
    solution: `def nbeats_basis_count(blocks, terms):
    return blocks * terms`,
    testCases: [
      { input: [3, 8], expected: 24 },
      { input: [1, 1], expected: 1 },
      { input: [0, 5], expected: 0 },
      { input: [2, 0], expected: 0 },
    ],
    hint: "The count is the total size of the basis mixing layer in the ensemble of blocks.",
  },
  {
    id: "ts-245",
    title: "Multi-Rate Sampling Count",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Count samples produced by downsampling a series at several rates: sum of n // rate over the positive rates in the list.\n\nNon-positive rates are ignored.",
    starterCode: `def multi_rate_sampling_count(n, rates):
    # Your code here
    pass`,
    solution: `def multi_rate_sampling_count(n, rates):
    total = 0
    for r in rates:
        if r > 0:
            total += n // r
    return total`,
    testCases: [
      { input: [100, [1, 10]], expected: 110 },
      { input: [24, [2, 3, 4]], expected: 26 },
      { input: [10, []], expected: 0 },
      { input: [5, [3]], expected: 1 },
    ],
    hint: "Multi-rate views let one model see short and long horizons simultaneously.",
  },
  {
    id: "ts-246",
    title: "DeepAR Gaussian NLL",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the mean Gaussian negative log likelihood used by DeepAR: 0.5 * (ln(2*pi) + 2*ln(sigma) + (y - mu)^2 / sigma^2), averaged over observations.\n\nReturn 0.0 for empty observations or non-positive sigma.",
    starterCode: `import math
def deepar_gaussian_nll(observations, mu, sigma):
    # Your code here
    pass`,
    solution: `import math
def deepar_gaussian_nll(observations, mu, sigma):
    if not observations or sigma <= 0:
        return 0.0
    total = 0.0
    for y in observations:
        total += 0.5 * (math.log(2.0 * math.pi) + 2.0 * math.log(sigma) + (y - mu) ** 2 / (sigma * sigma))
    return total / len(observations)`,
    testCases: [
      { input: [[0], 0, 1], expected: 0.9189385332046727 },
      { input: [[1], 0, 1], expected: 1.4189385332046727 },
      { input: [[0, 0], 0, 2], expected: 1.612085713764618 },
      { input: [[5], 5, 0], expected: 0.0 },
    ],
    hint: "DeepAR learns mu and sigma at each step and minimizes this loss.",
  },
  {
    id: "ts-247",
    title: "Ensemble Error Ratio Weight",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute the weight on the statistical forecast from the two mean errors: err_neural / (err_stat + err_neural).\n\nReturn 0.5 when both errors are non-positive. The larger a model's error, the smaller its weight.",
    starterCode: `def ensemble_error_ratio_weight(err_stat, err_neural):
    # Your code here
    pass`,
    solution: `def ensemble_error_ratio_weight(err_stat, err_neural):
    total = err_stat + err_neural
    if total <= 0:
        return 0.5
    return err_neural / total`,
    testCases: [
      { input: [1, 3], expected: 0.75 },
      { input: [2, 2], expected: 0.5 },
      { input: [0, 4], expected: 1.0 },
      { input: [5, 0], expected: 0.0 },
    ],
    hint: "This is a simple, robust alternative to inverse-variance weighting.",
  },
  {
    id: "ts-248",
    title: "Quantile Crossing Fix",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Fix crossing quantile forecasts by returning [min(q_low, q_high), max(q_low, q_high)].\n\nThe lower quantile is always first in the result, restoring monotonicity.",
    starterCode: `def quantile_crossing_fix(q_low, q_high):
    # Your code here
    pass`,
    solution: `def quantile_crossing_fix(q_low, q_high):
    if q_low <= q_high:
        return [q_low, q_high]
    return [q_high, q_low]`,
    testCases: [
      { input: [0.1, 0.9], expected: [0.1, 0.9] },
      { input: [0.8, 0.2], expected: [0.2, 0.8] },
      { input: [0.5, 0.5], expected: [0.5, 0.5] },
      { input: [-0.5, 0.5], expected: [-0.5, 0.5] },
    ],
    hint: "Independent per-quantile models can cross; sorting pairs repairs it.",
  },
  {
    id: "ts-249",
    title: "RevIN Normalize",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Apply reversible instance normalization to a window: subtract the mean and divide by the population standard deviation.\n\nReturn a list of zeros when the standard deviation is zero, and an empty list for an empty window.",
    starterCode: `def revin_normalize(window):
    # Your code here
    pass`,
    solution: `def revin_normalize(window):
    if not window:
        return []
    m = sum(window) / len(window)
    sd = (sum((x - m) ** 2 for x in window) / len(window)) ** 0.5
    if sd == 0:
        return [0.0] * len(window)
    return [(x - m) / sd for x in window]`,
    testCases: [
      { input: [[1, 2, 3]], expected: [-1.224744871391589, 0.0, 1.224744871391589] },
      { input: [[5, 5, 5]], expected: [0.0, 0.0, 0.0] },
      { input: [[1, 1, 2, 2]], expected: [-1.0, -1.0, 1.0, 1.0] },
      { input: [[]], expected: [] },
    ],
    hint: "RevIN normalizes each input window and reverses the transform on the output.",
  },
  {
    id: "ts-250",
    title: "RevIN Denormalize",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Invert reversible instance normalization: value * std + mean for each value.\n\nReturn the denormalized list, restoring the original level and scale.",
    starterCode: `def revin_denormalize(normalized, mean, std):
    # Your code here
    pass`,
    solution: `def revin_denormalize(normalized, mean, std):
    return [v * std + mean for v in normalized]`,
    testCases: [
      { input: [[0], 5, 2], expected: [5] },
      { input: [[-1, 1], 10, 2], expected: [8, 12] },
      { input: [[], 1, 1], expected: [] },
      { input: [[0.5], 0, 1], expected: [0.5] },
    ],
    hint: "The inverse uses the window statistics saved at normalization time.",
  },
  {
    id: "ts-251",
    title: "Residual Modeling",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Add a residual forecast to a base forecast elementwise: base + residual.\n\nReturn the combined forecast; zip truncates to the shorter list. This is the hybrid pattern of a structural model plus a learned residual correction.",
    starterCode: `def residual_modeling(base_forecast, residual_forecast):
    # Your code here
    pass`,
    solution: `def residual_modeling(base_forecast, residual_forecast):
    return [b + r for b, r in zip(base_forecast, residual_forecast)]`,
    testCases: [
      { input: [[1, 2], [0.5, 0.5]], expected: [1.5, 2.5] },
      { input: [[5, 5, 5], [0, 0, 0]], expected: [5, 5, 5] },
      { input: [[1], [1]], expected: [2] },
      { input: [[], []], expected: [] },
    ],
    hint: "The base model captures structure; the residual model captures what is left.",
  },
  {
    id: "ts-252",
    title: "Static Covariate Embedding Count",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Count the embedding parameters for static covariates: sum of cardinality * embedding_dim elementwise.\n\nReturn the total count. Static covariates do not change over time.",
    starterCode: `def static_covariate_embedding_count(cardinalities, embedding_dims):
    # Your code here
    pass`,
    solution: `def static_covariate_embedding_count(cardinalities, embedding_dims):
    return sum(c * d for c, d in zip(cardinalities, embedding_dims))`,
    testCases: [
      { input: [[10, 5], [4, 2]], expected: 50 },
      { input: [[3], [1]], expected: 3 },
      { input: [[], []], expected: 0 },
      { input: [[100], [8]], expected: 800 },
    ],
    hint: "Each categorical variable costs one row of embedding weights per category.",
  },
  {
    id: "ts-253",
    title: "Known Future Covariate Use",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Apply known future covariates as a dot product: sum(value * weight).\n\nThese covariates, such as planned promotions or calendar effects, are known ahead of the forecast origin.",
    starterCode: `def known_future_covariate_use(future_values, weights):
    # Your code here
    pass`,
    solution: `def known_future_covariate_use(future_values, weights):
    return sum(v * w for v, w in zip(future_values, weights))`,
    testCases: [
      { input: [[1, 2, 3], [0.5, 0.5, 0.5]], expected: 3.0 },
      { input: [[0, 0], [1, 2]], expected: 0 },
      { input: [[5], [2]], expected: 10 },
      { input: [[], []], expected: 0 },
    ],
    hint: "Known-future inputs shift the forecast before any observation arrives.",
  },
  {
    id: "ts-254",
    title: "Promotion Feature Effect",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Apply a promotion lift to base demand: base_demand * (1 + lift * promo_flag).\n\npromo_flag is 0 or 1, so the lift only applies during promotions. Return the adjusted demand.",
    starterCode: `def promotion_feature_effect(base_demand, lift, promo_flag):
    # Your code here
    pass`,
    solution: `def promotion_feature_effect(base_demand, lift, promo_flag):
    return base_demand * (1.0 + lift * promo_flag)`,
    testCases: [
      { input: [100, 0.2, 1], expected: 120.0 },
      { input: [100, 0.2, 0], expected: 100.0 },
      { input: [0, 0.5, 1], expected: 0.0 },
      { input: [50, -0.1, 1], expected: 45.0 },
    ],
    hint: "A negative lift models a cannibalization or price increase effect.",
  },
  {
    id: "ts-255",
    title: "Price Elasticity",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Compute demand after a price change under constant elasticity: demand0 * (price1 / price0)^elasticity.\n\nReturn 0.0 when price0 is not positive. A typical elasticity is negative, so raising price lowers demand.",
    starterCode: `def price_elasticity(demand0, price0, price1, elasticity):
    # Your code here
    pass`,
    solution: `def price_elasticity(demand0, price0, price1, elasticity):
    if price0 <= 0:
        return 0.0
    return demand0 * (price1 / price0) ** elasticity`,
    testCases: [
      { input: [100, 10, 11, -1.5], expected: 86.67841720414474 },
      { input: [100, 10, 9, -1.5], expected: 117.12139482105108 },
      { input: [50, 0, 5, -1], expected: 0.0 },
      { input: [10, 2, 2, -2], expected: 10.0 },
    ],
    hint: "Demand forecasting pipelines often include price as a causal driver.",
  },
  {
    id: "ts-256",
    title: "Weather Feature Lag",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Shift a weather feature series forward by lag: return temperatures[:n-lag].\n\nFor lag <= 0 return a copy unchanged; return an empty list when lag is at least the series length. Weather effects on demand are usually delayed.",
    starterCode: `def weather_feature_lag(temperatures, lag):
    # Your code here
    pass`,
    solution: `def weather_feature_lag(temperatures, lag):
    if lag <= 0:
        return list(temperatures)
    if lag >= len(temperatures):
        return []
    return temperatures[:len(temperatures) - lag]`,
    testCases: [
      { input: [[10, 11, 12, 13], 1], expected: [10, 11, 12] },
      { input: [[10, 11, 12], 2], expected: [10] },
      { input: [[1], 2], expected: [] },
      { input: [[1, 2], 0], expected: [1, 2] },
    ],
    hint: "The lagged feature at time t is the weather observed lag periods earlier.",
  },
  {
    id: "ts-257",
    title: "Lag Selection Autocorr",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Select the lag with the strongest absolute sample autocorrelation for lags 1..max_lag, using the biased estimator. Ties keep the smallest lag.\n\nReturn 1 when the series is constant (zero variance); return 0 for fewer than three points or max_lag < 1.",
    starterCode: `def lag_selection_autocorr(series, max_lag):
    # Your code here
    pass`,
    solution: `def lag_selection_autocorr(series, max_lag):
    n = len(series)
    if n < 3 or max_lag < 1:
        return 0
    m = sum(series) / n
    g0 = sum((x - m) ** 2 for x in series) / n
    if g0 == 0:
        return 1
    best_k = 1
    best = -1.0
    limit = min(max_lag, n - 1)
    for k in range(1, limit + 1):
        gk = sum((series[t] - m) * (series[t + k] - m) for t in range(n - k)) / n
        value = abs(gk / g0)
        if value > best + 1e-12:
            best = value
            best_k = k
    return best_k`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 3], expected: 1 },
      { input: [[1, 2, 1, 2, 1, 2], 4], expected: 1 },
      { input: [[5, 5, 5, 5], 3], expected: 1 },
      { input: [[1, 2, 3], 3], expected: 2 },
    ],
    hint: "The strongest autocorrelation suggests the most useful lagged input.",
  },
  {
    id: "ts-258",
    title: "Day-of-Week Embedding",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Build a one-hot day-of-week embedding of length embedding_dim with a 1 at index day_index % embedding_dim.\n\nReturn an empty list for non-positive embedding_dim. This is how a model learns a separate effect per weekday.",
    starterCode: `def day_of_week_embedding(day_index, embedding_dim):
    # Your code here
    pass`,
    solution: `def day_of_week_embedding(day_index, embedding_dim):
    if embedding_dim <= 0:
        return []
    vec = [0.0] * embedding_dim
    vec[day_index % embedding_dim] = 1.0
    return vec`,
    testCases: [
      { input: [0, 4], expected: [1.0, 0.0, 0.0, 0.0] },
      { input: [3, 4], expected: [0.0, 0.0, 0.0, 1.0] },
      { input: [9, 4], expected: [0.0, 1.0, 0.0, 0.0] },
      { input: [-1, 4], expected: [0.0, 0.0, 0.0, 1.0] },
    ],
    hint: "Negative indices wrap via the modulo operator.",
  },
  {
    id: "ts-259",
    title: "Fourier Features",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Build Fourier features at time t: for harmonics h = 1..harmonics append sin(2*pi*h*t/period) and cos(2*pi*h*t/period).\n\nReturn an empty list when period is not positive or harmonics < 1. Fourier terms let linear models fit smooth seasonality.",
    starterCode: `import math
def fourier_features(t, period, harmonics):
    # Your code here
    pass`,
    solution: `import math
def fourier_features(t, period, harmonics):
    if period <= 0 or harmonics < 1:
        return []
    out = []
    for h in range(1, harmonics + 1):
        angle = 2.0 * math.pi * h * t / period
        out.append(math.sin(angle))
        out.append(math.cos(angle))
    return out`,
    testCases: [
      { input: [0, 4, 2], expected: [0.0, 1.0, 0.0, 1.0] },
      { input: [1, 4, 1], expected: [1.0, 6.123233995736766e-17] },
      {
        input: [1, 4, 2],
        expected: [1.0, 6.123233995736766e-17, 1.2246467991473532e-16, -1.0],
      },
      { input: [0, 0, 2], expected: [] },
    ],
    hint: "Each harmonic contributes a sine-cosine pair, so the vector length is 2 * harmonics.",
  },
  {
    id: "ts-260",
    title: "Time Encoding Features",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Encode a timestamp with a single seasonal cycle: [sin(2*pi*t/max_period), cos(2*pi*t/max_period)].\n\nReturn an empty list when max_period is not positive. The pair places each timestamp on a circle so the encoding wraps smoothly.",
    starterCode: `import math
def time_encoding_features(t, max_period):
    # Your code here
    pass`,
    solution: `import math
def time_encoding_features(t, max_period):
    if max_period <= 0:
        return []
    angle = 2.0 * math.pi * t / max_period
    return [math.sin(angle), math.cos(angle)]`,
    testCases: [
      { input: [0, 24], expected: [0.0, 1.0] },
      { input: [6, 24], expected: [1.0, 6.123233995736766e-17] },
      { input: [12, 24], expected: [1.2246467991473532e-16, -1.0] },
      { input: [5, 0], expected: [] },
    ],
    hint: "Sinusoidal encodings avoid the discontinuity of raw hour or month numbers.",
  },
  {
    id: "ts-261",
    title: "Retrain Cadence",
    category: "Time Series",
    difficulty: "Medium",
    description:
      "Decide whether a model should be retrained: return True when the model age in periods is at least the retraining threshold.\n\nThe comparison is inclusive, so age equal to the threshold triggers retraining.",
    starterCode: `def retrain_cadence(age, threshold):
    # Your code here
    pass`,
    solution: `def retrain_cadence(age, threshold):
    return age >= threshold`,
    testCases: [
      { input: [10, 10], expected: true },
      { input: [9, 10], expected: false },
      { input: [0, 0], expected: true },
      { input: [5, -1], expected: true },
    ],
    hint: "A negative threshold means retrain immediately on any age.",
  },
  {
    id: "ts-262",
    title: "Negative Binomial Log-Likelihood",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Compute the negative binomial log likelihood for a count k with dispersion r and success probability p: lgamma(k + r) - lgamma(r) - lgamma(k + 1) + r * ln(1 - p) + k * ln(p).\n\nReturn 0.0 for invalid parameters: r <= 0, k < 0, or p outside the open interval (0, 1).",
    starterCode: `import math
def negative_binomial_loglik(k, r, p):
    # Your code here
    pass`,
    solution: `import math
def negative_binomial_loglik(k, r, p):
    if r <= 0 or k < 0 or p <= 0 or p >= 1:
        return 0.0
    return math.lgamma(k + r) - math.lgamma(r) - math.lgamma(k + 1) + r * math.log(1.0 - p) + k * math.log(p)`,
    testCases: [
      { input: [0, 1, 0.5], expected: -0.6931471805599453 },
      { input: [1, 1, 0.5], expected: -1.3862943611198906 },
      { input: [2, 2, 0.5], expected: -1.6739764335716711 },
      { input: [1, 1, 0], expected: 0.0 },
    ],
    hint: "The dispersion r lets the variance exceed the mean, unlike Poisson.",
  },
  {
    id: "ts-263",
    title: "Quantile Loss Multi-Horizon",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Compute the mean pinball loss over multiple horizons and quantiles. actual[t] is compared with forecasts[t][qi] at quantile quantiles[qi]: add q * d when d = actual - forecast >= 0, otherwise (q - 1) * d.\n\nReturn the average over all horizon-quantile pairs, or 0.0 for empty inputs.",
    starterCode: `def quantile_loss_multi_horizon(actual, forecasts, quantiles):
    # Your code here
    pass`,
    solution: `def quantile_loss_multi_horizon(actual, forecasts, quantiles):
    if not actual or not forecasts or not quantiles:
        return 0.0
    total = 0.0
    count = 0
    horizon = min(len(actual), len(forecasts))
    for t in range(horizon):
        for qi in range(len(quantiles)):
            q = quantiles[qi]
            a = actual[t]
            f = forecasts[t][qi]
            d = a - f
            if d >= 0:
                total += q * d
            else:
                total += (q - 1.0) * d
            count += 1
    return total / count`,
    testCases: [
      { input: [[10, 12], [[11, 9], [10, 13]], [0.5, 0.5]], expected: 0.625 },
      { input: [[5], [[6, 4]], [0.1, 0.9]], expected: 0.9 },
      { input: [[1, 2, 3], [[1, 1], [2, 2], [3, 3]], [0.5]], expected: 0.0 },
      { input: [[], [], [0.5]], expected: 0.0 },
    ],
    hint: "Each horizon can use its own quantile grid, which is how multi-horizon quantile models train.",
  },
  {
    id: "ts-264",
    title: "Residual Bootstrap Mean",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Build a bootstrap mean forecast: seed the random generator, sample residuals with replacement `paths` times, and return point_forecast + the mean of the sampled residuals.\n\nReturn point_forecast when residuals is empty or paths <= 0.",
    starterCode: `import random
def residual_bootstrap_mean(point_forecast, residuals, seed, paths):
    # Your code here
    pass`,
    solution: `import random
def residual_bootstrap_mean(point_forecast, residuals, seed, paths):
    if not residuals or paths <= 0:
        return point_forecast
    random.seed(seed)
    total = 0.0
    for _ in range(paths):
        total += residuals[random.randrange(len(residuals))]
    return point_forecast + total / paths`,
    testCases: [
      { input: [10, [-1, 0, 1], 42, 5], expected: 10.0 },
      { input: [0, [2, 4], 7, 4], expected: 3.0 },
      { input: [5, [], 1, 3], expected: 5 },
      { input: [3, [1], 9, 2], expected: 4.0 },
    ],
    hint: "Seeding inside the function keeps bootstrap forecasts reproducible.",
  },
  {
    id: "ts-265",
    title: "Performance Decay Monitor",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Monitor model decay: compare the mean error of the last window against the mean error of the first window times threshold. Return True when recent > baseline * threshold.\n\nReturn False when errors is shorter than window or window is not positive. If the baseline is non-positive, return True only when the recent mean is positive.",
    starterCode: `def performance_decay_monitor(errors, window, threshold):
    # Your code here
    pass`,
    solution: `def performance_decay_monitor(errors, window, threshold):
    n = len(errors)
    if window <= 0 or n < window:
        return False
    baseline = sum(errors[:window]) / window
    recent = sum(errors[n - window:]) / window
    if baseline <= 0:
        return recent > 0
    return recent > baseline * threshold`,
    testCases: [
      { input: [[0.1, 0.1, 0.1, 0.3, 0.3, 0.3], 3, 2.0], expected: true },
      { input: [[1, 1, 1, 1], 2, 2.0], expected: false },
      { input: [[1, 2], 1, 1.5], expected: true },
      { input: [[], 3, 2], expected: false },
    ],
    hint: "A threshold of 2 flags when recent error has doubled versus the baseline.",
  },
  {
    id: "ts-266",
    title: "Walk-Forward Efficiency",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Compute walk-forward efficiency as 1 - mean(oos_errors) / mean(is_errors).\n\nReturn 0.0 when either list is empty or the in-sample mean is zero. Negative values mean out-of-sample performance degraded relative to in-sample.",
    starterCode: `def walk_forward_efficiency(is_errors, oos_errors):
    # Your code here
    pass`,
    solution: `def walk_forward_efficiency(is_errors, oos_errors):
    if not is_errors or not oos_errors:
        return 0.0
    mean_is = sum(is_errors) / len(is_errors)
    mean_oos = sum(oos_errors) / len(oos_errors)
    if mean_is == 0:
        return 0.0
    return 1.0 - mean_oos / mean_is`,
    testCases: [
      { input: [[1, 1, 1], [1.2, 1.2, 1.2]], expected: -0.19999999999999996 },
      { input: [[2, 2], [2, 2]], expected: 0.0 },
      { input: [[1, 2], [3]], expected: -1.0 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "A value near 0 means performance held up out of sample.",
  },
  {
    id: "ts-267",
    title: "Online Update Step",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Perform one SGD-with-momentum update: v_new = momentum * velocity + grad, then theta_new = theta - lr * v_new.\n\nReturn [theta_new, v_new]. The velocity carries over across updates.",
    starterCode: `def online_update_step(theta, grad, lr, momentum, velocity):
    # Your code here
    pass`,
    solution: `def online_update_step(theta, grad, lr, momentum, velocity):
    v_new = momentum * velocity + grad
    theta_new = theta - lr * v_new
    return [theta_new, v_new]`,
    testCases: [
      { input: [1, 0.5, 0.1, 0.9, 0], expected: [0.95, 0.5] },
      { input: [0, 1, 0.01, 0.0, 0], expected: [-0.01, 1.0] },
      { input: [1, 0, 0.1, 0.9, 2], expected: [0.82, 1.8] },
      { input: [2, 1, 0.5, 0.5, 1], expected: [1.25, 1.5] },
    ],
    hint: "Momentum smoothly accumulates recent gradients into the step direction.",
  },
  {
    id: "ts-268",
    title: "Backtest Window Ranges",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Generate rolling backtest window ranges as [start, end) pairs. Start at 0 and advance by step while end = start + window fits inside the series.\n\nReturn an empty list when window or step is not positive, or window exceeds the series length.",
    starterCode: `def backtest_window_ranges(n, window, step):
    # Your code here
    pass`,
    solution: `def backtest_window_ranges(n, window, step):
    if window <= 0 or step <= 0 or window > n:
        return []
    out = []
    start = 0
    while start + window <= n:
        out.append([start, start + window])
        start += step
    return out`,
    testCases: [
      { input: [10, 4, 3], expected: [[0, 4], [3, 7], [6, 10]] },
      { input: [5, 5, 1], expected: [[0, 5]] },
      { input: [10, 20, 1], expected: [] },
      { input: [4, 2, 2], expected: [[0, 2], [2, 4]] },
    ],
    hint: "Each window is a half-open interval, consistent with Python slicing.",
  },
  {
    id: "ts-269",
    title: "TFT Variable Selection Weights",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Compute TFT-style variable selection weights: apply a softmax to the scores and return the top_k weights in descending order.\n\nReturn an empty list for empty scores or top_k <= 0. The exponential shift by the maximum keeps the computation stable.",
    starterCode: `import math
def tft_variable_selection_weights(scores, top_k):
    # Your code here
    pass`,
    solution: `import math
def tft_variable_selection_weights(scores, top_k):
    if not scores or top_k <= 0:
        return []
    mx = max(scores)
    exps = [math.exp(s - mx) for s in scores]
    total = sum(exps)
    weights = sorted([e / total for e in exps], reverse=True)
    return weights[:top_k]`,
    testCases: [
      { input: [[1, 2, 3], 2], expected: [0.6652409557748218, 0.24472847105479764] },
      { input: [[0, 0], 1], expected: [0.5] },
      { input: [[], 2], expected: [] },
      { input: [[5, 5, 5], 3], expected: [0.3333333333333333, 0.3333333333333333, 0.3333333333333333] },
    ],
    hint: "Softmax weights always sum to 1 before truncation.",
  },
  {
    id: "ts-270",
    title: "Cross-Learning Sample Count",
    category: "Time Series",
    difficulty: "Hard",
    description:
      "Count training windows when multiple series are pooled for cross-learning: n_series * ((length - window) // stride + 1).\n\nReturn 0 when window or stride is not positive, or when length is shorter than the window. Pooling lets sporadic series borrow strength from each other.",
    starterCode: `def cross_learning_sample_count(n_series, length, window, stride):
    # Your code here
    pass`,
    solution: `def cross_learning_sample_count(n_series, length, window, stride):
    if window <= 0 or stride <= 0 or length < window:
        return 0
    per_series = (length - window) // stride + 1
    return n_series * per_series`,
    testCases: [
      { input: [10, 100, 24, 1], expected: 770 },
      { input: [3, 50, 10, 5], expected: 27 },
      { input: [5, 10, 10, 1], expected: 5 },
      { input: [2, 10, 11, 1], expected: 0 },
    ],
    hint: "Global models see the union of all series' windows during training.",
  },
];
