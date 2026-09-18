import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ALIBI_HARNESS_VERSION,
  ALIBI_INPUT_MAX_CHARS,
  ALIBI_LINE_BUDGET,
  ALIBI_MARK,
  buildDuelHarness,
  describeOutcome,
  diffProgramLines,
  parseDuelStdout,
  pythonLiteral,
  validateAlibiInput,
  type AlibiDuelOutcome,
  type AlibiDuelVerdict,
} from "@/lib/alibiHunt";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MODULE_SOURCE = readFileSync(
  join(ROOT, "src", "lib", "alibiHunt.ts"),
  "utf8",
);

const ALL_VERDICTS: readonly AlibiDuelVerdict[] = [
  "diverges_value",
  "diverges_error",
  "diverges_timeout",
  "same",
  "input_invalid",
  "ref_error",
  "harness_error",
];

const ZEROS_REPR = `[${Array.from({ length: 150 }, () => "0").join(", ")}]`.slice(
  0,
  400,
);
const FLOAT_ZEROS_REPR = `[${Array.from({ length: 150 }, () => "0.0").join(", ")}]`.slice(
  0,
  400,
);

interface DuelPair {
  readonly name: string;
  readonly args: {
    readonly reference: string;
    readonly ghost: string;
    readonly func: string;
    readonly inputText: string;
    readonly budget?: number;
  };
  readonly fixture: AlibiDuelOutcome;
}

const DUEL_PAIRS: readonly DuelPair[] = [
  {
    name: "value divergence",
    args: {
      reference: "def total(xs, k):\n    return sum(xs[:k])\n",
      ghost: "def total(xs, k):\n    return sum(xs[:k + 1])\n",
      func: "total",
      inputText: "[1, 2, 3], 1",
    },
    fixture: { verdict: "diverges_value", ref: "1", ghost: "3" },
  },
  {
    name: "crash divergence",
    args: {
      reference: "def pick(xs, k):\n    return xs[k]\n",
      ghost: "def pick(xs, k):\n    return xs[k] // 0\n",
      func: "pick",
      inputText: "[[4, 5], 0]",
    },
    fixture: {
      verdict: "diverges_error",
      ref: "4",
      ghost: "ZeroDivisionError: integer division or modulo by zero",
    },
  },
  {
    name: "timeout divergence",
    args: {
      reference: "def spin(n):\n    return n\n",
      ghost: "def spin(n):\n    while True:\n        pass\n",
      func: "spin",
      inputText: "[7]",
      budget: 2000,
    },
    fixture: {
      verdict: "diverges_timeout",
      ref: "7",
      ghost: "line budget exceeded",
    },
  },
  {
    name: "identical behavior",
    args: {
      reference: "def total(xs, k):\n    return sum(xs[:k])\n",
      ghost: "def total(xs, k):\n    return sum(xs[:k])\n",
      func: "total",
      inputText: "[1, 2, 3], 2",
    },
    fixture: { verdict: "same", ref: "3", ghost: "3" },
  },
  {
    name: "malformed input",
    args: {
      reference: "def total(xs, k):\n    return sum(xs[:k])\n",
      ghost: "def total(xs, k):\n    return sum(xs[:k + 1])\n",
      func: "total",
      inputText: "[1, 2",
    },
    fixture: { verdict: "input_invalid", ref: null, ghost: null },
  },
  {
    name: "non-literal input",
    args: {
      reference: "def total(xs, k):\n    return sum(xs[:k])\n",
      ghost: "def total(xs, k):\n    return sum(xs[:k + 1])\n",
      func: "total",
      inputText: "__import__('os').getcwd()",
    },
    fixture: { verdict: "input_invalid", ref: null, ghost: null },
  },
  {
    name: "unicode input",
    args: {
      reference: "def shout(s):\n    return s.upper()\n",
      ghost: "def shout(s):\n    return s.lower()\n",
      func: "shout",
      inputText: "['h\u00e9llo \u4e16\u754c']",
    },
    fixture: {
      verdict: "diverges_value",
      ref: "'H\u00c9LLO \u4e16\u754c'",
      ghost: "'h\u00e9llo \u4e16\u754c'",
    },
  },
  {
    name: "empty tuple",
    args: {
      reference: "def count(xs):\n    return len(xs)\n",
      ghost: "def count(xs):\n    return len(xs) + 1\n",
      func: "count",
      inputText: "[()]",
    },
    fixture: { verdict: "diverges_value", ref: "0", ghost: "1" },
  },
  {
    name: "nested structures",
    args: {
      reference: "def total(pairs):\n    return sum(a + b for a, b in pairs)\n",
      ghost: "def total(pairs):\n    return sum(a - b for a, b in pairs)\n",
      func: "total",
      inputText: "[[[1, 2], [3, 4]]]",
    },
    fixture: { verdict: "diverges_value", ref: "10", ghost: "-2" },
  },
  {
    name: "NaN outputs",
    args: {
      reference: "def weird(x):\n    return x - x\n",
      ghost: "def weird(x):\n    return (x * 0.0) - (x * 0.0)\n",
      func: "weird",
      inputText: "[1e309]",
    },
    fixture: { verdict: "diverges_value", ref: "nan", ghost: "nan" },
  },
  {
    name: "large output",
    args: {
      reference: "def zeros(n):\n    return [0] * n\n",
      ghost: "def zeros(n):\n    return [0.0] * n\n",
      func: "zeros",
      inputText: "[150]",
    },
    fixture: {
      verdict: "same",
      ref: ZEROS_REPR,
      ghost: FLOAT_ZEROS_REPR,
    },
  },
];

