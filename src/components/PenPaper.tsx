"use client";

import { useEffect, useMemo, useState } from "react";
import { CONCEPTS, type Concept } from "@/data/concepts";
import { PENPAPER_PROBLEMS, type PenPaperProblem } from "@/data/penpaper";
import { getDailyDateKey } from "@/lib/daily";
import {
  CONCEPTS_CHANGE_EVENT,
  getConceptStats,
  getConceptStates,
  getDueConcepts,
  gradeConcept,
  isConceptUnlocked,
  masteryOf,
  MASTERED_MASTERY,
  type ConceptQuality,
  type ConceptState,
  type ConceptStateMap,
  type ConceptStats,
} from "@/lib/concepts";
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

const PROBLEM_BY_ID = new Map(
  PENPAPER_PROBLEMS.map((problem) => [problem.id, problem]),
);

const CONCEPT_BY_ID = new Map(CONCEPTS.map((concept) => [concept.id, concept]));

const CONCEPT_CATEGORIES = Array.from(
  new Set(CONCEPTS.map((concept) => concept.category)),
);

const EMPTY_STATS: PenPaperStats = {
  attempted: 0,
  correct: 0,
  total: PENPAPER_PROBLEMS.length,
};

const EMPTY_CONCEPT_STATS: ConceptStats = {
  due: 0,
  mastered: 0,
  unlocked: 0,
  total: CONCEPTS.length,
};

const QUALITY_LABELS: Record<ConceptQuality, string> = {
  5: "All three correct — strong pass",
  4: "Two of three correct — pass",
  3: "One of three correct — just passing",
  0: "No correct answers — extra review scheduled",
};

function formatAnswer(problem: PenPaperProblem): string {
  if (typeof problem.answer !== "number") return problem.answer;
  if (Number.isInteger(problem.answer)) return String(problem.answer);
  return String(parseFloat(problem.answer.toFixed(6)));
}

function formatDateKey(key: string): string {
  const [year, month, day] = key.split("-").map(Number);
  if (!year || !month || !day) return key;
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function dueLabel(due: string, today: string): string {
  if (due < today) return "Overdue";
  if (due === today) return "Due today";
  return `Due ${formatDateKey(due)}`;
}

function chipClasses(active: boolean): string {
  return cn(
    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
    active
      ? "border-accent/40 bg-accent/5 text-accent"
      : "border-hairline text-body-mid hover:bg-canvas-soft hover:text-ink",
  );
}

function AnswerPanel({
  problem,
  onChecked,
  onNext,
  nextLabel = "Next",
  onSkip,
}: {
  problem: PenPaperProblem;
  onChecked?: (correct: boolean) => void;
  onNext: () => void;
  nextLabel?: string;
  onSkip?: () => void;
}) {
  const [phase, setPhase] = useState<"answering" | "checked">("answering");
  const [selected, setSelected] = useState<string | null>(null);
  const [numericInput, setNumericInput] = useState("");
  const [wasCorrect, setWasCorrect] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);

  const check = () => {
    if (phase !== "answering") return;
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
    onChecked?.(correct);
  };

  const numericValid =
    !problem.options &&
    numericInput.trim() !== "" &&
    Number.isFinite(Number(numericInput.trim()));

  const canCheck = problem.options ? selected !== null : numericValid;

  return (
    <>
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
              {onSkip ? (
                <button
                  type="button"
                  onClick={onSkip}
                  className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink"
                >
                  Skip
                </button>
              ) : (
                <span />
              )}
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
                onClick={onNext}
                className="rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-canvas transition-opacity hover:opacity-90"
              >
                {nextLabel}
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
    </>
  );
}

