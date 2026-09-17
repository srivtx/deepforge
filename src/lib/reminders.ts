/**
 * State-aware reminders — local-only phase.
 *
 * Everything lives on this device in `deepforge:reminders:v1`: no account, no
 * push server, no network. Reminders are evaluated while the app is open and
 * surfaced through the Notifications API + service worker when permission
 * exists, or as in-app nudges otherwise.
 *
 * Restraint is a feature, not polish:
 * - opt-in: nothing fires until the user enables reminders;
 * - max one reminder per category per calendar day;
 * - nothing during the first hour of a session;
 * - nothing outside the user's quiet-hours window;
 * - cadence backs off (48 h per category) after three unanswered sends.
 *
 * The evaluator is a pure function over explicit signals so every cap is
 * unit-testable with a fake clock; the browser glue that reads the stores and
 * shows notifications is kept thin around it.
 */

const STORAGE_KEY = "deepforge:reminders:v1";

export const REMINDERS_CHANGE_EVENT = "deepforge:reminders-change";
/** In-app nudge channel; detail is a `Reminder`. */
export const REMINDER_EVENT = "deepforge:reminder";

export const REMINDER_CHECK_INTERVAL_MS = 15 * 60 * 1000;
/** No reminder may fire within the first hour of a session. */
export const SESSION_WARMUP_MS = 60 * 60 * 1000;
export const DIGEST_INTERVAL_DAYS = 7;
export const IGNORE_BACKOFF_THRESHOLD = 3;
export const IGNORE_BACKOFF_MS = 48 * 60 * 60 * 1000;
export const DEFAULT_WINDOW_START_HOUR = 9;
export const DEFAULT_WINDOW_END_HOUR = 21;
export const DEFAULT_USUAL_HOUR = 19;

export const REMINDER_CATEGORIES = ["streak", "review", "digest"] as const;

export type ReminderCategory = (typeof REMINDER_CATEGORIES)[number];

/** Learner momentum, derived from existing solve timestamps. */
export type LearnerState = "new" | "active" | "wobbling" | "atRisk" | "dormant";

export type NotificationSupport =
  | "unsupported"
  | "granted"
  | "default"
  | "denied";

export interface ReminderPrefs {
  enabled: boolean;
  streakAtRisk: boolean;
  reviewDue: boolean;
  weeklyDigest: boolean;
  /** Inclusive local hour the reminder window opens. */
  windowStartHour: number;
  /** Exclusive local hour the reminder window closes; equal = all day. */
  windowEndHour: number;
  /** Calendar day key ("YYYY-MM-DD") of the last send per category. */
  lastSent: Record<ReminderCategory, string | null>;
  /** ISO timestamp of the last send per category. */
  lastSentAt: Record<ReminderCategory, string | null>;
  /** Consecutive sends without an intervening solve. */
  ignoredStreak: number;
  /** ISO timestamp; while in the future, nothing fires. */
  snoozedUntil: string | null;
}

export interface Reminder {
  category: ReminderCategory;
  title: string;
  body: string;
  href: string;
}

export interface ReminderSignals {
  now: Date;
  prefs: ReminderPrefs;
  sessionStartedAt: Date | null;
  learnerState: LearnerState;
  solvedToday: boolean;
  /** Local time is at or past the user's usual solve hour. */
  pastUsualHour: boolean;
  /** Solve streak: any day with a solve counts (canonical for shield copy). */
  streak: number;
  shields: number;
  coveredYesterday: boolean;
  reviewDueCount: number;
  /** Where the review nudge should land: code reviews or pen & paper. */
  reviewHref: string;
  weekSolved: number;
}

export function defaultReminderPrefs(): ReminderPrefs {
  return {
    enabled: false,
    streakAtRisk: true,
    reviewDue: true,
    weeklyDigest: true,
    windowStartHour: DEFAULT_WINDOW_START_HOUR,
    windowEndHour: DEFAULT_WINDOW_END_HOUR,
    lastSent: { streak: null, review: null, digest: null },
    lastSentAt: { streak: null, review: null, digest: null },
    ignoredStreak: 0,
    snoozedUntil: null,
  };
}

