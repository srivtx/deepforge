/**
 * Silent Bug Hunt — pure core for the /alibi duel harness.
 *
 * Zero runtime imports: the module only builds strings and parses strings.
 * `buildDuelHarness` emits a self-contained Python 3 program that parses the
 * learner input with `ast.literal_eval`, execs the reference and the ghost in
 * isolated namespaces, runs both under a `sys.settrace` line budget, compares
 * the full return values with the same 1e-6 deep equality as
 * `scripts/py_verify.py` and the Pyodide test harness, and prints exactly one
 * `ALIBI_MARK` + JSON line. The caller runs it through `runCode` and feeds the
 * captured stdout to `parseDuelStdout`.
 *
 * No clocks, no randomness, no DOM, no store. The only runtime input is the
 * learner's literal, and the harness is a pure function of it.
 */

export const ALIBI_HARNESS_VERSION = 1;
export const ALIBI_INPUT_MAX_CHARS = 2000;
export const ALIBI_LINE_BUDGET = 400_000;
export const ALIBI_MARK = "__DF_DUEL__";

const ALIBI_INPUT_EMPTY_REASON = "Enter a Python literal to run.";
const ALIBI_INPUT_LONG_REASON = `Input must be ${ALIBI_INPUT_MAX_CHARS} characters or fewer.`;

export type AlibiDuelVerdict =
  | "diverges_value"
  | "diverges_error"
  | "diverges_timeout"
  | "same"
  | "input_invalid"
  | "ref_error"
  | "harness_error";

export interface AlibiDuelOutcome {
  readonly verdict: AlibiDuelVerdict;
  readonly ref: string | null;
  readonly ghost: string | null;
}

const ALIBI_VERDICTS: readonly AlibiDuelVerdict[] = [
  "diverges_value",
  "diverges_error",
  "diverges_timeout",
  "same",
  "input_invalid",
  "ref_error",
  "harness_error",
];

const HARNESS_ERROR_OUTCOME: AlibiDuelOutcome = {
  verdict: "harness_error",
  ref: null,
  ghost: null,
};

function isAlibiVerdict(value: unknown): value is AlibiDuelVerdict {
  return (
    typeof value === "string" &&
    (ALIBI_VERDICTS as readonly string[]).includes(value)
  );
}

function isOptionalString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

