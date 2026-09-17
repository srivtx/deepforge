import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { setCachedSession } from "@/lib/sync/backend";
import {
  setRemoteClient,
  type RemoteClient,
  type RemoteResult,
} from "@/lib/sync/remote";
import {
  buildGroupBoard,
  createGroup,
  currentDailyStreak,
  currentSolveStreak,
  formatNudgeCooldown,
  getGroupLeaderboard,
  getGroupSnapshot,
  groupStreakFromMembers,
  joinGroup,
  leaveGroup,
  listGroupNudges,
  listMyGroups,
  markNudgeSeen,
  NUDGE_COOLDOWN_MS,
  nudgeCooldownRemaining,
  sendNudge,
  startOfWeekKey,
  subscribeRealtime,
  weeklySolvedCount,
  type GroupSnapshot,
  type StudyGroup,
} from "@/lib/sync/social";

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
    location: { origin: "http://localhost:3001", href: "http://localhost:3001/" },
    dispatchEvent: () => true,
  };
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  delete process.env.NEXT_PUBLIC_SOCIAL_REALTIME;
  setCachedSession(null);
  setRemoteClient(null);
});

afterEach(() => {
  setRemoteClient(null);
  setCachedSession(null);
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  delete process.env.NEXT_PUBLIC_SOCIAL_REALTIME;
  if (hadWindow) globalScope.window = originalWindow;
  else delete globalScope.window;
});

type Row = Record<string, any>;

interface SelectRecord {
  table: string;
  columns: string | null;
  filters: Array<[string, unknown]>;
  inFilters: Array<[string, unknown[]]>;
  orders: Array<[string, { ascending?: boolean }]>;
  range: [number, number] | null;
}

class FakeQuery implements PromiseLike<RemoteResult<any>> {
  private filters: Array<[string, unknown]> = [];
  private inFilters: Array<[string, unknown[]]> = [];
  private orders: Array<[string, { ascending?: boolean }]> = [];
  private window: [number, number] | null = null;
  private columns: string | null = null;
  private action: "select" | "insert" | "update" | "upsert" | "delete" =
    "select";
  private payload: Row | Row[] | null = null;
  private conflictColumns: string[] = [];

  constructor(
    private db: FakeDb,
    private table: string,
  ) {}

  select(columns?: string): FakeQuery {
    this.columns = columns ?? null;
    return this;
  }

  eq(column: string, value: unknown): FakeQuery {
    this.filters.push([column, value]);
    return this;
  }

  in(column: string, values: readonly unknown[]): FakeQuery {
    this.inFilters.push([column, [...values]]);
    return this;
  }

  order(column: string, options?: { ascending?: boolean }): FakeQuery {
    this.orders.push([column, options ?? {}]);
    return this;
  }

  range(from: number, to: number): FakeQuery {
    this.window = [from, to];
    return this;
  }

  insert(values: Row | Row[]): FakeQuery {
    this.action = "insert";
    this.payload = values;
    return this;
  }

  update(values: Row): FakeQuery {
    this.action = "update";
    this.payload = values;
    return this;
  }

  upsert(values: Row | Row[], options?: { onConflict?: string }): FakeQuery {
    this.action = "upsert";
    this.payload = values;
    this.conflictColumns = (options?.onConflict ?? "")
      .split(",")
      .map((column) => column.trim())
      .filter(Boolean);
    return this;
  }

