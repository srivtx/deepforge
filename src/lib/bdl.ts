/**
 * Behavioral Delta Ledger — pure engine for the /ledger workspace.
 *
 * Zero runtime imports: the module only builds strings, hashes strings, and
 * parses strings. `buildBdlHarness` emits a self-contained Python 3 program
 * that embeds the reference and the submission as literals, executes both
 * against a deterministic probe basis under a `sys.settrace` line budget plus
 * a global wall deadline, compares values with the same 1e-6 deep equality as
 * `scripts/py_verify.py`, and prints exactly one `BDL_MARK` + JSON line. The
 * caller runs it through `runCode` and feeds the captured stdout to
 * `parseBdlStdout`.
 *
 * Wall-budget enforcement. The wall deadline is checked on every traced
 * Python call/line event, at every call boundary, and inside a rebinding of
 * `time.sleep` installed in the Python process the harness runs in: a sleep
 * that fits the remaining budget still sleeps normally, a sleep that would
 * pass the deadline sleeps only up to it and then raises `_BdlBudget`,
 * which is a `BaseException` so `except Exception` cannot swallow it. Line
 * tracing catches Python-level loops (including single-line loops) on every
 * iteration. Residual limitation (recorded here, not claimed away): a C-level
 * call that blocks without producing Python bytecode events and without
 * going through `time.sleep` (e.g. `select.select`, blocking I/O, a
 * huge-int `pow`) can still overrun the 2 s deadline; the worker is
 * recovered by reload. The product runs trusted-bank reference code plus
 * learner-local submissions only, and a learner who defeats their own local
 * budget can only affect their own browser session.
 *
 * Marker trust model. The harness prints one marker line; `parseBdlStdout`
 * accepts it only when stdout contains exactly one marker line with exactly
 * the expected `{v, sig, mask}` shape, and returns `null` (a harness error,
 * "the run did not finish — try again") when markers are absent, malformed,
 * or duplicated. Duplicates are rejected rather than resolved because an
 * `atexit` handler or a non-daemon thread inside the submission can print a
 * second marker after the real one. The only writer controls their own local
 * stdout; stdout is captured device-locally, forgery cannot affect other
 * learners, and nothing here feeds any assessment, review, certificate, or
 * sync surface.
 *
 * Counts only: the engine reports how many hidden probe dimensions changed
 * and whether the stored signature is identical. It never assigns a sign to a
 * change, never labels perturbation classes on a learner surface, and never
 * judges a program. No clocks, no randomness, no DOM, no storage. The only
 * runtime input is `(tests, probes, sources)`, and every export is a pure
 * function of its arguments.
 */

export const BDL_HARNESS_VERSION = 1;
export const BDL_MARK = "__DF_BDL__";
/** 24 is both the product cap and the research "runtime" cap (first 24 of the same shuffle). */
export const BDL_RUNTIME_BASIS_CAP = 24;
/** Trace-line budget per Python call; learner code cannot swallow it (BaseException). */
export const BDL_LINE_BUDGET = 60_000;
/** Hard wall budget for the entire hidden run, enforced inside Python via time.monotonic. */
export const BDL_WALL_BUDGET_MS = 2_000;

/** Longest accepted signature: the research build-time basis cap (48 probes). */
const BDL_MAX_SIG_CHARS = 48;
/** Longest accepted test mask; the shipped exercises carry at most a handful of cases. */
const BDL_MAX_MASK_CHARS = 64;

export interface BdlTestCase {
  readonly input: readonly unknown[];
  readonly expected: unknown;
}

export interface BdlBasisProbe {
  readonly args: readonly unknown[];
}

export interface BdlRunResult {
  /** One char per probe: "0" agree, "1" differs, "2" raise/timeout, "x" reference has no answer. */
  readonly sig: string;
  /** One char per shipped test: "0" fail, "1" pass. */
  readonly mask: string;
  readonly passed: number; // count of "1" in mask
  readonly total: number; // mask.length
}

export interface BdlDelta {
  readonly changed: number; // positions (over the comparable prefix) where sig chars differ
  readonly comparable: number; // positions where both chars are in {0,1,2}
  readonly sigEqual: boolean; // same length and every char equal
  readonly maskEqual: boolean; // masks byte-identical
}

export type BdlVerdict = "ghost" | "changed" | "rerun";

/* ──────────────────────────────── hashing ───────────────────────────────── */

