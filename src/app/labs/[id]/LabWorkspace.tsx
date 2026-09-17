"use client";

import { applyEditorEdit } from "@/lib/editorInput";
import { useEffect, useRef, useState } from "react";
import type { Lab } from "@/data/labs";
import { cn } from "@/lib/utils";
import {
  LAB_CHANGE_EVENT,
  getLabBest,
  meetsTarget,
  metricLabel,
  scoreLab,
  setLabBest,
  type LabRecord,
  type LabRunResult,
} from "@/lib/labs";
import { formatClock, formatScore } from "@/components/labs/helpers";

export function LabWorkspace({ lab }: { lab: Lab }) {
  const [started, setStarted] = useState(false);
  const [code, setCode] = useState(lab.starterCode);
  const [elapsed, setElapsed] = useState(0);
  const [expired, setExpired] = useState(false);
  const [running, setRunning] = useState(false);
  const [loadingPython, setLoadingPython] = useState(false);
  const [result, setResult] = useState<LabRunResult | null>(null);
  const [best, setBest] = useState<LabRecord | null>(null);

  const startAtRef = useRef(0);
  const pyLoadedRef = useRef(false);
  const runnerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const load = () => setBest(getLabBest(lab.id));
    load();
    window.addEventListener(LAB_CHANGE_EVENT, load);
    return () => window.removeEventListener(LAB_CHANGE_EVENT, load);
  }, [lab.id]);

  useEffect(() => {
    if (!started || expired) return;
    const limit = lab.timeLimitSeconds;
    const tick = () => {
      const next = Math.floor((Date.now() - startAtRef.current) / 1000);
      if (next >= limit) {
        setElapsed(limit);
        setExpired(true);
      } else {
        setElapsed(next);
      }
    };
    tick();
    const id = window.setInterval(tick, 500);
    return () => window.clearInterval(id);
  }, [started, expired, lab.timeLimitSeconds]);

  const startRun = () => {
    startAtRef.current = Date.now();
    setStarted(true);
    setCode(lab.starterCode);
    setElapsed(0);
    setExpired(false);
    setResult(null);
    setBest(getLabBest(lab.id));
    requestAnimationFrame(() => {
      runnerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const runLab = async () => {
    if (!started || running || expired) return;
    setRunning(true);
    setResult(null);
    if (!pyLoadedRef.current) setLoadingPython(true);
    const outcome = await scoreLab(lab, code);
    pyLoadedRef.current = true;
    setLoadingPython(false);
    setResult(outcome);
    if (outcome.score !== null) {
      setBest(setLabBest(lab.id, outcome.score));
    }
    setRunning(false);
  };

  const handleEditorKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!((e.metaKey || e.ctrlKey) && e.key === "Enter")) {
      const ta = e.currentTarget;
      const edit = applyEditorEdit(
        code,
        ta.selectionStart,
        ta.selectionEnd,
        e.key,
        e.shiftKey,
      );
      if (edit) {
        e.preventDefault();
        setCode(edit.value);
        requestAnimationFrame(() => {
          ta.selectionStart = edit.start;
          ta.selectionEnd = edit.end;
        });
      }
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      void runLab();
    }
  };

  const remaining = Math.max(0, lab.timeLimitSeconds - elapsed);
  const warning = started && !expired && remaining <= 60;
  const runScore = result?.score ?? null;
  const passed = runScore !== null && meetsTarget(lab, runScore);

  return (
    <section
      ref={runnerRef}
      id="lab-runner"
      aria-label="Lab workspace"
      className="scroll-mt-16 overflow-hidden rounded-lg border border-hairline bg-canvas-card"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-hairline px-4 py-3 sm:px-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-sm font-semibold text-ink">
              Timed run
            </h2>
            <span className="shrink-0 rounded-full border border-hairline px-1.5 py-0.5 text-[10px] text-mute">
              {Math.round(lab.timeLimitSeconds / 60)} min limit
            </span>
            {expired && (
              <span className="shrink-0 rounded-full border border-error/40 bg-error/5 px-1.5 py-0.5 text-[10px] text-error">
                Expired
              </span>
            )}
          </div>
          <p className="text-xs text-body-mid">
            {lab.points} points
            {best !== null && best.best !== null
              ? ` · best ${formatScore(lab, best.best)} in ${best.attempts} ${
                  best.attempts === 1 ? "attempt" : "attempts"
                }`
              : ""}
          </p>
        </div>
        {started ? (
          <span
            className={cn(
              "font-mono text-lg",
              expired ? "text-error" : warning ? "text-warning" : "text-ink",
            )}
            aria-label="Time remaining"
          >
            {formatClock(remaining)}
            <span className="text-xs text-mute">
              {" "}
              / {formatClock(lab.timeLimitSeconds)}
            </span>
          </span>
        ) : (
          <span className="font-mono text-xs text-mute">
            not started · {formatClock(lab.timeLimitSeconds)}
          </span>
        )}
      </div>

      {!started ? (
        <div className="flex flex-col gap-4 px-4 py-5 sm:px-6">
          <p className="max-w-2xl text-sm leading-relaxed text-body">
            The clock starts when you press start. Your{" "}
            <code className="font-mono text-xs text-body">
              predict(train_X, train_y, test_X)
            </code>{" "}
            is then scored on {lab.testData.features.length} held-out rows
            within {Math.round(lab.timeLimitSeconds / 60)}{" "}
            {Math.round(lab.timeLimitSeconds / 60) === 1
              ? "minute"
              : "minutes"}
            .
          </p>
          <div className="overflow-hidden rounded-lg border border-hairline bg-canvas">
            <div className="flex items-center justify-between border-b border-hairline px-4 py-2">
              <span className="text-xs font-medium text-body-mid">
                Starter code
              </span>
              <span className="font-mono text-[10px] text-mute">Python</span>
            </div>
            <pre className="df-scroll overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-body">
              <code>{lab.starterCode}</code>
            </pre>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={startRun}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-canvas transition-opacity hover:opacity-90"
            >
              Start timed run
            </button>
            <span className="text-[11px] text-body-mid">
              Tab inserts 4 spaces · ⌘+Enter runs your code
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="flex items-center justify-between border-b border-hairline px-4 py-2 sm:px-6">
            <span className="text-xs font-medium text-body-mid">
              Your code
            </span>
            <span className="font-mono text-[10px] text-mute">
              ⌘+Enter to run
            </span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleEditorKey}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            aria-label="Lab code editor"
            className="df-code-editor df-scroll min-h-[240px] flex-1 resize-none bg-canvas px-4 py-4 text-ink focus:outline-none sm:px-6"
          />

          <div className="flex flex-wrap items-center gap-2 border-t border-hairline px-4 py-3 sm:px-6">
            <button
              type="button"
              onClick={runLab}
              disabled={running || expired}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-canvas transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {running ? (
                <>
                  <span className="df-spin h-3 w-3 rounded-full border-2 border-canvas/40 border-t-canvas" />
                  {loadingPython ? "Loading Python…" : "Scoring…"}
                </>
              ) : (
                "Run against hidden test"
              )}
            </button>
            <button
              type="button"
              onClick={startRun}
              disabled={running}
              className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink disabled:opacity-50"
            >
              Reset run
            </button>
            {expired && (
              <span className="text-[11px] text-error">
                Time&apos;s up — reset to try again
              </span>
            )}
          </div>

          <div className="border-t border-hairline px-4 py-4 sm:px-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-medium text-body-mid">Result</h3>
              {best !== null && best.best !== null && (
                <span className="font-mono text-xs text-body-mid">
                  Best {formatScore(lab, best.best)} · {best.attempts}{" "}
                  {best.attempts === 1 ? "attempt" : "attempts"}
                </span>
              )}
            </div>

            {result === null ? (
              <p className="py-2 text-center text-xs text-mute">
                Press run to score your predict() on{" "}
                {lab.testData.features.length} held-out rows.
              </p>
            ) : result.error ? (
              <div className="rounded-md border border-error/40 bg-error/5 p-2.5">
                <div className="mb-1 text-[10px] font-medium text-error">
                  Error
                </div>
                <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-[11px] text-body">
                  {result.error}
                </pre>
              </div>
            ) : runScore !== null ? (
              <div
                className={cn(
                  "df-slide-up rounded-md border p-3",
                  passed
                    ? "border-accent/40 bg-accent/5"
                    : "border-warning/40 bg-warning/5",
                )}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <span className="text-xs text-body-mid">
                      {metricLabel(lab.metric)}
                    </span>
                    <div
                      className={cn(
                        "font-mono text-2xl",
                        passed ? "text-accent" : "text-warning",
                      )}
                    >
                      {formatScore(lab, runScore)}
                    </div>
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium",
                      passed ? "text-accent" : "text-warning",
                    )}
                  >
                    {passed ? "Target met" : "Target not met"}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-md border border-hairline bg-canvas p-2">
                    <div className="text-[10px] text-body-mid">Baseline</div>
                    <div className="font-mono text-sm text-body">
                      {formatScore(lab, lab.baseline)}
                    </div>
                  </div>
                  <div className="rounded-md border border-hairline bg-canvas p-2">
                    <div className="text-[10px] text-body-mid">Target</div>
                    <div className="font-mono text-sm text-body">
                      {formatScore(lab, lab.target)}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="py-2 text-center text-xs text-mute">
                No score returned.
              </p>
            )}

            {result?.stdout ? (
              <div className="mt-3">
                <div className="mb-1 text-[10px] font-medium text-body-mid">
                  Output
                </div>
                <pre className="df-scroll max-h-40 overflow-auto whitespace-pre-wrap rounded-md border border-hairline bg-canvas p-2.5 font-mono text-[11px] text-body">
                  {result.stdout}
                </pre>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}