  delete(): FakeQuery {
    this.action = "delete";
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

  private matches(row: Row): boolean {
    return (
      this.filters.every(([column, value]) => row[column] === value) &&
      this.inFilters.every(([column, values]) => values.includes(row[column]))
    );
  }

  private async run(single: boolean): Promise<RemoteResult<any>> {
    const rows = this.db.rows(this.table);

    if (this.action === "insert") {
      if (this.db.insertErrors.has(this.table)) {
        return {
          data: null,
          error: { message: `insert failed: ${this.table}` },
        };
      }
      const values = Array.isArray(this.payload)
        ? this.payload
        : [this.payload as Row];
      for (const value of values) rows.push({ ...value });
      return { data: values.length === 1 ? values[0] : values, error: null };
    }

    const matched = rows.filter((row) => this.matches(row));

    if (this.action === "update") {
      if (this.db.updateErrors.has(this.table)) {
        return {
          data: null,
          error: { message: `update failed: ${this.table}` },
        };
      }
      for (const row of matched) Object.assign(row, this.payload);
      this.db.updates.push({
        table: this.table,
        filters: [...this.filters],
        payload: { ...(this.payload as Row) },
      });
      return { data: null, error: null };
    }

    if (this.action === "delete") {
      if (this.db.deleteErrors.has(this.table)) {
        return {
          data: null,
          error: { message: `delete failed: ${this.table}` },
        };
      }
      for (const row of matched) {
        const index = rows.indexOf(row);
        if (index >= 0) rows.splice(index, 1);
      }
      return { data: null, error: null };
    }

    if (this.action === "upsert") {
      if (this.db.upsertErrors.has(this.table)) {
        return {
          data: null,
          error: { message: `upsert failed: ${this.table}` },
        };
      }
      const values = Array.isArray(this.payload)
        ? this.payload
        : [this.payload as Row];
      for (const value of values) {
        const existing = rows.find((row) =>
          this.conflictColumns.every((column) => row[column] === value[column]),
        );
        if (existing) Object.assign(existing, value);
        else rows.push({ ...value });
      }
      this.db.upserts.push({
        table: this.table,
        values,
        conflict: [...this.conflictColumns],
      });
      return { data: values.length === 1 ? values[0] : values, error: null };
    }

    this.db.selects.push({
      table: this.table,
      columns: this.columns,
      filters: [...this.filters],
      inFilters: [...this.inFilters],
      orders: [...this.orders],
      range: this.window,
    });
    if (this.db.selectErrors.has(this.table)) {
      return {
        data: null,
        error: { message: `select failed: ${this.table}` },
      };
    }
    let result = matched;
    if (this.orders.length > 0) {
      result = [...result].sort((a, b) => {
        for (const [column, options] of this.orders) {
          const av = a[column];
          const bv = b[column];
          let cmp: number;
          if (typeof av === "string" && typeof bv === "string") {
            cmp = av.localeCompare(bv);
          } else {
            cmp = av === bv ? 0 : av < bv ? -1 : 1;
          }
          if (cmp !== 0) return options.ascending === false ? -cmp : cmp;
        }
        return 0;
      });
    }
    if (this.window) {
      result = result.slice(this.window[0], this.window[1] + 1);
    }
    return { data: single ? (result[0] ?? null) : result, error: null };
  }
}

class FakeChannel {
  handlers: Array<{
    event: string;
    scope: Row;
    callback: (payload: any) => void;
  }> = [];
  subscribed = false;
  unsubscribed = false;

  constructor(readonly name: string) {}

  on(_type: string, scope: Row, callback: (payload: any) => void): FakeChannel {
    this.handlers.push({ event: String(scope.event ?? "*"), scope, callback });
    return this;
  }

  subscribe(callback?: (status: string) => void): FakeChannel {
    this.subscribed = true;
    callback?.("SUBSCRIBED");
    return this;
  }

  unsubscribe(): Promise<string> {
    this.unsubscribed = true;
    return Promise.resolve("ok");
  }
}

type RpcHandler = (
  fn: string,
  args?: Record<string, unknown>,
) => RemoteResult<any> | Promise<RemoteResult<any>>;

class FakeDb {
  tables = new Map<string, Row[]>();
  rpcCalls: Array<{ fn: string; args?: Record<string, unknown> }> = [];
  rpcResult: RemoteResult<any> = { data: null, error: null };
  rpcHandler: RpcHandler | null = null;
  selectErrors = new Set<string>();
  insertErrors = new Set<string>();
  updateErrors = new Set<string>();
  upsertErrors = new Set<string>();
  deleteErrors = new Set<string>();
  selects: SelectRecord[] = [];
  updates: Array<{ table: string; filters: Array<[string, unknown]>; payload: Row }> =
    [];
  upserts: Array<{ table: string; values: Row[]; conflict: string[] }> = [];
  channels: FakeChannel[] = [];

