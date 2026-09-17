import { describe, expect, test } from "bun:test";
import type { ProblemMeta } from "@/data/problems/problem-meta";
import { getDailyDateKey } from "@/lib/daily";
import {
  lgsRetrievability,
  migrateReviewState,
  type LgsLegacyFields,
  type LgsState,
} from "@/lib/lgs";
import {
  cramQueue,
  CRAM_SIZE,
  dayKey,
  dueReviewQueue,
  FORECAST_DAYS,
  forecastDue,
  health,
  leeches,
  LEECH_MIN_LAPSES,
} from "@/lib/reviewPlan";
import { REVIEW_DAILY_LIMIT, type ReviewMap } from "@/lib/reviewQueue";

/** Fixed local clock used by every September test in this file. */
const NOW = new Date("2026-09-18T10:00:00");
const TODAY_KEY = getDailyDateKey(NOW);
/** The blueprint's P4a clock (A due yesterday, B ten days overdue). */
const P4_NOW = new Date("2026-01-14T12:00:00");

/** A valid v2 record with every field explicit. */
function v2(overrides: Partial<LgsState> = {}): LgsState {
  return {
    ease: 2.5,
    interval: 1,
    due: TODAY_KEY,
    reps: 0,
    lapses: 0,
    lastGrade: null,
    lastReviewedAt: null,
    v: 2,
    S: 1,
    D: 5,
    effort: 0,
    ...overrides,
  };
}

/** A v1 record: no v/S/D/effort, exactly the seven stored legacy fields. */
function v1(overrides: Partial<LgsLegacyFields> = {}): LgsLegacyFields {
  return {
    ease: 2.5,
    interval: 1,
    due: TODAY_KEY,
    reps: 0,
    lapses: 0,
    lastGrade: null,
    lastReviewedAt: null,
    ...overrides,
  };
}

/** Migrate every value of a map, dropping anything that cannot be used. */
function migrated(reviews: ReviewMap, key = TODAY_KEY): ReviewMap {
  const out: ReviewMap = {};
  for (const [id, raw] of Object.entries(reviews)) {
    const state = migrateReviewState(raw, key);
    if (state) out[id] = state;
  }
  return out;
}

function close(actual: number, expected: number, precision: number): void {
  expect(Math.abs(actual - expected)).toBeLessThan(0.5 * 10 ** -precision);
}

const META: ProblemMeta[] = [
  { id: "la-1", title: "Matrix Product", category: "Linear Algebra", difficulty: "Medium" },
  { id: "la-2", title: "Vector Norm", category: "Linear Algebra", difficulty: "Easy" },
  { id: "ca-1", title: "Derivative", category: "Calculus", difficulty: "Easy" },
  { id: "ca-2", title: "Integral", category: "Calculus", difficulty: "Hard" },
  { id: "st-1", title: "Sample Mean", category: "Statistics", difficulty: "Easy" },
  { id: "hi-1", title: "Deep Item", category: "Linear Algebra", difficulty: "Hard" },
  { id: "lo-1", title: "Shaky Item", category: "Calculus", difficulty: "Easy" },
];
const META_BY_ID = new Map(META.map((problem) => [problem.id, problem]));

describe("dayKey", () => {
  test("matches reviewQueue's local-day semantics exactly", () => {
    expect(dayKey(NOW)).toBe("2026-09-18");
    expect(dayKey(NOW)).toBe(getDailyDateKey(NOW));
    expect(dayKey(new Date("2026-01-01T00:30:00"))).toBe("2026-01-01");
    expect(dayKey(new Date("2026-12-31T23:30:00"))).toBe("2026-12-31");
  });
});