function fnvMix(hash: number, byte: number): number {
  return Math.imul((hash ^ (byte & 0xff)) >>> 0, 16777619) >>> 0;
}

/** Deterministic 32-bit FNV-1a hash (unsigned) over the UTF-8 bytes of `input`. */
export function fnv1a32(input: string): number {
  if (typeof input !== "string") {
    throw new TypeError("fnv1a32: input must be a string");
  }
  let hash = 2166136261 >>> 0;
  for (let index = 0; index < input.length; index += 1) {
    let code = input.charCodeAt(index);
    if (
      code >= 0xd800 &&
      code <= 0xdbff &&
      index + 1 < input.length
    ) {
      const next = input.charCodeAt(index + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        code = 0x10000 + ((code - 0xd800) << 10) + (next - 0xdc00);
        index += 1;
      }
    }
    if (code < 0x80) {
      hash = fnvMix(hash, code);
    } else if (code < 0x800) {
      hash = fnvMix(hash, 0xc0 | (code >> 6));
      hash = fnvMix(hash, 0x80 | (code & 0x3f));
    } else if (code < 0x10000) {
      hash = fnvMix(hash, 0xe0 | (code >> 12));
      hash = fnvMix(hash, 0x80 | ((code >> 6) & 0x3f));
      hash = fnvMix(hash, 0x80 | (code & 0x3f));
    } else {
      hash = fnvMix(hash, 0xf0 | (code >> 18));
      hash = fnvMix(hash, 0x80 | ((code >> 12) & 0x3f));
      hash = fnvMix(hash, 0x80 | ((code >> 6) & 0x3f));
      hash = fnvMix(hash, 0x80 | (code & 0x3f));
    }
  }
  return hash >>> 0;
}

/** 8 lowercase hex chars over the exact text; the text-change detector. */
export function hashBdlText(code: string): string {
  return (fnv1a32(code) >>> 0).toString(16).padStart(8, "0");
}

/** Stable fingerprint of (problemId, cap, tests); any change invalidates stored signatures. */
export function basisFingerprint(
  problemId: string,
  tests: readonly BdlTestCase[],
  cap: number = BDL_RUNTIME_BASIS_CAP,
): string {
  const canonical = `bdl1\u0000${problemId}\u0000${String(cap)}\u0000${stableKey(tests)}`;
  return hashBdlText(canonical);
}

/* ──────────────────────────── canonical values ──────────────────────────── */

/** Canonical JSON with sorted object keys — the dedupe / exclusion key. */
function stableKey(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") {
    return Number.isFinite(value) ? JSON.stringify(value) : `#${String(value)}`;
  }
  if (typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableKey(item)).join(",")}]`;
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record).sort();
    return `{${keys
      .map((key) => `${JSON.stringify(key)}:${stableKey(record[key])}`)
      .join(",")}}`;
  }
  return `#${typeof value}`;
}

function deepClone<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => deepClone(item)) as unknown as T;
  }
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    const record = value as Record<string, unknown>;
    for (const key of Object.keys(record)) out[key] = deepClone(record[key]);
    return out as T;
  }
  return value;
}

/* ───────────────────────────── deterministic rng ────────────────────────── */

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const out = [...items];
  for (let index = out.length - 1; index > 0; index -= 1) {
    const pick = Math.floor(rng() * (index + 1));
    const swap = out[index];
    out[index] = out[pick];
    out[pick] = swap;
  }
  return out;
}

/* ────────────────────────────── probe basis ─────────────────────────────── */

function reverseText(value: string): string {
  return [...value].reverse().join("");
}

function sortedCopy(values: readonly unknown[]): readonly unknown[] | null {
  const allNumbers = values.every(
    (item) => typeof item === "number" && Number.isFinite(item),
  );
  const allStrings = values.every((item) => typeof item === "string");
  if (!allNumbers && !allStrings) return null;
  return [...values].sort((a, b) => {
    if (typeof a === "number" && typeof b === "number") return a - b;
    return String(a).localeCompare(String(b));
  });
}

