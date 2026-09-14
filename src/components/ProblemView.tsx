"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Problem } from "@/types/problem";
import { backTarget } from "@/lib/problemLinks";
import { categorySlug } from "@/lib/sections";
import { cn, clipRepr, difficultyClasses } from "@/lib/utils";
import {
  extractFuncName,
  loadPyodideOnce,
  runCode as runPythonCode,
  runTests,
  type RunCodeResult,
  type TestResult,
} from "@/lib/pyodide";
import {
  addCell as addNotebookCell,
  createCell,
  getCells,
  moveCell as moveNotebookCell,
  removeCell as removeNotebookCell,
  resetNotebook,
  saveCells,
  type NotebookCell,
} from "@/lib/notebook";
import { StudyAssistant } from "@/components/StudyAssistant";
import { SolvedBanner } from "@/components/SolvedBanner";
import { Celebration } from "@/components/Celebration";
import { Discuss } from "@/components/Discuss";
import { ProblemComments } from "@/components/ProblemComments";
import { getCurrentStreak } from "@/lib/leaderboard";
import {
  getProblemProgress,
  getProgress,
  markOpened,
  markSolved,
  saveCode,
} from "@/lib/progress";

interface ProblemViewProps {
  problem: Problem;
  /** Overlay variant only; the page variant navigates with links instead. */
  onClose?: () => void;
  onProgressChange?: () => void;
  /**
   * "overlay" (default) is the full-screen dialog transient surfaces mount.
   * "page" renders the workspace in normal document flow for /problems/[id]:
   * no dialog semantics, no scroll lock, and a labelled back control instead
   * of the ✕.
   */
  variant?: "overlay" | "page";
}

type PyStatus = "idle" | "loading" | "ready" | "error";

type EditorMode = "editor" | "notebook";

