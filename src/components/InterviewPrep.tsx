"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  PROBLEM_META,
  type ProblemMeta,
} from "@/data/problems/problem-meta";
import { PROJECTS, type Project } from "@/data/projects";
import { INTERVIEW_TRACKS, type InterviewTrack } from "@/data/interview";
import { cn, difficultyClasses } from "@/lib/utils";
import { getProgress, type ProgressMap } from "@/lib/progress";
import {
  INTERVIEW_CHANGE_EVENT,
  getBestInterviewResult,
  saveInterviewResult,
  type InterviewResult,
} from "@/lib/interview";

const PROGRESS_CHANGE_EVENT = "deepforge:progress-change";
const SESSION_SIZES = [5, 10, 20];
const SECONDS_PER_PROBLEM = 4 * 60;

type SetupMode = "practice" | "mock";

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

function fullPathIds(track: InterviewTrack): string[] {
  return track.phases.flatMap((phase) => phase.problemIds);
}

function idsFor(
  track: InterviewTrack,
  mode: SetupMode,
  phase: number,
): string[] {
  if (mode === "mock") return track.mockProblemIds;
  if (phase >= track.phases.length) return fullPathIds(track);
  return track.phases[phase].problemIds;
}

function sessionSizesFor(ids: string[]): number[] {
  const options = SESSION_SIZES.filter((size) => size <= ids.length);
  return options.length > 0 ? options : [ids.length];
}

function preferredSize(ids: string[]): number {
  const options = sessionSizesFor(ids);
  return options.includes(10) ? 10 : options[options.length - 1];
}

function ProblemRow({
  problem,
  index,
  solved,
  onOpen,
}: {
  problem: ProblemMeta;
  index?: number;
  solved: boolean;
  onOpen: (problem: ProblemMeta) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(problem)}
      className="flex w-full items-center gap-3 rounded-lg border border-hairline bg-canvas-card px-3 py-2.5 text-left transition-colors hover:bg-canvas-soft"
    >
      {index !== undefined && (
        <span className="w-5 shrink-0 font-mono text-xs text-mute">
          {index}
        </span>
      )}
      <span
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
          solved ? "bg-accent/15 text-accent" : "border border-hairline",
        )}
        aria-hidden
      >
        {solved && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
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
}

