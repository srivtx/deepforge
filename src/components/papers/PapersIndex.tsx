"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import type { PaperAnswerMap, PaperEraMeta } from "@/data/papers";
import type { PaperEra, PaperKind } from "@/data/papers/types";
import {
  getEmptyPapersSnapshot,
  getPapersSnapshot,
  subscribePapersState,
} from "@/lib/papers";
import { cn } from "@/lib/utils";

/**
 * One card per paper, shaped server-side from `PAPERS` and passed down so the
 * curriculum's theory prose never enters the browser bundle. Progress is read
 * from the papers store after mount, so SSR and the first client paint agree.
 */
export interface PaperCardEntry {
  id: string;
  slug: string;
  title: string;
  year: number;
  kind: PaperKind;
  tier: "core" | "advanced";
  tagline: string;
  theoryMinutes: number;
  era: PaperEra;
  order: number;
  questionIds: string[];
}

const KIND_LABELS: Record<PaperKind, string> = {
  paper: "Paper",
  report: "Report",
  announcement: "Announcement",
};

const TIER_CLASSES: Record<PaperCardEntry["tier"], string> = {
  core: "border-accent/40 text-accent",
  advanced: "border-hairline text-body-mid",
};

const TIER_LABELS: Record<PaperCardEntry["tier"], string> = {
  core: "Core",
  advanced: "Advanced",
};

function paperProgressHint(
  entry: PaperCardEntry,
  answers: PaperAnswerMap,
): { answered: number; correct: number; done: boolean } {
  let answered = 0;
  let correct = 0;
  for (const id of entry.questionIds) {
    const answer = answers[id];
    if (!answer) continue;
    answered += 1;
    if (answer.correct) correct += 1;
  }
  const total = entry.questionIds.length;
  return { answered, correct, done: total > 0 && answered >= total };
}

function PaperCard({
  entry,
  answers,
}: {
  entry: PaperCardEntry;
  answers: PaperAnswerMap;
}) {
  const total = entry.questionIds.length;
  const { answered, correct, done } = paperProgressHint(entry, answers);
  const percent = total === 0 ? 0 : Math.round((answered / total) * 100);

  return (
    <Link
      href={`/papers/${entry.slug}`}
      className="df-lift group flex h-full flex-col rounded-lg border border-hairline bg-canvas-card p-4 transition duration-200 ease-out hover:-translate-y-0.5 hover:border-accent/40 hover:bg-canvas-soft focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-mute">
          {String(entry.order).padStart(2, "0")}
        </span>
        <span className="flex flex-wrap items-center justify-end gap-1.5">
          <span className="rounded-full border border-hairline bg-canvas-soft px-2 py-0.5 text-[10px] font-medium text-body-mid">
            {KIND_LABELS[entry.kind]}
          </span>
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-[10px] font-medium",
              TIER_CLASSES[entry.tier],
            )}
          >
            {TIER_LABELS[entry.tier]}
          </span>
        </span>
      </div>

      <h3 className="mt-2 break-words text-sm font-semibold text-ink transition-colors group-hover:text-accent">
        {entry.title}
      </h3>
      <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-body-mid">
        {entry.tagline}
      </p>

      <div className="mt-auto pt-3 font-mono text-[11px] text-mute">
        {entry.year} · {entry.theoryMinutes} min theory · {total}{" "}
        {total === 1 ? "question" : "questions"}
      </div>
      <div
        aria-hidden
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-canvas-soft"
      >
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-1.5 text-[11px] text-body-mid">
        {total === 0
          ? "Questions coming soon"
          : done
            ? "Complete"
            : answered === 0
              ? "Not started"
              : `${answered}/${total} answered · ${correct} correct`}
      </p>
    </Link>
  );
}

export function PapersIndex({
  papers,
  eras,
}: {
  papers: PaperCardEntry[];
  eras: PaperEraMeta[];
}) {
  const state = useSyncExternalStore(
    subscribePapersState,
    getPapersSnapshot,
    getEmptyPapersSnapshot,
  );
  const answers = state.questions;
  const complete = papers.filter(
    (entry) =>
      entry.questionIds.length > 0 &&
      entry.questionIds.every((id) => Boolean(answers[id])),
  ).length;
  const sections = eras
    .map((era) => ({
      era,
      papers: papers.filter((entry) => entry.era === era.id),
    }))
    .filter((section) => section.papers.length > 0);
  const first = papers[0];

  return (
    <section
      id="papers"
      className="mx-auto max-w-6xl scroll-mt-16 px-4 py-10 sm:px-6 sm:py-14"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-hairline bg-canvas-card px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">
            {complete} / {papers.length}{" "}
            {papers.length === 1 ? "paper" : "papers"} complete
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-body-mid">
            A paper counts as complete when every question is answered.
          </p>
        </div>
        {first && (
          <Link
            href={`/papers/${first.slug}`}
            className="min-h-11 shrink-0 rounded-lg border border-accent px-3 py-2 text-xs font-medium text-accent transition-colors hover:bg-accent/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-8"
          >
            Start from the first paper
          </Link>
        )}
      </div>

      {papers.length === 0 ? (
        <p className="mt-8 rounded-lg border border-hairline bg-canvas-card px-4 py-6 text-sm leading-relaxed text-body-mid">
          The curriculum is being written. Papers, figures, and questions land
          here in reading order as they are ready.
        </p>
      ) : (
        <div className="mt-8 flex flex-col gap-10">
          {sections.map((section, sectionIndex) => (
            <div key={section.era.id}>
              {sectionIndex > 0 && (
                <p
                  aria-hidden
                  className="mb-5 flex items-center gap-3 text-[11px] text-mute"
                >
                  <span className="h-px flex-1 bg-hairline" />
                  <span className="whitespace-nowrap">
                    ↓ builds on the previous era
                  </span>
                  <span className="h-px flex-1 bg-hairline" />
                </p>
              )}
              <section
                id={`era-${section.era.id}`}
                aria-labelledby={`era-${section.era.id}-title`}
                className="scroll-mt-20"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <h2
                    id={`era-${section.era.id}-title`}
                    className="text-base font-semibold tracking-tight text-ink"
                  >
                    {section.era.label}
                  </h2>
                  <span className="font-mono text-[11px] text-mute">
                    {section.papers.length}{" "}
                    {section.papers.length === 1 ? "paper" : "papers"}
                  </span>
                </div>
                <p className="mt-1 max-w-2xl text-xs leading-relaxed text-body-mid">
                  {section.era.blurb}
                </p>
                <ul className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {section.papers.map((entry) => (
                    <li key={entry.id} className="h-full">
                      <PaperCard entry={entry} answers={answers} />
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          ))}
        </div>
      )}

      <p className="mt-8 text-xs leading-relaxed text-body-mid">
        Two passes per paper: theory first, built from first principles, then
        the paper itself with an implementation check. Answers and read marks
        save on this device and travel with your backup.
      </p>
    </section>
  );
}
