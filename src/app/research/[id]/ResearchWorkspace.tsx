"use client";

import { useEffect, useRef, useState } from "react";
import type { ResearchChallenge } from "@/data/research";
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
} from "@/lib/research";
import { cn } from "@/lib/utils";
import { formatScore, formatWhen } from "@/components/research/format";

type PyStatus = "idle" | "loading" | "ready" | "error";

interface SubmitOutcome {
  score: number | null;
  beatenBaseline: boolean;
  error: string | null;
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

/**
 * The per-challenge editor for /research/[id]. Ports the inline panel that
 * used to live on the index: Pyodide boots lazily on first submit, the score
 * is stored locally through saveAttempt, and the header badges elsewhere on
 * the page refresh through RESEARCH_CHANGE_EVENT.
 */
export function ResearchWorkspace({
  challenge,
}: {
  challenge: ResearchChallenge;
}) {
  const codeId = `research-code-${challenge.id}`;
  const [stored, setStored] = useState<ResearchChallengeState | null>(null);
  const [code, setCode] = useState(challenge.starterCode);
  const [running, setRunning] = useState(false);
  const [pyStatus, setPyStatus] = useState<PyStatus>("idle");
  const [outcome, setOutcome] = useState<SubmitOutcome | null>(null);
  const pyRef = useRef<any>(null);

  useEffect(() => {
    const load = () => setStored(getResearchState()[challenge.id] ?? null);
    load();
    window.addEventListener(RESEARCH_CHANGE_EVENT, load);
    return () => window.removeEventListener(RESEARCH_CHANGE_EVENT, load);
  }, [challenge.id]);

  const recent = (stored?.attempts ?? []).slice(-5).reverse();

  const submit = async () => {
    if (running) return;
    setRunning(true);
    setOutcome(null);
    try {
      if (!pyRef.current) {
        setPyStatus("loading");
        pyRef.current = await loadPyodideOnce();
      }
      setPyStatus("ready");
      const result = await scoreSubmission(challenge, code);
      setOutcome(result);
      if (result.score !== null) {
        saveAttempt(challenge.id, result.score);
        setStored(getResearchState()[challenge.id] ?? null);
      }
    } catch (e: any) {
      setPyStatus("error");
      setOutcome({
        score: null,
        beatenBaseline: false,
        error: e?.message || String(e),
      });
    } finally {
      setRunning(false);
    }
  };

  const reset = () => {
    resetResearchChallenge(challenge.id);
    setCode(challenge.starterCode);
    setOutcome(null);
    setStored(getResearchState()[challenge.id] ?? null);
  };

  const handleEditorKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = code.slice(0, start) + "    " + code.slice(end);
      setCode(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 4;
      });
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      void submit();
    }
  };

  return (
    <section
      id="run"
      aria-label="Research workspace"
      className="flex scroll-mt-16 flex-col gap-5"
    >
      <h2 className="sr-only">Run your solution</h2>
      <div className="flex flex-col rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label
            htmlFor={codeId}
            className="text-sm font-medium text-body-mid"
          >
            Your solution
          </label>
          <span className="font-mono text-[10px] text-mute">
            ⌘+Enter to submit
          </span>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-body-mid">
          Define{" "}
          <code className="font-mono text-body">
            def solve(train_X, train_y, test_X)
          </code>{" "}
          and return one prediction per test row. Scoring runs locally in your
          browser.
        </p>
        <textarea
          id={codeId}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleEditorKey}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          aria-label={`Solution for ${challenge.title}`}
          className="df-code-editor df-scroll mt-3 min-h-[240px] w-full resize-y rounded-md border border-hairline bg-canvas px-3 py-3 font-mono text-ink focus:outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void submit()}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-canvas transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {running ? (
              <>
                <span
                  className="df-spin h-3 w-3 rounded-full border-2 border-canvas/40 border-t-canvas"
                  aria-hidden
                />
                {pyStatus === "loading" ? "Loading Python…" : "Scoring…"}
              </>
            ) : (
              "Submit to hidden test"
            )}
          </button>
          <button
            type="button"
            onClick={reset}
            disabled={running}
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
      </div>

      <div className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-medium text-body-mid">
            Recent attempts
          </h3>
          {stored?.bestScore != null && (
            <span className="font-mono text-[10px] text-mute">
              best {formatScore(stored.bestScore)}
            </span>
          )}
        </div>
        {recent.length === 0 ? (
          <p className="mt-2 py-2 text-center text-xs text-mute">
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
        <p className="mt-3 border-t border-hairline pt-3 text-[11px] leading-relaxed text-mute">
          The last five scored runs are kept in this browser. Beating the
          baseline is what counts — the best score follows the metric
          direction.
        </p>
      </div>
    </section>
  );
}
