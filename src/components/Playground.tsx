"use client";

import { applyEditorEdit } from "@/lib/editorInput";
import { useRef, useState } from "react";
import { loadPyodideOnce, runCode } from "@/lib/pyodide";
import { cn } from "@/lib/utils";

const MATRIX_MULTIPLY = `def matmul(a, b):
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

const SOFTMAX = `import math


def softmax(values):
    exps = [math.exp(v) for v in values]
    total = sum(exps)
    return [e / total for e in exps]


probs = softmax([2.0, 1.0, 0.1])
print([round(p, 4) for p in probs])
print("sum:", round(sum(probs), 6))
`;

const GRADIENT_STEP = `def grad_step(weights, grads, lr):
    return [w - lr * g for w, g in zip(weights, grads)]


weights = [1.0, -2.0, 0.5]
grads = [0.2, -0.4, 0.1]
print(grad_step(weights, grads, 0.1))
`;

const HELLO_TENSORS = `def zeros(shape):
    if len(shape) == 1:
        return [0.0] * shape[0]
    return [zeros(shape[1:]) for _ in range(shape[0])]


tensor = zeros((2, 3))
for row in tensor:
    print(row)
print("shape:", len(tensor), "x", len(tensor[0]))
`;

const EXAMPLES = [
  { label: "Matrix multiply", code: MATRIX_MULTIPLY },
  { label: "Softmax", code: SOFTMAX },
  { label: "Gradient step", code: GRADIENT_STEP },
  { label: "Hello, tensors", code: HELLO_TENSORS },
];

type PyStatus = "idle" | "loading" | "ready" | "error";
type RunState = "idle" | "running" | "success" | "error";

function formatElapsed(ms: number): string {
  return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(2)} s`;
}

function RuntimeChip({ status }: { status: PyStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium",
        status === "ready" && "border-accent/40 bg-accent/5 text-accent",
        status === "error" && "border-error/40 bg-error/5 text-error",
        (status === "idle" || status === "loading") &&
          "border-hairline bg-canvas-soft text-body-mid",
      )}
    >
      {status === "loading" ? (
        <span
          className="df-spin h-2.5 w-2.5 rounded-full border-2 border-hairline border-t-accent"
          aria-hidden
        />
      ) : (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            status === "ready"
              ? "bg-accent"
              : status === "error"
                ? "bg-error"
                : "bg-body-mid",
          )}
          aria-hidden
        />
      )}
      {status === "idle" && "Pyodide not loaded"}
      {status === "loading" && "Pyodide loading…"}
      {status === "ready" && "Pyodide ready"}
      {status === "error" && "Pyodide failed"}
    </span>
  );
}

function RunStatusChip({
  state,
  elapsedMs,
  pyStatus,
}: {
  state: RunState;
  elapsedMs: number | null;
  pyStatus: PyStatus;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium",
        state === "success" && "border-accent/40 bg-accent/5 text-accent",
        state === "error" && "border-error/40 bg-error/5 text-error",
        (state === "idle" || state === "running") &&
          "border-hairline bg-canvas-soft text-body-mid",
      )}
    >
      {state === "running" ? (
        <span
          className="df-spin h-2.5 w-2.5 rounded-full border-2 border-hairline border-t-accent"
          aria-hidden
        />
      ) : (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            state === "success"
              ? "bg-accent"
              : state === "error"
                ? "bg-error"
                : "bg-body-mid",
          )}
          aria-hidden
        />
      )}
      {state === "idle" && "Idle"}
      {state === "running" &&
        (pyStatus === "loading" ? "Loading Python…" : "Running…")}
      {state === "success" &&
        `Success${elapsedMs !== null ? ` · ${formatElapsed(elapsedMs)}` : ""}`}
      {state === "error" &&
        `Error${elapsedMs !== null ? ` · ${formatElapsed(elapsedMs)}` : ""}`}
    </span>
  );
}

