import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "nlp-321",
    title: "Whitespace Token Count",
    category: "NLP",
    difficulty: "Easy",
    description:
      "The simplest tokenizer splits text on runs of whitespace.\n\nGiven a text string, return the number of whitespace-separated tokens.",
    starterCode: `def whitespace_token_count(text):
    # Your code here
    pass`,
    solution: `def whitespace_token_count(text):
    return len(text.split())`,
    testCases: [
      { input: ["hello world"], expected: 2 },
      { input: ["  a   b  "], expected: 2 },
      { input: [""], expected: 0 },
    ],
    hint: "Python's split with no arguments handles arbitrary whitespace runs.",
  },
  {
    id: "nlp-322",
    title: "Whitespace Tokenizer Lowercased",
    category: "NLP",
    difficulty: "Easy",
    description:
      "A common normalization pipeline lowercases text and splits on whitespace.\n\nGiven text, return the list of lowercased whitespace tokens.",
    starterCode: `def whitespace_tokenizer_lowercased(text):
    # Your code here
    pass`,
    solution: `def whitespace_tokenizer_lowercased(text):
    return [t.lower() for t in text.split()]`,
    testCases: [
      { input: ["Hello World"], expected: ["hello", "world"] },
      { input: ["A B C"], expected: ["a", "b", "c"] },
      { input: [""], expected: [] },
    ],
    hint: "Split first, then lower each token.",
  },
  {
    id: "nlp-323",
    title: "Regex Word Tokenizer Lite",
    category: "NLP",
    difficulty: "Medium",
    description:
      "A word tokenizer extracts maximal runs of letters and digits, discarding punctuation.\n\nGiven text, return the list of alphanumeric runs using a regular expression.",
    starterCode: `def regex_word_tokenizer_lite(text):
    # Your code here
    pass`,
    solution: `def regex_word_tokenizer_lite(text):
    import re
    return re.findall(r"[A-Za-z0-9]+", text)`,
    testCases: [
      { input: ["Hello, world!"], expected: ["Hello", "world"] },
      { input: ["a-b_c"], expected: ["a", "b", "c"] },
      { input: ["...123 abc..."], expected: ["123", "abc"] },
    ],
    hint: "One or more letters or digits per token.",
  },
  {
    id: "nlp-324",
    title: "Token Offsets from Whitespace",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Given text, return the [start, end) character offsets of each whitespace-separated token.\n\nGiven the text, return a list of [start, end] pairs in order.",
    starterCode: `def token_offsets_from_whitespace(text):
    # Your code here
    pass`,
    solution: `def token_offsets_from_whitespace(text):
    offsets = []
    start = None
    for i, ch in enumerate(text):
        if ch.isspace():
            if start is not None:
                offsets.append([start, i])
                start = None
        elif start is None:
            start = i
    if start is not None:
        offsets.append([start, len(text)])
    return offsets`,
    testCases: [
      { input: ["ab cd"], expected: [[0, 2], [3, 5]] },
      { input: ["a  b"], expected: [[0, 1], [3, 4]] },
      { input: [""], expected: [] },
    ],
    hint: "Track the start of each non-space run and close it at whitespace or the end.",
  },
  {
    id: "nlp-325",
    title: "Character Trigram Count",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Character trigrams are all length-3 substrings, including across word boundaries when spaces are preserved.\n\nGiven text and n = 3, return the number of trigrams (text length minus two, not below zero).",
    starterCode: `def character_trigram_count(text):
    # Your code here
    pass`,
    solution: `def character_trigram_count(text):
    return max(0, len(text) - 2)`,
    testCases: [
      { input: ["abcd"], expected: 2 },
      { input: ["ab"], expected: 0 },
      { input: ["hello"], expected: 3 },
    ],
    hint: "A string of length L has L - 2 trigrams when L >= 3.",
  },
  {
    id: "nlp-326",
    title: "Character Bigram Set Size",
    category: "NLP",
    difficulty: "Easy",
    description:
      "The set of character bigrams captures character-level overlap robust to word order.\n\nGiven text, return the number of distinct length-2 substrings.",
    starterCode: `def character_bigram_set_size(text):
    # Your code here
    pass`,
    solution: `def character_bigram_set_size(text):
    return len({text[i:i + 2] for i in range(len(text) - 1)})`,
    testCases: [
      { input: ["abab"], expected: 2 },
      { input: ["abc"], expected: 2 },
      { input: ["aa"], expected: 1 },
    ],
    hint: "Use a set to deduplicate the bigrams.",
  },
  {
    id: "nlp-327",
    title: "Digit Masking Tokenizer",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Masking digits before tokenization reduces vocabulary sparsity: every digit is replaced by the same placeholder character.\n\nGiven text, return the masked text with each digit replaced by '#'.",
    starterCode: `def digit_masking_tokenizer(text):
    # Your code here
    pass`,
    solution: `def digit_masking_tokenizer(text):
    return "".join("#" if ch.isdigit() else ch for ch in text)`,
    testCases: [
      { input: ["user42"], expected: "user##" },
      { input: ["2024-01-02"], expected: "####-##-##" },
      { input: ["no digits"], expected: "no digits" },
    ],
    hint: "Replace one character at a time.",
  },
  {
    id: "nlp-328",
    title: "Contraction Expansion Count",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Contraction expansion turns forms like \"don't\" into tokens [\"do\", \"not\"] using a fixed table for \"don't\", \"can't\", \"won't\", \"i'm\", and \"it's\".\n\nGiven a whitespace-tokenized sentence, return the expanded token list lowercased.",
    starterCode: `def contraction_expansion_count(tokens):
    # Your code here
    pass`,
    solution: `def contraction_expansion_count(tokens):
    table = {"don't": ["do", "not"], "can't": ["can", "not"], "won't": ["will", "not"], "i'm": ["i", "am"], "it's": ["it", "is"]}
    out = []
    for t in tokens:
        low = t.lower()
        if low in table:
            out.extend(table[low])
        else:
            out.append(low)
    return out`,
    testCases: [
      { input: [["I'm", "sure"]], expected: ["i", "am", "sure"] },
      { input: [["don't", "won't"]], expected: ["do", "not", "will", "not"] },
      { input: [["can't", "stop"]], expected: ["can", "not", "stop"] },
    ],
    hint: "Map known contractions and pass everything else through lowercased.",
  },
  {
    id: "nlp-329",
    title: "Camel Case Split Tokenizer",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Camel-case splitting inserts a boundary before each uppercase letter that follows a lowercase letter or digit, and before an uppercase letter followed by lowercase when it follows another uppercase.\n\nGiven a camelCase or PascalCase identifier, return the lowercased word list.",
    starterCode: `def camel_case_split_tokenizer(identifier):
    # Your code here
    pass`,
    solution: `def camel_case_split_tokenizer(identifier):
    words = []
    current = ""
    for i, ch in enumerate(identifier):
        if ch.isupper() and current and (identifier[i - 1].islower() or identifier[i - 1].isdigit() or (i + 1 < len(identifier) and identifier[i + 1].islower())):
            words.append(current.lower())
            current = ch
        else:
            current += ch
    if current:
        words.append(current.lower())
    return words`,
    testCases: [
      { input: ["camelCaseText"], expected: ["camel", "case", "text"] },
      { input: ["HTTPServer"], expected: ["http", "server"] },
      { input: ["already"], expected: ["already"] },
    ],
    hint: "Track the current run and flush it at boundaries; treat acronym-to-word transitions correctly.",
  },
  {
    id: "nlp-330",
    title: "Stopword Removal Order Preserved",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Stopword removal filters tokens in place without reordering the remaining terms.\n\nGiven tokens and a stopword list, return the tokens not in the stopword set, preserving order.",
    starterCode: `def stopword_removal_order_preserved(tokens, stopwords):
    # Your code here
    pass`,
    solution: `def stopword_removal_order_preserved(tokens, stopwords):
    stop = set(stopwords)
    return [t for t in tokens if t not in stop]`,
    testCases: [
      { input: [["the", "cat", "sat"], ["the"]], expected: ["cat", "sat"] },
      { input: [["a", "b", "c"], ["a", "c"]], expected: ["b"] },
      { input: [["x"], []], expected: ["x"] },
    ],
    hint: "Build a set for O(1) membership tests.",
  },
  {
    id: "nlp-331",
    title: "Vocabulary Size of Tokens",
    category: "NLP",
    difficulty: "Easy",
    description:
      "The vocabulary size is the number of distinct tokens.\n\nGiven the token list, return the size of the vocabulary.",
    starterCode: `def vocabulary_size_of_tokens(tokens):
    # Your code here
    pass`,
    solution: `def vocabulary_size_of_tokens(tokens):
    return len(set(tokens))`,
    testCases: [
      { input: [["a", "b", "a"]], expected: 2 },
      { input: [["x"]], expected: 1 },
      { input: [[]], expected: 0 },
    ],
    hint: "Deduplicate with a set.",
  },
  {
    id: "nlp-332",
    title: "Type Token Ratio",
    category: "NLP",
    difficulty: "Medium",
    description:
      "The type-token ratio is the number of distinct types divided by the total number of tokens, a basic lexical diversity measure.\n\nGiven the token list, return the ratio, or 0.0 for an empty list.",
    starterCode: `def type_token_ratio(tokens):
    # Your code here
    pass`,
    solution: `def type_token_ratio(tokens):
    if not tokens:
        return 0.0
    return len(set(tokens)) / len(tokens)`,
    testCases: [
      { input: [["a", "b", "a"]], expected: 0.6666666666666666 },
      { input: [["x", "y", "z"]], expected: 1.0 },
      { input: [[]], expected: 0.0 },
    ],
    hint: "Types over tokens.",
  },
  {
    id: "nlp-333",
    title: "Hapax Legomena Ratio",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Hapax legomena are tokens appearing exactly once. The hapax ratio is the count of such token types divided by the number of types.\n\nGiven the token list, return the ratio, or 0.0 when empty.",
    starterCode: `def hapax_legomena_ratio(tokens):
    # Your code here
    pass`,
    solution: `def hapax_legomena_ratio(tokens):
    if not tokens:
        return 0.0
    counts = {}
    for t in tokens:
        counts[t] = counts.get(t, 0) + 1
    types = len(counts)
    hapax = sum(1 for c in counts.values() if c == 1)
    return hapax / types`,
    testCases: [
      { input: [["a", "b", "b", "c"]], expected: 0.6666666666666666 },
      { input: [["a", "a", "a"]], expected: 0.0 },
      { input: [["x", "y", "x", "y"]], expected: 0.0 },
    ],
    hint: "Count token frequencies first, then compare the number of singletons to the vocabulary size.",
  },
  {
    id: "nlp-334",
    title: "Most Frequent Token Tiebreak",
    category: "NLP",
    difficulty: "Easy",
    description:
      "The most frequent token is the mode; on ties, prefer the token that appears first in the text (stable selection).\n\nGiven the token list, return the most frequent token, or None for an empty list.",
    starterCode: `def most_frequent_token_tiebreak(tokens):
    # Your code here
    pass`,
    solution: `def most_frequent_token_tiebreak(tokens):
    if not tokens:
        return None
    counts = {}
    best = tokens[0]
    for t in tokens:
        counts[t] = counts.get(t, 0) + 1
        if counts[t] > counts[best]:
            best = t
    return best`,
    testCases: [
      { input: [["a", "b", "b", "a"]], expected: "b" },
      { input: [["x", "y"]], expected: "x" },
      { input: [[]], expected: null },
    ],
    hint: "Update the best token only on a strict improvement.",
  },
  {
    id: "nlp-335",
    title: "Top K Frequent Tokens",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the k most frequent tokens sorted by count descending, with ties broken lexicographically ascending.\n\nGiven the tokens and k, return the list of up to k tokens.",
    starterCode: `def top_k_frequent_tokens(tokens, k):
    # Your code here
    pass`,
    solution: `def top_k_frequent_tokens(tokens, k):
    counts = {}
    for t in tokens:
        counts[t] = counts.get(t, 0) + 1
    ranked = sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))
    return [t for t, c in ranked[:k]]`,
    testCases: [
      { input: [["b", "a", "b", "c", "a", "a"], 2], expected: ["a", "b"] },
      { input: [["x", "y", "z"], 5], expected: ["x", "y", "z"] },
      { input: [["q"], 0], expected: [] },
    ],
    hint: "Negate the count for descending order and sort the vocabulary keys alphabetically for ties.",
  },
  {
    id: "nlp-336",
    title: "One Hot Encoding Matrix",
    category: "NLP",
    difficulty: "Medium",
    description:
      "One-hot encoding maps each token to a unit vector over the vocabulary in the given order.\n\nGiven the vocabulary and a token list, return the matrix of one-hot rows.",
    starterCode: `def one_hot_encoding_matrix(vocab, tokens):
    # Your code here
    pass`,
    solution: `def one_hot_encoding_matrix(vocab, tokens):
    index = {t: i for i, t in enumerate(vocab)}
    rows = []
    for t in tokens:
        row = [0] * len(vocab)
        row[index[t]] = 1
        rows.append(row)
    return rows`,
    testCases: [
      { input: [["a", "b"], ["a", "b", "a"]], expected: [[1, 0], [0, 1], [1, 0]] },
      { input: [["x"], ["x"]], expected: [[1]] },
      { input: [["p", "q"], []], expected: [] },
    ],
    hint: "Build an index map from the vocabulary.",
  },
  {
    id: "nlp-337",
    title: "Bag of Words Vector",
    category: "NLP",
    difficulty: "Easy",
    description:
      "The bag-of-words vector counts token occurrences against a fixed vocabulary, ignoring order.\n\nGiven the vocabulary and tokens, return the count vector.",
    starterCode: `def bag_of_words_vector(vocab, tokens):
    # Your code here
    pass`,
    solution: `def bag_of_words_vector(vocab, tokens):
    index = {t: i for i, t in enumerate(vocab)}
    vector = [0] * len(vocab)
    for t in tokens:
        if t in index:
            vector[index[t]] += 1
    return vector`,
    testCases: [
      { input: [["a", "b", "c"], ["a", "a", "c"]], expected: [2, 0, 1] },
      { input: [["x"], ["x", "x", "x"]], expected: [3] },
      { input: [["m"], []], expected: [0] },
    ],
    hint: "Out-of-vocabulary tokens are ignored.",
  },
  {
    id: "nlp-338",
    title: "Binary Bag of Words Vector",
    category: "NLP",
    difficulty: "Medium",
    description:
      "The binary bag-of-words representation marks presence rather than counts.\n\nGiven the vocabulary and tokens, return a 0/1 vector.",
    starterCode: `def binary_bag_of_words_vector(vocab, tokens):
    # Your code here
    pass`,
    solution: `def binary_bag_of_words_vector(vocab, tokens):
    index = {t: i for i, t in enumerate(vocab)}
    vector = [0] * len(vocab)
    for t in tokens:
        if t in index:
            vector[index[t]] = 1
    return vector`,
    testCases: [
      { input: [["a", "b", "c"], ["a", "a", "c"]], expected: [1, 0, 1] },
      { input: [["x", "y"], ["y"]], expected: [0, 1] },
      { input: [["m"], []], expected: [0] },
    ],
    hint: "Set the position instead of incrementing.",
  },
  {
    id: "nlp-339",
    title: "Hashing Trick Bucket Counts",
    category: "NLP",
    difficulty: "Hard",
    description:
      "The hashing trick maps tokens to buckets with a deterministic polynomial hash: bucket = (sum over characters of (index + 1) * ord(ch)) mod n_buckets.\n\nGiven the tokens and the number of buckets, return the count vector.",
    starterCode: `def hashing_trick_bucket_counts(tokens, n_buckets):
    # Your code here
    pass`,
    solution: `def hashing_trick_bucket_counts(tokens, n_buckets):
    vector = [0] * n_buckets
    for t in tokens:
        h = 0
        for i, ch in enumerate(t):
            h += (i + 1) * ord(ch)
        vector[h % n_buckets] += 1
    return vector`,
    testCases: [
      { input: [["ab"], 10], expected: [0, 0, 0, 1, 0, 0, 0, 0, 0, 0] },
      { input: [["a", "a"], 3], expected: [0, 2, 0] },
      { input: [[], 4], expected: [0, 0, 0, 0] },
    ],
    hint: "Accumulate the position-weighted character codes before taking the modulus.",
  },
  {
    id: "nlp-340",
    title: "Vocabulary Minimum Frequency Filter",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Vocabulary pruning keeps only tokens whose count reaches a minimum frequency.\n\nGiven tokens and the minimum frequency, return the sorted list of kept token types.",
    starterCode: `def vocabulary_minimum_frequency_filter(tokens, min_freq):
    # Your code here
    pass`,
    solution: `def vocabulary_minimum_frequency_filter(tokens, min_freq):
    counts = {}
    for t in tokens:
        counts[t] = counts.get(t, 0) + 1
    return sorted(t for t, c in counts.items() if c >= min_freq)`,
    testCases: [
      { input: [["a", "b", "a", "b", "a"], 2], expected: ["a", "b"] },
      { input: [["x", "y"], 2], expected: [] },
      { input: [["q"], 0], expected: ["q"] },
    ],
    hint: "Count first, then filter and sort the survivors.",
  },
];
