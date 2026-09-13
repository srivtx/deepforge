import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { CATEGORIES, getProblemsByCategory } from "@/data/problems";
import type { CategoryMeta, Difficulty } from "@/types/problem";
import { cn, difficultyClasses } from "@/lib/utils";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://deepforge.app"
).replace(/\/$/, "");

const MAX_LISTED = 50;

export const dynamicParams = false;

function categorySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function categoryFromSlug(slug: string): CategoryMeta | undefined {
  return CATEGORIES.find((category) => categorySlug(category.name) === slug);
}

function categoryMetaDescription(category: CategoryMeta): string {
  const count = getProblemsByCategory(category.name).length;
  return `${category.blurb} ${count} ${category.name} practice problems with browser-based Python execution on DeepForge — free, no account needed.`;
}

export function generateStaticParams(): { slug: string }[] {
  return CATEGORIES.map((category) => ({ slug: categorySlug(category.name) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = categoryFromSlug(slug);
  if (!category) return { title: "Category not found" };

  const description = categoryMetaDescription(category);
  const count = getProblemsByCategory(category.name).length;
  const ogImage = {
    url: `${siteUrl}/og?title=${encodeURIComponent(
      category.name,
    )}&subtitle=${encodeURIComponent(`${count} problems`)}&kind=category`,
    width: 1200,
    height: 630,
  };
  return {
    title: `${category.name} problems`,
    description,
    alternates: {
      canonical: `/categories/${slug}`,
    },
    openGraph: {
      title: `${category.name} problems — DeepForge`,
      description,
      url: `/categories/${slug}`,
      type: "website",
      siteName: "DeepForge",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      images: [ogImage],
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = categoryFromSlug(slug);
  if (!category) notFound();

  const problems = getProblemsByCategory(category.name);
  const listed = problems.slice(0, MAX_LISTED);
  const difficultyCounts: Record<Difficulty, number> = {
    Easy: 0,
    Medium: 0,
    Hard: 0,
  };
  for (const problem of problems) {
    difficultyCounts[problem.difficulty] += 1;
  }

  const url = `${siteUrl}/categories/${slug}`;
  const description = categoryMetaDescription(category);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#page`,
        name: `${category.name} problems`,
        description,
        url,
        isPartOf: {
          "@type": "WebSite",
          name: "DeepForge",
          url: siteUrl,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
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
          {
            "@type": "ListItem",
            position: 3,
            name: category.name,
            item: url,
          },
        ],
      },
    ],
  };

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 text-xs text-body-mid"
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
            href="/problems"
            className="rounded-sm transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
          >
            Problems
          </Link>
          <span aria-hidden className="text-mute">
            /
          </span>
          <span className="text-body">{category.name}</span>
        </nav>

        <header className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {category.name} problems
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-body">
            {category.blurb}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-body-mid">
            <span className="font-mono">{problems.length} problems</span>
            <span aria-hidden className="text-mute">
              ·
            </span>
            <span className="font-mono text-accent">
              {difficultyCounts.Easy} Easy
            </span>
            <span aria-hidden className="text-mute">
              ·
            </span>
            <span className="font-mono text-warning">
              {difficultyCounts.Medium} Medium
            </span>
            <span aria-hidden className="text-mute">
              ·
            </span>
            <span className="font-mono text-error">
              {difficultyCounts.Hard} Hard
            </span>
          </div>
        </header>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold tracking-tight text-ink">
            {problemLabel(listed.length)}
          </h2>
          <div className="flex flex-col divide-y divide-hairline overflow-hidden rounded-lg border border-hairline bg-canvas-card">
            {listed.map((problem) => (
              <Link
                key={problem.id}
                href={`/problems/${problem.id}`}
                className="group flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-canvas-soft focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-accent/40"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-ink group-hover:text-accent">
                    {problem.title}
                  </div>
                  <div className="font-mono text-[11px] text-mute">
                    {problem.id}
                  </div>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
                    difficultyClasses(problem.difficulty),
                  )}
                >
                  {problem.difficulty}
                </span>
              </Link>
            ))}
          </div>
          <p className="text-xs text-body-mid">
            Showing {listed.length} of {problems.length} problems.
          </p>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/?category=${encodeURIComponent(category.name)}#problems`}
            className="inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/5 px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
          >
            Practice {category.name} in the editor
          </Link>
          <Link
            href="/problems"
            className="inline-flex items-center gap-2 rounded-lg border border-hairline px-4 py-2 text-sm text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
          >
            All categories
          </Link>
        </div>

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-ink">Other categories</h2>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.filter((item) => item.name !== category.name).map(
              (item) => (
                <Link
                  key={item.name}
                  href={`/categories/${categorySlug(item.name)}`}
                  className="rounded-full border border-hairline bg-canvas-card px-2.5 py-1 text-xs text-body-mid transition-colors hover:border-accent/40 hover:text-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
                >
                  {item.name}
                </Link>
              ),
            )}
          </div>
        </section>

        <footer className="border-t border-hairline pt-4 text-xs text-body-mid">
          <Link
            href="/problems"
            className="rounded-sm transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
          >
            Browse all problems
          </Link>
          <span aria-hidden className="px-2 text-mute">
            ·
          </span>
          <Link
            href="/"
            className="rounded-sm transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
          >
            DeepForge home
          </Link>
        </footer>
      </div>
    </PageShell>
  );
}

function problemLabel(count: number): string {
  return count === 1 ? "1 problem" : `${count} problems`;
}
