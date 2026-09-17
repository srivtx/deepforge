import { describe, test, expect } from "bun:test";
import {
  WORKER_FLAG_KEY,
  WORKER_HANDLE_KIND,
  isPyodideWorkerRequest,
  isPyodideWorkerResponse,
  isWorkerHandle,
  isWorkerStatusMessage,
  serializeErrorResponse,
  serializeRunCodeRequest,
  serializeRunCodeResponse,
  serializeRunTestsRequest,
  serializeRunTestsResponse,
  serializeStatusMessage,
} from "@/lib/pyodideWorkerProtocol";

describe("worker flag key", () => {
  test("is the documented localStorage switch", () => {
    expect(WORKER_FLAG_KEY).toBe("deepforge:pyodide-worker");
  });
});

describe("request serializers", () => {
  test("serializeRunTestsRequest builds a runTests request", () => {
    const cases = [{ input: [1, 2], expected: 3 }];
    expect(serializeRunTestsRequest(7, "def add(a, b): return a + b", cases)).toEqual({
      id: 7,
      op: "runTests",
      userCode: "def add(a, b): return a + b",
      testCases: cases,
    });
  });

  test("serializeRunCodeRequest builds a runCode request", () => {
    expect(serializeRunCodeRequest(1, "print(1)")).toEqual({
      id: 1,
      op: "runCode",
      code: "print(1)",
    });
  });
});

describe("response serializers", () => {
  test("serializeRunTestsResponse keeps results", () => {
    const results = [
      { ok: true, actual: "3", expected: "3", error: null },
    ];
    expect(serializeRunTestsResponse(2, results)).toEqual({
      id: 2,
      op: "runTests",
      ok: true,
      results,
    });
  });

  test("serializeRunCodeResponse keeps stdout and error", () => {
    expect(serializeRunCodeResponse(3, "hello\n", null)).toEqual({
      id: 3,
      op: "runCode",
      ok: true,
      stdout: "hello\n",
      error: null,
    });
  });

  test("serializeErrorResponse marks the failure", () => {
    expect(serializeErrorResponse(4, "boom")).toEqual({
      id: 4,
      ok: false,
      error: "boom",
    });
  });

  test("serializeStatusMessage defaults error to null", () => {
    expect(serializeStatusMessage("loading")).toEqual({
      type: "status",
      status: "loading",
      error: null,
    });
    expect(serializeStatusMessage("error", "cdn down")).toEqual({
      type: "status",
      status: "error",
      error: "cdn down",
    });
  });
});

describe("isPyodideWorkerRequest", () => {
  test("accepts well-formed requests", () => {
    expect(
      isPyodideWorkerRequest({ id: 1, op: "runTests", userCode: "def f(): pass", testCases: [] }),
    ).toBe(true);
    expect(isPyodideWorkerRequest({ id: 2, op: "runCode", code: "print(1)" })).toBe(true);
  });

  test("rejects malformed values", () => {
    expect(isPyodideWorkerRequest(null)).toBe(false);
    expect(isPyodideWorkerRequest(undefined)).toBe(false);
    expect(isPyodideWorkerRequest("runCode")).toBe(false);
    expect(isPyodideWorkerRequest([])).toBe(false);
    expect(isPyodideWorkerRequest({})).toBe(false);
    expect(isPyodideWorkerRequest({ op: "runCode", code: "x" })).toBe(false);
    expect(isPyodideWorkerRequest({ id: Number.NaN, op: "runCode", code: "x" })).toBe(false);
    expect(isPyodideWorkerRequest({ id: 1, op: "sing", code: "x" })).toBe(false);
    expect(isPyodideWorkerRequest({ id: 1, op: "runCode", code: 5 })).toBe(false);
    expect(
      isPyodideWorkerRequest({ id: 1, op: "runTests", userCode: "def f(): pass" }),
    ).toBe(false);
    expect(
      isPyodideWorkerRequest({ id: 1, op: "runTests", testCases: [] }),
    ).toBe(false);
  });
});

describe("isPyodideWorkerResponse", () => {
  test("accepts runTests results", () => {
    expect(
      isPyodideWorkerResponse({
        id: 1,
        op: "runTests",
        ok: true,
        results: [{ ok: false, actual: null, expected: "1", error: "x" }],
      }),
    ).toBe(true);
  });

  test("accepts runCode output", () => {
    expect(
      isPyodideWorkerResponse({ id: 1, op: "runCode", ok: true, stdout: "a\n", error: null }),
    ).toBe(true);
    expect(
      isPyodideWorkerResponse({ id: 1, op: "runCode", ok: true, stdout: "", error: "Traceback" }),
    ).toBe(true);
  });

  test("accepts error responses", () => {
    expect(isPyodideWorkerResponse({ id: 1, ok: false, error: "worker crashed" })).toBe(true);
  });

  test("rejects malformed responses", () => {
    expect(isPyodideWorkerResponse(null)).toBe(false);
    expect(isPyodideWorkerResponse({})).toBe(false);
    expect(isPyodideWorkerResponse({ id: 1, ok: true })).toBe(false);
    expect(isPyodideWorkerResponse({ id: 1, op: "runTests", ok: true })).toBe(false);
    expect(
      isPyodideWorkerResponse({ id: 1, op: "runCode", ok: true, stdout: 5, error: null }),
    ).toBe(false);
    expect(isPyodideWorkerResponse({ id: 1, ok: false, error: 5 })).toBe(false);
    expect(isPyodideWorkerResponse({ id: "1", ok: false, error: "x" })).toBe(false);
  });
});

describe("isWorkerStatusMessage", () => {
  test("accepts loading, ready and error", () => {
    expect(isWorkerStatusMessage({ type: "status", status: "loading" })).toBe(true);
    expect(isWorkerStatusMessage({ type: "status", status: "ready", error: null })).toBe(true);
    expect(isWorkerStatusMessage({ type: "status", status: "error", error: "nope" })).toBe(true);
  });

  test("rejects everything else", () => {
    expect(isWorkerStatusMessage(null)).toBe(false);
    expect(isWorkerStatusMessage({ type: "status" })).toBe(false);
    expect(isWorkerStatusMessage({ type: "status", status: "done" })).toBe(false);
    expect(isWorkerStatusMessage({ type: "log", status: "ready" })).toBe(false);
    expect(isWorkerStatusMessage({ type: "status", status: "error", error: 5 })).toBe(false);
  });
});

describe("isWorkerHandle", () => {
  test("accepts a well-formed worker handle", () => {
    const handle = {
      kind: WORKER_HANDLE_KIND,
      runTests: async () => [],
      runCode: async () => ({ stdout: "", error: null }),
      dispose: () => {},
    };
    expect(isWorkerHandle(handle)).toBe(true);
  });

  test("rejects raw Pyodide instances and junk", () => {
    expect(isWorkerHandle(null)).toBe(false);
    expect(isWorkerHandle(undefined)).toBe(false);
    expect(isWorkerHandle("worker")).toBe(false);
    expect(isWorkerHandle({})).toBe(false);
    expect(isWorkerHandle({ kind: WORKER_HANDLE_KIND })).toBe(false);
    expect(
      isWorkerHandle({ kind: WORKER_HANDLE_KIND, runTests: async () => [] }),
    ).toBe(false);
    expect(isWorkerHandle({ runPythonAsync: async () => "" })).toBe(false);
  });
});
