import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { getComments, mergeRemoteComments } from "@/lib/comments";
import { setCachedSession } from "@/lib/sync/backend";
import {
  setRemoteClient,
  type RemoteClient,
  type RemoteResult,
} from "@/lib/sync/remote";
import {
  createComment,
  listComments,
  MAX_COMMENT_LENGTH,
  subscribeRealtime,
  toggleCommentUpvote,
} from "@/lib/sync/social";
import {
  validateCommentBody,
  voteAccessFrom,
} from "@/components/ProblemComments";

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
  orders: Array<[string, { ascending?: boolean }]>;
  range: [number, number] | null;
}

class FakeQuery implements PromiseLike<RemoteResult<any>> {
  private filters: Array<[string, unknown]> = [];
  private orders: Array<[string, { ascending?: boolean }]> = [];
  private window: [number, number] | null = null;
  private columns: string | null = null;
  private action: "select" | "insert" | "delete" = "select";
  private payload: Row | Row[] | null = null;

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
    let matched = rows.filter((row) =>
      this.filters.every(([column, value]) => row[column] === value),
    );
    if (this.action === "delete") {
      for (const row of matched) {
        const index = rows.indexOf(row);
        if (index >= 0) rows.splice(index, 1);
      }
      return { data: null, error: null };
    }
    this.db.selects.push({
      table: this.table,
      columns: this.columns,
      filters: [...this.filters],
      orders: [...this.orders],
      range: this.window,
    });
    if (this.db.selectErrors.has(this.table)) {
      return {
        data: null,
        error: { message: `select failed: ${this.table}` },
      };
    }
    if (this.orders.length > 0) {
      matched = [...matched].sort((a, b) => {
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
      matched = matched.slice(this.window[0], this.window[1] + 1);
    }
    return { data: single ? (matched[0] ?? null) : matched, error: null };
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

class FakeDb {
  tables = new Map<string, Row[]>();
  rpcCalls: Array<{ fn: string; args?: Record<string, unknown> }> = [];
  rpcResult: RemoteResult<any> = { data: 1, error: null };
  selectErrors = new Set<string>();
  insertErrors = new Set<string>();
  rpcGate: Promise<void> | null = null;
  selects: SelectRecord[] = [];
  channels: FakeChannel[] = [];

  rows(table: string): Row[] {
    const existing = this.tables.get(table);
    if (existing) return existing;
    const created: Row[] = [];
    this.tables.set(table, created);
    return created;
  }
}

function makeClient(): {
  client: RemoteClient;
  db: FakeDb;
  channels: FakeChannel[];
} {
  const db = new FakeDb();
  const base: Record<string, unknown> = {
    from: (table: string) => new FakeQuery(db, table),
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
  base.rpc = (fn: string, args?: Record<string, unknown>) => {
    db.rpcCalls.push({ fn, args });
    const result = db.rpcResult;
    return db.rpcGate
      ? db.rpcGate.then(() => result)
      : Promise.resolve(result);
  };
  return { client: base as unknown as RemoteClient, db, channels: db.channels };
}

function insertHandler(channel: FakeChannel): (row: Row) => void {
  const handler = channel.handlers.find((entry) => entry.event === "INSERT");
  if (!handler) throw new Error("missing INSERT handler");
  return (row: Row) => handler.callback({ new: row });
}

async function flushAsync(): Promise<void> {
  for (let i = 0; i < 8; i += 1) await Promise.resolve();
}

function configure(): void {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "pk_test";
}

function signIn(): void {
  setCachedSession({ userId: "u-1", email: "ada@example.com" });
}

function remoteComment(
  id: string,
  overrides: Row = {},
): Row {
  return {
    id,
    problem_id: "dl-003",
    author_id: "someone",
    author_name: "bob",
    body: `note ${id}`,
    upvote_count: 3,
    created_at: "2026-01-02T00:00:00.000Z",
    ...overrides,
  };
}

function commentById(problemId: string, id: string) {
  return getComments(problemId).find((comment) => comment.id === id);
}

describe("composer validation", () => {
  test("rejects empty and whitespace-only drafts", () => {
    expect(validateCommentBody("")).toBeTruthy();
    expect(validateCommentBody("   \n\t ")).toBeTruthy();
  });

  test("accepts a normal draft and trims before measuring", () => {
    expect(validateCommentBody("  how do you handle empty input?  ")).toBeNull();
  });

  test("enforces the shared maximum length at the boundary", () => {
    expect(validateCommentBody("a".repeat(MAX_COMMENT_LENGTH))).toBeNull();
    const tooLong = validateCommentBody("a".repeat(MAX_COMMENT_LENGTH + 1));
    expect(tooLong).toBeTruthy();
    expect(tooLong).toContain(String(MAX_COMMENT_LENGTH));
  });
});

describe("vote access", () => {
  test("unconfigured local mode keeps voting enabled with no sign-in hint", () => {
    expect(voteAccessFrom(null, false)).toEqual({
      canVote: true,
      signedOutHint: false,
    });
  });

  test("configured and signed out disables voting and hints to sign in", () => {
    expect(voteAccessFrom(null, true)).toEqual({
      canVote: false,
      signedOutHint: true,
    });
  });

  test("configured and signed in keeps voting enabled", () => {
    expect(voteAccessFrom("ada@example.com", true)).toEqual({
      canVote: true,
      signedOutHint: false,
    });
  });
});

describe("comment upvote", () => {
  test("remote RPC success keeps the optimistic state and adopts the count", async () => {
    configure();
    signIn();
    const { client, db } = makeClient();
    setRemoteClient(client);
    db.rows("comments").push(remoteComment("c-1"));
    await listComments("dl-003");

    db.rpcResult = { data: 4, error: null };
    const result = await toggleCommentUpvote("c-1");

    expect(result.error).toBeNull();
    expect(result.data).toEqual({ upvoted: true, upvotes: 4 });
    expect(db.rpcCalls).toEqual([
      { fn: "toggle_comment_upvote", args: { p_comment_id: "c-1" } },
    ]);
    const local = commentById("dl-003", "c-1");
    expect(local?.upvotedByMe).toBe(true);
    expect(local?.upvotes).toBe(4);
  });

  test("remote RPC failure rolls back the toggle and never throws", async () => {
    configure();
    signIn();
    const { client, db } = makeClient();
    setRemoteClient(client);
    db.rows("comments").push(remoteComment("c-1"));
    await listComments("dl-003");

    db.rpcResult = { data: null, error: { message: "rpc down" } };
    const result = await toggleCommentUpvote("c-1");

    expect(result.error).toBe("rpc down");
    expect(result.data).toBeNull();
    const local = commentById("dl-003", "c-1");
    expect(local?.upvotedByMe).toBe(false);
    expect(local?.upvotes).toBe(3);
  });

  test("rollback restores the exact pre-toggle state when it drifts mid-flight", async () => {
    configure();
    signIn();
    const { client, db } = makeClient();
    setRemoteClient(client);
    db.rows("comments").push(remoteComment("c-1"));
    await listComments("dl-003");

    let release!: () => void;
    db.rpcGate = new Promise<void>((resolve) => {
      release = resolve;
    });
    db.rpcResult = { data: null, error: { message: "rpc down" } };

    const pending = toggleCommentUpvote("c-1");
    for (let i = 0; i < 100 && db.rpcCalls.length === 0; i += 1) {
      await Promise.resolve();
    }
    expect(db.rpcCalls).toHaveLength(1);
    expect(commentById("dl-003", "c-1")?.upvotes).toBe(4);

    mergeRemoteComments("dl-003", [
      {
        id: "c-1",
        problemId: "dl-003",
        author: "bob",
        body: "note c-1",
        createdAt: "2026-01-02T00:00:00.000Z",
        upvotes: 1,
        upvotedByMe: false,
      },
    ]);
    release();
    const result = await pending;

    expect(result.error).toBe("rpc down");
    expect(result.data).toBeNull();
    const local = commentById("dl-003", "c-1");
    expect(local?.upvotedByMe).toBe(false);
    expect(local?.upvotes).toBe(3);
  });

  test("configured but signed out toggles locally without touching the RPC", async () => {
    configure();
    const { client, db } = makeClient();
    setRemoteClient(client);

    const created = await createComment({
      problemId: "dl-003",
      body: "local-only note",
      username: "ada",
    });
    expect(created.error).toBeNull();
    expect(db.rows("comments")).toHaveLength(0);

    const result = await toggleCommentUpvote(created.data!.id);

    expect(result.error).toBeNull();
    expect(result.data).toEqual({ upvoted: true, upvotes: 1 });
    expect(db.rpcCalls).toHaveLength(0);
    const local = commentById("dl-003", created.data!.id);
    expect(local?.upvotedByMe).toBe(true);
    expect(local?.upvotes).toBe(1);
  });

  test("a client without rpc fails soft and rolls back", async () => {
    configure();
    signIn();
    const db = new FakeDb();
    const base: Record<string, unknown> = {
      from: (table: string) => new FakeQuery(db, table),
    };
    setRemoteClient(base as unknown as RemoteClient);
    db.rows("comments").push(remoteComment("c-1"));
    await listComments("dl-003");

    const result = await toggleCommentUpvote("c-1");

    expect(result.error).toBe("Upvote sync is unavailable.");
    const local = commentById("dl-003", "c-1");
    expect(local?.upvotedByMe).toBe(false);
    expect(local?.upvotes).toBe(3);
  });
});

describe("listComments ordering", () => {
  test("returns newest first and keeps the order stable across refreshes", async () => {
    configure();
    signIn();
    const { client, db } = makeClient();
    setRemoteClient(client);
    db.rows("comments").push(
      remoteComment("c-old", { created_at: "2026-01-01T00:00:00.000Z" }),
      remoteComment("c-new", { created_at: "2026-01-05T00:00:00.000Z" }),
      remoteComment("c-dup-a", { created_at: "2026-01-03T00:00:00.000Z" }),
      remoteComment("c-dup-b", { created_at: "2026-01-03T00:00:00.000Z" }),
    );

    const first = await listComments("dl-003");
    const second = await listComments("dl-003");

    expect(first.error).toBeNull();
    const ids = first.data!.map((comment) => comment.id);
    expect(ids[0]).toBe("c-new");
    expect(ids[ids.length - 1]).toBe("c-old");
    expect(second.data!.map((comment) => comment.id)).toEqual(ids);
    for (let i = 1; i < first.data!.length; i += 1) {
      expect(
        first.data![i - 1].createdAt.localeCompare(
          first.data![i].createdAt,
        ),
      ).toBeGreaterThanOrEqual(0);
    }
  });

  test("merges local-only pending comments into the newest-first list", async () => {
    const local = await createComment({
      problemId: "dl-003",
      body: "pending local",
      username: "ada",
    });
    expect(local.error).toBeNull();

    configure();
    signIn();
    const { client, db } = makeClient();
    setRemoteClient(client);
    db.rows("comments").push(
      remoteComment("c-old", { created_at: "2026-01-01T00:00:00.000Z" }),
    );

    const result = await listComments("dl-003");

    expect(result.error).toBeNull();
    expect(result.data!.map((comment) => comment.id)).toEqual([
      local.data!.id,
      "c-old",
    ]);
    expect(
      db.rows("comments").some((row) => row.id === local.data!.id),
    ).toBe(true);
  });
});

describe("listComments pagination", () => {
  test("pages newest-first with order/range and reports the cursor", async () => {
    configure();
    signIn();
    const { client, db } = makeClient();
    setRemoteClient(client);
    for (let i = 0; i < 3; i += 1) {
      db.rows("comments").push(
        remoteComment(`c-${i}`, {
          created_at: `2026-01-0${i + 1}T00:00:00.000Z`,
        }),
      );
    }

    const first = await listComments("dl-003", { offset: 0, limit: 2 });

    expect(first.error).toBeNull();
    expect(first.remote.map((comment) => comment.id)).toEqual(["c-2", "c-1"]);
    expect(first.hasMore).toBe(true);
    expect(first.nextOffset).toBe(2);

    const second = await listComments("dl-003", {
      offset: first.nextOffset!,
      limit: 2,
    });

    expect(second.remote.map((comment) => comment.id)).toEqual(["c-0"]);
    expect(second.hasMore).toBe(false);
    expect(second.nextOffset).toBeNull();

    const selects = db.selects.filter((entry) => entry.table === "comments");
    expect(selects).toHaveLength(2);
    expect(selects[0].columns).toBe(
      "id, problem_id, author_name, body, upvote_count, created_at",
    );
    expect(selects[0].columns).not.toContain("*");
    expect(selects[0].filters).toEqual([["problem_id", "dl-003"]]);
    expect(selects[0].orders).toEqual([
      ["created_at", { ascending: false }],
      ["id", { ascending: false }],
    ]);
    expect(selects[0].range).toEqual([0, 1]);
    expect(selects[1].range).toEqual([2, 3]);
  });
});

describe("comments realtime", () => {
  test("scoped channel merges live inserts without duplicating own writes", async () => {
    configure();
    signIn();
    const { client, channels } = makeClient();
    setRemoteClient(client);

    const created = await createComment({
      problemId: "dl-003",
      body: "live note",
      username: "ada",
    });
    const stop = subscribeRealtime({ kind: "comments", problemId: "dl-003" });
    await flushAsync();

    expect(channels).toHaveLength(1);
    expect(channels[0].handlers.map((entry) => entry.event)).toEqual([
      "INSERT",
      "UPDATE",
    ]);
    expect(channels[0].handlers[0].scope.table).toBe("comments");
    expect(channels[0].handlers[0].scope.filter).toBe("problem_id=eq.dl-003");

    insertHandler(channels[0])({
      id: created.data!.id,
      problem_id: "dl-003",
      author_name: "ada",
      body: "live note",
      upvote_count: 0,
      created_at: created.data!.createdAt,
    });

    expect(
      getComments("dl-003").filter(
        (comment) => comment.id === created.data!.id,
      ),
    ).toHaveLength(1);

    stop();
    expect(channels[0].unsubscribed).toBe(true);
  });

  test("ignores rows for a different problem", async () => {
    configure();
    signIn();
    const { client, channels } = makeClient();
    setRemoteClient(client);
    const stop = subscribeRealtime({ kind: "comments", problemId: "dl-003" });
    await flushAsync();
    expect(channels).toHaveLength(1);

    insertHandler(channels[0])({
      id: "c-other",
      problem_id: "ml-001",
      author_name: "bob",
      body: "elsewhere",
      upvote_count: 0,
      created_at: "2026-01-02T00:00:00.000Z",
    });

    expect(getComments("dl-003")).toHaveLength(0);
    expect(getComments("ml-001")).toHaveLength(0);
    stop();
  });
});
