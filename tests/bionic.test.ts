import { describe, expect, test } from "bun:test";
import {
  bionicBoldLength,
  splitBionic,
  type BionicSegment,
} from "@/lib/bionic";

function joined(segments: BionicSegment[]): string {
  return segments.map((segment) => segment.text).join("");
}

function boldText(text: string): string {
  return splitBionic(text)
    .filter((segment) => segment.bold)
    .map((segment) => segment.text)
    .join("");
}

const REASSEMBLY_FIXTURES = [
  "",
  " ",
  "\t\n  ",
  "Hello, world!",
  "DeepForge checks 3,730 cases.\nSecond line!",
  "state-of-the-art API",
  "don't / can't",
  "\u03C0 \u2248 3.14159, \u0394 = 0.5",
  "na\u00EFve caf\u00E9 \u2014 d\u00E9j\u00E0 vu",
  "\u0395\u03BB\u03BB\u03B7\u03BD\u03B9\u03BA\u03AC \u0420\u0443\u0301\u0441\u0441\u043A\u0438\u0439 \u6F22\u5B57\u30C6\u30B9\u30C8",
  "3.14e-10 + 1_000 = 1000",
  "(){}[]<>@#$%^&*",
  "emoji \uD83D\uDE42 in text",
  "line1\r\nline2",
  "  double  spaces   ",
] as const;

describe("splitBionic: reassembly", () => {
  test("empty string yields no segments", () => {
    expect(splitBionic("")).toEqual([]);
  });

  test("whitespace-only string is one non-bold segment", () => {
    expect(splitBionic(" \t\n ")).toEqual([{ text: " \t\n ", bold: false }]);
  });

  test("punctuation-only string is one non-bold segment", () => {
    expect(splitBionic("...,;:!?")).toEqual([{ text: "...,;:!?", bold: false }]);
  });

  test("joining segments reproduces every fixture byte for byte", () => {
    for (const fixture of REASSEMBLY_FIXTURES) {
      expect(joined(splitBionic(fixture)), JSON.stringify(fixture)).toBe(fixture);
    }
  });

  test("no segments are empty for any fixture", () => {
    for (const fixture of REASSEMBLY_FIXTURES) {
      for (const segment of splitBionic(fixture)) {
        expect(segment.text.length, JSON.stringify(fixture)).toBeGreaterThan(0);
      }
    }
  });
});

describe("splitBionic: bold-length rule", () => {
  test("words of 1 to 3 code points bold one character", () => {
    for (const word of ["a", "ab", "abc"]) {
      const expected: BionicSegment[] = [{ text: word.slice(0, 1), bold: true }];
      if (word.length > 1) expected.push({ text: word.slice(1), bold: false });
      expect(splitBionic(word)).toEqual(expected);
    }
  });

  test("words of 4 to 5 code points bold two characters", () => {
    for (const word of ["abcd", "abcde"]) {
      expect(splitBionic(word)).toEqual([
        { text: word.slice(0, 2), bold: true },
        { text: word.slice(2), bold: false },
      ]);
    }
  });

  test("words of 6 to 8 code points bold three characters", () => {
    for (const word of ["abcdef", "abcdefgh"]) {
      expect(splitBionic(word)).toEqual([
        { text: word.slice(0, 3), bold: true },
        { text: word.slice(3), bold: false },
      ]);
    }
  });

  test("words of 9+ code points bold four characters", () => {
    for (const word of ["abcdefghi", "abcdefghijklmnopqrstuvwxyz"]) {
      expect(splitBionic(word)).toEqual([
        { text: word.slice(0, 4), bold: true },
        { text: word.slice(4), bold: false },
      ]);
    }
  });

  test("bionicBoldLength encodes the fixed rule at its boundaries", () => {
    expect([0, 1, 2, 3].map(bionicBoldLength)).toEqual([1, 1, 1, 1]);
    expect([4, 5].map(bionicBoldLength)).toEqual([2, 2]);
    expect([6, 7, 8].map(bionicBoldLength)).toEqual([3, 3, 3]);
    expect([9, 10, 40, 120].map(bionicBoldLength)).toEqual([4, 4, 4, 4]);
  });

  test("the bold prefix is exactly min(rule, word length) for lengths 1..24", () => {
    for (let length = 1; length <= 24; length += 1) {
      const word = "m".repeat(length);
      const segments = splitBionic(word);
      expect(segments[0].bold).toBe(true);
      expect(segments[0].text.length).toBe(Math.min(bionicBoldLength(length), length));
      expect(joined(segments)).toBe(word);
    }
  });

  test("a 40-character word yields one bold segment of four characters", () => {
    const word = "q".repeat(40);
    const segments = splitBionic(word);
    expect(segments).toEqual([
      { text: "qqqq", bold: true },
      { text: "q".repeat(36), bold: false },
    ]);
  });

  test("bold segments never carry whitespace or punctuation", () => {
    for (const fixture of REASSEMBLY_FIXTURES) {
      for (const segment of splitBionic(fixture)) {
        if (!segment.bold) continue;
        expect(/^[\p{L}\p{N}]+$/u.test(segment.text), segment.text).toBe(true);
      }
    }
  });
});

