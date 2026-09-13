import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { getForumSnapshot, setThreadUpvoteCount } from "@/lib/comments";
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

type Row = Record<string, any>;

class FakeQuery implements PromiseLike<RemoteResult<any>> {
  private filters: Array<[string, unknown]> = [];
  private action: "select" | "insert" | "delete" = "select";
  private payload: Row | Row[] | null = null;

  constructor(
    private db: FakeDb,
    private table: string,
  ) {}

  select(_columns?: string): FakeQuery {
    if (this.action === "select") this.action = "select";
    return this;
  }

  eq(column: string, value: unknown): FakeQuery {
    this.filters.push([column, value]);
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
    const matched = rows.filter((row) =>
      this.filters.every(([column, value]) => row[column] === value),
    );
    if (this.action === "delete") {
      for (const row of matched) {
        const index = rows.indexOf(row);
        if (index >= 0) rows.splice(index, 1);
      }
      return { data: null, error: null };
    }
    if (this.db.selectErrors.has(this.table)) {
      return {
        data: null,
        error: { message: `select failed: ${this.table}` },
      };
    }
    return { data: single ? (matched[0] ?? null) : matched, error: null };
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

function configure(): void {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "pk_test";
}

function signIn(): void {
  setCachedSession({ userId: "u-1", email: "ada@example.com" });
}

function remoteThread(id: string): Row {
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
