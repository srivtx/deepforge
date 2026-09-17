/**
 * Shared, dependency-free helpers for the Pyodide web-worker bridge.
 *
 * This module is imported by both the main-thread facade
 * (`src/lib/pyodide.ts`) and the worker entry (`src/lib/pyodideWorker.ts`).
 * It must never reference `window`, `document`, `Worker`, or any other
 * browser global, so that the whole file stays trivially unit-testable
 * in bun without a browser or a Python runtime.
 */

export const PYODIDE_VERSION = "0.26.2";
export const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
export const PYODIDE_SCRIPT_SRC = `${PYODIDE_INDEX_URL}pyodide.js`;

/** localStorage switch. Set `deepforge:pyodide-worker` to "off" to force the main thread. */
export const WORKER_FLAG_KEY = "deepforge:pyodide-worker";

/** Marker property on the worker-backed handle returned by loadPyodideOnce(). */
export const WORKER_HANDLE_KIND = "deepforge-pyodide-worker";

export const NO_FUNCTION_ERROR =
  "Could not find a `def <name>(...)` in your code. Define a function first.";
export const INTERNAL_HARNESS_ERROR =
  "Internal error: harness did not return a JSON string.";

export interface PyodideTestCase {
  input: unknown[];
  expected: unknown;
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

export interface RunCodeResult {
  /** Everything the code printed to stdout before it finished or failed. */
  stdout: string;
  /** Python error message (traceback) if the code raised, else null. */
  error: string | null;
}

export interface PyodideWorkerHandle {
  readonly kind: typeof WORKER_HANDLE_KIND;
  runTests(userCode: string, testCases: PyodideTestCase[]): Promise<TestResult[]>;
  runCode(code: string): Promise<RunCodeResult>;
  dispose(): void;
}

/** Extract the name of the first `def foo(` in a Python snippet. */
export function extractFuncName(code: string): string | null {
  const m = code.match(/^\s*def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/m);
  return m ? m[1] : null;
}

export function buildTestHarness(
  userCode: string,
  funcName: string,
  casesJson: string,
): string {
  return `
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
}

export function errorTestResult(error: string): TestResult {
  return { ok: false, actual: null, expected: "", error };
}

/**
 * Turn whatever `py.runPythonAsync(harness)` returned into TestResult[].
 * Mirrors the original main-thread semantics: a non-string return and a
 * JSON parse failure both collapse to a single error result.
 */
export function parseTestResults(raw: unknown): TestResult[] {
  if (typeof raw !== "string") return [errorTestResult(INTERNAL_HARNESS_ERROR)];
  try {
    return JSON.parse(raw) as TestResult[];
  } catch (e: any) {
    return [errorTestResult(e?.message || String(e))];
  }
}

/**
 * Run the user's Python function against test cases using any Pyodide
 * instance (main thread or worker). Returns per-case TestResults, or a
 * single-element array for a missing `def` / parse failure.
 */
export async function runTestsWithPyodide(
  py: any,
  userCode: string,
  testCases: PyodideTestCase[],
): Promise<TestResult[]> {
  const funcName = extractFuncName(userCode);
  if (!funcName) return [errorTestResult(NO_FUNCTION_ERROR)];

  const casesJson = JSON.stringify(testCases);
  const harness = buildTestHarness(userCode, funcName, casesJson);

  try {
    const resultJson = await py.runPythonAsync(harness);
    return parseTestResults(resultJson);
  } catch (e: any) {
    return [errorTestResult(e?.message || String(e))];
  }
}

/**
 * Run free-form Python code and capture its stdout using any Pyodide
 * instance (main thread or worker). Uses Pyodide's `setStdout` hook with a
 * batched callback when available, falling back to redirecting `sys.stdout`
 * into a StringIO buffer. Never throws.
 */
export async function runCodeWithPyodide(
  py: any,
  code: string,
): Promise<RunCodeResult> {
  const chunks: string[] = [];
  let batched = false;
  let restoreStdout: (() => void) | null = null;

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

/* ------------------------------------------------------------------ */
/* Message protocol                                                    */
/* ------------------------------------------------------------------ */

export interface WorkerStatusMessage {
  type: "status";
  status: "loading" | "ready" | "error";
  error?: string | null;
}

export interface RunTestsRequest {
  id: number;
  op: "runTests";
  userCode: string;
  testCases: PyodideTestCase[];
}

export interface RunCodeRequest {
  id: number;
  op: "runCode";
  code: string;
}

export type PyodideWorkerRequest = RunTestsRequest | RunCodeRequest;

export interface RunTestsResponse {
  id: number;
  op: "runTests";
  ok: true;
  results: TestResult[];
}

export interface RunCodeResponse {
  id: number;
  op: "runCode";
  ok: true;
  stdout: string;
  error: string | null;
}

export interface WorkerErrorResponse {
  id: number;
  ok: false;
  error: string;
}

export type PyodideWorkerResponse =
  | RunTestsResponse
  | RunCodeResponse
  | WorkerErrorResponse;

export function serializeRunTestsRequest(
  id: number,
  userCode: string,
  testCases: PyodideTestCase[],
): RunTestsRequest {
  return { id, op: "runTests", userCode, testCases };
}

export function serializeRunCodeRequest(id: number, code: string): RunCodeRequest {
  return { id, op: "runCode", code };
}

export function serializeRunTestsResponse(
  id: number,
  results: TestResult[],
): RunTestsResponse {
  return { id, op: "runTests", ok: true, results };
}

export function serializeRunCodeResponse(
  id: number,
  stdout: string,
  error: string | null,
): RunCodeResponse {
  return { id, op: "runCode", ok: true, stdout, error };
}

export function serializeErrorResponse(id: number, error: string): WorkerErrorResponse {
  return { id, ok: false, error };
}

export function serializeStatusMessage(
  status: WorkerStatusMessage["status"],
  error: string | null = null,
): WorkerStatusMessage {
  return { type: "status", status, error };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isPyodideWorkerRequest(value: unknown): value is PyodideWorkerRequest {
  if (!isRecord(value)) return false;
  if (typeof value.id !== "number" || !Number.isFinite(value.id)) return false;
  if (value.op === "runTests") {
    return typeof value.userCode === "string" && Array.isArray(value.testCases);
  }
  if (value.op === "runCode") return typeof value.code === "string";
  return false;
}

export function isPyodideWorkerResponse(value: unknown): value is PyodideWorkerResponse {
  if (!isRecord(value)) return false;
  if (typeof value.id !== "number" || !Number.isFinite(value.id)) return false;
  if (value.ok === false) return typeof value.error === "string";
  if (value.ok !== true) return false;
  if (value.op === "runTests") return Array.isArray(value.results);
  if (value.op === "runCode") {
    return (
      typeof value.stdout === "string" &&
      (value.error === null || typeof value.error === "string")
    );
  }
  return false;
}

export function isWorkerStatusMessage(value: unknown): value is WorkerStatusMessage {
  if (!isRecord(value)) return false;
  if (value.type !== "status") return false;
  if (value.status !== "loading" && value.status !== "ready" && value.status !== "error") {
    return false;
  }
  return value.error === undefined || value.error === null || typeof value.error === "string";
}

export function isWorkerHandle(value: unknown): value is PyodideWorkerHandle {
  if (!isRecord(value)) return false;
  if (value.kind !== WORKER_HANDLE_KIND) return false;
  return typeof value.runTests === "function" && typeof value.runCode === "function";
}
