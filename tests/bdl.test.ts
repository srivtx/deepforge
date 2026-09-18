import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import {
  BDL_HARNESS_VERSION,
  BDL_LINE_BUDGET,
  BDL_MARK,
  BDL_RUNTIME_BASIS_CAP,
  BDL_WALL_BUDGET_MS,
  bdlDelta,
  bdlVerdict,
  basisFingerprint,
  buildBdlBasis,
  buildBdlHarness,
  describeBdlVerdict,
  fnv1a32,
  hashBdlText,
  parseBdlStdout,
  type BdlRunResult,
  type BdlTestCase,
} from "@/lib/bdl";
import {
  BDL_CHANGE_EVENT,
  BDL_LEDGER_MAX_PROBLEMS,
  BDL_SHELF_CHANGE_EVENT,
  BDL_SHELF_MAX_PER_PROBLEM,
  BDL_SHELF_MAX_SOURCE_CHARS,
  BDL_SHELF_MAX_SOURCES,
  BDL_SHELF_STORAGE_KEY,
  BDL_STORAGE_KEY,
  clearBdl,
  clearBdlProblem,
  clearBdlShelf,
  exportBdlShelf,
  getBdlLedger,
  getBdlRecord,
  getBdlShelf,
  isBdlEnabled,
  recordBdlAttempt,
  removeBdlSource,
  saveBdlSource,
  setBdlEnabled,
  type BdlAttempt,
} from "@/lib/bdlStore";

/* ─────────────────────────────── test harness ───────────────────────────── */

function createStorageStub(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? (store.get(key) as string) : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
  };
}

const globalScope = globalThis as unknown as {
  window?: unknown;
  CustomEvent?: unknown;
};

let hadWindow = false;
let originalWindow: unknown;
let hadCustomEvent = false;
let originalCustomEvent: unknown;
let stub: Storage;
let dispatched: string[];

beforeEach(() => {
  hadWindow = "window" in globalScope;
  originalWindow = globalScope.window;
  hadCustomEvent = "CustomEvent" in globalScope;
  originalCustomEvent = globalScope.CustomEvent;
  stub = createStorageStub();
  dispatched = [];
  globalScope.window = {
    localStorage: stub,
    dispatchEvent: (event: { type?: unknown }) => {
      if (typeof event?.type === "string") dispatched.push(event.type);
      return true;
    },
  };
  globalScope.CustomEvent = class {
    type: string;
    constructor(type: string) {
      this.type = type;
    }
  };
});

afterEach(() => {
  if (hadWindow) globalScope.window = originalWindow;
  else delete globalScope.window;
  if (hadCustomEvent) globalScope.CustomEvent = originalCustomEvent;
  else delete globalScope.CustomEvent;
});

function runResult(sig: string, mask = "1"): BdlRunResult {
  let passed = 0;
  for (const char of mask) if (char === "1") passed += 1;
  return { sig, mask, passed, total: mask.length };
}

function attempt(
  hash: string,
  at: string,
  sig = "0",
  mask = "1",
): BdlAttempt {
  return { hash, sig, mask, at };
}

function markerLine(payload: unknown): string {
  return `${BDL_MARK}${JSON.stringify(payload)}`;
}

function countOccurrences(haystack: string, needle: string): number {
  if (needle.length === 0) return 0;
  return haystack.split(needle).length - 1;
}

function capturedThrow(fn: () => unknown): unknown {
  try {
    fn();
    return null;
  } catch (error) {
    return error;
  }
}

const TESTS: readonly BdlTestCase[] = [
  { input: [[1, 2, 3]], expected: 6 },
  { input: [[4]], expected: 4 },
];

const BASIS_INPUTS: readonly (readonly unknown[])[] = [
  [1, 2],
  [1, 0],
  [[1, 2, 3], 2],
  ["zzz-unused"],
];

const HARNESS_ARGS = {
  reference: "def total(xs):\n    return sum(xs)\n",
  submission: "def total(xs):\n    return sum(xs) + 1\n",
  func: "total",
  tests: TESTS,
  probes: [{ args: [[1, 2, 3]] }, { args: [[4]] }],
};

/* ──────────────────────────────── engine ────────────────────────────────── */

describe("bdl constants", () => {
  test("are the pinned blueprint values", () => {
    expect(BDL_HARNESS_VERSION).toBe(1);
    expect(BDL_MARK).toBe("__DF_BDL__");
    expect(BDL_RUNTIME_BASIS_CAP).toBe(24);
    expect(BDL_LINE_BUDGET).toBe(60_000);
    expect(BDL_WALL_BUDGET_MS).toBe(2_000);
  });
});

