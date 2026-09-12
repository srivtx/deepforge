import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  PROBLEMS,
  getProblemById,
  getProblemsByCategory,
} from "@/data/problems";
import type { Problem } from "@/types/problem";
import { cn, difficultyClasses } from "@/lib/utils";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://deepforge.app"
).replace(/\/$/, "");

export const dynamicParams = false;

function categorySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function problemMetaDescription(problem: Problem): string {
  const summary = problem.description
    .split("\n")[0]
    .replace(/\s+/g, " ")
    .trim();
  const text = `${summary} Practice "${problem.title}" — a ${problem.difficulty.toLowerCase()} ${problem.category} problem with ${problem.testCases.length} test cases, runnable in Python on DeepForge.`;
  if (text.length <= 158) return text;
  return `${text.slice(0, 155).replace(/\s+\S*$/, "")}…`;
}

export function generateStaticParams(): { id: string }[] {
  return PROBLEMS.map((problem) => ({ id: problem.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const problem = getProblemById(id);
  if (!problem) return { title: "Problem not found" };

  const description = problemMetaDescription(problem);
  return {
    title: `${problem.title} — ${problem.category}`,
    description,
    alternates: {
      canonical: `/problems/${problem.id}`,
    },
    openGraph: {
      title: `${problem.title} — ${problem.category} — DeepForge`,
      description,
      url: `/problems/${problem.id}`,
      type: "article",
      siteName: "DeepForge",
    },
  };
}

export default async function ProblemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const problem = getProblemById(id);
  if (!problem) notFound();

  const slug = categorySlug(problem.category);
  const related = getProblemsByCategory(problem.category)
    .filter((candidate) => candidate.id !== problem.id)
    .slice(0, 6);
  const url = `${siteUrl}/problems/${problem.id}`;
  const description = problemMetaDescription(problem);
  const paragraphs = problem.description
    .split("\n\n")
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LearningResource",
        "@id": `${url}#resource`,
        name: problem.title,
        description,
        url,
        learningResourceType: "Coding exercise",
        educationalLevel: problem.difficulty,
        educationalUse: "practice",
        inLanguage: "en",
        isAccessibleForFree: true,
        about: problem.category,
        keywords: [
          problem.category,
          problem.difficulty,
          "Python",
          "machine learning",
          "practice",
        ].join(", "),
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
            name: problem.category,
            item: `${siteUrl}/categories/${slug}`,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: problem.title,
            item: url,
          },
        ],
      },
    ],
  };

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-xs text-body-mid"
      >
        <Link href="/" className="transition-colors hover:text-ink">
          Home
        </Link>
        <span className="text-mute">/</span>
        <Link href="/problems" className="transition-colors hover:text-ink">
          Problems
        </Link>
        <span className="text-mute">/</span>
        <Link
          href={`/categories/${slug}`}
          className="transition-colors hover:text-ink"
        >
          {problem.category}
        </Link>
        <span className="text-mute">/</span>
        <span className="text-body">{problem.title}</span>
      </nav>

      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-xs font-medium",
              difficultyClasses(problem.difficulty),
            )}
          >
            {problem.difficulty}
          </span>
          <Link
            href={`/categories/${slug}`}
            className="rounded-full border border-hairline bg-canvas-card px-2 py-0.5 text-xs text-body-mid transition-colors hover:border-accent/40 hover:text-accent"
          >
            {problem.category}
          </Link>
          <span className="font-mono text-xs text-mute">{problem.id}</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {problem.title}
        </h1>
      </header>

      <section className="flex flex-col gap-3">
        {paragraphs.map((paragraph, index) => (
          <p
            key={index}
            className="whitespace-pre-wrap text-sm leading-relaxed text-body"
          >
            {paragraph}
          </p>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <div className="overflow-hidden rounded-lg border border-hairline bg-canvas-card">
          <div className="flex items-center justify-between border-b border-hairline px-4 py-2">
            <span className="text-xs text-body-mid">Starter code</span>
            <span className="font-mono text-[10px] text-mute">Python</span>
          </div>
          <pre className="df-scroll overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-body">
            <code>{problem.starterCode}</code>
          </pre>
        </div>
        <p className="text-xs text-body-mid">
          {problem.testCases.length}{" "}
          {problem.testCases.length === 1 ? "test case" : "test cases"}
        </p>
      </section>

      {problem.hint && (
        <details className="rounded-lg border border-hairline bg-canvas-card px-4 py-3">
          <summary className="cursor-pointer text-sm text-body-mid transition-colors hover:text-ink">
            Show hint
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-body">
            {problem.hint}
          </p>
        </details>
      )}

      <div>
        <Link
          href={`/?p=${problem.id}`}
          className="inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/5 px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/10"
        >
          Solve in the editor
        </Link>
      </div>

      {related.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold tracking-tight text-ink">
            Related problems
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/problems/${item.id}`}
                className="group flex items-center justify-between gap-3 rounded-lg border border-hairline bg-canvas-card p-3 transition-colors hover:border-accent/40 hover:bg-canvas-soft"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-ink group-hover:text-accent">
                    {item.title}
                  </div>
                  <div className="font-mono text-[11px] text-mute">
                    {item.id}
                  </div>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
                    difficultyClasses(item.difficulty),
                  )}
                >
                  {item.difficulty}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <footer className="border-t border-hairline pt-4 text-xs text-body-mid">
        <Link href="/problems" className="transition-colors hover:text-ink">
          Browse all {PROBLEMS.length} problems
        </Link>
        <span className="px-2 text-mute">·</span>
        <Link href="/" className="transition-colors hover:text-ink">
          DeepForge home
        </Link>
      </footer>
    </main>
  );
}
