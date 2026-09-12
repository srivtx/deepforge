import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "cv-261",
    title: "Image Size Distribution Stats",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Summarize the distribution of image sizes in a dataset.\n\nsizes is a list of [height, width] pairs. Return [min_h, max_h, min_w, max_w, mean_h, mean_w] with the means rounded to 4 decimal places.",
    starterCode: `def size_stats(sizes):
    # Your code here
    pass`,
    solution: `def size_stats(sizes):
    hs = [s[0] for s in sizes]
    ws = [s[1] for s in sizes]
    return [min(hs), max(hs), min(ws), max(ws),
            round(sum(hs) / len(hs), 4), round(sum(ws) / len(ws), 4)]`,
    testCases: [
      { input: [[[100, 200], [120, 240], [80, 160]]], expected: [80, 120, 160, 240, 100.0, 200.0] },
      { input: [[[32, 32]]], expected: [32, 32, 32, 32, 32.0, 32.0] },
      { input: [[[50, 100], [200, 300], [150, 200]]], expected: [50, 200, 100, 300, 133.3333, 200.0] },
    ],
  },
  {
    id: "cv-262",
    title: "Resize Target Selection",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Choose a resize target that fixes the short side but caps the long side.\n\nScale so the short side becomes short_target, then if the long side would exceed max_target scale the result down so the long side equals max_target. Round dimensions to integers and return [new_h, new_w].",
    starterCode: `def select_resize_target(h, w, short_target, max_target):
    # Your code here
    pass`,
    solution: `def select_resize_target(h, w, short_target, max_target):
    scale = short_target / min(h, w)
    new_h = round(h * scale)
    new_w = round(w * scale)
    longest = max(new_h, new_w)
    if longest > max_target:
        scale2 = max_target / longest
        new_h = round(new_h * scale2)
        new_w = round(new_w * scale2)
    return [new_h, new_w]`,
    testCases: [
      { input: [100, 200, 64, 256], expected: [64, 128] },
      { input: [200, 100, 64, 64], expected: [64, 32] },
      { input: [50, 50, 100, 200], expected: [100, 100] },
      { input: [300, 400, 100, 150], expected: [100, 133] },
    ],
  },
  {
    id: "cv-263",
    title: "Calibration Sample Count",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Estimate how many calibration samples are needed to observe a rare case.\n\nReturn the smallest n with 1 - (1 - frequency)^n >= confidence, computed as ceil(log(1 - confidence) / log(1 - frequency)). Return 0 when frequency or confidence is not positive, and 1 when frequency >= 1.",
    starterCode: `def calibration_samples(confidence, frequency):
    # Your code here
    pass`,
    solution: `def calibration_samples(confidence, frequency):
    import math
    if frequency <= 0 or confidence <= 0:
        return 0
    if frequency >= 1:
        return 1
    return int(math.ceil(math.log(1 - confidence) / math.log(1 - frequency)))`,
    testCases: [
      { input: [0.95, 0.01], expected: 299 },
      { input: [0.99, 0.001], expected: 4603 },
      { input: [0.5, 0.1], expected: 7 },
      { input: [0.95, 0.0], expected: 0 },
    ],
  },
  {
    id: "cv-264",
    title: "PTQ vs QAT Accuracy Delta",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Compute the accuracy improvement of quantization-aware training over post-training quantization.\n\nReturn round(qat_accuracy - ptq_accuracy, 4).",
    starterCode: `def ptq_qat_delta(ptq_accuracy, qat_accuracy):
    # Your code here
    pass`,
    solution: `def ptq_qat_delta(ptq_accuracy, qat_accuracy):
    return round(qat_accuracy - ptq_accuracy, 4)`,
    testCases: [
      { input: [0.71, 0.7523], expected: 0.0423 },
      { input: [0.9, 0.9], expected: 0.0 },
      { input: [0.6, 0.55], expected: -0.05 },
    ],
  },
  {
    id: "cv-265",
    title: "Operator Fusion Pairs",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Count the adjacent operator pairs that a graph optimizer can fuse.\n\nA pair can be fused when it is (conv, bn), (bn, relu) or (conv, relu). Return the number of such adjacent pairs in the op list.",
    starterCode: `def fusion_pairs(ops):
    # Your code here
    pass`,
    solution: `def fusion_pairs(ops):
    fusable = {("conv", "bn"), ("bn", "relu"), ("conv", "relu")}
    return sum(1 for i in range(len(ops) - 1) if (ops[i], ops[i + 1]) in fusable)`,
    testCases: [
      { input: [["conv", "bn", "relu"]], expected: 2 },
      { input: [["conv", "relu", "conv", "relu"]], expected: 2 },
      { input: [["bn", "conv"]], expected: 0 },
      { input: [[]], expected: 0 },
    ],
  },
  {
    id: "cv-266",
    title: "Lottery Ticket Mask Ratio",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Compute the fraction of weights that a magnitude pruning mask removes.\n\nReturn the proportion of weights whose absolute value is strictly below threshold, rounded to 4 decimal places.",
    starterCode: `def mask_ratio(weights, threshold):
    # Your code here
    pass`,
    solution: `def mask_ratio(weights, threshold):
    below = sum(1 for w in weights if abs(w) < threshold)
    return round(below / len(weights), 4)`,
    testCases: [
      { input: [[0.1, -0.5, 0.05, 0.9], 0.2], expected: 0.5 },
      { input: [[0.1, -0.5, 0.05, 0.9], 0.05], expected: 0.0 },
      { input: [[0.1, -0.5, 0.05, 0.9], 1.0], expected: 1.0 },
    ],
  },
  {
    id: "cv-267",
    title: "Teacher Ensemble Soft Labels",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Average the soft predictions of several teacher models into one target distribution.\n\nprob_list is a list of probability vectors of equal length; return the elementwise mean rounded to 4 decimal places.",
    starterCode: `def ensemble_soft_labels(prob_list):
    # Your code here
    pass`,
    solution: `def ensemble_soft_labels(prob_list):
    n = len(prob_list)
    c = len(prob_list[0])
    return [round(sum(p[k] for p in prob_list) / n, 4) for k in range(c)]`,
    testCases: [
      { input: [[[0.8, 0.2], [0.6, 0.4]]], expected: [0.7, 0.3] },
      { input: [[[1.0, 0.0, 0.0]]], expected: [1.0, 0.0, 0.0] },
      { input: [[[0.2, 0.8], [0.5, 0.5], [0.8, 0.2]]], expected: [0.5, 0.5] },
    ],
  },
  {
    id: "cv-268",
    title: "EMA Teacher Update",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Update a mean-teacher weight with the exponential moving average rule.\n\nReturn round(decay * teacher + (1 - decay) * student, 4).",
    starterCode: `def ema_update(teacher, student, decay):
    # Your code here
    pass`,
    solution: `def ema_update(teacher, student, decay):
    return round(decay * teacher + (1 - decay) * student, 4)`,
    testCases: [
      { input: [1.0, 0.0, 0.9], expected: 0.9 },
      { input: [0.5, 0.5, 0.99], expected: 0.5 },
      { input: [0.2, 0.8, 0.0], expected: 0.8 },
    ],
  },
  {
    id: "cv-269",
    title: "Linear-Probe vs Fine-Tune Delta",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Compute how much full fine-tuning improves over a frozen linear probe.\n\nReturn round(fine_tune - linear_probe, 4).",
    starterCode: `def probe_finetune_delta(linear_probe, fine_tune):
    # Your code here
    pass`,
    solution: `def probe_finetune_delta(linear_probe, fine_tune):
    return round(fine_tune - linear_probe, 4)`,
    testCases: [
      { input: [0.72, 0.81], expected: 0.09 },
      { input: [0.5, 0.5], expected: 0.0 },
      { input: [0.65, 0.6], expected: -0.05 },
    ],
  },
  {
    id: "cv-270",
    title: "Vision Fairness Gap",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Compute the fairness gap between demographic groups.\n\nReturn the difference between the highest and lowest group accuracy, rounded to 4 decimal places.",
    starterCode: `def fairness_gap(group_accuracies):
    # Your code here
    pass`,
    solution: `def fairness_gap(group_accuracies):
    return round(max(group_accuracies) - min(group_accuracies), 4)`,
    testCases: [
      { input: [[0.8, 0.75, 0.9]], expected: 0.15 },
      { input: [[0.6, 0.6]], expected: 0.0 },
      { input: [[0.3, 0.5, 0.45, 0.7]], expected: 0.4 },
    ],
  },
  {
    id: "cv-271",
    title: "Slice-Based Evaluation Gap",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Report how much a data slice underperforms the overall metric.\n\nReturn round(slice_accuracy - overall_accuracy, 4).",
    starterCode: `def slice_eval_gap(slice_accuracy, overall_accuracy):
    # Your code here
    pass`,
    solution: `def slice_eval_gap(slice_accuracy, overall_accuracy):
    return round(slice_accuracy - overall_accuracy, 4)`,
    testCases: [
      { input: [0.62, 0.7], expected: -0.08 },
      { input: [0.9, 0.9], expected: 0.0 },
      { input: [0.45, 0.55], expected: -0.1 },
    ],
  },
  {
    id: "cv-272",
    title: "Color Transfer Mean Shift",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Apply the mean-shift color transfer for one channel value.\n\nMap v from the source distribution to the target with (v - src_mean) / src_std * tgt_std + tgt_mean, rounded to 4 decimal places.",
    starterCode: `def color_transfer(v, src_mean, src_std, tgt_mean, tgt_std):
    # Your code here
    pass`,
    solution: `def color_transfer(v, src_mean, src_std, tgt_mean, tgt_std):
    return round((v - src_mean) / src_std * tgt_std + tgt_mean, 4)`,
    testCases: [
      { input: [100, 50, 100, 50, 1.0], expected: 50.5 },
      { input: [50, 50, 2.0, 50, 1.0], expected: 50.0 },
      { input: [128, 128, 64, 128, 64], expected: 128.0 },
    ],
  },
  {
    id: "cv-273",
    title: "Nearest-Centroid Predict",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Classify a query vector by its nearest class centroid.\n\nReturn the index of the centroid with the smallest squared Euclidean distance, keeping the smallest index on ties.",
    starterCode: `def nearest_centroid(centroids, query):
    # Your code here
    pass`,
    solution: `def nearest_centroid(centroids, query):
    best = 0
    best_d = None
    for i, c in enumerate(centroids):
        d = sum((a - b) * (a - b) for a, b in zip(query, c))
        if best_d is None or d < best_d:
            best_d = d
            best = i
    return best`,
    testCases: [
      { input: [[[0, 0], [10, 0]], [0.5, 0.5]], expected: 0 },
      { input: [[[0, 0], [10, 0]], [9, 1]], expected: 1 },
      { input: [[[1, 1], [1, 1]], [5, 5]], expected: 0 },
    ],
  },
  {
    id: "cv-274",
    title: "Matching-Network Cosine",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Classify a query by cosine similarity to a set of support embeddings.\n\nReturn [best_index, round(best_similarity, 4)], keeping the smallest index on ties. Zero vectors have similarity 0.0.",
    starterCode: `def matching_cosine(query, supports):
    # Your code here
    pass`,
    solution: `def matching_cosine(query, supports):
    nq = sum(v * v for v in query) ** 0.5
    best = 0
    best_sim = None
    for i, s in enumerate(supports):
        ns = sum(v * v for v in s) ** 0.5
        sim = 0.0 if nq == 0 or ns == 0 else sum(a * b for a, b in zip(query, s)) / (nq * ns)
        if best_sim is None or sim > best_sim:
            best_sim = sim
            best = i
    return [best, round(best_sim, 4)]`,
    testCases: [
      { input: [[1, 0], [[1, 0], [0, 1], [-1, 0]]], expected: [0, 1.0] },
      { input: [[0, 1], [[1, 0], [0.6, 0.8]]], expected: [1, 0.8] },
      { input: [[1, 0], [[0, 1]]], expected: [0, 0.0] },
    ],
  },
  {
    id: "cv-275",
    title: "Pseudo-Label Threshold",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Count the samples that pass the pseudo-label confidence threshold.\n\nReturn the number of probabilities in probs that are greater than or equal to threshold.",
    starterCode: `def pseudo_label_count(probs, threshold):
    # Your code here
    pass`,
    solution: `def pseudo_label_count(probs, threshold):
    return sum(1 for p in probs if p >= threshold)`,
    testCases: [
      { input: [[0.9, 0.1, 0.95, 0.5, 0.8], 0.8], expected: 3 },
      { input: [[0.1, 0.2], 0.5], expected: 0 },
      { input: [[0.5], 0.5], expected: 1 },
    ],
  },
  {
    id: "cv-276",
    title: "Self-Training Round",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Produce hard pseudo-labels for one self-training round.\n\nFor each probability vector, output the argmax class (smallest index on ties) when the maximum probability is at least threshold, otherwise -1.",
    starterCode: `def self_training_labels(probs, threshold):
    # Your code here
    pass`,
    solution: `def self_training_labels(probs, threshold):
    out = []
    for p in probs:
        if max(p) >= threshold:
            best = 0
            for i in range(1, len(p)):
                if p[i] > p[best]:
                    best = i
            out.append(best)
        else:
            out.append(-1)
    return out`,
    testCases: [
      { input: [[[0.9, 0.1], [0.2, 0.8], [0.4, 0.5]], 0.6], expected: [0, 1, -1] },
      { input: [[[0.6, 0.4]], 0.5], expected: [0] },
      { input: [[[0.1, 0.2], [0.7, 0.3]], 0.6], expected: [-1, 0] },
    ],
  },
  {
    id: "cv-277",
    title: "Augmentation Policy Random Choice",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Choose an augmentation index with a seeded weighted random draw.\n\nSeed the random module, scale random.random() by the total weight and return the first index whose cumulative weight exceeds the draw. Return -1 when the total weight is not positive.",
    starterCode: `def random_augmentation(weights, seed):
    # Your code here
    pass`,
    solution: `def random_augmentation(weights, seed):
    import random
    random.seed(seed)
    total = sum(weights)
    if total <= 0:
        return -1
    r = random.random() * total
    acc = 0.0
    for i, w in enumerate(weights):
        acc += w
        if r < acc:
            return i
    return len(weights) - 1`,
    testCases: [
      { input: [[1, 2, 3, 4], 0], expected: 3 },
      { input: [[1, 2, 3, 4], 1], expected: 1 },
      { input: [[1, 2, 3, 4], 42], expected: 3 },
      { input: [[1, 0, 0], 7], expected: 0 },
    ],
  },
  {
    id: "cv-278",
    title: "RandAugment Magnitude Schedule",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Build a linear magnitude schedule for a RandAugment policy.\n\nReturn num_ops magnitudes spaced evenly from mag_min to mag_max inclusive, rounded to 4 decimal places. When num_ops is 1 return [round(mag_max, 4)].",
    starterCode: `def randaug_magnitudes(num_ops, mag_min, mag_max):
    # Your code here
    pass`,
    solution: `def randaug_magnitudes(num_ops, mag_min, mag_max):
    if num_ops == 1:
        return [round(mag_max, 4)]
    return [round(mag_min + i * (mag_max - mag_min) / (num_ops - 1), 4) for i in range(num_ops)]`,
    testCases: [
      { input: [3, 0, 10], expected: [0.0, 5.0, 10.0] },
      { input: [2, 1, 3], expected: [1.0, 3.0] },
      { input: [5, 0, 1], expected: [0.0, 0.25, 0.5, 0.75, 1.0] },
      { input: [1, 0, 10], expected: [10] },
    ],
  },
  {
    id: "cv-279",
    title: "TrivialAugment Pick",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Pick a random operation and magnitude for TrivialAugment.\n\nSeed the random module, then draw the operation index with randrange(num_ops) and the magnitude index with randrange(num_magnitudes). Return [op_index, magnitude_index].",
    starterCode: `def trivial_augment_pick(num_ops, num_magnitudes, seed):
    # Your code here
    pass`,
    solution: `def trivial_augment_pick(num_ops, num_magnitudes, seed):
    import random
    random.seed(seed)
    return [random.randrange(num_ops), random.randrange(num_magnitudes)]`,
    testCases: [
      { input: [4, 3, 0], expected: [3, 1] },
      { input: [4, 3, 7], expected: [2, 0] },
      { input: [2, 5, 1], expected: [0, 4] },
    ],
  },
  {
    id: "cv-280",
    title: "GridMask Masked Ratio",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the actual masked fraction of a GridMask pattern.\n\nLet d = round(tile * ratio); a pixel is masked when (i mod tile) < d and (j mod tile) < d. Return the masked fraction of the H x W image rounded to 4 decimal places.",
    starterCode: `def gridmask_ratio(h, w, tile, ratio):
    # Your code here
    pass`,
    solution: `def gridmask_ratio(h, w, tile, ratio):
    d = int(round(tile * ratio))
    masked = 0
    for i in range(h):
        for j in range(w):
            if i % tile < d and j % tile < d:
                masked += 1
    return round(masked / (h * w), 4)`,
    testCases: [
      { input: [4, 4, 2, 1.0], expected: 1.0 },
      { input: [4, 4, 2, 0.5], expected: 0.25 },
      { input: [4, 4, 2, 0.0], expected: 0.0 },
      { input: [3, 4, 3, 1.0], expected: 1.0 },
    ],
  },
  {
    id: "cv-281",
    title: "FMix Low-Frequency Mask",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Build a deterministic low-frequency mask for FMix-style augmentation.\n\nAt pixel (i, j) compute v = 0.5 * (cos(2*pi*i/h) + cos(2*pi*j/w)); the mask value is 1 when v > threshold, otherwise 0. Return the H x W mask.",
    starterCode: `def fmix_mask(h, w, threshold):
    # Your code here
    pass`,
    solution: `def fmix_mask(h, w, threshold):
    import math
    out = []
    for i in range(h):
        row = []
        for j in range(w):
            v = 0.5 * (math.cos(2 * math.pi * i / h) + math.cos(2 * math.pi * j / w))
            row.append(1 if v > threshold else 0)
        out.append(row)
    return out`,
    testCases: [
      { input: [4, 4, 0.0], expected: [[1, 1, 0, 1], [1, 1, 0, 0], [0, 0, 0, 0], [1, 0, 0, 0]] },
      { input: [4, 4, 0.5], expected: [[1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]] },
      { input: [2, 2, -0.5], expected: [[1, 1], [1, 0]] },
    ],
  },
  {
    id: "cv-282",
    title: "Sliding-Window Tiling",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "List the tile origins needed to cover an image with sliding windows.\n\nOrigins step by stride from 0 while the tile fits, always appending n - win as the final origin when needed so the last row and column are covered. Return the [top, left] origins row-major.",
    starterCode: `def sliding_window_origins(h, w, win, stride):
    # Your code here
    pass`,
    solution: `def sliding_window_origins(h, w, win, stride):
    def origins(n):
        if n <= win:
            return [0]
        out = list(range(0, n - win + 1, stride))
        if out[-1] != n - win:
            out.append(n - win)
        return out
    tops = origins(h)
    lefts = origins(w)
    return [[t, l] for t in tops for l in lefts]`,
    testCases: [
      { input: [6, 6, 4, 2], expected: [[0, 0], [0, 2], [2, 0], [2, 2]] },
      { input: [8, 8, 4, 3], expected: [[0, 0], [0, 3], [0, 4], [3, 0], [3, 3], [3, 4], [4, 0], [4, 3], [4, 4]] },
      { input: [4, 7, 4, 1], expected: [[0, 0], [0, 1], [0, 2], [0, 3]] },
      { input: [5, 5, 5, 2], expected: [[0, 0]] },
    ],
  },
  {
    id: "cv-283",
    title: "Inference Batch Padding",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Pad every image in an inference batch to the same square size.\n\nEach image is padded on the bottom and right with value up to target x target. Return the list of padded images.",
    starterCode: `def pad_batch(batch, target, value):
    # Your code here
    pass`,
    solution: `def pad_batch(batch, target, value):
    out = []
    for img in batch:
        h = len(img)
        w = len(img[0])
        rows = []
        for i in range(target):
            row = []
            for j in range(target):
                row.append(img[i][j] if i < h and j < w else value)
            rows.append(row)
        out.append(rows)
    return out`,
    testCases: [
      { input: [[[[1, 2], [3, 4]], [[5]]], 3, 0], expected: [[[1, 2, 0], [3, 4, 0], [0, 0, 0]], [[5, 0, 0], [0, 0, 0], [0, 0, 0]]] },
      { input: [[[[1, 2]], [[3, 4]]], 2, 9], expected: [[[1, 2], [9, 9]], [[3, 4], [9, 9]]] },
      { input: [[[[1, 2]]], 3, 5], expected: [[[1, 2, 5], [5, 5, 5], [5, 5, 5]]] },
    ],
  },
  {
    id: "cv-284",
    title: "Per-Tensor vs Per-Channel Error",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the mean squared quantization error of a weight matrix.\n\nQuantize each value with q = round(v / scale) * scale. When per_channel is False use one scale = max|v| / 127 over all rows; when True use a separate scale per row. Return the mean squared error rounded to 4 decimal places. Rows that are all zeros quantize to 0.",
    starterCode: `def quant_error(rows, per_channel):
    # Your code here
    pass`,
    solution: `def quant_error(rows, per_channel):
    if per_channel:
        scales = [max(abs(v) for v in row) / 127.0 for row in rows]
    else:
        m = max(abs(v) for row in rows for v in row)
        scales = [m / 127.0] * len(rows)
    total = 0.0
    n = 0
    for r, row in enumerate(rows):
        s = scales[r]
        for v in row:
            q = 0.0 if s == 0 else round(v / s) * s
            total += (v - q) ** 2
            n += 1
    return round(total / n, 4)`,
    testCases: [
      { input: [[[100, -100], [10, -10]], false], expected: 0.0279 },
      { input: [[[100, -100], [10, -10]], true], expected: 0.0 },
      { input: [[[1.5, -1.5]], false], expected: 0.0 },
    ],
    hint: "Per-channel scaling uses the row maximum to build each scale.",
  },
  {
    id: "cv-285",
    title: "Int8 Conv Output Scale",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the affine quantization parameters for int8 tensors.\n\nscale = (fp_max - fp_min) / 255 and zero_point = round(-fp_min / scale). Return [round(scale, 6), zero_point].",
    starterCode: `def int8_scale(fp_min, fp_max):
    # Your code here
    pass`,
    solution: `def int8_scale(fp_min, fp_max):
    scale = (fp_max - fp_min) / 255.0
    zero_point = int(round(-fp_min / scale))
    return [round(scale, 6), zero_point]`,
    testCases: [
      { input: [-1, 1], expected: [0.007843, 128] },
      { input: [0, 6], expected: [0.023529, 0] },
      { input: [-3, 3], expected: [0.023529, 128] },
      { input: [0, 255], expected: [1.0, 0] },
    ],
  },
  {
    id: "cv-286",
    title: "Structured Pruning Channel Selection",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Select the channels to keep when pruning by filter norm.\n\nKeep the indices of the `keep` largest channel norms, returning them sorted ascending. Ties keep the smaller index. Return [] when keep is 0.",
    starterCode: `def prune_channels(channel_norms, keep):
    # Your code here
    pass`,
    solution: `def prune_channels(channel_norms, keep):
    order = sorted(range(len(channel_norms)), key=lambda i: (-channel_norms[i], i))
    return sorted(order[:keep])`,
    testCases: [
      { input: [[0.5, 2.0, 1.0, 3.0], 2], expected: [1, 3] },
      { input: [[0.5, 2.0, 1.0, 3.0], 0], expected: [] },
      { input: [[0.5, 2.0, 1.0, 3.0], 4], expected: [0, 1, 2, 3] },
      { input: [[1.0, 1.0, 2.0], 2], expected: [0, 2] },
    ],
  },
  {
    id: "cv-287",
    title: "Feature Distillation Loss",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the mean squared error between student and teacher feature maps.\n\nReturn the MSE over all positions rounded to 4 decimal places.",
    starterCode: `def feature_distill_loss(student, teacher):
    # Your code here
    pass`,
    solution: `def feature_distill_loss(student, teacher):
    total = 0.0
    n = 0
    for i in range(len(student)):
        for j in range(len(student[0])):
            total += (student[i][j] - teacher[i][j]) ** 2
            n += 1
    return round(total / n, 4)`,
    testCases: [
      { input: [[[1, 2], [3, 4]], [[1, 1], [3, 6]]], expected: 1.25 },
      { input: [[[5, 5]], [[5, 5]]], expected: 0.0 },
      { input: [[[0, 0], [0, 0]], [[1, 1], [1, 1]]], expected: 1.0 },
    ],
  },
  {
    id: "cv-288",
    title: "Attention Transfer Loss",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the attention transfer loss between student and teacher maps.\n\nAt each position the attention value is the sum of squared activations over channels; normalize each map so all positions sum to 1, then return the MSE between the two normalized maps rounded to 4 decimal places.",
    starterCode: `def attention_transfer_loss(student, teacher):
    # Your code here
    pass`,
    solution: `def attention_transfer_loss(student, teacher):
    def attention(f):
        h = len(f)
        w = len(f[0])
        c = len(f[0][0])
        a = [[sum(f[i][j][k] ** 2 for k in range(c)) for j in range(w)] for i in range(h)]
        total = sum(sum(row) for row in a)
        if total == 0:
            return [[0.0] * w for _ in range(h)]
        return [[v / total for v in row] for row in a]

    a = attention(student)
    b = attention(teacher)
    total = 0.0
    n = 0
    for i in range(len(a)):
        for j in range(len(a[0])):
            total += (a[i][j] - b[i][j]) ** 2
            n += 1
    return round(total / n, 4)`,
    testCases: [
      { input: [[[[1, 0], [0, 1]], [[0, 0], [0, 0]]], [[[1, 0], [0, 1]], [[0, 0], [0, 0]]]], expected: 0.0 },
      { input: [[[[1, 1], [1, 1]], [[1, 1], [1, 1]]], [[[1, 0], [0, 1]], [[0, 0], [0, 0]]]], expected: 0.0625 },
      { input: [[[[1, 1], [1, 1]], [[1, 1], [1, 1]]], [[[2, 2], [2, 2]], [[2, 2], [2, 2]]]], expected: 0.0 },
    ],
  },
  {
    id: "cv-289",
    title: "Confident Learning Prune",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Prune likely-mislabeled samples by their probability for the given label.\n\nFor sample i take p = probs[i][labels[i]] and keep the sample when p >= threshold. Return the kept indices in ascending order.",
    starterCode: `def prune_noisy(probs, labels, threshold):
    # Your code here
    pass`,
    solution: `def prune_noisy(probs, labels, threshold):
    kept = []
    for i in range(len(probs)):
        if probs[i][labels[i]] >= threshold:
            kept.append(i)
    return kept`,
    testCases: [
      { input: [[[0.9, 0.1], [0.2, 0.8], [0.4, 0.5]], [0, 1, 1], 0.5], expected: [0, 1, 2] },
      { input: [[[0.9, 0.1], [0.2, 0.8]], [0, 1], 0.5], expected: [0, 1] },
      { input: [[[0.1, 0.9]], [0], 0.5], expected: [] },
    ],
  },
  {
    id: "cv-290",
    title: "Co-Teaching Sample Selection",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Select the cleanest samples for co-teaching.\n\nCompute the mean loss of the two models per sample, keep int(len * ratio) samples with the smallest mean loss (ties by smaller index) and return the kept indices sorted ascending.",
    starterCode: `def coteaching_select(loss_a, loss_b, ratio):
    # Your code here
    pass`,
    solution: `def coteaching_select(loss_a, loss_b, ratio):
    n = int(len(loss_a) * ratio)
    means = [(loss_a[i] + loss_b[i]) / 2.0 for i in range(len(loss_a))]
    order = sorted(range(len(means)), key=lambda i: (means[i], i))
    return sorted(order[:n])`,
    testCases: [
      { input: [[0.1, 0.5, 0.2, 0.9], [0.2, 0.1, 0.4, 0.3], 0.5], expected: [0, 1] },
      { input: [[0.4, 0.1, 0.3], [0.4, 0.2, 0.1], 0.34], expected: [1] },
      { input: [[0.5, 0.5], [0.5, 0.5], 1.0], expected: [0, 1] },
    ],
  },
  {
    id: "cv-291",
    title: "FixMatch Consistency Loss",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the FixMatch consistency loss between strong and weak augmentations.\n\nFor pixels whose weak-view maximum probability is at least threshold, compare the strong-view probabilities with the one-hot argmax of the weak view (smallest index on ties). Return the MSE over all selected elements rounded to 4 decimal places, or 0.0 when no pixel passes the threshold.",
    starterCode: `def fixmatch_loss(strong, weak, threshold):
    # Your code here
    pass`,
    solution: `def fixmatch_loss(strong, weak, threshold):
    h = len(strong)
    w = len(strong[0])
    c = len(strong[0][0])
    total = 0.0
    n = 0
    for i in range(h):
        for j in range(w):
            if max(weak[i][j]) < threshold:
                continue
            arg = 0
            for k in range(1, c):
                if weak[i][j][k] > weak[i][j][arg]:
                    arg = k
            for k in range(c):
                target = 1.0 if k == arg else 0.0
                total += (strong[i][j][k] - target) ** 2
                n += 1
    if n == 0:
        return 0.0
    return round(total / n, 4)`,
    testCases: [
      { input: [[[[0.9, 0.1], [0.2, 0.8]]], [[[0.8, 0.2], [0.6, 0.4]]], 0.7], expected: 0.01 },
      { input: [[[[0.9, 0.1], [0.2, 0.8]]], [[[0.3, 0.7], [0.6, 0.4]]], 0.6], expected: 0.725 },
      { input: [[[[0.5, 0.5]]], [[[0.5, 0.5]]], 0.9], expected: 0.0 },
    ],
  },
  {
    id: "cv-292",
    title: "Prototype Memory Update",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Update a class prototype with an exponential moving average of a new feature.\n\nReturn round(momentum * prototype[k] + (1 - momentum) * feature[k], 4) for every dimension.",
    starterCode: `def update_prototype(prototype, feature, momentum):
    # Your code here
    pass`,
    solution: `def update_prototype(prototype, feature, momentum):
    return [round(momentum * p + (1 - momentum) * f, 4) for p, f in zip(prototype, feature)]`,
    testCases: [
      { input: [[1.0, 0.0], [0.5, 0.5], 0.9], expected: [0.95, 0.05] },
      { input: [[0.0, 0.0], [1.0, 1.0], 0.0], expected: [1.0, 1.0] },
      { input: [[1.0, 1.0], [0.0, 0.0], 1.0], expected: [1.0, 1.0] },
    ],
  },
  {
    id: "cv-293",
    title: "Prototypical Loss",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the prototypical network loss for one query.\n\nDistances are squared Euclidean to each prototype; logits are -distance / temperature and the loss is the negative log softmax probability of the true class. Round to 4 decimal places.",
    starterCode: `def prototypical_loss(query, prototypes, label, temperature):
    # Your code here
    pass`,
    solution: `def prototypical_loss(query, prototypes, label, temperature):
    import math
    d2 = [sum((q - p) ** 2 for q, p in zip(query, proto)) for proto in prototypes]
    logits = [-v / temperature for v in d2]
    m = max(logits)
    exps = [pow(2.718281828459045, v - m) for v in logits]
    total = sum(exps)
    return round(-math.log(exps[label] / total) + 0.0, 4)`,
    testCases: [
      { input: [[0, 0], [[0, 0], [10, 0]], 0, 1.0], expected: 0.0 },
      { input: [[0, 0], [[0, 0], [10, 0]], 1, 1.0], expected: 100.0 },
      { input: [[1, 1], [[0, 0], [2, 2]], 0, 2.0], expected: 0.6931 },
    ],
  },
  {
    id: "cv-294",
    title: "Reptile Update",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Apply the Reptile meta-update toward a task-adapted parameter vector.\n\nReturn round(p + epsilon * (adapted - p), 4) for every parameter.",
    starterCode: `def reptile_update(params, adapted, epsilon):
    # Your code here
    pass`,
    solution: `def reptile_update(params, adapted, epsilon):
    return [round(p + epsilon * (a - p), 4) for p, a in zip(params, adapted)]`,
    testCases: [
      { input: [[1.0, 0.0], [0.5, 0.5], 0.1], expected: [0.95, 0.05] },
      { input: [[0.0, 0.0], [1.0, 1.0], 0.5], expected: [0.5, 0.5] },
      { input: [[2.0, 4.0], [3.0, 2.0], 0.0], expected: [2.0, 4.0] },
    ],
  },
  {
    id: "cv-295",
    title: "Adversarial Domain Loss",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the binary cross-entropy of a domain classifier.\n\nApply the sigmoid to each logit with probability clamped to [1e-12, 1 - 1e-12], then average -(y * log(p) + (1 - y) * log(1 - p)) over the samples. Round to 4 decimal places.",
    starterCode: `def domain_loss(logits, labels):
    # Your code here
    pass`,
    solution: `def domain_loss(logits, labels):
    import math
    total = 0.0
    for x, y in zip(logits, labels):
        p = 1.0 / (1.0 + pow(2.718281828459045, -x))
        p = max(1e-12, min(1 - 1e-12, p))
        total += -(y * math.log(p) + (1 - y) * math.log(1 - p))
    return round(total / len(logits), 4)`,
    testCases: [
      { input: [[0.0, 1.0], [0, 1]], expected: 0.5032 },
      { input: [[0.0, 0.0], [0, 0]], expected: 0.6931 },
      { input: [[2.0, -2.0], [1, 0]], expected: 0.1269 },
    ],
  },
  {
    id: "cv-296",
    title: "CLIP Zero-Shot Logits",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute zero-shot class probabilities for an image embedding.\n\nNormalize the image and each per-class prompt embedding, scale the cosine similarities by temperature and apply softmax. Return the per-class probabilities rounded to 4 decimal places.",
    starterCode: `def clip_zero_shot(image_embed, prompt_embeds, temperature):
    # Your code here
    pass`,
    solution: `def clip_zero_shot(image_embed, prompt_embeds, temperature):
    ni = sum(v * v for v in image_embed) ** 0.5
    sims = []
    for p in prompt_embeds:
        np_ = sum(v * v for v in p) ** 0.5
        sims.append(sum(a * b for a, b in zip(image_embed, p)) / (ni * np_))
    logits = [s * temperature for s in sims]
    m = max(logits)
    exps = [pow(2.718281828459045, v - m) for v in logits]
    total = sum(exps)
    return [round(e / total, 4) for e in exps]`,
    testCases: [
      { input: [[1, 0], [[1, 0], [0, 1], [-1, 0]], 1.0], expected: [0.6652, 0.2447, 0.09] },
      { input: [[1, 0], [[0, 1], [1, 0]], 2.0], expected: [0.1192, 0.8808] },
      { input: [[1, 0], [[0.6, 0.8]], 1.0], expected: [1.0] },
    ],
  },
  {
    id: "cv-297",
    title: "Mixup Alpha Blend",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Mix two images with a seeded Beta-distributed lambda (mixup).\n\nSeed the random module and draw lam = betavariate(alpha, alpha). The mixed pixel is lam * image_a + (1 - lam) * image_b, rounded to 4 decimal places. Return [mixed_image, round(lam, 4)].",
    starterCode: `def mixup(image_a, image_b, alpha, seed):
    # Your code here
    pass`,
    solution: `def mixup(image_a, image_b, alpha, seed):
    import random
    random.seed(seed)
    lam = random.betavariate(alpha, alpha)
    out = []
    for i in range(len(image_a)):
        row = []
        for j in range(len(image_a[0])):
            row.append(round(lam * image_a[i][j] + (1 - lam) * image_b[i][j], 4))
        out.append(row)
    return [out, round(lam, 4)]`,
    testCases: [
      { input: [[[0, 0], [0, 0]], [[1, 2], [3, 4]], 1.0, 1], expected: [[[0.9287, 1.8575], [2.7862, 3.7149]], 0.0713] },
      { input: [[[0, 0], [0, 0]], [[1, 2], [3, 4]], 0.5, 2], expected: [[[0.9929, 1.9858], [2.9788, 3.9717]], 0.0071] },
      { input: [[[0, 0], [0, 0]], [[1, 2], [3, 4]], 2.0, 0], expected: [[[0.2384, 0.4768], [0.7151, 0.9535]], 0.7616] },
    ],
  },
  {
    id: "cv-298",
    title: "CutMix Alpha",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Cut and paste a centered box from image_b into image_a (CutMix).\n\nSeed the random module and draw lam = betavariate(alpha, alpha). The box side ratio is r = sqrt(1 - lam), giving box_h = round(r * H) and box_w = round(r * W) centered in the image. Return [mixed_image, round(lam, 4)].",
    starterCode: `def cutmix(image_a, image_b, alpha, seed):
    # Your code here
    pass`,
    solution: `def cutmix(image_a, image_b, alpha, seed):
    import random
    random.seed(seed)
    lam = random.betavariate(alpha, alpha)
    h = len(image_a)
    w = len(image_a[0])
    r = (1 - lam) ** 0.5
    box_h = int(round(r * h))
    box_w = int(round(r * w))
    top = (h - box_h) // 2
    left = (w - box_w) // 2
    out = [list(row) for row in image_a]
    for i in range(top, top + box_h):
        for j in range(left, left + box_w):
            out[i][j] = image_b[i][j]
    return [out, round(lam, 4)]`,
    testCases: [
      { input: [[[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]], 1.0, 3], expected: [[[1, 2, 3, 0], [5, 6, 7, 0], [9, 10, 11, 0], [0, 0, 0, 0]], 0.257] },
      { input: [[[0, 0, 0], [0, 0, 0], [0, 0, 0]], [[1, 2, 3], [4, 5, 6], [7, 8, 9]], 2.0, 1], expected: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], 0.1477] },
      { input: [[[0, 0], [0, 0]], [[1, 2], [3, 4]], 0.5, 5], expected: [[[1, 2], [3, 4]], 0.0006] },
    ],
  },
  {
    id: "cv-299",
    title: "MMD Domain Loss",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Compute the biased maximum mean discrepancy with an RBF kernel.\n\nK(a, b) = exp(-||a - b||^2 / (2 * bandwidth^2)); return mean K(s, s') + mean K(t, t') - 2 * mean K(s, t) rounded to 4 decimal places, averaging over all ordered pairs including self-pairs.",
    starterCode: `def mmd_rbf(source, target, bandwidth):
    # Your code here
    pass`,
    solution: `def mmd_rbf(source, target, bandwidth):
    def k(a, b):
        d = sum((x - y) * (x - y) for x, y in zip(a, b))
        return pow(2.718281828459045, -d / (2 * bandwidth * bandwidth))

    def mean_pairs(a, b):
        total = 0.0
        for p in a:
            for q in b:
                total += k(p, q)
        return total / (len(a) * len(b))

    return round(mean_pairs(source, source) + mean_pairs(target, target) - 2 * mean_pairs(source, target), 4)`,
    testCases: [
      { input: [[[0, 0], [1, 0]], [[0, 0], [1, 0]], 1.0], expected: 0.0 },
      { input: [[[0, 0]], [[1, 0]], 1.0], expected: 0.7869 },
      { input: [[[0, 0], [0, 1]], [[1, 1], [2, 2]], 2.0], expected: 0.5484 },
    ],
  },
  {
    id: "cv-300",
    title: "CORAL Covariance Align",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Compute the CORAL domain-alignment loss.\n\nBuild the population covariance matrix of each feature set (rows are samples), then return ||C_source - C_target||_F^2 / (4 * d^2) rounded to 4 decimal places, where d is the feature dimension.",
    starterCode: `def coral_loss(source, target):
    # Your code here
    pass`,
    solution: `def coral_loss(source, target):
    d = len(source[0])
    n_s = len(source)
    n_t = len(target)
    ms = [sum(row[k] for row in source) / n_s for k in range(d)]
    mt = [sum(row[k] for row in target) / n_t for k in range(d)]

    def cov(rows, mean, n):
        c = [[0.0] * d for _ in range(d)]
        for row in rows:
            for a in range(d):
                for b in range(d):
                    c[a][b] += (row[a] - mean[a]) * (row[b] - mean[b])
        for a in range(d):
            for b in range(d):
                c[a][b] /= n
        return c

    cs = cov(source, ms, n_s)
    ct = cov(target, mt, n_t)
    total = 0.0
    for a in range(d):
        for b in range(d):
            total += (cs[a][b] - ct[a][b]) ** 2
    return round(total / (4 * d * d), 4)`,
    testCases: [
      { input: [[[1], [2]], [[1], [2]]], expected: 0.0 },
      { input: [[[1], [2]], [[1], [4]]], expected: 1.0 },
      { input: [[[1], [2], [3]], [[2], [4], [6]]], expected: 1.0 },
    ],
  },
  {
    id: "cv-301",
    title: "Overlap-Tile Blending",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Blend two overlapping 1D tiles with linear ramp weights.\n\nKeep the non-overlapping left part of the first tile, average the overlap region with weights (t + 1) / (overlap + 1) favoring the second tile, append the remaining right part of the second tile, and round blended values to 4 decimal places.",
    starterCode: `def blend_overlap(left, right, overlap):
    # Your code here
    pass`,
    solution: `def blend_overlap(left, right, overlap):
    n = len(left)
    out = list(left[:n - overlap])
    for t in range(overlap):
        wgt = (t + 1) / (overlap + 1)
        out.append(round(left[n - overlap + t] * (1 - wgt) + right[t] * wgt, 4))
    out.extend(right[overlap:])
    return out`,
    testCases: [
      { input: [[1, 2, 3], [4, 5, 6], 1], expected: [1, 2, 3.5, 5, 6] },
      { input: [[1, 2, 3], [4, 5, 6], 2], expected: [1, 2.6667, 4.3333, 6] },
      { input: [[1, 2, 3], [4, 5, 6], 0], expected: [1, 2, 3, 4, 5, 6] },
    ],
  },
  {
    id: "cv-302",
    title: "KID Polynomial Lite",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Compute the polynomial-kernel MMD used by KID.\n\nK(a, b) = (a . b / d + 1)^degree with d the feature dimension; return mean K(s, s') + mean K(t, t') - 2 * mean K(s, t) rounded to 4 decimal places, averaging over ordered pairs including self-pairs.",
    starterCode: `def kid_polynomial(source, target, degree):
    # Your code here
    pass`,
    solution: `def kid_polynomial(source, target, degree):
    d = len(source[0])

    def k(a, b):
        dot = sum(x * y for x, y in zip(a, b)) / d
        return (dot + 1) ** degree

    def mean_pairs(a, b):
        total = 0.0
        for p in a:
            for q in b:
                total += k(p, q)
        return total / (len(a) * len(b))

    return round(mean_pairs(source, source) + mean_pairs(target, target) - 2 * mean_pairs(source, target), 4)`,
    testCases: [
      { input: [[[0, 0], [1, 0]], [[0, 0], [1, 0]], 2], expected: 0.0 },
      { input: [[[0, 0]], [[1, 0]], 1], expected: 0.5 },
      { input: [[[1, 2]], [[2, 1]], 2], expected: 6.5 },
    ],
  },
  {
    id: "cv-303",
    title: "Retrieval mAP Lite",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Compute mean average precision over several retrieval queries.\n\nFor each ranked list of 0/1 relevance flags compute AP as the mean of precision@k over the relevant positions. Queries with no relevant items contribute 0.0. Return the mean over all queries rounded to 4 decimal places.",
    starterCode: `def retrieval_map(relevant_lists):
    # Your code here
    pass`,
    solution: `def retrieval_map(relevant_lists):
    total = 0.0
    for flags in relevant_lists:
        pos = sum(flags)
        if pos == 0:
            continue
        ap = 0.0
        tp = 0
        for k, v in enumerate(flags):
            if v == 1:
                tp += 1
                ap += tp / (k + 1)
        total += ap / pos
    return round(total / len(relevant_lists), 4)`,
    testCases: [
      { input: [[[1, 0, 1], [0, 1, 0, 1]]], expected: 0.6667 },
      { input: [[[1, 1, 0]]], expected: 1.0 },
      { input: [[[0, 0], [1, 0, 0]]], expected: 0.5 },
    ],
  },
  {
    id: "cv-304",
    title: "Near-Duplicate Clustering",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Cluster items whose pairwise similarity reaches a threshold.\n\nUnion item i and j whenever sim_matrix[i][j] >= threshold, taking the transitive closure of the relation. Return cluster ids assigned in order of first occurrence (0, 1, 2, ...) for items 0..n-1.",
    starterCode: `def cluster_duplicates(sim_matrix, threshold):
    # Your code here
    pass`,
    solution: `def cluster_duplicates(sim_matrix, threshold):
    n = len(sim_matrix)
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for i in range(n):
        for j in range(i + 1, n):
            if sim_matrix[i][j] >= threshold:
                ri = find(i)
                rj = find(j)
                if ri != rj:
                    parent[rj] = ri
    labels = {}
    out = []
    for i in range(n):
        r = find(i)
        if r not in labels:
            labels[r] = len(labels)
        out.append(labels[r])
    return out`,
    testCases: [
      { input: [[[1.0, 0.9, 0.1], [0.9, 1.0, 0.2], [0.1, 0.2, 1.0]], 0.8], expected: [0, 0, 1] },
      { input: [[[1.0, 0.6, 0.1], [0.6, 1.0, 0.7], [0.1, 0.7, 1.0]], 0.5], expected: [0, 0, 0] },
      { input: [[[1.0, 0.0], [0.0, 1.0]], 0.1], expected: [0, 1] },
    ],
  },
  {
    id: "cv-305",
    title: "MAML Inner Step",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Run one MAML inner-loop gradient step on a linear model.\n\nWith prediction sum(w * x) and loss 0.5 * (pred - y)^2, the gradient is (pred - y) * x per weight. Return [adapted_weights, round(loss, 4)] where adapted_weights = w - lr * grad rounded to 4 decimal places.",
    starterCode: `def maml_inner_step(weights, x, y, lr):
    # Your code here
    pass`,
    solution: `def maml_inner_step(weights, x, y, lr):
    pred = sum(w * v for w, v in zip(weights, x))
    loss = 0.5 * (pred - y) ** 2
    grad = [(pred - y) * v for v in x]
    adapted = [round(w - lr * g, 4) for w, g in zip(weights, grad)]
    return [adapted, round(loss, 4)]`,
    testCases: [
      { input: [[1, 0], [2, 1], 0, 0.1], expected: [[0.6, -0.2], 2.0] },
      { input: [[0.5], [2], 1, 0.5], expected: [[0.5], 0.0] },
      { input: [[1, 1], [1, 1], 3, 0.2], expected: [[1.2, 1.2], 0.5] },
    ],
  },
];
