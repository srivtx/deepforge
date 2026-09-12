import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  NOTEBOOK_CHANGE_EVENT,
  NOTEBOOK_STORAGE_KEY,
  addCell,
  createCell,
  getCells,
  moveCell,
  removeCell,
  resetNotebook,
  saveCells,
  updateCell,
} from "@/lib/notebook";
import type { NotebookCell } from "@/lib/notebook";

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
let events: string[] = [];

function mockWindow(): void {
  globalScope.window = {
    localStorage: createStorageStub(),
    dispatchEvent: (event: Event) => {
      events.push(event.type);
      return true;
    },
  };
}

function rawStore(): Record<string, NotebookCell[]> {
  const storage = (globalScope.window as { localStorage: Storage }).localStorage;
  const raw = storage.getItem(NOTEBOOK_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as Record<string, NotebookCell[]>) : {};
}

function doesNotThrow(fn: () => unknown): boolean {
  try {
    fn();
    return true;
  } catch {
    return false;
  }
}

beforeEach(() => {
  hadWindow = "window" in globalScope;
  originalWindow = globalScope.window;
  events = [];
  mockWindow();
});

afterEach(() => {
  if (hadWindow) globalScope.window = originalWindow;
  else delete globalScope.window;
});

describe("getCells", () => {
  test("defaults a fresh problem to one cell with the fallback source", () => {
    const cells = getCells("al-001", "def f():\n    pass");
    expect(cells).toHaveLength(1);
    expect(cells[0].source).toBe("def f():\n    pass");
    expect(typeof cells[0].id).toBe("string");
    expect(cells[0].id.length).toBeGreaterThan(0);
    expect(rawStore()["al-001"]).toBeUndefined();
    expect(events).toEqual([]);
  });

  test("returns stored cells and isolates the caller from the store", () => {
    saveCells("al-001", [
      { id: "c1", source: "a" },
      { id: "c2", source: "b" },
    ]);
    const cells = getCells("al-001", "fallback");
    expect(cells.map((c) => c.id)).toEqual(["c1", "c2"]);

    cells[0].source = "mutated";
    cells.push({ id: "c3", source: "c" });
    const again = getCells("al-001");
    expect(again.map((c) => c.source)).toEqual(["a", "b"]);
  });

  test("keeps notebooks isolated per problem", () => {
    saveCells("al-001", [{ id: "c1", source: "one" }]);
    expect(getCells("al-002", "two").map((c) => c.source)).toEqual(["two"]);
    expect(getCells("al-001").map((c) => c.source)).toEqual(["one"]);
  });
});

describe("mutations", () => {
  test("addCell appends, assigns unique ids, and persists the record shape", () => {
    const first = addCell("al-001", "x = 1");
    expect(first).toHaveLength(1);
    expect(first[0].source).toBe("x = 1");

    const second = addCell("al-001", "y = 2");
    expect(second.map((c) => c.source)).toEqual(["x = 1", "y = 2"]);
    expect(second[0].id).not.toBe(second[1].id);

    const stored = rawStore();
    expect(Object.keys(stored)).toEqual(["al-001"]);
    expect(stored["al-001"].map((c) => c.source)).toEqual(["x = 1", "y = 2"]);
  });

  test("updateCell rewrites one source and ignores unknown ids", () => {
    const cells = addCell("al-001", "a");
    const updated = updateCell("al-001", cells[0].id, "b");
    expect(updated.map((c) => c.source)).toEqual(["b"]);

    const noop = updateCell("al-001", "missing", "c");
    expect(noop.map((c) => c.source)).toEqual(["b"]);
    expect(rawStore()["al-001"].map((c) => c.source)).toEqual(["b"]);
  });

  test("moveCell swaps up and down and no-ops at the edges", () => {
    saveCells("p", [
      { id: "a", source: "1" },
      { id: "b", source: "2" },
      { id: "c", source: "3" },
    ]);
    expect(moveCell("p", "c", "up").map((c) => c.id)).toEqual(["a", "c", "b"]);
    expect(moveCell("p", "a", "down").map((c) => c.id)).toEqual(["c", "a", "b"]);
    expect(moveCell("p", "c", "up").map((c) => c.id)).toEqual(["c", "a", "b"]);
    expect(moveCell("p", "b", "down").map((c) => c.id)).toEqual(["c", "a", "b"]);
    expect(moveCell("p", "missing", "up").map((c) => c.id)).toEqual([
      "c",
      "a",
      "b",
    ]);
  });

  test("removeCell deletes one cell and leaves other problems untouched", () => {
    saveCells("p1", [
      { id: "a", source: "1" },
      { id: "b", source: "2" },
    ]);
    saveCells("p2", [{ id: "c", source: "3" }]);
    expect(removeCell("p1", "a").map((c) => c.id)).toEqual(["b"]);
    expect(removeCell("p1", "a").map((c) => c.id)).toEqual(["b"]);
    expect(getCells("p2").map((c) => c.id)).toEqual(["c"]);
  });

  test("removing every cell leaves a valid, empty notebook", () => {
    saveCells("p", [{ id: "only", source: "x" }]);
    removeCell("p", "only");
    expect(getCells("p", "fallback")).toEqual([]);
    expect(rawStore()["p"]).toEqual([]);
  });

  test("resetNotebook replaces everything with one starter cell", () => {
    saveCells("p", [
      { id: "a", source: "1" },
      { id: "b", source: "2" },
    ]);
    const cells = resetNotebook("p", "def f():\n    pass");
    expect(cells).toHaveLength(1);
    expect(cells[0].source).toBe("def f():\n    pass");
    expect(getCells("p")).toEqual(cells);
  });

  test("createCell makes a unique empty cell", () => {
    const a = createCell();
    const b = createCell("x");
    expect(a.source).toBe("");
    expect(b.source).toBe("x");
    expect(a.id).not.toBe(b.id);
  });
});

