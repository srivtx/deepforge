"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DAILY_CHANGE_EVENT,
  getDailyState,
  getSolveStreak,
  isTodaySolved,
} from "@/lib/daily";
import {
  getReviewBucketCounts,
  getReviewMap,
  REVIEWS_CHANGE_EVENT,
} from "@/lib/reviewQueue";

const PROGRESS_CHANGE_EVENT = "deepforge:progress-change";

interface PendingSession {
  due: number;
  streak: number;
}

/**
 * Compact home-hero entry point to `/today`. Renders nothing until
 * hydration, then appears only when a session is actually pending — the
 * daily problem is unsolved or reviews are due — so a clean account never
 * sees a dead CTA.
 */
export function TodayEntry() {
  const [pending, setPending] = useState<PendingSession | null>(null);

  useEffect(() => {
    const compute = () => {
      const now = new Date();
      const counts = getReviewBucketCounts(getReviewMap(now), now);
      const due = counts.due + counts.learning;
      const dailyPending = !isTodaySolved(now);
      setPending(
        due > 0 || dailyPending
          ? { due, streak: getSolveStreak() }
          : null,
      );
    };
    compute();
    window.addEventListener(REVIEWS_CHANGE_EVENT, compute);
    window.addEventListener(PROGRESS_CHANGE_EVENT, compute);
    window.addEventListener(DAILY_CHANGE_EVENT, compute);
    window.addEventListener("storage", compute);
    return () => {
      window.removeEventListener(REVIEWS_CHANGE_EVENT, compute);
      window.removeEventListener(PROGRESS_CHANGE_EVENT, compute);
      window.removeEventListener(DAILY_CHANGE_EVENT, compute);
      window.removeEventListener("storage", compute);
    };
  }, []);

  if (!pending) return null;

  const detail =
    pending.due > 0
      ? `${pending.due} review${pending.due === 1 ? "" : "s"} due`
      : pending.streak > 0
        ? "keep your streak"
        : "start here";

  return (
    <Link
      href="/today"
      aria-label={`Open Today — ${detail}`}
      className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-accent/40 bg-accent/5 px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0"
    >
      <span aria-hidden className="df-pulse h-1.5 w-1.5 rounded-full bg-accent" />
      Open Today
      <span className="font-mono text-xs text-accent/80">{detail}</span>
      <span aria-hidden>→</span>
    </Link>
  );
}
