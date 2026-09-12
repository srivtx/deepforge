import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "dl-321",
    title: "FP8 E4M3 Value Decode",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Decode an 8-bit FP8 E4M3 value into its real number. The layout is 1 sign bit, 4 exponent bits with bias 7, and 3 mantissa bits; subnormals use 2^-6 with no implicit leading 1, and the code 0x7F is NaN. Return the decoded float for the integer bit pattern bits.\n\nThe signature is fp8_e4m3_decode(bits).",
    starterCode: `def fp8_e4m3_decode(bits):
    # Your code here
    pass`,
    solution: `def fp8_e4m3_decode(bits):
    sign = (bits >> 7) & 1
    mag = bits & 0x7F
    e = (mag >> 3) & 0xF
    m = mag & 0x7
    if e == 0xF and m == 0x7:
        return None
    if e == 0:
        val = (m / 8.0) * (2.0 ** -6)
    else:
        val = (1.0 + m / 8.0) * (2.0 ** (e - 7))
    return -val if sign else val`,
    testCases: [
      { input: [0], expected: 0.0 },
      { input: [56], expected: 1.0 },
      { input: [60], expected: 1.5 },
      { input: [1], expected: 0.001953125 },
      { input: [184], expected: -1.0 },
    ],
    hint: "The exponent bias is 7 and the largest E4M3 magnitude is 448.",
  },
  {
    id: "dl-322",
    title: "FP8 E5M2 Value Decode",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Decode an 8-bit FP8 E5M2 value. The layout is 1 sign bit, 5 exponent bits with bias 15, and 2 mantissa bits; subnormals use 2^-14 with no implicit leading 1. Return the decoded float for the integer bit pattern bits.\n\nThe signature is fp8_e5m2_decode(bits).",
    starterCode: `def fp8_e5m2_decode(bits):
    # Your code here
    pass`,
    solution: `def fp8_e5m2_decode(bits):
    sign = (bits >> 7) & 1
    mag = bits & 0x7F
    e = (mag >> 2) & 0x1F
    m = mag & 0x3
    if e == 0x1F:
        if m == 0:
            return float("inf")
        return None
    if e == 0:
        val = (m / 4.0) * (2.0 ** -14)
    else:
        val = (1.0 + m / 4.0) * (2.0 ** (e - 15))
    return -val if sign else val`,
    testCases: [
      { input: [0], expected: 0.0 },
      { input: [56], expected: 0.5 },
      { input: [80], expected: 32.0 },
      { input: [1], expected: 1.52587890625e-05 },
      { input: [192], expected: -2.0 },
    ],
    hint: "E5M2 trades mantissa bits for exponent range compared with E4M3.",
  },
  {
    id: "dl-323",
    title: "FP8 Amax Update",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Update a running FP8 amax (maximum absolute value) with a new tensor and a decay factor: max(max(|x|) over the tensor, decay * current_amax). An empty tensor leaves decay * current_amax.\n\nThe signature is fp8_amax_update(current_amax, tensor, decay=0.0).",
    starterCode: `def fp8_amax_update(current_amax, tensor, decay=0.0):
    # Your code here
    pass`,
    solution: `def fp8_amax_update(current_amax, tensor, decay=0.0):
    m = abs(current_amax) * decay
    for v in tensor:
        if abs(v) > m:
            m = abs(v)
    return m`,
    testCases: [
      { input: [5.0, [-2.0, 7.5, 3.0], 0.0], expected: 7.5 },
      { input: [10.0, [1.0, -2.0], 0.5], expected: 5.0 },
      { input: [0.0, [], 0.9], expected: 0.0 },
      { input: [3.0, [-4.0, 2.0], 1.0], expected: 4.0 },
      { input: [100.0, [], 1.0], expected: 100.0 },
    ],
    hint: "Decay reduces the influence of stale amax history so the scale can shrink.",
  },
  {
    id: "dl-324",
    title: "Block-Wise Scale Factor",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the symmetric scale for a quantization block: max(|x|) / (2^(bits-1) - 1), where the denominator is the largest representable signed integer. An all-zero block gives 0.0.\n\nThe signature is block_scale_factor(block, bits=8).",
    starterCode: `def block_scale_factor(block, bits=8):
    # Your code here
    pass`,
    solution: `def block_scale_factor(block, bits=8):
    qmax = 2 ** (bits - 1) - 1
    amax = 0.0
    for v in block:
        if abs(v) > amax:
            amax = abs(v)
    return amax / qmax`,
    testCases: [
      { input: [[-1.0, 2.0, 0.5], 8], expected: 0.015748031496062992 },
      { input: [[0.0, 0.0], 8], expected: 0.0 },
      { input: [[3.0, -4.0], 4], expected: 0.5714285714285714 },
      { input: [[1.5], 8], expected: 0.011811023622047244 },
    ],
    hint: "Smaller blocks adapt better to local ranges but cost more scale bytes.",
  },
  {
    id: "dl-325",
    title: "MXFP4 Block Quantization Error",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Estimate the RMS error of MXFP4 block quantization. Elements use the E2M1 value set {0, 0.5, 1, 1.5, 2, 3, 4, 6} with a shared power-of-two scale 2^(floor(log2(amax)) - 2). Round each element to the nearest level (ties to the smaller), dequantize with the sign, and return the root-mean-square error; an all-zero block returns 0.0.\n\nThe signature is mxfp4_block_error(values).",
    starterCode: `import math
def mxfp4_block_error(values):
    # Your code here
    pass`,
    solution: `import math
def mxfp4_block_error(values):
    amax = 0.0
    for v in values:
        if abs(v) > amax:
            amax = abs(v)
    if amax == 0.0:
        return 0.0
    scale = 2.0 ** (math.floor(math.log2(amax)) - 2)
    levels = [0.0, 0.5, 1.0, 1.5, 2.0, 3.0, 4.0, 6.0]
    total = 0.0
    for v in values:
        r = abs(v) / scale
        c = levels[0]
        best = abs(r - c)
        for lv in levels[1:]:
            d = abs(r - lv)
            if d < best:
                best = d
                c = lv
        dq = c * scale
        if v < 0:
            dq = -dq
        total += (v - dq) ** 2
    return math.sqrt(total / len(values))`,
    testCases: [
      { input: [[1.0, -1.0, 0.5, -0.5]], expected: 0.0 },
      { input: [[1.5, -1.5, 0.0, 3.0]], expected: 0.0 },
      { input: [[1.7, 0.0]], expected: 0.14142135623730948 },
      { input: [[0.0, 0.0]], expected: 0.0 },
      { input: [[5.0]], expected: 1.0 },
    ],
    hint: "The shared exponent is chosen from the block amax; the largest E2M1 level is 6.",
  },
  {
    id: "dl-326",
    title: "NF4 Level Lookup",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Look up an NF4 (4-bit NormalFloat) quantization level. NF4 uses the 16 fixed levels from -1.0 to 1.0 indexed by code 0-15, with non-uniform spacing dense near zero. Return level[code] * scale + zero_point.\n\nThe signature is nf4_level_lookup(code, scale, zero_point=0.0).",
    starterCode: `def nf4_level_lookup(code, scale, zero_point=0.0):
    # Your code here
    pass`,
    solution: `def nf4_level_lookup(code, scale, zero_point=0.0):
    levels = [-1.0, -0.6961928009986877, -0.5250730514526367, -0.39491748809814453, -0.28444138169288635, -0.18477343022823334, -0.09105003625154495, 0.0, 0.07958029955625534, 0.16093020141124725, 0.24611230194568634, 0.33791524171829224, 0.44070982933044434, 0.5626170039176941, 0.7229568362236023, 1.0]
    return levels[code] * scale + zero_point`,
    testCases: [
      { input: [7, 1.0, 0.0], expected: 0.0 },
      { input: [15, 1.0, 0.0], expected: 1.0 },
      { input: [0, 2.0, 0.5], expected: -1.5 },
      { input: [8, 1.0, 0.0], expected: 0.07958029955625534 },
      { input: [1, 1.0, 0.0], expected: -0.6961928009986877 },
    ],
    hint: "NF4 levels are quantiles of a standard normal, not uniformly spaced.",
  },
  {
    id: "dl-327",
    title: "Double Quantization Scale Savings",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the storage bytes for quantization scales before and after double quantization: fp32 scales cost 4 bytes each, while double quantization stores each scale at second_bits and adds one fp32 second-level scale per second_block scales. Return [fp32_bytes, double_quant_bytes].\n\nThe signature is double_quant_scale_savings(num_scales, second_bits=8, second_block=256).",
    starterCode: `import math
def double_quant_scale_savings(num_scales, second_bits=8, second_block=256):
    # Your code here
    pass`,
    solution: `import math
def double_quant_scale_savings(num_scales, second_bits=8, second_block=256):
    before = num_scales * 4.0
    after = num_scales * (second_bits / 8.0) + math.ceil(num_scales / second_block) * 4.0
    return [before, after]`,
    testCases: [
      { input: [4096, 8, 256], expected: [16384.0, 4160.0] },
      { input: [256, 8, 256], expected: [1024.0, 260.0] },
      { input: [100, 8, 64], expected: [400.0, 108.0] },
      { input: [0, 8, 256], expected: [0.0, 0.0] },
      { input: [1, 4, 1], expected: [4.0, 4.5] },
    ],
    hint: "Double quantization treats the first-level scales as data and quantizes them again.",
  },
  {
    id: "dl-328",
    title: "GPTQ Hessian Layer Error",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Compute the GPTQ layer-wise squared output error of quantizing a weight row: (w - w_q) H (w - w_q)^T, where H is the input-feature Hessian from calibration and is symmetric. Return the scalar error.\n\nThe signature is gptq_layer_error(w, w_q, H).",
    starterCode: `def gptq_layer_error(w, w_q, H):
    # Your code here
    pass`,
    solution: `def gptq_layer_error(w, w_q, H):
    e = [w[i] - w_q[i] for i in range(len(w))]
    He = [sum(H[i][j] * e[j] for j in range(len(e))) for i in range(len(e))]
    return sum(e[i] * He[i] for i in range(len(e)))`,
    testCases: [
      { input: [[1, 0], [0, 0], [[1, 0], [0, 1]]], expected: 1 },
      { input: [[1, 1], [0.5, 0.5], [[1, 0.5], [0.5, 1]]], expected: 0.75 },
      { input: [[2, -1], [2, -1], [[1, 0], [0, 1]]], expected: 0 },
      { input: [[1, 2], [0, 0], [[2, 0], [0, 1]]], expected: 6 },
    ],
    hint: "The Hessian weights errors in directions the calibration inputs excite most.",
  },
  {
    id: "dl-329",
    title: "AWQ Activation-Aware Scaling",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Apply AWQ activation-aware scaling to a weight matrix. With per-input-channel activation scales act_scales and exponent alpha, scale each column j by s_j = act_scales[j]^alpha: W_scaled[i][j] = W[i][j] * s_j. Return the scaled matrix.\n\nThe signature is awq_scaled_weights(W, act_scales, alpha).",
    starterCode: `def awq_scaled_weights(W, act_scales, alpha):
    # Your code here
    pass`,
    solution: `def awq_scaled_weights(W, act_scales, alpha):
    s = [a ** alpha for a in act_scales]
    return [[W[i][j] * s[j] for j in range(len(s))] for i in range(len(W))]`,
    testCases: [
      { input: [[[1, 2], [3, 4]], [4, 1], 0.5], expected: [[2.0, 2.0], [6.0, 4.0]] },
      { input: [[[1, -2]], [9, 16], 0.5], expected: [[3.0, -8.0]] },
      { input: [[[1, 2]], [2, 3], 1.0], expected: [[2.0, 6.0]] },
      { input: [[[1, 2]], [2, 3], 0.0], expected: [[1.0, 2.0]] },
    ],
    hint: "AWQ amplifies salient channels so quantization error lands on less important weights.",
  },
  {
    id: "dl-330",
    title: "SmoothQuant Scaled Weights",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Apply SmoothQuant channel scaling to both weights and activations. Multiply each weight column by its smoothing factor s_j and divide each activation column by the same factor: W_scaled[i][j] = W[i][j]*s_j and X_scaled[i][j] = X[i][j]/s_j. Return [W_scaled, X_scaled].\n\nThe signature is smoothquant_scaled_weights(W, X, s).",
    starterCode: `def smoothquant_scaled_weights(W, X, s):
    # Your code here
    pass`,
    solution: `def smoothquant_scaled_weights(W, X, s):
    Ws = [[W[i][j] * s[j] for j in range(len(s))] for i in range(len(W))]
    Xs = [[X[i][j] / s[j] for j in range(len(s))] for i in range(len(X))]
    return [Ws, Xs]`,
    testCases: [
      { input: [[[1.0, 2.0]], [[2.0, 4.0]], [2.0, 4.0]], expected: [[[2.0, 8.0]], [[1.0, 1.0]]] },
      { input: [[[1, 1], [1, 1]], [[1, 1]], [0.5, 2.0]], expected: [[[0.5, 2.0], [0.5, 2.0]], [[2.0, 0.5]]] },
      { input: [[[2.0, 4.0]], [[1.0, 1.0]], [1.0, 1.0]], expected: [[[2.0, 4.0]], [[1.0, 1.0]]] },
    ],
    hint: "The product W_scaled * X_scaled equals W * X, so the layer output is unchanged.",
  },
  {
    id: "dl-331",
    title: "Per-Channel vs Per-Tensor MSE",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Compare symmetric int quantization MSE for a weight matrix with one per-tensor scale versus one scale per row. Quantize with round(x/scale) clamped to +/-(2^(bits-1)-1), dequantize, and return [mse_per_tensor, mse_per_channel] averaged over all elements. Rows or matrices of zeros contribute zero error.\n\nThe signature is per_channel_vs_tensor_mse(W, bits=8).",
    starterCode: `def per_channel_vs_tensor_mse(W, bits=8):
    # Your code here
    pass`,
    solution: `def per_channel_vs_tensor_mse(W, bits=8):
    qmax = 2 ** (bits - 1) - 1
    amax = 0.0
    for row in W:
        for v in row:
            if abs(v) > amax:
                amax = abs(v)
    st = amax / qmax if amax > 0 else 0.0
    t_err = 0.0
    c_err = 0.0
    n = 0
    for row in W:
        rm = max(abs(v) for v in row)
        sc = rm / qmax if rm > 0 else 0.0
        for v in row:
            n += 1
            if st == 0.0:
                dt = 0.0
            else:
                q = round(v / st)
                if q > qmax:
                    q = qmax
                if q < -qmax:
                    q = -qmax
                dt = q * st
            if sc == 0.0:
                dc = 0.0
            else:
                q = round(v / sc)
                if q > qmax:
                    q = qmax
                if q < -qmax:
                    q = -qmax
                dc = q * sc
            t_err += (v - dt) ** 2
            c_err += (v - dc) ** 2
    return [t_err / n, c_err / n]`,
    testCases: [
      { input: [[[1.0, 0.0], [100.0, 0.0]], 8], expected: [0.011299522599045193, 0.0] },
      { input: [[[0.7, -0.3], [0.3, -0.7]], 8], expected: [2.7900055800111765e-06, 2.7900055800111765e-06] },
      { input: [[[0.0, 0.0], [0.0, 0.0]], 8], expected: [0.0, 0.0] },
      { input: [[[1.0, 0.0], [2.0, 1.0]], 8], expected: [3.100006200012389e-05, 1.5500031000061944e-05] },
    ],
    hint: "Per-channel scales help most when rows have very different dynamic ranges.",
  },
  {
    id: "dl-332",
    title: "Quantization Step Size",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the asymmetric quantization step size: (max(values) - min(values)) / (2^bits - 1). A constant list gives 0.0.\n\nThe signature is quantization_step_size(values, bits=8).",
    starterCode: `def quantization_step_size(values, bits=8):
    # Your code here
    pass`,
    solution: `def quantization_step_size(values, bits=8):
    return (max(values) - min(values)) / (2 ** bits - 1)`,
    testCases: [
      { input: [[0.0, 1.0], 8], expected: 0.00392156862745098 },
      { input: [[-1.0, 1.0], 8], expected: 0.00784313725490196 },
      { input: [[5.0], 4], expected: 0.0 },
      { input: [[-2.0, 3.0], 16], expected: 7.629510948348211e-05 },
    ],
    hint: "The step is the distance between adjacent representable levels.",
  },
  {
    id: "dl-333",
    title: "Dequantized Weight Reconstruction",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Reconstruct weights from per-row integer codes and per-row scales: W[i][j] = codes[i][j] * scales[i]. Return the dequantized matrix.\n\nThe signature is dequantized_weight_reconstruction(codes, scales).",
    starterCode: `def dequantized_weight_reconstruction(codes, scales):
    # Your code here
    pass`,
    solution: `def dequantized_weight_reconstruction(codes, scales):
    return [[codes[i][j] * scales[i] for j in range(len(codes[i]))] for i in range(len(codes))]`,
    testCases: [
      { input: [[[1, -2], [3, 0]], [0.5, 2.0]], expected: [[0.5, -1.0], [6.0, 0.0]] },
      { input: [[[-1, 0, 1]], [1.0]], expected: [[-1.0, 0.0, 1.0]] },
      { input: [[[2]], [-0.5]], expected: [[-1.0]] },
      { input: [[[0, 0], [0, 0]], [1.0, 2.0]], expected: [[0.0, 0.0], [0.0, 0.0]] },
    ],
    hint: "Each row has its own scale, so multiply row i by scales[i].",
  },
  {
    id: "dl-334",
    title: "Quantization Error Variance",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Return the variance of round-to-nearest uniform quantization noise: step^2 / 12, where step is the quantization step size.\n\nThe signature is quantization_error_variance(step).",
    starterCode: `def quantization_error_variance(step):
    # Your code here
    pass`,
    solution: `def quantization_error_variance(step):
    return step * step / 12.0`,
    testCases: [
      { input: [1.0], expected: 0.08333333333333333 },
      { input: [0.5], expected: 0.020833333333333332 },
      { input: [0.0], expected: 0.0 },
      { input: [2.0], expected: 0.3333333333333333 },
    ],
    hint: "Uniform noise on [-step/2, step/2] has variance step^2/12.",
  },
  {
    id: "dl-335",
    title: "Straight-Through Estimator Gradient",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Apply the straight-through estimator (STE) gradient used in quantization-aware training: pass grad_output through unchanged where |x| <= clip, and return 0 outside the clipping range. Inputs are element-wise lists and the result is a list of the same length.\n\nThe signature is ste_gradient(x, grad_output, clip=1.0).",
    starterCode: `def ste_gradient(x, grad_output, clip=1.0):
    # Your code here
    pass`,
    solution: `def ste_gradient(x, grad_output, clip=1.0):
    out = []
    for i in range(len(x)):
        if abs(x[i]) <= clip:
            out.append(grad_output[i])
        else:
            out.append(0.0)
    return out`,
    testCases: [
      { input: [[0.5, -0.5, 1.5, 2.0], [1.0, 2.0, 3.0, 4.0], 1.0], expected: [1.0, 2.0, 0.0, 0.0] },
      { input: [[1.5, 2.0, 3.0], [1.0, 2.0, 3.0], 2.0], expected: [1.0, 2.0, 0.0] },
      { input: [[0.0, 0.25, 0.5], [5.0, 6.0, 7.0], 1.0], expected: [5.0, 6.0, 7.0] },
      { input: [[2.0], [-3.0], 0.0], expected: [0.0] },
    ],
    hint: "The rounding function has zero derivative almost everywhere, so STE pretends it is identity.",
  },
  {
    id: "dl-336",
    title: "Fake-Quant Forward Value",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the fake-quantization forward value: q = clamp(round(x/scale) + zero_point, qmin, qmax), then dequantize with (q - zero_point) * scale. Apply element-wise to the list x and return the list of dequantized values.\n\nThe signature is fake_quant_forward(x, scale, zero_point, qmin, qmax).",
    starterCode: `def fake_quant_forward(x, scale, zero_point, qmin, qmax):
    # Your code here
    pass`,
    solution: `def fake_quant_forward(x, scale, zero_point, qmin, qmax):
    out = []
    for v in x:
        q = int(round(v / scale)) + zero_point
        if q < qmin:
            q = qmin
        if q > qmax:
            q = qmax
        out.append((q - zero_point) * scale)
    return out`,
    testCases: [
      { input: [[1.2, -1.2], 1.0, 0, -128, 127], expected: [1.0, -1.0] },
      { input: [[1000.0], 1.0, 0, -128, 127], expected: [127.0] },
      { input: [[2.5], 0.5, 0, 0, 15], expected: [2.5] },
      { input: [[0.0, 5.0], 1.0, 8, 0, 15], expected: [0.0, 5.0] },
    ],
    hint: "Fake quantization simulates the rounding error while keeping the tensor in floating point.",
  },
  {
    id: "dl-337",
    title: "QAT vs PTQ Error Delta",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compare post-training quantization (PTQ) and quantization-aware training (QAT) error. Return [ptq_error - qat_error, (ptq_error - qat_error) / ptq_error], using 0.0 for the relative reduction when ptq_error is 0.\n\nThe signature is qat_vs_ptq_error(ptq_error, qat_error).",
    starterCode: `def qat_vs_ptq_error(ptq_error, qat_error):
    # Your code here
    pass`,
    solution: `def qat_vs_ptq_error(ptq_error, qat_error):
    delta = ptq_error - qat_error
    rel = 0.0 if ptq_error == 0.0 else delta / ptq_error
    return [delta, rel]`,
    testCases: [
      { input: [0.1, 0.02], expected: [0.08, 0.7999999999999999] },
      { input: [0.5, 0.5], expected: [0.0, 0.0] },
      { input: [0.0, 0.0], expected: [0.0, 0.0] },
      { input: [0.3, 0.1], expected: [0.19999999999999998, 0.6666666666666666] },
    ],
    hint: "QAT usually narrows the gap because the network adapts to rounding during fine-tuning.",
  },
  {
    id: "dl-338",
    title: "Min-Max Calibration Range",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Return the calibration range of observed activations as [min, max]; an empty list returns [0.0, 0.0]. These bounds feed the step size and zero point of min-max quantization.\n\nThe signature is min_max_calibration_range(values).",
    starterCode: `def min_max_calibration_range(values):
    # Your code here
    pass`,
    solution: `def min_max_calibration_range(values):
    if len(values) == 0:
        return [0.0, 0.0]
    return [float(min(values)), float(max(values))]`,
    testCases: [
      { input: [[3, -2, 4]], expected: [-2.0, 4.0] },
      { input: [[1.5]], expected: [1.5, 1.5] },
      { input: [[0, 0, 0]], expected: [0.0, 0.0] },
      { input: [[]], expected: [0.0, 0.0] },
    ],
    hint: "Min-max calibration is sensitive to a single extreme outlier.",
  },
  {
    id: "dl-339",
    title: "Percentile Clip Threshold",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute a percentile clipping threshold with linear interpolation: sort values, take rank = (percentile/100) * (n-1), and interpolate between the two neighboring order statistics. Clamp percentile to [0, 100]; a single value returns itself.\n\nThe signature is percentile_clip_threshold(values, percentile).",
    starterCode: `import math
def percentile_clip_threshold(values, percentile):
    # Your code here
    pass`,
    solution: `import math
def percentile_clip_threshold(values, percentile):
    s = sorted(values)
    if len(s) == 1:
        return float(s[0])
    if percentile < 0.0:
        percentile = 0.0
    if percentile > 100.0:
        percentile = 100.0
    rank = (percentile / 100.0) * (len(s) - 1)
    lo = int(math.floor(rank))
    if lo >= len(s) - 1:
        return float(s[-1])
    frac = rank - lo
    return s[lo] + frac * (s[lo + 1] - s[lo])`,
    testCases: [
      { input: [[1, 2, 3, 4], 50], expected: 2.5 },
      { input: [[1, 2, 3, 4], 25], expected: 1.75 },
      { input: [[1, 2, 3, 4], 100], expected: 4.0 },
      { input: [[5], 90], expected: 5.0 },
      { input: [[0, 10], 10], expected: 1.0 },
    ],
    hint: "Percentile clipping trades a little range for much finer resolution near the bulk.",
  },
  {
    id: "dl-340",
    title: "KL Calibration Divergence",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Compute the KL divergence used to score calibration ranges: normalize p and q to distributions, floor q at eps, and return sum p_i * ln(p_i / q_i), skipping terms where p_i is zero. Lower divergence means the quantized distribution better matches the reference.\n\nThe signature is kl_calibration_divergence(p, q, eps=1e-9).",
    starterCode: `import math
def kl_calibration_divergence(p, q, eps=1e-9):
    # Your code here
    pass`,
    solution: `import math
def kl_calibration_divergence(p, q, eps=1e-9):
    sp = sum(p)
    sq = sum(q)
    pp = [x / sp for x in p]
    qq = [x / sq for x in q]
    total = 0.0
    for i in range(len(pp)):
        if pp[i] > 0.0:
            total += pp[i] * math.log(pp[i] / max(qq[i], eps))
    return total`,
    testCases: [
      { input: [[1, 0], [1, 0]], expected: 0.0 },
      { input: [[0.5, 0.5], [0.5, 0.5]], expected: 0.0 },
      { input: [[0.5, 0.5], [0.25, 0.75]], expected: 0.14384103622589042 },
      { input: [[1, 0], [0, 1]], expected: 20.72326583694641 },
    ],
    hint: "KL is asymmetric: it is zero only when the two normalized histograms match.",
  },
  {
    id: "dl-341",
    title: "Entropy Calibration Loss",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the cross-entropy calibration loss: normalize both histograms, floor the quantized probabilities at eps, and return -sum p_i * ln(q_i). This is the entropy of the reference measured under the quantized distribution.\n\nThe signature is entropy_calibration_loss(reference, quantized, eps=1e-9).",
    starterCode: `import math
def entropy_calibration_loss(reference, quantized, eps=1e-9):
    # Your code here
    pass`,
    solution: `import math
def entropy_calibration_loss(reference, quantized, eps=1e-9):
    sp = sum(reference)
    sq = sum(quantized)
    pp = [x / sp for x in reference]
    qq = [x / sq for x in quantized]
    total = 0.0
    for i in range(len(pp)):
        if pp[i] > 0.0:
            total -= pp[i] * math.log(max(qq[i], eps))
    return total`,
    testCases: [
      { input: [[0.5, 0.5], [0.5, 0.5]], expected: 0.6931471805599453 },
      { input: [[1, 0], [1, 0]], expected: 0.0 },
      { input: [[1, 0], [0.5, 0.5]], expected: 0.6931471805599453 },
      { input: [[0.25, 0.75], [0.5, 0.5]], expected: 0.6931471805599453 },
    ],
    hint: "Cross-entropy is never below the reference entropy; matching histograms hit that floor.",
  },
  {
    id: "dl-342",
    title: "Optimal Clip Search",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Search candidate clipping values for symmetric quantization. For each candidate c, quantize values with scale c / (2^(bits-1)-1) after clipping to [-c, c], dequantize, and compute the MSE. Return the candidate with the lowest MSE, breaking ties toward the smaller c.\n\nThe signature is optimal_clip_search(values, candidates, bits=8).",
    starterCode: `def optimal_clip_search(values, candidates, bits=8):
    # Your code here
    pass`,
    solution: `def optimal_clip_search(values, candidates, bits=8):
    qmax = 2 ** (bits - 1) - 1
    best = None
    for c in candidates:
        scale = c / qmax if qmax > 0 else 0.0
        err = 0.0
        for v in values:
            vv = v
            if vv > c:
                vv = c
            if vv < -c:
                vv = -c
            if scale == 0.0:
                d = 0.0
            else:
                d = round(vv / scale) * scale
            err += (v - d) ** 2
        err /= len(values)
        key = (err, c)
        if best is None or key < best:
            best = key
    return best[1]`,
    testCases: [
      { input: [[-5.0, -1.0, 0.5, 1.0, 5.0], [1.0, 2.0, 5.0], 8], expected: 5.0 },
      { input: [[0.1, 0.2, 0.1], [0.1, 1.0], 8], expected: 1.0 },
      { input: [[1.0, 2.0, 100.0], [1.0, 2.0, 100.0], 8], expected: 100.0 },
      { input: [[0.0, 0.0], [2.0, 1.0], 8], expected: 1.0 },
    ],
    hint: "Clipping a few extreme values can reduce total error by tightening the step size.",
  },
  {
    id: "dl-343",
    title: "Int4 Pair Packing",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Pack two unsigned 4-bit codes into one byte: low nibble = values[0], high nibble = values[1], returning values[0] | (values[1] << 4). Inputs are masked to 4 bits.\n\nThe signature is int4_pair_pack(values).",
    starterCode: `def int4_pair_pack(values):
    # Your code here
    pass`,
    solution: `def int4_pair_pack(values):
    a = values[0] & 0xF
    b = values[1] & 0xF
    return a | (b << 4)`,
    testCases: [
      { input: [[3, 5]], expected: 83 },
      { input: [[0, 15]], expected: 240 },
      { input: [[15, 0]], expected: 15 },
      { input: [[10, 10]], expected: 170 },
    ],
    hint: "The low nibble sits in bits 0-3 and the high nibble in bits 4-7.",
  },
  {
    id: "dl-344",
    title: "Int4 Pair Unpacking",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Unpack one byte into two 4-bit codes as [low_nibble, high_nibble], the inverse of int4 pair packing.\n\nThe signature is int4_pair_unpack(byte).",
    starterCode: `def int4_pair_unpack(byte):
    # Your code here
    pass`,
    solution: `def int4_pair_unpack(byte):
    return [byte & 0xF, (byte >> 4) & 0xF]`,
    testCases: [
      { input: [83], expected: [3, 5] },
      { input: [240], expected: [0, 15] },
      { input: [15], expected: [15, 0] },
      { input: [0], expected: [0, 0] },
    ],
    hint: "Mask the low 4 bits, then shift the byte right by 4 for the second code.",
  },
  {
    id: "dl-345",
    title: "Zero-Point Computation",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the asymmetric zero point: step = (max - min) / (2^bits - 1), z = round(qmin - min/step) clamped to [qmin, qmax], where qmin/qmax are -2^(bits-1) and 2^(bits-1)-1 for signed mode, or 0 and 2^bits-1 otherwise. A constant range returns 0. Return an integer.\n\nThe signature is zero_point_computation(min_val, max_val, bits=8, signed=True).",
    starterCode: `def zero_point_computation(min_val, max_val, bits=8, signed=True):
    # Your code here
    pass`,
    solution: `def zero_point_computation(min_val, max_val, bits=8, signed=True):
    step = (max_val - min_val) / (2 ** bits - 1)
    if step == 0.0:
        return 0
    if signed:
        qmin = -(2 ** (bits - 1))
        qmax = 2 ** (bits - 1) - 1
    else:
        qmin = 0
        qmax = 2 ** bits - 1
    z = round(qmin - min_val / step)
    if z < qmin:
        z = qmin
    if z > qmax:
        z = qmax
    return z`,
    testCases: [
      { input: [-1.0, 2.0, 8, true], expected: -43 },
      { input: [-0.5, 1.5, 8, true], expected: -64 },
      { input: [-1.5, 0.5, 8, true], expected: 63 },
      { input: [0.0, 0.0, 8, true], expected: 0 },
      { input: [-2.0, 3.0, 4, true], expected: -2 },
    ],
    hint: "The zero point shifts the real zero into the integer code grid.",
  },
  {
    id: "dl-346",
    title: "Symmetric vs Asymmetric Quant Error",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Compare MSE of symmetric and asymmetric int quantization. Symmetric uses scale = max(|x|) / (2^(bits-1)-1) with codes clamped to +/-qmax; asymmetric uses step = (max-min)/(2^bits-1) and the zero point implied by round((x-min)/step). Return [sym_mse, asym_mse].\n\nThe signature is symmetric_vs_asymmetric_mse(values, bits=8).",
    starterCode: `def symmetric_vs_asymmetric_mse(values, bits=8):
    # Your code here
    pass`,
    solution: `def symmetric_vs_asymmetric_mse(values, bits=8):
    n = len(values)
    qmax = 2 ** (bits - 1) - 1
    amax = max(abs(v) for v in values)
    st = amax / qmax if amax > 0 else 0.0
    sym = 0.0
    for v in values:
        if st == 0.0:
            d = 0.0
        else:
            q = round(v / st)
            if q > qmax:
                q = qmax
            if q < -qmax:
                q = -qmax
            d = q * st
        sym += (v - d) ** 2
    lo = min(values)
    hi = max(values)
    step = (hi - lo) / (2 ** bits - 1)
    asym = 0.0
    for v in values:
        if step == 0.0:
            d = lo
        else:
            q = round((v - lo) / step)
            if q > 2 ** bits - 1:
                q = 2 ** bits - 1
            if q < 0:
                q = 0
            d = q * step + lo
        asym += (v - d) ** 2
    return [sym / n, asym / n]`,
    testCases: [
      { input: [[-1.0, 1.0], 8], expected: [0.0, 0.0] },
      { input: [[-1.0, 0.0, 0.5], 8], expected: [5.166677000020648e-06, 0.0] },
      { input: [[-3.0, 4.0, 1.0], 4], expected: [0.013605442176870777, 0.013333333333333357] },
      { input: [[0.0, 0.0], 8], expected: [0.0, 0.0] },
    ],
    hint: "Asymmetric quantization uses the full code range but pays for a zero point.",
  },
  {
    id: "dl-347",
    title: "Group Size vs Error Tradeoff",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Quantize values in contiguous groups of group_size with a per-group symmetric scale, then report [mse, overhead_bytes_per_value], where overhead = scale_bytes * ceil(n/group_size) / n.\n\nThe signature is group_size_tradeoff(values, group_size, bits=4, scale_bytes=2).",
    starterCode: `def group_size_tradeoff(values, group_size, bits=4, scale_bytes=2):
    # Your code here
    pass`,
    solution: `def group_size_tradeoff(values, group_size, bits=4, scale_bytes=2):
    qmax = 2 ** (bits - 1) - 1
    n = len(values)
    total = 0.0
    for start in range(0, n, group_size):
        chunk = values[start:start + group_size]
        amax = max(abs(v) for v in chunk)
        sc = amax / qmax if amax > 0 and qmax > 0 else 0.0
        for v in chunk:
            if sc == 0.0:
                d = 0.0
            else:
                q = round(v / sc)
                if q > qmax:
                    q = qmax
                if q < -qmax:
                    q = -qmax
                d = q * sc
            total += (v - d) ** 2
    groups = (n + group_size - 1) // group_size
    return [total / n, scale_bytes * groups / n]`,
    testCases: [
      { input: [[1.0, -1.0, 1.0, -1.0], 2, 4, 2], expected: [0.0, 1.0] },
      { input: [[1.0, 0.0, 0.0, 0.0], 4, 4, 2], expected: [0.0, 0.5] },
      { input: [[1.0, 2.0, 3.0, 4.0], 2, 4, 2], expected: [0.010204081632653083, 1.0] },
      { input: [[0.0, 0.0], 1, 4, 2], expected: [0.0, 2.0] },
    ],
    hint: "Smaller groups reduce error but add one scale per group.",
  },
  {
    id: "dl-348",
    title: "Quantization Memory Savings Ratio",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the fraction of fp16 memory saved by quantization: 1 - quant_bytes / (2 * num_params), where quant_bytes = num_params*bits/8 plus one scale of scale_bits bits per group when group_size > 0. Zero parameters returns 0.0.\n\nThe signature is quantization_memory_savings(num_params, bits=4, group_size=0, scale_bits=16).",
    starterCode: `def quantization_memory_savings(num_params, bits=4, group_size=0, scale_bits=16):
    # Your code here
    pass`,
    solution: `def quantization_memory_savings(num_params, bits=4, group_size=0, scale_bits=16):
    if num_params == 0:
        return 0.0
    quant_bytes = num_params * bits / 8.0
    if group_size > 0:
        quant_bytes += (num_params // group_size) * scale_bits / 8.0
    return 1.0 - quant_bytes / (num_params * 2.0)`,
    testCases: [
      { input: [1000000, 4, 0], expected: 0.75 },
      { input: [1000000, 4, 64], expected: 0.734375 },
      { input: [1000000, 8, 0], expected: 0.5 },
      { input: [100, 16, 0], expected: 0.0 },
      { input: [0, 4, 0], expected: 0.0 },
    ],
    hint: "Finer groups shrink the payload but the scale overhead grows in the denominator.",
  },
  {
    id: "dl-349",
    title: "Average Bits Per Weight",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the parameter-weighted average bit width across layers: sum(params_i * bits_i) / sum(params_i). An all-zero parameter count returns 0.0.\n\nThe signature is average_bits_per_weight(layer_params, layer_bits).",
    starterCode: `def average_bits_per_weight(layer_params, layer_bits):
    # Your code here
    pass`,
    solution: `def average_bits_per_weight(layer_params, layer_bits):
    total = sum(layer_params)
    if total == 0:
        return 0.0
    return sum(layer_params[i] * layer_bits[i] for i in range(len(layer_params))) / total`,
    testCases: [
      { input: [[1000, 3000], [4, 16]], expected: 13.0 },
      { input: [[1, 1], [8, 8]], expected: 8.0 },
      { input: [[100, 0], [4, 16]], expected: 4.0 },
      { input: [[1, 2], [3, 6]], expected: 5.0 },
    ],
    hint: "Mixed-precision reports average more parameters in high precision.",
  },
  {
    id: "dl-350",
    title: "Effective Bits With Overhead",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the effective bits per weight including scale overhead: bits + scale_bits / group_size. A non-positive group_size means no overhead, so return bits as a float.\n\nThe signature is effective_bits_with_overhead(bits, group_size, scale_bits=16).",
    starterCode: `def effective_bits_with_overhead(bits, group_size, scale_bits=16):
    # Your code here
    pass`,
    solution: `def effective_bits_with_overhead(bits, group_size, scale_bits=16):
    if group_size <= 0:
        return float(bits)
    return bits + scale_bits / float(group_size)`,
    testCases: [
      { input: [4, 64, 16], expected: 4.25 },
      { input: [4, 128, 16], expected: 4.125 },
      { input: [8, 32, 16], expected: 8.5 },
      { input: [16, 0, 16], expected: 16.0 },
      { input: [4, 32, 8], expected: 4.25 },
    ],
    hint: "A group of 64 int4 weights plus a 16-bit scale costs 4.25 bits per weight.",
  },
  {
    id: "dl-351",
    title: "Quantization Latency Model",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Model quantized inference latency as the sum of weight-loading time, dequantization time, and compute time: weight_bytes / (bandwidth_gbps * 1e6) + dequant_ms + compute_ms. Bandwidth is in GB/s and the memory term is in milliseconds.\n\nThe signature is quantization_latency_model(weight_bytes, bandwidth_gbps, dequant_ms, compute_ms).",
    starterCode: `def quantization_latency_model(weight_bytes, bandwidth_gbps, dequant_ms, compute_ms):
    # Your code here
    pass`,
    solution: `def quantization_latency_model(weight_bytes, bandwidth_gbps, dequant_ms, compute_ms):
    memory_ms = weight_bytes / (bandwidth_gbps * 1e6)
    return memory_ms + dequant_ms + compute_ms`,
    testCases: [
      { input: [1000000000, 1000, 1.0, 2.0], expected: 4.0 },
      { input: [0, 1000, 0.5, 0.0], expected: 0.5 },
      { input: [500000000, 500, 0.25, 3.0], expected: 4.25 },
      { input: [100000, 100, 0.0, 0.0], expected: 0.001 },
    ],
    hint: "At small batch sizes weight loading dominates, so lower bits cut latency directly.",
  },
  {
    id: "dl-352",
    title: "Weight-Only vs Activation Quant",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compare memory for weight-only versus weight+activation quantization. weight_bytes and activation_bytes are fp16 sizes; return [weight_only_bytes, full_bytes] where weight-only keeps activations at 16 bits and full quantizes activations too.\n\nThe signature is weight_only_vs_activation_quant(weight_bytes, activation_bytes, weight_bits, activation_bits).",
    starterCode: `def weight_only_vs_activation_quant(weight_bytes, activation_bytes, weight_bits, activation_bits):
    # Your code here
    pass`,
    solution: `def weight_only_vs_activation_quant(weight_bytes, activation_bytes, weight_bits, activation_bits):
    w = weight_bytes * weight_bits / 16.0 + activation_bytes
    full = weight_bytes * weight_bits / 16.0 + activation_bytes * activation_bits / 16.0
    return [w, full]`,
    testCases: [
      { input: [1000, 200, 4, 8], expected: [450.0, 350.0] },
      { input: [0, 100, 4, 8], expected: [100.0, 50.0] },
      { input: [1000, 0, 4, 4], expected: [250.0, 250.0] },
    ],
    hint: "Weight-only quantization is easier but leaves activation memory untouched.",
  },
  {
    id: "dl-353",
    title: "Outlier Channel Mixed Storage",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Account for outlier channels in mixed-precision storage. Channels whose max absolute value exceeds threshold are stored at high_bits, the rest at low_bits, each channel holding elements_per_channel values. Return [num_high_channels, total_bits].\n\nThe signature is outlier_channel_storage(channel_max_abs, threshold, low_bits=4, high_bits=8, elements_per_channel=1).",
    starterCode: `def outlier_channel_storage(channel_max_abs, threshold, low_bits=4, high_bits=8, elements_per_channel=1):
    # Your code here
    pass`,
    solution: `def outlier_channel_storage(channel_max_abs, threshold, low_bits=4, high_bits=8, elements_per_channel=1):
    high = 0
    for m in channel_max_abs:
        if m > threshold:
            high += 1
    n = len(channel_max_abs)
    total = (high * high_bits + (n - high) * low_bits) * elements_per_channel
    return [high, total]`,
    testCases: [
      { input: [[1.0, 5.0, 0.5, 20.0], 4.0, 4, 8, 1], expected: [2, 24] },
      { input: [[1.0, 2.0], 10.0, 4, 16, 100], expected: [0, 800] },
      { input: [[5.0], 1.0, 4, 8, 10], expected: [1, 80] },
      { input: [[0.0, 0.0], -1.0, 8, 16, 1], expected: [2, 32] },
    ],
    hint: "Keeping a few outlier channels wide is cheaper than widening the whole tensor.",
  },
  {
    id: "dl-354",
    title: "Mixed Precision Layer Assignment",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Assign layers to higher precision under a byte budget. Upgrading layer i costs extra = layer_bytes[i] * (high_multiplier - 1) and yields sensitivity[i]; greedily pick upgrades by sensitivity per extra byte (ties by lower index) while the budget allows. Return the chosen indices in ascending order.\n\nThe signature is mixed_precision_assignment(layer_bytes, sensitivities, budget_bytes, high_multiplier=2.0).",
    starterCode: `def mixed_precision_assignment(layer_bytes, sensitivities, budget_bytes, high_multiplier=2.0):
    # Your code here
    pass`,
    solution: `def mixed_precision_assignment(layer_bytes, sensitivities, budget_bytes, high_multiplier=2.0):
    extras = [layer_bytes[i] * (high_multiplier - 1.0) for i in range(len(layer_bytes))]
    order = sorted(range(len(layer_bytes)), key=lambda i: (-sensitivities[i] / extras[i] if extras[i] > 0 else 0.0, i))
    chosen = []
    used = 0.0
    for i in order:
        if used + extras[i] <= budget_bytes:
            chosen.append(i)
            used += extras[i]
    return sorted(chosen)`,
    testCases: [
      { input: [[10, 20, 30], [5, 4, 3], 25], expected: [0] },
      { input: [[10, 20, 30], [5, 4, 3], 35], expected: [0, 1] },
      { input: [[10, 20, 30], [5, 4, 3], 0], expected: [] },
      { input: [[10, 20, 30], [5, 4, 3], 1000], expected: [0, 1, 2] },
      { input: [[10, 10], [5, 5], 10], expected: [0] },
    ],
    hint: "This is a greedy knapsack: prioritize sensitivity gained per extra byte spent.",
  },
  {
    id: "dl-355",
    title: "QAT Fine-Tune Step",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Take one QAT fine-tune step with the straight-through estimator: w_new = w - lr*grad inside the clipping range |w| <= clip, and w_new = w outside it. Apply element-wise and return the new weight list.\n\nThe signature is qat_finetune_step(w, grad, lr, clip=1.0).",
    starterCode: `def qat_finetune_step(w, grad, lr, clip=1.0):
    # Your code here
    pass`,
    solution: `def qat_finetune_step(w, grad, lr, clip=1.0):
    out = []
    for i in range(len(w)):
        if abs(w[i]) <= clip:
            out.append(w[i] - lr * grad[i])
        else:
            out.append(w[i])
    return out`,
    testCases: [
      { input: [[1.0, -1.0], [0.1, 0.2], 0.5, 1.0], expected: [0.95, -1.1] },
      { input: [[2.0], [1.0], 1.0, 1.0], expected: [2.0] },
      { input: [[0.0, 0.5], [1.0, 1.0], 0.1, 2.0], expected: [-0.1, 0.4] },
      { input: [[1.0, 2.0], [1.0, 1.0], 0.5, 0.0], expected: [1.0, 2.0] },
    ],
    hint: "Weights outside the clip range receive no gradient under the clipped STE.",
  },
  {
    id: "dl-356",
    title: "Dequant Fusion Cost",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute memory traffic with and without dequantization fusion. Unfused traffic is quant_bytes + 2*dequant_bytes (write then re-read); fused traffic is quant_bytes. Return [unfused_bytes, fused_bytes, saved_bytes].\n\nThe signature is dequant_fusion_cost(quant_bytes, dequant_bytes).",
    starterCode: `def dequant_fusion_cost(quant_bytes, dequant_bytes):
    # Your code here
    pass`,
    solution: `def dequant_fusion_cost(quant_bytes, dequant_bytes):
    unfused = quant_bytes + 2.0 * dequant_bytes
    fused = float(quant_bytes)
    return [unfused, fused, unfused - fused]`,
    testCases: [
      { input: [100, 400], expected: [900.0, 100.0, 800.0] },
      { input: [0, 100], expected: [200.0, 0.0, 200.0] },
      { input: [50, 0], expected: [50.0, 50.0, 0.0] },
      { input: [100, 100], expected: [300.0, 100.0, 200.0] },
    ],
    hint: "Fusing dequant into the consumer avoids materializing the fp16 tensor in memory.",
  },
  {
    id: "dl-357",
    title: "Scale Granularity Error Ratio",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the ratio of per-tensor to per-group quantization MSE for a weight matrix. Groups are contiguous chunks of group_size columns using a per-group symmetric scale; return mse_tensor / mse_group, or 1.0 when the group error is zero.\n\nThe signature is granularity_error_ratio(W, group_size, bits=8).",
    starterCode: `def granularity_error_ratio(W, group_size, bits=8):
    # Your code here
    pass`,
    solution: `def granularity_error_ratio(W, group_size, bits=8):
    qmax = 2 ** (bits - 1) - 1
    amax = 0.0
    for row in W:
        for v in row:
            if abs(v) > amax:
                amax = abs(v)
    st = amax / qmax if amax > 0 else 0.0
    t_err = 0.0
    g_err = 0.0
    for row in W:
        for start in range(0, len(row), group_size):
            chunk = row[start:start + group_size]
            gm = max(abs(v) for v in chunk)
            sc = gm / qmax if gm > 0 else 0.0
            for v in chunk:
                if st == 0.0:
                    dt = 0.0
                else:
                    q = round(v / st)
                    if q > qmax:
                        q = qmax
                    if q < -qmax:
                        q = -qmax
                    dt = q * st
                if sc == 0.0:
                    dg = 0.0
                else:
                    q = round(v / sc)
                    if q > qmax:
                        q = qmax
                    if q < -qmax:
                        q = -qmax
                    dg = q * sc
                t_err += (v - dt) ** 2
                g_err += (v - dg) ** 2
    if g_err == 0.0:
        return 1.0
    return t_err / g_err`,
    testCases: [
      { input: [[[1.0, 0.7, 50.0, 0.3], [100.0, 0.0, 1.0, 0.6]], 2, 8], expected: 43.05562614711239 },
      { input: [[[3.0, 2.0, 1.0, 0.0]], 2, 8], expected: 2.0 },
      { input: [[[0.0, 0.0]], 2, 8], expected: 1.0 },
      { input: [[[1.0, 0.0], [100.0, 0.0]], 2, 8], expected: 1.0 },
    ],
    hint: "The ratio grows with the spread of per-group dynamic ranges.",
  },
  {
    id: "dl-358",
    title: "Quantized Matmul Error Bound",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Bound the output error of a quantized dot product: with every weight off by at most weight_error in absolute value, the output error is bounded by sum(|x_i|) * |weight_error|. Return the bound.\n\nThe signature is quantized_matmul_error_bound(x, weight_error).",
    starterCode: `def quantized_matmul_error_bound(x, weight_error):
    # Your code here
    pass`,
    solution: `def quantized_matmul_error_bound(x, weight_error):
    return sum(abs(v) for v in x) * abs(weight_error)`,
    testCases: [
      { input: [[1.0, -2.0, 3.0], 0.01], expected: 0.06 },
      { input: [[], 0.5], expected: 0.0 },
      { input: [[0.0, 0.0], 1.0], expected: 0.0 },
      { input: [[-1.5], 0.2], expected: 0.3 },
    ],
    hint: "The bound follows from the triangle inequality applied term by term.",
  },
  {
    id: "dl-359",
    title: "Dynamic Activation Quantization",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Quantize activations dynamically: scale = max(|x|) / (2^(bits-1)-1), then round each value to the nearest code clamped to +/-qmax. Return [scale, codes]; an all-zero tensor returns [0.0, zeros].\n\nThe signature is dynamic_activation_quant(x, bits=8).",
    starterCode: `def dynamic_activation_quant(x, bits=8):
    # Your code here
    pass`,
    solution: `def dynamic_activation_quant(x, bits=8):
    qmax = 2 ** (bits - 1) - 1
    amax = max(abs(v) for v in x)
    if amax == 0.0:
        return [0.0, [0] * len(x)]
    scale = amax / qmax
    codes = []
    for v in x:
        q = round(v / scale)
        if q > qmax:
            q = qmax
        if q < -qmax:
            q = -qmax
        codes.append(int(q))
    return [scale, codes]`,
    testCases: [
      { input: [[1.0, -0.5, 0.25], 8], expected: [0.007874015748031496, [127, -64, 32]] },
      { input: [[0, 0], 8], expected: [0.0, [0, 0]] },
      { input: [[2.0], 4], expected: [0.2857142857142857, [7]] },
      { input: [[1.0, 2.0, 3.0], 4], expected: [0.42857142857142855, [2, 5, 7]] },
    ],
    hint: "Dynamic quantization computes the scale at runtime from the current tensor.",
  },
  {
    id: "dl-360",
    title: "Static Activation Quantization",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Quantize activations with a precomputed static scale: code = clamp(round(x/scale), qmin, qmax) applied element-wise. Return the list of integer codes; a zero scale yields zeros.\n\nThe signature is static_activation_quant(x, scale, qmin=-128, qmax=127).",
    starterCode: `def static_activation_quant(x, scale, qmin=-128, qmax=127):
    # Your code here
    pass`,
    solution: `def static_activation_quant(x, scale, qmin=-128, qmax=127):
    codes = []
    for v in x:
        if scale == 0.0:
            q = 0
        else:
            q = round(v / scale)
        if q > qmax:
            q = qmax
        if q < qmin:
            q = qmin
        codes.append(int(q))
    return codes`,
    testCases: [
      { input: [[1.0, -1.0], 0.01, -128, 127], expected: [100, -100] },
      { input: [[1000.0], 1.0, -128, 127], expected: [127] },
      { input: [[-1000.0], 1.0, -128, 127], expected: [-128] },
      { input: [[0.5], 0.5, -8, 7], expected: [1] },
    ],
    hint: "Static scales are calibrated once and reused, so values saturate at qmin/qmax.",
  },
  {
    id: "dl-361",
    title: "Per-Token Quant Scales",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute per-token (per-row) quantization scales as max(|row|) / (2^(bits-1)-1), the LLM.int8 style scaling that isolates outlier tokens. Return 0.0 for an all-zero row.\n\nThe signature is per_token_scales(activations, bits=8).",
    starterCode: `def per_token_scales(activations, bits=8):
    # Your code here
    pass`,
    solution: `def per_token_scales(activations, bits=8):
    qmax = 2 ** (bits - 1) - 1
    out = []
    for row in activations:
        amax = max(abs(v) for v in row)
        out.append(amax / qmax if amax > 0 else 0.0)
    return out`,
    testCases: [
      { input: [[[1.0, -2.0], [0.5, 0.5]], 8], expected: [0.015748031496062992, 0.003937007874015748] },
      { input: [[[0.0, 0.0]], 8], expected: [0.0] },
      { input: [[[4.0]], 4], expected: [0.5714285714285714] },
    ],
    hint: "Per-token scales stop one loud token from widening every other token range.",
  },
  {
    id: "dl-362",
    title: "Rotation-Based Outlier Smoothing",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Smooth outlier channels with a Givens rotation: rotate each consecutive pair (x[2i], x[2i+1]) by angle_rad in radians, y[2i] = c*x[2i] - s*x[2i+1] and y[2i+1] = s*x[2i] + c*x[2i+1]. An odd trailing element is copied unchanged.\n\nThe signature is rotation_outlier_smoothing(x, angle_rad).",
    starterCode: `import math
def rotation_outlier_smoothing(x, angle_rad):
    # Your code here
    pass`,
    solution: `import math
def rotation_outlier_smoothing(x, angle_rad):
    c = math.cos(angle_rad)
    s = math.sin(angle_rad)
    out = []
    i = 0
    while i + 1 < len(x):
        out.append(c * x[i] - s * x[i + 1])
        out.append(s * x[i] + c * x[i + 1])
        i += 2
    if i < len(x):
        out.append(x[i])
    return out`,
    testCases: [
      { input: [[1.0, 0.0], 0.7853981633974483], expected: [0.7071067811865476, 0.7071067811865475] },
      { input: [[100.0, 0.0], 0.7853981633974483], expected: [70.71067811865476, 70.71067811865474] },
      { input: [[1.0, 0.0, 5.0], 0.0], expected: [1.0, 0.0, 5.0] },
      { input: [[0.0, 0.0], 1.5707963267948966], expected: [0.0, 0.0] },
    ],
    hint: "Rotating an outlier spreads its magnitude across channels, shrinking amax.",
  },
  {
    id: "dl-363",
    title: "Quantization Noise SNR",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Compute the quantization signal-to-noise ratio in dB: step = (max-min)/(2^bits-1), noise power = step^2/12, signal power = mean(x^2), and return 10*log10(signal/noise). Zero signal or zero noise returns 0.0.\n\nThe signature is quantization_noise_snr(values, bits=8).",
    starterCode: `import math
def quantization_noise_snr(values, bits=8):
    # Your code here
    pass`,
    solution: `import math
def quantization_noise_snr(values, bits=8):
    lo = min(values)
    hi = max(values)
    step = (hi - lo) / (2 ** bits - 1)
    noise = step * step / 12.0
    signal = sum(v * v for v in values) / len(values)
    if noise == 0.0 or signal == 0.0:
        return 0.0
    return 10.0 * math.log10(signal / noise)`,
    testCases: [
      { input: [[1.0, -1.0], 8], expected: 52.90201615587573 },
      { input: [[0.0, 1.0], 4], expected: 31.303337684950062 },
      { input: [[0.0, 0.0], 8], expected: 0.0 },
      { input: [[0.5, 1.5, 2.0], 8], expected: 58.75871190727366 },
    ],
    hint: "Each extra bit adds roughly 6 dB of SNR under a fixed full-scale range.",
  },
  {
    id: "dl-364",
    title: "Calibration Set Size Effect",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Estimate calibration range underestimation: with num_samples samples the expected maximum of a uniform range misses the true max by true_max / (num_samples + 1). A non-positive sample count returns true_max.\n\nThe signature is calibration_range_error(true_max, num_samples).",
    starterCode: `def calibration_range_error(true_max, num_samples):
    # Your code here
    pass`,
    solution: `def calibration_range_error(true_max, num_samples):
    if num_samples <= 0:
        return float(true_max)
    return true_max / (num_samples + 1.0)`,
    testCases: [
      { input: [10.0, 99], expected: 0.1 },
      { input: [5.0, 4], expected: 1.0 },
      { input: [1.0, 0], expected: 1.0 },
      { input: [3.0, 9], expected: 0.3 },
    ],
    hint: "The expected maximum of n uniform samples is M*n/(n+1), leaving an M/(n+1) gap.",
  },
  {
    id: "dl-365",
    title: "Quantized KV Cache Size",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute quantized KV cache size in bytes: 2 (keys and values) * num_layers * num_kv_heads * seq_len * head_dim * bits/8 * batch. This is the memory each active sequence holds during decoding.\n\nThe signature is quantized_kv_cache(num_layers, num_kv_heads, seq_len, head_dim, bits=8, batch=1).",
    starterCode: `def quantized_kv_cache(num_layers, num_kv_heads, seq_len, head_dim, bits=8, batch=1):
    # Your code here
    pass`,
    solution: `def quantized_kv_cache(num_layers, num_kv_heads, seq_len, head_dim, bits=8, batch=1):
    return 2.0 * num_layers * num_kv_heads * seq_len * head_dim * (bits / 8.0) * batch`,
    testCases: [
      { input: [32, 8, 1024, 128, 8, 1], expected: 67108864.0 },
      { input: [1, 1, 4, 2, 4, 1], expected: 8.0 },
      { input: [2, 4, 8, 64, 16, 3], expected: 49152.0 },
      { input: [0, 4, 8, 64, 8, 1], expected: 0.0 },
    ],
    hint: "KV cache bits scale linearly with context length, so int8 halves long-context memory.",
  },
];