  rows(table: string): Row[] {
    const existing = this.tables.get(table);
    if (existing) return existing;
    const created: Row[] = [];
    this.tables.set(table, created);
    return created;
  }
}

function makeClient(withRpc = true): { client: RemoteClient; db: FakeDb } {
  const db = new FakeDb();
  const base: Record<string, unknown> = {
    from: (table: string) => new FakeQuery(db, table),
  };
  if (withRpc) {
    base.rpc = (fn: string, args?: Record<string, unknown>) => {
      db.rpcCalls.push({ fn, args });
      if (db.rpcHandler) return db.rpcHandler(fn, args);
      return Promise.resolve(db.rpcResult);
    };
  }
  return { client: base as unknown as RemoteClient, db };
}

function makeRealtimeClient(): {
  client: RemoteClient;
  db: FakeDb;
  channels: FakeChannel[];
} {
  const db = new FakeDb();
  const base: Record<string, unknown> = {
    from: (table: string) => new FakeQuery(db, table),
    rpc: (fn: string, args?: Record<string, unknown>) => {
      db.rpcCalls.push({ fn, args });
      return Promise.resolve(db.rpcResult);
    },
    channel: (name: string) => {
      const channel = new FakeChannel(name);
      db.channels.push(channel);
      return channel;
    },
    removeChannel: (channel: FakeChannel) => {
      channel.unsubscribed = true;
      return Promise.resolve("ok");
    },
  };
  return { client: base as unknown as RemoteClient, db, channels: db.channels };
}

function handlerFor(
  channel: FakeChannel,
  table: string,
  event = "INSERT",
): (row: Row) => void {
  const handler = channel.handlers.find(
    (entry) => entry.event === event && entry.scope.table === table,
  );
  if (!handler) throw new Error(`missing ${event} handler for ${table}`);
  return (row: Row) => handler.callback({ new: row });
}

async function flushAsync(): Promise<void> {
  for (let i = 0; i < 8; i += 1) await Promise.resolve();
}

function configure(): void {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "pk_test";
}

function signIn(userId = "u-1"): void {
  setCachedSession({ userId, email: "ada@example.com" });
}

function remoteGroupRow(overrides: Row = {}): Row {
  return {
    id: "grp-1",
    name: "ML Crew",
    topic: "ml",
    path_ref: "ml-foundations",
    join_code: "ABCD2345",
    owner_id: "u-2",
    created_at: "2026-09-10T00:00:00.000Z",
    updated_at: "2026-09-10T00:00:00.000Z",
    ...overrides,
  };
}

function remoteMemberRow(userId: string, role = "member"): Row {
  return {
    group_id: "grp-1",
    user_id: userId,
    role,
    joined_at: "2026-09-10T00:00:00.000Z",
  };
}

function remoteActivityRow(userId: string, overrides: Row = {}): Row {
  return {
    group_id: "grp-1",
    user_id: userId,
    week_start: startOfWeekKey(),
    solved_count: 3,
    streak: 2,
    last_active_at: "2026-09-15T10:00:00.000Z",
    updated_at: "2026-09-15T10:00:00.000Z",
    ...overrides,
  };
}

function remoteNudgeRow(
  id: string,
  fromUser: string,
  toUser: string,
  overrides: Row = {},
): Row {
  return {
    id,
    group_id: "grp-1",
    from_user: fromUser,
    to_user: toUser,
    created_at: "2026-09-15T10:00:00.000Z",
    seen: false,
    ...overrides,
  };
}

function group(overrides: Partial<StudyGroup> = {}): StudyGroup {
  return {
    id: "grp-1",
    name: "ML Crew",
    topic: "ml",
    pathRef: null,
    joinCode: "ABCD2345",
    ownerId: "u-2",
    createdAt: "2026-09-10T00:00:00.000Z",
    localOnly: false,
    ...overrides,
  };
}

function member(
  userId: string,
  overrides: Record<string, unknown> = {},
): GroupSnapshot["members"][string][number] {
  return {
    userId,
    username: userId,
    role: "member",
    joinedAt: "2026-09-10T00:00:00.000Z",
    weeklySolved: 0,
    streak: 0,
    lastActiveAt: null,
    isYou: false,
    ...overrides,
  } as GroupSnapshot["members"][string][number];
}

function seedProgress(entries: Row): void {
  stub.setItem("deepforge:progress:v1", JSON.stringify(entries));
}

describe("local-only groups (signed out)", () => {
  test("create keeps everything on the device and list returns it", async () => {
    const { client, db } = makeClient();
    setRemoteClient(client);

    const created = await createGroup({ name: "Local crew", topic: "ml" });

    expect(created.error).toBeNull();
    expect(created.data?.localOnly).toBe(true);
    expect(created.data?.ownerId).toBeNull();
    expect(created.data?.joinCode).toMatch(/^[A-Z0-9]{8}$/);
    expect(db.selects).toHaveLength(0);
    expect(db.rows("study_groups")).toHaveLength(0);

    const listed = await listMyGroups();
    expect(listed.error).toBeNull();
    expect(listed.data?.map((item) => item.id)).toContain(created.data!.id);
  });

  test("configured but signed out still never touches the remote tables", async () => {
    configure();
    const { client, db } = makeClient();
    setRemoteClient(client);

    const created = await createGroup({ name: "Offline crew" });
    const listed = await listMyGroups();

    expect(created.error).toBeNull();
    expect(created.data?.localOnly).toBe(true);
    expect(listed.data?.map((item) => item.id)).toContain(created.data!.id);
    expect(db.selects).toHaveLength(0);
    expect(db.rows("study_groups")).toHaveLength(0);
  });

  test("join explains that a code belongs to an account", async () => {
    configure();
    const { client } = makeClient();
    setRemoteClient(client);

    const result = await joinGroup("abcd2345");

    expect(result.data).toBeNull();
    expect(result.error).toContain("Sign in");
  });

  test("leaving a local group removes it", async () => {
    const created = await createGroup({ name: "Temporary" });
    const left = await leaveGroup(created.data!.id);

    expect(left.error).toBeNull();
    expect(getGroupSnapshot().groups).toHaveLength(0);
  });
});

describe("remote groups (signed in)", () => {
  test("create runs the RPC and caches the returned row", async () => {
    configure();
    signIn();
    const { client, db } = makeClient();
    setRemoteClient(client);
    db.rpcHandler = (fn, args) => {
      const row = remoteGroupRow({
        owner_id: "u-1",
        join_code: String(args?.p_join_code ?? ""),
      });
      db.rows("study_groups").push(row);
      db.rows("group_members").push(remoteMemberRow("u-1", "owner"));
      return { data: row, error: null };
    };

    const created = await createGroup({
      name: "Remote crew",
      topic: "ml",
      pathRef: "ml-foundations",
    });

    expect(created.error).toBeNull();
    expect(created.data?.localOnly).toBe(false);
    expect(created.data?.ownerId).toBe("u-1");
    expect(db.rpcCalls).toHaveLength(1);
    expect(db.rpcCalls[0].fn).toBe("create_study_group");
    expect(db.rpcCalls[0].args?.p_name).toBe("Remote crew");
    expect(db.rpcCalls[0].args?.p_topic).toBe("ml");
    expect(db.rpcCalls[0].args?.p_path_ref).toBe("ml-foundations");
    expect(
      getGroupSnapshot().groups.some((item) => item.id === created.data!.id),
    ).toBe(true);
  });

  test("create degrades to a local group when the RPC fails", async () => {
    configure();
    signIn();
    const { client, db } = makeClient();
    setRemoteClient(client);
    db.rpcResult = { data: null, error: { message: "rpc down" } };

    const created = await createGroup({ name: "Degraded" });

    expect(created.error).toBe("rpc down");
    expect(created.data?.name).toBe("Degraded");
    expect(created.data?.localOnly).toBe(true);
    expect(getGroupSnapshot().groups.some((item) => item.id === created.data!.id)).toBe(
      true,
    );
  });

  test("join normalizes the code, calls the RPC, and caches the group", async () => {
    configure();
    signIn();
    const { client, db } = makeClient();
    setRemoteClient(client);
    db.rpcResult = { data: remoteGroupRow(), error: null };

    const joined = await joinGroup("abcd-2345");

    expect(joined.error).toBeNull();
    expect(joined.data?.id).toBe("grp-1");
    expect(db.rpcCalls).toEqual([
      { fn: "join_study_group", args: { p_code: "ABCD2345" } },
    ]);
    expect(getGroupSnapshot().groups.map((item) => item.id)).toContain("grp-1");
  });

  test("a failed join reports the error and caches nothing", async () => {
    configure();
    signIn();
    const { client, db } = makeClient();
    setRemoteClient(client);
    db.rpcResult = { data: null, error: { message: "No group matches that code." } };

    const joined = await joinGroup("ZZZZ9999");

    expect(joined.error).toBe("No group matches that code.");
    expect(getGroupSnapshot().groups).toHaveLength(0);
  });

  test("leave deletes the membership, then the cached group", async () => {
    configure();
    signIn();
    const { client, db } = makeClient();
    setRemoteClient(client);
    db.rows("study_groups").push(remoteGroupRow({ owner_id: "u-1" }));
    db.rows("group_members").push(remoteMemberRow("u-1", "owner"));
    await listMyGroups();
    expect(getGroupSnapshot().groups).toHaveLength(1);

    const left = await leaveGroup("grp-1");

    expect(left.error).toBeNull();
    expect(db.rows("group_members")).toHaveLength(0);
    expect(getGroupSnapshot().groups).toHaveLength(0);
  });

  test("leave keeps the group when the remote delete fails", async () => {
    configure();
    signIn();
    const { client, db } = makeClient();
    setRemoteClient(client);
    db.rows("study_groups").push(remoteGroupRow({ owner_id: "u-1" }));
    db.rows("group_members").push(remoteMemberRow("u-1", "owner"));
    await listMyGroups();
    db.deleteErrors.add("group_members");

    const left = await leaveGroup("grp-1");

    expect(left.error).toBeTruthy();
    expect(getGroupSnapshot().groups).toHaveLength(1);
    expect(db.rows("group_members")).toHaveLength(1);
  });
});

describe("weekly aggregation math", () => {
  test("startOfWeekKey anchors on Monday regardless of the week day", () => {
    expect(startOfWeekKey(new Date(2026, 8, 14))).toBe("2026-09-14");
    expect(startOfWeekKey(new Date(2026, 8, 16))).toBe("2026-09-14");
    expect(startOfWeekKey(new Date(2026, 8, 20))).toBe("2026-09-14");
    expect(startOfWeekKey(new Date(2026, 8, 21))).toBe("2026-09-21");
  });

  test("weeklySolvedCount counts only solves inside the week", () => {
    const progress = {
      a: { solved: true, solvedAt: "2026-09-13T10:00:00" },
      b: { solved: true, solvedAt: "2026-09-14T10:00:00" },
      c: { solved: true, solvedAt: "2026-09-15T10:00:00" },
      d: { solved: true, solvedAt: "2026-09-21T10:00:00" },
      e: { attempted: true },
    };

    expect(
      weeklySolvedCount(progress, "2026-09-14", new Date(2026, 8, 16)),
    ).toBe(2);
  });

  test("groupStreakFromMembers is the shortest active member run", () => {
    expect(
      groupStreakFromMembers([
        { streak: 5, lastActiveAt: "2026-09-15T10:00:00.000Z" },
        { streak: 2, lastActiveAt: "2026-09-15T10:00:00.000Z" },
      ]),
    ).toBe(2);
    expect(
      groupStreakFromMembers([
        { streak: 5, lastActiveAt: "2026-09-15T10:00:00.000Z" },
        { streak: 2, lastActiveAt: null },
      ]),
    ).toBe(0);
    expect(groupStreakFromMembers([{ streak: 0, lastActiveAt: "x" }])).toBe(0);
    expect(groupStreakFromMembers([])).toBe(0);
  });

  test("buildGroupBoard sorts by weekly solves and always includes you", () => {
    seedProgress({
      p1: { solved: true, solvedAt: new Date().toISOString() },
    });
    const snapshot: GroupSnapshot = {
      groups: [group()],
      members: {
        "grp-1": [
          member("u-2", { weeklySolved: 2, streak: 3, lastActiveAt: "x" }),
          member("u-3", { weeklySolved: 6, streak: 1, lastActiveAt: "y" }),
        ],
      },
      nudges: [],
    };

    const board = buildGroupBoard("grp-1", snapshot);

    expect(board).not.toBeNull();
    expect(board!.members.map((item) => item.userId)).toEqual([
      "u-3",
      "u-2",
      "local",
    ]);
    expect(board!.members.at(-1)?.isYou).toBe(true);
    expect(board!.members.at(-1)?.weeklySolved).toBe(1);
    expect(buildGroupBoard("missing", snapshot)).toBeNull();
  });
});

describe("group solve streak", () => {
  const NOW = new Date(2026, 8, 16, 20, 0, 0);

  function isoDaysAgo(days: number): string {
    const d = new Date(NOW);
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - days);
    return d.toISOString();
  }

  test("counts consecutive solve days ending yesterday", () => {
    seedProgress({
      a: { solved: true, solvedAt: isoDaysAgo(1) },
      b: { solved: true, solvedAt: isoDaysAgo(2) },
      c: { solved: true, solvedAt: isoDaysAgo(3) },
    });

    expect(currentSolveStreak(NOW)).toBe(3);
    expect(currentDailyStreak(NOW)).toBe(3);
  });

  test("a labs-only day does not extend the solve streak", () => {
    seedProgress({
      a: { solved: true, solvedAt: isoDaysAgo(1) },
      b: { solved: true, solvedAt: isoDaysAgo(2) },
    });
    // A scored lab today writes only to the labs store — never a solve day.
    stub.setItem(
      "deepforge:labs",
      JSON.stringify({
        "lab-1": {
          best: 1,
          attempts: 1,
          passed: true,
          lastScoredAt: isoDaysAgo(0),
        },
      }),
    );

    expect(currentSolveStreak(NOW)).toBe(2);
  });

  test("a daily-challenge solve counts as a solve day", () => {
    stub.setItem(
      "deepforge:daily:v1",
      JSON.stringify({
        lastSolvedDate: "2026-09-16",
        streak: 1,
        solvedDates: ["2026-09-16"],
        shields: 0,
        shieldUsedDates: [],
      }),
    );

    expect(currentSolveStreak(NOW)).toBe(1);
  });
});

