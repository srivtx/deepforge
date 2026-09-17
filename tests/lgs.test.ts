import { describe, expect, test } from "bun:test";
import { getDailyDateKey } from "@/lib/daily";
import {
  LGS_DEFAULTS,
  LGS_VERSION,
  gradeLadderReview,
  ladderPhi,
  lgsElapsedDays,
  lgsIntervalFor,
  lgsResolveFields,
  lgsRetrievability,
  lgsRetrievabilityAt,
  migrateReviewState,
  type LgsLegacyFields,
  type LgsSignal,
  type LgsState,
} from "@/lib/lgs";

const AT = (year: number, month: number, day: number): Date =>
  new Date(year, month, day, 12, 0, 0, 0);
const NOW = AT(2026, 0, 14);
const TODAY = getDailyDateKey(NOW);

function state(overrides: Partial<LgsState> = {}): LgsState {
  return {
    ease: 2.5,
    interval: 10,
    due: TODAY,
    reps: 1,
    lapses: 0,
    lastGrade: 5,
    lastReviewedAt: null,
    v: 2,
    S: 10,
    D: 5,
    effort: 0,
    ...overrides,
  };
}

function signal(
  failedRuns = 0,
  hintTier = 0,
  resetBeforePass = false,
  passed = true,
): LgsSignal {
  return { passed, failedRuns, hintTier, resetBeforePass };
}

function legacy(overrides: Partial<LgsLegacyFields> = {}): LgsLegacyFields {
  return {
    ease: 2.5,
    interval: 10,
    due: TODAY,
    reps: 1,
    lapses: 0,
    lastGrade: 5,
    lastReviewedAt: null,
    ...overrides,
  };
}

