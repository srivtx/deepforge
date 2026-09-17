import Link from "next/link";
import type { ProblemMeta } from "@/data/problems/problem-meta";
import { getSimilarProblems } from "@/lib/similar";
import { cn, difficultyClasses } from "@/lib/utils";

interface SimilarProblemsProps {
  problem: ProblemMeta;
  /** Maximum rows to render. Defaults to 5 in the scorer as well. */
  limit?: number;
}

/**
 * Compact "More like this" list — scored sibling challenges from the light
 * problem index (see lib/similar.ts). Pure and server-render safe: no hooks,
 * no client state. Rows are real links so they work without JavaScript.
 */
export function SimilarProblems({ problem, limit = 5 }: SimilarProblemsProps) {
  const items = getSimilarProblems(problem, limit);
  if (items.length === 0) return null;

  return (
    <nav aria-label="More like this" className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold tracking-tight text-ink">
        More like this
      </h2>
      <ul className="divide-y divide-hairline rounded-lg border border-hairline bg-canvas-card">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={`/problems/${item.id}`}
              className="group flex min-h-11 items-center justify-between gap-3 px-3 py-2.5 transition-colors hover:bg-canvas-soft focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-accent/40 sm:min-h-0"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-ink transition-colors group-hover:text-accent">
                  {item.title}
                </span>
                <span className="mt-0.5 block truncate text-xs text-body-mid">
                  {item.category}
                </span>
              </span>
              <span
                className={cn(
                  "shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium",
                  difficultyClasses(item.difficulty),
                )}
              >
                {item.difficulty}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