describe("fnv1a32 / hashBdlText", () => {
  test("matches the canonical FNV-1a 32 vectors", () => {
    expect(fnv1a32("")).toBe(2166136261);
    expect(fnv1a32("a")).toBe(0xe40c292c);
    expect(fnv1a32("foobar")).toBe(0xbf9cf968);
    expect(hashBdlText("")).toBe("811c9dc5");
    expect(hashBdlText("a")).toBe("e40c292c");
    expect(hashBdlText("foobar")).toBe("bf9cf968");
  });

  test("is stable and 8 lowercase hex chars for arbitrary text", () => {
    const samples = ["hello world", "def f(x):\n    return x\n", "héllo 世界"];
    for (const sample of samples) {
      expect(hashBdlText(sample)).toBe(hashBdlText(sample));
      expect(hashBdlText(sample)).toMatch(/^[0-9a-f]{8}$/);
    }
    expect(hashBdlText("héllo 世界")).not.toBe(hashBdlText("hello world"));
  });

  test("rejects non-string input instead of coercing", () => {
    expect(capturedThrow(() => fnv1a32(7 as unknown as string)) instanceof TypeError).toBe(
      true,
    );
  });
});

describe("basisFingerprint", () => {
  test("is stable, 8 hex chars, and insensitive to object key order", () => {
    const a: readonly BdlTestCase[] = [
      { input: [{ b: 1, a: 2 }], expected: [1, 2] },
    ];
    const b: readonly BdlTestCase[] = [
      { input: [{ a: 2, b: 1 }], expected: [1, 2] },
    ];
    expect(basisFingerprint("p1", a)).toBe(basisFingerprint("p1", a));
    expect(basisFingerprint("p1", a)).toBe(basisFingerprint("p1", b));
    expect(basisFingerprint("p1", a)).toMatch(/^[0-9a-f]{8}$/);
  });

  test("changes when the problem id, cap, input, or expected value changes", () => {
    const base = basisFingerprint("p1", TESTS);
    expect(base).not.toBe(basisFingerprint("p2", TESTS));
    expect(base).not.toBe(basisFingerprint("p1", TESTS, 16));
    expect(base).not.toBe(
      basisFingerprint("p1", [{ input: [[1, 2, 3]], expected: 7 }]),
    );
    expect(base).not.toBe(
      basisFingerprint("p1", [{ input: [[1, 2, 4]], expected: 6 }]),
    );
  });
});

