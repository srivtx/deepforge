import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { ProblemMeta } from "@/data/problems/problem-meta";
import {
  CLEAN_PASS,
  REVIEWS_SPEC,
  REVIEWS_STORAGE_KEY,
  deriveReviews,
  dueReviews,
  getReviewBucketCounts,
  getReviewMap,
  gradeReview,
  gradeReviewSignal,
  gradeReviewState,
  interleaveByCategory,
  nextDueDate,
  parseReviewMap,
  pickWeakArea,
  qualityFromRun,
  readReviews,
  sanitizeReviewState,
  weakCategories,
  type ReviewMap,
  type ReviewState,
} from "@/lib/reviewQueue";
import { lgsRetrievability } from "@/lib/lgs";
import { mergeReviews } from "@/lib/sync/remoteMerge";
import type { ProgressMap } from "@/lib/progress";

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

const AT = (year: number, month: number, day: number): Date =>
  new Date(year, month, day, 12, 0, 0, 0);

const FIXED_NOW = AT(2026, 0, 14);
const ISO = (year: number, month: number, day: number): string =>
  AT(year, month, day).toISOString();

/** Noon on a "YYYY-MM-DD" date key, so grading lands on a stable calendar day. */
function atKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
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

function state(overrides: Partial<ReviewState> = {}): ReviewState {
  return {
    ease: 2.5,
    interval: 1,
    due: "2026-01-14",
    reps: 0,
    lapses: 0,
    lastGrade: null,
    lastReviewedAt: null,
    ...overrides,
  };
}

function meta(
  id: string,
  category: ProblemMeta["category"],
  difficulty: ProblemMeta["difficulty"],
  title = id,
): ProblemMeta {
  return { id, title, category, difficulty };
}

const META: ProblemMeta[] = [
  meta("la-1", "Linear Algebra", "Easy"),
  meta("la-2", "Linear Algebra", "Hard"),
  meta("la-3", "Linear Algebra", "Medium"),
  meta("ca-1", "Calculus", "Easy"),
  meta("ca-2", "Calculus", "Medium"),
  meta("st-1", "Statistics", "Easy"),
];
const META_BY_ID = new Map(META.map((problem) => [problem.id, problem]));

/* ─────────────────────────── quality adapter ───────────────────────────── */