describe("splitBionic: punctuation and separators", () => {
  test("punctuation stays un-bolded and in place", () => {
    const segments = splitBionic("Hello, world!");
    expect(segments).toEqual([
      { text: "He", bold: true },
      { text: "llo", bold: false },
      { text: ", ", bold: false },
      { text: "wo", bold: true },
      { text: "rld", bold: false },
      { text: "!", bold: false },
    ]);
  });

  test("multiple spaces and tabs survive between words", () => {
    expect(splitBionic("go  \tnow")).toEqual([
      { text: "g", bold: true },
      { text: "o", bold: false },
      { text: "  \t", bold: false },
      { text: "n", bold: true },
      { text: "ow", bold: false },
    ]);
  });

  test("newlines separate words and are preserved", () => {
    expect(splitBionic("one\ntwo")).toEqual([
      { text: "o", bold: true },
      { text: "ne", bold: false },
      { text: "\n", bold: false },
      { text: "t", bold: true },
      { text: "wo", bold: false },
    ]);
  });

  test("hyphens split compounds and stay intact", () => {
    expect(splitBionic("state-of-the-art")).toEqual([
      { text: "st", bold: true },
      { text: "ate", bold: false },
      { text: "-", bold: false },
      { text: "o", bold: true },
      { text: "f", bold: false },
      { text: "-", bold: false },
      { text: "t", bold: true },
      { text: "he", bold: false },
      { text: "-", bold: false },
      { text: "a", bold: true },
      { text: "rt", bold: false },
    ]);
  });

  test("apostrophes split words and are never bolded", () => {
    expect(splitBionic("don't")).toEqual([
      { text: "d", bold: true },
      { text: "on", bold: false },
      { text: "'", bold: false },
      { text: "t", bold: true },
    ]);
  });

  test("decimal points and signs are separators", () => {
    expect(splitBionic("3.14")).toEqual([
      { text: "3", bold: true },
      { text: ".", bold: false },
      { text: "1", bold: true },
      { text: "4", bold: false },
    ]);
    expect(joined(splitBionic("-1e-6"))).toBe("-1e-6");
  });

  test("brackets, quotes, and symbols pass through unchanged", () => {
    const text = 'A [(\u201Cquote\u201D)] {x} <y>';
    expect(joined(splitBionic(text))).toBe(text);
    expect(boldText(text)).toBe("Aquxy");
  });
});