export function buildDuelHarness(args: {
  reference: string;
  ghost: string;
  func: string;
  inputText: string;
  budget?: number;
}): string {
  const { reference, ghost, func, inputText, budget } = args;
  for (const [name, value] of [
    ["reference", reference],
    ["ghost", ghost],
    ["func", func],
    ["inputText", inputText],
  ] as const) {
    if (typeof value !== "string") {
      throw new TypeError(`buildDuelHarness: ${name} must be a string`);
    }
  }
  let lineBudget = ALIBI_LINE_BUDGET;
  if (budget !== undefined) {
    if (!Number.isInteger(budget) || budget <= 0) {
      throw new RangeError(
        "buildDuelHarness: budget must be a positive integer",
      );
    }
    lineBudget = budget;
  }

  return `
# Silent Bug Hunt duel harness (alibiHunt v${ALIBI_HARNESS_VERSION})
# Deterministic: no clocks, no randomness, no network.
import ast, contextlib, io, json, math, sys

_ALIBI_MARK = ${JSON.stringify(ALIBI_MARK)}
_ALIBI_BUDGET = ${lineBudget}
_ALIBI_REF_FILE = "<alibi-reference>"
_ALIBI_GHOST_FILE = "<alibi-ghost>"
_ALIBI_REF = ${JSON.stringify(reference)}
_ALIBI_GHOST = ${JSON.stringify(ghost)}
_ALIBI_FUNC = ${JSON.stringify(func)}
_ALIBI_INPUT = ${JSON.stringify(inputText)}


class _AlibiBudget(BaseException):
    pass


def _alibi_deep_eq(a, b, tol=1e-6):
    if isinstance(a, bool) or isinstance(b, bool):
        return a == b
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        try:
            return math.isclose(float(a), float(b), rel_tol=tol, abs_tol=tol)
        except (ValueError, OverflowError):
            # Values too large for float() (~1900-digit ints) compare exactly
            # in Python; re-raising here surfaced as a harness_error instead
            # of a verdict.
            return a == b
    if isinstance(a, (list, tuple)) and isinstance(b, (list, tuple)):
        return len(a) == len(b) and all(_alibi_deep_eq(x, y, tol) for x, y in zip(a, b))
    if isinstance(a, dict) and isinstance(b, dict):
        return a.keys() == b.keys() and all(_alibi_deep_eq(a[k], b[k], tol) for k in a)
    if a is None or b is None:
        return a is b
    return a == b


def _alibi_truncate(text):
    return text[:400]


def _alibi_repr(value):
    try:
        return _alibi_truncate(repr(value))
    except Exception:
        return "<unrepresentable>"


def _alibi_error_text(exc):
    try:
        return _alibi_truncate(type(exc).__name__ + ": " + str(exc))
    except Exception:
        return "<error>"


def _alibi_load(source, filename, entry):
    namespace = {}
    try:
        exec(compile(source, filename, "exec"), namespace)
    except Exception as exc:
        return None, _alibi_error_text(exc)
    fn = namespace.get(entry)
    if not callable(fn):
        return None, "missing entry point: " + str(entry)
    return fn, None


def _alibi_tracer(counter, filename):
    def trace(frame, event, arg):
        if event == "line" and frame.f_code.co_filename == filename:
            counter[0] += 1
            if counter[0] > _ALIBI_BUDGET:
                raise _AlibiBudget()
        return trace
    return trace


def _alibi_call(fn, filename, args, counter):
    buffer = io.StringIO()
    counter[0] = 0
    sys.settrace(_alibi_tracer(counter, filename))
    try:
        with contextlib.redirect_stdout(buffer):
            value = fn(*args)
            text = _alibi_repr(value)
        return {"kind": "ok", "value": value, "repr": text}
    except _AlibiBudget:
        return {"kind": "budget"}
    except BaseException as exc:
        return {"kind": "error", "text": _alibi_error_text(exc)}
    finally:
        sys.settrace(None)


def _alibi_emit(verdict, ref, ghost):
    print(_ALIBI_MARK + json.dumps({"verdict": verdict, "ref": ref, "ghost": ghost}, ensure_ascii=True))


def _alibi_main():
    try:
        args = ast.literal_eval(_ALIBI_INPUT)
    except Exception:
        _alibi_emit("input_invalid", None, None)
        return
    if isinstance(args, (list, tuple)):
        call_args = list(args)
    else:
        call_args = [args]
    counter = [0]
    ref_fn, ref_err = _alibi_load(_ALIBI_REF, _ALIBI_REF_FILE, _ALIBI_FUNC)
    if ref_fn is None:
        _alibi_emit("ref_error", ref_err, None)
        return
    ref = _alibi_call(ref_fn, _ALIBI_REF_FILE, call_args, counter)
    if ref["kind"] == "budget":
        _alibi_emit("ref_error", "line budget exceeded", None)
        return
    if ref["kind"] == "error":
        _alibi_emit("ref_error", ref["text"], None)
        return
    ghost_fn, ghost_err = _alibi_load(_ALIBI_GHOST, _ALIBI_GHOST_FILE, _ALIBI_FUNC)
    if ghost_fn is None:
        _alibi_emit("diverges_error", ref["repr"], ghost_err)
        return
    ghost = _alibi_call(ghost_fn, _ALIBI_GHOST_FILE, call_args, counter)
    if ghost["kind"] == "budget":
        _alibi_emit("diverges_timeout", ref["repr"], "line budget exceeded")
        return
    if ghost["kind"] == "error":
        _alibi_emit("diverges_error", ref["repr"], ghost["text"])
        return
    verdict = "same" if _alibi_deep_eq(ref["value"], ghost["value"]) else "diverges_value"
    _alibi_emit(verdict, ref["repr"], ghost["repr"])


try:
    _alibi_main()
except BaseException:
    _alibi_emit("harness_error", None, None)
`;
}

