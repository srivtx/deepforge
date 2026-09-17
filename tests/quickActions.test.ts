import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { isAssistantHidden, setAssistantHidden } from "@/lib/assistant";
import {
  matchQuickActions,
  QUICK_ACTIONS,
  scoreQuickAction,
  type QuickAction,
} from "@/lib/quickActions";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function actionById(id: string): QuickAction {
  const action = QUICK_ACTIONS.find((candidate) => candidate.id === id);
  if (!action) throw new Error(`unknown quick action ${id}`);
  return action;
}

function pagePath(href: string): string {
  return join(ROOT, "src", "app", ...href.slice(1).split("/"), "page.tsx");
}

describe("registry", () => {
  test("ids are unique", () => {
    const ids = QUICK_ACTIONS.map((action) => action.id);
    expect(new Set(ids).size).toBe(QUICK_ACTIONS.length);
  });

  test("labels and keywords are non-empty", () => {
    const labels = QUICK_ACTIONS.map((action) => action.label);
    expect(new Set(labels).size).toBe(QUICK_ACTIONS.length);
    for (const action of QUICK_ACTIONS) {
      expect(action.label.trim().length, action.id).toBeGreaterThan(0);
      expect(action.keywords.length, action.id).toBeGreaterThan(0);
      for (const keyword of action.keywords) {
        expect(keyword.trim().length, `${action.id}:${keyword}`).toBeGreaterThan(
          0,
        );
      }
    }
  });

  test("every navigate href is a real route and no run is attached", () => {
    const navigates = QUICK_ACTIONS.filter(
      (action) => action.kind === "navigate",
    );
    expect(navigates.length).toBeGreaterThan(0);
    for (const action of navigates) {
      const href = action.href;
      expect(typeof href, action.id).toBe("string");
      expect(href!.startsWith("/"), action.id).toBe(true);
      expect(href!.includes(" "), action.id).toBe(false);
      expect(href!.includes("?"), action.id).toBe(false);
      expect(existsSync(pagePath(href!)), `${action.id} → ${href}`).toBe(true);
      expect(action.run, action.id).toBeUndefined();
    }
  });

  test("every toggle carries a run and no href", () => {
    const toggles = QUICK_ACTIONS.filter((action) => action.kind === "toggle");
    expect(toggles.length).toBeGreaterThan(0);
    for (const action of toggles) {
      expect(typeof action.run, action.id).toBe("function");
      expect(action.href, action.id).toBeUndefined();
    }
  });

  test("all required verbs are registered with their routes", () => {
    const ids = new Set(QUICK_ACTIONS.map((action) => action.id));
    for (const id of [
      "today-session",
      "daily-challenge",
      "review-queue",
      "stats",
      "labs",
      "lab-trails",
      "research",
      "theme-toggle",
      "assistant-show",
      "assistant-hide",
    ]) {
      expect(ids.has(id), id).toBe(true);
    }
    expect(actionById("today-session").href).toBe("/today");
    expect(actionById("review-queue").href).toBe("/review");
    expect(actionById("daily-challenge").href).toBe("/daily");
    expect(actionById("stats").href).toBe("/stats");
    expect(actionById("labs").href).toBe("/labs");
    expect(actionById("lab-trails").href).toBe("/labs/trails");
    expect(actionById("research").href).toBe("/research");
  });
});

