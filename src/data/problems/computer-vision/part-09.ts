import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "cv-351",
    title: "Brightness Constraint Residual",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Evaluate the optical flow brightness constancy constraint pixelwise.\n\nFor each pixel compute the residual ix * u + iy * v + it, take its absolute value, and return the mean over all pixels rounded to 4 decimal places. ix, iy and it are H x W gradient maps and u, v are the per-pixel flow components.",
    starterCode: `def brightness_constraint_residual(ix, iy, it, u, v):
    # Your code here
    pass`,
    solution: `def brightness_constraint_residual(ix, iy, it, u, v):
    total = 0.0
    n = 0
    for i in range(len(ix)):
        for j in range(len(ix[0])):
            total += abs(ix[i][j] * u + iy[i][j] * v + it[i][j])
            n += 1
    if n == 0:
        return 0.0
    return round(total / n, 4)`,
    testCases: [
      { input: [[[1, 2], [3, 4]], [[0, 0], [0, 0]], [[-1, -2], [-3, -4]], 1.0, 0.0], expected: 0.0 },
      { input: [[[1, 0], [0, 1]], [[0, 1], [1, 0]], [[-1, -1], [-1, -1]], 2.0, 0.0], expected: 1.0 },
      { input: [[[2]], [[1]], [[0]], 1.0, 1.0], expected: 3.0 },
      { input: [[[1]], [[1]], [[-2]], 0.5, 1.0], expected: 0.5 },
    ],
    hint: "The brightness constraint is zero when the flow exactly explains the temporal change.",
  },
  {
    id: "cv-352",
    title: "Lucas-Kanade Window Sum",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Accumulate the sums that build the Lucas-Kanade structure matrix over one window.\n\nReturn [sum(ix^2), sum(ix*iy), sum(iy^2)] over the two H x W gradient maps, each rounded to 4 decimal places. An all-zero window returns zeros.",
    starterCode: `def lk_window_sum(ix, iy):
    # Your code here
    pass`,
    solution: `def lk_window_sum(ix, iy):
    sxx = 0.0
    sxy = 0.0
    syy = 0.0
    for i in range(len(ix)):
        for j in range(len(ix[0])):
            gx = ix[i][j]
            gy = iy[i][j]
            sxx += gx * gx
            sxy += gx * gy
            syy += gy * gy
    return [round(sxx, 4), round(sxy, 4), round(syy, 4)]`,
    testCases: [
      { input: [[[1, 2], [3, 4]], [[1, 1], [1, 1]]], expected: [30.0, 10.0, 4.0] },
      { input: [[[1, 0], [-1, 0]], [[0, 1], [0, -1]]], expected: [2.0, 0.0, 2.0] },
      { input: [[[2]], [[3]]], expected: [4.0, 6.0, 9.0] },
      { input: [[[0, 0], [0, 0]], [[0, 0], [0, 0]]], expected: [0.0, 0.0, 0.0] },
    ],
    hint: "These three sums form the symmetric 2x2 matrix inverted by Lucas-Kanade.",
  },
  {
    id: "cv-353",
    title: "RAFT Correlation Volume Size",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Count the entries of a RAFT-style 4D correlation volume pyramid.\n\nLevel l correlates two feature maps downsampled by 2^l (each dimension floored, minimum 1), producing (hl * wl) * (hl * wl) pairs. Return the total entry count summed over the given number of levels.",
    starterCode: `def raft_correlation_size(h, w, levels):
    # Your code here
    pass`,
    solution: `def raft_correlation_size(h, w, levels):
    total = 0
    for l in range(levels):
        hl = max(1, h // (2 ** l))
        wl = max(1, w // (2 ** l))
        total += (hl * wl) * (hl * wl)
    return total`,
    testCases: [
      { input: [32, 32, 1], expected: 1048576 },
      { input: [8, 8, 3], expected: 4368 },
      { input: [16, 8, 2], expected: 17408 },
      { input: [4, 4, 4], expected: 274 },
    ],
    hint: "The single-level all-pairs volume already has (h * w)^2 entries.",
  },
  {
    id: "cv-354",
    title: "Sampled Clip Count",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Count the fixed-length clips a video yields under stride sampling.\n\nStart indices step by stride while a full window of clip_len frames still fits, so the count is (total_frames - clip_len) // stride + 1. Return 0 when the video is shorter than one clip.",
    starterCode: `def sampled_clip_count(total_frames, clip_len, stride):
    # Your code here
    pass`,
    solution: `def sampled_clip_count(total_frames, clip_len, stride):
    if total_frames < clip_len:
        return 0
    return (total_frames - clip_len) // stride + 1`,
    testCases: [
      { input: [100, 16, 8], expected: 11 },
      { input: [16, 16, 4], expected: 1 },
      { input: [15, 16, 2], expected: 0 },
      { input: [10, 4, 1], expected: 7 },
    ],
    hint: "Integer division counts the extra strides beyond the first window.",
  },
  {
    id: "cv-355",
    title: "Temporal Difference Frame Count",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Count video frame pairs separated by a fixed temporal gap.\n\nA pair (i, i + gap) is valid when i + gap is still a valid frame index, so return max(0, total_frames - gap).",
    starterCode: `def temporal_diff_count(total_frames, gap):
    # Your code here
    pass`,
    solution: `def temporal_diff_count(total_frames, gap):
    return max(0, total_frames - gap)`,
    testCases: [
      { input: [10, 1], expected: 9 },
      { input: [10, 5], expected: 5 },
      { input: [10, 10], expected: 0 },
      { input: [3, 7], expected: 0 },
    ],
    hint: "Each valid first index i in [0, total_frames - gap) gives exactly one pair.",
  },
  {
    id: "cv-356",
    title: "Action Clip Frame Count",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Compute the number of frames in an action recognition clip.\n\nA clip of clip_seconds recorded at fps frames per second contains round(fps * clip_seconds) frames. Return that integer using round-half-up.",
    starterCode: `def action_clip_frames(fps, clip_seconds):
    # Your code here
    pass`,
    solution: `def action_clip_frames(fps, clip_seconds):
    return int(fps * clip_seconds + 0.5)`,
    testCases: [
      { input: [30, 2.0], expected: 60 },
      { input: [25, 1.6], expected: 40 },
      { input: [24, 0.5], expected: 12 },
      { input: [60, 0.75], expected: 45 },
    ],
    hint: "Adding 0.5 before truncating implements round-half-up.",
  },
  {
    id: "cv-357",
    title: "3D Conv FLOPs",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Count the multiply-accumulate floating point operations of a 3D convolution.\n\nEach output element combines cin * kt * kh * kw inputs, and the factor 2 accounts for one multiply and one add. Return 2 * cin * cout * kt * kh * kw * t_out * h_out * w_out with bias excluded.",
    starterCode: `def conv3d_flops(cin, cout, kt, kh, kw, t_out, h_out, w_out):
    # Your code here
    pass`,
    solution: `def conv3d_flops(cin, cout, kt, kh, kw, t_out, h_out, w_out):
    return 2 * cin * cout * kt * kh * kw * t_out * h_out * w_out`,
    testCases: [
      { input: [3, 16, 3, 3, 3, 8, 28, 28], expected: 16257024 },
      { input: [1, 1, 1, 3, 3, 4, 10, 10], expected: 7200 },
      { input: [64, 64, 3, 3, 3, 2, 14, 14], expected: 86704128 },
      { input: [2, 4, 2, 2, 2, 3, 5, 5], expected: 9600 },
    ],
    hint: "The kernel volume is kt * kh * kw; multiply by both channel counts and the output volume.",
  },
  {
    id: "cv-358",
    title: "I3D Inflation Weight Reuse",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Inflate 2D convolution weights to 3D by temporal replication (I3D).\n\nEach 2D weight is repeated kt times along the temporal axis and divided by kt so the response magnitude is preserved. Return the flattened inflated kernel with every value rounded to 4 decimal places.",
    starterCode: `def inflate_weights(w2d, kt):
    # Your code here
    pass`,
    solution: `def inflate_weights(w2d, kt):
    out = []
    for v in w2d:
        for _ in range(kt):
            out.append(round(v / kt, 4))
    return out`,
    testCases: [
      { input: [[2.0, -4.0], 2], expected: [1.0, 1.0, -2.0, -2.0] },
      { input: [[3.0], 3], expected: [1.0, 1.0, 1.0] },
      { input: [[1.5, 0.5], 4], expected: [0.375, 0.375, 0.375, 0.375, 0.125, 0.125, 0.125, 0.125] },
      { input: [[-2.0, 2.0], 1], expected: [-2.0, 2.0] },
    ],
    hint: "Division by kt keeps a constant temporal input from amplifying the filter response.",
  },
  {
    id: "cv-359",
    title: "Two-Stream Fusion Score",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Fuse the class probabilities of a two-stream video model.\n\nReturn the elementwise blend alpha * spatial_probs + (1 - alpha) * temporal_probs, rounded to 4 decimal places. The two probability vectors have the same length.",
    starterCode: `def two_stream_fusion(spatial_probs, temporal_probs, alpha):
    # Your code here
    pass`,
    solution: `def two_stream_fusion(spatial_probs, temporal_probs, alpha):
    return [round(alpha * s + (1 - alpha) * t, 4) for s, t in zip(spatial_probs, temporal_probs)]`,
    testCases: [
      { input: [[0.8, 0.2], [0.6, 0.4], 0.5], expected: [0.7, 0.3] },
      { input: [[1.0], [0.0], 0.3], expected: [0.3] },
      { input: [[0.1, 0.9], [0.9, 0.1], 0.0], expected: [0.9, 0.1] },
      { input: [[0.2, 0.3, 0.5], [0.4, 0.4, 0.2], 1.0], expected: [0.2, 0.3, 0.5] },
    ],
    hint: "alpha = 1 keeps only the spatial stream, alpha = 0 keeps only the temporal stream.",
  },
  {
    id: "cv-360",
    title: "Temporal Pyramid Bin Sizes",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute temporal pyramid pooling bin widths.\n\nLevel l splits num_frames into 2^l segments, so its bin width is ceil(num_frames / 2^l). Return the widths for levels 0 through levels - 1 as a list of integers.",
    starterCode: `def temporal_pyramid_bins(num_frames, levels):
    # Your code here
    pass`,
    solution: `def temporal_pyramid_bins(num_frames, levels):
    return [(num_frames + (1 << l) - 1) // (1 << l) for l in range(levels)]`,
    testCases: [
      { input: [16, 4], expected: [16, 8, 4, 2] },
      { input: [10, 3], expected: [10, 5, 3] },
      { input: [1, 1], expected: [1] },
      { input: [7, 2], expected: [7, 4] },
    ],
    hint: "Ceiling division is (n + d - 1) // d with d = 2^l.",
  },
  {
    id: "cv-361",
    title: "Video ViT Token Count",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Count the tokens a video ViT consumes.\n\nA video of t frames is cut into non-overlapping tubelets of tube_t frames, and each tubelet is patchified into (h // patch) * (w // patch) spatial tokens. Add one CLS token when include_cls is True.",
    starterCode: `def video_token_count(t, h, w, tube_t, patch, include_cls):
    # Your code here
    pass`,
    solution: `def video_token_count(t, h, w, tube_t, patch, include_cls):
    n = (t // tube_t) * (h // patch) * (w // patch)
    return n + 1 if include_cls else n`,
    testCases: [
      { input: [16, 224, 224, 2, 16, true], expected: 1569 },
      { input: [8, 112, 112, 4, 16, false], expected: 98 },
      { input: [1, 32, 32, 1, 8, true], expected: 17 },
      { input: [32, 64, 96, 4, 16, false], expected: 192 },
    ],
    hint: "Time is tokenized alongside space, so the tubelet grid is (t // tube_t) x (h // patch) x (w // patch).",
  },
  {
    id: "cv-362",
    title: "Tubelet Embedding Parameters",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Count the parameters of a 3D tubelet embedding layer.\n\nA tubelet convolution uses in_ch * dim kernels of shape tube_t x patch x patch plus one bias per output channel. Return in_ch * dim * tube_t * patch * patch + dim.",
    starterCode: `def tubelet_embed_params(in_ch, dim, tube_t, patch):
    # Your code here
    pass`,
    solution: `def tubelet_embed_params(in_ch, dim, tube_t, patch):
    return in_ch * dim * tube_t * patch * patch + dim`,
    testCases: [
      { input: [3, 768, 2, 16], expected: 1180416 },
      { input: [1, 192, 1, 8], expected: 12480 },
      { input: [3, 384, 2, 14], expected: 451968 },
      { input: [2, 64, 4, 4], expected: 8256 },
    ],
    hint: "One kernel spans all input channels and produces one output channel.",
  },
  {
    id: "cv-363",
    title: "Consecutive Frame IoU",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Measure bounding box IoU between consecutive frames of one track.\n\nGiven boxes [x1, y1, x2, y2] in frame order, return the IoU of each adjacent pair rounded to 4 decimal places. A track with fewer than two boxes returns [].",
    starterCode: `def consecutive_frame_iou(boxes):
    # Your code here
    pass`,
    solution: `def consecutive_frame_iou(boxes):
    out = []
    for i in range(len(boxes) - 1):
        ax1, ay1, ax2, ay2 = boxes[i]
        bx1, by1, bx2, by2 = boxes[i + 1]
        ix1 = max(ax1, bx1)
        iy1 = max(ay1, by1)
        ix2 = min(ax2, bx2)
        iy2 = min(ay2, by2)
        iw = ix2 - ix1
        ih = iy2 - iy1
        inter = 0.0 if iw <= 0 or ih <= 0 else iw * ih
        union = (ax2 - ax1) * (ay2 - ay1) + (bx2 - bx1) * (by2 - by1) - inter
        out.append(round(inter / union, 4) if union > 0 else 0.0)
    return out`,
    testCases: [
      { input: [[[0, 0, 2, 2], [0, 0, 2, 2]]], expected: [1.0] },
      { input: [[[0, 0, 2, 2], [4, 4, 6, 6]]], expected: [0.0] },
      { input: [[[0, 0, 2, 2], [1, 0, 3, 2]]], expected: [0.3333] },
      { input: [[[0, 0, 2, 2], [1, 1, 3, 3], [4, 4, 6, 6]]], expected: [0.1429, 0.0] },
      { input: [[[0, 0, 2, 2]]], expected: [] },
    ],
    hint: "The output has exactly one fewer entry than the input track.",
  },
  {
    id: "cv-364",
    title: "Kalman Track Update",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Run the scalar Kalman measurement update for a tracked coordinate.\n\nWith prior mean x and variance p, measurement z and measurement noise r, the gain is K = p / (p + r); the updated mean is x + K * (z - x) and the updated variance is (1 - K) * p. Return [mean, variance] rounded to 4 decimal places.",
    starterCode: `def kalman_update(x, p, z, r):
    # Your code here
    pass`,
    solution: `def kalman_update(x, p, z, r):
    if p + r == 0:
        return [round(x, 4), 0.0]
    k = p / (p + r)
    return [round(x + k * (z - x), 4), round((1 - k) * p, 4)]`,
    testCases: [
      { input: [0, 1, 2, 1], expected: [1.0, 0.5] },
      { input: [5, 4, 5, 0], expected: [5.0, 0.0] },
      { input: [2, 3, 4, 9], expected: [2.5, 2.25] },
      { input: [0, 0, 1, 1], expected: [0.0, 0.0] },
    ],
    hint: "A large measurement noise r drives the gain toward zero and trusts the prior.",
  },
  {
    id: "cv-365",
    title: "Hungarian Track Assignment Cost",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Find the optimal detection-to-track assignment cost.\n\nGiven an n x n cost matrix, evaluate every permutation of columns and return [minimum total cost, assignment] where assignment[i] is the column matched to row i. Break ties by keeping the lexicographically first permutation.",
    starterCode: `def hungarian_cost(cost):
    # Your code here
    pass`,
    solution: `def hungarian_cost(cost):
    import itertools
    n = len(cost)
    best_cost = None
    best_perm = []
    for perm in itertools.permutations(range(n)):
        total = sum(cost[i][perm[i]] for i in range(n))
        if best_cost is None or total < best_cost:
            best_cost = total
            best_perm = list(perm)
    if best_cost is None:
        return [0, []]
    return [best_cost, best_perm]`,
    testCases: [
      { input: [[[1, 2], [3, 4]]], expected: [5, [0, 1]] },
      { input: [[[1, 5], [5, 1]]], expected: [2, [0, 1]] },
      { input: [[[1, 2, 3], [3, 1, 2], [2, 3, 1]]], expected: [3, [0, 1, 2]] },
      { input: [[[10, 1], [1, 10]]], expected: [2, [1, 0]] },
    ],
    hint: "n is small: permutations of range(n) give the exact optimum.",
  },
  {
    id: "cv-366",
    title: "MOTA Computation",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the multi-object tracking accuracy metric.\n\nMOTA = 1 - (fn + fp + idsw) / num_gt, where fn, fp and idsw are the false negatives, false positives and identity switches. Return the value rounded to 4 decimal places, or 0.0 when num_gt is 0.",
    starterCode: `def mota(num_gt, fn, fp, idsw):
    # Your code here
    pass`,
    solution: `def mota(num_gt, fn, fp, idsw):
    if num_gt == 0:
        return 0.0
    return round(1 - (fn + fp + idsw) / num_gt, 4)`,
    testCases: [
      { input: [10, 2, 1, 0], expected: 0.7 },
      { input: [4, 0, 0, 1], expected: 0.75 },
      { input: [5, 6, 2, 2], expected: -1.0 },
      { input: [0, 0, 0, 0], expected: 0.0 },
    ],
    hint: "All errors are normalized by the number of ground-truth boxes, so MOTA can go negative.",
  },
  {
    id: "cv-367",
    title: "IDF1 Lite",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute a simplified IDF1 identity score.\n\nIDF1 = 2 * idtp / (2 * idtp + idfp + idfn), where idtp counts correctly matched identity detections, and idfp / idfn are identity false positives and negatives. Return the value rounded to 4 decimal places, or 0.0 when the denominator is 0.",
    starterCode: `def idf1(idtp, idfp, idfn):
    # Your code here
    pass`,
    solution: `def idf1(idtp, idfp, idfn):
    denom = 2 * idtp + idfp + idfn
    if denom == 0:
        return 0.0
    return round(2 * idtp / denom, 4)`,
    testCases: [
      { input: [8, 1, 1], expected: 0.8889 },
      { input: [0, 0, 0], expected: 0.0 },
      { input: [5, 0, 0], expected: 1.0 },
      { input: [3, 2, 4], expected: 0.5 },
    ],
    hint: "IDF1 is the harmonic mean of identity precision and recall.",
  },
  {
    id: "cv-368",
    title: "Re-Identification Rank-1 Accuracy",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Compute rank-1 accuracy for person re-identification.\n\nEach row of preds is a ranked candidate list and gts[i] is the true identity of query i. Count queries whose top candidate matches the ground truth and return the fraction rounded to 4 decimal places. An empty input returns 0.0.",
    starterCode: `def rank1_accuracy(preds, gts):
    # Your code here
    pass`,
    solution: `def rank1_accuracy(preds, gts):
    if not preds:
        return 0.0
    hits = 0
    for p, g in zip(preds, gts):
        if p and p[0] == g:
            hits += 1
    return round(hits / len(preds), 4)`,
    testCases: [
      { input: [[[1, 2], [3, 4]], [1, 3]], expected: 1.0 },
      { input: [[[2, 1], [3, 4]], [1, 4]], expected: 0.0 },
      { input: [[[1], [2], [3]], [1, 2, 3]], expected: 1.0 },
      { input: [[[1, 2], [2, 1], [3, 4]], [2, 1, 3]], expected: 0.3333 },
    ],
    hint: "Only the first entry of each ranked list matters for rank-1.",
  },
  {
    id: "cv-369",
    title: "Reprojection Error",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the reprojection error of a 3D point.\n\nProject [X, Y, Z] through the 3x3 intrinsic matrix K using homogeneous division. Return the Euclidean distance to the observed pixel [u, v] rounded to 4 decimal places.",
    starterCode: `def reprojection_error(point, K, observed):
    # Your code here
    pass`,
    solution: `def reprojection_error(point, K, observed):
    x, y, z = point
    u = K[0][0] * (x / z) + K[0][1] * (y / z) + K[0][2]
    v = K[1][0] * (x / z) + K[1][1] * (y / z) + K[1][2]
    du = u - observed[0]
    dv = v - observed[1]
    return round((du * du + dv * dv) ** 0.5, 4)`,
    testCases: [
      { input: [[1, 2, 4], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [0.25, 0.5]], expected: 0.0 },
      { input: [[1, 2, 4], [[100, 0, 50], [0, 100, 40], [0, 0, 1]], [75, 90]], expected: 0.0 },
      { input: [[0, 0, 2], [[100, 0, 50], [0, 100, 40], [0, 0, 1]], [55, 40]], expected: 5.0 },
      { input: [[1, 1, 2], [[100, 0, 0], [0, 100, 0], [0, 0, 1]], [51, 50]], expected: 1.0 },
    ],
    hint: "This is the pixel-space residual minimized by bundle adjustment.",
  },
  {
    id: "cv-370",
    title: "Fundamental Matrix Constraint",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Evaluate the fundamental matrix constraint for a correspondence.\n\nFor homogeneous points x1 and x2 (given as 2D pixels), compute x2^T F x1 and return its absolute value rounded to 4 decimal places. A correspondence that satisfies the epipolar geometry gives exactly 0.",
    starterCode: `def fundamental_residual(F, x1, x2):
    # Your code here
    pass`,
    solution: `def fundamental_residual(F, x1, x2):
    x1h = [x1[0], x1[1], 1.0]
    x2h = [x2[0], x2[1], 1.0]
    v = [sum(F[i][j] * x1h[j] for j in range(3)) for i in range(3)]
    val = sum(x2h[i] * v[i] for i in range(3))
    return round(abs(val), 4)`,
    testCases: [
      { input: [[[1, 0, 0], [0, 1, 0], [0, 0, 1]], [1, 2], [3, 4]], expected: 12.0 },
      { input: [[[0, 0, 0], [0, 0, -1], [0, 1, 0]], [0, 0], [0, 0]], expected: 0.0 },
      { input: [[[1, 0, 0], [0, 1, 0], [0, 0, 1]], [-1, -1], [2, 2]], expected: 3.0 },
      { input: [[[0, 0, 0], [0, 0, -1], [0, 1, 0]], [2, 1], [1, 2]], expected: 1.0 },
    ],
    hint: "Append a 1 to both points before applying F.",
  },
  {
    id: "cv-371",
    title: "Epipolar Line Distance",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the distance from a point to its epipolar line.\n\nThe line is l = F * [x1, y1, 1] with coefficients (a, b, c), and the distance from x2 is |a * u + b * v + c| / sqrt(a^2 + b^2). Return the distance rounded to 4 decimal places, or 0.0 when a = b = 0.",
    starterCode: `def epipolar_distance(F, x1, x2):
    # Your code here
    pass`,
    solution: `def epipolar_distance(F, x1, x2):
    x1h = [x1[0], x1[1], 1.0]
    a = sum(F[0][j] * x1h[j] for j in range(3))
    b = sum(F[1][j] * x1h[j] for j in range(3))
    c = sum(F[2][j] * x1h[j] for j in range(3))
    denom = (a * a + b * b) ** 0.5
    if denom == 0:
        return 0.0
    return round(abs(a * x2[0] + b * x2[1] + c) / denom, 4)`,
    testCases: [
      { input: [[[0, 0, 1], [0, 0, -1], [0, 1, 0]], [0, 0], [1, 3]], expected: 1.4142 },
      { input: [[[0, 0, 0], [0, 0, -2], [0, 1, 1]], [1, 0], [1, 0]], expected: 0.5 },
      { input: [[[1, 0, 0], [0, 1, 0], [0, 0, 1]], [0, 0], [2, 2]], expected: 0.0 },
      { input: [[[0, 1, 0], [-1, 0, 0], [0, 0, 1]], [1, 1], [0, 0]], expected: 0.7071 },
    ],
    hint: "Normalize the line equation by the norm of its first two coefficients.",
  },
  {
    id: "cv-372",
    title: "Triangulation Depth",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Triangulate a 3D point from two camera rays.\n\nNormalize the direction vectors d1 and d2, then solve the closest-points problem between ray 1 (center c1) and ray 2 (center c2). Return the average of the two ray depths rounded to 4 decimal places, or 0.0 when the rays are parallel.",
    starterCode: `def triangulate_depth(c1, d1, c2, d2):
    # Your code here
    pass`,
    solution: `def triangulate_depth(c1, d1, c2, d2):
    n1 = (d1[0] ** 2 + d1[1] ** 2 + d1[2] ** 2) ** 0.5
    n2 = (d2[0] ** 2 + d2[1] ** 2 + d2[2] ** 2) ** 0.5
    u1 = [d1[0] / n1, d1[1] / n1, d1[2] / n1]
    u2 = [d2[0] / n2, d2[1] / n2, d2[2] / n2]
    w0 = [c1[0] - c2[0], c1[1] - c2[1], c1[2] - c2[2]]
    a = sum(u1[i] * u1[i] for i in range(3))
    b = sum(u1[i] * u2[i] for i in range(3))
    c = sum(u2[i] * u2[i] for i in range(3))
    d = sum(u1[i] * w0[i] for i in range(3))
    e = sum(u2[i] * w0[i] for i in range(3))
    denom = a * c - b * b
    if denom == 0:
        return 0.0
    t1 = (b * e - c * d) / denom
    t2 = (a * e - b * d) / denom
    return round((t1 + t2) / 2, 4)`,
    testCases: [
      { input: [[0, 0, 0], [0, 0, 1], [1, 0, 0], [-1, 0, 2]], expected: 2.118 },
      { input: [[0, 0, 0], [0, 0, 1], [1, 0, 0], [0, 0, 2]], expected: 0.0 },
      { input: [[0, 0, 0], [0, 0, 1], [0, 0, 0], [1, 0, 0]], expected: 0.0 },
      { input: [[0, 0, 0], [0, 0, 1], [0.5, 0, 0], [-1, 0, 1]], expected: 0.6036 },
    ],
    hint: "The 2x2 system for the two ray parameters has determinant 1 - (u1 . u2)^2.",
  },
  {
    id: "cv-373",
    title: "Bundle Adjustment Residual",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Compute the bundle adjustment residual over several observations.\n\nFor each 3D point apply the rotation matrix rot and translation t to get camera coordinates, project to normalized image coordinates, and sum the squared distance to the observed 2D point. Return the total squared residual rounded to 4 decimal places.",
    starterCode: `def bundle_residual(rot, t, points, observations):
    # Your code here
    pass`,
    solution: `def bundle_residual(rot, t, points, observations):
    total = 0.0
    for p, obs in zip(points, observations):
        xc = [sum(rot[i][j] * p[j] for j in range(3)) + t[i] for i in range(3)]
        u = xc[0] / xc[2]
        v = xc[1] / xc[2]
        total += (u - obs[0]) ** 2 + (v - obs[1]) ** 2
    return round(total, 4)`,
    testCases: [
      { input: [[[1, 0, 0], [0, 1, 0], [0, 0, 1]], [0, 0, 0], [[1, 2, 4]], [[0.25, 0.5]]], expected: 0.0 },
      {
        input: [
          [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
          [0, 0, 0],
          [[1, 2, 4], [0, 0, 2]],
          [[0.25, 0.5], [0.5, 0.5]],
        ],
        expected: 0.5,
      },
      { input: [[[1, 0, 0], [0, 1, 0], [0, 0, 1]], [1, 0, 0], [[0, 0, 2]], [[0.5, 0.0]]], expected: 0.0 },
      { input: [[[0, -1, 0], [1, 0, 0], [0, 0, 1]], [0, 0, 0], [[1, 0, 1]], [[0.0, 1.0]]], expected: 0.0 },
    ],
    hint: "Rotate first, translate second, then divide by the camera-space depth.",
  },
  {
    id: "cv-374",
    title: "Occupied Voxel Count",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Count the distinct voxels occupied by a point cloud.\n\nMap every point to (floor(x / size), floor(y / size), floor(z / size)) and return the number of unique integer cells. An empty cloud returns 0.",
    starterCode: `def occupied_voxel_count(points, size):
    # Your code here
    pass`,
    solution: `def occupied_voxel_count(points, size):
    import math
    cells = set()
    for p in points:
        cells.add((int(math.floor(p[0] / size)), int(math.floor(p[1] / size)), int(math.floor(p[2] / size))))
    return len(cells)`,
    testCases: [
      { input: [[[0.1, 0.1, 0.1], [0.2, 0.3, 0.2], [1.5, 1.5, 1.5]], 1.0], expected: 2 },
      { input: [[[1, 1, 1], [1.2, 1.4, 1.6], [1.9, 1.1, 1.3]], 2.0], expected: 1 },
      { input: [[], 1.0], expected: 0 },
      { input: [[[-0.5, -0.5, -0.5], [0.5, 0.5, 0.5], [1.0, 0.0, 0.0]], 1.0], expected: 3 },
    ],
    hint: "floor maps both -0.5 and 0.5 into different bins, while 1.0 lands one cell further.",
  },
  {
    id: "cv-375",
    title: "Voxel Grid Sparsity",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the sparsity of a voxel grid.\n\nSparsity is 1 - occupied / total, where occupied is the number of unique voxels containing points and total is dims[0] * dims[1] * dims[2]. Return the value rounded to 4 decimal places, or 0.0 when total is 0.",
    starterCode: `def voxel_sparsity(points, size, dims):
    # Your code here
    pass`,
    solution: `def voxel_sparsity(points, size, dims):
    import math
    total = dims[0] * dims[1] * dims[2]
    if total == 0:
        return 0.0
    cells = set()
    for p in points:
        cells.add((int(math.floor(p[0] / size)), int(math.floor(p[1] / size)), int(math.floor(p[2] / size))))
    return round(1 - len(cells) / total, 4)`,
    testCases: [
      { input: [[[0.1, 0.1, 0.1], [1.5, 1.5, 1.5]], 1.0, [2, 2, 2]], expected: 0.75 },
      { input: [[], 1.0, [4, 4, 4]], expected: 1.0 },
      { input: [[[0, 0, 0]], 1.0, [1, 1, 1]], expected: 0.0 },
      {
        input: [
          [
            [0.5, 0.5, 0.5],
            [1.5, 0.5, 0.5],
            [0.5, 1.5, 0.5],
            [1.5, 1.5, 0.5],
            [0.5, 0.5, 1.5],
            [1.5, 0.5, 1.5],
            [0.5, 1.5, 1.5],
            [1.5, 1.5, 1.5],
          ],
          1.0,
          [2, 2, 2],
        ],
        expected: 0.0,
      },
    ],
    hint: "A dense grid has sparsity 0; an empty grid has sparsity 1.",
  },
  {
    id: "cv-376",
    title: "ICP Nearest Neighbor Step",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Run one nearest-neighbor step of iterative closest point.\n\nFor each source point return the index of the closest target point in 3D Euclidean distance, breaking ties toward the smallest index. Return one index per source point.",
    starterCode: `def icp_nearest(source, target):
    # Your code here
    pass`,
    solution: `def icp_nearest(source, target):
    out = []
    for s in source:
        best = 0
        best_d = None
        for i, t in enumerate(target):
            d = (s[0] - t[0]) ** 2 + (s[1] - t[1]) ** 2 + (s[2] - t[2]) ** 2
            if best_d is None or d < best_d:
                best_d = d
                best = i
        out.append(best)
    return out`,
    testCases: [
      { input: [[[0, 0, 0], [5, 5, 5]], [[1, 0, 0], [0, 1, 0], [4, 4, 4]]], expected: [0, 2] },
      { input: [[[1, 1, 1]], [[0, 0, 0], [2, 2, 2]]], expected: [0] },
      { input: [[[3, 0, 0], [0, 3, 0]], [[3, 0, 0], [0, 3, 0], [3, 3, 3]]], expected: [0, 1] },
      { input: [[[0, 0, 0], [10, 10, 10]], [[-1, -1, -1]]], expected: [0, 0] },
    ],
    hint: "Squared distance gives the same ordering as distance, so skip the square root.",
  },
  {
    id: "cv-377",
    title: "TSDF Weight Update",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Fuse a new signed-distance measurement into a TSDF voxel.\n\nThe running average is (value * weight + obs) / (weight + 1), with the weight incremented by 1 and capped at max_weight. Return [value, weight] rounded to 4 decimal places.",
    starterCode: `def tsdf_update(value, weight, obs, max_weight):
    # Your code here
    pass`,
    solution: `def tsdf_update(value, weight, obs, max_weight):
    nw = weight + 1
    nv = (value * weight + obs) / nw
    if nw > max_weight:
        nw = max_weight
    return [round(nv, 4), nw]`,
    testCases: [
      { input: [0.0, 0, 0.5, 10], expected: [0.5, 1] },
      { input: [1.0, 1, 0.0, 10], expected: [0.5, 2] },
      { input: [0.2, 4, 0.4, 4], expected: [0.24, 4] },
      { input: [0.0, 0, 0.0, 1], expected: [0.0, 1] },
    ],
    hint: "Long observation sequences keep refining the mean until the weight saturates.",
  },
  {
    id: "cv-378",
    title: "NeRF Ray Sample Count",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Count the network evaluations for all rays of one NeRF image.\n\nEach of the h * w pixels casts one ray, and every ray is sampled at n_coarse coarse points plus n_fine fine points. Return h * w * (n_coarse + n_fine).",
    starterCode: `def nerf_sample_count(h, w, n_coarse, n_fine):
    # Your code here
    pass`,
    solution: `def nerf_sample_count(h, w, n_coarse, n_fine):
    return h * w * (n_coarse + n_fine)`,
    testCases: [
      { input: [100, 100, 64, 128], expected: 1920000 },
      { input: [32, 32, 32, 0], expected: 32768 },
      { input: [1, 1, 2, 3], expected: 5 },
      { input: [224, 224, 64, 64], expected: 6422528 },
    ],
    hint: "The fine network is queried per ray as a whole, not per coarse interval.",
  },
  {
    id: "cv-379",
    title: "NeRF Positional Encoding Dimension",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the dimension of NeRF's sinusoidal positional encoding.\n\nEach of the 3 coordinates contributes 2 values (sin and cos) per frequency level, and include_input additionally keeps the 3 raw coordinates. Return 3 if include_input is True plus 6 * levels.",
    starterCode: `def nerf_pe_dim(levels, include_input):
    # Your code here
    pass`,
    solution: `def nerf_pe_dim(levels, include_input):
    return (3 if include_input else 0) + 6 * levels`,
    testCases: [
      { input: [10, true], expected: 63 },
      { input: [10, false], expected: 60 },
      { input: [4, true], expected: 27 },
      { input: [0, true], expected: 3 },
    ],
    hint: "The encoding is applied to the 3D position, so there are 3 sin/cos pairs per level.",
  },
  {
    id: "cv-380",
    title: "Volume Rendering Alpha Composite",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Alpha-composite a ray through a list of volume samples.\n\nWith alpha_i = 1 - exp(-sigma_i * delta_i) and transmittance T_i = product of (1 - alpha_j) for j < i, accumulate color = sum T_i * alpha_i * color_i over RGB colors. Return the [r, g, b] color rounded to 4 decimal places.",
    starterCode: `def volume_render_color(deltas, sigmas, colors):
    # Your code here
    pass`,
    solution: `def volume_render_color(deltas, sigmas, colors):
    import math
    trans = 1.0
    out = [0.0, 0.0, 0.0]
    for i in range(len(deltas)):
        alpha = 1 - math.exp(-sigmas[i] * deltas[i])
        w = trans * alpha
        for ch in range(3):
            out[ch] += w * colors[i][ch]
        trans *= 1 - alpha
    return [round(c, 4) for c in out]`,
    testCases: [
      { input: [[1, 1], [1, 1], [[1, 0, 0], [0, 1, 0]]], expected: [0.6321, 0.2325, 0.0] },
      { input: [[1, 1], [0, 0], [[1, 0, 0], [0, 1, 0]]], expected: [0.0, 0.0, 0.0] },
      { input: [[100], [1], [[0.5, 0.5, 0.5]]], expected: [0.5, 0.5, 0.5] },
      { input: [[0.5, 0.5, 0.5], [2, 1, 3], [[1, 1, 0], [0, 0, 1], [1, 0, 1]]], expected: [0.8055, 0.6321, 0.3181] },
    ],
    hint: "Transmittance decreases multiplicatively after each sample absorbs light.",
  },
  {
    id: "cv-381",
    title: "NeRF Depth Expectation",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the expected depth of a NeRF ray.\n\nUsing the same alpha and transmittance weights as volume rendering, with alpha_i = 1 - exp(-sigma_i * delta_i), return sum T_i * alpha_i * depth_i rounded to 4 decimal places.",
    starterCode: `def nerf_depth(deltas, sigmas, depths):
    # Your code here
    pass`,
    solution: `def nerf_depth(deltas, sigmas, depths):
    import math
    trans = 1.0
    total = 0.0
    for i in range(len(deltas)):
        alpha = 1 - math.exp(-sigmas[i] * deltas[i])
        total += trans * alpha * depths[i]
        trans *= 1 - alpha
    return round(total, 4)`,
    testCases: [
      { input: [[1, 1], [1, 1], [1, 2]], expected: 1.0972 },
      { input: [[1, 1], [0, 0], [1, 2]], expected: 0.0 },
      { input: [[100], [1], [5]], expected: 5.0 },
      { input: [[0.5, 0.5, 0.5], [2, 1, 3], [1, 2, 3]], expected: 1.4416 },
    ],
    hint: "Depth is the weighted average of sample positions with weights T_i * alpha_i.",
  },
  {
    id: "cv-382",
    title: "Gaussian Splat Covariance",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Build the 3D covariance of a Gaussian splat.\n\nThe covariance is R * diag(scale^2) * R^T, where rot is a 3x3 rotation matrix and scale holds the per-axis standard deviations. Return the 3x3 symmetric matrix with every entry rounded to 4 decimal places.",
    starterCode: `def splat_covariance(rot, scale):
    # Your code here
    pass`,
    solution: `def splat_covariance(rot, scale):
    m = [[rot[i][j] * scale[j] for j in range(3)] for i in range(3)]
    cov = [[sum(m[i][k] * m[j][k] for k in range(3)) for j in range(3)] for i in range(3)]
    return [[round(cov[i][j], 4) for j in range(3)] for i in range(3)]`,
    testCases: [
      { input: [[[1, 0, 0], [0, 1, 0], [0, 0, 1]], [1, 2, 3]], expected: [[1, 0, 0], [0, 4, 0], [0, 0, 9]] },
      { input: [[[1, 0, 0], [0, 1, 0], [0, 0, 1]], [0, 0, 0]], expected: [[0, 0, 0], [0, 0, 0], [0, 0, 0]] },
      { input: [[[0, -1, 0], [1, 0, 0], [0, 0, 1]], [1, 2, 3]], expected: [[4, 0, 0], [0, 1, 0], [0, 0, 9]] },
      { input: [[[1, 0, 0], [0, 1, 0], [0, 0, 1]], [1, 1, 1]], expected: [[1, 0, 0], [0, 1, 0], [0, 0, 1]] },
    ],
    hint: "Compute M = R * diag(scale) first, then cov = M * M^T.",
  },
  {
    id: "cv-383",
    title: "Splat Alpha Blending",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Evaluate and composite a 2D Gaussian splat.\n\nGiven inverse covariance inv_cov = [[a, b], [b, c]] and pixel offset (dx, dy), the splat alpha is min(0.99, opacity * exp(-0.5 * (a * dx^2 + 2 * b * dx * dy + c * dy^2))). Blend over the background as alpha * color + (1 - alpha) * bg and return the result rounded to 4 decimal places.",
    starterCode: `def splat_blend(opacity, inv_cov, dx, dy, color, bg):
    # Your code here
    pass`,
    solution: `def splat_blend(opacity, inv_cov, dx, dy, color, bg):
    import math
    a = inv_cov[0][0]
    b = inv_cov[0][1]
    c = inv_cov[1][1]
    power = a * dx * dx + 2 * b * dx * dy + c * dy * dy
    alpha = min(0.99, opacity * math.exp(-0.5 * power))
    return round(alpha * color + (1 - alpha) * bg, 4)`,
    testCases: [
      { input: [1.0, [[1, 0], [0, 1]], 0, 0, 1.0, 0.0], expected: 0.99 },
      { input: [0.5, [[1, 0], [0, 1]], 0, 0, 1.0, 1.0], expected: 1.0 },
      { input: [0.8, [[1, 0], [0, 1]], 1, 0, 1.0, 0.0], expected: 0.4852 },
      { input: [1.0, [[1, 0.5], [0.5, 1]], 1, 1, 1.0, 0.0], expected: 0.2231 },
    ],
    hint: "The offset quadratic in the exponent is the Mahalanobis distance squared.",
  },
  {
    id: "cv-384",
    title: "SIM(3) Alignment Scale",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Compute the optimal scale of a SIM(3) alignment.\n\nThe least-squares scale that maps dst onto src without rotation is sum(dot(src_i, dst_i)) / sum(||dst_i||^2) over the 3D correspondences. Return it rounded to 4 decimal places, or 0.0 when the denominator is 0.",
    starterCode: `def sim3_scale(src, dst):
    # Your code here
    pass`,
    solution: `def sim3_scale(src, dst):
    num = 0.0
    den = 0.0
    for p, q in zip(src, dst):
        num += p[0] * q[0] + p[1] * q[1] + p[2] * q[2]
        den += q[0] * q[0] + q[1] * q[1] + q[2] * q[2]
    if den == 0:
        return 0.0
    return round(num / den, 4)`,
    testCases: [
      { input: [[[1, 0, 0], [0, 2, 0]], [[1, 0, 0], [0, 2, 0]]], expected: 1.0 },
      { input: [[[2, 0, 0]], [[1, 0, 0]]], expected: 2.0 },
      { input: [[[0, 0, 0], [0, 0, 0]], [[1, 1, 1], [2, 2, 2]]], expected: 0.0 },
      { input: [[[1, 1, 0]], [[2, 0, 0]]], expected: 0.5 },
    ],
    hint: "This is the scalar projection of src onto dst, which minimizes ||src - s * dst||^2.",
  },
  {
    id: "cv-385",
    title: "Scale-Invariant Depth Error",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the scale-invariant depth error between two depth maps.\n\nOver pixels where both depths are positive, take the root mean square of log(pred) - log(gt) using natural logarithms. Return the error rounded to 4 decimal places, or 0.0 when no pixel is valid.",
    starterCode: `def scale_invariant_depth_error(pred, gt):
    # Your code here
    pass`,
    solution: `def scale_invariant_depth_error(pred, gt):
    import math
    total = 0.0
    n = 0
    for i in range(len(pred)):
        for j in range(len(pred[0])):
            if pred[i][j] > 0 and gt[i][j] > 0:
                d = math.log(pred[i][j]) - math.log(gt[i][j])
                total += d * d
                n += 1
    if n == 0:
        return 0.0
    return round((total / n) ** 0.5, 4)`,
    testCases: [
      { input: [[[1, 2], [3, 4]], [[1, 2], [3, 4]]], expected: 0.0 },
      { input: [[[2, 2], [2, 2]], [[1, 1], [1, 1]]], expected: 0.6931 },
      { input: [[[1, 4]], [[1, 1]]], expected: 0.9803 },
      { input: [[[0, 2]], [[5, 1]]], expected: 0.6931 },
    ],
    hint: "Taking logs turns a global scale factor into a constant shift that the metric forgives.",
  },
  {
    id: "cv-386",
    title: "SfM Track Length",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Measure the average structure-from-motion track length.\n\nEach row of visibility is a feature with a 0/1 flag per frame. Return the mean number of frames in which a feature is visible, rounded to 4 decimal places. No features returns 0.0.",
    starterCode: `def sfm_track_lengths(visibility):
    # Your code here
    pass`,
    solution: `def sfm_track_lengths(visibility):
    if not visibility:
        return 0.0
    total = 0
    for track in visibility:
        total += sum(1 for f in track if f)
    return round(total / len(visibility), 4)`,
    testCases: [
      { input: [[[1, 1, 0], [0, 1, 1]]], expected: 2.0 },
      { input: [[[1, 1, 1]]], expected: 3.0 },
      { input: [[[]]], expected: 0.0 },
      { input: [[[0, 0], [1, 0], [1, 1, 1]]], expected: 1.3333 },
    ],
    hint: "Longer tracks give more stable triangulated 3D points.",
  },
  {
    id: "cv-387",
    title: "RANSAC Line Inlier Count",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Count RANSAC inliers for a hypothesized line model.\n\nThe model is y = slope * x + intercept. Count the 2D points whose vertical residual |y - (slope * x + intercept)| is at most threshold and return the integer count.",
    starterCode: `def ransac_line_inliers(points, slope, intercept, threshold):
    # Your code here
    pass`,
    solution: `def ransac_line_inliers(points, slope, intercept, threshold):
    count = 0
    for p in points:
        if abs(p[1] - (slope * p[0] + intercept)) <= threshold:
            count += 1
    return count`,
    testCases: [
      { input: [[[0, 0], [1, 1], [2, 3], [3, 3]], 1.0, 0.0, 0.5], expected: 3 },
      { input: [[[0, 0], [1, 1], [2, 2], [3, 3]], 1.0, 0.0, 0.001], expected: 4 },
      { input: [[[0, 5], [1, 5], [2, 5]], 1.0, 0.0, 0.5], expected: 0 },
      { input: [[], 1.0, 0.0, 0.5], expected: 0 },
    ],
    hint: "The residual is vertical, so no point-to-line normalization is needed.",
  },
  {
    id: "cv-388",
    title: "SimCLR NT-Xent Loss",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Compute the SimCLR NT-Xent contrastive loss.\n\nFor 2N L2-normalized embeddings z (positive pairs are i and i + N), average -log(exp(sim(i, pos) / t) / sum over k != i of exp(sim(i, k) / t)) over all anchors, where t is the temperature. Return the loss rounded to 4 decimal places.",
    starterCode: `def nt_xent_loss(z, temperature):
    # Your code here
    pass`,
    solution: `def nt_xent_loss(z, temperature):
    import math
    n = len(z)
    dim = len(z[0])
    normed = []
    for v in z:
        nrm = sum(x * x for x in v) ** 0.5
        normed.append([x / nrm for x in v])
    total = 0.0
    for i in range(n):
        pos = (i + n // 2) % n
        logits = []
        for j in range(n):
            if j == i:
                continue
            s = sum(normed[i][k] * normed[j][k] for k in range(dim))
            logits.append(s / temperature)
        positive = sum(normed[i][k] * normed[pos][k] for k in range(dim)) / temperature
        m = max(logits)
        lse = m + math.log(sum(math.exp(v - m) for v in logits))
        total += -positive + lse
    return round(total / n, 4)`,
    testCases: [
      { input: [[[1, 0], [0, 1], [1, 0], [0, 1]], 0.1], expected: 0.0001 },
      { input: [[[1, 0], [1, 0], [1, 0], [1, 0]], 0.5], expected: 1.0986 },
      { input: [[[1, 0], [0, 1], [0.5, 0.5], [0.5, 0.5]], 1.0], expected: 1.0598 },
    ],
    hint: "Subtract the max logit before exponentiating to keep the log-sum-exp stable.",
  },
  {
    id: "cv-389",
    title: "BYOL Predictor Target",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the BYOL predictor-target loss.\n\nL2-normalize the predictor output and the target projection, then return the squared Euclidean distance between the two unit vectors rounded to 4 decimal places.",
    starterCode: `def byol_target_loss(pred, target):
    # Your code here
    pass`,
    solution: `def byol_target_loss(pred, target):
    npred = sum(x * x for x in pred) ** 0.5
    ntgt = sum(x * x for x in target) ** 0.5
    total = 0.0
    for i in range(len(pred)):
        d = pred[i] / npred - target[i] / ntgt
        total += d * d
    return round(total, 4)`,
    testCases: [
      { input: [[1, 0], [1, 0]], expected: 0.0 },
      { input: [[1, 0], [-1, 0]], expected: 4.0 },
      { input: [[1, 0], [0, 1]], expected: 2.0 },
      { input: [[1, 1], [1, 0]], expected: 0.5858 },
    ],
    hint: "For unit vectors the loss simplifies to 2 - 2 * cosine similarity.",
  },
  {
    id: "cv-390",
    title: "MAE Masked Token Count",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Count masked and visible tokens for masked autoencoders.\n\nMask mask_ratio of the num_patches tokens (round half up) and return [masked, visible] counts. The visible tokens are the complement.",
    starterCode: `def mae_token_counts(num_patches, mask_ratio):
    # Your code here
    pass`,
    solution: `def mae_token_counts(num_patches, mask_ratio):
    masked = int(num_patches * mask_ratio + 0.5)
    return [masked, num_patches - masked]`,
    testCases: [
      { input: [196, 0.75], expected: [147, 49] },
      { input: [196, 0.0], expected: [0, 196] },
      { input: [100, 0.4], expected: [40, 60] },
      { input: [0, 0.5], expected: [0, 0] },
    ],
    hint: "Only the visible tokens pass through the encoder in MAE.",
  },
  {
    id: "cv-391",
    title: "DINO Teacher Temperature",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Warm up the DINO teacher temperature.\n\nThe temperature grows linearly from start to end over warmup_steps and stays at end afterwards. Return the temperature at the given step rounded to 4 decimal places.",
    starterCode: `def dino_teacher_temp(step, warmup_steps, start, end):
    # Your code here
    pass`,
    solution: `def dino_teacher_temp(step, warmup_steps, start, end):
    if warmup_steps <= 0 or step >= warmup_steps:
        return round(end, 4)
    frac = max(0.0, step) / warmup_steps
    return round(start + (end - start) * frac, 4)`,
    testCases: [
      { input: [0, 30, 0.04, 0.07], expected: 0.04 },
      { input: [15, 30, 0.04, 0.07], expected: 0.055 },
      { input: [30, 30, 0.04, 0.07], expected: 0.07 },
      { input: [60, 30, 0.04, 0.07], expected: 0.07 },
    ],
    hint: "The warmup keeps the teacher soft early in training.",
  },
  {
    id: "cv-392",
    title: "MoCo Queue Size",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Track the MoCo momentum queue size.\n\nAfter enqueuing one batch of batch keys, the queue holds min(capacity, current_size + batch) entries, discarding the oldest keys beyond capacity. Return that integer.",
    starterCode: `def moco_queue_size(current_size, batch, capacity):
    # Your code here
    pass`,
    solution: `def moco_queue_size(current_size, batch, capacity):
    return min(capacity, current_size + batch)`,
    testCases: [
      { input: [0, 256, 65536], expected: 256 },
      { input: [65536, 256, 65536], expected: 65536 },
      { input: [65400, 256, 65536], expected: 65536 },
      { input: [100, 50, 200], expected: 150 },
    ],
    hint: "The queue is a FIFO of the most recent keys, so it saturates at capacity.",
  },
  {
    id: "cv-393",
    title: "Masked Patch Reconstruction Loss",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Compute the masked patch reconstruction loss.\n\nReturn the mean squared error between pred and target over positions where mask is 1, rounded to 4 decimal places. When nothing is masked return 0.0.",
    starterCode: `def masked_recon_loss(pred, target, mask):
    # Your code here
    pass`,
    solution: `def masked_recon_loss(pred, target, mask):
    total = 0.0
    n = 0
    for i in range(len(pred)):
        for j in range(len(pred[0])):
            if mask[i][j]:
                d = pred[i][j] - target[i][j]
                total += d * d
                n += 1
    if n == 0:
        return 0.0
    return round(total / n, 4)`,
    testCases: [
      { input: [[[1, 2]], [[1, 3]], [[1, 0]]], expected: 0.0 },
      { input: [[[0, 0], [0, 0]], [[1, 1], [1, 1]], [[1, 1], [0, 0]]], expected: 1.0 },
      { input: [[[1, 2], [3, 4]], [[0, 0], [0, 0]], [[1, 1], [1, 1]]], expected: 7.5 },
      { input: [[[5]], [[0]], [[0]]], expected: 0.0 },
    ],
    hint: "Unmasked positions must not contribute to the loss or its normalizer.",
  },
  {
    id: "cv-394",
    title: "Optical Flow Warp Error",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Compute the photometric error after warping with optical flow.\n\nSample image2 bilinearly at (x + fx, y + fy), clamping the sample coordinates to the image, and average |image1 - sampled| over all pixels. Return the mean error rounded to 4 decimal places.",
    starterCode: `def flow_warp_error(image1, fx, fy, image2):
    # Your code here
    pass`,
    solution: `def flow_warp_error(image1, fx, fy, image2):
    import math
    h = len(image1)
    w = len(image1[0])
    total = 0.0
    for i in range(h):
        for j in range(w):
            sx = j + fx[i][j]
            sy = i + fy[i][j]
            sx = min(max(sx, 0.0), w - 1.0)
            sy = min(max(sy, 0.0), h - 1.0)
            x0 = int(math.floor(sx))
            y0 = int(math.floor(sy))
            x1 = min(x0 + 1, w - 1)
            y1 = min(y0 + 1, h - 1)
            dx = sx - x0
            dy = sy - y0
            val = ((1 - dx) * (1 - dy) * image2[y0][x0]
                   + dx * (1 - dy) * image2[y0][x1]
                   + (1 - dx) * dy * image2[y1][x0]
                   + dx * dy * image2[y1][x1])
            total += abs(image1[i][j] - val)
    return round(total / (h * w), 4)`,
    testCases: [
      { input: [[[1, 2], [3, 4]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[1, 2], [3, 4]]], expected: 0.0 },
      { input: [[[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[1, 1], [1, 1]]], expected: 1.0 },
      { input: [[[1, 2], [3, 4]], [[1, 1], [1, 1]], [[0, 0], [0, 0]], [[0, 1], [0, 3]]], expected: 0.5 },
      { input: [[[1, 2], [3, 4]], [[0, 0], [0, 0]], [[0.5, 0.5], [0.5, 0.5]], [[1, 2], [3, 4]]], expected: 0.5 },
    ],
    hint: "Clamping keeps the warp valid at the image border.",
  },
  {
    id: "cv-395",
    title: "Pinhole FOV Projection",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Project a camera-space point with a pinhole model given the horizontal field of view.\n\nThe focal length in pixels is f = (width / 2) / tan(fov_deg / 2) and the principal point is the image center. Return [f * X / Z + width / 2, f * Y / Z + height / 2] rounded to 4 decimal places.",
    starterCode: `def pinhole_fov_project(point, fov_deg, width, height):
    # Your code here
    pass`,
    solution: `def pinhole_fov_project(point, fov_deg, width, height):
    import math
    f = (width / 2.0) / math.tan(math.radians(fov_deg) / 2.0)
    u = f * point[0] / point[2] + width / 2.0
    v = f * point[1] / point[2] + height / 2.0
    return [round(u, 4), round(v, 4)]`,
    testCases: [
      { input: [[0, 0, 2], 90, 640, 480], expected: [320.0, 240.0] },
      { input: [[1, 0, 2], 90, 640, 480], expected: [480.0, 240.0] },
      { input: [[0, 0, 1], 60, 100, 100], expected: [50.0, 50.0] },
      { input: [[0, 1, 1], 90, 200, 100], expected: [100.0, 150.0] },
    ],
    hint: "At 90 degrees the half-width equals the focal length in pixels.",
  },
];