describe("forecastDue", () => {
  test("covers today plus the next 13 local days by default", () => {
    const forecast = forecastDue({}, NOW);
    expect(forecast).toHaveLength(14);
    expect(forecast).toHaveLength(FORECAST_DAYS);
    expect(forecast[0].key).toBe("2026-09-18");
    expect(forecast[13].key).toBe("2026-10-01");
    expect(forecast[0].label).toBe(
      new Date(2026, 8, 18).toLocaleDateString(undefined, {
        weekday: "short",
      }),
    );
  });

  test("folds overdue items into today and counts only tracked problems", () => {
    const reviews: ReviewMap = {
      "la-1": v2({ due: "2026-09-10", reps: 3 }),
      "ca-1": v2({ due: "2026-09-18" }),
      "ca-2": v2({ due: "2026-09-19" }),
      "st-1": v2({ due: "2026-10-05" }),
    };
    const forecast = forecastDue(reviews, NOW);
    expect(forecast[0].key).toBe("2026-09-18");
    expect(forecast[0].count).toBe(2);
    expect(forecast[0].overdue).toBe(1);
    expect(forecast[1].key).toBe("2026-09-19");
    expect(forecast[1].count).toBe(1);
    expect(forecast[1].overdue).toBe(0);
    expect(forecast.reduce((sum, day) => sum + day.count, 0)).toBe(3);
    expect(forecastDue(reviews, NOW, 1)).toHaveLength(1);
    expect(forecastDue(reviews, NOW, 0)).toEqual([]);
  });

  test("migrates v1 records without moving their due keys", () => {
    const records: ReviewMap = {
      "la-1": v1({
        ease: 1.7,
        interval: 14,
        due: "2026-09-10",
        reps: 3,
        lapses: 2,
        lastGrade: 3,
      }),
      "ca-1": v1({ ease: 2.5, interval: 1, due: "2026-09-20" }),
    };
    const forecast = forecastDue(records, NOW);
    expect(forecast[0].count).toBe(1);
    expect(forecast[0].overdue).toBe(1);
    expect(forecast[2].key).toBe("2026-09-20");
    expect(forecast[2].count).toBe(1);
    expect(forecastDue(migrated(records), NOW)).toEqual(forecast);
  });

  test("heals sparse records through migration instead of dropping them", () => {
    const sparse = { "la-1": { due: "2026-09-10" } } as unknown as ReviewMap;
    const forecast = forecastDue(sparse, NOW);
    expect(forecast[0].count).toBe(1);
    expect(forecast[0].overdue).toBe(1);

    const empty = { "la-1": {} } as unknown as ReviewMap;
    const healed = forecastDue(empty, NOW);
    expect(healed[0].count).toBe(1);
    expect(healed[0].overdue).toBe(0);
  });

  test("ignores non-object entries at the normalization choke point", () => {
    const corrupt = {
      a: null,
      b: "nope",
      c: 7,
      d: [],
      e: true,
    } as unknown as ReviewMap;
    const forecast = forecastDue(corrupt, NOW);
    expect(forecast.every((day) => day.count === 0)).toBe(true);
  });
});

describe("leeches", () => {
  const reviews: ReviewMap = {
    "la-1": v2({ due: "2026-09-10", lapses: 4 }),
    "la-2": v2({ due: "2026-09-12", lapses: 2 }),
    "ca-1": v2({ due: "2026-09-13", lapses: 4 }),
    "ca-2": v2({ due: "2026-09-11", lapses: 4 }),
    "st-1": v2({ due: "2026-09-15", lapses: 5 }),
  };

  test("keeps the minLapses boundary: 2 excluded, 3 included", () => {
    expect(leeches(reviews, META_BY_ID)).toHaveLength(4);
    expect(
      leeches(reviews, META_BY_ID).some((item) => item.id === "la-2"),
    ).toBe(false);
    expect(leeches(reviews, META_BY_ID, 2)).toHaveLength(5);
    expect(LEECH_MIN_LAPSES).toBe(3);
  });

  test("keeps the lapses-first order: lapses desc, then due, then id", () => {
    expect(leeches(reviews, META_BY_ID).map((item) => item.id)).toEqual([
      "st-1",
      "la-1",
      "ca-2",
      "ca-1",
    ]);
  });

  test("skips unknown ids and links through the problem href helper", () => {
    const unknown = leeches({ "ghost-1": v2({ lapses: 9 }) }, META_BY_ID);
    expect(unknown).toEqual([]);
    expect(leeches(reviews, META_BY_ID)[0].href).toBe(
      "/problems/st-1?from=%2Freview",
    );
  });

  test("reads lapses from v1 records after migration", () => {
    const legacy: ReviewMap = {
      "la-1": v1({
        ease: 1.7,
        interval: 14,
        due: "2026-09-10",
        reps: 3,
        lapses: 4,
        lastGrade: 0,
      }),
    };
    expect(leeches(legacy, META_BY_ID)).toEqual([
      {
        id: "la-1",
        title: "Matrix Product",
        href: "/problems/la-1?from=%2Freview",
        lapses: 4,
        dueKey: "2026-09-10",
      },
    ]);
  });

  test("ignores corrupt entries instead of throwing", () => {
    const corrupt = {
      "la-1": v2({ due: "2026-09-10", lapses: 4 }),
      "la-2": v2({ due: "2026-09-12", lapses: Number.NaN }),
      brokenNull: null,
      brokenString: "nope",
      brokenDate: v2({ due: "2026-02-30" }),
    } as unknown as ReviewMap;
    expect(leeches(corrupt, META_BY_ID).map((item) => item.id)).toEqual([
      "la-1",
    ]);
  });
});

