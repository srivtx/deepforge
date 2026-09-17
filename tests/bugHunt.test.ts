import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  BUG_HUNT_CHANGE_EVENT,
  BUG_HUNT_LIMIT,
  BUG_HUNT_SPEC,
  BUG_HUNT_STORAGE_KEY,
  capBugHunt,
  getBugRounds,
  getBugStats,
  mergeBugHunt,
  parseBugHuntMap,
  recordBugRound,
  REASON_OK_THRESHOLD,
  sanitizeBugRound,
  type BugHuntMap,
  type BugRound,
} from "@/lib/bugHunt";

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
let stub: Storage;
let dispatched: string[];

beforeEach(() => {
  hadWindow = "window" in globalScope;
  originalWindow = globalScope.window;
  stub = createStorageStub();
  dispatched = [];
  globalScope.window = {
    localStorage: stub,
    dispatchEvent: (event: Event) => {
      dispatched.push((event as CustomEvent).type);
      return true;
    },
  };
});

afterEach(() => {
  if (hadWindow) globalScope.window = originalWindow;
  else delete globalScope.window;
});

const BASE = Date.parse("2026-02-01T12:00:00.000Z");
const FIXED_NOW = new Date(BASE);
const at = (minutes: number): string => new Date(BASE + minutes * 60_000).toISOString();

function round(overrides: Partial<BugRound> = {}): BugRound {
  return {
    problemId: "al-001",
    category: "off-by-one",
    lineOk: true,
    reasonOk: true,
    clean: true,
    at: at(0),
    ...overrides,
  };
}

describe("store round-trip and cap", () => {
  test("records a round with the injected clock and reads it back", () => {
    const stored = recordBugRound(
      {
        problemId: "al-001",
        category: "off-by-one",
        lineOk: true,
        reasonOk: true,
      },
      FIXED_NOW,
    );
    expect(stored).toEqual({
      problemId: "al-001",
      category: "off-by-one",
      lineOk: true,
      reasonOk: true,
      clean: true,
      at: FIXED_NOW.toISOString(),
    });
    expect(getBugRounds()).toEqual([stored]);
    expect(dispatched).toContain(BUG_HUNT_CHANGE_EVENT);
    expect(stub.getItem(BUG_HUNT_STORAGE_KEY)).not.toBeNull();
  });

  test("clean defaults to lineOk && reasonOk and hints are optional", () => {
    const partial = recordBugRound(
      {
        problemId: "al-002",
        category: "wrong-axis",
        lineOk: true,
        reasonOk: false,
      },
      FIXED_NOW,
    );
    expect(partial?.clean).toBe(false);
    expect("hintsUsed" in (partial as BugRound)).toBe(false);

    const helped = recordBugRound(
      {
        problemId: "al-003",
        category: "boundary-condition",
        lineOk: false,
        reasonOk: true,
        hintsUsed: 2.6,
      },
      FIXED_NOW,
    );
    expect(helped?.clean).toBe(false);
    expect(helped?.hintsUsed).toBe(3);
  });

  test("invalid input returns null and never writes", () => {
    const bad = recordBugRound(
      {
        problemId: "al-004",
        category: "not-a-category" as BugRound["category"],
        lineOk: true,
        reasonOk: true,
      },
      FIXED_NOW,
    );
    expect(bad).toBeNull();
    expect(getBugRounds()).toEqual([]);
    expect(stub.getItem(BUG_HUNT_STORAGE_KEY)).toBeNull();
  });

  test("re-recording a problem replaces its round (one entry per problem)", () => {
    recordBugRound(
      { problemId: "al-001", category: "off-by-one", lineOk: false, reasonOk: false },
      new Date(BASE + 60_000),
    );
    recordBugRound(
      { problemId: "al-001", category: "wrong-axis", lineOk: true, reasonOk: true },
      new Date(BASE + 120_000),
    );
    const rounds = getBugRounds();
    expect(rounds).toHaveLength(1);
    expect(rounds[0].category).toBe("wrong-axis");
    expect(rounds[0].clean).toBe(true);
  });

  test("history is newest first and capped at the limit", () => {
    const total = BUG_HUNT_LIMIT + 5;
    for (let i = 0; i < total; i += 1) {
      recordBugRound(
        {
          problemId: `p-${String(i).padStart(3, "0")}`,
          category: "off-by-one",
          lineOk: true,
          reasonOk: true,
        },
        new Date(BASE + i * 60_000),
      );
    }
    const rounds = getBugRounds();
    expect(rounds).toHaveLength(BUG_HUNT_LIMIT);
    expect(rounds[0].problemId).toBe(`p-${String(total - 1).padStart(3, "0")}`);
    expect(rounds[0].at).toBe(at(total - 1));
    expect(rounds[rounds.length - 1].at).toBe(at(5));
    const serialized = JSON.parse(stub.getItem(BUG_HUNT_STORAGE_KEY) as string);
    expect(Object.keys(serialized)).toHaveLength(BUG_HUNT_LIMIT);
    expect(Object.keys(serialized)[0]).toBe(rounds[0].problemId);
  });
});

