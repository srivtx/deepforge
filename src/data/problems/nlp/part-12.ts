import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "nlp-381",
    title: "Greedy Decode Argmax Index",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Greedy decoding picks the token with the highest score, breaking ties toward the smallest index.\n\nGiven the score list, return the chosen index.",
    starterCode: `def greedy_argmax_decode(scores):
    # Your code here
    pass`,
    solution: `def greedy_argmax_decode(scores):
    best = 0
    for i in range(1, len(scores)):
        if scores[i] > scores[best]:
            best = i
    return best`,
    testCases: [
      { input: [[0.1, 0.5, 0.4]], expected: 1 },
      { input: [[1.0, 1.0, 1.0]], expected: 0 },
      { input: [[-1.0, -2.0]], expected: 0 },
    ],
    hint: "Use a strict comparison to keep the earliest index on ties.",
  },
  {
    id: "nlp-382",
    title: "Top K Token Indices",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the indices of the k highest scores, sorted by score descending with ties broken by index ascending.\n\nGiven the scores and k, return the index list (at most k entries).",
    starterCode: `def top_k_token_indices(scores, k):
    # Your code here
    pass`,
    solution: `def top_k_token_indices(scores, k):
    order = sorted(range(len(scores)), key=lambda i: (-scores[i], i))
    return order[:k]`,
    testCases: [
      { input: [[0.1, 0.9, 0.5], 2], expected: [1, 2] },
      { input: [[1.0, 0.5, 1.0], 2], expected: [0, 2] },
      { input: [[0.2], 3], expected: [0] },
    ],
    hint: "Sort with a tuple key that negates the score for descending order.",
  },
  {
    id: "nlp-383",
    title: "Top P Nucleus Filter Mask",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Nucleus sampling keeps the smallest set of tokens whose cumulative probability reaches p, processing tokens in probability-descending order with ties broken by index. Return a 0/1 mask in the original index order.\n\nGiven the probabilities and p, return the mask.",
    starterCode: `def top_p_nucleus_filter_mask(probs, p):
    # Your code here
    pass`,
    solution: `def top_p_nucleus_filter_mask(probs, p):
    order = sorted(range(len(probs)), key=lambda i: (-probs[i], i))
    mask = [0] * len(probs)
    cumulative = 0.0
    for i in order:
        mask[i] = 1
        cumulative += probs[i]
        if cumulative >= p:
            break
    return mask`,
    testCases: [
      { input: [[0.5, 0.3, 0.2], 0.8], expected: [1, 1, 0] },
      { input: [[0.5, 0.3, 0.2], 0.99], expected: [1, 1, 1] },
      { input: [[1.0], 0.5], expected: [1] },
    ],
    hint: "Add tokens until the running mass first reaches p.",
  },
  {
    id: "nlp-384",
    title: "Temperature Softmax Probabilities",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Sampling temperature rescales logits before softmax: p = softmax(logits / T).\n\nGiven the logits and temperature T > 0, return the probabilities computed stably.",
    starterCode: `def temperature_softmax_probabilities(logits, temperature):
    # Your code here
    pass`,
    solution: `def temperature_softmax_probabilities(logits, temperature):
    import math
    scaled = [v / temperature for v in logits]
    m = max(scaled)
    e = [math.exp(v - m) for v in scaled]
    total = sum(e)
    return [v / total for v in e]`,
    testCases: [
      { input: [[1, 2, 3], 1.0], expected: [0.09003057317038046, 0.24472847105479764, 0.6652409557748218] },
      { input: [[1, 2, 3], 2.0], expected: [0.1863237232258476, 0.3071958857184984, 0.506480391055654] },
      { input: [[0, 0], 0.5], expected: [0.5, 0.5] },
    ],
    hint: "Low temperature sharpens, high temperature flattens.",
  },
  {
    id: "nlp-385",
    title: "Repetition Penalty Apply",
    category: "NLP",
    difficulty: "Medium",
    description:
      "The repetition penalty divides positive logits by the penalty and multiplies negative logits by it, pushing repeated tokens down either way.\n\nGiven the logits and the penalty > 0, return the adjusted logits.",
    starterCode: `def repetition_penalty_apply(logits, penalty):
    # Your code here
    pass`,
    solution: `def repetition_penalty_apply(logits, penalty):
    return [v / penalty if v > 0 else v * penalty for v in logits]`,
    testCases: [
      { input: [[1.0, -1.0], 2.0], expected: [0.5, -2.0] },
      { input: [[0.0, 0.5], 1.5], expected: [0.0, 0.3333333333333333] },
      { input: [[2.0, -2.0], 1.0], expected: [2.0, -2.0] },
    ],
    hint: "The penalty acts in the direction that lowers the token.",
  },
  {
    id: "nlp-386",
    title: "Beam Score Length Normalization",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Length-normalized beam scoring divides the cumulative log probability by length^alpha.\n\nGiven the log probability, the sequence length, and alpha, return the normalized score.",
    starterCode: `def beam_score_length_normalization(logprob, length, alpha):
    # Your code here
    pass`,
    solution: `def beam_score_length_normalization(logprob, length, alpha):
    return logprob / (length ** alpha)`,
    testCases: [
      { input: [-2.0, 4, 1.0], expected: -0.5 },
      { input: [-6.0, 3, 0.5], expected: -3.464101615137755 },
      { input: [0.0, 1, 2.0], expected: 0.0 },
    ],
    hint: "Alpha equal to one is the plain average log probability.",
  },
  {
    id: "nlp-387",
    title: "Length Normalized Beam Selection",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Each beam candidate has a cumulative log probability and a length. Normalize each score as logprob / length^alpha and return the index of the best candidate, breaking ties toward the earliest index.\n\nGiven candidates as [logprob, length] rows and alpha, return the index.",
    starterCode: `def length_normalized_beam_selection(candidates, alpha):
    # Your code here
    pass`,
    solution: `def length_normalized_beam_selection(candidates, alpha):
    best = 0
    best_score = None
    for i, (logprob, length) in enumerate(candidates):
        score = logprob / (length ** alpha)
        if best_score is None or score > best_score:
            best_score = score
            best = i
    return best`,
    testCases: [
      { input: [[[-2.0, 4], [-3.0, 3]], 1.0], expected: 0 },
      { input: [[[-1.0, 2], [-1.0, 2]], 0.5], expected: 0 },
      { input: [[[-5.0, 1], [-4.0, 2]], 1.0], expected: 1 },
    ],
    hint: "Compare the normalized scores rather than raw log probabilities.",
  },
  {
    id: "nlp-388",
    title: "BLEU Clipped Unigram Precision",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Clipped unigram precision counts each candidate token at most as many times as it appears in the reference, then divides by the candidate length.\n\nGiven the candidate tokens and reference tokens, return the precision.",
    starterCode: `def bleu_clipped_unigram_precision(candidate, reference):
    # Your code here
    pass`,
    solution: `def bleu_clipped_unigram_precision(candidate, reference):
    if not candidate:
        return 0.0
    ref_counts = {}
    for t in reference:
        ref_counts[t] = ref_counts.get(t, 0) + 1
    matched = 0
    used = {}
    for t in candidate:
        c = used.get(t, 0) + 1
        used[t] = c
        if c <= ref_counts.get(t, 0):
            matched += 1
    return matched / len(candidate)`,
    testCases: [
      { input: [["a", "b", "a"], ["a", "b"]], expected: 0.6666666666666666 },
      { input: [["x"], ["y"]], expected: 0.0 },
      { input: [["a", "a"], ["a", "a"]], expected: 1.0 },
    ],
    hint: "Clip each candidate token count against the reference count.",
  },
  {
    id: "nlp-389",
    title: "BLEU Brevity Penalty Value",
    category: "NLP",
    difficulty: "Easy",
    description:
      "The BLEU brevity penalty is 1 when the candidate is at least as long as the reference and exp(1 - reference_length / candidate_length) otherwise.\n\nGiven the candidate and reference lengths, return the penalty.",
    starterCode: `def bleu_brevity_penalty_value(candidate_length, reference_length):
    # Your code here
    pass`,
    solution: `def bleu_brevity_penalty_value(candidate_length, reference_length):
    import math
    if candidate_length >= reference_length:
        return 1.0
    return math.exp(1.0 - reference_length / candidate_length)`,
    testCases: [
      { input: [10, 10], expected: 1.0 },
      { input: [5, 10], expected: 0.36787944117144233 },
      { input: [12, 8], expected: 1.0 },
    ],
    hint: "Short candidates are penalized exponentially.",
  },
  {
    id: "nlp-390",
    title: "ROUGE-L LCS Token Length",
    category: "NLP",
    difficulty: "Medium",
    description:
      "ROUGE-L is built on the longest common subsequence. Compute its length with dynamic programming over token sequences.\n\nGiven the candidate tokens and reference tokens, return the LCS length.",
    starterCode: `def rouge_l_lcs_length(candidate, reference):
    # Your code here
    pass`,
    solution: `def rouge_l_lcs_length(candidate, reference):
    n, m = len(candidate), len(reference)
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if candidate[i - 1] == reference[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[n][m]`,
    testCases: [
      { input: [["a", "b", "c"], ["a", "c"]], expected: 2 },
      { input: [["x", "y"], ["y", "x"]], expected: 1 },
      { input: [["p"], []], expected: 0 },
    ],
    hint: "Match or skip at every cell of the DP table.",
  },
  {
    id: "nlp-391",
    title: "Exact Match After Normalization",
    category: "NLP",
    difficulty: "Hard",
    description:
      "QA exact match compares lowercased strings after removing punctuation, collapsing whitespace runs, and stripping ends.\n\nGiven the two strings, return True when they match under this normalization.",
    starterCode: `def exact_match_after_normalization(a, b):
    # Your code here
    pass`,
    solution: `def exact_match_after_normalization(a, b):
    def normalize(s):
        lowered = s.lower()
        cleaned = "".join(ch if ch.isalnum() or ch.isspace() else " " for ch in lowered)
        return " ".join(cleaned.split())
    return normalize(a) == normalize(b)`,
    testCases: [
      { input: ["The Cat!", "the cat"], expected: true },
      { input: ["a-b", "a b"], expected: true },
      { input: ["Hello", "world"], expected: false },
    ],
    hint: "Normalize both sides with identical steps before comparing.",
  },
  {
    id: "nlp-392",
    title: "Token Level Precision Generation",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Generation precision is the multiset overlap divided by the number of predicted tokens; return 0.0 when empty.\n\nGiven predicted and reference tokens, return the precision.",
    starterCode: `def token_level_precision_generation(predicted, reference):
    # Your code here
    pass`,
    solution: `def token_level_precision_generation(predicted, reference):
    if not predicted:
        return 0.0
    pred_counts = {}
    for t in predicted:
        pred_counts[t] = pred_counts.get(t, 0) + 1
    ref_counts = {}
    for t in reference:
        ref_counts[t] = ref_counts.get(t, 0) + 1
    matched = sum(min(c, ref_counts.get(t, 0)) for t, c in pred_counts.items())
    return matched / len(predicted)`,
    testCases: [
      { input: [["a", "b"], ["a", "b", "c"]], expected: 1.0 },
      { input: [["x"], ["y"]], expected: 0.0 },
      { input: [[], ["a"]], expected: 0.0 },
    ],
    hint: "Count matched multiplicities before dividing by the prediction length.",
  },
  {
    id: "nlp-393",
    title: "Token Level Recall Generation",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Generation recall is the multiset overlap divided by the number of reference tokens; return 0.0 when empty.\n\nGiven predicted and reference tokens, return the recall.",
    starterCode: `def token_level_recall_generation(predicted, reference):
    # Your code here
    pass`,
    solution: `def token_level_recall_generation(predicted, reference):
    if not reference:
        return 0.0
    pred_counts = {}
    for t in predicted:
        pred_counts[t] = pred_counts.get(t, 0) + 1
    ref_counts = {}
    for t in reference:
        ref_counts[t] = ref_counts.get(t, 0) + 1
    matched = sum(min(c, pred_counts.get(t, 0)) for t, c in ref_counts.items())
    return matched / len(reference)`,
    testCases: [
      { input: [["a", "b", "c"], ["a", "b"]], expected: 1.0 },
      { input: [["x"], ["y"]], expected: 0.0 },
      { input: [["a"], []], expected: 0.0 },
    ],
    hint: "Divide the overlap by the reference size.",
  },
  {
    id: "nlp-394",
    title: "METEOR Weighted F Mean",
    category: "NLP",
    difficulty: "Medium",
    description:
      "The METEOR-lite score combines precision and recall as a weighted harmonic mean: P R / (alpha P + (1 - alpha) R).\n\nGiven alpha, precision, and recall, return the score; return 0.0 when the denominator is zero.",
    starterCode: `def meteor_weighted_f_mean(alpha, precision, recall):
    # Your code here
    pass`,
    solution: `def meteor_weighted_f_mean(alpha, precision, recall):
    den = alpha * precision + (1.0 - alpha) * recall
    if den == 0.0:
        return 0.0
    return precision * recall / den`,
    testCases: [
      { input: [0.9, 0.8, 0.6], expected: 0.6153846153846153 },
      { input: [0.5, 0.5, 0.5], expected: 0.5 },
      { input: [0.9, 0.0, 0.0], expected: 0.0 },
    ],
    hint: "Recall is weighted more heavily for alpha near one.",
  },
  {
    id: "nlp-395",
    title: "Porter Step One A Plural Stripping",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Porter step 1a strips plurals: replace a trailing \"sses\" with \"ss\", a trailing \"ies\" with \"i\", keep a trailing \"ss\", and otherwise drop a trailing \"s\".\n\nGiven a word, return the stemmed result.",
    starterCode: `def porter_step_one_a_plural_stripping(word):
    # Your code here
    pass`,
    solution: `def porter_step_one_a_plural_stripping(word):
    if word.endswith("sses"):
        return word[:-2]
    if word.endswith("ies"):
        return word[:-2]
    if word.endswith("ss"):
        return word
    if word.endswith("s"):
        return word[:-1]
    return word`,
    testCases: [
      { input: ["caresses"], expected: "caress" },
      { input: ["ponies"], expected: "poni" },
      { input: ["gas"], expected: "ga" },
    ],
    hint: "Check the longest suffixes first.",
  },
  {
    id: "nlp-396",
    title: "Porter Step One B Ed Ing Stripping",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Porter step 1b removes a trailing \"ed\" or \"ing\" only when the remaining stem contains a vowel; a trailing \"eed\" becomes \"ee\" when the stem before it is nonempty and contains a vowel.\n\nGiven a word, return the result of one pass of these rules.",
    starterCode: `def porter_step_one_b_ed_ing_stripping(word):
    # Your code here
    pass`,
    solution: `def porter_step_one_b_ed_ing_stripping(word):
    def has_vowel(s):
        return any(ch in "aeiou" for ch in s)
    if word.endswith("eed"):
        stem = word[:-3]
        if stem and has_vowel(stem):
            return stem + "ee"
        return word
    for suffix in ("ed", "ing"):
        if word.endswith(suffix):
            stem = word[:-len(suffix)]
            if stem and has_vowel(stem):
                return stem
            return word
    return word`,
    testCases: [
      { input: ["agreed"], expected: "agree" },
      { input: ["plastered"], expected: "plaster" },
      { input: ["sing"], expected: "sing" },
    ],
    hint: "The removed suffix leaves a stem; only vowel-bearing stems trigger removal.",
  },
  {
    id: "nlp-397",
    title: "Syllable Estimate Vowel Groups",
    category: "NLP",
    difficulty: "Easy",
    description:
      "A common heuristic counts runs of vowels (a, e, i, o, u, y), then subtracts one for a silent trailing \"e\", with a minimum of one syllable.\n\nGiven a lowercase word, return the syllable estimate.",
    starterCode: `def syllable_estimate_vowel_groups(word):
    # Your code here
    pass`,
    solution: `def syllable_estimate_vowel_groups(word):
    vowels = set("aeiouy")
    groups = 0
    prev = False
    for ch in word:
        is_v = ch in vowels
        if is_v and not prev:
            groups += 1
        prev = is_v
    if word.endswith("e") and groups > 1:
        groups -= 1
    return max(1, groups)`,
    testCases: [
      { input: ["hello"], expected: 2 },
      { input: ["cake"], expected: 1 },
      { input: ["rhythm"], expected: 1 },
    ],
    hint: "Count groups first, then handle the silent e.",
  },
  {
    id: "nlp-398",
    title: "Soundex Code Generation",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Soundex maps a name to its first letter plus digits for the consonant groups (BFPV=1, CGJKQSXZ=2, DT=3, L=4, MN=5, R=6), skipping vowels and H/W/Y, merging adjacent equal codes, and zero-padding to length four.\n\nGiven a name, return its four-character Soundex code.",
    starterCode: `def soundex_code_generation(name):
    # Your code here
    pass`,
    solution: `def soundex_code_generation(name):
    mapping = {}
    for letters, digit in (("bfpv", "1"), ("cgjkqsxz", "2"), ("dt", "3"), ("l", "4"), ("mn", "5"), ("r", "6")):
        for ch in letters:
            mapping[ch] = digit
    letters_only = [ch.lower() for ch in name if ch.isalpha()]
    if not letters_only:
        return ""
    code = letters_only[0].upper()
    previous = mapping.get(letters_only[0], "")
    for ch in letters_only[1:]:
        digit = mapping.get(ch, "")
        if digit and digit != previous:
            code += digit
        if ch not in "hw":
            previous = digit if digit else ""
        if len(code) == 4:
            break
    return (code + "000")[:4]`,
    testCases: [
      { input: ["Robert"], expected: "R163" },
      { input: ["Rupert"], expected: "R163" },
      { input: ["Ashcraft"], expected: "A261" },
    ],
    hint: "Merge repeated codes and let H/W fail to reset the previous code.",
  },
  {
    id: "nlp-399",
    title: "Abbreviation Detection Heuristic",
    category: "NLP",
    difficulty: "Easy",
    description:
      "A token looks like an abbreviation when it is all uppercase with at least two letters, or a dotted uppercase pattern such as \"U.S.\".\n\nGiven the token list, return the tokens matching this heuristic in order.",
    starterCode: `def abbreviation_detection_heuristic(tokens):
    # Your code here
    pass`,
    solution: `def abbreviation_detection_heuristic(tokens):
    out = []
    for t in tokens:
        core = t.rstrip(".")
        if len(core) >= 2 and core.isupper() and all(ch.isalpha() or ch == "." for ch in core):
            out.append(t)
    return out`,
    testCases: [
      { input: [["NASA", "and", "U.S."]], expected: ["NASA", "U.S."] },
      { input: [["hello", "A"]], expected: [] },
      { input: [["AI", "ML"]], expected: ["AI", "ML"] },
    ],
    hint: "Strip trailing periods before checking case and content.",
  },
  {
    id: "nlp-400",
    title: "Punctuation Run Collapse",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Collapse runs of the same punctuation character into a single character, for example \"!!\" becomes \"!\".\n\nGiven text, return the collapsed text.",
    starterCode: `def punctuation_run_collapse(text):
    # Your code here
    pass`,
    solution: `def punctuation_run_collapse(text):
    out = []
    for ch in text:
        if out and ch == out[-1] and not ch.isalnum() and not ch.isspace():
            continue
        out.append(ch)
    return "".join(out)`,
    testCases: [
      { input: ["Wow!!!"], expected: "Wow!" },
      { input: ["a...b"], expected: "a.b" },
      { input: ["no punctuation"], expected: "no punctuation" },
    ],
    hint: "Skip a character when it repeats the previous punctuation character.",
  },
];
