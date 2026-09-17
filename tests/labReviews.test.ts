import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { LABS } from "@/data/labs";
import { LAB_HISTORY_CAP, getLabRecords, setLabBest } from "@/lib/labs";
import {
  LAB_REVIEWS_CHANGE_EVENT,
  LAB_REVIEWS_STORAGE_KEY,
  deriveLabReviews,
  getLabReviews,
  gradeLabReviewState,
  gradeLabRun,
  labReviewDue,
  parseLabReviewMap,
  readLabReviews,
  seedLabReviewState,
} from "@/lib/labReviews";
import { gradeReviewState } from "@/lib/reviewQueue";

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

function close(
  actual: number | undefined,
  expected: number,
  precision: number,
): void {
  expect(typeof actual).toBe("number");
  expect(Math.abs((actual as number) - expected)).toBeLessThan(
    0.5 * 10 ** -precision,
  );
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
const D1_NEXT = new Date(2026, 0, 6, 10, 0, 0, 0);
const D2 = new Date(2026, 0, 15, 10, 0, 0, 0);
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
    expect(state.v).toBe(2);
    expect(state.S).toBe(1);
    expect(state.D).toBe(5);
    expect(state.effort).toBe(0);
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
    expect(state.v).toBe(2);
    expect(state.S).toBe(1);
    expect(state.D).toBe(5);
  });

  test("pass history backfills the schedule forward through LGS", () => {
    writeLabRecord(LAB_A.id, {
      lastScoredAt: D2.toISOString(),
      lastScore: LAB_A.target,
      recentPasses: [D1.toISOString(), D2.toISOString()],
    });
    const state = getLabReviews(NOW)[LAB_A.id];
    expect(state.reps).toBe(2);
    expect(state.interval).toBe(12);
    expect(state.due).toBe("2026-01-27");
    close(state.S, 11.807120263704661, 9);
    close(state.D, 4.7, 9);
    expect(state.effort).toBe(0);
    expect(state.ease).toBe(2.5);
  });

  test("seedLabReviewState is pure, deterministic, and emits v2 fields", () => {
    expect(seedLabReviewState(D1.toISOString())).toEqual(
      seedLabReviewState(D1.toISOString()),
    );
    const seeded = seedLabReviewState(D1.toISOString());
    expect(seeded.due).toBe("2026-01-06");
    expect(seeded.v).toBe(2);
    expect(seeded.S).toBe(1);
    expect(seeded.D).toBe(5);
    expect(seeded.effort).toBe(0);
  });
});

describe("advancing and lapsing", () => {
  test("a first pass anchors at one day", () => {
    const first = gradeLabRun(LAB_A.id, true, 0.9, D1);
    expect(first.interval).toBe(1);
    expect(first.reps).toBe(1);
    expect(first.due).toBe("2026-01-06");
    expect(first.ease).toBe(2.5);
    expect(first.S).toBe(1);
    close(first.D, 4.7, 9);
    expect(first.effort).toBe(0);
  });

  test("a later pass from a recorded seed advances to 12 (S'=11.8071)", () => {
    writeLabRecord(LAB_A.id, {
      lastScoredAt: D1.toISOString(),
      recentPasses: [D1.toISOString()],
    });
    const second = gradeLabRun(LAB_A.id, true, 0.9, D2);
    expect(second.interval).toBe(12);
    expect(second.reps).toBe(2);
    expect(second.due).toBe("2026-01-27");
    expect(second.ease).toBe(2.5);
    close(second.S, 11.807120263704661, 9);
    close(second.D, 4.7, 9);
    expect(second.effort).toBe(0);
  });

  test("a lapse at rPred 0.9 resets stability and interval", () => {
    writeLabRecord(LAB_A.id, {
      lastScoredAt: D1.toISOString(),
      recentPasses: [D1.toISOString()],
    });
    const lapsed = gradeLabRun(LAB_A.id, false, 0.1, D1_NEXT);
    expect(lapsed.interval).toBe(1);
    expect(lapsed.reps).toBe(0);
    expect(lapsed.lapses).toBe(1);
    expect(lapsed.ease).toBe(2.5);
    expect(lapsed.due).toBe("2026-01-07");
    expect(lapsed.lastScore).toBe(0.1);
    close(lapsed.S, 0.31676904101309167, 9);
    close(lapsed.D, 5.75, 9);
    expect(lapsed.effort).toBe(0.25);

    const recovered = gradeLabRun(LAB_A.id, true, 0.9, D4);
    expect(recovered.reps).toBe(1);
    expect(recovered.lapses).toBe(1);
    expect(recovered.interval).toBeGreaterThanOrEqual(1);
    expect(recovered.S as number).toBeGreaterThan(lapsed.S as number);
  });

  test("lab grading is parity with the reviewQueue quality adapter", () => {
    const seed = seedLabReviewState(D1.toISOString(), 0.9);
    const viaLab = gradeLabReviewState(seed, true, 0.9, D2);
    const viaQueue = gradeReviewState(seed, 5, D2);
    expect(viaLab.interval).toBe(viaQueue.interval);
    expect(viaLab.S).toBe(viaQueue.S);
    expect(viaLab.D).toBe(viaQueue.D);
    expect(viaLab.effort).toBe(viaQueue.effort);
    expect(viaLab.lastGrade).toBe(5);
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
    expect(after.S).toBe(1);
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

  test("malformed entries drop and v1 entries migrate on parse", () => {
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
      v: 2,
      S: 6,
      D: 5.6,
      effort: 0.1,
      lastScore: 0.9,
    });
    expect(parsed.junk).toBeUndefined();
    expect(parsed.nil).toBeUndefined();
    expect(parsed.arr).toBeUndefined();
    expect(parsed.num).toBeUndefined();
  });

  test("out-of-band values sanitize to defaults with LGS fields", () => {
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
    expect(parsed.bad.v).toBe(2);
    expect(parsed.bad.S).toBe(0.1);
    expect(parsed.bad.D).toBe(5);
    expect(parsed.bad.effort).toBe(0);
  });

  test("stored v1 lab maps are migrated on read, never rewritten as v1", () => {
    storage().setItem(
      LAB_REVIEWS_STORAGE_KEY,
      JSON.stringify({
        [LAB_A.id]: {
          ease: 1.7,
          interval: 14,
          due: "2026-10-02",
          reps: 3,
          lapses: 2,
          lastGrade: 3,
          lastScore: 0.8,
        },
      }),
    );
    const read = readLabReviews();
    expect(read[LAB_A.id].v).toBe(2);
    expect(read[LAB_A.id].S).toBe(14);
    expect(read[LAB_A.id].D).toBe(6.6);
    expect(read[LAB_A.id].effort).toBe(0.6);
    expect(read[LAB_A.id].due).toBe("2026-10-02");
    expect(read[LAB_A.id].lastScore).toBe(0.8);
    expect(readLabReviews()).toEqual(read);
  });
});