describe("buildBdlBasis", () => {
  test("is deterministic across calls and bounded by the cap", () => {
    const first = buildBdlBasis(BASIS_INPUTS, "p1", 24);
    const second = buildBdlBasis(BASIS_INPUTS, "p1", 24);
    expect(first).toEqual(second);
    expect(first.length).toBeGreaterThan(0);
    expect(first.length).toBeLessThanOrEqual(BDL_RUNTIME_BASIS_CAP);
    expect(buildBdlBasis(BASIS_INPUTS, "p1", 3)).toHaveLength(3);
    expect(buildBdlBasis(BASIS_INPUTS, "p1", 0)).toHaveLength(0);
  });

  test("excludes exact shipped inputs and duplicate probes", () => {
    const basis = buildBdlBasis(BASIS_INPUTS, "p1", 48);
    const shipped = new Set(BASIS_INPUTS.map((input) => JSON.stringify(input)));
    const seen = new Set<string>();
    for (const probe of basis) {
      const key = JSON.stringify(probe.args);
      expect(shipped.has(key)).toBe(false);
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
  });

  test("every probe perturbs exactly one argument of one of the first three inputs", () => {
    const basis = buildBdlBasis(BASIS_INPUTS, "p1", 48);
    const sources = BASIS_INPUTS.slice(0, 3);
    for (const probe of basis) {
      const args = probe.args as readonly unknown[];
      const matches = sources.filter((source) => {
        if (source.length !== args.length) return false;
        let differences = 0;
        for (let index = 0; index < args.length; index += 1) {
          if (JSON.stringify(source[index]) !== JSON.stringify(args[index])) {
            differences += 1;
          }
        }
        return differences === 1;
      });
      expect(matches.length).toBeGreaterThan(0);
    }
  });

  test("never draws from inputs past the first three", () => {
    const basis = buildBdlBasis(BASIS_INPUTS, "p1", 48);
    for (const probe of basis) {
      expect(JSON.stringify(probe.args)).not.toContain("zzz-unused");
    }
  });

  test("an empty input contributes no probes", () => {
    expect(buildBdlBasis([[]], "p1", 24)).toHaveLength(0);
    expect(buildBdlBasis([], "p1", 24)).toHaveLength(0);
  });

  test("the problem id changes the shuffle order", () => {
    const alpha = JSON.stringify(buildBdlBasis(BASIS_INPUTS, "alpha", 24));
    const beta = JSON.stringify(buildBdlBasis(BASIS_INPUTS, "beta", 24));
    expect(alpha).not.toBe(beta);
  });

  test("returns fresh objects that are not aliased to the inputs", () => {
    const first = buildBdlBasis(BASIS_INPUTS, "p1", 24);
    const second = buildBdlBasis(BASIS_INPUTS, "p1", 24);
    expect(first[0].args).not.toBe(BASIS_INPUTS[0]);
    (first[0].args as unknown as unknown[]).push("mutated");
    expect(buildBdlBasis(BASIS_INPUTS, "p1", 24)).toEqual(second);
  });

  test("rejects a non-string problem id", () => {
    expect(
      capturedThrow(() =>
        buildBdlBasis(BASIS_INPUTS, 7 as unknown as string),
      ) instanceof TypeError,
    ).toBe(true);
  });
});

describe("buildBdlHarness", () => {
  test("is byte-identical for identical arguments", () => {
    expect(buildBdlHarness(HARNESS_ARGS)).toBe(buildBdlHarness(HARNESS_ARGS));
  });

  test("contains the required Python machinery and budget constants", () => {
    const harness = buildBdlHarness(HARNESS_ARGS);
    expect(countOccurrences(harness, JSON.stringify(BDL_MARK))).toBe(1);
    expect(harness).toContain(`_BDL_LINE_BUDGET = ${BDL_LINE_BUDGET}`);
    expect(harness).toContain(`_BDL_WALL_MS = ${BDL_WALL_BUDGET_MS}`);
    expect(harness).toContain(`bdl v${BDL_HARNESS_VERSION}`);
    expect(harness).toContain("class _BdlBudget(BaseException):");
    expect(harness).toContain("sys.settrace(");
    expect(harness).toContain("copy.deepcopy(list(args))");
    expect(harness).toContain("contextlib.redirect_stdout");
    expect(harness).toContain("json.loads(");
    expect(harness).toContain("math.isclose(float(a), float(b), rel_tol=tol, abs_tol=tol)");
    expect(harness).toContain("except (ValueError, OverflowError):");
    expect(harness).toContain("return a == b");
    expect(harness).toContain('"<bdl-reference>"');
    expect(harness).toContain('"<bdl-submission>"');
  });

  test("overrides time.sleep so blocking sleeps respect the wall budget", () => {
    const harness = buildBdlHarness(HARNESS_ARGS);
    expect(harness).toContain('getattr(time, "_bdl_real_sleep", None)');
    expect(harness).toContain("def _bdl_sleep(seconds=0.0):");
    expect(harness).toContain("time.sleep = _bdl_sleep");
    expect(harness).toContain("remaining = deadline - time.monotonic()");
    expect(harness).toContain("_BDL_REAL_SLEEP(remaining)");
    expect(harness).toMatch(/if seconds > remaining:[\s\S]*raise _BdlBudget\(\)/);
    expect(harness).toContain("time._bdl_real_sleep = _BDL_REAL_SLEEP");
    expect(harness).toMatch(/finally:[\s\S]*time\.sleep = _BDL_REAL_SLEEP/);
  });

  test("embeds custom budgets in place of the defaults", () => {
    const harness = buildBdlHarness({
      ...HARNESS_ARGS,
      lineBudget: 1234,
      wallBudgetMs: 250,
    });
    expect(harness).toContain("_BDL_LINE_BUDGET = 1234");
    expect(harness).toContain("_BDL_WALL_MS = 250");
    expect(harness).not.toContain(`_BDL_LINE_BUDGET = ${BDL_LINE_BUDGET}`);
    expect(harness).not.toContain(`_BDL_WALL_MS = ${BDL_WALL_BUDGET_MS}`);
  });

  test("quotes, newlines, backslashes, and unicode survive as data literals", () => {
    const submission =
      'def f(x):\n    s = "a\\"b\\\\c"\n    return s + x  # \u4e16\u754c\ndef g():\n    return 1\n';
    const harness = buildBdlHarness({ ...HARNESS_ARGS, submission });
    const match = harness.match(/^_BDL_SUB = (.+)$/m);
    expect(match).not.toBeNull();
    expect(JSON.parse((match as RegExpMatchArray)[1])).toBe(submission);
  });

  test("keeps learner text out of the program: literals only, no inline exec", () => {
    const evil =
      "''; import os\nos.system('echo pwned')\n__import__('os').getcwd()";
    const harness = buildBdlHarness({ ...HARNESS_ARGS, submission: evil });
    expect(countOccurrences(harness, JSON.stringify(evil))).toBe(1);
    expect(harness).not.toContain("exec(_BDL_");
    expect(harness).not.toMatch(/^import os$/m);
  });

  test("rejects wrong types and invalid budgets", () => {
    expect(
      capturedThrow(() =>
        buildBdlHarness({
          ...HARNESS_ARGS,
          reference: null as unknown as string,
        }),
      ) instanceof TypeError,
    ).toBe(true);
    expect(
      capturedThrow(() =>
        buildBdlHarness({
          ...HARNESS_ARGS,
          tests: null as unknown as readonly BdlTestCase[],
        }),
      ) instanceof TypeError,
    ).toBe(true);
    for (const lineBudget of [0, -1, 1.5, Number.NaN]) {
      expect(
        capturedThrow(() => buildBdlHarness({ ...HARNESS_ARGS, lineBudget })) instanceof
          RangeError,
      ).toBe(true);
    }
    for (const wallBudgetMs of [0, -5, 2.5]) {
      expect(
        capturedThrow(() =>
          buildBdlHarness({ ...HARNESS_ARGS, wallBudgetMs }),
        ) instanceof RangeError,
      ).toBe(true);
    }
  });
});

/* ───────────────── harness under a real interpreter ─────────────────────── */

const HAS_PYTHON3 =
  spawnSync("python3", ["--version"], { encoding: "utf8" }).status === 0;

function runHarnessPython(source: string): { stdout: string; ms: number } {
  const started = Date.now();
  const proc = spawnSync("python3", ["-"], {
    encoding: "utf8",
    input: source,
    timeout: 20_000,
  });
  return { stdout: proc.stdout ?? "", ms: Date.now() - started };
}

if (HAS_PYTHON3) describe("buildBdlHarness under CPython", () => {
  const tests: readonly BdlTestCase[] = [
    { input: [[1, 2, 3]], expected: 6 },
    { input: [[4]], expected: 4 },
  ];
  const probes = [{ args: [[7]] }, { args: [[8]] }];

  test("sleeps that fit the budget still sleep and pass", () => {
    const harness = buildBdlHarness({
      reference: "def total(xs):\n    return sum(xs)\n",
      submission:
        "import time\n\n\ndef total(xs):\n    time.sleep(0.05)\n    return sum(xs)\n",
      func: "total",
      tests,
      probes,
      wallBudgetMs: 2000,
    });
    const run = runHarnessPython(harness);
    expect(parseBdlStdout(run.stdout)).toEqual({
      sig: "00",
      mask: "11",
      passed: 2,
      total: 2,
    });
  });

  test("a sleep past the wall budget times out and returns early", () => {
    const harness = buildBdlHarness({
      reference: "def total(xs):\n    return sum(xs)\n",
      submission:
        "import time\n\n\ndef total(xs):\n    if xs == [7]:\n        time.sleep(3)\n    return sum(xs)\n",
      func: "total",
      tests,
      probes,
      wallBudgetMs: 800,
    });
    const run = runHarnessPython(harness);
    const parsed = parseBdlStdout(run.stdout);
    expect(parsed).not.toBeNull();
    expect((parsed as BdlRunResult).sig[0]).toBe("2");
    expect((parsed as BdlRunResult).mask).toBe("11");
    expect(run.ms).toBeLessThan(3000);
  });

  test("a busy Python loop honors the wall budget", () => {
    const harness = buildBdlHarness({
      reference: "def total(xs):\n    return sum(xs)\n",
      submission:
        "def total(xs):\n    if xs == [7]:\n        while True:\n            pass\n    return sum(xs)\n",
      func: "total",
      tests,
      probes,
      wallBudgetMs: 800,
      lineBudget: 10_000_000,
    });
    const run = runHarnessPython(harness);
    const parsed = parseBdlStdout(run.stdout);
    expect(parsed).not.toBeNull();
    expect((parsed as BdlRunResult).sig[0]).toBe("2");
    expect((parsed as BdlRunResult).mask).toBe("11");
    expect(run.ms).toBeLessThan(3000);
  });

  test("the wall budget is fresh for every program run", () => {
    const harness = buildBdlHarness({
      reference: "def total(xs):\n    return sum(xs)\n",
      submission:
        "import time\n\n\ndef total(xs):\n    time.sleep(0.4)\n    return sum(xs)\n",
      func: "total",
      tests: [{ input: [[1, 2, 3]], expected: 6 }],
      probes: [{ args: [[4]] }],
      wallBudgetMs: 1500,
    });
    const encoded = Buffer.from(harness, "utf8").toString("base64");
    const wrapper = [
      "import base64",
      `source = base64.b64decode(${JSON.stringify(encoded)}).decode("utf-8")`,
      'exec(compile(source, "<harness>", "exec"), {"__name__": "__main__"})',
      'exec(compile(source, "<harness>", "exec"), {"__name__": "__main__"})',
      "",
    ].join("\n");
    const run = runHarnessPython(wrapper);
    const payloads = run.stdout
      .split("\n")
      .filter((line) => line.includes(BDL_MARK))
      .map((line) => parseBdlStdout(line));
    expect(payloads).toHaveLength(2);
    for (const payload of payloads) {
      expect(payload).toEqual({ sig: "0", mask: "1", passed: 1, total: 1 });
    }
  });
});

describe("parseBdlStdout", () => {
  test("round-trips a well-formed payload and counts the mask", () => {
    expect(
      parseBdlStdout(markerLine({ v: 1, sig: "012x", mask: "101" })),
    ).toEqual({ sig: "012x", mask: "101", passed: 2, total: 3 });
  });

  test("accepts a 48-trit signature and a 64-char mask", () => {
    const sig = "0121".repeat(12);
    const mask = "1".repeat(64);
    expect(sig).toHaveLength(48);
    const parsed = parseBdlStdout(markerLine({ v: 1, sig, mask }));
    expect(parsed).not.toBeNull();
    expect((parsed as BdlRunResult).sig).toBe(sig);
    expect((parsed as BdlRunResult).passed).toBe(64);
  });

  test("ignores noise around exactly one marker", () => {
    const stdout = [
      "hello",
      markerLine({ v: 1, sig: "000", mask: "1" }),
      "noise",
      "trailing",
    ].join("\n");
    const parsed = parseBdlStdout(stdout);
    expect(parsed).toEqual({ sig: "000", mask: "1", passed: 1, total: 1 });
  });

  test("rejects duplicate markers instead of letting a late one win", () => {
    const real = markerLine({ v: 1, sig: "000", mask: "1" });
    const forged = markerLine({ v: 1, sig: "11", mask: "0" });
    // Early forged print (submission writes to sys.__stdout__), then real.
    expect(parseBdlStdout([forged, real].join("\n"))).toBeNull();
    // Late forged marker after the real one (atexit / non-daemon thread).
    expect(parseBdlStdout([real, forged].join("\n"))).toBeNull();
    // Two identical markers are still ambiguous.
    expect(parseBdlStdout([real, real].join("\n"))).toBeNull();
    // A marker-looking but malformed line plus a valid one is ambiguous too.
    expect(parseBdlStdout([`${BDL_MARK}not json`, real].join("\n"))).toBeNull();
  });

  test("requires the exact marker shape and a single line", () => {
    expect(
      parseBdlStdout(markerLine({ v: 1, sig: "0", mask: "1", extra: true })),
    ).toBeNull();
    expect(parseBdlStdout(markerLine({ v: 1, sig: "0" }))).toBeNull();
    expect(
      parseBdlStdout(`${BDL_MARK}{"v": 1, "sig": "0",\n"mask": "1"}`),
    ).toBeNull();
    expect(
      parseBdlStdout(`${BDL_MARK}{"v": 1, "sig": "0", "mask": "1"}`),
    ).toEqual({ sig: "0", mask: "1", passed: 1, total: 1 });
  });

  test("tolerates CRLF and leading whitespace", () => {
    expect(
      parseBdlStdout(`junk\r\n  ${markerLine({ v: 1, sig: "0x", mask: "1" })}\r\n`),
    ).toEqual({ sig: "0x", mask: "1", passed: 1, total: 1 });
  });

  test("returns null for missing or malformed markers", () => {
    const malformed = [
      "",
      "\n",
      "no marker here\n",
      `${BDL_MARK}not json`,
      `${BDL_MARK}{`,
      `${BDL_MARK}null`,
      `${BDL_MARK}42`,
      `${BDL_MARK}[]`,
      markerLine({ v: 2, sig: "0", mask: "1" }),
      markerLine({ v: "1", sig: "0", mask: "1" }),
      markerLine({ v: 1, sig: "3", mask: "1" }),
      markerLine({ v: 1, sig: "0", mask: "2" }),
      markerLine({ v: 1, sig: "x".repeat(49), mask: "1" }),
      markerLine({ v: 1, sig: "0", mask: "1".repeat(65) }),
      markerLine({ v: 1, sig: 5, mask: "1" }),
      markerLine({ v: 1, mask: "1" }),
    ];
    for (const stdout of malformed) {
      expect(parseBdlStdout(stdout)).toBeNull();
    }
  });

  test("never throws on hostile stdout", () => {
    const hostile = [
      `${BDL_MARK}\u0000`,
      `${BDL_MARK}{"v": 1, "sig": "\\ud800", "mask": "1"}`,
      markerLine({ v: 1, sig: "0", mask: "1" }).repeat(1000),
    ];
    for (const stdout of hostile) {
      const parsed = parseBdlStdout(stdout);
      expect(parsed === null || typeof parsed.sig === "string").toBe(true);
    }
    expect(parseBdlStdout(undefined as unknown as string)).toBeNull();
  });
});

describe("bdlDelta / bdlVerdict / describeBdlVerdict", () => {
  test("identical results have no changes and every dimension comparable", () => {
    expect(bdlDelta(runResult("000"), runResult("000"))).toEqual({
      changed: 0,
      comparable: 3,
      sigEqual: true,
      maskEqual: true,
    });
  });

  test("counts nonzero to nonzero flips as changes (fixed churn rule)", () => {
    const delta = bdlDelta(runResult("12"), runResult("21"));
    expect(delta.changed).toBe(2);
    expect(delta.comparable).toBe(2);
    expect(delta.sigEqual).toBe(false);
  });

  test("drops reference-less dimensions from comparisons", () => {
    expect(bdlDelta(runResult("0x1"), runResult("1x1"))).toEqual({
      changed: 1,
      comparable: 2,
      sigEqual: false,
      maskEqual: true,
    });
    expect(bdlDelta(runResult("x"), runResult("2")).comparable).toBe(0);
    expect(bdlDelta(runResult("x"), runResult("2")).changed).toBe(0);
  });

  test("handles differing signature lengths over the common prefix", () => {
    const delta = bdlDelta(runResult("0000"), runResult("00"));
    expect(delta.sigEqual).toBe(false);
    expect(delta.comparable).toBe(2);
    expect(delta.changed).toBe(0);
  });

  test("compares masks exactly", () => {
    const delta = bdlDelta(runResult("0", "11"), runResult("0", "10"));
    expect(delta.sigEqual).toBe(true);
    expect(delta.maskEqual).toBe(false);
  });

  test("unchanged text is always rerun", () => {
    expect(bdlVerdict(bdlDelta(runResult("0"), runResult("0")), false)).toBe(
      "rerun",
    );
    expect(bdlVerdict(bdlDelta(runResult("0"), runResult("1")), false)).toBe(
      "rerun",
    );
  });

  test("identical signature and mask after an edit is a ghost", () => {
    expect(bdlVerdict(bdlDelta(runResult("01"), runResult("01")), true)).toBe(
      "ghost",
    );
  });

  test("a changed mask is never a ghost", () => {
    expect(
      bdlVerdict(bdlDelta(runResult("01", "11"), runResult("01", "10")), true),
    ).toBe("changed");
  });

  test("a mask-only change never renders 'changed 0 of N'", () => {
    const delta = bdlDelta(runResult("01", "11"), runResult("01", "10"));
    expect(delta.changed).toBe(0);
    expect(delta.maskEqual).toBe(false);
    expect(bdlVerdict(delta, true)).toBe("changed");
    expect(describeBdlVerdict("changed", delta, 2)).toBe(
      "No change on 2 hidden checks. This edit changed text, not the behavior the checks measure.",
    );
  });

  test("a changed signature is a change", () => {
    expect(bdlVerdict(bdlDelta(runResult("01"), runResult("02")), true)).toBe(
      "changed",
    );
  });

  test("uses the frozen copy for the ghost and changed cards", () => {
    const delta = bdlDelta(runResult("000"), runResult("001"));
    expect(describeBdlVerdict("changed", delta, 3)).toBe(
      "This edit changed 1 of 3 hidden checks.",
    );
    expect(describeBdlVerdict("ghost", bdlDelta(runResult("000"), runResult("000")), 3)).toBe(
      "No change on 3 hidden checks. This edit changed text, not the behavior the checks measure.",
    );
    expect(describeBdlVerdict("rerun", delta, 3).length).toBeGreaterThan(0);
  });

  test("never carries a direction, judgment, or perturbation-class word", () => {
    const delta = bdlDelta(runResult("012"), runResult("120"));
    for (const verdict of ["ghost", "changed", "rerun"] as const) {
      const text = describeBdlVerdict(verdict, delta, 3);
      expect(
        /\b(fix|fixed|fixes|break|breaks|broke|broken|wrong|incorrect|correct|grade|graded|grading|family|families|direction|improved|worse|blind[- ]?spot)\b/i.test(
          text,
        ),
      ).toBe(false);
    }
  });
});

/* ───────────────────────────────── store ────────────────────────────────── */

const AT1 = "2026-09-18T10:00:00.000Z";
const AT2 = "2026-09-18T10:01:00.000Z";

describe("bdlStore ledger", () => {
  test("is disabled by default and stores nothing until enabled", () => {
    expect(isBdlEnabled()).toBe(false);
    expect(getBdlLedger()).toEqual({ version: 1, enabled: false, problems: {} });
    recordBdlAttempt("p1", "basis-1", attempt("h1", AT1));
    expect(stub.getItem(BDL_STORAGE_KEY)).toBeNull();
    expect(stub.length).toBe(0);
  });

  test("setBdlEnabled flips the flag, keeps records, and emits the change event", () => {
    setBdlEnabled(true);
    expect(isBdlEnabled()).toBe(true);
    expect(dispatched).toContain(BDL_CHANGE_EVENT);
    recordBdlAttempt("p1", "basis-1", attempt("h1", AT1));
    setBdlEnabled(false);
    expect(isBdlEnabled()).toBe(false);
    expect(getBdlRecord("p1", "basis-1")).toEqual(attempt("h1", AT1));
  });

  test("records one signature per problem and returns it on a matching basis", () => {
    setBdlEnabled(true);
    const saved = attempt("h1", AT1, "012", "10");
    recordBdlAttempt("p1", "basis-1", saved);
    expect(getBdlRecord("p1", "basis-1")).toEqual(saved);
    const keys: string[] = [];
    for (let index = 0; index < stub.length; index += 1) {
      keys.push(stub.key(index) as string);
    }
    expect(keys).toEqual([BDL_STORAGE_KEY]);
  });

  test("a mismatched basis fingerprint returns null and the next write replaces", () => {
    setBdlEnabled(true);
    recordBdlAttempt("p1", "basis-1", attempt("h1", AT1));
    expect(getBdlRecord("p1", "basis-2")).toBeNull();
    recordBdlAttempt("p1", "basis-2", attempt("h2", AT2));
    expect(getBdlRecord("p1", "basis-1")).toBeNull();
    expect(getBdlRecord("p1", "basis-2")).toEqual(attempt("h2", AT2));
  });

  test("drops malformed payloads and unknown versions", () => {
    stub.setItem(BDL_STORAGE_KEY, "not json");
    expect(getBdlLedger()).toEqual({ version: 1, enabled: false, problems: {} });
    stub.setItem(
      BDL_STORAGE_KEY,
      JSON.stringify({ version: 2, enabled: true, problems: {} }),
    );
    expect(getBdlLedger()).toEqual({ version: 1, enabled: false, problems: {} });
    stub.setItem(
      BDL_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        enabled: true,
        problems: { bad: { basis: "b" }, good: { basis: "b", last: attempt("h", AT1) } },
      }),
    );
    const ledger = getBdlLedger();
    expect(ledger.enabled).toBe(true);
    expect(getBdlRecord("bad", "b")).toBeNull();
    expect(getBdlRecord("good", "b")).toEqual(attempt("h", AT1));
  });

  test("evicts the oldest attempts beyond the 300-problem cap", () => {
    setBdlEnabled(true);
    const base = Date.UTC(2026, 0, 1);
    for (let index = 0; index <= BDL_LEDGER_MAX_PROBLEMS; index += 1) {
      recordBdlAttempt(
        `p${index}`,
        "basis",
        attempt(`h${index}`, new Date(base + index * 1000).toISOString()),
      );
    }
    const ledger = getBdlLedger();
    expect(Object.keys(ledger.problems)).toHaveLength(BDL_LEDGER_MAX_PROBLEMS);
    expect(ledger.problems.p0).toBeUndefined();
    expect(ledger.problems[`p${BDL_LEDGER_MAX_PROBLEMS}`]).toBeTruthy();
  });

  test("clearBdlProblem removes one record and clearBdl removes the key", () => {
    setBdlEnabled(true);
    recordBdlAttempt("p1", "b", attempt("h1", AT1));
    recordBdlAttempt("p2", "b", attempt("h2", AT2));
    clearBdlProblem("p1");
    expect(getBdlRecord("p1", "b")).toBeNull();
    expect(getBdlRecord("p2", "b")).toEqual(attempt("h2", AT2));
    clearBdl();
    expect(stub.getItem(BDL_STORAGE_KEY)).toBeNull();
    expect(isBdlEnabled()).toBe(false);
  });
});

