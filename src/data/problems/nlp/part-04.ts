import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "nlp-096",
    title: "Byte-Level BPE Token Count",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the number of tokens a byte-level tokenizer would produce for text, which equals its UTF-8 byte length.\n\nASCII characters count as one byte, while accented letters and emoji may use several.",
    starterCode: `def byte_bpe_count(text):
    # Your code here
    pass`,
    solution: `def byte_bpe_count(text):
    return len(text.encode("utf-8"))`,
    testCases: [
      { input: ["abc"], expected: 3 },
      { input: [""], expected: 0 },
      { input: ["é"], expected: 2 },
      { input: ["😀"], expected: 4 },
      { input: ["aé"], expected: 3 },
    ],
    hint: "str.encode returns the UTF-8 bytes of a string.",
  },
  {
    id: "nlp-097",
    title: "Unigram Vocabulary Pruning",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Prune a unigram probability table to its most probable entries. Keep ceil(keep_fraction * len(probs)) tokens, ranked by descending probability with alphabetical tie-breaking.\n\nReturn the kept token-to-probability dictionary. A fraction of 0 or less yields an empty dictionary, and a fraction of 1 or more keeps everything.",
    starterCode: `import math
def unigram_prune(probs, keep_fraction):
    # Your code here
    pass`,
    solution: `import math
def unigram_prune(probs, keep_fraction):
    n = len(probs)
    if n == 0 or keep_fraction <= 0:
        return {}
    k = int(math.ceil(keep_fraction * n))
    if k >= n:
        return dict(probs)
    ordered = sorted(probs, key=lambda w: (-probs[w], w))
    return {w: probs[w] for w in ordered[:k]}`,
    testCases: [
      { input: [{ a: 0.5, b: 0.3, c: 0.2 }, 0.5], expected: { a: 0.5, b: 0.3 } },
      { input: [{ a: 0.1, b: 0.4, c: 0.5 }, 0.34], expected: { c: 0.5, b: 0.4 } },
      { input: [{ a: 0.5 }, 0.0], expected: {} },
      { input: [{ a: 0.5 }, 1.0], expected: { a: 0.5 } },
      { input: [{}, 0.5], expected: {} },
    ],
    hint: "Sort by the tuple (negative probability, token) and slice the first k entries.",
  },
  {
    id: "nlp-098",
    title: "WordPiece Segmentation Score",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Return the best WordPiece segmentation score for a word: the maximum sum of log piece probabilities over all valid segmentations.\n\nA piece starting the word uses its plain form as the dictionary key, while every later piece must use the continuation form prefixed with '##'. Return 0.0 when no full segmentation exists or the word is empty.",
    starterCode: `import math
def wordpiece_score(word, probs):
    # Your code here
    pass`,
    solution: `import math
def wordpiece_score(word, probs):
    n = len(word)
    neg = float("-inf")
    dp = [neg] * (n + 1)
    dp[0] = 0.0
    for i in range(n):
        if dp[i] == neg:
            continue
        for j in range(i + 1, n + 1):
            piece = word[i:j] if i == 0 else "##" + word[i:j]
            if piece in probs and probs[piece] > 0:
                score = dp[i] + math.log(probs[piece])
                if score > dp[j]:
                    dp[j] = score
    if dp[n] == neg:
        return 0.0
    return dp[n]`,
    testCases: [
      { input: ["ab", { a: 0.5, b: 0.5, "##b": 0.4, ab: 0.3 }], expected: -1.2039728043259361 },
      { input: ["abc", { a: 0.5, "##b": 0.5, "##c": 0.5 }], expected: -2.0794415416798357 },
      { input: ["xyz", { a: 0.5 }], expected: 0.0 },
      { input: ["", { a: 0.5 }], expected: 0.0 },
      { input: ["hello", { hel: 0.5, "##lo": 0.25, h: 0.9, "##ello": 0.9 }], expected: -0.21072103131565256 },
    ],
    hint: "dp[i] is the best score for the prefix of length i; only position 0 may use a non-continuation piece.",
  },
  {
    id: "nlp-099",
    title: "Tokenizer Fertility Ratio",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the tokenizer fertility: the average number of subword tokens per word.\n\nTokens prefixed with '##' are continuations and do not start a new word. Return 0.0 when no word starts appear.",
    starterCode: `def tokenizer_fertility(tokens):
    # Your code here
    pass`,
    solution: `def tokenizer_fertility(tokens):
    words = sum(1 for t in tokens if not t.startswith("##"))
    if words == 0:
        return 0.0
    return len(tokens) / words`,
    testCases: [
      { input: [["play", "##ing", "run", "##ning"]], expected: 2.0 },
      { input: [["hello", "world"]], expected: 1.0 },
      { input: [[]], expected: 0.0 },
      { input: [["##ed"]], expected: 0.0 },
    ],
    hint: "Count words as the tokens that do not begin with the continuation marker.",
  },
  {
    id: "nlp-100",
    title: "Character Coverage",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the fraction of characters in text that appear in the allowed character list.\n\nCount every occurrence, so repeated characters weigh equally, and return 0.0 for empty text.",
    starterCode: `def character_coverage(text, allowed):
    # Your code here
    pass`,
    solution: `def character_coverage(text, allowed):
    if not text:
        return 0.0
    a = set(allowed)
    return sum(1 for ch in text if ch in a) / len(text)`,
    testCases: [
      { input: ["abc", ["a", "b"]], expected: 0.6666666666666666 },
      { input: ["abc", ["a", "b", "c"]], expected: 1.0 },
      { input: ["", ["a"]], expected: 0.0 },
      { input: ["😀", ["😀"]], expected: 1.0 },
    ],
    hint: "Put allowed in a set, then count matching characters over the full length.",
  },
  {
    id: "nlp-101",
    title: "Strip Accents (NFC-lite)",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return text with diacritical marks removed. Normalize with Unicode NFD so base characters and combining marks are separate, then drop every combining character.\n\nCharacters without accents are left unchanged.",
    starterCode: `import unicodedata
def strip_accents(text):
    # Your code here
    pass`,
    solution: `import unicodedata
def strip_accents(text):
    decomposed = unicodedata.normalize("NFD", text)
    return "".join(ch for ch in decomposed if not unicodedata.combining(ch))`,
    testCases: [
      { input: ["café"], expected: "cafe" },
      { input: ["naïve"], expected: "naive" },
      { input: ["Añejo"], expected: "Anejo" },
      { input: ["abc"], expected: "abc" },
      { input: [""], expected: "" },
    ],
    hint: "unicodedata.combining returns non-zero for combining marks.",
  },
  {
    id: "nlp-102",
    title: "Turkish-Aware Case Folding",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Lowercase text using Turkish casing rules: uppercase dotted I (U+0130) becomes 'i' and uppercase dotless I becomes the dotless lowercase 'ı' (U+0131).\n\nAll other characters are lowercased normally.",
    starterCode: `def case_fold_turkish(text):
    # Your code here
    pass`,
    solution: `def case_fold_turkish(text):
    out = []
    for ch in text:
        if ch == "I":
            out.append("ı")
        elif ch == "İ":
            out.append("i")
        else:
            out.append(ch.lower())
    return "".join(out)`,
    testCases: [
      { input: ["Istanbul"], expected: "ıstanbul" },
      { input: ["İstanbul"], expected: "istanbul" },
      { input: ["MIXED Case"], expected: "mıxed case" },
      { input: ["HELLO"], expected: "hello" },
      { input: [""], expected: "" },
    ],
    hint: "Handle the two special I characters before falling back to lower().",
  },
  {
    id: "nlp-103",
    title: "Script Detection Heuristic",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the dominant script of text by counting characters: 'latin' for a-z and A-Z, 'cyrillic' for U+0400-U+04FF, 'arabic' for U+0600-U+06FF, 'han' for U+4E00-U+9FFF, and 'digit' for decimal digits.\n\nReturn the category with the highest count, breaking ties by that same priority order, and 'other' when no scored character appears.",
    starterCode: `def detect_script(text):
    # Your code here
    pass`,
    solution: `def detect_script(text):
    counts = {"latin": 0, "cyrillic": 0, "arabic": 0, "han": 0, "digit": 0}
    for ch in text:
        o = ord(ch)
        if ch.isdigit():
            counts["digit"] += 1
        elif ("a" <= ch <= "z") or ("A" <= ch <= "Z"):
            counts["latin"] += 1
        elif 0x0400 <= o <= 0x04FF:
            counts["cyrillic"] += 1
        elif 0x0600 <= o <= 0x06FF:
            counts["arabic"] += 1
        elif 0x4E00 <= o <= 0x9FFF:
            counts["han"] += 1
    best = "other"
    best_count = 0
    for name in ["latin", "cyrillic", "arabic", "han", "digit"]:
        if counts[name] > best_count:
            best = name
            best_count = counts[name]
    return best`,
    testCases: [
      { input: ["hello"], expected: "latin" },
      { input: ["Привет"], expected: "cyrillic" },
      { input: ["مرحبا"], expected: "arabic" },
      { input: ["你好"], expected: "han" },
      { input: ["12345"], expected: "digit" },
      { input: ["!!!"], expected: "other" },
    ],
    hint: "Check the code point ranges in ord(ch) and keep the first maximum.",
  },
  {
    id: "nlp-104",
    title: "Attention Mask from Padding",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Build an attention mask from already padded sequences. Return 1 for every real token and 0 wherever the token equals pad_value.\n\nPreserve the batch shape and return an empty list for an empty batch.",
    starterCode: `def attention_mask_from_padding(sequences, pad_value):
    # Your code here
    pass`,
    solution: `def attention_mask_from_padding(sequences, pad_value):
    return [[0 if x == pad_value else 1 for x in seq] for seq in sequences]`,
    testCases: [
      { input: [[[1, 2, 0], [3, 0, 0]], 0], expected: [[1, 1, 0], [1, 0, 0]] },
      { input: [[[5, 6]], 9], expected: [[1, 1]] },
      { input: [[], 0], expected: [] },
      { input: [[[0, 0]], 0], expected: [[0, 0]] },
    ],
    hint: "A nested list comprehension mirrors the batch and sequence dimensions.",
  },
  {
    id: "nlp-105",
    title: "Token-Level F1",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the token-level F1 between a predicted token list and a gold token list, using clipped multiset matching: matches = sum over tokens of min(count in prediction, count in gold).\n\nPrecision is matches / len(predicted), recall is matches / len(gold), and F1 = 2PR/(P+R). Return 1.0 when both lists are empty and 0.0 when there are no matches.",
    starterCode: `def token_level_f1(predicted, gold):
    # Your code here
    pass`,
    solution: `def token_level_f1(predicted, gold):
    if not predicted and not gold:
        return 1.0
    pc = {}
    for t in predicted:
        pc[t] = pc.get(t, 0) + 1
    gc = {}
    for t in gold:
        gc[t] = gc.get(t, 0) + 1
    matches = sum(min(pc[t], gc[t]) for t in pc if t in gc)
    if matches == 0:
        return 0.0
    precision = matches / len(predicted)
    recall = matches / len(gold)
    return 2 * precision * recall / (precision + recall)`,
    testCases: [
      { input: [["a", "b", "c"], ["a", "b", "c"]], expected: 1.0 },
      { input: [["a", "b"], ["a", "c"]], expected: 0.5 },
      { input: [["a", "a", "b"], ["a", "b", "b"]], expected: 0.6666666666666666 },
      { input: [[], []], expected: 1.0 },
      { input: [["x"], ["y"]], expected: 0.0 },
    ],
    hint: "Clipping prevents repeated predicted tokens from inflating recall.",
  },
  {
    id: "nlp-106",
    title: "Span Extraction F1",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the exact-match span F1 between predicted spans and gold spans, where each span is a [start, end] pair.\n\nDuplicate spans are collapsed into sets, precision is matches / predicted spans, recall is matches / gold spans, and F1 = 2PR/(P+R). Return 1.0 when both sets are empty and 0.0 when either is empty or there are no matches.",
    starterCode: `def span_extraction_f1(predicted, gold):
    # Your code here
    pass`,
    solution: `def span_extraction_f1(predicted, gold):
    p = set(tuple(s) for s in predicted)
    g = set(tuple(s) for s in gold)
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
      { input: [[[0, 2], [3, 5]], [[0, 2], [4, 6]]], expected: 0.5 },
      { input: [[[0, 1]], [[2, 3]]], expected: 0.0 },
      { input: [[], []], expected: 1.0 },
      { input: [[[1, 2]], []], expected: 0.0 },
      { input: [[[0, 2]], [[0, 2]]], expected: 1.0 },
    ],
    hint: "Convert spans to tuples before putting them in a set.",
  },
  {
    id: "nlp-107",
    title: "BIO Tagging Decode",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Decode a BIO tag sequence into entity spans. Return a list of [start, end, label] triples where end is exclusive.\n\nA B- tag starts a new entity, an I- tag continues the current entity when the label matches and otherwise starts a new one, and O closes the current entity.",
    starterCode: `def bio_decode(tags):
    # Your code here
    pass`,
    solution: `def bio_decode(tags):
    spans = []
    start = -1
    label = ""
    for i, tag in enumerate(tags):
        if tag == "O":
            if label:
                spans.append([start, i, label])
                label = ""
        elif tag.startswith("B-"):
            if label:
                spans.append([start, i, label])
            start = i
            label = tag[2:]
        elif tag.startswith("I-"):
            new_label = tag[2:]
            if not label:
                start = i
                label = new_label
            elif label != new_label:
                spans.append([start, i, label])
                start = i
                label = new_label
    if label:
        spans.append([start, len(tags), label])
    return spans`,
    testCases: [
      { input: [["B-PER", "I-PER", "O", "B-LOC"]], expected: [[0, 2, "PER"], [3, 4, "LOC"]] },
      { input: [["I-PER", "O"]], expected: [[0, 1, "PER"]] },
      { input: [["O", "O"]], expected: [] },
      { input: [[]], expected: [] },
      { input: [["B-PER", "I-LOC", "I-LOC"]], expected: [[0, 1, "PER"], [1, 3, "LOC"]] },
    ],
    hint: "Keep the current entity start and label, flushing at every O or label change.",
  },
  {
    id: "nlp-108",
    title: "Span to BIO Tags",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Convert entity spans back to BIO tags for a sequence of n tokens. Each span is [start, end, label] with an exclusive end.\n\nEmit 'B-label' at start, 'I-label' for the remaining positions up to end, and 'O' everywhere else.",
    starterCode: `def span_to_bio(n, spans):
    # Your code here
    pass`,
    solution: `def span_to_bio(n, spans):
    tags = ["O"] * n
    for span in spans:
        start, end, label = span[0], span[1], span[2]
        for i in range(start, min(end, n)):
            if i < 0:
                continue
            tags[i] = ("B-" if i == start else "I-") + label
    return tags`,
    testCases: [
      { input: [4, [[0, 2, "PER"], [3, 4, "LOC"]]], expected: ["B-PER", "I-PER", "O", "B-LOC"] },
      { input: [2, []], expected: ["O", "O"] },
      { input: [0, []], expected: [] },
      { input: [3, [[1, 3, "MISC"]]], expected: ["O", "B-MISC", "I-MISC"] },
    ],
    hint: "Slice the span against n so an over-long end cannot overflow the tag list.",
  },
  {
    id: "nlp-109",
    title: "IOB Consistency Check",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return True when a tag sequence is valid IOB2: every I-label must follow a B-label or I-label with the same entity type, B- and I- labels are the only allowed entity tags, and O is always allowed.\n\nAn empty sequence is valid.",
    starterCode: `def iob_consistency_check(tags):
    # Your code here
    pass`,
    solution: `def iob_consistency_check(tags):
    prev = "O"
    for tag in tags:
        if tag.startswith("I-"):
            label = tag[2:]
            if not (prev.startswith("B-") or prev.startswith("I-")):
                return False
            if prev[2:] != label:
                return False
        elif tag != "O" and not tag.startswith("B-"):
            return False
        prev = tag
    return True`,
    testCases: [
      { input: [["B-PER", "I-PER", "O"]], expected: true },
      { input: [["I-PER", "O"]], expected: false },
      { input: [["B-PER", "I-LOC"]], expected: false },
      { input: [["O", "O"]], expected: true },
      { input: [[]], expected: true },
    ],
    hint: "Track the previous tag and compare entity types on every I- tag.",
  },
  {
    id: "nlp-110",
    title: "Entity Type Count",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Count how many entities of each type appear in a BIO tag sequence.\n\nEvery B- tag starts one entity and contributes to its label count. Return a dictionary mapping each label to its entity count.",
    starterCode: `def entity_type_count(tags):
    # Your code here
    pass`,
    solution: `def entity_type_count(tags):
    counts = {}
    for tag in tags:
        if tag.startswith("B-"):
            label = tag[2:]
            counts[label] = counts.get(label, 0) + 1
    return counts`,
    testCases: [
      { input: [["B-PER", "I-PER", "O", "B-LOC", "B-PER"]], expected: { PER: 2, LOC: 1 } },
      { input: [["O"]], expected: {} },
      { input: [[]], expected: {} },
      { input: [["B-MISC", "I-MISC", "B-MISC"]], expected: { MISC: 2 } },
    ],
    hint: "Only B- tags open entities, so ignore I- tags entirely.",
  },
  {
    id: "nlp-111",
    title: "Coreference Chain Lengths",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the length of every coreference chain in chains, preserving the input order.\n\nAn empty chain has length 0, and an empty list of chains yields an empty list.",
    starterCode: `def coref_chain_lengths(chains):
    # Your code here
    pass`,
    solution: `def coref_chain_lengths(chains):
    return [len(c) for c in chains]`,
    testCases: [
      { input: [[["a", "b"], ["c"]]], expected: [2, 1] },
      { input: [[[]]], expected: [0] },
      { input: [[]], expected: [] },
      { input: [[["a", "b", "c", "d"]]], expected: [4] },
    ],
    hint: "A list comprehension over len of each chain is enough.",
  },
  {
    id: "nlp-112",
    title: "Mention Clustering",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Cluster coreferent mentions using union-find. mentions is a list of mention strings and links is a list of [i, j] index pairs that must end up in the same cluster.\n\nReturn the clusters sorted by their alphabetically smallest mention, where each cluster is the alphabetically sorted list of its mentions.",
    starterCode: `def mention_clustering(mentions, links):
    # Your code here
    pass`,
    solution: `def mention_clustering(mentions, links):
    parent = list(range(len(mentions)))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for a, b in links:
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[rb] = ra
    groups = {}
    for i in range(len(mentions)):
        r = find(i)
        if r not in groups:
            groups[r] = []
        groups[r].append(mentions[i])
    return sorted([sorted(g) for g in groups.values()])`,
    testCases: [
      { input: [["Alice", "alice", "Bob"], [[0, 1]]], expected: [["Alice", "alice"], ["Bob"]] },
      { input: [["a", "b", "c", "d"], [[0, 1], [1, 2]]], expected: [["a", "b", "c"], ["d"]] },
      { input: [["x", "y"], []], expected: [["x"], ["y"]] },
      { input: [[], []], expected: [] },
    ],
    hint: "Links are transitive, so union each pair and then group mentions by their root.",
  },
  {
    id: "nlp-113",
    title: "Relation Pair Count",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Given the number of entities found in each sentence, return the total number of unordered entity pairs across all sentences.\n\nA sentence with n entities contributes n * (n - 1) / 2 pairs.",
    starterCode: `def relation_pair_count(counts):
    # Your code here
    pass`,
    solution: `def relation_pair_count(counts):
    return sum(n * (n - 1) // 2 for n in counts)`,
    testCases: [
      { input: [[2, 3]], expected: 4 },
      { input: [[1, 1]], expected: 0 },
      { input: [[]], expected: 0 },
      { input: [[4]], expected: 6 },
    ],
    hint: "Count combinations of two entities with integer division.",
  },
  {
    id: "nlp-114",
    title: "Triple Extraction Pattern",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Extract simple subject-verb-object triples from a token list. For every position whose token is in verbs, emit [previous token, verb, next token] when both neighbors exist.\n\nVerbs at the first or last position are skipped, and a set of verbs with no matches yields an empty list.",
    starterCode: `def triple_extraction_pattern(tokens, verbs):
    # Your code here
    pass`,
    solution: `def triple_extraction_pattern(tokens, verbs):
    v = set(verbs)
    triples = []
    for i in range(1, len(tokens) - 1):
        if tokens[i] in v:
            triples.append([tokens[i - 1], tokens[i], tokens[i + 1]])
    return triples`,
    testCases: [
      { input: [["cats", "eat", "fish"], ["eat"]], expected: [["cats", "eat", "fish"]] },
      { input: [["eat", "fish"], ["eat"]], expected: [] },
      { input: [["cats", "eat", "fish", "run"], ["eat", "run"]], expected: [["cats", "eat", "fish"]] },
      { input: [["a", "b", "c"], []], expected: [] },
      { input: [["sleep"], ["sleep"]], expected: [] },
    ],
    hint: "Iterate the interior positions from 1 to len(tokens) - 2.",
  },
  {
    id: "nlp-115",
    title: "Dependency Arc Accuracy",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the fraction of tokens whose predicted head equals the gold head, where -1 marks the root.\n\nReturn 0.0 when the head list is empty.",
    starterCode: `def arc_accuracy(gold_heads, predicted_heads):
    # Your code here
    pass`,
    solution: `def arc_accuracy(gold_heads, predicted_heads):
    if not gold_heads:
        return 0.0
    correct = sum(1 for g, p in zip(gold_heads, predicted_heads) if g == p)
    return correct / len(gold_heads)`,
    testCases: [
      { input: [[-1, 0, 1], [-1, 0, 2]], expected: 0.6666666666666666 },
      { input: [[-1, 0], [-1, 0]], expected: 1.0 },
      { input: [[], []], expected: 0.0 },
      { input: [[-1, 0, 1], [0, 0, 0]], expected: 0.3333333333333333 },
    ],
    hint: "zip the two head lists and compare each pair position by position.",
  },
  {
    id: "nlp-116",
    title: "Tree Depth from Heads",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the maximum depth of a dependency tree given heads, where heads[i] is the parent index of token i and -1 marks a root.\n\nA single root has depth 0, and an empty head list has depth 0.",
    starterCode: `def tree_depth_from_heads(heads):
    # Your code here
    pass`,
    solution: `def tree_depth_from_heads(heads):
    if not heads:
        return 0
    depth = [0] * len(heads)
    for i in range(len(heads)):
        d = 0
        cur = i
        while heads[cur] != -1:
            cur = heads[cur]
            d += 1
            if d > len(heads):
                break
        depth[i] = d
    return max(depth)`,
    testCases: [
      { input: [[-1, 0, 1]], expected: 2 },
      { input: [[-1, -1]], expected: 0 },
      { input: [[-1, 0, 0, 2]], expected: 2 },
      { input: [[]], expected: 0 },
    ],
    hint: "Walk each token up to the root and keep the largest number of hops.",
  },
  {
    id: "nlp-117",
    title: "Projective Order Check",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Return True when every dependency arc is projective: for an arc from h to d, every token strictly between h and d must have h among its ancestors.\n\nheads[i] is the parent of token i, with -1 marking a root. An empty head list is projective.",
    starterCode: `def projective_order_check(heads):
    # Your code here
    pass`,
    solution: `def projective_order_check(heads):
    n = len(heads)

    def ancestors(i):
        seen = set()
        cur = i
        while cur != -1 and cur not in seen:
            seen.add(cur)
            cur = heads[cur]
        return seen

    for d in range(n):
        h = heads[d]
        if h == -1:
            continue
        lo = min(h, d) + 1
        hi = max(h, d)
        for k in range(lo, hi):
            if h not in ancestors(k):
                return False
    return True`,
    testCases: [
      { input: [[-1, 2, -1, 0]], expected: false },
      { input: [[-1, 0, 0, 2]], expected: true },
      { input: [[-1, 0, 0, 0]], expected: true },
      { input: [[]], expected: true },
    ],
    hint: "A crossing arc leaves a token between its endpoints that is not dominated by the head.",
  },
  {
    id: "nlp-118",
    title: "Constituency Bracket Balance",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Check whether a bracketed constituency string has balanced parentheses.\n\nReturn True when every opening parenthesis is closed in the correct order, and a negative depth at any point means failure. An empty string is balanced.",
    starterCode: `def bracket_balance_check(text):
    # Your code here
    pass`,
    solution: `def bracket_balance_check(text):
    depth = 0
    for ch in text:
        if ch == "(":
            depth += 1
        elif ch == ")":
            depth -= 1
            if depth < 0:
                return False
    return depth == 0`,
    testCases: [
      { input: ["(A (B) C)"], expected: true },
      { input: ["(A))"], expected: false },
      { input: [""], expected: true },
      { input: ["(("], expected: false },
    ],
    hint: "Track the nesting depth and fail as soon as it goes negative.",
  },
  {
    id: "nlp-119",
    title: "CFG Rule Extraction Count",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Count the distinct context-free grammar productions across a list of parse trees given as nested lists.\n\nEach node is [head, child, child, ...] and a production is formatted as 'head -> child1 child2 ...', where a child that is itself a list contributes its head symbol. Return the number of distinct production strings.",
    starterCode: `def cfg_rule_count(trees):
    # Your code here
    pass`,
    solution: `def cfg_rule_count(trees):
    rules = set()

    def walk(node):
        if isinstance(node, list) and len(node) >= 2:
            head = node[0]
            children = []
            for child in node[1:]:
                if isinstance(child, list):
                    children.append(child[0])
                    walk(child)
                else:
                    children.append(child)
            rules.add(head + " -> " + " ".join(children))

    for tree in trees:
        walk(tree)
    return len(rules)`,
    testCases: [
      {
        input: [[["S", ["NP", ["DT", "the"], ["NN", "cat"]], ["VP", ["V", "sat"]]]]],
        expected: 6,
      },
      {
        input: [[
          ["S", ["NP", ["DT", "the"], ["NN", "cat"]], ["VP", ["V", "sat"]]],
          ["S", ["NP", ["DT", "the"], ["NN", "cat"]], ["VP", ["V", "sat"]]],
        ]],
        expected: 6,
      },
      { input: [[]], expected: 0 },
      { input: [[["S", ["A", "a"]]]], expected: 2 },
    ],
    hint: "Recursively walk each node, collecting the head symbols of its children into a set.",
  },
  {
    id: "nlp-120",
    title: "PCFG Rule Probability Normalization",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Normalize rule counts into PCFG probabilities per left-hand side. Keys are rules formatted as 'LHS -> RHS' and values are their counts.\n\nFor each rule return count divided by the total count of all rules sharing the same LHS, so every LHS distribution sums to 1.",
    starterCode: `def pcfg_normalize(counts):
    # Your code here
    pass`,
    solution: `def pcfg_normalize(counts):
    totals = {}
    for rule in counts:
        lhs = rule.split(" ", 1)[0]
        totals[lhs] = totals.get(lhs, 0) + counts[rule]
    result = {}
    for rule in counts:
        lhs = rule.split(" ", 1)[0]
        result[rule] = counts[rule] / totals[lhs]
    return result`,
    testCases: [
      { input: [{ "S -> A B": 3, "S -> C": 1, "A -> a": 2 }], expected: { "S -> A B": 0.75, "S -> C": 0.25, "A -> a": 1.0 } },
      { input: [{}], expected: {} },
      { input: [{ "X -> y": 5 }], expected: { "X -> y": 1.0 } },
      { input: [{ "S -> A": 2, "S -> B": 2, "T -> c": 1 }], expected: { "S -> A": 0.5, "S -> B": 0.5, "T -> c": 1.0 } },
    ],
    hint: "The left-hand side is the first space-separated token of the rule string.",
  },
  {
    id: "nlp-121",
    title: "Viterbi POS Step",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Perform one Viterbi step over a hidden Markov model. prev_scores maps each previous state to its best log score, transitions maps 'from to' keys to probabilities, and emissions maps each current state to the emission probability of the observed symbol.\n\nReturn [best_state, best_score], the current state maximizing prev score + log transition + log emission, breaking ties alphabetically. Return ['', float('-inf')] when no state is reachable.",
    starterCode: `import math
def viterbi_step(prev_scores, transitions, emissions):
    # Your code here
    pass`,
    solution: `import math
def viterbi_step(prev_scores, transitions, emissions):
    best_state = ""
    best_score = float("-inf")
    for state in sorted(emissions):
        em = emissions[state]
        if em <= 0:
            continue
        best_prev = float("-inf")
        for pstate in sorted(prev_scores):
            tp = transitions.get(pstate + " " + state, 0.0)
            if tp > 0:
                s = prev_scores[pstate] + math.log(tp)
                if s > best_prev:
                    best_prev = s
        if best_prev == float("-inf"):
            continue
        score = best_prev + math.log(em)
        if score > best_score:
            best_state = state
            best_score = score
    return [best_state, best_score]`,
    testCases: [
      {
        input: [
          { A: -0.5, B: -1.0 },
          { "A X": 0.5, "B X": 0.25, "A Y": 0.5, "B Y": 0.75 },
          { X: 0.8, Y: 0.2 },
        ],
        expected: ["X", -1.416290731874155],
      },
      { input: [{ A: 0.0 }, { "A B": 0.3 }, { B: 0.5 }], expected: ["B", -1.8971199848858813] },
      { input: [{ A: 0.0 }, { "A B": 0.5 }, { A: 0.0, B: 0.5 }], expected: ["B", -1.3862943611198906] },
      { input: [{ A: -1.0, B: 0.0 }, { "A X": 1.0, "B X": 0.5 }, { X: 1.0 }], expected: ["X", -0.6931471805599453] },
    ],
    hint: "Scores are log-space, so combine them by addition; skip zero-probability states.",
  },
  {
    id: "nlp-122",
    title: "HMM Emission Probability",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the emission probability P(symbol | state) from a nested count dictionary mapping each state to symbol counts.\n\nDivide the symbol count by the total count for that state. Return 0.0 when the state or symbol is missing, or when the state has no counts.",
    starterCode: `def hmm_emission_prob(state, symbol, counts):
    # Your code here
    pass`,
    solution: `def hmm_emission_prob(state, symbol, counts):
    if state not in counts:
        return 0.0
    dist = counts[state]
    total = sum(dist.values())
    if total == 0:
        return 0.0
    return dist.get(symbol, 0) / total`,
    testCases: [
      { input: ["A", "x", { A: { x: 3, y: 1 }, B: { x: 1 } }], expected: 0.75 },
      { input: ["B", "z", { A: { x: 1 } }], expected: 0.0 },
      { input: ["C", "x", {}], expected: 0.0 },
      { input: ["A", "x", { A: {} }], expected: 0.0 },
    ],
    hint: "Normalize within the requested state only.",
  },
  {
    id: "nlp-123",
    title: "HMM Transition Count",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Count tag transitions in a sequence, including boundary transitions. Insert a '<s>' start symbol before the first tag and a '</s>' end symbol after the last tag, then count adjacent pairs.\n\nReturn a dictionary keyed by 'from to'. An empty tag sequence yields an empty dictionary.",
    starterCode: `def hmm_transition_count(tags):
    # Your code here
    pass`,
    solution: `def hmm_transition_count(tags):
    counts = {}
    prev = "<s>"
    for t in tags:
        key = prev + " " + t
        counts[key] = counts.get(key, 0) + 1
        prev = t
    if tags:
        key = prev + " </s>"
        counts[key] = counts.get(key, 0) + 1
    return counts`,
    testCases: [
      { input: [["A", "B", "A"]], expected: { "<s> A": 1, "A B": 1, "B A": 1, "A </s>": 1 } },
      { input: [[]], expected: {} },
      { input: [["X"]], expected: { "<s> X": 1, "X </s>": 1 } },
      { input: [["A", "A"]], expected: { "<s> A": 1, "A A": 1, "A </s>": 1 } },
    ],
    hint: "Track the previous symbol starting from '<s>' and finish with '</s>'.",
  },
  {
    id: "nlp-124",
    title: "Forward Algorithm Step",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Perform one forward algorithm step. alpha_prev maps each state to its previous alpha value, transitions maps 'from to' keys to probabilities, and emissions maps each state to the emission probability of the current observation.\n\nReturn new alpha values as a dictionary: alpha[j] = emissions[j] * sum over i of alpha_prev[i] * transition(i, j).",
    starterCode: `def forward_step(alpha_prev, transitions, emissions):
    # Your code here
    pass`,
    solution: `def forward_step(alpha_prev, transitions, emissions):
    result = {}
    for j in sorted(emissions):
        total = 0.0
        for i in sorted(alpha_prev):
            tp = transitions.get(i + " " + j, 0.0)
            if tp > 0:
                total += alpha_prev[i] * tp
        result[j] = total * emissions[j]
    return result`,
    testCases: [
      {
        input: [
          { A: 0.6, B: 0.4 },
          { "A X": 0.5, "A Y": 0.5, "B X": 0.25, "B Y": 0.75 },
          { X: 0.8, Y: 0.2 },
        ],
        expected: { X: 0.32000000000000006, Y: 0.12000000000000002 },
      },
      { input: [{ A: 1.0 }, { "A B": 0.3 }, { B: 0.5 }], expected: { B: 0.15 } },
      { input: [{ A: 1.0 }, { "A X": 1.0 }, { X: 0.0 }], expected: { X: 0.0 } },
      { input: [{}, { "A X": 0.5 }, { X: 0.8 }], expected: { X: 0.0 } },
    ],
    hint: "Sum the incoming probability mass over all previous states, then multiply by the emission.",
  },
  {
    id: "nlp-125",
    title: "Backward Algorithm Step",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Perform one backward algorithm step. states lists the current states to compute beta for, beta_next maps each next state to its beta value, transitions maps 'from to' keys to probabilities, and emissions maps each next state to the emission probability of the observation at the next time step.\n\nReturn beta values as a dictionary: beta[i] = sum over j of transition(i, j) * emissions[j] * beta_next[j].",
    starterCode: `def backward_step(states, beta_next, transitions, emissions):
    # Your code here
    pass`,
    solution: `def backward_step(states, beta_next, transitions, emissions):
    result = {}
    for i in sorted(states):
        total = 0.0
        for j in sorted(beta_next):
            tp = transitions.get(i + " " + j, 0.0)
            if tp > 0:
                total += tp * emissions[j] * beta_next[j]
        result[i] = total
    return result`,
    testCases: [
      {
        input: [
          ["A", "B"],
          { X: 1.0, Y: 0.5 },
          { "A X": 0.5, "A Y": 0.5, "B X": 0.25, "B Y": 0.75 },
          { X: 0.8, Y: 0.2 },
        ],
        expected: { A: 0.45, B: 0.275 },
      },
      { input: [["A"], { B: 1.0 }, { "A B": 0.5 }, { B: 0.4 }], expected: { A: 0.2 } },
      { input: [["A"], { X: 1.0 }, { "A X": 1.0 }, { X: 0.0 }], expected: { A: 0.0 } },
      { input: [["A", "B"], {}, { "A X": 0.5 }, { X: 0.8 }], expected: { A: 0.0, B: 0.0 } },
    ],
    hint: "Each current state's beta sums over all possible next states weighted by transition, emission, and the next beta.",
  },
  {
    id: "nlp-126",
    title: "Viterbi vs Posterior Difference",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Compare a Viterbi path with the per-position posterior distributions. posteriors is a list of state-to-probability dictionaries, one per position.\n\nReturn the sorted list of positions where the posterior argmax (ties broken alphabetically) differs from the Viterbi path. Positions beyond the path length are ignored.",
    starterCode: `def viterbi_posterior_diff(path, posteriors):
    # Your code here
    pass`,
    solution: `def viterbi_posterior_diff(path, posteriors):
    diff = []
    for i, row in enumerate(posteriors):
        best = ""
        best_p = -1.0
        for state in sorted(row):
            if row[state] > best_p:
                best = state
                best_p = row[state]
        if i < len(path) and best != path[i]:
            diff.append(i)
    return diff`,
    testCases: [
      {
        input: [
          ["A", "B", "C"],
          [{ A: 0.6, B: 0.4 }, { A: 0.7, B: 0.3 }, { A: 0.2, B: 0.8 }],
        ],
        expected: [1, 2],
      },
      { input: [["A"], [{ A: 0.5, B: 0.5 }]], expected: [] },
      { input: [["A"], []], expected: [] },
      { input: [[], [{ A: 1.0 }]], expected: [] },
    ],
    hint: "Iterate positions and compare the alphabetical argmax with the path entry when it exists.",
  },
  {
    id: "nlp-127",
    title: "Language Model Interpolation Weights",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Compute interpolation weights from held-out perplexities: each weight is proportional to the inverse perplexity, 1 / ppl, normalized so the weights sum to 1.\n\nReturn the weights in the same order as the input, and an empty list for empty input.",
    starterCode: `def lm_interpolation_weights(perplexities):
    # Your code here
    pass`,
    solution: `def lm_interpolation_weights(perplexities):
    if not perplexities:
        return []
    inv = [1.0 / p for p in perplexities]
    total = sum(inv)
    return [x / total for x in inv]`,
    testCases: [
      { input: [[2.0, 4.0]], expected: [0.6666666666666666, 0.3333333333333333] },
      { input: [[1.0]], expected: [1.0] },
      { input: [[10.0, 10.0]], expected: [0.5, 0.5] },
      { input: [[]], expected: [] },
    ],
    hint: "Invert each perplexity, then divide every inverse by the total.",
  },
  {
    id: "nlp-128",
    title: "Absolute Discounting",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the absolute discounting probability max(count - discount, 0) / context_count.\n\nReturn 0.0 when context_count is not positive.",
    starterCode: `def absolute_discounting(count, context_count, discount):
    # Your code here
    pass`,
    solution: `def absolute_discounting(count, context_count, discount):
    if context_count <= 0:
        return 0.0
    return max(count - discount, 0.0) / context_count`,
    testCases: [
      { input: [3, 10, 0.5], expected: 0.25 },
      { input: [0, 10, 0.5], expected: 0.0 },
      { input: [0.5, 10, 0.5], expected: 0.0 },
      { input: [0, 0, 0.5], expected: 0.0 },
      { input: [5, 5, 1.0], expected: 0.8 },
    ],
    hint: "Subtract the discount, clamp at zero, then normalize by the context total.",
  },
  {
    id: "nlp-129",
    title: "Kneser-Ney Discount (Lite)",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Estimate the Kneser-Ney discount from a list of bigram counts using counts of counts: D = n1 / (n1 + 2 * n2), where n1 is the number of bigrams seen exactly once and n2 the number seen exactly twice.\n\nReturn 0.0 when the denominator is 0 or the list is empty.",
    starterCode: `def kneser_ney_discount_lite(bigram_counts):
    # Your code here
    pass`,
    solution: `def kneser_ney_discount_lite(bigram_counts):
    n1 = sum(1 for c in bigram_counts if c == 1)
    n2 = sum(1 for c in bigram_counts if c == 2)
    denom = n1 + 2 * n2
    if denom == 0:
        return 0.0
    return n1 / denom`,
    testCases: [
      { input: [[1, 1, 2, 3]], expected: 0.5 },
      { input: [[3, 4]], expected: 0.0 },
      { input: [[2, 2]], expected: 0.0 },
      { input: [[1, 1, 1]], expected: 1.0 },
      { input: [[]], expected: 0.0 },
    ],
    hint: "Count singletons and doubletons, then apply the closed-form estimate.",
  },
  {
    id: "nlp-130",
    title: "Witten-Bell Lambda",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the Witten-Bell interpolation weight lambda = N1 / (N + N1), where N is the total count and N1 is the number of distinct event types in counts.\n\nReturn 0.0 when both N and N1 are 0.",
    starterCode: `def witten_bell_lambda(counts):
    # Your code here
    pass`,
    solution: `def witten_bell_lambda(counts):
    n = sum(counts)
    n1 = len(counts)
    if n + n1 == 0:
        return 0.0
    return n1 / (n + n1)`,
    testCases: [
      { input: [[1, 1, 2]], expected: 0.42857142857142855 },
      { input: [[]], expected: 0.0 },
      { input: [[0, 0]], expected: 1.0 },
      { input: [[5]], expected: 0.16666666666666666 },
    ],
    hint: "N is the total event count and N1 is the number of distinct events.",
  },
  {
    id: "nlp-131",
    title: "Good-Turing Adjusted Count",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the Good-Turing adjusted count r* = (r + 1) * N_{r+1} / N_r, where count_of_counts maps each raw count to how many events had that count.\n\nReturn 0.0 when N_r is 0. Numeric or string keys are accepted.",
    starterCode: `def good_turing_adjusted_count(r, count_of_counts):
    # Your code here
    pass`,
    solution: `def good_turing_adjusted_count(r, count_of_counts):
    counts = {}
    for k in count_of_counts:
        counts[int(k)] = count_of_counts[k]
    nr = counts.get(r, 0)
    nr1 = counts.get(r + 1, 0)
    if nr == 0:
        return 0.0
    return (r + 1) * nr1 / nr`,
    testCases: [
      { input: [1, { 1: 5, 2: 2 }], expected: 0.8 },
      { input: [2, { "2": 3, "3": 1 }], expected: 1.0 },
      { input: [5, { "1": 2 }], expected: 0.0 },
      { input: [1, {}], expected: 0.0 },
    ],
    hint: "Look up the frequencies of r and r + 1 in the count-of-counts table.",
  },
  {
    id: "nlp-132",
    title: "Detokenization Spacing Rules",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Join tokens back into a string using simple spacing rules: no space before closing punctuation .,!?;:%)]}, no space after an opening bracket at the end of the output, and no space before the contraction suffix \"'s\".\n\nAll other tokens are separated by a single space.",
    starterCode: `def detokenize(tokens):
    # Your code here
    pass`,
    solution: `def detokenize(tokens):
    result = ""
    attach = [".", ",", "!", "?", ";", ":", "%", ")", "]", "}", "'s"]
    for t in tokens:
        if not result:
            result = t
        elif t in attach:
            result += t
        elif result.endswith("(") or result.endswith("[") or result.endswith("{"):
            result += t
        else:
            result += " " + t
    return result`,
    testCases: [
      { input: [["Hello", ",", "world", "!"]], expected: "Hello, world!" },
      { input: [["I", "like", "it", "."]], expected: "I like it." },
      { input: [["(", "a", ")"]], expected: "(a)" },
      { input: [[]], expected: "" },
      { input: [["a", "'s", "b"]], expected: "a's b" },
    ],
    hint: "Build the string incrementally and inspect the current tail before adding a token.",
  },
  {
    id: "nlp-133",
    title: "Contraction Splitting",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Split an English contraction into its base and suffix. Handle the irregular forms can't, won't, and shan't explicitly.\n\nOtherwise split off the longest matching suffix from n't, 're, 've, 'll, 'd, 'm, and 's when a non-empty base remains, and return the word unchanged when no suffix matches.",
    starterCode: `def contraction_split(word):
    # Your code here
    pass`,
    solution: `def contraction_split(word):
    special = {"can't": ["ca", "n't"], "won't": ["wo", "n't"], "shan't": ["sha", "n't"]}
    if word in special:
        return special[word]
    for suffix in ["n't", "'re", "'ve", "'ll", "'d", "'m", "'s"]:
        if word.endswith(suffix) and len(word) > len(suffix):
            return [word[:-len(suffix)], suffix]
    return [word]`,
    testCases: [
      { input: ["don't"], expected: ["do", "n't"] },
      { input: ["can't"], expected: ["ca", "n't"] },
      { input: ["we're"], expected: ["we", "'re"] },
      { input: ["dogs"], expected: ["dogs"] },
      { input: ["won't"], expected: ["wo", "n't"] },
    ],
    hint: "Check the irregular map before the suffix loop.",
  },
  {
    id: "nlp-134",
    title: "Hashtag Splitting",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Split a hashtag into words at uppercase boundaries. Remove a leading '#' and start a new part whenever an uppercase character follows a lowercase character, which keeps acronym runs together.\n\nReturn the list of parts, or an empty list when no text remains.",
    starterCode: `def hashtag_split(tag):
    # Your code here
    pass`,
    solution: `def hashtag_split(tag):
    text = tag[1:] if tag.startswith("#") else tag
    if not text:
        return []
    parts = [text[0]]
    for ch in text[1:]:
        if ch.isupper() and parts[-1] and parts[-1][-1].islower():
            parts.append(ch)
        else:
            parts[-1] += ch
    return parts`,
    testCases: [
      { input: ["#MachineLearning"], expected: ["Machine", "Learning"] },
      { input: ["#NLP"], expected: ["NLP"] },
      { input: ["#deeplearning"], expected: ["deeplearning"] },
      { input: ["#MachineNLP"], expected: ["Machine", "NLP"] },
      { input: [""], expected: [] },
    ],
    hint: "Only break when the previous character is lowercase, so acronyms stay glued together.",
  },
  {
    id: "nlp-135",
    title: "Emoji Detection Count",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Count emoji characters in text using code point ranges: U+1F300 to U+1FAFF and U+2600 to U+27BF.\n\nCharacters outside those ranges do not count, and empty text yields 0.",
    starterCode: `def emoji_count(text):
    # Your code here
    pass`,
    solution: `def emoji_count(text):
    total = 0
    for ch in text:
        o = ord(ch)
        if 0x1F300 <= o <= 0x1FAFF or 0x2600 <= o <= 0x27BF:
            total += 1
    return total`,
    testCases: [
      { input: ["hi 😀😀"], expected: 2 },
      { input: ["no emoji"], expected: 0 },
      { input: ["❤"], expected: 1 },
      { input: ["a✨b🚀"], expected: 2 },
      { input: [""], expected: 0 },
    ],
    hint: "Compare ord(ch) against the two inclusive ranges.",
  },
  {
    id: "nlp-136",
    title: "Mention Extraction",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Extract user mentions from text with the pattern @ followed by letters, digits, or underscores.\n\nReturn the handles without the @ sign, keeping only the first occurrence of each handle in document order.",
    starterCode: `import re
def mention_extraction(text):
    # Your code here
    pass`,
    solution: `import re
def mention_extraction(text):
    found = re.findall(r"@[A-Za-z0-9_]+", text)
    result = []
    for m in found:
        handle = m[1:]
        if handle not in result:
            result.append(handle)
    return result`,
    testCases: [
      { input: ["hey @alice and @bob"], expected: ["alice", "bob"] },
      { input: ["@a @a @b"], expected: ["a", "b"] },
      { input: ["no mentions"], expected: [] },
      { input: ["email a@b.com"], expected: ["b"] },
    ],
    hint: "findall returns matches in order; drop the leading @ and deduplicate.",
  },
  {
    id: "nlp-137",
    title: "Keyword Extraction by TF-IDF",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Rank the top-k keywords across a document collection by summed TF-IDF. For each term, add count-in-document / document length times log(N / df) over every document containing it, where N is the number of documents and df its document frequency.\n\nReturn the top-k term strings ranked by descending score with alphabetical tie-breaking, or an empty list when k is not positive or docs is empty.",
    starterCode: `import math
def keyword_extraction_tfidf(docs, k):
    # Your code here
    pass`,
    solution: `import math
def keyword_extraction_tfidf(docs, k):
    if k <= 0 or not docs:
        return []
    n = len(docs)
    df = {}
    for d in docs:
        for t in set(d):
            df[t] = df.get(t, 0) + 1
    scores = {}
    for d in docs:
        if not d:
            continue
        for t in d:
            weight = (d.count(t) / len(d)) * math.log(n / df[t])
            scores[t] = scores.get(t, 0.0) + weight
    ranked = sorted(scores, key=lambda w: (-scores[w], w))
    return ranked[:k]`,
    testCases: [
      { input: [[["a", "b", "a"], ["b", "c"], ["c", "a"]], 2], expected: ["a", "c"] },
      { input: [[["x"]], 1], expected: ["x"] },
      { input: [[["a", "b"]], 0], expected: [] },
      { input: [[], 2], expected: [] },
      { input: [[["a"], ["a"]], 2], expected: ["a"] },
    ],
    hint: "A term appearing in every document has idf log(1) = 0, so it scores nothing.",
  },
  {
    id: "nlp-138",
    title: "TextRank One Iteration",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Perform one TextRank (PageRank) update: new[i] = (1 - damping) / n + damping * sum over j of similarity[j][i] * scores[j], where similarity[j][i] is the edge weight from j to i.\n\nReturn the updated score list, or an empty list when there are no nodes.",
    starterCode: `def textrank_iteration(scores, similarity, damping):
    # Your code here
    pass`,
    solution: `def textrank_iteration(scores, similarity, damping):
    n = len(scores)
    if n == 0:
        return []
    result = []
    for i in range(n):
        incoming = 0.0
        for j in range(n):
            incoming += similarity[j][i] * scores[j]
        result.append((1 - damping) / n + damping * incoming)
    return result`,
    testCases: [
      { input: [[1.0, 1.0], [[0.0, 1.0], [1.0, 0.0]], 0.85], expected: [0.925, 0.925] },
      { input: [[1.0, 0.0], [[0.0, 1.0], [0.0, 0.0]], 0.5], expected: [0.25, 0.75] },
      { input: [[], [], 0.85], expected: [] },
      { input: [[0.5], [[0.0]], 0.85], expected: [0.15000000000000002] },
    ],
    hint: "Each node receives mass along incoming edges: sum the column down similarity[j][i].",
  },
  {
    id: "nlp-139",
    title: "MMR Summary Selection",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Select k sentences with maximal marginal relevance. Start empty, then repeatedly pick the remaining index maximizing lam * relevance[i] - (1 - lam) * max similarity from i to already selected sentences, where an empty selection makes the second term 0.\n\nTies go to the lowest index. Return the selected indices in selection order.",
    starterCode: `def mmr_selection(relevance, similarity, lam, k):
    # Your code here
    pass`,
    solution: `def mmr_selection(relevance, similarity, lam, k):
    n = len(relevance)
    selected = []
    remaining = list(range(n))
    while len(selected) < k and remaining:
        best = None
        best_score = None
        for i in remaining:
            if selected:
                max_sim = max(similarity[i][j] for j in selected)
            else:
                max_sim = 0.0
            score = lam * relevance[i] - (1 - lam) * max_sim
            if best_score is None or score > best_score:
                best = i
                best_score = score
        selected.append(best)
        remaining.remove(best)
    return selected`,
    testCases: [
      {
        input: [
          [0.9, 0.8, 0.7],
          [[1.0, 0.1, 0.1], [0.1, 1.0, 0.5], [0.1, 0.5, 1.0]],
          0.7,
          2,
        ],
        expected: [0, 1],
      },
      {
        input: [
          [0.9, 0.7, 0.7],
          [[1.0, 0.1, 0.1], [0.1, 1.0, 0.5], [0.1, 0.5, 1.0]],
          0.5,
          2,
        ],
        expected: [0, 1],
      },
      {
        input: [
          [0.9, 0.8, 0.7],
          [[1.0, 0.1, 0.1], [0.1, 1.0, 0.5], [0.1, 0.5, 1.0]],
          0.7,
          5,
        ],
        expected: [0, 1, 2],
      },
      { input: [[0.9], [[1.0]], 0.7, 0], expected: [] },
      { input: [[], [], 0.7, 2], expected: [] },
    ],
    hint: "Recompute the penalty against the selected set on every iteration.",
  },
  {
    id: "nlp-140",
    title: "Summary Key Term Coverage",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the fraction of key terms that appear in the summary tokens, comparing sets.\n\nReturn 0.0 when there are no key terms.",
    starterCode: `def summary_coverage(summary_tokens, key_terms):
    # Your code here
    pass`,
    solution: `def summary_coverage(summary_tokens, key_terms):
    if not key_terms:
        return 0.0
    s = set(summary_tokens)
    return sum(1 for t in key_terms if t in s) / len(key_terms)`,
    testCases: [
      { input: [["the", "cat"], ["cat", "dog"]], expected: 0.5 },
      { input: [["a", "b"], ["a", "b"]], expected: 1.0 },
      { input: [["a"], []], expected: 0.0 },
      { input: [[], ["x"]], expected: 0.0 },
      { input: [["x", "y", "z"], ["x", "z", "w"]], expected: 0.6666666666666666 },
    ],
    hint: "Convert the summary tokens to a set and count covered key terms.",
  },
];

