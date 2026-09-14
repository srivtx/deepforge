"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { INTERVIEW_TRACKS, type InterviewTrack } from "@/data/interview";
import { PROBLEM_META, type ProblemMeta } from "@/data/problems/problem-meta";
import {
  AGENTIC_ROUND_CHANGE_EVENT,
  buildAgenticScenarios,
  getAgenticAttemptsFor,
  getBestAgenticAttempt,
  recordAgenticAttempt,
  scoreAgenticRound,
  type AgenticAnswers,
  type AgenticAttempt,
  type AgenticChoice,
  type AgenticDimensionKey,
  type AgenticScenario,
  type AgenticScore,
  type AgenticVerdict,
} from "@/lib/agenticRound";
import { cn, difficultyClasses } from "@/lib/utils";

const META_BY_ID = new Map(PROBLEM_META.map((problem) => [problem.id, problem]));

const CARD_CLASSES =
  "rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5";
const PRIMARY_BUTTON_CLASSES =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-xs font-medium text-canvas transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-0 sm:py-2";
const SECONDARY_BUTTON_CLASSES =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-hairline px-4 text-xs font-medium text-ink transition-colors hover:bg-canvas-soft focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-0 sm:py-2";

const STAGES = [
  { id: "instruction", label: "Instruction" },
  { id: "plan", label: "Plan review" },
  { id: "verify", label: "Verify" },
  { id: "diagnose", label: "Diagnose & fix" },
] as const;

type Stage = (typeof STAGES)[number]["id"] | "results";

const VERDICT_LABEL: Record<AgenticVerdict, string> = {
  ready: "Round ready",
  developing: "Developing",
  "keep-practicing": "Keep practicing",
};

const VERDICT_CLASSES: Record<AgenticVerdict, string> = {
  ready: "border-accent/40 bg-accent/5 text-accent",
  developing: "border-warning/40 bg-warning/5 text-warning",
  "keep-practicing": "border-hairline bg-canvas text-body-mid",
};

const DIMENSION_HINTS: Record<AgenticDimensionKey, string> = {
  completion: "Did the round end with code the agent could ship?",
  instruction: "Did your prompt say what done means?",
  review: "Did you catch the wrong and unsafe steps?",
  recovery: "Did you diagnose and fix the real failure?",
};

function trackProblems(track: InterviewTrack): ProblemMeta[] {
  const ids = [
    ...track.phases.flatMap((phase) => phase.problemIds),
    ...track.mockProblemIds,
  ];
  const problems: ProblemMeta[] = [];
  const seen = new Set<string>();
  for (const id of ids) {
    const meta = META_BY_ID.get(id);
    if (!meta || seen.has(id)) continue;
    seen.add(id);
    problems.push(meta);
  }
  return problems;
}

function AgentCallout({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-hairline bg-canvas p-3">
      <p className="font-mono text-[10px] uppercase tracking-wide text-mute">
        {label}
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-body">{children}</p>
    </div>
  );
}

function Stepper({ stage }: { stage: Stage }) {
  const activeIndex =
    stage === "results"
      ? STAGES.length
      : STAGES.findIndex((entry) => entry.id === stage);
  return (
    <ol aria-label="Round progress" className="flex flex-wrap items-center gap-1.5">
      {STAGES.map((entry, index) => {
        const state =
          index < activeIndex
            ? "done"
            : index === activeIndex
              ? "current"
              : "todo";
        return (
          <li
            key={entry.id}
            aria-current={state === "current" ? "step" : undefined}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px]",
              state === "current"
                ? "border-accent bg-accent/10 font-medium text-accent"
                : state === "done"
                  ? "border-hairline bg-canvas text-body-mid"
                  : "border-hairline text-mute",
            )}
          >
            <span className="font-mono" aria-hidden>
              {state === "done" ? "✓" : index + 1}
            </span>
            {entry.label}
          </li>
        );
      })}
    </ol>
  );
}

