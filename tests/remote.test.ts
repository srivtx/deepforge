import { afterEach, beforeEach, describe, expect, jest, test } from "bun:test";
import { PROBLEMS } from "@/data/problems";
import { getAuthEmail, signInWithEmail, signOut } from "@/lib/auth";
import { getDailyState, markDailySolved, type DailyState } from "@/lib/daily";
import { recordExplanation } from "@/lib/explain";
import { getLabRecords } from "@/lib/labs";
import { getProgress } from "@/lib/progress";
import { registerSyncer, setCachedSession } from "@/lib/sync/backend";
import {
  mergeCollections,
  mergeContests,
  mergeDaily,
  mergeExplanations,
  mergeInterview,
  mergeLabs,
  mergePenPaper,
  mergeProgress,
  mergeResearch,
  mergeReviews,
  mergeUsername,
} from "@/lib/sync/remoteMerge";
import {
  getSyncState,
  initRemoteSync,
  remotePull,
  remotePush,
  setRemoteClient,
  syncNow,
  type RemoteClient,
  type RemoteQuery,
  type RemoteResult,
  type RemoteSession,
} from "@/lib/sync/remote";
import type { StoreId } from "@/lib/sync/types";

/* ────────────────────────────── test window ─────────────────────────────── */

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
  const windowListeners = new Map<string, Set<(event: Event) => void>>();
  globalScope.window = {
    localStorage: stub,
    location: { origin: "http://localhost:3001", href: "http://localhost:3001/" },
    addEventListener: (type: string, listener: (event: Event) => void) => {
      const set = windowListeners.get(type) ?? new Set();
      set.add(listener);
      windowListeners.set(type, set);
    },
    removeEventListener: (type: string, listener: (event: Event) => void) => {
      windowListeners.get(type)?.delete(listener);
    },
    dispatchEvent: (event: Event) => {
      dispatched.push((event as CustomEvent).type);
      for (const listener of windowListeners.get(event.type) ?? []) {
        listener(event);
      }
      return true;
    },
  };
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "pk_test";
  setCachedSession(null);
  setRemoteClient(null);
});

afterEach(() => {
  setRemoteClient(null);
  setCachedSession(null);
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (hadWindow) globalScope.window = originalWindow;
  else delete globalScope.window;
});

/* ─────────────────────────── fake supabase client ───────────────────────── */

class FakeDb {
  userStores = new Map<string, any>();
  userStats = new Map<string, any>();
  profiles = new Map<string, any>();
}

class FakeQuery {
  private filters: Array<[string, unknown]> = [];
  private action: "select" | "upsert" | "update" = "select";
  private payload: any = null;

  constructor(
    private db: FakeDb,
    private table: string,
  ) {}

  select(_columns?: string): FakeQuery {
    if (this.action !== "upsert" && this.action !== "update") this.action = "select";
    return this;
  }

  eq(column: string, value: unknown): FakeQuery {
    this.filters.push([column, value]);
    return this;
  }

  upsert(values: any, _options?: { onConflict?: string }): FakeQuery {
    this.action = "upsert";
    this.payload = values;
    return this;
  }

  insert(values: any): FakeQuery {
    this.action = "upsert";
    this.payload = values;
    return this;
  }

  update(values: Record<string, unknown>): FakeQuery {
    this.action = "update";
    this.payload = values;
    return this;
  }

  maybeSingle(): Promise<RemoteResult<any>> {
    return this.run(true);
  }

  single(): Promise<RemoteResult<any>> {
    return this.run(true);
  }

  then<TResult1 = RemoteResult<any>, TResult2 = never>(
    onfulfilled?:
      | ((value: RemoteResult<any>) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.run(false).then(onfulfilled, onrejected);
  }

  private matches(row: any): boolean {
    return this.filters.every(([column, value]) => row[column] === value);
  }

  private async run(single: boolean): Promise<RemoteResult<any>> {
    const { db } = this;
    if (this.table === "user_stores") {
      if (this.action === "upsert") {
        const values = Array.isArray(this.payload) ? this.payload : [this.payload];
        for (const value of values) {
          db.userStores.set(`${value.user_id}:${value.store_id}`, { ...value });
        }
        return { data: null, error: null };
      }
      const rows = [...db.userStores.values()].filter((row) => this.matches(row));
      return { data: single ? (rows[0] ?? null) : rows, error: null };
    }
    if (this.table === "user_stats") {
      if (this.action === "upsert") {
        const values = Array.isArray(this.payload) ? this.payload : [this.payload];
        for (const value of values) db.userStats.set(value.user_id, { ...value });
        return { data: null, error: null };
      }
      const rows = [...db.userStats.values()].filter((row) => this.matches(row));
      return { data: single ? (rows[0] ?? null) : rows, error: null };
    }
    if (this.table === "profiles") {
      if (this.action === "upsert") {
        const value = this.payload;
        if (typeof value.username === "string") {
          for (const [id, row] of db.profiles) {
            if (id !== value.id && row.username === value.username) {
              return {
                data: null,
                error: {
                  code: "23505",
                  message: "duplicate key value violates unique constraint",
                },
              };
            }
          }
        }
        const existing = db.profiles.get(value.id) ?? {};
        db.profiles.set(value.id, { ...existing, ...value });
        return { data: null, error: null };
      }
      if (this.action === "update") {
        for (const [id, row] of [...db.profiles.entries()]) {
          if (this.matches(row)) db.profiles.set(id, { ...row, ...this.payload });
        }
        return { data: null, error: null };
      }
      const rows = [...db.profiles.values()].filter((row) => this.matches(row));
      return { data: single ? (rows[0] ?? null) : rows, error: null };
    }
    return { data: single ? null : [], error: null };
  }
}

class FakeAuth {
  session: RemoteSession | null;
  calls: string[] = [];
  lastOtp: { email: string; options?: { emailRedirectTo?: string } } | null = null;
  private listeners = new Set<
    (event: string, session: RemoteSession | null) => void
  >();

