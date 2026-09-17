"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PROBLEM_META } from "@/data/problems/problem-meta";
import { getDailyDateKey } from "@/lib/daily";
import {
  cramQueue,
  forecastDue,
  health,
  leeches,
  LEECH_MIN_LAPSES,
  type ForecastDay,
  type ReviewHealth,
} from "@/lib/reviewPlan";
import {
  REVIEWS_CHANGE_EVENT,
  syncReviewQueue,
  type ReviewMap,
} from "@/lib/reviewQueue";
import { cn } from "@/lib/utils";

const PROGRESS_CHANGE_EVENT = "deepforge:progress-change";
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_LEECHES = 8;
const DRILL_PREVIEW = 5;

const META_BY_ID = new Map(
  PROBLEM_META.map((problem) => [problem.id, problem]),
);

const CARD_CLASSES =
  "rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5";
const PRIMARY_LINK_CLASSES =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-xs font-medium text-canvas transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0 sm:py-2";
const ROW_LINK_CLASSES =
  "flex min-h-11 items-center justify-between gap-3 rounded-md px-2 py-2 transition-colors hover:bg-canvas-soft focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40";

function SectionHeading({ id, children }: { id: string; children: string }) {
  return (
    <h2 id={id} className="text-lg font-semibold tracking-tight text-ink">
      {children}
    </h2>
  );
}

function formatDateKey(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function daysOverdue(dueKey: string, todayKey: string): number {
  const [dueYear, dueMonth, dueDay] = dueKey.split("-").map(Number);
  const [nowYear, nowMonth, nowDay] = todayKey.split("-").map(Number);
  const diff =
    Date.UTC(nowYear, nowMonth - 1, nowDay) -
    Date.UTC(dueYear, dueMonth - 1, dueDay);
  return Math.max(0, Math.round(diff / DAY_MS));
}

function dueLabel(dueKey: string, todayKey: string): string {
  const overdue = daysOverdue(dueKey, todayKey);
  if (overdue > 0) {
    return overdue === 1 ? "1 day overdue" : `${overdue} days overdue`;
  }
  if (dueKey === todayKey) return "due today";
  return `due ${formatDateKey(dueKey)}`;
}

function barWidth(count: number, max: number): string {
  if (count <= 0) return "0%";
  return `${Math.max(8, Math.round((count / Math.max(1, max)) * 100))}%`;
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-hairline bg-canvas p-3">
      <dt className="text-xs text-body-mid">{label}</dt>
      <dd className="mt-1 font-mono text-sm text-ink">{value}</dd>
    </div>
  );
}

