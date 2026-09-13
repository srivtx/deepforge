import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from "bun:test";
import {
  getCachedSession,
  getSupabase,
  isSupabaseConfigured,
  notifyLocalWrite,
  onBackendChange,
  onSessionChange,
  registerSyncer,
  selectBackend,
  setCachedSession,
  type UserSession,
} from "@/lib/sync/backend";
import { createStore } from "@/lib/sync/store";
import type { StoreId, StoreSpec } from "@/lib/sync/types";
import { getUserCollections, saveUserCollection } from "@/lib/collections";
import { getDailyState } from "@/lib/daily";
import { getUserName, setUserName } from "@/lib/leaderboard";
import { getProgress, markSolved } from "@/lib/progress";

declare module "bun:test" {
  export const jest: {
    useFakeTimers(): void;
    useRealTimers(): void;
    advanceTimersByTime(ms: number): void;
  };
}

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
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  setCachedSession(null);
});

afterEach(() => {
  jest.useRealTimers();
  if (hadWindow) globalScope.window = originalWindow;
  else delete globalScope.window;
});

interface Box {
  a?: number;
  b?: number;
}

const BOX_KEY = "deepforge:test-box:v1";

function makeSpec(overrides: Partial<StoreSpec<Box>> = {}): StoreSpec<Box> {
  return {
    id: "progress",
    storageKey: BOX_KEY,
    event: "deepforge:test-change",
    empty: () => ({}),
    parse: (raw) => {
      if (!raw) return {};
      try {
        const parsed: unknown = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          return {};
        }
        return parsed as Box;
      } catch {
        return {};
      }
    },
    serialize: (v) => JSON.stringify(v),
    ...overrides,
  };
}

function enableRemoteSession(): void {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "pk_test";
  setCachedSession({ userId: "u-1", email: "user@example.com" });
}

describe("createStore", () => {
  test("round-trips get/set/update/clear through localStorage", () => {
    const store = createStore(makeSpec());

    expect(store.get()).toEqual({});

    store.set({ a: 1 });
    expect(stub.getItem(BOX_KEY)).toBe('{"a":1}');
    expect(store.get()).toEqual({ a: 1 });

    store.update((value) => ({ ...value, b: 2 }));
    expect(store.get()).toEqual({ a: 1, b: 2 });
    expect(stub.getItem(BOX_KEY)).toBe('{"a":1,"b":2}');

    store.clear();
    expect(store.get()).toEqual({});
    expect(stub.getItem(BOX_KEY)).toBeNull();
  });

  test("dispatches the spec event on set and clear", () => {
    const store = createStore(makeSpec());

    store.set({ a: 1 });
    expect(dispatched).toContain("deepforge:test-change");

    dispatched.length = 0;
    store.clear();
    expect(dispatched).toContain("deepforge:test-change");
  });

  test("get is SSR-safe and writes never throw without window", () => {
    delete globalScope.window;
    const store = createStore(makeSpec());

    expect(store.get()).toEqual({});
    store.set({ a: 1 });
    store.clear();
  });
});