describe("LGS grading adapter (gradeReviewState)", () => {
  test("first clean grade from the seed: interval 4, S 4.232585, D 4.7", () => {
    const first = gradeReviewState(undefined, 5, FIXED_NOW);
    expect(first.interval).toBe(4);
    expect(first.due).toBe("2026-01-18");
    expect(first.reps).toBe(1);
    expect(first.lapses).toBe(0);
    expect(first.ease).toBe(2.5);
    expect(first.lastGrade).toBe(5);
    expect(first.lastReviewedAt).toBe(FIXED_NOW.toISOString());
    expect(first.v).toBe(2);
    close(first.S, 4.232585481879205, 9);
    expect(first.D).toBe(4.7);
    expect(first.effort).toBe(0);
  });

  test("5/4/3/0 map onto the ladder signal (S' is quality-independent)", () => {
    const five = gradeReviewState(undefined, 5, FIXED_NOW);
    const four = gradeReviewState(undefined, 4, FIXED_NOW);
    const three = gradeReviewState(undefined, 3, FIXED_NOW);
    const zero = gradeReviewState(undefined, 0, FIXED_NOW);

    for (const out of [four, three]) {
      expect(out.interval).toBe(4);
      close(out.S, five.S, 9);
    }
    close(four.D, 4.85, 9);
    expect(four.effort).toBe(0.0625);
    expect(four.lastGrade).toBe(4);
    close(three.D, 5.008823529411765, 9);
    expect(three.effort).toBe(0.15625);
    expect(three.lastGrade).toBe(3);

    expect(zero.interval).toBe(1);
    expect(zero.due).toBe("2026-01-15");
    expect(zero.reps).toBe(0);
    expect(zero.lapses).toBe(1);
    expect(zero.lastGrade).toBe(0);
    close(zero.S, 0.31676904101309167, 9);
    close(zero.D, 5.75, 9);
    expect(zero.effort).toBe(0.25);
  });

  test("the canonical clean sequence is 4, 15, 49, 142, 375", () => {
    let current = gradeReviewState(undefined, 5, FIXED_NOW);
    const intervals = [current.interval];
    const dues = [current.due];
    const stabilities = [current.S];
    const difficulties = [current.D];
    for (let i = 0; i < 4; i += 1) {
      current = gradeReviewState(current, 5, atKey(current.due));
      intervals.push(current.interval);
      dues.push(current.due);
      stabilities.push(current.S);
      difficulties.push(current.D);
    }
    expect(intervals).toEqual([4, 15, 49, 142, 375]);
    expect(dues).toEqual([
      "2026-01-18",
      "2026-02-02",
      "2026-03-23",
      "2026-08-12",
      "2027-08-22",
    ]);
    const expectedS = [
      4.232585481879205, 15.079218264970487, 48.83874991440253,
      142.2800367629413, 375.39817899794957,
    ];
    const expectedD = [4.7, 4.445, 4.22825, 4.0440125, 3.887410625];
    expectedS.forEach((value, index) => close(stabilities[index], value, 9));
    expectedD.forEach((value, index) => close(difficulties[index], value, 9));
    expect(current.reps).toBe(5);
    expect(current.ease).toBe(2.5);
  });

  test("a lapse resets the interval and increments lapses", () => {
    let learned = gradeReviewState(undefined, 5, FIXED_NOW);
    learned = gradeReviewState(learned, 5, FIXED_NOW);
    expect(learned.reps).toBe(2);
    expect(learned.interval).toBe(4);

    const failed = gradeReviewState(learned, 0, FIXED_NOW);
    expect(failed.interval).toBe(1);
    expect(failed.due).toBe("2026-01-15");
    expect(failed.reps).toBe(0);
    expect(failed.lapses).toBe(1);
    expect(failed.ease).toBe(2.5);
    expect(failed.lastGrade).toBe(0);
    close(failed.S, 0.737848508459804, 9);
    close(failed.D, 5.27825, 9);

    const recovered = gradeReviewState(failed, 5, FIXED_NOW);
    expect(recovered.interval).toBe(1);
    expect(recovered.reps).toBe(1);
    expect(recovered.lapses).toBe(1);
    close(recovered.S, 0.737848508459804, 9);
    expect(recovered.effort).toBe(0.125);
  });

  test("ease is a frozen rollback field (never moves)", () => {
    let low: ReviewState | undefined;
    for (let i = 0; i < 10; i += 1) low = gradeReviewState(low, 0, FIXED_NOW);
    expect(low?.ease).toBe(2.5);
    expect(low?.lapses).toBe(10);
    close(low?.D, 9.015627978296388, 9);
    expect(low?.effort).toBe(0.49951171875);

    let high: ReviewState | undefined;
    for (let i = 0; i < 10; i += 1) high = gradeReviewState(high, 5, FIXED_NOW);
    expect(high?.ease).toBe(2.5);
    expect(high?.reps).toBe(10);
    close(high?.D, 3.3937488086814454, 9);
    expect(high?.effort).toBe(0);
  });

  test("steps whole calendar days across a month/DST boundary", () => {
    const march = AT(2026, 2, 7);
    const first = gradeReviewState(undefined, 5, march);
    expect(first.due).toBe("2026-03-11");
    const second = gradeReviewState(first, 5, AT(2026, 2, 11));
    expect(second.interval).toBe(15);
    expect(second.due).toBe("2026-03-26");
  });

  test("qualityFromRun maps the run harness ladder", () => {
    expect(qualityFromRun({ passed: true })).toBe(5);
    expect(qualityFromRun({ passed: true, failedRuns: 0 })).toBe(5);
    expect(qualityFromRun({ passed: true, failedRuns: 3 })).toBe(4);
    expect(qualityFromRun({ passed: true, failedRuns: 2, resetBeforePass: true })).toBe(3);
    expect(qualityFromRun({ passed: false, failedRuns: 5 })).toBe(0);
  });
});

/* ──────────────────── signal grading and the effort cap ────────────────── */