function close(actual: number, expected: number, precision: number): void {
  expect(Math.abs(actual - expected)).toBeLessThan(0.5 * 10 ** -precision);
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe("parameter constants", () => {
  test("LGS_VERSION and FSRS-6 defaults are frozen", () => {
    expect(LGS_VERSION).toBe(2);
    expect(LGS_DEFAULTS.decay).toBe(0.1542);
    expect(LGS_DEFAULTS.w8).toBe(1.8722);
    expect(LGS_DEFAULTS.w9).toBe(0.1666);
    expect(LGS_DEFAULTS.w10).toBe(0.796);
    expect(LGS_DEFAULTS.w11).toBe(1.4835);
    expect(LGS_DEFAULTS.w12).toBe(0.0614);
    expect(LGS_DEFAULTS.w13).toBe(0.2629);
    expect(LGS_DEFAULTS.w14).toBe(1.6483);
    expect(LGS_DEFAULTS.fMax).toBe(12);
    expect(LGS_DEFAULTS.wReset).toBe(0.5);
    expect(LGS_DEFAULTS.wForget).toBe(4);
    expect(LGS_DEFAULTS.eta).toBe(0.15);
    expect(LGS_DEFAULTS.target).toBe(0.9);
    expect(LGS_DEFAULTS.effortCap).toBe(0.6);
    expect(LGS_DEFAULTS.capInterval).toBe(7);
    expect(LGS_DEFAULTS.hintDebit).toEqual([0, 0.5, 1.5, 4.0]);
  });
});

describe("retrievability and interval identities", () => {
  const STABILITIES = [0.1, 1, 2.3065, 10, 100, 1000, 36500];

  test("R(S, S) = 0.9 and I(0.9, S) = S", () => {
    for (const S of STABILITIES) {
      expect(Math.abs(lgsRetrievabilityAt(S, S) - 0.9)).toBeLessThan(1e-12);
      expect(Math.abs(lgsIntervalFor(S) - S)).toBeLessThan(1e-9);
    }
  });

  test("the power-law factor is F = 0.9^(-1/d) - 1", () => {
    close(Math.pow(0.9, -1 / LGS_DEFAULTS.decay) - 1, 0.9803464944134797, 15);
  });
});

describe("P1 ladder table (S=10, D=5, elapsed=10)", () => {
  const SIGNALS: Array<[number, number]> = [
    [0, 0],
    [1, 0],
    [2, 1],
    [3, 2],
    [2, 3],
  ];
  const D_NEXT = [4.7, 4.85, 5.008824, 5.15, 5.225];
  const EFFORT = [0, 0.0625, 0.15625, 0.28125, 0.375];

  test("S' is ladder-independent and D'/effort' follow phi", () => {
    SIGNALS.forEach(([failedRuns, hintTier], index) => {
      const out = gradeLadderReview(
        state(),
        signal(failedRuns, hintTier),
        NOW,
      );
      close(out.S, 32.026729, 3);
      close(out.D, D_NEXT[index], 5);
      close(out.effort, EFFORT[index], 6);
      expect(out.interval).toBe(32);
    });
  });

  test("D' and effort' strictly increase in phi below the cap", () => {
    const rows = SIGNALS.map(([failedRuns, hintTier]) =>
      gradeLadderReview(state(), signal(failedRuns, hintTier), NOW),
    );
    for (let i = 1; i < rows.length; i += 1) {
      expect(rows[i].D).toBeGreaterThan(rows[i - 1].D);
      expect(rows[i].effort).toBeGreaterThan(rows[i - 1].effort);
    }
  });

  test("at and beyond fMax the ladder is flat", () => {
    const at = gradeLadderReview(state(), signal(12, 3), NOW);
    const beyond = gradeLadderReview(state(), signal(13, 3), NOW);
    const far = gradeLadderReview(state(), signal(20, 3), NOW);
    const resetAtCap = gradeLadderReview(state(), signal(12, 3, true), NOW);
    expect(ladderPhi(signal(12, 3))).toBe(16);
    expect(ladderPhi(signal(13, 3))).toBe(16);
    expect(beyond.D).toBe(at.D);
    expect(beyond.effort).toBe(at.effort);
    expect(far.D).toBe(at.D);
    expect(resetAtCap.D).toBe(at.D);
    expect(resetAtCap.effort).toBe(at.effort);
  });
});

describe("P3 lapse policy (elapsed = S so R_pred = 0.9)", () => {
  const LAPSE_S = [0.316769, 1.391987, 3.747287];
  const LAPSE_INTERVAL = [1, 1, 4];

  test("post-lapse stability and intervals for S = 1 / 10 / 100", () => {
    [1, 10, 100].forEach((S, index) => {
      const prev = state({ S, interval: S, due: TODAY });
      close(lgsRetrievabilityAt(S, S), 0.9, 12);
      const out = gradeLadderReview(prev, signal(0, 0, false, false), NOW);
      close(out.S, LAPSE_S[index], 5);
      expect(out.interval).toBe(LAPSE_INTERVAL[index]);
      expect(out.lastGrade).toBe(0);
      expect(out.reps).toBe(0);
      expect(out.lapses).toBe(1);
    });
  });

  test("effort EWMA: two phi=0 fails then a clean pass halves it", () => {
    let out = state({ effort: 0.5 });
    out = gradeLadderReview(out, signal(0, 0, false, false), NOW);
    expect(out.effort).toBe(0.5);
    out = gradeLadderReview(out, signal(0, 0, false, false), NOW);
    expect(out.effort).toBe(0.5);
    out = gradeLadderReview(out, signal(), NOW);
    expect(out.effort).toBe(0.25);
  });

  test("effort EWMA: a phi=4 fail raises it, a clean pass halves it", () => {
    let out = state({ effort: 0.75 });
    out = gradeLadderReview(out, signal(4, 0, false, false), NOW);
    expect(out.effort).toBe(0.875);
    out = gradeLadderReview(out, signal(), NOW);
    expect(out.effort).toBe(0.4375);
  });

  test("a second heavy lapse enters the effort cap", () => {
    let out = state({ S: 100, interval: 100, effort: 0 });
    out = gradeLadderReview(out, signal(4, 0, false, false), NOW);
    expect(out.effort).toBe(0.5);
    expect(out.effort).toBeLessThan(LGS_DEFAULTS.effortCap);
    expect(out.interval).toBe(4);
    out = gradeLadderReview(out, signal(4, 0, false, false), NOW);
    expect(out.effort).toBe(0.75);
    expect(out.interval).toBeLessThanOrEqual(LGS_DEFAULTS.capInterval);
  });
});

describe("effort cap semantics", () => {
  test("maximal struggle on a mature item caps the interval at 7", () => {
    const out = gradeLadderReview(
      state({ S: 36500, D: 1, effort: 0.5, interval: 36500 }),
      signal(12, 3),
      NOW,
    );
    expect(out.S).toBe(36500);
    close(out.D, 2.063636, 5);
    expect(out.effort).toBe(0.75);
    expect(out.interval).toBe(7);
  });

  test("one clean pass releases the cap immediately", () => {
    const out = gradeLadderReview(state({ effort: 0.5 }), signal(), NOW);
    expect(out.effort).toBe(0.25);
    expect(out.interval).toBe(32);
  });
});

describe("D-channel twin (clean vs f=3,h=3)", () => {
  const clean1 = gradeLadderReview(state(), signal(0, 0), NOW);
  const struggle1 = gradeLadderReview(state(), signal(3, 3), NOW);
  const LATER = AT(2026, 0, 14 + clean1.interval);
  const clean2 = gradeLadderReview(clean1, signal(), LATER);
  const struggle2 = gradeLadderReview(struggle1, signal(), LATER);

  test("first pass: same S' and interval, different D'", () => {
    close(clean1.S, 32.026729, 3);
    close(struggle1.S, 32.026729, 3);
    close(clean1.D, 4.7, 5);
    close(struggle1.D, 5.265385, 5);
    expect(clean1.interval).toBe(32);
    expect(struggle1.interval).toBe(32);
  });

  test("second clean pass at the interval diverges via D only", () => {
    close(clean2.S, 93.00489, 4);
    close(struggle2.S, 87.532491, 4);
    expect(clean2.S).toBeGreaterThan(struggle2.S);
    close(clean2.S / struggle2.S, 1.0625, 3);
    expect(clean2.interval).toBe(93);
    expect(struggle2.interval).toBe(88);
  });

  test("blueprint hand fixtures match at 0.05", () => {
    expect(Math.abs(clean2.S - 93.041293)).toBeLessThan(0.05);
    expect(Math.abs(struggle2.S - 87.565627)).toBeLessThan(0.05);
  });
});

describe("predicted-retrievability ordering", () => {
  const A = state({ S: 100, interval: 100, due: "2026-01-13" });
  const B = state({ S: 3, interval: 3, due: "2026-01-04" });
  const byRetrievability = (a: LgsLegacyFields, b: LgsLegacyFields): number =>
    lgsRetrievability(a, NOW) - lgsRetrievability(b, NOW);

  test("P4a: rA ~ 0.8993, rB ~ 0.7744 and B sorts first", () => {
    close(lgsRetrievability(A, NOW), 0.89931494, 5);
    close(lgsRetrievability(B, NOW), 0.77441687, 5);
    expect(byRetrievability(A, B)).toBeGreaterThan(0);
    const queue = [A, B].sort(byRetrievability);
    expect(queue[0]).toBe(B);
  });

  test("comparator is a total order and insertion-order independent", () => {
    const C = state({ S: 30, interval: 30, due: "2026-01-05" });
    const order = (items: LgsState[]) =>
      [...items].sort(byRetrievability).map((item) => item.S);
    expect(order([A, B, C])).toEqual([...order([C, B, A])]);
    expect(order([A, B, C]).length).toBe(3);
  });
});

describe("migration", () => {
  test("impossible calendar dates normalize to today and stay idempotent", () => {
    for (const due of ["2026-02-30", "2026-99-99", "2026-13-01", "2026-00-10"]) {
      const first = migrateReviewState(
        {
          ease: 2.5,
          interval: 10,
          due,
          reps: 1,
          lapses: 0,
          lastGrade: 5,
          lastReviewedAt: null,
        },
        TODAY,
      );
      expect(first).not.toBeNull();
      expect(first?.due).toBe(TODAY);
      const second = migrateReviewState(
        JSON.parse(JSON.stringify(first)),
        TODAY,
      );
      expect(JSON.stringify(second)).toBe(JSON.stringify(first));
    }
  });

  test("fixture derives S/D/effort and preserves legacy fields", () => {
    const out = migrateReviewState(
      {
        ease: 1.7,
        interval: 14,
        due: "2026-10-02",
        reps: 3,
        lapses: 2,
        lastGrade: 3,
      },
      TODAY,
    );
    expect(out).not.toBeNull();
    expect(out?.v).toBe(2);
    expect(out?.S).toBe(14);
    expect(out?.D).toBe(6.6);
    expect(out?.effort).toBe(0.6);
    expect(out?.due).toBe("2026-10-02");
    expect(out?.ease).toBe(1.7);
    expect(out?.interval).toBe(14);
    expect(out?.reps).toBe(3);
    expect(out?.lapses).toBe(2);
    expect(out?.lastGrade).toBe(3);
    expect(out?.lastReviewedAt).toBeNull();
  });

  test("double migration is byte-idempotent", () => {
    const first = migrateReviewState(
      { ease: 1.7, interval: 14, due: "2026-10-02", reps: 3, lapses: 2, lastGrade: 3 },
      TODAY,
    );
    const second = migrateReviewState(
      JSON.parse(JSON.stringify(first)),
      TODAY,
    );
    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
  });

  test("B3: valid v2 fields survive double migration verbatim", () => {
    const first = migrateReviewState(
      { v: 2, S: 7, D: 3, effort: 0.2 },
      TODAY,
    );
    const second = migrateReviewState(JSON.parse(JSON.stringify(first)), TODAY);
    expect(first?.S).toBe(7);
    expect(first?.D).toBe(3);
    expect(first?.effort).toBe(0.2);
    expect(second?.S).toBe(7);
    expect(second?.D).toBe(3);
    expect(second?.effort).toBe(0.2);
    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
  });

  test("B3: valid v2 fields are not re-derived from legacy values", () => {
    const out = migrateReviewState(
      {
        v: 2,
        S: 9,
        D: 2,
        effort: 0.4,
        ease: 1.3,
        interval: 14,
        due: "2026-10-02",
        reps: 3,
        lapses: 2,
        lastGrade: 3,
      },
      TODAY,
    );
    expect(out?.S).toBe(9);
    expect(out?.D).toBe(2);
    expect(out?.effort).toBe(0.4);
    close(lgsResolveFields(legacy({ ease: 1.3, interval: 14 })).D, 7.4, 12);
  });

  test("invalid v2 fields re-derive, non-object payloads return null", () => {
    const out = migrateReviewState(
      {
        v: 2,
        S: NaN,
        D: 99,
        effort: -1,
        ease: 2.5,
        interval: 5,
        due: "2026-01-14",
        reps: 1,
        lapses: 0,
        lastGrade: 5,
      },
      TODAY,
    );
    expect(out?.S).toBe(5);
    expect(out?.D).toBe(5);
    expect(out?.effort).toBe(0.1);
    expect(migrateReviewState(null, TODAY)).toBeNull();
    expect(migrateReviewState("nope", TODAY)).toBeNull();
    expect(migrateReviewState([1, 2], TODAY)).toBeNull();
    expect(migrateReviewState(42, TODAY)).toBeNull();
  });

  test("fixed-seed fuzz: 5,000 records stay idempotent and in range", () => {
    const rng = mulberry32(112233);
    const grades = [0, 3, 4, 5, null, 1, 2, "x", NaN] as unknown[];
    const dues = [
      "2026-01-14",
      "2026-02-30",
      "not-a-date",
      "",
      "9999-99-99",
      "2026-12-31",
    ];
    let nulls = 0;
    let copied = 0;
    let derived = 0;
    let violations = 0;
    const check = (
      raw: Record<string, unknown>,
      inputDue: string | null,
    ): LgsState | null => {
      const first = migrateReviewState(raw, TODAY);
      if (!first) {
        violations += 1;
        return null;
      }
      const second = migrateReviewState(JSON.parse(JSON.stringify(first)), TODAY);
      if (JSON.stringify(second) !== JSON.stringify(first)) violations += 1;
      if (!Number.isFinite(first.S) || first.S < 0.1 || first.S > 36500) {
        violations += 1;
      }
      if (!Number.isFinite(first.D) || first.D < 1 || first.D > 10) {
        violations += 1;
      }
      if (!Number.isFinite(first.effort) || first.effort < 0 || first.effort > 1) {
        violations += 1;
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(first.due)) violations += 1;
      if (first.due === "NaN-NaN-NaN") violations += 1;
      if (inputDue !== null && first.due !== inputDue) violations += 1;
      if (!Number.isFinite(first.interval) || first.interval < 0) violations += 1;
      return first;
    };
    const randomV1 = (): Record<string, unknown> => ({
      ease: [2.5, 1.7, 2.8, 1.3, 99, NaN, Infinity, "x"][
        Math.floor(rng() * 8)
      ],
      interval: [-5, 0, 1, 14, 100, 1e9, NaN, 2.6][Math.floor(rng() * 8)],
      due: dues[Math.floor(rng() * dues.length)],
      reps: [0, 1, 3, -2, NaN, 2.7][Math.floor(rng() * 6)],
      lapses: [0, 2, -1, NaN][Math.floor(rng() * 4)],
      lastGrade: grades[Math.floor(rng() * grades.length)],
      lastReviewedAt: [null, "2026-01-13T06:30:00.000Z", "bogus", 17][
        Math.floor(rng() * 4)
      ],
    });
    const validDue = (raw: Record<string, unknown>): string | null => {
      if (typeof raw.due !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(raw.due)) {
        return null;
      }
      const [year, month, day] = raw.due.split("-").map(Number);
      const probe = new Date(Date.UTC(year, month - 1, day));
      return probe.getUTCFullYear() === year &&
        probe.getUTCMonth() === month - 1 &&
        probe.getUTCDate() === day
        ? raw.due
        : null;
    };
    for (let i = 0; i < 5000; i += 1) {
      const raw = randomV1();
      if (check(raw, validDue(raw))) derived += 1;
    }
    for (let i = 0; i < 1000; i += 1) {
      if (rng() < 0.25) {
        const payload = [null, undefined, "x", 7, true, NaN, Infinity][
          Math.floor(rng() * 7)
        ];
        if (migrateReviewState(payload, TODAY) !== null) violations += 1;
        nulls += 1;
        continue;
      }
      const raw = randomV1();
      const useV2 = rng() < 0.6;
      let v2Valid = false;
      if (useV2) {
        raw.v = 2;
        raw.S = [7, 0.05, 40000, NaN, Infinity, "x"][Math.floor(rng() * 6)];
        raw.D = [3, 0.5, 11, NaN, null][Math.floor(rng() * 5)];
        raw.effort = [0.2, -0.1, 1.5, NaN, 0.6][Math.floor(rng() * 5)];
        v2Valid =
          typeof raw.S === "number" &&
          Number.isFinite(raw.S) &&
          raw.S >= 0.1 &&
          raw.S <= 36500 &&
          typeof raw.D === "number" &&
          Number.isFinite(raw.D) &&
          raw.D >= 1 &&
          raw.D <= 10 &&
          typeof raw.effort === "number" &&
          Number.isFinite(raw.effort) &&
          raw.effort >= 0 &&
          raw.effort <= 1;
      }
      const first = check(raw, validDue(raw));
      if (!first) continue;
      if (v2Valid) {
        if (first.S === raw.S && first.D === raw.D && first.effort === raw.effort) {
          copied += 1;
        } else {
          violations += 1;
        }
      } else {
        derived += 1;
      }
    }
    expect(violations).toBe(0);
    expect(derived).toBeGreaterThanOrEqual(5000);
    expect(nulls).toBeGreaterThan(0);
    expect(copied).toBeGreaterThan(0);
  });
});

describe("NaN guards and sanitization", () => {
  test("ladderPhi clamps junk signals", () => {
    expect(ladderPhi(signal(NaN, 99))).toBe(4);
    expect(ladderPhi(signal(Infinity, -5, true))).toBe(0.5);
    expect(ladderPhi(signal(-3, 2.9))).toBe(ladderPhi(signal(0, 2)));
    expect(Number.isFinite(ladderPhi(signal(NaN, NaN)))).toBe(true);
  });

  test("a grade with junk signal fields stays finite and dated", () => {
    const out = gradeLadderReview(state(), signal(NaN, 99), NOW);
    expect(Number.isFinite(out.S)).toBe(true);
    expect(Number.isFinite(out.D)).toBe(true);
    expect(Number.isFinite(out.effort)).toBe(true);
    expect(out.interval).toBeGreaterThanOrEqual(1);
    expect(out.S).toBeGreaterThanOrEqual(0.1);
    expect(out.S).toBeLessThanOrEqual(36500);
    expect(out.D).toBeGreaterThanOrEqual(1);
    expect(out.D).toBeLessThanOrEqual(10);
    expect(out.effort).toBeGreaterThanOrEqual(0);
    expect(out.effort).toBeLessThanOrEqual(1);
    expect(out.due).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(out.due).not.toBe("NaN-NaN-NaN");
  });

  test("junk stored S/D/effort re-derive from legacy fields", () => {
    const bad = state({
      S: NaN,
      D: 99,
      effort: -1,
    });
    const resolved = lgsResolveFields(bad);
    expect(resolved.S).toBe(10);
    expect(resolved.D).toBe(5);
    expect(resolved.effort).toBe(0.1);
    const out = gradeLadderReview(bad, signal(), NOW);
    expect(Number.isFinite(out.S)).toBe(true);
    expect(Number.isFinite(out.D)).toBe(true);
    expect(out.D).toBeLessThanOrEqual(10);
    expect(Number.isFinite(out.effort)).toBe(true);
    expect(out.interval).toBeGreaterThanOrEqual(1);
    expect(out.interval).toBeLessThanOrEqual(36500);
  });

  test("sanitize round-trips preserve the resolved triple", () => {
    const source = { S: 7, D: 3, effort: 0.2, v: 2 as const };
    const first = migrateReviewState(source, TODAY);
    const second = migrateReviewState(first, TODAY);
    expect(second?.S).toBe(first?.S);
    expect(second?.D).toBe(first?.D);
    expect(second?.effort).toBe(first?.effort);
    expect(lgsResolveFields(state({ S: 7, D: 3, effort: 0.2 }))).toEqual({
      S: 7,
      D: 3,
      effort: 0.2,
    });
  });
});

describe("elapsed days", () => {
  test("elapsed = interval + days past due when never reviewed", () => {
    expect(
      lgsElapsedDays(
        legacy({ interval: 6, due: "2026-01-11" }),
        "2026-01-14",
      ),
    ).toBe(9);
  });

  test("lastReviewedAt wins over due/interval", () => {
    const reviewed = legacy({
      interval: 6,
      due: "2020-01-01",
      lastReviewedAt: AT(2026, 2, 7).toISOString(),
    });
    expect(lgsElapsedDays(reviewed, "2026-03-09")).toBe(2);
    expect(lgsElapsedDays(reviewed, "2026-03-07")).toBe(0);
    expect(lgsElapsedDays(reviewed, "2026-03-01")).toBe(0);
  });

  test("date keys match getDailyDateKey across a DST boundary", () => {
    expect(getDailyDateKey(AT(2026, 2, 7))).toBe("2026-03-07");
    expect(getDailyDateKey(AT(2026, 2, 9))).toBe("2026-03-09");
  });

  test("seed rule: interval 1 due tomorrow gives elapsed 1", () => {
    const seed = legacy({
      interval: 1,
      due: getDailyDateKey(AT(2026, 0, 15)),
      reps: 0,
      lastGrade: null,
      lastReviewedAt: null,
    });
    expect(lgsElapsedDays(seed, TODAY)).toBe(1);
    const out = gradeLadderReview(undefined, signal(), NOW);
    close(out.S, 4.232585, 5);
    expect(out.interval).toBe(4);
    close(out.D, 4.7, 5);
    expect(out.ease).toBe(2.5);
    expect(out.reps).toBe(1);
    expect(out.lapses).toBe(0);
    expect(out.v).toBe(2);
  });
});

describe("bounds and shape", () => {
  test("passes never shrink stability", () => {
    for (const S of [0.1, 1, 10, 100, 1000, 10000, 30000, 36500]) {
      for (const D of [1, 5, 10]) {
        for (const elapsed of [0, 1, 10, 100, 3650]) {
          const out = gradeLadderReview(
            state({ S, D, interval: Math.max(1, elapsed) }),
            signal(),
            NOW,
          );
          expect(out.S).toBeGreaterThanOrEqual(S);
        }
      }
    }
  });

  test("measured pass growth minimum is at least 1.0009 below the cap", () => {
    const out = gradeLadderReview(
      state({ S: 30000, D: 10, interval: 242 }),
      signal(),
      NOW,
    );
    expect(out.S / 30000).toBeGreaterThanOrEqual(1.0009);
    const capped = gradeLadderReview(
      state({ S: 36500, D: 10, interval: 242 }),
      signal(),
      NOW,
    );
    expect(capped.S).toBe(36500);
  });

  test("failure stability grows in S and shrinks in D", () => {
    const fail = (S: number, D: number) =>
      gradeLadderReview(
        state({ S, D, interval: S }),
        signal(0, 0, false, false),
        NOW,
      ).S;
    expect(fail(10, 5)).toBeGreaterThan(fail(1, 5));
    expect(fail(100, 5)).toBeGreaterThan(fail(10, 5));
    expect(fail(100, 1)).toBeGreaterThan(fail(100, 5));
    expect(fail(100, 10)).toBeLessThan(fail(100, 5));
  });

  test("outputs respect the interval bounds", () => {
    const huge = gradeLadderReview(
      state({ S: 36500, D: 1, interval: 36500 }),
      signal(),
      NOW,
    );
    expect(huge.interval).toBe(36500);
    const tiny = gradeLadderReview(
      state({ S: 0.1, D: 10, interval: 1 }),
      signal(0, 0, false, false),
      NOW,
    );
    expect(tiny.interval).toBeGreaterThanOrEqual(1);
    expect(tiny.interval).toBeLessThanOrEqual(36500);
  });
});
