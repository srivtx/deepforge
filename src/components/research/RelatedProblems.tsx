import Link from "next/link";
import { getRelatedProblems } from "./relatedIds";

/**
 * "Related practice": three real problem links that rehearse the challenge's
 * skill, plus a pointer into the labs track.
 */
export function RelatedProblems({ challengeId }: { challengeId: string }) {
  const problems = getRelatedProblems(challengeId);

  return (
    <section
      aria-labelledby="related-practice"
      className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="related-practice" className="text-sm font-medium text-body-mid">
          Related practice
        </h2>
        <Link
          href="/labs"
          className="rounded-sm text-xs text-accent transition-opacity hover:opacity-80 focus:outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent"
        >
          Explore labs
        </Link>
      </div>

      {problems.length === 0 ? (
        <p className="mt-2 text-sm text-body-mid">
          No linked practice yet — browse{" "}
          <Link
            href="/problems"
            className="rounded-sm text-accent transition-opacity hover:opacity-80 focus:outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent"
          >
            all problems
          </Link>{" "}
          to warm up.
        </p>
      ) : (
        <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {problems.map((problem) => (
            <li key={problem.id}>
              <Link
                href={`/problems/${problem.id}`}
                className="flex h-full flex-col rounded-md border border-hairline bg-canvas p-3 transition-colors hover:border-accent/30 hover:bg-canvas-soft focus:outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent"
              >
                <span className="text-sm font-medium text-ink">
                  {problem.title}
                </span>
                <span className="mt-1 font-mono text-[10px] text-mute">
                  {problem.id} · {problem.category} · {problem.difficulty}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
