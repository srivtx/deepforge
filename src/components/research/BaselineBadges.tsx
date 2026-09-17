"use client";

import { useEffect, useState } from "react";
import type { ResearchChallenge } from "@/data/research";
import {
  RESEARCH_CHANGE_EVENT,
  getResearchState,
  type ResearchChallengeState,
} from "@/lib/research";
import { formatScore } from "./format";

/**
 * Stored-record badges for a challenge header. The detail page is a server
 * component, so this small island owns the localStorage read: it renders
 * nothing on the server and fills in after hydration.
 */
export function BaselineBadges({ challenge }: { challenge: ResearchChallenge }) {
  const [state, setState] = useState<ResearchChallengeState | null>(null);

  useEffect(() => {
    const load = () => setState(getResearchState()[challenge.id] ?? null);
    load();
    window.addEventListener(RESEARCH_CHANGE_EVENT, load);
    return () => window.removeEventListener(RESEARCH_CHANGE_EVENT, load);
  }, [challenge.id]);

  const beaten = Boolean(state?.beatenBaseline);
  const bestScore = state?.bestScore ?? null;
  if (!beaten && bestScore === null) return null;

  return (
    <>
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
    </>
  );
}
