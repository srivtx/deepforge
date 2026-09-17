import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { LABS } from "@/data/labs";
import { LAB_HISTORY_CAP, getLabRecords, setLabBest } from "@/lib/labs";
import {
  LAB_REVIEWS_CHANGE_EVENT,
  LAB_REVIEWS_STORAGE_KEY,
  deriveLabReviews,
  getLabReviews,
  gradeLabRun,
  labReviewDue,
  parseLabReviewMap,
  readLabReviews,
  seedLabReviewState,
} from "@/lib/labReviews";

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

const globalScope = globalThis as unknown as { window?: unknown };
let originalWindow: unknown;
let hadWindow = false;

beforeEach(() => {
  hadWindow = "window" in globalScope;
  originalWindow = globalScope.window;
  globalScope.window = {
    localStorage: createStorageStub(),
    dispatchEvent: () => true,
  };
});

afterEach(() => {
  if (hadWindow) globalScope.window = originalWindow;
  else delete globalScope.window;
});

function storage(): Storage {
  return (globalScope.window as { localStorage: Storage }).localStorage;
}

function writeLabRecord(
  labId: string,
  overrides: Record<string, unknown> = {},
): void {
  const raw = storage().getItem("deepforge:labs");
  const records: Record<string, unknown> = raw ? JSON.parse(raw) : {};
  records[labId] = {
    best: 1,
    attempts: 1,
    passed: true,
    ...overrides,
  };
  storage().setItem("deepforge:labs", JSON.stringify(records));
}

const LAB_A = LABS[0];
const LAB_B = LABS[1];

const D1 = new Date(2026, 0, 5, 10, 0, 0, 0);
const D2 = new Date(2026, 0, 15, 10, 0, 0, 0);
const D3 = new Date(2026, 0, 25, 10, 0, 0, 0);
const D4 = new Date(2026, 1, 1, 10, 0, 0, 0);
const NOW = new Date(2026, 0, 20, 12, 0, 0, 0);

describe("seeding from a first pass", () => {
  test("a recorded pass seeds a one-day interval counted as the first rep", () => {
    writeLabRecord(LAB_A.id, {
      lastScoredAt: D1.toISOString(),
      lastScore: LAB_A.target,
      recentPasses: [D1.toISOString()],
    });

    const reviews = getLabReviews(NOW);
    const state = reviews[LAB_A.id];
    expect(state.interval).toBe(1);
    expect(state.reps).toBe(1);
    expect(state.lapses).toBe(0);
    expect(state.ease).toBe(2.5);
    expect(state.due).toBe("2026-01-06");
    expect(state.lastScore).toBe(LAB_A.target);
    expect(state.lastReviewedAt).toBe(D1.toISOString());
  });

  test("a lab that never passed gets no schedule", () => {
    writeLabRecord(LAB_A.id, { passed: false });
    expect(getLabReviews(NOW)).toEqual({});
    expect(labReviewDue(NOW)).toEqual([]);
  });

  test("a legacy passed record without pass history seeds from lastScoredAt", () => {
    writeLabRecord(LAB_A.id, { lastScoredAt: D2.toISOString() });
    const state = getLabReviews(NOW)[LAB_A.id];
    expect(state.interval).toBe(1);
    expect(state.reps).toBe(1);
    expect(state.due).toBe("2026-01-16");
  });

  test("pass history backfills the schedule forward", () => {
    writeLabRecord(LAB_A.id, {
      lastScoredAt: D2.toISOString(),
      lastScore: LAB_A.target,
      recentPasses: [D1.toISOString(), D2.toISOString()],
    });
    const state = getLabReviews(NOW)[LAB_A.id];
    expect(state.reps).toBe(2);
    expect(state.interval).toBe(6);
    expect(state.due).toBe("2026-01-21");
  });

  test("seedLabReviewState is pure and deterministic", () => {
    expect(seedLabReviewState(D1.toISOString())).toEqual(
      seedLabReviewState(D1.toISOString()),
    );
    expect(seedLabReviewState(D1.toISOString()).due).toBe("2026-01-06");
  });
});

