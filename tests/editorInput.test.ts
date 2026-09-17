import { describe, expect, test } from "bun:test";
import { applyEditorEdit } from "@/lib/editorInput";

describe("applyEditorEdit", () => {
  test("Tab inserts four spaces at the cursor", () => {
    const edit = applyEditorEdit("ab", 1, 1, "Tab");
    expect(edit).toEqual({ value: "a    b", start: 5, end: 5 });
  });

  test("Shift+Tab is left to the browser (focus release)", () => {
    expect(applyEditorEdit("ab", 1, 1, "Tab", true)).toBeNull();
  });

  test("Enter keeps the current indent", () => {
    const edit = applyEditorEdit("def f():\n    x = 1", 18, 18, "Enter");
    expect(edit?.value).toBe("def f():\n    x = 1\n    ");
    expect(edit?.start).toBe(23);
  });

  test("Enter adds an indent after a colon (Python block)", () => {
    const edit = applyEditorEdit("def f():", 8, 8, "Enter");
    expect(edit?.value).toBe("def f():\n    ");
    expect(edit?.start).toBe(13);
  });

  test("Enter adds an indent inside an open bracket", () => {
    const edit = applyEditorEdit("value = call(a,", 15, 15, "Enter");
    expect(edit?.value).toBe("value = call(a,\n    ");
  });

  test("Enter does not over-indent when the line continues after the cursor", () => {
    const edit = applyEditorEdit("if x: y = 1", 5, 5, "Enter");
    expect(edit?.value).toBe("if x:\n y = 1");
  });

  test("auto-closes brackets and keeps the cursor inside", () => {
    expect(applyEditorEdit("", 0, 0, "(")).toEqual({
      value: "()",
      start: 1,
      end: 1,
    });
    expect(applyEditorEdit("", 0, 0, "[")).toEqual({
      value: "[]",
      start: 1,
      end: 1,
    });
    expect(applyEditorEdit("", 0, 0, "{")).toEqual({
      value: "{}",
      start: 1,
      end: 1,
    });
  });

  test("auto-closes quotes but not inside words", () => {
    expect(applyEditorEdit("", 0, 0, '"')).toEqual({
      value: '""',
      start: 1,
      end: 1,
    });
    expect(applyEditorEdit("don", 3, 3, "'")).toBeNull();
    expect(applyEditorEdit("print(", 6, 6, '"')).toEqual({
      value: 'print(""',
      start: 7,
      end: 7,
    });
  });

  test("typing a closing character steps over the existing one", () => {
    const value = "()";
    expect(applyEditorEdit(value, 1, 1, ")")).toEqual({
      value,
      start: 2,
      end: 2,
    });
    expect(applyEditorEdit('""', 1, 1, '"')).toEqual({
      value: '""',
      start: 2,
      end: 2,
    });
  });

  test("Backspace removes a whole empty pair", () => {
    expect(applyEditorEdit("()", 1, 1, "Backspace")).toEqual({
      value: "",
      start: 0,
      end: 0,
    });
    expect(applyEditorEdit('"x"', 1, 1, "Backspace")).toBeNull();
  });

  test("ignores ordinary keys and selections for pair logic", () => {
    expect(applyEditorEdit("abc", 1, 1, "a")).toBeNull();
    expect(applyEditorEdit("abc", 0, 3, "(")).toBeNull();
  });
});
