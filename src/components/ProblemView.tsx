"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Problem } from "@/types/problem";
import { backTarget } from "@/lib/problemLinks";
import { categorySlug } from "@/lib/sections";
import { cn, clipRepr, difficultyClasses } from "@/lib/utils";
import { applyEditorEdit } from "@/lib/editorInput";
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
import { SolvedBanner } from "@/components/SolvedBanner";
import { Celebration } from "@/components/Celebration";
import { Discuss } from "@/components/Discuss";
import { ProblemComments } from "@/components/ProblemComments";
import { getCurrentStreak } from "@/lib/leaderboard";
import { getDailyDateKey } from "@/lib/daily";
import {
  allowedHintTier,
  getHintTiers,
  HINT_TIER_2_ELAPSED_MS,
  HINT_TIER_3_ELAPSED_MS,
  HINT_TIER_3_FAILED_RUNS,
} from "@/lib/hints";
import { getReviewMap, gradeReviewSignal } from "@/lib/reviewQueue";
import {
  getProblemProgress,
  getProgress,
  markOpened,
  markSolved,
  saveCode,
} from "@/lib/progress";
import {
  getBugStats,
  recordBugRound,
  REASON_OK_THRESHOLD,
} from "@/lib/bugHunt";
import {
  getLatestExplanation,
  gradeExplanation,
  hasExplained,
  isExplainEnabled,
  recordExplanation,
  recordSkip,
  setExplainEnabled as persistExplainEnabled,
  type ExplainGrade,
} from "@/lib/explain";
import {
  generateBugMutants,
  hashString,
  scoreBugAnswer,
  type BugMutant,
  type BugScore,
} from "@/lib/spotBug";

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

/** Hint budget for one problem attempt ("attempt" = one visit to a problem). */
interface HintAttempt {
  problemId: string;
  /** Completed runs whose tests did not all pass. */
  failedRuns: number;
  /** Tiers ever revealed this attempt — the grading signal. */
  seen: number[];
  /** Tiers currently expanded in the hint panel. */
  open: number[];
}

