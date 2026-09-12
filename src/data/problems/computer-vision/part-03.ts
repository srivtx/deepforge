import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "cv-081",
    title: "Image MSE",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Compute the mean squared error between two same-shaped grayscale images.\n\nFor every pixel accumulate (a - b)^2 and divide by the number of pixels, rounding the result to 4 decimal places. The images are non-empty and have equal shapes.",
    starterCode: `def image_mse(a, b):
    # Your code here
    pass`,
    solution: `def image_mse(a, b):
    total = 0.0
    n = 0
    for i in range(len(a)):
        for j in range(len(a[0])):
            d = a[i][j] - b[i][j]
            total += d * d
            n += 1
    return round(total / n, 4)`,
    testCases: [
      { input: [[[1, 2], [3, 4]], [[1, 1], [3, 6]]], expected: 1.25 },
      { input: [[[1, 2], [3, 4]], [[1, 2], [3, 4]]], expected: 0.0 },
      { input: [[[5]], [[3]]], expected: 4.0 },
    ],
    hint: "Square every pixel difference before averaging.",
  },
  {
    id: "cv-082",
    title: "Image MAE",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Compute the mean absolute error between two same-shaped grayscale images.\n\nFor every pixel accumulate abs(a - b) and divide by the number of pixels, rounding the result to 4 decimal places.",
    starterCode: `def image_mae(a, b):
    # Your code here
    pass`,
    solution: `def image_mae(a, b):
    total = 0.0
    n = 0
    for i in range(len(a)):
        for j in range(len(a[0])):
            total += abs(a[i][j] - b[i][j])
            n += 1
    return round(total / n, 4)`,
    testCases: [
      { input: [[[1, 2], [3, 4]], [[1, 1], [3, 6]]], expected: 0.75 },
      { input: [[[10, 20]], [[20, 10]]], expected: 10.0 },
      { input: [[[1, 2], [3, 4]], [[1, 2], [3, 4]]], expected: 0.0 },
    ],
  },
  {
    id: "cv-083",
    title: "Frame Differencing",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Compare two consecutive grayscale frames pixel by pixel.\n\nReturn 255 where abs(curr - prev) is strictly greater than threshold and 0 otherwise. Both frames have the same shape.",
    starterCode: `def frame_diff(prev, curr, threshold):
    # Your code here
    pass`,
    solution: `def frame_diff(prev, curr, threshold):
    out = []
    for i in range(len(prev)):
        row = []
        for j in range(len(prev[0])):
            row.append(255 if abs(curr[i][j] - prev[i][j]) > threshold else 0)
        out.append(row)
    return out`,
    testCases: [
      { input: [[[0, 100], [200, 255]], [[0, 120], [150, 255]], 10], expected: [[0, 255], [255, 0]] },
      { input: [[[5, 5]], [[15, 5]], 9], expected: [[255, 0]] },
      { input: [[[1, 2], [3, 4]], [[1, 2], [3, 4]], 0], expected: [[0, 0], [0, 0]] },
    ],
  },
  {
    id: "cv-084",
    title: "Conv Output Size",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Compute the spatial output size of a strided 2D convolution.\n\nout = (n + 2 * pad - k) // stride + 1 for each dimension. Given height h, width w, kernel size k, stride and pad, return [out_h, out_w].",
    starterCode: `def conv_output_size(h, w, k, stride, pad):
    # Your code here
    pass`,
    solution: `def conv_output_size(h, w, k, stride, pad):
    oh = (h + 2 * pad - k) // stride + 1
    ow = (w + 2 * pad - k) // stride + 1
    return [oh, ow]`,
    testCases: [
      { input: [28, 28, 3, 1, 0], expected: [26, 26] },
      { input: [32, 32, 3, 1, 1], expected: [32, 32] },
      { input: [28, 28, 5, 2, 0], expected: [12, 12] },
      { input: [7, 7, 3, 2, 1], expected: [4, 4] },
    ],
    hint: "Padding adds 2 * pad to each side before the kernel slides.",
  },
  {
    id: "cv-085",
    title: "Transposed Conv Output Size",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Compute the spatial output size of a strided transposed convolution.\n\nout = (n - 1) * stride - 2 * pad + k for each dimension, with no output padding. Given height h, width w, kernel size k, stride and pad, return [out_h, out_w].",
    starterCode: `def transposed_conv_output_size(h, w, k, stride, pad):
    # Your code here
    pass`,
    solution: `def transposed_conv_output_size(h, w, k, stride, pad):
    return [(h - 1) * stride - 2 * pad + k, (w - 1) * stride - 2 * pad + k]`,
    testCases: [
      { input: [7, 7, 3, 2, 1], expected: [13, 13] },
      { input: [4, 4, 3, 1, 0], expected: [6, 6] },
      { input: [6, 6, 4, 2, 1], expected: [12, 12] },
      { input: [5, 10, 3, 2, 0], expected: [11, 21] },
    ],
  },
  {
    id: "cv-086",
    title: "Receptive Field Size",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Compute the receptive field size of a stack of convolution layers.\n\nStart with rf = 1 and jump = 1, then for each (kernel, stride) pair do rf += (kernel - 1) * jump and jump *= stride. The two input lists have equal length.",
    starterCode: `def receptive_field(kernels, strides):
    # Your code here
    pass`,
    solution: `def receptive_field(kernels, strides):
    rf = 1
    jump = 1
    for k, s in zip(kernels, strides):
        rf += (k - 1) * jump
        jump *= s
    return rf`,
    testCases: [
      { input: [[3], [1]], expected: 3 },
      { input: [[3, 3], [1, 1]], expected: 5 },
      { input: [[3, 3, 3], [2, 2, 2]], expected: 15 },
      { input: [[5, 3], [2, 1]], expected: 9 },
    ],
    hint: "Each layer extends the field by (k - 1) times the current jump.",
  },
  {
    id: "cv-087",
    title: "Conv Parameter Count",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Count the trainable parameters of a 2D convolution layer.\n\nThe weight tensor has cin * cout * k * k entries; when bias is True add cout bias values. Return the integer total.",
    starterCode: `def conv_param_count(cin, cout, k, bias):
    # Your code here
    pass`,
    solution: `def conv_param_count(cin, cout, k, bias):
    total = cin * cout * k * k
    if bias:
        total += cout
    return total`,
    testCases: [
      { input: [3, 16, 3, true], expected: 448 },
      { input: [1, 1, 3, false], expected: 9 },
      { input: [3, 64, 3, true], expected: 1792 },
      { input: [64, 128, 1, false], expected: 8192 },
    ],
  },
  {
    id: "cv-088",
    title: "Activation Memory Size",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Compute the memory footprint of an activation tensor in bytes.\n\nReturn batch * channels * h * w * bytes_per_value, where bytes_per_value is 4 for float32 and 2 for float16.",
    starterCode: `def activation_memory(batch, channels, h, w, bytes_per_value):
    # Your code here
    pass`,
    solution: `def activation_memory(batch, channels, h, w, bytes_per_value):
    return batch * channels * h * w * bytes_per_value`,
    testCases: [
      { input: [1, 64, 56, 56, 4], expected: 802816 },
      { input: [8, 3, 224, 224, 4], expected: 4816896 },
      { input: [2, 16, 7, 7, 2], expected: 3136 },
    ],
  },
  {
    id: "cv-089",
    title: "Argmax Class Map",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Given an H x W x C map of class scores, return an H x W map of the argmax class index per pixel.\n\nEach pixel is a list of C scores; ties keep the smallest index.",
    starterCode: `def argmax_class(scores):
    # Your code here
    pass`,
    solution: `def argmax_class(scores):
    out = []
    for row in scores:
        r = []
        for pixel in row:
            best = 0
            for c in range(1, len(pixel)):
                if pixel[c] > pixel[best]:
                    best = c
            r.append(best)
        out.append(r)
    return out`,
    testCases: [
      { input: [[[[0.1, 0.9, 0.5], [0.7, 0.2, 0.1]], [[0.3, 0.3, 0.3], [0.6, 0.4, 0.5]]]], expected: [[1, 0], [0, 0]] },
      { input: [[[[1.0, 2.0]]]], expected: [[1]] },
      { input: [[[[0.2, 0.2, 0.1]]]], expected: [[0]] },
    ],
    hint: "Compare with strict greater-than so equal scores keep the earlier class.",
  },
  {
    id: "cv-090",
    title: "One-Hot Decoding",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Decode a list of one-hot vectors into class indices.\n\nReturn the index of the largest entry of each vector, keeping the smallest index on ties. An empty vector list returns [].",
    starterCode: `def decode_one_hot(vectors):
    # Your code here
    pass`,
    solution: `def decode_one_hot(vectors):
    out = []
    for v in vectors:
        best = 0
        for i in range(1, len(v)):
            if v[i] > v[best]:
                best = i
        out.append(best)
    return out`,
    testCases: [
      { input: [[[1, 0, 0], [0, 1, 0], [0, 0, 1]]], expected: [0, 1, 2] },
      { input: [[[0, 0, 1], [1, 0, 0]]], expected: [2, 0] },
      { input: [[[1]]], expected: [0] },
      { input: [[]], expected: [] },
    ],
  },
  {
    id: "cv-091",
    title: "Top-K Class Indices",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Return the indices of the k largest scores in descending order.\n\nTies are broken by the smaller index. k may be 0 (returns []) or larger than the score list (returns all indices).",
    starterCode: `def top_k_indices(scores, k):
    # Your code here
    pass`,
    solution: `def top_k_indices(scores, k):
    order = sorted(range(len(scores)), key=lambda i: (-scores[i], i))
    return order[:k]`,
    testCases: [
      { input: [[0.1, 0.9, 0.5, 0.9], 2], expected: [1, 3] },
      { input: [[0.1, 0.9, 0.5, 0.9], 1], expected: [1] },
      { input: [[0.1, 0.9, 0.5, 0.9], 4], expected: [1, 3, 2, 0] },
      { input: [[0.1, 0.9, 0.5, 0.9], 0], expected: [] },
    ],
    hint: "Sort the indices by (-score, index) and slice the first k.",
  },
  {
    id: "cv-092",
    title: "Polygon Centroid",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Compute the centroid of a polygon with the shoelace formula.\n\nReturn [round(cx, 4), round(cy, 4)]; for a degenerate zero-area polygon return the mean of the vertices, and return [] when there are no points.",
    starterCode: `def polygon_centroid(points):
    # Your code here
    pass`,
    solution: `def polygon_centroid(points):
    n = len(points)
    if n == 0:
        return []
    area2 = 0.0
    cx = 0.0
    cy = 0.0
    for i in range(n):
        x0, y0 = points[i]
        x1, y1 = points[(i + 1) % n]
        cross = x0 * y1 - x1 * y0
        area2 += cross
        cx += (x0 + x1) * cross
        cy += (y0 + y1) * cross
    if area2 == 0:
        return [round(sum(p[0] for p in points) / n, 4), round(sum(p[1] for p in points) / n, 4)]
    return [round(cx / (3 * area2), 4), round(cy / (3 * area2), 4)]`,
    testCases: [
      { input: [[[0, 0], [4, 0], [0, 4]]], expected: [1.3333, 1.3333] },
      { input: [[[0, 0], [2, 0], [2, 2], [0, 2]]], expected: [1.0, 1.0] },
      { input: [[[0, 0], [1, 1], [2, 2]]], expected: [1.0, 1.0] },
      { input: [[]], expected: [] },
    ],
    hint: "The area is half the summed cross products; the centroid divides the weighted sums by 3 * area2.",
  },
  {
    id: "cv-093",
    title: "Contour Area (Shoelace)",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Compute the area of a polygon with the shoelace formula.\n\nSum the cross products x_i * y_{i+1} - x_{i+1} * y_i around the closed contour, take the absolute value and divide by 2. Round to 4 decimal places.",
    starterCode: `def contour_area(points):
    # Your code here
    pass`,
    solution: `def contour_area(points):
    n = len(points)
    area2 = 0.0
    for i in range(n):
        x0, y0 = points[i]
        x1, y1 = points[(i + 1) % n]
        area2 += x0 * y1 - x1 * y0
    return round(abs(area2) / 2.0, 4)`,
    testCases: [
      { input: [[[0, 0], [1, 0], [1, 1], [0, 1]]], expected: 1.0 },
      { input: [[[0, 0], [2, 0], [0, 2]]], expected: 2.0 },
      { input: [[[0, 0], [1, 1], [2, 2]]], expected: 0.0 },
      { input: [[[0, 0], [0, 1], [1, 1], [1, 0]]], expected: 1.0 },
    ],
    hint: "Vertex order does not matter because the result is made absolute.",
  },
  {
    id: "cv-094",
    title: "Image SNR Estimate",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Estimate the signal-to-noise ratio in decibels.\n\nLet signal energy be sum(clean^2) and noise energy be sum((clean - noisy)^2); return 10 * log10(signal / noise) rounded to 4 decimal places. Return 0.0 when the noise energy is 0.",
    starterCode: `def snr_estimate(clean, noisy):
    # Your code here
    pass`,
    solution: `def snr_estimate(clean, noisy):
    import math
    ps = 0.0
    pn = 0.0
    for i in range(len(clean)):
        for j in range(len(clean[0])):
            ps += clean[i][j] * clean[i][j]
            d = clean[i][j] - noisy[i][j]
            pn += d * d
    if pn == 0:
        return 0.0
    return round(10 * math.log10(ps / pn), 4)`,
    testCases: [
      { input: [[[2, 0]], [[1, 0]]], expected: 6.0206 },
      { input: [[[1, 1]], [[2, 1]]], expected: 3.0103 },
      { input: [[[3]], [[3]]], expected: 0.0 },
      { input: [[[0, 0]], [[0, 0]]], expected: 0.0 },
    ],
    hint: "Noise energy comes from the difference between the clean and noisy images.",
  },
  {
    id: "cv-095",
    title: "Running-Average Background",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Update a running-average background model with a new frame.\n\nnew_background = alpha * background + (1 - alpha) * frame per pixel, rounded to 4 decimal places. alpha is in [0, 1].",
    starterCode: `def update_background(background, frame, alpha):
    # Your code here
    pass`,
    solution: `def update_background(background, frame, alpha):
    out = []
    for i in range(len(background)):
        row = []
        for j in range(len(background[0])):
            row.append(round(alpha * background[i][j] + (1 - alpha) * frame[i][j], 4))
        out.append(row)
    return out`,
    testCases: [
      { input: [[[0, 10]], [[10, 0]], 0.9], expected: [[1.0, 9.0]] },
      { input: [[[0, 10]], [[10, 0]], 1.0], expected: [[0.0, 10.0]] },
      { input: [[[0, 10]], [[10, 0]], 0.0], expected: [[10.0, 0.0]] },
      { input: [[[100, 100], [100, 100]], [[0, 0], [200, 0]], 0.5], expected: [[50.0, 50.0], [150.0, 50.0]] },
    ],
    hint: "alpha weights the old background; 1 - alpha weights the new frame.",
  },
  {
    id: "cv-096",
    title: "Gray-World Color Balance",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Balance the colors of an RGB image with the gray-world assumption.\n\nCompute the per-channel means, let target be their average, then scale each channel by target / mean, rounding to integers and clamping to [0, 255]. A channel whose mean is 0 is left unchanged.",
    starterCode: `def gray_world(image):
    # Your code here
    pass`,
    solution: `def gray_world(image):
    h = len(image)
    w = len(image[0])
    sums = [0, 0, 0]
    for row in image:
        for p in row:
            for c in range(3):
                sums[c] += p[c]
    means = [s / (h * w) for s in sums]
    overall = sum(means) / 3.0
    factors = [overall / m if m != 0 else 1.0 for m in means]
    out = []
    for row in image:
        r = []
        for p in row:
            r.append([max(0, min(255, round(p[c] * factors[c]))) for c in range(3)])
        out.append(r)
    return out`,
    testCases: [
      { input: [[[[100, 150, 50]]]], expected: [[[100, 100, 100]]] },
      { input: [[[[200, 100, 0]]]], expected: [[[100, 100, 0]]] },
      { input: [[[[128, 128, 128]]]], expected: [[[128, 128, 128]]] },
    ],
    hint: "Scale each channel so that all three channel means become equal.",
  },
  {
    id: "cv-097",
    title: "Image PSNR",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the peak signal-to-noise ratio between two same-shaped images in decibels.\n\nReturn 10 * log10(max_value^2 / MSE) rounded to 4 decimal places, where MSE is the mean squared pixel error. Return 0.0 when the images are identical.",
    starterCode: `def image_psnr(a, b, max_value):
    # Your code here
    pass`,
    solution: `def image_psnr(a, b, max_value):
    import math
    total = 0.0
    n = 0
    for i in range(len(a)):
        for j in range(len(a[0])):
            d = a[i][j] - b[i][j]
            total += d * d
            n += 1
    mse = total / n
    if mse == 0:
        return 0.0
    return round(10 * math.log10(max_value * max_value / mse), 4)`,
    testCases: [
      { input: [[[1, 2], [3, 4]], [[1, 1], [3, 6]], 255], expected: 47.1617 },
      { input: [[[0]], [[1]], 7], expected: 16.902 },
      { input: [[[1, 2], [3, 4]], [[1, 2], [3, 4]], 255], expected: 0.0 },
      { input: [[[10, 20]], [[12, 18]], 255], expected: 42.1102 },
    ],
  },
  {
    id: "cv-098",
    title: "LBP 3x3 Pattern",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the 3x3 Local Binary Pattern for every interior pixel.\n\nVisit neighbors clockwise starting from the top-left: (-1, -1), (-1, 0), (-1, 1), (0, 1), (1, 1), (1, 0), (1, -1), (0, -1). Set bit i when neighbor i >= center and return sum(bit_i * 2^i). The output shape is (H - 2) x (W - 2).",
    starterCode: `def lbp_pattern(image):
    # Your code here
    pass`,
    solution: `def lbp_pattern(image):
    order = [(-1, -1), (-1, 0), (-1, 1), (0, 1), (1, 1), (1, 0), (1, -1), (0, -1)]
    h = len(image)
    w = len(image[0])
    out = []
    for i in range(1, h - 1):
        row = []
        for j in range(1, w - 1):
            val = 0
            for b, (di, dj) in enumerate(order):
                if image[i + di][j + dj] >= image[i][j]:
                    val |= 1 << b
            row.append(val)
        out.append(row)
    return out`,
    testCases: [
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: [[120]] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12]]], expected: [[120], [120]] },
      { input: [[[5, 5, 5], [5, 5, 5], [5, 5, 5]]], expected: [[255]] },
      { input: [[[1, 1, 1], [1, 9, 1], [1, 1, 1]]], expected: [[0]] },
    ],
    hint: "Bit 0 is the top-left neighbor and bit 7 the left neighbor.",
  },
  {
    id: "cv-099",
    title: "Color Histogram RGB",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute per-channel histograms of an RGB image with a fixed number of bins.\n\nThe bin index for a value v is v * bins // 256. Return [red_hist, green_hist, blue_hist], each a list of bins counts.",
    starterCode: `def rgb_histogram(image, bins):
    # Your code here
    pass`,
    solution: `def rgb_histogram(image, bins):
    rh = [0] * bins
    gh = [0] * bins
    bh = [0] * bins
    for row in image:
        for p in row:
            rh[p[0] * bins // 256] += 1
            gh[p[1] * bins // 256] += 1
            bh[p[2] * bins // 256] += 1
    return [rh, gh, bh]`,
    testCases: [
      { input: [[[[0, 255, 128], [64, 64, 255]]], 4], expected: [[1, 1, 0, 0], [0, 1, 0, 1], [0, 0, 1, 1]] },
      { input: [[[[0, 0, 0], [255, 255, 255]]], 2], expected: [[1, 1], [1, 1], [1, 1]] },
      { input: [[[[10, 20, 30], [250, 240, 230]]], 4], expected: [[1, 0, 0, 1], [1, 0, 0, 1], [1, 0, 0, 1]] },
    ],
  },
  {
    id: "cv-100",
    title: "Histogram Intersection",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the histogram intersection of two equal-length histograms.\n\nReturn the sum of min(h1[i], h2[i]) over all bins.",
    starterCode: `def histogram_intersection(h1, h2):
    # Your code here
    pass`,
    solution: `def histogram_intersection(h1, h2):
    return sum(min(a, b) for a, b in zip(h1, h2))`,
    testCases: [
      { input: [[1, 2, 3], [2, 1, 3]], expected: 5 },
      { input: [[1, 0], [0, 1]], expected: 0 },
      { input: [[2, 4, 6], [2, 4, 6]], expected: 12 },
    ],
  },
  {
    id: "cv-101",
    title: "Chi-Square Histogram Distance",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the chi-square distance between two histograms.\n\nSum (a - b)^2 / (a + b) over all bins, skipping bins where a + b is 0, and round to 4 decimal places.",
    starterCode: `def chi_square_distance(h1, h2):
    # Your code here
    pass`,
    solution: `def chi_square_distance(h1, h2):
    total = 0.0
    for a, b in zip(h1, h2):
        if a + b > 0:
            total += (a - b) * (a - b) / (a + b)
    return round(total, 4)`,
    testCases: [
      { input: [[1, 2], [2, 1]], expected: 0.6667 },
      { input: [[1, 2], [1, 2]], expected: 0.0 },
      { input: [[0, 0], [0, 0]], expected: 0.0 },
      { input: [[4, 0], [0, 4]], expected: 8.0 },
    ],
  },
  {
    id: "cv-102",
    title: "Global NCC",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the normalized cross-correlation between two same-shaped images.\n\nSubtract each image mean, then divide the dot product of the centered images by the product of their L2 norms. Return 0.0 when either image is constant, otherwise round to 4 decimal places.",
    starterCode: `def global_ncc(a, b):
    # Your code here
    pass`,
    solution: `def global_ncc(a, b):
    fa = [v for row in a for v in row]
    fb = [v for row in b for v in row]
    n = len(fa)
    ma = sum(fa) / n
    mb = sum(fb) / n
    num = 0.0
    da = 0.0
    db = 0.0
    for x, y in zip(fa, fb):
        dx = x - ma
        dy = y - mb
        num += dx * dy
        da += dx * dx
        db += dy * dy
    den = (da ** 0.5) * (db ** 0.5)
    if den == 0:
        return 0.0
    return round(num / den, 4)`,
    testCases: [
      { input: [[[1, 2], [3, 4]], [[1, 2], [3, 4]]], expected: 1.0 },
      { input: [[[1, 2], [3, 4]], [[-1, -2], [-3, -4]]], expected: -1.0 },
      { input: [[[1, 2], [3, 4]], [[7, 7], [7, 7]]], expected: 0.0 },
      { input: [[[1, 2], [3, 4]], [[1, 2], [3, 5]]], expected: 0.9827 },
    ],
  },
  {
    id: "cv-103",
    title: "1D Kalman Predict",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Perform the 1D predict step of a Kalman filter tracking position with constant velocity.\n\nGiven state x, velocity v, covariance p and process noise q, return [round(x + v, 4), round(p + q, 4)].",
    starterCode: `def kalman_predict(x, v, p, q):
    # Your code here
    pass`,
    solution: `def kalman_predict(x, v, p, q):
    return [round(x + v, 4), round(p + q, 4)]`,
    testCases: [
      { input: [0, 1, 1, 0.1], expected: [1, 1.1] },
      { input: [5, 0, 2, 1], expected: [5, 3] },
      { input: [-1, 2, 0, 0], expected: [1, 0] },
      { input: [1.5, 0.5, 2.5, 0.5], expected: [2.0, 3.0] },
    ],
  },
  {
    id: "cv-104",
    title: "Chroma Key Removal",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Replace pixels similar to a chroma key color with black.\n\nFor every pixel compute the Euclidean distance in RGB space to key_color; if it is less than or equal to tolerance replace the pixel with [0, 0, 0], otherwise keep it unchanged.",
    starterCode: `def chroma_key(image, key_color, tolerance):
    # Your code here
    pass`,
    solution: `def chroma_key(image, key_color, tolerance):
    out = []
    for row in image:
        r = []
        for p in row:
            d = ((p[0] - key_color[0]) ** 2 + (p[1] - key_color[1]) ** 2 + (p[2] - key_color[2]) ** 2) ** 0.5
            if d <= tolerance:
                r.append([0, 0, 0])
            else:
                r.append([p[0], p[1], p[2]])
        out.append(r)
    return out`,
    testCases: [
      { input: [[[[0, 255, 0], [100, 100, 100]]], [0, 255, 0], 0], expected: [[[0, 0, 0], [100, 100, 100]]] },
      { input: [[[[0, 255, 0], [5, 250, 5]]], [0, 255, 0], 10], expected: [[[0, 0, 0], [0, 0, 0]]] },
      { input: [[[[0, 128, 0], [0, 0, 255]]], [0, 255, 0], 0], expected: [[[0, 128, 0], [0, 0, 255]]] },
    ],
  },
  {
    id: "cv-105",
    title: "Skin-Ratio Mask",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Build a skin mask with the classic RGB rule.\n\nA pixel is skin (255) when r > 95, g > 40, b > 20, max(r, g, b) - min(r, g, b) > 15 and abs(r - g) > 15 all hold; otherwise output 0.",
    starterCode: `def skin_ratio(image):
    # Your code here
    pass`,
    solution: `def skin_ratio(image):
    out = []
    for row in image:
        r = []
        for p in row:
            rr, gg, bb = p
            mx = max(p)
            mn = min(p)
            if rr > 95 and gg > 40 and bb > 20 and mx - mn > 15 and abs(rr - gg) > 15:
                r.append(255)
            else:
                r.append(0)
        out.append(r)
    return out`,
    testCases: [
      { input: [[[[120, 80, 60]]]], expected: [[255]] },
      { input: [[[[90, 80, 60]]]], expected: [[0]] },
      { input: [[[[120, 110, 60]]]], expected: [[0]] },
      { input: [[[[100, 50, 30]]]], expected: [[255]] },
    ],
  },
  {
    id: "cv-106",
    title: "Largest Connected Component Area",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Find the area of the largest 4-connected component of 1-valued pixels in a binary mask.\n\nReturn 0 when there are no 1 pixels.",
    starterCode: `def largest_component_area(mask):
    # Your code here
    pass`,
    solution: `def largest_component_area(mask):
    h = len(mask)
    w = len(mask[0]) if h else 0
    seen = [[False] * w for _ in range(h)]
    best = 0
    for i in range(h):
        for j in range(w):
            if mask[i][j] and not seen[i][j]:
                area = 0
                stack = [(i, j)]
                seen[i][j] = True
                while stack:
                    ci, cj = stack.pop()
                    area += 1
                    for di, dj in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                        ni, nj = ci + di, cj + dj
                        if 0 <= ni < h and 0 <= nj < w and mask[ni][nj] and not seen[ni][nj]:
                            seen[ni][nj] = True
                            stack.append((ni, nj))
                if area > best:
                    best = area
    return best`,
    testCases: [
      { input: [[[1, 1, 0], [0, 1, 0], [1, 0, 0]]], expected: 3 },
      { input: [[[1, 0], [0, 1]]], expected: 1 },
      { input: [[[0, 0], [0, 0]]], expected: 0 },
      { input: [[[1, 1, 1], [1, 1, 1]]], expected: 6 },
    ],
  },
  {
    id: "cv-107",
    title: "Component Area Filter",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Remove small connected components from a binary mask.\n\nKeep only 4-connected components that have at least min_area pixels; all other pixels become 0. The output has the same shape as the input mask.",
    starterCode: `def filter_components(mask, min_area):
    # Your code here
    pass`,
    solution: `def filter_components(mask, min_area):
    h = len(mask)
    w = len(mask[0]) if h else 0
    seen = [[False] * w for _ in range(h)]
    out = [[0] * w for _ in range(h)]
    for i in range(h):
        for j in range(w):
            if mask[i][j] and not seen[i][j]:
                comp = []
                stack = [(i, j)]
                seen[i][j] = True
                while stack:
                    ci, cj = stack.pop()
                    comp.append((ci, cj))
                    for di, dj in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                        ni, nj = ci + di, cj + dj
                        if 0 <= ni < h and 0 <= nj < w and mask[ni][nj] and not seen[ni][nj]:
                            seen[ni][nj] = True
                            stack.append((ni, nj))
                if len(comp) >= min_area:
                    for ci, cj in comp:
                        out[ci][cj] = 1
    return out`,
    testCases: [
      { input: [[[1, 1, 0], [0, 1, 0], [1, 0, 1]], 2], expected: [[1, 1, 0], [0, 1, 0], [0, 0, 0]] },
      { input: [[[1, 1, 0], [0, 1, 0], [1, 0, 1]], 1], expected: [[1, 1, 0], [0, 1, 0], [1, 0, 1]] },
      { input: [[[1, 1, 0], [0, 1, 0], [1, 0, 1]], 4], expected: [[0, 0, 0], [0, 0, 0], [0, 0, 0]] },
    ],
  },
  {
    id: "cv-108",
    title: "Bounding Boxes from Mask",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Return the bounding boxes of all 4-connected components of 1-valued pixels.\n\nEach box is [min_row, min_col, max_row, max_col] with inclusive indices, and boxes are listed in row-major order of the first pixel encountered. An empty mask returns [].",
    starterCode: `def component_boxes(mask):
    # Your code here
    pass`,
    solution: `def component_boxes(mask):
    h = len(mask)
    w = len(mask[0]) if h else 0
    seen = [[False] * w for _ in range(h)]
    boxes = []
    for i in range(h):
        for j in range(w):
            if mask[i][j] and not seen[i][j]:
                r0 = r1 = i
                c0 = c1 = j
                stack = [(i, j)]
                seen[i][j] = True
                while stack:
                    ci, cj = stack.pop()
                    r0 = min(r0, ci)
                    r1 = max(r1, ci)
                    c0 = min(c0, cj)
                    c1 = max(c1, cj)
                    for di, dj in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                        ni, nj = ci + di, cj + dj
                        if 0 <= ni < h and 0 <= nj < w and mask[ni][nj] and not seen[ni][nj]:
                            seen[ni][nj] = True
                            stack.append((ni, nj))
                boxes.append([r0, c0, r1, c1])
    return boxes`,
    testCases: [
      { input: [[[1, 1, 0], [0, 1, 0], [0, 0, 1]]], expected: [[0, 0, 1, 1], [2, 2, 2, 2]] },
      { input: [[[1, 0], [0, 1]]], expected: [[0, 0, 0, 0], [1, 1, 1, 1]] },
      { input: [[[0, 0], [0, 0]]], expected: [] },
      { input: [[[1, 1], [1, 1]]], expected: [[0, 0, 1, 1]] },
    ],
  },
  {
    id: "cv-109",
    title: "Anchor IoU Matching",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Match every anchor box to the ground-truth box with the highest IoU.\n\nBoxes use [x1, y1, x2, y2] continuous coordinates. Return the ground-truth index when the best IoU is at least threshold, otherwise -1; ties keep the smallest ground-truth index.",
    starterCode: `def match_anchors(anchors, gt_boxes, threshold):
    # Your code here
    pass`,
    solution: `def match_anchors(anchors, gt_boxes, threshold):
    result = []
    for a in anchors:
        ax1, ay1, ax2, ay2 = a
        best = -1
        best_iou = -1.0
        for k, g in enumerate(gt_boxes):
            bx1, by1, bx2, by2 = g
            ix1 = max(ax1, bx1)
            iy1 = max(ay1, by1)
            ix2 = min(ax2, bx2)
            iy2 = min(ay2, by2)
            iw = ix2 - ix1
            ih = iy2 - iy1
            inter = 0.0 if iw <= 0 or ih <= 0 else iw * ih
            union = (ax2 - ax1) * (ay2 - ay1) + (bx2 - bx1) * (by2 - by1) - inter
            v = inter / union if union > 0 else 0.0
            if v > best_iou:
                best_iou = v
                best = k
        result.append(best if best_iou >= threshold else -1)
    return result`,
    testCases: [
      { input: [[[0, 0, 2, 2], [10, 10, 12, 12]], [[0, 0, 2, 2], [9, 9, 13, 13]], 0.5], expected: [0, -1] },
      { input: [[[0, 0, 2, 2], [10, 10, 12, 12]], [[0, 0, 2, 2], [9, 9, 13, 13]], 0.2], expected: [0, 1] },
      { input: [[[0, 0, 2, 2]], [], 0.5], expected: [-1] },
      { input: [[], [[0, 0, 2, 2]], 0.5], expected: [] },
    ],
    hint: "Compute the IoU against every ground-truth box and keep the best match.",
  },
  {
    id: "cv-110",
    title: "Conv FLOPs Count",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Count the multiply-accumulate floating point operations of a 2D convolution.\n\nReturn 2 * cin * cout * k * k * h_out * w_out (bias excluded), where the factor 2 accounts for each multiply and add.",
    starterCode: `def conv_flops(cin, cout, k, h_out, w_out):
    # Your code here
    pass`,
    solution: `def conv_flops(cin, cout, k, h_out, w_out):
    return 2 * cin * cout * k * k * h_out * w_out`,
    testCases: [
      { input: [3, 16, 3, 28, 28], expected: 677376 },
      { input: [1, 1, 3, 5, 5], expected: 450 },
      { input: [64, 128, 3, 14, 14], expected: 28901376 },
    ],
  },
  {
    id: "cv-111",
    title: "Batch-Norm Inference",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Apply batch normalization at inference time to an H x W x C tensor.\n\nmean, var, gamma and beta are per-channel lists. For each pixel and channel compute gamma[c] * (x - mean[c]) / sqrt(var[c] + eps) + beta[c], rounded to 4 decimal places.",
    starterCode: `def batchnorm_inference(x, mean, var, gamma, beta, eps):
    # Your code here
    pass`,
    solution: `def batchnorm_inference(x, mean, var, gamma, beta, eps):
    h = len(x)
    w = len(x[0])
    c = len(x[0][0])
    out = []
    for i in range(h):
        row = []
        for j in range(w):
            row.append([round(gamma[ch] * (x[i][j][ch] - mean[ch]) / (var[ch] + eps) ** 0.5 + beta[ch], 4) for ch in range(c)])
        out.append(row)
    return out`,
    testCases: [
      { input: [[[[1, 2], [3, 4]]], [1, 2], [1, 4], [1, 0.5], [0, 1], 1e-05], expected: [[[0.0, 1.0], [2.0, 1.5]]] },
      { input: [[[[5, 5]]], [5, 5], [4, 4], [2, 2], [1, 1], 0], expected: [[[1.0, 1.0]]] },
      { input: [[[[0, 0], [2, 2]]], [1, 1], [1, 1], [1, 3], [0, 0], 0], expected: [[[-1.0, -3.0], [1.0, 3.0]]] },
    ],
    hint: "Normalize with the running statistics and then apply the per-channel affine transform.",
  },
  {
    id: "cv-112",
    title: "Per-Channel Softmax Map",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Apply softmax over the class dimension of an H x W x C score map.\n\nFor each pixel subtract the maximum score before exponentiating for numerical stability, then normalize the exponentials and round each probability to 4 decimal places.",
    starterCode: `def softmax_map(scores):
    # Your code here
    pass`,
    solution: `def softmax_map(scores):
    out = []
    for row in scores:
        r = []
        for pixel in row:
            m = max(pixel)
            exps = [pow(2.718281828459045, v - m) for v in pixel]
            total = sum(exps)
            r.append([round(e / total, 4) for e in exps])
        out.append(r)
    return out`,
    testCases: [
      { input: [[[[1, 1]]]], expected: [[[0.5, 0.5]]] },
      { input: [[[[0, 0, 0]]]], expected: [[[0.3333, 0.3333, 0.3333]]] },
      { input: [[[[1000, 1000]]]], expected: [[[0.5, 0.5]]] },
      { input: [[[[1, 3], [2, 0]]]], expected: [[[0.1192, 0.8808], [0.8808, 0.1192]]] },
    ],
    hint: "Subtracting the max keeps the exponentials from overflowing.",
  },
  {
    id: "cv-113",
    title: "Letterbox Resize",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the letterbox geometry that fits an h x w image into a target x target square.\n\nScale by the smaller ratio, round the new height and width, then set top = (target - new_h) // 2 and left = (target - new_w) // 2. Return [new_h, new_w, top, left].",
    starterCode: `def letterbox_size(h, w, target):
    # Your code here
    pass`,
    solution: `def letterbox_size(h, w, target):
    scale = min(target / h, target / w)
    new_h = round(h * scale)
    new_w = round(w * scale)
    top = (target - new_h) // 2
    left = (target - new_w) // 2
    return [new_h, new_w, top, left]`,
    testCases: [
      { input: [100, 200, 256], expected: [128, 256, 64, 0] },
      { input: [50, 100, 64], expected: [32, 64, 16, 0] },
      { input: [100, 100, 64], expected: [64, 64, 0, 0] },
      { input: [300, 400, 256], expected: [192, 256, 32, 0] },
    ],
  },
  {
    id: "cv-114",
    title: "Gamma Auto from Mean",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Choose the gamma correction that maps the image mean intensity to 0.5.\n\nCompute gamma = log(0.5) / log(mean / 255) and round to 4 decimal places. Return 1.0 when the mean is 0 or 255.",
    starterCode: `def auto_gamma(image):
    # Your code here
    pass`,
    solution: `def auto_gamma(image):
    import math
    flat = [v for row in image for v in row]
    m = (sum(flat) / len(flat)) / 255.0
    if m <= 0 or m >= 1:
        return 1.0
    return round(math.log(0.5) / math.log(m), 4)`,
    testCases: [
      { input: [[[128, 128], [128, 128]]], expected: 1.0057 },
      { input: [[[64, 64], [64, 64]]], expected: 0.5014 },
      { input: [[[192, 192], [192, 192]]], expected: 2.4427 },
      { input: [[[0, 0]]], expected: 1.0 },
    ],
    hint: "Divide the mean by 255 before taking logarithms.",
  },
  {
    id: "cv-115",
    title: "Noise Estimate (MAD)",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Estimate the noise standard deviation from horizontal neighbor differences.\n\nTake the median of abs(I[i][j+1] - I[i][j]) over all adjacent pairs and divide it by 0.6745, rounding to 4 decimal places. An image with no horizontal pairs returns 0.0.",
    starterCode: `def noise_mad(image):
    # Your code here
    pass`,
    solution: `def noise_mad(image):
    diffs = []
    for row in image:
        for j in range(len(row) - 1):
            diffs.append(abs(row[j + 1] - row[j]))
    diffs.sort()
    n = len(diffs)
    if n == 0:
        return 0.0
    if n % 2 == 1:
        med = diffs[n // 2]
    else:
        med = (diffs[n // 2 - 1] + diffs[n // 2]) / 2.0
    return round(med / 0.6745, 4)`,
    testCases: [
      { input: [[[0, 10, 0], [10, 0, 10]]], expected: 14.8258 },
      { input: [[[0, 2, 4]]], expected: 2.9652 },
      { input: [[[5]]], expected: 0.0 },
      { input: [[[7, 7], [7, 7]]], expected: 0.0 },
    ],
  },
  {
    id: "cv-116",
    title: "Ordered Dithering 2x2 Bayer",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Apply 2x2 ordered dithering with the Bayer matrix [[0, 2], [3, 1]].\n\nA pixel becomes 255 when its value is strictly greater than 255 * (m + 0.5) / 4, where m is the matrix entry at (i mod 2, j mod 2); otherwise the pixel becomes 0.",
    starterCode: `def bayer_dither(image):
    # Your code here
    pass`,
    solution: `def bayer_dither(image):
    matrix = [[0, 2], [3, 1]]
    out = []
    for i in range(len(image)):
        row = []
        for j in range(len(image[0])):
            t = 255.0 * (matrix[i % 2][j % 2] + 0.5) / 4
            row.append(255 if image[i][j] > t else 0)
        out.append(row)
    return out`,
    testCases: [
      { input: [[[32, 96], [160, 224]]], expected: [[255, 0], [0, 255]] },
      { input: [[[32, 160], [224, 96]]], expected: [[255, 255], [255, 255]] },
      { input: [[[0, 0], [0, 0]]], expected: [[0, 0], [0, 0]] },
      { input: [[[255, 255], [255, 255]]], expected: [[255, 255], [255, 255]] },
    ],
  },
  {
    id: "cv-117",
    title: "NCC Template Matching",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Slide a template over an image and find the valid position with the highest normalized cross-correlation.\n\nFor each valid top-left position, subtract the patch and template means and compute the correlation coefficient. Return [row, col, score] with the score rounded to 4 decimals; constant patches score 0.0 and ties keep the first position in row-major order.",
    starterCode: `def ncc_template_match(image, template):
    # Your code here
    pass`,
    solution: `def ncc_template_match(image, template):
    h = len(image)
    w = len(image[0])
    th = len(template)
    tw = len(template[0])
    best_r = 0
    best_c = 0
    best = -2.0
    for i in range(h - th + 1):
        for j in range(w - tw + 1):
            vals = [image[i + a][j + b] for a in range(th) for b in range(tw)]
            tvals = [template[a][b] for a in range(th) for b in range(tw)]
            n = len(vals)
            mi = sum(vals) / n
            mt = sum(tvals) / n
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
            score = 0.0 if den == 0 else num / den
            if score > best:
                best = score
                best_r = i
                best_c = j
    return [best_r, best_c, round(best, 4)]`,
    testCases: [
      { input: [[[0, 0, 0], [0, 1, 2], [0, 3, 4]], [[1, 2], [3, 4]]], expected: [1, 1, 1.0] },
      { input: [[[0, 0, 0], [0, 1, 2], [0, 3, 4]], [[0, 0], [0, 1]]], expected: [0, 0, 1.0] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], [[5, 5], [5, 5]]], expected: [0, 0, 0.0] },
      { input: [[[0, 1, 0], [1, 0, 1], [0, 1, 0]], [[1, 0], [0, 1]]], expected: [0, 1, 1.0] },
    ],
    hint: "A constant patch has zero variance, so its correlation is defined as 0.0.",
  },
  {
    id: "cv-118",
    title: "Lucas-Kanade Single Pixel",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Solve the Lucas-Kanade optical flow equation for one window.\n\nAccumulate the 2x2 structure matrix A from the spatial gradients ix and iy (sum of ix^2, ix*iy, iy^2) and the vector b = [-sum(ix * it), -sum(iy * it)], then return (u, v) = A^-1 b rounded to 4 decimal places. Return [0.0, 0.0] when the determinant is 0.",
    starterCode: `def lucas_kanade_pixel(ix, iy, it):
    # Your code here
    pass`,
    solution: `def lucas_kanade_pixel(ix, iy, it):
    sxx = 0.0
    sxy = 0.0
    syy = 0.0
    sxit = 0.0
    syit = 0.0
    for i in range(len(ix)):
        for j in range(len(ix[0])):
            gx = ix[i][j]
            gy = iy[i][j]
            gt = it[i][j]
            sxx += gx * gx
            sxy += gx * gy
            syy += gy * gy
            sxit += gx * gt
            syit += gy * gt
    det = sxx * syy - sxy * sxy
    if det == 0:
        return [0.0, 0.0]
    u = (syy * (-sxit) - sxy * (-syit)) / det
    v = (sxx * (-syit) - sxy * (-sxit)) / det
    return [round(u, 4), round(v, 4)]`,
    testCases: [
      { input: [[[1, 1, 1], [1, 1, 1], [1, 1, 1]], [[0, 0, 0], [1, 1, 1], [2, 2, 2]], [[-1, -1, -1], [-1, -1, -1], [-1, -1, -1]]], expected: [1.0, 0.0] },
      { input: [[[1, 1, 1], [1, 1, 1], [1, 1, 1]], [[0, 0, 0], [1, 1, 1], [2, 2, 2]], [[-2, -2, -2], [-2, -2, -2], [-2, -2, -2]]], expected: [2.0, 0.0] },
      { input: [[[1, 1, 1], [1, 1, 1], [1, 1, 1]], [[0, 0, 0], [0, 0, 0], [0, 0, 0]], [[-1, -1, -1], [-1, -1, -1], [-1, -1, -1]]], expected: [0.0, 0.0] },
      { input: [[[1, 0, 0], [0, 1, 0], [0, 0, 1]], [[0, 0, 0], [0, 0, 0], [0, 0, 1]], [[-1, -1, -1], [-1, -1, -1], [-1, -1, -1]]], expected: [1.0, 0.0] },
    ],
    hint: "Singular windows carry no flow information, so return zeros.",
  },
  {
    id: "cv-119",
    title: "Distance Transform (Chamfer)",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Compute the city-block distance from every pixel to the nearest zero pixel of a binary mask.\n\nUse two chamfer sweeps with unit steps over the 4 orthogonal neighbors (forward pass then backward pass). Pixels with value 1 and no reachable zero keep the sentinel H * W + 1.",
    starterCode: `def distance_transform(mask):
    # Your code here
    pass`,
    solution: `def distance_transform(mask):
    h = len(mask)
    w = len(mask[0]) if h else 0
    inf = h * w + 1
    d = [[0 if v == 0 else inf for v in row] for row in mask]
    for i in range(h):
        for j in range(w):
            if i > 0:
                d[i][j] = min(d[i][j], d[i - 1][j] + 1)
            if j > 0:
                d[i][j] = min(d[i][j], d[i][j - 1] + 1)
    for i in range(h - 1, -1, -1):
        for j in range(w - 1, -1, -1):
            if i < h - 1:
                d[i][j] = min(d[i][j], d[i + 1][j] + 1)
            if j < w - 1:
                d[i][j] = min(d[i][j], d[i][j + 1] + 1)
    return d`,
    testCases: [
      { input: [[[1, 1, 1], [1, 0, 1], [1, 1, 1]]], expected: [[2, 1, 2], [1, 0, 1], [2, 1, 2]] },
      { input: [[[0, 1, 1], [1, 1, 1], [1, 1, 1]]], expected: [[0, 1, 2], [1, 2, 3], [2, 3, 4]] },
      { input: [[[0, 0], [0, 0]]], expected: [[0, 0], [0, 0]] },
      { input: [[[1, 1], [1, 1]]], expected: [[5, 5], [5, 5]] },
    ],
  },
  {
    id: "cv-120",
    title: "Convex Hull (Gift Wrapping)",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Compute the convex hull of a list of distinct integer points with the gift-wrapping algorithm.\n\nReturn the hull vertices in counterclockwise order starting from the lowest-x, then lowest-y point, skipping collinear intermediate points. Zero or one input points are returned as-is.",
    starterCode: `def convex_hull(points):
    # Your code here
    pass`,
    solution: `def convex_hull(points):
    if len(points) <= 1:
        return [list(p) for p in points]
    start = min(points, key=lambda p: (p[0], p[1]))
    hull = []
    cur = start
    while True:
        hull.append(list(cur))
        nxt = None
        for p in points:
            if p == cur:
                continue
            if nxt is None:
                nxt = p
                continue
            c = (nxt[0] - cur[0]) * (p[1] - cur[1]) - (nxt[1] - cur[1]) * (p[0] - cur[0])
            if c < 0:
                nxt = p
            elif c == 0:
                d_new = (p[0] - cur[0]) ** 2 + (p[1] - cur[1]) ** 2
                d_old = (nxt[0] - cur[0]) ** 2 + (nxt[1] - cur[1]) ** 2
                if d_new > d_old:
                    nxt = p
        cur = nxt
        if cur == start:
            break
    return hull`,
    testCases: [
      { input: [[[2, 0], [0, 0], [2, 2], [0, 2], [1, 1]]], expected: [[0, 0], [2, 0], [2, 2], [0, 2]] },
      { input: [[[0, 0], [4, 0], [2, 3], [2, 1]]], expected: [[0, 0], [4, 0], [2, 3]] },
      { input: [[[1, 2]]], expected: [[1, 2]] },
      { input: [[[0, 0], [1, 0], [2, 0], [2, 2], [0, 2]]], expected: [[0, 0], [2, 0], [2, 2], [0, 2]] },
    ],
    hint: "Always choose the point that turns most clockwise; ties extend to the farthest collinear point.",
  },
  {
    id: "cv-121",
    title: "Joint Entropy of Image Pairs",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Compute the joint Shannon entropy in bits of two same-shaped integer images.\n\nBuild the histogram of (a[i][j], b[i][j]) value pairs on the aligned pixels, then return -sum(p * log2(p)) rounded to 4 decimal places. An empty pair set returns 0.0.",
    starterCode: `def joint_entropy(a, b):
    # Your code here
    pass`,
    solution: `def joint_entropy(a, b):
    import math
    counts = {}
    n = 0
    for i in range(len(a)):
        for j in range(len(a[0])):
            key = (a[i][j], b[i][j])
            counts[key] = counts.get(key, 0) + 1
            n += 1
    if n == 0:
        return 0.0
    e = 0.0
    for c in counts.values():
        p = c / n
        e -= p * math.log2(p)
    return round(e + 0.0, 4)`,
    testCases: [
      { input: [[[0, 0], [1, 1]], [[0, 0], [1, 1]]], expected: 1.0 },
      { input: [[[0, 1], [0, 1]], [[0, 0], [1, 1]]], expected: 2.0 },
      { input: [[[0, 1], [2, 3]], [[0, 1], [2, 3]]], expected: 2.0 },
      { input: [[[]], [[]]], expected: 0.0 },
    ],
  },
  {
    id: "cv-122",
    title: "Mutual Information",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Compute the mutual information in bits between two same-shaped integer images.\n\nUse the identity MI = H(a) + H(b) - H(a, b), where each entropy is the Shannon entropy of the corresponding pixel histogram. Round to 4 decimal places.",
    starterCode: `def mutual_information(a, b):
    # Your code here
    pass`,
    solution: `def mutual_information(a, b):
    import math

    def entropy(img):
        counts = {}
        n = 0
        for row in img:
            for v in row:
                counts[v] = counts.get(v, 0) + 1
                n += 1
        if n == 0:
            return 0.0
        e = 0.0
        for c in counts.values():
            p = c / n
            e -= p * math.log2(p)
        return e

    def joint(a, b):
        counts = {}
        n = 0
        for i in range(len(a)):
            for j in range(len(a[0])):
                key = (a[i][j], b[i][j])
                counts[key] = counts.get(key, 0) + 1
                n += 1
        if n == 0:
            return 0.0
        e = 0.0
        for c in counts.values():
            p = c / n
            e -= p * math.log2(p)
        return e

    return round(entropy(a) + entropy(b) - joint(a, b) + 0.0, 4)`,
    testCases: [
      { input: [[[0, 0], [1, 1]], [[0, 0], [1, 1]]], expected: 1.0 },
      { input: [[[0, 1], [0, 1]], [[0, 0], [1, 1]]], expected: 0.0 },
      { input: [[[0, 1], [2, 3]], [[0, 0], [0, 0]]], expected: 0.0 },
      { input: [[[0, 0, 1, 1]], [[0, 1, 0, 1]]], expected: 0.0 },
    ],
    hint: "Mutual information is zero when the two images are independent.",
  },
  {
    id: "cv-123",
    title: "White-Patch Color Balance",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Apply white-patch (max-RGB) color balance to an RGB image.\n\nFind the maximum of each channel, scale every channel value by 255 / max, round to the nearest integer and clamp to [0, 255]. A channel whose maximum is 0 is left unchanged.",
    starterCode: `def white_patch(image):
    # Your code here
    pass`,
    solution: `def white_patch(image):
    maxes = [0, 0, 0]
    for row in image:
        for p in row:
            for c in range(3):
                if p[c] > maxes[c]:
                    maxes[c] = p[c]
    out = []
    for row in image:
        r = []
        for p in row:
            vals = []
            for c in range(3):
                if maxes[c] > 0:
                    vals.append(max(0, min(255, round(p[c] * 255.0 / maxes[c]))))
                else:
                    vals.append(p[c])
            r.append(vals)
        out.append(r)
    return out`,
    testCases: [
      { input: [[[[100, 150, 50]]]], expected: [[[255, 255, 255]]] },
      { input: [[[[100, 50, 25], [50, 100, 25]]]], expected: [[[255, 128, 255], [128, 255, 255]]] },
      { input: [[[[0, 100, 100]]]], expected: [[[0, 255, 255]]] },
    ],
    hint: "The brightest pixel becomes pure white after scaling.",
  },
  {
    id: "cv-124",
    title: "NMS per Class Count",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Run non-maximum suppression separately per class and count the surviving boxes.\n\nProcess boxes in descending score order (ties by index) and suppress a box when its IoU with an already kept box of the same class is strictly greater than iou_threshold. Return a list where index c is the number of kept boxes of class c, with length max(classes) + 1.",
    starterCode: `def nms_per_class_counts(boxes, scores, classes, iou_threshold):
    # Your code here
    pass`,
    solution: `def nms_per_class_counts(boxes, scores, classes, iou_threshold):
    max_c = max(classes) if classes else -1
    counts = [0] * (max_c + 1)
    order = sorted(range(len(boxes)), key=lambda i: (-scores[i], i))
    kept = []
    for i in order:
        ok = True
        ax1, ay1, ax2, ay2 = boxes[i]
        for j in kept:
            if classes[j] != classes[i]:
                continue
            bx1, by1, bx2, by2 = boxes[j]
            ix1 = max(ax1, bx1)
            iy1 = max(ay1, by1)
            ix2 = min(ax2, bx2)
            iy2 = min(ay2, by2)
            iw = ix2 - ix1
            ih = iy2 - iy1
            inter = 0.0 if iw <= 0 or ih <= 0 else iw * ih
            union = (ax2 - ax1) * (ay2 - ay1) + (bx2 - bx1) * (by2 - by1) - inter
            v = inter / union if union > 0 else 0.0
            if v > iou_threshold:
                ok = False
                break
        if ok:
            kept.append(i)
            counts[classes[i]] += 1
    return counts`,
    testCases: [
      { input: [[[0, 0, 2, 2], [1, 1, 3, 3], [10, 10, 12, 12]], [0.9, 0.8, 0.7], [0, 0, 0], 0.5], expected: [3] },
      { input: [[[0, 0, 2, 2], [1, 1, 3, 3], [10, 10, 12, 12]], [0.9, 0.8, 0.7], [0, 0, 0], 0.1], expected: [2] },
      { input: [[[0, 0, 2, 2], [1, 1, 3, 3], [10, 10, 12, 12]], [0.9, 0.8, 0.7], [0, 1, 0], 0.1], expected: [2, 1] },
      { input: [[[0, 0, 2, 2], [1, 1, 3, 3]], [0.9, 0.8], [2, 2], 0.1], expected: [0, 0, 1] },
      { input: [[], [], [], 0.5], expected: [] },
    ],
    hint: "Boxes of different classes never suppress each other.",
  },
  {
    id: "cv-125",
    title: "Simplified SSIM",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Compute a simplified global structural similarity index between two images.\n\nUse (2 * ma * mb + C1) * (2 * cov + C2) / ((ma^2 + mb^2 + C1) * (va + vb + C2)) with C1 = (0.01 * 255)^2, C2 = (0.03 * 255)^2, and population variances and covariance. Round to 4 decimal places.",
    starterCode: `def simplified_ssim(a, b):
    # Your code here
    pass`,
    solution: `def simplified_ssim(a, b):
    c1 = (0.01 * 255) ** 2
    c2 = (0.03 * 255) ** 2
    fa = [v for row in a for v in row]
    fb = [v for row in b for v in row]
    n = len(fa)
    ma = sum(fa) / n
    mb = sum(fb) / n
    va = sum((v - ma) ** 2 for v in fa) / n
    vb = sum((v - mb) ** 2 for v in fb) / n
    cov = sum((fa[i] - ma) * (fb[i] - mb) for i in range(n)) / n
    num = (2 * ma * mb + c1) * (2 * cov + c2)
    den = (ma * ma + mb * mb + c1) * (va + vb + c2)
    return round(num / den, 4)`,
    testCases: [
      { input: [[[1, 2], [3, 4]], [[1, 2], [3, 4]]], expected: 1.0 },
      { input: [[[1, 2], [3, 4]], [[2, 3], [4, 5]]], expected: 0.96 },
      { input: [[[0, 0], [0, 0]], [[255, 255], [255, 255]]], expected: 0.0001 },
      { input: [[[1, 2], [3, 4]], [[1, 1], [3, 6]]], expected: 0.9784 },
    ],
    hint: "Variance and covariance use division by N (the population form).",
  },
];
