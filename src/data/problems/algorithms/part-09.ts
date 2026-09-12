import type { Problem } from "@/types/problem";

// Algorithms problems, part 09: streaming, randomized, approximation, and advanced classics.
export const problems: Problem[] = [
  {
    id: "al-351",
    title: "Reservoir Sampling Update Probability",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return the probability that the item at 1-based position index ends up in the final reservoir of size k.\n\nThe first k items always enter the reservoir, and each later item i is kept with probability k / i and survives all subsequent replacements with the same probability. Return 0.0 when index or k is non-positive and 1.0 when index is at most k.",
    starterCode: `def reservoir_update_probability(index, k):
    # Your code here
    pass`,
    solution: `def reservoir_update_probability(index, k):
    if k <= 0 or index <= 0:
        return 0.0
    if index <= k:
        return 1.0
    return k / index`,
    testCases: [
      { input: [10, 3], expected: 0.3 },
      { input: [7, 1], expected: 0.14285714285714285 },
      { input: [3, 5], expected: 1.0 },
      { input: [0, 3], expected: 0.0 },
      { input: [100, 25], expected: 0.25 },
    ],
    hint: "Item i is included with probability 1 for i <= k and k / i afterwards.",
  },
  {
    id: "al-352",
    title: "Reservoir Replacement Expectation",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return the expected number of times the reservoir is overwritten while streaming stream_len items through a reservoir of size k.\n\nItem i (1-based) triggers a replacement with probability k / i once i exceeds k, so by linearity of expectation the answer is the sum of k / i for i from k + 1 to stream_len. Return 0.0 when k is non-positive or the stream is no longer than the reservoir.",
    starterCode: `def expected_reservoir_replacements(stream_len, k):
    # Your code here
    pass`,
    solution: `def expected_reservoir_replacements(stream_len, k):
    if k <= 0 or stream_len <= k:
        return 0.0
    return sum(k / i for i in range(k + 1, stream_len + 1))`,
    testCases: [
      { input: [5, 2], expected: 1.5666666666666667 },
      { input: [3, 3], expected: 0.0 },
      { input: [10, 1], expected: 1.928968253968254 },
      { input: [1, 5], expected: 0.0 },
      { input: [7, 3], expected: 2.2785714285714285 },
    ],
    hint: "Each stream position past k replaces a slot with probability k / i; add those probabilities.",
  },
  {
    id: "al-353",
    title: "HyperLogLog Register Index",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Given a 32-bit hash value and a precision p, return [bucket, rank] as used by a HyperLogLog register.\n\nThe top p bits select the bucket and the remaining 32 - p bits determine rank, which is one plus the number of leading zeros; an all-zero remainder gives rank 32 - p + 1. Return [0, 0] for a precision outside 1 to 32.",
    starterCode: `def hll_register_index(hash_value, precision):
    # Your code here
    pass`,
    solution: `def hll_register_index(hash_value, precision):
    if precision <= 0 or precision > 32:
        return [0, 0]
    h = hash_value & 0xFFFFFFFF
    bucket = h >> (32 - precision)
    rest = h & ((1 << (32 - precision)) - 1)
    width = 32 - precision
    if rest == 0:
        rank = width + 1
    else:
        rank = width - rest.bit_length() + 1
    return [bucket, rank]`,
    testCases: [
      { input: [0, 4], expected: [0, 29] },
      { input: [4294967295, 32], expected: [4294967295, 1] },
      { input: [1, 32], expected: [1, 1] },
      { input: [3355443200, 4], expected: [12, 1] },
      { input: [123456789, 8], expected: [7, 2] },
    ],
    hint: "Split the hash into the top p selector bits and the remainder used for the leading-zero rank.",
  },
  {
    id: "al-354",
    title: "HyperLogLog Raw Cardinality Estimate",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Estimate cardinality from HyperLogLog register values with the raw harmonic-mean formula.\n\nFor m registers return alpha * m * m / sum(2 ** -r) over all registers, where alpha = 0.7213 / (1 + 1.079 / m). The registers hold the maximum observed rank per bucket, and an empty register list returns 0.0.",
    starterCode: `def hll_raw_estimate(registers):
    # Your code here
    pass`,
    solution: `def hll_raw_estimate(registers):
    m = len(registers)
    if m == 0:
        return 0.0
    alpha = 0.7213 / (1 + 1.079 / m)
    return alpha * m * m / sum(2.0 ** (-r) for r in registers)`,
    testCases: [
      { input: [[0, 0, 0, 0]], expected: 2.272258318566647 },
      { input: [[3, 2, 1, 0]], expected: 4.847484412942181 },
      { input: [[5]], expected: 11.102260702260704 },
      { input: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], expected: 10.811686866912583 },
      { input: [[]], expected: 0.0 },
    ],
    hint: "Large register values shrink the denominator, so the estimate grows with the observed ranks.",
  },
  {
    id: "al-355",
    title: "HyperLogLog Bias Correction",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Correct a raw HyperLogLog estimate with the standard small-range and large-range fixes for 32-bit hashes.\n\nIf the raw estimate is at most 2.5 * m and some registers are zero, return the linear-counting value m * ln(m / zero_registers). If the estimate exceeds 2^32 / 30, return -2^32 * ln(1 - estimate / 2^32); otherwise return the raw estimate unchanged. A non-positive register count returns 0.0.",
    starterCode: `import math


def hll_correct_estimate(raw_estimate, zero_registers, num_registers):
    # Your code here
    pass`,
    solution: `import math


def hll_correct_estimate(raw_estimate, zero_registers, num_registers):
    if num_registers <= 0:
        return 0.0
    if raw_estimate <= 2.5 * num_registers and zero_registers > 0:
        return num_registers * math.log(num_registers / zero_registers)
    two32 = 2.0 ** 32
    if raw_estimate <= two32 / 30:
        return raw_estimate
    ratio = 1 - raw_estimate / two32
    if ratio <= 0:
        return raw_estimate
    return -two32 * math.log(ratio)`,
    testCases: [
      { input: [10.0, 3, 16], expected: 26.783622937146745 },
      { input: [1000.0, 0, 64], expected: 1000.0 },
      { input: [1000000000.0, 0, 1024], expected: 1138371196.542651 },
      { input: [100.0, 2, 16], expected: 100.0 },
      { input: [0.0, 4, 4], expected: 0.0 },
    ],
    hint: "Small estimates use linear counting with the zero registers; huge estimates use the 32-bit range correction.",
  },
  {
    id: "al-356",
    title: "Count-Min Conservative Increment",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Apply conservative updates to a Count-Min sketch and return the final counter matrix.\n\nFor each item compute one index per row as djb2 of the string seed:item modulo width, then increment only those counters whose current value equals the minimum across the rows. width is the counters per row, depth the number of rows, and seeds holds one seed per row.",
    starterCode: `def cms_conservative_update(width, depth, seeds, items):
    # Your code here
    pass`,
    solution: `def cms_conservative_update(width, depth, seeds, items):
    def h(s):
        v = 5381
        for ch in s:
            v = (v * 33 + ord(ch)) % (2 ** 32)
        return v

    matrix = [[0] * width for _ in range(depth)]
    for item in items:
        idx = [h(str(seeds[r]) + ":" + item) % width for r in range(depth)]
        cur = [matrix[r][idx[r]] for r in range(depth)]
        mn = min(cur)
        for r in range(depth):
            if matrix[r][idx[r]] == mn:
                matrix[r][idx[r]] += 1
    return matrix`,
    testCases: [
      {
        input: [4, 2, [1, 2], ["a", "b", "a"]],
        expected: [
          [0, 2, 1, 0],
          [0, 0, 2, 1],
        ],
      },
      { input: [3, 1, [7], []], expected: [[0, 0, 0]] },
      {
        input: [5, 2, [10, 20], ["x", "y", "x", "x"]],
        expected: [
          [1, 0, 0, 0, 3],
          [0, 3, 1, 0, 0],
        ],
      },
      {
        input: [4, 3, [1, 2, 3], ["ab", "cd", "ab"]],
        expected: [
          [0, 0, 0, 3],
          [3, 0, 0, 0],
          [0, 3, 0, 0],
        ],
      },
    ],
    hint: "Only counters tied for the smallest row value are allowed to grow.",
  },
  {
    id: "al-357",
    title: "Count-Min Query Upper Bound",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return the theoretical upper bound on a Count-Min estimate for a sketch of width width.\n\nAfter total increments the true count is at most estimate + e * total / width, where e is Euler's number. Return the estimate itself when width is non-positive or total is negative.",
    starterCode: `import math


def cms_query_upper_bound(estimate, width, total):
    # Your code here
    pass`,
    solution: `import math


def cms_query_upper_bound(estimate, width, total):
    if width <= 0 or total < 0:
        return float(estimate)
    return estimate + math.e * total / width`,
    testCases: [
      { input: [5, 100, 1000], expected: 32.182818284590454 },
      { input: [0, 10, 100], expected: 27.18281828459045 },
      { input: [5, 0, 100], expected: 5.0 },
      { input: [12, 7, 0], expected: 12.0 },
      { input: [3, 50, 250], expected: 16.591409142295227 },
    ],
    hint: "The additive error term is e * total / width, so wider sketches tighten the bound.",
  },
  {
    id: "al-358",
    title: "Count-Min Dimension Guarantee",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Choose Count-Min sketch dimensions that guarantee additive error at most epsilon with probability at least 1 - delta.\n\nWidth = ceil(e / epsilon) and depth = ceil(ln(1 / delta)) satisfy the standard bound, where e is Euler's number. Return [width, depth], or [0, 0] when epsilon is non-positive or delta lies outside the open interval (0, 1).",
    starterCode: `import math


def cms_dimensions(epsilon, delta):
    # Your code here
    pass`,
    solution: `import math


def cms_dimensions(epsilon, delta):
    if epsilon <= 0 or delta <= 0 or delta >= 1:
        return [0, 0]
    width = math.ceil(math.e / epsilon)
    depth = math.ceil(math.log(1 / delta))
    return [width, depth]`,
    testCases: [
      { input: [0.01, 0.01], expected: [272, 5] },
      { input: [0.1, 0.05], expected: [28, 3] },
      { input: [1.0, 0.5], expected: [3, 1] },
      { input: [0.0, 0.5], expected: [0, 0] },
      { input: [0.5, 1.0], expected: [0, 0] },
    ],
    hint: "Invert the two Chernoff-style requirements: width controls error size, depth controls failure odds.",
  },
  {
    id: "al-359",
    title: "Bloom Filter False Positive Model",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Compute the asymptotic false positive rate of a Bloom filter with num_bits bits, num_hashes hash functions, and num_items inserted.\n\nUse the exponential approximation (1 - e ** (-k * n / m)) ** k. A non-positive bit count or hash count returns 1.0, and inserting no items returns 0.0.",
    starterCode: `import math


def bloom_false_positive_model(num_bits, num_hashes, num_items):
    # Your code here
    pass`,
    solution: `import math


def bloom_false_positive_model(num_bits, num_hashes, num_items):
    if num_bits <= 0 or num_hashes <= 0:
        return 1.0
    return (1 - math.exp(-num_hashes * num_items / num_bits)) ** num_hashes`,
    testCases: [
      { input: [100, 3, 10], expected: 0.017410586496326586 },
      { input: [1000, 7, 100], expected: 0.008193722065862417 },
      { input: [10, 1, 5], expected: 0.3934693402873666 },
      { input: [10, 1, 0], expected: 0.0 },
      { input: [0, 3, 10], expected: 1.0 },
    ],
    hint: "A bit is still zero after all insertions with probability e ** (-k * n / m).",
  },
  {
    id: "al-360",
    title: "Optimal Bloom Bits per Item",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return the total number of bits needed for a Bloom filter to reach a target false positive rate over num_items items.\n\nThe optimal size is ceil(-n * ln(p) / (ln 2) ** 2) bits in total. Return 0 for rates outside the open interval (0, 1) or a negative item count.",
    starterCode: `import math


def optimal_bloom_bits_per_item(false_positive_rate, num_items):
    # Your code here
    pass`,
    solution: `import math


def optimal_bloom_bits_per_item(false_positive_rate, num_items):
    if false_positive_rate <= 0 or false_positive_rate >= 1 or num_items < 0:
        return 0
    return math.ceil(-num_items * math.log(false_positive_rate) / (math.log(2) ** 2))`,
    testCases: [
      { input: [0.01, 1000], expected: 9586 },
      { input: [0.1, 100], expected: 480 },
      { input: [0.5, 1], expected: 2 },
      { input: [1.0, 10], expected: 0 },
      { input: [0.01, 0], expected: 0 },
    ],
    hint: "About 9.6 bits per item buy a one percent false positive rate.",
  },
  {
    id: "al-361",
    title: "Optimal Bloom Hash Count",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return the optimal number of hash functions for a Bloom filter with num_bits bits holding num_items items.\n\nMinimizing the false positive rate gives round((m / n) * ln 2), clamped to at least 1. Non-positive bit or item counts also return 1.",
    starterCode: `import math


def optimal_bloom_hash_count(num_bits, num_items):
    # Your code here
    pass`,
    solution: `import math


def optimal_bloom_hash_count(num_bits, num_items):
    if num_bits <= 0 or num_items <= 0:
        return 1
    k = round((num_bits / num_items) * math.log(2))
    return max(1, k)`,
    testCases: [
      { input: [1000, 100], expected: 7 },
      { input: [100, 100], expected: 1 },
      { input: [2000, 100], expected: 14 },
      { input: [10, 0], expected: 1 },
      { input: [50, 10], expected: 3 },
    ],
    hint: "The optimal k grows linearly with bits per item, at roughly 0.69 hashes per bit.",
  },
  {
    id: "al-362",
    title: "Misra-Gries Summary Pass",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Run one full Misra-Gries pass with k - 1 counters and return the surviving counters.\n\nIncrement a tracked item, add a new item while fewer than k - 1 items are tracked, and otherwise decrement every counter by one, dropping any that reach zero. Return a dict mapping surviving items to counts; k <= 0 returns an empty dict.",
    starterCode: `def misra_gries_summary(items, k):
    # Your code here
    pass`,
    solution: `def misra_gries_summary(items, k):
    if k <= 0:
        return {}
    counters = {}
    for x in items:
        if x in counters:
            counters[x] += 1
        elif len(counters) < k - 1:
            counters[x] = 1
        else:
            for key in list(counters.keys()):
                counters[key] -= 1
                if counters[key] == 0:
                    del counters[key]
    return {key: counters[key] for key in sorted(counters)}`,
    testCases: [
      { input: [["a", "b", "a", "c", "a", "b"], 3], expected: { a: 2, b: 1 } },
      { input: [["x", "y", "x", "z"], 2], expected: {} },
      { input: [[], 3], expected: {} },
      { input: [["a", "a", "a"], 2], expected: { a: 3 } },
      {
        input: [["p", "q", "r", "p", "q", "r", "p"], 4],
        expected: { p: 3, q: 2, r: 2 },
      },
    ],
    hint: "The decrement step charges one unit against every tracked candidate when a new item cannot fit.",
  },
  {
    id: "al-363",
    title: "Space-Saving Stream Summary",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Summarize a stream with the Space-Saving algorithm and return the tracked items sorted by estimated count.\n\nTracked items increment; new items fill free capacity; once full, the item with the smallest (count, name) pair is evicted and the new item inherits its count plus one. Return a list of [item, count] pairs ordered by descending count then item name; capacity <= 0 returns [].",
    starterCode: `def space_saving_summary(items, capacity):
    # Your code here
    pass`,
    solution: `def space_saving_summary(items, capacity):
    if capacity <= 0:
        return []
    counts = {}
    for x in items:
        if x in counts:
            counts[x] += 1
        elif len(counts) < capacity:
            counts[x] = 1
        else:
            victim = min(counts, key=lambda y: (counts[y], y))
            top = counts.pop(victim)
            counts[x] = top + 1
    return sorted([[key, value] for key, value in counts.items()], key=lambda pair: (-pair[1], pair[0]))`,
    testCases: [
      {
        input: [["a", "b", "a", "a"], 2],
        expected: [
          ["a", 3],
          ["b", 1],
        ],
      },
      {
        input: [["a", "b", "c", "d"], 2],
        expected: [
          ["c", 2],
          ["d", 2],
        ],
      },
      { input: [[], 3], expected: [] },
      { input: [["x", "x", "y"], 1], expected: [["y", 3]] },
      { input: [["a", "b", "c"], 0], expected: [] },
    ],
    hint: "The replacement count carries the evicted item's count forward, which upper-bounds new items.",
  },
  {
    id: "al-364",
    title: "T-Digest Centroid Compression",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Merge adjacent t-digest centroids while respecting a maximum centroid weight.\n\ncentroids is a list of [mean, weight] pairs sorted by mean. Fold each next centroid into the current one when their combined weight is at most max_weight using the weighted mean, otherwise start a new centroid. Return the reduced list of [mean, weight] pairs.",
    starterCode: `def tdigest_compress(centroids, max_weight):
    # Your code here
    pass`,
    solution: `def tdigest_compress(centroids, max_weight):
    if not centroids:
        return []
    merged = []
    cur_mean, cur_w = centroids[0][0], centroids[0][1]
    for mean, weight in centroids[1:]:
        if cur_w + weight <= max_weight:
            cur_mean = (cur_mean * cur_w + mean * weight) / (cur_w + weight)
            cur_w += weight
        else:
            merged.append([cur_mean, cur_w])
            cur_mean, cur_w = mean, weight
    merged.append([cur_mean, cur_w])
    return merged`,
    testCases: [
      {
        input: [
          [
            [1, 1],
            [2, 1],
            [3, 1],
            [10, 5],
          ],
          2,
        ],
        expected: [
          [1.5, 2],
          [3, 1],
          [10, 5],
        ],
      },
      {
        input: [
          [
            [5, 3],
            [9, 2],
          ],
          5,
        ],
        expected: [[6.6, 5]],
      },
      { input: [[], 4], expected: [] },
      { input: [[[0, 1]], 1], expected: [[0, 1]] },
      {
        input: [
          [
            [1, 2],
            [2, 2],
            [3, 2],
          ],
          4,
        ],
        expected: [
          [1.5, 4],
          [3, 2],
        ],
      },
    ],
    hint: "Compression scans once, greedily absorbing the next centroid while the weight budget allows.",
  },
  {
    id: "al-365",
    title: "Greenwald-Khanna Invariant Check",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Check whether a Greenwald-Khanna quantile summary satisfies its rank-error invariant.\n\nsummary is a list of [value, g, delta] tuples and the invariant requires every g >= 1 and g + delta <= floor(2 * epsilon * n), where n is the stream length. Return True when all tuples pass, and False for non-positive epsilon or negative n.",
    starterCode: `def gk_invariant_holds(summary, epsilon, n):
    # Your code here
    pass`,
    solution: `def gk_invariant_holds(summary, epsilon, n):
    if n < 0 or epsilon <= 0:
        return False
    limit = int(2 * epsilon * n)
    for entry in summary:
        g = entry[1]
        delta = entry[2]
        if g < 1 or g + delta > limit:
            return False
    return True`,
    testCases: [
      {
        input: [
          [
            [1, 1, 0],
            [3, 1, 0],
          ],
          0.1,
          100,
        ],
        expected: true,
      },
      {
        input: [
          [
            [1, 1, 0],
            [3, 1, 40],
          ],
          0.1,
          100,
        ],
        expected: false,
      },
      { input: [[[1, 0, 0]], 0.1, 10], expected: false },
      { input: [[], 0.1, 0], expected: true },
      { input: [[[2, 2, 8]], 0.05, 100], expected: true },
    ],
    hint: "The band width g + delta of every tuple must stay inside the global rank-error budget.",
  },
  {
    id: "al-366",
    title: "Quantile Sketch Rank Error",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return the maximum relative rank error of a quantile sketch given its bands.\n\nEach band is [value, rank_min, rank_max] and contributes error (rank_max - rank_min) / 2. Divide the largest such error by the stream length n and return it, or 0.0 when n is non-positive or there are no bands.",
    starterCode: `def max_quantile_rank_error(bands, n):
    # Your code here
    pass`,
    solution: `def max_quantile_rank_error(bands, n):
    if n <= 0 or not bands:
        return 0.0
    worst = 0.0
    for band in bands:
        err = (band[2] - band[1]) / 2.0
        if err > worst:
            worst = err
    return worst / n`,
    testCases: [
      { input: [[[5, 10, 20]], 100], expected: 0.05 },
      {
        input: [
          [
            [1, 0, 4],
            [9, 10, 16],
          ],
          100,
        ],
        expected: 0.03,
      },
      { input: [[], 50], expected: 0.0 },
      { input: [[[3, 5, 5]], 0], expected: 0.0 },
      {
        input: [
          [
            [1, 0, 200],
            [2, 50, 100],
          ],
          100,
        ],
        expected: 1.0,
      },
    ],
    hint: "Each band's uncertainty is half its rank interval, normalized by the stream length.",
  },
  {
    id: "al-367",
    title: "Count-Distinct Lower Bound",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return a lower bound on the number of distinct values in a stream of stream_len observations.\n\nIf the most frequent value occurs max_frequency times, every distinct value accounts for at most that many observations, so there are at least ceil(stream_len / max_frequency) distinct values. Return 0 when either argument is non-positive.",
    starterCode: `def count_distinct_lower_bound(stream_len, max_frequency):
    # Your code here
    pass`,
    solution: `def count_distinct_lower_bound(stream_len, max_frequency):
    if stream_len <= 0 or max_frequency <= 0:
        return 0
    return -(-stream_len // max_frequency)`,
    testCases: [
      { input: [100, 5], expected: 20 },
      { input: [101, 5], expected: 21 },
      { input: [0, 3], expected: 0 },
      { input: [10, 1], expected: 10 },
      { input: [7, 10], expected: 1 },
    ],
    hint: "The heaviest hitter caps how much of the stream a single distinct value can explain.",
  },
  {
    id: "al-368",
    title: "Exponential Decay Window Average",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Compute the exponentially decayed running average of values with smoothing factor alpha.\n\nStart the state at the first value and update it as alpha * x + (1 - alpha) * state for every later x. Return 0.0 for an empty list, so recent values dominate when alpha is close to 1.",
    starterCode: `def exponential_decay_average(values, alpha):
    # Your code here
    pass`,
    solution: `def exponential_decay_average(values, alpha):
    if not values:
        return 0.0
    state = values[0]
    for x in values[1:]:
        state = alpha * x + (1 - alpha) * state
    return state`,
    testCases: [
      { input: [[1, 2, 3], 0.5], expected: 2.25 },
      { input: [[5], 0.3], expected: 5 },
      { input: [[], 0.5], expected: 0.0 },
      { input: [[0, 10, 0], 0.25], expected: 1.875 },
      { input: [[1, 1, 1], 0.9], expected: 1.0 },
    ],
    hint: "Fold each new value into one running state instead of keeping the whole window.",
  },
  {
    id: "al-369",
    title: "DGIM Bucket Count",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Run the DGIM algorithm over a 0/1 stream and return the number of buckets in the summary of the last window bits.\n\nEach 1-bit starts a size-1 bucket; whenever a size occurs three times, merge its two oldest buckets into one of double size, and drop buckets that end at or before t - window. Buckets are kept newest first, so the returned count is the summary size.",
    starterCode: `def dgim_bucket_count(stream, window):
    # Your code here
    pass`,
    solution: `def dgim_bucket_count(stream, window):
    if window <= 0:
        return 0
    buckets = []
    for t, bit in enumerate(stream, start=1):
        if bit == 1:
            buckets.insert(0, [1, t])
        while True:
            found = False
            sizes = sorted({b[0] for b in buckets})
            for size in sizes:
                idx = [i for i, b in enumerate(buckets) if b[0] == size]
                if len(idx) > 2:
                    i1, i2 = idx[-2], idx[-1]
                    new_end = buckets[i1][1]
                    kept = [b for j, b in enumerate(buckets) if j != i1 and j != i2]
                    kept.insert(i1, [size * 2, new_end])
                    buckets = kept
                    found = True
                    break
            if not found:
                break
        buckets = [b for b in buckets if b[1] > t - window]
    return len(buckets)`,
    testCases: [
      { input: [[1, 0, 1, 1, 0, 1], 6], expected: 3 },
      { input: [[0, 0, 0], 3], expected: 0 },
      { input: [[1, 1, 1], 10], expected: 2 },
      { input: [[1, 1, 1, 1, 1, 1, 1, 1], 4], expected: 3 },
      { input: [[1, 0, 1, 0, 1, 1, 0, 1, 1, 1], 5], expected: 3 },
    ],
    hint: "Three buckets of the same power of two always collapse into one bucket of the next size.",
  },
  {
    id: "al-370",
    title: "LSH Band Collision Probability",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return the probability that two MinHash LSH signatures collide at the given Jaccard similarity.\n\nWith rows rows per band and bands bands, each band collides with probability similarity ** rows and the signatures collide if any band does, giving 1 - (1 - s ** r) ** b. Non-positive rows or bands return 0.0.",
    starterCode: `def lsh_band_collision_probability(similarity, rows, bands):
    # Your code here
    pass`,
    solution: `def lsh_band_collision_probability(similarity, rows, bands):
    if rows <= 0 or bands <= 0:
        return 0.0
    return 1 - (1 - similarity ** rows) ** bands`,
    testCases: [
      { input: [0.8, 5, 20], expected: 0.9996439421094793 },
      { input: [0.5, 4, 10], expected: 0.47553952495127305 },
      { input: [0.9, 10, 5], expected: 0.8827865978466163 },
      { input: [0.0, 3, 4], expected: 0.0 },
      { input: [1.0, 3, 4], expected: 1.0 },
    ],
    hint: "Band and row counts shape the S-curve; more bands raise collisions, more rows lower them.",
  },
  {
    id: "al-371",
    title: "MinHash Bands for Threshold",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Find the smallest number of bands whose collision probability reaches target at the given similarity.\n\nSolve 1 - (1 - s ** rows) ** bands >= target for bands, returning ceil(ln(1 - target) / ln(1 - s ** rows)) clamped to at least 1. Return 0 when similarity or target lies outside (0, 1) or rows is non-positive.",
    starterCode: `import math


def minhash_bands_for_threshold(similarity, rows, target):
    # Your code here
    pass`,
    solution: `import math


def minhash_bands_for_threshold(similarity, rows, target):
    if rows <= 0 or not (0 < target < 1) or not (0 < similarity < 1):
        return 0
    denom = math.log(1 - similarity ** rows)
    if denom == 0:
        return 1
    return max(1, math.ceil(math.log(1 - target) / denom))`,
    testCases: [
      { input: [0.8, 5, 0.5], expected: 2 },
      { input: [0.5, 4, 0.9], expected: 36 },
      { input: [0.9, 10, 0.5], expected: 2 },
      { input: [0.5, 1, 0.5], expected: 1 },
      { input: [0.5, 4, 1.0], expected: 0 },
    ],
    hint: "Both logs in the ratio are negative, so the quotient is positive and rounds up.",
  },
  {
    id: "al-372",
    title: "Johnson-Lindenstrauss Dimension Bound",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Return a Johnson-Lindenstrauss embedding dimension that preserves all pairwise distances of num_points points within a factor of 1 +/- epsilon.\n\nThe commonly used sufficient bound is ceil(8 * ln(n) / epsilon ** 2) random projection dimensions. Return 0 when there are fewer than two points or epsilon lies outside (0, 1).",
    starterCode: `import math


def jl_dimension(num_points, epsilon):
    # Your code here
    pass`,
    solution: `import math


def jl_dimension(num_points, epsilon):
    if num_points <= 1 or not (0 < epsilon < 1):
        return 0
    return math.ceil(8 * math.log(num_points) / (epsilon ** 2))`,
    testCases: [
      { input: [100, 0.1], expected: 3685 },
      { input: [1000, 0.2], expected: 1382 },
      { input: [100, 0.5], expected: 148 },
      { input: [1, 0.1], expected: 0 },
      { input: [100, 0.0], expected: 0 },
    ],
    hint: "The dimension depends logarithmically on the number of points but quadratically on the distortion.",
  },
  {
    id: "al-373",
    title: "K-wise Independent Hash Sample",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Evaluate a k-wise independent polynomial hash over a finite field on each input.\n\nCoefficients a_0 through a_{degree-1} are drawn uniformly from 0 to prime-1 with random.Random(seed), and h(x) is their polynomial evaluated modulo prime. Return the list of hash values for inputs, which is empty for an empty input list.",
    starterCode: `import random


def kwise_hash_sample(prime, degree, seed, inputs):
    # Your code here
    pass`,
    solution: `import random


def kwise_hash_sample(prime, degree, seed, inputs):
    rng = random.Random(seed)
    coeffs = [rng.randrange(prime) for _ in range(degree)]
    out = []
    for x in inputs:
        value = 0
        power = 1
        for c in coeffs:
            value = (value + c * power) % prime
            power = (power * x) % prime
        out.append(value)
    return out`,
    testCases: [
      { input: [97, 3, 5, [0, 1, 2, 5, 10]], expected: [79, 11, 34, 67, 2] },
      { input: [101, 1, 7, [3, 4, 5]], expected: [41, 41, 41] },
      { input: [97, 2, 0, []], expected: [] },
      { input: [97, 4, 42, [1]], expected: [95] },
    ],
    hint: "A degree-(k-1) polynomial over a field gives k-wise independence, with coefficients as the secret.",
  },
  {
    id: "al-374",
    title: "Randomized Quicksort Expected Comparisons",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Return the expected number of key comparisons performed by randomized quicksort on n distinct keys.\n\nThe exact expectation is 2 * (n + 1) * H_n - 4 * n, where H_n is the n-th harmonic number. Return 0.0 for n <= 1.",
    starterCode: `def quicksort_expected_comparisons(n):
    # Your code here
    pass`,
    solution: `def quicksort_expected_comparisons(n):
    if n <= 1:
        return 0.0
    harmonic = sum(1.0 / i for i in range(1, n + 1))
    return 2 * (n + 1) * harmonic - 4 * n`,
    testCases: [
      { input: [1], expected: 0.0 },
      { input: [2], expected: 1.0 },
      { input: [5], expected: 7.399999999999999 },
      { input: [10], expected: 24.43730158730159 },
      { input: [100], expected: 647.8502585632034 },
    ],
    hint: "A pair is compared only if one of the two is chosen as a pivot before they separate.",
  },
  {
    id: "al-375",
    title: "Quickselect Expected Remaining Size",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return the expected size of the remaining subarray after one random-pivot partition in quickselect.\n\nA uniformly random pivot rank p leaves max(p - 1, n - p) elements on the larger side, so average that quantity over p from 1 to n. Return 0.0 for n <= 1.",
    starterCode: `def quickselect_expected_remaining(n):
    # Your code here
    pass`,
    solution: `def quickselect_expected_remaining(n):
    if n <= 1:
        return 0.0
    return sum(max(p - 1, n - p) for p in range(1, n + 1)) / n`,
    testCases: [
      { input: [1], expected: 0.0 },
      { input: [2], expected: 1.0 },
      { input: [5], expected: 3.2 },
      { input: [10], expected: 7.0 },
      { input: [0], expected: 0.0 },
    ],
    hint: "The larger partition side shrinks geometrically by a constant factor in expectation.",
  },
  {
    id: "al-376",
    title: "Treap Path Probability",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return the probability that a treap built by inserting n keys in sorted order with random distinct priorities is a single path.\n\nSorted insertion always produces a right spine, and the heap property then forces priorities to increase with insertion order, which happens with probability 1 / n!. Return 0.0 for n <= 0.",
    starterCode: `def treap_path_probability(n):
    # Your code here
    pass`,
    solution: `def treap_path_probability(n):
    if n <= 0:
        return 0.0
    fact = 1
    for i in range(2, n + 1):
        fact *= i
    return 1.0 / fact`,
    testCases: [
      { input: [1], expected: 1.0 },
      { input: [3], expected: 0.16666666666666666 },
      { input: [5], expected: 0.008333333333333333 },
      { input: [0], expected: 0.0 },
      { input: [10], expected: 2.755731922398589e-07 },
    ],
    hint: "Only one of the n! priority orderings keeps a sorted-insertion treap on a single spine.",
  },
  {
    id: "al-377",
    title: "Skip List Expected Costs",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return the expected height and the expected search cost of a skip list with n elements and promotion probability p.\n\nThe expected number of levels is the sum over l >= 1 of 1 - (1 - p ** (l - 1)) ** n, and the search cost is (1 / p) times log base 1/p of n. Return [expected height, expected search cost], both 0.0 for invalid inputs, with cost 0.0 for n = 1.",
    starterCode: `import math


def skip_list_costs(n, p):
    # Your code here
    pass`,
    solution: `import math


def skip_list_costs(n, p):
    if n <= 0 or not (0 < p < 1):
        return [0.0, 0.0]
    height = 0.0
    level = 1
    while True:
        term = 1 - (1 - p ** (level - 1)) ** n
        if term < 1e-15:
            break
        height += term
        level += 1
    cost = 0.0 if n <= 1 else math.log(n) / (p * math.log(1 / p))
    return [height, cost]`,
    testCases: [
      { input: [1, 0.5], expected: [1.9999999999999982, 0.0] },
      { input: [8, 0.5], expected: [4.42107772581558, 6.0] },
      { input: [100, 0.25], expected: [4.240589925677196, 13.28771237954945] },
      { input: [0, 0.5], expected: [0.0, 0.0] },
      { input: [10, 0.5], expected: [4.725559323634527, 6.643856189774725] },
    ],
    hint: "Sum the probability that at least one node reaches each level for the expected height.",
  },
  {
    id: "al-378",
    title: "Miller-Rabin Witness Round",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Run one Miller-Rabin round for odd n > 2 with the given base and report whether n passes.\n\nWrite n - 1 as 2^s * d and test pow(base, d, n): n passes if that value is 1 or n - 1, or if some repeated squaring reaches n - 1. Return False for n < 2, True for n = 2, and True when base is a multiple of n.",
    starterCode: `def miller_rabin_round(n, base):
    # Your code here
    pass`,
    solution: `def miller_rabin_round(n, base):
    if n < 2:
        return False
    if n % 2 == 0:
        return n == 2
    if base % n == 0:
        return True
    d = n - 1
    s = 0
    while d % 2 == 0:
        d //= 2
        s += 1
    x = pow(base % n, d, n)
    if x == 1 or x == n - 1:
        return True
    for _ in range(s - 1):
        x = (x * x) % n
        if x == n - 1:
            return True
    return False`,
    testCases: [
      { input: [13, 2], expected: true },
      { input: [561, 2], expected: false },
      { input: [2047, 2], expected: true },
      { input: [2, 2], expected: true },
      { input: [15, 7], expected: false },
    ],
    hint: "Composites that pass one base are pseudoprimes; a single round never certifies primality.",
  },
  {
    id: "al-379",
    title: "Pollard Rho Factor Steps",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Count Floyd cycle steps until Pollard rho finds a non-trivial factor of n using f(x) = x * x + c mod n.\n\nStart tortoise and hare at 2, advance the hare twice per round, and stop when gcd(abs(x - y), n) is a non-trivial factor. Return the step count, or 0 when n < 4, the sequence cycles without a factor, or the gcd reaches n.",
    starterCode: `import math


def pollard_rho_steps(n, c):
    # Your code here
    pass`,
    solution: `import math


def pollard_rho_steps(n, c):
    if n < 4:
        return 0
    x = 2
    y = 2
    d = 1
    steps = 0
    while d == 1 and steps < 10000:
        x = (x * x + c) % n
        y = (y * y + c) % n
        y = (y * y + c) % n
        d = math.gcd(abs(x - y), n)
        steps += 1
    if d == n or d == 1:
        return 0
    return steps`,
    testCases: [
      { input: [8051, 1], expected: 3 },
      { input: [10403, 1], expected: 9 },
      { input: [91, 1], expected: 1 },
      { input: [97, 1], expected: 0 },
      { input: [15, 1], expected: 1 },
    ],
    hint: "The difference sequence collides modulo a hidden prime factor long before modulo n.",
  },
  {
    id: "al-380",
    title: "FFT Butterfly Count",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return the number of butterfly operations in an iterative radix-2 FFT of length n.\n\nAn FFT of size n = 2^k performs (n / 2) * k butterflies, one per twiddle factor per stage. Return 0 when n is less than 2 or is not a power of two.",
    starterCode: `def fft_butterfly_count(n):
    # Your code here
    pass`,
    solution: `def fft_butterfly_count(n):
    if n < 2 or (n & (n - 1)) != 0:
        return 0
    return (n // 2) * (n.bit_length() - 1)`,
    testCases: [
      { input: [8], expected: 12 },
      { input: [1], expected: 0 },
      { input: [16], expected: 32 },
      { input: [6], expected: 0 },
      { input: [1024], expected: 5120 },
    ],
    hint: "Each of the log2(n) stages combines n / 2 pairs of values.",
  },
  {
    id: "al-381",
    title: "NTT Butterfly Step",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Apply one number-theoretic transform butterfly to inputs a and b with twiddle factor w modulo mod.\n\nReturn [u + v mod mod, u - v mod mod] where u = a mod mod and v = (w * b) mod mod, with both results normalized to [0, mod). The modulus is assumed positive.",
    starterCode: `def ntt_butterfly(a, b, w, mod):
    # Your code here
    pass`,
    solution: `def ntt_butterfly(a, b, w, mod):
    u = a % mod
    v = (w * b) % mod
    return [(u + v) % mod, (u - v) % mod]`,
    testCases: [
      { input: [1, 2, 3, 7], expected: [0, 2] },
      { input: [5, 0, 123, 97], expected: [5, 5] },
      { input: [10, 10, 1, 17], expected: [3, 0] },
      { input: [0, 0, 5, 11], expected: [0, 0] },
      { input: [3, 4, 5, 13], expected: [10, 9] },
    ],
    hint: "Reduce the product first, then add and subtract before the final modulus.",
  },
  {
    id: "al-382",
    title: "Karatsuba Multiplication Count",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return the number of scalar multiplications used by the Karatsuba recurrence on a power-of-two size n.\n\nThe recurrence is T(1) = 1 and T(n) = 3 * T(n / 2), so the count is 3 ** log2(n). Return 0 for a non-positive or non-power-of-two input.",
    starterCode: `def karatsuba_multiplications(n):
    # Your code here
    pass`,
    solution: `def karatsuba_multiplications(n):
    if n <= 0:
        return 0
    if n == 1:
        return 1
    if n % 2 != 0:
        return 0
    return 3 * karatsuba_multiplications(n // 2)`,
    testCases: [
      { input: [1], expected: 1 },
      { input: [2], expected: 3 },
      { input: [4], expected: 9 },
      { input: [8], expected: 27 },
      { input: [0], expected: 0 },
    ],
    hint: "Splitting into halves and reusing three products gives a 3-way branching recurrence.",
  },
  {
    id: "al-383",
    title: "Strassen Multiplication Count",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return the number of scalar multiplications used by the Strassen recurrence on a power-of-two matrix size n.\n\nThe recurrence is T(1) = 1 and T(n) = 7 * T(n / 2), so the count is 7 ** log2(n). Return 0 for a non-positive or non-power-of-two input.",
    starterCode: `def strassen_multiplications(n):
    # Your code here
    pass`,
    solution: `def strassen_multiplications(n):
    if n <= 0:
        return 0
    if n == 1:
        return 1
    if n % 2 != 0:
        return 0
    return 7 * strassen_multiplications(n // 2)`,
    testCases: [
      { input: [1], expected: 1 },
      { input: [2], expected: 7 },
      { input: [4], expected: 49 },
      { input: [8], expected: 343 },
      { input: [0], expected: 0 },
    ],
    hint: "Seven recursive block products replace the eight of the naive divide and conquer.",
  },
  {
    id: "al-384",
    title: "Squaring Exponentiation Multiplication Count",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return the number of modular multiplications needed to compute x ** exponent by binary exponentiation.\n\nSquare-and-multiply performs floor(log2(exponent)) squarings plus one multiplication per additional set bit, giving (bit_length - 1) + popcount - 1. Return 0 for exponent <= 0.",
    starterCode: `def squaring_multiplication_count(exponent):
    # Your code here
    pass`,
    solution: `def squaring_multiplication_count(exponent):
    if exponent <= 0:
        return 0
    return exponent.bit_length() - 1 + bin(exponent).count("1") - 1`,
    testCases: [
      { input: [1], expected: 0 },
      { input: [2], expected: 1 },
      { input: [13], expected: 5 },
      { input: [16], expected: 4 },
      { input: [0], expected: 0 },
    ],
    hint: "Every bit costs one squaring and every set bit after the leading one costs a multiply.",
  },
  {
    id: "al-385",
    title: "Binary GCD Step Count",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Count iterations of the binary (Stein) GCD loop for positive a and b.\n\nFirst cancel common factors of two, then repeatedly halve an even operand or replace the larger odd pair a, b with (a - b) / 2 until they are equal, counting each loop iteration. Return 0 when either input is non-positive.",
    starterCode: `def binary_gcd_steps(a, b):
    # Your code here
    pass`,
    solution: `def binary_gcd_steps(a, b):
    if a <= 0 or b <= 0:
        return 0
    a, b = abs(a), abs(b)
    while a % 2 == 0 and b % 2 == 0:
        a //= 2
        b //= 2
    steps = 0
    while a != b:
        if a % 2 == 0:
            a //= 2
        elif b % 2 == 0:
            b //= 2
        elif a > b:
            a = (a - b) // 2
        else:
            b = (b - a) // 2
        steps += 1
    return steps`,
    testCases: [
      { input: [12, 8], expected: 2 },
      { input: [48, 18], expected: 4 },
      { input: [17, 5], expected: 4 },
      { input: [1, 1], expected: 0 },
      { input: [270, 192], expected: 10 },
    ],
    hint: "Subtract and halve keeps both operands odd, shrinking them geometrically.",
  },
  {
    id: "al-386",
    title: "Extended GCD Canonical Coefficients",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return [g, x, y] where g is gcd(a, b), a * x + b * y = g, and x is the smallest non-negative solution modulo b / g.\n\nRun the iterative extended Euclidean algorithm and reduce the a-coefficient into [0, b / g). Return [0, 0, 0] when both inputs are zero and [g, 1, 0] when b is zero.",
    starterCode: `def extended_gcd_canonical(a, b):
    # Your code here
    pass`,
    solution: `def extended_gcd_canonical(a, b):
    if a == 0 and b == 0:
        return [0, 0, 0]
    old_r, r = abs(a), abs(b)
    old_s, s = 1, 0
    old_t, t = 0, 1
    while r != 0:
        q = old_r // r
        old_r, r = r, old_r - q * r
        old_s, s = s, old_s - q * s
        old_t, t = t, old_t - q * t
    g = old_r
    x, y = old_s, old_t
    if a < 0:
        x = -x
    if b < 0:
        y = -y
    if b == 0:
        return [g, 1 if a != 0 else 0, 0]
    modulus = abs(b) // g
    x %= modulus
    y = (g - a * x) // b
    return [g, x, y]`,
    testCases: [
      { input: [30, 18], expected: [6, 2, -3] },
      { input: [3, 7], expected: [1, 5, -2] },
      { input: [7, 3], expected: [1, 1, -2] },
      { input: [0, 5], expected: [5, 0, 1] },
      { input: [12, 8], expected: [4, 1, -1] },
    ],
    hint: "Bezout coefficients are unique only up to multiples of b / g, so normalize into the canonical range.",
  },
  {
    id: "al-387",
    title: "Greedy Set Cover Approximation Ratio",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Compare greedy set cover with the exact optimum on a small instance and return [greedy_count, optimal_count, ratio].\n\nThe universe is 0 to universe_size - 1 and greedy always takes the set covering the most uncovered elements, breaking ties by smallest index; the optimum is found by trying subsets in increasing size. Return [0, 0, 0.0] when the sets cannot cover the universe.",
    starterCode: `import itertools


def greedy_set_cover_ratio(universe_size, sets):
    # Your code here
    pass`,
    solution: `import itertools


def greedy_set_cover_ratio(universe_size, sets):
    if universe_size <= 0:
        return [0, 0, 0.0]
    covered_check = set()
    for s in sets:
        covered_check |= set(s)
    if len(covered_check) < universe_size:
        return [0, 0, 0.0]
    covered = set()
    count = 0
    while len(covered) < universe_size:
        best = -1
        best_new = -1
        for i, s in enumerate(sets):
            new = len(set(s) - covered)
            if new > best_new:
                best_new = new
                best = i
        covered |= set(sets[best])
        count += 1
    best_opt = len(sets)
    m = len(sets)
    for r in range(1, m + 1):
        hit = False
        for combo in itertools.combinations(range(m), r):
            u = set()
            for i in combo:
                u |= set(sets[i])
            if len(u) == universe_size:
                best_opt = r
                hit = True
                break
        if hit:
            break
    return [count, best_opt, count / best_opt]`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]]], expected: [2, 2, 1.0] },
      {
        input: [5, [[0, 1, 2, 3], [0, 1], [2, 3], [4], [3, 4]]],
        expected: [2, 2, 1.0],
      },
      { input: [5, [[0, 2, 3], [0, 2, 4], [3], [1, 3]]], expected: [3, 2, 1.5] },
      {
        input: [
          5,
          [
            [0, 3],
            [0, 3, 4],
            [0, 1, 4],
            [2, 3, 4],
          ],
        ],
        expected: [3, 2, 1.5],
      },
      { input: [4, [[0, 1], [1, 2]]], expected: [0, 0, 0.0] },
    ],
    hint: "Greedy can be forced to pick small sets early; the harmonic bound is the worst case.",
  },
  {
    id: "al-388",
    title: "Vertex Cover 2-Approx Size",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return the size of the vertex cover produced by the maximal-matching 2-approximation.\n\nScan edges in order and, whenever both endpoints are still unmatched, add both endpoints to the cover and mark them used. The result is twice a maximal matching, hence at most twice the optimal cover; return 0 for non-positive n.",
    starterCode: `def vertex_cover_approx_size(n, edges):
    # Your code here
    pass`,
    solution: `def vertex_cover_approx_size(n, edges):
    if n <= 0:
        return 0
    used = [False] * n
    count = 0
    for u, v in edges:
        if not used[u] and not used[v]:
            used[u] = True
            used[v] = True
            count += 2
    return count`,
    testCases: [
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: 2 },
      { input: [4, [[0, 1], [0, 2], [0, 3]]], expected: 2 },
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: 4 },
      { input: [3, []], expected: 0 },
      { input: [2, [[0, 1]]], expected: 2 },
    ],
    hint: "Any vertex cover must contain at least one endpoint of every matching edge.",
  },
  {
    id: "al-389",
    title: "Double Tree TSP Tour Cost",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Build the double-tree 2-approximation tour for a metric TSP instance and return its cost.\n\nPrim builds a minimum spanning tree with smallest-index tie-breaking, a preorder depth-first traversal gives the visit order, and the tour cost closes back to the start. dist is a symmetric distance matrix; return 0 for fewer than two cities.",
    starterCode: `def double_tree_tour_cost(dist):
    # Your code here
    pass`,
    solution: `def double_tree_tour_cost(dist):
    n = len(dist)
    if n <= 1:
        return 0
    used = [False] * n
    best = [float("inf")] * n
    parent = [-1] * n
    best[0] = 0
    adj = [[] for _ in range(n)]
    for _ in range(n):
        u = -1
        for v in range(n):
            if not used[v] and (u == -1 or best[v] < best[u]):
                u = v
        used[u] = True
        if parent[u] != -1:
            adj[u].append(parent[u])
            adj[parent[u]].append(u)
        for v in range(n):
            if not used[v] and dist[u][v] < best[v]:
                best[v] = dist[u][v]
                parent[v] = u
    for lst in adj:
        lst.sort()
    order = []
    stack = [0]
    seen = [False] * n
    while stack:
        u = stack.pop()
        if seen[u]:
            continue
        seen[u] = True
        order.append(u)
        for v in reversed(adj[u]):
            if not seen[v]:
                stack.append(v)
    total = 0
    for i in range(n):
        total += dist[order[i]][order[(i + 1) % n]]
    return total`,
    testCases: [
      {
        input: [
          [
            [0, 1, 2, 3],
            [1, 0, 1, 2],
            [2, 1, 0, 1],
            [3, 2, 1, 0],
          ],
        ],
        expected: 6,
      },
      {
        input: [
          [
            [0, 1, 5],
            [1, 0, 2],
            [5, 2, 0],
          ],
        ],
        expected: 8,
      },
      {
        input: [
          [
            [0, 10, 15, 20],
            [10, 0, 35, 25],
            [15, 35, 0, 30],
            [20, 25, 30, 0],
          ],
        ],
        expected: 95,
      },
      { input: [[[0]]], expected: 0 },
      { input: [[[0, 3], [3, 0]]], expected: 6 },
    ],
    hint: "A preorder walk of the MST visits every vertex and, by the triangle inequality, never costs more than twice the tree.",
  },
  {
    id: "al-390",
    title: "First Fit Bin Packing",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Pack items into bins of the given capacity with the first-fit heuristic and return the number of bins used.\n\nPlace each item into the first bin whose remaining capacity can hold it, otherwise open a new bin. Return 0 for non-positive capacity; items larger than the capacity still each open one bin.",
    starterCode: `def first_fit_bins(items, capacity):
    # Your code here
    pass`,
    solution: `def first_fit_bins(items, capacity):
    if capacity <= 0:
        return 0
    remaining = []
    for x in items:
        placed = False
        for i in range(len(remaining)):
            if remaining[i] >= x:
                remaining[i] -= x
                placed = True
                break
        if not placed:
            remaining.append(capacity - x)
    return len(remaining)`,
    testCases: [
      { input: [[4, 8, 1, 4, 2, 1], 10], expected: 2 },
      { input: [[1, 2, 3, 4, 5], 5], expected: 4 },
      { input: [[5, 5, 5], 5], expected: 3 },
      { input: [[], 5], expected: 0 },
      { input: [[2, 2, 2, 2], 4], expected: 2 },
    ],
    hint: "First fit never revisits closed bins, so each item scans the open bins in order.",
  },
  {
    id: "al-391",
    title: "LRU Paging Competitive Ratio",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Return the ratio of LRU page faults to offline-optimal page faults on a request sequence.\n\nSimulate LRU with a cache of cache_size pages, then simulate Belady's optimal policy that evicts the page used farthest in the future, and divide the two fault counts. Return 0.0 for a non-positive cache or an empty request sequence.",
    starterCode: `def lru_competitive_ratio(pages, cache_size):
    # Your code here
    pass`,
    solution: `def lru_competitive_ratio(pages, cache_size):
    if cache_size <= 0 or not pages:
        return 0.0
    cache = []
    lru_faults = 0
    for p in pages:
        if p in cache:
            cache.remove(p)
            cache.append(p)
        else:
            lru_faults += 1
            if len(cache) == cache_size:
                cache.pop(0)
            cache.append(p)
    opt_faults = 0
    cache = []
    for i, p in enumerate(pages):
        if p in cache:
            continue
        opt_faults += 1
        if len(cache) == cache_size:
            evict = cache[0]
            farthest = -1
            for q in cache:
                try:
                    nxt = pages.index(q, i + 1)
                except ValueError:
                    nxt = float("inf")
                if nxt > farthest or (nxt == float("inf") and farthest != float("inf")):
                    farthest = nxt
                    evict = q
            cache.remove(evict)
        cache.append(p)
    if opt_faults == 0:
        return 0.0
    return lru_faults / opt_faults`,
    testCases: [
      { input: [[1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5], 3], expected: 1.4285714285714286 },
      { input: [[1, 1, 1], 2], expected: 1.0 },
      { input: [[1, 2, 1, 2], 1], expected: 1.0 },
      { input: [[], 3], expected: 0.0 },
      { input: [[1, 2, 3], 3], expected: 1.0 },
    ],
    hint: "Belady evicts the resident page whose next request is farthest away, which lower-bounds any online policy.",
  },
  {
    id: "al-392",
    title: "Ski Rental Break Even Days",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return the number of rental days after which buying is no more expensive than renting.\n\nEach day of renting costs rent_cost and buying costs buy_cost once, so the break-even point is ceil(buy_cost / rent_cost). Return 0 when either cost is non-positive.",
    starterCode: `def ski_rental_break_even(buy_cost, rent_cost):
    # Your code here
    pass`,
    solution: `def ski_rental_break_even(buy_cost, rent_cost):
    if buy_cost <= 0 or rent_cost <= 0:
        return 0
    return -(-buy_cost // rent_cost)`,
    testCases: [
      { input: [100, 10], expected: 10 },
      { input: [100, 30], expected: 4 },
      { input: [7, 7], expected: 1 },
      { input: [0, 5], expected: 0 },
      { input: [50, 0], expected: 0 },
    ],
    hint: "The deterministic break-even ignores the unknown number of future ski days.",
  },
  {
    id: "al-393",
    title: "Secretary Optimal Threshold Rank",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return the number of applicants to reject that exactly maximizes the secretary problem success probability.\n\nFor each threshold k, the success probability is (k - 1) / n times the sum of 1 / (j - 1) for j from k to n; return the smallest k attaining the maximum. Return 0 for n <= 1.",
    starterCode: `def secretary_best_threshold(n):
    # Your code here
    pass`,
    solution: `def secretary_best_threshold(n):
    if n <= 0:
        return 0
    if n == 1:
        return 0
    best_k = 1
    best_p = -1.0
    for k in range(1, n + 1):
        s = 0.0
        for j in range(k, n + 1):
            if j - 1 > 0:
                s += 1.0 / (j - 1)
        p = (k - 1.0) / n * s
        if p > best_p + 1e-15:
            best_p = p
            best_k = k
    return best_k`,
    testCases: [
      { input: [1], expected: 0 },
      { input: [2], expected: 2 },
      { input: [3], expected: 2 },
      { input: [10], expected: 4 },
      { input: [100], expected: 38 },
    ],
    hint: "The exact optimum sits near n / e, but floating-point comparison over all k keeps it precise.",
  },
  {
    id: "al-394",
    title: "UCB1 Exploration Bonus",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return the UCB1 exploration bonus sqrt(2 * ln(total) / pulls) for a bandit arm.\n\npulls is the number of times this arm was played and total is the total number of plays across all arms. Return 0.0 when pulls is non-positive or total is at most 1.",
    starterCode: `import math


def ucb1_bonus(pulls, total):
    # Your code here
    pass`,
    solution: `import math


def ucb1_bonus(pulls, total):
    if pulls <= 0 or total <= 1:
        return 0.0
    return math.sqrt(2 * math.log(total) / pulls)`,
    testCases: [
      { input: [5, 100], expected: 1.3572280848830225 },
      { input: [1, 10], expected: 2.145966026289347 },
      { input: [0, 10], expected: 0.0 },
      { input: [3, 1], expected: 0.0 },
      { input: [10, 1000], expected: 1.1753940002383998 },
    ],
    hint: "The bonus grows with the log of total plays and shrinks with the square root of this arm's pulls.",
  },
  {
    id: "al-395",
    title: "Thompson Posterior Mean",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return the posterior mean for each Bernoulli bandit arm under a shared Beta(alpha, beta) prior.\n\nFor an arm with successes and trials, the mean is (alpha + successes) / (alpha + beta + trials). Return a list with one mean per arm, using 0.0 for a degenerate zero denominator.",
    starterCode: `def thompson_posterior_means(alpha, beta, successes, trials):
    # Your code here
    pass`,
    solution: `def thompson_posterior_means(alpha, beta, successes, trials):
    out = []
    for s, t in zip(successes, trials):
        denom = alpha + beta + t
        out.append((alpha + s) / denom if denom > 0 else 0.0)
    return out`,
    testCases: [
      { input: [1, 1, [3, 1, 0], [5, 2, 0]], expected: [0.5714285714285714, 0.5, 0.5] },
      { input: [2, 3, [1], [1]], expected: [0.5] },
      { input: [1, 1, [], []], expected: [] },
      {
        input: [0.5, 0.5, [4, 0], [10, 10]],
        expected: [0.4090909090909091, 0.045454545454545456],
      },
      { input: [1, 1, [7], [10]], expected: [0.6666666666666666] },
    ],
    hint: "The Beta posterior just adds successes to alpha and failures to beta.",
  },
];
