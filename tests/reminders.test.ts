import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  DEFAULT_USUAL_HOUR,
  DEFAULT_WINDOW_END_HOUR,
  DEFAULT_WINDOW_START_HOUR,
  defaultReminderPrefs,
  deriveLearnerState,
  dispatchReminders,
  daysBetweenKeys,
  evaluateReminders,
  getReminderPrefs,
  isWithinReminderWindow,
  localDateKey,
  parseReminderPrefs,
  recordEngagement,
  recordReminderSent,
  REMINDERS_CHANGE_EVENT,
  REMINDER_EVENT,
  resetReminderSession,
  sessionIsPastWarmup,
  setReminderPrefs,
  snoozeReminders,
  startReminderSession,
  type Reminder,
  type ReminderPrefs,
  type ReminderSignals,
} from "@/lib/reminders";

function createStorageStub(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? (store.get(key) as string) : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
  };
}

interface WindowStub {
  localStorage: Storage;
  events: Event[];
  addEventListener: (type: string, cb: (event: Event) => void) => void;
  removeEventListener: (type: string, cb: (event: Event) => void) => void;
  dispatchEvent: (event: Event) => boolean;
}

function createWindowStub(): WindowStub {
  const listeners = new Map<string, Set<(event: Event) => void>>();
  const events: Event[] = [];
  return {
    localStorage: createStorageStub(),
    events,
    addEventListener(type, cb) {
      const set = listeners.get(type) ?? new Set();
      set.add(cb);
      listeners.set(type, set);
    },
    removeEventListener(type, cb) {
      listeners.get(type)?.delete(cb);
    },
    dispatchEvent(event) {
      events.push(event);
      for (const cb of listeners.get(event.type) ?? []) cb(event);
      return true;
    },
  };
}

const globalScope = globalThis as unknown as { window?: unknown };
let originalWindow: unknown;
let hadWindow = false;
let windowStub: WindowStub;

beforeEach(() => {
  hadWindow = "window" in globalScope;
  originalWindow = globalScope.window;
  windowStub = createWindowStub();
  globalScope.window = windowStub;
  resetReminderSession();
});

afterEach(() => {
  if (hadWindow) globalScope.window = originalWindow;
  else delete globalScope.window;
});

const NOW = new Date(2026, 4, 20, 20, 0, 0, 0);
const TODAY = localDateKey(NOW);

function storedPrefs(): ReminderPrefs {
  return parseReminderPrefs(
    windowStub.localStorage.getItem("deepforge:reminders:v1"),
  );
}

/** One progress solve per day for `count` consecutive days ending at `end`. */
function seedProgressDays(end: Date, count: number): void {
  const progress: Record<string, { solved: boolean; solvedAt: string }> = {};
  for (let i = 0; i < count; i += 1) {
    const day = new Date(end.getTime() - i * 86_400_000);
    day.setHours(12, 0, 0, 0);
    progress[`p-${i}`] = { solved: true, solvedAt: day.toISOString() };
  }
  windowStub.localStorage.setItem(
    "deepforge:progress:v1",
    JSON.stringify(progress),
  );
}

function basePrefs(overrides: Partial<ReminderPrefs> = {}): ReminderPrefs {
  const base = defaultReminderPrefs();
  return {
    ...base,
    enabled: true,
    lastSent: { ...base.lastSent },
    lastSentAt: { ...base.lastSentAt },
    ...overrides,
  };
}

function signals(overrides: Partial<ReminderSignals> = {}): ReminderSignals {
  const now = overrides.now ?? NOW;
  return {
    now,
    prefs: basePrefs(),
    sessionStartedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    learnerState: "active",
    solvedToday: true,
    pastUsualHour: true,
    streak: 0,
    shields: 0,
    coveredYesterday: false,
    reviewDueCount: 0,
    reviewHref: "/math",
    weekSolved: 0,
    ...overrides,
  };
}