describe("cramQueue", () => {
  test("is deterministic across insertion order and repeated calls", () => {
    const forward: ReviewMap = {
      "la-1": v2({ due: "2026-09-08" }),
      "ca-1": v2({ due: "2026-09-15", lapses: 2 }),
      "ca-2": v2({ due: "2026-09-16", lapses: 1 }),
    };
    const reverse: ReviewMap = {
      "ca-2": v2({ due: "2026-09-16", lapses: 1 }),
      "ca-1": v2({ due: "2026-09-15", lapses: 2 }),
      "la-1": v2({ due: "2026-09-08" }),
    };
    const first = cramQueue(forward, META_BY_ID, NOW);
    expect(first).toEqual(cramQueue(reverse, META_BY_ID, NOW));
    expect(first).toEqual(cramQueue(forward, META_BY_ID, NOW));
    expect(first).toHaveLength(3);
  });

  test("P4a: the item with lower predicted recall sorts first", () => {
    const reviews: ReviewMap = {
      "la-1": v2({ S: 100, interval: 100, due: "2026-01-13", reps: 1 }),
      "ca-1": v2({ S: 3, interval: 3, due: "2026-01-04", reps: 1 }),
    };
    const queue = cramQueue(reviews, META_BY_ID, P4_NOW);
    expect(queue.map((item) => item.id)).toEqual(["ca-1", "la-1"]);
    close(queue[0].retrievability, 0.77441687, 5);
    close(queue[1].retrievability, 0.89931494, 5);
  });

  test("moves the shakiest item ahead of the most overdue one", () => {
    const reviews: ReviewMap = {
      "hi-1": v2({ S: 400, interval: 400, due: "2026-09-01", reps: 2 }),
      "lo-1": v2({ S: 1, interval: 1, due: "2026-09-17", reps: 1 }),
    };
    const queue = cramQueue(reviews, META_BY_ID, NOW);
    expect(queue.map((item) => item.id)).toEqual(["lo-1", "hi-1"]);
    expect(queue[0].retrievability).toBeLessThan(queue[1].retrievability);
    expect(queue[0].overdueDays).toBe(1);
    expect(queue[1].overdueDays).toBe(17);
  });

  test("keeps the human why strings and review links", () => {
    const reviews: ReviewMap = {
      "la-1": v2({ due: "2026-09-08", reps: 1 }),
      "ca-1": v2({ due: "2026-09-12", reps: 1 }),
    };
    const queue = cramQueue(reviews, META_BY_ID, NOW);
    expect(queue[0].id).toBe("la-1");
    expect(queue[0].overdueDays).toBe(10);
    expect(queue[0].why).toBe("Overdue 10 days");
    expect(queue[0].href).toBe("/problems/la-1?from=%2Freview");
    expect(queue[1].why).toBe("Overdue 6 days");
    expect(queue.every((item) => item.why.length > 0)).toBe(true);
  });

  test("fills from the weakest categories when nothing is due", () => {
    const reviews: ReviewMap = {
      "ca-1": v2({ due: "2026-09-25", lapses: 2 }),
      "ca-2": v2({ due: "2026-09-26", lapses: 1 }),
      "la-1": v2({ due: "2026-09-25", lapses: 0 }),
    };
    const queue = cramQueue(reviews, META_BY_ID, NOW);
    expect(queue.map((item) => item.id)).toEqual(["ca-1", "ca-2"]);
    expect(queue[0].why).toBe("Weak area: Calculus");
  });

  test("respects size, interleaves categories, and handles empty input", () => {
    const reviews: ReviewMap = {
      "la-1": v2({ due: "2026-09-08" }),
      "la-2": v2({ due: "2026-09-09" }),
      "ca-1": v2({ due: "2026-09-10" }),
      "ca-2": v2({ due: "2026-09-11" }),
      "st-1": v2({ due: "2026-09-12" }),
    };
    const queue = cramQueue(reviews, META_BY_ID, NOW, 3);
    expect(queue).toHaveLength(3);
    for (let i = 1; i < queue.length; i += 1) {
      expect(queue[i].category).not.toBe(queue[i - 1].category);
    }
    expect(queue.map((item) => item.id)).toEqual(["la-1", "ca-1", "la-2"]);
    expect(cramQueue({}, META_BY_ID, NOW)).toEqual([]);
    expect(cramQueue(reviews, META_BY_ID, NOW, 0)).toEqual([]);
    expect(CRAM_SIZE).toBe(10);
  });

  test("flags struggle from the effort channel, including v1 migration", () => {
    const reviews: ReviewMap = {
      "la-1": v2({ due: "2026-09-10", reps: 1, S: 10, interval: 10, effort: 0.6 }),
      "ca-1": v2({ due: "2026-09-11", reps: 1, S: 10, interval: 10, effort: 0.59 }),
      "ca-2": v1({
        ease: 2.5,
        interval: 10,
        due: "2026-09-12",
        reps: 1,
        lastGrade: 0,
      }),
      "st-1": v1({
        ease: 2.5,
        interval: 10,
        due: "2026-09-13",
        reps: 1,
        lastGrade: 3,
      }),
    };
    const byId = new Map(
      cramQueue(reviews, META_BY_ID, NOW).map((item) => [item.id, item]),
    );
    expect(byId.get("la-1")?.struggle).toBe(true);
    expect(byId.get("ca-1")?.struggle).toBe(false);
    expect(byId.get("ca-2")?.struggle).toBe(true);
    expect(byId.get("st-1")?.struggle).toBe(true);
  });

  test("v1 and migrated v2 inputs produce identical queues", () => {
    const legacy: ReviewMap = {
      "la-1": v1({
        ease: 1.7,
        interval: 14,
        due: "2026-09-10",
        reps: 3,
        lapses: 2,
        lastGrade: 3,
      }),
      "ca-1": v1({ ease: 2.5, interval: 1, due: "2026-09-18" }),
      "ca-2": v1({ ease: 2.8, interval: 30, due: "2026-09-12", reps: 2 }),
    };
    expect(cramQueue(legacy, META_BY_ID, NOW)).toEqual(
      cramQueue(migrated(legacy), META_BY_ID, NOW),
    );
  });

  test("ignores corrupt entries instead of throwing", () => {
    const corrupt = {
      "la-1": v2({ due: "2026-09-10", lapses: 4 }),
      "la-2": v2({ due: "2026-09-12", lapses: Number.NaN }),
      brokenNull: null,
      brokenString: "nope",
      brokenDate: v2({ due: "2026-02-30" }),
    } as unknown as ReviewMap;
    const queue = cramQueue(corrupt, META_BY_ID, NOW);
    expect(queue.map((item) => item.id)).toEqual(["la-1", "la-2"]);
    expect(queue.every((item) => Number.isFinite(item.retrievability))).toBe(
      true,
    );
  });
});

