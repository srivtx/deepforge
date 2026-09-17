"use client";

import { useState } from "react";
import type { ResearchChallenge } from "@/data/research";

/**
 * Read-only reference solution for a stuck learner. This is a pure reveal:
 * it never writes to the research store and never touches the editor's code,
 * so showing it cannot change a saved record.
 */
export function SolutionReveal({ challenge }: { challenge: ResearchChallenge }) {
  const [open, setOpen] = useState(false);
  const panelId = `research-solution-panel-${challenge.id}`;

  return (
    <section
      id="solution"
      aria-labelledby="research-solution"
      className="scroll-mt-16 rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          id="research-solution"
          className="text-base font-semibold tracking-tight text-ink"
        >
          Reference solution
        </h2>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={panelId}
          className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent"
        >
          {open ? "Hide solution" : "Show solution"}
        </button>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-body-mid">
        Revealing doesn&apos;t affect your record — but try the hint first.
      </p>

      {open && (
        <div id={panelId} className="mt-3">
          <pre className="df-code-editor df-scroll max-h-[420px] overflow-auto whitespace-pre rounded-md border border-hairline bg-canvas px-3 py-3 text-ink">
            <code>{challenge.solutionCode}</code>
          </pre>
          <h3 className="mt-4 text-xs font-medium text-body-mid">
            Why this works
          </h3>
          <ul className="mt-2 space-y-1.5">
            {challenge.solutionNotes.map((note, index) => (
              <li
                key={index}
                className="flex gap-2.5 text-sm leading-relaxed text-body"
              >
                <span
                  aria-hidden
                  className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent"
                />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
