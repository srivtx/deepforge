"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/Reveal";
import { DAILY_CHANGE_EVENT, getDailyDateKey, getDailyState } from "@/lib/daily";
import { getCurrentStreak, getLongestStreak } from "@/lib/leaderboard";
import { getProgress } from "@/lib/progress";

const PROGRESS_CHANGE_EVENT = "deepforge:progress-change";

interface DayDot {
  key: string;
  label: string;
  solved: boolean;
  today: boolean;
}

interface StreakSnapshot {
  current: number;
  longest: number;
  days: DayDot[];
}

const EMPTY_SNAPSHOT: StreakSnapshot = { current: 0, longest: 0, days: [] };

const PLACEHOLDER_DAYS: DayDot[] = Array.from({ length: 7 }, (_, index) => ({
  key: `placeholder-${index}`,
  label: "Loading",
  solved: false,
  today: false,
}));

let cached: StreakSnapshot | null = null;

function buildSnapshot(): StreakSnapshot {
  const progress = getProgress();
  const solvedKeys = new Set<string>();
  for (const record of Object.values(progress)) {
    if (!record?.solvedAt) continue;
    const at = new Date(record.solvedAt);
    if (Number.isNaN(at.getTime())) continue;
    solvedKeys.add(getDailyDateKey(at));
  }
  for (const key of getDailyState().solvedDates) solvedKeys.add(key);

  const now = new Date();
  const days: DayDot[] = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(now);
    date.setDate(date.getDate() - offset);
    const key = getDailyDateKey(date);
    days.push({
      key,
      label: `${date.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      })}${offset === 0 ? " (today)" : ""}`,
      solved: solvedKeys.has(key),
      today: offset === 0,
    });
  }

  return {
    current: getCurrentStreak(progress),
    longest: getLongestStreak(progress),
    days,
  };
}

function getSnapshot(): StreakSnapshot {
  if (!cached) cached = buildSnapshot();
  return cached;
}

function getServerSnapshot(): StreakSnapshot {
  return EMPTY_SNAPSHOT;
}

function subscribe(onStoreChange: () => void): () => void {
  const onChange = () => {
    cached = null;
    onStoreChange();
  };
  window.addEventListener(PROGRESS_CHANGE_EVENT, onChange);
  window.addEventListener(DAILY_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(PROGRESS_CHANGE_EVENT, onChange);
    window.removeEventListener(DAILY_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function FlameGlyph() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2.5c.6 3.6 4.5 4.8 4.5 9a6.5 6.5 0 0 1-13 0c0-2.2 1.1-3.8 2.7-5.3.2 1.1.8 1.9 1.7 2.4C8.2 6.3 9.4 4.2 12 2.5Z" />
    </svg>
  );
}

/**
 * Compact streak widget sourced from the canonical stores: current/longest
 * from `getCurrentStreak`/`getLongestStreak` over progress, and the 7-day row
 * from both solve timestamps and daily-challenge solve dates.
 */
export function StreakCard() {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const days = snapshot.days.length === 7 ? snapshot.days : PLACEHOLDER_DAYS;
  const solvedThisWeek = days.filter((day) => day.solved).length;

  return (
    <Reveal className="h-full">
      <div className="flex h-full flex-col rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-accent/40 bg-accent/5 text-accent">
            <FlameGlyph />
          </span>
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-medium text-ink">
                {snapshot.current}
              </span>
              <span className="text-xs text-body-mid">day streak</span>
            </div>
            <div className="text-xs text-body-mid">
              Longest {snapshot.longest} days
            </div>
          </div>
        </div>

        <div
          role="img"
          aria-label={`Last 7 days — solved on ${solvedThisWeek} of them`}
          className="mt-4 flex items-center justify-between gap-1.5"
        >
          {days.map((day, index) => (
            <span
              key={`${day.key}-${index}`}
              title={`${day.label} — ${day.solved ? "solved" : "no solve"}`}
              className={cn(
                "h-2.5 w-2.5 shrink-0 rounded-full",
                day.solved
                  ? "bg-accent"
                  : "border border-hairline bg-canvas-soft",
                day.today && !day.solved && "ring-1 ring-accent/40",
                day.today && day.solved && "ring-2 ring-accent/30",
              )}
            />
          ))}
        </div>

        <p className="mt-auto pt-3 text-xs text-body-mid">
          Solve any problem today to keep it alive.
        </p>
      </div>
    </Reveal>
  );
}