describe("store parse safety", () => {
  test("malformed JSON yields the empty value for real stores", () => {
    stub.setItem("deepforge:progress:v1", "{not json");
    expect(getProgress()).toEqual({});

    stub.setItem("deepforge:progress:v1", "null");
    expect(getProgress()).toEqual({});

    stub.setItem("deepforge:daily:v1", "{not json");
    expect(getDailyState()).toEqual({
      lastSolvedDate: null,
      streak: 0,
      solvedDates: [],
    });
  });

  test("collections default updatedAt to createdAt for old records", () => {
    stub.setItem(
      "deepforge:collections:v1",
      JSON.stringify([
        {
          id: "col-old",
          name: "Old",
          description: "",
          problemIds: ["p-1"],
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ]),
    );

    const [old] = getUserCollections();
    expect(old.updatedAt).toBe("2026-01-01T00:00:00.000Z");

    const created = saveUserCollection({
      name: "New",
      description: "",
      problemIds: ["p-2"],
    });
    expect(created.updatedAt).toBe(created.createdAt);
    expect(getUserCollections()).toHaveLength(2);
  });
});

describe("username store", () => {
  test("keeps the bare-string format, default, and event", () => {
    expect(getUserName()).toBe("you");

    setUserName("  Ada  ");
    expect(stub.getItem("deepforge:username:v1")).toBe("Ada");
    expect(getUserName()).toBe("Ada");
    expect(dispatched).toContain("deepforge:username-change");

    setUserName("   ");
    expect(getUserName()).toBe("you");
  });
});

describe("backend selection", () => {
  test("stays local without env vars", () => {
    expect(isSupabaseConfigured()).toBe(false);
    setCachedSession({ userId: "u-1", email: null });
    expect(selectBackend()).toBe("local");
  });

  test("is remote only when configured and a session exists", () => {
    enableRemoteSession();
    expect(isSupabaseConfigured()).toBe(true);
    expect(selectBackend()).toBe("remote");

    setCachedSession(null);
    expect(selectBackend()).toBe("local");
    expect(isSupabaseConfigured()).toBe(true);
  });

  test("caches only userId/email in deepforge:session:v1", () => {
    setCachedSession({ userId: "u-1", email: "a@b.c" });
    expect(getCachedSession()).toEqual({ userId: "u-1", email: "a@b.c" });
    expect(stub.getItem("deepforge:session:v1")).toBe(
      JSON.stringify({ userId: "u-1", email: "a@b.c" }),
    );

    setCachedSession(null);
    expect(getCachedSession()).toBeNull();
    expect(stub.getItem("deepforge:session:v1")).toBeNull();
  });

  test("notifies session/backend listeners and unsubscribes", () => {
    const sessions: (UserSession | null)[] = [];
    let backendHits = 0;
    const offSession = onSessionChange((session) => sessions.push(session));
    const offBackend = onBackendChange(() => {
      backendHits += 1;
    });

    setCachedSession({ userId: "u-1", email: null });
    expect(sessions).toEqual([{ userId: "u-1", email: null }]);
    expect(backendHits).toBe(1);

    offSession();
    offBackend();
    setCachedSession({ userId: "u-2", email: null });
    expect(sessions).toHaveLength(1);
    expect(backendHits).toBe(1);
  });

  test("getSupabase resolves null when unconfigured and never throws", async () => {
    expect(await getSupabase()).toBeNull();

    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "pk_test";
    const configured = await getSupabase();
    expect(configured === null || typeof configured === "object").toBe(true);
  });
});

describe("notifyLocalWrite", () => {
  test("is a no-op when the backend is local", () => {
    const calls: StoreId[] = [];
    registerSyncer(async (id) => {
      calls.push(id);
    });

    jest.useFakeTimers();
    notifyLocalWrite("progress");
    jest.advanceTimersByTime(5000);
    expect(calls).toEqual([]);
    jest.useRealTimers();
  });

  test("debounces per store id when a remote session is active", () => {
    enableRemoteSession();
    const calls: StoreId[] = [];
    registerSyncer(async (id) => {
      calls.push(id);
    });

    jest.useFakeTimers();
    notifyLocalWrite("progress");
    notifyLocalWrite("progress");
    notifyLocalWrite("daily");

    jest.advanceTimersByTime(1499);
    expect(calls).toEqual([]);

    jest.advanceTimersByTime(1);
    expect(calls.sort()).toEqual(["daily", "progress"]);

    jest.advanceTimersByTime(5000);
    jest.useRealTimers();
  });

  test("store writes schedule the syncer through the seam", () => {
    enableRemoteSession();
    const calls: StoreId[] = [];
    registerSyncer(async (id) => {
      calls.push(id);
    });

    jest.useFakeTimers();
    markSolved("p-1");
    expect(dispatched).toContain("deepforge:progress-change");
    expect(calls).toEqual([]);

    jest.advanceTimersByTime(1500);
    expect(calls).toEqual(["progress"]);

    jest.advanceTimersByTime(5000);
    jest.useRealTimers();
  });

  test("pagehide flushes pending timers immediately", () => {
    enableRemoteSession();
    const listeners = new Map<string, () => void>();
    (
      globalScope.window as {
        addEventListener: (type: string, cb: () => void) => void;
      }
    ).addEventListener = (type, cb) => {
      listeners.set(type, cb);
    };

    const calls: StoreId[] = [];
    registerSyncer(async (id) => {
      calls.push(id);
    });

    jest.useFakeTimers();
    notifyLocalWrite("research");
    expect(calls).toEqual([]);

    listeners.get("pagehide")?.();
    expect(calls).toEqual(["research"]);

    jest.advanceTimersByTime(5000);
    jest.useRealTimers();
  });
});
