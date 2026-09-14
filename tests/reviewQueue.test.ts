import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { ProblemMeta } from "@/data/problems/problem-meta";
import {
  CLEAN_PASS,
  deriveReviews,
  dueReviews,
  getReviewBucketCounts,
  getReviewMap,
  gradeReview,
  gradeReviewState,
  interleaveByCategory,
  nextDueDate,
  parseReviewMap,
  pickWeakArea,
  qualityFromRun,
  readReviews,
  REVIEWS_SPEC,
  sanitizeReviewState,
  weakCategories,
  type ReviewMap,
  type ReviewState,
} from "@/lib/reviewQueue";
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

const AT = (year: number, month: number, day: number): Date =>
  new Date(year, month, day, 12, 0, 0, 0);

const FIXED_NOW = AT(2026, 0, 14);
const ISO = (year: number, month: number, day: number): string =>
  AT(year, month, day).toISOString();

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

function gradeLadder(
  start: ReviewState | undefined,
  qualities: (0 | 3 | 4 | 5)[],
  now: Date = FIXED_NOW,
): ReviewState {
  let current = start;
  for (const quality of qualities) {
    current = gradeReviewState(current, quality, now);
  }
  return current as ReviewState;
}

describe("SM-2 intervals", () => {
  test("three clean passes give 1, 6, then round(6 * ease)", () => {
    const first = gradeReviewState(undefined, 5, FIXED_NOW);
    expect(first.interval).toBe(1);
    expect(first.reps).toBe(1);
    expect(first.lapses).toBe(0);
    expect(first.ease).toBe(2.6);
    expect(first.due).toBe("2026-01-15");
    expect(first.lastGrade).toBe(5);
    expect(first.lastReviewedAt).toBe(FIXED_NOW.toISOString());

    const second = gradeReviewState(first, 5, FIXED_NOW);
    expect(second.interval).toBe(6);
    expect(second.reps).toBe(2);
    expect(second.ease).toBe(2.7);
    expect(second.due).toBe("2026-01-20");

    const third = gradeReviewState(second, 5, FIXED_NOW);
    expect(third.interval).toBe(16);
    expect(third.reps).toBe(3);
    expect(third.ease).toBe(2.8);
    expect(third.due).toBe("2026-01-30");

    const fourth = gradeReviewState(third, 5, FIXED_NOW);
    expect(fourth.interval).toBe(45);
    expect(fourth.ease).toBe(2.8);
  });

  test("quality 4 keeps ease, quality 3 lowers it", () => {
    const four = gradeReviewState(undefined, 4, FIXED_NOW);
    expect(four.ease).toBe(2.5);
    const three = gradeReviewState(four, 3, FIXED_NOW);
    expect(three.ease).toBe(2.36);
    expect(three.interval).toBe(6);
  });

  test("a lapse resets the interval and increments lapses", () => {
    const learned = gradeLadder(undefined, [5, 5]);
    expect(learned.reps).toBe(2);

    const failed = gradeReviewState(learned, 0, FIXED_NOW);
    expect(failed.interval).toBe(1);
    expect(failed.reps).toBe(0);
    expect(failed.lapses).toBe(1);
    expect(failed.ease).toBe(2.5);
    expect(failed.due).toBe("2026-01-15");
    expect(failed.lastGrade).toBe(0);

    const recovered = gradeReviewState(failed, 5, FIXED_NOW);
    expect(recovered.interval).toBe(1);
    expect(recovered.reps).toBe(1);
    expect(recovered.lapses).toBe(1);
  });

  test("ease stays clamped to the [1.3, 2.8] band", () => {
    const low = gradeLadder(undefined, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(low.ease).toBe(1.3);
    expect(low.lapses).toBe(10);

    const high = gradeLadder(undefined, [5, 5, 5, 5, 5, 5, 5, 5, 5, 5]);
    expect(high.ease).toBe(2.8);
    expect(high.reps).toBe(10);
  });

  test("steps whole calendar days across a month/DST boundary", () => {
    const march = AT(2026, 2, 7);
    const first = gradeReviewState(undefined, 5, march);
    expect(first.due).toBe("2026-03-08");
    const second = gradeReviewState(first, 5, AT(2026, 2, 8));
    expect(second.due).toBe("2026-03-14");
  });

  test("qualityFromRun maps the run harness ladder", () => {
    expect(qualityFromRun({ passed: true })).toBe(5);
    expect(qualityFromRun({ passed: true, failedRuns: 0 })).toBe(5);
    expect(qualityFromRun({ passed: true, failedRuns: 3 })).toBe(4);
    expect(qualityFromRun({ passed: true, failedRuns: 2, resetBeforePass: true })).toBe(3);
    expect(qualityFromRun({ passed: false, failedRuns: 5 })).toBe(0);
  });
});

describe("deriveReviews (solvedAt → schedule)", () => {
  test("seeds a solved problem with a one-day first interval", () => {
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
    expect(reviewed["la-1"].interval).toBe(1);
    expect(reviewed["la-1"].due).toBe("2026-01-13");
    expect(reviewed["la-1"].lastGrade).toBe(CLEAN_PASS);
    expect(reviewed["la-1"].lastReviewedAt).toBe(ISO(2026, 0, 12));
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

  test("sorts by ease, then due date, then difficulty, then id", () => {
    const reviews: ReviewMap = {
      "la-1": state({ reps: 1, ease: 2.5 }),
      "la-2": state({ reps: 1, ease: 1.4 }),
      "la-3": state({ reps: 1, ease: 2.5 }),
      "ca-1": state({ reps: 1, ease: 2.5 }),
    };
    const queue = dueReviews(reviews, META_BY_ID, FIXED_NOW);
    expect(queue.map((item) => item.id)).toEqual([
      "la-2", // lowest ease first
      "ca-1", // interleave category before repeating Linear Algebra
      "la-1", // Easy beats Medium at equal ease/due
      "la-3",
    ]);
  });

  test("weak categories (lapses) jump the queue, then interleave", () => {
    const reviews: ReviewMap = {
      "la-1": state({ reps: 1, ease: 1.4 }),
      "la-2": state({ reps: 1, ease: 1.4 }),
      "ca-1": state({ reps: 1, ease: 2.5, lapses: 3 }),
      "ca-2": state({ reps: 1, ease: 2.5, lapses: 3 }),
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

  test("same state yields the same queue regardless of key insertion order", () => {
    const forward: ReviewMap = {
      "la-1": state({ reps: 1 }),
      "ca-1": state({ reps: 1 }),
      "st-1": state({ reps: 1 }),
    };
    const reverse: ReviewMap = {
      "st-1": state({ reps: 1 }),
      "ca-1": state({ reps: 1 }),
      "la-1": state({ reps: 1 }),
    };
    const first = dueReviews(forward, META_BY_ID, FIXED_NOW).map((i) => i.id);
    const second = dueReviews(reverse, META_BY_ID, FIXED_NOW).map((i) => i.id);
    expect(second).toEqual(first);
    expect(dueReviews(reverse, META_BY_ID, FIXED_NOW).map((i) => i.id)).toEqual(first);
  });
});

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

describe("store and parsing", () => {
  test("invalid payloads read as an empty map", () => {
    const storage = (globalScope.window as { localStorage: Storage }).localStorage;
    storage.setItem("deepforge:reviews:v1", "{not json");
    expect(readReviews()).toEqual({});
    expect(parseReviewMap(null)).toEqual({});
    expect(parseReviewMap("[]")).toEqual({});
    expect(parseReviewMap('"nope"')).toEqual({});
  });

  test("getReviewMap is a pure read that never seeds the store", () => {
    const storage = (globalScope.window as { localStorage: Storage }).localStorage;
    expect(getReviewMap(FIXED_NOW)).toEqual({});
    expect(storage.getItem("deepforge:reviews:v1")).toBeNull();
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
    expect(sanitizeReviewState(null)).toBeNull();
    expect(sanitizeReviewState("x")).toBeNull();
  });

  test("gradeReview persists through the store and is readable", () => {
    const stored = gradeReview("la-1", 5, FIXED_NOW);
    expect(stored.reps).toBe(1);
    expect(stored.due).toBe("2026-01-15");
    const readBack = readReviews();
    expect(readBack["la-1"]?.due).toBe("2026-01-15");
    expect(readBack["la-1"]?.lastGrade).toBe(5);
  });

  test("REVIEWS_SPEC is the sync seam contract for the reviews store", () => {
    expect(REVIEWS_SPEC.id).toBe("reviews");
    expect(REVIEWS_SPEC.storageKey).toBe("deepforge:reviews:v1");
    expect(REVIEWS_SPEC.parse(null)).toEqual({});
    expect(REVIEWS_SPEC.empty()).toEqual({});
  });
});

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
    expect(merged["b"].reps).toBe(2);
    expect(merged["c"].reps).toBe(1);
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