describe("dueReviewQueue", () => {
  test("returns only items due today or earlier", () => {
    const reviews: ReviewMap = {
      "la-1": v2({ due: "2026-09-18", reps: 1 }),
      "ca-1": v2({ due: "2026-09-19", reps: 1 }),
      "ca-2": v2({ due: "2026-09-25", reps: 1, lapses: 5 }),
    };
    expect(dueReviewQueue(reviews, META_BY_ID, NOW).map((i) => i.id)).toEqual([
      "la-1",
    ]);
    expect(
      cramQueue(reviews, META_BY_ID, NOW).some((i) => i.id === "ca-2"),
    ).toBe(true);
  });

  test("P4a: v1 records resolve S and put the lower-recall item first", () => {
    const records: ReviewMap = {
      "la-1": v1({
        ease: 2.5,
        interval: 100,
        due: "2026-01-13",
        reps: 1,
        lastGrade: 5,
      }),
      "ca-1": v1({
        ease: 2.5,
        interval: 3,
        due: "2026-01-04",
        reps: 1,
        lastGrade: 5,
      }),
    };
    expect(
      dueReviewQueue(records, META_BY_ID, P4_NOW).map((item) => item.id),
    ).toEqual(["ca-1", "la-1"]);
    expect(dueReviewQueue(records, META_BY_ID, P4_NOW)).toEqual(
      dueReviewQueue(migrated(records, "2026-01-14"), META_BY_ID, P4_NOW),
    );
  });

  test("caps at the daily review limit and never repeats a category", () => {
    const reviews: ReviewMap = {};
    const manyMeta = new Map<string, ProblemMeta>();
    for (let i = 0; i < 12; i += 1) {
      const item: ProblemMeta =
        i % 2 === 0
          ? {
              id: `la-x-${i}`,
              title: `LA ${i}`,
              category: "Linear Algebra",
              difficulty: "Easy",
            }
          : {
              id: `ca-x-${i}`,
              title: `CA ${i}`,
              category: "Calculus",
              difficulty: "Easy",
            };
      reviews[item.id] = v2({ reps: 1 });
      manyMeta.set(item.id, item);
    }
    const queue = dueReviewQueue(reviews, manyMeta, NOW);
    expect(queue).toHaveLength(REVIEW_DAILY_LIMIT);
    for (let i = 1; i < queue.length; i += 1) {
      expect(queue[i].meta.category).not.toBe(queue[i - 1].meta.category);
    }
    expect(dueReviewQueue(reviews, manyMeta, NOW, 3)).toHaveLength(3);
    expect(dueReviewQueue(reviews, manyMeta, NOW, 0)).toEqual([]);
    expect(dueReviewQueue({}, META_BY_ID, NOW)).toEqual([]);
  });

  test("is insertion-order independent and deterministic", () => {
    const forward: ReviewMap = {
      "la-1": v2({ S: 5, interval: 5, due: "2026-09-15", reps: 1 }),
      "ca-1": v2({ S: 1, interval: 1, due: "2026-09-10", reps: 1 }),
      "st-1": v2({ S: 20, interval: 20, due: "2026-09-17", reps: 1 }),
    };
    const reverse: ReviewMap = {
      "st-1": v2({ S: 20, interval: 20, due: "2026-09-17", reps: 1 }),
      "ca-1": v2({ S: 1, interval: 1, due: "2026-09-10", reps: 1 }),
      "la-1": v2({ S: 5, interval: 5, due: "2026-09-15", reps: 1 }),
    };
    const first = dueReviewQueue(forward, META_BY_ID, NOW).map((i) => i.id);
    expect(dueReviewQueue(reverse, META_BY_ID, NOW).map((i) => i.id)).toEqual(
      first,
    );
    expect(first).toEqual(["ca-1", "la-1", "st-1"]);
    expect(dueReviewQueue(forward, META_BY_ID, NOW)).toEqual(
      dueReviewQueue(forward, META_BY_ID, NOW),
    );
  });
});