describe("reminder prefs", () => {
  test("defaults are opt-out and inside a daytime window", () => {
    const prefs = defaultReminderPrefs();
    expect(prefs.enabled).toBe(false);
    expect(prefs.streakAtRisk).toBe(true);
    expect(prefs.reviewDue).toBe(true);
    expect(prefs.weeklyDigest).toBe(true);
    expect(prefs.windowStartHour).toBe(DEFAULT_WINDOW_START_HOUR);
    expect(prefs.windowEndHour).toBe(DEFAULT_WINDOW_END_HOUR);
    expect(prefs.lastSent.streak).toBeNull();
    expect(prefs.ignoredStreak).toBe(0);
    expect(prefs.snoozedUntil).toBeNull();
  });

  test("unreadable payloads fall back to defaults", () => {
    expect(parseReminderPrefs("{not json").enabled).toBe(false);
    expect(parseReminderPrefs("[]").enabled).toBe(false);
    expect(parseReminderPrefs(null).windowStartHour).toBe(
      DEFAULT_WINDOW_START_HOUR,
    );
  });

  test("malformed fields are sanitized", () => {
    const parsed = parseReminderPrefs(
      JSON.stringify({
        enabled: true,
        windowStartHour: -5,
        windowEndHour: 99.9,
        lastSent: { streak: "someday", review: "2026-05-20", digest: 7 },
        lastSentAt: { streak: "not-a-date", review: "2026-05-20T10:00:00Z" },
        ignoredStreak: -3,
        snoozedUntil: "tomorrow-ish",
      }),
    );
    expect(parsed.enabled).toBe(true);
    expect(parsed.windowStartHour).toBe(0);
    expect(parsed.windowEndHour).toBe(23);
    expect(parsed.lastSent.streak).toBeNull();
    expect(parsed.lastSent.review).toBe("2026-05-20");
    expect(parsed.lastSent.digest).toBeNull();
    expect(parsed.lastSentAt.streak).toBeNull();
    expect(parsed.lastSentAt.review).toBe("2026-05-20T10:00:00Z");
    expect(parsed.ignoredStreak).toBe(0);
    expect(parsed.snoozedUntil).toBeNull();
  });

  test("setReminderPrefs persists and dispatches a change event", () => {
    const next = setReminderPrefs({ enabled: true, windowEndHour: 22 });
    expect(next.enabled).toBe(true);
    expect(storedPrefs().enabled).toBe(true);
    expect(storedPrefs().windowEndHour).toBe(22);
    expect(
      windowStub.events.some((e) => e.type === REMINDERS_CHANGE_EVENT),
    ).toBe(true);
  });
});

describe("quiet window", () => {
  test("is half-open inside the day and wraps midnight", () => {
    expect(isWithinReminderWindow(9, 9, 21)).toBe(true);
    expect(isWithinReminderWindow(20, 9, 21)).toBe(true);
    expect(isWithinReminderWindow(21, 9, 21)).toBe(false);
    expect(isWithinReminderWindow(8, 9, 21)).toBe(false);

    expect(isWithinReminderWindow(23, 22, 6)).toBe(true);
    expect(isWithinReminderWindow(5, 22, 6)).toBe(true);
    expect(isWithinReminderWindow(6, 22, 6)).toBe(false);
    expect(isWithinReminderWindow(12, 22, 6)).toBe(false);

    expect(isWithinReminderWindow(3, 8, 8)).toBe(true);
  });

  test("nothing fires outside the stored window", () => {
    const morning = new Date(2026, 4, 20, 7, 0, 0, 0);
    expect(
      evaluateReminders(
        signals({
          now: morning,
          prefs: basePrefs(),
          learnerState: "wobbling",
          solvedToday: false,
          streak: 9,
        }),
      ),
    ).toEqual([]);

    const evening = new Date(2026, 4, 20, 20, 0, 0, 0);
    expect(
      evaluateReminders(
        signals({
          now: evening,
          learnerState: "wobbling",
          solvedToday: false,
          streak: 9,
        }),
      ).length,
    ).toBe(1);
  });
});