describe("buddy nudges", () => {
  test("nudgeCooldownRemaining measures from the latest matching nudge", () => {
    const now = Date.parse("2026-09-15T12:00:00.000Z");
    const nudges = [
      {
        groupId: "g1",
        fromUser: "me",
        toUser: "you",
        createdAt: "2026-09-15T00:30:00.000Z",
      },
      {
        groupId: "g1",
        fromUser: "me",
        toUser: "you",
        createdAt: "2026-09-15T06:00:00.000Z",
      },
      {
        groupId: "g1",
        fromUser: "me",
        toUser: "other",
        createdAt: "2026-09-15T11:00:00.000Z",
      },
      {
        groupId: "g2",
        fromUser: "me",
        toUser: "you",
        createdAt: "2026-09-15T11:30:00.000Z",
      },
    ];

    expect(nudgeCooldownRemaining(nudges, "g1", "me", "you", now)).toBe(
      NUDGE_COOLDOWN_MS - 6 * 3_600_000,
    );
    expect(nudgeCooldownRemaining(nudges, "g1", "me", "other", now)).toBe(
      NUDGE_COOLDOWN_MS - 3_600_000,
    );
    expect(nudgeCooldownRemaining(nudges, "g1", "me", "nobody", now)).toBe(0);
    expect(nudgeCooldownRemaining(nudges, "g1", "someone", "you", now)).toBe(0);
    expect(formatNudgeCooldown(NUDGE_COOLDOWN_MS)).toBe("12 hours");
    expect(formatNudgeCooldown(45 * 60_000)).toBe("45 min");
  });

  test("sendNudge inserts one row, then the cooldown blocks a repeat", async () => {
    configure();
    signIn();
    const { client, db } = makeClient();
    setRemoteClient(client);

    const first = await sendNudge("grp-1", "u-2");

    expect(first.error).toBeNull();
    expect(db.rows("group_nudges")).toHaveLength(1);
    expect(db.rows("group_nudges")[0].group_id).toBe("grp-1");
    expect(db.rows("group_nudges")[0].from_user).toBe("u-1");
    expect(db.rows("group_nudges")[0].to_user).toBe("u-2");
    expect(db.rows("group_nudges")[0].seen).toBe(false);

    const second = await sendNudge("grp-1", "u-2");

    expect(second.data).toBeNull();
    expect(second.error).toContain("already nudged");
    expect(db.rows("group_nudges")).toHaveLength(1);
  });

  test("a failed insert caches nothing (no phantom write)", async () => {
    configure();
    signIn();
    const { client, db } = makeClient();
    setRemoteClient(client);
    db.insertErrors.add("group_nudges");

    const result = await sendNudge("grp-1", "u-2");

    expect(result.error).toBeTruthy();
    expect(result.data).toBeNull();
    expect(getGroupSnapshot().nudges).toHaveLength(0);
  });

  test("you cannot nudge yourself", async () => {
    configure();
    signIn();
    const { client, db } = makeClient();
    setRemoteClient(client);

    const result = await sendNudge("grp-1", "u-1");

    expect(result.error).toContain("yourself");
    expect(db.rows("group_nudges")).toHaveLength(0);
  });

  test("markNudgeSeen flips only the recipient's row", async () => {
    configure();
    signIn();
    const { client, db } = makeClient();
    setRemoteClient(client);
    db.rows("group_nudges").push(
      remoteNudgeRow("gn-1", "u-2", "u-1"),
      remoteNudgeRow("gn-2", "u-1", "u-2"),
    );
    await listGroupNudges("grp-1");

    const result = await markNudgeSeen("gn-1");

    expect(result.error).toBeNull();
    expect(
      db.rows("group_nudges").find((row) => row.id === "gn-1")?.seen,
    ).toBe(true);
    expect(
      db.rows("group_nudges").find((row) => row.id === "gn-2")?.seen,
    ).toBe(false);
    expect(
      getGroupSnapshot().nudges.find((nudge) => nudge.id === "gn-1")?.seen,
    ).toBe(true);
  });
});

