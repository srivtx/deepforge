"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CARD,
  FLOW_SECTION,
  PRIMARY_BUTTON,
  RESULT_SECTION,
  SECONDARY_BUTTON,
  TERTIARY_LINK,
} from "@/components/onboarding/layout";
import { CATEGORIES } from "@/data/problems/meta";
import { PROBLEM_META } from "@/data/problems/problem-meta";
import {
  DEFAULT_MINUTES,
  DIAGNOSTIC_MAX_QUESTIONS,
  DIAGNOSTIC_MIN_QUESTIONS,
  MAX_INTERESTS,
  MINUTES_OPTIONS,
  answerFor,
  buildStartingPlan,
  clearDraft,
  clearPlacement,
  nextQuestion,
  placementToPlan,
  readDraft,
  readPlacement,
  saveDraft,
  savePlacement,
  type DiagnosticAnswer,
  type StartingPlan,
} from "@/lib/onboarding";
import { problemHref } from "@/lib/problemLinks";
import { cn, difficultyClasses } from "@/lib/utils";
import type { Category } from "@/types/problem";

type Phase = "loading" | "intro" | "quiz" | "plan";

const META_BY_ID = new Map(PROBLEM_META.map((problem) => [problem.id, problem]));

function DifficultyPill({ difficulty }: { difficulty: "Easy" | "Medium" | "Hard" }) {
  return (
    <span
      className={cn(
        "rounded-full border px-2 py-0.5 text-[10px] font-medium",
        difficultyClasses(difficulty),
      )}
    >
      {difficulty}
    </span>
  );
}