export function InterviewPrep() {
  const router = useRouter();
  const [progress, setProgress] = useState<ProgressMap>({});
  const [best, setBest] = useState<Record<string, InterviewResult | null>>({});
  const [setupTrack, setSetupTrack] = useState<InterviewTrack | null>(null);
  const [setupMode, setSetupMode] = useState<SetupMode>("practice");
  const [setupPhase, setSetupPhase] = useState(0);
  const [sessionSize, setSessionSize] = useState(10);
  const [activeTrack, setActiveTrack] = useState<InterviewTrack | null>(null);
  const [sessionIds, setSessionIds] = useState<string[]>([]);
  const [remaining, setRemaining] = useState(0);
  const [summary, setSummary] = useState<InterviewSummary | null>(null);

  const startAtRef = useRef(0);
  const endAtRef = useRef(0);
  const finishingRef = useRef(false);
  const setupDialogRef = useRef<HTMLDivElement | null>(null);
  const setupReturnFocusRef = useRef<HTMLElement | null>(null);
  const sessionDialogRef = useRef<HTMLDivElement | null>(null);
  const sessionReturnFocusRef = useRef<HTMLElement | null>(null);

  const problemMap = useMemo(
    () => new Map(PROBLEM_META.map((p) => [p.id, p])),
    [],
  );

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

  useEffect(() => {
    if (!activeTrack) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeOverlay();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeTrack]);

  useEffect(() => {
    if (!setupTrack) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSetupTrack(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setupTrack]);

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

  function startSession(track: InterviewTrack, ids: string[]) {
    const now = Date.now();
    startAtRef.current = now;
    endAtRef.current = now + ids.length * SECONDS_PER_PROBLEM * 1000;
    finishingRef.current = false;
    setSessionIds(ids);
    setRemaining(ids.length * SECONDS_PER_PROBLEM);
    setSummary(null);
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
  }

  function closeOverlay() {
    finishingRef.current = false;
    setActiveTrack(null);
    setSummary(null);
    setSessionIds([]);
  }

  function openProblem(problem: ProblemMeta) {
    router.push(`/problems/${problem.id}`);
  }

  function openSetup(track: InterviewTrack, mode: SetupMode, phase = 0) {
    const ids = idsFor(track, mode, phase);
    setSessionSize(preferredSize(ids));
    setSetupMode(mode);
    setSetupPhase(phase);
    setSetupTrack(track);
  }

  function chooseMode(mode: SetupMode) {
    if (!setupTrack) return;
    setSessionSize(preferredSize(idsFor(setupTrack, mode, setupPhase)));
    setSetupMode(mode);
  }

  function choosePhase(phase: number) {
    if (!setupTrack) return;
    setSessionSize(preferredSize(idsFor(setupTrack, "practice", phase)));
    setSetupPhase(phase);
  }

  function beginSetup() {
    if (!setupTrack) return;
    const ids =
      setupMode === "mock"
        ? setupTrack.mockProblemIds
        : setupIds.slice(0, setupSize);
    startSession(setupTrack, ids);
  }

  function difficultySpread(ids: string[]) {
    let easy = 0;
    let medium = 0;
    let hard = 0;
    for (const id of ids) {
      const problem = problemMap.get(id);
      if (!problem) continue;
      if (problem.difficulty === "Easy") easy += 1;
      else if (problem.difficulty === "Medium") medium += 1;
      else hard += 1;
    }
    return { easy, medium, hard };
  }

  const setupIds = setupTrack ? idsFor(setupTrack, setupMode, setupPhase) : [];
  const setupSize = Math.min(sessionSize, setupIds.length);
  const setupGroups = !setupTrack
    ? []
    : setupMode === "mock"
      ? [{ name: "Timed mock", ids: setupTrack.mockProblemIds }]
      : setupPhase >= setupTrack.phases.length
        ? setupTrack.phases.map((phase) => ({
            name: phase.name,
            ids: phase.problemIds,
          }))
        : [
            {
              name: setupTrack.phases[setupPhase].name,
              ids: setupTrack.phases[setupPhase].problemIds,
            },
          ];

  const solvedCount = activeTrack
    ? sessionIds.filter((id) => progress[id]?.solved).length
    : 0;

  return (
    <>
      <section
        id="interview"
        className="mx-auto max-w-6xl scroll-mt-16 px-4 py-10 sm:px-6 sm:py-14"
      >
        <div className="mb-6">
          <h2 className="text-sm font-medium text-body-mid">
            {INTERVIEW_TRACKS.length} company tracks · paced practice or timed
            mock
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {INTERVIEW_TRACKS.map((track) => {
            const allIds = [...fullPathIds(track), ...track.mockProblemIds];
            const spread = difficultySpread(allIds);
            const bestResult = best[track.id];
            const projectLinks = (track.resumeProjectIds ?? [])
              .map((id) => PROJECTS.find((project) => project.id === id))
              .filter((project): project is Project => Boolean(project));
            return (
              <div
                key={track.id}
                className="flex flex-col gap-3 rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-ink">
                      {track.company}
                    </h3>
                    <p className="text-xs font-medium text-body-mid">
                      {track.role}
                    </p>
                  </div>
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
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-hairline px-2 py-0.5 text-[10px] font-medium text-body-mid">
                    {track.audience}
                  </span>
                  <span className="rounded-full border border-hairline px-2 py-0.5 text-[10px] font-medium text-body-mid">
                    {track.style}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {track.phases.map((phase, index) => (
                    <button
                      key={phase.name}
                      type="button"
                      onClick={() => openSetup(track, "practice", index)}
                      className="rounded-lg border border-hairline bg-canvas-card px-2 py-1.5 text-left transition-colors hover:bg-canvas-soft"
                      aria-label={`Practice ${phase.name}: ${phase.problemIds.length} problems`}
                    >
                      <span className="block text-[11px] font-medium text-ink">
                        {phase.name}
                      </span>
                      <span className="mt-0.5 block font-mono text-[10px] text-mute">
                        {phase.problemIds.length} problems
                      </span>
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px]">
                  <span className="text-accent">{spread.easy} Easy</span>
                  <span className="text-warning">{spread.medium} Medium</span>
                  <span className="text-error">{spread.hard} Hard</span>
                </div>
                {projectLinks.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-mute">Projects</span>
                    {projectLinks.map((project) => (
                      <Link
                        key={project.id}
                        href="/projects"
                        className="rounded-full border border-hairline px-2 py-0.5 text-[10px] text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink"
                      >
                        {project.title}
                      </Link>
                    ))}
                  </div>
                )}
                <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                  <span className="font-mono text-[11px] text-mute">
                    {allIds.length} problems
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        openSetup(track, "practice", track.phases.length)
                      }
                      className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink"
                    >
                      Full path
                    </button>
                    <button
                      type="button"
                      onClick={() => openSetup(track, "mock")}
                      className="rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-canvas transition-opacity hover:opacity-90"
                    >
                      Start mock
                    </button>
                  </div>
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
          aria-label={`${setupTrack.company} ${setupTrack.role} interview prep`}
        >
          <div className="flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-hairline bg-canvas">
            <div className="shrink-0 border-b border-hairline px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-ink">
                    {setupTrack.company}
                  </h3>
                  <p className="text-xs text-body-mid">{setupTrack.role}</p>
                </div>
                <span className="rounded-full border border-hairline px-2 py-0.5 text-[10px] font-medium text-body-mid">
                  {setupTrack.style}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => chooseMode("practice")}
                  aria-pressed={setupMode === "practice"}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                    setupMode === "practice"
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-hairline text-body-mid hover:bg-canvas-soft hover:text-ink",
                  )}
                >
                  Paced practice
                </button>
                <button
                  type="button"
                  onClick={() => chooseMode("mock")}
                  aria-pressed={setupMode === "mock"}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                    setupMode === "mock"
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-hairline text-body-mid hover:bg-canvas-soft hover:text-ink",
                  )}
                >
                  Timed mock
                </button>
              </div>
            </div>

            <div className="df-scroll min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {setupMode === "practice" ? (
                <>
                  <div className="flex flex-wrap gap-2">
                    {setupTrack.phases.map((phase, index) => (
                      <button
                        key={phase.name}
                        type="button"
                        onClick={() => choosePhase(index)}
                        aria-pressed={setupPhase === index}
                        className={cn(
                          "rounded-lg border px-3 py-1.5 font-mono text-xs transition-colors",
                          setupPhase === index
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-hairline text-body-mid hover:bg-canvas-soft hover:text-ink",
                        )}
                      >
                        {phase.name} · {phase.problemIds.length}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => choosePhase(setupTrack.phases.length)}
                      aria-pressed={setupPhase >= setupTrack.phases.length}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 font-mono text-xs transition-colors",
                        setupPhase >= setupTrack.phases.length
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-hairline text-body-mid hover:bg-canvas-soft hover:text-ink",
                      )}
                    >
                      Full path · {fullPathIds(setupTrack).length}
                    </button>
                  </div>
                  <div className="mt-4">
                    <div className="text-xs text-body-mid">Session size</div>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {sessionSizesFor(setupIds).map((size) => (
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
                  </div>
                </>
              ) : (
                <p className="text-sm text-body-mid">
                  Five of the hardest problems in this track, mixed across
                  topics. Four minutes per problem.
                </p>
              )}

              <div className="mt-4 rounded-lg border border-hairline bg-canvas-card p-3">
                <div className="text-xs text-body-mid">Time limit</div>
                <div className="mt-1 font-mono text-xl text-ink">
                  {formatClock(setupSize * SECONDS_PER_PROBLEM)}
                </div>
                <div className="mt-1 text-[11px] text-mute">
                  {setupSize} problems · 4 minutes each
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {setupGroups.map((group) => (
                  <div key={group.name}>
                    <div className="mb-1.5 text-xs font-medium text-body-mid">
                      {group.name}
                    </div>
                    <div className="space-y-2">
                      {group.ids.map((id, index) => {
                        const problem = problemMap.get(id);
                        if (!problem) return null;
                        return (
                          <ProblemRow
                            key={id}
                            problem={problem}
                            index={index + 1}
                            solved={Boolean(progress[id]?.solved)}
                            onOpen={openProblem}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-end gap-2 border-t border-hairline px-5 py-4">
              <button
                type="button"
                onClick={() => setSetupTrack(null)}
                className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={beginSetup}
                className="rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-canvas transition-opacity hover:opacity-90"
              >
                {setupMode === "mock" ? "Begin mock" : "Begin session"}
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
          aria-label={`Interview session: ${activeTrack.company} ${activeTrack.role}`}
        >
          <div className="flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-hairline bg-canvas">
            <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b border-hairline px-4 py-3 sm:px-6">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-ink">
                  {activeTrack.company} · {activeTrack.role}
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
                    return (
                      <ProblemRow
                        key={id}
                        problem={problem}
                        index={index + 1}
                        solved={Boolean(progress[id]?.solved)}
                        onOpen={openProblem}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
