import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "info-136",
    title: "Entropy of Letter Counts",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Given a dictionary mapping letters to counts, normalize the counts into probabilities and return the Shannon entropy in bits:\n\nH = -sum(p * log2(p)),  p = count / total\n\nSkip zero counts and return 0.0 when the total count is zero.",
    starterCode: `import math
def letter_entropy(counts):
    # Your code here
    pass`,
    solution: `import math
def letter_entropy(counts):
    total = 0.0
    for c in counts.values():
        total += c
    if total <= 0:
        return 0.0
    h = 0.0
    for c in counts.values():
        if c > 0:
            p = c / total
            h -= p * math.log2(p)
    return h`,
    testCases: [
      { input: [{ a: 1, b: 1 }], expected: 1.0 },
      { input: [{ a: 3, b: 1 }], expected: 0.8112781244591328 },
      { input: [{ a: 1, b: 2, c: 3, d: 4 }], expected: 1.8464393446710154 },
      { input: [{ a: 10 }], expected: 0.0 },
      { input: [{ a: 0, b: 4 }], expected: 0.0 },
    ],
    hint: "The counts only matter through their ratios, so any normalization works.",
  },
  {
    id: "info-137",
    title: "Mutual Information of Adjacent Letters",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Given a 2D matrix of adjacent-letter counts, normalize it into a joint distribution and return the mutual information in bits:\n\nI = sum p(i, j) * log2(p(i, j) / (p(i) * p(j)))\n\nSkip cells with zero count.",
    starterCode: `import math
def adjacent_letter_mi(counts):
    # Your code here
    pass`,
    solution: `import math
def adjacent_letter_mi(counts):
    total = 0.0
    for row in counts:
        total += sum(row)
    n = len(counts)
    m = len(counts[0])
    px = [0.0] * n
    py = [0.0] * m
    for i in range(n):
        for j in range(m):
            v = counts[i][j] / total
            px[i] += v
            py[j] += v
    mi = 0.0
    for i in range(n):
        for j in range(m):
            p = counts[i][j] / total
            if p > 0:
                mi += p * math.log2(p / (px[i] * py[j]))
    return mi`,
    testCases: [
      { input: [[[1, 1], [1, 1]]], expected: 0.0 },
      { input: [[[4, 0], [0, 4]]], expected: 1.0 },
      { input: [[[1, 2], [3, 4]]], expected: 0.005802149014345649 },
      { input: [[[1, 0], [0, 1]]], expected: 1.0 },
    ],
    hint: "Perfectly correlated letters carry one bit; independent letters carry none.",
  },
  {
    id: "info-138",
    title: "Redundancy of Language",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the redundancy of a source as 1 - H / H_max, where H is its actual entropy in bits and H_max the entropy of a uniform source with the same alphabet. A redundancy of 0.75 means only a quarter of the capacity is used.",
    starterCode: `def language_redundancy(entropy_bits, max_entropy_bits):
    # Your code here
    pass`,
    solution: `def language_redundancy(entropy_bits, max_entropy_bits):
    return 1.0 - entropy_bits / max_entropy_bits`,
    testCases: [
      { input: [1.0, 4.0], expected: 0.75 },
      { input: [2.0, 2.0], expected: 0.0 },
      { input: [0.0, 4.0], expected: 1.0 },
      { input: [4.7, 4.7], expected: 0.0 },
    ],
    hint: "A uniform source has zero redundancy.",
  },
  {
    id: "info-139",
    title: "Unicity Distance Lite",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the unicity distance: the amount of ciphertext needed on average to pin down the key. With key entropy in bits and per-character redundancy D:\n\nU = key_bits / D\n\nAssume the redundancy is positive.",
    starterCode: `def unicity_distance(key_bits, redundancy_bits):
    # Your code here
    pass`,
    solution: `def unicity_distance(key_bits, redundancy_bits):
    return key_bits / redundancy_bits`,
    testCases: [
      { input: [40.0, 1.5], expected: 26.666666666666668 },
      { input: [20.0, 2.0], expected: 10.0 },
      { input: [0.0, 1.5], expected: 0.0 },
      { input: [64.0, 3.0], expected: 21.333333333333332 },
    ],
    hint: "Perfectly decodable ciphers have no redundancy and an infinite unicity distance.",
  },
  {
    id: "info-140",
    title: "Perfect Secrecy Check",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return True when the channel p(c|m), passed as pcm[m][c], equals the ciphertext prior pc for every message and ciphertext within a tolerance of 1e-9. That equality is exactly Shannon's condition for perfect secrecy.",
    starterCode: `def perfect_secrecy_holds(pcm, pc):
    # Your code here
    pass`,
    solution: `def perfect_secrecy_holds(pcm, pc):
    for row in pcm:
        for a, b in zip(row, pc):
            if abs(a - b) > 1e-9:
                return False
    return True`,
    testCases: [
      { input: [[[0.5, 0.5], [0.5, 0.5]], [0.5, 0.5]], expected: true },
      { input: [[[1.0, 0.0], [0.5, 0.5]], [0.5, 0.5]], expected: false },
      { input: [[[0.25, 0.75], [0.25, 0.75]], [0.25, 0.75]], expected: true },
      { input: [[[1.0, 0.0], [1.0, 0.0]], [1.0, 0.0]], expected: true },
    ],
    hint: "The ciphertext distribution must not depend on the message at all.",
  },
  {
    id: "info-141",
    title: "One-Time Pad XOR",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Encrypt (or decrypt) a bit list with a one-time pad by XORing it elementwise with a key of the same length. XOR is its own inverse, so the same function recovers the plaintext.",
    starterCode: `def otp_xor(bits, key):
    # Your code here
    pass`,
    solution: `def otp_xor(bits, key):
    return [a ^ b for a, b in zip(bits, key)]`,
    testCases: [
      { input: [[0, 1, 1], [1, 1, 0]], expected: [1, 0, 1] },
      { input: [[1, 1], [0, 0]], expected: [1, 1] },
      { input: [[0], [1]], expected: [1] },
      { input: [[1, 0, 0, 1], [1, 1, 1, 1]], expected: [0, 1, 1, 0] },
    ],
    hint: "A pad used twice is no longer a one-time pad.",
  },
  {
    id: "info-142",
    title: "Vigenere Encrypt",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Encrypt uppercase text with the Vigenere cipher: shift each letter by the corresponding key letter, repeating the key, with all arithmetic modulo 26. Return the uppercase ciphertext, which has the same length as the text.",
    starterCode: `def vigenere_encrypt(text, key):
    # Your code here
    pass`,
    solution: `def vigenere_encrypt(text, key):
    out = []
    for i in range(len(text)):
        x = ord(text[i]) - ord("A")
        k = ord(key[i % len(key)]) - ord("A")
        out.append(chr((x + k) % 26 + ord("A")))
    return "".join(out)`,
    testCases: [
      { input: ["HELLO", "KEY"], expected: "RIJVS" },
      { input: ["ABC", "AAA"], expected: "ABC" },
      { input: ["XYZ", "BCD"], expected: "YAC" },
      { input: ["ATTACKATDAWN", "LEMON"], expected: "LXFOPVEFRNHR" },
    ],
    hint: "A key of A leaves the text unchanged.",
  },
  {
    id: "info-143",
    title: "Index of Coincidence",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the index of coincidence of a text: the probability that two randomly chosen positions hold the same letter.\n\nIC = sum n_i * (n_i - 1) / (N * (N - 1))\n\nwhere n_i counts occurrences of each character. Return 0.0 when the text has fewer than two characters.",
    starterCode: `def index_of_coincidence(text):
    # Your code here
    pass`,
    solution: `def index_of_coincidence(text):
    counts = {}
    for ch in text:
        counts[ch] = counts.get(ch, 0) + 1
    n = len(text)
    if n < 2:
        return 0.0
    total = 0.0
    for c in counts.values():
        total += c * (c - 1)
    return total / (n * (n - 1))`,
    testCases: [
      { input: ["AAAA"], expected: 1.0 },
      { input: ["ABAB"], expected: 0.3333333333333333 },
      { input: ["ABCD"], expected: 0.0 },
      { input: ["AABBCC"], expected: 0.2 },
      { input: ["HELLO"], expected: 0.1 },
    ],
    hint: "English text has an IC near 0.066, while random text sits near 0.038.",
  },
  {
    id: "info-144",
    title: "Vigenere Best Key Length",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Estimate a Vigenere key length from a ciphertext. For each candidate length k, split the text into k columns with text[start::k], average the index of coincidence of the columns, and return the candidate with the largest average. Ties go to the smaller candidate. Assume candidates are positive and ascending.",
    starterCode: `def vigenere_best_key_length(text, candidates):
    # Your code here
    pass`,
    solution: `def vigenere_best_key_length(text, candidates):
    best = None
    best_ic = None
    for k in candidates:
        total = 0.0
        for start in range(k):
            total += index_of_coincidence(text[start::k])
        avg = total / k
        if best_ic is None or avg > best_ic + 1e-12:
            best_ic = avg
            best = k
    return best

def index_of_coincidence(text):
    counts = {}
    for ch in text:
        counts[ch] = counts.get(ch, 0) + 1
    n = len(text)
    if n < 2:
        return 0.0
    total = 0.0
    for c in counts.values():
        total += c * (c - 1)
    return total / (n * (n - 1))`,
    testCases: [
      { input: ["ATTACKATDAWNATTACKATDAWN", [1, 2, 3, 4, 5]], expected: 3 },
      { input: ["ABCABCABCABCABCABC", [1, 2, 3, 4]], expected: 3 },
      { input: ["AABAABAABAAB", [1, 2, 3, 4]], expected: 3 },
    ],
    hint: "Correctly aligned columns mix text from a single Caesar shift, raising their IC.",
  },
  {
    id: "info-145",
    title: "Most Common Letter",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the most frequent letter in the text. Break ties alphabetically by choosing the earliest letter; assume the text is non-empty and contains only uppercase A-Z.",
    starterCode: `def most_common_letter(text):
    # Your code here
    pass`,
    solution: `def most_common_letter(text):
    counts = {}
    for ch in text:
        counts[ch] = counts.get(ch, 0) + 1
    best = None
    for ch in sorted(counts):
        if best is None or counts[ch] > counts[best]:
            best = ch
    return best`,
    testCases: [
      { input: ["HELLO"], expected: "L" },
      { input: ["AABB"], expected: "A" },
      { input: ["ZYXZ"], expected: "Z" },
      { input: ["ABCD"], expected: "A" },
    ],
    hint: "E is the most common letter in English, but only if your sample is long enough.",
  },
  {
    id: "info-146",
    title: "Caesar Best Shift",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Break a Caesar cipher with a frequency table. For each shift 0..25, decrypt every letter as (c - shift) mod 26 and score the result by summing the English frequencies of the plaintext letters. Return the shift with the highest score, breaking ties toward the smaller shift. freqs is a 26-entry list of letter frequencies.",
    starterCode: `def caesar_best_shift(ciphertext, freqs):
    # Your code here
    pass`,
    solution: `def caesar_best_shift(ciphertext, freqs):
    best_shift = 0
    best_score = None
    for s in range(26):
        score = 0.0
        for ch in ciphertext:
            x = (ord(ch) - ord("A") - s) % 26
            score += freqs[x]
        if best_score is None or score > best_score + 1e-12:
            best_score = score
            best_shift = s
    return best_shift`,
    testCases: [
      {
        input: [
          "WKHTXLFNEURZQIRAMXPSVRYHUWKHODCBGRJ",
          [
            8.167, 1.492, 2.782, 4.253, 12.702, 2.228, 2.015, 6.094, 6.966, 0.153, 0.772,
            4.025, 2.406, 6.749, 7.507, 1.929, 0.095, 5.987, 6.327, 9.056, 2.758, 0.978,
            2.36, 0.15, 1.974, 0.074,
          ],
        ],
        expected: 3,
      },
      {
        input: [
          "YMNXNXFXJHWJYRJXXFLJKTWYMJHTIJW",
          [
            8.167, 1.492, 2.782, 4.253, 12.702, 2.228, 2.015, 6.094, 6.966, 0.153, 0.772,
            4.025, 2.406, 6.749, 7.507, 1.929, 0.095, 5.987, 6.327, 9.056, 2.758, 0.978,
            2.36, 0.15, 1.974, 0.074,
          ],
        ],
        expected: 5,
      },
      {
        input: [
          "WLSJNIALUJBSCMZUMWCHUNCHAUHXZOH",
          [
            8.167, 1.492, 2.782, 4.253, 12.702, 2.228, 2.015, 6.094, 6.966, 0.153, 0.772,
            4.025, 2.406, 6.749, 7.507, 1.929, 0.095, 5.987, 6.327, 9.056, 2.758, 0.978,
            2.36, 0.15, 1.974, 0.074,
          ],
        ],
        expected: 20,
      },
      {
        input: [
          "GURBARGVZRCNQCEBIVQRFCRESRPGFRPERPL",
          [
            8.167, 1.492, 2.782, 4.253, 12.702, 2.228, 2.015, 6.094, 6.966, 0.153, 0.772,
            4.025, 2.406, 6.749, 7.507, 1.929, 0.095, 5.987, 6.327, 9.056, 2.758, 0.978,
            2.36, 0.15, 1.974, 0.074,
          ],
        ],
        expected: 13,
      },
    ],
    hint: "Longer ciphertexts make the frequency score much more reliable.",
  },
  {
    id: "info-147",
    title: "Substitution Cipher Score",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Score a substitution cipher key by summing the expected English frequencies of the decrypted letters. key is a 26-character string where key[i] is the plaintext letter for ciphertext letter i, and freqs is a 26-entry frequency table indexed by plaintext letter A=0.",
    starterCode: `def substitution_score(text, key, freqs):
    # Your code here
    pass`,
    solution: `def substitution_score(text, key, freqs):
    score = 0.0
    for ch in text:
        idx = ord(ch) - ord("A")
        plain = ord(key[idx]) - ord("A")
        score += freqs[plain]
    return score`,
    testCases: [
      {
        input: [
          "IFMMP",
          "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
          [
            8.167, 1.492, 2.782, 4.253, 12.702, 2.228, 2.015, 6.094, 6.966, 0.153, 0.772,
            4.025, 2.406, 6.749, 7.507, 1.929, 0.095, 5.987, 6.327, 9.056, 2.758, 0.978,
            2.36, 0.15, 1.974, 0.074,
          ],
        ],
        expected: 15.935000000000002,
      },
      {
        input: [
          "HELLO",
          "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
          [
            8.167, 1.492, 2.782, 4.253, 12.702, 2.228, 2.015, 6.094, 6.966, 0.153, 0.772,
            4.025, 2.406, 6.749, 7.507, 1.929, 0.095, 5.987, 6.327, 9.056, 2.758, 0.978,
            2.36, 0.15, 1.974, 0.074,
          ],
        ],
        expected: 34.352999999999994,
      },
      {
        input: [
          "ABC",
          "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
          [
            8.167, 1.492, 2.782, 4.253, 12.702, 2.228, 2.015, 6.094, 6.966, 0.153, 0.772,
            4.025, 2.406, 6.749, 7.507, 1.929, 0.095, 5.987, 6.327, 9.056, 2.758, 0.978,
            2.36, 0.15, 1.974, 0.074,
          ],
        ],
        expected: 12.440999999999999,
      },
    ],
    hint: "Better keys decrypt common letters like E into common English letters.",
  },
  {
    id: "info-148",
    title: "Inverse Permutation",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the inverse of a permutation given as a 0-indexed list: inv[perm[i]] = i. The inverse undoes a transposition cipher's column shuffling.",
    starterCode: `def inverse_permutation(perm):
    # Your code here
    pass`,
    solution: `def inverse_permutation(perm):
    inv = [0] * len(perm)
    for i in range(len(perm)):
        inv[perm[i]] = i
    return inv`,
    testCases: [
      { input: [[2, 0, 1]], expected: [1, 2, 0] },
      { input: [[0, 1, 2]], expected: [0, 1, 2] },
      { input: [[1, 0, 3, 2]], expected: [1, 0, 3, 2] },
      { input: [[3, 2, 1, 0]], expected: [3, 2, 1, 0] },
    ],
    hint: "Applying a permutation and then its inverse returns the identity.",
  },
  {
    id: "info-149",
    title: "Columnar Cipher Decrypt",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Decrypt a columnar transposition cipher. The plaintext was written row by row into `columns` columns, then the columns were read in the order given by order, where order[read_index] is the column read at that position. The ciphertext length is divisible by columns. Return the plaintext string.",
    starterCode: `def columnar_decrypt(ciphertext, columns, order):
    # Your code here
    pass`,
    solution: `def columnar_decrypt(ciphertext, columns, order):
    rows = len(ciphertext) // columns
    cols = [[] for _ in range(columns)]
    for read_idx in range(columns):
        col = order[read_idx]
        chunk = ciphertext[read_idx * rows:(read_idx + 1) * rows]
        cols[col] = list(chunk)
    out = []
    for r in range(rows):
        for c in range(columns):
            out.append(cols[c][r])
    return "".join(out)`,
    testCases: [
      { input: ["LRHWLLEOOD", 5, [2, 0, 3, 1, 4]], expected: "HELLOWORLD" },
      { input: ["TKAATNACDTAW", 4, [1, 3, 0, 2]], expected: "ATTACKATDAWN" },
      { input: ["CFADBE", 3, [2, 0, 1]], expected: "ABCDEF" },
    ],
    hint: "Split the ciphertext into chunks of one column height and place each chunk in the column it was read from.",
  },
  {
    id: "info-150",
    title: "Rail Fence Decrypt",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Decrypt a zigzag rail fence cipher. The plaintext was written down and up across `rails` rows and read row by row. Rebuild the zigzag position pattern, assign the ciphertext letters to positions in row order, and return the plaintext string.",
    starterCode: `def rail_fence_decrypt(ciphertext, rails):
    # Your code here
    pass`,
    solution: `def rail_fence_decrypt(ciphertext, rails):
    n = len(ciphertext)
    pattern = []
    r = 0
    direction = 1
    for _ in range(n):
        pattern.append(r)
        if rails > 1:
            if r == 0:
                direction = 1
            elif r == rails - 1:
                direction = -1
            r += direction
    order = sorted(range(n), key=lambda i: (pattern[i], i))
    chars = [""] * n
    for i in range(n):
        chars[order[i]] = ciphertext[i]
    return "".join(chars)`,
    testCases: [
      { input: ["WECRLTEERDSOEEFEAOCAIVDEN", 3], expected: "WEAREDISCOVEREDFLEEATONCE" },
      { input: ["HLOOLELWRD", 2], expected: "HELLOWORLD" },
      { input: ["AEBDFHCG", 3], expected: "ABCDEFGH" },
    ],
    hint: "With one rail the ciphertext is already the plaintext.",
  },
  {
    id: "info-151",
    title: "Affine Cipher Encrypt",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Encrypt uppercase text with an affine cipher: E(x) = (a * x + b) mod 26, where x is the letter index A=0. Return the uppercase ciphertext.",
    starterCode: `def affine_encrypt(text, a, b):
    # Your code here
    pass`,
    solution: `def affine_encrypt(text, a, b):
    out = []
    for ch in text:
        x = ord(ch) - ord("A")
        out.append(chr((a * x + b) % 26 + ord("A")))
    return "".join(out)`,
    testCases: [
      { input: ["ABC", 1, 1], expected: "BCD" },
      { input: ["HELLO", 1, 3], expected: "KHOOR" },
      { input: ["ABC", 5, 8], expected: "INS" },
      { input: ["XYZ", 1, 1], expected: "YZA" },
      { input: ["SECRET", 7, 3], expected: "ZFRSFG" },
    ],
    hint: "With a = 1 the affine cipher reduces to a Caesar shift.",
  },
  {
    id: "info-152",
    title: "Affine Key Valid",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return True when the affine multiplier a is invertible modulo 26, that is, when gcd(a, 26) = 1. Otherwise the cipher is not a bijection and cannot be decrypted uniquely.",
    starterCode: `import math
def affine_key_valid(a):
    # Your code here
    pass`,
    solution: `import math
def affine_key_valid(a):
    return math.gcd(a, 26) == 1`,
    testCases: [
      { input: [1], expected: true },
      { input: [3], expected: true },
      { input: [2], expected: false },
      { input: [13], expected: false },
      { input: [25], expected: true },
    ],
    hint: "The valid multipliers are coprime to 26, so even and 13-multiples fail.",
  },
  {
    id: "info-153",
    title: "Multiplicative Inverse mod 26",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the multiplicative inverse of a modulo 26, meaning the x in 1..25 with (a * x) % 26 == 1. Return -1 when no inverse exists.",
    starterCode: `def mod_inverse_26(a):
    # Your code here
    pass`,
    solution: `def mod_inverse_26(a):
    for x in range(1, 26):
        if (a * x) % 26 == 1:
            return x
    return -1`,
    testCases: [
      { input: [1], expected: 1 },
      { input: [3], expected: 9 },
      { input: [5], expected: 21 },
      { input: [2], expected: -1 },
      { input: [15], expected: 7 },
      { input: [11], expected: 19 },
    ],
    hint: "An inverse exists exactly when gcd(a, 26) = 1.",
  },
  {
    id: "info-154",
    title: "Hill Cipher 2x2 Encrypt",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Encrypt uppercase text with a 2x2 Hill cipher. Process the text in pairs; for each pair [x0, x1], the ciphertext pair is\n\nc0 = (k00 * x0 + k01 * x1) mod 26\nc1 = (k10 * x0 + k11 * x1) mod 26\n\nReturn the uppercase ciphertext. Assume the text length is even.",
    starterCode: `def hill_encrypt2(text, key):
    # Your code here
    pass`,
    solution: `def hill_encrypt2(text, key):
    out = []
    for i in range(0, len(text), 2):
        x0 = ord(text[i]) - ord("A")
        x1 = ord(text[i + 1]) - ord("A")
        c0 = (key[0][0] * x0 + key[0][1] * x1) % 26
        c1 = (key[1][0] * x0 + key[1][1] * x1) % 26
        out.append(chr(c0 + ord("A")))
        out.append(chr(c1 + ord("A")))
    return "".join(out)`,
    testCases: [
      { input: ["HELP", [[3, 3], [2, 5]]], expected: "HIAT" },
      { input: ["ABCD", [[1, 2], [3, 4]]], expected: "CEIS" },
      { input: ["SECRET", [[2, 3], [1, 5]]], expected: "WMDJNV" },
      { input: ["ZZZZ", [[3, 3], [2, 5]]], expected: "UTUT" },
    ],
    hint: "All matrix products are taken modulo 26, letter by letter.",
  },
  {
    id: "info-155",
    title: "Playfair Prepare Pair",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Apply the Playfair digraph preparation rules to two letters: convert J to I, and when the two letters are equal replace the second with X. Return the resulting two-character string.",
    starterCode: `def playfair_prepare_pair(a, b):
    # Your code here
    pass`,
    solution: `def playfair_prepare_pair(a, b):
    if a == "J":
        a = "I"
    if b == "J":
        b = "I"
    if a == b:
        b = "X"
    return a + b`,
    testCases: [
      { input: ["A", "A"], expected: "AX" },
      { input: ["A", "B"], expected: "AB" },
      { input: ["J", "J"], expected: "IX" },
      { input: ["J", "I"], expected: "IX" },
      { input: ["X", "X"], expected: "XX" },
    ],
    hint: "Duplicate letters must be split before Playfair encryption.",
  },
  {
    id: "info-156",
    title: "XOR Repeat Key",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Encrypt (or decrypt) a list of byte values with a repeating XOR key: out[i] = data[i] ^ key[i % len(key)]. Return the resulting byte list.",
    starterCode: `def xor_repeat_key(data, key):
    # Your code here
    pass`,
    solution: `def xor_repeat_key(data, key):
    out = []
    for i in range(len(data)):
        out.append(data[i] ^ key[i % len(key)])
    return out`,
    testCases: [
      { input: [[1, 2, 3], [1]], expected: [0, 3, 2] },
      { input: [[1, 2, 3], [1, 2]], expected: [0, 0, 2] },
      { input: [[0, 0, 0], [5]], expected: [5, 5, 5] },
      { input: [[255, 0], [15, 240]], expected: [240, 240] },
    ],
    hint: "Repeating-key XOR is symmetric, so the same call decrypts.",
  },
  {
    id: "info-157",
    title: "Detect Repeating Key Length",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Estimate the length of a repeating XOR key. For each candidate k from 1 to max_len, compute the average Hamming distance in bits between data[i] and data[i + k] over all overlapping positions (normalized by the number of pairs), and return the k with the smallest average. Ties go to the smaller k.",
    starterCode: `def detect_key_length(data, max_len):
    # Your code here
    pass`,
    solution: `def detect_key_length(data, max_len):
    best_k = 1
    best_dist = None
    for k in range(1, max_len + 1):
        n = len(data) - k
        total = 0
        for i in range(n):
            total += bin(data[i] ^ data[i + k]).count("1")
        dist = total / n
        if best_dist is None or dist < best_dist - 1e-12:
            best_dist = dist
            best_k = k
    return best_k`,
    testCases: [
      { input: [[1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4], 6], expected: 4 },
      { input: [[7, 1, 5, 7, 1, 5, 7, 1, 5, 7, 1, 5], 5], expected: 3 },
      { input: [[9, 9, 9, 9, 9, 9, 9, 9], 4], expected: 1 },
      { input: [[1, 2, 1, 2, 1, 2, 1, 2], 3], expected: 2 },
    ],
    hint: "At the true key length, aligned bytes come from the same key byte and agree more often.",
  },
  {
    id: "info-158",
    title: "Hamming Distance of Blocks",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the Hamming distance in bits between two equal-length byte lists: sum over positions of the number of differing bits in a[i] XOR b[i].",
    starterCode: `def hamming_distance_bytes(a, b):
    # Your code here
    pass`,
    solution: `def hamming_distance_bytes(a, b):
    total = 0
    for x, y in zip(a, b):
        total += bin(x ^ y).count("1")
    return total`,
    testCases: [
      { input: [[0, 0], [0, 0]], expected: 0 },
      { input: [[255, 0], [0, 255]], expected: 16 },
      { input: [[1, 2], [3, 4]], expected: 3 },
      { input: [[170], [85]], expected: 8 },
    ],
    hint: "XOR isolates the differing bits; popcount then counts them.",
  },
  {
    id: "info-159",
    title: "ECB Pattern Detect",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return True when any block appears more than once in the list of blocks, which is the classic signature of ECB mode leaking repeated plaintext. Each block is a list of byte values.",
    starterCode: `def ecb_detect(blocks):
    # Your code here
    pass`,
    solution: `def ecb_detect(blocks):
    seen = set()
    for b in blocks:
        key = tuple(b)
        if key in seen:
            return True
        seen.add(key)
    return False`,
    testCases: [
      { input: [[[1, 2], [3, 4], [1, 2]]], expected: true },
      { input: [[[1, 2], [3, 4], [5, 6]]], expected: false },
      { input: [[]], expected: false },
      { input: [[[7, 7], [7, 7]]], expected: true },
    ],
    hint: "Repeated ciphertext blocks mean repeated plaintext blocks under ECB.",
  },
  {
    id: "info-160",
    title: "CBC XOR Chain Step",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Perform the CBC chaining XOR: combine a plaintext (or decrypted) block with the previous ciphertext block elementwise using XOR. For the first block the previous value is the initialization vector.",
    starterCode: `def cbc_chain_xor(block, prev):
    # Your code here
    pass`,
    solution: `def cbc_chain_xor(block, prev):
    return [a ^ b for a, b in zip(block, prev)]`,
    testCases: [
      { input: [[1, 2], [3, 4]], expected: [2, 6] },
      { input: [[0, 0, 0], [255, 255, 255]], expected: [255, 255, 255] },
      { input: [[5], [5]], expected: [0] },
      { input: [[1, 2, 3, 4], [4, 3, 2, 1]], expected: [5, 1, 1, 5] },
    ],
    hint: "Decryption applies the same XOR after the block cipher step.",
  },
  {
    id: "info-161",
    title: "CTR Counter Block",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Build a 16-byte counter block for CTR mode: an 8-byte nonce followed by the counter encoded as 8 bytes big-endian. nonce is a list of 8 byte values and counter is a nonnegative integer.",
    starterCode: `def ctr_counter_block(nonce, counter):
    # Your code here
    pass`,
    solution: `def ctr_counter_block(nonce, counter):
    block = list(nonce)
    for shift in range(7, -1, -1):
        block.append((counter >> (8 * shift)) & 255)
    return block`,
    testCases: [
      {
        input: [[0, 0, 0, 0, 0, 0, 0, 0], 1],
        expected: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      },
      {
        input: [[1, 2, 3, 4, 5, 6, 7, 8], 256],
        expected: [1, 2, 3, 4, 5, 6, 7, 8, 0, 0, 0, 0, 0, 0, 1, 0],
      },
      {
        input: [[0, 0, 0, 0, 0, 0, 0, 0], 65536],
        expected: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
      },
      {
        input: [[9, 9, 9, 9, 9, 9, 9, 9], 0],
        expected: [9, 9, 9, 9, 9, 9, 9, 9, 0, 0, 0, 0, 0, 0, 0, 0],
      },
    ],
    hint: "Big-endian means the most significant byte comes right after the nonce.",
  },
  {
    id: "info-162",
    title: "Nonce Reuse Count",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Given a list of nonces, return how many distinct nonce values were used more than once. Even a single reuse breaks stream cipher confidentiality.",
    starterCode: `def nonce_reuse_count(nonces):
    # Your code here
    pass`,
    solution: `def nonce_reuse_count(nonces):
    counts = {}
    for n in nonces:
        counts[n] = counts.get(n, 0) + 1
    reused = 0
    for c in counts.values():
        if c > 1:
            reused += 1
    return reused`,
    testCases: [
      { input: [[1, 2, 3]], expected: 0 },
      { input: [[1, 1, 2]], expected: 1 },
      { input: [[1, 1, 2, 2, 3]], expected: 2 },
      { input: [[5, 5, 5, 5]], expected: 1 },
    ],
    hint: "The count is over distinct values, not over extra occurrences.",
  },
  {
    id: "info-163",
    title: "Birthday Bound",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Return the number of random hashes needed for a roughly 50 percent chance of a collision when hashes have the given number of bits:\n\nn ~ ceil(sqrt(2 * ln(2) * 2^bits))\n\nThis is the birthday bound that sets the security level of hash functions against collisions.",
    starterCode: `import math
def birthday_bound(bits):
    # Your code here
    pass`,
    solution: `import math
def birthday_bound(bits):
    return math.ceil(math.sqrt(2.0 * math.log(2.0) * (2.0 ** bits)))`,
    testCases: [
      { input: [8], expected: 19 },
      { input: [16], expected: 302 },
      { input: [32], expected: 77163 },
      { input: [64], expected: 5056937541 },
    ],
    hint: "Collision resistance is only about half the hash length in bits.",
  },
  {
    id: "info-164",
    title: "Preimage Trials",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the number of random guesses needed to find a preimage of a hash with the given number of bits with probability at least `probability`:\n\nn = ceil(ln(1 - p) / ln(1 - 1 / 2^bits))\n\nIf probability >= 1, return 2^bits as an integer.",
    starterCode: `import math
def preimage_trials(bits, probability):
    # Your code here
    pass`,
    solution: `import math
def preimage_trials(bits, probability):
    n = 2.0 ** bits
    if probability >= 1.0:
        return int(n)
    return math.ceil(math.log(1.0 - probability) / math.log(1.0 - 1.0 / n))`,
    testCases: [
      { input: [8, 0.5], expected: 178 },
      { input: [16, 0.5], expected: 45426 },
      { input: [4, 0.5], expected: 11 },
      { input: [8, 0.99], expected: 1177 },
    ],
    hint: "For a 50 percent chance you need about 0.69 * 2^bits guesses.",
  },
  {
    id: "info-165",
    title: "Merkle Root",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Compute the Merkle root of four integer leaves using the pairing hash h(a, b) = (a * 1000003 + b) mod 2^32. The root is h(h(l0, l1), h(l2, l3)). Return the integer root.",
    starterCode: `def merkle_root(leaves):
    # Your code here
    pass`,
    solution: `def merkle_root(leaves):
    def h(a, b):
        return (a * 1000003 + b) % 4294967296
    left = h(leaves[0], leaves[1])
    right = h(leaves[2], leaves[3])
    return h(left, right)`,
    testCases: [
      { input: [[1, 2, 3, 4]], expected: 3578587356 },
      { input: [[0, 0, 0, 0]], expected: 0 },
      { input: [[1, 1, 1, 1]], expected: 3575587344 },
      { input: [[10, 20, 30, 40]], expected: 1426135192 },
    ],
    hint: "Changing any leaf changes every hash on its path to the root.",
  },
  {
    id: "info-166",
    title: "Merkle Proof Path",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the sibling hashes needed to verify leaf `index` of a four-leaf Merkle tree, using the pairing hash h(a, b) = (a * 1000003 + b) mod 2^32. The list has two entries: the sibling leaf and the sibling subtree hash, from the leaf level upward.",
    starterCode: `def merkle_proof(leaves, index):
    # Your code here
    pass`,
    solution: `def merkle_proof(leaves, index):
    def h(a, b):
        return (a * 1000003 + b) % 4294967296
    left = h(leaves[0], leaves[1])
    right = h(leaves[2], leaves[3])
    if index == 0:
        return [leaves[1], right]
    if index == 1:
        return [leaves[0], right]
    if index == 2:
        return [left, leaves[3]]
    return [left, leaves[2]]`,
    testCases: [
      { input: [[1, 2, 3, 4], 0], expected: [2, 3000013] },
      { input: [[1, 2, 3, 4], 1], expected: [1, 3000013] },
      { input: [[1, 2, 3, 4], 2], expected: [1000005, 4] },
      { input: [[1, 2, 3, 4], 3], expected: [1000005, 3] },
    ],
    hint: "A proof needs one hash per level of the tree.",
  },
  {
    id: "info-167",
    title: "Hash Chain Steps",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Apply the linear congruential hash h(x) = (x * 1103515245 + 12345) mod 2^31 exactly `steps` times to the starting value and return the result. Hash chains like this underpin one-time passwords.",
    starterCode: `def hash_chain(start, steps):
    # Your code here
    pass`,
    solution: `def hash_chain(start, steps):
    x = start
    for _ in range(steps):
        x = (x * 1103515245 + 12345) % 2147483648
    return x`,
    testCases: [
      { input: [0, 1], expected: 12345 },
      { input: [1, 0], expected: 1 },
      { input: [1, 1], expected: 1103527590 },
      { input: [0, 2], expected: 1406932606 },
      { input: [12345, 3], expected: 1449466924 },
    ],
    hint: "Zero steps returns the starting value unchanged.",
  },
  {
    id: "info-168",
    title: "Commitment Opening Check",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Check whether a commitment opens correctly. The commitment scheme is h(value, nonce) = (value * 7919 + nonce) mod 1000003. Return True when the recomputed hash equals the supplied commitment.",
    starterCode: `def commitment_opens(value, nonce, commitment):
    # Your code here
    pass`,
    solution: `def commitment_opens(value, nonce, commitment):
    return (value * 7919 + nonce) % 1000003 == commitment`,
    testCases: [
      { input: [42, 123, 332721], expected: true },
      { input: [42, 123, 332722], expected: false },
      { input: [0, 0, 0], expected: true },
      { input: [5, 10, 1], expected: false },
    ],
    hint: "Binding commitments make it infeasible to open with a different value.",
  },
  {
    id: "info-169",
    title: "XOR Secret Shares",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Split an integer secret into three XOR shares: pick two random-looking shares r1 and r2, and set the third to secret ^ r1 ^ r2. Return [r1, r2, r1 ^ r2 ^ secret]. Any single share alone reveals nothing about the secret.",
    starterCode: `def xor_secret_shares(secret, r1, r2):
    # Your code here
    pass`,
    solution: `def xor_secret_shares(secret, r1, r2):
    return [r1, r2, secret ^ r1 ^ r2]`,
    testCases: [
      { input: [5, 3, 6], expected: [3, 6, 0] },
      { input: [42, 1, 2], expected: [1, 2, 41] },
      { input: [0, 0, 0], expected: [0, 0, 0] },
      { input: [255, 170, 85], expected: [170, 85, 0] },
    ],
    hint: "XORing all three shares recovers the secret.",
  },
  {
    id: "info-170",
    title: "Shamir 2-of-2 Recover",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Recover the secret from two points of a linear Shamir sharing scheme modulo the prime p. Using Lagrange interpolation evaluated at 0:\n\nsecret = (y1 * x2 - y2 * x1) * inverse(x2 - x1) mod p\n\nReturn the recovered secret. Implement the modular inverse by searching 1..p-1 so no library calls are needed.",
    starterCode: `def shamir_recover_2(p, x1, y1, x2, y2):
    # Your code here
    pass`,
    solution: `def shamir_recover_2(p, x1, y1, x2, y2):
    num = (y1 * x2 - y2 * x1) % p
    den = (x2 - x1) % p
    inv = 1
    for k in range(1, p):
        if (den * k) % p == 1:
            inv = k
            break
    return (num * inv) % p`,
    testCases: [
      { input: [101, 1, 42, 2, 47], expected: 37 },
      { input: [17, 1, 10, 3, 16], expected: 7 },
      { input: [97, 2, 40, 5, 55], expected: 30 },
      { input: [13, 1, 0, 2, 4], expected: 9 },
    ],
    hint: "The secret is the value of the degree-1 polynomial at x = 0.",
  },
  {
    id: "info-171",
    title: "Password Entropy",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the entropy in bits of a uniformly random password drawn from a charset of the given size with the given length:\n\nH = length * log2(charset_size)",
    starterCode: `import math
def password_entropy(charset_size, length):
    # Your code here
    pass`,
    solution: `import math
def password_entropy(charset_size, length):
    return length * math.log2(charset_size)`,
    testCases: [
      { input: [26, 8], expected: 37.603517745128734 },
      { input: [10, 4], expected: 13.287712379549449 },
      { input: [2, 1], expected: 1.0 },
      { input: [95, 8], expected: 52.55884486664758 },
    ],
    hint: "Each character adds log2(charset_size) bits of entropy.",
  },
  {
    id: "info-172",
    title: "Brute Force Time Estimate",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Estimate the average number of seconds to brute force a keyspace when a guesser can try `rate` keys per second. On average half the keyspace is searched:\n\ntime = keyspace / (2 * rate)",
    starterCode: `def brute_force_seconds(keyspace, rate):
    # Your code here
    pass`,
    solution: `def brute_force_seconds(keyspace, rate):
    return keyspace / (2.0 * rate)`,
    testCases: [
      { input: [1000000, 1000], expected: 500.0 },
      { input: [100, 1], expected: 50.0 },
      { input: [4294967296, 1000000], expected: 2147.483648 },
      { input: [0, 10], expected: 0.0 },
    ],
    hint: "The factor of two is the expected position of the key in the search order.",
  },
  {
    id: "info-173",
    title: "Key Space Bits",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the size of a keyspace in bits: log2(number_of_keys). This is the security level of a uniformly random key from that space.",
    starterCode: `import math
def keyspace_bits(keyspace):
    # Your code here
    pass`,
    solution: `import math
def keyspace_bits(keyspace):
    return math.log2(keyspace)`,
    testCases: [
      { input: [256], expected: 8.0 },
      { input: [1024], expected: 10.0 },
      { input: [1], expected: 0.0 },
      { input: [208827064576], expected: 37.603517745128734 },
    ],
    hint: "A one-key space has zero bits of security.",
  },
  {
    id: "info-174",
    title: "Side-Channel Leak Bits",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Model a side channel that leaks the given fraction of a secret's bits: return total_bits * leaked_fraction, the number of bits exposed to the attacker.",
    starterCode: `def leaked_bits(total_bits, leaked_fraction):
    # Your code here
    pass`,
    solution: `def leaked_bits(total_bits, leaked_fraction):
    return total_bits * leaked_fraction`,
    testCases: [
      { input: [128, 0.25], expected: 32.0 },
      { input: [256, 0.5], expected: 128.0 },
      { input: [100, 0.0], expected: 0.0 },
      { input: [64, 1.0], expected: 64.0 },
    ],
    hint: "Leaking the whole key leaves zero effective security.",
  },
  {
    id: "info-175",
    title: "Differential Privacy Epsilon",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the privacy parameter epsilon of the Laplace mechanism given the query sensitivity and the Laplace noise scale:\n\nepsilon = sensitivity / scale",
    starterCode: `def laplace_epsilon(sensitivity, scale):
    # Your code here
    pass`,
    solution: `def laplace_epsilon(sensitivity, scale):
    return sensitivity / scale`,
    testCases: [
      { input: [1.0, 2.0], expected: 0.5 },
      { input: [2.0, 1.0], expected: 2.0 },
      { input: [5.0, 10.0], expected: 0.5 },
      { input: [1.0, 0.5], expected: 2.0 },
    ],
    hint: "Larger noise means smaller epsilon and stronger privacy.",
  },
  {
    id: "info-176",
    title: "Laplace Noise Scale",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the Laplace noise scale needed to achieve epsilon-differential privacy for a query with the given sensitivity:\n\nscale = sensitivity / epsilon",
    starterCode: `def laplace_scale(sensitivity, epsilon):
    # Your code here
    pass`,
    solution: `def laplace_scale(sensitivity, epsilon):
    return sensitivity / epsilon`,
    testCases: [
      { input: [1.0, 1.0], expected: 1.0 },
      { input: [2.0, 0.5], expected: 4.0 },
      { input: [5.0, 10.0], expected: 0.5 },
      { input: [1.0, 2.0], expected: 0.5 },
    ],
    hint: "This inverts epsilon = sensitivity / scale.",
  },
  {
    id: "info-177",
    title: "Gaussian Mechanism Sigma",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Return the noise standard deviation for the Gaussian mechanism that satisfies (epsilon, delta)-differential privacy:\n\nsigma = sqrt(2 * ln(1.25 / delta)) * sensitivity / epsilon\n\nAssume delta is small and positive.",
    starterCode: `import math
def gaussian_sigma(sensitivity, epsilon, delta):
    # Your code here
    pass`,
    solution: `import math
def gaussian_sigma(sensitivity, epsilon, delta):
    return math.sqrt(2.0 * math.log(1.25 / delta)) * sensitivity / epsilon`,
    testCases: [
      { input: [1.0, 1.0, 0.00001], expected: 4.844805262605389 },
      { input: [1.0, 0.1, 0.00001], expected: 48.44805262605389 },
      { input: [2.0, 0.5, 0.000001], expected: 21.195210107401895 },
      { input: [1.0, 1.0, 0.1], expected: 2.247544724497493 },
    ],
    hint: "A smaller delta demands more noise.",
  },
  {
    id: "info-178",
    title: "Privacy Budget Composition",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Under basic sequential composition, the total privacy budget of several epsilon-DP releases is their sum. Return the sum of the epsilon values; an empty list costs nothing.",
    starterCode: `def privacy_budget_sum(epsilons):
    # Your code here
    pass`,
    solution: `def privacy_budget_sum(epsilons):
    return sum(epsilons)`,
    testCases: [
      { input: [[0.1, 0.2, 0.3]], expected: 0.6 },
      { input: [[1.0]], expected: 1.0 },
      { input: [[0.25, 0.25, 0.25, 0.25]], expected: 1.0 },
      { input: [[]], expected: 0 },
    ],
    hint: "Advanced composition can do better than the naive sum for many queries.",
  },
  {
    id: "info-179",
    title: "k-Anonymity Check",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return True when every distinct combination of quasi-identifiers in the records appears at least k times. Each record is a list of quasi-identifier values; a dataset with a unique row violates 2-anonymity.",
    starterCode: `def k_anonymity_holds(records, k):
    # Your code here
    pass`,
    solution: `def k_anonymity_holds(records, k):
    counts = {}
    for rec in records:
        key = tuple(rec)
        counts[key] = counts.get(key, 0) + 1
    for c in counts.values():
        if c < k:
            return False
    return True`,
    testCases: [
      { input: [[["A", 1], ["A", 1], ["B", 2]], 2], expected: false },
      { input: [[["A", 1], ["A", 1], ["B", 2], ["B", 2]], 2], expected: true },
      { input: [[["A", 1]], 1], expected: true },
      { input: [[["A", 1], ["A", 1]], 3], expected: false },
    ],
    hint: "Group records by their quasi-identifier tuple and check the smallest group.",
  },
  {
    id: "info-180",
    title: "t-Closeness Check",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Return True when a group's sensitive-attribute distribution is within total variation distance t of the global distribution:\n\nTV = 0.5 * sum(|group_i - global_i|) <= t\n\nUse a tolerance of 1e-12 so exact boundary cases still pass.",
    starterCode: `def t_closeness_holds(group_dist, global_dist, t):
    # Your code here
    pass`,
    solution: `def t_closeness_holds(group_dist, global_dist, t):
    tv = 0.0
    for a, b in zip(group_dist, global_dist):
        tv += abs(a - b)
    return 0.5 * tv <= t + 1e-12`,
    testCases: [
      { input: [[0.5, 0.5], [0.5, 0.5], 0.0], expected: true },
      { input: [[1.0, 0.0], [0.5, 0.5], 0.5], expected: true },
      { input: [[1.0, 0.0], [0.5, 0.5], 0.4], expected: false },
      { input: [[0.25, 0.75], [0.5, 0.5], 0.3], expected: true },
    ],
    hint: "t = 0 forces every group to match the global distribution exactly.",
  },
];
