"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ALIBI_PUZZLES } from "@/data/alibis";
import {
  ALIBI_INPUT_MAX_CHARS,
  buildDuelHarness,
  describeOutcome,
  diffProgramLines,
  parseDuelStdout,
  pythonLiteral,
  validateAlibiInput,
  type AlibiDuelOutcome,
} from "@/lib/alibiHunt";
import type { Difficulty, TestCase } from "@/types/problem";
import { clipRepr, cn, difficultyClasses } from "@/lib/utils";

const DIFFICULTIES: readonly ("All" | Difficulty)[] = [
  "All",
  "Easy",
  "Medium",
  "Hard",
];

const ALL_CATEGORIES: readonly string[] = Array.from(
  new Set<string>(ALIBI_PUZZLES.map((entry) => entry.category)),
).sort();

const DIVERGENCE_VERDICTS: ReadonlySet<AlibiDuelOutcome["verdict"]> = new Set([
  "diverges_value",
  "diverges_error",
  "diverges_timeout",
]);

const NAV_BUTTON_CLASS =
  "inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 disabled:opacity-40 sm:min-h-0";

const CHIP_BASE =
  "rounded-full border px-2.5 py-1 text-[11px] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40";

function isDivergence(outcome: AlibiDuelOutcome): boolean {
  return DIVERGENCE_VERDICTS.has(outcome.verdict);
}

function testCall(func: string, test: TestCase): string {
  const args = test.input.map((arg) => pythonLiteral(arg)).join(", ");
  return `${func}(${args}) \u2192 ${pythonLiteral(test.expected)}`;
}

function Fact({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-mute">{label}</span>
      <code className="df-scroll overflow-x-auto whitespace-pre font-mono text-xs text-body">
        {clipRepr(value, 400)}
      </code>
    </div>
  );
}

