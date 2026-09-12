"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Problem } from "@/types/problem";
import { PROBLEMS } from "@/data/problems";
import { INTERVIEW_TRACKS, type InterviewTrack } from "@/data/interview";
import { cn, difficultyClasses } from "@/lib/utils";
import { getProgress, type ProgressMap } from "@/lib/progress";
import {
  INTERVIEW_CHANGE_EVENT,
  getBestInterviewResult,
  saveInterviewResult,
  type InterviewResult,
} from "@/lib/interview";
import { ProblemView } from "./ProblemView";

const PROGRESS_CHANGE_EVENT = "deepforge:progress-change";
const SESSION_SIZES = [5, 10, 20];
const SECONDS_PER_PROBLEM = 4 * 60;

interface InterviewSummary {
  result: InterviewResult;
  score: number;
  reason: "timeout" | "manual";
}

function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function interviewScore(solved: number, seconds: number): number {
  const raw = solved * 10 - seconds / 60;
  return Math.max(0, Math.round(raw * 10) / 10);
}

function sessionSizesFor(track: InterviewTrack): number[] {
  const options = SESSION_SIZES.filter((s) => s <= track.problemIds.length);
  return options.length > 0 ? options : [track.problemIds.length];
}

export function InterviewPrep() {
  const [progress, setProgress] = useState<ProgressMap>({});
  const [best, setBest] = useState<Record<string, InterviewResult | null>>({});
  const [setupTrack, setSetupTrack] = useState<InterviewTrack | null>(null);
  const [sessionSize, setSessionSize] = useState(10);
  const [activeTrack, setActiveTrack] = useState<InterviewTrack | null>(null);
  const [sessionIds, setSessionIds] = useState<string[]>([]);
  const [remaining, setRemaining] = useState(0);
  const [activeProblem, setActiveProblem] = useState<Problem | null>(null);
  const [summary, setSummary] = useState<InterviewSummary | null>(null);

  const startAtRef = useRef(0);
  const endAtRef = useRef(0);
  const finishingRef = useRef(false);
  const setupDialogRef = useRef<HTMLDivElement | null>(null);
  const setupReturnFocusRef = useRef<HTMLElement | null>(null);
  const sessionDialogRef = useRef<HTMLDivElement | null>(null);
  const sessionReturnFocusRef = useRef<HTMLElement | null>(null);

  const problemMap = useMemo(
    () => new Map(PROBLEMS.map((p) => [p.id, p])),
    [],
  );

  // Load stored bests + progress, then stay in sync with every writer.
  useEffect(() => {
    const load = () => {
      setProgress(getProgress());
      const next: Record<string, InterviewResult | null> = {};
      for (const track of INTERVIEW_TRACKS) {
        next[track.id] = getBestInterviewResult(track.id);
      }
      setBest(next);
    };
    load();
    window.addEventListener(PROGRESS_CHANGE_EVENT, load);
    window.addEventListener(INTERVIEW_CHANGE_EVENT, load);
    return () => {
      window.removeEventListener(PROGRESS_CHANGE_EVENT, load);
      window.removeEventListener(INTERVIEW_CHANGE_EVENT, load);
    };
  }, []);

  // Countdown for the active session. Auto-ends at zero.
  useEffect(() => {
    if (!activeTrack || summary) return;
    const tick = () => {
      const left = Math.max(
        0,
        Math.ceil((endAtRef.current - Date.now()) / 1000),
      );
      setRemaining(left);
      if (left <= 0) finishSession("timeout");
    };
    tick();
    const id = window.setInterval(tick, 500);
    return () => window.clearInterval(id);
  }, [activeTrack, summary]);

  // Escape closes the session overlay, unless ProblemView is stacked above.
  useEffect(() => {
    if (!activeTrack) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !activeProblem) closeOverlay();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeTrack, activeProblem]);

  // Escape also dismisses the setup dialog.
  useEffect(() => {
    if (!setupTrack) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSetupTrack(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setupTrack]);

  // Focus the setup dialog, lock background scroll, restore focus on close.
  useEffect(() => {
    if (!setupTrack) return;
    setupReturnFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setupDialogRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      setupReturnFocusRef.current?.focus();
    };
  }, [setupTrack]);

  // Focus the session overlay, lock background scroll, restore focus on close.
  useEffect(() => {
    if (!activeTrack) return;
    sessionReturnFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    sessionDialogRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      sessionReturnFocusRef.current?.focus();
    };
  }, [activeTrack]);

  function startSession(track: InterviewTrack, size: number) {
    const ids = track.problemIds.slice(0, size);
    const now = Date.now();
    startAtRef.current = now;
    endAtRef.current = now + ids.length * SECONDS_PER_PROBLEM * 1000;
    finishingRef.current = false;
    setSessionIds(ids);
    setRemaining(ids.length * SECONDS_PER_PROBLEM);
    setSummary(null);
    setActiveProblem(null);
    setActiveTrack(track);
    setSetupTrack(null);
  }

  function finishSession(reason: "timeout" | "manual") {
    if (finishingRef.current) return;
    const track = activeTrack;
    if (!track || sessionIds.length === 0) return;
    finishingRef.current = true;
    const limitSeconds = sessionIds.length * SECONDS_PER_PROBLEM;
    const elapsed = Math.round((Date.now() - startAtRef.current) / 1000);
    const seconds = Math.min(Math.max(0, elapsed), limitSeconds);
    const current = getProgress();
    const solved = sessionIds.filter((id) => current[id]?.solved).length;
    const result = saveInterviewResult({
      trackId: track.id,
      solved,
      total: sessionIds.length,
      seconds,
    });
    setSummary({
      result,
      score: interviewScore(solved, seconds),
      reason,
    });
    setRemaining(Math.max(0, limitSeconds - seconds));
    setActiveProblem(null);
  }

  function closeOverlay() {
    finishingRef.current = false;
    setActiveTrack(null);
    setActiveProblem(null);
    setSummary(null);
    setSessionIds([]);
  }

  function openSetup(track: InterviewTrack) {
    const options = sessionSizesFor(track);
    setSessionSize(
      options.includes(10) ? 10 : options[options.length - 1],
    );
    setSetupTrack(track);
  }

  function difficultySpread(track: InterviewTrack) {
    let easy = 0;
    let medium = 0;
    let hard = 0;
    for (const id of track.problemIds) {
      const problem = problemMap.get(id);
      if (!problem) continue;
      if (problem.difficulty === "Easy") easy += 1;
      else if (problem.difficulty === "Medium") medium += 1;
      else hard += 1;
    }
    return { easy, medium, hard };
  }

  const solvedCount = activeTrack
    ? sessionIds.filter((id) => progress[id]?.solved).length
    : 0;

  const setupSize = setupTrack
    ? Math.min(sessionSize, setupTrack.problemIds.length)
    : 0;

  return (
    <>
      <section
        id="interview"
        className="mx-auto max-w-6xl scroll-mt-16 px-4 py-12 sm:px-6 sm:py-16"
      >
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Interview Prep
          </h2>
          <p className="mt-1 text-sm text-body-mid">
            Curated tracks for ML, quant, and data interviews. Pick a session
            size, race the clock, and your best run stays saved in this browser.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {INTERVIEW_TRACKS.map((track) => {
            const spread = difficultySpread(track);
            const bestResult = best[track.id];
            return (
              <div
                key={track.id}
                className="flex flex-col gap-3 rounded-lg border border-hairline bg-canvas-card p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="text-base font-semibold text-ink">
                    {track.title}
                  </h3>
                  {bestResult && (
                    <span className="shrink-0 rounded-full border border-accent/40 bg-accent/5 px-2 py-0.5 text-[10px] font-medium text-accent">
                      Best{" "}
                      <span className="font-mono">
                        {bestResult.solved}/{bestResult.total}
                      </span>{" "}
                      ·{" "}
                      <span className="font-mono">
                        {formatClock(bestResult.seconds)}
                      </span>
                    </span>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-body">
                  {track.blurb}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className="rounded-full border border-hairline px-2 py-0.5 text-[10px] font-medium text-body-mid">
                    {track.audience}
                  </span>
                  <span className="font-mono text-xs text-body-mid">
                    {track.problemIds.length} problems
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px]">
                  <span className="text-accent">{spread.easy} Easy</span>
                  <span className="text-warning">{spread.medium} Medium</span>
                  <span className="text-error">{spread.hard} Hard</span>
                </div>
                <div className="mt-auto flex items-center justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => openSetup(track)}
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

      {setupTrack && (
        <div
          ref={setupDialogRef}
          tabIndex={-1}
          className="df-fade-in fixed inset-0 z-40 flex items-center justify-center bg-canvas/80 p-3 backdrop-blur-sm outline-none sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`Start ${setupTrack.title}`}
        >
          <div className="w-full max-w-md rounded-lg border border-hairline bg-canvas p-5">
            <h3 className="text-base font-semibold text-ink">
              {setupTrack.title}
            </h3>
            <p className="mt-1 text-sm text-body-mid">
              Choose a session size. The clock starts when you begin.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {sessionSizesFor(setupTrack).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSessionSize(size)}
                  aria-pressed={setupSize === size}
                  className={cn(
                    "rounded-lg border px-3 py-2 font-mono text-sm transition-colors",
                    setupSize === size
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-hairline text-body-mid hover:bg-canvas-soft hover:text-ink",
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-hairline bg-canvas-card p-3">
              <div className="text-xs text-body-mid">Time limit</div>
              <div className="mt-1 font-mono text-xl text-ink">
                {formatClock(setupSize * SECONDS_PER_PROBLEM)}
              </div>
              <div className="mt-1 text-[11px] text-mute">
                4 minutes per problem
              </div>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSetupTrack(null)}
                className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => startSession(setupTrack, setupSize)}
                className="rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-canvas transition-opacity hover:opacity-90"
              >
                Begin session
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTrack && (
        <div
          ref={sessionDialogRef}
          tabIndex={-1}
          className="df-fade-in fixed inset-0 z-40 flex items-center justify-center bg-canvas/80 p-3 backdrop-blur-sm outline-none sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`Interview session: ${activeTrack.title}`}
        >
          <div className="flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-hairline bg-canvas">
            <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b border-hairline px-4 py-3 sm:px-6">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-ink">
                  {activeTrack.title}
                </h3>
                <p className="text-xs text-body-mid">
                  <span className="font-mono">
                    {solvedCount}/{sessionIds.length}
                  </span>{" "}
                  solved
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
                  type="button"
                  onClick={() => finishSession("manual")}
                  className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink"
                >
                  End session
                </button>
              )}
            </div>

            <div className="df-scroll min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
              {summary ? (
                <div className="df-slide-up mx-auto max-w-xl">
                  <div className="rounded-lg border border-hairline bg-canvas-card p-5">
                    <h4 className="text-base font-semibold text-ink">
                      {summary.reason === "timeout"
                        ? "Time's up"
                        : "Session ended"}
                    </h4>
                    <p className="mt-1 text-sm text-body-mid">
                      {summary.result.solved === summary.result.total
                        ? "Perfect run — every problem solved."
                        : `${summary.result.solved} of ${summary.result.total} problems solved.`}
                    </p>
                    <div className="mt-5 grid grid-cols-3 gap-3">
                      <div className="rounded-lg border border-hairline bg-canvas p-3">
                        <div className="text-xs text-body-mid">Score</div>
                        <div className="mt-1 font-mono text-xl text-ink">
                          {summary.score.toFixed(1)}
                        </div>
                      </div>
                      <div className="rounded-lg border border-hairline bg-canvas p-3">
                        <div className="text-xs text-body-mid">Solved</div>
                        <div className="mt-1 font-mono text-xl text-ink">
                          {summary.result.solved}/{summary.result.total}
                        </div>
                      </div>
                      <div className="rounded-lg border border-hairline bg-canvas p-3">
                        <div className="text-xs text-body-mid">Time used</div>
                        <div className="mt-1 font-mono text-xl text-ink">
                          {formatClock(summary.result.seconds)}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={closeOverlay}
                      className="mt-5 rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-canvas transition-opacity hover:opacity-90"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {sessionIds.map((id, index) => {
                    const problem = problemMap.get(id);
                    if (!problem) return null;
                    const solved = Boolean(progress[id]?.solved);
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setActiveProblem(problem)}
                        className="flex w-full items-center gap-3 rounded-lg border border-hairline bg-canvas-card px-3 py-2.5 text-left transition-colors hover:bg-canvas-soft"
                      >
                        <span className="w-5 shrink-0 font-mono text-xs text-mute">
                          {index + 1}
                        </span>
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
                        <span className="hidden shrink-0 font-mono text-[11px] text-mute sm:inline">
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