describe("session warmup and caps", () => {
  test("sessionIsPastWarmup is strict at the one-hour boundary", () => {
    const start = new Date(2026, 4, 20, 19, 0, 0, 0);
    expect(
      sessionIsPastWarmup(start, new Date(2026, 4, 20, 19, 59, 0, 0)),
    ).toBe(false);
    expect(
      sessionIsPastWarmup(start, new Date(2026, 4, 20, 20, 0, 0, 0)),
    ).toBe(true);
    expect(sessionIsPastWarmup(null, NOW)).toBe(false);
  });

  test("nothing fires in the first hour of a session", () => {
    const justStarted = new Date(NOW.getTime() - 30 * 60 * 1000);
    expect(
      evaluateReminders(
        signals({
          sessionStartedAt: justStarted,
          learnerState: "wobbling",
          solvedToday: false,
          streak: 9,
        }),
      ),
    ).toEqual([]);

    expect(
      evaluateReminders(
        signals({
          sessionStartedAt: new Date(NOW.getTime() - 61 * 60 * 1000),
          learnerState: "wobbling",
          solvedToday: false,
          streak: 9,
        }),
      ).length,
    ).toBe(1);
  });

  test("a null session start suppresses everything", () => {
    expect(
      evaluateReminders(
        signals({
          sessionStartedAt: null,
          learnerState: "wobbling",
          solvedToday: false,
          streak: 9,
        }),
      ),
    ).toEqual([]);
  });

  test("each category is capped at one send per calendar day", () => {
    const prefs = basePrefs();
    prefs.lastSent.streak = TODAY;
    const reminders = evaluateReminders(
      signals({
        prefs,
        learnerState: "wobbling",
        solvedToday: false,
        streak: 9,
        reviewDueCount: 3,
      }),
    );
    expect(reminders.map((r) => r.category)).toEqual(["review"]);

    prefs.lastSent.review = TODAY;
    prefs.lastSent.digest = TODAY;
    expect(
      evaluateReminders(
        signals({
          prefs,
          learnerState: "wobbling",
          solvedToday: false,
          streak: 9,
          reviewDueCount: 3,
          weekSolved: 4,
        }),
      ),
    ).toEqual([]);
  });

  test("opt-in is required", () => {
    const reminders = evaluateReminders(
      signals({
        prefs: basePrefs({ enabled: false }),
        learnerState: "wobbling",
        solvedToday: false,
        streak: 9,
        reviewDueCount: 3,
        weekSolved: 4,
      }),
    );
    expect(reminders).toEqual([]);
  });
});

