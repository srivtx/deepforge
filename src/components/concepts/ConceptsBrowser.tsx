"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CONCEPTS, type Concept } from "@/data/concepts";
import { PENPAPER_PROBLEMS } from "@/data/penpaper";
import { PROBLEM_META } from "@/data/problems/problem-meta";
import { getDailyDateKey } from "@/lib/daily";
import {
  CONCEPTS_CHANGE_EVENT,
  getConceptStats,
  getConceptStates,
  gradeConcept,
  isConceptUnlocked,
  masteryOf,
  MASTERED_MASTERY,
  UNLOCK_MASTERY,
  UNLOCK_REPS,
  type ConceptQuality,
  type ConceptState,
  type ConceptStateMap,
  type ConceptStats,
} from "@/lib/concepts";
import { clampMastery } from "@/lib/conceptGraph";
import { cn } from "@/lib/utils";
import { ConceptMap } from "@/components/concepts/ConceptMap";

const CONCEPT_BY_ID = new Map(CONCEPTS.map((concept) => [concept.id, concept]));
const PENPAPER_BY_ID = new Map(
  PENPAPER_PROBLEMS.map((problem) => [problem.id, problem]),
);
const META_BY_ID = new Map(PROBLEM_META.map((problem) => [problem.id, problem]));
const PROBLEM_IDS = new Set(PROBLEM_META.map((problem) => problem.id));

export interface ConceptGroup {
  category: string;
  concepts: Concept[];
}

/**
 * Group concepts by category in first-appearance order over the catalogue, so
 * the page order is stable no matter how callers slice or reorder the input.
 */
export function groupConceptsByCategory(
  concepts: readonly Concept[] = CONCEPTS,
): ConceptGroup[] {
  const groups: ConceptGroup[] = [];
  const byCategory = new Map<string, ConceptGroup>();
  for (const concept of concepts) {
    let group = byCategory.get(concept.category);
    if (!group) {
      group = { category: concept.category, concepts: [] };
      byCategory.set(concept.category, group);
      groups.push(group);
    }
    group.concepts.push(concept);
  }
  return groups;
}

/** Keep only the code problem ids that resolve to a real problem in the bank. */
export function resolveCodeProblemIds(
  ids: readonly string[] | undefined,
): string[] {
  return (ids ?? []).filter((id) => PROBLEM_IDS.has(id));
}

type ConceptStatus = "mastered" | "due" | "learning" | "locked";

const STATUS_LABELS: Record<ConceptStatus, string> = {
  mastered: "Mastered",
  due: "Due",
  learning: "Learning",
  locked: "Locked",
};

const STATUS_CLASSES: Record<ConceptStatus, string> = {
  mastered: "border-accent/40 bg-accent/5 text-accent",
  due: "border-hairline bg-canvas-soft text-accent",
  learning: "border-hairline bg-canvas-soft text-body-mid",
  locked: "border-hairline bg-canvas-soft text-mute",
};

function statusOf(
  concept: Concept,
  state: ConceptState | undefined,
  unlocked: boolean,
  today: string,
): ConceptStatus {
  if (!unlocked) return "locked";
  if (masteryOf(state) >= MASTERED_MASTERY) return "mastered";
  if (!state || state.due <= today) return "due";
  return "learning";
}

/**
 * The store keeps the schedule, not the raw quality, so the last self-report
 * is derived: any rep means the last review passed, a reset with lapses means
 * the last one was missed.
 */
function lastCheckLabel(state: ConceptState | undefined): string | null {
  if (!state) return null;
  if (state.reps > 0) return "last check passed";
  if (state.lapses > 0) return "last check missed";
  return null;
}

function prerequisiteTitles(concept: Concept): string[] {
  return concept.prerequisites.map(
    (id) => CONCEPT_BY_ID.get(id)?.title ?? id,
  );
}

function stateLine(
  state: ConceptState | undefined,
  lastCheck: string | null,
): string {
  if (!state) return "Not started";
  const parts = [
    `${state.reps} ${state.reps === 1 ? "rep" : "reps"}`,
    lastCheck,
    `due ${state.due}`,
  ].filter((part): part is string => Boolean(part));
  return parts.join(" · ");
}

