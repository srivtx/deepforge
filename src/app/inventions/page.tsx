import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { INVENTIONS } from "@/data/inventions";

const TITLE = "Publications";
const DESCRIPTION =
  "Research papers from DeepForge: the techniques the platform specifies, simulates, and publishes with a downloadable PDF.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/inventions",
  },
  openGraph: {
    title: "Publications — DeepForge",
    description: DESCRIPTION,
    url: "/inventions",
    type: "website",
    siteName: "DeepForge",
  },
  twitter: {
    card: "summary",
    title: "Publications — DeepForge",
    description: DESCRIPTION,
  },
};

function excerpt(abstract: string): string {
  const text = abstract.replace(/\s+/g, " ").trim();
  if (text.length <= 260) return text;
  return `${text.slice(0, 257).replace(/\s+\S*$/, "")}…`;
}

export default function InventionsIndexPage() {
  return (
    <PageShell title={TITLE} description={DESCRIPTION}>
      <section
        aria-label="Published papers"
        className="mx-auto w-full max-w-6xl px-4 pb-10 pt-8 sm:px-6 sm:pb-14 sm:pt-10"
      >
        {INVENTIONS.length === 0 ? (
          <div className="rounded-lg border border-hairline bg-canvas-card px-5 py-14 text-center">
            <p className="text-sm text-body-mid">
              No papers published yet. The first technique is on the bench.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {INVENTIONS.map((paper) => (
              <li key={paper.id}>
                <article className="flex flex-col gap-3 rounded-lg border border-hairline bg-canvas-card p-4 transition-colors hover:border-accent/40 sm:p-5">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-body-mid">
                    <span className="font-mono text-xs text-mute">
                      {paper.date}
                    </span>
                    <span aria-hidden className="text-mute">
                      ·
                    </span>
                    <span>{paper.authors.join(", ")}</span>
                  </div>
                  <h2 className="text-base font-semibold tracking-tight text-ink sm:text-lg">
                    <Link
                      href={`/inventions/${paper.slug}`}
                      className="rounded-sm transition-colors hover:text-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
                    >
                      {paper.title}
                    </Link>
                  </h2>
                  <p className="max-w-3xl text-sm leading-relaxed text-body">
                    {excerpt(paper.abstract)}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-3">
                    <Link
                      href={`/inventions/${paper.slug}`}
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/5 px-3.5 py-1.5 text-sm font-medium text-accent transition-colors hover:bg-accent/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0"
                    >
                      Read the paper <span aria-hidden>&rarr;</span>
                    </Link>
                    <a
                      href={`/inventions/${paper.slug}/paper.pdf`}
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-hairline px-3.5 py-1.5 text-sm text-body transition-colors hover:border-accent/40 hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0"
                    >
                      PDF
                    </a>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageShell>
  );
}
