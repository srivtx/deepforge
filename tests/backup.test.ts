import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  clearAllProgress,
  exportProgress,
  importProgress,
  PROGRESS_CHANGE_EVENTS,
} from "@/lib/backup";
import { getContestResults } from "@/lib/contestStore";

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

const CONTEST_KEY = "deepforge:contests:v1";
const CONTEST_AT = "2026-01-02T03:04:05.000Z";

describe("contest result sanitization", () => {
  test("non-array and unparseable payloads read as empty without throwing", () => {
    for (const raw of [
      "not json at all",
      "null",
      "42",
      '"nope"',
      "{}",
      '{"contestId":"speedrun"}',
    ]) {
      stub.setItem(CONTEST_KEY, raw);
      expect(getContestResults()).toEqual([]);
    }
  });

  test("malformed entries are dropped and junk numerics fall back to 0", () => {
    stub.setItem(
      CONTEST_KEY,
      `[null,42,"nope",[],{},{` +
        `"contestId":7,"score":1,"solved":1,"total":1,"durationSeconds":1,"completedAt":"${CONTEST_AT}"},{` +
        `"contestId":"","score":1,"solved":1,"total":1,"durationSeconds":1,"completedAt":"${CONTEST_AT}"},{` +
        `"contestId":"no-time","score":1,"solved":1,"total":1,"durationSeconds":1,"completedAt":null},{` +
        `"contestId":"partial","score":"9","solved":null,"total":true,"durationSeconds":1e400,"completedAt":"${CONTEST_AT}"},{` +
        `"contestId":"clamped","score":-2,"solved":1.6,"total":-1,"durationSeconds":90.5,"completedAt":"${CONTEST_AT}"},{` +
        `"contestId":"valid","score":7,"solved":3,"total":5,"durationSeconds":600,"completedAt":"${CONTEST_AT}"}]`,
    );

    expect(getContestResults()).toEqual([
      { contestId: "partial", score: 0, solved: 0, total: 0, durationSeconds: 0, completedAt: CONTEST_AT },
      { contestId: "clamped", score: 0, solved: 2, total: 0, durationSeconds: 91, completedAt: CONTEST_AT },
      { contestId: "valid", score: 7, solved: 3, total: 5, durationSeconds: 600, completedAt: CONTEST_AT },
    ]);
  });

  test("a corrupted backup round-trips into sanitized stores", () => {
    const backup = JSON.stringify({
      app: "deepforge",
      version: 1,
      exportedAt: new Date(0).toISOString(),
      data: {
        "deepforge:contests:v1": '[null, {"contestId": 4}]',
        "deepforge:interview:v1": "not json at all",
      },
    });

    const result = importProgress(backup);
    expect(result.error).toBeNull();
    expect(result.imported).toBe(2);
    expect(getContestResults()).toEqual([]);
  });
});

function collectLibSources(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...collectLibSources(full));
    else if (entry.isFile() && entry.name.endsWith(".ts")) files.push(full);
  }
  return files;
}

/** Events ending in `-change` that src/lib dispatches or hands to createStore. */
function scanDispatchedChangeEvents(): Set<string> {
  const libDir = fileURLToPath(new URL("../src/lib", import.meta.url));
  const sources = collectLibSources(libDir).map((file) =>
    readFileSync(file, "utf8"),
  );

  const constants = new Map<string, string>();
  for (const text of sources) {
    for (const match of text.matchAll(/const\s+([A-Za-z0-9_$]+)\s*=\s*"([^"]+)"/g)) {
      constants.set(match[1], match[2]);
    }
  }

  const dispatched = new Set<string>();
  const addEvent = (value: string | undefined) => {
    if (value && value.startsWith("deepforge:") && value.endsWith("-change")) {
      dispatched.add(value);
    }
  };
  const resolve = (name: string) => addEvent(constants.get(name) ?? name);

  for (const text of sources) {
    for (const match of text.matchAll(
      /new\s+CustomEvent(?:\s*<[^>]*>)?\s*\(\s*"([^"]+)"/g,
    )) {
      resolve(match[1]);
    }
    for (const match of text.matchAll(
      /new\s+CustomEvent(?:\s*<[^>]*>)?\s*\(\s*([A-Za-z0-9_$]+)/g,
    )) {
      resolve(match[1]);
    }
    for (const match of text.matchAll(/\bevent:\s*([A-Za-z0-9_$]+)/g)) {
      resolve(match[1]);
    }
  }
  return dispatched;
}

describe("refresh events", () => {
  test("the import list exactly matches every dispatched store change event", () => {
    const dispatched = [...scanDispatchedChangeEvents()].sort();
    expect(dispatched.length).toBeGreaterThan(0);
    expect(dispatched).toEqual([...PROGRESS_CHANGE_EVENTS].sort());
  });

  test("the import list has no duplicates and no ghost events", () => {
    expect(new Set(PROGRESS_CHANGE_EVENTS).size).toBe(
      PROGRESS_CHANGE_EVENTS.length,
    );
    expect(PROGRESS_CHANGE_EVENTS).not.toContain("deepforge:quests-change");
  });
});