/** Deterministic single-value perturbations, in a stable order. */
function perturbValue(value: unknown): readonly unknown[] {
  const out: unknown[] = [];
  if (typeof value === "number" && Number.isFinite(value)) {
    out.push(0, 1, -value, value + 1, value - 1, value * 2);
    if (value !== 0) out.push(value / 2);
    return out;
  }
  if (typeof value === "string") {
    out.push("", reverseText(value), value + value);
    return out;
  }
  if (typeof value === "boolean") {
    out.push(!value, 0, 1);
    return out;
  }
  if (value === null) {
    out.push(0, "", [], {});
    return out;
  }
  if (Array.isArray(value)) {
    out.push([]);
    out.push([...value].reverse());
    const sorted = sortedCopy(value);
    if (sorted !== null) out.push(sorted);
    if (value.length > 0) out.push([...value, value[0]]);
    if (value.length > 1) out.push(value.slice(1));
    if (
      value.length > 0 &&
      value.every(
        (item) => typeof item === "number" && Number.isFinite(item),
      )
    ) {
      out.push(value.map((item) => (item as number) + 1));
      out.push(value.map((item) => (item as number) * 2));
    }
    return out;
  }
  if (typeof value === "object") {
    out.push({});
    const keys = Object.keys(value as Record<string, unknown>);
    if (keys.length > 0) {
      const copy: Record<string, unknown> = {
        ...(value as Record<string, unknown>),
      };
      delete copy[keys[0]];
      out.push(copy);
    }
    return out;
  }
  return out;
}

function capLimit(cap: number | undefined): number {
  if (cap === undefined || !Number.isFinite(cap)) {
    return BDL_RUNTIME_BASIS_CAP;
  }
  return Math.max(0, Math.floor(cap));
}

/**
 * Probe basis: for each of the first three shipped inputs, perturb exactly one
 * argument with the frozen perturbation set; exclude exact shipped inputs and
 * duplicates; shuffle with mulberry32 seeded by fnv1a32(problemId); keep the
 * first `cap` (default 24). Pure, deterministic across machines/sessions.
 * The research corpus used md5-seeded shuffles; the product uses FNV and
 * therefore does not claim bit-identical bases.
 */
export function buildBdlBasis(
  testInputs: readonly (readonly unknown[])[],
  problemId: string,
  cap?: number,
): readonly BdlBasisProbe[] {
  if (typeof problemId !== "string") {
    throw new TypeError("buildBdlBasis: problemId must be a string");
  }
  if (!Array.isArray(testInputs)) {
    throw new TypeError("buildBdlBasis: testInputs must be an array");
  }
  const limit = capLimit(cap);
  if (limit === 0) return [];

  const shipped = new Set<string>();
  for (const input of testInputs) shipped.add(stableKey(input));

  const seen = new Set<string>();
  const candidates: BdlBasisProbe[] = [];
  for (const input of testInputs.slice(0, 3)) {
    const args: readonly unknown[] = Array.isArray(input) ? input : [input];
    for (let index = 0; index < args.length; index += 1) {
      for (const perturbed of perturbValue(args[index])) {
        const candidate = args.map((arg, position) =>
          position === index ? perturbed : arg,
        );
        const key = stableKey(candidate);
        if (shipped.has(key) || seen.has(key)) continue;
        seen.add(key);
        candidates.push({ args: deepClone(candidate) });
      }
    }
  }
  return shuffle(candidates, mulberry32(fnv1a32(problemId))).slice(0, limit);
}

/* ────────────────────────────── python harness ──────────────────────────── */

/**
 * Embedded Python program; identical arguments produce byte-identical output.
 * The program embeds both sources as data literals, executes them in isolated
 * namespaces, runs the shipped tests and the probe basis under a per-call line
 * budget plus one global wall deadline, redirects stdout during every call,
 * and prints exactly one marker line.
 */
