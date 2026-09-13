"use client";

import { useEffect, useRef, useState } from "react";
import { LABS, type Lab } from "@/data/labs";
import { cn, difficultyClasses } from "@/lib/utils";
import {
  LAB_CHANGE_EVENT,
  getLabBest,
  getLabRecords,
  meetsTarget,
  metricLabel,
  scoreLab,
  setLabBest,
  type LabRecord,
  type LabRunResult,
} from "@/lib/labs";

function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatScore(lab: Lab, value: number): string {
  return lab.metric === "mse" ? value.toFixed(2) : value.toFixed(3);
}

export function Labs() {
  const [records, setRecords] = useState<Record<string, LabRecord>>({});
  const [activeLab, setActiveLab] = useState<Lab | null>(null);
  const [code, setCode] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [expired, setExpired] = useState(false);
  const [running, setRunning] = useState(false);
  const [loadingPython, setLoadingPython] = useState(false);
  const [result, setResult] = useState<LabRunResult | null>(null);
  const [best, setBest] = useState<LabRecord | null>(null);
  const [showHint, setShowHint] = useState(false);

  const startAtRef = useRef(0);
  const pyLoadedRef = useRef(false);

  useEffect(() => {
    const load = () => setRecords(getLabRecords());
    load();
    window.addEventListener(LAB_CHANGE_EVENT, load);
    return () => window.removeEventListener(LAB_CHANGE_EVENT, load);
  }, []);

  useEffect(() => {
    if (!activeLab) return;
    const el = document.getElementById("lab-runner");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeLab]);

  useEffect(() => {
    if (!activeLab || expired) return;
    const limit = activeLab.timeLimitSeconds;
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
  }, [activeLab, expired]);

  const openLab = (lab: Lab) => {
    startAtRef.current = Date.now();
    setActiveLab(lab);
    setCode(lab.starterCode);
    setElapsed(0);
    setExpired(false);
    setResult(null);
    setShowHint(false);
    setBest(getLabBest(lab.id));
  };

  const closeLab = () => {
    setActiveLab(null);
    setResult(null);
    setBest(null);
  };

  const resetLab = () => {
    if (!activeLab) return;
    startAtRef.current = Date.now();
    setCode(activeLab.starterCode);
    setElapsed(0);
    setExpired(false);
    setResult(null);
  };

  const runLab = async () => {
    if (!activeLab || running || expired) return;
    setRunning(true);
    setResult(null);
    if (!pyLoadedRef.current) setLoadingPython(true);
    const outcome = await scoreLab(activeLab, code);
    pyLoadedRef.current = true;
    setLoadingPython(false);
    setResult(outcome);
    if (outcome.score !== null) {
      setBest(setLabBest(activeLab.id, outcome.score));
      setRecords(getLabRecords());
    }
    setRunning(false);
  };

  const handleEditorKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
      void runLab();
    }
  };

  const completed = LABS.filter((lab) => records[lab.id]?.passed).length;
  const runScore = result?.score ?? null;
  const passed =
    activeLab !== null && runScore !== null && meetsTarget(activeLab, runScore);
  const dims = activeLab?.trainData.features[0]?.length ?? 0;

  return (
    <section
      id="labs"
      className="mx-auto max-w-6xl scroll-mt-16 px-4 py-10 sm:px-6 sm:py-14"
    >
      <div className="mb-6">
        <h2 className="text-sm font-medium text-body-mid">
          {LABS.length} challenges · {completed}/{LABS.length} passed
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {LABS.map((lab) => {
          const record = records[lab.id];
          const isActive = activeLab?.id === lab.id;
          return (
            <button
              key={lab.id}
              type="button"
              onClick={() => openLab(lab)}
              aria-expanded={isActive}
              aria-controls="lab-runner"
              className={cn(
                "flex flex-col gap-3 rounded-lg border bg-canvas-card p-4 text-left transition-colors hover:bg-canvas-soft focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent sm:p-5",
                isActive ? "border-accent/60" : "border-hairline",
              )}
            >
              <div className="flex w-full items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-ink">
                    {lab.title}
                  </h3>
                  <p className="text-[11px] text-mute">{lab.category}</p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                    difficultyClasses(lab.difficulty),
                  )}
                >
                  {lab.difficulty}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-body">{lab.blurb}</p>
              <div className="font-mono text-xs text-body-mid">
                {metricLabel(lab.metric)} {formatScore(lab, lab.baseline)} →{" "}
                {formatScore(lab, lab.target)}
                {lab.higherIsBetter ? " ↑" : " ↓"}
              </div>
              <div className="mt-auto flex w-full items-center justify-between gap-3 pt-1">
                <span className="font-mono text-xs text-body-mid">
                  {Math.round(lab.timeLimitSeconds / 60)} min · {lab.points} pts
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                    record?.passed
                      ? "border-accent/40 bg-accent/5 text-accent"
                      : "border-hairline text-body-mid",
                  )}
                >
                  {record?.passed
                    ? "Passed"
                    : record && record.best !== null
                      ? `Best ${formatScore(lab, record.best)}`
                      : "Open"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {activeLab && (
        <div
          id="lab-runner"
          className="df-slide-up mt-4 overflow-hidden rounded-lg border border-hairline bg-canvas-card"
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-hairline px-4 py-3 sm:px-6">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-sm font-semibold text-ink">
                  {activeLab.title}
                </h3>
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
                    difficultyClasses(activeLab.difficulty),
                  )}
                >
                  {activeLab.difficulty}
                </span>
              </div>
              <p className="text-xs text-body-mid">
                {activeLab.category} · {activeLab.points} points
                {best !== null && best.best !== null
                  ? ` · best ${formatScore(activeLab, best.best)} in ${best.attempts} ${
                      best.attempts === 1 ? "attempt" : "attempts"
                    }`
                  : ""}
              </p>
            </div>
            <span
              className={cn(
                "font-mono text-lg",
                expired
                  ? "text-error"
                  : elapsed >= activeLab.timeLimitSeconds - 60
                    ? "text-warning"
                    : "text-ink",
              )}
              aria-label="Elapsed time"
            >
              {formatClock(elapsed)}
              <span className="text-xs text-mute">
                {" "}
                / {formatClock(activeLab.timeLimitSeconds)}
              </span>
            </span>
            <button
              type="button"
              onClick={closeLab}
              className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 gap-px bg-hairline lg:grid-cols-2">
            <div className="bg-canvas-card px-4 py-5 sm:px-6">
              <h4 className="mb-2 text-xs font-medium text-body-mid">
                Constraints
              </h4>
              <ul className="space-y-1.5">
                {activeLab.constraints.map((constraint) => (
                  <li
                    key={constraint}
                    className="flex gap-2 text-xs leading-relaxed text-body"
                  >
                    <span className="text-mute" aria-hidden>
                      ·
                    </span>
                    <span>{constraint}</span>
                  </li>
                ))}
              </ul>

              <h4 className="mt-5 mb-2 text-xs font-medium text-body-mid">
                Dataset
              </h4>
              <div className="rounded-md border border-hairline bg-canvas p-3 font-mono text-xs leading-relaxed text-body">
                <div>
                  train {activeLab.trainData.features.length} rows × {dims}{" "}
                  features
                </div>
                <div>
                  test {activeLab.testData.features.length} rows × {dims} features
                </div>
                <div>
                  {metricLabel(activeLab.metric)} ·{" "}
                  {activeLab.higherIsBetter
                    ? "higher is better"
                    : "lower is better"}
                </div>
              </div>

              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => setShowHint((value) => !value)}
                  className="text-xs text-accent transition-opacity hover:opacity-80"
                >
                  {showHint ? "Hide hint" : "Show hint"}
                </button>
                {showHint && (
                  <p className="mt-2 rounded-md border border-hairline bg-canvas p-3 text-xs leading-relaxed text-body">
                    {activeLab.hint}
                  </p>
                )}
              </div>
            </div>

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
                    "Run lab"
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetLab}
                  disabled={running}
                  className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink disabled:opacity-50"
                >
                  Reset
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
                      Best {formatScore(activeLab, best.best)} ·{" "}
                      {best.attempts}{" "}
                      {best.attempts === 1 ? "attempt" : "attempts"}
                    </span>
                  )}
                </div>

                {result === null ? (
                  <p className="py-2 text-center text-xs text-mute">
                    Press Run lab to score your predict() on{" "}
                    {activeLab.testData.features.length} held-out rows.
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
                          {metricLabel(activeLab.metric)}
                        </span>
                        <div
                          className={cn(
                            "font-mono text-2xl",
                            passed ? "text-accent" : "text-warning",
                          )}
                        >
                          {formatScore(activeLab, runScore)}
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
                        <div className="text-[10px] text-body-mid">
                          Baseline
                        </div>
                        <div className="font-mono text-sm text-body">
                          {formatScore(activeLab, activeLab.baseline)}
                        </div>
                      </div>
                      <div className="rounded-md border border-hairline bg-canvas p-2">
                        <div className="text-[10px] text-body-mid">Target</div>
                        <div className="font-mono text-sm text-body">
                          {formatScore(activeLab, activeLab.target)}
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
          </div>
        </div>
      )}
    </section>
  );
}