function countOccurrences(haystack: string, needle: string): number {
  if (needle.length === 0) return 0;
  return haystack.split(needle).length - 1;
}

function captureThrow(fn: () => unknown): unknown {
  try {
    fn();
    return null;
  } catch (error) {
    return error;
  }
}

function markerLine(payload: unknown): string {
  return `${ALIBI_MARK}${JSON.stringify(payload)}`;
}

describe("alibi constants", () => {
  test("are the pinned values from the blueprint", () => {
    expect(ALIBI_HARNESS_VERSION).toBe(1);
    expect(ALIBI_INPUT_MAX_CHARS).toBe(2000);
    expect(ALIBI_LINE_BUDGET).toBe(400_000);
    expect(ALIBI_MARK).toBe("__DF_DUEL__");
  });
});

describe("buildDuelHarness", () => {
  test("is byte-identical for identical arguments, unicode included", () => {
    const args = {
      reference: "def f(x):\n    return x\n",
      ghost: "def f(x):\n    return x + 1\n",
      func: "f",
      inputText: "['\u00e9\u4e16', 1]",
    };
    expect(buildDuelHarness(args)).toBe(buildDuelHarness(args));
  });

  test("embeds the default line budget", () => {
    const harness = buildDuelHarness({
      reference: "def f():\n    return 1\n",
      ghost: "def f():\n    return 2\n",
      func: "f",
      inputText: "()",
    });
    expect(harness).toContain(`_ALIBI_BUDGET = ${ALIBI_LINE_BUDGET}`);
  });

  test("embeds a custom line budget in place of the default", () => {
    const harness = buildDuelHarness({
      reference: "def f():\n    return 1\n",
      ghost: "def f():\n    return 2\n",
      func: "f",
      inputText: "()",
      budget: 1234,
    });
    expect(harness).toContain("_ALIBI_BUDGET = 1234");
    expect(harness).not.toContain(`_ALIBI_BUDGET = ${ALIBI_LINE_BUDGET}`);
  });

  test("contains the required Python machinery", () => {
    const harness = buildDuelHarness({
      reference: "def f():\n    return 1\n",
      ghost: "def f():\n    return 2\n",
      func: "f",
      inputText: "()",
    });
    expect(harness).toContain(`alibiHunt v${ALIBI_HARNESS_VERSION}`);
    expect(harness).toContain("import ast, contextlib, io, json, math, sys");
    expect(harness).toContain("ast.literal_eval(_ALIBI_INPUT)");
    expect(harness).toContain("sys.settrace(");
    expect(harness).toContain("class _AlibiBudget(BaseException):");
    expect(harness).toContain("math.isclose(float(a), float(b), rel_tol=tol, abs_tol=tol)");
    expect(harness).toContain("json.dumps(");
    expect(harness).toContain('"<alibi-reference>"');
    expect(harness).toContain('"<alibi-ghost>"');
    expect(harness).toContain("namespace = {}");
    expect(harness).toContain("text[:400]");
  });

  test("passes every synthetic pair's sources through unchanged", () => {
    for (const pair of DUEL_PAIRS) {
      const harness = buildDuelHarness(pair.args);
      expect(harness).toContain(JSON.stringify(pair.args.reference));
      expect(harness).toContain(JSON.stringify(pair.args.ghost));
      expect(harness).toContain(`_ALIBI_FUNC = ${JSON.stringify(pair.args.func)}`);
      expect(harness).toContain(
        `_ALIBI_INPUT = ${JSON.stringify(pair.args.inputText)}`,
      );
    }
  });

  test("rejects non-string sources and inputs", () => {
    const base = {
      reference: "def f():\n    return 1\n",
      ghost: "def f():\n    return 2\n",
      func: "f",
      inputText: "()",
    };
    const error = captureThrow(() =>
      buildDuelHarness({ ...base, reference: null as unknown as string }),
    );
    expect(error instanceof TypeError).toBe(true);
    expect(
      captureThrow(() =>
        buildDuelHarness({ ...base, inputText: 7 as unknown as string }),
      ) instanceof TypeError,
    ).toBe(true);
  });

  test("rejects invalid budgets", () => {
    const base = {
      reference: "def f():\n    return 1\n",
      ghost: "def f():\n    return 2\n",
      func: "f",
      inputText: "()",
    };
    for (const budget of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      const error = captureThrow(() => buildDuelHarness({ ...base, budget }));
      expect(error instanceof RangeError).toBe(true);
    }
  });

  test("keeps the learner input out of exec: it reaches only literal_eval", () => {
    const evil =
      "''; import os\nos.system('echo pwned')\n__import__('os').getcwd()";
    const harness = buildDuelHarness({
      reference: "def f(x):\n    return x\n",
      ghost: "def f(x):\n    return x\n",
      func: "f",
      inputText: evil,
    });
    expect(countOccurrences(harness, JSON.stringify(evil))).toBe(1);
    expect(countOccurrences(harness, "_ALIBI_INPUT")).toBe(2);
    expect(countOccurrences(harness, "import os")).toBe(1);
    expect(harness).not.toMatch(/^import os$/m);
    expect(harness).not.toContain("exec(_ALIBI_INPUT");
    expect(harness).not.toContain("exec(compile(_ALIBI_INPUT");
  });

  test("execs the reference and the ghost in separate namespaces", () => {
    const harness = buildDuelHarness({
      reference: "def f():\n    return 1\n",
      ghost: "def f():\n    return 2\n",
      func: "f",
      inputText: "()",
    });
    expect(countOccurrences(harness, "namespace = {}")).toBe(1);
    expect(harness).toContain("_alibi_load(_ALIBI_REF, _ALIBI_REF_FILE");
    expect(harness).toContain("_alibi_load(_ALIBI_GHOST, _ALIBI_GHOST_FILE");
  });
});

