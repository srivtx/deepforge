import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "cv-171",
    title: "ViT Patchify",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Split an image into non-overlapping patch x patch patches for a Vision Transformer.\n\nIterate patches in row-major order and return each patch as a flat list of patch * patch pixel values (row-major inside the patch). You may assume both image dimensions are divisible by patch.",
    starterCode: `def patchify(image, patch):
    # Your code here
    pass`,
    solution: `def patchify(image, patch):
    h = len(image)
    w = len(image[0])
    out = []
    for i in range(0, h, patch):
        for j in range(0, w, patch):
            vec = []
            for a in range(patch):
                for b in range(patch):
                    vec.append(image[i + a][j + b])
            out.append(vec)
    return out`,
    testCases: [
      { input: [[[1, 2], [3, 4]], 2], expected: [[1, 2, 3, 4]] },
      { input: [[[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]], 2], expected: [[0, 1, 4, 5], [2, 3, 6, 7], [8, 9, 12, 13], [10, 11, 14, 15]] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], 3], expected: [[1, 2, 3, 4, 5, 6, 7, 8, 9]] },
      { input: [[[1, 2], [3, 4]], 1], expected: [[1], [2], [3], [4]] },
    ],
    hint: "Walk patch starts with range(0, h, patch) and range(0, w, patch).",
  },
  {
    id: "cv-172",
    title: "Patch Flatten",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Flatten a 2D patch into a 1D vector.\n\nValues are emitted in row-major order. An empty patch returns [].",
    starterCode: `def patch_flatten(patch):
    # Your code here
    pass`,
    solution: `def patch_flatten(patch):
    return [v for row in patch for v in row]`,
    testCases: [
      { input: [[[1, 2], [3, 4]]], expected: [1, 2, 3, 4] },
      { input: [[[5]]], expected: [5] },
      { input: [[[1, 2, 3]]], expected: [1, 2, 3] },
    ],
  },
  {
    id: "cv-173",
    title: "Patch Position Ids",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Build a 2D grid of patch position ids.\n\nReturn a num_patches_h x num_patches_w grid where cell (i, j) holds i * num_patches_w + j.",
    starterCode: `def position_ids(num_patches_h, num_patches_w):
    # Your code here
    pass`,
    solution: `def position_ids(num_patches_h, num_patches_w):
    return [[i * num_patches_w + j for j in range(num_patches_w)] for i in range(num_patches_h)]`,
    testCases: [
      { input: [2, 2], expected: [[0, 1], [2, 3]] },
      { input: [1, 3], expected: [[0, 1, 2]] },
      { input: [2, 1], expected: [[0], [1]] },
      { input: [1, 1], expected: [[0]] },
    ],
  },
  {
    id: "cv-174",
    title: "ViT CLS Concat",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Prepend a CLS token to a sequence of patch embeddings.\n\nReturn [cls_token] + patches, converting every entry to a list. An empty patch list returns just the CLS token.",
    starterCode: `def prepend_cls(patches, cls_token):
    # Your code here
    pass`,
    solution: `def prepend_cls(patches, cls_token):
    return [list(cls_token)] + [list(p) for p in patches]`,
    testCases: [
      { input: [[[1, 2], [3, 4]], [9, 9]], expected: [[9, 9], [1, 2], [3, 4]] },
      { input: [[[5]], [0]], expected: [[0], [5]] },
      { input: [[], [7, 7]], expected: [[7, 7]] },
    ],
  },
  {
    id: "cv-175",
    title: "Image Token Count",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Count the tokens a Vision Transformer produces for an image.\n\nNumber of patches = (h // patch) * (w // patch); add 1 for the CLS token when include_cls is True. Return the integer count.",
    starterCode: `def token_count(h, w, patch, include_cls):
    # Your code here
    pass`,
    solution: `def token_count(h, w, patch, include_cls):
    n = (h // patch) * (w // patch)
    return n + 1 if include_cls else n`,
    testCases: [
      { input: [224, 224, 16, true], expected: 197 },
      { input: [224, 224, 16, false], expected: 196 },
      { input: [32, 32, 8, true], expected: 17 },
      { input: [64, 96, 16, false], expected: 24 },
    ],
  },
  {
    id: "cv-176",
    title: "Hierarchical Feature Sizes",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Compute feature map sizes through a backbone with the given strides.\n\nStarting from (h, w), divide both dimensions by each stride using ceiling division ((n + s - 1) // s) in order, and return the list of [h, w] sizes per stage.",
    starterCode: `def feature_sizes(h, w, strides):
    # Your code here
    pass`,
    solution: `def feature_sizes(h, w, strides):
    out = []
    for s in strides:
        h = (h + s - 1) // s
        w = (w + s - 1) // s
        out.append([h, w])
    return out`,
    testCases: [
      { input: [224, 224, [4, 2, 2]], expected: [[56, 56], [28, 28], [14, 14]] },
      { input: [32, 32, [2, 2, 2, 2]], expected: [[16, 16], [8, 8], [4, 4], [2, 2]] },
      { input: [224, 224, [1]], expected: [[224, 224]] },
    ],
    hint: "Ceiling division keeps odd sizes from collapsing too fast.",
  },
  {
    id: "cv-177",
    title: "FPN Lateral 1x1",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Apply a 1x1 lateral convolution implemented as per-channel scaling.\n\nMultiply channel c of every pixel by scales[c] and round to 4 decimal places.",
    starterCode: `def lateral_scale(feature, scales):
    # Your code here
    pass`,
    solution: `def lateral_scale(feature, scales):
    out = []
    for row in feature:
        r = []
        for p in row:
            r.append([round(p[c] * scales[c], 4) for c in range(len(p))])
        out.append(r)
    return out`,
    testCases: [
      { input: [[[[1, 2], [3, 4]]], [2, 3]], expected: [[[2, 6], [6, 12]]] },
      { input: [[[[10, 0, 5]]], [0.5, 2, 1]], expected: [[[5.0, 0, 5]]] },
      { input: [[[[1, 2], [3, 4]]], [1, 0]], expected: [[[1, 0], [3, 0]]] },
    ],
  },
  {
    id: "cv-178",
    title: "FPN Top-Down Add",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Add a top-down feature map to a lateral feature map elementwise.\n\nBoth inputs are H x W x C grids of the same shape; return the per-pixel, per-channel sum rounded to 4 decimal places.",
    starterCode: `def top_down_add(up, lateral):
    # Your code here
    pass`,
    solution: `def top_down_add(up, lateral):
    out = []
    for i in range(len(up)):
        row = []
        for j in range(len(up[0])):
            row.append([round(up[i][j][c] + lateral[i][j][c], 4) for c in range(len(up[i][j]))])
        out.append(row)
    return out`,
    testCases: [
      { input: [[[[1, 2]]], [[[3, 4]]]], expected: [[[4, 6]]] },
      { input: [[[[1, 1], [2, 2]]], [[[3, 3], [4, 4]]]], expected: [[[4, 4], [6, 6]]] },
      { input: [[[[5]]], [[[7]]]], expected: [[[12]]] },
    ],
  },
  {
    id: "cv-179",
    title: "Anchor Scales Per Level",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Generate anchor width/height pairs for a feature level.\n\nFor each scale s and ratio r return [base_size * s / sqrt(r), base_size * s * sqrt(r)], iterating scales in the outer loop and ratios in the inner loop. Round each value to 4 decimal places.",
    starterCode: `def anchor_scales(base_size, scales, ratios):
    # Your code here
    pass`,
    solution: `def anchor_scales(base_size, scales, ratios):
    out = []
    for s in scales:
        for r in ratios:
            out.append([round(base_size * s / (r ** 0.5), 4), round(base_size * s * (r ** 0.5), 4)])
    return out`,
    testCases: [
      { input: [16, [1, 2], [0.5, 1, 2]], expected: [[22.6274, 11.3137], [16.0, 16.0], [11.3137, 22.6274], [45.2548, 22.6274], [32.0, 32.0], [22.6274, 45.2548]] },
      { input: [8, [1], [1]], expected: [[8.0, 8.0]] },
      { input: [32, [2], [1]], expected: [[64.0, 64.0]] },
    ],
  },
  {
    id: "cv-180",
    title: "Pixel Confusion Matrix",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Build a pixel confusion matrix between a prediction map and a target map.\n\nReturn a num_classes x num_classes matrix where entry [t][p] counts pixels whose target class is t and predicted class is p.",
    starterCode: `def confusion_matrix(pred, target, num_classes):
    # Your code here
    pass`,
    solution: `def confusion_matrix(pred, target, num_classes):
    m = [[0] * num_classes for _ in range(num_classes)]
    for i in range(len(pred)):
        for j in range(len(pred[0])):
            m[target[i][j]][pred[i][j]] += 1
    return m`,
    testCases: [
      { input: [[[0, 1], [0, 1]], [[0, 0], [1, 1]], 2], expected: [[1, 1], [1, 1]] },
      { input: [[[0, 1], [1, 0]], [[0, 1], [1, 0]], 2], expected: [[2, 0], [0, 2]] },
      { input: [[[0, 0, 0]], [[0, 0, 0]], 2], expected: [[3, 0], [0, 0]] },
    ],
    hint: "Rows are target classes and columns are predicted classes.",
  },
  {
    id: "cv-181",
    title: "Keypoint Heatmap Argmax",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Find the location of the maximum in a keypoint heatmap.\n\nReturn [row, col] of the largest value, keeping the first position in row-major order on ties.",
    starterCode: `def heatmap_argmax(heatmap):
    # Your code here
    pass`,
    solution: `def heatmap_argmax(heatmap):
    best_i = 0
    best_j = 0
    for i in range(len(heatmap)):
        for j in range(len(heatmap[0])):
            if heatmap[i][j] > heatmap[best_i][best_j]:
                best_i = i
                best_j = j
    return [best_i, best_j]`,
    testCases: [
      { input: [[[1, 5], [3, 2]]], expected: [0, 1] },
      { input: [[[7]]], expected: [0, 0] },
      { input: [[[1, 9, 9], [3, 9, 2]]], expected: [0, 1] },
    ],
  },
  {
    id: "cv-182",
    title: "Keypoint Confidence Threshold",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Filter keypoints by confidence.\n\nEach keypoint is [x, y, score]; keep the keypoints whose score is greater than or equal to threshold, preserving order. An empty list returns [].",
    starterCode: `def filter_keypoints(keypoints, threshold):
    # Your code here
    pass`,
    solution: `def filter_keypoints(keypoints, threshold):
    return [k for k in keypoints if k[2] >= threshold]`,
    testCases: [
      { input: [[[1, 2, 0.9], [3, 4, 0.2], [5, 6, 0.5]], 0.5], expected: [[1, 2, 0.9], [5, 6, 0.5]] },
      { input: [[[1, 1, 0.1]], 0.5], expected: [] },
      { input: [[[2, 3, 1.0]], 1.0], expected: [[2, 3, 1.0]] },
    ],
  },
  {
    id: "cv-183",
    title: "Person Box Aspect Filter",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Keep boxes whose width/height aspect ratio lies within a range.\n\nBoxes are [x1, y1, x2, y2] with continuous coordinates; keep a box when min_ratio <= (x2 - x1) / (y2 - y1) <= max_ratio, preserving order.",
    starterCode: `def filter_aspect_ratio(boxes, min_ratio, max_ratio):
    # Your code here
    pass`,
    solution: `def filter_aspect_ratio(boxes, min_ratio, max_ratio):
    out = []
    for x1, y1, x2, y2 in boxes:
        r = (x2 - x1) / (y2 - y1)
        if min_ratio <= r <= max_ratio:
            out.append([x1, y1, x2, y2])
    return out`,
    testCases: [
      { input: [[[0, 0, 4, 2], [0, 0, 1, 2], [0, 0, 6, 2]], 1.0, 3.0], expected: [[0, 0, 4, 2], [0, 0, 6, 2]] },
      { input: [[[0, 0, 4, 2], [0, 0, 1, 2], [0, 0, 6, 2]], 0.4, 0.6], expected: [[0, 0, 1, 2]] },
      { input: [[[0, 0, 2, 2]], 2.0, 1.0], expected: [] },
    ],
  },
  {
    id: "cv-184",
    title: "Homography Apply Point",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Apply a 3x3 homography to a 2D point.\n\nReturn [(H00*x + H01*y + H02) / d, (H10*x + H11*y + H12) / d] where d = H20*x + H21*y + H22, rounded to 4 decimal places.",
    starterCode: `def apply_homography(H, point):
    # Your code here
    pass`,
    solution: `def apply_homography(H, point):
    x, y = point
    d = H[2][0] * x + H[2][1] * y + H[2][2]
    u = (H[0][0] * x + H[0][1] * y + H[0][2]) / d
    v = (H[1][0] * x + H[1][1] * y + H[1][2]) / d
    return [round(u, 4), round(v, 4)]`,
    testCases: [
      { input: [[[1, 0, 0], [0, 1, 0], [0, 0, 1]], [3, 4]], expected: [3.0, 4.0] },
      { input: [[[1, 0, 2], [0, 1, 3], [0, 0, 1]], [1, 1]], expected: [3.0, 4.0] },
      { input: [[[2, 0, 0], [0, 3, 0], [0, 0, 1]], [2, 2]], expected: [4.0, 6.0] },
      { input: [[[1, 0, 0], [0, 1, 0], [0.5, 0, 1]], [2, 1]], expected: [1.0, 0.5] },
    ],
  },
  {
    id: "cv-185",
    title: "Depth from Disparity",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Compute depth from stereo disparity with depth = fx * baseline / disparity.\n\nRound the result to 4 decimal places and return 0.0 when disparity is 0.",
    starterCode: `def depth_from_disparity(disparity, fx, baseline):
    # Your code here
    pass`,
    solution: `def depth_from_disparity(disparity, fx, baseline):
    if disparity == 0:
        return 0.0
    return round(fx * baseline / disparity, 4)`,
    testCases: [
      { input: [2, 100, 0.5], expected: 25.0 },
      { input: [0, 100, 0.5], expected: 0.0 },
      { input: [5, 50, 2], expected: 20.0 },
    ],
  },
  {
    id: "cv-186",
    title: "Camera Intrinsics Apply",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Project a 3D camera-space point to pixel coordinates.\n\nGiven point [X, Y, Z] and the 3x3 intrinsic matrix K, return [u, v] = K * [X / Z, Y / Z, 1] rounded to 4 decimal places.",
    starterCode: `def project_point(point, K):
    # Your code here
    pass`,
    solution: `def project_point(point, K):
    X, Y, Z = point
    d = K[2][0] * X + K[2][1] * Y + K[2][2] * Z
    u = (K[0][0] * X + K[0][1] * Y + K[0][2] * Z) / d
    v = (K[1][0] * X + K[1][1] * Y + K[1][2] * Z) / d
    return [round(u, 4), round(v, 4)]`,
    testCases: [
      { input: [[1, 2, 4], [[1, 0, 0], [0, 1, 0], [0, 0, 1]]], expected: [0.25, 0.5] },
      { input: [[1, 2, 4], [[100, 0, 50], [0, 100, 40], [0, 0, 1]]], expected: [75.0, 90.0] },
      { input: [[0, 0, 2], [[100, 0, 50], [0, 100, 40], [0, 0, 1]]], expected: [50.0, 40.0] },
    ],
  },
  {
    id: "cv-187",
    title: "Attention Memory Estimate",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Estimate the activation memory of a self-attention layer.\n\nThe QKV projections hold 3 * batch * tokens * dim values and the attention matrix holds batch * tokens * tokens values. Return the total number of values multiplied by bytes_per_value.",
    starterCode: `def attention_memory(batch, tokens, dim, bytes_per_value):
    # Your code here
    pass`,
    solution: `def attention_memory(batch, tokens, dim, bytes_per_value):
    elements = 3 * batch * tokens * dim + batch * tokens * tokens
    return elements * bytes_per_value`,
    testCases: [
      { input: [2, 16, 64, 4], expected: 26624 },
      { input: [1, 4, 8, 4], expected: 448 },
      { input: [1, 1, 1, 2], expected: 8 },
    ],
    hint: "QKV plus the tokens x tokens attention matrix, all in values.",
  },
  {
    id: "cv-188",
    title: "Conv Patch Embedding",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Apply a patch embedding as an unfold plus dot product.\n\nFor every non-overlapping patch (row-major) compute the sum of pixel * weight over the flattened patch, where weight has patch * patch entries. Return the list of outputs rounded to 4 decimal places.",
    starterCode: `def conv_patch_embed(image, patch, weight):
    # Your code here
    pass`,
    solution: `def conv_patch_embed(image, patch, weight):
    h = len(image)
    w = len(image[0])
    out = []
    for i in range(0, h, patch):
        for j in range(0, w, patch):
            s = 0
            k = 0
            for a in range(patch):
                for b in range(patch):
                    s += image[i + a][j + b] * weight[k]
                    k += 1
            out.append(round(s, 4))
    return out`,
    testCases: [
      { input: [[[1, 2], [3, 4]], 2, [1, 1, 1, 1]], expected: [10] },
      { input: [[[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]], 2, [1, 0, 0, 0]], expected: [0, 2, 8, 10] },
      { input: [[[1, 2], [3, 4]], 2, [1, 2, 3, 4]], expected: [30] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], 3, [1, 1, 1, 1, 1, 1, 1, 1, 1]], expected: [45] },
    ],
  },
  {
    id: "cv-189",
    title: "Window Partition (Padded)",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Partition an image into non-overlapping windows, padding the bottom and right with zeros to a multiple of the window size.\n\nReturn the windows in row-major order as 2D lists.",
    starterCode: `def window_partition_padded(image, window):
    # Your code here
    pass`,
    solution: `def window_partition_padded(image, window):
    h = len(image)
    w = len(image[0])
    ph = (h + window - 1) // window * window
    pw = (w + window - 1) // window * window
    padded = [[image[i][j] if i < h and j < w else 0 for j in range(pw)] for i in range(ph)]
    out = []
    for i in range(0, ph, window):
        for j in range(0, pw, window):
            out.append([row[j:j + window] for row in padded[i:i + window]])
    return out`,
    testCases: [
      { input: [[[1, 2], [3, 4]], 2], expected: [[[1, 2], [3, 4]]] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], 2], expected: [[[1, 2], [4, 5]], [[3, 0], [6, 0]], [[7, 8], [0, 0]], [[9, 0], [0, 0]]] },
      { input: [[[1, 2, 3, 4], [5, 6, 7, 8]], 2], expected: [[[1, 2], [5, 6]], [[3, 4], [7, 8]]] },
      { input: [[[1]], 1], expected: [[[1]]] },
    ],
  },
  {
    id: "cv-190",
    title: "Window Reverse",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Reassemble padded windows into the full padded image.\n\nGiven the windows in row-major order, the window size and the padded height h and width w (multiples of window), stitch each window back into place.",
    starterCode: `def window_reverse(windows, window, h, w):
    # Your code here
    pass`,
    solution: `def window_reverse(windows, window, h, w):
    img = [[0] * w for _ in range(h)]
    idx = 0
    for i in range(0, h, window):
        for j in range(0, w, window):
            win = windows[idx]
            idx += 1
            for a in range(window):
                for b in range(window):
                    img[i + a][j + b] = win[a][b]
    return img`,
    testCases: [
      { input: [[[[1, 2], [4, 5]], [[3, 0], [6, 0]], [[7, 8], [0, 0]], [[9, 0], [0, 0]]], 2, 4, 4], expected: [[1, 2, 3, 0], [4, 5, 6, 0], [7, 8, 9, 0], [0, 0, 0, 0]] },
      { input: [[[[1, 2], [3, 4]]], 2, 2, 2], expected: [[1, 2], [3, 4]] },
      { input: [[[[1, 2], [5, 6]], [[3, 4], [7, 8]]], 2, 2, 4], expected: [[1, 2, 3, 4], [5, 6, 7, 8]] },
    ],
  },
  {
    id: "cv-191",
    title: "Shifted Window Offset",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Apply a cyclic shift to an image (used by shifted-window attention).\n\nMove content down by dy and right by dx with wraparound, so out[i][j] = image[(i - dy) mod h][(j - dx) mod w].",
    starterCode: `def cyclic_shift(image, dy, dx):
    # Your code here
    pass`,
    solution: `def cyclic_shift(image, dy, dx):
    h = len(image)
    w = len(image[0])
    out = []
    for i in range(h):
        row = []
        for j in range(w):
            row.append(image[(i - dy) % h][(j - dx) % w])
        out.append(row)
    return out`,
    testCases: [
      { input: [[[1, 2], [3, 4]], 1, 0], expected: [[3, 4], [1, 2]] },
      { input: [[[1, 2], [3, 4]], 0, 1], expected: [[2, 1], [4, 3]] },
      { input: [[[1, 2, 3]], 0, 1], expected: [[3, 1, 2]] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], 2, 2], expected: [[5, 6, 4], [8, 9, 7], [2, 3, 1]] },
    ],
  },
  {
    id: "cv-192",
    title: "Patch Merging Downsample",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Downsample an image by merging each 2x2 block into one 4-value cell (Swin patch merging without the linear layer).\n\nFor every non-overlapping block return [top-left, top-right, bottom-left, bottom-right]. Both dimensions are even.",
    starterCode: `def patch_merge(image):
    # Your code here
    pass`,
    solution: `def patch_merge(image):
    h = len(image)
    w = len(image[0])
    out = []
    for i in range(0, h, 2):
        row = []
        for j in range(0, w, 2):
            row.append([image[i][j], image[i][j + 1], image[i + 1][j], image[i + 1][j + 1]])
        out.append(row)
    return out`,
    testCases: [
      { input: [[[1, 2], [3, 4]]], expected: [[[1, 2, 3, 4]]] },
      { input: [[[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]]], expected: [[[0, 1, 4, 5], [2, 3, 6, 7]], [[8, 9, 12, 13], [10, 11, 14, 15]]] },
      { input: [[[1, 2, 3, 4], [5, 6, 7, 8]]], expected: [[[1, 2, 5, 6], [3, 4, 7, 8]]] },
    ],
  },
  {
    id: "cv-193",
    title: "Pyramid Shapes",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the per-level shapes of a feature pyramid.\n\nLevel i has base_channels * growth^i channels and spatial size (ceil(h / 2^i), ceil(w / 2^i)). Return a list of [channels, h, w] for i from 0 to num_levels - 1.",
    starterCode: `def pyramid_shapes(h, w, num_levels, base_channels, growth):
    # Your code here
    pass`,
    solution: `def pyramid_shapes(h, w, num_levels, base_channels, growth):
    out = []
    for i in range(num_levels):
        out.append([base_channels * growth ** i, (h + (1 << i) - 1) // (1 << i), (w + (1 << i) - 1) // (1 << i)])
    return out`,
    testCases: [
      { input: [64, 64, 3, 64, 2], expected: [[64, 64, 64], [128, 32, 32], [256, 16, 16]] },
      { input: [224, 224, 2, 32, 2], expected: [[32, 224, 224], [64, 112, 112]] },
      { input: [7, 5, 2, 8, 2], expected: [[8, 7, 5], [16, 4, 3]] },
    ],
  },
  {
    id: "cv-194",
    title: "SSD Prior Boxes Count",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Count the number of SSD prior boxes.\n\nfeature_sizes is a list of [h, w] maps and each cell has num_priors anchors. Return the total sum of h * w * num_priors.",
    starterCode: `def ssd_prior_count(feature_sizes, num_priors):
    # Your code here
    pass`,
    solution: `def ssd_prior_count(feature_sizes, num_priors):
    total = 0
    for h, w in feature_sizes:
        total += h * w * num_priors
    return total`,
    testCases: [
      { input: [[[38, 38], [19, 19], [10, 10], [5, 5], [3, 3], [1, 1]], 6], expected: 11640 },
      { input: [[[4, 4]], 2], expected: 32 },
      { input: [[[2, 3], [1, 1]], 4], expected: 28 },
    ],
  },
  {
    id: "cv-195",
    title: "Hard Negative Mining",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Select the hardest negative examples for training.\n\nGiven negative losses, choose min(len(losses), pos_count * neg_ratio) negatives with the largest losses. Return their indices in descending loss order, breaking ties by smaller index.",
    starterCode: `def hard_negative_indices(neg_losses, pos_count, neg_ratio):
    # Your code here
    pass`,
    solution: `def hard_negative_indices(neg_losses, pos_count, neg_ratio):
    n = min(len(neg_losses), pos_count * neg_ratio)
    order = sorted(range(len(neg_losses)), key=lambda i: (-neg_losses[i], i))
    return order[:n]`,
    testCases: [
      { input: [[0.1, 0.9, 0.5, 0.8], 1, 2], expected: [1, 3] },
      { input: [[0.1, 0.9, 0.5, 0.8], 1, 1], expected: [1] },
      { input: [[0.1, 0.9, 0.5, 0.8], 0, 3], expected: [] },
      { input: [[0.1, 0.9, 0.5, 0.8], 2, 5], expected: [1, 3, 2, 0] },
    ],
  },
  {
    id: "cv-196",
    title: "Normalized Focal Loss",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute focal loss over a probability map normalized by the number of positives.\n\nSum -((1 - p_t)^gamma) * log(p_t) over all pixels, where p_t is prob for target 1 and 1 - prob otherwise, clamping p_t to at least 1e-12. Divide by max(1, num_positives) and round to 4 decimal places.",
    starterCode: `def normalized_focal_loss(prob, target, gamma, num_positives):
    # Your code here
    pass`,
    solution: `def normalized_focal_loss(prob, target, gamma, num_positives):
    import math
    total = 0.0
    for i in range(len(prob)):
        for j in range(len(prob[0])):
            p_t = prob[i][j] if target[i][j] == 1 else 1 - prob[i][j]
            p_t = max(p_t, 1e-12)
            total += -((1 - p_t) ** gamma) * math.log(p_t)
    return round(total / max(1, num_positives), 4)`,
    testCases: [
      { input: [[[0.9, 0.1]], [[1, 0]], 2, 1], expected: 0.0021 },
      { input: [[[0.5]], [[1]], 0, 2], expected: 0.3466 },
      { input: [[[0.5]], [[1]], 0, 0], expected: 0.6931 },
    ],
  },
  {
    id: "cv-197",
    title: "RPN Objectness",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Convert RPN objectness logits to probabilities with the sigmoid function.\n\nReturn each value 1 / (1 + exp(-x)) rounded to 4 decimal places.",
    starterCode: `def rpn_objectness(logits):
    # Your code here
    pass`,
    solution: `def rpn_objectness(logits):
    return [round(1.0 / (1.0 + pow(2.718281828459045, -v)), 4) for v in logits]`,
    testCases: [
      { input: [[0, 1, -1]], expected: [0.5, 0.7311, 0.2689] },
      { input: [[2, -2]], expected: [0.8808, 0.1192] },
      { input: [[0.5]], expected: [0.6225] },
    ],
  },
  {
    id: "cv-198",
    title: "RPN NMS Top-K",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Run greedy non-maximum suppression on region proposals and keep at most k.\n\nProcess boxes in descending score order (ties by index), suppress a box when its IoU with a kept box is strictly greater than iou_threshold, and stop once k boxes are kept. Return the kept indices.",
    starterCode: `def rpn_topk(boxes, scores, k, iou_threshold):
    # Your code here
    pass`,
    solution: `def rpn_topk(boxes, scores, k, iou_threshold):
    order = sorted(range(len(boxes)), key=lambda i: (-scores[i], i))
    keep = []
    for i in order:
        ok = True
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
            v = inter / union if union > 0 else 0.0
            if v > iou_threshold:
                ok = False
                break
        if ok:
            keep.append(i)
        if len(keep) == k:
            break
    return keep`,
    testCases: [
      { input: [[[0, 0, 2, 2], [1, 1, 3, 3], [10, 10, 12, 12]], [0.9, 0.8, 0.7], 2, 0.1], expected: [0, 2] },
      { input: [[[0, 0, 2, 2], [1, 1, 3, 3], [10, 10, 12, 12]], [0.9, 0.8, 0.7], 1, 0.1], expected: [0] },
      { input: [[[0, 0, 2, 2], [1, 1, 3, 3], [10, 10, 12, 12]], [0.9, 0.8, 0.7], 3, 0.5], expected: [0, 1, 2] },
      { input: [[], [], 3, 0.5], expected: [] },
    ],
  },
  {
    id: "cv-199",
    title: "ROI Pool Bins",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the integer bin boundaries of ROI pooling.\n\nFor an ROI [x1, y1, x2, y2] split into pooled_h x pooled_w bins, each bin's row range is [floor(ph * roi_h / pooled_h), ceil((ph + 1) * roi_h / pooled_h)] and similarly for columns. Return one [hstart, hend, wstart, wend] per bin in row-major order, relative to the ROI.",
    starterCode: `def roi_pool_bins(roi, pooled_h, pooled_w):
    # Your code here
    pass`,
    solution: `def roi_pool_bins(roi, pooled_h, pooled_w):
    import math
    x1, y1, x2, y2 = roi
    roi_h = y2 - y1
    roi_w = x2 - x1
    out = []
    for ph in range(pooled_h):
        hstart = math.floor(ph * roi_h / pooled_h)
        hend = math.ceil((ph + 1) * roi_h / pooled_h)
        for pw in range(pooled_w):
            wstart = math.floor(pw * roi_w / pooled_w)
            wend = math.ceil((pw + 1) * roi_w / pooled_w)
            out.append([hstart, hend, wstart, wend])
    return out`,
    testCases: [
      { input: [[0, 0, 4, 4], 2, 2], expected: [[0, 2, 0, 2], [0, 2, 2, 4], [2, 4, 0, 2], [2, 4, 2, 4]] },
      { input: [[0, 0, 5, 3], 2, 2], expected: [[0, 2, 0, 3], [0, 2, 2, 5], [1, 3, 0, 3], [1, 3, 2, 5]] },
      { input: [[1, 2, 4, 6], 2, 1], expected: [[0, 2, 0, 3], [2, 4, 0, 3]] },
    ],
  },
  {
    id: "cv-200",
    title: "Box Encode with Variance",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Encode a ground-truth box relative to an anchor with variance scaling.\n\nBoxes are [cx, cy, w, h]. Return [(gcx - acx) / (aw * v0), (gcy - acy) / (ah * v1), log(gw / aw) / v2, log(gh / ah) / v3] rounded to 4 decimal places.",
    starterCode: `def encode_var(anchor, gt, variances):
    # Your code here
    pass`,
    solution: `def encode_var(anchor, gt, variances):
    import math
    acx, acy, aw, ah = anchor
    gcx, gcy, gw, gh = gt
    return [round((gcx - acx) / (aw * variances[0]), 4), round((gcy - acy) / (ah * variances[1]), 4),
            round(math.log(gw / aw) / variances[2], 4), round(math.log(gh / ah) / variances[3], 4)]`,
    testCases: [
      { input: [[0, 0, 10, 10], [5, 5, 20, 20], [0.1, 0.1, 0.2, 0.2]], expected: [5.0, 5.0, 3.4657, 3.4657] },
      { input: [[5, 5, 10, 10], [5, 5, 10, 10], [0.1, 0.1, 0.2, 0.2]], expected: [0.0, 0.0, 0.0, 0.0] },
      { input: [[0, 0, 10, 10], [5, 5, 20, 20], [1, 1, 1, 1]], expected: [0.5, 0.5, 0.6931, 0.6931] },
    ],
  },
  {
    id: "cv-201",
    title: "Box Decode with Variance",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Decode variance-scaled offsets back into a box.\n\nFor anchor [acx, acy, aw, ah] and offsets [dx, dy, dw, dh] return [acx + dx * v0 * aw, acy + dy * v1 * ah, aw * exp(dw * v2), ah * exp(dh * v3)] rounded to 4 decimal places.",
    starterCode: `def decode_var(anchor, offsets, variances):
    # Your code here
    pass`,
    solution: `def decode_var(anchor, offsets, variances):
    import math
    acx, acy, aw, ah = anchor
    dx, dy, dw, dh = offsets
    return [round(acx + dx * variances[0] * aw, 4), round(acy + dy * variances[1] * ah, 4),
            round(aw * math.exp(dw * variances[2]), 4), round(ah * math.exp(dh * variances[3]), 4)]`,
    testCases: [
      { input: [[0, 0, 10, 10], [5.0, 5.0, 3.4657, 3.4657], [0.1, 0.1, 0.2, 0.2]], expected: [5.0, 5.0, 19.9999, 19.9999] },
      { input: [[5, 5, 10, 10], [0, 0, 0, 0], [0.1, 0.1, 0.2, 0.2]], expected: [5.0, 5.0, 10.0, 10.0] },
      { input: [[0, 0, 10, 10], [0.5, 0.5, 0.6931, 0.6931], [1, 1, 1, 1]], expected: [5.0, 5.0, 19.9991, 19.9991] },
    ],
  },
  {
    id: "cv-202",
    title: "Tracking IoU Association",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Associate detections to existing tracks by IoU.\n\nProcess detections in order and, for each, pick the unused track with the highest IoU. Assign that track index when the best IoU is at least threshold, otherwise output -1. Return one value per detection.",
    starterCode: `def associate_tracks(tracks, detections, threshold):
    # Your code here
    pass`,
    solution: `def associate_tracks(tracks, detections, threshold):
    used = [False] * len(tracks)
    out = []
    for d in detections:
        best = -1
        best_iou = -1.0
        for t in range(len(tracks)):
            if used[t]:
                continue
            ax1, ay1, ax2, ay2 = d
            bx1, by1, bx2, by2 = tracks[t]
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
                best = t
        if best >= 0 and best_iou >= threshold:
            used[best] = True
            out.append(best)
        else:
            out.append(-1)
    return out`,
    testCases: [
      { input: [[[0, 0, 2, 2], [10, 10, 12, 12]], [[0, 0, 2, 2], [10, 10, 12, 12]], 0.5], expected: [0, 1] },
      { input: [[[0, 0, 2, 2], [10, 10, 12, 12]], [[1, 1, 3, 3], [10, 10, 12, 12]], 0.1], expected: [0, 1] },
      { input: [[[0, 0, 2, 2], [10, 10, 12, 12]], [[1, 1, 3, 3], [10, 10, 12, 12]], 0.5], expected: [-1, 1] },
      { input: [[[0, 0, 2, 2]], [], 0.5], expected: [] },
    ],
  },
  {
    id: "cv-203",
    title: "Kalman Predict 2D",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Run the 2D predict step of a Kalman tracker.\n\nState and velocity are [x, y] and [vx, vy]; covariance is [px, py]. Return [x + vx, y + vy, px + q, py + q] rounded to 4 decimal places.",
    starterCode: `def kalman_predict_2d(state, velocity, cov, q):
    # Your code here
    pass`,
    solution: `def kalman_predict_2d(state, velocity, cov, q):
    return [round(state[0] + velocity[0], 4), round(state[1] + velocity[1], 4),
            round(cov[0] + q, 4), round(cov[1] + q, 4)]`,
    testCases: [
      { input: [[0, 0], [1, 2], [1, 1], 0.5], expected: [1, 2, 1.5, 1.5] },
      { input: [[5, -1], [0, 0], [2, 3], 1], expected: [5, -1, 3, 4] },
      { input: [[1.5, 2.5], [0.5, -0.5], [0.25, 0.75], 0.25], expected: [2.0, 2.0, 0.5, 1.0] },
    ],
  },
  {
    id: "cv-204",
    title: "DeepSORT Cosine Gate",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Gate appearance features by cosine similarity (DeepSORT style).\n\nReturn the gallery indices whose cosine similarity with feature is at least threshold, ordered by descending similarity, breaking ties by smaller index. Zero vectors have similarity 0.0.",
    starterCode: `def cosine_gate(feature, gallery, threshold):
    # Your code here
    pass`,
    solution: `def cosine_gate(feature, gallery, threshold):
    na = sum(v * v for v in feature) ** 0.5
    scored = []
    for i, g in enumerate(gallery):
        nb = sum(v * v for v in g) ** 0.5
        if na == 0 or nb == 0:
            sim = 0.0
        else:
            sim = sum(a * b for a, b in zip(feature, g)) / (na * nb)
        if sim >= threshold:
            scored.append((-sim, i))
    scored.sort()
    return [i for _, i in scored]`,
    testCases: [
      { input: [[1, 0], [[1, 0], [0, 1], [-1, 0]], 0.5], expected: [0] },
      { input: [[1, 0], [[1, 0], [0, 1], [-1, 0]], -0.5], expected: [0, 1] },
      { input: [[1, 0], [[0.6, 0.8]], 0.5], expected: [0] },
      { input: [[1, 0], [[0, 1]], 0.5], expected: [] },
    ],
  },
  {
    id: "cv-205",
    title: "Optical Flow Magnitude",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the magnitude of a dense optical flow field.\n\nReturn sqrt(flow_x^2 + flow_y^2) per pixel rounded to 4 decimal places.",
    starterCode: `def flow_magnitude(flow_x, flow_y):
    # Your code here
    pass`,
    solution: `def flow_magnitude(flow_x, flow_y):
    out = []
    for i in range(len(flow_x)):
        row = []
        for j in range(len(flow_x[0])):
            row.append(round((flow_x[i][j] ** 2 + flow_y[i][j] ** 2) ** 0.5, 4))
        out.append(row)
    return out`,
    testCases: [
      { input: [[[3, 0]], [[4, 0]]], expected: [[5.0, 0.0]] },
      { input: [[[1, -1]], [[0, 1]]], expected: [[1.0, 1.4142]] },
      { input: [[[0, 0], [0, 0]], [[0, 0], [0, 0]]], expected: [[0.0, 0.0], [0.0, 0.0]] },
    ],
  },
  {
    id: "cv-206",
    title: "Stereo Disparity from SSD",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Estimate stereo disparity by minimizing the sum of squared differences.\n\nFor each shift d in [0, max_disp] compute the SSD between left[i] and right[i + d] over overlapping positions. Return [d, ssd] for the smallest SSD, breaking ties by smaller d, with the SSD rounded to 4 decimal places.",
    starterCode: `def disparity_ssd(left, right, max_disp):
    # Your code here
    pass`,
    solution: `def disparity_ssd(left, right, max_disp):
    best_d = 0
    best_ssd = None
    for d in range(max_disp + 1):
        s = 0
        for i in range(len(left) - d):
            diff = left[i] - right[i + d]
            s += diff * diff
        if best_ssd is None or s < best_ssd:
            best_ssd = s
            best_d = d
    return [best_d, round(float(best_ssd), 4)]`,
    testCases: [
      { input: [[1, 2, 3, 4], [0, 1, 2, 3], 3], expected: [1, 0.0] },
      { input: [[5, 5, 5], [5, 5, 5], 2], expected: [0, 0.0] },
      { input: [[0, 10], [10, 0], 1], expected: [1, 0.0] },
      { input: [[1, 2], [1, 2], 0], expected: [0, 0.0] },
    ],
  },
  {
    id: "cv-207",
    title: "ROI Align Single Sample",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Sample a fixed-size ROI Align grid from a feature map.\n\nFor each pooled cell use the bin center (y1 + (ph + 0.5) * roi_h / pooled, x1 + (pw + 0.5) * roi_w / pooled) and bilinearly interpolate with coordinates clamped to the feature bounds. Return the pooled x pooled grid rounded to 4 decimal places.",
    starterCode: `def roi_align(feature, roi, pooled_size):
    # Your code here
    pass`,
    solution: `def roi_align(feature, roi, pooled_size):
    h = len(feature)
    w = len(feature[0])
    x1, y1, x2, y2 = roi
    roi_h = y2 - y1
    roi_w = x2 - x1

    def interp(y, x):
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
        yb = min(y0 + 1, h - 1)
        xb = min(x0 + 1, w - 1)
        dy = y - y0
        dx = x - x0
        return (feature[y0][x0] * (1 - dy) * (1 - dx) + feature[y0][xb] * (1 - dy) * dx
                + feature[yb][x0] * dy * (1 - dx) + feature[yb][xb] * dy * dx)

    out = []
    for ph in range(pooled_size):
        row = []
        for pw in range(pooled_size):
            sy = y1 + (ph + 0.5) * roi_h / pooled_size
            sx = x1 + (pw + 0.5) * roi_w / pooled_size
            row.append(round(interp(sy, sx), 4))
        out.append(row)
    return out`,
    testCases: [
      { input: [[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]], [0, 0, 4, 4], 2], expected: [[6.0, 8.0], [14.0, 16.0]] },
      { input: [[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]], [0.5, 0.5, 3.5, 3.5], 2], expected: [[7.25, 8.75], [13.25, 14.75]] },
      { input: [[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]], [0, 0, 4, 4], 1], expected: [[11.0]] },
      { input: [[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]], [1, 1, 3, 3], 2], expected: [[8.5, 9.5], [12.5, 13.5]] },
    ],
  },
  {
    id: "cv-208",
    title: "SORT Track Assignment",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Assign detections to tracks with greedy IoU matching and birth new tracks (SORT lite).\n\nEach track is [id, box]. Score all detection-track pairs with IoU >= iou_threshold, sort by descending IoU (ties by detection then track index) and greedily assign unused pairs. Detections left unassigned get new ids starting from max existing id + 1 (or 0 with no tracks). Return the id assigned to each detection.",
    starterCode: `def sort_assign(tracks, detections, iou_threshold):
    # Your code here
    pass`,
    solution: `def sort_assign(tracks, detections, iou_threshold):
    if tracks:
        next_id = max(t[0] for t in tracks) + 1
    else:
        next_id = 0
    pairs = []
    for di, d in enumerate(detections):
        for ti, t in enumerate(tracks):
            ax1, ay1, ax2, ay2 = d
            bx1, by1, bx2, by2 = t[1]
            ix1 = max(ax1, bx1)
            iy1 = max(ay1, by1)
            ix2 = min(ax2, bx2)
            iy2 = min(ay2, by2)
            iw = ix2 - ix1
            ih = iy2 - iy1
            inter = 0.0 if iw <= 0 or ih <= 0 else iw * ih
            union = (ax2 - ax1) * (ay2 - ay1) + (bx2 - bx1) * (by2 - by1) - inter
            v = inter / union if union > 0 else 0.0
            if v >= iou_threshold:
                pairs.append((-v, di, ti))
    pairs.sort()
    det_assign = [-1] * len(detections)
    track_used = [False] * len(tracks)
    for _, di, ti in pairs:
        if det_assign[di] == -1 and not track_used[ti]:
            det_assign[di] = tracks[ti][0]
            track_used[ti] = True
    for di in range(len(detections)):
        if det_assign[di] == -1:
            det_assign[di] = next_id
            next_id += 1
    return det_assign`,
    testCases: [
      { input: [[[0, [0, 0, 2, 2]]], [[0, 0, 2, 2]], 0.5], expected: [0] },
      { input: [[[5, [0, 0, 2, 2]]], [[0.1, 0.1, 2.1, 2.1], [10, 10, 12, 12]], 0.1], expected: [5, 6] },
      { input: [[], [[0, 0, 1, 1], [2, 2, 3, 3]], 0.5], expected: [0, 1] },
      { input: [[[0, [0, 0, 1, 1]], [1, [5, 5, 6, 6]]], [[0, 0, 1, 1], [5, 5, 6, 6]], 0.5], expected: [0, 1] },
    ],
  },
  {
    id: "cv-209",
    title: "Flow Warp Image",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Warp an image by a dense flow field.\n\nFor output pixel (i, j) sample the source at (i + flow_y[i][j], j + flow_x[i][j]) with round-to-nearest; out-of-bounds samples become 0.",
    starterCode: `def warp_image(image, flow_x, flow_y):
    # Your code here
    pass`,
    solution: `def warp_image(image, flow_x, flow_y):
    h = len(image)
    w = len(image[0])
    out = []
    for i in range(h):
        row = []
        for j in range(w):
            si = int(round(i + flow_y[i][j]))
            sj = int(round(j + flow_x[i][j]))
            if 0 <= si < h and 0 <= sj < w:
                row.append(image[si][sj])
            else:
                row.append(0)
        out.append(row)
    return out`,
    testCases: [
      { input: [[[1, 2], [3, 4]], [[1, 1], [1, 1]], [[0, 0], [0, 0]]], expected: [[2, 0], [4, 0]] },
      { input: [[[1, 2], [3, 4]], [[0, 0], [0, 0]], [[0, 0], [0, 0]]], expected: [[1, 2], [3, 4]] },
      { input: [[[1, 2], [3, 4]], [[0, 0], [0, 0]], [[1, 0], [1, 0]]], expected: [[3, 2], [0, 4]] },
      { input: [[[1, 2], [3, 4]], [[-1, 0], [1, -1]], [[0, 0], [-1, 0]]], expected: [[0, 2], [2, 3]] },
    ],
  },
  {
    id: "cv-210",
    title: "Homography from 4 Correspondences",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Fit a 3x3 homography from four point correspondences with the DLT and h22 = 1.\n\nBuild the 8x8 linear system from pairs (x, y) -> (u, v), solve it with Gaussian elimination and return the homography with each entry rounded to 4 decimal places. Points are in general position.",
    starterCode: `def homography_from_points(src, dst):
    # Your code here
    pass`,
    solution: `def homography_from_points(src, dst):
    A = []
    b = []
    for (x, y), (u, v) in zip(src, dst):
        A.append([x, y, 1, 0, 0, 0, -u * x, -u * y])
        b.append(u)
        A.append([0, 0, 0, x, y, 1, -v * x, -v * y])
        b.append(v)
    n = 8
    for col in range(n):
        pivot = col
        for r in range(col + 1, n):
            if abs(A[r][col]) > abs(A[pivot][col]):
                pivot = r
        A[col], A[pivot] = A[pivot], A[col]
        b[col], b[pivot] = b[pivot], b[col]
        pv = A[col][col]
        for r in range(col + 1, n):
            f = A[r][col] / pv
            for c in range(col, n):
                A[r][c] -= f * A[col][c]
            b[r] -= f * b[col]
    h = [0.0] * n
    for r in range(n - 1, -1, -1):
        s = b[r] - sum(A[r][c] * h[c] for c in range(r + 1, n))
        h[r] = s / A[r][r]
    H = [[h[0], h[1], h[2]], [h[3], h[4], h[5]], [h[6], h[7], 1.0]]
    return [[round(v, 4) for v in row] for row in H]`,
    testCases: [
      { input: [[[0, 0], [1, 0], [1, 1], [0, 1]], [[0, 0], [1, 0], [1, 1], [0, 1]]], expected: [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]] },
      { input: [[[0, 0], [1, 0], [1, 1], [0, 1]], [[2, 3], [3, 3], [3, 4], [2, 4]]], expected: [[1.0, 0.0, 2.0], [0.0, 1.0, 3.0], [0.0, 0.0, 1.0]] },
      { input: [[[0, 0], [1, 0], [1, 1], [0, 1]], [[0, 0], [2, 0], [2, 2], [0, 2]]], expected: [[2.0, 0.0, 0.0], [0.0, 2.0, 0.0], [0.0, 0.0, 1.0]] },
      { input: [[[0, 0], [2, 0], [2, 2], [0, 2]], [[0, 0], [2, 0], [1.6667, 1.6667], [0, 2]]], expected: [[1.25, 0.0, 0.0], [0.0, 1.25, 0.0], [0.125, 0.125, 1.0]] },
    ],
    hint: "Each correspondence gives two rows: one for u and one for v.",
  },
  {
    id: "cv-211",
    title: "RANSAC Homography Iteration",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Run one seeded RANSAC iteration for homography estimation.\n\nSeed the random module and sample 4 distinct correspondence indices, fit a homography with the DLT, then count inliers whose reprojection error is at most threshold. Return [sorted_sample_indices, inlier_count]; if the sample is degenerate return a count of 0.",
    starterCode: `def ransac_iteration(src, dst, threshold, seed):
    # Your code here
    pass`,
    solution: `def ransac_iteration(src, dst, threshold, seed):
    import random

    def fit(src_pts, dst_pts):
        A = []
        b = []
        for (x, y), (u, v) in zip(src_pts, dst_pts):
            A.append([x, y, 1, 0, 0, 0, -u * x, -u * y])
            b.append(u)
            A.append([0, 0, 0, x, y, 1, -v * x, -v * y])
            b.append(v)
        n = 8
        for col in range(n):
            pivot = col
            for r in range(col + 1, n):
                if abs(A[r][col]) > abs(A[pivot][col]):
                    pivot = r
            A[col], A[pivot] = A[pivot], A[col]
            b[col], b[pivot] = b[pivot], b[col]
            pv = A[col][col]
            for r in range(col + 1, n):
                f = A[r][col] / pv
                for c in range(col, n):
                    A[r][c] -= f * A[col][c]
                b[r] -= f * b[col]
        h = [0.0] * n
        for r in range(n - 1, -1, -1):
            s = b[r] - sum(A[r][c] * h[c] for c in range(r + 1, n))
            h[r] = s / A[r][r]
        return [[h[0], h[1], h[2]], [h[3], h[4], h[5]], [h[6], h[7], 1.0]]

    random.seed(seed)
    sample = sorted(random.sample(range(len(src)), 4))
    try:
        H = fit([src[i] for i in sample], [dst[i] for i in sample])
    except ZeroDivisionError:
        return [sample, 0]
    count = 0
    for (x, y), (u, v) in zip(src, dst):
        d = H[2][0] * x + H[2][1] * y + H[2][2]
        if abs(d) < 1e-09:
            continue
        pu = (H[0][0] * x + H[0][1] * y + H[0][2]) / d
        pv = (H[1][0] * x + H[1][1] * y + H[1][2]) / d
        if ((pu - u) ** 2 + (pv - v) ** 2) ** 0.5 <= threshold:
            count += 1
    return [sample, count]`,
    testCases: [
      { input: [[[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]], [[1, 1], [2, 1], [3, 1], [9, 9], [8, 8], [3, 2]], 0.5, 1], expected: [[0, 1, 4, 5], 4] },
      { input: [[[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]], [[1, 1], [2, 1], [3, 1], [9, 9], [8, 8], [3, 2]], 0.5, 3], expected: [[1, 3, 4, 5], 1] },
      { input: [[[0, 0], [1, 0], [2, 0], [0, 1]], [[1, 1], [2, 1], [3, 1], [1, 2]], 0.5, 0], expected: [[0, 1, 2, 3], 0] },
    ],
  },
  {
    id: "cv-212",
    title: "3D IoU Axis-Aligned",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Compute the intersection over union of two axis-aligned 3D boxes.\n\nBoxes are [x1, y1, z1, x2, y2, z2] with continuous coordinates. Return intersection volume / union volume rounded to 4 decimal places, or 0.0 when the boxes do not overlap or a box is degenerate.",
    starterCode: `def iou_3d(box_a, box_b):
    # Your code here
    pass`,
    solution: `def iou_3d(box_a, box_b):
    ax1, ay1, az1, ax2, ay2, az2 = box_a
    bx1, by1, bz1, bx2, by2, bz2 = box_b
    ix1 = max(ax1, bx1)
    iy1 = max(ay1, by1)
    iz1 = max(az1, bz1)
    ix2 = min(ax2, bx2)
    iy2 = min(ay2, by2)
    iz2 = min(az2, bz2)
    iw = ix2 - ix1
    ih = iy2 - iy1
    idd = iz2 - iz1
    if iw <= 0 or ih <= 0 or idd <= 0:
        return 0.0
    inter = iw * ih * idd
    vol_a = (ax2 - ax1) * (ay2 - ay1) * (az2 - az1)
    vol_b = (bx2 - bx1) * (by2 - by1) * (bz2 - bz1)
    union = vol_a + vol_b - inter
    if union <= 0:
        return 0.0
    return round(inter / union, 4)`,
    testCases: [
      { input: [[0, 0, 0, 2, 2, 2], [0, 0, 0, 2, 2, 2]], expected: 1.0 },
      { input: [[0, 0, 0, 2, 2, 2], [3, 3, 3, 5, 5, 5]], expected: 0.0 },
      { input: [[0, 0, 0, 2, 2, 2], [1, 1, 1, 3, 3, 3]], expected: 0.0667 },
      { input: [[0, 0, 0, 4, 4, 4], [2, 0, 0, 6, 4, 4]], expected: 0.3333 },
    ],
  },
  {
    id: "cv-213",
    title: "Voxel Downsample",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Downsample a point cloud by voxel grid averaging.\n\nGroup points by (floor(x / size), floor(y / size), floor(z / size)) and return each occupied voxel's centroid as [x, y, z] rounded to 4 decimal places, ordered by ascending voxel coordinates. An empty cloud returns [].",
    starterCode: `def voxel_downsample(points, voxel_size):
    # Your code here
    pass`,
    solution: `def voxel_downsample(points, voxel_size):
    import math
    groups = {}
    for p in points:
        key = (math.floor(p[0] / voxel_size), math.floor(p[1] / voxel_size), math.floor(p[2] / voxel_size))
        groups.setdefault(key, []).append(p)
    out = []
    for key in sorted(groups):
        pts = groups[key]
        n = len(pts)
        out.append([round(sum(p[0] for p in pts) / n, 4),
                    round(sum(p[1] for p in pts) / n, 4),
                    round(sum(p[2] for p in pts) / n, 4)])
    return out`,
    testCases: [
      { input: [[[0.1, 0.1, 0.1], [0.2, 0.3, 0.2], [1.5, 1.5, 1.5]], 1.0], expected: [[0.15, 0.2, 0.15], [1.5, 1.5, 1.5]] },
      { input: [[[1, 1, 1], [1.2, 1.4, 1.6], [1.9, 1.1, 1.3]], 2.0], expected: [[1.3667, 1.1667, 1.3]] },
      { input: [[], 1.0], expected: [] },
      { input: [[[-0.5, -0.5, -0.5], [0.5, 0.5, 0.5]], 1.0], expected: [[-0.5, -0.5, -0.5], [0.5, 0.5, 0.5]] },
    ],
  },
  {
    id: "cv-214",
    title: "NMS 3D Count",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Run greedy non-maximum suppression with 3D IoU and return how many boxes survive.\n\nProcess boxes in descending score order (ties by index) and suppress a box when its 3D IoU with a kept box is strictly greater than iou_threshold.",
    starterCode: `def nms_3d_count(boxes, scores, iou_threshold):
    # Your code here
    pass`,
    solution: `def nms_3d_count(boxes, scores, iou_threshold):
    def iou3(a, b):
        ax1, ay1, az1, ax2, ay2, az2 = a
        bx1, by1, bz1, bx2, by2, bz2 = b
        ix1 = max(ax1, bx1)
        iy1 = max(ay1, by1)
        iz1 = max(az1, bz1)
        ix2 = min(ax2, bx2)
        iy2 = min(ay2, by2)
        iz2 = min(az2, bz2)
        iw = ix2 - ix1
        ih = iy2 - iy1
        idd = iz2 - iz1
        if iw <= 0 or ih <= 0 or idd <= 0:
            return 0.0
        inter = iw * ih * idd
        vol_a = (ax2 - ax1) * (ay2 - ay1) * (az2 - az1)
        vol_b = (bx2 - bx1) * (by2 - by1) * (bz2 - bz1)
        union = vol_a + vol_b - inter
        return inter / union if union > 0 else 0.0

    order = sorted(range(len(boxes)), key=lambda i: (-scores[i], i))
    kept = []
    for i in order:
        ok = True
        for j in kept:
            if iou3(boxes[i], boxes[j]) > iou_threshold:
                ok = False
                break
        if ok:
            kept.append(i)
    return len(kept)`,
    testCases: [
      { input: [[[0, 0, 0, 2, 2, 2], [0, 0, 0, 2, 2, 2], [5, 5, 5, 7, 7, 7]], [0.9, 0.8, 0.7], 0.5], expected: 2 },
      { input: [[[0, 0, 0, 2, 2, 2], [1, 1, 1, 3, 3, 3], [5, 5, 5, 7, 7, 7]], [0.9, 0.8, 0.7], 0.1], expected: 3 },
      { input: [[[0, 0, 0, 2, 2, 2], [1, 1, 1, 3, 3, 3]], [0.9, 0.8], 0.9], expected: 2 },
      { input: [[], [], 0.5], expected: 0 },
    ],
  },
  {
    id: "cv-215",
    title: "Soft-NMS Decay",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Run linear soft-NMS over boxes and scores.\n\nRepeatedly pick the alive box with the highest score (ties by smaller index), record it as [index, score], then decay every remaining box with IoU > iou_threshold by score *= (1 - IoU), dropping boxes whose score falls below 0.001. Round the recorded scores to 4 decimal places.",
    starterCode: `def soft_nms(boxes, scores, iou_threshold):
    # Your code here
    pass`,
    solution: `def soft_nms(boxes, scores, iou_threshold):
    n = len(boxes)
    s = list(scores)
    alive = [True] * n
    result = []
    while True:
        best = -1
        for i in range(n):
            if alive[i] and (best == -1 or s[i] > s[best]):
                best = i
        if best == -1:
            break
        alive[best] = False
        result.append([best, round(s[best], 4)])
        for j in range(n):
            if alive[j]:
                ax1, ay1, ax2, ay2 = boxes[best]
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
                    s[j] *= (1 - v)
                    if s[j] < 0.001:
                        alive[j] = False
    return result`,
    testCases: [
      { input: [[[0, 0, 2, 2], [1, 1, 3, 3], [10, 10, 12, 12]], [0.9, 0.8, 0.7], 0.1], expected: [[0, 0.9], [2, 0.7], [1, 0.6857]] },
      { input: [[[0, 0, 2, 2], [1, 1, 3, 3]], [0.9, 0.8], 0.5], expected: [[0, 0.9], [1, 0.8]] },
      { input: [[[0, 0, 2, 2], [0, 0, 2, 2]], [0.9, 0.8], 0.5], expected: [[0, 0.9]] },
      { input: [[], [], 0.5], expected: [] },
    ],
  },
];
