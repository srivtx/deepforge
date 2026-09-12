import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "cv-306",
    title: "ViT Patch Grid",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Compute the patch grid a Vision Transformer sees for an image.\n\nReturn [rows, cols] where rows = h // patch and cols = w // patch. Both image dimensions are divisible by patch.",
    starterCode: `def patch_grid(h, w, patch):
    # Your code here
    pass`,
    solution: `def patch_grid(h, w, patch):
    return [h // patch, w // patch]`,
    testCases: [
      { input: [224, 224, 16], expected: [14, 14] },
      { input: [224, 224, 32], expected: [7, 7] },
      { input: [64, 96, 16], expected: [4, 6] },
      { input: [32, 32, 8], expected: [4, 4] },
    ],
  },
  {
    id: "cv-307",
    title: "Patch Embedding Dimension",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Compute the projection dimension of a convolutional patch embedding.\n\nA patch of patch_h x patch_w pixels from an image with in_channels channels flattens to patch_h * patch_w * in_channels values. Return that dimension.",
    starterCode: `def patch_embed_dim(patch_h, patch_w, in_channels):
    # Your code here
    pass`,
    solution: `def patch_embed_dim(patch_h, patch_w, in_channels):
    return patch_h * patch_w * in_channels`,
    testCases: [
      { input: [16, 16, 3], expected: 768 },
      { input: [14, 14, 1], expected: 196 },
      { input: [8, 8, 3], expected: 192 },
      { input: [4, 4, 64], expected: 1024 },
    ],
  },
  {
    id: "cv-308",
    title: "Positional Embedding Count",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Count the trainable positional embeddings a ViT needs.\n\nEach of the num_patches patch tokens gets one positional vector, and the CLS token gets one more when include_cls is True. Return (num_patches + include_cls) * dim.",
    starterCode: `def pos_embed_count(num_patches, dim, include_cls):
    # Your code here
    pass`,
    solution: `def pos_embed_count(num_patches, dim, include_cls):
    return (num_patches + (1 if include_cls else 0)) * dim`,
    testCases: [
      { input: [196, 768, true], expected: 151296 },
      { input: [49, 384, false], expected: 18816 },
      { input: [0, 768, true], expected: 768 },
      { input: [256, 192, false], expected: 49152 },
    ],
  },
  {
    id: "cv-309",
    title: "Attention Head Dimension",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Split the transformer embedding dimension across attention heads.\n\nReturn the per-head dimension dim // num_heads. You may assume dim is divisible by num_heads.",
    starterCode: `def head_dim(dim, num_heads):
    # Your code here
    pass`,
    solution: `def head_dim(dim, num_heads):
    return dim // num_heads`,
    testCases: [
      { input: [768, 12], expected: 64 },
      { input: [384, 6], expected: 64 },
      { input: [512, 8], expected: 64 },
      { input: [768, 16], expected: 48 },
    ],
    hint: "Multi-head attention keeps the total projection width equal to dim.",
  },
  {
    id: "cv-310",
    title: "ViT CLS Token Shape",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Return the tensor shape of the CLS token inside a ViT sequence.\n\nAfter patch embedding the CLS token is one token per batch element with the hidden dimension. Return [batch, 1, dim].",
    starterCode: `def cls_token_shape(batch, dim):
    # Your code here
    pass`,
    solution: `def cls_token_shape(batch, dim):
    return [batch, 1, dim]`,
    testCases: [
      { input: [8, 768], expected: [8, 1, 768] },
      { input: [1, 384], expected: [1, 1, 384] },
      { input: [2, 128], expected: [2, 1, 128] },
    ],
  },
  {
    id: "cv-311",
    title: "Shifted Window Partition Count",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Count the windows a Swin window partition produces, including the shifted partition.\n\nThe image is padded to a multiple of window and every position belongs to exactly one window, so the count is ceil(h / window) * ceil(w / window). Return that integer.",
    starterCode: `def window_partition_count(h, w, window):
    # Your code here
    pass`,
    solution: `def window_partition_count(h, w, window):
    rows = (h + window - 1) // window
    cols = (w + window - 1) // window
    return rows * cols`,
    testCases: [
      { input: [14, 14, 7], expected: 4 },
      { input: [16, 16, 7], expected: 9 },
      { input: [224, 224, 7], expected: 1024 },
      { input: [8, 4, 4], expected: 2 },
    ],
  },
  {
    id: "cv-312",
    title: "Patch Merging Output Size",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the output shape of a Swin patch-merging layer.\n\nEach 2 x 2 block of an h x w x channels map is concatenated into 4 * channels features at half the spatial resolution, using ceiling division for odd sizes. Return [out_h, out_w, out_channels].",
    starterCode: `def patch_merge_output(h, w, channels):
    # Your code here
    pass`,
    solution: `def patch_merge_output(h, w, channels):
    return [(h + 1) // 2, (w + 1) // 2, channels * 4]`,
    testCases: [
      { input: [224, 224, 96], expected: [112, 112, 384] },
      { input: [7, 5, 1], expected: [4, 3, 4] },
      { input: [1, 1, 32], expected: [1, 1, 128] },
      { input: [56, 56, 96], expected: [28, 28, 384] },
    ],
  },
  {
    id: "cv-313",
    title: "Pairwise IoU Matrix",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the IoU of every box in boxes_a against every box in boxes_b.\n\nBoxes use [x1, y1, x2, y2] with continuous coordinates. Return a len(boxes_a) x len(boxes_b) matrix of IoUs rounded to 4 decimal places; non-overlapping or degenerate pairs score 0.0.",
    starterCode: `def iou_matrix(boxes_a, boxes_b):
    # Your code here
    pass`,
    solution: `def iou_matrix(boxes_a, boxes_b):
    out = []
    for a in boxes_a:
        row = []
        for b in boxes_b:
            ix1 = max(a[0], b[0])
            iy1 = max(a[1], b[1])
            ix2 = min(a[2], b[2])
            iy2 = min(a[3], b[3])
            iw = ix2 - ix1
            ih = iy2 - iy1
            inter = 0.0 if iw <= 0 or ih <= 0 else iw * ih
            union = (a[2] - a[0]) * (a[3] - a[1]) + (b[2] - b[0]) * (b[3] - b[1]) - inter
            row.append(round(inter / union, 4) if union > 0 else 0.0)
        out.append(row)
    return out`,
    testCases: [
      { input: [[[0, 0, 2, 2], [1, 1, 3, 3]], [[0, 0, 2, 2], [4, 4, 6, 6]]], expected: [[1.0, 0.0], [0.1429, 0.0]] },
      { input: [[[0, 0, 1, 1]], []], expected: [[]] },
      { input: [[[0, 0, 2, 2]], [[0, 0, 2, 2], [2, 2, 4, 4], [1, 1, 2, 2]]], expected: [[1.0, 0.0, 0.25]] },
    ],
  },
  {
    id: "cv-314",
    title: "Generalized IoU",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the generalized IoU (GIoU) of two boxes.\n\nGIoU = IoU - (C - union) / C, where C is the area of the smallest axis-aligned box enclosing both boxes. Return the value rounded to 4 decimal places, or 0.0 when the union is empty.",
    starterCode: `def giou(box_a, box_b):
    # Your code here
    pass`,
    solution: `def giou(box_a, box_b):
    ax1, ay1, ax2, ay2 = box_a
    bx1, by1, bx2, by2 = box_b
    ix1 = max(ax1, bx1)
    iy1 = max(ay1, by1)
    ix2 = min(ax2, bx2)
    iy2 = min(ay2, by2)
    iw = ix2 - ix1
    ih = iy2 - iy1
    inter = 0.0 if iw <= 0 or ih <= 0 else iw * ih
    union = (ax2 - ax1) * (ay2 - ay1) + (bx2 - bx1) * (by2 - by1) - inter
    if union <= 0:
        return 0.0
    cx1 = min(ax1, bx1)
    cy1 = min(ay1, by1)
    cx2 = max(ax2, bx2)
    cy2 = max(ay2, by2)
    c_area = (cx2 - cx1) * (cy2 - cy1)
    if c_area <= 0:
        return 0.0
    return round(inter / union - (c_area - union) / c_area, 4)`,
    testCases: [
      { input: [[0, 0, 2, 2], [0, 0, 2, 2]], expected: 1.0 },
      { input: [[0, 0, 2, 2], [3, 3, 5, 5]], expected: -0.68 },
      { input: [[0, 0, 2, 2], [1, 1, 3, 3]], expected: -0.0794 },
      { input: [[0, 0, 4, 4], [0, 0, 2, 2]], expected: 0.25 },
    ],
    hint: "GIoU is 1 for identical boxes and approaches -1 for far-apart boxes.",
  },
  {
    id: "cv-315",
    title: "DIoU Center Penalty",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the center-distance penalty of distance IoU (DIoU).\n\nThe penalty is rho^2 / c^2, where rho^2 is the squared distance between the box centers and c^2 is the squared diagonal length of the smallest enclosing box. Return it rounded to 4 decimal places, or 0.0 when the enclosing diagonal is zero.",
    starterCode: `def diou_penalty(box_a, box_b):
    # Your code here
    pass`,
    solution: `def diou_penalty(box_a, box_b):
    ax1, ay1, ax2, ay2 = box_a
    bx1, by1, bx2, by2 = box_b
    acx = (ax1 + ax2) / 2.0
    acy = (ay1 + ay2) / 2.0
    bcx = (bx1 + bx2) / 2.0
    bcy = (by1 + by2) / 2.0
    rho2 = (acx - bcx) ** 2 + (acy - bcy) ** 2
    cx1 = min(ax1, bx1)
    cy1 = min(ay1, by1)
    cx2 = max(ax2, bx2)
    cy2 = max(ay2, by2)
    c2 = (cx2 - cx1) ** 2 + (cy2 - cy1) ** 2
    if c2 == 0:
        return 0.0
    return round(rho2 / c2, 4)`,
    testCases: [
      { input: [[0, 0, 2, 2], [0, 0, 2, 2]], expected: 0.0 },
      { input: [[0, 0, 2, 2], [2, 2, 4, 4]], expected: 0.25 },
      { input: [[0, 0, 1, 1], [1, 1, 2, 2]], expected: 0.25 },
      { input: [[0, 0, 2, 2], [1, 1, 3, 3]], expected: 0.1111 },
    ],
  },
  {
    id: "cv-316",
    title: "CIoU Aspect Term",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Compute the aspect-ratio term of complete IoU (CIoU) and its trade-off weight.\n\nWith w and h the box sides, v = (4 / pi^2) * (atan(w_b / h_b) - atan(w_a / h_a))^2 and alpha = v / ((1 - IoU) + v). Return [v, alpha] rounded to 4 decimal places; use alpha = 0.0 when the denominator is zero.",
    starterCode: `def ciou_aspect_term(box_a, box_b):
    # Your code here
    pass`,
    solution: `def ciou_aspect_term(box_a, box_b):
    import math
    ax1, ay1, ax2, ay2 = box_a
    bx1, by1, bx2, by2 = box_b
    aw = ax2 - ax1
    ah = ay2 - ay1
    bw = bx2 - bx1
    bh = by2 - by1
    v = (4.0 / (math.pi ** 2)) * (math.atan(bw / bh) - math.atan(aw / ah)) ** 2
    ix1 = max(ax1, bx1)
    iy1 = max(ay1, by1)
    ix2 = min(ax2, bx2)
    iy2 = min(ay2, by2)
    iw = ix2 - ix1
    ih = iy2 - iy1
    inter = 0.0 if iw <= 0 or ih <= 0 else iw * ih
    union = aw * ah + bw * bh - inter
    iou = inter / union if union > 0 else 0.0
    denom = (1 - iou) + v
    alpha = v / denom if denom != 0 else 0.0
    return [round(v, 4), round(alpha, 4)]`,
    testCases: [
      { input: [[0, 0, 2, 2], [0, 0, 2, 2]], expected: [0.0, 0.0] },
      { input: [[0, 0, 2, 2], [0, 0, 4, 1]], expected: [0.1184, 0.1508] },
      { input: [[0, 0, 2, 2], [1, 1, 3, 3]], expected: [0.0, 0.0] },
      { input: [[0, 0, 4, 2], [0, 0, 2, 4]], expected: [0.1678, 0.2011] },
    ],
  },
  {
    id: "cv-317",
    title: "NMS Suppressed Indices",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Run greedy non-maximum suppression and report which boxes were suppressed.\n\nProcess boxes by descending score (ties by smaller index) and suppress a box when its IoU with an already kept box is strictly greater than iou_threshold. Return the suppressed box indices sorted ascending.",
    starterCode: `def nms_suppressed(boxes, scores, iou_threshold):
    # Your code here
    pass`,
    solution: `def nms_suppressed(boxes, scores, iou_threshold):
    order = sorted(range(len(boxes)), key=lambda i: (-scores[i], i))
    kept = []
    suppressed = []
    for i in order:
        ok = True
        for j in kept:
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
            kept.append(i)
        else:
            suppressed.append(i)
    return sorted(suppressed)`,
    testCases: [
      { input: [[[0, 0, 2, 2], [1, 1, 3, 3], [10, 10, 12, 12]], [0.9, 0.8, 0.7], 0.1], expected: [1] },
      { input: [[[0, 0, 2, 2], [1, 1, 3, 3], [10, 10, 12, 12]], [0.9, 0.8, 0.7], 0.9], expected: [] },
      { input: [[[0, 0, 2, 2], [0, 0, 2, 2], [0, 0, 2, 2]], [0.9, 0.8, 0.7], 0.5], expected: [1, 2] },
      { input: [[], [], 0.5], expected: [] },
    ],
  },
  {
    id: "cv-318",
    title: "Soft-NMS Gaussian Weights",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the Gaussian soft-NMS decay weights of candidate boxes relative to a kept box.\n\nEach weight is exp(-IoU^2 / sigma), so overlapping neighbors keep a shrunken score instead of being deleted. Return the weights in order rounded to 4 decimal places; a non-positive sigma gives 0.0.",
    starterCode: `def soft_nms_gaussian_weights(box, boxes, sigma):
    # Your code here
    pass`,
    solution: `def soft_nms_gaussian_weights(box, boxes, sigma):
    import math
    out = []
    for b in boxes:
        ix1 = max(box[0], b[0])
        iy1 = max(box[1], b[1])
        ix2 = min(box[2], b[2])
        iy2 = min(box[3], b[3])
        iw = ix2 - ix1
        ih = iy2 - iy1
        inter = 0.0 if iw <= 0 or ih <= 0 else iw * ih
        union = (box[2] - box[0]) * (box[3] - box[1]) + (b[2] - b[0]) * (b[3] - b[1]) - inter
        v = inter / union if union > 0 else 0.0
        out.append(round(math.exp(-(v * v) / sigma), 4) if sigma > 0 else 0.0)
    return out`,
    testCases: [
      { input: [[0, 0, 2, 2], [[0, 0, 2, 2], [0, 0, 4, 4], [10, 0, 12, 2]], 0.5], expected: [0.1353, 0.8825, 1.0] },
      { input: [[0, 0, 2, 2], [[1, 1, 3, 3], [0, 0, 1, 1]], 1.0], expected: [0.9798, 0.9394] },
      { input: [[0, 0, 2, 2], [], 0.5], expected: [] },
      { input: [[0, 0, 2, 2], [[0, 0, 2, 2]], 0.0], expected: [0.0] },
    ],
  },
  {
    id: "cv-319",
    title: "mAP at IoU Threshold",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Compute average precision for one class at a single IoU threshold.\n\nSort detections by descending score (ties by index) and match each to its highest-IoU ground-truth box; it is a true positive only when that IoU is at least iou_threshold and the ground truth is still unmatched. detections is a list of [box, score]. AP is the sum of precision at each true positive divided by the number of ground truths, rounded to 4 decimal places; return 0.0 with no ground truths.",
    starterCode: `def map_at_iou(detections, gt_boxes, iou_threshold):
    # Your code here
    pass`,
    solution: `def map_at_iou(detections, gt_boxes, iou_threshold):
    if not gt_boxes:
        return 0.0
    order = sorted(range(len(detections)), key=lambda i: (-detections[i][1], i))
    matched = [False] * len(gt_boxes)
    tp = 0
    total = 0.0
    for rank, i in enumerate(order):
        box = detections[i][0]
        best_iou = -1.0
        best_g = -1
        for g, gt in enumerate(gt_boxes):
            ix1 = max(box[0], gt[0])
            iy1 = max(box[1], gt[1])
            ix2 = min(box[2], gt[2])
            iy2 = min(box[3], gt[3])
            iw = ix2 - ix1
            ih = iy2 - iy1
            inter = 0.0 if iw <= 0 or ih <= 0 else iw * ih
            union = (box[2] - box[0]) * (box[3] - box[1]) + (gt[2] - gt[0]) * (gt[3] - gt[1]) - inter
            v = inter / union if union > 0 else 0.0
            if v > best_iou:
                best_iou = v
                best_g = g
        if best_iou >= iou_threshold and best_g >= 0 and not matched[best_g]:
            matched[best_g] = True
            tp += 1
            total += tp / (rank + 1)
    return round(total / len(gt_boxes), 4)`,
    testCases: [
      { input: [[[[0, 0, 2, 2], 0.95], [[10, 10, 12, 12], 0.9], [[1, 1, 3, 3], 0.8]], [[0, 0, 2, 2], [10, 10, 12, 12]], 0.5], expected: 1.0 },
      { input: [[[[0, 0, 2, 2], 0.9], [[0, 0, 2, 2], 0.8]], [[0, 0, 2, 2]], 0.5], expected: 1.0 },
      { input: [[[[0, 0, 2, 2], 0.9]], [], 0.5], expected: 0.0 },
      { input: [[], [[0, 0, 2, 2]], 0.5], expected: 0.0 },
    ],
  },
  {
    id: "cv-320",
    title: "11-Point Interpolated AP",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Compute the 11-point interpolated average precision (VOC 2007 style) from score-ordered labels.\n\nFor recall levels 0.0, 0.1, ..., 1.0 take the maximum precision achieved at a recall of at least that level; labels[k] is 1 for a positive and 0 otherwise, already sorted by descending score. Return the mean of the 11 values rounded to 4 decimal places, or 0.0 when there are no positives.",
    starterCode: `def ap_11_point(labels):
    # Your code here
    pass`,
    solution: `def ap_11_point(labels):
    pos = sum(labels)
    if pos == 0:
        return 0.0
    precisions = []
    recalls = []
    tp = 0
    for k, v in enumerate(labels):
        if v == 1:
            tp += 1
        precisions.append(tp / (k + 1))
        recalls.append(tp / pos)
    total = 0.0
    for i in range(11):
        r = i / 10.0
        best = 0.0
        for p, rc in zip(precisions, recalls):
            if rc >= r and p > best:
                best = p
        total += best
    return round(total / 11.0, 4)`,
    testCases: [
      { input: [[1, 0, 1, 1, 0]], expected: 0.8409 },
      { input: [[0, 0, 0]], expected: 0.0 },
      { input: [[1, 1, 0, 0, 1]], expected: 0.8545 },
      { input: [[1]], expected: 1.0 },
    ],
  },
  {
    id: "cv-321",
    title: "Anchor Count per Level",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Count the anchors each feature level of a detector produces.\n\nA level with an h x w map and anchors_per_cell anchors per location contributes h * w * anchors_per_cell anchors. Return the list of counts in the same order as feature_sizes.",
    starterCode: `def anchor_counts_per_level(feature_sizes, anchors_per_cell):
    # Your code here
    pass`,
    solution: `def anchor_counts_per_level(feature_sizes, anchors_per_cell):
    return [h * w * anchors_per_cell for h, w in feature_sizes]`,
    testCases: [
      { input: [[[38, 38], [19, 19], [10, 10], [5, 5], [3, 3], [1, 1]], 6], expected: [8664, 2166, 600, 150, 54, 6] },
      { input: [[[2, 3], [1, 1]], 4], expected: [24, 4] },
      { input: [[[4, 4]], 2], expected: [32] },
    ],
  },
  {
    id: "cv-322",
    title: "Anchor Label Assignment",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Assign Faster R-CNN style labels to anchors. An anchor is positive (1) when its best IoU over the ground truths is at least pos_threshold and negative (0) when it is below neg_threshold, otherwise it is ignored (-1).\n\nEvery ground-truth box additionally forces its best-matching anchor to be positive, keeping the smallest anchor index on ties. Return the labels.",
    starterCode: `def assign_anchor_labels(anchors, gt_boxes, pos_threshold, neg_threshold):
    # Your code here
    pass`,
    solution: `def assign_anchor_labels(anchors, gt_boxes, pos_threshold, neg_threshold):
    n = len(anchors)
    best_ious = []
    best_gts = []
    for a in anchors:
        bi = 0.0
        bg = -1
        for g, gt in enumerate(gt_boxes):
            ix1 = max(a[0], gt[0])
            iy1 = max(a[1], gt[1])
            ix2 = min(a[2], gt[2])
            iy2 = min(a[3], gt[3])
            iw = ix2 - ix1
            ih = iy2 - iy1
            inter = 0.0 if iw <= 0 or ih <= 0 else iw * ih
            union = (a[2] - a[0]) * (a[3] - a[1]) + (gt[2] - gt[0]) * (gt[3] - gt[1]) - inter
            v = inter / union if union > 0 else 0.0
            if v > bi:
                bi = v
                bg = g
        best_ious.append(bi)
        best_gts.append(bg)
    labels = []
    for i in range(n):
        if best_ious[i] >= pos_threshold:
            labels.append(1)
        elif best_ious[i] < neg_threshold:
            labels.append(0)
        else:
            labels.append(-1)
    for g in range(len(gt_boxes)):
        best_i = -1
        best_v = -1.0
        for i in range(n):
            if best_gts[i] == g and best_ious[i] > best_v:
                best_v = best_ious[i]
                best_i = i
        if best_i != -1:
            labels[best_i] = 1
    return labels`,
    testCases: [
      { input: [[[0, 0, 2, 2], [10, 10, 12, 12], [0.5, 0.5, 2.5, 2.5]], [[0, 0, 2, 2]], 0.5, 0.3], expected: [1, 0, -1] },
      { input: [[[0, 0, 2, 2], [0, 0, 1, 1]], [[0, 0, 2, 2], [10, 10, 12, 12]], 0.5, 0.4], expected: [1, 0] },
      { input: [[[5, 5, 6, 6]], [[0, 0, 1, 1]], 0.5, 0.3], expected: [0] },
    ],
  },
  {
    id: "cv-323",
    title: "RPN Sample Counts",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Compute how many positive and negative anchors an RPN mini-batch samples.\n\nTake min(positives, batch_size // 2) positives, then fill the rest of the batch with min(negatives, batch_size - positives) negatives. labels uses 1 for positive, 0 for negative and -1 for ignored anchors. Return [num_pos, num_neg].",
    starterCode: `def rpn_sample_counts(labels, batch_size):
    # Your code here
    pass`,
    solution: `def rpn_sample_counts(labels, batch_size):
    num_pos = sum(1 for v in labels if v == 1)
    num_neg = sum(1 for v in labels if v == 0)
    pos = min(num_pos, batch_size // 2)
    neg = min(num_neg, batch_size - pos)
    return [pos, neg]`,
    testCases: [
      { input: [[1, 0, 0, 0, 0, 0, -1], 4], expected: [1, 3] },
      { input: [[1, 1, 0, 0, -1, 0], 4], expected: [2, 2] },
      { input: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 8], expected: [0, 8] },
      { input: [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1], 5], expected: [2, 0] },
    ],
  },
  {
    id: "cv-324",
    title: "Alpha-Balanced Focal Loss",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the alpha-balanced binary focal loss for a single prediction.\n\nWith p_t = prob when target is 1 and 1 - prob otherwise, and alpha_t = alpha for positives and 1 - alpha for negatives, the loss is -alpha_t * (1 - p_t)^gamma * log(p_t). Clamp p_t to at least 1e-12 and round to 4 decimal places.",
    starterCode: `def focal_loss_alpha(prob, target, gamma, alpha):
    # Your code here
    pass`,
    solution: `def focal_loss_alpha(prob, target, gamma, alpha):
    import math
    p_t = prob if target == 1 else 1 - prob
    p_t = max(p_t, 1e-12)
    a_t = alpha if target == 1 else 1 - alpha
    return round(-a_t * ((1 - p_t) ** gamma) * math.log(p_t) + 0.0, 4)`,
    testCases: [
      { input: [0.9, 1, 2, 0.25], expected: 0.0003 },
      { input: [0.5, 0, 2, 0.25], expected: 0.13 },
      { input: [0.1, 1, 0, 0.75], expected: 1.7269 },
      { input: [1.0, 1, 2, 0.25], expected: 0.0 },
    ],
  },
  {
    id: "cv-325",
    title: "RoI Align Sample Points",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the sampling coordinates used by RoI Align. Each pooled cell is split into sampling_ratio x sampling_ratio sub-cells and a point is sampled at every sub-cell center.\n\nFor pooled cell (ph, pw) the point is y = y1 + (ph + (sy + 0.5) / sampling_ratio) * roi_h / pooled_size and x = x1 + (pw + (sx + 0.5) / sampling_ratio) * roi_w / pooled_size, where roi_h = y2 - y1 and roi_w = x2 - x1. Return the [y, x] points ordered by pooled cell row-major, then sy, then sx, rounded to 4 decimal places.",
    starterCode: `def roi_align_points(roi, pooled_size, sampling_ratio):
    # Your code here
    pass`,
    solution: `def roi_align_points(roi, pooled_size, sampling_ratio):
    x1, y1, x2, y2 = roi
    roi_h = y2 - y1
    roi_w = x2 - x1
    out = []
    for ph in range(pooled_size):
        for pw in range(pooled_size):
            for sy in range(sampling_ratio):
                py = y1 + (ph + (sy + 0.5) / sampling_ratio) * roi_h / pooled_size
                for sx in range(sampling_ratio):
                    px = x1 + (pw + (sx + 0.5) / sampling_ratio) * roi_w / pooled_size
                    out.append([round(py, 4), round(px, 4)])
    return out`,
    testCases: [
      { input: [[0, 0, 4, 4], 2, 2], expected: [[0.5, 0.5], [0.5, 1.5], [1.5, 0.5], [1.5, 1.5], [0.5, 2.5], [0.5, 3.5], [1.5, 2.5], [1.5, 3.5], [2.5, 0.5], [2.5, 1.5], [3.5, 0.5], [3.5, 1.5], [2.5, 2.5], [2.5, 3.5], [3.5, 2.5], [3.5, 3.5]] },
      { input: [[0, 0, 5, 3], 2, 1], expected: [[0.75, 1.25], [0.75, 3.75], [2.25, 1.25], [2.25, 3.75]] },
      { input: [[1, 2, 4, 6], 1, 2], expected: [[3.0, 1.75], [3.0, 3.25], [5.0, 1.75], [5.0, 3.25]] },
    ],
  },
  {
    id: "cv-326",
    title: "FPN Level Assignment",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Assign a region of interest to an FPN level from its size.\n\nThe standard rule is k = k0 + floor(log2(sqrt(h * w) / 224)), where 224 is the canonical image size. Return the integer level, or k0 when the region has non-positive dimensions.",
    starterCode: `def fpn_level(roi_h, roi_w, k0):
    # Your code here
    pass`,
    solution: `def fpn_level(roi_h, roi_w, k0):
    import math
    if roi_h <= 0 or roi_w <= 0:
        return k0
    return k0 + int(math.floor(math.log2(math.sqrt(roi_h * roi_w) / 224.0)))`,
    testCases: [
      { input: [224, 224, 4], expected: 4 },
      { input: [112, 112, 4], expected: 3 },
      { input: [448, 448, 4], expected: 5 },
      { input: [100, 400, 3], expected: 2 },
      { input: [32, 32, 4], expected: 1 },
    ],
  },
  {
    id: "cv-327",
    title: "FPN Lateral Parameter Count",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Count the parameters of the 1x1 lateral convolutions in an FPN.\n\nEach level has a c_in to fpn_dim convolution with a bias, contributing c_in * fpn_dim + fpn_dim parameters. Return the total over all backbone channels.",
    starterCode: `def fpn_lateral_params(backbone_channels, fpn_dim):
    # Your code here
    pass`,
    solution: `def fpn_lateral_params(backbone_channels, fpn_dim):
    total = 0
    for c in backbone_channels:
        total += c * fpn_dim + fpn_dim
    return total`,
    testCases: [
      { input: [[256, 512, 1024, 2048], 256], expected: 984064 },
      { input: [[64], 16], expected: 1040 },
      { input: [[32, 64, 128], 32], expected: 7264 },
    ],
  },
  {
    id: "cv-328",
    title: "U-Net Skip Concatenation Channels",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Compute the channel count after each U-Net skip concatenation.\n\nAt every level the upsampled decoder feature with decoder_channels[i] channels is concatenated with the encoder skip with encoder_channels[i] channels. Return the concatenated channel counts in order.",
    starterCode: `def unet_skip_channels(encoder_channels, decoder_channels):
    # Your code here
    pass`,
    solution: `def unet_skip_channels(encoder_channels, decoder_channels):
    return [e + d for e, d in zip(encoder_channels, decoder_channels)]`,
    testCases: [
      { input: [[64, 128, 256, 512], [512, 256, 128, 64]], expected: [576, 384, 384, 576] },
      { input: [[16], [32]], expected: [48] },
      { input: [[32, 64], [64, 32]], expected: [96, 96] },
    ],
  },
  {
    id: "cv-329",
    title: "Transposed Conv with Output Padding",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Compute the spatial output size of a transposed convolution including output padding.\n\nout = (n - 1) * stride - 2 * pad + k + output_padding per dimension, where output_padding < stride resolves ambiguous output sizes. Given h, w, kernel size k, stride, pad and output_padding, return [out_h, out_w].",
    starterCode: `def transposed_conv_out_padded(h, w, k, stride, pad, output_padding):
    # Your code here
    pass`,
    solution: `def transposed_conv_out_padded(h, w, k, stride, pad, output_padding):
    return [(h - 1) * stride - 2 * pad + k + output_padding,
            (w - 1) * stride - 2 * pad + k + output_padding]`,
    testCases: [
      { input: [7, 7, 3, 2, 1, 1], expected: [14, 14] },
      { input: [4, 4, 3, 1, 0, 0], expected: [6, 6] },
      { input: [5, 10, 3, 2, 0, 1], expected: [12, 22] },
    ],
  },
  {
    id: "cv-330",
    title: "Macro Multiclass Dice",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the macro-averaged Dice coefficient over classes.\n\nFor each class Dice = 2 * intersection / (predicted + target), counted over pixels; classes whose denominator is zero are skipped. Return the mean over the remaining classes rounded to 4 decimal places, or 0.0 when every class is empty.",
    starterCode: `def macro_dice(pred, target, num_classes):
    # Your code here
    pass`,
    solution: `def macro_dice(pred, target, num_classes):
    total = 0.0
    counted = 0
    for c in range(num_classes):
        inter = 0
        denom = 0
        for i in range(len(pred)):
            for j in range(len(pred[0])):
                p = 1 if pred[i][j] == c else 0
                t = 1 if target[i][j] == c else 0
                if p and t:
                    inter += 1
                denom += p + t
        if denom == 0:
            continue
        total += 2.0 * inter / denom
        counted += 1
    if counted == 0:
        return 0.0
    return round(total / counted, 4)`,
    testCases: [
      { input: [[[0, 1], [2, 2]], [[0, 1], [2, 2]], 3], expected: 1.0 },
      { input: [[[0, 0], [1, 1]], [[0, 1], [1, 0]], 2], expected: 0.5 },
      { input: [[[0, 0]], [[0, 0]], 2], expected: 1.0 },
    ],
  },
  {
    id: "cv-331",
    title: "Segmentation IoU with Ignore Label",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute foreground IoU while ignoring pixels whose target equals ignore. Remaining pixels contribute to the intersection when both maps are 1 and to the union when either map is 1.\n\nReturn intersection / union rounded to 4 decimal places, or 0.0 when the union is empty.",
    starterCode: `def seg_iou_ignore(pred, target, ignore):
    # Your code here
    pass`,
    solution: `def seg_iou_ignore(pred, target, ignore):
    inter = 0
    union = 0
    for i in range(len(pred)):
        for j in range(len(pred[0])):
            if target[i][j] == ignore:
                continue
            p = pred[i][j] == 1
            t = target[i][j] == 1
            if p and t:
                inter += 1
            if p or t:
                union += 1
    if union == 0:
        return 0.0
    return round(inter / union, 4)`,
    testCases: [
      { input: [[[1, 0], [1, 1]], [[1, 1], [1, -1]], -1], expected: 0.6667 },
      { input: [[[0, 0], [0, 0]], [[0, 0], [1, 1]], -1], expected: 0.0 },
      { input: [[[1, 1]], [[1, 1]], -1], expected: 1.0 },
      { input: [[[0, 1]], [[-1, -1]], -1], expected: 0.0 },
    ],
  },
  {
    id: "cv-332",
    title: "Pixel Accuracy with Ignore",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Compute pixel accuracy while ignoring pixels whose target equals ignore.\n\nReturn the fraction of the remaining pixels where pred equals target, rounded to 4 decimal places. Return 0.0 when every pixel is ignored.",
    starterCode: `def pixel_accuracy_ignore(pred, target, ignore):
    # Your code here
    pass`,
    solution: `def pixel_accuracy_ignore(pred, target, ignore):
    correct = 0
    total = 0
    for i in range(len(pred)):
        for j in range(len(pred[0])):
            if target[i][j] == ignore:
                continue
            total += 1
            if pred[i][j] == target[i][j]:
                correct += 1
    if total == 0:
        return 0.0
    return round(correct / total, 4)`,
    testCases: [
      { input: [[[1, 2], [3, 4]], [[1, 0], [3, -1]], -1], expected: 0.6667 },
      { input: [[[0, 0]], [[-1, -1]], -1], expected: 0.0 },
      { input: [[[5, 5], [5, 5]], [[5, 5], [5, 5]], -1], expected: 1.0 },
    ],
  },
  {
    id: "cv-333",
    title: "Class-Weighted Segmentation Loss",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the mean class-weighted cross-entropy over a segmentation probability map.\n\nEach pixel with target class c contributes -weights[c] * log(probs[i][j][c]), with the probability clamped to at least 1e-12. Return the mean over all pixels rounded to 4 decimal places.",
    starterCode: `def weighted_seg_loss(probs, target, weights):
    # Your code here
    pass`,
    solution: `def weighted_seg_loss(probs, target, weights):
    import math
    total = 0.0
    n = 0
    for i in range(len(probs)):
        for j in range(len(probs[0])):
            c = target[i][j]
            p = max(probs[i][j][c], 1e-12)
            total += -weights[c] * math.log(p)
            n += 1
    return round(total / n, 4)`,
    testCases: [
      { input: [[[[0.8, 0.2], [0.1, 0.9]]], [[0, 1]], [1, 2]], expected: 0.2169 },
      { input: [[[[1.0, 0.0]]], [[0]], [3, 1]], expected: 0.0 },
      { input: [[[[0.5, 0.5], [0.5, 0.5]]], [[0, 0]], [2, 0]], expected: 1.3863 },
    ],
  },
  {
    id: "cv-334",
    title: "Receptive Field Growth Trace",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Trace how the receptive field grows through a stack of convolutions.\n\nStarting from rf = 1 and jump = 1, each layer performs rf += (kernel - 1) * jump and then jump *= stride. Return the list of receptive field sizes after every layer; kernels and strides have equal length.",
    starterCode: `def receptive_field_trace(kernels, strides):
    # Your code here
    pass`,
    solution: `def receptive_field_trace(kernels, strides):
    rf = 1
    jump = 1
    out = []
    for k, s in zip(kernels, strides):
        rf += (k - 1) * jump
        jump *= s
        out.append(rf)
    return out`,
    testCases: [
      { input: [[3], [1]], expected: [3] },
      { input: [[3, 3], [1, 1]], expected: [3, 5] },
      { input: [[3, 3, 3], [2, 2, 2]], expected: [3, 7, 15] },
      { input: [[5, 3], [2, 1]], expected: [5, 9] },
    ],
  },
  {
    id: "cv-335",
    title: "Diffusion Forward Noising",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Apply the closed-form DDPM forward noising step and report the cumulative alpha bar.\n\nThe cumulative alpha bar is the product of (1 - beta) over betas, and x_t = sqrt(alpha_bar) * x0 + sqrt(1 - alpha_bar) * noise. Return [round(x_t, 4), round(alpha_bar, 4)].",
    starterCode: `def diffusion_forward(x0, betas, noise):
    # Your code here
    pass`,
    solution: `def diffusion_forward(x0, betas, noise):
    import math
    ab = 1.0
    for b in betas:
        ab *= (1.0 - b)
    x_t = math.sqrt(ab) * x0 + math.sqrt(1.0 - ab) * noise
    return [round(x_t, 4), round(ab, 4)]`,
    testCases: [
      { input: [1.0, [0.1], 0.0], expected: [0.9487, 0.9] },
      { input: [1.0, [0.1], 1.0], expected: [1.2649, 0.9] },
      { input: [2.0, [0.01, 0.02, 0.04], -1.0], expected: [1.6682, 0.9314] },
      { input: [0.5, [0.5, 0.5], 0.5], expected: [0.683, 0.25] },
    ],
  },
  {
    id: "cv-336",
    title: "Cosine Alpha Bar Schedule",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Evaluate the improved cosine noise schedule at a given timestep.\n\nalpha_bar(t) = cos((t / T + s) / (1 + s) * pi / 2)^2 divided by cos(s / (1 + s) * pi / 2)^2, where T is timesteps and s the small offset that keeps the schedule smooth near t = 0. Clamp t to at most timesteps, return 1.0 when t <= 0, and otherwise round to 6 decimal places.",
    starterCode: `def cosine_alpha_bar(t, timesteps, s):
    # Your code here
    pass`,
    solution: `def cosine_alpha_bar(t, timesteps, s):
    import math
    if t <= 0:
        return 1.0
    if t > timesteps:
        t = timesteps
    f = math.cos((t / timesteps + s) / (1 + s) * math.pi / 2)
    f0 = math.cos(s / (1 + s) * math.pi / 2)
    return round((f / f0) ** 2, 6)`,
    testCases: [
      { input: [0, 1000, 0.008], expected: 1.0 },
      { input: [500, 1000, 0.008], expected: 0.493844 },
      { input: [999, 1000, 0.008], expected: 2e-06 },
      { input: [2000, 1000, 0.008], expected: 0.0 },
    ],
  },
  {
    id: "cv-337",
    title: "DDPM Noise Target",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Recover the noise that produced x_t from x0 and the cumulative alpha bar.\n\nThe DDPM training target is eps = (x_t - sqrt(alpha_bar) * x0) / sqrt(1 - alpha_bar). Return the value rounded to 4 decimal places, or 0.0 when alpha_bar >= 1.",
    starterCode: `def ddpm_noise_target(x_t, x0, alpha_bar):
    # Your code here
    pass`,
    solution: `def ddpm_noise_target(x_t, x0, alpha_bar):
    import math
    if alpha_bar >= 1.0:
        return 0.0
    return round((x_t - math.sqrt(alpha_bar) * x0) / math.sqrt(1.0 - alpha_bar), 4)`,
    testCases: [
      { input: [0.5, 1.0, 0.9], expected: -1.4189 },
      { input: [0.0, 0.0, 0.5], expected: 0.0 },
      { input: [0.3, 0.6, 0.25], expected: 0.0 },
      { input: [1.0, 1.0, 1.0], expected: 0.0 },
    ],
  },
  {
    id: "cv-338",
    title: "CFG Guided Score",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Mix conditional and unconditional predictions with classifier-free guidance.\n\nThe guided value is uncond + scale * (cond - uncond) elementwise, where scale = 1 returns cond and scale = 0 returns uncond. Return the list rounded to 4 decimal places.",
    starterCode: `def cfg_guided(uncond, cond, scale):
    # Your code here
    pass`,
    solution: `def cfg_guided(uncond, cond, scale):
    return [round(u + scale * (c - u), 4) for u, c in zip(uncond, cond)]`,
    testCases: [
      { input: [[0.0, 0.0], [1.3, 2.5], 2.0], expected: [2.6, 5.0] },
      { input: [[0.4, -0.2], [0.9, 0.6], 1.0], expected: [0.9, 0.6] },
      { input: [[0.4, -0.2], [0.9, 0.6], 0.0], expected: [0.4, -0.2] },
      { input: [[1.0, 2.0, 3.0], [1.0, 2.0, 3.0], 7.5], expected: [1.0, 2.0, 3.0] },
    ],
  },
  {
    id: "cv-339",
    title: "CFG Variance Rescale",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Rescale a guided prediction to match the conditional prediction's standard deviation (CFG rescaling).\n\nCompute the population standard deviations of cond and guided, then multiply guided elementwise by std_cond / std_guided, rounded to 4 decimal places. If the guided deviation is zero, return guided rounded unchanged.",
    starterCode: `def cfg_rescale(cond, guided):
    # Your code here
    pass`,
    solution: `def cfg_rescale(cond, guided):
    import math
    mc = sum(cond) / len(cond)
    mg = sum(guided) / len(guided)
    vc = sum((x - mc) ** 2 for x in cond) / len(cond)
    vg = sum((x - mg) ** 2 for x in guided) / len(guided)
    if vg == 0:
        return [round(x, 4) for x in guided]
    factor = math.sqrt(vc) / math.sqrt(vg)
    return [round(x * factor, 4) for x in guided]`,
    testCases: [
      { input: [[1.0, -1.0], [3.0, 0.0]], expected: [2.0, 0.0] },
      { input: [[2.0, 0.0], [1.0, 1.0]], expected: [1.0, 1.0] },
      { input: [[0.0, 0.0, 0.0], [5.0, -5.0, 5.0]], expected: [0.0, -0.0, 0.0] },
      { input: [[1.0, 2.0, 3.0], [2.0, 4.0, 6.0]], expected: [1.0, 2.0, 3.0] },
    ],
  },
  {
    id: "cv-340",
    title: "Timestep Sinusoidal Embedding",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Build the standard sinusoidal timestep embedding used by diffusion models.\n\nFor i = 0 .. dim/2 - 1 the frequency is t / 10000^(2i / dim); the first half of the output holds its sine and the second half its cosine. Assume dim is even and return the embedding rounded to 6 decimal places.",
    starterCode: `def timestep_embedding(t, dim):
    # Your code here
    pass`,
    solution: `def timestep_embedding(t, dim):
    import math
    half = dim // 2
    out = [0.0] * dim
    for i in range(half):
        freq = t / (10000 ** (2.0 * i / dim))
        out[i] = math.sin(freq)
        out[i + half] = math.cos(freq)
    return [round(v, 6) for v in out]`,
    testCases: [
      { input: [0, 4], expected: [0.0, 0.0, 1.0, 1.0] },
      { input: [1, 4], expected: [0.841471, 0.01, 0.540302, 0.99995] },
      { input: [2, 2], expected: [0.909297, -0.416147] },
      { input: [1000, 8], expected: [0.82688, -0.506366, -0.544021, 0.841471, 0.562379, 0.862319, -0.839072, 0.540302] },
    ],
  },
  {
    id: "cv-341",
    title: "DDIM Timestep Subset",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Pick the timestep subset used by DDIM sampling.\n\nSample sample_steps timesteps evenly from 0 to total_steps - 1 inclusive with round(i * (total_steps - 1) / (sample_steps - 1)). Return the integer timesteps in increasing order; when sample_steps <= 1 return [0].",
    starterCode: `def ddim_timesteps(total_steps, sample_steps):
    # Your code here
    pass`,
    solution: `def ddim_timesteps(total_steps, sample_steps):
    if sample_steps <= 1:
        return [0]
    return [int(round(i * (total_steps - 1) / (sample_steps - 1))) for i in range(sample_steps)]`,
    testCases: [
      { input: [1000, 4], expected: [0, 333, 666, 999] },
      { input: [10, 2], expected: [0, 9] },
      { input: [3, 1], expected: [0] },
      { input: [100, 5], expected: [0, 25, 50, 74, 99] },
    ],
  },
  {
    id: "cv-342",
    title: "Unpatchify Image",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Rebuild an image from a flat list of non-overlapping patches, the inverse of patchify.\n\nPatches are in row-major order and each patch is a flat list of patch * patch pixels in row-major order. Return the h x w image; h and w are divisible by patch.",
    starterCode: `def unpatchify(patches, h, w, patch):
    # Your code here
    pass`,
    solution: `def unpatchify(patches, h, w, patch):
    img = [[0] * w for _ in range(h)]
    idx = 0
    for i in range(0, h, patch):
        for j in range(0, w, patch):
            p = patches[idx]
            idx += 1
            k = 0
            for a in range(patch):
                for b in range(patch):
                    img[i + a][j + b] = p[k]
                    k += 1
    return img`,
    testCases: [
      { input: [[[1, 2, 3, 4]], 2, 2, 2], expected: [[1, 2], [3, 4]] },
      { input: [[[0, 1, 4, 5], [2, 3, 6, 7], [8, 9, 12, 13], [10, 11, 14, 15]], 4, 4, 2], expected: [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]] },
      { input: [[[1], [2], [3], [4]], 2, 2, 1], expected: [[1, 2], [3, 4]] },
    ],
  },
  {
    id: "cv-343",
    title: "CLIP Learned Logit Scale",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Compute the CLIP logit scale from its learned parameter.\n\nCLIP parameterizes the temperature as a scalar and uses logit_scale = min(exp(raw_scale), max_scale), where the cap keeps the similarity logits from becoming too sharp (100 in the original implementation). Return the scale rounded to 4 decimal places.",
    starterCode: `def clip_logit_scale(raw_scale, max_scale):
    # Your code here
    pass`,
    solution: `def clip_logit_scale(raw_scale, max_scale):
    import math
    return round(min(math.exp(raw_scale), max_scale), 4)`,
    testCases: [
      { input: [0.0, 100.0], expected: 1.0 },
      { input: [2.302585, 100.0], expected: 10.0 },
      { input: [5.0, 100.0], expected: 100.0 },
      { input: [-4.60517, 100.0], expected: 0.01 },
    ],
  },
  {
    id: "cv-344",
    title: "CLIP Prompt Ensemble",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute zero-shot class probabilities with prompt ensembling.\n\nFor each class average its prompt embeddings, then normalize image_embed and each class mean, scale the cosine similarities by logit_scale and apply softmax. Return the class probabilities rounded to 4 decimal places.",
    starterCode: `def clip_prompt_ensemble(image_embed, class_prompts, logit_scale):
    # Your code here
    pass`,
    solution: `def clip_prompt_ensemble(image_embed, class_prompts, logit_scale):
    import math
    ni = math.sqrt(sum(v * v for v in image_embed))
    sims = []
    for prompts in class_prompts:
        d = len(prompts[0])
        mean = [sum(p[k] for p in prompts) / len(prompts) for k in range(d)]
        nm = math.sqrt(sum(v * v for v in mean))
        if ni == 0 or nm == 0:
            sims.append(0.0)
        else:
            sims.append(sum(a * b for a, b in zip(image_embed, mean)) / (ni * nm))
    logits = [s * logit_scale for s in sims]
    m = max(logits)
    exps = [math.exp(v - m) for v in logits]
    total = sum(exps)
    return [round(e / total, 4) for e in exps]`,
    testCases: [
      { input: [[1.0, 0.0], [[[1.0, 0.0], [0.8, 0.2]], [[0.0, 1.0]]], 1.0], expected: [0.7299, 0.2701] },
      { input: [[1.0, 0.0], [[[1.0, 0.0]], [[0.0, 1.0]]], 2.0], expected: [0.8808, 0.1192] },
      { input: [[1.0, 1.0], [[[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0]]], 1.0], expected: [0.5727, 0.4273] },
    ],
  },
  {
    id: "cv-345",
    title: "Mixup Label Blend",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Interpolate two label distributions with the mixup lambda.\n\nReturn lam * y_a + (1 - lam) * y_b elementwise, rounded to 4 decimal places, where lam is the mixing weight applied to the first label vector.",
    starterCode: `def mixup_labels(y_a, y_b, lam):
    # Your code here
    pass`,
    solution: `def mixup_labels(y_a, y_b, lam):
    return [round(lam * a + (1 - lam) * b, 4) for a, b in zip(y_a, y_b)]`,
    testCases: [
      { input: [[1.0, 0.0], [0.0, 1.0], 0.7], expected: [0.7, 0.3] },
      { input: [[0.2, 0.8], [0.9, 0.1], 0.25], expected: [0.725, 0.275] },
      { input: [[1.0, 0.0, 0.0], [0.0, 0.0, 1.0], 1.0], expected: [1.0, 0.0, 0.0] },
    ],
  },
  {
    id: "cv-346",
    title: "CutMix Area Lambda",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Compute the lambda implied by a CutMix box.\n\nThe pasted box covers (x2 - x1) * (y2 - y1) of an image_h x image_w image, so lam = 1 - area / (image_h * image_w), with negative side lengths counting as zero. Return the value rounded to 4 decimal places.",
    starterCode: `def cutmix_area_lambda(box, image_h, image_w):
    # Your code here
    pass`,
    solution: `def cutmix_area_lambda(box, image_h, image_w):
    w = max(0, box[2] - box[0])
    h = max(0, box[3] - box[1])
    return round(1.0 - (w * h) / (image_h * image_w), 4)`,
    testCases: [
      { input: [[0, 0, 2, 2], 4, 4], expected: 0.75 },
      { input: [[0, 0, 4, 4], 4, 4], expected: 0.0 },
      { input: [[1, 1, 2, 2], 4, 4], expected: 0.9375 },
      { input: [[3, 3, 2, 2], 4, 4], expected: 1.0 },
    ],
  },
  {
    id: "cv-347",
    title: "RandAugment Sampled Ops",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Sample a RandAugment policy for one image.\n\nSeed the random module, then draw num_layers operations with randrange(num_ops) and a magnitude index with randrange(num_magnitudes) for each. Return the list of [op_index, magnitude_index] pairs in application order.",
    starterCode: `def randaugment_ops(num_ops, num_layers, num_magnitudes, seed):
    # Your code here
    pass`,
    solution: `def randaugment_ops(num_ops, num_layers, num_magnitudes, seed):
    import random
    random.seed(seed)
    return [[random.randrange(num_ops), random.randrange(num_magnitudes)]
            for _ in range(num_layers)]`,
    testCases: [
      { input: [4, 2, 3, 0], expected: [[3, 1], [0, 1]] },
      { input: [4, 2, 3, 1], expected: [[1, 2], [0, 1]] },
      { input: [10, 3, 5, 42], expected: [[1, 0], [4, 1], [3, 1]] },
      { input: [2, 1, 2, 7], expected: [[1, 0]] },
    ],
  },
  {
    id: "cv-348",
    title: "Gram Matrix for Style Loss",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the Gram matrix of a feature map for style loss.\n\nfeatures holds one vector per position; entry (i, j) is the mean over positions of features[p][i] * features[p][j]. Return the dim x dim matrix rounded to 4 decimal places.",
    starterCode: `def style_gram_matrix(features):
    # Your code here
    pass`,
    solution: `def style_gram_matrix(features):
    n = len(features)
    d = len(features[0])
    out = []
    for i in range(d):
        row = []
        for j in range(d):
            row.append(round(sum(features[p][i] * features[p][j] for p in range(n)) / n, 4))
        out.append(row)
    return out`,
    testCases: [
      { input: [[[1, 2], [3, 4]]], expected: [[5.0, 7.0], [7.0, 10.0]] },
      { input: [[[1, 0], [0, 1], [1, 1]]], expected: [[0.6667, 0.3333], [0.3333, 0.6667]] },
      { input: [[[2, 0, 1]]], expected: [[4.0, 0.0, 2.0], [0.0, 0.0, 0.0], [2.0, 0.0, 1.0]] },
    ],
  },
  {
    id: "cv-349",
    title: "Perceptual Loss Across Layers",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute a weighted perceptual loss across several feature layers.\n\nFor each layer take the mean squared error between the two feature maps and weight it by weights[layer]. Return the sum of the weighted layer losses rounded to 4 decimal places.",
    starterCode: `def perceptual_loss(features_a, features_b, weights):
    # Your code here
    pass`,
    solution: `def perceptual_loss(features_a, features_b, weights):
    total = 0.0
    for layer, weight in enumerate(weights):
        fa = features_a[layer]
        fb = features_b[layer]
        s = 0.0
        n = 0
        for i in range(len(fa)):
            for j in range(len(fa[0])):
                s += (fa[i][j] - fb[i][j]) ** 2
                n += 1
        total += weight * (s / n)
    return round(total, 4)`,
    testCases: [
      { input: [[[[1.0, 2.0]]], [[[1.0, 4.0]]], [1.0]], expected: 2.0 },
      { input: [[[[1.0, 2.0]]], [[[1.0, 4.0]]], [0.5]], expected: 1.0 },
      { input: [[[[1.0, 1.0]], [[2.0, 2.0]]], [[[1.0, 2.0]], [[2.0, 4.0]]], [1.0, 2.0]], expected: 4.5 },
      { input: [[[[0.0]]], [[[0.0]]], [3.0]], expected: 0.0 },
    ],
  },
  {
    id: "cv-350",
    title: "TTA Probability Average",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Average the class probabilities from several test-time augmentation runs.\n\nEach prediction is a probability vector of the same length. Return the elementwise mean rounded to 4 decimal places.",
    starterCode: `def tta_average(predictions):
    # Your code here
    pass`,
    solution: `def tta_average(predictions):
    n = len(predictions)
    c = len(predictions[0])
    return [round(sum(p[k] for p in predictions) / n, 4) for k in range(c)]`,
    testCases: [
      { input: [[[0.8, 0.2], [0.6, 0.4], [0.7, 0.3]]], expected: [0.7, 0.3] },
      { input: [[[1.0, 0.0]]], expected: [1.0, 0.0] },
      { input: [[[0.1, 0.9], [0.3, 0.7]]], expected: [0.2, 0.8] },
      { input: [[[0.25, 0.25, 0.5], [0.5, 0.25, 0.25]]], expected: [0.375, 0.25, 0.375] },
    ],
  },
];
