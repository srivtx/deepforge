/**
 * Research challenge scoring and local persistence.
 *
 * A submission is the user's Python `solve(train_X, train_y, test_X)`.
 * It runs in Pyodide against the challenge's hidden test split: the
 * harness injects train/test JSON, computes the challenge metric in
 * native Python, and prints a single marker line holding the result.
 * Best scores and attempt history are stored per challenge in
 * localStorage.
 */

import { RESEARCH_CHALLENGES, type ResearchChallenge } from "@/data/research";
import { loadPyodideOnce, runCode } from "@/lib/pyodide";
import { createStore } from "@/lib/sync/store";
import type { StoreSpec } from "@/lib/sync/types";

const STORAGE_KEY = "deepforge:research:v1";
const SCORE_MARKER = "__DEEPFORGE_SCORE__";
const BASELINE_EPSILON = 1e-9;

export const RESEARCH_CHANGE_EVENT = "deepforge:research-change";

export interface ResearchAttempt {
  score: number;
  at: string;
}

export interface ResearchChallengeState {
  bestScore: number | null;
  bestAt: string | null;
  beatenBaseline: boolean;
  attempts: ResearchAttempt[];
}

export type ResearchState = Record<string, ResearchChallengeState>;

export interface SubmissionResult {
  score: number | null;
  beatenBaseline: boolean;
  error: string | null;
}

export function beatsBaseline(
  challenge: ResearchChallenge,
  score: number,
): boolean {
  if (!Number.isFinite(score)) return false;
  return challenge.higherIsBetter
    ? score > challenge.baselineScore + BASELINE_EPSILON
    : score < challenge.baselineScore - BASELINE_EPSILON;
}

function metricBranch(metric: ResearchChallenge["metric"]): string {
  switch (metric) {
    case "accuracy":
      return `
    pred = [_df_round(v) for v in pred]
    hits = 0
    for a, b in zip(pred, truth):
        if abs(a - float(b)) < 1e-9:
            hits += 1
    return hits / n
`;
    case "f1":
      return `
    pred = [_df_round(v) for v in pred]
    tp = 0
    fp = 0
    fn = 0
    for a, b in zip(pred, truth):
        if a == 1 and float(b) == 1:
            tp += 1
        elif a == 1 and float(b) != 1:
            fp += 1
        elif a != 1 and float(b) == 1:
            fn += 1
    denom = 2 * tp + fp + fn
    return (2 * tp / denom) if denom else 0.0
`;
    case "mse":
      return `
    total = 0.0
    for a, b in zip(pred, truth):
        total += (a - float(b)) ** 2
    return total / n
`;
    case "r2":
      return `
    mean = sum(float(b) for b in truth) / n
    ss_res = 0.0
    ss_tot = 0.0
    for a, b in zip(pred, truth):
        ss_res += (a - float(b)) ** 2
        ss_tot += (float(b) - mean) ** 2
    return (1.0 - ss_res / ss_tot) if ss_tot else 0.0
`;
  }
}

function buildHarness(challenge: ResearchChallenge, userCode: string): string {
  const trainX = JSON.stringify(challenge.trainData.features);
  const trainY = JSON.stringify(challenge.trainData.labels);
  const testX = JSON.stringify(challenge.testData.features);
  const testY = JSON.stringify(challenge.testData.labels);
  return `
import json as _df_json

${userCode}

_train_X = _df_json.loads(${JSON.stringify(trainX)})
_train_y = _df_json.loads(${JSON.stringify(trainY)})
_test_X = _df_json.loads(${JSON.stringify(testX)})
_test_y = _df_json.loads(${JSON.stringify(testY)})

def _df_round(value):
    return round(float(value))

def _df_metric(pred, truth):
    n = len(truth)
${metricBranch(challenge.metric)}
    raise ValueError("unknown metric")

try:
    _df_pred = [float(v) for v in solve(_train_X, _train_y, _test_X)]
    if len(_df_pred) != len(_test_y):
        raise ValueError("expected " + str(len(_test_y)) + " predictions, got " + str(len(_df_pred)))
    _df_out = {"score": _df_metric(_df_pred, _test_y)}
except Exception as _df_error:
    _df_out = {"error": str(_df_error)}

print(${JSON.stringify(SCORE_MARKER)} + _df_json.dumps(_df_out))
`;
}

