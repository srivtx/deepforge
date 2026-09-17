"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PROBLEM_META } from "@/data/problems/problem-meta";
import { Reveal } from "@/components/motion/Reveal";
import { getDailyQuests, type Quest } from "@/lib/badges";
import {
  DAILY_CHANGE_EVENT,
  getDailyDateKey,
  getDailyState,
  isTodaySolved,
  markDailySolved,
} from "@/lib/daily";
import { getDailyProblem } from "@/lib/dailyProblem";
import {
  getProblemProgress,
  getProgress,
  type ProgressMap,
} from "@/lib/progress";
import { problemHref } from "@/lib/problemLinks";
import {
  dueReviews,
  forgetReview,
  getReviewBucketCounts,
  nextDueDate,
  pickWeakArea,
  REVIEWS_CHANGE_EVENT,
  syncReviewQueue,
  type ReviewItem,
  type ReviewMap,
} from "@/lib/reviewQueue";
import { cn, difficultyClasses } from "@/lib/utils";

const PROGRESS_CHANGE_EVENT = "deepforge:progress-change";
const META_BY_ID = new Map(PROBLEM_META.map((problem) => [problem.id, problem]));

interface SessionView {
  now: Date;
  reviews: ReviewMap;
  progress: ProgressMap;
  dailySolved: boolean;
  streak: number;
  quests: Quest[];
}

const CARD_CLASSES = "rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5";
const PRIMARY_LINK_CLASSES =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-xs font-medium text-canvas transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0 sm:py-2";
const SECONDARY_LINK_CLASSES =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-hairline px-4 text-xs font-medium text-ink transition-colors hover:bg-canvas-soft focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0 sm:py-2";

function SectionHeading({ id, children }: { id: string; children: string }) {
  return (
    <h2 id={id} className="text-lg font-semibold tracking-tight text-ink">
      {children}
    </h2>
  );
}

