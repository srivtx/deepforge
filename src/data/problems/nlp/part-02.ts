import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "nlp-006",
    title: "Punctuation-Stripping Tokenizer",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Lowercase text, split on whitespace, then strip leading and trailing punctuation from each token using string.punctuation.\n\nTokens that become empty are dropped. Internal punctuation such as apostrophes and hyphens is preserved, so don't stays don't and well-known stays intact.",
    starterCode: `import string
def strip_punctuation_tokenize(text):
    # Your code here
    pass`,
    solution: `import string
def strip_punctuation_tokenize(text):
    result = []
    for token in text.lower().split():
        cleaned = token.strip(string.punctuation)
        if cleaned:
            result.append(cleaned)
    return result`,
    testCases: [
      { input: ["Hello, World!"], expected: ["hello", "world"] },
      { input: ["Don't stop - now!"], expected: ["don't", "stop", "now"] },
      { input: ["well-known fact"], expected: ["well-known", "fact"] },
      { input: ["..."], expected: [] },
      { input: [""], expected: [] },
    ],
    hint: "str.strip removes any characters from the given set at both ends only.",
  },
  {
    id: "nlp-007",
    title: "Whitespace Tokenizer with Offsets",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return a list of [token, start, end] triples for every whitespace-separated token in text. start is the index of the token's first character and end is one past its last character.\n\nOriginal casing and punctuation are preserved. Return an empty list for empty or all-whitespace text.",
    starterCode: `def whitespace_tokenize_offsets(text):
    # Your code here
    pass`,
    solution: `def whitespace_tokenize_offsets(text):
    result = []
    i = 0
    n = len(text)
    while i < n:
        if text[i].isspace():
            i += 1
            continue
        j = i
        while j < n and not text[j].isspace():
            j += 1
        result.append([text[i:j], i, j])
        i = j
    return result`,
    testCases: [
      { input: ["Hello world"], expected: [["Hello", 0, 5], ["world", 6, 11]] },
      { input: ["  a b  "], expected: [["a", 2, 3], ["b", 4, 5]] },
      { input: ["one"], expected: [["one", 0, 3]] },
      { input: [""], expected: [] },
    ],
    hint: "Walk the string with an index and skip over whitespace runs.",
  },
  {
    id: "nlp-008",
    title: "Character N-grams",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return all character n-grams of text as a list of strings, in order.\n\nIf n <= 0 or n > len(text), return an empty list.",
    starterCode: `def char_ngrams(text, n):
    # Your code here
    pass`,
    solution: `def char_ngrams(text, n):
    if n <= 0 or n > len(text):
        return []
    return [text[i:i + n] for i in range(len(text) - n + 1)]`,
    testCases: [
      { input: ["hello", 2], expected: ["he", "el", "ll", "lo"] },
      { input: ["abc", 3], expected: ["abc"] },
      { input: ["abc", 4], expected: [] },
      { input: ["a", 1], expected: ["a"] },
      { input: ["cat", 0], expected: [] },
    ],
    hint: "Slide a window of width n across the string from left to right.",
  },
  {
    id: "nlp-009",
    title: "Stopword Removal",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Remove every token that appears in the stopwords list.\n\nPreserve the order and any duplicates of the remaining tokens, and return an empty list when everything is filtered out.",
    starterCode: `def remove_stopwords(tokens, stopwords):
    # Your code here
    pass`,
    solution: `def remove_stopwords(tokens, stopwords):
    stop = set(stopwords)
    return [t for t in tokens if t not in stop]`,
    testCases: [
      {
        input: [["the", "cat", "is", "on", "the", "mat"], ["the", "is", "on"]],
        expected: ["cat", "mat"],
      },
      { input: [["a", "b", "c"], []], expected: ["a", "b", "c"] },
      { input: [[], ["x"]], expected: [] },
      { input: [["do", "not", "stop"], ["not", "stop", "never"]], expected: ["do"] },
    ],
    hint: "Convert the stopwords to a set for O(1) membership checks.",
  },
  {
    id: "nlp-010",
    title: "Naive Suffix Stemmer",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Apply a naive suffix-stripping stem to each token, checked in this order: if the word is longer than 5 characters and ends in 'ing', drop 'ing'; otherwise, if it is longer than 4 characters and ends in 'ed', drop 'ed'; otherwise, if it is longer than 3 characters, ends in 's', and does not end in 'ss', drop the 's'.\n\nReturn the list of stems; at most one suffix is removed per token.",
    starterCode: `def naive_stem(tokens):
    # Your code here
    pass`,
    solution: `def naive_stem(tokens):
    result = []
    for w in tokens:
        if len(w) > 5 and w.endswith("ing"):
            w = w[:-3]
        elif len(w) > 4 and w.endswith("ed"):
            w = w[:-2]
        elif len(w) > 3 and w.endswith("s") and not w.endswith("ss"):
            w = w[:-1]
        result.append(w)
    return result`,
    testCases: [
      {
        input: [["running", "jumped", "cats", "class", "is", "boss", "hoped", "flying"]],
        expected: ["runn", "jump", "cat", "class", "is", "boss", "hop", "fly"],
      },
      { input: [["seeing", "agreed", "beds"]], expected: ["see", "agre", "bed"] },
      { input: [[]], expected: [] },
      { input: [["s"]], expected: ["s"] },
    ],
    hint: "Use elif so only the first matching rule applies.",
  },
  {
    id: "nlp-011",
    title: "Simple Plural Normalization",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Normalize a plural English word to a naive singular form. Rules are checked in order: words ending in 'ies' with length > 3 become 'y'; words ending in 'ches' or 'shes' with length > 4 drop the 'es'; words ending in 'es' whose third-from-last character is 's', 'x', or 'z' drop the 'es'; words ending in 's' but not 'ss' with length > 1 drop the 's'.\n\nOtherwise return the word unchanged.",
    starterCode: `def normalize_plural(word):
    # Your code here
    pass`,
    solution: `def normalize_plural(word):
    if word.endswith("ies") and len(word) > 3:
        return word[:-3] + "y"
    if (word.endswith("ches") or word.endswith("shes")) and len(word) > 4:
        return word[:-2]
    if word.endswith("es") and len(word) > 2 and word[-3] in "sxz":
        return word[:-2]
    if word.endswith("s") and len(word) > 1 and not word.endswith("ss"):
        return word[:-1]
    return word`,
    testCases: [
      { input: ["stories"], expected: "story" },
      { input: ["boxes"], expected: "box" },
      { input: ["churches"], expected: "church" },
      { input: ["cats"], expected: "cat" },
      { input: ["glass"], expected: "glass" },
    ],
    hint: "word[-3] reads the third character from the end.",
  },
  {
    id: "nlp-012",
    title: "Lemmatization Map Lookup",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Map each token to its lemma using the provided dictionary.\n\nFall back to the token itself when it is not a key in the map. Return an empty list for empty input.",
    starterCode: `def lemmatize_lookup(tokens, lemma_map):
    # Your code here
    pass`,
    solution: `def lemmatize_lookup(tokens, lemma_map):
    return [lemma_map.get(t, t) for t in tokens]`,
    testCases: [
      {
        input: [
          ["running", "cats", "was", "better"],
          { "running": "run", "was": "be", "better": "good" },
        ],
        expected: ["run", "cats", "be", "good"],
      },
      { input: [["dogs", "dogs"], { "dogs": "dog" }], expected: ["dog", "dog"] },
      { input: [[], { "x": "y" }], expected: [] },
      { input: [["a", "b"], {}], expected: ["a", "b"] },
    ],
    hint: "dict.get(key, default) provides the fallback in one call.",
  },
  {
    id: "nlp-013",
    title: "Vocabulary with Minimum Frequency",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Count how often each token occurs and return a dictionary mapping every token whose count is at least min_freq to that count.\n\nInsert tokens in first-occurrence order and include each token once. Return an empty dictionary for empty input.",
    starterCode: `def build_vocab_min_freq(tokens, min_freq):
    # Your code here
    pass`,
    solution: `def build_vocab_min_freq(tokens, min_freq):
    counts = {}
    for t in tokens:
        counts[t] = counts.get(t, 0) + 1
    vocab = {}
    for t in tokens:
        if counts[t] >= min_freq and t not in vocab:
            vocab[t] = counts[t]
    return vocab`,
    testCases: [
      { input: [["a", "b", "a", "c", "a", "b"], 2], expected: { a: 3, b: 2 } },
      { input: [["a", "b", "a", "c", "a", "b"], 3], expected: { a: 3 } },
      { input: [[], 1], expected: {} },
      { input: [["x", "y", "z"], 1], expected: { x: 1, y: 1, z: 1 } },
    ],
    hint: "Count first, then filter with a second pass over the tokens.",
  },
  {
    id: "nlp-014",
    title: "Vocabulary Index Mapping",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return a dictionary mapping each token in vocab to its integer index in the list.\n\nIndices start at 0 and follow the order of vocab.",
    starterCode: `def vocab_index(vocab):
    # Your code here
    pass`,
    solution: `def vocab_index(vocab):
    return {w: i for i, w in enumerate(vocab)}`,
    testCases: [
      { input: [["a", "b", "c"]], expected: { a: 0, b: 1, c: 2 } },
      { input: [["the", "cat"]], expected: { the: 0, cat: 1 } },
      { input: [[]], expected: {} },
      {
        input: [["one", "two", "three", "four"]],
        expected: { one: 0, two: 1, three: 2, four: 3 },
      },
    ],
    hint: "enumerate gives you both the index and the token.",
  },
  {
    id: "nlp-015",
    title: "One-Hot Token Encoding",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return a one-hot list of length len(vocab) with a 1 at the index of token and 0 everywhere else.\n\nIf token is not in vocab, return an empty list.",
    starterCode: `def one_hot_token(token, vocab):
    # Your code here
    pass`,
    solution: `def one_hot_token(token, vocab):
    if token not in vocab:
        return []
    vec = [0] * len(vocab)
    vec[vocab.index(token)] = 1
    return vec`,
    testCases: [
      { input: ["b", ["a", "b", "c"]], expected: [0, 1, 0] },
      { input: ["a", ["a"]], expected: [1] },
      { input: ["z", ["a", "b"]], expected: [] },
      { input: ["c", ["c", "b", "a"]], expected: [1, 0, 0] },
    ],
    hint: "Build a zero list and flip the single matching position.",
  },
  {
    id: "nlp-016",
    title: "Type-Token Ratio",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the type-token ratio: the number of distinct tokens divided by the total number of tokens.\n\nReturn 0.0 when the token list is empty.",
    starterCode: `def type_token_ratio(tokens):
    # Your code here
    pass`,
    solution: `def type_token_ratio(tokens):
    if not tokens:
        return 0.0
    return len(set(tokens)) / len(tokens)`,
    testCases: [
      { input: [["a", "b", "c", "a"]], expected: 0.75 },
      { input: [["a", "a", "a"]], expected: 0.3333333333333333 },
      { input: [[]], expected: 0.0 },
      {
        input: [["the", "cat", "sat", "on", "the", "mat"]],
        expected: 0.8333333333333334,
      },
    ],
    hint: "Types are unique tokens; divide by the token count.",
  },
  {
    id: "nlp-017",
    title: "Most Common Token",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the token with the highest frequency. Break ties by choosing the lexicographically smallest token, comparing plain strings.\n\nReturn an empty string for empty input.",
    starterCode: `def most_common_token(tokens):
    # Your code here
    pass`,
    solution: `def most_common_token(tokens):
    if not tokens:
        return ""
    counts = {}
    for t in tokens:
        counts[t] = counts.get(t, 0) + 1
    best = ""
    best_count = -1
    for t in sorted(counts):
        if counts[t] > best_count:
            best = t
            best_count = counts[t]
    return best`,
    testCases: [
      { input: [["b", "a", "b", "c"]], expected: "b" },
      { input: [["a", "b", "c", "a", "b"]], expected: "a" },
      { input: [[]], expected: "" },
      { input: [["z", "z", "y", "y"]], expected: "y" },
      { input: [["only"]], expected: "only" },
    ],
    hint: "Iterate over sorted keys and keep the first maximum you see.",
  },
  {
    id: "nlp-018",
    title: "Hapax Count",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the number of distinct tokens that occur exactly once in the token list.\n\nCount types, not occurrences, so a token repeated twice contributes nothing.",
    starterCode: `def hapax_count(tokens):
    # Your code here
    pass`,
    solution: `def hapax_count(tokens):
    counts = {}
    for t in tokens:
        counts[t] = counts.get(t, 0) + 1
    return sum(1 for t in counts if counts[t] == 1)`,
    testCases: [
      { input: [["a", "b", "c", "a"]], expected: 2 },
      { input: [["a", "a", "a"]], expected: 0 },
      { input: [[]], expected: 0 },
      { input: [["x", "y", "z"]], expected: 3 },
    ],
    hint: "Build a frequency table, then count entries equal to 1.",
  },
  {
    id: "nlp-019",
    title: "Sentence Splitter",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Split text into sentences. A sentence ends after a maximal run of '.', '!' or '?' characters; any leftover text at the end is a sentence.\n\nStrip surrounding whitespace and drop empty pieces, but keep the punctuation inside its sentence.",
    starterCode: `def sentence_split(text):
    # Your code here
    pass`,
    solution: `def sentence_split(text):
    sentences = []
    start = 0
    i = 0
    n = len(text)
    while i < n:
        if text[i] in ".!?":
            j = i
            while j < n and text[j] in ".!?":
                j += 1
            s = text[start:j].strip()
            if s:
                sentences.append(s)
            start = j
            i = j
        else:
            i += 1
    s = text[start:].strip()
    if s:
        sentences.append(s)
    return sentences`,
    testCases: [
      {
        input: ["Hello world. How are you? Fine!"],
        expected: ["Hello world.", "How are you?", "Fine!"],
      },
      { input: ["No punctuation here"], expected: ["No punctuation here"] },
      { input: [""], expected: [] },
      { input: ["One.  Two.. Three"], expected: ["One.", "Two..", "Three"] },
      { input: ["Wait... really?!"], expected: ["Wait...", "really?!"] },
    ],
    hint: "Track the start of the current sentence and scan for punctuation runs.",
  },
  {
    id: "nlp-020",
    title: "BPE Merge Step",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Perform one BPE merge step over a list of words, where each word is a list of symbols. Count every adjacent symbol pair across all words, pick the most frequent pair, and break ties by lexicographic order.\n\nMerge left-to-right non-overlapping occurrences of that pair in every word. Return a dictionary with key 'pair' holding the two symbols as a list and key 'merged' holding the rewritten words. If there are no pairs, return an empty pair list and the words unchanged.",
    starterCode: `def bpe_merge_step(words):
    # Your code here
    pass`,
    solution: `def bpe_merge_step(words):
    counts = {}
    for w in words:
        for i in range(len(w) - 1):
            pair = (w[i], w[i + 1])
            counts[pair] = counts.get(pair, 0) + 1
    if not counts:
        return {"pair": [], "merged": [list(w) for w in words]}
    best = None
    best_count = -1
    for pair in sorted(counts):
        if counts[pair] > best_count:
            best = pair
            best_count = counts[pair]
    merged = []
    for w in words:
        out = []
        i = 0
        while i < len(w):
            if i < len(w) - 1 and w[i] == best[0] and w[i + 1] == best[1]:
                out.append(best[0] + best[1])
                i += 2
            else:
                out.append(w[i])
                i += 1
        merged.append(out)
    return {"pair": [best[0], best[1]], "merged": merged}`,
    testCases: [
      {
        input: [[["a", "b", "a", "b"], ["a", "b"]]],
        expected: { pair: ["a", "b"], merged: [["ab", "ab"], ["ab"]] },
      },
      {
        input: [[["a", "b"], ["b", "a"]]],
        expected: { pair: ["a", "b"], merged: [["ab"], ["b", "a"]] },
      },
      {
        input: [[["l", "o", "w"], ["l", "o", "w", "e", "r"]]],
        expected: { pair: ["l", "o"], merged: [["lo", "w"], ["lo", "w", "e", "r"]] },
      },
      {
        input: [[["a"], ["b"]]],
        expected: { pair: [], merged: [["a"], ["b"]] },
      },
      {
        input: [[["x", "y", "x", "y", "x"]]],
        expected: { pair: ["x", "y"], merged: [["xy", "xy", "x"]] },
      },
    ],
    hint: "Use a tuple as the dictionary key for each symbol pair, then sort keys to break ties.",
  },
  {
    id: "nlp-021",
    title: "BPE Encode with Merges",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Encode a word with a learned BPE merge list. Start by splitting the word into individual characters, then apply each merge pair in the given priority order.\n\nFor one merge, scan the current symbols left to right and replace every non-overlapping occurrence of the pair with the concatenated symbol. Return the final list of symbols.",
    starterCode: `def bpe_encode(word, merges):
    # Your code here
    pass`,
    solution: `def bpe_encode(word, merges):
    symbols = list(word)
    for pair in merges:
        a, b = pair[0], pair[1]
        new_symbols = []
        i = 0
        while i < len(symbols):
            if i < len(symbols) - 1 and symbols[i] == a and symbols[i + 1] == b:
                new_symbols.append(a + b)
                i += 2
            else:
                new_symbols.append(symbols[i])
                i += 1
        symbols = new_symbols
    return symbols`,
    testCases: [
      { input: ["abc", [["a", "b"]]], expected: ["ab", "c"] },
      { input: ["abab", [["a", "b"], ["ab", "ab"]]], expected: ["abab"] },
      {
        input: ["hello", [["l", "l"], ["e", "ll"], ["h", "ell"], ["hell", "o"]]],
        expected: ["hello"],
      },
      { input: ["abcd", []], expected: ["a", "b", "c", "d"] },
      { input: ["aab", [["a", "a"], ["aa", "b"]]], expected: ["aab"] },
    ],
    hint: "Apply merges in rank order, each time rebuilding the symbol list.",
  },
  {
    id: "nlp-022",
    title: "WordPiece Longest-Match Tokenizer",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Tokenize word with the WordPiece longest-match-first strategy. At each position, emit the longest prefix of the remaining text that appears in vocab.\n\nIf no prefix matches, emit the literal '[UNK]' and advance one character. Return the resulting list of tokens.",
    starterCode: `def wordpiece_tokenize(word, vocab):
    # Your code here
    pass`,
    solution: `def wordpiece_tokenize(word, vocab):
    vocab_set = set(vocab)
    tokens = []
    i = 0
    n = len(word)
    while i < n:
        end = n
        matched = None
        while end > i:
            if word[i:end] in vocab_set:
                matched = word[i:end]
                break
            end -= 1
        if matched is None:
            tokens.append("[UNK]")
            i += 1
        else:
            tokens.append(matched)
            i = end
    return tokens`,
    testCases: [
      {
        input: ["playing", ["play", "ing", "p", "l", "a", "y", "i", "n", "g"]],
        expected: ["play", "ing"],
      },
      { input: ["unwanted", ["un", "want", "ed"]], expected: ["un", "want", "ed"] },
      { input: ["abc", ["a"]], expected: ["a", "[UNK]", "[UNK]"] },
      { input: ["x", ["x"]], expected: ["x"] },
      { input: ["book", ["bo", "ok", "b", "o", "k"]], expected: ["bo", "ok"] },
    ],
    hint: "Shrink the candidate window from the full remaining string down to one character.",
  },
  {
    id: "nlp-023",
    title: "Unigram Log Probability",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the total unigram log probability of a token sequence: the sum of math.log(probs[token]) over all tokens.\n\nTreat a missing token as probability 0 and return float('-inf') in that case. Return 0.0 for an empty token list.",
    starterCode: `import math
def unigram_logprob(tokens, probs):
    # Your code here
    pass`,
    solution: `import math
def unigram_logprob(tokens, probs):
    total = 0.0
    for t in tokens:
        p = probs.get(t, 0.0)
        if p <= 0:
            return float("-inf")
        total += math.log(p)
    return total`,
    testCases: [
      { input: [["a", "b"], { a: 0.5, b: 0.25 }], expected: -2.0794415416798357 },
      { input: [["a", "a", "a"], { a: 0.1 }], expected: -6.907755278982137 },
      { input: [[], { a: 0.5 }], expected: 0.0 },
      { input: [["the", "cat"], { the: 1.0, cat: 1.0 }], expected: 0.0 },
    ],
    hint: "Logs turn products of probabilities into sums.",
  },
  {
    id: "nlp-024",
    title: "Bigram Counts",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Count every adjacent token pair in the token list.\n\nReturn a dictionary whose keys are the two tokens joined by a single space and whose values are the counts. A list shorter than two tokens yields an empty dictionary.",
    starterCode: `def bigram_counts(tokens):
    # Your code here
    pass`,
    solution: `def bigram_counts(tokens):
    counts = {}
    for i in range(len(tokens) - 1):
        key = tokens[i] + " " + tokens[i + 1]
        counts[key] = counts.get(key, 0) + 1
    return counts`,
    testCases: [
      { input: [["a", "b", "a", "b"]], expected: { "a b": 2, "b a": 1 } },
      {
        input: [["the", "cat", "sat", "on", "the", "mat"]],
        expected: { "the cat": 1, "cat sat": 1, "sat on": 1, "on the": 1, "the mat": 1 },
      },
      { input: [["x"]], expected: {} },
      { input: [[]], expected: {} },
    ],
    hint: "Slide a window of size 2 and join each pair with a space.",
  },
  {
    id: "nlp-025",
    title: "Bigram Probabilities with Laplace Smoothing",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Build add-one smoothed bigram probabilities from a token list. For every observed bigram (a, b) compute P(b | a) = (count(a, b) + 1) / (count(a) + V), where V is the number of distinct tokens in the corpus.\n\nReturn a dictionary keyed by 'a b'. A corpus shorter than two tokens yields an empty dictionary.",
    starterCode: `def bigram_probs_laplace(tokens):
    # Your code here
    pass`,
    solution: `def bigram_probs_laplace(tokens):
    vocab_size = len(set(tokens))
    unigrams = {}
    for t in tokens:
        unigrams[t] = unigrams.get(t, 0) + 1
    bigrams = {}
    for i in range(len(tokens) - 1):
        pair = (tokens[i], tokens[i + 1])
        bigrams[pair] = bigrams.get(pair, 0) + 1
    result = {}
    for pair in bigrams:
        a, b = pair
        result[a + " " + b] = (bigrams[pair] + 1) / (unigrams[a] + vocab_size)
    return result`,
    testCases: [
      { input: [["a", "b", "a"]], expected: { "a b": 0.5, "b a": 0.6666666666666666 } },
      {
        input: [["the", "cat", "the", "dog"]],
        expected: { "the cat": 0.4, "cat the": 0.5, "the dog": 0.4 },
      },
      { input: [["a", "a", "a"]], expected: { "a a": 0.75 } },
      { input: [["x"]], expected: {} },
    ],
    hint: "The denominator uses the count of the first token plus the smoothed vocabulary size.",
  },
  {
    id: "nlp-026",
    title: "Perplexity from Probabilities",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the perplexity of a sequence of probabilities: exp of the negative mean log probability, that is exp(-(sum(log(p)) / N)).\n\nReturn 1.0 for an empty list.",
    starterCode: `import math
def perplexity(probs):
    # Your code here
    pass`,
    solution: `import math
def perplexity(probs):
    if not probs:
        return 1.0
    total = 0.0
    for p in probs:
        total += math.log(p)
    return math.exp(-total / len(probs))`,
    testCases: [
      { input: [[0.5, 0.5]], expected: 2.0 },
      { input: [[0.25, 0.25, 0.25, 0.25]], expected: 4.0 },
      { input: [[1.0, 1.0]], expected: 1.0 },
      { input: [[0.5, 0.25]], expected: 2.82842712474619 },
      { input: [[]], expected: 1.0 },
    ],
    hint: "Average the log probabilities first, then undo the mean with exp.",
  },
  {
    id: "nlp-027",
    title: "Bigram Log-Likelihood of a Sentence",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the bigram log-likelihood of a token sequence. The first token is conditioned on the start symbol '<s>' using the key '<s> token', and each later token uses the key 'previous token'.\n\nSum math.log of the looked-up probabilities. Treat a missing entry as probability 0 and return float('-inf'). Return 0.0 for an empty sequence.",
    starterCode: `import math
def log_likelihood(tokens, probs):
    # Your code here
    pass`,
    solution: `import math
def log_likelihood(tokens, probs):
    if not tokens:
        return 0.0
    total = 0.0
    prev = "<s>"
    for t in tokens:
        key = prev + " " + t
        p = probs.get(key, 0.0)
        if p <= 0:
            return float("-inf")
        total += math.log(p)
        prev = t
    return total`,
    testCases: [
      { input: [["a", "b"], { "<s> a": 1.0, "a b": 0.5 }], expected: -0.6931471805599453 },
      {
        input: [["the", "cat"], { "<s> the": 0.5, "the cat": 0.1 }],
        expected: -2.995732273553991,
      },
      { input: [[], {}], expected: 0.0 },
      { input: [["x"], { "<s> x": 1.0 }], expected: 0.0 },
    ],
    hint: "Update the context to the token you just scored before the next lookup.",
  },
  {
    id: "nlp-028",
    title: "Add-k Smoothing",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the add-k smoothed conditional probability (count + k) / (context_count + k * vocab_size).\n\ncount is the observed count of the event, context_count is the total count of its context, vocab_size is the number of possible outcomes, and k is the smoothing constant.",
    starterCode: `def add_k_smoothing(count, context_count, vocab_size, k):
    # Your code here
    pass`,
    solution: `def add_k_smoothing(count, context_count, vocab_size, k):
    return (count + k) / (context_count + k * vocab_size)`,
    testCases: [
      { input: [0, 10, 5, 1], expected: 0.06666666666666667 },
      { input: [3, 10, 5, 1], expected: 0.26666666666666666 },
      { input: [0, 0, 4, 0.5], expected: 0.25 },
      { input: [5, 5, 1, 0.1], expected: 1.0 },
    ],
    hint: "Add k to the numerator and k times the vocabulary size to the denominator.",
  },
  {
    id: "nlp-029",
    title: "Backoff Probability",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Compute a Katz-style backoff probability for a trigram. context is [w1, w2] and token is w3.\n\nIf the key 'w1 w2 w3' is in tri_probs with a positive value, return it. Otherwise, if 'w2 w3' is in bi_probs with a positive value, return alpha times that value. Otherwise, if w3 is in uni_probs with a positive value, return alpha squared times that value. Return 0.0 when nothing matches.",
    starterCode: `def backoff_prob(context, token, tri_probs, bi_probs, uni_probs, alpha):
    # Your code here
    pass`,
    solution: `def backoff_prob(context, token, tri_probs, bi_probs, uni_probs, alpha):
    w1, w2 = context[0], context[1]
    key3 = w1 + " " + w2 + " " + token
    if key3 in tri_probs and tri_probs[key3] > 0:
        return tri_probs[key3]
    key2 = w2 + " " + token
    if key2 in bi_probs and bi_probs[key2] > 0:
        return alpha * bi_probs[key2]
    if token in uni_probs and uni_probs[token] > 0:
        return alpha * alpha * uni_probs[token]
    return 0.0`,
    testCases: [
      { input: [["a", "b"], "c", { "a b c": 0.2 }, {}, {}, 0.4], expected: 0.2 },
      { input: [["a", "b"], "c", {}, { "b c": 0.5 }, {}, 0.4], expected: 0.2 },
      { input: [["a", "b"], "c", {}, {}, { c: 0.1 }, 0.5], expected: 0.025 },
      { input: [["a", "b"], "c", {}, {}, {}, 0.5], expected: 0.0 },
      {
        input: [["a", "b"], "c", { "a b c": 0.0 }, { "b c": 0.5 }, { c: 0.9 }, 0.5],
        expected: 0.25,
      },
    ],
    hint: "Only back off when the higher-order probability is absent or not positive.",
  },
  {
    id: "nlp-030",
    title: "Interpolation Probability",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Return the linearly interpolated trigram probability lambdas[0] * P(w3 | w1 w2) + lambdas[1] * P(w3 | w2) + lambdas[2] * P(w3).\n\nThe three dictionaries are keyed by 'w1 w2 w3', 'w2 w3', and w3 respectively. Missing entries contribute 0.0.",
    starterCode: `def interpolation_prob(context, token, tri_probs, bi_probs, uni_probs, lambdas):
    # Your code here
    pass`,
    solution: `def interpolation_prob(context, token, tri_probs, bi_probs, uni_probs, lambdas):
    w1, w2 = context[0], context[1]
    p3 = tri_probs.get(w1 + " " + w2 + " " + token, 0.0)
    p2 = bi_probs.get(w2 + " " + token, 0.0)
    p1 = uni_probs.get(token, 0.0)
    return lambdas[0] * p3 + lambdas[1] * p2 + lambdas[2] * p1`,
    testCases: [
      {
        input: [["a", "b"], "c", { "a b c": 0.2 }, { "b c": 0.4 }, { c: 0.1 }, [0.5, 0.3, 0.2]],
        expected: 0.24,
      },
      {
        input: [["a", "b"], "c", {}, {}, { c: 0.5 }, [0.2, 0.3, 0.5]],
        expected: 0.25,
      },
      {
        input: [["a", "b"], "c", {}, { "b c": 1.0 }, {}, [0.0, 1.0, 0.0]],
        expected: 1.0,
      },
      {
        input: [["x", "y"], "z", {}, {}, {}, [0.33, 0.33, 0.34]],
        expected: 0.0,
      },
    ],
    hint: "Look up each order with dict.get and blend the three values with the weights.",
  },
  {
    id: "nlp-031",
    title: "Levenshtein Edit Distance",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the Levenshtein edit distance between two strings using unit costs for insertion, deletion, and substitution.\n\nAn empty source needs len(target) insertions, and identical strings have distance 0.",
    starterCode: `def levenshtein(s1, s2):
    # Your code here
    pass`,
    solution: `def levenshtein(s1, s2):
    n, m = len(s1), len(s2)
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(n + 1):
        dp[i][0] = i
    for j in range(m + 1):
        dp[0][j] = j
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            cost = 0 if s1[i - 1] == s2[j - 1] else 1
            dp[i][j] = min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
    return dp[n][m]`,
    testCases: [
      { input: ["kitten", "sitting"], expected: 3 },
      { input: ["", "abc"], expected: 3 },
      { input: ["abc", "abc"], expected: 0 },
      { input: ["flaw", "lawn"], expected: 2 },
      { input: ["", ""], expected: 0 },
    ],
    hint: "Fill an (n + 1) x (m + 1) table, where each cell adds one edit on top of a neighbor.",
  },
  {
    id: "nlp-032",
    title: "Damerau Input with Adjacent Transposition",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Return the optimal string alignment distance between two strings: like Levenshtein, but swapping two adjacent characters costs 1 edit.\n\nThis is the restricted 'lite' Damerau variant, so an adjacent transposition followed by further edits can cost more than the unrestricted distance. Identical strings have distance 0.",
    starterCode: `def damerau_adjacent(s1, s2):
    # Your code here
    pass`,
    solution: `def damerau_adjacent(s1, s2):
    n, m = len(s1), len(s2)
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(n + 1):
        dp[i][0] = i
    for j in range(m + 1):
        dp[0][j] = j
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            cost = 0 if s1[i - 1] == s2[j - 1] else 1
            dp[i][j] = min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
            if i > 1 and j > 1 and s1[i - 1] == s2[j - 2] and s1[i - 2] == s2[j - 1]:
                dp[i][j] = min(dp[i][j], dp[i - 2][j - 2] + 1)
    return dp[n][m]`,
    testCases: [
      { input: ["ab", "ba"], expected: 1 },
      { input: ["ca", "abc"], expected: 3 },
      { input: ["teh", "the"], expected: 1 },
      { input: ["abc", "abc"], expected: 0 },
      { input: ["", "ab"], expected: 2 },
    ],
    hint: "Add a fourth candidate to the usual three using the cell at (i - 2, j - 2).",
  },
  {
    id: "nlp-033",
    title: "Jaro Similarity",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Return the Jaro similarity between two strings, which is always in [0, 1]. Two characters match when they are equal and at most floor(max(len(s1), len(s2)) / 2) - 1 positions apart.\n\nCount transpositions as half the number of matched characters that appear out of order. Return 1.0 for equal strings and 0.0 when there are no matches.",
    starterCode: `def jaro(s1, s2):
    # Your code here
    pass`,
    solution: `def jaro(s1, s2):
    if s1 == s2:
        return 1.0
    if not s1 or not s2:
        return 0.0
    match_distance = max(len(s1), len(s2)) // 2 - 1
    if match_distance < 0:
        match_distance = 0
    s1_matches = [False] * len(s1)
    s2_matches = [False] * len(s2)
    matches = 0
    for i in range(len(s1)):
        start = max(0, i - match_distance)
        end = min(i + match_distance + 1, len(s2))
        for j in range(start, end):
            if s2_matches[j]:
                continue
            if s1[i] != s2[j]:
                continue
            s1_matches[i] = True
            s2_matches[j] = True
            matches += 1
            break
    if matches == 0:
        return 0.0
    transpositions = 0
    k = 0
    for i in range(len(s1)):
        if s1_matches[i]:
            while not s2_matches[k]:
                k += 1
            if s1[i] != s2[k]:
                transpositions += 1
            k += 1
    half_trans = transpositions / 2.0
    return (matches / len(s1) + matches / len(s2) + (matches - half_trans) / matches) / 3.0`,
    testCases: [
      { input: ["martha", "marhta"], expected: 0.9444444444444445 },
      { input: ["dwayne", "duane"], expected: 0.8222222222222223 },
      { input: ["abc", "abc"], expected: 1.0 },
      { input: ["abc", "xyz"], expected: 0.0 },
      { input: ["", "a"], expected: 0.0 },
    ],
    hint: "Match characters inside a sliding window first, then count order differences.",
  },
  {
    id: "nlp-034",
    title: "Jaro-Winkler Prefix Boost",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Return the Jaro-Winkler similarity: the Jaro similarity plus prefix * p * (1 - Jaro), where prefix is the length of the common prefix of the two strings capped at 4 and p defaults to 0.1.\n\nReturn 1.0 for equal strings, including two empty strings.",
    starterCode: `def jaro_winkler(s1, s2, p=0.1):
    # Your code here
    pass`,
    solution: `def jaro_winkler(s1, s2, p=0.1):
    if s1 == s2:
        base = 1.0
    elif not s1 or not s2:
        base = 0.0
    else:
        match_distance = max(len(s1), len(s2)) // 2 - 1
        if match_distance < 0:
            match_distance = 0
        s1_matches = [False] * len(s1)
        s2_matches = [False] * len(s2)
        matches = 0
        for i in range(len(s1)):
            start = max(0, i - match_distance)
            end = min(i + match_distance + 1, len(s2))
            for j in range(start, end):
                if s2_matches[j]:
                    continue
                if s1[i] != s2[j]:
                    continue
                s1_matches[i] = True
                s2_matches[j] = True
                matches += 1
                break
        if matches == 0:
            base = 0.0
        else:
            transpositions = 0
            k = 0
            for i in range(len(s1)):
                if s1_matches[i]:
                    while not s2_matches[k]:
                        k += 1
                    if s1[i] != s2[k]:
                        transpositions += 1
                    k += 1
            half_trans = transpositions / 2.0
            base = (matches / len(s1) + matches / len(s2) + (matches - half_trans) / matches) / 3.0
    prefix = 0
    for a, b in zip(s1, s2):
        if prefix < 4 and a == b:
            prefix += 1
        else:
            break
    return base + prefix * p * (1 - base)`,
    testCases: [
      { input: ["martha", "marhta"], expected: 0.9611111111111111 },
      { input: ["dwayne", "duane"], expected: 0.8400000000000001 },
      { input: ["abc", "abc"], expected: 1.0 },
      { input: ["abc", "xyz"], expected: 0.0 },
      { input: ["", ""], expected: 1.0 },
    ],
    hint: "Compute the Jaro similarity first, then boost it by the shared prefix.",
  },
  {
    id: "nlp-035",
    title: "Jaccard Token Similarity",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the Jaccard similarity of two token lists, treating each list as a set: |intersection| / |union|.\n\nDuplicates are ignored. Return 0.0 when both sets are empty.",
    starterCode: `def jaccard_tokens(tokens1, tokens2):
    # Your code here
    pass`,
    solution: `def jaccard_tokens(tokens1, tokens2):
    s1, s2 = set(tokens1), set(tokens2)
    union = s1 | s2
    if not union:
        return 0.0
    return len(s1 & s2) / len(union)`,
    testCases: [
      { input: [["a", "b", "c"], ["b", "c", "d"]], expected: 0.5 },
      { input: [["a", "a", "b"], ["a", "b", "b"]], expected: 1.0 },
      { input: [[], []], expected: 0.0 },
      { input: [["a", "b"], ["c", "d"]], expected: 0.0 },
      { input: [["x"], []], expected: 0.0 },
    ],
    hint: "Python sets support intersection with & and union with |.",
  },
  {
    id: "nlp-036",
    title: "Dice Coefficient of Tokens",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the Dice coefficient of two token lists, treating each list as a set: 2 * |intersection| / (|A| + |B|).\n\nDuplicates are ignored. Return 0.0 when both sets are empty.",
    starterCode: `def dice_tokens(tokens1, tokens2):
    # Your code here
    pass`,
    solution: `def dice_tokens(tokens1, tokens2):
    s1, s2 = set(tokens1), set(tokens2)
    if not s1 and not s2:
        return 0.0
    return 2 * len(s1 & s2) / (len(s1) + len(s2))`,
    testCases: [
      { input: [["a", "b", "c"], ["b", "c", "d"]], expected: 0.6666666666666666 },
      { input: [["a", "a", "b"], ["a", "b", "b"]], expected: 1.0 },
      { input: [[], []], expected: 0.0 },
      { input: [["a"], ["b"]], expected: 0.0 },
      { input: [["x"], []], expected: 0.0 },
    ],
    hint: "Double the intersection size, then divide by the sum of both set sizes.",
  },
  {
    id: "nlp-037",
    title: "Term Frequency",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the term frequency of token in doc. With log_tf=False return the raw count as a float; with log_tf=True return 1 + math.log(count).\n\nA token that never appears yields 0.0.",
    starterCode: `import math
def tf(token, doc, log_tf=False):
    # Your code here
    pass`,
    solution: `import math
def tf(token, doc, log_tf=False):
    count = doc.count(token)
    if count == 0:
        return 0.0
    if log_tf:
        return 1 + math.log(count)
    return float(count)`,
    testCases: [
      { input: ["cat", ["the", "cat", "sat", "on", "the", "cat"], false], expected: 2.0 },
      { input: ["dog", ["the", "cat"], false], expected: 0.0 },
      { input: ["cat", ["cat", "cat", "cat"], true], expected: 2.09861228866811 },
      { input: ["the", ["the", "cat", "the"], true], expected: 1.6931471805599454 },
      { input: ["a", [], false], expected: 0.0 },
    ],
    hint: "The log variant dampens repeated counts with 1 + log(count).",
  },
  {
    id: "nlp-038",
    title: "Inverse Document Frequency",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the inverse document frequency math.log(n_docs / df), where df is the number of documents that contain the term.\n\nReturn 0.0 when df is 0.",
    starterCode: `import math
def idf(df, n_docs):
    # Your code here
    pass`,
    solution: `import math
def idf(df, n_docs):
    if df <= 0:
        return 0.0
    return math.log(n_docs / df)`,
    testCases: [
      { input: [2, 4], expected: 0.6931471805599453 },
      { input: [4, 4], expected: 0.0 },
      { input: [0, 5], expected: 0.0 },
      { input: [1, 1], expected: 0.0 },
      { input: [1, 10], expected: 2.302585092994046 },
    ],
    hint: "A term appearing in every document has idf 0.",
  },
  {
    id: "nlp-039",
    title: "TF-IDF for a Single Term",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the TF-IDF weight of a single term in a single document: tf(token, doc) times log(N / df), where df is the number of documents in docs containing the term and N is len(docs).\n\nRaw counts are used for tf unless log_tf is True, in which case tf is 1 + log(count). Return 0.0 when the term does not occur in doc or df is 0.",
    starterCode: `import math
def tfidf_single(token, doc, docs, log_tf=False):
    # Your code here
    pass`,
    solution: `import math
def tfidf_single(token, doc, docs, log_tf=False):
    count = doc.count(token)
    if count == 0:
        return 0.0
    weight = 1 + math.log(count) if log_tf else float(count)
    df = sum(1 for d in docs if token in d)
    if df == 0:
        return 0.0
    return weight * math.log(len(docs) / df)`,
    testCases: [
      {
        input: ["cat", ["the", "cat", "sat"], [["the", "cat", "sat"], ["the", "dog"]], false],
        expected: 0.6931471805599453,
      },
      {
        input: ["the", ["the", "cat", "the"], [["the", "cat"], ["the", "dog"]], false],
        expected: 0.0,
      },
      { input: ["dog", ["cat"], [["cat"], ["dog"]], false], expected: 0.0 },
      {
        input: ["dog", ["dog", "dog"], [["cat"], ["dog"], ["bird"]], true],
        expected: 1.860112299086919,
      },
    ],
    hint: "df counts documents, not occurrences; only the tf part uses the local count.",
  },
  {
    id: "nlp-040",
    title: "BM25 Score for a Single Term",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Return the BM25 score of a single term: idf * (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * doc_len / avg_doc_len)), with idf = log(1 + (N - df + 0.5) / (df + 0.5)).\n\nterm_freq is the raw count of the term in the document, N is n_docs, and k1 and b default to 1.5 and 0.75. Return 0.0 when the term does not occur.",
    starterCode: `import math
def bm25(term_freq, doc_len, avg_doc_len, df, n_docs, k1=1.5, b=0.75):
    # Your code here
    pass`,
    solution: `import math
def bm25(term_freq, doc_len, avg_doc_len, df, n_docs, k1=1.5, b=0.75):
    if term_freq == 0:
        return 0.0
    idf_part = math.log(1 + (n_docs - df + 0.5) / (df + 0.5))
    denom = term_freq + k1 * (1 - b + b * doc_len / avg_doc_len)
    return idf_part * (term_freq * (k1 + 1)) / denom`,
    testCases: [
      { input: [2, 50, 50, 10, 100], expected: 3.233921799539688 },
      { input: [0, 50, 50, 10, 100], expected: 0.0 },
      { input: [1, 25, 50, 1, 2], expected: 0.8943834587870262 },
      { input: [3, 40, 50, 20, 100, 1.2, 0.0], expected: 2.5059502768094095 },
    ],
    hint: "The length ratio only enters through the denominator inside 1 - b + b * dl / avgdl.",
  },
  {
    id: "nlp-041",
    title: "Build an Inverted Index",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Build an inverted index over docs, a list of token lists.\n\nReturn a dictionary mapping each distinct token to the sorted list of document indices that contain it. An empty corpus yields an empty dictionary.",
    starterCode: `def inverted_index(docs):
    # Your code here
    pass`,
    solution: `def inverted_index(docs):
    index = {}
    for i, doc in enumerate(docs):
        for t in set(doc):
            if t not in index:
                index[t] = []
            index[t].append(i)
    return index`,
    testCases: [
      {
        input: [[["a", "b"], ["b", "c"], ["a", "c"]]],
        expected: { b: [0, 1], a: [0, 2], c: [1, 2] },
      },
      { input: [[[], ["x"]]], expected: { x: [1] } },
      { input: [[]], expected: {} },
      {
        input: [[["the", "cat"], ["the", "dog", "cat"]]],
        expected: { cat: [0, 1], the: [0, 1], dog: [1] },
      },
    ],
    hint: "enumerate gives the document id, and a set per document removes duplicate postings.",
  },
  {
    id: "nlp-042",
    title: "Positional Index Search",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Search a positional index, a dictionary mapping each term to a dictionary from document id as a string to sorted token positions.\n\nReturn the sorted integer document ids that contain every term in terms. Return an empty list when terms is empty or any term is missing from the index.",
    starterCode: `def positional_index_search(index, terms):
    # Your code here
    pass`,
    solution: `def positional_index_search(index, terms):
    if not terms:
        return []
    docs = None
    for t in terms:
        if t not in index:
            return []
        ds = set(int(d) for d in index[t])
        if docs is None:
            docs = ds
        else:
            docs = docs & ds
    return sorted(docs)`,
    testCases: [
      {
        input: [
          { a: { "0": [0, 2], "1": [1] }, b: { "0": [1], "2": [0] } },
          ["a"],
        ],
        expected: [0, 1],
      },
      {
        input: [
          { a: { "0": [0, 2], "1": [1] }, b: { "0": [1], "2": [0] } },
          ["a", "b"],
        ],
        expected: [0],
      },
      {
        input: [
          { a: { "0": [0, 2], "1": [1] }, b: { "0": [1], "2": [0] } },
          ["a", "z"],
        ],
        expected: [],
      },
      {
        input: [
          { a: { "0": [0, 2], "1": [1] }, b: { "0": [1], "2": [0] } },
          [],
        ],
        expected: [],
      },
    ],
    hint: "Intersect the document id sets and convert the surviving ids back to ints.",
  },
  {
    id: "nlp-043",
    title: "Boolean AND Query",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the sorted intersection of two posting lists, treating them as sets of document ids.\n\nDuplicate postings are ignored, and disjoint lists yield an empty list.",
    starterCode: `def boolean_and(postings1, postings2):
    # Your code here
    pass`,
    solution: `def boolean_and(postings1, postings2):
    s2 = set(postings2)
    return sorted(x for x in set(postings1) if x in s2)`,
    testCases: [
      { input: [[1, 2, 3], [2, 3, 4]], expected: [2, 3] },
      { input: [[], [1]], expected: [] },
      { input: [[1, 2], [2, 1]], expected: [1, 2] },
      { input: [[5], [6]], expected: [] },
    ],
    hint: "Set membership handles duplicates and repeated ids at once.",
  },
  {
    id: "nlp-044",
    title: "Boolean OR Query",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the sorted union of two posting lists, treating them as sets of document ids.\n\nDuplicate postings are ignored, and two empty lists yield an empty list.",
    starterCode: `def boolean_or(postings1, postings2):
    # Your code here
    pass`,
    solution: `def boolean_or(postings1, postings2):
    return sorted(set(postings1) | set(postings2))`,
    testCases: [
      { input: [[1, 2, 3], [2, 3, 4]], expected: [1, 2, 3, 4] },
      { input: [[], [1]], expected: [1] },
      { input: [[1, 2], [2, 1]], expected: [1, 2] },
      { input: [[], []], expected: [] },
    ],
    hint: "The | operator builds the union of two sets, then sorted orders it.",
  },
  {
    id: "nlp-045",
    title: "Phrase Query Check",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Search a positional index for documents where terms occur as a consecutive phrase in the given order. A match at position p requires terms[k] at position p + k in the same document.\n\nReturn the sorted integer document ids with at least one match.",
    starterCode: `def phrase_query(index, terms):
    # Your code here
    pass`,
    solution: `def phrase_query(index, terms):
    if not terms or terms[0] not in index:
        return []
    result = []
    for d in index[terms[0]]:
        positions = index[terms[0]][d]
        found = False
        for p in positions:
            ok = True
            for k in range(1, len(terms)):
                t = terms[k]
                if t not in index or d not in index[t]:
                    ok = False
                    break
                if (p + k) not in index[t][d]:
                    ok = False
                    break
            if ok:
                found = True
                break
        if found:
            result.append(int(d))
    return sorted(result)`,
    testCases: [
      {
        input: [
          {
            new: { "0": [0], "1": [1], "2": [1] },
            york: { "0": [1], "1": [0], "2": [2] },
            city: { "0": [2], "1": [2], "2": [0] },
          },
          ["new", "york"],
        ],
        expected: [0, 2],
      },
      {
        input: [
          {
            new: { "0": [0], "1": [1], "2": [1] },
            york: { "0": [1], "1": [0], "2": [2] },
            city: { "0": [2], "1": [2], "2": [0] },
          },
          ["york", "city"],
        ],
        expected: [0],
      },
      {
        input: [
          {
            new: { "0": [0], "1": [1], "2": [1] },
            york: { "0": [1], "1": [0], "2": [2] },
            city: { "0": [2], "1": [2], "2": [0] },
          },
          ["city", "new"],
        ],
        expected: [2],
      },
      {
        input: [
          {
            new: { "0": [0], "1": [1], "2": [1] },
            york: { "0": [1], "1": [0], "2": [2] },
            city: { "0": [2], "1": [2], "2": [0] },
          },
          ["hello"],
        ],
        expected: [],
      },
    ],
    hint: "For every start position of the first term, check the next term at exactly p + 1, then p + 2, and so on.",
  },
  {
    id: "nlp-046",
    title: "Wildcard Prefix Match",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the sorted list of vocabulary words that start with prefix.\n\nAn empty prefix matches every word. Matching is case-sensitive.",
    starterCode: `def wildcard_prefix_match(vocab, prefix):
    # Your code here
    pass`,
    solution: `def wildcard_prefix_match(vocab, prefix):
    return sorted(w for w in vocab if w.startswith(prefix))`,
    testCases: [
      { input: [["apple", "app", "banana", "apricot"], "ap"], expected: ["app", "apple", "apricot"] },
      { input: [["a", "b"], ""], expected: ["a", "b"] },
      { input: [["x"], "y"], expected: [] },
      { input: [[], "a"], expected: [] },
      { input: [["Cat", "cat"], "c"], expected: ["cat"] },
    ],
    hint: "str.startswith handles both the general case and the empty prefix.",
  },
  {
    id: "nlp-047",
    title: "Fuzzy Match within Edit Distance 1",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the sorted list of vocabulary words within Levenshtein edit distance 1 of word, including word itself when it is in the vocabulary.\n\nReturn an empty list when no vocabulary item is close enough.",
    starterCode: `def fuzzy_match(vocab, word):
    # Your code here
    pass`,
    solution: `def fuzzy_match(vocab, word):
    def lev(a, b):
        n, m = len(a), len(b)
        prev = list(range(m + 1))
        for i in range(1, n + 1):
            curr = [i] + [0] * m
            for j in range(1, m + 1):
                cost = 0 if a[i - 1] == b[j - 1] else 1
                curr[j] = min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost)
            prev = curr
        return prev[m]
    return sorted(w for w in vocab if lev(w, word) <= 1)`,
    testCases: [
      { input: [["cat", "bat", "car", "dog"], "cat"], expected: ["bat", "car", "cat"] },
      { input: [["hello", "yellow"], "hell"], expected: ["hello"] },
      { input: [["abc"], "xyz"], expected: [] },
      { input: [["a", "ab", "abc"], ""], expected: ["a"] },
      { input: [["book", "books", "cook", "boon"], "bok"], expected: ["book"] },
    ],
    hint: "A distance-1 test only needs one insertion, deletion, or substitution, so a full DP table is enough.",
  },
  {
    id: "nlp-048",
    title: "Longest Common Subsequence of Tokens",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the longest common subsequence of two token lists as a list of tokens.\n\nWhen the reconstruction has a choice, advance in the first list on ties, which makes the result deterministic.",
    starterCode: `def lcs_tokens(a, b):
    # Your code here
    pass`,
    solution: `def lcs_tokens(a, b):
    n, m = len(a), len(b)
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(n - 1, -1, -1):
        for j in range(m - 1, -1, -1):
            if a[i] == b[j]:
                dp[i][j] = 1 + dp[i + 1][j + 1]
            else:
                dp[i][j] = max(dp[i + 1][j], dp[i][j + 1])
    result = []
    i = 0
    j = 0
    while i < n and j < m:
        if a[i] == b[j]:
            result.append(a[i])
            i += 1
            j += 1
        elif dp[i + 1][j] >= dp[i][j + 1]:
            i += 1
        else:
            j += 1
    return result`,
    testCases: [
      { input: [["a", "b", "c"], ["a", "c"]], expected: ["a", "c"] },
      { input: [["the", "cat", "sat"], ["the", "dog", "sat"]], expected: ["the", "sat"] },
      { input: [[], ["a"]], expected: [] },
      { input: [["a", "b"], ["b", "a"]], expected: ["b"] },
      { input: [["x", "y", "z", "w"], ["y", "z", "x"]], expected: ["y", "z"] },
    ],
    hint: "Build the DP table from the end, then walk forward following equal tokens first.",
  },
  {
    id: "nlp-049",
    title: "Softmax over Attention Scores",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the softmax of a list of scores, computed with the max-subtraction trick: subtract the maximum score, exponentiate, and divide each value by the sum.\n\nReturn an empty list for empty input.",
    starterCode: `import math
def softmax_scores(scores):
    # Your code here
    pass`,
    solution: `import math
def softmax_scores(scores):
    if not scores:
        return []
    mx = max(scores)
    exps = [math.exp(s - mx) for s in scores]
    total = sum(exps)
    return [e / total for e in exps]`,
    testCases: [
      {
        input: [[1.0, 2.0, 3.0]],
        expected: [0.09003057317038046, 0.24472847105479764, 0.6652409557748218],
      },
      { input: [[0.0, 0.0]], expected: [0.5, 0.5] },
      { input: [[]], expected: [] },
      { input: [[1000.0, 1000.0]], expected: [0.5, 0.5] },
      {
        input: [[-1.0, 0.0, 1.0]],
        expected: [0.09003057317038046, 0.24472847105479764, 0.6652409557748218],
      },
    ],
    hint: "Subtracting the max keeps exp from overflowing without changing the result.",
  },
  {
    id: "nlp-050",
    title: "Scaled Dot-Product Attention",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Compute single-head scaled dot-product attention. query is a vector, and keys and values are lists of equal-length vectors.\n\nScores are dot(query, keys[i]) divided by the square root of len(query), passed through a softmax, and the output is the weighted sum of the value vectors. Return an empty list when keys is empty.",
    starterCode: `import math
def scaled_dot_product_attention(query, keys, values):
    # Your code here
    pass`,
    solution: `import math
def scaled_dot_product_attention(query, keys, values):
    if not keys:
        return []
    d = len(query)
    scores = []
    for k in keys:
        dot = sum(a * b for a, b in zip(query, k))
        scores.append(dot / math.sqrt(d))
    mx = max(scores)
    exps = [math.exp(s - mx) for s in scores]
    total = sum(exps)
    weights = [e / total for e in exps]
    output = []
    for j in range(len(values[0])):
        output.append(sum(weights[i] * values[i][j] for i in range(len(weights))))
    return output`,
    testCases: [
      {
        input: [[1.0, 0.0], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]]],
        expected: [0.6697615493266569, 0.3302384506733431],
      },
      {
        input: [
          [0.0, 0.0],
          [[1.0, 0.0], [0.0, 1.0], [1.0, 1.0]],
          [[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]],
        ],
        expected: [3.0, 4.0],
      },
      {
        input: [[1.0, 0.0, 0.0], [[1.0, 0.0, 0.0]], [[2.0, 4.0, 6.0]]],
        expected: [2.0, 4.0, 6.0],
      },
      { input: [[1.0, 1.0], [], []], expected: [] },
    ],
    hint: "The softmax weights are per key; use them to average the rows of values column by column.",
  },
];
