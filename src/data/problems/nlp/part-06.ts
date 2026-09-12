import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "nlp-186",
    title: "Word Error Rate",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the word error rate: the Levenshtein distance between reference and hypothesis token lists divided by the reference length.\n\nAn empty reference gives 0.0 for an empty hypothesis and 1.0 otherwise.",
    starterCode: `def wer(reference, hypothesis):
    # Your code here
    pass`,
    solution: `def wer(reference, hypothesis):
    n, m = len(reference), len(hypothesis)
    if n == 0:
        return 0.0 if m == 0 else 1.0
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(n + 1):
        dp[i][0] = i
    for j in range(m + 1):
        dp[0][j] = j
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            cost = 0 if reference[i - 1] == hypothesis[j - 1] else 1
            dp[i][j] = min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
    return dp[n][m] / n`,
    testCases: [
      { input: [["a", "b", "c"], ["a", "b", "c"]], expected: 0.0 },
      { input: [["a", "b", "c"], ["a", "c"]], expected: 0.3333333333333333 },
      { input: [["a", "b"], []], expected: 1.0 },
      { input: [[], []], expected: 0.0 },
      { input: [[], ["x"]], expected: 1.0 },
    ],
    hint: "Use the standard edit-distance DP and normalize by the number of reference words.",
  },
  {
    id: "nlp-187",
    title: "Character Error Rate",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the character error rate: the Levenshtein distance between the reference and hypothesis strings divided by the reference length.\n\nAn empty reference gives 0.0 for an empty hypothesis and 1.0 otherwise.",
    starterCode: `def cer(reference, hypothesis):
    # Your code here
    pass`,
    solution: `def cer(reference, hypothesis):
    n, m = len(reference), len(hypothesis)
    if n == 0:
        return 0.0 if m == 0 else 1.0
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(n + 1):
        dp[i][0] = i
    for j in range(m + 1):
        dp[0][j] = j
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            cost = 0 if reference[i - 1] == hypothesis[j - 1] else 1
            dp[i][j] = min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
    return dp[n][m] / n`,
    testCases: [
      { input: ["abc", "abc"], expected: 0.0 },
      { input: ["abc", "ac"], expected: 0.3333333333333333 },
      { input: ["ab", ""], expected: 1.0 },
      { input: ["", ""], expected: 0.0 },
      { input: ["", "x"], expected: 1.0 },
    ],
    hint: "This is the same DP as WER but over characters instead of tokens.",
  },
  {
    id: "nlp-188",
    title: "Substitution Insertion Deletion Counts",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Return [substitutions, insertions, deletions] for the optimal Levenshtein alignment between reference and hypothesis.\n\nBacktrack from the bottom-right cell and prefer, in order: an equal diagonal match, a diagonal substitution, an upward deletion, then a leftward insertion. Deletions are reference tokens missing from the hypothesis; insertions are extra hypothesis tokens.",
    starterCode: `def sub_ins_del_counts(reference, hypothesis):
    # Your code here
    pass`,
    solution: `def sub_ins_del_counts(reference, hypothesis):
    n, m = len(reference), len(hypothesis)
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(n + 1):
        dp[i][0] = i
    for j in range(m + 1):
        dp[0][j] = j
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            cost = 0 if reference[i - 1] == hypothesis[j - 1] else 1
            dp[i][j] = min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
    subs = ins = dels = 0
    i, j = n, m
    while i > 0 or j > 0:
        if i > 0 and j > 0 and reference[i - 1] == hypothesis[j - 1] and dp[i][j] == dp[i - 1][j - 1]:
            i -= 1
            j -= 1
        elif i > 0 and j > 0 and dp[i][j] == dp[i - 1][j - 1] + 1:
            subs += 1
            i -= 1
            j -= 1
        elif i > 0 and dp[i][j] == dp[i - 1][j] + 1:
            dels += 1
            i -= 1
        else:
            ins += 1
            j -= 1
    return [subs, ins, dels]`,
    testCases: [
      { input: ["abc", "abc"], expected: [0, 0, 0] },
      { input: ["abc", "axc"], expected: [1, 0, 0] },
      { input: ["abc", "ab"], expected: [0, 0, 1] },
      { input: ["ab", "abc"], expected: [0, 1, 0] },
      { input: ["kitten", "sitting"], expected: [2, 1, 0] },
    ],
    hint: "The backtracking tie-breaking rule makes the counts deterministic.",
  },
  {
    id: "nlp-189",
    title: "METEOR-lite",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Return a lite METEOR score. Match hypothesis tokens against a reference multiset in order, counting matches and the number of maximal contiguous matched chunks.\n\nWith P = matches / len(hypothesis), R = matches / len(reference), Fmean = 10PR/(R + 9P), and penalty = 0.5 * (chunks / matches) ** 3, return Fmean * (1 - penalty). Return 0.0 when there are no matches.",
    starterCode: `def meteor_lite(hypothesis, reference):
    # Your code here
    pass`,
    solution: `def meteor_lite(hypothesis, reference):
    if not hypothesis and not reference:
        return 0.0
    ref_counter = {}
    for t in reference:
        ref_counter[t] = ref_counter.get(t, 0) + 1
    matches = 0
    chunks = 0
    in_chunk = False
    for t in hypothesis:
        if ref_counter.get(t, 0) > 0:
            ref_counter[t] -= 1
            matches += 1
            if not in_chunk:
                chunks += 1
                in_chunk = True
        else:
            in_chunk = False
    if matches == 0:
        return 0.0
    precision = matches / len(hypothesis)
    recall = matches / len(reference)
    fmean = 10 * precision * recall / (recall + 9 * precision)
    penalty = 0.5 * (chunks / matches) ** 3
    return fmean * (1 - penalty)`,
    testCases: [
      { input: [["the", "cat", "sat"], ["the", "cat", "sat"]], expected: 0.9814814814814815 },
      { input: [["the", "cat"], ["the", "dog"]], expected: 0.25 },
      { input: [["cat"], ["cat", "dog"]], expected: 0.2631578947368421 },
      { input: [[], []], expected: 0.0 },
      { input: [["a"], []], expected: 0.0 },
    ],
    hint: "The fragmentation penalty grows with the cube of chunks relative to matches.",
  },
  {
    id: "nlp-190",
    title: "Translation Edit Rate",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the translation edit rate from an edit count triple: sum of [substitutions, insertions, deletions] divided by the reference length.\n\nReturn 0.0 when the reference length is not positive.",
    starterCode: `def ter(edit_counts, reference_length):
    # Your code here
    pass`,
    solution: `def ter(edit_counts, reference_length):
    if reference_length <= 0:
        return 0.0
    return sum(edit_counts) / reference_length`,
    testCases: [
      { input: [[1, 0, 0], 4], expected: 0.25 },
      { input: [[0, 0, 0], 5], expected: 0.0 },
      { input: [[2, 1, 1], 8], expected: 0.5 },
      { input: [[1, 1, 1], 0], expected: 0.0 },
    ],
    hint: "The three edit types are summed before normalizing by the reference length.",
  },
  {
    id: "nlp-191",
    title: "Speech Token Frame Rate",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return how many frames per second a speech tokenizer produces: sample_rate / hop_length, where hop_length is the frame hop in samples.",
    starterCode: `def speech_token_frame_rate(sample_rate, hop_length):
    # Your code here
    pass`,
    solution: `def speech_token_frame_rate(sample_rate, hop_length):
    return sample_rate / hop_length`,
    testCases: [
      { input: [16000, 160], expected: 100.0 },
      { input: [16000, 320], expected: 50.0 },
      { input: [8000, 80], expected: 100.0 },
      { input: [22050, 256], expected: 86.1328125 },
    ],
    hint: "A smaller hop length gives a higher frame rate.",
  },
  {
    id: "nlp-192",
    title: "Mel Spectrogram Bin Count",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the number of frequency bins in an FFT spectrogram: n_fft // 2 + 1, which includes the DC and Nyquist bins.",
    starterCode: `def mel_bin_count(n_fft):
    # Your code here
    pass`,
    solution: `def mel_bin_count(n_fft):
    return n_fft // 2 + 1`,
    testCases: [
      { input: [512], expected: 257 },
      { input: [400], expected: 201 },
      { input: [1024], expected: 513 },
      { input: [0], expected: 1 },
    ],
    hint: "A real FFT of size N keeps N // 2 + 1 non-redundant bins.",
  },
  {
    id: "nlp-193",
    title: "MFCC Coefficient Value",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Return one MFCC coefficient from mel energies using the DCT-II: sum over k of log(max(E_k, 1e-10)) * cos(pi * n * (k + 0.5) / K), where K is the number of mel bands and n is the coefficient index.\n\nEnergies below 1e-10 are clamped before taking the log.",
    starterCode: `import math
def mfcc_coefficient_value(energies, n):
    # Your code here
    pass`,
    solution: `import math
def mfcc_coefficient_value(energies, n):
    total = 0.0
    k_count = len(energies)
    for k in range(k_count):
        e = energies[k]
        if e < 1e-10:
            e = 1e-10
        total += math.log(e) * math.cos(math.pi * n * (k + 0.5) / k_count)
    return total`,
    testCases: [
      { input: [[1.0, 1.0, 1.0, 1.0], 0], expected: 0.0 },
      { input: [[1.0, 2.0, 4.0, 8.0], 1], expected: -2.1864094216025802 },
      { input: [[1.0, 2.0, 4.0, 8.0], 0], expected: 4.1588830833596715 },
      { input: [[1.0], 0], expected: 0.0 },
      { input: [[1.0, 2.0], 0], expected: 0.6931471805599453 },
    ],
    hint: "Coefficient 0 is the sum of log energies; higher coefficients oscillate with cos.",
  },
  {
    id: "nlp-194",
    title: "VAD Energy Threshold",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return a frame-level voice activity list: 1 when the frame energy is strictly greater than threshold, otherwise 0.\n\nAn empty energy list gives an empty result.",
    starterCode: `def vad_energy_threshold(energies, threshold):
    # Your code here
    pass`,
    solution: `def vad_energy_threshold(energies, threshold):
    return [1 if e > threshold else 0 for e in energies]`,
    testCases: [
      { input: [[0.1, 0.5, 0.9], 0.5], expected: [0, 0, 1] },
      { input: [[1.0], 0.0], expected: [1] },
      { input: [[], 0.5], expected: [] },
      { input: [[0.4, 0.6], 0.5], expected: [0, 1] },
    ],
    hint: "The comparison is strict, so a frame exactly at the threshold is silence.",
  },
  {
    id: "nlp-195",
    title: "Silence Ratio",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the fraction of frames whose energy is at or below threshold.\n\nReturn 0.0 for an empty frame list.",
    starterCode: `def silence_ratio(energies, threshold):
    # Your code here
    pass`,
    solution: `def silence_ratio(energies, threshold):
    if not energies:
        return 0.0
    return sum(1 for e in energies if e <= threshold) / len(energies)`,
    testCases: [
      { input: [[0.1, 0.5, 0.9], 0.5], expected: 0.6666666666666666 },
      { input: [[1.0], 0.0], expected: 0.0 },
      { input: [[], 0.5], expected: 0.0 },
      { input: [[0.0, 0.0], 0.0], expected: 1.0 },
    ],
    hint: "Frames at or below the threshold count as silence, matching the VAD convention.",
  },
  {
    id: "nlp-196",
    title: "Diarization Segment Count",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Count the number of speaker segments by counting runs of equal labels.\n\nAn empty label sequence gives 0, and each change of speaker starts a new segment.",
    starterCode: `def diarization_segment_count(labels):
    # Your code here
    pass`,
    solution: `def diarization_segment_count(labels):
    count = 0
    prev = None
    for s in labels:
        if s != prev:
            count += 1
            prev = s
    return count`,
    testCases: [
      { input: [["a", "a", "b", "b", "a"]], expected: 3 },
      { input: [[]], expected: 0 },
      { input: [["a"]], expected: 1 },
      { input: [["a", "b", "c"]], expected: 3 },
    ],
    hint: "Compare each label with the previous one and count the changes.",
  },
  {
    id: "nlp-197",
    title: "Speaker Cosine Similarity",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the cosine similarity between the mean embeddings (centroids) of two speaker embedding sets.\n\nReturn 0.0 when either set is empty or a centroid has zero norm.",
    starterCode: `def speaker_cosine(embeddings_a, embeddings_b):
    # Your code here
    pass`,
    solution: `def speaker_cosine(embeddings_a, embeddings_b):
    if not embeddings_a or not embeddings_b:
        return 0.0
    d = len(embeddings_a[0])
    ca = [sum(v[k] for v in embeddings_a) / len(embeddings_a) for k in range(d)]
    cb = [sum(v[k] for v in embeddings_b) / len(embeddings_b) for k in range(d)]
    dot = sum(a * b for a, b in zip(ca, cb))
    na = sum(a * a for a in ca) ** 0.5
    nb = sum(b * b for b in cb) ** 0.5
    if na == 0 or nb == 0:
        return 0.0
    return dot / (na * nb)`,
    testCases: [
      { input: [[[1.0, 0.0], [1.0, 0.0]], [[1.0, 0.0]]], expected: 1.0 },
      { input: [[[1.0, 0.0]], [[0.0, 1.0]]], expected: 0.0 },
      { input: [[[1.0, 2.0], [3.0, 4.0]], [[2.0, 3.0]]], expected: 1.0000000000000002 },
      { input: [[], [[1.0]]], expected: 0.0 },
      { input: [[[1.0, 0.0]], [[-1.0, 0.0]]], expected: -1.0 },
    ],
    hint: "Average each embedding set first, then take the cosine of the two centroids.",
  },
  {
    id: "nlp-198",
    title: "ASR Confidence Average",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the token-length-weighted average confidence: sum(len(token) * confidence) / sum(len(token)).\n\nReturn 0.0 when there are no tokens or all token lengths are 0.",
    starterCode: `def asr_confidence_average(tokens, confidences):
    # Your code here
    pass`,
    solution: `def asr_confidence_average(tokens, confidences):
    if not tokens:
        return 0.0
    total_len = sum(len(t) for t in tokens)
    if total_len == 0:
        return 0.0
    return sum(len(t) * c for t, c in zip(tokens, confidences)) / total_len`,
    testCases: [
      { input: [["ab", "c"], [0.5, 1.0]], expected: 0.6666666666666666 },
      { input: [["a"], [0.9]], expected: 0.9 },
      { input: [[], []], expected: 0.0 },
      { input: [["", "xy"], [0.1, 0.5]], expected: 0.5 },
      { input: [["ab", "c"], [0.0, 0.0]], expected: 0.0 },
    ],
    hint: "Longer tokens weigh more because they contribute more characters.",
  },
  {
    id: "nlp-199",
    title: "Language Model Rescoring Gain",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the average log-probability gain from rescoring: mean(rescored_logprobs) - mean(base_logprobs), zipped to the shorter list.\n\nReturn 0.0 when either list is empty.",
    starterCode: `def lm_rescoring_gain(base_logprobs, rescored_logprobs):
    # Your code here
    pass`,
    solution: `def lm_rescoring_gain(base_logprobs, rescored_logprobs):
    if not base_logprobs or not rescored_logprobs:
        return 0.0
    n = min(len(base_logprobs), len(rescored_logprobs))
    base = sum(base_logprobs[:n]) / n
    rescored = sum(rescored_logprobs[:n]) / n
    return rescored - base`,
    testCases: [
      { input: [[-1.0, -2.0], [-0.5, -1.0]], expected: 0.75 },
      { input: [[0.0], [1.0]], expected: 1.0 },
      { input: [[], []], expected: 0.0 },
      { input: [[-1.0, -1.0, -1.0], [-2.0, -2.0]], expected: -1.0 },
      { input: [[5.0], [5.0]], expected: 0.0 },
    ],
    hint: "A positive gain means rescoring improved the average log probability.",
  },
  {
    id: "nlp-200",
    title: "CTC Greedy Decode",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Greedily decode CTC frames: take the argmax index of each frame with ties keeping the lowest index, collapse consecutive repeats, and remove every blank_index token.\n\nReturn the remaining indices as a list. An empty frame list decodes to an empty list.",
    starterCode: `def ctc_greedy_decode(frames, blank_index=0):
    # Your code here
    pass`,
    solution: `def ctc_greedy_decode(frames, blank_index=0):
    path = []
    for row in frames:
        best = 0
        for i in range(1, len(row)):
            if row[i] > row[best]:
                best = i
        path.append(best)
    collapsed = []
    prev = None
    for idx in path:
        if idx != prev:
            collapsed.append(idx)
            prev = idx
    return [i for i in collapsed if i != blank_index]`,
    testCases: [
      {
        input: [[[0.1, 0.7, 0.2], [0.1, 0.8, 0.1], [0.1, 0.2, 0.7], [0.9, 0.05, 0.05]]],
        expected: [1, 2],
      },
      { input: [[[0.1, 0.6, 0.3]]], expected: [1] },
      { input: [[[0.9, 0.1, 0.0], [0.8, 0.1, 0.1]]], expected: [] },
      { input: [[]], expected: [] },
      { input: [[[0.1, 0.2, 0.7], [0.1, 0.7, 0.2], [0.1, 0.7, 0.2]]], expected: [2, 1] },
    ],
    hint: "Collapse after taking argmax, and treat a blank between repeats as a separator.",
  },
  {
    id: "nlp-201",
    title: "CTC Collapse",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Collapse a CTC path: remove consecutive repeats, then drop every token equal to blank_index.\n\nA blank between two identical tokens keeps both after collapsing, and an empty path stays empty.",
    starterCode: `def ctc_collapse(path, blank_index=0):
    # Your code here
    pass`,
    solution: `def ctc_collapse(path, blank_index=0):
    collapsed = []
    prev = None
    for idx in path:
        if idx != prev:
            collapsed.append(idx)
            prev = idx
    return [i for i in collapsed if i != blank_index]`,
    testCases: [
      { input: [[1, 1, 2, 2, 2, 0, 3], 0], expected: [1, 2, 3] },
      { input: [[0, 0, 0], 0], expected: [] },
      { input: [[], 0], expected: [] },
      { input: [[1, 0, 1], 0], expected: [1, 1] },
      { input: [[1, 1, 1, 1], 5], expected: [1] },
    ],
    hint: "Do the repeat collapse first, then remove blanks.",
  },
  {
    id: "nlp-202",
    title: "CTC Blank Probability",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the probability of an all-blank CTC path: the product of the per-frame blank probabilities.\n\nAn empty list gives 1.0, the empty product.",
    starterCode: `def ctc_blank_probability(blank_probs):
    # Your code here
    pass`,
    solution: `def ctc_blank_probability(blank_probs):
    total = 1.0
    for p in blank_probs:
        total *= p
    return total`,
    testCases: [
      { input: [[0.9, 0.8]], expected: 0.7200000000000001 },
      { input: [[]], expected: 1.0 },
      { input: [[1.0, 1.0]], expected: 1.0 },
      { input: [[0.5, 0.5, 0.5]], expected: 0.125 },
    ],
    hint: "Per-frame probabilities multiply because frames are conditionally independent.",
  },
  {
    id: "nlp-203",
    title: "CTC Prefix Beam Search (Lite)",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Run a lite CTC prefix beam search. Each beam tracks a prefix and two probabilities: ending in blank and ending in a non-blank token.\n\nEvery frame extends each beam with every token, handling repeated tokens through the blank split. Keep the top beam_width prefixes by total probability, with ties broken by the prefix tuple, and return the best prefix as a list of indices.",
    starterCode: `def ctc_prefix_beam_lite(frames, blank_index, beam_width):
    # Your code here
    pass`,
    solution: `def ctc_prefix_beam_lite(frames, blank_index, beam_width):
    beams = {(): (1.0, 0.0)}

    def add(table, key, pb_add, pnb_add):
        pb, pnb = table.get(key, (0.0, 0.0))
        table[key] = (pb + pb_add, pnb + pnb_add)

    for row in frames:
        nxt = {}
        for prefix in beams:
            pb, pnb = beams[prefix]
            for idx in range(len(row)):
                p = row[idx]
                if p <= 0:
                    continue
                if idx == blank_index:
                    add(nxt, prefix, (pb + pnb) * p, 0.0)
                else:
                    add(nxt, prefix + (idx,), pb * p, pnb * p)
                    if prefix and prefix[-1] == idx:
                        add(nxt, prefix, pb * p, 0.0)
        scored = sorted(nxt.items(), key=lambda kv: (-(kv[1][0] + kv[1][1]), kv[0]))
        beams = dict(scored[:beam_width])
    if not beams:
        return []
    best = sorted(beams.items(), key=lambda kv: (-(kv[1][0] + kv[1][1]), kv[0]))[0][0]
    return list(best)`,
    testCases: [
      { input: [[[0.1, 0.7, 0.2]], 0, 2], expected: [1] },
      { input: [[[0.1, 0.6, 0.3], [0.1, 0.4, 0.5]], 0, 2], expected: [1] },
      { input: [[[0.7, 0.2, 0.1], [0.6, 0.3, 0.1]], 0, 2], expected: [] },
      { input: [[[0.1, 0.5, 0.4], [0.1, 0.5, 0.4]], 0, 2], expected: [1] },
    ],
    hint: "Probabilities of all paths that collapse to the same prefix are summed.",
  },
  {
    id: "nlp-204",
    title: "RNN-T Alignment Count",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Return the number of monotonic RNN-T alignments between encoder_frames frames and target_tokens tokens: the binomial coefficient C(T + U, U).\n\nEach alignment corresponds to a lattice path with T blank steps and U token steps. Negative inputs give 0.",
    starterCode: `import math
def rnnt_alignment_count(encoder_frames, target_tokens):
    # Your code here
    pass`,
    solution: `import math
def rnnt_alignment_count(encoder_frames, target_tokens):
    if encoder_frames < 0 or target_tokens < 0:
        return 0
    return math.comb(encoder_frames + target_tokens, target_tokens)`,
    testCases: [
      { input: [2, 1], expected: 3 },
      { input: [3, 2], expected: 10 },
      { input: [0, 0], expected: 1 },
      { input: [0, 2], expected: 1 },
      { input: [4, 0], expected: 1 },
    ],
    hint: "Choose the positions of the token steps among all T + U steps.",
  },
  {
    id: "nlp-205",
    title: "Streaming Chunk Latency",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the algorithmic latency of a streaming model in milliseconds: (chunk_frames + lookahead_frames) * frame_shift_ms.\n\nZero frames give zero latency.",
    starterCode: `def streaming_chunk_latency(chunk_frames, lookahead_frames, frame_shift_ms):
    # Your code here
    pass`,
    solution: `def streaming_chunk_latency(chunk_frames, lookahead_frames, frame_shift_ms):
    return (chunk_frames + lookahead_frames) * frame_shift_ms`,
    testCases: [
      { input: [10, 2, 10.0], expected: 120.0 },
      { input: [0, 0, 10], expected: 0 },
      { input: [3, 1, 20.5], expected: 82.0 },
      { input: [1, 0, 25], expected: 25 },
    ],
    hint: "Both the current chunk and the lookahead frames add to the delay.",
  },
  {
    id: "nlp-206",
    title: "Lookahead Frames",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return how many frames of lookahead a padding window covers: ceil(padding_samples / hop_length).\n\nReturn 0 when hop_length is not positive or the padding is 0.",
    starterCode: `import math
def lookahead_frames(padding_samples, hop_length):
    # Your code here
    pass`,
    solution: `import math
def lookahead_frames(padding_samples, hop_length):
    if hop_length <= 0:
        return 0
    return int(math.ceil(padding_samples / hop_length))`,
    testCases: [
      { input: [160, 160], expected: 1 },
      { input: [161, 160], expected: 2 },
      { input: [0, 160], expected: 0 },
      { input: [320, 160], expected: 2 },
      { input: [5, 0], expected: 0 },
    ],
    hint: "Any partial frame still requires a full extra frame of context.",
  },
  {
    id: "nlp-207",
    title: "Diarization Error Rate",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Return the diarization error rate: (miss + false alarm + speaker error) seconds divided by the reference speech duration.\n\nReturn 0.0 when the reference duration is not positive. The three error terms are summed before normalizing.",
    starterCode: `def diarization_der(miss_sec, false_alarm_sec, speaker_error_sec, reference_speech_sec):
    # Your code here
    pass`,
    solution: `def diarization_der(miss_sec, false_alarm_sec, speaker_error_sec, reference_speech_sec):
    if reference_speech_sec <= 0:
        return 0.0
    return (miss_sec + false_alarm_sec + speaker_error_sec) / reference_speech_sec`,
    testCases: [
      { input: [1, 2, 3, 10], expected: 0.6 },
      { input: [0, 0, 0, 5], expected: 0.0 },
      { input: [5, 0, 0, 0], expected: 0.0 },
      { input: [2, 2, 2, 2], expected: 3.0 },
      { input: [0, 0, 1, 4], expected: 0.25 },
    ],
    hint: "Miss, false alarm, and speaker confusion errors all count toward the numerator.",
  },
  {
    id: "nlp-208",
    title: "TTS Duration Prediction",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Predict the total TTS duration in frames: sum over characters of char_durations[ch], where unknown characters add 0, divided by speed.\n\nReturn 0.0 when speed is not positive.",
    starterCode: `def tts_duration_prediction(text, char_durations, speed):
    # Your code here
    pass`,
    solution: `def tts_duration_prediction(text, char_durations, speed):
    if speed <= 0:
        return 0.0
    total = 0.0
    for ch in text:
        total += char_durations.get(ch, 0)
    return total / speed`,
    testCases: [
      { input: ["abc", { a: 2, b: 3, c: 4 }, 1.0], expected: 9.0 },
      { input: ["abc", { a: 2, b: 3, c: 4 }, 1.5], expected: 6.0 },
      { input: ["ax", { a: 2 }, 1.0], expected: 2.0 },
      { input: ["", {}, 1.0], expected: 0.0 },
      { input: ["ab", { a: 1, b: 1 }, 0.0], expected: 0.0 },
    ],
    hint: "A higher speaking rate divides the total duration down.",
  },
  {
    id: "nlp-209",
    title: "Phoneme Count",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Count phonemes by greedily matching the longest inventory symbol at each position of word.\n\nSymbols are checked longest-first with alphabetical tie-breaking; unknown characters are skipped. An empty inventory gives 0.",
    starterCode: `def phoneme_count(word, inventory):
    # Your code here
    pass`,
    solution: `def phoneme_count(word, inventory):
    inv = sorted(inventory, key=lambda s: (-len(s), s))
    count = 0
    i = 0
    while i < len(word):
        matched = None
        for sym in inv:
            if word.startswith(sym, i):
                matched = sym
                break
        if matched is None:
            i += 1
        else:
            count += 1
            i += len(matched)
    return count`,
    testCases: [
      { input: ["cat", ["c", "a", "t"]], expected: 3 },
      { input: ["ship", ["sh", "i", "p"]], expected: 3 },
      { input: ["chch", ["ch"]], expected: 2 },
      { input: ["xyz", []], expected: 0 },
      { input: ["abc", ["ab", "c"]], expected: 2 },
    ],
    hint: "Sort by descending length so digraphs win over single letters.",
  },
  {
    id: "nlp-210",
    title: "G2P Rule Application",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Apply ordered grapheme-to-phoneme rewrite rules to word. Each rule is [pattern, replacement] and is applied with str.replace in list order, so later rules see the output of earlier ones.\n\nAn empty rule list returns the word unchanged.",
    starterCode: `def g2p_rule(word, rules):
    # Your code here
    pass`,
    solution: `def g2p_rule(word, rules):
    result = word
    for pair in rules:
        result = result.replace(pair[0], pair[1])
    return result`,
    testCases: [
      { input: ["cat", [["c", "k"]]], expected: "kat" },
      { input: ["phone", [["ph", "f"], ["o", "oh"]]], expected: "fohne" },
      { input: ["x", []], expected: "x" },
      { input: ["aa", [["a", "b"], ["bb", "c"]]], expected: "c" },
      { input: ["", [["a", "b"]]], expected: "" },
    ],
    hint: "Rules compose in order, so an earlier replacement can feed a later pattern.",
  },
  {
    id: "nlp-211",
    title: "Pause Count",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Count pauses: runs of consecutive silence flags (0) whose length reaches at least min_frames. A trailing run counts as well.\n\nAn empty flag list has no pauses.",
    starterCode: `def pause_count(vad_flags, min_frames):
    # Your code here
    pass`,
    solution: `def pause_count(vad_flags, min_frames):
    count = 0
    run = 0
    for f in vad_flags:
        if f == 0:
            run += 1
        else:
            if run >= min_frames:
                count += 1
            run = 0
    if run >= min_frames:
        count += 1
    return count`,
    testCases: [
      { input: [[1, 0, 0, 0, 1, 0], 2], expected: 1 },
      { input: [[0, 0, 0], 1], expected: 1 },
      { input: [[1, 1, 1], 1], expected: 0 },
      { input: [[], 1], expected: 0 },
      { input: [[0, 0, 1, 0, 0], 2], expected: 2 },
    ],
    hint: "Flush the current silence run when speech resumes and again after the loop.",
  },
  {
    id: "nlp-212",
    title: "Pitch Slope",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Return the least-squares slope of pitch values against frame index, ignoring unvoiced frames where the pitch is not positive.\n\nReturn 0.0 when fewer than two frames are voiced or the voiced indices have no variance.",
    starterCode: `def pitch_slope(pitches):
    # Your code here
    pass`,
    solution: `def pitch_slope(pitches):
    xs = []
    ys = []
    for i, p in enumerate(pitches):
        if p > 0:
            xs.append(float(i))
            ys.append(float(p))
    n = len(xs)
    if n < 2:
        return 0.0
    mx = sum(xs) / n
    my = sum(ys) / n
    num = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
    den = sum((x - mx) ** 2 for x in xs)
    if den == 0:
        return 0.0
    return num / den`,
    testCases: [
      { input: [[100, 110, 120]], expected: 10.0 },
      { input: [[0, 0, 100]], expected: 0.0 },
      { input: [[100, 0, 120]], expected: 10.0 },
      { input: [[]], expected: 0.0 },
      { input: [[5, 5, 5]], expected: 0.0 },
    ],
    hint: "Fit the slope against the original frame indices, skipping zeros.",
  },
  {
    id: "nlp-213",
    title: "Energy Contour",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the frame energy contour: the sum of squared samples for each frame.\n\nNegative samples square to positive energy, and an empty frame list gives an empty contour.",
    starterCode: `def energy_contour(frames):
    # Your code here
    pass`,
    solution: `def energy_contour(frames):
    return [sum(x * x for x in frame) for frame in frames]`,
    testCases: [
      { input: [[[1, 2], [3, 4]]], expected: [5, 25] },
      { input: [[[0]]], expected: [0] },
      { input: [[]], expected: [] },
      { input: [[[-1, -2]]], expected: [5] },
    ],
    hint: "Squaring removes sign and gives frame energy.",
  },
  {
    id: "nlp-214",
    title: "Formant Estimate (Lite)",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Estimate formants by picking local maxima of the magnitude spectrum. Index i is a peak when spectrum[i] is greater than its left neighbor and at least its right neighbor.\n\nTake the n highest peaks, breaking ties by frequency, and return their frequencies sorted ascending. Return an empty list when n is not positive or no peak exists.",
    starterCode: `def formant_estimate_lite(spectrum, freqs, n):
    # Your code here
    pass`,
    solution: `def formant_estimate_lite(spectrum, freqs, n):
    peaks = []
    for i in range(1, len(spectrum) - 1):
        if spectrum[i] > spectrum[i - 1] and spectrum[i] >= spectrum[i + 1]:
            peaks.append((spectrum[i], freqs[i]))
    peaks.sort(key=lambda p: (-p[0], p[1]))
    return sorted(p[1] for p in peaks[:n])`,
    testCases: [
      { input: [[1, 3, 2, 5, 4], [100, 200, 300, 400, 500], 2], expected: [200, 400] },
      { input: [[1, 2, 3], [10, 20, 30], 1], expected: [] },
      { input: [[5, 4, 3, 2], [10, 20, 30, 40], 2], expected: [] },
      { input: [[1, 5, 1, 5, 1], [10, 20, 30, 40, 50], 2], expected: [20, 40] },
      { input: [[1, 5, 1], [10, 20, 30], 0], expected: [] },
    ],
    hint: "Endpoints are never local maxima because they lack two neighbors.",
  },
  {
    id: "nlp-215",
    title: "Vocoder Frame Shift",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the vocoder frame shift in samples: sample_rate * hop_ms / 1000.\n\nA hop of 0 milliseconds gives 0.0 samples.",
    starterCode: `def vocoder_frame_shift(sample_rate, hop_ms):
    # Your code here
    pass`,
    solution: `def vocoder_frame_shift(sample_rate, hop_ms):
    return sample_rate * hop_ms / 1000`,
    testCases: [
      { input: [16000, 10], expected: 160.0 },
      { input: [22050, 5], expected: 110.25 },
      { input: [8000, 20], expected: 160.0 },
      { input: [16000, 0], expected: 0.0 },
    ],
    hint: "Convert milliseconds to seconds by dividing by 1000 before multiplying.",
  },
  {
    id: "nlp-216",
    title: "CIDEr-lite Caption Similarity",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the average CIDEr-lite score: for each reference, compute the cosine similarity between the candidate and reference unigram count vectors over their shared vocabulary, then average over references.\n\nReturn 0.0 when there are no references, and pairs with a zero-norm vector contribute 0.0.",
    starterCode: `def cider_lite(candidate, references):
    # Your code here
    pass`,
    solution: `def cider_lite(candidate, references):
    if not references:
        return 0.0

    def vector(tokens, vocab):
        counts = {}
        for t in tokens:
            counts[t] = counts.get(t, 0) + 1
        return [counts.get(w, 0) for w in vocab]

    total = 0.0
    for ref in references:
        vocab = sorted(set(candidate) | set(ref))
        if not vocab:
            continue
        cv = vector(candidate, vocab)
        rv = vector(ref, vocab)
        dot = sum(a * b for a, b in zip(cv, rv))
        nc = sum(a * a for a in cv) ** 0.5
        nr = sum(b * b for b in rv) ** 0.5
        if nc > 0 and nr > 0:
            total += dot / (nc * nr)
    return total / len(references)`,
    testCases: [
      { input: [["a", "b", "c"], [["a", "b", "c"]]], expected: 1.0000000000000002 },
      { input: [["a", "b"], [["a", "c"]]], expected: 0.4999999999999999 },
      { input: [["a"], [["b"], ["a"]]], expected: 0.5 },
      { input: [["a"], []], expected: 0.0 },
      { input: [[], [["a"]]], expected: 0.0 },
    ],
    hint: "Each reference is scored on its own shared vocabulary, then the scores are averaged.",
  },
  {
    id: "nlp-217",
    title: "Scene Graph Count",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return [number of unique objects, number of unique relations] for a scene graph given as [subject, relation, object] triples.\n\nObjects are the union of subjects and objects across all triples.",
    starterCode: `def scene_graph_count(triples):
    # Your code here
    pass`,
    solution: `def scene_graph_count(triples):
    objects = set()
    relations = set()
    for t in triples:
        objects.add(t[0])
        objects.add(t[2])
        relations.add(t[1])
    return [len(objects), len(relations)]`,
    testCases: [
      { input: [[["cat", "on", "mat"], ["cat", "chases", "mouse"]]], expected: [3, 2] },
      { input: [[]], expected: [0, 0] },
      { input: [[["a", "r", "a"]]], expected: [1, 1] },
      { input: [[["a", "r1", "b"], ["b", "r2", "c"]]], expected: [3, 2] },
    ],
    hint: "A node appearing as both subject and object is counted once.",
  },
  {
    id: "nlp-218",
    title: "VQA Accuracy",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the fraction of VQA predictions that match the gold answer after stripping whitespace and lowercasing.\n\nThe lists are zipped to the shorter length, and an empty gold list gives 0.0.",
    starterCode: `def vqa_accuracy(predictions, golds):
    # Your code here
    pass`,
    solution: `def vqa_accuracy(predictions, golds):
    if not golds:
        return 0.0
    n = min(len(predictions), len(golds))
    if n == 0:
        return 0.0
    correct = 0
    for i in range(n):
        if predictions[i].strip().lower() == golds[i].strip().lower():
            correct += 1
    return correct / n`,
    testCases: [
      { input: [["yes", "no", "blue"], ["yes", "yes", "Blue "]], expected: 0.6666666666666666 },
      { input: [[], []], expected: 0.0 },
      { input: [["a"], ["a", "b"]], expected: 1.0 },
      { input: [["A "], ["a"]], expected: 1.0 },
      { input: [["x"], ["y"]], expected: 0.0 },
    ],
    hint: "Normalize both sides with strip and lower before comparing.",
  },
  {
    id: "nlp-219",
    title: "Visual Grounding IoU",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the intersection-over-union of two boxes given as [x1, y1, x2, y2].\n\nClamp the intersection width and height at 0, and return 0.0 when the union area is 0.",
    starterCode: `def visual_grounding_iou(box_a, box_b):
    # Your code here
    pass`,
    solution: `def visual_grounding_iou(box_a, box_b):
    ix1 = max(box_a[0], box_b[0])
    iy1 = max(box_a[1], box_b[1])
    ix2 = min(box_a[2], box_b[2])
    iy2 = min(box_a[3], box_b[3])
    iw = max(0, ix2 - ix1)
    ih = max(0, iy2 - iy1)
    inter = iw * ih
    area_a = max(0, box_a[2] - box_a[0]) * max(0, box_a[3] - box_a[1])
    area_b = max(0, box_b[2] - box_b[0]) * max(0, box_b[3] - box_b[1])
    union = area_a + area_b - inter
    if union <= 0:
        return 0.0
    return inter / union`,
    testCases: [
      { input: [[0, 0, 2, 2], [0, 0, 2, 2]], expected: 1.0 },
      { input: [[0, 0, 2, 2], [1, 1, 3, 3]], expected: 0.14285714285714285 },
      { input: [[0, 0, 1, 1], [2, 2, 3, 3]], expected: 0.0 },
      { input: [[0, 0, 0, 0], [0, 0, 0, 0]], expected: 0.0 },
      { input: [[0, 0, 4, 4], [1, 1, 3, 3]], expected: 0.25 },
    ],
    hint: "Union is the sum of both areas minus the intersection.",
  },
  {
    id: "nlp-220",
    title: "Reading Order Check",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the indices of boxes sorted into reading order: by vertical center, then horizontal center, then original index.\n\nBoxes are [x1, y1, x2, y2], and an empty box list gives an empty order.",
    starterCode: `def reading_order_check(boxes):
    # Your code here
    pass`,
    solution: `def reading_order_check(boxes):
    return sorted(
        range(len(boxes)),
        key=lambda i: (
            (boxes[i][1] + boxes[i][3]) / 2,
            (boxes[i][0] + boxes[i][2]) / 2,
            i,
        ),
    )`,
    testCases: [
      { input: [[[0, 0, 10, 10], [20, 0, 30, 10], [0, 20, 10, 30], [20, 20, 30, 30]]], expected: [0, 1, 2, 3] },
      { input: [[[20, 20, 30, 30], [0, 0, 10, 10], [30, 0, 40, 10], [10, 20, 20, 30]]], expected: [1, 2, 3, 0] },
      { input: [[]], expected: [] },
      { input: [[[0, 0, 1, 1]]], expected: [0] },
    ],
    hint: "Compute box centers first, then sort with the composite key.",
  },
  {
    id: "nlp-221",
    title: "Table Cell F1",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Return the exact-match F1 over table cells given as [row, col, text] triples. A match requires row, column, and text to all be equal.\n\nDuplicates collapse into sets, precision is matches / predicted cells, recall is matches / gold cells, and F1 = 2PR/(P+R). Return 1.0 when both sets are empty and 0.0 when either is empty or there are no matches.",
    starterCode: `def table_cell_f1(predicted, gold):
    # Your code here
    pass`,
    solution: `def table_cell_f1(predicted, gold):
    p = set((c[0], c[1], c[2]) for c in predicted)
    g = set((c[0], c[1], c[2]) for c in gold)
    if not p and not g:
        return 1.0
    if not p or not g:
        return 0.0
    matches = len(p & g)
    if matches == 0:
        return 0.0
    precision = matches / len(p)
    recall = matches / len(g)
    return 2 * precision * recall / (precision + recall)`,
    testCases: [
      { input: [[[0, 0, "a"], [0, 1, "b"]], [[0, 0, "a"], [0, 1, "b"]]], expected: 1.0 },
      { input: [[[0, 0, "a"], [0, 1, "x"]], [[0, 0, "a"], [0, 1, "b"]]], expected: 0.5 },
      { input: [[], []], expected: 1.0 },
      { input: [[[0, 0, "a"]], []], expected: 0.0 },
      { input: [[[0, 0, "a"]], [[0, 0, "b"]]], expected: 0.0 },
    ],
    hint: "Cells at the same position but with different text do not match.",
  },
  {
    id: "nlp-222",
    title: "Layout Region Count",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return a dictionary counting how many regions of each label appear in the label list.\n\nAn empty label list gives an empty dictionary.",
    starterCode: `def layout_region_count(labels):
    # Your code here
    pass`,
    solution: `def layout_region_count(labels):
    counts = {}
    for l in labels:
        counts[l] = counts.get(l, 0) + 1
    return counts`,
    testCases: [
      { input: [["text", "title", "text"]], expected: { text: 2, title: 1 } },
      { input: [[]], expected: {} },
      { input: [["a"]], expected: { a: 1 } },
    ],
    hint: "Increment a dictionary entry per label occurrence.",
  },
  {
    id: "nlp-223",
    title: "Tool Selection Accuracy",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the fraction of examples where the highest-scoring tool matches the gold tool. tools[i] lists the candidate names and scores[i] the parallel scores.\n\nTies keep the earliest candidate, and an empty gold list gives 0.0.",
    starterCode: `def tool_selection_accuracy(tools, scores, gold):
    # Your code here
    pass`,
    solution: `def tool_selection_accuracy(tools, scores, gold):
    if not gold:
        return 0.0
    correct = 0
    for i in range(len(gold)):
        candidates = tools[i]
        values = scores[i]
        best = 0
        for j in range(1, len(values)):
            if values[j] > values[best]:
                best = j
        if candidates[best] == gold[i]:
            correct += 1
    return correct / len(gold)`,
    testCases: [
      {
        input: [
          [["search", "calc"], ["search", "calc"]],
          [[0.7, 0.3], [0.2, 0.8]],
          ["search", "calc"],
        ],
        expected: 1.0,
      },
      {
        input: [
          [["search", "calc"], ["search", "calc"]],
          [[0.7, 0.3], [0.2, 0.8]],
          ["calc", "calc"],
        ],
        expected: 0.5,
      },
      { input: [[], [], []], expected: 0.0 },
      { input: [[["a", "b"]], [[0.5, 0.5]], ["a"]], expected: 1.0 },
    ],
    hint: "Argmax per example, then compare with the gold tool name.",
  },
  {
    id: "nlp-224",
    title: "Tool Argument Schema Check",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Validate tool arguments against a schema mapping each field to 'string', 'number', or 'boolean'. Return a sorted list of problems: 'field:missing' for absent fields and 'field:type' for wrong types.\n\nBooleans do not count as numbers, and only the first problem per field is reported.",
    starterCode: `def tool_argument_schema_check(arguments, schema):
    # Your code here
    pass`,
    solution: `def tool_argument_schema_check(arguments, schema):
    problems = []
    for field in sorted(schema):
        if field not in arguments:
            problems.append(field + ":missing")
            continue
        expected = schema[field]
        value = arguments[field]
        if expected == "string" and not isinstance(value, str):
            problems.append(field + ":type")
        elif expected == "number" and (isinstance(value, bool) or not isinstance(value, (int, float))):
            problems.append(field + ":type")
        elif expected == "boolean" and not isinstance(value, bool):
            problems.append(field + ":type")
    return problems`,
    testCases: [
      { input: [{ q: "x" }, { q: "string" }], expected: [] },
      { input: [{}, { q: "string" }], expected: ["q:missing"] },
      { input: [{ q: 5 }, { q: "string" }], expected: ["q:type"] },
      { input: [{ q: "x", n: 2, f: true }, { n: "number", f: "boolean" }], expected: [] },
      { input: [{ n: true }, { n: "number" }], expected: ["n:type"] },
    ],
    hint: "Handle the missing case before inspecting the value type.",
  },
  {
    id: "nlp-225",
    title: "ReAct Step Parse",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Parse a ReAct step from text line by line. Lines starting with 'Thought:', 'Action:', and 'Action Input:' populate the corresponding keys, and later lines overwrite earlier ones.\n\nReturn a dictionary with keys thought, action, and action_input, each defaulting to an empty string.",
    starterCode: `def react_step_parse(text):
    # Your code here
    pass`,
    solution: `def react_step_parse(text):
    result = {"thought": "", "action": "", "action_input": ""}
    for line in text.splitlines():
        if line.startswith("Thought:"):
            result["thought"] = line[len("Thought:"):].strip()
        elif line.startswith("Action Input:"):
            result["action_input"] = line[len("Action Input:"):].strip()
        elif line.startswith("Action:"):
            result["action"] = line[len("Action:"):].strip()
    return result`,
    testCases: [
      {
        input: ["Thought: need info\nAction: search\nAction Input: cats"],
        expected: { thought: "need info", action: "search", action_input: "cats" },
      },
      {
        input: ["Action: finish"],
        expected: { thought: "", action: "finish", action_input: "" },
      },
      { input: [""], expected: { thought: "", action: "", action_input: "" } },
      {
        input: ["Thought: a\nThought: b"],
        expected: { thought: "b", action: "", action_input: "" },
      },
    ],
    hint: "splitlines avoids needing escape characters, and the last matching line wins.",
  },
  {
    id: "nlp-226",
    title: "Plan Validity",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Check a plan given as [step_id, [dependencies]] pairs. The plan is valid when every dependency refers to an earlier step id.\n\nReturn True or False, and treat an empty plan as valid.",
    starterCode: `def plan_validity(steps):
    # Your code here
    pass`,
    solution: `def plan_validity(steps):
    seen = set()
    for step in steps:
        for dep in step[1]:
            if dep not in seen:
                return False
        seen.add(step[0])
    return True`,
    testCases: [
      { input: [[["a", []], ["b", ["a"]]]], expected: true },
      { input: [[["a", ["b"]], ["b", []]]], expected: false },
      { input: [[["a", ["a"]]]], expected: false },
      { input: [[]], expected: true },
    ],
    hint: "Collect executed step ids as you scan forward and check each dependency against them.",
  },
  {
    id: "nlp-227",
    title: "Trajectory Success Rate",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the fraction of trajectories that succeeded.\n\nReturn 0.0 for an empty list.",
    starterCode: `def trajectory_success_rate(successes):
    # Your code here
    pass`,
    solution: `def trajectory_success_rate(successes):
    if not successes:
        return 0.0
    return sum(1 for s in successes if s) / len(successes)`,
    testCases: [
      { input: [[true, false, true]], expected: 0.6666666666666666 },
      { input: [[]], expected: 0.0 },
      { input: [[true]], expected: 1.0 },
      { input: [[false, false]], expected: 0.0 },
    ],
    hint: "Count the truthy flags and divide by the trajectory count.",
  },
  {
    id: "nlp-228",
    title: "Step Efficiency",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the average ratio of optimal to actual steps over trajectories, skipping any trajectory with a non-positive actual count.\n\nReturn 0.0 when no trajectory is usable.",
    starterCode: `def step_efficiency(optimal_steps, actual_steps):
    # Your code here
    pass`,
    solution: `def step_efficiency(optimal_steps, actual_steps):
    ratios = []
    for o, a in zip(optimal_steps, actual_steps):
        if a > 0:
            ratios.append(o / a)
    if not ratios:
        return 0.0
    return sum(ratios) / len(ratios)`,
    testCases: [
      { input: [[3, 4], [5, 8]], expected: 0.55 },
      { input: [[3], [0]], expected: 0.0 },
      { input: [[], []], expected: 0.0 },
      { input: [[1, 2], [2, 2]], expected: 0.75 },
    ],
    hint: "A perfect trajectory has ratio 1.0; longer trajectories lower the average.",
  },
  {
    id: "nlp-229",
    title: "Majority Vote",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the most frequent answer, breaking ties alphabetically.\n\nReturn an empty string for empty input.",
    starterCode: `def majority_vote(answers):
    # Your code here
    pass`,
    solution: `def majority_vote(answers):
    if not answers:
        return ""
    counts = {}
    for a in answers:
        counts[a] = counts.get(a, 0) + 1
    best = ""
    best_count = -1
    for a in sorted(counts):
        if counts[a] > best_count:
            best = a
            best_count = counts[a]
    return best`,
    testCases: [
      { input: [["a", "b", "a"]], expected: "a" },
      { input: [["a", "b"]], expected: "a" },
      { input: [[]], expected: "" },
      { input: [["b", "b", "a"]], expected: "b" },
    ],
    hint: "Iterate sorted keys and keep the first strict maximum.",
  },
  {
    id: "nlp-230",
    title: "Debate Outcome (Lite)",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Compare debate sides by score sums. Return 'pro' when the pro score sum exceeds the con sum, 'con' when it is lower, and 'tie' otherwise.\n\nEmpty lists sum to 0.",
    starterCode: `def debate_outcome_lite(pro_scores, con_scores):
    # Your code here
    pass`,
    solution: `def debate_outcome_lite(pro_scores, con_scores):
    pro = sum(pro_scores)
    con = sum(con_scores)
    if pro > con:
        return "pro"
    if con > pro:
        return "con"
    return "tie"`,
    testCases: [
      { input: [[1, 2], [0.5]], expected: "pro" },
      { input: [[0], [1]], expected: "con" },
      { input: [[1], [1]], expected: "tie" },
      { input: [[], []], expected: "tie" },
    ],
    hint: "Aggregate each side first, then compare the totals.",
  },
];

