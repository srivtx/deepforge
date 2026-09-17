import { describe, expect, test } from "bun:test";
import type { ProblemMeta } from "@/data/problems/problem-meta";
import { getDailyDateKey } from "@/lib/daily";
import {
  cramQueue,
  CRAM_SIZE,
  dayKey,
  FORECAST_DAYS,
  forecastDue,
  health,
  leeches,
  LEECH_MIN_LAPSES,
} from "@/lib/reviewPlan";
import type { ReviewMap, ReviewState } from "@/lib/reviewQueue";

/** Fixed local clock used by every test in this file. */
const NOW = new Date("2026-09-18T10:00:00");

function state(overrides: Partial<ReviewState> = {}): ReviewState {
  return {
    ease: 2.5,
    interval: 1,
    due: "2026-09-18",
    reps: 0,
    lapses: 0,
    lastGrade: null,
    lastReviewedAt: null,
    ...overrides,
  };
}

const META: ProblemMeta[] = [
  { id: "la-1", title: "Matrix Product", category: "Linear Algebra", difficulty: "Medium" },
  { id: "la-2", title: "Vector Norm", category: "Linear Algebra", difficulty: "Easy" },
  { id: "ca-1", title: "Derivative", category: "Calculus", difficulty: "Easy" },
  { id: "ca-2", title: "Integral", category: "Calculus", difficulty: "Hard" },
  { id: "st-1", title: "Sample Mean", category: "Statistics", difficulty: "Easy" },
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
      "la-1": state({ due: "2026-09-10" }),
      "ca-1": state({ due: "2026-09-18" }),
      "ca-2": state({ due: "2026-09-19" }),
      "st-1": state({ due: "2026-10-05" }),
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
});

describe("leeches", () => {
  const reviews: ReviewMap = {
    "la-1": state({ due: "2026-09-10", lapses: 4 }),
    "la-2": state({ due: "2026-09-12", lapses: 2 }),
    "ca-1": state({ due: "2026-09-13", lapses: 4 }),
    "ca-2": state({ due: "2026-09-11", lapses: 4 }),
    "st-1": state({ due: "2026-09-15", lapses: 5 }),
  };

  test("keeps the minLapses boundary: 2 excluded, 3 included", () => {
    expect(leeches(reviews, META_BY_ID)).toHaveLength(4);
    expect(
      leeches(reviews, META_BY_ID).some((item) => item.id === "la-2"),
    ).toBe(false);
    expect(leeches(reviews, META_BY_ID, 2)).toHaveLength(5);
    expect(LEECH_MIN_LAPSES).toBe(3);
  });

  test("sorts lapses desc, then most overdue, then id", () => {
    expect(leeches(reviews, META_BY_ID).map((item) => item.id)).toEqual([
      "st-1",
      "la-1",
      "ca-2",
      "ca-1",
    ]);
  });

  test("skips unknown ids and links through the problem href helper", () => {
    const unknown = leeches(
      { "ghost-1": state({ lapses: 9 }) },
      META_BY_ID,
    );
    expect(unknown).toEqual([]);
    expect(leeches(reviews, META_BY_ID)[0].href).toBe(
      "/problems/st-1?from=%2Freview",
    );
  });
});

