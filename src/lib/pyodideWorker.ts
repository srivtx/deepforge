/**
 * Dedicated Web Worker entry that hosts the Pyodide runtime.
 *
 * The main thread creates this via
 *   new Worker(new URL("./pyodideWorker.ts", import.meta.url), { type: "module" })
 * and talks to it with the message protocol from `pyodideWorkerProtocol.ts`.
 * Moving Pyodide here means long-running or infinite user code can no longer
 * freeze the UI: the worker event loop blocks, the page keeps painting.
 *
 * Pyodide v0.26.2 must be loaded through a *classic* script context because
 * the emscripten loader uses `importScripts` internally and its runtime
 * detection throws "Cannot determine runtime environment" in a module worker.
 * Classic worker bundles (and older Turbopack builds) have native
 * `importScripts`, so that path is used verbatim. When the worker really runs
 * as an ES module we install a synchronous `importScripts` shim first; both
 * CDN scripts (`pyodide.js`, `pyodide.asm.js`) explicitly assign their globals
 * via `globalThis`, so evaluating them in global scope is enough.
 */

import {
  PYODIDE_INDEX_URL,
  PYODIDE_SCRIPT_SRC,
  isPyodideWorkerRequest,
  runCodeWithPyodide,
  runTestsWithPyodide,
  serializeErrorResponse,
  serializeRunCodeResponse,
  serializeRunTestsResponse,
  serializeStatusMessage,
} from "./pyodideWorkerProtocol";
import type { PyodideWorkerRequest } from "./pyodideWorkerProtocol";

interface WorkerScopeLike {
  postMessage(message: unknown): void;
  addEventListener(
    type: "message",
    listener: (event: MessageEvent) => void,
  ): void;
  importScripts?: (...urls: string[]) => void;
  loadPyodide?: (options: { indexURL: string }) => Promise<any>;
}

const scope = globalThis as unknown as WorkerScopeLike;

function postStatus(
  status: "loading" | "ready" | "error",
  error: string | null = null,
): void {
  scope.postMessage(serializeStatusMessage(status, error));
}

/**
 * Provide a synchronous `importScripts` in module workers. Synchronous XHR is
 * allowed inside workers; evaluating the fetched source in global scope lets
 * the CDN scripts install their globals exactly like a classic worker would.
 */
function installImportScriptsShim(): void {
  const g = globalThis as any;
  if (typeof g.importScripts === "function") return;
  g.importScripts = (...urls: string[]) => {
    for (const url of urls) {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url, false);
      xhr.send(null);
      if (xhr.status < 200 || xhr.status >= 300) {
        throw new Error(`Failed to load script: ${url}`);
      }
      (0, eval)(xhr.responseText);
    }
  };
}

function loadPyodideScriptInWorker(): void {
  const g = globalThis as any;
  if (typeof g.loadPyodide === "function") return;
  installImportScriptsShim();
  g.importScripts(PYODIDE_SCRIPT_SRC);
  if (typeof g.loadPyodide !== "function") {
    throw new Error("Failed to load Pyodide from CDN");
  }
}

let pyodidePromise: Promise<any> | null = null;

function loadPyodideInWorker(): Promise<any> {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      loadPyodideScriptInWorker();
      const g = globalThis as any;
      return g.loadPyodide({ indexURL: PYODIDE_INDEX_URL });
    })().catch((e: any) => {
      pyodidePromise = null;
      throw e;
    });
  }
  return pyodidePromise;
}

async function handleRequest(request: PyodideWorkerRequest): Promise<void> {
  try {
    const py = await loadPyodideInWorker();
    if (request.op === "runTests") {
      const results = await runTestsWithPyodide(
        py,
        request.userCode,
        request.testCases,
      );
      scope.postMessage(serializeRunTestsResponse(request.id, results));
    } else {
      const { stdout, error } = await runCodeWithPyodide(py, request.code);
      scope.postMessage(serializeRunCodeResponse(request.id, stdout, error));
    }
  } catch (e: any) {
    scope.postMessage(serializeErrorResponse(request.id, e?.message || String(e)));
  }
}

scope.addEventListener("message", (event: MessageEvent) => {
  const data = event.data;
  if (!isPyodideWorkerRequest(data)) return;
  void handleRequest(data);
});

postStatus("loading");
loadPyodideInWorker().then(
  () => postStatus("ready"),
  (e: any) => postStatus("error", e?.message || String(e)),
);