describe("matching", () => {
  test("blank and non-matching queries return nothing", () => {
    expect(matchQuickActions("")).toEqual([]);
    expect(matchQuickActions("   ")).toEqual([]);
    expect(matchQuickActions("\t\n")).toEqual([]);
    expect(matchQuickActions("zzzqqq flurble")).toEqual([]);
  });

  test("ignores case and surrounding whitespace", () => {
    const canonical = matchQuickActions("theme");
    expect(canonical.map((action) => action.id)).toEqual(["theme-toggle"]);
    expect(matchQuickActions("  THEME  ")).toEqual(canonical);
    expect(matchQuickActions("tHeMe")).toEqual(canonical);
    expect(matchQuickActions(" open today ")).toEqual(
      matchQuickActions("open today"),
    );
  });

  test("ranks prefix over word-boundary over substring", () => {
    const review = actionById("review-queue");
    const assistant = actionById("assistant-show");
    expect(scoreQuickAction(review, "open")).toBe(0);
    expect(scoreQuickAction(review, "the")).toBe(1);
    expect(scoreQuickAction(assistant, "ero")).toBe(2);
    expect(scoreQuickAction(review, "zzz")).toBe(-1);
    expect(scoreQuickAction(review, "")).toBe(-1);
  });

  test("orders ties by shorter label, then registry order", () => {
    // "the" prefixes the theme keyword, starts a later word in the 21-char
    // review label, both assistant labels (23 chars each), and the 25-char
    // daily label.
    expect(matchQuickActions("the").map((action) => action.id)).toEqual([
      "theme-toggle",
      "review-queue",
      "assistant-show",
      "assistant-hide",
      "daily-challenge",
    ]);
    // All "Open …" labels prefix-match; shorter labels first (labs, then the
    // 19-char review label, then the 20-char today label).
    expect(matchQuickActions("open").map((action) => action.id)).toEqual([
      "papers",
      "lab-trails",
      "labs",
      "review-queue",
      "today-session",
      "research",
    ]);
    // Same prefix tier: the 15-char stats label beats the 23-char one.
    expect(matchQuickActions("show").map((action) => action.id)).toEqual([
      "stats",
      "assistant-show",
    ]);
  });

  test("keyword hits surface actions whose labels lack the query", () => {
    expect(matchQuickActions("streak").map((action) => action.id)).toEqual([
      "daily-challenge",
    ]);
    expect(matchQuickActions("spaced").map((action) => action.id)).toEqual([
      "review-queue",
    ]);
    expect(matchQuickActions("mastery").map((action) => action.id)).toEqual([
      "stats",
    ]);
    expect(matchQuickActions("dismiss").map((action) => action.id)).toEqual([
      "assistant-hide",
    ]);
    expect(matchQuickActions("baseline").map((action) => action.id)).toEqual([
      "research",
    ]);
    expect(matchQuickActions("hands-on").map((action) => action.id)).toEqual([
      "labs",
    ]);
    expect(matchQuickActions("guided").map((action) => action.id)).toEqual([
      "lab-trails",
    ]);
  });

  test("is deterministic", () => {
    for (const query of ["the", "open", "zero", "a", "show", "assistant"]) {
      expect(JSON.stringify(matchQuickActions(query))).toBe(
        JSON.stringify(matchQuickActions(query)),
      );
    }
  });
});

describe("toggle execution", () => {
  test("theme toggle flips through the injected setter", () => {
    const toggle = actionById("theme-toggle");
    const calls: string[] = [];
    const setTheme = (theme: string) => calls.push(theme);

    toggle.run?.({ resolvedTheme: "dark", setTheme });
    expect(calls).toEqual(["light"]);
    toggle.run?.({ resolvedTheme: "light", setTheme });
    expect(calls).toEqual(["light", "dark"]);
    toggle.run?.({ setTheme });
    expect(calls).toEqual(["light", "dark", "dark"]);
  });

  test("theme toggle is a no-op without a setter", () => {
    expect(actionById("theme-toggle").run?.({})).toBeUndefined();
  });
});

/* ───────────────────────────── store harness ────────────────────────────── */

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
let dispatched: string[];

beforeEach(() => {
  hadWindow = "window" in globalScope;
  originalWindow = globalScope.window;
  const stub = createStorageStub();
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

describe("assistant preference", () => {
  test("hide then show round-trips the preference store", () => {
    expect(isAssistantHidden()).toBe(false);
    actionById("assistant-hide").run?.({});
    expect(isAssistantHidden()).toBe(true);
    actionById("assistant-show").run?.({});
    expect(isAssistantHidden()).toBe(false);
  });

  test("show clears a preference that was set outside the action", () => {
    setAssistantHidden(true);
    expect(isAssistantHidden()).toBe(true);
    actionById("assistant-show").run?.({});
    expect(isAssistantHidden()).toBe(false);
  });

  test("show is inert when the assistant is already visible", () => {
    dispatched = [];
    actionById("assistant-show").run?.({});
    expect(dispatched).toEqual([]);
  });

  test("both actions are SSR-safe without a window", () => {
    globalScope.window = undefined;
    expect(actionById("assistant-hide").run?.({})).toBeUndefined();
    expect(actionById("assistant-show").run?.({})).toBeUndefined();
    expect(dispatched).toEqual([]);
  });
});
