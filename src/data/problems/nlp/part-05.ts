import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "nlp-141",
    title: "RAG Retrieval Top-k",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the top-k passage ids for a query. passages is a list of [id, vector] pairs.\n\nScore each passage by the dot product with query, then sort by descending score with ties broken alphabetically by id. Return an empty list when k <= 0.",
    starterCode: `def rag_topk(query, passages, k):
    # Your code here
    pass`,
    solution: `def rag_topk(query, passages, k):
    if k <= 0:
        return []
    scored = []
    for item in passages:
        score = sum(a * b for a, b in zip(query, item[1]))
        scored.append((item[0], score))
    scored.sort(key=lambda p: (-p[1], p[0]))
    return [p[0] for p in scored[:k]]`,
    testCases: [
      {
        input: [[1, 0], [["a", [1, 0]], ["b", [0, 1]], ["c", [2, 0]]], 2],
        expected: ["c", "a"],
      },
      { input: [[1, 1], [["x", [1, 1]], ["y", [0, 1]]], 1], expected: ["x"] },
      { input: [[1, 0], [["b", [0, 1]], ["a", [0, 1]]], 2], expected: ["a", "b"] },
      { input: [[1, 0], [], 3], expected: [] },
      { input: [[1, 0], [["a", [1, 0]]], 0], expected: [] },
    ],
    hint: "Sort by the tuple (negative score, id) to get the tie-breaking for free.",
  },
  {
    id: "nlp-142",
    title: "Dense Passage Dot Score",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the dense retrieval score of a query and a passage: their dot product.\n\nThe vectors are zipped and are assumed to have equal length, so the shorter one limits the sum.",
    starterCode: `def dense_dot_score(query, passage):
    # Your code here
    pass`,
    solution: `def dense_dot_score(query, passage):
    return sum(a * b for a, b in zip(query, passage))`,
    testCases: [
      { input: [[1, 2], [3, 4]], expected: 11 },
      { input: [[0, 0], [5, 6]], expected: 0 },
      { input: [[1, 1, 1], [1, 1, 1]], expected: 3 },
      { input: [[], []], expected: 0 },
      { input: [[-1, 2], [3, -1]], expected: -5 },
    ],
    hint: "A dot product multiplies coordinates pairwise and sums the products.",
  },
  {
    id: "nlp-143",
    title: "Reranker Feature Build",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Build a four-element reranker feature vector: [retrieval_score, query-overlap count, query length, passage length].\n\nThe overlap count is the number of distinct query terms that occur anywhere in the passage.",
    starterCode: `def reranker_feature_build(retrieval_score, query_tokens, passage_tokens):
    # Your code here
    pass`,
    solution: `def reranker_feature_build(retrieval_score, query_tokens, passage_tokens):
    p = set(passage_tokens)
    overlap = sum(1 for t in set(query_tokens) if t in p)
    return [retrieval_score, overlap, len(query_tokens), len(passage_tokens)]`,
    testCases: [
      { input: [0.8, ["cat", "sat"], ["the", "cat", "sat", "down"]], expected: [0.8, 2, 2, 4] },
      { input: [0.5, ["dog"], ["cat", "dog"]], expected: [0.5, 1, 1, 2] },
      { input: [0.0, [], ["a"]], expected: [0.0, 0, 0, 1] },
      { input: [1.0, ["a", "a"], ["a"]], expected: [1.0, 1, 2, 1] },
    ],
    hint: "Deduplicate the query tokens before counting overlap, but keep the raw lengths.",
  },
  {
    id: "nlp-144",
    title: "Cross-Encoder Pair Input",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Build the input token sequence for a cross-encoder: [CLS] followed by the query tokens, then [SEP], then the passage tokens, then a final [SEP].\n\nEmpty segments still contribute their separator tokens.",
    starterCode: `def cross_encoder_pair_input(query_tokens, passage_tokens):
    # Your code here
    pass`,
    solution: `def cross_encoder_pair_input(query_tokens, passage_tokens):
    return ["[CLS]"] + list(query_tokens) + ["[SEP]"] + list(passage_tokens) + ["[SEP]"]`,
    testCases: [
      {
        input: [["what", "is"], ["this"]],
        expected: ["[CLS]", "what", "is", "[SEP]", "this", "[SEP]"],
      },
      { input: [[], []], expected: ["[CLS]", "[SEP]", "[SEP]"] },
      { input: [["q"], ["p"]], expected: ["[CLS]", "q", "[SEP]", "p", "[SEP]"] },
    ],
    hint: "List concatenation keeps the order of segments and separators.",
  },
  {
    id: "nlp-145",
    title: "Query Expansion with Synonyms",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Expand query tokens with a synonym map. First collect the original tokens with duplicates removed, then for each original token in order append its synonyms in map order.\n\nSkip any token that is already present, including synonyms repeated across entries.",
    starterCode: `def query_expansion_synonyms(query_tokens, synonyms):
    # Your code here
    pass`,
    solution: `def query_expansion_synonyms(query_tokens, synonyms):
    result = []
    for t in query_tokens:
        if t not in result:
            result.append(t)
    for t in query_tokens:
        for s in synonyms.get(t, []):
            if s not in result:
                result.append(s)
    return result`,
    testCases: [
      {
        input: [["car", "fast"], { car: ["auto", "vehicle"], fast: ["quick"] }],
        expected: ["car", "fast", "auto", "vehicle", "quick"],
      },
      { input: [["a", "b"], { a: ["b"] }], expected: ["a", "b"] },
      { input: [[], { a: ["b"] }], expected: [] },
      { input: [["x"], {}], expected: ["x"] },
      { input: [["a", "a"], { a: ["a", "z"] }], expected: ["a", "z"] },
    ],
    hint: "A list preserves order while the membership checks enforce uniqueness.",
  },
  {
    id: "nlp-146",
    title: "BM25F Field-Weighted Score",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return a field-weighted BM25F score. For each field i add weights[i] * idf * (tf_i * (k1 + 1)) / (tf_i + k1 * (1 - b + b * len_i / avg_len_i)).\n\nidf = log(1 + (N - df + 0.5) / (df + 0.5)), and fields with term frequency 0 contribute nothing.",
    starterCode: `import math
def bm25f_score(term_freqs, field_lens, avg_field_lens, weights, df, n_docs, k1=1.5, b=0.75):
    # Your code here
    pass`,
    solution: `import math
def bm25f_score(term_freqs, field_lens, avg_field_lens, weights, df, n_docs, k1=1.5, b=0.75):
    idf_part = math.log(1 + (n_docs - df + 0.5) / (df + 0.5))
    total = 0.0
    for i in range(len(term_freqs)):
        tf = term_freqs[i]
        dl = field_lens[i]
        avg = avg_field_lens[i]
        denom = tf + k1 * (1 - b + b * dl / avg)
        total += weights[i] * idf_part * (tf * (k1 + 1)) / denom
    return total`,
    testCases: [
      { input: [[2, 0], [50, 100], [50, 100], [1.0, 0.5], 10, 100], expected: 3.233921799539688 },
      { input: [[1, 1], [25, 50], [50, 50], [1.0, 0.3], 1, 2], expected: 1.1023276129550097 },
      { input: [[0, 0], [50, 50], [50, 50], [1.0, 1.0], 5, 10], expected: 0.0 },
      { input: [[2, 2], [50, 50], [50, 50], [0.0, 1.0], 10, 100], expected: 3.233921799539688 },
    ],
    hint: "The idf factor is shared; each field only changes the saturation term and its weight.",
  },
  {
    id: "nlp-147",
    title: "Hybrid Score Fusion",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Fuse dense and sparse retrieval scores. Min-max normalize each score list to [0, 1], where a constant list becomes all 1.0.\n\nReturn alpha * dense_normalized + (1 - alpha) * sparse_normalized element-wise. Empty inputs give an empty list.",
    starterCode: `def hybrid_score_fusion(dense_scores, sparse_scores, alpha):
    # Your code here
    pass`,
    solution: `def hybrid_score_fusion(dense_scores, sparse_scores, alpha):
    def normalize(values):
        if not values:
            return []
        lo = min(values)
        hi = max(values)
        if hi == lo:
            return [1.0 for v in values]
        return [(v - lo) / (hi - lo) for v in values]

    d = normalize(dense_scores)
    s = normalize(sparse_scores)
    return [alpha * a + (1 - alpha) * b for a, b in zip(d, s)]`,
    testCases: [
      { input: [[0.2, 0.8], [10.0, 30.0], 0.5], expected: [0.0, 1.0] },
      { input: [[1.0, 2.0, 3.0], [0.0, 0.0, 0.0], 0.25], expected: [0.75, 0.875, 1.0] },
      { input: [[5.0, 5.0], [5.0, 5.0], 0.5], expected: [1.0, 1.0] },
      { input: [[], [], 0.5], expected: [] },
    ],
    hint: "Normalize both lists independently before blending them with the alpha weight.",
  },
  {
    id: "nlp-148",
    title: "Reciprocal Rank Fusion",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Combine ranked lists with reciprocal rank fusion. Each document receives the sum over lists of 1 / (k + rank), where rank starts at 1.\n\nReturn document ids sorted by descending fused score with alphabetical tie-breaking.",
    starterCode: `def reciprocal_rank_fusion(rankings, k=60):
    # Your code here
    pass`,
    solution: `def reciprocal_rank_fusion(rankings, k=60):
    scores = {}
    for ranking in rankings:
        for i, doc in enumerate(ranking):
            scores[doc] = scores.get(doc, 0.0) + 1.0 / (k + i + 1)
    return sorted(scores, key=lambda d: (-scores[d], d))`,
    testCases: [
      { input: [[["a", "b", "c"], ["b", "c", "a"]], 60], expected: ["b", "a", "c"] },
      { input: [[["a"], ["a"]], 1], expected: ["a"] },
      { input: [[], 60], expected: [] },
      { input: [[["x", "y"], []], 60], expected: ["x", "y"] },
    ],
    hint: "The same document can appear in several lists and accumulates each contribution.",
  },
  {
    id: "nlp-149",
    title: "Hard Negative Mining",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Mine hard negatives for a query. negatives is a list of [id, vector] pairs, and the positive is a vector.\n\nKeep negatives whose dot score with query is strictly below the positive's dot score, rank them by descending score with alphabetical tie-breaking, and return the top n ids.",
    starterCode: `def hard_negative_mining(query, positive, negatives, n):
    # Your code here
    pass`,
    solution: `def hard_negative_mining(query, positive, negatives, n):
    if n <= 0:
        return []
    pos_score = sum(a * b for a, b in zip(query, positive))
    scored = []
    for item in negatives:
        score = sum(a * b for a, b in zip(query, item[1]))
        if score < pos_score:
            scored.append((item[0], score))
    scored.sort(key=lambda p: (-p[1], p[0]))
    return [p[0] for p in scored[:n]]`,
    testCases: [
      {
        input: [[1, 0], [1, 0], [["n1", [0.5, 0]], ["n2", [2, 0]], ["n3", [0.9, 0]]], 2],
        expected: ["n3", "n1"],
      },
      { input: [[1, 0], [1, 0], [["a", [1, 0]]], 1], expected: [] },
      { input: [[1, 1], [0, 1], [["a", [0, 0]], ["b", [0, -1]]], 5], expected: ["a", "b"] },
      { input: [[1, 0], [1, 0], [], 1], expected: [] },
      { input: [[1, 0], [1, 0], [["a", [0, 1]]], 0], expected: [] },
    ],
    hint: "Scored at or above the positive are false negatives, so exclude them.",
  },
  {
    id: "nlp-150",
    title: "In-Batch Negatives Count",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the total number of in-batch negatives for a batch of size batch_size: every query is contrasted against the other batch_size - 1 passages.\n\nSo the count is batch_size * (batch_size - 1), and a non-positive batch size gives 0.",
    starterCode: `def in_batch_negatives_count(batch_size):
    # Your code here
    pass`,
    solution: `def in_batch_negatives_count(batch_size):
    if batch_size <= 0:
        return 0
    return batch_size * (batch_size - 1)`,
    testCases: [
      { input: [4], expected: 12 },
      { input: [1], expected: 0 },
      { input: [2], expected: 2 },
      { input: [0], expected: 0 },
    ],
    hint: "Each of the n queries sees n - 1 negatives.",
  },
  {
    id: "nlp-151",
    title: "Sentence-Transformer Mean Pooling",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Compute masked mean pooling over token vectors. Average only the vectors whose mask entry equals 1.\n\nReturn an empty list when no position is active, and take the vector dimension from the first active vector.",
    starterCode: `def mean_pool_masked(vectors, mask):
    # Your code here
    pass`,
    solution: `def mean_pool_masked(vectors, mask):
    active = [v for v, m in zip(vectors, mask) if m == 1]
    if not active:
        return []
    d = len(active[0])
    return [sum(v[k] for v in active) / len(active) for k in range(d)]`,
    testCases: [
      { input: [[[1, 2], [3, 4], [5, 6]], [1, 0, 1]], expected: [3.0, 4.0] },
      { input: [[[1, 1], [2, 2]], [1, 1]], expected: [1.5, 1.5] },
      { input: [[[1, 2]], [0]], expected: [] },
      { input: [[[1, 2], [3, 4]], [1, 1]], expected: [2.0, 3.0] },
      { input: [[], []], expected: [] },
    ],
    hint: "Filter the vectors by mask first, then average each coordinate.",
  },
  {
    id: "nlp-152",
    title: "Whitening Transform",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Apply z-score whitening per dimension: (x - mean) / std.\n\nDimensions with zero standard deviation become 0.0. The lists are zipped, so the shortest one determines the output length.",
    starterCode: `def whitening_transform(vector, mean, std):
    # Your code here
    pass`,
    solution: `def whitening_transform(vector, mean, std):
    result = []
    for x, m, s in zip(vector, mean, std):
        if s != 0:
            result.append((x - m) / s)
        else:
            result.append(0.0)
    return result`,
    testCases: [
      { input: [[2, 4], [0, 2], [1, 2]], expected: [2.0, 1.0] },
      { input: [[1, 1], [1, 1], [0, 0]], expected: [0.0, 0.0] },
      { input: [[0, 0], [0, 0], [1, 1]], expected: [0.0, 0.0] },
      { input: [[3, 5, 7], [1, 1, 1], [2, 2, 2]], expected: [1.0, 2.0, 3.0] },
    ],
    hint: "Guard against division by zero before subtracting and dividing.",
  },
  {
    id: "nlp-153",
    title: "STS Similarity Label",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Map a similarity score to an integer STS label from 0 to 5 using fixed thresholds: below 0.2, then below 0.4, 0.6, 0.8, and 0.95, else 5.\n\nA score exactly on a threshold falls into the higher bucket.",
    starterCode: `def sts_similarity_label(similarity):
    # Your code here
    pass`,
    solution: `def sts_similarity_label(similarity):
    if similarity < 0.2:
        return 0
    if similarity < 0.4:
        return 1
    if similarity < 0.6:
        return 2
    if similarity < 0.8:
        return 3
    if similarity < 0.95:
        return 4
    return 5`,
    testCases: [
      { input: [0.1], expected: 0 },
      { input: [0.3], expected: 1 },
      { input: [0.6], expected: 3 },
      { input: [0.95], expected: 5 },
      { input: [1.0], expected: 5 },
      { input: [0.2], expected: 1 },
    ],
    hint: "Chain the strict less-than checks so boundary values fall through.",
  },
  {
    id: "nlp-154",
    title: "NLI Entailment Logits",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Compute NLI entailment logits. Build pair features as the element-wise product of premise and hypothesis, then for each class row return dot(row, features) + bias[class].\n\nclass_vectors has one row per class and bias has one entry per class, both returned in input order.",
    starterCode: `def nli_entailment_logits(premise, hypothesis, class_vectors, bias):
    # Your code here
    pass`,
    solution: `def nli_entailment_logits(premise, hypothesis, class_vectors, bias):
    features = [a * b for a, b in zip(premise, hypothesis)]
    result = []
    for k in range(len(class_vectors)):
        row = class_vectors[k]
        result.append(sum(w * f for w, f in zip(row, features)) + bias[k])
    return result`,
    testCases: [
      {
        input: [
          [1.0, 0.0],
          [1.0, 1.0],
          [[1.0, 0.0], [0.0, 1.0], [0.5, 0.5]],
          [0.1, -0.1, 0.0],
        ],
        expected: [1.1, -0.1, 0.5],
      },
      { input: [[0.5, 0.5], [0.5, 0.5], [[1.0, 1.0]], [0.0]], expected: [0.5] },
      { input: [[1.0, 2.0], [0.0, 0.0], [[1.0, 1.0], [1.0, -1.0]], [0.0, 0.0]], expected: [0.0, 0.0] },
      { input: [[], [], [[1.0]], [0.5]], expected: [0.5] },
    ],
    hint: "The interaction features are products; each class is then a linear layer over them.",
  },
  {
    id: "nlp-155",
    title: "Contradiction Probability",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the softmax probability of the contradiction class (index 1) over the NLI logits.\n\nUse the max-subtraction trick for numerical stability. The logits must contain at least two entries.",
    starterCode: `import math
def contradiction_probability(logits):
    # Your code here
    pass`,
    solution: `import math
def contradiction_probability(logits):
    mx = max(logits)
    exps = [math.exp(x - mx) for x in logits]
    total = sum(exps)
    return exps[1] / total`,
    testCases: [
      { input: [[2.0, 1.0, 0.0]], expected: 0.24472847105479764 },
      { input: [[0.0, 0.0, 0.0]], expected: 0.3333333333333333 },
      { input: [[0.0, 5.0, 0.0]], expected: 0.986703291042268 },
      { input: [[1.0, 1.0]], expected: 0.5 },
    ],
    hint: "Compute the full softmax first, then read the probability at index 1.",
  },
  {
    id: "nlp-156",
    title: "QA Start/End Span Scores",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Rank all valid QA spans. For each start i and end j with j >= i, the span score is start_logits[i] + end_logits[j].\n\nReturn [i, j, score] triples sorted by descending score, then ascending i, then ascending j.",
    starterCode: `def qa_span_scores(start_logits, end_logits):
    # Your code here
    pass`,
    solution: `def qa_span_scores(start_logits, end_logits):
    spans = []
    for i in range(len(start_logits)):
        for j in range(i, len(end_logits)):
            spans.append([i, j, start_logits[i] + end_logits[j]])
    spans.sort(key=lambda s: (-s[2], s[0], s[1]))
    return spans`,
    testCases: [
      {
        input: [[0.5, 0.1], [0.4, 0.2]],
        expected: [[0, 0, 0.9], [0, 1, 0.7], [1, 1, 0.30000000000000004]],
      },
      {
        input: [[1.0, 0.0], [0.0, 1.0]],
        expected: [[0, 1, 2.0], [0, 0, 1.0], [1, 1, 1.0]],
      },
      { input: [[], []], expected: [] },
      { input: [[0.5], []], expected: [] },
    ],
    hint: "Enumerate every i <= j pair, then sort with the composite key.",
  },
  {
    id: "nlp-157",
    title: "Best Span Selection",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Select the best QA span with a maximum length constraint: maximize start_logits[i] + end_logits[j] over j >= i and j - i + 1 <= max_len.\n\nReturn [i, j, score] with the lowest i and then lowest j winning ties, or an empty list when no span is valid.",
    starterCode: `def best_span_selection(start_logits, end_logits, max_len):
    # Your code here
    pass`,
    solution: `def best_span_selection(start_logits, end_logits, max_len):
    best = None
    best_score = None
    for i in range(len(start_logits)):
        for j in range(i, min(i + max_len, len(end_logits))):
            score = start_logits[i] + end_logits[j]
            if best_score is None or score > best_score:
                best = [i, j, score]
                best_score = score
    if best is None:
        return []
    return best`,
    testCases: [
      { input: [[0.5, 0.1], [0.4, 0.2], 2], expected: [0, 0, 0.9] },
      { input: [[0.0, 0.0], [0.0, 0.0], 1], expected: [0, 0, 0.0] },
      { input: [[1.0, 0.0, 0.0], [0.0, 0.0, 2.0], 1], expected: [2, 2, 2.0] },
      { input: [[0.0, 0.0], [0.0, 0.0], 0], expected: [] },
      { input: [[], [], 2], expected: [] },
    ],
    hint: "Only replace the best on a strictly greater score so ties keep the earliest span.",
  },
  {
    id: "nlp-158",
    title: "QA Token F1",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the QA token F1 between prediction and gold after normalization: lowercase, replace non-alphanumeric characters with spaces, drop the articles a, an, and the, then compute clipped multiset F1.\n\nPrecision is matches / predicted tokens, recall is matches / gold tokens, and F1 = 2PR/(P+R). Return 1.0 when both sides normalize to empty and 0.0 when only one side is empty or nothing matches.",
    starterCode: `import re
def qa_token_f1(prediction, gold):
    # Your code here
    pass`,
    solution: `import re
def qa_token_f1(prediction, gold):
    def normalize(text):
        text = text.lower()
        text = re.sub("[^a-z0-9 ]", " ", text)
        tokens = [t for t in text.split() if t not in ("a", "an", "the")]
        return tokens

    p = normalize(prediction)
    g = normalize(gold)
    if not p and not g:
        return 1.0
    if not p or not g:
        return 0.0
    pc = {}
    for t in p:
        pc[t] = pc.get(t, 0) + 1
    gc = {}
    for t in g:
        gc[t] = gc.get(t, 0) + 1
    matches = sum(min(pc[t], gc[t]) for t in pc if t in gc)
    if matches == 0:
        return 0.0
    precision = matches / len(p)
    recall = matches / len(g)
    return 2 * precision * recall / (precision + recall)`,
    testCases: [
      { input: ["The cat", "cat"], expected: 1.0 },
      { input: ["a dog", "the dog!"], expected: 1.0 },
      { input: ["cat", "cats"], expected: 0.0 },
      { input: ["the", "the"], expected: 1.0 },
      { input: ["red car", "blue car"], expected: 0.5 },
    ],
    hint: "Normalize both sides identically before the clipped multiset matching.",
  },
  {
    id: "nlp-159",
    title: "Exact Match Normalization",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return True when prediction and gold are equal after QA normalization: lowercase, replace non-alphanumeric characters with spaces, drop the articles a, an, and the, and join the remaining tokens with single spaces.\n\nTwo inputs that both normalize to the empty string count as a match.",
    starterCode: `import re
def exact_match_normalization(prediction, gold):
    # Your code here
    pass`,
    solution: `import re
def exact_match_normalization(prediction, gold):
    def normalize(text):
        text = text.lower()
        text = re.sub("[^a-z0-9 ]", " ", text)
        tokens = [t for t in text.split() if t not in ("a", "an", "the")]
        return " ".join(tokens)

    return normalize(prediction) == normalize(gold)`,
    testCases: [
      { input: ["The Cat!", "cat"], expected: true },
      { input: ["a dog", "The dog."], expected: true },
      { input: ["cat", "cats"], expected: false },
      { input: ["", ""], expected: true },
    ],
    hint: "Apply the same canonicalization to both strings, then compare equality.",
  },
  {
    id: "nlp-160",
    title: "Dialogue State Slot Update",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Apply dialogue state updates to a copy of state. Each update is [slot, value].\n\nA value of 'none' removes the slot, 'dontcare' assigns that literal value, and anything else overwrites the slot. Updates apply in order, so later updates win.",
    starterCode: `def dialogue_state_slot_update(state, updates):
    # Your code here
    pass`,
    solution: `def dialogue_state_slot_update(state, updates):
    result = dict(state)
    for item in updates:
        slot, value = item[0], item[1]
        if value == "none":
            if slot in result:
                del result[slot]
        else:
            result[slot] = value
    return result`,
    testCases: [
      {
        input: [{ food: "thai", area: "north" }, [["food", "sushi"], ["area", "none"]]],
        expected: { food: "sushi" },
      },
      { input: [{ a: "1" }, [["b", "2"], ["c", "dontcare"]]], expected: { a: "1", b: "2", c: "dontcare" } },
      { input: [{}, [["x", "none"]]], expected: {} },
      { input: [{ a: "1" }, []], expected: { a: "1" } },
      { input: [{ a: "1" }, [["a", "none"], ["a", "2"]]], expected: { a: "2" } },
    ],
    hint: "Delete on none, assign otherwise, and never mutate the input dictionary.",
  },
  {
    id: "nlp-161",
    title: "Intent Top-1",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the intent with the highest score, keeping the earliest intent in the list on ties.\n\nReturn an empty string when the intent list is empty.",
    starterCode: `def intent_top1(intents, scores):
    # Your code here
    pass`,
    solution: `def intent_top1(intents, scores):
    if not intents:
        return ""
    best = ""
    best_score = None
    for i, name in enumerate(intents):
        s = scores[i]
        if best_score is None or s > best_score:
            best = name
            best_score = s
    return best`,
    testCases: [
      { input: [["greet", "order"], [0.2, 0.8]], expected: "order" },
      { input: [["a", "b"], [0.5, 0.5]], expected: "a" },
      { input: [[], []], expected: "" },
      { input: [["x", "y", "z"], [0.1, 0.9, 0.9]], expected: "y" },
    ],
    hint: "Only strictly greater scores replace the current best.",
  },
  {
    id: "nlp-162",
    title: "Slot BIO Decode",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Decode slot tags into a dictionary mapping each slot label to the list of extracted entity strings.\n\nB- starts a new value, I- continues the current slot when the label matches, an I- with a different label starts a new value of that label, and O closes the current slot. Multi-token values are joined with spaces.",
    starterCode: `def slot_bio_decode(tokens, tags):
    # Your code here
    pass`,
    solution: `def slot_bio_decode(tokens, tags):
    result = {}
    current_label = ""
    current_tokens = []
    for tok, tag in zip(tokens, tags):
        if tag.startswith("B-"):
            if current_label:
                result.setdefault(current_label, []).append(" ".join(current_tokens))
            current_label = tag[2:]
            current_tokens = [tok]
        elif tag.startswith("I-"):
            label = tag[2:]
            if current_label == label:
                current_tokens.append(tok)
            else:
                if current_label:
                    result.setdefault(current_label, []).append(" ".join(current_tokens))
                current_label = label
                current_tokens = [tok]
        else:
            if current_label:
                result.setdefault(current_label, []).append(" ".join(current_tokens))
                current_label = ""
                current_tokens = []
    if current_label:
        result.setdefault(current_label, []).append(" ".join(current_tokens))
    return result`,
    testCases: [
      { input: [["fly", "to", "paris"], ["O", "O", "B-city"]], expected: { city: ["paris"] } },
      {
        input: [
          ["new", "york", "to", "boston"],
          ["B-city", "I-city", "O", "B-city"],
        ],
        expected: { city: ["new york", "boston"] },
      },
      { input: [["i", "am", "here"], ["O", "B-state", "O"]], expected: { state: ["am"] } },
      { input: [[], []], expected: {} },
      { input: [["a", "b"], ["B-x", "I-y"]], expected: { x: ["a"], y: ["b"] } },
    ],
    hint: "Flush the current value whenever the label changes or an O appears.",
  },
  {
    id: "nlp-163",
    title: "Response Retrieval by Cosine",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the id of the response with the highest cosine similarity to the query. responses is a list of [id, vector].\n\nTies are broken alphabetically by id, and a zero-norm query or vector scores 0.0. Return an empty string for an empty response list.",
    starterCode: `import math
def response_retrieval_cosine(query, responses):
    # Your code here
    pass`,
    solution: `import math
def response_retrieval_cosine(query, responses):
    if not responses:
        return ""
    best = ""
    best_sim = -2.0
    nq = sum(x * x for x in query) ** 0.5
    for item in sorted(responses, key=lambda r: r[0]):
        rid, vec = item[0], item[1]
        dot = sum(a * b for a, b in zip(query, vec))
        nv = sum(x * x for x in vec) ** 0.5
        sim = dot / (nq * nv) if nq > 0 and nv > 0 else 0.0
        if sim > best_sim:
            best = rid
            best_sim = sim
    return best`,
    testCases: [
      { input: [[1, 0], [["r1", [1, 0]], ["r2", [0, 1]], ["r3", [1, 1]]]], expected: "r1" },
      { input: [[1, 0], [["b", [0, 1]], ["a", [0, 1]]]], expected: "a" },
      { input: [[0, 0], [["a", [1, 0]]]], expected: "a" },
      { input: [[], [["a", [1, 0]], ["b", [1, 0]]]], expected: "a" },
      { input: [[1, 0], []], expected: "" },
    ],
    hint: "Sort by id before scanning so strict improvements break ties alphabetically.",
  },
  {
    id: "nlp-164",
    title: "Persona Consistency Score",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Score persona consistency: for each persona sentence, take the maximum Jaccard similarity between its token set and any response sentence token set, then average over persona sentences.\n\nReturn 0.0 when there are no persona sentences, and an empty response set contributes 0.0 for each persona sentence.",
    starterCode: `def persona_consistency_score(persona_sentences, response_sentences):
    # Your code here
    pass`,
    solution: `def persona_consistency_score(persona_sentences, response_sentences):
    if not persona_sentences:
        return 0.0
    resp_sets = [set(s) for s in response_sentences]
    total = 0.0
    for p in persona_sentences:
        ps = set(p)
        best = 0.0
        for rs in resp_sets:
            union = ps | rs
            j = len(ps & rs) / len(union) if union else 0.0
            if j > best:
                best = j
        total += best
    return total / len(persona_sentences)`,
    testCases: [
      { input: [[["i", "love", "coffee"]], [["i", "love", "coffee"]]], expected: 1.0 },
      { input: [[["a", "b"]], [["c"]]], expected: 0.0 },
      { input: [[["a", "b"], ["c"]], [["a"], ["c", "d"]]], expected: 0.5 },
      { input: [[], [["x"]]], expected: 0.0 },
      { input: [[["x"]], []], expected: 0.0 },
    ],
    hint: "Jaccard compares token sets, and each persona sentence picks its best matching response.",
  },
  {
    id: "nlp-165",
    title: "Toxicity Lexicon Score",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the fraction of tokens that appear in the toxicity lexicon, matching case-insensitively.\n\nRepeated toxic tokens count each time, and an empty token list gives 0.0.",
    starterCode: `def toxicity_lexicon_score(tokens, lexicon):
    # Your code here
    pass`,
    solution: `def toxicity_lexicon_score(tokens, lexicon):
    if not tokens:
        return 0.0
    lex = set(w.lower() for w in lexicon)
    return sum(1 for t in tokens if t.lower() in lex) / len(tokens)`,
    testCases: [
      { input: [["you", "are", "stupid"], ["stupid", "idiot"]], expected: 0.3333333333333333 },
      { input: [["good", "day"], ["bad"]], expected: 0.0 },
      { input: [[], ["x"]], expected: 0.0 },
      { input: [["Stupid", "STUPID"], ["stupid"]], expected: 1.0 },
    ],
    hint: "Lowercase both the tokens and the lexicon entries before comparing.",
  },
  {
    id: "nlp-166",
    title: "Sentiment Lexicon Score",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the sum of lexicon polarities for the tokens present, divided by the total token count.\n\nTokens missing from the lexicon contribute 0, and an empty token list gives 0.0.",
    starterCode: `def sentiment_lexicon_score(tokens, lexicon):
    # Your code here
    pass`,
    solution: `def sentiment_lexicon_score(tokens, lexicon):
    if not tokens:
        return 0.0
    return sum(lexicon.get(t, 0) for t in tokens) / len(tokens)`,
    testCases: [
      { input: [["i", "love", "this"], { love: 1, hate: -1 }], expected: 0.3333333333333333 },
      { input: [["i", "hate", "it"], { love: 1, hate: -1 }], expected: -0.3333333333333333 },
      { input: [["love", "hate"], { love: 1, hate: -1 }], expected: 0.0 },
      { input: [[], { a: 1 }], expected: 0.0 },
      { input: [["ok"], { ok: 2 }], expected: 2.0 },
    ],
    hint: "Polarities can be any real weights, so the score can exceed 1 or drop below 0.",
  },
  {
    id: "nlp-167",
    title: "Aspect Sentiment Pairs",
    category: "NLP",
    difficulty: "Medium",
    description:
      "For each aspect word occurrence, sum the polarities of all lexicon-scored tokens within window positions on either side, inclusive of the aspect itself.\n\nReturn [aspect, score] pairs in order of occurrence. Aspects not present in the lexicon still produce a pair with score 0.0.",
    starterCode: `def aspect_sentiment_pairs(tokens, aspects, lexicon, window):
    # Your code here
    pass`,
    solution: `def aspect_sentiment_pairs(tokens, aspects, lexicon, window):
    a = set(aspects)
    result = []
    for i, tok in enumerate(tokens):
        if tok in a:
            score = 0.0
            for j in range(max(0, i - window), min(len(tokens), i + window + 1)):
                score += lexicon.get(tokens[j], 0)
            result.append([tok, score])
    return result`,
    testCases: [
      { input: [["food", "was", "great"], ["food"], { great: 1 }, 2], expected: [["food", 1.0]] },
      { input: [["bad", "food", "bad"], ["food"], { bad: -1 }, 1], expected: [["food", -2.0]] },
      { input: [["food"], ["food"], {}, 3], expected: [["food", 0.0]] },
      {
        input: [["a", "food", "b", "food"], ["food"], { a: 1, b: 2 }, 1],
        expected: [["food", 3.0], ["food", 2.0]],
      },
      { input: [["nope"], ["food"], { nope: 1 }, 1], expected: [] },
    ],
    hint: "Clamp the window range to the sequence boundaries before summing.",
  },
  {
    id: "nlp-168",
    title: "Emotion Probability Vector",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Convert emotion counts to a Laplace-smoothed probability vector: (count + 1) / (total + number of emotions).\n\nEvery count receives the same additive smoothing, so the vector always sums to 1. Return an empty list for empty input.",
    starterCode: `def emotion_probability_vector(counts):
    # Your code here
    pass`,
    solution: `def emotion_probability_vector(counts):
    if not counts:
        return []
    total = sum(counts)
    n = len(counts)
    return [(c + 1) / (total + n) for c in counts]`,
    testCases: [
      { input: [[1, 1, 1, 1]], expected: [0.25, 0.25, 0.25, 0.25] },
      { input: [[0, 0]], expected: [0.5, 0.5] },
      { input: [[3, 0]], expected: [0.8, 0.2] },
      { input: [[]], expected: [] },
      { input: [[5]], expected: [1.0] },
    ],
    hint: "Add one to every count and to the denominator once per emotion class.",
  },
  {
    id: "nlp-169",
    title: "LDA Document-Topic Step",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Perform one document-topic E-step of LDA. For each topic, gamma = sum over words of count_w * P(word | topic), then normalize the gammas into a distribution over topics.\n\nReturn a uniform distribution when the total gamma is 0 (including a document with no words), and an empty dictionary when there are no topics.",
    starterCode: `def lda_doc_topic_step(doc_counts, topic_word_probs):
    # Your code here
    pass`,
    solution: `def lda_doc_topic_step(doc_counts, topic_word_probs):
    if not topic_word_probs:
        return {}
    gammas = {}
    total = 0.0
    for topic in sorted(topic_word_probs):
        dist = topic_word_probs[topic]
        g = 0.0
        for word in sorted(doc_counts):
            g += doc_counts[word] * dist.get(word, 0.0)
        gammas[topic] = g
        total += g
    if total <= 0:
        n = len(topic_word_probs)
        return {t: 1.0 / n for t in sorted(topic_word_probs)}
    return {t: gammas[t] / total for t in sorted(gammas)}`,
    testCases: [
      {
        input: [{ cat: 2, dog: 1 }, { t1: { cat: 0.5, dog: 0.5 }, t2: { cat: 0.1, dog: 0.9 } }],
        expected: { t1: 0.5769230769230769, t2: 0.4230769230769231 },
      },
      {
        input: [{ cat: 0, dog: 0 }, { t1: { cat: 0.5, dog: 0.5 }, t2: { cat: 0.1, dog: 0.9 } }],
        expected: { t1: 0.5, t2: 0.5 },
      },
      {
        input: [{}, { t1: { cat: 0.5, dog: 0.5 }, t2: { cat: 0.1, dog: 0.9 } }],
        expected: { t1: 0.5, t2: 0.5 },
      },
      { input: [{ cat: 1 }, {}], expected: {} },
      { input: [{ cat: 1 }, { t1: { cat: 1.0 } }], expected: { t1: 1.0 } },
    ],
    hint: "Unnormalized gammas weight each topic by how well it explains the document counts.",
  },
  {
    id: "nlp-170",
    title: "Gibbs Sampling One Step",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Draw a new topic for one word with collapsed Gibbs sampling for LDA. For each topic k the unnormalized probability is (n_dk + alpha) * (n_kw + beta) / (n_k + vocab_size * beta), where n_dk comes from doc_topic, and n_kw and n_k come from topic_word.\n\nDraw a value with random.Random(seed) scaled by the total probability and return the selected topic. Return the first topic in sorted order when every probability is 0.",
    starterCode: `import random
def gibbs_sampling_step(doc_topic, topic_word, alpha, beta, vocab_size, word, seed):
    # Your code here
    pass`,
    solution: `import random
def gibbs_sampling_step(doc_topic, topic_word, alpha, beta, vocab_size, word, seed):
    rng = random.Random(seed)
    topics = sorted(set(doc_topic) | set(topic_word))
    probs = []
    total = 0.0
    for k in topics:
        n_dk = doc_topic.get(k, 0)
        dist = topic_word.get(k, {})
        n_kw = dist.get(word, 0)
        n_k = sum(dist.values())
        p = (n_dk + alpha) * (n_kw + beta) / (n_k + vocab_size * beta)
        probs.append(p)
        total += p
    if total <= 0:
        return topics[0] if topics else ""
    r = rng.random() * total
    acc = 0.0
    for k, p in zip(topics, probs):
        acc += p
        if r < acc:
            return k
    return topics[-1]`,
    testCases: [
      {
        input: [
          { t1: 2, t2: 1 },
          { t1: { cat: 3, dog: 1 }, t2: { cat: 1, dog: 2 } },
          0.5,
          0.1,
          2,
          "cat",
          42,
        ],
        expected: "t1",
      },
      {
        input: [
          { t1: 2, t2: 1 },
          { t1: { cat: 3, dog: 1 }, t2: { cat: 1, dog: 2 } },
          0.5,
          0.1,
          2,
          "cat",
          2,
        ],
        expected: "t2",
      },
      {
        input: [
          { t1: 2, t2: 1 },
          { t1: { cat: 3, dog: 1 }, t2: { cat: 1, dog: 2 } },
          0.5,
          0.1,
          2,
          "dog",
          1,
        ],
        expected: "t1",
      },
      { input: [{ a: 1 }, { a: { x: 1 } }, 0.1, 0.1, 3, "x", 5], expected: "a" },
    ],
    hint: "Iterate topics in sorted order so the seeded draw maps to a stable range.",
  },
  {
    id: "nlp-171",
    title: "LDA Perplexity",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Return the LDA corpus perplexity exp(-sum_d sum_w n_dw * log P(w | d) / total_words), where P(w | d) = sum over topics of theta_dk * phi_kw.\n\nReturn 1.0 when the corpus has no words.",
    starterCode: `import math
def lda_perplexity(doc_counts, thetas, phi):
    # Your code here
    pass`,
    solution: `import math
def lda_perplexity(doc_counts, thetas, phi):
    total_words = 0
    log_prob = 0.0
    for d, counts in enumerate(doc_counts):
        theta = thetas[d]
        for word in counts:
            p = 0.0
            for topic in theta:
                p += theta[topic] * phi.get(topic, {}).get(word, 0.0)
            if counts[word] > 0 and p > 0:
                log_prob += counts[word] * math.log(p)
            total_words += counts[word]
    if total_words == 0:
        return 1.0
    return math.exp(-log_prob / total_words)`,
    testCases: [
      {
        input: [
          [{ cat: 2, dog: 1 }],
          [{ t1: 0.5, t2: 0.5 }],
          { t1: { cat: 0.5, dog: 0.5 }, t2: { cat: 0.1, dog: 0.9 } },
        ],
        expected: 2.5131581370971796,
      },
      { input: [[], [], {}], expected: 1.0 },
      { input: [[{ cat: 0 }], [{ t1: 1.0 }], { t1: { cat: 1.0 } }], expected: 1.0 },
      {
        input: [
          [{ cat: 1 }, { dog: 1 }],
          [{ t1: 1.0 }, { t2: 1.0 }],
          { t1: { cat: 0.8, dog: 0.2 }, t2: { cat: 0.1, dog: 0.9 } },
        ],
        expected: 1.1785113019775793,
      },
    ],
    hint: "Mix the topic-word distributions with each document's topic weights before taking logs.",
  },
  {
    id: "nlp-172",
    title: "Topic Coherence (Lite)",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Compute a lite topic coherence. For each topic, average the PMI log((c12 * N) / (c1 * c2)) over all word pairs that have positive unigram and pair counts, treating pair counts as symmetric.\n\nReturn the average of the per-topic means, or 0.0 when no pair qualifies.",
    starterCode: `import math
def topic_coherence_lite(topics, word_counts, pair_counts, n_docs):
    # Your code here
    pass`,
    solution: `import math
def topic_coherence_lite(topics, word_counts, pair_counts, n_docs):
    topic_scores = []
    for words in topics:
        scores = []
        for i in range(len(words)):
            for j in range(i + 1, len(words)):
                w1, w2 = words[i], words[j]
                c1 = word_counts.get(w1, 0)
                c2 = word_counts.get(w2, 0)
                c12 = pair_counts.get(w1 + " " + w2, pair_counts.get(w2 + " " + w1, 0))
                if c1 > 0 and c2 > 0 and c12 > 0:
                    scores.append(math.log((c12 * n_docs) / (c1 * c2)))
        if scores:
            topic_scores.append(sum(scores) / len(scores))
    if not topic_scores:
        return 0.0
    return sum(topic_scores) / len(topic_scores)`,
    testCases: [
      { input: [[["cat", "dog"]], { cat: 2, dog: 2 }, { "cat dog": 1 }, 4], expected: 0.0 },
      { input: [[["cat", "dog"]], { cat: 2, dog: 2 }, { "cat dog": 2 }, 4], expected: 0.6931471805599453 },
      {
        input: [
          [["cat", "dog"], ["sun", "moon"]],
          { cat: 2, dog: 2, sun: 1, moon: 1 },
          { "cat dog": 2, "sun moon": 2 },
          4,
        ],
        expected: 1.3862943611198906,
      },
      { input: [[["cat", "dog"]], { cat: 0, dog: 2 }, { "cat dog": 2 }, 4], expected: 0.0 },
      { input: [[], {}, {}, 4], expected: 0.0 },
    ],
    hint: "Look up the pair count in both orders before computing the pointwise mutual information.",
  },
  {
    id: "nlp-173",
    title: "Embedding Drift Rate",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the average embedding drift 1 - cosine(old, new) over words present in both vector dictionaries.\n\nReturn 0.0 when there is no overlap between the two vocabularies.",
    starterCode: `import math
def embedding_drift_rate(old_vectors, new_vectors):
    # Your code here
    pass`,
    solution: `import math
def embedding_drift_rate(old_vectors, new_vectors):
    shared = sorted(set(old_vectors) & set(new_vectors))
    if not shared:
        return 0.0
    total = 0.0
    for w in shared:
        a = old_vectors[w]
        b = new_vectors[w]
        dot = sum(x * y for x, y in zip(a, b))
        na = sum(x * x for x in a) ** 0.5
        nb = sum(y * y for y in b) ** 0.5
        cos = dot / (na * nb) if na > 0 and nb > 0 else 0.0
        total += 1 - cos
    return total / len(shared)`,
    testCases: [
      { input: [{ a: [1, 0], b: [0, 1] }, { a: [1, 0], b: [1, 0] }], expected: 0.5 },
      { input: [{ a: [1, 0] }, { b: [1, 0] }], expected: 0.0 },
      { input: [{ a: [1, 0] }, { a: [1, 0] }], expected: 0.0 },
      { input: [{}, {}], expected: 0.0 },
      { input: [{ a: [1, 0] }, { a: [-1, 0] }], expected: 2.0 },
    ],
    hint: "Cosine distance is 1 minus cosine similarity, and the rate averages it over shared words.",
  },
  {
    id: "nlp-174",
    title: "Vocabulary Shift Rate",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the vocabulary shift rate: the size of the symmetric difference of the old and new vocabularies divided by the size of their union.\n\nDuplicates are ignored. Return 0.0 when both vocabularies are empty.",
    starterCode: `def vocabulary_shift_rate(old_vocab, new_vocab):
    # Your code here
    pass`,
    solution: `def vocabulary_shift_rate(old_vocab, new_vocab):
    o = set(old_vocab)
    n = set(new_vocab)
    union = o | n
    if not union:
        return 0.0
    return len(o ^ n) / len(union)`,
    testCases: [
      { input: [["a", "b", "c"], ["b", "c", "d"]], expected: 0.5 },
      { input: [["a", "b"], ["a", "b"]], expected: 0.0 },
      { input: [[], []], expected: 0.0 },
      { input: [[], ["x"]], expected: 1.0 },
      { input: [["a", "a"], ["a"]], expected: 0.0 },
    ],
    hint: "The caret operator on sets gives the symmetric difference.",
  },
  {
    id: "nlp-175",
    title: "Benchmark Field Validation",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the sorted list of record indices that fail validation. A record is invalid when any required field is missing, None, or an empty or whitespace-only string.\n\nAn empty required list makes every record valid.",
    starterCode: `def benchmark_field_validation(records, required_fields):
    # Your code here
    pass`,
    solution: `def benchmark_field_validation(records, required_fields):
    invalid = []
    for i, rec in enumerate(records):
        ok = True
        for field in required_fields:
            if field not in rec:
                ok = False
                break
            value = rec[field]
            if value is None or (isinstance(value, str) and not value.strip()):
                ok = False
                break
        if not ok:
            invalid.append(i)
    return invalid`,
    testCases: [
      {
        input: [[{ q: "a", a: "b" }, { q: "", a: "b" }, { q: "c" }], ["q", "a"]],
        expected: [1, 2],
      },
      { input: [[{ q: "a", a: "b" }], ["q", "a"]], expected: [] },
      { input: [[], ["q"]], expected: [] },
      { input: [[{ q: null, a: "b" }], ["q", "a"]], expected: [0] },
      { input: [[{ q: "a" }], []], expected: [] },
    ],
    hint: "Check membership first, then the value, and stop at the first failing field.",
  },
  {
    id: "nlp-176",
    title: "Metric Aggregation Weights",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the weighted average of the metrics: sum(metric * weight) / sum(weight).\n\nThe lists are zipped, so the shorter one determines the terms. Return 0.0 when the weights sum to 0.",
    starterCode: `def metric_aggregation_weights(metrics, weights):
    # Your code here
    pass`,
    solution: `def metric_aggregation_weights(metrics, weights):
    total = sum(weights)
    if total == 0:
        return 0.0
    return sum(m * w for m, w in zip(metrics, weights)) / total`,
    testCases: [
      { input: [[0.5, 1.0], [1, 3]], expected: 0.875 },
      { input: [[1.0, 2.0], [0, 0]], expected: 0.0 },
      { input: [[0.4], [2]], expected: 0.4 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Compute the weight sum once, then normalize the weighted total by it.",
  },
  {
    id: "nlp-177",
    title: "Bootstrap CI for Accuracy",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Return a seeded bootstrap confidence interval for accuracy. Resample flags with replacement n_resamples times using random.Random(seed), compute the accuracy of each resample, sort them, and return [lower, upper] at indices int(0.025 * n_resamples) and int(0.975 * n_resamples).\n\nReturn [0.0, 0.0] for empty input.",
    starterCode: `import random
def bootstrap_ci_seeded(flags, n_resamples, seed):
    # Your code here
    pass`,
    solution: `import random
def bootstrap_ci_seeded(flags, n_resamples, seed):
    if not flags:
        return [0.0, 0.0]
    rng = random.Random(seed)
    n = len(flags)
    accs = []
    for _ in range(n_resamples):
        hits = 0
        for _ in range(n):
            if flags[rng.randrange(n)]:
                hits += 1
        accs.append(hits / n)
    accs.sort()
    lower = accs[int(0.025 * n_resamples)]
    upper = accs[int(0.975 * n_resamples)]
    return [lower, upper]`,
    testCases: [
      { input: [[1, 1, 1, 0], 100, 42], expected: [0.25, 1.0] },
      { input: [[1, 1, 1, 0], 10, 1], expected: [0.0, 1.0] },
      { input: [[1, 1], 50, 3], expected: [1.0, 1.0] },
      { input: [[], 10, 1], expected: [0.0, 0.0] },
      { input: [[0], 7, 2], expected: [0.0, 0.0] },
    ],
    hint: "Run the resampling loop in a fixed order so the seeded sequence is reproducible.",
  },
  {
    id: "nlp-178",
    title: "Error Bucket Analysis",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Bucket errors by their gold label: count the misclassified examples per gold label.\n\nReturn only labels that have at least one error, and an empty dictionary when there are none.",
    starterCode: `def error_bucket_analysis(gold_labels, predicted_labels):
    # Your code here
    pass`,
    solution: `def error_bucket_analysis(gold_labels, predicted_labels):
    buckets = {}
    for g, p in zip(gold_labels, predicted_labels):
        if g != p:
            buckets[g] = buckets.get(g, 0) + 1
    return buckets`,
    testCases: [
      { input: [["a", "b", "c", "a"], ["a", "c", "c", "b"]], expected: { b: 1, a: 1 } },
      { input: [["a", "b"], ["a", "b"]], expected: {} },
      { input: [[], []], expected: {} },
      { input: [["x", "y"], ["y", "x"]], expected: { x: 1, y: 1 } },
    ],
    hint: "Key the buckets by the gold label, not the prediction.",
  },
  {
    id: "nlp-179",
    title: "Confusion Pair Mining",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Find the most frequent ordered confusion pair. Return [gold, predicted, count] with the highest count, breaking ties by gold and then predicted alphabetically.\n\nReturn an empty list when there are no errors.",
    starterCode: `def confusion_pair_mining(gold_labels, predicted_labels):
    # Your code here
    pass`,
    solution: `def confusion_pair_mining(gold_labels, predicted_labels):
    counts = {}
    for g, p in zip(gold_labels, predicted_labels):
        if g != p:
            key = (g, p)
            counts[key] = counts.get(key, 0) + 1
    if not counts:
        return []
    best = None
    best_count = -1
    for pair in sorted(counts):
        if counts[pair] > best_count:
            best = pair
            best_count = counts[pair]
    return [best[0], best[1], best_count]`,
    testCases: [
      { input: [["a", "a", "b", "b"], ["b", "c", "c", "a"]], expected: ["a", "b", 1] },
      { input: [["a", "a", "a"], ["b", "b", "c"]], expected: ["a", "b", 2] },
      { input: [["a", "b"], ["a", "b"]], expected: [] },
      { input: [[], []], expected: [] },
    ],
    hint: "Iterate the sorted pair keys and keep the first strict maximum.",
  },
  {
    id: "nlp-180",
    title: "Typo Robustness Check",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Compare clean and typo robustness. Return [clean_accuracy, typo_accuracy, clean_accuracy - typo_accuracy], where each accuracy is the fraction of True entries in its list.\n\nReturn [0.0, 0.0, 0.0] when either list is empty.",
    starterCode: `def typo_robustness_check(clean_correct, typo_correct):
    # Your code here
    pass`,
    solution: `def typo_robustness_check(clean_correct, typo_correct):
    if not clean_correct or not typo_correct:
        return [0.0, 0.0, 0.0]
    clean = sum(1 for x in clean_correct if x) / len(clean_correct)
    typo = sum(1 for x in typo_correct if x) / len(typo_correct)
    return [clean, typo, clean - typo]`,
    testCases: [
      { input: [[true, true, false, true], [true, false, false, false]], expected: [0.75, 0.25, 0.5] },
      { input: [[true, true], [true, true]], expected: [1.0, 1.0, 0.0] },
      { input: [[], []], expected: [0.0, 0.0, 0.0] },
      { input: [[true], [true]], expected: [1.0, 1.0, 0.0] },
    ],
    hint: "Sum the boolean flags and divide by each list's own length.",
  },
  {
    id: "nlp-181",
    title: "Paraphrase Accuracy",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the fraction of predictions that match the gold answer after canonicalization: lowercase, replace non-alphanumeric characters with spaces, and collapse whitespace.\n\nReturn 0.0 for an empty gold list, and zip so extra predictions are ignored.",
    starterCode: `import re
def paraphrase_accuracy(gold, predictions):
    # Your code here
    pass`,
    solution: `import re
def paraphrase_accuracy(gold, predictions):
    if not gold:
        return 0.0

    def canon(text):
        text = text.lower()
        text = re.sub("[^a-z0-9 ]", " ", text)
        return " ".join(text.split())

    correct = sum(1 for g, p in zip(gold, predictions) if canon(g) == canon(p))
    return correct / len(gold)`,
    testCases: [
      { input: [["The cat!", "a dog"], ["the cat", "dog"]], expected: 0.5 },
      { input: [["Hello"], ["hello!"]], expected: 1.0 },
      { input: [[], []], expected: 0.0 },
      { input: [["a b"], ["a  b"]], expected: 1.0 },
      { input: [["x"], ["y"]], expected: 0.0 },
    ],
    hint: "Canonicalization removes punctuation and squeezes repeated spaces.",
  },
  {
    id: "nlp-182",
    title: "Unanswerable Detection",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return True when the example should be treated as unanswerable: no span scores exist or the maximum score is strictly below threshold.\n\nA score exactly equal to the threshold is answerable.",
    starterCode: `def unanswerable_detection(span_scores, threshold):
    # Your code here
    pass`,
    solution: `def unanswerable_detection(span_scores, threshold):
    if not span_scores:
        return True
    return max(span_scores) < threshold`,
    testCases: [
      { input: [[0.1, 0.2], 0.5], expected: true },
      { input: [[0.6], 0.5], expected: false },
      { input: [[], 0.5], expected: true },
      { input: [[0.5], 0.5], expected: false },
    ],
    hint: "The comparison is strict less-than, so a threshold hit counts as answerable.",
  },
  {
    id: "nlp-183",
    title: "Hallucination Rate Proxy",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the hallucination rate: the fraction of claims containing at least one token that is absent from the evidence tokens.\n\nAn empty claim is always supported, and an empty claim list gives 0.0.",
    starterCode: `def hallucination_rate_proxy(claims, evidence_tokens):
    # Your code here
    pass`,
    solution: `def hallucination_rate_proxy(claims, evidence_tokens):
    if not claims:
        return 0.0
    evidence = set(evidence_tokens)
    unsupported = 0
    for claim in claims:
        if not all(t in evidence for t in claim):
            unsupported += 1
    return unsupported / len(claims)`,
    testCases: [
      { input: [[["the", "cat"]], ["the", "cat"]], expected: 0.0 },
      { input: [[["the", "cat"], ["the", "dog"]], ["the", "cat"]], expected: 0.5 },
      { input: [[["a"]], []], expected: 1.0 },
      { input: [[], ["a"]], expected: 0.0 },
      { input: [[[]], ["a"]], expected: 0.0 },
    ],
    hint: "all() over an empty claim is vacuously True, so empty claims are supported.",
  },
  {
    id: "nlp-184",
    title: "Retrieval Precision at k",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return precision at k: the fraction of the first k retrieved ids that are relevant.\n\nk is capped by the retrieved list length. Return 0.0 when k <= 0 or the retrieved list is empty.",
    starterCode: `def precision_at_k(retrieved, relevant, k):
    # Your code here
    pass`,
    solution: `def precision_at_k(retrieved, relevant, k):
    if k <= 0 or not retrieved:
        return 0.0
    cut = retrieved[:k]
    if not cut:
        return 0.0
    rel = set(relevant)
    return sum(1 for d in cut if d in rel) / len(cut)`,
    testCases: [
      { input: [["a", "b", "c", "d"], ["a", "c"], 2], expected: 0.5 },
      { input: [["a", "b"], ["a"], 1], expected: 1.0 },
      { input: [[], ["a"], 3], expected: 0.0 },
      { input: [["a"], ["b"], 0], expected: 0.0 },
      { input: [["a", "b"], ["a", "b"], 5], expected: 1.0 },
    ],
    hint: "Use the actual cut length in the denominator, not k itself.",
  },
  {
    id: "nlp-185",
    title: "Recall at k",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return recall at k: the fraction of relevant ids that appear among the first k retrieved.\n\nReturn 0.0 when k <= 0 or there are no relevant ids.",
    starterCode: `def recall_at_k(retrieved, relevant, k):
    # Your code here
    pass`,
    solution: `def recall_at_k(retrieved, relevant, k):
    if k <= 0 or not relevant:
        return 0.0
    cut = set(retrieved[:k])
    rel = set(relevant)
    return len(cut & rel) / len(rel)`,
    testCases: [
      { input: [["a", "b", "c"], ["a", "c", "d"], 2], expected: 0.3333333333333333 },
      { input: [["a", "b"], ["a"], 1], expected: 1.0 },
      { input: [[], ["a"], 2], expected: 0.0 },
      { input: [["a"], ["a"], 0], expected: 0.0 },
      { input: [["a", "b"], [], 1], expected: 0.0 },
    ],
    hint: "The denominator is the number of relevant ids, not the retrieval depth.",
  },
];

