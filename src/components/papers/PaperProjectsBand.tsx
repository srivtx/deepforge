import Link from "next/link";
import { PAPERS } from "@/data/papers";
import { cn } from "@/lib/utils";
import {
  PROJECT_DIFFICULTY_BADGE,
  PROJECT_DIFFICULTY_LABELS,
} from "./projectCheck";

/**
 * The "From the papers" band on /projects: a compact index of every paper
 * that carries a build, linking straight to the project section. Content
 * lands in parallel, so an empty set renders nothing at all.
 */
export function PaperProjectsBand() {
  const builds = PAPERS.flatMap((paper) =>
    paper.project ? [{ paper, project: paper.project }] : [],
  );
  if (builds.length === 0) return null;

  return (
    <section
      aria-labelledby="from-the-papers"
      className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 sm:pb-14"
    >
      <div className="border-t border-hairline pt-6">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2
            id="from-the-papers"
            className="text-sm font-medium text-body-mid"
          >
            From the papers
          </h2>
          <p className="text-xs text-mute">
            {builds.length} {builds.length === 1 ? "build" : "builds"} from
            the reading list
          </p>
        </div>
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {builds.map(({ paper, project }) => (
            <li key={paper.id} className="min-w-0">
              <Link
                href={`/papers/${paper.slug}#project`}
                className="flex min-w-0 flex-col gap-1.5 rounded-lg border border-hairline bg-canvas-card p-3 transition-colors hover:border-accent/40 hover:bg-canvas-soft focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:p-4"
              >
                <span className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="min-w-0 break-words text-sm font-medium text-ink">
                    {project.title}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                      PROJECT_DIFFICULTY_BADGE[project.difficulty],
                    )}
                  >
                    {PROJECT_DIFFICULTY_LABELS[project.difficulty]}
                  </span>
                </span>
                <span className="break-words text-xs text-body-mid">
                  {paper.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
