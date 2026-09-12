import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "cv-001",
    title: "RGB to Grayscale",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Convert an RGB image to grayscale using the luminance formula gray = 0.299 * r + 0.587 * g + 0.114 * b.\n\nThe input is a 2D list of [r, g, b] pixels with channels in [0, 255]. Return a 2D list of luminance values rounded to 2 decimal places; an empty image returns [].",
    starterCode: `def rgb_to_grayscale(image):
    # Your code here
    pass`,
    solution: `def rgb_to_grayscale(image):
    out = []
    for row in image:
        out.append([round(0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2], 2) for p in row])
    return out`,
    testCases: [
      { input: [[[[255, 0, 0], [0, 255, 0]], [[0, 0, 255], [255, 255, 255]]]], expected: [[76.24, 149.69], [29.07, 255.0]] },
      { input: [[[[0, 0, 0]]]], expected: [[0.0]] },
      { input: [[[[100, 150, 200]]]], expected: [[140.75]] },
      { input: [[]], expected: [] },
    ],
    hint: "Weight the green channel most and the blue channel least, then round.",
  },
  {
    id: "cv-002",
    title: "Split RGB Channels",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Split an RGB image into its three color channels.\n\nThe input is a 2D list of [r, g, b] pixels. Return a list of three 2D lists [red, green, blue], each holding the corresponding channel values. An empty image returns [[], [], []].",
    starterCode: `def split_channels(image):
    # Your code here
    pass`,
    solution: `def split_channels(image):
    if not image:
        return [[], [], []]
    r = [[p[0] for p in row] for row in image]
    g = [[p[1] for p in row] for row in image]
    b = [[p[2] for p in row] for row in image]
    return [r, g, b]`,
    testCases: [
      { input: [[[[1, 2, 3], [4, 5, 6]]]], expected: [[[1, 4]], [[2, 5]], [[3, 6]]] },
      { input: [[[[10, 20, 30]]]], expected: [[[10]], [[20]], [[30]]] },
      { input: [[]], expected: [[], [], []] },
    ],
    hint: "Build three grids by picking index 0, 1 and 2 from every pixel.",
  },
  {
    id: "cv-003",
    title: "Merge RGB Channels",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Merge three single-channel images into one RGB image.\n\nGiven 2D lists r, g and b of the same shape, return a 2D list where each pixel is [r[i][j], g[i][j], b[i][j]]. Empty inputs return [].",
    starterCode: `def merge_channels(r, g, b):
    # Your code here
    pass`,
    solution: `def merge_channels(r, g, b):
    return [[[r[i][j], g[i][j], b[i][j]] for j in range(len(r[0]))] for i in range(len(r))]`,
    testCases: [
      { input: [[[1, 2], [3, 4]], [[5, 6], [7, 8]], [[9, 10], [11, 12]]], expected: [[[1, 5, 9], [2, 6, 10]], [[3, 7, 11], [4, 8, 12]]] },
      { input: [[[10]], [[20]], [[30]]], expected: [[[10, 20, 30]]] },
      { input: [[], [], []], expected: [] },
    ],
    hint: "Zip the three grids position by position into pixel triples.",
  },
  {
    id: "cv-004",
    title: "Crop Image",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Crop a rectangular region out of a 2D image.\n\nReturn the sub-image containing rows top through top + height - 1 and columns left through left + width - 1, using slicing semantics. You may assume the crop fits inside the image and that height and width are positive.",
    starterCode: `def crop_image(image, top, left, height, width):
    # Your code here
    pass`,
    solution: `def crop_image(image, top, left, height, width):
    return [row[left:left + width] for row in image[top:top + height]]`,
    testCases: [
      { input: [[[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11]], 0, 0, 3, 4], expected: [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11]] },
      { input: [[[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11]], 1, 1, 2, 2], expected: [[5, 6], [9, 10]] },
      { input: [[[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11]], 2, 3, 1, 1], expected: [[11]] },
    ],
  },
  {
    id: "cv-005",
    title: "Zero Padding",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Pad a 2D image with a border of zeros.\n\nReturn a new image with pad extra rows and columns of zeros on every side, keeping the original values in the center. pad may be 0.",
    starterCode: `def zero_pad(image, pad):
    # Your code here
    pass`,
    solution: `def zero_pad(image, pad):
    h = len(image)
    w = len(image[0]) if h else 0
    out = [[0] * (w + 2 * pad) for _ in range(pad)]
    for row in image:
        out.append([0] * pad + list(row) + [0] * pad)
    for _ in range(pad):
        out.append([0] * (w + 2 * pad))
    return out`,
    testCases: [
      { input: [[[1, 2], [3, 4]], 1], expected: [[0, 0, 0, 0], [0, 1, 2, 0], [0, 3, 4, 0], [0, 0, 0, 0]] },
      { input: [[[5]], 2], expected: [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 5, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]] },
      { input: [[[1, 2]], 0], expected: [[1, 2]] },
    ],
    hint: "Prepend and append zero rows, and wrap each original row with pad zeros.",
  },
  {
    id: "cv-006",
    title: "Horizontal Flip",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Flip a 2D image horizontally (mirror left-to-right).\n\nEach row is reversed while the order of the rows stays the same.",
    starterCode: `def flip_horizontal(image):
    # Your code here
    pass`,
    solution: `def flip_horizontal(image):
    return [list(reversed(row)) for row in image]`,
    testCases: [
      { input: [[[1, 2, 3], [4, 5, 6]]], expected: [[3, 2, 1], [6, 5, 4]] },
      { input: [[[7]]], expected: [[7]] },
      { input: [[[1, 2], [3, 4]]], expected: [[2, 1], [4, 3]] },
    ],
  },
  {
    id: "cv-007",
    title: "Vertical Flip",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Flip a 2D image vertically (mirror top-to-bottom).\n\nThe order of the rows is reversed while every row keeps its original order.",
    starterCode: `def flip_vertical(image):
    # Your code here
    pass`,
    solution: `def flip_vertical(image):
    return [list(row) for row in reversed(image)]`,
    testCases: [
      { input: [[[1, 2, 3], [4, 5, 6]]], expected: [[4, 5, 6], [1, 2, 3]] },
      { input: [[[7]]], expected: [[7]] },
      { input: [[[1, 2], [3, 4]]], expected: [[3, 4], [1, 2]] },
    ],
  },
  {
    id: "cv-008",
    title: "Rotate 180 Degrees",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Rotate a 2D image by 180 degrees.\n\nThis reverses both the order of the rows and the order of the elements inside each row.",
    starterCode: `def rotate_180(image):
    # Your code here
    pass`,
    solution: `def rotate_180(image):
    return [list(reversed(row)) for row in reversed(image)]`,
    testCases: [
      { input: [[[1, 2, 3], [4, 5, 6]]], expected: [[6, 5, 4], [3, 2, 1]] },
      { input: [[[1, 2], [3, 4]]], expected: [[4, 3], [2, 1]] },
      { input: [[[9]]], expected: [[9]] },
    ],
    hint: "A 180-degree rotation is a horizontal flip of a vertical flip.",
  },
  {
    id: "cv-009",
    title: "Brightness Adjustment",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Adjust the brightness of a grayscale image by adding delta to every pixel.\n\nOutput values are clamped to [0, 255] and returned as integers. delta may be negative.",
    starterCode: `def adjust_brightness(image, delta):
    # Your code here
    pass`,
    solution: `def adjust_brightness(image, delta):
    out = []
    for row in image:
        out.append([max(0, min(255, v + delta)) for v in row])
    return out`,
    testCases: [
      { input: [[[0, 100], [200, 255]], 50], expected: [[50, 150], [250, 255]] },
      { input: [[[10, 20]], -20], expected: [[0, 0]] },
      { input: [[[100]], 0], expected: [[100]] },
      { input: [[[250, 5]], 10], expected: [[255, 15]] },
    ],
  },
  {
    id: "cv-010",
    title: "Invert Image",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Invert a grayscale image whose pixel values lie in [0, 255].\n\nEach output pixel is 255 minus the corresponding input pixel.",
    starterCode: `def invert_image(image):
    # Your code here
    pass`,
    solution: `def invert_image(image):
    return [[255 - v for v in row] for row in image]`,
    testCases: [
      { input: [[[0, 255], [100, 150]]], expected: [[255, 0], [155, 105]] },
      { input: [[[1]]], expected: [[254]] },
      { input: [[[0, 0], [0, 0]]], expected: [[255, 255], [255, 255]] },
    ],
  },
  {
    id: "cv-011",
    title: "Binary Threshold",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Apply a binary threshold to a grayscale image.\n\nReturn 255 where the pixel value is strictly greater than threshold, and 0 otherwise.",
    starterCode: `def binary_threshold(image, threshold):
    # Your code here
    pass`,
    solution: `def binary_threshold(image, threshold):
    return [[255 if v > threshold else 0 for v in row] for row in image]`,
    testCases: [
      { input: [[[0, 50, 100], [150, 200, 255]], 100], expected: [[0, 0, 0], [255, 255, 255]] },
      { input: [[[100]], 100], expected: [[0]] },
      { input: [[[101]], 100], expected: [[255]] },
    ],
    hint: "The comparison is strict: a pixel equal to the threshold becomes 0.",
  },
  {
    id: "cv-012",
    title: "Global Average Pooling",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Compute global average pooling over an image.\n\nReturn the arithmetic mean of all pixel values as a float. You may assume the image is non-empty.",
    starterCode: `def global_avg_pool(image):
    # Your code here
    pass`,
    solution: `def global_avg_pool(image):
    total = 0
    count = 0
    for row in image:
        for v in row:
            total += v
            count += 1
    return total / count`,
    testCases: [
      { input: [[[1, 2], [3, 4]]], expected: 2.5 },
      { input: [[[5]]], expected: 5.0 },
      { input: [[[1, 1, 1], [1, 1, 1]]], expected: 1.0 },
      { input: [[[10, 20], [30, 40]]], expected: 25.0 },
    ],
  },
  {
    id: "cv-013",
    title: "Bounding Box of a Mask",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Find the bounding box of the non-zero pixels in a binary mask.\n\nReturn [min_row, min_col, max_row, max_col] using inclusive indices, scanned in row-major order. Return None when the mask contains no non-zero pixel.",
    starterCode: `def bounding_box(mask):
    # Your code here
    pass`,
    solution: `def bounding_box(mask):
    rows = []
    cols = []
    for i, row in enumerate(mask):
        for j, v in enumerate(row):
            if v:
                rows.append(i)
                cols.append(j)
    if not rows:
        return None
    return [min(rows), min(cols), max(rows), max(cols)]`,
    testCases: [
      { input: [[[0, 1, 0], [1, 1, 0], [0, 0, 0]]], expected: [0, 0, 1, 1] },
      { input: [[[1]]], expected: [0, 0, 0, 0] },
      { input: [[[0, 0], [0, 0]]], expected: null },
      { input: [[[1, 0, 1], [0, 0, 0], [1, 0, 1]]], expected: [0, 0, 2, 2] },
    ],
  },
  {
    id: "cv-014",
    title: "Min-Max Normalization",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Min-max normalize an image to the range [0, 1].\n\nFor each pixel compute (v - min) / (max - min), rounded to 4 decimal places, where min and max are taken over the whole image. If all pixels are equal, return a same-shaped grid of zeros.",
    starterCode: `def min_max_normalize(image):
    # Your code here
    pass`,
    solution: `def min_max_normalize(image):
    flat = [v for row in image for v in row]
    lo = min(flat)
    hi = max(flat)
    if hi == lo:
        return [[0.0 for _ in row] for row in image]
    return [[round((v - lo) / (hi - lo), 4) for v in row] for row in image]`,
    testCases: [
      { input: [[[0, 2], [4, 8]]], expected: [[0.0, 0.25], [0.5, 1.0]] },
      { input: [[[5, 5], [5, 5]]], expected: [[0.0, 0.0], [0.0, 0.0]] },
      { input: [[[10, 20], [30, 40]]], expected: [[0.0, 0.3333], [0.6667, 1.0]] },
      { input: [[[-1, 1]]], expected: [[0.0, 1.0]] },
    ],
    hint: "Handle the constant-image case before dividing to avoid a zero denominator.",
  },
  {
    id: "cv-015",
    title: "Reflect Padding",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Pad an image by reflecting it across its edges without repeating the edge pixel (reflect mode).\n\nWith one row [a, b, c] and pad 1 the padded row is [b, a, b, c, b]. Apply the same rule to rows and columns; pad may be 0. You may assume each dimension is at least 2 when pad is positive.",
    starterCode: `def reflect_pad(image, pad):
    # Your code here
    pass`,
    solution: `def reflect_pad(image, pad):
    h = len(image)
    w = len(image[0]) if h else 0
    if h == 0 or w == 0:
        return []
    out = []
    for i in range(-pad, h + pad):
        ri = i
        while ri < 0 or ri >= h:
            if ri < 0:
                ri = -ri
            if ri >= h:
                ri = 2 * h - 2 - ri
        row = []
        for j in range(-pad, w + pad):
            cj = j
            while cj < 0 or cj >= w:
                if cj < 0:
                    cj = -cj
                if cj >= w:
                    cj = 2 * w - 2 - cj
            row.append(image[ri][cj])
        out.append(row)
    return out`,
    testCases: [
      { input: [[[1, 2], [3, 4]], 1], expected: [[4, 3, 4, 3], [2, 1, 2, 1], [4, 3, 4, 3], [2, 1, 2, 1]] },
      { input: [[[1, 2, 3], [4, 5, 6]], 1], expected: [[5, 4, 5, 6, 5], [2, 1, 2, 3, 2], [5, 4, 5, 6, 5], [2, 1, 2, 3, 2]] },
      { input: [[[9, 8, 7], [6, 5, 4], [3, 2, 1]], 1], expected: [[5, 6, 5, 4, 5], [8, 9, 8, 7, 8], [5, 6, 5, 4, 5], [2, 3, 2, 1, 2], [5, 6, 5, 4, 5]] },
      { input: [[[1, 2], [3, 4]], 0], expected: [[1, 2], [3, 4]] },
    ],
    hint: "Map index -1 to 1 and index h to h - 2; use a while loop so large pads work.",
  },
  {
    id: "cv-016",
    title: "Rotate 90 Degrees",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Rotate a 2D image 90 degrees clockwise.\n\nAn H x W input produces a W x H output where output[i][j] equals image[H - 1 - j][i].",
    starterCode: `def rotate_90(image):
    # Your code here
    pass`,
    solution: `def rotate_90(image):
    h = len(image)
    w = len(image[0]) if h else 0
    return [[image[h - 1 - j][i] for j in range(h)] for i in range(w)]`,
    testCases: [
      { input: [[[1, 2, 3], [4, 5, 6]]], expected: [[4, 1], [5, 2], [6, 3]] },
      { input: [[[1, 2], [3, 4]]], expected: [[3, 1], [4, 2]] },
      { input: [[[7]]], expected: [[7]] },
      { input: [[[1, 2], [3, 4], [5, 6]]], expected: [[5, 3, 1], [6, 4, 2]] },
    ],
  },
  {
    id: "cv-017",
    title: "Nearest-Neighbor Resize",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Resize a 2D image using nearest-neighbor interpolation.\n\nFor output pixel (y, x), sample the input at row y * H // out_h and column x * W // out_w, where H and W are the input height and width. out_h and out_w are positive.",
    starterCode: `def resize_nearest(image, out_h, out_w):
    # Your code here
    pass`,
    solution: `def resize_nearest(image, out_h, out_w):
    h = len(image)
    w = len(image[0]) if h else 0
    out = []
    for y in range(out_h):
        sy = int(y * h / out_h)
        row = []
        for x in range(out_w):
            sx = int(x * w / out_w)
            row.append(image[sy][sx])
        out.append(row)
    return out`,
    testCases: [
      { input: [[[1, 2], [3, 4]], 4, 4], expected: [[1, 1, 2, 2], [1, 1, 2, 2], [3, 3, 4, 4], [3, 3, 4, 4]] },
      { input: [[[1, 2, 3], [4, 5, 6]], 3, 2], expected: [[1, 2], [1, 2], [4, 5]] },
      { input: [[[5]], 2, 2], expected: [[5, 5], [5, 5]] },
      { input: [[[1, 2, 3]], 2, 6], expected: [[1, 1, 2, 2, 3, 3], [1, 1, 2, 2, 3, 3]] },
    ],
    hint: "Integer-divide the output coordinate scaled by the input size.",
  },
  {
    id: "cv-018",
    title: "Contrast Adjustment",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Adjust the contrast of a grayscale image around the midpoint 128.\n\nEach pixel becomes clamp(round(128 + alpha * (v - 128)), 0, 255), returned as an integer. alpha = 1 leaves the image unchanged and alpha < 1 reduces contrast.",
    starterCode: `def adjust_contrast(image, alpha):
    # Your code here
    pass`,
    solution: `def adjust_contrast(image, alpha):
    out = []
    for row in image:
        new_row = []
        for v in row:
            nv = round(128 + alpha * (v - 128))
            new_row.append(max(0, min(255, nv)))
        out.append(new_row)
    return out`,
    testCases: [
      { input: [[[0, 100], [200, 255]], 1.5], expected: [[0, 86], [236, 255]] },
      { input: [[[0, 128, 254]], 0.5], expected: [[64, 128, 191]] },
      { input: [[[10, 20], [30, 40]], 1.0], expected: [[10, 20], [30, 40]] },
      { input: [[[0, 64, 192, 255]], 2.0], expected: [[0, 0, 255, 255]] },
    ],
  },
  {
    id: "cv-019",
    title: "2D Cross-Correlation (Valid)",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the valid-mode 2D cross-correlation of an image with a kernel.\n\nout[i][j] = sum over (a, b) of image[i + a][j + b] * kernel[a][b]. The output shape is (H - kh + 1) x (W - kw + 1). Cross-correlation does not flip the kernel.",
    starterCode: `def cross_correlation(image, kernel):
    # Your code here
    pass`,
    solution: `def cross_correlation(image, kernel):
    h = len(image)
    w = len(image[0])
    kh = len(kernel)
    kw = len(kernel[0])
    out = []
    for i in range(h - kh + 1):
        row = []
        for j in range(w - kw + 1):
            s = 0
            for a in range(kh):
                for b in range(kw):
                    s += image[i + a][j + b] * kernel[a][b]
            row.append(s)
        out.append(row)
    return out`,
    testCases: [
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], [[1, 2], [3, 4]]], expected: [[37, 47], [67, 77]] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], [[0, 0, 0], [0, 1, 0], [0, 0, 0]]], expected: [[5]] },
      { input: [[[1, 2, 3], [4, 5, 6]], [[1, 1], [1, 1]]], expected: [[12, 16]] },
      { input: [[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]], [[1, 0], [0, 1]]], expected: [[7, 9, 11], [15, 17, 19], [23, 25, 27]] },
    ],
    hint: "Slide the kernel over every valid top-left position and multiply elementwise.",
  },
  {
    id: "cv-020",
    title: "Gaussian Kernel Generation",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Generate a normalized 2D Gaussian kernel.\n\nkernel[i][j] = exp(-((i - c)^2 + (j - c)^2) / (2 * sigma^2)) with c = size // 2, then divide every entry by the sum of all entries. size is odd and sigma is positive; round each value to 6 decimal places.",
    starterCode: `def gaussian_kernel(size, sigma):
    # Your code here
    pass`,
    solution: `def gaussian_kernel(size, sigma):
    half = size // 2
    kernel = []
    total = 0.0
    for i in range(size):
        row = []
        for j in range(size):
            d = (i - half) ** 2 + (j - half) ** 2
            v = pow(2.718281828459045, -d / (2 * sigma * sigma))
            row.append(v)
            total += v
        kernel.append(row)
    return [[round(v / total, 6) for v in row] for row in kernel]`,
    testCases: [
      { input: [3, 1.0], expected: [[0.075114, 0.123841, 0.075114], [0.123841, 0.20418, 0.123841], [0.075114, 0.123841, 0.075114]] },
      { input: [1, 1.0], expected: [[1.0]] },
      { input: [5, 2.0], expected: [[0.023247, 0.033824, 0.038328, 0.033824, 0.023247], [0.033824, 0.049214, 0.055766, 0.049214, 0.033824], [0.038328, 0.055766, 0.063191, 0.055766, 0.038328], [0.033824, 0.049214, 0.055766, 0.049214, 0.033824], [0.023247, 0.033824, 0.038328, 0.033824, 0.023247]] },
      { input: [3, 0.5], expected: [[0.011344, 0.08382, 0.011344], [0.08382, 0.619347, 0.08382], [0.011344, 0.08382, 0.011344]] },
    ],
    hint: "Compute the squared distance from the center, exponentiate, then normalize by the total.",
  },
  {
    id: "cv-021",
    title: "Gaussian Blur",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Blur a grayscale image with a Gaussian kernel.\n\nBuild the normalized Gaussian kernel for the given odd size and sigma using the same formula as Gaussian kernel generation, then apply valid-mode cross-correlation. Round each output value to 4 decimal places.",
    starterCode: `def gaussian_blur(image, size, sigma):
    # Your code here
    pass`,
    solution: `def gaussian_blur(image, size, sigma):
    half = size // 2
    kernel = []
    total = 0.0
    for i in range(size):
        row = []
        for j in range(size):
            d = (i - half) ** 2 + (j - half) ** 2
            v = pow(2.718281828459045, -d / (2 * sigma * sigma))
            row.append(v)
            total += v
        kernel.append(row)
    kernel = [[v / total for v in row] for row in kernel]
    h = len(image)
    w = len(image[0])
    out = []
    for i in range(h - size + 1):
        row = []
        for j in range(w - size + 1):
            s = 0.0
            for a in range(size):
                for b in range(size):
                    s += image[i + a][j + b] * kernel[a][b]
            row.append(round(s, 4))
        out.append(row)
    return out`,
    testCases: [
      { input: [[[5, 5, 5], [5, 5, 5], [5, 5, 5]], 3, 1.0], expected: [[5.0]] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], 3, 1.0], expected: [[5.0]] },
      { input: [[[1, 1, 1, 1], [1, 5, 5, 1], [1, 5, 5, 1], [1, 1, 1, 1]], 3, 1.0], expected: [[3.1079, 3.1079], [3.1079, 3.1079]] },
    ],
    hint: "Generate and normalize the weights first, then run a sliding-window sum.",
  },
  {
    id: "cv-022",
    title: "Sharpen Filter",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Sharpen a grayscale image with the 3x3 kernel [[0, -1, 0], [-1, 5, -1], [0, -1, 0]].\n\nApply valid-mode cross-correlation and return integer values. Constant regions are unchanged; no clamping is applied.",
    starterCode: `def sharpen(image):
    # Your code here
    pass`,
    solution: `def sharpen(image):
    kernel = [[0, -1, 0], [-1, 5, -1], [0, -1, 0]]
    h = len(image)
    w = len(image[0])
    out = []
    for i in range(h - 2):
        row = []
        for j in range(w - 2):
            s = 0
            for a in range(3):
                for b in range(3):
                    s += image[i + a][j + b] * kernel[a][b]
            row.append(s)
        out.append(row)
    return out`,
    testCases: [
      { input: [[[7, 7, 7], [7, 7, 7], [7, 7, 7]]], expected: [[7]] },
      { input: [[[0, 0, 0], [0, 10, 0], [0, 0, 0]]], expected: [[50]] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: [[5]] },
      { input: [[[1, 1, 1, 1], [1, 5, 5, 1], [1, 5, 5, 1], [1, 1, 1, 1]]], expected: [[13, 13], [13, 13]] },
    ],
  },
  {
    id: "cv-023",
    title: "Emboss Filter",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Apply the 3x3 emboss kernel [[-2, -1, 0], [-1, 1, 1], [0, 1, 2]] to a grayscale image.\n\nUse valid-mode cross-correlation and return integer values. Negative results are allowed: no clamping or offset is applied.",
    starterCode: `def emboss(image):
    # Your code here
    pass`,
    solution: `def emboss(image):
    kernel = [[-2, -1, 0], [-1, 1, 1], [0, 1, 2]]
    h = len(image)
    w = len(image[0])
    out = []
    for i in range(h - 2):
        row = []
        for j in range(w - 2):
            s = 0
            for a in range(3):
                for b in range(3):
                    s += image[i + a][j + b] * kernel[a][b]
            row.append(s)
        out.append(row)
    return out`,
    testCases: [
      { input: [[[4, 4, 4], [4, 4, 4], [4, 4, 4]]], expected: [[4]] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: [[29]] },
      { input: [[[1, 1, 1, 1], [1, 5, 5, 1], [1, 5, 5, 1], [1, 1, 1, 1]]], expected: [[21, 5], [5, -11]] },
    ],
  },
  {
    id: "cv-024",
    title: "Laplacian Filter",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Apply the 3x3 Laplacian kernel [[0, 1, 0], [1, -4, 1], [0, 1, 0]] to a grayscale image.\n\nUse valid-mode cross-correlation and return integer values. Constant regions produce 0 and central differences are negative.",
    starterCode: `def laplacian(image):
    # Your code here
    pass`,
    solution: `def laplacian(image):
    kernel = [[0, 1, 0], [1, -4, 1], [0, 1, 0]]
    h = len(image)
    w = len(image[0])
    out = []
    for i in range(h - 2):
        row = []
        for j in range(w - 2):
            s = 0
            for a in range(3):
                for b in range(3):
                    s += image[i + a][j + b] * kernel[a][b]
            row.append(s)
        out.append(row)
    return out`,
    testCases: [
      { input: [[[4, 4, 4], [4, 4, 4], [4, 4, 4]]], expected: [[0]] },
      { input: [[[0, 0, 0], [0, 5, 0], [0, 0, 0]]], expected: [[-20]] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: [[0]] },
    ],
  },
  {
    id: "cv-025",
    title: "Median Filter",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Apply a median filter with a k x k window to a grayscale image.\n\nAt each valid position, sort the k * k window values and take the element at index (k * k) // 2 (the lower median). k is odd and the image has at least k rows and columns.",
    starterCode: `def median_filter(image, k):
    # Your code here
    pass`,
    solution: `def median_filter(image, k):
    h = len(image)
    w = len(image[0])
    out = []
    for i in range(h - k + 1):
        row = []
        for j in range(w - k + 1):
            vals = []
            for a in range(k):
                for b in range(k):
                    vals.append(image[i + a][j + b])
            vals.sort()
            row.append(vals[(k * k) // 2])
        out.append(row)
    return out`,
    testCases: [
      { input: [[[1, 1, 1], [1, 100, 1], [1, 1, 1]], 3], expected: [[1]] },
      { input: [[[5]], 1], expected: [[5]] },
      { input: [[[9, 2, 8], [4, 7, 1], [3, 6, 5]], 3], expected: [[5]] },
      { input: [[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]], 3], expected: [[6, 7], [10, 11]] },
    ],
    hint: "Collect all k * k values, sort them and pick the middle index.",
  },
  {
    id: "cv-026",
    title: "Max Pooling",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Apply max pooling to a 2D image.\n\nSlide a k x k window with the given stride and take the maximum in each window. The output shape is ((H - k) // stride + 1) x ((W - k) // stride + 1).",
    starterCode: `def max_pool(image, k, stride):
    # Your code here
    pass`,
    solution: `def max_pool(image, k, stride):
    h = len(image)
    w = len(image[0])
    out = []
    for i in range(0, h - k + 1, stride):
        row = []
        for j in range(0, w - k + 1, stride):
            best = image[i][j]
            for a in range(k):
                for b in range(k):
                    if image[i + a][j + b] > best:
                        best = image[i + a][j + b]
            row.append(best)
        out.append(row)
    return out`,
    testCases: [
      { input: [[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]], 2, 2], expected: [[6, 8], [14, 16]] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], 2, 1], expected: [[5, 6], [8, 9]] },
      { input: [[[1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [11, 12, 13, 14, 15], [16, 17, 18, 19, 20], [21, 22, 23, 24, 25]], 3, 2], expected: [[13, 15], [23, 25]] },
      { input: [[[42]], 1, 1], expected: [[42]] },
    ],
  },
  {
    id: "cv-027",
    title: "Average Pooling",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Apply average pooling to a 2D image.\n\nSlide a k x k window with the given stride and write the mean of each window, rounded to 4 decimal places. The output shape is ((H - k) // stride + 1) x ((W - k) // stride + 1).",
    starterCode: `def avg_pool(image, k, stride):
    # Your code here
    pass`,
    solution: `def avg_pool(image, k, stride):
    h = len(image)
    w = len(image[0])
    out = []
    for i in range(0, h - k + 1, stride):
        row = []
        for j in range(0, w - k + 1, stride):
            s = 0
            for a in range(k):
                for b in range(k):
                    s += image[i + a][j + b]
            row.append(round(s / (k * k), 4))
        out.append(row)
    return out`,
    testCases: [
      { input: [[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]], 2, 2], expected: [[3.5, 5.5], [11.5, 13.5]] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], 2, 1], expected: [[3.0, 4.0], [6.0, 7.0]] },
      { input: [[[1, 2], [3, 4]], 2, 2], expected: [[2.5]] },
    ],
  },
  {
    id: "cv-028",
    title: "Histogram Binning",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute a histogram of a grayscale image with a fixed number of bins.\n\nPixel values are integers in [0, 255]. The bin index for value v is v * bins // 256. Return the list of bin counts, which has length bins.",
    starterCode: `def histogram(image, bins):
    # Your code here
    pass`,
    solution: `def histogram(image, bins):
    counts = [0] * bins
    for row in image:
        for v in row:
            counts[v * bins // 256] += 1
    return counts`,
    testCases: [
      { input: [[[0, 255], [128, 64]], 4], expected: [1, 1, 1, 1] },
      { input: [[[0, 0], [100, 200]], 2], expected: [3, 1] },
      { input: [[[0, 32, 64, 96, 128, 160, 192, 224, 255]], 8], expected: [1, 1, 1, 1, 1, 1, 1, 2] },
    ],
    hint: "Scale the intensity into the bin range with integer division.",
  },
  {
    id: "cv-029",
    title: "Standardization (Z-Score)",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Standardize an image to zero mean and unit variance.\n\nCompute the population mean and standard deviation over all pixels, then return (v - mean) / std rounded to 4 decimal places. If the standard deviation is 0, return a same-shaped grid of zeros.",
    starterCode: `def standardize(image):
    # Your code here
    pass`,
    solution: `def standardize(image):
    flat = [v for row in image for v in row]
    n = len(flat)
    mean = sum(flat) / n
    var = sum((v - mean) ** 2 for v in flat) / n
    std = var ** 0.5
    if std == 0:
        return [[0.0 for _ in row] for row in image]
    return [[round((v - mean) / std, 4) for v in row] for row in image]`,
    testCases: [
      { input: [[[1, 2], [3, 4]]], expected: [[-1.3416, -0.4472], [0.4472, 1.3416]] },
      { input: [[[5, 5], [5, 5]]], expected: [[0.0, 0.0], [0.0, 0.0]] },
      { input: [[[10]]], expected: [[0.0]] },
      { input: [[[2, 4, 4, 4], [5, 5, 7, 9]]], expected: [[-1.5, -0.5, -0.5, -0.5], [0.0, 0.0, 1.0, 2.0]] },
    ],
  },
  {
    id: "cv-030",
    title: "Flood Fill",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Flood fill a 2D image starting from (sr, sc) using 4-connectivity.\n\nReplace every pixel connected to the start whose value equals the starting value with new_color. Return the resulting image; if the start value already equals new_color, return an unchanged copy.",
    starterCode: `def flood_fill(image, sr, sc, new_color):
    # Your code here
    pass`,
    solution: `def flood_fill(image, sr, sc, new_color):
    h = len(image)
    w = len(image[0])
    target = image[sr][sc]
    if target == new_color:
        return [list(row) for row in image]
    out = [list(row) for row in image]
    stack = [(sr, sc)]
    out[sr][sc] = new_color
    while stack:
        i, j = stack.pop()
        for di, dj in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            ni, nj = i + di, j + dj
            if 0 <= ni < h and 0 <= nj < w and out[ni][nj] == target:
                out[ni][nj] = new_color
                stack.append((ni, nj))
    return out`,
    testCases: [
      { input: [[[1, 1, 0], [1, 0, 0], [0, 0, 1]], 0, 0, 2], expected: [[2, 2, 0], [2, 0, 0], [0, 0, 1]] },
      { input: [[[1, 1]], 0, 0, 1], expected: [[1, 1]] },
      { input: [[[1, 0], [0, 1]], 0, 0, 9], expected: [[9, 0], [0, 1]] },
      { input: [[[1, 1, 1], [1, 0, 0], [1, 0, 0]], 1, 2, 5], expected: [[1, 1, 1], [1, 5, 5], [1, 5, 5]] },
    ],
    hint: "Use a stack of pixel coordinates; check bounds and equality before pushing.",
  },
  {
    id: "cv-031",
    title: "Binary Dilation",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Dilate a binary mask with a full 3x3 structuring element and zero padding.\n\nA pixel becomes 1 if any pixel in its 3x3 neighborhood (clipped to the image) is 1. The output has the same shape as the mask.",
    starterCode: `def binary_dilate(mask):
    # Your code here
    pass`,
    solution: `def binary_dilate(mask):
    h = len(mask)
    w = len(mask[0]) if h else 0
    out = [[0] * w for _ in range(h)]
    for i in range(h):
        for j in range(w):
            hit = 0
            for di in (-1, 0, 1):
                for dj in (-1, 0, 1):
                    ni, nj = i + di, j + dj
                    if 0 <= ni < h and 0 <= nj < w and mask[ni][nj]:
                        hit = 1
            out[i][j] = hit
    return out`,
    testCases: [
      { input: [[[0, 0, 0, 0], [0, 0, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]]], expected: [[0, 1, 1, 1], [0, 1, 1, 1], [0, 1, 1, 1], [0, 0, 0, 0]] },
      { input: [[[1, 0], [0, 0]]], expected: [[1, 1], [1, 1]] },
      { input: [[[0, 0], [0, 0]]], expected: [[0, 0], [0, 0]] },
      { input: [[[1, 1], [1, 1]]], expected: [[1, 1], [1, 1]] },
    ],
  },
  {
    id: "cv-032",
    title: "Binary Erosion",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Erode a binary mask with a full 3x3 structuring element and zero padding.\n\nA pixel stays 1 only if all nine positions of its 3x3 window are 1; out-of-bounds positions count as 0, so border pixels are always eroded. The output has the same shape as the mask.",
    starterCode: `def binary_erode(mask):
    # Your code here
    pass`,
    solution: `def binary_erode(mask):
    h = len(mask)
    w = len(mask[0]) if h else 0
    out = [[0] * w for _ in range(h)]
    for i in range(h):
        for j in range(w):
            keep = 1
            for di in (-1, 0, 1):
                for dj in (-1, 0, 1):
                    ni, nj = i + di, j + dj
                    if ni < 0 or ni >= h or nj < 0 or nj >= w or not mask[ni][nj]:
                        keep = 0
            out[i][j] = keep
    return out`,
    testCases: [
      { input: [[[1, 1, 1], [1, 1, 1], [1, 1, 1]]], expected: [[0, 0, 0], [0, 1, 0], [0, 0, 0]] },
      { input: [[[0, 0, 0], [0, 1, 0], [0, 0, 0]]], expected: [[0, 0, 0], [0, 0, 0], [0, 0, 0]] },
      { input: [[[1, 1], [1, 1]]], expected: [[0, 0], [0, 0]] },
      { input: [[[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]]], expected: [[0, 0, 0, 0], [0, 1, 1, 0], [0, 0, 0, 0]] },
    ],
    hint: "Treat any position outside the mask as a 0, which erodes the whole border.",
  },
  {
    id: "cv-033",
    title: "Bilinear Interpolation",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Bilinearly interpolate a pixel value at fractional coordinates (y, x).\n\nClamp y and x to the valid ranges [0, H - 1] and [0, W - 1], then blend the four surrounding pixels using the fractional offsets. Round the result to 4 decimal places.",
    starterCode: `def bilinear_interpolate(image, y, x):
    # Your code here
    pass`,
    solution: `def bilinear_interpolate(image, y, x):
    h = len(image)
    w = len(image[0])
    if y < 0:
        y = 0.0
    if y > h - 1:
        y = float(h - 1)
    if x < 0:
        x = 0.0
    if x > w - 1:
        x = float(w - 1)
    y0 = int(y)
    x0 = int(x)
    y1 = min(y0 + 1, h - 1)
    x1 = min(x0 + 1, w - 1)
    dy = y - y0
    dx = x - x0
    val = (image[y0][x0] * (1 - dy) * (1 - dx) + image[y0][x1] * (1 - dy) * dx
           + image[y1][x0] * dy * (1 - dx) + image[y1][x1] * dy * dx)
    return round(val, 4)`,
    testCases: [
      { input: [[[1, 2], [3, 4]], 0.5, 0.5], expected: 2.5 },
      { input: [[[1, 2], [3, 4]], 0, 0], expected: 1 },
      { input: [[[1, 2], [3, 4]], 0.25, 0.75], expected: 2.25 },
      { input: [[[1, 2], [3, 4]], 1.5, -0.5], expected: 3.0 },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], 1.5, 0.5], expected: 6.0 },
    ],
    hint: "Blend with (1 - dy), (1 - dx) weights and clamp coordinates at the borders.",
  },
  {
    id: "cv-034",
    title: "Otsu Threshold",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Compute the Otsu threshold of a grayscale image.\n\nBuild a 256-bin histogram and choose the threshold t that maximizes the between-class variance w_b * w_f * (mean_b - mean_f)^2, where the classes are pixels <= t and pixels > t. Return the smallest such t; if the image is constant, return 0.",
    starterCode: `def otsu_threshold(image):
    # Your code here
    pass`,
    solution: `def otsu_threshold(image):
    hist = [0] * 256
    n = 0
    for row in image:
        for v in row:
            hist[v] += 1
            n += 1
    total = 0.0
    for v in range(256):
        total += v * hist[v]
    sum_b = 0.0
    w_b = 0
    best_t = 0
    best_var = -1.0
    for t in range(256):
        w_b += hist[t]
        if w_b == 0:
            continue
        w_f = n - w_b
        if w_f == 0:
            break
        sum_b += t * hist[t]
        m_b = sum_b / w_b
        m_f = (total - sum_b) / w_f
        var = w_b * w_f * (m_b - m_f) ** 2
        if var > best_var:
            best_var = var
            best_t = t
    return best_t`,
    testCases: [
      { input: [[[0, 0], [255, 255]]], expected: 0 },
      { input: [[[1, 2], [3, 4]]], expected: 2 },
      { input: [[[0, 1], [8, 9]]], expected: 1 },
      { input: [[[7, 7], [7, 7]]], expected: 0 },
    ],
    hint: "Sweep t from 0 to 255 while tracking the running sum of the low class.",
  },
  {
    id: "cv-035",
    title: "2D Convolution (Valid)",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Compute the valid-mode 2D convolution of an image with a kernel.\n\nout[i][j] = sum over (a, b) of image[i + a][j + b] * kernel[kh - 1 - a][kw - 1 - b], so the kernel is flipped 180 degrees relative to cross-correlation. The output shape is (H - kh + 1) x (W - kw + 1).",
    starterCode: `def convolve2d(image, kernel):
    # Your code here
    pass`,
    solution: `def convolve2d(image, kernel):
    h = len(image)
    w = len(image[0])
    kh = len(kernel)
    kw = len(kernel[0])
    out = []
    for i in range(h - kh + 1):
        row = []
        for j in range(w - kw + 1):
            s = 0
            for a in range(kh):
                for b in range(kw):
                    s += image[i + a][j + b] * kernel[kh - 1 - a][kw - 1 - b]
            row.append(s)
        out.append(row)
    return out`,
    testCases: [
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], [[1, 0], [0, 0]]], expected: [[5, 6], [8, 9]] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], [[0, 0, 0], [0, 1, 0], [0, 0, 0]]], expected: [[5]] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], [[1, 2], [3, 4]]], expected: [[23, 33], [53, 63]] },
      { input: [[[1, 2, 3], [4, 5, 6]], [[1, 1], [1, 1]]], expected: [[12, 16]] },
    ],
    hint: "Same sliding-window code as correlation, but read the kernel backwards.",
  },
  {
    id: "cv-036",
    title: "Sobel Gradient Magnitude",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Compute the Sobel gradient magnitude of a grayscale image.\n\nUse Gx = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]] and Gy = [[1, 2, 1], [0, 0, 0], [-1, -2, -1]] in valid mode, then output sqrt(Gx^2 + Gy^2) rounded to 4 decimal places. The output shape is (H - 2) x (W - 2).",
    starterCode: `def sobel_magnitude(image):
    # Your code here
    pass`,
    solution: `def sobel_magnitude(image):
    gx = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]]
    gy = [[1, 2, 1], [0, 0, 0], [-1, -2, -1]]
    h = len(image)
    w = len(image[0])
    out = []
    for i in range(h - 2):
        row = []
        for j in range(w - 2):
            sx = 0
            sy = 0
            for a in range(3):
                for b in range(3):
                    sx += image[i + a][j + b] * gx[a][b]
                    sy += image[i + a][j + b] * gy[a][b]
            row.append(round((sx * sx + sy * sy) ** 0.5, 4))
        out.append(row)
    return out`,
    testCases: [
      { input: [[[5, 5, 5], [5, 5, 5], [5, 5, 5]]], expected: [[0.0]] },
      { input: [[[0, 0, 0], [0, 0, 0], [0, 0, 10]]], expected: [[14.1421]] },
      { input: [[[0, 0, 0], [0, 0, 0], [5, 5, 5]]], expected: [[20.0]] },
      { input: [[[0, 0, 0, 0], [0, 10, 10, 0], [0, 10, 10, 0], [0, 0, 0, 0]]], expected: [[42.4264, 42.4264], [42.4264, 42.4264]] },
    ],
    hint: "Compute both directional responses, then take the Euclidean norm.",
  },
  {
    id: "cv-037",
    title: "Histogram Equalization",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Equalize the histogram of a grayscale image with a 256-bin lookup table.\n\nFor each intensity v, output round(255 * cdf(v) / N), where cdf(v) is the cumulative count of pixels with value <= v and N is the total pixel count. An empty image returns [].",
    starterCode: `def histogram_equalize(image):
    # Your code here
    pass`,
    solution: `def histogram_equalize(image):
    hist = [0] * 256
    total = 0
    for row in image:
        for v in row:
            hist[v] += 1
            total += 1
    if total == 0:
        return []
    lut = []
    cum = 0
    for v in range(256):
        cum += hist[v]
        lut.append(round(255 * cum / total))
    return [[lut[v] for v in row] for row in image]`,
    testCases: [
      { input: [[[0, 0], [255, 255]]], expected: [[128, 128], [255, 255]] },
      { input: [[[0, 1], [2, 3]]], expected: [[64, 128], [191, 255]] },
      { input: [[[5, 5]]], expected: [[255, 255]] },
      { input: [[]], expected: [] },
    ],
    hint: "Build the cumulative histogram first, then map each pixel through the lookup table.",
  },
  {
    id: "cv-038",
    title: "Count Connected Components",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Count the connected components of 1-valued pixels in a binary mask using 4-connectivity.\n\nPixels that touch only diagonally belong to different components. An empty mask has 0 components.",
    starterCode: `def count_components(mask):
    # Your code here
    pass`,
    solution: `def count_components(mask):
    h = len(mask)
    w = len(mask[0]) if h else 0
    seen = [[False] * w for _ in range(h)]
    count = 0
    for i in range(h):
        for j in range(w):
            if mask[i][j] and not seen[i][j]:
                count += 1
                stack = [(i, j)]
                seen[i][j] = True
                while stack:
                    ci, cj = stack.pop()
                    for di, dj in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                        ni, nj = ci + di, cj + dj
                        if 0 <= ni < h and 0 <= nj < w and mask[ni][nj] and not seen[ni][nj]:
                            seen[ni][nj] = True
                            stack.append((ni, nj))
    return count`,
    testCases: [
      { input: [[[1, 1, 0], [0, 1, 0], [0, 0, 1]]], expected: 2 },
      { input: [[[1, 0], [0, 1]]], expected: 2 },
      { input: [[[0, 0], [0, 0]]], expected: 0 },
      { input: [[[1, 1, 1], [1, 1, 1]]], expected: 1 },
      { input: [[]], expected: 0 },
    ],
    hint: "Scan every pixel; when you hit an unseen 1, flood fill it and increment the count.",
  },
  {
    id: "cv-039",
    title: "Intersection over Union",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Compute the intersection over union (IoU) of two bounding boxes.\n\nBoxes are [x1, y1, x2, y2] with continuous coordinates, so a box area is (x2 - x1) * (y2 - y1). Return intersection / union rounded to 4 decimal places, or 0.0 when the boxes do not overlap or a box is degenerate.",
    starterCode: `def iou(box_a, box_b):
    # Your code here
    pass`,
    solution: `def iou(box_a, box_b):
    ax1, ay1, ax2, ay2 = box_a
    bx1, by1, bx2, by2 = box_b
    ix1 = max(ax1, bx1)
    iy1 = max(ay1, by1)
    ix2 = min(ax2, bx2)
    iy2 = min(ay2, by2)
    iw = ix2 - ix1
    ih = iy2 - iy1
    if iw <= 0 or ih <= 0:
        return 0.0
    inter = iw * ih
    area_a = (ax2 - ax1) * (ay2 - ay1)
    area_b = (bx2 - bx1) * (by2 - by1)
    union = area_a + area_b - inter
    if union <= 0:
        return 0.0
    return round(inter / union, 4)`,
    testCases: [
      { input: [[0, 0, 2, 2], [0, 0, 2, 2]], expected: 1.0 },
      { input: [[0, 0, 2, 2], [3, 3, 5, 5]], expected: 0.0 },
      { input: [[0, 0, 2, 2], [1, 0, 3, 2]], expected: 0.3333 },
      { input: [[0, 0, 4, 4], [2, 2, 6, 6]], expected: 0.1429 },
      { input: [[0, 0, 0, 0], [0, 0, 2, 2]], expected: 0.0 },
    ],
    hint: "Intersection dimensions are clamped to zero when the boxes do not overlap.",
  },
  {
    id: "cv-040",
    title: "Non-Max Suppression",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Apply non-maximum suppression to a set of bounding boxes.\n\nSort indices by score descending (ties broken by original index), then greedily keep a box unless its IoU with an already kept box is strictly greater than iou_threshold. Return the kept indices in selection order; boxes use the [x1, y1, x2, y2] format.",
    starterCode: `def non_max_suppression(boxes, scores, iou_threshold):
    # Your code here
    pass`,
    solution: `def non_max_suppression(boxes, scores, iou_threshold):
    order = sorted(range(len(boxes)), key=lambda i: (-scores[i], i))
    keep = []
    for i in order:
        good = True
        for j in keep:
            ax1, ay1, ax2, ay2 = boxes[i]
            bx1, by1, bx2, by2 = boxes[j]
            ix1 = max(ax1, bx1)
            iy1 = max(ay1, by1)
            ix2 = min(ax2, bx2)
            iy2 = min(ay2, by2)
            iw = ix2 - ix1
            ih = iy2 - iy1
            inter = 0.0 if iw <= 0 or ih <= 0 else iw * ih
            union = (ax2 - ax1) * (ay2 - ay1) + (bx2 - bx1) * (by2 - by1) - inter
            if union > 0 and inter / union > iou_threshold:
                good = False
                break
        if good:
            keep.append(i)
    return keep`,
    testCases: [
      { input: [[[0, 0, 2, 2], [1, 1, 3, 3], [10, 10, 12, 12]], [0.9, 0.8, 0.7], 0.5], expected: [0, 1, 2] },
      { input: [[[0, 0, 2, 2], [1, 1, 3, 3], [10, 10, 12, 12]], [0.9, 0.8, 0.7], 0.1], expected: [0, 2] },
      { input: [[[0, 0, 1, 1], [0, 0, 1, 1], [0, 0, 1, 1]], [0.5, 0.9, 0.7], 0.5], expected: [1] },
      { input: [[], [], 0.5], expected: [] },
    ],
    hint: "Sort by score, then compare each candidate against the boxes already kept.",
  },
];
