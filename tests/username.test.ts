import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  getUserName,
  setUserName,
  validateUsername,
} from "@/lib/leaderboard";

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
});

afterEach(() => {
  if (hadWindow) globalScope.window = originalWindow;
  else delete globalScope.window;
});

describe("validateUsername", () => {
  test("accepts letters, digits, underscores, hyphens and spaces", () => {
    expect(validateUsername("ada")).toEqual({ value: "ada", error: null });
    expect(validateUsername("user_42")).toEqual({
      value: "user_42",
      error: null,
    });
    expect(validateUsername("deep-forge")).toEqual({
      value: "deep-forge",
      error: null,
    });
    expect(validateUsername("Ada Lovelace")).toEqual({
      value: "Ada Lovelace",
      error: null,
    });
    expect(validateUsername("a-a_b")).toEqual({ value: "a-a_b", error: null });
  });

  test("trims edges and collapses repeated whitespace", () => {
    expect(validateUsername("  Ada   Lovelace  ")).toEqual({
      value: "Ada Lovelace",
      error: null,
    });
    expect(validateUsername("Ada\tLovelace")).toEqual({
      value: "Ada Lovelace",
      error: null,
    });
    expect(validateUsername("Ada \n Lovelace")).toEqual({
      value: "Ada Lovelace",
      error: null,
    });
  });

  test("rejects empty and whitespace-only input", () => {
    expect(validateUsername("")).toEqual({
      value: null,
      error: "Enter a username.",
    });
    expect(validateUsername("   ")).toEqual({
      value: null,
      error: "Enter a username.",
    });
  });

  test("enforces the 3–24 character range", () => {
    expect(validateUsername("ab").value).toBeNull();
    expect(validateUsername("a".repeat(25)).value).toBeNull();
    expect(validateUsername("abc").value).toBe("abc");
    expect(validateUsername("a".repeat(24)).value).toBe("a".repeat(24));
  });

  test("rejects unsupported characters", () => {
    expect(validateUsername("ada!")).toEqual({
      value: null,
      error: "Use only letters, numbers, spaces, _ and -.",
    });
    expect(validateUsername("ada@example.com").value).toBeNull();
    expect(validateUsername("émile").value).toBeNull();
  });

  test("rejects leading and trailing separators", () => {
    expect(validateUsername("_ada")).toEqual({
      value: null,
      error: "Username can't start or end with _ or -.",
    });
    expect(validateUsername("-ada").value).toBeNull();
    expect(validateUsername("ada_").value).toBeNull();
    expect(validateUsername("ada-").value).toBeNull();
  });

  test("rejects reserved names case-insensitively", () => {
    for (const name of [
      "anon",
      "anonymous",
      "admin",
      "deepforge",
      "zero",
      "Admin",
      "ANON",
    ]) {
      expect(validateUsername(name)).toEqual({
        value: null,
        error: "That username is reserved.",
      });
    }
  });

  test("does not touch storage", () => {
    validateUsername("ada");
    expect(stub.getItem("deepforge:username:v1")).toBeNull();
  });
});

describe("username store round-trip", () => {
  test("normalizes before storing and dispatches the change event", () => {
    expect(getUserName()).toBe("you");

    const valid = validateUsername("  Ada   Lovelace  ");
    expect(valid.error).toBeNull();
    expect(valid.value).toBe("Ada Lovelace");
    setUserName(valid.value as string);

    expect(stub.getItem("deepforge:username:v1")).toBe("Ada Lovelace");
    expect(getUserName()).toBe("Ada Lovelace");
    expect(dispatched).toContain("deepforge:username-change");
  });

  test("collapses whitespace written straight to the setter", () => {
    setUserName("tensor   tina");
    expect(getUserName()).toBe("tensor tina");
  });

  test("trims surrounding whitespace and falls back to the default", () => {
    setUserName("  Ada  ");
    expect(stub.getItem("deepforge:username:v1")).toBe("Ada");
    expect(getUserName()).toBe("Ada");

    setUserName("   ");
    expect(getUserName()).toBe("you");
    expect(stub.getItem("deepforge:username:v1")).toBe("you");
  });
});
