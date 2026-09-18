"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import {
  BDL_HARNESS_VERSION,
  BDL_RUNTIME_BASIS_CAP,
  basisFingerprint,
  bdlDelta,
  bdlVerdict,
  buildBdlBasis,
  buildBdlHarness,
  describeBdlVerdict,
  hashBdlText,
  parseBdlStdout,
  type BdlRunResult,
  type BdlVerdict,
} from "@/lib/bdl";
import {
  BDL_CHANGE_EVENT,
  BDL_SHELF_CHANGE_EVENT,
  BDL_SHELF_MAX_PER_PROBLEM,
  BDL_SHELF_MAX_SOURCE_CHARS,
  getBdlLedger,
  getBdlRecord,
  getBdlShelf,
  isBdlEnabled,
  recordBdlAttempt,
  removeBdlSource,
  saveBdlSource,
  setBdlEnabled,
  type BdlSavedSource,
} from "@/lib/bdlStore";
import { getProblemProgress } from "@/lib/progress";
import type { Problem } from "@/types/problem";
import { cn, difficultyClasses } from "@/lib/utils";

export type BdlProblemPayload = Pick<
  Problem,
  | "id"
  | "title"
  | "category"
  | "difficulty"
  | "description"
  | "starterCode"
  | "solution"
  | "testCases"
>;

const ENABLE_LABEL = "Turn on the Ledger on this device.";
const CAVEAT =
  "The hidden checks are a sample; an edit can still matter without changing them.";
const PROGRESS_CHANGE_EVENT = "deepforge:progress-change";

const SECONDARY_BUTTON =
  "inline-flex min-h-11 items-center rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 disabled:opacity-40 sm:min-h-0";

const SHELF_KB = Math.round(BDL_SHELF_MAX_SOURCE_CHARS / 1024);

interface BdlReport {
  readonly kind: "baseline" | "delta";
  readonly text: string;
  readonly verdict: BdlVerdict | null;
  readonly n: number;
  readonly sig: string;
  readonly mask: string;
  readonly hash: string;
  readonly saved: boolean;
}

interface WorkspaceView {
  readonly enabled: boolean;
  readonly shelf: readonly BdlSavedSource[];
  readonly recordBasis: string | null;
  readonly savedCode: string | null;
}

const EMPTY_WORKSPACE: WorkspaceView = {
  enabled: false,
  shelf: [],
  recordBasis: null,
  savedCode: null,
};

let cachedWorkspace: WorkspaceView | null = null;
let cachedWorkspaceId = "";
let cachedWorkspaceKey = "";

function readWorkspace(problemId: string): WorkspaceView {
  const enabled = isBdlEnabled();
  const shelf = getBdlShelf(problemId);
  const record = getBdlLedger().problems[problemId];
  const savedCode = getProblemProgress(problemId).savedCode ?? null;
  const key = JSON.stringify({
    problemId,
    enabled,
    basis: record?.basis ?? null,
    savedCode,
    shelf: shelf.map((source) => `${source.id}@${source.at}`),
  });
  if (cachedWorkspace && cachedWorkspaceId === problemId && cachedWorkspaceKey === key) {
    return cachedWorkspace;
  }
  cachedWorkspaceId = problemId;
  cachedWorkspaceKey = key;
  cachedWorkspace = {
    enabled,
    shelf,
    recordBasis: record?.basis ?? null,
    savedCode,
  };
  return cachedWorkspace;
}

function getServerWorkspace(): WorkspaceView {
  return EMPTY_WORKSPACE;
}

