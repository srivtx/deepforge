import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORIES, PROBLEMS, getCategoryCounts } from "@/data/problems";
import type { Difficulty } from "@/types/problem";
import { PracticeBrowser } from "@/components/PracticeBrowser";
import { SectionShell } from "@/components/SectionShell";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://deepforge.app"
).replace(/\/$/, "");

function categorySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const description = `Browse all ${PROBLEMS.length} DeepForge problems across ${CATEGORIES.length} categories — linear algebra, calculus, statistics, probability, machine learning, deep learning, and more. Every problem runs Python in your browser.`;

export const metadata: Metadata = {
  title: "All problems",
  description,
  alternates: {
    canonical: "/problems",
  },
  openGraph: {
    title: "All problems — DeepForge",
    description,
    url: "/problems",
    type: "website",
    siteName: "DeepForge",
  },
};

export default function ProblemsPage() {
  const counts = getCategoryCounts();
  const difficultyCounts: Record<Difficulty, number> = {
    Easy: 0,
    Medium: 0,
    Hard: 0,
  };
  for (const problem of PROBLEMS) {
    difficultyCounts[problem.difficulty] += 1;
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${siteUrl}/problems#page`,
        name: "DeepForge problems",
        description,
        url: `${siteUrl}/problems`,
        isPartOf: {
          "@type": "WebSite",
          name: "DeepForge",
          url: siteUrl,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${siteUrl}/problems#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Problems",
            item: `${siteUrl}/problems`,
          },
        ],
      },
    ],
  };

  return (
    <SectionShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pt-10 sm:px-6 sm:pt-14">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 text-xs text-body-mid"
        >
          <Link href="/" className="transition-colors hover:text-ink">
            Home
          </Link>
          <span className="text-mute">/</span>
          <span className="text-body">Problems</span>
        </nav>

        <header className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            All problems
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-body">
            {PROBLEMS.length} problems across {CATEGORIES.length} categories, from
            vectors and gradients to backprop, attention, and Q-learning. Each one
            is a self-contained Python exercise with tests that run in your
            browser — no account needed.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-body-mid">
            <span className="font-mono">{PROBLEMS.length} total</span>
            <span className="text-mute">·</span>
            <span className="font-mono text-accent">
              {difficultyCounts.Easy} Easy
            </span>
            <span className="text-mute">·</span>
            <span className="font-mono text-warning">
              {difficultyCounts.Medium} Medium
            </span>
            <span className="text-mute">·</span>
            <span className="font-mono text-error">
              {difficultyCounts.Hard} Hard
            </span>
          </div>
        </header>
      </div>

      <PracticeBrowser />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-10 sm:px-6 sm:pb-14">
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold tracking-tight text-ink">
            Categories
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((category) => (
              <Link
                key={category.name}
                href={`/categories/${categorySlug(category.name)}`}
                className="group flex flex-col items-start gap-2 rounded-lg border border-hairline bg-canvas-card p-4 transition-colors hover:border-accent/40 hover:bg-canvas-soft"
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="text-sm font-medium text-ink group-hover:text-accent">
                    {category.name}
                  </span>
                  <span className="font-mono text-xs text-body-mid">
                    {counts[category.name] ?? 0}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-body-mid">
                  {category.blurb}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
          <h2 className="text-sm font-medium text-ink">
            Looking for something specific?
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-body-mid">
            Use the filters above to search every problem by title, id, or
            category, or open the home page and press{" "}
            <span className="font-mono text-body">⌘K</span> to jump straight to
            one.
          </p>
          <Link
            href="/"
            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/5 px-3 py-1.5 text-sm font-medium text-accent transition-colors hover:bg-accent/10"
          >
            Search on the home page
          </Link>
        </section>

        <footer className="border-t border-hairline pt-4 text-xs text-body-mid">
          <Link href="/" className="transition-colors hover:text-ink">
            DeepForge home
          </Link>
        </footer>
      </div>
    </SectionShell>
  );
}
