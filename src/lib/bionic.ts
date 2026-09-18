/**
 * Bionic-reading segmentation for the Inventions paper view.
 *
 * `splitBionic(text)` is a pure, deterministic function: it returns the input
 * split into ordered `{ text, bold }` segments. Concatenating every segment's
 * `text` in order reproduces the input byte for byte.
 *
 * A word is a maximal run of Unicode letters and digits (`[\p{L}\p{N}]+`);
 * every other character — whitespace, punctuation, hyphens, apostrophes,
 * brackets, underscores, combining marks, emoji — is a separator, is kept
 * verbatim, and is never bolded.
 *
 * Bold length rule, by word length in Unicode code points:
 *   - 1..3  -> bold the first 1 code point
 *   - 4..5  -> bold the first 2
 *   - 6..8  -> bold the first 3
 *   - 9+    -> bold the first 4
 * Digit-only words bold at most their first code point, whatever their
 * length; letter/digit mixed words follow the length rule.
 *
 * No clocks, randomness, network, DOM, or mutation. Identical input always
 * yields an identical, freshly built array.
 */

export interface BionicSegment {
  readonly text: string;
  readonly bold: boolean;
}

const WORD_PATTERN = /[\p{L}\p{N}]+/gu;
const HAS_LETTER = /\p{L}/u;
const DIGIT_ONLY_BOLD = 1;

/** Fixed leading-code-point count for a word of `length` code points. */
export function bionicBoldLength(length: number): number {
  if (length <= 3) return 1;
  if (length <= 5) return 2;
  if (length <= 8) return 3;
  return 4;
}

/** Split text into bold/plain segments without altering a single character. */
export function splitBionic(text: string): BionicSegment[] {
  if (text.length === 0) return [];

  const segments: BionicSegment[] = [];
  let cursor = 0;

  for (const match of text.matchAll(WORD_PATTERN)) {
    const start = match.index ?? 0;
    if (start > cursor) {
      segments.push({ text: text.slice(cursor, start), bold: false });
    }

    const word = match[0];
    const points = Array.from(word);
    const boldCount = HAS_LETTER.test(word)
      ? bionicBoldLength(points.length)
      : DIGIT_ONLY_BOLD;
    const split = Math.min(boldCount, points.length);

    segments.push({ text: points.slice(0, split).join(""), bold: true });
    if (split < points.length) {
      segments.push({ text: points.slice(split).join(""), bold: false });
    }

    cursor = start + word.length;
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), bold: false });
  }

  return segments;
}