describe("advancing and lapsing", () => {
  test("a later pass follows the reviewQueue ladder 1, 6, interval × ease", () => {
    const first = gradeLabRun(LAB_A.id, true, 0.9, D1);
    expect(first.interval).toBe(1);
    expect(first.reps).toBe(1);
    expect(first.due).toBe("2026-01-06");
    expect(first.ease).toBe(2.6);

    const second = gradeLabRun(LAB_A.id, true, 0.9, D2);
    expect(second.interval).toBe(6);
    expect(second.reps).toBe(2);
    expect(second.due).toBe("2026-01-21");
    expect(second.ease).toBe(2.7);

    const third = gradeLabRun(LAB_A.id, true, 0.9, D3);
    expect(third.interval).toBe(16);
    expect(third.reps).toBe(3);
    expect(third.due).toBe("2026-02-10");
    expect(third.ease).toBe(2.8);
  });

  test("a re-run below target lapses: interval 1, reps 0, ease drops", () => {
    gradeLabRun(LAB_A.id, true, 0.9, D1);
    gradeLabRun(LAB_A.id, true, 0.9, D2);
    const lapsed = gradeLabRun(LAB_A.id, false, 0.1, D3);
    expect(lapsed.interval).toBe(1);
    expect(lapsed.reps).toBe(0);
    expect(lapsed.lapses).toBe(1);
    expect(lapsed.ease).toBe(2.5);
    expect(lapsed.due).toBe("2026-01-26");
    expect(lapsed.lastScore).toBe(0.1);

    const recovered = gradeLabRun(LAB_A.id, true, 0.9, D4);
    expect(recovered.interval).toBe(1);
    expect(recovered.reps).toBe(1);
    expect(recovered.lapses).toBe(1);
  });

  test("same-day passes never advance twice", () => {
    writeLabRecord(LAB_A.id, {
      lastScoredAt: D1.toISOString(),
      recentPasses: [D1.toISOString()],
    });
    expect(getLabReviews(NOW)[LAB_A.id].interval).toBe(1);

    const laterSameDay = new Date(2026, 0, 5, 18, 0, 0, 0);
    writeLabRecord(LAB_A.id, {
      lastScoredAt: laterSameDay.toISOString(),
      recentPasses: [D1.toISOString(), laterSameDay.toISOString()],
    });
    const after = getLabReviews(NOW)[LAB_A.id];
    expect(after.interval).toBe(1);
    expect(after.reps).toBe(1);
    expect(after.due).toBe("2026-01-06");
  });

  test("the store dispatches the change event on an explicit grade", () => {
    const events: string[] = [];
    (
      globalScope.window as { dispatchEvent: (event: Event) => boolean }
    ).dispatchEvent = (event) => {
      events.push((event as CustomEvent).type);
      return true;
    };
    gradeLabRun(LAB_A.id, true, 0.9, NOW);
    expect(events).toContain(LAB_REVIEWS_CHANGE_EVENT);
    expect(readLabReviews()[LAB_A.id].reps).toBe(1);
  });
});

describe("determinism", () => {
  test("deriveLabReviews returns equal maps for equal inputs", () => {
    writeLabRecord(LAB_A.id, {
      lastScoredAt: D1.toISOString(),
      recentPasses: [D1.toISOString()],
    });
    writeLabRecord(LAB_B.id, {
      lastScoredAt: D2.toISOString(),
      recentPasses: [D2.toISOString()],
    });
    const records = getLabRecords();
    expect(deriveLabReviews(records, {}, NOW)).toEqual(
      deriveLabReviews(records, {}, NOW),
    );
  });

  test("getLabReviews persists once and is stable on repeat calls", () => {
    writeLabRecord(LAB_A.id, {
      lastScoredAt: D1.toISOString(),
      recentPasses: [D1.toISOString()],
    });
    const first = getLabReviews(NOW);
    const stored = storage().getItem(LAB_REVIEWS_STORAGE_KEY);
    const second = getLabReviews(NOW);
    expect(second).toEqual(first);
    expect(storage().getItem(LAB_REVIEWS_STORAGE_KEY)).toBe(stored);
    expect(readLabReviews()).toEqual(first);
  });
});