describe("category rules", () => {
  test("streak fires only when wobbling after the usual hour", () => {
    expect(
      evaluateReminders(
        signals({
          learnerState: "wobbling",
          solvedToday: false,
          pastUsualHour: false,
          streak: 9,
        }),
      ),
    ).toEqual([]);

    const late = evaluateReminders(
      signals({ learnerState: "wobbling", solvedToday: false, streak: 9 }),
    );
    expect(late[0]?.category).toBe("streak");
    expect(late[0]?.title).toContain("9-day");
  });

  test("streak stays silent when today is solved or state is active", () => {
    expect(
      evaluateReminders(signals({ learnerState: "active", solvedToday: true })),
    ).toEqual([]);
  });

  test("streak copy describes the solve streak, not the daily challenge", () => {
    const reminders = evaluateReminders(
      signals({ learnerState: "wobbling", solvedToday: false, streak: 9 }),
    );
    expect(reminders[0]?.title).toContain("solve streak");
    expect(reminders[0]?.body).toContain("any problem");

    const digest = evaluateReminders(signals({ weekSolved: 5, streak: 9 }));
    expect(digest[0]?.body).toContain("9-day solve streak");
  });

  test("at-risk and dormant get a recovery nudge, not a counting one", () => {
    const atRisk = evaluateReminders(
      signals({ learnerState: "atRisk", solvedToday: false, streak: 0 }),
    );
    expect(atRisk[0]?.title).toBe("Start a new streak today");

    const dormant = evaluateReminders(
      signals({ learnerState: "dormant", solvedToday: false, streak: 0 }),
    );
    expect(dormant[0]?.title).toBe("Start a new streak today");
  });

  test("a covered yesterday is called out honestly", () => {
    const reminders = evaluateReminders(
      signals({
        learnerState: "wobbling",
        solvedToday: false,
        coveredYesterday: true,
        streak: 9,
      }),
    );
    expect(reminders[0]?.title).toBe("A shield covered yesterday");
  });

  test("review fires only with due concepts", () => {
    expect(
      evaluateReminders(signals({ reviewDueCount: 0 })),
    ).toEqual([]);
    const due = evaluateReminders(signals({ reviewDueCount: 2 }));
    expect(due[0]?.category).toBe("review");
    expect(due[0]?.title).toBe("2 reviews due");
    expect(due[0]?.href).toBe("/math");

    const codeDue = evaluateReminders(
      signals({ reviewDueCount: 4, reviewHref: "/today" }),
    );
    expect(codeDue[0]?.href).toBe("/today");
  });

  test("digest needs a week of activity and a weekly gap", () => {
    expect(evaluateReminders(signals({ weekSolved: 0 }))).toEqual([]);

    const first = evaluateReminders(signals({ weekSolved: 5 }));
    expect(first[0]?.category).toBe("digest");

    const threeDaysAgo = localDateKey(
      new Date(NOW.getTime() - 3 * 86_400_000),
    );
    const tooSoon = evaluateReminders(
      signals({
        prefs: basePrefs({
          lastSent: { streak: null, review: null, digest: threeDaysAgo },
        }),
        weekSolved: 5,
      }),
    );
    expect(tooSoon).toEqual([]);

    const sevenDaysAgo = localDateKey(
      new Date(NOW.getTime() - 7 * 86_400_000),
    );
    const eligible = evaluateReminders(
      signals({
        prefs: basePrefs({
          lastSent: { streak: null, review: null, digest: sevenDaysAgo },
        }),
        weekSolved: 5,
      }),
    );
    expect(eligible[0]?.category).toBe("digest");
    expect(eligible[0]?.body).toContain("5 problems");
  });

  test("priority order is streak, review, digest", () => {
    const reminders = evaluateReminders(
      signals({
        learnerState: "wobbling",
        solvedToday: false,
        streak: 9,
        reviewDueCount: 3,
        weekSolved: 4,
      }),
    );
    expect(reminders.map((r) => r.category)).toEqual([
      "streak",
      "review",
      "digest",
    ]);
  });

  test("all nine reminder combinations are deterministic", () => {
    const flags = [false, true];
    for (const streakAtRisk of flags) {
      for (const reviewDue of flags) {
        for (const weeklyDigest of flags) {
          const prefs = basePrefs({ streakAtRisk, reviewDue, weeklyDigest });
          const first = evaluateReminders(
            signals({
              prefs,
              learnerState: "wobbling",
              solvedToday: false,
              streak: 9,
              reviewDueCount: 2,
              weekSolved: 3,
            }),
          ).map((r) => r.category);
          const second = evaluateReminders(
            signals({
              prefs,
              learnerState: "wobbling",
              solvedToday: false,
              streak: 9,
              reviewDueCount: 2,
              weekSolved: 3,
            }),
          ).map((r) => r.category);
          expect(second).toEqual(first);
          if (streakAtRisk) expect(first).toContain("streak");
          else expect(first).not.toContain("streak");
          if (reviewDue) expect(first).toContain("review");
          else expect(first).not.toContain("review");
          if (weeklyDigest) expect(first).toContain("digest");
          else expect(first).not.toContain("digest");
        }
      }
    }
  });
});

