"use client";

import { useSyncExternalStore } from "react";
import { CONCEPTS } from "@/data/concepts";
import { LABS } from "@/data/labs";
import { RESEARCH_CHALLENGES } from "@/data/research";
import { DAILY_CHANGE_EVENT } from "@/lib/daily";
import { CONCEPTS_CHANGE_EVENT } from "@/lib/concepts";
import { CONTEST_CHANGE_EVENT } from "@/lib/contestStore";
import { LAB_CHANGE_EVENT } from "@/lib/labs";
import { PENPAPER_CHANGE_EVENT } from "@/lib/penpaper";
import { RESEARCH_CHANGE_EVENT } from "@/lib/research";
import {
  MASTERY_WEIGHTS,
  getActivityTrend,
  getCategoryBreakdown,
  getDifficultyBreakdown,
  getEstimatedMastery,
  getOverview,
  getRecords,
  getTimeOfDay,
  type CategoryStat,
  type DifficultyStat,
  type MasteryEstimate,
  type Overview,
  type Records,
  type TimeOfDayBucket,
  type TrendDay,
} from "@/lib/stats";
import { cn } from "@/lib/utils";
import { FlameGlyph } from "@/components/SolvedBanner";
import type { Difficulty } from "@/types/problem";

/* ─────────────────────────────── data store ─────────────────────────────── */

interface StatsData {
  overview: Overview;
  categories: CategoryStat[];
  difficulty: DifficultyStat[];
  trend: TrendDay[];
  timeOfDay: TimeOfDayBucket[];
  records: Records;
  mastery: MasteryEstimate;
}

const EMPTY_STATS: StatsData = {
  overview: {
    solved: 0,
    attempted: 0,
    total: 0,
    accuracy: 0,
    solvedToday: 0,
    solvedThisWeek: 0,
    currentStreak: 0,
    longestStreak: 0,
    xp: 0,
    level: 1,
    levelTitle: "Novice",
    labsPassed: 0,
    researchBeaten: 0,
    conceptsMastered: 0,
    contestsPlayed: 0,
  },
  categories: [],
  difficulty: [],
  trend: [],
  timeOfDay: [],
  records: {
    fastestFirstSolve: null,
    longestDailyStreak: 0,
    mostActiveDay: null,
    hardestSolved: 0,
    firstSolvedAt: null,
    lastSolvedAt: null,
  },
  mastery: { value: 0, coverage: 0, depth: 0, recency: 0 },
};

const TREND_DAYS = 30;

const PROGRESS_CHANGE_EVENT = "deepforge:progress-change";

const STATS_EVENTS = [
  PROGRESS_CHANGE_EVENT,
  DAILY_CHANGE_EVENT,
  LAB_CHANGE_EVENT,
  RESEARCH_CHANGE_EVENT,
  CONCEPTS_CHANGE_EVENT,
  CONTEST_CHANGE_EVENT,
  PENPAPER_CHANGE_EVENT,
];

let cached: StatsData | null = null;

function buildStats(): StatsData {
  return {
    overview: getOverview(),
    categories: getCategoryBreakdown(),
    difficulty: getDifficultyBreakdown(),
    trend: getActivityTrend(TREND_DAYS),
    timeOfDay: getTimeOfDay(),
    records: getRecords(),
    mastery: getEstimatedMastery(),
  };
}

function getSnapshot(): StatsData {
  if (!cached) cached = buildStats();
  return cached;
}

function getServerSnapshot(): StatsData {
  return EMPTY_STATS;
}

function subscribe(onStoreChange: () => void): () => void {
  const onChange = () => {
    cached = null;
    onStoreChange();
  };
  for (const event of STATS_EVENTS) window.addEventListener(event, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    for (const event of STATS_EVENTS) {
      window.removeEventListener(event, onChange);
    }
    window.removeEventListener("storage", onChange);
  };
}

/* ──────────────────────────────── helpers ───────────────────────────────── */