function DifficultyPill({ difficulty }: { difficulty: ReviewItem["meta"]["difficulty"] }) {
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

function formatDateKey(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function DueReviewRow({
  item,
  onForget,
}: {
  item: ReviewItem;
  onForget: (id: string) => void;
}) {
  return (
    <li className="flex items-stretch gap-2">
      <Link
        href={problemHref(item.id, "/today")}
        className="flex min-h-11 min-w-0 flex-1 flex-col justify-center gap-1 rounded-md px-2 py-2 transition-colors hover:bg-canvas-soft focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
      >
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-ink">
            {item.meta.title}
          </span>
          <DifficultyPill difficulty={item.meta.difficulty} />
          {item.bucket === "learning" && (
            <span className="rounded-full border border-info/40 bg-info/5 px-2 py-0.5 text-[10px] font-medium text-info">
              Learning
            </span>
          )}
        </span>
        <span className="text-xs text-body-mid">
          {item.meta.category}
          <span className="mx-1.5 text-mute">·</span>
          due {formatDateKey(item.due)}
        </span>
      </Link>
      <button
        type="button"
        onClick={() => onForget(item.id)}
        aria-label={`Mark ${item.meta.title} as forgotten`}
        className="min-h-11 shrink-0 self-center rounded-lg border border-hairline px-3 text-xs text-body-mid transition-colors hover:border-error/40 hover:text-error focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-8"
      >
        Forgot
      </button>
    </li>
  );
}

export function TodayScreen() {
  const [view, setView] = useState<SessionView | null>(null);

  const refresh = useCallback(() => {
    const now = new Date();
    const daily = getDailyProblem(now);
    const dailyProgress = getProblemProgress(daily.id);
    if (
      dailyProgress?.solved &&
      dailyProgress.solvedAt &&
      getDailyDateKey(new Date(dailyProgress.solvedAt)) === getDailyDateKey(now)
    ) {
      markDailySolved(now);
    }
    const reviews = syncReviewQueue(now);
    const dailyState = getDailyState();
    setView({
      now,
      reviews,
      progress: getProgress(),
      dailySolved: isTodaySolved(now),
      streak: dailyState.streak,
      quests: getDailyQuests(),
    });
  }, []);

  useEffect(() => {
    const apply = () => refresh();
    apply();
    window.addEventListener(REVIEWS_CHANGE_EVENT, apply);
    window.addEventListener(PROGRESS_CHANGE_EVENT, apply);
    window.addEventListener(DAILY_CHANGE_EVENT, apply);
    window.addEventListener("storage", apply);
    return () => {
      window.removeEventListener(REVIEWS_CHANGE_EVENT, apply);
      window.removeEventListener(PROGRESS_CHANGE_EVENT, apply);
      window.removeEventListener(DAILY_CHANGE_EVENT, apply);
      window.removeEventListener("storage", apply);
    };
  }, [refresh]);

  if (!view) {
    return (
      <section
        aria-live="polite"
        className="mx-auto w-full max-w-6xl px-4 py-10 text-sm text-body-mid sm:px-6 sm:py-14"
      >
        Preparing today&apos;s session…
      </section>
    );
  }

  const dailyProblem = getDailyProblem(view.now);
  const items = dueReviews(view.reviews, META_BY_ID, view.now);
  const counts = getReviewBucketCounts(view.reviews, view.now);
  const totalDue = counts.due + counts.learning;
  const weak = pickWeakArea(view.progress, view.reviews, PROBLEM_META);
  const upcoming = nextDueDate(view.reviews, view.now);
  const hasHistory = Object.values(view.progress).some(
    (entry) => entry?.attempted || entry?.solved,
  );

  const firstTarget = !view.dailySolved
    ? { href: problemHref(dailyProblem.id, "/today"), label: "Start daily problem" }
    : items[0]
      ? { href: problemHref(items[0].id, "/today"), label: "Start due reviews" }
      : weak
        ? { href: problemHref(weak.id, "/today"), label: "Practice weakest area" }
        : null;

  const questsDone = view.quests.filter((quest) => quest.done).length;

  const handleForget = (id: string) => {
    forgetReview(id, new Date());
    refresh();
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-14 pt-8 sm:px-6 sm:pt-10">
      <Reveal>
        <section aria-labelledby="today-session" className={CARD_CLASSES}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-mono text-[11px] text-mute">
                {view.now.toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <h2
                id="today-session"
                className="mt-1 text-lg font-semibold tracking-tight text-ink"
              >
                {firstTarget ? "Your session" : "Session complete"}
              </h2>
              <p className="mt-1 text-sm text-body-mid">
                {firstTarget
                  ? "One pre-built pass through the daily problem, due reviews, and your weakest area."
                  : "Everything scheduled for today is done. Come back tomorrow — or keep going in the library."}
              </p>
            </div>
            {firstTarget ? (
              <Link href={firstTarget.href} className={PRIMARY_LINK_CLASSES}>
                {firstTarget.label}
                <span aria-hidden>→</span>
              </Link>
            ) : (
              <Link href="/problems" className={SECONDARY_LINK_CLASSES}>
                Browse problems
              </Link>
            )}
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-hairline bg-canvas p-3">
              <dt className="text-xs text-body-mid">Daily problem</dt>
              <dd className="mt-1 font-mono text-sm text-ink">
                {view.dailySolved ? "Done" : "Open"}
              </dd>
            </div>
            <div className="rounded-lg border border-hairline bg-canvas p-3">
              <dt className="text-xs text-body-mid">Reviews due</dt>
              <dd className="mt-1 font-mono text-sm text-ink">{totalDue}</dd>
            </div>
            <div className="rounded-lg border border-hairline bg-canvas p-3">
              <dt className="text-xs text-body-mid">Streak</dt>
              <dd className="mt-1 font-mono text-sm text-ink">
                {view.streak} {view.streak === 1 ? "day" : "days"}
              </dd>
            </div>
            <div className="rounded-lg border border-hairline bg-canvas p-3">
              <dt className="text-xs text-body-mid">Quests</dt>
              <dd className="mt-1 font-mono text-sm text-ink">
                {questsDone}/{view.quests.length}
              </dd>
            </div>
          </dl>
        </section>
      </Reveal>

      <div className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Reveal delay={60} className="h-full">
          <section
            aria-labelledby="today-daily"
            className={cn(CARD_CLASSES, "flex h-full flex-col")}
          >
            <div className="flex items-start justify-between gap-3">
              <SectionHeading id="today-daily">Daily problem</SectionHeading>
              {view.dailySolved && (
                <span className="rounded-full border border-accent/40 bg-accent/5 px-2.5 py-1 text-[10px] font-medium text-accent">
                  Solved today
                </span>
              )}
            </div>
            <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-body-mid">
              <span className="font-mono text-[11px] text-mute">
                {dailyProblem.id}
              </span>
              <span className="text-mute">·</span>
              <span>{dailyProblem.category}</span>
              <DifficultyPill difficulty={dailyProblem.difficulty} />
            </p>
            <p className="mt-2 text-sm font-medium leading-relaxed text-ink">
              {dailyProblem.title}
            </p>
            <div className="mt-auto pt-4">
              <Link
                href={problemHref(dailyProblem.id, "/today")}
                className={view.dailySolved ? SECONDARY_LINK_CLASSES : PRIMARY_LINK_CLASSES}
              >
                {view.dailySolved ? "Revisit" : "Solve today\u2019s problem"}
              </Link>
            </div>
          </section>
        </Reveal>

        <Reveal delay={120} className="h-full">
          <section
            aria-labelledby="today-reviews"
            className={cn(CARD_CLASSES, "flex h-full flex-col")}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <SectionHeading id="today-reviews">Due reviews</SectionHeading>
              <p className="font-mono text-[11px] text-mute">
                {counts.due} due · {counts.learning} learning · {counts.new} new
              </p>
            </div>

            {items.length > 0 ? (
              <ul className="mt-3 divide-y divide-hairline">
                {items.map((item) => (
                  <DueReviewRow key={item.id} item={item} onForget={handleForget} />
                ))}
              </ul>
            ) : (
              <div className="mt-3 rounded-lg border border-hairline bg-canvas p-4">
                <p className="text-sm text-body-mid">
                  Nothing is due right now.
                </p>
                {upcoming && (
                  <p className="mt-1 text-xs text-mute">
                    Next review {formatDateKey(upcoming)}.
                  </p>
                )}
              </div>
            )}
          </section>
        </Reveal>

        <Reveal delay={180} className="h-full">
          <section
            aria-labelledby="today-weak"
            className={cn(CARD_CLASSES, "flex h-full flex-col")}
          >
            <SectionHeading id="today-weak">Weak-area pick</SectionHeading>
            {weak ? (
              <>
                <p className="mt-3 text-xs text-body-mid">
                  {weak.category} — ranked from misses and unsolved attempts.
                </p>
                <p className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] text-mute">{weak.id}</span>
                  <DifficultyPill difficulty={weak.difficulty} />
                </p>
                <p className="mt-1 text-sm font-medium leading-relaxed text-ink">
                  {weak.title}
                </p>
                <div className="mt-auto pt-4">
                  <Link href={problemHref(weak.id, "/today")} className={PRIMARY_LINK_CLASSES}>
                    Practice it
                  </Link>
                </div>
              </>
            ) : (
              <div className="mt-3 rounded-lg border border-hairline bg-canvas p-4">
                <p className="text-sm text-body-mid">
                  {hasHistory
                    ? "No open problems left in your weakest area — nice."
                    : "Solve a problem and DeepForge starts tracking which areas need another pass."}
                </p>
                {!hasHistory && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link href="/problems" className={PRIMARY_LINK_CLASSES}>
                      Browse problems
                    </Link>
                    <Link href="/paths" className={SECONDARY_LINK_CLASSES}>
                      Browse paths
                    </Link>
                  </div>
                )}
              </div>
            )}
          </section>
        </Reveal>

        <Reveal delay={240} className="h-full">
          <section
            aria-labelledby="today-streak"
            className={cn(CARD_CLASSES, "flex h-full flex-col")}
          >
            <SectionHeading id="today-streak">Streak &amp; quests</SectionHeading>
            <p className="mt-3 text-sm text-body-mid">
              {view.streak > 0 ? (
                <>
                  You are on a{" "}
                  <span className="font-mono text-ink">{view.streak}</span>-day
                  streak
                  {view.dailySolved ? " and today is already in." : " — keep it alive today."}
                </>
              ) : (
                "Solve any problem to start a streak."
              )}
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              {view.quests.map((quest) => (
                <li
                  key={quest.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-hairline bg-canvas px-3 py-2"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-ink">
                      {quest.label}
                    </span>
                    <span className="block text-xs text-mute">{quest.detail}</span>
                  </span>
                  <span
                    className={cn(
                      "shrink-0 font-mono text-xs",
                      quest.done ? "text-accent" : "text-body-mid",
                    )}
                  >
                    {quest.done ? "Done" : `${quest.progress}/${quest.target}`}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-4">
              <Link href="/badges" className={SECONDARY_LINK_CLASSES}>
                All quests &amp; badges
              </Link>
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  );
}
