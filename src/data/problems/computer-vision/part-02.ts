import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "cv-041",
    title: "Image Translation",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Shift a 2D image by (dy, dx) using zero fill.\n\nPositive dy moves content down and positive dx moves it right; pixels shifted outside the image are dropped and the exposed area is filled with 0. Return an image with the same shape; dy and dx may be negative.",
    starterCode: `def translate(image, dy, dx):
    # Your code here
    pass`,
    solution: `def translate(image, dy, dx):
    h = len(image)
    w = len(image[0]) if h else 0
    out = [[0] * w for _ in range(h)]
    for i in range(h):
        for j in range(w):
            si = i - dy
            sj = j - dx
            if 0 <= si < h and 0 <= sj < w:
                out[i][j] = image[si][sj]
    return out`,
    testCases: [
      { input: [[[1, 2], [3, 4]], 1, 1], expected: [[0, 0], [0, 1]] },
      { input: [[[1, 2], [3, 4]], -1, 0], expected: [[3, 4], [0, 0]] },
      { input: [[[1, 2], [3, 4]], 0, -3], expected: [[0, 0], [0, 0]] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], 1, -1], expected: [[0, 0, 0], [2, 3, 0], [5, 6, 0]] },
    ],
    hint: "Read from (i - dy, j - dx) and write 0 when the source falls outside.",
  },
  {
    id: "cv-042",
    title: "Edge Padding (Replicate)",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Pad a 2D image by replicating its edge pixels.\n\nEvery padded row or column copies the nearest original border pixel, so the top-left corner of [[1, 2], [3, 4]] with pad 1 is 1. pad may be 0.",
    starterCode: `def edge_pad(image, pad):
    # Your code here
    pass`,
    solution: `def edge_pad(image, pad):
    h = len(image)
    w = len(image[0]) if h else 0
    out = []
    for i in range(-pad, h + pad):
        ri = 0 if i < 0 else (h - 1 if i >= h else i)
        row = []
        for j in range(-pad, w + pad):
            cj = 0 if j < 0 else (w - 1 if j >= w else j)
            row.append(image[ri][cj])
        out.append(row)
    return out`,
    testCases: [
      { input: [[[1, 2], [3, 4]], 1], expected: [[1, 1, 2, 2], [1, 1, 2, 2], [3, 3, 4, 4], [3, 3, 4, 4]] },
      { input: [[[1, 2, 3]], 1], expected: [[1, 1, 2, 3, 3], [1, 1, 2, 3, 3], [1, 1, 2, 3, 3]] },
      { input: [[[1, 2], [3, 4]], 0], expected: [[1, 2], [3, 4]] },
      { input: [[[5]], 2], expected: [[5, 5, 5, 5, 5], [5, 5, 5, 5, 5], [5, 5, 5, 5, 5], [5, 5, 5, 5, 5], [5, 5, 5, 5, 5]] },
    ],
    hint: "Clamp the source index into [0, h - 1] and [0, w - 1] before reading.",
  },
  {
    id: "cv-043",
    title: "Constant Padding",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Pad a 2D image with a constant value.\n\nReturn a new image with pad extra rows and columns of value on every side while keeping the original values in the center. pad may be 0 and value may be negative.",
    starterCode: `def constant_pad(image, pad, value):
    # Your code here
    pass`,
    solution: `def constant_pad(image, pad, value):
    h = len(image)
    w = len(image[0]) if h else 0
    out = [[value] * (w + 2 * pad) for _ in range(pad)]
    for row in image:
        out.append([value] * pad + list(row) + [value] * pad)
    for _ in range(pad):
        out.append([value] * (w + 2 * pad))
    return out`,
    testCases: [
      { input: [[[1, 2], [3, 4]], 1, 9], expected: [[9, 9, 9, 9], [9, 1, 2, 9], [9, 3, 4, 9], [9, 9, 9, 9]] },
      { input: [[[1, 2]], 1, -1], expected: [[-1, -1, -1, -1], [-1, 1, 2, -1], [-1, -1, -1, -1]] },
      { input: [[[1, 2], [3, 4]], 0, 7], expected: [[1, 2], [3, 4]] },
    ],
  },
  {
    id: "cv-044",
    title: "Image to Flat List",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Flatten a 2D image into a 1D list in row-major order.\n\nRows are emitted top to bottom and values inside each row left to right. An empty image returns [].",
    starterCode: `def flatten_image(image):
    # Your code here
    pass`,
    solution: `def flatten_image(image):
    return [v for row in image for v in row]`,
    testCases: [
      { input: [[[1, 2, 3], [4, 5, 6]]], expected: [1, 2, 3, 4, 5, 6] },
      { input: [[[7]]], expected: [7] },
      { input: [[]], expected: [] },
      { input: [[[1, 2], [3, 4], [5, 6]]], expected: [1, 2, 3, 4, 5, 6] },
    ],
  },
  {
    id: "cv-045",
    title: "Reshape Flat List to Image",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Reshape a flat list into a rows x cols 2D image in row-major order.\n\nYou may assume len(flat) equals rows * cols. A rows value of 0 returns [].",
    starterCode: `def reshape_to_image(flat, rows, cols):
    # Your code here
    pass`,
    solution: `def reshape_to_image(flat, rows, cols):
    return [flat[i * cols:(i + 1) * cols] for i in range(rows)]`,
    testCases: [
      { input: [[1, 2, 3, 4, 5, 6], 2, 3], expected: [[1, 2, 3], [4, 5, 6]] },
      { input: [[7], 1, 1], expected: [[7]] },
      { input: [[], 0, 3], expected: [] },
      { input: [[1, 2, 3, 4, 5, 6], 3, 2], expected: [[1, 2], [3, 4], [5, 6]] },
    ],
    hint: "Slice the flat list into consecutive chunks of length cols.",
  },
  {
    id: "cv-046",
    title: "Split Image into Tiles",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Split a 2D image into non-overlapping tile_h x tile_w tiles.\n\nWalk the image top to bottom and left to right and append one 2D tile per position to a flat list. You may assume both dimensions are divisible by the tile size.",
    starterCode: `def split_tiles(image, tile_h, tile_w):
    # Your code here
    pass`,
    solution: `def split_tiles(image, tile_h, tile_w):
    h = len(image)
    w = len(image[0]) if h else 0
    tiles = []
    for i in range(0, h, tile_h):
        for j in range(0, w, tile_w):
            tiles.append([row[j:j + tile_w] for row in image[i:i + tile_h]])
    return tiles`,
    testCases: [
      { input: [[[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]], 2, 2], expected: [[[0, 1], [4, 5]], [[2, 3], [6, 7]], [[8, 9], [12, 13]], [[10, 11], [14, 15]]] },
      { input: [[[1, 2, 3, 4], [5, 6, 7, 8]], 2, 2], expected: [[[1, 2], [5, 6]], [[3, 4], [7, 8]]] },
      { input: [[[1, 2], [3, 4]], 2, 2], expected: [[[1, 2], [3, 4]]] },
    ],
  },
  {
    id: "cv-047",
    title: "Pad Image to Square",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Pad a 2D image to a square with a constant value.\n\nExtra rows are added at the bottom and extra columns at the right until height equals width, all filled with value. An already square image is returned unchanged.",
    starterCode: `def pad_to_square(image, value):
    # Your code here
    pass`,
    solution: `def pad_to_square(image, value):
    h = len(image)
    w = len(image[0]) if h else 0
    side = max(h, w)
    out = []
    for i in range(side):
        row = []
        for j in range(side):
            if i < h and j < w:
                row.append(image[i][j])
            else:
                row.append(value)
        out.append(row)
    return out`,
    testCases: [
      { input: [[[1, 2], [3, 4], [5, 6]], 0], expected: [[1, 2, 0], [3, 4, 0], [5, 6, 0]] },
      { input: [[[1, 2, 3], [4, 5, 6]], 9], expected: [[1, 2, 3], [4, 5, 6], [9, 9, 9]] },
      { input: [[[1, 2], [3, 4]], 0], expected: [[1, 2], [3, 4]] },
    ],
  },
  {
    id: "cv-048",
    title: "Center Crop",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Crop a 2D image around its center.\n\nUse top = (H - out_h) // 2 and left = (W - out_w) // 2, then take out_h rows and out_w columns. You may assume out_h <= H and out_w <= W.",
    starterCode: `def center_crop(image, out_h, out_w):
    # Your code here
    pass`,
    solution: `def center_crop(image, out_h, out_w):
    h = len(image)
    w = len(image[0])
    top = (h - out_h) // 2
    left = (w - out_w) // 2
    return [row[left:left + out_w] for row in image[top:top + out_h]]`,
    testCases: [
      { input: [[[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]], 2, 2], expected: [[5, 6], [9, 10]] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], 2, 2], expected: [[1, 2], [4, 5]] },
      { input: [[[1, 2, 3], [4, 5, 6]], 2, 2], expected: [[1, 2], [4, 5]] },
    ],
  },
  {
    id: "cv-049",
    title: "Count Non-Zero Pixels",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Count the number of non-zero pixels in a 2D image.\n\nAn empty image has 0 non-zero pixels.",
    starterCode: `def count_nonzero(image):
    # Your code here
    pass`,
    solution: `def count_nonzero(image):
    count = 0
    for row in image:
        for v in row:
            if v != 0:
                count += 1
    return count`,
    testCases: [
      { input: [[[0, 1, 0], [2, 0, 3]]], expected: 3 },
      { input: [[[0, 0], [0, 0]]], expected: 0 },
      { input: [[[1, 2], [3, 4]]], expected: 4 },
      { input: [[]], expected: 0 },
    ],
  },
  {
    id: "cv-050",
    title: "Percentage of White Pixels",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Compute the percentage of pixels that are strictly greater than threshold.\n\nReturn the percentage rounded to 2 decimal places. The image is non-empty.",
    starterCode: `def white_percentage(image, threshold):
    # Your code here
    pass`,
    solution: `def white_percentage(image, threshold):
    total = 0
    white = 0
    for row in image:
        for v in row:
            total += 1
            if v > threshold:
                white += 1
    return round(100.0 * white / total, 2)`,
    testCases: [
      { input: [[[0, 255], [255, 255]], 127], expected: 75.0 },
      { input: [[[0, 127]], 127], expected: 0.0 },
      { input: [[[255, 255, 0]], 0], expected: 66.67 },
      { input: [[[0, 0, 255]], 127], expected: 33.33 },
    ],
  },
  {
    id: "cv-051",
    title: "Posterize",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Quantize a grayscale image to a fixed number of evenly spaced levels.\n\nFor each pixel, snap to the nearest level with index = round(v * (levels - 1) / 255), then map back with round(index * 255 / (levels - 1)). levels is at least 2 and outputs are integers in [0, 255].",
    starterCode: `def posterize(image, levels):
    # Your code here
    pass`,
    solution: `def posterize(image, levels):
    out = []
    for row in image:
        r = []
        for v in row:
            level = round(v * (levels - 1) / 255)
            r.append(round(level * 255 / (levels - 1)))
        out.append(r)
    return out`,
    testCases: [
      { input: [[[0, 100], [200, 255]], 4], expected: [[0, 85], [170, 255]] },
      { input: [[[0, 128, 255]], 2], expected: [[0, 255, 255]] },
      { input: [[[10, 20, 30], [240, 250, 255]], 3], expected: [[0, 0, 0], [255, 255, 255]] },
    ],
    hint: "Map to a level index first, then scale that index back to 0-255.",
  },
  {
    id: "cv-052",
    title: "Solarize",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Apply a solarize effect to a grayscale image.\n\nPixels strictly greater than threshold are inverted with 255 - v; all other pixels are left unchanged.",
    starterCode: `def solarize(image, threshold):
    # Your code here
    pass`,
    solution: `def solarize(image, threshold):
    return [[255 - v if v > threshold else v for v in row] for row in image]`,
    testCases: [
      { input: [[[0, 255], [128, 100]], 127], expected: [[0, 0], [127, 100]] },
      { input: [[[200, 201]], 200], expected: [[200, 54]] },
      { input: [[[0, 0], [0, 0]], 0], expected: [[0, 0], [0, 0]] },
    ],
  },
  {
    id: "cv-053",
    title: "Grayscale by Average",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Convert an RGB image to grayscale using the simple channel average.\n\nFor each [r, g, b] pixel return round((r + g + b) / 3, 2). An empty image returns []; this differs from the weighted luminance conversion.",
    starterCode: `def grayscale_average(image):
    # Your code here
    pass`,
    solution: `def grayscale_average(image):
    out = []
    for row in image:
        out.append([round((p[0] + p[1] + p[2]) / 3, 2) for p in row])
    return out`,
    testCases: [
      { input: [[[[0, 0, 0], [255, 255, 255]]]], expected: [[0.0, 255.0]] },
      { input: [[[[30, 60, 90]]]], expected: [[60.0]] },
      { input: [[[[1, 2, 4]]]], expected: [[2.33]] },
      { input: [[]], expected: [] },
    ],
  },
  {
    id: "cv-054",
    title: "Flatten Channels",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Flatten an RGB image into a single list of channel values.\n\nValues are emitted in row-major pixel order, and within each pixel in r, g, b order. An empty image returns [].",
    starterCode: `def flatten_channels(image):
    # Your code here
    pass`,
    solution: `def flatten_channels(image):
    return [c for row in image for p in row for c in p]`,
    testCases: [
      { input: [[[[1, 2, 3], [4, 5, 6]]]], expected: [1, 2, 3, 4, 5, 6] },
      { input: [[[[7, 8, 9]]]], expected: [7, 8, 9] },
      { input: [[]], expected: [] },
    ],
  },
  {
    id: "cv-055",
    title: "Mirror Padding",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Pad an image by mirroring it across its edges including the edge pixels (symmetric mode).\n\nWith one row [a, b, c] and pad 1 the padded row is [a, a, b, c, c]. Apply the same rule to rows and columns; each dimension is at least 2 when pad is positive.",
    starterCode: `def mirror_pad(image, pad):
    # Your code here
    pass`,
    solution: `def mirror_pad(image, pad):
    h = len(image)
    w = len(image[0]) if h else 0
    if h == 0 or w == 0:
        return []
    out = []
    for i in range(-pad, h + pad):
        ri = i % (2 * h)
        if ri >= h:
            ri = 2 * h - 1 - ri
        row = []
        for j in range(-pad, w + pad):
            cj = j % (2 * w)
            if cj >= w:
                cj = 2 * w - 1 - cj
            row.append(image[ri][cj])
        out.append(row)
    return out`,
    testCases: [
      { input: [[[1, 2], [3, 4]], 1], expected: [[1, 1, 2, 2], [1, 1, 2, 2], [3, 3, 4, 4], [3, 3, 4, 4]] },
      { input: [[[1, 2, 3], [4, 5, 6]], 1], expected: [[1, 1, 2, 3, 3], [1, 1, 2, 3, 3], [4, 4, 5, 6, 6], [4, 4, 5, 6, 6]] },
      { input: [[[1, 2], [3, 4]], 0], expected: [[1, 2], [3, 4]] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], 1], expected: [[1, 1, 2, 3, 3], [1, 1, 2, 3, 3], [4, 4, 5, 6, 6], [7, 7, 8, 9, 9], [7, 7, 8, 9, 9]] },
    ],
    hint: "Fold the index modulo 2n so -1 maps to 0 and n maps to n - 1.",
  },
  {
    id: "cv-056",
    title: "Separable Convolution",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Apply a 1D kernel along the rows and then along the columns in valid mode.\n\nFirst compute row[i][j] = sum_m image[i][j + m] * kernel[m], then out[i][j] = sum_m row[i + m][j] * kernel[m]. The final shape is (H - k + 1) x (W - k + 1) where k = len(kernel).",
    starterCode: `def separable_convolve(image, kernel):
    # Your code here
    pass`,
    solution: `def separable_convolve(image, kernel):
    k = len(kernel)
    h = len(image)
    w = len(image[0])
    rowout = []
    for i in range(h):
        row = []
        for j in range(w - k + 1):
            s = 0
            for m in range(k):
                s += image[i][j + m] * kernel[m]
            row.append(s)
        rowout.append(row)
    out = []
    for i in range(h - k + 1):
        row = []
        for j in range(w - k + 1):
            s = 0
            for m in range(k):
                s += rowout[i + m][j] * kernel[m]
            row.append(s)
        out.append(row)
    return out`,
    testCases: [
      { input: [[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]], [1, 2, 1]], expected: [[96, 112]] },
      { input: [[[1, 1, 1], [1, 1, 1], [1, 1, 1]], [1, 1, 1]], expected: [[9]] },
      { input: [[[1, 2, 3], [4, 5, 6]], [1, 1]], expected: [[12, 16]] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], [1, -1]], expected: [[0, 0], [0, 0]] },
    ],
    hint: "Do one horizontal pass into a temporary image, then a vertical pass.",
  },
  {
    id: "cv-057",
    title: "Unsharp Masking",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Sharpen a grayscale image with unsharp masking.\n\nBlur the image with a normalized 3x3 Gaussian kernel (sigma 1) using valid-mode cross-correlation, then set each center pixel to clamp(round(v + amount * (v - blur)), 0, 255), where v is the corresponding input pixel. The output shape is (H - 2) x (W - 2).",
    starterCode: `def unsharp_mask(image, amount):
    # Your code here
    pass`,
    solution: `def unsharp_mask(image, amount):
    sigma = 1.0
    half = 1
    kernel = []
    total = 0.0
    for i in range(3):
        row = []
        for j in range(3):
            d = (i - half) ** 2 + (j - half) ** 2
            v = pow(2.718281828459045, -d / (2 * sigma * sigma))
            row.append(v)
            total += v
        kernel.append(row)
    kernel = [[v / total for v in row] for row in kernel]
    h = len(image)
    w = len(image[0])
    out = []
    for i in range(h - 2):
        row = []
        for j in range(w - 2):
            blur = 0.0
            for a in range(3):
                for b in range(3):
                    blur += image[i + a][j + b] * kernel[a][b]
            center = image[i + 1][j + 1]
            val = round(center + amount * (center - blur))
            row.append(max(0, min(255, val)))
        out.append(row)
    return out`,
    testCases: [
      { input: [[[4, 4, 4], [4, 4, 4], [4, 4, 4]], 1.0], expected: [[4]] },
      { input: [[[0, 0, 0], [0, 10, 0], [0, 0, 0]], 1.0], expected: [[18]] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], 0.5], expected: [[5]] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], 0.0], expected: [[5]] },
    ],
    hint: "Add back a scaled version of the high-frequency detail (original minus blur).",
  },
  {
    id: "cv-058",
    title: "Sobel X and Y",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the Sobel gradients Gx and Gy separately in valid mode.\n\nUse Gx = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]] and Gy = [[1, 2, 1], [0, 0, 0], [-1, -2, -1]]. Return [gx, gy], two (H - 2) x (W - 2) integer maps.",
    starterCode: `def sobel_xy(image):
    # Your code here
    pass`,
    solution: `def sobel_xy(image):
    gxk = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]]
    gyk = [[1, 2, 1], [0, 0, 0], [-1, -2, -1]]
    h = len(image)
    w = len(image[0])
    gx = []
    gy = []
    for i in range(h - 2):
        rx = []
        ry = []
        for j in range(w - 2):
            sx = 0
            sy = 0
            for a in range(3):
                for b in range(3):
                    sx += image[i + a][j + b] * gxk[a][b]
                    sy += image[i + a][j + b] * gyk[a][b]
            rx.append(sx)
            ry.append(sy)
        gx.append(rx)
        gy.append(ry)
    return [gx, gy]`,
    testCases: [
      { input: [[[0, 0, 0], [0, 0, 0], [0, 0, 10]]], expected: [[[10]], [[-10]]] },
      { input: [[[0, 0, 0], [0, 0, 0], [5, 5, 5]]], expected: [[[0]], [[-20]]] },
      { input: [[[0, 0, 0], [5, 5, 5], [0, 0, 0]]], expected: [[[0]], [[0]]] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: [[[8]], [[-24]]] },
    ],
    hint: "Run the same sliding window twice, once per kernel.",
  },
  {
    id: "cv-059",
    title: "Gradient Direction Angle",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the Sobel gradient direction angle at every valid pixel.\n\nFor each 3x3 window compute sx and sy with the Sobel kernels, then angle = degrees(atan2(sy, sx)) mod 180, rounded to 2 decimal places. Return the (H - 2) x (W - 2) map.",
    starterCode: `def gradient_direction(image):
    # Your code here
    pass`,
    solution: `def gradient_direction(image):
    import math
    gxk = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]]
    gyk = [[1, 2, 1], [0, 0, 0], [-1, -2, -1]]
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
                    sx += image[i + a][j + b] * gxk[a][b]
                    sy += image[i + a][j + b] * gyk[a][b]
            angle = math.degrees(math.atan2(sy, sx)) % 180
            row.append(round(angle, 2))
        out.append(row)
    return out`,
    testCases: [
      { input: [[[7, 7, 7], [7, 7, 7], [7, 7, 7]]], expected: [[0.0]] },
      { input: [[[0, 0, 0], [0, 0, 0], [0, 0, 10]]], expected: [[135.0]] },
      { input: [[[0, 0, 0], [0, 0, 0], [5, 5, 5]]], expected: [[90.0]] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: [[108.43]] },
    ],
    hint: "Use atan2(sy, sx) so the quadrant is handled automatically, then reduce mod 180.",
  },
  {
    id: "cv-060",
    title: "Double Threshold Classification",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Classify pixels with a double threshold.\n\nReturn 255 when v > high, 128 when low < v <= high, and 0 when v <= low. Both low and high comparisons are strict on the low side.",
    starterCode: `def double_threshold(image, low, high):
    # Your code here
    pass`,
    solution: `def double_threshold(image, low, high):
    out = []
    for row in image:
        r = []
        for v in row:
            if v > high:
                r.append(255)
            elif v > low:
                r.append(128)
            else:
                r.append(0)
        out.append(r)
    return out`,
    testCases: [
      { input: [[[0, 50, 100], [150, 200, 255]], 50, 150], expected: [[0, 0, 128], [128, 255, 255]] },
      { input: [[[0, 0], [255, 255]], 100, 200], expected: [[0, 0], [255, 255]] },
      { input: [[[50, 50]], 50, 100], expected: [[0, 0]] },
      { input: [[[100]], 50, 100], expected: [[128]] },
    ],
  },
  {
    id: "cv-061",
    title: "Adaptive Threshold (Mean minus C)",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Threshold each pixel against the mean of its local neighborhood minus c.\n\nFor each pixel compute the mean of the in-bounds pixels in its k x k window (k odd, clipped at the borders) and output 255 if the pixel is strictly greater than mean - c, otherwise 0. The output has the same shape as the image.",
    starterCode: `def adaptive_threshold(image, k, c):
    # Your code here
    pass`,
    solution: `def adaptive_threshold(image, k, c):
    h = len(image)
    w = len(image[0])
    half = k // 2
    out = []
    for i in range(h):
        row = []
        for j in range(w):
            total = 0
            count = 0
            for di in range(-half, half + 1):
                for dj in range(-half, half + 1):
                    ni = i + di
                    nj = j + dj
                    if 0 <= ni < h and 0 <= nj < w:
                        total += image[ni][nj]
                        count += 1
            mean = total / count
            row.append(255 if image[i][j] > mean - c else 0)
        out.append(row)
    return out`,
    testCases: [
      { input: [[[5, 5], [5, 5]], 3, 1], expected: [[255, 255], [255, 255]] },
      { input: [[[0, 0, 0], [0, 100, 0], [0, 0, 0]], 3, 5], expected: [[0, 0, 0], [0, 255, 0], [0, 0, 0]] },
      { input: [[[10, 10, 10], [10, 10, 10], [10, 10, 10]], 3, 0], expected: [[0, 0, 0], [0, 0, 0], [0, 0, 0]] },
      { input: [[[0, 255, 0], [0, 255, 0], [0, 255, 0]], 3, 10], expected: [[0, 255, 0], [0, 255, 0], [0, 255, 0]] },
    ],
    hint: "Clip the window at the borders and only count the pixels that exist.",
  },
  {
    id: "cv-062",
    title: "Integral Image Build",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Build a summed-area table (integral image).\n\nReturn a (H + 1) x (W + 1) grid whose first row and column are zeros, where s[i + 1][j + 1] is the sum of the input rectangle from (0, 0) to (i, j) inclusive.",
    starterCode: `def integral_image(image):
    # Your code here
    pass`,
    solution: `def integral_image(image):
    h = len(image)
    w = len(image[0]) if h else 0
    out = [[0] * (w + 1) for _ in range(h + 1)]
    for i in range(h):
        for j in range(w):
            out[i + 1][j + 1] = (image[i][j] + out[i][j + 1] + out[i + 1][j] - out[i][j])
    return out`,
    testCases: [
      { input: [[[1, 2], [3, 4]]], expected: [[0, 0, 0], [0, 1, 3], [0, 4, 10]] },
      { input: [[[1, 2, 3]]], expected: [[0, 0, 0, 0], [0, 1, 3, 6]] },
      { input: [[[5]]], expected: [[0, 0], [0, 5]] },
      { input: [[[-1, 2], [3, -4]]], expected: [[0, 0, 0], [0, -1, 1], [0, 2, 0]] },
    ],
    hint: "Each cell is the input value plus the cell above plus the cell left minus the diagonal.",
  },
  {
    id: "cv-063",
    title: "Integral Image Rectangle Sum",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Sum an inclusive rectangle using a precomputed integral image.\n\nGiven an integral image of shape (H + 1) x (W + 1), return the sum of the original rectangle from rows r1..r2 and columns c1..c2 inclusive using four lookups. You may assume valid indices with r1 <= r2 and c1 <= c2.",
    starterCode: `def rect_sum(integral, r1, c1, r2, c2):
    # Your code here
    pass`,
    solution: `def rect_sum(integral, r1, c1, r2, c2):
    return (integral[r2 + 1][c2 + 1] - integral[r1][c2 + 1]
            - integral[r2 + 1][c1] + integral[r1][c1])`,
    testCases: [
      { input: [[[0, 0, 0, 0], [0, 1, 3, 6], [0, 5, 12, 21], [0, 12, 27, 45]], 0, 0, 0, 0], expected: 1 },
      { input: [[[0, 0, 0, 0], [0, 1, 3, 6], [0, 5, 12, 21], [0, 12, 27, 45]], 1, 1, 2, 2], expected: 28 },
      { input: [[[0, 0, 0, 0], [0, 1, 3, 6], [0, 5, 12, 21], [0, 12, 27, 45]], 0, 1, 2, 1], expected: 15 },
      { input: [[[0, 0, 0, 0], [0, 1, 3, 6], [0, 5, 12, 21], [0, 12, 27, 45]], 2, 0, 2, 2], expected: 24 },
    ],
    hint: "Inclusion-exclusion: bottom-right minus top band minus left band plus the top-left corner.",
  },
  {
    id: "cv-064",
    title: "HOG Cell (9-Bin)",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Build a simplified 9-bin HOG histogram over a whole gradient map.\n\nFor each pixel with gradients (gx, gy), let mag = sqrt(gx^2 + gy^2) and bin = int((degrees(atan2(gy, gx)) mod 180) // 20) mod 9, then accumulate mag into that bin. Return the 9 bin sums rounded to 4 decimal places.",
    starterCode: `def hog_cell(gx, gy):
    # Your code here
    pass`,
    solution: `def hog_cell(gx, gy):
    import math
    bins = [0.0] * 9
    for i in range(len(gx)):
        for j in range(len(gx[0])):
            mag = (gx[i][j] ** 2 + gy[i][j] ** 2) ** 0.5
            angle = math.degrees(math.atan2(gy[i][j], gx[i][j])) % 180
            b = int(angle // 20) % 9
            bins[b] += mag
    return [round(v, 4) for v in bins]`,
    testCases: [
      { input: [[[1, 0], [0, 1]], [[0, 1], [1, 0]]], expected: [2.0, 0.0, 0.0, 0.0, 2.0, 0.0, 0.0, 0.0, 0.0] },
      { input: [[[0, 0, 0], [0, 0, 0], [0, 0, 0]], [[1, 1, 1], [1, 1, 1], [1, 1, 1]]], expected: [0.0, 0.0, 0.0, 0.0, 9.0, 0.0, 0.0, 0.0, 0.0] },
      { input: [[[3, 0]], [[4, 0]]], expected: [0.0, 0.0, 5.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0] },
      { input: [[[1, 1]], [[1, -1]]], expected: [0.0, 0.0, 1.4142, 0.0, 0.0, 0.0, 1.4142, 0.0, 0.0] },
    ],
    hint: "Orientations live in [0, 180): 20 degrees per bin, folded with modulo.",
  },
  {
    id: "cv-065",
    title: "Sepia Filter",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Apply the classic sepia transform to an RGB image.\n\ntr = 0.393r + 0.769g + 0.189b, tg = 0.349r + 0.686g + 0.168b and tb = 0.272r + 0.534g + 0.131b. Each channel is rounded to the nearest integer and clamped to [0, 255].",
    starterCode: `def sepia(image):
    # Your code here
    pass`,
    solution: `def sepia(image):
    out = []
    for row in image:
        r = []
        for p in row:
            tr = round(0.393 * p[0] + 0.769 * p[1] + 0.189 * p[2])
            tg = round(0.349 * p[0] + 0.686 * p[1] + 0.168 * p[2])
            tb = round(0.272 * p[0] + 0.534 * p[1] + 0.131 * p[2])
            r.append([max(0, min(255, tr)), max(0, min(255, tg)), max(0, min(255, tb))])
        out.append(r)
    return out`,
    testCases: [
      { input: [[[[255, 0, 0]]]], expected: [[[100, 89, 69]]] },
      { input: [[[[0, 255, 0]]]], expected: [[[196, 175, 136]]] },
      { input: [[[[0, 0, 255]]]], expected: [[[48, 43, 33]]] },
      { input: [[[[255, 255, 255], [0, 0, 0]]]], expected: [[[255, 255, 239], [0, 0, 0]]] },
    ],
  },
  {
    id: "cv-066",
    title: "Contrast Stretch (Percentile)",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Stretch image contrast between two percentiles.\n\nSort all n pixel values, take lo at index int(low_pct / 100 * (n - 1)) and hi at index int(high_pct / 100 * (n - 1)), then map each pixel with clamp(round((v - lo) / (hi - lo) * 255), 0, 255). If hi equals lo, return a same-shaped grid of zeros.",
    starterCode: `def percentile_stretch(image, low_pct, high_pct):
    # Your code here
    pass`,
    solution: `def percentile_stretch(image, low_pct, high_pct):
    flat = sorted(v for row in image for v in row)
    n = len(flat)
    lo = flat[int(low_pct / 100 * (n - 1))]
    hi = flat[int(high_pct / 100 * (n - 1))]
    if hi == lo:
        return [[0 for _ in row] for row in image]
    out = []
    for row in image:
        r = []
        for v in row:
            x = round((v - lo) / (hi - lo) * 255)
            r.append(max(0, min(255, x)))
        out.append(r)
    return out`,
    testCases: [
      { input: [[[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]], 10, 90], expected: [[0, 32, 64, 96, 128, 159, 191, 223, 255, 255]] },
      { input: [[[0, 0, 0, 255]], 0, 100], expected: [[0, 0, 0, 255]] },
      { input: [[[5, 5], [5, 5]], 0, 100], expected: [[0, 0], [0, 0]] },
      { input: [[[0, 50, 100, 150, 200, 250]], 20, 80], expected: [[0, 0, 85, 170, 255, 255]] },
    ],
    hint: "The percentile index uses integer truncation, and values outside the band are clamped.",
  },
  {
    id: "cv-067",
    title: "Image Pyramid Downsample",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Downsample an image by a factor of 2 using decimation.\n\nKeep the pixel at every even row and every even column, so a 3x3 input becomes 2x2 and a 1x1 input stays 1x1.",
    starterCode: `def pyramid_downsample(image):
    # Your code here
    pass`,
    solution: `def pyramid_downsample(image):
    h = len(image)
    w = len(image[0])
    out = []
    for i in range(0, h, 2):
        row = []
        for j in range(0, w, 2):
            row.append(image[i][j])
        out.append(row)
    return out`,
    testCases: [
      { input: [[[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]]], expected: [[0, 2], [8, 10]] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: [[1, 3], [7, 9]] },
      { input: [[[1, 2], [3, 4]]], expected: [[1]] },
      { input: [[[42]]], expected: [[42]] },
    ],
  },
  {
    id: "cv-068",
    title: "Checkerboard Detection",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Check whether a binary mask is a perfect checkerboard.\n\nA mask is a checkerboard when mask[i][j] always equals (mask[0][0] + i + j) mod 2. An empty mask counts as a checkerboard.",
    starterCode: `def is_checkerboard(mask):
    # Your code here
    pass`,
    solution: `def is_checkerboard(mask):
    h = len(mask)
    w = len(mask[0]) if h else 0
    if h == 0 or w == 0:
        return True
    start = mask[0][0]
    for i in range(h):
        for j in range(w):
            if mask[i][j] != (start + i + j) % 2:
                return False
    return True`,
    testCases: [
      { input: [[[1, 0, 1], [0, 1, 0], [1, 0, 1]]], expected: true },
      { input: [[[0, 1], [1, 0]]], expected: true },
      { input: [[[1, 1], [0, 1]]], expected: false },
      { input: [[[1]]], expected: true },
      { input: [[]], expected: true },
    ],
    hint: "Compare each cell with (top-left value + row + column) mod 2.",
  },
  {
    id: "cv-069",
    title: "Hough Line Count",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Count line votes for a simple Hough accumulator.\n\nFor each slope m in slopes, compute the intercept b = round(y - m * x, 4) for every point [x, y] and return the maximum number of points sharing one intercept. The result has one integer per slope; an empty point list gives 0.",
    starterCode: `def hough_line_count(points, slopes):
    # Your code here
    pass`,
    solution: `def hough_line_count(points, slopes):
    result = []
    for m in slopes:
        counts = {}
        best = 0
        for x, y in points:
            b = round(y - m * x, 4)
            counts[b] = counts.get(b, 0) + 1
            if counts[b] > best:
                best = counts[b]
        result.append(best)
    return result`,
    testCases: [
      { input: [[[0, 0], [1, 1], [2, 2], [0, 1]], [1.0, 0.0]], expected: [3, 2] },
      { input: [[[0, 0], [1, 2], [2, 4]], [2.0, 1.0]], expected: [3, 1] },
      { input: [[[1, 1], [2, 2], [3, 4]], [1.0]], expected: [2] },
      { input: [[], [1.0]], expected: [0] },
    ],
    hint: "Points on the same line share the same intercept b = y - m * x.",
  },
  {
    id: "cv-070",
    title: "Alpha Blend",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Blend two grayscale images with alpha blending.\n\nFor each pixel compute clamp(round(alpha * a + (1 - alpha) * b), 0, 255). Both images have the same shape and alpha is in [0, 1].",
    starterCode: `def alpha_blend(a, b, alpha):
    # Your code here
    pass`,
    solution: `def alpha_blend(a, b, alpha):
    h = len(a)
    w = len(a[0])
    out = []
    for i in range(h):
        row = []
        for j in range(w):
            v = round(alpha * a[i][j] + (1 - alpha) * b[i][j])
            row.append(max(0, min(255, v)))
        out.append(row)
    return out`,
    testCases: [
      { input: [[[0, 100], [200, 255]], [[100, 200], [0, 255]], 0.5], expected: [[50, 150], [100, 255]] },
      { input: [[[10, 20]], [[30, 40]], 1.0], expected: [[10, 20]] },
      { input: [[[10, 20]], [[30, 40]], 0.0], expected: [[30, 40]] },
      { input: [[[10]], [[20]], 0.25], expected: [[18]] },
    ],
  },
  {
    id: "cv-071",
    title: "Color Temperature Shift",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Shift the color temperature of an RGB image with per-channel scaling.\n\nMultiply the red channel by factor, keep green unchanged, and divide blue by factor, rounding to the nearest integer and clamping each channel to [0, 255]. factor is positive.",
    starterCode: `def temperature_shift(image, factor):
    # Your code here
    pass`,
    solution: `def temperature_shift(image, factor):
    out = []
    for row in image:
        r = []
        for p in row:
            nr = max(0, min(255, round(p[0] * factor)))
            ng = p[1]
            nb = max(0, min(255, round(p[2] / factor)))
            r.append([nr, ng, nb])
        out.append(r)
    return out`,
    testCases: [
      { input: [[[[100, 100, 100]]], 1.2], expected: [[[120, 100, 83]]] },
      { input: [[[[255, 0, 255]]], 0.5], expected: [[[128, 0, 255]]] },
      { input: [[[[10, 20, 30]]], 1.0], expected: [[[10, 20, 30]]] },
      { input: [[[[10, 20, 30]]], 2.0], expected: [[[20, 20, 15]]] },
    ],
  },
  {
    id: "cv-072",
    title: "Image Entropy",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the Shannon entropy of a grayscale image in bits.\n\nBuild a 256-bin histogram, let p be each non-zero bin probability, then return round(-sum(p * log2(p)), 4). A constant image has entropy 0.0 and an empty image also returns 0.0.",
    starterCode: `def image_entropy(image):
    # Your code here
    pass`,
    solution: `def image_entropy(image):
    import math
    hist = [0] * 256
    n = 0
    for row in image:
        for v in row:
            hist[v] += 1
            n += 1
    if n == 0:
        return 0.0
    e = 0.0
    for c in hist:
        if c:
            p = c / n
            e -= p * math.log2(p)
    return round(e + 0.0, 4)`,
    testCases: [
      { input: [[[0, 0], [255, 255]]], expected: 1.0 },
      { input: [[[7, 7], [7, 7]]], expected: 0.0 },
      { input: [[[0, 1], [2, 3]]], expected: 2.0 },
      { input: [[[0, 0, 0, 255]]], expected: 0.8113 },
    ],
    hint: "Only non-zero histogram bins contribute to the sum of -p * log2(p).",
  },
  {
    id: "cv-073",
    title: "Bilateral Filter",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Apply a bilateral filter with a fixed 3x3 window.\n\nFor each pixel, weight each in-bounds neighbor by exp(-(di^2 + dj^2) / (2 * spatial_sigma^2)) * exp(-(diff^2) / (2 * range_sigma^2)), where diff is the intensity difference from the center pixel, then output the weighted mean rounded to 4 decimal places.",
    starterCode: `def bilateral_filter(image, spatial_sigma, range_sigma):
    # Your code here
    pass`,
    solution: `def bilateral_filter(image, spatial_sigma, range_sigma):
    h = len(image)
    w = len(image[0])
    out = []
    for i in range(h):
        row = []
        for j in range(w):
            ws = 0.0
            vs = 0.0
            for di in (-1, 0, 1):
                for dj in (-1, 0, 1):
                    ni = i + di
                    nj = j + dj
                    if 0 <= ni < h and 0 <= nj < w:
                        spat = pow(2.718281828459045, -(di * di + dj * dj) / (2 * spatial_sigma * spatial_sigma))
                        diff = image[ni][nj] - image[i][j]
                        rng = pow(2.718281828459045, -(diff * diff) / (2 * range_sigma * range_sigma))
                        wgt = spat * rng
                        ws += wgt
                        vs += wgt * image[ni][nj]
            row.append(round(vs / ws, 4))
        out.append(row)
    return out`,
    testCases: [
      { input: [[[7, 7, 7], [7, 7, 7], [7, 7, 7]], 1.0, 1.0], expected: [[7.0, 7.0, 7.0], [7.0, 7.0, 7.0], [7.0, 7.0, 7.0]] },
      { input: [[[0, 0, 0], [0, 9, 0], [0, 0, 0]], 1.0, 1.0], expected: [[0.0, 0.0, 0.0], [0.0, 9.0, 0.0], [0.0, 0.0, 0.0]] },
      { input: [[[0, 0], [0, 9]], 1.0, 1.0], expected: [[0.0, 0.0], [0.0, 9.0]] },
      { input: [[[0, 0, 0], [0, 10, 0], [0, 0, 0]], 1.0, 5.0], expected: [[0.22, 0.2708, 0.22], [0.2708, 6.5467, 0.2708], [0.22, 0.2708, 0.22]] },
    ],
    hint: "Multiply a spatial Gaussian weight by a range Gaussian weight for each neighbor.",
  },
  {
    id: "cv-074",
    title: "Canny Non-Max Suppression",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Run the non-maximum suppression step of Canny edge detection.\n\nFor every interior pixel, quantize the gradient angle (degrees mod 180) and keep the magnitude only when it is >= both neighbors along that direction, otherwise output 0. Angles below 22.5 or at least 157.5 use left/right neighbors, below 67.5 the anti-diagonal, below 112.5 up/down, and the rest the main diagonal. Border pixels are always 0.",
    starterCode: `def canny_nms(magnitude, angle):
    # Your code here
    pass`,
    solution: `def canny_nms(magnitude, angle):
    h = len(magnitude)
    w = len(magnitude[0])
    out = [[0.0] * w for _ in range(h)]
    for i in range(1, h - 1):
        for j in range(1, w - 1):
            a = angle[i][j] % 180
            m = magnitude[i][j]
            if a < 22.5 or a >= 157.5:
                n1 = magnitude[i][j - 1]
                n2 = magnitude[i][j + 1]
            elif a < 67.5:
                n1 = magnitude[i - 1][j + 1]
                n2 = magnitude[i + 1][j - 1]
            elif a < 112.5:
                n1 = magnitude[i - 1][j]
                n2 = magnitude[i + 1][j]
            else:
                n1 = magnitude[i - 1][j - 1]
                n2 = magnitude[i + 1][j + 1]
            if m >= n1 and m >= n2:
                out[i][j] = round(m, 4)
    return out`,
    testCases: [
      { input: [[[0, 0, 0], [0, 5, 0], [0, 0, 0]], [[0, 0, 0], [0, 0, 0], [0, 0, 0]]], expected: [[0.0, 0.0, 0.0], [0.0, 5.0, 0.0], [0.0, 0.0, 0.0]] },
      { input: [[[0, 0, 0], [0, 5, 4], [0, 0, 0]], [[0, 0, 0], [0, 0, 0], [0, 0, 0]]], expected: [[0.0, 0.0, 0.0], [0.0, 5.0, 0.0], [0.0, 0.0, 0.0]] },
      { input: [[[0, 0, 0], [0, 4, 5], [0, 0, 0]], [[0, 0, 0], [0, 0, 0], [0, 0, 0]]], expected: [[0.0, 0.0, 0.0], [0.0, 0.0, 0.0], [0.0, 0.0, 0.0]] },
      { input: [[[0, 5, 0], [0, 4, 0], [0, 3, 0]], [[0, 0, 0], [0, 90, 0], [0, 0, 0]]], expected: [[0.0, 0.0, 0.0], [0.0, 0.0, 0.0], [0.0, 0.0, 0.0]] },
    ],
    hint: "The quantized angle picks which pair of opposite neighbors to compare against.",
  },
  {
    id: "cv-075",
    title: "Hysteresis Thresholding",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Connect weak edge pixels to strong ones with hysteresis thresholding.\n\nPixels with value >= high are strong (255). Pixels with low <= value < high are weak candidates and become 255 only when 8-connected to a strong pixel (directly or through other weak pixels); all other pixels become 0.",
    starterCode: `def hysteresis_threshold(image, low, high):
    # Your code here
    pass`,
    solution: `def hysteresis_threshold(image, low, high):
    h = len(image)
    w = len(image[0])
    out = [[0] * w for _ in range(h)]
    stack = []
    for i in range(h):
        for j in range(w):
            if image[i][j] >= high:
                out[i][j] = 255
                stack.append((i, j))
    while stack:
        i, j = stack.pop()
        for di in (-1, 0, 1):
            for dj in (-1, 0, 1):
                ni = i + di
                nj = j + dj
                if 0 <= ni < h and 0 <= nj < w and out[ni][nj] == 0 and low <= image[ni][nj] < high:
                    out[ni][nj] = 255
                    stack.append((ni, nj))
    return out`,
    testCases: [
      { input: [[[0, 9, 5]], 5, 9], expected: [[0, 255, 255]] },
      { input: [[[0, 5, 0]], 5, 9], expected: [[0, 0, 0]] },
      { input: [[[5, 5, 9]], 5, 9], expected: [[255, 255, 255]] },
      { input: [[[0, 0, 0, 0, 0], [0, 5, 5, 0, 0], [0, 5, 0, 0, 0], [0, 0, 0, 5, 9], [0, 0, 0, 0, 0]], 5, 9], expected: [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 255, 255], [0, 0, 0, 0, 0]] },
    ],
    hint: "Seed a flood fill from every strong pixel and only walk onto weak pixels.",
  },
  {
    id: "cv-076",
    title: "Difference of Gaussians",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Compute the difference of two Gaussian blurs.\n\nApply a normalized 3x3 Gaussian kernel for sigma1 and sigma2 with valid-mode cross-correlation, subtract the second response from the first, and round to 4 decimal places. The output shape is (H - 2) x (W - 2).",
    starterCode: `def difference_of_gaussians(image, sigma1, sigma2):
    # Your code here
    pass`,
    solution: `def difference_of_gaussians(image, sigma1, sigma2):
    h = len(image)
    w = len(image[0])
    out = []
    for i in range(h - 2):
        row = []
        for j in range(w - 2):
            acc1 = 0.0
            acc2 = 0.0
            t1 = 0.0
            t2 = 0.0
            for a in range(3):
                for b in range(3):
                    d = (a - 1) ** 2 + (b - 1) ** 2
                    k1 = pow(2.718281828459045, -d / (2 * sigma1 * sigma1))
                    k2 = pow(2.718281828459045, -d / (2 * sigma2 * sigma2))
                    acc1 += image[i + a][j + b] * k1
                    acc2 += image[i + a][j + b] * k2
                    t1 += k1
                    t2 += k2
            row.append(round(acc1 / t1 - acc2 / t2, 4) + 0.0)
        out.append(row)
    return out`,
    testCases: [
      { input: [[[6, 6, 6], [6, 6, 6], [6, 6, 6]], 0.5, 1.0], expected: [[0.0]] },
      { input: [[[0, 0, 0], [0, 10, 0], [0, 0, 0]], 0.5, 1.0], expected: [[4.1517]] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], 1.0, 2.0], expected: [[0.0]] },
      { input: [[[1, 1, 1, 1, 1], [1, 5, 5, 5, 1], [1, 5, 9, 5, 1], [1, 5, 5, 5, 1], [1, 1, 1, 1, 1]], 0.8, 1.5], expected: [[0.2495, 0.301, 0.2495], [0.301, 0.4989, 0.301], [0.2495, 0.301, 0.2495]] },
    ],
    hint: "Normalize each kernel by its own sum before subtracting the responses.",
  },
  {
    id: "cv-077",
    title: "Laplacian of Gaussian Kernel",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Generate a zero-mean Laplacian of Gaussian (LoG) kernel.\n\nFor each offset d = (i - c)^2 + (j - c)^2 with c = size // 2, compute -1 / (pi * sigma^4) * (1 - d / (2 * sigma^2)) * exp(-d / (2 * sigma^2)), then subtract the kernel mean so all entries sum to 0. Round each entry to 6 decimal places; size is odd.",
    starterCode: `def log_kernel(size, sigma):
    # Your code here
    pass`,
    solution: `def log_kernel(size, sigma):
    import math
    half = size // 2
    raw = []
    total = 0.0
    for i in range(size):
        row = []
        for j in range(size):
            d = (i - half) ** 2 + (j - half) ** 2
            v = -1.0 / (math.pi * sigma ** 4) * (1 - d / (2 * sigma * sigma)) * math.exp(-d / (2 * sigma * sigma))
            row.append(v)
            total += v
        raw.append(row)
    mean = total / (size * size)
    return [[round(v - mean, 6) for v in row] for row in raw]`,
    testCases: [
      { input: [3, 1.0], expected: [[0.078271, -0.018261, 0.078271], [-0.018261, -0.240039, -0.018261], [0.078271, -0.018261, 0.078271]] },
      { input: [5, 1.0], expected: [[0.023435, 0.045138, 0.049023, 0.045138, 0.023435], [0.045138, 0.005945, -0.090587, 0.005945, 0.045138], [0.049023, -0.090587, -0.312365, -0.090587, 0.049023], [0.045138, 0.005945, -0.090587, 0.005945, 0.045138], [0.023435, 0.045138, 0.049023, 0.045138, 0.023435]] },
      { input: [1, 1.0], expected: [[0.0]] },
      { input: [3, 0.5], expected: [[0.415016, 0.82443, 0.415016], [0.82443, -4.957785, 0.82443], [0.415016, 0.82443, 0.415016]] },
    ],
    hint: "Compute the raw LoG values, then subtract their mean to force a zero sum.",
  },
  {
    id: "cv-078",
    title: "Harris Corner Response",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Compute the Harris corner response for every interior window.\n\nFirst compute Sobel gradients gx and gy in valid mode. Then slide a 3x3 window over those maps accumulating sxx, syy and sxy, with response R = det - 0.04 * trace^2 where det = sxx * syy - sxy^2 and trace = sxx + syy. Round to 4 decimal places; the output shape is (H - 4) x (W - 4).",
    starterCode: `def harris_response(image):
    # Your code here
    pass`,
    solution: `def harris_response(image):
    gxk = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]]
    gyk = [[1, 2, 1], [0, 0, 0], [-1, -2, -1]]
    h = len(image)
    w = len(image[0])
    gx = [[0] * (w - 2) for _ in range(h - 2)]
    gy = [[0] * (w - 2) for _ in range(h - 2)]
    for i in range(h - 2):
        for j in range(w - 2):
            sx = 0
            sy = 0
            for a in range(3):
                for b in range(3):
                    sx += image[i + a][j + b] * gxk[a][b]
                    sy += image[i + a][j + b] * gyk[a][b]
            gx[i][j] = sx
            gy[i][j] = sy
    out = []
    for i in range(h - 4):
        row = []
        for j in range(w - 4):
            sxx = 0
            syy = 0
            sxy = 0
            for a in range(3):
                for b in range(3):
                    sxx += gx[i + a][j + b] ** 2
                    syy += gy[i + a][j + b] ** 2
                    sxy += gx[i + a][j + b] * gy[i + a][j + b]
            det = sxx * syy - sxy * sxy
            trace = sxx + syy
            row.append(round(det - 0.04 * trace * trace, 4))
        out.append(row)
    return out`,
    testCases: [
      { input: [[[3, 3, 3, 3, 3], [3, 3, 3, 3, 3], [3, 3, 3, 3, 3], [3, 3, 3, 3, 3], [3, 3, 3, 3, 3]]], expected: [[0.0]] },
      { input: [[[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 9, 9, 9], [0, 0, 9, 9, 9], [0, 0, 9, 9, 9]]], expected: [[13222776.96]] },
      { input: [[[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 9, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]]], expected: [[793618.56]] },
      { input: [[[0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 5, 5, 5, 5], [0, 0, 5, 5, 5, 5], [0, 0, 5, 5, 5, 5]]], expected: [[1259600.0, 950900.0]] },
    ],
    hint: "A corner has both large gradient responses, so det dominates the trace term.",
  },
  {
    id: "cv-079",
    title: "Keypoint Local Max",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Keep only strict local maxima of a response map.\n\nA pixel is kept with its value rounded to 4 decimals when it is strictly greater than all 8 neighbors and strictly greater than threshold; border pixels are always 0.",
    starterCode: `def keypoint_local_max(response, threshold):
    # Your code here
    pass`,
    solution: `def keypoint_local_max(response, threshold):
    h = len(response)
    w = len(response[0])
    out = [[0.0] * w for _ in range(h)]
    for i in range(1, h - 1):
        for j in range(1, w - 1):
            v = response[i][j]
            if v > threshold and all(response[i + di][j + dj] < v
                                     for di in (-1, 0, 1) for dj in (-1, 0, 1)
                                     if not (di == 0 and dj == 0)):
                out[i][j] = round(v, 4)
    return out`,
    testCases: [
      { input: [[[0, 0, 0], [0, 9, 0], [0, 0, 0]], 5], expected: [[0.0, 0.0, 0.0], [0.0, 9.0, 0.0], [0.0, 0.0, 0.0]] },
      { input: [[[1, 2, 1], [2, 9, 2], [1, 2, 1]], 5], expected: [[0.0, 0.0, 0.0], [0.0, 9.0, 0.0], [0.0, 0.0, 0.0]] },
      { input: [[[0, 0, 0], [0, 9, 9], [0, 9, 9]], 5], expected: [[0.0, 0.0, 0.0], [0.0, 0.0, 0.0], [0.0, 0.0, 0.0]] },
      { input: [[[0, 0, 0], [0, 4, 0], [0, 0, 0]], 5], expected: [[0.0, 0.0, 0.0], [0.0, 0.0, 0.0], [0.0, 0.0, 0.0]] },
    ],
    hint: "Strict comparisons reject plateaus, so equal neighbors kill the keypoint.",
  },
  {
    id: "cv-080",
    title: "Rotate Arbitrary Angle",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Rotate a 2D image by an arbitrary angle using nearest-neighbor sampling.\n\nFor each output pixel (i, j) let dy = i - (H - 1) / 2 and dx = j - (W - 1) / 2, then sample the input at round((H - 1) / 2 + dy * cos(a) + dx * sin(a)) and round((W - 1) / 2 - dy * sin(a) + dx * cos(a)), where a = radians(angle). Out-of-bounds samples become 0 and the output keeps the original shape.",
    starterCode: `def rotate_nearest(image, angle):
    # Your code here
    pass`,
    solution: `def rotate_nearest(image, angle):
    import math
    h = len(image)
    w = len(image[0])
    cy = (h - 1) / 2.0
    cx = (w - 1) / 2.0
    a = math.radians(angle)
    cos_a = math.cos(a)
    sin_a = math.sin(a)
    out = []
    for i in range(h):
        row = []
        for j in range(w):
            dy = i - cy
            dx = j - cx
            sy = cy + dy * cos_a + dx * sin_a
            sx = cx - dy * sin_a + dx * cos_a
            ri = round(sy)
            rj = round(sx)
            if 0 <= ri < h and 0 <= rj < w:
                row.append(image[ri][rj])
            else:
                row.append(0)
        out.append(row)
    return out`,
    testCases: [
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], 0], expected: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], 180], expected: [[9, 8, 7], [6, 5, 4], [3, 2, 1]] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], 90], expected: [[3, 6, 9], [2, 5, 8], [1, 4, 7]] },
      { input: [[[1, 2, 3], [4, 5, 6]], 90], expected: [[3, 3, 0], [1, 1, 0]] },
    ],
    hint: "Use the inverse rotation to map each output pixel back to a source pixel.",
  },
];