describe("stats", () => {
  test("an empty history yields zeroed counters", () => {
    expect(getBugStats([])).toEqual({
      total: 0,
      clean: 0,
      cleanRate: 0,
      byCategory: {},
      bestCleanStreak: 0,
    });
    expect(getBugStats().lastRound).toBeUndefined();
  });

  test("counts totals, clean rate, categories, streak, and last round", () => {
    const rounds: BugRound[] = [
      round({ problemId: "a", category: "off-by-one", clean: true, at: at(0) }),
      round({ problemId: "b", category: "off-by-one", clean: false, at: at(1) }),
      round({ problemId: "c", category: "wrong-axis", clean: true, at: at(2) }),
      round({ problemId: "d", category: "wrong-axis", clean: true, at: at(3) }),
      round({ problemId: "e", category: "wrong-axis", clean: true, at: at(4) }),
    ];
    const stats = getBugStats(rounds);
    expect(stats.total).toBe(5);
    expect(stats.clean).toBe(4);
    expect(stats.cleanRate).toBe(0.8);
    expect(stats.byCategory["off-by-one"]).toEqual({ total: 2, clean: 1 });
    expect(stats.byCategory["wrong-axis"]).toEqual({ total: 3, clean: 3 });
    expect(stats.byCategory["missing-normalization"]).toBeUndefined();
    expect(stats.bestCleanStreak).toBe(3);
    expect(stats.lastRound?.problemId).toBe("e");
  });

  test("streak math is chronological and keeps the best run", () => {
    const clean = (problemId: string, minute: number) =>
      round({ problemId, clean: true, at: at(minute) });
    const dirty = (problemId: string, minute: number) =>
      round({ problemId, clean: false, at: at(minute) });
    expect(
      getBugStats([clean("a", 0), clean("b", 1), clean("c", 2), dirty("d", 3), clean("e", 4)])
        .bestCleanStreak,
    ).toBe(3);
    expect(getBugStats([clean("a", 0), clean("b", 1)]).bestCleanStreak).toBe(2);
    expect(getBugStats([dirty("a", 0), clean("b", 1)]).bestCleanStreak).toBe(1);
    expect(getBugStats([dirty("a", 0)]).bestCleanStreak).toBe(0);
    const outOfOrder = [
      clean("c", 3),
      clean("a", 0),
      dirty("d", 1),
      clean("b", 2),
    ];
    expect(getBugStats(outOfOrder).bestCleanStreak).toBe(2);
  });

  test("cleanRate is rounded and never divides by zero", () => {
    const rounds = [
      round({ problemId: "a", clean: true, at: at(0) }),
      round({ problemId: "b", clean: false, at: at(1) }),
      round({ problemId: "c", clean: false, at: at(2) }),
    ];
    expect(getBugStats(rounds).cleanRate).toBe(0.333);
  });

  test("REASON_OK_THRESHOLD sits on the scoring ladder", () => {
    expect(REASON_OK_THRESHOLD).toBe(0.5);
  });
});