function ConceptPractice({
  concept,
  onGraded,
}: {
  concept: Concept;
  onGraded: () => void;
}) {
  const problems = useMemo(
    () =>
      concept.practiceIds
        .map((id) => PROBLEM_BY_ID.get(id))
        .filter((problem): problem is PenPaperProblem => Boolean(problem)),
    [concept],
  );

  const [rep, setRep] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [graded, setGraded] = useState<{
    correct: number;
    quality: ConceptQuality;
    state: ConceptState;
  } | null>(null);
  const [finished, setFinished] = useState(false);

  const problem = problems[rep] ?? null;

  const handleChecked = (correct: boolean) => {
    const next = [...results, correct];
    setResults(next);
    if (next.length === problems.length) {
      const correctCount = next.filter(Boolean).length;
      const quality: ConceptQuality =
        correctCount === 3 ? 5 : correctCount === 2 ? 4 : correctCount === 1 ? 3 : 0;
      setGraded({ correct: correctCount, quality, state: gradeConcept(concept.id, quality) });
    }
  };

  const handleNext = () => {
    if (rep + 1 < problems.length) {
      setRep(rep + 1);
    } else {
      setFinished(true);
    }
  };

  if (finished && graded) {
    return (
      <div className="df-slide-up mt-4 rounded-lg border border-hairline bg-canvas p-4 sm:p-5">
        <h4 className="text-sm font-semibold text-ink">Round complete</h4>
        <p className="mt-1 text-sm text-body-mid">
          {graded.correct} of {problems.length} correct ·{" "}
          {QUALITY_LABELS[graded.quality]}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-hairline bg-canvas-card p-3">
            <div className="text-xs text-body-mid">Next review</div>
            <div className="mt-1 font-mono text-sm text-ink">
              {formatDateKey(graded.state.due)}
            </div>
          </div>
          <div className="rounded-lg border border-hairline bg-canvas-card p-3">
            <div className="text-xs text-body-mid">Interval</div>
            <div className="mt-1 font-mono text-sm text-ink">
              {graded.state.interval} day{graded.state.interval === 1 ? "" : "s"}
            </div>
          </div>
          <div className="rounded-lg border border-hairline bg-canvas-card p-3">
            <div className="text-xs text-body-mid">Ease</div>
            <div className="mt-1 font-mono text-sm text-ink">
              {graded.state.ease.toFixed(2)}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onGraded}
          className="mt-4 rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-canvas transition-opacity hover:opacity-90"
        >
          Back to mastery
        </button>
      </div>
    );
  }

  if (!problem) {
    return (
      <p className="mt-4 text-sm text-body-mid">No practice items found.</p>
    );
  }

  return (
    <div>
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
        <span className="ml-auto font-mono text-body-mid">
          Rep {rep + 1} / {problems.length}
        </span>
      </div>
      <AnswerPanel
        key={`${problem.id}:${rep}`}
        problem={problem}
        onChecked={handleChecked}
        onNext={handleNext}
        nextLabel={rep + 1 === problems.length ? "See results" : "Next rep"}
      />
    </div>
  );
}

function ConceptCard({
  concept,
  state,
  unlocked,
  today,
  onOpen,
}: {
  concept: Concept;
  state: ConceptState | undefined;
  unlocked: boolean;
  today: string;
  onOpen: () => void;
}) {
  const mastery = masteryOf(state);
  const mastered = mastery >= MASTERED_MASTERY;
  const prereqNames = concept.prerequisites
    .map((id) => CONCEPT_BY_ID.get(id)?.title ?? id)
    .join(", ");

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "flex w-full flex-col gap-3 rounded-lg border p-4 text-left transition-colors sm:p-5",
        unlocked
          ? "border-hairline bg-canvas-card hover:bg-canvas-soft"
          : "border-hairline bg-canvas-card opacity-60 hover:opacity-90",
      )}
    >
      <div className="flex w-full items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-ink">{concept.title}</h4>
        {unlocked ? (
          mastered && (
            <span className="shrink-0 rounded-full border border-accent/40 bg-accent/5 px-2 py-0.5 text-[10px] font-medium text-accent">
              Mastered
            </span>
          )
        ) : (
          <span className="shrink-0 rounded-full border border-warning/40 bg-warning/5 px-2 py-0.5 text-[10px] font-medium text-warning">
            Locked
          </span>
        )}
      </div>
      <p className="text-xs leading-relaxed text-body-mid">{concept.blurb}</p>
      <div className="mt-auto w-full">
        <div className="flex items-center justify-between gap-2 font-mono text-[10px] text-body-mid">
          <span>{Math.round(mastery)}% mastery</span>
          <span>{state ? dueLabel(state.due, today) : "Not started"}</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-canvas-soft">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${Math.min(100, mastery)}%` }}
          />
        </div>
        {!unlocked && prereqNames && (
          <p className="mt-2 text-[10px] leading-relaxed text-body-mid">
            Requires: {prereqNames}
          </p>
        )}
      </div>
    </button>
  );
}

