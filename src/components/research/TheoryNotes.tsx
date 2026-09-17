import type { ResearchTheory } from "@/data/researchTheory";

/**
 * The "Research notes" block: premise, the deeper sections, pitfalls, and the
 * takeaway from the theory entry. Renders only when a theory entry exists.
 */
export function TheoryNotes({ theory }: { theory: ResearchTheory }) {
  return (
    <section
      aria-labelledby="research-notes"
      className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5"
    >
      <h2
        id="research-notes"
        className="text-sm font-medium text-body-mid"
      >
        Research notes
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-body">
        {theory.premise}
      </p>

      {theory.sections.length > 0 && (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {theory.sections.map((section, index) => (
            <div
              key={index}
              className="rounded-md border border-hairline bg-canvas p-3.5"
            >
              <h3 className="text-xs font-medium text-ink">
                {section.heading}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-body">
                {section.body}
              </p>
            </div>
          ))}
        </div>
      )}

      {theory.pitfalls.length > 0 && (
        <>
          <h3 className="mt-5 text-xs font-medium text-body-mid">Pitfalls</h3>
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
                <span>{pitfall}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {theory.takeaway && (
        <p className="mt-5 rounded-md border border-accent/40 bg-accent/5 p-3 text-sm leading-relaxed text-body">
          <span className="font-medium text-accent">Takeaway.</span>{" "}
          {theory.takeaway}
        </p>
      )}
    </section>
  );
}
