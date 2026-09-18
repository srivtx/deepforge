"use client";

import { useState } from "react";
import {
  KEYFUSE_DEFAULT_STRENGTH,
  KEYFUSE_EXACT_MAX_ROWS,
  KEYFUSE_MAX_STRENGTH,
  auditTask,
  createVirtualOracle,
  hammingBallSize,
  type AuditResult,
  type ProbeStrategy,
  type VirtualTask,
} from "@/lib/keyfuse";
import { KEYFUSE_TASKS, getKeyFuseTask } from "@/lib/keyfuse/tasks";
import { ProbeMatrix } from "./ProbeMatrix";
import { WitnessPanel } from "./WitnessPanel";

const INTRO =
  "KeyFuse probes a task's declared inputs to find which undeclared slots its output actually depends on, then prints a minimal same-key / different-output witness and a repaired key built from everything it detected.";

const DEFAULT_TASK_ID = "metro-env-1";
const RESULT_HEADING_ID = "keyfuse-result-heading";

const FAMILY_BY_TASK: Readonly<Record<string, string>> = {
  "metro-env-1": "Combo env",
  "metro-env-2": "Combo env",
  "metro-file-gate": "Combo env",
  "and-2way": "Planted 2-way",
  "xor-2way": "Planted 2-way",
  "and-3way": "Planted 3-way",
  "maj-3way": "Planted 3-way",
  "and-xor-c": "Masking",
  "or-and-not": "Masking",
  "or-threshold": "Monotone",
  "max-threshold": "Monotone",
  "and-chain": "Monotone",
  "threshold-3": "Anchor",
  "port-8080": "Value-specific",
  "undeclared-secret": "Env only",
  "combo-with-file": "Env only",
  "cwd-dependent": "Cwd",
  "locale-tz": "Locale and timezone",
  "epoch-gated": "Clock",
  "seed-gated": "Rng",
  "nondeterministic-counter": "Negative controls",
  "untrappable-ambient": "Negative controls",
  "no-dependence": "Controls",
  "all-declared": "Controls",
};

interface TaskGroup {
  readonly family: string;
  readonly tasks: readonly VirtualTask[];
}

const TASK_GROUPS: readonly TaskGroup[] = (() => {
  const order: string[] = [];
  const grouped = new Map<string, VirtualTask[]>();
  for (const task of KEYFUSE_TASKS) {
    const family = FAMILY_BY_TASK[task.id] ?? "Other";
    const existing = grouped.get(family);
    if (existing) {
      existing.push(task);
    } else {
      grouped.set(family, [task]);
      order.push(family);
    }
  }
  return order.map((family) => ({ family, tasks: grouped.get(family) ?? [] }));
})();

const STRATEGIES: readonly {
  readonly value: ProbeStrategy;
  readonly label: string;
}[] = [
  {
    value: "cover-with-defaults",
    label: "cover-with-defaults — exact (within budget)",
  },
  { value: "ca-ddmin", label: "ca-ddmin — conservative fallback" },
  { value: "ca", label: "ca" },
  { value: "baseline-toggle", label: "baseline-toggle" },
  { value: "single-trace", label: "single-trace" },
];

const STRENGTHS: readonly number[] = Array.from(
  { length: KEYFUSE_MAX_STRENGTH },
  (_, index) => index + 1,
);

const SELECT_CLASS =
  "min-h-11 w-full rounded-lg border border-hairline bg-canvas-soft px-3 py-2 font-mono text-xs text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40";