describe("gradeReviewSignal and the effort cap", () => {
  test("grades with real failed runs and hint tiers", () => {
    const runs = gradeReviewSignal(
      "la-1",
      { passed: true, failedRuns: 1, hintTier: 0 },
      FIXED_NOW,
    );
    expect(runs.interval).toBe(4);
    close(runs.D, 4.85, 9);
    expect(runs.effort).toBe(0.0625);
    expect(runs.lastGrade).toBe(4);

    const hints = gradeReviewSignal(
      "la-2",
      { passed: true, failedRuns: 0, hintTier: 1 },
      FIXED_NOW,
    );
    close(hints.D, 4.780769230769231, 9);
    expect(hints.effort).toBe(0.03125);
    expect(hints.lastGrade).toBe(4);

    const tiers = gradeReviewSignal(
      "la-3",
      { passed: true, failedRuns: 1, hintTier: 2 },
      FIXED_NOW,
    );
    close(tiers.D, 5.008823529411765, 9);
    expect(tiers.effort).toBe(0.15625);
  });

  test("two consecutive heavy passes enter the cap; a clean pass releases it", () => {
    storage().setItem(
      REVIEWS_STORAGE_KEY,
      JSON.stringify({
        "la-1": state({
          reps: 3,
          interval: 100,
          due: "2026-01-04",
          v: 2,
          S: 100,
          D: 5,
          effort: 0,
        }),
      }),
    );

    const first = gradeReviewSignal(
      "la-1",
      { passed: true, failedRuns: 12, hintTier: 3 },
      FIXED_NOW,
    );
    expect(first.effort).toBe(0.5);
    close(first.S, 260.5483881653903, 9);
    close(first.D, 5.463636363636364, 9);
    expect(first.interval).toBe(261);
    expect(first.lastGrade).toBe(4);

    const second = gradeReviewSignal(
      "la-1",
      { passed: true, failedRuns: 12, hintTier: 3 },
      AT(2026, 0, 15),
    );
    expect(second.effort).toBe(0.75);
    expect(second.interval).toBe(7);

    const released = gradeReviewSignal(
      "la-1",
      { passed: true, failedRuns: 0, hintTier: 0 },
      AT(2026, 0, 16),
    );
    expect(released.effort).toBe(0.375);
    expect(released.interval).toBe(264);
  });

  test("maximal struggle on a mature item caps the interval at 7", () => {
    storage().setItem(
      REVIEWS_STORAGE_KEY,
      JSON.stringify({
        "la-1": state({
          reps: 5,
          interval: 36500,
          due: "2026-01-04",
          v: 2,
          S: 36500,
          D: 1,
          effort: 0.5,
        }),
      }),
    );
    const out = gradeReviewSignal(
      "la-1",
      { passed: true, failedRuns: 12, hintTier: 3 },
      FIXED_NOW,
    );
    expect(out.S).toBe(36500);
    close(out.D, 2.0636363636363635, 9);
    expect(out.effort).toBe(0.75);
    expect(out.interval).toBe(7);
    expect(out.due).toBe("2026-01-21");
  });

  test("junk signal fields stay finite and dated", () => {
    const out = gradeReviewSignal(
      "la-1",
      { passed: true, failedRuns: Number.NaN, hintTier: 99 },
      FIXED_NOW,
    );
    expect(Number.isFinite(out.S)).toBe(true);
    expect(Number.isFinite(out.D)).toBe(true);
    expect(Number.isFinite(out.effort)).toBe(true);
    expect(out.interval).toBe(4);
    close(out.D, 5.12, 9);
    expect(out.effort).toBe(0.25);
    expect(out.due).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(out.due).not.toBe("NaN-NaN-NaN");
  });
});

/* ───────────────────── deriveReviews (solvedAt → schedule) ─────────────── */

