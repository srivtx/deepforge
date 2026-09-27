import Link from "next/link";
import {
  RESEARCH_AGENDA,
  RESEARCH_QUESTIONS,
  type ResearchQuestion,
} from "@/data/researchOverview";

/**
 * The homepage research agenda: the programme statement, a pointer to the three
 * research questions, and the questions themselves.
 *
 * Every string comes from `src/data/researchOverview.ts`, which the
 * publications index also reads, so the two research surfaces carry the same
 * agenda in the same words and cannot drift apart. This component is
 * presentation only: it renders the shared list and adds nothing of its own.
 */

function QuestionCard({ thread }: { thread: ResearchQuestion }) {
  return (
    <article className="flex flex-col rounded-lg border border-hairline bg-canvas-card p-4">
      <h3 className="text-sm font-medium text-ink">{thread.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-body">{thread.question}</p>
      <p className="mt-2 text-xs leading-relaxed text-body-mid">{thread.detail}</p>
      <Link
        href={thread.href}
        className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0"
      >
        {thread.action} <span aria-hidden>→</span>
      </Link>
    </article>
  );
}

export function ResearchAgenda() {
  return (
    <section
      aria-labelledby="research-agenda-title"
      className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14"
    >
      <div className="rounded-lg border border-accent/40 bg-accent/5 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div className="max-w-3xl">
            <h2
              id="research-agenda-title"
              className="text-lg font-semibold tracking-tight text-ink"
            >
              Practice is the product. Evidence is the research agenda.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-body">
              {RESEARCH_AGENDA}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-body-mid">
              The work is grounded in three practical questions — not claims of a
              finished theory.
            </p>
          </div>
          <Link
            href="/inventions"
            className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg border border-hairline px-3.5 py-1.5 text-sm font-medium text-ink transition-colors hover:border-accent/40 hover:bg-canvas-soft focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0"
          >
            Read the publications <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {RESEARCH_QUESTIONS.map((thread) => (
            <QuestionCard key={thread.id} thread={thread} />
          ))}
        </div>
      </div>
    </section>
  );
}
