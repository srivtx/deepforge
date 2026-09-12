import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "dl-231",
    title: "U-Net Skip Connection Shape",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "List the U-Net encoder shapes level by level. Starting at 64 channels, every level halves the spatial dimensions with floor division and doubles the channel count.\n\nThe signature is unet_skip_shape(input_h, input_w, depth). Return [[h, w, channels], ...] for levels 0 through depth.",
    starterCode: `def unet_skip_shape(input_h, input_w, depth):
    # Your code here
    pass`,
    solution: `def unet_skip_shape(input_h, input_w, depth):
    out = []
    for level in range(depth + 1):
        out.append([input_h >> level, input_w >> level, 64 * (2 ** level)])
    return out`,
    testCases: [
      { input: [32, 32, 2], expected: [[32, 32, 64], [16, 16, 128], [8, 8, 256]] },
      { input: [16, 24, 1], expected: [[16, 24, 64], [8, 12, 128]] },
      { input: [8, 8, 0], expected: [[8, 8, 64]] },
      { input: [5, 5, 1], expected: [[5, 5, 64], [2, 2, 128]] },
    ],
    hint: "Skip connections need encoder and decoder shapes to match exactly at every level.",
  },
  {
    id: "dl-232",
    title: "DeepLab Output Stride",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the spatial resolution after a chain of strided convolutions: the output stride is the product of the strides, and the resolution is ceil(input_size / product).\n\nThe signature is deeplab_output_resolution(input_size, strides). Return an integer.",
    starterCode: `def deeplab_output_resolution(input_size, strides):
    # Your code here
    pass`,
    solution: `def deeplab_output_resolution(input_size, strides):
    prod = 1
    for s in strides:
        prod *= s
    return (input_size + prod - 1) // prod`,
    testCases: [
      { input: [224, [2, 2, 2, 2]], expected: 14 },
      { input: [128, [2, 2, 2]], expected: 16 },
      { input: [65, [2, 2]], expected: 17 },
      { input: [64, [1, 1]], expected: 64 },
    ],
    hint: "Dilated convolutions let DeepLab keep output stride 16 or 8 without losing field of view.",
  },
  {
    id: "dl-233",
    title: "Object Query Count",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Given a fixed set of DETR-style object queries and the number of real objects in an image, return [matched, unmatched]: the queries assigned to objects and the remaining queries that must predict the no-object class.\n\nThe signature is object_query_count(num_queries, num_objects). Return two integers.",
    starterCode: `def object_query_count(num_queries, num_objects):
    # Your code here
    pass`,
    solution: `def object_query_count(num_queries, num_objects):
    return [num_objects, num_queries - num_objects]`,
    testCases: [
      { input: [100, 7], expected: [7, 93] },
      { input: [10, 10], expected: [10, 0] },
      { input: [5, 2], expected: [2, 3] },
      { input: [20, 0], expected: [0, 20] },
    ],
    hint: "DETR pads every image to a fixed number of queries and learns to output no-object for the extras.",
  },
  {
    id: "dl-234",
    title: "MBConv Parameter Count",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Count the weights of an MBConv block without biases: expansion 1x1 (in_channels * hidden), depthwise kernel (hidden * k * k) and projection 1x1 (hidden * out_channels), where hidden = in_channels * expand_ratio.\n\nThe signature is mbconv_param_count(in_channels, out_channels, kernel_size, expand_ratio). Return an integer.",
    starterCode: `def mbconv_param_count(in_channels, out_channels, kernel_size, expand_ratio):
    # Your code here
    pass`,
    solution: `def mbconv_param_count(in_channels, out_channels, kernel_size, expand_ratio):
    hidden = in_channels * expand_ratio
    return in_channels * hidden + hidden * kernel_size * kernel_size + hidden * out_channels`,
    testCases: [
      { input: [24, 24, 3, 6], expected: 8208 },
      { input: [16, 24, 3, 6], expected: 4704 },
      { input: [1, 1, 3, 1], expected: 11 },
      { input: [32, 16, 5, 4], expected: 9344 },
    ],
    hint: "Depthwise convolution uses one kernel per channel, so its weight count is small.",
  },
  {
    id: "dl-235",
    title: "DeiT Distillation Token",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Prepend both special tokens used by DeiT: first the class token, then the distillation token, followed by the patch embeddings.\n\nThe signature is deit_distill_token(x, cls_token, distill_token). Return the new token sequence.",
    starterCode: `def deit_distill_token(x, cls_token, distill_token):
    # Your code here
    pass`,
    solution: `def deit_distill_token(x, cls_token, distill_token):
    return [list(cls_token), list(distill_token)] + [list(row) for row in x]`,
    testCases: [
      { input: [[[1.0, 2.0], [3.0, 4.0]], [0.0, 0.0], [9.0, 9.0]], expected: [[0.0, 0.0], [9.0, 9.0], [1.0, 2.0], [3.0, 4.0]] },
      { input: [[[1.0]], [1.0], [2.0]], expected: [[1.0], [2.0], [1.0]] },
      { input: [[], [0.0], [0.0]], expected: [[0.0], [0.0]] },
      { input: [[[5.0, 6.0]], [0.5, 0.5], [-0.5, -0.5]], expected: [[0.5, 0.5], [-0.5, -0.5], [5.0, 6.0]] },
    ],
    hint: "The distillation token learns from the teacher's hard labels while the class token learns from ground-truth labels.",
  },
  {
    id: "dl-236",
    title: "SimMIM Head Output Dim",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "The SimMIM reconstruction head predicts raw pixel values for each masked patch. Given the patch size and output channels, the head's output dimension is patch_size^2 * out_channels.\n\nThe signature is simmim_head_output_dim(patch_size, out_channels). Return an integer.",
    starterCode: `def simmim_head_output_dim(patch_size, out_channels):
    # Your code here
    pass`,
    solution: `def simmim_head_output_dim(patch_size, out_channels):
    return patch_size * patch_size * out_channels`,
    testCases: [
      { input: [16, 3], expected: 768 },
      { input: [4, 1], expected: 16 },
      { input: [32, 3], expected: 3072 },
      { input: [8, 4], expected: 256 },
    ],
    hint: "A linear head over patch tokens predicts all pixels of the patch at once.",
  },
  {
    id: "dl-237",
    title: "LLaVA Projector Params",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Count the parameters of the two-layer MLP projector that maps vision features into the language model's embedding space: vision_dim*hidden + hidden + hidden*llm_dim + llm_dim.\n\nThe signature is llava_projector_params(vision_dim, llm_dim, hidden_dim). Return an integer.",
    starterCode: `def llava_projector_params(vision_dim, llm_dim, hidden_dim):
    # Your code here
    pass`,
    solution: `def llava_projector_params(vision_dim, llm_dim, hidden_dim):
    return vision_dim * hidden_dim + hidden_dim + hidden_dim * llm_dim + llm_dim`,
    testCases: [
      { input: [1024, 4096, 4096], expected: 20979712 },
      { input: [768, 4096, 4096], expected: 19931136 },
      { input: [1024, 1024, 1024], expected: 2099200 },
      { input: [1, 1, 1], expected: 4 },
    ],
    hint: "The projector is tiny compared to the vision encoder and the language model.",
  },
  {
    id: "dl-238",
    title: "Q-Former Query Tokens",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Count the learned query embedding parameters of a Q-Former: num_queries * d_model, since each query token is a free vector.\n\nThe signature is qformer_query_params(num_queries, d_model). Return an integer.",
    starterCode: `def qformer_query_params(num_queries, d_model):
    # Your code here
    pass`,
    solution: `def qformer_query_params(num_queries, d_model):
    return num_queries * d_model`,
    testCases: [
      { input: [32, 768], expected: 24576 },
      { input: [1, 1], expected: 1 },
      { input: [64, 1024], expected: 65536 },
      { input: [0, 512], expected: 0 },
    ],
    hint: "A small set of queries compresses a variable-length image into fixed-length features.",
  },
  {
    id: "dl-239",
    title: "VAE Encoder Stride Chain",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "List the spatial resolutions produced by the downsampling blocks of a VAE encoder, each of which halves the previous size with floor division.\n\nThe signature is vae_encoder_strides(input_size, num_downsamples). Return the list of resolutions after each downsample.",
    starterCode: `def vae_encoder_strides(input_size, num_downsamples):
    # Your code here
    pass`,
    solution: `def vae_encoder_strides(input_size, num_downsamples):
    out = []
    size = input_size
    for _ in range(num_downsamples):
        size //= 2
        out.append(size)
    return out`,
    testCases: [
      { input: [256, 3], expected: [128, 64, 32] },
      { input: [512, 4], expected: [256, 128, 64, 32] },
      { input: [224, 2], expected: [112, 56] },
      { input: [32, 1], expected: [16] },
    ],
    hint: "Stable Diffusion's VAE downsamples by a factor of 8 in total.",
  },
  {
    id: "dl-240",
    title: "ControlNet Zero-Conv Params",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "ControlNet adds trainable zero convolutions whose weights and biases start at zero. Count their parameters: out_channels * in_channels + out_channels.\n\nThe signature is zero_conv_init_params(in_channels, out_channels). Return an integer.",
    starterCode: `def zero_conv_init_params(in_channels, out_channels):
    # Your code here
    pass`,
    solution: `def zero_conv_init_params(in_channels, out_channels):
    return out_channels * in_channels + out_channels`,
    testCases: [
      { input: [320, 320], expected: 102720 },
      { input: [1, 1], expected: 2 },
      { input: [64, 128], expected: 8320 },
      { input: [256, 256], expected: 65792 },
    ],
    hint: "Zero initialization makes the control branch an identity at the start of training.",
  },
  {
    id: "dl-241",
    title: "x0 Prediction From Epsilon",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Recover the clean latent from a noisy sample and the predicted noise: x0 = (x_t - sqrt(1 - alpha_bar_t) * eps) / sqrt(alpha_bar_t).\n\nThe signature is x0_from_epsilon(x_t, eps, alpha_bar_t). All values are scalars.",
    starterCode: `import math
def x0_from_epsilon(x_t, eps, alpha_bar_t):
    # Your code here
    pass`,
    solution: `import math
def x0_from_epsilon(x_t, eps, alpha_bar_t):
    return (x_t - math.sqrt(1.0 - alpha_bar_t) * eps) / math.sqrt(alpha_bar_t)`,
    testCases: [
      { input: [1.0, 0.0, 0.5], expected: 1.4142135624 },
      { input: [0.0, 1.0, 0.25], expected: -1.7320508076 },
      { input: [2.0, 0.5, 0.25], expected: 3.1339745962 },
      { input: [1.0, 1.0, 1.0], expected: 1.0 },
    ],
    hint: "The x0 estimate is the backbone of DDIM-style deterministic samplers.",
  },
  {
    id: "dl-242",
    title: "v-Prediction Conversion",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Convert a v-prediction back to the clean sample: x0 = sqrt(alpha_bar_t) * x_t - sqrt(1 - alpha_bar_t) * v.\n\nThe signature is v_prediction_to_x0(x_t, v, alpha_bar_t). All values are scalars.",
    starterCode: `import math
def v_prediction_to_x0(x_t, v, alpha_bar_t):
    # Your code here
    pass`,
    solution: `import math
def v_prediction_to_x0(x_t, v, alpha_bar_t):
    return math.sqrt(alpha_bar_t) * x_t - math.sqrt(1.0 - alpha_bar_t) * v`,
    testCases: [
      { input: [1.0, 0.0, 0.5], expected: 0.7071067812 },
      { input: [1.0, 1.0, 1.0], expected: 1.0 },
      { input: [0.0, 1.0, 0.0], expected: -1.0 },
      { input: [2.0, 0.5, 0.25], expected: 0.5669872981 },
    ],
    hint: "v-prediction stays well-conditioned at both very low and very high noise levels.",
  },
  {
    id: "dl-243",
    title: "SNR Weighting",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the signal-to-noise ratio implied by a cumulative alpha bar: SNR = alpha_bar / (1 - alpha_bar).\n\nThe signature is snr_weighting(alpha_bar_t).",
    starterCode: `def snr_weighting(alpha_bar_t):
    # Your code here
    pass`,
    solution: `def snr_weighting(alpha_bar_t):
    return alpha_bar_t / (1.0 - alpha_bar_t)`,
    testCases: [
      { input: [0.5], expected: 1.0 },
      { input: [0.9], expected: 9.0 },
      { input: [0.25], expected: 0.3333333333 },
      { input: [0.0], expected: 0.0 },
    ],
    hint: "SNR decreases monotonically as the diffusion timestep grows.",
  },
  {
    id: "dl-244",
    title: "Min-SNR Gamma Weight",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the min-SNR loss weight: min(SNR, gamma) / SNR, which caps the emphasis on high-SNR (easy) timesteps.\n\nThe signature is min_snr_weight(alpha_bar_t, gamma=5.0).",
    starterCode: `def min_snr_weight(alpha_bar_t, gamma=5.0):
    # Your code here
    pass`,
    solution: `def min_snr_weight(alpha_bar_t, gamma=5.0):
    snr = alpha_bar_t / (1.0 - alpha_bar_t)
    if snr > gamma:
        snr = gamma
    return snr / (alpha_bar_t / (1.0 - alpha_bar_t))`,
    testCases: [
      { input: [0.5, 5.0], expected: 1.0 },
      { input: [0.9, 5.0], expected: 0.5555555556 },
      { input: [0.25, 5.0], expected: 1.0 },
      { input: [0.99, 5.0], expected: 0.0505050505 },
    ],
    hint: "The cap prevents easy low-noise steps from dominating the training gradient.",
  },
  {
    id: "dl-245",
    title: "Mipmap Level Choice",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Choose the mipmap level for a texture given how many texels map to one pixel: level = max(0, floor(log2(texels_per_pixel))).\n\nThe signature is mipmap_level(texels_per_pixel). Return an integer.",
    starterCode: `import math
def mipmap_level(texels_per_pixel):
    # Your code here
    pass`,
    solution: `import math
def mipmap_level(texels_per_pixel):
    level = int(math.floor(math.log2(texels_per_pixel)))
    if level < 0:
        level = 0
    return level`,
    testCases: [
      { input: [4.0], expected: 2 },
      { input: [1.0], expected: 0 },
      { input: [8.0], expected: 3 },
      { input: [0.5], expected: 0 },
    ],
    hint: "Minification needs blurrier mip levels to avoid aliasing.",
  },
  {
    id: "dl-246",
    title: "Depth Buffer Test",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Test whether a new fragment passes the depth buffer: it does only when its depth is strictly smaller (closer) than the stored depth.\n\nThe signature is depth_buffer_test(new_depth, old_depth). Return a boolean.",
    starterCode: `def depth_buffer_test(new_depth, old_depth):
    # Your code here
    pass`,
    solution: `def depth_buffer_test(new_depth, old_depth):
    return new_depth < old_depth`,
    testCases: [
      { input: [0.5, 1.0], expected: true },
      { input: [1.0, 0.5], expected: false },
      { input: [0.5, 0.5], expected: false },
      { input: [0.0, 100.0], expected: true },
    ],
    hint: "The z-test is the core visibility rule of rasterization and neural rendering.",
  },
  {
    id: "dl-247",
    title: "HRNet Fusion Step",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Fuse a low-resolution branch into a high-resolution branch. Upsample the low-resolution vector by repeating each element (len(high_res) / len(low_res) times), then return high_res + weight * upsampled.\n\nThe signature is hrnet_fusion_step(low_res, high_res, weight). The lengths must divide evenly.",
    starterCode: `def hrnet_fusion_step(low_res, high_res, weight):
    # Your code here
    pass`,
    solution: `def hrnet_fusion_step(low_res, high_res, weight):
    factor = len(high_res) // len(low_res)
    up = [low_res[i // factor] for i in range(len(high_res))]
    return [high_res[i] + weight * up[i] for i in range(len(high_res))]`,
    testCases: [
      { input: [[1.0, 2.0], [10.0, 20.0, 30.0, 40.0], 0.5], expected: [10.5, 20.5, 31.0, 41.0] },
      { input: [[0.0, 0.0], [1.0, 1.0, 1.0, 1.0], 1.0], expected: [1.0, 1.0, 1.0, 1.0] },
      { input: [[5.0], [2.0, 4.0], 0.5], expected: [4.5, 6.5] },
      { input: [[1.0, 2.0, 3.0], [0.0, 0.0, 0.0, 0.0, 0.0, 0.0], 1.0], expected: [1.0, 1.0, 2.0, 2.0, 3.0, 3.0] },
    ],
    hint: "HRNet keeps a high-resolution stream alive and fuses lower-resolution streams into it repeatedly.",
  },
  {
    id: "dl-248",
    title: "Transformer Segmentation Head",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Apply a linear segmentation head to every patch token and return the argmax class per token, breaking ties by the smaller class index.\n\nThe signature is seg_head_forward(features, W, b). features is (num_tokens, d), W is (num_classes, d) and b has length num_classes.",
    starterCode: `def seg_head_forward(features, W, b):
    # Your code here
    pass`,
    solution: `def seg_head_forward(features, W, b):
    out = []
    for row in features:
        logits = [sum(W[c][j] * row[j] for j in range(len(row))) + b[c] for c in range(len(W))]
        best = 0
        for c in range(1, len(logits)):
            if logits[c] > logits[best]:
                best = c
        out.append(best)
    return out`,
    testCases: [
      { input: [[[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], [0.0, 0.0]], expected: [0, 1] },
      { input: [[[1.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], [0.0, 0.0]], expected: [0] },
      { input: [[[2.0, 1.0]], [[0.0, 0.0], [1.0, 1.0]], [0.0, 0.0]], expected: [1] },
      { input: [[[1.0, 2.0], [3.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], [-1.0, 1.0]], expected: [1, 0] },
    ],
    hint: "A per-patch linear classifier turns transformer tokens into a segmentation map.",
  },
  {
    id: "dl-249",
    title: "Mask Query Decode",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Decode a mask from a query embedding: the mask logit at each spatial position is the dot product between the query and that position's feature vector.\n\nThe signature is mask_query_decode(query, mask_features). Return the list of logits.",
    starterCode: `def mask_query_decode(query, mask_features):
    # Your code here
    pass`,
    solution: `def mask_query_decode(query, mask_features):
    return [sum(query[j] * row[j] for j in range(len(query))) for row in mask_features]`,
    testCases: [
      { input: [[1.0, 0.0], [[1.0, 2.0], [0.0, 1.0], [2.0, 2.0]]], expected: [1.0, 0.0, 2.0] },
      { input: [[0.0, 1.0], [[1.0, 2.0], [0.0, 1.0], [2.0, 2.0]]], expected: [2.0, 1.0, 2.0] },
      { input: [[1.0, 1.0], [[1.0, 2.0], [0.0, 1.0], [2.0, 2.0]]], expected: [3.0, 1.0, 4.0] },
      { input: [[2.0], [[1.0], [3.0]]], expected: [2.0, 6.0] },
    ],
    hint: "Mask queries act like dynamic convolution kernels over the feature map.",
  },
  {
    id: "dl-250",
    title: "Deformable Attention Sample Points",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the sampling locations of deformable attention: each location is reference + offset, clamped to the normalized [0, 1] range.\n\nThe signature is deformable_sample_points(reference, offsets). Return the list of [x, y] locations.",
    starterCode: `def deformable_sample_points(reference, offsets):
    # Your code here
    pass`,
    solution: `def deformable_sample_points(reference, offsets):
    out = []
    for off in offsets:
        x = reference[0] + off[0]
        y = reference[1] + off[1]
        if x < 0.0:
            x = 0.0
        if x > 1.0:
            x = 1.0
        if y < 0.0:
            y = 0.0
        if y > 1.0:
            y = 1.0
        out.append([x, y])
    return out`,
    testCases: [
      { input: [[0.5, 0.5], [[0.1, 0.0], [-0.1, 0.2], [0.0, -0.6]]], expected: [[0.6, 0.5], [0.4, 0.7], [0.5, 0.0]] },
      { input: [[0.0, 1.0], [[-0.5, 0.5]]], expected: [[0.0, 1.0]] },
      { input: [[0.5, 0.5], []], expected: [] },
      { input: [[0.9, 0.1], [[0.2, -0.2], [-1.0, 1.0]]], expected: [[1.0, 0.0], [0.0, 1.0]] },
    ],
    hint: "Offsets are usually predicted per query, head and sampling point, then interpolated bilinearly.",
  },
  {
    id: "dl-251",
    title: "Swin Window Partition",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Partition a 2D grid into non-overlapping window_size x window_size patches, scanning windows row-major and flattening each window row-major.\n\nThe signature is swin_window_partition(grid, window_size). Return the list of flattened windows.",
    starterCode: `def swin_window_partition(grid, window_size):
    # Your code here
    pass`,
    solution: `def swin_window_partition(grid, window_size):
    h = len(grid)
    w = len(grid[0])
    out = []
    for i in range(0, h, window_size):
        for j in range(0, w, window_size):
            win = []
            for a in range(window_size):
                for b in range(window_size):
                    win.append(grid[i + a][j + b])
            out.append(win)
    return out`,
    testCases: [
      { input: [[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]], 2], expected: [[1, 2, 5, 6], [3, 4, 7, 8], [9, 10, 13, 14], [11, 12, 15, 16]] },
      { input: [[[1, 2], [3, 4]], 2], expected: [[1, 2, 3, 4]] },
      { input: [[[1, 2, 3, 4], [5, 6, 7, 8]], 2], expected: [[1, 2, 5, 6], [3, 4, 7, 8]] },
      { input: [[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]], 4], expected: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]] },
    ],
    hint: "Local windows cut attention cost from quadratic in image size to linear for a fixed window.",
  },
  {
    id: "dl-252",
    title: "Relative Position Bias Index",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Build the 1D relative position index matrix used by Swin's bias table: index[i][j] = (i - j) + seq_len - 1, which maps relative offsets to a bias-table row.\n\nThe signature is relative_position_bias_index(seq_len).",
    starterCode: `def relative_position_bias_index(seq_len):
    # Your code here
    pass`,
    solution: `def relative_position_bias_index(seq_len):
    return [[(i - j) + seq_len - 1 for j in range(seq_len)] for i in range(seq_len)]`,
    testCases: [
      { input: [3], expected: [[2, 1, 0], [3, 2, 1], [4, 3, 2]] },
      { input: [1], expected: [[0]] },
      { input: [2], expected: [[1, 0], [2, 1]] },
      { input: [4], expected: [[3, 2, 1, 0], [4, 3, 2, 1], [5, 4, 3, 2], [6, 5, 4, 3]] },
    ],
    hint: "The index matrix lets one learned table cover every relative offset inside a window.",
  },
  {
    id: "dl-253",
    title: "MLP-Mixer Token Mixing",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Apply the token-mixing MLP of an MLP-Mixer: mix information across tokens with W @ tokens, where W is (num_tokens, num_tokens).\n\nThe signature is mlp_mixer_token_mixing(tokens, W). tokens is (num_tokens, channels) and the output has the same shape.",
    starterCode: `def mlp_mixer_token_mixing(tokens, W):
    # Your code here
    pass`,
    solution: `def mlp_mixer_token_mixing(tokens, W):
    T = len(tokens)
    C = len(tokens[0])
    return [[sum(W[i][k] * tokens[k][j] for k in range(T)) for j in range(C)] for i in range(T)]`,
    testCases: [
      { input: [[[1.0, 2.0], [3.0, 4.0]], [[1.0, 0.0], [0.0, 1.0]]], expected: [[1.0, 2.0], [3.0, 4.0]] },
      { input: [[[1.0, 2.0], [3.0, 4.0]], [[0.5, 0.5], [0.5, 0.5]]], expected: [[2.0, 3.0], [2.0, 3.0]] },
      { input: [[[1.0, 0.0], [0.0, 1.0]], [[1.0, 1.0], [1.0, 0.0]]], expected: [[1.0, 1.0], [1.0, 0.0]] },
      { input: [[[1.0, 2.0, 3.0]], [[2.0]]], expected: [[2.0, 4.0, 6.0]] },
    ],
    hint: "Mixer alternates token mixing (across positions) and channel mixing (within positions).",
  },
  {
    id: "dl-254",
    title: "gMLP Gating Unit",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Apply the gMLP gating unit: split the channel dimension in half and multiply the first half element-wise by the second half.\n\nThe signature is gmlp_gating_unit(x). x must have even length; the output has half the length.",
    starterCode: `def gmlp_gating_unit(x):
    # Your code here
    pass`,
    solution: `def gmlp_gating_unit(x):
    half = len(x) // 2
    return [x[j] * x[half + j] for j in range(half)]`,
    testCases: [
      { input: [[1.0, 2.0, 3.0, 4.0]], expected: [3.0, 8.0] },
      { input: [[0.0, 1.0, 2.0, 3.0]], expected: [0.0, 3.0] },
      { input: [[1.0, 2.0]], expected: [2.0] },
      { input: [[-1.0, 2.0, -3.0, 4.0]], expected: [3.0, 8.0] },
    ],
    hint: "The multiplicative gate is what lets gMLP rival attention on some tasks.",
  },
  {
    id: "dl-255",
    title: "EfficientNet Compound Scaling",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Scale width, depth and resolution together with the compound coefficients: [base_width * alpha^phi, base_depth * beta^phi, base_res * gamma^phi].\n\nThe signature is efficientnet_compound_scaling(base_width, base_depth, base_res, phi, alpha=1.2, beta=1.1, gamma=1.15).",
    starterCode: `def efficientnet_compound_scaling(base_width, base_depth, base_res, phi, alpha=1.2, beta=1.1, gamma=1.15):
    # Your code here
    pass`,
    solution: `def efficientnet_compound_scaling(base_width, base_depth, base_res, phi, alpha=1.2, beta=1.1, gamma=1.15):
    return [base_width * alpha ** phi, base_depth * beta ** phi, base_res * gamma ** phi]`,
    testCases: [
      { input: [1.0, 1.0, 224.0, 1], expected: [1.2, 1.1, 257.6] },
      { input: [1.0, 1.0, 224.0, 2], expected: [1.44, 1.21, 296.24] },
      { input: [1.0, 1.0, 224.0, 0], expected: [1.0, 1.0, 224.0] },
      { input: [1.5, 2.0, 128.0, 1], expected: [1.8, 2.2, 147.2] },
    ],
    hint: "Compound scaling beat scaling just one dimension because accuracy depends on all three jointly.",
  },
  {
    id: "dl-256",
    title: "RegNet Width Formula",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Generate RegNet stage widths: the unquantized width at stage i is w0 + wa * i, quantized to the nearest multiple of wm using floor(u / wm + 0.5) * wm.\n\nThe signature is regnet_width(w0, wa, wm, depth). Return the list of widths.",
    starterCode: `def regnet_width(w0, wa, wm, depth):
    # Your code here
    pass`,
    solution: `def regnet_width(w0, wa, wm, depth):
    out = []
    for i in range(depth):
        u = w0 + wa * i
        q = int(u / wm + 0.5) * wm
        out.append(q)
    return out`,
    testCases: [
      { input: [24, 16, 8, 4], expected: [24, 40, 56, 72] },
      { input: [32, 8, 4, 3], expected: [32, 40, 48] },
      { input: [16, 24, 8, 3], expected: [16, 40, 64] },
      { input: [10, 10, 4, 3], expected: [12, 20, 32] },
    ],
    hint: "Quantizing widths to a fixed multiple made RegNet designs easy to search and reproduce.",
  },
  {
    id: "dl-257",
    title: "BEiT Tokenizer Target",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Map a patch's RGB values to the nearest codebook entry by squared Euclidean distance and return its index, breaking ties by the smaller index.\n\nThe signature is beit_tokenizer_target(patch_rgb, codebook). Return the codebook index.",
    starterCode: `def beit_tokenizer_target(patch_rgb, codebook):
    # Your code here
    pass`,
    solution: `def beit_tokenizer_target(patch_rgb, codebook):
    best = 0
    best_d = None
    for k in range(len(codebook)):
        d = sum((patch_rgb[j] - codebook[k][j]) ** 2 for j in range(len(patch_rgb)))
        if best_d is None or d < best_d:
            best_d = d
            best = k
    return best`,
    testCases: [
      { input: [[1.0, 0.0], [[1.0, 0.0], [0.0, 1.0], [0.5, 0.5]]], expected: 0 },
      { input: [[0.0, 1.0], [[1.0, 0.0], [0.0, 1.0], [0.5, 0.5]]], expected: 1 },
      { input: [[0.4, 0.6], [[1.0, 0.0], [0.0, 1.0], [0.5, 0.5]]], expected: 2 },
      { input: [[0.6, 0.4], [[1.0, 0.0], [0.0, 1.0]]], expected: 0 },
    ],
    hint: "BEiT predicts discrete visual tokens from a frozen dVAE tokenizer instead of raw pixels.",
  },
  {
    id: "dl-258",
    title: "DINO Self-Distillation Loss",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the DINO cross-entropy between the teacher's probability distribution and the student's logits: -sum_k teacher[k] * log softmax(student)[k], using a stable log-softmax.\n\nThe signature is dino_self_distillation(student_logits, teacher_probs).",
    starterCode: `import math
def dino_self_distillation(student_logits, teacher_probs):
    # Your code here
    pass`,
    solution: `import math
def dino_self_distillation(student_logits, teacher_probs):
    m = max(student_logits)
    exps = [math.exp(v - m) for v in student_logits]
    total = sum(exps)
    logp = [v - m - math.log(total) for v in student_logits]
    return -sum(teacher_probs[i] * logp[i] for i in range(len(teacher_probs)))`,
    testCases: [
      { input: [[0.0, 0.0], [0.5, 0.5]], expected: 0.6931471806 },
      { input: [[0.0, 1.0], [1.0, 0.0]], expected: 1.3132616875 },
      { input: [[-10.0, 10.0], [0.5, 0.5]], expected: 10.0000000021 },
      { input: [[1.0, 2.0, 3.0], [0.2, 0.3, 0.5]], expected: 1.1076059644 },
    ],
    hint: "The teacher is an EMA of the student, so the loss is a moving-target cross-entropy.",
  },
  {
    id: "dl-259",
    title: "SigLIP Sigmoid Loss",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the SigLIP pairwise sigmoid loss. For each pair with logit z and label y (1 for matched, 0 otherwise), the target is +1 or -1 and the loss term is softplus(-target * (temperature * z + bias)). Return the mean over all pairs.\n\nThe signature is siglip_loss(logits, labels, temperature=1.0, bias=0.0).",
    starterCode: `import math
def siglip_loss(logits, labels, temperature=1.0, bias=0.0):
    # Your code here
    pass`,
    solution: `import math
def siglip_loss(logits, labels, temperature=1.0, bias=0.0):
    total = 0.0
    count = 0
    for i in range(len(logits)):
        for j in range(len(logits[0])):
            z = 1.0 if labels[i][j] == 1 else -1.0
            x = z * (temperature * logits[i][j] + bias)
            if x >= 0:
                total += math.log1p(math.exp(-x))
            else:
                total += -x + math.log1p(math.exp(x))
            count += 1
    return total / count`,
    testCases: [
      { input: [[[0.0]], [[1]], 1.0, 0.0], expected: 0.6931471806 },
      { input: [[[0.0]], [[0]], 1.0, 0.0], expected: 0.6931471806 },
      { input: [[[1.0, -1.0], [-1.0, 1.0]], [[1, 0], [0, 1]], 0.5, 0.0], expected: 0.4740769842 },
      { input: [[[0.0, 0.0]], [[1, 0]], 1.0, 0.0], expected: 0.6931471806 },
    ],
    hint: "SigLIP drops the global softmax, so it needs no all-gather of the full similarity matrix.",
  },
  {
    id: "dl-260",
    title: "Flamingo Gated Cross-Attention",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute a gated cross-attention output: standard scaled dot-product attention from query over keys and values, multiplied by tanh(gate). The tanh gate starts at zero so the new branch is an identity at initialization.\n\nThe signature is flamingo_gated_cross_attention(query, keys, values, gate).",
    starterCode: `import math
def flamingo_gated_cross_attention(query, keys, values, gate):
    # Your code here
    pass`,
    solution: `import math
def flamingo_gated_cross_attention(query, keys, values, gate):
    d = len(query)
    scores = [sum(query[j] * keys[k][j] for j in range(d)) / math.sqrt(d) for k in range(len(keys))]
    m = max(scores)
    exps = [math.exp(v - m) for v in scores]
    total = sum(exps)
    weights = [e / total for e in exps]
    ctx = [sum(weights[k] * values[k][j] for k in range(len(values))) for j in range(len(values[0]))]
    g = math.tanh(gate)
    return [g * c for c in ctx]`,
    testCases: [
      { input: [[1.0, 0.0], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 2.0], [3.0, 4.0]], 0.0], expected: [0.0, 0.0] },
      { input: [[1.0, 0.0], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 2.0], [3.0, 4.0]], 1.0], expected: [1.2646095042, 2.0262036601] },
      { input: [[1.0, 1.0], [[1.0, 0.0]], [[5.0, 6.0]], 2.0], expected: [4.8201379004, 5.7841654805] },
      { input: [[0.0, 0.0], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], -1.0], expected: [-0.380797078, -0.380797078] },
    ],
    hint: "Gated cross-attention layers are inserted between frozen language-model blocks and trained on interleaved data.",
  },
  {
    id: "dl-261",
    title: "SAM Prompt Encoder",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Build sparse prompt embeddings for the Segment Anything prompt encoder. Each point contributes [x, y, is_positive, is_background], where the label 1 sets is_positive and the label 0 sets is_background.\n\nThe signature is sam_prompt_encoder(points, labels). Return the list of embeddings.",
    starterCode: `def sam_prompt_encoder(points, labels):
    # Your code here
    pass`,
    solution: `def sam_prompt_encoder(points, labels):
    out = []
    for i in range(len(points)):
        row = [points[i][0], points[i][1]]
        row.append(1.0 if labels[i] == 1 else 0.0)
        row.append(1.0 if labels[i] == 0 else 0.0)
        out.append(row)
    return out`,
    testCases: [
      { input: [[[0.5, 0.5]], [1]], expected: [[0.5, 0.5, 1.0, 0.0]] },
      { input: [[[0.1, 0.2]], [0]], expected: [[0.1, 0.2, 0.0, 1.0]] },
      { input: [[[-0.5, 1.5], [0.3, 0.3]], [1, 0]], expected: [[-0.5, 1.5, 1.0, 0.0], [0.3, 0.3, 0.0, 1.0]] },
      { input: [[[0.0, 0.0]], [1]], expected: [[0.0, 0.0, 1.0, 0.0]] },
    ],
    hint: "Positive clicks select an object while negative clicks exclude regions.",
  },
  {
    id: "dl-262",
    title: "SAM Mask Decoder",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Decode binary masks by dotting each mask token against every image feature position and thresholding the logits at zero. Return one 0/1 mask per token.\n\nThe signature is sam_mask_decoder(image_features, mask_tokens). image_features is (num_positions, d) and mask_tokens is (num_masks, d).",
    starterCode: `def sam_mask_decoder(image_features, mask_tokens):
    # Your code here
    pass`,
    solution: `def sam_mask_decoder(image_features, mask_tokens):
    out = []
    for tok in mask_tokens:
        scores = [sum(image_features[p][j] * tok[j] for j in range(len(tok))) for p in range(len(image_features))]
        out.append([1 if s > 0.0 else 0 for s in scores])
    return out`,
    testCases: [
      { input: [[[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0]]], expected: [[1, 0]] },
      { input: [[[1.0, 0.0], [0.0, 1.0]], [[1.0, 1.0]]], expected: [[1, 1]] },
      { input: [[[1.0, 1.0], [1.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]]], expected: [[1, 1], [1, 1]] },
      { input: [[[-1.0, 0.0], [0.0, -1.0]], [[1.0, 0.0]]], expected: [[0, 0]] },
    ],
    hint: "Mask tokens act as dynamic filters over the upsampled image embedding.",
  },
  {
    id: "dl-263",
    title: "DreamBooth Prior Loss",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the prior-preservation loss of DreamBooth: the mean squared error between the model's prediction on class images and the sampled noise/velocity target.\n\nThe signature is dreambooth_prior_loss(prior_pred, prior_target).",
    starterCode: `def dreambooth_prior_loss(prior_pred, prior_target):
    # Your code here
    pass`,
    solution: `def dreambooth_prior_loss(prior_pred, prior_target):
    return sum((prior_pred[i] - prior_target[i]) ** 2 for i in range(len(prior_pred))) / len(prior_pred)`,
    testCases: [
      { input: [[1.0, 2.0], [1.0, 2.0]], expected: 0.0 },
      { input: [[1.0, 2.0], [2.0, 4.0]], expected: 2.5 },
      { input: [[0.5], [1.0]], expected: 0.25 },
      { input: [[-1.0, 0.0, 1.0], [0.0, 0.0, 0.0]], expected: 0.6666666667 },
    ],
    hint: "The prior loss keeps the class from drifting while the subject is learned.",
  },
  {
    id: "dl-264",
    title: "Textual Inversion Loss",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the textual inversion objective for one step: the mean squared diffusion loss plus lambda_reg times the squared L2 distance between the learned embedding and its reference embedding.\n\nThe signature is textual_inversion_loss(predicted_eps, target_eps, embedding, ref_embedding, lambda_reg).",
    starterCode: `def textual_inversion_loss(predicted_eps, target_eps, embedding, ref_embedding, lambda_reg):
    # Your code here
    pass`,
    solution: `def textual_inversion_loss(predicted_eps, target_eps, embedding, ref_embedding, lambda_reg):
    mse = sum((predicted_eps[i] - target_eps[i]) ** 2 for i in range(len(predicted_eps))) / len(predicted_eps)
    reg = sum((embedding[i] - ref_embedding[i]) ** 2 for i in range(len(embedding)))
    return mse + lambda_reg * reg`,
    testCases: [
      { input: [[1.0, 2.0], [0.0, 0.0], [1.0], [0.0], 1.0], expected: 3.5 },
      { input: [[0.0], [0.0], [1.0], [0.0], 0.5], expected: 0.5 },
      { input: [[1.0], [0.0], [0.0], [1.0], 0.25], expected: 1.25 },
      { input: [[1.0, 1.0], [1.0, 1.0], [1.0, 1.0], [1.0, 1.0], 2.0], expected: 0.0 },
    ],
    hint: "The regularizer prevents the new token embedding from straying too far from a real word.",
  },
  {
    id: "dl-265",
    title: "SDS Loss Gradient",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute one score-distillation-sampling gradient: w(t) * (eps_hat - eps) with weight w(t) = 1 - alpha_bar_t, where eps_hat is the frozen diffusion model's predicted noise.\n\nThe signature is sds_loss_gradient(eps_hat, eps, alpha_bar_t). Return the gradient vector.",
    starterCode: `def sds_loss_gradient(eps_hat, eps, alpha_bar_t):
    # Your code here
    pass`,
    solution: `def sds_loss_gradient(eps_hat, eps, alpha_bar_t):
    w = 1.0 - alpha_bar_t
    return [w * (eps_hat[i] - eps[i]) for i in range(len(eps_hat))]`,
    testCases: [
      { input: [[1.0, 2.0], [0.0, 0.0], 0.5], expected: [0.5, 1.0] },
      { input: [[0.0], [0.0], 0.0], expected: [0.0] },
      { input: [[2.0, 1.0], [1.0, 2.0], 0.25], expected: [0.75, -0.75] },
      { input: [[-1.0], [1.0], 0.75], expected: [-0.5] },
    ],
    hint: "SDS turns a pretrained diffusion model into a differentiable renderer for 3D generation.",
  },
  {
    id: "dl-266",
    title: "Mask IoU Head",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute intersection over union between a predicted and a target binary mask. If the union is empty, return 1.0.\n\nThe signature is mask_iou_head(pred_mask, target_mask). Return a float.",
    starterCode: `def mask_iou_head(pred_mask, target_mask):
    # Your code here
    pass`,
    solution: `def mask_iou_head(pred_mask, target_mask):
    inter = 0
    union = 0
    for i in range(len(pred_mask)):
        for j in range(len(pred_mask[i])):
            p = pred_mask[i][j]
            t = target_mask[i][j]
            if p == 1 and t == 1:
                inter += 1
            if p == 1 or t == 1:
                union += 1
    if union == 0:
        return 1.0
    return inter / union`,
    testCases: [
      { input: [[[1, 0], [0, 1]], [[1, 0], [0, 1]]], expected: 1.0 },
      { input: [[[1, 0], [0, 1]], [[0, 1], [0, 0]]], expected: 0.0 },
      { input: [[[1, 1], [1, 0]], [[1, 0], [1, 1]]], expected: 0.5 },
      { input: [[[0, 0]], [[0, 0]]], expected: 1.0 },
      { input: [[[1, 1], [1, 1]], [[1, 1], [0, 1]]], expected: 0.75 },
    ],
    hint: "The IoU head helps the decoder pick the best of several mask candidates.",
  },
  {
    id: "dl-267",
    title: "DETR Decoder Layer",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Forward pass of a simplified DETR decoder layer: cross-attend from queries x to encoder memory, add the residual and the ReLU MLP residual. With Q = xWq, K = memoryWk, V = memoryWv: a = x + softmax(QK^T / sqrt(d)) V Wo, and out = a + relu(a Wf + bf).\n\nThe signature is detr_decoder_layer(x, memory, Wq, Wk, Wv, Wo, Wf, bf).",
    starterCode: `import math
def detr_decoder_layer(x, memory, Wq, Wk, Wv, Wo, Wf, bf):
    # Your code here
    pass`,
    solution: `import math
def detr_decoder_layer(x, memory, Wq, Wk, Wv, Wo, Wf, bf):
    q = len(x)
    d = len(x[0])
    s = len(memory)
    Q = [[sum(x[i][k] * Wq[k][j] for k in range(d)) for j in range(d)] for i in range(q)]
    K = [[sum(memory[i][k] * Wk[k][j] for k in range(d)) for j in range(d)] for i in range(s)]
    V = [[sum(memory[i][k] * Wv[k][j] for k in range(d)) for j in range(d)] for i in range(s)]
    scale = 1.0 / math.sqrt(d)
    scores = [[sum(Q[i][k] * K[j][k] for k in range(d)) * scale for j in range(s)] for i in range(q)]
    weights = []
    for row in scores:
        m = max(row)
        exps = [math.exp(v - m) for v in row]
        total = sum(exps)
        weights.append([e / total for e in exps])
    attn = [[sum(weights[i][j] * V[j][k] for j in range(s)) for k in range(d)] for i in range(q)]
    proj = [[sum(attn[i][k] * Wo[k][j] for k in range(d)) for j in range(d)] for i in range(q)]
    a = [[x[i][j] + proj[i][j] for j in range(d)] for i in range(q)]
    out = []
    for i in range(q):
        h = [sum(a[i][k] * Wf[k][j] for k in range(d)) + bf[j] for j in range(d)]
        h = [max(0.0, v) for v in h]
        out.append([a[i][j] + h[j] for j in range(d)])
    return out`,
    testCases: [
      { input: [[[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], [0.0, 0.0]], expected: [[3.3395230987, 0.6604769013], [0.6604769013, 3.3395230987]] },
      { input: [[[1.0, 2.0]], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], [0.0, 0.0]], expected: [[2.6604769013, 5.3395230987]] },
      { input: [[[1.0, 0.0]], [[1.0, 0.0]], [[0.0, 0.0], [0.0, 0.0]], [[0.0, 0.0], [0.0, 0.0]], [[0.0, 0.0], [0.0, 0.0]], [[0.0, 0.0], [0.0, 0.0]], [[0.0, 0.0], [0.0, 0.0]], [0.0, 0.0]], expected: [[1.0, 0.0]] },
      { input: [[[1.0, 0.0]], [[1.0, 0.0]], [[0.5, 0.0], [0.0, 0.5]], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 1.0], [0.0, 1.0]], [0.1, 0.1]], expected: [[4.1, 2.1]] },
    ],
    hint: "Object queries attend to the encoder memory, so each query can specialize in a different object.",
  },
  {
    id: "dl-268",
    title: "IP-Adapter Decoupled Cross-Attention",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Combine text and image attention streams: out = attn(query, text_keys, text_values) + weight * attn(query, image_keys, image_values), where each attention is standard scaled dot-product attention.\n\nThe signature is ip_adapter_combine(query, text_keys, text_values, image_keys, image_values, weight).",
    starterCode: `import math
def ip_adapter_combine(query, text_keys, text_values, image_keys, image_values, weight):
    # Your code here
    pass`,
    solution: `import math
def ip_adapter_combine(query, text_keys, text_values, image_keys, image_values, weight):
    def attention(keys, values):
        d = len(query)
        scores = [sum(query[j] * keys[k][j] for j in range(d)) / math.sqrt(d) for k in range(len(keys))]
        m = max(scores)
        exps = [math.exp(v - m) for v in scores]
        total = sum(exps)
        w = [e / total for e in exps]
        return [sum(w[k] * values[k][j] for k in range(len(values))) for j in range(len(values[0]))]

    t = attention(text_keys, text_values)
    i = attention(image_keys, image_values)
    return [t[j] + weight * i[j] for j in range(len(t))]`,
    testCases: [
      { input: [[1.0, 0.0], [[1.0, 0.0]], [[1.0, 2.0]], [[1.0, 0.0]], [[3.0, 4.0]], 0.5], expected: [2.5, 4.0] },
      { input: [[1.0, 0.0], [[1.0, 0.0]], [[1.0, 2.0]], [[1.0, 0.0]], [[3.0, 4.0]], 0.0], expected: [1.0, 2.0] },
      { input: [[1.0, 0.0], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 2.0], [3.0, 4.0]], [[1.0, 0.0], [0.0, 1.0]], [[5.0, 6.0], [7.0, 8.0]], 1.0], expected: [7.3209538027, 9.3209538027] },
      { input: [[1.0, 1.0], [[1.0, 0.0]], [[2.0, 0.0]], [[0.0, 1.0]], [[0.0, 4.0]], 2.0], expected: [2.0, 8.0] },
    ],
    hint: "Decoupled cross-attention keeps the pretrained text path intact and learns a separate image path.",
  },
  {
    id: "dl-269",
    title: "Null-Text Inversion Step",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Apply a sequence of gradient descent updates to a null-text embedding: for each gradient vector in grads, update embedding = embedding - lr * grad in order.\n\nThe signature is null_text_inversion_step(embedding, grads, lr). Return the final embedding; an empty grads list leaves it unchanged.",
    starterCode: `def null_text_inversion_step(embedding, grads, lr):
    # Your code here
    pass`,
    solution: `def null_text_inversion_step(embedding, grads, lr):
    out = list(embedding)
    for g in grads:
        out = [out[j] - lr * g[j] for j in range(len(out))]
    return out`,
    testCases: [
      { input: [[1.0, 2.0], [[0.1, 0.2]], 0.5], expected: [0.95, 1.9] },
      { input: [[0.0], [[1.0], [0.5]], 0.5], expected: [-0.75] },
      { input: [[1.0, 0.0], [], 0.5], expected: [1.0, 0.0] },
      { input: [[-1.0], [[0.0]], 1.0], expected: [-1.0] },
    ],
    hint: "Null-text inversion optimizes the unconditional embedding so a real image can be reconstructed.",
  },
  {
    id: "dl-270",
    title: "DPM-Solver Step",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "One first-order DPM-Solver step in log-SNR space. With alpha = sqrt(alpha_bar), sigma = sqrt(1 - alpha_bar), lambda = log(alpha / sigma) and h = lambda_prev - lambda_t, the update is x_prev = (sigma_prev / sigma_t) * x_t - alpha_prev * (exp(-h) - 1) * eps_pred.\n\nThe signature is dpm_solver_step(x_t, eps_pred, alpha_bar_t, alpha_bar_prev). All values are scalars.",
    starterCode: `import math
def dpm_solver_step(x_t, eps_pred, alpha_bar_t, alpha_bar_prev):
    # Your code here
    pass`,
    solution: `import math
def dpm_solver_step(x_t, eps_pred, alpha_bar_t, alpha_bar_prev):
    alpha_t = math.sqrt(alpha_bar_t)
    sigma_t = math.sqrt(1.0 - alpha_bar_t)
    alpha_prev = math.sqrt(alpha_bar_prev)
    sigma_prev = math.sqrt(1.0 - alpha_bar_prev)
    lam_t = math.log(alpha_t / sigma_t)
    lam_prev = math.log(alpha_prev / sigma_prev)
    h = lam_prev - lam_t
    return (sigma_prev / sigma_t) * x_t - alpha_prev * (math.exp(-h) - 1.0) * eps_pred`,
    testCases: [
      { input: [1.0, 0.0, 0.5, 0.8], expected: 0.632455532 },
      { input: [0.5, 1.0, 0.2, 0.5], expected: 0.7488380981 },
      { input: [-1.0, 0.5, 0.3, 0.6], expected: -0.5756502792 },
      { input: [2.0, -1.0, 0.5, 0.9], expected: 0.261971659 },
    ],
    hint: "Solving the probability-flow ODE in log-SNR space makes the step sizes uniform.",
  },
  {
    id: "dl-271",
    title: "Euler Ancestral Step",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "One Euler ancestral sampling step. Estimate x0 = (x_t - sigma_t * eps) / alpha_t, compute sigma_up = sqrt((1 - ab_prev)/(1 - ab_t)) * sqrt(1 - ab_t/ab_prev) and sigma_down2 = max(0, 1 - ab_prev - sigma_up^2), then return sqrt(ab_prev) * x0 + sqrt(sigma_down2) * eps + sigma_up * noise, with one seeded random.gauss(0, 1) noise draw.\n\nThe signature is euler_ancestral_step(x_t, eps_pred, alpha_bar_t, alpha_bar_prev, seed). All values are scalars.",
    starterCode: `import math
import random
def euler_ancestral_step(x_t, eps_pred, alpha_bar_t, alpha_bar_prev, seed):
    # Your code here
    pass`,
    solution: `import math
import random
def euler_ancestral_step(x_t, eps_pred, alpha_bar_t, alpha_bar_prev, seed):
    random.seed(seed)
    alpha_t = math.sqrt(alpha_bar_t)
    sigma_t = math.sqrt(1.0 - alpha_bar_t)
    pred_x0 = (x_t - sigma_t * eps_pred) / alpha_t
    sigma_up = math.sqrt((1.0 - alpha_bar_prev) / (1.0 - alpha_bar_t)) * math.sqrt(1.0 - alpha_bar_t / alpha_bar_prev)
    sigma_down2 = 1.0 - alpha_bar_prev - sigma_up * sigma_up
    if sigma_down2 < 0.0:
        sigma_down2 = 0.0
    noise = random.gauss(0.0, 1.0)
    return math.sqrt(alpha_bar_prev) * pred_x0 + math.sqrt(sigma_down2) * eps_pred + sigma_up * noise`,
    testCases: [
      { input: [1.0, 0.0, 0.5, 0.8, 0], expected: 1.629635872 },
      { input: [0.0, 1.0, 0.25, 0.5, 1], expected: -0.0727627669 },
      { input: [2.0, 0.5, 0.5, 0.8, 42], expected: 2.1386059868 },
      { input: [1.0, 0.0, 0.9, 0.95, 7], expected: 0.9858930698 },
    ],
    hint: "Ancestral samplers inject fresh noise at every step, trading determinism for stochastic diversity.",
  },
  {
    id: "dl-272",
    title: "Fused Attention SRAM Tiles",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Size the query tile of a fused attention kernel. The SRAM must hold one query block and two key/value blocks of head_dim elements each, so block_rows = max(1, sram_bytes // (2 * elem_bytes * head_dim)) and num_blocks = ceil(seq_len / block_rows).\n\nThe signature is fused_attention_tiles(sram_bytes, elem_bytes, head_dim, seq_len). Return [block_rows, num_blocks].",
    starterCode: `def fused_attention_tiles(sram_bytes, elem_bytes, head_dim, seq_len):
    # Your code here
    pass`,
    solution: `def fused_attention_tiles(sram_bytes, elem_bytes, head_dim, seq_len):
    block_rows = sram_bytes // (2 * elem_bytes * head_dim)
    if block_rows < 1:
        block_rows = 1
    num_blocks = (seq_len + block_rows - 1) // block_rows
    return [block_rows, num_blocks]`,
    testCases: [
      { input: [16384, 2, 64, 1024], expected: [64, 16] },
      { input: [1024, 2, 128, 512], expected: [2, 256] },
      { input: [100000, 2, 64, 1000], expected: [390, 3] },
      { input: [64, 4, 8, 10], expected: [1, 10] },
    ],
    hint: "Flash attention streams K/V tiles through SRAM instead of materializing the score matrix in HBM.",
  },
  {
    id: "dl-273",
    title: "NeRF Density Integration",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Compute the per-sample weights of volume rendering: alpha_i = 1 - exp(-sigma_i * delta_i), transmittance T_i = prod_{j<i} (1 - alpha_j), and weight_i = T_i * alpha_i.\n\nThe signature is nerf_density_integration(sigmas, deltas). Return the list of weights.",
    starterCode: `import math
def nerf_density_integration(sigmas, deltas):
    # Your code here
    pass`,
    solution: `import math
def nerf_density_integration(sigmas, deltas):
    weights = []
    trans = 1.0
    for i in range(len(sigmas)):
        alpha = 1.0 - math.exp(-sigmas[i] * deltas[i])
        weights.append(trans * alpha)
        trans *= (1.0 - alpha)
    return weights`,
    testCases: [
      { input: [[1.0, 1.0, 1.0], [1.0, 1.0, 1.0]], expected: [0.6321205588, 0.2325441579, 0.0855482149] },
      { input: [[0.0, 0.0], [1.0, 1.0]], expected: [0.0, 0.0] },
      { input: [[1.0], [2.0]], expected: [0.8646647168] },
      { input: [[2.0, 0.0, 1.0], [0.5, 1.0, 0.5]], expected: [0.6321205588, 0.0, 0.144749281] },
    ],
    hint: "The weights sum to the total opacity along the ray and are used to composite colors.",
  },
  {
    id: "dl-274",
    title: "Gaussian Splat Projection",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Project a 3D Gaussian to 2D. Build R as a rotation about z and S2 = diag(scale^2), form the 3D covariance M = R S2 R^T, then return the 2x2 covariance W M W^T for the 2x3 view matrix W.\n\nThe signature is gaussian_splat_projection(scales, rotation, view_rows). scales is [sx, sy, sz].",
    starterCode: `import math
def gaussian_splat_projection(scales, rotation, view_rows):
    # Your code here
    pass`,
    solution: `import math
def gaussian_splat_projection(scales, rotation, view_rows):
    c = math.cos(rotation)
    s = math.sin(rotation)
    R = [[c, -s, 0.0], [s, c, 0.0], [0.0, 0.0, 1.0]]
    S2 = [[scales[0] * scales[0], 0.0, 0.0], [0.0, scales[1] * scales[1], 0.0], [0.0, 0.0, scales[2] * scales[2]]]

    def matmul(A, B):
        return [[sum(A[i][k] * B[k][j] for k in range(len(B))) for j in range(len(B[0]))] for i in range(len(A))]

    Rt = [[R[j][i] for j in range(3)] for i in range(3)]
    M = matmul(matmul(R, S2), Rt)
    W = view_rows
    Wt = [[W[j][i] for j in range(2)] for i in range(3)]
    return matmul(matmul(W, M), Wt)`,
    testCases: [
      { input: [[1.0, 1.0, 1.0], 0.0, [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0]]], expected: [[1.0, 0.0], [0.0, 1.0]] },
      { input: [[2.0, 1.0, 1.0], 0.0, [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0]]], expected: [[4.0, 0.0], [0.0, 1.0]] },
      { input: [[1.0, 1.0, 1.0], 1.5707963268, [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0]]], expected: [[1.0, 0.0], [0.0, 1.0]] },
      { input: [[2.0, 1.0, 1.0], 1.5707963268, [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0]]], expected: [[1.0, 0.0], [0.0, 4.0]] },
      { input: [[2.0, 3.0, 1.0], 0.0, [[0.0, 1.0, 0.0], [1.0, 0.0, 0.0]]], expected: [[9.0, 0.0], [0.0, 4.0]] },
    ],
    hint: "The 2D covariance drives the screen-space ellipse used for alpha compositing.",
  },
  {
    id: "dl-275",
    title: "Speculative Tree Attention Mask",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Build the attention mask for a speculative decoding tree. parents[i] gives the parent index of node i, or -1 for the root; node i attends to itself and all of its ancestors.\n\nThe signature is speculative_tree_mask(parents). Return the 0/1 mask matrix.",
    starterCode: `def speculative_tree_mask(parents):
    # Your code here
    pass`,
    solution: `def speculative_tree_mask(parents):
    n = len(parents)
    mask = [[0] * n for _ in range(n)]
    for i in range(n):
        node = i
        while node != -1:
            mask[i][node] = 1
            node = parents[node]
        mask[i][i] = 1
    return mask`,
    testCases: [
      { input: [[-1]], expected: [[1]] },
      { input: [[-1, 0, 0]], expected: [[1, 0, 0], [1, 1, 0], [1, 0, 1]] },
      { input: [[-1, 0, 1, 0]], expected: [[1, 0, 0, 0], [1, 1, 0, 0], [1, 1, 1, 0], [1, 0, 0, 1]] },
      { input: [[-1, 0, 1, 2]], expected: [[1, 0, 0, 0], [1, 1, 0, 0], [1, 1, 1, 0], [1, 1, 1, 1]] },
    ],
    hint: "Each draft branch only sees its own ancestors, so the tree can be verified in one forward pass.",
  },
];