function ChoiceGroup({
  choice,
  name,
  value,
  onChange,
}: {
  choice: AgenticChoice;
  name: string;
  value: string | null;
  onChange: (id: string) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-ink">{choice.prompt}</legend>
      <div className="mt-3 space-y-2">
        {choice.options.map((option) => {
          const checked = value === option.id;
          return (
            <label
              key={option.id}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                checked
                  ? "border-accent bg-accent/5"
                  : "border-hairline bg-canvas hover:bg-canvas-soft",
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.id}
                checked={checked}
                onChange={() => onChange(option.id)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--accent)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
              />
              <span className="min-w-0 text-sm leading-relaxed text-body">
                {option.text}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function DimensionBars({ score }: { score: AgenticScore }) {
  return (
    <ul className="mt-4 space-y-3">
      {score.dimensions.map((dimension) => (
        <li key={dimension.key}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <span className="text-sm font-medium text-ink">
              {dimension.label}
            </span>
            <span className="font-mono text-xs text-body-mid">
              {dimension.points}/{dimension.weight}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-mute">
            {DIMENSION_HINTS[dimension.key]}
          </p>
          <div
            role="progressbar"
            aria-label={dimension.label}
            aria-valuemin={0}
            aria-valuemax={dimension.weight}
            aria-valuenow={dimension.points}
            className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-canvas-soft"
          >
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${Math.round(dimension.score * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function ResultCallout({
  title,
  pass,
  pickedText,
  correctText,
  note,
}: {
  title: string;
  pass: boolean;
  pickedText: string | null;
  correctText: string;
  note: string;
}) {
  return (
    <div className="rounded-lg border border-hairline bg-canvas p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium text-ink">{title}</span>
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 text-[10px] font-medium",
            pass
              ? "border-accent/40 bg-accent/5 text-accent"
              : "border-warning/40 bg-warning/5 text-warning",
          )}
        >
          {pass ? "Correct" : "Missed"}
        </span>
      </div>
      <p className="mt-2 text-xs text-body-mid">
        You chose:{" "}
        <span className="text-body">
          {pickedText ?? "nothing"}
        </span>
      </p>
      {!pass && (
        <p className="mt-1 text-xs text-body-mid">
          The call: <span className="text-body">{correctText}</span>
        </p>
      )}
      <p className="mt-2 text-xs leading-relaxed text-mute">{note}</p>
    </div>
  );
}

export function AgenticRound({
  defaultTrackId = null,
  autoOpen = false,
}: {
  defaultTrackId?: string | null;
  autoOpen?: boolean;
}) {
  const fallbackTrackId =
    defaultTrackId && INTERVIEW_TRACKS.some((track) => track.id === defaultTrackId)
      ? defaultTrackId
      : INTERVIEW_TRACKS[0].id;

  const [trackId, setTrackId] = useState(fallbackTrackId);
  const [open, setOpen] = useState(autoOpen);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [stage, setStage] = useState<Stage>("instruction");
  const [instruction, setInstruction] = useState("");
  const [plan, setPlan] = useState<Record<string, boolean>>({});
  const [decisionOptionId, setDecisionOptionId] = useState<string | null>(null);
  const [diagnosisOptionId, setDiagnosisOptionId] = useState<string | null>(null);
  const [recoveryOptionId, setRecoveryOptionId] = useState<string | null>(null);
  const [score, setScore] = useState<AgenticScore | null>(null);
  const [attempts, setAttempts] = useState<AgenticAttempt[]>([]);

  const stageHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const autoOpenedRef = useRef(false);

  const track =
    INTERVIEW_TRACKS.find((entry) => entry.id === trackId) ?? INTERVIEW_TRACKS[0];

  const scenarios = useMemo(
    () => buildAgenticScenarios(track, trackProblems(track), 3),
    [track],
  );
  const scenario: AgenticScenario | null = scenarios[scenarioIndex] ?? null;

  const resetAnswers = useCallback(() => {
    setInstruction("");
    setPlan({});
    setDecisionOptionId(null);
    setDiagnosisOptionId(null);
    setRecoveryOptionId(null);
    setScore(null);
    setStage("instruction");
  }, []);

  const startRound = useCallback(() => {
    setOpen(true);
    setScenarioIndex(0);
    resetAnswers();
  }, [resetAnswers]);

  useEffect(() => {
    if (autoOpen && !autoOpenedRef.current) {
      autoOpenedRef.current = true;
      startRound();
    }
  }, [autoOpen, startRound]);

  useEffect(() => {
    const id = scenario?.id ?? "";
    const load = () => setAttempts(getAgenticAttemptsFor(id));
    load();
    window.addEventListener(AGENTIC_ROUND_CHANGE_EVENT, load);
    return () => window.removeEventListener(AGENTIC_ROUND_CHANGE_EVENT, load);
  }, [scenario?.id]);

  useEffect(() => {
    if (!open) return;
    stageHeadingRef.current?.focus();
  }, [open, stage, scenarioIndex]);

  const leadScenario = scenarios[0] ?? null;
  const best = leadScenario ? getBestAgenticAttempt(leadScenario.id) : null;
  const planComplete =
    scenario !== null &&
    scenario.plan.every((step) => plan[step.id] !== undefined);

  const announcement = (() => {
    if (!open) return "";
    if (stage === "instruction") {
      return "Step 1 of 4: read the brief and write your instruction to the agent.";
    }
    if (stage === "plan") {
      return `Step 2 of 4: approve or reject each of the ${scenario?.plan.length ?? 0} proposed steps.`;
    }
    if (stage === "verify") {
      return "Step 3 of 4: the agent reports back. Approve or correct its test and output decisions.";
    }
    if (stage === "diagnose") {
      return "Step 4 of 4: diagnose the reported failure and choose the recovery action.";
    }
    if (score) {
      return `Round scored ${score.total} out of 100. ${VERDICT_LABEL[score.verdict]}.`;
    }
    return "";
  })();

  function chooseTrack(id: string) {
    setTrackId(id);
    setScenarioIndex(0);
    setOpen(false);
    resetAnswers();
  }

  function exitRound() {
    setOpen(false);
    resetAnswers();
  }

  function nextScenario() {
    if (scenarios.length === 0) return;
    setScenarioIndex((scenarioIndex + 1) % scenarios.length);
    resetAnswers();
  }

  function retryScenario() {
    resetAnswers();
  }

  function submitRound() {
    if (!scenario) return;
    const answers: AgenticAnswers = {
      instruction,
      plan,
      decisionOptionId,
      diagnosisOptionId,
      recoveryOptionId,
    };
    const result = scoreAgenticRound(scenario, answers);
    setScore(result);
    setStage("results");
    recordAgenticAttempt({
      scenarioId: scenario.id,
      trackId: scenario.trackId,
      problemId: scenario.problemId,
      family: scenario.family,
      total: result.total,
      verdict: result.verdict,
      dimensions: {
        completion:
          result.dimensions.find((entry) => entry.key === "completion")?.score ?? 0,
        instruction:
          result.dimensions.find((entry) => entry.key === "instruction")?.score ?? 0,
        review:
          result.dimensions.find((entry) => entry.key === "review")?.score ?? 0,
        recovery:
          result.dimensions.find((entry) => entry.key === "recovery")?.score ?? 0,
      },
    });
  }

  if (!open) {
    return (
      <section
        id="agentic-round"
        aria-labelledby="agentic-round-title"
        className={cn(CARD_CLASSES, "mb-6")}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[11px] text-mute">New format</p>
            <h3
              id="agentic-round-title"
              className="mt-1 text-base font-semibold text-ink"
            >
              Agentic round
            </h3>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-body-mid">
              A mock round where the assistant takes the first pass and you stay
              responsible: write the instruction, review the plan before it runs,
              sign off on the tests, and recover when it breaks. Deterministic and
              offline — the rehearsal is about judgment, not typing.
            </p>
          </div>
        </div>

        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-body-mid">
          <li>Direct with a precise prompt</li>
          <li aria-hidden>·</li>
          <li>Catch wrong or unsafe steps</li>
          <li aria-hidden>·</li>
          <li>Verify the agent&apos;s claims</li>
          <li aria-hidden>·</li>
          <li>Diagnose the failure it reports</li>
        </ul>

        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div className="min-w-0 flex-1 sm:max-w-xs">
            <label
              htmlFor="agentic-track"
              className="text-xs font-medium text-body-mid"
            >
              Track
            </label>
            <select
              id="agentic-track"
              value={trackId}
              onChange={(event) => chooseTrack(event.target.value)}
              className="mt-1 min-h-11 w-full rounded-lg border border-hairline bg-canvas px-3 text-sm text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0 sm:py-2"
            >
              {INTERVIEW_TRACKS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.company} · {entry.role}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={startRound}
            className={PRIMARY_BUTTON_CLASSES}
          >
            Start a round
          </button>
        </div>

        <p className="mt-3 text-xs text-mute">
          {best
            ? `Best on this track's first scenario: ${best.total}/100 (${VERDICT_LABEL[best.verdict]}).`
            : "No attempts yet — the first round takes about five minutes."}
        </p>
      </section>
    );
  }

  if (!scenario) {
    return (
      <section
        id="agentic-round"
        aria-labelledby="agentic-round-title"
        className={cn(CARD_CLASSES, "mb-6")}
      >
        <h3 id="agentic-round-title" className="text-base font-semibold text-ink">
          Agentic round
        </h3>
        <p className="mt-2 text-sm text-body-mid">
          This track has no scenarios yet. Pick another track and try again.
        </p>
        <div className="mt-4">
          <button type="button" onClick={exitRound} className={SECONDARY_BUTTON_CLASSES}>
            Back to tracks
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      id="agentic-round"
      aria-labelledby="agentic-round-title"
      className={cn(CARD_CLASSES, "mb-6")}
    >
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[11px] text-mute">
            {track.company} · {track.role} · scenario {scenarioIndex + 1} of{" "}
            {scenarios.length}
          </p>
          <h3
            id="agentic-round-title"
            className="mt-1 text-base font-semibold text-ink"
          >
            Agentic round
          </h3>
        </div>
        <button
          type="button"
          onClick={exitRound}
          className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
        >
          Exit round
        </button>
      </div>

      <div className="mt-3">
        <Stepper stage={stage} />
      </div>

      <h4
        ref={stageHeadingRef}
        tabIndex={-1}
        className="mt-5 text-sm font-medium text-ink outline-none"
      >
        {stage === "instruction" && "Step 1 — Instruct the agent"}
        {stage === "plan" && "Step 2 — Review the plan"}
        {stage === "verify" && "Step 3 — Verify the report"}
        {stage === "diagnose" && "Step 4 — Diagnose and recover"}
        {stage === "results" && "Results"}
      </h4>

      {stage === "instruction" && (
        <div className="df-fade-in mt-3 space-y-4">
          <div className="rounded-lg border border-hairline bg-canvas p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] text-mute">
                {scenario.problemId}
              </span>
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                  difficultyClasses(scenario.difficulty),
                )}
              >
                {scenario.difficulty}
              </span>
              <span className="text-xs text-body-mid">{scenario.category}</span>
              <span className="rounded-full border border-hairline px-2 py-0.5 text-[10px] font-medium text-body-mid">
                {scenario.familyLabel}
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-ink">{scenario.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-body">{scenario.brief}</p>
            <p className="mt-2 text-xs text-body-mid">
              Deliverable: <span className="text-body">{scenario.deliverable}</span>
            </p>
          </div>

          <div className="rounded-lg border border-hairline bg-canvas p-3">
            <p className="text-xs font-medium text-body-mid">
              What a precise instruction covers here
            </p>
            <ul className="mt-2 space-y-1.5">
              {scenario.rubric.map((item) => (
                <li key={item.id} className="flex gap-2 text-xs text-body-mid">
                  <span aria-hidden className="text-accent">
                    •
                  </span>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <label
              htmlFor="agentic-instruction"
              className="text-sm font-medium text-ink"
            >
              Your instruction to the agent
            </label>
            <textarea
              id="agentic-instruction"
              rows={5}
              value={instruction}
              onChange={(event) => setInstruction(event.target.value)}
              placeholder="Write what to build, what must hold at the edges, and how the agent should prove it works."
              className="mt-2 w-full rounded-lg border border-hairline bg-canvas p-3 text-sm leading-relaxed text-ink placeholder:text-mute focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
            />
            <p className="mt-1.5 text-xs text-mute">
              Scored on what your prompt covers, not on length. A vague
              &quot;make it work&quot; scores low by design.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setStage("plan")}
              disabled={instruction.trim().length === 0}
              className={PRIMARY_BUTTON_CLASSES}
            >
              Review the plan
            </button>
          </div>
        </div>
      )}

      {stage === "plan" && (
        <div className="df-fade-in mt-3 space-y-4">
          <p className="text-sm leading-relaxed text-body-mid">
            The agent proposes five steps before it runs anything. Approve the
            ones you want. Reject anything that would ship a shortcut.
          </p>
          <ol className="space-y-2">
            {scenario.plan.map((step, index) => {
              const decision = plan[step.id];
              return (
                <li
                  key={step.id}
                  className="rounded-lg border border-hairline bg-canvas p-3"
                >
                  <div className="flex gap-3">
                    <span className="font-mono text-xs text-mute">{index + 1}</span>
                    <p className="min-w-0 text-sm leading-relaxed text-body">
                      {step.text}
                    </p>
                  </div>
                  <div
                    role="group"
                    aria-label={`Decision for step ${index + 1}`}
                    className="mt-3 flex flex-wrap gap-2 pl-6"
                  >
                    <button
                      type="button"
                      aria-pressed={decision === true}
                      onClick={() =>
                        setPlan((current) => ({ ...current, [step.id]: true }))
                      }
                      className={cn(
                        "min-h-11 rounded-lg border px-3 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0 sm:py-1.5",
                        decision === true
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-hairline text-body-mid hover:bg-canvas-soft hover:text-ink",
                      )}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      aria-pressed={decision === false}
                      onClick={() =>
                        setPlan((current) => ({ ...current, [step.id]: false }))
                      }
                      className={cn(
                        "min-h-11 rounded-lg border px-3 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0 sm:py-1.5",
                        decision === false
                          ? "border-warning bg-warning/10 text-warning"
                          : "border-hairline text-body-mid hover:bg-canvas-soft hover:text-ink",
                      )}
                    >
                      Reject
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setStage("instruction")}
              className={SECONDARY_BUTTON_CLASSES}
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStage("verify")}
              disabled={!planComplete}
              className={PRIMARY_BUTTON_CLASSES}
            >
              {planComplete
                ? "Let it run"
                : `Decide all ${scenario.plan.length} steps`}
            </button>
          </div>
        </div>
      )}

      {stage === "verify" && (
        <div className="df-fade-in mt-3 space-y-4">
          <AgentCallout label="Agent report">{scenario.verify.context}</AgentCallout>
          <ChoiceGroup
            choice={scenario.verify}
            name="agentic-verify"
            value={decisionOptionId}
            onChange={setDecisionOptionId}
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setStage("plan")}
              className={SECONDARY_BUTTON_CLASSES}
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStage("diagnose")}
              disabled={decisionOptionId === null}
              className={PRIMARY_BUTTON_CLASSES}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {stage === "diagnose" && (
        <div className="df-fade-in mt-3 space-y-5">
          <AgentCallout label="Test output">{scenario.diagnosis.context}</AgentCallout>
          <ChoiceGroup
            choice={scenario.diagnosis}
            name="agentic-diagnosis"
            value={diagnosisOptionId}
            onChange={setDiagnosisOptionId}
          />
          <AgentCallout label="Next">{scenario.recovery.context}</AgentCallout>
          <ChoiceGroup
            choice={scenario.recovery}
            name="agentic-recovery"
            value={recoveryOptionId}
            onChange={setRecoveryOptionId}
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setStage("verify")}
              className={SECONDARY_BUTTON_CLASSES}
            >
              Back
            </button>
            <button
              type="button"
              onClick={submitRound}
              disabled={diagnosisOptionId === null || recoveryOptionId === null}
              className={PRIMARY_BUTTON_CLASSES}
            >
              Submit round
            </button>
          </div>
        </div>
      )}

      {stage === "results" && score && (
        <div className="df-slide-up mt-3 space-y-5">
          <div className="rounded-lg border border-hairline bg-canvas p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-3xl text-ink">
                  {score.total}
                  <span className="text-base text-mute">/100</span>
                </p>
                <p className="mt-1 text-sm text-body-mid">{score.feedback}</p>
              </div>
              <span
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[10px] font-medium",
                  VERDICT_CLASSES[score.verdict],
                )}
              >
                {VERDICT_LABEL[score.verdict]}
              </span>
            </div>
            <DimensionBars score={score} />
          </div>

          <div>
            <p className="text-sm font-medium text-ink">Plan review</p>
            <ul className="mt-2 space-y-2">
              {score.detail.plan.decisions.map((decision) => (
                <li
                  key={decision.id}
                  className="rounded-lg border border-hairline bg-canvas p-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="min-w-0 flex-1 text-sm leading-relaxed text-body">
                      {decision.text}
                    </p>
                    <span
                      className={cn(
                        "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                        decision.correct
                          ? "border-accent/40 bg-accent/5 text-accent"
                          : "border-warning/40 bg-warning/5 text-warning",
                      )}
                    >
                      {decision.unsafe ? "Should reject" : "Should approve"}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-body-mid">
                    You {decision.approved ? "approved" : "rejected"} it —{" "}
                    {decision.correct ? "correct." : "that one was a miss."}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-mute">
                    {decision.note}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <ResultCallout
              title="Report decision"
              pass={score.detail.verify.pass}
              pickedText={score.detail.verify.pickedText}
              correctText={score.detail.verify.correctText}
              note={score.detail.verify.note}
            />
            <ResultCallout
              title="Failure diagnosis"
              pass={score.detail.diagnosis.pass}
              pickedText={score.detail.diagnosis.pickedText}
              correctText={score.detail.diagnosis.correctText}
              note={score.detail.diagnosis.note}
            />
            <ResultCallout
              title="Recovery action"
              pass={score.detail.recovery.pass}
              pickedText={score.detail.recovery.pickedText}
              correctText={score.detail.recovery.correctText}
              note={score.detail.recovery.note}
            />
          </div>

          <p className="text-xs text-mute">
            {attempts.length > 0
              ? `${attempts.length} recorded attempt${attempts.length === 1 ? "" : "s"} for this scenario.`
              : "This attempt has been recorded locally."}
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={nextScenario}
              className={PRIMARY_BUTTON_CLASSES}
            >
              Next scenario
            </button>
            <button
              type="button"
              onClick={retryScenario}
              className={SECONDARY_BUTTON_CLASSES}
            >
              Retry this one
            </button>
            <button
              type="button"
              onClick={exitRound}
              className={SECONDARY_BUTTON_CLASSES}
            >
              Back to tracks
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