describe("events", () => {
  test("dispatches deepforge:notebook-change on writes but not reads", () => {
    addCell("p", "x");
    expect(events).toEqual([NOTEBOOK_CHANGE_EVENT]);

    events = [];
    const cells = getCells("p");
    expect(events).toEqual([]);

    removeCell("p", cells[0].id);
    expect(events).toEqual([NOTEBOOK_CHANGE_EVENT]);

    events = [];
    moveCell("p", "missing", "up");
    expect(events).toEqual([]);
  });
});

describe("robustness", () => {
  test("never throws when storage is unavailable", () => {
    (globalScope.window as { localStorage: unknown }).localStorage = {
      getItem() {
        throw new Error("denied");
      },
      setItem() {
        throw new Error("denied");
      },
    };

    expect(doesNotThrow(() => getCells("p", "fallback"))).toBe(true);
    expect(getCells("p", "fallback")[0].source).toBe("fallback");
    expect(doesNotThrow(() => addCell("p", "x"))).toBe(true);
    expect(doesNotThrow(() => updateCell("p", "x", "y"))).toBe(true);
    expect(doesNotThrow(() => moveCell("p", "x", "up"))).toBe(true);
    expect(doesNotThrow(() => removeCell("p", "x"))).toBe(true);
    expect(doesNotThrow(() => resetNotebook("p", "s"))).toBe(true);
    expect(
      doesNotThrow(() => saveCells("p", [{ id: "a", source: "b" }])),
    ).toBe(true);
  });

  test("sanitizes malformed persisted cells", () => {
    (globalScope.window as { localStorage: Storage }).localStorage.setItem(
      NOTEBOOK_STORAGE_KEY,
      JSON.stringify({
        good: [
          { id: "a", source: "x" },
          { id: 1, source: "bad" },
          { id: "b" },
          null,
        ],
        bad: "not an array",
      }),
    );
    expect(getCells("good").map((c) => c.id)).toEqual(["a"]);
    expect(getCells("bad", "fallback")[0].source).toBe("fallback");
  });

  test("works without a window (SSR) and falls back to the source", () => {
    delete globalScope.window;
    const cells = getCells("p", "fallback");
    expect(cells).toHaveLength(1);
    expect(cells[0].source).toBe("fallback");
    expect(
      doesNotThrow(() => saveCells("p", [{ id: "a", source: "b" }])),
    ).toBe(true);
    expect(doesNotThrow(() => addCell("p", "x"))).toBe(true);
    expect(doesNotThrow(() => moveCell("p", "a", "up"))).toBe(true);
    expect(doesNotThrow(() => removeCell("p", "a"))).toBe(true);
    expect(doesNotThrow(() => resetNotebook("p", "s"))).toBe(true);
  });
});
