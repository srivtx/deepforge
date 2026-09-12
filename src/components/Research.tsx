"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RESEARCH_CHALLENGES, type ResearchChallenge } from "@/data/research";
import { cn } from "@/lib/utils";
import { loadPyodideOnce } from "@/lib/pyodide";
import {
  RESEARCH_CHANGE_EVENT,
  beatsBaseline,
  getResearchState,
  resetResearchChallenge,
  saveAttempt,
  scoreSubmission,
  type ResearchAttempt,
  type ResearchChallengeState,
  type ResearchState,
} from "@/lib/research";

type PyStatus = "idle" | "loading" | "ready" | "error";

interface SubmitOutcome {
  score: number | null;
  beatenBaseline: boolean;
  error: string | null;
}

function metricLabel(metric: ResearchChallenge["metric"]): string {
  switch (metric) {
    case "accuracy":
      return "accuracy";
    case "f1":
      return "F1";
    case "mse":
      return "MSE";
    case "r2":
      return "R²";
  }
}

function formatScore(score: number): string {
  return score.toFixed(4);
}

function formatWhen(at: string): string {
  const date = new Date(at);
  if (Number.isNaN(date.getTime())) return at;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AttemptRow({
  challenge,
  attempt,
}: {
  challenge: ResearchChallenge;
  attempt: ResearchAttempt;
}) {
  const beat = beatsBaseline(challenge, attempt.score);
  return (
    <li className="flex items-center justify-between gap-3 rounded-md border border-hairline bg-canvas px-2.5 py-1.5">
      <span
        className={cn(
          "font-mono text-xs",
          beat ? "text-accent" : "text-ink",
        )}
      >
        {formatScore(attempt.score)}
      </span>
      <span className="flex items-center gap-2">
        {beat && (
          <span className="text-[10px] font-medium text-accent">beats</span>
        )}
        <span className="text-[10px] text-mute">{formatWhen(attempt.at)}</span>
      </span>
    </li>
  );
}

interface ChallengeCardProps {
  challenge: ResearchChallenge;
  state: ResearchChallengeState | undefined;
  active: boolean;
  code: string;
  busy: boolean;
  running: boolean;
  pyStatus: PyStatus;
  outcome: SubmitOutcome | undefined;
  showHint: boolean;
  onToggle: () => void;
  onCodeChange: (code: string) => void;
  onSubmit: () => void;
  onReset: () => void;
  onToggleHint: () => void;
}

function ChallengeCard({
  challenge,
  state,
  active,
  code,
  busy,
  running,
  pyStatus,
  outcome,
  showHint,
  onToggle,
  onCodeChange,
  onSubmit,
  onReset,
  onToggleHint,
}: ChallengeCardProps) {
  const panelId = `research-panel-${challenge.id}`;
  const codeId = `research-code-${challenge.id}`;
  const bestScore = state?.bestScore ?? null;
  const beaten = Boolean(state?.beatenBaseline);
  const attempts = state?.attempts ?? [];
  const recent = attempts.slice(-5).reverse();
  const trainRows = challenge.trainData.features.length;
  const testRows = challenge.testData.features.length;
  const columns = challenge.trainData.features[0]?.length ?? 0;

  const handleEditorKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = code.slice(0, start) + "    " + code.slice(end);
      onCodeChange(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 4;
      });
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border bg-canvas-card p-5 transition-colors",
        active
          ? "border-accent/40 sm:col-span-2 lg:col-span-3"
          : "border-hairline hover:border-accent/30",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={active}
        aria-controls={panelId}
        className="block w-full rounded-md text-left focus:outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent"
      >
        <span className="flex items-start justify-between gap-3">
          <span className="text-base font-semibold text-ink">
            {challenge.title}
          </span>
          <span className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
            {beaten && (
              <span className="rounded-full border border-accent/40 bg-accent/5 px-2 py-0.5 text-[10px] font-medium text-accent">
                Baseline beaten
              </span>
            )}
            {bestScore !== null && (
              <span className="rounded-full border border-hairline px-2 py-0.5 text-[10px] font-medium text-body-mid">
                Best {formatScore(bestScore)}
              </span>
            )}
          </span>
        </span>
        <span className="mt-2 block text-sm leading-relaxed text-body">
          {challenge.blurb}
        </span>
        <span className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-xs text-body-mid">
            {metricLabel(challenge.metric)} · baseline{" "}
            {formatScore(challenge.baselineScore)} ({challenge.baselineName})
          </span>
          <span className="flex items-center gap-2 font-mono text-xs text-mute">
            {challenge.points} pts
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              aria-hidden
              className={cn("transition-transform", active && "rotate-180")}
            >
              <path
                d="M2 3.5l3 3 3-3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </span>
      </button>

      {active && (
        <div
          id={panelId}
          className="df-fade-in mt-4 border-t border-hairline pt-4"
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <h4 className="mb-2 text-xs font-medium text-body-mid">
                Dataset
              </h4>
              <p className="text-sm leading-relaxed text-body">
                {challenge.datasetDescription}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-md border border-hairline bg-canvas p-2.5">
                  <div className="text-[11px] text-body-mid">Train</div>
                  <div className="mt-0.5 font-mono text-sm text-ink">
                    {trainRows} × {columns}
                  </div>
                </div>
                <div className="rounded-md border border-hairline bg-canvas p-2.5">
                  <div className="text-[11px] text-body-mid">Hidden test</div>
                  <div className="mt-0.5 font-mono text-sm text-ink">
                    {testRows} rows
                  </div>
                </div>
                <div className="rounded-md border border-hairline bg-canvas p-2.5">
                  <div className="text-[11px] text-body-mid">Metric</div>
                  <div className="mt-0.5 font-mono text-sm text-ink">
                    {metricLabel(challenge.metric)} ·{" "}
                    {challenge.higherIsBetter ? "higher" : "lower"}
                  </div>
                </div>
                <div className="rounded-md border border-hairline bg-canvas p-2.5">
                  <div className="text-[11px] text-body-mid">Baseline</div>
                  <div className="mt-0.5 font-mono text-sm text-ink">
                    {formatScore(challenge.baselineScore)}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={onToggleHint}
                  className="text-xs text-accent transition-opacity hover:opacity-80"
                >
                  {showHint ? "Hide hint" : "Show hint"}
                </button>
                {showHint && (
                  <p className="mt-2 rounded-md border border-hairline bg-canvas p-3 text-xs leading-relaxed text-body">
                    {challenge.hint}
                  </p>
                )}
              </div>

              <p className="mt-4 text-xs leading-relaxed text-body-mid">
                Define{" "}
                <code className="font-mono text-body">
                  def solve(train_X, train_y, test_X)
                </code>{" "}
                and return one prediction per test row. Scoring runs locally in
                your browser.
              </p>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor={codeId}
                  className="text-xs font-medium text-body-mid"
                >
                  Your solution
                </label>
                <span className="font-mono text-[10px] text-mute">
                  ⌘+Enter to submit
                </span>
              </div>
              <textarea
                id={codeId}
                value={code}
                onChange={(e) => onCodeChange(e.target.value)}
                onKeyDown={handleEditorKey}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                aria-label={`Solution for ${challenge.title}`}
                className="df-code-editor df-scroll mt-2 min-h-[240px] w-full resize-y rounded-md border border-hairline bg-canvas px-3 py-3 font-mono text-ink focus:outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent"
              />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-canvas transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {running ? (
                    <>
                      <span
                        className="df-spin h-3 w-3 rounded-full border-2 border-canvas/40 border-t-canvas"
                        aria-hidden
                      />
                      {pyStatus === "loading"
                        ? "Loading Python…"
                        : "Scoring…"}
                    </>
                  ) : (
                    "Submit to hidden test"
                  )}
                </button>
                <button
                  type="button"
                  onClick={onReset}
                  disabled={busy}
                  className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink disabled:opacity-50"
                >
                  Reset challenge
                </button>
                {pyStatus === "error" && (
                  <span className="text-[11px] text-error">
                    Pyodide failed to load
                  </span>
                )}
              </div>

              {outcome && (
                <div
                  role="status"
                  aria-live="polite"
                  className={cn(
                    "mt-3 rounded-md border p-3",
                    outcome.error
                      ? "border-error/40 bg-error/5"
                      : outcome.beatenBaseline
                        ? "border-accent/40 bg-accent/5"
                        : "border-warning/40 bg-warning/5",
                  )}
                >
                  {outcome.error ? (
                    <>
                      <div className="text-[10px] font-medium text-error">
                        Submission error
                      </div>
                      <pre className="mt-1 overflow-x-auto whitespace-pre-wrap font-mono text-[11px] text-body">
                        {outcome.error}
                      </pre>
                    </>
                  ) : (
                    outcome.score !== null && (
                      <>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-medium text-body-mid">
                            Your score
                          </span>
                          <span className="font-mono text-lg text-ink">
                            {formatScore(outcome.score)}
                          </span>
                          <span className="text-[10px] text-body-mid">
                            vs baseline {formatScore(challenge.baselineScore)}
                          </span>
                          <span
                            className={cn(
                              "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                              outcome.beatenBaseline
                                ? "border-accent/40 bg-accent/5 text-accent"
                                : "border-warning/40 bg-warning/5 text-warning",
                            )}
                          >
                            {outcome.beatenBaseline
                              ? "You beat the baseline"
                              : "Baseline still ahead"}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-body-mid">
                          {outcome.beatenBaseline
                            ? "New personal best — your score is recorded in this browser."
                            : "Tune the model and submit again to take the record."}
                        </p>
                      </>
                    )
                  )}
                </div>
              )}

              <div className="mt-4">
                <h4 className="text-xs font-medium text-body-mid">
                  Recent attempts
                </h4>
                {recent.length === 0 ? (
                  <p className="mt-2 text-xs text-mute">
                    No attempts yet.
                  </p>
                ) : (
                  <ol className="mt-2 space-y-1.5">
                    {recent.map((attempt, index) => (
                      <AttemptRow
                        key={`${attempt.at}-${index}`}
                        challenge={challenge}
                        attempt={attempt}
                      />
                    ))}
                  </ol>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function Research() {
  const [state, setState] = useState<ResearchState>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [runningId, setRunningId] = useState<string | null>(null);
  const [pyStatus, setPyStatus] = useState<PyStatus>("idle");
  const [outcomes, setOutcomes] = useState<Record<string, SubmitOutcome>>({});
  const [showHint, setShowHint] = useState(false);

  const pyRef = useRef<any>(null);

  // Load stored research records and stay in sync with every writer.
  useEffect(() => {
    const load = () => setState(getResearchState());
    load();
    window.addEventListener(RESEARCH_CHANGE_EVENT, load);
    return () => window.removeEventListener(RESEARCH_CHANGE_EVENT, load);
  }, []);

  const beatenCount = useMemo(
    () =>
      RESEARCH_CHALLENGES.filter((c) => state[c.id]?.beatenBaseline).length,
    [state],
  );

  const toggleChallenge = (challenge: ResearchChallenge) => {
    setActiveId((prev) =>
      prev === challenge.id ? null : challenge.id,
    );
    setShowHint(false);
  };

  const submit = async (challenge: ResearchChallenge) => {
    if (runningId) return;
    setRunningId(challenge.id);
    setOutcomes((prev) => {
      const next = { ...prev };
      delete next[challenge.id];
      return next;
    });
    try {
      if (!pyRef.current) {
        setPyStatus("loading");
        pyRef.current = await loadPyodideOnce();
      }
      setPyStatus("ready");
      const result = await scoreSubmission(
        challenge,
        codes[challenge.id] ?? challenge.starterCode,
      );
      setOutcomes((prev) => ({ ...prev, [challenge.id]: result }));
      if (result.score !== null) {
        saveAttempt(challenge.id, result.score);
        setState(getResearchState());
      }
    } catch (e: any) {
      setPyStatus("error");
      setOutcomes((prev) => ({
        ...prev,
        [challenge.id]: {
          score: null,
          beatenBaseline: false,
          error: e?.message || String(e),
        },
      }));
    } finally {
      setRunningId(null);
    }
  };

  const resetChallenge = (challenge: ResearchChallenge) => {
    resetResearchChallenge(challenge.id);
    setCodes((prev) => ({ ...prev, [challenge.id]: challenge.starterCode }));
    setOutcomes((prev) => {
      const next = { ...prev };
      delete next[challenge.id];
      return next;
    });
    setState(getResearchState());
  };

  return (
    <section
      id="research"
      className="mx-auto max-w-6xl scroll-mt-16 px-4 py-12 sm:px-6 sm:py-16"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Research
        </h2>
        <p className="mt-1 text-sm text-body-mid">
          Beat the baseline and your code becomes the latest best.
        </p>
        <p
          className={cn(
            "mt-2 font-mono text-xs",
            beatenCount > 0 ? "text-accent" : "text-body-mid",
          )}
        >
          {beatenCount} / {RESEARCH_CHALLENGES.length} baselines beaten
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {RESEARCH_CHALLENGES.map((challenge) => {
          const active = activeId === challenge.id;
          const running = runningId === challenge.id;
          return (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              state={state[challenge.id]}
              active={active}
              code={codes[challenge.id] ?? challenge.starterCode}
              busy={runningId !== null}
              running={running}
              pyStatus={pyStatus}
              outcome={outcomes[challenge.id]}
              showHint={active && showHint}
              onToggle={() => toggleChallenge(challenge)}
              onCodeChange={(code) =>
                setCodes((prev) => ({ ...prev, [challenge.id]: code }))
              }
              onSubmit={() => void submit(challenge)}
              onReset={() => resetChallenge(challenge)}
              onToggleHint={() => setShowHint((v) => !v)}
            />
          );
        })}
      </div>
    </section>
  );
}