describe("deriveReviews (solvedAt → schedule)", () => {
  test("seeds a solved problem with the v2 first-review anchor", () => {
    const progress: ProgressMap = {
      "la-1": { solved: true, solvedAt: ISO(2026, 0, 10) },
    };
    const derived = deriveReviews(progress, {}, FIXED_NOW);
    expect(derived["la-1"]).toEqual({
      ease: 2.5,
      interval: 1,
      due: "2026-01-11",
      reps: 0,
      lapses: 0,
      lastGrade: null,
      lastReviewedAt: null,
      v: 2,
      S: 1,
      D: 5,
      effort: 0,
    });
  });

  test("ignores unsolved problems and keeps existing entries", () => {
    const existing: ReviewMap = { "ca-1": state({ reps: 3, due: "2026-02-01" }) };
    const progress: ProgressMap = { "ca-1": { solved: true, solvedAt: ISO(2026, 0, 1) } };
    const derived = deriveReviews(progress, existing, FIXED_NOW);
    expect(derived["ca-1"]).toEqual(existing["ca-1"]);

    const onlyAttempted = deriveReviews({ "st-1": { attempted: true } }, {}, FIXED_NOW);
    expect(onlyAttempted).toEqual({});
  });

  test("a solve on or after the due date advances the schedule", () => {
    const seeded = deriveReviews(
      { "la-1": { solved: true, solvedAt: ISO(2026, 0, 10) } },
      {},
      FIXED_NOW,
    );
    expect(seeded["la-1"].due).toBe("2026-01-11");

    const reviewed = deriveReviews(
      { "la-1": { solved: true, solvedAt: ISO(2026, 0, 12) } },
      seeded,
      FIXED_NOW,
    );
    expect(reviewed["la-1"].reps).toBe(1);
    expect(reviewed["la-1"].interval).toBe(6);
    expect(reviewed["la-1"].due).toBe("2026-01-18");
    expect(reviewed["la-1"].lastGrade).toBe(CLEAN_PASS);
    expect(reviewed["la-1"].lastReviewedAt).toBe(ISO(2026, 0, 12));
    close(reviewed["la-1"].S, 6.092222449197849, 9);
    expect(reviewed["la-1"].D).toBe(4.7);
  });

  test("a legacy v1 entry is graded through the migration fallbacks", () => {
    const existing: ReviewMap = {
      "la-1": state({ reps: 1, interval: 1, due: "2026-01-10" }),
    };
    const derived = deriveReviews(
      { "la-1": { solved: true, solvedAt: ISO(2026, 0, 12) } },
      existing,
      FIXED_NOW,
    );
    expect(derived["la-1"].interval).toBe(7);
    expect(derived["la-1"].due).toBe("2026-01-19");
    close(derived["la-1"].S, 7.392401794993508, 9);
    expect(derived["la-1"].v).toBe(2);
  });

  test("re-solving before due, or twice in one day, never skips ahead", () => {
    const seeded = deriveReviews(
      { "la-1": { solved: true, solvedAt: ISO(2026, 0, 10) } },
      {},
      FIXED_NOW,
    );
    const early = deriveReviews(
      { "la-1": { solved: true, solvedAt: ISO(2026, 0, 10) } },
      seeded,
      FIXED_NOW,
    );
    expect(early["la-1"]).toEqual(seeded["la-1"]);

    const reviewed = deriveReviews(
      { "la-1": { solved: true, solvedAt: ISO(2026, 0, 12) } },
      seeded,
      FIXED_NOW,
    );
    const sameDay = deriveReviews(
      { "la-1": { solved: true, solvedAt: ISO(2026, 0, 12) } },
      reviewed,
      FIXED_NOW,
    );
    expect(sameDay["la-1"]).toEqual(reviewed["la-1"]);
  });

  test("is deterministic for a fixed solve history", () => {
    const progress: ProgressMap = {
      "la-1": { solved: true, solvedAt: ISO(2026, 0, 10) },
      "ca-1": { solved: true, solvedAt: ISO(2026, 0, 12) },
    };
    const first = deriveReviews(progress, {}, FIXED_NOW);
    const second = deriveReviews(progress, {}, AT(2026, 0, 14));
    expect(second).toEqual(first);
    expect(Object.keys(first)).toEqual(["ca-1", "la-1"]);
  });
});

/* ────────────────────────── buckets and ordering ───────────────────────── */