export function buildBdlHarness(args: {
  readonly reference: string;
  readonly submission: string;
  /** Entry function name; the reference's first `def`, supplied by the server page. */
  readonly func: string;
  readonly tests: readonly BdlTestCase[];
  readonly probes: readonly BdlBasisProbe[];
  readonly lineBudget?: number; // default BDL_LINE_BUDGET
  readonly wallBudgetMs?: number; // default BDL_WALL_BUDGET_MS
}): string {
  const { reference, submission, func, tests, probes } = args;
  for (const [name, value] of [
    ["reference", reference],
    ["submission", submission],
    ["func", func],
  ] as const) {
    if (typeof value !== "string") {
      throw new TypeError(`buildBdlHarness: ${name} must be a string`);
    }
  }
  if (!Array.isArray(tests)) {
    throw new TypeError("buildBdlHarness: tests must be an array");
  }
  if (!Array.isArray(probes)) {
    throw new TypeError("buildBdlHarness: probes must be an array");
  }
  let lineBudget = BDL_LINE_BUDGET;
  if (args.lineBudget !== undefined) {
    if (!Number.isInteger(args.lineBudget) || args.lineBudget <= 0) {
      throw new RangeError(
        "buildBdlHarness: lineBudget must be a positive integer",
      );
    }
    lineBudget = args.lineBudget;
  }
  let wallBudgetMs = BDL_WALL_BUDGET_MS;
  if (args.wallBudgetMs !== undefined) {
    if (!Number.isInteger(args.wallBudgetMs) || args.wallBudgetMs <= 0) {
      throw new RangeError(
        "buildBdlHarness: wallBudgetMs must be a positive integer",
      );
    }
    wallBudgetMs = args.wallBudgetMs;
  }

  const testsJson = JSON.stringify(tests);
  const probesJson = JSON.stringify(probes);
  if (typeof testsJson !== "string" || typeof probesJson !== "string") {
    throw new TypeError("buildBdlHarness: tests and probes must be JSON data");
  }

  return `
# Behavioral Delta Ledger harness (bdl v${BDL_HARNESS_VERSION})
# Deterministic: no randomness, no network. One marker line is emitted.
import contextlib
import copy
import io
import json
import math
import sys
import time

_BDL_MARK = ${JSON.stringify(BDL_MARK)}
_BDL_VERSION = ${BDL_HARNESS_VERSION}
_BDL_LINE_BUDGET = ${lineBudget}
_BDL_WALL_MS = ${wallBudgetMs}
_BDL_REF_FILE = "<bdl-reference>"
_BDL_SUB_FILE = "<bdl-submission>"
_BDL_REF = ${JSON.stringify(reference)}
_BDL_SUB = ${JSON.stringify(submission)}
_BDL_FUNC = ${JSON.stringify(func)}
_BDL_TESTS = json.loads(${JSON.stringify(testsJson)})
_BDL_PROBES = json.loads(${JSON.stringify(probesJson)})

_BDL_DEADLINE = None


class _BdlBudget(BaseException):
    pass


# Wall-budget enforcement for blocking Python paths: sleeps that fit the
# remaining budget sleep normally; sleeps that would pass the deadline sleep
# only up to it and then raise the unswallowable budget exception. The real
# sleep is remembered on the time module so a second run in the same
# interpreter (the product keeps one Pyodide instance) does not mistake the
# first run's patched sleep for the real one. Learner code that blocks below
# Python (a C call that emits no bytecode events) can still overrun; see the
# engine docblock for the recorded residual.
_BDL_REAL_SLEEP = getattr(time, "_bdl_real_sleep", None)
if _BDL_REAL_SLEEP is None:
    _BDL_REAL_SLEEP = getattr(time, "sleep", None)
    if _BDL_REAL_SLEEP is not None:
        try:
            time._bdl_real_sleep = _BDL_REAL_SLEEP
        except Exception:
            pass
if _BDL_REAL_SLEEP is None:
    def _BDL_REAL_SLEEP(seconds):
        return None


def _bdl_sleep(seconds=0.0):
    try:
        seconds = float(seconds)
    except (TypeError, ValueError):
        seconds = 0.0
    if seconds != seconds:
        seconds = 0.0
    deadline = _BDL_DEADLINE
    if deadline is None:
        _BDL_REAL_SLEEP(seconds)
        return None
    remaining = deadline - time.monotonic()
    if remaining <= 0:
        raise _BdlBudget()
    if seconds <= 0:
        _BDL_REAL_SLEEP(0.0)
        return None
    if seconds > remaining:
        _BDL_REAL_SLEEP(remaining)
        raise _BdlBudget()
    _BDL_REAL_SLEEP(seconds)
    return None


time.sleep = _bdl_sleep


def _bdl_deep_eq(a, b, tol=1e-6):
    if isinstance(a, bool) or isinstance(b, bool):
        return a == b
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        try:
            return math.isclose(float(a), float(b), rel_tol=tol, abs_tol=tol)
        except (ValueError, OverflowError):
            # Values too large for float() compare exactly in Python; the
            # guard keeps a huge-int answer from becoming a harness error.
            return a == b
    if isinstance(a, (list, tuple)) and isinstance(b, (list, tuple)):
        return len(a) == len(b) and all(_bdl_deep_eq(x, y, tol) for x, y in zip(a, b))
    if isinstance(a, dict) and isinstance(b, dict):
        return a.keys() == b.keys() and all(_bdl_deep_eq(a[k], b[k], tol) for k in a)
    if a is None or b is None:
        return a is b
    return a == b


def _bdl_tracer(counter, filename):
    def trace(frame, event, arg):
        if event == "call":
            deadline = _BDL_DEADLINE
            if deadline is not None and time.monotonic() > deadline:
                raise _BdlBudget()
            return trace
        if event != "line":
            return trace
        deadline = _BDL_DEADLINE
        if deadline is not None and time.monotonic() > deadline:
            raise _BdlBudget()
        if frame.f_code.co_filename == filename:
            counter[0] += 1
            if counter[0] > _BDL_LINE_BUDGET:
                raise _BdlBudget()
        return trace
    return trace


def _bdl_load(source, filename, entry, counter):
    namespace = {}
    sys.settrace(_bdl_tracer(counter, filename))
    try:
        with contextlib.redirect_stdout(io.StringIO()):
            exec(compile(source, filename, "exec"), namespace)
    except BaseException:
        return None
    finally:
        sys.settrace(None)
    fn = namespace.get(entry)
    return fn if callable(fn) else None


def _bdl_call(fn, filename, args, counter):
    counter[0] = 0
    deadline = _BDL_DEADLINE
    if fn is None or (deadline is not None and time.monotonic() > deadline):
        return {"kind": "budget"}
    sys.settrace(_bdl_tracer(counter, filename))
    try:
        with contextlib.redirect_stdout(io.StringIO()):
            value = fn(*copy.deepcopy(list(args)))
        if counter[0] > _BDL_LINE_BUDGET:
            return {"kind": "budget"}
        deadline = _BDL_DEADLINE
        if deadline is not None and time.monotonic() > deadline:
            return {"kind": "budget"}
        return {"kind": "ok", "value": value}
    except _BdlBudget:
        return {"kind": "budget"}
    except BaseException:
        return {"kind": "error"}
    finally:
        sys.settrace(None)


def _bdl_emit(sig, mask):
    print(_BDL_MARK + json.dumps({"v": _BDL_VERSION, "sig": sig, "mask": mask}, ensure_ascii=True))


def _bdl_main():
    counter = [0]
    ref_fn = _bdl_load(_BDL_REF, _BDL_REF_FILE, _BDL_FUNC, counter)
    sub_fn = _bdl_load(_BDL_SUB, _BDL_SUB_FILE, _BDL_FUNC, counter)

    mask_chars = []
    for case in _BDL_TESTS:
        args = case.get("input") if isinstance(case, dict) else None
        expected = case.get("expected") if isinstance(case, dict) else None
        if not isinstance(args, (list, tuple)):
            mask_chars.append("0")
            continue
        outcome = _bdl_call(sub_fn, _BDL_SUB_FILE, args, counter)
        if outcome["kind"] == "ok" and _bdl_deep_eq(outcome["value"], expected):
            mask_chars.append("1")
        else:
            mask_chars.append("0")

    sig_chars = []
    for probe in _BDL_PROBES:
        args = probe.get("args") if isinstance(probe, dict) else None
        if not isinstance(args, (list, tuple)):
            sig_chars.append("x")
            continue
        ref = _bdl_call(ref_fn, _BDL_REF_FILE, args, counter)
        if ref["kind"] != "ok":
            sig_chars.append("x")
            continue
        sub = _bdl_call(sub_fn, _BDL_SUB_FILE, args, counter)
        if sub["kind"] != "ok":
            sig_chars.append("2")
            continue
        sig_chars.append("0" if _bdl_deep_eq(sub["value"], ref["value"]) else "1")

    _bdl_emit("".join(sig_chars), "".join(mask_chars))


try:
    _BDL_DEADLINE = time.monotonic() + (_BDL_WALL_MS / 1000.0)
    _bdl_main()
except BaseException:
    try:
        _bdl_emit("x" * len(_BDL_PROBES), "0" * len(_BDL_TESTS))
    except BaseException:
        pass
finally:
    # The interpreter is shared across runs (and with other features); leave
    # time.sleep exactly as it was found once this program is done.
    time.sleep = _BDL_REAL_SLEEP
`;
}