function freshHintAttempt(problemId: string): HintAttempt {
  return { problemId, failedRuns: 0, seen: [], open: [] };
}

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
  const [solutionState, setSolutionState] = useState<{
    problemId: string;
    open: boolean;
  }>({ problemId: problem.id, open: false });
  const [hintAttempt, setHintAttempt] = useState(() =>
    freshHintAttempt(problem.id),
  );
  const [hintClock, setHintClock] = useState(() => Date.now());
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

  // F7 — Self-Explanation Gate ("Feynman mode").
  const [explainEnabled, setExplainEnabledState] = useState(() =>
    isExplainEnabled(),
  );
  const [explainGate, setExplainGate] = useState<{
    problemId: string;
    phase: "prompt" | "graded" | "skipped";
    pending: boolean;
    kind: "first" | "again";
  } | null>(null);
  const [explainText, setExplainText] = useState("");
  const [explainGrade, setExplainGrade] = useState<ExplainGrade | null>(null);
  const [explainVersion, setExplainVersion] = useState(0);

  // F8 — Spot-the-Bug ("debug the AI").
  const [bugHunt, setBugHunt] = useState<{
    problemId: string;
    mutant: BugMutant;
    phase: "find" | "scored";
  } | null>(null);
  const [bugLine, setBugLine] = useState(1);
  const [bugReason, setBugReason] = useState("");
  const [bugScore, setBugScore] = useState<BugScore | null>(null);
  const [bugShowFix, setBugShowFix] = useState(false);
  const [bugLoading, setBugLoading] = useState(false);
  const [bugUnavailable, setBugUnavailable] = useState(false);
  const [bugVersion, setBugVersion] = useState(0);

  const pyRef = useRef<any>(null);
  const celebratedRef = useRef<Set<string>>(new Set());
  const dialogRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const bugReasonRef = useRef<HTMLTextAreaElement>(null);
  const explainTextRef = useRef<HTMLTextAreaElement>(null);
  const preBugCodeRef = useRef<string | null>(null);
  const attemptsBugRef = useRef(0);
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

  // F7/F8 derived state — all tagged with the problem id.
  const gate = explainGate?.problemId === problem.id ? explainGate : null;
  const latestExplanation = useMemo(
    () => getLatestExplanation(problem.id),
    [problem.id, explainVersion],
  );
  const bugActive = bugHunt?.problemId === problem.id ? bugHunt : null;
  const bugMutant = bugActive?.mutant ?? null;
  const bugCandidates = useMemo(() => generateBugMutants(problem), [problem]);
  const bugStats = useMemo(() => getBugStats(), [problem.id, bugVersion]);
  const codeLineCount = code.split("\n").length;

  // Hint budget derived state — tagged with the problem id like the rest.
  const showSolution =
    solutionState.problemId === problem.id && solutionState.open;
  const currentHintAttempt =
    hintAttempt.problemId === problem.id ? hintAttempt : null;
  const hintSeen = currentHintAttempt?.seen ?? [];
  const hintOpen = currentHintAttempt?.open ?? [];
  // Start of the current attempt: the memo re-runs when the problem changes,
  // so a new problem always starts fresh (tier 1, zero elapsed).
  const hintStartedAt = useMemo(() => Date.now(), [problem.id]);
  const hintElapsedMs = Math.max(0, hintClock - hintStartedAt);
  const allowedTier = allowedHintTier({
    failedRuns: currentHintAttempt?.failedRuns ?? 0,
    elapsedMs: hintElapsedMs,
  });
  const hintTiers = useMemo(() => getHintTiers(problem), [problem]);
  const solutionLockReason = `Unlocks after ${HINT_TIER_3_FAILED_RUNS} failed runs or ${HINT_TIER_3_ELAPSED_MS / 60_000} minutes on this problem.`;
  const nextLockReason =
    allowedTier >= 3
      ? null
      : allowedTier === 1
        ? `Unlocks after a failed run or ${HINT_TIER_2_ELAPSED_MS / 60_000} minutes on this problem.`
        : solutionLockReason;

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

  // Re-render on a slow clock so time-based unlocks appear without any
  // interaction (no other timer exists in this view).
  useEffect(() => {
    const timer = window.setInterval(() => setHintClock(Date.now()), 15_000);
    return () => window.clearInterval(timer);
  }, []);

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

  const recordFailedRun = () => {
    setHintAttempt((prev) =>
      prev.problemId === problem.id
        ? { ...prev, failedRuns: prev.failedRuns + 1 }
        : { ...freshHintAttempt(problem.id), failedRuns: 1 },
    );
  };

  const setSolutionOpen = (open: boolean) => {
    setSolutionState({ problemId: problem.id, open });
  };

  // Reveal/hide one tier. A locked tier is a no-op; revealing records the tier
  // as seen so grading can never be gamed by hiding it again.
  const toggleHintTier = (level: number) => {
    if (level > allowedTier) return;
    if (level === 3) {
      if (showSolution) {
        setSolutionOpen(false);
        return;
      }
      setSolutionOpen(true);
      setHintAttempt((prev) => {
        const base =
          prev.problemId === problem.id ? prev : freshHintAttempt(problem.id);
        return base.seen.includes(3)
          ? base
          : { ...base, seen: [...base.seen, 3] };
      });
      return;
    }
    setHintAttempt((prev) => {
      const base =
        prev.problemId === problem.id ? prev : freshHintAttempt(problem.id);
      const open = base.open.includes(level)
        ? base.open.filter((n) => n !== level)
        : [...base.open, level];
      const seen = base.seen.includes(level)
        ? base.seen
        : [...base.seen, level];
      return { ...base, open, seen };
    });
  };

  // Feed this solve's struggle/hint usage into the LGS signal and apply it to
  // a due review before the solve is recorded. Clean, hint-free passes fall
  // through to the existing derive path (CLEAN_PASS via the quality adapter).
  const gradeHintAwareSolve = () => {
    const now = new Date();
    const todayKey = getDailyDateKey(now);
    const entry = getReviewMap(now)[problem.id];
    if (!entry || entry.due > todayKey) return;
    if (
      entry.lastReviewedAt &&
      getDailyDateKey(new Date(entry.lastReviewedAt)) === todayKey
    ) {
      return;
    }
    const failedRuns = currentHintAttempt?.failedRuns ?? 0;
    const hintTier = hintSeen.reduce((max, tier) => Math.max(max, tier), 0);
    if (failedRuns === 0 && hintTier === 0) return;
    gradeReviewSignal(
      problem.id,
      { passed: true, failedRuns, hintTier, resetBeforePass: false },
      now,
    );
  };

  // Shared by the editor and notebook runs. The solve is always recorded;
  // when the explanation gate is on, only the celebration waits.
  const handleAllPass = () => {
    const wasSolved = getProblemProgress(problem.id).solved === true;
    gradeHintAwareSolve();
    markSolved(problem.id);
    if (gate !== null) return;
    const kind: "first" | "again" = wasSolved ? "again" : "first";
    if (!wasSolved && explainEnabled && !hasExplained(problem.id)) {
      setExplainText("");
      setExplainGrade(null);
      setExplainGate({ problemId: problem.id, phase: "prompt", pending: true, kind });
    } else {
      if (!wasSolved) maybeCelebrate(problem.id);
      setSolveFeedback({
        problemId: problem.id,
        kind,
        streak: getCurrentStreak(getProgress()),
      });
    }
  };

  const finishExplainGate = (kind: "first" | "again") => {
    maybeCelebrate(problem.id);
    setSolveFeedback({
      problemId: problem.id,
      kind,
      streak: getCurrentStreak(getProgress()),
    });
  };

  const openExplainGate = () => {
    setExplainText("");
    setExplainGrade(null);
    setExplainGate({
      problemId: problem.id,
      phase: "prompt",
      pending: false,
      kind: getProblemProgress(problem.id).solved === true ? "again" : "first",
    });
  };

  const submitExplanation = () => {
    const text = explainText.trim();
    if (!text) return;
    const grade = gradeExplanation(problem, text);
    recordExplanation(problem.id, text, grade);
    setExplainGrade(grade);
    setExplainVersion((v) => v + 1);
    setExplainGate((prev) => (prev ? { ...prev, phase: "graded" } : prev));
  };

  const skipExplanation = () => {
    recordSkip(problem.id);
    setExplainVersion((v) => v + 1);
    setExplainGrade(null);
    if (gate?.pending) finishExplainGate(gate.kind);
    setExplainGate((prev) =>
      prev ? { ...prev, phase: "skipped", pending: false } : prev,
    );
  };

  const continueAfterExplain = () => {
    if (gate?.pending) finishExplainGate(gate.kind);
    setExplainGate(null);
  };

  const toggleExplainEnabled = () => {
    const next = !explainEnabled;
    setExplainEnabledState(next);
    persistExplainEnabled(next);
    if (!next) {
      // Turning the gate off must never hold a solve hostage.
      if (gate?.pending) finishExplainGate(gate.kind);
      setExplainGate(null);
    }
  };

  // Focus the explanation field whenever the prompt opens (including Rewrite).
  useEffect(() => {
    if (gate?.phase === "prompt") explainTextRef.current?.focus();
  }, [gate?.phase, gate?.problemId, problem.id]);

  const startBugRound = async (seed?: number) => {
    if (bugLoading || running) return;
    const candidates = generateBugMutants(problem, {
      seed: seed ?? hashString(problem.id) + attemptsBugRef.current,
      limit: 8,
    });
    if (candidates.length === 0) {
      setBugUnavailable(true);
      return;
    }
    setBugLoading(true);
    try {
      const py = await ensurePyodide();
      let found: BugMutant | null = null;
      for (const candidate of candidates) {
        const r = await runTests(py, candidate.code, problem.testCases);
        if (r.some((x) => !x.ok)) {
          found = candidate;
          break;
        }
      }
      if (!found) {
        setBugUnavailable(true);
        return;
      }
      if (preBugCodeRef.current === null) preBugCodeRef.current = code;
      if (mode === "notebook") switchMode("editor");
      setCode(found.code);
      setResults(null);
      setBugHunt({ problemId: problem.id, mutant: found, phase: "find" });
      setBugLine(1);
      setBugReason("");
      setBugScore(null);
      setBugShowFix(false);
      setMobileTab("code");
      window.setTimeout(() => bugReasonRef.current?.focus(), 0);
    } catch (e: any) {
      setPyStatus("error");
      setPyError(e?.message || String(e));
    } finally {
      setBugLoading(false);
    }
  };

  const exitBugHunt = () => {
    const restore = preBugCodeRef.current;
    preBugCodeRef.current = null;
    setBugHunt(null);
    setBugScore(null);
    setBugReason("");
    setBugShowFix(false);
    setResults(null);
    if (restore !== null) setCode(restore);
  };

  const tryAnotherBug = () => {
    attemptsBugRef.current += 1;
    void startBugRound();
  };

  const useCursorLine = () => {
    const ta = editorRef.current;
    if (!ta) return;
    const pos = ta.selectionStart ?? 0;
    const line = code.slice(0, pos).split("\n").length;
    setBugLine(Math.min(Math.max(1, line), codeLineCount));
  };

  const lockBugAnswer = () => {
    if (!bugMutant || !bugReason.trim()) return;
    const score = scoreBugAnswer(bugMutant, { line: bugLine, reason: bugReason });
    setBugScore(score);
    recordBugRound({
      problemId: problem.id,
      category: bugMutant.category,
      lineOk: score.lineCorrect,
      reasonOk: score.reasonScore >= REASON_OK_THRESHOLD,
      clean: score.verdict === "nailed-it",
    });
    setBugVersion((v) => v + 1);
    setBugHunt((prev) => (prev ? { ...prev, phase: "scored" } : prev));
  };

  const runCode = async () => {
    setRunning(true);
    setResults(null);
    try {
      const py = await ensurePyodide();
      const r = await runTests(py, code, problem.testCases);
      setResults(r);
      const allPass = r.length > 0 && r.every((x) => x.ok);
      if (!bugActive && !allPass) recordFailedRun();
      if (allPass && !bugActive) handleAllPass();
      if (!bugActive) onProgressChange?.();
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
    // Tab indents, Enter auto-indents, brackets close themselves; Shift+Tab
    // and Escape always release the editor so it can never become a keyboard
    // trap (WCAG 2.1.2).
    if (e.key !== "Escape" && !((e.metaKey || e.ctrlKey) && e.key === "Enter")) {
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
        if (!bugActive) saveCode(problem.id, edit.value);
        requestAnimationFrame(() => {
          ta.selectionStart = edit.start;
          ta.selectionEnd = edit.end;
        });
      }
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
    // The mutated code is practice material — never overwrite saved work with it.
    if (!bugActive) saveCode(problem.id, v);
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
    if (!bugActive) saveCode(problem.id, next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = start + 4;
    });
  };

  const reset = () => {
    // Reset leaves any active bug round: the code returns to the starter.
    preBugCodeRef.current = null;
    setBugHunt(null);
    setBugScore(null);
    setBugShowFix(false);
    setCode(problem.starterCode);
    setResults(null);
    setSolutionOpen(false);
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
          if (!bugActive && !allPass) recordFailedRun();
          if (allPass && !bugActive) handleAllPass();
          if (!bugActive) onProgressChange?.();
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
    if (e.key !== "Escape" && !((e.metaKey || e.ctrlKey) && e.key === "Enter")) {
      const ta = e.currentTarget;
      const latest =
        (cellsRef.current ?? []).find((c) => c.id === cell.id) ?? cell;
      const edit = applyEditorEdit(
        latest.source,
        ta.selectionStart,
        ta.selectionEnd,
        e.key,
        e.shiftKey,
      );
      if (edit) {
        e.preventDefault();
        onCellCodeChange(cell.id, edit.value);
        requestAnimationFrame(() => {
          ta.selectionStart = edit.start;
          ta.selectionEnd = edit.end;
        });
      }
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

                <div className="mt-5">
                  <div className="flex flex-wrap items-center gap-2">
                    {hintTiers.map((tier, index) => {
                      const level = index + 1;
                      const unlocked = level <= allowedTier;
                      const expanded =
                        level === 3 ? showSolution : hintOpen.includes(level);
                      return (
                        <button
                          key={tier.label}
                          type="button"
                          onClick={() => toggleHintTier(level)}
                          disabled={!unlocked}
                          aria-expanded={expanded}
                          aria-controls="df-problem-hint-tiers"
                          className={cn(
                            "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40",
                            expanded
                              ? "border-accent/40 bg-accent/5 text-ink"
                              : "border-hairline bg-canvas-soft text-body",
                            unlocked
                              ? "hover:border-accent/40 hover:text-ink"
                              : "cursor-default opacity-50",
                          )}
                        >
                          {expanded
                            ? `Hide ${tier.label.toLowerCase()}`
                            : unlocked
                              ? `Show ${tier.label.toLowerCase()}`
                              : `${tier.label} locked`}
                        </button>
                      );
                    })}
                    {hintSeen.length > 0 && (
                      <span className="font-mono text-[10px] text-mute">
                        {hintSeen.length}/{hintTiers.length}
                      </span>
                    )}
                  </div>
                  {nextLockReason && (
                    <p className="mt-2 text-[11px] text-mute">
                      {nextLockReason}
                    </p>
                  )}
                  <div
                    id="df-problem-hint-tiers"
                    aria-live="polite"
                    className="mt-2 space-y-2 empty:mt-0"
                  >
                    {hintTiers.map((tier, index) => {
                      const level = index + 1;
                      if (tier.isSolution || !hintOpen.includes(level)) {
                        return null;
                      }
                      return (
                        <div
                          key={tier.label}
                          className="rounded-lg border border-hairline bg-canvas-card p-3"
                        >
                          <div className="mb-1.5 text-[11px] font-medium text-body-mid">
                            {tier.label}
                          </div>
                          <p className="text-xs leading-relaxed text-body">
                            {tier.text}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

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
                  type="button"
                  onClick={() => toggleHintTier(3)}
                  disabled={allowedTier < 3 && !showSolution}
                  aria-expanded={showSolution}
                  aria-controls="df-problem-solution"
                  aria-describedby={
                    allowedTier < 3 && !showSolution
                      ? "df-solution-lock-reason"
                      : undefined
                  }
                  className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 disabled:cursor-default disabled:opacity-50"
                >
                  {showSolution
                    ? "Hide solution"
                    : allowedTier >= 3
                      ? "Show solution"
                      : "Solution locked"}
                </button>
                {allowedTier < 3 && !showSolution && (
                  <span id="df-solution-lock-reason" className="sr-only">
                    {solutionLockReason}
                  </span>
                )}
                {!bugActive && (
                  <button
                    type="button"
                    aria-pressed={explainEnabled}
                    onClick={toggleExplainEnabled}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-xs transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40",
                      explainEnabled
                        ? "border-accent/40 text-accent hover:bg-accent/5"
                        : "border-hairline text-body-mid hover:bg-canvas-soft hover:text-ink",
                    )}
                  >
                    Explain first: {explainEnabled ? "on" : "off"}
                  </button>
                )}
                {!bugActive && explainEnabled && gate === null && (
                  <button
                    type="button"
                    onClick={openExplainGate}
                    className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
                  >
                    Explain it back
                  </button>
                )}
                {!bugActive && bugCandidates.length > 0 && !bugUnavailable && (
                  <button
                    type="button"
                    onClick={() => void startBugRound()}
                    disabled={running || bugLoading}
                    className="rounded-lg border border-warning/40 px-3 py-1.5 text-xs text-warning transition-colors hover:bg-warning/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-warning/40 disabled:opacity-50"
                  >
                    {bugLoading ? "Preparing bug…" : "Debug the AI"}
                  </button>
                )}
                {bugActive && (
                  <button
                    type="button"
                    onClick={exitBugHunt}
                    className="rounded-lg border border-warning/40 px-3 py-1.5 text-xs text-warning transition-colors hover:bg-warning/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-warning/40"
                  >
                    Exit bug mode
                  </button>
                )}
                {pyStatus === "error" && (
                  <span className="text-xs text-error sm:text-[11px]">
                    Pyodide failed to load
                  </span>
                )}
              </div>

              {/* F8 — Spot-the-Bug ("debug the AI") */}
              {bugActive && bugMutant && (
                <section
                  aria-labelledby="df-bug-heading"
                  className="df-fade-in border-t border-warning/40 bg-warning/5 px-4 py-4 sm:px-6"
                >
                  <h3
                    id="df-bug-heading"
                    className="text-xs font-medium text-warning"
                  >
                    The AI wrote this — find the bug
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-body-mid">
                    The tests fail on this copy. Pick the line that is wrong and
                    say why in one or two sentences. Your own code is safe — this
                    is a practice copy you can leave at any time.
                  </p>

                  {bugActive.phase === "find" ? (
                    <div className="mt-3 space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="flex items-center gap-2 text-xs text-body-mid">
                          Buggy line
                          <input
                            type="number"
                            min={1}
                            max={codeLineCount}
                            value={bugLine}
                            onChange={(e) =>
                              setBugLine(
                                Math.min(
                                  Math.max(1, Number(e.target.value) || 1),
                                  codeLineCount,
                                ),
                              )
                            }
                            aria-describedby="df-bug-line-help"
                            className="w-20 rounded-md border border-hairline bg-canvas px-2 py-1 font-mono text-xs text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={useCursorLine}
                          className="rounded-md border border-hairline px-2.5 py-1 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
                        >
                          Use cursor line
                        </button>
                        <span id="df-bug-line-help" className="text-[11px] text-mute">
                          Place the cursor in the editor, then use it here.
                        </span>
                      </div>
                      <div>
                        <label
                          htmlFor="df-bug-reason"
                          className="text-xs text-body-mid"
                        >
                          Why is this line wrong?
                        </label>
                        <textarea
                          id="df-bug-reason"
                          ref={bugReasonRef}
                          value={bugReason}
                          onChange={(e) => setBugReason(e.target.value)}
                          rows={3}
                          className="mt-1 w-full resize-y rounded-md border border-hairline bg-canvas px-3 py-2 text-sm leading-relaxed text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
                        />
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={lockBugAnswer}
                          disabled={!bugReason.trim()}
                          className="rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-canvas transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50"
                        >
                          Lock in answer
                        </button>
                        <span className="text-[11px] text-mute">
                          The fix is revealed after you lock in.
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 space-y-3" aria-live="polite">
                      {bugScore && (
                        <>
                          <p className="text-xs leading-relaxed text-body">
                            {bugScore.lineCorrect
                              ? `Found it — line ${bugMutant.lineNumber} is the mutation and your reasoning covers why.`
                              : bugScore.lineNear
                                ? `Close — the bug lives on line ${bugMutant.lineNumber}, inside the statement you picked.`
                                : `The bug is on line ${bugMutant.lineNumber}, not line ${bugLine}.`}
                          </p>
                          <p className="font-mono text-[11px] text-body-mid">
                            score {bugScore.total}/100 · line{" "}
                            {bugScore.lineCorrect
                              ? "exact"
                              : bugScore.lineNear
                                ? "near"
                                : "off"}{" "}
                            · reasoning{" "}
                            {Math.round(bugScore.reasonScore * 100)}%
                          </p>
                          {bugScore.matched.length > 0 && (
                            <p className="text-xs text-body-mid">
                              You explained: {bugScore.matched.join(", ")}.
                            </p>
                          )}
                          {bugScore.missed.length > 0 && (
                            <p className="text-xs text-body-mid">
                              Worth adding: {bugScore.missed.join(", ")}.
                            </p>
                          )}
                        </>
                      )}
                      {bugStats.total > 0 && (
                        <p className="font-mono text-[11px] text-body-mid">
                          Clean hunts {bugStats.clean} of {bugStats.total} · best
                          streak {bugStats.bestCleanStreak}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setBugShowFix((v) => !v)}
                          aria-expanded={bugShowFix}
                          className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
                        >
                          {bugShowFix ? "Hide the fix" : "Show the fix"}
                        </button>
                        <button
                          type="button"
                          onClick={tryAnotherBug}
                          disabled={bugLoading || running}
                          className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 disabled:opacity-50"
                        >
                          {bugLoading ? "Preparing…" : "Try another bug"}
                        </button>
                        <button
                          type="button"
                          onClick={exitBugHunt}
                          className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
                        >
                          Exit
                        </button>
                      </div>
                      {bugShowFix && (
                        <div className="rounded-md border border-hairline bg-canvas p-3">
                          <div className="font-mono text-[10px] text-mute">
                            line {bugMutant.lineNumber}
                          </div>
                          <pre className="df-scroll mt-1 overflow-x-auto font-mono text-[11px] leading-relaxed">
                            <div className="text-error">
                              - {bugMutant.mutatedLine.trimStart()}
                            </div>
                            <div className="text-accent">
                              + {bugMutant.originalLine.trimStart()}
                            </div>
                          </pre>
                          <p className="mt-2 text-xs leading-relaxed text-body">
                            {bugMutant.rationale}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </section>
              )}

              {/* F7 — Self-Explanation Gate */}
              {!bugActive && explainEnabled && (gate !== null || latestExplanation) && (
                <section
                  aria-labelledby="df-explain-heading"
                  className="df-fade-in border-t border-hairline bg-canvas-soft/50 px-4 py-4 sm:px-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3
                        id="df-explain-heading"
                        className="text-xs font-medium text-body-mid"
                      >
                        Explain it back
                      </h3>
                      {gate?.phase === "prompt" && (
                        <p className="mt-1 text-xs leading-relaxed text-body-mid">
                          In your own words, why does this work? Say what the
                          key step does and why it gives the right answer. There
                          is no wrong answer here — it just shows which ideas
                          you covered, and it stays on this device.
                        </p>
                      )}
                    </div>
                    {gate?.phase === "prompt" && (
                      <button
                        type="button"
                        onClick={skipExplanation}
                        className="rounded-md text-xs text-mute underline-offset-2 hover:text-body hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
                      >
                        Skip for now
                      </button>
                    )}
                  </div>

                  {gate?.phase === "prompt" && (
                    <div className="mt-3">
                      <label htmlFor="df-explain-text" className="sr-only">
                        Your explanation
                      </label>
                      <textarea
                        id="df-explain-text"
                        ref={explainTextRef}
                        value={explainText}
                        onChange={(e) => setExplainText(e.target.value)}
                        rows={4}
                        placeholder="The key step is…"
                        className="w-full resize-y rounded-md border border-hairline bg-canvas px-3 py-2 text-sm leading-relaxed text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
                      />
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={submitExplanation}
                          disabled={!explainText.trim()}
                          className="rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-canvas transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50"
                        >
                          Check my explanation
                        </button>
                        <span className="text-[11px] text-mute">
                          Skipping is fine — it just leaves a marker you can
                          revisit.
                        </span>
                      </div>
                    </div>
                  )}

                  {gate?.phase === "graded" && explainGrade && (
                    <div className="mt-3 space-y-2" aria-live="polite">
                      <p className="text-xs leading-relaxed text-body">
                        {explainGrade.feedback}
                      </p>
                      <p className="font-mono text-[11px] text-body-mid">
                        key ideas: {explainGrade.hits.length} of{" "}
                        {explainGrade.hits.length + explainGrade.gaps.length} ·
                        reasoning depth:{" "}
                        {explainGrade.band === "solid"
                          ? "solid"
                          : explainGrade.band === "developing"
                            ? "getting there"
                            : "just starting"}
                      </p>
                      {explainGrade.gaps.length > 0 && (
                        <ul className="space-y-1">
                          {explainGrade.gaps.map((gap) => (
                            <li key={gap.id} className="text-xs text-body-mid">
                              {gap.question}
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={continueAfterExplain}
                          className="rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-canvas transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                        >
                          Continue
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setExplainGate((prev) =>
                              prev ? { ...prev, phase: "prompt" } : prev,
                            )
                          }
                          className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
                        >
                          Rewrite
                        </button>
                      </div>
                    </div>
                  )}

                  {gate?.phase === "skipped" && (
                    <div className="mt-3 space-y-2" aria-live="polite">
                      <p className="text-xs leading-relaxed text-body-mid">
                        Skipped — that is allowed. Your solve still counts; this
                        is marked so you can come back to it whenever you like.
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setExplainGate((prev) =>
                              prev ? { ...prev, phase: "prompt" } : prev,
                            )
                          }
                          className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
                        >
                          Explain it now
                        </button>
                        <button
                          type="button"
                          onClick={() => setExplainGate(null)}
                          className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}

                  {gate === null && latestExplanation && (
                    <details className="mt-2">
                      <summary className="cursor-pointer rounded-md text-xs text-body-mid focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40">
                        What you said last time
                      </summary>
                      <p className="mt-2 whitespace-pre-wrap rounded-md border border-hairline bg-canvas p-3 text-xs leading-relaxed text-body">
                        {latestExplanation.skipped
                          ? "You skipped this one. The offer stands."
                          : latestExplanation.text}
                      </p>
                    </details>
                  )}
                </section>
              )}

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
