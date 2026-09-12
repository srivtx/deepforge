import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  deleteDraft,
  draftToTs,
  duplicateDraft,
  exportAllDrafts,
  getDrafts,
  importDrafts,
  runDraftTests,
  saveDraft,
  validateDraft,
  type DraftTestCase,
  type SubmissionDraft,
} from "@/lib/submissions";
import type { Category, Difficulty } from "@/types/problem";

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

beforeEach(() => {
  hadWindow = "window" in globalScope;
  originalWindow = globalScope.window;
  globalScope.window = {
    localStorage: createStorageStub(),
    dispatchEvent: () => true,
  };
});

afterEach(() => {
  if (hadWindow) globalScope.window = originalWindow;
  else delete globalScope.window;
});

function makeDraft(overrides: Partial<SubmissionDraft> = {}): SubmissionDraft {
  return {
    id: "draft-1",
    title: "Add Two Numbers",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return the sum of two integer arguments, handling zeros, negatives, and large values without special cases.",
    starterCode: "def add(a, b):\n    pass",
    solution: "def add(a, b):\n    return a + b",
    testCases: [
      { input: "[2, 3]", expected: "5" },
      { input: "[0, 0]", expected: "0" },
      { input: "[-4, 7]", expected: "3" },
      { input: "[100, 250]", expected: "350" },
      { input: "[-5, -6]", expected: "-11" },
    ],
    hint: "Use the + operator.",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    status: "draft",
    ...overrides,
  };
}

function evaluateTs(output: string): Record<string, any> {
  const expr = output.split("\n").slice(1).join("\n");
  return new Function("return " + expr)() as Record<string, any>;
}