/**
 * Run one submission against the hidden test split and score it.
 * Python-side errors are reported in `error`; `score` is null then.
 */
export async function scoreSubmission(
  challenge: ResearchChallenge,
  userCode: string,
): Promise<SubmissionResult> {
  let stdout = "";
  let error: string | null = null;
  try {
    const py = await loadPyodideOnce();
    const run = await runCode(py, buildHarness(challenge, userCode));
    stdout = run.stdout;
    error = run.error;
  } catch (e: any) {
    return {
      score: null,
      beatenBaseline: false,
      error: e?.message || String(e),
    };
  }
  if (error) {
    return { score: null, beatenBaseline: false, error };
  }
  const marker = stdout.lastIndexOf(SCORE_MARKER);
  if (marker === -1) {
    return {
      score: null,
      beatenBaseline: false,
      error: "The submission produced no score.",
    };
  }
  const line = stdout.slice(marker + SCORE_MARKER.length).split("\n")[0];
  let payload: { score?: unknown; error?: unknown };
  try {
    payload = JSON.parse(line) as { score?: unknown; error?: unknown };
  } catch {
    return {
      score: null,
      beatenBaseline: false,
      error: "Could not parse the scoring result.",
    };
  }
  if (typeof payload.error === "string") {
    return { score: null, beatenBaseline: false, error: payload.error };
  }
  if (typeof payload.score !== "number" || !Number.isFinite(payload.score)) {
    return {
      score: null,
      beatenBaseline: false,
      error: "The scoring result was not a number.",
    };
  }
  return {
    score: payload.score,
    beatenBaseline: beatsBaseline(challenge, payload.score),
    error: null,
  };
}

function emptyChallengeState(): ResearchChallengeState {
  return {
    bestScore: null,
    bestAt: null,
    beatenBaseline: false,
    attempts: [],
  };
}

const researchStore = createStore<ResearchState>({
  id: "research",
  storageKey: STORAGE_KEY,
  event: RESEARCH_CHANGE_EVENT,
  empty: () => ({}),
  parse: (raw) => {
    if (!raw) return {};
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return {};
      }
      return parsed as ResearchState;
    } catch {
      return {};
    }
  },
  serialize: (v) => JSON.stringify(v),
});

export function getResearchState(): ResearchState {
  return researchStore.get();
}

export function getChallengeState(
  challengeId: string,
): ResearchChallengeState {
  return researchStore.get()[challengeId] ?? emptyChallengeState();
}

/**
 * Persist one scored attempt. `bestScore` keeps the best value seen
 * (direction depends on the metric), `beatenBaseline` is sticky, and
 * the last 50 attempts are retained.
 */
export function saveAttempt(
  challengeId: string,
  score: number,
): ResearchChallengeState {
  const challenge = RESEARCH_CHALLENGES.find((c) => c.id === challengeId);
  const state = researchStore.get();
  const current = state[challengeId] ?? emptyChallengeState();
  if (!Number.isFinite(score)) return current;
  const higherIsBetter = challenge ? challenge.higherIsBetter : true;
  const better =
    current.bestScore === null ||
    (higherIsBetter ? score > current.bestScore : score < current.bestScore);
  const beaten = challenge ? beatsBaseline(challenge, score) : false;
  const at = new Date().toISOString();
  state[challengeId] = {
    bestScore: better ? score : current.bestScore,
    bestAt: better ? at : current.bestAt,
    beatenBaseline: current.beatenBaseline || beaten,
    attempts: [...current.attempts, { score, at }].slice(-50),
  };
  researchStore.set(state);
  return state[challengeId];
}

export function resetResearchChallenge(challengeId: string): void {
  researchStore.update((state) => {
    const next = { ...state };
    delete next[challengeId];
    return next;
  });
}

export const RESEARCH_SPEC: StoreSpec<ResearchState> = {
  id: "research",
  storageKey: STORAGE_KEY,
  event: RESEARCH_CHANGE_EVENT,
  empty: () => ({}),
  parse: (raw) => {
    if (!raw) return {};
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return {};
      }
      return parsed as ResearchState;
    } catch {
      return {};
    }
  },
  serialize: (v) => JSON.stringify(v),
};
