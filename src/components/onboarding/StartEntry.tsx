"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProgress } from "@/lib/progress";
import { readRaw } from "@/lib/sync/localAdapter";

// Mirrors `src/lib/onboarding.ts` and `src/lib/progress.ts`. Kept as literals
// so the home hero never pulls the 5,550-entry PROBLEM_META index into its
// bundle just to decide whether to show a link.
const PLACEMENT_STORAGE_KEY = "deepforge:placement:v1";
const PLACEMENT_CHANGE_EVENT = "deepforge:placement-change";
const PROGRESS_CHANGE_EVENT = "deepforge:progress-change";

/**
 * Home-hero entry to the placement check. Appears only for a clean account:
 * nothing attempted or solved yet and no saved placement. Renders nothing
 * until hydration, so the server HTML never shows a dead CTA.
 */
export function StartEntry() {
  const [offer, setOffer] = useState(false);

  useEffect(() => {
    const compute = () => {
      const progress = getProgress();
      const started = Object.values(progress).some(
        (entry) => entry?.attempted || entry?.solved,
      );
      setOffer(!started && readRaw(PLACEMENT_STORAGE_KEY) === null);
    };
    compute();
    window.addEventListener(PROGRESS_CHANGE_EVENT, compute);
    window.addEventListener(PLACEMENT_CHANGE_EVENT, compute);
    window.addEventListener("storage", compute);
    return () => {
      window.removeEventListener(PROGRESS_CHANGE_EVENT, compute);
      window.removeEventListener(PLACEMENT_CHANGE_EVENT, compute);
      window.removeEventListener("storage", compute);
    };
  }, []);

  if (!offer) return null;

  return (
    <Link
      href="/start"
      aria-label="Find your level — a three-minute placement check"
      className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-accent/40 bg-accent/5 px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0"
    >
      Find your level
      <span className="font-mono text-xs text-accent/80">3 min</span>
      <span aria-hidden>→</span>
    </Link>
  );
}
