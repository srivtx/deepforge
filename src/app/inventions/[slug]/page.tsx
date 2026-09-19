import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { PaperBody } from "@/components/inventions/PaperBody";
import { INVENTIONS } from "@/data/inventions";
import { citeText, getInvention } from "@/lib/inventions";

export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return INVENTIONS.map((paper) => ({ slug: paper.slug }));
}

function paperDescription(abstract: string): string {
  const text = abstract.replace(/\s+/g, " ").trim();
  if (text.length <= 158) return text;
  return `${text.slice(0, 155).replace(/\s+\S*$/, "")}…`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const paper = getInvention(slug);
  if (!paper) return { title: "Paper not found" };

  const description = paperDescription(paper.abstract);
  return {
    title: `${paper.title} — Publications`,
    description,
    alternates: {
      canonical: `/inventions/${paper.slug}`,
    },
    openGraph: {
      title: `${paper.title} — DeepForge`,
      description,
      url: `/inventions/${paper.slug}`,
      type: "article",
      siteName: "DeepForge",
    },
    twitter: {
      card: "summary",
      title: `${paper.title} — DeepForge`,
      description,
    },
  };
}

export default async function InventionPaperPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const paper = getInvention(slug);
  if (!paper) notFound();

  return (
    <PageShell>
      <article className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 pt-6 pb-16 sm:px-6 sm:pt-8 print:max-w-none print:px-0">
        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 flex-wrap items-center gap-1.5 text-xs text-body-mid print:hidden"
        >
          <Link
            href="/"
            className="rounded-sm transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
          >
            Home
          </Link>
          <span aria-hidden className="text-mute">
            /
          </span>
          <Link
            href="/inventions"
            className="rounded-sm transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
          >
            Publications
          </Link>
          <span className="flex min-w-0 max-w-full items-center gap-1.5">
            <span aria-hidden className="text-mute">
              /
            </span>
            <span className="min-w-0 truncate text-body">{paper.title}</span>
          </span>
        </nav>

        <header className="flex flex-col gap-3">
          <p className="text-xs text-body-mid">
            {paper.authors.join(", ")} · <span className="font-mono">{paper.date}</span>
          </p>
          <h1 className="break-words text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {paper.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 print:hidden">
            <a
              href={`/inventions/${paper.slug}/paper.pdf`}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/5 px-3.5 py-1.5 text-sm font-medium text-accent transition-colors hover:bg-accent/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0"
            >
              Download PDF
            </a>
            <a
              href="#references"
              className="inline-flex min-h-11 items-center rounded-lg border border-hairline px-3.5 py-1.5 text-sm text-body transition-colors hover:border-accent/40 hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0"
            >
              References
            </a>
          </div>
        </header>

        <section
          aria-labelledby="abstract-heading"
          className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5 print:break-inside-avoid"
        >
          <h2
            id="abstract-heading"
            className="text-sm font-medium text-ink"
          >
            Abstract
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-body">
            {paper.abstract}
          </p>
          <ul
            aria-label="Keywords"
            className="mt-4 flex flex-wrap gap-2"
          >
            {paper.keywords.map((keyword) => (
              <li
                key={keyword}
                className="rounded-full border border-hairline px-2 py-0.5 text-xs text-body-mid"
              >
                {keyword}
              </li>
            ))}
          </ul>
        </section>

        <PaperBody paper={paper} />

        <section
          aria-labelledby="cite-heading"
          className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5 print:break-inside-avoid"
        >
          <h2 id="cite-heading" className="text-sm font-medium text-ink">
            Cite this paper
          </h2>
          <p className="mt-2 break-words font-mono text-xs leading-relaxed text-body">
            {citeText(paper)}
          </p>
        </section>
      </article>
    </PageShell>
  );
}