export function ProblemView({
  problem,
  onClose,
  onProgressChange,
  variant = "overlay",
}: ProblemViewProps) {
  const isPage = variant === "page";
  const searchParams = useSearchParams();
  const back = backTarget(searchParams.get("from"));

  const initialCode =
    getProblemProgress(problem.id).savedCode || problem.starterCode;

  const [code, setCode] = useState(initialCode);
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [running, setRunning] = useState(false);
  const [pyStatus, setPyStatus] = useState<PyStatus>("idle");
  const [pyError, setPyError] = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [modeState, setModeState] = useState<{
    problemId: string;
    mode: EditorMode;
  }>({ problemId: problem.id, mode: "editor" });
  const [mobileTabState, setMobileTabState] = useState<{
    problemId: string;
    tab: "problem" | "code";
  }>({ problemId: problem.id, tab: "problem" });
  const [notebook, setNotebook] = useState<{
    problemId: string;
    cells: NotebookCell[];
  } | null>(null);
  const [cellOutputs, setCellOutputs] = useState<Record<string, RunCodeResult>>(
    {},
  );
  const [runningCellId, setRunningCellId] = useState<string | null>(null);
  const [solveFeedback, setSolveFeedback] = useState<{
    problemId: string;
    kind: "first" | "again";
    streak: number;
  } | null>(null);
  const [celebrationNonce, setCelebrationNonce] = useState(0);

  const pyRef = useRef<any>(null);
  const celebratedRef = useRef<Set<string>>(new Set());
  const dialogRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const cellsRef = useRef<NotebookCell[] | null>(null);
  const pendingCellsRef = useRef<{
    problemId: string;
    cells: NotebookCell[];
  } | null>(null);
  const persistTimerRef = useRef<number | null>(null);

  // Notebook state is tagged with the problem id, so switching problems can
  // never show another problem's cells — no reset effect needed.
  const mode = modeState.problemId === problem.id ? modeState.mode : "editor";
  const cells =
    notebook && notebook.problemId === problem.id ? notebook.cells : null;
  const mobileTab =
    mobileTabState.problemId === problem.id ? mobileTabState.tab : "problem";
  const setMobileTab = (tab: "problem" | "code") =>
    setMobileTabState({ problemId: problem.id, tab });

  // Roving tabindex for the mobile tab switcher: one tab stop, arrow keys move
  // selection and focus (APG tabs pattern).
  const onMobileTabKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    current: "problem" | "code",
  ) => {
    let next: "problem" | "code" | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      next = current === "problem" ? "code" : "problem";
    } else if (e.key === "Home") {
      next = "problem";
    } else if (e.key === "End") {
      next = "code";
    }
    if (!next) return;
    e.preventDefault();
    setMobileTab(next);
    window.requestAnimationFrame(() => {
      document.getElementById(`df-tab-${next}`)?.focus();
    });
  };

  // Mark opened on mount; lock body scroll in the overlay variant only. Re-runs
  // only when the problem changes — `code` here is the initial code, which is
  // fine because this effect is meant to fire on problem switch, not on every
  // keystroke.
  useEffect(() => {
    markOpened(problem.id, code);
    if (isPage) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [problem.id, isPage]);

  // Move focus into the dialog when it mounts or the problem changes.
  useEffect(() => {
    if (!isPage) dialogRef.current?.focus();
  }, [problem.id, isPage]);

  // Close on Escape — overlay only; the page is a normal route.
  useEffect(() => {
    if (isPage) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, isPage]);

  // Keep Tab focus cycling inside the dialog.
  const trapTab = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isPage || e.key !== "Tab") return;
    const root = dialogRef.current;
    if (!root) return;
    const focusable = Array.from(
      root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
      // Mobile tabs hide one panel at a time; never trap focus into a
      // display:none element (all elements are visible at sm+).
    ).filter((el) => el.getClientRects().length > 0);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (e.shiftKey) {
      if (active === first || active === root || !root.contains(active)) {
        e.preventDefault();
        last.focus();
      }
    } else if (active === last || active === root || !root.contains(active)) {
      e.preventDefault();
      first.focus();
    }
  };

  // Share the current problem + editor code with the Zero assistant.
  useEffect(() => {
    const t = window.setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("deepforge:problem-context", {
          detail: { problem, code },
        }),
      );
    }, 400);
    return () => window.clearTimeout(t);
  }, [problem, code]);

  // Write any debounced notebook edit to storage right away. Safe to call
  // from an unmount cleanup: it only touches refs.
  const persistPendingCells = () => {
    if (persistTimerRef.current !== null) {
      window.clearTimeout(persistTimerRef.current);
      persistTimerRef.current = null;
    }
    const pending = pendingCellsRef.current;
    pendingCellsRef.current = null;
    if (pending) saveCells(pending.problemId, pending.cells);
  };

  const schedulePersistCells = (next: NotebookCell[]) => {
    pendingCellsRef.current = { problemId: problem.id, cells: next };
    if (persistTimerRef.current !== null) {
      window.clearTimeout(persistTimerRef.current);
    }
    persistTimerRef.current = window.setTimeout(() => {
      persistTimerRef.current = null;
      const pending = pendingCellsRef.current;
      pendingCellsRef.current = null;
      if (pending) saveCells(pending.problemId, pending.cells);
    }, 400);
  };

  // Flush pending notebook edits when the dialog unmounts.
  useEffect(() => {
    return () => persistPendingCells();
  }, []);

  const ensurePyodide = async (): Promise<any> => {
    if (!pyRef.current) {
      setPyStatus("loading");
      setPyError(null);
      const py = await loadPyodideOnce();
      pyRef.current = py;
      setPyStatus("ready");
    }
    return pyRef.current;
  };

  const maybeCelebrate = (id: string) => {
    if (celebratedRef.current.has(id)) return;
    celebratedRef.current.add(id);
    if (
      typeof window.matchMedia !== "function" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    navigator.vibrate?.(10);
    setCelebrationNonce((n) => n + 1);
  };

  const runCode = async () => {
    setRunning(true);
    setResults(null);
    try {
      const py = await ensurePyodide();
      const r = await runTests(py, code, problem.testCases);
      setResults(r);
      const allPass = r.length > 0 && r.every((x) => x.ok);
      if (allPass) {
        const wasSolved = getProblemProgress(problem.id).solved === true;
        markSolved(problem.id);
        if (!wasSolved) maybeCelebrate(problem.id);
        setSolveFeedback({
          problemId: problem.id,
          kind: wasSolved ? "again" : "first",
          streak: getCurrentStreak(getProgress()),
        });
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
    // Tab indents, but Shift+Tab and Escape always release the editor so it can
    // never become a keyboard trap (WCAG 2.1.2).
    if (e.key === "Tab" && !e.shiftKey) {
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
    if (e.key === "Escape") {
      e.currentTarget.blur();
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

  // Mobile indent row — insert four spaces at the caret in the editor.
  // Mirrors the Tab-key behavior of handleEditorKey for touch keyboards.
  const insertIndent = () => {
    const ta = editorRef.current;
    if (!ta) return;
    const start = ta.selectionStart ?? code.length;
    const end = ta.selectionEnd ?? start;
    const next = code.slice(0, start) + "    " + code.slice(end);
    setCode(next);
    saveCode(problem.id, next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = start + 4;
    });
  };

  const reset = () => {
    setCode(problem.starterCode);
    setResults(null);
    setShowSolution(false);
    saveCode(problem.id, problem.starterCode);
    onProgressChange?.();
  };

  const applyNotebookCells = (next: NotebookCell[]) => {
    cellsRef.current = next;
    setNotebook({ problemId: problem.id, cells: next });
  };

  const switchMode = (next: EditorMode) => {
    if (next === mode) return;
    if (next === "notebook") {
      if (!notebook || notebook.problemId !== problem.id) {
        const initial = getCells(problem.id, code);
        applyNotebookCells(initial);
        saveCells(problem.id, initial);
      }
    } else {
      persistPendingCells();
    }
    setModeState({ problemId: problem.id, mode: next });
  };

  const onCellCodeChange = (cellId: string, source: string) => {
    const current = cellsRef.current ?? [];
    const next = current.map((c) => (c.id === cellId ? { ...c, source } : c));
    applyNotebookCells(next);
    schedulePersistCells(next);
  };

  const addCellAtEnd = () => {
    persistPendingCells();
    applyNotebookCells(addNotebookCell(problem.id, ""));
  };

  const insertCellBelow = (index: number) => {
    persistPendingCells();
    const current = cellsRef.current ?? [];
    const next = [
      ...current.slice(0, index + 1),
      createCell(""),
      ...current.slice(index + 1),
    ];
    saveCells(problem.id, next);
    applyNotebookCells(next);
  };

  const deleteCell = (cellId: string) => {
    persistPendingCells();
    applyNotebookCells(removeNotebookCell(problem.id, cellId));
    setCellOutputs((prev) => {
      if (!(cellId in prev)) return prev;
      const copy = { ...prev };
      delete copy[cellId];
      return copy;
    });
  };

  const moveNotebookCellBy = (cellId: string, direction: "up" | "down") => {
    persistPendingCells();
    applyNotebookCells(moveNotebookCell(problem.id, cellId, direction));
  };

  const resetNotebookMode = () => {
    if (persistTimerRef.current !== null) {
      window.clearTimeout(persistTimerRef.current);
      persistTimerRef.current = null;
    }
    pendingCellsRef.current = null;
    applyNotebookCells(resetNotebook(problem.id, problem.starterCode));
    setCellOutputs({});
    setResults(null);
  };

  const executeCells = async (list: NotebookCell[], checkTests: boolean) => {
    if (list.length === 0) return;
    setRunning(true);
    if (checkTests) setResults(null);
    try {
      const py = await ensurePyodide();
      for (const cell of list) {
        setRunningCellId(cell.id);
        const output = await runPythonCode(py, cell.source);
        setCellOutputs((prev) => ({ ...prev, [cell.id]: output }));
      }
      if (checkTests) {
        const last = list[list.length - 1];
        const expectedName = extractFuncName(problem.starterCode);
        const actualName = extractFuncName(last.source);
        if (expectedName && actualName && expectedName === actualName) {
          const combined = list.map((c) => c.source).join("\n\n");
          const r = await runTests(py, combined, problem.testCases);
          setResults(r);
          const allPass = r.length > 0 && r.every((x) => x.ok);
          if (allPass) {
            const wasSolved = getProblemProgress(problem.id).solved === true;
            markSolved(problem.id);
            if (!wasSolved) maybeCelebrate(problem.id);
            setSolveFeedback({
              problemId: problem.id,
              kind: wasSolved ? "again" : "first",
              streak: getCurrentStreak(getProgress()),
            });
          }
          onProgressChange?.();
        }
      }
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
      setRunningCellId(null);
    }
  };

  const handleCellKey = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    cell: NotebookCell,
  ) => {
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      const ta = e.currentTarget;
      const latest =
        (cellsRef.current ?? []).find((c) => c.id === cell.id) ?? cell;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next =
        latest.source.slice(0, start) + "    " + latest.source.slice(end);
      onCellCodeChange(cell.id, next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 4;
      });
    }
    if (e.key === "Escape") {
      e.currentTarget.blur();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (!running) void executeCells([cell], false);
    }
  };

  const allPass =
    results !== null && results.length > 0 && results.every((r) => r.ok);
  const solveNotice =
    solveFeedback && solveFeedback.problemId === problem.id
      ? solveFeedback
      : null;
  const passCount = results !== null ? results.filter((r) => r.ok).length : 0;
  const notebookCells = cells ?? [];

  // In page mode the route owns the single H1, so panel titles become h2.
  const SectionHeading = isPage ? "h2" : "h3";

  return (
    <div
      ref={dialogRef}
      tabIndex={isPage ? undefined : -1}
      onKeyDown={isPage ? undefined : trapTab}
      role={isPage ? undefined : "dialog"}
      aria-modal={isPage ? undefined : true}
      aria-label={isPage ? undefined : `Problem: ${problem.title}`}
      className={cn(
        "focus:outline-none",
        isPage
          ? "scroll-mt-16"
          : "df-fade-in df-dvh fixed inset-0 z-50 flex items-stretch justify-center bg-canvas/80 backdrop-blur-sm",
      )}
    >
      <div className={cn("flex w-full flex-col", !isPage && "h-full")}>
        {isPage ? (
          <>
            {/* Back control — the workspace is a route, not a modal */}
            <Link
              href={back.href}
              className="inline-flex min-h-11 w-fit items-center gap-1.5 rounded-md text-sm text-body-mid transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden
              >
                <path
                  d="M8.5 2.5L4 7l4.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {back.label}
            </Link>

            {/* The single H1 for the route — PageShell renders no title here */}
            <header className="mt-5 flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-xs font-medium",
                    difficultyClasses(problem.difficulty),
                  )}
                >
                  {problem.difficulty}
                </span>
                <Link
                  href={`/categories/${categorySlug(problem.category)}`}
                  className="rounded-full border border-hairline bg-canvas-card px-2 py-0.5 text-xs text-body-mid transition-colors hover:border-accent/40 hover:text-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
                >
                  {problem.category}
                </Link>
                <span className="font-mono text-xs text-mute">
                  {problem.id}
                </span>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                {problem.title}
              </h1>
            </header>
          </>
        ) : (
          /* Top bar */
          <div className="df-safe-top flex items-center justify-between border-b border-hairline px-4 py-3 sm:px-6">
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
              className="ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-hairline text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:h-8 sm:w-8"
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
        )}

        {/* Mobile tab switcher — hidden at sm+ where both panels show */}
        <div
          role="tablist"
          aria-label="Problem and code"
          className={cn(
            "flex border-b border-hairline bg-canvas px-2 sm:hidden",
            isPage && "mt-5",
          )}
        >
          <button
            type="button"
            role="tab"
            id="df-tab-problem"
            aria-controls="df-panel-problem"
            aria-selected={mobileTab === "problem"}
            tabIndex={mobileTab === "problem" ? 0 : -1}
            onClick={() => setMobileTab("problem")}
            onKeyDown={(e) => onMobileTabKeyDown(e, "problem")}
            className={cn(
              "min-h-11 flex-1 border-b-2 px-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-accent/40",
              mobileTab === "problem"
                ? "border-accent text-ink"
                : "border-transparent text-body-mid",
            )}
          >
            Problem
          </button>
          <button
            type="button"
            role="tab"
            id="df-tab-code"
            aria-controls="df-panel-code"
            aria-selected={mobileTab === "code"}
            tabIndex={mobileTab === "code" ? 0 : -1}
            onClick={() => setMobileTab("code")}
            onKeyDown={(e) => onMobileTabKeyDown(e, "code")}
            className={cn(
              "min-h-11 flex-1 border-b-2 px-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-accent/40",
              mobileTab === "code"
                ? "border-accent text-ink"
                : "border-transparent text-body-mid",
            )}
          >
            Code
          </button>
        </div>

        {/* Body — two columns on desktop, single scroll on mobile */}
        <div className={cn(isPage ? "mt-6" : "df-scroll flex-1 overflow-y-auto")}>
          <div
            className={cn(
              "grid grid-cols-1",
              isPage
                ? "items-start gap-6 lg:grid-cols-2"
                : "mx-auto max-w-7xl gap-px bg-hairline lg:grid-cols-2",
            )}
          >
            {/* Left: description */}
            <div
              id="df-panel-problem"
              role="tabpanel"
              aria-labelledby="df-tab-problem"
              className={cn(
                "scroll-mt-16",
                isPage
                  ? "flex-col"
                  : "bg-canvas px-4 py-5 sm:px-6 sm:py-6",
                mobileTab === "problem"
                  ? isPage
                    ? "flex"
                    : "block"
                  : isPage
                    ? "hidden sm:flex"
                    : "hidden sm:block",
              )}
            >
              <div
                className={cn(
                  isPage &&
                    "rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5",
                )}
              >
                <SectionHeading
                  className={cn(
                    "mb-2 font-medium text-body-mid",
                    isPage ? "text-sm" : "text-xs",
                  )}
                >
                  Problem
                </SectionHeading>
                <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-body">
                  {problem.description}
                </pre>

                {problem.hint && (
                  <div className="mt-5">
                    <button
                      onClick={() => setShowHint((v) => !v)}
                      aria-expanded={showHint}
                      aria-controls="df-problem-hint"
                      className="rounded-md text-xs text-accent transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
                    >
                      {showHint ? "Hide hint" : "Show hint"}
                    </button>
                    {showHint && (
                      <p
                        id="df-problem-hint"
                        className="mt-2 rounded-md border border-hairline bg-canvas-card p-3 text-xs leading-relaxed text-body"
                      >
                        {problem.hint}
                      </p>
                    )}
                  </div>
                )}

                <StudyAssistant key={problem.id} problem={problem} />

                <div className="mt-5">
                  <SectionHeading
                    className={cn(
                      "mb-2 font-medium text-body-mid",
                      isPage ? "text-sm" : "text-xs",
                    )}
                  >
                    Test cases
                  </SectionHeading>
                  <div className="space-y-2">
                    {problem.testCases.map((tc, i) => (
                      <div
                        key={i}
                        className="rounded-md border border-hairline bg-canvas-card p-2.5"
                      >
                        <div className="mb-1 font-mono text-[10px] text-mute">
                          case {i + 1}
                        </div>
                        <div className="break-words font-mono text-xs text-body">
                          <span className="text-body-mid">in:</span>{" "}
                          {clipRepr(JSON.stringify(tc.input), 160)}
                        </div>
                        <div className="break-words font-mono text-xs text-body">
                          <span className="text-body-mid">expected:</span>{" "}
                          {clipRepr(JSON.stringify(tc.expected), 160)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {showSolution && (
                  <div id="df-problem-solution" className="mt-5">
                    <SectionHeading
                      className={cn(
                        "mb-2 font-medium text-body-mid",
                        isPage ? "text-sm" : "text-xs",
                      )}
                    >
                      Reference solution
                    </SectionHeading>
                    <pre className="df-scroll overflow-x-auto rounded-md border border-hairline bg-canvas-card p-3 font-mono text-xs leading-relaxed text-body">
                      {problem.solution}
                    </pre>
                  </div>
                )}
              </div>

              <Discuss key={problem.id} problemId={problem.id} />
            </div>

            {/* Right: editor + results */}
            <div
              id="df-panel-code"
              role="tabpanel"
              aria-labelledby="df-tab-code"
              className={cn(
                "flex-col",
                isPage
                  ? "df-scroll overflow-hidden rounded-lg border border-hairline bg-canvas-card lg:sticky lg:top-16 lg:max-h-[calc(100dvh-5rem)] lg:overflow-y-auto"
                  : "bg-canvas",
                mobileTab === "code" ? "flex" : "hidden sm:flex",
              )}
            >
              <div className="flex items-center justify-between gap-2 border-b border-hairline px-4 py-2 sm:px-6">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-body-mid">
                    Solution
                  </span>
                  <div
                    role="group"
                    aria-label="Solution editor mode"
                    className="inline-flex overflow-hidden rounded-md border border-hairline"
                  >
                    <button
                      type="button"
                      aria-pressed={mode === "editor"}
                      onClick={() => switchMode("editor")}
                      className={cn(
                        "px-2.5 py-1 text-[11px] font-medium transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40",
                        mode === "editor"
                          ? "bg-canvas-soft text-ink"
                          : "text-body-mid hover:bg-canvas-soft hover:text-ink",
                      )}
                    >
                      Editor
                    </button>
                    <button
                      type="button"
                      aria-pressed={mode === "notebook"}
                      onClick={() => switchMode("notebook")}
                      className={cn(
                        "border-l border-hairline px-2.5 py-1 text-[11px] font-medium transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40",
                        mode === "notebook"
                          ? "bg-canvas-soft text-ink"
                          : "text-body-mid hover:bg-canvas-soft hover:text-ink",
                      )}
                    >
                      Notebook
                    </button>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-mute">
                  ⌘+Enter to run
                </span>
              </div>
              <span id="df-editor-help" className="sr-only">
                Press Tab to indent, Shift+Tab to leave the editor, or Escape to
                release the editor before moving on.
              </span>
              {mode === "notebook" ? (
                <div
                  className={cn(
                    "df-scroll min-h-[260px] flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-6",
                    isPage && "sm:min-h-[360px] lg:min-h-[420px]",
                  )}
                >
                  {notebookCells.length === 0 && (
                    <p className="text-xs text-mute">
                      No cells yet. Add one below to start experimenting.
                    </p>
                  )}
                  {notebookCells.map((cell, i) => {
                    const output = cellOutputs[cell.id];
                    const cellRunning = runningCellId === cell.id;
                    return (
                      <div
                        key={cell.id}
                        className="rounded-lg border border-hairline bg-canvas-card"
                      >
                        <div className="flex flex-wrap items-center gap-1 border-b border-hairline px-2 py-1.5">
                          <span className="mr-1 font-mono text-[10px] text-mute">
                            {i + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => void executeCells([cell], false)}
                            disabled={running}
                            className="rounded-md border border-hairline px-2 py-0.5 text-[10px] font-medium text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 disabled:opacity-40"
                          >
                            Run
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              void executeCells(
                                notebookCells.slice(0, i + 1),
                                false,
                              )
                            }
                            disabled={running}
                            className="rounded-md border border-hairline px-2 py-0.5 text-[10px] font-medium text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 disabled:opacity-40"
                          >
                            Run above
                          </button>
                          <button
                            type="button"
                            aria-label={`Move cell ${i + 1} up`}
                            onClick={() => moveNotebookCellBy(cell.id, "up")}
                            disabled={running || i === 0}
                            className="flex h-6 w-6 items-center justify-center rounded-md border border-hairline text-[10px] text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 disabled:opacity-40"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            aria-label={`Move cell ${i + 1} down`}
                            onClick={() => moveNotebookCellBy(cell.id, "down")}
                            disabled={running || i === notebookCells.length - 1}
                            className="flex h-6 w-6 items-center justify-center rounded-md border border-hairline text-[10px] text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 disabled:opacity-40"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => insertCellBelow(i)}
                            disabled={running}
                            className="rounded-md border border-hairline px-2 py-0.5 text-[10px] font-medium text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 disabled:opacity-40"
                          >
                            Insert below
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteCell(cell.id)}
                            disabled={running}
                            className="rounded-md border border-hairline px-2 py-0.5 text-[10px] font-medium text-body-mid transition-colors hover:bg-canvas-soft hover:text-error focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 disabled:opacity-40"
                          >
                            Delete
                          </button>
                        </div>
                        <textarea
                          value={cell.source}
                          onChange={(e) =>
                            onCellCodeChange(cell.id, e.target.value)
                          }
                          onKeyDown={(e) => handleCellKey(e, cell)}
                          rows={4}
                          spellCheck={false}
                          autoCapitalize="off"
                          autoCorrect="off"
                          aria-label={`Cell ${i + 1} code`}
                          aria-describedby="df-editor-help"
                          className="df-code-editor df-scroll block w-full resize-y bg-canvas-card px-3 py-2.5 text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-accent/40"
                        />
                        {(cellRunning || output) && (
                          <div className="space-y-1.5 border-t border-hairline bg-canvas-soft px-3 py-2">
                            {cellRunning && (
                              <div className="flex items-center gap-2 text-xs text-body-mid sm:text-[11px]">
                                <span className="df-spin h-3 w-3 rounded-full border-2 border-hairline border-t-accent" />
                                Running…
                              </div>
                            )}
                            {output?.error && (
                              <pre className="overflow-x-auto whitespace-pre-wrap rounded-md border border-error/40 bg-error/5 p-2 font-mono text-xs text-error sm:text-[11px]">
                                {output.error}
                              </pre>
                            )}
                            {output?.stdout && (
                              <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs text-body sm:text-[11px]">
                                {output.stdout}
                              </pre>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    onClick={addCellAtEnd}
                    disabled={running}
                    className="w-full rounded-lg border border-dashed border-hairline px-3 py-2 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 disabled:opacity-50"
                  >
                    + Add cell
                  </button>
                </div>
              ) : (
                <textarea
                  ref={editorRef}
                  value={code}
                  onChange={(e) => onCodeChange(e.target.value)}
                  onKeyDown={handleEditorKey}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                  className={cn(
                    "df-code-editor df-scroll min-h-[260px] flex-1 resize-none bg-canvas px-4 py-4 text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-accent/40 sm:px-6",
                    isPage && "sm:min-h-[360px] lg:min-h-[420px]",
                  )}
                  aria-label="Code editor"
                  aria-describedby="df-editor-help"
                />
              )}

              {/* Action bar */}
              <div className="flex flex-wrap items-center gap-2 border-t border-hairline px-4 py-3 sm:px-6">
                <button
                  onClick={
                    mode === "notebook"
                      ? () => void executeCells(notebookCells, true)
                      : runCode
                  }
                  disabled={
                    running ||
                    (mode === "notebook" && notebookCells.length === 0)
                  }
                  aria-busy={running}
                  className="inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-canvas transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50"
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
                      {mode === "notebook" ? "Run all" : "Run"}
                    </>
                  )}
                </button>
                <button
                  onClick={mode === "notebook" ? resetNotebookMode : reset}
                  disabled={running}
                  className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 disabled:opacity-50"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowSolution((v) => !v)}
                  aria-expanded={showSolution}
                  aria-controls="df-problem-solution"
                  className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
                >
                  {showSolution ? "Hide solution" : "Show solution"}
                </button>
                {pyStatus === "error" && (
                  <span className="text-xs text-error sm:text-[11px]">
                    Pyodide failed to load
                  </span>
                )}
              </div>

              {allPass && solveNotice && (
                <div className="px-4 py-4 sm:px-6">
                  <SolvedBanner
                    kind={solveNotice.kind}
                    passed={passCount}
                    streak={solveNotice.streak}
                  />
                </div>
              )}

              {celebrationNonce > 0 && (
                <Celebration
                  key={celebrationNonce}
                  onDone={() => setCelebrationNonce(0)}
                />
              )}

              {/* Results */}
              <div
                className="border-t border-hairline px-4 py-4 sm:px-6"
                aria-live="polite"
              >
                <div className="mb-3 flex items-center justify-between">
                  <SectionHeading
                    className={cn(
                      "font-medium text-body-mid",
                      isPage ? "text-sm" : "text-xs",
                    )}
                  >
                    Results
                  </SectionHeading>
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
                        <div className="mb-1 text-xs font-medium text-error sm:text-[10px]">
                          Pyodide error
                        </div>
                        <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs text-body sm:text-[11px]">
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
                          <span className="font-mono text-xs text-mute sm:text-[10px]">
                            case {i + 1}
                          </span>
                          <span
                            className={cn(
                              "text-xs font-medium sm:text-[10px]",
                              r.ok ? "text-accent" : "text-error",
                            )}
                          >
                            {r.ok ? "passed" : "failed"}
                          </span>
                        </div>
                        {r.error ? (
                          <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs text-error sm:text-[11px]">
                            {r.error}
                          </pre>
                        ) : (
                          <div className="space-y-1">
                            <div className="break-words font-mono text-xs text-body sm:text-[11px]">
                              <span className="text-body-mid">actual: </span>
                              {clipRepr(r.actual, 240)}
                            </div>
                            {!r.ok && (
                              <div className="break-words font-mono text-xs text-body-mid sm:text-[11px]">
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

          {isPage && (
            <section
              aria-labelledby="df-discussion-heading"
              className="mt-10 border-t border-hairline pt-8 sm:mt-12 sm:pt-12"
            >
              <h2
                id="df-discussion-heading"
                className="text-lg font-semibold tracking-tight text-ink"
              >
                Discussion
              </h2>
              <div className="mt-4">
                <ProblemComments problemId={problem.id} />
              </div>
            </section>
          )}
        </div>

        {/* Mobile footer — indent keys + always-reachable primary actions */}
        <div className="shrink-0 sm:hidden">
          {mode === "editor" && (
            <div
              role="group"
              aria-label="Code indentation"
              className="flex items-center gap-2 border-t border-hairline bg-canvas px-4 py-2"
            >
              <button
                type="button"
                onClick={insertIndent}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md border border-hairline font-mono text-xs text-body-mid transition-colors active:bg-canvas-soft focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
              >
                Tab
              </button>
              <button
                type="button"
                onClick={insertIndent}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md border border-hairline font-mono text-xs text-body-mid transition-colors active:bg-canvas-soft focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
              >
                4 spaces
              </button>
            </div>
          )}
          <div className="df-safe-bottom sticky bottom-0 z-10 flex items-center gap-2 border-t border-hairline bg-canvas px-4 py-3">
            <button
              onClick={
                mode === "notebook"
                  ? () => void executeCells(notebookCells, true)
                  : runCode
              }
              disabled={
                running || (mode === "notebook" && notebookCells.length === 0)
              }
              aria-busy={running}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-accent px-3.5 text-sm font-medium text-canvas transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50"
            >
              {running ? (
                <>
                  <span className="df-spin h-3 w-3 rounded-full border-2 border-canvas/40 border-t-canvas" />
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
                  {mode === "notebook" ? "Run all" : "Run"}
                </>
              )}
            </button>
            <button
              onClick={mode === "notebook" ? resetNotebookMode : reset}
              disabled={running}
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border border-hairline px-3 text-sm text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