describe("RLS-relevant query shapes", () => {
  test("listMyGroups scopes membership to the user and selects explicit columns", async () => {
    configure();
    signIn();
    const { client, db } = makeClient();
    setRemoteClient(client);
    db.rows("study_groups").push(remoteGroupRow({ owner_id: "u-1" }));
    db.rows("group_members").push(remoteMemberRow("u-1", "owner"));

    await listMyGroups();

    const memberSelect = db.selects.find(
      (entry) => entry.table === "group_members",
    )!;
    expect(memberSelect.columns).toBe("group_id, role, joined_at");
    expect(memberSelect.filters).toEqual([["user_id", "u-1"]]);

    const groupSelect = db.selects.find(
      (entry) => entry.table === "study_groups",
    )!;
    expect(groupSelect.columns).toBe(
      "id, name, topic, path_ref, join_code, owner_id, created_at, updated_at",
    );
    expect(groupSelect.columns).not.toContain("*");
    expect(groupSelect.inFilters).toEqual([["id", ["grp-1"]]]);
  });

  test("getGroupLeaderboard scopes aggregates to group + week and resolves usernames by id", async () => {
    configure();
    signIn();
    const { client, db } = makeClient();
    setRemoteClient(client);
    db.rows("study_groups").push(remoteGroupRow({ owner_id: "u-1" }));
    db.rows("group_members").push(
      remoteMemberRow("u-1", "owner"),
      remoteMemberRow("u-2"),
    );
    db.rows("group_activity").push(
      remoteActivityRow("u-1", { solved_count: 2 }),
      remoteActivityRow("u-2", { solved_count: 5, streak: 4 }),
    );
    db.rows("profiles").push({ id: "u-2", username: "bob" });
    await listMyGroups();

    const result = await getGroupLeaderboard("grp-1");

    expect(result.error).toBeNull();
    const activitySelect = db.selects.find(
      (entry) => entry.table === "group_activity",
    )!;
    expect(activitySelect.columns).toBe(
      "user_id, week_start, solved_count, streak, last_active_at",
    );
    expect(activitySelect.filters).toEqual([
      ["group_id", "grp-1"],
      ["week_start", startOfWeekKey()],
    ]);

    const memberSelect = db.selects
      .filter((entry) => entry.table === "group_members")
      .at(-1)!;
    expect(memberSelect.filters).toEqual([["group_id", "grp-1"]]);

    const profileSelect = db.selects.find(
      (entry) => entry.table === "profiles",
    )!;
    expect(profileSelect.columns).toBe("id, username");
    expect(profileSelect.inFilters).toEqual([["id", ["u-1", "u-2"]]]);

    const bob = result.data?.members.find((item) => item.userId === "u-2");
    expect(bob?.weeklySolved).toBe(5);
    expect(bob?.username).toBe("bob");

    // this device's own aggregate is published, keyed by group/user/week
    const selfRow = db.rows("group_activity").find((row) => row.user_id === "u-1")!;
    expect(selfRow.week_start).toBe(startOfWeekKey());
    const upsert = db.upserts.find((entry) => entry.table === "group_activity")!;
    expect(upsert.conflict).toEqual(["group_id", "user_id", "week_start"]);
  });

  test("listGroupNudges pages newest-first with explicit columns", async () => {
    configure();
    signIn();
    const { client, db } = makeClient();
    setRemoteClient(client);
    db.rows("group_nudges").push(
      remoteNudgeRow("gn-1", "u-1", "u-2", {
        created_at: "2026-09-14T10:00:00.000Z",
      }),
      remoteNudgeRow("gn-2", "u-2", "u-1", {
        created_at: "2026-09-15T10:00:00.000Z",
      }),
    );

    const result = await listGroupNudges("grp-1");

    expect(result.error).toBeNull();
    expect(result.data?.map((nudge) => nudge.id)).toEqual(["gn-2", "gn-1"]);
    const nudgeSelect = db.selects.find(
      (entry) => entry.table === "group_nudges",
    )!;
    expect(nudgeSelect.columns).toBe(
      "id, group_id, from_user, to_user, created_at, seen",
    );
    expect(nudgeSelect.filters).toEqual([["group_id", "grp-1"]]);
    expect(nudgeSelect.orders).toEqual([["created_at", { ascending: false }]]);
    expect(nudgeSelect.range).toEqual([0, 49]);
  });
});