  constructor(session: RemoteSession | null) {
    this.session = session;
  }

  async getSession(): Promise<RemoteResult<{ session: RemoteSession | null }>> {
    this.calls.push("getSession");
    return { data: { session: this.session }, error: null };
  }

  onAuthStateChange(
    callback: (event: string, session: RemoteSession | null) => void,
  ): { data: { subscription: { unsubscribe: () => void } } } {
    this.listeners.add(callback);
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners.delete(callback);
          },
        },
      },
    };
  }

  async signInWithOtp(args: {
    email: string;
    options?: { emailRedirectTo?: string };
  }): Promise<RemoteResult<unknown>> {
    this.calls.push("signInWithOtp");
    this.lastOtp = args;
    return { data: {}, error: null };
  }

  async signOut(): Promise<RemoteResult<unknown>> {
    this.calls.push("signOut");
    this.session = null;
    this.emit("SIGNED_OUT", null);
    return { data: {}, error: null };
  }

  emit(event: string, session: RemoteSession | null): void {
    for (const callback of [...this.listeners]) callback(event, session);
  }
}

interface Fake {
  client: RemoteClient;
  db: FakeDb;
  auth: FakeAuth;
}

function makeFakeClient(session: RemoteSession | null = null): Fake {
  const db = new FakeDb();
  const auth = new FakeAuth(session);
  const client: RemoteClient = {
    auth,
    from: (table: string) => new FakeQuery(db, table) as unknown as RemoteQuery,
  };
  return { client, db, auth };
}

const SESSION: RemoteSession = { user: { id: "u-1", email: "user@example.com" } };

function enableSession(email = "user@example.com"): void {
  setCachedSession({ userId: "u-1", email });
}

function dateKeyDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

const EASY = PROBLEMS.find((problem) => problem.difficulty === "Easy")!;
const MEDIUM = PROBLEMS.find((problem) => problem.difficulty === "Medium")!;
const HARD = PROBLEMS.find((problem) => problem.difficulty === "Hard")!;

/* ─────────────────────────────── init ───────────────────────────────────── */

describe("initRemoteSync", () => {
  test("no-ops when Supabase is not configured", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const { client, auth } = makeFakeClient(SESSION);
    setRemoteClient(client);

    await initRemoteSync();

    expect(auth.calls).toHaveLength(0);
    expect(getSyncState().status).toBe("unconfigured");
    expect(getSyncState().email).toBeNull();
  });
});

/* ─────────────────────────────── push ───────────────────────────────────── */

describe("remotePush", () => {
  test("writes a user_stores row and a user_stats rollup for progress", async () => {
    const { client, db } = makeFakeClient(SESSION);
    setRemoteClient(client);
    enableSession();

    const progress = {
      [EASY.id]: { solved: true, solvedAt: "2026-01-01T10:00:00.000Z" },
      [MEDIUM.id]: { solved: true, solvedAt: "2026-01-02T10:00:00.000Z" },
    };
    stub.setItem("deepforge:progress:v1", JSON.stringify(progress));
    const yesterday = dateKeyDaysAgo(1);
    const twoDaysAgo = dateKeyDaysAgo(2);
    const daily: DailyState = {
      lastSolvedDate: yesterday,
      streak: 2,
      solvedDates: [twoDaysAgo, yesterday],
    };
    stub.setItem("deepforge:daily:v1", JSON.stringify(daily));

    await remotePush("progress");

    const row = db.userStores.get("u-1:progress");
    expect(row).toBeTruthy();
    expect(row.store_id).toBe("progress");
    expect(row.data).toEqual(progress);

    const stats = db.userStats.get("u-1");
    expect(stats).toBeTruthy();
    expect(stats.score).toBe(getProgress()[EASY.id].solved ? 1 + 3 : 0);
    expect(stats.solved).toBe(2);
    expect(stats.current_streak).toBe(2);
    expect(stats.longest_streak).toBe(2);
  });

  test("does nothing without a cached session", async () => {
    const { client, db } = makeFakeClient(SESSION);
    setRemoteClient(client);
    stub.setItem("deepforge:progress:v1", JSON.stringify({ [EASY.id]: { solved: true } }));

    await remotePush("progress");

    expect(db.userStores.size).toBe(0);
    expect(db.userStats.size).toBe(0);
  });
});

