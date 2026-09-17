export const LGS_VERSION = 2;

export interface LgsParams {
  decay: number;
  w8: number;
  w9: number;
  w10: number;
  w11: number;
  w12: number;
  w13: number;
  w14: number;
  fMax: number;
  wReset: number;
  wForget: number;
  eta: number;
  target: number;
  effortCap: number;
  capInterval: number;
  hintDebit: readonly [number, number, number, number];
}

export const LGS_DEFAULTS: LgsParams = {
  decay: 0.1542,
  w8: 1.8722,
  w9: 0.1666,
  w10: 0.796,
  w11: 1.4835,
  w12: 0.0614,
  w13: 0.2629,
  w14: 1.6483,
  fMax: 12,
  wReset: 0.5,
  wForget: 4,
  eta: 0.15,
  target: 0.9,
  effortCap: 0.6,
  capInterval: 7,
  hintDebit: [0, 0.5, 1.5, 4.0],
};

export interface LgsSignal {
  passed: boolean;
  failedRuns: number;
  hintTier: number;
  resetBeforePass: boolean;
}

export interface LgsLegacyFields {
  ease: number;
  interval: number;
  due: string;
  reps: number;
  lapses: number;
  lastGrade: 0 | 3 | 4 | 5 | null;
  lastReviewedAt: string | null;
}

export interface LgsState extends LgsLegacyFields {
  v: 2;
  S: number;
  D: number;
  effort: number;
}

const S_MIN = 0.1;
const S_MAX = 36500;
const D_MIN = 1;
const D_MAX = 10;
const EFFORT_MIN = 0;
const EFFORT_MAX = 1;
const INTERVAL_MIN = 1;
const INTERVAL_MAX = 36500;
const EASE_MIN = 1.3;
const EASE_MAX = 2.8;
const EASE_DEFAULT = 2.5;
const DAY_MS = 86_400_000;
const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;
const DATE_PARTS = /^(\d{4})-(\d{2})-(\d{2})$/;

function clamp(a: number, b: number, x: number): number {
  return Math.min(b, Math.max(a, x));
}

