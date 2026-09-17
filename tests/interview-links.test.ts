import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { backTarget, problemHref } from "@/lib/problemLinks";
import { getBestInterviewResult, getInterviewResults } from "@/lib/interview";

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
const INTERVIEW_KEY = "deepforge:interview:v1";
const VALID_AT = "2026-01-02T03:04:05.000Z";
let originalWindow: unknown;
let hadWindow = false;
let stub: Storage;

beforeEach(() => {
  hadWindow = "window" in globalScope;
  originalWindow = globalScope.window;
  stub = createStorageStub();
  globalScope.window = {
    localStorage: stub,
    dispatchEvent: () => true,
  };
});

afterEach(() => {
  if (hadWindow) globalScope.window = originalWindow;
  else delete globalScope.window;
});

describe("interview track origins", () => {
  test("problems opened from a track return to that track", () => {
    expect(backTarget("/interview/anthropic")).toEqual({
      href: "/interview/anthropic",
      label: "Back to track",
    });
    expect(
      backTarget("/interview/machine-learning-engineer-general"),
    ).toEqual({
      href: "/interview/machine-learning-engineer-general",
      label: "Back to track",
    });
  });

  test("the interview index keeps its generic label", () => {
    expect(backTarget("/interview")).toEqual({
      href: "/interview",
      label: "Back to interview prep",
    });
  });

  test("problem links encode the track origin", () => {
    expect(problemHref("dl-001", "/interview/anthropic")).toBe(
      "/problems/dl-001?from=%2Finterview%2Fanthropic",
    );
  });
});

describe("interview result sanitization", () => {
  test("non-array and unparseable payloads read as empty without throwing", () => {
    for (const raw of [
      "not json at all",
      "null",
      "42",
      '"nope"',
      "{}",
      '{"trackId":"anthropic"}',
    ]) {
      stub.setItem(INTERVIEW_KEY, raw);
      expect(getInterviewResults()).toEqual([]);
    }
  });

  test("malformed entries are dropped and junk numerics fall back to 0", () => {
    stub.setItem(
      INTERVIEW_KEY,
      `[null,42,"nope",[],{},{` +
        `"trackId":7,"solved":1,"total":1,"seconds":1,"completedAt":"${VALID_AT}"},{` +
        `"trackId":"","solved":1,"total":1,"seconds":1,"completedAt":"${VALID_AT}"},{` +
        `"trackId":"no-time","solved":1,"total":1,"seconds":1,"completedAt":null},{` +
        `"trackId":"partial","solved":"3","total":null,"seconds":1e400,"completedAt":"${VALID_AT}"},{` +
        `"trackId":"clamped","solved":-4,"total":2.7,"seconds":12.5,"completedAt":"${VALID_AT}"},{` +
        `"trackId":"valid","solved":3,"total":5,"seconds":90,"completedAt":"${VALID_AT}"}]`,
    );

    expect(getInterviewResults()).toEqual([
      { trackId: "partial", solved: 0, total: 0, seconds: 0, completedAt: VALID_AT },
      { trackId: "clamped", solved: 0, total: 3, seconds: 13, completedAt: VALID_AT },
      { trackId: "valid", solved: 3, total: 5, seconds: 90, completedAt: VALID_AT },
    ]);
  });

  test("best-attempt lookup ignores junk and never throws", () => {
    stub.setItem(
      INTERVIEW_KEY,
      JSON.stringify([
        null,
        { trackId: "anthropic" },
        {
          trackId: "anthropic",
          solved: 2,
          total: 5,
          seconds: 300,
          completedAt: VALID_AT,
        },
      ]),
    );

    const best = getBestInterviewResult("anthropic");
    expect(best).toEqual({
      trackId: "anthropic",
      solved: 2,
      total: 5,
      seconds: 300,
      completedAt: VALID_AT,
    });
    expect(getBestInterviewResult("missing")).toBeNull();
  });
});
