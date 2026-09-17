"use client";

import { useState } from "react";
import type { Lab } from "@/data/labs";

/**
 * Read-only reveal of the lab's reference solution. It never touches the
 * editor or the records store — revealing is a convention, not a gate.
 */
export function SolutionReveal({ lab }: { lab: Lab }) {
  const [open, setOpen] = useState(false);

  return (
    <section
      id="solution"
      aria-label="Reference solution"
      className="scroll-mt-20 rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold tracking-tight text-ink">
          Reference solution
        </h2>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="lab-solution-code"
          className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
        >
          {open ? "Hide solution" : "Show solution"}
        </button>
      </div>
      <p className="mt-1 text-sm leading-relaxed text-body-mid">
        Revealing doesn&apos;t affect your record — but try the hint first.
      </p>

      {open && (
        <div id="lab-solution-code" className="df-fade-in mt-4">
          <ul className="space-y-1.5">
            {lab.solutionNotes.map((note) => (
              <li
                key={note}
                className="flex gap-2 text-sm leading-relaxed text-body"
              >
                <span className="text-mute" aria-hidden>
                  ·
                </span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 overflow-hidden rounded-lg border border-hairline bg-canvas">
            <div className="flex items-center justify-between border-b border-hairline px-3 py-2">
              <span className="text-xs font-medium text-body-mid">
                Reference code
              </span>
              <span className="font-mono text-[10px] text-mute">
                Read-only · Python
              </span>
            </div>
            <pre className="df-code-editor df-scroll overflow-x-auto whitespace-pre p-4 text-body">
              <code>{lab.solutionCode}</code>
            </pre>
          </div>
        </div>
      )}
    </section>
  );
}