describe("backoff, snooze, and send bookkeeping", () => {
  test("three unanswered sends back off for 48 hours per category", () => {
    const lastAt = new Date(NOW.getTime() - 24 * 60 * 60 * 1000);
    const prefs = basePrefs({
      ignoredStreak: 3,
      lastSentAt: {
        streak: lastAt.toISOString(),
        review: null,
        digest: null,
      },
    });
    expect(
      evaluateReminders(
        signals({ prefs, learnerState: "wobbling", solvedToday: false, streak: 9 }),
      ).some((r) => r.category === "streak"),
    ).toBe(false);

    const oldEnough = basePrefs({
      ignoredStreak: 3,
      lastSentAt: {
        streak: new Date(NOW.getTime() - 49 * 60 * 60 * 1000).toISOString(),
        review: null,
        digest: null,
      },
    });
    expect(
      evaluateReminders(
        signals({
          prefs: oldEnough,
          learnerState: "wobbling",
          solvedToday: false,
          streak: 9,
        }),
      ).some((r) => r.category === "streak"),
    ).toBe(true);
  });

  test("an intervening solve clears the unanswered streak", () => {
    setReminderPrefs({ enabled: true });
    recordReminderSent("streak", NOW, false);
    recordReminderSent("streak", NOW, false);
    expect(storedPrefs().ignoredStreak).toBe(2);

    recordEngagement();
    expect(storedPrefs().ignoredStreak).toBe(0);
  });

  test("recordReminderSent stamps the category and counts an unsolved send", () => {
    setReminderPrefs({ enabled: true });
    recordReminderSent("review", NOW, false);
    const prefs = storedPrefs();
    expect(prefs.lastSent.review).toBe(TODAY);
    expect(prefs.lastSentAt.review).toBe(NOW.toISOString());
    expect(prefs.ignoredStreak).toBe(1);

    recordReminderSent("streak", NOW, true);
    expect(storedPrefs().ignoredStreak).toBe(0);
  });

  test("snooze suppresses until it expires", () => {
    setReminderPrefs({ enabled: true });
    snoozeReminders(24, NOW);
    expect(
      evaluateReminders(
        signals({
          prefs: storedPrefs(),
          learnerState: "wobbling",
          solvedToday: false,
          streak: 9,
        }),
      ),
    ).toEqual([]);

    const later = new Date(NOW.getTime() + 24.5 * 60 * 60 * 1000);
    expect(
      evaluateReminders(
        signals({
          now: later,
          prefs: storedPrefs(),
          sessionStartedAt: new Date(later.getTime() - 2 * 60 * 60 * 1000),
          learnerState: "atRisk",
          solvedToday: false,
        }),
      ).length,
    ).toBe(1);
  });
});

describe("learner state", () => {
  test("maps the last solve day to the four momentum states", () => {
    expect(
      deriveLearnerState({ todayKey: TODAY, lastSolveKey: null }),
    ).toBe("new");
    expect(
      deriveLearnerState({ todayKey: TODAY, lastSolveKey: TODAY }),
    ).toBe("active");
    expect(
      deriveLearnerState({
        todayKey: TODAY,
        lastSolveKey: localDateKey(new Date(NOW.getTime() - 86_400_000)),
      }),
    ).toBe("wobbling");
    expect(
      deriveLearnerState({
        todayKey: TODAY,
        lastSolveKey: localDateKey(new Date(NOW.getTime() - 3 * 86_400_000)),
      }),
    ).toBe("atRisk");
    expect(
      deriveLearnerState({
        todayKey: TODAY,
        lastSolveKey: localDateKey(new Date(NOW.getTime() - 6 * 86_400_000)),
      }),
    ).toBe("atRisk");
    expect(
      deriveLearnerState({
        todayKey: TODAY,
        lastSolveKey: localDateKey(new Date(NOW.getTime() - 7 * 86_400_000)),
      }),
    ).toBe("dormant");
  });

  test("daysBetweenKeys is calendar math across months and DST", () => {
    expect(daysBetweenKeys("2026-02-28", "2026-03-01")).toBe(1);
    expect(daysBetweenKeys("2026-03-07", "2026-03-09")).toBe(2);
    expect(daysBetweenKeys("2026-10-31", "2026-11-01")).toBe(1);
    expect(daysBetweenKeys("2026-01-01", "2026-01-01")).toBe(0);
  });
});

