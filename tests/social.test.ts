import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  getComments,
  getForumSnapshot,
  setThreadUpvoteCount,
} from "@/lib/comments";
import { setCachedSession } from "@/lib/sync/backend";
import {
  setRemoteClient,
  type RemoteClient,
  type RemoteResult,
} from "@/lib/sync/remote";
import {
  createComment,
  createReply,
  createThread,
  deleteThread,
  listComments,
  listReplies,
  listThreads,
  subscribe,
  subscribeRealtime,
  toggleReplyUpvote,
  toggleThreadUpvote,
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
    if (this.db.selectGate) {
      this.db.selectStarted = true;
      await this.db.selectGate;
    }
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
  selectGate: Promise<void> | null = null;
  selectStarted = false;
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

function makeClient(withRpc = true): { client: RemoteClient; db: FakeDb } {
  const db = new FakeDb();
  const base: Record<string, unknown> = {
    from: (table: string) => new FakeQuery(db, table),
  };
  if (withRpc) {
    base.rpc = (fn: string, args?: Record<string, unknown>) => {
      db.rpcCalls.push({ fn, args });
      const result = db.rpcResult;
      return db.rpcGate
        ? db.rpcGate.then(() => result)
        : Promise.resolve(result);
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
    channel: (name: string) => {
      const channel = new FakeChannel(name);
      db.channels.push(channel);
      return channel;
    },
    removeChannel: (channel: FakeChannel) => {
      channel.unsubscribed = true;
      return Promise.resolve("ok");
    },
    rpc: (fn: string, args?: Record<string, unknown>) => {
      db.rpcCalls.push({ fn, args });
      return Promise.resolve(db.rpcResult);
    },
  };
  return { client: base as unknown as RemoteClient, db, channels: db.channels };
}

function insertHandler(
  channel: FakeChannel,
): (row: Row) => void {
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

function remoteThread(id: string, overrides: Row = {}): Row {
  return {
    id,
    author_id: "someone",
    author_name: "bob",
    title: `Thread ${id}`,
    body: "remote body",
    category: "General",
    problem_refs: [],
    upvote_count: 2,
    created_at: "2026-01-02T00:00:00.000Z",
    ...overrides,
  };
}

function remoteReply(id: string, threadId: string): Row {
  return {
    id,
    thread_id: threadId,
    author_id: "someone",
    author_name: "bob",
    body: "remote reply",
    upvote_count: 0,
    created_at: "2026-01-03T00:00:00.000Z",
  };
}

function remoteComment(id: string, overrides: Row = {}): Row {
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

function seedLocalForum(threads: Row[], replies: Row[] = []): void {
  stub.setItem(
    "deepforge:forum",
    JSON.stringify({
      threads,
      replies,
      upvotedThreads: [],
      upvotedReplies: [],
    }),
  );
}

describe("unconfigured", () => {
  test("reads and writes stay local and never touch the remote client", async () => {
    const { client, db } = makeClient();
    setRemoteClient(client);

    const created = await createThread({
      title: "Local thread",
      body: "hello",
      username: "ada",
    });
    expect(created.error).toBeNull();
    expect(created.data?.title).toBe("Local thread");
    expect(db.rows("forum_threads")).toHaveLength(0);

    const listed = await listThreads();
    expect(listed.error).toBeNull();
    expect(listed.data?.some((thread) => thread.id === created.data?.id)).toBe(
      true,
    );

    const reply = await createReply({
      threadId: created.data!.id,
      body: "local reply",
      username: "ada",
    });
    expect(reply.error).toBeNull();
    expect(db.rows("forum_replies")).toHaveLength(0);

    const comment = await createComment({
      problemId: "dl-003",
      body: "local note",
      username: "ada",
    });
    expect(comment.error).toBeNull();
    expect(db.rows("comments")).toHaveLength(0);
  });
});

describe("configured but signed out", () => {
  test("keeps local-only reads and blocks remote writes", async () => {
    configure();
    const { client, db } = makeClient();
    setRemoteClient(client);

    const created = await createThread({
      title: "Offline thread",
      body: "body",
      username: "ada",
    });
    expect(created.error).toBeNull();
    expect(db.rows("forum_threads")).toHaveLength(0);

    const listed = await listThreads();
    expect(listed.error).toBeNull();
    expect(listed.data?.some((thread) => thread.id === created.data?.id)).toBe(
      true,
    );
    expect(db.rows("forum_threads")).toHaveLength(0);
  });
});

describe("configured and signed in", () => {
  test("createThread writes the remote row and caches it locally", async () => {
    configure();
    signIn();
    const { client, db } = makeClient();
    setRemoteClient(client);

    const created = await createThread({
      title: "Global thread",
      body: "body",
      username: "ada",
      category: "ML Questions",
      problemId: "dl-003",
    });

    expect(created.error).toBeNull();
    const rows = db.rows("forum_threads");
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe(created.data!.id);
    expect(rows[0].author_id).toBe("u-1");
    expect(rows[0].author_name).toBe("ada");
    expect(rows[0].category).toBe("ML Questions");
    expect(rows[0].problem_refs).toEqual(["dl-003"]);
    expect(getForumSnapshot().threads.some((t) => t.id === created.data!.id)).toBe(
      true,
    );
  });

  test("createReply writes remotely and listReplies merges the row", async () => {
    configure();
    signIn();
    const { client, db } = makeClient();
    setRemoteClient(client);

    const thread = await createThread({
      title: "Thread",
      body: "body",
      username: "ada",
    });
    const reply = await createReply({
      threadId: thread.data!.id,
      body: "hello",
      username: "ada",
    });

    expect(reply.error).toBeNull();
    const rows = db.rows("forum_replies");
    expect(rows).toHaveLength(1);
    expect(rows[0].thread_id).toBe(thread.data!.id);
    expect(rows[0].author_id).toBe("u-1");

    const listed = await listReplies(thread.data!.id);
    expect(listed.error).toBeNull();
    expect(listed.data?.some((item) => item.id === reply.data!.id)).toBe(true);
  });

  test("listThreads merges remote with local-only and dedupes conservatively", async () => {
    configure();
    signIn();
    const { client, db } = makeClient();
    setRemoteClient(client);

    db.rows("forum_threads").push(
      remoteThread("ft-remote"),
      { ...remoteThread("ft-dup-id"), title: "Same id", body: "" },
      {
        ...remoteThread("ft-dup-title"),
        title: "Same title",
        body: "remote copy",
        created_at: "2026-01-04T00:00:00.000Z",
      },
    );
    db.rows("forum_thread_upvotes").push({
      user_id: "u-1",
      thread_id: "ft-remote",
    });
    seedLocalForum([
      {
        id: "ft-dup-id",
        title: "Same id",
        body: "",
        category: "General",
        author: "me",
        createdAt: "2026-01-03T00:00:00.000Z",
        upvotes: 0,
        problemRefs: [],
      },
      {
        id: "ft-local-title",
        title: "Same title",
        body: "local copy",
        category: "General",
        author: "me",
        createdAt: "2026-01-04T00:00:00.000Z",
        upvotes: 0,
        problemRefs: [],
      },
      {
        id: "ft-local-only",
        title: "Local only",
        body: "pending push",
        category: "General",
        author: "me",
        createdAt: "2026-01-05T00:00:00.000Z",
        upvotes: 0,
        problemRefs: [],
      },
    ]);

    const result = await listThreads();

    expect(result.error).toBeNull();
    const ids = result.data!.map((thread) => thread.id);
    expect(ids).toContain("ft-remote");
    expect(ids).toContain("ft-local-only");
    expect(ids.filter((id) => id === "ft-dup-id")).toHaveLength(1);
    expect(
      result.data!.filter((thread) => thread.title === "Same title"),
    ).toHaveLength(1);
    expect(
      db.rows("forum_threads").some((row) => row.id === "ft-local-only"),
    ).toBe(true);
    expect(
      db.rows("forum_threads").some((row) => row.id === "ft-local-title"),
    ).toBe(false);
    expect(getForumSnapshot().upvotedThreadIds).toContain("ft-remote");

    await listThreads();
    expect(
      db.rows("forum_threads").filter((row) => row.id === "ft-local-only"),
    ).toHaveLength(1);
  });

  test("deleteThread removes the remote row and the local row", async () => {
    configure();
    signIn();
    const { client, db } = makeClient();
    setRemoteClient(client);

    const thread = await createThread({
      title: "Doomed",
      body: "body",
      username: "ada",
    });
    const result = await deleteThread(thread.data!.id);

    expect(result.error).toBeNull();
    expect(db.rows("forum_threads")).toHaveLength(0);
    expect(
      getForumSnapshot().threads.some((item) => item.id === thread.data!.id),
    ).toBe(false);
  });
});

describe("upvotes", () => {
  test("remote RPC success keeps the optimistic state and adopts the count", async () => {
    configure();
    signIn();
    const { client, db } = makeClient();
    setRemoteClient(client);
    db.rows("forum_threads").push(remoteThread("ft-1"));
    await listThreads();

    db.rpcResult = { data: 5, error: null };
    const result = await toggleThreadUpvote("ft-1");

    expect(result.error).toBeNull();
    expect(result.data).toEqual({ upvoted: true, upvotes: 5 });
    expect(db.rpcCalls).toEqual([
      { fn: "toggle_thread_upvote", args: { p_thread_id: "ft-1" } },
    ]);
    const snapshot = getForumSnapshot();
    expect(snapshot.upvotedThreadIds).toContain("ft-1");
    expect(snapshot.threads.find((item) => item.id === "ft-1")!.upvotes).toBe(5);
  });

  test("remote RPC failure rolls back the toggle and never throws", async () => {
    configure();
    signIn();
    const { client, db } = makeClient();
    setRemoteClient(client);
    db.rows("forum_threads").push(remoteThread("ft-1"));
    await listThreads();

    db.rpcResult = { data: null, error: { message: "rpc down" } };
    const result = await toggleThreadUpvote("ft-1");

    expect(result.error).toBe("rpc down");
    expect(result.data).toBeNull();
    const snapshot = getForumSnapshot();
    expect(snapshot.upvotedThreadIds).not.toContain("ft-1");
    expect(snapshot.threads.find((item) => item.id === "ft-1")!.upvotes).toBe(2);
  });

  test("reply upvotes call the reply RPC", async () => {
    configure();
    signIn();
    const { client, db } = makeClient();
    setRemoteClient(client);
    db.rows("forum_threads").push(remoteThread("ft-1"));
    db.rows("forum_replies").push({
      id: "fr-1",
      thread_id: "ft-1",
      author_id: "someone",
      author_name: "bob",
      body: "reply",
      upvote_count: 1,
      created_at: "2026-01-03T00:00:00.000Z",
    });
    await listReplies("ft-1");

    db.rpcResult = { data: 2, error: null };
    const result = await toggleReplyUpvote("fr-1");

    expect(result.error).toBeNull();
    expect(result.data).toEqual({ upvoted: true, upvotes: 2 });
    expect(db.rpcCalls).toEqual([
      { fn: "toggle_reply_upvote", args: { p_reply_id: "fr-1" } },
    ]);
  });

  test("a client without rpc fails soft and rolls back", async () => {
    configure();
    signIn();
    const { client, db } = makeClient(false);
    setRemoteClient(client);
    db.rows("forum_threads").push(remoteThread("ft-1"));
    await listThreads();

    const result = await toggleThreadUpvote("ft-1");

    expect(result.error).toBe("Upvote sync is unavailable.");
    const snapshot = getForumSnapshot();
    expect(snapshot.upvotedThreadIds).not.toContain("ft-1");
    expect(snapshot.threads.find((item) => item.id === "ft-1")!.upvotes).toBe(2);
  });

  test("rollback restores the exact pre-toggle count when it drifts mid-flight", async () => {
    configure();
    signIn();
    const { client, db } = makeClient();
    setRemoteClient(client);
    db.rows("forum_threads").push(remoteThread("ft-1"));
    await listThreads();

    let release!: () => void;
    db.rpcGate = new Promise<void>((resolve) => {
      release = resolve;
    });
    db.rpcResult = { data: null, error: { message: "rpc down" } };

    const pending = toggleThreadUpvote("ft-1");
    for (let i = 0; i < 100 && db.rpcCalls.length === 0; i += 1) {
      await Promise.resolve();
    }
    expect(db.rpcCalls).toHaveLength(1);

    // Simulate a concurrent remote merge lowering the count mid-RPC.
    setThreadUpvoteCount("ft-1", 1);
    release();
    const result = await pending;

    expect(result.error).toBe("rpc down");
    expect(result.data).toBeNull();
    const snapshot = getForumSnapshot();
    expect(snapshot.upvotedThreadIds).not.toContain("ft-1");
    expect(snapshot.threads.find((item) => item.id === "ft-1")!.upvotes).toBe(2);
  });

  test("non-finite counts from the wire are ignored", async () => {
    configure();
    signIn();
    const { client, db } = makeClient();
    setRemoteClient(client);
    db.rows("forum_threads").push(remoteThread("ft-1"));
    await listThreads();

    setThreadUpvoteCount("ft-1", Number.NaN);

    expect(getForumSnapshot().threads.find((item) => item.id === "ft-1")!.upvotes).toBe(2);
  });

  test("reply rollback restores a pre-upvoted state exactly", async () => {
    configure();
    signIn();
    const { client, db } = makeClient();
    setRemoteClient(client);
    db.rows("forum_threads").push(remoteThread("ft-1"));
    db.rows("forum_replies").push({
      ...remoteReply("fr-1", "ft-1"),
      upvote_count: 4,
    });
    db.rows("forum_reply_upvotes").push({ user_id: "u-1", reply_id: "fr-1" });
    await listThreads();
    await listReplies("ft-1");

    db.rpcResult = { data: null, error: { message: "rpc down" } };
    const result = await toggleReplyUpvote("fr-1");

    expect(result.error).toBe("rpc down");
    expect(result.data).toBeNull();
    const snapshot = getForumSnapshot();
    expect(snapshot.upvotedReplyIds).toContain("fr-1");
    expect(snapshot.replies.find((item) => item.id === "fr-1")!.upvotes).toBe(4);
  });
});

describe("session generation", () => {
  test("a session change discards an in-flight list response", async () => {
    configure();
    signIn();
    const { client, db } = makeClient();
    setRemoteClient(client);
    db.rows("forum_threads").push(remoteThread("ft-remote"));

    let release!: () => void;
    db.selectGate = new Promise<void>((resolve) => {
      release = resolve;
    });

    const pending = listThreads();
    for (let i = 0; i < 100 && !db.selectStarted; i += 1) {
      await Promise.resolve();
    }
    expect(db.selectStarted).toBe(true);

    setCachedSession({ userId: "u-2", email: "eve@example.com" });
    release();
    const result = await pending;

    expect(result.error).toBeNull();
    expect(result.data?.some((thread) => thread.id === "ft-remote")).toBe(false);
    expect(
      getForumSnapshot().threads.some((thread) => thread.id === "ft-remote"),
    ).toBe(false);
  });
});

describe("concurrent lists", () => {
  test("sibling listReplies calls each merge their own remote replies", async () => {
    configure();
    signIn();
    const { client, db } = makeClient();
    setRemoteClient(client);
    db.rows("forum_threads").push(remoteThread("ft-a"), remoteThread("ft-b"));
    db.rows("forum_replies").push(
      remoteReply("fr-a", "ft-a"),
      remoteReply("fr-b", "ft-b"),
    );

    await Promise.all([listReplies("ft-a"), listReplies("ft-b")]);

    const ids = getForumSnapshot().replies.map((reply) => reply.id);
    expect(ids).toContain("fr-a");
    expect(ids).toContain("fr-b");
  });

  test("listReplies pushes a local-only reply exactly once", async () => {
    configure();
    signIn();
    const { client, db } = makeClient();
    setRemoteClient(client);
    db.rows("forum_threads").push(remoteThread("ft-1"));
    seedLocalForum(
      [
        {
          id: "ft-local",
          title: "Local",
          body: "body",
          category: "General",
          author: "me",
          createdAt: "2026-01-05T00:00:00.000Z",
          upvotes: 0,
          problemRefs: [],
        },
      ],
      [
        {
          id: "fr-local",
          threadId: "ft-local",
          author: "me",
          body: "pending",
          createdAt: "2026-01-06T00:00:00.000Z",
          upvotes: 0,
        },
      ],
    );

    await listReplies("ft-local");
    await listReplies("ft-local");

    expect(
      db.rows("forum_replies").filter((row) => row.id === "fr-local"),
    ).toHaveLength(1);
  });
});

describe("degradation", () => {
  test("listThreads returns local data plus an error instead of throwing", async () => {
    configure();
    signIn();
    const { client, db } = makeClient();
    setRemoteClient(client);
    db.selectErrors.add("forum_threads");
    seedLocalForum([
      {
        id: "ft-local",
        title: "Still here",
        body: "body",
        category: "General",
        author: "me",
        createdAt: "2026-01-06T00:00:00.000Z",
        upvotes: 0,
        problemRefs: [],
      },
    ]);

    const result = await listThreads();

    expect(result.error).toBeTruthy();
    expect(result.data?.some((thread) => thread.id === "ft-local")).toBe(true);
  });

  test("createThread degrades to a local row when the remote insert fails", async () => {
    configure();
    signIn();
    const { client, db } = makeClient();
    setRemoteClient(client);
    db.insertErrors.add("forum_threads");

    const result = await createThread({
      title: "Degraded",
      body: "body",
      username: "ada",
    });

    expect(result.error).toBeTruthy();
    expect(result.data?.title).toBe("Degraded");
    expect(getForumSnapshot().threads.some((t) => t.id === result.data!.id)).toBe(
      true,
    );
  });
});

describe("subscribe", () => {
  test("notifies on social changes and session flips, and unsubscribes", async () => {
    const { client } = makeClient();
    setRemoteClient(client);
    let hits = 0;
    const unsubscribe = subscribe(() => {
      hits += 1;
    });

    await createThread({ title: "Sub", body: "body", username: "ada" });
    expect(hits).toBeGreaterThan(0);

    const before = hits;
    configure();
    signIn();
    expect(hits).toBeGreaterThan(before);

    const after = hits;
    unsubscribe();
    await createThread({ title: "Sub 2", body: "body", username: "ada" });
    expect(hits).toBe(after);
  });
});

describe("comments", () => {
  test("configured listComments merges remote plus local and marks own upvotes", async () => {
    configure();
    signIn();
    const { client, db } = makeClient();
    setRemoteClient(client);
    db.rows("comments").push({
      id: "c-remote",
      problem_id: "dl-003",
      author_id: "someone",
      author_name: "bob",
      body: "remote note",
      upvote_count: 3,
      created_at: "2026-01-02T00:00:00.000Z",
    });
    db.rows("comment_upvotes").push({ user_id: "u-1", comment_id: "c-remote" });

    const listed = await listComments("dl-003");

    expect(listed.error).toBeNull();
    const remote = listed.data?.find((comment) => comment.id === "c-remote");
    expect(remote?.upvotes).toBe(3);
    expect(remote?.upvotedByMe).toBe(true);

    const created = await createComment({
      problemId: "dl-003",
      body: "fresh",
      username: "ada",
    });
    expect(created.error).toBeNull();
    expect(
      db
        .rows("comments")
        .some(
          (row) => row.id === created.data!.id && row.author_id === "u-1",
        ),
    ).toBe(true);
  });
});

describe("pagination", () => {
  test("listThreads pages newest-first with order/range and reports the cursor", async () => {
    configure();
    signIn();
    const { client, db } = makeClient();
    setRemoteClient(client);
    for (let i = 0; i < 25; i += 1) {
      db.rows("forum_threads").push(
        remoteThread(`ft-${String(i).padStart(2, "0")}`, {
          created_at: `2026-01-${String(i + 1).padStart(2, "0")}T00:00:00.000Z`,
        }),
      );
    }

    const first = await listThreads({ limit: 20 });

    expect(first.error).toBeNull();
    expect(first.remote).toHaveLength(20);
    expect(first.remote[0].id).toBe("ft-24");
    expect(first.remote[19].id).toBe("ft-05");
    expect(first.hasMore).toBe(true);
    expect(first.nextOffset).toBe(20);
    expect(first.data).toHaveLength(20);

    const second = await listThreads({ offset: first.nextOffset!, limit: 20 });

    expect(second.remote).toHaveLength(5);
    expect(second.remote[0].id).toBe("ft-04");
    expect(second.hasMore).toBe(false);
    expect(second.nextOffset).toBeNull();
    expect(second.data).toHaveLength(25);

    const threadSelects = db.selects.filter(
      (entry) => entry.table === "forum_threads",
    );
    expect(threadSelects).toHaveLength(2);
    expect(threadSelects[0].columns).toBe(
      "id, author_name, title, body, category, problem_refs, upvote_count, created_at",
    );
    expect(threadSelects[0].columns).not.toContain("*");
    expect(threadSelects[0].orders).toEqual([
      ["created_at", { ascending: false }],
      ["id", { ascending: false }],
    ]);
    expect(threadSelects[0].range).toEqual([0, 19]);
    expect(threadSelects[1].range).toEqual([20, 39]);
  });

  test("listReplies and listComments scope order/range to their topic", async () => {
    configure();
    signIn();
    const { client, db } = makeClient();
    setRemoteClient(client);
    db.rows("forum_replies").push(
      remoteReply("fr-a", "ft-1"),
      remoteReply("fr-b", "ft-2"),
    );
    db.rows("comments").push(
      remoteComment("c-1", { created_at: "2026-01-01T00:00:00.000Z" }),
      remoteComment("c-2", { created_at: "2026-01-02T00:00:00.000Z" }),
    );

    const replies = await listReplies("ft-1", { offset: 0, limit: 20 });
    const comments = await listComments("dl-003", { offset: 0, limit: 20 });

    expect(replies.remote.map((reply) => reply.id)).toEqual(["fr-a"]);
    expect(comments.remote.map((comment) => comment.id)).toEqual(["c-2", "c-1"]);

    const replySelect = db.selects.find(
      (entry) => entry.table === "forum_replies",
    )!;
    expect(replySelect.columns).not.toContain("*");
    expect(replySelect.filters).toEqual([["thread_id", "ft-1"]]);
    expect(replySelect.orders[0]).toEqual([
      "created_at",
      { ascending: false },
    ]);
    expect(replySelect.range).toEqual([0, 19]);

    const commentSelect = db.selects.find(
      (entry) => entry.table === "comments",
    )!;
    expect(commentSelect.columns).not.toContain("*");
    expect(commentSelect.filters).toEqual([["problem_id", "dl-003"]]);
    expect(commentSelect.orders[1]).toEqual(["id", { ascending: false }]);
    expect(commentSelect.range).toEqual([0, 19]);
  });

  test("page options clamp the limit and floor the offset", async () => {
    configure();
    signIn();
    const { client, db } = makeClient();
    setRemoteClient(client);
    db.rows("forum_threads").push(remoteThread("ft-1"));

    await listThreads({ offset: 3.9, limit: 500 });

    const entry = db.selects.find((item) => item.table === "forum_threads")!;
    expect(entry.range).toEqual([3, 52]);
  });
});

describe("realtime", () => {
  test("subscribes to a scoped channel with insert + update handlers and tears down", async () => {
    configure();
    signIn();
    const { client, channels } = makeRealtimeClient();
    setRemoteClient(client);

    const stop = subscribeRealtime({ kind: "threads" });
    await flushAsync();

    expect(channels).toHaveLength(1);
    expect(channels[0].name.startsWith("deepforge-social-threads-")).toBe(true);
    expect(channels[0].subscribed).toBe(true);
    expect(channels[0].handlers.map((entry) => entry.event)).toEqual([
      "INSERT",
      "UPDATE",
    ]);
    expect(channels[0].handlers[0].scope.table).toBe("forum_threads");
    expect(channels[0].handlers[0].scope.schema).toBe("public");
    expect(channels[0].handlers[0].scope.filter).toBeUndefined();

    stop();
    expect(channels[0].unsubscribed).toBe(true);
  });

  test("reply and comment channels scope the postgres filter", async () => {
    configure();
    signIn();
    const { client, channels } = makeRealtimeClient();
    setRemoteClient(client);

    const stopReply = subscribeRealtime({ kind: "replies", threadId: "ft-9" });
    const stopComment = subscribeRealtime({
      kind: "comments",
      problemId: "dl-003",
    });
    await flushAsync();

    expect(channels).toHaveLength(2);
    expect(channels[0].handlers[0].scope.table).toBe("forum_replies");
    expect(channels[0].handlers[0].scope.filter).toBe("thread_id=eq.ft-9");
    expect(channels[1].handlers[0].scope.table).toBe("comments");
    expect(channels[1].handlers[0].scope.filter).toBe("problem_id=eq.dl-003");

    stopReply();
    stopComment();
    expect(channels[0].unsubscribed).toBe(true);
    expect(channels[1].unsubscribed).toBe(true);
  });

  test("live inserts merge into the local store without duplicating own writes", async () => {
    configure();
    signIn();
    const { client, channels } = makeRealtimeClient();
    setRemoteClient(client);

    const thread = await createThread({
      title: "Live",
      body: "body",
      username: "ada",
    });
    const reply = await createReply({
      threadId: thread.data!.id,
      body: "live reply",
      username: "ada",
    });
    const comment = await createComment({
      problemId: "dl-003",
      body: "live note",
      username: "ada",
    });

    const stopThreads = subscribeRealtime({ kind: "threads" });
    const stopReplies = subscribeRealtime({
      kind: "replies",
      threadId: thread.data!.id,
    });
    const stopComments = subscribeRealtime({
      kind: "comments",
      problemId: "dl-003",
    });
    await flushAsync();
    expect(channels).toHaveLength(3);

    insertHandler(channels[0])({
      id: thread.data!.id,
      author_name: "ada",
      title: "Live",
      body: "body",
      category: "General",
      problem_refs: [],
      upvote_count: 0,
      created_at: thread.data!.createdAt,
    });
    insertHandler(channels[1])({
      id: reply.data!.id,
      thread_id: thread.data!.id,
      author_name: "ada",
      body: "live reply",
      upvote_count: 0,
      created_at: reply.data!.createdAt,
    });
    insertHandler(channels[2])({
      id: comment.data!.id,
      problem_id: "dl-003",
      author_name: "ada",
      body: "live note",
      upvote_count: 0,
      created_at: comment.data!.createdAt,
    });

    expect(
      getForumSnapshot().threads.filter((item) => item.id === thread.data!.id),
    ).toHaveLength(1);
    expect(
      getForumSnapshot().replies.filter((item) => item.id === reply.data!.id),
    ).toHaveLength(1);
    expect(
      getComments("dl-003").filter((item) => item.id === comment.data!.id),
    ).toHaveLength(1);

    stopThreads();
    stopReplies();
    stopComments();
  });

  test("switching topics unsubscribes the previous channel", async () => {
    configure();
    signIn();
    const { client, channels } = makeRealtimeClient();
    setRemoteClient(client);

    const stopFirst = subscribeRealtime({
      kind: "comments",
      problemId: "dl-003",
    });
    const stopSecond = subscribeRealtime({
      kind: "comments",
      problemId: "ml-001",
    });
    await flushAsync();
    expect(channels).toHaveLength(2);

    stopFirst();
    expect(channels[0].unsubscribed).toBe(true);
    expect(channels[1].unsubscribed).toBe(false);

    stopSecond();
    expect(channels[1].unsubscribed).toBe(true);
  });

  test("detaches while signed out and re-attaches on a new session", async () => {
    configure();
    signIn();
    const { client, channels } = makeRealtimeClient();
    setRemoteClient(client);

    const stop = subscribeRealtime({ kind: "threads" });
    await flushAsync();
    expect(channels).toHaveLength(1);

    setCachedSession(null);
    expect(channels[0].unsubscribed).toBe(true);

    signIn();
    await flushAsync();
    expect(channels).toHaveLength(2);
    expect(channels[1].unsubscribed).toBe(false);

    stop();
    expect(channels[1].unsubscribed).toBe(true);
  });

  test("degrades silently when the client has no realtime support", async () => {
    configure();
    signIn();
    const { client } = makeClient();
    setRemoteClient(client);

    let threw = false;
    try {
      const stop = subscribeRealtime({ kind: "threads" });
      await flushAsync();
      stop();
    } catch {
      threw = true;
    }

    expect(threw).toBe(false);
  });

  test("NEXT_PUBLIC_SOCIAL_REALTIME=0 disables subscriptions entirely", async () => {
    process.env.NEXT_PUBLIC_SOCIAL_REALTIME = "0";
    configure();
    signIn();
    const { client, channels } = makeRealtimeClient();
    setRemoteClient(client);

    const stop = subscribeRealtime({ kind: "threads" });
    await flushAsync();

    expect(channels).toHaveLength(0);
    stop();
  });

  test("stays local when Supabase is not configured", async () => {
    const { client, channels } = makeRealtimeClient();
    setRemoteClient(client);

    const stop = subscribeRealtime({ kind: "threads" });
    await flushAsync();

    expect(channels).toHaveLength(0);
    stop();
  });
});