function ConceptDetail({
  concept,
  states,
  today,
  onClose,
  onGraded,
}: {
  concept: Concept;
  states: ConceptStateMap;
  today: string;
  onClose: () => void;
  onGraded: () => void;
}) {
  const [stepsOpen, setStepsOpen] = useState(false);
  const worked = PROBLEM_BY_ID.get(concept.workedExampleId);
  const state = states[concept.id];
  const unlocked = isConceptUnlocked(concept, states);
  const mastery = masteryOf(state);
  const prereqNames = concept.prerequisites
    .map((id) => CONCEPT_BY_ID.get(id)?.title ?? id)
    .join(", ");

  return (
    <div className="df-slide-up space-y-4">
      <button
        type="button"
        onClick={onClose}
        className="text-xs text-body-mid transition-colors hover:text-ink"
      >
        ← All concepts
      </button>

      <div className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className="text-body">{concept.category}</span>
          <span className="font-mono text-body-mid">{concept.id}</span>
          <span className="ml-auto font-mono text-body-mid">
            {Math.round(mastery)}% mastery
          </span>
        </div>
        <h3 className="mt-2 text-lg font-semibold tracking-tight text-ink">
          {concept.title}
        </h3>
        <p className="mt-1 text-sm text-body-mid">{concept.blurb}</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-canvas-soft">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${Math.min(100, mastery)}%` }}
          />
        </div>
        {state && state.reps > 0 && (
          <p className="mt-2 font-mono text-[11px] text-body-mid">
            {state.reps} reps · {state.interval}d interval ·{" "}
            {dueLabel(state.due, today)}
          </p>
        )}
        {!unlocked && (
          <p className="mt-3 rounded-lg border border-warning/40 bg-warning/5 px-3 py-2 text-xs leading-relaxed text-warning">
            Locked — finish {prereqNames} first (2 reps or 40% mastery each).
          </p>
        )}
      </div>

      {worked && (
        <div className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="rounded-full border border-accent/40 bg-accent/5 px-2 py-0.5 text-[10px] font-medium text-accent">
              Worked example
            </span>
            <span className="font-mono text-body-mid">{worked.id}</span>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                difficultyClasses(worked.difficulty),
              )}
            >
              {worked.difficulty}
            </span>
          </div>
          <p className="mt-4 text-base leading-relaxed text-ink">
            {worked.question}
          </p>
          {stepsOpen ? (
            <ol className="mt-4 space-y-2">
              {concept.workedSteps.map((step, index) => (
                <li
                  key={`${concept.id}-step-${index}`}
                  className="flex gap-3 text-sm leading-relaxed text-body"
                >
                  <span className="font-mono text-xs text-accent">
                    {index + 1}.
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          ) : (
            <button
              type="button"
              onClick={() => setStepsOpen(true)}
              className="mt-4 rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink"
            >
              Reveal steps
            </button>
          )}
        </div>
      )}

      <div className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
        {unlocked ? (
          <>
            <h4 className="text-sm font-semibold text-ink">Practice</h4>
            <p className="mt-1 text-xs text-body-mid">
              Three graded reps. Your score sets the next review date.
            </p>
            <ConceptPractice key={concept.id} concept={concept} onGraded={onGraded} />
          </>
        ) : (
          <p className="text-sm text-body-mid">
            Practice unlocks once the prerequisite concepts are at 2 reps or
            40% mastery.
          </p>
        )}
      </div>
    </div>
  );
}

export function PenPaper() {
  const [tab, setTab] = useState<"practice" | "mastery">("practice");
  const [progress, setProgress] = useState<PenPaperProgressMap>({});
  const [stats, setStats] = useState<PenPaperStats>(EMPTY_STATS);
  const [conceptStates, setConceptStates] = useState<ConceptStateMap>({});
  const [conceptStats, setConceptStats] = useState<ConceptStats>(
    EMPTY_CONCEPT_STATS,
  );
  const [dueConcepts, setDueConcepts] = useState<Concept[]>([]);
  const [activeConceptId, setActiveConceptId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cursor, setCursor] = useState(0);
  const [resetNonce, setResetNonce] = useState(0);

  useEffect(() => {
    const load = () => {
      setProgress(getPenPaperProgress());
      setStats(getPenPaperStats());
      setConceptStates(getConceptStates());
      setConceptStats(getConceptStats());
      setDueConcepts(getDueConcepts());
    };
    load();
    window.addEventListener(PENPAPER_CHANGE_EVENT, load);
    window.addEventListener(CONCEPTS_CHANGE_EVENT, load);
    return () => {
      window.removeEventListener(PENPAPER_CHANGE_EVENT, load);
      window.removeEventListener(CONCEPTS_CHANGE_EVENT, load);
    };
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

  const selectCategory = (category: string | null) => {
    setActiveCategory(category);
    setCursor(0);
  };

  const advance = () => {
    if (order.length === 0) return;
    setCursor((current) => (current + 1) % order.length);
  };

  const handleReset = () => {
    if (typeof window === "undefined") return;
    const confirmed = window.confirm(
      "Reset all Pen & Paper Math progress? This cannot be undone.",
    );
    if (!confirmed) return;
    resetPenPaperProgress();
    setCursor(0);
    setResetNonce((nonce) => nonce + 1);
  };

  const attemptedPct =
    stats.total > 0 ? (stats.attempted / stats.total) * 100 : 0;
  const correctPct = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;

  const alreadyCorrect = problem
    ? Boolean(progress[problem.id]?.correct)
    : false;

  const today = getDailyDateKey();
  const activeConcept = activeConceptId
    ? (CONCEPT_BY_ID.get(activeConceptId) ?? null)
    : null;
  const unlockedPct =
    conceptStats.total > 0
      ? (conceptStats.unlocked / conceptStats.total) * 100
      : 0;
  const masteredPct =
    conceptStats.total > 0
      ? (conceptStats.mastered / conceptStats.total) * 100
      : 0;

  return (
    <section
      id="math"
      className="mx-auto max-w-6xl scroll-mt-16 px-4 py-10 sm:px-6 sm:py-14"
    >
      <div className="mb-4">
        <h2 className="text-sm font-medium text-body-mid">
          {PENPAPER_PROBLEMS.length} problems · {CONCEPTS.length} concepts
        </h2>
      </div>

      <div
        className="mb-6 flex flex-wrap items-center gap-2"
        role="tablist"
        aria-label="Pen and Paper Math mode"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "practice"}
          onClick={() => setTab("practice")}
          className={chipClasses(tab === "practice")}
        >
          Practice
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "mastery"}
          onClick={() => setTab("mastery")}
          className={chipClasses(tab === "mastery")}
        >
          Mastery
          {conceptStats.due > 0 && (
            <span className="ml-1.5 rounded-full bg-accent/15 px-1.5 py-0.5 font-mono text-[10px]">
              {conceptStats.due}
            </span>
          )}
        </button>
      </div>

      {tab === "practice" && (
        <>
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

          <div className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
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
            <div className="mt-4 rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
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

              <AnswerPanel
                key={`${activeCategory ?? "all"}:${cursor}:${resetNonce}`}
                problem={problem}
                onChecked={(correct) =>
                  recordPenPaperAnswer(problem.id, correct)
                }
                onNext={advance}
                onSkip={advance}
              />
            </div>
          ) : (
            <p className="mt-4 py-2 text-center text-sm text-body-mid">
              No problems in this category.
            </p>
          )}
        </>
      )}

      {tab === "mastery" && (
        <div className="space-y-6">
          {activeConcept ? (
            <ConceptDetail
              concept={activeConcept}
              states={conceptStates}
              today={today}
              onClose={() => setActiveConceptId(null)}
              onGraded={() => setActiveConceptId(null)}
            />
          ) : (
            <>
              <div className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <span className="font-mono text-xs text-body-mid">
                    {conceptStats.due} due today
                  </span>
                  <span className="font-mono text-xs text-accent">
                    {conceptStats.mastered}/{conceptStats.total} mastered
                  </span>
                  <span className="font-mono text-xs text-body-mid">
                    {conceptStats.unlocked}/{conceptStats.total} unlocked
                  </span>
                </div>
                <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-canvas-soft">
                  <div
                    className="absolute inset-y-0 left-0 bg-accent/25"
                    style={{ width: `${unlockedPct}%` }}
                  />
                  <div
                    className="absolute inset-y-0 left-0 bg-accent"
                    style={{ width: `${masteredPct}%` }}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-ink">Due today</h3>
                {dueConcepts.length === 0 ? (
                  <p className="mt-2 text-sm text-body-mid">
                    Nothing due right now. Pick any unlocked concept below to
                    get ahead.
                  </p>
                ) : (
                  <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {dueConcepts.map((concept) => {
                      const state = conceptStates[concept.id];
                      return (
                        <div
                          key={concept.id}
                          className="flex flex-col gap-3 rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-semibold text-ink">
                              {concept.title}
                            </h4>
                            <span className="shrink-0 rounded-full border border-hairline px-2 py-0.5 text-[10px] text-body-mid">
                              {concept.category}
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed text-body-mid">
                            {concept.blurb}
                          </p>
                          <div className="mt-auto flex items-center justify-between gap-3">
                            <span className="font-mono text-[10px] text-body-mid">
                              {state && state.reps > 0
                                ? `${state.reps} reps · ${state.interval}d`
                                : "New concept"}
                            </span>
                            <button
                              type="button"
                              onClick={() => setActiveConceptId(concept.id)}
                              className="rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-canvas transition-opacity hover:opacity-90"
                            >
                              {state && state.reps > 0 ? "Review" : "Start"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {CONCEPT_CATEGORIES.map((category) => (
                  <div key={category}>
                    <h3 className="text-sm font-semibold text-ink">
                      {category}
                    </h3>
                    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {CONCEPTS.filter(
                        (concept) => concept.category === category,
                      ).map((concept) => (
                        <ConceptCard
                          key={concept.id}
                          concept={concept}
                          state={conceptStates[concept.id]}
                          unlocked={isConceptUnlocked(concept, conceptStates)}
                          today={today}
                          onOpen={() => setActiveConceptId(concept.id)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
