import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "nlp-276",
    title: "HMM Forward Likelihood Step",
    category: "NLP",
    difficulty: "Medium",
    description: "Compute the total likelihood of the next observation for one HMM forward step.\n\nalpha_prev maps each previous state to its alpha value, transitions maps 'from to' keys to transition probabilities, and emissions maps each current state to its emission probability for the observed symbol.\n\nReturn the sum over current states j of emissions[j] * sum over previous states i of alpha_prev[i] * P(j | i). Missing transitions count as 0.0.",
    starterCode: `def hmm_forward_likelihood_step(alpha_prev, transitions, emissions):
    # Your code here
    pass`,
    solution: `def hmm_forward_likelihood_step(alpha_prev, transitions, emissions):
    total = 0.0
    for j in sorted(emissions):
        incoming = 0.0
        for i in sorted(alpha_prev):
            tp = transitions.get(i + " " + j, 0.0)
            if tp > 0:
                incoming += alpha_prev[i] * tp
        total += incoming * emissions[j]
    return total`,
    testCases: [
      { input: [{"A": 0.6, "B": 0.4}, {"A X": 0.5, "A Y": 0.5, "B X": 0.25, "B Y": 0.75}, {"X": 0.8, "Y": 0.2}], expected: 0.44000000000000006 },
      { input: [{"A": 1.0}, {"A B": 0.3}, {"B": 0.5}], expected: 0.15 },
      { input: [{"A": 0.2, "B": 0.8}, {"A Z": 1.0}, {"Z": 0.5}], expected: 0.1 },
      { input: [{"A": 1.0}, {"A X": 1.0}, {"X": 0.0}], expected: 0.0 },
      { input: [{}, {"A X": 0.5}, {"X": 0.8}], expected: 0.0 },
    ],
    hint: "Accumulate incoming probability mass per current state, then weight it by that state's emission.",
  },
  {
    id: "nlp-277",
    title: "Viterbi Backpointer Count",
    category: "NLP",
    difficulty: "Medium",
    description: "Count distinct backpointers chosen in one Viterbi step. prev_scores maps previous states to log scores, transitions maps 'from to' keys to probabilities, and emissions maps current states to emission probabilities for the observed symbol.\n\nA current state is reachable when its emission is positive and it has at least one positive incoming transition. Ties for the best predecessor are broken alphabetically. Return the number of distinct predecessors selected as a backpointer.",
    starterCode: `import math
def viterbi_backpointer_count(prev_scores, transitions, emissions):
    # Your code here
    pass`,
    solution: `import math
def viterbi_backpointer_count(prev_scores, transitions, emissions):
    chosen = set()
    for j in sorted(emissions):
        if emissions[j] <= 0:
            continue
        best_i = None
        best_score = None
        for i in sorted(prev_scores):
            tp = transitions.get(i + " " + j, 0.0)
            if tp <= 0:
                continue
            score = prev_scores[i] + math.log(tp)
            if best_score is None or score > best_score:
                best_score = score
                best_i = i
        if best_i is not None:
            chosen.add(best_i)
    return len(chosen)`,
    testCases: [
      { input: [{"A": 0.0, "B": -1.0}, {"A X": 0.5, "A Y": 0.5, "B X": 0.5, "B Y": 0.5}, {"X": 1.0, "Y": 1.0}], expected: 1 },
      { input: [{"A": 0.0, "B": 0.0}, {"A X": 1.0, "B Y": 1.0}, {"X": 1.0, "Y": 1.0}], expected: 2 },
      { input: [{"A": 0.0}, {}, {"X": 1.0}], expected: 0 },
      { input: [{"A": 0.0, "B": 0.0}, {"A X": 0.5, "B X": 0.5}, {"X": 1.0}], expected: 1 },
      { input: [{"A": -2.0, "B": 0.0, "C": 0.0}, {"A X": 1.0, "B X": 0.5, "C Y": 1.0}, {"X": 1.0, "Y": 1.0}], expected: 2 },
    ],
    hint: "For each reachable current state keep its alphabetical argmax predecessor, then count the distinct choices.",
  },
  {
    id: "nlp-278",
    title: "Viterbi Best Path Score",
    category: "NLP",
    difficulty: "Hard",
    description: "Return the log score of the best Viterbi path through an HMM. observations is the list of observed symbols, states lists the hidden states, start_probs maps states to initial probabilities, transitions maps 'from to' keys to transition probabilities, and emissions maps each state to a dictionary of symbol probabilities.\n\nRun max-product dynamic programming in log space and return the maximum final score, or float('-inf') when no path exists.",
    starterCode: `import math
def viterbi_best_path_score(observations, states, start_probs, transitions, emissions):
    # Your code here
    pass`,
    solution: `import math
def viterbi_best_path_score(observations, states, start_probs, transitions, emissions):
    if not observations or not states:
        return 0.0
    scores = {}
    for s in states:
        sp = start_probs.get(s, 0.0)
        ep = emissions.get(s, {}).get(observations[0], 0.0)
        if sp > 0 and ep > 0:
            scores[s] = math.log(sp) + math.log(ep)
    for obs in observations[1:]:
        new_scores = {}
        for j in states:
            ep = emissions.get(j, {}).get(obs, 0.0)
            if ep <= 0:
                continue
            best = None
            for i in states:
                if i not in scores:
                    continue
                tp = transitions.get(i + " " + j, 0.0)
                if tp <= 0:
                    continue
                value = scores[i] + math.log(tp)
                if best is None or value > best:
                    best = value
            if best is not None:
                new_scores[j] = best + math.log(ep)
        scores = new_scores
    if not scores:
        return float("-inf")
    return max(scores.values())`,
    testCases: [
      { input: [["x"], ["A", "B"], {"A": 1.0, "B": 0.0}, {}, {"A": {"x": 0.5}, "B": {"x": 0.9}}], expected: -0.6931471805599453 },
      { input: [["x", "y"], ["A", "B"], {"A": 0.6, "B": 0.4}, {"A A": 0.7, "A B": 0.3, "B A": 0.4, "B B": 0.6}, {"A": {"x": 0.9, "y": 0.2}, "B": {"x": 0.5, "y": 0.8}}], expected: -2.043302495063963 },
      { input: [["a"], ["S"], {"S": 0.5}, {}, {"S": {"a": 1.0}}], expected: -0.6931471805599453 },
      { input: [["x", "y", "x"], ["A", "B"], {"A": 1.0, "B": 0.0}, {"A A": 0.5, "A B": 0.5, "B A": 0.8, "B B": 0.2}, {"A": {"x": 0.9, "y": 0.1}, "B": {"x": 0.2, "y": 0.8}}], expected: -1.3501553145040173 },
      { input: [[], ["A"], {"A": 1.0}, {}, {"A": {"x": 1.0}}], expected: 0.0 },
    ],
    hint: "Scores are log probabilities, so multiply by adding and choose the best predecessor with max.",
  },
  {
    id: "nlp-279",
    title: "CRF Emission and Transition Score",
    category: "NLP",
    difficulty: "Easy",
    description: "Score a label sequence with a linear-chain CRF. tags is the label list, emissions is a list of per-position dictionaries mapping each label to its emission score, and transitions maps 'from to' keys to transition scores.\n\nReturn the sum of the emission score of each chosen tag plus the transition score of every adjacent tag pair. Missing entries contribute 0.0.",
    starterCode: `def crf_sequence_score(tags, emissions, transitions):
    # Your code here
    pass`,
    solution: `def crf_sequence_score(tags, emissions, transitions):
    total = 0.0
    for pos, tag in enumerate(tags):
        total += emissions[pos].get(tag, 0.0)
        if pos > 0:
            total += transitions.get(tags[pos - 1] + " " + tag, 0.0)
    return total`,
    testCases: [
      { input: [["B", "I"], [{"B": 0.5, "I": -0.1}, {"B": -0.2, "I": 0.3}], {"B I": 0.4}], expected: 1.2000000000000002 },
      { input: [[], [], {}], expected: 0.0 },
      { input: [["O"], [{"O": 1.25}], {}], expected: 1.25 },
      { input: [["A", "B", "A"], [{"A": 0.1, "B": 0.2}, {"A": 0.3, "B": 0.4}, {"A": 0.5, "B": 0.6}], {"A A": 0.5, "A B": 1.0, "B A": 2.0, "B B": 0.5}], expected: 4.0 },
      { input: [["A"], [{}], {}], expected: 0.0 },
    ],
    hint: "Walk the tags once, adding emissions at every position and transitions between positions.",
  },
  {
    id: "nlp-280",
    title: "BIO Span Length Counts",
    category: "NLP",
    difficulty: "Medium",
    description: "Decode a BIO tag sequence and count spans by length. A B- tag starts a new entity, an I- tag continues the current entity when the label matches and otherwise starts a new entity, and O closes the current entity.\n\nReturn [number of single-token spans, number of multi-token spans].",
    starterCode: `def bio_span_length_counts(tags):
    # Your code here
    pass`,
    solution: `def bio_span_length_counts(tags):
    lengths = []
    start = None
    label = ""
    for i, tag in enumerate(tags):
        if tag == "O":
            if label:
                lengths.append(i - start)
                label = ""
        elif tag.startswith("B-"):
            if label:
                lengths.append(i - start)
            start = i
            label = tag[2:]
        elif tag.startswith("I-"):
            new_label = tag[2:]
            if not label:
                start = i
                label = new_label
            elif label != new_label:
                lengths.append(i - start)
                start = i
                label = new_label
    if label:
        lengths.append(len(tags) - start)
    single = sum(1 for length in lengths if length == 1)
    multi = sum(1 for length in lengths if length > 1)
    return [single, multi]`,
    testCases: [
      { input: [["B-PER", "I-PER", "O", "B-LOC"]], expected: [1, 1] },
      { input: [["I-PER", "I-PER", "I-PER"]], expected: [0, 1] },
      { input: [[]], expected: [0, 0] },
      { input: [["O"]], expected: [0, 0] },
      { input: [["B-A", "B-A", "I-B"]], expected: [3, 0] },
    ],
    hint: "Track the current span start and flush its length whenever the tag closes it.",
  },
  {
    id: "nlp-281",
    title: "IOB2 Illegal Transition Positions",
    category: "NLP",
    difficulty: "Easy",
    description: "Find every position where a tag sequence violates the IOB2 transition rule. An I-label is only legal when the previous tag is the B- or I-label of the same entity type, where the position before the first tag acts as O.\n\nReturn the sorted list of violating indices, and an empty list when the sequence is valid.",
    starterCode: `def iob2_illegal_positions(tags):
    # Your code here
    pass`,
    solution: `def iob2_illegal_positions(tags):
    illegal = []
    for i, tag in enumerate(tags):
        if tag.startswith("I-"):
            label = tag[2:]
            if i == 0:
                illegal.append(i)
            else:
                prev = tags[i - 1]
                if prev != "B-" + label and prev != "I-" + label:
                    illegal.append(i)
    return illegal`,
    testCases: [
      { input: [["I-PER", "O"]], expected: [0] },
      { input: [["B-PER", "I-LOC"]], expected: [1] },
      { input: [["O", "B-A", "I-A", "I-A"]], expected: [] },
      { input: [[]], expected: [] },
      { input: [["B-A", "I-B", "I-B"]], expected: [1] },
    ],
    hint: "Only I- tags can be illegal; compare the label with the previous tag.",
  },
  {
    id: "nlp-282",
    title: "NER Micro-F1 Across Sentences",
    category: "NLP",
    difficulty: "Hard",
    description: "Compute entity-level micro-F1 over a corpus. gold_docs and pred_docs are parallel lists of documents, and each document is a list of [start, end, label] spans.\n\nMatches are exact [start, end, label] tuples, repeated spans are clipped by multiplicity, and TP, FP, and FN are pooled over all documents. Return 1.0 when both corpora are empty and 0.0 when there are no matches.",
    starterCode: `def ner_micro_f1(gold_docs, pred_docs):
    # Your code here
    pass`,
    solution: `def ner_micro_f1(gold_docs, pred_docs):
    tp = fp = fn = 0
    doc_count = max(len(gold_docs), len(pred_docs))
    for k in range(doc_count):
        gold = gold_docs[k] if k < len(gold_docs) else []
        pred = pred_docs[k] if k < len(pred_docs) else []
        gold_counts = {}
        for span in gold:
            key = (span[0], span[1], span[2])
            gold_counts[key] = gold_counts.get(key, 0) + 1
        pred_counts = {}
        for span in pred:
            key = (span[0], span[1], span[2])
            pred_counts[key] = pred_counts.get(key, 0) + 1
        matches = sum(min(count, pred_counts.get(key, 0)) for key, count in gold_counts.items())
        tp += matches
        fp += len(pred) - matches
        fn += len(gold) - matches
    if tp + fp + fn == 0:
        return 1.0
    if tp == 0:
        return 0.0
    precision = tp / (tp + fp)
    recall = tp / (tp + fn)
    return 2 * precision * recall / (precision + recall)`,
    testCases: [
      { input: [[[[0, 2, "PER"], [3, 5, "LOC"]]], [[[0, 2, "PER"], [3, 5, "LOC"]]]], expected: 1.0 },
      { input: [[[[0, 2, "PER"]]], [[[0, 2, "LOC"]]]], expected: 0.0 },
      { input: [[[], []], [[], []]], expected: 1.0 },
      { input: [[[[0, 2, "PER"], [4, 6, "ORG"]]], [[[0, 2, "PER"], [4, 7, "ORG"], [9, 10, "MISC"]]]], expected: 0.4 },
      { input: [[[[0, 1, "A"]], [[2, 3, "B"]]], [[[0, 1, "A"]], []]], expected: 0.6666666666666666 },
    ],
    hint: "Pool true positives, false positives, and false negatives across all documents before computing micro-F1.",
  },
  {
    id: "nlp-283",
    title: "Entity-Level Precision and Recall",
    category: "NLP",
    difficulty: "Hard",
    description: "Compute per-label entity precision, recall, and F1. gold and pred are lists of [start, end, label] spans, matched exactly on start and end within each label with multiplicity clipping.\n\nReturn a dictionary mapping every label that appears in either list to [precision, recall, f1]. A zero denominator gives 0.0 for that quantity.",
    starterCode: `def entity_level_prf(gold, pred):
    # Your code here
    pass`,
    solution: `def entity_level_prf(gold, pred):
    gold_by = {}
    pred_by = {}
    for span in gold:
        gold_by.setdefault(span[2], {})
        key = (span[0], span[1])
        gold_by[span[2]][key] = gold_by[span[2]].get(key, 0) + 1
    for span in pred:
        pred_by.setdefault(span[2], {})
        key = (span[0], span[1])
        pred_by[span[2]][key] = pred_by[span[2]].get(key, 0) + 1
    result = {}
    for label in sorted(set(gold_by) | set(pred_by)):
        gold_counts = gold_by.get(label, {})
        pred_counts = pred_by.get(label, {})
        matches = sum(min(count, pred_counts.get(key, 0)) for key, count in gold_counts.items())
        gold_total = sum(gold_counts.values())
        pred_total = sum(pred_counts.values())
        precision = matches / pred_total if pred_total > 0 else 0.0
        recall = matches / gold_total if gold_total > 0 else 0.0
        if precision + recall > 0:
            f1 = 2 * precision * recall / (precision + recall)
        else:
            f1 = 0.0
        result[label] = [precision, recall, f1]
    return result`,
    testCases: [
      { input: [[[0, 2, "PER"], [3, 4, "PER"], [0, 2, "LOC"]], [[0, 2, "PER"], [3, 4, "PER"], [0, 3, "LOC"]]], expected: {"LOC": [0.0, 0.0, 0.0], "PER": [1.0, 1.0, 1.0]} },
      { input: [[], []], expected: {} },
      { input: [[[0, 1, "A"]], [[0, 1, "B"]]], expected: {"A": [0.0, 0.0, 0.0], "B": [0.0, 0.0, 0.0]} },
      { input: [[[0, 1, "A"], [0, 1, "A"]], [[0, 1, "A"]]], expected: {"A": [1.0, 0.5, 0.6666666666666666]} },
      { input: [[[0, 1, "X"], [1, 2, "X"]], [[0, 1, "X"], [1, 2, "Y"]]], expected: {"X": [1.0, 0.5, 0.6666666666666666], "Y": [0.0, 0.0, 0.0]} },
    ],
    hint: "Group counts by label first, then clip match counts per (start, end) key.",
  },
  {
    id: "nlp-284",
    title: "Chunking F1 from BIO Tags",
    category: "NLP",
    difficulty: "Medium",
    description: "Compute chunk-level micro-F1 directly from BIO tag sequences. Decode both sequences into [start, end, label] chunks using IOB2 rules, where end is exclusive and an I- tag may start a chunk when no chunk is open or the label changes.\n\nExact chunk matches are clipped by multiplicity, and precision, recall, and F1 are computed over the pooled counts. Return 1.0 when both sequences produce no chunks and 0.0 when there are no matches.",
    starterCode: `def chunking_f1(gold_tags, pred_tags):
    # Your code here
    pass`,
    solution: `def chunking_f1(gold_tags, pred_tags):
    def decode(tags):
        chunks = []
        start = None
        label = ""
        for i, tag in enumerate(tags):
            if tag == "O":
                if label:
                    chunks.append((start, i, label))
                    label = ""
            elif tag.startswith("B-"):
                if label:
                    chunks.append((start, i, label))
                start = i
                label = tag[2:]
            elif tag.startswith("I-"):
                new_label = tag[2:]
                if not label:
                    start = i
                    label = new_label
                elif label != new_label:
                    chunks.append((start, i, label))
                    start = i
                    label = new_label
        if label:
            chunks.append((start, len(tags), label))
        return chunks

    gold = decode(gold_tags)
    pred = decode(pred_tags)
    gold_counts = {}
    for chunk in gold:
        gold_counts[chunk] = gold_counts.get(chunk, 0) + 1
    pred_counts = {}
    for chunk in pred:
        pred_counts[chunk] = pred_counts.get(chunk, 0) + 1
    matches = sum(min(count, pred_counts.get(chunk, 0)) for chunk, count in gold_counts.items())
    if not gold and not pred:
        return 1.0
    if matches == 0:
        return 0.0
    precision = matches / len(pred)
    recall = matches / len(gold)
    return 2 * precision * recall / (precision + recall)`,
    testCases: [
      { input: [["B-NP", "I-NP", "O", "B-VP"], ["B-NP", "I-NP", "O", "B-VP"]], expected: 1.0 },
      { input: [["B-NP", "I-NP", "O"], ["O", "B-NP", "I-NP"]], expected: 0.0 },
      { input: [[], []], expected: 1.0 },
      { input: [["B-NP", "I-NP", "O", "B-VP"], ["B-NP", "I-NP", "B-VP", "O"]], expected: 0.5 },
      { input: [["O", "B-PER", "I-PER"], ["O", "B-LOC", "I-PER"]], expected: 0.0 },
    ],
    hint: "Decode both tag sequences to chunk triples, then run clipped micro-F1 over the triples.",
  },
  {
    id: "nlp-285",
    title: "POS Tagging Accuracy with Ignore Set",
    category: "NLP",
    difficulty: "Easy",
    description: "Compute POS tagging accuracy while ignoring selected gold tags. gold_tags and pred_tags are parallel label lists, and ignore is the set of gold tags to skip.\n\nThe lists are zipped to the shorter length. Return correct non-ignored predictions divided by the number of non-ignored positions, or 0.0 when none are counted.",
    starterCode: `def pos_tagging_accuracy(gold_tags, pred_tags, ignore):
    # Your code here
    pass`,
    solution: `def pos_tagging_accuracy(gold_tags, pred_tags, ignore):
    total = 0
    correct = 0
    for gold, pred in zip(gold_tags, pred_tags):
        if gold in ignore:
            continue
        total += 1
        if gold == pred:
            correct += 1
    if total == 0:
        return 0.0
    return correct / total`,
    testCases: [
      { input: [["N", "V", "P"], ["N", "N", "P"], []], expected: 0.6666666666666666 },
      { input: [["N", "V", "P"], ["N", "N", "P"], ["P"]], expected: 0.5 },
      { input: [["N"], [], []], expected: 0.0 },
      { input: [[], [], []], expected: 0.0 },
      { input: [["P", "P"], ["N", "N"], ["P"]], expected: 0.0 },
    ],
    hint: "Skip positions whose gold tag is in the ignore set before counting.",
  },
  {
    id: "nlp-286",
    title: "Confusion Pair Rate",
    category: "NLP",
    difficulty: "Easy",
    description: "Measure how often one gold label is confused with a specific predicted label. gold and pred are parallel label lists, and gold_label and pred_label name the confusion pair.\n\nReturn the fraction of gold_label positions that were predicted as pred_label, or 0.0 when gold_label never occurs.",
    starterCode: `def confusion_pair_rate(gold, pred, gold_label, pred_label):
    # Your code here
    pass`,
    solution: `def confusion_pair_rate(gold, pred, gold_label, pred_label):
    denominator = 0
    numerator = 0
    for gold_tag, pred_tag in zip(gold, pred):
        if gold_tag == gold_label:
            denominator += 1
            if pred_tag == pred_label:
                numerator += 1
    if denominator == 0:
        return 0.0
    return numerator / denominator`,
    testCases: [
      { input: [["A", "A", "A", "B"], ["B", "A", "B", "B"], "A", "B"], expected: 0.6666666666666666 },
      { input: [["A", "A", "A", "B"], ["B", "A", "B", "B"], "B", "B"], expected: 1.0 },
      { input: [["A", "A", "A", "B"], ["B", "A", "B", "B"], "C", "B"], expected: 0.0 },
      { input: [[], [], "A", "B"], expected: 0.0 },
    ],
    hint: "The denominator is the count of the gold label, not the total number of tokens.",
  },
  {
    id: "nlp-287",
    title: "Beam Top-k After Two Steps",
    category: "NLP",
    difficulty: "Hard",
    description: "Run beam search over probability rows and return the surviving beams. vocab aligns with each row of step_probs, beams start as one empty hypothesis with log score 0.0, and every beam is extended by every token with positive probability.\n\nAfter each step keep the top beam_width hypotheses ranked by score descending and then by token sequence lexicographically. Return all surviving beams as [[tokens], score] pairs in that order.",
    starterCode: `import math
def beam_topk_after_two_steps(vocab, step_probs, beam_width):
    # Your code here
    pass`,
    solution: `import math
def beam_topk_after_two_steps(vocab, step_probs, beam_width):
    beams = [([], 0.0)]
    for row in step_probs:
        candidates = []
        for seq, score in beams:
            for i, p in enumerate(row):
                if p > 0:
                    candidates.append((seq + [vocab[i]], score + math.log(p)))
        candidates.sort(key=lambda item: (-item[1], item[0]))
        beams = candidates[:beam_width]
    beams.sort(key=lambda item: (-item[1], item[0]))
    return [[list(seq), score] for seq, score in beams]`,
    testCases: [
      { input: [["a", "b"], [[0.6, 0.4], [0.9, 0.1]], 2], expected: [[["a", "a"], -0.6161861394238171], [["b", "a"], -1.0216512475319812]] },
      { input: [["a", "b"], [[0.6, 0.4], [0.9, 0.1]], 1], expected: [[["a", "a"], -0.6161861394238171]] },
      { input: [["a", "b"], [[0.6, 0.4], [0.9, 0.1]], 4], expected: [[["a", "a"], -0.6161861394238171], [["b", "a"], -1.0216512475319812], [["a", "b"], -2.8134107167600364], [["b", "b"], -3.2188758248682006]] },
      { input: [["a"], [[1.0], [1.0]], 1], expected: [[["a", "a"], 0.0]] },
      { input: [["a", "b"], [[0.0, 0.0]], 2], expected: [] },
    ],
    hint: "Scores add in log space, and sequences break ties lexicographically.",
  },
  {
    id: "nlp-288",
    title: "GNMT Length Penalty Beam Score",
    category: "NLP",
    difficulty: "Easy",
    description: "Apply the GNMT length penalty to a beam log probability:\n\nscore = logprob / (((5 + length) / 6) ** alpha)\n\nlength is the hypothesis length including the end token, and alpha is the penalty exponent. Return 0.0 when length is negative.",
    starterCode: `def beam_score_gnmt(logprob, length, alpha):
    # Your code here
    pass`,
    solution: `def beam_score_gnmt(logprob, length, alpha):
    if length < 0:
        return 0.0
    return logprob / (((5 + length) / 6.0) ** alpha)`,
    testCases: [
      { input: [-3.0, 1, 1.0], expected: -3.0 },
      { input: [-3.0, 7, 1.0], expected: -1.5 },
      { input: [-3.0, 7, 0.0], expected: -3.0 },
      { input: [0.0, 3, 2.0], expected: 0.0 },
      { input: [-2.5, 1, 2.0], expected: -2.5 },
    ],
    hint: "The penalty factor is 1.0 when length is 1, and it grows with longer hypotheses.",
  },
  {
    id: "nlp-289",
    title: "Length Normalization Exponent Effect",
    category: "NLP",
    difficulty: "Medium",
    description: "Compare two beam hypotheses after length normalization with exponent alpha. Each hypothesis is a (score, length) pair, and a non-positive length is used as-is without normalization.\n\nNormalized score is score / (length ** alpha) when length is positive. Return 'a' or 'b' for the higher normalized score, or 'tie'.",
    starterCode: `def length_norm_exponent_effect(score_a, length_a, score_b, length_b, alpha):
    # Your code here
    pass`,
    solution: `def length_norm_exponent_effect(score_a, length_a, score_b, length_b, alpha):
    norm_a = score_a / (length_a ** alpha) if length_a > 0 else score_a
    norm_b = score_b / (length_b ** alpha) if length_b > 0 else score_b
    if norm_a > norm_b:
        return "a"
    if norm_b > norm_a:
        return "b"
    return "tie"
`,
    testCases: [
      { input: [-2.0, 10, -1.5, 1, 1.0], expected: "a" },
      { input: [-2.0, 10, -1.5, 1, 0.0], expected: "b" },
      { input: [-1.0, 2, -2.0, 4, 1.0], expected: "tie" },
      { input: [-0.5, 2, -2.0, 4, 1.0], expected: "a" },
      { input: [-1.0, 0, -2.0, 4, 1.0], expected: "b" },
    ],
    hint: "For negative log scores, dividing by a longer length makes the score less negative.",
  },
  {
    id: "nlp-290",
    title: "Greedy versus Beam Divergence",
    category: "NLP",
    difficulty: "Medium",
    description: "Compare context-dependent greedy decoding with beam search. vocab is the token list, model maps a space-joined prefix to the probability row for the next token, steps is the number of tokens to decode, and beam_width controls the search.\n\nReturn the first index where the greedy sequence and the best beam sequence differ, the shorter length when one is a prefix of the other, or -1 when they are identical.",
    starterCode: `import math
def greedy_vs_beam_divergence(vocab, model, steps, beam_width):
    # Your code here
    pass`,
    solution: `import math
def greedy_vs_beam_divergence(vocab, model, steps, beam_width):
    greedy = []
    prefix = []
    for _ in range(steps):
        row = model.get(" ".join(prefix))
        if not row:
            break
        best = 0
        for i in range(1, len(row)):
            if row[i] > row[best]:
                best = i
        greedy.append(vocab[best])
        prefix = prefix + [vocab[best]]
    beams = [([], 0.0)]
    for _ in range(steps):
        candidates = []
        for seq, score in beams:
            row = model.get(" ".join(seq))
            if not row:
                continue
            for i, p in enumerate(row):
                if p > 0:
                    candidates.append((seq + [vocab[i]], score + math.log(p)))
        candidates.sort(key=lambda item: (-item[1], item[0]))
        beams = candidates[:beam_width]
    beam_best = list(beams[0][0]) if beams else []
    for i in range(min(len(greedy), len(beam_best))):
        if greedy[i] != beam_best[i]:
            return i
    if len(greedy) != len(beam_best):
        return min(len(greedy), len(beam_best))
    return -1`,
    testCases: [
      { input: [["a", "b"], {"": [0.6, 0.4], "a": [0.5, 0.5], "b": [0.9, 0.1]}, 2, 2], expected: 0 },
      { input: [["a", "b"], {"": [0.6, 0.4], "a": [0.5, 0.5], "b": [0.9, 0.1]}, 2, 1], expected: -1 },
      { input: [["a", "b", "c"], {"": [0.2, 0.3, 0.5], "c": [0.1, 0.2, 0.7]}, 2, 2], expected: -1 },
      { input: [["a", "b", "c"], {"": [0.6, 0.3, 0.1], "a": [0.4, 0.3, 0.3], "a a": [0.2, 0.4, 0.4], "a b": [0.9, 0.05, 0.05]}, 3, 2], expected: 1 },
      { input: [["a", "b"], {"": [0.5, 0.5], "a": [1.0, 0.0], "b": [0.0, 1.0]}, 2, 2], expected: -1 },
    ],
    hint: "Greedy commits to each prefix argmax, while beam search can abandon it after seeing better continuations.",
  },
  {
    id: "nlp-291",
    title: "Top-k Sampling Threshold",
    category: "NLP",
    difficulty: "Easy",
    description: "Return the top-k sampling threshold for a probability distribution: the k-th largest probability in probs.\n\nTokens with probability below this threshold are excluded by top-k sampling. Return 0.0 when k is not positive, k exceeds the number of probabilities, or probs is empty.",
    starterCode: `def top_k_sampling_threshold(probs, k):
    # Your code here
    pass`,
    solution: `def top_k_sampling_threshold(probs, k):
    if k <= 0 or k > len(probs):
        return 0.0
    ordered = sorted(probs, reverse=True)
    return ordered[k - 1]`,
    testCases: [
      { input: [[0.5, 0.3, 0.2], 2], expected: 0.3 },
      { input: [[0.1, 0.4, 0.4, 0.1], 1], expected: 0.4 },
      { input: [[0.25, 0.25, 0.25, 0.25], 3], expected: 0.25 },
      { input: [[0.5, 0.5], 0], expected: 0.0 },
      { input: [[0.5, 0.5], 5], expected: 0.0 },
    ],
    hint: "Sort descending and read the probability at position k - 1.",
  },
  {
    id: "nlp-292",
    title: "Nucleus Cutoff Index",
    category: "NLP",
    difficulty: "Easy",
    description: "Return how many tokens nucleus (top-p) sampling keeps from a probability list. Sort the probabilities descending and add them one at a time until the running sum reaches or exceeds p.\n\nReturn the number of tokens added, or 0 when probs is empty or p is not positive. If the total probability is below p, all tokens are kept.",
    starterCode: `def nucleus_cutoff_index(probs, p):
    # Your code here
    pass`,
    solution: `def nucleus_cutoff_index(probs, p):
    if not probs or p <= 0:
        return 0
    ordered = sorted(probs, reverse=True)
    cumulative = 0.0
    kept = 0
    for value in ordered:
        cumulative += value
        kept += 1
        if cumulative >= p:
            break
    return kept`,
    testCases: [
      { input: [[0.4, 0.3, 0.2, 0.1], 0.5], expected: 2 },
      { input: [[0.25, 0.25, 0.25, 0.25], 0.5], expected: 2 },
      { input: [[0.25, 0.25, 0.25, 0.25], 0.9], expected: 4 },
      { input: [[0.9, 0.1], 0.1], expected: 1 },
      { input: [[], 0.5], expected: 0 },
    ],
    hint: "Stop as soon as the cumulative mass reaches p and report the count.",
  },
  {
    id: "nlp-293",
    title: "Temperature-Adjusted Entropy",
    category: "NLP",
    difficulty: "Hard",
    description: "Return the entropy in nats of softmax(logits / temperature). Higher temperature flattens the distribution and raises entropy, while lower temperature sharpens it.\n\nCompute the softmax with the max-subtraction trick for stability, then entropy = -sum of p * log(p). Return 0.0 for empty logits. temperature is assumed positive.",
    starterCode: `import math
def temperature_adjusted_entropy(logits, temperature):
    # Your code here
    pass`,
    solution: `import math
def temperature_adjusted_entropy(logits, temperature):
    if not logits:
        return 0.0
    scaled = [value / temperature for value in logits]
    peak = max(scaled)
    exps = [math.exp(value - peak) for value in scaled]
    total = sum(exps)
    probs = [value / total for value in exps]
    entropy = 0.0
    for p in probs:
        if p > 0:
            entropy -= p * math.log(p)
    return entropy`,
    testCases: [
      { input: [[0.0, 0.0], 1.0], expected: 0.6931471805599453 },
      { input: [[0.0, 0.0], 0.5], expected: 0.6931471805599453 },
      { input: [[10.0, 0.0], 1.0], expected: 0.0004993775862411646 },
      { input: [[10.0, 0.0], 10.0], expected: 0.5822031088882179 },
      { input: [[], 1.0], expected: 0.0 },
    ],
    hint: "Entropy is maximized by the uniform distribution and approaches 0 as one logit dominates.",
  },
  {
    id: "nlp-294",
    title: "Repetition Penalty on Sequence Score",
    category: "NLP",
    difficulty: "Medium",
    description: "Score a generated token sequence with a repetition penalty. tokens and logprobs are parallel lists, and penalty is the multiplicative penalty applied to any token that already appeared earlier in the sequence.\n\nFor a repeated token, replace its log probability lp with lp - log(penalty); first occurrences are unchanged. Return the total penalized log probability. penalty is assumed positive.",
    starterCode: `import math
def repetition_penalty_sequence_score(tokens, logprobs, penalty):
    # Your code here
    pass`,
    solution: `import math
def repetition_penalty_sequence_score(tokens, logprobs, penalty):
    total = 0.0
    seen = set()
    for token, lp in zip(tokens, logprobs):
        if token in seen:
            total += lp - math.log(penalty)
        else:
            total += lp
            seen.add(token)
    return total`,
    testCases: [
      { input: [["a", "b", "a"], [-0.5, -0.4, -0.3], 2.0], expected: -1.8931471805599451 },
      { input: [["a", "b", "c"], [-0.5, -0.4, -0.3], 2.0], expected: -1.2 },
      { input: [["a", "a", "a"], [-1.0, -1.0, -1.0], 1.0], expected: -3.0 },
      { input: [[], [], 2.0], expected: 0.0 },
      { input: [["x", "x", "x"], [-1.0, -1.0, -1.0], 10.0], expected: -7.605170185988092 },
    ],
    hint: "Subtracting log(penalty) is the same as dividing the probability by penalty.",
  },
  {
    id: "nlp-295",
    title: "No-Repeat N-gram Block Count",
    category: "NLP",
    difficulty: "Medium",
    description: "Count how many vocabulary tokens are blocked by a no-repeat n-gram constraint. A candidate token c is blocked when the n-gram formed by the last n - 1 tokens of tokens followed by c already occurs somewhere in tokens.\n\nReturn the number of blocked candidates in vocab, counting duplicates in vocab separately. Return 0 when n is less than 1 or there are fewer than n - 1 prefix tokens.",
    starterCode: `def no_repeat_ngram_block_count(tokens, vocab, n):
    # Your code here
    pass`,
    solution: `def no_repeat_ngram_block_count(tokens, vocab, n):
    if n < 1 or len(tokens) < n - 1:
        return 0
    seen = set()
    for i in range(len(tokens) - n + 1):
        seen.add(tuple(tokens[i:i + n]))
    if n == 1:
        context = ()
    else:
        context = tuple(tokens[-(n - 1):])
    blocked = 0
    for candidate in vocab:
        if context + (candidate,) in seen:
            blocked += 1
    return blocked`,
    testCases: [
      { input: [["a", "b", "c", "a", "b"], ["a", "b", "c"], 3], expected: 1 },
      { input: [["a", "b", "c", "a", "b"], ["a", "b", "c"], 2], expected: 1 },
      { input: [["a", "a", "b"], ["a", "b", "c"], 1], expected: 2 },
      { input: [["a"], ["a", "b"], 2], expected: 0 },
      { input: [[], ["a"], 3], expected: 0 },
    ],
    hint: "Build the set of seen n-grams, then test the last n - 1 tokens plus each candidate.",
  },
  {
    id: "nlp-296",
    title: "Constrained Trie Remaining Depth",
    category: "NLP",
    difficulty: "Medium",
    description: "Report how deep a constrained decoding trie still descends below a prefix. words is the list of allowed complete strings and prefix is the already-generated text.\n\nReturn the maximum number of additional characters needed to finish any allowed word that starts with prefix, 0 when prefix is already a complete allowed word and cannot be extended, and -1 when prefix is not a prefix of any allowed word.",
    starterCode: `def constrained_trie_remaining_depth(words, prefix):
    # Your code here
    pass`,
    solution: `def constrained_trie_remaining_depth(words, prefix):
    depths = [len(word) - len(prefix) for word in words if word.startswith(prefix)]
    if not depths:
        return -1
    return max(depths)`,
    testCases: [
      { input: [["cat", "car", "dog"], "ca"], expected: 1 },
      { input: [["cat", "catalog"], "cat"], expected: 4 },
      { input: [["cat"], "cats"], expected: -1 },
      { input: [[], "ab"], expected: -1 },
      { input: [["a"], ""], expected: 1 },
    ],
    hint: "Filter words that start with the prefix and take the largest remaining length.",
  },
  {
    id: "nlp-297",
    title: "Grammar Valid Continuation Count",
    category: "NLP",
    difficulty: "Easy",
    description: "Count the distinct next characters that a grammar allows. words is the list of allowed complete strings and prefix is the text generated so far.\n\nReturn the number of distinct characters that appear immediately after prefix in at least one allowed word. Return 0 when no allowed word extends prefix.",
    starterCode: `def grammar_valid_continuation_count(words, prefix):
    # Your code here
    pass`,
    solution: `def grammar_valid_continuation_count(words, prefix):
    chars = set()
    for word in words:
        if word.startswith(prefix) and len(word) > len(prefix):
            chars.add(word[len(prefix)])
    return len(chars)`,
    testCases: [
      { input: [["cat", "car", "dog"], "ca"], expected: 2 },
      { input: [["cat", "car", "cow"], "c"], expected: 2 },
      { input: [["cat"], "cats"], expected: 0 },
      { input: [[], "ab"], expected: 0 },
      { input: [["hello", "help"], "hel"], expected: 2 },
    ],
    hint: "Collect the character at position len(prefix) for every extending word into a set.",
  },
  {
    id: "nlp-298",
    title: "FST Composition State Count",
    category: "NLP",
    difficulty: "Hard",
    description: "Count the reachable states of the composition of two finite-state transducers. t1 and t2 are transition lists of [from_state, input_symbol, output_symbol, to_state], and composition connects a t1 transition to a t2 transition when t1's output symbol equals t2's input symbol.\n\nStart from the state pair [start1, start2] and follow all matching transitions. Return the number of distinct state pairs reachable, including the start pair.",
    starterCode: `def fst_composition_state_count(t1, t2, start1, start2):
    # Your code here
    pass`,
    solution: `def fst_composition_state_count(t1, t2, start1, start2):
    visited = set()
    stack = [(start1, start2)]
    visited.add((start1, start2))
    while stack:
        left_state, right_state = stack.pop()
        for left in t1:
            if left[0] != left_state:
                continue
            for right in t2:
                if right[0] != right_state:
                    continue
                if left[2] == right[1]:
                    nxt = (left[3], right[3])
                    if nxt not in visited:
                        visited.add(nxt)
                        stack.append(nxt)
    return len(visited)`,
    testCases: [
      { input: [[[0, "a", "x", 1], [1, "b", "y", 2]], [[0, "x", "p", 1], [1, "y", "q", 2]], 0, 0], expected: 3 },
      { input: [[[0, "a", "x", 1]], [[0, "x", "p", 1]], 0, 0], expected: 2 },
      { input: [[[0, "a", "z", 1]], [[0, "x", "p", 1]], 0, 0], expected: 1 },
      { input: [[], [[0, "x", "p", 1]], 0, 0], expected: 1 },
      { input: [[[0, "a", "x", 1], [0, "a", "y", 2]], [[0, "x", "p", 0], [0, "y", "q", 1]], 0, 0], expected: 3 },
    ],
    hint: "Depth-first search over pairs of transducer states, advancing only on matching middle symbols.",
  },
  {
    id: "nlp-299",
    title: "Sentence Edit Distance and WER",
    category: "NLP",
    difficulty: "Medium",
    description: "Compute both the token-level Levenshtein distance and the word error rate between a reference and a hypothesis. reference and hypothesis are lists of tokens.\n\nReturn [edit_distance, wer], where edit_distance counts substitutions, insertions, and deletions, and wer is edit_distance divided by the reference length. An empty reference gives 0.0 for an empty hypothesis and 1.0 otherwise.",
    starterCode: `def sentence_edit_distance_wer(reference, hypothesis):
    # Your code here
    pass`,
    solution: `def sentence_edit_distance_wer(reference, hypothesis):
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
    distance = dp[n][m]
    if n == 0:
        return [distance, 0.0 if m == 0 else 1.0]
    return [distance, distance / n]`,
    testCases: [
      { input: [["a", "b", "c"], ["a", "b", "c"]], expected: [0, 0.0] },
      { input: [["a", "b", "c"], ["a", "c"]], expected: [1, 0.3333333333333333] },
      { input: [["a", "b"], ["b", "a"]], expected: [2, 1.0] },
      { input: [["a"], ["a", "b"]], expected: [1, 1.0] },
      { input: [[], ["x"]], expected: [1, 1.0] },
    ],
    hint: "Fill the standard edit-distance table once, then derive the rate from the final cell.",
  },
  {
    id: "nlp-300",
    title: "WER with Alternative References",
    category: "NLP",
    difficulty: "Hard",
    description: "Compute the word error rate when each reference position accepts multiple surface forms. reference_alts is a list of positions, each a list of acceptable tokens for that position, and hypothesis is the recognized token list.\n\nA substitution costs 0 when the hypothesis token is any accepted alternative at that position, otherwise 1. Return the minimum edit distance divided by the number of reference positions, or 0.0 for two empty inputs and 1.0 when only the hypothesis is non-empty.",
    starterCode: `def wer_with_alternatives(reference_alts, hypothesis):
    # Your code here
    pass`,
    solution: `def wer_with_alternatives(reference_alts, hypothesis):
    n, m = len(reference_alts), len(hypothesis)
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(n + 1):
        dp[i][0] = i
    for j in range(m + 1):
        dp[0][j] = j
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            cost = 0 if hypothesis[j - 1] in reference_alts[i - 1] else 1
            dp[i][j] = min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
    distance = dp[n][m]
    if n == 0:
        return 0.0 if m == 0 else 1.0
    return distance / n`,
    testCases: [
      { input: [[["a"], ["b"]], ["a", "b"]], expected: 0.0 },
      { input: [[["a", "b"], ["c"]], ["b", "c"]], expected: 0.0 },
      { input: [[["a"], ["b"]], ["b", "a"]], expected: 1.0 },
      { input: [[], []], expected: 0.0 },
      { input: [[], ["x"]], expected: 1.0 },
    ],
    hint: "Keep the usual dynamic program and make the substitution cost a membership test.",
  },
  {
    id: "nlp-301",
    title: "Corpus Word Error Rate",
    category: "NLP",
    difficulty: "Medium",
    description: "Compute corpus-level WER by pooling edit operations. references and hypotheses are parallel lists of token lists.\n\nSum the Levenshtein distance over all pairs and divide by the total reference token count. Return 0.0 when all references are empty and all hypotheses are empty, and 1.0 when the references are empty but the hypotheses are not.",
    starterCode: `def corpus_wer(references, hypotheses):
    # Your code here
    pass`,
    solution: `def corpus_wer(references, hypotheses):
    def distance(reference, hypothesis):
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
        return dp[n][m]

    total_distance = 0
    total_reference = 0
    total_hypothesis = 0
    for reference, hypothesis in zip(references, hypotheses):
        total_distance += distance(reference, hypothesis)
        total_reference += len(reference)
        total_hypothesis += len(hypothesis)
    if total_reference == 0:
        return 0.0 if total_hypothesis == 0 else 1.0
    return total_distance / total_reference`,
    testCases: [
      { input: [[["a", "b", "c"], ["a", "b"]], [["a", "c"], ["a", "c"]]], expected: 0.4 },
      { input: [[["a"], []], [["a"], []]], expected: 0.0 },
      { input: [[[], []], [[], []]], expected: 0.0 },
      { input: [[[], []], [["x"], ["y"]]], expected: 1.0 },
      { input: [[["a", "b", "c", "d"]], [["a", "b"]]], expected: 0.5 },
    ],
    hint: "Aggregate edit distance and reference length across the whole corpus instead of averaging per-sentence rates.",
  },
  {
    id: "nlp-302",
    title: "Normalized Character Error Rate",
    category: "NLP",
    difficulty: "Easy",
    description: "Compute character error rate after normalization. Lowercase both strings and keep only alphanumeric characters, then take the Levenshtein distance between the cleaned strings divided by the cleaned reference length.\n\nReturn 0.0 when both cleaned strings are empty and 1.0 when only the reference is empty.",
    starterCode: `def normalized_cer(reference, hypothesis):
    # Your code here
    pass`,
    solution: `def normalized_cer(reference, hypothesis):
    def clean(text):
        return "".join(ch.lower() for ch in text if ch.isalnum())

    ref = clean(reference)
    hyp = clean(hypothesis)
    n, m = len(ref), len(hyp)
    if n == 0:
        return 0.0 if m == 0 else 1.0
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(n + 1):
        dp[i][0] = i
    for j in range(m + 1):
        dp[0][j] = j
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            cost = 0 if ref[i - 1] == hyp[j - 1] else 1
            dp[i][j] = min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
    return dp[n][m] / n`,
    testCases: [
      { input: ["Hello, World!", "hello world"], expected: 0.0 },
      { input: ["abc", "ab"], expected: 0.3333333333333333 },
      { input: ["A-B", "A B"], expected: 0.0 },
      { input: ["", ""], expected: 0.0 },
      { input: ["", "x"], expected: 1.0 },
    ],
    hint: "Normalize first, then run the character-level edit-distance table.",
  },
  {
    id: "nlp-303",
    title: "METEOR Weighted F-mean",
    category: "NLP",
    difficulty: "Easy",
    description: "Return the METEOR weighted F-mean of precision and recall:\n\nFmean = (1 + beta ** 2) * precision * recall / (recall + beta ** 2 * precision)\n\nbeta controls the recall weight, with METEOR traditionally using beta = 3. Return 0.0 when the denominator is 0.",
    starterCode: `def meteor_weighted_fmean(precision, recall, beta):
    # Your code here
    pass`,
    solution: `def meteor_weighted_fmean(precision, recall, beta):
    denominator = recall + beta * beta * precision
    if denominator == 0:
        return 0.0
    return (1 + beta * beta) * precision * recall / denominator`,
    testCases: [
      { input: [0.5, 0.5, 3.0], expected: 0.5 },
      { input: [1.0, 0.5, 3.0], expected: 0.5263157894736842 },
      { input: [0.0, 0.5, 1.0], expected: 0.0 },
      { input: [0.5, 0.5, 0.0], expected: 0.5 },
      { input: [1.0, 1.0, 2.0], expected: 1.0 },
    ],
    hint: "When beta is 0 the formula reduces to precision.",
  },
  {
    id: "nlp-304",
    title: "BLEU-2 with Clipping",
    category: "NLP",
    difficulty: "Medium",
    description: "Compute the clipped BLEU-2 score between candidate and reference token lists. Unigram and bigram precisions use multiplicity clipping against the reference, and the score is the geometric mean exp((log p1 + log p2) / 2).\n\nReturn 0.0 when either side lacks unigrams or bigrams, or when either precision is 0. Brevity is not penalized here.",
    starterCode: `import math
def bleu2_clipped(candidate, reference):
    # Your code here
    pass`,
    solution: `import math
def bleu2_clipped(candidate, reference):
    def ngrams(tokens, n):
        return [tuple(tokens[i:i + n]) for i in range(len(tokens) - n + 1)]

    def clipped_matches(candidate_grams, reference_grams):
        counts = {}
        for gram in reference_grams:
            counts[gram] = counts.get(gram, 0) + 1
        matches = 0
        for gram in candidate_grams:
            if counts.get(gram, 0) > 0:
                matches += 1
                counts[gram] -= 1
        return matches

    candidate_unigrams = ngrams(candidate, 1)
    reference_unigrams = ngrams(reference, 1)
    candidate_bigrams = ngrams(candidate, 2)
    reference_bigrams = ngrams(reference, 2)
    if not candidate_unigrams or not reference_unigrams:
        return 0.0
    if not candidate_bigrams or not reference_bigrams:
        return 0.0
    p1 = clipped_matches(candidate_unigrams, reference_unigrams) / len(candidate_unigrams)
    p2 = clipped_matches(candidate_bigrams, reference_bigrams) / len(candidate_bigrams)
    if p1 <= 0 or p2 <= 0:
        return 0.0
    return math.exp((math.log(p1) + math.log(p2)) / 2)`,
    testCases: [
      { input: [["a", "b", "c"], ["a", "b", "c"]], expected: 1.0 },
      { input: [["a", "b", "d"], ["a", "b", "c"]], expected: 0.5773502691896257 },
      { input: [["a"], ["a", "b"]], expected: 0.0 },
      { input: [["a", "b"], ["a", "b", "c"]], expected: 1.0 },
      { input: [["x", "y"], ["a", "b"]], expected: 0.0 },
    ],
    hint: "Clip each distinct n-gram count by how often it appears in the reference.",
  },
  {
    id: "nlp-305",
    title: "chrF3 Character N-gram F-score",
    category: "NLP",
    difficulty: "Hard",
    description: "Compute a chrF3 score using character n-grams of order 1, 2, and 3. For each order, compute the clipped character n-gram F-score between candidate and reference, then return the arithmetic mean over orders.\n\nAn order where exactly one side lacks n-grams scores 0.0, an order where both sides lack n-grams is skipped, and 0.0 is returned when no order is scored. Return 0.0 when there are no matches at any scored order.",
    starterCode: `def chrf3(candidate, reference):
    # Your code here
    pass`,
    solution: `def chrf3(candidate, reference):
    def ngrams(text, n):
        return [text[i:i + n] for i in range(len(text) - n + 1)]

    scores = []
    for n in (1, 2, 3):
        candidate_grams = ngrams(candidate, n)
        reference_grams = ngrams(reference, n)
        if not candidate_grams and not reference_grams:
            continue
        if not candidate_grams or not reference_grams:
            scores.append(0.0)
            continue
        counts = {}
        for gram in reference_grams:
            counts[gram] = counts.get(gram, 0) + 1
        matches = 0
        for gram in candidate_grams:
            if counts.get(gram, 0) > 0:
                matches += 1
                counts[gram] -= 1
        if matches == 0:
            scores.append(0.0)
            continue
        precision = matches / len(candidate_grams)
        recall = matches / len(reference_grams)
        scores.append(2 * precision * recall / (precision + recall))
    if not scores:
        return 0.0
    return sum(scores) / len(scores)`,
    testCases: [
      { input: ["abc", "abc"], expected: 1.0 },
      { input: ["abc", "abd"], expected: 0.38888888888888884 },
      { input: ["ab", "a"], expected: 0.3333333333333333 },
      { input: ["", ""], expected: 0.0 },
      { input: ["a", "b"], expected: 0.0 },
    ],
    hint: "Average the per-order clipped F-scores, skipping only orders where both strings are too short.",
  },
  {
    id: "nlp-306",
    title: "ROUGE-1 Recall",
    category: "NLP",
    difficulty: "Easy",
    description: "Return the ROUGE-1 recall between candidate and reference token lists. Count unigram matches with multiplicity clipping, then divide by the number of reference tokens.\n\nReturn 1.0 when both lists are empty and 0.0 when only the reference is empty.",
    starterCode: `def rouge1_recall(candidate, reference):
    # Your code here
    pass`,
    solution: `def rouge1_recall(candidate, reference):
    if not reference:
        return 1.0 if not candidate else 0.0
    counts = {}
    for token in reference:
        counts[token] = counts.get(token, 0) + 1
    matches = 0
    for token in candidate:
        if counts.get(token, 0) > 0:
            matches += 1
            counts[token] -= 1
    return matches / len(reference)`,
    testCases: [
      { input: [["a", "b", "c"], ["a", "b", "c"]], expected: 1.0 },
      { input: [["a", "b"], ["a", "b", "b"]], expected: 0.6666666666666666 },
      { input: [["x"], ["a", "b"]], expected: 0.0 },
      { input: [[], []], expected: 1.0 },
      { input: [["a", "a"], ["a"]], expected: 1.0 },
    ],
    hint: "Clip each matched unigram against its remaining count in the reference.",
  },
  {
    id: "nlp-307",
    title: "ROUGE-2 Clipped Bigram Overlap",
    category: "NLP",
    difficulty: "Easy",
    description: "Return the number of clipped bigram matches between candidate and reference token lists. A bigram match consumes one occurrence in the reference, so repeated candidate bigrams cannot match more times than they appear in the reference.\n\nReturn 0 when either list has fewer than two tokens.",
    starterCode: `def rouge2_overlap(candidate, reference):
    # Your code here
    pass`,
    solution: `def rouge2_overlap(candidate, reference):
    def bigrams(tokens):
        return [tuple(tokens[i:i + 2]) for i in range(len(tokens) - 1)]

    counts = {}
    for gram in bigrams(reference):
        counts[gram] = counts.get(gram, 0) + 1
    matches = 0
    for gram in bigrams(candidate):
        if counts.get(gram, 0) > 0:
            matches += 1
            counts[gram] -= 1
    return matches`,
    testCases: [
      { input: [["a", "b", "c"], ["a", "b", "c"]], expected: 2 },
      { input: [["a", "b", "c"], ["a", "b", "d"]], expected: 1 },
      { input: [["a"], ["a"]], expected: 0 },
      { input: [["a", "a", "a"], ["a", "a"]], expected: 1 },
      { input: [["x", "y"], ["a", "b"]], expected: 0 },
    ],
    hint: "Count matches, not F1: each matched candidate bigram consumes one reference occurrence.",
  },
  {
    id: "nlp-308",
    title: "Distinct-1 and Distinct-2 Diversity",
    category: "NLP",
    difficulty: "Medium",
    description: "Measure generation diversity over a list of token sequences. Pool all unigrams across sequences, and count bigrams only within each sequence without crossing its boundary.\n\nReturn [distinct-1, distinct-2], where each is the number of unique items divided by the total number of items of that order. A zero denominator gives 0.0 for that order.",
    starterCode: `def distinct_1_2(sequences):
    # Your code here
    pass`,
    solution: `def distinct_1_2(sequences):
    unigram_total = 0
    unigrams = set()
    bigram_total = 0
    bigrams = set()
    for seq in sequences:
        for token in seq:
            unigram_total += 1
            unigrams.add(token)
        for i in range(len(seq) - 1):
            bigram_total += 1
            bigrams.add((seq[i], seq[i + 1]))
    distinct1 = len(unigrams) / unigram_total if unigram_total > 0 else 0.0
    distinct2 = len(bigrams) / bigram_total if bigram_total > 0 else 0.0
    return [distinct1, distinct2]`,
    testCases: [
      { input: [[["a", "b", "c"]]], expected: [1.0, 1.0] },
      { input: [[["a", "a", "a"]]], expected: [0.3333333333333333, 0.5] },
      { input: [[["a", "b"], ["a", "b"]]], expected: [0.5, 0.5] },
      { input: [[]], expected: [0.0, 0.0] },
      { input: [[["a"], []]], expected: [1.0, 0.0] },
    ],
    hint: "Bigrams must stay inside their own sequence; unigrams pool across the whole batch.",
  },
  {
    id: "nlp-309",
    title: "Self-BLEU-1 Similarity",
    category: "NLP",
    difficulty: "Hard",
    description: "Compute a BLEU-1 style self-similarity for a list of generated token sequences. For every ordered pair of distinct sequences, treat the first as the hypothesis and the second as the reference, and score it as BP * unigram precision with clipped matches and BP = min(1, exp(1 - reference_length / hypothesis_length)).\n\nAverage over all ordered pairs. Return 0.0 when fewer than two sequences are provided, and an empty hypothesis contributes 0.0 for its pairs.",
    starterCode: `import math
def self_bleu1(sequences):
    # Your code here
    pass`,
    solution: `import math
def self_bleu1(sequences):
    count = len(sequences)
    if count < 2:
        return 0.0
    total = 0.0
    pairs = 0
    for i in range(count):
        hypothesis = sequences[i]
        for j in range(count):
            if i == j:
                continue
            reference = sequences[j]
            if not hypothesis:
                total += 0.0
                pairs += 1
                continue
            counts = {}
            for token in reference:
                counts[token] = counts.get(token, 0) + 1
            matches = 0
            for token in hypothesis:
                if counts.get(token, 0) > 0:
                    matches += 1
                    counts[token] -= 1
            precision = matches / len(hypothesis)
            brevity = min(1.0, math.exp(1 - len(reference) / len(hypothesis)))
            total += brevity * precision
            pairs += 1
    return total / pairs`,
    testCases: [
      { input: [[["a", "b"], ["a", "c"]]], expected: 0.5 },
      { input: [[["a"], ["a", "b"]]], expected: 0.43393972058572117 },
      { input: [[["a", "a"], ["a", "a"]]], expected: 1.0 },
      { input: [[["a"]]], expected: 0.0 },
      { input: [[[], []]], expected: 0.0 },
    ],
    hint: "All ordered pairs count, so pair (i, j) and pair (j, i) can score differently.",
  },
  {
    id: "nlp-310",
    title: "Perplexity Comparison from Logprobs",
    category: "NLP",
    difficulty: "Medium",
    description: "Compare two language models from token log probabilities. perplexity is exp of the negative mean log probability, and an empty list is treated as perplexity 1.0.\n\nReturn [perplexity_a, perplexity_b, winner], where winner is 'a' for the lower perplexity, 'b' for the higher perplexity of the other model, or 'tie' when the values are equal.",
    starterCode: `import math
def perplexity_comparison(logprobs_a, logprobs_b):
    # Your code here
    pass`,
    solution: `import math
def perplexity_comparison(logprobs_a, logprobs_b):
    def perplexity(logprobs):
        if not logprobs:
            return 1.0
        return math.exp(-sum(logprobs) / len(logprobs))

    value_a = perplexity(logprobs_a)
    value_b = perplexity(logprobs_b)
    if value_a < value_b:
        winner = "a"
    elif value_b < value_a:
        winner = "b"
    else:
        winner = "tie"
    return [value_a, value_b, winner]`,
    testCases: [
      { input: [[-1.0, -2.0], [-0.5, -0.5]], expected: [4.4816890703380645, 1.6487212707001282, "b"] },
      { input: [[-1.0], [-1.0]], expected: [2.718281828459045, 2.718281828459045, "tie"] },
      { input: [[], []], expected: [1.0, 1.0, "tie"] },
      { input: [[-0.5], []], expected: [1.6487212707001282, 1.0, "b"] },
      { input: [[-2.0, -2.0], [-1.0, -1.0, -1.0]], expected: [7.38905609893065, 2.718281828459045, "b"] },
    ],
    hint: "Lower perplexity means the model assigned higher average probability to the tokens.",
  },
  {
    id: "nlp-311",
    title: "Length-Normalized Logprob Flip Check",
    category: "NLP",
    difficulty: "Medium",
    description: "Check whether length normalization changes the ranking of two hypotheses. Normalize each log probability as logprob / (length ** alpha), using the raw logprob when the length is not positive.\n\nReturn 'tie' when the normalized scores are equal, 'same' when the normalized winner also has the higher raw logprob, and 'flipped' when normalization reverses the raw ranking.",
    starterCode: `def length_norm_flip_check(logprob_a, length_a, logprob_b, length_b, alpha):
    # Your code here
    pass`,
    solution: `def length_norm_flip_check(logprob_a, length_a, logprob_b, length_b, alpha):
    norm_a = logprob_a / (length_a ** alpha) if length_a > 0 else logprob_a
    norm_b = logprob_b / (length_b ** alpha) if length_b > 0 else logprob_b
    if norm_a == norm_b:
        return "tie"
    norm_winner = "a" if norm_a > norm_b else "b"
    raw_winner = "a" if logprob_a > logprob_b else "b"
    if norm_winner == raw_winner:
        return "same"
    return "flipped"
`,
    testCases: [
      { input: [-2.0, 10, -1.5, 1, 1.0], expected: "flipped" },
      { input: [-2.0, 10, -1.5, 1, 0.0], expected: "same" },
      { input: [-1.0, 2, -2.0, 4, 1.0], expected: "tie" },
      { input: [-0.5, 2, -2.0, 4, 1.0], expected: "same" },
      { input: [-1.0, 0, -2.0, 4, 1.0], expected: "flipped" },
    ],
    hint: "Because log probabilities are negative, longer sequences get a boost from normalization.",
  },
  {
    id: "nlp-312",
    title: "Logprob of a Token Given Top-k",
    category: "NLP",
    difficulty: "Medium",
    description: "Estimate the log probability of a token when only the top-k log probabilities are known. topk_logprobs maps the k most likely tokens to their log probabilities, and vocab_size is the full vocabulary size.\n\nWhen the token is in the top-k, return its stored log probability. Otherwise distribute the remaining probability mass evenly over the other tokens: log((1 - sum of top-k probabilities) / (vocab_size - k)). Return float('-inf') when no mass or no remaining tokens exist.",
    starterCode: `import math
def logprob_given_topk(token, topk_logprobs, vocab_size):
    # Your code here
    pass`,
    solution: `import math
def logprob_given_topk(token, topk_logprobs, vocab_size):
    if token in topk_logprobs:
        return topk_logprobs[token]
    tail = 1.0 - sum(math.exp(value) for value in topk_logprobs.values())
    remaining = vocab_size - len(topk_logprobs)
    if remaining <= 0 or tail <= 0:
        return float("-inf")
    return math.log(tail / remaining)`,
    testCases: [
      { input: ["c", {"a": -0.6931471805599453, "b": -2.302585092994046}, 10], expected: -2.995732273553991 },
      { input: ["a", {"a": -0.6931471805599453, "b": -2.302585092994046}, 10], expected: -0.6931471805599453 },
      { input: ["x", {}, 4], expected: -1.3862943611198906 },
      { input: ["b", {"a": -0.22314355131420976}, 3], expected: -2.302585092994046 },
      { input: ["z", {"a": -1.6094379124341003, "b": -1.6094379124341003}, 5], expected: -1.6094379124341005 },
    ],
    hint: "The unseen-token mass is shared uniformly among the vocabulary entries outside the top-k.",
  },
  {
    id: "nlp-313",
    title: "Sequence Likelihood with Temperature",
    category: "NLP",
    difficulty: "Hard",
    description: "Compute the total log probability of a token sequence under temperature-scaled softmax distributions. logit_rows is a list of per-step logit lists and targets is the list of chosen token indices, one per row.\n\nSum log softmax(logits / temperature)[target] over all steps using the max-subtraction trick. Return 0.0 when the row and target counts differ.",
    starterCode: `import math
def sequence_likelihood_temperature(logit_rows, targets, temperature):
    # Your code here
    pass`,
    solution: `import math
def sequence_likelihood_temperature(logit_rows, targets, temperature):
    if len(logit_rows) != len(targets):
        return 0.0
    total = 0.0
    for row, target in zip(logit_rows, targets):
        if not row:
            continue
        scaled = [value / temperature for value in row]
        peak = max(scaled)
        exps = [math.exp(value - peak) for value in scaled]
        normalizer = sum(exps)
        total += (scaled[target] - peak) - math.log(normalizer)
    return total`,
    testCases: [
      { input: [[[1.0, 1.0]], [0], 1.0], expected: -0.6931471805599453 },
      { input: [[[2.0, 0.0]], [1], 1.0], expected: -2.1269280110429727 },
      { input: [[[2.0, 0.0]], [1], 2.0], expected: -1.3132616875182228 },
      { input: [[[0.0, 0.0], [0.0, 0.0]], [0, 0], 1.0], expected: -1.3862943611198906 },
      { input: [[[1.0, 2.0, 3.0]], [2], 1.0], expected: -0.4076059644443804 },
    ],
    hint: "Work in log space with the max-subtraction trick, then add each step's target log probability.",
  },
  {
    id: "nlp-314",
    title: "Label Smoothing Token Loss",
    category: "NLP",
    difficulty: "Medium",
    description: "Compute label-smoothed cross-entropy for one token. logits is the score list, target is the correct class index, and smoothing is the label smoothing factor epsilon in [0, 1).\n\nUsing log_softmax values lp, loss = -(1 - epsilon) * lp[target] - (epsilon / K) * sum(lp). Compute the log softmax with the max-subtraction trick. Return 0.0 for empty logits.",
    starterCode: `import math
def label_smoothing_cross_entropy(logits, target, smoothing):
    # Your code here
    pass`,
    solution: `import math
def label_smoothing_cross_entropy(logits, target, smoothing):
    if not logits:
        return 0.0
    peak = max(logits)
    exps = [math.exp(value - peak) for value in logits]
    normalizer = sum(exps)
    log_probs = [(value - peak) - math.log(normalizer) for value in logits]
    size = len(logits)
    return -(1 - smoothing) * log_probs[target] - (smoothing / size) * sum(log_probs)`,
    testCases: [
      { input: [[0.0, 0.0], 0, 0.0], expected: 0.6931471805599453 },
      { input: [[0.0, 0.0], 0, 0.1], expected: 0.6931471805599453 },
      { input: [[1.0, 0.0], 0, 0.0], expected: 0.31326168751822286 },
      { input: [[1.0, 0.0], 0, 0.2], expected: 0.4132616875182229 },
      { input: [[0.0, 1.0], 0, 0.5], expected: 1.0632616875182228 },
    ],
    hint: "Smoothing blends the target log probability with the mean of all log probabilities.",
  },
  {
    id: "nlp-315",
    title: "Focal Loss for Token Classification",
    category: "NLP",
    difficulty: "Medium",
    description: "Compute the focal loss for one token: -alpha * (1 - p_t) ** gamma * log(p_t), where p_t is the softmax probability of the target class.\n\nlogits is the per-class score list, target is the correct class index, gamma is the focusing parameter, and alpha is the class weight. Compute the softmax with the max-subtraction trick and return 0.0 for empty logits.",
    starterCode: `import math
def focal_loss_token(logits, target, gamma, alpha):
    # Your code here
    pass`,
    solution: `import math
def focal_loss_token(logits, target, gamma, alpha):
    if not logits:
        return 0.0
    peak = max(logits)
    exps = [math.exp(value - peak) for value in logits]
    normalizer = sum(exps)
    probability = exps[target] / normalizer
    if probability <= 0:
        return 0.0
    return -alpha * ((1 - probability) ** gamma) * math.log(probability)`,
    testCases: [
      { input: [[2.0, 0.0], 0, 0.0, 1.0], expected: 0.12692801104297263 },
      { input: [[2.0, 0.0], 0, 2.0, 1.0], expected: 0.0018035628352403813 },
      { input: [[0.0, 0.0], 0, 1.0, 0.5], expected: 0.17328679513998632 },
      { input: [[0.0, 0.0], 1, 0.0, 1.0], expected: 0.6931471805599453 },
      { input: [[1.0, 1.0], 0, 3.0, 1.0], expected: 0.08664339756999316 },
    ],
    hint: "When gamma is 0 the focal loss reduces to weighted cross-entropy.",
  },
  {
    id: "nlp-316",
    title: "Class-Weighted Token Loss",
    category: "NLP",
    difficulty: "Easy",
    description: "Compute the class-weighted mean token loss. losses and labels are parallel lists, and weights maps each class label to its weight.\n\nReturn sum(weight * loss) / sum(weight), using a default weight of 1.0 for labels missing from weights. Return 0.0 when there are no tokens or the total weight is 0.",
    starterCode: `def class_weighted_token_loss(losses, labels, weights):
    # Your code here
    pass`,
    solution: `def class_weighted_token_loss(losses, labels, weights):
    total = 0.0
    weight_sum = 0.0
    for loss, label in zip(losses, labels):
        weight = weights.get(label, 1.0)
        total += weight * loss
        weight_sum += weight
    if weight_sum == 0:
        return 0.0
    return total / weight_sum`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], ["a", "b", "a"], {"a": 2.0, "b": 1.0}], expected: 2.0 },
      { input: [[1.0, 2.0, 3.0], ["a", "b", "a"], {}], expected: 2.0 },
      { input: [[], [], {}], expected: 0.0 },
      { input: [[1.0, 1.0], ["x", "y"], {"x": 0.0, "y": 0.0}], expected: 0.0 },
      { input: [[2.0, 4.0], ["a", "b"], {"a": 3.0}], expected: 2.5 },
    ],
    hint: "Normalize by the sum of applied weights, not by the number of tokens.",
  },
  {
    id: "nlp-317",
    title: "Answer Span Constraint Count",
    category: "NLP",
    difficulty: "Medium",
    description: "Count the QA answer spans that satisfy a maximum length and a score threshold. start_logits and end_logits are per-position scores, and a span [i, j] is valid when j is at least i, the inclusive length j - i + 1 is at most max_length, and start_logits[i] + end_logits[j] is strictly greater than threshold.\n\nReturn the number of valid spans, or 0 when max_length is not positive.",
    starterCode: `def answer_span_constraint_count(start_logits, end_logits, max_length, threshold):
    # Your code here
    pass`,
    solution: `def answer_span_constraint_count(start_logits, end_logits, max_length, threshold):
    if max_length <= 0:
        return 0
    count = 0
    for i in range(len(start_logits)):
        upper = min(i + max_length, len(end_logits))
        for j in range(i, upper):
            if start_logits[i] + end_logits[j] > threshold:
                count += 1
    return count`,
    testCases: [
      { input: [[0.5, 0.1], [0.4, 0.2], 2, 0.5], expected: 2 },
      { input: [[0.5, 0.1], [0.4, 0.2], 2, 0.0], expected: 3 },
      { input: [[0.5, 0.1], [0.4, 0.2], 1, 0.0], expected: 2 },
      { input: [[0.5, 0.1], [0.4, 0.2], 2, 1.0], expected: 0 },
      { input: [[], [], 2, 0.0], expected: 0 },
    ],
    hint: "Enumerate i and j with j from i to i + max_length - 1, then apply the strict threshold test.",
  },
  {
    id: "nlp-318",
    title: "QA F1 over Multiple References",
    category: "NLP",
    difficulty: "Medium",
    description: "Return the best token-overlap F1 of a prediction against several reference answers. prediction is a token list and golds is a list of token lists.\n\nFor each reference compute the clipped multiset F1, treating two empty lists as 1.0 and a single empty side as 0.0, then return the maximum score. Return 0.0 when there are no references.",
    starterCode: `def qa_f1_multi(prediction, golds):
    # Your code here
    pass`,
    solution: `def qa_f1_multi(prediction, golds):
    def f1(pred, gold):
        if not pred and not gold:
            return 1.0
        if not pred or not gold:
            return 0.0
        pred_counts = {}
        for token in pred:
            pred_counts[token] = pred_counts.get(token, 0) + 1
        gold_counts = {}
        for token in gold:
            gold_counts[token] = gold_counts.get(token, 0) + 1
        matches = sum(min(count, gold_counts.get(token, 0)) for token, count in pred_counts.items())
        if matches == 0:
            return 0.0
        precision = matches / len(pred)
        recall = matches / len(gold)
        return 2 * precision * recall / (precision + recall)

    if not golds:
        return 0.0
    return max(f1(prediction, gold) for gold in golds)`,
    testCases: [
      { input: [["a", "b"], [["a", "c"], ["a", "b", "c"]]], expected: 0.8 },
      { input: [[], [[]]], expected: 1.0 },
      { input: [["a"], []], expected: 0.0 },
      { input: [["a", "b", "c"], [["a", "b"], ["x", "y", "z"]]], expected: 0.8 },
      { input: [["a", "a"], [["a"]]], expected: 0.6666666666666666 },
    ],
    hint: "Score against every reference and keep the maximum, which is the standard QA metric.",
  },
  {
    id: "nlp-319",
    title: "QA Answer Normalization String",
    category: "NLP",
    difficulty: "Easy",
    description: "Normalize an answer string for exact-match evaluation. Lowercase the text, replace every non-alphanumeric character with a space, drop the English articles a, an, and the, and join the remaining tokens with single spaces.\n\nReturn the normalized string, which is empty when nothing remains.",
    starterCode: `def qa_answer_normalization(text):
    # Your code here
    pass`,
    solution: `def qa_answer_normalization(text):
    lowered = text.lower()
    cleaned = "".join(ch if ch.isalnum() or ch == " " else " " for ch in lowered)
    tokens = [token for token in cleaned.split() if token not in ("a", "an", "the")]
    return " ".join(tokens)`,
    testCases: [
      { input: ["The Cat!"], expected: "cat" },
      { input: ["a dog"], expected: "dog" },
      { input: ["An APPLE, a pear"], expected: "apple pear" },
      { input: ["  "], expected: "" },
      { input: ["What's this?"], expected: "what s this" },
    ],
    hint: "Apply the same canonicalization to both prediction and gold before comparing for exact match.",
  },
  {
    id: "nlp-320",
    title: "Dialogue State Slot Accuracy",
    category: "NLP",
    difficulty: "Easy",
    description: "Compute slot accuracy over dialogue turns. gold_states and pred_states are parallel lists of state dictionaries mapping slot names to values, and a slot that is missing from the prediction counts as incorrect.\n\nCount every slot in the union of gold and predicted slots for each turn, and return the fraction of slots whose value matches gold. Return 0.0 when there are no slots. Extra predicted slots are counted but never correct.",
    starterCode: `def dialogue_slot_accuracy(gold_states, pred_states):
    # Your code here
    pass`,
    solution: `def dialogue_slot_accuracy(gold_states, pred_states):
    total = 0
    correct = 0
    for i, gold in enumerate(gold_states):
        pred = pred_states[i] if i < len(pred_states) else {}
        slots = set(gold) | set(pred)
        for slot in slots:
            total += 1
            if slot in pred and slot in gold and pred[slot] == gold[slot]:
                correct += 1
    if total == 0:
        return 0.0
    return correct / total`,
    testCases: [
      { input: [[{"a": "1", "b": "2"}, {"a": "1"}], [{"a": "1", "b": "3"}, {"a": "1"}]], expected: 0.6666666666666666 },
      { input: [[{"a": "1"}], [{"a": "1", "c": "9"}]], expected: 0.5 },
      { input: [[], []], expected: 0.0 },
      { input: [[{"a": "1"}], []], expected: 0.0 },
      { input: [[{"a": "x", "b": "y"}], [{"a": "x", "b": "y"}]], expected: 1.0 },
    ],
    hint: "Use the union of gold and predicted slots per turn; a missing slot is a miss, an extra slot is not a hit.",
  },
];
