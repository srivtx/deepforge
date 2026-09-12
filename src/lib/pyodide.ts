/**
 * Pyodide integration for DeepForge.
 *
 * Loads Pyodide v0.26.2 from the jsdelivr CDN lazily on first use.
 * Caches the loaded instance in a module-level promise so subsequent
 * runs are instant. Provides a `runTests` function that executes the
 * user's Python function against a list of test cases and returns
 * pass/fail with expected vs actual, plus a `runCode` function that
 * executes free-form Python and captures its stdout.
 *
 * All of this is browser-only — the file is gated by 'use client' on
 * the importing component.
 */

const PYODIDE_VERSION = "0.26.2";
const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
const PYODIDE_SCRIPT_SRC = `${PYODIDE_INDEX_URL}pyodide.js`;

let pyodidePromise: Promise<any> | null = null;

function loadPyodideScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).loadPyodide) {
      resolve();
      return;
    }
    // Avoid double-injecting the script tag.
    const existing = document.querySelector(
      `script[src="${PYODIDE_SCRIPT_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Pyodide script")),
      );
      return;
    }
    const script = document.createElement("script");
    script.src = PYODIDE_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Pyodide from CDN"));
    document.head.appendChild(script);
  });
}

export function loadPyodideOnce(): Promise<any> {
  if (pyodidePromise) return pyodidePromise;
  pyodidePromise = (async () => {
    await loadPyodideScript();
    const py = await (window as any).loadPyodide({
      indexURL: PYODIDE_INDEX_URL,
    });
    return py;
  })();
  return pyodidePromise;
}

/** Extract the name of the first `def foo(` in a Python snippet. */
export function extractFuncName(code: string): string | null {
  const m = code.match(/^\s*def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/m);
  return m ? m[1] : null;
}

export interface TestResult {
  ok: boolean;
  /** repr() of the actual return value, or null if it threw. */
  actual: string | null;
  /** repr() of the expected value. */
  expected: string;
  /** Error message if the call threw, else null. */
  error: string | null;
}

const HARNESS_TEMPLATE = (userCode: string, funcName: string, casesJson: string) => `
import json, math, sys

${userCode}

def _deep_eq(a, b, tol=1e-6):
    if isinstance(a, bool) or isinstance(b, bool):
        return a == b
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        try:
            return math.isclose(float(a), float(b), rel_tol=tol, abs_tol=tol)
        except (ValueError, OverflowError):
            return float(a) == float(b)
    if isinstance(a, (list, tuple)) and isinstance(b, (list, tuple)):
        return len(a) == len(b) and all(_deep_eq(x, y, tol) for x, y in zip(a, b))
    if isinstance(a, dict) and isinstance(b, dict):
        return a.keys() == b.keys() and all(_deep_eq(a[k], b[k], tol) for k in a)
    if a is None or b is None:
        return a is b
    return a == b

_cases = json.loads(${JSON.stringify(casesJson)})
_results = []
for _c in _cases:
    _args = _c['input']
    _expected = _c['expected']
    try:
        _actual = ${funcName}(*_args)
        _ok = _deep_eq(_actual, _expected)
        _results.append({
            'ok': _ok,
            'actual': repr(_actual),
            'expected': repr(_expected),
            'error': None,
        })
    except Exception as _e:
        _results.append({
            'ok': False,
            'actual': None,
            'expected': repr(_expected),
            'error': str(_e),
        })
json.dumps(_results)
`;

/**
 * Run the user's Python code against a list of test cases.
 *
 * Returns either an array of per-case TestResults, or — if the user's
 * code fails to parse/execute at the module level — a single-element
 * array with the syntax/runtime error.
 */
export async function runTests(
  py: any,
  userCode: string,
  testCases: { input: any[]; expected: any }[],
): Promise<TestResult[]> {
  const funcName = extractFuncName(userCode);
  if (!funcName) {
    return [
      {
        ok: false,
        actual: null,
        expected: "",
        error:
          "Could not find a `def <name>(...)` in your code. Define a function first.",
      },
    ];
  }

  // Serialize test cases. JSON.stringify with no replacer keeps numbers as
  // numbers, lists as lists, etc. — exactly what Python's json.loads expects.
  const casesJson = JSON.stringify(testCases);
  const harness = HARNESS_TEMPLATE(userCode, funcName, casesJson);

  try {
    const resultJson = await py.runPythonAsync(harness);
    if (typeof resultJson !== "string") {
      return [
        {
          ok: false,
          actual: null,
          expected: "",
          error: "Internal error: harness did not return a JSON string.",
        },
      ];
    }
    return JSON.parse(resultJson) as TestResult[];
  } catch (e: any) {
    // Syntax error or other fatal failure at module level.
    const msg = e?.message || String(e);
    return [
      {
        ok: false,
        actual: null,
        expected: "",
        error: msg,
      },
    ];
  }
}

export interface RunCodeResult {
  /** Everything the code printed to stdout before it finished or failed. */
  stdout: string;
  /** Python error message (traceback) if the code raised, else null. */
  error: string | null;
}

/**
 * Run free-form Python code and capture its stdout.
 *
 * Uses Pyodide's `setStdout` hook with a batched callback when available
 * (0.26.2 flushes the callback on every newline), falling back to
 * redirecting `sys.stdout` into a StringIO buffer. Never throws: a Python
 * error comes back in `error`, and anything printed before the failure is
 * still returned in `stdout`.
 */
export async function runCode(py: any, code: string): Promise<RunCodeResult> {
  const chunks: string[] = [];
  let batched = false;
  let restoreStdout: (() => void) | null = null;

  // Preferred path: Pyodide's built-in stdout hook.
  if (py && typeof py.setStdout === "function") {
    try {
      py.setStdout({
        batched: (line: string) => {
          chunks.push(line);
        },
      });
      batched = true;
      restoreStdout = () => {
        try {
          py.setStdout();
        } catch {
          /* resetting the stdout handler is best-effort */
        }
      };
    } catch {
      batched = false;
      restoreStdout = null;
    }
  }

  // Fallback: swap sys.stdout for a StringIO buffer and read it back.
  if (!restoreStdout && py) {
    try {
      const sys = py.pyimport("sys");
      const io = py.pyimport("io");
      const previousStdout = sys.stdout;
      sys.stdout = io.StringIO();
      restoreStdout = () => {
        try {
          chunks.push(sys.stdout.getvalue());
          sys.stdout = previousStdout;
        } catch {
          /* restoring sys.stdout is best-effort */
        }
      };
    } catch {
      restoreStdout = null;
    }
  }

  let error: string | null = null;
  try {
    await py.runPythonAsync(code);
  } catch (e: any) {
    error = e?.message || String(e);
  } finally {
    restoreStdout?.();
  }

  let stdout = chunks.join(batched ? "\n" : "");
  if (batched && stdout.length > 0) stdout += "\n";
  return { stdout, error };
}
