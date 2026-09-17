"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { PaperQuestion } from "@/data/papers/types";
import {
  getEmptyPapersSnapshot,
  getPapersSnapshot,
  markRead,
  recordAnswer,
  resetPaper,
  subscribePapersState,
} from "@/lib/papers";
import { cn } from "@/lib/utils";

/**
 * Self-graded implementation check for one paper. Answering is a single tap:
 * the option grades immediately, the explanation reveals, and the result is
 * persisted through the papers store (last timestamp wins). The component
 * also marks the paper as read on mount and subscribes to the change event so
 * restored backups and other tabs stay in sync.
 */
export function PaperQuestions({
  paperId,
  title,
  questions,
}: {
  paperId: string;
  title: string;
  questions: PaperQuestion[];
}) {
  const state = useSyncExternalStore(
    subscribePapersState,
    getPapersSnapshot,
    getEmptyPapersSnapshot,
  );
  const [picked, setPicked] = useState<Record<string, number>>({});

  useEffect(() => {
    markRead(paperId);
  }, [paperId]);

  const answers = state.questions;
  // Inlined rather than importing `paperProgress` from `@/data/papers`: this
  // module is a client component, and that import would pull the whole
  // curriculum into the browser bundle.
  const total = questions.length;
  let answered = 0;
  let correct = 0;
  for (const question of questions) {
    const answer = answers[question.id];
    if (!answer) continue;
    answered += 1;
    if (answer.correct) correct += 1;
  }

  const handleSelect = (question: PaperQuestion, index: number) => {
    if (answers[question.id]) return;
    recordAnswer(question.id, index === question.answer);
    setPicked((current) => ({ ...current, [question.id]: index }));
  };

  const handleReset = () => {
    resetPaper(
      paperId,
      questions.map((question) => question.id),
    );
    setPicked({});
  };

  if (questions.length === 0) {
    return (
      <p className="rounded-lg border border-hairline bg-canvas-soft px-4 py-3 text-sm text-body-mid">
        The questions for this paper are being written. The read mark is
        already saved.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <p className="text-sm text-body-mid" role="status">
          {answered} of {total} {total === 1 ? "question" : "questions"}{" "}
          answered
          {answered > 0 && ` · ${correct} correct`}
        </p>
        {answered > 0 && (
          <button
            type="button"
            aria-label={`Reset answers for ${title}`}
            onClick={handleReset}
            className="min-h-11 rounded-lg border border-hairline px-3 text-xs text-body-mid transition-colors hover:border-error/40 hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-8"
          >
            Reset answers
          </button>
        )}
      </div>

      <ol className="flex flex-col gap-4">
        {questions.map((question, questionIndex) => {
          const answer = answers[question.id];
          const isAnswered = Boolean(answer);
          return (
            <li
              key={question.id}
              className="rounded-lg border border-hairline bg-canvas-card p-4"
            >
              <p className="text-sm font-medium text-ink">
                <span className="mr-2 font-mono text-xs text-mute">
                  {questionIndex + 1}.
                </span>
                {question.prompt}
              </p>

              <ul className="mt-3 space-y-2">
                {question.options.map((option, index) => {
                  const isCorrectOption = index === question.answer;
                  const isPicked = picked[question.id] === index;
                  return (
                    <li key={index}>
                      <button
                        type="button"
                        disabled={isAnswered}
                        aria-pressed={isAnswered ? isPicked : undefined}
                        onClick={() => handleSelect(question, index)}
                        className={cn(
                          "flex min-h-11 w-full items-start gap-2.5 rounded-lg border px-3 py-2 text-left text-sm transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-8",
                          !isAnswered &&
                            "border-hairline bg-canvas text-body hover:border-accent/40 hover:text-ink",
                          isAnswered &&
                            isCorrectOption &&
                            "border-accent/50 bg-accent/5 text-ink",
                          isAnswered &&
                            !isCorrectOption &&
                            (isPicked
                              ? "border-error/50 bg-error/5 text-body"
                              : "border-hairline bg-canvas text-mute"),
                        )}
                      >
                        <span
                          aria-hidden
                          className="mt-px shrink-0 font-mono text-[11px] text-mute"
                        >
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="min-w-0 break-words">{option}</span>
                        {isAnswered && isCorrectOption && (
                          <span className="ml-auto shrink-0 self-center rounded-full border border-accent/40 px-2 py-0.5 text-[10px] font-medium text-accent">
                            Answer
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>

              {answer && (
                <div
                  className={cn(
                    "mt-3 rounded-lg border px-3 py-2.5",
                    answer.correct
                      ? "border-accent/40 bg-accent/5"
                      : "border-error/40 bg-error/5",
                  )}
                >
                  <p
                    className={cn(
                      "text-xs font-medium",
                      answer.correct ? "text-accent" : "text-error",
                    )}
                  >
                    {answer.correct
                      ? "Correct — implementation check passed."
                      : "Incorrect — read the explanation, then reset to retry."}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-body">
                    {question.explanation}
                  </p>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
