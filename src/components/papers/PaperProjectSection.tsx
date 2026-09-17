import Link from "next/link";
import type { PaperProject } from "@/data/papers/types";
import { LABS } from "@/data/labs";
import { PROBLEM_META } from "@/data/problems/problem-meta";
import { slugify } from "@/lib/paths";
import { cn } from "@/lib/utils";
import { PaperProjectRunner } from "./PaperProjectRunner";
import {
  PROJECT_DIFFICULTY_BADGE,
  PROJECT_DIFFICULTY_LABELS,
} from "./projectCheck";

const LAB_TITLES = new Map(LABS.map((lab) => [lab.id, lab.title]));
const PROBLEM_TITLES = new Map(
  PROBLEM_META.map((problem) => [problem.id, problem.title]),
);

interface RelatedItem {
  id: string;
  title: string;
  href: string;
}

/** Resolve ids against the real registries, skipping unknown ones. */
function resolveLabs(ids: string[] | undefined): RelatedItem[] {
  return (ids ?? []).flatMap((id) => {
    const title = LAB_TITLES.get(id);
    return title ? [{ id, title, href: `/labs/${id}` }] : [];
  });
}

function resolveProblems(ids: string[] | undefined): RelatedItem[] {
  return (ids ?? []).flatMap((id) => {
    const title = PROBLEM_TITLES.get(id);
    return title ? [{ id, title, href: `/problems/${id}` }] : [];
  });
}

function RelatedGroup({
  label,
  items,
}: {
  label: string;
  items: RelatedItem[];
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="text-xs font-medium text-body-mid">{label}</h3>
      <ul className="mt-1.5 flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item.id} className="min-w-0 max-w-full">
            <Link
              href={item.href}
              className="inline-flex max-w-full items-center rounded-lg border border-hairline bg-canvas-card px-3 py-2 text-sm text-body transition-colors hover:border-accent/40 hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
            >
              <span className="min-w-0 truncate">{item.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The "Build it yourself" body on a paper page. Milestones, a runnable
 * starter-code editor (executed in-browser through Pyodide), a self-graded
 * checklist, and the related lab/problem links. The page owns the section
 * heading.
 */
export function PaperProjectSection({
  project,
  slug,
}: {
  project: PaperProject;
  /** Paper slug from the route; falls back to a slugified project title. */
  slug?: string;
}) {
  const labs = resolveLabs(project.relatedLabIds);
  const problems = resolveProblems(project.relatedProblemIds);
  const runnerSlug = slug?.trim() || slugify(project.title);

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h3 className="min-w-0 break-words text-base font-semibold text-ink">
            {project.title}
          </h3>
          <span
            className={cn(
              "shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium",
              PROJECT_DIFFICULTY_BADGE[project.difficulty],
            )}
          >
            {PROJECT_DIFFICULTY_LABELS[project.difficulty]}
          </span>
          <span className="shrink-0 rounded-full border border-hairline bg-canvas-card px-2 py-0.5 text-xs text-body-mid">
            {project.timeEstimate}
          </span>
        </div>
        <p className="max-w-3xl whitespace-pre-wrap break-words text-sm leading-relaxed text-body">
          {project.pitch}
        </p>
      </header>

      <div>
        <h3 className="mb-2 text-sm font-medium text-ink">Milestones</h3>
        <ol className="flex max-w-3xl flex-col gap-2">
          {project.milestones.map((milestone, index) => (
            <li
              key={index}
              className="flex gap-2.5 text-sm leading-relaxed text-body"
            >
              <span
                aria-hidden
                className="mt-px shrink-0 font-mono text-xs text-accent"
              >
                {index + 1}.
              </span>
              <span className="min-w-0 break-words">{milestone}</span>
            </li>
          ))}
        </ol>
      </div>

      <figure className="m-0 overflow-hidden rounded-lg border border-hairline bg-canvas-card">
        <div className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-2">
          <figcaption className="min-w-0 truncate text-xs font-medium text-body-mid">
            Starter code
          </figcaption>
          <span className="shrink-0 font-mono text-[10px] text-mute">
            python · editable
          </span>
        </div>
        <PaperProjectRunner
          key={runnerSlug}
          code={project.starterCode}
          slug={runnerSlug}
        />
      </figure>

      <div>
        <h3 className="mb-2 text-sm font-medium text-ink">Success criteria</h3>
        <ul className="flex max-w-3xl flex-col gap-2">
          {project.successCriteria.map((criterion, index) => (
            <li
              key={index}
              className="flex gap-2.5 text-sm leading-relaxed text-body"
            >
              <span aria-hidden className="mt-0.5 shrink-0 text-accent">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect
                    x="1"
                    y="1"
                    width="12"
                    height="12"
                    rx="2.5"
                    stroke="currentColor"
                    strokeOpacity="0.45"
                  />
                  <path
                    d="M4.2 7.1l2 2 3.6-4.2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="min-w-0 break-words">{criterion}</span>
            </li>
          ))}
        </ul>
      </div>

      {project.stretch.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-body-mid">
            Stretch goals
          </h3>
          <ul className="flex max-w-3xl flex-col gap-1.5">
            {project.stretch.map((goal, index) => (
              <li
                key={index}
                className="flex gap-2 text-sm leading-relaxed text-body-mid"
              >
                <span aria-hidden className="font-mono text-mute">
                  ·
                </span>
                <span className="min-w-0 break-words">{goal}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(labs.length > 0 || problems.length > 0) && (
        <div className="flex flex-col gap-4">
          <RelatedGroup label="Labs" items={labs} />
          <RelatedGroup label="Problems" items={problems} />
        </div>
      )}
    </div>
  );
}
