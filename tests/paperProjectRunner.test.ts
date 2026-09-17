import { describe, expect, test } from "bun:test";
import { parseExpectedOutput } from "@/components/papers/PaperProjectRunner";

describe("parseExpectedOutput", () => {
  test("returns null when there is no EXPECTED comment", () => {
    expect(parseExpectedOutput("print('hello')")).toBeNull();
    expect(parseExpectedOutput("")).toBeNull();
    expect(parseExpectedOutput("# a plain comment\ndef f():\n    pass")).toBeNull();
  });

  test("parses a single-line EXPECTED comment", () => {
    const code = "def main():\n    pass\n# EXPECTED: loss falls under 0.5\nmain()";
    expect(parseExpectedOutput(code)).toBe("loss falls under 0.5");
  });

  test("joins a multi-line EXPECTED block", () => {
    const code = [
      "def main():",
      "    pass",
      "# EXPECTED: the token exponent prints -0.5 until the TODO is",
      "# fitted to the true 0.28; the best split slides toward larger N",
      "# as C grows.",
      "",
      "main()",
    ].join("\n");
    expect(parseExpectedOutput(code)).toBe(
      "the token exponent prints -0.5 until the TODO is\n" +
        "fitted to the true 0.28; the best split slides toward larger N\n" +
        "as C grows.",
    );
  });

  test("stops at the first non-comment line", () => {
    const code = "# EXPECTED: only this line\nx = 1\n# trailing comment";
    expect(parseExpectedOutput(code)).toBe("only this line");
  });

  test("an EXPECTED marker with no text yields null", () => {
    expect(parseExpectedOutput("# EXPECTED:\nprint(1)")).toBeNull();
    expect(parseExpectedOutput("# EXPECTED:   ")).toBeNull();
  });

  test("accepts CRLF input and a missing space after the colon", () => {
    const code = "print(1)\r\n#EXPECTED: about 47.4 vs about 6.8\r\n";
    expect(parseExpectedOutput(code)).toBe("about 47.4 vs about 6.8");
  });
});