/** Local calendar date as "YYYY-MM-DD". Kept local so this module stays light. */
export function localDateKey(d = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Whole calendar days from `from` to `to` (UTC-normalized, DST-proof). */
export function daysBetweenKeys(from: string, to: string): number {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  if ([fy, fm, fd, ty, tm, td].some((value) => !Number.isFinite(value))) {
    return 0;
  }
  return Math.round(
    (Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86_400_000,
  );
}

/* ───────────────────────────── persistence ────────────────────────────── */

function dateKeyOrNull(value: unknown): string | null {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? value
    : null;
}

function isoOrNull(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return Number.isFinite(Date.parse(value)) ? value : null;
}

function sanitizePrefs(record: Record<string, unknown>): ReminderPrefs {
  const base = defaultReminderPrefs();
  const bool = (key: string, fallback: boolean): boolean =>
    typeof record[key] === "boolean" ? (record[key] as boolean) : fallback;
  const hour = (key: string, fallback: number): number => {
    const value = record[key];
    if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
    return Math.max(0, Math.min(23, Math.floor(value)));
  };

  const sent =
    record.lastSent &&
    typeof record.lastSent === "object" &&
    !Array.isArray(record.lastSent)
      ? (record.lastSent as Record<string, unknown>)
      : {};
  const sentAt =
    record.lastSentAt &&
    typeof record.lastSentAt === "object" &&
    !Array.isArray(record.lastSentAt)
      ? (record.lastSentAt as Record<string, unknown>)
      : {};

  return {
    enabled: bool("enabled", base.enabled),
    streakAtRisk: bool("streakAtRisk", base.streakAtRisk),
    reviewDue: bool("reviewDue", base.reviewDue),
    weeklyDigest: bool("weeklyDigest", base.weeklyDigest),
    windowStartHour: hour("windowStartHour", base.windowStartHour),
    windowEndHour: hour("windowEndHour", base.windowEndHour),
    lastSent: {
      streak: dateKeyOrNull(sent.streak),
      review: dateKeyOrNull(sent.review),
      digest: dateKeyOrNull(sent.digest),
    },
    lastSentAt: {
      streak: isoOrNull(sentAt.streak),
      review: isoOrNull(sentAt.review),
      digest: isoOrNull(sentAt.digest),
    },
    ignoredStreak: (() => {
      const value = record.ignoredStreak;
      if (typeof value !== "number" || !Number.isFinite(value)) return 0;
      return Math.max(0, Math.floor(value));
    })(),
    snoozedUntil: isoOrNull(record.snoozedUntil),
  };
}

export function parseReminderPrefs(raw: string | null): ReminderPrefs {
  if (!raw) return defaultReminderPrefs();
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return defaultReminderPrefs();
    }
    return sanitizePrefs(parsed as Record<string, unknown>);
  } catch {
    return defaultReminderPrefs();
  }
}

function readRaw(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writePrefs(prefs: ReminderPrefs): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    if (typeof CustomEvent === "function") {
      window.dispatchEvent(new CustomEvent(REMINDERS_CHANGE_EVENT));
    }
  } catch {
    /* storage unavailable — reminders simply stay at their defaults */
  }
}

export function getReminderPrefs(): ReminderPrefs {
  return parseReminderPrefs(readRaw());
}

/** Merge a patch into the stored prefs (sanitized on the way out). */
export function setReminderPrefs(
  patch: Partial<ReminderPrefs>,
): ReminderPrefs {
  const merged = sanitizePrefs({
    ...getReminderPrefs(),
    ...patch,
  } as Record<string, unknown>);
  writePrefs(merged);
  return merged;
}

/** Push every category 24 h out (or as long as asked). */
export function snoozeReminders(
  hours = 24,
  now = new Date(),
): ReminderPrefs {
  return setReminderPrefs({
    snoozedUntil: new Date(now.getTime() + hours * 3_600_000).toISOString(),
  });
}

/**
 * Record a send: stamps the category's day + timestamp and, when the user has
 * not solved yet, extends the unanswered streak that drives backoff.
 */
export function recordReminderSent(
  category: ReminderCategory,
  now = new Date(),
  solvedToday = false,
): ReminderPrefs {
  const prefs = getReminderPrefs();
  const next: ReminderPrefs = {
    ...prefs,
    lastSent: { ...prefs.lastSent, [category]: localDateKey(now) },
    lastSentAt: { ...prefs.lastSentAt, [category]: now.toISOString() },
    ignoredStreak: solvedToday ? 0 : prefs.ignoredStreak + 1,
  };
  writePrefs(next);
  return next;
}