describe("buckets and due ordering", () => {
  test("empty state yields zeroed buckets and no queue", () => {
    expect(getReviewBucketCounts({}, FIXED_NOW)).toEqual({
      due: 0,
      learning: 0,
      new: 0,
      scheduled: 0,
      total: 0,
    });
    expect(dueReviews({}, META_BY_ID, FIXED_NOW)).toEqual([]);
    expect(nextDueDate({}, FIXED_NOW)).toBeNull();
  });

  test("bucketOf splits due / learning / new / scheduled", () => {
    const reviews: ReviewMap = {
      a: state(), // learning (reps 0, due today)
      b: state({ due: "2026-01-20" }), // new
      c: state({ reps: 2 }), // due
      d: state({ reps: 2, due: "2026-01-20" }), // scheduled
      e: state({ due: "2026-01-13" }), // learning overdue
      f: state({ reps: 1, due: "2026-01-13" }), // due overdue
    };
    expect(getReviewBucketCounts(reviews, FIXED_NOW)).toEqual({
      due: 2,
      learning: 2,
      new: 1,
      scheduled: 1,
      total: 6,
    });
  });

  test("orders due items by predicted retrievability, most forgotten first", () => {
    const reviews: ReviewMap = {
      "la-1": state({
        reps: 10,
        interval: 100,
        due: "2026-01-13",
        v: 2,
        S: 100,
        D: 5,
        effort: 0,
      }),
      "la-2": state({
        reps: 5,
        interval: 3,
        due: "2026-01-04",
        v: 2,
        S: 3,
        D: 5,
        effort: 0,
      }),
    };
    close(lgsRetrievability(reviews["la-1"], FIXED_NOW), 0.8993149422094734, 9);
    close(lgsRetrievability(reviews["la-2"], FIXED_NOW), 0.7744168722452689, 9);
    const queue = dueReviews(reviews, META_BY_ID, FIXED_NOW);
    expect(queue.map((item) => item.id)).toEqual(["la-2", "la-1"]);
  });

  test("same state yields the same queue regardless of key insertion order", () => {
    const forward: ReviewMap = {
      "la-1": state({ reps: 10, interval: 100, due: "2026-01-13", v: 2, S: 100, D: 5, effort: 0 }),
      "la-2": state({ reps: 5, interval: 3, due: "2026-01-04", v: 2, S: 3, D: 5, effort: 0 }),
      "la-3": state({ reps: 4, interval: 30, due: "2026-01-05", v: 2, S: 30, D: 5, effort: 0 }),
    };
    const reverse: ReviewMap = {
      "la-3": forward["la-3"],
      "la-2": forward["la-2"],
      "la-1": forward["la-1"],
    };
    const expected = ["la-2", "la-3", "la-1"];
    expect(dueReviews(forward, META_BY_ID, FIXED_NOW).map((i) => i.id)).toEqual(
      expected,
    );
    expect(dueReviews(reverse, META_BY_ID, FIXED_NOW).map((i) => i.id)).toEqual(
      expected,
    );
  });

  test("weak categories (lapses) jump equal-retrievability items, then interleave", () => {
    const reviews: ReviewMap = {
      "la-1": state({ reps: 1 }),
      "la-2": state({ reps: 1 }),
      "ca-1": state({ reps: 1, lapses: 3 }),
      "ca-2": state({ reps: 1, lapses: 3 }),
    };
    const weights = weakCategories(reviews, META_BY_ID);
    expect(weights.get("Calculus")).toBe(6);
    expect(weights.get("Linear Algebra")).toBeUndefined();

    const queue = dueReviews(reviews, META_BY_ID, FIXED_NOW);
    expect(queue[0].meta.category).toBe("Calculus");
    for (let i = 1; i < queue.length; i += 1) {
      expect(queue[i].meta.category).not.toBe(queue[i - 1].meta.category);
    }
  });

  test("caps the queue and never repeats a category back to back", () => {
    const reviews: ReviewMap = {};
    const manyMeta = new Map<string, ProblemMeta>();
    for (let i = 0; i < 12; i += 1) {
      const item =
        i % 2 === 0
          ? meta(`la-1-${i}`, "Linear Algebra", "Easy")
          : meta(`ca-1-${i}`, "Calculus", "Easy");
      reviews[item.id] = state({ reps: 1 });
      manyMeta.set(item.id, item);
    }
    const queue = dueReviews(reviews, manyMeta, FIXED_NOW);
    expect(queue).toHaveLength(10);
    for (let i = 1; i < queue.length; i += 1) {
      expect(queue[i].meta.category).not.toBe(queue[i - 1].meta.category);
    }
    expect(interleaveByCategory([])).toEqual([]);
  });
});

/* ────────────────────────── weak-area pick and next due ────────────────── */