/* ──────────────────────────────── parsing ───────────────────────────────── */

/**
 * Parse the harness marker from captured stdout.
 *
 * Exactly one line may start with `BDL_MARK`; zero, two, or more marker
 * candidates ⇒ `null` (harness error). Duplicates are rejected rather than
 * resolved (no "first/last marker wins") because `atexit` handlers and
 * non-daemon threads inside a submission can print a second marker after the
 * real one. The single marker must parse as a JSON object with exactly the
 * keys `v`, `sig`, `mask`, `v === BDL_HARNESS_VERSION`, sig characters from
 * `{0,1,2,x}` within the bounded signature length, and mask characters from
 * `{0,1}` within the bounded mask length. Anything else ⇒ `null`. Never
 * throws.
 */
export function parseBdlStdout(stdout: string): BdlRunResult | null {
  if (typeof stdout !== "string" || stdout.length === 0) return null;
  const lines = stdout.split(/\r?\n/);
  let marker: string | null = null;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith(BDL_MARK)) continue;
    if (marker !== null) return null;
    marker = trimmed;
  }
  if (marker === null) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(marker.slice(BDL_MARK.length).trim());
  } catch {
    return null;
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return null;
  }
  const record = parsed as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  if (
    keys.length !== 3 ||
    keys[0] !== "mask" ||
    keys[1] !== "sig" ||
    keys[2] !== "v"
  ) {
    return null;
  }
  if (record.v !== BDL_HARNESS_VERSION) return null;
  const sig = record.sig;
  const mask = record.mask;
  if (typeof sig !== "string" || typeof mask !== "string") return null;
  if (sig.length > BDL_MAX_SIG_CHARS || mask.length > BDL_MAX_MASK_CHARS) {
    return null;
  }
  if (!/^[012x]*$/.test(sig) || !/^[01]*$/.test(mask)) return null;
  let passed = 0;
  for (const char of mask) if (char === "1") passed += 1;
  return { sig, mask, passed, total: mask.length };
}

