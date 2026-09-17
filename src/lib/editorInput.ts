/**
 * Shared behaviour for every code textarea in the app: Tab indentation,
 * newline auto-indent (Python colons and open brackets), bracket/quote
 * auto-closing, skip-over on the closing character, and deleting a whole
 * empty pair with Backspace.
 *
 * Pure and framework-free: callers apply the returned edit to their state and
 * set the selection in a rAF so controlled textareas stay in sync.
 */

export interface EditorEdit {
  value: string;
  start: number;
  end: number;
}

const INDENT = "    ";

const PAIRS: Record<string, string> = {
  "(": ")",
  "[": "]",
  "{": "}",
  '"': '"',
  "'": "'",
};

const CLOSERS = new Set([")", "]", "}", '"', "'"]);

function lineStartIndex(value: string, position: number): number {
  const index = value.lastIndexOf("\n", Math.max(0, position - 1));
  return index === -1 ? 0 : index + 1;
}

function lineIndent(value: string, position: number): string {
  const line = value.slice(lineStartIndex(value, position), position);
  const match = line.match(/^[ \t]*/);
  return match ? match[0] : "";
}

/**
 * Depth of unclosed brackets in the code before the cursor, ignoring
 * brackets inside string literals (a simple quote-state scan is enough for
 * editor-sized inputs).
 */
function openBracketDepth(before: string): number {
  let depth = 0;
  let quote: string | null = null;
  for (let i = 0; i < before.length; i += 1) {
    const char = before[i];
    if (quote) {
      if (char === "\\") {
        i += 1;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === "(" || char === "[" || char === "{") depth += 1;
    if (char === ")" || char === "]" || char === "}") depth = Math.max(0, depth - 1);
  }
  return depth;
}

export function applyEditorEdit(
  value: string,
  start: number,
  end: number,
  key: string,
  shiftKey = false,
): EditorEdit | null {
  // Tab indents; Shift+Tab keeps its native meaning (focus release).
  if (key === "Tab" && !shiftKey) {
    return {
      value: value.slice(0, start) + INDENT + value.slice(end),
      start: start + INDENT.length,
      end: start + INDENT.length,
    };
  }

  if (key === "Enter") {
    const indent = lineIndent(value, start);
    const before = value.slice(0, start);
    const restOfLine = value.slice(start, lineEndIndex(value, start));
    const trimmed = before.replace(/[ \t]+$/, "");
    const extra = trimmed.endsWith(":") && restOfLine.trim() === "" ? INDENT : "";
    const bracket = !extra && openBracketDepth(before) > 0 ? INDENT : "";
    const insertion = `\n${indent}${extra || bracket}`;
    return {
      value: value.slice(0, start) + insertion + value.slice(end),
      start: start + insertion.length,
      end: start + insertion.length,
    };
  }

  if (key === "Backspace" && start === end && start > 0) {
    const before = value[start - 1];
    const after = value[start];
    if (after && PAIRS[before] === after) {
      return {
        value: value.slice(0, start - 1) + value.slice(start + 1),
        start: start - 1,
        end: start - 1,
      };
    }
    return null;
  }

  if (start !== end) return null;

  // Typing a closer that already sits under the cursor: step over it.
  if (CLOSERS.has(key) && value[start] === key) {
    return { value, start: start + 1, end: start + 1 };
  }

  const closer = PAIRS[key];
  if (!closer) return null;

  const next = value[start] ?? "";
  const previous = value[start - 1] ?? "";
  // Do not auto-close quotes inside words (don't, it's) or before a closer.
  if ((key === '"' || key === "'") && /[\w"']/.test(next)) return null;
  if ((key === '"' || key === "'") && /[\w]/.test(previous)) return null;
  if (next && /[\w]/.test(next) && key !== "(" && key !== "[" && key !== "{") {
    return null;
  }

  return {
    value: value.slice(0, start) + key + closer + value.slice(end),
    start: start + 1,
    end: start + 1,
  };
}

function lineEndIndex(value: string, position: number): number {
  const index = value.indexOf("\n", position);
  return index === -1 ? value.length : index;
}