function captureThrow(fn: () => unknown): string {
  try {
    fn();
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
  throw new Error("expected the call to throw");
}

describe("validateDraft", () => {
  test("accepts a fully specified draft without errors or warnings", () => {
    const result = validateDraft(makeDraft());
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  test("warns about a short case list and a missing hint", () => {
    const draft = makeDraft({
      testCases: makeDraft().testCases.slice(0, 3),
      hint: undefined,
    });
    const { errors, warnings } = validateDraft(draft);
    expect(errors).toEqual([]);
    expect(warnings).toHaveLength(2);
    expect(warnings.join(" ")).toContain("Fewer than 5 test cases");
    expect(warnings.join(" ")).toContain("No hint yet");
  });

  test("rejects blank required fields and unknown taxonomy values", () => {
    const draft = makeDraft({
      title: "   ",
      category: "Nope" as Category,
      difficulty: "Impossible" as Difficulty,
      description: "",
      starterCode: "",
      solution: "",
    });
    const { errors } = validateDraft(draft);
    expect(errors).toContain("Title is required.");
    expect(errors).toContain('Category "Nope" is not recognized.');
    expect(errors).toContain(
      'Difficulty "Impossible" must be Easy, Medium, or Hard.',
    );
    expect(errors).toContain("Description is required.");
    expect(errors).toContain("Starter code is required.");
    expect(errors).toContain("Solution is required.");
    expect(errors.join(" ")).toContain(
      "Starter code must define a function with `def name(...)`.",
    );
    expect(errors.join(" ")).toContain(
      "Solution must define a function with `def name(...)`.",
    );
  });

  test("rejects fewer than three or more than six test cases", () => {
    const two = makeDraft({ testCases: makeDraft().testCases.slice(0, 2) });
    expect(validateDraft(two).errors.join(" ")).toContain(
      "At least 3 test cases are required",
    );

    const extra = [
      ...makeDraft().testCases,
      { input: "[1, 1]", expected: "2" },
      { input: "[2, 2]", expected: "4" },
    ];
    const seven = makeDraft({ testCases: extra });
    expect(validateDraft(seven).errors.join(" ")).toContain(
      "At most 6 test cases are allowed",
    );
  });

  test("rejects starter and solution functions with different names", () => {
    const draft = makeDraft({
      solution: "def plus(a, b):\n    return a + b",
    });
    expect(validateDraft(draft).errors.join(" ")).toContain("same function");
  });

  test("rejects identical starter and solution code", () => {
    const draft = makeDraft({ solution: makeDraft().starterCode });
    expect(validateDraft(draft).errors.join(" ")).toContain(
      "Solution must differ from the starter code.",
    );
  });

  test("rejects backticks and interpolation sequences in text fields", () => {
    const header = makeDraft({ title: "Add `two` numbers" });
    expect(validateDraft(header).errors.join(" ")).toContain(
      "Title must not contain a backtick.",
    );

    const backtick = makeDraft({
      starterCode: "def add(a, b):\n    return `bad`",
    });
    expect(validateDraft(backtick).errors.join(" ")).toContain(
      "Starter code must not contain a backtick.",
    );

    const interp = makeDraft({
      solution: 'def add(a, b):\n    return f"${a + b}"',
    });
    expect(validateDraft(interp).errors.join(" ")).toContain(
      'Solution must not contain the sequence "${".',
    );
  });

  test("reports each malformed test case with its index", () => {
    const draft = makeDraft({
      testCases: [
        { input: "[1, ", expected: "1" },
        { input: "5", expected: "5" },
        { input: "[1]", expected: "{nope}" },
        { input: "", expected: "1" },
      ],
    });
    const joined = validateDraft(draft).errors.join("\n");
    expect(joined).toContain("Test case 1: input is not valid JSON.");
    expect(joined).toContain(
      "Test case 2: input must be a JSON array of positional arguments.",
    );
    expect(joined).toContain("Test case 3: expected is not valid JSON.");
    expect(joined).toContain("Test case 4: input is required.");
  });

  test("rejects a too-short description", () => {
    const draft = makeDraft({ description: "Too short." });
    expect(validateDraft(draft).errors.join(" ")).toContain(
      "Description must be at least 40 characters.",
    );
  });
});

describe("draftToTs", () => {
  test("emits a header, an evaluable object, and the parsed case values", () => {
    const draft = makeDraft();
    const output = draftToTs(draft);
    expect(output.split("\n")[0]).toBe(
      "// paste into src/data/problems/algorithms/part-XX.ts",
    );

    const exported = evaluateTs(output);
    expect(exported.id).toBe("al-000");
    expect(exported.title).toBe("Add Two Numbers");
    expect(exported.category).toBe("Algorithms");
    expect(exported.difficulty).toBe("Easy");
    expect(exported.description).toBe(draft.description);
    expect(exported.starterCode).toBe(draft.starterCode);
    expect(exported.solution).toBe(draft.solution);
    expect(exported.hint).toBe("Use the + operator.");
    expect(exported.testCases).toHaveLength(5);
    expect(exported.testCases[0]).toEqual({ input: [2, 3], expected: 5 });
    expect(exported.testCases[4]).toEqual({ input: [-5, -6], expected: -11 });
  });

  test("omits the hint key when there is no hint", () => {
    const exported = evaluateTs(draftToTs(makeDraft({ hint: undefined })));
    expect(exported.hint).toBeUndefined();
  });

  test("escapes backslashes, backticks, and interpolation sequences", () => {
    const tricky = [
      "def echo(a, b):",
      "    label = `item ${a}`",
      '    path = "C:\\\\tmp\\\\file"',
      "    return label, path",
    ].join("\n");
    const draft = makeDraft({
      starterCode: tricky,
      solution: tricky + "\n    # variant",
    });

    const exported = evaluateTs(draftToTs(draft));
    expect(exported.starterCode).toBe(tricky);
    expect(exported.solution).toBe(tricky + "\n    # variant");
  });

  test("throws before exporting when a case is not parseable", () => {
    const badInput = makeDraft({
      testCases: [{ input: "{bad", expected: "1" }],
    });
    expect(captureThrow(() => draftToTs(badInput))).toContain(
      "Test case 1: input is not valid JSON",
    );

    const scalarInput = makeDraft({
      testCases: [{ input: "5", expected: "5" }],
    });
    expect(captureThrow(() => draftToTs(scalarInput))).toContain(
      "input must be a JSON array of positional arguments",
    );

    const badExpected = makeDraft({
      testCases: [{ input: "[1]", expected: "{bad" }],
    });
    expect(captureThrow(() => draftToTs(badExpected))).toContain(
      "Test case 1: expected is not valid JSON",
    );
  });
});

describe("draft storage", () => {
  test("saveDraft assigns an id and getDrafts round-trips it", () => {
    const saved = saveDraft(makeDraft({ id: "", createdAt: "", updatedAt: "" }));
    expect(saved.id.length).toBeGreaterThan(0);
    const drafts = getDrafts();
    expect(drafts).toHaveLength(1);
    expect(drafts[0]).toEqual(saved);
  });

  test("saving the same id updates in place and preserves createdAt", () => {
    const first = saveDraft(makeDraft());
    const second = saveDraft({ ...first, title: "Updated Title" });
    expect(second.id).toBe(first.id);
    expect(second.title).toBe("Updated Title");
    expect(second.createdAt).toBe(first.createdAt);

    const drafts = getDrafts();
    expect(drafts).toHaveLength(1);
    expect(drafts[0].title).toBe("Updated Title");
    expect(drafts[0].createdAt).toBe(first.createdAt);
  });

  test("saveDraft normalizes blank hints and non-string case fields", () => {
    const dirty: SubmissionDraft = makeDraft({
      hint: "   ",
      testCases: [{ input: 7, expected: null }] as unknown as DraftTestCase[],
    });
    const saved = saveDraft(dirty);
    expect(saved.hint).toBeUndefined();
    expect(saved.testCases).toEqual([{ input: "", expected: "" }]);
  });

  test("deleteDraft removes once and ignores unknown ids", () => {
    const saved = saveDraft(makeDraft());
    deleteDraft(saved.id);
    expect(getDrafts()).toEqual([]);
    deleteDraft("missing-id");
    expect(getDrafts()).toEqual([]);
  });

  test("duplicateDraft copies in place with a suffixed title", () => {
    const source = saveDraft(makeDraft({ title: "Original" }));
    const copy = duplicateDraft(source.id);
    expect(copy).not.toBeNull();
    expect(copy!.id).not.toBe(source.id);
    expect(copy!.title).toBe("Original (copy)");
    expect(copy!.status).toBe("draft");
    expect(copy!.testCases).toEqual(source.testCases);

    const drafts = getDrafts();
    expect(drafts).toHaveLength(2);
    expect(drafts[0].id).toBe(source.id);
    expect(drafts[1].id).toBe(copy!.id);
    expect(duplicateDraft("missing-id")).toBeNull();
  });

  test("duplicating an untitled draft uses the fallback name", () => {
    const source = saveDraft(makeDraft({ title: "" }));
    const copy = duplicateDraft(source.id);
    expect(copy!.title).toBe("Untitled draft (copy)");
  });
});

describe("import and export", () => {
  test("exportAllDrafts wraps every draft in the versioned envelope", () => {
    const saved = saveDraft(makeDraft());
    const parsed = JSON.parse(exportAllDrafts());
    expect(parsed.app).toBe("deepforge-submissions");
    expect(parsed.version).toBe(1);
    expect(typeof parsed.exportedAt).toBe("string");
    expect(parsed.drafts).toHaveLength(1);
    expect(parsed.drafts[0].id).toBe(saved.id);
  });

  test("importDrafts accepts a bare array and skips invalid entries", () => {
    const a = makeDraft({ id: "import-a", title: "A" });
    const b = makeDraft({ id: "import-b", title: "B" });
    expect(importDrafts(JSON.stringify([a, b, { id: 5 }, null]))).toEqual({
      imported: 2,
    });
    expect(
      getDrafts()
        .map((draft) => draft.id)
        .sort(),
    ).toEqual(["import-a", "import-b"]);
  });

  test("importDrafts accepts the exported envelope", () => {
    const a = makeDraft({ id: "envelope-a" });
    const envelope = {
      app: "deepforge-submissions",
      version: 1,
      exportedAt: "2026-01-01T00:00:00.000Z",
      drafts: [a],
    };
    expect(importDrafts(JSON.stringify(envelope))).toEqual({ imported: 1 });
    expect(getDrafts()[0].id).toBe("envelope-a");
  });

  test("importDrafts overwrites an existing id but keeps its createdAt", () => {
    const existing = saveDraft(
      makeDraft({ id: "same-id", title: "Old", createdAt: "2020-01-01T00:00:00.000Z" }),
    );
    const incoming = makeDraft({
      id: "same-id",
      title: "New",
      createdAt: "2026-06-01T00:00:00.000Z",
    });
    expect(importDrafts(JSON.stringify([incoming]))).toEqual({ imported: 1 });

    const drafts = getDrafts();
    expect(drafts).toHaveLength(1);
    expect(drafts[0].title).toBe("New");
    expect(drafts[0].createdAt).toBe(existing.createdAt);
  });

  test("importDrafts rejects garbage without throwing", () => {
    expect(importDrafts("{not json")).toEqual({
      imported: 0,
      error: "That is not valid JSON.",
    });
    expect(importDrafts(JSON.stringify({ foo: 1 }))).toEqual({
      imported: 0,
      error: "Unrecognized submissions backup.",
    });
    expect(importDrafts(JSON.stringify("hello"))).toEqual({
      imported: 0,
      error: "Unrecognized submissions backup.",
    });
    expect(importDrafts(JSON.stringify([1, null, "x", { id: 5 }]))).toEqual({
      imported: 0,
      error: "No valid drafts found in that JSON.",
    });
  });
});

describe("runDraftTests preflight", () => {
  // These paths return before loadPyodideOnce(), so no CDN or Python is used.
  test("rejects empty and malformed cases without touching Pyodide", async () => {
    const noCases = await runDraftTests(makeDraft({ testCases: [] }));
    expect(noCases.ok).toBe(false);
    expect(noCases.error).toBe("No test cases to run.");

    const badInput = await runDraftTests(
      makeDraft({ testCases: [{ input: "{oops", expected: "1" }] }),
    );
    expect(badInput.error).toBe("Test case 1: input is not valid JSON.");

    const scalarInput = await runDraftTests(
      makeDraft({ testCases: [{ input: "5", expected: "5" }] }),
    );
    expect(scalarInput.error).toBe(
      "Test case 1: input must be a JSON array of positional arguments.",
    );

    const badExpected = await runDraftTests(
      makeDraft({ testCases: [{ input: "[1]", expected: "{oops" }] }),
    );
    expect(badExpected.error).toBe("Test case 1: expected is not valid JSON.");
  });
});
