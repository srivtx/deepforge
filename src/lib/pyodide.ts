/**
 * Pyodide integration for DeepForge.
 *
 * Loads Pyodide v0.26.2 from the jsdelivr CDN lazily on first use and caches
 * the loaded instance in a module-level promise so subsequent runs are
 * instant. Provides a `runTests` function that executes the user's Python
 * function against a list of test cases and returns pass/fail with expected
 * vs actual, plus a `runCode` function that executes free-form Python and
 * captures its stdout.
 *
 * Execution normally happens in a dedicated Web Worker
 * (`pyodideWorker.ts`) so long-running or infinite user code cannot freeze
 * the UI. The worker handle returned by `loadPyodideOnce()` is recognized by
 * `runTests`/`runCode`, which round-trip through `postMessage`. If Web
 * Workers are unavailable, the `deepforge:pyodide-worker` localStorage flag
 * is set to "off", or worker startup fails (CDN error, CSP, bundling), the
 * facade transparently falls back to the original main-thread loader with
 * identical semantics.
 *
 * All of this is browser-only — the file is gated by 'use client' on the
 * importing component.
 */

import {
  PYODIDE_INDEX_URL,
  PYODIDE_SCRIPT_SRC,
  WORKER_FLAG_KEY,
  WORKER_HANDLE_KIND,
  isPyodideWorkerResponse,
  isWorkerHandle,
  isWorkerStatusMessage,
  runCodeWithPyodide,
  runTestsWithPyodide,
  serializeRunCodeRequest,
  serializeRunTestsRequest,
} from "./pyodideWorkerProtocol";
import type {
  PyodideTestCase,
  PyodideWorkerHandle,
  PyodideWorkerRequest,
  RunCodeResult,
  TestResult,
} from "./pyodideWorkerProtocol";

export { extractFuncName } from "./pyodideWorkerProtocol";
export type { RunCodeResult, TestResult } from "./pyodideWorkerProtocol";

let pyodidePromise: Promise<any> | null = null;

/* ------------------------------------------------------------------ */
/* Feature flag                                                        */
/* ------------------------------------------------------------------ */

let workerFlagResolved = false;
let workerEnabled = false;

/** Read (once) whether the worker path is enabled. Default: on. */
function isWorkerEnabled(): boolean {
  if (workerFlagResolved) return workerEnabled;
  workerFlagResolved = true;
  workerEnabled = false;
  if (typeof Worker === "undefined") return false;
  workerEnabled = true;
  try {
    if (localStorage.getItem(WORKER_FLAG_KEY) === "off") workerEnabled = false;
  } catch {
    /* localStorage can throw in privacy modes — keep the worker on */
  }
  return workerEnabled;
}

/* ------------------------------------------------------------------ */
/* Main-thread fallback                                                */
/* ------------------------------------------------------------------ */

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

async function loadPyodideMainThread(): Promise<any> {
  await loadPyodideScript();
  return (window as any).loadPyodide({ indexURL: PYODIDE_INDEX_URL });
}

/* ------------------------------------------------------------------ */
/* Worker handle                                                       */
/* ------------------------------------------------------------------ */

interface PendingRequest {
  resolve: (value: any) => void;
  reject: (reason: Error) => void;
}

function toError(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value));
}

function createWorkerHandle(worker: Worker): PyodideWorkerHandle {
  const pending = new Map<number, PendingRequest>();
  let nextId = 1;
  let disposed = false;

  const failAll = (error: Error) => {
    for (const entry of pending.values()) entry.reject(error);
    pending.clear();
  };

  worker.addEventListener("message", (event: MessageEvent) => {
    const data = event.data;
    if (!isPyodideWorkerResponse(data)) return;
    const entry = pending.get(data.id);
    if (!entry) return;
    pending.delete(data.id);
    if (!data.ok) {
      entry.reject(new Error(data.error));
      return;
    }
    if (data.op === "runTests") entry.resolve(data.results);
    else entry.resolve({ stdout: data.stdout, error: data.error });
  });
  worker.addEventListener("error", (event: ErrorEvent) => {
    failAll(new Error(event.message || "Pyodide worker crashed"));
  });
  worker.addEventListener("messageerror", () => {
    failAll(new Error("Pyodide worker sent an unreadable message"));
  });

  const send = (request: PyodideWorkerRequest): Promise<any> =>
    new Promise((resolve, reject) => {
      if (disposed) {
        reject(new Error("Pyodide worker is disposed"));
        return;
      }
      pending.set(request.id, { resolve, reject });
      try {
        worker.postMessage(request);
      } catch (e) {
        pending.delete(request.id);
        reject(toError(e));
      }
    });

  return {
    kind: WORKER_HANDLE_KIND,
    runTests: (userCode, testCases) =>
      send(serializeRunTestsRequest(nextId++, userCode, testCases)),
    runCode: (code) => send(serializeRunCodeRequest(nextId++, code)),
    dispose: () => {
      if (disposed) return;
      disposed = true;
      failAll(new Error("Pyodide worker is disposed"));
      worker.terminate();
    },
  };
}

function loadPyodideInWorker(): Promise<PyodideWorkerHandle> {
  return new Promise((resolve, reject) => {
    let worker: Worker;
    try {
      worker = new Worker(new URL("./pyodideWorker.ts", import.meta.url), {
        type: "module",
      });
    } catch (e) {
      reject(toError(e));
      return;
    }

    let settled = false;
    const cleanup = () => {
      worker.removeEventListener("message", onMessage);
      worker.removeEventListener("error", onError);
    };
    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!isWorkerStatusMessage(data)) return;
      if (data.status === "ready") {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(createWorkerHandle(worker));
      } else if (data.status === "error") {
        if (settled) return;
        settled = true;
        cleanup();
        worker.terminate();
        reject(new Error(data.error || "Pyodide worker failed to initialize"));
      }
    };
    const onError = () => {
      if (settled) return;
      settled = true;
      cleanup();
      worker.terminate();
      reject(new Error("Pyodide worker failed to load"));
    };
    worker.addEventListener("message", onMessage);
    worker.addEventListener("error", onError);
  });
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export function loadPyodideOnce(): Promise<any> {
  if (pyodidePromise) return pyodidePromise;
  pyodidePromise = (async () => {
    if (isWorkerEnabled()) {
      try {
        return await loadPyodideInWorker();
      } catch {
        // Worker init is best-effort: fall through to the main thread.
      }
    }
    return loadPyodideMainThread();
  })();
  return pyodidePromise;
}

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
  if (isWorkerHandle(py)) {
    try {
      return await py.runTests(userCode, testCases as PyodideTestCase[]);
    } catch (e: any) {
      return [
        { ok: false, actual: null, expected: "", error: e?.message || String(e) },
      ];
    }
  }
  return runTestsWithPyodide(py, userCode, testCases);
}

/**
 * Run free-form Python code and capture its stdout.
 *
 * Never throws: a Python error comes back in `error`, and anything printed
 * before the failure is still returned in `stdout`.
 */
export async function runCode(py: any, code: string): Promise<RunCodeResult> {
  if (isWorkerHandle(py)) {
    try {
      return await py.runCode(code);
    } catch (e: any) {
      return { stdout: "", error: e?.message || String(e) };
    }
  }
  return runCodeWithPyodide(py, code);
}
