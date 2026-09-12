import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "cv-126",
    title: "Label Smoothing One-Hot",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Build a smoothed one-hot label vector.\n\nReturn a list of num_classes values: (1 - epsilon) + epsilon / num_classes at class_index and epsilon / num_classes at every other position. Round each value to 4 decimal places.",
    starterCode: `def label_smoothing(num_classes, class_index, epsilon):
    # Your code here
    pass`,
    solution: `def label_smoothing(num_classes, class_index, epsilon):
    out = [epsilon / num_classes] * num_classes
    out[class_index] += 1 - epsilon
    return [round(v, 4) for v in out]`,
    testCases: [
      { input: [3, 0, 0.1], expected: [0.9333, 0.0333, 0.0333] },
      { input: [3, 1, 0.0], expected: [0.0, 1.0, 0.0] },
      { input: [4, 3, 0.2], expected: [0.05, 0.05, 0.05, 0.85] },
      { input: [2, 0, 0.5], expected: [0.75, 0.25] },
    ],
  },
  {
    id: "cv-127",
    title: "Label Encoding from Names",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Map class names to integer ids.\n\nAssign ids in order of first appearance (0, 1, 2, ...) and return the encoded list. An empty input returns [].",
    starterCode: `def encode_labels(names):
    # Your code here
    pass`,
    solution: `def encode_labels(names):
    mapping = {}
    out = []
    for name in names:
        if name not in mapping:
            mapping[name] = len(mapping)
        out.append(mapping[name])
    return out`,
    testCases: [
      { input: [["cat", "dog", "cat", "bird"]], expected: [0, 1, 0, 2] },
      { input: [["a"]], expected: [0] },
      { input: [[]], expected: [] },
      { input: [["b", "a", "b", "a"]], expected: [0, 1, 0, 1] },
    ],
  },
  {
    id: "cv-128",
    title: "Box Area",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Compute the area of a box in [x1, y1, x2, y2] continuous coordinates.\n\nReturn (x2 - x1) * (y2 - y1) rounded to 4 decimal places. Degenerate boxes have area 0.",
    starterCode: `def box_area(box):
    # Your code here
    pass`,
    solution: `def box_area(box):
    x1, y1, x2, y2 = box
    return round((x2 - x1) * (y2 - y1), 4)`,
    testCases: [
      { input: [[0, 0, 2, 3]], expected: 6 },
      { input: [[1, 1, 1, 5]], expected: 0 },
      { input: [[2.5, 1, 4.5, 3]], expected: 4.0 },
      { input: [[0, 0, 0, 0]], expected: 0 },
    ],
  },
  {
    id: "cv-129",
    title: "Box Center",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Compute the center of a box in [x1, y1, x2, y2] coordinates.\n\nReturn [(x1 + x2) / 2, (y1 + y2) / 2] rounded to 4 decimal places.",
    starterCode: `def box_center(box):
    # Your code here
    pass`,
    solution: `def box_center(box):
    x1, y1, x2, y2 = box
    return [round((x1 + x2) / 2.0, 4), round((y1 + y2) / 2.0, 4)]`,
    testCases: [
      { input: [[0, 0, 2, 2]], expected: [1.0, 1.0] },
      { input: [[1, 1, 4, 5]], expected: [2.5, 3.0] },
      { input: [[0.5, 0.25, 1.5, 1.25]], expected: [1.0, 0.75] },
    ],
  },
  {
    id: "cv-130",
    title: "XYWH to XYXY",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Convert a box from [x, y, w, h] to [x1, y1, x2, y2] with x2 = x + w and y2 = y + h. Round each value to 4 decimal places.",
    starterCode: `def xywh_to_xyxy(box):
    # Your code here
    pass`,
    solution: `def xywh_to_xyxy(box):
    x, y, w, h = box
    return [round(x, 4), round(y, 4), round(x + w, 4), round(y + h, 4)]`,
    testCases: [
      { input: [[1, 2, 3, 4]], expected: [1, 2, 4, 6] },
      { input: [[0, 0, 0, 0]], expected: [0, 0, 0, 0] },
      { input: [[2.5, 3.5, 1.0, 2.0]], expected: [2.5, 3.5, 3.5, 5.5] },
    ],
  },
  {
    id: "cv-131",
    title: "XYXY to XYWH",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Convert a box from [x1, y1, x2, y2] to [x, y, w, h] with w = x2 - x1 and h = y2 - y1. Round each value to 4 decimal places.",
    starterCode: `def xyxy_to_xywh(box):
    # Your code here
    pass`,
    solution: `def xyxy_to_xywh(box):
    x1, y1, x2, y2 = box
    return [round(x1, 4), round(y1, 4), round(x2 - x1, 4), round(y2 - y1, 4)]`,
    testCases: [
      { input: [[1, 2, 4, 6]], expected: [1, 2, 3, 4] },
      { input: [[0, 0, 0, 0]], expected: [0, 0, 0, 0] },
      { input: [[2.5, 3.5, 3.5, 5.5]], expected: [2.5, 3.5, 1.0, 2.0] },
    ],
  },
  {
    id: "cv-132",
    title: "Zip Boxes with Scores",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Pair each box with its score.\n\nReturn a list where element i is [x1, y1, x2, y2, score] built from boxes[i] and scores[i]. Empty inputs return [].",
    starterCode: `def zip_boxes_scores(boxes, scores):
    # Your code here
    pass`,
    solution: `def zip_boxes_scores(boxes, scores):
    return [list(b) + [s] for b, s in zip(boxes, scores)]`,
    testCases: [
      { input: [[[0, 0, 2, 2], [1, 1, 3, 3]], [0.9, 0.5]], expected: [[0, 0, 2, 2, 0.9], [1, 1, 3, 3, 0.5]] },
      { input: [[[1, 2, 3, 4]], [0.25]], expected: [[1, 2, 3, 4, 0.25]] },
      { input: [[], []], expected: [] },
    ],
  },
  {
    id: "cv-133",
    title: "Resize Shortest Side",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Compute the new image size when the shortest side is resized to target while preserving the aspect ratio.\n\nscale = target / min(h, w), then round h * scale and w * scale to the nearest integers and return [new_h, new_w].",
    starterCode: `def resize_shortest(h, w, target):
    # Your code here
    pass`,
    solution: `def resize_shortest(h, w, target):
    scale = target / min(h, w)
    return [round(h * scale), round(w * scale)]`,
    testCases: [
      { input: [200, 100, 50], expected: [100, 50] },
      { input: [100, 300, 150], expected: [150, 450] },
      { input: [64, 64, 64], expected: [64, 64] },
      { input: [33, 100, 50], expected: [50, 152] },
    ],
  },
  {
    id: "cv-134",
    title: "Duplicate Image Detection",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Find duplicate images in a list by exact pixel hash.\n\nReturn the indices of the first occurrence of each distinct image, in order. Two images are duplicates when every pixel is equal; an empty list returns [].",
    starterCode: `def duplicate_hash(images):
    # Your code here
    pass`,
    solution: `def duplicate_hash(images):
    seen = {}
    out = []
    for i, img in enumerate(images):
        key = tuple(tuple(row) for row in img)
        if key not in seen:
            seen[key] = i
            out.append(i)
    return out`,
    testCases: [
      { input: [[[[1, 2]], [[1, 2]], [[3, 4]]]], expected: [0, 2] },
      { input: [[[[1, 2]], [[3, 4]], [[5, 6]]]], expected: [0, 1, 2] },
      { input: [[[[1, 2]], [[1, 2]], [[1, 2]]]], expected: [0] },
      { input: [[]], expected: [] },
    ],
    hint: "A tuple of tuples is hashable, so it can key a dictionary.",
  },
  {
    id: "cv-135",
    title: "Batch Stack Shape Check",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Check whether a list of 2D images can be stacked into a single batch.\n\nReturn True when every image has the same height and width, otherwise False. An empty list counts as stackable.",
    starterCode: `def can_stack(images):
    # Your code here
    pass`,
    solution: `def can_stack(images):
    if not images:
        return True
    shapes = [(len(img), len(img[0]) if img else 0) for img in images]
    return all(s == shapes[0] for s in shapes)`,
    testCases: [
      { input: [[[[1, 2], [3, 4]], [[5, 6], [7, 8]], [[9, 10], [11, 12]]]], expected: true },
      { input: [[[[1, 2], [3, 4]], [[5, 6, 7], [8, 9, 10]]]], expected: false },
      { input: [[]], expected: true },
      { input: [[[[1]], [[1]]]], expected: true },
    ],
  },
  {
    id: "cv-136",
    title: "Per-Class Counts Histogram",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Count how many labels of each class appear in a flat label list.\n\nReturn a list of length num_classes where index c is the number of labels equal to c.",
    starterCode: `def class_counts(labels, num_classes):
    # Your code here
    pass`,
    solution: `def class_counts(labels, num_classes):
    counts = [0] * num_classes
    for v in labels:
        counts[v] += 1
    return counts`,
    testCases: [
      { input: [[0, 1, 1, 2, 1, 0], 3], expected: [2, 3, 1] },
      { input: [[0, 0, 0], 2], expected: [3, 0] },
      { input: [[], 3], expected: [0, 0, 0] },
      { input: [[2, 2], 4], expected: [0, 0, 2, 0] },
    ],
  },
  {
    id: "cv-137",
    title: "Pixel Accuracy",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Compute pixel accuracy between two same-shaped label maps.\n\nReturn the fraction of pixels that are equal, rounded to 4 decimal places. The maps are non-empty.",
    starterCode: `def pixel_accuracy(pred, target):
    # Your code here
    pass`,
    solution: `def pixel_accuracy(pred, target):
    total = 0
    correct = 0
    for i in range(len(pred)):
        for j in range(len(pred[0])):
            total += 1
            if pred[i][j] == target[i][j]:
                correct += 1
    return round(correct / total, 4)`,
    testCases: [
      { input: [[[1, 2], [3, 4]], [[1, 0], [3, 4]]], expected: 0.75 },
      { input: [[[1, 2], [3, 4]], [[1, 2], [3, 4]]], expected: 1.0 },
      { input: [[[0, 0], [0, 0]], [[1, 1], [1, 1]]], expected: 0.0 },
    ],
  },
  {
    id: "cv-138",
    title: "Top-1 Error Rate",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Compute the top-1 error rate of a list of predicted class indices.\n\nReturn 1 - (correct / total) rounded to 4 decimal places, comparing preds and labels position by position. An empty list returns 0.0.",
    starterCode: `def top1_error(preds, labels):
    # Your code here
    pass`,
    solution: `def top1_error(preds, labels):
    if not labels:
        return 0.0
    correct = 0
    for p, t in zip(preds, labels):
        if p == t:
            correct += 1
    return round(1 - correct / len(labels), 4)`,
    testCases: [
      { input: [[0, 1, 2, 3], [0, 1, 1, 3]], expected: 0.25 },
      { input: [[0, 1], [0, 1]], expected: 0.0 },
      { input: [[1], [0]], expected: 1.0 },
      { input: [[], []], expected: 0.0 },
    ],
  },
  {
    id: "cv-139",
    title: "Shift Boxes",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Translate every box in [x1, y1, x2, y2] coordinates by (dx, dy).\n\nAdd dx to the x coordinates and dy to the y coordinates, rounding each value to 4 decimal places.",
    starterCode: `def shift_boxes(boxes, dx, dy):
    # Your code here
    pass`,
    solution: `def shift_boxes(boxes, dx, dy):
    return [[round(x1 + dx, 4), round(y1 + dy, 4), round(x2 + dx, 4), round(y2 + dy, 4)] for x1, y1, x2, y2 in boxes]`,
    testCases: [
      { input: [[[1, 2, 3, 4], [5, 6, 7, 8]], 10, -1], expected: [[11, 1, 13, 3], [15, 5, 17, 7]] },
      { input: [[[0, 0, 2, 2]], 0.5, 0.5], expected: [[0.5, 0.5, 2.5, 2.5]] },
      { input: [[], 3, 4], expected: [] },
    ],
  },
  {
    id: "cv-140",
    title: "Flip Boxes Horizontally",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Mirror boxes horizontally for an image of the given width.\n\nMap [x1, y1, x2, y2] to [width - x2, y1, width - x1, y2] and round each value to 4 decimal places.",
    starterCode: `def flip_boxes_h(boxes, width):
    # Your code here
    pass`,
    solution: `def flip_boxes_h(boxes, width):
    return [[round(width - x2, 4), y1, round(width - x1, 4), y2] for x1, y1, x2, y2 in boxes]`,
    testCases: [
      { input: [[[1, 2, 3, 4], [0, 0, 10, 10]], 10], expected: [[7, 2, 9, 4], [0, 0, 10, 10]] },
      { input: [[[2, 1, 5, 3]], 6], expected: [[1, 1, 4, 3]] },
      { input: [[], 8], expected: [] },
    ],
  },
  {
    id: "cv-141",
    title: "Filter Small Boxes",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Keep only boxes whose area is at least min_area.\n\nArea uses continuous [x1, y1, x2, y2] coordinates: (x2 - x1) * (y2 - y1). Return the surviving boxes in their original order.",
    starterCode: `def filter_small_boxes(boxes, min_area):
    # Your code here
    pass`,
    solution: `def filter_small_boxes(boxes, min_area):
    return [b for b in boxes if (b[2] - b[0]) * (b[3] - b[1]) >= min_area]`,
    testCases: [
      { input: [[[0, 0, 2, 2], [0, 0, 1, 1], [0, 0, 3, 3]], 4], expected: [[0, 0, 2, 2], [0, 0, 3, 3]] },
      { input: [[[0, 0, 2, 2], [0, 0, 1, 1]], 1], expected: [[0, 0, 2, 2], [0, 0, 1, 1]] },
      { input: [[], 5], expected: [] },
    ],
  },
  {
    id: "cv-142",
    title: "Seeded Dataset Split Indices",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Split dataset indices into train and validation sets with a seeded shuffle.\n\nSeed the random module, shuffle list(range(n)), then move int(round(n * val_ratio)) indices to validation and keep the rest in train. Return [sorted_train, sorted_val].",
    starterCode: `def split_indices(n, val_ratio, seed):
    # Your code here
    pass`,
    solution: `def split_indices(n, val_ratio, seed):
    import random
    random.seed(seed)
    idx = list(range(n))
    random.shuffle(idx)
    n_val = int(round(n * val_ratio))
    return [sorted(idx[n_val:]), sorted(idx[:n_val])]`,
    testCases: [
      { input: [5, 0.4, 42], expected: [[0, 2, 4], [1, 3]] },
      { input: [6, 0.5, 1], expected: [[0, 1, 4], [2, 3, 5]] },
      { input: [1, 1.0, 7], expected: [[], [0]] },
      { input: [4, 0.0, 0], expected: [[0, 1, 2, 3], []] },
    ],
    hint: "Seed first, shuffle once, then slice the shuffled index list.",
  },
  {
    id: "cv-143",
    title: "Seeded Shuffle of Image List",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Shuffle a list of images with a seeded random shuffle.\n\nSeed the random module with seed, shuffle the positions with random.shuffle and return the reordered list.",
    starterCode: `def shuffle_images(images, seed):
    # Your code here
    pass`,
    solution: `def shuffle_images(images, seed):
    import random
    random.seed(seed)
    idx = list(range(len(images)))
    random.shuffle(idx)
    return [images[i] for i in idx]`,
    testCases: [
      { input: [[[[1]], [[2]], [[3]], [[4]]], 7], expected: [[[4]], [[2]], [[1]], [[3]]] },
      { input: [[[[1]], [[2]], [[3]], [[4]]], 0], expected: [[[3]], [[1]], [[2]], [[4]]] },
      { input: [[[[1]], [[2]]], 3], expected: [[[2]], [[1]]] },
    ],
  },
  {
    id: "cv-144",
    title: "Dice Coefficient for Binary Masks",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the Dice coefficient between two binary masks.\n\nReturn 2 * intersection / (sum_a + sum_b) rounded to 4 decimal places, where the intersection counts pixels that are 1 in both masks. Return 0.0 when both masks are all zeros.",
    starterCode: `def dice_coefficient(mask_a, mask_b):
    # Your code here
    pass`,
    solution: `def dice_coefficient(mask_a, mask_b):
    inter = 0
    total = 0
    for i in range(len(mask_a)):
        for j in range(len(mask_a[0])):
            a = mask_a[i][j]
            b = mask_b[i][j]
            if a and b:
                inter += 1
            total += a + b
    if total == 0:
        return 0.0
    return round(2.0 * inter / total, 4)`,
    testCases: [
      { input: [[[1, 1], [0, 0]], [[1, 0], [1, 0]]], expected: 0.5 },
      { input: [[[1, 0], [0, 1]], [[1, 0], [0, 1]]], expected: 1.0 },
      { input: [[[1, 1], [1, 1]], [[0, 0], [0, 0]]], expected: 0.0 },
      { input: [[[0, 0], [0, 0]], [[0, 0], [0, 0]]], expected: 0.0 },
    ],
  },
  {
    id: "cv-145",
    title: "Soft Dice Loss",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the soft Dice loss between a probability map and a binary target.\n\nReturn 1 - (2 * sum(p * t) + eps) / (sum(p) + sum(t) + eps), rounded to 4 decimal places. eps guards against division by zero.",
    starterCode: `def soft_dice_loss(prob, target, eps):
    # Your code here
    pass`,
    solution: `def soft_dice_loss(prob, target, eps):
    inter = 0.0
    denom = 0.0
    for i in range(len(prob)):
        for j in range(len(prob[0])):
            inter += prob[i][j] * target[i][j]
            denom += prob[i][j] + target[i][j]
    return round(1 - (2 * inter + eps) / (denom + eps), 4)`,
    testCases: [
      { input: [[[0.8, 0.2]], [[1, 0]], 0.0], expected: 0.2 },
      { input: [[[1.0, 0.0]], [[1, 0]], 1e-06], expected: 0.0 },
      { input: [[[0.5]], [[1]], 1e-06], expected: 0.3333 },
      { input: [[[0.9, 0.1], [0.1, 0.9]], [[1, 0], [0, 1]], 0.0], expected: 0.1 },
    ],
  },
  {
    id: "cv-146",
    title: "Per-Class Accuracy",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute accuracy for each class in a label map.\n\nFor class c divide the number of pixels whose prediction equals the target by the number of target pixels of class c. Classes with no target pixels score 0.0; round each value to 4 decimal places.",
    starterCode: `def per_class_accuracy(pred, target, num_classes):
    # Your code here
    pass`,
    solution: `def per_class_accuracy(pred, target, num_classes):
    totals = [0] * num_classes
    correct = [0] * num_classes
    for i in range(len(pred)):
        for j in range(len(pred[0])):
            c = target[i][j]
            totals[c] += 1
            if pred[i][j] == c:
                correct[c] += 1
    return [round(correct[c] / totals[c], 4) if totals[c] else 0.0 for c in range(num_classes)]`,
    testCases: [
      { input: [[[0, 1], [2, 1]], [[0, 1], [2, 0]], 3], expected: [0.5, 1.0, 1.0] },
      { input: [[[0, 0]], [[1, 1]], 2], expected: [0.0, 0.0] },
      { input: [[[1]], [[1]], 2], expected: [0.0, 1.0] },
    ],
  },
  {
    id: "cv-147",
    title: "Macro Recall",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute macro-averaged recall over num_classes.\n\nClass recall is the number of correct predictions for that class divided by the number of target pixels of that class; classes with no target pixels count as 0.0. Return the unweighted mean rounded to 4 decimal places.",
    starterCode: `def macro_recall(pred, target, num_classes):
    # Your code here
    pass`,
    solution: `def macro_recall(pred, target, num_classes):
    totals = [0] * num_classes
    hits = [0] * num_classes
    for i in range(len(pred)):
        for j in range(len(pred[0])):
            c = target[i][j]
            totals[c] += 1
            if pred[i][j] == c:
                hits[c] += 1
    recalls = [hits[c] / totals[c] if totals[c] else 0.0 for c in range(num_classes)]
    return round(sum(recalls) / num_classes, 4)`,
    testCases: [
      { input: [[[0, 1], [2, 1]], [[0, 1], [2, 0]], 3], expected: 0.8333 },
      { input: [[[0, 0]], [[1, 1]], 2], expected: 0.0 },
      { input: [[[1, 0]], [[1, 1]], 2], expected: 0.25 },
    ],
  },
  {
    id: "cv-148",
    title: "Anchor Grid Generation",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Generate anchor boxes for every cell of a feature map.\n\nFor cell (i, j) the center is (j * stride + stride / 2, i * stride + stride / 2); emit one [cx, cy, w, h] entry per anchor in the order given, iterating cells row-major. Round center coordinates to 4 decimal places.",
    starterCode: `def anchor_grid(feature_h, feature_w, stride, anchors):
    # Your code here
    pass`,
    solution: `def anchor_grid(feature_h, feature_w, stride, anchors):
    out = []
    for i in range(feature_h):
        for j in range(feature_w):
            cx = j * stride + stride / 2.0
            cy = i * stride + stride / 2.0
            for w, h in anchors:
                out.append([round(cx, 4), round(cy, 4), w, h])
    return out`,
    testCases: [
      { input: [2, 2, 8, [[16, 16], [32, 32]]], expected: [[4.0, 4.0, 16, 16], [4.0, 4.0, 32, 32], [12.0, 4.0, 16, 16], [12.0, 4.0, 32, 32], [4.0, 12.0, 16, 16], [4.0, 12.0, 32, 32], [12.0, 12.0, 16, 16], [12.0, 12.0, 32, 32]] },
      { input: [1, 1, 16, [[10, 20]]], expected: [[8.0, 8.0, 10, 20]] },
      { input: [1, 2, 4, [[8, 8]]], expected: [[2.0, 2.0, 8, 8], [6.0, 2.0, 8, 8]] },
    ],
  },
  {
    id: "cv-149",
    title: "Box Encode Offsets",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Encode a ground-truth box relative to an anchor for object detection.\n\nBoth boxes are [cx, cy, w, h]. Return [(gcx - acx) / aw, (gcy - acy) / ah, log(gw / aw), log(gh / ah)] with each value rounded to 4 decimal places.",
    starterCode: `def encode_box(anchor, gt):
    # Your code here
    pass`,
    solution: `def encode_box(anchor, gt):
    import math
    acx, acy, aw, ah = anchor
    gcx, gcy, gw, gh = gt
    return [round((gcx - acx) / aw, 4), round((gcy - acy) / ah, 4),
            round(math.log(gw / aw), 4), round(math.log(gh / ah), 4)]`,
    testCases: [
      { input: [[0, 0, 10, 10], [0, 0, 10, 10]], expected: [0.0, 0.0, 0.0, 0.0] },
      { input: [[5, 5, 10, 10], [7, 4, 20, 5]], expected: [0.2, -0.1, 0.6931, -0.6931] },
      { input: [[1, 1, 2, 4], [2, 3, 4, 2]], expected: [0.5, 0.5, 0.6931, -0.6931] },
    ],
  },
  {
    id: "cv-150",
    title: "Box Decode Offsets",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Decode predicted offsets back into a box given an anchor.\n\nAnchor and box are [cx, cy, w, h]; for offsets [dx, dy, dw, dh] return [acx + dx * aw, acy + dy * ah, aw * exp(dw), ah * exp(dh)] rounded to 4 decimal places.",
    starterCode: `def decode_box(anchor, offsets):
    # Your code here
    pass`,
    solution: `def decode_box(anchor, offsets):
    import math
    acx, acy, aw, ah = anchor
    dx, dy, dw, dh = offsets
    return [round(acx + dx * aw, 4), round(acy + dy * ah, 4),
            round(aw * math.exp(dw), 4), round(ah * math.exp(dh), 4)]`,
    testCases: [
      { input: [[0, 0, 10, 10], [0, 0, 0, 0]], expected: [0, 0, 10.0, 10.0] },
      { input: [[5, 5, 10, 10], [0.2, -0.1, 0.6931, -0.6931]], expected: [7.0, 4.0, 19.9991, 5.0002] },
      { input: [[1, 1, 2, 4], [0.5, 0.5, 0.6931, -0.6931]], expected: [2.0, 3.0, 3.9998, 2.0001] },
    ],
  },
  {
    id: "cv-151",
    title: "Clip Boxes to Image",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Clip boxes to the image rectangle.\n\nClamp x1 and x2 to [0, width] and y1 and y2 to [0, height], rounding each coordinate to 4 decimal places.",
    starterCode: `def clip_boxes(boxes, width, height):
    # Your code here
    pass`,
    solution: `def clip_boxes(boxes, width, height):
    out = []
    for x1, y1, x2, y2 in boxes:
        out.append([round(max(0, min(width, x1)), 4), round(max(0, min(height, y1)), 4),
                    round(max(0, min(width, x2)), 4), round(max(0, min(height, y2)), 4)])
    return out`,
    testCases: [
      { input: [[[-1, 2, 5, 20]], 4, 10], expected: [[0, 2, 4, 10]] },
      { input: [[[0, 0, 4, 10]], 4, 10], expected: [[0, 0, 4, 10]] },
      { input: [[[5, 5, 6, 6]], 4, 4], expected: [[4, 4, 4, 4]] },
      { input: [[[-2, -3, 2, 3], [1, 1, 2, 2]], 3, 3], expected: [[0, 0, 2, 3], [1, 1, 2, 2]] },
    ],
  },
  {
    id: "cv-152",
    title: "Scale Boxes",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Scale boxes by independent x and y factors.\n\nMultiply x coordinates by sx and y coordinates by sy, rounding each value to 4 decimal places.",
    starterCode: `def scale_boxes(boxes, sx, sy):
    # Your code here
    pass`,
    solution: `def scale_boxes(boxes, sx, sy):
    return [[round(x1 * sx, 4), round(y1 * sy, 4), round(x2 * sx, 4), round(y2 * sy, 4)] for x1, y1, x2, y2 in boxes]`,
    testCases: [
      { input: [[[1, 2, 3, 4]], 2, 3], expected: [[2, 6, 6, 12]] },
      { input: [[[0, 0, 4, 4], [2, 2, 3, 3]], 0.5, 0.5], expected: [[0.0, 0.0, 2.0, 2.0], [1.0, 1.0, 1.5, 1.5]] },
      { input: [[], 2, 2], expected: [] },
    ],
  },
  {
    id: "cv-153",
    title: "Rotate Boxes 90",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Rotate boxes 90 degrees clockwise for an image of the given height.\n\nMap [x1, y1, x2, y2] to [height - y2, x1, height - y1, x2] and round each value to 4 decimal places.",
    starterCode: `def rotate_boxes_90(boxes, height):
    # Your code here
    pass`,
    solution: `def rotate_boxes_90(boxes, height):
    return [[round(height - y2, 4), x1, round(height - y1, 4), x2] for x1, y1, x2, y2 in boxes]`,
    testCases: [
      { input: [[[1, 0, 3, 2]], 4], expected: [[2, 1, 4, 3]] },
      { input: [[[0, 0, 2, 4]], 4], expected: [[0, 0, 4, 2]] },
      { input: [[[1, 1, 2, 2]], 3], expected: [[1, 1, 2, 2]] },
    ],
  },
  {
    id: "cv-154",
    title: "Resize Boxes",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Resize boxes after an image resize.\n\nGiven the old and new image sizes, scale x coordinates by new_w / old_w and y coordinates by new_h / old_h, rounding each value to 4 decimal places.",
    starterCode: `def resize_boxes(boxes, old_w, old_h, new_w, new_h):
    # Your code here
    pass`,
    solution: `def resize_boxes(boxes, old_w, old_h, new_w, new_h):
    sx = new_w / old_w
    sy = new_h / old_h
    return [[round(x1 * sx, 4), round(y1 * sy, 4), round(x2 * sx, 4), round(y2 * sy, 4)] for x1, y1, x2, y2 in boxes]`,
    testCases: [
      { input: [[[1, 2, 3, 4]], 10, 10, 20, 30], expected: [[2.0, 6.0, 6.0, 12.0]] },
      { input: [[[0, 0, 5, 5]], 5, 5, 5, 5], expected: [[0.0, 0.0, 5.0, 5.0]] },
      { input: [[[1, 1, 2, 2], [3, 3, 4, 4]], 4, 2, 2, 4], expected: [[0.5, 2.0, 1.0, 4.0], [1.5, 6.0, 2.0, 8.0]] },
    ],
  },
  {
    id: "cv-155",
    title: "Crop Boxes",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Shift boxes after cropping an image at (left, top).\n\nSubtract left from x coordinates and top from y coordinates, rounding each value to 4 decimal places. Boxes fully outside the crop are kept as negative values.",
    starterCode: `def crop_boxes(boxes, left, top):
    # Your code here
    pass`,
    solution: `def crop_boxes(boxes, left, top):
    return [[round(x1 - left, 4), round(y1 - top, 4), round(x2 - left, 4), round(y2 - top, 4)] for x1, y1, x2, y2 in boxes]`,
    testCases: [
      { input: [[[0, 0, 2, 2], [5, 5, 7, 7]], 1, 2], expected: [[-1, -2, 1, 0], [4, 3, 6, 5]] },
      { input: [[[1, 2, 3, 4]], 0, 0], expected: [[1, 2, 3, 4]] },
      { input: [[], 1, 1], expected: [] },
    ],
  },
  {
    id: "cv-156",
    title: "Letterbox Boxes",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Transform boxes through a letterbox resize.\n\nMap coordinates with x * scale + pad_left and y * scale + pad_top, rounding each value to 4 decimal places.",
    starterCode: `def letterbox_boxes(boxes, scale, pad_left, pad_top):
    # Your code here
    pass`,
    solution: `def letterbox_boxes(boxes, scale, pad_left, pad_top):
    return [[round(x1 * scale + pad_left, 4), round(y1 * scale + pad_top, 4),
             round(x2 * scale + pad_left, 4), round(y2 * scale + pad_top, 4)] for x1, y1, x2, y2 in boxes]`,
    testCases: [
      { input: [[[10, 20, 30, 40]], 0.5, 16, 8], expected: [[21.0, 18.0, 31.0, 28.0]] },
      { input: [[[0, 0, 100, 50], [50, 25, 75, 40]], 0.64, 0, 32], expected: [[0.0, 32.0, 64.0, 64.0], [32.0, 48.0, 48.0, 57.6]] },
      { input: [[[1, 1, 2, 2]], 2, 10, 5], expected: [[12.0, 7.0, 14.0, 9.0]] },
    ],
  },
  {
    id: "cv-157",
    title: "Center Crop with Padding",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Center crop an image to out_h x out_w, padding with value when the crop is larger than the image.\n\nUse top = (H - out_h) // 2 and left = (W - out_w) // 2, then read the source pixel; out-of-bounds pixels become value.",
    starterCode: `def center_crop_pad(image, out_h, out_w, value):
    # Your code here
    pass`,
    solution: `def center_crop_pad(image, out_h, out_w, value):
    h = len(image)
    w = len(image[0])
    top = (h - out_h) // 2
    left = (w - out_w) // 2
    out = []
    for i in range(out_h):
        row = []
        for j in range(out_w):
            si = top + i
            sj = left + j
            if 0 <= si < h and 0 <= sj < w:
                row.append(image[si][sj])
            else:
                row.append(value)
        out.append(row)
    return out`,
    testCases: [
      { input: [[[1, 2], [3, 4]], 4, 4, 0], expected: [[0, 0, 0, 0], [0, 1, 2, 0], [0, 3, 4, 0], [0, 0, 0, 0]] },
      { input: [[[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]], 2, 2, 9], expected: [[5, 6], [9, 10]] },
      { input: [[[5]], 3, 3, 0], expected: [[0, 0, 0], [0, 5, 0], [0, 0, 0]] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], 3, 3, 0], expected: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] },
    ],
  },
  {
    id: "cv-158",
    title: "Per-Channel Normalize",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Normalize an H x W x C image with per-channel mean and standard deviation.\n\nReturn (v - mean[c]) / std[c] for every channel value, rounded to 4 decimal places.",
    starterCode: `def normalize_per_channel(image, mean, std):
    # Your code here
    pass`,
    solution: `def normalize_per_channel(image, mean, std):
    out = []
    for row in image:
        r = []
        for p in row:
            r.append([round((p[c] - mean[c]) / std[c], 4) for c in range(len(p))])
        out.append(r)
    return out`,
    testCases: [
      { input: [[[[0, 128, 255], [64, 64, 64]]], [128, 128, 128], [64, 64, 64]], expected: [[[-2.0, 0.0, 1.9844], [-1.0, -1.0, -1.0]]] },
      { input: [[[[10, 20], [30, 40]]], [10, 20], [5, 10]], expected: [[[0.0, 0.0], [4.0, 2.0]]] },
      { input: [[[[128, 128, 128]]], [128, 128, 128], [64, 64, 64]], expected: [[[0.0, 0.0, 0.0]]] },
    ],
  },
  {
    id: "cv-159",
    title: "Denormalize",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Invert per-channel normalization.\n\nReturn v * std[c] + mean[c] for every channel value, rounded to 4 decimal places. No clamping is applied.",
    starterCode: `def denormalize(image, mean, std):
    # Your code here
    pass`,
    solution: `def denormalize(image, mean, std):
    out = []
    for row in image:
        r = []
        for p in row:
            r.append([round(p[c] * std[c] + mean[c], 4) for c in range(len(p))])
        out.append(r)
    return out`,
    testCases: [
      { input: [[[[-2.0, 0.0, 2.0]]], [128, 128, 128], [64, 64, 64]], expected: [[[0.0, 128.0, 256.0]]] },
      { input: [[[[0.0, 0.0], [4.0, 2.0]]], [10, 20], [5, 10]], expected: [[[10.0, 20.0], [30.0, 40.0]]] },
      { input: [[[[1.0, 0.0]]], [0, 0], [1, 1]], expected: [[[1.0, 0.0]]] },
    ],
  },
  {
    id: "cv-160",
    title: "Dataset Mean Color",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the mean color of a dataset of RGB images.\n\nAverage each channel over every pixel of every image and return the three means rounded to 4 decimal places.",
    starterCode: `def dataset_mean_color(images):
    # Your code here
    pass`,
    solution: `def dataset_mean_color(images):
    sums = [0.0, 0.0, 0.0]
    n = 0
    for img in images:
        for row in img:
            for p in row:
                for c in range(3):
                    sums[c] += p[c]
                n += 1
    return [round(s / n, 4) for s in sums]`,
    testCases: [
      { input: [[[[[100, 0, 50]]], [[[200, 100, 250]]]]], expected: [150.0, 50.0, 150.0] },
      { input: [[[[[0, 0, 0], [255, 255, 255]]]]], expected: [127.5, 127.5, 127.5] },
      { input: [[[[[0, 0, 0]]], [[[0, 0, 0]]]]], expected: [0.0, 0.0, 0.0] },
    ],
    hint: "Count pixels across the whole dataset, not per image.",
  },
  {
    id: "cv-161",
    title: "Dataset Std Color",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the per-channel color standard deviation of a dataset of RGB images.\n\nUse the population standard deviation over every pixel of every image and return the three values rounded to 4 decimal places.",
    starterCode: `def dataset_std_color(images):
    # Your code here
    pass`,
    solution: `def dataset_std_color(images):
    vals = [[], [], []]
    for img in images:
        for row in img:
            for p in row:
                for c in range(3):
                    vals[c].append(p[c])
    out = []
    for c in range(3):
        m = sum(vals[c]) / len(vals[c])
        var = sum((v - m) ** 2 for v in vals[c]) / len(vals[c])
        out.append(round(var ** 0.5, 4))
    return out`,
    testCases: [
      { input: [[[[[0, 0, 0], [255, 255, 255]]]]], expected: [127.5, 127.5, 127.5] },
      { input: [[[[[0, 10, 20]], [[10, 20, 30]]]]], expected: [5.0, 5.0, 5.0] },
      { input: [[[[[7, 7, 7]]], [[[7, 7, 7]]]]], expected: [0.0, 0.0, 0.0] },
    ],
  },
  {
    id: "cv-162",
    title: "Seeded Random Horizontal Flip",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Randomly flip images horizontally with probability p using a seeded RNG.\n\nSeed the random module, then for each image draw random.random() and flip it (reversing every row) when the draw is less than p. Return the list of resulting images.",
    starterCode: `def random_hflip(images, p, seed):
    # Your code here
    pass`,
    solution: `def random_hflip(images, p, seed):
    import random
    random.seed(seed)
    out = []
    for img in images:
        if random.random() < p:
            out.append([list(reversed(row)) for row in img])
        else:
            out.append([list(row) for row in img])
    return out`,
    testCases: [
      { input: [[[[1, 2], [3, 4]], [[5, 6], [7, 8]], [[9, 10], [11, 12]], [[13, 14], [15, 16]]], 0.5, 1], expected: [[[2, 1], [4, 3]], [[5, 6], [7, 8]], [[9, 10], [11, 12]], [[14, 13], [16, 15]]] },
      { input: [[[[1, 2], [3, 4]], [[5, 6], [7, 8]]], 1.0, 2], expected: [[[2, 1], [4, 3]], [[6, 5], [8, 7]]] },
      { input: [[[[1, 2], [3, 4]], [[5, 6], [7, 8]]], 0.0, 3], expected: [[[1, 2], [3, 4]], [[5, 6], [7, 8]]] },
    ],
  },
  {
    id: "cv-163",
    title: "Seeded Random Crop",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Take a random crop from an image using a seeded RNG.\n\nSeed the random module, pick top = randint(0, H - out_h) and left = randint(0, W - out_w), then return the out_h x out_w crop.",
    starterCode: `def random_crop(image, out_h, out_w, seed):
    # Your code here
    pass`,
    solution: `def random_crop(image, out_h, out_w, seed):
    import random
    random.seed(seed)
    h = len(image)
    w = len(image[0])
    top = random.randint(0, h - out_h)
    left = random.randint(0, w - out_w)
    return [row[left:left + out_w] for row in image[top:top + out_h]]`,
    testCases: [
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], 2, 2, 5], expected: [[5, 6], [8, 9]] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], 1, 1, 0], expected: [[5]] },
      { input: [[[1, 2, 3], [4, 5, 6]], 1, 2, 4], expected: [[2, 3]] },
      { input: [[[1, 2], [3, 4]], 2, 2, 9], expected: [[1, 2], [3, 4]] },
    ],
  },
  {
    id: "cv-164",
    title: "Seeded Color Jitter",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Apply brightness jitter to a grayscale image with a seeded RNG.\n\nSeed the random module, draw factor = 1 - brightness + 2 * brightness * random.random(), then multiply each pixel by factor, rounding and clamping to [0, 255].",
    starterCode: `def color_jitter(image, brightness, seed):
    # Your code here
    pass`,
    solution: `def color_jitter(image, brightness, seed):
    import random
    random.seed(seed)
    factor = 1 - brightness + 2 * brightness * random.random()
    out = []
    for row in image:
        r = []
        for v in row:
            r.append(max(0, min(255, round(v * factor))))
        out.append(r)
    return out`,
    testCases: [
      { input: [[[100, 200], [0, 50]], 0.2, 1], expected: [[85, 171], [0, 43]] },
      { input: [[[100, 200], [0, 50]], 0.5, 42], expected: [[114, 228], [0, 57]] },
      { input: [[[100, 200], [0, 50]], 0.0, 3], expected: [[100, 200], [0, 50]] },
    ],
  },
  {
    id: "cv-165",
    title: "Random Erasing",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Erase a random square region of an image with a seeded RNG.\n\nSeed the random module; the square side is max(1, round(sqrt(area_frac * H * W))) clipped to the image, the top-left is uniform in the remaining range, and the region is filled with 0.",
    starterCode: `def random_erasing(image, area_frac, seed):
    # Your code here
    pass`,
    solution: `def random_erasing(image, area_frac, seed):
    import random
    random.seed(seed)
    h = len(image)
    w = len(image[0])
    s = max(1, int(round((area_frac * h * w) ** 0.5)))
    s = min(s, h, w)
    top = random.randint(0, h - s)
    left = random.randint(0, w - s)
    out = [list(row) for row in image]
    for i in range(top, top + s):
        for j in range(left, left + s):
            out[i][j] = 0
    return out`,
    testCases: [
      { input: [[[5, 5, 5, 5], [5, 5, 5, 5], [5, 5, 5, 5], [5, 5, 5, 5]], 0.25, 2], expected: [[0, 0, 5, 5], [0, 0, 5, 5], [5, 5, 5, 5], [5, 5, 5, 5]] },
      { input: [[[5, 5, 5, 5], [5, 5, 5, 5], [5, 5, 5, 5], [5, 5, 5, 5]], 0.1, 0], expected: [[5, 5, 5, 5], [5, 5, 5, 5], [5, 5, 5, 5], [5, 5, 5, 0]] },
      { input: [[[1, 2], [3, 4]], 0.5, 1], expected: [[0, 2], [3, 4]] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], 1.0, 0], expected: [[0, 0, 0], [0, 0, 0], [0, 0, 0]] },
    ],
  },
  {
    id: "cv-166",
    title: "Patch Dedupe SSD",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Remove near-duplicate patches greedily by sum of squared differences.\n\nKeep the first patch, then keep each later patch only when its SSD to every already kept patch is at least threshold. Return the kept indices.",
    starterCode: `def dedupe_patches(patches, threshold):
    # Your code here
    pass`,
    solution: `def dedupe_patches(patches, threshold):
    keep = []
    for i, p in enumerate(patches):
        flat_p = [v for row in p for v in row]
        ok = True
        for j in keep:
            flat_q = [v for row in patches[j] for v in row]
            ssd = sum((a - b) * (a - b) for a, b in zip(flat_p, flat_q))
            if ssd < threshold:
                ok = False
                break
        if ok:
            keep.append(i)
    return keep`,
    testCases: [
      { input: [[[[1, 2]], [[1, 2]], [[3, 4]]], 1], expected: [0, 2] },
      { input: [[[[1, 2]], [[1, 2]], [[3, 4]]], 0], expected: [0, 1, 2] },
      { input: [[[[1, 2]], [[1, 2]], [[3, 4]]], 5], expected: [0, 2] },
      { input: [[[[1, 1]], [[2, 2]], [[3, 3]]], 4], expected: [0, 2] },
    ],
  },
  {
    id: "cv-167",
    title: "Focal Loss (Binary)",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Compute the binary focal loss for a single prediction.\n\nWith p_t = prob when target is 1 and 1 - prob otherwise, return -((1 - p_t)^gamma) * log(p_t) rounded to 4 decimal places. Clamp p_t to at least 1e-12 before taking the logarithm.",
    starterCode: `def focal_loss(prob, target, gamma):
    # Your code here
    pass`,
    solution: `def focal_loss(prob, target, gamma):
    import math
    p_t = prob if target == 1 else 1 - prob
    p_t = max(p_t, 1e-12)
    return round(-((1 - p_t) ** gamma) * math.log(p_t) + 0.0, 4)`,
    testCases: [
      { input: [0.9, 1, 2], expected: 0.0011 },
      { input: [0.1, 1, 0], expected: 2.3026 },
      { input: [0.5, 0, 2], expected: 0.1733 },
      { input: [1.0, 1, 2], expected: 0.0 },
    ],
    hint: "The modulating factor (1 - p_t)^gamma down-weights easy examples.",
  },
  {
    id: "cv-168",
    title: "Mean IoU over Classes",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Compute mean intersection over union over num_classes.\n\nFor each class compute intersection / union over the two label maps, where a pixel belongs to the union when either map equals the class. Classes with an empty union score 0.0; return the mean rounded to 4 decimal places.",
    starterCode: `def mean_iou(pred, target, num_classes):
    # Your code here
    pass`,
    solution: `def mean_iou(pred, target, num_classes):
    total = 0.0
    for c in range(num_classes):
        inter = 0
        union = 0
        for i in range(len(pred)):
            for j in range(len(pred[0])):
                p = pred[i][j] == c
                t = target[i][j] == c
                if p and t:
                    inter += 1
                if p or t:
                    union += 1
        total += inter / union if union else 0.0
    return round(total / num_classes, 4)`,
    testCases: [
      { input: [[[0, 1], [1, 0]], [[0, 1], [1, 0]], 2], expected: 1.0 },
      { input: [[[0, 1], [1, 0]], [[1, 1], [1, 1]], 2], expected: 0.25 },
      { input: [[[0, 0], [0, 0]], [[0, 0], [0, 0]], 2], expected: 0.5 },
      { input: [[[0, 1], [2, 0]], [[0, 2], [2, 0]], 3], expected: 0.5 },
    ],
  },
  {
    id: "cv-169",
    title: "Stratified Split by Label",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Split indices into train and validation while preserving class proportions.\n\nSeed the random module once, then for each class in ascending order shuffle its indices and move int(round(count * val_ratio)) of them to validation. Keep the shuffled order within each split and return [train, val].",
    starterCode: `def stratified_split(labels, val_ratio, seed):
    # Your code here
    pass`,
    solution: `def stratified_split(labels, val_ratio, seed):
    import random
    random.seed(seed)
    classes = sorted(set(labels))
    train = []
    val = []
    for c in classes:
        idx = [i for i, v in enumerate(labels) if v == c]
        random.shuffle(idx)
        n_val = int(round(len(idx) * val_ratio))
        val.extend(idx[:n_val])
        train.extend(idx[n_val:])
    return [train, val]`,
    testCases: [
      { input: [[0, 0, 0, 1, 1, 2, 2], 0.5, 3], expected: [[0, 4, 6], [1, 2, 3, 5]] },
      { input: [[0, 1, 0, 1], 0.5, 7], expected: [[2, 1], [0, 3]] },
      { input: [[5, 5, 5], 0.0, 1], expected: [[1, 2, 0], []] },
    ],
    hint: "Seed once at the start and shuffle each class's index list in turn.",
  },
  {
    id: "cv-170",
    title: "Class-Balanced Sampler Indices",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Build a class-balanced index sequence.\n\nGroup indices by label, then cycle through classes in ascending order, appending the next index of each class and wrapping within the class when it runs out, until num_samples indices are produced.",
    starterCode: `def balanced_indices(labels, num_samples):
    # Your code here
    pass`,
    solution: `def balanced_indices(labels, num_samples):
    groups = {}
    for i, v in enumerate(labels):
        groups.setdefault(v, []).append(i)
    order = sorted(groups)
    counters = {c: 0 for c in order}
    out = []
    while len(out) < num_samples and order:
        for c in order:
            if len(out) >= num_samples:
                break
            g = groups[c]
            out.append(g[counters[c] % len(g)])
            counters[c] += 1
    return out`,
    testCases: [
      { input: [[0, 0, 1, 2, 2, 2], 6], expected: [0, 2, 3, 1, 2, 4] },
      { input: [[0, 0, 1, 2, 2, 2], 3], expected: [0, 2, 3] },
      { input: [[0, 0, 1, 2, 2, 2], 0], expected: [] },
      { input: [[], 5], expected: [] },
    ],
    hint: "Use a per-class counter with modulo so exhausted classes wrap around.",
  },
];