describe("splitBionic: numbers", () => {
  test("a digits-only word bolds at most its first character", () => {
    expect(splitBionic("1234567890")).toEqual([
      { text: "1", bold: true },
      { text: "234567890", bold: false },
    ]);
  });

  test("digit strings of every length bold exactly one code point", () => {
    for (let length = 1; length <= 12; length += 1) {
      const digits = String(length).repeat(length);
      const bold = splitBionic(digits).filter((segment) => segment.bold);
      expect(bold.length).toBe(1);
      expect(bold[0].text.length).toBe(1);
    }
  });

  test("mixed letter/digit words follow the length rule", () => {
    expect(splitBionic("w8")).toEqual([
      { text: "w", bold: true },
      { text: "8", bold: false },
    ]);
    expect(splitBionic("abc123")).toEqual([
      { text: "abc", bold: true },
      { text: "123", bold: false },
    ]);
  });

  test("numbers embedded in text keep every digit", () => {
    const text = "2026-09-18 116,944";
    expect(joined(splitBionic(text))).toBe(text);
    expect(boldText(text)).toBe("20119");
  });
});

describe("splitBionic: unicode", () => {
  test("accented latin words follow the code-point length rule", () => {
    expect(splitBionic("caf\u00E9")).toEqual([
      { text: "ca", bold: true },
      { text: "f\u00E9", bold: false },
    ]);
  });

  test("greek and cyrillic words are segmented", () => {
    expect(splitBionic("\u03B1\u03B2\u03B3\u03B4\u03B5")).toEqual([
      { text: "\u03B1\u03B2", bold: true },
      { text: "\u03B3\u03B4\u03B5", bold: false },
    ]);
    const cyrillic = "\u043F\u0440\u0438\u0432\u0435\u0442";
    expect(joined(splitBionic(cyrillic))).toBe(cyrillic);
    expect(boldText(cyrillic)).toBe("\u043F\u0440\u0438");
  });

  test("CJK words are segmented by code point", () => {
    expect(splitBionic("\u6F22\u5B57")).toEqual([
      { text: "\u6F22", bold: true },
      { text: "\u5B57", bold: false },
    ]);
  });

  test("surrogate pairs stay whole and are preserved", () => {
    const text = "\uD83D\uDE42ab";
    const segments = splitBionic(text);
    expect(segments[0]).toEqual({ text: "\uD83D\uDE42", bold: false });
    expect(joined(segments)).toBe(text);
  });

  test("combining marks are preserved as separators", () => {
    const text = "e\u0301clair";
    const segments = splitBionic(text);
    expect(segments[0]).toEqual({ text: "e", bold: true });
    expect(segments[1]).toEqual({ text: "\u0301", bold: false });
    expect(joined(segments)).toBe(text);
  });
});

describe("splitBionic: determinism and purity", () => {
  test("a fixed fixture yields exactly the expected segments", () => {
    const text = "DeepForge checks 3,730 cases.\nSecond line!";
    expect(splitBionic(text)).toEqual([
      { text: "Deep", bold: true },
      { text: "Forge", bold: false },
      { text: " ", bold: false },
      { text: "che", bold: true },
      { text: "cks", bold: false },
      { text: " ", bold: false },
      { text: "3", bold: true },
      { text: ",", bold: false },
      { text: "7", bold: true },
      { text: "30", bold: false },
      { text: " ", bold: false },
      { text: "ca", bold: true },
      { text: "ses", bold: false },
      { text: ".\n", bold: false },
      { text: "Sec", bold: true },
      { text: "ond", bold: false },
      { text: " ", bold: false },
      { text: "li", bold: true },
      { text: "ne", bold: false },
      { text: "!", bold: false },
    ]);
  });

  test("repeated calls return deep-equal but independent arrays", () => {
    const text = "Deterministic output, 96/96 verified.";
    const first = splitBionic(text);
    const second = splitBionic(text);
    expect(first).toEqual(second);
    expect(first).not.toBe(second);
    first.pop();
    expect(splitBionic(text)).toEqual(second);
  });

  test("the input string is never mutated", () => {
    const input = "Hello, world!";
    const snapshot = input;
    splitBionic(input);
    expect(input).toBe(snapshot);
    expect(input).toBe("Hello, world!");
  });
});