export function AlibiHunt() {
  const [selectedId, setSelectedId] = useState<string>(
    ALIBI_PUZZLES[0]?.id ?? "",
  );
  const [difficultyFilter, setDifficultyFilter] = useState<"All" | Difficulty>(
    "All",
  );
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [outcomes, setOutcomes] = useState<Record<string, AlibiDuelOutcome>>({});
  const [witnessOutcomes, setWitnessOutcomes] = useState<
    Record<string, AlibiDuelOutcome>
  >({});
  const [found, setFound] = useState<Set<string>>(new Set());
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [attempts, setAttempts] = useState<Record<string, number>>({});
  const [inputError, setInputError] = useState<string | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "running">("idle");

  const pyRef = useRef<any>(null);
  const witnessRegionRef = useRef<HTMLDivElement | null>(null);
  const pendingWitnessFocus = useRef<string | null>(null);

  const busy = status !== "idle";

  const puzzle =
    ALIBI_PUZZLES.find((entry) => entry.id === selectedId) ?? ALIBI_PUZZLES[0];

  const visiblePuzzles = ALIBI_PUZZLES.filter(
    (entry) =>
      (difficultyFilter === "All" || entry.difficulty === difficultyFilter) &&
      (categoryFilter === "All" || entry.category === categoryFilter),
  );

  const navList = visiblePuzzles.some((entry) => entry.id === puzzle.id)
    ? visiblePuzzles
    : ALIBI_PUZZLES;
  const navIndex = navList.findIndex((entry) => entry.id === puzzle.id);
  const previous = navIndex > 0 ? navList[navIndex - 1] : null;
  const next =
    navIndex >= 0 && navIndex < navList.length - 1 ? navList[navIndex + 1] : null;

  const currentInput = inputs[puzzle.id] ?? "";
  const outcome = outcomes[puzzle.id];
  const witnessOutcome = witnessOutcomes[puzzle.id];
  const diff = diffProgramLines(puzzle.reference, puzzle.ghost);

  useEffect(() => {
    const syncFromHash = () => {
      const raw = window.location.hash.slice(1);
      if (!raw) return;
      let id = raw;
      try {
        id = decodeURIComponent(raw);
      } catch {
        id = raw;
      }
      if (ALIBI_PUZZLES.some((entry) => entry.id === id)) {
        setSelectedId(id);
        setInputError(null);
        setRunError(null);
      }
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  useEffect(() => {
    if (pendingWitnessFocus.current !== puzzle.id) return;
    if (!revealed.has(puzzle.id) || !witnessOutcomes[puzzle.id]) return;
    pendingWitnessFocus.current = null;
    witnessRegionRef.current?.focus();
  }, [puzzle.id, revealed, witnessOutcomes]);

  const selectPuzzle = (id: string) => {
    setSelectedId(id);
    setInputError(null);
    setRunError(null);
    window.history.replaceState(null, "", `#${encodeURIComponent(id)}`);
  };

  const runDuel = async (mode: "learner" | "witness") => {
    if (busy) return;
    const inputText = mode === "learner" ? currentInput : puzzle.witness;
    if (mode === "learner") {
      const verdict = validateAlibiInput(inputText);
      if (!verdict.ok) {
        setInputError(verdict.reason);
        return;
      }
    }
    setInputError(null);
    setRunError(null);
    if (mode === "witness") pendingWitnessFocus.current = puzzle.id;
    let completed = false;
    setStatus("loading");
    try {
      const { loadPyodideOnce, runCode } = await import("@/lib/pyodide");
      const py = pyRef.current ?? (await loadPyodideOnce());
      pyRef.current = py;
      setStatus("running");
      const harness = buildDuelHarness({
        reference: puzzle.reference,
        ghost: puzzle.ghost,
        func: puzzle.func,
        inputText,
      });
      const result = await runCode(py, harness);
      if (result.error) {
        setRunError(result.error);
        return;
      }
      const parsed = parseDuelStdout(result.stdout);
      if (parsed.verdict === "harness_error") {
        setRunError(describeOutcome(parsed, puzzle.func));
        return;
      }
      completed = true;
      if (mode === "learner") {
        setOutcomes((prev) => ({ ...prev, [puzzle.id]: parsed }));
        setAttempts((prev) => ({
          ...prev,
          [puzzle.id]: (prev[puzzle.id] ?? 0) + 1,
        }));
        if (isDivergence(parsed)) {
          setFound((prev) => {
            if (prev.has(puzzle.id)) return prev;
            const withFound = new Set(prev);
            withFound.add(puzzle.id);
            return withFound;
          });
        }
      } else {
        setWitnessOutcomes((prev) => ({ ...prev, [puzzle.id]: parsed }));
        setRevealed((prev) => new Set(prev).add(puzzle.id));
      }
    } catch (error) {
      setRunError(error instanceof Error ? error.message : String(error));
    } finally {
      if (!completed && pendingWitnessFocus.current === puzzle.id) {
        pendingWitnessFocus.current = null;
      }
      setStatus("idle");
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runDuel("learner");
  };

  const onInputChange = (value: string) => {
    setInputError(null);
    setInputs((prev) => ({ ...prev, [puzzle.id]: value }));
  };

  return (
    <section
      aria-label="Silent Bug Hunt"
      className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-8"
    >
      <div className="flex flex-col gap-1.5">
        <p className="max-w-3xl text-sm leading-relaxed text-body">
          Each puzzle is a Python function that passes every shipped test shown
          below and is one line away from the reference DeepForge ships. Find an
          input where the two programs diverge; the verdict is the raw fact of
          the run.
        </p>
        <p className="text-xs leading-relaxed text-body-mid">
          Practice only &mdash; nothing here affects your progress, review
          schedule, or certificates.
        </p>
        <p className="font-mono text-[11px] text-mute">
          This session: caught {found.size} of {Object.keys(attempts).length}{" "}
          tried
        </p>
      </div>

      <div className="mt-5 rounded-lg border border-hairline bg-canvas-card">
        <div className="flex flex-col gap-2.5 border-b border-hairline px-4 py-3.5 sm:px-5">
          <h2 className="text-sm font-medium text-ink">Puzzles</h2>
          <div
            role="group"
            aria-label="Filter by difficulty"
            className="flex flex-wrap items-center gap-1.5"
          >
            {DIFFICULTIES.map((option) => {
              const active = difficultyFilter === option;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setDifficultyFilter(option)}
                  className={cn(
                    CHIP_BASE,
                    "min-h-11 sm:min-h-0",
                    active
                      ? "border-accent/40 bg-accent/5 text-accent"
                      : "border-hairline text-body-mid hover:bg-canvas-soft hover:text-ink",
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>
          <div
            role="group"
            aria-label="Filter by category"
            className="df-scroll flex items-center gap-1.5 overflow-x-auto"
          >
            {["All", ...ALL_CATEGORIES].map((option) => {
              const active = categoryFilter === option;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCategoryFilter(option)}
                  className={cn(
                    CHIP_BASE,
                    "min-h-11 shrink-0 whitespace-nowrap sm:min-h-0",
                    active
                      ? "border-accent/40 bg-accent/5 text-accent"
                      : "border-hairline text-body-mid hover:bg-canvas-soft hover:text-ink",
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
        <div className="df-scroll max-h-80 overflow-y-auto p-2">
          {visiblePuzzles.length === 0 ? (
            <p className="px-2 py-6 text-center text-xs text-body-mid">
              No puzzles match these filters.
            </p>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {visiblePuzzles.map((entry) => {
                const isSelected = entry.id === puzzle.id;
                const wasFound = found.has(entry.id);
                const wasAttempted = (attempts[entry.id] ?? 0) > 0;
                return (
                  <li key={entry.id}>
                    <button
                      type="button"
                      onClick={() => selectPuzzle(entry.id)}
                      aria-current={isSelected ? "true" : undefined}
                      className={cn(
                        "flex min-h-11 w-full flex-col gap-1 rounded-md border px-2.5 py-2 text-left transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40",
                        isSelected
                          ? "border-accent/40 bg-accent/5"
                          : "border-transparent hover:bg-canvas-soft",
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span
                          aria-hidden
                          className={cn(
                            "h-1.5 w-1.5 shrink-0 rounded-full",
                            wasFound
                              ? "bg-accent"
                              : wasAttempted
                                ? "border border-hairline bg-canvas-soft"
                                : "bg-transparent",
                          )}
                        />
                        <span className="min-w-0 truncate text-xs text-ink">
                          {entry.title}
                        </span>
                        {wasFound ? (
                          <span className="sr-only">caught this session</span>
                        ) : wasAttempted ? (
                          <span className="sr-only">tried this session</span>
                        ) : null}
                      </span>
                      <span className="flex flex-wrap items-center gap-1.5 pl-3.5">
                        <span
                          className={cn(
                            "rounded-full border px-1.5 py-0.5 text-[10px]",
                            difficultyClasses(entry.difficulty),
                          )}
                        >
                          {entry.difficulty}
                        </span>
                        <span className="text-[10px] text-mute">
                          {entry.category}
                        </span>
                        <span className="font-mono text-[10px] text-mute">
                          {entry.id}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <article
        aria-labelledby={`alibi-puzzle-${puzzle.id}`}
        className="mt-4 rounded-lg border border-hairline bg-canvas-card"
      >
        <header className="flex flex-col gap-2 border-b border-hairline px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px]",
                difficultyClasses(puzzle.difficulty),
              )}
            >
              {puzzle.difficulty}
            </span>
            <span className="text-[11px] text-mute">{puzzle.category}</span>
            <span className="font-mono text-[11px] text-mute">
              {puzzle.id}
            </span>
          </div>
          <h2
            id={`alibi-puzzle-${puzzle.id}`}
            className="text-base font-semibold tracking-tight text-ink sm:text-lg"
          >
            {puzzle.title}
          </h2>
          <p className="text-xs leading-relaxed text-body-mid">
            This program passes all {puzzle.tests.length} shipped tests. Find an
            input where it diverges from the reference DeepForge ships.
          </p>
        </header>

        <section aria-label="Program under inspection">
          <div className="flex items-baseline justify-between gap-2 border-b border-hairline px-4 py-2 sm:px-5">
            <h3 className="text-xs font-medium text-body-mid">
              Program under inspection
            </h3>
            <span className="text-[11px] text-mute">read-only</span>
          </div>
          <pre
            tabIndex={0}
            role="region"
            aria-label="Program under inspection (read-only, scrollable)"
            className="df-code-editor df-scroll max-h-80 overflow-auto px-4 py-3 text-body"
          >
            {puzzle.ghost}
          </pre>
        </section>

        <section
          aria-label="Shipped tests"
          className="border-t border-hairline"
        >
          <h3 className="px-4 pt-3 text-xs font-medium text-body-mid sm:px-5">
            Passes all {puzzle.tests.length} shipped tests
          </h3>
          <div
            tabIndex={0}
            role="region"
            aria-label="Shipped tests (scrollable)"
            className="df-scroll mx-4 my-3 max-h-56 overflow-auto rounded-md border border-hairline bg-canvas-soft p-2.5 sm:mx-5"
          >
            <ul className="flex flex-col gap-1.5">
              {puzzle.tests.map((test, index) => (
                <li
                  key={index}
                  className="whitespace-pre font-mono text-[11px] leading-relaxed text-body"
                >
                  {testCall(puzzle.func, test)}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <form
          onSubmit={onSubmit}
          className="border-t border-hairline px-4 py-4 sm:px-5"
        >
          <label
            htmlFor="alibi-input"
            className="mb-1.5 block text-xs font-medium text-body-mid"
          >
            Your input &mdash; one Python literal
          </label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              id="alibi-input"
              name="alibi-input"
              type="text"
              value={currentInput}
              onChange={(event) => onInputChange(event.target.value)}
              maxLength={ALIBI_INPUT_MAX_CHARS}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
              placeholder="e.g. [1, 2, 3]"
              aria-describedby="alibi-input-hint"
              className="df-code-editor w-full rounded-lg border border-hairline bg-canvas-soft px-3 py-2 text-ink placeholder:text-mute focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-accent/40"
            />
            <button
              type="submit"
              disabled={busy}
              aria-busy={busy}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-canvas transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50 sm:min-h-0"
            >
              {busy && (
                <span
                  aria-hidden
                  className="df-spin h-3 w-3 shrink-0 rounded-full border-2 border-canvas/40 border-t-canvas"
                />
              )}
              {status === "loading"
                ? "Loading Python\u2026"
                : status === "running"
                  ? "Running\u2026"
                  : "Run my input"}
            </button>
          </div>
          <p
            id="alibi-input-hint"
            className="mt-1.5 text-[11px] leading-snug text-mute"
          >
            Runs locally in your browser with Python. Up to{" "}
            {ALIBI_INPUT_MAX_CHARS} characters; nothing is saved.
          </p>
          {inputError && (
            <p className="mt-1.5 text-[11px] leading-snug text-warning">
              {inputError}
            </p>
          )}
        </form>

        <section
          aria-label="Run result"
          className="border-t border-hairline px-4 py-4 sm:px-5"
        >
          <h3 className="text-xs font-medium text-body-mid">Result</h3>
          <div aria-live="polite" className="mt-2 flex flex-col gap-3">
            {busy && (
              <p className="text-xs leading-snug text-body-mid">
                {status === "loading"
                  ? "Loading Python (~10 MB, cached after first run)\u2026"
                  : "Running the duel locally\u2026"}
              </p>
            )}
            {runError && (
              <div className="df-fade-in">
                <p className="text-sm leading-relaxed text-body">
                  The duel did not finish in this browser session. Try running
                  again.
                </p>
                <pre className="df-scroll mt-1.5 overflow-x-auto whitespace-pre rounded-md border border-hairline bg-canvas-soft p-2.5 font-mono text-[11px] leading-relaxed text-mute">
                  {clipRepr(runError, 400)}
                </pre>
              </div>
            )}
            {outcome && !busy && (
              <div className="df-fade-in flex flex-col gap-2">
                {isDivergence(outcome) ? (
                  <>
                    <p className="text-sm font-medium text-accent">
                      Caught one.
                    </p>
                    <p className="text-sm leading-relaxed text-body">
                      {describeOutcome(outcome, puzzle.func)}
                    </p>
                    <div className="rounded-md border border-hairline bg-canvas-soft p-2.5">
                      <p className="mb-1 text-[10px] text-mute">
                        The changed line
                      </p>
                      <pre
                        tabIndex={0}
                        role="region"
                        aria-label="Changed line between the shipped reference and this program"
                        className="df-scroll overflow-x-auto whitespace-pre font-mono text-xs leading-relaxed"
                      >
                        {diff.removed.map((line, index) => (
                          <span
                            key={`removed-${index}`}
                            className="block text-error"
                          >{`- ${line}`}</span>
                        ))}
                        {diff.added.map((line, index) => (
                          <span
                            key={`added-${index}`}
                            className="block text-accent"
                          >{`+ ${line}`}</span>
                        ))}
                      </pre>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm leading-relaxed text-body">
                      {describeOutcome(outcome, puzzle.func)}
                    </p>
                    <div className="flex flex-col gap-1.5 rounded-md border border-hairline bg-canvas-soft p-2.5">
                      <Fact label="reference" value={outcome.ref} />
                      <Fact label="this program" value={outcome.ghost} />
                    </div>
                    <p className="text-xs leading-snug text-body-mid">
                      Try another input &mdash; the field above stays as you left
                      it.
                    </p>
                  </>
                )}
              </div>
            )}
            {!outcome && !busy && !runError && (
              <p className="text-xs leading-snug text-body-mid">
                No run yet. Type a literal and press Run; the raw result appears
                here.
              </p>
            )}
          </div>
          {found.has(puzzle.id) && !revealed.has(puzzle.id) && (
            <div className="mt-3 flex flex-col gap-2 border-t border-hairline pt-3">
              <p className="text-xs leading-snug text-body-mid">
                You caught this one this session. The stored witness is an input
                that was validated offline to diverge.
              </p>
              <button
                type="button"
                onClick={() => void runDuel("witness")}
                disabled={busy}
                className="inline-flex min-h-11 w-fit items-center rounded-lg border border-accent/40 bg-accent/5 px-3.5 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 disabled:opacity-50 sm:min-h-0"
              >
                Show me the stored witness
              </button>
            </div>
          )}
          {revealed.has(puzzle.id) && (
            <div
              ref={witnessRegionRef}
              tabIndex={-1}
              className="df-fade-in mt-3 border-t border-hairline pt-3 focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-accent/40"
            >
              <h3 className="text-xs font-medium text-body-mid">
                Stored witness
              </h3>
              <pre
                tabIndex={0}
                role="region"
                aria-label="Stored witness (scrollable)"
                className="df-code-editor df-scroll mt-1.5 overflow-x-auto whitespace-pre rounded-md border border-hairline bg-canvas-soft px-2.5 py-2 text-body"
              >
                {puzzle.witness}
              </pre>
              {witnessOutcome ? (
                <>
                  <p className="mt-2 text-sm leading-relaxed text-body">
                    {describeOutcome(witnessOutcome, puzzle.func)}
                  </p>
                  <div className="mt-2 flex flex-col gap-1.5 rounded-md border border-hairline bg-canvas-soft p-2.5">
                    <Fact label="reference" value={witnessOutcome.ref} />
                    <Fact label="this program" value={witnessOutcome.ghost} />
                  </div>
                </>
              ) : (
                <p className="mt-2 text-xs leading-snug text-body-mid">
                  Running the stored witness&hellip;
                </p>
              )}
            </div>
          )}
        </section>

        <div className="flex items-center justify-between gap-2 border-t border-hairline px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={() => previous && selectPuzzle(previous.id)}
            disabled={!previous}
            className={NAV_BUTTON_CLASS}
          >
            <span aria-hidden>&larr;</span> Previous
          </button>
          <span className="font-mono text-[11px] text-mute">
            {navIndex + 1} / {navList.length}
          </span>
          <button
            type="button"
            onClick={() => next && selectPuzzle(next.id)}
            disabled={!next}
            className={NAV_BUTTON_CLASS}
          >
            Next <span aria-hidden>&rarr;</span>
          </button>
        </div>
      </article>
    </section>
  );
}
