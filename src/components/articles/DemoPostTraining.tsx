"use client";

import { useMemo, useState } from "react";
import { type DemoProps } from "@/lib/articles-demos";

/* ---------------------------------- math --------------------------------- */

export type Algo = "sft" | "dpo" | "grpo";

export function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export function softmax(logits: number[]): number[] {
  const m = Math.max(...logits);
  const exps = logits.map((z) => Math.exp(z - m));
  const sum = exps.reduce((s, x) => s + x, 0);
  return exps.map((x) => x / sum);
}

export interface DpoResult {
  margin: number;
  loss: number;
  winProb: number;
}

export function dpoMetrics(
  logpChosen: number,
  logpRejected: number,
  refChosen: number,
  refRejected: number,
  beta: number,
  useReference: boolean,
): DpoResult {
  const chosen = logpChosen - (useReference ? refChosen : 0);
  const rejected = logpRejected - (useReference ? refRejected : 0);
  const margin = beta * (chosen - rejected);
  return {
    margin,
    loss: Math.log1p(Math.exp(-margin)),
    winProb: sigmoid(margin),
  };
}

export function grpoAdvantages(rewards: number[]): number[] {
  const mean = rewards.reduce((s, r) => s + r, 0) / rewards.length;
  const variance =
    rewards.reduce((s, r) => s + (r - mean) ** 2, 0) / rewards.length;
  const std = Math.sqrt(variance);
  return rewards.map((r) => (std < 1e-9 ? 0 : (r - mean) / std));
}

export const POLICY_ACTIONS = ["opt-1", "opt-2", "opt-3", "opt-4", "opt-5"];
export const CORRECT_ACTION = 3;
export const PREFERRED_ACTION = 2;
export const REJECTED_ACTION = 0;
export const GRPO_GROUP_ACTIONS = [2, 0, 3, 1];
export const VERIFIABLE_REWARDS = [1, 0, 1, 0];
export const LEARNED_REWARDS = [0.62, 0.28, 0.55, 0.41];

export interface UpdateOptions {
  preferred: number;
  rejected: number;
  groupActions: number[];
  advantages: number[];
}

export function policyUpdate(
  logits: number[],
  algo: Algo,
  lr: number,
  options: UpdateOptions,
): number[] {
  const pi = softmax(logits);
  if (algo === "sft") {
    return logits.map(
      (z, i) => z + lr * ((i === CORRECT_ACTION ? 1 : 0) - pi[i]),
    );
  }
  if (algo === "dpo") {
    const margin =
      Math.log(pi[options.preferred]) - Math.log(pi[options.rejected]);
    const scale = 1 - sigmoid(margin);
    return logits.map(
      (z, i) =>
        z +
        lr *
          scale *
          ((i === options.preferred ? 1 : 0) - (i === options.rejected ? 1 : 0)),
    );
  }
  const next = [...logits];
  options.groupActions.forEach((action, rollout) => {
    const advantage = options.advantages[rollout];
    for (let i = 0; i < next.length; i++) {
      next[i] += lr * advantage * ((i === action ? 1 : 0) - pi[i]);
    }
  });
  return next;
}

/* ---------------------------------- ui ----------------------------------- */

const INITIAL_LOGITS = [0.6, 0.2, 0, -0.2, -0.6];
const STEP_LR = 0.25;

function LogProbCard({
  label,
  role,
  probs,
  setProbs,
  accent,
  danger,
}: {
  label: string;
  role: string;
  probs: number[];
  setProbs: (next: number[]) => void;
  accent: boolean;
  danger: boolean;
}) {
  const tokens = ["The", "answer", "is"];
  const total = probs.reduce((s, p) => s + p, 0);
  return (
    <div
      className={
        accent
          ? "rounded-lg border border-accent/40 bg-accent/5 px-3 py-2.5"
          : danger
            ? "rounded-lg border border-error/40 bg-error/5 px-3 py-2.5"
            : "rounded-lg border border-hairline bg-canvas px-3 py-2.5"
      }
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className={accent ? "text-xs font-medium text-accent" : "text-xs font-medium text-ink"}>
          {label}
        </span>
        <span className="font-mono text-[9.5px] text-mute">{role}</span>
      </div>
      {probs.map((value, i) => (
        <div key={tokens[i]} className="mt-1.5 flex items-center gap-2">
          <span className="w-14 shrink-0 font-mono text-[10px] text-body-mid">
            {tokens[i]}
          </span>
          <input
            type="range"
            min={-3}
            max={-0.05}
            step={0.01}
            value={value}
            onChange={(e) => {
              const next = [...probs];
              next[i] = Number(e.target.value);
              setProbs(next);
            }}
            aria-label={`${label} log probability of ${tokens[i]}`}
            aria-valuetext={value.toFixed(2)}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-canvas-soft"
            style={{ accentColor: "var(--accent)" }}
          />
          <span className="w-11 shrink-0 text-right font-mono text-[10px] text-ink">
            {value.toFixed(2)}
          </span>
        </div>
      ))}
      <div className="mt-1.5 flex justify-between border-t border-hairline pt-1 font-mono text-[10px]">
        <span className="text-mute">&Sigma; log p</span>
        <span className="text-ink">{total.toFixed(2)}</span>
      </div>
    </div>
  );
}

