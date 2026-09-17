/**
 * Lab scoring for DeepForge.
 *
 * Runs the user's `predict(train_X, train_y, test_X)` in Pyodide against a
 * held-out test set, computes the metric in Python, and parses a single JSON
 * line back out. Best scores persist to localStorage under `deepforge:labs`.
 * Every entry point fails soft: errors come back as strings, never throws.
 */

import { LABS, type Lab } from "@/data/labs";
import { loadPyodideOnce, runCode } from "@/lib/pyodide";
import { createStore } from "@/lib/sync/store";
import type { StoreSpec } from "@/lib/sync/types";

const STORAGE_KEY = "deepforge:labs";

export const LAB_CHANGE_EVENT = "deepforge:lab-change";

/** Passing runs kept per lab — a short append-only re-run history. */
export const LAB_HISTORY_CAP = 10;

export interface LabRecord {
  /** Best score ever recorded, according to the lab's direction. */
  best: number | null;
  /** Number of scored runs. */
  attempts: number;
  /** Has any run met the target? */
  passed: boolean;
  /** ISO timestamp of the most recent scored run, when known. */
  lastScoredAt?: string;
  /** Metric value of the most recent scored run, when known. */
  lastScore?: number | null;
  /** ISO timestamps of passing runs, oldest first, capped at `LAB_HISTORY_CAP`. */
  recentPasses?: string[];
}

export type LabRecords = Record<string, LabRecord>;

export interface LabRunResult {
  /** Metric value on the held-out set, or null if the run failed. */
  score: number | null;
  /** Python or harness error message, or null on success. */
  error: string | null;
  /** Anything the user's code printed before the harness line. */
  stdout: string;
}

interface HarnessPayload {
  score: number | null;
  n: number;
  error?: string;
}

function buildHarness(lab: Lab, userCode: string): string {
  const trainX = JSON.stringify(lab.trainData.features);
  const trainY = JSON.stringify(lab.trainData.labels);
  const testX = JSON.stringify(lab.testData.features);
  const testY = JSON.stringify(lab.testData.labels);
  return `import json, math

TRAIN_X = json.loads(r"""${trainX}""")
TRAIN_Y = json.loads(r"""${trainY}""")
TEST_X = json.loads(r"""${testX}""")
TEST_Y = json.loads(r"""${testY}""")

${userCode}

def _check(preds, ys):
    if not isinstance(preds, (list, tuple)):
        raise ValueError("predict() must return a list, got " + type(preds).__name__)
    if len(preds) != len(ys):
        raise ValueError("predict() returned %d values, expected %d" % (len(preds), len(ys)))
    return preds

def _class(v):
    if isinstance(v, (list, tuple)):
        return max(range(len(v)), key=lambda i: v[i])
    return 1 if float(v) >= 0.5 else 0

def _accuracy(preds, ys):
    return sum(1 for p, y in zip(preds, ys) if _class(p) == _class(y)) / len(ys)

def _f1(preds, ys):
    tp = fp = fn = 0
    for p, y in zip(preds, ys):
        pp, yy = _class(p), _class(y)
        if pp == 1 and yy == 1: tp += 1
        elif pp == 1 and yy == 0: fp += 1
        elif pp == 0 and yy == 1: fn += 1
    precision = tp / (tp + fp) if (tp + fp) else 0.0
    recall = tp / (tp + fn) if (tp + fn) else 0.0
    return 2 * precision * recall / (precision + recall) if (precision + recall) else 0.0

def _mse(preds, ys):
    return sum((float(p) - float(y)) ** 2 for p, y in zip(preds, ys)) / len(ys)

def _r2(preds, ys):
    mean = sum(float(y) for y in ys) / len(ys)
    ss_res = sum((float(p) - float(y)) ** 2 for p, y in zip(preds, ys))
    ss_tot = sum((float(y) - mean) ** 2 for y in ys)
    return 1.0 - ss_res / ss_tot if ss_tot else 0.0

try:
    _preds = _check(predict(TRAIN_X, TRAIN_Y, TEST_X), TEST_Y)
    _score = float(_${lab.metric}(_preds, TEST_Y))
    if not math.isfinite(_score):
        raise ValueError("score is not finite - check for NaN or infinity in predictions")
    print(json.dumps({"score": _score, "n": len(TEST_Y)}))
except Exception as _e:
    print(json.dumps({"score": None, "n": len(TEST_Y), "error": type(_e).__name__ + ": " + str(_e)}))
`;
}

function parseHarnessOutput(stdout: string): {
  payload: HarnessPayload | null;
  output: string;
} {
  const lines = stdout.split("\n");
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const line = lines[i].trim();
    if (!line.startsWith("{")) continue;
    try {
      const parsed = JSON.parse(line) as HarnessPayload;
      if (parsed && typeof parsed === "object" && "score" in parsed) {
        const rest = [...lines.slice(0, i), ...lines.slice(i + 1)]
          .join("\n")
          .trim();
        return { payload: parsed, output: rest };
      }
    } catch {
      continue;
    }
  }
  return { payload: null, output: stdout.trim() };
}

