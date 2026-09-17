import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import {
  PROBLEMS,
  getProblemById,
} from "@/data/problems";
import { PROJECTS } from "@/data/projects";
import type { Problem } from "@/types/problem";
import { cn, clipRepr, difficultyClasses } from "@/lib/utils";
import { categorySlug } from "@/lib/sections";
import { ProblemWorkspace } from "./ProblemWorkspace";
import { SimilarProblems } from "@/components/SimilarProblems";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://deepforge.app"
).replace(/\/$/, "");

function problemMetaDescription(problem: Problem): string {
  const summary = problem.description
    .split("\n")[0]
    .replace(/\s+/g, " ")
    .trim();
  const text = `${summary} Practice "${problem.title}" — a ${problem.difficulty.toLowerCase()} ${problem.category} problem with ${problem.testCases.length} test cases, runnable in Python on DeepForge.`;
  if (text.length <= 158) return text;
  return `${text.slice(0, 155).replace(/\s+\S*$/, "")}…`;
}

export const dynamicParams = false;

export function generateStaticParams(): { id: string }[] {
  const projectStepIds = PROJECTS.flatMap((project) =>
    project.steps.map((step) => step.id),
  );
  const ids = new Set([
    ...PROBLEMS.map((problem) => problem.id),
    ...projectStepIds,
  ]);
  return [...ids].map((id) => ({ id }));
}

function findProjectStep(id: string): Problem | undefined {
  for (const project of PROJECTS) {
    const step = project.steps.find((candidate) => candidate.id === id);
    if (step) return step;
  }
  return undefined;
}

function findProblem(id: string): Problem | undefined {
  return getProblemById(id) ?? findProjectStep(id);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const problem = findProblem(id);
  if (!problem) return { title: "Problem not found" };

  const description = problemMetaDescription(problem);
  const ogImage = {
    url: `${siteUrl}/og?title=${encodeURIComponent(problem.title)}&subtitle=${encodeURIComponent(
      `${problem.category} · ${problem.difficulty}`,
    )}&kind=problem&difficulty=${problem.difficulty}`,
    width: 1200,
    height: 630,
  };
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
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      images: [ogImage],
    },
  };
}

export default async function ProblemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const problem = findProblem(id);
  if (!problem) notFound();

  const slug = categorySlug(problem.category);
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
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pt-6 pb-12 sm:px-6 sm:pt-8 sm:pb-16">
        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 flex-wrap items-center gap-1.5 text-xs text-body-mid"
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
          <Link
            href={`/categories/${slug}`}
            className="rounded-sm transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
          >
            {problem.category}
          </Link>
          <span aria-hidden className="text-mute">
            /
          </span>
          <span className="min-w-0 max-w-full truncate text-body">
            {problem.title}
          </span>
        </nav>

        <ProblemWorkspace problem={problem}>
          {/*
            Server-rendered workspace. It is the page for crawlers and no-JS
            readers and the pre-hydration paint; once React mounts, it is
            replaced in place by the interactive ProblemView (page variant).
          */}
          <article
            aria-label="Problem workspace"
            className="flex scroll-mt-16 flex-col gap-6"
          >
            <div className="flex flex-col gap-5">
              <Link
                href="/problems"
                className="inline-flex min-h-11 w-fit items-center gap-1.5 rounded-md text-sm text-body-mid transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M8.5 2.5L4 7l4.5 4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                All problems
              </Link>

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
                    className="rounded-full border border-hairline bg-canvas-card px-2 py-0.5 text-xs text-body-mid transition-colors hover:border-accent/40 hover:text-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
                  >
                    {problem.category}
                  </Link>
                  <span className="font-mono text-xs text-mute">
                    {problem.id}
                  </span>
                </div>
                <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                  {problem.title}
                </h1>
              </header>
            </div>

            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
              <section className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
                <h2 className="mb-2 text-sm font-medium text-body-mid">
                  Problem
                </h2>
                <div className="space-y-3">
                  {paragraphs.map((paragraph, index) => (
                    <p
                      key={index}
                      className="whitespace-pre-wrap break-words text-sm leading-relaxed text-body"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>

                {problem.hint && (
                  <details className="mt-5 rounded-lg border border-hairline bg-canvas-soft">
                    <summary className="cursor-pointer rounded-lg px-3 py-2 text-xs font-medium text-body-mid transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40">
                      Hint
                    </summary>
                    <p className="border-t border-hairline px-3 py-2 text-sm leading-relaxed text-body">
                      {problem.hint}
                    </p>
                  </details>
                )}

                <h2 className="mb-2 mt-5 text-sm font-medium text-body-mid">
                  Test cases
                </h2>
                <div className="space-y-2">
                  {problem.testCases.map((tc, i) => (
                    <div
                      key={i}
                      className="rounded-md border border-hairline bg-canvas-soft p-2.5"
                    >
                      <div className="mb-1 font-mono text-[10px] text-mute">
                        case {i + 1}
                      </div>
                      <div className="break-words font-mono text-xs text-body">
                        <span className="text-body-mid">in:</span>{" "}
                        {clipRepr(JSON.stringify(tc.input), 160)}
                      </div>
                      <div className="break-words font-mono text-xs text-body">
                        <span className="text-body-mid">expected:</span>{" "}
                        {clipRepr(JSON.stringify(tc.expected), 160)}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section
                aria-label="Starter code"
                className="overflow-hidden rounded-lg border border-hairline bg-canvas-card"
              >
                <div className="flex items-center justify-between border-b border-hairline px-4 py-2">
                  <span className="text-xs font-medium text-body-mid">
                    Starter code
                  </span>
                  <span className="font-mono text-[10px] text-mute">
                    Python
                  </span>
                </div>
                <pre className="df-scroll overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-body">
                  <code>{problem.starterCode}</code>
                </pre>
                <p className="border-t border-hairline px-4 py-2 text-xs text-body-mid">
                  {problem.testCases.length}{" "}
                  {problem.testCases.length === 1 ? "test case" : "test cases"}{" "}
                  · run your code against them in the editor
                </p>
              </section>
            </div>
          </article>
        </ProblemWorkspace>

        <SimilarProblems problem={problem} />

        <footer className="border-t border-hairline pt-4 text-xs text-body-mid">
          <Link
            href="/problems"
            className="rounded-sm transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
          >
            Browse all {PROBLEMS.length} problems
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
