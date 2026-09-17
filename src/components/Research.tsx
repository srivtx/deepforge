"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RESEARCH_CHALLENGES, type ResearchChallenge } from "@/data/research";
import {
  RESEARCH_CHANGE_EVENT,
  getResearchState,
  type ResearchChallengeState,
  type ResearchState,
} from "@/lib/research";
import { cn } from "@/lib/utils";
import { formatScore, metricLabel } from "@/components/research/format";

function StoredBadges({
  state,
}: {
  state: ResearchChallengeState | undefined;
}) {
  const beaten = Boolean(state?.beatenBaseline);
  const bestScore = state?.bestScore ?? null;
  if (!beaten && bestScore === null) return null;

  return (
    <span className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
      {beaten && (
        <span className="rounded-full border border-accent/40 bg-accent/5 px-2 py-0.5 text-[10px] font-medium text-accent">
          Baseline beaten
        </span>
      )}
      {bestScore !== null && (
        <span className="rounded-full border border-hairline px-2 py-0.5 text-[10px] font-medium text-body-mid">
          Best {formatScore(bestScore)}
        </span>
      )}
    </span>
  );
}

function ChallengeCard({
  challenge,
  state,
}: {
  challenge: ResearchChallenge;
  state: ResearchChallengeState | undefined;
}) {
  return (
    <Link
      href={`/research/${challenge.id}`}
      className="flex min-h-[168px] flex-col justify-between rounded-lg border border-hairline bg-canvas-card p-4 transition-colors hover:border-accent/30 hover:bg-canvas-soft focus:outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent sm:p-5"
    >
      <span>
        <span className="flex items-start justify-between gap-3">
          <span className="text-base font-semibold text-ink">
            {challenge.title}
          </span>
          <StoredBadges state={state} />
        </span>
        <span className="mt-2 line-clamp-2 text-sm leading-relaxed text-body">
          {challenge.blurb}
        </span>
      </span>
      <span className="mt-4 flex flex-wrap items-end justify-between gap-2">
        <span className="font-mono text-xs text-body-mid">
          {metricLabel(challenge.metric)} · baseline{" "}
          {formatScore(challenge.baselineScore)} ({challenge.baselineName}) →
          beat it
        </span>
        <span className="font-mono text-xs text-mute">
          {challenge.points} pts
        </span>
      </span>
    </Link>
  );
}

/**
 * The /research index: a link grid into each challenge's own workspace page.
 * Stored records (baseline beaten, best score) are read on the client and
 * stay in sync with every writer through RESEARCH_CHANGE_EVENT.
 */
export function Research() {
  const [state, setState] = useState<ResearchState>({});

  useEffect(() => {
    const load = () => setState(getResearchState());
    load();
    window.addEventListener(RESEARCH_CHANGE_EVENT, load);
    return () => window.removeEventListener(RESEARCH_CHANGE_EVENT, load);
  }, []);

  const beatenCount = useMemo(
    () =>
      RESEARCH_CHALLENGES.filter((c) => state[c.id]?.beatenBaseline).length,
    [state],
  );

  return (
    <section
      id="research"
      className="mx-auto max-w-6xl scroll-mt-16 px-4 py-10 sm:px-6 sm:py-14"
    >
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
        <h2
          className={cn(
            "text-sm font-medium",
            beatenCount > 0 ? "text-accent" : "text-body-mid",
          )}
        >
          {beatenCount} / {RESEARCH_CHALLENGES.length} baselines beaten
        </h2>
        <p className="text-xs text-mute">
          Open a challenge to read the notes and run your solution.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {RESEARCH_CHALLENGES.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            state={state[challenge.id]}
          />
        ))}
      </div>
    </section>
  );
}