describe("parseDuelStdout fixtures", () => {
  for (const pair of DUEL_PAIRS) {
    test(`maps the ${pair.name} fixture`, () => {
      expect(parseDuelStdout(markerLine(pair.fixture))).toEqual(pair.fixture);
      expect(parseDuelStdout(`${markerLine(pair.fixture)}\n`)).toEqual(
        pair.fixture,
      );
    });
  }
});

describe("parseDuelStdout", () => {
  test("ignores noise before and after the marker line", () => {
    const stdout = `hello\n${markerLine({ verdict: "same", ref: "1", ghost: "1" })}\ntrailing\n`;
    expect(parseDuelStdout(stdout)).toEqual({
      verdict: "same",
      ref: "1",
      ghost: "1",
    });
  });

  test("takes the last marker line when several are present", () => {
    const stdout = [
      markerLine({ verdict: "same", ref: "1", ghost: "1" }),
      markerLine({ verdict: "diverges_value", ref: "1", ghost: "2" }),
    ].join("\n");
    expect(parseDuelStdout(stdout).verdict).toBe("diverges_value");
  });

  test("tolerates CRLF and leading whitespace", () => {
    const stdout = `junk\r\n   ${markerLine({ verdict: "diverges_error", ref: "1", ghost: "ValueError: x" })}\r\n`;
    expect(parseDuelStdout(stdout)).toEqual({
      verdict: "diverges_error",
      ref: "1",
      ghost: "ValueError: x",
    });
  });

  test("returns harness_error when the marker is missing", () => {
    for (const stdout of ["", "\n", "no marker here\n", "x__DF_DUEL__{}"]) {
      expect(parseDuelStdout(stdout)).toEqual({
        verdict: "harness_error",
        ref: null,
        ghost: null,
      });
    }
  });

  test("returns harness_error on malformed JSON", () => {
    for (const suffix of ["{", "not json", '{"verdict": "same"', "{"]) {
      expect(parseDuelStdout(`${ALIBI_MARK}${suffix}`).verdict).toBe(
        "harness_error",
      );
    }
  });

  test("returns harness_error on unknown verdicts", () => {
    expect(
      parseDuelStdout(markerLine({ verdict: "both_error", ref: null, ghost: null }))
        .verdict,
    ).toBe("harness_error");
  });

  test("returns harness_error on non-object payloads", () => {
    for (const suffix of ["null", "42", '"same"', "[]", "true"]) {
      expect(parseDuelStdout(`${ALIBI_MARK}${suffix}`).verdict).toBe(
        "harness_error",
      );
    }
  });

  test("returns harness_error on wrong field types", () => {
    const fixtures = [
      { verdict: "same", ref: 5, ghost: "1" },
      { verdict: "same", ref: "1", ghost: {} },
      { verdict: "same" },
      { verdict: 1, ref: null, ghost: null },
    ];
    for (const payload of fixtures) {
      expect(parseDuelStdout(markerLine(payload)).verdict).toBe(
        "harness_error",
      );
    }
  });

  test("round-trips all seven verdicts with null fields", () => {
    for (const verdict of ALL_VERDICTS) {
      expect(parseDuelStdout(markerLine({ verdict, ref: null, ghost: null }))).toEqual({
        verdict,
        ref: null,
        ghost: null,
      });
    }
  });

  test("never throws on hostile stdout", () => {
    const hostile = [
      "\u0000\uFFFF",
      `${ALIBI_MARK}\u0000`,
      `${ALIBI_MARK}{"verdict": "same", "ref": "\\ud800", "ghost": null}`,
      markerLine({ verdict: "same", ref: "x".repeat(10_000), ghost: null }),
    ];
    for (const stdout of hostile) {
      expect(typeof parseDuelStdout(stdout).verdict).toBe("string");
    }
    expect(
      parseDuelStdout(undefined as unknown as string).verdict,
    ).toBe("harness_error");
  });
});

