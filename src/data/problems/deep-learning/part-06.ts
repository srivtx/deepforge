import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "dl-186",
    title: "KV Cache Append Step",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Append one new key vector and one new value vector to the key/value caches. Return [new_k_cache, new_v_cache] with the new vector at the end of each cache.\n\nThe signature is kv_cache_append(k_cache, v_cache, new_k, new_v). Each cache is a list of vectors.",
    starterCode: `def kv_cache_append(k_cache, v_cache, new_k, new_v):
    # Your code here
    pass`,
    solution: `def kv_cache_append(k_cache, v_cache, new_k, new_v):
    return [list(k_cache) + [list(new_k)], list(v_cache) + [list(new_v)]]`,
    testCases: [
      { input: [[[1.0, 0.0]], [[0.0, 1.0]], [2.0, 2.0], [3.0, 3.0]], expected: [[[1.0, 0.0], [2.0, 2.0]], [[0.0, 1.0], [3.0, 3.0]]] },
      { input: [[], [], [1.0], [2.0]], expected: [[[1.0]], [[2.0]]] },
      { input: [[[1.0, 2.0]], [[3.0, 4.0]], [5.0, 6.0], [7.0, 8.0]], expected: [[[1.0, 2.0], [5.0, 6.0]], [[3.0, 4.0], [7.0, 8.0]]] },
      { input: [[[1.0]], [[1.0]], [0.0], [0.0]], expected: [[[1.0], [0.0]], [[1.0], [0.0]]] },
    ],
    hint: "Decoding appends one position per step instead of re-running the whole prefix.",
  },
  {
    id: "dl-187",
    title: "Continuous Batching Rounds",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Count scheduling rounds for continuous batching. Requests are packed greedily in order into rounds whose total token count must not exceed max_tokens_per_batch; a request that does not fit starts a new round.\n\nThe signature is continuous_batching_rounds(request_tokens, max_tokens_per_batch). Return the number of rounds.",
    starterCode: `def continuous_batching_rounds(request_tokens, max_tokens_per_batch):
    # Your code here
    pass`,
    solution: `def continuous_batching_rounds(request_tokens, max_tokens_per_batch):
    steps = 0
    current = 0
    for t in request_tokens:
        if current > 0 and current + t > max_tokens_per_batch:
            steps += 1
            current = 0
        current += t
    if current > 0:
        steps += 1
    return steps`,
    testCases: [
      { input: [[100, 200, 300], 400], expected: 2 },
      { input: [[400, 400], 400], expected: 2 },
      { input: [[100, 100], 400], expected: 1 },
      { input: [[500], 400], expected: 1 },
      { input: [[], 400], expected: 0 },
    ],
    hint: "Continuous batching fills each round with as many queued requests as fit.",
  },
  {
    id: "dl-188",
    title: "Draft Model Size Ratio",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the parameter ratio between a speculative draft model and its target model: draft_params / target_params.\n\nThe signature is draft_size_ratio(draft_params, target_params).",
    starterCode: `def draft_size_ratio(draft_params, target_params):
    # Your code here
    pass`,
    solution: `def draft_size_ratio(draft_params, target_params):
    return draft_params / target_params`,
    testCases: [
      { input: [1000000, 10000000], expected: 0.1 },
      { input: [0, 1], expected: 0.0 },
      { input: [1, 2], expected: 0.5 },
      { input: [5000000, 5000000], expected: 1.0 },
    ],
    hint: "Small draft models are cheap to run repeatedly and are verified in parallel by the target.",
  },
  {
    id: "dl-189",
    title: "Decode Latency Estimate",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Estimate the per-token decode latency when generation is memory-bandwidth bound: (model_bytes + kv_cache_bytes) / (bandwidth_gbps * 1e6) milliseconds.\n\nThe signature is decode_latency_ms(model_bytes, kv_cache_bytes, bandwidth_gbps).",
    starterCode: `def decode_latency_ms(model_bytes, kv_cache_bytes, bandwidth_gbps):
    # Your code here
    pass`,
    solution: `def decode_latency_ms(model_bytes, kv_cache_bytes, bandwidth_gbps):
    return (model_bytes + kv_cache_bytes) / (bandwidth_gbps * 1e6)`,
    testCases: [
      { input: [1000000000, 100000000, 100], expected: 11.0 },
      { input: [1000000000, 0, 1000], expected: 1.0 },
      { input: [2000000000, 200000000, 50], expected: 44.0 },
      { input: [1000000, 0, 10], expected: 0.1 },
    ],
    hint: "One decode step must stream all weights and the whole KV cache through the GPU.",
  },
  {
    id: "dl-190",
    title: "TTFT Estimate",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Estimate time to first token in milliseconds: prefill_flops / gpu_flops_per_sec * 1000 + overhead_ms.\n\nThe signature is ttft_ms(prefill_flops, gpu_flops_per_sec, overhead_ms=0.0).",
    starterCode: `def ttft_ms(prefill_flops, gpu_flops_per_sec, overhead_ms=0.0):
    # Your code here
    pass`,
    solution: `def ttft_ms(prefill_flops, gpu_flops_per_sec, overhead_ms=0.0):
    return prefill_flops / gpu_flops_per_sec * 1000.0 + overhead_ms`,
    testCases: [
      { input: [1000000000000.0, 100000000000000.0, 5.0], expected: 15.0 },
      { input: [100000000000.0, 100000000000000.0, 0.0], expected: 1.0 },
      { input: [10000000000000.0, 50000000000000.0, 2.0], expected: 202.0 },
      { input: [0.0, 100000000000000.0, 1.0], expected: 1.0 },
    ],
    hint: "Prefill processes the whole prompt in parallel, unlike memory-bound decode.",
  },
  {
    id: "dl-191",
    title: "Grouped-Query Head Ratio",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute how many query heads share each key/value head: num_query_heads / num_kv_heads.\n\nThe signature is gqa_ratio(num_query_heads, num_kv_heads).",
    starterCode: `def gqa_ratio(num_query_heads, num_kv_heads):
    # Your code here
    pass`,
    solution: `def gqa_ratio(num_query_heads, num_kv_heads):
    return num_query_heads / num_kv_heads`,
    testCases: [
      { input: [32, 8], expected: 4.0 },
      { input: [12, 12], expected: 1.0 },
      { input: [8, 1], expected: 8.0 },
      { input: [64, 16], expected: 4.0 },
    ],
    hint: "A ratio of 1 is standard multi-head attention and a ratio equal to the head count is multi-query.",
  },
  {
    id: "dl-192",
    title: "Presence Penalty Apply",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Apply the OpenAI-style presence penalty: subtract penalty once from the logit of every token that has already been generated, no matter how many times it appeared.\n\nThe signature is presence_penalty(logits, generated_ids, penalty). Return a copy of the logits.",
    starterCode: `def presence_penalty(logits, generated_ids, penalty):
    # Your code here
    pass`,
    solution: `def presence_penalty(logits, generated_ids, penalty):
    out = list(logits)
    for t in set(generated_ids):
        if 0 <= t < len(out):
            out[t] -= penalty
    return out`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], [0, 0], 0.5], expected: [0.5, 2.0, 3.0] },
      { input: [[0.0, 0.0], [1], 1.0], expected: [0.0, -1.0] },
      { input: [[1.0, 2.0], [], 0.5], expected: [1.0, 2.0] },
      { input: [[1.0, 1.0], [0, 1], 0.25], expected: [0.75, 0.75] },
    ],
    hint: "Presence penalizes whether a token appeared, while frequency penalizes how often.",
  },
  {
    id: "dl-193",
    title: "Stop Sequence Check",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Return True when the generated token ids end with the given stop sequence, and False otherwise. An empty stop sequence never matches.\n\nThe signature is stop_sequence_hit(generated_ids, stop_sequence).",
    starterCode: `def stop_sequence_hit(generated_ids, stop_sequence):
    # Your code here
    pass`,
    solution: `def stop_sequence_hit(generated_ids, stop_sequence):
    if len(stop_sequence) == 0 or len(generated_ids) < len(stop_sequence):
        return False
    return list(generated_ids[-len(stop_sequence):]) == list(stop_sequence)`,
    testCases: [
      { input: [[1, 2, 3], [2, 3]], expected: true },
      { input: [[1, 2, 3], [3]], expected: true },
      { input: [[1, 2, 3], [1, 2]], expected: false },
      { input: [[], [1]], expected: false },
      { input: [[1], [1, 1]], expected: false },
    ],
    hint: "Stop sequences are matched against the tail of the generated stream.",
  },
  {
    id: "dl-194",
    title: "EOS Handling in Batch",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Update per-sequence finished flags with a batch of end-of-sequence flags. A sequence is finished if it was already finished or just emitted EOS. Return [new_finished, active_count] where active_count counts the sequences still running.\n\nThe signature is eos_batch_update(finished, eos_flags).",
    starterCode: `def eos_batch_update(finished, eos_flags):
    # Your code here
    pass`,
    solution: `def eos_batch_update(finished, eos_flags):
    new_finished = [bool(finished[i]) or bool(eos_flags[i]) for i in range(len(finished))]
    active = sum(1 for f in new_finished if not f)
    return [new_finished, active]`,
    testCases: [
      { input: [[false, false], [true, false]], expected: [[true, false], 1] },
      { input: [[true, true], [false, false]], expected: [[true, true], 0] },
      { input: [[false], [false]], expected: [[false], 1] },
      { input: [[false, false, false], [false, false, true]], expected: [[false, false, true], 2] },
    ],
    hint: "Finished sequences are removed from the running batch, freeing their slot.",
  },
  {
    id: "dl-195",
    title: "Weight-Only Quant Memory",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Estimate weight-only quantization memory in bytes: num_params * bits / 8, plus 4 bytes per group for the scale when group_size > 0 (num_params // group_size groups).\n\nThe signature is weight_only_quant_memory(num_params, bits=4, group_size=0). Return a float number of bytes.",
    starterCode: `def weight_only_quant_memory(num_params, bits=4, group_size=0):
    # Your code here
    pass`,
    solution: `def weight_only_quant_memory(num_params, bits=4, group_size=0):
    total = num_params * bits / 8.0
    if group_size > 0:
        total += (num_params // group_size) * 4
    return total`,
    testCases: [
      { input: [1000000, 4, 0], expected: 500000.0 },
      { input: [1024, 8, 0], expected: 1024.0 },
      { input: [1024, 4, 128], expected: 544.0 },
      { input: [8000000, 4, 64], expected: 4500000.0 },
    ],
    hint: "Grouped scales add a small fixed overhead on top of the packed weights.",
  },
  {
    id: "dl-196",
    title: "Parameter Shard Range",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the [start, end) index range of shard shard_id when a flat parameter tensor of total_params is split into num_shards contiguous chunks of ceil(total_params / num_shards) elements, stopping at total_params.\n\nThe signature is parameter_shard_range(total_params, num_shards, shard_id). Return [start, end).",
    starterCode: `def parameter_shard_range(total_params, num_shards, shard_id):
    # Your code here
    pass`,
    solution: `def parameter_shard_range(total_params, num_shards, shard_id):
    per = (total_params + num_shards - 1) // num_shards
    start = shard_id * per
    end = min(start + per, total_params)
    return [start, end]`,
    testCases: [
      { input: [100, 4, 0], expected: [0, 25] },
      { input: [100, 4, 3], expected: [75, 100] },
      { input: [10, 3, 1], expected: [4, 8] },
      { input: [10, 3, 2], expected: [8, 10] },
      { input: [7, 7, 5], expected: [5, 6] },
    ],
    hint: "Each data-parallel rank owns one contiguous shard of every flattened tensor.",
  },
  {
    id: "dl-197",
    title: "Collective All-Reduce Bytes",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the communication volume of a ring all-reduce: 2 * (num_gpus - 1) / num_gpus * num_params * bytes_per_param.\n\nThe signature is all_reduce_bytes(num_params, bytes_per_param, num_gpus).",
    starterCode: `def all_reduce_bytes(num_params, bytes_per_param, num_gpus):
    # Your code here
    pass`,
    solution: `def all_reduce_bytes(num_params, bytes_per_param, num_gpus):
    return 2.0 * (num_gpus - 1) / num_gpus * num_params * bytes_per_param`,
    testCases: [
      { input: [1000000, 4, 8], expected: 7000000.0 },
      { input: [100, 4, 2], expected: 400.0 },
      { input: [1000, 2, 1], expected: 0.0 },
      { input: [1000, 2, 4], expected: 3000.0 },
    ],
    hint: "A single GPU has nothing to reduce; larger rings approach 2x the tensor size.",
  },
  {
    id: "dl-198",
    title: "Ring All-Reduce Steps",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Count the communication steps of a ring all-reduce: reduce-scatter takes num_gpus - 1 steps and all-gather takes another num_gpus - 1, so the total is 2 * (num_gpus - 1).\n\nThe signature is ring_all_reduce_steps(num_gpus). Return an integer.",
    starterCode: `def ring_all_reduce_steps(num_gpus):
    # Your code here
    pass`,
    solution: `def ring_all_reduce_steps(num_gpus):
    return 2 * (num_gpus - 1)`,
    testCases: [
      { input: [1], expected: 0 },
      { input: [2], expected: 2 },
      { input: [4], expected: 6 },
      { input: [8], expected: 14 },
    ],
    hint: "Latency grows linearly with the number of GPUs in a ring.",
  },
  {
    id: "dl-199",
    title: "Distributed Sync Interval",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Return the 0-based micro-batch indices at which gradients are synchronized, given that synchronization happens every sync_every micro-batches (indices sync_every - 1, 2 * sync_every - 1, ...).\n\nThe signature is sync_interval(micro_batches, sync_every).",
    starterCode: `def sync_interval(micro_batches, sync_every):
    # Your code here
    pass`,
    solution: `def sync_interval(micro_batches, sync_every):
    return [i for i in range(micro_batches) if (i + 1) % sync_every == 0]`,
    testCases: [
      { input: [4, 2], expected: [1, 3] },
      { input: [5, 5], expected: [4] },
      { input: [3, 1], expected: [0, 1, 2] },
      { input: [0, 2], expected: [] },
    ],
    hint: "With sync_every = 1 every micro-batch triggers an all-reduce.",
  },
  {
    id: "dl-200",
    title: "Prefix Cache Reuse Length",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute how many leading tokens two prompts share, which is how much of the KV cache can be reused between them.\n\nThe signature is prefix_cache_reuse(prompt_a, prompt_b). Return the length of the longest common prefix.",
    starterCode: `def prefix_cache_reuse(prompt_a, prompt_b):
    # Your code here
    pass`,
    solution: `def prefix_cache_reuse(prompt_a, prompt_b):
    n = 0
    while n < len(prompt_a) and n < len(prompt_b) and prompt_a[n] == prompt_b[n]:
        n += 1
    return n`,
    testCases: [
      { input: [[1, 2, 3], [1, 2, 4]], expected: 2 },
      { input: [[1, 2], [3, 4]], expected: 0 },
      { input: [[], [1]], expected: 0 },
      { input: [[5, 5, 5], [5, 5, 5]], expected: 3 },
    ],
    hint: "Shared system prompts make most requests in a session share long prefixes.",
  },
  {
    id: "dl-201",
    title: "Batch Padding Waste Ratio",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the fraction of padding tokens in a padded batch: 1 - sum(lengths) / (num_sequences * max_length).\n\nThe signature is padding_waste_ratio(lengths, max_length). Return a float.",
    starterCode: `def padding_waste_ratio(lengths, max_length):
    # Your code here
    pass`,
    solution: `def padding_waste_ratio(lengths, max_length):
    used = sum(lengths)
    total = len(lengths) * max_length
    return 1.0 - used / total`,
    testCases: [
      { input: [[10, 20], 20], expected: 0.25 },
      { input: [[20, 20], 20], expected: 0.0 },
      { input: [[0], 10], expected: 1.0 },
      { input: [[5], 10], expected: 0.5 },
    ],
    hint: "Length bucketing reduces this waste by grouping similar-length sequences.",
  },
  {
    id: "dl-202",
    title: "Paged Attention Block Table",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the paged-attention metadata for a sequence: the number of fixed-size KV blocks and how many slots of the last block are used. Blocks are filled completely before a new one is allocated.\n\nThe signature is paged_attention_block_table(seq_len, block_size). Return [num_blocks, last_block_used]; an empty sequence uses no blocks.",
    starterCode: `def paged_attention_block_table(seq_len, block_size):
    # Your code here
    pass`,
    solution: `def paged_attention_block_table(seq_len, block_size):
    if seq_len == 0:
        return [0, 0]
    num_blocks = (seq_len + block_size - 1) // block_size
    last_used = seq_len - (num_blocks - 1) * block_size
    return [num_blocks, last_used]`,
    testCases: [
      { input: [100, 16], expected: [7, 4] },
      { input: [16, 16], expected: [1, 16] },
      { input: [17, 16], expected: [2, 1] },
      { input: [0, 16], expected: [0, 0] },
    ],
    hint: "One token past a block boundary allocates a fresh block.",
  },
  {
    id: "dl-203",
    title: "Speculative Draft Accept Length",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Determine how many speculative draft tokens are accepted. For each drafted token, accept it with probability min(1, target_prob(token) / draft_prob(token)); stop at the first rejection. Call random.seed(seed) and draw one random.random() per drafted token.\n\nThe signature is speculative_accept_length(draft_tokens, target_probs, draft_probs, seed). Return the accepted prefix length.",
    starterCode: `import random
def speculative_accept_length(draft_tokens, target_probs, draft_probs, seed):
    # Your code here
    pass`,
    solution: `import random
def speculative_accept_length(draft_tokens, target_probs, draft_probs, seed):
    random.seed(seed)
    for i in range(len(draft_tokens)):
        t = draft_tokens[i]
        ratio = target_probs[i][t] / draft_probs[i][t]
        if ratio > 1.0:
            ratio = 1.0
        if random.random() > ratio:
            return i
    return len(draft_tokens)`,
    testCases: [
      { input: [[1, 0], [[0.5, 0.5], [0.5, 0.5]], [[0.5, 0.5], [0.5, 0.5]], 0], expected: 2 },
      { input: [[0], [[1.0, 0.0]], [[0.5, 0.5]], 0], expected: 1 },
      { input: [[1], [[0.1, 0.9]], [[0.9, 0.1]], 0], expected: 1 },
      { input: [[0], [[0.01, 0.99]], [[0.5, 0.5]], 0], expected: 0 },
      { input: [[1, 0], [[0.5, 0.5], [0.5, 0.5]], [[0.5, 0.5], [0.5, 0.5]], 1], expected: 2 },
    ],
    hint: "The acceptance rule keeps the speculative distribution identical to sampling from the target model.",
  },
  {
    id: "dl-204",
    title: "Min-P Sampling",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Filter logits with min-p sampling: compute a stable softmax, set the threshold to min_p times the largest probability, and keep every token whose probability is at least the threshold. Always keep the top token if nothing qualifies. Return the kept indices in ascending order.\n\nThe signature is min_p_filter(logits, min_p).",
    starterCode: `import math
def min_p_filter(logits, min_p):
    # Your code here
    pass`,
    solution: `import math
def min_p_filter(logits, min_p):
    m = max(logits)
    exps = [math.exp(v - m) for v in logits]
    total = sum(exps)
    probs = [e / total for e in exps]
    best = 0
    for i in range(1, len(probs)):
        if probs[i] > probs[best]:
            best = i
    threshold = min_p * probs[best]
    keep = [i for i in range(len(logits)) if probs[i] >= threshold]
    if not keep:
        keep = [best]
    return keep`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], 0.1], expected: [0, 1, 2] },
      { input: [[1.0, 2.0, 3.0], 0.2], expected: [1, 2] },
      { input: [[1.0, 2.0, 3.0], 0.5], expected: [2] },
      { input: [[0.0, 0.0, 0.0], 0.5], expected: [0, 1, 2] },
      { input: [[2.0, 1.0, 0.0], 1.0], expected: [0] },
    ],
    hint: "Min-p scales the cutoff with the model's own confidence, unlike fixed top-p.",
  },
  {
    id: "dl-205",
    title: "Typical-P Sampling",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Filter logits with typical-p sampling. Compute a stable softmax and its entropy H, rank tokens by | -log p - H | ascending (ties by index), keep the smallest prefix whose cumulative probability reaches p, and return the kept indices in ascending order.\n\nThe signature is typical_p_filter(logits, p).",
    starterCode: `import math
def typical_p_filter(logits, p):
    # Your code here
    pass`,
    solution: `import math
def typical_p_filter(logits, p):
    m = max(logits)
    exps = [math.exp(v - m) for v in logits]
    total = sum(exps)
    probs = [e / total for e in exps]
    entropy = -sum(pr * math.log(pr) for pr in probs if pr > 0.0)
    devs = [abs(-math.log(probs[i]) - entropy) for i in range(len(probs))]
    order = sorted(range(len(probs)), key=lambda i: (devs[i], i))
    keep = []
    cum = 0.0
    for i in order:
        keep.append(i)
        cum += probs[i]
        if cum >= p:
            break
    return sorted(keep)`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], 0.9], expected: [1, 2] },
      { input: [[1.0, 2.0, 3.0], 0.5], expected: [2] },
      { input: [[1.0, 2.0, 3.0], 1.0], expected: [0, 1, 2] },
      { input: [[0.0, 0.0, 0.0], 0.5], expected: [0, 1] },
      { input: [[0.0, 0.0, 0.0], 0.7], expected: [0, 1, 2] },
    ],
    hint: "Typical sampling keeps tokens whose surprise is close to the distribution's entropy.",
  },
  {
    id: "dl-206",
    title: "Frequency Penalty Apply",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Apply the OpenAI-style frequency penalty: subtract penalty times the number of occurrences of each generated token from its logit.\n\nThe signature is frequency_penalty(logits, generated_ids, penalty). Return a copy of the logits.",
    starterCode: `def frequency_penalty(logits, generated_ids, penalty):
    # Your code here
    pass`,
    solution: `def frequency_penalty(logits, generated_ids, penalty):
    counts = {}
    for t in generated_ids:
        counts[t] = counts.get(t, 0) + 1
    out = list(logits)
    for t in counts:
        if 0 <= t < len(out):
            out[t] -= penalty * counts[t]
    return out`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], [0, 0], 0.5], expected: [0.0, 2.0, 3.0] },
      { input: [[0.0, 0.0], [1], 1.0], expected: [0.0, -1.0] },
      { input: [[5.0, 5.0, 5.0], [0, 2, 2], 0.25], expected: [4.75, 5.0, 4.5] },
      { input: [[1.0, 2.0], [], 0.5], expected: [1.0, 2.0] },
    ],
    hint: "Frequency grows with each occurrence, so it penalizes repeated tokens more than presence does.",
  },
  {
    id: "dl-207",
    title: "Padding Side Logits Pick",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Select the logits of the last real token for each sequence in a padded batch. With right padding the last real token is at index lengths[i] - 1; with left padding it is always at index seq_len - 1.\n\nThe signature is last_token_logits(logits, lengths, pad_side). logits has shape (batch, seq_len, vocab).",
    starterCode: `def last_token_logits(logits, lengths, pad_side):
    # Your code here
    pass`,
    solution: `def last_token_logits(logits, lengths, pad_side):
    seq = len(logits[0])
    out = []
    for i in range(len(logits)):
        if pad_side == "left":
            idx = seq - 1
        else:
            idx = lengths[i] - 1
        out.append(list(logits[i][idx]))
    return out`,
    testCases: [
      { input: [[[[1.0, 2.0], [3.0, 4.0]], [[5.0, 6.0], [7.0, 8.0]]], [1, 2], "right"], expected: [[1.0, 2.0], [7.0, 8.0]] },
      { input: [[[[1.0, 2.0], [3.0, 4.0]], [[5.0, 6.0], [7.0, 8.0]]], [1, 2], "left"], expected: [[3.0, 4.0], [7.0, 8.0]] },
      { input: [[[[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]]], [2], "right"], expected: [[3.0, 4.0]] },
      { input: [[[[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]]], [2], "left"], expected: [[5.0, 6.0]] },
      { input: [[[[1.0, 2.0], [3.0, 4.0]], [[5.0, 6.0], [7.0, 8.0]]], [2, 1], "right"], expected: [[3.0, 4.0], [5.0, 6.0]] },
    ],
    hint: "Left padding lets every sequence's final logits sit at the same index for one clean gather.",
  },
  {
    id: "dl-208",
    title: "Attention Mask With Padding",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Build a 2D padding mask for one sequence of length total_len where only length positions are real. Mask[i][j] is 1 when both positions i and j are real. Right padding puts real tokens first, left padding puts them last.\n\nThe signature is padding_attention_mask(length, total_len, pad_side).",
    starterCode: `def padding_attention_mask(length, total_len, pad_side):
    # Your code here
    pass`,
    solution: `def padding_attention_mask(length, total_len, pad_side):
    if pad_side == "left":
        start = total_len - length
        end = total_len
    else:
        start = 0
        end = length
    return [[1 if (start <= i < end and start <= j < end) else 0 for j in range(total_len)] for i in range(total_len)]`,
    testCases: [
      { input: [2, 4, "right"], expected: [[1, 1, 0, 0], [1, 1, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]] },
      { input: [2, 4, "left"], expected: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 1, 1], [0, 0, 1, 1]] },
      { input: [4, 4, "right"], expected: [[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]] },
      { input: [0, 3, "right"], expected: [[0, 0, 0], [0, 0, 0], [0, 0, 0]] },
    ],
    hint: "Padding tokens must never be attended to, otherwise they leak garbage into the representation.",
  },
  {
    id: "dl-209",
    title: "Rotary Embedding Apply 2D",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Apply rotary position embeddings (RoPE) to a vector of even dimension. For each adjacent pair i, i+1 with pair index p = i // 2, the rotation angle is position * theta_base^(-2p/d), and the pair becomes [x0*cos - x1*sin, x0*sin + x1*cos].\n\nThe signature is rotary_embedding_apply(x, position, theta_base=10000.0).",
    starterCode: `import math
def rotary_embedding_apply(x, position, theta_base=10000.0):
    # Your code here
    pass`,
    solution: `import math
def rotary_embedding_apply(x, position, theta_base=10000.0):
    d = len(x)
    out = []
    for i in range(0, d, 2):
        freq = theta_base ** (-2.0 * (i // 2) / d)
        angle = position * freq
        c = math.cos(angle)
        s = math.sin(angle)
        out.append(x[i] * c - x[i + 1] * s)
        out.append(x[i] * s + x[i + 1] * c)
    return out`,
    testCases: [
      { input: [[1.0, 0.0], 0, 10000.0], expected: [1.0, 0.0] },
      { input: [[1.0, 0.0], 1, 10000.0], expected: [0.5403023059, 0.8414709848] },
      { input: [[1.0, 0.0, 1.0, 0.0], 1, 10000.0], expected: [0.5403023059, 0.8414709848, 0.9999500004, 0.0099998333] },
      { input: [[1.0, 0.0, 1.0, 0.0], 2, 1.0], expected: [-0.4161468365, 0.9092974268, -0.4161468365, 0.9092974268] },
    ],
    hint: "Higher pair indices rotate at lower frequencies, encoding different position scales.",
  },
  {
    id: "dl-210",
    title: "Sliding Window Attention Mask",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Build a sliding window attention mask: position i attends to itself and the window - 1 positions before it. Entries the mask allows are 1 and masked entries are 0.\n\nThe signature is sliding_window_mask(seq_len, window). Return a seq_len x seq_len matrix.",
    starterCode: `def sliding_window_mask(seq_len, window):
    # Your code here
    pass`,
    solution: `def sliding_window_mask(seq_len, window):
    return [[1 if (j <= i and j > i - window) else 0 for j in range(seq_len)] for i in range(seq_len)]`,
    testCases: [
      { input: [4, 2], expected: [[1, 0, 0, 0], [1, 1, 0, 0], [0, 1, 1, 0], [0, 0, 1, 1]] },
      { input: [3, 3], expected: [[1, 0, 0], [1, 1, 0], [1, 1, 1]] },
      { input: [5, 1], expected: [[1, 0, 0, 0, 0], [0, 1, 0, 0, 0], [0, 0, 1, 0, 0], [0, 0, 0, 1, 0], [0, 0, 0, 0, 1]] },
      { input: [1, 1], expected: [[1]] },
    ],
    hint: "A window of 1 degenerates to pure diagonal attention.",
  },
  {
    id: "dl-211",
    title: "Online Softmax Rescale Step",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Perform one step of the online softmax update with a running maximum m and running sum l and a new score x. If x > m, rescale the sum by exp(m - x), add 1 and update m; otherwise add exp(x - m). Return [m_new, l_new].\n\nThe signature is online_softmax_step(m, l, x).",
    starterCode: `import math
def online_softmax_step(m, l, x):
    # Your code here
    pass`,
    solution: `import math
def online_softmax_step(m, l, x):
    if x > m:
        l = l * math.exp(m - x) + 1.0
        m = x
    else:
        l = l + math.exp(x - m)
    return [m, l]`,
    testCases: [
      { input: [0.0, 1.0, 1.0], expected: [1.0, 1.3678794412] },
      { input: [0.0, 1.0, -1.0], expected: [0.0, 1.3678794412] },
      { input: [5.0, 0.0, 1.0], expected: [5.0, 0.0183156389] },
      { input: [0.0, 0.0, 0.0], expected: [0.0, 1.0] },
      { input: [-1000000000.0, 1.0, 0.0], expected: [0.0, 1.0] },
    ],
    hint: "The rescale factor exp(m - x) repairs the accumulated sum when a new maximum appears.",
  },
  {
    id: "dl-212",
    title: "Logsumexp Tracking Step",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Merge a new value x into a running log-sum-exp lse. If x > lse, return x + log1p(exp(lse - x)), otherwise lse + log1p(exp(x - lse)). Use log1p for stability.\n\nThe signature is logsumexp_step(lse, x). Return the new log-sum-exp.",
    starterCode: `import math
def logsumexp_step(lse, x):
    # Your code here
    pass`,
    solution: `import math
def logsumexp_step(lse, x):
    if x > lse:
        return x + math.log1p(math.exp(lse - x))
    return lse + math.log1p(math.exp(x - lse))`,
    testCases: [
      { input: [0.0, 1.0], expected: 1.3132616875 },
      { input: [0.0, 0.0], expected: 0.6931471806 },
      { input: [2.0, 0.5], expected: 2.201413278 },
      { input: [-1000000000.0, 5.0], expected: 5.0 },
    ],
    hint: "Log-sum-exp turns a product of probabilities into a stable sum in log space.",
  },
  {
    id: "dl-213",
    title: "Dynamic Batch Admission",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Admit requests greedily into a batch with a token budget: walk the lengths in order and stop before the request that would exceed max_tokens, with the guarantee that at least one request is always admitted.\n\nThe signature is dynamic_batch_admit(max_tokens, lengths). Return the number of admitted requests.",
    starterCode: `def dynamic_batch_admit(max_tokens, lengths):
    # Your code here
    pass`,
    solution: `def dynamic_batch_admit(max_tokens, lengths):
    admitted = 0
    used = 0
    for t in lengths:
        if used + t > max_tokens and admitted > 0:
            break
        used += t
        admitted += 1
    return admitted`,
    testCases: [
      { input: [1000, [100, 200, 300, 500]], expected: 3 },
      { input: [500, [400, 400]], expected: 1 },
      { input: [100, [50, 50]], expected: 2 },
      { input: [1000, [200, 200, 200, 200, 200]], expected: 5 },
      { input: [100, [200, 50]], expected: 1 },
    ],
    hint: "Token-budget scheduling keeps every step's compute roughly constant.",
  },
  {
    id: "dl-214",
    title: "SmoothQuant Migration Factor",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the SmoothQuant migration scale for one channel: s = act_max_abs^alpha / weight_max_abs^(1 - alpha). Activations are divided by s and weights multiplied by s, moving quantization difficulty from activations to weights.\n\nThe signature is smoothquant_scale(act_max_abs, weight_max_abs, alpha).",
    starterCode: `def smoothquant_scale(act_max_abs, weight_max_abs, alpha):
    # Your code here
    pass`,
    solution: `def smoothquant_scale(act_max_abs, weight_max_abs, alpha):
    return (act_max_abs ** alpha) / (weight_max_abs ** (1.0 - alpha))`,
    testCases: [
      { input: [10.0, 1.0, 0.5], expected: 3.1622776602 },
      { input: [4.0, 1.0, 0.5], expected: 2.0 },
      { input: [10.0, 1.0, 0.0], expected: 1.0 },
      { input: [10.0, 1.0, 1.0], expected: 10.0 },
      { input: [8.0, 2.0, 0.5], expected: 2.0 },
    ],
    hint: "Alpha = 0.5 balances the two dynamic ranges in the geometric mean.",
  },
  {
    id: "dl-215",
    title: "Outlier Channel Detect",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Find activation channels with extreme values. activations has shape (num_examples, channels); return the ascending list of channels whose maximum absolute activation exceeds threshold.\n\nThe signature is outlier_channels(activations, threshold).",
    starterCode: `def outlier_channels(activations, threshold):
    # Your code here
    pass`,
    solution: `def outlier_channels(activations, threshold):
    channels = len(activations[0])
    out = []
    for c in range(channels):
        if any(abs(activations[e][c]) > threshold for e in range(len(activations))):
            out.append(c)
    return out`,
    testCases: [
      { input: [[[1.0, 10.0, 2.0], [1.0, 1.0, 1.0]], 5.0], expected: [1] },
      { input: [[[1.0, 2.0], [3.0, 4.0]], 10.0], expected: [] },
      { input: [[[-20.0, 0.0, 5.0]], 15.0], expected: [0] },
      { input: [[[0.0, 0.0], [0.0, 0.0]], 0.0], expected: [] },
    ],
    hint: "Outlier channels are why per-channel and per-group quantization often beat per-tensor.",
  },
  {
    id: "dl-216",
    title: "Loss Scaling Skip Step",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Handle one mixed-precision step with dynamic loss scaling. If a gradient overflowed, skip the step (True), back off the scale and reset the good-step counter. Otherwise count a good step; once good_steps reaches growth_interval, grow the scale and reset the counter. Return [skip, new_loss_scale, new_good_steps].\n\nThe signature is loss_scaling_skip_step(loss_scale, found_inf, good_steps, growth_interval, growth_factor=2.0, backoff_factor=0.5).",
    starterCode: `def loss_scaling_skip_step(loss_scale, found_inf, good_steps, growth_interval, growth_factor=2.0, backoff_factor=0.5):
    # Your code here
    pass`,
    solution: `def loss_scaling_skip_step(loss_scale, found_inf, good_steps, growth_interval, growth_factor=2.0, backoff_factor=0.5):
    if found_inf:
        return [True, loss_scale * backoff_factor, 0]
    good = good_steps + 1
    if good >= growth_interval:
        return [False, loss_scale * growth_factor, 0]
    return [False, loss_scale, good]`,
    testCases: [
      { input: [1024.0, true, 5, 10], expected: [true, 512.0, 0] },
      { input: [1024.0, false, 0, 2], expected: [false, 1024.0, 1] },
      { input: [1024.0, false, 1, 2], expected: [false, 2048.0, 0] },
      { input: [100.0, true, 0, 5, 1.5, 0.1], expected: [true, 10.0, 0] },
    ],
    hint: "Skipping the optimizer step is essential because overflowed gradients would corrupt the weights.",
  },
  {
    id: "dl-217",
    title: "ZeRO-3 Gather Bytes",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Estimate ZeRO-3 communication for one layer. The transient buffer holds the full layer of per_layer_params * bytes, and the all-gather pushes num_layers * (num_gpus - 1) / num_gpus * per_layer_params * bytes in total. Return [transient_bytes, total_comm_bytes].\n\nThe signature is zero3_gather_bytes(per_layer_params, bytes_per_param, num_layers, num_gpus).",
    starterCode: `def zero3_gather_bytes(per_layer_params, bytes_per_param, num_layers, num_gpus):
    # Your code here
    pass`,
    solution: `def zero3_gather_bytes(per_layer_params, bytes_per_param, num_layers, num_gpus):
    transient = per_layer_params * bytes_per_param
    comm = num_layers * (num_gpus - 1) / num_gpus * per_layer_params * bytes_per_param
    return [transient, comm]`,
    testCases: [
      { input: [1000000, 4, 12, 8], expected: [4000000, 42000000.0] },
      { input: [1000, 2, 1, 2], expected: [2000, 1000.0] },
      { input: [100, 4, 2, 4], expected: [400, 600.0] },
      { input: [1000, 2, 4, 1], expected: [2000, 0.0] },
    ],
    hint: "ZeRO-3 gathers parameters layer by layer so only one full layer exists at a time.",
  },
  {
    id: "dl-218",
    title: "Sequence Parallel Split",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Split a sequence of seq_len positions across num_gpus ranks as evenly as possible: the first seq_len % num_gpus ranks get one extra position. Return the per-rank chunk sizes.\n\nThe signature is sequence_parallel_split(seq_len, num_gpus).",
    starterCode: `def sequence_parallel_split(seq_len, num_gpus):
    # Your code here
    pass`,
    solution: `def sequence_parallel_split(seq_len, num_gpus):
    base = seq_len // num_gpus
    rem = seq_len % num_gpus
    return [base + (1 if i < rem else 0) for i in range(num_gpus)]`,
    testCases: [
      { input: [8, 4], expected: [2, 2, 2, 2] },
      { input: [10, 3], expected: [4, 3, 3] },
      { input: [5, 8], expected: [1, 1, 1, 1, 1, 0, 0, 0] },
      { input: [7, 1], expected: [7] },
    ],
    hint: "Sequence parallelism splits along the token axis of LayerNorm activations.",
  },
  {
    id: "dl-219",
    title: "LoRA Merge Weights",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Merge a LoRA adapter into its base weight: W_merged = W + (alpha / rank) * (B @ A), where W is (d_out, d_in), A is (rank, d_in) and B is (d_out, rank).\n\nThe signature is lora_merge(W, A, B, alpha, rank).",
    starterCode: `def lora_merge(W, A, B, alpha, rank):
    # Your code here
    pass`,
    solution: `def lora_merge(W, A, B, alpha, rank):
    scale = alpha / rank
    out = []
    for i in range(len(W)):
        row = []
        for j in range(len(W[0])):
            ba = sum(B[i][k] * A[k][j] for k in range(len(A)))
            row.append(W[i][j] + scale * ba)
        out.append(row)
    return out`,
    testCases: [
      { input: [[[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0]], [[1.0], [0.0]], 2.0, 1], expected: [[3.0, 0.0], [0.0, 1.0]] },
      { input: [[[0.0, 0.0], [0.0, 0.0]], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], 1.0, 2], expected: [[0.5, 0.0], [0.0, 0.5]] },
      { input: [[[1.0, 2.0], [3.0, 4.0]], [[1.0, 1.0]], [[1.0], [1.0]], 4.0, 2], expected: [[3.0, 4.0], [5.0, 6.0]] },
      { input: [[[5.0]], [[2.0]], [[3.0]], 1.0, 3], expected: [[7.0]] },
    ],
    hint: "Merging removes inference overhead because the adapter becomes part of the base matrix.",
  },
  {
    id: "dl-220",
    title: "Prompt Cache Hit Ratio",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the fraction of requests whose full prompt already exists in the cache (exact token-sequence match).\n\nThe signature is prompt_cache_hit_ratio(requests, cached). Return a float between 0 and 1.",
    starterCode: `def prompt_cache_hit_ratio(requests, cached):
    # Your code here
    pass`,
    solution: `def prompt_cache_hit_ratio(requests, cached):
    cached_list = [list(c) for c in cached]
    hits = 0
    for req in requests:
        r = list(req)
        if any(r == c for c in cached_list):
            hits += 1
    return hits / len(requests)`,
    testCases: [
      { input: [[[1, 2], [3, 4], [1, 2]], [[1, 2]]], expected: 0.6666666667 },
      { input: [[[1, 2]], []], expected: 0.0 },
      { input: [[[1, 2], [3, 4]], [[1, 2], [3, 4]]], expected: 1.0 },
      { input: [[[1, 2]], [[1, 2, 3]]], expected: 0.0 },
    ],
    hint: "Prompt caching trades memory for latency by skipping repeated prefill work.",
  },
  {
    id: "dl-221",
    title: "Beam Search Pruning Count",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Count how many candidate continuations beam search prunes. Each alive beam expands over the whole vocabulary, giving min(beam_width, num_alive) * vocab_size candidates, of which only beam_width survive.\n\nThe signature is beam_search_pruning(beam_width, vocab_size, num_alive). Return the number of pruned candidates.",
    starterCode: `def beam_search_pruning(beam_width, vocab_size, num_alive):
    # Your code here
    pass`,
    solution: `def beam_search_pruning(beam_width, vocab_size, num_alive):
    candidates = min(beam_width, num_alive) * vocab_size
    return candidates - beam_width`,
    testCases: [
      { input: [2, 100, 2], expected: 198 },
      { input: [5, 1000, 5], expected: 4995 },
      { input: [4, 50, 3], expected: 146 },
      { input: [1, 10, 1], expected: 9 },
    ],
    hint: "Pruning keeps the search tractable at the cost of possibly missing the global best sequence.",
  },
  {
    id: "dl-222",
    title: "RoPE Relative Position Dot",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Apply rotary embeddings to q at position m and k at position n (same even dimension, angle position * theta_base^(-2p/d) for pair p), then return their dot product. The result depends only on m - n.\n\nThe signature is rope_relative_dot(q, k, m, n, theta_base=10000.0).",
    starterCode: `import math
def rope_relative_dot(q, k, m, n, theta_base=10000.0):
    # Your code here
    pass`,
    solution: `import math
def rope_relative_dot(q, k, m, n, theta_base=10000.0):
    def rope(x, pos):
        d = len(x)
        out = []
        for i in range(0, d, 2):
            freq = theta_base ** (-2.0 * (i // 2) / d)
            angle = pos * freq
            c = math.cos(angle)
            s = math.sin(angle)
            out.append(x[i] * c - x[i + 1] * s)
            out.append(x[i] * s + x[i + 1] * c)
        return out

    qr = rope(q, m)
    kr = rope(k, n)
    return sum(qr[i] * kr[i] for i in range(len(qr)))`,
    testCases: [
      { input: [[1.0, 0.0], [1.0, 0.0], 5, 5, 10000.0], expected: 1.0 },
      { input: [[1.0, 0.0], [1.0, 0.0], 3, 1, 10000.0], expected: -0.4161468365 },
      { input: [[1.0, 0.0, 1.0, 0.0], [0.0, 1.0, 0.0, 1.0], 0, 0, 10000.0], expected: 0.0 },
      { input: [[1.0, 0.0, 1.0, 0.0], [1.0, 0.0, 1.0, 0.0], 7, 4, 10000.0], expected: 0.0095575371 },
      { input: [[1.0, 2.0, 3.0, 4.0], [4.0, 3.0, 2.0, 1.0], 2, 2, 10000.0], expected: 20.0 },
    ],
    hint: "Rotating both vectors by their positions makes the attention score a function of the offset m - n.",
  },
  {
    id: "dl-223",
    title: "ALiBi Bias Matrix",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Build the ALiBi attention bias. Head h uses slope 1 / 2^(h+1); entry [h][i][j] equals -slope * (i - j) for j <= i and 0.0 for future positions j > i.\n\nThe signature is alibi_bias(seq_len, num_heads). Return a num_heads x seq_len x seq_len tensor.",
    starterCode: `def alibi_bias(seq_len, num_heads):
    # Your code here
    pass`,
    solution: `def alibi_bias(seq_len, num_heads):
    out = []
    for h in range(num_heads):
        slope = 1.0 / (2.0 ** (h + 1))
        head = []
        for i in range(seq_len):
            row = []
            for j in range(seq_len):
                if j <= i:
                    row.append(-slope * (i - j))
                else:
                    row.append(0.0)
            head.append(row)
        out.append(head)
    return out`,
    testCases: [
      { input: [3, 2], expected: [[[0.0, 0.0, 0.0], [-0.5, 0.0, 0.0], [-1.0, -0.5, 0.0]], [[0.0, 0.0, 0.0], [-0.25, 0.0, 0.0], [-0.5, -0.25, 0.0]]] },
      { input: [2, 1], expected: [[[0.0, 0.0], [-0.5, 0.0]]] },
      { input: [1, 3], expected: [[[0.0]], [[0.0]], [[0.0]]] },
      { input: [3, 1], expected: [[[0.0, 0.0, 0.0], [-0.5, 0.0, 0.0], [-1.0, -0.5, 0.0]]] },
    ],
    hint: "ALiBi replaces positional embeddings entirely with a distance-proportional penalty.",
  },
  {
    id: "dl-224",
    title: "Flash Decode Block Split",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Split the KV cache into blocks for flash decoding, which processes each block in parallel and merges partial results. Return [blocks, num_partials], where each block is a [start, end) pair of at most block_size positions.\n\nThe signature is flash_decode_split(seq_len, block_size).",
    starterCode: `def flash_decode_split(seq_len, block_size):
    # Your code here
    pass`,
    solution: `def flash_decode_split(seq_len, block_size):
    blocks = []
    start = 0
    while start < seq_len:
        end = start + block_size
        if end > seq_len:
            end = seq_len
        blocks.append([start, end])
        start = end
    return [blocks, len(blocks)]`,
    testCases: [
      { input: [100, 32], expected: [[[0, 32], [32, 64], [64, 96], [96, 100]], 4] },
      { input: [10, 10], expected: [[[0, 10]], 1] },
      { input: [10, 4], expected: [[[0, 4], [4, 8], [8, 10]], 3] },
      { input: [0, 4], expected: [[], 0] },
    ],
    hint: "Splitting the KV dimension gives long-context decoding more thread blocks to parallelize.",
  },
  {
    id: "dl-225",
    title: "Top-K Gradient Compression",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Compress a gradient matrix to its top-k entries by absolute value. Return the selected entries as [row, col, value] sorted by descending absolute value, breaking ties by smaller row and then smaller column.\n\nThe signature is topk_compress(gradients, k). Return at most k entries.",
    starterCode: `def topk_compress(gradients, k):
    # Your code here
    pass`,
    solution: `def topk_compress(gradients, k):
    entries = []
    for i in range(len(gradients)):
        for j in range(len(gradients[i])):
            entries.append((abs(gradients[i][j]), i, j, gradients[i][j]))
    entries.sort(key=lambda e: (-e[0], e[1], e[2]))
    out = []
    for t in range(min(k, len(entries))):
        _, i, j, v = entries[t]
        out.append([i, j, v])
    return out`,
    testCases: [
      { input: [[[1.0, 2.0], [3.0, 4.0]], 2], expected: [[1, 1, 4.0], [1, 0, 3.0]] },
      { input: [[[1.0, -5.0], [2.0, 0.5]], 1], expected: [[0, 1, -5.0]] },
      { input: [[[0.0, 0.0], [0.0, 0.0]], 2], expected: [[0, 0, 0.0], [0, 1, 0.0]] },
      { input: [[[1.0, 2.0]], 5], expected: [[0, 1, 2.0], [0, 0, 1.0]] },
      { input: [[[1.0]], 0], expected: [] },
    ],
    hint: "Top-k sparsification is the simplest gradient compression used in distributed training.",
  },
  {
    id: "dl-226",
    title: "Error Feedback Step",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "One step of error feedback for compressed SGD. Add the carried error to the gradients, keep only the top-k entries by absolute value (ties by row then column) as the sparse update, and return [sparse, new_error] where new_error is the residual of the effective gradient that was not transmitted.\n\nThe signature is error_feedback_step(gradients, error, k). Both are 2D matrices of the same shape.",
    starterCode: `def error_feedback_step(gradients, error, k):
    # Your code here
    pass`,
    solution: `def error_feedback_step(gradients, error, k):
    rows = len(gradients)
    cols = len(gradients[0])
    eff = [[gradients[i][j] + error[i][j] for j in range(cols)] for i in range(rows)]
    entries = []
    for i in range(rows):
        for j in range(cols):
            entries.append((abs(eff[i][j]), i, j))
    entries.sort(key=lambda e: (-e[0], e[1], e[2]))
    sparse = [[0.0] * cols for _ in range(rows)]
    for t in range(min(k, len(entries))):
        _, i, j = entries[t]
        sparse[i][j] = eff[i][j]
    new_error = [[eff[i][j] - sparse[i][j] for j in range(cols)] for i in range(rows)]
    return [sparse, new_error]`,
    testCases: [
      { input: [[[1.0, 2.0], [3.0, 4.0]], [[0.0, 0.0], [0.0, 0.0]], 2], expected: [[[0.0, 0.0], [3.0, 4.0]], [[1.0, 2.0], [0.0, 0.0]]] },
      { input: [[[1.0, 0.0], [0.0, 1.0]], [[0.5, 0.0], [0.0, 0.5]], 1], expected: [[[1.5, 0.0], [0.0, 0.0]], [[0.0, 0.0], [0.0, 1.5]]] },
      { input: [[[0.0, 0.0], [0.0, 0.0]], [[0.0, 0.0], [0.0, 0.0]], 1], expected: [[[0.0, 0.0], [0.0, 0.0]], [[0.0, 0.0], [0.0, 0.0]]] },
      { input: [[[1.0, 2.0]], [[0.0, 1.0]], 2], expected: [[[1.0, 3.0]], [[0.0, 0.0]]] },
      { input: [[[2.0]], [[1.0]], 1], expected: [[[3.0]], [[0.0]]] },
    ],
    hint: "Carrying the compression error keeps stale gradient mass from being lost forever.",
  },
  {
    id: "dl-227",
    title: "Checkpoint Shard Merge",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Merge parameter shards saved by different ranks into one flat parameter vector and truncate to the true full_length, since the last shard is often padded.\n\nThe signature is merge_checkpoint_shards(shards, full_length). Return the flat merged vector.",
    starterCode: `def merge_checkpoint_shards(shards, full_length):
    # Your code here
    pass`,
    solution: `def merge_checkpoint_shards(shards, full_length):
    flat = []
    for s in shards:
        flat.extend(s)
    return flat[:full_length]`,
    testCases: [
      { input: [[[1.0, 2.0], [3.0], [4.0, 5.0, 6.0]], 5], expected: [1.0, 2.0, 3.0, 4.0, 5.0] },
      { input: [[[1.0], [2.0], [3.0]], 6], expected: [1.0, 2.0, 3.0] },
      { input: [[[1.0, 2.0], [3.0]], 3], expected: [1.0, 2.0, 3.0] },
      { input: [[[], [1.0, 2.0]], 2], expected: [1.0, 2.0] },
    ],
    hint: "Shard order is the rank order used when the checkpoint was written.",
  },
  {
    id: "dl-228",
    title: "Roofline Bound Check",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Classify a kernel with the roofline model. Arithmetic intensity is flops / bytes_moved and the machine's ridge point is peak_flops_per_s / peak_bandwidth_per_s. If intensity >= ridge the kernel is compute bound with time flops / peak_flops; otherwise it is memory bound with time bytes_moved / peak_bandwidth.\n\nThe signature is roofline_bound(flops, bytes_moved, peak_flops_per_s, peak_bandwidth_per_s). Return [bound, time_seconds].",
    starterCode: `def roofline_bound(flops, bytes_moved, peak_flops_per_s, peak_bandwidth_per_s):
    # Your code here
    pass`,
    solution: `def roofline_bound(flops, bytes_moved, peak_flops_per_s, peak_bandwidth_per_s):
    intensity = flops / bytes_moved
    ridge = peak_flops_per_s / peak_bandwidth_per_s
    if intensity >= ridge:
        return ["compute", flops / peak_flops_per_s]
    return ["memory", bytes_moved / peak_bandwidth_per_s]`,
    testCases: [
      { input: [1000000000000.0, 1000000000.0, 100000000000000.0, 1000000000000.0], expected: ["compute", 0.01] },
      { input: [10000000000.0, 1000000000.0, 100000000000000.0, 1000000000000.0], expected: ["memory", 0.001] },
      { input: [1000000000000.0, 10000000000.0, 100000000000000.0, 1000000000000.0], expected: ["compute", 0.01] },
      { input: [1000000000.0, 1000000000000.0, 100000000000000.0, 1000000000000.0], expected: ["memory", 1.0] },
    ],
    hint: "Transformer decode is memory bound because it moves gigabytes of weights for very few FLOPs per token.",
  },
  {
    id: "dl-229",
    title: "MFU Utilization",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Compute model FLOPs utilization: achieved_flops = model_flops_per_token * tokens_per_sec, capacity = gpu_peak_flops * num_gpus, MFU = achieved / capacity.\n\nThe signature is mfu_utilization(model_flops_per_token, tokens_per_sec, gpu_peak_flops, num_gpus).",
    starterCode: `def mfu_utilization(model_flops_per_token, tokens_per_sec, gpu_peak_flops, num_gpus):
    # Your code here
    pass`,
    solution: `def mfu_utilization(model_flops_per_token, tokens_per_sec, gpu_peak_flops, num_gpus):
    return (model_flops_per_token * tokens_per_sec) / (gpu_peak_flops * num_gpus)`,
    testCases: [
      { input: [2000000000.0, 1000, 1000000000000000.0, 1], expected: 0.002 },
      { input: [6000000000.0, 5000, 300000000000000.0, 8], expected: 0.0125 },
      { input: [1000000000.0, 0, 1000000000000000.0, 1], expected: 0.0 },
      { input: [2000000000.0, 100, 100000000000000.0, 4], expected: 0.0005 },
    ],
    hint: "MFU ignores attention's quadratic term, so long-context runs can exceed it.",
  },
  {
    id: "dl-230",
    title: "Async SGD Staleness Update",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Combine gradients from asynchronous workers with staleness weighting: each worker's gradient is weighted by decay^staleness, and the result is the weighted average per coordinate. Lower weights go to more stale updates.\n\nThe signature is async_sgd_update(worker_grads, staleness, decay). Return the aggregated gradient vector.",
    starterCode: `def async_sgd_update(worker_grads, staleness, decay):
    # Your code here
    pass`,
    solution: `def async_sgd_update(worker_grads, staleness, decay):
    weights = [decay ** s for s in staleness]
    total_w = sum(weights)
    n = len(worker_grads[0])
    return [sum(worker_grads[i][j] * weights[i] for i in range(len(worker_grads))) / total_w for j in range(n)]`,
    testCases: [
      { input: [[[1.0, 2.0], [3.0, 4.0]], [0, 1], 0.5], expected: [1.6666666667, 2.6666666667] },
      { input: [[[2.0], [4.0]], [2, 0], 0.5], expected: [3.6] },
      { input: [[[1.0, 1.0], [1.0, 1.0], [1.0, 1.0]], [0, 0, 0], 0.9], expected: [1.0, 1.0] },
      { input: [[[0.0, 0.0], [10.0, 20.0]], [1, 0], 1.0], expected: [5.0, 10.0] },
    ],
    hint: "Staleness weighting prevents slow workers from applying outdated gradients with full strength.",
  },
];
