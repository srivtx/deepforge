"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIES } from "@/data/problems/meta";
import {
  PROBLEM_META,
  type ProblemMeta,
} from "@/data/problems/problem-meta";
import { cn, difficultyClasses } from "@/lib/utils";
import { getProgress } from "@/lib/progress";
import {
  RUNS_CHANGE_EVENT,
  compareRuns,
  decodeRun,
  encodeRun,
  finishRun,
  formatClock,
  getActiveRun,
  getRunHistory,
  parSeconds,
  recordSolve,
  solveScore,
  startRun,
  type RunComparisonRow,
  type RunConfig,
  type RunState,
} from "@/lib/runs";

const PROGRESS_CHANGE_EVENT = "deepforge:progress-change";
const RUNS_STORAGE_KEY = "deepforge:runs:v1";

const PROBLEM_COUNTS = [5, 10, 15];
const DURATIONS = [5, 10, 20];

type SummaryReason = "timeout" | "all" | "abandoned";

function randomSeed(): string {
  return `forge-${Math.random().toString(36).slice(2, 8)}`;
}

function scoreText(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function closest(values: number[], target: number): number {
  return values.reduce(
    (best, value) =>
      Math.abs(value - target) < Math.abs(best - target) ? value : best,
    values[0],
  );
}

function solveTimeStats(run: RunState): {
  bestMs: number | null;
  avgMs: number | null;
  count: number;
} {
  const times = run.solvedIds
    .map((id) => run.solvedAt[id])
    .filter((value): value is number => typeof value === "number");
  if (times.length === 0) return { bestMs: null, avgMs: null, count: 0 };
  const total = times.reduce((sum, value) => sum + value, 0);
  return {
    bestMs: Math.min(...times),
    avgMs: total / times.length,
    count: times.length,
  };
}

function ProblemRow({
  problem,
  solvedMs,
  onOpen,
}: {
  problem: ProblemMeta;
  solvedMs: number | null;
  onOpen: () => void;
}) {
  const solved = solvedMs !== null;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-3 rounded-lg border border-hairline bg-canvas-card px-3 py-2.5 text-left transition-colors hover:bg-canvas-soft"
    >
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
      <span className="font-mono text-[11px] text-mute">{problem.id}</span>
      <span className="min-w-0 flex-1 truncate text-sm text-ink">
        {problem.title}
      </span>
      <span className="hidden shrink-0 font-mono text-[11px] sm:inline">
        {solved ? (
          <span className="text-accent">
            {formatClock(solvedMs)} · +{scoreText(solveScore(problem, solvedMs / 1000))}
          </span>
        ) : (
          <span className="text-mute">
            par {formatClock(parSeconds(problem) * 1000)}
          </span>
        )}
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

function ProgressBar({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-body-mid">{label}</span>
        <span className="font-mono text-body">
          {value}/{total}
        </span>
      </div>
      <div
        className="mt-1 h-1.5 overflow-hidden rounded-full bg-canvas-soft"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={value}
      >
        <div
          className={cn("h-full rounded-full transition-all", tone)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ComparisonTable({
  rows,
  problemMap,
}: {
  rows: RunComparisonRow[];
  problemMap: Map<string, ProblemMeta>;
}) {
  return (
    <div className="df-scroll overflow-x-auto">
      <table className="w-full min-w-[440px] border-collapse text-left">
        <thead>
          <tr className="border-b border-hairline text-[11px] text-body-mid">
            <th className="py-2 pr-3 font-medium">Problem</th>
            <th className="py-2 pr-3 font-medium">You</th>
            <th className="py-2 pr-3 font-medium">Ghost</th>
            <th className="py-2 font-medium">Result</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const problem = problemMap.get(row.problemId);
            const result =
              row.winner === "a"
                ? {
                    text:
                      row.aMs !== null && row.bMs !== null
                        ? `You faster by ${formatClock(row.aMs - row.bMs)}`
                        : "You solved it",
                    className: "text-accent",
                  }
                : row.winner === "b"
                  ? {
                      text:
                        row.aMs !== null && row.bMs !== null
                          ? `Ghost faster by ${formatClock(row.bMs - row.aMs)}`
                          : "Ghost solved it",
                      className: "text-warning",
                    }
                  : row.winner === "tie"
                    ? row.aMs !== null && row.bMs !== null
                      ? { text: "Tie", className: "text-body-mid" }
                      : { text: "Both solved", className: "text-body-mid" }
                    : { text: "—", className: "text-mute" };
            const formatCell = (solved: boolean, ms: number | null) => {
              if (!solved) return "—";
              return ms !== null ? formatClock(ms) : "solved";
            };
            return (
              <tr
                key={row.problemId}
                className="border-b border-hairline last:border-0"
              >
                <td className="py-2 pr-3">
                  <div className="truncate text-xs text-ink">
                    {problem?.title ?? row.problemId}
                  </div>
                  <div className="font-mono text-[10px] text-mute">
                    {row.problemId}
                  </div>
                </td>
                <td className="py-2 pr-3 font-mono text-[11px] text-body">
                  {formatCell(row.aSolved, row.aMs)}
                </td>
                <td className="py-2 pr-3 font-mono text-[11px] text-body">
                  {formatCell(row.bSolved, row.bMs)}
                </td>
                <td className={cn("py-2 text-[11px]", result.className)}>
                  {result.text}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function Speedrun() {
  const [seed, setSeed] = useState("forge");
  const [problemCount, setProblemCount] = useState(10);
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [category, setCategory] = useState("All");

  const [run, setRun] = useState<RunState | null>(null);
  const [history, setHistory] = useState<RunState[]>([]);
  const [nowMs, setNowMs] = useState(0);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [summaryReason, setSummaryReason] = useState<SummaryReason | null>(
    null,
  );
  const [confirmAbandon, setConfirmAbandon] = useState(false);

  const [ghost, setGhost] = useState<RunState | null>(null);
  const [importText, setImportText] = useState("");
  const [imported, setImported] = useState<RunState | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const runRef = useRef<RunState | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const codeInputRef = useRef<HTMLInputElement | null>(null);
  const copyTimerRef = useRef<number | null>(null);

  const problemMap = useMemo(
    () => new Map(PROBLEM_META.map((p) => [p.id, p])),
    [],
  );

  const finish = useCallback((state: RunState, reason: SummaryReason) => {
    const done = finishRun(
      state,
      reason === "abandoned" ? "abandoned" : "finished",
    );
    runRef.current = done;
    setRun(done);
    setSummaryReason(reason);
    setHistory(getRunHistory());
  }, []);

  // Load stored runs and stay in sync with writers in this and other tabs.
  useEffect(() => {
    const load = () => {
      const active = getActiveRun();
      setHistory(getRunHistory());
      if (active && active.status === "active") {
        if (Date.now() >= active.endsAt) {
          finish(active, "timeout");
        } else {
          runRef.current = active;
          setRun(active);
        }
        setOverlayOpen(true);
      }
    };
    load();
    const onRuns = () => setHistory(getRunHistory());
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === RUNS_STORAGE_KEY) onRuns();
    };
    window.addEventListener(RUNS_CHANGE_EVENT, onRuns);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(RUNS_CHANGE_EVENT, onRuns);
      window.removeEventListener("storage", onStorage);
    };
  }, [finish]);

  // Detect solves that land while the run window is open. Solves are global,
  // so the run captures progress changes itself.
  useEffect(() => {
    const onProgress = () => {
      const current = runRef.current;
      if (!current || current.status !== "active") return;
      const now = Date.now();
      if (now > current.endsAt) return;
      const progress = getProgress();
      const newly = current.problemIds.filter(
        (id) => progress[id]?.solved && !current.solvedIds.includes(id),
      );
      if (newly.length === 0) return;
      let next = current;
      for (const id of newly) {
        next = recordSolve(next, id, now - next.startedAt);
      }
      runRef.current = next;
      setRun(next);
      if (next.solvedIds.length >= next.problemIds.length) {
        finish(next, "all");
      }
    };
    window.addEventListener(PROGRESS_CHANGE_EVENT, onProgress);
    return () =>
      window.removeEventListener(PROGRESS_CHANGE_EVENT, onProgress);
  }, [finish]);

  // Countdown, 250ms tick. Auto-finishes at zero.
  const runId = run?.id;
  const runStatus = run?.status;
  useEffect(() => {
    if (!runId || runStatus !== "active") return;
    const tick = () => {
      const now = Date.now();
      setNowMs(now);
      const current = runRef.current;
      if (current && current.status === "active" && now >= current.endsAt) {
        finish(current, "timeout");
      }
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [runId, runStatus, finish]);

  // Second-click confirm for abandoning, auto-resets.
  useEffect(() => {
    if (!confirmAbandon) return;
    const id = window.setTimeout(() => setConfirmAbandon(false), 4000);
    return () => window.clearTimeout(id);
  }, [confirmAbandon]);

  const closeOverlay = useCallback(() => {
    setOverlayOpen(false);
    setConfirmAbandon(false);
  }, []);

  // Escape minimizes the overlay.
  useEffect(() => {
    if (!overlayOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeOverlay();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [overlayOpen, closeOverlay]);

  // Focus the overlay, lock background scroll, restore focus on close.
  useEffect(() => {
    if (!overlayOpen) return;
    returnFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    overlayRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      returnFocusRef.current?.focus();
    };
  }, [overlayOpen]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const launch = useCallback(
    (config: RunConfig) => {
      const current = runRef.current;
      if (current && current.status === "active") {
        finishRun(current, "abandoned");
      }
      const started = startRun(config);
      runRef.current = started;
      setRun(started);
      setSummaryReason(null);
      setConfirmAbandon(false);
      setCopied(false);
      setNowMs(Date.now());
      setOverlayOpen(true);
    },
    [],
  );

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    const nextSeed = seed.trim() || randomSeed();
    setSeed(nextSeed);
    launch({
      seed: nextSeed,
      problemCount,
      durationSeconds: durationMinutes * 60,
      category: category === "All" ? undefined : category,
    });
  };

  const loadGhost = (source: RunState) => {
    setGhost(source);
    setSeed(source.seed);
    setProblemCount(closest(PROBLEM_COUNTS, source.problemIds.length));
    setDurationMinutes(
      closest(
        DURATIONS,
        Math.max(
          1,
          Math.round((source.endsAt - source.startedAt) / 1000 / 60),
        ),
      ),
    );
    setCategory(source.category && source.category !== "All" ? source.category : "All");
  };

  const raceGhostNow = (source: RunState) => {
    loadGhost(source);
    launch({
      seed: source.seed,
      problemCount: source.problemIds.length,
      durationSeconds: Math.max(
        1,
        Math.round((source.endsAt - source.startedAt) / 1000),
      ),
      category: source.category,
    });
  };

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = decodeRun(importText);
    if (!parsed) {
      setImported(null);
      setImportError(
        "That is not a valid run code. Check for missing characters and try again.",
      );
      return;
    }
    setImported(parsed);
    setImportError(null);
    setGhost(parsed);
  };

  const openProblem = (id: string) => {
    window.dispatchEvent(
      new CustomEvent("deepforge:open-problem", { detail: { id } }),
    );
  };

  const remainingMs = run ? Math.max(0, run.endsAt - nowMs) : 0;
  const activeRun = run && run.status === "active" ? run : null;
  const parTotalMs = run
    ? run.problemIds.reduce((sum, id) => {
        const problem = problemMap.get(id);
        return sum + (problem ? parSeconds(problem) * 1000 : 0);
      }, 0)
    : 0;
  const { bestMs, avgMs } = run
    ? solveTimeStats(run)
    : { bestMs: null, avgMs: null };

  const racingGhost =
    activeRun && ghost && ghost.seed === activeRun.seed ? ghost : null;
  const elapsedMs = activeRun
    ? Math.min(
        Math.max(0, nowMs - activeRun.startedAt),
        activeRun.endsAt - activeRun.startedAt,
      )
    : 0;
  const ghostHasTimes = racingGhost
    ? Object.keys(racingGhost.solvedAt).length > 0
    : false;
  const ghostSolvedNow = racingGhost
    ? ghostHasTimes
      ? racingGhost.solvedIds.filter(
          (id) => (racingGhost.solvedAt[id] ?? Infinity) <= elapsedMs,
        ).length
      : racingGhost.solvedIds.length
    : 0;

  const ghostComparison = useMemo(() => {
    if (
      !run ||
      run.status === "active" ||
      !ghost ||
      ghost.seed !== run.seed ||
      ghost.id === run.id
    ) {
      return null;
    }
    return compareRuns(run, ghost);
  }, [run, ghost]);

  const importedComparison = useMemo(() => {
    if (!imported) return null;
    const local = [run, ...history].find(
      (candidate): candidate is RunState =>
        !!candidate &&
        candidate.status === "finished" &&
        candidate.seed === imported.seed &&
        candidate.id !== imported.id,
    );
    if (!local) return null;
    return { local, rows: compareRuns(local, imported) };
  }, [imported, run, history]);

  const runCode = run && run.status !== "active" ? encodeRun(run) : "";

  const copyRunCode = async () => {
    if (!runCode) return;
    try {
      await navigator.clipboard.writeText(runCode);
      setCopied(true);
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = window.setTimeout(() => setCopied(false), 1500);
    } catch {
      codeInputRef.current?.select();
    }
  };

  const summaryTitle =
    summaryReason === "all"
      ? "All problems solved"
      : summaryReason === "abandoned"
        ? "Run abandoned"
        : "Time's up";

  const summaryBlurb = run
    ? summaryReason === "all"
      ? `Every problem solved with ${formatClock(remainingMs)} to spare.`
      : summaryReason === "abandoned"
        ? `${run.solvedIds.length} of ${run.problemIds.length} problems solved before you stopped.`
        : `${run.solvedIds.length} of ${run.problemIds.length} problems solved before the clock ran out.`
    : "";

  return (
    <>
      <section
        id="speedrun"
        className="mx-auto max-w-6xl scroll-mt-16 px-4 py-10 sm:px-6 sm:py-14"
      >
        <div className="mb-6">
          <h2 className="text-sm font-medium text-body-mid">
            {history.length} finished runs saved locally
          </h2>
          <p className="mt-1 text-xs text-mute">
            The same seed always picks the same problems, so you can race a
            friend&apos;s run code — or your own ghost. Scores are local and
            honor-system.
          </p>
        </div>

        <form
          onSubmit={handleStart}
          className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label
                htmlFor="speedrun-seed"
                className="text-xs font-medium text-body-mid"
              >
                Seed
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="speedrun-seed"
                  type="text"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                  className="min-w-0 flex-1 rounded-lg border border-hairline bg-canvas px-3 py-2 font-mono text-xs text-ink focus:border-accent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setSeed(randomSeed())}
                  className="shrink-0 rounded-lg border border-hairline px-3 py-2 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink"
                >
                  Randomize
                </button>
              </div>
            </div>

            <div>
              <span className="text-xs font-medium text-body-mid">
                Problems
              </span>
              <div className="mt-2 flex gap-2">
                {PROBLEM_COUNTS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={problemCount === value}
                    onClick={() => setProblemCount(value)}
                    className={cn(
                      "flex-1 rounded-lg border px-3 py-2 text-xs transition-colors",
                      problemCount === value
                        ? "border-accent/40 bg-accent/10 text-accent"
                        : "border-hairline text-body-mid hover:bg-canvas-soft hover:text-ink",
                    )}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-medium text-body-mid">
                Duration
              </span>
              <div className="mt-2 flex gap-2">
                {DURATIONS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={durationMinutes === value}
                    onClick={() => setDurationMinutes(value)}
                    className={cn(
                      "flex-1 rounded-lg border px-3 py-2 text-xs transition-colors",
                      durationMinutes === value
                        ? "border-accent/40 bg-accent/10 text-accent"
                        : "border-hairline text-body-mid hover:bg-canvas-soft hover:text-ink",
                    )}
                  >
                    {value} min
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="speedrun-category"
                className="text-xs font-medium text-body-mid"
              >
                Category
              </label>
              <select
                id="speedrun-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-2 w-full rounded-lg border border-hairline bg-canvas px-3 py-2 text-xs text-ink focus:border-accent focus:outline-none"
              >
                <option value="All">All</option>
                {CATEGORIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[11px] text-mute">
              About 40% Easy, 40% Medium, 20% Hard, spread across categories.
              Par times: Easy 90s, Medium 150s, Hard 240s.
            </p>
            <button
              type="submit"
              className="rounded-lg bg-accent px-4 py-2 text-xs font-medium text-canvas transition-opacity hover:opacity-90"
            >
              Start run
            </button>
          </div>
        </form>

        {run && !overlayOpen && (
          <div
            className={cn(
              "mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border px-4 py-3",
              run.status === "active"
                ? "border-accent/40 bg-accent/5"
                : "border-hairline bg-canvas-card",
            )}
          >
            {run.status === "active" ? (
              <>
                <span className="text-sm text-ink">Run in progress</span>
                <span className="text-xs text-body-mid">
                  {run.solvedIds.length}/{run.problemIds.length} solved ·{" "}
                  {scoreText(run.score)} pts
                </span>
                <span className="font-mono text-sm text-ink">
                  {formatClock(remainingMs)} left
                </span>
                <button
                  type="button"
                  onClick={() => setOverlayOpen(true)}
                  className="ml-auto rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-canvas transition-opacity hover:opacity-90"
                >
                  Resume run
                </button>
              </>
            ) : (
              <>
                <span className="text-sm text-ink">
                  Last run: {scoreText(run.score)} pts ·{" "}
                  {run.solvedIds.length}/{run.problemIds.length} solved
                </span>
                <button
                  type="button"
                  onClick={() => setOverlayOpen(true)}
                  className="ml-auto rounded-lg border border-hairline px-3.5 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink"
                >
                  View summary
                </button>
              </>
            )}
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <form
            onSubmit={handleImport}
            className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5"
          >
            <h3 className="text-sm font-semibold text-ink">
              Import a run code
            </h3>
            <p className="mt-1 text-xs text-body-mid">
              Paste a friend&apos;s code to see their result, then compare it
              with a finished run of yours on the same seed.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Paste run code"
                aria-label="Run code"
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                className="min-w-0 flex-1 rounded-lg border border-hairline bg-canvas px-3 py-2 font-mono text-xs text-ink focus:border-accent focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-lg border border-hairline px-3.5 py-2 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink"
              >
                View result
              </button>
            </div>
            {importError && (
              <p className="mt-2 text-xs text-error">{importError}</p>
            )}
          </form>

          {ghost ? (
            <div className="rounded-lg border border-accent/40 bg-accent/5 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-ink">
                    Ghost loaded
                  </h3>
                  <p className="mt-1 text-xs text-body-mid">
                    Seed{" "}
                    <span className="font-mono text-body">{ghost.seed}</span> ·{" "}
                    {scoreText(ghost.score)} pts · {ghost.solvedIds.length}/
                    {ghost.problemIds.length} solved
                    {ghost.startedAt > 0 && (
                      <> · {new Date(ghost.startedAt).toLocaleDateString()}</>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setGhost(null)}
                  className="shrink-0 rounded-lg border border-hairline px-2.5 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink"
                >
                  Clear
                </button>
              </div>
              <button
                type="button"
                onClick={() => raceGhostNow(ghost)}
                className="mt-3 rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-canvas transition-opacity hover:opacity-90"
              >
                Race this ghost
              </button>
            </div>
          ) : (
            <div className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
              <h3 className="text-sm font-semibold text-ink">Ghost comparison</h3>
              <p className="mt-1 text-xs text-body-mid">
                Import a run code or load a past run as a ghost to see a
                per-problem comparison and race it live.
              </p>
            </div>
          )}
        </div>

        {imported && (
          <div className="mt-3 rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-ink">
                  Imported run
                </h3>
                <p className="mt-1 text-xs text-body-mid">
                  Seed <span className="font-mono text-body">{imported.seed}</span>{" "}
                  · {scoreText(imported.score)} pts · {imported.solvedIds.length}/
                  {imported.problemIds.length} solved ·{" "}
                  {formatClock(imported.endsAt - imported.startedAt)} limit
                </p>
              </div>
              <button
                type="button"
                onClick={() => raceGhostNow(imported)}
                className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink"
              >
                Race this seed
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                {imported.problemIds.map((id, index) => {
                  const problem = problemMap.get(id);
                  if (!problem) return null;
                  const solved = imported.solvedIds.includes(id);
                  return (
                    <div
                      key={id}
                      className="flex items-center gap-3 rounded-lg border border-hairline bg-canvas px-3 py-2"
                    >
                      <span className="font-mono text-[10px] text-mute">
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-xs text-ink">
                        {problem.title}
                      </span>
                      <span
                        className={cn(
                          "shrink-0 text-[10px] font-medium",
                          solved ? "text-accent" : "text-mute",
                        )}
                      >
                        {solved ? "solved" : "unsolved"}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div>
                {importedComparison ? (
                  <>
                    <h4 className="text-xs font-medium text-body-mid">
                      You vs this run ({importedComparison.local.solvedIds.length}/
                      {importedComparison.local.problemIds.length} solved on your
                      side)
                    </h4>
                    <div className="mt-2 rounded-lg border border-hairline bg-canvas p-3">
                      <ComparisonTable
                        rows={importedComparison.rows}
                        problemMap={problemMap}
                      />
                    </div>
                  </>
                ) : (
                  <p className="rounded-lg border border-hairline bg-canvas p-3 text-xs text-mute">
                    No finished run of yours on seed{" "}
                    <span className="font-mono">{imported.seed}</span> yet. Race
                    it to compare per problem.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-3 rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-ink">Recent runs</h3>
          {history.length === 0 ? (
            <p className="mt-2 py-2 text-center text-xs text-mute">
              No finished runs yet. Start one above — the last 20 runs stay in
              this browser.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {history.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-hairline bg-canvas px-3 py-2.5"
                >
                  <span
                    className={cn(
                      "shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
                      item.status === "abandoned"
                        ? "border-hairline text-body-mid"
                        : "border-accent/40 bg-accent/5 text-accent",
                    )}
                  >
                    {item.status === "abandoned" ? "Abandoned" : "Finished"}
                  </span>
                  <span className="font-mono text-[11px] text-mute">
                    {new Date(item.startedAt).toLocaleDateString()}
                  </span>
                  <span className="font-mono text-sm text-ink">
                    {scoreText(item.score)} pts
                  </span>
                  <span className="text-xs text-body-mid">
                    {item.solvedIds.length}/{item.problemIds.length} solved
                  </span>
                  <span className="hidden font-mono text-[11px] text-mute md:inline">
                    seed {item.seed}
                  </span>
                  <div className="ml-auto flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => loadGhost(item)}
                      aria-pressed={ghost?.id === item.id}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs transition-colors",
                        ghost?.id === item.id
                          ? "border-accent/40 bg-accent/10 text-accent"
                          : "border-hairline text-body-mid hover:bg-canvas-soft hover:text-ink",
                      )}
                    >
                      {ghost?.id === item.id ? "Ghost loaded" : "Load as ghost"}
                    </button>
                    <button
                      type="button"
                      onClick={() => raceGhostNow(item)}
                      className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink"
                    >
                      Race
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {overlayOpen && run && (
        <div
          ref={overlayRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={`Speedrun: seed ${run.seed}`}
          className="df-fade-in fixed inset-0 z-40 flex items-center justify-center bg-canvas/80 p-3 backdrop-blur-sm outline-none sm:p-6"
        >
          <div className="flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-hairline bg-canvas">
            <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b border-hairline px-4 py-3 sm:px-6">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-ink">
                  Speedrun ·{" "}
                  <span className="font-mono text-xs text-body-mid">
                    {run.seed}
                  </span>
                </h3>
                <p className="text-xs text-body-mid">
                  {run.status === "active"
                    ? `${run.solvedIds.length}/${run.problemIds.length} solved`
                    : `${summaryTitle} · ${run.solvedIds.length}/${run.problemIds.length} solved`}
                </p>
              </div>
              {run.status === "active" ? (
                <>
                  <span
                    className={cn(
                      "font-mono text-lg",
                      remainingMs <= 60000 ? "text-warning" : "text-ink",
                    )}
                    aria-label="Time remaining"
                  >
                    {formatClock(remainingMs)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (!confirmAbandon) {
                        setConfirmAbandon(true);
                        return;
                      }
                      const current = runRef.current;
                      if (current && current.status === "active") {
                        finish(current, "abandoned");
                      }
                    }}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-xs transition-colors",
                      confirmAbandon
                        ? "border-error/40 bg-error/5 text-error"
                        : "border-hairline text-body-mid hover:bg-canvas-soft hover:text-ink",
                    )}
                  >
                    {confirmAbandon ? "Click again to abandon" : "Abandon"}
                  </button>
                </>
              ) : (
                <span className="font-mono text-lg text-ink">
                  {scoreText(run.score)} pts
                </span>
              )}
              <button
                type="button"
                onClick={closeOverlay}
                aria-label="Minimize"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-hairline text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink"
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

            <div className="df-scroll min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
              {run.status === "active" ? (
                <>
                  <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border border-hairline bg-canvas-card p-3">
                      <div className="text-xs text-body-mid">Score</div>
                      <div className="mt-1 font-mono text-xl text-ink">
                        {scoreText(run.score)}
                      </div>
                    </div>
                    <div className="rounded-lg border border-hairline bg-canvas-card p-3">
                      <div className="text-xs text-body-mid">Solved</div>
                      <div className="mt-1 font-mono text-xl text-ink">
                        {run.solvedIds.length}/{run.problemIds.length}
                      </div>
                    </div>
                    <div className="col-span-2 rounded-lg border border-hairline bg-canvas-card p-3 sm:col-span-1">
                      <div className="text-xs text-body-mid">
                        Par time (all problems)
                      </div>
                      <div className="mt-1 font-mono text-xl text-ink">
                        {formatClock(parTotalMs)}
                      </div>
                    </div>
                  </div>

                  {racingGhost && (
                    <div className="mb-4 space-y-3 rounded-lg border border-accent/40 bg-accent/5 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-ink">
                          Racing ghost · seed{" "}
                          <span className="font-mono">{racingGhost.seed}</span>
                        </span>
                        <span className="text-[11px] text-body-mid">
                          {formatClock(remainingMs)} left
                        </span>
                      </div>
                      <ProgressBar
                        label="You"
                        value={run.solvedIds.length}
                        total={run.problemIds.length}
                        tone="bg-accent"
                      />
                      <ProgressBar
                        label="Ghost"
                        value={ghostSolvedNow}
                        total={racingGhost.problemIds.length}
                        tone="bg-warning"
                      />
                    </div>
                  )}

                  <p className="mb-2 text-xs text-body-mid">
                    Click a problem to open it. Solves are detected
                    automatically while the clock runs.
                  </p>
                  <div className="space-y-2">
                    {run.problemIds.map((id) => {
                      const problem = problemMap.get(id);
                      if (!problem) return null;
                      return (
                        <ProblemRow
                          key={id}
                          problem={problem}
                          solvedMs={run.solvedAt[id] ?? null}
                          onOpen={() => openProblem(id)}
                        />
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="df-slide-up mx-auto max-w-2xl space-y-4">
                  <div className="rounded-lg border border-hairline bg-canvas-card p-5">
                    <h4 className="text-base font-semibold text-ink">
                      {summaryTitle}
                    </h4>
                    <p className="mt-1 text-sm text-body-mid">{summaryBlurb}</p>
                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div className="rounded-lg border border-hairline bg-canvas p-3">
                        <div className="text-xs text-body-mid">Score</div>
                        <div className="mt-1 font-mono text-xl text-ink">
                          {scoreText(run.score)}
                        </div>
                      </div>
                      <div className="rounded-lg border border-hairline bg-canvas p-3">
                        <div className="text-xs text-body-mid">Solved</div>
                        <div className="mt-1 font-mono text-xl text-ink">
                          {run.solvedIds.length}/{run.problemIds.length}
                        </div>
                      </div>
                      <div className="rounded-lg border border-hairline bg-canvas p-3">
                        <div className="text-xs text-body-mid">Best solve</div>
                        <div className="mt-1 font-mono text-xl text-ink">
                          {bestMs !== null ? formatClock(bestMs) : "—"}
                        </div>
                      </div>
                      <div className="rounded-lg border border-hairline bg-canvas p-3">
                        <div className="text-xs text-body-mid">Avg solve</div>
                        <div className="mt-1 font-mono text-xl text-ink">
                          {avgMs !== null ? formatClock(avgMs) : "—"}
                        </div>
                      </div>
                    </div>
                    <div className="mt-5">
                      <label
                        htmlFor="speedrun-code"
                        className="text-xs font-medium text-body-mid"
                      >
                        Run code
                      </label>
                      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                        <input
                          id="speedrun-code"
                          ref={codeInputRef}
                          type="text"
                          readOnly
                          value={runCode}
                          onFocus={(e) => e.currentTarget.select()}
                          className="min-w-0 flex-1 rounded-lg border border-hairline bg-canvas px-3 py-2 font-mono text-xs text-body"
                        />
                        <button
                          type="button"
                          onClick={copyRunCode}
                          className="shrink-0 rounded-lg bg-accent px-3.5 py-2 text-xs font-medium text-canvas transition-opacity hover:opacity-90"
                        >
                          {copied ? "Copied" : "Copy run code"}
                        </button>
                      </div>
                      <p className="mt-2 text-[11px] text-body-mid">
                        Share this code — it encodes the seed, score, duration,
                        and solved problems. Anyone can paste it into Speedrun
                        to compare. Scores are local and honor-system; the
                        clock and test runner both live in your browser.
                      </p>
                    </div>
                  </div>

                  {ghostComparison && (
                    <div className="rounded-lg border border-hairline bg-canvas-card p-5">
                      <h4 className="text-sm font-semibold text-ink">
                        You vs ghost
                      </h4>
                      <div className="mt-3">
                        <ComparisonTable
                          rows={ghostComparison}
                          problemMap={problemMap}
                        />
                      </div>
                    </div>
                  )}

                  <div className="rounded-lg border border-hairline bg-canvas-card p-5">
                    <h4 className="text-sm font-semibold text-ink">
                      Per-problem breakdown
                    </h4>
                    <div className="mt-3 space-y-2">
                      {run.problemIds.map((id) => {
                        const problem = problemMap.get(id);
                        if (!problem) return null;
                        return (
                          <ProblemRow
                            key={id}
                            problem={problem}
                            solvedMs={run.solvedAt[id] ?? null}
                            onOpen={() => openProblem(id)}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
