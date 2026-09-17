import type { PaperSection } from "@/data/papers/types";
import { PaperFigure } from "@/components/papers/figures";

/**
 * Server renderer shared by the theory and paper flows on a paper page.
 * Pure markup: every section kind maps to one deterministic block, and the
 * only client component involved is `PaperFigure` when visuals appear.
 */
export function PaperSections({ sections }: { sections: PaperSection[] }) {
  return (
    <div className="flex flex-col gap-5">
      {sections.map((section, index) => {
        if (section.kind === "prose") {
          return (
            <div key={index}>
              {section.heading && (
                <h3 className="mb-1.5 text-sm font-medium text-ink">
                  {section.heading}
                </h3>
              )}
              <p className="max-w-3xl whitespace-pre-wrap break-words text-sm leading-relaxed text-body">
                {section.text}
              </p>
            </div>
          );
        }

        if (section.kind === "visual") {
          return (
            <PaperFigure
              key={index}
              visual={section.visual}
              caption={section.caption}
              className="max-w-2xl"
            />
          );
        }

        if (section.kind === "code") {
          return (
            <figure
              key={index}
              className="m-0 overflow-hidden rounded-lg border border-hairline bg-canvas-card"
            >
              <div className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-2">
                <figcaption className="min-w-0 truncate text-xs font-medium text-body-mid">
                  {section.title}
                </figcaption>
                <span className="shrink-0 font-mono text-[10px] text-mute">
                  {section.language}
                </span>
              </div>
              <pre className="df-code-editor df-scroll overflow-x-auto p-4 text-body">
                <code>{section.code}</code>
              </pre>
              {section.notes && section.notes.length > 0 && (
                <ul className="space-y-1.5 border-t border-hairline px-4 py-3">
                  {section.notes.map((note, noteIndex) => (
                    <li
                      key={noteIndex}
                      className="flex gap-2 text-xs leading-relaxed text-body-mid"
                    >
                      <span aria-hidden className="font-mono text-mute">
                        ·
                      </span>
                      <span className="min-w-0">{note}</span>
                    </li>
                  ))}
                </ul>
              )}
            </figure>
          );
        }

        return (
          <div
            key={index}
            className="max-w-2xl rounded-lg border border-hairline bg-canvas-soft p-4"
          >
            <p className="text-xs font-medium text-body-mid">{section.label}</p>
            <pre className="df-scroll mt-2 overflow-x-auto font-mono text-sm leading-relaxed text-ink">
              <code>{section.expression}</code>
            </pre>
            <p className="mt-2 text-xs leading-relaxed text-body-mid">
              {section.why}
            </p>
          </div>
        );
      })}
    </div>
  );
}