describe("sanitization and parsing", () => {
  test("invalid payloads read as an empty map", () => {
    stub.setItem(BUG_HUNT_STORAGE_KEY, "{not json");
    expect(getBugRounds()).toEqual([]);
    expect(parseBugHuntMap(null)).toEqual({});
    expect(parseBugHuntMap("[]")).toEqual({});
    expect(parseBugHuntMap('"nope"')).toEqual({});
    expect(parseBugHuntMap("42")).toEqual({});
  });

  test("drops malformed entries and fills missing ids from the key", () => {
    const parsed = parseBugHuntMap(
      JSON.stringify({
        keep: {
          problemId: "keep",
          category: "missing-normalization",
          lineOk: true,
          reasonOk: true,
          clean: true,
          at: at(2),
        },
        fallback: {
          category: "wrong-axis",
          lineOk: true,
          reasonOk: false,
          clean: false,
          at: at(1),
        },
        badCategory: {
          problemId: "badCategory",
          category: "sideways",
          lineOk: true,
          reasonOk: true,
          clean: true,
          at: at(3),
        },
        badAt: {
          problemId: "badAt",
          category: "off-by-one",
          lineOk: true,
          reasonOk: true,
          clean: true,
          at: "not-a-date",
        },
        junk: "not-a-round",
        list: [1, 2, 3],
      }),
    );
    expect(Object.keys(parsed).sort()).toEqual(["fallback", "keep"]);
    expect(parsed.fallback.problemId).toBe("fallback");
    expect(parsed.keep.at).toBe(at(2));
  });

  test("sanitizeBugRound coerces flags and hints instead of throwing", () => {
    expect(sanitizeBugRound(null)).toBeNull();
    expect(sanitizeBugRound("x")).toBeNull();
    expect(sanitizeBugRound([round()])).toBeNull();
    expect(
      sanitizeBugRound({ problemId: " ", category: "off-by-one", at: at(0) }),
    ).toBeNull();
    expect(
      sanitizeBugRound({ problemId: "p", category: "off-by-one", at: 42 }),
    ).toBeNull();

    const coerced = sanitizeBugRound({
      problemId: "p",
      category: "boundary-condition",
      lineOk: "yes",
      reasonOk: 1,
      clean: "no",
      hintsUsed: -4,
      at: at(0),
    });
    expect(coerced).toEqual({
      problemId: "p",
      category: "boundary-condition",
      lineOk: false,
      reasonOk: false,
      clean: false,
      at: at(0),
    });

    const derived = sanitizeBugRound({
      problemId: "p",
      category: "wrong-axis",
      lineOk: true,
      reasonOk: true,
      at: at(0),
    });
    expect(derived?.clean).toBe(true);
  });

  test("parse caps an oversized payload at the limit", () => {
    const oversized: Record<string, unknown> = {};
    const total = BUG_HUNT_LIMIT + 20;
    for (let i = 0; i < total; i += 1) {
      const id = `p-${String(i).padStart(3, "0")}`;
      oversized[id] = {
        problemId: id,
        category: "off-by-one",
        lineOk: true,
        reasonOk: true,
        clean: true,
        at: at(i),
      };
    }
    const parsed = parseBugHuntMap(JSON.stringify(oversized));
    expect(Object.keys(parsed)).toHaveLength(BUG_HUNT_LIMIT);
    expect(parsed["p-000"]).toBeUndefined();
    expect(parsed[`p-${String(total - 1).padStart(3, "0")}`]).not.toBeUndefined();
  });

  test("capBugHunt keeps the newest per problem id", () => {
    const capped = capBugHunt(
      [
        round({ problemId: "a", at: at(0) }),
        round({ problemId: "a", at: at(5) }),
        round({ problemId: "b", at: at(1) }),
      ],
      2,
    );
    expect(Object.keys(capped)).toEqual(["a", "b"]);
    expect(capped.a.at).toBe(at(5));
    expect(capBugHunt([], 0)).toEqual({});
  });
});