/** A solve happened: clear the unanswered streak and restore normal cadence. */
export function recordEngagement(): ReminderPrefs {
  const prefs = getReminderPrefs();
  if (prefs.ignoredStreak === 0) return prefs;
  const next: ReminderPrefs = { ...prefs, ignoredStreak: 0 };
  writePrefs(next);
  return next;
}

/* ────────────────────────────── evaluation ────────────────────────────── */

/** True when the local hour falls inside [start, end), wrapping midnight. */
export function isWithinReminderWindow(
  hour: number,
  start: number,
  end: number,
): boolean {
  if (start === end) return true;
  if (start < end) return hour >= start && hour < end;
  return hour >= start || hour < end;
}

export function sessionIsPastWarmup(
  sessionStartedAt: Date | null,
  now: Date,
  warmupMs = SESSION_WARMUP_MS,
): boolean {
  if (!sessionStartedAt) return false;
  return now.getTime() - sessionStartedAt.getTime() >= warmupMs;
}

/** Momentum state from the last solve day (calendar-day math, DST-proof). */
export function deriveLearnerState(input: {
  todayKey: string;
  lastSolveKey: string | null;
}): LearnerState {
  if (!input.lastSolveKey) return "new";
  const days = daysBetweenKeys(input.lastSolveKey, input.todayKey);
  if (days <= 0) return "active";
  if (days === 1) return "wobbling";
  if (days <= 6) return "atRisk";
  return "dormant";
}

function categoryEnabled(
  prefs: ReminderPrefs,
  category: ReminderCategory,
): boolean {
  if (category === "streak") return prefs.streakAtRisk;
  if (category === "review") return prefs.reviewDue;
  return prefs.weeklyDigest;
}

function inBackoff(
  prefs: ReminderPrefs,
  category: ReminderCategory,
  now: Date,
): boolean {
  if (prefs.ignoredStreak < IGNORE_BACKOFF_THRESHOLD) return false;
  const lastAt = prefs.lastSentAt[category];
  if (!lastAt) return false;
  const lastMs = Date.parse(lastAt);
  if (!Number.isFinite(lastMs)) return false;
  return now.getTime() - lastMs < IGNORE_BACKOFF_MS;
}

function buildStreakReminder(signals: ReminderSignals): Reminder | null {
  if (signals.solvedToday) return null;
  const hasStreak = signals.streak > 1;
  const streakLabel = hasStreak ? `Your ${signals.streak}-day ` : "";

  if (signals.learnerState === "wobbling") {
    if (!signals.pastUsualHour) return null;
    if (signals.coveredYesterday) {
      return {
        category: "streak",
        title: "A shield covered yesterday",
        body: "Solve any problem today to keep the solve streak moving.",
        href: "/daily",
      };
    }
    if (signals.shields > 0) {
      return {
        category: "streak",
        title: hasStreak
          ? `${streakLabel}solve streak is on the line`
          : "Today's challenge is ready",
        body: "A shield can cover one missed day. Solve any problem today to keep it going.",
        href: "/daily",
      };
    }
    return {
      category: "streak",
      title: hasStreak
        ? `${streakLabel}solve streak is at risk`
        : "Keep the momentum going",
      body: "Solve any problem today to keep it alive.",
      href: "/daily",
    };
  }

  if (
    signals.learnerState === "atRisk" ||
    signals.learnerState === "dormant"
  ) {
    if (signals.coveredYesterday) {
      return {
        category: "streak",
        title: "Back on track?",
        body: "A shield covered yesterday. Solve any problem today to keep the run going.",
        href: "/daily",
      };
    }
    if (signals.shields > 0) {
      return {
        category: "streak",
        title: "Your shield is ready",
        body: "Come back with one problem today and the solve streak stays protected.",
        href: "/daily",
      };
    }
    return {
      category: "streak",
      title: "Start a new streak today",
      body: "One solved problem is all it takes to begin again.",
      href: "/daily",
    };
  }

  return null;
}

function buildReviewReminder(signals: ReminderSignals): Reminder | null {
  if (signals.reviewDueCount <= 0) return null;
  const count = signals.reviewDueCount;
  return {
    category: "review",
    title: `${count} review${count === 1 ? "" : "s"} due`,
    body: "A short review keeps solved problems fresh — a few minutes is enough.",
    href: signals.reviewHref,
  };
}