export function parseDuelStdout(stdout: string): AlibiDuelOutcome {
  if (typeof stdout !== "string" || stdout.length === 0) {
    return HARNESS_ERROR_OUTCOME;
  }
  const lines = stdout.split(/\r?\n/);
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const line = lines[i].trim();
    if (!line.startsWith(ALIBI_MARK)) continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(line.slice(ALIBI_MARK.length).trim());
    } catch {
      return HARNESS_ERROR_OUTCOME;
    }
    if (parsed === null || typeof parsed !== "object") {
      return HARNESS_ERROR_OUTCOME;
    }
    const record = parsed as Record<string, unknown>;
    if (!isAlibiVerdict(record.verdict)) return HARNESS_ERROR_OUTCOME;
    if (!isOptionalString(record.ref) || !isOptionalString(record.ghost)) {
      return HARNESS_ERROR_OUTCOME;
    }
    return {
      verdict: record.verdict,
      ref: record.ref,
      ghost: record.ghost,
    };
  }
  return HARNESS_ERROR_OUTCOME;
}

export function validateAlibiInput(
  text: string,
):
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: string } {
  if (typeof text !== "string" || text.trim().length === 0) {
    return { ok: false, reason: ALIBI_INPUT_EMPTY_REASON };
  }
  if (text.length > ALIBI_INPUT_MAX_CHARS) {
    return { ok: false, reason: ALIBI_INPUT_LONG_REASON };
  }
  return { ok: true };
}

function quotePythonString(value: string): string {
  let out = '"';
  for (const ch of value) {
    const code = ch.codePointAt(0) ?? 0;
    if (ch === "\\") out += "\\\\";
    else if (ch === '"') out += '\\"';
    else if (ch === "\n") out += "\\n";
    else if (ch === "\r") out += "\\r";
    else if (ch === "\t") out += "\\t";
    else if (code < 0x20 || code === 0x7f) {
      out += "\\u" + code.toString(16).padStart(4, "0");
    } else out += ch;
  }
  return out + '"';
}

export function pythonLiteral(value: unknown): string {
  if (value === null) return "None";
  if (value === true) return "True";
  if (value === false) return "False";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new TypeError("pythonLiteral: only finite numbers are supported");
    }
    if (Object.is(value, -0)) return "-0.0";
    return String(value);
  }
  if (typeof value === "string") return quotePythonString(value);
  if (Array.isArray(value)) {
    return `[${value.map((entry) => pythonLiteral(entry)).join(", ")}]`;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    const body = entries
      .map(([key, entry]) => `${quotePythonString(key)}: ${pythonLiteral(entry)}`)
      .join(", ");
    return `{${body}}`;
  }
  throw new TypeError(`pythonLiteral: unsupported value of type ${typeof value}`);
}

export function diffProgramLines(
  reference: string,
  ghost: string,
): { readonly removed: readonly string[]; readonly added: readonly string[] } {
  const refLines = reference.split("\n");
  const ghostLines = ghost.split("\n");
  const shared = Math.min(refLines.length, ghostLines.length);
  let prefix = 0;
  while (prefix < shared && refLines[prefix] === ghostLines[prefix]) {
    prefix += 1;
  }
  let suffix = 0;
  while (
    suffix < shared - prefix &&
    refLines[refLines.length - 1 - suffix] ===
      ghostLines[ghostLines.length - 1 - suffix]
  ) {
    suffix += 1;
  }
  return {
    removed: refLines.slice(prefix, refLines.length - suffix),
    added: ghostLines.slice(prefix, ghostLines.length - suffix),
  };
}

export function describeOutcome(
  outcome: AlibiDuelOutcome,
  func: string,
): string {
  switch (outcome.verdict) {
    case "diverges_value":
      return `The ghost version of ${func} returns a different value from the reference here.`;
    case "diverges_error":
      return `The ghost version of ${func} raises an error where the reference returns.`;
    case "diverges_timeout":
      return `The ghost version of ${func} exceeds the line budget where the reference returns.`;
    case "same":
      return "The reference and the ghost agree on this input.";
    case "input_invalid":
      return "That input is not a Python literal, so nothing ran.";
    case "ref_error":
      return "The reference did not return on this input.";
    case "harness_error":
      return "No verdict was produced. Try running the duel again.";
    default:
      return "No verdict was produced. Try running the duel again.";
  }
}