describe("validateAlibiInput", () => {
  test("rejects empty and whitespace-only input with a fixed reason", () => {
    for (const text of ["", "   ", "\n\t "]) {
      expect(validateAlibiInput(text)).toEqual({
        ok: false,
        reason: "Enter a Python literal to run.",
      });
    }
  });

  test("accepts ordinary Python literals", () => {
    for (const text of ["[1, 2]", '"x"', "3.5", "True", "None", "()", "{'a': 1}"]) {
      expect(validateAlibiInput(text)).toEqual({ ok: true });
    }
  });

  test("accepts exactly the character cap and rejects one more", () => {
    const atCap = `"${"x".repeat(ALIBI_INPUT_MAX_CHARS - 2)}"`;
    expect(atCap).toHaveLength(ALIBI_INPUT_MAX_CHARS);
    expect(validateAlibiInput(atCap)).toEqual({ ok: true });
    const overCap = `${atCap} `;
    expect(overCap).toHaveLength(ALIBI_INPUT_MAX_CHARS + 1);
    expect(validateAlibiInput(overCap)).toEqual({
      ok: false,
      reason: `Input must be ${ALIBI_INPUT_MAX_CHARS} characters or fewer.`,
    });
  });

  test("returns deterministic, input-independent reasons", () => {
    const a = validateAlibiInput("x".repeat(ALIBI_INPUT_MAX_CHARS + 10));
    const b = validateAlibiInput("{".repeat(ALIBI_INPUT_MAX_CHARS + 50));
    expect(a).toEqual(b);
  });
});

describe("pythonLiteral", () => {
  test("renders booleans and null", () => {
    expect(pythonLiteral(true)).toBe("True");
    expect(pythonLiteral(false)).toBe("False");
    expect(pythonLiteral(null)).toBe("None");
  });

  test("renders finite numbers deterministically", () => {
    expect(pythonLiteral(0)).toBe("0");
    expect(pythonLiteral(-3)).toBe("-3");
    expect(pythonLiteral(3.5)).toBe("3.5");
    expect(pythonLiteral(1e21)).toBe(String(1e21));
    expect(pythonLiteral(-0)).toBe("-0.0");
  });

  test("quotes strings with escapes that Python understands", () => {
    expect(pythonLiteral("a'b")).toBe('"a\'b"');
    expect(pythonLiteral('say "hi"')).toBe('"say \\"hi\\""');
    expect(pythonLiteral("line\nbreak")).toBe('"line\\nbreak"');
    expect(pythonLiteral("tab\there")).toBe('"tab\\there"');
    expect(pythonLiteral("back\\slash")).toBe('"back\\\\slash"');
    expect(pythonLiteral("h\u00e9llo \u4e16\u754c")).toBe(
      '"h\u00e9llo \u4e16\u754c"',
    );
  });

  test("does not rewrite Python keywords inside strings", () => {
    expect(pythonLiteral("True")).toBe('"True"');
    expect(pythonLiteral("null")).toBe('"null"');
    expect(pythonLiteral(["None", false, true])).toBe('["None", False, True]');
  });

  test("renders nested arrays and objects as Python literals", () => {
    const literal = pythonLiteral({ a: [1, true, null], "b c": { d: "e" } });
    expect(literal).toBe('{"a": [1, True, None], "b c": {"d": "e"}}');
    const asJson = literal
      .replace(/True/g, "true")
      .replace(/False/g, "false")
      .replace(/None/g, "null");
    expect(JSON.parse(asJson)).toEqual({ a: [1, true, null], "b c": { d: "e" } });
  });

  test("preserves insertion order for object keys", () => {
    expect(pythonLiteral({ b: 1, a: 2 })).toBe('{"b": 1, "a": 2}');
  });

  test("rejects values it cannot round-trip", () => {
    for (const value of [Number.NaN, Number.POSITIVE_INFINITY, undefined, () => 1]) {
      expect(captureThrow(() => pythonLiteral(value)) instanceof TypeError).toBe(
        true,
      );
    }
  });

  test("is deterministic", () => {
    const value = { x: [1, "two", false], y: null };
    expect(pythonLiteral(value)).toBe(pythonLiteral(value));
  });
});

