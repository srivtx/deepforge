import { describe, test, expect } from "bun:test";
import {
  INTERNAL_HARNESS_ERROR,
  NO_FUNCTION_ERROR,
  WORKER_HANDLE_KIND,
  buildTestHarness,
  parseTestResults,
  runCodeWithPyodide,
  runTestsWithPyodide,
} from "@/lib/pyodideWorkerProtocol";
import { extractFuncName, runCode, runTests } from "@/lib/pyodide";

const okResult = { ok: true, actual: "1", expected: "1", error: null };

function fakeHandle(overrides: any = {}) {
  return {
    kind: WORKER_HANDLE_KIND,
    runTests: async () => [okResult],
    runCode: async () => ({ stdout: "out\n", error: null }),
    dispose: () => {},
    ...overrides,
  };
}

describe("extractFuncName (public re-export)", () => {
  test("finds the first def in a snippet", () => {
    expect(
      extractFuncName("import os\n\ndef first(x):\n    return x\ndef second():\n    pass"),
    ).toBe("first");
  });

  test("returns null when there is no def", () => {
    expect(extractFuncName("x = 1\nprint(x)")).toBeNull();
  });
});

describe("buildTestHarness", () => {
  test("embeds user code, the call site and the serialized cases", () => {
    const cases = [{ input: [[1, 2]], expected: 3 }];
    const harness = buildTestHarness(
      "def add(a, b):\n    return a + b",
      "add",
      JSON.stringify(cases),
    );
    expect(harness).toContain("import json, math, sys");
    expect(harness).toContain("def add(a, b):\n    return a + b");
    expect(harness).toContain("_actual = add(*_args)");
    expect(harness).toContain(`_cases = json.loads(${JSON.stringify(JSON.stringify(cases))})`);
    expect(harness).toContain("json.dumps(_results)");
  });
});

describe("parseTestResults", () => {
  test("returns an internal error result for non-strings", () => {
    expect(parseTestResults(undefined)).toEqual([
      { ok: false, actual: null, expected: "", error: INTERNAL_HARNESS_ERROR },
    ]);
    expect(parseTestResults(42)).toEqual([
      { ok: false, actual: null, expected: "", error: INTERNAL_HARNESS_ERROR },
    ]);
  });

  test("returns a single error result for invalid JSON", () => {
    const res = parseTestResults("{not json");
    expect(res).toHaveLength(1);
    expect(res[0].ok).toBe(false);
    expect(res[0].error).not.toBeNull();
  });

  test("parses a valid JSON array", () => {
    expect(parseTestResults(JSON.stringify([okResult]))).toEqual([okResult]);
  });
});

describe("runTestsWithPyodide", () => {
  test("missing def returns the canonical single error result", async () => {
    const res = await runTestsWithPyodide({} as any, "x = 1", []);
    expect(res).toEqual([
      { ok: false, actual: null, expected: "", error: NO_FUNCTION_ERROR },
    ]);
  });

  test("passes serialized test cases into the harness", async () => {
    let seen = "";
    const py = {
      runPythonAsync: async (code: string) => {
        seen = code;
        return "[]";
      },
    };
    const cases = [{ input: [[1, 2]], expected: 3 }];
    const res = await runTestsWithPyodide(
      py as any,
      "def add(a, b):\n    return a + b",
      cases,
    );
    expect(res).toEqual([]);
    expect(seen).toContain(JSON.stringify(JSON.stringify(cases)));
  });

  test("returns the harness results on success", async () => {
    const expected = [
      { ok: true, actual: "3", expected: "3", error: null },
      { ok: false, actual: "0", expected: "1", error: null },
    ];
    const py = { runPythonAsync: async () => JSON.stringify(expected) };
    const res = await runTestsWithPyodide(
      py as any,
      "def add(a, b):\n    return a + b",
      [{ input: [1, 2], expected: 3 }],
    );
    expect(res).toEqual(expected);
  });

  test("module-level failures become a single error result", async () => {
    const py = {
      runPythonAsync: async () => {
        throw new Error("SyntaxError: invalid syntax");
      },
    };
    const res = await runTestsWithPyodide(py as any, "def f(:\n    pass", []);
    expect(res).toEqual([
      { ok: false, actual: null, expected: "", error: "SyntaxError: invalid syntax" },
    ]);
  });
});