function ConceptCard({
  concept,
  state,
  unlocked,
  today,
  onGrade,
}: {
  concept: Concept;
  state: ConceptState | undefined;
  unlocked: boolean;
  today: string;
  onGrade: (conceptId: string, quality: ConceptQuality) => void;
}) {
  const [open, setOpen] = useState(false);
  const mastery = masteryOf(state);
  const status = statusOf(concept, state, unlocked, today);
  const prereqTitles = prerequisiteTitles(concept);
  const codeIds = resolveCodeProblemIds(concept.codeProblemIds);
  const worked = PENPAPER_BY_ID.get(concept.workedExampleId);
  const panelId = `concept-${concept.id}-details`;

  return (
    <article
      className={cn(
        "flex flex-col rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5",
        !unlocked && "opacity-70",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-ink">{concept.title}</h3>
          <p className="mt-0.5 text-xs text-body-mid">{concept.category}</p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium",
            STATUS_CLASSES[status],
          )}
        >
          {STATUS_LABELS[status]}
        </span>
      </div>

      <p className="mt-2 text-xs leading-relaxed text-body-mid">
        {concept.blurb}
      </p>

      <div className="mt-3">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 font-mono text-[11px] text-body-mid">
          <span>{Math.round(mastery)}% mastery</span>
          <span>{stateLine(state, lastCheckLabel(state))}</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-canvas-soft">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${Math.min(100, mastery)}%` }}
          />
        </div>
      </div>

      {prereqTitles.length > 0 && (
        <p className="mt-2 text-[11px] leading-relaxed text-body-mid">
          {prereqTitles.length === 1 ? "prerequisite" : "prerequisites"}:{" "}
          {prereqTitles.join(", ")}
        </p>
      )}

      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="mt-3 min-h-11 self-start rounded-lg border border-hairline px-3 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-8"
      >
        {open ? "Hide worked steps" : "Show worked steps & links"}
      </button>

      {open && (
        <div id={panelId} className="mt-3 border-t border-hairline pt-3">
          {worked && (
            <p className="text-sm leading-relaxed text-body">
              {worked.question}
            </p>
          )}
          <ol className="mt-3 space-y-2">
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

          {unlocked ? (
            <>
              <div className="mt-4">
                <h4 className="text-xs font-medium text-body-mid">
                  Practice in Pen &amp; Paper
                </h4>
                <ul className="mt-2 space-y-1.5">
                  {concept.practiceIds.map((id) => (
                    <li key={id}>
                      <Link
                        href="/math"
                        className="flex items-start gap-2 rounded-lg border border-hairline bg-canvas px-3 py-2 text-sm text-body transition-colors hover:border-accent/40 hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
                      >
                        <span className="shrink-0 font-mono text-[11px] text-mute">
                          {id}
                        </span>
                        <span className="min-w-0 line-clamp-2">
                          {PENPAPER_BY_ID.get(id)?.question ?? id}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {codeIds.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs font-medium text-body-mid">
                    Code problems
                  </h4>
                  <ul className="mt-2 space-y-1.5">
                    {codeIds.map((id) => (
                      <li key={id}>
                        <Link
                          href={`/problems/${id}`}
                          className="flex items-start gap-2 rounded-lg border border-hairline bg-canvas px-3 py-2 text-sm text-body transition-colors hover:border-accent/40 hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
                        >
                          <span className="shrink-0 font-mono text-[11px] text-mute">
                            {id}
                          </span>
                          <span className="min-w-0 line-clamp-2">
                            {META_BY_ID.get(id)?.title ?? id}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-4">
                <p className="text-xs leading-relaxed text-body-mid">
                  Self-report after checking the steps — this sets the next
                  review date.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    aria-label={`Mark ${concept.title} as reviewed`}
                    onClick={() => onGrade(concept.id, 5)}
                    className="min-h-11 rounded-lg border border-accent px-3 text-xs font-medium text-accent transition-colors hover:bg-accent/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-8"
                  >
                    Reviewed
                  </button>
                  <button
                    type="button"
                    aria-label={`Mark ${concept.title} as missed`}
                    onClick={() => onGrade(concept.id, 0)}
                    className="min-h-11 rounded-lg border border-hairline px-3 text-xs text-body-mid transition-colors hover:border-accent/40 hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-8"
                  >
                    Missed
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p className="mt-3 rounded-lg border border-hairline bg-canvas-soft px-3 py-2 text-xs leading-relaxed text-body-mid">
              Locked — finish {prereqTitles.join(", ")} first ({UNLOCK_REPS}{" "}
              reps or {UNLOCK_MASTERY}% mastery each).
            </p>
          )}
        </div>
      )}
    </article>
  );
}

interface ConceptsView {
  today: string;
  states: ConceptStateMap;
  stats: ConceptStats | null;
}

export function ConceptsBrowser() {
  const [view, setView] = useState<ConceptsView | null>(null);
  const [mode, setMode] = useState<"list" | "map">("list");

  const refresh = useCallback(() => {
    const now = new Date();
    setView({
      today: getDailyDateKey(now),
      states: getConceptStates(now),
      stats: getConceptStats(now),
    });
  }, []);

  useEffect(() => {
    const apply = () => refresh();
    apply();
    window.addEventListener(CONCEPTS_CHANGE_EVENT, apply);
    window.addEventListener("storage", apply);
    return () => {
      window.removeEventListener(CONCEPTS_CHANGE_EVENT, apply);
      window.removeEventListener("storage", apply);
    };
  }, [refresh]);

  const activeView: ConceptsView = view ?? {
    today: "",
    states: {},
    stats: null,
  };

  const handleGrade = (conceptId: string, quality: ConceptQuality) => {
    gradeConcept(conceptId, quality, new Date());
    refresh();
  };

  const mastery = useMemo(() => {
    const out: Record<string, number> = {};
    for (const [id, state] of Object.entries(activeView.states)) {
      out[id] = clampMastery(masteryOf(state) / 100);
    }
    return out;
  }, [activeView.states]);

  const groups = groupConceptsByCategory();

  return (
    <section
      id="concepts"
      className="mx-auto max-w-6xl scroll-mt-16 px-4 py-10 sm:px-6 sm:py-14"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="text-sm font-medium text-body-mid">
          {CONCEPTS.length} concepts across {groups.length} categories
        </p>
        <p className="font-mono text-[11px] text-mute">
          {activeView.stats
            ? `${activeView.stats.mastered} mastered · ${activeView.stats.due} due · ${activeView.stats.total} total`
            : `${CONCEPTS.length} total`}
        </p>
      </div>

      <div
        role="group"
        aria-label="Concept view"
        className="mt-4 flex w-fit items-center gap-1 rounded-lg border border-hairline bg-canvas-card p-1"
      >
        <button
          type="button"
          aria-pressed={mode === "list"}
          onClick={() => setMode("list")}
          className={cn(
            "min-h-9 rounded-md px-3 text-xs transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40",
            mode === "list"
              ? "bg-accent/10 text-accent"
              : "text-body-mid hover:text-ink",
          )}
        >
          List
        </button>
        <button
          type="button"
          aria-pressed={mode === "map"}
          onClick={() => setMode("map")}
          className={cn(
            "min-h-9 rounded-md px-3 text-xs transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40",
            mode === "map"
              ? "bg-accent/10 text-accent"
              : "text-body-mid hover:text-ink",
          )}
        >
          Map
        </button>
      </div>

      {mode === "map" ? (
        <div className="mt-6">
          <ConceptMap concepts={CONCEPTS} mastery={mastery} />
        </div>
      ) : (
      <div className="mt-6 space-y-8">
        {groups.map((group) => {
          const groupId = `concepts-${group.category
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")}`;
          return (
            <section key={group.category} aria-labelledby={groupId}>
              <div className="flex items-baseline justify-between gap-3">
                <h2
                  id={groupId}
                  className="text-base font-semibold tracking-tight text-ink"
                >
                  {group.category}
                </h2>
                <span className="font-mono text-[11px] text-mute">
                  {group.concepts.length}
                </span>
              </div>
              <ul className="mt-3 grid gap-4 lg:grid-cols-2">
                {group.concepts.map((concept) => (
                  <li key={concept.id}>
                    <ConceptCard
                      concept={concept}
                      state={activeView.states[concept.id]}
                      unlocked={isConceptUnlocked(concept, activeView.states)}
                      today={activeView.today}
                      onGrade={handleGrade}
                    />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
      )}

      <p className="mt-8 text-xs leading-relaxed text-body-mid">
        Concepts unlock once each prerequisite reaches {UNLOCK_REPS} reps or{" "}
        {UNLOCK_MASTERY}% mastery. Reviews are scheduled with SM-2; grading here
        updates the same schedule as Today and Pen &amp; Paper Math.
      </p>
    </section>
  );
}