describe("diffProgramLines", () => {
  test("returns empty slices for identical programs", () => {
    const source = "def f():\n    return 1\n";
    expect(diffProgramLines(source, source)).toEqual({ removed: [], added: [] });
  });

  test("isolates one changed line", () => {
    const reference = "def f(x):\n    y = x + 1\n    return y\n";
    const ghost = "def f(x):\n    y = x - 1\n    return y\n";
    expect(diffProgramLines(reference, ghost)).toEqual({
      removed: ["    y = x + 1"],
      added: ["    y = x - 1"],
    });
  });

  test("returns a contiguous slice for a multi-line change", () => {
    const reference = "a\nb\nc\nd\ne\n";
    const ghost = "a\nB\nC\nd\ne\n";
    expect(diffProgramLines(reference, ghost)).toEqual({
      removed: ["b", "c"],
      added: ["B", "C"],
    });
  });

  test("handles additions at the end", () => {
    expect(diffProgramLines("a\nb", "a\nb\nc")).toEqual({
      removed: [],
      added: ["c"],
    });
  });

  test("yields exactly one removed and one added line for a one-line edit", () => {
    const reference = "def f(xs, k):\n    return sum(xs[:k])\n";
    const ghost = "def f(xs, k):\n    return sum(xs[:k + 1])\n";
    const diff = diffProgramLines(reference, ghost);
    expect(diff.removed).toHaveLength(1);
    expect(diff.added).toHaveLength(1);
  });
});

describe("describeOutcome", () => {
  test("covers every verdict with distinct, non-empty copy", () => {
    const seen = new Set<string>();
    for (const verdict of ALL_VERDICTS) {
      const text = describeOutcome({ verdict, ref: null, ghost: null }, "f");
      expect(text.length).toBeGreaterThan(0);
      seen.add(text);
    }
    expect(seen.size).toBe(ALL_VERDICTS.length);
  });

  test("never claims correctness, wrongness, or ownership", () => {
    for (const verdict of ALL_VERDICTS) {
      const text = describeOutcome({ verdict, ref: null, ghost: null }, "f");
      expect(/\bwrong\b|\bcorrect\b|your code/i.test(text)).toBe(false);
    }
  });

  test("names the function in divergence copy", () => {
    for (const verdict of [
      "diverges_value",
      "diverges_error",
      "diverges_timeout",
    ] as const) {
      expect(describeOutcome({ verdict, ref: null, ghost: null }, "solve")).toContain(
        "solve",
      );
    }
  });

  test("is deterministic", () => {
    const outcome: AlibiDuelOutcome = {
      verdict: "diverges_value",
      ref: "1",
      ghost: "2",
    };
    expect(describeOutcome(outcome, "f")).toBe(describeOutcome(outcome, "f"));
  });
});

describe("module hygiene", () => {
  test("has no runtime imports, clocks, randomness, or browser globals", () => {
    expect(MODULE_SOURCE).not.toMatch(/from\s+["']/);
    expect(MODULE_SOURCE).not.toMatch(/\bimport\s*\(/);
    expect(MODULE_SOURCE).not.toContain("require(");
    expect(MODULE_SOURCE).not.toContain("Math.random");
    expect(MODULE_SOURCE).not.toMatch(/\bDate\b/);
    expect(MODULE_SOURCE).not.toContain("window");
    expect(MODULE_SOURCE).not.toContain("document");
    expect(MODULE_SOURCE).not.toContain("localStorage");
    expect(MODULE_SOURCE).not.toContain("fetch(");
  });
});
