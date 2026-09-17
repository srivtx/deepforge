import type { ResearchTheory } from "@/data/researchTheory";

/**
 * The "Method & theory" course note: premise, the deeper sections, pitfalls,
 * and the takeaway from the theory entry. Renders only when a theory entry
 * exists. The single-column reading measure keeps long paragraphs comfortable
 * inside the narrower left column of the challenge page.
 */
export function TheoryNotes({ theory }: { theory: ResearchTheory }) {
  return (
    <section
      id="theory"
      aria-labelledby="research-notes"
      className="scroll-mt-16 rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2
          id="research-notes"
          className="text-base font-semibold tracking-tight text-ink"
        >
          Method &amp; theory
        </h2>
        <span className="font-mono text-[10px] text-mute">
          read before you submit
        </span>
      </div>
      <p className="mt-3 max-w-prose text-sm leading-relaxed text-body">
        {theory.premise}
      </p>

      {theory.sections.length > 0 && (
        <div className="mt-5 space-y-5">
          {theory.sections.map((section, index) => (
            <div key={index}>
              <h3 className="text-sm font-medium text-ink">
                {section.heading}
              </h3>
              <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-body">
                {section.body}
              </p>
            </div>
          ))}
        </div>
      )}

      {theory.pitfalls.length > 0 && (
        <div className="mt-5 border-t border-hairline pt-4">
          <h3 className="text-sm font-medium text-ink">Pitfalls</h3>
          <ul className="mt-2 space-y-1.5">
            {theory.pitfalls.map((pitfall, index) => (
              <li
                key={index}
                className="flex gap-2.5 text-sm leading-relaxed text-body"
              >
                <span
                  aria-hidden
                  className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-warning"
                />
                <span className="max-w-prose">{pitfall}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {theory.takeaway && (
        <p className="mt-5 max-w-prose rounded-md border border-accent/40 bg-accent/5 p-3 text-sm leading-relaxed text-body">
          <span className="font-medium text-accent">Takeaway.</span>{" "}
          {theory.takeaway}
        </p>
      )}
    </section>
  );
}