export function KeyFuseLab() {
  const [taskId, setTaskId] = useState<string>(DEFAULT_TASK_ID);
  const [strategy, setStrategy] =
    useState<ProbeStrategy>("cover-with-defaults");
  const [strength, setStrength] = useState<number>(KEYFUSE_DEFAULT_STRENGTH);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [runError, setRunError] = useState<string | null>(null);

  const task = getKeyFuseTask(taskId) ?? KEYFUSE_TASKS[0];
  const exactRows = hammingBallSize(task.universe, strength);
  const exactFits = exactRows <= KEYFUSE_EXACT_MAX_ROWS;
  const runnable = strategy !== "cover-with-defaults" || exactFits;
  const resultTask = result
    ? (getKeyFuseTask(result.task) ?? null)
    : null;

  const onRun = () => {
    if (!runnable) return;
    try {
      const next = auditTask(task, createVirtualOracle(task), {
        strategy,
        strength,
      });
      setRunError(null);
      setResult(next);
    } catch (error) {
      setResult(null);
      setRunError(error instanceof Error ? error.message : String(error));
    }
    document.getElementById(RESULT_HEADING_ID)?.focus();
  };

  return (
    <section
      aria-label="KeyFuse cache-key auditor"
      className="mx-auto w-full max-w-6xl px-4 pb-4 pt-6 sm:px-6 sm:pb-6 sm:pt-8"
    >
      <div className="flex flex-col gap-3 rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
        <p className="max-w-3xl text-sm leading-relaxed text-body">{INTRO}</p>
        <p className="max-w-3xl text-xs leading-relaxed text-body-mid">
          Everything runs in this browser over the frozen 24-task corpus: no
          storage, no network, no grading. Pick a task, a strategy, and a
          strength, then run.
        </p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          onRun();
        }}
        className="mt-4 rounded-lg border border-hairline bg-canvas-card"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-hairline px-4 py-3 sm:px-5">
          <h2 className="text-sm font-medium text-ink">Probe setup</h2>
          <span className="font-mono text-[10px] text-mute">
            {task.id} · {task.universe.slots.length} slots ·{" "}
            {task.declared.length} declared
          </span>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-5">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="keyfuse-task"
              className="text-xs font-medium text-body-mid"
            >
              Task
            </label>
            <select
              id="keyfuse-task"
              value={taskId}
              onChange={(event) => setTaskId(event.target.value)}
              className={SELECT_CLASS}
            >
              {TASK_GROUPS.map((group) => (
                <optgroup key={group.family} label={group.family}>
                  {group.tasks.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.id} · {entry.universe.slots.length} slots
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="keyfuse-strategy"
              className="text-xs font-medium text-body-mid"
            >
              Strategy
            </label>
            <select
              id="keyfuse-strategy"
              value={strategy}
              onChange={(event) =>
                setStrategy(event.target.value as ProbeStrategy)
              }
              className={SELECT_CLASS}
            >
              {STRATEGIES.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={
                    option.value === "cover-with-defaults" && !exactFits
                  }
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="keyfuse-strength"
              className="text-xs font-medium text-body-mid"
            >
              Strength
            </label>
            <select
              id="keyfuse-strength"
              value={strength}
              onChange={(event) => setStrength(Number(event.target.value))}
              className={SELECT_CLASS}
            >
              {STRENGTHS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>
        {!exactFits && (
          <p className="border-t border-hairline px-4 py-3 text-xs leading-relaxed text-body-mid sm:px-5">
            The exact arm would need {exactRows} rows for this task at strength{" "}
            {strength}, above the {KEYFUSE_EXACT_MAX_ROWS}-row budget, so it is
            unavailable here. Use ca-ddmin or lower the strength.
          </p>
        )}
        <div className="flex flex-col gap-2 border-t border-hairline px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <button
            type="submit"
            disabled={!runnable}
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-canvas transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50 sm:min-h-0"
          >
            Run audit
          </button>
          <p className="text-[11px] leading-snug text-mute">
            Synchronous probes over the sampled slot universe; the result
            appears below.
          </p>
        </div>
      </form>

      <section className="mt-4 rounded-lg border border-hairline bg-canvas-card">
        <div className="border-b border-hairline px-4 py-2.5 sm:px-5">
          <h2
            id={RESULT_HEADING_ID}
            tabIndex={-1}
            className="text-xs font-medium text-body-mid focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
          >
            Audit result
          </h2>
        </div>
        <div
          aria-live="polite"
          className="flex flex-col gap-3 px-4 py-4 sm:px-5"
        >
          {runError && (
            <p className="text-sm leading-relaxed text-body">
              The audit did not run:{" "}
              <span className="font-mono text-xs text-body-mid">
                {runError}
              </span>
            </p>
          )}
          {!result && !runError && (
            <p className="text-xs leading-snug text-body-mid">
              No audit yet. Pick a task, strategy, and strength, then press Run
              audit.
            </p>
          )}
          {result && resultTask && result.probes.length > 0 && (
            <ProbeMatrix universe={resultTask.universe} rows={result.probes} />
          )}
          <WitnessPanel result={result} />
        </div>
      </section>
    </section>
  );
}