function buildDigestReminder(signals: ReminderSignals): Reminder | null {
  if (signals.weekSolved <= 0) return null;
  const last = signals.prefs.lastSent.digest;
  if (
    last &&
    daysBetweenKeys(last, localDateKey(signals.now)) < DIGEST_INTERVAL_DAYS
  ) {
    return null;
  }
  const solved = `${signals.weekSolved} problem${
    signals.weekSolved === 1 ? "" : "s"
  } solved in the last 7 days`;
  const streak =
    signals.streak > 0 ? ` · ${signals.streak}-day solve streak` : "";
  return {
    category: "digest",
    title: "Your week on DeepForge",
    body: `${solved}${streak}.`,
    href: "/stats",
  };
}

/**
 * Pure cap evaluation: returns the categories that may fire right now, in
 * priority order (streak → review → digest). All timing rules live here.
 */
export function evaluateReminders(signals: ReminderSignals): Reminder[] {
  const { now, prefs } = signals;
  if (!prefs.enabled) return [];
  if (prefs.snoozedUntil && Date.parse(prefs.snoozedUntil) > now.getTime()) {
    return [];
  }
  if (
    !isWithinReminderWindow(
      now.getHours(),
      prefs.windowStartHour,
      prefs.windowEndHour,
    )
  ) {
    return [];
  }
  if (!sessionIsPastWarmup(signals.sessionStartedAt, now)) return [];

  const todayKey = localDateKey(now);
  const due: Reminder[] = [];
  for (const category of REMINDER_CATEGORIES) {
    if (!categoryEnabled(prefs, category)) continue;
    if (prefs.lastSent[category] === todayKey) continue;
    if (inBackoff(prefs, category, now)) continue;
    let reminder: Reminder | null = null;
    if (category === "streak") reminder = buildStreakReminder(signals);
    else if (category === "review") reminder = buildReviewReminder(signals);
    else reminder = buildDigestReminder(signals);
    if (reminder) due.push(reminder);
  }
  return due;
}

/** At most one surface per check: the highest-priority due category. */
export function pickPrimaryReminder(reminders: Reminder[]): Reminder | null {
  return reminders.length > 0 ? reminders[0] : null;
}

/* ─────────────────────────────── session ──────────────────────────────── */

let sessionStartedAt: Date | null = null;

/** Start the current session clock; the warmup hour is measured from here. */
export function startReminderSession(now = new Date()): void {
  if (sessionStartedAt === null) sessionStartedAt = now;
}

export function getReminderSessionStart(): Date | null {
  return sessionStartedAt;
}

/** Test seam: forget the in-memory session start. */
export function resetReminderSession(): void {
  sessionStartedAt = null;
}

/* ──────────────────────────────── signals ─────────────────────────────── */