describe("dispatch (in-app fallback)", () => {
  test("surfaces a state-aware nudge, records it, and emits the event", async () => {
    const yesterday = new Date(NOW.getTime() - 86_400_000);
    const solvedDates = Array.from({ length: 7 }, (_, index) =>
      localDateKey(new Date(NOW.getTime() - (index + 1) * 86_400_000)),
    );
    windowStub.localStorage.setItem(
      "deepforge:daily:v1",
      JSON.stringify({
        lastSolvedDate: localDateKey(yesterday),
        streak: 7,
        solvedDates,
        shields: 2,
        shieldUsedDates: [],
      }),
    );
    setReminderPrefs({ enabled: true });
    startReminderSession(new Date(NOW.getTime() - 2 * 60 * 60 * 1000));

    const result = await dispatchReminders(NOW);
    expect(result).not.toBeNull();
    expect(result?.channel).toBe("in-app");
    expect(result?.reminder.category).toBe("streak");
    expect(result?.reminder.title).toContain("7-day");
    expect(storedPrefs().lastSent.streak).toBe(TODAY);
    expect(storedPrefs().ignoredStreak).toBe(1);

    const emitted = windowStub.events.filter(
      (event) => event.type === REMINDER_EVENT,
    );
    expect(emitted).toHaveLength(1);
    expect((emitted[0] as CustomEvent<Reminder>).detail.category).toBe("streak");
  });

  test("a second dispatch the same day is suppressed", async () => {
    const solvedDates = Array.from({ length: 7 }, (_, index) =>
      localDateKey(new Date(NOW.getTime() - (index + 1) * 86_400_000)),
    );
    windowStub.localStorage.setItem(
      "deepforge:daily:v1",
      JSON.stringify({
        lastSolvedDate: localDateKey(new Date(NOW.getTime() - 86_400_000)),
        streak: 7,
        solvedDates,
        shields: 2,
        shieldUsedDates: [],
      }),
    );
    setReminderPrefs({ enabled: true });
    startReminderSession(new Date(NOW.getTime() - 2 * 60 * 60 * 1000));

    await dispatchReminders(NOW);
    const again = await dispatchReminders(NOW);
    expect(again).toBeNull();
  });

  test("nothing dispatches before opt-in", async () => {
    const solvedDates = Array.from({ length: 7 }, (_, index) =>
      localDateKey(new Date(NOW.getTime() - (index + 1) * 86_400_000)),
    );
    windowStub.localStorage.setItem(
      "deepforge:daily:v1",
      JSON.stringify({
        lastSolvedDate: localDateKey(new Date(NOW.getTime() - 86_400_000)),
        streak: 7,
        solvedDates,
        shields: 2,
        shieldUsedDates: [],
      }),
    );
    startReminderSession(new Date(NOW.getTime() - 2 * 60 * 60 * 1000));
    expect(await dispatchReminders(NOW)).toBeNull();
  });
});

describe("collectReminderSignals (integration)", () => {
  test("derives wobbling, shields, and covered-yesterday from the stores", async () => {
    const yesterdayKey = localDateKey(
      new Date(NOW.getTime() - 86_400_000),
    );
    seedProgressDays(new Date(NOW.getTime() - 86_400_000), 9);
    windowStub.localStorage.setItem(
      "deepforge:daily:v1",
      JSON.stringify({
        lastSolvedDate: yesterdayKey,
        streak: 9,
        solvedDates: [yesterdayKey],
        shields: 1,
        shieldUsedDates: [yesterdayKey],
      }),
    );
    setReminderPrefs({ enabled: true });
    startReminderSession(new Date(NOW.getTime() - 2 * 60 * 60 * 1000));

    const { collectReminderSignals } = await import("@/lib/reminders");
    const derived = await collectReminderSignals(NOW);
    expect(derived.learnerState).toBe("wobbling");
    expect(derived.solvedToday).toBe(false);
    expect(derived.streak).toBe(9);
    expect(derived.shields).toBe(1);
    expect(derived.coveredYesterday).toBe(true);
    expect(derived.pastUsualHour).toBe(true);
    expect(derived.prefs.enabled).toBe(true);
    expect(DEFAULT_USUAL_HOUR).toBe(19);
  });

  test("the streak signal is the solve streak from progress solves", async () => {
    seedProgressDays(new Date(NOW.getTime() - 86_400_000), 3);
    setReminderPrefs({ enabled: true });
    startReminderSession(new Date(NOW.getTime() - 2 * 60 * 60 * 1000));

    const { collectReminderSignals } = await import("@/lib/reminders");
    const derived = await collectReminderSignals(NOW);
    expect(derived.streak).toBe(3);
    expect(derived.learnerState).toBe("wobbling");
    expect(derived.solvedToday).toBe(false);
  });

  test("no historical solves means no review or digest pressure", async () => {
    const { collectReminderSignals } = await import("@/lib/reminders");
    const derived = await collectReminderSignals(NOW);
    expect(derived.learnerState).toBe("new");
    expect(derived.weekSolved).toBe(0);
    expect(derived.reviewDueCount).toBe(0);
  });
});