function subscribeWorkspace(onStoreChange: () => void): () => void {
  const onChange = () => onStoreChange();
  window.addEventListener(BDL_CHANGE_EVENT, onChange);
  window.addEventListener(BDL_SHELF_CHANGE_EVENT, onChange);
  window.addEventListener(PROGRESS_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(BDL_CHANGE_EVENT, onChange);
    window.removeEventListener(BDL_SHELF_CHANGE_EVENT, onChange);
    window.removeEventListener(PROGRESS_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function countOnes(mask: string): number {
  let count = 0;
  for (const char of mask) {
    if (char === "1") count += 1;
  }
  return count;
}

function formatAt(at: string): string {
  const date = new Date(at);
  if (Number.isNaN(date.getTime())) return at;
  return date.toLocaleString();
}

function previewSource(code: string): string {
  const lines = code.split("\n");
  const firstLine = lines.find((line) => line.trim().length > 0) ?? "";
  const clipped =
    firstLine.length > 96 ? `${firstLine.slice(0, 96)}…` : firstLine;
  return lines.length > 1 ? `${clipped}\n…` : clipped;
}

export function LedgerWorkspace({
  problem,
  func,
}: {
  problem: BdlProblemPayload;
  func: string;
}) {
  const view = useSyncExternalStore(
    subscribeWorkspace,
    () => readWorkspace(problem.id),
    getServerWorkspace,
  );
  const [, setRevision] = useState(0);
  const [edits, setEdits] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "running">("idle");
  const [runError, setRunError] = useState<string | null>(null);
  const [report, setReport] = useState<BdlReport | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const pyRef = useRef<any>(null);
  const resultRef = useRef<HTMLElement | null>(null);
  const pendingFocus = useRef(false);

  const busy = status !== "idle";
  const code = edits ?? view.savedCode ?? problem.starterCode;
  const prefilled = edits === null && view.savedCode !== null;

  const tests = useMemo(
    () =>
      problem.testCases.map((test) => ({
        input: test.input,
        expected: test.expected,
      })),
    [problem.testCases],
  );

  const basis = useMemo(
    () => basisFingerprint(problem.id, tests, BDL_RUNTIME_BASIS_CAP),
    [problem.id, tests],
  );

  const staleBasis = view.recordBasis !== null && view.recordBasis !== basis;

  useEffect(() => {
    if (status !== "idle" || !pendingFocus.current) return;
    if (!report && !runError) return;
    pendingFocus.current = false;
    resultRef.current?.focus();
  }, [status, report, runError]);

  const toggleEnabled = () => {
    const next = !view.enabled;
    setBdlEnabled(next);
    setRevision((revision) => revision + 1);
    setNotice(
      next ? "The Ledger is on for this device." : "The Ledger is off.",
    );
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runLedger();
  };

  const runLedger = async () => {
    if (busy) return;
    if (!func) {
      setRunError(
        "This exercise does not expose a single entry function, so the Ledger cannot run here.",
      );
      return;
    }
    if (!code.trim()) {
      setRunError("Write or paste your Python first.");
      return;
    }
    const submission = code;
    setRunError(null);
    setNotice(null);
    pendingFocus.current = true;
    setStatus("loading");
    try {
      const { loadPyodideOnce, runCode } = await import("@/lib/pyodide");
      const py = pyRef.current ?? (await loadPyodideOnce());
      pyRef.current = py;
      setStatus("running");
      const previous = getBdlRecord(problem.id, basis);
      const probes = buildBdlBasis(
        problem.testCases.map((test) => test.input),
        problem.id,
        BDL_RUNTIME_BASIS_CAP,
      );
      const harness = buildBdlHarness({
        reference: problem.solution,
        submission,
        func,
        tests,
        probes,
      });
      const run = await runCode(py, harness);
      if (run.error) {
        setRunError(
          "The run did not finish in this browser session. Try again.",
        );
        return;
      }
      const parsed = parseBdlStdout(run.stdout);
      if (!parsed) {
        setRunError(
          "The run did not finish in this browser session. Try again.",
        );
        return;
      }
      const hash = hashBdlText(submission);
      const at = new Date().toISOString();
      let next: BdlReport;
      if (previous) {
        const prev: BdlRunResult = {
          sig: previous.sig,
          mask: previous.mask,
          passed: countOnes(previous.mask),
          total: previous.mask.length,
        };
        const delta = bdlDelta(prev, parsed);
        const verdict = bdlVerdict(delta, hash !== previous.hash);
        next = {
          kind: "delta",
          text: describeBdlVerdict(verdict, delta, parsed.sig.length),
          verdict,
          n: parsed.sig.length,
          sig: parsed.sig,
          mask: parsed.mask,
          hash,
          saved: view.enabled,
        };
      } else {
        next = {
          kind: "baseline",
          text: `First run on ${parsed.sig.length} hidden checks. Run again after an edit to see what changed.`,
          verdict: null,
          n: parsed.sig.length,
          sig: parsed.sig,
          mask: parsed.mask,
          hash,
          saved: view.enabled,
        };
      }
      if (view.enabled) {
        recordBdlAttempt(problem.id, basis, {
          hash,
          sig: parsed.sig,
          mask: parsed.mask,
          at,
        });
      }
      setRevision((revision) => revision + 1);
      setReport(next);
    } catch (error) {
      setRunError(error instanceof Error ? error.message : String(error));
    } finally {
      setStatus("idle");
    }
  };

  const codeMatchesReport =
    report !== null && hashBdlText(code) === report.hash;

  const onSaveSource = () => {
    if (!report || !codeMatchesReport) return;
    const saved = saveBdlSource(problem.id, {
      code,
      sig: report.sig,
      mask: report.mask,
      at: new Date().toISOString(),
    });
    setRevision((revision) => revision + 1);
    if (saved) {
      setNotice("Saved to Your bugs on this device.");
    } else {
      setNotice(
        view.enabled
          ? `Not saved: this source is longer than ${SHELF_KB} KB.`
          : "Turn on the Ledger on this device to save sources.",
      );
    }
  };

  const onLoadSource = (source: BdlSavedSource) => {
    setEdits(source.code);
    setReport(null);
    setRunError(null);
    setNotice("Loaded into the editor. Run to see what changed.");
  };

  const onRemoveSource = (sourceId: string) => {
    removeBdlSource(problem.id, sourceId);
    setRevision((revision) => revision + 1);
    setNotice("Removed from Your bugs.");
  };

  const firstParagraph = problem.description
    .split("\n\n")[0]
    ?.replace(/\s+/g, " ")
    .trim();

  return (
    <section
      aria-label={`Behavioral Delta Ledger — ${problem.title}`}
      className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-8"
    >
      <Link
        href="/ledger"
        className="inline-flex min-h-11 w-fit items-center gap-1.5 rounded-md text-sm text-body-mid transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0"
      >
        <span aria-hidden>←</span> All attempted problems
      </Link>

      <header className="mt-3 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-xs font-medium",
              difficultyClasses(problem.difficulty),
            )}
          >
            {problem.difficulty}
          </span>
          <span className="rounded-full border border-hairline bg-canvas-card px-2 py-0.5 text-xs text-body-mid">
            {problem.category}
          </span>
          <span className="font-mono text-xs text-mute">{problem.id}</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {problem.title}
        </h1>
        {firstParagraph && (
          <p className="max-w-3xl text-sm leading-relaxed text-body">
            {firstParagraph}
          </p>
        )}
        <Link
          href={`/problems/${problem.id}`}
          className="inline-flex min-h-11 w-fit items-center gap-1.5 rounded-md text-xs text-accent transition-colors hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0"
        >
          Open the full problem statement
        </Link>
        <label className="flex min-h-11 w-fit cursor-pointer items-center gap-2.5 rounded-lg border border-hairline bg-canvas-soft px-3 py-2.5">
          <input
            type="checkbox"
            checked={view.enabled}
            onChange={toggleEnabled}
            className="h-4 w-4 accent-accent"
          />
          <span className="text-xs text-body">{ENABLE_LABEL}</span>
        </label>
        <p className="max-w-3xl text-xs leading-relaxed text-body-mid">
          The Ledger stores one signature per problem in this browser. Nothing
          is synced. You can clear it at any time on the Ledger page.
        </p>
        {!view.enabled && (
          <p className="text-xs leading-relaxed text-body-mid">
            Runs still execute; without the toggle, this run is not stored for
            later comparisons.
          </p>
        )}
        {staleBasis && (
          <p role="status" className="text-xs leading-relaxed text-body-mid">
            The check set changed since your last saved result; the comparison
            history for this problem starts fresh.
          </p>
        )}
        {view.savedCode && (
          <details className="max-w-3xl rounded-lg border border-hairline bg-canvas-soft">
            <summary className="cursor-pointer rounded-lg px-3 py-2 text-xs font-medium text-body-mid transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40">
              Your last saved submission (read-only)
            </summary>
            <pre className="df-code-editor df-scroll overflow-x-auto border-t border-hairline px-3 py-2.5 text-body">
              {view.savedCode}
            </pre>
          </details>
        )}
      </header>

      <form
        onSubmit={onSubmit}
        className="mt-4 overflow-hidden rounded-lg border border-hairline bg-canvas-card"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline px-4 py-2.5 sm:px-5">
          <label
            htmlFor="ledger-code"
            className="text-xs font-medium text-body-mid"
          >
            Your program
          </label>
          <span className="text-[11px] text-mute">
            {prefilled
              ? "prefilled from your last saved submission"
              : "edits here are never saved to your progress"}
          </span>
        </div>
        <textarea
          id="ledger-code"
          value={code}
          onChange={(event) => setEdits(event.target.value)}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          aria-describedby="ledger-code-hint"
          placeholder="Paste your edit here…"
          className="df-code-editor df-scroll min-h-[220px] w-full resize-y bg-canvas px-4 py-3 text-ink placeholder:text-mute focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-accent/40 sm:px-5 sm:py-4"
        />
        <div className="flex flex-col gap-2 border-t border-hairline px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
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
              ? "Loading Python…"
              : status === "running"
                ? "Running…"
                : "Run with the Ledger"}
          </button>
          <p
            id="ledger-code-hint"
            className="text-[11px] leading-snug text-mute"
          >
            Runs locally in your browser with Python. Editing here never
            changes your saved submission.
          </p>
        </div>
      </form>

      <section
        ref={resultRef}
        tabIndex={-1}
        aria-label="Behavioral delta result"
        aria-busy={busy}
        className="mt-4 rounded-lg border border-hairline bg-canvas-card focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-hairline px-4 py-2.5 sm:px-5">
          <h2 className="text-xs font-medium text-body-mid">
            Behavioral delta
          </h2>
          <span className="break-all font-mono text-[10px] text-mute">
            check set {basis} · harness v{BDL_HARNESS_VERSION}
          </span>
        </div>
        <div
          aria-live="polite"
          className="flex flex-col gap-2 px-4 py-4 sm:px-5"
        >
          {busy && (
            <p className="text-xs leading-snug text-body-mid">
              {status === "loading"
                ? "Loading Python (~10 MB, cached after first run)…"
                : "Running the hidden checks locally…"}
            </p>
          )}
          {runError && (
            <div className="df-fade-in flex flex-col gap-2">
              <p className="text-sm leading-relaxed text-body">{runError}</p>
              <p className="text-xs leading-snug text-body-mid">
                Nothing was compared. Adjust and run again.
              </p>
            </div>
          )}
          {report && !busy && (
            <div className="df-fade-in flex flex-col gap-2">
              <p className="text-sm leading-relaxed text-body">
                {report.text}
              </p>
              <p className="text-xs leading-snug text-body-mid">
                {report.saved
                  ? "One signature for this problem was updated in this browser."
                  : "The Ledger is off on this device, so this run was not stored."}
              </p>
            </div>
          )}
          {!report && !busy && !runError && (
            <p className="text-xs leading-snug text-body-mid">
              No run yet. Paste your edit and press Run; the count appears
              here.
            </p>
          )}
          <p className="text-xs leading-snug text-body-mid">{CAVEAT}</p>
        </div>
      </section>

      <section
        aria-label="Your bugs"
        className="mt-4 rounded-lg border border-hairline bg-canvas-card"
      >
        <div className="flex flex-col gap-1.5 border-b border-hairline px-4 py-3.5 sm:px-5">
          <h2 className="text-xs font-medium text-body-mid">Your bugs</h2>
          <p className="max-w-3xl text-xs leading-relaxed text-body-mid">
            Opt-in saved sources for this problem, kept in this browser only —
            up to {BDL_SHELF_MAX_PER_PROBLEM}, {SHELF_KB} KB each. Load one and
            Run to see what changed relative to your last stored run.
          </p>
        </div>
        <div className="flex flex-col gap-2.5 px-4 py-3.5 sm:px-5">
          <button
            type="button"
            onClick={onSaveSource}
            disabled={!codeMatchesReport || busy}
            className={cn(SECONDARY_BUTTON, "w-fit")}
          >
            Save this source to Your bugs
          </button>
          {notice && (
            <p role="status" className="text-xs leading-relaxed text-body-mid">
              {notice}
            </p>
          )}
          {view.shelf.length === 0 ? (
            <p className="text-xs leading-relaxed text-body-mid">
              Nothing saved for this problem yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {view.shelf.map((source) => (
                <li
                  key={source.id}
                  className="rounded-md border border-hairline bg-canvas-soft p-2.5"
                >
                  <pre className="df-scroll overflow-x-auto whitespace-pre font-mono text-[11px] leading-relaxed text-body">
                    {previewSource(source.code)}
                  </pre>
                  <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] text-mute">
                      saved {formatAt(source.at)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onLoadSource(source)}
                        className={SECONDARY_BUTTON}
                      >
                        Load
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveSource(source.id)}
                        className={SECONDARY_BUTTON}
                      >
                        Remove
                      </button>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </section>
  );
}