function dayKey(date: Date): string {
  const valid = Number.isFinite(date.getTime()) ? date : new Date(0);
  const year = valid.getFullYear();
  const month = String(valid.getMonth() + 1).padStart(2, "0");
  const day = String(valid.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return dayKey(date);
}

/** A DATE_KEY that is also a real calendar date (rejects "2026-02-30"). */
function isRealDateKey(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const match = DATE_PARTS.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const probe = new Date(Date.UTC(year, month - 1, day));
  return (
    probe.getUTCFullYear() === year &&
    probe.getUTCMonth() === month - 1 &&
    probe.getUTCDate() === day
  );
}

function dayNumber(key: string): number | null {
  const match = DATE_PARTS.exec(key);
  if (!match) return null;
  const value = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isFinite(value) ? Math.round(value / DAY_MS) : null;
}

function keyDiff(from: string, to: string): number | null {
  const a = dayNumber(from);
  const b = dayNumber(to);
  if (a === null || b === null) return null;
  return b - a;
}

function factorFor(p: LgsParams): number {
  return Math.pow(0.9, -1 / p.decay) - 1;
}

function effortFromGrade(grade: LgsLegacyFields["lastGrade"]): number {
  if (grade === 0) return 0.9;
  if (grade === 3) return 0.6;
  if (grade === 4) return 0.3;
  if (grade === 5) return 0.1;
  return 0;
}

function deriveFields(state: LgsLegacyFields): {
  S: number;
  D: number;
  effort: number;
} {
  const interval = Number.isFinite(state.interval) ? Math.max(0, state.interval) : 0;
  const ease = Number.isFinite(state.ease) ? state.ease : EASE_DEFAULT;
  const reps = Number.isFinite(state.reps) ? Math.max(0, state.reps) : 0;
  return {
    S: reps > 0 ? clamp(S_MIN, S_MAX, interval) : 1,
    D: clamp(D_MIN, D_MAX, 5 + (2.5 - ease) * 2),
    effort: effortFromGrade(state.lastGrade),
  };
}

function validStored(
  record: Record<string, unknown>,
  key: "S" | "D" | "effort",
  lo: number,
  hi: number,
): number | null {
  if (record.v !== LGS_VERSION) return null;
  const value = record[key];
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  if (value < lo || value > hi) return null;
  return value;
}

export function lgsRetrievabilityAt(
  t: number,
  S: number,
  p: LgsParams = LGS_DEFAULTS,
): number {
  const days = Number.isFinite(t) ? Math.max(0, t) : 0;
  if (!Number.isFinite(S) || S <= 0) return days === 0 ? 1 : 0;
  return Math.pow(1 + (factorFor(p) * days) / S, -p.decay);
}

export function lgsIntervalFor(
  S: number,
  target: number = LGS_DEFAULTS.target,
  p: LgsParams = LGS_DEFAULTS,
): number {
  if (!Number.isFinite(S) || S <= 0) return 0;
  if (!Number.isFinite(target) || target <= 0) return 0;
  return (S / factorFor(p)) * (Math.pow(target, -1 / p.decay) - 1);
}

export function ladderPhi(
  sig: Pick<LgsSignal, "failedRuns" | "hintTier" | "resetBeforePass">,
  p: LgsParams = LGS_DEFAULTS,
): number {
  const runs = Number.isFinite(sig.failedRuns) ? Math.max(0, sig.failedRuns) : 0;
  const tierRaw = Number.isFinite(sig.hintTier) ? Math.floor(sig.hintTier) : 0;
  const tier = clamp(0, 3, tierRaw);
  const reset = sig.resetBeforePass === true ? p.wReset : 0;
  return Math.min(p.fMax, runs + reset) + p.hintDebit[tier];
}

export function lgsResolveFields(state: LgsLegacyFields): {
  S: number;
  D: number;
  effort: number;
} {
  const record = state as unknown as Record<string, unknown>;
  const derived = deriveFields(state);
  return {
    S: validStored(record, "S", S_MIN, S_MAX) ?? derived.S,
    D: validStored(record, "D", D_MIN, D_MAX) ?? derived.D,
    effort: validStored(record, "effort", EFFORT_MIN, EFFORT_MAX) ?? derived.effort,
  };
}

export function lgsElapsedDays(prev: LgsLegacyFields, todayKey: string): number {
  if (typeof prev.lastReviewedAt === "string") {
    const reviewedAt = new Date(prev.lastReviewedAt);
    if (Number.isFinite(reviewedAt.getTime())) {
      const diff = keyDiff(dayKey(reviewedAt), todayKey);
      if (diff !== null) return Math.max(0, diff);
    }
  }
  const interval = Number.isFinite(prev.interval)
    ? Math.max(0, Math.round(prev.interval))
    : 0;
  if (typeof prev.due !== "string") return interval;
  const overdue = keyDiff(prev.due, todayKey);
  return interval + Math.max(0, overdue ?? 0);
}

export function lgsRetrievability(
  state: LgsLegacyFields,
  now: Date,
  p: LgsParams = LGS_DEFAULTS,
): number {
  const { S } = lgsResolveFields(state);
  return lgsRetrievabilityAt(lgsElapsedDays(state, dayKey(now)), S, p);
}

export function gradeLadderReview(
  prev: LgsLegacyFields | undefined,
  sig: LgsSignal,
  now: Date,
  p: LgsParams = LGS_DEFAULTS,
): LgsState {
  const today = dayKey(now);
  const base: LgsLegacyFields = prev ?? {
    ease: EASE_DEFAULT,
    interval: 1,
    due: addDays(today, 1),
    reps: 0,
    lapses: 0,
    lastGrade: null,
    lastReviewedAt: null,
  };
  const { S, D, effort } = lgsResolveFields(base);
  const rPred = lgsRetrievabilityAt(lgsElapsedDays(base, today), S, p);

  const passed = sig.passed === true;
  const failedRuns = Number.isFinite(sig.failedRuns)
    ? Math.max(0, sig.failedRuns)
    : 0;
  const tierRaw = Number.isFinite(sig.hintTier) ? Math.floor(sig.hintTier) : 0;
  const tier = clamp(0, 3, tierRaw);
  const phi = ladderPhi(
    { failedRuns, hintTier: tier, resetBeforePass: sig.resetBeforePass === true },
    p,
  );

  let rawS: number;
  if (passed) {
    const growth =
      1 +
      Math.exp(p.w8) *
        (11 - D) *
        Math.pow(S, -p.w9) *
        (Math.exp(p.w10 * (1 - rPred)) - 1);
    rawS = S * growth;
  } else {
    rawS =
      p.w11 *
      Math.pow(D, -p.w12) *
      (Math.pow(S + 1, p.w13) - 1) *
      Math.exp(p.w14 * (1 - rPred));
  }
  const nextS = clamp(S_MIN, S_MAX, rawS);

  const dObs = passed ? 3 + (7 * phi) / (phi + 6) : 10;
  const nextD = clamp(D_MIN, D_MAX, D + p.eta * (dObs - D));

  const increment = clamp(0, 1, (phi + (passed ? 0 : p.wForget)) / 8);
  const nextEffort = 0.5 * effort + 0.5 * increment;

  let interval = clamp(
    INTERVAL_MIN,
    INTERVAL_MAX,
    Math.round(lgsIntervalFor(nextS, p.target, p)),
  );
  if (nextEffort >= p.effortCap) interval = Math.min(interval, p.capInterval);

  const ease = Number.isFinite(base.ease) ? base.ease : EASE_DEFAULT;
  const reps = Number.isFinite(base.reps) ? Math.max(0, Math.round(base.reps)) : 0;
  const lapses = Number.isFinite(base.lapses)
    ? Math.max(0, Math.round(base.lapses))
    : 0;

  return {
    ease,
    interval,
    due: addDays(today, interval),
    reps: passed ? reps + 1 : 0,
    lapses: passed ? lapses : lapses + 1,
    lastGrade: passed
      ? sig.resetBeforePass === true
        ? 3
        : failedRuns > 0 || tier > 0
          ? 4
          : 5
      : 0,
    lastReviewedAt: now.toISOString(),
    v: LGS_VERSION,
    S: nextS,
    D: nextD,
    effort: nextEffort,
  };
}

export function migrateReviewState(
  value: unknown,
  todayKey: string,
): LgsState | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  const record = value as Record<string, unknown>;
  const fallbackDay = isRealDateKey(todayKey) ? todayKey : "1970-01-01";
  const legacy: LgsLegacyFields = {
    ease:
      typeof record.ease === "number" && Number.isFinite(record.ease)
        ? Math.round(clamp(EASE_MIN, EASE_MAX, record.ease) * 1000) / 1000
        : EASE_DEFAULT,
    interval:
      typeof record.interval === "number" && Number.isFinite(record.interval)
        ? Math.max(0, Math.round(record.interval))
        : 0,
    due: isRealDateKey(record.due) ? record.due : fallbackDay,
    reps:
      typeof record.reps === "number" && Number.isFinite(record.reps)
        ? Math.max(0, Math.round(record.reps))
        : 0,
    lapses:
      typeof record.lapses === "number" && Number.isFinite(record.lapses)
        ? Math.max(0, Math.round(record.lapses))
        : 0,
    lastGrade:
      record.lastGrade === 0 ||
      record.lastGrade === 3 ||
      record.lastGrade === 4 ||
      record.lastGrade === 5
        ? record.lastGrade
        : null,
    lastReviewedAt:
      typeof record.lastReviewedAt === "string" &&
      !Number.isNaN(Date.parse(record.lastReviewedAt))
        ? record.lastReviewedAt
        : null,
  };
  const { S, D, effort } = lgsResolveFields({
    ...legacy,
    v: record.v,
    S: record.S,
    D: record.D,
    effort: record.effort,
  } as LgsLegacyFields);
  return {
    ease: legacy.ease,
    interval: legacy.interval,
    due: legacy.due,
    reps: legacy.reps,
    lapses: legacy.lapses,
    lastGrade: legacy.lastGrade,
    lastReviewedAt: legacy.lastReviewedAt,
    v: LGS_VERSION,
    S,
    D,
    effort,
  };
}