describe("realtime", () => {
  test("a group channel scopes nudges and activity to the group and tears down", async () => {
    configure();
    signIn();
    const { client, channels } = makeRealtimeClient();
    setRemoteClient(client);

    const stop = subscribeRealtime({ kind: "group", groupId: "grp-1" });
    await flushAsync();

    expect(channels).toHaveLength(1);
    expect(channels[0].name.startsWith("deepforge-social-group-")).toBe(true);
    expect(channels[0].subscribed).toBe(true);
    expect(channels[0].handlers.map((entry) => entry.scope.table)).toEqual([
      "group_nudges",
      "group_nudges",
      "group_activity",
      "group_activity",
    ]);
    expect(channels[0].handlers[0].scope.filter).toBe("group_id=eq.grp-1");
    expect(channels[0].handlers[2].scope.filter).toBe("group_id=eq.grp-1");

    stop();
    expect(channels[0].unsubscribed).toBe(true);
  });

  test("live nudge and activity rows merge into the local cache", async () => {
    configure();
    signIn();
    const { client, db, channels } = makeRealtimeClient();
    setRemoteClient(client);
    db.rows("study_groups").push(remoteGroupRow({ owner_id: "u-1" }));
    db.rows("group_members").push(
      remoteMemberRow("u-1", "owner"),
      remoteMemberRow("u-2"),
    );
    db.rows("group_activity").push(remoteActivityRow("u-2", { solved_count: 1 }));
    await listMyGroups();
    await getGroupLeaderboard("grp-1");

    const stop = subscribeRealtime({ kind: "group", groupId: "grp-1" });
    await flushAsync();

    handlerFor(channels[0], "group_nudges")(
      remoteNudgeRow("gn-live", "u-2", "u-1"),
    );
    handlerFor(channels[0], "group_activity")(
      remoteActivityRow("u-2", { solved_count: 9, streak: 6 }),
    );

    expect(getGroupSnapshot().nudges.some((nudge) => nudge.id === "gn-live")).toBe(
      true,
    );
    const bob = getGroupSnapshot().members["grp-1"]?.find(
      (item) => item.userId === "u-2",
    );
    expect(bob?.weeklySolved).toBe(9);
    expect(bob?.streak).toBe(6);

    stop();
  });

  test("activity from a previous week does not overwrite the live board", async () => {
    configure();
    signIn();
    const { client, db, channels } = makeRealtimeClient();
    setRemoteClient(client);
    db.rows("study_groups").push(remoteGroupRow({ owner_id: "u-1" }));
    db.rows("group_members").push(
      remoteMemberRow("u-1", "owner"),
      remoteMemberRow("u-2"),
    );
    db.rows("group_activity").push(remoteActivityRow("u-2", { solved_count: 1 }));
    await listMyGroups();
    await getGroupLeaderboard("grp-1");

    const stop = subscribeRealtime({ kind: "group", groupId: "grp-1" });
    await flushAsync();
    handlerFor(channels[0], "group_activity")(
      remoteActivityRow("u-2", {
        week_start: "2020-01-06",
        solved_count: 99,
      }),
    );

    const bob = getGroupSnapshot().members["grp-1"]?.find(
      (item) => item.userId === "u-2",
    );
    expect(bob?.weeklySolved).toBe(1);
    stop();
  });

  test("stays local when Supabase is not configured", async () => {
    const { client, channels } = makeRealtimeClient();
    setRemoteClient(client);

    const stop = subscribeRealtime({ kind: "group", groupId: "grp-1" });
    await flushAsync();

    expect(channels).toHaveLength(0);
    stop();
  });
});
