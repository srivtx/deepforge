import Link from "next/link";

const THREADS = [
  {
    title: "Test adequacy",
    question: "Can a test suite distinguish correct programs from plausible-but-wrong ones?",
    detail:
      "Silent Bug Hunt pairs a reference function with a test-passing one-line divergence, then asks you to find the input the suite missed.",
    href: "/alibi",
    action: "Try Silent Bug Hunt",
  },
  {
    title: "Behavioral evidence",
    question: "Can an edit reveal a meaningful behavioral change without becoming a grade?",
    detail:
      "Behavioral Delta Ledger reports only whether hidden checks changed after an edit. It never affects progress, review, or certificates.",
    href: "/ledger",
    action: "Explore the ledger",
  },
  {
    title: "Auditable feedback",
    question: "Can learning guidance show the evidence behind it and respond when that evidence is refuted?",
    detail:
      "Warrant Lab makes each derived claim inspectable: see its checks, challenge it, and audit the resulting bookkeeping.",
    href: "/warrant",
    action: "Open Warrant Lab",
  },
] as const;

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
              DeepForge studies reliable, evidence-based AI-assisted programming
              education. The work is grounded in three practical questions—not
              claims of a finished theory.
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
          {THREADS.map((thread) => (
            <article
              key={thread.href}
              className="flex flex-col rounded-lg border border-hairline bg-canvas-card p-4"
            >
              <h3 className="text-sm font-medium text-ink">{thread.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-body">
                {thread.question}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-body-mid">
                {thread.detail}
              </p>
              <Link
                href={thread.href}
                className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0"
              >
                {thread.action} <span aria-hidden>→</span>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
