"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getProblemProgress } from "@/lib/progress";
import { problemHref } from "@/lib/problemLinks";
import {
  DAILY_CHANGE_EVENT,
  getDailyDateKey,
  getDailyState,
  markDailySolved,
  type DailyState,
} from "@/lib/daily";
import { getDailyProblem } from "@/lib/dailyProblem";
import {
  getReviewBucketCounts,
  getReviewMap,
  REVIEWS_CHANGE_EVENT,
} from "@/lib/reviewQueue";
import { cn, difficultyClasses } from "@/lib/utils";
import { FlameGlyph } from "@/components/SolvedBanner";

const PROGRESS_CHANGE_EVENT = "deepforge:progress-change";

const EMPTY_DAILY_STATE: DailyState = {
  lastSolvedDate: null,
  streak: 0,
  solvedDates: [],
};

function msUntilMidnight(now: Date): number {
  const midnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  );
  return Math.max(0, midnight.getTime() - now.getTime());
}

function formatHms(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function DailyChallenge() {
  const router = useRouter();
  const [now, setNow] = useState<Date | null>(null);
  const [dailyState, setDailyState] = useState<DailyState>(EMPTY_DAILY_STATE);
  const [dueCount, setDueCount] = useState(0);

  const problem = getDailyProblem(now ?? new Date());
  const dateKey = getDailyDateKey(now ?? new Date());
  const solvedToday = dailyState.solvedDates.includes(dateKey);

  const refresh = useCallback(() => {
    setDailyState(getDailyState());
    const clock = new Date();
    const counts = getReviewBucketCounts(getReviewMap(clock), clock);
    setDueCount(counts.due + counts.learning);
  }, []);

  // Live clock — drives the countdown and the day rollover. Starts null so
  // the server-rendered markup matches the first client render.
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const onProgress = () => {
      if (getProblemProgress(problem.id)?.solved) {
        markDailySolved();
      }
      refresh();
    };
    const onDaily = () => refresh();
    onProgress();
    window.addEventListener(PROGRESS_CHANGE_EVENT, onProgress);
    window.addEventListener(DAILY_CHANGE_EVENT, onDaily);
    window.addEventListener(REVIEWS_CHANGE_EVENT, onDaily);
    window.addEventListener("storage", onDaily);
    return () => {
      window.removeEventListener(PROGRESS_CHANGE_EVENT, onProgress);
      window.removeEventListener(DAILY_CHANGE_EVENT, onDaily);
      window.removeEventListener(REVIEWS_CHANGE_EVENT, onDaily);
      window.removeEventListener("storage", onDaily);
    };
  }, [problem.id, refresh]);

  const remaining = now ? formatHms(msUntilMidnight(now)) : "--:--:--";
  const streakUnit = dailyState.streak === 1 ? "day" : "days";

  return (
    <>
      <section
        id="daily"
        className="mx-auto w-full max-w-6xl scroll-mt-16 px-4 py-8 sm:px-6 sm:py-12"
      >
        <div
          className={cn(
            "rounded-lg border bg-canvas-card p-4 sm:p-5",
            solvedToday ? "border-accent/40" : "border-hairline",
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-mono text-body-mid">{dateKey}</span>
                <span className="font-mono text-mute">{problem.id}</span>
                <span className="text-body-mid">·</span>
                <span className="text-body">{problem.category}</span>
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                    difficultyClasses(problem.difficulty),
                  )}
                >
                  {problem.difficulty}
                </span>
              </div>
              <h2 className="mt-2 text-base font-semibold text-ink sm:text-lg">
                {problem.title}
              </h2>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {dueCount > 0 && (
                <Link
                  href="/today"
                  aria-label={`Open Today — ${dueCount} review${dueCount === 1 ? "" : "s"} due`}
                  className="inline-flex min-h-11 items-center rounded-full border border-hairline px-3 text-[10px] font-medium text-body-mid transition-colors hover:border-accent/40 hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0 sm:py-1"
                >
                  Review {dueCount} due
                </Link>
              )}
              {solvedToday && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/5 px-2.5 py-1 text-[10px] font-medium text-accent">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M2 5l2 2 4-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Solved today
                </span>
              )}
              <button
                type="button"
                onClick={() => router.push(problemHref(problem.id, "/daily"))}
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-4 text-xs font-medium text-canvas transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
              >
                {solvedToday ? "View" : "Solve"}
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-hairline bg-canvas p-4">
              <div className="text-xs text-body-mid">Daily streak</div>
              <div className="mt-1.5 font-mono text-xl text-ink">
                {dailyState.streak}
                <span className="ml-1.5 text-xs text-body-mid">
                  {streakUnit}
                </span>
              </div>
            </div>
            <div className="rounded-lg border border-hairline bg-canvas p-4">
              <div className="text-xs text-body-mid">Next problem in</div>
              <div className="mt-1.5 font-mono text-xl text-ink">{remaining}</div>
            </div>
          </div>

          {solvedToday && (
            <div
              role="status"
              aria-live="polite"
              className="mt-4 flex flex-wrap items-center gap-1.5 text-xs text-accent"
            >
              <FlameGlyph className="h-3.5 w-3.5 shrink-0" />
              <span>
                Streak: {dailyState.streak} {streakUnit} — see you tomorrow
              </span>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
