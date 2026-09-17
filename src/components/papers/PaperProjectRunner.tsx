"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

/**
 * Read the text after the first `# EXPECTED:` comment in a starter file,
 * including the contiguous `#` comment lines directly below it. Returns null
 * when there is no marker or the marker carries no text. Pure so the paper
 * project scaffolding can be checked without a Python runtime.
 */
export function parseExpectedOutput(code: string): string | null {
  const marker = /^\s*#\s*EXPECTED:\s?(.*)$/i;
  const lines = code.split(/\r?\n/);
  const start = lines.findIndex((line) => marker.test(line));
  if (start === -1) return null;

  const first = marker.exec(lines[start]);
  if (!first) return null;

  const block = [first[1].trimEnd()];
  for (let index = start + 1; index < lines.length; index += 1) {
    const continuation = /^\s*#\s?(.*)$/.exec(lines[index]);
    if (!continuation) break;
    block.push(continuation[1].trimEnd());
  }

  const text = block.join("\n").trim();
  return text.length > 0 ? text : null;
}

type RunnerStatus = "idle" | "loading" | "running" | "done" | "error";

interface PaperProjectRunnerProps {
  /** Starter Python for the project; the editable buffer starts here. */
  code: string;
  /** Paper slug, used to label the editor region. */
  slug: string;
}

/**
 * Browser runner for a paper project's starter code. Mirrors ProblemView's
 * proven path: Pyodide is imported lazily on the first Run gesture and
 * executed through `runCode`, which captures stdout and never throws. Loading
 * only starts on a user action, so the component server-renders as a plain
 * editor and stays out of the initial bundle.
 */
export function PaperProjectRunner({ code, slug }: PaperProjectRunnerProps) {
  const [source, setSource] = useState(code);
  const [status, setStatus] = useState<RunnerStatus>("idle");
  const [stdout, setStdout] = useState("");
  const [error, setError] = useState<string | null>(null);
  const pyRef = useRef<any>(null);

  const busy = status === "loading" || status === "running";

  const run = async () => {
    if (busy) return;
    setStatus("loading");
    setStdout("");
    setError(null);
    try {
      const { loadPyodideOnce, runCode } = await import("@/lib/pyodide");
      const py = pyRef.current ?? (await loadPyodideOnce());
      pyRef.current = py;
      setStatus("running");
      const result = await runCode(py, source);
      setStdout(result.stdout);
      setError(result.error);
      setStatus(result.error ? "error" : "done");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus("error");
    }
  };

  const reset = () => {
    if (busy) return;
    setSource(code);
    setStdout("");
    setError(null);
    setStatus("idle");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      void run();
    }
  };

  const statusText =
    status === "loading"
      ? "Loading Python (~10 MB, cached after first run)…"
      : status === "running"
        ? "Running your code…"
        : status === "error"
          ? "Stopped with an error."
          : status === "done"
            ? stdout
              ? "Finished."
              : "Finished with no output."
            : "Runs locally in your browser.";

  const runLabel =
    status === "loading"
      ? "Loading Python (~10 MB, cached after first run)…"
      : status === "running"
        ? "Running…"
        : "Run";

  return (
    <div className="flex flex-col">
      <textarea
        value={source}
        onChange={(event) => setSource(event.target.value)}
        onKeyDown={onKeyDown}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        rows={12}
        aria-label={`${slug} starter code`}
        className="df-code-editor df-scroll min-h-[220px] w-full resize-y bg-canvas px-4 py-3 text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-accent/40"
      />
      <div className="flex flex-wrap items-center gap-2 border-t border-hairline px-4 py-2.5">
        <button
          type="button"
          onClick={() => void run()}
          disabled={busy}
          aria-busy={busy}
          className="inline-flex max-w-full items-center gap-2 rounded-lg bg-accent px-3.5 py-1.5 text-left text-xs font-medium text-canvas transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50"
        >
          {busy && (
            <span
              aria-hidden
              className="df-spin h-3 w-3 shrink-0 rounded-full border-2 border-canvas/40 border-t-canvas"
            />
          )}
          {runLabel}
        </button>
        <button
          type="button"
          onClick={reset}
          disabled={busy}
          className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 disabled:opacity-50"
        >
          Reset
        </button>
        <span
          aria-live="polite"
          className="text-[11px] leading-snug text-body-mid"
        >
          {statusText}
        </span>
      </div>
      {(stdout || error) && (
        <div className="border-t border-hairline bg-canvas-soft px-4 py-3">
          <div className="mb-1.5 text-[11px] text-mute">Output</div>
          {error && (
            <pre className="df-scroll overflow-x-auto whitespace-pre rounded-md border border-error/40 bg-error/5 p-2.5 font-mono text-xs leading-relaxed text-error">
              {error}
            </pre>
          )}
          {stdout && (
            <pre
              className={cn(
                "df-scroll overflow-x-auto whitespace-pre font-mono text-xs leading-relaxed text-body",
                error && "mt-2",
              )}
            >
              {stdout}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