/* ─────────────────────────────── pull ───────────────────────────────────── */

describe("remotePull", () => {
  test("merges remote and local progress with sticky solved and earliest solvedAt", async () => {
    const { client, db } = makeFakeClient(SESSION);
    setRemoteClient(client);
    enableSession();

    stub.setItem(
      "deepforge:progress:v1",
      JSON.stringify({
        [EASY.id]: {
          attempted: true,
          solved: true,
          solvedAt: "2026-02-10T00:00:00.000Z",
          savedCode: "local-code",
          lastOpened: "2026-02-10T00:00:00.000Z",
        },
      }),
    );
    db.userStores.set("u-1:progress", {
      user_id: "u-1",
      store_id: "progress",
      data: {
        [EASY.id]: {
          attempted: true,
          solved: true,
          solvedAt: "2026-02-01T00:00:00.000Z",
          savedCode: "remote-code",
          lastOpened: "2026-02-01T00:00:00.000Z",
        },
        [HARD.id]: { solved: true, solvedAt: "2026-02-05T00:00:00.000Z" },
      },
      updated_at: "2026-02-11T00:00:00.000Z",
    });

    await remotePull("progress");

    const merged = getProgress();
    expect(merged[EASY.id].solved).toBe(true);
    expect(merged[EASY.id].attempted).toBe(true);
    expect(merged[EASY.id].solvedAt).toBe("2026-02-01T00:00:00.000Z");
    expect(merged[EASY.id].savedCode).toBe("local-code");
    expect(merged[HARD.id].solved).toBe(true);
    expect(dispatched).toContain("deepforge:progress-change");
  });

  test("unions daily dates and recomputes the streak", async () => {
    const { client, db } = makeFakeClient(SESSION);
    setRemoteClient(client);
    enableSession();

    stub.setItem(
      "deepforge:daily:v1",
      JSON.stringify({
        lastSolvedDate: "2026-01-02",
        streak: 2,
        solvedDates: ["2026-01-01", "2026-01-02"],
      }),
    );
    db.userStores.set("u-1:daily", {
      user_id: "u-1",
      store_id: "daily",
      data: {
        lastSolvedDate: "2026-01-03",
        streak: 2,
        solvedDates: ["2026-01-02", "2026-01-03"],
      },
      updated_at: "2026-01-03T00:00:00.000Z",
    });

    await remotePull("daily");

    const daily = getDailyState();
    expect(daily.solvedDates).toEqual(["2026-01-01", "2026-01-02", "2026-01-03"]);
    expect(daily.streak).toBe(3);
    expect(daily.lastSolvedDate).toBe("2026-01-03");
    expect(dispatched).toContain("deepforge:daily-change");
  });

  test("keeps the max lab best, max attempts, and sticky passed", async () => {
    const { client, db } = makeFakeClient(SESSION);
    setRemoteClient(client);
    enableSession();

    stub.setItem(
      "deepforge:labs",
      JSON.stringify({ "lab-01": { best: 0.5, attempts: 1, passed: false } }),
    );
    db.userStores.set("u-1:labs", {
      user_id: "u-1",
      store_id: "labs",
      data: {
        "lab-01": {
          best: 0.9,
          attempts: 2,
          passed: true,
          lastScoredAt: "2026-01-03T00:00:00.000Z",
        },
        "lab-02": { best: null, attempts: 3, passed: false },
      },
      updated_at: "2026-01-03T00:00:00.000Z",
    });

    await remotePull("labs");

    const records = getLabRecords();
    expect(records["lab-01"]).toEqual({
      best: 0.9,
      attempts: 2,
      passed: true,
      lastScoredAt: "2026-01-03T00:00:00.000Z",
    });
    expect(records["lab-02"]).toEqual({ best: null, attempts: 3, passed: false });
  });

  test("keeps shield fields and continues the streak across a covered day", async () => {
    const { client, db } = makeFakeClient(SESSION);
    setRemoteClient(client);
    enableSession();

    const today = dateKeyDaysAgo(0);
    const yesterday = dateKeyDaysAgo(1);
    const twoDaysAgo = dateKeyDaysAgo(2);
    const threeDaysAgo = dateKeyDaysAgo(3);
    stub.setItem(
      "deepforge:daily:v1",
      JSON.stringify({
        lastSolvedDate: yesterday,
        streak: 2,
        solvedDates: [threeDaysAgo, twoDaysAgo],
        shields: 1,
        shieldUsedDates: [yesterday],
      }),
    );
    db.userStores.set("u-1:daily", {
      user_id: "u-1",
      store_id: "daily",
      data: {
        lastSolvedDate: twoDaysAgo,
        streak: 2,
        solvedDates: [threeDaysAgo, twoDaysAgo],
      },
      updated_at: "2026-01-01T00:00:00.000Z",
    });

    await remotePull("daily");

    const state = getDailyState();
    expect(state.shields).toBe(1);
    expect(state.shieldUsedDates).toEqual([yesterday]);
    expect(state.lastSolvedDate).toBe(yesterday);

    const after = markDailySolved(new Date());
    expect(after.streak).toBe(3);
    expect(after.solvedDates).toContain(today);
    expect(after.solvedDates).not.toContain(yesterday);
  });

  test("merges explanations per problem and dispatches the store event", async () => {
    const { client, db } = makeFakeClient(SESSION);
    setRemoteClient(client);
    enableSession();

    const entry = (text: string, at: string) => ({
      text,
      at,
      coverage: 1,
      completeness: 1,
      score: 1,
      hits: [],
      skipped: false,
    });
    stub.setItem(
      "deepforge:explanations:v1",
      JSON.stringify({
        p1: [entry("local", "2026-01-01T00:00:00.000Z")],
      }),
    );
    db.userStores.set("u-1:explanations", {
      user_id: "u-1",
      store_id: "explanations",
      data: {
        p1: [entry("remote", "2026-02-01T00:00:00.000Z")],
        p2: [entry("remote-only", "2026-02-01T00:00:00.000Z")],
      },
      updated_at: "2026-02-01T00:00:00.000Z",
    });

    await remotePull("explanations");

    const stored = JSON.parse(stub.getItem("deepforge:explanations:v1") as string);
    expect(stored.p1[0].text).toBe("remote");
    expect(stored.p2[0].text).toBe("remote-only");
    expect(dispatched).toContain("deepforge:explanation-change");
  });

  test("never throws on a malformed remote payload", async () => {
    const { client, db } = makeFakeClient(SESSION);
    setRemoteClient(client);
    enableSession();

    db.userStores.set("u-1:progress", {
      user_id: "u-1",
      store_id: "progress",
      data: ["not", "a", "map"],
      updated_at: "2026-01-01T00:00:00.000Z",
    });
    db.userStores.set("u-1:explanations", {
      user_id: "u-1",
      store_id: "explanations",
      data: "junk",
      updated_at: "2026-01-01T00:00:00.000Z",
    });

    await remotePull("progress");
    await remotePull("explanations");

    expect(getProgress()).toEqual({});
    expect(stub.getItem("deepforge:progress:v1")).toBe("{}");
    expect(stub.getItem("deepforge:explanations:v1")).toBe("{}");
  });

  test("merges reviews with the newer schedule on pull", async () => {
    const { client, db } = makeFakeClient(SESSION);
    setRemoteClient(client);
    enableSession();

    const older = {
      ease: 2.5,
      interval: 6,
      due: "2026-01-10",
      reps: 2,
      lapses: 0,
      lastGrade: 5,
      lastReviewedAt: "2026-01-04T00:00:00.000Z",
    };
    const newer = {
      ease: 2.3,
      interval: 1,
      due: "2026-02-01",
      reps: 0,
      lapses: 1,
      lastGrade: 4,
      lastReviewedAt: "2026-01-20T00:00:00.000Z",
    };
    stub.setItem("deepforge:reviews:v1", JSON.stringify({ p1: older }));
    db.userStores.set("u-1:reviews", {
      user_id: "u-1",
      store_id: "reviews",
      data: { p1: newer, p2: newer },
      updated_at: "2026-02-01T00:00:00.000Z",
    });

    await remotePull("reviews");

    const stored = JSON.parse(stub.getItem("deepforge:reviews:v1") as string);
    expect(stored.p1.lastReviewedAt).toBe("2026-01-20T00:00:00.000Z");
    expect(stored.p2.lastReviewedAt).toBe("2026-01-20T00:00:00.000Z");
    expect(dispatched).toContain("deepforge:reviews-change");
  });

  test("pulls junk payloads for every registered store without throwing", async () => {
    const { client, db } = makeFakeClient(SESSION);
    setRemoteClient(client);
    enableSession();

    const ids: StoreId[] = [
      "progress",
      "daily",
      "collections",
      "contests",
      "interview",
      "penpaper",
      "labs",
      "research",
      "reviews",
      "explanations",
      "username",
    ];
    const junk = [null, 42, "junk", ["a", "b"]];
    ids.forEach((id, index) => {
      db.userStores.set(`u-1:${id}`, {
        user_id: "u-1",
        store_id: id,
        data: junk[index % junk.length],
        updated_at: "2026-01-01T00:00:00.000Z",
      });
    });

    for (const id of ids) await remotePull(id);

    expect(stub.getItem("deepforge:progress:v1")).toBe("{}");
    expect(stub.getItem("deepforge:daily:v1")).toBe(
      JSON.stringify({ lastSolvedDate: null, streak: 0, solvedDates: [] }),
    );
    expect(stub.getItem("deepforge:collections:v1")).toBe("[]");
    expect(stub.getItem("deepforge:labs")).toBe("{}");
    expect(stub.getItem("deepforge:reviews:v1")).toBe("{}");
    expect(stub.getItem("deepforge:explanations:v1")).toBe("{}");
  });

  test("pushes local state when the remote row is missing", async () => {
    const { client, db } = makeFakeClient(SESSION);
    setRemoteClient(client);
    enableSession();

    const collections = [
      {
        id: "col-1",
        name: "Mine",
        description: "",
        problemIds: [EASY.id],
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ];
    stub.setItem("deepforge:collections:v1", JSON.stringify(collections));

    await remotePull("collections");

    expect(db.userStores.get("u-1:collections").data).toEqual(collections);
  });
});

/* ────────────────────────────── merge rules ─────────────────────────────── */

describe("merge rules", () => {
  test("research keeps the best score per direction and ORs beatenBaseline", () => {
    const lower = "nonlinear-regression-chase";
    const higher = "tabular-classification-showdown";
    const merged = mergeResearch(
      {
        [lower]: {
          bestScore: 0.4,
          bestAt: "2026-01-01T00:00:00.000Z",
          beatenBaseline: false,
          attempts: [{ score: 0.4, at: "2026-01-01T00:00:00.000Z" }],
        },
        [higher]: { bestScore: 0.7, bestAt: null, beatenBaseline: false, attempts: [] },
      },
      {
        [lower]: {
          bestScore: 0.2,
          bestAt: "2026-01-02T00:00:00.000Z",
          beatenBaseline: true,
          attempts: [{ score: 0.2, at: "2026-01-02T00:00:00.000Z" }],
        },
        [higher]: { bestScore: 0.8, bestAt: null, beatenBaseline: false, attempts: [] },
      },
    );
    expect(merged[lower].bestScore).toBe(0.2);
    expect(merged[lower].beatenBaseline).toBe(true);
    expect(merged[lower].attempts).toHaveLength(2);
    expect(merged[higher].bestScore).toBe(0.8);
  });

  test("research caps the attempt union at 50", () => {
    const id = "tabular-classification-showdown";
    const attempts = Array.from({ length: 60 }, (_, index) => ({
      score: index,
      at: new Date(Date.UTC(2026, 0, 1, 0, 0, index)).toISOString(),
    }));
    const merged = mergeResearch(
      {},
      { [id]: { bestScore: 59, bestAt: null, beatenBaseline: false, attempts } },
    );
    expect(merged[id].attempts).toHaveLength(50);
    expect(merged[id].attempts[49].score).toBe(59);
  });

  test("penpaper keeps correct sticky and the latest lastAt", () => {
    const merged = mergePenPaper(
      { p1: { attempted: true, correct: false, lastAt: "2026-01-02T00:00:00.000Z" } },
      {
        p1: { attempted: true, correct: true, lastAt: "2026-01-01T00:00:00.000Z" },
        p2: { attempted: true, correct: false, lastAt: "2026-01-03T00:00:00.000Z" },
      },
    );
    expect(merged.p1.correct).toBe(true);
    expect(merged.p1.lastAt).toBe("2026-01-02T00:00:00.000Z");
    expect(merged.p2.attempted).toBe(true);
  });

  test("contests append-merge dedupes by contestId and completedAt", () => {
    const result = {
      contestId: "c1",
      score: 3,
      solved: 2,
      total: 4,
      durationSeconds: 60,
      completedAt: "2026-01-01T00:00:00.000Z",
    };
    const merged = mergeContests(
      [result],
      [result, { ...result, completedAt: "2026-01-02T00:00:00.000Z" }],
    );
    expect(merged).toHaveLength(2);
    expect(merged[0].completedAt).toBe("2026-01-01T00:00:00.000Z");
    expect(merged[1].completedAt).toBe("2026-01-02T00:00:00.000Z");
  });

  test("collections resolve per-item by updatedAt and keep both ids", () => {
    const older = {
      id: "col-1",
      name: "old",
      description: "",
      problemIds: [] as string[],
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    const newer = { ...older, name: "new", updatedAt: "2026-01-02T00:00:00.000Z" };
    const merged = mergeCollections([older], [newer, { ...older, id: "col-2" }]);
    expect(merged.map((collection) => collection.id)).toEqual(["col-1", "col-2"]);
    expect(merged[0].name).toBe("new");
  });

  test("username prefers local unless it is empty", () => {
    expect(mergeUsername("", "Ada")).toBe("Ada");
    expect(mergeUsername("local", "remote")).toBe("local");
    expect(mergeUsername("", "")).toBe("");
  });

  test("daily preserves shield fields and the covered-day anchor", () => {
    const merged = mergeDaily(
      {
        lastSolvedDate: "2026-01-05",
        streak: 3,
        solvedDates: ["2026-01-03", "2026-01-04", "2026-01-05"],
        shields: 2,
        shieldUsedDates: ["2026-01-06", "not-a-date"],
      },
      {
        lastSolvedDate: "2026-01-04",
        streak: 2,
        solvedDates: ["2026-01-03", "2026-01-04"],
        shields: 1,
        shieldUsedDates: ["2026-01-06"],
      },
    );
    expect(merged.shields).toBe(2);
    expect(merged.shieldUsedDates).toEqual(["2026-01-06"]);
    expect(merged.lastSolvedDate).toBe("2026-01-06");
    expect(merged.streak).toBe(3);
    expect(merged.solvedDates).toEqual([
      "2026-01-03",
      "2026-01-04",
      "2026-01-05",
    ]);
  });

  test("daily counts the streak across a shield-covered gap", () => {
    const merged = mergeDaily(
      {
        lastSolvedDate: "2026-01-04",
        streak: 3,
        solvedDates: ["2026-01-01", "2026-01-02", "2026-01-04"],
        shields: 1,
        shieldUsedDates: ["2026-01-03"],
      },
      {
        lastSolvedDate: "2026-01-02",
        streak: 2,
        solvedDates: ["2026-01-01", "2026-01-02"],
      },
    );
    expect(merged.lastSolvedDate).toBe("2026-01-04");
    expect(merged.streak).toBe(3);
    expect(merged.shields).toBe(1);
    expect(merged.shieldUsedDates).toEqual(["2026-01-03"]);
  });

  test("daily keeps the legacy shape when neither side has shield fields", () => {
    const legacy: DailyState = {
      lastSolvedDate: "2026-01-02",
      streak: 2,
      solvedDates: ["2026-01-01", "2026-01-02"],
    };
    const merged = mergeDaily(legacy, legacy);
    expect("shields" in merged).toBe(false);
    expect("shieldUsedDates" in merged).toBe(false);
    expect(merged).toEqual(legacy);
  });

  test("explanations resolve per problem by the newest entry", () => {
    const entry = (text: string, at: string) => ({
      text,
      at,
      coverage: 1,
      completeness: 1,
      score: 1,
      hits: [],
      skipped: false,
    });
    const merged = mergeExplanations(
      {
        p1: [entry("local", "2026-01-01T00:00:00.000Z")],
        p2: [entry("local-only", "2026-01-01T00:00:00.000Z")],
        p3: "not-an-array" as unknown as never,
      },
      {
        p1: [entry("remote", "2026-02-01T00:00:00.000Z")],
        p3: [entry("remote-only", "2026-02-01T00:00:00.000Z")],
        p4: [{ at: "" } as unknown as never],
      },
    );
    expect(merged.p1[0].text).toBe("remote");
    expect(merged.p2[0].text).toBe("local-only");
    expect(merged.p3[0].text).toBe("remote-only");
    expect(merged.p4).toBeUndefined();
  });

  test("explanations cap history at 20 and keep local on an equal newest time", () => {
    const entries = (prefix: string) =>
      Array.from({ length: 25 }, (_, index) => ({
        text: `${prefix}-${index}`,
        at: new Date(Date.UTC(2026, 0, 1, 0, 0, index)).toISOString(),
        coverage: 0,
        completeness: 0,
        score: 0,
        hits: [],
        skipped: false,
      }));
    const merged = mergeExplanations(
      { p1: entries("local") },
      { p1: entries("remote") },
    );
    expect(merged.p1).toHaveLength(20);
    expect(merged.p1[19].text).toBe("local-24");
  });

  test("reviews keep the newer schedule and drop malformed entries", () => {
    const older = {
      ease: 2.5,
      interval: 6,
      due: "2026-01-10",
      reps: 2,
      lapses: 0,
      lastGrade: 5 as const,
      lastReviewedAt: "2026-01-04T00:00:00.000Z",
    };
    const newer = {
      ease: 2.3,
      interval: 1,
      due: "2026-02-01",
      reps: 0,
      lapses: 1,
      lastGrade: 0 as const,
      lastReviewedAt: "2026-01-20T00:00:00.000Z",
    };
    const merged = mergeReviews(
      { p1: older, p2: older },
      { p1: newer, p2: "junk" as unknown as never, p3: newer },
    );
    expect(merged.p1.lastReviewedAt).toBe("2026-01-20T00:00:00.000Z");
    expect(merged.p2.lastReviewedAt).toBe("2026-01-04T00:00:00.000Z");
    expect(merged.p3.lastReviewedAt).toBe("2026-01-20T00:00:00.000Z");
  });

  test("labs keep the latest scored-run timestamp and legacy shape", () => {
    const merged = mergeLabs(
      { "lab-01": { best: 0.5, attempts: 1, passed: false } },
      {
        "lab-01": {
          best: 0.9,
          attempts: 2,
          passed: true,
          lastScoredAt: "2026-01-03T00:00:00.000Z",
        },
      },
    );
    expect(merged["lab-01"]).toEqual({
      best: 0.9,
      attempts: 2,
      passed: true,
      lastScoredAt: "2026-01-03T00:00:00.000Z",
    });

    const olderRemote = mergeLabs(
      {
        "lab-01": {
          best: 0.9,
          attempts: 2,
          passed: true,
          lastScoredAt: "2026-02-01T00:00:00.000Z",
        },
      },
      {
        "lab-01": {
          best: 0.5,
          attempts: 1,
          passed: false,
          lastScoredAt: "2026-01-01T00:00:00.000Z",
        },
      },
    );
    expect(olderRemote["lab-01"].lastScoredAt).toBe("2026-02-01T00:00:00.000Z");

    const legacy = mergeLabs(
      { "lab-01": { best: 0.5, attempts: 1, passed: false } },
      { "lab-01": { best: 0.9, attempts: 2, passed: true } },
    );
    expect("lastScoredAt" in legacy["lab-01"]).toBe(false);
  });

  test("every merge survives partial, legacy, and malformed payloads", () => {
    const anyOf = (value: unknown): any => value;
    const junk = [null, undefined, 42, "junk", [], true];
    for (const value of junk) {
      // A throw here fails the test; the point is that none of them do.
      mergeProgress(anyOf(value), anyOf(value));
      mergeDaily(anyOf(value), anyOf(value));
      mergeCollections(anyOf(value), anyOf(value));
      mergeContests(anyOf(value), anyOf(value));
      mergeInterview(anyOf(value), anyOf(value));
      mergePenPaper(anyOf(value), anyOf(value));
      mergeLabs(anyOf(value), anyOf(value));
      mergeResearch(anyOf(value), anyOf(value));
      mergeReviews(anyOf(value), anyOf(value));
      mergeExplanations(anyOf(value), anyOf(value));
      mergeUsername(anyOf(value), anyOf(value));
    }

    expect(mergeProgress(anyOf({ p1: "junk" }), anyOf({ p2: null }))).toEqual({});
    expect(mergeDaily(anyOf({ streak: 4 }), anyOf(null))).toEqual({
      lastSolvedDate: null,
      streak: 0,
      solvedDates: [],
    });
    expect(mergeLabs(anyOf({ bad: "junk" }), anyOf({ worse: 7 }))).toEqual({});
    expect(mergePenPaper(anyOf({ bad: "junk" }), anyOf({ worse: 7 }))).toEqual({});
    expect(mergeResearch(anyOf({ bad: "junk" }), anyOf({ worse: 7 }))).toEqual({});
    expect(mergeReviews(anyOf({ bad: "junk" }), anyOf({ worse: 7 }))).toEqual({});
    expect(mergeExplanations(anyOf({ bad: "junk" }), anyOf({ worse: 7 }))).toEqual(
      {},
    );
    expect(mergeCollections(anyOf(null), anyOf(null))).toEqual([]);
    expect(mergeContests(anyOf("junk"), anyOf(42))).toEqual([]);
    expect(mergeInterview(anyOf("junk"), anyOf(42))).toEqual([]);
    expect(mergeUsername(anyOf(null), anyOf([1, 2]))).toBe("");
  });
});

/* ──────────────────────────── first sign-in ─────────────────────────────── */

describe("afterSignIn", () => {
  test("first sign-in pushes every store, claims the username, and sets synced_at", async () => {
    const { client, db } = makeFakeClient(SESSION);
    setRemoteClient(client);

    stub.setItem("deepforge:username:v1", "Ada");
    stub.setItem(
      "deepforge:progress:v1",
      JSON.stringify({ [EASY.id]: { solved: true, solvedAt: "2026-01-01T10:00:00.000Z" } }),
    );

    await initRemoteSync();

    const storeIds = [
      "progress",
      "daily",
      "collections",
      "contests",
      "interview",
      "penpaper",
      "labs",
      "research",
      "reviews",
      "explanations",
      "username",
    ];
    for (const id of storeIds) {
      expect(db.userStores.has(`u-1:${id}`)).toBe(true);
    }
    expect(db.userStores.get("u-1:username").data).toBe("Ada");
    expect(db.userStats.get("u-1").solved).toBe(1);

    const profile = db.profiles.get("u-1");
    expect(profile.username).toBe("Ada");
    expect(typeof profile.synced_at).toBe("string");

    expect(getSyncState().status).toBe("idle");
    expect(getSyncState().email).toBe("user@example.com");
  });

  test("derives the username from the email and suffixes on unique conflicts", async () => {
    const { client, db } = makeFakeClient({
      user: { id: "u-1", email: "grace@example.com" },
    });
    setRemoteClient(client);
    db.profiles.set("someone-else", { id: "someone-else", username: "grace" });

    await initRemoteSync();

    expect(db.profiles.get("u-1").username).toBe("grace-2");
    expect(stub.getItem("deepforge:username:v1")).toBe("grace-2");
  });
});

/* ─────────────────────── explanations push bridge ───────────────────────── */

describe("explanation push bridge", () => {
  test("explanation writes schedule a debounced push", async () => {
    const { client } = makeFakeClient(SESSION);
    setRemoteClient(client);

    await initRemoteSync();

    const calls: StoreId[] = [];
    registerSyncer(async (id) => {
      calls.push(id);
    });

    jest.useFakeTimers();
    try {
      recordExplanation("p-1", "because the loop advances the pointer", {
        coverage: 1,
        completeness: 1,
        score: 1,
        hits: [],
      });
      expect(calls).toEqual([]);

      jest.advanceTimersByTime(1500);
      expect(calls).toEqual(["explanations"]);
    } finally {
      jest.useRealTimers();
    }
  });
});

/* ─────────────────────────────── sign-out ───────────────────────────────── */

describe("signOut", () => {
  test("keeps local data and flips to the signed-out state", async () => {
    const { client, db, auth } = makeFakeClient(SESSION);
    setRemoteClient(client);
    enableSession();

    const progress = { [EASY.id]: { solved: true } };
    stub.setItem("deepforge:progress:v1", JSON.stringify(progress));

    await signOut();

    expect(auth.calls).toContain("signOut");
    expect(db.userStores.size).toBe(0);
    expect(getProgress()).toEqual(progress);
    expect(stub.getItem("deepforge:progress:v1")).not.toBeNull();
    expect(getSyncState().status).toBe("signed-out");
    expect(getSyncState().email).toBeNull();
    expect(dispatched).toContain("deepforge:sync-change");
  });
});

/* ─────────────────────────────── sync now ───────────────────────────────── */

describe("syncNow", () => {
  test("pushes and pulls every store, then records lastSyncedAt", async () => {
    const { client, db } = makeFakeClient(SESSION);
    setRemoteClient(client);
    enableSession();
    stub.setItem(
      "deepforge:progress:v1",
      JSON.stringify({ [EASY.id]: { solved: true, solvedAt: "2026-01-01T10:00:00.000Z" } }),
    );

    await syncNow();

    expect(db.userStores.has("u-1:progress")).toBe(true);
    for (const id of [
      "progress",
      "daily",
      "collections",
      "contests",
      "interview",
      "penpaper",
      "labs",
      "research",
      "reviews",
      "explanations",
    ]) {
      expect(db.userStores.has(`u-1:${id}`)).toBe(true);
    }
    expect(db.userStores.has("u-1:username")).toBe(false);
    expect(getSyncState().lastSyncedAt).not.toBeNull();
    expect(stub.getItem("deepforge:sync:v1")).not.toBeNull();
    expect(getSyncState().status).toBe("idle");
  });
});

/* ───────────────────────────── auth surface ─────────────────────────────── */

describe("auth", () => {
  test("getAuthEmail reflects the cached session", () => {
    expect(getAuthEmail()).toBeNull();
    enableSession("ada@example.com");
    expect(getAuthEmail()).toBe("ada@example.com");
  });

  test("signInWithEmail sends an OTP with the origin redirect", async () => {
    const { client, auth } = makeFakeClient(null);
    setRemoteClient(client);

    const result = await signInWithEmail(" ada@example.com ");

    expect(result.error).toBeNull();
    expect(auth.lastOtp?.email).toBe("ada@example.com");
    expect(auth.lastOtp?.options?.emailRedirectTo).toBe("http://localhost:3001");
  });

  test("signInWithEmail is safe when unconfigured", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    const result = await signInWithEmail("ada@example.com");

    expect(result.error).toBe("Sync is not configured.");
  });
});
