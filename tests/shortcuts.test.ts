import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  findRoute,
  hasModifier,
  HELP_KEY,
  isDialogOpen,
  MODAL_DIALOG_SELECTOR,
  normalizeKey,
  resolveSequence,
  SEQUENCE_TIMEOUT_MS,
  SHORTCUT_ROUTES,
  shouldIgnoreTarget,
  type KeyPress,
} from "@/components/Shortcuts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function press(key: string, at: number): KeyPress {
  return { key, at };
}

function pagePath(href: string): string {
  return href === "/"
    ? join(ROOT, "src", "app", "page.tsx")
    : join(ROOT, "src", "app", ...href.slice(1).split("/"), "page.tsx");
}

describe("resolveSequence", () => {
  test("resolves every documented g-sequence well inside the window", () => {
    for (const route of SHORTCUT_ROUTES) {
      const outcome = resolveSequence([
        press(route.sequence[0], 0),
        press(route.sequence[1], SEQUENCE_TIMEOUT_MS - 1),
      ]);
      expect(outcome.kind).toBe("navigate");
      if (outcome.kind === "navigate") {
        expect(outcome.route.href).toBe(route.href);
        expect(outcome.route.label).toBe(route.label);
      }
    }
  });

  test("a lone g arms the sequence instead of navigating", () => {
    expect(resolveSequence([press("g", 0)]).kind).toBe("pending");
  });

  test("upper-case keys resolve the same route", () => {
    const outcome = resolveSequence([press("G", 0), press("P", 500)]);
    expect(outcome.kind).toBe("navigate");
    if (outcome.kind === "navigate") {
      expect(outcome.route.href).toBe("/problems");
    }
  });

  test("the window is inclusive at the boundary and expires after it", () => {
    expect(
      resolveSequence([press("g", 0), press("p", SEQUENCE_TIMEOUT_MS)]).kind,
    ).toBe("navigate");
    expect(
      resolveSequence([press("g", 0), press("p", SEQUENCE_TIMEOUT_MS + 1)]).kind,
    ).toBe("none");
  });

  test("a wrong second key cancels the sequence", () => {
    expect(resolveSequence([press("g", 0), press("x", 100)]).kind).toBe(
      "cancel",
    );
    expect(
      resolveSequence([press("g", 0), press("g", 100)]).kind,
    ).toBe("cancel");
  });

  test("escape cancels a pending sequence", () => {
    expect(
      resolveSequence([press("g", 0), press("Escape", 50)]).kind,
    ).toBe("cancel");
    expect(resolveSequence([press("Escape", 50)]).kind).toBe("cancel");
  });

  test("unrelated keys and an empty buffer are inert", () => {
    expect(resolveSequence([]).kind).toBe("none");
    expect(resolveSequence([press("p", 0)]).kind).toBe("none");
    expect(resolveSequence([press("k", 0)]).kind).toBe("none");
  });

  test("a custom timeout is honoured", () => {
    expect(
      resolveSequence([press("g", 0), press("t", 400)], 300).kind,
    ).toBe("none");
    expect(
      resolveSequence([press("g", 0), press("t", 250)], 300).kind,
    ).toBe("navigate");
  });
});

describe("findRoute", () => {
  test("resolves every route by its documented key pair", () => {
    for (const route of SHORTCUT_ROUTES) {
      expect(findRoute(route.sequence[0], route.sequence[1])?.href).toBe(
        route.href,
      );
    }
  });

  test("is order-sensitive and rejects unknown keys", () => {
    expect(findRoute("p", "g")).toBeUndefined();
    expect(findRoute("g", "z")).toBeUndefined();
  });
});

describe("normalizeKey", () => {
  test("lower-cases single characters and leaves named keys alone", () => {
    expect(normalizeKey("G")).toBe("g");
    expect(normalizeKey("g")).toBe("g");
    expect(normalizeKey("?")).toBe(HELP_KEY);
    expect(normalizeKey("Escape")).toBe("Escape");
  });
});

describe("shouldIgnoreTarget", () => {
  test("ignores inputs, textareas and selects regardless of case", () => {
    expect(shouldIgnoreTarget({ tagName: "input" })).toBe(true);
    expect(shouldIgnoreTarget({ tagName: "INPUT" })).toBe(true);
    expect(shouldIgnoreTarget({ tagName: "textarea" })).toBe(true);
    expect(shouldIgnoreTarget({ tagName: "SELECT" })).toBe(true);
  });

  test("ignores contenteditable hosts", () => {
    expect(
      shouldIgnoreTarget({ tagName: "DIV", isContentEditable: true }),
    ).toBe(true);
  });

  test("allows normal elements and nullish targets", () => {
    expect(shouldIgnoreTarget({ tagName: "BODY" })).toBe(false);
    expect(shouldIgnoreTarget({ tagName: "BUTTON" })).toBe(false);
    expect(shouldIgnoreTarget({ tagName: "A", isContentEditable: false })).toBe(
      false,
    );
    expect(shouldIgnoreTarget(null)).toBe(false);
    expect(shouldIgnoreTarget(undefined)).toBe(false);
  });
});

describe("hasModifier", () => {
  test("suppresses meta, ctrl and alt combos", () => {
    expect(hasModifier({ metaKey: true })).toBe(true);
    expect(hasModifier({ ctrlKey: true })).toBe(true);
    expect(hasModifier({ altKey: true })).toBe(true);
  });

  test("allows plain presses and shift (needed for ?)", () => {
    expect(hasModifier({})).toBe(false);
    expect(hasModifier({ shiftKey: true })).toBe(false);
    expect(hasModifier(null)).toBe(false);
  });
});

describe("isDialogOpen", () => {
  test("uses the modal selector that the palette marks itself open with", () => {
    expect(MODAL_DIALOG_SELECTOR).toBe('[role="dialog"][aria-modal="true"]');
    const fake = {
      querySelector: (selector: string) =>
        selector === MODAL_DIALOG_SELECTOR ? ({} as unknown) : null,
    } as unknown as ParentNode;
    expect(isDialogOpen(fake)).toBe(true);
    expect(isDialogOpen(null)).toBe(false);
  });
});

describe("SHORTCUT_ROUTES", () => {
  test("has unique sequences, labels and hrefs", () => {
    const keys = SHORTCUT_ROUTES.map((route) => route.keys);
    const hrefs = SHORTCUT_ROUTES.map((route) => route.href);
    const labels = SHORTCUT_ROUTES.map((route) => route.label);
    expect(new Set(keys).size).toBe(SHORTCUT_ROUTES.length);
    expect(new Set(hrefs).size).toBe(SHORTCUT_ROUTES.length);
    expect(new Set(labels).size).toBe(SHORTCUT_ROUTES.length);
  });

  test("every sequence starts with g and matches its display keys", () => {
    for (const route of SHORTCUT_ROUTES) {
      expect(route.sequence[0]).toBe("g");
      expect(route.keys).toBe(`${route.sequence[0]} ${route.sequence[1]}`);
    }
  });

  test("every href is a real, internal route with a page", () => {
    for (const route of SHORTCUT_ROUTES) {
      expect(route.href.startsWith("/")).toBe(true);
      expect(route.href.includes(" ")).toBe(false);
      expect(existsSync(pagePath(route.href))).toBe(true);
    }
  });
});
