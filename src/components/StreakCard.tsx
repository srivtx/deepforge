"use client";

import { useEffect, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/Reveal";
import {
  applyShield,
  DAILY_CHANGE_EVENT,
  getDailyDateKey,
  getDailyShieldUsedDates,
  getDailyState,
  getShieldStatus,
  getSolveStreak,
  MAX_SHIELDS,
  SHIELD_EARN_INTERVAL,
  type ShieldStatus,
} from "@/lib/daily";
import { getLongestStreak } from "@/lib/leaderboard";
import { getProgress } from "@/lib/progress";

const PROGRESS_CHANGE_EVENT = "deepforge:progress-change";

interface DayDot {
  key: string;
  label: string;
  solved: boolean;
  covered: boolean;
  today: boolean;
}

interface StreakSnapshot {
  current: number;
  longest: number;
  days: DayDot[];
  shields: ShieldStatus;
}

const EMPTY_SHIELDS: ShieldStatus = {
  available: 0,
  max: MAX_SHIELDS,
  spent: 0,
  lastUsedDate: null,
  solvedToday: false,
  coveredYesterday: false,
  atRisk: false,
  protectedToday: false,
  dailyStreak: 0,
  solveStreak: 0,
};

const EMPTY_SNAPSHOT: StreakSnapshot = {
  current: 0,
  longest: 0,
  days: [],
  shields: EMPTY_SHIELDS,
};

const PLACEHOLDER_DAYS: DayDot[] = Array.from({ length: 7 }, (_, index) => ({
  key: `placeholder-${index}`,
  label: "Loading",
  solved: false,
  covered: false,
  today: false,
}));

let cached: StreakSnapshot | null = null;

function buildSnapshot(): StreakSnapshot {
  const progress = getProgress();
  const daily = getDailyState();
  const solvedKeys = new Set<string>();
  for (const record of Object.values(progress)) {
    if (!record?.solvedAt) continue;
    const at = new Date(record.solvedAt);
    if (Number.isNaN(at.getTime())) continue;
    solvedKeys.add(getDailyDateKey(at));
  }
  for (const key of daily.solvedDates) solvedKeys.add(key);
  const coveredKeys = new Set(getDailyShieldUsedDates(daily));

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
      covered: !solvedKeys.has(key) && coveredKeys.has(key),
      today: offset === 0,
    });
  }

  return {
    current: getSolveStreak(progress, now),
    longest: getLongestStreak(progress),
    days,
    shields: getShieldStatus(now),
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

function ShieldGlyph({
  filled,
  className,
}: {
  filled: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 3 19 6v5c0 4.4-2.9 8.4-7 10-4.1-1.6-7-5.6-7-10V6l7-3Z" />
    </svg>
  );
}

/** Honest, state-specific shield copy for the solve streak. */
function shieldCopy(status: ShieldStatus): string {
  if (status.solvedToday) {
    if (status.available >= status.max) {
      return "Both shields ready — the solve streak is safe.";
    }
    const remaining =
      SHIELD_EARN_INTERVAL - (status.dailyStreak % SHIELD_EARN_INTERVAL);
    return `Solve streak safe — ${remaining} more daily challenge${
      remaining === 1 ? "" : "s"
    } to the next shield.`;
  }
  if (status.coveredYesterday) {
    return "A shield covered yesterday — solve any problem today to keep the run going.";
  }
  if (status.atRisk) {
    return "No shield left — solve any problem today or the solve streak resets.";
  }
  if (status.protectedToday) {
    return "Solve any problem today — a shield covers one missed calendar day.";
  }
  return `Solve ${SHIELD_EARN_INTERVAL} daily challenges in a row to earn a shield.`;
}

/**
 * Compact streak widget sourced from the canonical stores: the current solve
 * streak from `getSolveStreak` and the longest from `getLongestStreak` over
 * progress, the 7-day row from solve timestamps and daily-challenge solve
 * dates, and streak shields from the daily state (auto-cover runs on mount,
 * before the snapshot is read).
 */
export function StreakCard() {
  // Visiting the card is the auto-cover trigger: a single missed day is
  // covered here, before the next solve could reset the streak.
  useEffect(() => {
    applyShield();
  }, []);

  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const days = snapshot.days.length === 7 ? snapshot.days : PLACEHOLDER_DAYS;
  const solvedThisWeek = days.filter((day) => day.solved).length;
  const coveredThisWeek = days.filter((day) => day.covered).length;
  const shields = snapshot.shields;
  const slots = Array.from(
    { length: shields.max },
    (_, index) => index < shields.available,
  );

  return (
    <Reveal className="h-full">
      <div className="flex h-full flex-col rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-accent/40 bg-accent/5 text-accent">
            <FlameGlyph />
          </span>
          <div className="min-w-0">
            <div className="text-xs text-body-mid">Solve streak</div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-medium text-ink">
                {snapshot.current}
              </span>
              <span className="text-xs text-body-mid">
                {snapshot.current === 1 ? "day" : "days"}
              </span>
            </div>
            <div className="text-xs text-body-mid">
              Longest {snapshot.longest} days
            </div>
          </div>
        </div>

        <div
          role="img"
          aria-label={`Last 7 days — solved on ${solvedThisWeek} of them${
            coveredThisWeek > 0
              ? `, ${coveredThisWeek} covered by a shield`
              : ""
          }`}
          className="mt-4 flex items-center justify-between gap-1.5"
        >
          {days.map((day, index) => (
            <span
              key={`${day.key}-${index}`}
              title={`${day.label} — ${
                day.solved
                  ? "solved"
                  : day.covered
                    ? "covered by a shield"
                    : "no solve"
              }`}
              className={cn(
                "h-2.5 w-2.5 shrink-0 rounded-full",
                day.solved
                  ? "bg-accent"
                  : day.covered
                    ? "border border-accent/60 bg-accent/20"
                    : "border border-hairline bg-canvas-soft",
                day.today && !day.solved && "ring-1 ring-accent/40",
                day.today && day.solved && "ring-2 ring-accent/30",
              )}
            />
          ))}
        </div>

        <div className="mt-4 border-t border-hairline pt-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-body-mid">Streak shields</span>
            <span className="font-mono text-xs text-body">
              {shields.available}/{shields.max}
            </span>
          </div>
          <div
            role="img"
            aria-label={`Streak shields: ${shields.available} of ${shields.max} available, ${shields.spent} spent`}
            className="mt-2 flex items-center gap-1.5"
          >
            {slots.map((filled, index) => (
              <ShieldGlyph
                key={index}
                filled={filled}
                className={cn(
                  "h-4 w-4",
                  filled ? "text-accent" : "text-body-mid opacity-30",
                )}
              />
            ))}
            {shields.spent > 0 && (
              <span className="ml-1 text-[11px] text-body-mid">
                {shields.spent} spent
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-body-mid">{shieldCopy(shields)}</p>
        </div>

        <p className="mt-auto pt-3 text-xs text-body-mid">
          Earn one at every {SHIELD_EARN_INTERVAL}-day daily challenge chain,
          up to {MAX_SHIELDS}. A shield covers one missed calendar day; it
          never counts as a solve.
        </p>
      </div>
    </Reveal>
  );
}