describe("bdlStore shelf", () => {
  test("is a no-op while the ledger is disabled", () => {
    expect(
      saveBdlSource("p1", { code: "def f():\n    return 1\n", sig: "0", mask: "1", at: AT1 }),
    ).toBe(false);
    expect(stub.getItem(BDL_SHELF_STORAGE_KEY)).toBeNull();
    expect(exportBdlShelf()).toBe(JSON.stringify({ version: 1, problems: {} }));
  });

  test("saves sources with the engine-derived id and emits the shelf event", () => {
    setBdlEnabled(true);
    const code = "def f():\n    return 1\n";
    expect(saveBdlSource("p1", { code, sig: "01", mask: "10", at: AT1 })).toBe(true);
    const [saved] = getBdlShelf("p1");
    expect(saved.code).toBe(code);
    expect(saved.id).toBe(hashBdlText(code + AT1));
    expect(dispatched).toContain(BDL_SHELF_CHANGE_EVENT);
  });

  test("keeps at most 3 sources per problem, oldest first out", () => {
    setBdlEnabled(true);
    const base = Date.UTC(2026, 0, 1);
    for (let index = 0; index < 4; index += 1) {
      expect(
        saveBdlSource("p1", {
          code: `code-${index}`,
          sig: "0",
          mask: "1",
          at: new Date(base + index * 1000).toISOString(),
        }),
      ).toBe(true);
    }
    const shelf = getBdlShelf("p1");
    expect(shelf).toHaveLength(BDL_SHELF_MAX_PER_PROBLEM);
    expect(shelf.map((source) => source.code)).toEqual([
      "code-3",
      "code-2",
      "code-1",
    ]);
  });

  test("keeps at most 48 sources overall, oldest first out", () => {
    setBdlEnabled(true);
    const base = Date.UTC(2026, 0, 1);
    for (let problem = 0; problem < 17; problem += 1) {
      for (let slot = 0; slot < 3; slot += 1) {
        const at = new Date(base + (problem * 3 + slot) * 1000).toISOString();
        expect(
          saveBdlSource(`p${problem}`, {
            code: `code-${problem}-${slot}`,
            sig: "0",
            mask: "1",
            at,
          }),
        ).toBe(true);
      }
    }
    const exported = JSON.parse(exportBdlShelf()) as {
      version: number;
      problems: Record<string, { code: string }[]>;
    };
    expect(exported.version).toBe(1);
    const total = Object.values(exported.problems).reduce(
      (sum, sources) => sum + sources.length,
      0,
    );
    expect(total).toBe(BDL_SHELF_MAX_SOURCES);
    expect(exported.problems.p0).toBeUndefined();
    expect(exported.problems.p16).toHaveLength(BDL_SHELF_MAX_PER_PROBLEM);
  });

  test("rejects an over-long source and accepts exactly the cap", () => {
    setBdlEnabled(true);
    expect(
      saveBdlSource("p1", {
        code: "x".repeat(BDL_SHELF_MAX_SOURCE_CHARS + 1),
        sig: "0",
        mask: "1",
        at: AT1,
      }),
    ).toBe(false);
    expect(
      saveBdlSource("p1", {
        code: "x".repeat(BDL_SHELF_MAX_SOURCE_CHARS),
        sig: "0",
        mask: "1",
        at: AT1,
      }),
    ).toBe(true);
    expect(getBdlShelf("p1")).toHaveLength(1);
  });

  test("rejects invalid signatures, masks, and timestamps", () => {
    setBdlEnabled(true);
    expect(saveBdlSource("p1", { code: "x", sig: "3", mask: "1", at: AT1 })).toBe(
      false,
    );
    expect(saveBdlSource("p1", { code: "x", sig: "0", mask: "2", at: AT1 })).toBe(
      false,
    );
    expect(saveBdlSource("p1", { code: "x", sig: "0", mask: "1", at: "nope" })).toBe(
      false,
    );
    expect(saveBdlSource("", { code: "x", sig: "0", mask: "1", at: AT1 })).toBe(
      false,
    );
    expect(getBdlShelf("p1")).toHaveLength(0);
  });

  test("re-saving the same code and time replaces instead of duplicating", () => {
    setBdlEnabled(true);
    const source = { code: "code", sig: "0", mask: "1", at: AT1 };
    expect(saveBdlSource("p1", source)).toBe(true);
    expect(saveBdlSource("p1", source)).toBe(true);
    expect(getBdlShelf("p1")).toHaveLength(1);
  });

  test("removes one source, clears the shelf, and drops unknown versions", () => {
    setBdlEnabled(true);
    const code = "code";
    saveBdlSource("p1", { code, sig: "0", mask: "1", at: AT1 });
    const id = getBdlShelf("p1")[0].id;
    removeBdlSource("p1", id);
    expect(getBdlShelf("p1")).toHaveLength(0);
    saveBdlSource("p1", { code, sig: "0", mask: "1", at: AT2 });
    clearBdlShelf();
    expect(stub.getItem(BDL_SHELF_STORAGE_KEY)).toBeNull();
    stub.setItem(
      BDL_SHELF_STORAGE_KEY,
      JSON.stringify({ version: 2, problems: { p1: [{ code }] } }),
    );
    expect(getBdlShelf("p1")).toHaveLength(0);
  });

  test("exportBdlShelf always returns parseable JSON", () => {
    stub.setItem(BDL_SHELF_STORAGE_KEY, "{{{");
    const parsed = JSON.parse(exportBdlShelf()) as { version: number };
    expect(parsed.version).toBe(1);
  });
});