describe("weak-area pick and next due", () => {
  test("returns null for a brand-new learner", () => {
    expect(pickWeakArea({}, {}, META)).toBeNull();
  });

  test("picks the easiest unsolved problem in the weakest category", () => {
    const progress: ProgressMap = {
      "la-1": { attempted: true },
      "ca-1": { solved: true, solvedAt: ISO(2026, 0, 1) },
    };
    const reviews: ReviewMap = { "la-1": state({ lapses: 2 }) };
    const pick = pickWeakArea(progress, reviews, META);
    expect(pick?.id).toBe("la-1");
  });

  test("skips a weak category with nothing left to solve", () => {
    const progress: ProgressMap = {
      "la-1": { solved: true, solvedAt: ISO(2026, 0, 2) },
      "la-2": { solved: true, solvedAt: ISO(2026, 0, 3) },
      "la-3": { solved: true, solvedAt: ISO(2026, 0, 4) },
      "ca-1": { attempted: true },
    };
    const reviews: ReviewMap = { "la-1": state({ lapses: 4 }) };
    const pick = pickWeakArea(progress, reviews, META);
    expect(pick?.category).toBe("Calculus");
  });

  test("nextDueDate returns the earliest future due date", () => {
    const reviews: ReviewMap = {
      a: state({ due: "2026-01-13" }),
      b: state({ due: "2026-01-20" }),
      c: state({ due: "2026-01-18" }),
    };
    expect(nextDueDate(reviews, FIXED_NOW)).toBe("2026-01-18");
  });
});

/* ────────────────────────── store, parsing, migration ──────────────────── */

describe("store, parsing, and migration", () => {
  test("invalid payloads read as an empty map", () => {
    storage().setItem(REVIEWS_STORAGE_KEY, "{not json");
    expect(readReviews()).toEqual({});
    expect(parseReviewMap(null)).toEqual({});
    expect(parseReviewMap("[]")).toEqual({});
    expect(parseReviewMap('"nope"')).toEqual({});
  });

  test("getReviewMap is a pure read that never seeds the store", () => {
    expect(getReviewMap(FIXED_NOW)).toEqual({});
    expect(storage().getItem(REVIEWS_STORAGE_KEY)).toBeNull();
  });

  test("sanitize migrates a v1 record and preserves its legacy fields", () => {
    const sanitized = sanitizeReviewState({
      ease: 1.7,
      interval: 14,
      due: "2026-10-02",
      reps: 3,
      lapses: 2,
      lastGrade: 3,
      lastReviewedAt: "2026-01-01T00:00:00.000Z",
    });
    expect(sanitized).not.toBeNull();
    expect(sanitized?.v).toBe(2);
    expect(sanitized?.S).toBe(14);
    expect(sanitized?.D).toBe(6.6);
    expect(sanitized?.effort).toBe(0.6);
    expect(sanitized?.due).toBe("2026-10-02");
    expect(sanitized?.ease).toBe(1.7);
    expect(sanitized?.interval).toBe(14);
    expect(sanitized?.reps).toBe(3);
    expect(sanitized?.lapses).toBe(2);
    expect(sanitized?.lastGrade).toBe(3);
    expect(sanitized?.lastReviewedAt).toBe("2026-01-01T00:00:00.000Z");
  });

  test("migration is idempotent and copies valid v2 fields verbatim", () => {
    const once = sanitizeReviewState({
      ease: 1.7,
      interval: 14,
      due: "2026-10-02",
      reps: 3,
      lapses: 2,
      lastGrade: 3,
    });
    const twice = sanitizeReviewState(JSON.parse(JSON.stringify(once)));
    expect(JSON.stringify(twice)).toBe(JSON.stringify(once));

    const valid = sanitizeReviewState({
      v: 2,
      S: 7,
      D: 3,
      effort: 0.2,
      ease: 1.3,
      interval: 99,
      due: "2026-02-01",
      reps: 3,
      lapses: 1,
      lastGrade: 4,
      lastReviewedAt: null,
    });
    expect(valid?.S).toBe(7);
    expect(valid?.D).toBe(3);
    expect(valid?.effort).toBe(0.2);
    expect(valid?.due).toBe("2026-02-01");
    expect(valid?.ease).toBe(1.3);
    expect(valid?.interval).toBe(99);
  });

  test("sanitizes out-of-band values instead of throwing", () => {
    const sanitized = sanitizeReviewState({
      ease: 99,
      interval: -5,
      due: "not-a-date",
      reps: "x",
      lapses: -2,
      lastGrade: 2,
      lastReviewedAt: 42,
    });
    expect(sanitized?.ease).toBe(2.8);
    expect(sanitized?.interval).toBe(0);
    expect(sanitized?.due).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(sanitized?.reps).toBe(0);
    expect(sanitized?.lapses).toBe(0);
    expect(sanitized?.lastGrade).toBeNull();
    expect(sanitized?.lastReviewedAt).toBeNull();
    expect(sanitized?.v).toBe(2);
    expect(sanitized?.S).toBe(1);
    expect(sanitized?.D).toBe(4.4);
    expect(sanitized?.effort).toBe(0);
    expect(sanitizeReviewState(null)).toBeNull();
    expect(sanitizeReviewState("x")).toBeNull();
  });

  test("stored v1 maps are migrated on read", () => {
    storage().setItem(
      REVIEWS_STORAGE_KEY,
      JSON.stringify({
        "la-1": {
          ease: 1.7,
          interval: 14,
          due: "2026-10-02",
          reps: 3,
          lapses: 2,
          lastGrade: 3,
        },
      }),
    );
    const read = readReviews();
    expect(read["la-1"].v).toBe(2);
    expect(read["la-1"].S).toBe(14);
    expect(read["la-1"].D).toBe(6.6);
    expect(read["la-1"].effort).toBe(0.6);
    expect(read["la-1"].due).toBe("2026-10-02");

    const parsed = parseReviewMap(JSON.stringify(read));
    expect(parsed["la-1"]).toEqual(read["la-1"]);
  });

  test("gradeReview persists through the store and is readable", () => {
    const stored = gradeReview("la-1", 5, FIXED_NOW);
    expect(stored.reps).toBe(1);
    expect(stored.interval).toBe(4);
    expect(stored.due).toBe("2026-01-18");
    const readBack = readReviews();
    expect(readBack["la-1"]?.due).toBe("2026-01-18");
    expect(readBack["la-1"]?.lastGrade).toBe(5);
    close(readBack["la-1"]?.S, 4.232585481879205, 9);
  });

  test("REVIEWS_SPEC is the sync seam contract for the reviews store", () => {
    expect(REVIEWS_SPEC.id).toBe("reviews");
    expect(REVIEWS_SPEC.storageKey).toBe("deepforge:reviews:v1");
    expect(REVIEWS_SPEC.parse(null)).toEqual({});
    expect(REVIEWS_SPEC.empty()).toEqual({});
    expect(
      REVIEWS_SPEC.parse(
        JSON.stringify({
          a: { ease: 2.5, interval: 6, due: "2026-01-20", reps: 2, lapses: 0, lastGrade: 4 },
        }),
      ).a.v,
    ).toBe(2);
  });
});