/** Human-readable metric name for a lab. */
export function metricLabel(metric: Lab["metric"]): string {
  switch (metric) {
    case "accuracy":
      return "Accuracy";
    case "f1":
      return "F1";
    case "mse":
      return "MSE";
    case "r2":
      return "R\u00b2";
  }
}

/** Does this score meet the lab's target, given its direction? */
export function meetsTarget(lab: Lab, score: number): boolean {
  return lab.higherIsBetter ? score >= lab.target : score <= lab.target;
}

function isIsoTimestamp(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * Validate a persisted lab record. Malformed entries return null so a bad
 * payload (an array, a scalar, `{"x":null}`) can never reach a derived view.
 * Missing optional fields stay absent; present-but-invalid ones are dropped.
 */
export function sanitizeLabRecord(value: unknown): LabRecord | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  const record = value as Record<string, unknown>;
  const sanitized: LabRecord = {
    best: isFiniteNumber(record.best) ? record.best : null,
    attempts: isFiniteNumber(record.attempts)
      ? Math.max(0, Math.round(record.attempts))
      : 0,
    passed: record.passed === true,
  };
  if (isIsoTimestamp(record.lastScoredAt)) {
    sanitized.lastScoredAt = record.lastScoredAt;
  }
  if (isFiniteNumber(record.lastScore)) sanitized.lastScore = record.lastScore;
  if (Array.isArray(record.recentPasses)) {
    const passes = record.recentPasses.filter(isIsoTimestamp);
    sanitized.recentPasses = passes.slice(-LAB_HISTORY_CAP);
  }
  return sanitized;
}

/** Parse the stored lab map. Invalid payloads read as empty; bad entries drop. */
export function parseLabRecords(raw: string | null): LabRecords {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    const out: LabRecords = {};
    for (const [id, value] of Object.entries(parsed)) {
      const record = sanitizeLabRecord(value);
      if (record) out[id] = record;
    }
    return out;
  } catch {
    return {};
  }
}

/**
 * Run the user's code against the lab's held-out set and return the metric.
 */
export async function scoreLab(
  lab: Lab,
  userCode: string,
): Promise<LabRunResult> {
  try {
    const py = await loadPyodideOnce();
    const { stdout, error } = await runCode(py, buildHarness(lab, userCode));
    const { payload, output } = parseHarnessOutput(stdout);
    if (error) {
      return { score: null, error: error.trim(), stdout: output };
    }
    if (!payload) {
      return {
        score: null,
        error:
          "The scoring harness produced no result. Check for a top-level error in your code.",
        stdout: output,
      };
    }
    if (payload.error) {
      return { score: null, error: payload.error, stdout: output };
    }
    if (typeof payload.score !== "number") {
      return {
        score: null,
        error: "The scoring harness returned no score.",
        stdout: output,
      };
    }
    return { score: payload.score, error: null, stdout: output };
  } catch (e: any) {
    return { score: null, error: e?.message || String(e), stdout: "" };
  }
}

const labStore = createStore<LabRecords>({
  id: "labs",
  storageKey: STORAGE_KEY,
  event: LAB_CHANGE_EVENT,
  empty: () => ({}),
  parse: parseLabRecords,
  serialize: (v) => JSON.stringify(v),
});

/** All lab records for this browser. */
export function getLabRecords(): LabRecords {
  return labStore.get();
}

/** Best record for one lab, or null if it has never been run. */
export function getLabBest(labId: string): LabRecord | null {
  return labStore.get()[labId] ?? null;
}

/**
 * Record one scored run. Increments attempts, keeps the best score in the
 * direction that fits the metric, flips passed once the target is met, and
 * appends the run to the short pass history when it meets the target.
 */
export function setLabBest(
  labId: string,
  score: number,
  at: Date = new Date(),
): LabRecord {
  const lab = LABS.find((item) => item.id === labId) ?? null;
  const records = labStore.get();
  const current: LabRecord = records[labId] ?? {
    best: null,
    attempts: 0,
    passed: false,
  };
  const better =
    current.best === null ||
    (lab
      ? lab.higherIsBetter
        ? score > current.best
        : score < current.best
      : score > current.best);
  const passedRun = lab !== null && meetsTarget(lab, score);
  const recentPasses = [
    ...(current.recentPasses ?? []),
    ...(passedRun ? [at.toISOString()] : []),
  ].slice(-LAB_HISTORY_CAP);
  const next: LabRecord = {
    best: better ? score : current.best,
    attempts: current.attempts + 1,
    passed: current.passed || passedRun,
    lastScoredAt: at.toISOString(),
    lastScore: score,
    recentPasses,
  };
  records[labId] = next;
  labStore.set(records);
  return next;
}

export const LAB_SPEC: StoreSpec<LabRecords> = {
  id: "labs",
  storageKey: STORAGE_KEY,
  event: LAB_CHANGE_EVENT,
  empty: () => ({}),
  parse: parseLabRecords,
  serialize: (v) => JSON.stringify(v),
};