export function PostTrainingDemo(_props: DemoProps) {
  const [chosen, setChosen] = useState<"A" | "B">("A");
  const [logpA, setLogpA] = useState([-0.42, -0.88, -0.31]);
  const [logpB, setLogpB] = useState([-0.71, -1.24, -0.52]);
  const [useReference, setUseReference] = useState(true);
  const [beta, setBeta] = useState(0.35);
  const [algo, setAlgo] = useState<Algo>("dpo");
  const [verifiable, setVerifiable] = useState(true);
  const [logits, setLogits] = useState(INITIAL_LOGITS);
  const [updates, setUpdates] = useState(0);

  const sumA = logpA.reduce((s, p) => s + p, 0);
  const sumB = logpB.reduce((s, p) => s + p, 0);
  const chosenSum = chosen === "A" ? sumA : sumB;
  const rejectedSum = chosen === "A" ? sumB : sumA;
  const refChosen = chosen === "A" ? -2.35 : -1.75;
  const refRejected = chosen === "A" ? -1.75 : -2.35;

  const dpo = dpoMetrics(
    chosenSum,
    rejectedSum,
    refChosen,
    refRejected,
    beta,
    useReference,
  );

  const rewards = verifiable ? VERIFIABLE_REWARDS : LEARNED_REWARDS;
  const advantages = useMemo(() => grpoAdvantages(rewards), [rewards]);
  const pi = useMemo(() => softmax(logits), [logits]);

  const step = () => {
    setLogits((prev) =>
      policyUpdate(prev, algo, STEP_LR, {
        preferred: PREFERRED_ACTION,
        rejected: REJECTED_ACTION,
        groupActions: GRPO_GROUP_ACTIONS,
        advantages,
      }),
    );
    setUpdates((n) => n + 1);
  };

  const resetPolicy = () => {
    setLogits(INITIAL_LOGITS);
    setUpdates(0);
  };

  const toggleClasses = (active: boolean) =>
    active
      ? "min-h-11 rounded-lg bg-accent px-2.5 py-1 text-xs font-medium text-canvas focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0"
      : "min-h-11 rounded-lg border border-hairline px-2.5 py-1 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0";

  const secondary =
    "rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink";

  const BAR_X = 70;
  const BAR_MAX = 640;
  const BAR_W = (BAR_MAX - BAR_X) / 5;
  const BAR_BASE = 130;
  const BAR_TOP = 18;

  const algoNote =
    algo === "sft"
      ? "cross-entropy push toward the demonstrated action"
      : algo === "dpo"
        ? "margin-aware push toward preferred, away from rejected"
        : verifiable
          ? "exact checker rewards; group mean is the baseline"
          : "learned reward model; group mean is the baseline";

  const status =
    `Pair: ${chosen} is chosen. Implicit reward margin ${dpo.margin.toFixed(3)}, DPO loss ${dpo.loss.toFixed(3)}, ` +
    `P(chosen \u227B rejected) = ${dpo.winProb.toFixed(3)}${useReference ? " with the reference policy" : " without the reference"}. ` +
    `Policy update ${updates}: ${algo.toUpperCase()} \u2014 ${algoNote}. ` +
    `\u03C0(correct action 4) = ${pi[CORRECT_ACTION].toFixed(3)}.` +
    (algo === "grpo"
      ? ` Group rewards ${rewards.map((r) => r.toFixed(2)).join(", ")}; advantages ${advantages.map((a) => a.toFixed(2)).join(", ")}.`
      : "");

  return (
    <figure className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
      <figcaption className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold text-ink">
          Score the pair, then move the policy
        </span>
        <span className="flex gap-1" role="group" aria-label="Chosen response">
          <button
            type="button"
            aria-pressed={chosen === "A"}
            onClick={() => setChosen("A")}
            className={toggleClasses(chosen === "A")}
          >
            A chosen
          </button>
          <button
            type="button"
            aria-pressed={chosen === "B"}
            onClick={() => setChosen("B")}
            className={toggleClasses(chosen === "B")}
          >
            B chosen
          </button>
        </span>
      </figcaption>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <LogProbCard
          label="Response A"
          role={chosen === "A" ? "y_w \u00b7 chosen" : "y_l \u00b7 rejected"}
          probs={logpA}
          setProbs={setLogpA}
          accent={chosen === "A"}
          danger={chosen === "B"}
        />
        <LogProbCard
          label="Response B"
          role={chosen === "B" ? "y_w \u00b7 chosen" : "y_l \u00b7 rejected"}
          probs={logpB}
          setProbs={setLogpB}
          accent={chosen === "B"}
          danger={chosen === "A"}
        />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
        <div className="rounded-lg border border-hairline bg-canvas px-3 py-2.5">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <label className="flex items-center gap-2 text-xs text-body-mid">
              &beta;
              <input
                type="range"
                min={0.05}
                max={1}
                step={0.05}
                value={beta}
                onChange={(e) => setBeta(Number(e.target.value))}
                aria-label="DPO beta"
                aria-valuetext={`beta ${beta.toFixed(2)}`}
                className="h-1.5 w-32 cursor-pointer appearance-none rounded-full bg-canvas-soft"
                style={{ accentColor: "var(--accent)" }}
              />
              <span className="w-9 font-mono text-[11px] text-ink">
                {beta.toFixed(2)}
              </span>
            </label>
            <button
              type="button"
              aria-pressed={useReference}
              onClick={() => setUseReference((v) => !v)}
              className={toggleClasses(useReference)}
            >
              Reference policy
            </button>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 font-mono text-[10.5px]">
            <div>
              <span className="block text-[9px] uppercase tracking-wide text-mute">
                margin
              </span>
              <span className={dpo.margin >= 0 ? "text-accent" : "text-warning"}>
                {dpo.margin.toFixed(3)}
              </span>
            </div>
            <div>
              <span className="block text-[9px] uppercase tracking-wide text-mute">
                DPO loss
              </span>
              <span className="text-ink">{dpo.loss.toFixed(3)}</span>
            </div>
            <div>
              <span className="block text-[9px] uppercase tracking-wide text-mute">
                P(chosen &#8827;)
              </span>
              <span className="text-ink">{dpo.winProb.toFixed(3)}</span>
            </div>
          </div>
          <svg
            role="img"
            aria-label={`Implicit reward margin of ${dpo.margin.toFixed(3)} maps to a chosen-response probability of ${dpo.winProb.toFixed(3)}.`}
            viewBox="0 0 340 34"
            className="mt-2 w-full"
          >
            <line x1={10} y1={20} x2={330} y2={20} className="stroke-hairline" strokeWidth="1.5" />
            <line x1={170} y1={12} x2={170} y2={28} className="stroke-mute" />
            <text x={10} y={32} className="fill-mute text-[8px] font-mono">
              &minus;4
            </text>
            <text x={330} y={32} textAnchor="end" className="fill-mute text-[8px] font-mono">
              +4
            </text>
            <circle
              cx={170 + (dpo.margin / 4) * 160}
              cy={20}
              r={4.5}
              className="fill-accent"
            />
            <text
              x={170 + (dpo.margin / 4) * 160}
              y={12}
              textAnchor="middle"
              className="fill-accent text-[8.5px] font-mono"
            >
              z = &beta;(log &pi;&#119908; &minus; log &pi;&#8467;)
            </text>
          </svg>
        </div>

        <div className="flex flex-col gap-1.5 rounded-lg border border-hairline bg-canvas px-3 py-2.5 sm:w-44">
          <span className="text-[10px] uppercase tracking-wide text-mute">
            offline vs online
          </span>
          <p className="text-[11px] leading-relaxed text-body-mid">
            DPO needs only fixed preference pairs. GRPO samples a fresh group
            and scores it with a checker.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="flex gap-1" role="group" aria-label="Update rule">
          {(["sft", "dpo", "grpo"] as const).map((a) => (
            <button
              key={a}
              type="button"
              aria-pressed={algo === a}
              onClick={() => setAlgo(a)}
              className={toggleClasses(algo === a)}
            >
              {a.toUpperCase()}
            </button>
          ))}
        </span>
        <button
          type="button"
          aria-pressed={verifiable}
          onClick={() => setVerifiable((v) => !v)}
          className={toggleClasses(verifiable)}
        >
          Verifiable reward
        </button>
        <span className="flex gap-2 sm:ml-auto">
          <button
            type="button"
            onClick={step}
            className="rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-canvas transition-opacity hover:opacity-90"
          >
            Step update
          </button>
          <button type="button" onClick={resetPolicy} className={secondary}>
            Reset policy
          </button>
        </span>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px]">
        <svg
          role="img"
          aria-label={`Policy distribution over five actions after ${updates} updates. ${POLICY_ACTIONS.map((a, i) => `${a} ${(pi[i] * 100).toFixed(0)} percent`).join(", ")}.`}
          viewBox="0 0 660 160"
          className="w-full"
        >
          <line x1={BAR_X - 10} y1={BAR_BASE} x2={BAR_MAX + 10} y2={BAR_BASE} className="stroke-hairline" strokeWidth="1.5" />
          {pi.map((p, i) => {
            const h = p * (BAR_BASE - BAR_TOP);
            const highlight = i === CORRECT_ACTION;
            const lowlight = i === REJECTED_ACTION;
            return (
              <g key={POLICY_ACTIONS[i]}>
                <rect
                  x={BAR_X + i * BAR_W + 8}
                  y={BAR_BASE - h}
                  width={BAR_W - 16}
                  height={Math.max(2, h)}
                  rx={3}
                  className={
                    highlight
                      ? "fill-accent/80"
                      : lowlight
                        ? "fill-error/60"
                        : "fill-info/50"
                  }
                />
                <text
                  x={BAR_X + i * BAR_W + BAR_W / 2}
                  y={BAR_BASE + 15}
                  textAnchor="middle"
                  className={
                    highlight ? "fill-accent text-[9.5px] font-mono" : "fill-body-mid text-[9.5px] font-mono"
                  }
                >
                  {POLICY_ACTIONS[i]}
                </text>
                <text
                  x={BAR_X + i * BAR_W + BAR_W / 2}
                  y={BAR_BASE - h - 5}
                  textAnchor="middle"
                  className="fill-ink text-[9px] font-mono"
                >
                  {(p * 100).toFixed(0)}%
                </text>
              </g>
            );
          })}
          <text x={BAR_X} y={12} className="fill-mute text-[9px] font-mono">
            action 4 = correct &middot; action 1 = rejected
          </text>
          <text x={BAR_MAX} y={12} textAnchor="end" className="fill-body-mid text-[9px] font-mono">
            updates: {updates}
          </text>
        </svg>

        <div
          className={
            algo === "grpo"
              ? "rounded-lg border border-hairline bg-canvas px-3 py-2.5"
              : "rounded-lg border border-hairline bg-canvas px-3 py-2.5 opacity-40"
          }
        >
          <span className="text-[10px] uppercase tracking-wide text-mute">
            GRPO group &middot; G = 4
          </span>
          <table className="mt-1 w-full font-mono text-[10px]">
            <thead>
              <tr className="text-mute">
                <th className="text-left font-normal">roll</th>
                <th className="text-right font-normal">action</th>
                <th className="text-right font-normal">r</th>
                <th className="text-right font-normal">adv</th>
              </tr>
            </thead>
            <tbody>
              {GRPO_GROUP_ACTIONS.map((action, i) => (
                <tr key={i} className="text-ink">
                  <td className="text-left">{i + 1}</td>
                  <td className="text-right">{POLICY_ACTIONS[action]}</td>
                  <td className="text-right">{rewards[i].toFixed(2)}</td>
                  <td
                    className={
                      advantages[i] >= 0 ? "text-right text-accent" : "text-right text-error"
                    }
                  >
                    {advantages[i] >= 0 ? "+" : ""}
                    {advantages[i].toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-1.5 text-[9.5px] leading-relaxed text-body-mid">
            {verifiable
              ? "checker reward: exact match, 0 or 1"
              : "reward model: learned scores, no checker"}
          </p>
        </div>
      </div>

      <p
        role="status"
        aria-live="polite"
        className="mt-3 text-xs leading-relaxed text-body-mid"
      >
        {status}
      </p>
    </figure>
  );
}