/* ───────────────────────── remote merge (optional sync) ────────────────── */

describe("remote merge (optional sync)", () => {
  test("keeps the newer entry per problem and unions keys", () => {
    const local: ReviewMap = {
      a: state({ reps: 1, lastReviewedAt: ISO(2026, 0, 12) }),
      b: state({ reps: 2 }),
    };
    const remote: ReviewMap = {
      a: state({ reps: 3, lastReviewedAt: ISO(2026, 0, 13) }),
      c: state({ reps: 1 }),
    };
    const merged = mergeReviews(local, remote);
    expect(merged["a"].reps).toBe(3);
    expect(merged["a"].v).toBe(2);
    expect(typeof merged["a"].S).toBe("number");
    expect(merged["b"].reps).toBe(2);
    expect(merged["c"].reps).toBe(1);
  });

  test("the LGS triple travels atomically with the winning record", () => {
    const local: ReviewMap = {
      a: state({
        reps: 4,
        lastReviewedAt: ISO(2026, 0, 13),
        v: 2,
        S: 7,
        D: 3,
        effort: 0.2,
      }),
    };
    const remote: ReviewMap = {
      a: state({
        reps: 9,
        lastReviewedAt: ISO(2026, 0, 12),
        v: 2,
        S: 99,
        D: 9,
        effort: 0.9,
      }),
    };
    const merged = mergeReviews(local, remote);
    expect(merged["a"].reps).toBe(4);
    expect(merged["a"].S).toBe(7);
    expect(merged["a"].D).toBe(3);
    expect(merged["a"].effort).toBe(0.2);
  });

  test("ties keep local and malformed payloads are dropped", () => {
    const local: ReviewMap = { a: state({ reps: 4 }) };
    const remote = {
      a: { reps: 9, due: "2026-01-14", ease: 2.5, interval: 6, lapses: 0, lastGrade: 5, lastReviewedAt: null },
      bad: "not-a-state",
    } as unknown as ReviewMap;
    const merged = mergeReviews(local, remote);
    expect(merged["a"].reps).toBe(4);
    expect(merged["bad"]).toBeUndefined();
  });
});