function CategoryList({ categories }: { categories: readonly Category[] }) {
  return (
    <span className="font-medium text-ink">
      {categories.length === 1
        ? categories[0]
        : categories.length === 2
          ? `${categories[0]} and ${categories[1]}`
          : `${categories.slice(0, -1).join(", ")}, and ${categories[categories.length - 1]}`}
    </span>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div
      aria-hidden
      className="h-1 w-full overflow-hidden rounded-full bg-canvas-soft"
    >
      <div
        className="h-full rounded-full bg-accent transition-[width] duration-300"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export function Onboarding() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [areas, setAreas] = useState<Category[]>([]);
  const [minutes, setMinutes] = useState<number>(DEFAULT_MINUTES);
  const [answers, setAnswers] = useState<DiagnosticAnswer[]>([]);
  const [plan, setPlan] = useState<StartingPlan | null>(null);
  const questionHeadingRef = useRef<HTMLHeadingElement>(null);
  const planHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const restore = () => {
      const saved = readPlacement();
      const draft = readDraft();
      if (draft) {
        setAreas(draft.areas);
        setMinutes(draft.minutesPerDay ?? DEFAULT_MINUTES);
        setAnswers(draft.answers);
      }
      if (saved) {
        setPlan(placementToPlan(saved));
        setPhase("plan");
      } else if (draft && draft.answers.length > 0) {
        if (nextQuestion(draft.answers, draft.areas) === null) {
          const built = buildStartingPlan(draft.answers, {
            areas: draft.areas,
            minutesPerDay: draft.minutesPerDay ?? DEFAULT_MINUTES,
          });
          savePlacement(built);
          setPlan(built);
          setPhase("plan");
        } else {
          setPhase("quiz");
        }
      } else {
        setPhase("intro");
      }
    };
    restore();
  }, []);

  const question = phase === "quiz" ? nextQuestion(answers, areas) : null;

  useEffect(() => {
    if (phase === "quiz") questionHeadingRef.current?.focus();
  }, [phase, answers.length]);

  useEffect(() => {
    if (phase === "plan") planHeadingRef.current?.focus();
  }, [phase]);

  const toggleArea = (category: Category) => {
    setAreas((current) => {
      if (current.includes(category)) {
        return current.filter((entry) => entry !== category);
      }
      if (current.length >= MAX_INTERESTS) return current;
      return [...current, category];
    });
  };

  const handleStart = () => {
    saveDraft({ areas, minutesPerDay: minutes, answers: [] });
    setAnswers([]);
    setPhase("quiz");
  };

  const handleAnswer = (correct: boolean) => {
    if (!question) return;
    const next = [...answers, answerFor(question, correct)];
    saveDraft({ areas, minutesPerDay: minutes, answers: next });
    setAnswers(next);
    if (nextQuestion(next, areas) === null) {
      const built = buildStartingPlan(next, {
        areas,
        minutesPerDay: minutes,
      });
      savePlacement(built);
      setPlan(built);
      setPhase("plan");
    }
  };

  const handleBack = () => {
    if (answers.length === 0) {
      setPhase("intro");
      return;
    }
    const next = answers.slice(0, -1);
    saveDraft({ areas, minutesPerDay: minutes, answers: next });
    setAnswers(next);
  };

  const handleRetake = () => {
    clearPlacement();
    clearDraft();
    setPlan(null);
    setAnswers([]);
    setPhase("intro");
  };

  if (phase === "loading") {
    return (
      <section
        aria-live="polite"
        className={cn(FLOW_SECTION, "text-sm text-body-mid")}
      >
        Preparing the check…
      </section>
    );
  }

  if (phase === "intro") {
    return (
      <section className={FLOW_SECTION}>
        <div className={CARD}>
          <h2 className="text-lg font-semibold tracking-tight text-ink">
            How this works
          </h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm leading-relaxed text-body-mid">
            <li>
              It is a short check, not an exam:{" "}
              <span className="text-ink">
                {DIAGNOSTIC_MIN_QUESTIONS} to {DIAGNOSTIC_MAX_QUESTIONS} real
                problems
              </span>{" "}
              from the library, shown as titles.
            </li>
            <li>
              For each one you answer a single question:{" "}
              <span className="text-ink">
                could you write the solution from scratch right now?
              </span>{" "}
              The questions get harder only after you say yes — that is how the
              check finds your level.
            </li>
            <li>
              Your answers pick a starting level,{" "}
              <span className="text-ink">two or three paths</span> (a path is
              an ordered set of problems that builds one skill), and your first
              problem set. About 2–3 minutes.
            </li>
          </ul>

          <fieldset className="mt-6">
            <legend className="text-sm font-medium text-ink">
              Which areas interest you most?
            </legend>
            <p className="mt-1 text-xs leading-relaxed text-body-mid">
              Optional — pick up to {MAX_INTERESTS}. Leave everything unpicked
              and the check spreads evenly across all {CATEGORIES.length} areas.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {CATEGORIES.map((category) => {
                const selected = areas.includes(category.name);
                return (
                  <button
                    key={category.name}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleArea(category.name)}
                    className={cn(
                      "min-h-11 rounded-full border px-3 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-8",
                      selected
                        ? "border-accent/50 bg-accent/10 text-accent"
                        : "border-hairline text-body-mid hover:border-accent/40 hover:text-ink",
                    )}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="mt-6">
            <legend className="text-sm font-medium text-ink">
              How much time do you have on a normal day?
            </legend>
            <p className="mt-1 text-xs leading-relaxed text-body-mid">
              This sets how many problems the plan suggests. It does not change
              your level.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {MINUTES_OPTIONS.map((option) => (
                <label key={option} className="cursor-pointer">
                  <input
                    type="radio"
                    name="onboarding-minutes"
                    value={option}
                    checked={minutes === option}
                    onChange={() => setMinutes(option)}
                    className="peer sr-only"
                  />
                  <span className="inline-flex min-h-11 items-center rounded-lg border border-hairline px-4 text-sm text-body-mid transition-colors hover:text-ink peer-checked:border-accent/60 peer-checked:bg-accent/10 peer-checked:text-accent peer-focus-visible:ring-1 peer-focus-visible:ring-accent/40 sm:min-h-9">
                    {option} minutes
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-7 flex flex-col gap-2 sm:flex-row-reverse">
            <button type="button" onClick={handleStart} className={PRIMARY_BUTTON}>
              Start the check
              <span aria-hidden>→</span>
            </button>
            <Link href="/paths" className={SECONDARY_BUTTON}>
              Skip for now
            </Link>
          </div>
          <p className="mt-3 text-xs text-body-mid sm:text-right">
            No account needed. Answers stay in this browser.
          </p>
        </div>
      </section>
    );
  }

  if (phase === "quiz" && question) {
    const questionNumber = answers.length + 1;
    const progressPct = Math.round(
      (answers.length / DIAGNOSTIC_MAX_QUESTIONS) * 100,
    );
    return (
      <section className={FLOW_SECTION}>
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="-ml-2 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-body-mid transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-8"
          >
            <span aria-hidden>←</span>
            Back
          </button>
          <p
            role="status"
            aria-live="polite"
            className="font-mono text-[11px] text-mute"
          >
            Question {questionNumber} of up to {DIAGNOSTIC_MAX_QUESTIONS}
          </p>
        </div>
        <div className="mt-3">
          <ProgressBar value={progressPct} />
        </div>

        <div className={cn(CARD, "mt-4")}>
          <p className="flex flex-wrap items-center gap-2 text-xs text-body-mid">
            <span className="font-mono text-[11px] text-mute">
              {question.id}
            </span>
            <span aria-hidden className="text-mute">
              ·
            </span>
            <span>{question.category}</span>
            <DifficultyPill difficulty={question.difficulty} />
          </p>
          <h2
            ref={questionHeadingRef}
            tabIndex={-1}
            className="mt-3 text-xl font-semibold tracking-tight text-ink focus:outline-none"
          >
            {question.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-body-mid">
            If this problem appeared right now, could you write a working
            solution from scratch — no notes, no autocomplete?
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => handleAnswer(true)}
              className={cn(PRIMARY_BUTTON, "w-full")}
            >
              Yes, I could
            </button>
            <button
              type="button"
              onClick={() => handleAnswer(false)}
              className={cn(SECONDARY_BUTTON, "w-full")}
            >
              Not yet
            </button>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <p className="text-xs leading-relaxed text-mute">
              Honest answers give a better starting point. Nobody sees this, and
              it is not a score.
            </p>
            <Link href="/paths" className={TERTIARY_LINK}>
              Skip for now
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (phase === "plan" && plan) {
    const firstId = plan.firstProblemIds[0];
    const firstMeta = firstId ? META_BY_ID.get(firstId) : undefined;
    return (
      <section className={RESULT_SECTION}>
        <div className={CARD}>
          <p className="font-mono text-[11px] text-mute">
            Based on {plan.answered}{" "}
            {plan.answered === 1 ? "answer" : "answers"}
          </p>
          <h2
            ref={planHeadingRef}
            tabIndex={-1}
            className="mt-1 text-xl font-semibold tracking-tight text-ink focus:outline-none sm:text-2xl"
          >
            {plan.levelLabel}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-body-mid">
            {plan.levelDetail}
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink">
            {plan.summary}
          </p>
          {(plan.weakCategories.length > 0 || plan.strengths.length > 0) && (
            <dl className="mt-4 flex flex-col gap-2 text-sm">
              {plan.weakCategories.length > 0 && (
                <div className="flex flex-wrap gap-x-2">
                  <dt className="text-body-mid">Worth extra time:</dt>
                  <dd>
                    <CategoryList categories={plan.weakCategories} />
                  </dd>
                </div>
              )}
              {plan.strengths.length > 0 && (
                <div className="flex flex-wrap gap-x-2">
                  <dt className="text-body-mid">Already looking strong:</dt>
                  <dd>
                    <CategoryList categories={plan.strengths} />
                  </dd>
                </div>
              )}
            </dl>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className={CARD}>
            <p className="text-xs font-medium text-body-mid">Answers given</p>
            <p className="mt-2 font-mono text-2xl text-ink">{plan.answered}</p>
            <p className="mt-1 text-xs text-body-mid">
              of up to {DIAGNOSTIC_MAX_QUESTIONS}
            </p>
          </div>
          <div className={CARD}>
            <p className="text-xs font-medium text-body-mid">Daily target</p>
            <p className="mt-2 font-mono text-2xl text-ink">{plan.dailyTarget}</p>
            <p className="mt-1 text-xs text-body-mid">problems a day</p>
          </div>
          <div className={CARD}>
            <p className="text-xs font-medium text-body-mid">Session length</p>
            <p className="mt-2 font-mono text-2xl text-ink">
              {plan.minutesPerDay}
            </p>
            <p className="mt-1 text-xs text-body-mid">minutes a session</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section aria-labelledby="plan-paths">
            <h3
              id="plan-paths"
              className="text-sm font-semibold tracking-tight text-ink"
            >
              Your paths
            </h3>
            <ul className="mt-3 flex flex-col gap-3">
              {plan.recommendedPaths.map((recommendation) => (
                <li key={recommendation.id} className={CARD}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <Link
                      href={`/paths/${recommendation.slug}`}
                      className="text-base font-medium text-ink transition-colors hover:text-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
                    >
                      {recommendation.title}
                    </Link>
                    <span className="font-mono text-[11px] text-mute">
                      {recommendation.level ?? "Mixed"} · ~
                      {recommendation.estimatedHours} h
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-body-mid">
                    {recommendation.why}
                  </p>
                  {recommendation.firstProblemIds.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {recommendation.firstProblemIds.map((id) => {
                        const meta = META_BY_ID.get(id);
                        if (!meta) return null;
                        return (
                          <li key={id}>
                            <Link
                              href={problemHref(id, "/start")}
                              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-hairline px-3 text-xs text-body-mid transition-colors hover:border-accent/40 hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-8"
                            >
                              {meta.title}
                              <DifficultyPill difficulty={meta.difficulty} />
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <div className="flex flex-col gap-6">
            <section aria-labelledby="plan-first-set">
              <h3
                id="plan-first-set"
                className="text-sm font-semibold tracking-tight text-ink"
              >
                Your first set
              </h3>
              <p className="mt-1 text-xs text-body-mid">
                These {plan.dailyTarget} problems match your level. Solve them
                in any order.
              </p>
              {plan.firstProblemIds.length === 0 ? (
                <div className={cn(CARD, "mt-3")}>
                  <p className="text-sm leading-relaxed text-body-mid">
                    Everything this check points to is already solved. Open
                    Today to revisit problems on a schedule, or pick a new
                    path from the library.
                  </p>
                  <div className="mt-3">
                    <Link href="/today" className={SECONDARY_BUTTON}>
                      Open Today
                    </Link>
                  </div>
                </div>
              ) : (
                <ol
                  className={cn(
                    CARD,
                    "mt-3 flex flex-col divide-y divide-hairline p-0",
                  )}
                >
                  {plan.firstProblemIds.map((id, index) => {
                    const meta = META_BY_ID.get(id);
                    if (!meta) return null;
                    return (
                      <li key={id}>
                        <Link
                          href={problemHref(id, "/start")}
                          className="flex min-h-11 items-center gap-3 px-4 py-3 transition-colors hover:bg-canvas-soft focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
                        >
                          <span className="font-mono text-[11px] text-mute">
                            {index + 1}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium text-ink">
                              {meta.title}
                            </span>
                            <span className="block text-xs text-body-mid">
                              {meta.category}
                            </span>
                          </span>
                          <DifficultyPill difficulty={meta.difficulty} />
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>

            <section aria-labelledby="plan-cadence" className={CARD}>
              <h3
                id="plan-cadence"
                className="text-sm font-semibold tracking-tight text-ink"
              >
                Your cadence
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-body-mid">
                {plan.cadence}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/today" className={SECONDARY_BUTTON}>
                  Open Today
                </Link>
                <Link href="/paths" className={SECONDARY_BUTTON}>
                  Browse all paths
                </Link>
              </div>
            </section>
          </div>
        </div>

        <p className="mt-6 max-w-2xl text-xs leading-relaxed text-body-mid">
          {plan.note}
        </p>

        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <span className="text-xs text-body-mid">
            Saved in this browser —{" "}
            <Link
              href="/backup"
              className="underline underline-offset-4 transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
            >
              move it to another device
            </Link>
          </span>
          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <Link
              href={firstId ? problemHref(firstId, "/start") : "/problems"}
              className={PRIMARY_BUTTON}
            >
              {firstMeta ? `Start with ${firstMeta.title}` : "Start practicing"}
              <span aria-hidden>→</span>
            </Link>
            <button
              type="button"
              onClick={handleRetake}
              className={SECONDARY_BUTTON}
            >
              Retake the check
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-live="polite"
      className={cn(FLOW_SECTION, "text-sm text-body-mid")}
    >
      Preparing the check…
    </section>
  );
}