/* ──────────────────────────── delta and verdict ─────────────────────────── */

function isComparable(char: string | undefined): boolean {
  return char === "0" || char === "1" || char === "2";
}

export function bdlDelta(previous: BdlRunResult, next: BdlRunResult): BdlDelta {
  const prefix = Math.min(previous.sig.length, next.sig.length);
  let changed = 0;
  let comparable = 0;
  for (let index = 0; index < prefix; index += 1) {
    const before = previous.sig[index];
    const after = next.sig[index];
    if (!isComparable(before) || !isComparable(after)) continue;
    comparable += 1;
    if (before !== after) changed += 1;
  }
  return {
    changed,
    comparable,
    sigEqual: previous.sig === next.sig,
    maskEqual: previous.mask === next.mask,
  };
}

/**
 * "rerun"  — text hash unchanged (same code re-run);
 * "ghost"  — text changed, sigEqual, maskEqual  → "no change on N hidden checks";
 * "changed"— otherwise, show the count.
 */
export function bdlVerdict(delta: BdlDelta, textChanged: boolean): BdlVerdict {
  if (!textChanged) return "rerun";
  if (delta.sigEqual && delta.maskEqual) return "ghost";
  return "changed";
}

/**
 * UI copy; no clocks, no randomness. n = next.sig.length.
 *
 * The verdict stays `"changed"` when only the visible test mask moved
 * (`delta.changed === 0`, signature identical over every comparable probe),
 * but that case renders the no-change-on-hidden-checks sentence instead of
 * "changed 0 of N", which reads like a failed counter. The verdict itself
 * is never rewritten here; callers that branch on it still see `"changed"`.
 */
export function describeBdlVerdict(
  verdict: BdlVerdict,
  delta: BdlDelta,
  n: number,
): string {
  if (verdict === "changed" && delta.changed === 0) {
    return `No change on ${n} hidden checks. This edit changed text, not the behavior the checks measure.`;
  }
  switch (verdict) {
    case "ghost":
      return `No change on ${n} hidden checks. This edit changed text, not the behavior the checks measure.`;
    case "changed":
      return `This edit changed ${delta.changed} of ${n} hidden checks.`;
    case "rerun":
      return "Same code as the last run, so there is nothing to compare.";
    default:
      return "Same code as the last run, so there is nothing to compare.";
  }
}
