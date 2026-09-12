import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "cv-216",
    title: "Image Decode Size Estimate",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Estimate the decoded pixel height of an encoded image.\n\nGiven the encoded size in bytes, the decoded width and the bits per pixel, return round(file_bytes * 8 / (width * bits_per_pixel)) as an integer.",
    starterCode: `def estimate_height(file_bytes, width, bits_per_pixel):
    # Your code here
    pass`,
    solution: `def estimate_height(file_bytes, width, bits_per_pixel):
    return int(round(file_bytes * 8 / (width * bits_per_pixel)))`,
    testCases: [
      { input: [1200, 100, 8], expected: 12 },
      { input: [900, 30, 8], expected: 30 },
      { input: [100, 10, 8], expected: 10 },
      { input: [2400, 200, 16], expected: 6 },
    ],
  },
  {
    id: "cv-217",
    title: "EXIF Orientation Apply",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Apply common EXIF orientation values to a 2D image.\n\norientation 1 keeps the image, 3 rotates it 180 degrees, 6 rotates it 90 degrees clockwise and 8 rotates it 90 degrees counterclockwise. You may assume orientation is one of 1, 3, 6, 8.",
    starterCode: `def apply_orientation(image, orientation):
    # Your code here
    pass`,
    solution: `def apply_orientation(image, orientation):
    h = len(image)
    w = len(image[0])
    if orientation == 1:
        return [list(r) for r in image]
    if orientation == 3:
        return [list(reversed(r)) for r in reversed(image)]
    if orientation == 6:
        return [[image[h - 1 - j][i] for j in range(h)] for i in range(w)]
    if orientation == 8:
        return [[image[j][w - 1 - i] for j in range(h)] for i in range(w)]
    return [list(r) for r in image]`,
    testCases: [
      { input: [[[1, 2, 3], [4, 5, 6]], 1], expected: [[1, 2, 3], [4, 5, 6]] },
      { input: [[[1, 2, 3], [4, 5, 6]], 3], expected: [[6, 5, 4], [3, 2, 1]] },
      { input: [[[1, 2, 3], [4, 5, 6]], 6], expected: [[4, 1], [5, 2], [6, 3]] },
      { input: [[[1, 2, 3], [4, 5, 6]], 8], expected: [[3, 6], [2, 5], [1, 4]] },
    ],
  },
  {
    id: "cv-218",
    title: "Five-Crop TTA Indices",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Return the top-left corners of the five standard test-time-augmentation crops.\n\nThe order is top-left, top-right, bottom-left, bottom-right, then center, using integer division for the center offsets. The crop is assumed to fit inside the image.",
    starterCode: `def five_crop_indices(h, w, crop_h, crop_w):
    # Your code here
    pass`,
    solution: `def five_crop_indices(h, w, crop_h, crop_w):
    return [[0, 0], [0, w - crop_w], [h - crop_h, 0], [h - crop_h, w - crop_w],
            [(h - crop_h) // 2, (w - crop_w) // 2]]`,
    testCases: [
      { input: [4, 6, 2, 2], expected: [[0, 0], [0, 4], [2, 0], [2, 4], [1, 2]] },
      { input: [5, 5, 3, 3], expected: [[0, 0], [0, 2], [2, 0], [2, 2], [1, 1]] },
      { input: [2, 3, 2, 3], expected: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]] },
    ],
  },
  {
    id: "cv-219",
    title: "Image Grid Montage",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Tile a list of equal-shaped images into a rows x cols montage.\n\nImages are placed row-major at (index // cols, index % cols). You may assume len(images) equals rows * cols.",
    starterCode: `def montage(images, rows, cols):
    # Your code here
    pass`,
    solution: `def montage(images, rows, cols):
    th = len(images[0])
    tw = len(images[0][0])
    out = [[0] * (cols * tw) for _ in range(rows * th)]
    for idx, img in enumerate(images):
        r = idx // cols
        c = idx % cols
        for i in range(th):
            for j in range(tw):
                out[r * th + i][c * tw + j] = img[i][j]
    return out`,
    testCases: [
      { input: [[[[1]], [[2]], [[3]], [[4]]], 2, 2], expected: [[1, 2], [3, 4]] },
      { input: [[[[1, 2]], [[3, 4]]], 1, 2], expected: [[1, 2, 3, 4]] },
      { input: [[[[1, 2], [3, 4]], [[5, 6], [7, 8]], [[9, 10], [11, 12]], [[13, 14], [15, 16]]], 2, 2], expected: [[1, 2, 5, 6], [3, 4, 7, 8], [9, 10, 13, 14], [11, 12, 15, 16]] },
    ],
  },
  {
    id: "cv-220",
    title: "Feature Map Channel Mean",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Compute the mean activation of each channel in an H x W x C feature map.\n\nReturn one value per channel rounded to 4 decimal places.",
    starterCode: `def channel_mean(feature):
    # Your code here
    pass`,
    solution: `def channel_mean(feature):
    h = len(feature)
    w = len(feature[0])
    c = len(feature[0][0])
    out = []
    for ch in range(c):
        s = 0.0
        for i in range(h):
            for j in range(w):
                s += feature[i][j][ch]
        out.append(round(s / (h * w), 4))
    return out`,
    testCases: [
      { input: [[[[1, 2], [3, 4]], [[5, 6], [7, 8]]]], expected: [4.0, 5.0] },
      { input: [[[[10, 0, 5]]]], expected: [10.0, 0.0, 5.0] },
      { input: [[[[2, 4], [6, 8]], [[1, 1], [1, 1]]]], expected: [2.5, 3.5] },
    ],
  },
  {
    id: "cv-221",
    title: "Global Max Pool",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Compute global max pooling over an H x W x C feature map.\n\nReturn the maximum activation of each channel as a list of C values.",
    starterCode: `def global_max_pool(feature):
    # Your code here
    pass`,
    solution: `def global_max_pool(feature):
    h = len(feature)
    w = len(feature[0])
    c = len(feature[0][0])
    out = []
    for ch in range(c):
        best = feature[0][0][ch]
        for i in range(h):
            for j in range(w):
                if feature[i][j][ch] > best:
                    best = feature[i][j][ch]
        out.append(best)
    return out`,
    testCases: [
      { input: [[[[1, 2], [3, 4]], [[5, 6], [7, 8]]]], expected: [7, 8] },
      { input: [[[[10, 0, 5]]]], expected: [10, 0, 5] },
      { input: [[[[2, 4], [6, 8]], [[1, 1], [1, 1]]]], expected: [6, 8] },
    ],
    hint: "Reduce each channel independently with a maximum.",
  },
  {
    id: "cv-222",
    title: "Adaptive Average Pool",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Apply adaptive average pooling to a 2D feature map.\n\nFor output cell (oh, ow) pool the input rows [oh * H // out_h, (oh + 1) * H // out_h) and columns [ow * W // out_w, (ow + 1) * W // out_w), ensuring at least one element. Round each mean to 4 decimal places.",
    starterCode: `def adaptive_avg_pool(feature, out_h, out_w):
    # Your code here
    pass`,
    solution: `def adaptive_avg_pool(feature, out_h, out_w):
    h = len(feature)
    w = len(feature[0])
    out = []
    for oh in range(out_h):
        hs = oh * h // out_h
        he = (oh + 1) * h // out_h
        if he == hs:
            he = hs + 1
        row = []
        for ow in range(out_w):
            ws = ow * w // out_w
            we = (ow + 1) * w // out_w
            if we == ws:
                we = ws + 1
            s = 0.0
            n = 0
            for i in range(hs, he):
                for j in range(ws, we):
                    s += feature[i][j]
                    n += 1
            row.append(round(s / n, 4))
        out.append(row)
    return out`,
    testCases: [
      { input: [[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]], 2, 2], expected: [[3.5, 5.5], [11.5, 13.5]] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], 2, 2], expected: [[1.0, 2.5], [5.5, 7.0]] },
      { input: [[[1, 2], [3, 4]], 1, 2], expected: [[2.0, 3.0]] },
    ],
  },
  {
    id: "cv-223",
    title: "Dilated Conv Output Size",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Compute the output size of a dilated convolution.\n\nThe effective kernel is dilation * (k - 1) + 1; out = (n + 2 * pad - effective_k) // stride + 1 for each dimension. Return [out_h, out_w].",
    starterCode: `def dilated_conv_output_size(h, w, k, stride, pad, dilation):
    # Your code here
    pass`,
    solution: `def dilated_conv_output_size(h, w, k, stride, pad, dilation):
    eff = dilation * (k - 1) + 1
    return [(h + 2 * pad - eff) // stride + 1, (w + 2 * pad - eff) // stride + 1]`,
    testCases: [
      { input: [28, 28, 3, 1, 0, 1], expected: [26, 26] },
      { input: [28, 28, 3, 1, 0, 2], expected: [24, 24] },
      { input: [28, 28, 3, 1, 2, 2], expected: [28, 28] },
      { input: [16, 16, 3, 2, 1, 2], expected: [7, 7] },
    ],
  },
  {
    id: "cv-224",
    title: "Conv Bias Add",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Add a per-channel bias to a feature map.\n\nBroadcast bias[c] over every pixel of channel c and round to 4 decimal places.",
    starterCode: `def add_bias(feature, bias):
    # Your code here
    pass`,
    solution: `def add_bias(feature, bias):
    out = []
    for row in feature:
        r = []
        for p in row:
            r.append([round(p[c] + bias[c], 4) for c in range(len(p))])
        out.append(r)
    return out`,
    testCases: [
      { input: [[[[1, 2], [3, 4]]], [10, -1]], expected: [[[11, 1], [13, 3]]] },
      { input: [[[[0, 0, 0]]], [1, 2, 3]], expected: [[[1, 2, 3]]] },
      { input: [[[[1, 1], [2, 2]]], [0, 5]], expected: [[[1, 6], [2, 7]]] },
    ],
  },
  {
    id: "cv-225",
    title: "Residual Output Shape",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Compute the output shape of a residual block's main convolution path.\n\nout = (n + 2 * pad - k) // stride + 1 for each spatial dimension, with the channel count unchanged. Return [out_h, out_w, channels].",
    starterCode: `def residual_output_shape(h, w, c, k, stride, pad):
    # Your code here
    pass`,
    solution: `def residual_output_shape(h, w, c, k, stride, pad):
    return [(h + 2 * pad - k) // stride + 1, (w + 2 * pad - k) // stride + 1, c]`,
    testCases: [
      { input: [32, 32, 64, 3, 1, 1], expected: [32, 32, 64] },
      { input: [32, 32, 64, 3, 2, 1], expected: [16, 16, 64] },
      { input: [56, 56, 128, 1, 1, 0], expected: [56, 56, 128] },
    ],
  },
  {
    id: "cv-226",
    title: "ShuffleNet Channel Shuffle Index",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Compute the channel shuffle permutation used by ShuffleNet.\n\nReshape the channel axis to (groups, channels // groups), transpose to (channels // groups, groups) and flatten; return the resulting index list. groups divides channels.",
    starterCode: `def channel_shuffle_indices(channels, groups):
    # Your code here
    pass`,
    solution: `def channel_shuffle_indices(channels, groups):
    per = channels // groups
    idx = []
    for g in range(groups):
        for i in range(per):
            idx.append(i * groups + g)
    return idx`,
    testCases: [
      { input: [4, 2], expected: [0, 2, 1, 3] },
      { input: [6, 3], expected: [0, 3, 1, 4, 2, 5] },
      { input: [4, 1], expected: [0, 1, 2, 3] },
      { input: [8, 4], expected: [0, 4, 1, 5, 2, 6, 3, 7] },
    ],
  },
  {
    id: "cv-227",
    title: "Class Token Output",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Extract the class token from a sequence of token embeddings.\n\nReturn the first token as a list, or [] when the sequence is empty.",
    starterCode: `def class_token(tokens):
    # Your code here
    pass`,
    solution: `def class_token(tokens):
    if not tokens:
        return []
    return list(tokens[0])`,
    testCases: [
      { input: [[[1, 2], [3, 4], [5, 6]]], expected: [1, 2] },
      { input: [[]], expected: [] },
      { input: [[[7, 8]]], expected: [7, 8] },
    ],
  },
  {
    id: "cv-228",
    title: "Duplicate Detection Ratio",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Compute the fraction of duplicate items in a dataset split.\n\nReturn (n - number of unique items) / n rounded to 4 decimal places, or 0.0 for an empty list.",
    starterCode: `def duplicate_ratio(items):
    # Your code here
    pass`,
    solution: `def duplicate_ratio(items):
    if not items:
        return 0.0
    return round((len(items) - len(set(items))) / len(items), 4)`,
    testCases: [
      { input: [[1, 2, 2, 3]], expected: 0.25 },
      { input: [[1, 1, 1]], expected: 0.6667 },
      { input: [[]], expected: 0.0 },
      { input: [[1, 2, 3, 4]], expected: 0.0 },
    ],
  },
  {
    id: "cv-229",
    title: "Hamming Loss for Segmentation Masks",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Compute the Hamming loss between two lists of multi-label vectors.\n\nReturn the fraction of individual label positions that differ over all vectors, rounded to 4 decimal places.",
    starterCode: `def hamming_loss(pred, target):
    # Your code here
    pass`,
    solution: `def hamming_loss(pred, target):
    total = 0
    wrong = 0
    for p, t in zip(pred, target):
        for a, b in zip(p, t):
            total += 1
            if a != b:
                wrong += 1
    return round(wrong / total, 4)`,
    testCases: [
      { input: [[[1, 0], [1, 1]], [[1, 0], [0, 1]]], expected: 0.25 },
      { input: [[[0, 0]], [[1, 1]]], expected: 1.0 },
      { input: [[[1, 1], [0, 0]], [[1, 1], [0, 0]]], expected: 0.0 },
    ],
  },
  {
    id: "cv-230",
    title: "Subset Accuracy",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Compute subset accuracy for multi-label predictions.\n\nReturn the fraction of samples whose entire prediction vector equals the target vector, rounded to 4 decimal places.",
    starterCode: `def subset_accuracy(pred, target):
    # Your code here
    pass`,
    solution: `def subset_accuracy(pred, target):
    correct = 0
    for p, t in zip(pred, target):
        if list(p) == list(t):
            correct += 1
    return round(correct / len(pred), 4)`,
    testCases: [
      { input: [[[1, 0], [1, 1]], [[1, 0], [0, 1]]], expected: 0.5 },
      { input: [[[1, 1], [0, 0]], [[1, 1], [0, 0]]], expected: 1.0 },
      { input: [[[1, 0]], [[0, 1]]], expected: 0.0 },
    ],
  },
  {
    id: "cv-231",
    title: "Face Landmark Distance",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Compute the Euclidean distance between two 2D landmark points.\n\nReturn the distance rounded to 4 decimal places.",
    starterCode: `def landmark_distance(p1, p2):
    # Your code here
    pass`,
    solution: `def landmark_distance(p1, p2):
    return round(((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2) ** 0.5, 4)`,
    testCases: [
      { input: [[0, 0], [3, 4]], expected: 5.0 },
      { input: [[1, 1], [1, 1]], expected: 0.0 },
      { input: [[2.5, 3.5], [5.5, 7.5]], expected: 5.0 },
    ],
  },
  {
    id: "cv-232",
    title: "Random Resized Crop (Seeded)",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Perform a seeded random resized crop with aspect ratio 1.\n\nSeed the random module, draw an area fraction uniformly from [scale_min, scale_max], set side = round(sqrt(fraction * H * W)) clipped to [1, min(H, W)], sample the top-left uniformly in the remaining range, then crop a side x side region and nearest-neighbor resize it to out_h x out_w.",
    starterCode: `def random_resized_crop(image, out_h, out_w, scale_min, scale_max, seed):
    # Your code here
    pass`,
    solution: `def random_resized_crop(image, out_h, out_w, scale_min, scale_max, seed):
    import random
    random.seed(seed)
    h = len(image)
    w = len(image[0])
    frac = scale_min + (scale_max - scale_min) * random.random()
    side = int(round((frac * h * w) ** 0.5))
    side = max(1, min(side, h, w))
    top = random.randint(0, h - side)
    left = random.randint(0, w - side)
    out = []
    for y in range(out_h):
        sy = int(y * side / out_h)
        row = []
        for x in range(out_w):
            sx = int(x * side / out_w)
            row.append(image[top + sy][left + sx])
        out.append(row)
    return out`,
    testCases: [
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], 2, 2, 0.5, 0.5, 1], expected: [[2, 3], [5, 6]] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], 2, 2, 0.25, 1.0, 7], expected: [[2, 3], [5, 6]] },
      { input: [[[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]], 2, 3, 1.0, 1.0, 3], expected: [[0, 1, 2], [8, 9, 10]] },
    ],
  },
  {
    id: "cv-233",
    title: "Horizontal Flip TTA Average",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Average a prediction map with its horizontally flipped TTA counterpart.\n\nReturn (prob[i][j] + prob_flipped[i][W - 1 - j]) / 2 per pixel, rounded to 4 decimal places.",
    starterCode: `def hflip_tta_average(prob, prob_flipped):
    # Your code here
    pass`,
    solution: `def hflip_tta_average(prob, prob_flipped):
    h = len(prob)
    w = len(prob[0])
    out = []
    for i in range(h):
        row = []
        for j in range(w):
            row.append(round((prob[i][j] + prob_flipped[i][w - 1 - j]) / 2.0, 4))
        out.append(row)
    return out`,
    testCases: [
      { input: [[[0.2, 0.8]], [[0.6, 0.4]]], expected: [[0.3, 0.7]] },
      { input: [[[1.0, 0.0], [0.0, 1.0]], [[0.0, 1.0], [1.0, 0.0]]], expected: [[1.0, 0.0], [0.0, 1.0]] },
      { input: [[[0.5, 0.5], [0.5, 0.5]], [[0.5, 0.5], [0.5, 0.5]]], expected: [[0.5, 0.5], [0.5, 0.5]] },
    ],
  },
  {
    id: "cv-234",
    title: "NCC Score Map",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the normalized cross-correlation score map for template matching.\n\nFor every valid top-left position compute the correlation coefficient between the image patch and the template with both means subtracted. Constant patches score 0.0; round to 4 decimal places.",
    starterCode: `def ncc_map(image, template):
    # Your code here
    pass`,
    solution: `def ncc_map(image, template):
    h = len(image)
    w = len(image[0])
    th = len(template)
    tw = len(template[0])
    tvals = [template[a][b] for a in range(th) for b in range(tw)]
    n = len(tvals)
    mt = sum(tvals) / n
    out = []
    for i in range(h - th + 1):
        row = []
        for j in range(w - tw + 1):
            vals = [image[i + a][j + b] for a in range(th) for b in range(tw)]
            mi = sum(vals) / n
            num = 0.0
            di = 0.0
            dt = 0.0
            for x, y in zip(vals, tvals):
                dx = x - mi
                dy = y - mt
                num += dx * dy
                di += dx * dx
                dt += dy * dy
            den = (di ** 0.5) * (dt ** 0.5)
            row.append(0.0 if den == 0 else round(num / den, 4))
        out.append(row)
    return out`,
    testCases: [
      { input: [[[0, 0, 0], [0, 1, 2], [0, 3, 4]], [[1, 2], [3, 4]]], expected: [[0.7746, 0.9439], [0.7303, 1.0]] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], [[5, 5], [5, 5]]], expected: [[0.0, 0.0], [0.0, 0.0]] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], [[1, 2], [4, 5]]], expected: [[1.0, 1.0], [1.0, 1.0]] },
    ],
  },
  {
    id: "cv-235",
    title: "Template Match Multiple Peaks",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Find up to k non-overlapping peaks of a score map.\n\nConsider positions in descending score order (ties by row then column) and greedily keep a position when its Chebyshev distance to every kept position is at least min_distance. Return [row, col, score] per peak with the score rounded to 4 decimal places.",
    starterCode: `def top_peaks(score_map, k, min_distance):
    # Your code here
    pass`,
    solution: `def top_peaks(score_map, k, min_distance):
    h = len(score_map)
    w = len(score_map[0])
    cands = sorted(((-score_map[i][j], i, j) for i in range(h) for j in range(w)))
    picked = []
    for _, i, j in cands:
        ok = True
        for pi, pj in picked:
            if max(abs(i - pi), abs(j - pj)) < min_distance:
                ok = False
                break
        if ok:
            picked.append((i, j))
            if len(picked) == k:
                break
    return [[i, j, round(score_map[i][j], 4)] for i, j in picked]`,
    testCases: [
      { input: [[[5, 1, 4], [2, 9, 3], [6, 0, 7]], 3, 1], expected: [[1, 1, 9], [2, 2, 7], [2, 0, 6]] },
      { input: [[[5, 1, 4], [2, 9, 3], [6, 0, 7]], 2, 2], expected: [[1, 1, 9]] },
      { input: [[[1, 1], [1, 1]], 2, 1], expected: [[0, 0, 1], [0, 1, 1]] },
    ],
  },
  {
    id: "cv-236",
    title: "Feature Map Channel Std",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the population standard deviation of each channel in an H x W x C feature map.\n\nReturn one value per channel rounded to 4 decimal places.",
    starterCode: `def channel_std(feature):
    # Your code here
    pass`,
    solution: `def channel_std(feature):
    h = len(feature)
    w = len(feature[0])
    c = len(feature[0][0])
    out = []
    for ch in range(c):
        vals = [feature[i][j][ch] for i in range(h) for j in range(w)]
        m = sum(vals) / len(vals)
        var = sum((v - m) ** 2 for v in vals) / len(vals)
        out.append(round(var ** 0.5, 4))
    return out`,
    testCases: [
      { input: [[[[0, 10], [20, 30]], [[1, 1], [1, 1]]]], expected: [8.3815, 11.8427] },
      { input: [[[[5, 5], [5, 5]]]], expected: [0.0, 0.0] },
      { input: [[[[1, 2], [5, 2]], [[2, 2], [2, 2]]]], expected: [1.5, 0.0] },
    ],
  },
  {
    id: "cv-237",
    title: "Feature Map Bilinear Resize",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Bilinearly resize a 2D feature map to out_h x out_w.\n\nMap output index i to source coordinate i * (H - 1) / (out_h - 1) (0 when the output size is 1) and interpolate with coordinates clamped to the feature bounds. Round to 4 decimal places.",
    starterCode: `def bilinear_resize(feature, out_h, out_w):
    # Your code here
    pass`,
    solution: `def bilinear_resize(feature, out_h, out_w):
    h = len(feature)
    w = len(feature[0])

    def interp(y, x):
        y = max(0.0, min(float(h - 1), y))
        x = max(0.0, min(float(w - 1), x))
        y0 = int(y)
        x0 = int(x)
        y1 = min(y0 + 1, h - 1)
        x1 = min(x0 + 1, w - 1)
        dy = y - y0
        dx = x - x0
        return (feature[y0][x0] * (1 - dy) * (1 - dx) + feature[y0][x1] * (1 - dy) * dx
                + feature[y1][x0] * dy * (1 - dx) + feature[y1][x1] * dy * dx)

    out = []
    for i in range(out_h):
        sy = 0.0 if out_h == 1 else i * (h - 1) / (out_h - 1)
        row = []
        for j in range(out_w):
            sx = 0.0 if out_w == 1 else j * (w - 1) / (out_w - 1)
            row.append(round(interp(sy, sx), 4))
        out.append(row)
    return out`,
    testCases: [
      { input: [[[1, 2], [3, 4]], 4, 4], expected: [[1.0, 1.3333, 1.6667, 2.0], [1.6667, 2.0, 2.3333, 2.6667], [2.3333, 2.6667, 3.0, 3.3333], [3.0, 3.3333, 3.6667, 4.0]] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], 2, 2], expected: [[1.0, 3.0], [7.0, 9.0]] },
      { input: [[[1, 2], [3, 4]], 1, 1], expected: [[1.0]] },
      { input: [[[1, 2], [3, 4]], 2, 4], expected: [[1.0, 1.3333, 1.6667, 2.0], [3.0, 3.3333, 3.6667, 4.0]] },
    ],
  },
  {
    id: "cv-238",
    title: "Depthwise Conv Output",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Apply a depthwise convolution in valid mode.\n\nkernels[c] is a k x k kernel for channel c; each output channel is the cross-correlation of its input channel with its kernel. Return an (H - k + 1) x (W - k + 1) x C map of integers.",
    starterCode: `def depthwise_conv(feature, kernels):
    # Your code here
    pass`,
    solution: `def depthwise_conv(feature, kernels):
    h = len(feature)
    w = len(feature[0])
    c = len(feature[0][0])
    k = len(kernels[0])
    out = [[[0] * c for _ in range(w - k + 1)] for _ in range(h - k + 1)]
    for ch in range(c):
        for i in range(h - k + 1):
            for j in range(w - k + 1):
                s = 0
                for a in range(k):
                    for b in range(k):
                        s += feature[i + a][j + b][ch] * kernels[ch][a][b]
                out[i][j][ch] = s
    return out`,
    testCases: [
      { input: [[[[1, 2], [3, 4]], [[5, 6], [7, 8]]], [[[1, 0], [0, 0]], [[0, 0], [0, 1]]]], expected: [[[1, 8]]] },
      { input: [[[[1, 1], [2, 2], [3, 3]], [[4, 4], [5, 5], [6, 6]], [[7, 7], [8, 8], [9, 9]]], [[[1, 1], [1, 1]], [[1, -1], [-1, 1]]]], expected: [[[12, 0], [16, 0]], [[24, 0], [28, 0]]] },
      { input: [[[[1], [2]], [[3], [4]]], [[[1, 0], [0, 1]]]], expected: [[[5]]] },
    ],
  },
  {
    id: "cv-239",
    title: "Group Conv Output",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Apply a grouped convolution in valid mode.\n\nThe C input channels are split into groups; one shared k x k kernel per group is cross-correlated with every channel of that group and the responses are summed, producing one output channel per group. Return an (H - k + 1) x (W - k + 1) x groups map.",
    starterCode: `def group_conv(feature, kernels, groups):
    # Your code here
    pass`,
    solution: `def group_conv(feature, kernels, groups):
    h = len(feature)
    w = len(feature[0])
    c = len(feature[0][0])
    per = c // groups
    k = len(kernels[0])
    out = [[[0] * groups for _ in range(w - k + 1)] for _ in range(h - k + 1)]
    for g in range(groups):
        for i in range(h - k + 1):
            for j in range(w - k + 1):
                s = 0
                for ch in range(g * per, (g + 1) * per):
                    for a in range(k):
                        for b in range(k):
                            s += feature[i + a][j + b][ch] * kernels[g][a][b]
                out[i][j][g] = s
    return out`,
    testCases: [
      { input: [[[[1, 2], [3, 4]], [[5, 6], [7, 8]], [[1, 1], [1, 1]], [[2, 2], [2, 2]]], [[[1, 0], [0, 0]], [[0, 0], [0, 1]]], 2], expected: [[[1, 8]], [[5, 1]], [[1, 2]]] },
      { input: [[[[1, 1, 1], [1, 1, 1], [1, 1, 1]], [[1, 1, 1], [1, 1, 1], [1, 1, 1]]], [[[1, 1], [1, 1]]], 1], expected: [[[12], [12]]] },
      { input: [[[[1, 5], [2, 6]], [[3, 7], [4, 8]]], [[[1, 1], [1, 1]], [[1, 1], [1, 1]]], 2], expected: [[[10, 26]]] },
    ],
  },
  {
    id: "cv-240",
    title: "BatchNorm Fold into Weights",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Fold batch normalization scale into convolution weights.\n\nFor each output channel o multiply the flattened weights by gamma[o] / sqrt(var[o] + eps) and round to 4 decimal places.",
    starterCode: `def fold_conv_weight(weight, gamma, var, eps):
    # Your code here
    pass`,
    solution: `def fold_conv_weight(weight, gamma, var, eps):
    out = []
    for o, row in enumerate(weight):
        f = gamma[o] / (var[o] + eps) ** 0.5
        out.append([round(v * f, 4) for v in row])
    return out`,
    testCases: [
      { input: [[[2.0, 4.0], [1.0, 3.0]], [1.0, 2.0], [1.0, 4.0], 0.0], expected: [[2.0, 4.0], [1.0, 3.0]] },
      { input: [[[1.0], [1.0]], [2.0, 0.5], [1.0, 1.0], 1e-06], expected: [[2.0], [0.5]] },
      { input: [[[3.0], [6.0]], [1.0, 1.0], [4.0, 9.0], 0.0], expected: [[1.5], [2.0]] },
    ],
  },
  {
    id: "cv-241",
    title: "BatchNorm Fold Bias",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Fold batch normalization into the convolution bias.\n\nFor each output channel o return round((bias[o] - mean[o]) * gamma[o] / sqrt(var[o] + eps) + beta[o], 4).",
    starterCode: `def fold_conv_bias(bias, mean, gamma, var, beta, eps):
    # Your code here
    pass`,
    solution: `def fold_conv_bias(bias, mean, gamma, var, beta, eps):
    return [round((bias[o] - mean[o]) * gamma[o] / (var[o] + eps) ** 0.5 + beta[o], 4)
            for o in range(len(bias))]`,
    testCases: [
      { input: [[1.0, 2.0], [0.0, 1.0], [1.0, 2.0], [1.0, 4.0], [0.0, 1.0], 0.0], expected: [1.0, 2.0] },
      { input: [[0.0], [1.0], [1.0], [1.0], [0.0], 1e-06], expected: [-1.0] },
      { input: [[2.0, 4.0], [0.0, 2.0], [1.0, 1.0], [4.0, 4.0], [0.0, 0.0], 0.0], expected: [1.0, 1.0] },
    ],
  },
  {
    id: "cv-242",
    title: "Conv+ReLU Fusion",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Apply a fused valid-mode convolution, bias add and ReLU to a 2D image.\n\nout[i][j] = max(0, bias + sum of the k x k patch times the kernel). Return integer values.",
    starterCode: `def conv_relu(feature, kernel, bias):
    # Your code here
    pass`,
    solution: `def conv_relu(feature, kernel, bias):
    h = len(feature)
    w = len(feature[0])
    k = len(kernel)
    out = []
    for i in range(h - k + 1):
        row = []
        for j in range(w - k + 1):
            s = bias
            for a in range(k):
                for b in range(k):
                    s += feature[i + a][j + b] * kernel[a][b]
            row.append(max(0, s))
        out.append(row)
    return out`,
    testCases: [
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], [[1, 1], [1, 1]], 0], expected: [[12, 16], [24, 28]] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], [[1, 1], [1, 1]], -10], expected: [[2, 6], [14, 18]] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], [[1, 0], [0, -1]], 0], expected: [[0, 0], [0, 0]] },
    ],
  },
  {
    id: "cv-243",
    title: "Bottleneck Block Param Count",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Count the convolution parameters of a ResNet bottleneck block, excluding bias and batch normalization.\n\nThe three convolutions are 1x1 (cin -> mid), 3x3 (mid -> mid) and 1x1 (mid -> cout). Return the total.",
    starterCode: `def bottleneck_params(cin, mid, cout):
    # Your code here
    pass`,
    solution: `def bottleneck_params(cin, mid, cout):
    return cin * mid + mid * mid * 9 + mid * cout`,
    testCases: [
      { input: [256, 64, 256], expected: 69632 },
      { input: [64, 64, 256], expected: 57344 },
      { input: [128, 32, 128], expected: 17408 },
    ],
  },
  {
    id: "cv-244",
    title: "Inverted Residual Expansion",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the expanded channel count of an inverted residual block, rounded up to a multiple of multiple.\n\nReturn ((cin * ratio + multiple - 1) // multiple) * multiple.",
    starterCode: `def expanded_channels(cin, ratio, multiple):
    # Your code here
    pass`,
    solution: `def expanded_channels(cin, ratio, multiple):
    raw = cin * ratio
    return (raw + multiple - 1) // multiple * multiple`,
    testCases: [
      { input: [24, 6, 8], expected: 144 },
      { input: [32, 3, 8], expected: 96 },
      { input: [16, 3, 8], expected: 48 },
      { input: [30, 1, 8], expected: 32 },
    ],
  },
  {
    id: "cv-245",
    title: "Mobile Block FLOPs",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Count the multiply-accumulate FLOPs of a MobileNetV2-style block at a given spatial size.\n\nAdd 2*h*w*cin*expand for the pointwise expansion, 2*h*w*expand*k*k for the depthwise kernel and 2*h*w*expand*cout for the projection. Return the integer total.",
    starterCode: `def mobile_block_flops(h, w, cin, expand, cout, k):
    # Your code here
    pass`,
    solution: `def mobile_block_flops(h, w, cin, expand, cout, k):
    return 2 * h * w * cin * expand + 2 * h * w * expand * k * k + 2 * h * w * expand * cout`,
    testCases: [
      { input: [4, 4, 3, 6, 2, 3], expected: 2688 },
      { input: [1, 1, 1, 1, 1, 1], expected: 6 },
      { input: [7, 7, 8, 2, 8, 3], expected: 4900 },
    ],
  },
  {
    id: "cv-246",
    title: "Squeeze-Excite Params",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Count the parameters of the squeeze-and-excite bottleneck, excluding biases.\n\nThe first fully connected layer maps channels to channels // reduction and the second maps back. Return the total.",
    starterCode: `def se_params(channels, reduction):
    # Your code here
    pass`,
    solution: `def se_params(channels, reduction):
    reduced = channels // reduction
    return channels * reduced + reduced * channels`,
    testCases: [
      { input: [64, 16], expected: 512 },
      { input: [128, 8], expected: 4096 },
      { input: [16, 4], expected: 128 },
    ],
  },
  {
    id: "cv-247",
    title: "SPP Bin Sizes",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the pooling bin sizes of a spatial pyramid pooling layer.\n\nFor each level l from 1 to levels the bin size is (ceil(h / l), ceil(w / l)). Return one [bin_h, bin_w] per level.",
    starterCode: `def spp_bins(h, w, levels):
    # Your code here
    pass`,
    solution: `def spp_bins(h, w, levels):
    out = []
    for l in range(1, levels + 1):
        out.append([(h + l - 1) // l, (w + l - 1) // l])
    return out`,
    testCases: [
      { input: [13, 13, 3], expected: [[13, 13], [7, 7], [5, 5]] },
      { input: [8, 8, 3], expected: [[8, 8], [4, 4], [3, 3]] },
      { input: [7, 5, 2], expected: [[7, 5], [4, 3]] },
    ],
  },
  {
    id: "cv-248",
    title: "ASPP Output Sizes",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the output sizes of the atrous convolutions in an ASPP module.\n\nFor each rate r the effective kernel is r * (k - 1) + 1 with stride 1; out = n + 2 * pad - effective_k + 1 per dimension. Return one [out_h, out_w] per rate.",
    starterCode: `def aspp_output_size(h, w, k, rates, pad):
    # Your code here
    pass`,
    solution: `def aspp_output_size(h, w, k, rates, pad):
    out = []
    for r in rates:
        eff = r * (k - 1) + 1
        out.append([(h + 2 * pad - eff) + 1, (w + 2 * pad - eff) + 1])
    return out`,
    testCases: [
      { input: [9, 9, 3, [1, 2, 3], 0], expected: [[7, 7], [5, 5], [3, 3]] },
      { input: [9, 9, 3, [1, 2, 3], 2], expected: [[11, 11], [9, 9], [7, 7]] },
      { input: [11, 11, 3, [6], 0], expected: [[-1, -1]] },
    ],
  },
  {
    id: "cv-249",
    title: "CLIP Similarity Matrix",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the normalized image-text similarity matrix in the CLIP style.\n\nL2-normalize every embedding row, take the dot products of all image-text pairs and round to 4 decimal places.",
    starterCode: `def clip_similarity(image_embeds, text_embeds):
    # Your code here
    pass`,
    solution: `def clip_similarity(image_embeds, text_embeds):
    def norm(v):
        n = sum(x * x for x in v) ** 0.5
        return [x / n for x in v]
    a = [norm(v) for v in image_embeds]
    b = [norm(v) for v in text_embeds]
    return [[round(sum(x * y for x, y in zip(r, c)), 4) for c in b] for r in a]`,
    testCases: [
      { input: [[[1, 0], [0, 1]], [[1, 1], [1, -1]]], expected: [[0.7071, 0.7071], [0.7071, -0.7071]] },
      { input: [[[3, 4]], [[1, 0], [0, 1]]], expected: [[0.6, 0.8]] },
      { input: [[[1, 0]], [[0, 1], [1, 0]]], expected: [[0.0, 1.0]] },
    ],
  },
  {
    id: "cv-250",
    title: "Contrastive Logits",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Scale a CLIP similarity matrix by the learned temperature.\n\nReturn every entry divided by temperature, rounded to 4 decimal places.",
    starterCode: `def contrastive_logits(sim_matrix, temperature):
    # Your code here
    pass`,
    solution: `def contrastive_logits(sim_matrix, temperature):
    return [[round(v / temperature, 4) for v in row] for row in sim_matrix]`,
    testCases: [
      { input: [[[1.0, 2.0], [3.0, 4.0]], 2.0], expected: [[0.5, 1.0], [1.5, 2.0]] },
      { input: [[[0.5]], 0.5], expected: [[1.0]] },
      { input: [[[2.0]], 4.0], expected: [[0.5]] },
    ],
  },
  {
    id: "cv-251",
    title: "Optical Flow Endpoint Error",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the mean optical flow endpoint error.\n\nReturn the average of sqrt((pred_x - gt_x)^2 + (pred_y - gt_y)^2) over all pixels, rounded to 4 decimal places.",
    starterCode: `def flow_endpoint_error(pred_x, pred_y, gt_x, gt_y):
    # Your code here
    pass`,
    solution: `def flow_endpoint_error(pred_x, pred_y, gt_x, gt_y):
    total = 0.0
    n = 0
    for i in range(len(pred_x)):
        for j in range(len(pred_x[0])):
            dx = pred_x[i][j] - gt_x[i][j]
            dy = pred_y[i][j] - gt_y[i][j]
            total += (dx * dx + dy * dy) ** 0.5
            n += 1
    return round(total / n, 4)`,
    testCases: [
      { input: [[[1, 2], [3, 4]], [[0, 0], [0, 0]], [[1, 2], [3, 4]], [[0, 0], [0, 0]]], expected: 0.0 },
      { input: [[[0, 0]], [[0, 0]], [[3, 4]], [[0, 0]]], expected: 3.5 },
      { input: [[[1, 1]], [[1, 1]], [[0, 0]], [[0, 0]]], expected: 1.4142 },
    ],
  },
  {
    id: "cv-252",
    title: "Window Attention Shift Mask",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Build the attention mask for shifted-window (Swin) attention over one window.\n\nTokens are laid out row-major on a window_size x window_size grid. For tokens a and b output 0 when both lie on the same side of the shift in rows and columns, otherwise 1. Return the (window_size^2) x (window_size^2) mask of 0/1 values.",
    starterCode: `def shift_window_mask(window_size, shift):
    # Your code here
    pass`,
    solution: `def shift_window_mask(window_size, shift):
    n = window_size * window_size
    reg = []
    for t in range(n):
        ry = 0 if (t // window_size) < shift else 1
        rx = 0 if (t % window_size) < shift else 1
        reg.append((ry, rx))
    out = []
    for a in range(n):
        out.append([0 if reg[a] == reg[b] else 1 for b in range(n)])
    return out`,
    testCases: [
      { input: [2, 1], expected: [[0, 1, 1, 1], [1, 0, 1, 1], [1, 1, 0, 1], [1, 1, 1, 0]] },
      { input: [2, 0], expected: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]] },
      { input: [1, 0], expected: [[0]] },
    ],
  },
  {
    id: "cv-253",
    title: "Deformable Conv Offset Sample",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Sample a deformable convolution feature value at (y + offset_y, x + offset_x).\n\nUse bilinear interpolation with the sample coordinates clamped to the feature bounds and round the result to 4 decimal places.",
    starterCode: `def deform_sample(feature, y, x, offset_y, offset_x):
    # Your code here
    pass`,
    solution: `def deform_sample(feature, y, x, offset_y, offset_x):
    h = len(feature)
    w = len(feature[0])
    sy = max(0.0, min(float(h - 1), y + offset_y))
    sx = max(0.0, min(float(w - 1), x + offset_x))
    y0 = int(sy)
    x0 = int(sx)
    y1 = min(y0 + 1, h - 1)
    x1 = min(x0 + 1, w - 1)
    dy = sy - y0
    dx = sx - x0
    val = (feature[y0][x0] * (1 - dy) * (1 - dx) + feature[y0][x1] * (1 - dy) * dx
           + feature[y1][x0] * dy * (1 - dx) + feature[y1][x1] * dy * dx)
    return round(val, 4)`,
    testCases: [
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], 1, 1, 0, 0], expected: 5 },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], 1, 1, 0.5, 0], expected: 6.5 },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], 1, 1, 1, 1], expected: 9.0 },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], 1, 1, 5, 0], expected: 8.0 },
    ],
  },
  {
    id: "cv-254",
    title: "Non-Local Affinity Row",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Compute one row of the non-local block affinity matrix.\n\nFlatten the H x W x C feature map into positions, take the dot product of the query position with every position, apply softmax over the scores and return the flattened list rounded to 4 decimal places.",
    starterCode: `def nonlocal_affinity(feature, query_index):
    # Your code here
    pass`,
    solution: `def nonlocal_affinity(feature, query_index):
    h = len(feature)
    w = len(feature[0])
    flat = [feature[i][j] for i in range(h) for j in range(w)]
    fq = flat[query_index]
    scores = [sum(a * b for a, b in zip(fq, p)) for p in flat]
    m = max(scores)
    exps = [pow(2.718281828459045, s - m) for s in scores]
    total = sum(exps)
    return [round(e / total, 4) for e in exps]`,
    testCases: [
      { input: [[[[1, 0], [0, 1]], [[1, 1], [1, 1]]], 0], expected: [0.2969, 0.1092, 0.2969, 0.2969] },
      { input: [[[[1, 0], [0, 1]], [[1, 1], [1, 1]]], 3], expected: [0.1345, 0.1345, 0.3655, 0.3655] },
      { input: [[[[0, 0], [0, 0]], [[0, 0], [0, 0]]], 1], expected: [0.25, 0.25, 0.25, 0.25] },
    ],
  },
  {
    id: "cv-255",
    title: "Per-Class AP (VOC)",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Compute average precision for one class from score-ordered detections.\n\nlabels[k] is 1 for a positive detection and 0 otherwise, already sorted by descending score. For every positive add the precision at that rank (tp / (k + 1)), then divide by the number of positives. Return 0.0 when there are no positives, otherwise round to 4 decimal places.",
    starterCode: `def average_precision(labels):
    # Your code here
    pass`,
    solution: `def average_precision(labels):
    pos = sum(labels)
    if pos == 0:
        return 0.0
    total = 0.0
    tp = 0
    for k, v in enumerate(labels):
        if v == 1:
            tp += 1
            total += tp / (k + 1)
    return round(total / pos, 4)`,
    testCases: [
      { input: [[1, 0, 1, 1, 0]], expected: 0.8056 },
      { input: [[0, 1]], expected: 0.5 },
      { input: [[1, 1, 0]], expected: 1.0 },
      { input: [[0, 0]], expected: 0.0 },
    ],
    hint: "Precision at rank k uses only the detections seen so far.",
  },
  {
    id: "cv-256",
    title: "Pose Similarity OKS",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Compute the object keypoint similarity (OKS).\n\nFor every ground-truth keypoint with visibility v > 0 add exp(-d^2 / (2 * scale^2 * sigma_i^2)), where d^2 is the squared distance between the predicted and ground-truth coordinates, then divide by the number of visible keypoints. Round to 4 decimal places and return 0.0 when nothing is visible.",
    starterCode: `def oks(pred, gt, scale, sigmas):
    # Your code here
    pass`,
    solution: `def oks(pred, gt, scale, sigmas):
    import math
    num = 0.0
    den = 0
    for i in range(len(gt)):
        if gt[i][2] > 0:
            dx = pred[i][0] - gt[i][0]
            dy = pred[i][1] - gt[i][1]
            num += math.exp(-(dx * dx + dy * dy) / (2 * scale * scale * sigmas[i] * sigmas[i]))
            den += 1
    if den == 0:
        return 0.0
    return round(num / den, 4)`,
    testCases: [
      { input: [[[0, 0, 1], [10, 10, 1]], [[0, 0, 1], [10, 10, 1]], 1.0, [0.1, 0.1]], expected: 1.0 },
      { input: [[[1, 0, 1], [10, 10, 1]], [[0, 0, 1], [10, 10, 1]], 1.0, [0.1, 0.1]], expected: 0.5 },
      { input: [[[0, 0, 0], [10, 10, 1]], [[0, 0, 1], [10, 10, 1]], 1.0, [0.1, 0.1]], expected: 1.0 },
    ],
  },
  {
    id: "cv-257",
    title: "Chamfer Distance",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Compute the symmetric chamfer distance between two point sets.\n\nAdd the mean minimum squared Euclidean distance from A to B and from B to A, then round to 4 decimal places.",
    starterCode: `def chamfer_distance(a, b):
    # Your code here
    pass`,
    solution: `def chamfer_distance(a, b):
    def one_way(src, dst):
        total = 0.0
        for p in src:
            best = None
            for q in dst:
                d = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2
                if best is None or d < best:
                    best = d
            total += best
        return total / len(src)
    return round(one_way(a, b) + one_way(b, a), 4)`,
    testCases: [
      { input: [[[0, 0], [1, 0]], [[0, 0], [1, 0]]], expected: 0.0 },
      { input: [[[0, 0]], [[3, 4]]], expected: 50.0 },
      { input: [[[0, 0], [0, 1]], [[0, 0], [0, 2]]], expected: 1.0 },
    ],
  },
  {
    id: "cv-258",
    title: "Rotation Error Geodesic",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Compute the geodesic rotation error between two 3x3 rotation matrices in degrees.\n\nReturn degrees(acos(clamp((trace(R1^T R2) - 1) / 2, -1, 1))) rounded to 4 decimal places.",
    starterCode: `def rotation_error(R1, R2):
    # Your code here
    pass`,
    solution: `def rotation_error(R1, R2):
    import math
    t = 0.0
    for i in range(3):
        for j in range(3):
            t += R1[j][i] * R2[i][j]
    c = (t - 1) / 2.0
    c = max(-1.0, min(1.0, c))
    return round(math.degrees(math.acos(c)), 4)`,
    testCases: [
      { input: [[[1, 0, 0], [0, 1, 0], [0, 0, 1]], [[1, 0, 0], [0, 1, 0], [0, 0, 1]]], expected: 0.0 },
      { input: [[[1, 0, 0], [0, 1, 0], [0, 0, 1]], [[0, -1, 0], [1, 0, 0], [0, 0, 1]]], expected: 90.0 },
      { input: [[[0, -1, 0], [1, 0, 0], [0, 0, 1]], [[-1, 0, 0], [0, -1, 0], [0, 0, 1]]], expected: 90.0 },
    ],
  },
  {
    id: "cv-259",
    title: "Plane Fit Residual",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Fit the plane z = a*x + b*y + c by least squares and report the RMS residual.\n\nSolve the 3x3 normal equations, compute the RMS of z - (a*x + b*y + c) over the points and round to 4 decimal places.",
    starterCode: `def plane_fit_residual(points):
    # Your code here
    pass`,
    solution: `def plane_fit_residual(points):
    n = len(points)
    sx = sum(p[0] for p in points)
    sy = sum(p[1] for p in points)
    sz = sum(p[2] for p in points)
    sxx = sum(p[0] * p[0] for p in points)
    sxy = sum(p[0] * p[1] for p in points)
    syy = sum(p[1] * p[1] for p in points)
    sxz = sum(p[0] * p[2] for p in points)
    syz = sum(p[1] * p[2] for p in points)
    A = [[sxx, sxy, sx], [sxy, syy, sy], [sx, sy, n]]
    b = [sxz, syz, sz]
    for col in range(3):
        pivot = col
        for r in range(col + 1, 3):
            if abs(A[r][col]) > abs(A[pivot][col]):
                pivot = r
        A[col], A[pivot] = A[pivot], A[col]
        b[col], b[pivot] = b[pivot], b[col]
        pv = A[col][col]
        for r in range(col + 1, 3):
            f = A[r][col] / pv
            for c in range(col, 3):
                A[r][c] -= f * A[col][c]
            b[r] -= f * b[col]
    coef = [0.0, 0.0, 0.0]
    for r in range(2, -1, -1):
        s = b[r] - sum(A[r][c] * coef[c] for c in range(r + 1, 3))
        coef[r] = s / A[r][r]
    a, bb, c = coef
    total = sum((p[2] - (a * p[0] + bb * p[1] + c)) ** 2 for p in points)
    return round((total / n) ** 0.5, 4)`,
    testCases: [
      { input: [[[0, 0, 1], [1, 0, 3], [0, 1, 4], [1, 1, 6]]], expected: 0.0 },
      { input: [[[0, 0, 0], [1, 0, 2.1], [0, 1, 3.2], [1, 1, 5.0]]], expected: 0.075 },
      { input: [[[0, 0, 2], [1, 0, 2], [2, 0, 2], [0, 1, 2], [1, 1, 2], [2, 1, 2]]], expected: 0.0 },
    ],
  },
  {
    id: "cv-260",
    title: "RANSAC Plane Iteration",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Run one seeded RANSAC iteration for plane fitting.\n\nSeed the random module, sample 3 distinct points, fit the exact plane z = a*x + b*y + c through them, and count points whose absolute vertical residual is at most threshold. Return [sorted_sample_indices, inlier_count]; a degenerate (collinear) sample scores 0.",
    starterCode: `def ransac_plane_iteration(points, threshold, seed):
    # Your code here
    pass`,
    solution: `def ransac_plane_iteration(points, threshold, seed):
    import random
    random.seed(seed)
    sample = sorted(random.sample(range(len(points)), 3))
    p0, p1, p2 = (points[i] for i in sample)
    dx1 = p1[0] - p0[0]
    dy1 = p1[1] - p0[1]
    dz1 = p1[2] - p0[2]
    dx2 = p2[0] - p0[0]
    dy2 = p2[1] - p0[1]
    dz2 = p2[2] - p0[2]
    det = dx1 * dy2 - dx2 * dy1
    if det == 0:
        return [sample, 0]
    a = (dz1 * dy2 - dz2 * dy1) / det
    b = (dx1 * dz2 - dx2 * dz1) / det
    c = p0[2] - a * p0[0] - b * p0[1]
    count = 0
    for p in points:
        if abs(p[2] - (a * p[0] + b * p[1] + c)) <= threshold:
            count += 1
    return [sample, count]`,
    testCases: [
      { input: [[[0, 0, 1], [1, 0, 3], [2, 0, 5], [0, 1, 4], [1, 1, 6], [2, 1, 8], [1, 1, 0]], 0.1, 1], expected: [[0, 1, 4], 6] },
      { input: [[[0, 0, 1], [1, 0, 3], [2, 0, 5], [0, 1, 4], [1, 1, 6], [2, 1, 8], [1, 1, 0]], 0.1, 2], expected: [[0, 5, 6], 3] },
      { input: [[[0, 0, 1], [1, 0, 3], [0, 1, 4]], 0.1, 0], expected: [[0, 1, 2], 3] },
    ],
  },
];