function ForecastBars({
  forecast,
  todayKey,
}: {
  forecast: ForecastDay[];
  todayKey: string;
}) {
  const max = forecast.reduce((peak, day) => Math.max(peak, day.count), 0);
  return (
    <div aria-hidden className="mt-4 space-y-1.5">
      {forecast.map((day) => {
        const isToday = day.key === todayKey;
        return (
          <div key={day.key} className="flex items-center gap-2">
            <span
              className={cn(
                "w-10 shrink-0 font-mono text-[10px]",
                isToday ? "text-accent" : "text-mute",
              )}
            >
              {isToday ? "Today" : day.label}
            </span>
            <span className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-canvas-soft">
              <span
                className={cn(
                  "block h-full rounded-full",
                  isToday ? "bg-accent" : "bg-accent/40",
                )}
                style={{ width: barWidth(day.count, max) }}
              />
            </span>
            <span className="w-7 shrink-0 text-right font-mono text-[11px] text-body-mid">
              {day.count}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function forecastSummary(stats: ReviewHealth): string {
  if (stats.totalTracked === 0) {
    return "Nothing is on the schedule yet — solve a problem and it appears here the next day.";
  }
  return `${stats.totalTracked} ${
    stats.totalTracked === 1 ? "problem" : "problems"
  } on the schedule. No streaks or penalties — just what is due.`;
}

interface HubView {
  now: Date;
  reviews: ReviewMap;
}

export function ReviewHub() {
  const [view, setView] = useState<HubView | null>(null);

  const refresh = useCallback(() => {
    const now = new Date();
    setView({ now, reviews: syncReviewQueue(now) });
  }, []);

  useEffect(() => {
    const apply = () => refresh();
    apply();
    window.addEventListener(REVIEWS_CHANGE_EVENT, apply);
    window.addEventListener(PROGRESS_CHANGE_EVENT, apply);
    window.addEventListener("storage", apply);
    return () => {
      window.removeEventListener(REVIEWS_CHANGE_EVENT, apply);
      window.removeEventListener(PROGRESS_CHANGE_EVENT, apply);
      window.removeEventListener("storage", apply);
    };
  }, [refresh]);

  if (!view) {
    return (
      <section
        aria-live="polite"
        className="mx-auto w-full max-w-6xl px-4 py-10 text-sm text-body-mid sm:px-6 sm:py-14"
      >
        Reading your review schedule…
      </section>
    );
  }

  const todayKey = getDailyDateKey(view.now);
  const stats = health(view.reviews, view.now);
  const forecast = forecastDue(view.reviews, view.now);
  const trouble = leeches(view.reviews, META_BY_ID).slice(0, MAX_LEECHES);
  const drill = cramQueue(view.reviews, META_BY_ID, view.now);
  const scheduled = forecast.reduce((sum, day) => sum + day.count, 0);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-14 pt-8 sm:px-6 sm:pt-10">
      <section aria-labelledby="review-overview" className={CARD_CLASSES}>
        <SectionHeading id="review-overview">Review health</SectionHeading>
        <p className="mt-1 text-sm text-body-mid">
          {forecastSummary(stats)}
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCell label="Due now" value={String(stats.due)} />
          <StatCell label="Overdue" value={String(stats.overdue)} />
          <StatCell label="Next 7 days" value={String(stats.dueNext7)} />
          {stats.retention !== null && (
            <StatCell label="Retention" value={`${stats.retention}%`} />
          )}
        </dl>
        {stats.retention !== null && (
          <p className="mt-2 text-xs leading-relaxed text-mute">
            Retention is the share of graded problems whose most recent review
            passed — the only outcome signal the schedule stores.
          </p>
        )}
      </section>

      <section aria-labelledby="review-forecast" className={cn(CARD_CLASSES, "mt-6")}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <SectionHeading id="review-forecast">14-day forecast</SectionHeading>
          <p className="font-mono text-[11px] text-mute">
            {scheduled} scheduled
          </p>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-body-mid">
          Each day counts only problems already in your review schedule, so a
          fresh account starts empty rather than full.
        </p>

        {scheduled > 0 ? (
          <>
            <ForecastBars forecast={forecast} todayKey={todayKey} />
            <table className="sr-only">
              <caption>Review forecast for the next 14 days</caption>
              <thead>
                <tr>
                  <th scope="col">Day</th>
                  <th scope="col">Due</th>
                  <th scope="col">Overdue</th>
                </tr>
              </thead>
              <tbody>
                {forecast.map((day) => (
                  <tr key={day.key}>
                    <th scope="row">
                      {day.key === todayKey
                        ? `Today, ${day.key}`
                        : `${day.label}, ${day.key}`}
                    </th>
                    <td>{day.count}</td>
                    <td>{day.overdue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <div className="mt-3 rounded-lg border border-hairline bg-canvas p-4">
            <p className="text-sm text-body-mid">
              Nothing is scheduled in the next 14 days.
            </p>
            <p className="mt-1 text-xs text-mute">
              Solve a problem today and its first review lands here tomorrow.
            </p>
          </div>
        )}
      </section>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section aria-labelledby="review-trouble" className={CARD_CLASSES}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <SectionHeading id="review-trouble">Trouble spots</SectionHeading>
            <p className="font-mono text-[11px] text-mute">
              {trouble.length} shown
            </p>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-body-mid">
            Problems that have lapsed {LEECH_MIN_LAPSES}+ times, hardest first.
          </p>
          {trouble.length > 0 ? (
            <ul className="mt-3 divide-y divide-hairline">
              {trouble.map((item) => (
                <li key={item.id}>
                  <Link href={item.href} className={ROW_LINK_CLASSES}>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-ink">
                        {item.title}
                      </span>
                      <span className="block text-xs text-body-mid">
                        {item.lapses}{" "}
                        {item.lapses === 1 ? "lapse" : "lapses"}
                        <span className="mx-1.5 text-mute">·</span>
                        {dueLabel(item.dueKey, todayKey)}
                      </span>
                    </span>
                    <span aria-hidden className="shrink-0 text-mute">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-3 rounded-lg border border-hairline bg-canvas p-4">
              <p className="text-sm text-body-mid">
                No problem has lapsed {LEECH_MIN_LAPSES}+ times yet.
              </p>
              <p className="mt-1 text-xs text-mute">
                Lapses recorded from due reviews will collect here.
              </p>
            </div>
          )}
        </section>

        <section aria-labelledby="review-drill" className={CARD_CLASSES}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <SectionHeading id="review-drill">Start a drill</SectionHeading>
            {drill.length > 0 && (
              <p className="font-mono text-[11px] text-mute">
                {drill.length} in queue
              </p>
            )}
          </div>
          {drill.length > 0 ? (
            <>
              <p className="mt-1 text-xs leading-relaxed text-body-mid">
                An interleaved pass — most overdue first, then your weakest
                categories. No timer, no score.
              </p>
              <ol className="mt-3 divide-y divide-hairline">
                {drill.slice(0, DRILL_PREVIEW).map((item) => (
                  <li key={item.id}>
                    <Link href={item.href} className={ROW_LINK_CLASSES}>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-ink">
                          {item.title}
                        </span>
                        <span className="block text-xs text-body-mid">
                          {item.why}
                          <span className="mx-1.5 text-mute">·</span>
                          {item.category}
                        </span>
                      </span>
                      <span aria-hidden className="shrink-0 text-mute">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
              <div className="mt-4">
                <Link href={drill[0].href} className={PRIMARY_LINK_CLASSES}>
                  Start with {drill[0].title}
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </>
          ) : (
            <div className="mt-3 rounded-lg border border-hairline bg-canvas p-4">
              <p className="text-sm text-body-mid">
                Nothing to drill right now.
              </p>
              <p className="mt-1 text-xs text-mute">
                The drill wakes up as reviews come due or lapses are recorded.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
