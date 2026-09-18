import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  BACKUP_EXCLUDED_KEYS,
  BACKUP_INCLUDED_KEYS,
  isBackupExcludedKey,
} from "@/lib/backup";
import { buildBdlHarness, hashBdlText } from "@/lib/bdl";
import {
  BDL_CHANGE_EVENT,
  BDL_SHELF_CHANGE_EVENT,
  BDL_SHELF_STORAGE_KEY,
  BDL_STORAGE_KEY,
  clearBdlProblem,
  clearBdlShelf,
  getBdlRecord,
  getBdlShelf,
  isBdlEnabled,
  recordBdlAttempt,
  saveBdlSource,
  setBdlEnabled,
} from "@/lib/bdlStore";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LIB = join(ROOT, "src", "lib");

const BDL_SOURCE = readFileSync(join(LIB, "bdl.ts"), "utf8");
const STORE_SOURCE = readFileSync(join(LIB, "bdlStore.ts"), "utf8");
const TYPES_SOURCE = readFileSync(join(LIB, "sync", "types.ts"), "utf8");
const REMOTE_SOURCE = readFileSync(join(LIB, "sync", "remote.ts"), "utf8");
const BACKUP_SOURCE = readFileSync(join(LIB, "backup.ts"), "utf8");

/**
 * Learner-facing direction, judgment, and perturbation-class language. The
 * shipped claim is counts only: no sign of a change, no correctness, no
 * family labels.
 */
const FORBIDDEN_LANGUAGE =
  /\b(fix|fixed|fixes|break|breaks|broke|broken|wrong|incorrect|correct|grade|graded|grading|family|families|direction|improved|improvement|worse|blind[- ]?spot)\b/i;

const FORBIDDEN_MODULES = [
  "@/lib/progress",
  "@/lib/lgs",
  "@/lib/reviewQueue",
  "@/lib/certificates",
  "@/lib/certificateStats",
  "@/lib/bugHunt",
  "@/lib/spotBug",
  "@/lib/submissions",
  "@/lib/runs",
  "@/lib/stats",
  "@/lib/badges",
  "@/lib/readiness",
  "@/lib/nextBestAction",
  "@/lib/sync/store",
  "@/lib/sync/remote",
  "@/lib/sync/backend",
  "@/lib/sync/types",
  "@/lib/sync/leaderboardRemote",
  "@/lib/sync/social",
  "@/lib/sync/remoteMerge",
];

const FORBIDDEN_RUNTIME_SYMBOLS = [
  "createStore",
  "notifyLocalWrite",
  "registerSyncer",
  "syncNow",
  "remotePush",
  "remotePull",
  "setRemoteClient",
  "sessionStorage",
  "indexedDB",
];

function collectImports(source: string): string[] {
  return [...source.matchAll(/from\s+"([^"]+)"/g)].map((match) => match[1]);
}

function collectDeepforgeLiterals(source: string): string[] {
  return [...source.matchAll(/"(deepforge:[^"]*)"/g)].map((match) => match[1]);
}

/* ────────────── ledger route + component source inventory ──────────────── */

const LEDGER_DIRS = [
  join(ROOT, "src", "components", "ledger"),
  join(ROOT, "src", "app", "ledger"),
] as const;

