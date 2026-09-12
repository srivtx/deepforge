import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  getPenPaperProgress,
  getPenPaperStats,
  recordPenPaperAnswer,
  resetPenPaperProgress,
} from "@/lib/penpaper";
import { PENPAPER_PROBLEMS } from "@/data/penpaper";

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

beforeEach(() => {
  hadWindow = "window" in globalScope;
  originalWindow = globalScope.window;
  stub = createStorageStub();
  globalScope.window = {
    localStorage: stub,
    dispatchEvent: () => true,
  };
});

afterEach(() => {
  if (hadWindow) globalScope.window = originalWindow;
  else delete globalScope.window;
});

describe("pen and paper progress", () => {
  test("the 60 penpaper ids are unique", () => {
    expect(PENPAPER_PROBLEMS).toHaveLength(60);
    expect(new Set(PENPAPER_PROBLEMS.map((p) => p.id)).size).toBe(60);
  });

  test("records answers and keeps correctness sticky", () => {
    recordPenPaperAnswer("pp-check", false);
    const wrong = getPenPaperProgress()["pp-check"];
    expect(wrong.attempted).toBe(true);
    expect(wrong.correct).toBe(false);

    recordPenPaperAnswer("pp-check", true);
    expect(getPenPaperProgress()["pp-check"].correct).toBe(true);

    recordPenPaperAnswer("pp-check", false);
    expect(getPenPaperProgress()["pp-check"].correct).toBe(true);
  });

  test("counts attempted and correct problems against the full set", () => {
    recordPenPaperAnswer("pp-a", true);
    recordPenPaperAnswer("pp-b", false);
    recordPenPaperAnswer("pp-a", false);

    const stats = getPenPaperStats();
    expect(stats.attempted).toBe(2);
    expect(stats.correct).toBe(1);
    expect(stats.total).toBe(PENPAPER_PROBLEMS.length);
  });

  test("reset clears all records", () => {
    recordPenPaperAnswer("pp-a", true);
    resetPenPaperProgress();
    expect(getPenPaperProgress()).toEqual({});
    expect(getPenPaperStats().attempted).toBe(0);
  });

  test("unreadable storage falls back to an empty progress map", () => {
    stub.setItem("deepforge:penpaper:v1", "{not json");
    expect(getPenPaperProgress()).toEqual({});
    expect(getPenPaperStats().correct).toBe(0);

    stub.setItem("deepforge:penpaper:v1", JSON.stringify({ "pp-a": { attempted: true } }));
    expect(getPenPaperProgress()).toEqual({});
  });
});
