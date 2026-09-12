import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { clearAllProgress, exportProgress, importProgress } from "@/lib/backup";

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

interface ParsedBackup {
  app: string;
  version: number;
  exportedAt: string;
  data: Record<string, string>;
}

describe("exportProgress", () => {
  test("produces valid JSON with only sorted deepforge keys", () => {
    stub.setItem("deepforge:progress:v1", '{"solved":1}');
    stub.setItem("deepforge:alpha", "first");
    stub.setItem("deepforge:daily:v1", '{"streak":2}');
    stub.setItem("other:foreign", "keep-out");
    stub.setItem("theme", "dark");

    const json = exportProgress();
    const parsed = JSON.parse(json) as ParsedBackup;

    expect(parsed.app).toBe("deepforge");
    expect(parsed.version).toBe(1);
    expect(typeof parsed.exportedAt).toBe("string");
    expect(Number.isNaN(Date.parse(parsed.exportedAt))).toBe(false);

    const keys = Object.keys(parsed.data);
    expect(keys).toEqual([...keys].sort());
    expect(keys).toEqual([
      "deepforge:alpha",
      "deepforge:daily:v1",
      "deepforge:progress:v1",
    ]);
    expect(keys).not.toContain("other:foreign");
    expect(keys).not.toContain("theme");
    for (const key of keys) expect(key.startsWith("deepforge:")).toBe(true);
    expect(parsed.data["deepforge:alpha"]).toBe("first");
  });
});

describe("importProgress", () => {
  test("round-trips exported values and reports the count", () => {
    stub.setItem("deepforge:progress:v1", '{"solved":3}');
    stub.setItem("deepforge:collections:v1", '{"list":["la-001"]}');
    const backup = exportProgress();

    stub.clear();
    expect(stub.getItem("deepforge:progress:v1")).toBeNull();

    const result = importProgress(backup);
    expect(result.error).toBeNull();
    expect(result.imported).toBe(2);
    expect(stub.getItem("deepforge:progress:v1")).toBe('{"solved":3}');
    expect(stub.getItem("deepforge:collections:v1")).toBe('{"list":["la-001"]}');
    expect(stub.length).toBe(2);
  });

  test("keeps existing keys unless replace is requested", () => {
    stub.setItem("deepforge:progress:v1", '{"solved":999}');
    const backup = JSON.stringify({
      app: "deepforge",
      version: 1,
      exportedAt: new Date(0).toISOString(),
      data: {
        "deepforge:progress:v1": '{"solved":1}',
        "deepforge:daily:v1": '{"streak":5}',
      },
    });

    const kept = importProgress(backup);
    expect(kept.error).toBeNull();
    expect(kept.imported).toBe(1);
    expect(stub.getItem("deepforge:progress:v1")).toBe('{"solved":999}');
    expect(stub.getItem("deepforge:daily:v1")).toBe('{"streak":5}');

    const replaced = importProgress(backup, { replace: true });
    expect(replaced.error).toBeNull();
    expect(replaced.imported).toBe(2);
    expect(stub.getItem("deepforge:progress:v1")).toBe('{"solved":1}');
  });

  test("rejects invalid JSON, app, and version without throwing", () => {
    const cases = [
      "not json at all",
      "42",
      "[]",
      JSON.stringify({ app: "other-app", version: 1, data: {} }),
      JSON.stringify({ app: "deepforge", version: 99, data: {} }),
      JSON.stringify({ app: "deepforge", version: 1, data: null }),
      JSON.stringify({ app: "deepforge", version: 1, data: { a: 1 } }),
    ];

    for (const json of cases) {
      const result = importProgress(json);
      expect(result.imported).toBe(0);
      expect(result.error === null).toBe(false);
    }
    expect(stub.length).toBe(0);
  });

  test("imports only deepforge keys from a backup", () => {
    const backup = JSON.stringify({
      app: "deepforge",
      version: 1,
      exportedAt: new Date(0).toISOString(),
      data: {
        "deepforge:progress:v1": "{}",
        "other:foreign": "keep-out",
      },
    });

    const result = importProgress(backup);
    expect(result.error).toBeNull();
    expect(result.imported).toBe(1);
    expect(stub.getItem("deepforge:progress:v1")).toBe("{}");
    expect(stub.getItem("other:foreign")).toBeNull();
  });
});

describe("clearAllProgress", () => {
  test("removes only deepforge keys", () => {
    stub.setItem("deepforge:progress:v1", "{}");
    stub.setItem("deepforge:daily:v1", "{}");
    stub.setItem("other:foreign", "keep-out");
    stub.setItem("theme", "dark");

    const removed = clearAllProgress();
    expect(removed).toBe(2);
    expect(stub.getItem("deepforge:progress:v1")).toBeNull();
    expect(stub.getItem("deepforge:daily:v1")).toBeNull();
    expect(stub.getItem("other:foreign")).toBe("keep-out");
    expect(stub.getItem("theme")).toBe("dark");
    expect(stub.length).toBe(2);
  });
});
