"use client";

import { useRef, useState } from "react";
import { loadPyodideOnce, runCode } from "@/lib/pyodide";

const DEFAULT_CODE = `def matmul(a, b):
    rows = len(a)
    inner = len(b)
    cols = len(b[0])
    result = [[0] * cols for _ in range(rows)]
    for i in range(rows):
        for k in range(inner):
            for j in range(cols):
                result[i][j] += a[i][k] * b[k][j]
    return result


A = [[1, 2, 3], [4, 5, 6]]
B = [[7, 8], [9, 10], [11, 12]]
for row in matmul(A, B):
    print(row)
`;

type PyStatus = "idle" | "loading" | "ready" | "error";

export function Playground() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [stdout, setStdout] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [pyStatus, setPyStatus] = useState<PyStatus>("idle");

  const pyRef = useRef<any>(null);

  const handleRun = async () => {
    if (running) return;
    setRunning(true);
    setHasRun(true);
    setStdout("");
    setError(null);

    try {
      let py = pyRef.current;
      if (!py) {
        setPyStatus("loading");
        py = await loadPyodideOnce();
        pyRef.current = py;
        setPyStatus("ready");
      }
      const result = await runCode(py, code);
      setStdout(result.stdout);
      setError(result.error);
    } catch (e: any) {
      setPyStatus("error");
      setError(e?.message || String(e));
    } finally {
      setRunning(false);
    }
  };

  const handleClear = () => {
    setCode("");
    setStdout("");
    setError(null);
    setHasRun(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = code.slice(0, start) + "    " + code.slice(end);
      setCode(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 4;
      });
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      void handleRun();
    }
  };

  return (
    <section
      id="playground"
      className="mx-auto w-full max-w-6xl scroll-mt-16 px-4 py-10 sm:px-6 sm:py-14"
    >
      <div className="overflow-hidden rounded-lg border border-hairline bg-canvas-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline px-4 py-2.5 sm:px-5">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <label
              htmlFor="playground-code"
              className="text-xs font-medium text-body-mid"
            >
              Code
            </label>
            <span className="text-[11px] text-mute">
              Runs locally — nothing leaves your device.
            </span>
          </div>
          <span className="font-mono text-[10px] text-mute">
            Ctrl/⌘+Enter to run
          </span>
        </div>

        <textarea
          id="playground-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          aria-label="Python code"
          className="df-code-editor df-scroll min-h-[200px] w-full resize-y bg-canvas px-4 py-4 font-mono text-ink focus:outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent sm:px-5"
        />

        <div className="flex flex-wrap items-center gap-2 border-t border-hairline px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={handleRun}
            disabled={running}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-canvas transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50 sm:min-h-0"
          >
            {running ? (
              <>
                <span
                  className="df-spin h-3 w-3 rounded-full border-2 border-canvas/40 border-t-canvas"
                  aria-hidden
                />
                {pyStatus === "loading" ? "Loading Python…" : "Running…"}
              </>
            ) : (
              <>
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 11 11"
                  fill="none"
                  aria-hidden
                >
                  <path d="M2 1.5l7 4-7 4z" fill="currentColor" />
                </svg>
                Run
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={running}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50 sm:min-h-0"
          >
            Clear
          </button>
          <div
            role="status"
            aria-live="polite"
            className="ml-auto flex items-center gap-2 text-[11px] text-body-mid"
          >
            {pyStatus === "loading" && (
              <>
                <span
                  className="df-spin h-3 w-3 rounded-full border-2 border-hairline border-t-accent"
                  aria-hidden
                />
                Loading Python…
              </>
            )}
            {pyStatus === "ready" && (
              <>
                <span
                  className="h-1.5 w-1.5 rounded-full bg-accent"
                  aria-hidden
                />
                Ready
              </>
            )}
            {pyStatus === "error" && (
              <span className="text-error">Pyodide failed to load</span>
            )}
          </div>
        </div>

        <div className="border-t border-hairline bg-canvas">
          <div className="flex items-center justify-between px-4 py-2 sm:px-5">
            <span className="text-xs font-medium text-body-mid">Output</span>
          </div>
          <pre
            aria-live="polite"
            aria-label="Output"
            className="df-scroll max-h-72 min-h-[84px] overflow-auto whitespace-pre-wrap break-words px-4 pb-4 font-mono text-xs leading-relaxed sm:px-5"
          >
            {running ? (
              <span className="flex items-center gap-2 text-body-mid">
                <span
                  className="df-spin h-3 w-3 rounded-full border-2 border-hairline border-t-accent"
                  aria-hidden
                />
                {pyStatus === "loading" ? "Loading Python…" : "Running…"}
              </span>
            ) : !hasRun ? (
              <span className="text-mute">
                Press Run to execute your code. Output appears here.
              </span>
            ) : (
              <>
                {stdout && <span className="text-body">{stdout}</span>}
                {error && (
                  <span className="text-error">
                    {stdout && !stdout.endsWith("\n") ? "\n" : ""}
                    {error}
                  </span>
                )}
                {!stdout && !error && (
                  <span className="text-mute">No output.</span>
                )}
              </>
            )}
          </pre>
        </div>
      </div>
    </section>
  );
}