function formatPercent(ratio: number): string {
  const clamped = Math.max(0, Math.min(1, ratio));
  return `${Math.round(clamped * 100)}%`;
}

function formatDuration(ms: number): string {
  const seconds = Math.max(0, Math.round(ms / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* ────────────────────────────── micro views ─────────────────────────────── */

function StatTile({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
      <div className="text-xs text-body-mid">{label}</div>
      <div className="mt-0.5 font-mono text-lg font-medium text-ink">
        {value}
      </div>
      <div className="mt-0.5 truncate text-[10px] text-body-mid">{detail}</div>
    </div>
  );
}

function StreakTile({
  current,
  longest,
  days,
}: {
  current: number;
  longest: number;
  days: TrendDay[];
}) {
  const recent = days.slice(-7);
  const summary = recent
    .map(
      (day) =>
        `${day.date}: ${day.count} ${day.count === 1 ? "solve" : "solves"}`,
    )
    .join(", ");

  return (
    <div className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
      <div className="text-xs text-body-mid">Current streak</div>
      <div className="mt-0.5 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5">
          <FlameGlyph
            className={cn(
              "h-4 w-4 shrink-0",
              current > 0 ? "text-accent" : "text-body-mid",
            )}
          />
          <span className="font-mono text-lg font-medium text-ink">
            {current}d
          </span>
        </span>
        <span className="truncate font-mono text-[10px] text-body-mid">
          longest {longest}d
        </span>
      </div>
      {recent.length > 0 && (
        <div
          role="img"
          aria-label={`Last 7 days: ${summary}`}
          className="mt-2 flex items-center gap-1"
        >
          {recent.map((day) => (
            <span
              key={day.date}
              aria-hidden
              title={`${day.date}: ${day.count} ${
                day.count === 1 ? "solve" : "solves"
              }`}
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                day.count > 0 ? "bg-accent" : "bg-canvas-soft",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Meter({
  label,
  percent,
  valueText,
}: {
  label: string;
  percent: number;
  valueText: string;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3 text-[10px] text-body-mid">
        <span>{label}</span>
        <span className="font-mono">{valueText}</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(clamped)}
        className="h-1.5 overflow-hidden rounded-full bg-canvas-soft"
      >
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

function ActivityChart({ trend }: { trend: TrendDay[] }) {
  const total = trend.reduce((sum, day) => sum + day.count, 0);
  let peak = 0;
  let peakDate: string | null = null;
  for (const day of trend) {
    if (day.count > peak) {
      peak = day.count;
      peakDate = day.date;
    }
  }

  const summary =
    trend.length === 0
      ? "No daily activity recorded yet."
      : `Daily solves for the last ${trend.length} days: ${total} total${
          peakDate ? `, peak ${peak} on ${peakDate}` : ""
        }.`;

  const width = Math.max(1, trend.length) * 10;

  return (
    <div className="mt-4">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-xs text-body-mid">
        <span>Daily solves</span>
        <span className="font-mono">
          {total} in {trend.length} days
          {peak > 0 ? ` · peak ${peak}` : ""}
        </span>
      </div>
      {trend.length === 0 ? (
        <div className="rounded-lg border border-hairline bg-canvas px-3 py-6 text-center text-xs text-body-mid">
          Activity appears here once your local progress loads.
        </div>
      ) : (
        <>
          <svg
            viewBox={`0 0 ${width} 100`}
            preserveAspectRatio="none"
            role="img"
            aria-label={summary}
            className="h-32 w-full"
          >
            {trend.map((day, index) => {
              const height =
                peak > 0 && day.count > 0
                  ? Math.max(4, (day.count / peak) * 96)
                  : 0;
              return (
                <rect
                  key={day.date}
                  x={index * 10 + 1.5}
                  y={100 - height}
                  width={7}
                  height={height}
                  className="fill-accent"
                  fillOpacity={0.75}
                >
                  <title>
                    {`${day.date}: ${day.count} ${
                      day.count === 1 ? "solve" : "solves"
                    }`}
                  </title>
                </rect>
              );
            })}
            <line
              x1={0}
              y1={99}
              x2={width}
              y2={99}
              className="stroke-hairline"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="mt-1 flex items-center justify-between text-[10px] text-body-mid">
            <span>{trend[0]?.date}</span>
            <span>Today</span>
          </div>
          <table className="sr-only">
            <caption>Daily solves, last {trend.length} days</caption>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Solves</th>
              </tr>
            </thead>
            <tbody>
              {trend.map((day) => (
                <tr key={day.date}>
                  <th scope="row">{day.date}</th>
                  <td>{day.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

function CategoryBars({ categories }: { categories: CategoryStat[] }) {
  const top = categories.slice(0, 8);
  return (
    <div className="mt-4">
      {top.length === 0 ? (
        <p className="rounded-lg border border-hairline bg-canvas px-4 py-6 text-center text-xs text-body-mid">
          Category coverage appears once your local progress loads.
        </p>
      ) : (
        <ul className="space-y-3">
          {top.map((category) => {
            const percent = Math.max(0, Math.min(100, category.percent));
            const avg =
              category.solved > 0 ? category.avgDifficulty.toFixed(1) : null;
            return (
              <li key={category.name}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 flex-1 truncate text-sm text-ink">
                    {category.name}
                  </span>
                  <span className="shrink-0 font-mono text-xs text-body-mid">
                    {category.solved}/{category.total} ·{" "}
                    {Math.round(percent)}%
                    {avg ? ` · avg ${avg}` : ""}
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-label={`${category.name} coverage`}
                  aria-valuemin={0}
                  aria-valuemax={category.total}
                  aria-valuenow={category.solved}
                  className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-canvas-soft"
                >
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

const DIFFICULTY_FILL: Record<Difficulty, string> = {
  Easy: "bg-accent",
  Medium: "bg-warning",
  Hard: "bg-error",
};

function DifficultyBar({ items }: { items: DifficultyStat[] }) {
  const solvedTotal = items.reduce((sum, item) => sum + item.solved, 0);
  const label =
    items.length === 0
      ? "Difficulty split: no data yet."
      : `Difficulty split: ${items
          .map((item) => `${item.difficulty} ${item.solved} of ${item.total}`)
          .join(", ")}.`;

  return (
    <div className="mt-4">
      {items.length === 0 ? (
        <p className="rounded-lg border border-hairline bg-canvas px-4 py-6 text-center text-xs text-body-mid">
          Difficulty data appears once your local progress loads.
        </p>
      ) : (
        <>
          <div role="img" aria-label={label}>
            <div className="flex h-2.5 overflow-hidden rounded-full bg-canvas-soft">
              {items.map((item) => {
                const width =
                  solvedTotal > 0 ? (item.solved / solvedTotal) * 100 : 0;
                return (
                  <div
                    key={item.difficulty}
                    className={cn("h-full", DIFFICULTY_FILL[item.difficulty])}
                    style={{ width: `${width}%` }}
                  />
                );
              })}
            </div>
          </div>
          <ul className="mt-3 space-y-3">
            {items.map((item) => (
              <li
                key={item.difficulty}
                className="flex items-center justify-between gap-3 text-xs"
              >
                <span className="flex items-center gap-2 text-ink">
                  <span
                    aria-hidden
                    className={cn(
                      "h-2 w-2 rounded-[2px]",
                      DIFFICULTY_FILL[item.difficulty],
                    )}
                  />
                  {item.difficulty}
                </span>
                <span className="font-mono text-body-mid">
                  {item.solved}/{item.total} · {Math.round(item.percent)}%
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function TimeOfDayChart({ buckets }: { buckets: TimeOfDayBucket[] }) {
  const max = buckets.reduce((value, bucket) => Math.max(value, bucket.count), 0);
  const total = buckets.reduce((sum, bucket) => sum + bucket.count, 0);
  const label =
    buckets.length === 0
      ? "Time of day: no solves yet."
      : `Solves by local hour: ${buckets
          .map((bucket) => `${bucket.label} ${bucket.count}`)
          .join(", ")}.`;

  return (
    <div className="mt-4">
      {buckets.length === 0 ? (
        <p className="rounded-lg border border-hairline bg-canvas px-4 py-6 text-center text-xs text-body-mid">
          Time-of-day data appears once your local progress loads.
        </p>
      ) : (
        <>
          <div role="img" aria-label={label} className="flex h-28 items-end gap-2">
            {buckets.map((bucket) => {
              const height = max > 0 ? (bucket.count / max) * 100 : 0;
              return (
                <div
                  key={bucket.label}
                  className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5"
                >
                  <span className="font-mono text-[10px] text-body-mid">
                    {bucket.count}
                  </span>
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className={cn(
                        "w-full rounded-t",
                        bucket.count > 0 ? "bg-accent/70" : "bg-canvas-soft",
                      )}
                      style={{
                        height: bucket.count > 0 ? `${height}%` : "2px",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex gap-2">
            {buckets.map((bucket) => (
              <span
                key={bucket.label}
                className="min-w-0 flex-1 text-center text-[10px] text-body-mid"
              >
                {bucket.label}
              </span>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-body-mid">
            {total} solves timestamped by local hour.
          </p>
        </>
      )}
    </div>
  );
}

function RecordsPanel({ records }: { records: Records }) {
  const fastest = records.fastestFirstSolve;
  const rows = [
    {
      label: "Fastest first solve",
      value: fastest ? formatDuration(fastest.durationMs) : "—",
      detail: fastest?.title ?? null,
    },
    {
      label: "Longest daily streak",
      value: `${records.longestDailyStreak}d`,
      detail: null,
    },
    {
      label: "Most active day",
      value: records.mostActiveDay
        ? `${records.mostActiveDay.count} solves`
        : "—",
      detail: records.mostActiveDay?.date ?? null,
    },
    {
      label: "Hardest solved",
      value: `${records.hardestSolved} Hard`,
      detail: null,
    },
    {
      label: "First solved",
      value: formatDate(records.firstSolvedAt) ?? "—",
      detail: null,
    },
    {
      label: "Last solved",
      value: formatDate(records.lastSolvedAt) ?? "—",
      detail: null,
    },
  ];

  return (
    <dl className="mt-4 space-y-3">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-center justify-between gap-3 rounded-lg border border-hairline bg-canvas p-4"
        >
          <dt className="text-xs text-body-mid">{row.label}</dt>
          <dd className="min-w-0 text-right">
            <span className="font-mono text-sm text-ink">{row.value}</span>
            {row.detail && (
              <span className="block truncate text-[10px] text-body-mid">
                {row.detail}
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function MasteryGauge({ value }: { value: number }) {
  const size = 96;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-label="Estimated mastery"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      className="shrink-0"
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden
        className="block"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-canvas-soft"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped / 100)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="text-accent"
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="central"
          textAnchor="middle"
          fill="currentColor"
          className="fill-ink text-xl font-semibold"
        >
          {clamped}
        </text>
      </svg>
    </div>
  );
}

function MasteryCard({ mastery }: { mastery: MasteryEstimate }) {
  return (
    <div className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
      <h3 className="text-sm font-medium text-ink">Estimated mastery</h3>
      <p className="mt-1 text-xs text-body-mid">
        Weighted from coverage, difficulty depth, and recent activity.
      </p>
      <div className="mt-4 flex items-center gap-5">
        <MasteryGauge value={mastery.value} />
        <div className="min-w-0 flex-1 space-y-3">
          <Meter
            label="Coverage"
            percent={mastery.coverage}
            valueText={`${mastery.coverage}%`}
          />
          <Meter
            label="Depth (Hard)"
            percent={mastery.depth}
            valueText={`${mastery.depth}%`}
          />
          <Meter
            label="Recency (14d)"
            percent={mastery.recency}
            valueText={`${mastery.recency}%`}
          />
        </div>
      </div>
      <p className="mt-4 text-[10px] text-body-mid">
        {Math.round(MASTERY_WEIGHTS.coverage * 100)}% coverage ·{" "}
        {Math.round(MASTERY_WEIGHTS.depth * 100)}% depth ·{" "}
        {Math.round(MASTERY_WEIGHTS.recency * 100)}% recency
      </p>
    </div>
  );
}

function PracticeMix({ overview }: { overview: Overview }) {
  const items = [
    {
      label: "Labs passed",
      value: overview.labsPassed,
      total: LABS.length as number | null,
    },
    {
      label: "Research beaten",
      value: overview.researchBeaten,
      total: RESEARCH_CHALLENGES.length as number | null,
    },
    {
      label: "Concepts mastered",
      value: overview.conceptsMastered,
      total: CONCEPTS.length as number | null,
    },
    { label: "Contests played", value: overview.contestsPlayed, total: null },
  ];

  return (
    <div className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
      <h3 className="text-sm font-medium text-ink">Practice mix</h3>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li
            key={item.label}
            className="flex items-center justify-between gap-3 text-xs"
          >
            <span className="text-body-mid">{item.label}</span>
            <span className="font-mono text-sm text-ink">
              {item.value}
              {item.total !== null && (
                <span className="text-xs text-body-mid">/{item.total}</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─────────────────────────────── component ──────────────────────────────── */

export function StatsDashboard() {
  const stats = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const {
    overview,
    categories,
    difficulty,
    trend,
    timeOfDay,
    records,
    mastery,
  } = stats;

  return (
    <section
      id="stats"
      className="mx-auto w-full max-w-6xl scroll-mt-16 px-4 py-8 sm:px-6 sm:py-12"
    >
      <div className="mb-6">
        <h2 className="text-sm font-medium text-body-mid">
          {overview.solved}/{overview.total} solved ·{" "}
          {formatPercent(overview.accuracy)} accuracy ·{" "}
          {overview.currentStreak}d streak · mastery {mastery.value}
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile
          label="Solved"
          value={`${overview.solved}`}
          detail={`of ${overview.total} problems`}
        />
        <StatTile
          label="Accuracy"
          value={formatPercent(overview.accuracy)}
          detail={`${overview.attempted} attempted`}
        />
        <StatTile
          label="Solved today"
          value={`${overview.solvedToday}`}
          detail={`${overview.solvedThisWeek} this week`}
        />
        <StreakTile
          current={overview.currentStreak}
          longest={overview.longestStreak}
          days={trend}
        />
        <StatTile
          label="Level"
          value={`${overview.level}`}
          detail={`${overview.xp} XP · ${overview.levelTitle}`}
        />
        <StatTile
          label="Mastery"
          value={`${mastery.value}`}
          detail="estimated 0–100"
        />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5 lg:col-span-2">
          <h3 className="text-sm font-medium text-ink">Activity trend</h3>
          <p className="mt-1 text-xs text-body-mid">
            Problems solved per day, last {TREND_DAYS} days.
          </p>
          <ActivityChart trend={trend} />
        </div>
        <MasteryCard mastery={mastery} />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5 lg:col-span-2">
          <h3 className="text-sm font-medium text-ink">Category coverage</h3>
          <p className="mt-1 text-xs text-body-mid">
            Top 8 categories by percent solved.
          </p>
          <CategoryBars categories={categories} />
        </div>
        <div className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
          <h3 className="text-sm font-medium text-ink">Personal records</h3>
          <RecordsPanel records={records} />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
          <h3 className="text-sm font-medium text-ink">Difficulty split</h3>
          <DifficultyBar items={difficulty} />
        </div>
        <div className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
          <h3 className="text-sm font-medium text-ink">Time of day</h3>
          <TimeOfDayChart buckets={timeOfDay} />
        </div>
        <PracticeMix overview={overview} />
      </div>
    </section>
  );
}