describe("cramQueue", () => {
  test("is deterministic across insertion order and repeated calls", () => {
    const forward: ReviewMap = {
      "la-1": state({ due: "2026-09-08" }),
      "ca-1": state({ due: "2026-09-15", lapses: 2 }),
      "ca-2": state({ due: "2026-09-16", lapses: 1 }),
    };
    const reverse: ReviewMap = {
      "ca-2": state({ due: "2026-09-16", lapses: 1 }),
      "ca-1": state({ due: "2026-09-15", lapses: 2 }),
      "la-1": state({ due: "2026-09-08" }),
    };
    const first = cramQueue(forward, META_BY_ID, NOW);
    expect(first).toEqual(cramQueue(reverse, META_BY_ID, NOW));
    expect(first).toEqual(cramQueue(forward, META_BY_ID, NOW));
    expect(first).toHaveLength(3);
  });

  test("puts the most overdue item first with a human reason", () => {
    const reviews: ReviewMap = {
      "ca-1": state({ due: "2026-09-12" }),
      "la-1": state({ due: "2026-09-08" }),
      "la-2": state({ due: "2026-09-10" }),
    };
    const queue = cramQueue(reviews, META_BY_ID, NOW);
    expect(queue[0].id).toBe("la-1");
    expect(queue[0].overdueDays).toBe(10);
    expect(queue[0].why).toBe("Overdue 10 days");
    expect(queue.every((item) => item.why.length > 0)).toBe(true);
    expect(queue[0].href).toBe("/problems/la-1?from=%2Freview");
  });

  test("fills from the weakest categories when nothing is due", () => {
    const reviews: ReviewMap = {
      "ca-1": state({ due: "2026-09-25", lapses: 2 }),
      "ca-2": state({ due: "2026-09-26", lapses: 1 }),
      "la-1": state({ due: "2026-09-25", lapses: 0 }),
    };
    const queue = cramQueue(reviews, META_BY_ID, NOW);
    expect(queue.map((item) => item.id)).toEqual(["ca-1", "ca-2"]);
    expect(queue[0].why).toBe("Weak area: Calculus");
  });

  test("respects size, interleaves categories, and handles empty input", () => {
    const reviews: ReviewMap = {
      "la-1": state({ due: "2026-09-08" }),
      "la-2": state({ due: "2026-09-09" }),
      "ca-1": state({ due: "2026-09-10" }),
      "ca-2": state({ due: "2026-09-11" }),
      "st-1": state({ due: "2026-09-12" }),
    };
    const queue = cramQueue(reviews, META_BY_ID, NOW, 3);
    expect(queue).toHaveLength(3);
    for (let i = 1; i < queue.length; i += 1) {
      expect(queue[i].category).not.toBe(queue[i - 1].category);
    }
    expect(cramQueue({}, META_BY_ID, NOW)).toEqual([]);
    expect(CRAM_SIZE).toBe(10);
  });
});

describe("health", () => {
  test("totals due, overdue, next 7 days, and tracked problems", () => {
    const reviews: ReviewMap = {
      a: state({ due: "2026-09-10" }),
      b: state({ due: "2026-09-18" }),
      c: state({ due: "2026-09-25" }),
      d: state({ due: "2026-09-26" }),
      e: state({ due: "2026-10-10" }),
    };
    const summary = health(reviews, NOW);
    expect(summary.due).toBe(2);
    expect(summary.overdue).toBe(1);
    expect(summary.dueNext7).toBe(1);
    expect(summary.totalTracked).toBe(5);
  });

  test("retention is null with nothing graded, honest otherwise", () => {
    const ungraded: ReviewMap = { "la-1": state({ due: "2026-09-20" }) };
    expect(health(ungraded, NOW).retention).toBeNull();

    const graded: ReviewMap = {
      a: state({ due: "2026-09-10", lastGrade: 5 }),
      b: state({ due: "2026-09-18", lastGrade: 0 }),
      c: state({ due: "2026-09-25", lastGrade: null }),
      d: state({ due: "2026-09-26", lastGrade: 4 }),
      e: state({ due: "2026-10-10", lastGrade: null }),
    };
    expect(health(graded, NOW).retention).toBe(67);
  });

  test("ignores corrupt entries instead of throwing", () => {
    const corrupt = {
      "la-1": state({ due: "2026-09-10", lapses: 4 }),
      "la-2": state({ due: "2026-09-12", lapses: Number.NaN }),
      brokenNull: null,
      brokenString: "nope",
      brokenDate: state({ due: "2026-02-30" }),
    } as unknown as ReviewMap;

    const summary = health(corrupt, NOW);
    expect(summary.totalTracked).toBe(2);
    expect(summary.overdue).toBe(2);
    expect(health(corrupt, NOW).retention).toBeNull();

    expect(leeches(corrupt, META_BY_ID).map((item) => item.id)).toEqual([
      "la-1",
    ]);
    expect(forecastDue(corrupt, NOW)[0].count).toBe(2);
    expect(cramQueue(corrupt, META_BY_ID, NOW).length).toBeGreaterThan(0);
  });
});
