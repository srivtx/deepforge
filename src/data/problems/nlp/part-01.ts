import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "nlp-001",
    title: "Tokenization",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Tokenize text into lowercase alphanumeric tokens.\n\nLowercase the text, replace any non-alphanumeric non-whitespace character with a space, then split on whitespace.",
    starterCode: `def tokenize(text):
    # Your code here
    pass`,
    solution: `def tokenize(text):
    text = text.lower()
    cleaned = ''.join(c if c.isalnum() or c.isspace() else ' ' for c in text)
    return cleaned.split()`,
    testCases: [
      { input: ["Hello, World!"], expected: ["hello", "world"] },
      { input: ["The quick brown fox."], expected: ["the", "quick", "brown", "fox"] },
      { input: ["Don't stop!"], expected: ["don", "t", "stop"] },
      { input: ["One2Three4"], expected: ["one2three4"] },
    ],
  },
  {
    id: "nlp-002",
    title: "Bag of Words",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Build a bag-of-words vector for a list of tokens given a fixed vocabulary.\n\nReturn a list where index i is the count of vocab[i] in tokens.",
    starterCode: `def bag_of_words(tokens, vocab):
    # Your code here
    pass`,
    solution: `def bag_of_words(tokens, vocab):
    counts = {w: 0 for w in vocab}
    for t in tokens:
        if t in counts:
            counts[t] += 1
    return [counts[w] for w in vocab]`,
    testCases: [
      { input: [["a", "b", "a"], ["a", "b", "c"]], expected: [2, 1, 0] },
      { input: [["the", "cat", "sat"], ["the", "cat", "dog"]], expected: [1, 1, 0] },
      { input: [[], ["a", "b"]], expected: [0, 0] },
      { input: [["x", "y", "z"], ["a", "b", "c"]], expected: [0, 0, 0] },
    ],
  },
  {
    id: "nlp-003",
    title: "TF-IDF",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Compute the TF-IDF matrix for a list of documents.\n\ndocs is a list of token lists. vocab is a list of unique terms.\n\nFor term t and document d:\n  tf(t, d) = count(t in d) / len(d)   (0 if len(d) == 0)\n  idf(t) = log(N / df(t))              (N = number of docs, df(t) = number of docs containing t)\n  tfidf(t, d) = tf(t, d) * idf(t)\n\nReturn an n_docs x n_vocab matrix.",
    starterCode: `import math
def tfidf(docs, vocab):
    # Your code here
    pass`,
    solution: `import math
def tfidf(docs, vocab):
    n_docs = len(docs)
    n_vocab = len(vocab)
    df = [0] * n_vocab
    for d in docs:
        for i, w in enumerate(vocab):
            if w in d:
                df[i] += 1
    idf = [math.log(n_docs / df[i]) if df[i] > 0 else 0.0 for i in range(n_vocab)]
    result = []
    for d in docs:
        total = len(d) if d else 0
        row = []
        for i, w in enumerate(vocab):
            tf = d.count(w) / total if total > 0 else 0.0
            row.append(tf * idf[i])
        result.append(row)
    return result`,
    testCases: [
      {
        input: [
          [["the", "cat", "sat"], ["the", "dog", "ran"], ["the", "bird"]],
          ["the", "cat", "dog", "ran", "bird", "sat"],
        ],
        expected: [
          [0.0, 0.3662040962227032, 0.0, 0.0, 0.0, 0.3662040962227032],
          [0.0, 0.0, 0.3662040962227032, 0.3662040962227032, 0.0, 0.0],
          [0.0, 0.0, 0.0, 0.0, 0.549306144333982, 0.0],
        ],
      },
      {
        input: [
          [["a", "b"], ["a", "c"]],
          ["a", "b", "c"],
        ],
        expected: [
          [0.0, 0.34657359027997264, 0.0],
          [0.0, 0.0, 0.34657359027997264],
        ],
      },
      {
        input: [
          [["a", "a", "b"], ["b", "c"]],
          ["a", "b", "c"],
        ],
        expected: [
          [0.46209812037329684, 0.0, 0.0],
          [0.0, 0.0, 0.34657359027997264],
        ],
      },
    ],
    hint: "df(t) counts docs containing t (not total occurrences). log is natural log.",
  },
  {
    id: "nlp-004",
    title: "N-grams",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Generate all n-grams of length n from a list of tokens.\n\nReturn a list of lists, where each inner list is a slice of n consecutive tokens.\n\nIf n <= 0 or len(tokens) < n, return an empty list.",
    starterCode: `def ngrams(tokens, n):
    # Your code here
    pass`,
    solution: `def ngrams(tokens, n):
    if n <= 0 or len(tokens) < n:
        return []
    return [tokens[i:i + n] for i in range(len(tokens) - n + 1)]`,
    testCases: [
      { input: [["a", "b", "c", "d"], 2], expected: [["a", "b"], ["b", "c"], ["c", "d"]] },
      { input: [["a", "b", "c"], 3], expected: [["a", "b", "c"]] },
      { input: [["a", "b"], 3], expected: [] },
      { input: [["a", "b", "c"], 1], expected: [["a"], ["b"], ["c"]] },
    ],
  },
  {
    id: "nlp-005",
    title: "Cosine Similarity of Token Vectors",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Compute the cosine similarity between two equal-length vectors:\n\ncos(v1, v2) = (v1 · v2) / (||v1|| * ||v2||)\n\nReturn 0.0 if either vector has zero norm.",
    starterCode: `def cosine_similarity(v1, v2):
    # Your code here
    pass`,
    solution: `def cosine_similarity(v1, v2):
    dot = sum(a * b for a, b in zip(v1, v2))
    n1 = sum(a * a for a in v1) ** 0.5
    n2 = sum(b * b for b in v2) ** 0.5
    if n1 == 0 or n2 == 0:
        return 0.0
    return dot / (n1 * n2)`,
    testCases: [
      { input: [[1, 0, 1], [1, 1, 0]], expected: 0.5 },
      { input: [[1, 1], [1, 1]], expected: 1.0 },
      { input: [[1, 0], [0, 1]], expected: 0.0 },
      { input: [[1, 2, 3], [2, 4, 6]], expected: 1.0 },
      { input: [[0, 0], [1, 1]], expected: 0.0 },
    ],
    hint: "Dot product over the product of L2 norms. Range: [-1, 1].",
  },
];
