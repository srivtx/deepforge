"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Problem } from "@/types/problem";
import { CONTESTS, type Contest } from "@/data/contests";
import { PROBLEMS } from "@/data/problems";
import { cn, difficultyClasses } from "@/lib/utils";
import { getProgress, type ProgressMap } from "@/lib/progress";
import {
  CONTEST_CHANGE_EVENT,
  getContestResults,
  saveContestResult,
  type ContestResult,
} from "@/lib/contestStore";
import { ProblemView } from "./ProblemView";

const PROGRESS_CHANGE_EVENT = "deepforge:progress-change";

function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function bestResultFor(
  results: ContestResult[],
  contestId: string,
): ContestResult | null {
  let best: ContestResult | null = null;
  for (const r of results) {
    if (r.contestId !== contestId) continue;
    if (
      !best ||
      r.score > best.score ||
      (r.score === best.score && r.durationSeconds < best.durationSeconds)
    ) {
      best = r;
    }
  }
  return best;
}

export function Contests() {
  const [results, setResults] = useState<ContestResult[]>([]);
  const [progress, setProgress] = useState<ProgressMap>({});
  const [activeContest, setActiveContest] = useState<Contest | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [activeProblem, setActiveProblem] = useState<Problem | null>(null);
  const [summary, setSummary] = useState<ContestResult | null>(null);
  const [summaryReason, setSummaryReason] = useState<"timeout" | "manual" | null>(
    null,
  );

  const startAtRef = useRef(0);
  const endAtRef = useRef(0);
  const finishingRef = useRef(false);

  const problemMap = useMemo(
    () => new Map(PROBLEMS.map((p) => [p.id, p])),
    [],
  );

  // Load stored results and progress, then stay in sync with every writer.
  useEffect(() => {
    const load = () => {
      setResults(getContestResults());
      setProgress(getProgress());
    };
    load();
    window.addEventListener(PROGRESS_CHANGE_EVENT, load);
    window.addEventListener(CONTEST_CHANGE_EVENT, load);
    return () => {
      window.removeEventListener(PROGRESS_CHANGE_EVENT, load);
      window.removeEventListener(CONTEST_CHANGE_EVENT, load);
    };
  }, []);

  // Countdown for the active contest. Auto-ends at zero.
  useEffect(() => {
    if (!activeContest || summary) return;
    const tick = () => {
      const left = Math.max(
        0,
        Math.ceil((endAtRef.current - Date.now()) / 1000),
      );
      setRemaining(left);
      if (left <= 0) finishContest("timeout");
    };
    tick();
    const id = window.setInterval(tick, 500);
    return () => window.clearInterval(id);
  }, [activeContest, summary]);

  // Escape closes the overlay, unless ProblemView is stacked on top of it.
  useEffect(() => {
    if (!activeContest) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !activeProblem) closeOverlay();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeContest, activeProblem]);

  const startContest = (contest: Contest) => {
    const now = Date.now();
    startAtRef.current = now;
    endAtRef.current = now + contest.durationMinutes * 60 * 1000;
    finishingRef.current = false;
    setRemaining(contest.durationMinutes * 60);
    setSummary(null);
    setSummaryReason(null);
    setActiveProblem(null);
    setActiveContest(contest);
  };

  function finishContest(reason: "timeout" | "manual") {
    if (finishingRef.current) return;
    const contest = activeContest;
    if (!contest) return;
    finishingRef.current = true;
    const totalSeconds = contest.durationMinutes * 60;
    const elapsed = Math.round((Date.now() - startAtRef.current) / 1000);
    const used = Math.min(Math.max(0, elapsed), totalSeconds);
    const result = saveContestResult(contest, used);
    setSummary(result);
    setSummaryReason(reason);
    setRemaining(Math.max(0, totalSeconds - used));
    setResults(getContestResults());
    setActiveProblem(null);
  }

  function closeOverlay() {
    finishingRef.current = false;
    setActiveContest(null);
    setActiveProblem(null);
    setSummary(null);
    setSummaryReason(null);
  }

  const solvedCount = activeContest
    ? activeContest.problemIds.filter((id) => progress[id]?.solved).length
    : 0;

  return (
    <>
      <section
        id="contests"
        className="mx-auto max-w-6xl scroll-mt-16 px-4 py-12 sm:px-6 sm:py-16"
      >
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Contests
          </h2>
          <p className="mt-1 text-sm text-body-mid">
            Timed problem sets. Start the clock, solve what you can, and your
            best score stays saved in this browser.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CONTESTS.map((contest) => {
            const best = bestResultFor(results, contest.id);
            return (
              <div
                key={contest.id}
                className="flex flex-col gap-3 rounded-lg border border-hairline bg-canvas-card p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-semibold text-ink">
                    {contest.title}
                  </h3>
                  {best && (
                    <span className="shrink-0 rounded-full border border-accent/40 bg-accent/5 px-2 py-0.5 text-[10px] font-medium text-accent">
                      Best {best.score}
                    </span>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-body">
                  {contest.blurb}
                </p>
                <div className="mt-auto flex items-center justify-between gap-3 pt-1">
                  <span className="font-mono text-xs text-body-mid">
                    {contest.durationMinutes} min · {contest.problemIds.length}{" "}
                    problems
                  </span>
                  <button
                    onClick={() => startContest(contest)}
                    className="rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-canvas transition-opacity hover:opacity-90"
                  >
                    Start
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {activeContest && (
        <div
          className="df-fade-in fixed inset-0 z-40 flex items-center justify-center bg-canvas/80 p-3 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`Contest: ${activeContest.title}`}
        >
          <div className="flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-hairline bg-canvas">
            <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b border-hairline px-4 py-3 sm:px-6">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-ink">
                  {activeContest.title}
                </h3>
                <p className="text-xs text-body-mid">
                  {solvedCount}/{activeContest.problemIds.length} solved
                </p>
              </div>
              <span
                className={cn(
                  "font-mono text-lg",
                  remaining <= 60 ? "text-warning" : "text-ink",
                )}
                aria-label="Time remaining"
              >
                {formatClock(remaining)}
              </span>
              {!summary && (
                <button
                  onClick={() => finishContest("manual")}
                  className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink"
                >
                  End contest
                </button>
              )}
            </div>

            <div className="df-scroll min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
              {summary ? (
                <div className="df-slide-up mx-auto max-w-xl">
                  <div className="rounded-lg border border-hairline bg-canvas-card p-5">
                    <h4 className="text-base font-semibold text-ink">
                      {summaryReason === "timeout" ? "Time's up" : "Contest ended"}
                    </h4>
                    <p className="mt-1 text-sm text-body-mid">
                      {summary.solved === summary.total
                        ? "Perfect run — every problem solved."
                        : `${summary.solved} of ${summary.total} problems solved.`}
                    </p>
                    <div className="mt-5 grid grid-cols-3 gap-3">
                      <div className="rounded-lg border border-hairline bg-canvas p-3">
                        <div className="text-xs text-body-mid">Score</div>
                        <div className="mt-1 font-mono text-xl text-ink">
                          {summary.score}
                        </div>
                      </div>
                      <div className="rounded-lg border border-hairline bg-canvas p-3">
                        <div className="text-xs text-body-mid">Solved</div>
                        <div className="mt-1 font-mono text-xl text-ink">
                          {summary.solved}/{summary.total}
                        </div>
                      </div>
                      <div className="rounded-lg border border-hairline bg-canvas p-3">
                        <div className="text-xs text-body-mid">Time used</div>
                        <div className="mt-1 font-mono text-xl text-ink">
                          {formatClock(summary.durationSeconds)}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={closeOverlay}
                      className="mt-5 rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-canvas transition-opacity hover:opacity-90"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {activeContest.problemIds.map((id) => {
                    const problem = problemMap.get(id);
                    if (!problem) return null;
                    const solved = Boolean(progress[id]?.solved);
                    return (
                      <button
                        key={id}
                        onClick={() => setActiveProblem(problem)}
                        className="flex w-full items-center gap-3 rounded-lg border border-hairline bg-canvas-card px-3 py-2.5 text-left transition-colors hover:bg-canvas-soft"
                      >
                        <span
                          className={cn(
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                            solved
                              ? "bg-accent/15 text-accent"
                              : "border border-hairline",
                          )}
                          aria-hidden
                        >
                          {solved && (
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 10 10"
                              fill="none"
                            >
                              <path
                                d="M2 5l2 2 4-4"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </span>
                        <span className="font-mono text-[11px] text-mute">
                          {problem.id}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm text-ink">
                          {problem.title}
                        </span>
                        <span
                          className={cn(
                            "shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
                            difficultyClasses(problem.difficulty),
                          )}
                        >
                          {problem.difficulty}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeProblem && (
        <ProblemView
          problem={activeProblem}
          onClose={() => setActiveProblem(null)}
          onProgressChange={() => setProgress(getProgress())}
        />
      )}
    </>
  );
}