function readLedgerTree(): { readonly path: string; readonly source: string }[] {
  const files: { path: string; source: string }[] = [];
  for (const dir of LEDGER_DIRS) {
    for (const relative of readdirSync(dir, { recursive: true }) as string[]) {
      const path = join(dir, relative);
      if (!/\.(ts|tsx)$/.test(path) || !statSync(path).isFile()) continue;
      files.push({ path, source: readFileSync(path, "utf8") });
    }
  }
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

const LEDGER_FILES = readLedgerTree();
const LEDGER_SOURCES = LEDGER_FILES.map((file) => file.source).join(
  "\n/* ── next ledger file ── */\n",
);

/**
 * Judgment/direction/perturbation-class words for the learner surface. Unlike
 * the engine scan this omits "grade": the ledger copy must say "never a
 * grade", which is a denial, not a claim.
 */
const FORBIDDEN_LEDGER_LANGUAGE =
  /(?<![\w-])(fix|fixed|fixes|break|breaks|broke|broken|wrong|incorrect|correct|improved|improvement|worse|blind[- ]?spot|families|family|direction)(?![\w-])/i;

const RED_GREEN_TOKENS =
  /\b(?:text|bg|border|ring|fill|stroke|decoration)-(?:red|green|emerald|rose|lime|success|danger)(?:-\d{2,3})?\b/;

const LEDGER_WRITER_SYMBOLS = [
  "saveCode(",
  "markSolved(",
  "markOpened(",
  "recordRun(",
  "gradeReview",
  "recordBugRound(",
  "setProblemProgress(",
  "updateProgress(",
  "createStore",
  "notifyLocalWrite",
];

/* ─────────────────────────────── source scans ───────────────────────────── */

describe("bdl.ts purity", () => {
  test("has no runtime imports, clocks, randomness, or browser globals", () => {
    expect(BDL_SOURCE).not.toMatch(/from\s+["']/);
    expect(BDL_SOURCE).not.toMatch(/\bimport\s*\(/);
    expect(BDL_SOURCE).not.toContain("require(");
    expect(BDL_SOURCE).not.toContain("Math.random");
    expect(BDL_SOURCE).not.toMatch(/\bDate\b/);
    expect(BDL_SOURCE).not.toContain("window");
    expect(BDL_SOURCE).not.toContain("document");
    expect(BDL_SOURCE).not.toContain("localStorage");
    expect(BDL_SOURCE).not.toContain("fetch(");
  });

  test("exposes no learner-facing direction or perturbation-class language", () => {
    expect(FORBIDDEN_LANGUAGE.test(BDL_SOURCE)).toBe(false);
  });
});

describe("bdlStore isolation", () => {
  test("imports only the raw local adapter", () => {
    expect(collectImports(STORE_SOURCE)).toEqual(["@/lib/sync/localAdapter"]);
  });

  test("imports no grading, review, submission, certificate, progress, or sync module", () => {
    for (const moduleName of FORBIDDEN_MODULES) {
      expect(BDL_SOURCE).not.toContain(moduleName);
      expect(STORE_SOURCE).not.toContain(moduleName);
    }
    for (const symbol of FORBIDDEN_RUNTIME_SYMBOLS) {
      expect(BDL_SOURCE).not.toContain(symbol);
      expect(STORE_SOURCE).not.toContain(symbol);
    }
  });

  test("reads and writes only the two BDL keys through the raw adapter", () => {
    const calls = [
      ...STORE_SOURCE.matchAll(/\b(?:readRaw|writeRaw|removeRaw)\(\s*([A-Za-z0-9_$]+)/g),
    ].map((match) => match[1]);
    expect(calls.length).toBeGreaterThan(0);
    for (const name of new Set(calls)) {
      expect(["BDL_STORAGE_KEY", "BDL_SHELF_STORAGE_KEY"]).toContain(name);
    }
    expect(STORE_SOURCE).not.toContain("localStorage");
    expect(STORE_SOURCE).not.toContain("Date.now");
    expect(STORE_SOURCE).not.toContain("Math.random");
    expect(FORBIDDEN_LANGUAGE.test(STORE_SOURCE)).toBe(false);
  });

  test("names exactly the four BDL literals: two keys and two events", () => {
    const literals = new Set([
      ...collectDeepforgeLiterals(BDL_SOURCE),
      ...collectDeepforgeLiterals(STORE_SOURCE),
    ]);
    expect([...literals].sort()).toEqual(
      [
        "deepforge:bdl-change",
        "deepforge:bdl-shelf-change",
        "deepforge:bdl-shelf:v1",
        "deepforge:bdl:v1",
      ].sort(),
    );
  });

  test("is absent from the sync registry and the backup inventory", () => {
    expect(TYPES_SOURCE).not.toMatch(/bdl/i);
    const storeIds = REMOTE_SOURCE.match(
      /const ALL_STORE_IDS[^=]*=\s*\[([\s\S]*?)\]/,
    );
    expect(storeIds).not.toBeNull();
    expect((storeIds as RegExpMatchArray)[1]).not.toMatch(/bdl/i);
    for (const key of [BDL_STORAGE_KEY, BDL_SHELF_STORAGE_KEY]) {
      expect(isBackupExcludedKey(key)).toBe(true);
      expect(BACKUP_EXCLUDED_KEYS[key].length).toBeGreaterThan(0);
      expect(BACKUP_INCLUDED_KEYS as readonly string[]).not.toContain(key);
      expect(BACKUP_SOURCE).toContain(`"${key}":`);
    }
    expect(BACKUP_SOURCE).not.toContain("bdlStore");
  });

  test("keeps the harness free of direction, judgment, or family language", () => {
    const harness = buildBdlHarness({
      reference: "def f(x):\n    return x\n",
      submission: "def f(x):\n    return x\n",
      func: "f",
      tests: [{ input: [[1]], expected: 1 }],
      probes: [{ args: [[2]] }],
    });
    expect(FORBIDDEN_LANGUAGE.test(harness)).toBe(false);
  });
});

/* ─────────────── ledger components + routes source scans ───────────────── */

describe("ledger components and routes isolation", () => {
  test("scans every shipped ledger file (the scan is not vacuous)", () => {
    const names = LEDGER_FILES.map((file) => file.path.slice(ROOT.length + 1));
    expect(names).toEqual([
      "src/app/ledger/[id]/page.tsx",
      "src/app/ledger/page.tsx",
      "src/components/ledger/LedgerPicker.tsx",
      "src/components/ledger/LedgerWorkspace.tsx",
    ].sort((a, b) => a.localeCompare(b)));
    for (const file of LEDGER_FILES) {
      expect(file.source.length).toBeGreaterThan(500);
      expect(file.source).toContain("Ledger");
    }
  });

  test("never imports or calls a grading, certificate, or progress writer", () => {
    for (const moduleName of FORBIDDEN_MODULES) {
      if (moduleName === "@/lib/progress") continue; // read-only reads are allowed
      expect(LEDGER_SOURCES).not.toContain(moduleName);
    }
    for (const symbol of LEDGER_WRITER_SYMBOLS) {
      expect(LEDGER_SOURCES).not.toContain(symbol);
    }
    expect(LEDGER_SOURCES).not.toContain("@/lib/lgs");
    expect(LEDGER_SOURCES).not.toContain("@/lib/reviewQueue");
    expect(LEDGER_SOURCES).not.toContain("@/lib/certificates");
    // Positive controls: the denylist is real, not an empty list.
    expect(FORBIDDEN_MODULES).toContain("@/lib/reviewQueue");
    expect(
      LEDGER_WRITER_SYMBOLS.some((symbol) =>
        "await saveCode(id, code)".includes(symbol),
      ),
    ).toBe(true);
    expect(
      LEDGER_WRITER_SYMBOLS.some((symbol) => "markSolved(id)".includes(symbol)),
    ).toBe(true);
  });

  test("imports @/lib/progress only for its two read-only readers", () => {
    const imports = [
      ...LEDGER_SOURCES.matchAll(
        /import\s*\{([^}]*)\}\s*from\s*"@\/lib\/progress"/g,
      ),
    ];
    expect(imports.length).toBe(2);
    for (const match of imports) {
      const names = match[1]
        .split(",")
        .map((name) => name.trim())
        .filter((name) => name.length > 0);
      expect(names.length).toBeGreaterThan(0);
      for (const name of names) {
        expect(["getProgress", "getProblemProgress"]).toContain(name);
      }
    }
  });

  test("names no storage key and only the read-only progress event", () => {
    // Positive control: the literal collector finds storage keys when present.
    expect(collectDeepforgeLiterals('x("deepforge:bdl:v1")')).toEqual([
      "deepforge:bdl:v1",
    ]);
    const literals = new Set(collectDeepforgeLiterals(LEDGER_SOURCES));
    expect([...literals]).toEqual(["deepforge:progress-change"]);
    expect(LEDGER_SOURCES).not.toMatch(/deepforge:bdl/);
    expect(LEDGER_SOURCES).not.toContain("readRaw(");
    expect(LEDGER_SOURCES).not.toContain("writeRaw(");
    expect(LEDGER_SOURCES).not.toContain("removeRaw(");
    expect(LEDGER_SOURCES).not.toContain("localStorage");
  });

  test("never uses direction, judgment, or family language", () => {
    expect(FORBIDDEN_LEDGER_LANGUAGE.test("this edit fixed it")).toBe(true);
    expect(FORBIDDEN_LEDGER_LANGUAGE.test("wrong answer, blind spot")).toBe(true);
    expect(FORBIDDEN_LEDGER_LANGUAGE.test("It never changes your saved progress; counts only")).toBe(false);
    expect(FORBIDDEN_LEDGER_LANGUAGE.test(LEDGER_SOURCES)).toBe(false);
  });

  test("never styles a result with red or green tokens", () => {
    expect(RED_GREEN_TOKENS.test('class="text-red-500"')).toBe(true);
    expect(RED_GREEN_TOKENS.test("bg-green-100 border-rose-300")).toBe(true);
    expect(RED_GREEN_TOKENS.test("text-body-mid bg-canvas-card border-hairline")).toBe(false);
    expect(RED_GREEN_TOKENS.test(LEDGER_SOURCES)).toBe(false);
  });
});

/* ─────────────────────────── behavioral isolation ───────────────────────── */

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

const globalScope = globalThis as unknown as {
  window?: unknown;
  CustomEvent?: unknown;
};

let hadWindow = false;
let originalWindow: unknown;
let hadCustomEvent = false;
let originalCustomEvent: unknown;
let stub: Storage;
let dispatched: string[];

beforeEach(() => {
  hadWindow = "window" in globalScope;
  originalWindow = globalScope.window;
  hadCustomEvent = "CustomEvent" in globalScope;
  originalCustomEvent = globalScope.CustomEvent;
  stub = createStorageStub();
  dispatched = [];
  globalScope.window = {
    localStorage: stub,
    dispatchEvent: (event: { type?: unknown }) => {
      if (typeof event?.type === "string") dispatched.push(event.type);
      return true;
    },
  };
  globalScope.CustomEvent = class {
    type: string;
    constructor(type: string) {
      this.type = type;
    }
  };
});

afterEach(() => {
  if (hadWindow) globalScope.window = originalWindow;
  else delete globalScope.window;
  if (hadCustomEvent) globalScope.CustomEvent = originalCustomEvent;
  else delete globalScope.CustomEvent;
});

const AT1 = "2026-09-18T10:00:00.000Z";
const AT2 = "2026-09-18T10:01:00.000Z";
const AT3 = "2026-09-18T10:02:00.000Z";

describe("bdlStore behavioral isolation", () => {
  test("all writes stay inside the two BDL keys", () => {
    setBdlEnabled(true);
    recordBdlAttempt("p1", "basis", { hash: "h", sig: "0", mask: "1", at: AT1 });
    saveBdlSource("p1", { code: "code", sig: "0", mask: "1", at: AT1 });
    saveBdlSource("p2", { code: "code2", sig: "0", mask: "1", at: AT2 });
    clearBdlProblem("p2");
    const keys: string[] = [];
    for (let index = 0; index < stub.length; index += 1) {
      keys.push(stub.key(index) as string);
    }
    expect(keys.length).toBeGreaterThan(0);
    for (const key of keys) {
      expect([BDL_STORAGE_KEY, BDL_SHELF_STORAGE_KEY]).toContain(key);
    }
    expect([...new Set(dispatched)].sort()).toEqual(
      [BDL_CHANGE_EVENT, BDL_SHELF_CHANGE_EVENT].sort(),
    );
  });

  test("a disabled ledger never reaches storage, then opt-in works", () => {
    expect(isBdlEnabled()).toBe(false);
    recordBdlAttempt("p1", "basis", { hash: "h", sig: "0", mask: "1", at: AT1 });
    expect(stub.length).toBe(0);
    setBdlEnabled(true);
    recordBdlAttempt("p1", "basis", { hash: "h", sig: "0", mask: "1", at: AT1 });
    expect(stub.length).toBe(1);
    expect(getBdlRecord("p1", "basis")).toEqual({
      hash: "h",
      sig: "0",
      mask: "1",
      at: AT1,
    });
  });

  test("basis invalidation drops mismatched history on read and replace on write", () => {
    setBdlEnabled(true);
    recordBdlAttempt("p1", "basis-a", { hash: "h1", sig: "0", mask: "1", at: AT1 });
    expect(getBdlRecord("p1", "basis-b")).toBeNull();
    recordBdlAttempt("p1", "basis-b", { hash: "h2", sig: "1", mask: "0", at: AT2 });
    expect(getBdlRecord("p1", "basis-a")).toBeNull();
    expect(getBdlRecord("p1", "basis-b")).toEqual({
      hash: "h2",
      sig: "1",
      mask: "0",
      at: AT2,
    });
  });

  test("per-problem shelf LRU keeps the three newest by at", () => {
    setBdlEnabled(true);
    saveBdlSource("p1", { code: "one", sig: "0", mask: "1", at: AT1 });
    saveBdlSource("p1", { code: "two", sig: "0", mask: "1", at: AT2 });
    saveBdlSource("p1", { code: "three", sig: "0", mask: "1", at: AT3 });
    // Insert an older source last: it must be the one evicted.
    saveBdlSource("p1", { code: "zero", sig: "0", mask: "1", at: "2026-09-18T09:00:00.000Z" });
    const shelf = getBdlShelf("p1");
    expect(shelf.map((source) => source.code)).toEqual(["three", "two", "one"]);
    for (const source of shelf) {
      expect(source.id).toBe(hashBdlText(source.code + source.at));
    }
    expect(shelf.some((source) => source.code === "zero")).toBe(false);
  });

  test("shelf clear removes the second key and never adds a third", () => {
    setBdlEnabled(true);
    saveBdlSource("p1", { code: "code", sig: "0", mask: "1", at: AT1 });
    clearBdlShelf();
    expect(stub.getItem(BDL_SHELF_STORAGE_KEY)).toBeNull();
    const keys: string[] = [];
    for (let index = 0; index < stub.length; index += 1) {
      keys.push(stub.key(index) as string);
    }
    for (const key of keys) expect(key).toBe(BDL_STORAGE_KEY);
  });
});
