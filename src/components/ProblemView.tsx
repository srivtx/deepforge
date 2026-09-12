"use client";

import { useEffect, useRef, useState } from "react";
import type { Problem } from "@/types/problem";
import { cn, clipRepr, difficultyClasses } from "@/lib/utils";
import { loadPyodideOnce, runTests, type TestResult } from "@/lib/pyodide";
import {
  getProblemProgress,
  markOpened,
  markSolved,
  saveCode,
} from "@/lib/progress";

interface ProblemViewProps {
  problem: Problem;
  onClose: () => void;
  onProgressChange?: () => void;
}

type PyStatus = "idle" | "loading" | "ready" | "error";

export function ProblemView({
  problem,
  onClose,
  onProgressChange,
}: ProblemViewProps) {
  const initialCode =
    getProblemProgress(problem.id).savedCode || problem.starterCode;

  const [code, setCode] = useState(initialCode);
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [running, setRunning] = useState(false);
  const [pyStatus, setPyStatus] = useState<PyStatus>("idle");
  const [pyError, setPyError] = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const pyRef = useRef<any>(null);

  // Mark opened on mount; lock body scroll. Re-runs only when the problem
  // changes — `code` here is the initial code, which is fine because this
  // effect is meant to fire on problem switch, not on every keystroke.
  useEffect(() => {
    markOpened(problem.id, code);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [problem.id]);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const runCode = async () => {
    setRunning(true);
    setResults(null);
    try {
      if (!pyRef.current) {
        setPyStatus("loading");
        setPyError(null);
        const py = await loadPyodideOnce();
        pyRef.current = py;
        setPyStatus("ready");
      }
      const r = await runTests(pyRef.current, code, problem.testCases);
      setResults(r);
      const allPass = r.length > 0 && r.every((x) => x.ok);
      if (allPass) {
        markSolved(problem.id);
      }
      onProgressChange?.();
    } catch (e: any) {
      setPyStatus("error");
      setPyError(e?.message || String(e));
      setResults([
        {
          ok: false,
          actual: null,
          expected: "",
          error: e?.message || String(e),
        },
      ]);
    } finally {
      setRunning(false);
    }
  };

  const handleEditorKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = code.slice(0, start) + "    " + code.slice(end);
      setCode(next);
      saveCode(problem.id, next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 4;
      });
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      void runCode();
    }
  };

  const onCodeChange = (v: string) => {
    setCode(v);
    saveCode(problem.id, v);
  };

  const reset = () => {
    setCode(problem.starterCode);
    setResults(null);
    setShowSolution(false);
    saveCode(problem.id, problem.starterCode);
    onProgressChange?.();
  };

  const allPass =
    results !== null && results.length > 0 && results.every((r) => r.ok);
  const passCount = results !== null ? results.filter((r) => r.ok).length : 0;

  return (
    <div
      className="df-fade-in fixed inset-0 z-50 flex items-stretch justify-center bg-canvas/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Problem: ${problem.title}`}
    >
      <div className="flex h-full w-full flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-hairline px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="font-mono text-[11px] text-mute">
              {problem.id}
            </span>
            <span className="truncate text-sm font-semibold text-ink">
              {problem.title}
            </span>
            <span className="hidden shrink-0 text-xs text-body-mid sm:inline">
              {problem.category}
            </span>
            <span
              className={cn(
                "shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
                difficultyClasses(problem.difficulty),
              )}
            >
              {problem.difficulty}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-hairline text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden
            >
              <path
                d="M2 2l10 10M12 2L2 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Body — two columns on desktop, single scroll on mobile */}
        <div className="df-scroll flex-1 overflow-y-auto">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-px bg-hairline lg:grid-cols-2">
            {/* Left: description */}
            <div className="bg-canvas px-4 py-5 sm:px-6 sm:py-6">
              <h3 className="mb-2 text-xs font-medium text-body-mid">
                Problem
              </h3>
              <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-body">
                {problem.description}
              </pre>

              {problem.hint && (
                <div className="mt-5">
                  <button
                    onClick={() => setShowHint((v) => !v)}
                    className="text-xs text-accent transition-opacity hover:opacity-80"
                  >
                    {showHint ? "Hide hint" : "Show hint"}
                  </button>
                  {showHint && (
                    <p className="mt-2 rounded-md border border-hairline bg-canvas-card p-3 text-xs leading-relaxed text-body">
                      {problem.hint}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-5">
                <h3 className="mb-2 text-xs font-medium text-body-mid">
                  Test cases
                </h3>
                <div className="space-y-2">
                  {problem.testCases.map((tc, i) => (
                    <div
                      key={i}
                      className="rounded-md border border-hairline bg-canvas-card p-2.5"
                    >
                      <div className="mb-1 font-mono text-[10px] text-mute">
                        case {i + 1}
                      </div>
                      <div className="font-mono text-xs text-body">
                        <span className="text-body-mid">in:</span>{" "}
                        {clipRepr(JSON.stringify(tc.input), 160)}
                      </div>
                      <div className="font-mono text-xs text-body">
                        <span className="text-body-mid">expected:</span>{" "}
                        {clipRepr(JSON.stringify(tc.expected), 160)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {showSolution && (
                <div className="mt-5">
                  <h3 className="mb-2 text-xs font-medium text-body-mid">
                    Reference solution
                  </h3>
                  <pre className="overflow-x-auto rounded-md border border-hairline bg-canvas-card p-3 font-mono text-xs leading-relaxed text-body">
                    {problem.solution}
                  </pre>
                </div>
              )}
            </div>

            {/* Right: editor + results */}
            <div className="flex flex-col bg-canvas">
              <div className="flex items-center justify-between border-b border-hairline px-4 py-2 sm:px-6">
                <span className="text-xs font-medium text-body-mid">
                  Solution
                </span>
                <span className="font-mono text-[10px] text-mute">
                  ⌘+Enter to run
                </span>
              </div>
              <textarea
                value={code}
                onChange={(e) => onCodeChange(e.target.value)}
                onKeyDown={handleEditorKey}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                className="df-code-editor df-scroll min-h-[260px] flex-1 resize-none bg-canvas px-4 py-4 text-ink focus:outline-none sm:px-6"
                aria-label="Code editor"
              />

              {/* Action bar */}
              <div className="flex flex-wrap items-center gap-2 border-t border-hairline px-4 py-3 sm:px-6">
                <button
                  onClick={runCode}
                  disabled={running}
                  className="inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-canvas transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {running ? (
                    <>
                      <span className="df-spin h-3 w-3 rounded-full border-2 border-canvas/40 border-t-canvas" />
                      {pyStatus === "loading"
                        ? "Loading Python…"
                        : "Running…"}
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
                  onClick={reset}
                  disabled={running}
                  className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink disabled:opacity-50"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowSolution((v) => !v)}
                  className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink"
                >
                  {showSolution ? "Hide solution" : "Show solution"}
                </button>
                {pyStatus === "error" && (
                  <span className="text-[11px] text-error">
                    Pyodide failed to load
                  </span>
                )}
              </div>

              {/* Results */}
              <div className="border-t border-hairline px-4 py-4 sm:px-6">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-medium text-body-mid">
                    Results
                  </h3>
                  {results !== null && (
                    <span
                      className={cn(
                        "font-mono text-xs",
                        allPass ? "text-accent" : "text-body-mid",
                      )}
                    >
                      {passCount}/{results.length} passed
                      {allPass && " · all green"}
                    </span>
                  )}
                </div>

                {results === null ? (
                  <p className="text-xs text-mute">
                    Press Run to execute your code against{" "}
                    {problem.testCases.length} test case
                    {problem.testCases.length === 1 ? "" : "s"}.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {pyError && (
                      <div className="rounded-md border border-error/40 bg-error/5 p-2.5">
                        <div className="mb-1 text-[10px] font-medium text-error">
                          Pyodide error
                        </div>
                        <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-[11px] text-body">
                          {pyError}
                        </pre>
                      </div>
                    )}
                    {results.map((r, i) => (
                      <div
                        key={i}
                        className={cn(
                          "rounded-md border p-2.5",
                          r.ok
                            ? "border-accent/40 bg-accent/5"
                            : "border-error/40 bg-error/5",
                        )}
                      >
                        <div className="mb-1 flex items-center gap-2">
                          <span
                            className={cn(
                              "flex h-4 w-4 items-center justify-center rounded-full",
                              r.ok
                                ? "bg-accent/15 text-accent"
                                : "bg-error/15 text-error",
                            )}
                          >
                            {r.ok ? (
                              <svg
                                width="10"
                                height="10"
                                viewBox="0 0 10 10"
                                fill="none"
                                aria-hidden
                              >
                                <path
                                  d="M2 5l2 2 4-4"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            ) : (
                              <svg
                                width="10"
                                height="10"
                                viewBox="0 0 10 10"
                                fill="none"
                                aria-hidden
                              >
                                <path
                                  d="M2 2l6 6M8 2L2 8"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                />
                              </svg>
                            )}
                          </span>
                          <span className="font-mono text-[10px] text-mute">
                            case {i + 1}
                          </span>
                          <span
                            className={cn(
                              "text-[10px] font-medium",
                              r.ok ? "text-accent" : "text-error",
                            )}
                          >
                            {r.ok ? "passed" : "failed"}
                          </span>
                        </div>
                        {r.error ? (
                          <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-[11px] text-error">
                            {r.error}
                          </pre>
                        ) : (
                          <div className="space-y-1">
                            <div className="font-mono text-[11px] text-body">
                              <span className="text-body-mid">actual: </span>
                              {clipRepr(r.actual, 240)}
                            </div>
                            {!r.ok && (
                              <div className="font-mono text-[11px] text-body-mid">
                                <span>expected: </span>
                                {clipRepr(r.expected, 240)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
