import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  fetchGlobalLeaderboard,
  isGlobalLeaderboardAvailable,
  GLOBAL_LEADERBOARD_COLUMNS,
  GLOBAL_LEADERBOARD_DEFAULT_LIMIT,
} from "@/lib/sync/leaderboardRemote";
import {
  setRemoteClient,
  type RemoteClient,
  type RemoteQuery,
} from "@/lib/sync/remote";

/* ─────────────────────────── fake supabase client ───────────────────────── */

type QueryResult = { data: any; error: { message?: string } | null };

interface RecordedQuery {
  table: string;
  columns: string | null;
  order: { column: string; ascending: boolean } | null;
  limit: number | null;
}

class FakeDb {
  queries: RecordedQuery[] = [];
  results = new Map<string, QueryResult | Error>();
}

class FakeQuery {
  private columns: string | null = null;
  private orderColumn: string | null = null;
  private ascending = true;
  private limitCount: number | null = null;

  constructor(
    private readonly db: FakeDb,
    private readonly table: string,
  ) {}

  select(columns?: string): FakeQuery {
    this.columns = columns ?? null;
    return this;
  }

  order(column: string, options?: { ascending?: boolean }): FakeQuery {
    this.orderColumn = column;
    this.ascending = options?.ascending ?? true;
    return this;
  }

  limit(count: number): FakeQuery {
    this.limitCount = count;
    return this;
  }

  then<TResult1 = QueryResult, TResult2 = never>(
    onfulfilled?:
      | ((value: QueryResult) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.run().then(onfulfilled, onrejected);
  }

  private async run(): Promise<QueryResult> {
    this.db.queries.push({
      table: this.table,
      columns: this.columns,
      order:
        this.orderColumn === null
          ? null
          : { column: this.orderColumn, ascending: this.ascending },
      limit: this.limitCount,
    });
    const result = this.db.results.get(this.table);
    if (result instanceof Error) throw result;
    return result ?? { data: [], error: null };
  }
}

function makeClient(db: FakeDb): RemoteClient {
  return {
    auth: {} as RemoteClient["auth"],
    from: (table: string) =>
      new FakeQuery(db, table) as unknown as RemoteQuery,
  };
}

function viewRow(username: unknown, score: unknown, streak: unknown) {
  return {
    username,
    score,
    solved: 3,
    current_streak: streak,
    longest_streak: 9,
    updated_at: "2026-09-01T00:00:00.000Z",
  };
}

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "pk_test";
  setRemoteClient(null);
});

afterEach(() => {
  setRemoteClient(null);
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
});

/* ─────────────────────────────── availability ───────────────────────────── */

describe("isGlobalLeaderboardAvailable", () => {
  test("tracks the Supabase env configuration", () => {
    expect(isGlobalLeaderboardAvailable()).toBe(true);
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    expect(isGlobalLeaderboardAvailable()).toBe(false);
  });
});

describe("fetchGlobalLeaderboard", () => {
  test("returns null without a client and never touches the network", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    const result = await fetchGlobalLeaderboard();

    expect(result).toBeNull();
  });

  test("queries the leaderboard view and maps rows in server order", async () => {
    const db = new FakeDb();
    db.results.set("leaderboard", {
      data: [
        viewRow("ada", 42, 5),
        viewRow("grace", 30, 2),
      ],
      error: null,
    });
    setRemoteClient(makeClient(db));

    const result = await fetchGlobalLeaderboard(10);

    expect(result).not.toBeNull();
    expect(result?.error).toBeNull();
    expect(result?.rows.map((row) => row.name)).toEqual(["ada", "grace"]);
    expect(result?.rows[0].score).toBe(42);
    expect(result?.rows[0].solved).toBe(3);
    expect(result?.rows[0].streak).toBe(5);
    expect(result?.rows[0].longestStreak).toBe(9);
    expect(result?.rows[0].updatedAt).toBe("2026-09-01T00:00:00.000Z");

    expect(db.queries).toHaveLength(1);
    expect(db.queries[0]).toEqual({
      table: "leaderboard",
      columns: GLOBAL_LEADERBOARD_COLUMNS,
      order: { column: "score", ascending: false },
      limit: 10,
    });
  });

  test("uses the 50-row default limit", async () => {
    const db = new FakeDb();
    db.results.set("leaderboard", { data: [], error: null });
    setRemoteClient(makeClient(db));

    await fetchGlobalLeaderboard();

    expect(db.queries[0].limit).toBe(GLOBAL_LEADERBOARD_DEFAULT_LIMIT);
  });

  test("maps a missing username to anon and non-numbers to zero", async () => {
    const db = new FakeDb();
    db.results.set("leaderboard", {
      data: [
        viewRow("   ", "nope", null),
        { username: null, score: 7, solved: 1, current_streak: 3, longest_streak: 4 },
      ],
      error: null,
    });
    setRemoteClient(makeClient(db));

    const result = await fetchGlobalLeaderboard();

    expect(result?.rows[0].name).toBe("anon");
    expect(result?.rows[0].score).toBe(0);
    expect(result?.rows[0].streak).toBe(0);
    expect(result?.rows[0].updatedAt).toBe("2026-09-01T00:00:00.000Z");
    expect(result?.rows[1].name).toBe("anon");
    expect(result?.rows[1].updatedAt).toBeNull();
    expect(result?.rows[0].id).not.toBe(result?.rows[1].id);
  });

  test("returns the query error instead of throwing", async () => {
    const db = new FakeDb();
    db.results.set("leaderboard", {
      data: null,
      error: { message: "relation does not exist" },
    });
    setRemoteClient(makeClient(db));

    const result = await fetchGlobalLeaderboard();

    expect(result).not.toBeNull();
    expect(result?.rows).toEqual([]);
    expect(result?.error).toBe("relation does not exist");
  });

  test("catches a throwing client and still resolves", async () => {
    setRemoteClient({
      auth: {} as RemoteClient["auth"],
      from: () => {
        throw new Error("client exploded");
      },
    });

    const result = await fetchGlobalLeaderboard();

    expect(result).not.toBeNull();
    expect(result?.rows).toEqual([]);
    expect(result?.error).toBe("client exploded");
  });

  test("falls back to the default limit for invalid input", async () => {
    const db = new FakeDb();
    db.results.set("leaderboard", { data: [], error: null });
    setRemoteClient(makeClient(db));

    await fetchGlobalLeaderboard(0);

    expect(db.queries[0].limit).toBe(GLOBAL_LEADERBOARD_DEFAULT_LIMIT);
  });
});