function medianHour(hours: number[]): number | null {
  if (hours.length === 0) return null;
  const sorted = [...hours].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

/**
 * Read the canonical stores (lazily imported so the root layout bundle stays
 * lean) and turn them into evaluator inputs. Runs the F3 auto-cover first so
 * "covered yesterday" is visible to the streak reminder.
 */
export async function collectReminderSignals(
  now = new Date(),
): Promise<ReminderSignals> {
  const prefs = getReminderPrefs();
  const [
    {
      getDailyState,
      applyShield,
      getDailyShields,
      getDailyShieldUsedDates,
      getSolveStreak,
    },
    { getProgress },
  ] = await Promise.all([import("@/lib/daily"), import("@/lib/progress")]);

  applyShield(now);
  const daily = getDailyState();
  const progress = getProgress();

  const todayKey = localDateKey(now);
  const yesterdayKey = localDateKey(
    new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
  );
  const fourteenDaysAgo = now.getTime() - 14 * 86_400_000;

  let lastSolveKey: string | null = null;
  let weekSolved = 0;
  const recentHours: number[] = [];
  for (const entry of Object.values(progress)) {
    if (!entry?.solved || !entry.solvedAt) continue;
    const at = new Date(entry.solvedAt);
    if (Number.isNaN(at.getTime())) continue;
    const key = localDateKey(at);
    if (lastSolveKey === null || key > lastSolveKey) lastSolveKey = key;
    const age = daysBetweenKeys(key, todayKey);
    if (age >= 0 && age < 7) weekSolved += 1;
    if (at.getTime() >= fourteenDaysAgo) recentHours.push(at.getHours());
  }
  for (const key of daily.solvedDates) {
    if (lastSolveKey === null || key > lastSolveKey) lastSolveKey = key;
  }

  const solvedToday =
    lastSolveKey === todayKey || daily.solvedDates.includes(todayKey);
  const usualHour = medianHour(recentHours) ?? DEFAULT_USUAL_HOUR;
  const usedDates = getDailyShieldUsedDates(daily);

  let reviewDueCount = 0;
  let reviewHref = "/math";
  if (prefs.enabled && prefs.reviewDue) {
    // Code-problem reviews (the primary queue) land on Today.
    try {
      const { getReviewBucketCounts, getReviewMap } = await import(
        "@/lib/reviewQueue"
      );
      const counts = getReviewBucketCounts(getReviewMap(now), now);
      const codeDue = counts.due + counts.learning;
      if (codeDue > 0) {
        reviewDueCount += codeDue;
        reviewHref = "/today";
      }
    } catch {
      /* queue not available — fall through to pen & paper */
    }
    // Pen & paper concepts the learner has actually started.
    try {
      const { getConceptStates, getDueConcepts } = await import(
        "@/lib/concepts"
      );
      // The scheduler treats every prerequisite-free concept as due on day
      // one, so only count concepts with a real state; brand-new users are
      // never nagged.
      const states = getConceptStates(now);
      const conceptDue = getDueConcepts(now).filter(
        (concept) => states[concept.id] !== undefined,
      ).length;
      reviewDueCount += conceptDue;
    } catch {
      /* concepts unavailable */
    }
  }

  return {
    now,
    prefs,
    sessionStartedAt,
    learnerState: deriveLearnerState({ todayKey, lastSolveKey }),
    solvedToday,
    pastUsualHour: now.getHours() >= usualHour,
    streak: getSolveStreak(progress, now),
    shields: getDailyShields(daily),
    coveredYesterday: usedDates.includes(yesterdayKey),
    reviewDueCount,
    reviewHref,
    weekSolved,
  };
}

export async function getDueReminders(now = new Date()): Promise<Reminder[]> {
  return evaluateReminders(await collectReminderSignals(now));
}

/* ──────────────────────────────── delivery ────────────────────────────── */

export type ReminderChannel = "system" | "in-app";

export interface DispatchedReminder {
  reminder: Reminder;
  channel: ReminderChannel;
}

export function getNotificationSupport(): NotificationSupport {
  if (typeof Notification === "undefined") return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationSupport> {
  if (typeof Notification === "undefined") return "unsupported";
  if (Notification.permission !== "default") return Notification.permission;
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      () => {
        clearTimeout(timer);
        resolve(null);
      },
    );
  });
}

async function showSystemReminder(reminder: Reminder): Promise<boolean> {
  if (
    typeof navigator === "undefined" ||
    !("serviceWorker" in navigator) ||
    typeof Notification === "undefined" ||
    Notification.permission !== "granted"
  ) {
    return false;
  }
  try {
    const registration = await withTimeout(navigator.serviceWorker.ready, 1500);
    if (!registration) return false;
    await registration.showNotification(reminder.title, {
      body: reminder.body,
      tag: `deepforge-${reminder.category}`,
      data: { url: reminder.href },
      icon: "/icons/icon.svg",
    });
    return true;
  } catch {
    return false;
  }
}

function dispatchInAppReminder(reminder: Reminder): void {
  if (typeof window === "undefined") return;
  try {
    if (typeof CustomEvent !== "function") return;
    window.dispatchEvent(
      new CustomEvent<Reminder>(REMINDER_EVENT, { detail: reminder }),
    );
  } catch {
    /* best effort */
  }
}

/**
 * Evaluate and surface at most one reminder. Prefers a system notification
 * via the service worker and degrades to the in-app channel. Sends are
 * recorded before display so a failing notification can never loop.
 */
export async function dispatchReminders(
  now = new Date(),
): Promise<DispatchedReminder | null> {
  if (typeof window === "undefined") return null;
  const signals = await collectReminderSignals(now);
  const reminder = pickPrimaryReminder(evaluateReminders(signals));
  if (!reminder) return null;

  const channel: ReminderChannel = (await showSystemReminder(reminder))
    ? "system"
    : "in-app";
  recordReminderSent(reminder.category, now, signals.solvedToday);
  if (channel === "in-app") dispatchInAppReminder(reminder);
  return { reminder, channel };
}