function batchedPy(script: (emit: (line: string) => void) => void) {
  let handler: any = null;
  let restored = false;
  return {
    setStdout(h?: any) {
      if (h) handler = h;
      else {
        handler = null;
        restored = true;
      }
    },
    async runPythonAsync() {
      script((line: string) => handler.batched(line));
    },
    get restored() {
      return restored;
    },
  };
}

describe("runCodeWithPyodide", () => {
  test("captures batched stdout and appends one trailing newline", async () => {
    const py = batchedPy((emit) => {
      emit("a");
      emit("b");
    });
    const res = await runCodeWithPyodide(py as any, "print('a')\nprint('b')");
    expect(res).toEqual({ stdout: "a\nb\n", error: null });
    expect(py.restored).toBe(true);
  });

  test("keeps partial stdout when the code raises", async () => {
    const py = batchedPy((emit) => {
      emit("before");
      throw new Error("ZeroDivisionError: division by zero");
    });
    const res = await runCodeWithPyodide(py as any, "print('before')\n1/0");
    expect(res).toEqual({
      stdout: "before\n",
      error: "ZeroDivisionError: division by zero",
    });
  });

  test("empty output stays empty (no stray newline)", async () => {
    const py = batchedPy(() => {});
    const res = await runCodeWithPyodide(py as any, "x = 1");
    expect(res).toEqual({ stdout: "", error: null });
  });

  test("falls back to sys.stdout stringio without setStdout", async () => {
    const buffer = {
      value: "",
      getvalue() {
        return this.value;
      },
    };
    const previous = { getvalue: () => "" };
    const sys: any = { stdout: previous };
    const py = {
      runPythonAsync: async () => {
        buffer.value += "plain output";
      },
      pyimport: (name: string) =>
        name === "sys" ? sys : { StringIO: () => buffer },
    };
    const res = await runCodeWithPyodide(py as any, "print('plain output')");
    expect(res).toEqual({ stdout: "plain output", error: null });
    expect(sys.stdout).toBe(previous);
  });
});

describe("facade worker-handle dispatch", () => {
  test("runTests delegates to the handle without touching a real worker", async () => {
    const seen: any[] = [];
    const handle = fakeHandle({
      runTests: async (userCode: string, cases: any) => {
        seen.push([userCode, cases]);
        return [okResult];
      },
    });
    const res = await runTests(handle, "def f():\n    return 1", [
      { input: [], expected: 1 },
    ]);
    expect(res).toEqual([okResult]);
    expect(seen).toHaveLength(1);
  });

  test("runTests keeps its error shape when the worker transport fails", async () => {
    const handle = fakeHandle({
      runTests: async () => {
        throw new Error("worker exploded");
      },
    });
    const res = await runTests(handle, "def f():\n    return 1", []);
    expect(res).toEqual([
      { ok: false, actual: null, expected: "", error: "worker exploded" },
    ]);
  });

  test("runCode delegates to the handle", async () => {
    const handle = fakeHandle();
    expect(await runCode(handle, "print(1)")).toEqual({
      stdout: "out\n",
      error: null,
    });
  });

  test("runCode keeps its error shape when the worker transport fails", async () => {
    const handle = fakeHandle({
      runCode: async () => {
        throw new Error("worker exploded");
      },
    });
    expect(await runCode(handle, "print(1)")).toEqual({
      stdout: "",
      error: "worker exploded",
    });
  });

  test("non-handle pyodide objects still take the in-thread path", async () => {
    const py = { runPythonAsync: async () => "[]" };
    expect(await runTests(py, "def f():\n    pass", [])).toEqual([]);
  });
});
