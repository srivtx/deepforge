import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "dl-411",
    title: "Arithmetic Intensity Of Matmul",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the arithmetic intensity of a dense matrix multiply with shapes (m, k) @ (k, n): flops = 2 * m * n * k and bytes_moved = bytes_per_value * (m * k + k * n + m * n) for reading both operands and writing the output.\n\nThe signature is arithmetic_intensity(m, n, k, bytes_per_value=2). Return flops per byte.",
    starterCode: `def arithmetic_intensity(m, n, k, bytes_per_value=2):
    # Your code here
    pass`,
    solution: `def arithmetic_intensity(m, n, k, bytes_per_value=2):
    flops = 2.0 * m * n * k
    moved = bytes_per_value * (m * k + k * n + m * n)
    return flops / moved`,
    testCases: [
      { input: [1, 1, 1, 2], expected: 0.3333333333 },
      { input: [512, 512, 512, 2], expected: 170.6666666667 },
      { input: [1024, 4096, 1024, 2], expected: 455.1111111111 },
      { input: [64, 64, 64, 4], expected: 10.6666666667 },
    ],
    hint: "Count every element of both inputs and the output exactly once.",
  },
  {
    id: "dl-412",
    title: "Roofline Crossover Batch Size",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "For a matmul with inner dimension k, output dimension n and variable batch m, arithmetic intensity is 2 * m * k * n / (bytes_per_value * (m * k + k * n + m * n)). Given peak_flops and memory bandwidth, find the smallest integer batch size whose intensity reaches the machine ridge point peak_flops / bandwidth.\n\nThe signature is roofline_crossover_batch(k, n, peak_flops, bandwidth, bytes_per_value=2, max_batch=65536). Return -1 if no batch up to max_batch reaches the ridge point.",
    starterCode: `import math
def roofline_crossover_batch(k, n, peak_flops, bandwidth, bytes_per_value=2, max_batch=65536):
    # Your code here
    pass`,
    solution: `import math
def roofline_crossover_batch(k, n, peak_flops, bandwidth, bytes_per_value=2, max_batch=65536):
    slope = 2.0 * k * n * bandwidth - peak_flops * bytes_per_value * (k + n)
    if slope <= 0:
        return -1
    m = peak_flops * bytes_per_value * k * n / slope
    best = int(math.ceil(m - 1e-12))
    if best < 1:
        best = 1
    while best > 1 and 2.0 * (best - 1) * k * n / (bytes_per_value * ((best - 1) * k + k * n + (best - 1) * n)) >= peak_flops / bandwidth:
        best -= 1
    while best <= max_batch and 2.0 * best * k * n / (bytes_per_value * (best * k + k * n + best * n)) < peak_flops / bandwidth:
        best += 1
    if best > max_batch:
        return -1
    return best`,
    testCases: [
      { input: [4096, 4096, 312000000000000.0, 2000000000000.0, 2, 4096], expected: 169 },
      { input: [4096, 4096, 10000000000000000.0, 1000000000000.0, 2, 65536], expected: -1 },
      { input: [1024, 2048, 100000000000000.0, 1000000000000.0, 2, 65536], expected: 118 },
      { input: [8, 8, 1000000000000.0, 100000000000000.0, 2, 65536], expected: 1 },
      { input: [4096, 4096, 312000000000000.0, 2000000000000.0, 2, 100], expected: -1 },
    ],
    hint: "As batch grows the weight term is amortized; if the asymptotic intensity 2kn / (b(k+n)) stays below the ridge point there is no crossover.",
  },
  {
    id: "dl-413",
    title: "MFU From Step Time",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute model FLOPs utilization from a measured training step: achieved_flops_per_s = tokens_per_step * flops_per_token / step_time_s, and the hardware capacity is num_gpus * peak_flops_per_gpu.\n\nThe signature is mfu_from_step_time(tokens_per_step, step_time_s, num_gpus, peak_flops_per_gpu, flops_per_token). Return the fraction of peak FLOPs achieved.",
    starterCode: `def mfu_from_step_time(tokens_per_step, step_time_s, num_gpus, peak_flops_per_gpu, flops_per_token):
    # Your code here
    pass`,
    solution: `def mfu_from_step_time(tokens_per_step, step_time_s, num_gpus, peak_flops_per_gpu, flops_per_token):
    return (tokens_per_step * flops_per_token / step_time_s) / (num_gpus * peak_flops_per_gpu)`,
    testCases: [
      { input: [200000, 2.0, 8, 312000000000000.0, 6000000000.0], expected: 0.2403846154 },
      { input: [0, 2.0, 8, 312000000000000.0, 6000000000.0], expected: 0.0 },
      { input: [1000000, 1.5, 4, 1000000000000000.0, 2000000000.0], expected: 0.3333333333 },
      { input: [50000, 10.0, 1, 50000000000000.0, 2000000000.0], expected: 0.2 },
    ],
    hint: "Divide the measured token throughput times FLOPs per token by the total peak throughput of all GPUs.",
  },
  {
    id: "dl-414",
    title: "Forward FLOPs Per Token",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Estimate forward-pass FLOPs per token with the 2N rule: each of the num_params parameters participates in one multiply-add (2 FLOPs) per token.\n\nThe signature is forward_flops_per_token(num_params). Return an integer number of FLOPs.",
    starterCode: `def forward_flops_per_token(num_params):
    # Your code here
    pass`,
    solution: `def forward_flops_per_token(num_params):
    return 2 * num_params`,
    testCases: [
      { input: [7000000000], expected: 14000000000 },
      { input: [0], expected: 0 },
      { input: [125000000], expected: 250000000 },
      { input: [1], expected: 2 },
    ],
    hint: "One multiply and one add per parameter equals two floating point operations.",
  },
  {
    id: "dl-415",
    title: "Training FLOPs Per Token",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Estimate training FLOPs per token with the 6N rule: the forward pass costs 2N, the backward pass costs roughly twice the forward pass, and N is the parameter count.\n\nThe signature is training_flops_per_token(num_params). Return an integer number of FLOPs.",
    starterCode: `def training_flops_per_token(num_params):
    # Your code here
    pass`,
    solution: `def training_flops_per_token(num_params):
    return 6 * num_params`,
    testCases: [
      { input: [7000000000], expected: 42000000000 },
      { input: [1], expected: 6 },
      { input: [125000000], expected: 750000000 },
      { input: [0], expected: 0 },
    ],
    hint: "Forward plus backward is about three forward passes, and each forward pass is 2N.",
  },
  {
    id: "dl-416",
    title: "Tokens Per Second From MFU",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Invert the model FLOPs utilization definition to plan serving capacity: tokens_per_second = mfu * num_gpus * peak_flops_per_gpu / flops_per_token.\n\nThe signature is tokens_per_second_from_mfu(mfu, num_gpus, peak_flops_per_gpu, flops_per_token). Return tokens per second.",
    starterCode: `def tokens_per_second_from_mfu(mfu, num_gpus, peak_flops_per_gpu, flops_per_token):
    # Your code here
    pass`,
    solution: `def tokens_per_second_from_mfu(mfu, num_gpus, peak_flops_per_gpu, flops_per_token):
    return mfu * num_gpus * peak_flops_per_gpu / flops_per_token`,
    testCases: [
      { input: [0.4, 8, 312000000000000.0, 6000000000.0], expected: 166400.0 },
      { input: [0.0, 8, 312000000000000.0, 6000000000.0], expected: 0.0 },
      { input: [0.25, 1, 100000000000000.0, 2000000000.0], expected: 12500.0 },
      { input: [0.5, 4, 50000000000000.0, 1000000000.0], expected: 100000.0 },
    ],
    hint: "Multiply the utilization by total peak FLOPs per second, then divide by FLOPs per token.",
  },
  {
    id: "dl-417",
    title: "Data Parallel Epoch Traffic",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the total gradient all-reduce bytes moved by data parallelism over an epoch. Each of num_steps optimizer steps all-reduces the full gradient tensor at ring cost 2 * (num_gpus - 1) / num_gpus * num_params * bytes_per_param.\n\nThe signature is data_parallel_epoch_traffic(num_params, bytes_per_param, num_gpus, num_steps). Return a float number of bytes.",
    starterCode: `def data_parallel_epoch_traffic(num_params, bytes_per_param, num_gpus, num_steps):
    # Your code here
    pass`,
    solution: `def data_parallel_epoch_traffic(num_params, bytes_per_param, num_gpus, num_steps):
    return num_steps * 2.0 * (num_gpus - 1) / num_gpus * num_params * bytes_per_param`,
    testCases: [
      { input: [1000000000, 4, 8, 1000], expected: 7000000000000.0 },
      { input: [100, 4, 1, 10], expected: 0.0 },
      { input: [1000, 2, 4, 5], expected: 15000.0 },
      { input: [7000000000, 2, 16, 100], expected: 2625000000000.0 },
    ],
    hint: "A single rank reduces nothing, so the traffic vanishes when num_gpus is 1.",
  },
  {
    id: "dl-418",
    title: "Gradient Bucket Overlap Fraction",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Simulate bucket-overlapped all-reduce during backward. Bucket i (0-indexed) becomes ready at (i + 1) / num_buckets * backward_ms; communications run in order on one link, each starting at max(ready_time, link_free) and lasting comm_ms_per_bucket. Return [hidden_fraction, exposed_ms], where exposed_ms is how far the final communication extends past backward_ms and hidden_fraction = 1 - exposed_ms / total_comm_ms.\n\nThe signature is bucket_overlap_fraction(backward_ms, num_buckets, comm_ms_per_bucket). If comm_ms_per_bucket is 0 return [1.0, 0.0].",
    starterCode: `def bucket_overlap_fraction(backward_ms, num_buckets, comm_ms_per_bucket):
    # Your code here
    pass`,
    solution: `def bucket_overlap_fraction(backward_ms, num_buckets, comm_ms_per_bucket):
    total_comm = num_buckets * comm_ms_per_bucket
    if total_comm == 0:
        return [1.0, 0.0]
    link_free = 0.0
    last_end = 0.0
    for i in range(num_buckets):
        ready = (i + 1) * backward_ms / num_buckets
        start = max(ready, link_free)
        last_end = start + comm_ms_per_bucket
        link_free = last_end
    exposed = max(0.0, last_end - backward_ms)
    return [1.0 - exposed / total_comm, exposed]`,
    testCases: [
      { input: [100.0, 10, 5.0], expected: [0.9, 5.0] },
      { input: [100.0, 5, 40.0], expected: [0.4, 120.0] },
      { input: [100.0, 1, 20.0], expected: [0.0, 20.0] },
      { input: [50.0, 4, 10.0], expected: [0.75, 10.0] },
      { input: [80.0, 8, 0.0], expected: [1.0, 0.0] },
    ],
    hint: "The last bucket becomes ready exactly when backward ends, so its communication can never hide.",
  },
  {
    id: "dl-419",
    title: "ZeRO-1 Optimizer Shard",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the per-GPU optimizer-state shard under ZeRO stage 1: ceil(num_params / num_gpus) parameters per rank, times optimizer_states tensors at bytes_per_value bytes each.\n\nThe signature is zero1_optimizer_shard(num_params, num_gpus, optimizer_states=2, bytes_per_value=4). Return an integer number of bytes.",
    starterCode: `def zero1_optimizer_shard(num_params, num_gpus, optimizer_states=2, bytes_per_value=4):
    # Your code here
    pass`,
    solution: `def zero1_optimizer_shard(num_params, num_gpus, optimizer_states=2, bytes_per_value=4):
    per = (num_params + num_gpus - 1) // num_gpus
    return per * optimizer_states * bytes_per_value`,
    testCases: [
      { input: [1000000000, 8, 2, 4], expected: 1000000000 },
      { input: [1001, 8, 2, 4], expected: 1008 },
      { input: [100, 3, 2, 4], expected: 272 },
      { input: [1, 1, 2, 2], expected: 4 },
    ],
    hint: "Only the optimizer state is partitioned at stage 1; parameters and gradients stay replicated.",
  },
  {
    id: "dl-420",
    title: "ZeRO-2 Gradient Shard",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the per-GPU gradient shard under ZeRO stage 2: ceil(num_params / num_gpus) gradient elements per rank at bytes_per_grad bytes each. Stage 2 shards gradients on top of the stage 1 optimizer split.\n\nThe signature is zero2_gradient_shard(num_params, num_gpus, bytes_per_grad=4). Return an integer number of bytes.",
    starterCode: `def zero2_gradient_shard(num_params, num_gpus, bytes_per_grad=4):
    # Your code here
    pass`,
    solution: `def zero2_gradient_shard(num_params, num_gpus, bytes_per_grad=4):
    per = (num_params + num_gpus - 1) // num_gpus
    return per * bytes_per_grad`,
    testCases: [
      { input: [1000000000, 8, 4], expected: 500000000 },
      { input: [1001, 8, 4], expected: 504 },
      { input: [100, 3, 2], expected: 68 },
      { input: [1, 1, 4], expected: 4 },
    ],
    hint: "Reduce-scatter leaves each rank holding one reduced slice of the gradient buffer.",
  },
  {
    id: "dl-421",
    title: "ZeRO-3 Parameter Shard",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the per-GPU parameter shard under ZeRO stage 3: ceil(num_params / num_gpus) parameters per rank at bytes_per_param bytes each. Parameters are gathered layer by layer just in time for compute and freed afterwards.\n\nThe signature is zero3_parameter_shard(num_params, num_gpus, bytes_per_param=2). Return an integer number of bytes.",
    starterCode: `def zero3_parameter_shard(num_params, num_gpus, bytes_per_param=2):
    # Your code here
    pass`,
    solution: `def zero3_parameter_shard(num_params, num_gpus, bytes_per_param=2):
    per = (num_params + num_gpus - 1) // num_gpus
    return per * bytes_per_param`,
    testCases: [
      { input: [7000000000, 64, 2], expected: 218750000 },
      { input: [1001, 8, 4], expected: 504 },
      { input: [100, 3, 2], expected: 68 },
      { input: [1, 1, 2], expected: 2 },
    ],
    hint: "At stage 3 even the parameters are partitioned, so per-GPU storage scales as 1 / num_gpus.",
  },
  {
    id: "dl-422",
    title: "Tensor Parallel Row Split",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Split a weight matrix along its output (row) dimension for tensor parallelism: each partition keeps a contiguous block of rows and all input columns. Row-parallel layers produce partial outputs that are summed with an all-reduce.\n\nThe signature is row_split(weight, num_partitions). Return the list of row blocks.",
    starterCode: `def row_split(weight, num_partitions):
    # Your code here
    pass`,
    solution: `def row_split(weight, num_partitions):
    out_dim = len(weight)
    per = out_dim // num_partitions
    return [weight[p * per:(p + 1) * per] for p in range(num_partitions)]`,
    testCases: [
      { input: [[[1.0, 2.0], [3.0, 4.0], [5.0, 6.0], [7.0, 8.0]], 2], expected: [[[1.0, 2.0], [3.0, 4.0]], [[5.0, 6.0], [7.0, 8.0]]] },
      { input: [[[1.0, 2.0], [3.0, 4.0]], 1], expected: [[[1.0, 2.0], [3.0, 4.0]]] },
      { input: [[[1.0], [2.0], [3.0], [4.0]], 4], expected: [[[1.0]], [[2.0]], [[3.0]], [[4.0]]] },
      { input: [[[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]], 3], expected: [[[1.0, 2.0]], [[3.0, 4.0]], [[5.0, 6.0]]] },
    ],
    hint: "Row parallelism splits the output features so each rank computes a partial result of the same shape.",
  },
  {
    id: "dl-423",
    title: "Tensor Parallel All-Reduce Count",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Count the all-reduces in a transformer forward pass with tensor parallelism. Each block ends two row-parallel projections (attention output and MLP down) with a sum all-reduce. Set backward=True to include the backward pass, which repeats the same count.\n\nThe signature is tp_all_reduce_count(num_layers, backward=False). Return an integer.",
    starterCode: `def tp_all_reduce_count(num_layers, backward=False):
    # Your code here
    pass`,
    solution: `def tp_all_reduce_count(num_layers, backward=False):
    forward = 2 * num_layers
    if backward:
        return forward + 2 * num_layers
    return forward`,
    testCases: [
      { input: [12], expected: 24 },
      { input: [12, true], expected: 48 },
      { input: [1, false], expected: 2 },
      { input: [1, true], expected: 4 },
      { input: [32], expected: 64 },
    ],
    hint: "Two row-parallel layers per block, and backward mirrors forward.",
  },
  {
    id: "dl-424",
    title: "Interleaved Pipeline Bubble",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Compute the bubble fraction for interleaved pipeline parallelism: each stage processes chunks_per_stage non-contiguous chunks of the micro-batch stream, so the schedule has num_microbatches * chunks_per_stage work slots and the bubble fraction is (num_stages - 1) / (num_microbatches * chunks_per_stage + num_stages - 1).\n\nThe signature is interleaved_bubble_fraction(num_stages, num_microbatches, chunks_per_stage=1).",
    starterCode: `def interleaved_bubble_fraction(num_stages, num_microbatches, chunks_per_stage=1):
    # Your code here
    pass`,
    solution: `def interleaved_bubble_fraction(num_stages, num_microbatches, chunks_per_stage=1):
    return (num_stages - 1) / (num_microbatches * chunks_per_stage + num_stages - 1)`,
    testCases: [
      { input: [4, 8], expected: 0.2727272727 },
      { input: [4, 8, 2], expected: 0.1578947368 },
      { input: [4, 1, 4], expected: 0.4285714286 },
      { input: [1, 10, 3], expected: 0.0 },
      { input: [8, 32, 2], expected: 0.0985915493 },
    ],
    hint: "More chunks per stage multiplies the effective number of slots and shrinks the bubble.",
  },
  {
    id: "dl-425",
    title: "Pipeline Warmup Micro-Batches",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Count the warmup and steady-state micro-batches of a 1F1B pipeline schedule. Warmup fills the pipeline with min(num_stages - 1, num_microbatches) forward-only micro-batches; everything after warmup is steady state where forward and backward alternate. Return [warmup, steady].\n\nThe signature is pipeline_warmup_microbatches(num_stages, num_microbatches).",
    starterCode: `def pipeline_warmup_microbatches(num_stages, num_microbatches):
    # Your code here
    pass`,
    solution: `def pipeline_warmup_microbatches(num_stages, num_microbatches):
    warmup = min(num_stages - 1, num_microbatches)
    return [warmup, num_microbatches - warmup]`,
    testCases: [
      { input: [4, 8], expected: [3, 5] },
      { input: [4, 2], expected: [2, 0] },
      { input: [1, 5], expected: [0, 5] },
      { input: [8, 8], expected: [7, 1] },
      { input: [2, 5], expected: [1, 4] },
    ],
    hint: "A shorter micro-batch stream can finish entirely inside the warmup phase.",
  },
  {
    id: "dl-426",
    title: "Sequence Parallel Activation Savings",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Sequence parallelism splits LayerNorm and dropout activations along the token axis, so each rank holds ceil(seq_len / num_gpus) rows instead of all seq_len rows. Compute the per-rank bytes, the bytes saved and the savings fraction for one (seq_len, d_model) activation tensor.\n\nThe signature is sequence_parallel_savings(seq_len, d_model, num_gpus, bytes_per_value=2). Return [per_rank_bytes, saved_bytes, saving_fraction].",
    starterCode: `def sequence_parallel_savings(seq_len, d_model, num_gpus, bytes_per_value=2):
    # Your code here
    pass`,
    solution: `def sequence_parallel_savings(seq_len, d_model, num_gpus, bytes_per_value=2):
    per_rank = (seq_len + num_gpus - 1) // num_gpus * d_model * bytes_per_value
    full = seq_len * d_model * bytes_per_value
    return [per_rank, full - per_rank, 1.0 - per_rank / full]`,
    testCases: [
      { input: [1024, 512, 8, 2], expected: [131072, 917504, 0.875] },
      { input: [10, 4, 3, 2], expected: [32, 48, 0.6] },
      { input: [128, 768, 4, 2], expected: [49152, 147456, 0.75] },
      { input: [1, 100, 8, 4], expected: [400, 0, 0.0] },
    ],
    hint: "Ceiling division means the savings fraction can be slightly below (num_gpus - 1) / num_gpus.",
  },
  {
    id: "dl-427",
    title: "Context Parallel Causal Split",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Balance causal attention work across context-parallel ranks: split the sequence into 2 * num_gpus chunks of ceil(seq_len / (2 * num_gpus)) tokens (the final chunk may be partial) and give rank r chunk r plus chunk 2 * num_gpus - 1 - r, pairing a light early chunk with a heavy late one.\n\nThe signature is context_parallel_chunks(seq_len, num_gpus). Return the token count owned by each rank.",
    starterCode: `def context_parallel_chunks(seq_len, num_gpus):
    # Your code here
    pass`,
    solution: `def context_parallel_chunks(seq_len, num_gpus):
    chunks = 2 * num_gpus
    chunk_size = (seq_len + chunks - 1) // chunks
    sizes = [min(chunk_size, max(0, seq_len - c * chunk_size)) for c in range(chunks)]
    return [sizes[r] + sizes[chunks - 1 - r] for r in range(num_gpus)]`,
    testCases: [
      { input: [16, 2], expected: [8, 8] },
      { input: [32, 4], expected: [8, 8, 8, 8] },
      { input: [24, 3], expected: [8, 8, 8] },
      { input: [10, 2], expected: [4, 6] },
      { input: [64, 4], expected: [16, 16, 16, 16] },
    ],
    hint: "Causal attention in early chunks is cheaper, so each rank takes one early and one late chunk.",
  },
  {
    id: "dl-428",
    title: "All-Gather Network Traffic",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the total bytes crossing the interconnect for a ring all-gather of a full tensor: each of num_gpus ranks sends num_gpus - 1 chunks of full_bytes / num_gpus, so the fabric carries (num_gpus - 1) * full_bytes in total.\n\nThe signature is all_gather_traffic(full_bytes, num_gpus). Return an integer number of bytes.",
    starterCode: `def all_gather_traffic(full_bytes, num_gpus):
    # Your code here
    pass`,
    solution: `def all_gather_traffic(full_bytes, num_gpus):
    return (num_gpus - 1) * full_bytes`,
    testCases: [
      { input: [4000, 4], expected: 12000 },
      { input: [1000, 1], expected: 0 },
      { input: [8000, 8], expected: 56000 },
      { input: [100, 2], expected: 100 },
      { input: [0, 4], expected: 0 },
    ],
    hint: "Every chunk travels across the ring on every link except its origin's outgoing edge.",
  },
  {
    id: "dl-429",
    title: "Reduce-Scatter Round Traffic",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the traffic of one ring reduce-scatter of full_bytes across num_gpus ranks: each rank forwards num_gpus - 1 chunks of full_bytes / num_gpus, so per-rank traffic is (num_gpus - 1) * full_bytes / num_gpus and the fabric total is (num_gpus - 1) * full_bytes. Return [per_rank_bytes, total_bytes].\n\nThe signature is reduce_scatter_round_traffic(full_bytes, num_gpus).",
    starterCode: `def reduce_scatter_round_traffic(full_bytes, num_gpus):
    # Your code here
    pass`,
    solution: `def reduce_scatter_round_traffic(full_bytes, num_gpus):
    return [(num_gpus - 1) * full_bytes / num_gpus, (num_gpus - 1) * full_bytes]`,
    testCases: [
      { input: [4000, 4], expected: [3000.0, 12000] },
      { input: [1000, 1], expected: [0.0, 0] },
      { input: [8000, 8], expected: [7000.0, 56000] },
      { input: [100, 2], expected: [50.0, 100] },
    ],
    hint: "Each rank keeps one reduced chunk and forwards the other num_gpus - 1 chunks around the ring.",
  },
  {
    id: "dl-430",
    title: "Ring All-Reduce Time",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Estimate ring all-reduce wall time: reduce-scatter and all-gather each run num_gpus - 1 steps that send full_bytes / num_gpus over the link. Each step costs chunk / (bandwidth_gbps * 1e9) seconds plus latency_us microseconds.\n\nThe signature is ring_all_reduce_time(full_bytes, num_gpus, bandwidth_gbps, latency_us=0.0). Return seconds as a float.",
    starterCode: `def ring_all_reduce_time(full_bytes, num_gpus, bandwidth_gbps, latency_us=0.0):
    # Your code here
    pass`,
    solution: `def ring_all_reduce_time(full_bytes, num_gpus, bandwidth_gbps, latency_us=0.0):
    chunk = full_bytes / num_gpus
    steps = 2 * (num_gpus - 1)
    return steps * (chunk / (bandwidth_gbps * 1e9)) + steps * latency_us * 1e-6`,
    testCases: [
      { input: [1000000000, 8, 100.0, 0.0], expected: 0.0175 },
      { input: [1000000000, 8, 100.0, 10.0], expected: 0.01764 },
      { input: [4000000000, 4, 200.0, 5.0], expected: 0.03003 },
      { input: [1000000, 2, 10.0, 0.0], expected: 0.0001 },
    ],
    hint: "Bandwidth time shrinks as 1 / num_gpus while latency time grows with num_gpus - 1.",
  },
  {
    id: "dl-431",
    title: "Collective Bandwidth Time",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the minimum time in milliseconds to move bytes_moved over a link of bandwidth_gbps gigabytes per second: bytes_moved / (bandwidth_gbps * 1e6).\n\nThe signature is collective_bandwidth_time(bytes_moved, bandwidth_gbps). Return a float number of milliseconds.",
    starterCode: `def collective_bandwidth_time(bytes_moved, bandwidth_gbps):
    # Your code here
    pass`,
    solution: `def collective_bandwidth_time(bytes_moved, bandwidth_gbps):
    return bytes_moved / (bandwidth_gbps * 1e6)`,
    testCases: [
      { input: [1000000000, 100.0], expected: 10.0 },
      { input: [500000000, 50.0], expected: 10.0 },
      { input: [0, 200.0], expected: 0.0 },
      { input: [1000000, 10.0], expected: 0.1 },
    ],
    hint: "One gigabyte per second moves 1e6 bytes per millisecond.",
  },
  {
    id: "dl-432",
    title: "Gradient Accumulation Micro-Steps",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the number of micro-steps each data-parallel rank runs per optimizer step: ceil(global_batch_size / (micro_batch_size * data_parallel)). Each rank processes micro_batch_size samples at a time and gradients are accumulated before the optimizer updates.\n\nThe signature is gradient_accumulation_micro_steps(global_batch_size, micro_batch_size, data_parallel=1). Return an integer.",
    starterCode: `def gradient_accumulation_micro_steps(global_batch_size, micro_batch_size, data_parallel=1):
    # Your code here
    pass`,
    solution: `def gradient_accumulation_micro_steps(global_batch_size, micro_batch_size, data_parallel=1):
    per_step = micro_batch_size * data_parallel
    return (global_batch_size + per_step - 1) // per_step`,
    testCases: [
      { input: [1024, 4, 8], expected: 32 },
      { input: [1000, 4, 8], expected: 32 },
      { input: [8, 4, 2], expected: 1 },
      { input: [3, 4, 1], expected: 1 },
      { input: [64, 8, 1], expected: 8 },
    ],
    hint: "Data-parallel ranks each contribute micro_batch_size samples to every micro-step.",
  },
  {
    id: "dl-433",
    title: "Global Batch Size",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the effective global batch size: micro_batch_size * accum_steps * data_parallel. Accumulation multiplies samples per rank and data parallelism multiplies across ranks.\n\nThe signature is global_batch_size(micro_batch_size, accum_steps, data_parallel). Return an integer.",
    starterCode: `def global_batch_size(micro_batch_size, accum_steps, data_parallel):
    # Your code here
    pass`,
    solution: `def global_batch_size(micro_batch_size, accum_steps, data_parallel):
    return micro_batch_size * accum_steps * data_parallel`,
    testCases: [
      { input: [4, 8, 16], expected: 512 },
      { input: [1, 1, 1], expected: 1 },
      { input: [32, 4, 2], expected: 256 },
      { input: [0, 8, 4], expected: 0 },
    ],
    hint: "All three factors multiply together.",
  },
  {
    id: "dl-434",
    title: "Scaling Efficiency From Step Time",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Compute data-parallel scaling efficiency from measured step times: efficiency = single_gpu_step_ms / (num_gpus * multi_gpu_step_ms). A value of 1.0 is perfect scaling, below 1.0 means communication or straggler overhead, and above 1.0 means superlinear speedup.\n\nThe signature is scaling_efficiency(single_gpu_step_ms, multi_gpu_step_ms, num_gpus).",
    starterCode: `def scaling_efficiency(single_gpu_step_ms, multi_gpu_step_ms, num_gpus):
    # Your code here
    pass`,
    solution: `def scaling_efficiency(single_gpu_step_ms, multi_gpu_step_ms, num_gpus):
    return single_gpu_step_ms / (num_gpus * multi_gpu_step_ms)`,
    testCases: [
      { input: [100.0, 15.0, 8], expected: 0.8333333333 },
      { input: [100.0, 12.5, 8], expected: 1.0 },
      { input: [50.0, 10.0, 4], expected: 1.25 },
      { input: [100.0, 100.0, 1], expected: 1.0 },
    ],
    hint: "Ideal multi-GPU time is single-GPU time divided by num_gpus.",
  },
  {
    id: "dl-435",
    title: "Communication To Compute Ratio",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the gradient all-reduce time and its ratio to compute time for one data-parallel step: comm_ms = 2 * (num_gpus - 1) / num_gpus * param_bytes / (bandwidth_gbps * 1e6).\n\nThe signature is communication_compute_ratio(param_bytes, num_gpus, bandwidth_gbps, compute_ms). Return [comm_ms, ratio].",
    starterCode: `def communication_compute_ratio(param_bytes, num_gpus, bandwidth_gbps, compute_ms):
    # Your code here
    pass`,
    solution: `def communication_compute_ratio(param_bytes, num_gpus, bandwidth_gbps, compute_ms):
    comm_ms = 2.0 * (num_gpus - 1) / num_gpus * param_bytes / (bandwidth_gbps * 1e6)
    return [comm_ms, comm_ms / compute_ms]`,
    testCases: [
      { input: [4000000000, 8, 200.0, 100.0], expected: [35.0, 0.35] },
      { input: [1000000000, 2, 100.0, 50.0], expected: [10.0, 0.2] },
      { input: [8000000000, 16, 400.0, 20.0], expected: [37.5, 1.875] },
      { input: [1000000, 4, 50.0, 10.0], expected: [0.03, 0.003] },
    ],
    hint: "A ratio near or above 1 means communication cannot hide behind compute.",
  },
  {
    id: "dl-436",
    title: "NVLink Vs PCIe Transfer Time",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compare transfer times for the same payload over NVLink and PCIe: time_ms = transfer_bytes / (bandwidth_gbps * 1e6) for each link. Return [nvlink_ms, pcie_ms, pcie_ms / nvlink_ms].\n\nThe signature is nvlink_vs_pcie(transfer_bytes, nvlink_gbps, pcie_gbps).",
    starterCode: `def nvlink_vs_pcie(transfer_bytes, nvlink_gbps, pcie_gbps):
    # Your code here
    pass`,
    solution: `def nvlink_vs_pcie(transfer_bytes, nvlink_gbps, pcie_gbps):
    nv = transfer_bytes / (nvlink_gbps * 1e6)
    pc = transfer_bytes / (pcie_gbps * 1e6)
    return [nv, pc, pc / nv]`,
    testCases: [
      { input: [1000000000, 900.0, 32.0], expected: [1.1111111111, 31.25, 28.125] },
      { input: [500000000, 450.0, 16.0], expected: [1.1111111111, 31.25, 28.125] },
      { input: [1000000, 900.0, 32.0], expected: [0.0011111111, 0.03125, 28.125] },
      { input: [4000000000, 900.0, 64.0], expected: [4.4444444444, 62.5, 14.0625] },
    ],
    hint: "The ratio of times is just the inverse ratio of bandwidths.",
  },
  {
    id: "dl-437",
    title: "Activation Memory Per Layer",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Estimate activation memory stored per transformer block during training: 4 tensors of width d_model (attention input, attention output and two MLP projections) plus 2 tensors of width d_ff, each of shape (batch_size, seq_len) and bytes_per_value bytes wide.\n\nThe signature is activation_memory_per_layer(batch_size, seq_len, d_model, d_ff, bytes_per_value=2). Return an integer number of bytes.",
    starterCode: `def activation_memory_per_layer(batch_size, seq_len, d_model, d_ff, bytes_per_value=2):
    # Your code here
    pass`,
    solution: `def activation_memory_per_layer(batch_size, seq_len, d_model, d_ff, bytes_per_value=2):
    elements = batch_size * seq_len * (4 * d_model + 2 * d_ff)
    return elements * bytes_per_value`,
    testCases: [
      { input: [8, 1024, 768, 3072, 2], expected: 150994944 },
      { input: [1, 128, 64, 256, 4], expected: 393216 },
      { input: [2, 512, 512, 2048, 2], expected: 12582912 },
      { input: [4, 256, 128, 512, 2], expected: 3145728 },
    ],
    hint: "Total elements per block is batch times sequence length times the summed widths.",
  },
  {
    id: "dl-438",
    title: "Checkpointing Recompute Factor",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Estimate the compute factor from activation checkpointing every checkpoint_every layers. The baseline is 3 * num_layers forward-equivalents (one forward plus a two-forward backward); checkpointing adds one forward-equivalent per checkpointed segment, giving (3 * num_layers + ceil(num_layers / checkpoint_every)) / (3 * num_layers).\n\nThe signature is checkpointing_recompute_factor(num_layers, checkpoint_every).",
    starterCode: `def checkpointing_recompute_factor(num_layers, checkpoint_every):
    # Your code here
    pass`,
    solution: `def checkpointing_recompute_factor(num_layers, checkpoint_every):
    segments = (num_layers + checkpoint_every - 1) // checkpoint_every
    return (3.0 * num_layers + segments) / (3.0 * num_layers)`,
    testCases: [
      { input: [24, 4], expected: 1.0833333333 },
      { input: [24, 1], expected: 1.3333333333 },
      { input: [24, 24], expected: 1.0138888889 },
      { input: [12, 3], expected: 1.1111111111 },
      { input: [6, 4], expected: 1.1111111111 },
    ],
    hint: "Checkpointing every layer recomputes the whole forward pass once, so the factor approaches 4/3.",
  },
  {
    id: "dl-439",
    title: "Max Sequence From KV Budget",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Find the longest sequence length that fits a KV cache budget: floor((budget_bytes - model_bytes) / (batch_size * kv_bytes_per_token)). Return 0 if the model alone exceeds the budget or the per-token cache is non-positive.\n\nThe signature is max_sequence_from_kv_budget(budget_bytes, model_bytes, kv_bytes_per_token, batch_size). Return an integer.",
    starterCode: `def max_sequence_from_kv_budget(budget_bytes, model_bytes, kv_bytes_per_token, batch_size):
    # Your code here
    pass`,
    solution: `def max_sequence_from_kv_budget(budget_bytes, model_bytes, kv_bytes_per_token, batch_size):
    available = budget_bytes - model_bytes
    if available <= 0 or kv_bytes_per_token <= 0:
        return 0
    return int(available // (batch_size * kv_bytes_per_token))`,
    testCases: [
      { input: [100000000000, 60000000000, 1000000, 8], expected: 5000 },
      { input: [100000000000, 100000000000, 1000000, 1], expected: 0 },
      { input: [10000000000, 20000000000, 1000000, 1], expected: 0 },
      { input: [80000000000, 40000000000, 500000, 4], expected: 20000 },
    ],
    hint: "The batch shares the cache, so divide the leftover bytes by batch times bytes-per-token.",
  },
  {
    id: "dl-440",
    title: "Max Batch Size From Memory",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Find the largest batch that fits the memory left after loading the weights: floor((budget_bytes - model_bytes) / per_sequence_cache_bytes). Return 0 if weights exceed the budget or the per-sequence cache is non-positive.\n\nThe signature is max_batch_size(budget_bytes, model_bytes, per_sequence_cache_bytes). Return an integer.",
    starterCode: `def max_batch_size(budget_bytes, model_bytes, per_sequence_cache_bytes):
    # Your code here
    pass`,
    solution: `def max_batch_size(budget_bytes, model_bytes, per_sequence_cache_bytes):
    available = budget_bytes - model_bytes
    if available <= 0 or per_sequence_cache_bytes <= 0:
        return 0
    return int(available // per_sequence_cache_bytes)`,
    testCases: [
      { input: [80000000000, 40000000000, 500000000], expected: 80 },
      { input: [100000000000, 99000000000, 1000000000], expected: 1 },
      { input: [1000000000, 2000000000, 1000], expected: 0 },
      { input: [50000000000, 0, 2500000000], expected: 20 },
    ],
    hint: "Floor division gives the number of whole per-sequence caches that fit.",
  },
  {
    id: "dl-441",
    title: "Prefill Decode Throughput Blend",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute end-to-end token throughput for a request: total time is prompt_tokens / prefill_tokens_per_s + generated_tokens / decode_tokens_per_s, and blended throughput is (prompt_tokens + generated_tokens) / total time.\n\nThe signature is blended_throughput(prompt_tokens, generated_tokens, prefill_tokens_per_s, decode_tokens_per_s).",
    starterCode: `def blended_throughput(prompt_tokens, generated_tokens, prefill_tokens_per_s, decode_tokens_per_s):
    # Your code here
    pass`,
    solution: `def blended_throughput(prompt_tokens, generated_tokens, prefill_tokens_per_s, decode_tokens_per_s):
    time_s = prompt_tokens / prefill_tokens_per_s + generated_tokens / decode_tokens_per_s
    return (prompt_tokens + generated_tokens) / time_s`,
    testCases: [
      { input: [500, 100, 5000.0, 50.0], expected: 285.7142857143 },
      { input: [0, 100, 5000.0, 50.0], expected: 50.0 },
      { input: [500, 0, 5000.0, 50.0], expected: 5000.0 },
      { input: [1000, 1000, 2000.0, 25.0], expected: 49.3827160494 },
    ],
    hint: "Decode dominates wall time even when prefill moves far more tokens per second.",
  },
  {
    id: "dl-442",
    title: "Chunked Prefill Remainder",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Return the number of tokens in the final chunk of a chunked prefill: seq_len % chunk_size, or chunk_size when the division is exact.\n\nThe signature is chunked_prefill_remainder(seq_len, chunk_size). Return an integer.",
    starterCode: `def chunked_prefill_remainder(seq_len, chunk_size):
    # Your code here
    pass`,
    solution: `def chunked_prefill_remainder(seq_len, chunk_size):
    rem = seq_len % chunk_size
    return chunk_size if rem == 0 else rem`,
    testCases: [
      { input: [1000, 256], expected: 232 },
      { input: [512, 256], expected: 256 },
      { input: [100, 128], expected: 100 },
      { input: [1, 1], expected: 1 },
      { input: [768, 256], expected: 256 },
    ],
    hint: "When the remainder is zero the last chunk is full.",
  },
  {
    id: "dl-443",
    title: "Continuous Batching Utilization",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Simulate a continuous batching scheduler and measure slot utilization. One request arrives per step starting at step 0; each step admits waiting requests up to max_slots, then every active request consumes one step of its service_steps. Return total_request_steps / (max_slots * total_steps).\n\nThe signature is continuous_batching_utilization(num_requests, service_steps, max_slots).",
    starterCode: `def continuous_batching_utilization(num_requests, service_steps, max_slots):
    # Your code here
    pass`,
    solution: `def continuous_batching_utilization(num_requests, service_steps, max_slots):
    arrived = 0
    remaining = []
    time = 0
    while arrived < num_requests or remaining:
        while arrived < num_requests and len(remaining) < max_slots:
            remaining.append(service_steps)
            arrived += 1
        remaining = [r - 1 for r in remaining if r - 1 > 0]
        time += 1
    if time == 0:
        return 0.0
    return num_requests * service_steps / (max_slots * time)`,
    testCases: [
      { input: [4, 2, 2], expected: 1.0 },
      { input: [3, 1, 2], expected: 0.75 },
      { input: [1, 5, 4], expected: 0.25 },
      { input: [6, 2, 3], expected: 1.0 },
      { input: [5, 3, 4], expected: 0.625 },
    ],
    hint: "Utilization drops when requests finish faster than new ones arrive to fill the slots.",
  },
  {
    id: "dl-444",
    title: "Latency For Target Throughput",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Given ascending batch sizes and their measured latencies in milliseconds, find the smallest batch whose throughput batch_size / latency_ms * 1000 reaches target_tps, and return its latency. Return -1.0 if no batch reaches the target.\n\nThe signature is latency_for_target_throughput(batch_sizes, latencies, target_tps).",
    starterCode: `def latency_for_target_throughput(batch_sizes, latencies, target_tps):
    # Your code here
    pass`,
    solution: `def latency_for_target_throughput(batch_sizes, latencies, target_tps):
    for i in range(len(batch_sizes)):
        if batch_sizes[i] / latencies[i] * 1000.0 >= target_tps:
            return latencies[i]
    return -1.0`,
    testCases: [
      { input: [[1, 2, 4, 8], [10.0, 12.0, 30.0, 50.0], 150.0], expected: 12.0 },
      { input: [[1, 2, 4, 8], [10.0, 12.0, 30.0, 50.0], 1500.0], expected: -1.0 },
      { input: [[1, 4, 16], [5.0, 10.0, 40.0], 300.0], expected: 10.0 },
      { input: [[2], [20.0], 100.0], expected: 20.0 },
    ],
    hint: "Batch sizes are ascending, so the first batch that meets the target is also the lowest-latency one.",
  },
  {
    id: "dl-445",
    title: "TTFT Component Sum",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Sum the components of time to first token and report the dominant one: tokenization, queueing, prefill compute and network transfer. Return [total_ms, dominant], choosing the earliest component in that order on ties.\n\nThe signature is ttft_components(tokenize_ms, queue_ms, prefill_ms, network_ms).",
    starterCode: `def ttft_components(tokenize_ms, queue_ms, prefill_ms, network_ms):
    # Your code here
    pass`,
    solution: `def ttft_components(tokenize_ms, queue_ms, prefill_ms, network_ms):
    parts = [tokenize_ms, queue_ms, prefill_ms, network_ms]
    names = ["tokenize", "queue", "prefill", "network"]
    total = sum(parts)
    best = 0
    for i in range(1, 4):
        if parts[i] > parts[best]:
            best = i
    return [total, names[best]]`,
    testCases: [
      { input: [2.0, 5.0, 80.0, 3.0], expected: [90.0, "prefill"] },
      { input: [1.0, 1.0, 1.0, 1.0], expected: [4.0, "tokenize"] },
      { input: [0.0, 40.0, 20.0, 40.0], expected: [100.0, "queue"] },
      { input: [5.0, 0.0, 0.0, 0.0], expected: [5.0, "tokenize"] },
    ],
    hint: "Strict greater-than keeps the first component when several tie for the maximum.",
  },
  {
    id: "dl-446",
    title: "Per User Token Rate",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the per-user decode rate when each user receives exactly one token per engine step: 1000 / step_time_ms tokens per second.\n\nThe signature is per_user_token_rate(step_time_ms). Return tokens per second as a float.",
    starterCode: `def per_user_token_rate(step_time_ms):
    # Your code here
    pass`,
    solution: `def per_user_token_rate(step_time_ms):
    return 1000.0 / step_time_ms`,
    testCases: [
      { input: [20.0], expected: 50.0 },
      { input: [8.0], expected: 125.0 },
      { input: [100.0], expected: 10.0 },
      { input: [0.5], expected: 2000.0 },
    ],
    hint: "One token per step means the per-user rate is simply the step rate.",
  },
  {
    id: "dl-447",
    title: "M/M/1 Queue Delay",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Estimate the expected queueing delay before service in a single-server queue with Poisson arrivals at arrival_rate and exponential service at service_rate: Wq = lambda / (mu * (mu - lambda)). Both rates share a time unit and arrival_rate must be below service_rate for a stable queue.\n\nThe signature is mm1_queue_delay(arrival_rate, service_rate). Return the expected delay in the same time unit.",
    starterCode: `def mm1_queue_delay(arrival_rate, service_rate):
    # Your code here
    pass`,
    solution: `def mm1_queue_delay(arrival_rate, service_rate):
    return arrival_rate / (service_rate * (service_rate - arrival_rate))`,
    testCases: [
      { input: [8.0, 10.0], expected: 0.4 },
      { input: [0.0, 10.0], expected: 0.0 },
      { input: [5.0, 10.0], expected: 0.1 },
      { input: [9.9, 10.0], expected: 9.9 },
      { input: [1.0, 2.0], expected: 0.5 },
    ],
    hint: "As utilization approaches 1 the denominator mu - lambda goes to zero and delay explodes.",
  },
  {
    id: "dl-448",
    title: "Acceptance Rate Estimate",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the aggregate speculative-decoding acceptance rate from per-round counts: sum(accepted_counts) / sum(proposed_counts).\n\nThe signature is acceptance_rate(accepted_counts, proposed_counts). Return a float between 0 and 1.",
    starterCode: `def acceptance_rate(accepted_counts, proposed_counts):
    # Your code here
    pass`,
    solution: `def acceptance_rate(accepted_counts, proposed_counts):
    return sum(accepted_counts) / sum(proposed_counts)`,
    testCases: [
      { input: [[8, 6], [10, 10]], expected: 0.7 },
      { input: [[0], [5]], expected: 0.0 },
      { input: [[5], [5]], expected: 1.0 },
      { input: [[3, 3, 3], [4, 4, 4]], expected: 0.75 },
    ],
    hint: "Pool all rounds by summing accepted and proposed tokens separately.",
  },
  {
    id: "dl-449",
    title: "Expected Tokens Per Verification Step",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Compute the expected number of tokens produced per speculative verification step from per-position acceptance probabilities: 1 + sum over i of the product of probabilities up to position i, counting the accepted prefix plus one bonus token.\n\nThe signature is expected_tokens_per_verification(accept_probs). Return a float.",
    starterCode: `def expected_tokens_per_verification(accept_probs):
    # Your code here
    pass`,
    solution: `def expected_tokens_per_verification(accept_probs):
    total = 1.0
    product = 1.0
    for p in accept_probs:
        product *= p
        total += product
    return total`,
    testCases: [
      { input: [[0.8, 0.8, 0.8, 0.8]], expected: 3.3616 },
      { input: [[1.0, 1.0]], expected: 3.0 },
      { input: [[0.0, 0.5]], expected: 1.0 },
      { input: [[0.5, 1.0]], expected: 2.0 },
      { input: [[0.9, 0.7, 0.5]], expected: 2.845 },
    ],
    hint: "Position i contributes only if every earlier token was accepted, hence the running product.",
  },
  {
    id: "dl-450",
    title: "Draft Cost Ratio From Time",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the cost ratio of running the draft model versus the target model per token: draft_ms_per_token / target_ms_per_token. This is the per-token time ratio that speculative decoding multiplies by the number of drafted tokens.\n\nThe signature is draft_cost_ratio(draft_ms_per_token, target_ms_per_token).",
    starterCode: `def draft_cost_ratio(draft_ms_per_token, target_ms_per_token):
    # Your code here
    pass`,
    solution: `def draft_cost_ratio(draft_ms_per_token, target_ms_per_token):
    return draft_ms_per_token / target_ms_per_token`,
    testCases: [
      { input: [1.0, 10.0], expected: 0.1 },
      { input: [0.0, 5.0], expected: 0.0 },
      { input: [5.0, 5.0], expected: 1.0 },
      { input: [2.0, 8.0], expected: 0.25 },
    ],
    hint: "A draft ten times faster per token has a cost ratio of 0.1.",
  },
  {
    id: "dl-451",
    title: "Int4 Vs Int8 Memory Reduction",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the fraction of memory saved by moving from int8 to int4 weights. Each scheme pays num_params * bits / 8 bytes plus one scale_bits-wide scale per group when group_size is positive. Return 1 - int4_bytes / int8_bytes.\n\nThe signature is int4_vs_int8_reduction(num_params, group_size=0, scale_bits=16).",
    starterCode: `def int4_vs_int8_reduction(num_params, group_size=0, scale_bits=16):
    # Your code here
    pass`,
    solution: `def int4_vs_int8_reduction(num_params, group_size=0, scale_bits=16):
    def size(bits):
        s = num_params * bits / 8.0
        if group_size > 0:
            s += (num_params // group_size) * scale_bits / 8.0
        return s
    return 1.0 - size(4) / size(8)`,
    testCases: [
      { input: [1000000, 0, 16], expected: 0.5 },
      { input: [1000000, 64, 16], expected: 0.4848484848 },
      { input: [1000000, 128, 16], expected: 0.4923081770 },
      { input: [100, 0, 16], expected: 0.5 },
    ],
    hint: "Group scales are a fixed overhead, so they dilute the ideal 50 percent saving.",
  },
  {
    id: "dl-452",
    title: "Weight Load Time",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Estimate how long it takes to stream a model's weights from memory once: model_bytes / (bandwidth_gbps * 1e6) milliseconds.\n\nThe signature is weight_load_time_ms(model_bytes, bandwidth_gbps). Return a float number of milliseconds.",
    starterCode: `def weight_load_time_ms(model_bytes, bandwidth_gbps):
    # Your code here
    pass`,
    solution: `def weight_load_time_ms(model_bytes, bandwidth_gbps):
    return model_bytes / (bandwidth_gbps * 1e6)`,
    testCases: [
      { input: [14000000000, 32.0], expected: 437.5 },
      { input: [1000000000, 1000.0], expected: 1.0 },
      { input: [0, 900.0], expected: 0.0 },
      { input: [4000000000, 900.0], expected: 4.4444444444 },
    ],
    hint: "This is the same memory-bound term that dominates each decode step.",
  },
  {
    id: "dl-453",
    title: "Training Checkpoint Size",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the size in bytes of a training checkpoint holding weights and optimizer state (gradients are typically not saved): num_params * bytes_per_param + num_params * optimizer_states * optimizer_bytes.\n\nThe signature is training_checkpoint_size(num_params, bytes_per_param=2, optimizer_states=2, optimizer_bytes=4). Return an integer number of bytes.",
    starterCode: `def training_checkpoint_size(num_params, bytes_per_param=2, optimizer_states=2, optimizer_bytes=4):
    # Your code here
    pass`,
    solution: `def training_checkpoint_size(num_params, bytes_per_param=2, optimizer_states=2, optimizer_bytes=4):
    return num_params * bytes_per_param + num_params * optimizer_states * optimizer_bytes`,
    testCases: [
      { input: [1000000000, 2, 2, 4], expected: 10000000000 },
      { input: [7000000000, 2, 2, 4], expected: 70000000000 },
      { input: [1000, 4, 0, 4], expected: 4000 },
      { input: [1, 2, 2, 4], expected: 10 },
    ],
    hint: "Adam-style state usually dwarfs the fp16 weights.",
  },
  {
    id: "dl-454",
    title: "Checkpoint Save Time",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Estimate the time in seconds to write a checkpoint: checkpoint_bytes / (write_bandwidth_gbps * 1e9).\n\nThe signature is checkpoint_save_time_s(checkpoint_bytes, write_bandwidth_gbps). Return seconds as a float.",
    starterCode: `def checkpoint_save_time_s(checkpoint_bytes, write_bandwidth_gbps):
    # Your code here
    pass`,
    solution: `def checkpoint_save_time_s(checkpoint_bytes, write_bandwidth_gbps):
    return checkpoint_bytes / (write_bandwidth_gbps * 1e9)`,
    testCases: [
      { input: [10000000000, 10.0], expected: 1.0 },
      { input: [5000000000, 2.5], expected: 2.0 },
      { input: [0, 1.0], expected: 0.0 },
      { input: [100, 1.0], expected: 1e-07 },
    ],
    hint: "One gigabyte per second writes 1e9 bytes per second.",
  },
  {
    id: "dl-455",
    title: "Straggler Step Time Impact",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Given per-rank step times in milliseconds, a synchronous data-parallel step takes the slowest rank's time. Return [slowest_ms, slowdown], where slowdown = slowest / mean - 1 measures how much the straggler inflates the average.\n\nThe signature is straggler_step_time(rank_step_times_ms).",
    starterCode: `def straggler_step_time(rank_step_times_ms):
    # Your code here
    pass`,
    solution: `def straggler_step_time(rank_step_times_ms):
    slowest = max(rank_step_times_ms)
    mean = sum(rank_step_times_ms) / len(rank_step_times_ms)
    return [slowest, slowest / mean - 1.0]`,
    testCases: [
      { input: [[100.0, 100.0, 100.0, 120.0]], expected: [120.0, 0.1428571429] },
      { input: [[50.0, 50.0]], expected: [50.0, 0.0] },
      { input: [[80.0, 90.0, 100.0]], expected: [100.0, 0.1111111111] },
      { input: [[200.0]], expected: [200.0, 0.0] },
      { input: [[10.0, 20.0, 30.0, 40.0]], expected: [40.0, 0.6] },
    ],
    hint: "A single slow rank forces every other rank to wait at the synchronization barrier.",
  },
];