describe("due selectors", () => {
  test("orders by days overdue, then ease, then lab id", () => {
    writeLabRecord(LAB_A.id, {
      lastScoredAt: D1.toISOString(),
      recentPasses: [D1.toISOString()],
    });
    writeLabRecord(LAB_B.id, {
      lastScoredAt: D2.toISOString(),
      recentPasses: [D2.toISOString()],
    });

    const due = labReviewDue(NOW);
    expect(due.map((item) => item.lab.id)).toEqual([LAB_A.id, LAB_B.id]);
    expect(due[0].overdueDays).toBe(14);
    expect(due[1].overdueDays).toBe(4);
    expect(due[0].due).toBe("2026-01-06");
    expect(due[0].lab.title).toBe(LAB_A.title);
  });

  test("future re-runs are not returned", () => {
    writeLabRecord(LAB_A.id, {
      lastScoredAt: NOW.toISOString(),
      recentPasses: [NOW.toISOString()],
    });
    expect(labReviewDue(NOW)).toEqual([]);
    expect(labReviewDue(new Date(2026, 0, 22, 12, 0, 0, 0))).toHaveLength(1);
  });

  test("re-runs without a recorded pass are excluded", () => {
    gradeLabRun(LAB_A.id, true, 0.9, D1);
    expect(labReviewDue(NOW)).toEqual([]);
  });
});

describe("history cap", () => {
  test("setLabBest keeps only the newest passes", () => {
    for (let i = 0; i < LAB_HISTORY_CAP + 2; i += 1) {
      setLabBest(LAB_A.id, LAB_A.target, new Date(2026, 0, 1 + i, 9, 0, 0, 0));
    }
    const record = getLabRecords()[LAB_A.id];
    expect(record.recentPasses).toHaveLength(LAB_HISTORY_CAP);
    expect(record.recentPasses?.[0]).toBe(
      new Date(2026, 0, 3, 9, 0, 0, 0).toISOString(),
    );
    expect(record.recentPasses?.[LAB_HISTORY_CAP - 1]).toBe(
      new Date(2026, 0, 12, 9, 0, 0, 0).toISOString(),
    );

    const failing = LAB_A.higherIsBetter
      ? LAB_A.target - 0.05
      : LAB_A.target + 0.05;
    const afterFail = setLabBest(
      LAB_A.id,
      failing,
      new Date(2026, 0, 20, 9, 0, 0, 0),
    );
    expect(afterFail.recentPasses).toHaveLength(LAB_HISTORY_CAP);
    expect(afterFail.lastScore).toBe(failing);
  });
});

describe("parsing and sanitization", () => {
  test("invalid payloads read as empty maps", () => {
    expect(parseLabReviewMap(null)).toEqual({});
    expect(parseLabReviewMap("")).toEqual({});
    expect(parseLabReviewMap("{not json")).toEqual({});
    expect(parseLabReviewMap("[]")).toEqual({});
    expect(parseLabReviewMap("null")).toEqual({});
    expect(parseLabReviewMap('"nope"')).toEqual({});
    expect(parseLabReviewMap("7")).toEqual({});
  });

  test("malformed entries drop instead of throwing", () => {
    const parsed = parseLabReviewMap(
      JSON.stringify({
        good: {
          ease: 2.2,
          interval: 6,
          due: "2026-02-01",
          reps: 3,
          lapses: 1,
          lastGrade: 5,
          lastReviewedAt: "2026-01-01T00:00:00.000Z",
          lastScore: 0.9,
        },
        junk: "x",
        nil: null,
        arr: [],
        num: 7,
      }),
    );
    expect(parsed.good).toEqual({
      ease: 2.2,
      interval: 6,
      due: "2026-02-01",
      reps: 3,
      lapses: 1,
      lastGrade: 5,
      lastReviewedAt: "2026-01-01T00:00:00.000Z",
      lastScore: 0.9,
    });
    expect(parsed.junk).toBeUndefined();
    expect(parsed.nil).toBeUndefined();
    expect(parsed.arr).toBeUndefined();
    expect(parsed.num).toBeUndefined();
  });

  test("out-of-band values sanitize to defaults", () => {
    const parsed = parseLabReviewMap(
      JSON.stringify({
        bad: {
          ease: "high",
          interval: -4,
          due: "not-a-date",
          reps: 2.6,
          lapses: Number.NaN,
          lastGrade: 9,
          lastReviewedAt: 12,
          lastScore: "0.9",
        },
      }),
    );
    expect(parsed.bad.ease).toBe(2.5);
    expect(parsed.bad.interval).toBe(0);
    expect(parsed.bad.due).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(parsed.bad.reps).toBe(3);
    expect(parsed.bad.lapses).toBe(0);
    expect(parsed.bad.lastGrade).toBeNull();
    expect(parsed.bad.lastReviewedAt).toBeNull();
    expect(parsed.bad.lastScore).toBeNull();
  });
});