export function Playground() {
  const [code, setCode] = useState(MATRIX_MULTIPLY);
  const [stdout, setStdout] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  const [pyStatus, setPyStatus] = useState<PyStatus>("idle");
  const [pyError, setPyError] = useState<string | null>(null);

  const pyRef = useRef<any>(null);
  const runningRef = useRef(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const ensurePyodide = async () => {
    if (pyRef.current) return pyRef.current;
    setPyStatus("loading");
    setPyError(null);
    try {
      const py = await loadPyodideOnce();
      pyRef.current = py;
      setPyStatus("ready");
      return py;
    } catch (e: any) {
      setPyStatus("error");
      setPyError(e?.message || String(e));
      throw e;
    }
  };

  const handleRun = async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    setRunning(true);
    setHasRun(true);
    setStdout("");
    setError(null);
    setElapsedMs(null);

    const startedAt = performance.now();
    try {
      const py = await ensurePyodide();
      const result = await runCode(py, code);
      setStdout(result.stdout);
      setError(result.error);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setElapsedMs(Math.round(performance.now() - startedAt));
      setRunning(false);
      runningRef.current = false;
    }
  };

  const handleRetry = () => {
    pyRef.current = null;
    setPyStatus("idle");
    setPyError(null);
    setError(null);
    void ensurePyodide().catch(() => {});
  };

  const resetOutput = () => {
    setStdout("");
    setError(null);
    setHasRun(false);
    setElapsedMs(null);
  };

  const handleClear = () => {
    setCode("");
    resetOutput();
    editorRef.current?.focus();
  };

  const loadExample = (snippet: string) => {
    setCode(snippet);
    resetOutput();
    editorRef.current?.focus();
  };

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") return;
    const ta = e.currentTarget;
    const edit = applyEditorEdit(
      code,
      ta.selectionStart,
      ta.selectionEnd,
      e.key,
      e.shiftKey,
    );
    if (!edit) return;
    e.preventDefault();
    setCode(edit.value);
    requestAnimationFrame(() => {
      ta.selectionStart = edit.start;
      ta.selectionEnd = edit.end;
    });
  };

  const handleWorkspaceKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      void handleRun();
    }
  };

  const runState: RunState = running
    ? "running"
    : error
      ? "error"
      : hasRun
        ? "success"
        : "idle";

  return (
    <section
      id="playground"
      onKeyDown={handleWorkspaceKeyDown}
      className="mx-auto w-full max-w-6xl scroll-mt-16 px-4 py-8 sm:px-6 sm:py-12"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-body-mid">Examples</span>
        <span className="text-[11px] text-mute">
          Loads over the current code
        </span>
        {EXAMPLES.map((example) => (
          <button
            key={example.label}
            type="button"
            onClick={() => loadExample(example.code)}
            disabled={running}
            className="inline-flex min-h-11 items-center rounded-full border border-hairline bg-canvas-card px-3 text-xs text-body transition-colors hover:border-accent/40 hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 disabled:opacity-50 sm:min-h-0 sm:py-1"
          >
            {example.label}
          </button>
        ))}
        <button
          type="button"
          onClick={handleClear}
          disabled={running}
          className="inline-flex min-h-11 items-center rounded-full border border-hairline px-3 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 disabled:opacity-50 sm:ml-auto sm:min-h-0 sm:py-1"
        >
          Clear
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-hairline bg-canvas-card">
          <div className="flex flex-wrap items-center gap-2 border-b border-hairline px-4 py-2.5 sm:px-5">
            <label
              htmlFor="playground-code"
              className="text-xs font-medium text-body-mid"
            >
              Python
            </label>
            <RuntimeChip status={pyStatus} />
          </div>

          {pyStatus === "error" && (
            <div
              role="alert"
              className="border-b border-error/40 bg-error/5 px-4 py-2.5 sm:px-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-error">
                    Pyodide failed to load
                  </p>
                  {pyError && (
                    <p className="mt-0.5 break-words font-mono text-[11px] text-body-mid">
                      {pyError}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="inline-flex min-h-11 shrink-0 items-center rounded-lg border border-error/40 px-3 text-xs font-medium text-error transition-colors hover:bg-error/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0 sm:py-1.5"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          <textarea
            id="playground-code"
            ref={editorRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleEditorKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            placeholder="Write some Python…"
            aria-label="Python code"
            className="df-code-editor df-scroll min-h-[240px] w-full flex-1 resize-y bg-canvas px-4 py-4 text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-accent/40 sm:px-5 lg:min-h-[320px]"
          />
        </div>

        <div className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-hairline bg-canvas-card">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline px-4 py-2.5 sm:px-5">
            <span className="text-xs font-medium text-body-mid">Output</span>
            <RunStatusChip
              state={runState}
              elapsedMs={elapsedMs}
              pyStatus={pyStatus}
            />
          </div>

          <div
            aria-live="polite"
            aria-label="Output"
            className="df-scroll flex h-[240px] flex-col overflow-y-auto bg-canvas px-4 py-4 font-mono text-xs leading-relaxed sm:px-5 lg:h-[320px]"
          >
            {running ? (
              <span className="m-auto flex items-center gap-2 text-body-mid">
                <span
                  className="df-spin h-3 w-3 rounded-full border-2 border-hairline border-t-accent"
                  aria-hidden
                />
                {pyStatus === "loading" ? "Loading Python…" : "Running…"}
              </span>
            ) : !hasRun ? (
              <span className="m-auto px-4 text-center text-mute">
                Press Run to execute your snippet.
              </span>
            ) : (
              <>
                {stdout && (
                  <pre className="whitespace-pre-wrap break-words text-body">
                    {stdout}
                  </pre>
                )}
                {error && (
                  <div
                    className={cn(
                      "rounded-md border border-error/40 bg-error/5 p-2.5",
                      stdout && "mt-3",
                    )}
                  >
                    <div className="mb-1 font-sans text-[10px] font-medium text-error">
                      {pyStatus === "error" ? "Pyodide error" : "Runtime error"}
                    </div>
                    <pre className="whitespace-pre-wrap break-words text-error">
                      {error}
                    </pre>
                  </div>
                )}
                {!stdout && !error && (
                  <span className="m-auto text-mute">No output.</span>
                )}
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-hairline px-4 py-3 sm:px-5">
            <button
              type="button"
              onClick={() => void handleRun()}
              disabled={running}
              aria-busy={running}
              aria-keyshortcuts="Control+Enter Meta+Enter"
              title="Ctrl or Command + Enter"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-accent/40 bg-accent/5 px-4 text-sm font-medium text-accent transition-colors hover:bg-accent/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-36"
            >
              {running ? (
                <>
                  <span
                    className="df-spin h-3 w-3 rounded-full border-2 border-accent/30 border-t-accent"
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
                  <span
                    className="font-mono text-[10px] text-accent/70"
                    aria-hidden
                  >
                    ⌘↵
                  </span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={resetOutput}
              disabled={running || !hasRun}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-hairline px-4 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50 sm:w-auto"
            >
              Clear output
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
