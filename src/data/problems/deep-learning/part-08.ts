import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "dl-276",
    title: "Conv Kernel Tiling",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Count the output tiles of a tiled convolution loop: tiles_h = ceil(output_h / tile_h), tiles_w = ceil(output_w / tile_w), and the total is their product.\n\nThe signature is conv_kernel_tiles(output_h, output_w, tile_h, tile_w). Return [tiles_h, tiles_w, total].",
    starterCode: `def conv_kernel_tiles(output_h, output_w, tile_h, tile_w):
    # Your code here
    pass`,
    solution: `def conv_kernel_tiles(output_h, output_w, tile_h, tile_w):
    th = (output_h + tile_h - 1) // tile_h
    tw = (output_w + tile_w - 1) // tile_w
    return [th, tw, th * tw]`,
    testCases: [
      { input: [28, 28, 8, 8], expected: [4, 4, 16] },
      { input: [13, 13, 8, 8], expected: [2, 2, 4] },
      { input: [1, 1, 1, 1], expected: [1, 1, 1] },
      { input: [56, 28, 16, 8], expected: [4, 4, 16] },
    ],
    hint: "Tiling keeps the working set in shared memory and registers.",
  },
  {
    id: "dl-277",
    title: "Tensor-Core Fragment Shape",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the work of one tensor-core matrix-multiply instruction of shape m x n x k: macs = m * n * k multiply-accumulates and flops = 2 * macs.\n\nThe signature is tensor_core_fragment(m, n, k). Return [macs, flops].",
    starterCode: `def tensor_core_fragment(m, n, k):
    # Your code here
    pass`,
    solution: `def tensor_core_fragment(m, n, k):
    macs = m * n * k
    return [macs, 2 * macs]`,
    testCases: [
      { input: [16, 8, 16], expected: [2048, 4096] },
      { input: [16, 16, 16], expected: [4096, 8192] },
      { input: [8, 8, 4], expected: [256, 512] },
      { input: [1, 1, 1], expected: [1, 2] },
    ],
    hint: "One multiply-accumulate counts as two floating point operations.",
  },
  {
    id: "dl-278",
    title: "Warp Tile Size",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the output elements owned by one warp tile and the accumulator registers per thread, assuming 32 threads per warp: elements = warp_m * warp_n, per_thread = elements // 32.\n\nThe signature is warp_tile_size(warp_m, warp_n). Return [elements, per_thread].",
    starterCode: `def warp_tile_size(warp_m, warp_n):
    # Your code here
    pass`,
    solution: `def warp_tile_size(warp_m, warp_n):
    elements = warp_m * warp_n
    return [elements, elements // 32]`,
    testCases: [
      { input: [64, 64], expected: [4096, 128] },
      { input: [32, 32], expected: [1024, 32] },
      { input: [16, 8], expected: [128, 4] },
      { input: [128, 64], expected: [8192, 256] },
    ],
    hint: "Accumulator registers often dominate register pressure in GEMM kernels.",
  },
  {
    id: "dl-279",
    title: "Kernel Launch Overhead",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the total kernel launch overhead in milliseconds: num_kernels * overhead_us / 1000.\n\nThe signature is kernel_launch_overhead(num_kernels, overhead_us).",
    starterCode: `def kernel_launch_overhead(num_kernels, overhead_us):
    # Your code here
    pass`,
    solution: `def kernel_launch_overhead(num_kernels, overhead_us):
    return num_kernels * overhead_us / 1000.0`,
    testCases: [
      { input: [100, 5.0], expected: 0.5 },
      { input: [1, 3.0], expected: 0.003 },
      { input: [1000, 2.5], expected: 2.5 },
      { input: [0, 5.0], expected: 0.0 },
    ],
    hint: "Launch overhead matters most for small kernels and eager execution.",
  },
  {
    id: "dl-280",
    title: "All-Gather Bytes",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the communication volume of an all-gather: each GPU sends its shard to the other num_gpus - 1 ranks, so sent bytes = (num_gpus - 1) * shard_bytes and every GPU ends with num_gpus * shard_bytes.\n\nThe signature is all_gather_bytes(shard_bytes, num_gpus). Return [sent_bytes, gathered_bytes].",
    starterCode: `def all_gather_bytes(shard_bytes, num_gpus):
    # Your code here
    pass`,
    solution: `def all_gather_bytes(shard_bytes, num_gpus):
    return [(num_gpus - 1) * shard_bytes, num_gpus * shard_bytes]`,
    testCases: [
      { input: [1000, 4], expected: [3000, 4000] },
      { input: [1, 1], expected: [0, 1] },
      { input: [500, 2], expected: [500, 1000] },
      { input: [100, 8], expected: [700, 800] },
    ],
    hint: "ZeRO-3 gathers parameters with all-gather before each layer's forward.",
  },
  {
    id: "dl-281",
    title: "Reduce-Scatter Bytes",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the communication volume of a reduce-scatter: each GPU sends (num_gpus - 1) / num_gpus of the full tensor and keeps one reduced shard of full_bytes / num_gpus.\n\nThe signature is reduce_scatter_bytes(full_bytes, num_gpus). Return [sent_bytes, result_bytes] as floats.",
    starterCode: `def reduce_scatter_bytes(full_bytes, num_gpus):
    # Your code here
    pass`,
    solution: `def reduce_scatter_bytes(full_bytes, num_gpus):
    return [(num_gpus - 1) * full_bytes / num_gpus, full_bytes / num_gpus]`,
    testCases: [
      { input: [4000, 4], expected: [3000.0, 1000.0] },
      { input: [1000, 1], expected: [0.0, 1000.0] },
      { input: [100, 2], expected: [50.0, 50.0] },
      { input: [8000, 8], expected: [7000.0, 1000.0] },
    ],
    hint: "Reduce-scatter halves the traffic of an all-reduce when combined with all-gather.",
  },
  {
    id: "dl-282",
    title: "Gradient Bucket Size",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute training bucket metadata: parameters per bucket = floor(cap_mb * 1024 * 1024 / bytes_per_param), and buckets needed = ceil(num_params / parameters_per_bucket).\n\nThe signature is gradient_bucket_size(num_params, bucket_cap_mb, bytes_per_param=4). Return [params_per_bucket, num_buckets].",
    starterCode: `def gradient_bucket_size(num_params, bucket_cap_mb, bytes_per_param=4):
    # Your code here
    pass`,
    solution: `def gradient_bucket_size(num_params, bucket_cap_mb, bytes_per_param=4):
    per_bucket = int(bucket_cap_mb * 1024 * 1024) // bytes_per_param
    num_buckets = (num_params + per_bucket - 1) // per_bucket
    return [per_bucket, num_buckets]`,
    testCases: [
      { input: [100000000, 100, 4], expected: [26214400, 4] },
      { input: [1000, 1, 4], expected: [262144, 1] },
      { input: [1000000, 4, 4], expected: [1048576, 1] },
      { input: [10000000, 1, 2], expected: [524288, 20] },
    ],
    hint: "Bucketing overlaps all-reduce with backward computation.",
  },
  {
    id: "dl-283",
    title: "FSDP Shard Size",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the per-GPU view of fully sharded data parallel parameters: params_per_gpu = ceil(num_params / num_gpus), and bytes_per_gpu = params_per_gpu * bytes_per_param.\n\nThe signature is fsdp_shard_size(num_params, num_gpus, bytes_per_param=4). Return [params_per_gpu, bytes_per_gpu].",
    starterCode: `def fsdp_shard_size(num_params, num_gpus, bytes_per_param=4):
    # Your code here
    pass`,
    solution: `def fsdp_shard_size(num_params, num_gpus, bytes_per_param=4):
    per = (num_params + num_gpus - 1) // num_gpus
    return [per, per * bytes_per_param]`,
    testCases: [
      { input: [1000000, 8, 4], expected: [125000, 500000] },
      { input: [1001, 8, 4], expected: [126, 504] },
      { input: [1, 1, 2], expected: [1, 2] },
      { input: [100, 3, 4], expected: [34, 136] },
    ],
    hint: "Each rank stores only its shard plus transient gathered parameters.",
  },
  {
    id: "dl-284",
    title: "Int4 Packing",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the storage bytes of packed int4 values: bits = num_values * 4, bytes = ceil(bits / 8).\n\nThe signature is int4_packed_bytes(num_values). Return an integer.",
    starterCode: `def int4_packed_bytes(num_values):
    # Your code here
    pass`,
    solution: `def int4_packed_bytes(num_values):
    return (num_values * 4 + 7) // 8`,
    testCases: [
      { input: [8], expected: 4 },
      { input: [1], expected: 1 },
      { input: [7], expected: 4 },
      { input: [16], expected: 8 },
      { input: [100], expected: 50 },
    ],
    hint: "Packing two int4 values per byte is why 4-bit models shrink 8x versus fp32.",
  },
  {
    id: "dl-285",
    title: "Per-Channel Scale Count",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Count per-channel, per-group quantization scales for a weight matrix: out_features * ceil(in_features / group_size).\n\nThe signature is per_channel_scale_count(out_features, in_features, group_size). Return an integer.",
    starterCode: `def per_channel_scale_count(out_features, in_features, group_size):
    # Your code here
    pass`,
    solution: `def per_channel_scale_count(out_features, in_features, group_size):
    return out_features * ((in_features + group_size - 1) // group_size)`,
    testCases: [
      { input: [4096, 4096, 128], expected: 131072 },
      { input: [4096, 4096, 4096], expected: 4096 },
      { input: [8, 16, 4], expected: 32 },
      { input: [1, 1, 1], expected: 1 },
    ],
    hint: "Group size 128 is the common sweet spot between accuracy and scale overhead.",
  },
  {
    id: "dl-286",
    title: "Operator Fusion Count",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Count fused kernel groups in a graph. Each group starts with any operator and absorbs every following operator that is fusable (bn, relu, add, mul); a non-fusable operator always starts a fresh group.\n\nThe signature is operator_fusion_count(ops). Return the number of groups.",
    starterCode: `def operator_fusion_count(ops):
    # Your code here
    pass`,
    solution: `def operator_fusion_count(ops):
    fusable = {"bn", "relu", "add", "mul"}
    groups = 0
    i = 0
    while i < len(ops):
        i += 1
        while i < len(ops) and ops[i] in fusable:
            i += 1
        groups += 1
    return groups`,
    testCases: [
      { input: [["conv"]], expected: 1 },
      { input: [["conv", "relu", "relu"]], expected: 1 },
      { input: [["conv", "pool", "relu"]], expected: 2 },
      { input: [["relu", "bn"]], expected: 1 },
      { input: [["conv", "bn", "relu", "pool", "relu"]], expected: 2 },
    ],
    hint: "Fewer groups means fewer kernel launches and less memory traffic.",
  },
  {
    id: "dl-287",
    title: "ONNX Runtime Partition Count",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Count the contiguous accelerator partitions when executing an ONNX graph: a new partition starts at a supported node that does not immediately follow the previously supported node. Sort the supported list first.\n\nThe signature is onnx_partition_count(num_nodes, supported). Return an integer.",
    starterCode: `def onnx_partition_count(num_nodes, supported):
    # Your code here
    pass`,
    solution: `def onnx_partition_count(num_nodes, supported):
    idxs = sorted(set(supported))
    count = 0
    prev = None
    for i in idxs:
        if prev is None or i != prev + 1:
            count += 1
        prev = i
    return count`,
    testCases: [
      { input: [5, [0, 1, 2]], expected: 1 },
      { input: [5, [1, 3]], expected: 2 },
      { input: [4, []], expected: 0 },
      { input: [4, [0, 1, 2, 3]], expected: 1 },
      { input: [6, [3, 4, 0, 5]], expected: 2 },
    ],
    hint: "Unsupported nodes force a fallback to CPU, splitting the accelerated graph.",
  },
  {
    id: "dl-288",
    title: "Replica Autoscaling",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the desired replica count from queue load: desired = ceil(current * queue_length / target_queue), clamped to [min_replicas, max_replicas].\n\nThe signature is autoscale_replicas(current, queue_length, target_queue, max_replicas, min_replicas=1). Return an integer.",
    starterCode: `import math
def autoscale_replicas(current, queue_length, target_queue, max_replicas, min_replicas=1):
    # Your code here
    pass`,
    solution: `import math
def autoscale_replicas(current, queue_length, target_queue, max_replicas, min_replicas=1):
    desired = int(math.ceil(current * queue_length / float(target_queue)))
    if desired < min_replicas:
        desired = min_replicas
    if desired > max_replicas:
        desired = max_replicas
    return desired`,
    testCases: [
      { input: [2, 100, 50, 10], expected: 4 },
      { input: [2, 0, 50, 10], expected: 1 },
      { input: [5, 200, 50, 6], expected: 6 },
      { input: [1, 50, 50, 4], expected: 1 },
    ],
    hint: "Clamping avoids both thrashing below one replica and unbounded scale-out.",
  },
  {
    id: "dl-289",
    title: "Model Warmup Iterations",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute how many warmup iterations are needed for latency to decay to the target: ceil(log(target / initial) / log(decay)). If the initial latency is already within budget, return 0.\n\nThe signature is model_warmup_iters(target_latency_ms, initial_latency_ms, decay). Return an integer.",
    starterCode: `import math
def model_warmup_iters(target_latency_ms, initial_latency_ms, decay):
    # Your code here
    pass`,
    solution: `import math
def model_warmup_iters(target_latency_ms, initial_latency_ms, decay):
    if initial_latency_ms <= target_latency_ms:
        return 0
    return int(math.ceil(math.log(target_latency_ms / initial_latency_ms) / math.log(decay)))`,
    testCases: [
      { input: [80.0, 200.0, 0.8], expected: 5 },
      { input: [10.0, 100.0, 0.5], expected: 4 },
      { input: [100.0, 100.0, 0.9], expected: 0 },
      { input: [50.0, 200.0, 0.5], expected: 2 },
    ],
    hint: "Warmup lets caches, JIT compilation and clocks stabilize before measurement.",
  },
  {
    id: "dl-290",
    title: "Cold-Start Saving",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the latency saved by caching a warm model: expected = cold * (1 - hit_rate) + warm * hit_rate, and saving = cold - expected.\n\nThe signature is cold_start_saving(warm_ms, cold_ms, cache_hit_rate).",
    starterCode: `def cold_start_saving(warm_ms, cold_ms, cache_hit_rate):
    # Your code here
    pass`,
    solution: `def cold_start_saving(warm_ms, cold_ms, cache_hit_rate):
    expected = cold_ms * (1.0 - cache_hit_rate) + warm_ms * cache_hit_rate
    return cold_ms - expected`,
    testCases: [
      { input: [100.0, 1000.0, 0.5], expected: 450.0 },
      { input: [100.0, 1000.0, 0.0], expected: 0.0 },
      { input: [100.0, 1000.0, 1.0], expected: 900.0 },
      { input: [200.0, 500.0, 0.8], expected: 240.0 },
    ],
    hint: "Keeping replicas warm is one of the most effective cold-start mitigations.",
  },
  {
    id: "dl-291",
    title: "Top-2 Gating Indices",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Return the indices of the two largest routing logits, breaking ties by the smaller index, sorted ascending.\n\nThe signature is top2_gating(logits). Return the two indices.",
    starterCode: `def top2_gating(logits):
    # Your code here
    pass`,
    solution: `def top2_gating(logits):
    order = sorted(range(len(logits)), key=lambda i: (-logits[i], i))
    return sorted(order[:2])`,
    testCases: [
      { input: [[1.0, 3.0, 2.0]], expected: [1, 2] },
      { input: [[5.0, 5.0, 5.0]], expected: [0, 1] },
      { input: [[0.0, -1.0, 2.0]], expected: [0, 2] },
      { input: [[1.0, 3.0, 2.0, 4.0]], expected: [1, 3] },
    ],
    hint: "Top-2 MoE routing activates two experts per token to combine specialization and smoothness.",
  },
  {
    id: "dl-292",
    title: "Winograd Transform Lite",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Apply the F(2,3) Winograd input transform to a 4-element tile: B^T d with rows computed as d0 - d2, d1 + d2, -d1 + d2, d1 - d3.\n\nThe signature is winograd_transform_1d(d). Return the transformed 4-vector.",
    starterCode: `def winograd_transform_1d(d):
    # Your code here
    pass`,
    solution: `def winograd_transform_1d(d):
    return [d[0] - d[2], d[1] + d[2], -d[1] + d[2], d[1] - d[3]]`,
    testCases: [
      { input: [[1.0, 2.0, 3.0, 4.0]], expected: [-2.0, 5.0, 1.0, -2.0] },
      { input: [[0.0, 0.0, 0.0, 0.0]], expected: [0.0, 0.0, 0.0, 0.0] },
      { input: [[2.0, 1.0, 0.0, 1.0]], expected: [2.0, 1.0, -1.0, 0.0] },
      { input: [[1.0, 1.0, 1.0, 1.0]], expected: [0.0, 2.0, 0.0, 0.0] },
    ],
    hint: "Winograd turns 3x3 convolutions into cheap element-wise multiplies in the transform domain.",
  },
  {
    id: "dl-293",
    title: "FFT Conv FLOPs",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Estimate FFT convolution cost: pad to the next power of two n >= signal_len + kernel_len - 1, then flops = 3 * 5 * n * log2(n) (three FFTs) + 6 * n (complex multiplies). For n = 1 the FFT part is zero.\n\nThe signature is fft_conv_flops(signal_len, kernel_len). Return an integer.",
    starterCode: `import math
def fft_conv_flops(signal_len, kernel_len):
    # Your code here
    pass`,
    solution: `import math
def fft_conv_flops(signal_len, kernel_len):
    need = signal_len + kernel_len - 1
    n = 1
    while n < need:
        n *= 2
    if n == 1:
        return 6
    return int(3 * 5 * n * math.log2(n) + 6 * n)`,
    testCases: [
      { input: [1024, 3], expected: 350208 },
      { input: [16, 4], expected: 2592 },
      { input: [7, 3], expected: 1056 },
      { input: [1, 1], expected: 6 },
      { input: [100, 1], expected: 14208 },
    ],
    hint: "FFT convolution only wins for large kernels or very long signals.",
  },
  {
    id: "dl-294",
    title: "Implicit GEMM Mapping",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Map a convolution to a GEMM: output spatial P = (H + 2*pad - R) // stride + 1 and Q is computed the same way from W and S; the GEMM is M = N*P*Q, N_dim = K and K_dim = C*R*S.\n\nThe signature is implicit_gemm_dimensions(N, H, W, C, K, R, S, pad, stride). Return [M, N_dim, K_dim].",
    starterCode: `def implicit_gemm_dimensions(N, H, W, C, K, R, S, pad, stride):
    # Your code here
    pass`,
    solution: `def implicit_gemm_dimensions(N, H, W, C, K, R, S, pad, stride):
    P = (H + 2 * pad - R) // stride + 1
    Q = (W + 2 * pad - S) // stride + 1
    return [N * P * Q, K, C * R * S]`,
    testCases: [
      { input: [1, 28, 28, 3, 64, 3, 3, 1, 1], expected: [784, 64, 27] },
      { input: [2, 14, 14, 16, 32, 3, 3, 0, 1], expected: [288, 32, 144] },
      { input: [1, 8, 8, 4, 8, 1, 1, 0, 1], expected: [64, 8, 4] },
      { input: [1, 32, 32, 64, 128, 3, 3, 1, 2], expected: [256, 128, 576] },
    ],
    hint: "Implicit GEMM lets cuDNN reuse a single highly tuned matrix-multiply kernel for convolutions.",
  },
  {
    id: "dl-295",
    title: "Occupancy Calculator",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute blocks per SM and occupancy from register, shared memory and thread limits. reg_blocks = regs_per_sm // (threads_per_block * registers_per_thread); smem_blocks = smem_per_sm // smem_per_block (or blocks_limit when smem_per_block is 0); thread_blocks = threads_per_sm // threads_per_block; blocks = min of all and blocks_limit; occupancy = blocks * threads_per_block / threads_per_sm.\n\nThe signature is occupancy_calculator(threads_per_block, registers_per_thread, regs_per_sm, threads_per_sm, smem_per_block, smem_per_sm, blocks_limit=32). Return [blocks, occupancy].",
    starterCode: `def occupancy_calculator(threads_per_block, registers_per_thread, regs_per_sm, threads_per_sm, smem_per_block, smem_per_sm, blocks_limit=32):
    # Your code here
    pass`,
    solution: `def occupancy_calculator(threads_per_block, registers_per_thread, regs_per_sm, threads_per_sm, smem_per_block, smem_per_sm, blocks_limit=32):
    reg_blocks = regs_per_sm // (threads_per_block * registers_per_thread)
    if smem_per_block > 0:
        smem_blocks = smem_per_sm // smem_per_block
    else:
        smem_blocks = blocks_limit
    thread_blocks = threads_per_sm // threads_per_block
    blocks = min(reg_blocks, smem_blocks, thread_blocks, blocks_limit)
    return [blocks, blocks * threads_per_block / threads_per_sm]`,
    testCases: [
      { input: [256, 32, 65536, 2048, 0, 100000, 32], expected: [8, 1.0] },
      { input: [128, 64, 65536, 2048, 16384, 65536, 32], expected: [4, 0.25] },
      { input: [1024, 32, 65536, 2048, 0, 100000, 32], expected: [2, 1.0] },
      { input: [64, 128, 65536, 2048, 0, 100000, 32], expected: [8, 0.25] },
    ],
    hint: "Higher occupancy hides memory latency but is not always faster than a register-rich kernel.",
  },
  {
    id: "dl-296",
    title: "Shared-Memory Bank Conflicts",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the bank conflict degree of a strided access pattern over 32 banks: threads map to banks via (thread * stride) % 32, so the number of threads per bank is gcd(stride, 32).\n\nThe signature is bank_conflicts(stride). Return an integer conflict factor.",
    starterCode: `import math
def bank_conflicts(stride):
    # Your code here
    pass`,
    solution: `import math
def bank_conflicts(stride):
    return math.gcd(stride, 32)`,
    testCases: [
      { input: [1], expected: 1 },
      { input: [2], expected: 2 },
      { input: [16], expected: 16 },
      { input: [32], expected: 32 },
      { input: [33], expected: 1 },
    ],
    hint: "Odd strides or padding a row by one element avoids conflicts entirely.",
  },
  {
    id: "dl-297",
    title: "Async Copy Pipeline Stages",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Choose the number of pipeline stages that fit in shared memory: stages = min(max_stages, smem_bytes // stage_bytes), clamped to at least 1.\n\nThe signature is pipeline_stages(smem_bytes, stage_bytes, max_stages). Return an integer.",
    starterCode: `def pipeline_stages(smem_bytes, stage_bytes, max_stages):
    # Your code here
    pass`,
    solution: `def pipeline_stages(smem_bytes, stage_bytes, max_stages):
    stages = smem_bytes // stage_bytes
    if stages > max_stages:
        stages = max_stages
    if stages < 1:
        stages = 1
    return stages`,
    testCases: [
      { input: [100000, 16384, 4], expected: 4 },
      { input: [32768, 16384, 4], expected: 2 },
      { input: [8192, 16384, 4], expected: 1 },
      { input: [65536, 8192, 8], expected: 8 },
    ],
    hint: "Double buffering uses two stages; deeper pipelines hide more latency at the cost of shared memory.",
  },
  {
    id: "dl-298",
    title: "CUDA Graph Node Count",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Count the nodes of a CUDA graph as kernels + memcpys + events, and the launch overhead saved versus eager execution as (nodes - 1) * launch_overhead_us, clamped at 0.\n\nThe signature is cuda_graph_nodes(num_kernels, num_memcpys, num_events, launch_overhead_us). Return [nodes, saved_us].",
    starterCode: `def cuda_graph_nodes(num_kernels, num_memcpys, num_events, launch_overhead_us):
    # Your code here
    pass`,
    solution: `def cuda_graph_nodes(num_kernels, num_memcpys, num_events, launch_overhead_us):
    nodes = num_kernels + num_memcpys + num_events
    saved = (nodes - 1) * launch_overhead_us
    if saved < 0.0:
        saved = 0.0
    return [nodes, saved]`,
    testCases: [
      { input: [10, 2, 0, 5.0], expected: [12, 55.0] },
      { input: [1, 0, 0, 5.0], expected: [1, 0.0] },
      { input: [50, 10, 4, 2.5], expected: [64, 157.5] },
      { input: [0, 0, 0, 5.0], expected: [0, 0.0] },
    ],
    hint: "Graph capture replays many launches as a single submission, cutting CPU overhead.",
  },
  {
    id: "dl-299",
    title: "Stream Overlap Ratio",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the speedup from overlapping communication with compute. Sequential time is compute + comm; pipelined time is max(compute, comm) + (1 - overlap_fraction) * min(compute, comm). Return 1 - pipelined / sequential.\n\nThe signature is stream_overlap_ratio(compute_ms, comm_ms, overlap_fraction).",
    starterCode: `def stream_overlap_ratio(compute_ms, comm_ms, overlap_fraction):
    # Your code here
    pass`,
    solution: `def stream_overlap_ratio(compute_ms, comm_ms, overlap_fraction):
    sequential = compute_ms + comm_ms
    pipelined = max(compute_ms, comm_ms) + (1.0 - overlap_fraction) * min(compute_ms, comm_ms)
    return 1.0 - pipelined / sequential`,
    testCases: [
      { input: [100.0, 50.0, 1.0], expected: 0.3333333333 },
      { input: [100.0, 50.0, 0.0], expected: 0.0 },
      { input: [60.0, 60.0, 0.5], expected: 0.25 },
      { input: [100.0, 100.0, 1.0], expected: 0.5 },
    ],
    hint: "Perfect overlap can hide at most the smaller of the two phases.",
  },
  {
    id: "dl-300",
    title: "Comm-Compute Overlap",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute exposed communication time and overlap ratio for a training step: exposed = compute + comm - overlap and ratio = overlap / (compute + comm).\n\nThe signature is comm_compute_overlap(compute_ms, comm_ms, overlap_ms). Return [exposed_ms, overlap_ratio].",
    starterCode: `def comm_compute_overlap(compute_ms, comm_ms, overlap_ms):
    # Your code here
    pass`,
    solution: `def comm_compute_overlap(compute_ms, comm_ms, overlap_ms):
    exposed = compute_ms + comm_ms - overlap_ms
    ratio = overlap_ms / (compute_ms + comm_ms)
    return [exposed, ratio]`,
    testCases: [
      { input: [100.0, 50.0, 25.0], expected: [125.0, 0.1666666667] },
      { input: [100.0, 100.0, 100.0], expected: [100.0, 0.5] },
      { input: [10.0, 10.0, 0.0], expected: [20.0, 0.0] },
      { input: [200.0, 50.0, 50.0], expected: [200.0, 0.2] },
    ],
    hint: "Backward all-reduce can hide behind the backward compute of later layers.",
  },
  {
    id: "dl-301",
    title: "Quantized Inference Latency",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Estimate quantized inference latency as max(memory time, compute time), where memory time = weight_bytes / (bandwidth_gbps * 1e6) milliseconds.\n\nThe signature is quantized_latency_ms(weight_bytes, bandwidth_gbps, compute_ms).",
    starterCode: `def quantized_latency_ms(weight_bytes, bandwidth_gbps, compute_ms):
    # Your code here
    pass`,
    solution: `def quantized_latency_ms(weight_bytes, bandwidth_gbps, compute_ms):
    memory_ms = weight_bytes / (bandwidth_gbps * 1e6)
    return max(memory_ms, compute_ms)`,
    testCases: [
      { input: [1000000000, 1000, 1.0], expected: 1.0 },
      { input: [1000000000, 100, 0.5], expected: 10.0 },
      { input: [500000000, 500, 2.0], expected: 2.0 },
      { input: [2000000000, 1000, 0.1], expected: 2.0 },
    ],
    hint: "4-bit weights move 8x fewer bytes, which is why quantization speeds up decode so much.",
  },
  {
    id: "dl-302",
    title: "Activation Int8 Calibration",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Calibrate an activation clipping threshold with the nearest-rank percentile: sort the observed activations and take index ceil(percentile / 100 * n) - 1, clamped to the valid range.\n\nThe signature is activation_calibration(activations, percentile). Return the threshold value.",
    starterCode: `import math
def activation_calibration(activations, percentile):
    # Your code here
    pass`,
    solution: `import math
def activation_calibration(activations, percentile):
    s = sorted(activations)
    n = len(s)
    idx = int(math.ceil(percentile / 100.0 * n)) - 1
    if idx < 0:
        idx = 0
    if idx >= n:
        idx = n - 1
    return s[idx]`,
    testCases: [
      { input: [[1.0, 2.0, 3.0, 4.0, 5.0], 90], expected: 5.0 },
      { input: [[0.1, 0.2], 50], expected: 0.1 },
      { input: [[10.0], 99], expected: 10.0 },
      { input: [[-1.0, 0.0, 1.0], 50], expected: 0.0 },
    ],
    hint: "Percentile clipping removes extreme outliers that would waste int8 dynamic range.",
  },
  {
    id: "dl-303",
    title: "2:4 Sparsity Metadata",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "For each group of four consecutive mask entries, list the global indices of the two kept ones. Input masks are assumed to have exactly two ones per group and a length divisible by four.\n\nThe signature is sparsity_24_metadata(mask). Return the list of index pairs.",
    starterCode: `def sparsity_24_metadata(mask):
    # Your code here
    pass`,
    solution: `def sparsity_24_metadata(mask):
    out = []
    for g in range(0, len(mask), 4):
        group = mask[g:g + 4]
        idxs = [g + i for i in range(4) if group[i] == 1]
        out.append(idxs)
    return out`,
    testCases: [
      { input: [[1, 0, 1, 0, 0, 1, 0, 1]], expected: [[0, 2], [5, 7]] },
      { input: [[1, 1, 0, 0]], expected: [[0, 1]] },
      { input: [[0, 0, 1, 1, 1, 1, 0, 0]], expected: [[2, 3], [4, 5]] },
      { input: [[0, 1, 1, 0, 1, 0, 0, 1]], expected: [[1, 2], [4, 7]] },
    ],
    hint: "2:4 sparsity stores two 2-bit indices per group, halving weight storage.",
  },
  {
    id: "dl-304",
    title: "Structured Sparsity Speedup Bound",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the theoretical speedup from removing zeros: dense work divided by reduced work = total / nonzeros.\n\nThe signature is structured_sparsity_speedup(nonzeros, total). Return a float.",
    starterCode: `def structured_sparsity_speedup(nonzeros, total):
    # Your code here
    pass`,
    solution: `def structured_sparsity_speedup(nonzeros, total):
    return total / nonzeros`,
    testCases: [
      { input: [2, 4], expected: 2.0 },
      { input: [1, 2], expected: 2.0 },
      { input: [3, 4], expected: 1.3333333333 },
      { input: [64, 128], expected: 2.0 },
    ],
    hint: "2:4 sparsity caps the theoretical speedup at 2x because half the weights remain.",
  },
  {
    id: "dl-305",
    title: "Batch-Latency Tradeoff",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Given measured latency per batch size, compute throughput = batch / latency * 1000 (items per second) and return [best_batch, best_throughput] for the batch with the highest throughput, breaking ties toward the smaller batch.\n\nThe signature is batch_latency_tradeoff(batch_sizes, latencies).",
    starterCode: `def batch_latency_tradeoff(batch_sizes, latencies):
    # Your code here
    pass`,
    solution: `def batch_latency_tradeoff(batch_sizes, latencies):
    best = 0
    for i in range(len(batch_sizes)):
        if batch_sizes[i] / latencies[i] > batch_sizes[best] / latencies[best]:
            best = i
    return [batch_sizes[best], batch_sizes[best] / latencies[best] * 1000.0]`,
    testCases: [
      { input: [[1, 4, 16], [10.0, 20.0, 100.0]], expected: [4, 200.0] },
      { input: [[1, 2], [5.0, 5.0]], expected: [2, 400.0] },
      { input: [[1], [2.0]], expected: [1, 500.0] },
      { input: [[8, 16], [40.0, 120.0]], expected: [8, 200.0] },
    ],
    hint: "Throughput usually saturates while latency keeps growing with batch size.",
  },
  {
    id: "dl-306",
    title: "Throughput Saturation",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Find the smallest batch size whose throughput reaches target_ratio times the peak throughput.\n\nThe signature is throughput_saturation(batch_sizes, throughputs, target_ratio=0.95). Return the batch size.",
    starterCode: `def throughput_saturation(batch_sizes, throughputs, target_ratio=0.95):
    # Your code here
    pass`,
    solution: `def throughput_saturation(batch_sizes, throughputs, target_ratio=0.95):
    peak = max(throughputs)
    target = target_ratio * peak
    for i in range(len(throughputs)):
        if throughputs[i] >= target:
            return batch_sizes[i]
    return batch_sizes[-1]`,
    testCases: [
      { input: [[1, 2, 4, 8], [100.0, 180.0, 190.0, 200.0], 0.95], expected: 4 },
      { input: [[1, 2, 4, 8], [100.0, 180.0, 190.0, 200.0], 1.0], expected: 8 },
      { input: [[1, 2], [50.0, 100.0], 0.5], expected: 1 },
      { input: [[1, 2, 4], [10.0, 18.0, 20.0], 0.9], expected: 2 },
    ],
    hint: "The saturation point marks where adding work stops buying throughput.",
  },
  {
    id: "dl-307",
    title: "Latency SLA Budget",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute how many decode tokens fit in a latency SLA: floor((slo_ms - prefill_ms) / decode_ms_per_token).\n\nThe signature is latency_sla_budget(prefill_ms, decode_ms_per_token, slo_ms). Return an integer.",
    starterCode: `def latency_sla_budget(prefill_ms, decode_ms_per_token, slo_ms):
    # Your code here
    pass`,
    solution: `def latency_sla_budget(prefill_ms, decode_ms_per_token, slo_ms):
    return int((slo_ms - prefill_ms) // decode_ms_per_token)`,
    testCases: [
      { input: [50.0, 20.0, 1050.0], expected: 50 },
      { input: [50.0, 20.0, 50.0], expected: 0 },
      { input: [100.0, 5.0, 200.0], expected: 20 },
      { input: [0.0, 10.0, 55.0], expected: 5 },
    ],
    hint: "Prefill and decode budgets are usually tracked separately in product SLAs.",
  },
  {
    id: "dl-308",
    title: "KV Cache Eviction Policy",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Evict least-recently-used KV blocks until at most max_blocks remain. Each block is [id, last_used_step]; keep the highest last_used values and, on ties, the larger block ids. Return the surviving ids sorted ascending.\n\nThe signature is kv_cache_eviction(blocks, max_blocks).",
    starterCode: `def kv_cache_eviction(blocks, max_blocks):
    # Your code here
    pass`,
    solution: `def kv_cache_eviction(blocks, max_blocks):
    order = sorted(range(len(blocks)), key=lambda i: (-blocks[i][1], -blocks[i][0]))
    return sorted(blocks[i][0] for i in order[:max_blocks])`,
    testCases: [
      { input: [[[1, 5], [2, 9], [3, 1]], 2], expected: [1, 2] },
      { input: [[[1, 1], [2, 2], [3, 3]], 2], expected: [2, 3] },
      { input: [[[1, 1]], 1], expected: [1] },
      { input: [[[1, 5], [2, 5], [3, 5]], 2], expected: [2, 3] },
    ],
    hint: "LRU eviction keeps the attention windows that recent tokens still need.",
  },
  {
    id: "dl-309",
    title: "Cascade Inference",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Model a two-model cascade: a small model answers everything and a fraction (1 - confidence_gate) escalates to the large model. Accuracy = gate * small_acc + (1 - gate) * large_acc and cost = small_cost + (1 - gate) * large_cost.\n\nThe signature is cascade_inference(small_accuracy, small_cost, large_accuracy, large_cost, confidence_gate). Return [accuracy, cost].",
    starterCode: `def cascade_inference(small_accuracy, small_cost, large_accuracy, large_cost, confidence_gate):
    # Your code here
    pass`,
    solution: `def cascade_inference(small_accuracy, small_cost, large_accuracy, large_cost, confidence_gate):
    acc = confidence_gate * small_accuracy + (1.0 - confidence_gate) * large_accuracy
    cost = small_cost + (1.0 - confidence_gate) * large_cost
    return [acc, cost]`,
    testCases: [
      { input: [0.8, 1.0, 0.95, 10.0, 0.7], expected: [0.845, 4.0] },
      { input: [0.9, 2.0, 0.99, 20.0, 0.0], expected: [0.99, 22.0] },
      { input: [1.0, 1.0, 1.0, 1.0, 1.0], expected: [1.0, 1.0] },
      { input: [0.5, 1.0, 0.9, 5.0, 1.0], expected: [0.5, 1.0] },
    ],
    hint: "Cascades buy most of the large model's accuracy at a fraction of its cost.",
  },
  {
    id: "dl-310",
    title: "MoE Load Balance",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the expert load imbalance factor: max expert token count divided by the mean count.\n\nThe signature is moe_load_balance(expert_counts). Return a float; 1.0 means perfectly balanced.",
    starterCode: `def moe_load_balance(expert_counts):
    # Your code here
    pass`,
    solution: `def moe_load_balance(expert_counts):
    return max(expert_counts) / (sum(expert_counts) / len(expert_counts))`,
    testCases: [
      { input: [[10, 10, 10, 10]], expected: 1.0 },
      { input: [[20, 0, 0, 0]], expected: 4.0 },
      { input: [[5, 5, 0, 0]], expected: 2.0 },
      { input: [[3, 1, 2, 4]], expected: 1.6 },
    ],
    hint: "Imbalance makes some experts idle while others become throughput bottlenecks.",
  },
  {
    id: "dl-311",
    title: "MoE Throughput Gain",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the sparse-activation throughput gain of a mixture-of-experts model: total_params / active_params.\n\nThe signature is moe_throughput_gain(total_params, active_params).",
    starterCode: `def moe_throughput_gain(total_params, active_params):
    # Your code here
    pass`,
    solution: `def moe_throughput_gain(total_params, active_params):
    return total_params / active_params`,
    testCases: [
      { input: [1000000, 100000], expected: 10.0 },
      { input: [8, 8], expected: 1.0 },
      { input: [47000000000, 13000000000], expected: 3.6153846154 },
      { input: [100, 10], expected: 10.0 },
    ],
    hint: "Sparse MoE scales total parameters without scaling per-token compute.",
  },
  {
    id: "dl-312",
    title: "Router Z-Loss",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Compute the router z-loss that keeps routing logits small: for each token compute the stable log-sum-exp of the router logits and average its square over tokens.\n\nThe signature is router_z_loss(router_logits). Return a scalar.",
    starterCode: `import math
def router_z_loss(router_logits):
    # Your code here
    pass`,
    solution: `import math
def router_z_loss(router_logits):
    total = 0.0
    for row in router_logits:
        m = max(row)
        lse = m + math.log(sum(math.exp(v - m) for v in row))
        total += lse * lse
    return total / len(router_logits)`,
    testCases: [
      { input: [[[0.0, 0.0]]], expected: 0.4804530139 },
      { input: [[[0.0, 1.0, 2.0]]], expected: 5.79656648 },
      { input: [[[-1.0, 0.0, 1.0]]], expected: 1.9813545511 },
      { input: [[[0.0, 0.0], [1.0, 2.0]]], expected: 2.9158163244 },
    ],
    hint: "Penalizing the z-loss improves numerical stability and prevents logit blow-up.",
  },
  {
    id: "dl-313",
    title: "MoE Aux Load-Balance Loss",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Compute the Switch-Transformer auxiliary loss: num_experts * sum over experts of (fraction of tokens routed to the expert) * (mean routing probability of the expert), using the top-1 expert per token.\n\nThe signature is moe_aux_loss(router_probs, expert_indices). Each row of router_probs is a distribution over experts.",
    starterCode: `def moe_aux_loss(router_probs, expert_indices):
    # Your code here
    pass`,
    solution: `def moe_aux_loss(router_probs, expert_indices):
    n = len(router_probs)
    E = len(router_probs[0])
    f = [0.0] * E
    for e in expert_indices:
        f[e] += 1.0 / n
    p = [sum(router_probs[i][e] for i in range(n)) / n for e in range(E)]
    return E * sum(f[e] * p[e] for e in range(E))`,
    testCases: [
      { input: [[[0.5, 0.5], [0.5, 0.5]], [0, 1]], expected: 1.0 },
      { input: [[[0.9, 0.1], [0.8, 0.2]], [0, 0]], expected: 1.7 },
      { input: [[[0.25, 0.25, 0.25, 0.25], [0.25, 0.25, 0.25, 0.25], [0.1, 0.2, 0.3, 0.4]], [1, 2, 3]], expected: 1.0666666667 },
      { input: [[[0.6, 0.4]], [1]], expected: 0.8 },
    ],
    hint: "The auxiliary loss is minimized at 1.0 when routing is perfectly uniform.",
  },
  {
    id: "dl-314",
    title: "Expert Capacity Drop Rate",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Compute the fraction of tokens dropped by expert capacity limits. Capacity per expert = ceil(num_tokens * capacity_factor / num_experts); tokens beyond capacity are dropped.\n\nThe signature is expert_capacity_drop(expert_counts, num_tokens, capacity_factor). Return the drop rate.",
    starterCode: `import math
def expert_capacity_drop(expert_counts, num_tokens, capacity_factor):
    # Your code here
    pass`,
    solution: `import math
def expert_capacity_drop(expert_counts, num_tokens, capacity_factor):
    num_experts = len(expert_counts)
    capacity = int(math.ceil(num_tokens * capacity_factor / num_experts))
    dropped = sum(max(0, c - capacity) for c in expert_counts)
    return dropped / num_tokens`,
    testCases: [
      { input: [[10, 10, 10, 10], 40, 1.0], expected: 0.0 },
      { input: [[20, 0, 0, 0], 20, 1.0], expected: 0.75 },
      { input: [[5, 5, 5, 5], 20, 0.5], expected: 0.4 },
      { input: [[7, 3], 10, 1.0], expected: 0.2 },
    ],
    hint: "Tiny capacity factors drop tokens; large ones waste compute on padding.",
  },
  {
    id: "dl-315",
    title: "Speculative Speedup Estimate",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Estimate speculative decoding speedup. Expected accepted draft tokens = sum of alpha^i for i = 1..num_draft; each cycle yields accepted + 1 tokens (the bonus token) at a cost of num_draft * draft_cost_ratio + 1 target-model-equivalents. Return the ratio.\n\nThe signature is speculative_speedup(acceptance_rate, num_draft, draft_cost_ratio).",
    starterCode: `def speculative_speedup(acceptance_rate, num_draft, draft_cost_ratio):
    # Your code here
    pass`,
    solution: `def speculative_speedup(acceptance_rate, num_draft, draft_cost_ratio):
    accepted = 0.0
    power = 1.0
    for _ in range(num_draft):
        power *= acceptance_rate
        accepted += power
    tokens = accepted + 1.0
    cost = num_draft * draft_cost_ratio + 1.0
    return tokens / cost`,
    testCases: [
      { input: [0.8, 4, 0.1], expected: 2.4011428571 },
      { input: [0.0, 4, 0.1], expected: 0.7142857143 },
      { input: [1.0, 4, 0.1], expected: 3.5714285714 },
      { input: [0.5, 2, 0.25], expected: 1.1666666667 },
    ],
    hint: "Higher acceptance rates and cheaper drafts both increase the speedup.",
  },
  {
    id: "dl-316",
    title: "Continuous Batching Slot Simulation",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Simulate a continuous batching scheduler. One request arrives per step starting at step 0; at each step, as many waiting requests as possible start (up to max_slots), then every active request advances one step of service_steps. Repeat until all requests finish. Return the number of steps taken.\n\nThe signature is continuous_batching_slots(num_requests, service_steps, max_slots).",
    starterCode: `def continuous_batching_slots(num_requests, service_steps, max_slots):
    # Your code here
    pass`,
    solution: `def continuous_batching_slots(num_requests, service_steps, max_slots):
    arrived = 0
    remaining = []
    time = 0
    while arrived < num_requests or remaining:
        while arrived < num_requests and len(remaining) < max_slots:
            remaining.append(service_steps)
            arrived += 1
        remaining = [r - 1 for r in remaining if r - 1 > 0]
        time += 1
    return time`,
    testCases: [
      { input: [4, 2, 2], expected: 4 },
      { input: [3, 1, 2], expected: 2 },
      { input: [1, 5, 4], expected: 5 },
      { input: [6, 2, 3], expected: 4 },
    ],
    hint: "Continuous batching admits new requests the moment a slot frees, unlike static batching.",
  },
  {
    id: "dl-317",
    title: "Watermark Detection Z-Score",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Compute the green-list watermark detection statistic for a token sequence: with g green tokens out of n and a green list covering half the vocabulary, z = (g - n/2) / sqrt(n/4).\n\nThe signature is watermark_z_score(tokens, greenlist). Return the z-score.",
    starterCode: `import math
def watermark_z_score(tokens, greenlist):
    # Your code here
    pass`,
    solution: `import math
def watermark_z_score(tokens, greenlist):
    green = set(greenlist)
    g = sum(1 for t in tokens if t in green)
    n = len(tokens)
    return (g - n / 2.0) / math.sqrt(n / 4.0)`,
    testCases: [
      { input: [[1, 2, 3, 4, 1], [1, 2, 3]], expected: 1.3416407865 },
      { input: [[5, 6], [1, 2]], expected: -1.4142135624 },
      { input: [[1, 1, 1, 1], [1]], expected: 2.0 },
      { input: [[1, 2, 3, 4], [1, 2]], expected: 0.0 },
    ],
    hint: "A large positive z-score is evidence that the text was generated with the watermark.",
  },
  {
    id: "dl-318",
    title: "CPU Offload Time",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Estimate optimizer offload time. Transfer per layer is layer_bytes / (bandwidth_gbps * 1e6) milliseconds. Sequential time repeats transfer + compute every layer; overlapped time repeats max(transfer, compute). Return [sequential_ms, overlapped_ms].\n\nThe signature is cpu_offload_time(num_layers, layer_bytes, bandwidth_gbps, compute_ms_per_layer, overlap=True).",
    starterCode: `def cpu_offload_time(num_layers, layer_bytes, bandwidth_gbps, compute_ms_per_layer, overlap=True):
    # Your code here
    pass`,
    solution: `def cpu_offload_time(num_layers, layer_bytes, bandwidth_gbps, compute_ms_per_layer, overlap=True):
    transfer_ms = layer_bytes / (bandwidth_gbps * 1e6)
    sequential = num_layers * (transfer_ms + compute_ms_per_layer)
    if overlap:
        overlapped = num_layers * max(transfer_ms, compute_ms_per_layer)
    else:
        overlapped = sequential
    return [sequential, overlapped]`,
    testCases: [
      { input: [12, 100000000, 32, 1.0, true], expected: [49.5, 37.5] },
      { input: [4, 100000000, 100, 5.0, true], expected: [24.0, 20.0] },
      { input: [2, 50000000, 50, 0.0, true], expected: [2.0, 2.0] },
      { input: [1, 100000000, 10, 20.0, false], expected: [30.0, 30.0] },
    ],
    hint: "Overlapping the PCIe transfer with compute hides most of the offload cost.",
  },
  {
    id: "dl-319",
    title: "Software Pipeline Depth",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Choose the software pipeline depth that fits both register and shared-memory budgets: min(max_stages, registers_per_thread // regs_per_stage, smem_bytes // stage_smem_bytes), clamped to at least 1.\n\nThe signature is software_pipeline_depth(registers_per_thread, regs_per_stage, max_stages, smem_bytes, stage_smem_bytes). Return an integer.",
    starterCode: `def software_pipeline_depth(registers_per_thread, regs_per_stage, max_stages, smem_bytes, stage_smem_bytes):
    # Your code here
    pass`,
    solution: `def software_pipeline_depth(registers_per_thread, regs_per_stage, max_stages, smem_bytes, stage_smem_bytes):
    reg_stages = registers_per_thread // regs_per_stage
    smem_stages = smem_bytes // stage_smem_bytes
    depth = min(max_stages, reg_stages, smem_stages)
    if depth < 1:
        depth = 1
    return depth`,
    testCases: [
      { input: [255, 64, 4, 100000, 8192], expected: 3 },
      { input: [128, 64, 8, 100000, 8192], expected: 2 },
      { input: [64, 64, 4, 1000, 10000], expected: 1 },
      { input: [512, 32, 6, 65536, 8192], expected: 6 },
    ],
    hint: "Deeper pipelines hide more global-memory latency but consume registers and shared memory.",
  },
  {
    id: "dl-320",
    title: "Register Pressure Estimate",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Estimate registers per thread for a GEMM warp tile: accumulator registers = (warp_m * warp_n) // threads, plus fragment_a + fragment_b + addressing registers.\n\nThe signature is register_pressure_estimate(warp_m, warp_n, threads, fragment_a, fragment_b, addressing=8). Return an integer.",
    starterCode: `def register_pressure_estimate(warp_m, warp_n, threads, fragment_a, fragment_b, addressing=8):
    # Your code here
    pass`,
    solution: `def register_pressure_estimate(warp_m, warp_n, threads, fragment_a, fragment_b, addressing=8):
    acc = (warp_m * warp_n) // threads
    return acc + fragment_a + fragment_b + addressing`,
    testCases: [
      { input: [64, 64, 32, 4, 2, 8], expected: 142 },
      { input: [32, 32, 32, 4, 2, 8], expected: 46 },
      { input: [128, 64, 32, 8, 4, 16], expected: 284 },
      { input: [16, 16, 32, 2, 2, 0], expected: 12 },
    ],
    hint: "Spilling accumulator registers to local memory can erase the benefit of a bigger tile.",
  },
];