describe("health", () => {
  test("totals due, overdue, next 7 days, and tracked problems", () => {
    const reviews: ReviewMap = {
      a: v2({ due: "2026-09-10" }),
      b: v2({ due: "2026-09-18" }),
      c: v2({ due: "2026-09-25" }),
      d: v2({ due: "2026-09-26" }),
      e: v2({ due: "2026-10-10" }),
    };
    const summary = health(reviews, NOW);
    expect(summary.due).toBe(2);
    expect(summary.overdue).toBe(1);
    expect(summary.dueNext7).toBe(1);
    expect(summary.totalTracked).toBe(5);
  });

  test("retention is null with nothing graded, honest otherwise", () => {
    const ungraded: ReviewMap = {
      "la-1": v2({ due: "2026-09-20", S: 14, interval: 14, reps: 3 }),
    };
    expect(health(ungraded, NOW).retention).toBeNull();

    const graded: ReviewMap = {
      a: v2({ due: "2026-09-10", lastGrade: 5 }),
      b: v2({ due: "2026-09-18", lastGrade: 0 }),
      c: v2({ due: "2026-09-25", lastGrade: null }),
      d: v2({ due: "2026-09-26", lastGrade: 4 }),
      e: v2({ due: "2026-10-10", lastGrade: null }),
    };
    expect(health(graded, NOW).retention).toBe(67);

    const legacy: ReviewMap = {
      a: v1({ interval: 14, due: "2026-09-10", reps: 3, lastGrade: 3 }),
    };
    expect(health(legacy, NOW).retention).toBe(100);
  });

  test("meanRetrievability averages the LGS curve and is null when empty", () => {
    expect(health({}, NOW).meanRetrievability).toBeNull();
    const reviews: ReviewMap = {
      a: v2({ S: 10, interval: 10, due: TODAY_KEY, reps: 1 }),
      b: v2({ S: 10, interval: 10, due: "2026-09-08", reps: 1 }),
    };
    const summary = health(reviews, NOW);
    expect(summary.meanRetrievability).not.toBeNull();
    close(
      summary.meanRetrievability as number,
      (lgsRetrievability(reviews.a, NOW) + lgsRetrievability(reviews.b, NOW)) / 2,
      12,
    );
    close(summary.meanRetrievability as number, 0.87294, 5);
    const bothDueToday: ReviewMap = {
      a: v2({ S: 10, interval: 10, due: TODAY_KEY, reps: 1 }),
      b: v2({ S: 1, interval: 1, due: TODAY_KEY }),
    };
    close(health(bothDueToday, NOW).meanRetrievability as number, 0.9, 12);
  });

  test("normalizes corrupt entries instead of throwing", () => {
    const corrupt = {
      "la-1": v2({ due: "2026-09-10", lapses: 4 }),
      "la-2": v2({ due: "2026-09-12", lapses: Number.NaN }),
      brokenNull: null,
      brokenString: "nope",
      brokenDate: v2({ due: "2026-02-30" }),
    } as unknown as ReviewMap;

    const summary = health(corrupt, NOW);
    expect(summary.totalTracked).toBe(3);
    expect(summary.overdue).toBe(2);
    expect(summary.retention).toBeNull();
    expect(Number.isFinite(summary.meanRetrievability)).toBe(true);
    expect(forecastDue(corrupt, NOW)[0].count).toBe(3);
    // The normalized entry has no problem metadata, so the drill skips it
    // while forecast and health still count it.
    expect(cramQueue(corrupt, META_BY_ID, NOW).length).toBe(2);
    expect(forecastDue(corrupt, NOW)[0].overdue).toBe(2);
  });
});

describe("determinism", () => {
  test("two calls on the same inputs are deep-equal", () => {
    const reviews: ReviewMap = {
      "la-1": v2({ S: 30, interval: 30, due: "2026-09-01", reps: 2, lapses: 4 }),
      "ca-1": v1({ ease: 1.7, interval: 6, due: "2026-09-14", reps: 2 }),
      "st-1": v2({ S: 2, interval: 2, due: "2026-09-20", reps: 1, lapses: 0 }),
    };
    expect(cramQueue(reviews, META_BY_ID, NOW)).toEqual(
      cramQueue(reviews, META_BY_ID, NOW),
    );
    expect(dueReviewQueue(reviews, META_BY_ID, NOW)).toEqual(
      dueReviewQueue(reviews, META_BY_ID, NOW),
    );
    expect(forecastDue(reviews, NOW)).toEqual(forecastDue(reviews, NOW));
    expect(leeches(reviews, META_BY_ID)).toEqual(leeches(reviews, META_BY_ID));
    expect(health(reviews, NOW)).toEqual(health(reviews, NOW));
  });
});
