"use client";

import { useEffect, useMemo, useState } from "react";
import { PENPAPER_PROBLEMS, type PenPaperProblem } from "@/data/penpaper";
import {
  PENPAPER_CHANGE_EVENT,
  getPenPaperProgress,
  getPenPaperStats,
  recordPenPaperAnswer,
  resetPenPaperProgress,
  type PenPaperProgressMap,
  type PenPaperStats,
} from "@/lib/penpaper";
import { cn, difficultyClasses } from "@/lib/utils";

function hashId(id: string): number {
  let hash = 2166136261;
  for (let i = 0; i < id.length; i += 1) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

const ORDERED_PROBLEMS = [...PENPAPER_PROBLEMS].sort(
  (a, b) => hashId(a.id) - hashId(b.id) || a.id.localeCompare(b.id),
);

const CATEGORIES = Array.from(
  new Set(PENPAPER_PROBLEMS.map((problem) => problem.category)),
);

const EMPTY_STATS: PenPaperStats = {
  attempted: 0,
  correct: 0,
  total: PENPAPER_PROBLEMS.length,
};

function formatAnswer(problem: PenPaperProblem): string {
  if (typeof problem.answer !== "number") return problem.answer;
  if (Number.isInteger(problem.answer)) return String(problem.answer);
  return String(parseFloat(problem.answer.toFixed(6)));
}

function chipClasses(active: boolean): string {
  return cn(
    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
    active
      ? "border-accent/40 bg-accent/5 text-accent"
      : "border-hairline text-body-mid hover:bg-canvas-soft hover:text-ink",
  );
}

export function PenPaper() {
  const [progress, setProgress] = useState<PenPaperProgressMap>({});
  const [stats, setStats] = useState<PenPaperStats>(EMPTY_STATS);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cursor, setCursor] = useState(0);
  const [phase, setPhase] = useState<"answering" | "checked">("answering");
  const [selected, setSelected] = useState<string | null>(null);
  const [numericInput, setNumericInput] = useState("");
  const [wasCorrect, setWasCorrect] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);

  useEffect(() => {
    const load = () => {
      setProgress(getPenPaperProgress());
      setStats(getPenPaperStats());
    };
    load();
    window.addEventListener(PENPAPER_CHANGE_EVENT, load);
    return () => window.removeEventListener(PENPAPER_CHANGE_EVENT, load);
  }, []);

  const order = useMemo(
    () =>
      activeCategory === null
        ? ORDERED_PROBLEMS
        : ORDERED_PROBLEMS.filter(
            (problem) => problem.category === activeCategory,
          ),
    [activeCategory],
  );

  const problem = order.length > 0 ? order[cursor % order.length] : null;

  const resetAnswerState = () => {
    setPhase("answering");
    setSelected(null);
    setNumericInput("");
    setWasCorrect(false);
    setHintOpen(false);
  };

  const selectCategory = (category: string | null) => {
    setActiveCategory(category);
    setCursor(0);
    resetAnswerState();
  };

  const advance = () => {
    if (order.length === 0) return;
    setCursor((current) => (current + 1) % order.length);
    resetAnswerState();
  };

  const check = () => {
    if (!problem || phase !== "answering") return;
    let correct = false;
    if (problem.options) {
      if (selected === null) return;
      correct = selected === problem.answer;
    } else {
      const value = Number(numericInput.trim());
      if (numericInput.trim() === "" || !Number.isFinite(value)) return;
      const tolerance = problem.tolerance ?? 1e-6;
      correct = Math.abs(value - Number(problem.answer)) <= tolerance;
    }
    setPhase("checked");
    setWasCorrect(correct);
    recordPenPaperAnswer(problem.id, correct);
  };

  const handleReset = () => {
    if (typeof window === "undefined") return;
    const confirmed = window.confirm(
      "Reset all Pen & Paper Math progress? This cannot be undone.",
    );
    if (!confirmed) return;
    resetPenPaperProgress();
    setCursor(0);
    resetAnswerState();
  };

  const numericValid =
    problem !== null &&
    !problem.options &&
    numericInput.trim() !== "" &&
    Number.isFinite(Number(numericInput.trim()));

  const canCheck =
    problem !== null && (problem.options ? selected !== null : numericValid);

  const attemptedPct =
    stats.total > 0 ? (stats.attempted / stats.total) * 100 : 0;
  const correctPct = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;

  const alreadyCorrect = problem
    ? Boolean(progress[problem.id]?.correct)
    : false;

  return (
    <section
      id="math"
      className="mx-auto max-w-6xl scroll-mt-16 px-4 py-12 sm:px-6 sm:py-16"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Pen &amp; Paper Math
        </h2>
        <p className="mt-1 text-sm text-body-mid">
          No code required. Work each problem by hand and answer with multiple
          choice or a number.
        </p>
      </div>

      <div
        className="mb-4 flex flex-wrap gap-1.5"
        role="group"
        aria-label="Filter problems by category"
      >
        <button
          type="button"
          aria-pressed={activeCategory === null}
          onClick={() => selectCategory(null)}
          className={chipClasses(activeCategory === null)}
        >
          All
        </button>
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            aria-pressed={activeCategory === category}
            onClick={() => selectCategory(category)}
            className={chipClasses(activeCategory === category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-hairline bg-canvas-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="font-mono text-xs text-body-mid">
              {stats.attempted}/{stats.total} attempted
            </span>
            <span className="font-mono text-xs text-accent">
              {stats.correct}/{stats.total} correct
            </span>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink"
          >
            Reset
          </button>
        </div>
        <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-canvas-soft">
          <div
            className="absolute inset-y-0 left-0 bg-accent/25"
            style={{ width: `${attemptedPct}%` }}
          />
          <div
            className="absolute inset-y-0 left-0 bg-accent"
            style={{ width: `${correctPct}%` }}
          />
        </div>
      </div>

      {problem ? (
        <div className="mt-4 rounded-lg border border-hairline bg-canvas-card p-4 sm:p-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className="font-mono text-body-mid">{problem.id}</span>
            <span className="text-body">{problem.category}</span>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                difficultyClasses(problem.difficulty),
              )}
            >
              {problem.difficulty}
            </span>
            {alreadyCorrect && (
              <span className="text-[10px] font-medium text-accent">
                Solved earlier
              </span>
            )}
            <span className="ml-auto font-mono text-body-mid">
              {(cursor % order.length) + 1} / {order.length}
            </span>
          </div>

          <p className="mt-4 text-base leading-relaxed text-ink">
            {problem.question}
          </p>

          {problem.hint && (
            <div className="mt-3">
              {hintOpen ? (
                <p className="rounded-lg border border-hairline bg-canvas-soft px-3 py-2 text-xs leading-relaxed text-body-mid">
                  {problem.hint}
                </p>
              ) : (
                phase === "answering" && (
                  <button
                    type="button"
                    onClick={() => setHintOpen(true)}
                    className="text-xs text-body-mid transition-colors hover:text-ink"
                  >
                    Show hint
                  </button>
                )
              )}
            </div>
          )}

          <form
            className="mt-4"
            onSubmit={(event) => {
              event.preventDefault();
              check();
            }}
          >
            {problem.options ? (
              <div className="grid grid-cols-1 gap-2">
                {problem.options.map((option) => {
                  const isSelected = selected === option;
                  const isAnswer = option === problem.answer;
                  let optionClasses =
                    "border-hairline bg-canvas text-body hover:bg-canvas-soft hover:text-ink";
                  if (phase === "checked") {
                    if (isAnswer) {
                      optionClasses = "border-accent/40 bg-accent/5 text-accent";
                    } else if (isSelected) {
                      optionClasses = "border-error/40 bg-error/5 text-error";
                    } else {
                      optionClasses = "border-hairline text-body-mid";
                    }
                  } else if (isSelected) {
                    optionClasses = "border-accent bg-accent/5 text-ink";
                  }
                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={phase === "checked"}
                      aria-pressed={isSelected}
                      onClick={() => setSelected(option)}
                      className={cn(
                        "w-full rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                        optionClasses,
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            ) : (
              <input
                type="text"
                inputMode="decimal"
                value={numericInput}
                disabled={phase === "checked"}
                onChange={(event) => setNumericInput(event.target.value)}
                placeholder="Type a number"
                aria-label="Your numeric answer"
                className={cn(
                  "w-full rounded-lg border bg-canvas px-3 py-2.5 font-mono text-sm text-ink placeholder:text-body-mid focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent",
                  phase === "checked"
                    ? wasCorrect
                      ? "border-accent/40"
                      : "border-error/40"
                    : "border-hairline",
                )}
              />
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              {phase === "answering" ? (
                <>
                  <button
                    type="button"
                    onClick={advance}
                    className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink"
                  >
                    Skip
                  </button>
                  <button
                    type="submit"
                    disabled={!canCheck}
                    className="rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-canvas transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Check
                  </button>
                </>
              ) : (
                <>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      wasCorrect ? "text-accent" : "text-error",
                    )}
                  >
                    {wasCorrect ? "Correct" : "Not quite"}
                  </span>
                  <button
                    type="button"
                    onClick={advance}
                    className="rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-canvas transition-opacity hover:opacity-90"
                  >
                    Next
                  </button>
                </>
              )}
            </div>
          </form>

          {phase === "checked" && (
            <div
              role="status"
              className={cn(
                "mt-4 rounded-lg border p-3",
                wasCorrect
                  ? "border-accent/40 bg-accent/5"
                  : "border-error/40 bg-error/5",
              )}
            >
              {!wasCorrect && (
                <p className="mb-2 text-xs text-body-mid">
                  Answer:{" "}
                  <span className="font-mono text-ink">
                    {formatAnswer(problem)}
                  </span>
                </p>
              )}
              <p className="text-sm leading-relaxed text-body">
                {problem.explanation}
              </p>
            </div>
          )}
        </div>
      ) : (
        <p className="mt-4 text-sm text-body-mid">
          No problems in this category.
        </p>
      )}
    </section>
  );
}