describe("spec contract", () => {
  test("BUG_HUNT_SPEC is the sync seam contract for the bug hunt store", () => {
    expect(BUG_HUNT_SPEC.id).toBe("bugHunt");
    expect(BUG_HUNT_SPEC.storageKey).toBe("deepforge:bug-hunt:v1");
    expect(BUG_HUNT_SPEC.event).toBe("deepforge:bug-hunt-change");
    expect(BUG_HUNT_SPEC.parse(null)).toEqual({});
    expect(BUG_HUNT_SPEC.empty()).toEqual({});
  });

  test("serialize and parse round-trip a stored history", () => {
    recordBugRound(
      { problemId: "al-001", category: "off-by-one", lineOk: true, reasonOk: true },
      FIXED_NOW,
    );
    const raw = stub.getItem(BUG_HUNT_STORAGE_KEY);
    expect(BUG_HUNT_SPEC.parse(raw)).toEqual(getBugRounds().reduce(
      (map, item) => {
        map[item.problemId] = item;
        return map;
      },
      {} as BugHuntMap,
    ));
    expect(BUG_HUNT_SPEC.serialize({})).toBe("{}");
  });
});

describe("remote merge (optional sync)", () => {
  test("keeps the later at per problem id and unions keys", () => {
    const local: BugHuntMap = {
      p1: round({ problemId: "p1", clean: false, at: at(1) }),
      p2: round({ problemId: "p2", clean: true, at: at(4) }),
    };
    const remote: BugHuntMap = {
      p1: round({ problemId: "p1", clean: true, at: at(2) }),
      p3: round({ problemId: "p3", clean: true, at: at(3) }),
    };
    const merged = mergeBugHunt(local, remote);
    expect(Object.keys(merged).sort()).toEqual(["p1", "p2", "p3"]);
    expect(merged.p1.at).toBe(at(2));
    expect(merged.p1.clean).toBe(true);
    expect(merged.p2.at).toBe(at(4));
    expect(merged.p3.at).toBe(at(3));
  });

  test("ties keep local and malformed payloads are dropped", () => {
    const local: BugHuntMap = { p1: round({ problemId: "p1", clean: false, at: at(2) }) };
    const remote = {
      p1: round({ problemId: "p1", clean: true, at: at(2) }),
      bad: { problemId: "bad", category: "sideways", at: at(9) },
      junk: 42,
    } as unknown as BugHuntMap;
    const merged = mergeBugHunt(local, remote);
    expect(merged.p1.clean).toBe(false);
    expect(merged.bad).toBeUndefined();
    expect(merged.junk).toBeUndefined();

    const keyed = mergeBugHunt({}, {
      p5: { category: "wrong-axis", lineOk: true, reasonOk: true, at: at(5) },
    } as unknown as BugHuntMap);
    expect(keyed.p5?.problemId).toBe("p5");
  });

  test("non-object payloads never throw and sanitize both sides", () => {
    const local = { p1: round({ problemId: "p1", at: at(1) }) } as BugHuntMap;
    expect(mergeBugHunt(null as unknown as BugHuntMap, local)).toEqual(local);
    expect(mergeBugHunt(local, "junk" as unknown as BugHuntMap)).toEqual(local);
    expect(mergeBugHunt("junk" as unknown as BugHuntMap, null as unknown as BugHuntMap)).toEqual({});
  });

  test("merge result is capped at the limit", () => {
    const local: BugHuntMap = {};
    const remote: BugHuntMap = {};
    const total = BUG_HUNT_LIMIT + 10;
    for (let i = 0; i < total; i += 1) {
      const id = `p-${String(i).padStart(3, "0")}`;
      const entry = round({ problemId: id, at: at(i) });
      if (i % 2 === 0) local[id] = entry;
      else remote[id] = entry;
    }
    const merged = mergeBugHunt(local, remote);
    expect(Object.keys(merged)).toHaveLength(BUG_HUNT_LIMIT);
  });

  test("is deterministic regardless of side order for disjoint keys", () => {
    const local: BugHuntMap = { p1: round({ problemId: "p1", at: at(1) }) };
    const remote: BugHuntMap = { p2: round({ problemId: "p2", at: at(2) }) };
    expect(mergeBugHunt(local, remote)).toEqual(mergeBugHunt(remote, local));
  });
});
