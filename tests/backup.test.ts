import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  BACKUP_EXCLUDED_KEYS,
  BACKUP_INCLUDED_KEYS,
  BACKUP_INCLUDED_KEY_PREFIXES,
  BACKUP_NON_STORAGE_LITERALS,
  clearAllProgress,
  exportProgress,
  importProgress,
  isBackupExcludedKey,
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
let dispatchedEvents: string[];

beforeEach(() => {
  hadWindow = "window" in globalScope;
  originalWindow = globalScope.window;
  stub = createStorageStub();
  dispatchedEvents = [];
  globalScope.window = {
    localStorage: stub,
    dispatchEvent: (event: { type?: unknown }) => {
      if (typeof event?.type === "string") dispatchedEvents.push(event.type);
      return true;
    },
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

  test("a legacy backup without the newest stores still imports cleanly", () => {
    const legacy = JSON.stringify({
      app: "deepforge",
      version: 1,
      exportedAt: new Date(0).toISOString(),
      data: {
        "deepforge:progress:v1": '{"la-001":{"solved":true}}',
        "deepforge:contests:v1": "[]",
      },
    });

    const result = importProgress(legacy);
    expect(result.error).toBeNull();
    expect(result.imported).toBe(2);
    expect(stub.getItem("deepforge:progress:v1")).toBe(
      '{"la-001":{"solved":true}}',
    );
    expect(stub.getItem("deepforge:contests:v1")).toBe("[]");
    expect(stub.getItem("deepforge:bug-hunt:v1")).toBeNull();
  });
});

describe("newest stores", () => {
  const SEEDS: Record<string, string> = {
    "deepforge:bug-hunt:v1": '{"found":["al-001"],"attempts":2}',
    "deepforge:lab-reviews:v1": '{"reviews":[{"labId":"lab-1","score":8}]}',
    "deepforge:agentic-round:v1": '[{"problemId":"ml-001","round":3}]',
    "deepforge:assistant-hidden:v1": '{"ml-001":true}',
    "deepforge:concepts:v1": '{"concepts":{"pr-001":{"reps":2}}}',
    "deepforge:assistant:al-001": '[{"role":"user","text":"why?"}]',
  };

  test("round-trips the newest stores, including a dynamic assistant key", () => {
    for (const [key, value] of Object.entries(SEEDS)) stub.setItem(key, value);

    const backup = exportProgress();
    stub.clear();

    const result = importProgress(backup);
    expect(result.error).toBeNull();
    expect(result.imported).toBe(Object.keys(SEEDS).length);
    for (const [key, value] of Object.entries(SEEDS)) {
      expect(stub.getItem(key)).toBe(value);
    }
  });

  test("restoring the newest stores dispatches their refresh events", () => {
    const result = importProgress(
      JSON.stringify({
        app: "deepforge",
        version: 1,
        exportedAt: new Date(0).toISOString(),
        data: {
          "deepforge:bug-hunt:v1": "{}",
          "deepforge:lab-reviews:v1": "{}",
          "deepforge:assistant-hidden:v1": "{}",
          "deepforge:agentic-round:v1": "[]",
        },
      }),
    );

    expect(result.error).toBeNull();
    expect(dispatchedEvents).toContain("deepforge:bug-hunt-change");
    expect(dispatchedEvents).toContain("deepforge:lab-reviews-change");
    expect(dispatchedEvents).toContain("deepforge:assistant-hidden-change");
    expect(dispatchedEvents).toContain("deepforge:agentic-change");
  });
});

describe("device-bound exclusions", () => {
  test("export omits excluded keys", () => {
    stub.setItem("deepforge:progress:v1", '{"solved":1}');
    stub.setItem("deepforge:session:v1", '{"userId":"user-1"}');
    stub.setItem("deepforge:sync:v1", '"2026-01-01T00:00:00.000Z"');
    stub.setItem("deepforge:pyodide-worker", "off");

    const parsed = JSON.parse(exportProgress()) as ParsedBackup;
    expect(Object.keys(parsed.data)).toEqual(["deepforge:progress:v1"]);
  });

  test("import skips excluded keys from pre-classification backups", () => {
    const result = importProgress(
      JSON.stringify({
        app: "deepforge",
        version: 1,
        exportedAt: new Date(0).toISOString(),
        data: {
          "deepforge:progress:v1": '{"solved":2}',
          "deepforge:session:v1": '{"userId":"user-1"}',
          "deepforge:sync:v1": '"2026-01-01T00:00:00.000Z"',
          "deepforge:pwa-hint-dismissed": "1",
        },
      }),
    );

    expect(result.error).toBeNull();
    expect(result.imported).toBe(1);
    expect(stub.getItem("deepforge:progress:v1")).toBe('{"solved":2}');
    expect(stub.getItem("deepforge:session:v1")).toBeNull();
    expect(stub.getItem("deepforge:sync:v1")).toBeNull();
    expect(stub.getItem("deepforge:pwa-hint-dismissed")).toBeNull();
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

/**
 * Every `deepforge:` string literal in `src/lib`: quoted literals plus
 * dynamic template literals (the only unquoted key form is
 * `deepforge:assistant:<problemId>`). Doc comments use backticks without
 * interpolation, so prose is skipped on purpose.
 */
function scanLibDeepforgeLiterals(): string[] {
  const libDir = fileURLToPath(new URL("../src/lib", import.meta.url));
  const sources = collectLibSources(libDir).map((file) =>
    readFileSync(file, "utf8"),
  );

  const found = new Set<string>();
  const add = (literal: string) => {
    if (literal.startsWith("deepforge:")) found.add(literal);
  };
  for (const source of sources) {
    for (const match of source.matchAll(/"(deepforge:[^"]*)"/g)) add(match[1]);
    for (const match of source.matchAll(/'(deepforge:[^']*)'/g)) add(match[1]);
    for (const match of source.matchAll(/`(deepforge:[^`]*)`/g)) {
      if (!match[1].includes("${")) continue;
      add(match[1].replace(/\$\{[^}]*\}/g, ""));
    }
  }
  return [...found].sort();
}

function classificationOf(literal: string): string | null {
  if (literal.endsWith("-change")) return "event";
  if ((BACKUP_NON_STORAGE_LITERALS as readonly string[]).includes(literal)) {
    return "non-storage";
  }
  if ((BACKUP_INCLUDED_KEYS as readonly string[]).includes(literal)) {
    return "included";
  }
  if (
    BACKUP_INCLUDED_KEY_PREFIXES.some((prefix) => literal.startsWith(prefix))
  ) {
    return "included-prefix";
  }
  if (isBackupExcludedKey(literal)) return "excluded";
  return null;
}

describe("key inventory", () => {
  test("every deepforge: literal in src/lib is classified", () => {
    const literals = scanLibDeepforgeLiterals();
    expect(literals.length).toBeGreaterThan(20);

    const unclassified = literals.filter(
      (literal) => classificationOf(literal) === null,
    );
    expect(unclassified).toEqual([]);
  });

  test("the included inventory only names keys that exist in src/lib", () => {
    const scanned = new Set(scanLibDeepforgeLiterals());
    const missing = (BACKUP_INCLUDED_KEYS as readonly string[]).filter(
      (key) => !scanned.has(key),
    );
    expect(missing).toEqual([]);
  });

  test("the newest stores are in the included inventory", () => {
    for (const key of [
      "deepforge:bug-hunt:v1",
      "deepforge:lab-reviews:v1",
      "deepforge:agentic-round:v1",
      "deepforge:assistant-hidden:v1",
      "deepforge:concepts:v1",
      "deepforge:checkpoint-attempts:v1",
      "deepforge:groups:v1",
    ]) {
      expect((BACKUP_INCLUDED_KEYS as readonly string[])).toContain(key);
    }
  });

  test("excluded keys carry a reason and are not also included", () => {
    for (const [key, reason] of Object.entries(BACKUP_EXCLUDED_KEYS)) {
      expect(key.startsWith("deepforge:")).toBe(true);
      expect(reason.length).toBeGreaterThan(0);
      expect((BACKUP_INCLUDED_KEYS as readonly string[])).not.toContain(key);
      expect(isBackupExcludedKey(key)).toBe(true);
    }
  });
});
